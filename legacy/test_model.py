import os
import pickle
import numpy as np
import pandas as pd
from sklearn.ensemble import RandomForestClassifier

def test_model_loading():
    """Verify that the model file exists and can be deserialized."""
    model_path = 'heart_model.pkl'
    assert os.path.exists(model_path), f"Model file '{model_path}' not found!"
    
    with open(model_path, 'rb') as f:
        model = pickle.load(f)
    
    assert model is not None, "Model failed to load."
    assert hasattr(model, "predict"), "Loaded model object has no 'predict' method."
    print("✓ Model loaded successfully.")
    return model

def test_model_dimensions(model):
    """Verify that the model accepts exactly 13 input features."""
    assert hasattr(model, "n_features_in_"), "Model does not specify expected input features."
    expected_features = 13
    assert model.n_features_in_ == expected_features, (
        f"Expected model to have {expected_features} features, but got {model.n_features_in_}"
    )
    print(f"✓ Model dimensions verified (features: {model.n_features_in_}).")

def test_model_predictions(model):
    """Test model prediction capabilities with sample low-risk and high-risk patients."""
    # Columns matching train_model.py features:
    # ['age', 'sex', 'cp', 'trestbps', 'chol', 'fbs', 'restecg', 'thalach', 'exang', 'oldpeak', 'slope', 'ca', 'thal']
    
    # 1. Low risk sample data
    low_risk_sample = [[30, 1, 2, 120, 180, 0, 1, 170, 0, 0.0, 1, 0, 2]]
    low_risk_pred = model.predict(low_risk_sample)
    assert low_risk_pred[0] in [0, 1], "Prediction result must be binary (0 or 1)."
    
    # 2. High risk sample data
    high_risk_sample = [[70, 0, 0, 150, 300, 0, 0, 100, 1, 3.0, 2, 2, 3]]
    high_risk_pred = model.predict(high_risk_sample)
    assert high_risk_pred[0] in [0, 1], "Prediction result must be binary (0 or 1)."
    
    print("✓ Sample predictions successful.")

def test_model_performance(model):
    """Verify that the model's accuracy on the baseline dummy validation set is high."""
    data = {
        'age': [50, 60, 45, 70, 30],
        'sex': [1, 0, 1, 0, 1],
        'cp': [2, 3, 1, 0, 2],
        'trestbps': [120, 140, 110, 150, 120],
        'chol': [200, 250, 190, 300, 180],
        'fbs': [0, 1, 0, 0, 0],
        'restecg': [1, 0, 1, 0, 1],
        'thalach': [150, 120, 160, 100, 170],
        'exang': [0, 1, 0, 1, 0],
        'oldpeak': [1.0, 2.0, 0.5, 3.0, 0.0],
        'slope': [1, 2, 1, 2, 1],
        'ca': [0, 1, 0, 2, 0],
        'thal': [2, 3, 2, 3, 2],
        'target': [0, 1, 0, 1, 0]
    }
    df = pd.DataFrame(data)
    X = df.drop('target', axis=1)
    y = df['target']
    
    # Calculate score
    score = model.score(X, y)
    print(f"Model Baseline Accuracy Score: {score * 100:.2f}%")
    assert score >= 0.80, f"Model accuracy degraded below 80% (Current: {score * 100:.2f}%)"
    print("✓ Model performance accuracy validated.")

if __name__ == "__main__":
    print("=== STARTING MACHINE LEARNING MODEL AUTOMATED TESTS ===")
    loaded_model = test_model_loading()
    test_model_dimensions(loaded_model)
    test_model_predictions(loaded_model)
    test_model_performance(loaded_model)
    print("=== ALL ML MODEL TESTS PASSED SUCCESSFULLY ===")
