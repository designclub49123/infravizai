import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Activity, 
  Heart, 
  AlertTriangle, 
  CheckCircle, 
  XCircle, 
  Brain,
  Monitor,
  Server,
  Database,
  Wifi,
  Shield,
  Zap,
  Clock,
  TrendingUp,
  TrendingDown,
  RefreshCw,
  Settings,
  Bell,
  Eye
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useEnhancedInfrastructure } from '@/contexts/EnhancedInfrastructureContext';
import { toast } from 'sonner';

interface HealthMetric {
  id: string;
  resource: string;
  type: string;
  status: 'healthy' | 'warning' | 'critical' | 'unknown';
  cpu: number;
  memory: number;
  disk: number;
  network: number;
  uptime: number;
  lastCheck: Date;
  alerts: HealthAlert[];
}

interface HealthAlert {
  id: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  message: string;
  timestamp: Date;
  acknowledged: boolean;
}

interface SystemHealth {
  overall: 'healthy' | 'degraded' | 'critical';
  score: number;
  resources: {
    total: number;
    healthy: number;
    warning: number;
    critical: number;
  };
  uptime: number;
  responseTime: number;
}

interface PerformanceData {
  timestamp: Date;
  cpu: number;
  memory: number;
  network: number;
  requests: number;
  errors: number;
}

export function HealthDashboard() {
  const { state: { currentDiagram } } = useEnhancedInfrastructure();
  const [healthMetrics, setHealthMetrics] = useState<HealthMetric[]>([]);
  const [systemHealth, setSystemHealth] = useState<SystemHealth | null>(null);
  const [performanceData, setPerformanceData] = useState<PerformanceData[]>([]);
  const [isMonitoring, setIsMonitoring] = useState(false);
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [refreshInterval, setRefreshInterval] = useState(5000);
  const [selectedMetric, setSelectedMetric] = useState<HealthMetric | null>(null);

  useEffect(() => {
    // Always generate health metrics, even without currentDiagram
    generateInitialMetrics();
    startMonitoring();
  }, []);

  useEffect(() => {
    if (autoRefresh && isMonitoring) {
      const interval = setInterval(() => {
        updateHealthMetrics();
      }, refreshInterval);
      
      return () => clearInterval(interval);
    }
  }, [autoRefresh, isMonitoring, refreshInterval]);

  const startMonitoring = useCallback(() => {
    setIsMonitoring(true);
    generateInitialMetrics();
    updateHealthMetrics();
  }, []);

  const stopMonitoring = useCallback(() => {
    setIsMonitoring(false);
  }, []);

  const generateInitialMetrics = useCallback(() => {
    const mockMetrics: HealthMetric[] = [
      {
        id: '1',
        resource: 'Web Server EC2',
        type: 'ec2',
        status: 'healthy',
        cpu: 45,
        memory: 62,
        disk: 38,
        network: 75,
        uptime: 99.8,
        lastCheck: new Date(),
        alerts: []
      },
      {
        id: '2',
        resource: 'Production RDS',
        type: 'rds',
        status: 'warning',
        cpu: 78,
        memory: 85,
        disk: 92,
        network: 45,
        uptime: 99.9,
        lastCheck: new Date(),
        alerts: [
          {
            id: '1',
            severity: 'medium',
            message: 'Disk usage approaching limit (92%)',
            timestamp: new Date(Date.now() - 300000),
            acknowledged: false
          }
        ]
      },
      {
        id: '3',
        resource: 'S3 Storage',
        type: 's3',
        status: 'healthy',
        cpu: 12,
        memory: 25,
        disk: 65,
        network: 88,
        uptime: 100,
        lastCheck: new Date(),
        alerts: []
      },
      {
        id: '4',
        resource: 'Lambda Functions',
        type: 'lambda',
        status: 'healthy',
        cpu: 35,
        memory: 48,
        disk: 15,
        network: 92,
        uptime: 99.5,
        lastCheck: new Date(),
        alerts: []
      },
      {
        id: '5',
        resource: 'Load Balancer',
        type: 'alb',
        status: 'critical',
        cpu: 95,
        memory: 88,
        disk: 45,
        network: 98,
        uptime: 98.5,
        lastCheck: new Date(),
        alerts: [
          {
            id: '2',
            severity: 'critical',
            message: 'CPU usage critical (95%)',
            timestamp: new Date(Date.now() - 120000),
            acknowledged: false
          },
          {
            id: '3',
            severity: 'high',
            message: 'High response times detected',
            timestamp: new Date(Date.now() - 240000),
            acknowledged: false
          }
        ]
      }
    ];

    setHealthMetrics(mockMetrics);
    
    const healthy = mockMetrics.filter(m => m.status === 'healthy').length;
    const warning = mockMetrics.filter(m => m.status === 'warning').length;
    const critical = mockMetrics.filter(m => m.status === 'critical').length;
    
    const overallStatus = critical > 0 ? 'critical' : warning > 0 ? 'degraded' : 'healthy';
    const score = Math.round((healthy / mockMetrics.length) * 100);
    
    setSystemHealth({
      overall: overallStatus,
      score,
      resources: {
        total: mockMetrics.length,
        healthy,
        warning,
        critical
      },
      uptime: 99.7,
      responseTime: 145
    });

    // Generate performance data
    const performance: PerformanceData[] = [];
    for (let i = 0; i < 20; i++) {
      performance.push({
        timestamp: new Date(Date.now() - (19 - i) * 60000),
        cpu: Math.random() * 100,
        memory: Math.random() * 100,
        network: Math.random() * 100,
        requests: Math.floor(Math.random() * 1000),
        errors: Math.floor(Math.random() * 10)
      });
    }
    setPerformanceData(performance);
  }, []);

  const updateHealthMetrics = useCallback(() => {
    setHealthMetrics(prev => prev.map(metric => ({
      ...metric,
      cpu: Math.max(0, Math.min(100, metric.cpu + (Math.random() - 0.5) * 10)),
      memory: Math.max(0, Math.min(100, metric.memory + (Math.random() - 0.5) * 8)),
      disk: Math.max(0, Math.min(100, metric.disk + (Math.random() - 0.5) * 2)),
      network: Math.max(0, Math.min(100, metric.network + (Math.random() - 0.5) * 15)),
      lastCheck: new Date(),
      status: updateStatus(metric)
    })));

    // Update performance data
    setPerformanceData(prev => {
      const newData = [...prev.slice(1), {
        timestamp: new Date(),
        cpu: Math.random() * 100,
        memory: Math.random() * 100,
        network: Math.random() * 100,
        requests: Math.floor(Math.random() * 1000),
        errors: Math.floor(Math.random() * 10)
      }];
      return newData;
    });
  }, []);

  const updateStatus = (metric: HealthMetric): 'healthy' | 'warning' | 'critical' | 'unknown' => {
    if (metric.cpu > 90 || metric.memory > 90 || metric.disk > 95) {
      return 'critical';
    } else if (metric.cpu > 75 || metric.memory > 80 || metric.disk > 85) {
      return 'warning';
    } else {
      return 'healthy';
    }
  };

  const acknowledgeAlert = useCallback((metricId: string, alertId: string) => {
    setHealthMetrics(prev => prev.map(metric => {
      if (metric.id === metricId) {
        return {
          ...metric,
          alerts: metric.alerts.map(alert =>
            alert.id === alertId ? { ...alert, acknowledged: true } : alert
          )
        };
      }
      return metric;
    }));
    toast.success('Alert acknowledged');
  }, []);

  const getResourceIcon = (type: string) => {
    switch (type) {
      case 'ec2': return Server;
      case 'rds': return Database;
      case 's3': return Database;
      case 'lambda': return Zap;
      case 'alb': return Wifi;
      default: return Server;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'healthy': return 'text-green-500';
      case 'warning': return 'text-yellow-500';
      case 'critical': return 'text-red-500';
      default: return 'text-gray-500';
    }
  };

  const getStatusBgColor = (status: string) => {
    switch (status) {
      case 'healthy': return 'bg-green-500';
      case 'warning': return 'bg-yellow-500';
      case 'critical': return 'bg-red-500';
      default: return 'bg-gray-500';
    }
  };

  // Always show health dashboard with demo data
  return (
    <div className="space-y-6">
      {/* Header */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-blue-500/10">
                <Heart className="h-5 w-5 text-blue-500" />
              </div>
              <div>
                <CardTitle className="flex items-center gap-2">
                  Infrastructure Health Monitor
                  <Badge variant={isMonitoring ? "default" : "secondary"}>
                    {isMonitoring ? 'Live' : 'Paused'}
                  </Badge>
                </CardTitle>
                <p className="text-sm text-muted-foreground">
                  Real-time infrastructure health monitoring and alerting
                </p>
              </div>
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setAutoRefresh(!autoRefresh)}
              >
                {autoRefresh ? <Clock className="h-4 w-4" /> : <RefreshCw className="h-4 w-4" />}
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={isMonitoring ? stopMonitoring : startMonitoring}
              >
                {isMonitoring ? 'Pause' : 'Start'}
              </Button>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* System Health Overview */}
      {systemHealth && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <Heart className={`h-4 w-4 ${getStatusColor(systemHealth.overall)}`} />
                <span className="text-sm font-medium">Overall Health</span>
              </div>
              <p className="text-2xl font-bold mt-1 capitalize">{systemHealth.overall}</p>
              <Progress value={systemHealth.score} className="mt-2 h-2" />
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-green-500" />
                <span className="text-sm font-medium">Healthy Resources</span>
              </div>
              <p className="text-2xl font-bold mt-1">{systemHealth.resources.healthy}</p>
              <p className="text-xs text-muted-foreground mt-2">
                of {systemHealth.resources.total} total
              </p>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <Activity className="h-4 w-4 text-blue-500" />
                <span className="text-sm font-medium">System Uptime</span>
              </div>
              <p className="text-2xl font-bold mt-1">{systemHealth.uptime}%</p>
              <p className="text-xs text-muted-foreground mt-2">Last 30 days</p>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <Zap className="h-4 w-4 text-yellow-500" />
                <span className="text-sm font-medium">Avg Response</span>
              </div>
              <p className="text-2xl font-bold mt-1">{systemHealth.responseTime}ms</p>
              <p className="text-xs text-muted-foreground mt-2">
                {systemHealth.responseTime < 200 ? 'Good' : 'Needs attention'}
              </p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Detailed Monitoring */}
      <Tabs defaultValue="resources" className="space-y-4">
        <TabsList>
          <TabsTrigger value="resources">Resources</TabsTrigger>
          <TabsTrigger value="alerts">Alerts</TabsTrigger>
          <TabsTrigger value="performance">Performance</TabsTrigger>
        </TabsList>

        <TabsContent value="resources">
          <div className="space-y-4">
            {healthMetrics.map((metric) => {
              const IconComponent = getResourceIcon(metric.type);
              return (
                <Card key={metric.id}>
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <div className={`p-2 rounded-lg ${getStatusBgColor(metric.status)}/10`}>
                          <IconComponent className={`h-5 w-5 ${getStatusColor(metric.status)}`} />
                        </div>
                        <div>
                          <h4 className="font-medium">{metric.resource}</h4>
                          <p className="text-sm text-muted-foreground capitalize">{metric.type}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant={metric.status === 'healthy' ? 'default' : metric.status === 'warning' ? 'secondary' : 'destructive'}>
                          {metric.status}
                        </Badge>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setSelectedMetric(metric)}
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                      <div>
                        <div className="flex justify-between text-sm mb-1">
                          <span>CPU</span>
                          <span>{metric.cpu}%</span>
                        </div>
                        <Progress value={metric.cpu} className="h-2" />
                      </div>
                      <div>
                        <div className="flex justify-between text-sm mb-1">
                          <span>Memory</span>
                          <span>{metric.memory}%</span>
                        </div>
                        <Progress value={metric.memory} className="h-2" />
                      </div>
                      <div>
                        <div className="flex justify-between text-sm mb-1">
                          <span>Disk</span>
                          <span>{metric.disk}%</span>
                        </div>
                        <Progress value={metric.disk} className="h-2" />
                      </div>
                      <div>
                        <div className="flex justify-between text-sm mb-1">
                          <span>Network</span>
                          <span>{metric.network}%</span>
                        </div>
                        <Progress value={metric.network} className="h-2" />
                      </div>
                    </div>

                    <div className="flex items-center justify-between text-sm text-muted-foreground">
                      <span>Uptime: {metric.uptime}%</span>
                      <span>Last check: {metric.lastCheck.toLocaleTimeString()}</span>
                    </div>

                    {metric.alerts.length > 0 && (
                      <div className="mt-3 pt-3 border-t">
                        <p className="text-sm font-medium mb-2">Active Alerts:</p>
                        <div className="space-y-1">
                          {metric.alerts.filter(alert => !alert.acknowledged).map((alert) => (
                            <div key={alert.id} className="flex items-center justify-between p-2 bg-muted rounded">
                              <div className="flex items-center gap-2">
                                <AlertTriangle className={`h-3 w-3 ${
                                  alert.severity === 'critical' ? 'text-red-500' :
                                  alert.severity === 'high' ? 'text-orange-500' :
                                  alert.severity === 'medium' ? 'text-yellow-500' :
                                  'text-blue-500'
                                }`} />
                                <span className="text-sm">{alert.message}</span>
                              </div>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => acknowledgeAlert(metric.id, alert.id)}
                              >
                                Acknowledge
                              </Button>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </TabsContent>

        <TabsContent value="alerts">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Bell className="h-5 w-5" />
                Active Alerts
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-96">
                <div className="space-y-3">
                  {healthMetrics.flatMap(metric => 
                    metric.alerts.filter(alert => !alert.acknowledged).map(alert => (
                      <motion.div
                        key={alert.id}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="flex items-center justify-between p-3 border rounded-lg"
                      >
                        <div className="flex items-center gap-3">
                          <AlertTriangle className={`h-4 w-4 ${
                            alert.severity === 'critical' ? 'text-red-500' :
                            alert.severity === 'high' ? 'text-orange-500' :
                            alert.severity === 'medium' ? 'text-yellow-500' :
                            'text-blue-500'
                          }`} />
                          <div>
                            <p className="font-medium">{alert.message}</p>
                            <p className="text-sm text-muted-foreground">
                              {metric.resource} • {alert.timestamp.toLocaleString()}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge variant={
                            alert.severity === 'critical' ? 'destructive' :
                            alert.severity === 'high' ? 'secondary' :
                            alert.severity === 'medium' ? 'outline' :
                            'default'
                          }>
                            {alert.severity}
                          </Badge>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => acknowledgeAlert(metric.id, alert.id)}
                          >
                            Acknowledge
                          </Button>
                        </div>
                      </motion.div>
                    ))
                  )}
                  
                  {healthMetrics.flatMap(metric => metric.alerts).filter(alert => !alert.acknowledged).length === 0 && (
                    <div className="text-center py-8">
                      <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-4" />
                      <h3 className="text-lg font-semibold mb-2">All Clear!</h3>
                      <p className="text-muted-foreground">No active alerts</p>
                    </div>
                  )}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="performance">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Activity className="h-5 w-5" />
                Performance Metrics
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div>
                  <h4 className="font-medium mb-3">System Performance</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <div className="flex justify-between text-sm mb-2">
                        <span>CPU Usage</span>
                        <span>{Math.round(performanceData[performanceData.length - 1]?.cpu || 0)}%</span>
                      </div>
                      <Progress value={performanceData[performanceData.length - 1]?.cpu || 0} className="h-3" />
                    </div>
                    <div>
                      <div className="flex justify-between text-sm mb-2">
                        <span>Memory Usage</span>
                        <span>{Math.round(performanceData[performanceData.length - 1]?.memory || 0)}%</span>
                      </div>
                      <Progress value={performanceData[performanceData.length - 1]?.memory || 0} className="h-3" />
                    </div>
                    <div>
                      <div className="flex justify-between text-sm mb-2">
                        <span>Network I/O</span>
                        <span>{Math.round(performanceData[performanceData.length - 1]?.network || 0)}%</span>
                      </div>
                      <Progress value={performanceData[performanceData.length - 1]?.network || 0} className="h-3" />
                    </div>
                    <div>
                      <div className="flex justify-between text-sm mb-2">
                        <span>Request Rate</span>
                        <span>{performanceData[performanceData.length - 1]?.requests || 0}/min</span>
                      </div>
                      <div className="h-3 bg-gray-200 rounded-full">
                        <div 
                          className="h-3 bg-blue-500 rounded-full transition-all duration-500"
                          style={{ width: `${Math.min(100, (performanceData[performanceData.length - 1]?.requests || 0) / 10)}%` }}
                        />
                      </div>
                    </div>
                  </div>
                </div>

                <div>
                  <h4 className="font-medium mb-3">Recent Activity</h4>
                  <div className="space-y-2">
                    {performanceData.slice(-5).reverse().map((data, index) => (
                      <div key={index} className="flex items-center justify-between p-2 border rounded">
                        <span className="text-sm">{data.timestamp.toLocaleTimeString()}</span>
                        <div className="flex gap-4 text-sm">
                          <span>CPU: {Math.round(data.cpu)}%</span>
                          <span>Mem: {Math.round(data.memory)}%</span>
                          <span>Net: {Math.round(data.network)}%</span>
                          <span>Req: {data.requests}</span>
                          <span>Err: {data.errors}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Selected Metric Detail */}
      <AnimatePresence>
        {selectedMetric && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
          >
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>{selectedMetric.resource} Details</CardTitle>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setSelectedMetric(null)}
                  >
                    ×
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="text-center">
                    <p className="text-sm text-muted-foreground">CPU</p>
                    <p className="text-2xl font-bold">{selectedMetric.cpu}%</p>
                  </div>
                  <div className="text-center">
                    <p className="text-sm text-muted-foreground">Memory</p>
                    <p className="text-2xl font-bold">{selectedMetric.memory}%</p>
                  </div>
                  <div className="text-center">
                    <p className="text-sm text-muted-foreground">Disk</p>
                    <p className="text-2xl font-bold">{selectedMetric.disk}%</p>
                  </div>
                  <div className="text-center">
                    <p className="text-sm text-muted-foreground">Network</p>
                    <p className="text-2xl font-bold">{selectedMetric.network}%</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
