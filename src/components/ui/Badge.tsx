import React from 'react';
import { MasteryStatus } from '@prisma/client';

interface BadgeProps {
  children: React.ReactNode;
  variant?: 'default' | 'topic' | 'master' | 'unsure' | 'streak' | 'stage';
  className?: string;
}

export const Badge: React.FC<BadgeProps> = ({
  children,
  variant = 'default',
  className = '',
}) => {
  const baseStyles = 'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium tracking-wide';

  const variantStyles = {
    default: 'bg-stone-100 dark:bg-stone-800 text-stone-700 dark:text-stone-300 border border-stone-200 dark:border-stone-700',
    topic: 'bg-orange-50 dark:bg-orange-950/40 text-orange-700 dark:text-orange-300 border border-orange-200/60 dark:border-orange-800/50',
    master: 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border border-emerald-200/70 dark:border-emerald-800/50',
    unsure: 'bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300 border border-amber-200/70 dark:border-amber-800/50',
    streak: 'bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-200 border border-amber-300 dark:border-amber-700',
    stage: 'bg-indigo-50 dark:bg-indigo-950/40 text-indigo-700 dark:text-indigo-300 border border-indigo-200/70 dark:border-indigo-800/50',
  };

  return (
    <span className={`${baseStyles} ${variantStyles[variant]} ${className}`}>
      {children}
    </span>
  );
};

export const MasteryBadge: React.FC<{ status: MasteryStatus | string }> = ({ status }) => {
  if (status === 'MASTER') {
    return (
      <Badge variant="master">
        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 mr-1.5"></span>
        Master
      </Badge>
    );
  }
  return (
    <Badge variant="unsure">
      <span className="w-1.5 h-1.5 rounded-full bg-amber-500 mr-1.5"></span>
      Masih Ragu
    </Badge>
  );
};
