import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Sprout, Thermometer, CloudRain, FlaskConical, Droplets, Map, AlertCircle } from 'lucide-react';
import { predictCrop } from '../services/api';
import LoadingOverlay from '../components/ui/LoadingOverlay';
import ErrorState from '../components/ui/ErrorState';
import { fadeUp } from '../utils/animations';
import { useNavigate } from 'react-router-dom';

// ── Constants ─────────────────────────────────────────────────────────────────
const SOIL_TYPES = ['Loamy', 'Sandy', 'Clay', 'Silty', 'Peaty'];
const IRRIGATION_TYPES = ['Drip', 'Sprinkler', 'Flood', 'Rainfed'];
const SEASONS = ['Kharif', 'Rabi', 'Summer'];

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
};

// ── Reusable field components ─────────────────────────────────────────────────
function SliderField({ label, icon: Icon, name, min, max, step = 1, unit, value, onChange, error }) {
    const pct = ((value - min) / (max - min)) * 100;
    return (
        <div className="space-y-1.5">
            <div className="flex items-center justify-between">
                <label className="flex items-center gap-1.5 text-sm font-medium text-slate-700">
                    <Icon className="w-4 h-4 text-slate-400" />{label}
                </label>
                <span className="text-sm font-semibold text-green-700 bg-green-50 px-2 py-0.5 rounded-md">{value} {unit}</span>
            </div>
            <div className="relative h-5 flex items-center">
                <div className="absolute inset-x-0 h-1.5 rounded-full bg-slate-200" />
                <div className="absolute left-0 h-1.5 rounded-full bg-green-500 pointer-events-none" style={{ width: `${pct}%` }} />
                <input type="range" min={min} max={max} step={step} value={value}
                    onChange={e => onChange(name, step < 1 ? parseFloat(e.target.value) : parseInt(e.target.value))}
                    className="relative w-full h-1.5 appearance-none bg-transparent cursor-pointer accent-green-600" />
            </div>
            <div className="flex items-center justify-between px-0.5">
                <span className="text-[11px] font-medium text-slate-500 bg-slate-100 px-1.5 py-0.5 rounded">{min}{unit}</span>
                <div className="flex gap-1 items-center">
                    {[25, 50, 75].map(tick => {
                        const tv = min + ((max - min) * tick / 100);
                        const active = pct >= tick;
                        return (
                            <div key={tick} className="flex flex-col items-center gap-0.5">
                                <div className={`w-px h-1.5 rounded-full ${active ? 'bg-green-400' : 'bg-slate-300'}`} />
                                <span className={`text-[9px] tabular-nums ${active ? 'text-green-600 font-semibold' : 'text-slate-400'}`}>
                                    {Number.isInteger(step) ? Math.round(tv) : tv.toFixed(1)}
                                </span>
                            </div>
                        );
                    })}
                </div>
                <span className="text-[11px] font-medium text-slate-500 bg-slate-100 px-1.5 py-0.5 rounded">{max}{unit}</span>
            </div>
            {error && <p className="flex items-center gap-1 text-xs text-red-500 mt-0.5"><AlertCircle className="w-3 h-3" />{error}</p>}
        </div>
    );
}

function SelectField({ label, name, options, value, onChange }) {
    return (
        <div className="space-y-1.5">
            <label className="block text-sm font-medium text-slate-700">{label}</label>
            <select value={value} onChange={e => onChange(name, e.target.value)}
                className="w-full px-3 py-2.5 text-sm bg-white border border-slate-200 rounded-lg text-slate-700 focus:outline-none focus:ring-2 focus:ring-green-400 transition">
                {options.map(o => <option key={o} value={o}>{o}</option>)}
            </select>
        </div>
    );
}

function NumberField({ label, name, min, max, unit, value, onChange }) {
    return (
        <div className="space-y-1.5">
            <label className="block text-sm font-medium text-slate-700">{label}</label>
            <div className="relative">
                <input type="number" min={min} max={max} value={value}
                    onChange={e => onChange(name, parseFloat(e.target.value))}
                    className="w-full px-3 py-2.5 pr-14 text-sm border border-slate-200 bg-white rounded-lg focus:outline-none focus:ring-2 focus:ring-green-400 transition" />
                {unit && <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-400 pointer-events-none">{unit}</span>}
            </div>
        </div>
    );
}

function Card({ title, subtitle, children }) {
    return (
        <motion.div variants={fadeUp} initial="hidden" animate="visible"
            className="bg-white border border-slate-100 rounded-2xl shadow-sm overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-50 bg-slate-50/50">
                <h2 className="text-base font-semibold text-slate-800">{title}</h2>
                {subtitle && <p className="text-xs text-slate-400 mt-0.5">{subtitle}</p>}
            </div>
            <div className="px-6 py-5 space-y-5">{children}</div>
        </motion.div>
    );
}

// ── Main Page ─────────────────────────────────────────────────────────────────
export default function CropPredictor() {
    const [form, setForm] = useState(INITIAL);
    const [loading, setLoading] = useState(false);
    const [apiError, setApiError] = useState('');
    const navigate = useNavigate();

    const set = (name, value) => setForm(prev => ({ ...prev, [name]: value }));

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setApiError('');
        try {
            const data = await predictCrop(form);
            const crop = data.recommended_crop;
            sessionStorage.setItem('cropResult', JSON.stringify(crop));
            // save form data so YieldResult CTA can pre-fill YieldPredictor
            sessionStorage.setItem('cropPrefillForYield', JSON.stringify({ ...form, crop_name: crop, acres: form.Farm_Area_acres }));
            navigate('/crop-result');
        } catch (err) {
            setApiError(err.userMessage || 'Prediction failed. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="max-w-3xl mx-auto px-4 sm:px-6 py-10">
            <LoadingOverlay show={loading} message="Analyzing farm conditions…" />

            {/* Header */}
            <motion.div variants={fadeUp} initial="hidden" animate="visible" className="mb-8">
                <div className="flex items-center gap-3 mb-2">
                    <div className="p-2 bg-green-100 rounded-xl">
                        <Sprout className="w-5 h-5 text-green-600" />
                    </div>
                    <h1 className="text-2xl font-bold text-slate-900">Crop Predictor</h1>
                </div>
                <p className="text-slate-500 text-sm pl-[52px]">
                    Enter your farm conditions and let our ML model recommend the best crop.
                </p>
            </motion.div>

            {apiError ? (
                <ErrorState message={apiError} onRetry={() => setApiError('')} />
            ) : (
                <form onSubmit={handleSubmit} noValidate className="space-y-5">
                    <Card title="🌡️ Environmental Conditions" subtitle="Local climate and soil properties">
                        <SliderField label="Temperature" icon={Thermometer} name="Temperature_C" min={-10} max={55} step={0.5} unit="°C" value={form.Temperature_C} onChange={set} />
                        <SliderField label="Rainfall" icon={CloudRain} name="Rainfall_mm" min={0} max={5000} step={10} unit="mm" value={form.Rainfall_mm} onChange={set} />
                        <SliderField label="Soil pH" icon={FlaskConical} name="Soil_pH" min={3} max={10} step={0.1} unit="" value={form.Soil_pH} onChange={set} />
                        <div className="grid grid-cols-2 gap-4 pt-1">
                            <SelectField label="Soil Type" name="Soil_Type" options={SOIL_TYPES} value={form.Soil_Type} onChange={set} />
                            <SelectField label="Season" name="Season" options={SEASONS} value={form.Season} onChange={set} />
                        </div>
                    </Card>

                    <Card title="💧 Farm Resources" subtitle="Land size, water and fertilizer">
                        <SliderField label="Farm Area" icon={Map} name="Farm_Area_acres" min={0.5} max={500} step={0.5} unit="acres" value={form.Farm_Area_acres} onChange={set} />
                        <SliderField label="Water / Week" icon={Droplets} name="Water_Availability_L_per_week" min={500} max={50000} step={100} unit="L" value={form.Water_Availability_L_per_week} onChange={set} />
                        <div className="grid grid-cols-2 gap-4">
                            <SelectField label="Irrigation Type" name="Irrigation_Type" options={IRRIGATION_TYPES} value={form.Irrigation_Type} onChange={set} />
                            <NumberField label="Fertilizer Used" name="Fertilizer_Used_kg" min={0} max={500} unit="kg" value={form.Fertilizer_Used_kg} onChange={set} />
                        </div>
                    </Card>

                    <motion.button type="submit" disabled={loading} whileTap={{ scale: 0.97 }}
                        className="w-full flex items-center justify-center gap-2 px-6 py-3.5 bg-green-600 text-white font-semibold rounded-xl shadow-md shadow-green-200 hover:bg-green-700 disabled:opacity-60 disabled:cursor-not-allowed transition-all text-base">
                        <Sprout className="w-4 h-4" />
                        Predict Best Crop
                    </motion.button>
                </form>
            )}
        </div>
    );
}
