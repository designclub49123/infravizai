import { memo } from 'react';
import { Handle, Position } from '@xyflow/react';
import { motion } from 'framer-motion';
import {
  Network,
  LayoutGrid,
  Server,
  Database,
  GitBranch,
  HardDrive,
  Zap,
  Shield,
  Key,
  ArrowLeftRight,
  Globe,
  Route,
  Cloud,
  Waypoints,
  Table,
  MessageSquare,
  Bell,
  Boxes,
} from 'lucide-react';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import type { AWSResourceType } from '@/types/infrastructure';

const iconMap: Record<string, any> = {
  Network, LayoutGrid, Server, Database, GitBranch, HardDrive, Zap, Shield,
  Key, ArrowLeftRight, Globe, Route, Cloud, Waypoints, Table, MessageSquare, Bell, Boxes,
};

const categoryColors: Record<string, { bg: string; border: string; icon: string }> = {
  networking: { bg: 'bg-purple-500/10', border: 'border-purple-500/50 hover:border-purple-500', icon: 'text-purple-500' },
  compute: { bg: 'bg-orange-500/10', border: 'border-orange-500/50 hover:border-orange-500', icon: 'text-orange-500' },
  database: { bg: 'bg-blue-500/10', border: 'border-blue-500/50 hover:border-blue-500', icon: 'text-blue-500' },
  storage: { bg: 'bg-green-500/10', border: 'border-green-500/50 hover:border-green-500', icon: 'text-green-500' },
  security: { bg: 'bg-red-500/10', border: 'border-red-500/50 hover:border-red-500', icon: 'text-red-500' },
  integration: { bg: 'bg-pink-500/10', border: 'border-pink-500/50 hover:border-pink-500', icon: 'text-pink-500' },
};

const resourceConfig: Record<string, { icon: string; category: string; label: string }> = {
  vpc: { icon: 'Network', category: 'networking', label: 'VPC' },
  subnet: { icon: 'LayoutGrid', category: 'networking', label: 'Subnet' },
  ec2: { icon: 'Server', category: 'compute', label: 'EC2' },
  rds: { icon: 'Database', category: 'database', label: 'RDS' },
  alb: { icon: 'GitBranch', category: 'networking', label: 'ALB' },
  s3: { icon: 'HardDrive', category: 'storage', label: 'S3' },
  lambda: { icon: 'Zap', category: 'compute', label: 'Lambda' },
  'security-group': { icon: 'Shield', category: 'security', label: 'Security Group' },
  'iam-role': { icon: 'Key', category: 'security', label: 'IAM Role' },
  'nat-gateway': { icon: 'ArrowLeftRight', category: 'networking', label: 'NAT Gateway' },
  'internet-gateway': { icon: 'Globe', category: 'networking', label: 'Internet Gateway' },
  'route-table': { icon: 'Route', category: 'networking', label: 'Route Table' },
  cloudfront: { icon: 'Cloud', category: 'networking', label: 'CloudFront' },
  'api-gateway': { icon: 'Waypoints', category: 'integration', label: 'API Gateway' },
  dynamodb: { icon: 'Table', category: 'database', label: 'DynamoDB' },
  sqs: { icon: 'MessageSquare', category: 'integration', label: 'SQS' },
  sns: { icon: 'Bell', category: 'integration', label: 'SNS' },
  elasticache: { icon: 'Boxes', category: 'database', label: 'ElastiCache' },
};

interface ResourceNodeProps {
  data: {
    type: AWSResourceType;
    label: string;
    properties: Record<string, any>;
  };
  selected?: boolean;
}

export const ResourceNode = memo(({ data, selected }: ResourceNodeProps) => {
  const config = resourceConfig[data.type] || { icon: 'Server', category: 'compute', label: data.type };
  const colors = categoryColors[config.category];
  const IconComponent = iconMap[config.icon] || Server;

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          whileHover={{ scale: 1.02 }}
          className={`
            px-4 py-3 rounded-xl border-2 shadow-sm cursor-pointer transition-all duration-200 min-w-[160px]
            ${colors.bg} ${colors.border}
            ${selected ? 'ring-2 ring-primary ring-offset-2 ring-offset-background' : ''}
          `}
        >
          <Handle type="target" position={Position.Top} className="!bg-primary" />
          <div className="flex items-center gap-3">
            <div className={`p-2 rounded-lg bg-background/50 ${colors.icon}`}>
              <IconComponent className="w-5 h-5" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">{config.label}</p>
              <p className="text-sm font-semibold truncate">{data.label}</p>
            </div>
          </div>
          <Handle type="source" position={Position.Bottom} className="!bg-primary" />
        </motion.div>
      </TooltipTrigger>
      <TooltipContent side="right">
        <p className="font-semibold">{data.label}</p>
        <p className="text-xs text-muted-foreground">{config.label}</p>
      </TooltipContent>
    </Tooltip>
  );
});

ResourceNode.displayName = 'ResourceNode';
