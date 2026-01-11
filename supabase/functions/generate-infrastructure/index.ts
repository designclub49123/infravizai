import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');

interface InfraNode {
  id: string;
  type: string;
  label: string;
  properties: Record<string, any>;
  position: { x: number; y: number };
}

interface InfraEdge {
  id: string;
  source: string;
  target: string;
  label?: string;
  type?: string;
}

interface InfraGraph {
  nodes: InfraNode[];
  edges: InfraEdge[];
  metadata: {
    name: string;
    region: string;
    createdAt: string;
    updatedAt: string;
  };
}

function generateId(): string {
  return Math.random().toString(36).substring(2, 10);
}

const systemPrompt = `You are an expert AWS cloud architect. Your task is to analyze infrastructure descriptions and generate a detailed JSON graph representing the AWS resources and their relationships.

RULES:
1. Always return valid JSON with the exact structure specified
2. Include all necessary supporting resources (e.g., security groups, IAM roles, internet gateways)
3. Use realistic configurations and proper CIDR blocks
4. Infer relationships and dependencies between resources
5. Add appropriate labels and properties for each resource
6. RESPOND WITH ONLY THE JSON, NO MARKDOWN FORMATTING

AVAILABLE RESOURCE TYPES:
- vpc, subnet, ec2, rds, alb, s3, lambda
- security-group, iam-role, nat-gateway, internet-gateway
- route-table, cloudfront, api-gateway, dynamodb, sqs, sns, elasticache

RESPONSE FORMAT (JSON only, no markdown code blocks):
{
  "nodes": [
    {
      "id": "unique_id",
      "type": "resource_type",
      "label": "Display Name",
      "properties": {
        "cidr": "10.0.0.0/16",
        "instanceType": "t3.micro",
        "encrypted": true,
        "isPublic": true
      },
      "position": { "x": 0, "y": 0 }
    }
  ],
  "edges": [
    {
      "id": "unique_edge_id",
      "source": "node_id",
      "target": "node_id",
      "type": "contains",
      "label": "optional relationship label"
    }
  ],
  "metadata": {
    "name": "Infrastructure Name",
    "region": "us-east-1",
    "createdAt": "ISO timestamp",
    "updatedAt": "ISO timestamp"
  }
}`;

async function generateWithAI(prompt: string): Promise<InfraGraph> {
  if (!LOVABLE_API_KEY) {
    throw new Error('LOVABLE_API_KEY not configured');
  }

  const response = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${LOVABLE_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: 'google/gemini-3-flash-preview',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: `Generate an AWS infrastructure graph for: ${prompt}` }
      ],
      temperature: 0.7,
      max_tokens: 4096,
    }),
  });

  if (!response.ok) {
    if (response.status === 429) {
      throw new Error('Rate limit exceeded. Please try again later.');
    }
    if (response.status === 402) {
      throw new Error('Usage limit reached. Please add credits to continue.');
    }
    const error = await response.text();
    console.error('Lovable AI error:', error);
    throw new Error(`AI API error: ${response.status}`);
  }

  const data = await response.json();
  const content = data.choices?.[0]?.message?.content;
  
  if (!content) {
    throw new Error('No response from AI');
  }

  // Parse JSON from response (handle potential markdown code blocks)
  let jsonStr = content;
  const jsonMatch = content.match(/```(?:json)?\s*([\s\S]*?)\s*```/);
  if (jsonMatch) {
    jsonStr = jsonMatch[1];
  }

  try {
    const graph = JSON.parse(jsonStr.trim());
    
    // Validate and ensure proper structure
    if (!graph.nodes || !Array.isArray(graph.nodes)) {
      throw new Error('Invalid graph structure: missing nodes array');
    }
    
    // Ensure all nodes have required fields
    graph.nodes = graph.nodes.map((node: any, index: number) => ({
      id: node.id || generateId(),
      type: node.type || 'ec2',
      label: node.label || `Resource ${index + 1}`,
      properties: node.properties || {},
      position: node.position || { x: 0, y: 0 },
    }));

    // Ensure edges array exists
    if (!graph.edges || !Array.isArray(graph.edges)) {
      graph.edges = [];
    }

    // Ensure metadata
    graph.metadata = {
      name: graph.metadata?.name || 'Generated Infrastructure',
      region: graph.metadata?.region || 'us-east-1',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    // Auto-layout the nodes
    return autoLayoutGraph(graph);
  } catch (parseError) {
    console.error('JSON parse error:', parseError, 'Content:', jsonStr);
    throw new Error('Failed to parse AI response as JSON');
  }
}

function autoLayoutGraph(graph: InfraGraph): InfraGraph {
  const layerMap: Record<string, number> = {
    'internet-gateway': 0,
    'cloudfront': 0,
    'alb': 1,
    'api-gateway': 1,
    'vpc': 0,
    'subnet': 2,
    'nat-gateway': 2,
    'ec2': 3,
    'lambda': 3,
    'security-group': 4,
    'rds': 4,
    'dynamodb': 4,
    'elasticache': 4,
    's3': 5,
    'sqs': 5,
    'sns': 5,
    'iam-role': 6,
    'route-table': 2,
  };

  const layers: Record<number, InfraNode[]> = {};
  
  graph.nodes.forEach(node => {
    const layer = layerMap[node.type] ?? 3;
    if (!layers[layer]) layers[layer] = [];
    layers[layer].push(node);
  });

  const startX = 100;
  const startY = 100;
  const xGap = 220;
  const yGap = 160;

  const layoutNodes: InfraNode[] = [];
  
  Object.keys(layers).sort((a, b) => Number(a) - Number(b)).forEach((layerKey, layerIndex) => {
    const layerNodes = layers[Number(layerKey)];
    const layerWidth = layerNodes.length * xGap;
    const offsetX = startX - (layerWidth / 2) + (xGap / 2);

    layerNodes.forEach((node, nodeIndex) => {
      layoutNodes.push({
        ...node,
        position: {
          x: offsetX + (nodeIndex * xGap) + 300,
          y: startY + (layerIndex * yGap),
        },
      });
    });
  });

  return { ...graph, nodes: layoutNodes };
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { prompt, action } = await req.json();

    if (!prompt) {
      throw new Error('Prompt is required');
    }

    console.log('Generating infrastructure for:', prompt);
    
    const graph = await generateWithAI(prompt);
    
    console.log('Generated graph with', graph.nodes.length, 'nodes');

    return new Response(
      JSON.stringify({ success: true, graph }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error:', error);
    const message = error instanceof Error ? error.message : 'Unknown error';
    return new Response(
      JSON.stringify({ success: false, error: message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
