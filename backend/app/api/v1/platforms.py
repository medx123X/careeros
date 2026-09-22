
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.db.session import get_db
from app.models import Platform, PlatformCategory
from app.schemas import PlatformCreate, PlatformResponse

router = APIRouter()


@router.get("", response_model=list[PlatformResponse])
async def get_platforms(
    category: PlatformCategory | None = None,
    db: AsyncSession = Depends(get_db),
):
    query = select(Platform).where(Platform.is_active).order_by(Platform.order)
    if category:
        query = query.where(Platform.category == category)
    result = await db.execute(query)
    return result.scalars().all()


@router.post("", response_model=PlatformResponse, status_code=status.HTTP_201_CREATED)
async def create_platform(
    platform_in: PlatformCreate,
    db: AsyncSession = Depends(get_db),
):
    platform = Platform(**platform_in.model_dump())
    db.add(platform)
    await db.commit()
    await db.refresh(platform)
    return platform


@router.get("/{platform_id}", response_model=PlatformResponse)
async def get_platform(
    platform_id: int,
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(select(Platform).where(Platform.id == platform_id))
    platform = result.scalar_one_or_none()
    if not platform:
        raise HTTPException(status_code=404, detail="Platform not found")
    return platform
