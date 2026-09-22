
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.v1.auth import get_current_user
from app.db.session import get_db
from app.models import Education, User
from app.schemas import EducationCreate, EducationResponse, EducationUpdate

router = APIRouter()


@router.get("", response_model=list[EducationResponse])
async def get_education(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(
        select(Education).where(Education.user_id == current_user.id).order_by(Education.order)
    )
    return result.scalars().all()


@router.post("", response_model=EducationResponse, status_code=status.HTTP_201_CREATED)
async def create_education(
    education_in: EducationCreate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    education = Education(user_id=current_user.id, **education_in.model_dump())
    db.add(education)
    await db.commit()
    await db.refresh(education)
    return education


@router.get("/{education_id}", response_model=EducationResponse)
async def get_education_item(
    education_id: int,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(
        select(Education).where(Education.id == education_id, Education.user_id == current_user.id)
    )
    education = result.scalar_one_or_none()
    if not education:
        raise HTTPException(status_code=404, detail="Education not found")
    return education


@router.put("/{education_id}", response_model=EducationResponse)
async def update_education(
    education_id: int,
    education_in: EducationUpdate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(
        select(Education).where(Education.id == education_id, Education.user_id == current_user.id)
    )
    education = result.scalar_one_or_none()
    if not education:
        raise HTTPException(status_code=404, detail="Education not found")

    update_data = education_in.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(education, field, value)

    await db.commit()
    await db.refresh(education)
    return education


@router.delete("/{education_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_education(
    education_id: int,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(
        select(Education).where(Education.id == education_id, Education.user_id == current_user.id)
    )
    education = result.scalar_one_or_none()
    if not education:
        raise HTTPException(status_code=404, detail="Education not found")

    await db.delete(education)
    await db.commit()
