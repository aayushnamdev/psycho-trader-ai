import React from 'react';
import { clsx } from 'clsx';

interface HeadlineProps extends React.HTMLAttributes<HTMLHeadingElement> {
  as?: 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6';
  size?: 'sm' | 'md' | 'lg' | 'xl' | '2xl';
}

export const Headline: React.FC<HeadlineProps> = ({
  children,
  as: Component = 'h1',
  size = 'lg',
  className,
  ...props
}) => {
  const sizes = {
    sm: 'text-xl',
    md: 'text-2xl',
    lg: 'text-3xl',
    xl: 'text-4xl',
    '2xl': 'text-5xl',
  };

  return (
    <Component
      className={clsx(
        'font-serif italic font-normal text-text-primary tracking-tight',
        sizes[size],
        className
      )}
      {...props}
    >
      {children}
    </Component>
  );
};

interface LabelProps extends React.HTMLAttributes<HTMLSpanElement> {
  as?: 'span' | 'p' | 'div';
}

export const Label: React.FC<LabelProps> = ({
  children,
  as: Component = 'span',
  className,
  ...props
}) => {
  return (
    <Component
      className={clsx(
        'text-xs font-medium uppercase tracking-wider text-text-tertiary',
        className
      )}
      {...props}
    >
      {children}
    </Component>
  );
};

interface TextProps extends React.HTMLAttributes<HTMLParagraphElement> {
  variant?: 'body' | 'body-lg' | 'caption' | 'small';
  muted?: boolean;
}

export const Text: React.FC<TextProps> = ({
  children,
  variant = 'body',
  muted = false,
  className,
  ...props
}) => {
  const variants = {
    body: 'text-base',
    'body-lg': 'text-lg',
    caption: 'text-sm',
    small: 'text-xs',
  };

  return (
    <p
      className={clsx(
        variants[variant],
        muted ? 'text-text-secondary' : 'text-text-primary',
        className
      )}
      {...props}
    >
      {children}
    </p>
  );
};

interface SectionTitleProps extends React.HTMLAttributes<HTMLDivElement> {
  title: string;
  subtitle?: string;
  action?: React.ReactNode;
}

export const SectionTitle: React.FC<SectionTitleProps> = ({
  title,
  subtitle,
  action,
  className,
  ...props
}) => {
  return (
    <div className={clsx('flex items-start justify-between mb-6', className)} {...props}>
      <div>
        <h2 className="text-xl font-semibold text-text-primary">{title}</h2>
        {subtitle && <p className="text-sm text-text-secondary mt-0.5">{subtitle}</p>}
      </div>
      {action && <div>{action}</div>}
    </div>
  );
};

export default { Headline, Label, Text, SectionTitle };
