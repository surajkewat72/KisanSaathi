import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';

// Pages
import Home from './pages/Home';
import PlannerForm from './pages/PlannerForm';
import FarmDashboard from './pages/FarmDashboard';
import NotFound from './pages/NotFound';
import CropPredictor from './pages/CropPredictor';
import YieldPredictor from './pages/YieldPredictor';
import RiskAnalysis from './pages/RiskAnalysis';
import RiskResult from './pages/RiskResult';
import CropResult from './pages/CropResult';
import YieldResult from './pages/YieldResult';

// Layout
import Navbar from './components/layout/Navbar';

// Context
import { FarmPlanProvider } from './context/FarmPlanContext';

function App() {
  return (
    <FarmPlanProvider>
      <Router>
        <div className="min-h-screen flex flex-col bg-[#f8fafc]">
          <Navbar />
          <main className="flex-1">
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/planner" element={<PlannerForm />} />
              <Route path="/dashboard" element={<FarmDashboard />} />
              <Route path="/crop-predictor" element={<CropPredictor />} />
              <Route path="/crop-result" element={<CropResult />} />
              <Route path="/yield-predictor" element={<YieldPredictor />} />
              <Route path="/yield-result" element={<YieldResult />} />
              <Route path="/risk-analysis" element={<RiskAnalysis />} />
              <Route path="/risk-result" element={<RiskResult />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </main>
        </div>
      </Router>
    </FarmPlanProvider>
  );
}

export default App;
