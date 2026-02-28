# ─── services/preprocessor.py ─────────────────────────────────────────────────
# Safe preprocessing layer: fills missing or None feature values with
# realistic dataset averages before passing data to any ML model.

from typing import Any

# Default values derived from dataset averages / most frequent categories
FEATURE_DEFAULTS: dict[str, Any] = {
    # Categorical (most frequent values)
    "Soil_Type":                     "Loamy",
    "Irrigation_Type":               "Sprinkler",
    "Season":                        "Kharif",
    "Crop":                          "Wheat",

    # Numerical (dataset averages)
    "Farm_Area_acres":               10.0,
    "Water_Availability_L_per_week": 2750,
    "Fertilizer_Used_kg":            110.0,
    "Rainfall_mm":                   850.0,
    "Temperature_C":                 27.0,
    "Soil_pH":                       7.0,
}


def safe_preprocess(input_data: dict) -> dict:
    """
    Fills missing or None values in `input_data` with FEATURE_DEFAULTS.

    - Keys present with a valid (non-None, non-empty) value are kept as-is.
    - Keys that are missing, None, or empty string are replaced with defaults.
    - Unknown extra keys are passed through unchanged.

    Args:
        input_data (dict): Raw input from the API request.

    Returns:
        dict: A fully-populated feature dict ready for model prediction.
    """
    processed = {}

    # Start with all known defaults, then overlay actual input values
    all_keys = set(FEATURE_DEFAULTS.keys()) | set(input_data.keys())

    for key in all_keys:
        value = input_data.get(key)

        # Consider the value missing if it's None or an empty string
        is_missing = value is None or value == ""

        if is_missing:
            default = FEATURE_DEFAULTS.get(key)
            processed[key] = default
        else:
            processed[key] = value

    return processed
