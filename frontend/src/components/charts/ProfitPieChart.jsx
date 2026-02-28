import React, { useState } from 'react';
import {
    PieChart, Pie, Cell, Tooltip,
    Legend, ResponsiveContainer, Sector,
} from 'recharts';
import { motion } from 'framer-motion';
import { PieChart as PieIcon } from 'lucide-react';
import { slideUp, hoverCard } from '../../utils/animations';

// ── Colour palette ─────────────────────────────────────────────────────────────
const CROP_COLORS = {
    Tomato: '#22c55e',
    Wheat: '#f59e0b',
    Rice: '#3b82f6',
    Maize: '#eab308',
    Potato: '#a78bfa',
};
const FALLBACK_COLORS = ['#64748b', '#94a3b8', '#cbd5e1', '#e2e8f0'];

function colorFor(crop, index) {
    return CROP_COLORS[crop] ?? FALLBACK_COLORS[index % FALLBACK_COLORS.length];
}

// ── Custom Tooltip ─────────────────────────────────────────────────────────────
function CustomTooltip({ active, payload }) {
    if (!active || !payload?.length) return null;
    const { name, value, payload: d } = payload[0];

    return (
        <div className="bg-white border border-slate-100 rounded-xl shadow-lg p-3.5 min-w-[170px]">
            <div className="flex items-center gap-2 mb-2">
                <span className="w-2.5 h-2.5 rounded-full" style={{ background: d.fill }} />
                <span className="font-semibold text-slate-800">{name}</span>
            </div>
            <div className="space-y-1 text-sm">
                <div className="flex justify-between gap-6">
                    <span className="text-slate-500">Profit</span>
                    <span className="font-medium text-green-700">
                        {new Intl.NumberFormat('en-IN', {
                            style: 'currency', currency: 'INR', maximumFractionDigits: 0,
                        }).format(value)}
                    </span>
                </div>
                <div className="flex justify-between gap-6">
                    <span className="text-slate-500">Share</span>
                    <span className="font-medium text-slate-700">{d.percent}%</span>
                </div>
            </div>
        </div>
    );
}

// ── Active slice renderer (expands on hover) ───────────────────────────────────
function ActiveSlice(props) {
    const {
        cx, cy, innerRadius, outerRadius, startAngle, endAngle, fill,
    } = props;
    return (
        <g>
            <Sector
                cx={cx} cy={cy}
                innerRadius={innerRadius}
                outerRadius={outerRadius + 8}
                startAngle={startAngle} endAngle={endAngle}
                fill={fill}
                opacity={0.95}
            />
            <Sector
                cx={cx} cy={cy}
                innerRadius={outerRadius + 10}
                outerRadius={outerRadius + 14}
                startAngle={startAngle} endAngle={endAngle}
                fill={fill}
                opacity={0.3}
            />
        </g>
    );
}

/**
 * ProfitPieChart
 *
 * Props:
 *   farmPlan  array  — items from API's farm_plan array
 *             Each item: { crop, expected_profit }
 */
export default function ProfitPieChart({ farmPlan = [] }) {
    const [activeIndex, setActiveIndex] = useState(null);

    const total = farmPlan.reduce((s, i) => s + (i.expected_profit ?? 0), 0);

    const data = farmPlan
        .filter(i => i.expected_profit > 0)
        .map((item, idx) => ({
            name: item.crop,
            value: item.expected_profit,
            percent: total > 0 ? ((item.expected_profit / total) * 100).toFixed(1) : '0',
            fill: colorFor(item.crop, idx),
        }));

    if (!data.length) {
        return (
            <div className="flex items-center justify-center h-48 text-slate-400 text-sm">
                No profit data available.
            </div>
        );
    }

    const formattedTotal = new Intl.NumberFormat('en-IN', {
        style: 'currency', currency: 'INR', maximumFractionDigits: 0,
    }).format(total);

    return (
        <motion.div
            variants={slideUp}
            initial="hidden"
            animate="visible"
            whileHover={hoverCard}
            className="bg-white border border-slate-100 rounded-2xl shadow-sm p-6"
        >
            {/* Header */}
            <div className="flex items-center justify-between mb-5">
                <div className="flex items-center gap-2">
                    <div className="p-1.5 bg-violet-50 rounded-lg">
                        <PieIcon className="w-4 h-4 text-violet-500" />
                    </div>
                    <div>
                        <h3 className="text-sm font-semibold text-slate-800">Profit Distribution</h3>
                        <p className="text-xs text-slate-400">Each crop's share of total expected profit</p>
                    </div>
                </div>
                <span className="text-sm font-bold text-green-700 bg-green-50 px-3 py-1 rounded-lg">
                    {formattedTotal}
                </span>
            </div>

            {/* Chart */}
            <ResponsiveContainer width="100%" height={260}>
                <PieChart>
                    <Pie
                        data={data}
                        cx="50%"
                        cy="48%"
                        innerRadius={65}
                        outerRadius={100}
                        paddingAngle={3}
                        dataKey="value"
                        nameKey="name"
                        activeIndex={activeIndex}
                        activeShape={ActiveSlice}
                        onMouseEnter={(_, index) => setActiveIndex(index)}
                        onMouseLeave={() => setActiveIndex(null)}
                        isAnimationActive
                        animationBegin={0}
                        animationDuration={800}
                        animationEasing="ease-out"
                    >
                        {data.map((entry, index) => (
                            <Cell key={entry.name} fill={entry.fill} stroke="none" />
                        ))}
                    </Pie>

                    {/* Centre label */}
                    <text
                        x="50%" y="44%"
                        textAnchor="middle" dominantBaseline="middle"
                        className="text-xs"
                        fill="#64748b"
                        fontSize={11}
                    >
                        Total
                    </text>
                    <text
                        x="50%" y="52%"
                        textAnchor="middle" dominantBaseline="middle"
                        fill="#0f172a"
                        fontSize={13}
                        fontWeight={700}
                    >
                        {formattedTotal}
                    </text>

                    <Tooltip content={<CustomTooltip />} />

                    <Legend
                        layout="horizontal"
                        verticalAlign="bottom"
                        align="center"
                        iconType="circle"
                        iconSize={8}
                        formatter={(value, entry) => (
                            <span style={{ color: '#64748b', fontSize: 12 }}>
                                {value} <strong style={{ color: '#0f172a' }}>({entry.payload.percent}%)</strong>
                            </span>
                        )}
                    />
                </PieChart>
            </ResponsiveContainer>
        </motion.div>
    );
}
