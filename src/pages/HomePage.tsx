import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Sparkles, Mic, ArrowRight, Network, Code, Shield, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent } from '@/components/ui/card';
import { useInfrastructure } from '@/contexts/InfrastructureContext';
import { useEnhancedInfrastructure } from '@/contexts/EnhancedInfrastructureContext';
import { TextToDiagramGenerator } from '@/components/ai/TextToDiagramGenerator';
import { AISecurityDetector } from '@/components/security/AISecurityDetector';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

const quickExamples = [
  'Create a VPC with public and private subnets',
  'Build a serverless API with Lambda and API Gateway',
  'Set up an EC2 instance with RDS database',
];

export default function HomePage() {
  const [prompt, setPrompt] = useState('');
  const [isListening, setIsListening] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const { setGraph } = useInfrastructure();
  const navigate = useNavigate();

  useEffect(() => {
    const savedPrompt = localStorage.getItem('infravizai_example_prompt');
    if (savedPrompt) {
      setPrompt(savedPrompt);
      localStorage.removeItem('infravizai_example_prompt');
    }
  }, []);

  const handleGenerate = async () => {
    if (!prompt.trim()) {
      toast.error('Please enter a description of your infrastructure');
      return;
    }

    setIsGenerating(true);
    
    try {
      const { data, error } = await supabase.functions.invoke('generate-infrastructure', {
        body: { prompt },
      });

      if (error) throw error;
      if (!data.success) throw new Error(data.error);

      setGraph(data.graph);
      toast.success('Infrastructure generated successfully!');
      navigate('/diagram');
    } catch (error: any) {
      console.error('Generation error:', error);
      toast.error(error.message || 'Failed to generate infrastructure');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleVoiceInput = () => {
    if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
      toast.error('Voice input is not supported in your browser');
      return;
    }

    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    const recognition = new SpeechRecognition();
    recognition.continuous = false;
    recognition.interimResults = true;

    recognition.onstart = () => setIsListening(true);
    recognition.onend = () => setIsListening(false);
    recognition.onerror = () => {
      setIsListening(false);
      toast.error('Voice recognition failed');
    };
    recognition.onresult = (event: any) => {
      const transcript = Array.from(event.results)
        .map((result: any) => result[0].transcript)
        .join('');
      setPrompt(transcript);
    };

    recognition.start();
  };

  return (
    <div className="min-h-[calc(100vh-3.5rem)] p-4 md:p-8">
      <div className="max-w-4xl mx-auto">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-8">
          <h1 className="text-3xl md:text-4xl font-bold mb-3">
            Design Infrastructure with <span className="text-primary">AI</span>
          </h1>
          <p className="text-muted-foreground text-lg">Describe your cloud architecture in plain English</p>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
          <Card className="mb-6">
            <CardContent className="p-6">
              <div className="relative">
                <Textarea
                  placeholder="Describe your infrastructure... e.g., 'Create a secure VPC with public and private subnets, an ALB, EC2 instances, and an encrypted RDS database'"
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  className="min-h-[120px] pr-12 resize-none text-base"
                />
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={handleVoiceInput}
                  className={`absolute right-2 top-2 ${isListening ? 'text-primary animate-pulse' : ''}`}
                >
                  <Mic className="h-5 w-5" />
                </Button>
              </div>

              <div className="flex flex-wrap gap-2 mt-4">
                {quickExamples.map((example) => (
                  <button
                    key={example}
                    onClick={() => setPrompt(example)}
                    className="text-xs px-3 py-1.5 rounded-full bg-muted hover:bg-muted/80 transition-colors"
                  >
                    {example}
                  </button>
                ))}
              </div>

              <Button onClick={handleGenerate} disabled={isGenerating || !prompt.trim()} className="w-full mt-4 h-12 text-base gap-2">
                {isGenerating ? (
                  <Loader2 className="h-5 w-5 animate-spin" />
                ) : (
                  <>
                    <Sparkles className="h-5 w-5" />
                    Generate Infrastructure
                    <ArrowRight className="h-5 w-5" />
                  </>
                )}
              </Button>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="grid md:grid-cols-3 gap-4">
          {[
            { icon: Network, title: 'Visual Diagrams', desc: 'Interactive drag-and-drop editor' },
            { icon: Code, title: 'IaC Export', desc: 'Terraform, CloudFormation, Pulumi' },
            { icon: Shield, title: 'Security Scan', desc: 'Best practices & compliance' },
          ].map((feature) => (
            <Card key={feature.title} className="p-4">
              <feature.icon className="h-8 w-8 text-primary mb-3" />
              <h3 className="font-semibold mb-1">{feature.title}</h3>
              <p className="text-sm text-muted-foreground">{feature.desc}</p>
            </Card>
          ))}
        </motion.div>
      </div>
    </div>
  );
}
