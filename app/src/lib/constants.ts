export const APP_NAME = 'Heart to Hearts';
export const APP_DESCRIPTION = '마음을 전하는 가장 솔직한 방법';

export const CHALLENGE_DURATION_HOURS = 48;
/** 하나의 챌린지에 참여할 수 있는 최대 인원. 30명 도달 시 즉시 종료·결과 공개 */
export const MAX_CHALLENGE_PARTICIPANTS = 30;
/** 30명 도달 시 사용자에게 보여줄 메시지 */
export const CHALLENGE_FULL_MESSAGE = '이번 챌린지는 30명이 모두 참여하여 종료되었습니다.';
export const MAX_CHALLENGE_CREATE = 3;
export const LETTER_MIN_LENGTH = 10;
export const LETTER_MAX_LENGTH = 500;
export const NICKNAME_MIN_LENGTH = 2;
export const NICKNAME_MAX_LENGTH = 8;

export const PRICE_REVEAL_ONE = 1052;
export const PRICE_REVEAL_ALL = 5260;

export const OTP_LENGTH = 6;
export const OTP_EXPIRE_SECONDS = 180;
export const OTP_RESEND_COOLDOWN = 60;

export const ROUTES = {
  SPLASH: '/',
  ONBOARDING: '/onboarding',
  PERMISSIONS: '/permissions',
  LOGIN: '/login',
  AUTH_CALLBACK: '/auth/callback',
  PROFILE_SETUP: '/profile',
  HOME: '/home',
  RESULTS: '/results',
  MYPAGE: '/mypage',
  CHALLENGE_NEW: '/challenge/new',
  /** Host 전용: 질문을 넘길 1명 선택 (패스) */
  CHALLENGE_INVITE: '/challenge/new/invite',
  CHALLENGE_NOMINATE: (id: string) => `/challenge/${id}/nominate`,
  CHALLENGE_CONFIRM: (id: string) => `/challenge/${id}/confirm`,
  CHALLENGE_MUTUAL: (id: string) => `/challenge/${id}/mutual`,
  CHALLENGE_LETTER: (id: string) => `/challenge/${id}/letter`,
  RESULT_DETAIL: (id: string) => `/results/${id}`,
} as const;
