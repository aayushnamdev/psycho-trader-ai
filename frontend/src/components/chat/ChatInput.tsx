import React, { useRef, useEffect } from 'react';
import { clsx } from 'clsx';
import { Send, Sparkles } from 'lucide-react';
import VoiceInput from '@/components/VoiceInput';

interface ChatInputProps {
  value: string;
  onChange: (value: string) => void;
  onSubmit: () => void;
  onVoiceTranscript?: (transcript: string) => void;
  isLoading?: boolean;
  placeholder?: string;
  disabled?: boolean;
}

export const ChatInput: React.FC<ChatInputProps> = ({
  value,
  onChange,
  onSubmit,
  onVoiceTranscript,
  isLoading = false,
  placeholder = 'Ask anything...',
  disabled = false,
}) => {
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Auto-resize textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      const newHeight = Math.min(textareaRef.current.scrollHeight, 160);
      textareaRef.current.style.height = newHeight + 'px';
    }
  }, [value]);

  // Auto-focus after loading completes
  useEffect(() => {
    if (!isLoading && textareaRef.current) {
      textareaRef.current.focus();
    }
  }, [isLoading]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      if (value.trim() && !isLoading && !disabled) {
        onSubmit();
      }
    }
  };

  const handleVoiceTranscript = (transcript: string) => {
    if (onVoiceTranscript) {
      onVoiceTranscript(transcript);
    } else {
      onChange(value + transcript);
    }
  };

  return (
    <div className="relative">
      {/* Main input container - pill shaped */}
      <div
        className={clsx(
          'flex items-end gap-3',
          'px-5 py-3',
          'bg-white rounded-[28px]',
          'border border-border shadow-lg',
          'transition-all duration-200',
          'focus-within:border-primary-300 focus-within:shadow-xl focus-within:shadow-primary-500/5'
        )}
      >
        {/* Sparkle icon */}
        <div className="flex-shrink-0 pb-1">
          <Sparkles className="w-5 h-5 text-primary-400" />
        </div>

        {/* Text input */}
        <textarea
          ref={textareaRef}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          disabled={disabled || isLoading}
          rows={1}
          className={clsx(
            'flex-1',
            'bg-transparent border-none',
            'text-[15px] text-text-primary placeholder-text-muted',
            'outline-none focus:outline-none focus:ring-0 resize-none',
            'min-h-[28px] max-h-[160px]',
            'disabled:opacity-50'
          )}
          style={{ boxShadow: 'none' }}
        />

        {/* Voice input */}
        {onVoiceTranscript !== undefined && (
          <div className="flex-shrink-0 pb-0.5">
            <VoiceInput
              onTranscript={handleVoiceTranscript}
              isDisabled={isLoading || disabled}
            />
          </div>
        )}

        {/* Send button - circular */}
        <button
          onClick={onSubmit}
          disabled={!value.trim() || isLoading || disabled}
          className={clsx(
            'flex-shrink-0',
            'w-10 h-10 rounded-full',
            'flex items-center justify-center',
            'bg-primary-500 text-white',
            'transition-all duration-200 ease-spring',
            'hover:bg-primary-600 hover:scale-105',
            'active:scale-95',
            'disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:scale-100',
            'shadow-md shadow-primary-500/20'
          )}
        >
          {isLoading ? (
            <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
          ) : (
            <Send className="w-4 h-4" />
          )}
        </button>
      </div>

      {/* Helper text */}
      <p className="text-center text-xs text-text-tertiary mt-3">
        Not therapy or financial advice. A space for self-reflection.
      </p>
    </div>
  );
};

export default ChatInput;
