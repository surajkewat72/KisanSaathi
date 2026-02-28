import pulp
from typing import Dict, Any, List

# Hardcoded crop data (per acre basis)
CROP_DATA = {
    "Rice": {
        "profit": 45000,      # Profit in local currency per acre
        "water": 4500,        # Water requirement in liters/gallons per acre
        "fertilizer": 100     # Fertilizer requirement in kg per acre
    },
    "Wheat": {
        "profit": 35000,
        "water": 2000,
        "fertilizer": 60
    },
    "Tomato": {
        "profit": 60000,
        "water": 3000,
        "fertilizer": 80
    },
    "Maize": {
        "profit": 30000,
        "water": 1800,
        "fertilizer": 50
    },
    "Potato": {
        "profit": 50000,
        "water": 2500,
        "fertilizer": 90
    }
}


def optimize_allocation(
    land_area: float, 
    water_available: float, 
    fertilizer_available: float, 
    crop_names: List[str]
) -> Dict[str, Any]:
    """
    Optimizes crop allocation to maximize profit under given constraints using PuLP.
    
    Args:
        land_area (float): Total available land in acres.
        water_available (float): Total available water (e.g., in liters or gallons).
        fertilizer_available (float): Total available fertilizer in kg.
        crop_names (list of str): List of crop names to consider for allocation.
            
    Returns:
        dict: A dictionary containing:
            - 'allocation': A dict mapping crop names to allocated acres.
            - 'profit': Total maximum profit achievable.
    """
    
    # Validate: reject any crop not found in CROP_DATA
    unknown_crops = [name for name in crop_names if name not in CROP_DATA]
    if unknown_crops:
        raise ValueError(
            f"Unknown crop(s): {unknown_crops}. "
            f"Supported crops are: {list(CROP_DATA.keys())}"
        )
    
    # Guard: at least one valid crop must be requested
    if not crop_names:
        raise ValueError("No crops provided. Please supply at least one crop name.")
    
    valid_crops = list(crop_names)  # all are valid at this point
    
    # 1. Initialize the Optimization Problem
    prob = pulp.LpProblem("Crop_Allocation_Optimization", pulp.LpMaximize)
    
    # 2. Define Decision Variables
    # We create a variable for each crop representing the acres allocated to it.
    # The lower bound is 0 (can't allocate negative acres).
    crop_vars = pulp.LpVariable.dicts(
        "Acres", 
        valid_crops, 
        lowBound=0, 
        cat='Continuous'
    )
    
    # 3. Define Objective Function
    # Maximize total profit: sum(acres_i * profit_per_acre_i)
    prob += pulp.lpSum([crop_vars[name] * CROP_DATA[name]['profit'] for name in valid_crops]), "Total_Profit"
    
    # 4. Define Constraints
    
    # Land constraint: Total acres allocated cannot exceed available land
    prob += pulp.lpSum([crop_vars[name] for name in valid_crops]) <= land_area, "Total_Land_Constraint"
    
    # Water constraint: Total water used cannot exceed available water
    prob += pulp.lpSum([crop_vars[name] * CROP_DATA[name]['water'] for name in valid_crops]) <= water_available, "Total_Water_Constraint"
    
    # Fertilizer constraint: Total fertilizer used cannot exceed available fertilizer
    prob += pulp.lpSum([crop_vars[name] * CROP_DATA[name]['fertilizer'] for name in valid_crops]) <= fertilizer_available, "Total_Fertilizer_Constraint"
    
    # 5. Solve the problem using the default CBC solver
    prob.solve(pulp.PULP_CBC_CMD(msg=False))
    
    # Check solver status — raise an error if infeasible or undefined
    status = pulp.LpStatus[prob.status]
    if status in ("Infeasible", "Undefined", "Not Solved"):
        raise ValueError(
            f"Optimization failed: {status}. "
            "Resources (land, water, or fertilizer) may be insufficient to allocate any crop."
        )
    
    # 6. Extract Results
    allocation = {}
    total_water_used = 0.0
    total_fertilizer_used = 0.0
    
    for name in valid_crops:
        var = crop_vars[name]
        # Round to 2 decimal places for cleaner output if desired, or keep exact
        allocated_acres = round(var.varValue, 2) if var.varValue is not None else 0.0
        allocation[name] = allocated_acres
        
        # Calculate resources used based on allocation
        total_water_used += allocated_acres * CROP_DATA[name]['water']
        total_fertilizer_used += allocated_acres * CROP_DATA[name]['fertilizer']
        
    total_profit = pulp.value(prob.objective) if pulp.value(prob.objective) is not None else 0.0
    
    return {
        "allocation": allocation,
        "resource_usage": {
            "water_used": round(total_water_used, 2),
            "fertilizer_used": round(total_fertilizer_used, 2)
        },
        "total_profit": round(total_profit, 2)
    }
