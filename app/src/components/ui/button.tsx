'use client';

import { cn } from '@/lib/utils';
import { type ButtonHTMLAttributes, forwardRef } from 'react';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  fullWidth?: boolean;
  loading?: boolean;
}

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'primary', size = 'md', fullWidth, loading, disabled, children, ...props }, ref) => {
    return (
      <button
        ref={ref}
        disabled={disabled || loading}
        className={cn(
          'relative inline-flex items-center justify-center font-semibold transition-all duration-200 cursor-pointer select-none',
          'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary',
          'disabled:opacity-40 disabled:cursor-not-allowed',
          'active:scale-[0.97]',
          {
            'bg-primary text-white hover:bg-primary-dark shadow-sm': variant === 'primary',
            'bg-surface text-primary border border-primary/20 hover:bg-surface-hover': variant === 'secondary',
            'bg-transparent text-text-secondary hover:bg-surface': variant === 'ghost',
            'bg-error text-white hover:opacity-90': variant === 'danger',
          },
          {
            'h-9 px-4 text-sm rounded-[10px]': size === 'sm',
            'h-12 px-6 text-base rounded-[14px]': size === 'md',
            'h-14 px-8 text-lg rounded-[16px]': size === 'lg',
          },
          fullWidth && 'w-full',
          className
        )}
        {...props}
      >
        {loading ? (
          <span className="flex items-center gap-2">
            <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
            </svg>
            {children}
          </span>
        ) : (
          children
        )}
      </button>
    );
  }
);

Button.displayName = 'Button';
export { Button };
