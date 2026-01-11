import { motion } from 'framer-motion';
import { Shield, AlertTriangle } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { DisasterRecoveryFixed } from '@/components/disaster/DisasterRecoveryFixed';

export default function DisasterPage() {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="min-h-[calc(100vh-3.5rem)] p-6"
    >
      <div className="max-w-6xl mx-auto">
        <div className="mb-6">
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Shield className="h-6 w-6 text-primary" />
            Disaster Recovery
          </h1>
          <p className="text-muted-foreground">
            AI-powered disaster recovery planning and simulation
          </p>
        </div>
        
        <DisasterRecoveryFixed />
      </div>
    </motion.div>
  );
}
