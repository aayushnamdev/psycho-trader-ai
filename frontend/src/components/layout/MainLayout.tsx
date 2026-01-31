/**
 * Main application layout - Reflection Space
 * Wider sidebar + content area (no top bar)
 */

import React, { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Sidebar, type ViewType } from './Sidebar';
import ChatInterface from '@/components/chat/ChatInterface';
import PatternsPage from '@/components/dashboard/PatternsPage';
import AnalyticsPage from '@/components/dashboard/AnalyticsPage';
import LifeCoachPage from '@/components/coach/LifeCoachPage';

const MainLayout: React.FC = () => {
  const { userId, logout } = useAuth();
  const [activeView, setActiveView] = useState<ViewType>('chat');

  return (
    <div className="h-screen flex overflow-hidden bg-background">
      {/* Sidebar */}
      <Sidebar
        activeView={activeView}
        onViewChange={setActiveView}
        userId={userId}
        onLogout={logout}
      />

      {/* Main content area */}
      <div className="flex-1 flex flex-col ml-[200px]">
        {/* Page content */}
        <main className="flex-1 overflow-hidden">
          <div className="h-full animate-fade-in" key={activeView}>
            {activeView === 'chat' && <ChatInterface />}
            {activeView === 'patterns' && <PatternsPage />}
            {activeView === 'insights' && <AnalyticsPage />}
            {activeView === 'coach' && <LifeCoachPage />}
          </div>
        </main>
      </div>
    </div>
  );
};

export default MainLayout;
