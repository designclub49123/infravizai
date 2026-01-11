import { useCallback, useMemo, useRef } from 'react';
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
  EdgeTypes,
  Panel,
  useReactFlow,
  ReactFlowProvider,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import { motion } from 'framer-motion';
import { toPng, toSvg } from 'html-to-image';
import dagre from 'dagre';
import { 
  Download, 
  ImageIcon, 
  LayoutGrid, 
  ZoomIn, 
  ZoomOut,
  Maximize2,
  Undo2,
  Redo2,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { useInfrastructure } from '@/contexts/InfrastructureContext';
import { ResourceNode } from './ResourceNode';
import type { InfraNode, InfraEdge, InfraGraph } from '@/types/infrastructure';
import { toast } from 'sonner';

const nodeTypes = {
  resource: ResourceNode,
};

function convertToFlowNodes(nodes: InfraNode[]): Node[] {
  return nodes.map(node => ({
    id: node.id,
    type: 'resource',
    position: node.position,
    data: {
      type: node.type,
      label: node.label,
      properties: node.properties,
    },
  }));
}

function convertToFlowEdges(edges: InfraEdge[]): Edge[] {
  return edges.map(edge => ({
    id: edge.id,
    source: edge.source,
    target: edge.target,
    label: edge.label,
    type: 'smoothstep',
    animated: edge.type === 'connects',
    style: { stroke: 'hsl(var(--muted-foreground))', strokeWidth: 2 },
    labelStyle: { fill: 'hsl(var(--foreground))', fontSize: 10 },
    labelBgStyle: { fill: 'hsl(var(--background))' },
  }));
}

function getLayoutedElements(nodes: Node[], edges: Edge[], direction = 'TB') {
  const dagreGraph = new dagre.graphlib.Graph();
  dagreGraph.setDefaultEdgeLabel(() => ({}));
  dagreGraph.setGraph({ rankdir: direction, nodesep: 100, ranksep: 80 });

  nodes.forEach((node) => {
    dagreGraph.setNode(node.id, { width: 180, height: 80 });
  });

  edges.forEach((edge) => {
    dagreGraph.setEdge(edge.source, edge.target);
  });

  dagre.layout(dagreGraph);

  const layoutedNodes = nodes.map((node) => {
    const nodeWithPosition = dagreGraph.node(node.id);
    return {
      ...node,
      position: {
        x: nodeWithPosition.x - 90,
        y: nodeWithPosition.y - 40,
      },
    };
  });

  return { nodes: layoutedNodes, edges };
}

function FlowCanvasInner() {
  const flowRef = useRef<HTMLDivElement>(null);
  const { state, setGraph, undo, redo, canUndo, canRedo } = useInfrastructure();
  const { fitView, zoomIn, zoomOut } = useReactFlow();

  const initialNodes = useMemo(
    () => (state.graph ? convertToFlowNodes(state.graph.nodes) : []),
    [state.graph]
  );

  const initialEdges = useMemo(
    () => (state.graph ? convertToFlowEdges(state.graph.edges) : []),
    [state.graph]
  );

  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);

  const onConnect = useCallback(
    (params: Connection) => {
      setEdges((eds) => addEdge({ ...params, type: 'smoothstep', animated: true }, eds));
    },
    [setEdges]
  );

  const onNodeDragStop = useCallback(
    (_: any, node: Node) => {
      if (!state.graph) return;
      
      const updatedNodes = state.graph.nodes.map((n) =>
        n.id === node.id ? { ...n, position: node.position } : n
      );
      
      setGraph({
        ...state.graph,
        nodes: updatedNodes,
        metadata: { ...state.graph.metadata, updatedAt: new Date().toISOString() },
      });
    },
    [state.graph, setGraph]
  );

  const handleAutoLayout = useCallback(() => {
    const { nodes: layoutedNodes, edges: layoutedEdges } = getLayoutedElements(nodes, edges);
    setNodes(layoutedNodes);
    setEdges(layoutedEdges);
    
    setTimeout(() => fitView({ padding: 0.2 }), 50);
    toast.success('Layout applied!');
  }, [nodes, edges, setNodes, setEdges, fitView]);

  const handleExport = useCallback(async (format: 'png' | 'svg') => {
    if (!flowRef.current) return;

    try {
      const dataUrl = format === 'png' 
        ? await toPng(flowRef.current, { backgroundColor: 'transparent', quality: 1 })
        : await toSvg(flowRef.current);

      const link = document.createElement('a');
      link.download = `infrastructure-diagram.${format}`;
      link.href = dataUrl;
      link.click();
      
      toast.success(`Diagram exported as ${format.toUpperCase()}`);
    } catch (error) {
      toast.error('Failed to export diagram');
    }
  }, []);

  if (!state.graph || state.graph.nodes.length === 0) {
    return (
      <div className="h-full flex items-center justify-center bg-muted/30">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center"
        >
          <LayoutGrid className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
          <p className="text-muted-foreground">No diagram yet</p>
          <p className="text-sm text-muted-foreground/70">Generate infrastructure from the home page</p>
        </motion.div>
      </div>
    );
  }

  return (
    <div ref={flowRef} className="h-full w-full">
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        onNodeDragStop={onNodeDragStop}
        nodeTypes={nodeTypes}
        fitView
        snapToGrid
        snapGrid={[15, 15]}
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
        
        <Panel position="top-right" className="flex gap-2">
          <Tooltip>
            <TooltipTrigger asChild>
              <Button variant="outline" size="icon" onClick={undo} disabled={!canUndo}>
                <Undo2 className="h-4 w-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>Undo</TooltipContent>
          </Tooltip>
          
          <Tooltip>
            <TooltipTrigger asChild>
              <Button variant="outline" size="icon" onClick={redo} disabled={!canRedo}>
                <Redo2 className="h-4 w-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>Redo</TooltipContent>
          </Tooltip>
          
          <Tooltip>
            <TooltipTrigger asChild>
              <Button variant="outline" size="icon" onClick={handleAutoLayout}>
                <LayoutGrid className="h-4 w-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>Auto Layout</TooltipContent>
          </Tooltip>
          
          <Tooltip>
            <TooltipTrigger asChild>
              <Button variant="outline" size="icon" onClick={() => fitView({ padding: 0.2 })}>
                <Maximize2 className="h-4 w-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>Fit View</TooltipContent>
          </Tooltip>
          
          <Tooltip>
            <TooltipTrigger asChild>
              <Button variant="outline" size="icon" onClick={() => handleExport('png')}>
                <ImageIcon className="h-4 w-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>Export PNG</TooltipContent>
          </Tooltip>
          
          <Tooltip>
            <TooltipTrigger asChild>
              <Button variant="outline" size="icon" onClick={() => handleExport('svg')}>
                <Download className="h-4 w-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>Export SVG</TooltipContent>
          </Tooltip>
        </Panel>
      </ReactFlow>
    </div>
  );
}

export function FlowCanvas() {
  return (
    <ReactFlowProvider>
      <FlowCanvasInner />
    </ReactFlowProvider>
  );
}
