// src/pages/ChatbotBuilder.tsx

import React, { useState, useCallback, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  ArrowLeft,
  Save,
  Play,
  Pause,
  Settings,
  Zap,
  MessageSquare,
  Plus,
  X,
  AlertCircle,
  CheckCircle,
} from 'lucide-react';
import ReactFlow, {

  Background,
  Controls,
  MiniMap,
  addEdge,
  useNodesState,
  useEdgesState,
  type Connection,
  type Edge,
  type Node,
  type NodeTypes,
} from 'reactflow';
import 'reactflow/dist/style.css';

import { useChatbot } from '../hooks/useChatbot';
import { chatbot as chatbotApi } from '../services/api';
import type { FlowNode, FlowEdge } from '../types/chatbot';

// Import custom nodes
import StartNode from '../components/chatbot/nodes/StartNode';
import MessageNode from '../components/chatbot/nodes/MessageNode';
import ButtonNode from '../components/chatbot/nodes/ButtonNode';
import ConditionNode from '../components/chatbot/nodes/ConditionNode';

// Node types registration
const nodeTypes: NodeTypes = {
  start: StartNode,
  message: MessageNode,
  button: ButtonNode,
  condition: ConditionNode,
};

const ChatbotBuilder: React.FC = () => {
  const { id } = useParams<{ id: string }>();

  const { chatbot, loading, saving, error, updateChatbot, updateFlowData, saveChatbot } = useChatbot(id!);

  // React Flow state
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);

  // UI state
  const [showSettings, setShowSettings] = useState(false);
  const [selectedNode, setSelectedNode] = useState<Node | null>(null);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  // Settings form state
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [welcomeMessage, setWelcomeMessage] = useState('');
  const [fallbackMessage, setFallbackMessage] = useState('');
  const [triggerKeywords, setTriggerKeywords] = useState<string[]>([]);
  const [newKeyword, setNewKeyword] = useState('');
  const [isDefault, setIsDefault] = useState(false);

  // Initialize flow from chatbot data
  useEffect(() => {
    if (chatbot) {
      setNodes((chatbot.flowData?.nodes as FlowNode[]) || []);
      setEdges((chatbot.flowData?.edges as FlowEdge[]) || []);
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setName(chatbot.name);
      setDescription(chatbot.description || '');
      setWelcomeMessage(chatbot.welcomeMessage || '');
      setFallbackMessage(chatbot.fallbackMessage || '');
      setTriggerKeywords(chatbot.triggerKeywords || []);
      setIsDefault(chatbot.isDefault);
    }
  }, [chatbot]);

  // Handle edge connection
  const onConnect = useCallback(
    (connection: Connection) => {
      setEdges((eds) => addEdge(connection, eds));
      setHasUnsavedChanges(true);
    },
    [setEdges]
  );

  // Handle node click
  const onNodeClick = useCallback((event: React.MouseEvent, node: Node) => {
    setSelectedNode(node);
  }, []);

  // Add new node
  const addNode = (type: string) => {
    const newNode: Node = {
      id: `${type}_${Date.now()}`,
      type,
      position: { x: 250, y: nodes.length * 100 + 100 },
      data: {
        label: type === 'message' ? 'Message' : type === 'button' ? 'Buttons' : 'Condition',
        message: type === 'message' ? 'Hello! How can I help you?' : '',
        buttons: type === 'button' ? [{ id: '1', text: 'Option 1', type: 'reply' }] : [],
        condition: type === 'condition' ? { type: 'contains', value: '' } : undefined,
      },
    };

    setNodes((nds) => [...nds, newNode]);
    setHasUnsavedChanges(true);
  };

  // Update node data
  const updateNodeData = (nodeId: string, data: any) => {
    setNodes((nds) =>
      nds.map((node) =>
        node.id === nodeId ? { ...node, data: { ...node.data, ...data } } : node
      )
    );
    setHasUnsavedChanges(true);
  };

  // Delete node
  const deleteNode = (nodeId: string) => {
    setNodes((nds) => nds.filter((node) => node.id !== nodeId));
    setEdges((eds) => eds.filter((edge) => edge.source !== nodeId && edge.target !== nodeId));
    setSelectedNode(null);
    setHasUnsavedChanges(true);
  };

  // Add keyword
  const addKeyword = () => {
    if (newKeyword.trim() && !triggerKeywords.includes(newKeyword.trim())) {
      setTriggerKeywords([...triggerKeywords, newKeyword.trim()]);
      setNewKeyword('');
      setHasUnsavedChanges(true);
    }
  };

  // Remove keyword
  const removeKeyword = (keyword: string) => {
    setTriggerKeywords(triggerKeywords.filter((k) => k !== keyword));
    setHasUnsavedChanges(true);
  };

  // Save chatbot
  const handleSave = async () => {
    try {
      await updateFlowData({ nodes: nodes as FlowNode[], edges: edges as FlowEdge[] });
      await updateChatbot({
        name,
        description,
        welcomeMessage,
        fallbackMessage,
        triggerKeywords,
        isDefault,
      });
      await saveChatbot();

      setHasUnsavedChanges(false);
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (err) {
      console.error('Error saving:', err);
    }
  };

  // Activate/Deactivate
  const handleToggleStatus = async () => {
    if (!chatbot) return;

    try {
      if (chatbot.status === 'ACTIVE') {
        await chatbotApi.deactivate(chatbot.id);
      } else {
        await chatbotApi.activate(chatbot.id);
      }
      window.location.reload();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to update status');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading chatbot...</p>
        </div>
      </div>
    );
  }

  if (error || !chatbot) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-gray-900 mb-2">Error Loading Chatbot</h2>
          <p className="text-gray-600 mb-4">{error || 'Chatbot not found'}</p>
          <Link
            to="/chatbot"
            className="inline-flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
          >
            Back to Chatbots
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen flex flex-col bg-gray-100">
      {/* Header */}
      <div className="bg-white border-b px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link to="/chatbot" className="p-2 hover:bg-gray-100 rounded-lg">
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <h1 className="font-bold text-gray-900">{chatbot.name}</h1>
            <p className="text-sm text-gray-500">
              {chatbot.status === 'ACTIVE' ? (
                <span className="text-green-600">● Active</span>
              ) : chatbot.status === 'PAUSED' ? (
                <span className="text-yellow-600">● Paused</span>
              ) : (
                <span className="text-gray-400">● Draft</span>
              )}
              {hasUnsavedChanges && <span className="ml-2 text-orange-500">• Unsaved changes</span>}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {saveSuccess && (
            <span className="flex items-center text-green-600 text-sm">
              <CheckCircle className="w-4 h-4 mr-1" />
              Saved!
            </span>
          )}

          <button
            onClick={() => setShowSettings(!showSettings)}
            className={`p-2 rounded-lg transition-colors ${showSettings ? 'bg-gray-100' : 'hover:bg-gray-100'
              }`}
          >
            <Settings className="w-5 h-5" />
          </button>

          <button
            onClick={handleToggleStatus}
            className={`inline-flex items-center px-4 py-2 rounded-lg text-sm font-medium transition-colors ${chatbot.status === 'ACTIVE'
              ? 'bg-yellow-100 text-yellow-800 hover:bg-yellow-200'
              : 'bg-green-100 text-green-800 hover:bg-green-200'
              }`}
          >
            {chatbot.status === 'ACTIVE' ? (
              <>
                <Pause className="w-4 h-4 mr-2" />
                Pause
              </>
            ) : (
              <>
                <Play className="w-4 h-4 mr-2" />
                Activate
              </>
            )}
          </button>

          <button
            onClick={handleSave}
            disabled={saving || !hasUnsavedChanges}
            className="inline-flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 transition-colors"
          >
            {saving ? (
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
            ) : (
              <Save className="w-4 h-4 mr-2" />
            )}
            Save
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex overflow-hidden">
        {/* Node Sidebar */}
        <div className="w-64 bg-white border-r p-4 overflow-y-auto">
          <h3 className="font-semibold text-gray-900 mb-4">Add Nodes</h3>

          <div className="space-y-2">
            <button
              onClick={() => addNode('message')}
              className="w-full flex items-center gap-3 p-3 border rounded-lg hover:bg-gray-50 transition-colors"
            >
              <div className="w-8 h-8 bg-blue-100 rounded flex items-center justify-center">
                <MessageSquare className="w-4 h-4 text-blue-600" />
              </div>
              <div className="text-left">
                <p className="font-medium text-gray-900 text-sm">Message</p>
                <p className="text-xs text-gray-500">Send a text message</p>
              </div>
            </button>

            <button
              onClick={() => addNode('button')}
              className="w-full flex items-center gap-3 p-3 border rounded-lg hover:bg-gray-50 transition-colors"
            >
              <div className="w-8 h-8 bg-purple-100 rounded flex items-center justify-center">
                <Plus className="w-4 h-4 text-purple-600" />
              </div>
              <div className="text-left">
                <p className="font-medium text-gray-900 text-sm">Buttons</p>
                <p className="text-xs text-gray-500">Interactive buttons</p>
              </div>
            </button>

            <button
              onClick={() => addNode('condition')}
              className="w-full flex items-center gap-3 p-3 border rounded-lg hover:bg-gray-50 transition-colors"
            >
              <div className="w-8 h-8 bg-orange-100 rounded flex items-center justify-center">
                <Zap className="w-4 h-4 text-orange-600" />
              </div>
              <div className="text-left">
                <p className="font-medium text-gray-900 text-sm">Condition</p>
                <p className="text-xs text-gray-500">Branch based on input</p>
              </div>
            </button>
          </div>

          {/* Selected Node Config */}
          {selectedNode && selectedNode.type !== 'start' && (
            <div className="mt-6 pt-6 border-t">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold text-gray-900">Node Settings</h3>
                <button
                  onClick={() => setSelectedNode(null)}
                  className="p-1 hover:bg-gray-100 rounded"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {selectedNode.type === 'message' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Message
                  </label>
                  <textarea
                    value={selectedNode.data.message || ''}
                    onChange={(e) =>
                      updateNodeData(selectedNode.id, { message: e.target.value })
                    }
                    rows={4}
                    className="w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
                    placeholder="Enter message..."
                  />
                </div>
              )}

              {selectedNode.type === 'condition' && (
                <div className="space-y-3">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Condition Type
                    </label>
                    <select
                      value={selectedNode.data.condition?.type || 'contains'}
                      onChange={(e) =>
                        updateNodeData(selectedNode.id, {
                          condition: {
                            ...selectedNode.data.condition,
                            type: e.target.value,
                          },
                        })
                      }
                      className="w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
                    >
                      <option value="contains">Contains</option>
                      <option value="exact">Exact match</option>
                      <option value="keyword">Keyword</option>
                      <option value="regex">Regex</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Value
                    </label>
                    <input
                      type="text"
                      value={selectedNode.data.condition?.value || ''}
                      onChange={(e) =>
                        updateNodeData(selectedNode.id, {
                          condition: {
                            ...selectedNode.data.condition,
                            value: e.target.value,
                          },
                        })
                      }
                      className="w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
                      placeholder="Enter value..."
                    />
                  </div>
                </div>
              )}

              <button
                onClick={() => deleteNode(selectedNode.id)}
                className="mt-4 w-full px-3 py-2 bg-red-50 text-red-600 rounded-lg text-sm hover:bg-red-100 transition-colors"
              >
                Delete Node
              </button>
            </div>
          )}
        </div>

        {/* Flow Canvas */}
        <div className="flex-1">
          <ReactFlow
            nodes={nodes}
            edges={edges}
            onNodesChange={onNodesChange}
            onEdgesChange={onEdgesChange}
            onConnect={onConnect}
            onNodeClick={onNodeClick}
            nodeTypes={nodeTypes}
            fitView
            snapToGrid
            snapGrid={[15, 15]}
          >
            <Background />
            <Controls />
            <MiniMap />
          </ReactFlow>
        </div>

        {/* Settings Panel */}
        {showSettings && (
          <div className="w-80 bg-white border-l p-4 overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-gray-900">Chatbot Settings</h3>
              <button
                onClick={() => setShowSettings(false)}
                className="p-1 hover:bg-gray-100 rounded"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-4">
              {/* Name */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Name
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => {
                    setName(e.target.value);
                    setHasUnsavedChanges(true);
                  }}
                  className="w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
                />
              </div>

              {/* Description */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Description
                </label>
                <textarea
                  value={description}
                  onChange={(e) => {
                    setDescription(e.target.value);
                    setHasUnsavedChanges(true);
                  }}
                  rows={2}
                  className="w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
                />
              </div>

              {/* Welcome Message */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Welcome Message
                </label>
                <textarea
                  value={welcomeMessage}
                  onChange={(e) => {
                    setWelcomeMessage(e.target.value);
                    setHasUnsavedChanges(true);
                  }}
                  rows={3}
                  className="w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
                  placeholder="Sent when conversation starts..."
                />
              </div>

              {/* Fallback Message */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Fallback Message
                </label>
                <textarea
                  value={fallbackMessage}
                  onChange={(e) => {
                    setFallbackMessage(e.target.value);
                    setHasUnsavedChanges(true);
                  }}
                  rows={3}
                  className="w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
                  placeholder="Sent when no match found..."
                />
              </div>

              {/* Trigger Keywords */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Trigger Keywords
                </label>
                <div className="flex gap-2 mb-2">
                  <input
                    type="text"
                    value={newKeyword}
                    onChange={(e) => setNewKeyword(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && addKeyword()}
                    className="flex-1 px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
                    placeholder="Add keyword..."
                  />
                  <button
                    onClick={addKeyword}
                    className="px-3 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {triggerKeywords.map((keyword) => (
                    <span
                      key={keyword}
                      className="inline-flex items-center px-2 py-1 bg-blue-50 text-blue-700 text-sm rounded"
                    >
                      {keyword}
                      <button
                        onClick={() => removeKeyword(keyword)}
                        className="ml-1 hover:text-blue-900"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </span>
                  ))}
                </div>
              </div>

              {/* Default Chatbot */}
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium text-gray-900 text-sm">Default Chatbot</p>
                  <p className="text-xs text-gray-500">Handle all new conversations</p>
                </div>
                <button
                  onClick={() => {
                    setIsDefault(!isDefault);
                    setHasUnsavedChanges(true);
                  }}
                  className={`w-12 h-6 rounded-full transition-colors ${isDefault ? 'bg-green-600' : 'bg-gray-300'
                    }`}
                >
                  <div
                    className={`w-5 h-5 bg-white rounded-full shadow transform transition-transform ${isDefault ? 'translate-x-6' : 'translate-x-0.5'
                      }`}
                  />
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ChatbotBuilder;