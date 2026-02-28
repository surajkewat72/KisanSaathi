import React from 'react';
import {
    BarChart, Bar, XAxis, YAxis, CartesianGrid,
    Tooltip, Legend, ResponsiveContainer, Cell, LabelList,
} from 'recharts';
import { motion } from 'framer-motion';
import { Leaf, TrendingDown } from 'lucide-react';
import { slideUp, hoverCard } from '../../utils/animations';

// ── Custom Tooltip ─────────────────────────────────────────────────────────────
function CustomTooltip({ active, payload, label }) {
    if (!active || !payload?.length) return null;

    const base = payload.find(p => p.dataKey === 'base_yield');
    const adjusted = payload.find(p => p.dataKey === 'adjusted_yield');
    const loss = base && adjusted
        ? (((base.value - adjusted.value) / base.value) * 100).toFixed(1)
        : 0;

    return (
        <div className="bg-white border border-slate-100 rounded-xl shadow-lg p-3.5 min-w-[180px]">
            <p className="font-semibold text-slate-800 mb-2">{label}</p>
            <div className="space-y-1.5 text-sm">
                <div className="flex justify-between gap-6">
                    <span className="flex items-center gap-1.5 text-slate-500">
                        <span className="w-2 h-2 rounded-full bg-blue-400 inline-block" />
                        Base yield
                    </span>
                    <span className="font-medium text-slate-800">{base?.value} t/ac</span>
                </div>
                <div className="flex justify-between gap-6">
                    <span className="flex items-center gap-1.5 text-slate-500">
                        <span className="w-2 h-2 rounded-full bg-green-500 inline-block" />
                        Adjusted
                    </span>
                    <span className="font-medium text-slate-800">{adjusted?.value} t/ac</span>
                </div>
                {loss > 0 && (
                    <div className="mt-2 pt-2 border-t border-slate-100 flex justify-between items-center">
                        <span className="text-slate-500">Env. loss</span>
                        <span className="text-xs font-bold text-red-600 bg-red-50 px-2 py-0.5 rounded-full">
                            −{loss}%
                        </span>
                    </div>
                )}
            </div>
        </div>
    );
}

// ── Loss badge above each adjusted bar ────────────────────────────────────────
function LossBadge({ x, y, width, value, baseValue }) {
    if (!baseValue || baseValue === value) return null;
    const loss = (((baseValue - value) / baseValue) * 100).toFixed(1);
    if (loss <= 0) return null;

    return (
        <text
            x={x + width / 2}
            y={y - 6}
            textAnchor="middle"
            fill="#ef4444"
            fontSize={10}
            fontWeight={700}
        >
            −{loss}%
        </text>
    );
}

/**
 * YieldImpactChart
 *
 * Props:
 *   farmPlan  array  — items from API's farm_plan array
 *             Each item: { crop, expected_yield, adjusted_yield }
 */
export default function YieldImpactChart({ farmPlan = [] }) {
    const data = farmPlan.map(item => ({
        crop: item.crop,
        base_yield: item.expected_yield,
        adjusted_yield: item.adjusted_yield,
    }));

    if (!data.length) {
        return (
            <div className="flex items-center justify-center h-48 text-slate-400 text-sm">
                No yield data available.
            </div>
        );
    }

    // Build lookup for base values (needed by LossBadge)
    const baseMap = Object.fromEntries(data.map(d => [d.crop, d.base_yield]));

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
                    <div className="p-1.5 bg-green-50 rounded-lg">
                        <Leaf className="w-4 h-4 text-green-600" />
                    </div>
                    <div>
                        <h3 className="text-sm font-semibold text-slate-800">Yield Impact</h3>
                        <p className="text-xs text-slate-400">Base vs adjusted after environmental stress</p>
                    </div>
                </div>

                {/* Overall loss summary badge */}
                {data.some(d => d.base_yield !== d.adjusted_yield) && (
                    <div className="flex items-center gap-1.5 px-2.5 py-1 bg-red-50 border border-red-100 rounded-lg text-xs font-semibold text-red-600">
                        <TrendingDown className="w-3.5 h-3.5" />
                        Env. reduction applied
                    </div>
                )}
            </div>

            {/* Chart */}
            <ResponsiveContainer width="100%" height={260}>
                <BarChart
                    data={data}
                    margin={{ top: 22, right: 16, bottom: 4, left: 0 }}
                    barCategoryGap="30%"
                    barGap={4}
                >
                    <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />

                    <XAxis
                        dataKey="crop"
                        tick={{ fill: '#94a3b8', fontSize: 12 }}
                        axisLine={false}
                        tickLine={false}
                    />
                    <YAxis
                        unit=" t"
                        tick={{ fill: '#94a3b8', fontSize: 11 }}
                        axisLine={false}
                        tickLine={false}
                        width={48}
                    />

                    <Tooltip content={<CustomTooltip />} cursor={{ fill: '#f8fafc' }} />

                    <Legend
                        formatter={(value) =>
                            value === 'base_yield' ? 'Base Yield' : 'Adjusted Yield'
                        }
                        wrapperStyle={{ fontSize: 12, paddingTop: 12 }}
                    />

                    {/* Base yield bar — muted blue */}
                    <Bar
                        dataKey="base_yield"
                        name="base_yield"
                        fill="#93c5fd"
                        radius={[5, 5, 0, 0]}
                        isAnimationActive
                        animationDuration={700}
                        animationEasing="ease-out"
                    >
                        <LabelList
                            dataKey="base_yield"
                            position="top"
                            formatter={v => `${v}t`}
                            style={{ fill: '#60a5fa', fontSize: 10, fontWeight: 600 }}
                        />
                    </Bar>

                    {/* Adjusted yield bar — green; red-tinted cells when loss occurred */}
                    <Bar
                        dataKey="adjusted_yield"
                        name="adjusted_yield"
                        radius={[5, 5, 0, 0]}
                        isAnimationActive
                        animationDuration={700}
                        animationEasing="ease-out"
                        animationBegin={150}
                    >
                        {data.map((entry) => (
                            <Cell
                                key={entry.crop}
                                fill={entry.adjusted_yield < entry.base_yield ? '#22c55e' : '#4ade80'}
                            />
                        ))}

                        {/* Custom label: show –X% if there is a reduction */}
                        <LabelList
                            dataKey="adjusted_yield"
                            content={(props) => (
                                <LossBadge {...props} baseValue={baseMap[props?.crop ?? data[props?.index]?.crop] ?? baseMap[data[props?.index]?.crop]} />
                            )}
                        />
                    </Bar>
                </BarChart>
            </ResponsiveContainer>
        </motion.div>
    );
}
