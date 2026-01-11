import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, ChevronRight, DollarSign } from 'lucide-react';
import { FlowCanvas } from '@/components/diagram/FlowCanvas';
import { ResourcePalette } from '@/components/diagram/ResourcePalette';
import CostEstimation from '@/components/CostEstimation';
import { Button } from '@/components/ui/button';
import { useInfrastructure } from '@/contexts/InfrastructureContext';

export default function DiagramPage() {
  const [showPalette, setShowPalette] = useState(true);
  const [showCostPanel, setShowCostPanel] = useState(false);
  const { state } = useInfrastructure();

  return (
    <div className="h-[calc(100vh-3.5rem)] flex relative">
      {/* Resource Palette */}
      <AnimatePresence mode="wait">
        {showPalette && (
          <motion.div
            initial={{ width: 0, opacity: 0 }}
            animate={{ width: 'auto', opacity: 1 }}
            exit={{ width: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="border-r bg-card overflow-hidden"
          >
            <ResourcePalette />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Toggle Palette Button */}
      <Button
        variant="ghost"
        size="icon"
        onClick={() => setShowPalette(!showPalette)}
        className="absolute left-0 top-1/2 -translate-y-1/2 z-10 h-12 w-6 rounded-l-none bg-card border border-l-0 hover:bg-muted"
        style={{ left: showPalette ? '280px' : '0' }}
      >
        {showPalette ? <ChevronLeft className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
      </Button>

      {/* Main Canvas */}
      <div className="flex-1 relative">
        <FlowCanvas />
        
        {/* Cost Estimation Toggle */}
        {state.graph && (
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowCostPanel(!showCostPanel)}
            className="absolute bottom-4 right-4 z-10 gap-2"
          >
            <DollarSign className="h-4 w-4" />
            {showCostPanel ? 'Hide Costs' : 'Show Costs'}
          </Button>
        )}
      </div>

      {/* Cost Estimation Panel */}
      <AnimatePresence mode="wait">
        {showCostPanel && state.graph && (
          <motion.div
            initial={{ width: 0, opacity: 0 }}
            animate={{ width: 320, opacity: 1 }}
            exit={{ width: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="border-l bg-card overflow-auto p-4"
          >
            <CostEstimation />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
