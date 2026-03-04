"""Models listing endpoint"""
from fastapi import APIRouter
from utils.store import get_all_results

router = APIRouter()

@router.get("")
def list_models():
    """Return all available trained models"""
    results = get_all_results()
    models = []
    for r in results:
        models.append({
            "model_id": r["model_id"],
            "model_type": r["model_type"],
            "created_at": r["created_at"],
            "metrics": r["metrics"],
            "training_time": r["training_time"]
        })
    return {"models": models, "count": len(models)}

@router.get("/{model_id}")
def get_model_details(model_id: str):
    """Get details for a specific model"""
    from utils.store import get_result
    result = get_result(model_id)
    if not result:
        from fastapi import HTTPException
        raise HTTPException(status_code=404, detail="Model not found")
    return result
