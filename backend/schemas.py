"""Pydantic schemas for request/response models"""
from pydantic import BaseModel, Field
from typing import Optional, List, Dict, Any
from enum import Enum

class ModelType(str, Enum):
    logistic_regression = "logistic_regression"
    random_forest = "random_forest"
    svm = "svm"
    knn = "knn"
    neural_network = "neural_network"

class HyperParameters(BaseModel):
    # Logistic Regression
    lr_C: float = Field(1.0, description="Regularization strength")
    lr_max_iter: int = Field(100, description="Max iterations")
    
    # Random Forest
    rf_n_estimators: int = Field(100, description="Number of trees")
    rf_max_depth: Optional[int] = Field(None, description="Max depth")
    
    # SVM
    svm_C: float = Field(1.0, description="Regularization")
    svm_kernel: str = Field("rbf", description="Kernel type")
    
    # KNN
    knn_n_neighbors: int = Field(5, description="Number of neighbors")
    
    # Neural Network
    nn_hidden_layers: List[int] = Field([64, 32], description="Hidden layer sizes")
    nn_learning_rate: float = Field(0.001, description="Learning rate")
    nn_epochs: int = Field(50, description="Training epochs")
    
    # General
    test_size: float = Field(0.2, description="Test split ratio")
    use_smote: bool = Field(True, description="Use SMOTE for balancing")
    random_state: int = Field(42)

class TrainRequest(BaseModel):
    model_type: ModelType
    hyperparameters: HyperParameters = HyperParameters()
    dataset_path: Optional[str] = None  # For pre-loaded dataset

class PredictRequest(BaseModel):
    model_id: str
    features: Dict[str, float]

class MetricsResponse(BaseModel):
    accuracy: float
    f1_score: float
    roc_auc: float
    precision: float
    recall: float
    confusion_matrix: List[List[int]]
    roc_curve: Dict[str, List[float]]  # fpr, tpr, thresholds
    pr_curve: Dict[str, List[float]]   # precision, recall, thresholds

class TrainResponse(BaseModel):
    model_id: str
    model_type: str
    status: str
    metrics: MetricsResponse
    training_time: float
    feature_importance: Optional[Dict[str, float]] = None
    model_download_url: str

class PredictResponse(BaseModel):
    model_id: str
    prediction: str  # "Fraud" or "Normal"
    probability: float
    confidence: str  # "High", "Medium", "Low"

class ModelInfo(BaseModel):
    model_id: str
    model_type: str
    created_at: str
    metrics: MetricsResponse
    hyperparameters: dict
