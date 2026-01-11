import type { InfraGraph, InfraNode, SecurityFinding, SecurityReport, SecuritySeverity } from '@/types/infrastructure';

interface SecurityRule {
  id: string;
  name: string;
  description: string;
  severity: SecuritySeverity;
  check: (node: InfraNode, allNodes: InfraNode[]) => boolean;
  recommendation: string;
  compliance: string[];
  autoFix?: (node: InfraNode) => Partial<InfraNode>;
}

const securityRules: SecurityRule[] = [
  {
    id: 'rds-encryption',
    name: 'RDS Encryption at Rest',
    description: 'RDS instance does not have encryption enabled',
    severity: 'high',
    check: (node) => node.type === 'rds' && node.properties.encrypted !== true,
    recommendation: 'Enable storage encryption for the RDS instance to protect data at rest.',
    compliance: ['HIPAA', 'PCI-DSS', 'SOC2'],
    autoFix: (node) => ({ properties: { ...node.properties, encrypted: true } }),
  },
  {
    id: 's3-encryption',
    name: 'S3 Bucket Encryption',
    description: 'S3 bucket does not have encryption enabled',
    severity: 'high',
    check: (node) => node.type === 's3' && node.properties.encrypted !== true,
    recommendation: 'Enable server-side encryption (SSE-S3 or SSE-KMS) for the S3 bucket.',
    compliance: ['HIPAA', 'GDPR', 'SOC2'],
    autoFix: (node) => ({ properties: { ...node.properties, encrypted: true } }),
  },
  {
    id: 'public-ec2-no-sg',
    name: 'Public EC2 Without Security Group',
    description: 'EC2 instance in public subnet without associated security group',
    severity: 'critical',
    check: (node, allNodes) => {
      if (node.type !== 'ec2') return false;
      const hasSG = allNodes.some(n => n.type === 'security-group');
      return !hasSG;
    },
    recommendation: 'Add a security group to restrict inbound and outbound traffic.',
    compliance: ['CIS', 'NIST'],
  },
  {
    id: 'wide-open-sg',
    name: 'Overly Permissive Security Group',
    description: 'Security group allows traffic from 0.0.0.0/0 on all ports',
    severity: 'critical',
    check: (node) => {
      if (node.type !== 'security-group') return false;
      const rules = node.properties.ingressRules || [];
      return rules.some((r: any) => r.cidr === '0.0.0.0/0' && (r.port === 0 || r.port === -1));
    },
    recommendation: 'Restrict security group rules to specific ports and IP ranges.',
    compliance: ['CIS', 'SOC2', 'PCI-DSS'],
  },
  {
    id: 'no-vpc-flow-logs',
    name: 'VPC Flow Logs Not Enabled',
    description: 'VPC does not have flow logs enabled for traffic monitoring',
    severity: 'medium',
    check: (node) => node.type === 'vpc' && node.properties.flowLogsEnabled !== true,
    recommendation: 'Enable VPC Flow Logs for network traffic analysis and security monitoring.',
    compliance: ['CIS', 'NIST', 'SOC2'],
    autoFix: (node) => ({ properties: { ...node.properties, flowLogsEnabled: true } }),
  },
  {
    id: 'public-rds',
    name: 'Publicly Accessible RDS',
    description: 'RDS instance is publicly accessible',
    severity: 'critical',
    check: (node) => node.type === 'rds' && node.properties.publiclyAccessible === true,
    recommendation: 'Place RDS instance in a private subnet and disable public accessibility.',
    compliance: ['CIS', 'HIPAA', 'PCI-DSS'],
    autoFix: (node) => ({ properties: { ...node.properties, publiclyAccessible: false } }),
  },
  {
    id: 'no-iam-role',
    name: 'Lambda Without IAM Role',
    description: 'Lambda function does not have an IAM role for least privilege access',
    severity: 'medium',
    check: (node, allNodes) => {
      if (node.type !== 'lambda') return false;
      const hasIamRole = allNodes.some(n => n.type === 'iam-role');
      return !hasIamRole;
    },
    recommendation: 'Create an IAM role with minimal required permissions for the Lambda function.',
    compliance: ['CIS', 'SOC2'],
  },
  {
    id: 's3-public-access',
    name: 'S3 Public Access Enabled',
    description: 'S3 bucket allows public access',
    severity: 'high',
    check: (node) => node.type === 's3' && node.properties.publicAccess === true,
    recommendation: 'Block public access to the S3 bucket unless explicitly required.',
    compliance: ['CIS', 'GDPR', 'SOC2'],
    autoFix: (node) => ({ properties: { ...node.properties, publicAccess: false } }),
  },
  {
    id: 'no-nat-gateway',
    name: 'Private Subnet Without NAT Gateway',
    description: 'Private subnet cannot access internet for updates',
    severity: 'low',
    check: (node, allNodes) => {
      if (node.type !== 'subnet' || node.properties.isPublic !== false) return false;
      const hasNat = allNodes.some(n => n.type === 'nat-gateway');
      return !hasNat;
    },
    recommendation: 'Add a NAT Gateway to allow private subnet resources to access the internet.',
    compliance: [],
  },
  {
    id: 'rds-no-multi-az',
    name: 'RDS Single AZ Deployment',
    description: 'RDS instance is not configured for Multi-AZ deployment',
    severity: 'medium',
    check: (node) => node.type === 'rds' && node.properties.multiAz !== true,
    recommendation: 'Enable Multi-AZ deployment for high availability.',
    compliance: ['SOC2'],
    autoFix: (node) => ({ properties: { ...node.properties, multiAz: true } }),
  },
  {
    id: 'ec2-no-ebs-encryption',
    name: 'EC2 EBS Volume Not Encrypted',
    description: 'EC2 instance EBS volumes are not encrypted',
    severity: 'medium',
    check: (node) => node.type === 'ec2' && node.properties.ebsEncrypted !== true,
    recommendation: 'Enable EBS encryption for EC2 instance volumes.',
    compliance: ['HIPAA', 'PCI-DSS'],
    autoFix: (node) => ({ properties: { ...node.properties, ebsEncrypted: true } }),
  },
];

function calculateComplianceScores(findings: SecurityFinding[]): { iso27001: number; gdpr: number; hipaa: number } {
  const complianceIssues = {
    iso27001: 0,
    gdpr: 0,
    hipaa: 0,
  };

  findings.forEach(finding => {
    if (finding.compliance.includes('ISO27001') || finding.compliance.includes('CIS') || finding.compliance.includes('SOC2')) {
      complianceIssues.iso27001++;
    }
    if (finding.compliance.includes('GDPR')) {
      complianceIssues.gdpr++;
    }
    if (finding.compliance.includes('HIPAA')) {
      complianceIssues.hipaa++;
    }
  });

  // Calculate score as percentage (100 - deductions)
  const maxDeduction = 20; // Max deduction per issue
  return {
    iso27001: Math.max(0, 100 - complianceIssues.iso27001 * maxDeduction),
    gdpr: Math.max(0, 100 - complianceIssues.gdpr * maxDeduction),
    hipaa: Math.max(0, 100 - complianceIssues.hipaa * maxDeduction),
  };
}

function calculateSecurityScore(findings: SecurityFinding[]): number {
  if (findings.length === 0) return 100;

  const severityWeights: Record<SecuritySeverity, number> = {
    critical: 25,
    high: 15,
    medium: 8,
    low: 3,
    info: 1,
  };

  const totalDeduction = findings.reduce((sum, finding) => {
    return sum + severityWeights[finding.severity];
  }, 0);

  return Math.max(0, 100 - totalDeduction);
}

export function scanInfrastructure(graph: InfraGraph): SecurityReport {
  const findings: SecurityFinding[] = [];

  graph.nodes.forEach(node => {
    securityRules.forEach(rule => {
      if (rule.check(node, graph.nodes)) {
        findings.push({
          id: `${rule.id}-${node.id}`,
          nodeId: node.id,
          severity: rule.severity,
          title: rule.name,
          description: `${rule.description} (${node.label})`,
          recommendation: rule.recommendation,
          compliance: rule.compliance,
          autoFixAvailable: !!rule.autoFix,
        });
      }
    });
  });

  // Sort by severity
  const severityOrder: SecuritySeverity[] = ['critical', 'high', 'medium', 'low', 'info'];
  findings.sort((a, b) => severityOrder.indexOf(a.severity) - severityOrder.indexOf(b.severity));

  return {
    findings,
    score: calculateSecurityScore(findings),
    scannedAt: new Date().toISOString(),
    compliance: calculateComplianceScores(findings),
  };
}

export function autoFixFinding(node: InfraNode, findingId: string): Partial<InfraNode> | null {
  const ruleId = findingId.split('-').slice(0, -1).join('-');
  const rule = securityRules.find(r => r.id === ruleId);
  
  if (rule?.autoFix) {
    return rule.autoFix(node);
  }
  
  return null;
}

export function getSecurityRules() {
  return securityRules.map(rule => ({
    id: rule.id,
    name: rule.name,
    description: rule.description,
    severity: rule.severity,
    compliance: rule.compliance,
  }));
}
