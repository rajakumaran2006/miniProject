'use client';

import React from 'react';
import { ArrowRight, ChevronDown } from 'lucide-react';

export interface OverviewStatsCardProps {
  title: string;
  subtitle: string;
  actionLabel?: string;
  actionIcon?: 'arrow' | 'chevron' | React.ReactNode;
  onActionClick?: () => void;
  graphicSvg?: React.ReactNode;
  statusBadge?: React.ReactNode;
  className?: string;
}

export const OverviewStatsCard: React.FC<OverviewStatsCardProps> = ({
  title,
  subtitle,
  actionLabel = 'Explore',
  actionIcon = 'arrow',
  onActionClick,
  graphicSvg,
  statusBadge,
  className = '',
}) => {
  return (
    <div
      className={`bg-white dark:bg-[#1A1D26] rounded-2xl p-4 sm:p-5 border border-[#EFEFEF] dark:border-[#2E3344] shadow-xs flex flex-col justify-between relative overflow-hidden transition-all duration-200 hover:shadow-md min-h-[135px] group ${className}`}
    >
      {/* Top Section (Title & Status Count) */}
      <div>
        <div className="flex items-start justify-between gap-2">
          <h3 className="text-base font-bold text-[#111111] dark:text-[#F3F4F6] tracking-tight leading-snug">
            {title}
          </h3>
          {statusBadge && <div className="shrink-0">{statusBadge}</div>}
        </div>
        <p className="text-xs font-normal text-[#6B7280] dark:text-[#9CA3AF] mt-0.5">
          {subtitle}
        </p>
      </div>

      {/* Bottom Section (Line-Art Graphic & Action Pill) */}
      <div className="flex items-end justify-between pt-4 mt-auto">
        {/* Left Graphic: Minimalist line-art SVG icon */}
        <div className="w-12 h-14 flex items-center justify-start text-[#1A3C6F]/30 dark:text-[#179F99]/40 transition-transform duration-300 group-hover:scale-105 origin-bottom-left">
          {graphicSvg ? (
            graphicSvg
          ) : (
            <svg
              className="w-12 h-12 stroke-current fill-none stroke-[1.4]"
              viewBox="0 0 48 48"
              xmlns="http://www.w3.org/2000/svg"
            >
              <rect x="6" y="8" width="36" height="32" rx="6" />
              <line x1="6" y1="20" x2="42" y2="20" />
              <circle cx="14" cy="14" r="2" fill="currentColor" />
              <circle cx="22" cy="14" r="2" fill="currentColor" />
              <path d="M14 28h12M14 34h20" strokeLinecap="round" />
            </svg>
          )}
        </div>

        {/* Right Action Button: Solid brand pill button */}
        {actionLabel && (
          <button
            type="button"
            onClick={onActionClick}
            className="bg-[#1A3C6F] hover:bg-[#179F99] text-white rounded-[10px] px-3 py-1.5 text-xs font-semibold inline-flex items-center gap-1.5 shadow-2xs whitespace-nowrap transition-all duration-200 cursor-pointer"
          >
            <span>{actionLabel}</span>
            {actionIcon === 'arrow' ? (
              <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
            ) : actionIcon === 'chevron' ? (
              <ChevronDown className="w-3.5 h-3.5" />
            ) : (
              actionIcon
            )}
          </button>
        )}
      </div>
    </div>
  );
};
