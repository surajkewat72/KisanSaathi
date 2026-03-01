import os
import pandas as pd
import numpy as np
import joblib
from sklearn.ensemble import RandomForestRegressor
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import LabelEncoder
from sklearn.metrics import mean_absolute_error, r2_score

# ─── Paths ─────────────────────────────────────────────────────────────────────
BASE_DIR        = os.path.dirname(os.path.abspath(__file__))
DATA_PATH       = os.path.join(BASE_DIR, "dataset", "agriculture_dataset.csv")
MODEL_PATH      = os.path.join(BASE_DIR, "models", "yield_model.pkl")
ENCODERS_PATH   = os.path.join(BASE_DIR, "models", "yield_encoders.pkl")

# ─── Helpers ───────────────────────────────────────────────────────────────────

def generate_sample_dataset(path: str, n_rows: int = 10000) -> pd.DataFrame:
    """
    Generates a realistic synthetic agriculture dataset and saves it to path.
    Called only when agriculture_dataset.csv is not found.
    """
    np.random.seed(42)

    soil_types      = ["Loamy", "Sandy", "Clay", "Silty", "Peaty"]
    irrigation_types = ["Drip", "Sprinkler", "Flood", "Rainfed"]
    seasons         = ["Kharif", "Rabi", "Summer", "Zaid"]
    crops           = ["Rice", "Wheat", "Tomato", "Maize", "Potato"]

    data = {
        "Soil_Type":                  np.random.choice(soil_types, n_rows),
        "Farm_Area_acres":            np.round(np.random.uniform(1, 20, n_rows), 2),
        "Water_Availability_L_per_week": np.random.randint(500, 5000, n_rows),
        "Irrigation_Type":            np.random.choice(irrigation_types, n_rows),
        "Fertilizer_Used_kg":         np.round(np.random.uniform(20, 200, n_rows), 2),
        "Season":                     np.random.choice(seasons, n_rows),
        "Rainfall_mm":                np.round(np.random.uniform(200, 1500, n_rows), 2),
        "Temperature_C":              np.round(np.random.uniform(10, 45, n_rows), 2),
        "Soil_pH":                    np.round(np.random.uniform(5.0, 9.0, n_rows), 2),
        "Crop":                       np.random.choice(crops, n_rows),
    }

    df = pd.DataFrame(data)

    # Simulate yield based on realistic crop factors
    crop_base_yield = {"Rice": 2.5, "Wheat": 2.0, "Tomato": 5.0, "Maize": 2.2, "Potato": 4.5}
    df["Crop_Yield_ton_per_acre"] = (
        df["Crop"].map(crop_base_yield)
        + df["Fertilizer_Used_kg"] * 0.005
        + df["Rainfall_mm"] * 0.001
        - (df["Temperature_C"] - 25).abs() * 0.02
        + np.random.normal(0, 0.3, n_rows)
    ).clip(0.5, 10.0).round(3)

    os.makedirs(os.path.dirname(path), exist_ok=True)
    df.to_csv(path, index=False)
    print(f"✅ Generated synthetic dataset with {n_rows} rows → {path}")
    return df


def load_or_generate_data() -> pd.DataFrame:
    if os.path.exists(DATA_PATH):
        df = pd.read_csv(DATA_PATH)
        print(f"✅ Loaded dataset: {DATA_PATH}  ({len(df)} rows)")
    else:
        print(f"⚠️  agriculture_dataset.csv not found. Generating synthetic data...")
        df = generate_sample_dataset(DATA_PATH)
    return df


def label_encode_categoricals(df: pd.DataFrame) -> tuple[pd.DataFrame, dict]:
    """Label-encode all string/object columns. Returns (encoded_df, encoders_dict)."""
    encoders = {}
    # Use 'str' for pandas 3 compatibility; falls back to 'object' gracefully
    cat_cols = df.select_dtypes(include=["object", "string"]).columns.tolist()
    for col in cat_cols:
        le = LabelEncoder()
        df[col] = le.fit_transform(df[col].astype(str))
        encoders[col] = le
        print(f"   Label-encoded: {col}  (classes: {list(le.classes_)})")
    return df, encoders


# ─── Main Training Pipeline ────────────────────────────────────────────────────

def train():
    print("\n" + "="*55)
    print("  Crop Yield Prediction — Training Pipeline")
    print("="*55)

    # 1. Load data
    df = load_or_generate_data()

    # 2. Validate target column
    TARGET = "Crop_Yield_ton_per_acre"
    if TARGET not in df.columns:
        raise ValueError(
            f"Target column '{TARGET}' not found in dataset.\n"
            f"Available columns: {list(df.columns)}"
        )

    # 3. Separate features & target
    X = df.drop(columns=[TARGET])
    y = df[TARGET]
    print(f"\n✅ Features  : {list(X.columns)}")
    print(f"✅ Target    : {TARGET}")

    # 4. Label-encode categorical columns (save encoders for inference)
    print("\n[Encoding categorical columns]")
    X, encoders = label_encode_categoricals(X)

    # 5. Train / Test split  (80 / 20)
    X_train, X_test, y_train, y_test = train_test_split(
        X, y, test_size=0.2, random_state=42
    )
    print(f"\nTrain samples : {len(X_train)}")
    print(f"Test  samples : {len(X_test)}")

    # 6. Train RandomForestRegressor (reduced for memory)
    print("\n[Training RandomForestRegressor …]")
    model = RandomForestRegressor(
        n_estimators=20,
        max_depth=12,
        random_state=42,
        n_jobs=-1
    )
    model.fit(X_train, y_train)
    print("✅ Training complete.")

    # 7. Evaluate
    y_pred = model.predict(X_test)
    mae  = mean_absolute_error(y_test, y_pred)
    r2   = r2_score(y_test, y_pred)
    print(f"\n[Evaluation on Test Set]")
    print(f"   MAE  (Mean Absolute Error) : {mae:.4f} ton/acre")
    print(f"   R²   (R-squared)           : {r2:.4f}")

    # 8. Save model and encoders
    os.makedirs(os.path.dirname(MODEL_PATH), exist_ok=True)
    joblib.dump(model, MODEL_PATH)
    joblib.dump(encoders, ENCODERS_PATH)
    print(f"\n✅ Model saved    → {MODEL_PATH}")
    print(f"✅ Encoders saved → {ENCODERS_PATH}")
    print("="*55 + "\n")


if __name__ == "__main__":
    train()
