/**
 * Chat Interface - Reflection.app-inspired design
 * Pill-shaped input, suggestion pills, clean message cards
 */

import React, { useState, useRef, useEffect } from 'react';
import { Sparkles, Square } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useChat } from '@/contexts/ChatContext';
import { sessionApi } from '@/services/api';
import { SuggestionPills } from './SuggestionPills';
import { ChatInput } from './ChatInput';
import { MessageCard, ThinkingIndicator } from './MessageCard';
import type { Message } from '@/types';

// Thinking messages
const THINKING_MESSAGES = [
  'Processing...',
  'Thinking about that...',
  'One sec...',
  'Working on it...',
];

const ChatInterface: React.FC = () => {
  const { userId } = useAuth();
  const { messages, addMessage, isLoading, setIsLoading, starterQuestion, setStarterQuestion } = useChat();
  const [input, setInput] = useState('');
  const [thinkingMessage, setThinkingMessage] = useState(THINKING_MESSAGES[0]);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Use starter question if provided
  useEffect(() => {
    if (starterQuestion) {
      setInput(starterQuestion);
      setStarterQuestion(null);
    }
  }, [starterQuestion, setStarterQuestion]);

  useEffect(() => {
    if (isLoading) {
      const randomIndex = Math.floor(Math.random() * THINKING_MESSAGES.length);
      setThinkingMessage(THINKING_MESSAGES[randomIndex]);
    }
  }, [isLoading]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleVoiceTranscript = (transcript: string) => {
    setInput((prev) => prev + transcript);
  };

  const handleSend = async () => {
    if (!input.trim() || !userId || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      content: input.trim(),
      role: 'user',
      timestamp: new Date(),
    };

    addMessage(userMessage);
    setInput('');
    setIsLoading(true);

    try {
      const response = await sessionApi.sendMessage({
        user_input: input.trim(),
        user_id: userId,
      });

      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        content: response.response,
        role: 'assistant',
        timestamp: new Date(),
      };

      addMessage(assistantMessage);
    } catch (error) {
      console.error('Failed to send message:', error);
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        content: 'Something went wrong. Try again.',
        role: 'assistant',
        timestamp: new Date(),
      };
      addMessage(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const handleEndSession = async () => {
    if (!userId || isLoading) return;

    setIsLoading(true);
    try {
      const response = await sessionApi.endSession({ user_id: userId });

      const summaryMessage: Message = {
        id: Date.now().toString(),
        content: response.response,
        role: 'assistant',
        timestamp: new Date(),
      };

      addMessage(summaryMessage);
    } catch (error) {
      console.error('Failed to end session:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSuggestionSelect = (prompt: string) => {
    setInput(prompt);
  };

  const handleEditMessage = (content: string) => {
    setInput(content);
  };

  return (
    <div className="flex flex-col h-full relative bg-background">
      {/* Subtle gradient glow at top */}
      <div
        className="absolute inset-x-0 top-0 h-64 pointer-events-none"
        style={{
          background:
            'radial-gradient(ellipse at 50% 0%, rgba(124, 92, 255, 0.04) 0%, transparent 70%)',
        }}
      />

      {/* Messages Container */}
      <div className="flex-1 overflow-y-auto relative z-10">
        <div className="max-w-[800px] mx-auto px-6 py-10">
          {messages.length === 0 ? (
            /* Empty State - Hero */
            <div className="flex flex-col items-center justify-center min-h-[60vh] text-center">
              {/* Animated icon */}
              <div className="mb-10 animate-float">
                <div className="w-20 h-20 rounded-3xl bg-gradient-to-br from-primary-400 to-primary-600 flex items-center justify-center shadow-xl shadow-primary-500/20">
                  <Sparkles className="w-10 h-10 text-white" />
                </div>
              </div>

              {/* Headline */}
              <h1 className="text-3xl md:text-4xl font-semibold text-text-primary tracking-tight mb-4">
                Ask your journal anything
              </h1>

              {/* Subtext */}
              <p className="text-lg text-text-secondary leading-relaxed max-w-md mb-12">
                Trading psychology, patterns you've noticed, or whatever's on your mind.
              </p>

              {/* Suggestion pills */}
              <SuggestionPills onSelect={handleSuggestionSelect} />
            </div>
          ) : (
            /* Messages */
            <div className="space-y-6">
              {messages.map((message: Message, idx: number) => (
                <div
                  key={message.id}
                  className="animate-message-in"
                  style={{
                    animationDelay: `${Math.min(idx * 30, 150)}ms`,
                    opacity: 0,
                  }}
                >
                  <MessageCard
                    message={message}
                    onEdit={message.role === 'user' ? handleEditMessage : undefined}
                  />
                </div>
              ))}

              {/* Thinking Indicator */}
              {isLoading && <ThinkingIndicator message={thinkingMessage} />}

              <div ref={messagesEndRef} />
            </div>
          )}
        </div>
      </div>

      {/* Input Area */}
      <div className="relative z-10 border-t border-border-subtle bg-white/60 backdrop-blur-xl">
        {/* END Session Button */}
        {messages.length > 0 && (
          <div className="max-w-[800px] mx-auto px-6 pt-3">
            <button
              onClick={handleEndSession}
              disabled={isLoading}
              className="text-sm text-text-secondary hover:text-text-primary flex items-center gap-2 transition-colors group disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Square className="w-4 h-4" />
              <span>End Session</span>
            </button>
          </div>
        )}

        <div className="max-w-[800px] mx-auto px-6 py-5">
          <ChatInput
            value={input}
            onChange={setInput}
            onSubmit={handleSend}
            onVoiceTranscript={handleVoiceTranscript}
            isLoading={isLoading}
            placeholder="What's on your mind?"
          />
        </div>
      </div>
    </div>
  );
};

export default ChatInterface;
