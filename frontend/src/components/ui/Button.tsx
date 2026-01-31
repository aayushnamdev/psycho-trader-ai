import React from 'react';
import { clsx } from 'clsx';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'icon';
  size?: 'sm' | 'md' | 'lg';
  isLoading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

export const Button: React.FC<ButtonProps> = ({
  children,
  variant = 'primary',
  size = 'md',
  isLoading = false,
  leftIcon,
  rightIcon,
  className,
  disabled,
  ...props
}) => {
  const baseStyles = 'inline-flex items-center justify-center font-medium transition-all duration-200 ease-spring disabled:opacity-50 disabled:cursor-not-allowed';

  const variants = {
    primary: 'bg-primary-500 text-white hover:bg-primary-600 active:scale-[0.98] shadow-[0_2px_8px_rgba(124,92,255,0.3)] hover:shadow-[0_4px_16px_rgba(124,92,255,0.35)]',
    secondary: 'bg-surface-subtle text-text-primary border border-border hover:bg-white hover:border-border-visible',
    ghost: 'bg-transparent text-text-secondary hover:bg-surface-subtle hover:text-text-primary',
    icon: 'bg-transparent text-text-secondary hover:bg-surface-subtle hover:text-text-primary',
  };

  const sizes = {
    sm: variant === 'icon' ? 'w-8 h-8 rounded-lg' : 'px-3 py-1.5 text-sm rounded-lg gap-1.5',
    md: variant === 'icon' ? 'w-10 h-10 rounded-xl' : 'px-5 py-2.5 text-base rounded-xl gap-2',
    lg: variant === 'icon' ? 'w-12 h-12 rounded-xl' : 'px-6 py-3 text-lg rounded-xl gap-2.5',
  };

  return (
    <button
      className={clsx(baseStyles, variants[variant], sizes[size], className)}
      disabled={disabled || isLoading}
      {...props}
    >
      {isLoading ? (
        <span className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
      ) : (
        <>
          {leftIcon && <span className="flex-shrink-0">{leftIcon}</span>}
          {children}
          {rightIcon && <span className="flex-shrink-0">{rightIcon}</span>}
        </>
      )}
    </button>
  );
};

interface IconButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  icon: React.ReactNode;
  size?: 'sm' | 'md' | 'lg';
  variant?: 'ghost' | 'filled' | 'primary';
  isActive?: boolean;
}

export const IconButton: React.FC<IconButtonProps> = ({
  icon,
  size = 'md',
  variant = 'ghost',
  isActive = false,
  className,
  ...props
}) => {
  const baseStyles = 'inline-flex items-center justify-center transition-all duration-200 ease-spring disabled:opacity-50 disabled:cursor-not-allowed';

  const variants = {
    ghost: clsx(
      'text-text-secondary hover:text-text-primary',
      isActive ? 'bg-primary-50 text-primary-500' : 'hover:bg-surface-subtle'
    ),
    filled: clsx(
      'border',
      isActive
        ? 'bg-primary-50 border-primary-200 text-primary-500'
        : 'bg-white border-border text-text-secondary hover:border-border-visible hover:text-text-primary'
    ),
    primary: 'bg-primary-500 text-white hover:bg-primary-600 shadow-[0_2px_8px_rgba(124,92,255,0.3)]',
  };

  const sizes = {
    sm: 'w-8 h-8 rounded-lg',
    md: 'w-10 h-10 rounded-xl',
    lg: 'w-12 h-12 rounded-xl',
  };

  return (
    <button
      className={clsx(baseStyles, variants[variant], sizes[size], className)}
      {...props}
    >
      {icon}
    </button>
  );
};

interface CircleButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  icon: React.ReactNode;
  size?: 'sm' | 'md' | 'lg';
}

export const CircleButton: React.FC<CircleButtonProps> = ({
  icon,
  size = 'md',
  className,
  disabled,
  ...props
}) => {
  const sizes = {
    sm: 'w-9 h-9',
    md: 'w-11 h-11',
    lg: 'w-14 h-14',
  };

  return (
    <button
      className={clsx(
        'flex items-center justify-center rounded-full bg-primary-500 text-white',
        'transition-all duration-200 ease-spring',
        'hover:scale-105 active:scale-95',
        'shadow-[0_2px_8px_rgba(124,92,255,0.3)] hover:shadow-[0_4px_16px_rgba(124,92,255,0.35)]',
        'disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:scale-100',
        sizes[size],
        className
      )}
      disabled={disabled}
      {...props}
    >
      {icon}
    </button>
  );
};

export default Button;
