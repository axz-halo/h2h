-- Seed question data for Heart to Hearts
-- Categories: romance, friendship, curiosity, gratitude

insert into public.questions (category, question_text) values
  -- #설렘 (Romance)
  ('romance', '솔직히 요즘 제일 신경 쓰이는 사람은?'),
  ('romance', '만약 단둘이 여행을 간다면 같이 가고 싶은 사람은?'),
  ('romance', '눈이 마주치면 괜히 심장이 뛰는 사람은?'),
  ('romance', '요즘 SNS를 가장 자주 들여다보게 되는 사람은?'),
  ('romance', '같이 야경 보러 가고 싶은 사람은?'),
  ('romance', '문자가 오면 제일 빨리 확인하게 되는 사람은?'),

  -- #우정 (Friendship)
  ('friendship', '힘들 때 가장 먼저 연락하고 싶은 친구는?'),
  ('friendship', '평생 옆에 있어줬으면 하는 친구는?'),
  ('friendship', '같이 있으면 시간이 제일 빨리 가는 친구는?'),
  ('friendship', '비밀을 가장 안심하고 털어놓을 수 있는 친구는?'),
  ('friendship', '새벽에 갑자기 전화해도 받아줄 것 같은 친구는?'),
  ('friendship', '10년 뒤에도 변함없이 곁에 있을 것 같은 친구는?'),

  -- #궁금 (Curiosity)
  ('curiosity', '첫인상과 지금 인상이 가장 다른 사람은?'),
  ('curiosity', '10년 뒤에 가장 성공해 있을 것 같은 사람은?'),
  ('curiosity', '비밀이 가장 많을 것 같은 사람은?'),
  ('curiosity', '의외로 반전 매력이 있는 사람은?'),
  ('curiosity', '가장 독특한 취미를 가지고 있을 것 같은 사람은?'),
  ('curiosity', '무인도에 한 명만 데려갈 수 있다면 누구를 데려갈래?'),

  -- #감사 (Gratitude)
  ('gratitude', '올해 가장 고마웠던 사람은?'),
  ('gratitude', '나를 가장 잘 이해해주는 사람은?'),
  ('gratitude', '덕분에 웃을 수 있었던 사람은?'),
  ('gratitude', '묵묵히 내 편이 되어준 사람은?'),
  ('gratitude', '힘든 시간을 함께 버텨준 사람은?');
