from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel, EmailStr

from app.core.auth_db import (
    get_user_by_username,
    get_user_by_email,
    get_user_by_id,
    create_user,
    get_all_users,
    delete_user,
    update_user_profile,
    update_user_password,
)
from app.core.security import get_password_hash
from app.core.deps import require_role

router = APIRouter(prefix="/api/users", tags=["Users"])


class UserCreate(BaseModel):
    username: str
    email: EmailStr
    full_name: str
    password: str
    role: str = "viewer"
    is_active: bool = True


class UserUpdate(BaseModel):
    email: EmailStr
    full_name: str
    role: str
    is_active: bool


class UserPasswordUpdate(BaseModel):
    password: str


def _safe_user(user: dict) -> dict:
    """Strip sensitive fields before returning user data to client."""
    return {k: v for k, v in user.items() if k != "hashed_password"}


@router.get("", response_model=list[dict])
def list_users(current_user: dict = Depends(require_role("admin"))):
    """List all users (Admin only)."""
    users = get_all_users()
    return [_safe_user(u) for u in users]


@router.post("", status_code=status.HTTP_201_CREATED)
def add_user(payload: UserCreate, current_user: dict = Depends(require_role("admin"))):
    """Add/Register a new user (Admin only)."""
    if get_user_by_username(payload.username):
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Username already taken")
    if get_user_by_email(payload.email):
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Email already registered")

    if payload.role not in ["admin", "editor", "viewer"]:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Role must be admin, editor, or viewer")

    hashed = get_password_hash(payload.password)
    user = create_user(
        username=payload.username,
        email=payload.email,
        full_name=payload.full_name,
        hashed_password=hashed,
        role=payload.role,
        is_active=1 if payload.is_active else 0,
    )
    return {"message": "User registered successfully", "user": _safe_user(user)}


@router.put("/{user_id}")
def update_user(
    user_id: int,
    payload: UserUpdate,
    current_user: dict = Depends(require_role("admin")),
):
    """Update a user's details (Admin only)."""
    user = get_user_by_id(user_id)
    if not user:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found")

    # Safeguards to prevent self-lockout
    if current_user["id"] == user_id:
        if not payload.is_active:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="You cannot deactivate your own admin account",
            )
        if payload.role != "admin":
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="You cannot change your own admin role",
            )

    if payload.role not in ["admin", "editor", "viewer"]:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Role must be admin, editor, or viewer")

    success = update_user_profile(
        user_id=user_id,
        email=payload.email,
        full_name=payload.full_name,
        role=payload.role,
        is_active=1 if payload.is_active else 0,
    )
    if not success:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Failed to update. Email might already be taken.",
        )

    updated_user = get_user_by_id(user_id)
    return {"message": "User updated successfully", "user": _safe_user(updated_user)}


@router.put("/{user_id}/password")
def change_password(
    user_id: int,
    payload: UserPasswordUpdate,
    current_user: dict = Depends(require_role("admin")),
):
    """Reset/Change a user's password (Admin only)."""
    user = get_user_by_id(user_id)
    if not user:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found")

    hashed = get_password_hash(payload.password)
    success = update_user_password(user_id=user_id, hashed_password=hashed)
    if not success:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Failed to update password")

    return {"message": "User password updated successfully"}


@router.delete("/{user_id}")
def remove_user(user_id: int, current_user: dict = Depends(require_role("admin"))):
    """Delete a user (Admin only)."""
    user = get_user_by_id(user_id)
    if not user:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found")

    # Safeguards to prevent self-deletion
    if current_user["id"] == user_id:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="You cannot delete your own admin account",
        )

    success = delete_user(user_id)
    if not success:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Failed to delete user")

    return {"message": "User deleted successfully"}
