import { Suspense, lazy } from 'react';
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ThemeProvider } from '@/contexts/ThemeContext';
import { InfrastructureProvider } from '@/contexts/InfrastructureContext';
import { EnhancedInfrastructureProvider } from '@/contexts/EnhancedInfrastructureContext';
import { LocalAuthProvider } from '@/contexts/LocalDatabaseContext';
import { Layout } from '@/components/layout/Layout';
import '@/styles/theme.css';

// Lazy load pages
const HomePage = lazy(() => import('@/pages/HomePage'));
const DiagramPage = lazy(() => import('@/pages/DiagramPage'));
const CodePage = lazy(() => import('@/pages/CodePage'));
const SecurityPage = lazy(() => import('@/pages/SecurityPageFixed'));
const SettingsPage = lazy(() => import('@/pages/SettingsPage'));
const AuthPage = lazy(() => import('@/pages/AuthPage'));
const TeamsPage = lazy(() => import('@/pages/TeamsPageFixed'));
const CircuitPage = lazy(() => import('@/pages/CircuitPage'));
const CICDPage = lazy(() => import('@/pages/CICDPageFixed'));
const VoicePage = lazy(() => import('@/pages/VoicePage'));
const CostPage = lazy(() => import('@/pages/CostPage'));
const MonitoringPage = lazy(() => import('@/pages/MonitoringPage'));
const DisasterPage = lazy(() => import('@/pages/DisasterPage'));
const SimulationPage = lazy(() => import('@/pages/SimulationPage'));
const ProductionPage = lazy(() => import('@/pages/ProductionPage'));
const TestPage = lazy(() => import('@/pages/TestPage'));
const NotFound = lazy(() => import('@/pages/NotFound'));

const queryClient = new QueryClient();

function PageLoader() {
  return (
    <div className="flex items-center justify-center h-[calc(100vh-3.5rem)]">
      <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
    </div>
  );
}

const App = () => (
  <QueryClientProvider client={queryClient}>
    <ThemeProvider>
      <LocalAuthProvider>
        <InfrastructureProvider>
          <EnhancedInfrastructureProvider>
            <TooltipProvider>
              <Toaster />
              <Sonner />
              <BrowserRouter>
                <Routes>
                  <Route path="/" element={<Layout />}>
                    <Route index element={<Suspense fallback={<PageLoader />}><HomePage /></Suspense>} />
                    <Route path="diagram" element={<Suspense fallback={<PageLoader />}><DiagramPage /></Suspense>} />
                    <Route path="code" element={<Suspense fallback={<PageLoader />}><CodePage /></Suspense>} />
                    <Route path="security" element={<Suspense fallback={<PageLoader />}><SecurityPage /></Suspense>} />
                    <Route path="settings" element={<Suspense fallback={<PageLoader />}><SettingsPage /></Suspense>} />
                    <Route path="teams" element={<Suspense fallback={<PageLoader />}><TeamsPage /></Suspense>} />
                    <Route path="auth" element={<Suspense fallback={<PageLoader />}><AuthPage /></Suspense>} />
                    <Route path="circuit" element={<Suspense fallback={<PageLoader />}><CircuitPage /></Suspense>} />
                    <Route path="cicd" element={<Suspense fallback={<PageLoader />}><CICDPage /></Suspense>} />
                    <Route path="voice" element={<Suspense fallback={<PageLoader />}><VoicePage /></Suspense>} />
                    <Route path="cost" element={<Suspense fallback={<PageLoader />}><CostPage /></Suspense>} />
                    <Route path="monitoring" element={<Suspense fallback={<PageLoader />}><MonitoringPage /></Suspense>} />
                    <Route path="disaster" element={<Suspense fallback={<PageLoader />}><DisasterPage /></Suspense>} />
                    <Route path="simulation" element={<Suspense fallback={<PageLoader />}><SimulationPage /></Suspense>} />
                    <Route path="production" element={<Suspense fallback={<PageLoader />}><ProductionPage /></Suspense>} />
                    <Route path="test" element={<Suspense fallback={<PageLoader />}><TestPage /></Suspense>} />
                    <Route path="*" element={<Suspense fallback={<PageLoader />}><NotFound /></Suspense>} />
                  </Route>
                </Routes>
              </BrowserRouter>
            </TooltipProvider>
          </EnhancedInfrastructureProvider>
        </InfrastructureProvider>
      </LocalAuthProvider>
    </ThemeProvider>
  </QueryClientProvider>
);

export default App;
