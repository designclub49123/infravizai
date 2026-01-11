import React, { createContext, useContext, useReducer, useCallback } from 'react';
import type { InfraGraph, InfraNode, InfraEdge, IaCFramework, SecurityReport } from '@/types/infrastructure';

interface InfraState {
  graph: InfraGraph | null;
  iacFramework: IaCFramework;
  iacCode: string;
  securityReport: SecurityReport | null;
  isGenerating: boolean;
  isSyncing: boolean;
  history: InfraGraph[];
  historyIndex: number;
}

type InfraAction =
  | { type: 'SET_GRAPH'; payload: InfraGraph }
  | { type: 'UPDATE_NODE'; payload: { id: string; updates: Partial<InfraNode> } }
  | { type: 'ADD_NODE'; payload: InfraNode }
  | { type: 'REMOVE_NODE'; payload: string }
  | { type: 'ADD_EDGE'; payload: InfraEdge }
  | { type: 'REMOVE_EDGE'; payload: string }
  | { type: 'SET_IAC_FRAMEWORK'; payload: IaCFramework }
  | { type: 'SET_IAC_CODE'; payload: string }
  | { type: 'SET_SECURITY_REPORT'; payload: SecurityReport | null }
  | { type: 'SET_GENERATING'; payload: boolean }
  | { type: 'SET_SYNCING'; payload: boolean }
  | { type: 'UNDO' }
  | { type: 'REDO' }
  | { type: 'CLEAR' };

const initialState: InfraState = {
  graph: null,
  iacFramework: 'terraform',
  iacCode: '',
  securityReport: null,
  isGenerating: false,
  isSyncing: false,
  history: [],
  historyIndex: -1,
};

function infraReducer(state: InfraState, action: InfraAction): InfraState {
  switch (action.type) {
    case 'SET_GRAPH': {
      const newHistory = state.history.slice(0, state.historyIndex + 1);
      newHistory.push(action.payload);
      return {
        ...state,
        graph: action.payload,
        history: newHistory.slice(-50), // Keep last 50 states
        historyIndex: Math.min(newHistory.length - 1, 49),
      };
    }

    case 'UPDATE_NODE': {
      if (!state.graph) return state;
      const updatedNodes = state.graph.nodes.map((node) =>
        node.id === action.payload.id ? { ...node, ...action.payload.updates } : node
      );
      const newGraph = { ...state.graph, nodes: updatedNodes, metadata: { ...state.graph.metadata, updatedAt: new Date().toISOString() } };
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

    case 'SET_GENERATING':
      return { ...state, isGenerating: action.payload };

    case 'SET_SYNCING':
      return { ...state, isSyncing: action.payload };

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

interface InfraContextType {
  state: InfraState;
  dispatch: React.Dispatch<InfraAction>;
  setGraph: (graph: InfraGraph) => void;
  addNode: (node: InfraNode) => void;
  updateNode: (id: string, updates: Partial<InfraNode>) => void;
  removeNode: (id: string) => void;
  addEdge: (edge: InfraEdge) => void;
  removeEdge: (id: string) => void;
  setIaCFramework: (framework: IaCFramework) => void;
  undo: () => void;
  redo: () => void;
  canUndo: boolean;
  canRedo: boolean;
}

const InfrastructureContext = createContext<InfraContextType | undefined>(undefined);

export function InfrastructureProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(infraReducer, initialState);

  const setGraph = useCallback((graph: InfraGraph) => dispatch({ type: 'SET_GRAPH', payload: graph }), []);
  const addNode = useCallback((node: InfraNode) => dispatch({ type: 'ADD_NODE', payload: node }), []);
  const updateNode = useCallback((id: string, updates: Partial<InfraNode>) => dispatch({ type: 'UPDATE_NODE', payload: { id, updates } }), []);
  const removeNode = useCallback((id: string) => dispatch({ type: 'REMOVE_NODE', payload: id }), []);
  const addEdge = useCallback((edge: InfraEdge) => dispatch({ type: 'ADD_EDGE', payload: edge }), []);
  const removeEdge = useCallback((id: string) => dispatch({ type: 'REMOVE_EDGE', payload: id }), []);
  const setIaCFramework = useCallback((framework: IaCFramework) => dispatch({ type: 'SET_IAC_FRAMEWORK', payload: framework }), []);
  const undo = useCallback(() => dispatch({ type: 'UNDO' }), []);
  const redo = useCallback(() => dispatch({ type: 'REDO' }), []);

  const canUndo = state.historyIndex > 0;
  const canRedo = state.historyIndex < state.history.length - 1;

  return (
    <InfrastructureContext.Provider
      value={{
        state,
        dispatch,
        setGraph,
        addNode,
        updateNode,
        removeNode,
        addEdge,
        removeEdge,
        setIaCFramework,
        undo,
        redo,
        canUndo,
        canRedo,
      }}
    >
      {children}
    </InfrastructureContext.Provider>
  );
}

export function useInfrastructure() {
  const context = useContext(InfrastructureContext);
  if (context === undefined) {
    throw new Error('useInfrastructure must be used within an InfrastructureProvider');
  }
  return context;
}
