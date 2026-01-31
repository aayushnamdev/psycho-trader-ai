import React from 'react';
import { clsx } from 'clsx';

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'elevated' | 'glass' | 'glow';
  padding?: 'none' | 'sm' | 'md' | 'lg';
  hover?: boolean;
}

export const Card: React.FC<CardProps> = ({
  children,
  variant = 'default',
  padding = 'md',
  hover = false,
  className,
  ...props
}) => {
  const baseStyles = 'rounded-2xl transition-all duration-300';

  const variants = {
    default: 'bg-white border border-border-subtle shadow-md',
    elevated: 'bg-white border border-white/80 shadow-lg',
    glass: 'bg-white/70 backdrop-blur-xl border border-white/80 shadow-lg',
    glow: 'bg-white border border-border-visible shadow-lg shadow-primary-500/5',
  };

  const paddings = {
    none: '',
    sm: 'p-4',
    md: 'p-6',
    lg: 'p-8',
  };

  const hoverStyles = hover
    ? 'hover:shadow-xl hover:border-border-visible hover:-translate-y-0.5 cursor-pointer'
    : '';

  return (
    <div
      className={clsx(baseStyles, variants[variant], paddings[padding], hoverStyles, className)}
      {...props}
    >
      {children}
    </div>
  );
};

interface GlassCardProps extends React.HTMLAttributes<HTMLDivElement> {
  padding?: 'none' | 'sm' | 'md' | 'lg';
  blur?: 'sm' | 'md' | 'lg';
}

export const GlassCard: React.FC<GlassCardProps> = ({
  children,
  padding = 'md',
  blur = 'lg',
  className,
  ...props
}) => {
  const paddings = {
    none: '',
    sm: 'p-4',
    md: 'p-6',
    lg: 'p-8',
  };

  const blurs = {
    sm: 'backdrop-blur-sm',
    md: 'backdrop-blur-md',
    lg: 'backdrop-blur-xl',
  };

  return (
    <div
      className={clsx(
        'rounded-2xl bg-white/70 border border-white/80',
        'shadow-[0_8px_32px_rgba(124,92,255,0.08)]',
        blurs[blur],
        paddings[padding],
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
};

interface MessageCardProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'user' | 'assistant';
}

export const MessageCard: React.FC<MessageCardProps> = ({
  children,
  variant = 'assistant',
  className,
  ...props
}) => {
  const variants = {
    user: 'bg-primary-500 text-white rounded-2xl rounded-br-md',
    assistant: 'bg-white text-text-primary border border-border-subtle rounded-2xl rounded-bl-md shadow-sm',
  };

  return (
    <div
      className={clsx('px-5 py-4', variants[variant], className)}
      {...props}
    >
      {children}
    </div>
  );
};

export default Card;
