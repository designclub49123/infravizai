// GitOps & CI/CD Types
export type GitProvider = 'github' | 'gitlab' | 'bitbucket';
export type CIPlatform = 'github_actions' | 'gitlab_ci' | 'jenkins' | 'azure_devops';
export type DeploymentStatus = 'pending' | 'running' | 'success' | 'failed' | 'cancelled';

export interface GitRepository {
  id: string;
  user_id: string;
  provider: GitProvider;
  repository_name: string;
  repository_url: string;
  access_token?: string;
  branch: string;
  is_connected: boolean;
  created_at: string;
  updated_at: string;
}

export interface CIConfiguration {
  id: string;
  diagram_id: string;
  git_repository_id?: string;
  platform: CIPlatform;
  config: Record<string, any>;
  is_enabled: boolean;
  created_at: string;
  updated_at: string;
}

export interface Deployment {
  id: string;
  diagram_id: string;
  cicd_config_id?: string;
  status: DeploymentStatus;
  commit_hash?: string;
  commit_message?: string;
  deployment_url?: string;
  logs?: string;
  started_at: string;
  completed_at?: string;
  created_by?: string;
}

// Import types from infrastructure.ts
import type { SecuritySeverity, InfraNode, InfraEdge, IaCFramework, IaCOutput } from './infrastructure';

// Logic Gates & Circuit Diagram Types
export type LogicGateType = 'and' | 'or' | 'not' | 'xor' | 'nand' | 'nor' | 'xnor' | 'input' | 'output' | 'led' | 'switch' | 'clock' | 'vcc' | 'ground';
export type CircuitComponentType = 'logic_gate' | 'input' | 'output' | 'wire' | 'power' | 'ground';

export interface CircuitComponent {
  id: string;
  type: CircuitComponentType;
  gate_type?: LogicGateType;
  position: { x: number; y: number };
  label: string;
  properties: Record<string, any>;
  inputs: string[];
  outputs: string[];
}

export interface CircuitConnection {
  id: string;
  source: string;
  target: string;
  source_port?: string;
  target_port?: string;
}

export interface CircuitDiagram {
  id: string;
  user_id: string;
  team_id?: string;
  name: string;
  description?: string;
  components: CircuitComponent[];
  connections: CircuitConnection[];
  is_public: boolean;
  created_at: string;
  updated_at: string;
}

// AI Security Threat Detection Types
export interface SecurityThreat {
  id: string;
  diagram_id: string;
  threat_type: string;
  severity: SecuritySeverity;
  description: string;
  affected_resources: string[];
  mitigation_steps: string[];
  ai_confidence?: number;
  is_resolved: boolean;
  detected_at: string;
  resolved_at?: string;
}

// Enhanced Diagram Types with Collaboration
export interface DiagramPresence {
  id: string;
  diagram_id: string;
  user_id: string;
  cursor_x: number;
  cursor_y: number;
  color: string;
  last_seen: string;
}

export interface DiagramComment {
  id: string;
  diagram_id: string;
  user_id: string;
  content: string;
  position: { x: number; y: number };
  created_at: string;
  updated_at: string;
}

// AI Text-to-Diagram Types
export interface TextToDiagramRequest {
  description: string;
  provider: 'aws' | 'azure' | 'gcp';
  region?: string;
}

export interface GeneratedDiagram {
  nodes: InfraNode[];
  edges: InfraEdge[];
  metadata: {
    name: string;
    description: string;
    provider: string;
    estimated_cost?: number;
  };
}

// Real-time Collaboration Types
export interface CollaborationEvent {
  type: 'cursor_move' | 'node_add' | 'node_update' | 'node_delete' | 'edge_add' | 'edge_delete';
  user_id: string;
  diagram_id: string;
  data: any;
  timestamp: string;
}

// Enhanced IaC Generation Types
export interface IaCGenerationOptions {
  framework: IaCFramework;
  provider: 'aws' | 'azure' | 'gcp';
  region: string;
  include_comments: boolean;
  security_best_practices: boolean;
  cost_optimization: boolean;
}

export interface EnhancedIaCOutput extends IaCOutput {
  security_recommendations: string[];
  cost_estimates: Record<string, number>;
  compliance_checks: {
    iso27001: boolean;
    gdpr: boolean;
    hipaa: boolean;
  };
}

// UI State Types
export interface DiagramEditorState {
  selectedNode?: string;
  selectedEdge?: string;
  showPropertiesPanel: boolean;
  showCodePanel: boolean;
  showTeamPanel: boolean;
  zoom: number;
  pan: { x: number; y: number };
}

export interface CircuitEditorState {
  selectedComponent?: string;
  simulationRunning: boolean;
  showTruthTable: boolean;
}
