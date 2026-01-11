import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  GitBranch, 
  Rocket, 
  CheckCircle, 
  XCircle, 
  Clock, 
  Loader2,
  Activity,
  AlertTriangle,
  Settings,
  Download,
  Play,
  Pause,
  RotateCcw
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Progress } from '@/components/ui/progress';
import { toast } from 'sonner';

interface GitRepository {
  id: string;
  user_id: string;
  provider: 'github' | 'gitlab' | 'bitbucket';
  repository_name: string;
  repository_url: string;
  branch: string;
  is_connected: boolean;
  created_at: string;
  updated_at: string;
}

interface CIConfiguration {
  id: string;
  diagram_id: string;
  git_repository_id: string;
  platform: 'github_actions' | 'gitlab_ci' | 'jenkins' | 'azure_devops';
  config: any;
  is_enabled: boolean;
  created_at: string;
  updated_at: string;
}

interface Deployment {
  id: string;
  ci_configuration_id: string;
  status: 'pending' | 'running' | 'success' | 'failed' | 'cancelled';
  commit_hash: string;
  commit_message: string;
  branch: string;
  started_at: string;
  completed_at?: string;
  logs: string[];
  environment: 'development' | 'staging' | 'production';
}

const statusIcons = {
  pending: Clock,
  running: Loader2,
  success: CheckCircle,
  failed: XCircle,
  cancelled: XCircle,
};

export default function CICDPage() {
  const [repositories, setRepositories] = useState<GitRepository[]>([]);
  const [configurations, setConfigurations] = useState<CIConfiguration[]>([]);
  const [deployments, setDeployments] = useState<Deployment[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // Load demo data
    loadDemoData();
  }, []);

  const loadDemoData = () => {
    setLoading(true);
    
    // Mock repositories
    const mockRepos: GitRepository[] = [
      {
        id: '1',
        user_id: 'demo-user',
        provider: 'github',
        repository_name: 'infra-viz-ai-demo',
        repository_url: 'https://github.com/demo/infra-viz-ai-demo',
        branch: 'main',
        is_connected: true,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      },
      {
        id: '2',
        user_id: 'demo-user',
        provider: 'gitlab',
        repository_name: 'infrastructure-as-code',
        repository_url: 'https://gitlab.com/demo/infrastructure-as-code',
        branch: 'main',
        is_connected: true,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      },
    ];

    // Mock CI configurations
    const mockConfigs: CIConfiguration[] = [
      {
        id: '1',
        diagram_id: 'demo-diagram',
        git_repository_id: '1',
        platform: 'github_actions',
        config: {
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
        is_enabled: true,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      },
    ];

    // Mock deployments
    const mockDeployments: Deployment[] = [
      {
        id: '1',
        ci_configuration_id: '1',
        status: 'success',
        commit_hash: 'abc123def456',
        commit_message: 'Update production infrastructure',
        branch: 'main',
        started_at: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
        completed_at: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString(),
        logs: [
          'Starting deployment...',
          'Running terraform init...',
          'Planning infrastructure changes...',
          'Applying changes...',
          'Deployment completed successfully!'
        ],
        environment: 'production',
      },
      {
        id: '2',
        ci_configuration_id: '1',
        status: 'running',
        commit_hash: 'def456ghi789',
        commit_message: 'Add new security group',
        branch: 'develop',
        started_at: new Date(Date.now() - 10 * 60 * 1000).toISOString(),
        logs: [
          'Starting deployment...',
          'Running terraform init...',
          'Planning infrastructure changes...',
        ],
        environment: 'staging',
      },
    ];

    setRepositories(mockRepos);
    setConfigurations(mockConfigs);
    setDeployments(mockDeployments);
    setLoading(false);
  };

  const triggerDeployment = (configId: string) => {
    const newDeployment: Deployment = {
      id: Date.now().toString(),
      ci_configuration_id: configId,
      status: 'pending',
      commit_hash: 'new' + Math.random().toString(36).substr(2, 9),
      commit_message: 'Manual deployment trigger',
      branch: 'main',
      started_at: new Date().toISOString(),
      logs: ['Deployment triggered...'],
      environment: 'production',
    };

    setDeployments([newDeployment, ...deployments]);
    toast.success('Deployment triggered!');

    // Simulate deployment progress
    setTimeout(() => {
      setDeployments(prev => prev.map(d => 
        d.id === newDeployment.id 
          ? { ...d, status: 'running', logs: [...d.logs, 'Running deployment...'] }
          : d
      ));
    }, 2000);

    setTimeout(() => {
      setDeployments(prev => prev.map(d => 
        d.id === newDeployment.id 
          ? { 
              ...d, 
              status: 'success', 
              logs: [...d.logs, 'Deployment completed successfully!'],
              completed_at: new Date().toISOString()
            }
          : d
      ));
      toast.success('Deployment completed!');
    }, 5000);
  };

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
                    <Button>
                      Connect Repository
                    </Button>
                  </CardContent>
                </Card>
              ) : (
                repositories.map((repo) => (
                  <Card key={repo.id}>
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="p-2 rounded-lg bg-primary/10">
                            <GitBranch className="h-5 w-5 text-primary" />
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
                ))
              )}
            </div>
          </TabsContent>

          <TabsContent value="configurations">
            <div className="grid gap-4">
              {configurations.length === 0 ? (
                <Card>
                  <CardContent className="flex flex-col items-center justify-center p-8">
                    <Rocket className="h-12 w-12 text-muted-foreground mb-4" />
                    <h3 className="text-lg font-semibold mb-2">No CI/CD configurations</h3>
                    <p className="text-muted-foreground text-center mb-4">
                      Create CI/CD configurations to automate your deployments
                    </p>
                    <Button>
                      Setup CI/CD
                    </Button>
                  </CardContent>
                </Card>
              ) : (
                configurations.map((config) => (
                  <Card key={config.id}>
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <div>
                          <CardTitle className="text-lg capitalize">
                            {config.platform.replace('_', ' ')}
                          </CardTitle>
                          <CardDescription>
                            Automated deployment configuration
                          </CardDescription>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge variant={config.is_enabled ? "default" : "secondary"}>
                            {config.is_enabled ? "Enabled" : "Disabled"}
                          </Badge>
                          <Button variant="outline" size="sm">
                            <Settings className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        <div className="p-4 bg-muted rounded-lg">
                          <pre className="text-xs overflow-x-auto">
                            {JSON.stringify(config.config, null, 2)}
                          </pre>
                        </div>
                        <div className="flex gap-2">
                          <Button 
                            onClick={() => triggerDeployment(config.id)}
                            className="gap-2"
                          >
                            <Play className="h-4 w-4" />
                            Deploy Now
                          </Button>
                          <Button variant="outline" className="gap-2">
                            <Download className="h-4 w-4" />
                            Export Config
                          </Button>
                        </div>
                      </div>
                    </CardContent>
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
                    <Activity className="h-12 w-12 text-muted-foreground mb-4" />
                    <h3 className="text-lg font-semibold mb-2">No deployments</h3>
                    <p className="text-muted-foreground text-center">
                      Deployment history will appear here
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
                            <div className="p-2 rounded-lg bg-primary/10">
                              <StatusIcon className={`h-5 w-5 ${
                                deployment.status === 'running' ? 'animate-spin' : ''
                              }`} />
                            </div>
                            <div>
                              <CardTitle className="text-lg">
                                Deployment to {deployment.environment}
                              </CardTitle>
                              <CardDescription>
                                {deployment.commit_message}
                              </CardDescription>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <Badge variant={
                              deployment.status === 'success' ? "default" :
                              deployment.status === 'failed' ? "destructive" :
                              deployment.status === 'running' ? "secondary" : "outline"
                            }>
                              {deployment.status}
                            </Badge>
                            <span className="text-sm text-muted-foreground">
                              {deployment.branch}
                            </span>
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-4">
                          <div className="flex items-center justify-between text-sm">
                            <span>Commit: {deployment.commit_hash.substring(0, 8)}</span>
                            <span>
                              Started: {new Date(deployment.started_at).toLocaleString()}
                            </span>
                          </div>
                          
                          {deployment.completed_at && (
                            <div className="text-sm text-muted-foreground">
                              Completed: {new Date(deployment.completed_at).toLocaleString()}
                            </div>
                          )}

                          {deployment.status === 'running' && (
                            <div className="space-y-2">
                              <div className="flex items-center gap-2">
                                <Loader2 className="h-4 w-4 animate-spin" />
                                <span className="text-sm">Deployment in progress...</span>
                              </div>
                              <Progress value={65} className="h-2" />
                            </div>
                          )}

                          <div className="space-y-2">
                            <h4 className="text-sm font-medium">Deployment Logs</h4>
                            <ScrollArea className="h-32 w-full rounded-md border p-3">
                              <div className="space-y-1">
                                {deployment.logs.map((log, index) => (
                                  <div key={index} className="text-xs font-mono">
                                    {log}
                                  </div>
                                ))}
                              </div>
                            </ScrollArea>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })
              )}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </motion.div>
  );
}
