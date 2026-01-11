import { useState, useCallback, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import React from 'react';
import {
  ReactFlow,
  Background,
  Controls,
  MiniMap,
  Node,
  Edge,
  Connection,
  addEdge,
  useNodesState,
  useEdgesState,
  NodeTypes,
  Panel,
  useReactFlow,
  ReactFlowProvider,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import { 
  Play, 
  Pause, 
  RotateCcw, 
  Download, 
  Settings, 
  Zap,
  CircuitBoard,
  Lightbulb,
  ToggleLeft,
  Circle,
  ArrowRight,
  ArrowLeft,
  Clock,
  Power,
  ArrowDownToLine,
  ArrowUpFromLine,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useEnhancedInfrastructure } from '@/contexts/EnhancedInfrastructureContext';
import { LogicGateNode } from '@/components/diagram/LogicGateNode';
import type { CircuitComponent, CircuitConnection, LogicGateType } from '@/types/extended';
import { toast } from 'sonner';

const nodeTypes = {
  logicGate: LogicGateNode,
};

interface LogicGateConfig {
  type: LogicGateType;
  label: string;
  icon: React.ComponentType<any>;
  category: 'basic' | 'input' | 'output' | 'power';
  description: string;
}

const logicGates: LogicGateConfig[] = [
  // Basic Gates
  { type: 'and', label: 'AND', icon: Circle, category: 'basic', description: 'Outputs true only if all inputs are true' },
  { type: 'or', label: 'OR', icon: Circle, category: 'basic', description: 'Outputs true if any input is true' },
  { type: 'not', label: 'NOT', icon: Circle, category: 'basic', description: 'Inverts the input signal' },
  { type: 'nand', label: 'NAND', icon: Circle, category: 'basic', description: 'AND gate followed by NOT' },
  { type: 'nor', label: 'NOR', icon: Circle, category: 'basic', description: 'OR gate followed by NOT' },
  { type: 'xor', label: 'XOR', icon: Circle, category: 'basic', description: 'Outputs true if inputs are different' },
  { type: 'xnor', label: 'XNOR', icon: Circle, category: 'basic', description: 'XOR gate followed by NOT' },
  
  // Input/Output
  { type: 'input', label: 'Input', icon: ArrowRight, category: 'input', description: 'Digital input signal' },
  { type: 'output', label: 'Output', icon: ArrowLeft, category: 'output', description: 'Digital output display' },
  { type: 'led', label: 'LED', icon: Lightbulb, category: 'output', description: 'Light emitting diode' },
  { type: 'switch', label: 'Switch', icon: ToggleLeft, category: 'input', description: 'Manual switch input' },
  { type: 'clock', label: 'Clock', icon: Clock, category: 'input', description: 'Clock signal generator' },
  
  // Power
  { type: 'vcc', label: 'VCC', icon: ArrowUpFromLine, category: 'power', description: 'Power supply (high)' },
  { type: 'ground', label: 'GND', icon: ArrowDownToLine, category: 'power', description: 'Ground (low)' },
];

function CircuitCanvasInner() {
  const { fitView } = useReactFlow();
  const { createCircuitDiagram } = useEnhancedInfrastructure();
  
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);
  const [isSimulating, setIsSimulating] = useState(false);
  const [simulationSpeed, setSimulationSpeed] = useState(1000);
  const [showTruthTable, setShowTruthTable] = useState(false);
  const [selectedGate, setSelectedGate] = useState<LogicGateConfig | null>(null);

  const onConnect = useCallback(
    (params: Connection) => setEdges((eds) => addEdge(params, eds)),
    [setEdges]
  );

  const onDragOver = useCallback((event: React.DragEvent) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = 'move';
  }, []);

  const onDrop = useCallback(
    (event: React.DragEvent) => {
      event.preventDefault();

      const type = event.dataTransfer.getData('application/reactflow');
      const position = { x: event.clientX - 100, y: event.clientY - 100 };

      const newNode: Node = {
        id: `${type}-${Date.now()}`,
        type: 'logicGate',
        position,
        data: {
          type: type as LogicGateType,
          label: type.toUpperCase(),
          state: false,
        },
      };

      setNodes((nds) => nds.concat(newNode));
    },
    [setNodes]
  );

  const onNodeDragStart = (event: React.DragEvent, gateType: LogicGateConfig) => {
    event.dataTransfer.setData('application/reactflow', gateType.type);
    event.dataTransfer.effectAllowed = 'move';
  };

  const runSimulation = useCallback(() => {
    if (nodes.length === 0) {
      toast.error('Please add components to the circuit first');
      return;
    }
    
    setIsSimulating(true);
    
    // Enhanced simulation logic
    const simulationInterval = setInterval(() => {
      setNodes((nds) => 
        nds.map((node) => {
          // Clock component - toggles state
          if (node.data.type === 'clock') {
            return {
              ...node,
              data: { ...node.data, state: !node.data.state },
            };
          }
          
          // LED component - shows output from connected gates
          if (node.data.type === 'led') {
            const connectedEdges = edges.filter(edge => edge.target === node.id);
            const hasActiveInput = connectedEdges.some(edge => {
              const sourceNode = nds.find(n => n.id === edge.source);
              if (!sourceNode) return false;
              
              // Calculate logic gate output
              const sourceType = sourceNode.data.type;
              const inputEdges = edges.filter(e => e.target === sourceNode.id);
              const inputStates = inputEdges.map(e => {
                const inputNode = nds.find(n => n.id === e.source);
                return inputNode?.data.state || false;
              });
              
              switch (sourceType) {
                case 'and':
                  return inputStates.every(s => s);
                case 'or':
                  return inputStates.some(s => s);
                case 'not':
                  return !inputStates[0];
                case 'nand':
                  return !inputStates.every(s => s);
                case 'nor':
                  return !inputStates.some(s => s);
                case 'xor':
                  return inputStates[0] !== inputStates[1];
                case 'xnor':
                  return inputStates[0] === inputStates[1];
                default:
                  return inputStates[0] || false;
              }
            });
            
            return {
              ...node,
              data: { ...node.data, state: hasActiveInput },
            };
          }
          
          // Logic gates - process inputs
          if (['and', 'or', 'not', 'nand', 'nor', 'xor', 'xnor'].includes(node.data.type)) {
            const inputEdges = edges.filter(edge => edge.target === node.id);
            const inputStates = inputEdges.map(edge => {
              const sourceNode = nds.find(n => n.id === edge.source);
              return sourceNode?.data.state || false;
            });
            
            let outputState = false;
            switch (node.data.type) {
              case 'and':
                outputState = inputStates.every(s => s);
                break;
              case 'or':
                outputState = inputStates.some(s => s);
                break;
              case 'not':
                outputState = !inputStates[0];
                break;
              case 'nand':
                outputState = !inputStates.every(s => s);
                break;
              case 'nor':
                outputState = !inputStates.some(s => s);
                break;
              case 'xor':
                outputState = inputStates[0] !== inputStates[1];
                break;
              case 'xnor':
                outputState = inputStates[0] === inputStates[1];
                break;
            }
            
            return {
              ...node,
              data: { ...node.data, state: outputState },
            };
          }
          
          return node;
        })
      );
    }, simulationSpeed);

    // Stop simulation after 30 seconds
    setTimeout(() => {
      clearInterval(simulationInterval);
      setIsSimulating(false);
      toast.success('Simulation completed!');
    }, 30000);
  }, [edges, simulationSpeed, setNodes, nodes]);

  const stopSimulation = useCallback(() => {
    setIsSimulating(false);
  }, []);

  const resetCircuit = useCallback(() => {
    setNodes((nds) =>
      nds.map((node) => ({
        ...node,
        data: { ...node.data, state: false },
      }))
    );
  }, [setNodes]);

  const exportCircuit = useCallback(() => {
    const circuitData = {
      nodes: nodes.map(node => ({
        id: node.id,
        type: node.data.type,
        label: node.data.label,
        position: node.position,
        properties: node.data,
      })),
      edges: edges.map(edge => ({
        id: edge.id,
        source: edge.source,
        target: edge.target,
      })),
    };

    const dataStr = JSON.stringify(circuitData, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,' + encodeURIComponent(dataStr);
    
    const exportFileDefaultName = 'circuit-diagram.json';
    
    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();
  }, [nodes, edges]);

  const generateTruthTable = useCallback(() => {
    // Generate truth table for logic gates
    const logicNodes = nodes.filter(node => 
      ['and', 'or', 'not', 'nand', 'nor', 'xor', 'xnor'].includes(node.data.type)
    );

    if (logicNodes.length === 0) return [];

    const table = [];
    const inputCount = 2; // Simplified for demo
    
    for (let i = 0; i < Math.pow(2, inputCount); i++) {
      const inputs = [(i >> 1) & 1, i & 1];
      const row: any = { inputs };
      
      logicNodes.forEach(node => {
        const { type } = node.data;
        let output = 0;
        
        switch (type) {
          case 'and':
            output = inputs[0] & inputs[1];
            break;
          case 'or':
            output = inputs[0] | inputs[1];
            break;
          case 'not':
            output = inputs[0] ? 0 : 1;
            break;
          case 'nand':
            output = !(inputs[0] & inputs[1]) ? 1 : 0;
            break;
          case 'nor':
            output = !(inputs[0] | inputs[1]) ? 1 : 0;
            break;
          case 'xor':
            output = inputs[0] ^ inputs[1];
            break;
          case 'xnor':
            output = !(inputs[0] ^ inputs[1]) ? 1 : 0;
            break;
        }
        
        row[type] = output;
      });
      
      table.push(row);
    }
    
    return table;
  }, [nodes]);

  const truthTable = useMemo(() => generateTruthTable(), [generateTruthTable]);

  const gatesByCategory = useMemo(() => {
    const categories = {
      basic: logicGates.filter(gate => gate.category === 'basic'),
      input: logicGates.filter(gate => gate.category === 'input'),
      output: logicGates.filter(gate => gate.category === 'output'),
      power: logicGates.filter(gate => gate.category === 'power'),
    };
    return categories;
  }, []);

  return (
    <div className="h-[calc(100vh-3.5rem)] flex">
      {/* Component Palette */}
      <div className="w-80 border-r bg-card overflow-hidden flex flex-col">
        <div className="p-4 border-b">
          <h3 className="font-semibold flex items-center gap-2">
            <CircuitBoard className="h-5 w-5" />
            Circuit Components
          </h3>
        </div>
        
        <ScrollArea className="flex-1 p-4">
          {Object.entries(gatesByCategory).map(([category, gates]) => (
            <div key={category} className="mb-6">
              <h4 className="text-sm font-medium text-muted-foreground mb-3 capitalize">
                {category} Components
              </h4>
              <div className="space-y-2">
                {gates.map((gate) => (
                  <Card
                    key={gate.type}
                    className="cursor-move hover:bg-accent transition-colors"
                    draggable
                    onDragStart={(event) => onNodeDragStart(event, gate)}
                  >
                    <CardContent className="p-3">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded bg-primary/10 flex items-center justify-center">
                          <div className="w-4 h-4 bg-primary rounded-sm" />
                        </div>
                        <div>
                          <p className="font-medium text-sm">{gate.type}</p>
                          <p className="text-xs text-muted-foreground">
                            2 inputs → 1 output
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          ))}
        </ScrollArea>
      </div>

      {/* Main Canvas */}
      <div className="flex-1 relative">
        <ReactFlow
          nodes={nodes}
          edges={edges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          onConnect={onConnect}
          onDrop={onDrop}
          onDragOver={onDragOver}
          nodeTypes={nodeTypes}
          fitView
          className="bg-background"
        >
          <Background color="hsl(var(--muted-foreground) / 0.2)" gap={20} />
          <Controls 
            showInteractive={false}
            className="bg-background border border-border rounded-lg shadow-sm"
          />
          <MiniMap 
            nodeColor="hsl(var(--primary))"
            maskColor="hsl(var(--background) / 0.8)"
            className="bg-background border border-border rounded-lg"
          />
          
          {/* Control Panel */}
          <Panel position="top-right" className="flex flex-col gap-2">
            <div className="flex gap-2">
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant={isSimulating ? "destructive" : "default"}
                    size="sm"
                    onClick={isSimulating ? stopSimulation : runSimulation}
                    disabled={nodes.length === 0}
                  >
                    {isSimulating ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  {isSimulating ? 'Stop Simulation' : 'Run Simulation'}
                </TooltipContent>
              </Tooltip>

              <Tooltip>
                <TooltipTrigger asChild>
                  <Button variant="outline" size="sm" onClick={resetCircuit}>
                    <RotateCcw className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Reset Circuit</TooltipContent>
              </Tooltip>

              <Tooltip>
                <TooltipTrigger asChild>
                  <Button variant="outline" size="sm" onClick={exportCircuit}>
                    <Download className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Export Circuit</TooltipContent>
              </Tooltip>

              <Tooltip>
                <TooltipTrigger asChild>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={() => setShowTruthTable(!showTruthTable)}
                  >
                    <Settings className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Truth Table</TooltipContent>
              </Tooltip>
            </div>

            {isSimulating && (
              <Badge variant="secondary" className="gap-2">
                <Zap className="h-3 w-3 animate-pulse" />
                Simulating
              </Badge>
            )}
          </Panel>
        </ReactFlow>

        {/* Truth Table Panel */}
        <AnimatePresence>
          {showTruthTable && truthTable.length > 0 && (
            <motion.div
              initial={{ width: 0, opacity: 0 }}
              animate={{ width: 400, opacity: 1 }}
              exit={{ width: 0, opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="absolute right-0 top-0 h-full border-l bg-card overflow-hidden"
            >
              <div className="p-4 border-b">
                <h3 className="font-semibold">Truth Table</h3>
              </div>
              <ScrollArea className="flex-1 p-4">
                <div className="space-y-4">
                  {truthTable.map((row, index) => (
                    <div key={index} className="flex gap-4 text-sm">
                      <div className="flex gap-2">
                        {row.inputs.map((input: number, i: number) => (
                          <Badge key={i} variant={input ? "default" : "secondary"}>
                            {input}
                          </Badge>
                        ))}
                      </div>
                      <div className="flex gap-2">
                        {Object.entries(row).filter(([key]) => key !== 'inputs').map(([gate, output]) => (
                          <Badge key={gate} variant={(output as number) ? "default" : "secondary"}>
                            {String(gate)}: {String(output)}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

export default function CircuitPage() {
  return (
    <ReactFlowProvider>
      <CircuitCanvasInner />
    </ReactFlowProvider>
  );
}
