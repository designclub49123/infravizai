import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Users, Plus, Settings, UserPlus, Trash2, Crown, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface Team {
  id: string;
  name: string;
  description: string | null;
  owner_id: string;
  created_at: string;
}

interface TeamMember {
  id: string;
  user_id: string;
  role: string;
  joined_at: string;
  profile?: {
    display_name: string | null;
  };
}

export default function TeamsPage() {
  const { user } = useAuth();
  const [teams, setTeams] = useState<Team[]>([]);
  const [selectedTeam, setSelectedTeam] = useState<Team | null>(null);
  const [members, setMembers] = useState<TeamMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [createOpen, setCreateOpen] = useState(false);
  const [inviteOpen, setInviteOpen] = useState(false);
  const [newTeam, setNewTeam] = useState({ name: '', description: '' });
  const [inviteEmail, setInviteEmail] = useState('');

  useEffect(() => {
    if (user) fetchTeams();
  }, [user]);

  useEffect(() => {
    if (selectedTeam) fetchMembers(selectedTeam.id);
  }, [selectedTeam]);

  const fetchTeams = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('teams')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (!error && data) {
      setTeams(data);
      if (data.length > 0 && !selectedTeam) {
        setSelectedTeam(data[0]);
      }
    }
    setLoading(false);
  };

  const fetchMembers = async (teamId: string) => {
    const { data, error } = await supabase
      .from('team_members')
      .select(`
        id,
        user_id,
        role,
        joined_at
      `)
      .eq('team_id', teamId);
    
    if (!error && data) {
      // Fetch profiles for each member
      const memberIds = data.map(m => m.user_id);
      const { data: profiles } = await supabase
        .from('profiles')
        .select('user_id, display_name')
        .in('user_id', memberIds);
      
      const membersWithProfiles = data.map(m => ({
        ...m,
        profile: profiles?.find(p => p.user_id === m.user_id),
      }));
      
      setMembers(membersWithProfiles);
    }
  };

  const createTeam = async () => {
    if (!user || !newTeam.name.trim()) return;

    const { data, error } = await supabase
      .from('teams')
      .insert({
        name: newTeam.name,
        description: newTeam.description || null,
        owner_id: user.id,
      })
      .select()
      .single();

    if (error) {
      toast.error('Failed to create team');
      return;
    }

    // Add owner as admin member
    await supabase.from('team_members').insert({
      team_id: data.id,
      user_id: user.id,
      role: 'admin',
    });

    toast.success('Team created!');
    setTeams([data, ...teams]);
    setSelectedTeam(data);
    setCreateOpen(false);
    setNewTeam({ name: '', description: '' });
  };

  const inviteMember = async () => {
    if (!selectedTeam || !inviteEmail.trim()) return;

    // In a real app, you'd send an invite email
    // For now, we'll look up the user by email
    toast.info('Team invites would be sent via email in production');
    setInviteOpen(false);
    setInviteEmail('');
  };

  const removeMember = async (memberId: string) => {
    const { error } = await supabase
      .from('team_members')
      .delete()
      .eq('id', memberId);

    if (!error) {
      setMembers(members.filter(m => m.id !== memberId));
      toast.success('Member removed');
    }
  };

  if (!user) {
    return (
      <div className="min-h-[calc(100vh-3.5rem)] flex items-center justify-center">
        <Card className="max-w-md w-full mx-4">
          <CardHeader>
            <CardTitle>Sign in Required</CardTitle>
            <CardDescription>Please sign in to access team collaboration features.</CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={() => window.location.href = '/auth'} className="w-full">
              Sign In
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-[calc(100vh-3.5rem)] p-4 md:p-8">
      <div className="max-w-6xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center justify-between mb-6"
        >
          <div>
            <h1 className="text-2xl font-bold flex items-center gap-2">
              <Users className="h-6 w-6 text-primary" />
              Teams
            </h1>
            <p className="text-muted-foreground">Collaborate on infrastructure diagrams</p>
          </div>

          <Dialog open={createOpen} onOpenChange={setCreateOpen}>
            <DialogTrigger asChild>
              <Button className="gap-2">
                <Plus className="h-4 w-4" />
                Create Team
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Create a Team</DialogTitle>
                <DialogDescription>
                  Create a team to collaborate on infrastructure diagrams with others.
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label>Team Name</Label>
                  <Input
                    value={newTeam.name}
                    onChange={(e) => setNewTeam({ ...newTeam, name: e.target.value })}
                    placeholder="My Team"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Description (optional)</Label>
                  <Input
                    value={newTeam.description}
                    onChange={(e) => setNewTeam({ ...newTeam, description: e.target.value })}
                    placeholder="Team description..."
                  />
                </div>
              </div>
              <Button onClick={createTeam} className="w-full">Create Team</Button>
            </DialogContent>
          </Dialog>
        </motion.div>

        <div className="grid md:grid-cols-3 gap-6">
          {/* Teams List */}
          <Card className="md:col-span-1">
            <CardHeader>
              <CardTitle className="text-lg">Your Teams</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <ScrollArea className="h-[400px]">
                {loading ? (
                  <div className="flex items-center justify-center p-8">
                    <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                  </div>
                ) : teams.length === 0 ? (
                  <div className="text-center p-8 text-muted-foreground">
                    <Users className="h-8 w-8 mx-auto mb-2 opacity-50" />
                    <p>No teams yet</p>
                  </div>
                ) : (
                  <div className="divide-y">
                    {teams.map((team) => (
                      <button
                        key={team.id}
                        onClick={() => setSelectedTeam(team)}
                        className={`w-full p-4 text-left hover:bg-muted/50 transition-colors ${
                          selectedTeam?.id === team.id ? 'bg-muted' : ''
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                            <Users className="h-5 w-5 text-primary" />
                          </div>
                          <div>
                            <p className="font-medium">{team.name}</p>
                            {team.owner_id === user.id && (
                              <Badge variant="secondary" className="text-xs">Owner</Badge>
                            )}
                          </div>
                        </div>
                      </button>
                    ))}
                  </div>
                )}
              </ScrollArea>
            </CardContent>
          </Card>

          {/* Team Details */}
          <Card className="md:col-span-2">
            {selectedTeam ? (
              <>
                <CardHeader className="flex flex-row items-center justify-between">
                  <div>
                    <CardTitle>{selectedTeam.name}</CardTitle>
                    <CardDescription>{selectedTeam.description || 'No description'}</CardDescription>
                  </div>
                  <div className="flex gap-2">
                    <Dialog open={inviteOpen} onOpenChange={setInviteOpen}>
                      <DialogTrigger asChild>
                        <Button variant="outline" size="sm" className="gap-2">
                          <UserPlus className="h-4 w-4" />
                          Invite
                        </Button>
                      </DialogTrigger>
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>Invite Team Member</DialogTitle>
                          <DialogDescription>
                            Invite someone to collaborate on this team's diagrams.
                          </DialogDescription>
                        </DialogHeader>
                        <div className="space-y-4 py-4">
                          <div className="space-y-2">
                            <Label>Email Address</Label>
                            <Input
                              type="email"
                              value={inviteEmail}
                              onChange={(e) => setInviteEmail(e.target.value)}
                              placeholder="colleague@example.com"
                            />
                          </div>
                        </div>
                        <Button onClick={inviteMember} className="w-full">Send Invite</Button>
                      </DialogContent>
                    </Dialog>
                  </div>
                </CardHeader>
                <CardContent>
                  <h4 className="font-medium mb-4">Team Members</h4>
                  <div className="space-y-3">
                    {members.map((member) => (
                      <div
                        key={member.id}
                        className="flex items-center justify-between p-3 rounded-lg bg-muted/50"
                      >
                        <div className="flex items-center gap-3">
                          <Avatar>
                            <AvatarFallback>
                              {(member.profile?.display_name || 'U')[0].toUpperCase()}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="font-medium">
                              {member.profile?.display_name || 'Unknown User'}
                            </p>
                            <div className="flex items-center gap-2">
                              <Badge variant="outline" className="text-xs">{member.role}</Badge>
                              {member.user_id === selectedTeam.owner_id && (
                                <Crown className="h-3 w-3 text-warning" />
                              )}
                            </div>
                          </div>
                        </div>
                        {selectedTeam.owner_id === user.id && member.user_id !== user.id && (
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => removeMember(member.id)}
                          >
                            <Trash2 className="h-4 w-4 text-destructive" />
                          </Button>
                        )}
                      </div>
                    ))}
                  </div>
                </CardContent>
              </>
            ) : (
              <div className="flex items-center justify-center h-full min-h-[400px]">
                <div className="text-center text-muted-foreground">
                  <Settings className="h-12 w-12 mx-auto mb-3 opacity-50" />
                  <p>Select a team to view details</p>
                </div>
              </div>
            )}
          </Card>
        </div>
      </div>
    </div>
  );
}
