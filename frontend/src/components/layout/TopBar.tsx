import React, { useState } from 'react';
import { clsx } from 'clsx';
import { LogOut, Copy, Check, Flame, ChevronDown } from 'lucide-react';
import type { RelationshipStats, StreakStatus } from '@/types';

interface TopBarProps {
  traderId: string | null;
  relationshipStats: RelationshipStats | null;
  streakStatus: StreakStatus | null;
  onLogout: () => void;
}

export const TopBar: React.FC<TopBarProps> = ({
  traderId,
  relationshipStats,
  streakStatus,
  onLogout,
}) => {
  const [copiedId, setCopiedId] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);

  const copyTraderId = () => {
    if (traderId) {
      navigator.clipboard.writeText(traderId);
      setCopiedId(true);
      setTimeout(() => setCopiedId(false), 2000);
    }
  };

  const handleLogout = () => {
    setShowDropdown(false);
    onLogout();
  };

  const getDisplayName = () => {
    if (!traderId) return 'TR';
    return traderId.slice(7, 9).toUpperCase();
  };

  const getShortId = () => {
    if (!traderId) return 'trader_...';
    return `trader_${traderId.slice(7, 10)}...`;
  };

  return (
    <header className="h-16 flex items-center justify-between px-6 bg-white border-b border-gray-200">
      {/* Left side - Stats */}
      <div className="flex items-center gap-6">
        {relationshipStats && (
          <>
            {/* Streak */}
            {(streakStatus?.current_streak ?? 0) > 0 && (
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-orange-50 flex items-center justify-center">
                  <Flame className="w-5 h-5 text-orange-500" fill="currentColor" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-gray-900">
                    {streakStatus?.current_streak} days
                  </p>
                  <p className="text-xs text-gray-500">Streak</p>
                </div>
              </div>
            )}

            {/* Level */}
            <div className="hidden sm:flex items-center gap-3">
              <div className="flex flex-col">
                <span className="text-xs text-gray-500">Level</span>
                <span className="text-sm font-semibold text-gray-900">
                  {relationshipStats.connection_depth}
                </span>
              </div>
              <div className="w-24 h-2 bg-gray-100 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-purple-500 to-pink-500 rounded-full transition-all duration-500"
                  style={{ width: `${(relationshipStats.connection_depth / 5) * 100}%` }}
                />
              </div>
            </div>
          </>
        )}
      </div>

      {/* Right side - User menu */}
      <div className="relative">
        <button
          onClick={() => setShowDropdown(!showDropdown)}
          className={clsx(
            'flex items-center gap-3 px-3 py-2 rounded-xl transition-all duration-200',
            'hover:bg-gray-50',
            showDropdown && 'bg-gray-50'
          )}
        >
          {/* Avatar */}
          <div className="w-9 h-9 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-white text-sm font-semibold shadow-sm">
            {getDisplayName()}
          </div>
          
          {/* Trader ID */}
          <span className="text-sm text-gray-700 font-medium hidden sm:block">
            {getShortId()}
          </span>
          
          <span className="text-xs text-gray-400 hidden sm:block">Trader</span>
          
          <ChevronDown className={clsx(
            'w-4 h-4 text-gray-400 transition-transform duration-200',
            showDropdown && 'rotate-180'
          )} />
        </button>

        {/* Dropdown menu */}
        {showDropdown && (
          <>
            {/* Backdrop */}
            <div
              className="fixed inset-0 z-40"
              onClick={() => setShowDropdown(false)}
            />
            
            {/* Dropdown */}
            <div className="absolute right-0 top-full mt-2 w-72 bg-white rounded-2xl shadow-xl border border-gray-200 py-2 z-50 animate-in fade-in slide-in-from-top-2 duration-200">
              
              {/* Trader ID section */}
              <div className="px-4 py-3 border-b border-gray-100">
                <p className="text-xs text-gray-500 mb-2 font-medium">Your Trader ID</p>
                <div className="flex items-center gap-2">
                  <code className="flex-1 text-xs text-gray-700 font-mono bg-gray-50 px-3 py-2 rounded-lg border border-gray-200 truncate">
                    {traderId}
                  </code>
                  <button
                    onClick={copyTraderId}
                    className="p-2 hover:bg-gray-50 rounded-lg transition-colors border border-gray-200"
                    title="Copy ID"
                  >
                    {copiedId ? (
                      <Check className="w-4 h-4 text-green-500" />
                    ) : (
                      <Copy className="w-4 h-4 text-gray-400" />
                    )}
                  </button>
                </div>
                {copiedId && (
                  <p className="text-xs text-green-600 mt-1.5">✓ Copied!</p>
                )}
              </div>

              {/* Stats */}
              {relationshipStats && (
                <div className="px-4 py-3 border-b border-gray-100">
                  <div className="grid grid-cols-2 gap-3">
                    <div className="bg-gray-50 rounded-xl p-3 border border-gray-100">
                      <p className="text-xs text-gray-500 mb-0.5">Days Active</p>
                      <p className="text-xl font-semibold text-gray-900">
                        {relationshipStats.days_together}
                      </p>
                    </div>
                    <div className="bg-gray-50 rounded-xl p-3 border border-gray-100">
                      <p className="text-xs text-gray-500 mb-0.5">Sessions</p>
                      <p className="text-xl font-semibold text-gray-900">
                        {relationshipStats.total_sessions}
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* Logout button */}
              <div className="px-2 py-2">
                <button
                  onClick={handleLogout}
                  className="w-full flex items-center gap-3 px-3 py-2.5 text-left text-sm text-red-600 hover:bg-red-50 rounded-xl transition-colors font-medium"
                >
                  <LogOut className="w-4 h-4" />
                  Sign Out
                </button>
              </div>
            </div>
          </>
        )}
      </div>
    </header>
  );
};

export default TopBar;