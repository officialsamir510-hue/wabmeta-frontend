// ✅ CREATE: src/pages/ChatbotBuilder.tsx

import React, { useState, useCallback, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import ReactFlow, {
  ReactFlowProvider,
  addEdge,
  useNodesState,
  useEdgesState,
  Controls,
  MiniMap,
  Background,
  type Connection,
  type Node,
  type NodeTypes,
} from 'reactflow';
import 'reactflow/dist/style.css';
import {
  Save, Play, ArrowLeft, Loader2
} from 'lucide-react';
import { chatbots as chatbotsApi } from '../services/api';
import toast from 'react-hot-toast';

// Custom Node Components & UI
import {
  StartNode, MessageNode, ButtonNode, ConditionNode,
  DelayNode, ActionNode, EndNode,
  NodeSidebar, NodeConfigPanel
} from '../components/chatbot';

const nodeTypes: NodeTypes = {
  start: StartNode,
  message: MessageNode,
  button: ButtonNode,
  condition: ConditionNode,
  delay: DelayNode,
  action: ActionNode,
  end: EndNode,
};

const ChatbotBuilder: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const reactFlowWrapper = useRef<HTMLDivElement>(null);

  const [chatbot, setChatbot] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);
  const [selectedNode, setSelectedNode] = useState<Node | null>(null);
  const [reactFlowInstance, setReactFlowInstance] = useState<any>(null);

  const isNewChatbot = id === 'new';

  useEffect(() => {
    if (!isNewChatbot && id) {
      loadChatbot();
    } else {
      // Initialize with default start node
      setNodes([
        {
          id: 'start-1',
          type: 'start',
          position: { x: 250, y: 50 },
          data: { label: 'Start', nextNodeId: '' },
        },
      ]);
      setChatbot({ name: 'New Chatbot', triggerKeywords: [], isDefault: false });
      setLoading(false);
    }
  }, [id]);

  const loadChatbot = async () => {
    try {
      const res = await chatbotsApi.getById(id!);
      if (res.data.success) {
        const data = res.data.data;
        setChatbot(data);

        if (data.flowData?.nodes) {
          setNodes(data.flowData.nodes);
        }
        if (data.flowData?.edges) {
          setEdges(data.flowData.edges);
        }
      }
    } catch (err) {
      toast.error('Failed to load chatbot');
      navigate('/dashboard/chatbots');
    } finally {
      setLoading(false);
    }
  };

  const onConnect = useCallback(
    (params: Connection) => setEdges((eds) => addEdge(params, eds)),
    [setEdges]
  );

  const onDragOver = useCallback((event: React.DragEvent) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = 'move';
  }, []);

  const onDrop = useCallback(
    (event: React.DragEvent) => {
      event.preventDefault();

      const type = event.dataTransfer.getData('application/reactflow');
      if (!type || !reactFlowInstance) return;

      const position = reactFlowInstance.screenToFlowPosition({
        x: event.clientX,
        y: event.clientY,
      });

      const newNode: Node = {
        id: `${type}-${Date.now()}`,
        type,
        position,
        data: getDefaultNodeData(type),
      };

      setNodes((nds) => nds.concat(newNode));
    },
    [reactFlowInstance]
  );

  const getDefaultNodeData = (type: string) => {
    switch (type) {
      case 'message':
        return { label: 'Message', message: 'Enter your message here' };
      case 'button':
        return {
          label: 'Buttons',
          message: 'Choose an option:',
          buttons: [{ id: '1', text: 'Option 1' }, { id: '2', text: 'Option 2' }]
        };
      case 'condition':
        return {
          label: 'Condition',
          condition: { variable: 'lastInput', operator: 'equals', value: '' }
        };
      case 'delay':
        return { label: 'Delay', delay: 1000 };
      case 'action':
        return { label: 'Action', action: { type: 'tagContact', params: {} } };
      case 'end':
        return { label: 'End' };
      default:
        return { label: type };
    }
  };

  const onNodeClick = useCallback((_event: React.MouseEvent, node: Node) => {
    setSelectedNode(node);
  }, []);

  const updateNodeData = (nodeId: string, newData: any) => {
    setNodes((nds) =>
      nds.map((node) => {
        if (node.id === nodeId) {
          return { ...node, data: { ...node.data, ...newData } };
        }
        return node;
      })
    );
    setSelectedNode((prev) => prev ? { ...prev, data: { ...prev.data, ...newData } } : null);
  };

  const deleteNode = (nodeId: string) => {
    setNodes((nds) => nds.filter((node) => node.id !== nodeId));
    setEdges((eds) => eds.filter((edge) => edge.source !== nodeId && edge.target !== nodeId));
    setSelectedNode(null);
  };

  const handleSave = async () => {
    if (!chatbot.name.trim()) {
      toast.error('Chatbot name is required');
      return;
    }

    setSaving(true);
    try {
      const flowData = { nodes, edges };

      if (isNewChatbot) {
        const res = await chatbotsApi.create({
          name: chatbot.name,
          description: chatbot.description,
          triggerKeywords: chatbot.triggerKeywords,
          isDefault: chatbot.isDefault,
          flowData,
        });

        if (res.data.success) {
          toast.success('Chatbot created');
          navigate(`/dashboard/chatbots/${res.data.data.id}`);
        }
      } else {
        await chatbotsApi.update(id!, { ...chatbot, flowData });
        toast.success('Chatbot saved');
      }
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to save');
    } finally {
      setSaving(false);
    }
  };

  const handleActivate = async () => {
    if (isNewChatbot) {
      toast.error('Save the chatbot first');
      return;
    }

    try {
      await chatbotsApi.activate(id!);
      toast.success('Chatbot activated');
      loadChatbot();
    } catch (err) {
      toast.error('Failed to activate');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Loader2 className="w-8 h-8 animate-spin text-green-600" />
      </div>
    );
  }

  return (
    <div className="h-screen flex flex-col bg-gray-100 dark:bg-gray-900">
      {/* Header */}
      <div className="flex-shrink-0 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-4 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate('/dashboard/chatbots')}
              className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div>
              <input
                type="text"
                value={chatbot?.name || ''}
                onChange={(e) => setChatbot({ ...chatbot, name: e.target.value })}
                className="text-xl font-bold bg-transparent border-none focus:outline-none focus:ring-2 focus:ring-green-500 rounded px-1"
                placeholder="Chatbot name"
              />
              <p className="text-sm text-gray-500">{nodes.length} nodes</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {chatbot?.status !== 'ACTIVE' && (
              <button
                onClick={handleActivate}
                disabled={isNewChatbot}
                className="flex items-center gap-2 px-4 py-2 bg-green-100 text-green-700 rounded-lg hover:bg-green-200 disabled:opacity-50"
              >
                <Play className="w-4 h-4" />
                Activate
              </button>
            )}
            <button
              onClick={handleSave}
              disabled={saving}
              className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50"
            >
              {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
              Save
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex overflow-hidden">
        {/* Node Sidebar */}
        <NodeSidebar />

        {/* Flow Canvas */}
        <div ref={reactFlowWrapper} className="flex-1">
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
            nodeTypes={nodeTypes}
            fitView
            snapToGrid
            snapGrid={[15, 15]}
          >
            <Controls />
            <MiniMap />
            <Background gap={15} />
          </ReactFlow>
        </div>

        {/* Config Panel */}
        {selectedNode && (
          <NodeConfigPanel
            node={selectedNode}
            onUpdate={(data: any) => updateNodeData(selectedNode.id, data)}
            onDelete={() => deleteNode(selectedNode.id)}
            onClose={() => setSelectedNode(null)}
          />
        )}
      </div>
    </div>
  );
};

// Wrap with provider
const ChatbotBuilderWrapper: React.FC = () => (
  <ReactFlowProvider>
    <ChatbotBuilder />
  </ReactFlowProvider>
);

export default ChatbotBuilderWrapper;