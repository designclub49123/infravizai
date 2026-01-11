import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Shield,
  ShieldAlert,
  ShieldCheck,
  AlertTriangle,
  AlertCircle,
  Info,
  CheckCircle2,
  RefreshCw,
  Wrench,
  ChevronDown,
  ChevronRight,
  Eye,
  Download,
  Zap,
  TrendingUp,
  Activity,
  Lock,
  Unlock,
  Bug,
  FileText,
  Settings,
  Play,
  Pause
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';
import type { SecurityFinding, SecuritySeverity, SecurityReport } from '@/types/infrastructure';

const severityConfig: Record<SecuritySeverity, { icon: any; color: string; bgColor: string }> = {
  critical: { icon: ShieldAlert, color: 'text-red-600', bgColor: 'bg-red-100 dark:bg-red-900/30' },
  high: { icon: AlertTriangle, color: 'text-orange-500', bgColor: 'bg-orange-100 dark:bg-orange-900/30' },
  medium: { icon: AlertCircle, color: 'text-yellow-500', bgColor: 'bg-yellow-100 dark:bg-yellow-900/30' },
  low: { icon: Info, color: 'text-blue-500', bgColor: 'bg-blue-100 dark:bg-blue-900/30' },
  info: { icon: Info, color: 'text-muted-foreground', bgColor: 'bg-muted' },
};

function ScoreGauge({ score, label }: { score: number; label: string }) {
  const getColor = (s: number) => {
    if (s >= 80) return 'text-green-500';
    if (s >= 60) return 'text-yellow-500';
    if (s >= 40) return 'text-orange-500';
    return 'text-red-500';
  };

  return (
    <div className="text-center">
      <div className={`text-3xl font-bold ${getColor(score)}`}>{score}%</div>
      <div className="text-sm text-muted-foreground">{label}</div>
      <Progress value={score} className="mt-2 h-2" />
    </div>
  );
}

function FindingCard({ finding, onAutoFix }: { 
  finding: SecurityFinding; 
  onAutoFix: (id: string) => void;
}) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [isFixing, setIsFixing] = useState(false);
  const config = severityConfig[finding.severity];

  const handleAutoFix = async () => {
    setIsFixing(true);
    // Simulate auto-fix
    setTimeout(() => {
      onAutoFix(finding.id);
      setIsFixing(false);
      toast.success(`Auto-fixed: ${finding.title}`);
    }, 2000);
  };

  return (
    <Card className="hover:shadow-md transition-shadow">
      <Collapsible open={isExpanded} onOpenChange={setIsExpanded}>
        <CollapsibleTrigger asChild>
          <CardHeader className="cursor-pointer">
            <div className="flex items-start justify-between">
              <div className="flex items-start gap-3">
                <div className={`p-2 rounded-lg ${config.bgColor}`}>
                  <config.icon className={`h-5 w-5 ${config.color}`} />
                </div>
                <div className="flex-1">
                  <CardTitle className="text-lg">{finding.title}</CardTitle>
                  <CardDescription className="mt-1">
                    {finding.description}
                  </CardDescription>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Badge className={config.bgColor}>
                  {finding.severity.toUpperCase()}
                </Badge>
                <ChevronDown className={`h-4 w-4 transition-transform ${
                  isExpanded ? 'rotate-180' : ''
                }`} />
              </div>
            </div>
          </CardHeader>
        </CollapsibleTrigger>
        
        <CollapsibleContent>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <h4 className="text-sm font-medium mb-2">Affected Resources</h4>
                <div className="space-y-1">
                  {finding.resourceIds?.map((resource, index) => (
                    <div key={index} className="text-sm text-muted-foreground">
                      • {resource}
                    </div>
                  ))}
                </div>
              </div>
              
              <div>
                <h4 className="text-sm font-medium mb-2">Recommendations</h4>
                <div className="space-y-1">
                  {finding.recommendations?.map((rec, index) => (
                    <div key={index} className="text-sm text-muted-foreground">
                      • {rec}
                    </div>
                  ))}
                </div>
              </div>
            </div>
            
            <div className="flex items-center justify-between pt-2 border-t">
              <div className="text-sm text-muted-foreground">
                Risk Score: <span className="font-medium">{finding.riskScore}</span>
              </div>
              <div className="flex gap-2">
                <Button variant="outline" size="sm">
                  <Eye className="h-4 w-4 mr-1" />
                  Details
                </Button>
                {finding.autoFixable && (
                  <Button 
                    size="sm" 
                    onClick={handleAutoFix}
                    disabled={isFixing}
                    className="gap-2"
                  >
                    {isFixing ? (
                      <>
                        <Activity className="h-4 w-4 animate-spin" />
                        Fixing...
                      </>
                    ) : (
                      <>
                        <Wrench className="h-4 w-4" />
                        Auto Fix
                      </>
                    )}
                  </Button>
                )}
              </div>
            </div>
          </CardContent>
        </CollapsibleContent>
      </Collapsible>
    </Card>
  );
}

export default function SecurityPageFixed() {
  const [findings, setFindings] = useState<SecurityFinding[]>([]);
  const [report, setReport] = useState<SecurityReport | null>(null);
  const [isScanning, setIsScanning] = useState(false);
  const [scanProgress, setScanProgress] = useState(0);
  const [selectedSeverity, setSelectedSeverity] = useState<string>('all');
  const [isRealTimeEnabled, setIsRealTimeEnabled] = useState(true);

  useEffect(() => {
    loadSecurityData();
    
    // Set up real-time monitoring
    if (isRealTimeEnabled) {
      const interval = setInterval(() => {
        // Simulate real-time security monitoring
        if (Math.random() > 0.8) {
          addRandomFinding();
        }
      }, 30000); // Every 30 seconds
      
      return () => clearInterval(interval);
    }
  }, [isRealTimeEnabled]);

  const loadSecurityData = () => {
    setIsScanning(true);
    setScanProgress(0);
    
    // Simulate security scan
    const interval = setInterval(() => {
      setScanProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval);
          generateMockReport();
          setIsScanning(false);
          return 100;
        }
        return prev + 10;
      });
    }, 200);
  };

  const generateMockReport = () => {
    const mockFindings: SecurityFinding[] = [
      {
        id: '1',
        title: 'Unencrypted S3 Bucket',
        description: 'S3 bucket containing sensitive data is not encrypted',
        severity: 'high',
        category: 'data-protection',
        riskScore: 85,
        resourceIds: ['s3-bucket-prod-data'],
        recommendations: [
          'Enable server-side encryption for the bucket',
          'Update bucket policy to enforce encryption',
          'Review and encrypt existing objects'
        ],
        autoFixable: true,
        discoveredAt: new Date(Date.now() - 2 * 60 * 60 * 1000),
      },
      {
        id: '2',
        title: 'Open Security Group',
        description: 'Security group allows unrestricted access to port 22',
        severity: 'critical',
        category: 'network-security',
        riskScore: 95,
        resourceIds: ['sg-web-servers'],
        recommendations: [
          'Restrict SSH access to specific IP ranges',
          'Implement bastion host for SSH access',
          'Enable multi-factor authentication'
        ],
        autoFixable: true,
        discoveredAt: new Date(Date.now() - 4 * 60 * 60 * 1000),
      },
      {
        id: '3',
        title: 'Outdated SSL Certificate',
        description: 'SSL certificate will expire in 15 days',
        severity: 'medium',
        category: 'compliance',
        riskScore: 65,
        resourceIds: ['load-balancer-prod'],
        recommendations: [
          'Renew SSL certificate immediately',
          'Set up automated certificate renewal',
          'Implement certificate monitoring'
        ],
        autoFixable: false,
        discoveredAt: new Date(Date.now() - 1 * 60 * 60 * 1000),
      },
      {
        id: '4',
        title: 'Public Database Access',
        description: 'RDS instance is accessible from the internet',
        severity: 'high',
        category: 'data-protection',
        riskScore: 88,
        resourceIds: ['rds-prod-mysql'],
        recommendations: [
          'Move database to private subnet',
          'Implement VPN access for database',
          'Update security group rules'
        ],
        autoFixable: true,
        discoveredAt: new Date(Date.now() - 6 * 60 * 60 * 1000),
      },
      {
        id: '5',
        title: 'Missing CloudTrail Logging',
        description: 'CloudTrail is not enabled for all regions',
        severity: 'medium',
        category: 'monitoring',
        riskScore: 60,
        resourceIds: ['aws-account-global'],
        recommendations: [
          'Enable CloudTrail in all regions',
          'Configure log forwarding to SIEM',
          'Set up alerting for suspicious activities'
        ],
        autoFixable: true,
        discoveredAt: new Date(Date.now() - 8 * 60 * 60 * 1000),
      },
    ];

    setFindings(mockFindings);
    
    const mockReport: SecurityReport = {
      id: 'report-' + Date.now(),
      scanDate: new Date(),
      overallScore: 72,
      findings: mockFindings,
      summary: {
        critical: 1,
        high: 2,
        medium: 2,
        low: 0,
        info: 0,
      },
      recommendations: [
        'Implement encryption for all sensitive data',
        'Review and restrict network access',
        'Set up automated security scanning',
        'Enable comprehensive logging and monitoring'
      ],
    };
    
    setReport(mockReport);
  };

  const addRandomFinding = () => {
    const newFinding: SecurityFinding = {
      id: Date.now().toString(),
      title: 'Suspicious Login Activity',
      description: 'Multiple failed login attempts detected from unusual location',
      severity: 'medium',
      category: 'threat-detection',
      riskScore: 70,
      resourceIds: ['iam-user-admin'],
      recommendations: [
        'Investigate login source',
        'Consider temporary account lock',
        'Enable multi-factor authentication'
      ],
      autoFixable: false,
      discoveredAt: new Date(),
    };
    
    setFindings(prev => [newFinding, ...prev]);
    toast.warning('New security threat detected!');
  };

  const runSecurityScan = () => {
    loadSecurityData();
    toast.info('Starting comprehensive security scan...');
  };

  const handleAutoFix = (findingId: string) => {
    setFindings(prev => prev.map(f => 
      f.id === findingId 
        ? { ...f, status: 'resolved' as any }
        : f
    ));
  };

  const exportReport = () => {
    if (!report) return;
    
    const dataStr = JSON.stringify(report, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,' + encodeURIComponent(dataStr);
    
    const exportFileDefaultName = `security-report-${new Date().toISOString().split('T')[0]}.json`;
    
    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();
    
    toast.success('Security report exported!');
  };

  const filteredFindings = findings.filter(finding => 
    selectedSeverity === 'all' || finding.severity === selectedSeverity
  );

  const severityCounts = findings.reduce((acc, finding) => {
    acc[finding.severity] = (acc[finding.severity] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="min-h-[calc(100vh-3.5rem)] p-6"
    >
      <div className="max-w-6xl mx-auto">
        <div className="mb-6">
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Shield className="h-6 w-6 text-primary" />
            Security Analysis
          </h1>
          <p className="text-muted-foreground">
            AI-powered security threat detection and compliance checking
          </p>
        </div>

        {/* Security Score Overview */}
        {report && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <Card>
              <CardContent className="p-4">
                <ScoreGauge score={report.overallScore} label="Security Score" />
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-red-600">{severityCounts.critical || 0}</div>
                  <div className="text-sm text-muted-foreground">Critical Issues</div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-orange-600">{severityCounts.high || 0}</div>
                  <div className="text-sm text-muted-foreground">High Issues</div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-600">{findings.length}</div>
                  <div className="text-sm text-muted-foreground">Total Findings</div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Control Panel */}
        <Card className="mb-6">
          <CardContent className="p-4">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div className="flex items-center gap-2">
                <Button 
                  onClick={runSecurityScan}
                  disabled={isScanning}
                  className="gap-2"
                >
                  {isScanning ? (
                    <>
                      <Activity className="h-4 w-4 animate-spin" />
                      Scanning...
                    </>
                  ) : (
                    <>
                      <Shield className="h-4 w-4" />
                      Run Security Scan
                    </>
                  )}
                </Button>
                
                <Button variant="outline" onClick={exportReport} className="gap-2">
                  <Download className="h-4 w-4" />
                  Export Report
                </Button>
              </div>
              
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                  <label className="text-sm font-medium">Real-time Monitoring</label>
                  <div className="relative">
                    <input
                      type="checkbox"
                      checked={isRealTimeEnabled}
                      onChange={(e) => setIsRealTimeEnabled(e.target.checked)}
                      className="sr-only"
                    />
                    <div className={`w-10 h-6 rounded-full transition-colors ${
                      isRealTimeEnabled ? 'bg-primary' : 'bg-muted'
                    }`}>
                      <div className={`w-4 h-4 bg-white rounded-full transition-transform ${
                        isRealTimeEnabled ? 'translate-x-5' : 'translate-x-0.5'
                      }`} />
                    </div>
                  </div>
                </div>
                
                <Select value={selectedSeverity} onValueChange={setSelectedSeverity}>
                  <SelectTrigger className="w-32">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Issues</SelectItem>
                    <SelectItem value="critical">Critical</SelectItem>
                    <SelectItem value="high">High</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="low">Low</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            
            {isScanning && (
              <div className="mt-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium">Scan Progress</span>
                  <span className="text-sm">{scanProgress}%</span>
                </div>
                <Progress value={scanProgress} className="h-2" />
              </div>
            )}
          </CardContent>
        </Card>

        {/* Security Findings */}
        <Tabs defaultValue="findings" className="space-y-6">
          <TabsList>
            <TabsTrigger value="findings">Security Findings</TabsTrigger>
            <TabsTrigger value="compliance">Compliance</TabsTrigger>
            <TabsTrigger value="recommendations">Recommendations</TabsTrigger>
          </TabsList>

          <TabsContent value="findings">
            <div className="grid gap-4">
              {filteredFindings.length === 0 ? (
                <Card>
                  <CardContent className="flex flex-col items-center justify-center p-8">
                    <ShieldCheck className="h-12 w-12 text-green-500 mb-4" />
                    <h3 className="text-lg font-semibold mb-2">No Security Issues Found</h3>
                    <p className="text-muted-foreground text-center">
                      Your infrastructure is secure and compliant
                    </p>
                  </CardContent>
                </Card>
              ) : (
                filteredFindings.map((finding) => (
                  <FindingCard
                    key={finding.id}
                    finding={finding}
                    onAutoFix={handleAutoFix}
                  />
                ))
              )}
            </div>
          </TabsContent>

          <TabsContent value="compliance">
            <Card>
              <CardHeader>
                <CardTitle>Compliance Status</CardTitle>
                <CardDescription>
                  Industry standards and regulatory compliance
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <h4 className="font-medium">Security Standards</h4>
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-sm">ISO 27001</span>
                        <Badge variant="default">Compliant</Badge>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm">SOC 2 Type II</span>
                        <Badge variant="default">Compliant</Badge>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm">PCI DSS</span>
                        <Badge variant="secondary">Not Applicable</Badge>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm">GDPR</span>
                        <Badge variant="default">Compliant</Badge>
                      </div>
                    </div>
                  </div>
                  
                  <div className="space-y-4">
                    <h4 className="font-medium">Cloud Security</h4>
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-sm">AWS Well-Architected</span>
                        <Badge variant="default">85%</Badge>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm">CIS Benchmarks</span>
                        <Badge variant="secondary">72%</Badge>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm">NIST Framework</span>
                        <Badge variant="default">Compliant</Badge>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="recommendations">
            <Card>
              <CardHeader>
                <CardTitle>Security Recommendations</CardTitle>
                <CardDescription>
                  AI-powered recommendations to improve your security posture
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-start gap-3 p-3 rounded-lg border">
                    <Zap className="h-5 w-5 text-blue-500 mt-0.5" />
                    <div>
                      <h4 className="font-medium">Enable Automated Security Scanning</h4>
                      <p className="text-sm text-muted-foreground mt-1">
                        Set up continuous security monitoring to detect threats in real-time
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-start gap-3 p-3 rounded-lg border">
                    <Lock className="h-5 w-5 text-green-500 mt-0.5" />
                    <div>
                      <h4 className="font-medium">Implement Zero-Trust Architecture</h4>
                      <p className="text-sm text-muted-foreground mt-1">
                        Adopt zero-trust principles for enhanced security
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-start gap-3 p-3 rounded-lg border">
                    <TrendingUp className="h-5 w-5 text-purple-500 mt-0.5" />
                    <div>
                      <h4 className="font-medium">Regular Security Training</h4>
                      <p className="text-sm text-muted-foreground mt-1">
                        Conduct quarterly security awareness training for all team members
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </motion.div>
  );
}
