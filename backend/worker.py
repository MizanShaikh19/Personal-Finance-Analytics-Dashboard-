from .celery_app import celery_app
from reportlab.lib.pagesizes import letter
from reportlab.pdfgen import canvas
import os
from datetime import datetime

@celery_app.task(name="generate_monthly_report")
def generate_monthly_report(user_id: int, user_email: str, transactions_data: list, month: str):
    """
    Generates a PDF report for the user's monthly spending.
    """
    os.makedirs(".tmp/reports", exist_ok=True)
    filename = f"report_{user_id}_{month.replace(' ', '_')}.pdf"
    file_path = f".tmp/reports/{filename}"
    
    c = canvas.Canvas(file_path, pagesize=letter)
    width, height = letter
    
    # Title
    c.setFont("Helvetica-Bold", 16)
    c.drawString(100, height - 50, f"Monthly Financial Report - {month}")
    
    # User Info
    c.setFont("Helvetica", 12)
    c.drawString(100, height - 80, f"User: {user_email}")
    c.drawString(100, height - 100, f"Generated on: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
    
    # Transaction list (Simple table-like view)
    c.drawString(100, height - 140, "Recent Transactions:")
    y = height - 160
    c.setFont("Helvetica", 10)
    for tx in transactions_data[:20]: # Limit to first 20 for the demo
        c.drawString(100, y, f"{tx['date']} | {tx['amount']} | {tx['description'][:40]}")
        y -= 20
        if y < 50:
            c.showPage()
            y = height - 50
    
    c.save()
    return {"filename": filename, "status": "completed"}
