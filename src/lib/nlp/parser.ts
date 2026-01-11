import nlp from 'compromise';
import type { InfraGraph, InfraNode, InfraEdge, AWSResourceType } from '@/types/infrastructure';

// Resource patterns for NLP matching
const resourcePatterns: Record<string, AWSResourceType> = {
  vpc: 'vpc',
  'virtual private cloud': 'vpc',
  subnet: 'subnet',
  'public subnet': 'subnet',
  'private subnet': 'subnet',
  ec2: 'ec2',
  instance: 'ec2',
  server: 'ec2',
  rds: 'rds',
  database: 'rds',
  postgres: 'rds',
  mysql: 'rds',
  alb: 'alb',
  'load balancer': 'alb',
  'application load balancer': 'alb',
  elb: 'alb',
  s3: 's3',
  bucket: 's3',
  storage: 's3',
  lambda: 'lambda',
  function: 'lambda',
  serverless: 'lambda',
  'security group': 'security-group',
  firewall: 'security-group',
  'iam role': 'iam-role',
  iam: 'iam-role',
  role: 'iam-role',
  'nat gateway': 'nat-gateway',
  nat: 'nat-gateway',
  'internet gateway': 'internet-gateway',
  igw: 'internet-gateway',
  cloudfront: 'cloudfront',
  cdn: 'cloudfront',
  'api gateway': 'api-gateway',
  api: 'api-gateway',
  dynamodb: 'dynamodb',
  dynamo: 'dynamodb',
  nosql: 'dynamodb',
  sqs: 'sqs',
  queue: 'sqs',
  sns: 'sns',
  notification: 'sns',
  elasticache: 'elasticache',
  cache: 'elasticache',
  redis: 'elasticache',
};

// Properties patterns
const propertyPatterns = {
  cidr: /(\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}\/\d{1,2})/g,
  instanceType: /(t[23]\.(micro|small|medium|large)|m[45]\.(large|xlarge))/gi,
  region: /(us-east-1|us-west-2|eu-west-1|ap-southeast-1)/gi,
  encrypted: /(encrypted|encryption)/gi,
  public: /(public)/gi,
  private: /(private)/gi,
};

function generateId(): string {
  return Math.random().toString(36).substring(2, 10);
}

function extractResources(text: string): { type: AWSResourceType; label: string; properties: Record<string, any> }[] {
  const resources: { type: AWSResourceType; label: string; properties: Record<string, any> }[] = [];
  const lowerText = text.toLowerCase();
  const doc = nlp(text);

  // Extract numbers for quantities
  const numbers = doc.numbers().json();
  
  // Check for each resource pattern
  for (const [pattern, resourceType] of Object.entries(resourcePatterns)) {
    if (lowerText.includes(pattern)) {
      // Check for quantity
      let count = 1;
      const quantityMatch = lowerText.match(new RegExp(`(\\d+)\\s*${pattern}`, 'i'));
      if (quantityMatch) {
        count = parseInt(quantityMatch[1], 10);
      }

      // Extract properties
      const properties: Record<string, any> = {};
      
      // Check for encryption
      if (propertyPatterns.encrypted.test(lowerText)) {
        properties.encrypted = true;
      }
      
      // Check for public/private
      if (resourceType === 'subnet') {
        if (lowerText.includes('public') && lowerText.includes('private')) {
          // Add both types
          resources.push({
            type: 'subnet',
            label: 'Public Subnet',
            properties: { isPublic: true, cidr: '10.0.1.0/24' },
          });
          resources.push({
            type: 'subnet',
            label: 'Private Subnet',
            properties: { isPublic: false, cidr: '10.0.2.0/24' },
          });
          continue;
        } else if (lowerText.includes('public')) {
          properties.isPublic = true;
        } else if (lowerText.includes('private')) {
          properties.isPublic = false;
        }
      }

      // Extract instance type for EC2
      if (resourceType === 'ec2') {
        const instanceTypeMatch = text.match(propertyPatterns.instanceType);
        properties.instanceType = instanceTypeMatch ? instanceTypeMatch[0] : 't3.micro';
      }

      // Add resources based on count
      for (let i = 0; i < count; i++) {
        resources.push({
          type: resourceType,
          label: `${resourceType.toUpperCase()}${count > 1 ? ` ${i + 1}` : ''}`,
          properties,
        });
      }
    }
  }

  // Always add VPC if other networking resources exist
  const hasNetworking = resources.some(r => ['subnet', 'alb', 'nat-gateway', 'internet-gateway'].includes(r.type));
  if (hasNetworking && !resources.some(r => r.type === 'vpc')) {
    resources.unshift({
      type: 'vpc',
      label: 'VPC',
      properties: { cidr: '10.0.0.0/16' },
    });
  }

  // Add security group if EC2 or RDS exists
  const needsSecurityGroup = resources.some(r => ['ec2', 'rds', 'lambda'].includes(r.type));
  if (needsSecurityGroup && !resources.some(r => r.type === 'security-group')) {
    resources.push({
      type: 'security-group',
      label: 'Security Group',
      properties: { ingressRules: [], egressRules: [] },
    });
  }

  return resources;
}

function createEdges(nodes: InfraNode[]): InfraEdge[] {
  const edges: InfraEdge[] = [];
  const vpc = nodes.find(n => n.type === 'vpc');
  const subnets = nodes.filter(n => n.type === 'subnet');
  const ec2s = nodes.filter(n => n.type === 'ec2');
  const rds = nodes.find(n => n.type === 'rds');
  const alb = nodes.find(n => n.type === 'alb');
  const securityGroup = nodes.find(n => n.type === 'security-group');
  const igw = nodes.find(n => n.type === 'internet-gateway');
  const nat = nodes.find(n => n.type === 'nat-gateway');

  // VPC contains subnets
  if (vpc) {
    subnets.forEach(subnet => {
      edges.push({ id: generateId(), source: vpc.id, target: subnet.id, type: 'contains' });
    });
    if (igw) {
      edges.push({ id: generateId(), source: vpc.id, target: igw.id, type: 'contains' });
    }
  }

  // ALB connects to EC2
  if (alb && ec2s.length > 0) {
    ec2s.forEach(ec2 => {
      edges.push({ id: generateId(), source: alb.id, target: ec2.id, type: 'connects', label: 'routes to' });
    });
  }

  // EC2 connects to RDS
  if (rds && ec2s.length > 0) {
    ec2s.forEach(ec2 => {
      edges.push({ id: generateId(), source: ec2.id, target: rds.id, type: 'connects', label: 'queries' });
    });
  }

  // Security group protects resources
  if (securityGroup) {
    [...ec2s, rds].filter(Boolean).forEach(resource => {
      if (resource) {
        edges.push({ id: generateId(), source: securityGroup.id, target: resource.id, type: 'connects', label: 'protects' });
      }
    });
  }

  return edges;
}

function autoLayout(nodes: InfraNode[]): InfraNode[] {
  const layerMap: Record<AWSResourceType, number> = {
    'internet-gateway': 0,
    cloudfront: 0,
    alb: 1,
    'api-gateway': 1,
    vpc: 0,
    subnet: 2,
    'nat-gateway': 2,
    ec2: 3,
    lambda: 3,
    'security-group': 4,
    rds: 4,
    dynamodb: 4,
    elasticache: 4,
    s3: 5,
    sqs: 5,
    sns: 5,
    'iam-role': 6,
    'route-table': 2,
  };

  const layers: Record<number, InfraNode[]> = {};
  
  nodes.forEach(node => {
    const layer = layerMap[node.type] ?? 3;
    if (!layers[layer]) layers[layer] = [];
    layers[layer].push(node);
  });

  const layoutNodes: InfraNode[] = [];
  const startX = 100;
  const startY = 100;
  const xGap = 200;
  const yGap = 150;

  Object.keys(layers).sort((a, b) => Number(a) - Number(b)).forEach((layerKey, layerIndex) => {
    const layerNodes = layers[Number(layerKey)];
    const layerWidth = layerNodes.length * xGap;
    const offsetX = startX - (layerWidth / 2) + (xGap / 2);

    layerNodes.forEach((node, nodeIndex) => {
      layoutNodes.push({
        ...node,
        position: {
          x: offsetX + (nodeIndex * xGap) + 300,
          y: startY + (layerIndex * yGap),
        },
      });
    });
  });

  return layoutNodes;
}

export function parseInfrastructureText(text: string): InfraGraph {
  const extractedResources = extractResources(text);
  
  // Create nodes
  const nodes: InfraNode[] = extractedResources.map(resource => ({
    id: generateId(),
    type: resource.type,
    label: resource.label,
    properties: resource.properties,
    position: { x: 0, y: 0 },
  }));

  // Auto-layout nodes
  const layoutNodes = autoLayout(nodes);

  // Create edges based on relationships
  const edges = createEdges(layoutNodes);

  return {
    nodes: layoutNodes,
    edges,
    metadata: {
      name: 'Generated Infrastructure',
      region: 'us-east-1',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
  };
}
