
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.v1.auth import get_current_user
from app.db.session import get_db
from app.models import Certification, User
from app.schemas import CertificationCreate, CertificationResponse, CertificationUpdate

router = APIRouter()


@router.get("", response_model=list[CertificationResponse])
async def get_certifications(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(
        select(Certification).where(Certification.user_id == current_user.id).order_by(Certification.order)
    )
    return result.scalars().all()


@router.post("", response_model=CertificationResponse, status_code=status.HTTP_201_CREATED)
async def create_certification(
    certification_in: CertificationCreate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    certification = Certification(user_id=current_user.id, **certification_in.model_dump())
    db.add(certification)
    await db.commit()
    await db.refresh(certification)
    return certification


@router.get("/{certification_id}", response_model=CertificationResponse)
async def get_certification(
    certification_id: int,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(
        select(Certification).where(Certification.id == certification_id, Certification.user_id == current_user.id)
    )
    certification = result.scalar_one_or_none()
    if not certification:
        raise HTTPException(status_code=404, detail="Certification not found")
    return certification


@router.put("/{certification_id}", response_model=CertificationResponse)
async def update_certification(
    certification_id: int,
    certification_in: CertificationUpdate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(
        select(Certification).where(Certification.id == certification_id, Certification.user_id == current_user.id)
    )
    certification = result.scalar_one_or_none()
    if not certification:
        raise HTTPException(status_code=404, detail="Certification not found")

    update_data = certification_in.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(certification, field, value)

    await db.commit()
    await db.refresh(certification)
    return certification


@router.delete("/{certification_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_certification(
    certification_id: int,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(
        select(Certification).where(Certification.id == certification_id, Certification.user_id == current_user.id)
    )
    certification = result.scalar_one_or_none()
    if not certification:
        raise HTTPException(status_code=404, detail="Certification not found")

    await db.delete(certification)
    await db.commit()
