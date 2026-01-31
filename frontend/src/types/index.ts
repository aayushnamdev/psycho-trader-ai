/**
 * Core TypeScript types for Reflection Space frontend
 */

export interface Message {
  id: string;
  content: string;
  role: 'user' | 'assistant';
  timestamp: Date;
}

export interface Memory {
  id: number;
  observation: string;
  interpretation?: string;
  category?: string;
  relevance_score: number;
  created_at: string;
  // Emotional relationship fields
  follow_up_question?: string;
  people_mentioned?: string;  // JSON array string
  is_identity_statement?: boolean;
  is_breakthrough_moment?: boolean;
}

export interface Session {
  id: number;
  user_input: string;
  agent_response: string;
  created_at: string;
}

export interface PatternAnalysis {
  category: string;
  count: number;
  memories: Memory[];
  trend: 'increasing' | 'stable' | 'decreasing';
}

export interface User {
  id: string;
  user_id: string;
  created_at: string;
}

export interface SessionRequest {
  user_input: string;
  user_id: string;
}

export interface SessionResponse {
  response: string;
}

export interface AuthState {
  userId: string | null;
  isAuthenticated: boolean;
}

export interface DashboardStats {
  total_sessions: number;
  total_memories: number;
  active_patterns: number;
  last_session: string | null;
}

export interface RelationshipStats {
  days_together: number;
  total_sessions: number;
  current_streak: number;
  longest_streak: number;
  connection_depth: number;
  connection_depth_label: string;
}

export interface Achievement {
  id: number;
  achievement_key: string;
  unlocked_at: string;
  celebrated: boolean;
}

export interface StreakStatus {
  current_streak: number;
  streak_at_risk: boolean;
  has_interacted_today: boolean;
  longest_streak: number;
}

export interface AchievementDefinition {
  icon: string;
  title: string;
  desc: string;
  threshold?: number;
  level?: number;
}

export interface LevelUnlock {
  features: string[];
  teaser?: string;
}

// ========================================
// NEW: Journal Feature Types (safe to add)
// ========================================

export interface FollowUpQuestion {
  id: string;
  question: string;
  createdAt: string;
}

export interface JournalEntry {
  id: string;
  userId: string;
  content: string;
  timestamp: string;
  conversationId?: string;
  followUpQuestions?: FollowUpQuestion[];
  tags?: string[];
  sentiment?: 'positive' | 'negative' | 'neutral';
}

export interface GenerateQuestionsRequest {
  userId: string;
  entryId: string;
  entryContent: string;
}

export interface GenerateQuestionsResponse {
  questions: FollowUpQuestion[];
}

// ========================================
// Reflection.app UI Types
// ========================================

export interface ChecklistItem {
  id: string;
  label: string;
  completed: boolean;
  link?: string;
}

export interface DailyQuestion {
  id: string;
  question: string;
  date: string;
}

export interface WeekDay {
  day: string;
  date: number;
  completed: boolean;
  isToday: boolean;
}

export interface UserStats {
  totalWords: number;
  totalEntries: number;
  longestStreak: number;
}

export interface LookBackEntry {
  id: string;
  content: string;
  date: string;
  daysAgo: number;
}