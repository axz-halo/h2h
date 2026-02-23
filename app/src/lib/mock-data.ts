import type { Question, Challenge, ChallengeWithMyStatus, User, Friend, Letter, Nomination } from '@/types';

export const MOCK_USER: User = {
  id: 'user-1',
  email: 'hello@example.com',
  nickname: '하늘',
  profile_image_url: null,
  school: '서울고등학교',
  challenge_create_remaining: 2,
  fcm_token: null,
  status: 'active',
  created_at: '2026-02-20T10:00:00Z',
  updated_at: '2026-02-20T10:00:00Z',
};

export const MOCK_QUESTIONS: Question[] = [
  { id: 'q1', category: 'romance', question_text: '솔직히 요즘 제일 신경 쓰이는 사람은?', is_active: true, usage_count: 342, created_at: '2026-01-01T00:00:00Z' },
  { id: 'q2', category: 'romance', question_text: '만약 단둘이 여행을 간다면 같이 가고 싶은 사람은?', is_active: true, usage_count: 289, created_at: '2026-01-01T00:00:00Z' },
  { id: 'q3', category: 'romance', question_text: '눈이 마주치면 괜히 심장이 뛰는 사람은?', is_active: true, usage_count: 412, created_at: '2026-01-01T00:00:00Z' },
  { id: 'q4', category: 'friendship', question_text: '힘들 때 가장 먼저 연락하고 싶은 친구는?', is_active: true, usage_count: 567, created_at: '2026-01-01T00:00:00Z' },
  { id: 'q5', category: 'friendship', question_text: '평생 옆에 있어줬으면 하는 친구는?', is_active: true, usage_count: 445, created_at: '2026-01-01T00:00:00Z' },
  { id: 'q6', category: 'friendship', question_text: '같이 있으면 시간이 제일 빨리 가는 친구는?', is_active: true, usage_count: 321, created_at: '2026-01-01T00:00:00Z' },
  { id: 'q7', category: 'curiosity', question_text: '첫인상과 지금 인상이 가장 다른 사람은?', is_active: true, usage_count: 198, created_at: '2026-01-01T00:00:00Z' },
  { id: 'q8', category: 'curiosity', question_text: '10년 뒤에 가장 성공해 있을 것 같은 사람은?', is_active: true, usage_count: 276, created_at: '2026-01-01T00:00:00Z' },
  { id: 'q9', category: 'curiosity', question_text: '비밀이 가장 많을 것 같은 사람은?', is_active: true, usage_count: 354, created_at: '2026-01-01T00:00:00Z' },
  { id: 'q10', category: 'gratitude', question_text: '올해 가장 고마웠던 사람은?', is_active: true, usage_count: 489, created_at: '2026-01-01T00:00:00Z' },
  { id: 'q11', category: 'gratitude', question_text: '나를 가장 잘 이해해주는 사람은?', is_active: true, usage_count: 378, created_at: '2026-01-01T00:00:00Z' },
];

const futureDate = new Date(Date.now() + 36 * 60 * 60 * 1000).toISOString();
const pastDate = new Date(Date.now() - 50 * 60 * 60 * 1000).toISOString();

export const MOCK_CHALLENGES: ChallengeWithMyStatus[] = [
  {
    id: 'ch-1',
    question_id: 'q1',
    question: MOCK_QUESTIONS[0],
    creator_id: 'user-1',
    status: 'active',
    participant_count: 8,
    created_at: new Date(Date.now() - 12 * 60 * 60 * 1000).toISOString(),
    expires_at: futureDate,
    my_status: 'completed',
    my_participant_order: 3,
    participant_display: '서준 외 7명',
  },
  {
    id: 'ch-2',
    question_id: 'q4',
    question: MOCK_QUESTIONS[3],
    creator_id: 'user-3',
    status: 'active',
    participant_count: 5,
    created_at: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString(),
    expires_at: new Date(Date.now() + 42 * 60 * 60 * 1000).toISOString(),
    my_status: 'my_turn',
    participant_display: '민서 외 4명',
  },
  {
    id: 'ch-3',
    question_id: 'q7',
    question: MOCK_QUESTIONS[6],
    creator_id: 'user-1',
    status: 'result_delivered',
    participant_count: 12,
    created_at: new Date(Date.now() - 72 * 60 * 60 * 1000).toISOString(),
    expires_at: pastDate,
    my_status: 'completed',
    my_participant_order: 5,
    participant_display: '지우 외 11명',
  },
];

/** Per-challenge participant user IDs (already in chain); used to show "이미 참여 중" and disable selection */
export const MOCK_CHALLENGE_PARTICIPANT_IDS: Record<string, string[]> = {
  'ch-1': ['user-1', 'user-2', 'user-4', 'user-5', 'user-8'],
  'ch-2': ['user-3', 'user-1'],
  'ch-3': ['user-1', 'user-2', 'user-3', 'user-5', 'user-8'],
};

export const MOCK_FRIENDS: Friend[] = [
  { id: 'user-2', nickname: '서준', profile_image_url: null, is_app_user: true },
  { id: 'user-3', nickname: '민서', profile_image_url: null, is_app_user: true },
  { id: 'user-4', nickname: '지우', profile_image_url: null, is_app_user: true },
  { id: 'user-5', nickname: '수빈', profile_image_url: null, is_app_user: true },
  { id: 'user-6', nickname: '예린', profile_image_url: null, is_app_user: false, phone_last4: '1234' },
  { id: 'user-7', nickname: '도윤', profile_image_url: null, is_app_user: false, phone_last4: '5678' },
  { id: 'user-8', nickname: '하은', profile_image_url: null, is_app_user: true },
  { id: 'user-9', nickname: '시우', profile_image_url: null, is_app_user: false, phone_last4: '9012' },
  { id: 'user-10', nickname: '윤아', profile_image_url: null, is_app_user: true },
  { id: 'user-11', nickname: '준혁', profile_image_url: null, is_app_user: true },
];

export const MOCK_LETTERS: (Letter & { challenge_question?: string })[] = [
  {
    id: 'letter-1',
    challenge_id: 'ch-3',
    nomination_id: 'nom-5',
    sender_id: 'user-3',
    receiver_id: 'user-1',
    content: '네가 옆에 있어주는 것만으로도 힘이 돼. 항상 고맙고, 앞으로도 지금처럼 좋은 사이로 지내자. 힘들 때 항상 먼저 연락해주는 너의 따뜻한 마음을 잊지 못할 거야.',
    is_revealed: false,
    is_reported: false,
    is_blinded: false,
    created_at: new Date(Date.now() - 50 * 60 * 60 * 1000).toISOString(),
    challenge_question: '첫인상과 지금 인상이 가장 다른 사람은?',
  },
  {
    id: 'letter-2',
    challenge_id: 'ch-3',
    nomination_id: 'nom-8',
    sender_id: 'user-5',
    receiver_id: 'user-1',
    content: '처음 만났을 때는 조용한 사람인 줄 알았는데 알고 보니 누구보다 유쾌하고 따뜻한 사람이더라. 그 반전이 좋아서 더 친해지고 싶었어.',
    is_revealed: true,
    is_reported: false,
    is_blinded: false,
    created_at: new Date(Date.now() - 49 * 60 * 60 * 1000).toISOString(),
    challenge_question: '첫인상과 지금 인상이 가장 다른 사람은?',
    sender: { id: 'user-5', nickname: '수빈', profile_image_url: null } as User,
  },
];
