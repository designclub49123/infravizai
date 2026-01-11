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
  RotateCcw,
  Headphones,
  MessageSquare,
  Command,
  Activity
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Slider } from '@/components/ui/slider';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
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
    description: 'Create new infrastructure',
    icon: <Zap className="h-4 w-4" />
  },
  {
    pattern: /vpc|virtual private cloud/i,
    intent: 'create_vpc',
    description: 'Create VPC',
    icon: <Command className="h-4 w-4" />
  },
  {
    pattern: /ec2|instance|server/i,
    intent: 'create_ec2',
    description: 'Create EC2 instance',
    icon: <Activity className="h-4 w-4" />
  },
  {
    pattern: /rds|database|db/i,
    intent: 'create_rds',
    description: 'Create RDS database',
    icon: <Brain className="h-4 w-4" />
  },
  {
    pattern: /s3|storage|bucket/i,
    intent: 'create_s3',
    description: 'Create S3 bucket',
    icon: <Volume2 className="h-4 w-4" />
  },
  {
    pattern: /lambda|function/i,
    intent: 'create_lambda',
    description: 'Create Lambda function',
    icon: <Zap className="h-4 w-4" />
  },
  {
    pattern: /load balancer|alb/i,
    intent: 'create_alb',
    description: 'Create Load Balancer',
    icon: <Activity className="h-4 w-4" />
  },
  {
    pattern: /delete|remove|destroy/i,
    intent: 'delete',
    description: 'Delete resource',
    icon: <XCircle className="h-4 w-4" />
  },
  {
    pattern: /connect|link|wire/i,
    intent: 'connect',
    description: 'Connect resources',
    icon: <Command className="h-4 w-4" />
  },
  {
    pattern: /security|secure|lock/i,
    intent: 'security',
    description: 'Add security',
    icon: <Settings className="h-4 w-4" />
  },
];

export function VoiceCommandCenterFixed() {
  const [isListening, setIsListening] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [commands, setCommands] = useState<VoiceCommand[]>([]);
  const [transcript, setTranscript] = useState('');
  const [settings, setSettings] = useState<VoiceSettings>({
    language: 'en-US',
    sensitivity: 70,
    autoExecute: false,
    confidence: 80,
  });
  const [isSupported, setIsSupported] = useState(false);
  const [volume, setVolume] = useState(0);
  const [showSettings, setShowSettings] = useState(false);

  const recognitionRef = useRef<any>(null);
  const synthRef = useRef<any>(null);

  useEffect(() => {
    // Check browser support
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    const SpeechSynthesis = (window as any).speechSynthesis;
    
    setIsSupported(!!SpeechRecognition && !!SpeechSynthesis);
    
    if (SpeechRecognition) {
      const recognition = new SpeechRecognition();
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.lang = settings.language;
      
      recognition.onresult = (event: any) => {
        const current = event.resultIndex;
        const transcript = event.results[current][0].transcript;
        setTranscript(transcript);
        
        if (event.results[current].isFinal) {
          processCommand(transcript);
        }
      };
      
      recognition.onerror = (event: any) => {
        console.error('Speech recognition error:', event.error);
        setIsListening(false);
        
        if (event.error === 'not-allowed') {
          toast.error('Microphone permission denied. Please allow microphone access.');
        } else {
          toast.error('Speech recognition error: ' + event.error);
        }
      };
      
      recognitionRef.current = recognition;
    }
    
    if (SpeechSynthesis) {
      synthRef.current = SpeechSynthesis;
    }
    
    // Load demo commands
    loadDemoCommands();
  }, []);

  const loadDemoCommands = () => {
    const demoCommands: VoiceCommand[] = [
      {
        id: '1',
        command: 'Create a new VPC',
        intent: 'create_vpc',
        confidence: 95,
        timestamp: new Date(Date.now() - 5 * 60 * 1000),
        status: 'completed',
        result: { vpcId: 'vpc-12345', cidr: '10.0.0.0/16' }
      },
      {
        id: '2',
        command: 'Add an EC2 instance',
        intent: 'create_ec2',
        confidence: 88,
        timestamp: new Date(Date.now() - 10 * 60 * 1000),
        status: 'completed',
        result: { instanceId: 'i-67890', type: 't3.micro' }
      },
      {
        id: '3',
        command: 'Create S3 bucket',
        intent: 'create_s3',
        confidence: 92,
        timestamp: new Date(Date.now() - 15 * 60 * 1000),
        status: 'failed',
        error: 'Bucket name already exists'
      },
    ];
    setCommands(demoCommands);
  };

  const processCommand = useCallback(async (command: string) => {
    const commandObj: VoiceCommand = {
      id: Date.now().toString(),
      command,
      intent: 'unknown',
      confidence: 0,
      timestamp: new Date(),
      status: 'processing',
    };

    setCommands(prev => [commandObj, ...prev]);
    setIsProcessing(true);

    // Simulate AI processing
    setTimeout(() => {
      let matchedIntent = 'unknown';
      let confidence = 0;
      
      for (const pattern of commandPatterns) {
        if (pattern.pattern.test(command)) {
          matchedIntent = pattern.intent;
          confidence = 75 + Math.random() * 20; // 75-95% confidence
          break;
        }
      }

      const updatedCommand = {
        ...commandObj,
        intent: matchedIntent,
        confidence,
        status: matchedIntent !== 'unknown' ? 'completed' : 'failed',
        result: matchedIntent !== 'unknown' ? generateMockResult(matchedIntent) : undefined,
        error: matchedIntent === 'unknown' ? 'Command not recognized' : undefined,
      };

      setCommands(prev => 
        prev.map(c => c.id === commandObj.id ? updatedCommand : c)
      );

      if (matchedIntent !== 'unknown') {
        speakResponse(`Executing: ${command}`);
        toast.success(`Command recognized: ${matchedIntent}`);
      } else {
        speakResponse("Sorry, I didn't understand that command");
        toast.error('Command not recognized');
      }

      setIsProcessing(false);
      setTranscript('');
    }, 1500);
  }, []);

  const generateMockResult = (intent: string) => {
    switch (intent) {
      case 'create_vpc':
        return { vpcId: `vpc-${Math.random().toString(36).substr(2, 9)}`, cidr: '10.0.0.0/16' };
      case 'create_ec2':
        return { instanceId: `i-${Math.random().toString(36).substr(2, 9)}`, type: 't3.micro' };
      case 'create_rds':
        return { dbId: `db-${Math.random().toString(36).substr(2, 9)}`, engine: 'mysql' };
      case 'create_s3':
        return { bucketName: `bucket-${Math.random().toString(36).substr(2, 9)}`, region: 'us-east-1' };
      case 'create_lambda':
        return { functionId: `func-${Math.random().toString(36).substr(2, 9)}`, runtime: 'nodejs18.x' };
      case 'create_alb':
        return { loadBalancerArn: `arn:aws:elasticloadbalancing:...`, dnsName: 'my-app-lb.us-east-1.elb.amazonaws.com' };
      default:
        return { success: true };
    }
  };

  const speakResponse = (text: string) => {
    if (synthRef.current) {
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = 0.9;
      utterance.pitch = 1;
      utterance.volume = 1;
      synthRef.current.speak(utterance);
    }
  };

  const toggleListening = () => {
    if (!isSupported) {
      toast.error('Speech recognition is not supported in your browser');
      return;
    }

    if (isListening) {
      recognitionRef.current?.stop();
      setIsListening(false);
    } else {
      recognitionRef.current?.start();
      setIsListening(true);
      setTranscript('');
    }
  };

  const clearCommands = () => {
    setCommands([]);
    toast.success('Command history cleared');
  };

  const executeCommand = (command: VoiceCommand) => {
    if (command.status === 'completed') return;
    
    setCommands(prev => 
      prev.map(c => 
        c.id === command.id 
          ? { ...c, status: 'processing' }
          : c
      )
    );

    setTimeout(() => {
      setCommands(prev => 
        prev.map(c => 
          c.id === command.id 
            ? { ...c, status: 'completed', result: generateMockResult(c.intent) }
            : c
        )
      );
      toast.success('Command executed successfully');
    }, 2000);
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending': return <Clock className="h-4 w-4" />;
      case 'processing': return <Loader2 className="h-4 w-4 animate-spin" />;
      case 'completed': return <CheckCircle className="h-4 w-4" />;
      case 'failed': return <XCircle className="h-4 w-4" />;
      default: return <MessageSquare className="h-4 w-4" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'processing': return 'bg-blue-100 text-blue-800';
      case 'completed': return 'bg-green-100 text-green-800';
      case 'failed': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (!isSupported) {
    return (
      <Card className="w-full max-w-2xl mx-auto">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MicOff className="h-5 w-5 text-red-500" />
            Voice Commands Not Supported
          </CardTitle>
        </CardHeader>
        <CardContent className="text-center py-8">
          <MicOff className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-semibold mb-2">Browser Not Supported</h3>
          <p className="text-muted-foreground mb-4">
            Voice commands require a modern browser with speech recognition support.
          </p>
          <p className="text-sm text-muted-foreground">
            Try using Chrome, Edge, or Safari for the best experience.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="grid gap-6 lg:grid-cols-3">
      {/* Voice Input Panel */}
      <div className="lg:col-span-2 space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Mic className="h-5 w-5" />
              Voice Command Center
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Voice Input */}
            <div className="text-center space-y-4">
              <div className="relative inline-flex items-center justify-center">
                <Button
                  size="lg"
                  onClick={toggleListening}
                  disabled={isProcessing}
                  className={`w-24 h-24 rounded-full ${
                    isListening 
                      ? 'bg-red-500 hover:bg-red-600 animate-pulse' 
                      : 'bg-primary hover:bg-primary'
                  }`}
                >
                  {isListening ? (
                    <MicOff className="h-8 w-8" />
                  ) : (
                    <Mic className="h-8 w-8" />
                  )}
                </Button>
                {isListening && (
                  <div className="absolute inset-0 rounded-full border-4 border-red-300 animate-ping" />
                )}
              </div>
              
              <div className="space-y-2">
                <p className="text-sm font-medium">
                  {isListening ? 'Listening...' : 'Click to start speaking'}
                </p>
                {transcript && (
                  <div className="p-3 bg-muted rounded-lg">
                    <p className="text-sm">"{transcript}"</p>
                  </div>
                )}
              </div>
            </div>

            {/* Audio Level */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Audio Level</span>
                <span className="text-sm text-muted-foreground">{volume}%</span>
              </div>
              <Progress value={volume} className="h-2" />
            </div>

            {/* Quick Commands */}
            <div className="space-y-3">
              <h4 className="text-sm font-medium">Quick Commands</h4>
              <div className="grid grid-cols-2 gap-2">
                {commandPatterns.slice(0, 6).map((pattern, index) => (
                  <Button
                    key={index}
                    variant="outline"
                    size="sm"
                    onClick={() => processCommand(pattern.description)}
                    className="justify-start gap-2"
                  >
                    {pattern.icon}
                    <span className="text-xs">{pattern.description}</span>
                  </Button>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Command History */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <MessageSquare className="h-5 w-5" />
              Command History
            </CardTitle>
            <Button variant="outline" size="sm" onClick={clearCommands}>
              Clear
            </Button>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-64">
              <div className="space-y-3">
                {commands.length === 0 ? (
                  <p className="text-center text-muted-foreground py-8">
                    No commands yet. Start speaking to see commands here.
                  </p>
                ) : (
                  commands.map((command) => (
                    <div
                      key={command.id}
                      className="flex items-start gap-3 p-3 rounded-lg border"
                    >
                      <div className={`p-1 rounded-full ${getStatusColor(command.status)}`}>
                        {getStatusIcon(command.status)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">
                          {command.command}
                        </p>
                        <div className="flex items-center gap-2 mt-1">
                          <Badge variant="outline" className="text-xs">
                            {command.intent}
                          </Badge>
                          <span className="text-xs text-muted-foreground">
                            {command.confidence.toFixed(0)}% confidence
                          </span>
                        </div>
                        {command.error && (
                          <p className="text-xs text-red-500 mt-1">{command.error}</p>
                        )}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {command.timestamp.toLocaleTimeString()}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>
      </div>

      {/* Settings Panel */}
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Settings className="h-5 w-5" />
              Settings
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Language</label>
              <Select value={settings.language} onValueChange={(value) => 
                setSettings({ ...settings, language: value })
              }>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="en-US">English (US)</SelectItem>
                  <SelectItem value="en-GB">English (UK)</SelectItem>
                  <SelectItem value="es-ES">Spanish</SelectItem>
                  <SelectItem value="fr-FR">French</SelectItem>
                  <SelectItem value="de-DE">German</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">
                Sensitivity: {settings.sensitivity}%
              </label>
              <Slider
                value={[settings.sensitivity]}
                onValueChange={([value]) => 
                  setSettings({ ...settings, sensitivity: value })
                }
                max={100}
                step={5}
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">
                Confidence Threshold: {settings.confidence}%
              </label>
              <Slider
                value={[settings.confidence]}
                onValueChange={([value]) => 
                  setSettings({ ...settings, confidence: value })
                }
                max={100}
                step={5}
              />
            </div>

            <div className="flex items-center justify-between">
              <label className="text-sm font-medium">Auto Execute</label>
              <Switch
                checked={settings.autoExecute}
                onCheckedChange={(checked) => 
                  setSettings({ ...settings, autoExecute: checked })
                }
              />
            </div>
          </CardContent>
        </Card>

        {/* Available Commands */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Command className="h-5 w-5" />
              Available Commands
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-64">
              <div className="space-y-2">
                {commandPatterns.map((pattern, index) => (
                  <div
                    key={index}
                    className="flex items-center gap-2 p-2 rounded hover:bg-muted cursor-pointer"
                    onClick={() => processCommand(pattern.description)}
                  >
                    {pattern.icon}
                    <div className="flex-1">
                      <p className="text-sm font-medium">{pattern.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
