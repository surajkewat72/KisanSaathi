import React from 'react';
import { NavLink } from 'react-router-dom';
import { Home, Sprout, BarChart2, Leaf } from 'lucide-react';

const NAV_ITEMS = [
    { to: '/', icon: Home, label: 'Home', end: true },
    { to: '/planner', icon: Sprout, label: 'Farm Planner', end: false },
    { to: '/dashboard', icon: BarChart2, label: 'Farm Dashboard', end: false },
];

export default function Sidebar() {
    return (
        <aside className="w-60 min-h-screen bg-white border-r border-slate-100 flex flex-col shadow-sm">
            {/* Logo */}
            <div className="flex items-center gap-2.5 px-5 py-5 border-b border-slate-100">
                <div className="p-1.5 bg-green-100 rounded-lg">
                    <Leaf className="w-5 h-5 text-green-600" />
                </div>
                <span className="font-bold text-slate-800 text-lg tracking-tight">
                    Kisan<span className="text-green-600">Saathi</span>
                </span>
            </div>

            {/* Navigation */}
            <nav className="flex-1 px-3 py-4 space-y-1">
                {NAV_ITEMS.map(({ to, icon: Icon, label, end }) => (
                    <NavLink
                        key={to}
                        to={to}
                        end={end}
                        className={({ isActive }) =>
                            `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-150 ${isActive
                                ? 'bg-green-50 text-green-700'
                                : 'text-slate-500 hover:bg-slate-50 hover:text-slate-900'
                            }`
                        }
                    >
                        <Icon className="w-4 h-4 flex-shrink-0" />
                        {label}
                    </NavLink>
                ))}
            </nav>

            {/* Footer */}
            <div className="px-5 py-4 border-t border-slate-100 text-xs text-slate-400">
                KisanSaathi v1.0
            </div>
        </aside>
    );
}
