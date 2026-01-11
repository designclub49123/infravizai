import { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Activity, 
  Zap, 
  TrendingUp, 
  TrendingDown, 
  AlertTriangle, 
  CheckCircle, 
  XCircle,
  Globe,
  Server,
  Database,
  Cloud,
  Shield,
  Users,
  DollarSign,
  Clock,
  BarChart3,
  LineChart,
  PieChart,
  Wifi,
  Cpu,
  HardDrive,
  RefreshCw,
  Settings,
  Bell,
  Download,
  Upload,
  Link,
  Eye,
  EyeOff,
  Lock,
  Unlock,
  Key,
  Certificate,
  Network,
  Router,
  Smartphone,
  Laptop,
  Monitor,
  Building,
  MapPin,
  Calendar,
  Filter,
  Search,
  Plus,
  Minus,
  Edit,
  Trash2,
  Copy,
  Save,
  Send,
  Receive,
  ArrowUp,
  ArrowDown,
  ArrowRight,
  ArrowLeft,
  MoreVertical,
  ChevronDown,
  ChevronUp,
  ChevronLeft,
  ChevronRight,
  Video
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Slider } from '@/components/ui/slider';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { useEnhancedInfrastructure } from '@/contexts/EnhancedInfrastructureContext';
import { useTheme } from '@/contexts/ThemeContext';
import { toast } from 'sonner';

interface ProductionMetrics {
  id: string;
  name: string;
  type: 'application' | 'database' | 'network' | 'security' | 'cost';
  status: 'healthy' | 'warning' | 'critical' | 'maintenance';
  value: number;
  unit: string;
  threshold: {
    warning: number;
    critical: number;
  };
  trend: 'up' | 'down' | 'stable';
  lastUpdated: Date;
  location: string;
  team: string;
  sla: number;
}

interface RealTimeAlert {
  id: string;
  type: 'info' | 'warning' | 'error' | 'success';
  title: string;
  message: string;
  timestamp: Date;
  source: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  acknowledged: boolean;
  assignedTo?: string;
  actions?: Array<{
    label: string;
    action: () => void;
  }>;
}

interface BusinessMetrics {
  revenue: number;
  users: number;
  transactions: number;
  conversionRate: number;
  uptime: number;
  responseTime: number;
  errorRate: number;
  costPerTransaction: number;
  customerSatisfaction: number;
}

interface TeamMember {
  id: string;
  name: string;
  role: string;
  status: 'online' | 'offline' | 'busy' | 'away';
  expertise: string[];
  currentTask?: string;
  avatar?: string;
}

interface SLA {
  id: string;
  name: string;
  target: number;
  current: number;
  unit: string;
  penalty: number;
  status: 'met' | 'breached' | 'at-risk';
}

export function ProductionDashboard() {
  const { resolvedTheme } = useTheme();
  const [activeView, setActiveView] = useState<'overview' | 'metrics' | 'alerts' | 'teams' | 'sla'>('overview');
  const [selectedTimeRange, setSelectedTimeRange] = useState<'1h' | '24h' | '7d' | '30d'>('24h');
  const [selectedRegion, setSelectedRegion] = useState<'all' | 'us-east-1' | 'us-west-2' | 'eu-west-1' | 'ap-southeast-1'>('all');
  const [isRealTimeEnabled, setIsRealTimeEnabled] = useState(true);
  const [showSensitiveData, setShowSensitiveData] = useState(false);
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [alerts, setAlerts] = useState<RealTimeAlert[]>([]);
  const [metrics, setMetrics] = useState<ProductionMetrics[]>([]);
  const [businessMetrics, setBusinessMetrics] = useState<BusinessMetrics>({
    revenue: 0,
    users: 0,
    transactions: 0,
    conversionRate: 0,
    uptime: 0,
    responseTime: 0,
    errorRate: 0,
    costPerTransaction: 0,
    customerSatisfaction: 0
  });
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);
  const [slaMetrics, setSlaMetrics] = useState<SLA[]>([]);
  const wsRef = useRef<WebSocket | null>(null);
  const refreshIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // Initialize WebSocket for real-time updates
  useEffect(() => {
    if (isRealTimeEnabled) {
      // Simulate WebSocket connection
      const connectWebSocket = () => {
        try {
          // In production, this would be a real WebSocket endpoint
          // ws://localhost:8080/ws or wss://your-production-domain.com/ws
          console.log('Connecting to real-time monitoring...');
          
          // Simulate real-time data updates
          const interval = setInterval(() => {
            generateRealTimeData();
          }, 5000);
          
          refreshIntervalRef.current = interval;
          
          return () => {
            clearInterval(interval);
          };
        } catch (error) {
          console.error('WebSocket connection failed:', error);
          toast.error('Failed to connect to real-time monitoring');
        }
      };

      const cleanup = connectWebSocket();
      return cleanup;
    }
  }, [isRealTimeEnabled]);

  // Generate real-time data
  const generateRealTimeData = useCallback(() => {
    // Simulate real-time metrics
    const newMetrics: ProductionMetrics[] = [
      {
        id: 'cpu-usage',
        name: 'CPU Usage',
        type: 'application',
        status: Math.random() > 0.8 ? 'critical' : Math.random() > 0.6 ? 'warning' : 'healthy',
        value: 20 + Math.random() * 60,
        unit: '%',
        threshold: { warning: 70, critical: 85 },
        trend: Math.random() > 0.5 ? 'up' : 'down',
        lastUpdated: new Date(),
        location: selectedRegion === 'all' ? 'us-east-1' : selectedRegion,
        team: 'Infrastructure',
        sla: 99.9
      },
      {
        id: 'memory-usage',
        name: 'Memory Usage',
        type: 'application',
        status: Math.random() > 0.7 ? 'warning' : 'healthy',
        value: 30 + Math.random() * 50,
        unit: '%',
        threshold: { warning: 75, critical: 90 },
        trend: Math.random() > 0.5 ? 'up' : 'down',
        lastUpdated: new Date(),
        location: selectedRegion === 'all' ? 'us-east-1' : selectedRegion,
        team: 'Infrastructure',
        sla: 99.9
      },
      {
        id: 'response-time',
        name: 'Response Time',
        type: 'application',
        status: Math.random() > 0.9 ? 'critical' : Math.random() > 0.7 ? 'warning' : 'healthy',
        value: 50 + Math.random() * 200,
        unit: 'ms',
        threshold: { warning: 200, critical: 500 },
        trend: Math.random() > 0.5 ? 'up' : 'down',
        lastUpdated: new Date(),
        location: selectedRegion === 'all' ? 'us-east-1' : selectedRegion,
        team: 'Application',
        sla: 99.5
      },
      {
        id: 'error-rate',
        name: 'Error Rate',
        type: 'application',
        status: Math.random() > 0.95 ? 'critical' : Math.random() > 0.85 ? 'warning' : 'healthy',
        value: Math.random() * 5,
        unit: '%',
        threshold: { warning: 2, critical: 5 },
        trend: Math.random() > 0.5 ? 'up' : 'down',
        lastUpdated: new Date(),
        location: selectedRegion === 'all' ? 'us-east-1' : selectedRegion,
        team: 'Application',
        sla: 99.9
      },
      {
        id: 'database-connections',
        name: 'Database Connections',
        type: 'database',
        status: Math.random() > 0.8 ? 'warning' : 'healthy',
        value: 50 + Math.random() * 100,
        unit: 'count',
        threshold: { warning: 120, critical: 150 },
        trend: Math.random() > 0.5 ? 'up' : 'down',
        lastUpdated: new Date(),
        location: selectedRegion === 'all' ? 'us-east-1' : selectedRegion,
        team: 'Database',
        sla: 99.9
      },
      {
        id: 'network-throughput',
        name: 'Network Throughput',
        type: 'network',
        status: 'healthy',
        value: 100 + Math.random() * 900,
        unit: 'Mbps',
        threshold: { warning: 800, critical: 950 },
        trend: Math.random() > 0.5 ? 'up' : 'down',
        lastUpdated: new Date(),
        location: selectedRegion === 'all' ? 'us-east-1' : selectedRegion,
        team: 'Network',
        sla: 99.9
      }
    ];

    setMetrics(newMetrics);

    // Generate business metrics
    setBusinessMetrics({
      revenue: 100000 + Math.random() * 50000,
      users: 10000 + Math.random() * 5000,
      transactions: 50000 + Math.random() * 25000,
      conversionRate: 2 + Math.random() * 3,
      uptime: 99 + Math.random(),
      responseTime: 100 + Math.random() * 200,
      errorRate: Math.random() * 2,
      costPerTransaction: 0.05 + Math.random() * 0.15,
      customerSatisfaction: 4 + Math.random()
    });

    // Generate random alerts
    if (Math.random() > 0.7) {
      const alertTypes = [
        { type: 'warning' as const, title: 'High CPU Usage', message: 'CPU usage exceeded 80% on server-01' },
        { type: 'error' as const, title: 'Database Connection Failed', message: 'Unable to connect to primary database' },
        { type: 'info' as const, title: 'Deployment Complete', message: 'New version deployed to production' },
        { type: 'success' as const, title: 'SLA Met', message: 'All SLAs met for the past hour' }
      ];
      
      const randomAlert = alertTypes[Math.floor(Math.random() * alertTypes.length)];
      const newAlert: RealTimeAlert = {
        id: Date.now().toString(),
        ...randomAlert,
        timestamp: new Date(),
        source: 'Production Monitor',
        severity: Math.random() > 0.7 ? 'high' : Math.random() > 0.4 ? 'medium' : 'low',
        acknowledged: false
      };
      
      setAlerts(prev => [newAlert, ...prev.slice(0, 49)]);
    }
  }, [selectedRegion]);

  // Initialize team members
  useEffect(() => {
    const members: TeamMember[] = [
      { id: '1', name: 'Sarah Chen', role: 'DevOps Lead', status: 'online', expertise: ['Kubernetes', 'AWS', 'Monitoring'], currentTask: 'Investigating CPU spike' },
      { id: '2', name: 'Mike Rodriguez', role: 'Backend Engineer', status: 'busy', expertise: ['Node.js', 'PostgreSQL', 'Redis'], currentTask: 'Deploying hotfix' },
      { id: '3', name: 'Emily Johnson', role: 'SRE', status: 'online', expertise: ['Linux', 'Networking', 'Security'] },
      { id: '4', name: 'David Kim', role: 'Database Admin', status: 'away', expertise: ['PostgreSQL', 'MongoDB', 'Backup'] },
      { id: '5', name: 'Lisa Wang', role: 'Frontend Lead', status: 'online', expertise: ['React', 'Performance', 'UX'] }
    ];
    setTeamMembers(members);
  }, []);

  // Initialize SLA metrics
  useEffect(() => {
    const slas: SLA[] = [
      { id: '1', name: 'API Response Time', target: 200, current: 150 + Math.random() * 100, unit: 'ms', penalty: 1000, status: 'met' },
      { id: '2', name: 'System Uptime', target: 99.9, current: 99 + Math.random(), unit: '%', penalty: 5000, status: 'met' },
      { id: '3', name: 'Error Rate', target: 1, current: Math.random() * 2, unit: '%', penalty: 2000, status: Math.random() > 0.8 ? 'at-risk' : 'met' },
      { id: '4', name: 'Database Performance', target: 100, current: 80 + Math.random() * 40, unit: 'ms', penalty: 1500, status: 'met' }
    ];
    setSlaMetrics(slas);
  }, []);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'healthy': return 'text-green-600 bg-green-100';
      case 'warning': return 'text-yellow-600 bg-yellow-100';
      case 'critical': return 'text-red-600 bg-red-100';
      case 'maintenance': return 'text-blue-600 bg-blue-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getAlertIcon = (type: string) => {
    switch (type) {
      case 'error': return <XCircle className="h-4 w-4" />;
      case 'warning': return <AlertTriangle className="h-4 w-4" />;
      case 'success': return <CheckCircle className="h-4 w-4" />;
      default: return <Activity className="h-4 w-4" />;
    }
  };

  const getTeamStatusColor = (status: string) => {
    switch (status) {
      case 'online': return 'bg-green-500';
      case 'busy': return 'bg-yellow-500';
      case 'away': return 'bg-gray-500';
      default: return 'bg-red-500';
    }
  };

  const acknowledgeAlert = (alertId: string) => {
    setAlerts(prev => prev.map(alert => 
      alert.id === alertId ? { ...alert, acknowledged: true } : alert
    ));
    toast.success('Alert acknowledged');
  };

  const assignAlert = (alertId: string, memberId: string) => {
    const member = teamMembers.find(m => m.id === memberId);
    setAlerts(prev => prev.map(alert => 
      alert.id === alertId ? { ...alert, assignedTo: member?.name } : alert
    ));
    toast.success(`Alert assigned to ${member?.name}`);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 p-6">
      {/* Header */}
      <div className="mb-8">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-2">
              Production Dashboard
            </h1>
            <p className="text-gray-600 dark:text-gray-300">
              Real-time monitoring and business intelligence
            </p>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <Switch
                checked={isRealTimeEnabled}
                onCheckedChange={setIsRealTimeEnabled}
              />
              <span className="text-sm text-gray-600 dark:text-gray-300">Real-time</span>
            </div>
            <div className="flex items-center gap-2">
              <Switch
                checked={autoRefresh}
                onCheckedChange={setAutoRefresh}
              />
              <span className="text-sm text-gray-600 dark:text-gray-300">Auto-refresh</span>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowSensitiveData(!showSensitiveData)}
              className="gap-2"
            >
              {showSensitiveData ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              {showSensitiveData ? 'Hide' : 'Show'} Sensitive
            </Button>
            <Select value={selectedTimeRange} onValueChange={(value: any) => setSelectedTimeRange(value)}>
              <SelectTrigger className="w-32">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="1h">Last Hour</SelectItem>
                <SelectItem value="24h">Last 24h</SelectItem>
                <SelectItem value="7d">Last 7 days</SelectItem>
                <SelectItem value="30d">Last 30 days</SelectItem>
              </SelectContent>
            </Select>
            <Select value={selectedRegion} onValueChange={(value: any) => setSelectedRegion(value)}>
              <SelectTrigger className="w-40">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Regions</SelectItem>
                <SelectItem value="us-east-1">US East 1</SelectItem>
                <SelectItem value="us-west-2">US West 2</SelectItem>
                <SelectItem value="eu-west-1">EU West 1</SelectItem>
                <SelectItem value="ap-southeast-1">AP Southeast 1</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Business Metrics Overview */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Revenue</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                ${showSensitiveData ? businessMetrics.revenue.toFixed(0) : 'XXX'}
              </div>
              <p className="text-xs text-muted-foreground">
                +12% from last month
              </p>
            </CardContent>
          </Card>
          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active Users</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {showSensitiveData ? businessMetrics.users.toFixed(0) : 'XXX'}
              </div>
              <p className="text-xs text-muted-foreground">
                +8% from last week
              </p>
            </CardContent>
          </Card>
          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Transactions</CardTitle>
              <Activity className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {showSensitiveData ? businessMetrics.transactions.toFixed(0) : 'XXX'}
              </div>
              <p className="text-xs text-muted-foreground">
                +15% from yesterday
              </p>
            </CardContent>
          </Card>
          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Uptime</CardTitle>
              <Server className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {businessMetrics.uptime.toFixed(2)}%
              </div>
              <p className="text-xs text-muted-foreground">
                SLA: 99.9%
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <Tabs value={activeView} onValueChange={(value: any) => setActiveView(value)} className="w-full">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="metrics">Metrics</TabsTrigger>
            <TabsTrigger value="alerts">Alerts</TabsTrigger>
            <TabsTrigger value="teams">Teams</TabsTrigger>
            <TabsTrigger value="sla">SLA</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            {/* Real-time Metrics Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {metrics.map((metric) => (
                <Card key={metric.id} className="hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <div className="flex justify-between items-center">
                      <CardTitle className="text-lg">{metric.name}</CardTitle>
                      <Badge className={getStatusColor(metric.status)}>
                        {metric.status}
                      </Badge>
                    </div>
                    <CardDescription>
                      {metric.location} • {metric.team}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="flex justify-between items-center">
                        <span className="text-2xl font-bold">
                          {metric.value.toFixed(1)}{metric.unit}
                        </span>
                        <div className="flex items-center gap-1">
                          {metric.trend === 'up' ? (
                            <ArrowUp className="h-4 w-4 text-red-500" />
                          ) : metric.trend === 'down' ? (
                            <ArrowDown className="h-4 w-4 text-green-500" />
                          ) : (
                            <ArrowRight className="h-4 w-4 text-gray-500" />
                          )}
                          <span className="text-sm text-gray-500">{metric.trend}</span>
                        </div>
                      </div>
                      <Progress 
                        value={(metric.value / metric.threshold.critical) * 100} 
                        className="h-2"
                      />
                      <div className="flex justify-between text-xs text-gray-500">
                        <span>Warning: {metric.threshold.warning}{metric.unit}</span>
                        <span>Critical: {metric.threshold.critical}{metric.unit}</span>
                      </div>
                      <div className="flex justify-between text-xs text-gray-400">
                        <span>SLA: {metric.sla}%</span>
                        <span>Last: {metric.lastUpdated.toLocaleTimeString()}</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Recent Alerts */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Bell className="h-5 w-5" />
                  Recent Alerts
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-64">
                  <div className="space-y-2">
                    {alerts.slice(0, 10).map((alert) => (
                      <div key={alert.id} className="flex items-center justify-between p-3 border rounded-lg">
                        <div className="flex items-center gap-3">
                          <div className={`p-2 rounded-full ${
                            alert.type === 'error' ? 'bg-red-100' :
                            alert.type === 'warning' ? 'bg-yellow-100' :
                            alert.type === 'success' ? 'bg-green-100' : 'bg-blue-100'
                          }`}>
                            {getAlertIcon(alert.type)}
                          </div>
                          <div>
                            <p className="font-medium">{alert.title}</p>
                            <p className="text-sm text-gray-500">{alert.message}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge variant={alert.acknowledged ? "secondary" : "default"}>
                            {alert.acknowledged ? 'Acknowledged' : 'New'}
                          </Badge>
                          <span className="text-xs text-gray-400">
                            {alert.timestamp.toLocaleTimeString()}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="metrics" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Performance Metrics */}
              <Card>
                <CardHeader>
                  <CardTitle>Performance Metrics</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div>
                      <div className="flex justify-between mb-2">
                        <span>Response Time</span>
                        <span>{businessMetrics.responseTime.toFixed(0)}ms</span>
                      </div>
                      <Progress value={(businessMetrics.responseTime / 500) * 100} />
                    </div>
                    <div>
                      <div className="flex justify-between mb-2">
                        <span>Error Rate</span>
                        <span>{businessMetrics.errorRate.toFixed(2)}%</span>
                      </div>
                      <Progress value={(businessMetrics.errorRate / 5) * 100} />
                    </div>
                    <div>
                      <div className="flex justify-between mb-2">
                        <span>Conversion Rate</span>
                        <span>{businessMetrics.conversionRate.toFixed(2)}%</span>
                      </div>
                      <Progress value={(businessMetrics.conversionRate / 5) * 100} />
                    </div>
                    <div>
                      <div className="flex justify-between mb-2">
                        <span>Customer Satisfaction</span>
                        <span>{businessMetrics.customerSatisfaction.toFixed(1)}/5</span>
                      </div>
                      <Progress value={(businessMetrics.customerSatisfaction / 5) * 100} />
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Cost Metrics */}
              <Card>
                <CardHeader>
                  <CardTitle>Cost Analysis</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div>
                      <div className="flex justify-between mb-2">
                        <span>Cost per Transaction</span>
                        <span>${businessMetrics.costPerTransaction.toFixed(3)}</span>
                      </div>
                      <Progress value={(businessMetrics.costPerTransaction / 0.2) * 100} />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="text-center p-4 border rounded">
                        <p className="text-2xl font-bold text-green-600">
                          ${(businessMetrics.revenue * 0.85).toFixed(0)}
                        </p>
                        <p className="text-sm text-gray-500">Net Revenue</p>
                      </div>
                      <div className="text-center p-4 border rounded">
                        <p className="text-2xl font-bold text-red-600">
                          ${(businessMetrics.revenue * 0.15).toFixed(0)}
                        </p>
                        <p className="text-sm text-gray-500">Operating Cost</p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="alerts" className="space-y-6">
            <Card>
              <CardHeader>
                <div className="flex justify-between items-center">
                  <CardTitle>Alert Management</CardTitle>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm">
                      <Filter className="h-4 w-4 mr-2" />
                      Filter
                    </Button>
                    <Button variant="outline" size="sm">
                      <Download className="h-4 w-4 mr-2" />
                      Export
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-96">
                  <div className="space-y-2">
                    {alerts.map((alert) => (
                      <div key={alert.id} className="border rounded-lg p-4">
                        <div className="flex justify-between items-start mb-2">
                          <div className="flex items-center gap-2">
                            {getAlertIcon(alert.type)}
                            <span className="font-medium">{alert.title}</span>
                            <Badge variant={alert.severity === 'critical' ? 'destructive' : 'secondary'}>
                              {alert.severity}
                            </Badge>
                          </div>
                          <div className="flex items-center gap-2">
                            {!alert.acknowledged && (
                              <Button
                                size="sm"
                                onClick={() => acknowledgeAlert(alert.id)}
                              >
                                Acknowledge
                              </Button>
                            )}
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="sm">
                                  <MoreVertical className="h-4 w-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent>
                                {teamMembers.map((member) => (
                                  <DropdownMenuItem
                                    key={member.id}
                                    onClick={() => assignAlert(alert.id, member.id)}
                                  >
                                    Assign to {member.name}
                                  </DropdownMenuItem>
                                ))}
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </div>
                        </div>
                        <p className="text-gray-600 mb-2">{alert.message}</p>
                        <div className="flex justify-between text-xs text-gray-400">
                          <span>Source: {alert.source}</span>
                          <span>{alert.timestamp.toLocaleString()}</span>
                        </div>
                        {alert.assignedTo && (
                          <div className="mt-2 text-sm text-blue-600">
                            Assigned to: {alert.assignedTo}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="teams" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {teamMembers.map((member) => (
                <Card key={member.id} className="hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <div className="flex items-center gap-3">
                      <div className={`w-3 h-3 rounded-full ${getTeamStatusColor(member.status)}`} />
                      <div>
                        <CardTitle className="text-lg">{member.name}</CardTitle>
                        <CardDescription>{member.role}</CardDescription>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div>
                        <p className="text-sm font-medium mb-1">Expertise:</p>
                        <div className="flex flex-wrap gap-1">
                          {member.expertise.map((skill, index) => (
                            <Badge key={index} variant="secondary" className="text-xs">
                              {skill}
                            </Badge>
                          ))}
                        </div>
                      </div>
                      {member.currentTask && (
                        <div>
                          <p className="text-sm font-medium mb-1">Current Task:</p>
                          <p className="text-sm text-gray-600">{member.currentTask}</p>
                        </div>
                      )}
                      <div className="flex gap-2">
                        <Button size="sm" variant="outline">
                          <Send className="h-3 w-3 mr-1" />
                          Message
                        </Button>
                        <Button size="sm" variant="outline">
                          <Video className="h-3 w-3 mr-1" />
                          Call
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="sla" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {slaMetrics.map((sla) => (
                <Card key={sla.id} className="hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <div className="flex justify-between items-center">
                      <CardTitle>{sla.name}</CardTitle>
                      <Badge className={
                        sla.status === 'met' ? 'bg-green-100 text-green-800' :
                        sla.status === 'at-risk' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-red-100 text-red-800'
                      }>
                        {sla.status}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-600">Target</span>
                        <span className="font-medium">{sla.target}{sla.unit}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-600">Current</span>
                        <span className="font-medium">{sla.current.toFixed(2)}{sla.unit}</span>
                      </div>
                      <Progress 
                        value={(sla.current / sla.target) * 100} 
                        className="h-2"
                      />
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-600">Penalty</span>
                        <span className="font-medium text-red-600">${sla.penalty}</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
