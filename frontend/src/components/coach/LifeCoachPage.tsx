/**
 * Life Coach Page - Reflective guidance and growth support
 */

import React, { useEffect, useState, useRef } from 'react';
import { Heart } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { Card } from '@/components/ui';
import { ChatInput } from '@/components/chat/ChatInput';
import { MessageCard, ThinkingIndicator } from '@/components/chat/MessageCard';
import type { Message } from '@/types';
import axios from 'axios';

const COACH_PROMPTS = [
  { label: 'Guide me through this', prompt: "I'm struggling with something and need guidance" },
  { label: 'Challenge my thinking', prompt: "I feel stuck in my thinking - can you challenge me?" },
  { label: 'Help me grow', prompt: "I want to grow but I'm not sure where to start" },
  { label: 'What am I avoiding?', prompt: "What patterns of avoidance have you noticed?" },
];

interface AreaToWorkOn {
  title: string;
  description: string;
  category: string;
  frequency: number;
  examples: string[];
}

export const LifeCoachPage: React.FC = () => {
  const { userId } = useAuth();
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [areasToWorkOn, setAreasToWorkOn] = useState<AreaToWorkOn[]>([]);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (userId) {
      axios.get(`/api/user/${userId}/areas-to-work-on`)
        .then(response => setAreasToWorkOn(response.data))
        .catch(console.error);
    }
  }, [userId]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || !userId || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      content: input.trim(),
      role: 'user',
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      const response = await axios.post('/api/coach', {
        user_input: input.trim(),
        user_id: userId,
      });

      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        content: response.data.response,
        role: 'assistant',
        timestamp: new Date(),
      };

      setMessages(prev => [...prev, assistantMessage]);
    } catch (error) {
      console.error('Failed to send message:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAreaClick = (area: AreaToWorkOn) => {
    setInput(`I'd like to explore: ${area.title}`);
  };

  const handlePromptClick = (prompt: string) => {
    setInput(prompt);
  };

  return (
    <div className="h-full flex flex-col bg-background">
      {/* Header */}
      <div className="border-b border-border-subtle bg-white/60 backdrop-blur-xl">
        <div className="max-w-[800px] mx-auto px-6 py-6">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-xl bg-rose-50 flex items-center justify-center">
              <Heart className="w-5 h-5 text-rose-500" />
            </div>
            <h1 className="text-2xl font-semibold text-text-primary">Life Coach</h1>
          </div>
          <p className="text-text-secondary ml-[52px]">
            A reflective guide to help you grow through challenges
          </p>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto">
        <div className="max-w-[800px] mx-auto px-6 py-10">
          {messages.length === 0 ? (
            <div className="space-y-6">
              {/* Areas to Work On */}
              {areasToWorkOn.length > 0 && (
                <Card variant="default" padding="lg">
                  <h2 className="text-lg font-semibold text-text-primary mb-4">
                    Areas You Might Want to Explore
                  </h2>
                  <div className="space-y-3">
                    {areasToWorkOn.map((area, idx) => (
                      <button
                        key={idx}
                        onClick={() => handleAreaClick(area)}
                        className="w-full text-left p-4 rounded-xl bg-surface-subtle hover:bg-white hover:shadow-sm border border-transparent hover:border-rose-200 transition-all"
                      >
                        <h3 className="text-sm font-medium text-text-primary mb-1">
                          {area.title}
                        </h3>
                        <p className="text-xs text-text-secondary">
                          {area.description}
                        </p>
                      </button>
                    ))}
                  </div>
                </Card>
              )}

              {/* Generic Coach Prompts */}
              <div>
                <p className="text-sm text-text-secondary mb-4">Or start with:</p>
                <div className="grid grid-cols-2 gap-3">
                  {COACH_PROMPTS.map((prompt, idx) => (
                    <button
                      key={idx}
                      onClick={() => handlePromptClick(prompt.prompt)}
                      className="p-4 rounded-xl bg-white border border-border-subtle hover:border-rose-300 hover:shadow-sm transition-all text-left"
                    >
                      <p className="text-sm font-medium text-text-primary">
                        {prompt.label}
                      </p>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            <div className="space-y-6">
              {messages.map(msg => (
                <MessageCard key={msg.id} message={msg} />
              ))}
              {isLoading && <ThinkingIndicator message="Reflecting..." />}
              <div ref={messagesEndRef} />
            </div>
          )}
        </div>
      </div>

      {/* Input */}
      <div className="border-t border-border-subtle bg-white/60 backdrop-blur-xl">
        <div className="max-w-[800px] mx-auto px-6 py-5">
          <ChatInput
            value={input}
            onChange={setInput}
            onSubmit={handleSend}
            isLoading={isLoading}
            placeholder="What would you like to work on?"
          />
        </div>
      </div>
    </div>
  );
};

export default LifeCoachPage;
