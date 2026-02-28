from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

# Input Validation Schema
class FarmInput(BaseModel):
    Soil_Type: str
    Farm_Area_acres: float
    Water_Availability_L_per_week: int
    Irrigation_Type: str
    Fertilizer_Used_kg: float
    Season: str
    Rainfall_mm: float
    Temperature_C: float
    Soil_pH: float

# Initialize FastAPI app
app = FastAPI(
    title="Farm Planner Backend",
    description="API for crop prediction and farm management",
    version="1.0.0"
)

# Enable CORS for frontend integration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Adjust this for production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

from services.prediction import predict_crop

@app.get("/")
async def root():
    """
    Root endpoint to verify backend status.
    """
    return {"message": "Farm Planner Backend Running"}

@app.post("/predict-crop")
async def predict_crop_endpoint(data: FarmInput):
    """
    Endpoint to predict crop based on farm input data.
    """
    try:
        # Convert FarmInput to dictionary
        input_dict = data.dict()
        
        # Get prediction
        prediction = predict_crop(input_dict)
        
        # Return specific JSON format
        return {
            "recommended_crop": prediction
        }
    except Exception as e:
        # Raise HTTP 500 for internal errors
        raise HTTPException(
            status_code=500,
            detail=f"An error occurred during prediction: {str(e)}"
        )

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
