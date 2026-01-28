# Personal Finance Analytics Dashboard

A sophisticated full-stack web application designed for tracking expenses, visualizing spending patterns, and generating AI-powered financial insights. Built with a robust 3-layer architecture for maximum reliability and scalability.

---

## 🚀 Key Features

- **Automated CSV Parsing**: Intelligent bank statement ingestion and field mapping.
- **Smart Categorization**: Keyword-based automatic expense classification.
- **Predictive Analytics**: Future spending forecasts using simple linear regression.
- **Interactive Dashboards**: Premium, minimalist visualizations powered by Chart.js.
- **Budget Tracking**: Visual progress indicators with overspending alerts.
- **PDF Report Generation**: Background task processing for detailed financial heath reports.

## 🛠️ Tech Stack

### Backend
- **Framework**: FastAPI (Python)
- **ORM**: SQLAlchemy
- **Data Analysis**: Pandas & NumPy
- **Task Queue**: Celery with Redis
- **Security**: JWT Authentication

### Frontend
- **Library**: React.js (Vite)
- **Styling**: Tailwind CSS
- **Icons**: Lucide React
- **Visuals**: Chart.js & Framer Motion

### Database
- **Engine**: PostgreSQL
- **Features**: Window functions, SQL aggregations, and optimized indexing.

## 🏗️ 3-Layer Architecture

This project strictly adheres to a modular design philosophy:
1. **Directives**: Natural language SOPs for core task orchestration.
2. **Orchestration**: Intelligent routing and logic management (the Glue).
3. **Execution**: Deterministic Python scripts for data heavy-lifting.

## 🏁 Quick Start

### 1. Backend Setup
```bash
cd backend
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
pip install -r requirements.txt
uvicorn main:app --reload
```

### 2. Frontend Setup
```bash
cd frontend
npm install
npm run dev
```

### 3. Worker Setup (Optional)
```bash
celery -A worker.celery_app worker --loglevel=info
```

---

**Project Completion Date**: 28-Jan-2026
**Status**: Documentation Updated & Core Features Implemented
