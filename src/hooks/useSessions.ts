import { useState, useEffect } from 'react';
import { collection, query, where, orderBy, onSnapshot, addDoc, updateDoc, doc, serverTimestamp, deleteDoc } from 'firebase/firestore';
import { db, handleFirestoreError } from '../firebase';
import { useAuth } from '../context/AuthContext';
import { Session, Message } from '../types';

export function useSessions() {
  const { user } = useAuth();
  const [sessions, setSessions] = useState<Session[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      setSessions([]);
      setLoading(false);
      return;
    }

    try {
      const q = query(
        collection(db, 'sessions'),
        where('uid', '==', user.uid),
        orderBy('updatedAt', 'desc')
      );

      const unsubscribe = onSnapshot(q, (snapshot) => {
        const sessionData: Session[] = [];
        snapshot.forEach((p) => {
          sessionData.push({ id: p.id, ...p.data() } as Session);
        });
        setSessions(sessionData);
        setLoading(false);
      }, (error) => {
        console.error("Session fetch error:", error);
        handleFirestoreError(error);
      });

      return () => unsubscribe();
    } catch (error) {
      handleFirestoreError(error);
    }
  }, [user]);

  const createSession = async (title: string = 'New Conversation') => {
    if (!user) return null;
    try {
      const newSessionInfo = {
        uid: user.uid,
        title,
        systemPromptId: 'default',
        modelId: 'llama-3',
        providerId: 'local',
        temperature: 0.7,
        maxTokens: 2048,
        createdAt: new Date().toISOString(),
        updatedAt: serverTimestamp(),
        messages: [],
        rtkConfig: {
          enabled: true,
          compressionRatio: 0.8,
          slidingWindowSize: 4000,
          dynamicBypass: true,
          modelRoute: 'local_fallback'
        }
      };
      const docRef = await addDoc(collection(db, 'sessions'), newSessionInfo);
      return docRef.id;
    } catch (error) {
       handleFirestoreError(error);
    }
  };

  const updateSessionMessages = async (sessionId: string, messages: Message[]) => {
    if (!user) return;
    try {
      const sessionRef = doc(db, 'sessions', sessionId);
      await updateDoc(sessionRef, {
        messages,
        updatedAt: serverTimestamp()
      });
    } catch (error) {
      handleFirestoreError(error);
    }
  };

  const updateSessionConfig = async (sessionId: string, updates: Partial<Session>) => {
    if (!user) return;
    try {
      const sessionRef = doc(db, 'sessions', sessionId);
      await updateDoc(sessionRef, {
        ...updates,
        updatedAt: serverTimestamp()
      });
    } catch (error) {
      handleFirestoreError(error);
    }
  };
  
  const deleteSession = async (sessionId: string) => {
    if (!user) return;
    try {
      const sessionRef = doc(db, 'sessions', sessionId);
      await deleteDoc(sessionRef);
    } catch (error) {
      handleFirestoreError(error);
    }
  }

  return { sessions, loading, createSession, updateSessionMessages, updateSessionConfig, deleteSession };
}
