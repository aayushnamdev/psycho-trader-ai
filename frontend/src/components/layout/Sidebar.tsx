import React, { useState } from 'react';
import { clsx } from 'clsx';
import {
  MessageSquare,
  BookOpen,
  Lightbulb,
  Heart,
  LogOut,
  Copy,
  Check
} from 'lucide-react';

export type ViewType = 'chat' | 'patterns' | 'insights' | 'coach';

interface SidebarProps {
  activeView: ViewType;
  onViewChange: (view: ViewType) => void;
  userId?: string | null;
  onLogout: () => void;
}

const navItems = [
  { id: 'chat' as ViewType, icon: MessageSquare, label: 'Chat' },
  { id: 'patterns' as ViewType, icon: BookOpen, label: 'Patterns' },
  { id: 'insights' as ViewType, icon: Lightbulb, label: 'Insights' },
  { id: 'coach' as ViewType, icon: Heart, label: 'Life Coach' },
];

// Wave Logo SVG Component
const WaveLogo: React.FC = () => (
  <svg width="48" height="48" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
    <circle cx="24" cy="24" r="24" fill="url(#wave-gradient)" />
    <path
      d="M12 24C12 24 15 20 18 20C21 20 22 24 24 24C26 24 27 20 30 20C33 20 36 24 36 24C36 24 33 28 30 28C27 28 26 24 24 24C22 24 21 28 18 28C15 28 12 24 12 24Z"
      fill="white"
      fillOpacity="0.9"
    />
    <path
      d="M12 30C12 30 15 26 18 26C21 26 22 30 24 30C26 30 27 26 30 26C33 26 36 30 36 30"
      stroke="white"
      strokeOpacity="0.6"
      strokeWidth="2"
      strokeLinecap="round"
    />
    <defs>
      <linearGradient id="wave-gradient" x1="0" y1="0" x2="48" y2="48" gradientUnits="userSpaceOnUse">
        <stop stopColor="#A78BFA" />
        <stop offset="0.5" stopColor="#8B5CF6" />
        <stop offset="1" stopColor="#7C3AED" />
      </linearGradient>
    </defs>
  </svg>
);

export const Sidebar: React.FC<SidebarProps> = ({
  activeView,
  onViewChange,
  userId,
  onLogout
}) => {
  const [copied, setCopied] = useState(false);

  const handleCopyId = async () => {
    if (!userId) return;
    await navigator.clipboard.writeText(userId);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const truncatedId = userId ? `${userId.slice(0, 8)}...` : '';

  return (
    <aside className="fixed left-0 top-0 bottom-0 w-[200px] flex flex-col py-5 px-4 z-40 sidebar-gradient">
      {/* Logo */}
      <div className="mb-8 flex items-center gap-3">
        <WaveLogo />
      </div>

      {/* Navigation */}
      <nav className="flex-1 flex flex-col gap-1">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeView === item.id;

          return (
            <button
              key={item.id}
              onClick={() => onViewChange(item.id)}
              className={clsx(
                'group relative w-full h-10 rounded-xl flex items-center gap-3 px-3',
                'transition-all duration-200',
                isActive
                  ? 'bg-white/80 text-primary-600 shadow-sm'
                  : 'text-text-secondary hover:text-text-primary hover:bg-white/40'
              )}
            >
              <Icon className="w-5 h-5 flex-shrink-0" />
              <span className="text-sm font-medium">{item.label}</span>

              {/* Active indicator */}
              {isActive && (
                <span className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-5 bg-primary-500 rounded-r-full" />
              )}
            </button>
          );
        })}
      </nav>

      {/* Bottom Section */}
      <div className="mt-auto space-y-2">
        {/* User ID - Copyable */}
        {userId && (
          <button
            onClick={handleCopyId}
            className="w-full py-2 px-3 rounded-lg bg-white/40 hover:bg-white/60 transition-all duration-200 flex items-center justify-between group"
          >
            <span className="text-xs text-text-tertiary font-mono">{truncatedId}</span>
            {copied ? (
              <Check className="w-3.5 h-3.5 text-success-500" />
            ) : (
              <Copy className="w-3.5 h-3.5 text-text-tertiary group-hover:text-text-secondary transition-colors" />
            )}
          </button>
        )}

        {/* Logout Button */}
        <button
          onClick={onLogout}
          className="w-full py-2.5 px-4 rounded-xl text-text-tertiary font-medium text-sm flex items-center gap-2 hover:bg-white/60 hover:text-rose-500 transition-all duration-200"
        >
          <LogOut className="w-4 h-4" />
          Logout
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
