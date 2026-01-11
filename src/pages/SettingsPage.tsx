import { useState } from 'react';
import { motion } from 'framer-motion';
import {
  Moon,
  Sun,
  Monitor,
  Save,
  Upload,
  Download,
  Trash2,
  FolderOpen,
  AlertTriangle,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { useTheme } from '@/contexts/ThemeContext';
import { useInfrastructure } from '@/contexts/InfrastructureContext';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import type { IaCFramework, InfraGraph } from '@/types/infrastructure';

interface SavedDiagram {
  id: string;
  name: string;
  savedAt: string;
  nodeCount: number;
  graph: InfraGraph;
}

export default function SettingsPage() {
  const { theme, setTheme } = useTheme();
  const { state, setGraph, setIaCFramework, dispatch } = useInfrastructure();
  const [diagramName, setDiagramName] = useState(state.graph?.metadata.name || 'My Infrastructure');
  const [savedDiagrams, setSavedDiagrams] = useState<SavedDiagram[]>(() => {
    const saved = localStorage.getItem('infravizai_saved_diagrams');
    return saved ? JSON.parse(saved) : [];
  });

  const handleSaveDiagram = () => {
    if (!state.graph) {
      toast.error('No diagram to save');
      return;
    }

    const newSave: SavedDiagram = {
      id: Date.now().toString(),
      name: diagramName,
      savedAt: new Date().toISOString(),
      nodeCount: state.graph.nodes.length,
      graph: {
        ...state.graph,
        metadata: { ...state.graph.metadata, name: diagramName },
      },
    };

    const updated = [...savedDiagrams, newSave];
    setSavedDiagrams(updated);
    localStorage.setItem('infravizai_saved_diagrams', JSON.stringify(updated));
    toast.success('Diagram saved successfully');
  };

  const handleLoadDiagram = (diagram: SavedDiagram) => {
    setGraph(diagram.graph);
    setDiagramName(diagram.name);
    toast.success(`Loaded: ${diagram.name}`);
  };

  const handleDeleteDiagram = (id: string) => {
    const updated = savedDiagrams.filter((d) => d.id !== id);
    setSavedDiagrams(updated);
    localStorage.setItem('infravizai_saved_diagrams', JSON.stringify(updated));
    toast.success('Diagram deleted');
  };

  const handleExportJSON = () => {
    if (!state.graph) {
      toast.error('No diagram to export');
      return;
    }

    const exportData = {
      ...state.graph,
      metadata: { ...state.graph.metadata, name: diagramName },
      exportedAt: new Date().toISOString(),
      version: '1.0',
    };

    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${diagramName.toLowerCase().replace(/\s+/g, '-')}-infra.json`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success('Diagram exported as JSON');
  };

  const handleImportJSON = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = JSON.parse(e.target?.result as string);
        
        // Validate structure
        if (!data.nodes || !Array.isArray(data.nodes)) {
          throw new Error('Invalid diagram format: missing nodes array');
        }

        const graph: InfraGraph = {
          nodes: data.nodes,
          edges: data.edges || [],
          metadata: {
            name: data.metadata?.name || file.name.replace('.json', ''),
            region: data.metadata?.region || 'us-east-1',
            createdAt: data.metadata?.createdAt || new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          },
        };

        setGraph(graph);
        setDiagramName(graph.metadata.name);
        toast.success('Diagram imported successfully');
      } catch (error: any) {
        toast.error(`Import failed: ${error.message}`);
      }
    };
    reader.readAsText(file);
    event.target.value = '';
  };

  const handleClearDiagram = () => {
    dispatch({ type: 'CLEAR' });
    setDiagramName('My Infrastructure');
    toast.success('Diagram cleared');
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="p-4 md:p-8 max-w-3xl mx-auto space-y-6"
    >
      <h1 className="text-2xl font-bold">Settings</h1>

      {/* Appearance */}
      <Card>
        <CardHeader>
          <CardTitle>Appearance</CardTitle>
          <CardDescription>Customize the look and feel</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-3 gap-3">
            {[
              { value: 'light', icon: Sun, label: 'Light' },
              { value: 'dark', icon: Moon, label: 'Dark' },
              { value: 'system', icon: Monitor, label: 'System' },
            ].map((option) => (
              <Button
                key={option.value}
                variant="outline"
                onClick={() => setTheme(option.value as 'light' | 'dark' | 'system')}
                className={cn(
                  'flex flex-col h-20 gap-2',
                  theme === option.value && 'border-primary bg-primary/5'
                )}
              >
                <option.icon className="h-5 w-5" />
                <span className="text-sm">{option.label}</span>
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Default Settings */}
      <Card>
        <CardHeader>
          <CardTitle>Default Settings</CardTitle>
          <CardDescription>Configure default options for new diagrams</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label>Default IaC Framework</Label>
            <Select value={state.iacFramework} onValueChange={(v) => setIaCFramework(v as IaCFramework)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="terraform">Terraform (HCL)</SelectItem>
                <SelectItem value="cloudformation">CloudFormation (JSON)</SelectItem>
                <SelectItem value="pulumi">Pulumi (TypeScript)</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Current Diagram */}
      <Card>
        <CardHeader>
          <CardTitle>Current Diagram</CardTitle>
          <CardDescription>Save, export, or import diagrams</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label>Diagram Name</Label>
            <div className="flex gap-2">
              <Input
                value={diagramName}
                onChange={(e) => setDiagramName(e.target.value)}
                placeholder="My Infrastructure"
              />
              <Button onClick={handleSaveDiagram} disabled={!state.graph}>
                <Save className="h-4 w-4 mr-2" />
                Save
              </Button>
            </div>
          </div>

          <Separator />

          <div className="flex flex-wrap gap-2">
            <Button variant="outline" onClick={handleExportJSON} disabled={!state.graph}>
              <Download className="h-4 w-4 mr-2" />
              Export JSON
            </Button>

            <Button variant="outline" asChild>
              <label className="cursor-pointer">
                <Upload className="h-4 w-4 mr-2" />
                Import JSON
                <input
                  type="file"
                  accept=".json"
                  onChange={handleImportJSON}
                  className="hidden"
                />
              </label>
            </Button>

            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="destructive" disabled={!state.graph}>
                  <Trash2 className="h-4 w-4 mr-2" />
                  Clear
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Clear Diagram?</AlertDialogTitle>
                  <AlertDialogDescription>
                    This will remove all nodes and edges from the current diagram. This action cannot be undone.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction onClick={handleClearDiagram}>Clear</AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        </CardContent>
      </Card>

      {/* Saved Diagrams */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FolderOpen className="h-5 w-5" />
            Saved Diagrams
          </CardTitle>
          <CardDescription>Load previously saved diagrams</CardDescription>
        </CardHeader>
        <CardContent>
          {savedDiagrams.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-4">
              No saved diagrams yet. Save your current diagram to see it here.
            </p>
          ) : (
            <div className="space-y-2">
              {savedDiagrams.map((diagram) => (
                <div
                  key={diagram.id}
                  className="flex items-center justify-between p-3 rounded-lg bg-muted/50 hover:bg-muted transition-colors"
                >
                  <div>
                    <p className="font-medium">{diagram.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {diagram.nodeCount} resources • Saved {new Date(diagram.savedAt).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <Button size="sm" variant="outline" onClick={() => handleLoadDiagram(diagram)}>
                      Load
                    </Button>
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button size="sm" variant="ghost">
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Delete Diagram?</AlertDialogTitle>
                          <AlertDialogDescription>
                            Delete "{diagram.name}"? This cannot be undone.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancel</AlertDialogCancel>
                          <AlertDialogAction onClick={() => handleDeleteDiagram(diagram.id)}>
                            Delete
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* About */}
      <Card>
        <CardHeader>
          <CardTitle>About InfraVizAI</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            InfraVizAI is an AI-powered tool for designing cloud infrastructure. 
            Describe your infrastructure in plain English and get interactive diagrams, 
            IaC code, and security recommendations.
          </p>
          <p className="text-xs text-muted-foreground mt-4">
            Version 1.0.0 • Built with Lovable
          </p>
        </CardContent>
      </Card>
    </motion.div>
  );
}
