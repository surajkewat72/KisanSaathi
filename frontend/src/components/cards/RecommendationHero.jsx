import React from 'react';
import { motion } from 'framer-motion';
import { Sprout, TrendingUp, ShieldCheck, ShieldAlert, ShieldX } from 'lucide-react';

// ── Risk config ────────────────────────────────────────────────────────────────
const RISK_CONFIG = {
    Low: {
        label: 'Low Risk',
        icon: ShieldCheck,
        badge: 'bg-green-100 text-green-700 border-green-200',
        glow: 'shadow-green-100',
        dot: 'bg-green-500',
    },
    Medium: {
        label: 'Medium Risk',
        icon: ShieldAlert,
        badge: 'bg-yellow-100 text-yellow-700 border-yellow-200',
        glow: 'shadow-yellow-100',
        dot: 'bg-yellow-400',
    },
    High: {
        label: 'High Risk',
        icon: ShieldX,
        badge: 'bg-red-100 text-red-700 border-red-200',
        glow: 'shadow-red-100',
        dot: 'bg-red-500',
    },
};

// ── Animation variants ─────────────────────────────────────────────────────────
const container = {
    hidden: {},
    visible: { transition: { staggerChildren: 0.12 } },
};
const fadeUp = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: 'easeOut' } },
};

/**
 * RecommendationHero — large summary card for the top of FarmDashboard.
 *
 * Props:
 *   predictedCrop       string   e.g. "Tomato"
 *   riskLevel           string   "Low" | "Medium" | "High"
 */
export default function RecommendationHero({ predictedCrop, riskLevel = 'Low' }) {
    const risk = RISK_CONFIG[riskLevel] ?? RISK_CONFIG.Low;
    const RiskIcon = risk.icon;

    return (
        <motion.div
            variants={container} initial="hidden" animate="visible"
            className={`relative overflow-hidden bg-gradient-to-br from-green-600 to-emerald-700 rounded-2xl p-7 text-white shadow-xl ${risk.glow}`}
        >
            {/* ── Decorative blobs ─────────────────────────── */}
            <div aria-hidden className="absolute top-0 right-0 w-64 h-64 rounded-full bg-white/5 -translate-y-1/2 translate-x-1/4" />
            <div aria-hidden className="absolute bottom-0 left-0 w-48 h-48 rounded-full bg-black/5 translate-y-1/2 -translate-x-1/4" />

            <div className="relative z-10 grid grid-cols-1 sm:grid-cols-2 gap-6">

                {/* ── Predicted Crop ───────────────────────────── */}
                <motion.div variants={fadeUp} className="flex flex-col gap-2">
                    <div className="flex items-center gap-2 text-white/70 text-xs font-semibold uppercase tracking-widest">
                        <Sprout className="w-3.5 h-3.5" />
                        Recommended Crop
                    </div>
                    <motion.p
                        initial={{ opacity: 0, scale: 0.85 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: 0.2, duration: 0.4, type: 'spring', stiffness: 180 }}
                        className="text-4xl font-extrabold tracking-tight"
                    >
                        {predictedCrop ?? '—'}
                    </motion.p>
                    <p className="text-white/60 text-xs">Based on your soil & climate</p>
                </motion.div>

                {/* ── Risk Badge ───────────────────────────────── */}
                <motion.div variants={fadeUp} className="flex flex-col gap-2 sm:items-end">
                    <div className="flex items-center gap-2 text-white/70 text-xs font-semibold uppercase tracking-widest">
                        <RiskIcon className="w-3.5 h-3.5" />
                        Overall Risk
                    </div>
                    <motion.div
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: 0.35, duration: 0.4, type: 'spring', stiffness: 200 }}
                    >
                        <span className={`inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-sm font-bold border ${risk.badge}`}>
                            <span className={`w-2 h-2 rounded-full ${risk.dot} animate-pulse`} />
                            {risk.label}
                        </span>
                    </motion.div>
                    <p className="text-white/60 text-xs">Aggregated sustainability score</p>
                </motion.div>

            </div>
        </motion.div>
    );
}
