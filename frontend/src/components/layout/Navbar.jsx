import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Leaf, Menu, X, Sprout } from 'lucide-react';

const NAV_LINKS = [
    { to: '/', label: 'Home' },
    { to: '/planner', label: 'Planner' },
    { to: '/dashboard', label: 'Dashboard' },
];

export default function Navbar() {
    const [menuOpen, setMenuOpen] = useState(false);
    const [scrolled, setScrolled] = useState(false);
    const { pathname } = useLocation();

    // Deepen glass on scroll
    useEffect(() => {
        const handler = () => setScrolled(window.scrollY > 8);
        window.addEventListener('scroll', handler, { passive: true });
        return () => window.removeEventListener('scroll', handler);
    }, []);

    // Close mobile menu on route change
    useEffect(() => setMenuOpen(false), [pathname]);

    return (
        <nav
            className={`sticky top-0 z-50 w-full transition-all duration-300 ${scrolled
                    ? 'bg-white/80 backdrop-blur-lg shadow-md border-b border-slate-100/60'
                    : 'bg-white/60 backdrop-blur-md border-b border-transparent'
                }`}
        >
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-15">
                <div className="flex items-center justify-between h-15 py-3">

                    {/* ── Logo ───────────────────────────────────────── */}
                    <Link to="/" className="flex items-center gap-2 group">
                        <div className="p-1.5 bg-green-100 rounded-lg group-hover:bg-green-200 transition">
                            <Leaf className="w-5 h-5 text-green-600" />
                        </div>
                        <span className="font-bold text-slate-800 text-lg tracking-tight select-none">
                            Kisan<span className="text-green-600">Saathi</span>
                        </span>
                    </Link>

                    {/* ── Desktop Links ──────────────────────────────── */}
                    <div className="hidden md:flex items-center gap-1">
                        {NAV_LINKS.map(({ to, label }) => {
                            const active = pathname === to;
                            return (
                                <Link
                                    key={to}
                                    to={to}
                                    className={`px-3.5 py-1.5 rounded-lg text-sm font-medium transition-all duration-150 ${active
                                            ? 'bg-green-50 text-green-700'
                                            : 'text-slate-500 hover:text-slate-900 hover:bg-slate-50'
                                        }`}
                                >
                                    {label}
                                </Link>
                            );
                        })}
                    </div>

                    {/* ── Right CTA + Hamburger ─────────────────────── */}
                    <div className="flex items-center gap-2">
                        {/* Planner CTA (desktop) */}
                        <Link
                            to="/planner"
                            className="hidden md:flex items-center gap-1.5 px-4 py-2 bg-green-600 text-white text-sm font-semibold rounded-lg shadow-sm hover:bg-green-700 active:scale-95 transition-all duration-150"
                        >
                            <Sprout className="w-4 h-4" />
                            Start Planning
                        </Link>

                        {/* Mobile hamburger */}
                        <button
                            onClick={() => setMenuOpen(prev => !prev)}
                            className="md:hidden p-2 rounded-lg text-slate-500 hover:bg-slate-100 transition"
                            aria-label="Toggle menu"
                        >
                            {menuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
                        </button>
                    </div>

                </div>
            </div>

            {/* ── Mobile Dropdown Menu ────────────────────────────── */}
            {menuOpen && (
                <div className="md:hidden border-t border-slate-100 bg-white/90 backdrop-blur-lg px-4 pb-4 pt-2 space-y-1 shadow-lg">
                    {NAV_LINKS.map(({ to, label }) => {
                        const active = pathname === to;
                        return (
                            <Link
                                key={to}
                                to={to}
                                className={`block px-3 py-2.5 rounded-lg text-sm font-medium transition ${active
                                        ? 'bg-green-50 text-green-700'
                                        : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                                    }`}
                            >
                                {label}
                            </Link>
                        );
                    })}
                    <Link
                        to="/planner"
                        className="flex items-center justify-center gap-2 mt-2 px-4 py-2.5 bg-green-600 text-white text-sm font-semibold rounded-lg hover:bg-green-700 transition"
                    >
                        <Sprout className="w-4 h-4" />
                        Start Planning
                    </Link>
                </div>
            )}
        </nav>
    );
}
