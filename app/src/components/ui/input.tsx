'use client';

import { cn } from '@/lib/utils';
import { type InputHTMLAttributes, forwardRef } from 'react';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  hint?: string;
}

const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className, label, error, hint, ...props }, ref) => {
    return (
      <div className="flex flex-col gap-1.5">
        {label && (
          <label className="text-sm font-medium text-text">
            {label}
          </label>
        )}
        <input
          ref={ref}
          className={cn(
            'h-12 px-4 rounded-[14px] bg-white text-base text-text placeholder:text-text-muted',
            'border transition-colors duration-200',
            error
              ? 'border-error focus:border-error'
              : 'border-border-strong focus:border-primary',
            'focus:ring-2 focus:ring-primary/10',
            className
          )}
          {...props}
        />
        {error && <p className="text-sm text-error">{error}</p>}
        {hint && !error && <p className="text-sm text-text-muted">{hint}</p>}
      </div>
    );
  }
);

Input.displayName = 'Input';
export { Input };
