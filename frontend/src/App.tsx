/**
 * Main application component
 */

import React from 'react';
import { AuthProvider, useAuth } from '@/contexts/AuthContext';
import { ChatProvider } from '@/contexts/ChatContext';
import AuthPage from '@/components/auth/AuthPage';
import MainLayout from '@/components/layout/MainLayout';


const AppContent: React.FC = () => {
  const { isAuthenticated } = useAuth();
  
  return isAuthenticated ? (
    <ChatProvider>
      <MainLayout />
    </ChatProvider>
  ) : (
    <AuthPage />
  );
};

const App: React.FC = () => {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
};


export default App;