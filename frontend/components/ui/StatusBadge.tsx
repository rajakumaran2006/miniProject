'use client';

import React from 'react';

export type StatusVariant =
  | 'active'
  | 'healthy'
  | 'normal'
  | 'enabled'
  | 'ready'
  | 'verified'
  | 'critical'
  | 'danger'
  | 'attack'
  | 'disabled'
  | 'resigned'
  | 'offline'
  | 'warning'
  | 'degraded'
  | 'suspicious'
  | 'elevated'
  | 'unverified'
  | 'brand'
  | 'primary'
  | 'admin'
  | 'teal'
  | 'secondary'
  | 'neutral';

export interface StatusBadgeProps {
  variant?: StatusVariant;
  children: React.ReactNode;
  icon?: React.ReactNode;
  className?: string;
  dot?: boolean;
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({
  variant = 'brand',
  children,
  icon,
  className = '',
  dot = false,
}) => {
  const variantStyles: Record<StatusVariant, string> = {
    active: 'bg-emerald-600 text-white border-emerald-700',
    healthy: 'bg-emerald-600 text-white border-emerald-700',
    normal: 'bg-emerald-600 text-white border-emerald-700',
    enabled: 'bg-emerald-600 text-white border-emerald-700',
    ready: 'bg-emerald-600 text-white border-emerald-700',
    verified: 'bg-emerald-600 text-white border-emerald-700',

    critical: 'bg-rose-600 text-white border-rose-700',
    danger: 'bg-rose-600 text-white border-rose-700',
    attack: 'bg-rose-600 text-white border-rose-700',
    disabled: 'bg-rose-600 text-white border-rose-700',
    resigned: 'bg-rose-600 text-white border-rose-700',
    offline: 'bg-rose-600 text-white border-rose-700',

    warning: 'bg-amber-600 text-white border-amber-700',
    degraded: 'bg-amber-600 text-white border-amber-700',
    suspicious: 'bg-amber-600 text-white border-amber-700',
    elevated: 'bg-amber-600 text-white border-amber-700',
    unverified: 'bg-amber-600 text-white border-amber-700',

    brand: 'bg-[#1A3C6F] text-white border-[#153260]',
    primary: 'bg-[#1A3C6F] text-white border-[#153260]',
    admin: 'bg-[#1A3C6F] text-white border-[#153260]',

    teal: 'bg-[#179F99] text-white border-[#148f8a]',
    secondary: 'bg-[#179F99] text-white border-[#148f8a]',

    neutral: 'bg-slate-700 text-white border-slate-800',
  };

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-[10px] text-xs font-bold border shadow-2xs whitespace-nowrap transition-all duration-200 ${variantStyles[variant]} ${className}`}
    >
      {dot && <span className="w-1.5 h-1.5 rounded-full bg-white shrink-0 animate-pulse" />}
      {icon && <span className="shrink-0">{icon}</span>}
      <span>{children}</span>
    </span>
  );
};
