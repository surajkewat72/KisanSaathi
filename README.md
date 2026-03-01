# 🌾 KisanSaathi - Smart Farm Planning Platform

<div align="center">

![KisanSaathi Banner](https://img.shields.io/badge/KisanSaathi-Smart_Farming-green?style=for-the-badge)
![React](https://img.shields.io/badge/React-19.2.4-61DAFB?style=for-the-badge&logo=react)
![FastAPI](https://img.shields.io/badge/FastAPI-0.104.1-009688?style=for-the-badge&logo=fastapi)
![Node.js](https://img.shields.io/badge/Node.js-Express-339933?style=for-the-badge&logo=node.js)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-Database-336791?style=for-the-badge&logo=postgresql)

**An AI-powered farm planning platform that revolutionizes agriculture through intelligent crop selection, resource optimization, and data-driven decision making.**

[Features](#-features) • [Quick Start](#-quick-start) • [Documentation](#-documentation) • [API Reference](#-api-documentation)

</div>

---

## 📖 Overview

KisanSaathi (meaning "Farmer's Companion" in Hindi) is a comprehensive agricultural planning platform that leverages machine learning and optimization algorithms to help farmers make informed decisions. The platform analyzes soil conditions, climate data, available resources, and historical patterns to provide personalized farming recommendations.

### Why KisanSaathi?

- **Data-Driven Decisions**: Replace guesswork with ML-powered insights
- **Resource Optimization**: Maximize profits while minimizing waste
- **Risk Mitigation**: Identify and mitigate environmental and market risks
- **Sustainability Focus**: Promote eco-friendly farming practices
- **Easy to Use**: Intuitive interface designed for farmers

---

## ✨ Features

### 🌱 **Intelligent Crop Prediction**
- ML-based crop recommendations using Random Forest algorithm
- Analysis of 9 key parameters: soil type, pH, NPK values, temperature, rainfall, irrigation, fertilizer
- Trained on comprehensive agricultural dataset with 20+ crop varieties
- Real-time predictions with confidence scoring

### 📊 **Smart Farm Planning**
- Multi-crop land allocation using Linear Programming optimization
- Resource-aware planning (water, fertilizer, labor)
- Profit maximization while respecting constraints
- Support for mixed cropping strategies

### 📈 **Yield & Profit Forecasting**
- Accurate yield predictions using ML regression models
- Season-specific profit calculations
- Market price integration
- ROI analysis and break-even points

### ⚠️ **Risk Analysis**
- Environmental risk assessment (drought, flood, pest)
- Climate change impact analysis
- Soil degradation warnings
- Risk level categorization (Low/Medium/High)

### 💡 **Smart Advisory System**
- Context-aware farming recommendations
- Irrigation scheduling suggestions
- Fertilizer application guidelines
- Pest control advisories
- Weather-based alerts

### 📱 **Modern User Interface**
- Responsive design for mobile, tablet, and desktop
- Interactive data visualizations with Recharts
- Smooth animations using Framer Motion
- Dark mode support
- Multilingual capability (Hindi/English)

### 💾 **Data Management**
- Save and retrieve farm plans
- Historical data tracking
- Export reports (PDF/CSV)
- Cloud sync capabilities

---

## 🏗️ Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                       CLIENT LAYER                          │
│  ┌──────────────────────────────────────────────────────┐   │
│  │           React Frontend (Port 3000)                 │   │
│  │  • SPA with React Router                             │   │
│  │  • TailwindCSS + Framer Motion                       │   │
│  │  • Responsive UI Components                          │   │
│  └──────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────┘
                            ↓ HTTP/REST
┌─────────────────────────────────────────────────────────────┐
│                     APPLICATION LAYER                       │
│  ┌────────────────────┐          ┌─────────────────────┐    │
│  │   Node.js API      │          │   FastAPI ML        │    │
│  │   (Port 5001)      │ ←────→   │   (Port 8000)       │    │
│  │  • Express.js      │          │  • scikit-learn     │    │
│  │  • CRUD Operations │          │  • Prediction       │    │
│  │  • Auth            │          │  • Optimization     │    │
│  └────────────────────┘          └─────────────────────┘    │
│           ↓                                ↓                 │
└───────────┼────────────────────────────────┼─────────────────┘
            ↓                                ↓
┌───────────┴────────────────────────────────┴─────────────────┐
│                      DATA LAYER                              │
│  ┌──────────────────────────────────────────────────────┐    │
│  │          PostgreSQL Database (Port 5432)             │    │
│  │  • Prisma ORM                                        │    │
│  │  • User Data, Farm Plans, Historical Records         │    │
│  └──────────────────────────────────────────────────────┘    │
│  ┌──────────────────────────────────────────────────────┐    │
│  │              ML Models (Pickled)                     │    │
│  │  • Crop Prediction Model                             │    │
│  │  • Yield Prediction Model                            │    │
│  │  • Optimizer Model                                   │    │
│  └──────────────────────────────────────────────────────┘    │
└─────────────────────────────────────────────────────────────┘
```

---

## 🛠️ Tech Stack

### **Frontend**
| Technology | Version | Purpose |
|------------|---------|---------|
| React | 19.2.4 | UI Framework |
| React Router | 7.13.1 | Client-side routing |
| TailwindCSS | 3.4.19 | Utility-first CSS |
| Framer Motion | 12.34.3 | Animations |
| Recharts | 3.7.0 | Data visualization |
| Axios | 1.13.6 | HTTP client |
| Lucide React | 0.575.0 | Icon library |

### **Backend API (Node.js)**
| Technology | Version | Purpose |
|------------|---------|---------|
| Node.js | - | Runtime environment |
| Express.js | 4.21.2 | Web framework |
| Prisma | 6.1.0 | ORM |
| PostgreSQL | - | Database |
| @prisma/adapter-pg | 6.1.0 | Prisma PostgreSQL adapter |
| bcryptjs | 2.4.3 | Password hashing |
| dotenv | 16.4.7 | Environment variables |
| CORS | 2.8.5 | Cross-origin requests |

### **ML Service (FastAPI)**
| Technology | Version | Purpose |
|------------|---------|---------|
| FastAPI | 0.104.1 | Web framework |
| Uvicorn | 0.24.0 | ASGI server |
| Pydantic | 2.5.0 | Data validation |
| scikit-learn | 1.3.2 | Machine learning |
| NumPy | 1.24.3 | Numerical computing |
| Pandas | 2.0.3 | Data manipulation |
| SciPy | 1.11.4 | Scientific computing |

### **Database**
- **PostgreSQL 14+**: Relational database
- **Prisma 7**: Modern ORM with type safety

---

## 📋 Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js** (v18+ recommended) - [Download](https://nodejs.org/)
- **Python** (v3.8 - 3.11) - [Download](https://python.org/)
- **PostgreSQL** (v14+) - [Download](https://www.postgresql.org/)
- **npm** or **yarn** - Comes with Node.js
- **Git** - [Download](https://git-scm.com/)

### System Requirements
- **OS**: Windows 10+, macOS 10.15+, or Linux
- **RAM**: 4GB minimum, 8GB recommended
- **Disk**: 2GB free space
- **Internet**: Required for initial setup

---

## 🚀 Quick Start

### 1️⃣ Clone the Repository

```bash
git clone https://github.com/yourusername/KisanSaathi.git
cd KisanSaathi
```

### 2️⃣ Database Setup

```bash
# Create PostgreSQL database
psql -U postgres
CREATE DATABASE kisansaathi;
\q
```

### 3️⃣ Backend Setup (Node.js API)

```bash
cd server

# Install dependencies
npm install

# Configure environment variables
cp .env.example .env
# Edit .env with your database credentials

# Generate Prisma client
npx prisma generate

# Start server
npm start
# Server runs on http://localhost:5001
```

### 4️⃣ ML Service Setup (FastAPI)

```bash
cd backend

# Create virtual environment (recommended)
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Start FastAPI server
python main.py
# Service runs on http://localhost:8000
```

### 5️⃣ Frontend Setup (React)

```bash
cd frontend

# Install dependencies
npm install

# Configure environment variables
cp .env.example .env
# Edit .env with API URLs

# Start development server
npm start
# App opens at http://localhost:3000
```

### 6️⃣ Verify Installation

Open your browser and visit:
- **Frontend**: http://localhost:3000
- **Node API**: http://localhost:5001
- **FastAPI Docs**: http://localhost:8000/docs

---

## ⚙️ Configuration

### Backend Environment Variables (`server/.env`)

```env
# Database URL (PostgreSQL)
DATABASE_URL=postgresql://user:password@localhost:5432/kisansaathi

# FastAPI ML Service URL
FASTAPI_URL=http://localhost:8000

# Server Configuration
PORT=5001
NODE_ENV=development

# CORS Origins (comma-separated)
ALLOWED_ORIGINS=http://localhost:3000,http://localhost:5173

# Frontend URL
FRONTEND_URL=http://localhost:3000
```

### Frontend Environment Variables (`frontend/.env`)

```env
# Backend API URL
REACT_APP_API_URL=http://localhost:5001

# FastAPI ML Service URL
REACT_APP_FASTAPI_URL=http://localhost:8000
```

### FastAPI Environment Variables

FastAPI uses the same CORS configuration from `backend/.env` (optional).

---

## 📱 Usage

### Creating a Farm Plan

1. **Navigate to Planner** (`/planner`)
2. **Fill in farm details**:
   - Soil type (Loamy, Sandy, Clay, etc.)
   - Farm area in acres
   - Water availability (L/week)
   - Irrigation type (Drip, Sprinkler, Flood)
   - Fertilizer availability (kg)
   - Season (Kharif, Rabi, Zaid)
   - Climate data (rainfall, temperature, pH)
3. **Submit**: Get optimized crop recommendations
4. **View Dashboard**: See allocation, profit, sustainability score
5. **Save Plan**: Store for future reference

### Predicting Best Crop

1. Go to **Crop Predictor** (`/crop-predictor`)
2. Enter farm characteristics
3. Get instant crop recommendation
4. View confidence scores and alternatives

### Forecasting Yield

1. Navigate to **Yield Predictor** (`/yield-predictor`)
2. Select crop and enter details
3. Get yield predictions per acre
4. View profit estimates

### Risk Analysis

1. Go to **Risk Analysis** (`/risk-analysis`)
2. Enter environmental conditions
3. Get risk assessment report
4. Receive mitigation strategies

---

## 🌐 API Documentation

### FastAPI Endpoints (Port 8000)

#### 1. Predict Best Crop
```http
POST /predict-crop
Content-Type: application/json

{
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

Response: { "recommended_crop": "Rice" }
```

#### 2. Generate Farm Plan
```http
POST /generate-farm-plan
Content-Type: application/json

{
  "Soil_Type": "Loamy",
  "Farm_Area_acres": 20,
  "Water_Availability_L_per_week": 10000,
  "Irrigation_Type": "Drip",
  "Fertilizer_Used_kg": 100,
  "Season": "Kharif",
  "Rainfall_mm": 800,
  "Temperature_C": 28,
  "Soil_pH": 6.5,
  "land_area": 20,
  "water_available": 10000,
  "fertilizer_available": 100
}

Response: {
  "predicted_crop": "Rice",
  "candidate_crops": ["Rice", "Wheat", "Maize"],
  "farm_plan": [
    {
      "crop": "Rice",
      "acres": 15,
      "expected_yield": 5.2,
      "expected_profit": 78000,
      "risk_level": "Low",
      "advisories": ["Use drip irrigation...", "Apply fertilizer..."]
    }
  ],
  "total_expected_profit": 78000,
  "sustainability_score": 85
}
```

#### 3. Predict Yield
```http
POST /predict-yield
Content-Type: application/json

{
  "Soil_Type": "Loamy",
  "Farm_Area_acres": 5,
  "crop_name": "Wheat",
  "acres": 5,
  ...farm_conditions
}

Response: {
  "crop": "Wheat",
  "yield_per_acre": 4.5,
  "total_yield": 22.5,
  "profit": 45000
}
```

### Node.js API Endpoints (Port 5001)

#### 1. Save Farm Plan
```http
POST /api/plans/generate
Content-Type: application/json

{
  ...farm_plan_data,
  "farmerName": "Ram Kumar"
}

Response: {
  "id": "uuid",
  "farmerName": "Ram Kumar",
  "totalArea": 20,
  "recommendations": [...],
  "allocation": {...},
  "totalProfit": 78000,
  "sustainability": 85,
  "riskLevel": "Low",
  "createdAt": "2026-03-01T10:00:00Z",
  "updatedAt": "2026-03-01T10:00:00Z"
}
```

#### 2. Get All Plans
```http
GET /api/plans

Response: [
  {
    "id": "uuid",
    "farmerName": "Ram Kumar",
    "totalProfit": 78000,
    ...
  }
]
```

#### 3. Get Single Plan
```http
GET /api/plans/:id

Response: { ...plan_details }
```

#### 4. Delete Plan
```http
DELETE /api/plans/:id

Response: { "message": "Plan deleted successfully" }
```

**Interactive API Documentation**: Visit http://localhost:8000/docs for Swagger UI

---

## 📂 Project Structure

```
KisanSaathi/
├── 📁 frontend/                 # React frontend application
│   ├── 📁 public/               # Static assets
│   ├── 📁 src/
│   │   ├── 📁 components/       # Reusable components
│   │   │   ├── 📁 cards/        # Card components
│   │   │   ├── 📁 charts/       # Chart components (Recharts)
│   │   │   ├── 📁 layout/       # Layout components (Navbar, Sidebar)
│   │   │   └── 📁 ui/           # UI utilities
│   │   ├── 📁 context/          # React Context (state management)
│   │   ├── 📁 pages/            # Page components
│   │   │   ├── Home.jsx
│   │   │   ├── PlannerForm.jsx
│   │   │   ├── FarmDashboard.jsx
│   │   │   ├── CropPredictor.jsx
│   │   │   ├── YieldPredictor.jsx
│   │   │   ├── RiskAnalysis.jsx
│   │   │   └── ...
│   │   ├── 📁 services/         # API service layer
│   │   ├── 📁 utils/            # Utility functions
│   │   ├── App.js               # Main app component
│   │   └── index.js             # Entry point
│   ├── package.json
│   ├── tailwind.config.js
│   └── .env.example
│
├── 📁 server/                   # Node.js backend API
│   ├── 📁 controllers/          # Route controllers
│   │   └── generatePlan.js
│   ├── 📁 routes/               # API routes
│   │   └── farmPlan.js
│   ├── 📁 prisma/               # Prisma ORM
│   │   └── schema.prisma        # Database schema
│   ├── index.js                 # Express server
│   ├── prismaClient.js          # Prisma client setup
│   ├── package.json
│   └── .env.example
│
├── 📁 backend/                  # FastAPI ML service
│   ├── 📁 services/             # ML service modules
│   │   ├── prediction.py        # Crop prediction
│   │   ├── yield_predictor.py   # Yield prediction
│   │   ├── optimizer.py         # LP optimization
│   │   ├── environment.py       # Risk analysis
│   │   └── preprocessor.py      # Data preprocessing
│   ├── 📁 models/               # Trained ML models (.pkl)
│   ├── 📁 dataset/              # Training datasets
│   ├── main.py                  # FastAPI app
│   ├── train_model.py           # Model training script
│   ├── requirements.txt
│   └── .env.example
│
├── 📁 docs/                     # Additional documentation
│   ├── SIMPLE_DEPLOYMENT.md     # Deployment guide (Vercel/Render)
│   ├── DEPLOYMENT_CHECKLIST.md  # Pre-deployment checklist
│   └── READY_TO_DEPLOY.md       # Quick deployment reference
│
├── README.md                    # This file
├── .gitignore
└── LICENSE
```

---

## 🔧 Development

### Running in Development Mode

**Terminal 1: FastAPI**
```bash
cd backend
python main.py
# Runs on http://localhost:8000 with auto-reload
```

**Terminal 2: Node.js API**
```bash
cd server
npm run dev  # Uses nodemon for auto-restart
# Runs on http://localhost:5001
```

**Terminal 3: React Frontend**
```bash
cd frontend
npm start
# Runs on http://localhost:3000 with hot reload
```

### Training ML Models

```bash
cd backend

# Train crop prediction model
python train_model.py

# Train yield prediction model
python train_yield_model.py

# Models saved in ./models/ directory
```

### Database Migrations

```bash
cd server

# Create migration
npx prisma migrate dev --name migration_name

# Apply migrations
npx prisma migrate deploy

# Reset database (development only)
npx prisma migrate reset
```

### Code Quality

```bash
# Frontend linting
cd frontend
npm run lint

# Backend testing
cd server
npm test

# Python linting
cd backend
pylint services/
```

---

## 🚢 Deployment

See detailed deployment guides:
- **[SIMPLE_DEPLOYMENT.md](SIMPLE_DEPLOYMENT.md)** - Vercel + Render deployment
- **[DEPLOYMENT_CHECKLIST.md](DEPLOYMENT_CHECKLIST.md)** - Pre-flight checklist
- **[READY_TO_DEPLOY.md](READY_TO_DEPLOY.md)** - Quick reference

### Quick Deploy Summary

**Frontend (Vercel)**
```bash
cd frontend
vercel --prod
```

**Backend API (Render)**
- Connect GitHub repository
- Build command: `cd server && npm install`
- Start command: `cd server && npm start`

**FastAPI (Render)**
- Build command: `cd backend && pip install -r requirements.txt`
- Start command: `cd backend && python main.py`

**Database (Render PostgreSQL)**
- Create PostgreSQL instance
- Copy DATABASE_URL to environment variables

---

## 🐛 Troubleshooting

### Common Issues

**1. Port Already in Use**
```bash
# Kill process on port 3000
lsof -ti:3000 | xargs kill -9

# Kill process on port 5001
lsof -ti:5001 | xargs kill -9

# Kill process on port 8000
lsof -ti:8000 | xargs kill -9
```

**2. Database Connection Error**
- Verify PostgreSQL is running: `pg_isready`
- Check DATABASE_URL in `.env`
- Ensure database exists: `psql -U user -l`

**3. Prisma Client Not Generated**
```bash
cd server
npx prisma generate
```

**4. ML Models Not Found**
```bash
cd backend
python train_model.py
python train_yield_model.py
```

**5. CORS Errors**
- Check ALLOWED_ORIGINS in `server/.env`
- Verify frontend URL matches exactly
- Clear browser cache

**6. Module Not Found (Python)**
```bash
cd backend
pip install -r requirements.txt --upgrade
```

---

## 📊 Features Roadmap

- [ ] Weather API integration (real-time data)
- [ ] Market price predictions
- [ ] Mobile app (React Native)
- [ ] Multi-language support (Hindi, Tamil, Telugu)
- [ ] Offline mode
- [ ] WhatsApp bot integration
- [ ] Community forum
- [ ] IoT sensor integration
- [ ] Satellite imagery analysis
- [ ] Government scheme recommendations

---

## 🤝 Contributing

We welcome contributions! Please follow these steps:

1. **Fork the repository**
2. **Create a feature branch**
   ```bash
   git checkout -b feature/amazing-feature
   ```
3. **Commit your changes**
   ```bash
   git commit -m 'Add amazing feature'
   ```
4. **Push to the branch**
   ```bash
   git push origin feature/amazing-feature
   ```
5. **Open a Pull Request**

### Contribution Guidelines
- Follow existing code style
- Write meaningful commit messages
- Add tests for new features
- Update documentation
- Ensure all tests pass

---

## 📄 License

This project is licensed under the **MIT License** - see the [LICENSE](LICENSE) file for details.

---

## 👥 Team

- **Lead Developer**: Your Name
- **ML Engineer**: Contributor Name
- **UI/UX Designer**: Designer Name

---

## VIDEO LINK: https://drive.google.com/file/d/1axMKwx2oSa9BYkx7XDbq7Ej2iZMpvssM/view?usp=sharing

---
## 🙏 Acknowledgments

- **scikit-learn** for ML algorithms
- **FastAPI** for the amazing Python framework
- **React** and **TailwindCSS** for frontend tools
- **Prisma** for database management
- Agricultural research papers and datasets
- Farming community for feedback

---

## 📞 Support

- **Issues**: [GitHub Issues](https://github.com/yourusername/KisanSaathi/issues)
- **Email**: support@kisansaathi.com
- **Discord**: [Join our community](https://discord.gg/kisansaathi)
- **Docs**: [Full Documentation](https://docs.kisansaathi.com)

---

<div align="center">

**Made with ❤️ for Indian Farmers**

⭐ Star this repo if you find it useful!

[Report Bug](https://github.com/yourusername/KisanSaathi/issues) • [Request Feature](https://github.com/yourusername/KisanSaathi/issues) • [Documentation](https://docs.kisansaathi.com)

</div>
