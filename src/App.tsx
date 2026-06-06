import React from 'react';
import { useAuth } from './context/AuthContext';
import LoginScreen from './screens/LoginScreen';
import MainScreen from './screens/MainScreen';

export default function App() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="h-screen w-full bg-neutral-950 flex items-center justify-center">
        <div className="w-8 h-8 rounded-full border-t-2 border-r-2 border-indigo-500 animate-spin" />
      </div>
    );
  }

  return user ? <MainScreen /> : <LoginScreen />;
}
