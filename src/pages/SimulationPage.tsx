import { motion } from 'framer-motion';
import { Activity, Zap } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { PerformanceSimulator } from '@/components/simulation/PerformanceSimulatorFixed';

export default function SimulationPage() {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="min-h-[calc(100vh-3.5rem)] p-6"
    >
      <div className="max-w-6xl mx-auto">
        <div className="mb-6">
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Activity className="h-6 w-6 text-primary" />
            Performance Simulation
          </h1>
          <p className="text-muted-foreground">
            Advanced infrastructure performance testing and analysis
          </p>
        </div>
        
        <PerformanceSimulator />
      </div>
    </motion.div>
  );
}
