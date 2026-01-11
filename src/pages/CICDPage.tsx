import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  GitBranch, 
  Github, 
  Gitlab, 
  Bitbucket, 
  Rocket, 
  History, 
  Settings, 
  Plus, 
  Trash2, 
  Play, 
  Pause, 
  CheckCircle, 
  XCircle, 
  Clock,
  Loader2,
  ExternalLink,
  Key,
  RefreshCw
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useEnhancedInfrastructure } from '@/contexts/EnhancedInfrastructureContext';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import type { GitRepository, CIConfiguration, Deployment, GitProvider, CIPlatform, DeploymentStatus } from '@/types/extended';

const providerIcons = {
  github: Github,
  gitlab: Gitlab,
  bitbucket: Bitbucket,
};

const statusColors: Record<DeploymentStatus, string> = {
  pending: 'bg-yellow-500',
  running: 'bg-blue-500',
  success: 'bg-green-500',
  failed: 'bg-red-500',
  cancelled: 'bg-gray-500',
};

const statusIcons: Record<DeploymentStatus, any> = {
  pending: Clock,
  running: Loader2,
  success: CheckCircle,
  failed: XCircle,
  cancelled: XCircle,
};

export default function CICDPage() {
  const { user } = useAuth();
  const { 
    state: { currentDiagram, ciConfigurations, deployments }, 
    createCIConfiguration, 
    triggerDeployment 
  } = useEnhancedInfrastructure();
  
  const [repositories, setRepositories] = useState<GitRepository[]>([]);
  const [selectedRepo, setSelectedRepo] = useState<GitRepository | null>(null);
  const [showCreateRepo, setShowCreateRepo] = useState(false);
  const [showCreateCI, setShowCreateCI] = useState(false);
  const [loading, setLoading] = useState(false);

  const [newRepo, setNewRepo] = useState({
    provider: 'github' as GitProvider,
    repository_name: '',
    repository_url: '',
    access_token: '',
    branch: 'main',
  });

  const [newCIConfig, setNewCIConfig] = useState({
    platform: 'github_actions' as CIPlatform,
    config: {},
  });

  useEffect(() => {
    if (user) {
      fetchRepositories();
    }
  }, [user]);

  const fetchRepositories = async () => {
    setLoading(true);
    try {
      // Mock data - replace with actual API call
      const mockRepos: GitRepository[] = [
        {
          id: '1',
          user_id: user?.id || '',
          provider: 'github',
          repository_name: 'infra-viz-ai-demo',
          repository_url: 'https://github.com/user/infra-viz-ai-demo',
          branch: 'main',
          is_connected: true,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        },
      ];
      setRepositories(mockRepos);
    } catch (error) {
      toast.error('Failed to fetch repositories');
    } finally {
      setLoading(false);
    }
  };

  const createRepository = async () => {
    if (!user || !newRepo.repository_name.trim()) return;

    try {
      // Mock API call
      const newRepository: GitRepository = {
        id: Date.now().toString(),
        user_id: user.id,
        ...newRepo,
        is_connected: true,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };

      setRepositories([...repositories, newRepository]);
      toast.success('Repository connected successfully!');
      setShowCreateRepo(false);
      setNewRepo({
        provider: 'github',
        repository_name: '',
        repository_url: '',
        access_token: '',
        branch: 'main',
      });
    } catch (error) {
      toast.error('Failed to connect repository');
    }
  };

  const createCIConfiguration = async () => {
    if (!currentDiagram || !selectedRepo) return;

    try {
      await createCIConfiguration({
        diagram_id: currentDiagram.id,
        git_repository_id: selectedRepo.id,
        platform: newCIConfig.platform,
        config: newCIConfig.config,
        is_enabled: true,
      });

      toast.success('CI/CD configuration created!');
      setShowCreateCI(false);
      setNewCIConfig({
        platform: 'github_actions',
        config: {},
      });
    } catch (error) {
      toast.error('Failed to create CI/CD configuration');
    }
  };

  const handleTriggerDeployment = async (ciConfigId: string) => {
    try {
      await triggerDeployment(ciConfigId);
      toast.success('Deployment triggered!');
    } catch (error) {
      toast.error('Failed to trigger deployment');
    }
  };

  const generateCIConfig = (platform: CIPlatform) => {
    const configs = {
      github_actions: {
        name: 'Deploy Infrastructure',
        on: {
          push: { branches: ['main'] },
        },
        jobs: {
          deploy: {
            'runs-on': 'ubuntu-latest',
            steps: [
              { uses: 'actions/checkout@v3' },
              {
                name: 'Setup Terraform',
                uses: 'hashicorp/setup-terraform@v2',
                with: { 'terraform_version': '1.3.0' },
              },
              {
                name: 'Terraform Init',
                run: 'terraform init',
              },
              {
                name: 'Terraform Plan',
                run: 'terraform plan -out=tfplan',
              },
              {
                name: 'Terraform Apply',
                run: 'terraform apply -auto-approve tfplan',
              },
            ],
          },
        },
      },
      gitlab_ci: {
        stages: ['build', 'deploy'],
        deploy: {
          stage: 'deploy',
          image: 'hashicorp/terraform:latest',
          script: [
            'terraform init',
            'terraform plan -out=tfplan',
            'terraform apply -auto-approve tfplan',
          ],
        },
      },
      jenkins: {
        pipeline: {
          agent: 'any',
          stages: [
            { name: 'Checkout', steps: [{ checkout: 'scm' }] },
            { name: 'Terraform Init', steps: [{ sh: 'terraform init' }] },
            { name: 'Terraform Plan', steps: [{ sh: 'terraform plan -out=tfplan' }] },
            { name: 'Terraform Apply', steps: [{ sh: 'terraform apply -auto-approve tfplan' }] },
          ],
        },
      },
    };

    setNewCIConfig({
      ...newCIConfig,
      config: configs[platform],
    });
  };

  if (!user) {
    return (
      <div className="min-h-[calc(100vh-3.5rem)] flex items-center justify-center">
        <Card className="max-w-md w-full mx-4">
          <CardHeader>
            <CardTitle>Sign in Required</CardTitle>
            <CardDescription>Please sign in to access CI/CD features.</CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={() => window.location.href = '/auth'} className="w-full">
              Sign In
            </Button>
          </CardContent>
        </Card>
      </div>
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="min-h-[calc(100vh-3.5rem)] p-6"
    >
      <div className="max-w-6xl mx-auto">
        <div className="mb-6">
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <GitBranch className="h-6 w-6 text-primary" />
            CI/CD Pipeline
          </h1>
          <p className="text-muted-foreground">
            Automated deployment and integration workflows
          </p>
        </div>
        
        <CICDPipeline />
      </div>
    </motion.div>
  );
}

// ... rest of the code remains the same ...
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Connect Git Repository</DialogTitle>
                  <DialogDescription>
                    Connect a Git repository to enable CI/CD automation
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4 py-4">
                  <div className="space-y-2">
                    <Label>Provider</Label>
                    <Select 
                      value={newRepo.provider} 
                      onValueChange={(value: GitProvider) => setNewRepo({ ...newRepo, provider: value })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="github">GitHub</SelectItem>
                        <SelectItem value="gitlab">GitLab</SelectItem>
                        <SelectItem value="bitbucket">Bitbucket</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Repository Name</Label>
                    <Input
                      value={newRepo.repository_name}
                      onChange={(e) => setNewRepo({ ...newRepo, repository_name: e.target.value })}
                      placeholder="my-infrastructure"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Repository URL</Label>
                    <Input
                      value={newRepo.repository_url}
                      onChange={(e) => setNewRepo({ ...newRepo, repository_url: e.target.value })}
                      placeholder="https://github.com/user/repo"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Access Token</Label>
                    <Input
                      type="password"
                      value={newRepo.access_token}
                      onChange={(e) => setNewRepo({ ...newRepo, access_token: e.target.value })}
                      placeholder="Personal access token"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Default Branch</Label>
                    <Input
                      value={newRepo.branch}
                      onChange={(e) => setNewRepo({ ...newRepo, branch: e.target.value })}
                      placeholder="main"
                    />
                  </div>
                </div>
                <Button onClick={createRepository} className="w-full">
                  Connect Repository
                </Button>
              </DialogContent>
            </Dialog>

            {currentDiagram && (
              <Dialog open={showCreateCI} onOpenChange={setShowCreateCI}>
                <DialogTrigger asChild>
                  <Button className="gap-2">
                    <Rocket className="h-4 w-4" />
                    Setup CI/CD
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-2xl">
                  <DialogHeader>
                    <DialogTitle>Setup CI/CD Pipeline</DialogTitle>
                    <DialogDescription>
                      Configure automated deployment for your infrastructure
                    </DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4 py-4">
                    <div className="space-y-2">
                      <Label>Repository</Label>
                      <Select value={selectedRepo?.id || ''} onValueChange={(value) => {
                        const repo = repositories.find(r => r.id === value);
                        setSelectedRepo(repo || null);
                      }}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select a repository" />
                        </SelectTrigger>
                        <SelectContent>
                          {repositories.map((repo) => (
                            <SelectItem key={repo.id} value={repo.id}>
                              <div className="flex items-center gap-2">
                                {React.createElement(providerIcons[repo.provider], { className: "h-4 w-4" })}
                                {repo.repository_name}
                              </div>
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label>CI/CD Platform</Label>
                      <Select 
                        value={newCIConfig.platform} 
                        onValueChange={(value: CIPlatform) => {
                          setNewCIConfig({ ...newCIConfig, platform: value });
                          generateCIConfig(value);
                        }}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="github_actions">GitHub Actions</SelectItem>
                          <SelectItem value="gitlab_ci">GitLab CI</SelectItem>
                          <SelectItem value="jenkins">Jenkins</SelectItem>
                          <SelectItem value="azure_devops">Azure DevOps</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label>Configuration</Label>
                      <Textarea
                        value={JSON.stringify(newCIConfig.config, null, 2)}
                        onChange={(e) => {
                          try {
                            const config = JSON.parse(e.target.value);
                            setNewCIConfig({ ...newCIConfig, config });
                          } catch (error) {
                            // Invalid JSON, ignore
                          }
                        }}
                        className="font-mono text-xs min-h-[200px]"
                      />
                    </div>
                  </div>
                  <Button onClick={createCIConfiguration} className="w-full" disabled={!selectedRepo}>
                    Setup CI/CD
                  </Button>
                </DialogContent>
              </Dialog>
            )}
          </div>
        </motion.div>

        <Tabs defaultValue="repositories" className="space-y-6">
          <TabsList>
            <TabsTrigger value="repositories">Repositories</TabsTrigger>
            <TabsTrigger value="configurations">CI/CD Configurations</TabsTrigger>
            <TabsTrigger value="deployments">Deployments</TabsTrigger>
          </TabsList>

          <TabsContent value="repositories">
            <div className="grid gap-4">
              {loading ? (
                <div className="flex items-center justify-center p-8">
                  <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                </div>
              ) : repositories.length === 0 ? (
                <Card>
                  <CardContent className="flex flex-col items-center justify-center p-8">
                    <GitBranch className="h-12 w-12 text-muted-foreground mb-4" />
                    <h3 className="text-lg font-semibold mb-2">No repositories connected</h3>
                    <p className="text-muted-foreground text-center mb-4">
                      Connect a Git repository to start automating your infrastructure deployments
                    </p>
                    <Button onClick={() => setShowCreateRepo(true)}>
                      Connect Repository
                    </Button>
                  </CardContent>
                </Card>
              ) : (
                repositories.map((repo) => {
                  const IconComponent = providerIcons[repo.provider];
                  return (
                    <Card key={repo.id}>
                      <CardHeader>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div className="p-2 rounded-lg bg-primary/10">
                              <IconComponent className="h-5 w-5 text-primary" />
                            </div>
                            <div>
                              <CardTitle className="text-lg">{repo.repository_name}</CardTitle>
                              <CardDescription>{repo.repository_url}</CardDescription>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <Badge variant={repo.is_connected ? "default" : "secondary"}>
                              {repo.is_connected ? "Connected" : "Disconnected"}
                            </Badge>
                            <Button variant="ghost" size="sm">
                              <Settings className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <div className="flex items-center justify-between text-sm text-muted-foreground">
                          <span>Branch: {repo.branch}</span>
                          <span>Connected: {new Date(repo.created_at).toLocaleDateString()}</span>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })
              )}
            </div>
          </TabsContent>

          <TabsContent value="configurations">
            <div className="grid gap-4">
              {ciConfigurations.length === 0 ? (
                <Card>
                  <CardContent className="flex flex-col items-center justify-center p-8">
                    <Settings className="h-12 w-12 text-muted-foreground mb-4" />
                    <h3 className="text-lg font-semibold mb-2">No CI/CD configurations</h3>
                    <p className="text-muted-foreground text-center mb-4">
                      Setup CI/CD pipelines to automate your infrastructure deployments
                    </p>
                    <Button onClick={() => setShowCreateCI(true)} disabled={!currentDiagram}>
                      Setup CI/CD
                    </Button>
                  </CardContent>
                </Card>
              ) : (
                ciConfigurations.map((config) => (
                  <Card key={config.id}>
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <div>
                          <CardTitle className="text-lg capitalize">
                            {config.platform.replace('_', ' ')}
                          </CardTitle>
                          <CardDescription>
                            Automated deployment for infrastructure
                          </CardDescription>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge variant={config.is_enabled ? "default" : "secondary"}>
                            {config.is_enabled ? "Enabled" : "Disabled"}
                          </Badge>
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => handleTriggerDeployment(config.id)}
                          >
                            <Play className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </CardHeader>
                  </Card>
                ))
              )}
            </div>
          </TabsContent>

          <TabsContent value="deployments">
            <div className="grid gap-4">
              {deployments.length === 0 ? (
                <Card>
                  <CardContent className="flex flex-col items-center justify-center p-8">
                    <History className="h-12 w-12 text-muted-foreground mb-4" />
                    <h3 className="text-lg font-semibold mb-2">No deployments yet</h3>
                    <p className="text-muted-foreground text-center">
                      Trigger a deployment to see the history
                    </p>
                  </CardContent>
                </Card>
              ) : (
                deployments.map((deployment) => {
                  const StatusIcon = statusIcons[deployment.status];
                  return (
                    <Card key={deployment.id}>
                      <CardHeader>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div className={`p-2 rounded-lg ${statusColors[deployment.status]}/10`}>
                              <StatusIcon className={`h-5 w-5 ${statusColors[deployment.status].replace('bg-', 'text-')}`} />
                            </div>
                            <div>
                              <CardTitle className="text-lg capitalize">
                                {deployment.status}
                              </CardTitle>
                              <CardDescription>
                                {deployment.commit_message || 'No commit message'}
                              </CardDescription>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <Badge variant="outline">
                              {deployment.commit_hash?.substring(0, 7) || 'N/A'}
                            </Badge>
                            {deployment.deployment_url && (
                              <Button variant="ghost" size="sm" asChild>
                                <a href={deployment.deployment_url} target="_blank" rel="noopener noreferrer">
                                  <ExternalLink className="h-4 w-4" />
                                </a>
                              </Button>
                            )}
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <div className="flex items-center justify-between text-sm text-muted-foreground">
                          <span>Started: {new Date(deployment.started_at).toLocaleString()}</span>
                          {deployment.completed_at && (
                            <span>Completed: {new Date(deployment.completed_at).toLocaleString()}</span>
                          )}
                        </div>
                        {deployment.logs && (
                          <div className="mt-2">
                            <ScrollArea className="h-20 w-full rounded-md border p-2">
                              <pre className="text-xs font-mono">{deployment.logs}</pre>
                            </ScrollArea>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  );
                })
              )}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
