# ─── services/environment.py ───────────────────────────────────────────────────
# Evaluates environmental suitability for a given crop and adjusts yield
# based on temperature, rainfall, and soil pH stress factors.

from typing import Any

# ─── Crop-Specific Optimal Ranges ──────────────────────────────────────────────
# Each crop defines: (min, ideal_min, ideal_max, max)
# Values within [ideal_min, ideal_max] incur no penalty.
# Values within [min, ideal_min) or (ideal_max, max] incur partial penalty.
# Values outside [min, max] incur full penalty.

CROP_RANGES: dict[str, dict[str, tuple]] = {
    "Rice": {
        "temperature": (15, 22, 32, 40),   # °C
        "rainfall":    (800, 1200, 2000, 3000),  # mm
        "soil_ph":     (5.0, 5.5, 7.0, 8.0),
    },
    "Wheat": {
        "temperature": (5, 12, 22, 30),
        "rainfall":    (300, 500, 900, 1200),
        "soil_ph":     (5.5, 6.0, 7.5, 8.5),
    },
    "Tomato": {
        "temperature": (10, 18, 28, 38),
        "rainfall":    (400, 600, 1200, 1800),
        "soil_ph":     (5.5, 6.0, 7.0, 8.0),
    },
    "Maize": {
        "temperature": (10, 18, 30, 40),
        "rainfall":    (500, 700, 1200, 1800),
        "soil_ph":     (5.5, 6.0, 7.5, 8.5),
    },
    "Potato": {
        "temperature": (7, 14, 22, 30),
        "rainfall":    (400, 600, 1000, 1500),
        "soil_ph":     (4.8, 5.0, 6.5, 7.5),
    },
}

# Default ranges used when crop not found in CROP_RANGES
DEFAULT_RANGES = {
    "temperature": (10, 20, 30, 40),
    "rainfall":    (400, 700, 1500, 2500),
    "soil_ph":     (5.5, 6.0, 7.5, 8.5),
}

# ─── Human-readable Ideal Conditions per Crop ──────────────────────────────────
# Used for advisory display, documentation, and API responses.
IDEAL_CONDITIONS: dict[str, dict] = {
    "Rice": {
        "min_temp":       22,    # °C
        "max_temp":       32,    # °C
        "min_rainfall":   1200,  # mm per season
        "max_rainfall":   2000,  # mm per season
        "ideal_ph_range": (5.5, 7.0),
    },
    "Wheat": {
        "min_temp":       12,
        "max_temp":       22,
        "min_rainfall":   500,
        "max_rainfall":   900,
        "ideal_ph_range": (6.0, 7.5),
    },
    "Tomato": {
        "min_temp":       18,
        "max_temp":       28,
        "min_rainfall":   600,
        "max_rainfall":   1200,
        "ideal_ph_range": (6.0, 7.0),
    },
    "Potato": {
        "min_temp":       14,
        "max_temp":       22,
        "min_rainfall":   600,
        "max_rainfall":   1000,
        "ideal_ph_range": (5.0, 6.5),
    },
    "Maize": {
        "min_temp":       18,
        "max_temp":       30,
        "min_rainfall":   700,
        "max_rainfall":   1200,
        "ideal_ph_range": (6.0, 7.5),
    },
}


def _stress_factor(value: float, mn: float, ideal_min: float, ideal_max: float, mx: float) -> float:
    """
    Returns a stress multiplier in [0.0, 1.0].
      1.0 = no stress (ideal range)
      0.5 = moderate stress (acceptable but sub-optimal)
      0.0 = full stress (outside viable range)
    """
    if ideal_min <= value <= ideal_max:
        return 1.0
    if mn <= value < ideal_min:
        # Linear interpolation from 0.5 at mn to 1.0 at ideal_min
        return 0.5 + 0.5 * (value - mn) / (ideal_min - mn + 1e-9)
    if ideal_max < value <= mx:
        # Linear interpolation from 1.0 at ideal_max to 0.5 at mx
        return 0.5 + 0.5 * (mx - value) / (mx - ideal_max + 1e-9)
    # Outside [mn, mx] → full stress
    return 0.0


def _temperature_penalty(temp: float, ranges: dict) -> tuple[float, str | None]:
    """
    Returns (penalty_fraction, warning).
    - Within ideal range         → 0% penalty
    - Outside ideal, within viable → 10–30% penalty (linearly interpolated)
    - Outside viable range       → 30% penalty (capped)
    """
    mn, ideal_min, ideal_max, mx = ranges["temperature"]
    warning = None

    if ideal_min <= temp <= ideal_max:
        return 0.0, None

    if temp < ideal_min:
        if temp < mn:
            penalty = 0.30
            warning = f"Temperature {temp}°C is below the survivable minimum ({mn}°C). Severe cold stress. Yield reduced 30%."
        else:
            # Interpolate penalty from 10% at ideal_min to 30% at mn
            ratio = (ideal_min - temp) / (ideal_min - mn + 1e-9)
            penalty = 0.10 + 0.20 * ratio
            warning = f"Temperature {temp}°C is too cold (ideal: {ideal_min}–{ideal_max}°C). Yield reduced ~{penalty*100:.0f}%."

    else:  # temp > ideal_max
        if temp > mx:
            penalty = 0.30
            warning = f"Temperature {temp}°C exceeds the survivable maximum ({mx}°C). Severe heat stress. Yield reduced 30%."
        else:
            # Interpolate penalty from 10% at ideal_max to 30% at mx
            ratio = (temp - ideal_max) / (mx - ideal_max + 1e-9)
            penalty = 0.10 + 0.20 * ratio
            warning = f"Temperature {temp}°C is too hot (ideal: {ideal_min}–{ideal_max}°C). Yield reduced ~{penalty*100:.0f}%."

    return round(penalty, 4), warning


def _rainfall_penalty(rain: float, ranges: dict) -> tuple[float, str | None]:
    """
    Returns (penalty_fraction, warning).
    - Excess rainfall (above max viable) → 15% penalty
    - Within or below range             → 0% penalty (drought handled via irrigation)
    """
    _, _, ideal_max, mx = ranges["rainfall"]

    if rain > mx:
        return 0.15, (
            f"Rainfall {rain}mm is excessively high (max viable: {mx}mm). "
            f"Risk of waterlogging and root rot. Yield reduced 15%."
        )
    if rain > ideal_max:
        return 0.15, (
            f"Rainfall {rain}mm exceeds the ideal range (ideal max: {ideal_max}mm). "
            f"Moderate waterlogging risk. Yield reduced 15%."
        )
    return 0.0, None


def _ph_penalty(ph: float, ranges: dict) -> tuple[float, str | None]:
    """
    Returns (penalty_fraction, warning).
    - Outside ideal pH range → 10% penalty
    - Within ideal range     → 0% penalty
    """
    _, ideal_min, ideal_max, _ = ranges["soil_ph"]

    if ph < ideal_min:
        return 0.10, (
            f"Soil pH {ph} is below the ideal range ({ideal_min}–{ideal_max}). "
            f"Nutrient deficiencies likely. Yield reduced 10%."
        )
    if ph > ideal_max:
        return 0.10, (
            f"Soil pH {ph} is above the ideal range ({ideal_min}–{ideal_max}). "
            f"Micronutrient lockout possible. Yield reduced 10%."
        )
    return 0.0, None


def _risk_from_loss(loss_pct: float) -> str:
    """Classify risk level based on total yield loss percentage."""
    if loss_pct <= 0.10:
        return "Low"
    elif loss_pct <= 0.30:
        return "Medium"
    else:
        return "High"


def analyze_environment(
    input_data: dict[str, Any],
    crop_name: str,
    predicted_yield: float
) -> dict[str, Any]:
    """
    Adjusts predicted yield based on environmental stress penalties.

    Penalties applied:
      - Temperature out of range → 10–30% reduction
      - Excess rainfall          → 15% reduction
      - Soil pH out of range     → 10% reduction

    Penalties are combined multiplicatively:
      adjusted_yield = predicted_yield × (1 - temp_p) × (1 - rain_p) × (1 - ph_p)

    Risk level:
      - Low    → 0–10% total loss
      - Medium → 10–30% total loss
      - High   → >30% total loss

    Args:
        input_data (dict): Farm conditions with Temperature_C, Rainfall_mm, Soil_pH.
        crop_name (str): Crop name.
        predicted_yield (float): Base ML-predicted yield in tons/acre.

    Returns:
        dict: adjusted_yield, risk_level, warnings (list of advisory messages).
    """
    ranges = CROP_RANGES.get(crop_name, DEFAULT_RANGES)

    temperature = float(input_data.get("Temperature_C", 27.0))
    rainfall    = float(input_data.get("Rainfall_mm", 850.0))
    soil_ph     = float(input_data.get("Soil_pH", 7.0))

    # Compute individual penalties
    temp_p, temp_warn = _temperature_penalty(temperature, ranges)
    rain_p, rain_warn = _rainfall_penalty(rainfall, ranges)
    ph_p,   ph_warn   = _ph_penalty(soil_ph, ranges)

    # Combine multiplicatively: each penalty compounds on the remaining yield
    retention = (1 - temp_p) * (1 - rain_p) * (1 - ph_p)
    adjusted_yield = round(predicted_yield * retention, 3)

    # Total loss percentage for risk classification
    total_loss = 1 - retention
    risk_level = _risk_from_loss(total_loss)

    # Collect warnings (skip None entries)
    warnings = [w for w in [temp_warn, rain_warn, ph_warn] if w]

    return {
        "adjusted_yield": adjusted_yield,
        "risk_level":     risk_level,
        "warnings":       warnings
    }


# ─── Advisory Generator ─────────────────────────────────────────────────────────

def generate_advisories(input_data: dict[str, Any], crop_name: str) -> list[str]:
    """
    Generates farmer-friendly actionable advisory messages based on
    farm conditions and crop-specific thresholds.

    Covers: temperature, rainfall, soil pH, irrigation, fertilizer,
            soil type, and seasonal guidance.

    Args:
        input_data (dict): Preprocessed farm condition fields.
        crop_name  (str):  Target crop name.

    Returns:
        list[str]: Ordered list of plain-language advisory suggestions.
    """
    advisories: list[str] = []
    ranges = CROP_RANGES.get(crop_name, DEFAULT_RANGES)
    ideal  = IDEAL_CONDITIONS.get(crop_name, {})

    temp       = float(input_data.get("Temperature_C", 27.0))
    rainfall   = float(input_data.get("Rainfall_mm", 850.0))
    soil_ph    = float(input_data.get("Soil_pH", 7.0))
    irrigation = str(input_data.get("Irrigation_Type", "")).lower()
    fertilizer = float(input_data.get("Fertilizer_Used_kg", 110.0))
    soil_type  = str(input_data.get("Soil_Type", "")).lower()
    season     = str(input_data.get("Season", "")).lower()

    _, ideal_min_temp, ideal_max_temp, _ = ranges["temperature"]
    _, _, ideal_max_rain, max_rain       = ranges["rainfall"]
    _, ideal_min_ph, ideal_max_ph, _     = ranges["soil_ph"]

    # ── Temperature advisories ────────────────────────────────────────────────
    if temp > ideal_max_temp:
        advisories.append(
            "🌡️ High temperature detected. Consider mulching to retain soil moisture "
            "and reduce surface heat stress on roots."
        )
        if temp > ideal_max_temp + 5:
            advisories.append(
                "☀️ Extreme heat alert. Use shade nets or row covers during peak afternoon "
                "hours to protect crops from scorching."
            )
    elif temp < ideal_min_temp:
        advisories.append(
            "🥶 Low temperature detected. Use frost covers or plastic mulch at night "
            "to retain ground warmth and protect seedlings."
        )
        if temp < ideal_min_temp - 5:
            advisories.append(
                "❄️ Frost risk. Delay sowing until temperatures stabilize. "
                "Consider a greenhouse start for seedlings."
            )

    # ── Rainfall advisories ───────────────────────────────────────────────────
    if rainfall > max_rain:
        advisories.append(
            "🌧️ Excessive rainfall. Reduce irrigation frequency and ensure proper "
            "field drainage to prevent waterlogging and root rot."
        )
        advisories.append(
            "💧 Consider creating raised beds or drainage channels to channel "
            "excess water away from the root zone."
        )
    elif rainfall > ideal_max_rain:
        advisories.append(
            "🌦️ Above-ideal rainfall. Reduce irrigation frequency and monitor "
            "fields for early signs of waterlogging."
        )
    elif rainfall < ranges["rainfall"][0]:
        advisories.append(
            "🏜️ Critically low rainfall. Increase irrigation frequency and consider "
            "drip irrigation to conserve water and maintain root moisture."
        )

    # ── Soil pH advisories ────────────────────────────────────────────────────
    if soil_ph < ideal_min_ph:
        advisories.append(
            f"🧪 Soil is too acidic (pH {soil_ph}). Apply agricultural lime (calcium "
            f"carbonate) to raise pH towards the ideal range of {ideal_min_ph}–{ideal_max_ph}."
        )
    elif soil_ph > ideal_max_ph:
        advisories.append(
            f"🧪 Soil is too alkaline (pH {soil_ph}). Apply elemental sulfur or "
            f"acidifying fertilizers to lower pH towards {ideal_min_ph}–{ideal_max_ph}."
        )

    # ── Irrigation type advisories ────────────────────────────────────────────
    if rainfall > ideal_max_rain and irrigation == "flood":
        advisories.append(
            "🚿 Switch from flood irrigation to drip or sprinkler systems during "
            "high-rainfall periods to avoid over-saturation."
        )
    if irrigation == "rainfed" and rainfall < ranges["rainfall"][0]:
        advisories.append(
            "💦 Rainfed irrigation is insufficient under current drought conditions. "
            "Install supplemental drip or sprinkler irrigation urgently."
        )

    # ── Fertilizer advisories ─────────────────────────────────────────────────
    if fertilizer > 180:
        advisories.append(
            "⚗️ Fertilizer usage is very high. Excess nitrogen can cause leaf burn "
            "and runoff pollution. Consider a split application schedule."
        )
    elif fertilizer < 40:
        advisories.append(
            f"🌿 Fertilizer level is low for {crop_name}. Increase application "
            f"gradually and consider a soil nutrient test before the next season."
        )

    # ── Soil type advisories ──────────────────────────────────────────────────
    if soil_type == "sandy":
        advisories.append(
            "🪨 Sandy soil drains quickly. Add organic compost or mulch to improve "
            "water retention and nutrient-holding capacity."
        )
    elif soil_type == "clay":
        advisories.append(
            "🟤 Clay soil retains excess moisture. Improve aeration by adding "
            "organic matter or sand to prevent compaction and root rot."
        )
    elif soil_type == "peaty":
        advisories.append(
            "🌱 Peaty soil is naturally acidic. Monitor pH closely and apply lime "
            "periodically, especially for pH-sensitive crops."
        )

    # ── Seasonal advisories ───────────────────────────────────────────────────
    if "summer" in season and crop_name in ("Wheat", "Potato"):
        advisories.append(
            f"📅 {crop_name} is generally not ideal for summer growing. "
            f"Consider switching to a Rabi or Kharif season for better yield."
        )
    if "kharif" in season and crop_name == "Potato":
        advisories.append(
            "📅 Potato performs best in Rabi season (cool weather). "
            "Kharif planting may reduce tuber quality and yield."
        )

    # ── No issues found ───────────────────────────────────────────────────────
    if not advisories:
        advisories.append(
            f"✅ Farm conditions look good for {crop_name}. "
            f"Maintain current practices and monitor the crop weekly."
        )

    return advisories
