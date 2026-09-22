from datetime import datetime
from enum import Enum

from pydantic import BaseModel, ConfigDict, EmailStr, Field


class ProfileType(str, Enum):
    MASTER = "master"
    JOB = "job"
    FREELANCE = "freelance"


class PlatformCategory(str, Enum):
    JOB = "job"
    FREELANCE = "freelance"


class Token(BaseModel):
    access_token: str
    token_type: str = "bearer"


class TokenData(BaseModel):
    email: str | None = None


class UserBase(BaseModel):
    email: EmailStr


class UserCreate(UserBase):
    password: str = Field(..., min_length=8)


class UserLogin(BaseModel):
    email: EmailStr
    password: str


class UserUpdate(BaseModel):
    email: EmailStr | None = None
    is_active: bool | None = None


class UserResponse(UserBase):
    model_config = ConfigDict(from_attributes=True)

    id: int
    is_active: bool
    created_at: datetime


class ProfileBase(BaseModel):
    type: ProfileType = ProfileType.MASTER
    full_name: str | None = None
    email: EmailStr | None = None
    phone: str | None = None
    location: str | None = None
    website: str | None = None
    linkedin: str | None = None
    github: str | None = None
    job_title: str | None = None
    bio: str | None = None
    skills: str | None = None


class ProfileCreate(ProfileBase):
    pass


class ProfileUpdate(BaseModel):
    type: ProfileType | None = None
    full_name: str | None = None
    email: EmailStr | None = None
    phone: str | None = None
    location: str | None = None
    website: str | None = None
    linkedin: str | None = None
    github: str | None = None
    job_title: str | None = None
    bio: str | None = None
    skills: str | None = None


class ProfileResponse(ProfileBase):
    model_config = ConfigDict(from_attributes=True)

    id: int
    user_id: int
    created_at: datetime
    updated_at: datetime


class ExperienceBase(BaseModel):
    company: str = Field(..., max_length=255)
    position: str = Field(..., max_length=255)
    description: str | None = None
    start_date: datetime
    end_date: datetime | None = None
    is_current: bool = False
    order: int = 0


class ExperienceCreate(ExperienceBase):
    pass


class ExperienceUpdate(BaseModel):
    company: str | None = Field(None, max_length=255)
    position: str | None = Field(None, max_length=255)
    description: str | None = None
    start_date: datetime | None = None
    end_date: datetime | None = None
    is_current: bool | None = None
    order: int | None = None


class ExperienceResponse(ExperienceBase):
    model_config = ConfigDict(from_attributes=True)

    id: int
    user_id: int
    created_at: datetime
    updated_at: datetime


class EducationBase(BaseModel):
    institution: str = Field(..., max_length=255)
    degree: str = Field(..., max_length=255)
    field_of_study: str | None = None
    start_date: datetime
    end_date: datetime | None = None
    description: str | None = None
    order: int = 0


class EducationCreate(EducationBase):
    pass


class EducationUpdate(BaseModel):
    institution: str | None = Field(None, max_length=255)
    degree: str | None = Field(None, max_length=255)
    field_of_study: str | None = None
    start_date: datetime | None = None
    end_date: datetime | None = None
    description: str | None = None
    order: int | None = None


class EducationResponse(EducationBase):
    model_config = ConfigDict(from_attributes=True)

    id: int
    user_id: int
    created_at: datetime
    updated_at: datetime


class ProjectBase(BaseModel):
    name: str = Field(..., max_length=255)
    description: str | None = None
    technologies: str | None = None
    link: str | None = None
    order: int = 0


class ProjectCreate(ProjectBase):
    pass


class ProjectUpdate(BaseModel):
    name: str | None = Field(None, max_length=255)
    description: str | None = None
    technologies: str | None = None
    link: str | None = None
    order: int | None = None


class ProjectResponse(ProjectBase):
    model_config = ConfigDict(from_attributes=True)

    id: int
    user_id: int
    created_at: datetime
    updated_at: datetime


class CertificationBase(BaseModel):
    name: str = Field(..., max_length=255)
    organization: str = Field(..., max_length=255)
    date: datetime
    credential_url: str | None = None
    order: int = 0


class CertificationCreate(CertificationBase):
    pass


class CertificationUpdate(BaseModel):
    name: str | None = Field(None, max_length=255)
    organization: str | None = Field(None, max_length=255)
    date: datetime | None = None
    credential_url: str | None = None
    order: int | None = None


class CertificationResponse(CertificationBase):
    model_config = ConfigDict(from_attributes=True)

    id: int
    user_id: int
    created_at: datetime
    updated_at: datetime


class DocumentBase(BaseModel):
    name: str
    file_type: str
    file_size: int
    file_path: str
    is_cv: bool = False


class DocumentCreate(DocumentBase):
    pass


class DocumentResponse(DocumentBase):
    model_config = ConfigDict(from_attributes=True)

    id: int
    user_id: int
    created_at: datetime
    updated_at: datetime


class PostBase(BaseModel):
    title: str = Field(..., max_length=255)
    content: str
    hashtags: str | None = None
    links: str | None = None
    attachments: str | None = None


class PostCreate(PostBase):
    pass


class PostUpdate(BaseModel):
    title: str | None = Field(None, max_length=255)
    content: str | None = None
    hashtags: str | None = None
    links: str | None = None
    attachments: str | None = None


class PostResponse(PostBase):
    model_config = ConfigDict(from_attributes=True)

    id: int
    user_id: int
    created_at: datetime
    updated_at: datetime


class PostVersionBase(BaseModel):
    platform: str
    content: str
    hashtags: str | None = None
    links: str | None = None


class PostVersionCreate(PostVersionBase):
    pass


class PostVersionResponse(PostVersionBase):
    model_config = ConfigDict(from_attributes=True)

    id: int
    post_id: int
    created_at: datetime
    updated_at: datetime


class PlatformBase(BaseModel):
    name: str = Field(..., max_length=100)
    category: PlatformCategory
    profile_url: str | None = None
    logo: str | None = None
    is_active: bool = True
    order: int = 0


class PlatformCreate(PlatformBase):
    pass


class PlatformResponse(PlatformBase):
    model_config = ConfigDict(from_attributes=True)

    id: int
    created_at: datetime
    updated_at: datetime
