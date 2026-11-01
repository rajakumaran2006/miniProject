'use client';

import React, { useEffect } from 'react';
import { X } from 'lucide-react';

export interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  description?: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
  maxWidth?: 'sm' | 'md' | 'lg' | 'xl' | '2xl' | '4xl';
}

export const Modal: React.FC<ModalProps> = ({
  isOpen,
  onClose,
  title,
  description,
  children,
  footer,
  maxWidth = '2xl',
}) => {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    if (isOpen) {
      window.addEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'hidden';
    }
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const maxWidthClasses = {
    sm: 'max-w-sm',
    md: 'max-w-md',
    lg: 'max-w-lg',
    xl: 'max-w-xl',
    '2xl': 'max-w-2xl',
    '4xl': 'max-w-4xl',
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div
        className="fixed inset-0"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Bounded Modal Container */}
      <div
        className={`bg-white dark:bg-[#1A1D26] w-full ${maxWidthClasses[maxWidth]} max-h-[88vh] sm:max-h-[90vh] flex flex-col overflow-hidden rounded-2xl sm:rounded-3xl border border-[#EFEFEF] dark:border-[#2E3344] shadow-2xl relative z-10`}
        role="dialog"
        aria-modal="true"
      >
        {/* Pinned Header */}
        <div className="shrink-0 border-b border-[#EFEFEF] dark:border-[#2E3344] p-4 sm:p-5 flex items-center justify-between bg-white dark:bg-[#1A1D26]">
          <div>
            <h2 className="text-lg font-bold text-[#111111] dark:text-[#F3F4F6] tracking-tight leading-snug">
              {title}
            </h2>
            {description && (
              <p className="text-xs text-[#6B7280] dark:text-[#9CA3AF] mt-0.5">
                {description}
              </p>
            )}
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-xl text-[#6B7280] hover:text-[#111111] dark:text-[#9CA3AF] dark:hover:text-white hover:bg-[#F5F5F7] dark:hover:bg-[#222632] transition-colors"
            aria-label="Close dialog"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Inner Body Only */}
        <div className="flex-1 min-h-0 overflow-y-auto p-4 sm:p-6 custom-scrollbar text-[#111111] dark:text-[#F3F4F6]">
          {children}
        </div>

        {/* Pinned Bottom Footer */}
        {footer && (
          <div className="shrink-0 border-t border-[#EFEFEF] dark:border-[#2E3344] p-4 sm:px-6 bg-[#F5F5F7] dark:bg-[#14161D] flex items-center justify-end gap-2.5">
            {footer}
          </div>
        )}
      </div>
    </div>
  );
};
