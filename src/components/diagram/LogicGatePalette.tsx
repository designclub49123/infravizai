import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Cpu,
  ToggleLeft,
  Lightbulb,
  Plug,
  ChevronDown,
  ChevronRight,
  Plus,
} from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import type { LogicGateType } from '@/types/logic-gates';
import { toast } from 'sonner';

interface LogicGatePaletteProps {
  onAddGate: (type: LogicGateType, label: string) => void;
}

interface GateCategory {
  name: string;
  icon: any;
  gates: { type: LogicGateType; label: string; description: string }[];
}

const categories: GateCategory[] = [
  {
    name: 'Logic Gates',
    icon: Cpu,
    gates: [
      { type: 'and', label: 'AND', description: 'Output HIGH when all inputs HIGH' },
      { type: 'or', label: 'OR', description: 'Output HIGH when any input HIGH' },
      { type: 'not', label: 'NOT', description: 'Inverts the input signal' },
      { type: 'nand', label: 'NAND', description: 'AND gate with inverted output' },
      { type: 'nor', label: 'NOR', description: 'OR gate with inverted output' },
      { type: 'xor', label: 'XOR', description: 'Output HIGH when inputs differ' },
      { type: 'xnor', label: 'XNOR', description: 'XOR gate with inverted output' },
      { type: 'buffer', label: 'Buffer', description: 'Passes signal unchanged' },
    ],
  },
  {
    name: 'Input Sources',
    icon: ToggleLeft,
    gates: [
      { type: 'input', label: 'Input', description: 'Signal input source' },
      { type: 'switch', label: 'Switch', description: 'Manual on/off control' },
      { type: 'clock', label: 'Clock', description: 'Periodic signal generator' },
    ],
  },
  {
    name: 'Output',
    icon: Lightbulb,
    gates: [
      { type: 'output', label: 'Output', description: 'Signal output destination' },
      { type: 'led', label: 'LED', description: 'Visual indicator' },
    ],
  },
  {
    name: 'Power',
    icon: Plug,
    gates: [
      { type: 'vcc', label: 'VCC (5V)', description: 'Power supply voltage' },
      { type: 'ground', label: 'Ground', description: 'Ground reference (0V)' },
    ],
  },
];

export function LogicGatePalette({ onAddGate }: LogicGatePaletteProps) {
  const [expandedCategories, setExpandedCategories] = useState<string[]>(['Logic Gates']);

  const toggleCategory = (name: string) => {
    setExpandedCategories(prev =>
      prev.includes(name) ? prev.filter(c => c !== name) : [...prev, name]
    );
  };

  const handleAddGate = (type: LogicGateType, label: string) => {
    onAddGate(type, label);
    toast.success(`${label} added to circuit`);
  };

  return (
    <div className="w-64 border-r border-border bg-card flex flex-col">
      <div className="p-4 border-b border-border">
        <h3 className="font-semibold flex items-center gap-2">
          <Cpu className="h-4 w-4 text-primary" />
          Logic Gates
        </h3>
        <p className="text-xs text-muted-foreground mt-1">Click to add to circuit</p>
      </div>

      <ScrollArea className="flex-1">
        <div className="p-2">
          {categories.map((category) => (
            <div key={category.name} className="mb-2">
              <button
                onClick={() => toggleCategory(category.name)}
                className="w-full flex items-center gap-2 p-2 rounded-lg hover:bg-muted transition-colors"
              >
                <category.icon className="w-4 h-4 text-muted-foreground" />
                <span className="text-sm font-medium flex-1 text-left">{category.name}</span>
                {expandedCategories.includes(category.name) ? (
                  <ChevronDown className="w-4 h-4 text-muted-foreground" />
                ) : (
                  <ChevronRight className="w-4 h-4 text-muted-foreground" />
                )}
              </button>

              <AnimatePresence>
                {expandedCategories.includes(category.name) && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.2 }}
                    className="overflow-hidden"
                  >
                    <div className="pl-4 space-y-1 py-1">
                      {category.gates.map((gate) => (
                        <Tooltip key={gate.type}>
                          <TooltipTrigger asChild>
                            <button
                              onClick={() => handleAddGate(gate.type, gate.label)}
                              className="w-full flex items-center gap-2 p-2 rounded-lg hover:bg-muted text-left group transition-colors"
                            >
                              <span className="text-sm">{gate.label}</span>
                              <Plus className="w-3 h-3 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity ml-auto" />
                            </button>
                          </TooltipTrigger>
                          <TooltipContent side="right">
                            {gate.description}
                          </TooltipContent>
                        </Tooltip>
                      ))}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          ))}
        </div>
      </ScrollArea>
    </div>
  );
}
