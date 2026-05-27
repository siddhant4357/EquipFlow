import os
import pandas as pd
import numpy as np
from sklearn.ensemble import RandomForestClassifier
import joblib

MODEL_PATH = "model.pkl"

def generate_synthetic_data(num_samples=1000):
    """
    Generates a synthetic dataset of assets to train the initial predictive maintenance model.
    """
    np.random.seed(42)
    
    # Generate random features
    age_days = np.random.uniform(10, 1000, num_samples)
    total_scans = np.random.uniform(5, 500, num_samples)
    maintenance_count = np.random.poisson(2, num_samples)
    transit_count = np.random.uniform(0, 300, num_samples)
    days_since_last_maintenance = np.random.uniform(0, age_days, num_samples)
    
    # Calculate a hidden "risk score" based on logical rules
    # Higher age, high transit, and high days without maintenance increase risk
    # High maintenance count historically might mean it's a problematic machine
    risk_score = (
        (age_days / 1000) * 0.2 +
        (transit_count / 300) * 0.3 +
        (days_since_last_maintenance / 500) * 0.4 +
        (maintenance_count / 10) * 0.1
    )
    
    # Add some random noise
    risk_score += np.random.normal(0, 0.1, num_samples)
    
    # Threshold to determine failure (1 = failure, 0 = healthy)
    # We aim for ~15-20% failure rate in the synthetic data
    will_fail = (risk_score > 0.6).astype(int)
    
    df = pd.DataFrame({
        'age_days': age_days,
        'total_scans': total_scans,
        'maintenance_count': maintenance_count,
        'transit_count': transit_count,
        'days_since_last_maintenance': days_since_last_maintenance,
        'will_fail': will_fail
    })
    
    return df

def train_and_save_model():
    """
    Trains the Random Forest model on the synthetic dataset and saves it to a .pkl file.
    """
    print("Generating synthetic dataset...")
    df = generate_synthetic_data()
    
    X = df[['age_days', 'total_scans', 'maintenance_count', 'transit_count', 'days_since_last_maintenance']]
    y = df['will_fail']
    
    print("Training RandomForestClassifier...")
    model = RandomForestClassifier(n_estimators=100, random_state=42)
    model.fit(X, y)
    
    accuracy = model.score(X, y)
    print(f"Training completed. Accuracy on synthetic data: {accuracy:.2f}")
    
    joblib.dump(model, MODEL_PATH)
    print(f"Model saved to {MODEL_PATH}")
    return {"status": "success", "accuracy": accuracy, "samples": len(df)}

def get_model():
    """
    Loads the trained model.
    """
    if not os.path.exists(MODEL_PATH):
        raise FileNotFoundError(f"Model file {MODEL_PATH} not found. Call /train first.")
    return joblib.load(MODEL_PATH)

def predict_failure_risk(features):
    """
    Predicts the probability of failure (0.0 to 1.0) given the asset features.
    features is a list or DataFrame row: [age_days, total_scans, maintenance_count, transit_count, days_since_last_maintenance]
    """
    model = get_model()
    # predict_proba returns [[prob_0, prob_1]]
    probabilities = model.predict_proba([features])[0]
    return float(probabilities[1]) # Return probability of class 1 (failure)
