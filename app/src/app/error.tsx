'use client';

import { useEffect } from 'react';
import { Button } from '@/components/ui/button';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="flex flex-col items-center justify-center min-h-[50vh] px-6 text-center">
      <p className="text-base font-medium text-text mb-2">
        네트워크 연결을 확인해주세요.
      </p>
      <p className="text-sm text-text-muted mb-6">
        일시적인 오류가 발생했을 수 있어요.
      </p>
      <Button onClick={reset}>다시 시도</Button>
    </div>
  );
}
