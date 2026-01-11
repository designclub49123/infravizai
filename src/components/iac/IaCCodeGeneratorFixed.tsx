import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Code, 
  Download, 
  Copy, 
  CheckCircle, 
  AlertCircle, 
  Play, 
  Settings, 
  FileText,
  Terminal,
  GitBranch,
  Shield,
  Zap,
  RefreshCw,
  Eye,
  EyeOff
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Switch } from '@/components/ui/switch';
import { Input } from '@/components/ui/input';
import { useEnhancedInfrastructure } from '@/contexts/EnhancedInfrastructureContext';
import { toast } from 'sonner';
import type { InfraGraph, IaCOutput, IaCFramework } from '@/types/infrastructure';

interface IaCCodeGeneratorProps {
  diagram?: InfraGraph;
  onCodeGenerated?: (code: IaCOutput) => void;
}

interface CodeTemplate {
  id: string;
  name: string;
  description: string;
  framework: IaCFramework;
  template: string;
  variables: Record<string, any>;
}

interface SecurityCompliance {
  standard: string;
  status: 'compliant' | 'non-compliant' | 'warning';
  issues: string[];
  recommendations: string[];
}

const codeTemplates: CodeTemplate[] = [
  {
    id: 'aws-vpc-terraform',
    name: 'AWS VPC with Terraform',
    description: 'Complete VPC setup with public and private subnets',
    framework: 'terraform',
    template: `terraform {
  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.0"
    }
  }
}

provider "aws" {
  region = var.aws_region
}

# VPC Configuration
resource "aws_vpc" "main" {
  cidr_block           = var.vpc_cidr
  enable_dns_hostnames = true
  enable_dns_support   = true
  
  tags = {
    Name        = var.vpc_name
    Environment = var.environment
    ManagedBy   = "infra-viz-ai"
  }
}

# Public Subnets
resource "aws_subnet" "public" {
  count             = length(var.public_subnet_cidrs)
  vpc_id            = aws_vpc.main.id
  cidr_block        = var.public_subnet_cidrs[count.index]
  availability_zone = data.aws_availability_zones.available.names[count.index]
  
  map_public_ip_on_launch = true
  
  tags = {
    Name        = "\${var.vpc_name}-public-\${count.index + 1}"
    Environment = var.environment
    Type        = "Public"
  }
}

# EC2 Instances
resource "aws_instance" "web" {
  count                     = var.instance_count
  ami                       = data.aws_ami.amazon_linux_2.id
  instance_type             = var.instance_type
  subnet_id                 = aws_subnet.public[count.index % length(aws_subnet.public)].id
  vpc_security_group_ids    = [aws_security_group.web.id]
  associate_public_ip_address = true
  
  tags = {
    Name        = "\${var.vpc_name}-web-\${count.index + 1}"
    Environment = var.environment
  }
}`,
    variables: {
      aws_region: 'us-east-1',
      vpc_cidr: '10.0.0.0/16',
      public_subnet_cidrs: ['10.0.1.0/24', '10.0.2.0/24'],
      instance_count: 2,
      instance_type: 't3.micro',
      vpc_name: 'main',
      environment: 'production'
    }
  },
  {
    id: 'aws-serverless-cloudformation',
    name: 'Serverless with CloudFormation',
    description: 'API Gateway, Lambda, and DynamoDB setup',
    framework: 'cloudformation',
    template: `AWSTemplateFormatVersion: '2010-09-09'
Description: 'Serverless application with API Gateway, Lambda, and DynamoDB'

Parameters:
  FunctionName:
    Type: String
    Default: 'MyServerlessFunction'
    Description: 'Name for the Lambda function'
  
  TableName:
    Type: String
    Default: 'MyServerlessTable'
    Description: 'Name for the DynamoDB table'

Resources:
  # DynamoDB Table
  MyTable:
    Type: AWS::DynamoDB::Table
    Properties:
      TableName: !Ref TableName
      AttributeDefinitions:
        - AttributeName: id
          AttributeType: S
      KeySchema:
        - AttributeName: id
          KeyType: HASH
      BillingMode: PAY_PER_REQUEST
      SSESpecification:
        SSEEnabled: true

  # Lambda Function
  MyFunction:
    Type: AWS::Lambda::Function
    Properties:
      FunctionName: !Ref FunctionName
      Runtime: python3.9
      Handler: index.lambda_handler
      Role: !GetAtt LambdaExecutionRole.Arn
      Code:
        ZipFile: |
          import json
          def lambda_handler(event, context):
              return {
                  'statusCode': 200,
                  'body': json.dumps({'message': 'Hello from Lambda!'})
              }
      Timeout: 30
      MemorySize: 128

Outputs:
  FunctionArn:
    Description: 'Lambda Function ARN'
    Value: !GetAtt MyFunction.Arn
  TableName:
    Description: 'DynamoDB Table Name'
    Value: !Ref MyTable`,
    variables: {
      FunctionName: 'MyServerlessFunction',
      TableName: 'MyServerlessTable'
    }
  }
];

export function IaCCodeGeneratorFixed({ diagram, onCodeGenerated }: IaCCodeGeneratorProps) {
  const { state: { currentDiagram } } = useEnhancedInfrastructure();
  const [selectedFramework, setSelectedFramework] = useState<IaCFramework>('terraform');
  const [selectedTemplate, setSelectedTemplate] = useState<CodeTemplate | null>(null);
  const [generatedCode, setGeneratedCode] = useState<IaCOutput | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [showCode, setShowCode] = useState(true);
  const [enableSecurity, setEnableSecurity] = useState(true);
  const [optimizeCost, setOptimizeCost] = useState(true);
  const [complianceChecks, setComplianceChecks] = useState<SecurityCompliance[]>([]);
  const [codeVariables, setCodeVariables] = useState<Record<string, any>>({});

  useEffect(() => {
    if (selectedTemplate) {
      setCodeVariables(selectedTemplate.variables);
    }
  }, [selectedTemplate]);

  const generateCode = async () => {
    if (!selectedTemplate) {
      toast.error('Please select a template first');
      return;
    }

    setIsGenerating(true);
    
    try {
      // Simulate code generation
      await new Promise(resolve => setTimeout(resolve, 2000));

      const iacOutput: IaCOutput = {
        framework: selectedFramework,
        code: selectedTemplate.template,
        resources: extractResources(selectedTemplate.template),
        dependencies: [],
        metadata: {
          generatedAt: new Date(),
          version: '1.0.0',
          security: enableSecurity,
          optimized: optimizeCost
        }
      };

      setGeneratedCode(iacOutput);
      
      // Run compliance checks
      if (enableSecurity) {
        runComplianceChecks(iacOutput);
      }

      onCodeGenerated?.(iacOutput);
      toast.success('IaC code generated successfully!');
    } catch (error) {
      toast.error('Failed to generate IaC code');
    } finally {
      setIsGenerating(false);
    }
  };

  const extractResources = (code: string): string[] => {
    const resourcePattern = /resource\s+"(\w+)"/g;
    const resources = [];
    let match;
    while ((match = resourcePattern.exec(code)) !== null) {
      resources.push(match[1]);
    }
    return resources;
  };

  const runComplianceChecks = (iacOutput: IaCOutput) => {
    const checks: SecurityCompliance[] = [
      {
        standard: 'AWS Well-Architected',
        status: 'compliant',
        issues: [],
        recommendations: ['Consider implementing auto-scaling', 'Add monitoring and logging']
      },
      {
        standard: 'ISO 27001',
        status: 'warning',
        issues: ['Missing encryption configuration'],
        recommendations: ['Enable encryption at rest', 'Implement key rotation']
      },
      {
        standard: 'GDPR',
        status: 'compliant',
        issues: [],
        recommendations: ['Add data retention policies', 'Implement privacy controls']
      }
    ];
    setComplianceChecks(checks);
  };

  const copyCode = () => {
    if (generatedCode) {
      navigator.clipboard.writeText(generatedCode.code);
      toast.success('Code copied to clipboard!');
    }
  };

  const downloadCode = () => {
    if (!generatedCode) return;

    const extension = generatedCode.framework === 'terraform' ? 'tf' : 
                     generatedCode.framework === 'cloudformation' ? 'yaml' : 'ts';
    
    const blob = new Blob([generatedCode.code], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `infrastructure.${extension}`;
    a.click();
    URL.revokeObjectURL(url);
    
    toast.success('Code downloaded!');
  };

  const deployCode = () => {
    if (!generatedCode) return;
    
    toast.info('Deployment feature coming soon!');
  };

  return (
    <div className="space-y-6">
      {/* Framework Selection */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Code className="h-5 w-5" />
            IaC Code Generator
          </CardTitle>
          <CardDescription>
            Generate Infrastructure as Code from your diagrams
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">IaC Framework</label>
              <Select value={selectedFramework} onValueChange={(value: IaCFramework) => 
                setSelectedFramework(value)
              }>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="terraform">Terraform</SelectItem>
                  <SelectItem value="cloudformation">AWS CloudFormation</SelectItem>
                  <SelectItem value="pulumi">Pulumi</SelectItem>
                  <SelectItem value="arm">Azure ARM</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-medium">Template</label>
              <Select 
                value={selectedTemplate?.id || ''} 
                onValueChange={(value) => {
                  const template = codeTemplates.find(t => t.id === value);
                  setSelectedTemplate(template || null);
                }}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select template" />
                </SelectTrigger>
                <SelectContent>
                  {codeTemplates
                    .filter(t => t.framework === selectedFramework)
                    .map((template) => (
                      <SelectItem key={template.id} value={template.id}>
                        {template.name}
                      </SelectItem>
                    ))}
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-medium">Actions</label>
              <div className="flex gap-2">
                <Button 
                  onClick={generateCode}
                  disabled={isGenerating || !selectedTemplate}
                  className="gap-2"
                >
                  {isGenerating ? (
                    <>
                      <RefreshCw className="h-4 w-4 animate-spin" />
                      Generating...
                    </>
                  ) : (
                    <>
                      <Zap className="h-4 w-4" />
                      Generate Code
                    </>
                  )}
                </Button>
                <Button 
                  variant="outline" 
                  onClick={() => setShowCode(!showCode)}
                  className="gap-2"
                >
                  {showCode ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  {showCode ? 'Hide' : 'Show'} Code
                </Button>
              </div>
            </div>
          </div>
          
          {/* Options */}
          <div className="flex flex-wrap gap-4 mt-4">
            <div className="flex items-center gap-2">
              <Switch 
                checked={enableSecurity}
                onCheckedChange={setEnableSecurity}
              />
              <label className="text-sm">Enable Security</label>
            </div>
            <div className="flex items-center gap-2">
              <Switch 
                checked={optimizeCost}
                onCheckedChange={setOptimizeCost}
              />
              <label className="text-sm">Cost Optimization</label>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Template Details */}
      {selectedTemplate && (
        <Card>
          <CardHeader>
            <CardTitle>{selectedTemplate.name}</CardTitle>
            <CardDescription>{selectedTemplate.description}</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <Badge variant="outline">{selectedTemplate.framework}</Badge>
                <Badge variant="outline">
                  {Object.keys(selectedTemplate.variables).length} variables
                </Badge>
              </div>
              
              {/* Variables Configuration */}
              <div className="space-y-3">
                <h4 className="text-sm font-medium">Variables</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {Object.entries(codeVariables).map(([key, value]) => (
                    <div key={key} className="space-y-1">
                      <label className="text-xs font-medium">{key}</label>
                      <Input
                        value={value}
                        onChange={(e) => setCodeVariables(prev => ({
                          ...prev,
                          [key]: e.target.value
                        }))}
                        className="h-8"
                      />
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Generated Code */}
      <AnimatePresence>
        {generatedCode && showCode && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
          >
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2">
                    <FileText className="h-5 w-5" />
                    Generated Code
                  </CardTitle>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" onClick={copyCode}>
                      <Copy className="h-4 w-4" />
                    </Button>
                    <Button variant="outline" size="sm" onClick={downloadCode}>
                      <Download className="h-4 w-4" />
                    </Button>
                    <Button variant="outline" size="sm" onClick={deployCode}>
                      <Play className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-96">
                  <pre className="text-sm bg-muted p-4 rounded-lg overflow-x-auto">
                    <code>{generatedCode.code}</code>
                  </pre>
                </ScrollArea>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Compliance Checks */}
      {enableSecurity && complianceChecks.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5" />
              Security & Compliance
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {complianceChecks.map((check, index) => (
                <div key={index} className="border rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-medium">{check.standard}</h4>
                    <Badge variant={
                      check.status === 'compliant' ? 'default' :
                      check.status === 'warning' ? 'secondary' : 'destructive'
                    }>
                      {check.status}
                    </Badge>
                  </div>
                  
                  {check.issues.length > 0 && (
                    <div className="space-y-2">
                      <p className="text-sm font-medium text-red-600">Issues:</p>
                      <ul className="text-sm text-red-600 list-disc list-inside">
                        {check.issues.map((issue, i) => (
                          <li key={i}>{issue}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                  
                  {check.recommendations.length > 0 && (
                    <div className="space-y-2">
                      <p className="text-sm font-medium text-blue-600">Recommendations:</p>
                      <ul className="text-sm text-blue-600 list-disc list-inside">
                        {check.recommendations.map((rec, i) => (
                          <li key={i}>{rec}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
