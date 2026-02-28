import os
import joblib
import pandas as pd

# ─── Paths ─────────────────────────────────────────────────────────────────────
BASE_DIR       = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
MODEL_PATH     = os.path.join(BASE_DIR, "models", "yield_model.pkl")
ENCODERS_PATH  = os.path.join(BASE_DIR, "models", "yield_encoders.pkl")

# ─── Load model and encoders at module level (once on startup) ──────────────────
try:
    _model    = joblib.load(MODEL_PATH)
    _encoders = joblib.load(ENCODERS_PATH)
except FileNotFoundError as e:
    raise FileNotFoundError(
        f"Yield model or encoders not found. "
        f"Please run train_yield_model.py first.\nError: {e}"
    )

# Columns expected by the model (in exact order used during training)
FEATURE_COLUMNS = [
    "Soil_Type",
    "Farm_Area_acres",
    "Water_Availability_L_per_week",
    "Irrigation_Type",
    "Fertilizer_Used_kg",
    "Season",
    "Rainfall_mm",
    "Temperature_C",
    "Soil_pH",
    "Crop",
]

# Categorical columns (must match what was encoded during training)
CATEGORICAL_COLUMNS = ["Soil_Type", "Irrigation_Type", "Season", "Crop"]

# ─── Market Prices (₹ per ton) ─────────────────────────────────────────────────
MARKET_PRICE = {
    "Tomato": 12000,
    "Wheat":   8000,
    "Rice":    9000,
    "Potato":  7000,
    "Maize":   6000,
}


def calculate_profit(yield_per_acre: float, acres: float, crop_name: str) -> float:
    """
    Calculate total profit from a crop harvest.

    Args:
        yield_per_acre (float): Predicted yield in tons per acre.
        acres (float): Total land allocated to the crop.
        crop_name (str): Crop name (must exist in MARKET_PRICE).

    Returns:
        float: Total profit in local currency (₹).

    Raises:
        ValueError: If crop_name is not found in MARKET_PRICE.
    """
    if crop_name not in MARKET_PRICE:
        raise ValueError(
            f"No market price found for '{crop_name}'. "
            f"Supported crops: {list(MARKET_PRICE.keys())}"
        )
    price_per_ton = MARKET_PRICE[crop_name]
    total_profit  = yield_per_acre * acres * price_per_ton
    return round(total_profit, 2)


def _encode_input(input_df: pd.DataFrame) -> pd.DataFrame:
    """
    Apply saved LabelEncoders to categorical columns.
    Raises ValueError if an unseen category is encountered.
    """
    for col in CATEGORICAL_COLUMNS:
        if col not in _encoders:
            continue
        le = _encoders[col]
        unseen = set(input_df[col].astype(str)) - set(le.classes_)
        if unseen:
            raise ValueError(
                f"Unknown value(s) {unseen} for column '{col}'. "
                f"Accepted values: {list(le.classes_)}"
            )
        input_df[col] = le.transform(input_df[col].astype(str))
    return input_df


def predict_yield(input_data: dict, crop_name: str) -> float:
    """
    Predict crop yield in tons per acre for given farm conditions.

    Args:
        input_data (dict): Farm condition parameters:
            - Soil_Type (str)
            - Farm_Area_acres (float)
            - Water_Availability_L_per_week (int)
            - Irrigation_Type (str)
            - Fertilizer_Used_kg (float)
            - Season (str)
            - Rainfall_mm (float)
            - Temperature_C (float)
            - Soil_pH (float)
        crop_name (str): Name of the crop (e.g., "Rice", "Wheat").

    Returns:
        float: Predicted yield in tons per acre, rounded to 3 decimal places.
    """
    # Merge crop_name into the input dict
    data = {**input_data, "Crop": crop_name}

    # Build a single-row DataFrame with the correct column order
    row = pd.DataFrame([data])[FEATURE_COLUMNS]

    # Encode categoricals
    row = _encode_input(row)

    # Predict and return
    prediction = _model.predict(row)[0]
    return round(float(prediction), 3)
