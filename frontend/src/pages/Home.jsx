import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowRight, Sprout, TrendingUp, ShieldCheck } from 'lucide-react';

const FEATURES = [
    { icon: Sprout, label: 'Crop Prediction', to: '/crop-predictor', desc: 'ML-powered crop recommendations based on your soil & climate' },
    { icon: TrendingUp, label: 'Yield Forecasting', to: '/yield-predictor', desc: 'Predict expected harvest and revenue before sowing' },
    { icon: ShieldCheck, label: 'Risk Analysis', to: '/risk-analysis', desc: 'Environmental stress scoring with actionable advisories' },
];

const fadeUp = {
    hidden: { opacity: 0, y: 28 },
    visible: (i = 0) => ({
        opacity: 1, y: 0,
        transition: { duration: 0.55, delay: i * 0.12, ease: 'easeOut' },
    }),
};

export default function Home() {
    return (
        <div className="relative overflow-hidden">

            {/* ── Background gradient ──────────────────────────── */}
            <div
                aria-hidden
                className="absolute inset-0 -z-10"
                style={{
                    background:
                        'radial-gradient(ellipse 80% 60% at 50% -10%, #d1fae5 0%, transparent 70%),' +
                        'radial-gradient(ellipse 60% 50% at 80% 80%, #e0f2fe 0%, transparent 70%),' +
                        'linear-gradient(180deg, #f8fafc 0%, #ffffff 100%)',
                }}
            />

            {/* ── Decorative blobs ─────────────────────────────── */}
            <div aria-hidden className="absolute top-20 left-10 w-64 h-64 rounded-full bg-green-100/40 blur-3xl -z-10" />
            <div aria-hidden className="absolute bottom-10 right-10 w-80 h-80 rounded-full bg-sky-100/40 blur-3xl -z-10" />

            {/* ── Hero section ─────────────────────────────────── */}
            <section className="max-w-5xl mx-auto px-6 pt-24 pb-20 text-center">

                {/* Badge */}
                <motion.div
                    variants={fadeUp} initial="hidden" animate="visible" custom={0}
                    className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-green-100 text-green-700 text-sm font-semibold mb-6 border border-green-200"
                >
                    <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                    AI-Powered Smart Farming
                </motion.div>

                {/* Main title */}
                <motion.h1
                    variants={fadeUp} initial="hidden" animate="visible" custom={1}
                    className="text-5xl sm:text-6xl lg:text-7xl font-extrabold text-slate-900 leading-tight tracking-tight text-balance"
                >
                    AI Smart{' '}
                    <span className="text-transparent bg-clip-text bg-gradient-to-r from-green-500 to-emerald-600">
                        Farming
                    </span>{' '}
                    Advisor
                </motion.h1>

                {/* Subtitle */}
                <motion.p
                    variants={fadeUp} initial="hidden" animate="visible" custom={2}
                    className="mt-5 text-lg sm:text-xl text-slate-500 max-w-xl mx-auto leading-relaxed text-balance"
                >
                    Plan crops, predict profit, reduce risk.
                    <br className="hidden sm:block" />
                    Powered by machine learning and linear programming.
                </motion.p>

                {/* CTA button */}
                <motion.div
                    variants={fadeUp} initial="hidden" animate="visible" custom={3}
                    className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4"
                >
                    <Link
                        to="/planner"
                        className="group inline-flex items-center gap-2 px-7 py-3.5 bg-green-600 text-white font-semibold rounded-xl shadow-lg shadow-green-200 hover:bg-green-700 hover:shadow-green-300 active:scale-95 transition-all duration-200 text-base"
                    >
                        Start Planning
                        <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform duration-200" />
                    </Link>

                    <Link
                        to="/dashboard"
                        className="inline-flex items-center gap-2 px-7 py-3.5 bg-white text-slate-700 font-semibold rounded-xl border border-slate-200 shadow-sm hover:shadow-md hover:border-slate-300 active:scale-95 transition-all duration-200 text-base"
                    >
                        View Dashboard
                    </Link>
                </motion.div>
            </section>

            <section className="max-w-5xl mx-auto px-6 pb-24">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
                    {FEATURES.map(({ icon: Icon, label, desc, to }, i) => (
                        <Link key={label} to={to} className="group block">
                            <motion.div
                                variants={fadeUp} initial="hidden" animate="visible" custom={4 + i}
                                className="bg-white/80 backdrop-blur-sm border border-slate-100 rounded-2xl p-6 shadow-sm hover:shadow-md hover:-translate-y-1 transition-all duration-200 h-full cursor-pointer"
                            >
                                <div className="inline-flex p-2.5 bg-green-50 rounded-xl mb-4">
                                    <Icon className="w-5 h-5 text-green-600" />
                                </div>
                                <h3 className="font-semibold text-slate-800 mb-1">{label}</h3>
                                <p className="text-sm text-slate-500 leading-relaxed">{desc}</p>
                                <span className="inline-flex items-center gap-1 mt-3 text-xs font-semibold text-green-600 group-hover:gap-2 transition-all duration-200">
                                    Try it <ArrowRight className="w-3 h-3" />
                                </span>
                            </motion.div>
                        </Link>
                    ))}
                </div>
            </section>

        </div>
    );
}
