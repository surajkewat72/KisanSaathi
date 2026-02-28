import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Thermometer, CloudRain, FlaskConical, Droplets, Map, Sprout, AlertCircle } from 'lucide-react';
import { generateFarmPlan } from '../services/api';
import LoadingOverlay from '../components/ui/LoadingOverlay';
import ErrorState from '../components/ui/ErrorState';
import { useFarmPlan } from '../context/FarmPlanContext';

// ── Defaults ───────────────────────────────────────────────────────────────────
const INITIAL = {
    Temperature_C: 23,
    Rainfall_mm: 850,
    Soil_pH: 6.5,
    Soil_Type: 'Loamy',
    Irrigation_Type: 'Drip',
    Season: 'Kharif',
    Farm_Area_acres: 10,
    Water_Availability_L_per_week: 2750,
    Fertilizer_Used_kg: 110,
    land_area: 10,
    water_available: 15000,
    fertilizer_available: 500,
};

const SOIL_TYPES = ['Loamy', 'Sandy', 'Clay', 'Silty', 'Peaty'];
const IRRIGATION_TYPES = ['Drip', 'Sprinkler', 'Flood', 'Rainfed'];
const SEASONS = ['Kharif', 'Rabi', 'Summer'];

// ── Validation ─────────────────────────────────────────────────────────────────
function validate(form) {
    const errs = {};
    if (form.Temperature_C < -10 || form.Temperature_C > 55)
        errs.Temperature_C = 'Temperature must be between -10°C and 55°C';
    if (form.Rainfall_mm < 0 || form.Rainfall_mm > 5000)
        errs.Rainfall_mm = 'Rainfall must be between 0 and 5000 mm';
    if (form.Soil_pH < 3 || form.Soil_pH > 10)
        errs.Soil_pH = 'Soil pH must be between 3.0 and 10.0';
    if (form.land_area <= 0 || form.land_area > 500)
        errs.land_area = 'Land area must be between 0.1 and 500 acres';
    if (form.water_available <= 0)
        errs.water_available = 'Water available must be greater than 0';
    if (form.fertilizer_available <= 0)
        errs.fertilizer_available = 'Fertilizer must be greater than 0';
    return errs;
}

// ── Reusable components ────────────────────────────────────────────────────────
function SliderField({ label, icon: Icon, name, min, max, step = 1, unit, value, onChange, error }) {
    // percentage fill for the coloured left-side track
    const pct = ((value - min) / (max - min)) * 100;

    return (
        <div className="space-y-1.5">
            <div className="flex items-center justify-between">
                <label className="flex items-center gap-1.5 text-sm font-medium text-slate-700">
                    <Icon className="w-4 h-4 text-slate-400" />
                    {label}
                </label>
                <span className="text-sm font-semibold text-green-700 bg-green-50 px-2 py-0.5 rounded-md">
                    {value} {unit}
                </span>
            </div>

            {/* Track wrapper — gives the gradient fill effect */}
            <div className="relative h-5 flex items-center">
                {/* Background track */}
                <div className="absolute inset-x-0 h-1.5 rounded-full bg-slate-200" />
                {/* Filled portion */}
                <div
                    className="absolute left-0 h-1.5 rounded-full bg-green-500 pointer-events-none"
                    style={{ width: `${pct}%` }}
                />
                {/* Range input on top */}
                <input
                    type="range" min={min} max={max} step={step} value={value}
                    onChange={e => onChange(name, step < 1 ? parseFloat(e.target.value) : parseInt(e.target.value))}
                    className="relative w-full h-1.5 appearance-none bg-transparent cursor-pointer accent-green-600"
                    style={{
                        WebkitAppearance: 'none',
                    }}
                />
            </div>

            {/* Scale: min — ticks — max */}
            <div className="flex items-center justify-between px-0.5">
                <span className="text-[11px] font-medium text-slate-500 bg-slate-100 px-1.5 py-0.5 rounded">
                    {min}{unit}
                </span>
                {/* Mid-point tick markers */}
                <div className="flex gap-1 items-center">
                    {[25, 50, 75].map(tick => {
                        const tickVal = min + ((max - min) * tick / 100);
                        const active = pct >= tick;
                        return (
                            <div key={tick} className="flex flex-col items-center gap-0.5">
                                <div className={`w-px h-1.5 rounded-full ${active ? 'bg-green-400' : 'bg-slate-300'}`} />
                                <span className={`text-[9px] tabular-nums ${active ? 'text-green-600 font-semibold' : 'text-slate-400'}`}>
                                    {Number.isInteger(step) ? Math.round(tickVal) : tickVal.toFixed(1)}
                                </span>
                            </div>
                        );
                    })}
                </div>
                <span className="text-[11px] font-medium text-slate-500 bg-slate-100 px-1.5 py-0.5 rounded">
                    {max}{unit}
                </span>
            </div>

            {error && (
                <p className="flex items-center gap-1 text-xs text-red-500 mt-0.5">
                    <AlertCircle className="w-3 h-3" />{error}
                </p>
            )}
        </div>
    );
}

function SelectField({ label, name, options, value, onChange }) {
    return (
        <div className="space-y-1.5">
            <label className="block text-sm font-medium text-slate-700">{label}</label>
            <select
                value={value}
                onChange={e => onChange(name, e.target.value)}
                className="w-full px-3 py-2.5 text-sm bg-white border border-slate-200 rounded-lg text-slate-700 focus:outline-none focus:ring-2 focus:ring-green-400 focus:border-transparent transition"
            >
                {options.map(o => <option key={o} value={o}>{o}</option>)}
            </select>
        </div>
    );
}

function NumberField({ label, name, min, max, unit, value, onChange, error }) {
    return (
        <div className="space-y-1.5">
            <label className="block text-sm font-medium text-slate-700">{label}</label>
            <div className="relative">
                <input
                    type="number" min={min} max={max} value={value}
                    onChange={e => onChange(name, parseFloat(e.target.value))}
                    className={`w-full px-3 py-2.5 pr-14 text-sm border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-400 focus:border-transparent transition ${error ? 'border-red-300 bg-red-50' : 'border-slate-200 bg-white'
                        }`}
                />
                {unit && (
                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-400 pointer-events-none">{unit}</span>
                )}
            </div>
            {error && (
                <p className="flex items-center gap-1 text-xs text-red-500">
                    <AlertCircle className="w-3 h-3" />{error}
                </p>
            )}
        </div>
    );
}

function Card({ title, subtitle, children }) {
    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="bg-white border border-slate-100 rounded-2xl shadow-sm overflow-hidden"
        >
            <div className="px-6 py-4 border-b border-slate-50 bg-slate-50/50">
                <h2 className="text-base font-semibold text-slate-800">{title}</h2>
                {subtitle && <p className="text-xs text-slate-400 mt-0.5">{subtitle}</p>}
            </div>
            <div className="px-6 py-5 space-y-5">{children}</div>
        </motion.div>
    );
}

// ── Main Page ──────────────────────────────────────────────────────────────────
export default function PlannerForm() {
    const [form, setForm] = useState(INITIAL);
    const [errors, setErrors] = useState({});
    const [loading, setLoading] = useState(false);
    const [apiError, setApiError] = useState('');
    const navigate = useNavigate();
    const { setFarmPlan } = useFarmPlan();

    const set = (name, value) => {
        setForm(prev => ({ ...prev, [name]: value }));
        // Clear field error on change
        if (errors[name]) setErrors(prev => { const e = { ...prev }; delete e[name]; return e; });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const errs = validate(form);
        if (Object.keys(errs).length) { setErrors(errs); return; }

        setLoading(true);
        setApiError('');
        try {
            const result = await generateFarmPlan(form);
            setFarmPlan(result, form);            // persist to context + localStorage
            navigate('/dashboard');               // no state needed — read from context
        } catch (err) {
            setApiError(err.userMessage || 'Something went wrong. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="max-w-3xl mx-auto px-4 sm:px-6 py-10">
            {/* Full-screen overlay while API is pending */}
            <LoadingOverlay show={loading} message="Analyzing farm conditions…" />

            {/* Full-screen error state — shown instead of form when API fails */}
            {apiError ? (
                <ErrorState
                    message={apiError}
                    onRetry={() => setApiError('')}
                />
            ) : (
                <>
                    <motion.div
                        initial={{ opacity: 0, y: -12 }} animate={{ opacity: 1, y: 0 }}
                        className="mb-8"
                    >
                        <div className="flex items-center gap-3 mb-2">
                            <div className="p-2 bg-green-100 rounded-xl">
                                <Sprout className="w-5 h-5 text-green-600" />
                            </div>
                            <h1 className="text-2xl font-bold text-slate-900">Farm Planner</h1>
                        </div>
                        <p className="text-slate-500 text-sm pl-[52px]">
                            Enter your farm conditions to generate a complete crop plan with yield predictions and advisories.
                        </p>
                    </motion.div>

                    <form onSubmit={handleSubmit} noValidate className="space-y-5">

                        {/* ── Card 1: Environmental Conditions ───────────── */}
                        <Card
                            title="🌡️ Environmental Conditions"
                            subtitle="Local climate and soil properties"
                        >
                            <SliderField
                                label="Temperature" icon={Thermometer} name="Temperature_C"
                                min={-10} max={55} step={0.5} unit="°C"
                                value={form.Temperature_C} onChange={set} error={errors.Temperature_C}
                            />
                            <SliderField
                                label="Rainfall" icon={CloudRain} name="Rainfall_mm"
                                min={0} max={5000} step={10} unit="mm"
                                value={form.Rainfall_mm} onChange={set} error={errors.Rainfall_mm}
                            />
                            <SliderField
                                label="Soil pH" icon={FlaskConical} name="Soil_pH"
                                min={3} max={10} step={0.1} unit=""
                                value={form.Soil_pH} onChange={set} error={errors.Soil_pH}
                            />
                            <div className="grid grid-cols-2 gap-4 pt-1">
                                <SelectField label="Soil Type" name="Soil_Type" options={SOIL_TYPES} value={form.Soil_Type} onChange={set} />
                                <SelectField label="Season" name="Season" options={SEASONS} value={form.Season} onChange={set} />
                            </div>
                        </Card>

                        {/* ── Card 2: Resource Availability ──────────────── */}
                        <Card
                            title="💧 Resource Availability"
                            subtitle="Land, water, and fertilizer constraints for optimization"
                        >
                            <SliderField
                                label="Land Area" icon={Map} name="land_area"
                                min={0.5} max={500} step={0.5} unit="acres"
                                value={form.land_area} onChange={set} error={errors.land_area}
                            />
                            <SliderField
                                label="Water Available" icon={Droplets} name="water_available"
                                min={500} max={100000} step={500} unit="L"
                                value={form.water_available} onChange={set} error={errors.water_available}
                            />
                            <div className="grid grid-cols-2 gap-4">
                                <NumberField
                                    label="Fertilizer Available" name="fertilizer_available"
                                    min={10} max={5000} unit="kg"
                                    value={form.fertilizer_available} onChange={set} error={errors.fertilizer_available}
                                />
                                <NumberField
                                    label="Fertilizer Used (current)" name="Fertilizer_Used_kg"
                                    min={0} max={500} unit="kg"
                                    value={form.Fertilizer_Used_kg} onChange={set}
                                />
                            </div>
                        </Card>

                        {/* ── Card 3: Advanced Inputs ─────────────────────── */}
                        <Card
                            title="⚙️ Advanced Inputs"
                            subtitle="Irrigation method and weekly water availability"
                        >
                            <div className="grid grid-cols-2 gap-4">
                                <SelectField
                                    label="Irrigation Type" name="Irrigation_Type"
                                    options={IRRIGATION_TYPES} value={form.Irrigation_Type} onChange={set}
                                />
                                <NumberField
                                    label="Farm Size" name="Farm_Area_acres"
                                    min={0.1} max={500} unit="acres"
                                    value={form.Farm_Area_acres} onChange={set}
                                />
                            </div>
                            <NumberField
                                label="Weekly Water Availability" name="Water_Availability_L_per_week"
                                min={100} max={50000} unit="L/week"
                                value={form.Water_Availability_L_per_week} onChange={set}
                            />
                        </Card>

                        {/* ── API error banner ────────────────────────────── */}
                        {apiError && (
                            <motion.div
                                initial={{ opacity: 0, y: -6 }} animate={{ opacity: 1, y: 0 }}
                                className="flex items-start gap-3 p-4 bg-red-50 border border-red-200 rounded-xl text-sm text-red-700"
                            >
                                <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
                                <span>{apiError}</span>
                            </motion.div>
                        )}

                        {/* ── Submit ──────────────────────────────────────── */}
                        <motion.button
                            type="submit" disabled={loading}
                            whileTap={{ scale: 0.97 }}
                            className="w-full flex items-center justify-center gap-2 px-6 py-3.5 bg-green-600 text-white font-semibold rounded-xl shadow-md shadow-green-200 hover:bg-green-700 disabled:opacity-60 disabled:cursor-not-allowed transition-all duration-200 text-base"
                        >
                            <Sprout className="w-4 h-4" />
                            Generate Farm Plan
                        </motion.button>

                    </form>
                </>
            )} {/* end apiError ternary */}
        </div>
    );
}

