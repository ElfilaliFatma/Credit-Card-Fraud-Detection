import mlflow
print("MLflow tracking URI:", mlflow.get_tracking_uri())
print("MLflow version:", mlflow.__version__)
mlflow.set_experiment("Fraud_Detection")
print("Experiment set. Ready for runs.")
