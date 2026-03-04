"""
ML Training utilities for Fraud Detection
Handles data loading, preprocessing, model training, and evaluation
"""
import numpy as np
import pandas as pd
from sklearn.linear_model import LogisticRegression
from sklearn.ensemble import RandomForestClassifier
from sklearn.svm import SVC
from sklearn.neighbors import KNeighborsClassifier
from sklearn.neural_network import MLPClassifier
from sklearn.preprocessing import StandardScaler
from sklearn.model_selection import train_test_split
from sklearn.metrics import (
    accuracy_score, f1_score, roc_auc_score, precision_score,
    recall_score, confusion_matrix, roc_curve, precision_recall_curve
)
from sklearn.pipeline import Pipeline
import joblib
import os
import time
import uuid
from datetime import datetime
from typing import Optional
import logging

logger = logging.getLogger(__name__)

# Default dataset path - use the provided creditcard.csv dataset
DEFAULT_DATASET_PATH = os.path.join(os.path.dirname(os.path.dirname(__file__)), "dataset", "creditcard.csv")

# Try importing SMOTE; graceful fallback if imbalanced-learn not installed
try:
    from imblearn.over_sampling import SMOTE
    from imblearn.pipeline import Pipeline as ImbPipeline
    SMOTE_AVAILABLE = True
except ImportError:
    SMOTE_AVAILABLE = False
    logger.warning("imbalanced-learn not installed. SMOTE disabled.")

MODELS_DIR = os.path.join(os.path.dirname(__file__), "saved_models")
os.makedirs(MODELS_DIR, exist_ok=True)

def generate_synthetic_dataset(n_samples: int = 10000) -> pd.DataFrame:
    """Generate synthetic credit card fraud dataset matching kaggle format"""
    np.random.seed(42)
    n_fraud = int(n_samples * 0.0017)  # ~0.17% fraud rate
    n_normal = n_samples - n_fraud

    # Normal transactions
    normal = pd.DataFrame({
        'Time': np.random.uniform(0, 172792, n_normal),
        'Amount': np.random.exponential(88, n_normal),
        **{f'V{i}': np.random.normal(0, 1, n_normal) for i in range(1, 29)},
        'Class': 0
    })

    # Fraud transactions (shifted distributions to be detectable)
    fraud = pd.DataFrame({
        'Time': np.random.uniform(0, 172792, n_fraud),
        'Amount': np.random.exponential(122, n_fraud),
        **{f'V{i}': np.random.normal(0.5, 1.5, n_fraud) if i in [4, 11, 14, 17] 
           else np.random.normal(-0.5, 1.5, n_fraud) for i in range(1, 29)},
        'Class': 1
    })

    df = pd.concat([normal, fraud], ignore_index=True).sample(frac=1, random_state=42)
    return df

def get_model(model_type: str, hyperparams: dict):
    """Instantiate ML model from type and hyperparameters"""
    if model_type == "logistic_regression":
        return LogisticRegression(
            C=hyperparams.get("lr_C", 1.0),
            max_iter=hyperparams.get("lr_max_iter", 100),
            random_state=hyperparams.get("random_state", 42),
            class_weight='balanced'
        )
    elif model_type == "random_forest":
        return RandomForestClassifier(
            n_estimators=hyperparams.get("rf_n_estimators", 100),
            max_depth=hyperparams.get("rf_max_depth", None),
            random_state=hyperparams.get("random_state", 42),
            class_weight='balanced',
            n_jobs=-1
        )
    elif model_type == "svm":
        return SVC(
            C=hyperparams.get("svm_C", 1.0),
            kernel=hyperparams.get("svm_kernel", "rbf"),
            probability=True,
            random_state=hyperparams.get("random_state", 42),
            class_weight='balanced'
        )
    elif model_type == "knn":
        return KNeighborsClassifier(
            n_neighbors=hyperparams.get("knn_n_neighbors", 5),
            n_jobs=-1
        )
    elif model_type == "neural_network":
        hidden = tuple(hyperparams.get("nn_hidden_layers", [64, 32]))
        return MLPClassifier(
            hidden_layer_sizes=hidden,
            learning_rate_init=hyperparams.get("nn_learning_rate", 0.001),
            max_iter=hyperparams.get("nn_epochs", 50),
            random_state=hyperparams.get("random_state", 42),
            early_stopping=True,
            validation_fraction=0.1
        )
    else:
        raise ValueError(f"Unknown model type: {model_type}")

def safe_float(value):
    """Convert value to float, handling inf/nan for JSON serialization"""
    if np.isinf(value) or np.isnan(value):
        return None
    return round(float(value), 4)

def compute_metrics(y_true, y_pred, y_proba):
    """Compute all evaluation metrics"""
    cm = confusion_matrix(y_true, y_pred).tolist()

    # ROC curve (downsample for JSON)
    fpr, tpr, roc_thresh = roc_curve(y_true, y_proba)
    step = max(1, len(fpr) // 100)
    roc_data = {
        "fpr": [safe_float(x) for x in fpr[::step]],
        "tpr": [safe_float(x) for x in tpr[::step]],
        "thresholds": [safe_float(x) for x in roc_thresh[::step]]
    }

    # PR curve
    prec, rec, pr_thresh = precision_recall_curve(y_true, y_proba)
    step = max(1, len(prec) // 100)
    pr_data = {
        "precision": [safe_float(x) for x in prec[::step]],
        "recall": [safe_float(x) for x in rec[::step]],
        "thresholds": [safe_float(x) for x in (pr_thresh[::step] if len(pr_thresh) > step else pr_thresh)]
    }

    return {
        "accuracy": safe_float(accuracy_score(y_true, y_pred)),
        "f1_score": safe_float(f1_score(y_true, y_pred)),
        "roc_auc": safe_float(roc_auc_score(y_true, y_proba)),
        "precision": safe_float(precision_score(y_true, y_pred, zero_division=0)),
        "recall": safe_float(recall_score(y_true, y_pred)),
        "confusion_matrix": cm,
        "roc_curve": roc_data,
        "pr_curve": pr_data
    }

def train_model(model_type: str, hyperparams: dict, dataset_path: Optional[str] = None):
    """Full training pipeline: load data → preprocess → train → evaluate → save"""
    start_time = time.time()

    # Determine which dataset to use
    # Priority: 1) provided dataset_path, 2) default creditcard.csv, 3) generate synthetic
    if dataset_path and os.path.exists(dataset_path):
        logger.info(f"Loading dataset from {dataset_path}")
        df = pd.read_csv(dataset_path)
    elif os.path.exists(DEFAULT_DATASET_PATH):
        logger.info(f"Loading default dataset from {DEFAULT_DATASET_PATH}")
        df = pd.read_csv(DEFAULT_DATASET_PATH)
    else:
        logger.info("Generating synthetic dataset")
        df = generate_synthetic_dataset()

    # Prepare features and labels
    feature_cols = [c for c in df.columns if c not in ['Class', 'id']]
    X = df[feature_cols].values
    y = df['Class'].values if 'Class' in df.columns else df.iloc[:, -1].values

    # Train/test split
    test_size = hyperparams.get("test_size", 0.2)
    X_train, X_test, y_train, y_test = train_test_split(
        X, y, test_size=test_size, stratify=y,
        random_state=hyperparams.get("random_state", 42)
    )

    # Scale features
    scaler = StandardScaler()
    X_train_scaled = scaler.fit_transform(X_train)
    X_test_scaled = scaler.transform(X_test)

    # Apply SMOTE if requested and available
    use_smote = hyperparams.get("use_smote", True) and SMOTE_AVAILABLE
    if use_smote:
        logger.info("Applying SMOTE oversampling")
        smote = SMOTE(random_state=hyperparams.get("random_state", 42))
        X_train_scaled, y_train = smote.fit_resample(X_train_scaled, y_train)

    # Train model
    model = get_model(model_type, hyperparams)
    logger.info(f"Training {model_type}...")
    model.fit(X_train_scaled, y_train)

    # Evaluate
    y_pred = model.predict(X_test_scaled)
    y_proba = model.predict_proba(X_test_scaled)[:, 1]
    metrics = compute_metrics(y_test, y_pred, y_proba)

    # Feature importance
    feature_importance = None
    if hasattr(model, 'feature_importances_'):
        fi = dict(zip(feature_cols, model.feature_importances_.tolist()))
        # Top 10 features
        feature_importance = dict(sorted(fi.items(), key=lambda x: x[1], reverse=True)[:10])
    elif hasattr(model, 'coef_'):
        fi = dict(zip(feature_cols, np.abs(model.coef_[0]).tolist()))
        feature_importance = dict(sorted(fi.items(), key=lambda x: x[1], reverse=True)[:10])

    # Save model + scaler
    model_id = str(uuid.uuid4())[:8]
    bundle = {"model": model, "scaler": scaler, "feature_cols": feature_cols}
    model_path = os.path.join(MODELS_DIR, f"{model_type}_{model_id}.pkl")
    joblib.dump(bundle, model_path)
    logger.info(f"Model saved: {model_path}")

    training_time = round(time.time() - start_time, 2)

    return {
        "model_id": model_id,
        "model_type": model_type,
        "model_path": model_path,
        "metrics": metrics,
        "training_time": training_time,
        "feature_importance": feature_importance,
        "hyperparameters": hyperparams,
        "created_at": datetime.now().isoformat()
    }

def load_model(model_id: str, model_type: str):
    """Load a saved model bundle"""
    # Search for matching file
    for fname in os.listdir(MODELS_DIR):
        if model_id in fname:
            path = os.path.join(MODELS_DIR, fname)
            return joblib.load(path)
    raise FileNotFoundError(f"Model {model_id} not found")

def predict_transaction(model_id: str, model_type: str, features: dict):
    """Run inference on a single transaction"""
    bundle = load_model(model_id, model_type)
    model = bundle["model"]
    scaler = bundle["scaler"]
    feature_cols = bundle["feature_cols"]

    # Build feature vector
    x = np.array([[features.get(col, 0.0) for col in feature_cols]])
    x_scaled = scaler.transform(x)

    pred = model.predict(x_scaled)[0]
    proba = model.predict_proba(x_scaled)[0][1]

    if proba >= 0.7:
        confidence = "High"
    elif proba >= 0.4:
        confidence = "Medium"
    else:
        confidence = "Low"

    return {
        "prediction": "Fraud" if pred == 1 else "Normal",
        "probability": round(float(proba), 4),
        "confidence": confidence
    }
