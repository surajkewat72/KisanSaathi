import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Info, AlertTriangle, AlertCircle,
    CheckCircle2, MessageSquare,
} from 'lucide-react';
import { fadeIn, hoverLift } from '../../utils/animations';

// ── Severity detection ─────────────────────────────────────────────────────────
// Scans advisory text for keywords to auto-classify severity.
const DANGER_KEYWORDS = ['critically', 'severe', 'frost', 'extreme', 'exceeded', 'too hot', 'too cold', 'urgently', 'flood', 'immediately'];
const WARNING_KEYWORDS = ['high', 'above', 'below', 'outside', 'alkaline', 'acidic', 'reduce', 'increase', 'moderate', 'excess', 'low', 'risk'];

function detectSeverity(text = '') {
    const lower = text.toLowerCase();
    if (DANGER_KEYWORDS.some(k => lower.includes(k))) return 'danger';
    if (WARNING_KEYWORDS.some(k => lower.includes(k))) return 'warning';
    if (lower.startsWith('✅')) return 'success';
    return 'info';
}

// ── Severity config ────────────────────────────────────────────────────────────
const SEVERITY = {
    info: {
        icon: Info,
        card: 'bg-blue-50   border-blue-200',
        icon_cl: 'text-blue-500',
        text: 'text-blue-800',
    },
    warning: {
        icon: AlertTriangle,
        card: 'bg-yellow-50  border-yellow-200',
        icon_cl: 'text-yellow-500',
        text: 'text-yellow-800',
    },
    danger: {
        icon: AlertCircle,
        card: 'bg-red-50    border-red-200',
        icon_cl: 'text-red-500',
        text: 'text-red-800',
    },
    success: {
        icon: CheckCircle2,
        card: 'bg-green-50  border-green-200',
        icon_cl: 'text-green-600',
        text: 'text-green-800',
    },
};

// ── Single alert card ──────────────────────────────────────────────────────────
function AdvisoryCard({ text, index }) {
    const severity = detectSeverity(text);
    const cfg = SEVERITY[severity] ?? SEVERITY.info;
    const Icon = cfg.icon;

    // Strip leading emoji / symbols for clean display
    const cleanText = text.replace(/^[\u{1F300}-\u{1FFFF}✅⚗🌡🌦🌧🌱🪨🟤💧🏜❄☀📅🚿💦⚠️ ]+/u, '').trim();

    return (
        <motion.div
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.3, delay: index * 0.07 }}
            className={`flex items-start gap-3 p-3.5 rounded-xl border ${cfg.card}`}
        >
            <Icon className={`w-4 h-4 mt-0.5 flex-shrink-0 ${cfg.icon_cl}`} />
            <p className={`text-sm leading-snug ${cfg.text}`}>{cleanText}</p>
        </motion.div>
    );
}

/**
 * AdvisoryPanel
 *
 * Props:
 *   advisories  string[]  — list of advisory strings from the API
 *   cropName    string    — optional crop label for the header
 *   className   string    — extra wrapper classes
 */
export default function AdvisoryPanel({ advisories = [], cropName, className = '' }) {
    if (!advisories.length) return null;

    return (
        <motion.div
            variants={fadeIn}
            initial="hidden"
            animate="visible"
            whileHover={hoverLift}
            className={`bg-white border border-slate-100 rounded-2xl shadow-sm overflow-hidden ${className}`}
        >
            {/* Header */}
            <div className="flex items-center gap-2 px-4 py-3 border-b border-slate-50 bg-slate-50/60">
                <MessageSquare className="w-4 h-4 text-slate-400" />
                <h3 className="text-sm font-semibold text-slate-700">
                    {cropName ? `Advisories — ${cropName}` : 'Farm Advisories'}
                </h3>
                <span className="ml-auto text-xs font-medium text-slate-400 bg-slate-100 px-2 py-0.5 rounded-full">
                    {advisories.length}
                </span>
            </div>

            {/* Advisory cards */}
            <div className="px-4 py-3 space-y-2">
                <AnimatePresence>
                    {advisories.map((text, i) => (
                        <AdvisoryCard key={i} text={text} index={i} />
                    ))}
                </AnimatePresence>
            </div>
        </motion.div>
    );
}
