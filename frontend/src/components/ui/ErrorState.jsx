import React from 'react';
import { motion } from 'framer-motion';
import { AlertTriangle, RefreshCw } from 'lucide-react';

/**
 * ErrorState — centered full-area error card.
 *
 * Props:
 *   message   string    — error text shown beneath the icon (default: "Unable to analyze farm")
 *   onRetry   function  — called when "Retry" is clicked
 *   className string    — extra wrapper classes
 */
export default function ErrorState({
    message = 'Unable to analyze farm',
    onRetry,
    className = '',
}) {
    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.35, ease: 'easeOut' }}
            className={`flex flex-col items-center justify-center py-20 px-6 text-center ${className}`}
        >
            {/* Icon */}
            <div className="p-4 bg-red-50 rounded-2xl mb-5">
                <AlertTriangle className="w-9 h-9 text-red-400" />
            </div>

            {/* Title */}
            <h2 className="text-lg font-bold text-slate-800 mb-1">Something went wrong</h2>

            {/* Message */}
            <p className="text-sm text-slate-500 max-w-xs leading-relaxed mb-7">
                {message}
            </p>

            {/* Retry button */}
            {onRetry && (
                <motion.button
                    onClick={onRetry}
                    whileTap={{ scale: 0.96 }}
                    whileHover={{ scale: 1.03 }}
                    className="inline-flex items-center gap-2 px-5 py-2.5 bg-red-600 text-white text-sm font-semibold rounded-xl shadow-sm shadow-red-200 hover:bg-red-700 transition-colors duration-150"
                >
                    <RefreshCw className="w-4 h-4" />
                    Retry
                </motion.button>
            )}
        </motion.div>
    );
}
