import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, Network, Code, Shield, X, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent } from '@/components/ui/dialog';

interface OnboardingModalProps {
  open: boolean;
  onComplete: () => void;
}

const examples = [
  {
    title: 'Secure Web Application',
    description: 'VPC with public/private subnets, ALB, EC2 instances, and encrypted RDS',
    prompt: 'Create a secure VPC with public and private subnets, an Application Load Balancer, 2 EC2 instances in an Auto Scaling group, and an encrypted RDS PostgreSQL database',
  },
  {
    title: 'Serverless API',
    description: 'API Gateway, Lambda functions, and DynamoDB',
    prompt: 'Build a serverless REST API with API Gateway, 3 Lambda functions for CRUD operations, and a DynamoDB table with on-demand capacity',
  },
  {
    title: 'Static Website with CDN',
    description: 'S3 bucket with CloudFront distribution',
    prompt: 'Create an S3 bucket for static website hosting with CloudFront CDN, SSL certificate, and a custom domain',
  },
];

const features = [
  { icon: Sparkles, title: 'AI-Powered', description: 'Describe your infrastructure in plain English' },
  { icon: Network, title: 'Visual Editor', description: 'Drag-and-drop diagram editing' },
  { icon: Code, title: 'IaC Generation', description: 'Export to Terraform, CloudFormation, or Pulumi' },
  { icon: Shield, title: 'Security Scanning', description: 'Automatic compliance and best practice checks' },
];

export function OnboardingModal({ open, onComplete }: OnboardingModalProps) {
  const [step, setStep] = useState(0);

  const handleExampleClick = (prompt: string) => {
    localStorage.setItem('infravizai_example_prompt', prompt);
    onComplete();
  };

  return (
    <Dialog open={open} onOpenChange={() => {}}>
      <DialogContent className="max-w-2xl p-0 gap-0 overflow-hidden" hideCloseButton>
        <AnimatePresence mode="wait">
          {step === 0 ? (
            <motion.div
              key="welcome"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="p-8"
            >
              <div className="text-center mb-8">
                <div className="w-16 h-16 rounded-2xl bg-primary mx-auto mb-4 flex items-center justify-center">
                  <svg className="w-10 h-10 text-primary-foreground" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M5 17L12 5L19 17Z" strokeLinejoin="round" />
                    <circle cx="12" cy="14" r="2" fill="currentColor" />
                  </svg>
                </div>
                <h1 className="text-2xl font-bold mb-2">Welcome to InfraVizAI</h1>
                <p className="text-muted-foreground">Design cloud infrastructure with the power of AI</p>
              </div>

              <div className="grid grid-cols-2 gap-4 mb-8">
                {features.map((feature) => (
                  <div key={feature.title} className="flex items-start gap-3 p-4 rounded-lg bg-muted/50">
                    <feature.icon className="h-5 w-5 text-primary mt-0.5" />
                    <div>
                      <h3 className="font-medium text-sm">{feature.title}</h3>
                      <p className="text-xs text-muted-foreground">{feature.description}</p>
                    </div>
                  </div>
                ))}
              </div>

              <div className="flex justify-between">
                <Button variant="ghost" onClick={onComplete}>
                  Skip
                </Button>
                <Button onClick={() => setStep(1)} className="gap-2">
                  Get Started <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </motion.div>
          ) : (
            <motion.div
              key="examples"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="p-8"
            >
              <div className="flex justify-between items-center mb-6">
                <div>
                  <h2 className="text-xl font-bold">Try an Example</h2>
                  <p className="text-sm text-muted-foreground">Click to start with a pre-built architecture</p>
                </div>
                <Button variant="ghost" size="icon" onClick={onComplete}>
                  <X className="h-5 w-5" />
                </Button>
              </div>

              <div className="space-y-3 mb-6">
                {examples.map((example) => (
                  <button
                    key={example.title}
                    onClick={() => handleExampleClick(example.prompt)}
                    className="w-full text-left p-4 rounded-lg border border-border hover:border-primary hover:bg-primary/5 transition-colors"
                  >
                    <h3 className="font-medium mb-1">{example.title}</h3>
                    <p className="text-sm text-muted-foreground">{example.description}</p>
                  </button>
                ))}
              </div>

              <Button variant="outline" className="w-full" onClick={onComplete}>
                Start from Scratch
              </Button>
            </motion.div>
          )}
        </AnimatePresence>
      </DialogContent>
    </Dialog>
  );
}
