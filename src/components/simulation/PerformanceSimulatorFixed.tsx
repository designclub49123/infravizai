import { useState, useEffect, useCallback } from 'react';
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
import { toast } from 'sonner';

interface SimulationConfig {
  duration: number;
  users: number;
  requestsPerSecond: number;
  networkLatency: number;
  cpuLoad: number;
  memoryUsage: number;
  diskIO: number;
  failRate: number;
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

  const mockResources: ResourcePerformance[] = [
    {
      id: '1',
      name: 'Web Server EC2',
      type: 'ec2',
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

  useEffect(() => {
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
    const interval = 100;

    const simulate = () => {
      if (!isPaused && currentTime < config.duration * 60) {
        const result = generateSimulationResult(currentTime);
        setSimulationResults(prev => [...prev, result]);
        setSimulationTime(currentTime);
        currentTime += 0.1;

        // Update resource performance
        updateResourcePerformance(result);
      } else {
        setIsSimulating(false);
      }
    };

    simulate();
    const intervalId = setInterval(simulate, interval);
    
    // Store interval ID for cleanup
    return () => clearInterval(intervalId);
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
    const noise = () => (Math.random() - 0.5) * 0.2;
    
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
    setIsSimulating(false);
    setIsPaused(false);
    setSimulationTime(0);
    setSimulationResults([]);
    setResourcePerformance(mockResources);
  }, []);

  const resetSimulation = useCallback(() => {
    stopSimulation();
  }, [stopSimulation]);

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

  const latestResult = simulationResults[simulationResults.length - 1];

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="h-5 w-5 text-purple-500" />
            Infrastructure Performance Simulator
            <Badge variant="secondary" className="gap-1">
              <Brain className="h-3 w-3" />
              AI Powered
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Load Scenario</label>
              <Select value={selectedScenario} onValueChange={(value: any) => setSelectedScenario(value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="constant">Constant Load</SelectItem>
                  <SelectItem value="spike">Traffic Spike</SelectItem>
                  <SelectItem value="gradual">Gradual Increase</SelectItem>
                  <SelectItem value="stress">Stress Test</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Users: {config.users}</label>
              <Slider
                value={[config.users]}
                onValueChange={(value: any) => setConfig(prev => ({ ...prev, users: value[0] }))}
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
                onValueChange={(value: any) => setConfig(prev => ({ ...prev, requestsPerSecond: value[0] }))}
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
                onValueChange={(value: any) => setConfig(prev => ({ ...prev, networkLatency: value[0] }))}
                max={500}
                min={1}
                step={5}
                className="w-full"
              />
            </div>
          </div>

          <div className="flex gap-2">
            <Button
              onClick={startSimulation}
              disabled={isSimulating}
              className="gap-2"
            >
              {isSimulating ? (
                <>
                  <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                  Simulating...
                </>
              ) : (
                <>
                  <Play className="h-4 w-4" />
                  Start Simulation
                </>
              )}
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
                  <RotateCcw className="h-4 w-4" />
                  Stop
                </Button>
              </>
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
              <p className="text-2xl font-bold">{Math.round(latestResult.users)}</p>
              <p className="text-xs text-muted-foreground">
                Peak: {Math.round(scenarios.find(s => s.id === selectedScenario)?.users || 0)}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <Zap className="h-4 w-4 text-yellow-500" />
                <span className="text-sm font-medium">Response Time</span>
              </div>
              <p className="text-2xl font-bold">{Math.round(latestResult.responseTime)}ms</p>
              <p className="text-xs text-muted-foreground">
                {latestResult.responseTime < 200 ? 'Good' : latestResult.responseTime < 500 ? 'Fair' : 'Poor'}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <TrendingUp className="h-4 w-4 text-green-500" />
                <span className="text-sm font-medium">Throughput</span>
              </div>
              <p className="text-2xl font-bold">{Math.round(latestResult.throughput)}</p>
              <p className="text-xs text-muted-foreground">req/sec</p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <AlertTriangle className="h-4 w-4 text-red-500" />
                <span className="text-sm font-medium">Error Rate</span>
              </div>
              <p className="text-2xl font-bold">{latestResult.errors.toFixed(1)}</p>
              <p className="text-xs text-muted-foreground">
                {((latestResult.errors / latestResult.requests) * 100).toFixed(2)}%
              </p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Resource Performance */}
      <Card>
        <CardHeader>
          <CardTitle>Resource Performance</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {resourcePerformance.map(resource => (
              <div key={resource.id} className="p-3 border rounded-lg">
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <h4 className="font-medium">{resource.name}</h4>
                    <p className="text-sm text-muted-foreground capitalize">{resource.type}</p>
                  </div>
                  <Badge variant={resource.status === 'optimal' ? 'default' : resource.status === 'warning' ? 'secondary' : 'destructive'}>
                    {resource.status}
                  </Badge>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                  <div>
                    <span className="text-muted-foreground">CPU</span>
                    <div className="flex items-center gap-2">
                      <Progress value={resource.cpu} className="h-2" />
                      <span>{Math.round(resource.cpu)}%</span>
                    </div>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Memory</span>
                    <div className="flex items-center gap-2">
                      <Progress value={resource.memory} className="h-2" />
                      <span>{Math.round(resource.memory)}%</span>
                    </div>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Disk</span>
                    <div className="flex items-center gap-2">
                      <Progress value={resource.disk} className="h-2" />
                      <span>{Math.round(resource.disk)}%</span>
                    </div>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Network</span>
                    <div className="flex items-center gap-2">
                      <Progress value={resource.network} className="h-2" />
                      <span>{Math.round(resource.network)}%</span>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-4 text-sm">
                  <div>
                    <span className="text-muted-foreground">Response Time</span>
                    <span>{Math.round(resource.responseTime)}ms</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Throughput</span>
                    <span>{Math.round(resource.throughput)}</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Error Rate</span>
                    <span>{resource.errorRate.toFixed(1)}%</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Simulation Progress */}
      {isSimulating && (
        <Card>
          <CardHeader>
            <CardTitle>Simulation Progress</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Progress</span>
                <span>{simulationTime.toFixed(1)}min / {config.duration}min</span>
              </div>
              <Progress value={(simulationTime / (config.duration * 60)) * 100} className="h-2" />
            </div>
          </CardContent>
        </Card>
      )}

      {/* Export Results */}
      {simulationResults.length > 0 && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Simulation Results</CardTitle>
              <Button variant="outline" onClick={exportResults}>
                <BarChart3 className="h-4 w-4 mr-2" />
                Export Results
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-48">
              <div className="space-y-2">
                {simulationResults.slice(-10).reverse().map((result, index) => (
                  <div key={index} className="flex items-center justify-between p-2 border rounded">
                    <span className="text-sm">{result.timestamp.toFixed(1)}min</span>
                    <div className="flex gap-4 text-sm">
                      <span>CPU: {Math.round(result.cpu)}%</span>
                      <span>Mem: {Math.round(result.memory)}%</span>
                      <span>Net: {Math.round(result.network)}%</span>
                      <span>Req: {result.requests}</span>
                      <span>Err: {result.errors.toFixed(1)}</span>
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
