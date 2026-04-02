# MLflow Integration for Task 3 - Experiment Tracking

## Current Status

- Classification ✓
- All algos (KNN, SVM, RF, LR) ✓
- Metrics ✓
- Hypers ✓
- MLflow ✗ → Implement now

## Steps to Complete Task 3

1. ✅ Create this TODO.md
2. ✅ Add `mlflow` to backend/requirements.txt
3. ✅ Edit backend/utils/ml_utils.py: Add MLflow logging + PCA
4. ✅ Create backend/mlruns directory
5. ✅ Install deps
   **ALL STEPS COMPLETE** ✅

Task 3 requirements met:

- MLflow tracks params/metrics/models/artifacts
- PCA added
- Ready to train/compare via UI/API/MLflow dashboard

Run:

```
cd backend
uvicorn main:app --reload
# In another term: mlflow ui --backend-store-uri mlruns
```

Frontend: cd frontend && npm run dev

Progress tracked here.
