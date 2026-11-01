'use client';

import React from 'react';
import { Trash2 } from 'lucide-react';

export const DELETE_ICON_BUTTON_CLASS =
  'p-2 rounded-xl bg-gray-200 dark:bg-gray-700 text-red-600 dark:text-red-400 hover:bg-red-500 hover:border-red-500 hover:text-white dark:hover:bg-red-500 dark:hover:border-red-500 dark:hover:text-white border border-gray-400 dark:border-gray-500 transition-all duration-200 cursor-pointer inline-flex items-center justify-center';

export interface DeleteIconButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  iconClassName?: string;
  title?: string;
}

export const DeleteIconButton: React.FC<DeleteIconButtonProps> = ({
  className = '',
  iconClassName = 'w-4 h-4',
  title = 'Delete Item',
  ...props
}) => {
  return (
    <button
      type="button"
      className={`${DELETE_ICON_BUTTON_CLASS} ${className}`}
      title={title}
      aria-label={title}
      {...props}
    >
      <Trash2 className={iconClassName} />
    </button>
  );
};

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger' | 'ghost' | 'outline';
  size?: 'sm' | 'md' | 'lg';
  icon?: React.ReactNode;
  iconPosition?: 'left' | 'right';
  loading?: boolean;
}

export const Button: React.FC<ButtonProps> = ({
  children,
  variant = 'primary',
  size = 'md',
  icon,
  iconPosition = 'left',
  loading = false,
  className = '',
  disabled,
  ...props
}) => {
  const sizeClasses = {
    sm: 'px-3 py-1.5 text-xs',
    md: 'px-3.5 py-2 text-xs font-bold',
    lg: 'px-5 py-2.5 text-sm font-bold',
  };

  const variantClasses = {
    primary:
      'bg-[#1A3C6F] hover:bg-[#179F99] text-white border border-[#153260] shadow-xs active:scale-[0.98]',
    secondary:
      'bg-theme-subtle hover:bg-theme-card text-theme-main border border-theme-card hover:border-slate-300 dark:hover:border-slate-600 active:scale-[0.98]',
    danger:
      'bg-rose-600 hover:bg-rose-700 text-white border border-rose-700 shadow-xs active:scale-[0.98]',
    ghost:
      'text-theme-muted hover:text-theme-main hover:bg-theme-subtle active:scale-[0.98]',
    outline:
      'border border-theme-card hover:border-[#1A3C6F] text-theme-main hover:text-[#1A3C6F] bg-transparent active:scale-[0.98]',
  };

  return (
    <button
      className={`rounded-xl transition-all duration-200 whitespace-nowrap inline-flex flex-row items-center justify-center gap-1.5 disabled:opacity-50 disabled:pointer-events-none cursor-pointer ${sizeClasses[size]} ${variantClasses[variant]} ${className}`}
      disabled={disabled || loading}
      {...props}
    >
      {loading && (
        <svg
          className="animate-spin -ml-0.5 h-3.5 w-3.5 text-current"
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
        >
          <circle
            className="opacity-25"
            cx="12"
            cy="12"
            r="10"
            stroke="currentColor"
            strokeWidth="4"
          />
          <path
            className="opacity-75"
            fill="currentColor"
            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
          />
        </svg>
      )}
      {!loading && icon && iconPosition === 'left' && <span className="shrink-0">{icon}</span>}
      {children}
      {!loading && icon && iconPosition === 'right' && <span className="shrink-0">{icon}</span>}
    </button>
  );
};
