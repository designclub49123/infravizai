import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, Loader2, Wand2, AlertCircle, CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { useEnhancedInfrastructure } from '@/contexts/EnhancedInfrastructureContext';
import { toast } from 'sonner';
import type { TextToDiagramRequest, GeneratedDiagram } from '@/types/extended';

interface TextToDiagramGeneratorProps {
  onDiagramGenerated?: (diagram: GeneratedDiagram) => void;
}

const examplePrompts = [
  "Create a VPC with two public and two private subnets, an application load balancer, and two EC2 instances in the private subnets",
  "Set up a serverless architecture with API Gateway, Lambda functions, and DynamoDB",
  "Build a three-tier web application with web servers, application servers, and RDS database",
  "Create a microservices architecture with ECS, ALB, and RDS",
];

export function TextToDiagramGenerator({ onDiagramGenerated }: TextToDiagramGeneratorProps) {
  const { createDiagram, setGraph } = useEnhancedInfrastructure();
  const [prompt, setPrompt] = useState('');
  const [provider, setProvider] = useState<'aws' | 'azure' | 'gcp'>('aws');
  const [region, setRegion] = useState('us-east-1');
  const [isGenerating, setIsGenerating] = useState(false);
  const [generationProgress, setGenerationProgress] = useState(0);
  const [generatedDiagram, setGeneratedDiagram] = useState<GeneratedDiagram | null>(null);

  const handleGenerate = async () => {
    if (!prompt.trim()) {
      toast.error('Please enter a description of your infrastructure');
      return;
    }

    setIsGenerating(true);
    setGenerationProgress(0);

    try {
      // Simulate AI generation with progress updates
      const progressSteps = [
        { progress: 20, message: 'Analyzing infrastructure requirements...' },
        { progress: 40, message: 'Identifying cloud resources...' },
        { progress: 60, message: 'Creating architecture diagram...' },
        { progress: 80, message: 'Generating IaC code...' },
        { progress: 100, message: 'Finalizing diagram...' },
      ];

      for (const step of progressSteps) {
        await new Promise(resolve => setTimeout(resolve, 800));
        setGenerationProgress(step.progress);
      }

      // Mock AI-generated diagram
      const mockDiagram: GeneratedDiagram = await generateMockDiagram(prompt, provider, region);
      setGeneratedDiagram(mockDiagram);

      toast.success('Infrastructure diagram generated successfully!');
    } catch (error) {
      toast.error('Failed to generate diagram');
      console.error(error);
    } finally {
      setIsGenerating(false);
      setGenerationProgress(0);
    }
  };

  const generateMockDiagram = async (description: string, cloudProvider: string, selectedRegion: string): Promise<GeneratedDiagram> => {
    // This would be replaced with actual AI service call
    await new Promise(resolve => setTimeout(resolve, 1000));

    const nodes = [];
    const edges = [];

    // Simple pattern matching for common infrastructure patterns
    if (description.toLowerCase().includes('vpc')) {
      nodes.push({
        id: 'vpc-1',
        type: 'vpc',
        label: 'Main VPC',
        position: { x: 100, y: 100 },
        properties: { cidr: '10.0.0.0/16' },
      });

      if (description.toLowerCase().includes('subnet')) {
        const subnetCount = (description.match(/subnet/g) || []).length;
        for (let i = 1; i <= Math.min(subnetCount, 4); i++) {
          nodes.push({
            id: `subnet-${i}`,
            type: 'subnet',
            label: `Subnet ${i}`,
            position: { x: 50 + (i - 1) * 150, y: 200 },
            properties: { 
              cidr: `10.0.${i}.0/24`,
              isPublic: i <= 2,
              availabilityZone: `${selectedRegion}${['a', 'b', 'c', 'd'][i - 1] || 'a'}`,
            },
          });
          edges.push({
            id: `vpc-subnet-${i}`,
            source: 'vpc-1',
            target: `subnet-${i}`,
            type: 'contains',
          });
        }
      }
    }

    if (description.toLowerCase().includes('ec2') || description.toLowerCase().includes('instance')) {
      const instanceCount = (description.match(/ec2|instance/g) || []).length;
      for (let i = 1; i <= Math.min(instanceCount, 3); i++) {
        nodes.push({
          id: `ec2-${i}`,
          type: 'ec2',
          label: `Web Server ${i}`,
          position: { x: 100 + (i - 1) * 150, y: 300 },
          properties: { instanceType: 't3.medium', amiId: 'ami-12345678' },
        });
        
        // Connect to a subnet if available
        const subnetNode = nodes.find(n => n.type === 'subnet' && n.id.includes(i.toString()));
        if (subnetNode) {
          edges.push({
            id: `subnet-ec2-${i}`,
            source: subnetNode.id,
            target: `ec2-${i}`,
            type: 'contains',
          });
        }
      }
    }

    if (description.toLowerCase().includes('load balancer') || description.toLowerCase().includes('alb')) {
      nodes.push({
        id: 'alb-1',
        type: 'alb',
        label: 'Application Load Balancer',
        position: { x: 250, y: 250 },
        properties: { internal: false, idleTimeout: 60 },
      });

      // Connect ALB to EC2 instances
      const ec2Nodes = nodes.filter(n => n.type === 'ec2');
      ec2Nodes.forEach((ec2, index) => {
        edges.push({
          id: `alb-ec2-${index}`,
          source: 'alb-1',
          target: ec2.id,
          type: 'connects',
        });
      });
    }

    if (description.toLowerCase().includes('rds') || description.toLowerCase().includes('database')) {
      nodes.push({
        id: 'rds-1',
        type: 'rds',
        label: 'Application Database',
        position: { x: 400, y: 350 },
        properties: { 
          instanceType: 'db.t3.medium',
          engine: 'postgres',
          encrypted: true,
          multiAz: true,
        },
      });

      // Connect RDS to a private subnet
      const privateSubnet = nodes.find(n => n.type === 'subnet' && n.properties.isPublic === false);
      if (privateSubnet) {
        edges.push({
          id: 'subnet-rds',
          source: privateSubnet.id,
          target: 'rds-1',
          type: 'contains',
        });
      }
    }

    if (description.toLowerCase().includes('lambda')) {
      nodes.push({
        id: 'lambda-1',
        type: 'lambda',
        label: 'Serverless Function',
        position: { x: 300, y: 150 },
        properties: { 
          runtime: 'nodejs18.x',
          memory: 512,
          timeout: 30,
        },
      });
    }

    if (description.toLowerCase().includes('api gateway')) {
      nodes.push({
        id: 'api-gateway-1',
        type: 'api-gateway',
        label: 'API Gateway',
        position: { x: 200, y: 50 },
        properties: { apiType: 'REST' },
      });

      // Connect API Gateway to Lambda
      const lambdaNode = nodes.find(n => n.type === 'lambda');
      if (lambdaNode) {
        edges.push({
          id: 'api-lambda',
          source: 'api-gateway-1',
          target: lambdaNode.id,
          type: 'connects',
        });
      }
    }

    if (description.toLowerCase().includes('dynamodb')) {
      nodes.push({
        id: 'dynamodb-1',
        type: 'dynamodb',
        label: 'NoSQL Database',
        position: { x: 450, y: 200 },
        properties: { 
          billingMode: 'PAY_PER_REQUEST',
          encrypted: true,
        },
      });
    }

    return {
      nodes,
      edges,
      metadata: {
        name: 'AI Generated Infrastructure',
        description: `Generated from: ${description}`,
        provider: cloudProvider,
        estimatedCost: nodes.length * 50, // Mock cost estimation
      },
    };
  };

  const handleUseDiagram = async () => {
    if (!generatedDiagram) return;

    try {
      const diagramId = await createDiagram(generatedDiagram.metadata.name, generatedDiagram.metadata.description);
      
      const graph = {
        nodes: generatedDiagram.nodes,
        edges: generatedDiagram.edges,
        metadata: {
          name: generatedDiagram.metadata.name,
          region: region,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
      };

      setGraph(graph);
      onDiagramGenerated?.(generatedDiagram);
      
      toast.success('Diagram created and loaded!');
    } catch (error) {
      toast.error('Failed to create diagram');
      console.error(error);
    }
  };

  return (
    <Card className="w-full max-w-4xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Wand2 className="h-5 w-5 text-primary" />
          AI Infrastructure Generator
        </CardTitle>
        <CardDescription>
          Describe your infrastructure in natural language and let AI generate the diagram and IaC code
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Provider and Region Selection */}
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">Cloud Provider</label>
            <Select value={provider} onValueChange={(value: 'aws' | 'azure' | 'gcp') => setProvider(value)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="aws">AWS</SelectItem>
                <SelectItem value="azure">Azure</SelectItem>
                <SelectItem value="gcp">Google Cloud</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">Region</label>
            <Select value={region} onValueChange={setRegion}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="us-east-1">US East (N. Virginia)</SelectItem>
                <SelectItem value="us-west-2">US West (Oregon)</SelectItem>
                <SelectItem value="eu-west-1">EU West (Ireland)</SelectItem>
                <SelectItem value="ap-southeast-1">Asia Pacific (Singapore)</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Text Input */}
        <div className="space-y-2">
          <label className="text-sm font-medium">Describe Your Infrastructure</label>
          <Textarea
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder="e.g., Create a VPC with two public subnets, an application load balancer, and two EC2 instances running a web application..."
            className="min-h-[120px]"
          />
        </div>

        {/* Example Prompts */}
        <div className="space-y-2">
          <label className="text-sm font-medium">Example Prompts</label>
          <div className="flex flex-wrap gap-2">
            {examplePrompts.map((examplePrompt, index) => (
              <Badge
                key={index}
                variant="outline"
                className="cursor-pointer hover:bg-muted"
                onClick={() => setPrompt(examplePrompt)}
              >
                {examplePrompt.substring(0, 60)}...
              </Badge>
            ))}
          </div>
        </div>

        {/* Generate Button */}
        <Button
          onClick={handleGenerate}
          disabled={!prompt.trim() || isGenerating}
          className="w-full gap-2"
        >
          {isGenerating ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              Generating...
            </>
          ) : (
            <>
              <Sparkles className="h-4 w-4" />
              Generate Infrastructure
            </>
          )}
        </Button>

        {/* Progress Bar */}
        <AnimatePresence>
          {isGenerating && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="space-y-2"
            >
              <Progress value={generationProgress} className="w-full" />
              <p className="text-xs text-muted-foreground text-center">
                {generationProgress < 20 && 'Analyzing requirements...'}
                {generationProgress >= 20 && generationProgress < 40 && 'Identifying resources...'}
                {generationProgress >= 40 && generationProgress < 60 && 'Creating diagram...'}
                {generationProgress >= 60 && generationProgress < 80 && 'Generating code...'}
                {generationProgress >= 80 && 'Finalizing...'}
              </p>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Generated Results */}
        <AnimatePresence>
          {generatedDiagram && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-4"
            >
              <div className="flex items-center gap-2 p-4 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-800">
                <CheckCircle className="h-5 w-5 text-green-600" />
                <div className="flex-1">
                  <h4 className="font-medium text-green-800 dark:text-green-200">
                    Infrastructure Generated Successfully!
                  </h4>
                  <p className="text-sm text-green-600 dark:text-green-300">
                    {generatedDiagram.nodes.length} resources • {generatedDiagram.edges.length} connections
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 p-4 bg-muted rounded-lg">
                <div>
                  <h5 className="font-medium mb-2">Resources</h5>
                  <div className="space-y-1">
                    {generatedDiagram.nodes.map((node) => (
                      <div key={node.id} className="text-sm text-muted-foreground">
                        • {node.label} ({node.type})
                      </div>
                    ))}
                  </div>
                </div>
                <div>
                  <h5 className="font-medium mb-2">Estimated Cost</h5>
                  <p className="text-2xl font-bold text-primary">
                    ${generatedDiagram.metadata.estimatedCost}/month
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {generatedDiagram.metadata.provider} • {region}
                  </p>
                </div>
              </div>

              <Button onClick={handleUseDiagram} className="w-full gap-2">
                <CheckCircle className="h-4 w-4" />
                Use This Diagram
              </Button>
            </motion.div>
          )}
        </AnimatePresence>
      </CardContent>
    </Card>
  );
}
