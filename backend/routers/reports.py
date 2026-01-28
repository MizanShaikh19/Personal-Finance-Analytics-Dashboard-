from fastapi import APIRouter, Depends, HTTPException
from fastapi.responses import FileResponse
from sqlalchemy.orm import Session
from .. import models, auth, database, worker
from celery.result import AsyncResult
import os

router = APIRouter()

@router.post("/generate")
async def trigger_report(
    month: str,  # format e.g., "January 2024"
    db: Session = Depends(database.get_db),
    current_user: models.User = Depends(auth.get_current_user)
):
    """
    Triggers the background PDF generation task.
    """
    # Simply fetch all transactions for this demo, filtering can be added
    transactions = db.query(models.Transaction).filter(
        models.Transaction.user_id == current_user.id
    ).all()
    
    tx_data = [
        {"date": str(t.date), "amount": float(t.amount), "description": t.description}
        for t in transactions
    ]
    
    # Trigger Celery task
    task = worker.generate_monthly_report.delay(
        current_user.id, 
        current_user.email, 
        tx_data, 
        month
    )
    
    return {"task_id": task.id, "status": "processing"}

@router.get("/status/{task_id}")
async def get_report_status(task_id: str):
    """
    Checks the status of a PDF generation task.
    """
    task_result = AsyncResult(task_id)
    return {
        "task_id": task_id,
        "task_status": task_result.status,
        "result": task_result.result if task_result.ready() else None
    }

@router.get("/download/{filename}")
async def download_report(filename: str):
    """
    Downloads a generated PDF report.
    """
    file_path = f".tmp/reports/{filename}"
    if os.path.exists(file_path):
        return FileResponse(
            path=file_path, 
            filename=filename, 
            media_type='application/pdf'
        )
    raise HTTPException(status_code=404, detail="Report not found")
