'use client';

import { cn } from '@/lib/utils';
import { type HTMLAttributes, forwardRef } from 'react';

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'outlined' | 'elevated';
  interactive?: boolean;
}

const Card = forwardRef<HTMLDivElement, CardProps>(
  ({ className, variant = 'default', interactive, children, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(
          'rounded-[16px] transition-all duration-200',
          {
            'bg-white shadow-[var(--shadow-sm)]': variant === 'default',
            'bg-white border border-border-strong': variant === 'outlined',
            'bg-white shadow-[var(--shadow-md)]': variant === 'elevated',
          },
          interactive && 'cursor-pointer hover:shadow-[var(--shadow-md)] active:scale-[0.98]',
          className
        )}
        {...props}
      >
        {children}
      </div>
    );
  }
);

Card.displayName = 'Card';
export { Card };
