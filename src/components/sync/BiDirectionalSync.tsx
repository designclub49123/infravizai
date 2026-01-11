import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Sync, 
  ArrowUpDown, 
  CheckCircle, 
  AlertCircle, 
  RefreshCw, 
  Settings, 
  Eye, 
  Edit,
  Save,
  Undo,
  Redo,
  GitBranch,
  FileText,
  Layers,
  Activity,
  Clock,
  Zap
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';
import { useEnhancedInfrastructure } from '@/contexts/EnhancedInfrastructureContext';
import { toast } from 'sonner';
import type { InfraGraph, IaCOutput } from '@/types/infrastructure';

interface SyncEvent {
  id: string;
  timestamp: Date;
  type: 'diagram_to_code' | 'code_to_diagram' | 'manual_sync';
  source: string;
  target: string;
  changes: string[];
  status: 'pending' | 'success' | 'error';
  error?: string;
}

interface SyncSettings {
  autoSync: boolean;
  syncInterval: number; // seconds
  conflictResolution: 'diagram_wins' | 'code_wins' | 'manual';
  showNotifications: boolean;
  enableHistory: boolean;
}

export function BiDirectionalSync() {
  const { state: { currentDiagram }, setGraph, createDiagram } = useEnhancedInfrastructure();
  const [syncEvents, setSyncEvents] = useState<SyncEvent[]>([]);
  const [isSyncing, setIsSyncing] = useState(false);
  const [lastSyncTime, setLastSyncTime] = useState<Date | null>(null);
  const [syncSettings, setSyncSettings] = useState<SyncSettings>({
    autoSync: true,
    syncInterval: 30,
    conflictResolution: 'diagram_wins',
    showNotifications: true,
    enableHistory: true
  });
  const [codeEditor, setCodeEditor] = useState('');
  const [diagramEditor, setDiagramEditor] = useState('');
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    // Load initial demo data
    loadDemoSyncEvents();
    
    // Set up auto-sync if enabled
    if (syncSettings.autoSync) {
      const interval = setInterval(() => {
        performAutoSync();
      }, syncSettings.syncInterval * 1000);
      
      return () => clearInterval(interval);
    }
  }, [syncSettings.autoSync, syncSettings.syncInterval]);

  const loadDemoSyncEvents = () => {
    const demoEvents: SyncEvent[] = [
      {
        id: '1',
        timestamp: new Date(Date.now() - 5 * 60 * 1000),
        type: 'diagram_to_code',
        source: 'Diagram Editor',
        target: 'Terraform Code',
        changes: ['Added new EC2 instance', 'Updated security group rules'],
        status: 'success'
      },
      {
        id: '2',
        timestamp: new Date(Date.now() - 10 * 60 * 1000),
        type: 'code_to_diagram',
        source: 'CloudFormation',
        target: 'Diagram Canvas',
        changes: ['Modified VPC CIDR block', 'Added new subnet'],
        status: 'success'
      },
      {
        id: '3',
        timestamp: new Date(Date.now() - 15 * 60 * 1000),
        type: 'manual_sync',
        source: 'Manual Sync',
        target: 'All Components',
        changes: ['Full synchronization completed'],
        status: 'success'
      }
    ];
    setSyncEvents(demoEvents);
    setLastSyncTime(new Date(Date.now() - 5 * 60 * 1000));
  };

  const performAutoSync = useCallback(() => {
    if (!currentDiagram) return;
    
    const syncEvent: SyncEvent = {
      id: Date.now().toString(),
      timestamp: new Date(),
      type: 'manual_sync',
      source: 'Auto Sync',
      target: 'All Components',
      changes: ['Automatic synchronization'],
      status: 'pending'
    };
    
    setSyncEvents(prev => [syncEvent, ...prev]);
    
    // Simulate sync process
    setTimeout(() => {
      setSyncEvents(prev => prev.map(e => 
        e.id === syncEvent.id 
          ? { ...e, status: 'success' as const }
          : e
      ));
      setLastSyncTime(new Date());
      
      if (syncSettings.showNotifications) {
        toast.success('Auto-sync completed successfully');
      }
    }, 1000);
  }, [currentDiagram, syncSettings.showNotifications]);

  const syncDiagramToCode = useCallback(() => {
    if (!currentDiagram) {
      toast.error('No diagram to sync');
      return;
    }
    
    setIsSyncing(true);
    
    const syncEvent: SyncEvent = {
      id: Date.now().toString(),
      timestamp: new Date(),
      type: 'diagram_to_code',
      source: 'Diagram Editor',
      target: 'IaC Code',
      changes: ['Updated diagram structure'],
      status: 'pending'
    };
    
    setSyncEvents(prev => [syncEvent, ...prev]);
    
    // Simulate sync process
    setTimeout(() => {
      setSyncEvents(prev => prev.map(e => 
        e.id === syncEvent.id 
          ? { ...e, status: 'success' as const, changes: [...e.changes, 'Generated Terraform code'] }
          : e
      ));
      setLastSyncTime(new Date());
      setIsSyncing(false);
      toast.success('Diagram synced to code successfully');
    }, 2000);
  }, [currentDiagram]);

  const syncCodeToDiagram = useCallback(() => {
    if (!codeEditor.trim()) {
      toast.error('No code to sync');
      return;
    }
    
    setIsSyncing(true);
    
    const syncEvent: SyncEvent = {
      id: Date.now().toString(),
      timestamp: new Date(),
      type: 'code_to_diagram',
      source: 'Code Editor',
      target: 'Diagram Canvas',
      changes: ['Updated IaC code'],
      status: 'pending'
    };
    
    setSyncEvents(prev => [syncEvent, ...prev]);
    
    // Simulate sync process
    setTimeout(() => {
      setSyncEvents(prev => prev.map(e => 
        e.id === syncEvent.id 
          ? { ...e, status: 'success' as const, changes: [...e.changes, 'Updated diagram from code'] }
          : e
      ));
      setLastSyncTime(new Date());
      setIsSyncing(false);
      toast.success('Code synced to diagram successfully');
    }, 2000);
  }, [codeEditor]);

  const performFullSync = useCallback(() => {
    setIsSyncing(true);
    
    const syncEvent: SyncEvent = {
      id: Date.now().toString(),
      timestamp: new Date(),
      type: 'manual_sync',
      source: 'Full Sync',
      target: 'All Components',
      changes: ['Starting full synchronization'],
      status: 'pending'
    };
    
    setSyncEvents(prev => [syncEvent, ...prev]);
    
    // Simulate full sync process
    setTimeout(() => {
      setSyncEvents(prev => prev.map(e => 
        e.id === syncEvent.id 
          ? { ...e, status: 'success' as const, changes: ['Full sync completed', 'All components synchronized'] }
          : e
      ));
      setLastSyncTime(new Date());
      setIsSyncing(false);
      toast.success('Full synchronization completed');
    }, 3000);
  }, []);

  const resolveConflict = (eventId: string, resolution: 'diagram' | 'code') => {
    setSyncEvents(prev => prev.map(e => 
      e.id === eventId 
        ? { ...e, status: 'success' as const, changes: [...e.changes, `Conflict resolved: ${resolution} wins`] }
        : e
    ));
    toast.success(`Conflict resolved: ${resolution} wins`);
  };

  const getSyncStatusColor = (status: string) => {
    switch (status) {
      case 'success': return 'text-green-600';
      case 'error': return 'text-red-600';
      case 'pending': return 'text-yellow-600';
      default: return 'text-gray-600';
    }
  };

  const getSyncStatusIcon = (status: string) => {
    switch (status) {
      case 'success': return <CheckCircle className="h-4 w-4" />;
      case 'error': return <AlertCircle className="h-4 w-4" />;
      case 'pending': return <RefreshCw className="h-4 w-4 animate-spin" />;
      default: return <Clock className="h-4 w-4" />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Sync Status Overview */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Sync className="h-5 w-5" />
              Bi-directional Synchronization
            </CardTitle>
            <div className="flex items-center gap-2">
              <Badge variant={lastSyncTime ? 'default' : 'secondary'}>
                {lastSyncTime ? 'Synced' : 'Not Synced'}
              </Badge>
              {isSyncing && (
                <div className="flex items-center gap-2 text-sm text-blue-600">
                  <Activity className="h-4 w-4 animate-spin" />
                  Syncing...
                </div>
              )}
            </div>
          </div>
          <CardDescription>
            Real-time synchronization between diagrams and IaC code
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">{syncEvents.length}</div>
              <div className="text-sm text-muted-foreground">Total Sync Events</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">
                {syncEvents.filter(e => e.status === 'success').length}
              </div>
              <div className="text-sm text-muted-foreground">Successful</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-yellow-600">
                {syncEvents.filter(e => e.status === 'pending').length}
              </div>
              <div className="text-sm text-muted-foreground">Pending</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-red-600">
                {syncEvents.filter(e => e.status === 'error').length}
              </div>
              <div className="text-sm text-muted-foreground">Failed</div>
            </div>
          </div>
          
          {/* Sync Controls */}
          <div className="flex flex-wrap gap-3 mt-6">
            <Button 
              onClick={syncDiagramToCode}
              disabled={isSyncing || !currentDiagram}
              className="gap-2"
            >
              <ArrowUpDown className="h-4 w-4" />
              Diagram → Code
            </Button>
            <Button 
              onClick={syncCodeToDiagram}
              disabled={isSyncing || !codeEditor.trim()}
              variant="outline"
              className="gap-2"
            >
              <ArrowUpDown className="h-4 w-4 rotate-180" />
              Code → Diagram
            </Button>
            <Button 
              onClick={performFullSync}
              disabled={isSyncing}
              variant="outline"
              className="gap-2"
            >
              <RefreshCw className={`h-4 w-4 ${isSyncing ? 'animate-spin' : ''}`} />
              Full Sync
            </Button>
          </div>
          
          {lastSyncTime && (
            <div className="text-sm text-muted-foreground mt-4">
              Last sync: {lastSyncTime.toLocaleString()}
            </div>
          )}
        </CardContent>
      </Card>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="events">Sync Events</TabsTrigger>
          <TabsTrigger value="settings">Settings</TabsTrigger>
          <TabsTrigger value="editors">Editors</TabsTrigger>
        </TabsList>

        <TabsContent value="overview">
          <div className="grid gap-6">
            {/* Sync Flow Visualization */}
            <Card>
              <CardHeader>
                <CardTitle>Sync Flow</CardTitle>
                <CardDescription>
                  Visual representation of synchronization process
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-center py-8">
                  <div className="flex items-center gap-4">
                    <div className="text-center">
                      <div className="w-16 h-16 bg-blue-100 rounded-lg flex items-center justify-center">
                        <Layers className="h-8 w-8 text-blue-600" />
                      </div>
                      <p className="text-sm mt-2">Diagram</p>
                    </div>
                    
                    <div className="flex flex-col items-center">
                      <ArrowUpDown className="h-6 w-6 text-muted-foreground" />
                      <p className="text-xs text-muted-foreground mt-1">Sync</p>
                    </div>
                    
                    <div className="text-center">
                      <div className="w-16 h-16 bg-green-100 rounded-lg flex items-center justify-center">
                        <FileText className="h-8 w-8 text-green-600" />
                      </div>
                      <p className="text-sm mt-2">IaC Code</p>
                    </div>
                    
                    <div className="flex flex-col items-center">
                      <ArrowUpDown className="h-6 w-6 text-muted-foreground rotate-180" />
                      <p className="text-xs text-muted-foreground mt-1">Sync</p>
                    </div>
                    
                    <div className="text-center">
                      <div className="w-16 h-16 bg-purple-100 rounded-lg flex items-center justify-center">
                        <GitBranch className="h-8 w-8 text-purple-600" />
                      </div>
                      <p className="text-sm mt-2">Repository</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Recent Activity */}
            <Card>
              <CardHeader>
                <CardTitle>Recent Activity</CardTitle>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-64">
                  <div className="space-y-3">
                    {syncEvents.slice(0, 10).map((event) => (
                      <div key={event.id} className="flex items-start gap-3 p-3 border rounded-lg">
                        <div className={`mt-1 ${getSyncStatusColor(event.status)}`}>
                          {getSyncStatusIcon(event.status)}
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center justify-between">
                            <p className="font-medium text-sm">{event.source}</p>
                            <span className="text-xs text-muted-foreground">
                              {event.timestamp.toLocaleTimeString()}
                            </span>
                          </div>
                          <p className="text-xs text-muted-foreground mt-1">
                            {event.target}
                          </p>
                          <div className="mt-2">
                            {event.changes.map((change, i) => (
                              <div key={i} className="text-xs text-muted-foreground">
                                • {change}
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="events">
          <Card>
            <CardHeader>
              <CardTitle>Sync Event History</CardTitle>
              <CardDescription>
                Complete history of all synchronization events
              </CardDescription>
            </CardHeader>
          <CardContent>
            <ScrollArea className="h-96">
              <div className="space-y-3">
                {syncEvents.map((event) => (
                  <div key={event.id} className="border rounded-lg p-4">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <div className={getSyncStatusColor(event.status)}>
                          {getSyncStatusIcon(event.status)}
                        </div>
                        <Badge variant="outline">{event.type}</Badge>
                      </div>
                      <span className="text-sm text-muted-foreground">
                        {event.timestamp.toLocaleString()}
                      </span>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-3">
                      <div>
                        <p className="text-sm font-medium">Source</p>
                        <p className="text-sm text-muted-foreground">{event.source}</p>
                      </div>
                      <div>
                        <p className="text-sm font-medium">Target</p>
                        <p className="text-sm text-muted-foreground">{event.target}</p>
                      </div>
                    </div>
                    
                    <div>
                      <p className="text-sm font-medium mb-2">Changes</p>
                      <div className="space-y-1">
                        {event.changes.map((change, i) => (
                          <div key={i} className="text-sm text-muted-foreground">
                            • {change}
                          </div>
                        ))}
                      </div>
                    </div>
                    
                    {event.error && (
                      <div className="mt-3 p-2 bg-red-50 border border-red-200 rounded">
                        <p className="text-sm text-red-600">{event.error}</p>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>
      </TabsContent>

      <TabsContent value="settings">
        <Card>
          <CardHeader>
            <CardTitle>Sync Settings</CardTitle>
            <CardDescription>
              Configure synchronization behavior and preferences
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Auto Sync</p>
                  <p className="text-sm text-muted-foreground">
                    Automatically synchronize changes
                  </p>
                </div>
                <Switch 
                  checked={syncSettings.autoSync}
                  onCheckedChange={(checked) => 
                    setSyncSettings(prev => ({ ...prev, autoSync: checked }))
                  }
                />
              </div>
              
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Show Notifications</p>
                  <p className="text-sm text-muted-foreground">
                    Display sync notifications
                  </p>
                </div>
                <Switch 
                  checked={syncSettings.showNotifications}
                  onCheckedChange={(checked) => 
                    setSyncSettings(prev => ({ ...prev, showNotifications: checked }))
                  }
                />
              </div>
              
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Enable History</p>
                  <p className="text-sm text-muted-foreground">
                    Keep sync event history
                  </p>
                </div>
                <Switch 
                  checked={syncSettings.enableHistory}
                  onCheckedChange={(checked) => 
                    setSyncSettings(prev => ({ ...prev, enableHistory: checked }))
                  }
                />
              </div>
            </div>
            
            <div className="space-y-4">
              <div>
                <p className="font-medium mb-2">Conflict Resolution</p>
                <Select 
                  value={syncSettings.conflictResolution}
                  onValueChange={(value: 'diagram_wins' | 'code_wins' | 'manual') => 
                    setSyncSettings(prev => ({ ...prev, conflictResolution: value }))
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="diagram_wins">Diagram Wins</SelectItem>
                    <SelectItem value="code_wins">Code Wins</SelectItem>
                    <SelectItem value="manual">Manual Resolution</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <p className="font-medium mb-2">
                  Sync Interval: {syncSettings.syncInterval} seconds
                </p>
                <input
                  type="range"
                  min="10"
                  max="300"
                  value={syncSettings.syncInterval}
                  onChange={(e) => 
                    setSyncSettings(prev => ({ ...prev, syncInterval: parseInt(e.target.value) }))
                  }
                  className="w-full"
                />
              </div>
            </div>
          </CardContent>
        </Card>
      </TabsContent>

      <TabsContent value="editors">
        <div className="grid gap-6">
          {/* Diagram Editor */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Edit className="h-5 w-5" />
                Diagram Editor
              </CardTitle>
              <CardDescription>
                Make changes to the diagram and sync to code
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Textarea
                placeholder="Edit diagram structure..."
                value={diagramEditor}
                onChange={(e) => setDiagramEditor(e.target.value)}
                className="min-h-32"
              />
              <div className="flex gap-2 mt-3">
                <Button size="sm" onClick={syncDiagramToCode}>
                  <Save className="h-4 w-4 mr-1" />
                  Sync to Code
                </Button>
                <Button size="sm" variant="outline">
                  <Undo className="h-4 w-4 mr-1" />
                  Undo
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Code Editor */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Code Editor
              </CardTitle>
              <CardDescription>
                Edit IaC code and sync to diagram
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Textarea
                placeholder="Edit IaC code..."
                value={codeEditor}
                onChange={(e) => setCodeEditor(e.target.value)}
                className="min-h-32 font-mono"
              />
              <div className="flex gap-2 mt-3">
                <Button size="sm" onClick={syncCodeToDiagram}>
                  <Save className="h-4 w-4 mr-1" />
                  Sync to Diagram
                </Button>
                <Button size="sm" variant="outline">
                  <Undo className="h-4 w-4 mr-1" />
                  Undo
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </TabsContent>
    </Tabs>
  );
}
