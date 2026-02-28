import pandas as pd
from sklearn.model_selection import train_test_split
from sklearn.ensemble import RandomForestClassifier
from sklearn.preprocessing import LabelEncoder
import joblib
import os

# Set base directory
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
DATA_PATH = os.path.join(BASE_DIR, "dataset", "farm_resource_dataset.csv")

# Load dataset
data = pd.read_csv(DATA_PATH)

# Clean column names and data (strip spaces)
data.columns = [col.strip() for col in data.columns]
categorical_cols = ["Soil_Type", "Irrigation_Type", "Season"]
for col in categorical_cols:
    data[col] = data[col].astype(str).str.strip()

# Define features and target
features = [
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
X = data[features].copy()
y = data["Crop"].str.strip()

# Encode categorical columns
encoders = {}
for col in categorical_cols:
    le = LabelEncoder()
    X[col] = le.fit_transform(X[col])
    encoders[col] = le

# Encode crop label
crop_encoder = LabelEncoder()
y = crop_encoder.fit_transform(y)

# Train-test split
X_train, X_test, y_train, y_test = train_test_split(
    X, y, test_size=0.2, random_state=42
)

# Train model
model = RandomForestClassifier(n_estimators=100, random_state=42)
model.fit(X_train, y_train)

# Save everything to the 'models' directory
MODELS_DIR = os.path.join(BASE_DIR, "models")
os.makedirs(MODELS_DIR, exist_ok=True)

joblib.dump(model, os.path.join(MODELS_DIR, "crop_model.pkl"))
joblib.dump(encoders, os.path.join(MODELS_DIR, "encoders.pkl"))
joblib.dump(crop_encoder, os.path.join(MODELS_DIR, "crop_encoder.pkl"))

print(f"✅ Model trained successfully on {len(data)} rows.")
print(f"✅ Features used: {features}")