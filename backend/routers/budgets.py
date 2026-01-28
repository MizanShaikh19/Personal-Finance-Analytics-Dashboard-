from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import func
from typing import List
from datetime import date
from .. import models, schemas, auth, database

router = APIRouter()

@router.post("/", response_model=schemas.BudgetRead)
async def create_budget(
    budget: schemas.BudgetCreate,
    db: Session = Depends(database.get_db),
    current_user: models.User = Depends(auth.get_current_user)
):
    # Verify category belongs to user
    category = db.query(models.Category).filter(
        models.Category.id == budget.category_id,
        models.Category.user_id == current_user.id
    ).first()
    if not category:
        raise HTTPException(status_code=400, detail="Invalid category ID")

    # Check if budget already exists for this category/start_date
    db_budget = db.query(models.Budget).filter(
        models.Budget.category_id == budget.category_id,
        models.Budget.user_id == current_user.id,
        models.Budget.start_date == budget.start_date
    ).first()
    if db_budget:
        raise HTTPException(status_code=400, detail="Budget for this period already exists")

    new_budget = models.Budget(**budget.dict(), user_id=current_user.id)
    db.add(new_budget)
    db.commit()
    db.refresh(new_budget)
    return new_budget

@router.get("/", response_model=List[schemas.BudgetRead])
async def get_budgets(
    db: Session = Depends(database.get_db),
    current_user: models.User = Depends(auth.get_current_user)
):
    return db.query(models.Budget).filter(models.Budget.user_id == current_user.id).all()

@router.get("/performance")
async def get_budget_performance(
    month_start: date,
    db: Session = Depends(database.get_db),
    current_user: models.User = Depends(auth.get_current_user)
):
    """
    Compares total spent vs budget limit for each category.
    """
    # SQL logic from db_schema.md: Spending Aggregation by Category
    # We'll use a complex join/aggregation here
    
    # Subquery for transactions in this month
    transactions_sub = db.query(
        models.Transaction.category_id,
        func.sum(models.Transaction.amount).label("total_spent")
    ).filter(
        models.Transaction.user_id == current_user.id,
        models.Transaction.date >= month_start
    ).group_by(models.Transaction.category_id).subquery()

    results = db.query(
        models.Category.name,
        models.Budget.amount.label("budget_limit"),
        func.coalesce(transactions_sub.c.total_spent, 0).label("spent")
    ).join(
        models.Budget, models.Budget.category_id == models.Category.id
    ).outerjoin(
        transactions_sub, transactions_sub.c.category_id == models.Category.id
    ).filter(
        models.Budget.user_id == current_user.id,
        models.Budget.start_date == month_start
    ).all()

    return [
        {
            "category": r.name,
            "budget": float(r.budget_limit),
            "spent": float(r.spent),
            "remaining": float(r.budget_limit - r.spent),
            "percent": float((r.spent / r.budget_limit) * 100) if r.budget_limit > 0 else 0
        } for r in results
    ]
