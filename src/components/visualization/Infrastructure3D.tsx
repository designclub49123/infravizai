import { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence, useMotionValue, useTransform } from 'framer-motion';
import { 
  Box, 
  Layers, 
  RotateCw, 
  Maximize2, 
  Grid, 
  Zap, 
  Database, 
  Server,
  Globe,
  Shield,
  Cpu,
  HardDrive,
  Wifi,
  Cloud
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import { Switch } from '@/components/ui/switch';
import { useInfrastructure } from '@/contexts/InfrastructureContext';
import type { InfraNode, InfraEdge } from '@/types/infrastructure';

interface Infrastructure3DProps {
  nodes: InfraNode[];
  edges: InfraEdge[];
  className?: string;
}

const resourceModels: Record<string, { color: string; icon: any; scale: number }> = {
  'vpc': { color: '#4F46E5', icon: Globe, scale: 3 },
  'subnet': { color: '#06B6D4', icon: Grid, scale: 2 },
  'ec2': { color: '#F59E0B', icon: Server, scale: 1 },
  'rds': { color: '#10B981', icon: Database, scale: 1.2 },
  's3': { color: '#8B5CF6', icon: HardDrive, scale: 1.5 },
  'lambda': { color: '#EF4444', icon: Zap, scale: 0.8 },
  'alb': { color: '#3B82F6', icon: Layers, scale: 1.1 },
  'api-gateway': { color: '#14B8A6', icon: Cloud, scale: 1.3 },
  'security-group': { color: '#F97316', icon: Shield, scale: 0.9 },
  'iam': { color: '#6366F1', icon: Shield, scale: 0.7 },
  'cloudfront': { color: '#84CC16', icon: Globe, scale: 1.4 },
  'route53': { color: '#0EA5E9', icon: Wifi, scale: 1 },
};

export function Infrastructure3D({ nodes, edges, className }: Infrastructure3DProps) {
  const [viewMode, setViewMode] = useState<'3d' | 'layers' | 'network'>('3d');
  const [rotationSpeed, setRotationSpeed] = useState([0.5]);
  const [autoRotate, setAutoRotate] = useState(true);
  const [showConnections, setShowConnections] = useState(true);
  const [selectedNode, setSelectedNode] = useState<InfraNode | null>(null);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [rotation, setRotation] = useState(0);
  
  const rotationValue = useMotionValue(0);
  const scaleValue = useMotionValue(1);
  
  useEffect(() => {
    if (autoRotate) {
      const interval = setInterval(() => {
        setRotation(prev => (prev + rotationSpeed[0]) % 360);
      }, 50);
      return () => clearInterval(interval);
    }
  }, [autoRotate, rotationSpeed]);

  const getNodePosition = useCallback((node: InfraNode, index: number) => {
    if (viewMode === 'layers') {
      // Layer view - arrange in layers
      const layer = Math.floor(index / 5);
      const positionInLayer = index % 5;
      return {
        x: (positionInLayer - 2) * 150,
        y: layer * 120,
        z: 0
      };
    } else if (viewMode === 'network') {
      // Network view - circular arrangement
      const angle = (index / nodes.length) * Math.PI * 2;
      const radius = 200;
      return {
        x: Math.cos(angle) * radius,
        y: 0,
        z: Math.sin(angle) * radius
      };
    } else {
      // 3D view - use existing position or arrange in 3D space
      return {
        x: node.position.x || (Math.random() - 0.5) * 400,
        y: node.position.y || (Math.random() - 0.5) * 200,
        z: (Math.random() - 0.5) * 400
      };
    }
  }, [viewMode, nodes.length]);

  const handleNodeClick = useCallback((node: InfraNode) => {
    setSelectedNode(node);
  }, []);

  const handleFullscreen = useCallback(() => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen();
    } else {
      document.exitFullscreen();
    }
    setIsFullscreen(!isFullscreen);
  }, [isFullscreen]);

  return (
    <div className={`relative ${className}`}>
      <div className="w-full h-full min-h-[500px] bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 rounded-lg overflow-hidden">
        {/* 3D Visualization Container */}
        <div className="relative w-full h-full">
          {/* Grid Background */}
          <div className="absolute inset-0 opacity-20">
            <div className="grid grid-cols-8 grid-rows-8 h-full">
              {Array.from({ length: 64 }).map((_, i) => (
                <div key={i} className="border border-purple-500/20" />
              ))}
            </div>
          </div>

          {/* Nodes */}
          <motion.div
            className="absolute inset-0 flex items-center justify-center"
            style={{ perspective: '1000px' }}
          >
            <motion.div
              className="relative w-full h-full"
              animate={{ 
                rotateY: rotation,
                scale: viewMode === '3d' ? 1 : 0.8
              }}
              transition={{ duration: 0.1 }}
              style={{ 
                transformStyle: 'preserve-3d',
                transform: `rotateX(-20deg) rotateY(${rotation}deg)`
              }}
            >
              {nodes.map((node, index) => {
                const model = resourceModels[node.type] || resourceModels.ec2;
                const position = getNodePosition(node, index);
                const IconComponent = model.icon;
                
                return (
                  <motion.div
                    key={node.id}
                    className="absolute cursor-pointer"
                    style={{
                      transform: `translate3d(${position.x}px, ${position.y}px, ${position.z}px)`,
                      transformStyle: 'preserve-3d'
                    }}
                    whileHover={{ scale: 1.1 }}
                    onClick={() => handleNodeClick(node)}
                  >
                    <motion.div
                      className="relative"
                      animate={{
                        y: Math.sin(Date.now() * 0.001 + index) * 5
                      }}
                      transition={{ duration: 2, repeat: Infinity }}
                    >
                      {/* Node Container */}
                      <div
                        className="rounded-lg border-2 p-3 backdrop-blur-sm shadow-lg"
                        style={{
                          backgroundColor: `${model.color}20`,
                          borderColor: model.color,
                          boxShadow: `0 0 20px ${model.color}40`
                        }}
                      >
                        <div className="flex flex-col items-center gap-2">
                          <IconComponent 
                            className="w-8 h-8" 
                            style={{ color: model.color }}
                          />
                          <span className="text-xs text-white font-medium text-center">
                            {node.label}
                          </span>
                        </div>
                      </div>
                      
                      {/* Glow Effect */}
                      <div
                        className="absolute inset-0 rounded-lg"
                        style={{
                          background: `radial-gradient(circle, ${model.color}40 0%, transparent 70%)`,
                          filter: 'blur(10px)',
                          transform: 'scale(1.5)',
                          zIndex: -1
                        }}
                      />
                    </motion.div>
                  </motion.div>
                );
              })}

              {/* Connections */}
              {showConnections && edges.map((edge, index) => {
                const sourceNode = nodes.find(n => n.id === edge.source);
                const targetNode = nodes.find(n => n.id === edge.target);
                
                if (!sourceNode || !targetNode) return null;
                
                const sourcePos = getNodePosition(sourceNode, nodes.indexOf(sourceNode));
                const targetPos = getNodePosition(targetNode, nodes.indexOf(targetNode));
                
                return (
                  <svg
                    key={edge.id}
                    className="absolute inset-0 pointer-events-none"
                    style={{ overflow: 'visible' }}
                  >
                    <motion.line
                      x1={sourcePos.x + 200}
                      y1={sourcePos.y + 200}
                      x2={targetPos.x + 200}
                      y2={targetPos.y + 200}
                      stroke="#3b82f6"
                      strokeWidth="2"
                      strokeDasharray="5,5"
                      opacity={0.6}
                      animate={{
                        strokeDashoffset: [0, 10]
                      }}
                      transition={{
                        duration: 1,
                        repeat: Infinity,
                        ease: "linear"
                      }}
                    />
                  </svg>
                );
              })}
            </motion.div>
          </motion.div>

          {/* Floating Particles */}
          {Array.from({ length: 20 }).map((_, i) => (
            <motion.div
              key={i}
              className="absolute w-1 h-1 bg-blue-400 rounded-full"
              initial={{
                x: Math.random() * 100,
                y: Math.random() * 100,
                opacity: 0
              }}
              animate={{
                x: [Math.random() * 100, Math.random() * 100],
                y: [Math.random() * 100, Math.random() * 100],
                opacity: [0, 1, 0]
              }}
              transition={{
                duration: 3 + Math.random() * 2,
                repeat: Infinity,
                delay: Math.random() * 2
              }}
            />
          ))}
        </div>
      </div>

      {/* Controls Panel */}
      <Card className="absolute top-4 left-4 w-80 bg-black/80 backdrop-blur-sm border-gray-700">
        <CardHeader className="pb-3">
          <CardTitle className="text-white text-lg flex items-center gap-2">
            <Box className="h-5 w-5" />
            3D Controls
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <label className="text-white text-sm">View Mode</label>
            <Select value={viewMode} onValueChange={(value: any) => setViewMode(value)}>
              <SelectTrigger className="bg-gray-800 border-gray-600 text-white">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-gray-800 border-gray-600">
                <SelectItem value="3d">3D Perspective</SelectItem>
                <SelectItem value="layers">Layer View</SelectItem>
                <SelectItem value="network">Network View</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <label className="text-white text-sm">Rotation Speed</label>
            <Slider
              value={rotationSpeed}
              onValueChange={setRotationSpeed}
              max={5}
              min={0}
              step={0.1}
              className="w-full"
            />
          </div>

          <div className="flex items-center justify-between">
            <label className="text-white text-sm">Auto Rotate</label>
            <Switch
              checked={autoRotate}
              onCheckedChange={setAutoRotate}
            />
          </div>

          <div className="flex items-center justify-between">
            <label className="text-white text-sm">Show Connections</label>
            <Switch
              checked={showConnections}
              onCheckedChange={setShowConnections}
            />
          </div>

          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handleFullscreen}
              className="bg-gray-800 border-gray-600 text-white hover:bg-gray-700"
            >
              <Maximize2 className="h-4 w-4 mr-2" />
              Fullscreen
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setRotation(0)}
              className="bg-gray-800 border-gray-600 text-white hover:bg-gray-700"
            >
              <RotateCw className="h-4 w-4 mr-2" />
              Reset
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Resources Legend */}
      <Card className="absolute top-4 right-4 w-64 bg-black/80 backdrop-blur-sm border-gray-700">
        <CardHeader className="pb-3">
          <CardTitle className="text-white text-lg">Resources</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {Object.entries(resourceModels).slice(0, 6).map(([type, model]) => {
              const IconComponent = model.icon;
              return (
                <div key={type} className="flex items-center gap-2 text-white text-sm">
                  <div
                    className="w-3 h-3 rounded-full"
                    style={{ backgroundColor: model.color }}
                  />
                  <IconComponent className="h-4 w-4" />
                  <span className="capitalize">{type.replace('-', ' ')}</span>
                  <Badge variant="secondary" className="ml-auto">
                    {nodes.filter(n => n.type === type).length}
                  </Badge>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Selected Node Info */}
      <AnimatePresence>
        {selectedNode && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className="absolute bottom-4 left-4 right-4"
          >
            <Card className="bg-black/80 backdrop-blur-sm border-gray-700">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-white">{selectedNode.label}</CardTitle>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setSelectedNode(null)}
                    className="text-white hover:bg-gray-700"
                  >
                    ×
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-4 text-white text-sm">
                  <div>
                    <span className="text-gray-400">Type:</span>
                    <div className="capitalize">{selectedNode.type}</div>
                  </div>
                  <div>
                    <span className="text-gray-400">ID:</span>
                    <div className="font-mono text-xs">{selectedNode.id}</div>
                  </div>
                  {Object.entries(selectedNode.properties).slice(0, 4).map(([key, value]) => (
                    <div key={key}>
                      <span className="text-gray-400 capitalize">{key}:</span>
                      <div>{String(value)}</div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
