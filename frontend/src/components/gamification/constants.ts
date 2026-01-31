/**
 * Gamification constants - Achievement definitions and level unlocks
 * Psychological engagement hooks for user retention
 */

import type { AchievementDefinition, LevelUnlock } from '@/types';

// Achievement definitions with psychological hooks
export const ACHIEVEMENTS: Record<string, AchievementDefinition> = {
  // Onboarding - Easy wins (Endowed Progress)
  first_step: {
    icon: '🌱',
    title: 'First Step',
    desc: 'Started your journey',
    threshold: 1,
  },
  opening_up: {
    icon: '💭',
    title: 'Opening Up',
    desc: 'Shared 5 moments',
    threshold: 5,
  },

  // Streaks - Loss Aversion
  three_day: {
    icon: '🔥',
    title: 'On Fire',
    desc: '3 days in a row',
    threshold: 3,
  },
  week_warrior: {
    icon: '⚡',
    title: 'Week Warrior',
    desc: '7 day streak',
    threshold: 7,
  },
  month_master: {
    icon: '👑',
    title: 'Month Master',
    desc: '30 day streak',
    threshold: 30,
  },

  // Depth - Progress Markers
  trust_builder: {
    icon: '🤝',
    title: 'Trust Builder',
    desc: 'Reached level 2',
    level: 2,
  },
  growing_closer: {
    icon: '💕',
    title: 'Growing Closer',
    desc: 'Reached level 3',
    level: 3,
  },
  deep_bond: {
    icon: '💎',
    title: 'Deep Bond',
    desc: 'Reached level 4',
    level: 4,
  },
  truly_known: {
    icon: '✨',
    title: 'Truly Known',
    desc: 'Reached level 5',
    level: 5,
  },

  // Breakthroughs - Variable Rewards
  first_insight: {
    icon: '💡',
    title: 'First Insight',
    desc: 'Had a breakthrough',
    threshold: 1,
  },
  insight_seeker: {
    icon: '🔮',
    title: 'Insight Seeker',
    desc: '5 breakthroughs',
    threshold: 5,
  },

  // Identity - Rare/Special
  self_explorer: {
    icon: '🪞',
    title: 'Self Explorer',
    desc: '10 identity reflections',
    threshold: 10,
  },
  relationship_mapper: {
    icon: '🗺️',
    title: 'Relationship Mapper',
    desc: 'Mentioned 5+ people',
    threshold: 5,
  },
};

// Level unlocks with teasers for curiosity gap
export const LEVEL_UNLOCKS: Record<number, LevelUnlock> = {
  1: {
    features: ['Basic insights', 'Memory tracking'],
    teaser: 'Breakthrough detection at Level 2',
  },
  2: {
    features: ['Breakthrough detection', 'Pattern analysis'],
    teaser: 'Identity reflections at Level 3',
  },
  3: {
    features: ['Identity reflections', 'Relationship mapping'],
    teaser: 'Weekly insights at Level 4',
  },
  4: {
    features: ['Weekly insight summaries', 'Deep pattern connections'],
    teaser: 'Monthly retrospective at Level 5',
  },
  5: {
    features: ['Monthly retrospectives', 'Full journey timeline', 'All features unlocked'],
  },
};

// Identity reinforcement messages based on behavior
export const IDENTITY_MESSAGES: Record<string, string> = {
  streak_3: "You're someone who shows up consistently",
  streak_7: "You've built a powerful habit of self-reflection",
  breakthroughs_5: "You have real self-awareness",
  regular_user: "You take your growth seriously",
  after_vulnerability: "It takes courage to look inward like this",
};

// Streak milestone messages for celebrations
export const STREAK_MILESTONES: Record<number, { title: string; message: string }> = {
  3: {
    title: '3 DAY STREAK!',
    message: "You're building momentum. Keep going.",
  },
  7: {
    title: '7 DAY STREAK!',
    message: "You keep showing up for yourself. That's rare. That matters.",
  },
  14: {
    title: '2 WEEK STREAK!',
    message: "Two weeks of showing up. You're proving something to yourself.",
  },
  30: {
    title: 'MONTH MASTER!',
    message: "A whole month of consistent growth. You've transformed self-reflection into a habit.",
  },
};

// Session recap insights for variable rewards
export const SESSION_INSIGHTS = [
  { pattern: 'control', message: "You've mentioned 'control' a few times this week. This might be worth exploring together." },
  { pattern: 'fear', message: "I've noticed fear coming up in our conversations. What feels scary right now?" },
  { pattern: 'change', message: "There's been a lot about change lately. How are you feeling about where things are heading?" },
  { pattern: 'relationship', message: "Relationships seem to be on your mind. Is there someone specific you're thinking about?" },
];

// Total number of achievements for progress display
export const TOTAL_ACHIEVEMENTS = Object.keys(ACHIEVEMENTS).length;
