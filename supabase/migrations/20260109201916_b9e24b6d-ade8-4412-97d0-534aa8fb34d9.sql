-- User roles enum
CREATE TYPE public.app_role AS ENUM ('admin', 'member', 'viewer');

-- User roles table for proper role management
CREATE TABLE public.user_roles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    role app_role NOT NULL DEFAULT 'member',
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    UNIQUE (user_id, role)
);
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- Security definer function for role checking
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role app_role)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = _user_id AND role = _role
  )
$$;

-- Profiles table for user data
CREATE TABLE public.profiles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL UNIQUE,
    display_name TEXT,
    avatar_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view all profiles" ON public.profiles
    FOR SELECT USING (true);
CREATE POLICY "Users can update own profile" ON public.profiles
    FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own profile" ON public.profiles
    FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Teams table for collaboration
CREATE TABLE public.teams (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    description TEXT,
    owner_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);
ALTER TABLE public.teams ENABLE ROW LEVEL SECURITY;

-- Team members table
CREATE TABLE public.team_members (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    team_id UUID REFERENCES public.teams(id) ON DELETE CASCADE NOT NULL,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    role app_role NOT NULL DEFAULT 'member',
    joined_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    UNIQUE (team_id, user_id)
);
ALTER TABLE public.team_members ENABLE ROW LEVEL SECURITY;

-- User diagrams table (update existing with team support)
ALTER TABLE public.diagrams 
    ADD COLUMN IF NOT EXISTS team_id UUID REFERENCES public.teams(id) ON DELETE SET NULL;

-- Create index for team diagrams
CREATE INDEX IF NOT EXISTS idx_diagrams_team_id ON public.diagrams(team_id);
CREATE INDEX IF NOT EXISTS idx_diagrams_user_id ON public.diagrams(user_id);

-- Team RLS policies
CREATE POLICY "Team owners can manage their teams" ON public.teams
    FOR ALL USING (auth.uid() = owner_id);
    
CREATE POLICY "Team members can view their teams" ON public.teams
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.team_members 
            WHERE team_id = teams.id AND user_id = auth.uid()
        )
    );

-- Team members RLS policies
CREATE POLICY "Team owners can manage members" ON public.team_members
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.teams 
            WHERE id = team_members.team_id AND owner_id = auth.uid()
        )
    );

CREATE POLICY "Users can view team members of their teams" ON public.team_members
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.team_members tm 
            WHERE tm.team_id = team_members.team_id AND tm.user_id = auth.uid()
        )
    );

-- Update diagrams RLS to include team access
DROP POLICY IF EXISTS "Users can view their own diagrams" ON public.diagrams;
DROP POLICY IF EXISTS "Users can create their own diagrams" ON public.diagrams;
DROP POLICY IF EXISTS "Users can update their own diagrams" ON public.diagrams;
DROP POLICY IF EXISTS "Users can delete their own diagrams" ON public.diagrams;

CREATE POLICY "Users can view own or team diagrams" ON public.diagrams
    FOR SELECT USING (
        auth.uid() = user_id 
        OR is_public = true
        OR EXISTS (
            SELECT 1 FROM public.team_members 
            WHERE team_id = diagrams.team_id AND user_id = auth.uid()
        )
    );

CREATE POLICY "Users can create diagrams" ON public.diagrams
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own or team diagrams" ON public.diagrams
    FOR UPDATE USING (
        auth.uid() = user_id
        OR EXISTS (
            SELECT 1 FROM public.team_members 
            WHERE team_id = diagrams.team_id 
            AND user_id = auth.uid() 
            AND role IN ('admin', 'member')
        )
    );

CREATE POLICY "Users can delete own diagrams" ON public.diagrams
    FOR DELETE USING (auth.uid() = user_id);

-- Real-time collaboration - presence and cursors
CREATE TABLE public.diagram_presence (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    diagram_id UUID REFERENCES public.diagrams(id) ON DELETE CASCADE NOT NULL,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    cursor_x REAL,
    cursor_y REAL,
    color TEXT DEFAULT '#FF6B00',
    last_seen TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    UNIQUE (diagram_id, user_id)
);
ALTER TABLE public.diagram_presence ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view presence on accessible diagrams" ON public.diagram_presence
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.diagrams d 
            WHERE d.id = diagram_presence.diagram_id 
            AND (d.user_id = auth.uid() OR d.is_public OR EXISTS (
                SELECT 1 FROM public.team_members WHERE team_id = d.team_id AND user_id = auth.uid()
            ))
        )
    );

CREATE POLICY "Users can manage own presence" ON public.diagram_presence
    FOR ALL USING (auth.uid() = user_id);

-- Enable realtime for collaboration
ALTER PUBLICATION supabase_realtime ADD TABLE public.diagram_presence;
ALTER PUBLICATION supabase_realtime ADD TABLE public.diagrams;

-- Trigger to create profile on user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.profiles (user_id, display_name)
    VALUES (NEW.id, COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.email));
    
    INSERT INTO public.user_roles (user_id, role)
    VALUES (NEW.id, 'member');
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Updated timestamps trigger
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

CREATE TRIGGER update_profiles_updated_at
    BEFORE UPDATE ON public.profiles
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_teams_updated_at
    BEFORE UPDATE ON public.teams
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();