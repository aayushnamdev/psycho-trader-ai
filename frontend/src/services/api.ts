/**
 * API service for backend communication
 */

import axios from 'axios';
import type { 
  SessionRequest, 
  SessionResponse, 
  Memory, 
  Session, 
  DashboardStats, 
  RelationshipStats, 
  Achievement, 
  StreakStatus,
  JournalEntry,           // ADD
  FollowUpQuestion,        // ADD
  GenerateQuestionsResponse // ADD
} from '@/types';

const api = axios.create({
  baseURL: '/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

export const sessionApi = {
  /**
   * Send message and get psychoanalytic response
   */
  sendMessage: async (request: SessionRequest): Promise<SessionResponse> => {
    const response = await api.post<SessionResponse>('/session', request);
    return response.data;
  },

  /**
   * End session and get summary
   */
  endSession: async (request: { user_id: string }): Promise<SessionResponse> => {
    const response = await api.post<SessionResponse>('/session/end', {
      user_input: '',
      user_id: request.user_id,
    });
    return response.data;
  },
};

export const memoryApi = {
  /**
   * Get all memories for a trader
   */
  getMemories: async (traderId: string): Promise<Memory[]> => {
    const response = await api.get<Memory[]>(`/user/${traderId}/memories`);
    return response.data;
  },

  /**
   * Get memories by category
   */
  getMemoriesByCategory: async (traderId: string, category: string): Promise<Memory[]> => {
    const response = await api.get<Memory[]>(`/user/${traderId}/memories/category/${category}`);
    return response.data;
  },

  /**
   * Get pattern categories
   */
  getPatternCategories: async (traderId: string): Promise<string[]> => {
    const response = await api.get<string[]>(`/user/${traderId}/patterns`);
    return response.data;
  },
};

export const dashboardApi = {
  /**
   * Get dashboard statistics
   */
  getStats: async (traderId: string): Promise<DashboardStats> => {
    const response = await api.get<DashboardStats>(`/user/${traderId}/stats`);
    return response.data;
  },

  /**
   * Get recent sessions
   */
  getSessions: async (traderId: string, limit: number = 10): Promise<Session[]> => {
    const response = await api.get<Session[]>(`/user/${traderId}/sessions`, {
      params: { limit },
    });
    return response.data;
  },
};

export const relationshipApi = {
  /**
   * Get relationship statistics for a trader
   */
  getStats: async (traderId: string): Promise<RelationshipStats> => {
    const response = await api.get<RelationshipStats>(`/user/${traderId}/relationship`);
    return response.data;
  },
};

export const achievementApi = {
  /**
   * Get all achievements for a trader
   */
  getAchievements: async (traderId: string): Promise<Achievement[]> => {
    const response = await api.get<Achievement[]>(`/user/${traderId}/achievements`);
    return response.data;
  },

  /**
   * Get uncelebrated achievements
   */
  getUncelebrated: async (traderId: string): Promise<Achievement[]> => {
    const response = await api.get<Achievement[]>(`/user/${traderId}/achievements/uncelebrated`);
    return response.data;
  },

  /**
   * Check and unlock new achievements
   */
  checkAchievements: async (traderId: string): Promise<Achievement[]> => {
    const response = await api.post<Achievement[]>(`/user/${traderId}/achievements/check`);
    return response.data;
  },

  /**
   * Mark an achievement as celebrated
   */
  celebrate: async (traderId: string, achievementId: number): Promise<void> => {
    await api.post(`/user/${traderId}/achievements/${achievementId}/celebrate`);
  },

  /**
   * Get streak status
   */
  getStreakStatus: async (traderId: string): Promise<StreakStatus> => {
    const response = await api.get<StreakStatus>(`/user/${traderId}/streak-status`);
    return response.data;
  },
};

// ========================================
// NEW: Journal API Methods
// ========================================

export const journalApi = {
  /**
   * Get all journal entries for a trader
   */
  getJournalEntries: async (traderId: string): Promise<JournalEntry[]> => {
    const response = await api.get<JournalEntry[]>(`/journal/${traderId}`);
    return response.data;
  },

  /**
   * Create a new journal entry
   */
  createJournalEntry: async (
    traderId: string,
    content: string,
    conversationId?: string
  ): Promise<JournalEntry> => {
    const response = await api.post<JournalEntry>('/journal', {
      traderId,
      content,
      conversationId,
      timestamp: new Date().toISOString(),
    });
    return response.data;
  },

  /**
   * Generate AI follow-up questions for a journal entry
   */
  generateFollowUpQuestions: async (
    traderId: string,
    entryId: string
  ): Promise<FollowUpQuestion[]> => {
    const response = await api.post<GenerateQuestionsResponse>(
      `/journal/${entryId}/generate-questions`,
      { traderId }
    );
    return response.data.questions;
  },

  /**
   * Delete a follow-up question
   */
  deleteFollowUpQuestion: async (
    entryId: string,
    questionId: string
  ): Promise<void> => {
    await api.delete(`/journal/${entryId}/questions/${questionId}`);
  },

  /**
   * Create journal entry from chat messages
   */
  createJournalEntryFromChat: async (
    traderId: string,
    conversationId: string,
    messages: Array<{ role: string; content: string }>
  ): Promise<JournalEntry> => {
    const userContent = messages
      .filter(m => m.role === 'user')
      .map(m => m.content)
      .join('\n\n');
    
    const response = await api.post<JournalEntry>('/journal', {
      traderId,
      content: userContent,
      conversationId,
      timestamp: new Date().toISOString(),
    });
    return response.data;
  },
};

// Single default export
export default api;