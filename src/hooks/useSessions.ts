import { useState, useEffect } from 'react';
import { collection, query, where, orderBy, onSnapshot, addDoc, updateDoc, doc, serverTimestamp, deleteDoc } from 'firebase/firestore';
import { db, handleFirestoreError } from '../firebase';
import { useAuth } from '../context/AuthContext';

export interface Message {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: number;
}

export interface Session {
  id: string;
  uid: string;
  title: string;
  updatedAt: any;
  messages: Message[];
}

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
        updatedAt: serverTimestamp(),
        messages: []
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
  
  const deleteSession = async (sessionId: string) => {
    if (!user) return;
    try {
      const sessionRef = doc(db, 'sessions', sessionId);
      await deleteDoc(sessionRef);
    } catch (error) {
      handleFirestoreError(error);
    }
  }

  return { sessions, loading, createSession, updateSessionMessages, deleteSession };
}
