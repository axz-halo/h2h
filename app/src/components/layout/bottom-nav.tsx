'use client';

import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { Home, Archive, UserCircle } from 'lucide-react';
import { cn } from '@/lib/utils';

const tabs = [
  { href: '/home', label: '홈', icon: Home },
  { href: '/results', label: '보관함', icon: Archive },
  { href: '/mypage', label: '마이페이지', icon: UserCircle },
];

export function BottomNav() {
  const pathname = usePathname();

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 bg-white/90 backdrop-blur-lg border-t border-border">
      <div className="max-w-md mx-auto flex items-center justify-around h-16 px-2">
        {tabs.map(({ href, label, icon: Icon }) => {
          const isActive = pathname.startsWith(href);
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                'flex flex-col items-center justify-center gap-0.5 w-20 py-1 rounded-xl transition-colors cursor-pointer',
                isActive
                  ? 'text-primary'
                  : 'text-text-muted hover:text-text-secondary'
              )}
            >
              <Icon size={22} strokeWidth={isActive ? 2.5 : 1.8} />
              <span className={cn('text-[11px]', isActive ? 'font-bold' : 'font-medium')}>
                {label}
              </span>
            </Link>
          );
        })}
      </div>
      <div className="h-[env(safe-area-inset-bottom)]" />
    </nav>
  );
}
