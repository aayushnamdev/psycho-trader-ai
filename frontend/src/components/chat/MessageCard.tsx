import React, { useState } from 'react';
import { clsx } from 'clsx';
import { Copy, Check, Pencil } from 'lucide-react';
import type { Message } from '@/types';

interface MessageCardProps {
  message: Message;
  onEdit?: (content: string) => void;
  onCopy?: (content: string) => void;
}

export const MessageCard: React.FC<MessageCardProps> = ({ message, onEdit, onCopy }) => {
  const [copied, setCopied] = useState(false);
  const isUser = message.role === 'user';

  const handleCopy = async () => {
    await navigator.clipboard.writeText(message.content);
    setCopied(true);
    if (onCopy) onCopy(message.content);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleEdit = () => {
    if (onEdit) onEdit(message.content);
  };

  return (
    <div
      className={clsx(
        'group flex',
        isUser ? 'justify-end' : 'justify-start'
      )}
    >
      <div
        className={clsx(
          'flex items-end gap-2 max-w-[75%]',
          isUser ? 'flex-row-reverse' : 'flex-row'
        )}
      >
        {/* Message bubble */}
        <div
          className={clsx(
            'px-5 py-4 rounded-2xl',
            isUser
              ? 'bg-primary-500 text-white rounded-br-md'
              : 'bg-white text-text-primary border border-border-subtle rounded-bl-md shadow-sm'
          )}
        >
          {/* Content */}
          <p className="text-[15px] leading-[1.7] whitespace-pre-wrap">
            {message.content}
          </p>

          {/* Timestamp */}
          <p
            className={clsx(
              'text-xs mt-2',
              isUser ? 'text-white/60' : 'text-text-tertiary'
            )}
          >
            {message.timestamp.toLocaleTimeString([], {
              hour: '2-digit',
              minute: '2-digit',
            })}
          </p>
        </div>

        {/* Action buttons */}
        <div
          className={clsx(
            'flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200',
            isUser ? 'flex-row-reverse' : 'flex-row'
          )}
        >
          <button
            onClick={handleCopy}
            className="p-1.5 rounded-lg bg-surface-subtle hover:bg-surface text-text-tertiary hover:text-text-secondary transition-colors"
            title="Copy"
          >
            {copied ? (
              <Check className="w-3.5 h-3.5 text-accent-success" />
            ) : (
              <Copy className="w-3.5 h-3.5" />
            )}
          </button>
          {isUser && onEdit && (
            <button
              onClick={handleEdit}
              className="p-1.5 rounded-lg bg-surface-subtle hover:bg-surface text-text-tertiary hover:text-text-secondary transition-colors"
              title="Edit"
            >
              <Pencil className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

interface ThinkingIndicatorProps {
  message?: string;
}

export const ThinkingIndicator: React.FC<ThinkingIndicatorProps> = ({
  message = 'Thinking...',
}) => {
  return (
    <div className="flex justify-start animate-fade-in">
      <div className="bg-white px-5 py-4 rounded-2xl rounded-bl-md border border-border-subtle shadow-sm">
        <div className="flex items-center gap-3">
          <div className="flex gap-1">
            <span
              className="w-2 h-2 bg-primary-400 rounded-full animate-pulse-soft"
              style={{ animationDelay: '0ms' }}
            />
            <span
              className="w-2 h-2 bg-primary-400 rounded-full animate-pulse-soft"
              style={{ animationDelay: '150ms' }}
            />
            <span
              className="w-2 h-2 bg-primary-400 rounded-full animate-pulse-soft"
              style={{ animationDelay: '300ms' }}
            />
          </div>
          <span className="text-sm text-text-tertiary">{message}</span>
        </div>
      </div>
    </div>
  );
};

export default MessageCard;
