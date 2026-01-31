import React from 'react';
import { clsx } from 'clsx';

interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: 'default' | 'primary' | 'success' | 'gold' | 'rose' | 'outline';
  size?: 'sm' | 'md';
  icon?: React.ReactNode;
}

export const Badge: React.FC<BadgeProps> = ({
  children,
  variant = 'default',
  size = 'md',
  icon,
  className,
  ...props
}) => {
  const baseStyles = 'inline-flex items-center font-medium';

  const variants = {
    default: 'bg-surface-subtle text-text-secondary',
    primary: 'bg-primary-50 text-primary-500',
    success: 'bg-emerald-50 text-emerald-600',
    gold: 'bg-amber-50 text-amber-600',
    rose: 'bg-rose-50 text-rose-600',
    outline: 'bg-transparent border border-border text-text-secondary',
  };

  const sizes = {
    sm: 'px-2 py-0.5 text-[10px] rounded gap-1',
    md: 'px-2.5 py-1 text-xs rounded-md gap-1.5',
  };

  return (
    <span
      className={clsx(baseStyles, variants[variant], sizes[size], className)}
      {...props}
    >
      {icon && <span className="flex-shrink-0">{icon}</span>}
      {children}
    </span>
  );
};

interface PillBadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: 'default' | 'primary' | 'success' | 'gold';
  icon?: React.ReactNode;
}

export const PillBadge: React.FC<PillBadgeProps> = ({
  children,
  variant = 'default',
  icon,
  className,
  ...props
}) => {
  const variants = {
    default: 'bg-white/80 backdrop-blur-sm border border-border-subtle text-text-secondary',
    primary: 'bg-primary-50 border border-primary-100 text-primary-600',
    success: 'bg-emerald-50 border border-emerald-100 text-emerald-600',
    gold: 'bg-amber-50 border border-amber-100 text-amber-600',
  };

  return (
    <span
      className={clsx(
        'inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium',
        variants[variant],
        className
      )}
      {...props}
    >
      {icon && <span className="flex-shrink-0">{icon}</span>}
      {children}
    </span>
  );
};

interface FeaturePillProps extends React.HTMLAttributes<HTMLSpanElement> {
  icon?: React.ReactNode;
}

export const FeaturePill: React.FC<FeaturePillProps> = ({
  children,
  icon,
  className,
  ...props
}) => {
  return (
    <span
      className={clsx(
        'inline-flex items-center gap-2 px-4 py-2 rounded-full',
        'bg-white/60 backdrop-blur-sm border border-white/80',
        'text-sm font-medium text-text-secondary',
        'shadow-sm',
        className
      )}
      {...props}
    >
      {icon && <span className="text-primary-400">{icon}</span>}
      {children}
    </span>
  );
};

export default Badge;
