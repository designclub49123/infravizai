// Logic Gate Types for Circuit Diagrams
export type LogicGateType =
  | 'and'
  | 'or'
  | 'not'
  | 'nand'
  | 'nor'
  | 'xor'
  | 'xnor'
  | 'buffer'
  | 'input'
  | 'output'
  | 'clock'
  | 'led'
  | 'switch'
  | 'ground'
  | 'vcc';

export interface LogicGateMetadata {
  type: LogicGateType;
  label: string;
  icon: string;
  inputs: number;
  outputs: number;
  color: string;
  description: string;
}

export const LOGIC_GATES: Record<LogicGateType, LogicGateMetadata> = {
  and: {
    type: 'and',
    label: 'AND Gate',
    icon: 'LogicAnd',
    inputs: 2,
    outputs: 1,
    color: 'gate-logic',
    description: 'Output is HIGH only when all inputs are HIGH',
  },
  or: {
    type: 'or',
    label: 'OR Gate',
    icon: 'LogicOr',
    inputs: 2,
    outputs: 1,
    color: 'gate-logic',
    description: 'Output is HIGH when any input is HIGH',
  },
  not: {
    type: 'not',
    label: 'NOT Gate (Inverter)',
    icon: 'LogicNot',
    inputs: 1,
    outputs: 1,
    color: 'gate-logic',
    description: 'Output is the inverse of input',
  },
  nand: {
    type: 'nand',
    label: 'NAND Gate',
    icon: 'LogicNand',
    inputs: 2,
    outputs: 1,
    color: 'gate-logic',
    description: 'Output is LOW only when all inputs are HIGH',
  },
  nor: {
    type: 'nor',
    label: 'NOR Gate',
    icon: 'LogicNor',
    inputs: 2,
    outputs: 1,
    color: 'gate-logic',
    description: 'Output is HIGH only when all inputs are LOW',
  },
  xor: {
    type: 'xor',
    label: 'XOR Gate',
    icon: 'LogicXor',
    inputs: 2,
    outputs: 1,
    color: 'gate-logic',
    description: 'Output is HIGH when inputs differ',
  },
  xnor: {
    type: 'xnor',
    label: 'XNOR Gate',
    icon: 'LogicXnor',
    inputs: 2,
    outputs: 1,
    color: 'gate-logic',
    description: 'Output is HIGH when inputs are the same',
  },
  buffer: {
    type: 'buffer',
    label: 'Buffer',
    icon: 'LogicBuffer',
    inputs: 1,
    outputs: 1,
    color: 'gate-io',
    description: 'Passes input to output unchanged',
  },
  input: {
    type: 'input',
    label: 'Input',
    icon: 'CircleArrowRight',
    inputs: 0,
    outputs: 1,
    color: 'gate-io',
    description: 'Signal input source',
  },
  output: {
    type: 'output',
    label: 'Output',
    icon: 'CircleArrowLeft',
    inputs: 1,
    outputs: 0,
    color: 'gate-io',
    description: 'Signal output destination',
  },
  clock: {
    type: 'clock',
    label: 'Clock',
    icon: 'Clock',
    inputs: 0,
    outputs: 1,
    color: 'gate-source',
    description: 'Generates clock signal',
  },
  led: {
    type: 'led',
    label: 'LED',
    icon: 'Lightbulb',
    inputs: 1,
    outputs: 0,
    color: 'gate-output',
    description: 'Light indicator',
  },
  switch: {
    type: 'switch',
    label: 'Switch',
    icon: 'ToggleLeft',
    inputs: 0,
    outputs: 1,
    color: 'gate-source',
    description: 'Manual on/off switch',
  },
  ground: {
    type: 'ground',
    label: 'Ground',
    icon: 'ArrowDownToLine',
    inputs: 1,
    outputs: 0,
    color: 'gate-power',
    description: 'Ground reference (0V)',
  },
  vcc: {
    type: 'vcc',
    label: 'VCC',
    icon: 'ArrowUpFromLine',
    inputs: 0,
    outputs: 1,
    color: 'gate-power',
    description: 'Power supply (5V/3.3V)',
  },
};

export interface CircuitNode {
  id: string;
  type: LogicGateType;
  label: string;
  state: boolean; // Current output state
  position: { x: number; y: number };
}

export interface CircuitEdge {
  id: string;
  source: string;
  sourceHandle: string;
  target: string;
  targetHandle: string;
}

export interface CircuitDiagram {
  nodes: CircuitNode[];
  edges: CircuitEdge[];
  metadata: {
    name: string;
    createdAt: string;
    updatedAt: string;
  };
}
