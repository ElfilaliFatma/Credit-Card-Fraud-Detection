"""Training endpoint"""
import os
import asyncio
from fastapi import APIRouter, UploadFile, File, Form, HTTPException, BackgroundTasks
from fastapi.responses import FileResponse
import tempfile
import json

from schemas import TrainRequest, TrainResponse
from utils.ml_utils import train_model, MODELS_DIR
from utils.store import save_result, get_result

router = APIRouter()

# Active jobs tracking
_jobs: dict = {}

@router.post("")
async def train_endpoint(request: TrainRequest, background_tasks: BackgroundTasks):
    """Train a model. Returns job_id immediately; poll /train/{job_id} for status."""
    import uuid
    job_id = str(uuid.uuid4())[:8]
    _jobs[job_id] = {"status": "running", "model_type": request.model_type}

    async def run_training():
        try:
            hyperparams = request.hyperparameters.model_dump()
            result = await asyncio.get_event_loop().run_in_executor(
                None,
                lambda: train_model(
                    request.model_type.value,
                    hyperparams,
                    request.dataset_path
                )
            )
            save_result(result["model_id"], result)
            _jobs[job_id]["status"] = "done"
            _jobs[job_id]["model_id"] = result["model_id"]
            _jobs[job_id]["result"] = result
        except Exception as e:
            _jobs[job_id]["status"] = "error"
            _jobs[job_id]["error"] = str(e)

    background_tasks.add_task(run_training)
    return {"job_id": job_id, "status": "running"}

@router.get("/job/{job_id}")
def get_job_status(job_id: str):
    """Poll training job status"""
    job = _jobs.get(job_id)
    if not job:
        raise HTTPException(status_code=404, detail="Job not found")
    return job

@router.post("/upload")
async def train_with_upload(
    file: UploadFile = File(...),
    model_type: str = Form(...),
    hyperparameters: str = Form("{}")
):
    """Train with uploaded CSV dataset"""
    import uuid
    job_id = str(uuid.uuid4())[:8]
    _jobs[job_id] = {"status": "running", "model_type": model_type}

    # Save uploaded file
    suffix = ".csv" if file.filename.endswith(".csv") else ".csv"
    tmp = tempfile.NamedTemporaryFile(delete=False, suffix=suffix)
    content = await file.read()
    tmp.write(content)
    tmp.close()
    tmp_path = tmp.name

    hyperparams = json.loads(hyperparameters)

    async def run():
        try:
            result = await asyncio.get_event_loop().run_in_executor(
                None,
                lambda: train_model(model_type, hyperparams, tmp_path)
            )
            save_result(result["model_id"], result)
            _jobs[job_id]["status"] = "done"
            _jobs[job_id]["model_id"] = result["model_id"]
            _jobs[job_id]["result"] = result
            os.unlink(tmp_path)
        except Exception as e:
            _jobs[job_id]["status"] = "error"
            _jobs[job_id]["error"] = str(e)

    import asyncio
    asyncio.create_task(run())
    return {"job_id": job_id, "status": "running"}

@router.get("/download/{model_id}")
def download_model(model_id: str):
    """Download trained model pickle"""
    for fname in os.listdir(MODELS_DIR):
        if model_id in fname:
            return FileResponse(
                os.path.join(MODELS_DIR, fname),
                media_type="application/octet-stream",
                filename=fname
            )
    raise HTTPException(status_code=404, detail="Model file not found")
