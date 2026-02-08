// src/hooks/useChatbot.ts

import { useState, useEffect, useCallback } from 'react';
import { chatbot as chatbotApi } from '../services/api';
import type { Chatbot, FlowData } from '../types/chatbot';

interface UseChatbotListReturn {
  chatbots: Chatbot[];
  loading: boolean;
  error: string | null;
  refresh: () => Promise<void>;
  createChatbot: (data: Partial<Chatbot>) => Promise<Chatbot>;
  deleteChatbot: (id: string) => Promise<void>;
  activateChatbot: (id: string) => Promise<void>;
  deactivateChatbot: (id: string) => Promise<void>;
  duplicateChatbot: (id: string) => Promise<Chatbot>;
}

export const useChatbotList = (): UseChatbotListReturn => {
  const [chatbots, setChatbots] = useState<Chatbot[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchChatbots = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await chatbotApi.getAll();
      setChatbots(response.data.data || []);
    } catch (err: any) {
      console.error('Error fetching chatbots:', err);
      setError(err.response?.data?.message || 'Failed to load chatbots');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchChatbots();
  }, [fetchChatbots]);

  const createChatbot = async (data: Partial<Chatbot>): Promise<Chatbot> => {
    const response = await chatbotApi.create(data);
    const newChatbot = response.data.data;
    setChatbots(prev => [newChatbot, ...prev]);
    return newChatbot;
  };

  const deleteChatbot = async (id: string): Promise<void> => {
    await chatbotApi.delete(id);
    setChatbots(prev => prev.filter(c => c.id !== id));
  };

  const activateChatbot = async (id: string): Promise<void> => {
    const response = await chatbotApi.activate(id);
    const updatedChatbot = response.data.data;
    setChatbots(prev => prev.map(c => c.id === id ? updatedChatbot : c));
  };

  const deactivateChatbot = async (id: string): Promise<void> => {
    const response = await chatbotApi.deactivate(id);
    const updatedChatbot = response.data.data;
    setChatbots(prev => prev.map(c => c.id === id ? updatedChatbot : c));
  };

  const duplicateChatbot = async (id: string): Promise<Chatbot> => {
    const response = await chatbotApi.duplicate(id);
    const newChatbot = response.data.data;
    setChatbots(prev => [newChatbot, ...prev]);
    return newChatbot;
  };

  return {
    chatbots,
    loading,
    error,
    refresh: fetchChatbots,
    createChatbot,
    deleteChatbot,
    activateChatbot,
    deactivateChatbot,
    duplicateChatbot,
  };
};

// Hook for single chatbot editing
interface UseChatbotReturn {
  chatbot: Chatbot | null;
  loading: boolean;
  saving: boolean;
  error: string | null;
  updateChatbot: (data: Partial<Chatbot>) => Promise<void>;
  updateFlowData: (flowData: FlowData) => Promise<void>;
  saveChatbot: () => Promise<void>;
}

export const useChatbot = (chatbotId: string): UseChatbotReturn => {
  const [chatbot, setChatbot] = useState<Chatbot | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pendingChanges, setPendingChanges] = useState<Partial<Chatbot>>({});

  useEffect(() => {
    const fetchChatbot = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await chatbotApi.getById(chatbotId);
        setChatbot(response.data.data);
      } catch (err: any) {
        console.error('Error fetching chatbot:', err);
        setError(err.response?.data?.message || 'Failed to load chatbot');
      } finally {
        setLoading(false);
      }
    };

    if (chatbotId) {
      fetchChatbot();
    }
  }, [chatbotId]);

  const updateChatbot = async (data: Partial<Chatbot>): Promise<void> => {
    setPendingChanges(prev => ({ ...prev, ...data }));
    setChatbot(prev => prev ? { ...prev, ...data } : null);
  };

  const updateFlowData = async (flowData: FlowData): Promise<void> => {
    setPendingChanges(prev => ({ ...prev, flowData }));
    setChatbot(prev => prev ? { ...prev, flowData } : null);
  };

  const saveChatbot = async (): Promise<void> => {
    if (!chatbot) return;

    try {
      setSaving(true);
      setError(null);
      
      const dataToSave = {
        ...pendingChanges,
        flowData: chatbot.flowData,
      };

      const response = await chatbotApi.update(chatbotId, dataToSave);
      setChatbot(response.data.data);
      setPendingChanges({});
    } catch (err: any) {
      console.error('Error saving chatbot:', err);
      setError(err.response?.data?.message || 'Failed to save chatbot');
      throw err;
    } finally {
      setSaving(false);
    }
  };

  return {
    chatbot,
    loading,
    saving,
    error,
    updateChatbot,
    updateFlowData,
    saveChatbot,
  };
};