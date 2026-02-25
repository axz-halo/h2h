export interface User {
  id: string;
  email: string;
  phone_number?: string;
  nickname: string;
  profile_image_url: string | null;
  school: string | null;
  challenge_create_remaining: number;
  fcm_token: string | null;
  status: 'active' | 'suspended' | 'deleted';
  created_at: string;
  updated_at: string;
}

export interface Contact {
  id: string;
  user_id: string;
  contact_phone_hash: string;
  matched_user_id: string | null;
  matched_user?: User;
  synced_at: string;
}

export type QuestionCategory = 'crush' | 'bestie' | 'tmi' | 'thanks' | 'whatif' | 'real';

export interface Question {
  id: string;
  category: QuestionCategory;
  question_text: string;
  is_active: boolean;
  usage_count: number;
  created_at: string;
}

export type ChallengeStatus = 'active' | 'expired' | 'result_delivered';

export interface Challenge {
  id: string;
  question_id: string;
  question?: Question;
  creator_id: string;
  creator?: User;
  status: ChallengeStatus;
  participant_count: number;
  /** 최대 참여자 수 (기본 30). v2.1 */
  max_participants?: number;
  created_at: string;
  expires_at: string;
}

/** 홈 카드용: 내 참여 순서(몇 번째로 참여 완료), 참여자 표시 문구(예: "서준 외 7명") */
export interface ChallengeWithMyStatus extends Challenge {
  my_status: 'my_turn' | 'completed' | 'waiting';
  /** host: 생성자(패스만 함), participant: 지목으로 참여. v2.1 */
  my_role?: 'host' | 'participant';
  /** 1-based. 지목 완료 시 "N번째로 참여 완료" 표시용 */
  my_participant_order?: number;
  /** "OOO 외 N명 참여" 형태 표시용 (첫 참여자 닉네임 또는 대표 이름) */
  participant_display?: string;
}

export type NominationStatus = 'pending' | 'completed' | 'expired';

export interface Nomination {
  id: string;
  challenge_id: string;
  challenge?: Challenge;
  nominator_id: string;
  nominator?: User;
  nominee_id: string;
  nominee?: User;
  is_mutual: boolean;
  chain_order: number;
  status: NominationStatus;
  created_at: string;
}

export interface Letter {
  id: string;
  challenge_id: string;
  challenge?: Challenge;
  nomination_id: string;
  sender_id: string;
  sender?: User;
  receiver_id: string;
  receiver?: User;
  content: string;
  is_revealed: boolean;
  is_reported: boolean;
  is_blinded: boolean;
  created_at: string;
}

export type PaymentProductType = 'reveal_one' | 'reveal_all';
export type PaymentStatus = 'pending' | 'completed' | 'refunded' | 'failed';

export interface Payment {
  id: string;
  user_id: string;
  letter_id: string | null;
  challenge_id: string;
  product_type: PaymentProductType;
  amount: number;
  store: 'web';
  store_transaction_id: string;
  status: PaymentStatus;
  created_at: string;
}

export interface Report {
  id: string;
  reporter_id: string;
  letter_id: string;
  reason: 'abuse' | 'spam' | 'harassment' | 'other';
  description: string | null;
  status: 'pending' | 'reviewed' | 'resolved';
  created_at: string;
}

export interface Friend {
  id: string;
  nickname: string;
  profile_image_url: string | null;
  is_app_user: boolean;
  phone_last4?: string;
}

export const CATEGORY_MAP: Record<QuestionCategory, {
  label: string;
  emoji: string;
  color: string;
  icon: string;
  gradient: string;
}> = {
  crush:  { label: '설렘',   emoji: '#설렘',   color: '#E11D48', icon: '💕', gradient: 'linear-gradient(135deg, #FFE4E6, #FECDD3)' },
  bestie: { label: '찐친',   emoji: '#찐친',   color: '#2563EB', icon: '👯', gradient: 'linear-gradient(135deg, #DBEAFE, #BFDBFE)' },
  tmi:    { label: 'TMI',    emoji: '#TMI',    color: '#7C3AED', icon: '🤔', gradient: 'linear-gradient(135deg, #EDE9FE, #DDD6FE)' },
  thanks: { label: '고마움', emoji: '#고마움', color: '#059669', icon: '🫶', gradient: 'linear-gradient(135deg, #D1FAE5, #A7F3D0)' },
  whatif: { label: '만약에', emoji: '#만약에', color: '#D97706', icon: '🌀', gradient: 'linear-gradient(135deg, #FEF3C7, #FDE68A)' },
  real:   { label: '솔직히', emoji: '#솔직히', color: '#DB2777', icon: '🔥', gradient: 'linear-gradient(135deg, #FCE7F3, #FBCFE8)' },
};
