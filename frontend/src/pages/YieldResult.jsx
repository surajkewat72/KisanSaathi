import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { TrendingUp, ArrowLeft } from 'lucide-react';
import { fadeUp } from '../utils/animations';

const CROP_ICONS = {
    Rice: '🌾', Wheat: '🌾', Tomato: '🍅', Maize: '🌽', Potato: '🥔',
};

function StatCard({ label, value, accent }) {
    return (
        <div className={`bg-white border rounded-2xl p-5 shadow-sm ${accent ? 'border-emerald-200 bg-emerald-50' : 'border-slate-100'}`}>
            <p className="text-xs text-slate-400 mb-1">{label}</p>
            <p className={`text-xl font-bold ${accent ? 'text-emerald-700' : 'text-slate-800'}`}>{value}</p>
        </div>
    );
}

export default function YieldResult() {
    const navigate = useNavigate();
    const [data, setData] = useState(null);

    useEffect(() => {
        const raw = sessionStorage.getItem('yieldResult');
        if (raw) {
            try { setData(JSON.parse(raw)); }
            catch { /* ignore */ }
        }
    }, []);

    if (!data) {
        return (
            <div className="max-w-xl mx-auto px-6 py-20 text-center">
                <p className="text-slate-500 mb-4">No yield result found.</p>
                <button onClick={() => navigate('/yield-predictor')}
                    className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white rounded-xl text-sm font-semibold hover:bg-emerald-700 transition">
                    <ArrowLeft className="w-4 h-4" /> Back to Yield Predictor
                </button>
            </div>
        );
    }

    const icon = CROP_ICONS[data.crop] ?? '🌿';
    const fmt = (n) => `₹${Number(n).toLocaleString('en-IN', { maximumFractionDigits: 0 })}`;

    return (
        <div className="max-w-2xl mx-auto px-4 sm:px-6 py-10 space-y-6">

            {/* Header */}
            <motion.div variants={fadeUp} initial="hidden" animate="visible"
                className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <div className="p-2 bg-emerald-100 rounded-xl">
                        <TrendingUp className="w-5 h-5 text-emerald-600" />
                    </div>
                    <div>
                        <h1 className="text-2xl font-bold text-slate-900">Yield Forecast Result</h1>
                    </div>
                </div>
                <button onClick={() => navigate('/yield-predictor')}
                    className="inline-flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 text-slate-600 rounded-xl text-sm font-semibold hover:shadow-sm transition">
                    <ArrowLeft className="w-4 h-4" /> Re-predict
                </button>
            </motion.div>

            {/* Hero banner */}
            <motion.div
                initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.45, ease: 'easeOut' }}
                className="bg-gradient-to-br from-emerald-600 to-teal-700 rounded-2xl p-8 text-white shadow-2xl shadow-emerald-100 relative overflow-hidden">
                <div aria-hidden className="absolute top-0 right-0 w-48 h-48 rounded-full bg-white/5 -translate-y-1/2 translate-x-1/4" />

                <div className="relative z-10 flex items-center gap-5 mb-6">
                    <span className="text-5xl">{icon}</span>
                    <div>
                        <p className="text-white/60 text-xs uppercase tracking-widest mb-0.5">Crop</p>
                        <p className="text-3xl font-extrabold">{data.crop}</p>
                        <p className="text-white/50 text-xs mt-0.5">{data.acres} acre{data.acres !== 1 ? 's' : ''} allocated</p>
                    </div>
                </div>

                <div className="grid grid-cols-3 gap-4 relative z-10">
                    <div>
                        <p className="text-white/60 text-xs mb-1">Yield / Acre</p>
                        <p className="text-2xl font-bold">{data.yield_per_acre} t</p>
                    </div>
                    <div>
                        <p className="text-white/60 text-xs mb-1">Total Production</p>
                        <p className="text-2xl font-bold">{data.total_production_tons} t</p>
                    </div>
                    <div>
                        <p className="text-white/60 text-xs mb-1">Expected Profit</p>
                        <p className="text-2xl font-bold text-yellow-300">{fmt(data.profit)}</p>
                    </div>
                </div>
            </motion.div>

            {/* Breakdown tiles */}
            <motion.div variants={fadeUp} initial="hidden" animate="visible"
                className="grid grid-cols-2 gap-4">
                <StatCard label="Yield per Acre" value={`${data.yield_per_acre} tonnes`} />
                <StatCard label="Total Production" value={`${data.total_production_tons} tonnes`} />
                <StatCard label="Expected Profit" value={fmt(data.profit)} accent />
                <StatCard label="Land Allocated" value={`${data.acres} acres`} />
            </motion.div>

        </div>
    );
}
