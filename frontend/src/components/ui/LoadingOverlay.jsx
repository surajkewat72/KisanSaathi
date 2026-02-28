import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Leaf } from 'lucide-react';

/**
 * Full-screen loading overlay.
 * Usage:  <LoadingOverlay show={loading} message="Analyzing farm conditions..." />
 */
export default function LoadingOverlay({ show = false, message = 'Loading…' }) {
    return (
        <AnimatePresence>
            {show && (
                <motion.div
                    key="overlay"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.25 }}
                    className="fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-white/80 backdrop-blur-md"
                >
                    {/* ── Spinner ring ──────────────────────────────── */}
                    <div className="relative w-20 h-20 mb-7">
                        {/* Outer rotating ring */}
                        <motion.span
                            className="absolute inset-0 rounded-full border-4 border-green-500 border-t-transparent"
                            animate={{ rotate: 360 }}
                            transition={{ repeat: Infinity, ease: 'linear', duration: 1 }}
                            style={{ display: 'block' }}
                        />
                        {/* Inner pulsing ring */}
                        <motion.span
                            className="absolute inset-2 rounded-full border-2 border-emerald-300 border-b-transparent"
                            animate={{ rotate: -360 }}
                            transition={{ repeat: Infinity, ease: 'linear', duration: 1.5 }}
                            style={{ display: 'block' }}
                        />
                        {/* Centre icon */}
                        <div className="absolute inset-0 flex items-center justify-center">
                            <motion.div
                                animate={{ scale: [1, 1.15, 1] }}
                                transition={{ repeat: Infinity, duration: 1.8, ease: 'easeInOut' }}
                                className="p-1.5 bg-green-100 rounded-lg"
                            >
                                <Leaf className="w-5 h-5 text-green-600" />
                            </motion.div>
                        </div>
                    </div>

                    {/* ── Message ────────────────────────────────────── */}
                    <motion.p
                        initial={{ opacity: 0, y: 8 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.15 }}
                        className="text-base font-semibold text-slate-700"
                    >
                        {message}
                    </motion.p>

                    {/* ── Animated dots ──────────────────────────────── */}
                    <div className="flex gap-1.5 mt-3">
                        {[0, 1, 2].map(i => (
                            <motion.span
                                key={i}
                                className="w-1.5 h-1.5 rounded-full bg-green-400"
                                animate={{ opacity: [0.3, 1, 0.3], y: [0, -4, 0] }}
                                transition={{ repeat: Infinity, duration: 1.2, delay: i * 0.2 }}
                            />
                        ))}
                    </div>
                </motion.div>
            )}
        </AnimatePresence>
    );
}
