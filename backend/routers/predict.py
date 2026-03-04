"""Predict endpoint"""
from fastapi import APIRouter, HTTPException
from schemas import PredictRequest, PredictResponse
from utils.ml_utils import predict_transaction
from utils.store import get_result

router = APIRouter()

@router.post("")
def predict_endpoint(request: PredictRequest):
    """Predict fraud for a single transaction"""
    result = get_result(request.model_id)
    if not result:
        raise HTTPException(status_code=404, detail=f"Model {request.model_id} not found")
    
    pred = predict_transaction(
        request.model_id,
        result["model_type"],
        request.features
    )
    return {"model_id": request.model_id, **pred}
