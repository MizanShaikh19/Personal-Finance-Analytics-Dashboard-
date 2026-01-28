from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
import pandas as pd
import numpy as np
from datetime import date, datetime
from .. import models, auth, database

router = APIRouter()

@router.get("/trends")
async def get_monthly_trends(
    db: Session = Depends(database.get_db),
    current_user: models.User = Depends(auth.get_current_user)
):
    """
    Returns monthly spending trends using Pandas resampling.
    """
    transactions = db.query(models.Transaction).filter(
        models.Transaction.user_id == current_user.id
    ).all()
    
    if not transactions:
        return []

    # Prepare data for Pandas
    data = [
        {"date": t.date, "amount": float(t.amount)}
        for t in transactions
    ]
    df = pd.DataFrame(data)
    df['date'] = pd.to_datetime(df['date'])
    
    # Group by month and sum amounts
    # Resampling is efficient for time-series as noted in SKILL.md
    df.set_index('date', inplace=True)
    monthly_df = df.resample('ME')['amount'].sum().reset_index()
    monthly_df['date'] = monthly_df['date'].dt.strftime('%b %Y')
    
    return monthly_df.to_dict(orient='records')

@router.get("/forecast")
async def get_spending_forecast(
    db: Session = Depends(database.get_db),
    current_user: models.User = Depends(auth.get_current_user)
):
    """
    Predicts next month's spending using simple linear regression.
    """
    transactions = db.query(models.Transaction).filter(
        models.Transaction.user_id == current_user.id
    ).all()
    
    if len(transactions) < 10:  # Arbitrary threshold for "enough" data
        return {
            "prediction": None,
            "message": "Not enough data points for accurate prediction. Please upload more statements."
        }

    df = pd.DataFrame([{"date": t.date, "amount": float(t.amount)} for t in transactions])
    df['date'] = pd.to_datetime(df['date'])
    monthly = df.resample('ME', on='date')['amount'].sum().reset_index()
    
    if len(monthly) < 2:
        return {"prediction": None, "message": "Need at least 2 months of data to forecast."}

    # x = month index, y = spending
    x = np.arange(len(monthly)).reshape(-1, 1)
    y = monthly['amount'].values
    
    # Linear Regression using numpy.polyfit
    m, b = np.polyfit(x.flatten(), y, 1)
    
    next_month_val = m * len(monthly) + b
    
    return {
        "predicted_amount": float(max(0, next_month_val)),
        "trend": "increasing" if m > 0 else "decreasing",
        "monthly_growth_rate": float(m)
    }
