import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  DollarSign, 
  TrendingUp, 
  TrendingDown, 
  AlertTriangle, 
  Zap, 
  Brain,
  Target,
  Activity,
  BarChart3,
  PieChart,
  Calendar,
  Clock,
  Settings,
  Download,
  RefreshCw
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useEnhancedInfrastructure } from '@/contexts/EnhancedInfrastructureContext';
import { toast } from 'sonner';

interface CostData {
  resource: string;
  type: string;
  currentCost: number;
  projectedCost: number;
  usage: number;
  efficiency: number;
  recommendations: string[];
}

interface CostOptimization {
  id: string;
  title: string;
  description: string;
  potentialSavings: number;
  difficulty: 'easy' | 'medium' | 'hard';
  impact: 'low' | 'medium' | 'high';
  status: 'pending' | 'applied';
}

interface CostForecast {
  month: string;
  projected: number;
  actual?: number;
  confidence: number;
}

export function CostMonitor() {
  const { state: { currentDiagram } } = useEnhancedInfrastructure();
  const [costData, setCostData] = useState<CostData[]>([]);
  const [optimizations, setOptimizations] = useState<CostOptimization[]>([]);
  const [forecast, setForecast] = useState<CostForecast[]>([]);
  const [timeRange, setTimeRange] = useState<'7d' | '30d' | '90d'>('30d');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [totalCost, setTotalCost] = useState(0);
  const [costTrend, setCostTrend] = useState<'up' | 'down' | 'stable'>('stable');
  const [savingsPotential, setSavingsPotential] = useState(0);

  useEffect(() => {
    // Always analyze costs, even without currentDiagram
    analyzeCosts();
  }, [timeRange]);

  const analyzeCosts = useCallback(async () => {
    setIsAnalyzing(true);
    
    try {
      // Simulate AI cost analysis
      await new Promise(resolve => setTimeout(resolve, 2000));

      const mockCostData: CostData[] = [
        {
          resource: 'Web Server EC2',
          type: 'ec2',
          currentCost: 45.67,
          projectedCost: 52.30,
          usage: 78,
          efficiency: 85,
          recommendations: [
            'Switch to t3.nano for non-production',
            'Use spot instances for 40% savings',
            'Implement auto-scaling'
          ]
        },
        {
          resource: 'Production RDS',
          type: 'rds',
          currentCost: 120.45,
          projectedCost: 135.20,
          usage: 65,
          efficiency: 72,
          recommendations: [
            'Enable serverless for variable workload',
            'Resize to db.t3.medium',
            'Implement read replicas'
          ]
        },
        {
          resource: 'S3 Storage',
          type: 's3',
          currentCost: 23.89,
          projectedCost: 28.15,
          usage: 45,
          efficiency: 90,
          recommendations: [
            'Enable S3 Intelligent-Tiering',
            'Implement lifecycle policies',
            'Use S3 Glacier for archives'
          ]
        },
        {
          resource: 'Lambda Functions',
          type: 'lambda',
          currentCost: 8.32,
          projectedCost: 9.80,
          usage: 82,
          efficiency: 95,
          recommendations: [
            'Optimize memory allocation',
            'Implement provisioned concurrency',
            'Use ARM64 architecture'
          ]
        },
        {
          resource: 'Load Balancer',
          type: 'alb',
          currentCost: 18.75,
          projectedCost: 22.10,
          usage: 88,
          efficiency: 92,
          recommendations: [
            'Review idle resources',
            'Optimize listener rules',
            'Consider ALB pricing tier'
          ]
        }
      ];

      const mockOptimizations: CostOptimization[] = [
        {
          id: '1',
          title: 'Switch to Spot Instances',
          description: 'Replace on-demand EC2 instances with spot instances for non-critical workloads',
          potentialSavings: 156.80,
          difficulty: 'medium',
          impact: 'high',
          status: 'pending'
        },
        {
          id: '2',
          title: 'Enable RDS Serverless',
          description: 'Convert provisioned RDS to serverless for variable workloads',
          potentialSavings: 89.30,
          difficulty: 'easy',
          impact: 'medium',
          status: 'pending'
        },
        {
          id: '3',
          title: 'Implement S3 Lifecycle',
          description: 'Automate data transition to cheaper storage tiers',
          potentialSavings: 45.60,
          difficulty: 'easy',
          impact: 'low',
          status: 'pending'
        },
        {
          id: '4',
          title: 'Right-size EC2 Instances',
          description: 'Downsize over-provisioned instances based on actual usage',
          potentialSavings: 67.90,
          difficulty: 'medium',
          impact: 'medium',
          status: 'pending'
        }
      ];

      const mockForecast: CostForecast[] = [
        { month: 'Jan', projected: 245.80, actual: 238.45, confidence: 95 },
        { month: 'Feb', projected: 251.20, confidence: 92 },
        { month: 'Mar', projected: 248.90, confidence: 88 },
        { month: 'Apr', projected: 262.40, confidence: 85 },
        { month: 'May', projected: 269.80, confidence: 82 },
        { month: 'Jun', projected: 275.30, confidence: 78 },
      ];

      setCostData(mockCostData);
      setOptimizations(mockOptimizations);
      setForecast(mockForecast);
      
      const total = mockCostData.reduce((sum, item) => sum + item.currentCost, 0);
      setTotalCost(total);
      setSavingsPotential(mockOptimizations.reduce((sum, opt) => sum + opt.potentialSavings, 0));
      
      // Calculate trend
      const lastMonth = mockForecast[0];
      const thisMonth = mockForecast[1];
      if (thisMonth.projected > lastMonth.actual! * 1.05) {
        setCostTrend('up');
      } else if (thisMonth.projected < lastMonth.actual! * 0.95) {
        setCostTrend('down');
      } else {
        setCostTrend('stable');
      }

    } catch (error) {
      toast.error('Failed to analyze costs');
    } finally {
      setIsAnalyzing(false);
    }
  }, [currentDiagram, timeRange]);

  const applyOptimization = useCallback(async (optimization: CostOptimization) => {
    try {
      // Simulate applying optimization
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      setOptimizations(prev => 
        prev.map(opt => 
          opt.id === optimization.id 
            ? { ...opt, status: 'applied' as const }
            : opt
        )
      );
      
      setTotalCost(prev => prev - optimization.potentialSavings);
      setSavingsPotential(prev => prev - optimization.potentialSavings);
      
      toast.success(`Applied optimization: ${optimization.title}`);
    } catch (error) {
      toast.error('Failed to apply optimization');
    }
  }, []);

  const exportCostReport = useCallback(() => {
    const report = {
      totalCost,
      costTrend,
      savingsPotential,
      costData,
      optimizations,
      forecast,
      generatedAt: new Date().toISOString(),
    };

    const dataStr = JSON.stringify(report, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,' + encodeURIComponent(dataStr);
    
    const exportFileDefaultName = `cost-report-${new Date().toISOString().split('T')[0]}.json`;
    
    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();
    
    toast.success('Cost report exported');
  }, [totalCost, costTrend, savingsPotential, costData, optimizations, forecast]);

  // Always show the cost monitor with demo data
  return (
    <div className="space-y-6">
      {/* Header */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-green-500/10">
                <DollarSign className="h-5 w-5 text-green-500" />
              </div>
              <div>
                <CardTitle className="flex items-center gap-2">
                  AI Cost Monitor
                  <Badge variant="secondary" className="gap-1">
                    <Brain className="h-3 w-3" />
                    AI Powered
                  </Badge>
                </CardTitle>
                <p className="text-sm text-muted-foreground">
                  Real-time cost analysis and optimization recommendations
                </p>
              </div>
            </div>
            <div className="flex gap-2">
              <Select value={timeRange} onValueChange={(value: any) => setTimeRange(value)}>
                <SelectTrigger className="w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="7d">Last 7 days</SelectItem>
                  <SelectItem value="30d">Last 30 days</SelectItem>
                  <SelectItem value="90d">Last 90 days</SelectItem>
                </SelectContent>
              </Select>
              <Button variant="outline" onClick={analyzeCosts} disabled={isAnalyzing}>
                <RefreshCw className={`h-4 w-4 ${isAnalyzing ? 'animate-spin' : ''}`} />
              </Button>
              <Button variant="outline" onClick={exportCostReport}>
                <Download className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Cost Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <DollarSign className="h-4 w-4 text-green-500" />
              <span className="text-sm font-medium">Total Cost</span>
            </div>
            <p className="text-2xl font-bold mt-1">${totalCost.toFixed(2)}</p>
            <div className="flex items-center gap-1 mt-2">
              {costTrend === 'up' && <TrendingUp className="h-3 w-3 text-red-500" />}
              {costTrend === 'down' && <TrendingDown className="h-3 w-3 text-green-500" />}
              {costTrend === 'stable' && <Activity className="h-3 w-3 text-blue-500" />}
              <span className="text-xs text-muted-foreground capitalize">{costTrend}</span>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Target className="h-4 w-4 text-blue-500" />
              <span className="text-sm font-medium">Savings Potential</span>
            </div>
            <p className="text-2xl font-bold mt-1">${savingsPotential.toFixed(2)}</p>
            <p className="text-xs text-muted-foreground mt-2">
              {optimizations.filter(o => o.status === 'pending').length} optimizations available
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Zap className="h-4 w-4 text-yellow-500" />
              <span className="text-sm font-medium">Avg Efficiency</span>
            </div>
            <p className="text-2xl font-bold mt-1">
              {Math.round(costData.reduce((sum, item) => sum + item.efficiency, 0) / costData.length)}%
            </p>
            <Progress 
              value={costData.reduce((sum, item) => sum + item.efficiency, 0) / costData.length} 
              className="mt-2 h-2" 
            />
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <BarChart3 className="h-4 w-4 text-purple-500" />
              <span className="text-sm font-medium">Resources</span>
            </div>
            <p className="text-2xl font-bold mt-1">{costData.length}</p>
            <p className="text-xs text-muted-foreground mt-2">
              {costData.filter(item => item.efficiency < 80).length} need optimization
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Detailed Analysis */}
      <Tabs defaultValue="resources" className="space-y-4">
        <TabsList>
          <TabsTrigger value="resources">Resources</TabsTrigger>
          <TabsTrigger value="optimizations">Optimizations</TabsTrigger>
          <TabsTrigger value="forecast">Forecast</TabsTrigger>
        </TabsList>

        <TabsContent value="resources">
          <div className="space-y-4">
            {costData.map((item, index) => (
              <Card key={index}>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between mb-3">
                    <div>
                      <h4 className="font-medium">{item.resource}</h4>
                      <p className="text-sm text-muted-foreground capitalize">{item.type}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-medium">${item.currentCost.toFixed(2)}/mo</p>
                      <p className="text-xs text-muted-foreground">
                        → ${item.projectedCost.toFixed(2)}/mo
                      </p>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4 mb-3">
                    <div>
                      <div className="flex justify-between text-sm mb-1">
                        <span>Usage</span>
                        <span>{item.usage}%</span>
                      </div>
                      <Progress value={item.usage} className="h-2" />
                    </div>
                    <div>
                      <div className="flex justify-between text-sm mb-1">
                        <span>Efficiency</span>
                        <span>{item.efficiency}%</span>
                      </div>
                      <Progress value={item.efficiency} className="h-2" />
                    </div>
                  </div>
                  
                  {item.recommendations.length > 0 && (
                    <div>
                      <p className="text-sm font-medium mb-2">Recommendations:</p>
                      <div className="space-y-1">
                        {item.recommendations.map((rec, recIndex) => (
                          <div key={recIndex} className="flex items-start gap-2 text-sm">
                            <AlertTriangle className="h-3 w-3 text-yellow-500 mt-0.5 flex-shrink-0" />
                            {rec}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="optimizations">
          <div className="space-y-4">
            {optimizations.map((opt) => (
              <Card key={opt.id}>
                <CardContent className="p-4">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <h4 className="font-medium">{opt.title}</h4>
                      <p className="text-sm text-muted-foreground mt-1">{opt.description}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-medium text-green-600">${opt.potentialSavings.toFixed(2)}</p>
                      <p className="text-xs text-muted-foreground">potential savings</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-4 mb-3">
                    <Badge variant={opt.difficulty === 'easy' ? 'default' : opt.difficulty === 'medium' ? 'secondary' : 'destructive'}>
                      {opt.difficulty}
                    </Badge>
                    <Badge variant={opt.impact === 'high' ? 'default' : opt.impact === 'medium' ? 'secondary' : 'outline'}>
                      {opt.impact} impact
                    </Badge>
                    {opt.status === 'applied' && (
                      <Badge variant="default" className="bg-green-500">
                        Applied
                      </Badge>
                    )}
                  </div>
                  
                  {opt.status === 'pending' && (
                    <Button 
                      size="sm" 
                      onClick={() => applyOptimization(opt)}
                      className="w-full"
                    >
                      Apply Optimization
                    </Button>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="forecast">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5" />
                Cost Forecast
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {forecast.map((item, index) => (
                  <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                    <div>
                      <p className="font-medium">{item.month}</p>
                      <p className="text-sm text-muted-foreground">
                        Confidence: {item.confidence}%
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-medium">${item.projected.toFixed(2)}</p>
                      {item.actual && (
                        <p className="text-sm text-muted-foreground">
                          Actual: ${item.actual.toFixed(2)}
                        </p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
