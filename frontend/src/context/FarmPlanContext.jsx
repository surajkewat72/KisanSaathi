import React, { createContext, useContext, useState, useCallback } from 'react';

const STORAGE_KEY = 'kisansaathi_farm_plan';

// ── Helpers ────────────────────────────────────────────────────────────────────
function load() {
    try {
        const raw = localStorage.getItem(STORAGE_KEY);
        return raw ? JSON.parse(raw) : null;
    } catch {
        return null;
    }
}

function save(data) {
    try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    } catch {
        // storage quota exceeded — silently ignore
    }
}

// ── Context ────────────────────────────────────────────────────────────────────
const FarmPlanContext = createContext(null);

/**
 * FarmPlanProvider — wraps the app and exposes farmPlan state + helpers.
 *
 * State shape:
 *   {
 *     result:   object | null   → API response from /generate-farm-plan
 *     formData: object | null   → The input form values used
 *   }
 */
export function FarmPlanProvider({ children }) {
    const [state, setState] = useState(() => load() ?? { result: null, formData: null });

    const setFarmPlan = useCallback((result, formData) => {
        const next = { result, formData };
        setState(next);
        save(next);
    }, []);

    const clearFarmPlan = useCallback(() => {
        setState({ result: null, formData: null });
        localStorage.removeItem(STORAGE_KEY);
    }, []);

    return (
        <FarmPlanContext.Provider value={{ ...state, setFarmPlan, clearFarmPlan }}>
            {children}
        </FarmPlanContext.Provider>
    );
}

/**
 * useFarmPlan — hook to access farm plan context.
 * Returns: { result, formData, setFarmPlan, clearFarmPlan }
 */
export function useFarmPlan() {
    const ctx = useContext(FarmPlanContext);
    if (!ctx) throw new Error('useFarmPlan must be used inside <FarmPlanProvider>');
    return ctx;
}
