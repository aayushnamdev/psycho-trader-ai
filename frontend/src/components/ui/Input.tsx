import React, { forwardRef } from 'react';
import { clsx } from 'clsx';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  variant?: 'default' | 'pill';
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  error?: boolean;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ variant = 'default', leftIcon, rightIcon, error = false, className, ...props }, ref) => {
    const baseStyles = 'w-full text-text-primary placeholder-text-muted transition-all duration-200 ease-spring outline-none disabled:opacity-50 disabled:cursor-not-allowed';

    const variants = {
      default: clsx(
        'px-4 py-3.5 bg-white border rounded-xl',
        error
          ? 'border-accent-rose focus:border-accent-rose focus:ring-2 focus:ring-accent-rose/20'
          : 'border-border focus:border-primary-500 focus:ring-2 focus:ring-primary-500/10'
      ),
      pill: clsx(
        'px-5 py-3.5 bg-white border rounded-full shadow-lg',
        error
          ? 'border-accent-rose focus:border-accent-rose'
          : 'border-border focus:border-primary-500'
      ),
    };

    if (leftIcon || rightIcon) {
      return (
        <div className="relative">
          {leftIcon && (
            <div className="absolute left-4 top-1/2 -translate-y-1/2 text-text-tertiary">
              {leftIcon}
            </div>
          )}
          <input
            ref={ref}
            className={clsx(
              baseStyles,
              variants[variant],
              leftIcon && 'pl-12',
              rightIcon && 'pr-12',
              className
            )}
            {...props}
          />
          {rightIcon && (
            <div className="absolute right-4 top-1/2 -translate-y-1/2 text-text-tertiary">
              {rightIcon}
            </div>
          )}
        </div>
      );
    }

    return (
      <input
        ref={ref}
        className={clsx(baseStyles, variants[variant], className)}
        {...props}
      />
    );
  }
);

Input.displayName = 'Input';

interface TextAreaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  variant?: 'default' | 'pill';
  error?: boolean;
}

export const TextArea = forwardRef<HTMLTextAreaElement, TextAreaProps>(
  ({ variant = 'default', error = false, className, ...props }, ref) => {
    const baseStyles = 'w-full text-text-primary placeholder-text-muted transition-all duration-200 ease-spring outline-none resize-none disabled:opacity-50 disabled:cursor-not-allowed';

    const variants = {
      default: clsx(
        'px-4 py-3.5 bg-white border rounded-xl',
        error
          ? 'border-accent-rose focus:border-accent-rose focus:ring-2 focus:ring-accent-rose/20'
          : 'border-border focus:border-primary-500 focus:ring-2 focus:ring-primary-500/10'
      ),
      pill: clsx(
        'px-5 py-3.5 bg-surface-subtle border rounded-2xl',
        error
          ? 'border-accent-rose focus:border-accent-rose'
          : 'border-transparent focus:border-primary-500 focus:bg-white'
      ),
    };

    return (
      <textarea
        ref={ref}
        className={clsx(baseStyles, variants[variant], className)}
        {...props}
      />
    );
  }
);

TextArea.displayName = 'TextArea';

export default Input;
