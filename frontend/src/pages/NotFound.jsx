import React from 'react';
import { Link } from 'react-router-dom';

export default function NotFound() {
    return (
        <div className="flex flex-col items-center justify-center h-full text-center py-24">
            <p className="text-6xl font-bold text-green-500">404</p>
            <h1 className="text-2xl font-semibold text-slate-800 mt-4">Page not found</h1>
            <p className="text-slate-500 mt-2">The page you're looking for doesn't exist.</p>
            <Link to="/" className="mt-6 px-5 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition">
                Go Home
            </Link>
        </div>
    );
}
