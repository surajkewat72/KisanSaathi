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

# Input schema for basic optimization (no farm conditions)
class OptimizationInput(BaseModel):
    land_area: float
    water_available: float
    fertilizer_available: float
    candidate_crops: List[str]

# Enriched optimization input — includes farm conditions for yield prediction
class EnrichedOptimizationInput(FarmInput):
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

# Input schema for /predict-yield
class YieldInput(FarmInput):
    crop_name: str
    acres: float

from services.prediction import predict_crop
from services.optimizer import optimize_allocation
from services.yield_predictor import predict_yield, calculate_profit
from services.preprocessor import safe_preprocess
from services.environment import analyze_environment, generate_advisories


def _sustainability_score(enriched: dict) -> int:
    """
    Compute a 0–100 sustainability score based on crop risk levels.
      Low    risk  → 100 points
      Medium risk  → 60  points
      High   risk  → 20  points
    Returns the average across all allocated crops.
    """
    risk_scores = {"Low": 100, "Medium": 60, "High": 20}
    if not enriched:
        return 0
    total = sum(risk_scores.get(d["risk_level"], 20) for d in enriched.values())
    return round(total / len(enriched))


def enrich_allocation(allocation: dict, farm_conditions: dict) -> dict:
    """
    For each allocated crop:
      1. Predict base yield (ML model)
      2. Analyze environment → adjusted yield + risk level
      3. Generate farmer-friendly advisories
      4. Recalculate profit using adjusted yield

    Only includes crops with acres > 0.
    Returns dict of {crop_name: {acres, expected_yield, adjusted_yield,
                                  expected_profit, risk_level, advisories}}
    """
    enriched = {}
    for crop_name, acres in allocation.items():
        if acres <= 0:
            continue

        # Step 1: ML yield prediction
        base_yield = predict_yield(farm_conditions, crop_name=crop_name)

        # Step 2: Environmental stress adjustment
        env = analyze_environment(farm_conditions, crop_name=crop_name, predicted_yield=base_yield)
        adjusted_yield = env["adjusted_yield"]

        # Step 3: Farmer-friendly advisories (replaces raw warnings)
        advisories = generate_advisories(farm_conditions, crop_name=crop_name)

        # Step 4: Profit from adjusted yield
        profit = calculate_profit(adjusted_yield, acres, crop_name)

        enriched[crop_name] = {
            "acres":          acres,
            "expected_yield": base_yield,       # raw ML prediction
            "adjusted_yield": adjusted_yield,   # after env penalties
            "expected_profit":profit,
            "risk_level":     env["risk_level"],
            "advisories":     advisories
        }
    return enriched

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
        # Convert FarmInput to dictionary and apply safe preprocessing
        input_dict = safe_preprocess(data.model_dump())
        
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
async def optimize_allocation_endpoint(data: EnrichedOptimizationInput):
    """
    Optimizes crop land allocation and returns per-crop yield and profit estimates.
    """
    try:
        farm_conditions = safe_preprocess(
            data.model_dump(
                exclude={"land_area", "water_available", "fertilizer_available", "candidate_crops"}
            )
        )

        result = optimize_allocation(
            land_area=data.land_area,
            water_available=data.water_available,
            fertilizer_available=data.fertilizer_available,
            crop_names=data.candidate_crops
        )

        # Enrich each allocated crop with yield and profit
        enriched = enrich_allocation(result["allocation"], farm_conditions)

        return {
            "allocation": enriched,
            "resource_usage": result["resource_usage"],
            "total_profit": result["total_profit"]
        }
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
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
        # Step 1: Predict the most suitable crop (with safe preprocessing)
        raw_input = data.model_dump(exclude={"land_area", "water_available", "fertilizer_available"})
        input_dict = safe_preprocess(raw_input)
        farm_conditions = input_dict  # reuse the same preprocessed dict
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

        # Step 4: Enrich each crop with yield, env analysis, advisories and profit
        enriched = enrich_allocation(optimization_result["allocation"], farm_conditions)

        # Step 5: Build farm_plan list + compute totals + sustainability score
        farm_plan = [
            {
                "crop":           crop,
                "acres":          d["acres"],
                "expected_yield": d["expected_yield"],
                "adjusted_yield": d["adjusted_yield"],
                "expected_profit":d["expected_profit"],
                "risk_level":     d["risk_level"],
                "advisories":     d["advisories"]
            }
            for crop, d in enriched.items()
        ]
        total_expected_profit = round(
            sum(d["expected_profit"] for d in enriched.values()), 2
        )
        sustainability_score = _sustainability_score(enriched)

        return {
            "predicted_crop":       predicted_crop,
            "candidate_crops":      candidate_crops,
            "farm_plan":            farm_plan,
            "total_expected_profit":total_expected_profit,
            "sustainability_score": sustainability_score
        }
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"An error occurred while generating the farm plan: {str(e)}"
        )


@app.post("/predict-yield")
async def predict_yield_endpoint(data: YieldInput):
    """
    Predicts crop yield per acre and calculates total profit
    based on farm conditions, crop name, and allocated land.
    """
    try:
        # Apply safe preprocessing before yield prediction
        input_data = safe_preprocess(
            data.model_dump(exclude={"crop_name", "acres"})
        )

        # Predict yield per acre
        yield_per_acre = predict_yield(input_data, crop_name=data.crop_name)

        # Calculate total production and profit
        total_production = round(yield_per_acre * data.acres, 3)
        profit = calculate_profit(
            yield_per_acre=yield_per_acre,
            acres=data.acres,
            crop_name=data.crop_name
        )

        return {
            "crop": data.crop_name,
            "acres": data.acres,
            "yield_per_acre": yield_per_acre,
            "total_production_tons": total_production,
            "profit": profit
        }
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"An error occurred during yield prediction: {str(e)}"
        )


if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
