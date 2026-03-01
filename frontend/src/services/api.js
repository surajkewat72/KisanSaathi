import axios from 'axios';

// ── Axios Instance ─────────────────────────────────────────────────────────────
const api = axios.create({
    baseURL: process.env.REACT_APP_FASTAPI_URL || 'http://127.0.0.1:8000',
    headers: { 'Content-Type': 'application/json' },
    timeout: 30000, // 30 s — model inference can be slow
});

// ── Global Request Interceptor ─────────────────────────────────────────────────
api.interceptors.request.use(
    (config) => config,
    (error) => Promise.reject(error)
);

// ── Global Response / Error Interceptor ───────────────────────────────────────
api.interceptors.response.use(
    (response) => response,
    (error) => {
        const status = error.response?.status;
        const detail = error.response?.data?.detail;

        // Map known HTTP status codes to readable messages
        const messages = {
            400: detail || 'Invalid input. Please check your farm details.',
            404: 'Requested resource not found.',
            422: 'Validation error. Some fields are missing or incorrect.',
            500: 'Server error. The model or backend is unavailable.',
        };

        const message = messages[status]
            ?? detail
            ?? error.message
            ?? 'An unexpected error occurred.';

        // Attach a clean message so components can display it directly
        error.userMessage = message;

        console.error(`[API Error ${status}]`, message);
        return Promise.reject(error);
    }
);

// ── Endpoint Functions ─────────────────────────────────────────────────────────

/**
 * POST /generate-farm-plan
 * Predicts best crop, optimises resource allocation, and runs env analysis.
 *
 * @param {object} data — FarmPlanInput fields
 * @returns {Promise<object>} { predicted_crop, candidate_crops, farm_plan,
 *                              total_expected_profit, sustainability_score }
 */
export const generateFarmPlan = (data) =>
    api.post('/generate-farm-plan', data).then(r => r.data);

/**
 * POST /predict-crop
 * Returns the ML-recommended crop for the given farm conditions.
 */
export const predictCrop = (data) =>
    api.post('/predict-crop', data).then(r => r.data);

/**
 * POST /predict-yield
 * Returns yield per acre, total production, and expected profit.
 */
export const predictYield = (data) =>
    api.post('/predict-yield', data).then(r => r.data);

/**
 * POST /optimize-allocation
 * LP-optimises land allocation across candidate crops.
 */
export const optimizeAllocation = (data) =>
    api.post('/optimize-allocation', data).then(r => r.data);

export default api;
