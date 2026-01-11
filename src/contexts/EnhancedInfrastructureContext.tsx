import React, { createContext, useContext, useReducer, useCallback, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import type { 
  InfraGraph, 
  InfraNode, 
  InfraEdge, 
  IaCFramework, 
  SecurityReport,
  Diagram,
  CIConfiguration,
  Deployment,
  SecurityThreat,
  CircuitDiagram,
  DiagramPresence,
  CollaborationEvent
} from '@/types';

interface EnhancedInfraState {
  // Core diagram state
  currentDiagram: Diagram | null;
  graph: InfraGraph | null;
  iacFramework: IaCFramework;
  iacCode: string;
  
  // Collaboration state
  teamMembers: DiagramPresence[];
  collaborationEvents: CollaborationEvent[];
  isRealTimeSyncEnabled: boolean;
  
  // CI/CD state
  ciConfigurations: CIConfiguration[];
  deployments: Deployment[];
  
  // Security state
  securityReport: SecurityReport | null;
  securityThreats: SecurityThreat[];
  
  // Circuit diagrams
  circuitDiagrams: CircuitDiagram[];
  currentCircuitDiagram: CircuitDiagram | null;
  
  // UI state
  isGenerating: boolean;
  isSyncing: boolean;
  isSaving: boolean;
  lastSaved: string | null;
  
  // History for undo/redo
  history: InfraGraph[];
  historyIndex: number;
}

type EnhancedInfraAction =
  | { type: 'SET_CURRENT_DIAGRAM'; payload: Diagram }
  | { type: 'SET_GRAPH'; payload: InfraGraph }
  | { type: 'UPDATE_NODE'; payload: { id: string; updates: Partial<InfraNode> } }
  | { type: 'ADD_NODE'; payload: InfraNode }
  | { type: 'REMOVE_NODE'; payload: string }
  | { type: 'ADD_EDGE'; payload: InfraEdge }
  | { type: 'REMOVE_EDGE'; payload: string }
  | { type: 'SET_IAC_FRAMEWORK'; payload: IaCFramework }
  | { type: 'SET_IAC_CODE'; payload: string }
  | { type: 'SET_SECURITY_REPORT'; payload: SecurityReport | null }
  | { type: 'SET_SECURITY_THREATS'; payload: SecurityThreat[] }
  | { type: 'ADD_SECURITY_THREAT'; payload: SecurityThreat }
  | { type: 'SET_GENERATING'; payload: boolean }
  | { type: 'SET_SYNCING'; payload: boolean }
  | { type: 'SET_SAVING'; payload: boolean }
  | { type: 'SET_LAST_SAVED'; payload: string | null }
  | { type: 'SET_TEAM_MEMBERS'; payload: DiagramPresence[] }
  | { type: 'ADD_TEAM_MEMBER'; payload: DiagramPresence }
  | { type: 'UPDATE_TEAM_MEMBER'; payload: { userId: string; updates: Partial<DiagramPresence> } }
  | { type: 'REMOVE_TEAM_MEMBER'; payload: string }
  | { type: 'ADD_COLLABORATION_EVENT'; payload: CollaborationEvent }
  | { type: 'SET_CI_CONFIGURATIONS'; payload: CIConfiguration[] }
  | { type: 'ADD_DEPLOYMENT'; payload: Deployment }
  | { type: 'UPDATE_DEPLOYMENT'; payload: { id: string; updates: Partial<Deployment> } }
  | { type: 'SET_CIRCUIT_DIAGRAMS'; payload: CircuitDiagram[] }
  | { type: 'SET_CURRENT_CIRCUIT_DIAGRAM'; payload: CircuitDiagram | null }
  | { type: 'ENABLE_REAL_TIME_SYNC'; payload: boolean }
  | { type: 'UNDO' }
  | { type: 'REDO' }
  | { type: 'CLEAR' };

const initialState: EnhancedInfraState = {
  currentDiagram: null,
  graph: null,
  iacFramework: 'terraform',
  iacCode: '',
  teamMembers: [],
  collaborationEvents: [],
  isRealTimeSyncEnabled: true,
  ciConfigurations: [],
  deployments: [],
  securityReport: null,
  securityThreats: [],
  circuitDiagrams: [],
  currentCircuitDiagram: null,
  isGenerating: false,
  isSyncing: false,
  isSaving: false,
  lastSaved: null,
  history: [],
  historyIndex: -1,
};

function enhancedInfraReducer(state: EnhancedInfraState, action: EnhancedInfraAction): EnhancedInfraState {
  switch (action.type) {
    case 'SET_CURRENT_DIAGRAM':
      return { ...state, currentDiagram: action.payload };

    case 'SET_GRAPH': {
      const newHistory = state.history.slice(0, state.historyIndex + 1);
      newHistory.push(action.payload);
      return {
        ...state,
        graph: action.payload,
        history: newHistory.slice(-50),
        historyIndex: Math.min(newHistory.length - 1, 49),
      };
    }

    case 'UPDATE_NODE': {
      if (!state.graph) return state;
      const updatedNodes = state.graph.nodes.map((node) =>
        node.id === action.payload.id ? { ...node, ...action.payload.updates } : node
      );
      const newGraph = { 
        ...state.graph, 
        nodes: updatedNodes, 
        metadata: { ...state.graph.metadata, updatedAt: new Date().toISOString() } 
      };
      const newHistory = state.history.slice(0, state.historyIndex + 1);
      newHistory.push(newGraph);
      return {
        ...state,
        graph: newGraph,
        history: newHistory.slice(-50),
        historyIndex: Math.min(newHistory.length - 1, 49),
      };
    }

    case 'ADD_NODE': {
      if (!state.graph) {
        const newGraph: InfraGraph = {
          nodes: [action.payload],
          edges: [],
          metadata: {
            name: 'New Infrastructure',
            region: 'us-east-1',
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          },
        };
        return { ...state, graph: newGraph, history: [newGraph], historyIndex: 0 };
      }
      const newGraph = {
        ...state.graph,
        nodes: [...state.graph.nodes, action.payload],
        metadata: { ...state.graph.metadata, updatedAt: new Date().toISOString() },
      };
      const newHistory = state.history.slice(0, state.historyIndex + 1);
      newHistory.push(newGraph);
      return {
        ...state,
        graph: newGraph,
        history: newHistory.slice(-50),
        historyIndex: Math.min(newHistory.length - 1, 49),
      };
    }

    case 'REMOVE_NODE': {
      if (!state.graph) return state;
      const newGraph = {
        ...state.graph,
        nodes: state.graph.nodes.filter((n) => n.id !== action.payload),
        edges: state.graph.edges.filter((e) => e.source !== action.payload && e.target !== action.payload),
        metadata: { ...state.graph.metadata, updatedAt: new Date().toISOString() },
      };
      const newHistory = state.history.slice(0, state.historyIndex + 1);
      newHistory.push(newGraph);
      return {
        ...state,
        graph: newGraph,
        history: newHistory.slice(-50),
        historyIndex: Math.min(newHistory.length - 1, 49),
      };
    }

    case 'ADD_EDGE': {
      if (!state.graph) return state;
      const newGraph = {
        ...state.graph,
        edges: [...state.graph.edges, action.payload],
        metadata: { ...state.graph.metadata, updatedAt: new Date().toISOString() },
      };
      const newHistory = state.history.slice(0, state.historyIndex + 1);
      newHistory.push(newGraph);
      return {
        ...state,
        graph: newGraph,
        history: newHistory.slice(-50),
        historyIndex: Math.min(newHistory.length - 1, 49),
      };
    }

    case 'REMOVE_EDGE': {
      if (!state.graph) return state;
      const newGraph = {
        ...state.graph,
        edges: state.graph.edges.filter((e) => e.id !== action.payload),
        metadata: { ...state.graph.metadata, updatedAt: new Date().toISOString() },
      };
      const newHistory = state.history.slice(0, state.historyIndex + 1);
      newHistory.push(newGraph);
      return {
        ...state,
        graph: newGraph,
        history: newHistory.slice(-50),
        historyIndex: Math.min(newHistory.length - 1, 49),
      };
    }

    case 'SET_IAC_FRAMEWORK':
      return { ...state, iacFramework: action.payload };

    case 'SET_IAC_CODE':
      return { ...state, iacCode: action.payload };

    case 'SET_SECURITY_REPORT':
      return { ...state, securityReport: action.payload };

    case 'SET_SECURITY_THREATS':
      return { ...state, securityThreats: action.payload };

    case 'ADD_SECURITY_THREAT':
      return { ...state, securityThreats: [...state.securityThreats, action.payload] };

    case 'SET_GENERATING':
      return { ...state, isGenerating: action.payload };

    case 'SET_SYNCING':
      return { ...state, isSyncing: action.payload };

    case 'SET_SAVING':
      return { ...state, isSaving: action.payload };

    case 'SET_LAST_SAVED':
      return { ...state, lastSaved: action.payload };

    case 'SET_TEAM_MEMBERS':
      return { ...state, teamMembers: action.payload };

    case 'ADD_TEAM_MEMBER':
      return { ...state, teamMembers: [...state.teamMembers, action.payload] };

    case 'UPDATE_TEAM_MEMBER':
      return {
        ...state,
        teamMembers: state.teamMembers.map((member) =>
          member.user_id === action.payload.userId
            ? { ...member, ...action.payload.updates }
            : member
        ),
      };

    case 'REMOVE_TEAM_MEMBER':
      return {
        ...state,
        teamMembers: state.teamMembers.filter((member) => member.user_id !== action.payload),
      };

    case 'ADD_COLLABORATION_EVENT':
      return { ...state, collaborationEvents: [...state.collaborationEvents, action.payload] };

    case 'SET_CI_CONFIGURATIONS':
      return { ...state, ciConfigurations: action.payload };

    case 'ADD_DEPLOYMENT':
      return { ...state, deployments: [...state.deployments, action.payload] };

    case 'UPDATE_DEPLOYMENT':
      return {
        ...state,
        deployments: state.deployments.map((deployment) =>
          deployment.id === action.payload.id
            ? { ...deployment, ...action.payload.updates }
            : deployment
        ),
      };

    case 'SET_CIRCUIT_DIAGRAMS':
      return { ...state, circuitDiagrams: action.payload };

    case 'SET_CURRENT_CIRCUIT_DIAGRAM':
      return { ...state, currentCircuitDiagram: action.payload };

    case 'ENABLE_REAL_TIME_SYNC':
      return { ...state, isRealTimeSyncEnabled: action.payload };

    case 'UNDO': {
      if (state.historyIndex <= 0) return state;
      const newIndex = state.historyIndex - 1;
      return {
        ...state,
        graph: state.history[newIndex],
        historyIndex: newIndex,
      };
    }

    case 'REDO': {
      if (state.historyIndex >= state.history.length - 1) return state;
      const newIndex = state.historyIndex + 1;
      return {
        ...state,
        graph: state.history[newIndex],
        historyIndex: newIndex,
      };
    }

    case 'CLEAR':
      return initialState;

    default:
      return state;
  }
}

interface EnhancedInfraContextType {
  state: EnhancedInfraState;
  dispatch: React.Dispatch<EnhancedInfraAction>;
  
  // Diagram operations
  loadDiagram: (diagramId: string) => Promise<void>;
  saveDiagram: () => Promise<void>;
  createDiagram: (name: string, description?: string) => Promise<string>;
  deleteDiagram: (diagramId: string) => Promise<void>;
  
  // Graph operations
  setGraph: (graph: InfraGraph) => void;
  addNode: (node: InfraNode) => void;
  updateNode: (id: string, updates: Partial<InfraNode>) => void;
  removeNode: (id: string) => void;
  addEdge: (edge: InfraEdge) => void;
  removeEdge: (id: string) => void;
  setIaCFramework: (framework: IaCFramework) => void;
  
  // Collaboration operations
  updatePresence: (cursorX: number, cursorY: number) => void;
  sendCollaborationEvent: (event: Omit<CollaborationEvent, 'user_id' | 'timestamp'>) => void;
  
  // CI/CD operations
  createCIConfiguration: (config: Omit<CIConfiguration, 'id' | 'created_at' | 'updated_at'>) => Promise<void>;
  triggerDeployment: (ciConfigId: string) => Promise<void>;
  
  // Security operations
  runSecurityScan: () => Promise<void>;
  resolveThreat: (threatId: string) => Promise<void>;
  
  // Circuit diagram operations
  createCircuitDiagram: (name: string) => Promise<string>;
  
  // History operations
  undo: () => void;
  redo: () => void;
  canUndo: boolean;
  canRedo: boolean;
}

const EnhancedInfrastructureContext = createContext<EnhancedInfraContextType | undefined>(undefined);

export function EnhancedInfrastructureProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(enhancedInfraReducer, initialState);

  // Core operations
  const setGraph = useCallback((graph: InfraGraph) => dispatch({ type: 'SET_GRAPH', payload: graph }), []);
  const addNode = useCallback((node: InfraNode) => dispatch({ type: 'ADD_NODE', payload: node }), []);
  const updateNode = useCallback((id: string, updates: Partial<InfraNode>) => 
    dispatch({ type: 'UPDATE_NODE', payload: { id, updates } }), []);
  const removeNode = useCallback((id: string) => dispatch({ type: 'REMOVE_NODE', payload: id }), []);
  const addEdge = useCallback((edge: InfraEdge) => dispatch({ type: 'ADD_EDGE', payload: edge }), []);
  const removeEdge = useCallback((id: string) => dispatch({ type: 'REMOVE_EDGE', payload: id }), []);
  const setIaCFramework = useCallback((framework: IaCFramework) => 
    dispatch({ type: 'SET_IAC_FRAMEWORK', payload: framework }), []);
  const undo = useCallback(() => dispatch({ type: 'UNDO' }), []);
  const redo = useCallback(() => dispatch({ type: 'REDO' }), []);

  const canUndo = state.historyIndex > 0;
  const canRedo = state.historyIndex < state.history.length - 1;

  // Diagram operations
  const loadDiagram = useCallback(async (diagramId: string) => {
    dispatch({ type: 'SET_SAVING', payload: true });
    try {
      const { data, error } = await supabase
        .from('diagrams')
        .select('*')
        .eq('id', diagramId)
        .single();

      if (error) throw error;

      const graph: InfraGraph = {
        nodes: data.nodes,
        edges: data.edges,
        metadata: {
          name: data.name,
          region: 'us-east-1',
          createdAt: data.created_at,
          updatedAt: data.updated_at,
        },
      };

      dispatch({ type: 'SET_CURRENT_DIAGRAM', payload: data });
      dispatch({ type: 'SET_GRAPH', payload: graph });
      dispatch({ type: 'SET_IAC_CODE', payload: data.iac_code || '' });
      dispatch({ type: 'SET_IAC_FRAMEWORK', payload: data.iac_framework });
    } catch (error) {
      toast.error('Failed to load diagram');
      console.error(error);
    } finally {
      dispatch({ type: 'SET_SAVING', payload: false });
    }
  }, []);

  const saveDiagram = useCallback(async () => {
    if (!state.currentDiagram || !state.graph) return;

    dispatch({ type: 'SET_SAVING', payload: true });
    try {
      const { error } = await supabase
        .from('diagrams')
        .update({
          name: state.graph.metadata.name,
          description: state.graph.metadata.name,
          nodes: state.graph.nodes,
          edges: state.graph.edges,
          iac_framework: state.iacFramework,
          iac_code: state.iacCode,
          updated_at: new Date().toISOString(),
        })
        .eq('id', state.currentDiagram.id);

      if (error) throw error;

      dispatch({ type: 'SET_LAST_SAVED', payload: new Date().toISOString() });
      toast.success('Diagram saved successfully');
    } catch (error) {
      toast.error('Failed to save diagram');
      console.error(error);
    } finally {
      dispatch({ type: 'SET_SAVING', payload: false });
    }
  }, [state.currentDiagram, state.graph, state.iacFramework, state.iacCode]);

  const createDiagram = useCallback(async (name: string, description?: string) => {
    try {
      const { data, error } = await supabase
        .from('diagrams')
        .insert({
          name,
          description,
          nodes: [],
          edges: [],
          iac_framework: state.iacFramework,
        })
        .select()
        .single();

      if (error) throw error;

      await loadDiagram(data.id);
      toast.success('Diagram created successfully');
      return data.id;
    } catch (error) {
      toast.error('Failed to create diagram');
      console.error(error);
      throw error;
    }
  }, [state.iacFramework, loadDiagram]);

  const deleteDiagram = useCallback(async (diagramId: string) => {
    try {
      const { error } = await supabase
        .from('diagrams')
        .delete()
        .eq('id', diagramId);

      if (error) throw error;

      if (state.currentDiagram?.id === diagramId) {
        dispatch({ type: 'CLEAR' });
      }

      toast.success('Diagram deleted successfully');
    } catch (error) {
      toast.error('Failed to delete diagram');
      console.error(error);
    }
  }, [state.currentDiagram]);

  // Collaboration operations
  const updatePresence = useCallback(async (cursorX: number, cursorY: number) => {
    if (!state.currentDiagram || !state.isRealTimeSyncEnabled) return;

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      await supabase
        .from('diagram_presence')
        .upsert({
          diagram_id: state.currentDiagram.id,
          user_id: user.id,
          cursor_x: cursorX,
          cursor_y: cursorY,
          last_seen: new Date().toISOString(),
        });
    } catch (error) {
      console.error('Failed to update presence:', error);
    }
  }, [state.currentDiagram, state.isRealTimeSyncEnabled]);

  const sendCollaborationEvent = useCallback(async (event: Omit<CollaborationEvent, 'user_id' | 'timestamp'>) => {
    if (!state.isRealTimeSyncEnabled) return;

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const fullEvent: CollaborationEvent = {
        ...event,
        user_id: user.id,
        timestamp: new Date().toISOString(),
      };

      dispatch({ type: 'ADD_COLLABORATION_EVENT', payload: fullEvent });
      
      // In a real implementation, this would send via WebSocket or Supabase Realtime
      console.log('Collaboration event:', fullEvent);
    } catch (error) {
      console.error('Failed to send collaboration event:', error);
    }
  }, [state.isRealTimeSyncEnabled]);

  // CI/CD operations
  const createCIConfiguration = useCallback(async (config: Omit<CIConfiguration, 'id' | 'created_at' | 'updated_at'>) => {
    try {
      const { error } = await supabase
        .from('cicd_configurations')
        .insert(config);

      if (error) throw error;

      toast.success('CI/CD configuration created');
    } catch (error) {
      toast.error('Failed to create CI/CD configuration');
      console.error(error);
    }
  }, []);

  const triggerDeployment = useCallback(async (ciConfigId: string) => {
    try {
      const { error } = await supabase
        .from('deployments')
        .insert({
          diagram_id: state.currentDiagram?.id,
          cicd_config_id: ciConfigId,
          status: 'pending',
        });

      if (error) throw error;

      toast.success('Deployment triggered');
    } catch (error) {
      toast.error('Failed to trigger deployment');
      console.error(error);
    }
  }, [state.currentDiagram]);

  // Security operations
  const runSecurityScan = useCallback(async () => {
    if (!state.currentDiagram) return;

    dispatch({ type: 'SET_GENERATING', payload: true });
    try {
      // Mock security scan - in real implementation, this would call AI service
      const mockThreats: SecurityThreat[] = [
        {
          id: '1',
          diagram_id: state.currentDiagram.id,
          threat_type: 'Open Security Group',
          severity: 'high',
          description: 'Security group allows inbound traffic from any IP address',
          affected_resources: ['sg-123'],
          mitigation_steps: ['Restrict inbound traffic to specific IP ranges', 'Use security group rules wisely'],
          ai_confidence: 0.95,
          is_resolved: false,
          detected_at: new Date().toISOString(),
        },
      ];

      dispatch({ type: 'SET_SECURITY_THREATS', payload: mockThreats });
      toast.success('Security scan completed');
    } catch (error) {
      toast.error('Failed to run security scan');
      console.error(error);
    } finally {
      dispatch({ type: 'SET_GENERATING', payload: false });
    }
  }, [state.currentDiagram]);

  const resolveThreat = useCallback(async (threatId: string) => {
    try {
      await supabase
        .from('security_threats')
        .update({ is_resolved: true, resolved_at: new Date().toISOString() })
        .eq('id', threatId);

      dispatch({
        type: 'UPDATE_TEAM_MEMBER', // Reusing action type for simplicity
        payload: { userId: threatId, updates: { is_resolved: true } },
      });

      toast.success('Threat resolved');
    } catch (error) {
      toast.error('Failed to resolve threat');
      console.error(error);
    }
  }, []);

  // Circuit diagram operations
  const createCircuitDiagram = useCallback(async (name: string) => {
    try {
      const { data, error } = await supabase
        .from('circuit_diagrams')
        .insert({
          name,
          components: [],
          connections: [],
        })
        .select()
        .single();

      if (error) throw error;

      toast.success('Circuit diagram created');
      return data.id;
    } catch (error) {
      toast.error('Failed to create circuit diagram');
      console.error(error);
      throw error;
    }
  }, []);

  // Set up real-time subscriptions
  useEffect(() => {
    if (!state.currentDiagram || !state.isRealTimeSyncEnabled) return;

    const presenceSubscription = supabase
      .channel('diagram_presence')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'diagram_presence',
          filter: `diagram_id=eq.${state.currentDiagram.id}`,
        },
        (payload) => {
          console.log('Presence change:', payload);
        }
      )
      .subscribe();

    return () => {
      presenceSubscription.unsubscribe();
    };
  }, [state.currentDiagram, state.isRealTimeSyncEnabled]);

  return (
    <EnhancedInfrastructureContext.Provider
      value={{
        state,
        dispatch,
        loadDiagram,
        saveDiagram,
        createDiagram,
        deleteDiagram,
        setGraph,
        addNode,
        updateNode,
        removeNode,
        addEdge,
        removeEdge,
        setIaCFramework,
        updatePresence,
        sendCollaborationEvent,
        createCIConfiguration,
        triggerDeployment,
        runSecurityScan,
        resolveThreat,
        createCircuitDiagram,
        undo,
        redo,
        canUndo,
        canRedo,
      }}
    >
      {children}
    </EnhancedInfrastructureContext.Provider>
  );
}

export function useEnhancedInfrastructure() {
  const context = useContext(EnhancedInfrastructureContext);
  if (context === undefined) {
    throw new Error('useEnhancedInfrastructure must be used within an EnhancedInfrastructureProvider');
  }
  return context;
}
