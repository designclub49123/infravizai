import { useState, useEffect } from 'react';
import { Outlet } from 'react-router-dom';
import { AppBar } from './AppBar';
import { Sidebar } from './Sidebar';
import { BottomNav } from './BottomNav';
import { MobileDrawer } from './MobileDrawer';
import { OnboardingModal } from '@/components/onboarding/OnboardingModal';
import { useIsMobile } from '@/hooks/useMediaQuery';
import { cn } from '@/lib/utils';

export function Layout() {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [showOnboarding, setShowOnboarding] = useState(false);
  const isMobile = useIsMobile();

  useEffect(() => {
    // Check if first visit
    const hasVisited = localStorage.getItem('infravizai_visited');
    if (!hasVisited) {
      setShowOnboarding(true);
    }
  }, []);

  const handleOnboardingComplete = () => {
    localStorage.setItem('infravizai_visited', 'true');
    setShowOnboarding(false);
  };

  return (
    <div className="min-h-screen bg-background">
      <AppBar onMenuClick={() => setDrawerOpen(true)} />
      
      {!isMobile && <Sidebar />}
      
      <MobileDrawer open={drawerOpen} onClose={() => setDrawerOpen(false)} />

      <main
        className={cn(
          'pt-14 min-h-screen transition-all duration-300',
          !isMobile && 'md:ml-64',
          isMobile && 'pb-16'
        )}
      >
        <Outlet />
      </main>

      {isMobile && <BottomNav />}

      <OnboardingModal
        open={showOnboarding}
        onComplete={handleOnboardingComplete}
      />
    </div>
  );
}
