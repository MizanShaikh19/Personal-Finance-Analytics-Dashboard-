from sqlalchemy import Column, Integer, String, Decimal, Date, Boolean, ForeignKey, DateTime, Text
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from .database import Base

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    username = Column(String(50), unique=True, nullable=False, index=True)
    email = Column(String(100), unique=True, nullable=False, index=True)
    password_hash = Column(Text, nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    # Relationships
    categories = relationship("Category", back_populates="user")
    transactions = relationship("Transaction", back_populates="user")
    budgets = relationship("Budget", back_populates="user")

class Category(Base):
    __tablename__ = "categories"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(50), nullable=False)
    user_id = Column(Integer, ForeignKey("users.id"))
    type = Column(String(10))  # 'income' or 'expense'
    icon = Column(String(50))

    # Relationships
    user = relationship("User", back_populates="categories")
    transactions = relationship("Transaction", back_populates="category")
    budgets = relationship("Budget", back_populates="category")

class Transaction(Base):
    __tablename__ = "transactions"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False, index=True)
    category_id = Column(Integer, ForeignKey("categories.id"), nullable=False, index=True)
    amount = Column(Decimal(15, 2), nullable=False)
    description = Column(Text)
    date = Column(Date, server_default=func.current_date(), index=True)
    is_recurring = Column(Boolean, default=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    # Relationships
    user = relationship("User", back_populates="transactions")
    category = relationship("Category", back_populates="transactions")

class Budget(Base):
    __tablename__ = "budgets"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False, index=True)
    category_id = Column(Integer, ForeignKey("categories.id"), nullable=False, index=True)
    amount = Column(Decimal(15, 2), nullable=False)
    period = Column(String(10)) # 'monthly' or 'yearly'
    start_date = Column(Date, nullable=False)

    # Relationships
    user = relationship("User", back_populates="budgets")
    category = relationship("Category", back_populates="budgets")
