from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel, EmailStr
from app.core.deps import require_role
from app.core.security import get_password_hash
from app.core.auth_db import (
    get_all_users,
    get_user_by_id,
    get_user_by_username,
    get_user_by_email,
    create_user,
    update_user,
    delete_user,
)

router = APIRouter(prefix="/api/admin", tags=["Admin"])


def _safe_user(user: dict) -> dict:
    """Strip sensitive fields before returning user data to client."""
    return {k: v for k, v in user.items() if k != "hashed_password"}


class AdminCreateUserRequest(BaseModel):
    username: str
    email: EmailStr
    full_name: str
    password: str
    role: str = "viewer"
    is_active: int = 1


class AdminUpdateUserRequest(BaseModel):
    username: str | None = None
    email: EmailStr | None = None
    full_name: str | None = None
    password: str | None = None
    role: str | None = None
    is_active: int | None = None


@router.get("/users", response_model=list[dict])
def list_users(current_user: dict = Depends(require_role("admin"))):
    """
    List all registered users.
    Only available to admins.
    """
    users = get_all_users()
    return [_safe_user(u) for u in users]


@router.post("/users", status_code=status.HTTP_201_CREATED)
def add_user(
    payload: AdminCreateUserRequest,
    current_user: dict = Depends(require_role("admin")),
):
    """
    Create a new user manually.
    Only available to admins.
    """
    if get_user_by_username(payload.username):
        raise HTTPException(status_code=400, detail="Username already taken")
    if get_user_by_email(payload.email):
        raise HTTPException(status_code=400, detail="Email already registered")
    if payload.role not in ["admin", "viewer", "editor"]:
        raise HTTPException(
            status_code=400,
            detail="Invalid role. Must be 'admin', 'viewer', or 'editor'.",
        )

    hashed = get_password_hash(payload.password)
    user = create_user(
        username=payload.username,
        email=payload.email,
        full_name=payload.full_name,
        hashed_password=hashed,
        role=payload.role,
        is_active=payload.is_active,
    )
    return {"message": "User added successfully", "user": _safe_user(user)}


@router.put("/users/{user_id}")
def edit_user(
    user_id: int,
    payload: AdminUpdateUserRequest,
    current_user: dict = Depends(require_role("admin")),
):
    """
    Update a user's details.
    Only available to admins. Includes self-safety guards.
    """
    user = get_user_by_id(user_id)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    # Lockout checks: prevent admin from disabling themselves or downgrading their own role
    if current_user["id"] == user_id:
        if payload.is_active is not None and payload.is_active == 0:
            raise HTTPException(
                status_code=400, detail="You cannot disable your own admin account."
            )
        if payload.role is not None and payload.role != "admin":
            raise HTTPException(
                status_code=400, detail="You cannot downgrade your own admin role."
            )

    update_data = {}
    if payload.username is not None:
        payload_username = payload.username.strip()
        existing = get_user_by_username(payload_username)
        if existing and existing["id"] != user_id:
            raise HTTPException(status_code=400, detail="Username already in use")
        update_data["username"] = payload_username

    if payload.email is not None:
        payload_email = payload.email.strip()
        existing = get_user_by_email(payload_email)
        if existing and existing["id"] != user_id:
            raise HTTPException(status_code=400, detail="Email already in use")
        update_data["email"] = payload_email

    if payload.full_name is not None:
        update_data["full_name"] = payload.full_name.strip()

    if payload.password is not None and payload.password != "":
        update_data["hashed_password"] = get_password_hash(payload.password)

    if payload.role is not None:
        if payload.role not in ["admin", "viewer", "editor"]:
            raise HTTPException(
                status_code=400,
                detail="Invalid role. Must be 'admin', 'viewer', or 'editor'.",
            )
        update_data["role"] = payload.role

    if payload.is_active is not None:
        update_data["is_active"] = payload.is_active

    updated_user = update_user(user_id, **update_data)
    if not updated_user:
        raise HTTPException(status_code=500, detail="Failed to update user")

    return {"message": "User updated successfully", "user": _safe_user(updated_user)}


@router.delete("/users/{user_id}")
def remove_user(
    user_id: int, current_user: dict = Depends(require_role("admin"))
):
    """
    Delete a user.
    Only available to admins. Includes self-safety guards.
    """
    user = get_user_by_id(user_id)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    # Lockout check: prevent admin from deleting themselves
    if current_user["id"] == user_id:
        raise HTTPException(
            status_code=400, detail="You cannot delete your own admin account."
        )

    success = delete_user(user_id)
    if not success:
        raise HTTPException(status_code=500, detail="Failed to delete user")

    return {"message": "User deleted successfully"}
