import base64

import pytest
from httpx import ASGITransport, AsyncClient
from sqlalchemy.ext.asyncio import async_sessionmaker, create_async_engine

from app.api.v1.auth import create_access_token
from app.db.session import Base, get_db
from app.main import app
from app.models import Document, User


@pytest.mark.asyncio
async def test_pdf_preview_returns_data_and_requires_owner(tmp_path):
    engine = create_async_engine(f'sqlite+aiosqlite:///{(tmp_path / "test.db").as_posix()}')
    pdf_path = tmp_path / 'cv.pdf'
    pdf_path.write_bytes(b'%PDF-1.4\n%%EOF\n')
    try:
        async with engine.begin() as connection:
            await connection.run_sync(Base.metadata.create_all)
        sessions = async_sessionmaker(engine, expire_on_commit=False)
        async with sessions() as session:
            user = User(email='owner@example.com', hashed_password='unused')
            other = User(email='other@example.com', hashed_password='unused')
            session.add_all([user, other])
            await session.flush()
            session.add(Document(
                user_id=user.id, name='cv.pdf', file_type='pdf', file_size=pdf_path.stat().st_size,
                file_path=str(pdf_path), is_cv=True,
            ))
            await session.commit()

        async def test_db():
            async with sessions() as session:
                yield session

        app.dependency_overrides[get_db] = test_db
        async with AsyncClient(transport=ASGITransport(app=app), base_url='http://test') as client:
            owner_token = create_access_token({'sub': 'owner@example.com'})
            preview = await client.get(
                '/api/v1/documents/1/preview', headers={'Authorization': f'Bearer {owner_token}'}
            )
            assert preview.status_code == 200
            assert preview.headers['content-type'] == 'application/json'
            assert base64.b64decode(preview.json()['data']) == pdf_path.read_bytes()

            drag_data = await client.get(
                '/api/v1/documents/1/drag-data', headers={'Authorization': f'Bearer {owner_token}'}
            )
            assert drag_data.status_code == 200
            assert base64.b64decode(drag_data.json()['data']) == pdf_path.read_bytes()

            other_token = create_access_token({'sub': 'other@example.com'})
            forbidden = await client.get(
                '/api/v1/documents/1/preview', headers={'Authorization': f'Bearer {other_token}'}
            )
            assert forbidden.status_code == 404
            forbidden_drag = await client.get(
                '/api/v1/documents/1/drag-data', headers={'Authorization': f'Bearer {other_token}'}
            )
            assert forbidden_drag.status_code == 404

            download = await client.get(
                '/api/v1/documents/1/download', headers={'Authorization': f'Bearer {owner_token}'}
            )
            assert download.headers['content-disposition'].startswith('attachment;')
    finally:
        app.dependency_overrides.clear()
        await engine.dispose()
