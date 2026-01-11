import { useLocation, useNavigate } from 'react-router-dom';
import { Home, Network, Code, Shield, Settings, HelpCircle, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

const navItems = [
  { path: '/', icon: Home, label: 'Dashboard' },
  { path: '/diagram', icon: Network, label: 'Diagram Editor' },
  { path: '/code', icon: Code, label: 'Code Editor' },
  { path: '/security', icon: Shield, label: 'Security' },
];

const bottomItems = [
  { path: '/settings', icon: Settings, label: 'Settings' },
  { path: '/help', icon: HelpCircle, label: 'Help' },
];

interface MobileDrawerProps {
  open: boolean;
  onClose: () => void;
}

export function MobileDrawer({ open, onClose }: MobileDrawerProps) {
  const location = useLocation();
  const navigate = useNavigate();

  const handleNavigate = (path: string) => {
    navigate(path);
    onClose();
  };

  return (
    <AnimatePresence>
      {open && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm md:hidden"
            onClick={onClose}
          />

          {/* Drawer */}
          <motion.aside
            initial={{ x: '-100%' }}
            animate={{ x: 0 }}
            exit={{ x: '-100%' }}
            transition={{ type: 'spring', damping: 30, stiffness: 300 }}
            className="fixed left-0 top-0 bottom-0 z-50 w-72 bg-sidebar border-r border-sidebar-border flex flex-col md:hidden safe-area-top"
          >
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-sidebar-border">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
                  <svg className="w-5 h-5 text-primary-foreground" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M5 17L12 5L19 17Z" strokeLinejoin="round" />
                    <circle cx="12" cy="14" r="2" fill="currentColor" />
                  </svg>
                </div>
                <span className="font-semibold text-lg">InfraVizAI</span>
              </div>
              <Button variant="ghost" size="icon" onClick={onClose}>
                <X className="h-5 w-5" />
              </Button>
            </div>

            {/* Navigation */}
            <nav className="flex-1 py-4 px-3 space-y-1 overflow-y-auto">
              {navItems.map((item) => {
                const isActive = location.pathname === item.path;
                const Icon = item.icon;

                return (
                  <Button
                    key={item.path}
                    variant="ghost"
                    onClick={() => handleNavigate(item.path)}
                    className={cn(
                      'w-full justify-start gap-3 h-12',
                      isActive && 'bg-sidebar-accent text-sidebar-primary'
                    )}
                  >
                    <Icon className="h-5 w-5" />
                    <span className="text-base">{item.label}</span>
                  </Button>
                );
              })}
            </nav>

            {/* Bottom section */}
            <div className="py-4 px-3 border-t border-sidebar-border space-y-1 safe-area-bottom">
              {bottomItems.map((item) => {
                const Icon = item.icon;

                return (
                  <Button
                    key={item.path}
                    variant="ghost"
                    onClick={() => handleNavigate(item.path)}
                    className="w-full justify-start gap-3 h-12"
                  >
                    <Icon className="h-5 w-5" />
                    <span className="text-base">{item.label}</span>
                  </Button>
                );
              })}
            </div>
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  );
}
