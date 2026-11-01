'use client';

import React from 'react';

export type SliceFilterType = 'ALL' | 'eMBB' | 'URLLC' | 'mMTC';

interface SliceFilterBarProps {
  selected: SliceFilterType;
  onChange: (slice: SliceFilterType) => void;
  className?: string;
  size?: 'sm' | 'md';
}

const SLICE_OPTIONS: { id: SliceFilterType; label: string; badge?: string }[] = [
  { id: 'ALL', label: 'All Slices' },
  { id: 'eMBB', label: 'eMBB Video' },
  { id: 'URLLC', label: 'URLLC Transport' },
  { id: 'mMTC', label: 'mMTC IoT' },
];

export const SliceFilterBar: React.FC<SliceFilterBarProps> = ({
  selected,
  onChange,
  className = '',
  size = 'sm',
}) => {
  const isSm = size === 'sm';

  return (
    <div
      className={`inline-flex items-center gap-1 p-1 bg-slate-100 dark:bg-[#14161D] rounded-xl border border-slate-200 dark:border-[#2E3344] shrink-0 ${className}`}
    >
      {SLICE_OPTIONS.map((opt) => {
        const isActive = selected === opt.id;
        return (
          <button
            key={opt.id}
            type="button"
            onClick={() => onChange(opt.id)}
            className={`cursor-pointer whitespace-nowrap font-bold transition-all duration-200 rounded-[8px] flex items-center gap-1.5 ${
              isSm ? 'px-2.5 py-1 text-xs' : 'px-3 py-1.5 text-xs'
            } ${
              isActive
                ? 'bg-[#1A3C6F] text-white shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-white dark:hover:bg-[#222632]'
            }`}
          >
            <span>{opt.label}</span>
          </button>
        );
      })}
    </div>
  );
};

