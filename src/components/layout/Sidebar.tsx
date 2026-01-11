import { useLocation, useNavigate } from 'react-router-dom';
import { 
  Home, 
  Network, 
  Code, 
  Shield, 
  Settings, 
  HelpCircle, 
  ChevronLeft, 
  ChevronRight,
  Mic,
  DollarSign,
  Heart,
  Zap,
  Activity,
  Users,
  GitBranch,
  Cpu,
  AlertTriangle,
  BarChart3,
  Building
} from 'lucide-react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { useState } from 'react';

const navItems = [
  { path: '/', icon: Home, label: 'Dashboard' },
  { path: '/diagram', icon: Network, label: 'Diagram Editor' },
  { path: '/code', icon: Code, label: 'Code Editor' },
  { path: '/voice', icon: Mic, label: 'Voice Commands' },
  { path: '/cost', icon: DollarSign, label: 'Cost Monitor' },
  { path: '/monitoring', icon: Heart, label: 'Health Monitor' },
  { path: '/security', icon: Shield, label: 'Security' },
  { path: '/simulation', icon: Activity, label: 'Performance' },
  { path: '/production', icon: BarChart3, label: 'Production' },
  { path: '/disaster', icon: AlertTriangle, label: 'Disaster Recovery' },
  { path: '/circuit', icon: Cpu, label: 'Circuit Design' },
  { path: '/cicd', icon: GitBranch, label: 'CI/CD' },
  { path: '/teams', icon: Users, label: 'Teams' },
];

const bottomItems = [
  { path: '/settings', icon: Settings, label: 'Settings' },
  { path: '/help', icon: HelpCircle, label: 'Help' },
];

export function Sidebar() {
  const location = useLocation();
  const navigate = useNavigate();
  const [collapsed, setCollapsed] = useState(false);

  return (
    <aside
      className={cn(
        'fixed left-0 top-14 bottom-0 z-40 bg-sidebar border-r border-sidebar-border transition-all duration-300 hidden md:flex flex-col',
        collapsed ? 'w-16' : 'w-64'
      )}
    >
      {/* Navigation */}
      <nav className="flex-1 py-4 px-2 space-y-1">
        {navItems.map((item) => {
          const isActive = location.pathname === item.path;
          const Icon = item.icon;

          return (
            <Button
              key={item.path}
              variant="ghost"
              onClick={() => navigate(item.path)}
              className={cn(
                'w-full justify-start gap-3 relative',
                collapsed && 'justify-center px-2',
                isActive && 'bg-sidebar-accent text-sidebar-primary'
              )}
            >
              {isActive && (
                <motion.div
                  layoutId="sidebarIndicator"
                  className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-6 bg-sidebar-primary rounded-r-full"
                  transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                />
              )}
              <Icon className="h-5 w-5 shrink-0" />
              {!collapsed && <span>{item.label}</span>}
            </Button>
          );
        })}
      </nav>

      {/* Bottom section */}
      <div className="py-4 px-2 border-t border-sidebar-border space-y-1">
        {bottomItems.map((item) => {
          const Icon = item.icon;
          const isActive = location.pathname === item.path;

          return (
            <Button
              key={item.path}
              variant="ghost"
              onClick={() => navigate(item.path)}
              className={cn(
                'w-full justify-start gap-3',
                collapsed && 'justify-center px-2',
                isActive && 'bg-sidebar-accent'
              )}
            >
              <Icon className="h-5 w-5 shrink-0" />
              {!collapsed && <span>{item.label}</span>}
            </Button>
          );
        })}

        {/* Collapse toggle */}
        <Button
          variant="ghost"
          onClick={() => setCollapsed(!collapsed)}
          className={cn(
            'w-full justify-start gap-3 mt-2',
            collapsed && 'justify-center px-2'
          )}
        >
          {collapsed ? (
            <ChevronRight className="h-5 w-5" />
          ) : (
            <>
              <ChevronLeft className="h-5 w-5" />
              <span>Collapse</span>
            </>
          )}
        </Button>
      </div>
    </aside>
  );
}
