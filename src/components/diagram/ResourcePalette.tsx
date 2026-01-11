import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Network,
  Server,
  Database,
  HardDrive,
  Shield,
  Waypoints,
  ChevronDown,
  ChevronRight,
  Plus,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { useInfrastructure } from '@/contexts/InfrastructureContext';
import type { AWSResourceType } from '@/types/infrastructure';
import { toast } from 'sonner';

interface ResourceCategory {
  name: string;
  icon: any;
  resources: { type: AWSResourceType; label: string; description: string }[];
}

const categories: ResourceCategory[] = [
  {
    name: 'Networking',
    icon: Network,
    resources: [
      { type: 'vpc', label: 'VPC', description: 'Virtual Private Cloud' },
      { type: 'subnet', label: 'Subnet', description: 'Network segment' },
      { type: 'internet-gateway', label: 'Internet Gateway', description: 'Internet access' },
      { type: 'nat-gateway', label: 'NAT Gateway', description: 'Private subnet internet' },
      { type: 'alb', label: 'Load Balancer', description: 'Application Load Balancer' },
      { type: 'route-table', label: 'Route Table', description: 'Routing rules' },
    ],
  },
  {
    name: 'Compute',
    icon: Server,
    resources: [
      { type: 'ec2', label: 'EC2 Instance', description: 'Virtual server' },
      { type: 'lambda', label: 'Lambda', description: 'Serverless function' },
      { type: 'api-gateway', label: 'API Gateway', description: 'Managed API service' },
    ],
  },
  {
    name: 'Database',
    icon: Database,
    resources: [
      { type: 'rds', label: 'RDS', description: 'Relational Database' },
      { type: 'dynamodb', label: 'DynamoDB', description: 'NoSQL Database' },
      { type: 'elasticache', label: 'ElastiCache', description: 'In-memory cache' },
    ],
  },
  {
    name: 'Storage',
    icon: HardDrive,
    resources: [
      { type: 's3', label: 'S3 Bucket', description: 'Object storage' },
      { type: 'cloudfront', label: 'CloudFront', description: 'CDN distribution' },
    ],
  },
  {
    name: 'Security',
    icon: Shield,
    resources: [
      { type: 'security-group', label: 'Security Group', description: 'Firewall rules' },
      { type: 'iam-role', label: 'IAM Role', description: 'Access permissions' },
    ],
  },
  {
    name: 'Integration',
    icon: Waypoints,
    resources: [
      { type: 'sqs', label: 'SQS', description: 'Message queue' },
      { type: 'sns', label: 'SNS', description: 'Notification service' },
    ],
  },
];

export function ResourcePalette() {
  const [expandedCategories, setExpandedCategories] = useState<string[]>(['Networking', 'Compute']);
  const { addNode, state } = useInfrastructure();

  const toggleCategory = (name: string) => {
    setExpandedCategories(prev =>
      prev.includes(name) ? prev.filter(c => c !== name) : [...prev, name]
    );
  };

  const handleAddResource = (type: AWSResourceType, label: string) => {
    const id = `${type}-${Math.random().toString(36).substring(2, 8)}`;
    
    // Calculate position based on existing nodes
    const existingNodes = state.graph?.nodes || [];
    const maxY = existingNodes.reduce((max, n) => Math.max(max, n.position.y), 0);
    
    addNode({
      id,
      type,
      label,
      properties: getDefaultProperties(type),
      position: { x: 300, y: maxY + 150 },
    });
    
    toast.success(`${label} added to diagram`);
  };

  return (
    <div className="w-64 border-r border-border bg-card flex flex-col">
      <div className="p-4 border-b border-border">
        <h3 className="font-semibold">Resources</h3>
        <p className="text-xs text-muted-foreground mt-1">Click to add to diagram</p>
      </div>
      
      <ScrollArea className="flex-1">
        <div className="p-2">
          {categories.map((category) => (
            <div key={category.name} className="mb-2">
              <button
                onClick={() => toggleCategory(category.name)}
                className="w-full flex items-center gap-2 p-2 rounded-lg hover:bg-muted transition-colors"
              >
                <category.icon className="w-4 h-4 text-muted-foreground" />
                <span className="text-sm font-medium flex-1 text-left">{category.name}</span>
                {expandedCategories.includes(category.name) ? (
                  <ChevronDown className="w-4 h-4 text-muted-foreground" />
                ) : (
                  <ChevronRight className="w-4 h-4 text-muted-foreground" />
                )}
              </button>
              
              <AnimatePresence>
                {expandedCategories.includes(category.name) && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.2 }}
                    className="overflow-hidden"
                  >
                    <div className="pl-4 space-y-1 py-1">
                      {category.resources.map((resource) => (
                        <Tooltip key={resource.type}>
                          <TooltipTrigger asChild>
                            <button
                              onClick={() => handleAddResource(resource.type, resource.label)}
                              className="w-full flex items-center gap-2 p-2 rounded-lg hover:bg-muted text-left group transition-colors"
                            >
                              <span className="text-sm">{resource.label}</span>
                              <Plus className="w-3 h-3 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity ml-auto" />
                            </button>
                          </TooltipTrigger>
                          <TooltipContent side="right">
                            {resource.description}
                          </TooltipContent>
                        </Tooltip>
                      ))}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          ))}
        </div>
      </ScrollArea>
    </div>
  );
}

function getDefaultProperties(type: AWSResourceType): Record<string, any> {
  switch (type) {
    case 'vpc':
      return { cidr: '10.0.0.0/16' };
    case 'subnet':
      return { cidr: '10.0.1.0/24', isPublic: true };
    case 'ec2':
      return { instanceType: 't3.micro' };
    case 'rds':
      return { instanceType: 'db.t3.micro', encrypted: true };
    case 's3':
      return { encrypted: true };
    case 'security-group':
      return { ingressRules: [], egressRules: [] };
    default:
      return {};
  }
}
