import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Shield, 
  AlertTriangle, 
  CheckCircle, 
  Clock, 
  MapPin, 
  Users, 
  Server,
  Database,
  Cloud,
  RefreshCw,
  Download,
  Play,
  Pause,
  Zap,
  Target,
  Activity,
  FileText,
  Settings,
  Globe,
  Lock,
  TrendingUp,
  AlertCircle,
  ChevronRight,
  Eye,
  Edit,
  Trash2,
  Plus
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';

interface DisasterScenario {
  id: string;
  name: string;
  description: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  probability: number;
  impact: number;
  recoveryTime: number;
  estimatedCost: number;
  affectedResources: string[];
}

interface RecoveryPlan {
  id: string;
  scenarioId: string;
  name: string;
  steps: RecoveryStep[];
  rto: number; // Recovery Time Objective
  rpo: number; // Recovery Point Objective
  priority: 'low' | 'medium' | 'high' | 'critical';
  status: 'draft' | 'active' | 'testing' | 'tested';
  lastTested?: Date;
  testResults?: TestResult;
}

interface RecoveryStep {
  id: string;
  title: string;
  description: string;
  estimatedTime: number;
  dependencies: string[];
  assignee?: string;
  status: 'pending' | 'in_progress' | 'completed' | 'failed';
  automated: boolean;
}

interface TestResult {
  success: boolean;
  duration: number;
  issues: string[];
  recommendations: string[];
  testedAt: Date;
}

interface BackupStrategy {
  id: string;
  resource: string;
  type: 'full' | 'incremental' | 'differential';
  frequency: 'hourly' | 'daily' | 'weekly' | 'monthly';
  retention: number; // days
  location: 'local' | 'regional' | 'multi_region';
  encrypted: boolean;
  lastBackup: Date;
  status: 'healthy' | 'warning' | 'failed';
}

export function DisasterRecoveryFixed() {
  const [scenarios, setScenarios] = useState<DisasterScenario[]>([]);
  const [plans, setPlans] = useState<RecoveryPlan[]>([]);
  const [backupStrategies, setBackupStrategies] = useState<BackupStrategy[]>([]);
  const [selectedScenario, setSelectedScenario] = useState<DisasterScenario | null>(null);
  const [selectedPlan, setSelectedPlan] = useState<RecoveryPlan | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isRunningSimulation, setIsRunningSimulation] = useState(false);
  const [simulationProgress, setSimulationProgress] = useState(0);
  const [showCreateScenario, setShowCreateScenario] = useState(false);
  const [showCreatePlan, setShowCreatePlan] = useState(false);

  const [newScenario, setNewScenario] = useState({
    name: '',
    description: '',
    severity: 'medium' as 'low' | 'medium' | 'high' | 'critical',
    probability: 50,
    impact: 50,
    recoveryTime: 120,
    estimatedCost: 10000,
  });

  useEffect(() => {
    loadDemoData();
  }, []);

  const loadDemoData = () => {
    setIsGenerating(true);
    
    // Mock disaster scenarios
    const mockScenarios: DisasterScenario[] = [
      {
        id: '1',
        name: 'Region Failure',
        description: 'Complete AWS region outage due to natural disaster or infrastructure failure',
        severity: 'critical',
        probability: 15,
        impact: 95,
        recoveryTime: 720, // 12 hours
        estimatedCost: 50000,
        affectedResources: ['All resources in us-east-1']
      },
      {
        id: '2',
        name: 'Database Corruption',
        description: 'Critical database corruption requiring full restore from backup',
        severity: 'high',
        probability: 8,
        impact: 85,
        recoveryTime: 240, // 4 hours
        estimatedCost: 15000,
        affectedResources: ['Production RDS', 'Read Replicas']
      },
      {
        id: '3',
        name: 'Security Breach',
        description: 'Major security incident requiring system isolation and rebuild',
        severity: 'high',
        probability: 12,
        impact: 75,
        recoveryTime: 480, // 8 hours
        estimatedCost: 25000,
        affectedResources: ['Web Servers', 'Load Balancer', 'Database']
      },
      {
        id: '4',
        name: 'Network Outage',
        description: 'Extended network connectivity loss affecting user access',
        severity: 'medium',
        probability: 25,
        impact: 60,
        recoveryTime: 120, // 2 hours
        estimatedCost: 8000,
        affectedResources: ['Load Balancer', 'CDN', 'DNS']
      },
      {
        id: '5',
        name: 'Application Failure',
        description: 'Cascading application failures requiring service restart',
        severity: 'medium',
        probability: 35,
        impact: 40,
        recoveryTime: 60, // 1 hour
        estimatedCost: 3000,
        affectedResources: ['Lambda Functions', 'API Gateway']
      }
    ];

    // Mock recovery plans
    const mockPlans: RecoveryPlan[] = [
      {
        id: '1',
        scenarioId: '1',
        name: 'Multi-Region Failover',
        steps: [
          {
            id: '1',
            title: 'Detect Region Outage',
            description: 'Automated detection of region-wide service failures',
            estimatedTime: 5,
            dependencies: [],
            automated: true,
            status: 'pending'
          },
          {
            id: '2',
            title: 'Activate DR Region',
            description: 'Failover to backup region with traffic routing',
            estimatedTime: 15,
            dependencies: ['1'],
            automated: true,
            status: 'pending'
          },
          {
            id: '3',
            title: 'Restore Data Backups',
            description: 'Restore latest backups in DR region',
            estimatedTime: 180,
            dependencies: ['2'],
            automated: true,
            status: 'pending'
          },
          {
            id: '4',
            title: 'Verify Services',
            description: 'Comprehensive health check of all services',
            estimatedTime: 30,
            dependencies: ['3'],
            automated: false,
            status: 'pending'
          }
        ],
        rto: 240, // 4 hours
        rpo: 60, // 1 hour
        priority: 'critical',
        status: 'active',
        lastTested: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), // 30 days ago
        testResults: {
          success: true,
          duration: 195,
          issues: ['Minor delay in DNS propagation'],
          recommendations: ['Consider pre-warming DR region resources'],
          testedAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
        }
      },
      {
        id: '2',
        scenarioId: '2',
        name: 'Database Recovery',
        steps: [
          {
            id: '1',
            title: 'Isolate Database',
            description: 'Prevent further data corruption',
            estimatedTime: 5,
            dependencies: [],
            automated: true,
            status: 'pending'
          },
          {
            id: '2',
            title: 'Restore from Backup',
            description: 'Restore latest clean backup',
            estimatedTime: 120,
            dependencies: ['1'],
            automated: true,
            status: 'pending'
          },
          {
            id: '3',
            title: 'Verify Data Integrity',
            description: 'Run data consistency checks',
            estimatedTime: 30,
            dependencies: ['2'],
            automated: false,
            status: 'pending'
          },
          {
            id: '4',
            title: 'Resume Operations',
            description: 'Gradually restore database connections',
            estimatedTime: 15,
            dependencies: ['3'],
            automated: false,
            status: 'pending'
          }
        ],
        rto: 180, // 3 hours
        rpo: 15, // 15 minutes
        priority: 'high',
        status: 'active'
      }
    ];

    // Mock backup strategies
    const mockStrategies: BackupStrategy[] = [
      {
        id: '1',
        resource: 'Production RDS',
        type: 'incremental',
        frequency: 'hourly',
        retention: 30,
        location: 'multi_region',
        encrypted: true,
        lastBackup: new Date(Date.now() - 45 * 60 * 1000),
        status: 'healthy'
      },
      {
        id: '2',
        resource: 'S3 Storage',
        type: 'full',
        frequency: 'daily',
        retention: 90,
        location: 'multi_region',
        encrypted: true,
        lastBackup: new Date(Date.now() - 2 * 60 * 60 * 1000),
        status: 'healthy'
      },
      {
        id: '3',
        resource: 'Application Config',
        type: 'incremental',
        frequency: 'weekly',
        retention: 60,
        location: 'regional',
        encrypted: true,
        lastBackup: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
        status: 'warning'
      }
    ];

    setScenarios(mockScenarios);
    setPlans(mockPlans);
    setBackupStrategies(mockStrategies);
    setIsGenerating(false);
  };

  const runSimulation = useCallback((scenarioId: string) => {
    setIsRunningSimulation(true);
    setSimulationProgress(0);
    
    const interval = setInterval(() => {
      setSimulationProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval);
          setIsRunningSimulation(false);
          toast.success('Simulation completed successfully!');
          return 100;
        }
        return prev + 10;
      });
    }, 500);
  }, []);

  const createScenario = () => {
    if (!newScenario.name.trim()) return;

    const scenario: DisasterScenario = {
      id: Date.now().toString(),
      ...newScenario,
      affectedResources: ['Demo Resources']
    };

    setScenarios([...scenarios, scenario]);
    setShowCreateScenario(false);
    setNewScenario({
      name: '',
      description: '',
      severity: 'medium',
      probability: 50,
      impact: 50,
      recoveryTime: 120,
      estimatedCost: 10000,
    });
    toast.success('Disaster scenario created!');
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return 'bg-red-100 text-red-800 border-red-200';
      case 'high': return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'medium': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'low': return 'bg-green-100 text-green-800 border-green-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'healthy': return 'text-green-600';
      case 'warning': return 'text-yellow-600';
      case 'failed': return 'text-red-600';
      default: return 'text-gray-600';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'critical': return 'bg-red-500';
      case 'high': return 'bg-orange-500';
      case 'medium': return 'bg-yellow-500';
      case 'low': return 'bg-green-500';
      default: return 'bg-gray-500';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Actions */}
      <div className="flex justify-between items-center">
        <div className="flex gap-2">
          <Dialog open={showCreateScenario} onOpenChange={setShowCreateScenario}>
            <DialogTrigger asChild>
              <Button className="gap-2">
                <Plus className="h-4 w-4" />
                Create Scenario
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Create Disaster Scenario</DialogTitle>
                <DialogDescription>
                  Define a new disaster scenario for planning and testing
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label>Scenario Name</Label>
                  <Input
                    value={newScenario.name}
                    onChange={(e) => setNewScenario({ ...newScenario, name: e.target.value })}
                    placeholder="e.g., Data Center Fire"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Description</Label>
                  <Textarea
                    value={newScenario.description}
                    onChange={(e) => setNewScenario({ ...newScenario, description: e.target.value })}
                    placeholder="Describe the disaster scenario..."
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Severity</Label>
                    <Select 
                      value={newScenario.severity} 
                      onValueChange={(value: 'low' | 'medium' | 'high' | 'critical') => 
                        setNewScenario({ ...newScenario, severity: value })
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="low">Low</SelectItem>
                        <SelectItem value="medium">Medium</SelectItem>
                        <SelectItem value="high">High</SelectItem>
                        <SelectItem value="critical">Critical</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Probability (%)</Label>
                    <Input
                      type="number"
                      value={newScenario.probability}
                      onChange={(e) => setNewScenario({ ...newScenario, probability: parseInt(e.target.value) })}
                      min="0"
                      max="100"
                    />
                  </div>
                </div>
                <Button onClick={createScenario} className="w-full">
                  Create Scenario
                </Button>
              </div>
            </DialogContent>
          </Dialog>
          
          <Button variant="outline" className="gap-2" onClick={loadDemoData}>
            <RefreshCw className="h-4 w-4" />
            Refresh Data
          </Button>
        </div>
        
        {isRunningSimulation && (
          <div className="flex items-center gap-2">
            <Activity className="h-4 w-4 animate-spin" />
            <span className="text-sm">Simulation Running</span>
          </div>
        )}
      </div>

      <Tabs defaultValue="scenarios" className="space-y-6">
        <TabsList>
          <TabsTrigger value="scenarios">Disaster Scenarios</TabsTrigger>
          <TabsTrigger value="plans">Recovery Plans</TabsTrigger>
          <TabsTrigger value="backups">Backup Strategies</TabsTrigger>
        </TabsList>

        <TabsContent value="scenarios">
          <div className="grid gap-4">
            {scenarios.map((scenario) => (
              <Card key={scenario.id} className="hover:shadow-md transition-shadow">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <CardTitle className="text-lg flex items-center gap-2">
                        <AlertTriangle className={`h-5 w-5 ${
                          scenario.severity === 'critical' ? 'text-red-500' :
                          scenario.severity === 'high' ? 'text-orange-500' :
                          scenario.severity === 'medium' ? 'text-yellow-500' :
                          'text-green-500'
                        }`} />
                        {scenario.name}
                      </CardTitle>
                      <CardDescription className="mt-2">
                        {scenario.description}
                      </CardDescription>
                    </div>
                    <Badge className={getSeverityColor(scenario.severity)}>
                      {scenario.severity.toUpperCase()}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                    <div className="text-center">
                      <div className="text-2xl font-bold text-blue-600">{scenario.probability}%</div>
                      <div className="text-sm text-muted-foreground">Probability</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-orange-600">{scenario.impact}%</div>
                      <div className="text-sm text-muted-foreground">Impact</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-green-600">{scenario.recoveryTime}m</div>
                      <div className="text-sm text-muted-foreground">Recovery Time</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-purple-600">${scenario.estimatedCost.toLocaleString()}</div>
                      <div className="text-sm text-muted-foreground">Est. Cost</div>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Server className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm text-muted-foreground">
                        {scenario.affectedResources.length} resources affected
                      </span>
                    </div>
                    <Button 
                      onClick={() => runSimulation(scenario.id)}
                      disabled={isRunningSimulation}
                      className="gap-2"
                    >
                      <Play className="h-4 w-4" />
                      Run Simulation
                    </Button>
                  </div>
                  
                  {isRunningSimulation && (
                    <div className="mt-4">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium">Simulation Progress</span>
                        <span className="text-sm">{simulationProgress}%</span>
                      </div>
                      <Progress value={simulationProgress} className="h-2" />
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="plans">
          <div className="grid gap-4">
            {plans.map((plan) => (
              <Card key={plan.id}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="text-lg">{plan.name}</CardTitle>
                      <CardDescription>
                        Recovery plan for disaster scenarios
                      </CardDescription>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant={plan.status === 'active' ? 'default' : 'secondary'}>
                        {plan.status}
                      </Badge>
                      <div className={`w-3 h-3 rounded-full ${getPriorityColor(plan.priority)}`} />
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                    <div className="text-center">
                      <div className="text-xl font-bold text-blue-600">{plan.rto}m</div>
                      <div className="text-sm text-muted-foreground">RTO</div>
                    </div>
                    <div className="text-center">
                      <div className="text-xl font-bold text-green-600">{plan.rpo}m</div>
                      <div className="text-sm text-muted-foreground">RPO</div>
                    </div>
                    <div className="text-center">
                      <div className="text-xl font-bold text-orange-600">{plan.steps.length}</div>
                      <div className="text-sm text-muted-foreground">Steps</div>
                    </div>
                    <div className="text-center">
                      <div className="text-xl font-bold text-purple-600">
                        {plan.steps.filter(s => s.automated).length}
                      </div>
                      <div className="text-sm text-muted-foreground">Automated</div>
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <h4 className="text-sm font-medium">Recovery Steps</h4>
                    <div className="space-y-2">
                      {plan.steps.map((step, index) => (
                        <div key={step.id} className="flex items-center gap-3 p-2 rounded border">
                          <div className="flex items-center justify-center w-6 h-6 rounded-full bg-primary text-primary-foreground text-xs font-medium">
                            {index + 1}
                          </div>
                          <div className="flex-1">
                            <p className="text-sm font-medium">{step.title}</p>
                            <p className="text-xs text-muted-foreground">{step.description}</p>
                          </div>
                          <div className="flex items-center gap-2">
                            {step.automated && (
                              <Badge variant="outline" className="text-xs">
                                <Zap className="h-3 w-3 mr-1" />
                                Auto
                              </Badge>
                            )}
                            <span className="text-xs text-muted-foreground">{step.estimatedTime}m</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="backups">
          <div className="grid gap-4">
            {backupStrategies.map((backup) => (
              <Card key={backup.id}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="text-lg">{backup.resource}</CardTitle>
                      <CardDescription>
                        Backup configuration and status
                      </CardDescription>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant={backup.status === 'healthy' ? 'default' : 'secondary'}>
                        {backup.status}
                      </Badge>
                      {backup.encrypted && (
                        <Lock className="h-4 w-4 text-green-500" />
                      )}
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                    <div>
                      <div className="text-sm font-medium">Type</div>
                      <div className="text-lg capitalize">{backup.type}</div>
                    </div>
                    <div>
                      <div className="text-sm font-medium">Frequency</div>
                      <div className="text-lg capitalize">{backup.frequency}</div>
                    </div>
                    <div>
                      <div className="text-sm font-medium">Retention</div>
                      <div className="text-lg">{backup.retention} days</div>
                    </div>
                    <div>
                      <div className="text-sm font-medium">Location</div>
                      <div className="text-lg capitalize">{backup.location.replace('_', ' ')}</div>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Clock className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm text-muted-foreground">
                        Last backup: {new Date(backup.lastBackup).toLocaleString()}
                      </span>
                    </div>
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm">
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button variant="outline" size="sm">
                        <RefreshCw className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
