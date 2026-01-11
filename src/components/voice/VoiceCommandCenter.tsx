import { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Mic, 
  MicOff, 
  Volume2, 
  VolumeX, 
  Brain, 
  Zap, 
  CheckCircle, 
  XCircle,
  Loader2,
  Settings,
  Play,
  Pause,
  RotateCcw
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useEnhancedInfrastructure } from '@/contexts/EnhancedInfrastructureContext';
import { toast } from 'sonner';

interface VoiceCommand {
  id: string;
  command: string;
  intent: string;
  confidence: number;
  timestamp: Date;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  result?: any;
  error?: string;
}

interface VoiceSettings {
  language: string;
  sensitivity: number;
  autoExecute: boolean;
  confidence: number;
}

const commandPatterns = [
  {
    pattern: /create|add|build|deploy|set up/i,
    intent: 'create',
    description: 'Create new infrastructure'
  },
  {
    pattern: /vpc|virtual private cloud/i,
    intent: 'create_vpc',
    description: 'Create VPC'
  },
  {
    pattern: /ec2|instance|server/i,
    intent: 'create_ec2',
    description: 'Create EC2 instance'
  },
  {
    pattern: /rds|database|db/i,
    intent: 'create_rds',
    description: 'Create RDS database'
  },
  {
    pattern: /s3|storage|bucket/i,
    intent: 'create_s3',
    description: 'Create S3 bucket'
  },
  {
    pattern: /lambda|function/i,
    intent: 'create_lambda',
    description: 'Create Lambda function'
  },
  {
    pattern: /load balancer|alb/i,
    intent: 'create_alb',
    description: 'Create Load Balancer'
  },
  {
    pattern: /delete|remove|destroy/i,
    intent: 'delete',
    description: 'Delete resource'
  },
  {
    pattern: /connect|link|wire/i,
    intent: 'connect',
    description: 'Connect resources'
  },
  {
    pattern: /security|secure|lock/i,
    intent: 'security',
    description: 'Add security'
  },
];

export function VoiceCommandCenter() {
  const { createDiagram, setGraph, state: { currentDiagram } } = useEnhancedInfrastructure();
  const [isListening, setIsListening] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [volume, setVolume] = useState(0);
  const [commands, setCommands] = useState<VoiceCommand[]>([]);
  const [settings, setSettings] = useState<VoiceSettings>({
    language: 'en-US',
    sensitivity: 0.7,
    autoExecute: true,
    confidence: 0.8,
  });
  const [transcript, setTranscript] = useState('');
  const [isSupported, setIsSupported] = useState(false);

  const recognitionRef = useRef<any>(null);
  const synthRef = useRef<any>(null);
  const timeoutRef = useRef<NodeJS.Timeout>();

  useEffect(() => {
    // Check browser support
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    const SpeechSynthesis = window.speechSynthesis;
    
    if (SpeechRecognition && SpeechSynthesis) {
      setIsSupported(true);
      
      const recognition = new SpeechRecognition();
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.lang = settings.language;
      
      recognition.onstart = () => {
        setIsListening(true);
        setTranscript('');
      };
      
      recognition.onresult = (event: any) => {
        let currentTranscript = '';
        for (let i = event.resultIndex; i < event.results.length; i++) {
          const result = event.results[i];
          if (result.isFinal) {
            currentTranscript += result[0].transcript;
          }
        }
        
        if (currentTranscript) {
          setTranscript(currentTranscript);
          processCommand(currentTranscript);
        }
      };
      
      recognition.onerror = (event: any) => {
        console.error('Speech recognition error:', event.error);
        setIsListening(false);
        
        if (event.error === 'no-speech') {
          toast.info('No speech detected. Please try again.');
        } else {
          toast.error(`Speech recognition error: ${event.error}`);
        }
      };
      
      recognition.onend = () => {
        setIsListening(false);
        setVolume(0);
      };
      
      recognitionRef.current = recognition;
      synthRef.current = SpeechSynthesis;
    } else {
      toast.error('Speech recognition is not supported in your browser');
    }

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
      if (synthRef.current) {
        synthRef.current.cancel();
      }
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [settings.language]);

  const processCommand = useCallback(async (transcript: string) => {
    if (!transcript.trim()) return;

    const command: VoiceCommand = {
      id: Date.now().toString(),
      command: transcript,
      intent: 'unknown',
      confidence: 0,
      timestamp: new Date(),
      status: 'pending',
    };

    setCommands(prev => [command, ...prev]);

    // Find matching pattern
    let matchedPattern = null;
    let highestConfidence = 0;

    for (const pattern of commandPatterns) {
      if (pattern.pattern.test(transcript)) {
        const confidence = calculateConfidence(transcript, pattern.pattern);
        if (confidence > highestConfidence) {
          highestConfidence = confidence;
          matchedPattern = pattern;
        }
      }
    }

    if (matchedPattern && highestConfidence >= settings.confidence) {
      command.intent = matchedPattern.intent;
      command.confidence = highestConfidence;
      command.status = 'processing';

      if (settings.autoExecute) {
        await executeCommand(command);
      }
    } else {
      command.status = 'failed';
      command.error = 'Command not recognized or confidence too low';
      toast.error('Command not recognized. Please try again.');
    }

    setCommands(prev => 
      prev.map(c => c.id === command.id ? command : c)
    );
  }, [settings.confidence, settings.autoExecute]);

  const calculateConfidence = (transcript: string, pattern: RegExp): number => {
    const matches = transcript.match(pattern);
    if (!matches) return 0;
    
    // Simple confidence calculation based on match strength
    const matchLength = matches[0].length;
    const transcriptLength = transcript.length;
    return Math.min(1, (matchLength / transcriptLength) * 1.5);
  };

  const executeCommand = useCallback(async (command: VoiceCommand) => {
    setIsProcessing(true);
    
    try {
      let result = null;

      switch (command.intent) {
        case 'create_vpc':
          result = await createVPC(command.command);
          break;
        case 'create_ec2':
          result = await createEC2(command.command);
          break;
        case 'create_rds':
          result = await createRDS(command.command);
          break;
        case 'create_s3':
          result = await createS3(command.command);
          break;
        case 'create_lambda':
          result = await createLambda(command.command);
          break;
        case 'create_alb':
          result = await createALB(command.command);
          break;
        case 'create':
          result = await createInfrastructure(command.command);
          break;
        default:
          throw new Error('Unknown command intent');
      }

      command.status = 'completed';
      command.result = result;
      
      speak(`Successfully executed: ${command.command}`);
      toast.success(`Command executed: ${command.intent}`);
      
    } catch (error) {
      command.status = 'failed';
      command.error = error instanceof Error ? error.message : 'Unknown error';
      
      speak(`Failed to execute: ${command.command}`);
      toast.error(`Command failed: ${command.intent}`);
    }

    setCommands(prev => 
      prev.map(c => c.id === command.id ? command : c)
    );
    
    setIsProcessing(false);
  }, []);

  const createVPC = async (command: string) => {
    const nodes = [
      {
        id: 'vpc-voice',
        type: 'vpc',
        label: 'Voice VPC',
        position: { x: 200, y: 100 },
        properties: { cidr: '10.0.0.0/16' },
      },
      {
        id: 'subnet-voice-1',
        type: 'subnet',
        label: 'Public Subnet',
        position: { x: 100, y: 200 },
        properties: { cidr: '10.0.1.0/24', isPublic: true },
      },
      {
        id: 'subnet-voice-2',
        type: 'subnet',
        label: 'Private Subnet',
        position: { x: 300, y: 200 },
        properties: { cidr: '10.0.2.0/24', isPublic: false },
      },
    ];

    const edges = [
      { id: 'vpc-subnet-1', source: 'vpc-voice', target: 'subnet-voice-1', type: 'contains' },
      { id: 'vpc-subnet-2', source: 'vpc-voice', target: 'subnet-voice-2', type: 'contains' },
    ];

    // Try to create diagram, fallback to setting graph directly
    try {
      const diagramId = await createDiagram('Voice Created VPC', 'Created via voice command');
      const graph = {
        nodes,
        edges,
        metadata: {
          name: 'Voice Created VPC',
          region: 'us-east-1',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
      };
      setGraph(graph);
      return { diagramId, nodes, edges };
    } catch (error) {
      // Fallback: set graph directly
      const graph = {
        nodes,
        edges,
        metadata: {
          name: 'Voice Created VPC',
          region: 'us-east-1',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
      };
      setGraph(graph);
      return { nodes, edges };
    }
  };

  const createEC2 = async (command: string) => {
    const nodes = [
      {
        id: 'ec2-voice',
        type: 'ec2',
        label: 'Voice EC2 Instance',
        position: { x: 200, y: 150 },
        properties: { instanceType: 't3.medium', amiId: 'ami-12345678' },
      },
    ];

    const diagramId = await createDiagram('Voice Created EC2', 'Created via voice command');
    const graph = {
      nodes,
      edges: [],
      metadata: {
        name: 'Voice Created EC2',
        region: 'us-east-1',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
    };

    setGraph(graph);
    return { diagramId, nodes };
  };

  const createRDS = async (command: string) => {
    const nodes = [
      {
        id: 'rds-voice',
        type: 'rds',
        label: 'Voice RDS Database',
        position: { x: 200, y: 150 },
        properties: { instanceType: 'db.t3.medium', engine: 'postgres' },
      },
    ];

    const diagramId = await createDiagram('Voice Created RDS', 'Created via voice command');
    const graph = {
      nodes,
      edges: [],
      metadata: {
        name: 'Voice Created RDS',
        region: 'us-east-1',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
    };

    setGraph(graph);
    return { diagramId, nodes };
  };

  const createS3 = async (command: string) => {
    const nodes = [
      {
        id: 's3-voice',
        type: 's3',
        label: 'Voice S3 Bucket',
        position: { x: 200, y: 150 },
        properties: { bucketName: 'voice-generated-bucket' },
      },
    ];

    const diagramId = await createDiagram('Voice Created S3', 'Created via voice command');
    const graph = {
      nodes,
      edges: [],
      metadata: {
        name: 'Voice Created S3',
        region: 'us-east-1',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
    };

    setGraph(graph);
    return { diagramId, nodes };
  };

  const createLambda = async (command: string) => {
    const nodes = [
      {
        id: 'lambda-voice',
        type: 'lambda',
        label: 'Voice Lambda Function',
        position: { x: 200, y: 150 },
        properties: { runtime: 'nodejs18.x', memory: 512 },
      },
    ];

    const diagramId = await createDiagram('Voice Created Lambda', 'Created via voice command');
    const graph = {
      nodes,
      edges: [],
      metadata: {
        name: 'Voice Created Lambda',
        region: 'us-east-1',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
    };

    setGraph(graph);
    return { diagramId, nodes };
  };

  const createALB = async (command: string) => {
    const nodes = [
      {
        id: 'alb-voice',
        type: 'alb',
        label: 'Voice Load Balancer',
        position: { x: 200, y: 150 },
        properties: { internal: false, idleTimeout: 60 },
      },
    ];

    const diagramId = await createDiagram('Voice Created ALB', 'Created via voice command');
    const graph = {
      nodes,
      edges: [],
      metadata: {
        name: 'Voice Created ALB',
        region: 'us-east-1',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
    };

    setGraph(graph);
    return { diagramId, nodes };
  };

  const createInfrastructure = async (command: string) => {
    // Complex infrastructure creation based on command analysis
    const nodes = [];
    const edges = [];

    // Add VPC
    nodes.push({
      id: 'vpc-voice',
      type: 'vpc',
      label: 'Main VPC',
      position: { x: 200, y: 50 },
      properties: { cidr: '10.0.0.0/16' },
    });

    // Add subnets
    nodes.push({
      id: 'subnet-voice-1',
      type: 'subnet',
      label: 'Public Subnet',
      position: { x: 100, y: 150 },
      properties: { cidr: '10.0.1.0/24', isPublic: true },
    });

    nodes.push({
      id: 'subnet-voice-2',
      type: 'subnet',
      label: 'Private Subnet',
      position: { x: 300, y: 150 },
      properties: { cidr: '10.0.2.0/24', isPublic: false },
    });

    // Add EC2 if mentioned
    if (/ec2|instance|server/i.test(command)) {
      nodes.push({
        id: 'ec2-voice',
        type: 'ec2',
        label: 'Web Server',
        position: { x: 100, y: 250 },
        properties: { instanceType: 't3.medium' },
      });
    }

    // Add RDS if mentioned
    if (/rds|database|db/i.test(command)) {
      nodes.push({
        id: 'rds-voice',
        type: 'rds',
        label: 'Database',
        position: { x: 300, y: 250 },
        properties: { instanceType: 'db.t3.medium' },
      });
    }

    // Add connections
    edges.push(
      { id: 'vpc-subnet-1', source: 'vpc-voice', target: 'subnet-voice-1', type: 'contains' },
      { id: 'vpc-subnet-2', source: 'vpc-voice', target: 'subnet-voice-2', type: 'contains' }
    );

    const diagramId = await createDiagram('Voice Infrastructure', 'Created via voice command');
    const graph = {
      nodes,
      edges,
      metadata: {
        name: 'Voice Infrastructure',
        region: 'us-east-1',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
    };

    setGraph(graph);
    return { diagramId, nodes, edges };
  };

  const speak = useCallback((text: string) => {
    if (!synthRef.current) return;

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = 1;
    utterance.pitch = 1;
    utterance.volume = 1;
    
    synthRef.current.speak(utterance);
  }, []);

  const toggleListening = useCallback(() => {
    if (!recognitionRef.current) return;

    if (isListening) {
      recognitionRef.current.stop();
    } else {
      recognitionRef.current.start();
    }
  }, [isListening]);

  const clearCommands = useCallback(() => {
    setCommands([]);
  }, []);

  const retryCommand = useCallback(async (command: VoiceCommand) => {
    await executeCommand(command);
  }, [executeCommand]);

  // Simulate volume levels
  useEffect(() => {
    if (isListening) {
      const interval = setInterval(() => {
        setVolume(Math.random() * 100);
      }, 100);
      return () => clearInterval(interval);
    } else {
      setVolume(0);
    }
  }, [isListening]);

  if (!isSupported) {
    return (
      <Card className="w-full">
        <CardContent className="flex flex-col items-center justify-center p-8">
          <MicOff className="h-12 w-12 text-muted-foreground mb-4" />
          <h3 className="text-lg font-semibold mb-2">Voice Commands Not Supported</h3>
          <p className="text-muted-foreground text-center">
            Your browser doesn't support speech recognition. Please use Chrome, Edge, or Safari.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Voice Control Panel */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Mic className="h-5 w-5 text-primary" />
            Voice Command Center
            <Badge variant="secondary" className="gap-1">
              <Brain className="h-3 w-3" />
              AI Powered
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Main Controls */}
          <div className="flex items-center justify-center gap-4">
            <Button
              size="lg"
              onClick={toggleListening}
              disabled={isProcessing}
              className={`relative w-24 h-24 rounded-full ${
                isListening ? 'bg-red-500 hover:bg-red-600' : 'bg-primary hover:bg-primary/90'
              }`}
            >
              {isListening ? (
                <MicOff className="h-8 w-8" />
              ) : (
                <Mic className="h-8 w-8" />
              )}
              
              {/* Volume indicator */}
              <AnimatePresence>
                {isListening && (
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: [1, 1.2, 1] }}
                    exit={{ scale: 0 }}
                    transition={{ repeat: Infinity, duration: 1 }}
                    className="absolute inset-0 rounded-full border-4 border-white/30"
                  />
                )}
              </AnimatePresence>
            </Button>

            <div className="text-center">
              <div className="text-lg font-medium">
                {isListening ? 'Listening...' : 'Click to Start'}
              </div>
              <div className="text-sm text-muted-foreground">
                {isProcessing ? 'Processing command...' : 'Say a command like "Create a VPC"'}
              </div>
            </div>
          </div>

          {/* Volume Meter */}
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>Volume</span>
              <span>{Math.round(volume)}%</span>
            </div>
            <Progress value={volume} className="h-2" />
          </div>

          {/* Current Transcript */}
          {transcript && (
            <div className="p-3 bg-muted rounded-lg">
              <div className="text-sm font-medium mb-1">Current Transcript:</div>
              <div className="text-sm">{transcript}</div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Command History */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg">Command History</CardTitle>
            <Button variant="outline" size="sm" onClick={clearCommands}>
              <RotateCcw className="h-4 w-4 mr-2" />
              Clear
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <ScrollArea className="h-64">
            <div className="space-y-3">
              {commands.length === 0 ? (
                <div className="text-center text-muted-foreground py-8">
                  No commands yet. Start speaking to see commands here.
                </div>
              ) : (
                commands.map((command) => (
                  <motion.div
                    key={command.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="p-3 border rounded-lg"
                  >
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex-1">
                        <div className="font-medium">{command.command}</div>
                        <div className="text-sm text-muted-foreground">
                          Intent: {command.intent} • Confidence: {Math.round(command.confidence * 100)}%
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant={
                          command.status === 'completed' ? 'default' :
                          command.status === 'failed' ? 'destructive' :
                          command.status === 'processing' ? 'secondary' :
                          'outline'
                        }>
                          {command.status}
                        </Badge>
                        {command.status === 'failed' && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => retryCommand(command)}
                          >
                            <RotateCcw className="h-3 w-3" />
                          </Button>
                        )}
                      </div>
                    </div>
                    
                    {command.error && (
                      <div className="text-sm text-red-500 mt-1">
                        Error: {command.error}
                      </div>
                    )}
                    
                    {command.result && (
                      <div className="text-sm text-green-600 mt-1">
                        ✓ Successfully created {command.result.nodes?.length || 0} resources
                      </div>
                    )}
                  </motion.div>
                ))
              )}
            </div>
          </ScrollArea>
        </CardContent>
      </Card>

      {/* Available Commands */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Available Commands</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {commandPatterns.map((pattern, index) => (
              <div key={index} className="p-3 border rounded-lg">
                <div className="font-medium">{pattern.description}</div>
                <div className="text-sm text-muted-foreground">
                  Try: "Create a {pattern.description.toLowerCase()}"
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
