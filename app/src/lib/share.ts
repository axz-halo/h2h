import { APP_NAME } from '@/lib/constants';

interface ShareOptions {
  challengeId: string;
  questionText: string;
}

function buildUrl(challengeId: string): string {
  const origin = typeof window !== 'undefined' ? window.location.origin : '';
  return `${origin}/challenge/${challengeId}/nominate?from=invite`;
}

export async function shareChallenge({ challengeId, questionText }: ShareOptions): Promise<'shared' | 'copied' | 'failed'> {
  const url = buildUrl(challengeId);
  const text = `${APP_NAME} 💕\n"${questionText}"\n지금 참여해보세요!`;

  if (typeof navigator !== 'undefined' && navigator.share) {
    try {
      await navigator.share({ title: APP_NAME, text, url });
      return 'shared';
    } catch {
      // user cancelled or API error — fall through to clipboard
    }
  }

  try {
    await navigator.clipboard.writeText(`${text}\n${url}`);
    return 'copied';
  } catch {
    return 'failed';
  }
}
