from fastapi import APIRouter

from app.api.v1 import (
    auth,
    certifications,
    documents,
    education,
    experiences,
    platforms,
    posts,
    profiles,
    projects,
    users,
)

api_router = APIRouter()

api_router.include_router(auth.router, prefix="/auth", tags=["auth"])
api_router.include_router(users.router, prefix="/users", tags=["users"])
api_router.include_router(profiles.router, prefix="/profiles", tags=["profiles"])
api_router.include_router(experiences.router, prefix="/experiences", tags=["experiences"])
api_router.include_router(education.router, prefix="/education", tags=["education"])
api_router.include_router(projects.router, prefix="/projects", tags=["projects"])
api_router.include_router(certifications.router, prefix="/certifications", tags=["certifications"])
api_router.include_router(documents.router, prefix="/documents", tags=["documents"])
api_router.include_router(posts.router, prefix="/posts", tags=["posts"])
api_router.include_router(platforms.router, prefix="/platforms", tags=["platforms"])
