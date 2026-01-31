/**
 * Your Story Page - Reflection.app-inspired journal design
 * Clean, minimal, journal-style entries
 */

import React, { useEffect, useState, useMemo } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { memoryApi } from '@/services/api';
import type { Memory } from '@/types';
import { Heart, Users, Star, Sparkles, MessageCircle, User, BookOpen } from 'lucide-react';
import { format } from 'date-fns';
import { Card, Badge, Avatar, AvatarGroup } from '@/components/ui';

// Human-readable category labels
const categoryLabels: Record<string, string> = {
  relationship_dynamics: 'Relationships',
  self_worth: 'Self-worth',
  fear_patterns: 'Fears',
  recurring_struggle: 'Challenges',
  identity: 'Identity',
  breakthrough_moment: 'Breakthroughs',
  life_transition: 'Life Changes',
  support_system: 'Support',
  loss_aversion: 'Loss Aversion',
  control_seeking: 'Control',
  self_worth_conflict: 'Self-worth',
  attachment_anxiety: 'Attachment',
  defense_mechanisms: 'Defense',
  repetition_compulsion: 'Patterns',
  authority_conflict: 'Authority',
  shame_dynamics: 'Shame',
};

// Emotional theme groups
const emotionalThemes: Record<string, string[]> = {
  'About your relationships': ['relationship_dynamics', 'support_system', 'attachment_anxiety'],
  'About your fears': ['fear_patterns', 'loss_aversion', 'shame_dynamics'],
  'About who you are': ['identity', 'self_worth', 'self_worth_conflict'],
  'About changes happening': ['life_transition', 'recurring_struggle'],
  'About patterns you notice': ['repetition_compulsion', 'control_seeking', 'defense_mechanisms', 'authority_conflict'],
};

const PatternsPage: React.FC = () => {
  const { userId } = useAuth();
  const [memories, setMemories] = useState<Memory[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!userId) return;

    const fetchData = async () => {
      setIsLoading(true);
      try {
        const memoriesData = await memoryApi.getMemories(userId);
        setMemories(memoriesData);
      } catch (error) {
        console.error('Failed to fetch memories:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [userId]);

  // Extract people mentioned
  const peopleMentioned = useMemo(() => {
    const people = new Set<string>();
    memories.forEach(mem => {
      if (mem.people_mentioned) {
        try {
          const parsed = JSON.parse(mem.people_mentioned);
          if (Array.isArray(parsed)) {
            parsed.forEach(p => people.add(p));
          }
        } catch {
          mem.people_mentioned.split(',').forEach(p => people.add(p.trim()));
        }
      }
    });
    return Array.from(people).filter(p => p.length > 0);
  }, [memories]);

  // Filter identity statements
  const identityStatements = useMemo(() => {
    return memories.filter(m => m.is_identity_statement);
  }, [memories]);

  // Filter breakthrough moments
  const breakthroughMoments = useMemo(() => {
    return memories.filter(m => m.is_breakthrough_moment || m.category === 'breakthrough_moment');
  }, [memories]);

  // Get memories with follow-up questions
  const followUpThreads = useMemo(() => {
    return memories.filter(m => m.follow_up_question);
  }, [memories]);

  // Group memories by emotional theme
  const memoriesByTheme = useMemo(() => {
    const grouped: Record<string, Memory[]> = {};

    Object.entries(emotionalThemes).forEach(([themeName, categories]) => {
      const themeMemories = memories.filter(m =>
        m.category && categories.includes(m.category)
      );
      if (themeMemories.length > 0) {
        grouped[themeName] = themeMemories;
      }
    });

    return grouped;
  }, [memories]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full bg-background">
        <div className="text-center">
          <div className="w-12 h-12 rounded-full border-2 border-primary-500 border-t-transparent animate-spin mx-auto mb-4" />
          <p className="text-text-secondary">Gathering your story...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full overflow-y-auto bg-background">
      <div className="max-w-[900px] mx-auto px-6 py-10">
        {/* Header */}
        <header className="mb-10">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-xl bg-primary-50 flex items-center justify-center">
              <BookOpen className="w-5 h-5 text-primary-500" />
            </div>
            <div>
              <h1 className="text-2xl font-semibold text-text-primary">
                Your Story
              </h1>
            </div>
          </div>
          <p className="text-text-secondary ml-[52px]">
            The people, moments, and discoveries we've shared
          </p>
        </header>

        {memories.length === 0 ? (
          /* Empty state */
          <Card variant="elevated" padding="lg" className="text-center">
            <div className="w-16 h-16 rounded-2xl bg-rose-50 flex items-center justify-center mx-auto mb-5">
              <Heart className="w-8 h-8 text-rose-400" />
            </div>
            <h2 className="text-xl font-semibold text-text-primary mb-2">Your story is just beginning</h2>
            <p className="text-text-secondary max-w-sm mx-auto">
              As we talk, I'll remember the people, moments, and themes that matter most to you
            </p>
          </Card>
        ) : (
          <div className="space-y-6">
            {/* People in Your Life */}
            {peopleMentioned.length > 0 && (
              <Card variant="default" padding="md" className="animate-fade-up" style={{ animationDelay: '0ms' }}>
                <div className="flex items-center gap-2 mb-4">
                  <Users className="w-5 h-5 text-rose-400" />
                  <h2 className="text-lg font-semibold text-text-primary">People in Your Life</h2>
                </div>
                <p className="text-sm text-text-secondary mb-4">The relationships that shape your world</p>
                <div className="flex flex-wrap gap-2">
                  {peopleMentioned.map((person, idx) => (
                    <div
                      key={idx}
                      className="flex items-center gap-2 px-4 py-2 rounded-full bg-rose-50 border border-rose-100"
                    >
                      <Avatar size="sm" name={person} />
                      <span className="text-sm font-medium text-text-primary">{person}</span>
                    </div>
                  ))}
                </div>
              </Card>
            )}

            {/* Who You Are - Identity Statements */}
            {identityStatements.length > 0 && (
              <Card variant="default" padding="md" className="animate-fade-up" style={{ animationDelay: '50ms' }}>
                <div className="flex items-center gap-2 mb-4">
                  <Sparkles className="w-5 h-5 text-primary-400" />
                  <h2 className="text-lg font-semibold text-text-primary">Who You Are</h2>
                </div>
                <p className="text-sm text-text-secondary mb-4">Things you've said about yourself</p>
                <div className="space-y-3">
                  {identityStatements.slice(0, 5).map((memory) => (
                    <div
                      key={memory.id}
                      className="flex items-start gap-3 p-4 rounded-xl bg-surface-subtle"
                    >
                      <span className="text-primary-400 mt-0.5">•</span>
                      <p className="text-sm text-text-primary leading-relaxed">
                        "{memory.observation}"
                      </p>
                    </div>
                  ))}
                </div>
              </Card>
            )}

            {/* Turning Points - Breakthrough Moments */}
            {breakthroughMoments.length > 0 && (
              <Card
                variant="glow"
                padding="md"
                className="animate-fade-up bg-amber-50/50 border-amber-200/50"
                style={{ animationDelay: '100ms' }}
              >
                <div className="flex items-center gap-2 mb-4">
                  <Star className="w-5 h-5 text-amber-500" fill="currentColor" />
                  <h2 className="text-lg font-semibold text-text-primary">Turning Points</h2>
                </div>
                <p className="text-sm text-text-secondary mb-4">Breakthrough moments and realizations</p>
                <div className="space-y-4">
                  {breakthroughMoments.slice(0, 5).map((memory) => (
                    <div
                      key={memory.id}
                      className="flex items-start gap-3 p-4 rounded-xl bg-white border border-amber-100"
                    >
                      <Star className="w-4 h-4 text-amber-500 mt-0.5 shrink-0" fill="currentColor" />
                      <div>
                        <p className="text-sm text-text-primary leading-relaxed mb-2">
                          {memory.observation}
                        </p>
                        <span className="text-xs text-text-tertiary">
                          {format(new Date(memory.created_at), 'MMM d, yyyy')}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </Card>
            )}

            {/* What You've Shared - Grouped by Theme */}
            {Object.keys(memoriesByTheme).length > 0 && (
              <Card variant="default" padding="md" className="animate-fade-up" style={{ animationDelay: '150ms' }}>
                <div className="flex items-center gap-2 mb-4">
                  <Heart className="w-5 h-5 text-rose-400" />
                  <h2 className="text-lg font-semibold text-text-primary">What You've Shared</h2>
                </div>
                <p className="text-sm text-text-secondary mb-6">Grouped by emotional themes</p>

                <div className="space-y-6">
                  {Object.entries(memoriesByTheme).map(([theme, themeMemories]) => (
                    <div key={theme}>
                      <h3 className="text-sm font-medium text-text-primary mb-3 flex items-center gap-2">
                        <span className="w-1.5 h-1.5 rounded-full bg-rose-400" />
                        {theme}
                      </h3>
                      <div className="space-y-3 pl-4 border-l-2 border-rose-100">
                        {themeMemories.slice(0, 3).map((memory) => (
                          <div
                            key={memory.id}
                            className="p-4 rounded-xl bg-surface-subtle hover:bg-white hover:shadow-sm transition-all"
                          >
                            <p className="text-sm text-text-primary leading-relaxed mb-2">
                              {memory.observation}
                            </p>
                            <div className="flex items-center justify-between">
                              <span className="text-xs text-text-tertiary">
                                {format(new Date(memory.created_at), 'MMM d, yyyy')}
                              </span>
                              {memory.category && (
                                <Badge variant="default" size="sm">
                                  {categoryLabels[memory.category] || memory.category.replace(/_/g, ' ')}
                                </Badge>
                              )}
                            </div>
                          </div>
                        ))}
                        {themeMemories.length > 3 && (
                          <p className="text-xs text-text-tertiary pl-4">
                            + {themeMemories.length - 3} more moments
                          </p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </Card>
            )}

            {/* Threads to Continue */}
            {followUpThreads.length > 0 && (
              <Card
                variant="default"
                padding="md"
                className="animate-fade-up bg-sky-50/50 border-sky-100"
                style={{ animationDelay: '200ms' }}
              >
                <div className="flex items-center gap-2 mb-4">
                  <MessageCircle className="w-5 h-5 text-sky-500" />
                  <h2 className="text-lg font-semibold text-text-primary">Threads to Continue</h2>
                </div>
                <p className="text-sm text-text-secondary mb-4">Questions worth exploring together</p>
                <div className="space-y-3">
                  {followUpThreads.slice(0, 5).map((memory) => (
                    <div
                      key={memory.id}
                      className="flex items-start gap-3 p-4 rounded-xl bg-white border border-sky-100"
                    >
                      <span className="text-sky-500 font-medium">?</span>
                      <div>
                        <p className="text-sm text-text-primary leading-relaxed">
                          {memory.follow_up_question}
                        </p>
                        <p className="text-xs text-text-tertiary mt-1">
                          From our conversation on {format(new Date(memory.created_at), 'MMM d')}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </Card>
            )}

            {/* Fallback: show all memories */}
            {peopleMentioned.length === 0 && identityStatements.length === 0 &&
             breakthroughMoments.length === 0 && Object.keys(memoriesByTheme).length === 0 && (
              <div className="space-y-4">
                {memories.map((memory, idx) => (
                  <Card
                    key={memory.id}
                    variant="default"
                    padding="md"
                    className="animate-fade-up"
                    style={{ animationDelay: `${idx * 50}ms` }}
                  >
                    <p className="text-text-primary leading-relaxed mb-4">
                      {memory.observation}
                    </p>
                    {memory.interpretation && (
                      <p className="text-sm text-text-secondary italic mb-4 pl-4 border-l-2 border-primary-100">
                        {memory.interpretation}
                      </p>
                    )}
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-text-tertiary">
                        {format(new Date(memory.created_at), 'MMM d, yyyy')}
                      </span>
                      {memory.category && (
                        <Badge variant="default" size="sm">
                          {categoryLabels[memory.category] || memory.category.replace(/_/g, ' ')}
                        </Badge>
                      )}
                    </div>
                  </Card>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default PatternsPage;
