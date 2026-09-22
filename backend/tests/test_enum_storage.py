import pytest
from httpx import ASGITransport, AsyncClient
from sqlalchemy.ext.asyncio import async_sessionmaker, create_async_engine

from app.api.v1.auth import create_access_token
from app.db.session import Base, get_db
from app.main import app
from app.models import User


@pytest.mark.asyncio
async def test_profile_create_can_be_read_back(tmp_path):
    engine = create_async_engine(f'sqlite+aiosqlite:///{(tmp_path / "test.db").as_posix()}')
    async with engine.begin() as connection:
        await connection.run_sync(Base.metadata.create_all)
    sessions = async_sessionmaker(engine, expire_on_commit=False)
    async with sessions() as session:
        session.add(User(email='profile-test@example.com', hashed_password='unused'))
        await session.commit()

    async def test_db():
        async with sessions() as session:
            yield session

    app.dependency_overrides[get_db] = test_db
    try:
        headers = {
            'Authorization': f'Bearer {create_access_token({"sub": "profile-test@example.com"})}'
        }
        async with AsyncClient(transport=ASGITransport(app=app), base_url='http://test') as client:
            created = await client.post(
                '/api/v1/profiles', json={'type': 'master'}, headers=headers
            )
            assert created.status_code == 201, created.text
            assert created.json()['type'] == 'master'

            listed = await client.get('/api/v1/profiles', headers=headers)
            assert listed.status_code == 200, listed.text
            assert len(listed.json()) == 1
            assert listed.json()[0]['full_name'] is None

            updated = await client.put(
                '/api/v1/profiles/master', json={'job_title': 'Developer'}, headers=headers
            )
            assert updated.status_code == 200, updated.text
            assert updated.json()['job_title'] == 'Developer'

            updated_again = await client.put(
                '/api/v1/profiles/master', json={'full_name': 'Test User'}, headers=headers
            )
            assert updated_again.status_code == 200, updated_again.text
            assert updated_again.json()['full_name'] == 'Test User'
            assert updated_again.json()['job_title'] == 'Developer'
    finally:
        app.dependency_overrides.clear()
        await engine.dispose()


@pytest.mark.asyncio
async def test_platform_category_can_be_read_back(tmp_path):
    engine = create_async_engine(f'sqlite+aiosqlite:///{(tmp_path / "test.db").as_posix()}')
    async with engine.begin() as connection:
        await connection.run_sync(Base.metadata.create_all)
    sessions = async_sessionmaker(engine, expire_on_commit=False)

    async def test_db():
        async with sessions() as session:
            yield session

    app.dependency_overrides[get_db] = test_db
    try:
        async with AsyncClient(transport=ASGITransport(app=app), base_url='http://test') as client:
            created = await client.post('/api/v1/platforms', json={'name': 'Example', 'category': 'job'})
            assert created.status_code == 201, created.text
            assert created.json()['category'] == 'job'

            listed = await client.get('/api/v1/platforms?category=job')
            assert listed.status_code == 200, listed.text
            assert [platform['name'] for platform in listed.json()] == ['Example']
    finally:
        app.dependency_overrides.clear()
        await engine.dispose()
