import React, { useState, useCallback, useRef } from 'react';
import ReactFlow, {
  addEdge,
  useNodesState,
  useEdgesState,
  Background,
  type Connection,
  type Edge,
  type Node,
  ReactFlowProvider,
  type ReactFlowInstance,
  MarkerType
} from 'reactflow';
import 'reactflow/dist/style.css';

import StartNode from './nodes/StartNode';
import MessageNode from './nodes/MessageNode';
import ButtonNode from './nodes/ButtonNode';
import ConditionNode from './nodes/ConditionNode';
import NodeSidebar from './NodeSidebar';
import NodeConfigPanel from './NodeConfigPanel';
import FlowControls from './FlowControls';
import type { ChatbotNodeData } from '../../types/chatbot';

const nodeTypes = {
  start: StartNode,
  message: MessageNode,
  button: ButtonNode,
  condition: ConditionNode,
};

const initialNodes: Node[] = [
  {
    id: 'start',
    type: 'start',
    position: { x: 250, y: 50 },
    data: { label: 'Start' }
  },
  {
    id: 'welcome',
    type: 'message',
    position: { x: 250, y: 200 },
    data: { label: 'Welcome', content: 'Hello! Welcome to our support chat. How can we help you today?' }
  }
];

const initialEdges: Edge[] = [
  { id: 'e1', source: 'start', target: 'welcome', type: 'smoothstep', animated: true }
];

const FlowCanvas: React.FC = () => {
  const reactFlowWrapper = useRef<HTMLDivElement>(null);
  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);
  const [reactFlowInstance, setReactFlowInstance] = useState<ReactFlowInstance | null>(null);
  const [selectedNode, setSelectedNode] = useState<Node<ChatbotNodeData> | null>(null);

  const onConnect = useCallback((params: Connection) => {
    setEdges((eds) => addEdge({ 
      ...params, 
      type: 'smoothstep', 
      markerEnd: { type: MarkerType.ArrowClosed } 
    }, eds));
  }, [setEdges]);

  const onDragOver = useCallback((event: React.DragEvent) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = 'move';
  }, []);

  const onDrop = useCallback(
    (event: React.DragEvent) => {
      event.preventDefault();

      if (!reactFlowWrapper.current || !reactFlowInstance) return;

      const type = event.dataTransfer.getData('application/reactflow');
      if (!type) return;

      const position = reactFlowInstance.project({
        x: event.clientX - reactFlowWrapper.current.getBoundingClientRect().left,
        y: event.clientY - reactFlowWrapper.current.getBoundingClientRect().top,
      });

      const newNode: Node = {
        id: `${type}-${Date.now()}`,
        type,
        position,
        data: { 
          label: `${type.charAt(0).toUpperCase() + type.slice(1)} Node`,
          content: '',
          options: type === 'button' ? ['Yes', 'No'] : undefined
        },
      };

      setNodes((nds) => [...nds, newNode]);
    },
    [reactFlowInstance, setNodes]
  );

  const onNodeClick = useCallback((_: React.MouseEvent, node: Node) => {
    setSelectedNode(node);
  }, []);

  const onPaneClick = useCallback(() => {
    setSelectedNode(null);
  }, []);

  const updateNodeData = (nodeId: string, newData: ChatbotNodeData) => {
    setNodes((nds) =>
      nds.map((node) => {
        if (node.id === nodeId) {
          return { ...node, data: newData };
        }
        return node;
      })
    );
  };

  const handleSave = () => {
    if (reactFlowInstance) {
      const flow = reactFlowInstance.toObject();
      console.log('Saved Flow:', flow);
      alert('Flow saved successfully!');
    }
  };

  return (
    <div className="flex h-[calc(100vh-64px)] w-full">
      <ReactFlowProvider>
        <NodeSidebar />
        
        <div className="flex-1 h-full relative" ref={reactFlowWrapper}>
          <ReactFlow
            nodes={nodes}
            edges={edges}
            onNodesChange={onNodesChange}
            onEdgesChange={onEdgesChange}
            onConnect={onConnect}
            onInit={setReactFlowInstance}
            onDrop={onDrop}
            onDragOver={onDragOver}
            onNodeClick={onNodeClick}
            onPaneClick={onPaneClick}
            nodeTypes={nodeTypes}
            fitView
            attributionPosition="bottom-left"
          >
            <Background color="#f1f5f9" gap={16} />
            <FlowControls 
              onSave={handleSave}
              onTest={() => alert('Test mode activated')}
              onReset={() => {
                setNodes(initialNodes);
                setEdges(initialEdges);
              }}
              zoomIn={() => reactFlowInstance?.zoomIn()}
              zoomOut={() => reactFlowInstance?.zoomOut()}
              fitView={() => reactFlowInstance?.fitView()}
            />
          </ReactFlow>
        </div>

        {selectedNode && (
          <NodeConfigPanel
            node={selectedNode}
            onChange={updateNodeData}
            onClose={() => setSelectedNode(null)}
          />
        )}
      </ReactFlowProvider>
    </div>
  );
};

export default FlowCanvas;