from fastapi import FastAPI, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordRequestForm
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from datetime import timedelta
from . import models, schemas, auth, database
from .database import engine, get_db

# Create tables in the database
models.Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="Personal Finance Analytics Dashboard API",
    description="Backend API for tracking expenses and financial analysis",
    version="1.0.0"
)

# CORS Middleware setup
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], # In production, replace with specific origins
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.post("/auth/register", response_model=schemas.UserRead, tags=["Authentication"])
async def register(user: schemas.UserCreate, db: Session = Depends(get_db)):
    # Check if user already exists
    db_user = db.query(models.User).filter(models.User.email == user.email).first()
    if db_user:
        raise HTTPException(status_code=400, detail="Email already registered")
    
    db_username = db.query(models.User).filter(models.User.username == user.username).first()
    if db_username:
        raise HTTPException(status_code=400, detail="Username already taken")
    
    # Hash password and create user
    hashed_password = auth.get_password_hash(user.password)
    new_user = models.User(
        username=user.username,
        email=user.email,
        password_hash=hashed_password
    )
    db.add(new_user)
    db.commit()
    db.refresh(new_user)
    return new_user

@app.post("/auth/login", response_model=schemas.Token, tags=["Authentication"])
async def login(form_data: OAuth2PasswordRequestForm = Depends(), db: Session = Depends(get_db)):
    user = db.query(models.User).filter(models.User.username == form_data.username).first()
    if not user or not auth.verify_password(form_data.password, user.password_hash):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect username or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    # Create JWT token
    access_token_expires = timedelta(minutes=auth.ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = auth.create_access_token(
        data={"sub": user.username}, expires_delta=access_token_expires
    )
    return {"access_token": access_token, "token_type": "bearer"}

@app.get("/users/me", response_model=schemas.UserRead, tags=["User"])
async def read_users_me(current_user: models.User = Depends(auth.get_current_user)):
    return current_user

from .routers import categories, transactions, budgets, analytics, reports

# Include routers
app.include_router(categories.router, prefix="/categories", tags=["Categories"])
app.include_router(transactions.router, prefix="/transactions", tags=["Transactions"])
app.include_router(budgets.router, prefix="/budgets", tags=["Budgets"])
app.include_router(analytics.router, prefix="/analytics", tags=["Analytics"])
app.include_router(reports.router, prefix="/reports", tags=["Reports"])

@app.get("/", tags=["Root"])
async def root():
    return {
        "message": "Welcome to Personal Finance Analytics API",
        "docs": "/docs",
        "status": "active"
    }
