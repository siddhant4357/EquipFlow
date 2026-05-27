from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
import uvicorn
from model import train_and_save_model, predict_failure_risk
import os

app = FastAPI(title="EquipFlow AI Service", description="Predictive Maintenance ML API")

class AssetFeatures(BaseModel):
    assetId: str
    age_days: float
    total_scans: float
    maintenance_count: float
    transit_count: float
    days_since_last_maintenance: float

@app.get("/")
def read_root():
    return {"message": "⚡ EquipFlow AI Service is running"}

@app.post("/train")
def train_model_endpoint():
    """
    Triggers the generation of the synthetic dataset and trains the ML model.
    """
    try:
        result = train_and_save_model()
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/predict")
def predict_endpoint(features: AssetFeatures):
    """
    Predicts the failure probability for a given asset based on its features.
    """
    try:
        feature_list = [
            features.age_days,
            features.total_scans,
            features.maintenance_count,
            features.transit_count,
            features.days_since_last_maintenance
        ]
        risk_probability = predict_failure_risk(feature_list)
        return {
            "assetId": features.assetId,
            "risk_probability": risk_probability
        }
    except FileNotFoundError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

if __name__ == "__main__":
    # Ensure model is trained on startup if it doesn't exist
    if not os.path.exists("model.pkl"):
        print("Model not found on startup. Training initial synthetic model...")
        train_and_save_model()
        
    uvicorn.run("main:app", host="0.0.0.0", port=8001, reload=True)
