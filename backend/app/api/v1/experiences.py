
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.v1.auth import get_current_user
from app.db.session import get_db
from app.models import Experience, User
from app.schemas import ExperienceCreate, ExperienceResponse, ExperienceUpdate

router = APIRouter()


@router.get("", response_model=list[ExperienceResponse])
async def get_experiences(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(
        select(Experience).where(Experience.user_id == current_user.id).order_by(Experience.order)
    )
    return result.scalars().all()


@router.post("", response_model=ExperienceResponse, status_code=status.HTTP_201_CREATED)
async def create_experience(
    experience_in: ExperienceCreate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    experience = Experience(user_id=current_user.id, **experience_in.model_dump())
    db.add(experience)
    await db.commit()
    await db.refresh(experience)
    return experience


@router.get("/{experience_id}", response_model=ExperienceResponse)
async def get_experience(
    experience_id: int,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(
        select(Experience).where(Experience.id == experience_id, Experience.user_id == current_user.id)
    )
    experience = result.scalar_one_or_none()
    if not experience:
        raise HTTPException(status_code=404, detail="Experience not found")
    return experience


@router.put("/{experience_id}", response_model=ExperienceResponse)
async def update_experience(
    experience_id: int,
    experience_in: ExperienceUpdate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(
        select(Experience).where(Experience.id == experience_id, Experience.user_id == current_user.id)
    )
    experience = result.scalar_one_or_none()
    if not experience:
        raise HTTPException(status_code=404, detail="Experience not found")

    update_data = experience_in.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(experience, field, value)

    await db.commit()
    await db.refresh(experience)
    return experience


@router.delete("/{experience_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_experience(
    experience_id: int,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(
        select(Experience).where(Experience.id == experience_id, Experience.user_id == current_user.id)
    )
    experience = result.scalar_one_or_none()
    if not experience:
        raise HTTPException(status_code=404, detail="Experience not found")

    await db.delete(experience)
    await db.commit()
