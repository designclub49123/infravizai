import { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Activity, 
  Zap, 
  TrendingUp, 
  TrendingDown, 
  Play, 
  Pause, 
  RotateCcw,
  Settings,
  BarChart3,
  LineChart,
  PieChart,
  Cpu,
  HardDrive,
  Wifi,
  Users,
  Clock,
  AlertTriangle,
  CheckCircle,
  Brain,
  Target,
  Gauge,
  RefreshCw
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useEnhancedInfrastructure } from '@/contexts/EnhancedInfrastructureContext';
import { toast } from 'sonner';

interface SimulationConfig {
  duration: number; // minutes
  users: number;
  requestsPerSecond: number;
  networkLatency: number; // ms
  cpuLoad: number; // percentage
  memoryUsage: number; // percentage
  diskIO: number; // percentage
  failRate: number; // percentage
}

interface SimulationResult {
  timestamp: number;
  cpu: number;
  memory: number;
  disk: number;
  network: number;
  requests: number;
  errors: number;
  responseTime: number;
  throughput: number;
  users: number;
}

interface ResourcePerformance {
  id: string;
  name: string;
  type: string;
  cpu: number;
  memory: number;
  disk: number;
  network: number;
  responseTime: number;
  throughput: number;
  errorRate: number;
  status: 'optimal' | 'warning' | 'critical';
}

interface LoadTestScenario {
  id: string;
  name: string;
  description: string;
  users: number;
  duration: number;
  rampUp: number;
  pattern: 'constant' | 'spike' | 'gradual' | 'stress';
}

export function PerformanceSimulator() {
  const { state: { currentDiagram } } = useEnhancedInfrastructure();
  const [isSimulating, setIsSimulating] = useState(false);
  const [simulationResults, setSimulationResults] = useState<SimulationResult[]>([]);
  const [resourcePerformance, setResourcePerformance] = useState<ResourcePerformance[]>([]);
  const [config, setConfig] = useState<SimulationConfig>({
    duration: 10,
    users: 100,
    requestsPerSecond: 50,
    networkLatency: 50,
    cpuLoad: 60,
    memoryUsage: 70,
    diskIO: 40,
    failRate: 1
  });
  const [selectedScenario, setSelectedScenario] = useState<string>('constant');
  const [simulationTime, setSimulationTime] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const animationRef = useRef<number>();

  const scenarios: LoadTestScenario[] = [
    {
      id: 'constant',
      name: 'Constant Load',
      description: 'Steady user load over time',
      users: 100,
      duration: 10,
      rampUp: 1,
      pattern: 'constant'
    },
    {
      id: 'spike',
      name: 'Traffic Spike',
      description: 'Sudden increase in traffic',
      users: 500,
      duration: 10,
      rampUp: 0.5,
      pattern: 'spike'
    },
    {
      id: 'gradual',
      name: 'Gradual Increase',
      description: 'Slowly increasing user load',
      users: 300,
      duration: 10,
      rampUp: 5,
      pattern: 'gradual'
    },
    {
      id: '4',
      name: 'Lambda Functions',
      type: 'lambda',
      cpu: 55,
      memory: 68,
      disk: 15,
      network: 92,
      responseTime: 180,
      throughput: 450,
      errorRate: 1.2,
      status: 'warning'
    }
  ];

  return (
    <div>
      {mockResources.map(resource => (
        <div key={resource.id}>
          <h2>{resource.name}</h2>
          <p>CPU: {resource.cpu}%</p>
          <p>Memory: {resource.memory}%</p>
          <p>Disk: {resource.disk}%</p>
          <p>Network: {resource.network}%</p>
          <p>Response Time: {resource.responseTime}ms</p>
          <p>Throughput: {resource.throughput} requests/s</p>
          <p>Error Rate: {resource.errorRate}%</p>
          <p>Status: {resource.status}</p>
        </div>
      ))}
    </div>
  );
}, []);

const scenarios: LoadTestScenario[] = [
  {
    id: 'constant',
    name: 'Constant Load',
    description: 'Steady user load over time',
    users: 100,
    duration: 10,
    rampUp: 1,
    pattern: 'constant'
  },
  {
    id: 'spike',
    name: 'Traffic Spike',
    description: 'Sudden increase in traffic',
    users: 500,
    duration: 10,
    rampUp: 0.5,
    pattern: 'spike'
  },
  {
    id: 'gradual',
    name: 'Gradual Increase',
    description: 'Slowly increasing user load',
    users: 300,
    duration: 10,
    rampUp: 5,
    pattern: 'gradual'
  },
  {
    id: 'stress',
    name: 'Stress Test',
    description: 'Maximum system capacity test',
    users: 1000,
    duration: 15,
    rampUp: 2,
    pattern: 'stress'
  }
];
        cpu: 45,
        memory: 62,
        disk: 38,
        network: 75,
        responseTime: 120,
        throughput: 850,
        errorRate: 0.5,
        status: 'optimal'
      },
      {
        id: '2',
        name: 'Production RDS',
        type: 'rds',
        cpu: 78,
        memory: 85,
        disk: 92,
        network: 45,
        responseTime: 45,
        throughput: 1200,
        errorRate: 0.1,
        status: 'warning'
      },
      {
        id: '3',
        name: 'Load Balancer',
        type: 'alb',
        cpu: 35,
        memory: 48,
        disk: 25,
        network: 88,
        responseTime: 25,
        throughput: 2000,
        errorRate: 0,
        status: 'optimal'
      },
      {
        id: '4',
        name: 'Lambda Functions',
        type: 'lambda',
        cpu: 55,
        memory: 68,
        disk: 15,
        network: 92,
        responseTime: 180,
        throughput: 450,
        errorRate: 1.2,
        status: 'warning'
      }
    ];

    setResourcePerformance(mockResources);
  }, []);

  const startSimulation = useCallback(() => {
    setIsSimulating(true);
    setIsPaused(false);
    setSimulationTime(0);
    setSimulationResults([]);

    const scenario = scenarios.find(s => s.id === selectedScenario);
    if (scenario) {
      setConfig(prev => ({
        ...prev,
        users: scenario.users,
        duration: scenario.duration
      }));
    }

    runSimulation();
  }, [selectedScenario]);

  const runSimulation = useCallback(() => {
    let currentTime = 0;
    const interval = 100; // 100ms per simulation step

    const simulate = () => {
      if (!isPaused && currentTime < config.duration * 60) {
        const result = generateSimulationResult(currentTime);
        setSimulationResults(prev => [...prev, result]);
        setSimulationTime(currentTime);
        currentTime += 0.1; // 0.1 minute increments

        // Update resource performance
        updateResourcePerformance(result);

        animationRef.current = requestAnimationFrame(simulate);
      } else {
        setIsSimulating(false);
      }
    };

    simulate();
  }, [config, isPaused]);

  const generateSimulationResult = (time: number): SimulationResult => {
    const scenario = scenarios.find(s => s.id === selectedScenario);
    let userMultiplier = 1;

    if (scenario) {
      switch (scenario.pattern) {
        case 'spike':
          userMultiplier = time > 2 && time < 4 ? 5 : 1;
          break;
        case 'gradual':
          userMultiplier = Math.min(3, 1 + (time / scenario.duration) * 2);
          break;
        case 'stress':
          userMultiplier = Math.min(10, 1 + (time / scenario.duration) * 9);
          break;
        default:
          userMultiplier = 1;
      }
    }

    const baseUsers = config.users * userMultiplier;
    const noise = () => (Math.random() - 0.5) * 0.2; // ±10% noise
    
    const cpu = Math.max(0, Math.min(100, config.cpuLoad * userMultiplier + noise() * 20));
    const memory = Math.max(0, Math.min(100, config.memoryUsage * userMultiplier + noise() * 15));
    const disk = Math.max(0, Math.min(100, config.diskIO + noise() * 10));
    const network = Math.max(0, Math.min(100, 75 * userMultiplier + noise() * 25));
    
    const requests = baseUsers * (1 + noise());
    const errors = requests * (config.failRate / 100) * (1 + noise());
    const responseTime = 50 + (cpu / 100) * 200 + (memory / 100) * 150 + config.networkLatency;
    const throughput = Math.max(0, requests * (1 - errors / requests));

    return {
      timestamp: time,
      cpu,
      memory,
      disk,
      network,
      requests,
      errors,
      responseTime,
      throughput,
      users: baseUsers
    };
  };

  const updateResourcePerformance = (result: SimulationResult) => {
    setResourcePerformance(prev => prev.map(resource => {
      const loadFactor = result.users / config.users;
      const newCpu = Math.min(100, resource.cpu * loadFactor + (Math.random() - 0.5) * 10);
      const newMemory = Math.min(100, resource.memory * loadFactor + (Math.random() - 0.5) * 8);
      const newResponseTime = resource.responseTime * (1 + (result.cpu - 50) / 100);
      const newErrorRate = Math.max(0, resource.errorRate * loadFactor * (1 + result.cpu / 200));

      let status: 'optimal' | 'warning' | 'critical' = 'optimal';
      if (newCpu > 85 || newMemory > 90 || newResponseTime > 500) {
        status = 'critical';
      } else if (newCpu > 70 || newMemory > 80 || newResponseTime > 200) {
        status = 'warning';
      }

      return {
        ...resource,
        cpu: newCpu,
        memory: newMemory,
        responseTime: newResponseTime,
        errorRate: newErrorRate,
        status
      };
    }));
  };

  const pauseSimulation = useCallback(() => {
    setIsPaused(!isPaused);
  }, [isPaused]);

  const stopSimulation = useCallback(() => {
    if (animationRef.current) {
      cancelAnimationFrame(animationRef.current);
    }
    setIsSimulating(false);
    setIsPaused(false);
  }, []);

  const resetSimulation = useCallback(() => {
    stopSimulation();
    setSimulationResults([]);
    setSimulationTime(0);
    generateResourcePerformance();
  }, [stopSimulation, generateResourcePerformance]);

  const exportResults = useCallback(() => {
    const results = {
      config,
      scenario: selectedScenario,
      results: simulationResults,
      resourcePerformance,
      exportedAt: new Date().toISOString()
    };

    const dataStr = JSON.stringify(results, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,' + encodeURIComponent(dataStr);
    
    const exportFileDefaultName = `performance-simulation-${new Date().toISOString().split('T')[0]}.json`;
    
    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();
    
    toast.success('Simulation results exported');
  }, [config, selectedScenario, simulationResults, resourcePerformance]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'optimal': return 'text-green-500';
      case 'warning': return 'text-yellow-500';
      case 'critical': return 'text-red-500';
      default: return 'text-gray-500';
    }
  };

  const getStatusBgColor = (status: string) => {
    switch (status) {
      case 'optimal': return 'bg-green-500';
      case 'warning': return 'bg-yellow-500';
      case 'critical': return 'bg-red-500';
      default: return 'bg-gray-500';
    }
  };

  if (!currentDiagram) {
    return (
      <Card className="w-full">
        <CardContent className="flex flex-col items-center justify-center p-8">
          <Activity className="h-12 w-12 text-muted-foreground mb-4" />
          <h3 className="text-lg font-semibold mb-2">No Infrastructure Loaded</h3>
          <p className="text-muted-foreground text-center">
            Load an infrastructure diagram to run performance simulations
          </p>
        </CardContent>
      </Card>
    );
  }

  const latestResult = simulationResults[simulationResults.length - 1];

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-purple-500/10">
                <Activity className="h-5 w-5 text-purple-500" />
              </div>
              <div>
                <CardTitle className="flex items-center gap-2">
                  Infrastructure Performance Simulator
                  <Badge variant="secondary" className="gap-1">
                    <Brain className="h-3 w-3" />
                    AI Powered
                  </Badge>
                </CardTitle>
                <CardDescription>
                  Simulate and analyze infrastructure performance under various load conditions
                </CardDescription>
              </div>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" onClick={exportResults} disabled={simulationResults.length === 0}>
                <BarChart3 className="h-4 w-4" />
              </Button>
              <Button variant="outline" onClick={resetSimulation}>
                <RotateCcw className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Simulation Controls */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Simulation Configuration</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Load Scenario</label>
              <Select value={selectedScenario} onValueChange={setSelectedScenario}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {scenarios.map(scenario => (
                    <SelectItem key={scenario.id} value={scenario.id}>
                      {scenario.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Users: {config.users}</label>
              <Slider
                value={[config.users]}
                onValueChange={(value) => setConfig(prev => ({ ...prev, users: value[0] }))}
                max={1000}
                min={10}
                step={10}
                className="w-full"
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Requests/sec: {config.requestsPerSecond}</label>
              <Slider
                value={[config.requestsPerSecond]}
                onValueChange={(value) => setConfig(prev => ({ ...prev, requestsPerSecond: value[0] }))}
                max={500}
                min={1}
                step={5}
                className="w-full"
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Network Latency: {config.networkLatency}ms</label>
              <Slider
                value={[config.networkLatency]}
                onValueChange={(value) => setConfig(prev => ({ ...prev, networkLatency: value[0] }))}
                max={500}
                min={1}
                step={5}
                className="w-full"
              />
            </div>
          </div>

          <div className="flex items-center gap-4">
            <Button
              onClick={startSimulation}
              disabled={isSimulating}
              className="gap-2"
            >
              <Play className="h-4 w-4" />
              Start Simulation
            </Button>
            
            {isSimulating && (
              <>
                <Button
                  variant="outline"
                  onClick={pauseSimulation}
                  className="gap-2"
                >
                  {isPaused ? <Play className="h-4 w-4" /> : <Pause className="h-4 w-4" />}
                  {isPaused ? 'Resume' : 'Pause'}
                </Button>
                <Button
                  variant="outline"
                  onClick={stopSimulation}
                  className="gap-2"
                >
                  <RefreshCw className="h-4 w-4" />
                  Stop
                </Button>
              </>
            )}

            {isSimulating && (
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                <span className="text-sm">Simulating... {simulationTime.toFixed(1)}min</span>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Live Metrics */}
      {latestResult && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <Users className="h-4 w-4 text-blue-500" />
                <span className="text-sm font-medium">Active Users</span>
              </div>
              <p className="text-2xl font-bold mt-1">{Math.round(latestResult.users)}</p>
              <p className="text-xs text-muted-foreground mt-1">
                Peak: {Math.round(Math.max(...simulationResults.map(r => r.users)))}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <Zap className="h-4 w-4 text-yellow-500" />
                <span className="text-sm font-medium">Response Time</span>
              </div>
              <p className="text-2xl font-bold mt-1">{Math.round(latestResult.responseTime)}ms</p>
              <p className="text-xs text-muted-foreground mt-1">
                Avg: {Math.round(simulationResults.reduce((sum, r) => sum + r.responseTime, 0) / simulationResults.length)}ms
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <TrendingUp className="h-4 w-4 text-green-500" />
                <span className="text-sm font-medium">Throughput</span>
              </div>
              <p className="text-2xl font-bold mt-1">{Math.round(latestResult.throughput)}</p>
              <p className="text-xs text-muted-foreground mt-1">
                req/sec
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <AlertTriangle className="h-4 w-4 text-red-500" />
                <span className="text-sm font-medium">Error Rate</span>
              </div>
              <p className="text-2xl font-bold mt-1">{latestResult.errors.toFixed(1)}</p>
              <p className="text-xs text-muted-foreground mt-1">
                {((latestResult.errors / latestResult.requests) * 100).toFixed(2)}%
              </p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Detailed Analysis */}
      <Tabs defaultValue="resources" className="space-y-4">
        <TabsList>
          <TabsTrigger value="resources">Resources</TabsTrigger>
          <TabsTrigger value="metrics">System Metrics</TabsTrigger>
          <TabsTrigger value="analysis">Performance Analysis</TabsTrigger>
        </TabsList>

        <TabsContent value="resources">
          <div className="space-y-4">
            {resourcePerformance.map((resource) => (
              <Card key={resource.id}>
                <CardContent className="p-4">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h4 className="font-medium">{resource.name}</h4>
                      <p className="text-sm text-muted-foreground capitalize">{resource.type}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant={resource.status === 'optimal' ? 'default' : resource.status === 'warning' ? 'secondary' : 'destructive'}>
                        {resource.status}
                      </Badge>
                      <div className={`w-2 h-2 rounded-full ${getStatusBgColor(resource.status)}`} />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                    <div>
                      <div className="flex justify-between text-sm mb-1">
                        <span>CPU</span>
                        <span>{Math.round(resource.cpu)}%</span>
                      </div>
                      <Progress value={resource.cpu} className="h-2" />
                    </div>
                    <div>
                      <div className="flex justify-between text-sm mb-1">
                        <span>Memory</span>
                        <span>{Math.round(resource.memory)}%</span>
                      </div>
                      <Progress value={resource.memory} className="h-2" />
                    </div>
                    <div>
                      <div className="flex justify-between text-sm mb-1">
                        <span>Disk</span>
                        <span>{Math.round(resource.disk)}%</span>
                      </div>
                      <Progress value={resource.disk} className="h-2" />
                    </div>
                    <div>
                      <div className="flex justify-between text-sm mb-1">
                        <span>Network</span>
                        <span>{Math.round(resource.network)}%</span>
                      </div>
                      <Progress value={resource.network} className="h-2" />
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-4 text-sm">
                    <div>
                      <span className="text-muted-foreground">Response Time:</span>
                      <span className="ml-2 font-medium">{Math.round(resource.responseTime)}ms</span>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Throughput:</span>
                      <span className="ml-2 font-medium">{Math.round(resource.throughput)}</span>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Error Rate:</span>
                      <span className="ml-2 font-medium">{resource.errorRate.toFixed(1)}%</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="metrics">
          <Card>
            <CardHeader>
              <CardTitle>System Performance Metrics</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {latestResult && (
                  <div className="grid grid-cols-2 md:grid-cols-2 gap-6">
                    <div>
                      <h4 className="font-medium mb-4">Resource Utilization</h4>
                      <div className="space-y-3">
                        <div>
                          <div className="flex justify-between text-sm mb-1">
                            <span>CPU Usage</span>
                            <span>{Math.round(latestResult.cpu)}%</span>
                          </div>
                          <Progress value={latestResult.cpu} className="h-3" />
                        </div>
                        <div>
                          <div className="flex justify-between text-sm mb-1">
                            <span>Memory Usage</span>
                            <span>{Math.round(latestResult.memory)}%</span>
                          </div>
                          <Progress value={latestResult.memory} className="h-3" />
                        </div>
                        <div>
                          <div className="flex justify-between text-sm mb-1">
                            <span>Disk I/O</span>
                            <span>{Math.round(latestResult.disk)}%</span>
                          </div>
                          <Progress value={latestResult.disk} className="h-3" />
                        </div>
                        <div>
                          <div className="flex justify-between text-sm mb-1">
                            <span>Network I/O</span>
                            <span>{Math.round(latestResult.network)}%</span>
                          </div>
                          <Progress value={latestResult.network} className="h-3" />
                        </div>
                      </div>
                    </div>

                    <div>
                      <h4 className="font-medium mb-4">Performance Indicators</h4>
                      <div className="space-y-3">
                        <div className="flex justify-between">
                          <span className="text-sm">Requests/sec</span>
                          <span className="font-medium">{Math.round(latestResult.requests)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm">Throughput</span>
                          <span className="font-medium">{Math.round(latestResult.throughput)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm">Avg Response Time</span>
                          <span className="font-medium">{Math.round(latestResult.responseTime)}ms</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm">Error Rate</span>
                          <span className="font-medium">{((latestResult.errors / latestResult.requests) * 100).toFixed(2)}%</span>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {simulationResults.length > 0 && (
                  <div>
                    <h4 className="font-medium mb-4">Recent Activity</h4>
                    <ScrollArea className="h-48">
                      <div className="space-y-2">
                        {simulationResults.slice(-10).reverse().map((result, index) => (
                          <div key={index} className="flex items-center justify-between p-2 border rounded text-sm">
                            <span>{result.timestamp.toFixed(1)}min</span>
                            <div className="flex gap-4">
                              <span>CPU: {Math.round(result.cpu)}%</span>
                              <span>Mem: {Math.round(result.memory)}%</span>
                              <span>RT: {Math.round(result.responseTime)}ms</span>
                              <span>Err: {result.errors.toFixed(1)}</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </ScrollArea>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="analysis">
          <div className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Performance Analysis</CardTitle>
              </CardHeader>
              <CardContent>
                {simulationResults.length > 0 ? (
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="text-center">
                        <p className="text-sm text-muted-foreground">Peak Response Time</p>
                    <p className="text-2xl font-bold">
                      {Math.round(Math.max(...simulationResults.map(r => r.responseTime)))}ms
                    </p>
                  </div>
                  <div className="text-center">
                    <p className="text-sm text-muted-foreground">Average Throughput</p>
                    <p className="text-2xl font-bold">
                      {Math.round(simulationResults.reduce((sum, r) => sum + r.throughput, 0) / simulationResults.length)}
                    </p>
                  </div>
                  <div className="text-center">
                    <p className="text-sm text-muted-foreground">Total Errors</p>
                    <p className="text-2xl font-bold">
                      {Math.round(simulationResults.reduce((sum, r) => sum + r.errors, 0))}
                    </p>
                  </div>
                </div>

                <div>
                  <h4 className="font-medium mb-2">Performance Recommendations</h4>
                  <div className="space-y-2">
                    {latestResult && latestResult.cpu > 80 && (
                      <div className="flex items-center gap-2 p-2 bg-yellow-50 border border-yellow-200 rounded">
                        <AlertTriangle className="h-4 w-4 text-yellow-600" />
                        <span className="text-sm">High CPU usage detected - consider scaling up resources</span>
                      </div>
                    )}
                    {latestResult && latestResult.responseTime > 300 && (
                      <div className="flex items-center gap-2 p-2 bg-orange-50 border border-orange-200 rounded">
                        <AlertTriangle className="h-4 w-4 text-orange-600" />
                        <span className="text-sm">Slow response times - optimize database queries or add caching</span>
                      </div>
                    )}
                    {latestResult && (latestResult.errors / latestResult.requests) > 0.05 && (
                      <div className="flex items-center gap-2 p-2 bg-red-50 border border-red-200 rounded">
                        <AlertTriangle className="h-4 w-4 text-red-600" />
                        <span className="text-sm">High error rate - investigate application logs and fix issues</span>
                      </div>
                    )}
                    {latestResult && latestResult.cpu < 50 && latestResult.memory < 60 && (
                      <div className="flex items-center gap-2 p-2 bg-green-50 border border-green-200 rounded">
                        <CheckCircle className="h-4 w-4 text-green-600" />
                        <span className="text-sm">System performing well - resources are optimally utilized</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-center py-8">
                <Activity className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">No Simulation Data</h3>
                <p className="text-muted-foreground">Run a simulation to see performance analysis</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </TabsContent>
  </Tabs>
</div>
  );
}
