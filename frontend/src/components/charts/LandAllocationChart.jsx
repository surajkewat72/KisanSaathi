import React from 'react';
import {
    BarChart, Bar, XAxis, YAxis, CartesianGrid,
    Tooltip, ResponsiveContainer, Cell, LabelList,
} from 'recharts';
import { motion } from 'framer-motion';
import { Map } from 'lucide-react';
import { slideUp, hoverCard } from '../../utils/animations';

// ── Colour palette per crop ────────────────────────────────────────────────────
const CROP_COLORS = {
    Tomato: '#22c55e',
    Wheat: '#f59e0b',
    Rice: '#3b82f6',
    Maize: '#eab308',
    Potato: '#a78bfa',
};
const DEFAULT_COLOR = '#94a3b8';

// ── Custom Tooltip ─────────────────────────────────────────────────────────────
function CustomTooltip({ active, payload }) {
    if (!active || !payload?.length) return null;
    const d = payload[0].payload;

    return (
        <div className="bg-white border border-slate-100 rounded-xl shadow-lg p-3.5 min-w-[160px]">
            <p className="font-semibold text-slate-800 mb-2">{d.crop}</p>
            <div className="space-y-1 text-sm">
                <div className="flex justify-between gap-6">
                    <span className="text-slate-500">Land</span>
                    <span className="font-medium text-slate-800">{d.acres} acres</span>
                </div>
                <div className="flex justify-between gap-6">
                    <span className="text-slate-500">Profit</span>
                    <span className="font-medium text-green-700">
                        {new Intl.NumberFormat('en-IN', {
                            style: 'currency', currency: 'INR', maximumFractionDigits: 0,
                        }).format(d.profit)}
                    </span>
                </div>
            </div>
        </div>
    );
}

/**
 * LandAllocationChart
 *
 * Props:
 *   farmPlan  array  — items from the API's farm_plan array
 *             Each item: { crop, acres, expected_profit, ... }
 */
export default function LandAllocationChart({ farmPlan = [] }) {
    // Shape data for Recharts
    const data = farmPlan.map(item => ({
        crop: item.crop,
        acres: item.acres,
        profit: item.expected_profit,
    }));

    if (!data.length) {
        return (
            <div className="flex items-center justify-center h-48 text-slate-400 text-sm">
                No allocation data available.
            </div>
        );
    }

    return (
        <motion.div
            variants={slideUp}
            initial="hidden"
            animate="visible"
            whileHover={hoverCard}
            className="bg-white border border-slate-100 rounded-2xl shadow-sm p-6"
        >
            {/* Header */}
            <div className="flex items-center gap-2 mb-5">
                <div className="p-1.5 bg-blue-50 rounded-lg">
                    <Map className="w-4 h-4 text-blue-500" />
                </div>
                <div>
                    <h3 className="text-sm font-semibold text-slate-800">Land Allocation</h3>
                    <p className="text-xs text-slate-400">Acres allocated per crop (LP optimised)</p>
                </div>
            </div>

            {/* Chart */}
            <ResponsiveContainer width="100%" height={240}>
                <BarChart
                    data={data}
                    margin={{ top: 16, right: 16, bottom: 4, left: 0 }}
                    barCategoryGap="35%"
                >
                    <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />

                    <XAxis
                        dataKey="crop"
                        tick={{ fill: '#94a3b8', fontSize: 12 }}
                        axisLine={false}
                        tickLine={false}
                    />
                    <YAxis
                        unit=" ac"
                        tick={{ fill: '#94a3b8', fontSize: 11 }}
                        axisLine={false}
                        tickLine={false}
                        width={52}
                    />

                    <Tooltip content={<CustomTooltip />} cursor={{ fill: '#f8fafc' }} />

                    <Bar dataKey="acres" radius={[6, 6, 0, 0]} isAnimationActive animationDuration={800} animationEasing="ease-out">
                        {data.map((entry) => (
                            <Cell
                                key={entry.crop}
                                fill={CROP_COLORS[entry.crop] ?? DEFAULT_COLOR}
                            />
                        ))}
                        <LabelList
                            dataKey="acres"
                            position="top"
                            formatter={v => `${v} ac`}
                            style={{ fill: '#64748b', fontSize: 11, fontWeight: 600 }}
                        />
                    </Bar>
                </BarChart>
            </ResponsiveContainer>

            {/* Legend */}
            <div className="flex flex-wrap gap-3 mt-4 pt-4 border-t border-slate-50">
                {data.map(d => (
                    <div key={d.crop} className="flex items-center gap-1.5 text-xs text-slate-600">
                        <span
                            className="w-2.5 h-2.5 rounded-full inline-block"
                            style={{ background: CROP_COLORS[d.crop] ?? DEFAULT_COLOR }}
                        />
                        {d.crop}
                    </div>
                ))}
            </div>
        </motion.div>
    );
}
