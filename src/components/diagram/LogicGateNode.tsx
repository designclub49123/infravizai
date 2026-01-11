import { memo } from 'react';
import { Handle, Position } from '@xyflow/react';
import { motion } from 'framer-motion';
import {
  CircleArrowRight,
  CircleArrowLeft,
  Clock,
  Lightbulb,
  ToggleLeft,
  ArrowDownToLine,
  ArrowUpFromLine,
  Circle,
} from 'lucide-react';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import type { LogicGateType, LOGIC_GATES } from '@/types/logic-gates';

interface LogicGateNodeProps {
  data: {
    type: LogicGateType;
    label: string;
    state?: boolean;
  };
  selected?: boolean;
}

const gateColors: Record<string, { bg: string; border: string; icon: string }> = {
  'gate-logic': { bg: 'bg-cyan-500/10', border: 'border-cyan-500/50 hover:border-cyan-500', icon: 'text-cyan-500' },
  'gate-io': { bg: 'bg-emerald-500/10', border: 'border-emerald-500/50 hover:border-emerald-500', icon: 'text-emerald-500' },
  'gate-source': { bg: 'bg-amber-500/10', border: 'border-amber-500/50 hover:border-amber-500', icon: 'text-amber-500' },
  'gate-output': { bg: 'bg-rose-500/10', border: 'border-rose-500/50 hover:border-rose-500', icon: 'text-rose-500' },
  'gate-power': { bg: 'bg-violet-500/10', border: 'border-violet-500/50 hover:border-violet-500', icon: 'text-violet-500' },
};

const iconMap: Record<string, any> = {
  CircleArrowRight,
  CircleArrowLeft,
  Clock,
  Lightbulb,
  ToggleLeft,
  ArrowDownToLine,
  ArrowUpFromLine,
};

// SVG paths for logic gate symbols
function GateSymbol({ type }: { type: LogicGateType }) {
  const baseClass = "w-10 h-8";
  
  switch (type) {
    case 'and':
      return (
        <svg viewBox="0 0 40 32" className={baseClass}>
          <path
            d="M4 4 L20 4 Q36 4 36 16 Q36 28 20 28 L4 28 Z"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          />
        </svg>
      );
    case 'or':
      return (
        <svg viewBox="0 0 40 32" className={baseClass}>
          <path
            d="M4 4 Q12 16 4 28 Q20 28 28 28 Q40 16 28 4 Q20 4 4 4"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          />
        </svg>
      );
    case 'not':
      return (
        <svg viewBox="0 0 40 32" className={baseClass}>
          <path
            d="M4 4 L28 16 L4 28 Z"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          />
          <circle cx="32" cy="16" r="4" fill="none" stroke="currentColor" strokeWidth="2" />
        </svg>
      );
    case 'nand':
      return (
        <svg viewBox="0 0 44 32" className={baseClass}>
          <path
            d="M4 4 L20 4 Q32 4 32 16 Q32 28 20 28 L4 28 Z"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          />
          <circle cx="36" cy="16" r="4" fill="none" stroke="currentColor" strokeWidth="2" />
        </svg>
      );
    case 'nor':
      return (
        <svg viewBox="0 0 44 32" className={baseClass}>
          <path
            d="M4 4 Q12 16 4 28 Q16 28 24 28 Q32 16 24 4 Q16 4 4 4"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          />
          <circle cx="36" cy="16" r="4" fill="none" stroke="currentColor" strokeWidth="2" />
        </svg>
      );
    case 'xor':
      return (
        <svg viewBox="0 0 40 32" className={baseClass}>
          <path
            d="M8 4 Q16 16 8 28 Q20 28 28 28 Q40 16 28 4 Q20 4 8 4"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          />
          <path
            d="M4 4 Q12 16 4 28"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          />
        </svg>
      );
    case 'xnor':
      return (
        <svg viewBox="0 0 44 32" className={baseClass}>
          <path
            d="M8 4 Q16 16 8 28 Q20 28 24 28 Q32 16 24 4 Q20 4 8 4"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          />
          <path
            d="M4 4 Q12 16 4 28"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          />
          <circle cx="36" cy="16" r="4" fill="none" stroke="currentColor" strokeWidth="2" />
        </svg>
      );
    default:
      return <Circle className="w-8 h-8" />;
  }
}

function getGateConfig(type: LogicGateType) {
  const configs: Record<LogicGateType, { inputs: number; outputs: number; color: string }> = {
    and: { inputs: 2, outputs: 1, color: 'gate-logic' },
    or: { inputs: 2, outputs: 1, color: 'gate-logic' },
    not: { inputs: 1, outputs: 1, color: 'gate-logic' },
    nand: { inputs: 2, outputs: 1, color: 'gate-logic' },
    nor: { inputs: 2, outputs: 1, color: 'gate-logic' },
    xor: { inputs: 2, outputs: 1, color: 'gate-logic' },
    xnor: { inputs: 2, outputs: 1, color: 'gate-logic' },
    buffer: { inputs: 1, outputs: 1, color: 'gate-io' },
    input: { inputs: 0, outputs: 1, color: 'gate-io' },
    output: { inputs: 1, outputs: 0, color: 'gate-io' },
    clock: { inputs: 0, outputs: 1, color: 'gate-source' },
    led: { inputs: 1, outputs: 0, color: 'gate-output' },
    switch: { inputs: 0, outputs: 1, color: 'gate-source' },
    ground: { inputs: 1, outputs: 0, color: 'gate-power' },
    vcc: { inputs: 0, outputs: 1, color: 'gate-power' },
  };
  return configs[type] || configs.and;
}

export const LogicGateNode = memo(({ data, selected }: LogicGateNodeProps) => {
  const config = getGateConfig(data.type);
  const colors = gateColors[config.color];
  const isLogicGate = ['and', 'or', 'not', 'nand', 'nor', 'xor', 'xnor'].includes(data.type);
  const IconComponent = iconMap[data.type === 'input' ? 'CircleArrowRight' : 
    data.type === 'output' ? 'CircleArrowLeft' : 
    data.type === 'clock' ? 'Clock' :
    data.type === 'led' ? 'Lightbulb' :
    data.type === 'switch' ? 'ToggleLeft' :
    data.type === 'ground' ? 'ArrowDownToLine' :
    data.type === 'vcc' ? 'ArrowUpFromLine' : 'Circle'];

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          whileHover={{ scale: 1.02 }}
          className={`
            px-3 py-2 rounded-xl border-2 shadow-sm cursor-pointer transition-all duration-200
            ${colors.bg} ${colors.border}
            ${selected ? 'ring-2 ring-primary ring-offset-2 ring-offset-background' : ''}
          `}
        >
          {/* Input handles */}
          {config.inputs > 0 && (
            <>
              {config.inputs === 1 ? (
                <Handle
                  type="target"
                  position={Position.Left}
                  id="in-1"
                  className="!bg-muted-foreground !border-2 !border-background"
                  style={{ top: '50%' }}
                />
              ) : (
                <>
                  <Handle
                    type="target"
                    position={Position.Left}
                    id="in-1"
                    className="!bg-muted-foreground !border-2 !border-background"
                    style={{ top: '30%' }}
                  />
                  <Handle
                    type="target"
                    position={Position.Left}
                    id="in-2"
                    className="!bg-muted-foreground !border-2 !border-background"
                    style={{ top: '70%' }}
                  />
                </>
              )}
            </>
          )}

          <div className="flex flex-col items-center gap-1">
            <div className={colors.icon}>
              {isLogicGate ? (
                <GateSymbol type={data.type} />
              ) : (
                IconComponent && <IconComponent className="w-6 h-6" />
              )}
            </div>
            <span className="text-xs font-medium">{data.label}</span>
            {data.state !== undefined && (
              <div className={`w-2 h-2 rounded-full ${data.state ? 'bg-green-500' : 'bg-red-500'}`} />
            )}
          </div>

          {/* Output handles */}
          {config.outputs > 0 && (
            <Handle
              type="source"
              position={Position.Right}
              id="out-1"
              className="!bg-primary !border-2 !border-background"
            />
          )}
        </motion.div>
      </TooltipTrigger>
      <TooltipContent>
        <p className="font-semibold">{data.label}</p>
        <p className="text-xs text-muted-foreground capitalize">{data.type.replace('-', ' ')} Gate</p>
      </TooltipContent>
    </Tooltip>
  );
});

LogicGateNode.displayName = 'LogicGateNode';
