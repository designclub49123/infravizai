import { motion } from 'framer-motion';
import { Activity, Heart } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { HealthDashboard } from '@/components/monitoring/HealthDashboard';

export default function MonitoringPage() {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="min-h-[calc(100vh-3.5rem)] p-6"
    >
      <div className="max-w-6xl mx-auto">
        <div className="mb-6">
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Heart className="h-6 w-6 text-primary" />
            Health Monitoring
          </h1>
          <p className="text-muted-foreground">
            Real-time infrastructure health monitoring and alerting
          </p>
        </div>
        
        <HealthDashboard />
      </div>
    </motion.div>
  );
}
