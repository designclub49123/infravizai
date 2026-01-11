import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Users, 
  Plus, 
  Settings, 
  Mail, 
  Crown, 
  User, 
  Shield,
  Activity,
  Calendar,
  Search,
  Filter,
  MoreHorizontal,
  Copy,
  Trash2,
  Edit
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { toast } from 'sonner';

interface Team {
  id: string;
  name: string;
  description: string;
  created_by: string;
  created_at: string;
  member_count: number;
  project_count: number;
  is_active: boolean;
}

interface TeamMember {
  id: string;
  team_id: string;
  user_id: string;
  role: 'owner' | 'admin' | 'member' | 'viewer';
  email: string;
  name: string;
  avatar?: string;
  joined_at: string;
  last_active: string;
}

interface TeamActivity {
  id: string;
  team_id: string;
  user_id: string;
  user_name: string;
  action: string;
  resource: string;
  timestamp: string;
  details?: string;
}

export default function TeamsPage() {
  const [teams, setTeams] = useState<Team[]>([]);
  const [selectedTeam, setSelectedTeam] = useState<Team | null>(null);
  const [members, setMembers] = useState<TeamMember[]>([]);
  const [activities, setActivities] = useState<TeamActivity[]>([]);
  const [loading, setLoading] = useState(false);
  const [showCreateTeam, setShowCreateTeam] = useState(false);
  const [showInviteMember, setShowInviteMember] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterRole, setFilterRole] = useState('all');

  const [newTeam, setNewTeam] = useState({
    name: '',
    description: '',
  });

  const [newMember, setNewMember] = useState({
    email: '',
    role: 'member' as 'admin' | 'member' | 'viewer',
  });

  useEffect(() => {
    loadDemoData();
  }, []);

  const loadDemoData = () => {
    setLoading(true);

    // Mock teams
    const mockTeams: Team[] = [
      {
        id: '1',
        name: 'Infrastructure Team',
        description: 'Manages cloud infrastructure and deployments',
        created_by: 'demo-user',
        created_at: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
        member_count: 5,
        project_count: 12,
        is_active: true,
      },
      {
        id: '2',
        name: 'DevOps Team',
        description: 'Handles CI/CD pipelines and automation',
        created_by: 'demo-user',
        created_at: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000).toISOString(),
        member_count: 3,
        project_count: 8,
        is_active: true,
      },
      {
        id: '3',
        name: 'Security Team',
        description: 'Security and compliance management',
        created_by: 'demo-user',
        created_at: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString(),
        member_count: 4,
        project_count: 6,
        is_active: false,
      },
    ];

    // Mock team members
    const mockMembers: TeamMember[] = [
      {
        id: '1',
        team_id: '1',
        user_id: 'user-1',
        role: 'owner',
        email: 'john.doe@company.com',
        name: 'John Doe',
        avatar: '/avatars/john.jpg',
        joined_at: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
        last_active: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
      },
      {
        id: '2',
        team_id: '1',
        user_id: 'user-2',
        role: 'admin',
        email: 'jane.smith@company.com',
        name: 'Jane Smith',
        avatar: '/avatars/jane.jpg',
        joined_at: new Date(Date.now() - 25 * 24 * 60 * 60 * 1000).toISOString(),
        last_active: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString(),
      },
      {
        id: '3',
        team_id: '1',
        user_id: 'user-3',
        role: 'member',
        email: 'bob.wilson@company.com',
        name: 'Bob Wilson',
        joined_at: new Date(Date.now() - 20 * 24 * 60 * 60 * 1000).toISOString(),
        last_active: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
      },
    ];

    // Mock team activities
    const mockActivities: TeamActivity[] = [
      {
        id: '1',
        team_id: '1',
        user_id: 'user-1',
        user_name: 'John Doe',
        action: 'created',
        resource: 'VPC Configuration',
        timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
        details: 'Created new VPC in us-east-1',
      },
      {
        id: '2',
        team_id: '1',
        user_id: 'user-2',
        user_name: 'Jane Smith',
        action: 'updated',
        resource: 'Security Group',
        timestamp: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(),
        details: 'Updated inbound rules for web access',
      },
      {
        id: '3',
        team_id: '1',
        user_id: 'user-3',
        user_name: 'Bob Wilson',
        action: 'deployed',
        resource: 'Production Infrastructure',
        timestamp: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString(),
        details: 'Deployed changes to production environment',
      },
    ];

    setTeams(mockTeams);
    setMembers(mockMembers);
    setActivities(mockActivities);
    setLoading(false);
  };

  const createTeam = () => {
    if (!newTeam.name.trim()) return;

    const team: Team = {
      id: Date.now().toString(),
      name: newTeam.name,
      description: newTeam.description,
      created_by: 'demo-user',
      created_at: new Date().toISOString(),
      member_count: 1,
      project_count: 0,
      is_active: true,
    };

    setTeams([...teams, team]);
    setShowCreateTeam(false);
    setNewTeam({ name: '', description: '' });
    toast.success('Team created successfully!');
  };

  const inviteMember = () => {
    if (!newMember.email.trim() || !selectedTeam) return;

    const member: TeamMember = {
      id: Date.now().toString(),
      team_id: selectedTeam.id,
      user_id: 'new-user',
      role: newMember.role,
      email: newMember.email,
      name: newMember.email.split('@')[0],
      joined_at: new Date().toISOString(),
      last_active: new Date().toISOString(),
    };

    setMembers([...members, member]);
    setShowInviteMember(false);
    setNewMember({ email: '', role: 'member' });
    toast.success('Member invited successfully!');
  };

  const filteredMembers = members.filter(member => 
    member.team_id === selectedTeam?.id &&
    (filterRole === 'all' || member.role === filterRole) &&
    (member.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
     member.email.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const getRoleIcon = (role: string) => {
    switch (role) {
      case 'owner': return <Crown className="h-4 w-4" />;
      case 'admin': return <Shield className="h-4 w-4" />;
      default: return <User className="h-4 w-4" />;
    }
  };

  const getRoleBadgeVariant = (role: string) => {
    switch (role) {
      case 'owner': return 'default';
      case 'admin': return 'secondary';
      default: return 'outline';
    }
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
            <Users className="h-6 w-6 text-primary" />
            Team Collaboration
          </h1>
          <p className="text-muted-foreground">
            Manage teams, members, and collaborate on infrastructure projects
          </p>
        </div>

        <Tabs defaultValue="teams" className="space-y-6">
          <TabsList>
            <TabsTrigger value="teams">Teams</TabsTrigger>
            <TabsTrigger value="members">Members</TabsTrigger>
            <TabsTrigger value="activity">Activity</TabsTrigger>
          </TabsList>

          <TabsContent value="teams">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-lg font-semibold">Your Teams</h2>
              <Dialog open={showCreateTeam} onOpenChange={setShowCreateTeam}>
                <DialogTrigger asChild>
                  <Button className="gap-2">
                    <Plus className="h-4 w-4" />
                    Create Team
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Create New Team</DialogTitle>
                    <DialogDescription>
                      Create a new team to collaborate on infrastructure projects
                    </DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4 py-4">
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Team Name</label>
                      <Input
                        value={newTeam.name}
                        onChange={(e) => setNewTeam({ ...newTeam, name: e.target.value })}
                        placeholder="Infrastructure Team"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Description</label>
                      <Input
                        value={newTeam.description}
                        onChange={(e) => setNewTeam({ ...newTeam, description: e.target.value })}
                        placeholder="Team description..."
                      />
                    </div>
                    <Button onClick={createTeam} className="w-full">
                      Create Team
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>
            </div>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {teams.map((team) => (
                <Card 
                  key={team.id} 
                  className="cursor-pointer hover:shadow-md transition-shadow"
                  onClick={() => setSelectedTeam(team)}
                >
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                          <Users className="h-5 w-5 text-primary" />
                        </div>
                        <div>
                          <CardTitle className="text-lg">{team.name}</CardTitle>
                          <CardDescription>{team.description}</CardDescription>
                        </div>
                      </div>
                      <Badge variant={team.is_active ? "default" : "secondary"}>
                        {team.is_active ? "Active" : "Inactive"}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="flex justify-between text-sm text-muted-foreground">
                      <span>{team.member_count} members</span>
                      <span>{team.project_count} projects</span>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="members">
            {!selectedTeam ? (
              <div className="text-center py-8">
                <p className="text-muted-foreground">Select a team to view members</p>
              </div>
            ) : (
              <div className="space-y-6">
                <div className="flex justify-between items-center">
                  <h2 className="text-lg font-semibold">
                    {selectedTeam?.name} Members
                  </h2>
                  <div className="flex gap-2">
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input
                        placeholder="Search members..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-10 w-64"
                      />
                    </div>
                    <Select value={filterRole} onValueChange={setFilterRole}>
                      <SelectTrigger className="w-32">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Roles</SelectItem>
                        <SelectItem value="owner">Owner</SelectItem>
                        <SelectItem value="admin">Admin</SelectItem>
                        <SelectItem value="member">Member</SelectItem>
                        <SelectItem value="viewer">Viewer</SelectItem>
                      </SelectContent>
                    </Select>
                    <Dialog open={showInviteMember} onOpenChange={setShowInviteMember}>
                      <DialogTrigger asChild>
                        <Button className="gap-2">
                          <Plus className="h-4 w-4" />
                          Invite Member
                        </Button>
                      </DialogTrigger>
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>Invite Team Member</DialogTitle>
                          <DialogDescription>
                            Invite a new member to {selectedTeam?.name}
                          </DialogDescription>
                        </DialogHeader>
                        <div className="space-y-4 py-4">
                          <div className="space-y-2">
                            <label className="text-sm font-medium">Email Address</label>
                            <Input
                              type="email"
                              value={newMember.email}
                              onChange={(e) => setNewMember({ ...newMember, email: e.target.value })}
                              placeholder="colleague@company.com"
                            />
                          </div>
                          <div className="space-y-2">
                            <label className="text-sm font-medium">Role</label>
                            <Select 
                              value={newMember.role} 
                              onValueChange={(value: 'admin' | 'member' | 'viewer') => 
                                setNewMember({ ...newMember, role: value })
                              }
                            >
                              <SelectTrigger>
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="admin">Admin</SelectItem>
                                <SelectItem value="member">Member</SelectItem>
                                <SelectItem value="viewer">Viewer</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                          <Button onClick={inviteMember} className="w-full">
                            Send Invitation
                          </Button>
                        </div>
                      </DialogContent>
                    </Dialog>
                  </div>
                </div>

                <div className="grid gap-4">
                  {filteredMembers.map((member) => (
                    <Card key={member.id}>
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <Avatar>
                              <AvatarImage src={member.avatar} />
                              <AvatarFallback>
                                {member.name.split(' ').map(n => n[0]).join('').toUpperCase()}
                              </AvatarFallback>
                            </Avatar>
                            <div>
                              <p className="font-medium">{member.name}</p>
                              <p className="text-sm text-muted-foreground">{member.email}</p>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <Badge variant={getRoleBadgeVariant(member.role)} className="gap-1">
                              {getRoleIcon(member.role)}
                              {member.role}
                            </Badge>
                            <Button variant="ghost" size="sm">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                        <div className="mt-3 text-xs text-muted-foreground">
                          Joined {new Date(member.joined_at).toLocaleDateString()}
                          {member.last_active && (
                            <span> • Last active {new Date(member.last_active).toLocaleDateString()}</span>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            )}
          </TabsContent>

          <TabsContent value="activity">
            <div className="space-y-6">
              <h2 className="text-lg font-semibold">Recent Activity</h2>
              <div className="grid gap-4">
                {activities.map((activity) => (
                  <Card key={activity.id}>
                    <CardContent className="p-4">
                      <div className="flex items-start gap-3">
                        <Avatar className="h-8 w-8">
                          <AvatarFallback>
                            {activity.user_name.split(' ').map(n => n[0]).join('').toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <p className="font-medium">{activity.user_name}</p>
                            <Badge variant="outline" className="gap-1">
                              <Activity className="h-3 w-3" />
                              {activity.action}
                            </Badge>
                          </div>
                          <p className="text-sm text-muted-foreground mb-1">
                            {activity.details}
                          </p>
                          <div className="flex items-center gap-2 text-xs text-muted-foreground">
                            <Calendar className="h-3 w-3" />
                            {new Date(activity.timestamp).toLocaleString()}
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </motion.div>
  );
}
