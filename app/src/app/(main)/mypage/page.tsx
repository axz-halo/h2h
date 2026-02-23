'use client';

import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import {
  User,
  Bell,
  FileText,
  HelpCircle,
  Shield,
  Mail,
  LogOut,
  UserX,
  ChevronRight,
  MessageCircle,
} from 'lucide-react';
import { AppBar } from '@/components/layout/app-bar';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { useAuthStore } from '@/stores/auth-store';
import { MOCK_USER } from '@/lib/mock-data';

const MENU_ITEMS = [
  { icon: Bell, label: '알림 설정' },
  { icon: FileText, label: '공지사항' },
  { icon: HelpCircle, label: '자주 묻는 질문' },
  { icon: Shield, label: '이용약관' },
  { icon: Shield, label: '개인정보처리방침' },
  { icon: MessageCircle, label: '문의하기' },
] as const;

export default function MyPage() {
  const router = useRouter();
  const user = useAuthStore((s) => s.user) ?? MOCK_USER;

  return (
    <div className="min-h-dvh bg-bg">
      <AppBar title="마이페이지" />

      <div className="px-5 pt-4 pb-10 flex flex-col gap-6">
        {/* Profile */}
        <motion.div
          className="flex flex-col items-center gap-3 pt-2"
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35 }}
        >
          <div className="w-20 h-20 rounded-full bg-surface flex items-center justify-center">
            {user.profile_image_url ? (
              <img
                src={user.profile_image_url}
                alt={user.nickname}
                className="w-full h-full rounded-full object-cover"
              />
            ) : (
              <User size={32} className="text-text-muted" />
            )}
          </div>
          <div className="text-center">
            <p className="text-lg font-bold text-text">{user.nickname}</p>
            {user.email && (
              <p className="text-sm text-text-muted mt-0.5">{user.email}</p>
            )}
            {user.school && (
              <p className="text-sm text-text-secondary mt-0.5">{user.school}</p>
            )}
          </div>
          <Button variant="secondary" size="sm" onClick={() => router.push('/profile')}>
            프로필 수정
          </Button>
        </motion.div>

        {/* Stats */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.08, duration: 0.35 }}
        >
          <Card className="p-4">
            <div className="grid grid-cols-3 divide-x divide-border-strong">
              {[
                { label: '참여한 챌린지', value: '3개' },
                { label: '받은 편지', value: '2통' },
                { label: '보낸 편지', value: '1통' },
              ].map((stat) => (
                <div key={stat.label} className="flex flex-col items-center gap-1 px-2">
                  <span className="text-lg font-bold text-primary">{stat.value}</span>
                  <span className="text-xs text-text-secondary">{stat.label}</span>
                </div>
              ))}
            </div>
          </Card>
        </motion.div>

        {/* Menu */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.16, duration: 0.35 }}
        >
          <Card className="overflow-hidden">
            {MENU_ITEMS.map((item, i) => (
              <button
                key={item.label}
                className={`w-full flex items-center gap-3 px-5 py-3.5 hover:bg-surface-hover transition-colors cursor-pointer ${
                  i !== 0 ? 'border-t border-border' : ''
                }`}
              >
                <item.icon size={18} className="text-text-secondary flex-shrink-0" />
                <span className="text-[15px] text-text flex-1 text-left">{item.label}</span>
                <ChevronRight size={16} className="text-text-muted" />
              </button>
            ))}

            <div className="border-t-4 border-border" />

            <button className="w-full flex items-center gap-3 px-5 py-3.5 hover:bg-surface-hover transition-colors cursor-pointer">
              <LogOut size={18} className="text-error flex-shrink-0" />
              <span className="text-[15px] text-error flex-1 text-left">로그아웃</span>
              <ChevronRight size={16} className="text-text-muted" />
            </button>

            <button className="w-full flex items-center gap-3 px-5 py-3.5 hover:bg-surface-hover transition-colors border-t border-border cursor-pointer">
              <UserX size={18} className="text-text-muted flex-shrink-0" />
              <span className="text-[13px] text-text-muted flex-1 text-left">회원탈퇴</span>
              <ChevronRight size={16} className="text-text-muted" />
            </button>
          </Card>
        </motion.div>

        {/* App version */}
        <p className="text-xs text-text-muted text-center pt-2">v1.0.0</p>
      </div>
    </div>
  );
}
