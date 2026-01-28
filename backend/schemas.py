from pydantic import BaseModel, EmailStr
from typing import Optional, List
from datetime import date, datetime
from decimal import Decimal

# Auth Schemas
class Token(BaseModel):
    access_token: str
    token_type: str

class TokenData(BaseModel):
    username: Optional[str] = None

# User Schemas
class UserBase(BaseModel):
    username: str
    email: EmailStr

class UserCreate(UserBase):
    password: str

class UserRead(UserBase):
    id: int
    created_at: datetime

    class Config:
        from_attributes = True

# Category Schemas
class CategoryBase(BaseModel):
    name: str
    type: str  # 'income' or 'expense'
    icon: Optional[str] = None

class CategoryCreate(CategoryBase):
    pass

class CategoryRead(CategoryBase):
    id: int
    user_id: int

    class Config:
        from_attributes = True

# Transaction Schemas
class TransactionBase(BaseModel):
    amount: Decimal
    description: Optional[str] = None
    date: date
    category_id: int
    is_recurring: bool = False

class TransactionCreate(TransactionBase):
    pass

class TransactionRead(TransactionBase):
    id: int
    user_id: int
    created_at: datetime

    class Config:
        from_attributes = True

# Budget Schemas
class BudgetBase(BaseModel):
    category_id: int
    amount: Decimal
    period: str
    start_date: date

class BudgetCreate(BudgetBase):
    pass

class BudgetRead(BudgetBase):
    id: int
    user_id: int

    class Config:
        from_attributes = True
