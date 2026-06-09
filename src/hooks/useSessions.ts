import { useState, useEffect, useCallback } from 'react';
import { Session, Message } from '../types';

export function useSessions() {
  const [sessions, setSessions] = useState<Session[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    try {
      const stored = localStorage.getItem('agent_sessions');
      if (stored) {
        setSessions(JSON.parse(stored));
      }
    } catch (e) {
      console.error('Failed to load sessions', e);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!loading) {
      localStorage.setItem('agent_sessions', JSON.stringify(sessions));
    }
  }, [sessions, loading]);

  const createSession = useCallback(async (title: string = 'New Conversation') => {
    const newSession: Session = {
      id: Date.now().toString(),
      uid: 'local',
      title,
      systemPromptId: 'default',
      modelId: 'llama-3',
      providerId: 'local',
      temperature: 0.7,
      maxTokens: 2048,
      createdAt: new Date().toISOString(),
      messages: [],
      rtkConfig: {
        enabled: true,
        compressionRatio: 0.8,
        slidingWindowSize: 4000,
        dynamicBypass: true,
        modelRoute: 'local_fallback'
      }
    };
    setSessions(prev => [newSession, ...prev]);
    return newSession.id;
  }, []);

  const updateSessionMessages = useCallback(async (sessionId: string, messages: Message[]) => {
    setSessions(prev => prev.map(s => s.id === sessionId ? { ...s, messages } : s));
  }, []);

  const updateSessionConfig = useCallback(async (sessionId: string, updates: Partial<Session>) => {
    setSessions(prev => prev.map(s => s.id === sessionId ? { ...s, ...updates } : s));
  }, []);
  
  const deleteSession = useCallback(async (sessionId: string) => {
    setSessions(prev => prev.filter(s => s.id !== sessionId));
  }, []);

  return { sessions, loading, createSession, updateSessionMessages, updateSessionConfig, deleteSession };
}
