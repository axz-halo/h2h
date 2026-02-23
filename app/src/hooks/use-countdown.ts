'use client';

import { useState, useEffect, useCallback } from 'react';
import { formatTimeRemaining } from '@/lib/utils';

export function useCountdown(expiresAt: string) {
  const [timeLeft, setTimeLeft] = useState(() => formatTimeRemaining(expiresAt));
  const [isExpired, setIsExpired] = useState(false);

  useEffect(() => {
    const update = () => {
      const now = Date.now();
      const expiry = new Date(expiresAt).getTime();
      if (now >= expiry) {
        setTimeLeft('종료됨');
        setIsExpired(true);
        return false;
      }
      setTimeLeft(formatTimeRemaining(expiresAt));
      return true;
    };

    if (!update()) return;
    const interval = setInterval(() => {
      if (!update()) clearInterval(interval);
    }, 1000);

    return () => clearInterval(interval);
  }, [expiresAt]);

  return { timeLeft, isExpired };
}

export function useOtpTimer(initialSeconds: number) {
  const [seconds, setSeconds] = useState(initialSeconds);
  const [isActive, setIsActive] = useState(false);

  useEffect(() => {
    if (!isActive || seconds <= 0) return;
    const interval = setInterval(() => {
      setSeconds((s) => {
        if (s <= 1) {
          setIsActive(false);
          return 0;
        }
        return s - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [isActive, seconds]);

  const start = useCallback(() => {
    setSeconds(initialSeconds);
    setIsActive(true);
  }, [initialSeconds]);

  const formatted = `${Math.floor(seconds / 60)}:${String(seconds % 60).padStart(2, '0')}`;

  return { seconds, formatted, isActive, isExpired: seconds <= 0, start };
}
