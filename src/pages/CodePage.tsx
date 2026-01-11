import { useEffect, useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import { FileCode, Copy, Download, Check, RefreshCw, AlertCircle } from 'lucide-react';
import Editor from '@monaco-editor/react';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useInfrastructure } from '@/contexts/InfrastructureContext';
import { IaCGenerator } from '@/components/iac/IaCGenerator';
import { useTheme } from '@/contexts/ThemeContext';
import { toast } from 'sonner';
import type { IaCFramework } from '@/types/infrastructure';

const frameworkInfo: Record<IaCFramework, { label: string; language: string; extension: string }> = {
  terraform: { label: 'Terraform (HCL)', language: 'hcl', extension: '.tf' },
  cloudformation: { label: 'CloudFormation (JSON)', language: 'json', extension: '.json' },
  pulumi: { label: 'Pulumi (TypeScript)', language: 'typescript', extension: '.ts' },
};

export default function CodePage() {
  const { state, setIaCFramework } = useInfrastructure();
  const { resolvedTheme } = useTheme();

  if (!state.graph) {
    return (
      <div className="h-[calc(100vh-3.5rem)] flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center p-8"
        >
          <AlertCircle className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
          <h2 className="text-xl font-semibold mb-2">No Infrastructure</h2>
          <p className="text-muted-foreground mb-4">
            Generate infrastructure from the home page first
          </p>
          <Button onClick={() => window.location.href = '/'}>
            Go to Home
          </Button>
        </motion.div>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="h-[calc(100vh-3.5rem)] overflow-auto"
    >
      <div className="p-6">
        <IaCGenerator
          nodes={state.graph.nodes}
          edges={state.graph.edges}
          framework={state.iacFramework}
          onFrameworkChange={setIaCFramework}
        />
      </div>
    </motion.div>
  );
}
