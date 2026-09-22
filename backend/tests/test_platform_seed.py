import pytest
from sqlalchemy import select
from sqlalchemy.ext.asyncio import async_sessionmaker, create_async_engine

from app.db.seed import DEFAULT_PLATFORMS, seed_default_platforms
from app.db.session import Base
from app.models import Platform, PlatformCategory


@pytest.mark.asyncio
async def test_seeds_empty_directory_once(tmp_path):
    engine = create_async_engine(f'sqlite+aiosqlite:///{(tmp_path / "platforms.db").as_posix()}')
    try:
        async with engine.begin() as connection:
            await connection.run_sync(Base.metadata.create_all)
        sessions = async_sessionmaker(engine, expire_on_commit=False)
        async with sessions() as session:
            assert await seed_default_platforms(session) == len(DEFAULT_PLATFORMS)
            assert await seed_default_platforms(session) == 0
            platforms = (await session.execute(select(Platform))).scalars().all()
            assert len(platforms) == len(DEFAULT_PLATFORMS)
            assert sum(p.category == PlatformCategory.JOB for p in platforms) == 4
            assert sum(p.category == PlatformCategory.FREELANCE for p in platforms) == 4
            assert all(p.profile_url and p.profile_url.startswith('https://') for p in platforms)
    finally:
        await engine.dispose()


@pytest.mark.asyncio
async def test_leaves_custom_directory_unchanged(tmp_path):
    engine = create_async_engine(f'sqlite+aiosqlite:///{(tmp_path / "custom.db").as_posix()}')
    try:
        async with engine.begin() as connection:
            await connection.run_sync(Base.metadata.create_all)
        sessions = async_sessionmaker(engine, expire_on_commit=False)
        async with sessions() as session:
            session.add(Platform(name='Custom', category=PlatformCategory.JOB, profile_url='https://example.com'))
            await session.commit()
            assert await seed_default_platforms(session) == 0
            platforms = (await session.execute(select(Platform))).scalars().all()
            assert [p.name for p in platforms] == ['Custom']
    finally:
        await engine.dispose()
