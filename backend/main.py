"""
Fraud Detection ML Platform - FastAPI Backend
"""
from fastapi import FastAPI, UploadFile, File, HTTPException, BackgroundTasks
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse
import uvicorn
import logging

from routers import train, predict, models, results

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = FastAPI(
    title="Fraud Detection ML API",
    description="Credit Card Fraud Detection Platform",
    version="1.0.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(train.router, prefix="/train", tags=["Training"])
app.include_router(predict.router, prefix="/predict", tags=["Prediction"])
app.include_router(models.router, prefix="/models", tags=["Models"])
app.include_router(results.router, prefix="/results", tags=["Results"])

@app.get("/")
def root():
    return {"message": "Fraud Detection ML API", "status": "running"}

@app.get("/health")
def health():
    return {"status": "healthy"}

if __name__ == "__main__":
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
