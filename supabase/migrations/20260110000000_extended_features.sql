-- GitOps & CI/CD Integration tables
CREATE TYPE git_provider AS ENUM ('github', 'gitlab', 'bitbucket');
CREATE TYPE cicd_platform AS ENUM ('github_actions', 'gitlab_ci', 'jenkins', 'azure_devops');
CREATE TYPE deployment_status AS ENUM ('pending', 'running', 'success', 'failed', 'cancelled');

-- Git repositories table
CREATE TABLE public.git_repositories (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    provider git_provider NOT NULL,
    repository_name TEXT NOT NULL,
    repository_url TEXT NOT NULL,
    access_token TEXT, -- encrypted
    branch TEXT DEFAULT 'main',
    is_connected BOOLEAN NOT NULL DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- CI/CD configurations table
CREATE TABLE public.cicd_configurations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    diagram_id UUID REFERENCES public.diagrams(id) ON DELETE CASCADE NOT NULL,
    git_repository_id UUID REFERENCES public.git_repositories(id) ON DELETE CASCADE,
    platform cicd_platform NOT NULL,
    config JSONB NOT NULL DEFAULT '{}'::jsonb,
    is_enabled BOOLEAN NOT NULL DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Deployment history table
CREATE TABLE public.deployments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    diagram_id UUID REFERENCES public.diagrams(id) ON DELETE CASCADE NOT NULL,
    cicd_config_id UUID REFERENCES public.cicd_configurations(id) ON DELETE SET NULL,
    status deployment_status NOT NULL DEFAULT 'pending',
    commit_hash TEXT,
    commit_message TEXT,
    deployment_url TEXT,
    logs TEXT,
    started_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    completed_at TIMESTAMP WITH TIME ZONE,
    created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL
);

-- Logic gates and circuit diagram components
CREATE TYPE logic_gate_type AS ENUM ('and', 'or', 'not', 'xor', 'nand', 'nor', 'xnor');
CREATE TYPE circuit_component_type AS ENUM ('logic_gate', 'input', 'output', 'wire', 'power', 'ground');

-- Circuit diagrams table
CREATE TABLE public.circuit_diagrams (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    team_id UUID REFERENCES public.teams(id) ON DELETE SET NULL,
    name TEXT NOT NULL DEFAULT 'Untitled Circuit',
    description TEXT,
    components JSONB NOT NULL DEFAULT '[]'::jsonb,
    connections JSONB NOT NULL DEFAULT '[]'::jsonb,
    is_public BOOLEAN NOT NULL DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- AI security threat detection findings
CREATE TABLE public.security_threats (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    diagram_id UUID REFERENCES public.diagrams(id) ON DELETE CASCADE NOT NULL,
    threat_type TEXT NOT NULL,
    severity security_severity NOT NULL,
    description TEXT NOT NULL,
    affected_resources JSONB NOT NULL DEFAULT '[]'::jsonb,
    mitigation_steps TEXT[],
    ai_confidence DECIMAL(3,2), -- 0.00 to 1.00
    is_resolved BOOLEAN NOT NULL DEFAULT false,
    detected_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    resolved_at TIMESTAMP WITH TIME ZONE
);

-- Enable RLS
ALTER TABLE public.git_repositories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cicd_configurations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.deployments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.circuit_diagrams ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.security_threats ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can manage their git repositories" ON public.git_repositories
    FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can view their cicd configurations" ON public.cicd_configurations
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.diagrams d 
            WHERE d.id = cicd_configurations.diagram_id 
            AND (d.user_id = auth.uid() OR EXISTS (
                SELECT 1 FROM public.team_members 
                WHERE team_id = d.team_id AND user_id = auth.uid()
            ))
        )
    );

CREATE POLICY "Users can manage their cicd configurations" ON public.cicd_configurations
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.diagrams d 
            WHERE d.id = cicd_configurations.diagram_id 
            AND d.user_id = auth.uid()
        )
    );

CREATE POLICY "Users can view deployment history" ON public.deployments
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.diagrams d 
            WHERE d.id = deployments.diagram_id 
            AND (d.user_id = auth.uid() OR EXISTS (
                SELECT 1 FROM public.team_members 
                WHERE team_id = d.team_id AND user_id = auth.uid()
            ))
        )
    );

CREATE POLICY "Users can create deployments" ON public.deployments
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.diagrams d 
            WHERE d.id = deployments.diagram_id 
            AND d.user_id = auth.uid()
        )
    );

CREATE POLICY "Users can manage their circuit diagrams" ON public.circuit_diagrams
    FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Team members can view team circuit diagrams" ON public.circuit_diagrams
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.team_members 
            WHERE team_id = circuit_diagrams.team_id AND user_id = auth.uid()
        )
    );

CREATE POLICY "Users can view security threats for their diagrams" ON public.security_threats
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.diagrams d 
            WHERE d.id = security_threats.diagram_id 
            AND (d.user_id = auth.uid() OR EXISTS (
                SELECT 1 FROM public.team_members 
                WHERE team_id = d.team_id AND user_id = auth.uid()
            ))
        )
    );

CREATE POLICY "Users can manage security threats for their diagrams" ON public.security_threats
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.diagrams d 
            WHERE d.id = security_threats.diagram_id 
            AND d.user_id = auth.uid()
        )
    );

-- Enable realtime for new tables
ALTER PUBLICATION supabase_realtime ADD TABLE public.deployments;
ALTER PUBLICATION supabase_realtime ADD TABLE public.circuit_diagrams;

-- Indexes for performance
CREATE INDEX idx_git_repositories_user_id ON public.git_repositories(user_id);
CREATE INDEX idx_cicd_configurations_diagram_id ON public.cicd_configurations(diagram_id);
CREATE INDEX idx_deployments_diagram_id ON public.deployments(diagram_id);
CREATE INDEX idx_circuit_diagrams_user_id ON public.circuit_diagrams(user_id);
CREATE INDEX idx_circuit_diagrams_team_id ON public.circuit_diagrams(team_id);
CREATE INDEX idx_security_threats_diagram_id ON public.security_threats(diagram_id);

-- Updated timestamp triggers
CREATE TRIGGER update_git_repositories_updated_at
    BEFORE UPDATE ON public.git_repositories
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_cicd_configurations_updated_at
    BEFORE UPDATE ON public.cicd_configurations
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_circuit_diagrams_updated_at
    BEFORE UPDATE ON public.circuit_diagrams
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
