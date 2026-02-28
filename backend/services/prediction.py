import joblib
import pandas as pd
import os

# Define paths to model files
BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
MODELS_DIR = os.path.join(BASE_DIR, "models")
MODEL_PATH = os.path.join(MODELS_DIR, "crop_model.pkl")
ENCODERS_PATH = os.path.join(MODELS_DIR, "encoders.pkl")
CROP_ENCODER_PATH = os.path.join(MODELS_DIR, "crop_encoder.pkl")

# Load models and encoders
try:
    model = joblib.load(MODEL_PATH)
    encoders = joblib.load(ENCODERS_PATH)
    crop_encoder = joblib.load(CROP_ENCODER_PATH)
except FileNotFoundError as e:
    raise FileNotFoundError(f"Model files not found. Please run train_model.py first. Error: {e}")

# Define expected feature order (matching training data)
FEATURE_ORDER = [
    "Soil_Type",
    "Farm_Area_acres",
    "Water_Availability_L_per_week",
    "Irrigation_Type",
    "Fertilizer_Used_kg",
    "Season",
    "Rainfall_mm",
    "Temperature_C",
    "Soil_pH"
]

def predict_crop(input_data: dict) -> str:
    """
    Predicts the best crop type based on environmental input data.
    """
    # 1. Convert input_data into pandas DataFrame and ensure column order
    df = pd.DataFrame([input_data])
    
    # Clean input data (strip strings)
    for col in df.columns:
        if df[col].dtype == "object":
            df[col] = df[col].str.strip()

    # Ensure all required features are present and in the correct order
    df = df[FEATURE_ORDER]

    # 2. Apply saved label encoders on categorical columns
    categorical_cols = ["Soil_Type", "Irrigation_Type", "Season"]
    
    for col in categorical_cols:
        if col in df.columns:
            le = encoders[col]
            df[col] = le.transform(df[col])

    # 3. Predict crop using trained RandomForest model
    prediction_idx = model.predict(df)[0]

    # 4. Decode prediction using crop_encoder
    predicted_crop = crop_encoder.inverse_transform([prediction_idx])[0]

    # 5. Return predicted crop name
    return str(predicted_crop)

if __name__ == "__main__":
    # Sample Test Case (Updated to match new schema)
    test_input = {
        "Soil_Type": "Loamy",
        "Farm_Area_acres": 7.66,
        "Water_Availability_L_per_week": 1364,
        "Irrigation_Type": "Sprinkler",
        "Fertilizer_Used_kg": 174.0,
        "Season": "Summer",
        "Rainfall_mm": 1110.0,
        "Temperature_C": 23.0,
        "Soil_pH": 7.9
    }
    try:
        result = predict_crop(test_input)
        print(f"Test Prediction for {test_input}: {result}")
    except Exception as e:
        print(f"Error during prediction: {e}")
