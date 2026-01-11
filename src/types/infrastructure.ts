// AWS Resource Types
export type AWSResourceType =
  | 'vpc'
  | 'subnet'
  | 'ec2'
  | 'rds'
  | 'alb'
  | 's3'
  | 'lambda'
  | 'security-group'
  | 'iam-role'
  | 'nat-gateway'
  | 'internet-gateway'
  | 'route-table'
  | 'cloudfront'
  | 'api-gateway'
  | 'dynamodb'
  | 'sqs'
  | 'sns'
  | 'elasticache';

export interface AWSResourceMetadata {
  type: AWSResourceType;
  label: string;
  icon: string;
  category: 'compute' | 'storage' | 'networking' | 'security' | 'database' | 'integration';
  color: string;
  description: string;
}

export const AWS_RESOURCES: Record<AWSResourceType, AWSResourceMetadata> = {
  vpc: {
    type: 'vpc',
    label: 'VPC',
    icon: 'Network',
    category: 'networking',
    color: 'aws-networking',
    description: 'Virtual Private Cloud - Isolated network environment',
  },
  subnet: {
    type: 'subnet',
    label: 'Subnet',
    icon: 'LayoutGrid',
    category: 'networking',
    color: 'aws-networking',
    description: 'Subnet within a VPC',
  },
  ec2: {
    type: 'ec2',
    label: 'EC2',
    icon: 'Server',
    category: 'compute',
    color: 'aws-compute',
    description: 'Elastic Compute Cloud instance',
  },
  rds: {
    type: 'rds',
    label: 'RDS',
    icon: 'Database',
    category: 'database',
    color: 'aws-database',
    description: 'Relational Database Service',
  },
  alb: {
    type: 'alb',
    label: 'ALB',
    icon: 'GitBranch',
    category: 'networking',
    color: 'aws-networking',
    description: 'Application Load Balancer',
  },
  s3: {
    type: 's3',
    label: 'S3',
    icon: 'HardDrive',
    category: 'storage',
    color: 'aws-storage',
    description: 'Simple Storage Service bucket',
  },
  lambda: {
    type: 'lambda',
    label: 'Lambda',
    icon: 'Zap',
    category: 'compute',
    color: 'aws-compute',
    description: 'Serverless function',
  },
  'security-group': {
    type: 'security-group',
    label: 'Security Group',
    icon: 'Shield',
    category: 'security',
    color: 'aws-security',
    description: 'Virtual firewall for instances',
  },
  'iam-role': {
    type: 'iam-role',
    label: 'IAM Role',
    icon: 'Key',
    category: 'security',
    color: 'aws-security',
    description: 'Identity and Access Management role',
  },
  'nat-gateway': {
    type: 'nat-gateway',
    label: 'NAT Gateway',
    icon: 'ArrowLeftRight',
    category: 'networking',
    color: 'aws-networking',
    description: 'Network Address Translation gateway',
  },
  'internet-gateway': {
    type: 'internet-gateway',
    label: 'Internet Gateway',
    icon: 'Globe',
    category: 'networking',
    color: 'aws-networking',
    description: 'Gateway to the internet',
  },
  'route-table': {
    type: 'route-table',
    label: 'Route Table',
    icon: 'Route',
    category: 'networking',
    color: 'aws-networking',
    description: 'Routing rules for subnets',
  },
  cloudfront: {
    type: 'cloudfront',
    label: 'CloudFront',
    icon: 'Cloud',
    category: 'networking',
    color: 'aws-networking',
    description: 'Content Delivery Network',
  },
  'api-gateway': {
    type: 'api-gateway',
    label: 'API Gateway',
    icon: 'Waypoints',
    category: 'integration',
    color: 'aws-compute',
    description: 'Managed API service',
  },
  dynamodb: {
    type: 'dynamodb',
    label: 'DynamoDB',
    icon: 'Table',
    category: 'database',
    color: 'aws-database',
    description: 'NoSQL database service',
  },
  sqs: {
    type: 'sqs',
    label: 'SQS',
    icon: 'MessageSquare',
    category: 'integration',
    color: 'aws-compute',
    description: 'Simple Queue Service',
  },
  sns: {
    type: 'sns',
    label: 'SNS',
    icon: 'Bell',
    category: 'integration',
    color: 'aws-compute',
    description: 'Simple Notification Service',
  },
  elasticache: {
    type: 'elasticache',
    label: 'ElastiCache',
    icon: 'Boxes',
    category: 'database',
    color: 'aws-database',
    description: 'In-memory caching service',
  },
};

// Infrastructure Graph Types
export interface InfraNode {
  id: string;
  type: AWSResourceType;
  label: string;
  properties: Record<string, any>;
  position: { x: number; y: number };
}

export interface InfraEdge {
  id: string;
  source: string;
  target: string;
  label?: string;
  type?: 'contains' | 'connects' | 'depends';
}

export interface InfraGraph {
  nodes: InfraNode[];
  edges: InfraEdge[];
  metadata: {
    name: string;
    region: string;
    createdAt: string;
    updatedAt: string;
  };
}

// IaC Types
export type IaCFramework = 'terraform' | 'cloudformation' | 'pulumi';

export interface IaCOutput {
  framework: IaCFramework;
  code: string;
  files: { name: string; content: string }[];
}

// Security Types
export type SecuritySeverity = 'critical' | 'high' | 'medium' | 'low' | 'info';

export interface SecurityFinding {
  id: string;
  nodeId: string;
  severity: SecuritySeverity;
  title: string;
  description: string;
  recommendation: string;
  compliance: string[];
  autoFixAvailable: boolean;
}

export interface SecurityReport {
  findings: SecurityFinding[];
  score: number;
  scannedAt: string;
  compliance: {
    iso27001: number;
    gdpr: number;
    hipaa: number;
  };
}

// App State Types
export interface AppState {
  graph: InfraGraph | null;
  iacFramework: IaCFramework;
  iacCode: string;
  securityReport: SecurityReport | null;
  isGenerating: boolean;
  isSyncing: boolean;
  history: InfraGraph[];
  historyIndex: number;
}
