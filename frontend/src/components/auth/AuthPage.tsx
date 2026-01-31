/**
 * Authentication Page - Reflection.app-inspired design
 * Clean, minimal, centered layout with feature pills
 */

import React, { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { ArrowRight, Sparkles, Lock, Brain, Shield } from 'lucide-react';
import { Card, Button, FeaturePill } from '@/components/ui';

const AuthPage: React.FC = () => {
  const { login, generateUserId } = useAuth();
  const [isNewUser, setIsNewUser] = useState(true);
  const [userId, setUserId] = useState('');

  const handleNewUser = () => {
    const newId = generateUserId();
    login(newId);
  };

  const handleReturningUser = () => {
    if (userId.trim()) {
      login(userId.trim());
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-6">
      {/* Background gradient */}
      <div
        className="fixed inset-0 pointer-events-none"
        style={{
          background:
            'radial-gradient(ellipse at 50% 30%, rgba(124, 92, 255, 0.06) 0%, transparent 60%)',
        }}
      />

      <div className="relative w-full max-w-[420px]">
        {/* Header */}
        <div className="text-center mb-10">
          {/* Animated Logo */}
          <div className="flex justify-center mb-8">
            <div className="relative">
              <div className="w-20 h-20 rounded-3xl bg-gradient-to-br from-primary-400 to-primary-600 flex items-center justify-center shadow-xl shadow-primary-500/25 animate-float">
                <Sparkles className="w-10 h-10 text-white" />
              </div>
              {/* Glow ring */}
              <div className="absolute inset-0 rounded-3xl bg-gradient-to-br from-primary-400 to-primary-600 blur-xl opacity-30 -z-10" />
            </div>
          </div>

          {/* Title */}
          <h1 className="text-3xl font-semibold text-text-primary tracking-tight mb-3">
            Reflection Space
          </h1>
          <p className="text-lg text-text-secondary">
            A space for self-reflection and growth
          </p>

          {/* Feature pills */}
          <div className="flex flex-wrap justify-center gap-2 mt-6">
            <FeaturePill icon={<Brain className="w-4 h-4" />}>AI-Powered</FeaturePill>
            <FeaturePill icon={<Lock className="w-4 h-4" />}>Private</FeaturePill>
            <FeaturePill icon={<Shield className="w-4 h-4" />}>Secure</FeaturePill>
          </div>
        </div>

        {/* Auth Card */}
        <Card variant="elevated" padding="lg" className="animate-fade-up">
          {/* Tabs */}
          <div className="flex p-1 mb-8 bg-surface-subtle rounded-xl">
            <button
              onClick={() => setIsNewUser(true)}
              className={`
                flex-1 py-2.5 px-4 rounded-lg text-sm font-medium
                transition-all duration-200
                ${isNewUser
                  ? 'bg-white text-text-primary shadow-sm'
                  : 'text-text-secondary hover:text-text-primary'
                }
              `}
            >
              New User
            </button>
            <button
              onClick={() => setIsNewUser(false)}
              className={`
                flex-1 py-2.5 px-4 rounded-lg text-sm font-medium
                transition-all duration-200
                ${!isNewUser
                  ? 'bg-white text-text-primary shadow-sm'
                  : 'text-text-secondary hover:text-text-primary'
                }
              `}
            >
              Returning
            </button>
          </div>

          {/* Content */}
          {isNewUser ? (
            <div className="animate-fade-in">
              <p className="text-text-secondary leading-relaxed mb-6">
                Begin your reflective journey. A unique identifier will be created for you.
              </p>
              <button
                onClick={handleNewUser}
                className="
                  w-full py-3.5 px-6 rounded-xl
                  bg-primary-500 hover:bg-primary-600
                  text-white text-base font-medium
                  flex items-center justify-center gap-2
                  transition-all duration-200
                  hover:-translate-y-0.5 active:translate-y-0
                  shadow-lg shadow-primary-500/25
                "
              >
                Begin Session
                <ArrowRight className="w-5 h-5" />
              </button>
            </div>
          ) : (
            <div className="animate-fade-in">
              <p className="text-text-secondary leading-relaxed mb-4">
                Enter your user ID to continue your journey.
              </p>
              <input
                type="text"
                value={userId}
                onChange={(e) => setUserId(e.target.value)}
                placeholder="user_xxxxx_xxxxx"
                className="
                  w-full px-4 py-3.5 mb-4
                  bg-surface-subtle rounded-xl
                  text-base text-text-primary placeholder-text-muted
                  border-2 border-transparent
                  focus:border-primary-500 focus:bg-white focus:shadow-[0_0_0_4px_rgba(124,92,255,0.1)]
                  outline-none transition-all duration-200
                "
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && userId.trim()) {
                    handleReturningUser();
                  }
                }}
              />
              <button
                onClick={handleReturningUser}
                disabled={!userId.trim()}
                className="
                  w-full py-3.5 px-6 rounded-xl
                  bg-primary-500 hover:bg-primary-600
                  disabled:bg-surface-subtle disabled:text-text-muted
                  text-white text-base font-medium
                  flex items-center justify-center gap-2
                  transition-all duration-200
                  hover:-translate-y-0.5 active:translate-y-0
                  disabled:translate-y-0 disabled:shadow-none
                  shadow-lg shadow-primary-500/25
                "
              >
                Continue
                <ArrowRight className="w-5 h-5" />
              </button>
            </div>
          )}
        </Card>

        {/* Disclaimer */}
        <p className="text-xs text-text-tertiary text-center mt-6 leading-relaxed">
          This is a reflective space, not therapy or medical advice.
          <br />
          Save your user ID to return to your session.
        </p>
      </div>
    </div>
  );
};

export default AuthPage;
