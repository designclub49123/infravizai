import { motion } from 'framer-motion';
import { DollarSign, TrendingUp } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { CostMonitor } from '@/components/cost/CostMonitor';

export default function CostPage() {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="min-h-[calc(100vh-3.5rem)] p-6"
    >
      <div className="max-w-6xl mx-auto">
        <div className="mb-6">
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <DollarSign className="h-6 w-6 text-primary" />
            Cost Monitoring
          </h1>
          <p className="text-muted-foreground">
            AI-powered cost analysis and optimization recommendations
          </p>
        </div>
        
        <CostMonitor />
      </div>
    </motion.div>
  );
}
