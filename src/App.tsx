import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { HomePage } from './pages/HomePage';
import { DashboardPage } from './pages/DashboardPage';
import { PrivacyShieldPage } from './pages/PrivacyShieldPage';
import { NotFoundPage } from './pages/NotFoundPage';
import { useHealthCheck } from './api/hooks';

/**
 * AppContent Component
 * Mounts background health polling and provides platform routing.
 */
const AppContent: React.FC = () => {
  useHealthCheck();

  return (
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route path="/dashboard" element={<DashboardPage />} />
      <Route path="/privacy-shield" element={<PrivacyShieldPage />} />
      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  );
};

/**
 * Root Application Router
 */
export const App: React.FC = () => {
  return (
    <BrowserRouter>
      <AppContent />
    </BrowserRouter>
  );
};

export default App;
