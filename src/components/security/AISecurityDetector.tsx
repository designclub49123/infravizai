import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Shield, 
  AlertTriangle, 
  CheckCircle, 
  XCircle, 
  Info, 
  Brain, 
  Search, 
  RefreshCw, 
  Eye, 
  EyeOff,
  Zap,
  Lock,
  Unlock,
  Database,
  Server,
  Globe,
  Wifi
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useEnhancedInfrastructure } from '@/contexts/EnhancedInfrastructureContext';
import { toast } from 'sonner';
import type { SecurityThreat, SecuritySeverity } from '@/types/extended';

interface SecurityIssue {
  id: string;
  type: string;
  severity: SecuritySeverity;
  title: string;
  description: string;
  affectedResources: string[];
  mitigation: string[];
  aiConfidence: number;
  category: 'network' | 'access' | 'data' | 'compliance';
  icon: any;
}

const severityColors: Record<SecuritySeverity, string> = {
  critical: 'bg-red-500',
  high: 'bg-orange-500',
  medium: 'bg-yellow-500',
  low: 'bg-blue-500',
  info: 'bg-gray-500',
};

const categoryIcons = {
  network: Wifi,
  access: Lock,
  data: Database,
  compliance: Shield,
};

export function AISecurityDetector() {
  const { 
    state: { currentDiagram, securityThreats }, 
    runSecurityScan,
    resolveThreat 
  } = useEnhancedInfrastructure();
  
  const [isScanning, setIsScanning] = useState(false);
  const [scanProgress, setScanProgress] = useState(0);
  const [detectedIssues, setDetectedIssues] = useState<SecurityIssue[]>([]);
  const [showDetails, setShowDetails] = useState<string | null>(null);

  useEffect(() => {
    if (currentDiagram) {
      // Convert security threats to security issues
      const issues: SecurityIssue[] = securityThreats.map(threat => ({
        id: threat.id,
        type: threat.threat_type,
        severity: threat.severity,
        title: threat.threat_type.charAt(0).toUpperCase() + threat.threat_type.slice(1),
        description: threat.description,
        affectedResources: threat.affected_resources,
        mitigation: threat.mitigation_steps,
        aiConfidence: threat.ai_confidence || 0.8,
        category: 'network' as const, // Simplified categorization
        icon: AlertTriangle,
      }));
      setDetectedIssues(issues);
    }
  }, [currentDiagram, securityThreats]);

  const handleSecurityScan = async () => {
    if (!currentDiagram) {
      toast.error('Please load a diagram first');
      return;
    }

    setIsScanning(true);
    setScanProgress(0);

    try {
      // Simulate AI security scanning with progress
      const scanSteps = [
        { progress: 20, message: 'Analyzing network configuration...' },
        { progress: 40, message: 'Scanning access controls...' },
        { progress: 60, message: 'Checking data encryption...' },
        { progress: 80, message: 'Evaluating compliance...' },
        { progress: 100, message: 'Generating security report...' },
      ];

      for (const step of scanSteps) {
        await new Promise(resolve => setTimeout(resolve, 800));
        setScanProgress(step.progress);
      }

      await runSecurityScan();
      toast.success('Security scan completed!');
    } catch (error) {
      toast.error('Failed to complete security scan');
    } finally {
      setIsScanning(false);
      setScanProgress(0);
    }
  };

  const handleResolveThreat = async (threatId: string) => {
    try {
      await resolveThreat(threatId);
      setDetectedIssues(prev => prev.filter(issue => issue.id !== threatId));
      toast.success('Security threat resolved');
    } catch (error) {
      toast.error('Failed to resolve threat');
    }
  };

  const generateMockSecurityIssues = (): SecurityIssue[] => {
    return [
      {
        id: '1',
        type: 'open_security_group',
        severity: 'critical',
        title: 'Open Security Group',
        description: 'Security group allows inbound traffic from any IP address (0.0.0.0/0)',
        affectedResources: ['sg-12345678', 'sg-87654321'],
        mitigation: [
          'Restrict inbound traffic to specific IP ranges',
          'Use security group rules to limit access',
          'Implement principle of least privilege'
        ],
        aiConfidence: 0.95,
        category: 'network',
        icon: Unlock,
      },
      {
        id: '2',
        type: 'unencrypted_rds',
        severity: 'high',
        title: 'Unencrypted RDS Instance',
        description: 'RDS database instance does not have encryption at rest enabled',
        affectedResources: ['db-prod-001'],
        mitigation: [
          'Enable encryption at rest for RDS instance',
          'Use SSL/TLS for data in transit',
          'Implement database access controls'
        ],
        aiConfidence: 0.88,
        category: 'data',
        icon: Database,
      },
      {
        id: '3',
        type: 'public_s3_bucket',
        severity: 'medium',
        title: 'Public S3 Bucket',
        description: 'S3 bucket has public read access enabled',
        affectedResources: ['s3-app-data-bucket'],
        mitigation: [
          'Block public access to S3 bucket',
          'Implement bucket policies',
          'Use IAM roles for access control'
        ],
        aiConfidence: 0.92,
        category: 'access',
        icon: Globe,
      },
      {
        id: '4',
        type: 'missing_cloudtrail',
        severity: 'medium',
        title: 'Missing CloudTrail Logging',
        description: 'AWS CloudTrail is not enabled for API logging',
        affectedResources: ['AWS Account'],
        mitigation: [
          'Enable CloudTrail in all regions',
          'Configure log encryption',
          'Set up log monitoring'
        ],
        aiConfidence: 0.85,
        category: 'compliance',
        icon: Eye,
      },
      {
        id: '5',
        type: 'overprivileged_iam',
        severity: 'low',
        title: 'Overprivileged IAM Role',
        description: 'IAM role has more permissions than necessary',
        affectedResources: ['role-ec2-admin'],
        mitigation: [
          'Review and minimize IAM permissions',
          'Use role-based access control',
          'Implement regular permission audits'
        ],
        aiConfidence: 0.78,
        category: 'access',
        icon: Lock,
      },
    ];
  };

  const issuesByCategory = detectedIssues.reduce((acc, issue) => {
    acc[issue.category] = acc[issue.category] || [];
    acc[issue.category].push(issue);
    return acc;
  }, {} as Record<string, SecurityIssue[]>);

  const severityStats = {
    critical: detectedIssues.filter(i => i.severity === 'critical').length,
    high: detectedIssues.filter(i => i.severity === 'high').length,
    medium: detectedIssues.filter(i => i.severity === 'medium').length,
    low: detectedIssues.filter(i => i.severity === 'low').length,
    info: detectedIssues.filter(i => i.severity === 'info').length,
  };

  const overallScore = Math.max(0, 100 - (
    severityStats.critical * 25 +
    severityStats.high * 15 +
    severityStats.medium * 10 +
    severityStats.low * 5 +
    severityStats.info * 2
  ));

  if (!currentDiagram) {
    return (
      <Card className="w-full">
        <CardContent className="flex flex-col items-center justify-center p-8">
          <Shield className="h-12 w-12 text-muted-foreground mb-4" />
          <h3 className="text-lg font-semibold mb-2">No Diagram Loaded</h3>
          <p className="text-muted-foreground text-center">
            Load an infrastructure diagram to run AI security analysis
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Scan Controls */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-primary/10">
                <Brain className="h-5 w-5 text-primary" />
              </div>
              <div>
                <CardTitle className="flex items-center gap-2">
                  AI Security Threat Detection
                  <Badge variant="secondary" className="gap-1">
                    <Zap className="h-3 w-3" />
                    AI Powered
                  </Badge>
                </CardTitle>
                <CardDescription>
                  Advanced AI analysis of your infrastructure for security vulnerabilities
                </CardDescription>
              </div>
            </div>
            <Button
              onClick={handleSecurityScan}
              disabled={isScanning}
              className="gap-2"
            >
              {isScanning ? (
                <>
                  <RefreshCw className="h-4 w-4 animate-spin" />
                  Scanning...
                </>
              ) : (
                <>
                  <Search className="h-4 w-4" />
                  Run Security Scan
                </>
              )}
            </Button>
          </div>
        </CardHeader>

        {/* Progress Bar */}
        <AnimatePresence>
          {isScanning && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="px-6 pb-4"
            >
              <Progress value={scanProgress} className="w-full" />
              <p className="text-xs text-muted-foreground mt-2">
                {scanProgress < 20 && 'Initializing AI engine...'}
                {scanProgress >= 20 && scanProgress < 40 && 'Analyzing network configuration...'}
                {scanProgress >= 40 && scanProgress < 60 && 'Scanning access controls...'}
                {scanProgress >= 60 && scanProgress < 80 && 'Checking data encryption...'}
                {scanProgress >= 80 && 'Generating security report...'}
              </p>
            </motion.div>
          )}
        </AnimatePresence>
      </Card>

      {/* Security Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <div className={`w-3 h-3 rounded-full ${severityColors.critical}`} />
              <span className="text-sm font-medium">Critical</span>
            </div>
            <p className="text-2xl font-bold mt-1">{severityStats.critical}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <div className={`w-3 h-3 rounded-full ${severityColors.high}`} />
              <span className="text-sm font-medium">High</span>
            </div>
            <p className="text-2xl font-bold mt-1">{severityStats.high}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <div className={`w-3 h-3 rounded-full ${severityColors.medium}`} />
              <span className="text-sm font-medium">Medium</span>
            </div>
            <p className="text-2xl font-bold mt-1">{severityStats.medium}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Shield className="h-4 w-4 text-primary" />
              <span className="text-sm font-medium">Security Score</span>
            </div>
            <p className="text-2xl font-bold mt-1">{overallScore}%</p>
          </CardContent>
        </Card>
      </div>

      {/* Security Issues */}
      {detectedIssues.length > 0 && (
        <Tabs defaultValue="all" className="space-y-4">
          <TabsList>
            <TabsTrigger value="all">All Issues ({detectedIssues.length})</TabsTrigger>
            <TabsTrigger value="network">Network ({issuesByCategory.network?.length || 0})</TabsTrigger>
            <TabsTrigger value="access">Access ({issuesByCategory.access?.length || 0})</TabsTrigger>
            <TabsTrigger value="data">Data ({issuesByCategory.data?.length || 0})</TabsTrigger>
            <TabsTrigger value="compliance">Compliance ({issuesByCategory.compliance?.length || 0})</TabsTrigger>
          </TabsList>

          <TabsContent value="all">
            <div className="space-y-4">
              {detectedIssues.map((issue) => (
                <SecurityIssueCard
                  key={issue.id}
                  issue={issue}
                  onResolve={() => handleResolveThreat(issue.id)}
                  onToggleDetails={() => setShowDetails(showDetails === issue.id ? null : issue.id)}
                  showDetails={showDetails === issue.id}
                />
              ))}
            </div>
          </TabsContent>

          {Object.entries(issuesByCategory).map(([category, issues]) => (
            <TabsContent key={category} value={category}>
              <div className="space-y-4">
                {issues.map((issue) => (
                  <SecurityIssueCard
                    key={issue.id}
                    issue={issue}
                    onResolve={() => handleResolveThreat(issue.id)}
                    onToggleDetails={() => setShowDetails(showDetails === issue.id ? null : issue.id)}
                    showDetails={showDetails === issue.id}
                  />
                ))}
              </div>
            </TabsContent>
          ))}
        </Tabs>
      )}

      {/* No Issues */}
      {detectedIssues.length === 0 && !isScanning && (
        <Card>
          <CardContent className="flex flex-col items-center justify-center p-8">
            <CheckCircle className="h-12 w-12 text-green-500 mb-4" />
            <h3 className="text-lg font-semibold mb-2">No Security Issues Detected</h3>
            <p className="text-muted-foreground text-center">
              Your infrastructure appears to be secure. Run a scan to double-check.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

function SecurityIssueCard({ 
  issue, 
  onResolve, 
  onToggleDetails, 
  showDetails 
}: { 
  issue: SecurityIssue;
  onResolve: () => void;
  onToggleDetails: () => void;
  showDetails: boolean;
}) {
  const IconComponent = issue.icon;
  const CategoryIcon = categoryIcons[issue.category];

  return (
    <Card>
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="flex items-start gap-3">
            <div className={`p-2 rounded-lg ${severityColors[issue.severity]}/10`}>
              <IconComponent className={`h-5 w-5 ${severityColors[issue.severity].replace('bg-', 'text-')}`} />
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <CardTitle className="text-lg">{issue.title}</CardTitle>
                <Badge variant={issue.severity === 'critical' || issue.severity === 'high' ? 'destructive' : 'secondary'}>
                  {issue.severity.toUpperCase()}
                </Badge>
                <Badge variant="outline" className="gap-1">
                  <CategoryIcon className="h-3 w-3" />
                  {issue.category}
                </Badge>
              </div>
              <CardDescription>{issue.description}</CardDescription>
              <div className="flex items-center gap-4 mt-2 text-sm text-muted-foreground">
                <span>AI Confidence: {Math.round(issue.aiConfidence * 100)}%</span>
                <span>Resources: {issue.affectedResources.length}</span>
              </div>
            </div>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={onToggleDetails}>
              {showDetails ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </Button>
            <Button variant="destructive" size="sm" onClick={onResolve}>
              <CheckCircle className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardHeader>

      <AnimatePresence>
        {showDetails && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="border-t"
          >
            <CardContent className="pt-4">
              <div className="space-y-4">
                <div>
                  <h4 className="font-medium mb-2">Affected Resources</h4>
                  <div className="flex flex-wrap gap-2">
                    {issue.affectedResources.map((resource, index) => (
                      <Badge key={index} variant="outline">
                        <Server className="h-3 w-3 mr-1" />
                        {resource}
                      </Badge>
                    ))}
                  </div>
                </div>
                <div>
                  <h4 className="font-medium mb-2">Mitigation Steps</h4>
                  <ul className="space-y-1">
                    {issue.mitigation.map((step, index) => (
                      <li key={index} className="flex items-start gap-2 text-sm">
                        <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                        {step}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </CardContent>
          </motion.div>
        )}
      </AnimatePresence>
    </Card>
  );
}
