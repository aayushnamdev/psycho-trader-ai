/**
 * AchievementUnlock - Gentle celebration modal
 * Reflection.app-inspired - calm, not overwhelming
 */

import React, { useEffect, useState, useCallback } from 'react';
import { X } from 'lucide-react';
import { ACHIEVEMENTS, STREAK_MILESTONES } from './constants';
import type { Achievement } from '@/types';

interface AchievementUnlockProps {
  achievement: Achievement | null;
  streakMilestone?: number | null;
  onClose: () => void;
  onCelebrate: (achievementId: number) => void;
}

// Confetti particle component
const ConfettiParticle: React.FC<{ delay: number; color: string }> = ({ delay, color }) => {
  const randomX = Math.random() * 100;
  const randomDuration = 2.5 + Math.random() * 2;

  return (
    <div
      className="absolute w-2 h-2 rounded-sm"
      style={{
        left: `${randomX}%`,
        backgroundColor: color,
        animationDelay: `${delay}s`,
        animationDuration: `${randomDuration}s`,
        animation: `confetti ${randomDuration}s linear ${delay}s forwards`,
      }}
    />
  );
};

const AchievementUnlock: React.FC<AchievementUnlockProps> = ({
  achievement,
  streakMilestone,
  onClose,
  onCelebrate,
}) => {
  const [showConfetti, setShowConfetti] = useState(true);

  const achievementDef = achievement ? ACHIEVEMENTS[achievement.achievement_key] : null;
  const streakInfo = streakMilestone ? STREAK_MILESTONES[streakMilestone] : null;

  const handleClose = useCallback(() => {
    if (achievement) {
      onCelebrate(achievement.id);
    }
    onClose();
  }, [achievement, onCelebrate, onClose]);

  useEffect(() => {
    const timer = setTimeout(() => setShowConfetti(false), 3500);
    return () => clearTimeout(timer);
  }, []);

  if (!achievement && !streakMilestone) {
    return null;
  }

  const confettiColors = ['#F43F5E', '#F59E0B', '#10B981', '#7C5CFF', '#A78BFA', '#6366F1'];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-text-primary/20 backdrop-blur-sm"
        onClick={handleClose}
      />

      {/* Confetti */}
      {showConfetti && (
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          {[...Array(40)].map((_, i) => (
            <ConfettiParticle
              key={i}
              delay={i * 0.06}
              color={confettiColors[i % confettiColors.length]}
            />
          ))}
        </div>
      )}

      {/* Modal */}
      <div className="relative bg-white rounded-3xl p-8 max-w-sm w-full mx-4 shadow-2xl animate-scale-in border border-border-subtle">
        {/* Close button */}
        <button
          onClick={handleClose}
          className="absolute top-4 right-4 p-2 text-text-muted hover:text-text-secondary transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Achievement content */}
        {achievement && achievementDef && (
          <div className="text-center">
            {/* Icon */}
            <div className="w-24 h-24 mx-auto mb-6 rounded-2xl bg-amber-50 border-2 border-amber-200 flex items-center justify-center text-5xl shadow-lg shadow-amber-500/10">
              {achievementDef.icon}
            </div>

            {/* Title */}
            <h2 className="text-2xl font-semibold text-text-primary mb-2">
              {achievementDef.title}
            </h2>

            {/* Description */}
            <p className="text-text-secondary mb-6">
              {achievementDef.desc}
            </p>

            {/* Message */}
            <p className="text-sm text-text-tertiary mb-6 px-4">
              Every achievement marks a step in your journey of self-discovery.
            </p>

            {/* Continue button */}
            <button
              onClick={handleClose}
              className="
                w-full py-3 px-6 rounded-xl
                bg-primary-500 hover:bg-primary-600
                text-white font-medium
                transition-all duration-200
                shadow-lg shadow-primary-500/25
              "
            >
              Continue Journey
            </button>
          </div>
        )}

        {/* Streak milestone content */}
        {streakMilestone && streakInfo && !achievement && (
          <div className="text-center">
            {/* Flame icons */}
            <div className="flex items-center justify-center gap-2 mb-4">
              <span className="text-3xl">🔥</span>
              <span className="text-4xl">🔥</span>
              <span className="text-3xl">🔥</span>
            </div>

            {/* Title */}
            <h2 className="text-2xl font-semibold text-amber-600 mb-4">
              {streakInfo.title}
            </h2>

            {/* Message */}
            <p className="text-text-primary mb-6 px-4 leading-relaxed">
              {streakInfo.message}
            </p>

            {/* Continue button */}
            <button
              onClick={handleClose}
              className="
                w-full py-3 px-6 rounded-xl
                bg-amber-500 hover:bg-amber-600
                text-white font-medium
                transition-all duration-200
                shadow-lg shadow-amber-500/25
              "
            >
              Continue Journey
            </button>
          </div>
        )}
      </div>

      {/* Keyframes for confetti */}
      <style>{`
        @keyframes confetti {
          0% {
            transform: translateY(-100%) rotate(0deg);
            opacity: 1;
          }
          100% {
            transform: translateY(100vh) rotate(720deg);
            opacity: 0;
          }
        }
      `}</style>
    </div>
  );
};

export default AchievementUnlock;
