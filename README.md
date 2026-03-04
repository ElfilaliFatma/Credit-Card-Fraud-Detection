<<<<<<< HEAD
# Credit-Card-Fraud-Detection


Credit Card Fraud Detection – Data Preprocessing
Dataset

Fichier: creditcard.csv

Objectif: Détecter les transactions frauduleuses (Class = 1)

Features: V1…V28 (PCA), Time, Amount, Class

Étapes de preprocessing

Chargement & exploration

Vérifier shape, null values, classes, doublons

Scaling

Amount → Amount_scaled, Time → Time_scaled

Supprimer colonnes originales

Split features/target

X = df.drop('Class'), y = df['Class']

Gestion du déséquilibre

SMOTE pour équilibrer classes

Train-Test Split

80% train / 20% test, stratify=y
=======
# 🛡️ FraudGuard ML Platform

A full-stack Fraud Detection ML Platform built with **React + FastAPI**.

## 🗂️ Project Structure

```
fraud-detection/
├── frontend/                  # React + Vite + Tailwind CSS
│   ├── src/
│   │   ├── api/client.js      # Axios API client
│   │   ├── components/
│   │   │   ├── Navbar.jsx
│   │   │   ├── TrainSection.jsx
│   │   │   ├── PredictSection.jsx
│   │   │   ├── ModelComparisonSection.jsx
│   │   │   ├── Charts.jsx        # ROC, PR, Bar charts (Recharts)
│   │   │   ├── ConfusionMatrix.jsx
│   │   │   ├── MetricsPanel.jsx
│   │   │   └── Spinner.jsx
│   │   ├── pages/
│   │   │   ├── HomePage.jsx
│   │   │   └── HistoryPage.jsx
│   │   ├── App.jsx
│   │   ├── main.jsx
│   │   └── index.css
│   ├── package.json
│   └── vite.config.js
│
└── backend/                   # Python FastAPI
    ├── main.py                # App entry point + CORS
    ├── schemas.py             # Pydantic models
    ├── requirements.txt
    ├── routers/
    │   ├── train.py           # POST /train, GET /train/job/{id}
    │   ├── predict.py         # POST /predict
    │   ├── models.py          # GET /models
    │   └── results.py         # GET /results, export CSV
    ├── utils/
    │   ├── ml_utils.py        # Training, eval, SMOTE, joblib save/load
    │   └── store.py           # In-memory results store
    └── saved_models/          # Auto-created — stores .pkl files
```

## 🚀 Quick Start

### Backend

```bash
cd backend
python -m venv venv
source venv/bin/activate       # Windows: venv\Scripts\activate
pip install -r requirements.txt
python main.py
# → Running on http://localhost:8000
# → API docs: http://localhost:8000/docs
```

### Frontend

```bash
cd frontend
npm install
npm run dev
# → Running on http://localhost:3000
```

## 🔗 API Endpoints

| Method | Path | Description |
|--------|------|-------------|
| `POST` | `/train` | Start training job (returns job_id) |
| `GET` | `/train/job/{job_id}` | Poll training status |
| `POST` | `/train/upload` | Train with uploaded CSV |
| `GET` | `/train/download/{model_id}` | Download .pkl model |
| `POST` | `/predict` | Predict single transaction |
| `GET` | `/models` | List all trained models |
| `GET` | `/models/{model_id}` | Get model details |
| `GET` | `/results` | Get all training results |
| `GET` | `/results/export/csv` | Export results as CSV |

## 🤖 Supported Models

| Model | Hyperparameters |
|-------|----------------|
| Logistic Regression | C, max_iter |
| Random Forest | n_estimators, max_depth |
| SVM | C, kernel |
| KNN | n_neighbors |
| Neural Network | hidden_layers, learning_rate, epochs |

## 📊 Features

- ✅ **Async Training** — background jobs with polling
- ✅ **SMOTE** — handles class imbalance (requires imbalanced-learn)
- ✅ **All Metrics** — Accuracy, F1, ROC AUC, Precision, Recall
- ✅ **Confusion Matrix** — visual TP/TN/FP/FN breakdown
- ✅ **ROC & PR Curves** — interactive charts
- ✅ **Model Download** — export trained .pkl files
- ✅ **CSV Export** — export all results
- ✅ **Random Transaction** — test predict with generated data
- ✅ **Dataset Upload** — use your own CSV
- ✅ **Synthetic Dataset** — auto-generated for demo

## 📁 Dataset Format

Upload a CSV with these columns:

```
Time, V1, V2, ..., V28, Amount, Class
```

Where `Class` is `0` (Normal) or `1` (Fraud).

Compatible with the [Kaggle Credit Card Fraud Dataset](https://www.kaggle.com/datasets/mlg-ulb/creditcardfraud).

## 🔧 Production Notes

- Replace in-memory `store.py` with PostgreSQL or SQLite
- Add authentication (JWT)
- Use Redis for job queue instead of BackgroundTasks
- Consider MLflow for experiment tracking
- Deploy frontend to Vercel, backend to Railway/Render
>>>>>>> 54c8425 (tache 2)
"# Fraud-Detection" 
