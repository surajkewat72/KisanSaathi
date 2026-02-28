import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Leaf } from 'lucide-react';
import { hoverLift } from '../../utils/animations';

// ── Colour config ──────────────────────────────────────────────────────────────
function getConfig(score) {
    if (score >= 70) return { color: '#22c55e', track: '#dcfce7', label: 'Sustainable', bg: 'bg-green-50', text: 'text-green-700' };
    if (score >= 40) return { color: '#f97316', track: '#ffedd5', label: 'Moderate', bg: 'bg-orange-50', text: 'text-orange-700' };
    return { color: '#ef4444', track: '#fee2e2', label: 'High Risk', bg: 'bg-red-50', text: 'text-red-700' };
}

/**
 * SustainabilityGauge — circular SVG progress indicator.
 *
 * Props:
 *   score     number  0–100
 *   size      number  SVG diameter in px  (default 160)
 *   stroke    number  ring thickness      (default 14)
 */
export default function SustainabilityGauge({ score = 0, size = 160, stroke = 14 }) {
    const [displayed, setDisplayed] = useState(0);

    // Animate counter on mount / score change
    useEffect(() => {
        let start = 0;
        const end = Math.min(Math.max(score, 0), 100);
        if (start === end) { setDisplayed(end); return; }
        const step = Math.ceil(end / 40);
        const timer = setInterval(() => {
            start = Math.min(start + step, end);
            setDisplayed(start);
            if (start >= end) clearInterval(timer);
        }, 20);
        return () => clearInterval(timer);
    }, [score]);

    const cfg = getConfig(score);
    const cx = size / 2;
    const cy = size / 2;
    const r = (size - stroke) / 2;
    const circum = 2 * Math.PI * r;
    const offset = circum - (Math.min(score, 100) / 100) * circum;

    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            whileHover={hoverLift}
            transition={{ duration: 0.5, ease: 'easeOut' }}
            className="bg-white border border-slate-100 rounded-2xl shadow-sm p-6 flex flex-col items-center"
        >
            {/* Header */}
            <div className="flex items-center gap-2 mb-5 self-start">
                <div className="p-1.5 bg-green-50 rounded-lg">
                    <Leaf className="w-4 h-4 text-green-600" />
                </div>
                <div>
                    <h3 className="text-sm font-semibold text-slate-800">Sustainability Score</h3>
                    <p className="text-xs text-slate-400">Environmental risk assessment</p>
                </div>
            </div>

            {/* SVG ring */}
            <div className="relative" style={{ width: size, height: size }}>
                <svg width={size} height={size} style={{ transform: 'rotate(-90deg)' }}>
                    {/* Track ring */}
                    <circle
                        cx={cx} cy={cy} r={r}
                        fill="none"
                        stroke={cfg.track}
                        strokeWidth={stroke}
                    />
                    {/* Progress ring */}
                    <motion.circle
                        cx={cx} cy={cy} r={r}
                        fill="none"
                        stroke={cfg.color}
                        strokeWidth={stroke}
                        strokeLinecap="round"
                        strokeDasharray={circum}
                        initial={{ strokeDashoffset: circum }}
                        animate={{ strokeDashoffset: offset }}
                        transition={{ duration: 1, ease: 'easeOut', delay: 0.1 }}
                    />
                </svg>

                {/* Centre label */}
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <span className="text-3xl font-extrabold text-slate-900 leading-none">
                        {displayed}
                    </span>
                    <span className="text-xs text-slate-400 mt-0.5">/ 100</span>
                </div>
            </div>

            {/* Status badge */}
            <span className={`mt-4 inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold ${cfg.bg} ${cfg.text}`}>
                <span className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ background: cfg.color }} />
                {cfg.label}
            </span>

            {/* Scale hints */}
            <div className="flex justify-between w-full mt-4 px-1 text-[11px] text-slate-400">
                <span className="text-red-400 font-medium">0 High Risk</span>
                <span className="text-orange-400 font-medium">40 Moderate</span>
                <span className="text-green-500 font-medium">70 Sustainable</span>
            </div>
        </motion.div>
    );
}
