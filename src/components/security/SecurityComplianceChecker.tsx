import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Shield, 
  ShieldCheck, 
  ShieldAlert, 
  CheckCircle, 
  AlertTriangle, 
  Info, 
  Lock, 
  Unlock,
  Eye,
  EyeOff,
  FileText,
  Settings,
  Zap,
  TrendingUp,
  Activity,
  Award,
  Certificate,
  Scale,
  UserCheck,
  Database,
  Globe,
  Cloud,
  Server
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';

interface SecurityStandard {
  id: string;
  name: string;
  description: string;
  category: 'security' | 'compliance' | 'privacy';
  status: 'compliant' | 'non-compliant' | 'partial' | 'not-assessed';
  score: number;
  requirements: SecurityRequirement[];
  lastAssessed: Date;
}

interface SecurityRequirement {
  id: string;
  title: string;
  description: string;
  status: 'compliant' | 'non-compliant' | 'not-applicable';
  evidence: string[];
  risk: 'low' | 'medium' | 'high' | 'critical';
  recommendations: string[];
}

interface SecurityPolicy {
  id: string;
  name: string;
  type: 'iam' | 'network' | 'data' | 'encryption';
  enabled: boolean;
  description: string;
  settings: Record<string, any>;
}

interface ComplianceReport {
  id: string;
  generatedAt: Date;
  overallScore: number;
  standards: SecurityStandard[];
  policies: SecurityPolicy[];
  recommendations: string[];
  nextAssessment: Date;
}

const securityStandards: SecurityStandard[] = [
  {
    id: 'iso-27001',
    name: 'ISO 27001',
    description: 'Information Security Management System',
    category: 'security',
    status: 'compliant',
    score: 92,
    requirements: [
      {
        id: 'iso-001',
        title: 'Information Security Policy',
        description: 'Comprehensive information security policy established',
        status: 'compliant',
        evidence: ['Policy document v2.1', 'Board approval', 'Annual review'],
        risk: 'low',
        recommendations: []
      },
      {
        id: 'iso-002',
        title: 'Risk Assessment',
        description: 'Regular risk assessments performed',
        status: 'compliant',
        evidence: ['Quarterly risk assessments', 'Risk register', 'Mitigation plans'],
        risk: 'medium',
        recommendations: ['Include third-party risks', 'Automate risk monitoring']
      }
    ],
    lastAssessed: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000)
  },
  {
    id: 'soc2-type2',
    name: 'SOC 2 Type II',
    description: 'Service Organization Control 2 Type II',
    category: 'compliance',
    status: 'compliant',
    score: 88,
    requirements: [
      {
        id: 'soc2-001',
        title: 'Security Controls',
        description: 'Security controls implemented and monitored',
        status: 'compliant',
        evidence: ['Control documentation', 'Monitoring reports', 'Audit trails'],
        risk: 'low',
        recommendations: []
      },
      {
        id: 'soc2-002',
        title: 'Availability Controls',
        description: 'High availability and disaster recovery',
        status: 'partial',
        evidence: ['Backup procedures', 'DR documentation'],
        risk: 'medium',
        recommendations: ['Implement automated failover', 'Test DR procedures quarterly']
      }
    ],
    lastAssessed: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
  },
  {
    id: 'gdpr',
    name: 'GDPR',
    description: 'General Data Protection Regulation',
    category: 'privacy',
    status: 'compliant',
    score: 95,
    requirements: [
      {
        id: 'gdpr-001',
        title: 'Data Protection',
        description: 'Personal data protection measures',
        status: 'compliant',
        evidence: ['Encryption at rest', 'Data access logs', 'Privacy policy'],
        risk: 'low',
        recommendations: []
      },
      {
        id: 'gdpr-002',
        title: 'Data Subject Rights',
        description: 'Rights of data subjects implemented',
        status: 'compliant',
        evidence: ['Data request procedures', 'Deletion workflows', 'Consent management'],
        risk: 'medium',
        recommendations: ['Automated data request handling', 'Improved consent tracking']
      }
    ],
    lastAssessed: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
  },
  {
    id: 'hipaa',
    name: 'HIPAA',
    description: 'Health Insurance Portability and Accountability Act',
    category: 'compliance',
    status: 'not-assessed',
    score: 0,
    requirements: [
      {
        id: 'hipaa-001',
        title: 'HIPAA Security Rule',
        description: 'Administrative, physical, and technical safeguards',
        status: 'not-applicable',
        evidence: [],
        risk: 'low',
        recommendations: []
      }
    ],
    lastAssessed: new Date()
  }
];

const securityPolicies: SecurityPolicy[] = [
  {
    id: 'iam-policy',
    name: 'IAM Policy',
    type: 'iam',
    enabled: true,
    description: 'Identity and Access Management policies',
    settings: {
      mfaRequired: true,
      passwordPolicy: 'strong',
      sessionTimeout: 8,
      roleBasedAccess: true
    }
  },
  {
    id: 'network-policy',
    name: 'Network Security',
    type: 'network',
    enabled: true,
    description: 'Network security and access controls',
    settings: {
      firewallEnabled: true,
      vpcIsolation: true,
      ddosProtection: true,
      intrusionDetection: true
    }
  },
  {
    id: 'encryption-policy',
    name: 'Encryption Policy',
    type: 'encryption',
    enabled: true,
    description: 'Data encryption requirements',
    settings: {
      encryptionAtRest: true,
      encryptionInTransit: true,
      keyRotation: true,
      algorithm: 'AES-256'
    }
  },
  {
    id: 'data-policy',
    name: 'Data Protection',
    type: 'data',
    enabled: true,
    description: 'Data classification and protection',
    settings: {
      dataClassification: true,
      retentionPolicy: true,
      backupPolicy: true,
      auditLogging: true
    }
  }
];

export function SecurityComplianceChecker() {
  const [standards, setStandards] = useState<SecurityStandard[]>(securityStandards);
  const [policies, setPolicies] = useState<SecurityPolicy[]>(securityPolicies);
  const [isScanning, setIsScanning] = useState(false);
  const [scanProgress, setScanProgress] = useState(0);
  const [selectedStandard, setSelectedStandard] = useState<SecurityStandard | null>(null);
  const [report, setReport] = useState<ComplianceReport | null>(null);
  const [autoScan, setAutoScan] = useState(true);

  useEffect(() => {
    generateReport();
  }, []);

  const generateReport = () => {
    const overallScore = Math.round(
      standards.reduce((acc, std) => acc + std.score, 0) / standards.length
    );
    
    const complianceReport: ComplianceReport = {
      id: 'report-' + Date.now(),
      generatedAt: new Date(),
      overallScore,
      standards,
      policies,
      recommendations: generateRecommendations(),
      nextAssessment: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000)
    };
    
    setReport(complianceReport);
  };

  const generateRecommendations = () => {
    const recommendations = [];
    
    standards.forEach(standard => {
      standard.requirements
        .filter(req => req.status === 'non-compliant' || req.status === 'partial')
        .forEach(req => {
          recommendations.push(...req.recommendations);
        });
    });
    
    return recommendations;
  };

  const runSecurityScan = async () => {
    setIsScanning(true);
    setScanProgress(0);
    
    const interval = setInterval(() => {
      setScanProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval);
          setIsScanning(false);
          generateReport();
          toast.success('Security scan completed!');
          return 100;
        }
        return prev + 10;
      });
    }, 300);
  };

  const togglePolicy = (policyId: string) => {
    setPolicies(prev => prev.map(p => 
      p.id === policyId ? { ...p, enabled: !p.enabled } : p
    ));
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'compliant': return 'text-green-600';
      case 'non-compliant': return 'text-red-600';
      case 'partial': return 'text-yellow-600';
      case 'not-assessed': return 'text-gray-600';
      default: return 'text-gray-600';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'compliant': return <CheckCircle className="h-4 w-4" />;
      case 'non-compliant': return <AlertTriangle className="h-4 w-4" />;
      case 'partial': return <Info className="h-4 w-4" />;
      case 'not-assessed': return <Shield className="h-4 w-4" />;
      default: return <Shield className="h-4 w-4" />;
    }
  };

  const getRiskColor = (risk: string) => {
    switch (risk) {
      case 'critical': return 'bg-red-100 text-red-800';
      case 'high': return 'bg-orange-100 text-orange-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'low': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 90) return 'text-green-600';
    if (score >= 80) return 'text-blue-600';
    if (score >= 70) return 'text-yellow-600';
    return 'text-red-600';
  };

  return (
    <div className="space-y-6">
      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Overall Score</p>
                <p className={`text-2xl font-bold ${getScoreColor(report?.overallScore || 0)}`}>
                  {report?.overallScore || 0}%
                </p>
              </div>
              <ShieldCheck className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Compliant Standards</p>
                <p className="text-2xl font-bold text-green-600">
                  {standards.filter(s => s.status === 'compliant').length}
                </p>
              </div>
              <Award className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Active Policies</p>
                <p className="text-2xl font-bold text-purple-600">
                  {policies.filter(p => p.enabled).length}
                </p>
              </div>
              <Lock className="h-8 w-8 text-purple-500" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Next Assessment</p>
                <p className="text-sm font-medium">
                  {report?.nextAssessment.toLocaleDateString() || 'Not scheduled'}
                </p>
              </div>
              <Calendar className="h-8 w-8 text-orange-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Control Panel */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5" />
              Security & Compliance Center
            </CardTitle>
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-2">
                <label className="text-sm">Auto Scan</label>
                <Switch 
                  checked={autoScan}
                  onCheckedChange={setAutoScan}
                />
              </div>
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
                    <Zap className="h-4 w-4" />
                    Run Scan
                  </>
                )}
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {isScanning && (
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Scan Progress</span>
                <span className="text-sm">{scanProgress}%</span>
              </div>
              <Progress value={scanProgress} className="h-2" />
            </div>
          )}
        </CardContent>
      </Card>

      <Tabs defaultValue="standards" className="space-y-6">
        <TabsList>
          <TabsTrigger value="standards">Standards</TabsTrigger>
          <TabsTrigger value="policies">Policies</TabsTrigger>
          <TabsTrigger value="report">Report</TabsTrigger>
          <TabsTrigger value="recommendations">Recommendations</TabsTrigger>
        </TabsList>

        <TabsContent value="standards">
          <div className="grid gap-4">
            {standards.map((standard) => (
              <Card key={standard.id} className="hover:shadow-md transition-shadow">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="text-lg">{standard.name}</CardTitle>
                      <CardDescription>{standard.description}</CardDescription>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant={standard.category === 'security' ? 'default' : 'secondary'}>
                        {standard.category}
                      </Badge>
                      <div className={`flex items-center gap-1 ${getStatusColor(standard.status)}`}>
                        {getStatusIcon(standard.status)}
                        <span className="text-sm">{standard.status}</span>
                      </div>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">Compliance Score</span>
                      <span className={`text-lg font-bold ${getScoreColor(standard.score)}`}>
                        {standard.score}%
                      </span>
                    </div>
                    <Progress value={standard.score} className="h-2" />
                    
                    <div className="text-sm text-muted-foreground">
                      Last assessed: {standard.lastAssessed.toLocaleDateString()}
                    </div>
                    
                    <div className="space-y-2">
                      <h4 className="text-sm font-medium">Requirements</h4>
                      <div className="space-y-2">
                        {standard.requirements.map((req) => (
                          <div key={req.id} className="flex items-start gap-3 p-2 border rounded">
                            <div className={`mt-0.5 ${getStatusColor(req.status)}`}>
                              {getStatusIcon(req.status)}
                            </div>
                            <div className="flex-1">
                              <p className="text-sm font-medium">{req.title}</p>
                              <p className="text-xs text-muted-foreground">{req.description}</p>
                              <div className="flex items-center gap-2 mt-1">
                                <Badge className={getRiskColor(req.risk)}>
                                  {req.risk}
                                </Badge>
                                {req.evidence.length > 0 && (
                                  <span className="text-xs text-muted-foreground">
                                    {req.evidence.length} evidence items
                                  </span>
                                )}
                              </div>
                              {req.recommendations.length > 0 && (
                                <div className="mt-2">
                                  <p className="text-xs font-medium text-blue-600">Recommendations:</p>
                                  {req.recommendations.map((rec, i) => (
                                    <p key={i} className="text-xs text-blue-600">• {rec}</p>
                                  ))}
                                </div>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="policies">
          <div className="grid gap-4">
            {policies.map((policy) => (
              <Card key={policy.id}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="text-lg">{policy.name}</CardTitle>
                      <CardDescription>{policy.description}</CardDescription>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant="outline">{policy.type}</Badge>
                      <Switch 
                        checked={policy.enabled}
                        onCheckedChange={() => togglePolicy(policy.id)}
                      />
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {Object.entries(policy.settings).map(([key, value]) => (
                      <div key={key} className="flex items-center justify-between">
                        <span className="text-sm capitalize">{key.replace(/([A-Z])/g, ' $1').trim()}</span>
                        <Badge variant={value ? 'default' : 'secondary'}>
                          {value ? 'Enabled' : 'Disabled'}
                        </Badge>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="report">
          {report && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="h-5 w-5" />
                  Compliance Report
                </CardTitle>
                <CardDescription>
                  Generated on {report.generatedAt.toLocaleString()}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  <div className="text-center">
                    <h3 className="text-lg font-medium mb-2">Overall Compliance Score</h3>
                    <div className={`text-4xl font-bold ${getScoreColor(report.overallScore)}`}>
                      {report.overallScore}%
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <h4 className="font-medium mb-3">Standards Summary</h4>
                      <div className="space-y-2">
                        {report.standards.map((standard) => (
                          <div key={standard.id} className="flex items-center justify-between p-2 border rounded">
                            <span className="text-sm">{standard.name}</span>
                            <div className="flex items-center gap-2">
                              <span className={`text-sm font-medium ${getScoreColor(standard.score)}`}>
                                {standard.score}%
                              </span>
                              <div className={getStatusColor(standard.status)}>
                                {getStatusIcon(standard.status)}
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                    
                    <div>
                      <h4 className="font-medium mb-3">Policy Status</h4>
                      <div className="space-y-2">
                        {report.policies.map((policy) => (
                          <div key={policy.id} className="flex items-center justify-between p-2 border rounded">
                            <span className="text-sm">{policy.name}</span>
                            <Badge variant={policy.enabled ? 'default' : 'secondary'}>
                              {policy.enabled ? 'Active' : 'Inactive'}
                            </Badge>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                  
                  <div>
                    <h4 className="font-medium mb-3">Next Assessment</h4>
                    <p className="text-sm text-muted-foreground">
                      {report.nextAssessment.toLocaleDateString()}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="recommendations">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5" />
                Security Recommendations
              </CardTitle>
              <CardDescription>
                AI-powered recommendations to improve your security posture
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {report?.recommendations.map((rec, index) => (
                  <div key={index} className="flex items-start gap-3 p-3 border rounded">
                    <div className="mt-1">
                      <Info className="h-4 w-4 text-blue-500" />
                    </div>
                    <p className="text-sm">{rec}</p>
                  </div>
                ))}
                
                {(!report?.recommendations || report.recommendations.length === 0) && (
                  <div className="text-center py-8">
                    <ShieldCheck className="h-12 w-12 text-green-500 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold mb-2">All Good!</h3>
                    <p className="text-muted-foreground">
                      Your security posture is excellent. Keep up the good work!
                    </p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
