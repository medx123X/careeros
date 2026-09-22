from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models import Platform, PlatformCategory

# Official destination pages verified in September 2026. `profile_url` is the
# existing directory link field; these are platform pages, not user profiles.
DEFAULT_PLATFORMS = (
    ('LinkedIn Jobs', PlatformCategory.JOB, 'https://www.linkedin.com/jobs/'),
    ('WUZZUF', PlatformCategory.JOB, 'https://wuzzuf.net/search/jobs'),
    ('Bayt Egypt', PlatformCategory.JOB, 'https://www.bayt.com/en/egypt/jobs/'),
    ('Indeed Egypt', PlatformCategory.JOB, 'https://eg.indeed.com/'),
    ('Upwork', PlatformCategory.FREELANCE, 'https://www.upwork.com/freelance-jobs/'),
    ('Fiverr', PlatformCategory.FREELANCE, 'https://www.fiverr.com/'),
    ('Mostaql', PlatformCategory.FREELANCE, 'https://mostaql.com/freelance'),
    ('Khamsat', PlatformCategory.FREELANCE, 'https://khamsat.com/freelance'),
)


async def seed_default_platforms(db: AsyncSession) -> int:
    """Populate an empty directory once without changing a customized one."""
    existing = await db.scalar(select(Platform.id).limit(1))
    if existing is not None:
        return 0

    db.add_all(
        Platform(name=name, category=category, profile_url=url, order=index % 4)
        for index, (name, category, url) in enumerate(DEFAULT_PLATFORMS)
    )
    await db.commit()
    return len(DEFAULT_PLATFORMS)
