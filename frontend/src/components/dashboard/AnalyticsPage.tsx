/**
 * Progress Page - Reflection.app-inspired insights timeline
 * Clean editorial style with milestone markers
 */

import React, { useEffect, useState, useMemo } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { memoryApi } from '@/services/api';
import type { Memory } from '@/types';
import { Zap, Sparkles, TrendingUp, ChevronDown, BarChart2, Target } from 'lucide-react';
import { format, startOfMonth, isAfter } from 'date-fns';
import { Card, Badge } from '@/components/ui';
import axios from 'axios';

// Category labels
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

type EntryType = 'breakthrough' | 'identity' | 'pattern' | 'all';

interface TimelineEntry {
  id: number;
  type: 'breakthrough' | 'identity' | 'pattern';
  observation: string;
  category?: string;
  relevance_score: number;
  created_at: string;
}

const filterOptions: { value: EntryType; label: string }[] = [
  { value: 'all', label: 'All' },
  { value: 'breakthrough', label: 'Breakthroughs' },
  { value: 'identity', label: 'Identity' },
  { value: 'pattern', label: 'Patterns' },
];

interface AreaToWorkOn {
  title: string;
  description: string;
  category: string;
  frequency: number;
  examples: string[];
}

const AnalyticsPage: React.FC = () => {
  const { userId } = useAuth();
  const [memories, setMemories] = useState<Memory[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filter, setFilter] = useState<EntryType>('all');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [showFilterDropdown, setShowFilterDropdown] = useState(false);
  const [areasToWorkOn, setAreasToWorkOn] = useState<AreaToWorkOn[]>([]);

  useEffect(() => {
    if (!userId) return;

    const fetchData = async () => {
      setIsLoading(true);
      try {
        const memoriesData = await memoryApi.getMemories(userId);
        setMemories(memoriesData);

        // Fetch areas to work on
        const areasResponse = await axios.get(`/api/user/${userId}/areas-to-work-on`);
        setAreasToWorkOn(areasResponse.data);
      } catch (error) {
        console.error('Failed to fetch data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [userId]);

  const timelineEntries = useMemo((): TimelineEntry[] => {
    const entries: TimelineEntry[] = [];

    memories.forEach((memory) => {
      if (memory.is_breakthrough_moment) {
        entries.push({
          id: memory.id,
          type: 'breakthrough',
          observation: memory.observation,
          category: memory.category,
          relevance_score: memory.relevance_score,
          created_at: memory.created_at,
        });
      } else if (memory.is_identity_statement) {
        entries.push({
          id: memory.id,
          type: 'identity',
          observation: memory.observation,
          category: memory.category,
          relevance_score: memory.relevance_score,
          created_at: memory.created_at,
        });
      } else if (memory.relevance_score > 6) {
        entries.push({
          id: memory.id,
          type: 'pattern',
          observation: memory.observation,
          category: memory.category,
          relevance_score: memory.relevance_score,
          created_at: memory.created_at,
        });
      }
    });

    return entries.sort(
      (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    );
  }, [memories]);

  const filteredEntries = useMemo(() => {
    let filtered = timelineEntries;
    if (filter !== 'all') {
      filtered = filtered.filter((entry) => entry.type === filter);
    }
    if (categoryFilter !== 'all') {
      filtered = filtered.filter((entry) => entry.category === categoryFilter);
    }
    return filtered;
  }, [timelineEntries, filter, categoryFilter]);

  const stats = useMemo(() => {
    const monthStart = startOfMonth(new Date());
    const insightsThisMonth = timelineEntries.filter((entry) =>
      isAfter(new Date(entry.created_at), monthStart)
    ).length;
    const identityShifts = timelineEntries.filter((entry) => entry.type === 'identity').length;
    const breakthroughs = timelineEntries.filter((entry) => entry.type === 'breakthrough').length;
    const uniqueCategories = new Set(memories.filter((m) => m.category).map((m) => m.category)).size;

    return { insightsThisMonth, identityShifts, breakthroughs, patternsExplored: uniqueCategories };
  }, [timelineEntries, memories]);

  const availableCategories = useMemo(() => {
    const categories = new Set<string>();
    memories.forEach((m) => {
      if (m.category) categories.add(m.category);
    });
    return Array.from(categories).sort();
  }, [memories]);

  const getEntryConfig = (type: TimelineEntry['type']) => {
    switch (type) {
      case 'breakthrough':
        return {
          icon: <Zap className="w-3.5 h-3.5" />,
          label: 'Breakthrough',
          bgColor: 'bg-amber-50',
          borderColor: 'border-amber-200',
          iconBg: 'bg-amber-500',
          textColor: 'text-amber-600',
        };
      case 'identity':
        return {
          icon: <Sparkles className="w-3.5 h-3.5" />,
          label: 'Identity Shift',
          bgColor: 'bg-primary-50',
          borderColor: 'border-primary-200',
          iconBg: 'bg-primary-500',
          textColor: 'text-primary-600',
        };
      case 'pattern':
        return {
          icon: <TrendingUp className="w-3.5 h-3.5" />,
          label: 'Pattern',
          bgColor: 'bg-sky-50',
          borderColor: 'border-sky-200',
          iconBg: 'bg-sky-500',
          textColor: 'text-sky-600',
        };
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full bg-background">
        <div className="text-center">
          <div className="w-12 h-12 rounded-full border-2 border-primary-500 border-t-transparent animate-spin mx-auto mb-4" />
          <p className="text-text-secondary">Loading your journey...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full overflow-y-auto bg-background">
      <div className="max-w-[920px] mx-auto px-6 py-10">
        {/* Header */}
        <header className="mb-10">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-xl bg-primary-50 flex items-center justify-center">
              <BarChart2 className="w-5 h-5 text-primary-500" />
            </div>
            <div>
              <h1 className="text-2xl font-semibold text-text-primary">
                Your Progress
              </h1>
            </div>
          </div>
          <p className="text-text-secondary ml-[52px]">
            A chronicle of your insights and personal growth
          </p>
        </header>

        {/* Stats Grid */}
        <section className="mb-10">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { value: stats.insightsThisMonth, label: 'This Month', sublabel: 'insights', color: 'text-text-primary' },
              { value: stats.breakthroughs, label: 'Breakthroughs', sublabel: 'golden moments', color: 'text-amber-500' },
              { value: stats.identityShifts, label: 'Identity Shifts', sublabel: 'who you are', color: 'text-primary-500' },
              { value: stats.patternsExplored, label: 'Patterns', sublabel: 'explored', color: 'text-sky-500' },
            ].map((stat, idx) => (
              <Card
                key={stat.label}
                variant="default"
                padding="md"
                hover
                className="animate-fade-up"
                style={{ animationDelay: `${idx * 50}ms` }}
              >
                <p className={`text-4xl font-semibold ${stat.color} mb-1`}>
                  {stat.value}
                </p>
                <p className="text-sm font-medium text-text-primary">{stat.label}</p>
                <p className="text-xs text-text-tertiary">{stat.sublabel}</p>
              </Card>
            ))}
          </div>
        </section>

        {/* Areas to Work On */}
        {areasToWorkOn.length > 0 && (
          <section className="mb-10">
            <Card variant="default" padding="md">
              <div className="flex items-center gap-2 mb-4">
                <Target className="w-5 h-5 text-amber-500" />
                <h2 className="text-xl font-semibold text-text-primary">Areas to Work On</h2>
              </div>
              <p className="text-sm text-text-secondary mb-6">
                Based on patterns and recurring themes, these areas might benefit from attention
              </p>

              <div className="space-y-4">
                {areasToWorkOn.map((area, idx) => (
                  <div
                    key={idx}
                    className="p-4 rounded-xl bg-amber-50/50 border border-amber-200/50 hover:shadow-sm transition-all"
                  >
                    <div className="flex items-start gap-3">
                      <div className="w-8 h-8 rounded-lg bg-amber-500 flex items-center justify-center flex-shrink-0">
                        <span className="text-white font-semibold">{idx + 1}</span>
                      </div>
                      <div className="flex-1">
                        <h3 className="text-sm font-semibold text-text-primary mb-1">
                          {area.title}
                        </h3>
                        <p className="text-sm text-text-secondary mb-3">
                          {area.description}
                        </p>
                        {area.examples.length > 0 && (
                          <div className="space-y-2">
                            {area.examples.map((example, i) => (
                              <p key={i} className="text-xs text-text-tertiary pl-3 border-l-2 border-amber-200">
                                "{example}..."
                              </p>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          </section>
        )}

        {/* Timeline Section */}
        <section>
          {/* Section Header with Filters */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
            <div>
              <h2 className="text-xl font-semibold text-text-primary mb-1">Timeline</h2>
              <p className="text-sm text-text-tertiary">
                {filteredEntries.length} {filteredEntries.length === 1 ? 'moment' : 'moments'} recorded
              </p>
            </div>

            <div className="flex items-center gap-3">
              {/* Type Filter Pills */}
              <div className="flex items-center gap-1 p-1 bg-surface-subtle rounded-xl">
                {filterOptions.map((option) => (
                  <button
                    key={option.value}
                    onClick={() => setFilter(option.value)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all duration-200 ${
                      filter === option.value
                        ? 'bg-white text-text-primary shadow-sm'
                        : 'text-text-secondary hover:text-text-primary'
                    }`}
                  >
                    {option.label}
                  </button>
                ))}
              </div>

              {/* Category Dropdown */}
              <div className="relative">
                <button
                  onClick={() => setShowFilterDropdown(!showFilterDropdown)}
                  className="flex items-center gap-2 px-4 py-2 bg-white border border-border rounded-xl text-xs text-text-secondary hover:border-border-visible transition-all"
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-primary-400" />
                  <span className="font-medium">
                    {categoryFilter === 'all' ? 'All Categories' : categoryLabels[categoryFilter] || categoryFilter}
                  </span>
                  <ChevronDown className={`w-3.5 h-3.5 transition-transform ${showFilterDropdown ? 'rotate-180' : ''}`} />
                </button>

                {showFilterDropdown && (
                  <>
                    <div className="fixed inset-0 z-10" onClick={() => setShowFilterDropdown(false)} />
                    <div className="absolute right-0 top-full mt-2 w-56 bg-white rounded-xl shadow-xl border border-border py-2 z-20 animate-fade-down">
                      <div className="px-3 py-1.5 border-b border-border-subtle mb-1">
                        <p className="text-[10px] uppercase tracking-wider text-text-tertiary font-medium">
                          Filter by category
                        </p>
                      </div>
                      <button
                        onClick={() => { setCategoryFilter('all'); setShowFilterDropdown(false); }}
                        className={`w-full px-4 py-2 text-left text-xs flex items-center gap-2 transition-colors ${
                          categoryFilter === 'all' ? 'bg-primary-50 text-primary-600 font-medium' : 'text-text-secondary hover:bg-surface-subtle'
                        }`}
                      >
                        <span className="w-1.5 h-1.5 rounded-full bg-gradient-to-r from-primary-400 to-amber-400" />
                        All Categories
                      </button>
                      {availableCategories.map((cat) => (
                        <button
                          key={cat}
                          onClick={() => { setCategoryFilter(cat); setShowFilterDropdown(false); }}
                          className={`w-full px-4 py-2 text-left text-xs flex items-center gap-2 transition-colors ${
                            categoryFilter === cat ? 'bg-primary-50 text-primary-600 font-medium' : 'text-text-secondary hover:bg-surface-subtle'
                          }`}
                        >
                          <span className="w-1.5 h-1.5 rounded-full bg-text-muted" />
                          {categoryLabels[cat] || cat.replace(/_/g, ' ')}
                        </button>
                      ))}
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>

          {/* Timeline Content */}
          {filteredEntries.length === 0 ? (
            <Card variant="elevated" padding="lg" className="text-center">
              <div className="w-16 h-16 rounded-2xl bg-primary-50 flex items-center justify-center mx-auto mb-5">
                <Sparkles className="w-8 h-8 text-primary-400" />
              </div>
              <h3 className="text-xl font-semibold text-text-primary mb-2">No insights yet</h3>
              <p className="text-text-secondary max-w-sm mx-auto">
                Your breakthroughs and realizations will appear here as you continue your conversations.
              </p>
            </Card>
          ) : (
            <div className="relative pl-8">
              {/* Timeline Track */}
              <div className="absolute left-[11px] top-4 bottom-4 w-0.5 bg-gradient-to-b from-primary-200 via-amber-200 to-sky-200 rounded-full" />

              {/* Timeline Start Dot */}
              <div className="absolute left-[6px] top-0 w-3 h-3 rounded-full bg-primary-500 shadow-md animate-bounce-gentle" />

              {/* Entries */}
              <div className="space-y-5">
                {filteredEntries.map((entry, idx) => {
                  const config = getEntryConfig(entry.type);
                  return (
                    <div
                      key={entry.id}
                      className="relative animate-fade-up"
                      style={{ animationDelay: `${idx * 60}ms` }}
                    >
                      {/* Timeline Node */}
                      <div className={`absolute -left-8 top-5 w-6 h-6 rounded-full ${config.iconBg} flex items-center justify-center shadow-md`}>
                        <span className="text-white">{config.icon}</span>
                      </div>

                      {/* Entry Card */}
                      <Card
                        variant="default"
                        padding="md"
                        hover
                        className={`${config.bgColor} ${config.borderColor} border`}
                      >
                        {/* Header */}
                        <div className="flex items-start justify-between mb-3">
                          <div className="flex items-center gap-2">
                            <Badge variant="primary" size="sm" icon={config.icon}>
                              {config.label}
                            </Badge>
                            {entry.category && (
                              <span className="text-xs text-text-tertiary">
                                · {categoryLabels[entry.category] || entry.category.replace(/_/g, ' ')}
                              </span>
                            )}
                          </div>
                          <span className="text-xs text-text-tertiary">
                            {format(new Date(entry.created_at), 'MMM d, yyyy')}
                          </span>
                        </div>

                        {/* Quote */}
                        <p className="text-[15px] text-text-primary leading-relaxed">
                          {entry.observation}
                        </p>

                        {/* Relevance indicator for patterns */}
                        {entry.type === 'pattern' && (
                          <div className="flex items-center gap-2 mt-3 pt-3 border-t border-sky-100">
                            <div className="flex gap-0.5">
                              {[...Array(3)].map((_, i) => (
                                <div
                                  key={i}
                                  className={`w-1.5 h-1.5 rounded-full transition-colors ${
                                    i < (entry.relevance_score >= 8 ? 3 : entry.relevance_score >= 7 ? 2 : 1)
                                      ? 'bg-sky-500'
                                      : 'bg-sky-200'
                                  }`}
                                />
                              ))}
                            </div>
                            <span className="text-xs text-text-tertiary">
                              {entry.relevance_score >= 8 ? 'High significance' : entry.relevance_score >= 7 ? 'Notable pattern' : 'Emerging pattern'}
                            </span>
                          </div>
                        )}
                      </Card>
                    </div>
                  );
                })}
              </div>

              {/* End of timeline marker */}
              <div className="mt-8 flex items-center gap-3 pl-1">
                <div className="w-1.5 h-1.5 rounded-full bg-text-muted" />
                <span className="text-xs text-text-tertiary">Beginning of your journey</span>
              </div>
            </div>
          )}
        </section>
      </div>
    </div>
  );
};

export default AnalyticsPage;
