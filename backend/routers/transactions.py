import subprocess
import json
import shutil
import os
from fastapi import APIRouter, Depends, HTTPException, Query, UploadFile, File
from sqlalchemy.orm import Session
from sqlalchemy import func
from typing import List, Optional
from datetime import date
from .. import models, schemas, auth, database

router = APIRouter()

def auto_categorize(description: str, categories: List[models.Category]) -> Optional[int]:
    """
    Very basic keyword matching for categorization.
    """
    desc_lower = description.lower()
    for cat in categories:
        # Check if category name is in description
        if cat.name.lower() in desc_lower:
            return cat.id
    return None

@router.post("/upload")
async def upload_statement(
    file: UploadFile = File(...),
    db: Session = Depends(database.get_db),
    current_user: models.User = Depends(auth.get_current_user)
):
    """
    Uploads a bank statement, parses it using the execution layer script,
    and bulk inserts transactions with auto-categorization.
    """
    if not file.filename.endswith('.csv'):
        raise HTTPException(status_code=400, detail="Only CSV files are supported")

    # 1. Save file to .tmp
    os.makedirs(".tmp", exist_ok=True)
    tmp_path = f".tmp/{current_user.id}_{file.filename}"
    with open(tmp_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)
    
    # 2. Call execution script (Layer 3)
    try:
        # We use the absolute or relative path to the script
        result = subprocess.run(
            ["python", "execution/parse_statement.py", "--input", tmp_path],
            capture_output=True, text=True, check=True
        )
        parsed_data = json.loads(result.stdout)
        
        if "error" in parsed_data:
            raise HTTPException(status_code=400, detail=parsed_data["error"])
            
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Parsing failed: {str(e)}")
    finally:
        if os.path.exists(tmp_path):
            os.remove(tmp_path)

    # 3. Get user categories for auto-matching
    user_categories = db.query(models.Category).filter(models.Category.user_id == current_user.id).all()
    
    # If no categories, create a 'Uncategorized' one
    uncategorized = db.query(models.Category).filter(
        models.Category.name == "Uncategorized",
        models.Category.user_id == current_user.id
    ).first()
    if not uncategorized:
        uncategorized = models.Category(name="Uncategorized", user_id=current_user.id, type="expense")
        db.add(uncategorized)
        db.commit()
        db.refresh(uncategorized)

    # 4. Process and insert transactions
    new_transactions = []
    for item in parsed_data:
        cat_id = auto_categorize(item['description'], user_categories) or uncategorized.id
        
        tx = models.Transaction(
            user_id=current_user.id,
            category_id=cat_id,
            amount=item['amount'],
            description=item['description'],
            date=item['date']
        )
        new_transactions.append(tx)
    
    db.bulk_save_objects(new_transactions)
    db.commit()

    return {
        "message": f"Successfully processed {len(new_transactions)} transactions",
        "count": len(new_transactions)
    }

@router.post("/", response_model=schemas.TransactionRead)
async def create_transaction(
    transaction: schemas.TransactionCreate,
    db: Session = Depends(database.get_db),
    current_user: models.User = Depends(auth.get_current_user)
):
    # Verify category belongs to user
    category = db.query(models.Category).filter(
        models.Category.id == transaction.category_id,
        models.Category.user_id == current_user.id
    ).first()
    if not category:
        raise HTTPException(status_code=400, detail="Invalid category ID")

    new_transaction = models.Transaction(**transaction.dict(), user_id=current_user.id)
    db.add(new_transaction)
    db.commit()
    db.refresh(new_transaction)
    return new_transaction

@router.get("/", response_model=List[schemas.TransactionRead])
async def get_transactions(
    start_date: Optional[date] = None,
    end_date: Optional[date] = None,
    category_id: Optional[int] = None,
    db: Session = Depends(database.get_db),
    current_user: models.User = Depends(auth.get_current_user)
):
    query = db.query(models.Transaction).filter(models.Transaction.user_id == current_user.id)
    
    if start_date:
        query = query.filter(models.Transaction.date >= start_date)
    if end_date:
        query = query.filter(models.Transaction.date <= end_date)
    if category_id:
        query = query.filter(models.Transaction.category_id == category_id)
    
    return query.order_by(models.Transaction.date.desc()).all()

@router.get("/summary")
async def get_transaction_summary(
    start_date: date,
    end_date: date,
    db: Session = Depends(database.get_db),
    current_user: models.User = Depends(auth.get_current_user)
):
    """
    Returns spending aggregation by category for a given date range.
    """
    summary = db.query(
        models.Category.name,
        func.sum(models.Transaction.amount).label("total_spent")
    ).join(
        models.Transaction, models.Transaction.category_id == models.Category.id
    ).filter(
        models.Transaction.user_id == current_user.id,
        models.Transaction.date >= start_date,
        models.Transaction.date <= end_date
    ).group_by(
        models.Category.name
    ).all()
    
    return [
        {"category": name, "total_spent": float(amount)} for name, amount in summary
    ]

@router.delete("/{transaction_id}")
async def delete_transaction(
    transaction_id: int,
    db: Session = Depends(database.get_db),
    current_user: models.User = Depends(auth.get_current_user)
):
    db_transaction = db.query(models.Transaction).filter(
        models.Transaction.id == transaction_id,
        models.Transaction.user_id == current_user.id
    ).first()
    if not db_transaction:
        raise HTTPException(status_code=404, detail="Transaction not found")
    
    db.delete(db_transaction)
    db.commit()
    return {"message": "Transaction deleted"}
