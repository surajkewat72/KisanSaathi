import React from 'react';
import { Link } from 'react-router-dom';
import { BarChart2, ArrowLeft, Trash2 } from 'lucide-react';
import { motion } from 'framer-motion';

import { useFarmPlan } from '../context/FarmPlanContext';
import { fadeUp } from '../utils/animations';

// ── Placeholder until dashboard components are wired ──────────────────────────
export default function FarmDashboard() {
    const { result, clearFarmPlan } = useFarmPlan();

    // ── Empty state — no plan generated yet ─────────────────────────────────────
    if (!result) {
        return (
            <div className="flex flex-col items-center justify-center py-28 px-6 text-center">
                <div className="p-4 bg-blue-50 rounded-2xl mb-5">
                    <BarChart2 className="w-9 h-9 text-blue-400" />
                </div>
                <h2 className="text-xl font-bold text-slate-800 mb-2">No farm plan yet</h2>
                <p className="text-sm text-slate-500 max-w-xs mb-7">
                    Generate a farm plan first to see insights, yield predictions, and advisories here.
                </p>
                <Link
                    to="/planner"
                    className="inline-flex items-center gap-2 px-5 py-2.5 bg-green-600 text-white text-sm font-semibold rounded-xl hover:bg-green-700 transition"
                >
                    <ArrowLeft className="w-4 h-4" />
                    Go to Planner
                </Link>
            </div>
        );
    }

    // ── Dashboard with data ──────────────────────────────────────────────────────
    return (
        <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8 space-y-6">

            {/* Header */}
            <motion.div
                variants={fadeUp} initial="hidden" animate="visible"
                className="flex items-center justify-between"
            >
                <div>
                    <h1 className="text-2xl font-bold text-slate-900">Farm Dashboard</h1>
                    <p className="text-sm text-slate-500 mt-0.5">
                        Results for your farm plan — {result.predicted_crop} recommended
                    </p>
                </div>
                <div className="flex gap-2">
                    <Link
                        to="/planner"
                        className="inline-flex items-center gap-1.5 px-4 py-2 text-sm font-medium text-slate-600 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 transition"
                    >
                        <ArrowLeft className="w-3.5 h-3.5" />
                        New Plan
                    </Link>
                    <button
                        onClick={clearFarmPlan}
                        className="inline-flex items-center gap-1.5 px-4 py-2 text-sm font-medium text-red-600 bg-red-50 border border-red-100 rounded-lg hover:bg-red-100 transition"
                    >
                        <Trash2 className="w-3.5 h-3.5" />
                        Clear
                    </button>
                </div>
            </motion.div>

            {/* Raw summary — cards will replace this soon */}
            <motion.div
                variants={fadeUp} initial="hidden" animate="visible" custom={1}
                className="bg-white border border-slate-100 rounded-2xl shadow-sm p-6 grid grid-cols-2 sm:grid-cols-3 gap-5"
            >
                <Stat label="Recommended Crop" value={result.predicted_crop} />
                <Stat label="Total Profit" value={`₹${result.total_expected_profit?.toLocaleString('en-IN')}`} />
                <Stat label="Sustainability Score" value={`${result.sustainability_score} / 100`} />
            </motion.div>

            {/* Farm plan table */}
            <motion.div
                variants={fadeUp} initial="hidden" animate="visible" custom={2}
                className="bg-white border border-slate-100 rounded-2xl shadow-sm overflow-hidden"
            >
                <div className="px-6 py-4 border-b border-slate-50 bg-slate-50/50">
                    <h2 className="text-sm font-semibold text-slate-800">Per-Crop Breakdown</h2>
                </div>
                <div className="divide-y divide-slate-50">
                    {result.farm_plan?.map((crop) => (
                        <div key={crop.crop} className="px-6 py-4 grid grid-cols-2 sm:grid-cols-4 gap-3 text-sm">
                            <div>
                                <p className="text-xs text-slate-400 mb-0.5">Crop</p>
                                <p className="font-semibold text-slate-800">{crop.crop}</p>
                            </div>
                            <div>
                                <p className="text-xs text-slate-400 mb-0.5">Acres</p>
                                <p className="font-medium text-slate-700">{crop.acres}</p>
                            </div>
                            <div>
                                <p className="text-xs text-slate-400 mb-0.5">Adj. Yield</p>
                                <p className="font-medium text-slate-700">{crop.adjusted_yield} t/ac</p>
                            </div>
                            <div>
                                <p className="text-xs text-slate-400 mb-0.5">Risk</p>
                                <RiskBadge level={crop.risk_level} />
                            </div>
                        </div>
                    ))}
                </div>
            </motion.div>

        </div>
    );
}

// ── Helpers ────────────────────────────────────────────────────────────────────
function Stat({ label, value }) {
    return (
        <div>
            <p className="text-xs text-slate-400 mb-1">{label}</p>
            <p className="text-lg font-bold text-slate-900">{value}</p>
        </div>
    );
}

function RiskBadge({ level }) {
    const styles = {
        Low: 'bg-green-100 text-green-700',
        Medium: 'bg-yellow-100 text-yellow-700',
        High: 'bg-red-100 text-red-700',
    };
    return (
        <span className={`inline-flex px-2 py-0.5 rounded-full text-xs font-semibold ${styles[level] ?? styles.Low}`}>
            {level}
        </span>
    );
}
