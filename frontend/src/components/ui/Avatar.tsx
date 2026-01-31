import React from 'react';
import { clsx } from 'clsx';
import { User } from 'lucide-react';

interface AvatarProps extends React.HTMLAttributes<HTMLDivElement> {
  src?: string;
  alt?: string;
  name?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  fallback?: React.ReactNode;
}

export const Avatar: React.FC<AvatarProps> = ({
  src,
  alt,
  name,
  size = 'md',
  fallback,
  className,
  ...props
}) => {
  const sizes = {
    sm: 'w-8 h-8 text-xs',
    md: 'w-10 h-10 text-sm',
    lg: 'w-12 h-12 text-base',
    xl: 'w-16 h-16 text-lg',
  };

  const iconSizes = {
    sm: 'w-4 h-4',
    md: 'w-5 h-5',
    lg: 'w-6 h-6',
    xl: 'w-8 h-8',
  };

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <div
      className={clsx(
        'relative flex items-center justify-center rounded-full overflow-hidden',
        'bg-primary-100 text-primary-600 font-medium',
        sizes[size],
        className
      )}
      {...props}
    >
      {src ? (
        <img src={src} alt={alt || name || 'Avatar'} className="w-full h-full object-cover" />
      ) : name ? (
        <span>{getInitials(name)}</span>
      ) : fallback ? (
        fallback
      ) : (
        <User className={iconSizes[size]} />
      )}
    </div>
  );
};

interface AvatarGroupProps extends React.HTMLAttributes<HTMLDivElement> {
  avatars: Array<{ src?: string; name?: string }>;
  max?: number;
  size?: 'sm' | 'md' | 'lg';
}

export const AvatarGroup: React.FC<AvatarGroupProps> = ({
  avatars,
  max = 4,
  size = 'md',
  className,
  ...props
}) => {
  const visibleAvatars = avatars.slice(0, max);
  const remainingCount = avatars.length - max;

  const overlaps = {
    sm: '-ml-2',
    md: '-ml-3',
    lg: '-ml-4',
  };

  const sizes = {
    sm: 'w-8 h-8 text-xs',
    md: 'w-10 h-10 text-sm',
    lg: 'w-12 h-12 text-base',
  };

  return (
    <div className={clsx('flex items-center', className)} {...props}>
      {visibleAvatars.map((avatar, index) => (
        <Avatar
          key={index}
          src={avatar.src}
          name={avatar.name}
          size={size}
          className={clsx(
            'ring-2 ring-white',
            index > 0 && overlaps[size]
          )}
        />
      ))}
      {remainingCount > 0 && (
        <div
          className={clsx(
            'flex items-center justify-center rounded-full',
            'bg-surface-subtle text-text-secondary font-medium ring-2 ring-white',
            sizes[size],
            overlaps[size]
          )}
        >
          +{remainingCount}
        </div>
      )}
    </div>
  );
};

export default Avatar;
