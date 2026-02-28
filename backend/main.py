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

from typing import List

# Input Validation Schema for Optimization
class OptimizationInput(BaseModel):
    land_area: float
    water_available: float
    fertilizer_available: float
    candidate_crops: List[str]

# Input schema for the combined farm plan endpoint
class FarmPlanInput(FarmInput):
    land_area: float
    water_available: float
    fertilizer_available: float

# Related crops map - for each predicted crop, 2 complementary crops are suggested
RELATED_CROPS = {
    "Rice":   ["Rice", "Wheat", "Maize"],
    "Wheat":  ["Wheat", "Potato", "Maize"],
    "Tomato": ["Tomato", "Potato", "Wheat"],
    "Maize":  ["Maize", "Rice", "Wheat"],
    "Potato": ["Potato", "Tomato", "Maize"],
}
# Fallback for any predicted crop not in the map
DEFAULT_RELATED = ["Wheat", "Maize", "Potato"]

from services.prediction import predict_crop
from services.optimizer import optimize_allocation

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
        # Convert FarmInput to dictionary (model_dump is Pydantic v2 compatible)
        input_dict = data.model_dump()
        
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

@app.post("/optimize-allocation")
async def optimize_allocation_endpoint(data: OptimizationInput):
    """
    Endpoint to optimize crop allocation based on available resources.
    """
    try:
        result = optimize_allocation(
            land_area=data.land_area,
            water_available=data.water_available,
            fertilizer_available=data.fertilizer_available,
            crop_names=data.candidate_crops
        )
        return result
    except ValueError as e:
        raise HTTPException(
            status_code=400,
            detail=str(e)
        )
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"An error occurred during optimization: {str(e)}"
        )


@app.post("/generate-farm-plan")
async def generate_farm_plan(data: FarmPlanInput):
    """
    Combined endpoint that:
    1. Predicts the best crop based on farm conditions.
    2. Generates a list of 3 related candidate crops (including the predicted one).
    3. Runs LP optimization to allocate land among those crops.
    4. Returns a complete farm plan.
    """
    try:
        # Step 1: Predict the most suitable crop
        # Use model_dump (Pydantic v2) and exclude optimizer-specific fields
        input_dict = data.model_dump(exclude={"land_area", "water_available", "fertilizer_available"})
        predicted_crop = predict_crop(input_dict)

        # Step 2: Get 3 related crops (including the predicted one)
        candidate_crops = RELATED_CROPS.get(predicted_crop, DEFAULT_RELATED)

        # Step 3: Run LP optimization over candidate crops
        optimization_result = optimize_allocation(
            land_area=data.land_area,
            water_available=data.water_available,
            fertilizer_available=data.fertilizer_available,
            crop_names=candidate_crops
        )

        # Step 4: Return complete farm plan
        return {
            "predicted_crop": predicted_crop,
            "candidate_crops": candidate_crops,
            "farm_plan": optimization_result
        }
    except ValueError as e:
        raise HTTPException(
            status_code=400,
            detail=str(e)
        )
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"An error occurred while generating the farm plan: {str(e)}"
        )


if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
