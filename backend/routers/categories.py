from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from .. import models, schemas, auth, database

router = APIRouter()

@router.post("/", response_model=schemas.CategoryRead)
async def create_category(
    category: schemas.CategoryCreate,
    db: Session = Depends(database.get_db),
    current_user: models.User = Depends(auth.get_current_user)
):
    # Check if category already exists for this user
    db_category = db.query(models.Category).filter(
        models.Category.name == category.name,
        models.Category.user_id == current_user.id
    ).first()
    if db_category:
        raise HTTPException(status_code=400, detail="Category already exists")
    
    new_category = models.Category(**category.dict(), user_id=current_user.id)
    db.add(new_category)
    db.commit()
    db.refresh(new_category)
    return new_category

@router.get("/", response_model=List[schemas.CategoryRead])
async def get_categories(
    db: Session = Depends(database.get_db),
    current_user: models.User = Depends(auth.get_current_user)
):
    return db.query(models.Category).filter(models.Category.user_id == current_user.id).all()

@router.delete("/{category_id}")
async def delete_category(
    category_id: int,
    db: Session = Depends(database.get_db),
    current_user: models.User = Depends(auth.get_current_user)
):
    db_category = db.query(models.Category).filter(
        models.Category.id == category_id,
        models.Category.user_id == current_user.id
    ).first()
    if not db_category:
        raise HTTPException(status_code=404, detail="Category not found")
    
    db.delete(db_category)
    db.commit()
    return {"message": "Category deleted"}
