'use client';

import { useRouter } from 'next/navigation';
import { ChevronLeft, Settings } from 'lucide-react';
import { cn } from '@/lib/utils';
import { APP_NAME } from '@/lib/constants';

interface AppBarProps {
  title?: string;
  showBack?: boolean;
  showSettings?: boolean;
  showLogo?: boolean;
  rightAction?: React.ReactNode;
  className?: string;
}

export function AppBar({
  title,
  showBack,
  showSettings,
  showLogo,
  rightAction,
  className,
}: AppBarProps) {
  const router = useRouter();

  return (
    <header
      className={cn(
        'sticky top-0 z-30 bg-bg/90 backdrop-blur-lg',
        className
      )}
    >
      <div className="max-w-md mx-auto flex items-center justify-between h-14 px-4">
        <div className="flex items-center gap-2 min-w-[40px]">
          {showBack && (
            <button
              onClick={() => router.back()}
              className="p-1 -ml-1 rounded-full hover:bg-surface transition-colors cursor-pointer"
            >
              <ChevronLeft size={24} className="text-text" />
            </button>
          )}
          {showLogo && (
            <h1 className="text-lg font-extrabold text-primary tracking-tight">
              {APP_NAME}
            </h1>
          )}
        </div>

        {title && (
          <h2 className="text-base font-bold text-text absolute left-1/2 -translate-x-1/2">
            {title}
          </h2>
        )}

        <div className="flex items-center gap-1 min-w-[40px] justify-end">
          {rightAction}
          {showSettings && (
            <button
              onClick={() => router.push('/mypage')}
              className="p-1.5 rounded-full hover:bg-surface transition-colors cursor-pointer"
            >
              <Settings size={20} className="text-text-secondary" />
            </button>
          )}
        </div>
      </div>
    </header>
  );
}
