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

      {/* Floating Developer Credit Badge - Bottom Right Corner */}
      <aside aria-label="Developer attribution" className="fixed bottom-3 right-4 z-40 no-print flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/95 dark:bg-command-900/95 backdrop-blur-md border-2 border-slate-300/90 dark:border-cyberblue-700/80 shadow-xl shadow-black/20 text-xs font-mono select-none hover:scale-105 transition-all duration-200 group">
        <span className="relative flex h-2 w-2">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
          <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
        </span>
        <span className="text-slate-600 dark:text-slate-400 text-[11px] font-medium">
          Developed by
        </span>
        <span className="font-extrabold text-slate-950 dark:text-cyberyellow-300 tracking-wide font-sans group-hover:text-blue-600 dark:group-hover:text-cyan-300 transition-colors">
          VIVEK KUMAR
        </span>
      </aside>
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
