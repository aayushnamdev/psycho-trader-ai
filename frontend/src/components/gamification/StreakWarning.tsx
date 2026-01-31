/**
 * StreakWarning - Soft amber banner when streak is at risk
 * Reflection.app-inspired - gentle, not aggressive
 */

import React from 'react';
import { Flame, ArrowRight, X } from 'lucide-react';

interface StreakWarningProps {
  currentStreak: number;
  onStartConversation: () => void;
  onDismiss?: () => void;
}

const StreakWarning: React.FC<StreakWarningProps> = ({
  currentStreak,
  onStartConversation,
  onDismiss,
}) => {
  if (currentStreak <= 0) {
    return null;
  }

  return (
    <div className="bg-amber-50 border-b border-amber-100 px-4 py-3 animate-fade-down">
      <div className="max-w-4xl mx-auto flex items-center justify-between gap-4">
        {/* Warning content */}
        <div className="flex items-center gap-3 flex-1">
          {/* Animated flame */}
          <div className="flex items-center gap-1">
            <Flame
              className="w-5 h-5 text-amber-500 animate-pulse-soft"
              fill="currentColor"
            />
          </div>

          {/* Message */}
          <div className="flex-1">
            <p className="text-sm font-medium text-text-primary">
              Your {currentStreak}-day streak is at risk!
            </p>
            <p className="text-xs text-text-secondary">
              Talk with me today to keep it alive.
            </p>
          </div>
        </div>

        {/* Action button */}
        <button
          onClick={onStartConversation}
          className="
            flex items-center gap-2 px-4 py-2 rounded-xl
            bg-amber-500 hover:bg-amber-600
            text-white font-medium text-sm
            transition-all duration-200
            shadow-sm hover:shadow-md
          "
        >
          Start a conversation
          <ArrowRight className="w-4 h-4" />
        </button>

        {/* Dismiss button */}
        {onDismiss && (
          <button
            onClick={onDismiss}
            className="p-1 text-text-tertiary hover:text-text-secondary transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>
    </div>
  );
};

export default StreakWarning;
