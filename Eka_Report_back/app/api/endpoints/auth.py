from datetime import timedelta

from fastapi import APIRouter, Depends, HTTPException, Response, Cookie, status
from fastapi.security import OAuth2PasswordRequestForm
from pydantic import BaseModel, EmailStr

from app.core.auth_db import get_user_by_username, get_user_by_email, create_user
from app.core.security import (
    verify_password,
    get_password_hash,
    create_access_token,
    create_refresh_token,
    verify_refresh_token,
)
from app.core.deps import get_current_user
from app.core.config import settings

router = APIRouter(prefix="/api/auth", tags=["Auth"])

# ---------------------------------------------------------------------------
# Pydantic schemas
# ---------------------------------------------------------------------------
REFRESH_COOKIE_NAME = "refresh_token"
REFRESH_COOKIE_MAX_AGE = settings.REFRESH_TOKEN_EXPIRE_DAYS * 24 * 60 * 60  # seconds


class RegisterRequest(BaseModel):
    username: str
    email: EmailStr
    full_name: str
    password: str
    role: str = "viewer"


class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: dict


# ---------------------------------------------------------------------------
# Helpers
# ---------------------------------------------------------------------------
def _set_refresh_cookie(response: Response, refresh_token: str) -> None:
    """Write the refresh token into a secure, HttpOnly cookie."""
    response.set_cookie(
        key=REFRESH_COOKIE_NAME,
        value=refresh_token,
        httponly=True,
        secure=False,        # Set True in production (HTTPS)
        samesite="lax",
        max_age=REFRESH_COOKIE_MAX_AGE,
        path="/api/auth",    # Restrict cookie scope to auth endpoints
    )


def _safe_user(user: dict) -> dict:
    """Strip sensitive fields before returning user data to client."""
    return {k: v for k, v in user.items() if k != "hashed_password"}


# ---------------------------------------------------------------------------
# Endpoints
# ---------------------------------------------------------------------------

@router.post("/register", status_code=status.HTTP_201_CREATED)
def register(payload: RegisterRequest):
    """
    Register a new user account.
    Returns the created user (without password hash).
    """
    if get_user_by_username(payload.username):
        raise HTTPException(status_code=400, detail="Username already taken")
    if get_user_by_email(payload.email):
        raise HTTPException(status_code=400, detail="Email already registered")

    hashed = get_password_hash(payload.password)
    user = create_user(
        username=payload.username,
        email=payload.email,
        full_name=payload.full_name,
        hashed_password=hashed,
        role=payload.role,
    )
    return {"message": "User registered successfully", "user": _safe_user(user)}


@router.post("/login", response_model=TokenResponse)
def login(response: Response, form_data: OAuth2PasswordRequestForm = Depends()):
    """
    Authenticate with username + password (OAuth2 form).
    Returns access_token in JSON body.
    Sets refresh_token in HttpOnly cookie.
    """
    user = get_user_by_username(form_data.username)
    if not user or not verify_password(form_data.password, user["hashed_password"]):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect username or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    if not user["is_active"]:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Account is inactive")

    access_token = create_access_token(data={"sub": user["username"]})
    refresh_token = create_refresh_token(data={"sub": user["username"]})

    _set_refresh_cookie(response, refresh_token)

    return TokenResponse(access_token=access_token, user=_safe_user(user))


@router.post("/refresh", response_model=TokenResponse)
def refresh_token(
    response: Response,
    refresh_token: str | None = Cookie(default=None, alias=REFRESH_COOKIE_NAME),
):
    """
    Issue a new access token using the HttpOnly refresh token cookie.
    Also rotates the refresh token (new cookie issued on every refresh).
    """
    if not refresh_token:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="No refresh token provided",
        )

    payload = verify_refresh_token(refresh_token)
    username: str = payload.get("sub")

    user = get_user_by_username(username)
    if not user or not user["is_active"]:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="User not found or inactive")

    new_access_token = create_access_token(data={"sub": username})
    new_refresh_token = create_refresh_token(data={"sub": username})

    _set_refresh_cookie(response, new_refresh_token)

    return TokenResponse(access_token=new_access_token, user=_safe_user(user))


@router.post("/logout", status_code=status.HTTP_200_OK)
def logout(response: Response):
    """
    Clear the refresh token cookie.
    The client is responsible for discarding its access token.
    """
    response.delete_cookie(key=REFRESH_COOKIE_NAME, path="/api/auth")
    return {"message": "Logged out successfully"}


@router.get("/me")
def get_me(current_user: dict = Depends(get_current_user)):
    """
    Return the currently authenticated user's profile.
    Requires a valid Bearer access token.
    """
    return _safe_user(current_user)
