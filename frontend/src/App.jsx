import React, { useState, useEffect } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ThemeProvider, useTheme } from './context/ThemeContext';
import { Navbar } from './components/layout/Navbar';
import { Sidebar } from './components/layout/Sidebar';
import { Dashboard } from './pages/Dashboard';
import { LiveRiskMap } from './pages/LiveRiskMap';
import { VulnerableHabitations } from './pages/VulnerableHabitations';
import { HazardZonesPage } from './pages/HazardZonesPage';
import { SafeZonesPage } from './pages/SafeZonesPage';
import { RelocationIntelligence } from './pages/RelocationIntelligence';
import { AlertSimulator } from './pages/AlertSimulator';
import { AnalyticsPage } from './pages/AnalyticsPage';
import { ReportsPage } from './pages/ReportsPage';
import { AdminPage } from './pages/AdminPage';
import { DiscussionPage } from './pages/DiscussionPage';
import { LoginPage } from './pages/LoginPage';
import { GovtDataExplorer } from './pages/GovtDataExplorer';
import { LiveIndianSkyBackground } from './components/common/LiveIndianSkyBackground';

function MainApp() {
  const { user } = useAuth();
  const getSubPath = () => {
    const p = window.location.pathname || '/';
    return p.replace(/^\/suraksha-drishti-ai/, '') || '/';
  };
  const [currentPath, setCurrentPath] = useState(getSubPath());
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  useEffect(() => {
    const handlePopState = () => {
      setCurrentPath(getSubPath());
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  const navigate = (path) => {
    setCurrentPath(path);
    const prefix = window.location.pathname.startsWith('/suraksha-drishti-ai') ? '/suraksha-drishti-ai' : '';
    window.history.pushState({}, '', prefix + path);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  if (!user) {
    return <LoginPage onLoginSuccess={() => navigate('/')} />;
  }

  const renderCurrentPage = () => {
    switch (currentPath) {
      case '/':
        return <Dashboard onNavigate={navigate} />;
      case '/govt-data':
      case '/predictor':
        return <GovtDataExplorer onNavigate={navigate} />;
      case '/map':
        return <LiveRiskMap onNavigate={navigate} />;
      case '/habitations':
        return <VulnerableHabitations onNavigate={navigate} />;
      case '/hazard-zones':
        return <HazardZonesPage onNavigate={navigate} />;
      case '/safe-zones':
        return <SafeZonesPage onNavigate={navigate} />;
      case '/relocation':
        return <RelocationIntelligence onNavigate={navigate} />;
      case '/simulator':
        return <AlertSimulator onNavigate={navigate} />;
      case '/analytics':
        return <AnalyticsPage onNavigate={navigate} />;
      case '/reports':
        return <ReportsPage onNavigate={navigate} />;
      case '/admin':
        return <AdminPage onNavigate={navigate} />;
      case '/discussion':
        return <DiscussionPage onNavigate={navigate} />;
      default:
        return <Dashboard onNavigate={navigate} />;
    }
  };

  const { isDark } = useTheme();

  return (
    <div className={`min-h-screen ${isDark ? 'bg-command-950 text-slate-100' : 'bg-slate-50 text-slate-900 multi-color-bg-light'} flex flex-col font-sans selection:bg-purple-600 selection:text-white transition-colors duration-300 relative overflow-x-hidden`}>
      {/* Live Patriotic Indian Sky Background Engine (Hoisting Flag, IAF Jets, India Map) */}
      <LiveIndianSkyBackground />

      {/* Top Navbar */}
      <Navbar onOpenMobileMenu={() => setMobileSidebarOpen(true)} />

      {/* Main Layout Body */}
      <div className="flex-1 flex max-w-[1700px] w-full mx-auto relative z-10">
        {/* Sidebar Navigation */}
        <Sidebar
          currentPath={currentPath}
          onNavigate={navigate}
          mobileOpen={mobileSidebarOpen}
          onCloseMobile={() => setMobileSidebarOpen(false)}
        />

        {/* Dynamic Page Content */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 min-w-0 overflow-y-auto">
          {renderCurrentPage()}
        </main>
      </div>

    </div>
  );
}

export default function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <MainApp />
      </AuthProvider>
    </ThemeProvider>
  );
}
