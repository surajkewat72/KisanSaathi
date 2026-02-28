import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { ShieldCheck, ArrowLeft } from 'lucide-react';
import { fadeUp } from '../utils/animations';

import RecommendationHero from '../components/cards/RecommendationHero';
import SustainabilityGauge from '../components/cards/SustainabilityGauge';
import AdvisoryPanel from '../components/cards/AdvisoryPanel';
import YieldImpactChart from '../components/charts/YieldImpactChart';

export default function RiskResult() {
    const navigate = useNavigate();
    const [result, setResult] = useState(null);

    useEffect(() => {
        const raw = sessionStorage.getItem('riskResult');
        if (raw) {
            try { setResult(JSON.parse(raw)); }
            catch { /* ignore */ }
        }
    }, []);

    if (!result) {
        return (
            <div className="max-w-3xl mx-auto px-6 py-20 text-center">
                <p className="text-slate-500 mb-4">No analysis result found.</p>
                <button onClick={() => navigate('/risk-analysis')}
                    className="inline-flex items-center gap-2 px-4 py-2 bg-violet-600 text-white rounded-xl text-sm font-semibold hover:bg-violet-700 transition">
                    <ArrowLeft className="w-4 h-4" /> Back to Risk Analysis
                </button>
            </div>
        );
    }

    const allAdvisories = result.farm_plan.flatMap(c => c.advisories ?? []);
    const firstCrop = result.farm_plan[0] ?? {};

    return (
        <div className="max-w-5xl mx-auto px-4 sm:px-6 py-10 space-y-6">

            {/* Header */}
            <motion.div variants={fadeUp} initial="hidden" animate="visible" className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <div className="p-2 bg-violet-100 rounded-xl">
                        <ShieldCheck className="w-5 h-5 text-violet-600" />
                    </div>
                    <div>
                        <h1 className="text-2xl font-bold text-slate-900">Risk Analysis Results</h1>
                    </div>
                </div>
                <button onClick={() => navigate('/risk-analysis')}
                    className="inline-flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 text-slate-600 rounded-xl text-sm font-semibold hover:shadow-sm transition">
                    <ArrowLeft className="w-4 h-4" /> Re-analyse
                </button>
            </motion.div>

            {/* Hero — crop + risk only (no profit) */}
            <motion.div variants={fadeUp} initial="hidden" animate="visible">
                <RecommendationHero
                    predictedCrop={result.predicted_crop}
                    riskLevel={firstCrop.risk_level ?? 'Low'}
                />
            </motion.div>

            {/* Gauge + Advisories side by side */}
            <motion.div variants={fadeUp} initial="hidden" animate="visible"
                className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <SustainabilityGauge score={result.sustainability_score} />
                <AdvisoryPanel advisories={allAdvisories} cropName={result.predicted_crop} />
            </motion.div>

            {/* Yield impact chart */}
            <motion.div variants={fadeUp} initial="hidden" animate="visible">
                <YieldImpactChart farmPlan={result.farm_plan} />
            </motion.div>

        </div>
    );
}
