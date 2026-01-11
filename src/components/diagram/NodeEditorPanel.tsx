import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Code, Settings, Trash2, Save, Sync, Eye, EyeOff } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Textarea } from '@/components/ui/textarea';
import { useInfrastructure } from '@/contexts/InfrastructureContext';
import { useEnhancedInfrastructure } from '@/contexts/EnhancedInfrastructureContext';
import type { InfraNode, AWSResourceType } from '@/types/infrastructure';
import { toast } from 'sonner';

interface NodeEditorPanelProps {
  node: InfraNode | null;
  onClose: () => void;
}

const propertyFields: Record<AWSResourceType, { key: string; label: string; type: 'text' | 'boolean' | 'select'; options?: string[] }[]> = {
  vpc: [
    { key: 'cidr', label: 'CIDR Block', type: 'text' },
    { key: 'enableDnsHostnames', label: 'Enable DNS Hostnames', type: 'boolean' },
    { key: 'enableDnsSupport', label: 'Enable DNS Support', type: 'boolean' },
  ],
  subnet: [
    { key: 'cidr', label: 'CIDR Block', type: 'text' },
    { key: 'isPublic', label: 'Public Subnet', type: 'boolean' },
    { key: 'availabilityZone', label: 'Availability Zone', type: 'text' },
  ],
  ec2: [
    { key: 'instanceType', label: 'Instance Type', type: 'select', options: ['t3.micro', 't3.small', 't3.medium', 't3.large'] },
    { key: 'amiId', label: 'AMI ID', type: 'text' },
    { key: 'keyName', label: 'Key Pair Name', type: 'text' },
  ],
  rds: [
    { key: 'instanceType', label: 'Instance Type', type: 'select', options: ['db.t3.micro', 'db.t3.small', 'db.t3.medium'] },
    { key: 'engine', label: 'Engine', type: 'select', options: ['postgres', 'mysql', 'mariadb'] },
    { key: 'encrypted', label: 'Encryption at Rest', type: 'boolean' },
    { key: 'multiAz', label: 'Multi-AZ', type: 'boolean' },
  ],
  s3: [
    { key: 'versioning', label: 'Versioning', type: 'boolean' },
    { key: 'encrypted', label: 'Server-Side Encryption', type: 'boolean' },
    { key: 'publicAccess', label: 'Block Public Access', type: 'boolean' },
  ],
  lambda: [
    { key: 'runtime', label: 'Runtime', type: 'select', options: ['nodejs18.x', 'python3.11', 'go1.x'] },
    { key: 'memory', label: 'Memory (MB)', type: 'text' },
    { key: 'timeout', label: 'Timeout (s)', type: 'text' },
  ],
  'security-group': [
    { key: 'description', label: 'Description', type: 'text' },
  ],
  'iam-role': [
    { key: 'description', label: 'Description', type: 'text' },
  ],
  alb: [
    { key: 'internal', label: 'Internal', type: 'boolean' },
    { key: 'idleTimeout', label: 'Idle Timeout (s)', type: 'text' },
  ],
  'nat-gateway': [],
  'internet-gateway': [],
  'route-table': [],
  cloudfront: [
    { key: 'priceClass', label: 'Price Class', type: 'select', options: ['PriceClass_All', 'PriceClass_100', 'PriceClass_200'] },
  ],
  'api-gateway': [
    { key: 'apiType', label: 'API Type', type: 'select', options: ['REST', 'HTTP', 'WebSocket'] },
  ],
  dynamodb: [
    { key: 'billingMode', label: 'Billing Mode', type: 'select', options: ['PAY_PER_REQUEST', 'PROVISIONED'] },
    { key: 'encrypted', label: 'Encryption at Rest', type: 'boolean' },
  ],
  sqs: [
    { key: 'fifoQueue', label: 'FIFO Queue', type: 'boolean' },
    { key: 'messageRetentionSeconds', label: 'Message Retention (s)', type: 'text' },
  ],
  sns: [
    { key: 'fifoTopic', label: 'FIFO Topic', type: 'boolean' },
  ],
  elasticache: [
    { key: 'engine', label: 'Engine', type: 'select', options: ['redis', 'memcached'] },
    { key: 'nodeType', label: 'Node Type', type: 'text' },
  ],
};

function generateNodeCode(node: InfraNode, framework: string): string {
  const { type, label, properties } = node;
  const resourceName = label.toLowerCase().replace(/[^a-z0-9]/g, '_');
  
  if (framework === 'terraform') {
    return `resource "aws_${type.replace('-', '_')}" "${resourceName}" {
  ${Object.entries(properties)
    .map(([key, value]) => {
      if (typeof value === 'boolean') {
        return `${key} = ${value}`;
      } else if (typeof value === 'number') {
        return `${key} = ${value}`;
      } else if (Array.isArray(value)) {
        return `${key} = ${JSON.stringify(value)}`;
      } else {
        return `${key} = "${value}"`;
      }
    })
    .join('\n  ')}

  tags = {
    Name = "${label}"
    Environment = "production"
    ManagedBy = "infra-viz-ai"
  }
}`;
  }
  
  if (framework === 'cloudformation') {
    return `${resourceName}:
  Type: AWS::${type.toUpperCase().replace('-', '::')}
  Properties:
    ${Object.entries(properties)
      .map(([key, value]) => {
        if (typeof value === 'boolean') {
          return `${key}: ${value}`;
        } else if (typeof value === 'number') {
          return `${key}: ${value}`;
        } else if (Array.isArray(value)) {
          return `${key}: ${JSON.stringify(value)}`;
        } else {
          return `${key}: "${value}"`;
        }
      })
      .join('\n    ')}
    Tags:
      - Key: Name
        Value: "${label}"
      - Key: Environment
        Value: "production"
      - Key: ManagedBy
        Value: "infra-viz-ai"`;
  }
  
  return `// Pulumi code for ${label}
const ${resourceName} = new aws.${type.replace('-', '.')}("${resourceName}", {
  ${Object.entries(properties)
    .map(([key, value]) => {
      if (typeof value === 'boolean' || typeof value === 'number') {
        return `${key}: ${value}`;
      } else if (Array.isArray(value)) {
        return `${key}: ${JSON.stringify(value)}`;
      } else {
        return `${key}: "${value}"`;
      }
    })
    .join(',\n  ')},
  tags: {
    Name: "${label}",
    Environment: "production",
    ManagedBy: "infra-viz-ai"
  }
});`;
}

function parseNodeCode(code: string, framework: string, nodeType: AWSResourceType): Partial<InfraNode> {
  try {
    const properties: Record<string, any> = {};
    let label = '';

    if (framework === 'terraform') {
      // Extract resource name from Terraform code
      const resourceMatch = code.match(/resource\s+"aws_\w+"\s+"([^"]+)"/);
      if (resourceMatch) {
        label = resourceMatch[1].replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
      }

      // Extract properties
      const propertyMatches = code.match(/(\w+)\s*=\s*(.+?)(?=\n\s*\w+\s*=|\n\s*})/gs);
      if (propertyMatches) {
        propertyMatches.forEach(match => {
          const propMatch = match.match(/(\w+)\s*=\s*(.+)/);
          if (propMatch) {
            const [, key, value] = propMatch;
            const cleanValue = value.trim().replace(/,$/, '');
            
            if (cleanValue === 'true') {
              properties[key] = true;
            } else if (cleanValue === 'false') {
              properties[key] = false;
            } else if (/^\d+$/.test(cleanValue)) {
              properties[key] = parseInt(cleanValue);
            } else if (/^\d+\.\d+$/.test(cleanValue)) {
              properties[key] = parseFloat(cleanValue);
            } else if (cleanValue.startsWith('"') && cleanValue.endsWith('"')) {
              properties[key] = cleanValue.slice(1, -1);
            }
          }
        });
      }
    }

    return { label, properties };
  } catch (error) {
    console.error('Failed to parse code:', error);
    return {};
  }
}

export function NodeEditorPanel({ node, onClose }: NodeEditorPanelProps) {
  const { updateNode, removeNode, state } = useInfrastructure();
  const { sendCollaborationEvent } = useEnhancedInfrastructure();
  const [localNode, setLocalNode] = useState<InfraNode | null>(null);
  const [hasChanges, setHasChanges] = useState(false);
  const [nodeCode, setNodeCode] = useState('');
  const [isCodeEditable, setIsCodeEditable] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);

  useEffect(() => {
    setLocalNode(node);
    setHasChanges(false);
    if (node) {
      setNodeCode(generateNodeCode(node, state.iacFramework));
    }
  }, [node, state.iacFramework]);

  const syncCodeToNode = useCallback((code: string) => {
    if (!localNode) return;
    
    try {
      const parsed = parseNodeCode(code, state.iacFramework, localNode.type);
      const updatedNode = {
        ...localNode,
        label: parsed.label || localNode.label,
        properties: { ...localNode.properties, ...parsed.properties },
      };
      
      setLocalNode(updatedNode);
      setHasChanges(true);
      
      // Send collaboration event
      sendCollaborationEvent({
        type: 'node_update',
        diagram_id: '', // This would be filled from context
        data: { nodeId: localNode.id, updates: parsed },
      });
    } catch (error) {
      toast.error('Failed to parse code changes');
    }
  }, [localNode, state.iacFramework, sendCollaborationEvent]);

  const syncNodeToCode = useCallback(() => {
    if (!localNode) return;
    
    const code = generateNodeCode(localNode, state.iacFramework);
    setNodeCode(code);
  }, [localNode, state.iacFramework]);

  useEffect(() => {
    if (!isCodeEditable) {
      syncNodeToCode();
    }
  }, [localNode, isCodeEditable, syncNodeToCode]);

  if (!node || !localNode) return null;

  const fields = propertyFields[node.type] || [];

  const handlePropertyChange = (key: string, value: any) => {
    const updatedNode = {
      ...localNode,
      properties: { ...localNode.properties, [key]: value },
    };
    setLocalNode(updatedNode);
    setHasChanges(true);
    
    // Send collaboration event
    sendCollaborationEvent({
      type: 'node_update',
      diagram_id: '', // This would be filled from context
      data: { nodeId: localNode.id, updates: { [key]: value } },
    });
  };

  const handleLabelChange = (label: string) => {
    const updatedNode = { ...localNode, label };
    setLocalNode(updatedNode);
    setHasChanges(true);
    
    // Send collaboration event
    sendCollaborationEvent({
      type: 'node_update',
      diagram_id: '', // This would be filled from context
      data: { nodeId: localNode.id, updates: { label } },
    });
  };

  const handleCodeChange = (code: string) => {
    setNodeCode(code);
    if (isCodeEditable) {
      syncCodeToNode(code);
    }
  };

  const handleSave = async () => {
    setIsSyncing(true);
    try {
      await updateNode(localNode.id, {
        label: localNode.label,
        properties: localNode.properties,
      });
      setHasChanges(false);
      toast.success('Node updated and synced');
    } catch (error) {
      toast.error('Failed to update node');
    } finally {
      setIsSyncing(false);
    }
  };

  const handleDelete = () => {
    removeNode(node.id);
    toast.success('Node deleted');
    onClose();
  };

  const toggleCodeEditing = () => {
    if (isCodeEditable) {
      // Switch back to properties mode, sync code to node
      syncCodeToNode();
    }
    setIsCodeEditable(!isCodeEditable);
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ x: 320, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        exit={{ x: 320, opacity: 0 }}
        className="w-80 border-l bg-card flex flex-col h-full"
      >
        <div className="p-4 border-b flex items-center justify-between">
          <h3 className="font-semibold">Edit Node</h3>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </div>

        <Tabs defaultValue="properties" className="flex-1 flex flex-col">
          <TabsList className="mx-4 mt-2">
            <TabsTrigger value="properties" className="gap-2">
              <Settings className="h-4 w-4" />
              Properties
            </TabsTrigger>
            <TabsTrigger value="code" className="gap-2">
              <Code className="h-4 w-4" />
              Code
            </TabsTrigger>
          </TabsList>

          <ScrollArea className="flex-1 p-4">
            <TabsContent value="properties" className="space-y-4 mt-0">
              <div className="space-y-2">
                <Label>Name</Label>
                <Input
                  value={localNode.label}
                  onChange={(e) => handleLabelChange(e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label className="text-muted-foreground text-xs">Type: {node.type}</Label>
              </div>

              {fields.map((field) => (
                <div key={field.key} className="space-y-2">
                  <Label>{field.label}</Label>
                  {field.type === 'text' && (
                    <Input
                      value={localNode.properties[field.key] || ''}
                      onChange={(e) => handlePropertyChange(field.key, e.target.value)}
                    />
                  )}
                  {field.type === 'boolean' && (
                    <Switch
                      checked={localNode.properties[field.key] || false}
                      onCheckedChange={(checked) => handlePropertyChange(field.key, checked)}
                    />
                  )}
                  {field.type === 'select' && (
                    <select
                      className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                      value={localNode.properties[field.key] || ''}
                      onChange={(e) => handlePropertyChange(field.key, e.target.value)}
                    >
                      {field.options?.map((opt) => (
                        <option key={opt} value={opt}>{opt}</option>
                      ))}
                    </select>
                  )}
                </div>
              ))}
            </TabsContent>

            <TabsContent value="code" className="mt-0">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={toggleCodeEditing}
                      className="gap-2"
                    >
                      {isCodeEditable ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
                      {isCodeEditable ? 'View Mode' : 'Edit Mode'}
                    </Button>
                    {isCodeEditable && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => syncNodeToCode()}
                        className="gap-2"
                      >
                        <Sync className="h-4 w-4" />
                        Sync
                      </Button>
                    )}
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {state.iacFramework}
                  </div>
                </div>
                
                {isCodeEditable ? (
                  <Textarea
                    value={nodeCode}
                    onChange={(e) => handleCodeChange(e.target.value)}
                    className="font-mono text-xs min-h-[300px]"
                    placeholder="Edit your IaC code here..."
                  />
                ) : (
                  <div className="bg-muted p-3 rounded-lg">
                    <pre className="text-xs overflow-x-auto whitespace-pre-wrap">
                      <code>{nodeCode}</code>
                    </pre>
                  </div>
                )}
                
                {isCodeEditable && (
                  <div className="text-xs text-muted-foreground">
                    💡 Edit the code directly. Changes will be automatically parsed and reflected in the properties.
                  </div>
                )}
              </div>
            </TabsContent>
          </ScrollArea>
        </Tabs>

        <div className="p-4 border-t space-y-2">
          <Button
            onClick={handleSave}
            className="w-full gap-2"
            disabled={!hasChanges || isSyncing}
          >
            {isSyncing ? (
              <>
                <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                Syncing...
              </>
            ) : (
              <>
                <Save className="h-4 w-4" />
                Save Changes
              </>
            )}
          </Button>
          <Button
            variant="destructive"
            onClick={handleDelete}
            className="w-full gap-2"
          >
            <Trash2 className="h-4 w-4" />
            Delete Node
          </Button>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
