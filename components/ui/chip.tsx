import React from 'react';
import { cn } from '@/lib/utils';

interface ChipProps {
  value?: string;
  label?: string;
  color?: 'blue' | 'green' | 'red' | 'yellow' | 'purple' | 'pink' | 'indigo' | 'gray';
  variant?: 'filled' | 'outlined' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  children?: React.ReactNode;
}

const sizeClasses = {
  sm: 'px-2 py-1 text-xs',
  md: 'px-3 py-1.5 text-sm',
  lg: 'px-4 py-2 text-base',
};

export const Chip: React.FC<ChipProps> = ({
  value,
  label,
  color = 'blue',
  variant = 'filled',
  size = 'md',
  className,
  children,
}) => {
  const baseClasses = 'inline-flex items-center justify-center rounded-full font-medium';
  
  const colorVariantClasses = {
    filled: {
      blue: 'bg-blue-500 text-white dark:bg-blue-600',
      green: 'bg-green-500 text-white dark:bg-green-600',
      red: 'bg-red-500 text-white dark:bg-red-600',
      yellow: 'bg-yellow-500 text-white dark:bg-yellow-600',
      purple: 'bg-purple-500 text-white dark:bg-purple-600',
      pink: 'bg-pink-500 text-white dark:bg-pink-600',
      indigo: 'bg-indigo-500 text-white dark:bg-indigo-600',
      gray: 'bg-gray-500 text-white dark:bg-gray-600',
    },
    outlined: {
      blue: 'border-2 border-blue-500 text-blue-500 dark:border-blue-400 dark:text-blue-400',
      green: 'border-2 border-green-500 text-green-500 dark:border-green-400 dark:text-green-400',
      red: 'border-2 border-red-500 text-red-500 dark:border-red-400 dark:text-red-400',
      yellow: 'border-2 border-yellow-500 text-yellow-500 dark:border-yellow-400 dark:text-yellow-400',
      purple: 'border-2 border-purple-500 text-purple-500 dark:border-purple-400 dark:text-purple-400',
      pink: 'border-2 border-pink-500 text-pink-500 dark:border-pink-400 dark:text-pink-400',
      indigo: 'border-2 border-indigo-500 text-indigo-500 dark:border-indigo-400 dark:text-indigo-400',
      gray: 'border-2 border-gray-500 text-gray-500 dark:border-gray-400 dark:text-gray-400',
    },
    ghost: {
      blue: 'bg-blue-50 text-blue-800 dark:bg-blue-950 dark:text-blue-200',
      green: 'bg-green-100 text-green-800 dark:bg-green-950 dark:text-green-200',
      red: 'bg-red-100 text-red-800 dark:bg-red-950 dark:text-red-200',
      yellow: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-950 dark:text-yellow-200',
      purple: 'bg-purple-100 text-purple-800 dark:bg-purple-950 dark:text-purple-200',
      pink: 'bg-pink-100 text-pink-800 dark:bg-pink-950 dark:text-pink-200',
      indigo: 'bg-indigo-100 text-indigo-800 dark:bg-indigo-950 dark:text-indigo-200',
      gray: 'bg-gray-100 text-gray-800 dark:bg-gray-950 dark:text-gray-200',
    },
  };

  return (
    <span
      className={cn(
        baseClasses,
        colorVariantClasses[variant][color],
        sizeClasses[size],
        className
      )}
    >
      {children || label || value}
    </span>
  );
}; 