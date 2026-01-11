-- Create enum for IaC frameworks
CREATE TYPE iac_framework AS ENUM ('terraform', 'cloudformation', 'pulumi');

-- Create enum for resource types
CREATE TYPE aws_resource_type AS ENUM (
  'vpc', 'subnet', 'internet_gateway', 'nat_gateway', 'route_table',
  'ec2', 'load_balancer', 'auto_scaling_group', 'launch_template',
  'rds', 's3', 'lambda', 'api_gateway', 'dynamodb',
  'security_group', 'iam_role', 'iam_policy',
  'cloudfront', 'elastic_ip', 'efs'
);

-- Create enum for security issue severity
CREATE TYPE security_severity AS ENUM ('info', 'low', 'medium', 'high', 'critical');

-- Diagrams table - stores user infrastructure diagrams
CREATE TABLE public.diagrams (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL DEFAULT 'Untitled Diagram',
  description TEXT,
  nodes JSONB NOT NULL DEFAULT '[]'::jsonb,
  edges JSONB NOT NULL DEFAULT '[]'::jsonb,
  iac_framework iac_framework NOT NULL DEFAULT 'terraform',
  iac_code TEXT,
  estimated_monthly_cost DECIMAL(10,2),
  is_public BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Security reports table - stores security scan results
CREATE TABLE public.security_reports (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  diagram_id UUID NOT NULL REFERENCES public.diagrams(id) ON DELETE CASCADE,
  issues JSONB NOT NULL DEFAULT '[]'::jsonb,
  compliance_status JSONB NOT NULL DEFAULT '{}'::jsonb,
  scanned_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Resource templates table - reusable infrastructure patterns
CREATE TABLE public.resource_templates (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  category TEXT NOT NULL,
  nodes JSONB NOT NULL DEFAULT '[]'::jsonb,
  edges JSONB NOT NULL DEFAULT '[]'::jsonb,
  is_builtin BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- AI chat history for infrastructure assistance
CREATE TABLE public.ai_conversations (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  diagram_id UUID REFERENCES public.diagrams(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  messages JSONB NOT NULL DEFAULT '[]'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Cost estimation cache
CREATE TABLE public.cost_estimates (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  resource_type aws_resource_type NOT NULL,
  region TEXT NOT NULL DEFAULT 'us-east-1',
  instance_type TEXT,
  hourly_cost DECIMAL(10,4) NOT NULL DEFAULT 0,
  monthly_cost DECIMAL(10,2) NOT NULL DEFAULT 0,
  last_updated TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(resource_type, region, instance_type)
);

-- Enable RLS on all tables
ALTER TABLE public.diagrams ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.security_reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.resource_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ai_conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cost_estimates ENABLE ROW LEVEL SECURITY;

-- RLS Policies for diagrams
CREATE POLICY "Users can view their own diagrams" 
ON public.diagrams FOR SELECT 
USING (auth.uid() = user_id OR is_public = true);

CREATE POLICY "Users can create their own diagrams" 
ON public.diagrams FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own diagrams" 
ON public.diagrams FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own diagrams" 
ON public.diagrams FOR DELETE 
USING (auth.uid() = user_id);

-- RLS Policies for security_reports
CREATE POLICY "Users can view reports for their diagrams" 
ON public.security_reports FOR SELECT 
USING (EXISTS (
  SELECT 1 FROM public.diagrams 
  WHERE diagrams.id = security_reports.diagram_id 
  AND (diagrams.user_id = auth.uid() OR diagrams.is_public = true)
));

CREATE POLICY "Users can create reports for their diagrams" 
ON public.security_reports FOR INSERT 
WITH CHECK (EXISTS (
  SELECT 1 FROM public.diagrams 
  WHERE diagrams.id = security_reports.diagram_id 
  AND diagrams.user_id = auth.uid()
));

-- RLS Policies for resource_templates (public read, admin write)
CREATE POLICY "Anyone can view templates" 
ON public.resource_templates FOR SELECT 
USING (true);

-- RLS Policies for ai_conversations
CREATE POLICY "Users can view their own conversations" 
ON public.ai_conversations FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own conversations" 
ON public.ai_conversations FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own conversations" 
ON public.ai_conversations FOR UPDATE 
USING (auth.uid() = user_id);

-- RLS Policies for cost_estimates (public read)
CREATE POLICY "Anyone can view cost estimates" 
ON public.cost_estimates FOR SELECT 
USING (true);

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- Triggers for automatic timestamp updates
CREATE TRIGGER update_diagrams_updated_at
BEFORE UPDATE ON public.diagrams
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_ai_conversations_updated_at
BEFORE UPDATE ON public.ai_conversations
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Insert default cost estimates for common resources
INSERT INTO public.cost_estimates (resource_type, region, instance_type, hourly_cost, monthly_cost) VALUES
('ec2', 'us-east-1', 't3.micro', 0.0104, 7.59),
('ec2', 'us-east-1', 't3.small', 0.0208, 15.18),
('ec2', 'us-east-1', 't3.medium', 0.0416, 30.37),
('ec2', 'us-east-1', 't3.large', 0.0832, 60.74),
('ec2', 'us-east-1', 'm5.large', 0.096, 70.08),
('rds', 'us-east-1', 'db.t3.micro', 0.017, 12.41),
('rds', 'us-east-1', 'db.t3.small', 0.034, 24.82),
('rds', 'us-east-1', 'db.t3.medium', 0.068, 49.64),
('load_balancer', 'us-east-1', 'application', 0.0225, 16.43),
('nat_gateway', 'us-east-1', NULL, 0.045, 32.85),
('s3', 'us-east-1', 'standard', 0, 0.023),
('lambda', 'us-east-1', NULL, 0, 0),
('vpc', 'us-east-1', NULL, 0, 0),
('subnet', 'us-east-1', NULL, 0, 0),
('security_group', 'us-east-1', NULL, 0, 0),
('internet_gateway', 'us-east-1', NULL, 0, 0);