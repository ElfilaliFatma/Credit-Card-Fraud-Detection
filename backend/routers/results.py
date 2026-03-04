"""Results history endpoint"""
from fastapi import APIRouter
from fastapi.responses import StreamingResponse
from utils.store import get_all_results, delete_result
import csv
import io

router = APIRouter()

@router.get("")
def get_all():
    """Return all training run results"""
    return {"results": get_all_results()}

@router.delete("/{model_id}")
def delete(model_id: str):
    ok = delete_result(model_id)
    return {"deleted": ok, "model_id": model_id}

@router.get("/export/csv")
def export_csv():
    """Export all results as CSV"""
    results = get_all_results()
    output = io.StringIO()
    writer = csv.writer(output)
    writer.writerow(["model_id", "model_type", "accuracy", "f1_score", "roc_auc", 
                     "precision", "recall", "training_time", "created_at"])
    for r in results:
        m = r.get("metrics", {})
        writer.writerow([
            r.get("model_id"), r.get("model_type"),
            m.get("accuracy"), m.get("f1_score"), m.get("roc_auc"),
            m.get("precision"), m.get("recall"),
            r.get("training_time"), r.get("created_at")
        ])
    output.seek(0)
    return StreamingResponse(
        io.BytesIO(output.getvalue().encode()),
        media_type="text/csv",
        headers={"Content-Disposition": "attachment; filename=fraud_detection_results.csv"}
    )
