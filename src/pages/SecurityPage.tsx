import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Shield,
  ShieldAlert,
  ShieldCheck,
  AlertTriangle,
  AlertCircle,
  Info,
  CheckCircle2,
  RefreshCw,
  Wrench,
  ChevronDown,
  ChevronRight,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { useInfrastructure } from '@/contexts/InfrastructureContext';
import { AISecurityDetector } from '@/components/security/AISecurityDetector';
import { scanInfrastructure, autoFixFinding } from '@/lib/security/scanner';
import { toast } from 'sonner';
import type { SecurityFinding, SecuritySeverity, SecurityReport } from '@/types/infrastructure';

const severityConfig: Record<SecuritySeverity, { icon: any; color: string; bgColor: string }> = {
  critical: { icon: ShieldAlert, color: 'text-red-600', bgColor: 'bg-red-100 dark:bg-red-900/30' },
  high: { icon: AlertTriangle, color: 'text-orange-500', bgColor: 'bg-orange-100 dark:bg-orange-900/30' },
  medium: { icon: AlertCircle, color: 'text-yellow-500', bgColor: 'bg-yellow-100 dark:bg-yellow-900/30' },
  low: { icon: Info, color: 'text-blue-500', bgColor: 'bg-blue-100 dark:bg-blue-900/30' },
  info: { icon: Info, color: 'text-muted-foreground', bgColor: 'bg-muted' },
};

function ScoreGauge({ score, label }: { score: number; label: string }) {
  const getColor = (s: number) => {
    if (s >= 80) return 'text-green-500';
    if (s >= 60) return 'text-yellow-500';
    if (s >= 40) return 'text-orange-500';
    return 'text-red-500';
  };

  return (
    <div className="text-center">
      <div className={`text-3xl font-bold ${getColor(score)}`}>{score}%</div>
      <div className="text-sm text-muted-foreground">{label}</div>
      <Progress value={score} className="mt-2 h-2" />
    </div>
  );
}

function FindingCard({
  finding,
  onAutoFix,
  isFixing,
}: {
  finding: SecurityFinding;
  onAutoFix: (finding: SecurityFinding) => void;
  isFixing: boolean;
}) {
  const [isOpen, setIsOpen] = useState(false);
  const config = severityConfig[finding.severity];
  const Icon = config.icon;

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
    >
      <Collapsible open={isOpen} onOpenChange={setIsOpen}>
        <Card className={`border-l-4 ${config.bgColor} border-l-current ${config.color}`}>
          <CollapsibleTrigger asChild>
            <CardHeader className="cursor-pointer py-3">
              <div className="flex items-start gap-3">
                <Icon className={`h-5 w-5 mt-0.5 ${config.color}`} />
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <CardTitle className="text-base">{finding.title}</CardTitle>
                    <Badge variant="outline" className={config.color}>
                      {finding.severity.toUpperCase()}
                    </Badge>
                  </div>
                  <CardDescription className="mt-1">{finding.description}</CardDescription>
                </div>
                <div className="flex items-center gap-2">
                  {finding.autoFixAvailable && (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={(e) => {
                        e.stopPropagation();
                        onAutoFix(finding);
                      }}
                      disabled={isFixing}
                    >
                      <Wrench className="h-4 w-4 mr-1" />
                      Auto Fix
                    </Button>
                  )}
                  {isOpen ? (
                    <ChevronDown className="h-5 w-5 text-muted-foreground" />
                  ) : (
                    <ChevronRight className="h-5 w-5 text-muted-foreground" />
                  )}
                </div>
              </div>
            </CardHeader>
          </CollapsibleTrigger>
          <CollapsibleContent>
            <CardContent className="pt-0">
              <div className="space-y-3 pl-8">
                <div>
                  <h4 className="font-medium text-sm mb-1">Recommendation</h4>
                  <p className="text-sm text-muted-foreground">{finding.recommendation}</p>
                </div>
                {finding.compliance.length > 0 && (
                  <div>
                    <h4 className="font-medium text-sm mb-1">Compliance</h4>
                    <div className="flex gap-1.5 flex-wrap">
                      {finding.compliance.map((c) => (
                        <Badge key={c} variant="secondary" className="text-xs">
                          {c}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </CollapsibleContent>
        </Card>
      </Collapsible>
    </motion.div>
  );
}

export default function SecurityPage() {
  // Always show security page with demo analysis
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
            Security Analysis
          </h1>
          <p className="text-muted-foreground">
            AI-powered security threat detection and compliance checking
          </p>
        </div>
        
        <AISecurityDetector />
      </div>
    </motion.div>
  );
}
