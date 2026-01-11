import { useState } from 'react';
import { Menu, Bell, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { ThemeToggle } from '@/components/layout/ThemeToggle';
import { useIsMobile } from '@/hooks/useMediaQuery';
import { cn } from '@/lib/utils';

interface AppBarProps {
  onMenuClick?: () => void;
  notifications?: number;
}

export function AppBar({ onMenuClick, notifications = 0 }: AppBarProps) {
  const isMobile = useIsMobile();
  const [showNotifications, setShowNotifications] = useState(false);

  return (
    <header className="fixed top-0 left-0 right-0 z-50 h-14 bg-background/80 backdrop-blur-md border-b border-border safe-area-top">
      <div className="flex items-center justify-between h-full px-4">
        {/* Left - Menu (mobile) or Logo (desktop) */}
        <div className="flex items-center gap-3">
          {isMobile && (
            <Button
              variant="ghost"
              size="icon"
              onClick={onMenuClick}
              className="shrink-0"
            >
              <Menu className="h-5 w-5" />
            </Button>
          )}
          
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
              <svg className="w-5 h-5 text-primary-foreground" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M5 17L12 5L19 17Z" strokeLinejoin="round" />
                <circle cx="12" cy="14" r="2" fill="currentColor" />
              </svg>
            </div>
            <span className="font-semibold text-lg hidden sm:inline">InfraVizAI</span>
          </div>
        </div>

        {/* Right - Actions */}
        <div className="flex items-center gap-2">
          <ThemeToggle />
          
          <div className="relative">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setShowNotifications(!showNotifications)}
              className="relative"
            >
              <Bell className="h-5 w-5" />
              {notifications > 0 && (
                <span className="absolute -top-1 -right-1 h-5 w-5 rounded-full bg-primary text-primary-foreground text-xs flex items-center justify-center font-medium">
                  {notifications > 9 ? '9+' : notifications}
                </span>
              )}
            </Button>

            <AnimatePresence>
              {showNotifications && (
                <motion.div
                  initial={{ opacity: 0, y: 10, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 10, scale: 0.95 }}
                  className="absolute right-0 top-12 w-80 bg-card border border-border rounded-lg shadow-lg overflow-hidden"
                >
                  <div className="flex items-center justify-between p-4 border-b border-border">
                    <h3 className="font-semibold">Notifications</h3>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-6 w-6"
                      onClick={() => setShowNotifications(false)}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                  <div className="p-4 text-sm text-muted-foreground text-center">
                    No new notifications
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </header>
  );
}
