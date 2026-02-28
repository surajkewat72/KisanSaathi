import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Sprout, ArrowLeft, Sparkles } from 'lucide-react';
import { fadeUp } from '../utils/animations';

const CROP_ICONS = {
    Rice: '🌾', Wheat: '🌾', Tomato: '🍅', Maize: '🌽', Potato: '🥔',
};

export default function CropResult() {
    const navigate = useNavigate();
    const [crop, setCrop] = useState(null);

    useEffect(() => {
        const raw = sessionStorage.getItem('cropResult');
        if (raw) {
            try { setCrop(JSON.parse(raw)); }
            catch { /* ignore */ }
        }
    }, []);

    if (!crop) {
        return (
            <div className="max-w-xl mx-auto px-6 py-20 text-center">
                <p className="text-slate-500 mb-4">No prediction result found.</p>
                <button onClick={() => navigate('/crop-predictor')}
                    className="inline-flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-xl text-sm font-semibold hover:bg-green-700 transition">
                    <ArrowLeft className="w-4 h-4" /> Back to Crop Predictor
                </button>
            </div>
        );
    }

    const icon = CROP_ICONS[crop] ?? '🌿';

    return (
        <div className="max-w-2xl mx-auto px-4 sm:px-6 py-10 space-y-6">

            {/* Header */}
            <motion.div variants={fadeUp} initial="hidden" animate="visible"
                className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <div className="p-2 bg-green-100 rounded-xl">
                        <Sprout className="w-5 h-5 text-green-600" />
                    </div>
                    <div>
                        <h1 className="text-2xl font-bold text-slate-900">Crop Prediction Result</h1>
                    </div>
                </div>
                <button onClick={() => navigate('/crop-predictor')}
                    className="inline-flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 text-slate-600 rounded-xl text-sm font-semibold hover:shadow-sm transition">
                    <ArrowLeft className="w-4 h-4" /> Re-predict
                </button>
            </motion.div>

            {/* Result Card */}
            <motion.div
                initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.45, ease: 'easeOut' }}
                className="bg-gradient-to-br from-green-600 to-emerald-700 rounded-2xl p-10 text-white shadow-2xl shadow-green-100 relative overflow-hidden text-center">
                <div aria-hidden className="absolute top-0 right-0 w-56 h-56 rounded-full bg-white/5 -translate-y-1/2 translate-x-1/4" />
                <div aria-hidden className="absolute bottom-0 left-0 w-40 h-40 rounded-full bg-black/5 translate-y-1/2 -translate-x-1/4" />

                <div className="relative z-10 space-y-4">
                    <p className="flex items-center justify-center gap-2 text-white/70 text-xs font-semibold uppercase tracking-widest">
                        <Sparkles className="w-3.5 h-3.5" /> ML Recommended Crop
                    </p>
                    <div className="text-8xl">{icon}</div>
                    <p className="text-5xl font-extrabold tracking-tight">{crop}</p>
                    <p className="text-white/60 text-sm">Best match for your soil &amp; climate conditions</p>

                    {/* Go to yield predictor pre-filled */}
                    <button
                        onClick={() => {
                            const prefill = sessionStorage.getItem('cropPrefillForYield');
                            if (prefill) sessionStorage.setItem('yieldPrefill', prefill);
                            navigate('/yield-predictor');
                        }}
                        className="inline-flex items-center gap-2 mt-4 px-5 py-2.5 bg-white/15 hover:bg-white/25 text-white text-sm font-semibold rounded-xl transition">
                        Predict yield for {crop} →
                    </button>
                </div>
            </motion.div>

        </div>
    );
}
