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
  Lock
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useEnhancedInfrastructure } from '@/contexts/EnhancedInfrastructureContext';
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

export function DisasterRecovery() {
  const [scenarios, setScenarios] = useState<DisasterScenario[]>([]);
  const [plans, setPlans] = useState<RecoveryPlan[]>([]);
  const [backupStrategies, setBackupStrategies] = useState<BackupStrategy[]>([]);
  const [selectedScenario, setSelectedScenario] = useState<DisasterScenario | null>(null);
  const [selectedPlan, setSelectedPlan] = useState<RecoveryPlan | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isRunningSimulation, setIsRunningSimulation] = useState(false);
  const [simulationProgress, setSimulationProgress] = useState(0);

  useEffect(() => {
    // Always generate disaster recovery data
    generateDisasterScenarios();
    generateRecoveryPlans();
    generateBackupStrategies();
  }, []);

  const generateDisasterScenarios = useCallback(async () => {
    setIsGenerating(true);
    
    try {
      // Simulate AI analysis of potential disaster scenarios
      await new Promise(resolve => setTimeout(resolve, 1500));

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

      setScenarios(mockScenarios);
    } catch (error) {
      toast.error('Failed to generate disaster scenarios');
    } finally {
      setIsGenerating(false);
    }
  }, []);

  const generateRecoveryPlans = useCallback(() => {
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

    setPlans(mockPlans);
  }, []);

  const generateBackupStrategies = useCallback(() => {
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
        frequency: 'daily',
        retention: 60,
        location: 'regional',
        encrypted: true,
        lastBackup: new Date(Date.now() - 6 * 60 * 60 * 1000),
        status: 'warning'
      }
    ];

    setBackupStrategies(mockStrategies);
  }, []);

  const runSimulation = useCallback(async (scenario: DisasterScenario) => {
    setIsRunningSimulation(true);
    setSimulationProgress(0);
    
    try {
      // Simulate disaster recovery simulation
      const plan = plans.find(p => p.scenarioId === scenario.id);
      if (!plan) throw new Error('No recovery plan found');

      for (let i = 0; i <= 100; i += 10) {
        await new Promise(resolve => setTimeout(resolve, 200));
        setSimulationProgress(i);
      }

      toast.success(`Simulation completed for ${scenario.name}`);
    } catch (error) {
      toast.error('Simulation failed');
    } finally {
      setIsRunningSimulation(false);
      setSimulationProgress(0);
    }
  }, [plans]);

  const exportRecoveryPlan = useCallback((plan: RecoveryPlan) => {
    const planData = {
      ...plan,
      exportedAt: new Date().toISOString(),
      scenarios: scenarios.find(s => s.id === plan.scenarioId)
    };

    const dataStr = JSON.stringify(planData, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,' + encodeURIComponent(dataStr);
    
    const exportFileDefaultName = `recovery-plan-${plan.name.toLowerCase().replace(/\s+/g, '-')}.json`;
    
    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();
    
    toast.success('Recovery plan exported');
  }, [plans, scenarios]);

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return 'text-red-500';
      case 'high': return 'text-orange-500';
      case 'medium': return 'text-yellow-500';
      case 'low': return 'text-green-500';
      default: return 'text-gray-500';
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

  if (!currentDiagram) {
    return (
      <Card className="w-full">
        <CardContent className="flex flex-col items-center justify-center p-8">
          <Shield className="h-12 w-12 text-muted-foreground mb-4" />
          <h3 className="text-lg font-semibold mb-2">No Infrastructure Loaded</h3>
          <p className="text-muted-foreground text-center">
            Load an infrastructure diagram to create disaster recovery plans
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-red-500/10">
              <Shield className="h-5 w-5 text-red-500" />
            </div>
            <div>
              <CardTitle>Disaster Recovery Planning</CardTitle>
              <CardDescription>
                AI-powered disaster recovery planning and simulation
              </CardDescription>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Risk Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <AlertTriangle className="h-4 w-4 text-red-500" />
              <span className="text-sm font-medium">Critical Risks</span>
            </div>
            <p className="text-2xl font-bold mt-1">
              {scenarios.filter(s => s.severity === 'critical').length}
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <FileText className="h-4 w-4 text-blue-500" />
              <span className="text-sm font-medium">Recovery Plans</span>
            </div>
            <p className="text-2xl font-bold mt-1">{plans.length}</p>
            <p className="text-xs text-muted-foreground mt-2">
              {plans.filter(p => p.status === 'active').length} active
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Database className="h-4 w-4 text-green-500" />
              <span className="text-sm font-medium">Backup Strategies</span>
            </div>
            <p className="text-2xl font-bold mt-1">{backupStrategies.length}</p>
            <p className="text-xs text-muted-foreground mt-2">
              {backupStrategies.filter(b => b.status === 'healthy').length} healthy
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-purple-500" />
              <span className="text-sm font-medium">Avg RTO</span>
            </div>
            <p className="text-2xl font-bold mt-1">
              {Math.round(plans.reduce((sum, p) => sum + p.rto, 0) / plans.length)}min
            </p>
            <p className="text-xs text-muted-foreground mt-2">
              Recovery Time Objective
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <Tabs defaultValue="scenarios" className="space-y-4">
        <TabsList>
          <TabsTrigger value="scenarios">Scenarios</TabsTrigger>
          <TabsTrigger value="plans">Recovery Plans</TabsTrigger>
          <TabsTrigger value="backups">Backup Strategies</TabsTrigger>
        </TabsList>

        <TabsContent value="scenarios">
          <div className="space-y-4">
            {scenarios.map((scenario) => (
              <Card key={scenario.id}>
                <CardContent className="p-4">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h4 className="font-medium">{scenario.name}</h4>
                      <p className="text-sm text-muted-foreground mt-1">{scenario.description}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant={scenario.severity === 'critical' ? 'destructive' : scenario.severity === 'high' ? 'secondary' : 'outline'}>
                        {scenario.severity}
                      </Badge>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => runSimulation(scenario)}
                        disabled={isRunningSimulation}
                      >
                        {isRunningSimulation ? <RefreshCw className="h-4 w-4 animate-spin" /> : <Play className="h-4 w-4" />}
                      </Button>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                    <div>
                      <p className="text-sm text-muted-foreground">Probability</p>
                      <p className="font-medium">{scenario.probability}%</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Impact</p>
                      <p className="font-medium">{scenario.impact}%</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Recovery Time</p>
                      <p className="font-medium">{scenario.recoveryTime}min</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Est. Cost</p>
                      <p className="font-medium">${scenario.estimatedCost.toLocaleString()}</p>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <p className="text-sm font-medium">Affected Resources:</p>
                    <div className="flex flex-wrap gap-2">
                      {scenario.affectedResources.map((resource, index) => (
                        <Badge key={index} variant="outline">
                          {resource}
                        </Badge>
                      ))}
                    </div>
                  </div>

                  {isRunningSimulation && selectedScenario?.id === scenario.id && (
                    <div className="mt-4 pt-4 border-t">
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
          <div className="space-y-4">
            {plans.map((plan) => (
              <Card key={plan.id}>
                <CardContent className="p-4">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h4 className="font-medium">{plan.name}</h4>
                      <p className="text-sm text-muted-foreground mt-1">
                        RTO: {plan.rto}min • RPO: {plan.rpo}min
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant={plan.status === 'active' ? 'default' : plan.status === 'tested' ? 'secondary' : 'outline'}>
                        {plan.status}
                      </Badge>
                      <div className={`w-2 h-2 rounded-full ${getPriorityColor(plan.priority)}`} />
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => exportRecoveryPlan(plan)}
                      >
                        <Download className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <p className="text-sm font-medium">Recovery Steps:</p>
                    {plan.steps.map((step, index) => (
                      <div key={step.id} className="flex items-center gap-3 p-2 border rounded">
                        <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center text-xs font-medium">
                          {index + 1}
                        </div>
                        <div className="flex-1">
                          <p className="font-medium text-sm">{step.title}</p>
                          <p className="text-xs text-muted-foreground">{step.description}</p>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge variant="outline">{step.estimatedTime}min</Badge>
                          {step.automated && (
                            <Badge variant="secondary">Auto</Badge>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>

                  {plan.testResults && (
                    <div className="mt-4 pt-4 border-t">
                      <p className="text-sm font-medium mb-2">Last Test Results:</p>
                      <div className="flex items-center gap-2">
                        <CheckCircle className={`h-4 w-4 ${plan.testResults.success ? 'text-green-500' : 'text-red-500'}`} />
                        <span className="text-sm">
                          {plan.testResults.success ? 'Success' : 'Failed'} • {plan.testResults.duration}min
                        </span>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="backups">
          <div className="space-y-4">
            {backupStrategies.map((backup) => (
              <Card key={backup.id}>
                <CardContent className="p-4">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h4 className="font-medium">{backup.resource}</h4>
                      <p className="text-sm text-muted-foreground mt-1">
                        {backup.type} • {backup.frequency} • {backup.retention} days retention
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant={backup.status === 'healthy' ? 'default' : backup.status === 'warning' ? 'secondary' : 'destructive'}>
                        {backup.status}
                      </Badge>
                      {backup.encrypted && (
                        <Lock className="h-4 w-4 text-green-500" />
                      )}
                    </div>
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div>
                      <p className="text-sm text-muted-foreground">Location</p>
                      <p className="font-medium capitalize">{backup.location.replace('_', ' ')}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Last Backup</p>
                      <p className="font-medium">{backup.lastBackup.toLocaleString()}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Frequency</p>
                      <p className="font-medium capitalize">{backup.frequency}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Type</p>
                      <p className="font-medium capitalize">{backup.type}</p>
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
