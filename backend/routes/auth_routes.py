from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.orm import Session

from database.db import get_db
from database.schemas import TokenResponse, UserCreate, UserResponse
from services.idea_service import IdeaService
from utils.security import create_access_token, get_current_user, verify_password


router = APIRouter(tags=["Authentication"])


@router.post("/register", response_model=UserResponse, status_code=status.HTTP_201_CREATED)
def register_user(payload: UserCreate, db: Session = Depends(get_db)) -> UserResponse:
    """Create an application user with a hashed password."""
    service = IdeaService(db)
    user = service.create_user(payload)
    return UserResponse.model_validate(user)


@router.post("/login", response_model=TokenResponse)
def login_user(form_data: OAuth2PasswordRequestForm = Depends(), db: Session = Depends(get_db)) -> TokenResponse:
    """Issue a JWT for a valid username/email and password combination."""
    service = IdeaService(db)
    user = service.authenticate_user(form_data.username)
    if not user or not verify_password(form_data.password, user.hashed_password):
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid credentials")

    token = create_access_token({"sub": str(user.id), "email": user.email})
    return TokenResponse(access_token=token, token_type="bearer")


@router.get("/user/me", response_model=UserResponse)
def get_authenticated_user(current_user=Depends(get_current_user)) -> UserResponse:
    """Return the authenticated user's profile so the frontend can hydrate session state."""
    return UserResponse.model_validate(current_user)
