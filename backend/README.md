# 🤖 KisanSaathi Backend - ML Service

FastAPI-based machine learning service for crop prediction, yield forecasting, and farm optimization.

## ⚠️ IMPORTANT: Render Deployment Fix

**This configuration is optimized for Render deployment with Python 3.11.9**

### Why These Changes Matter:

1. **Build Tools First**: `setuptools`, `wheel`, and `pip` are at the TOP of requirements.txt
   - Render now uses Python 3.14 by default
   - ML packages (pandas, scikit-learn, numpy) need these build tools
   - Without them → pip cannot build packages → deploy crashes

2. **Python 3.11.9**: Specified in `runtime.txt`
   - Many ML libraries still break on Python 3.13+
   - 3.11.9 is stable and compatible with all dependencies

### If Deployment Fails:

**In Render Dashboard:**
1. Go to Service → Settings
2. Click **Clear build cache**
3. Click **Manual Deploy** → **Deploy latest commit**

This clears any cached Python 3.14 builds.

---

## 📋 Dependencies

All dependencies are listed in `requirements.txt`. **CRITICAL**: Make sure `PuLP` is installed for Linear Programming optimization.

### Core Dependencies

```
fastapi==0.104.1          # Web framework
uvicorn[standard]==0.24.0 # ASGI server
pydantic==2.5.0           # Data validation
numpy==1.24.3             # Numerical computing
pandas==2.0.3             # Data manipulation
scikit-learn==1.3.2       # Machine learning
PuLP==2.7.0              # Linear Programming ⭐ CRITICAL
joblib==1.3.2            # Model serialization
```

## 🚀 Installation

### Local Development

```bash
# Create virtual environment
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Verify installation
python verify_dependencies.py

# Start server
python main.py
# or
uvicorn main:app --reload --port 8000
```

### Production Deployment

**Render/Heroku**: Dependencies auto-install from `requirements.txt`

**Manual**:
```bash
pip install --upgrade pip
pip install -r requirements.txt
uvicorn main:app --host 0.0.0.0 --port $PORT --workers 2
```

## 🔧 Configuration

Copy `.env.example` to `.env` and configure:

```env
PORT=8000
ALLOWED_ORIGINS=https://your-frontend.com
ENVIRONMENT=production
```

## 🧪 Verification

Run the dependency checker:

```bash
python verify_dependencies.py
```

Expected output:
```
✅ FastAPI                     OK
✅ NumPy                       OK
✅ Pandas                      OK
✅ scikit-learn                OK
✅ PuLP (Linear Programming)   OK
...
```

## 🤖 ML Models

Models are stored in `./models/`:
- `crop_prediction_model.pkl` - Crop recommendation model
- `crop_label_encoder.pkl` - Label encoder for crops
- `yield_prediction_model.pkl` - Yield forecasting model

### Training Models

```bash
# Train crop prediction model
python train_model.py

# Train yield prediction model
python train_yield_model.py
```

## 📡 API Endpoints

### Health Check
```bash
GET /
Response: {"message": "Farm Planner Backend Running"}
```

### Predict Crop
```bash
POST /predict-crop
Body: {
  "Soil_Type": "Loamy",
  "Farm_Area_acres": 10,
  "Water_Availability_L_per_week": 5000,
  "Irrigation_Type": "Drip",
  "Fertilizer_Used_kg": 50,
  "Season": "Kharif",
  "Rainfall_mm": 800,
  "Temperature_C": 28,
  "Soil_pH": 6.5
}
```

### Generate Farm Plan
```bash
POST /generate-farm-plan
Body: {
  ...farm_input,
  "land_area": 20,
  "water_available": 10000,
  "fertilizer_available": 100
}
```

## 🐛 Troubleshooting

### Import Error: PuLP not found
```bash
pip install PuLP==2.7.0
```

### Model Files Missing
```bash
# Train models first
python train_model.py
python train_yield_model.py
```

### Port Already in Use
```bash
# Kill process on port 8000
lsof -ti:8000 | xargs kill -9

# Or use different port
uvicorn main:app --port 8001
```

### CORS Errors
Update `ALLOWED_ORIGINS` in `.env`:
```env
ALLOWED_ORIGINS=http://localhost:3000,https://your-domain.com
```

## 📊 Performance

- **Workers**: 2 (configurable in Procfile)
- **Request Timeout**: 30s
- **Max Request Size**: 10MB
- **Caching**: Model loaded once at startup

## 🔐 Security

- CORS configured per environment
- Input validation via Pydantic
- No sensitive data logged

## 📄 Files Overview

```
backend/
├── main.py                  # FastAPI application
├── requirements.txt         # Dependencies ⭐
├── runtime.txt             # Python version
├── Procfile                # Deployment config
├── .env.example            # Environment template
├── verify_dependencies.py  # Dependency checker
├── train_model.py          # Train crop model
├── train_yield_model.py    # Train yield model
├── services/
│   ├── prediction.py       # Crop prediction
│   ├── yield_predictor.py  # Yield forecasting
│   ├── optimizer.py        # LP optimization
│   ├── environment.py      # Risk analysis
│   └── preprocessor.py     # Data preprocessing
├── models/                 # Trained ML models
└── dataset/                # Training data
```

## 🚢 Deployment Checklist

- [ ] All dependencies in requirements.txt
- [ ] Python version in runtime.txt (3.11.7)
- [ ] Environment variables configured
- [ ] ML models trained and committed
- [ ] CORS origins set correctly
- [ ] Verify with `python verify_dependencies.py`

## 📞 Support

For issues related to:
- **Dependencies**: Check requirements.txt
- **ML Models**: Run training scripts
- **API**: See FastAPI docs at `/docs`
