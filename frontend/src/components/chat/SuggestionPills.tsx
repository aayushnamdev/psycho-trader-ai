import React from 'react';
import { clsx } from 'clsx';
import { Sparkles, TrendingUp, Brain, MessageCircle } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';

interface Suggestion {
  id: string;
  label: string;
  icon: LucideIcon;
  prompt: string;
}

const suggestions: Suggestion[] = [
  { id: 'patterns', label: 'What patterns am I showing?', icon: TrendingUp, prompt: 'What patterns have you noticed in my thoughts and behaviors?' },
  { id: 'summarize', label: 'Summarize my week', icon: MessageCircle, prompt: 'Can you summarize what we\'ve discussed this week and any progress I\'ve made?' },
  { id: 'biases', label: 'What biases do I have?', icon: Brain, prompt: 'What patterns of thinking have you noticed that might be limiting me?' },
  { id: 'coach', label: 'Guide me through this', icon: Sparkles, prompt: 'I need help working through something. Can you guide me?' },
];

interface SuggestionPillsProps {
  onSelect: (prompt: string) => void;
  className?: string;
}

export const SuggestionPills: React.FC<SuggestionPillsProps> = ({ onSelect, className }) => (
  <div className={clsx('flex flex-wrap justify-center gap-2', className)}>
    {suggestions.map((suggestion, index) => {
      const Icon = suggestion.icon;
      return (
        <button
          key={suggestion.id}
          onClick={() => onSelect(suggestion.prompt)}
          className="group flex items-center gap-2.5 px-4 py-2.5 bg-white/80 backdrop-blur-sm border border-border-subtle hover:border-primary-200 rounded-full shadow-sm hover:shadow-md text-sm font-medium text-text-secondary hover:text-text-primary transition-all duration-200 hover:-translate-y-0.5 animate-fade-up"
          style={{ animationDelay: `${index * 80}ms`, opacity: 0 }}
        >
          <Icon className="w-4 h-4 text-primary-400 group-hover:text-primary-500 transition-colors" />
          <span>{suggestion.label}</span>
        </button>
      );
    })}
  </div>
);

export default SuggestionPills;
