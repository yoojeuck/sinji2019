import type { StageConfig, RhythmNoteData } from '../types/game';

function makeNotes(pattern: [number, number][], bpm: number, startDelay = 1800): RhythmNoteData[] {
  const beat = 60000 / bpm;
  return pattern.map(([lane, beatNum], id) => ({
    id,
    lane,
    beatTime: startDelay + beatNum * beat,
  }));
}

export const STAGE_CONFIGS: StageConfig[] = [
  {
    stageKey: 'ingredient',
    title: '🌾 재료 배합',
    description: '재료가 떨어질 때 맞춰 눌러요! (키보드: D F J K)',
    accentColor: '#ff6b9d',
    lanes: [
      { label: '밀가루', emoji: '🌾', color: '#f5e6c8', key: 'D' },
      { label: '달걀',   emoji: '🥚', color: '#ffd700', key: 'F' },
      { label: '설탕',   emoji: '🍬', color: '#c8f0d4', key: 'J' },
      { label: '우유',   emoji: '🥛', color: '#b3e5fc', key: 'K' },
    ],
    notes: makeNotes([
      [0,1],[1,2],[2,3],[3,4],
      [0,5],[2,5.5],[1,6],[3,6.5],
      [0,7],[1,8],[2,9],[3,10],
      [0,11],[1,11.5],[2,12],[3,12.5],
      [0,13],[3,13],[1,14],[2,14],
    ], 90),
  },
  {
    stageKey: 'mixing',
    title: '🥣 반죽',
    description: '좌우 교대로 박자에 맞춰 반죽하세요! (D / K)',
    accentColor: '#e040fb',
    lanes: [
      { label: '왼손', emoji: '👈', color: '#ce93d8', key: 'D' },
      { label: '오른손', emoji: '👉', color: '#b39ddb', key: 'K' },
    ],
    notes: makeNotes([
      [0,1],[1,2],[0,3],[1,4],
      [0,5],[1,6],[0,7],[1,8],
      [0,9],[0,9.5],[1,10],[1,10.5],
      [0,11],[1,12],[0,13],[1,14],
      [0,15],[1,15.5],[0,16],[1,16.5],
      [0,17],[1,17],[0,17.5],[1,17.5],
    ], 110),
  },
  {
    stageKey: 'baking',
    title: '🔥 굽기',
    description: '최적 타이밍에 정확하게! 느리지만 정밀도가 중요해요 (Space / D)',
    accentColor: '#ff9800',
    lanes: [
      { label: '온도 체크', emoji: '🌡️', color: '#ffcc80', key: 'D' },
      { label: '타이머',   emoji: '⏱️', color: '#ffab40', key: 'K' },
    ],
    notes: makeNotes([
      [0,2],[1,4],
      [0,6],[1,7],
      [0,8],[1,9],[0,10],
      [1,11],[0,12],[1,13],
      [0,14],[1,14.5],[0,15],[1,15.5],
      [0,16],[1,17],
    ], 72),
  },
  {
    stageKey: 'cream',
    title: '🍦 크림 휘핑',
    description: '빠르게! 리듬에 맞춰 연속으로 눌러요! (D F J K)',
    accentColor: '#fff176',
    lanes: [
      { label: '크림', emoji: '🍦', color: '#fffde7', key: 'D' },
      { label: '설탕', emoji: '🍬', color: '#fff9c4', key: 'F' },
      { label: '바닐라', emoji: '🌿', color: '#dcedc8', key: 'J' },
      { label: '휘핑', emoji: '💨', color: '#e1f5fe', key: 'K' },
    ],
    notes: makeNotes([
      [0,1],[1,1.5],[2,2],[3,2.5],
      [0,3],[1,3.5],[2,4],[3,4.5],
      [0,5],[1,5],[2,5.5],[3,5.5],
      [0,6],[1,6.5],[2,7],[3,7.5],
      [0,8],[3,8],[1,8.5],[2,8.5],
      [0,9],[1,9.5],[2,10],[3,10.5],
      [0,11],[1,11],[2,11.5],[3,11.5],
    ], 145),
  },
  {
    stageKey: 'spreading',
    title: '🎨 크림 바르기',
    description: '케이크 위에 크림을 골고루! (D F J K)',
    accentColor: '#69f0ae',
    lanes: [
      { label: '왼쪽',   emoji: '◀', color: '#a5d6a7', key: 'D' },
      { label: '중간왼', emoji: '▲', color: '#c8e6c9', key: 'F' },
      { label: '중간오', emoji: '▼', color: '#b2dfdb', key: 'J' },
      { label: '오른쪽', emoji: '▶', color: '#80cbc4', key: 'K' },
    ],
    notes: makeNotes([
      [0,1],[1,2],[2,3],[3,4],
      [1,5],[0,6],[3,7],[2,8],
      [0,9],[2,9.5],[1,10],[3,10.5],
      [0,11],[1,12],[2,13],[3,14],
      [0,15],[3,15],[1,16],[2,16],
      [0,17],[1,17.5],[2,18],[3,18.5],
    ], 100),
  },
  {
    stageKey: 'rolling',
    title: '🌀 케이크 말기',
    description: '클라이맥스! 점점 빨라져요. 끝까지 집중! (D / K)',
    accentColor: '#40c4ff',
    lanes: [
      { label: '안쪽', emoji: '↩', color: '#81d4fa', key: 'D' },
      { label: '바깥', emoji: '↪', color: '#4fc3f7', key: 'K' },
    ],
    notes: makeNotes([
      // 느린 시작
      [0,1],[1,2.5],[0,4],[1,5.5],
      // 조금 빠르게
      [0,7],[1,8],[0,9],[1,10],
      [0,11],[1,11.5],[0,12],[1,12.5],
      // 클라이맥스
      [0,13],[1,13.3],[0,13.6],[1,13.9],
      [0,14.2],[1,14.5],[0,14.8],[1,15.1],
      [0,15.4],[1,15.4],[0,15.7],[1,15.7],
      [0,16],[1,16],[0,16.2],[1,16.2],
    ], 120),
  },
];

export const STAGE_LABELS: Record<string, string> = {
  welcome: '시작',
  ingredient: '재료 배합',
  mixing: '반죽',
  baking: '굽기',
  cream: '크림 휘핑',
  spreading: '크림 바르기',
  rolling: '케이크 말기',
  score: '완성!',
};

export const STAGE_ORDER = [
  'welcome', 'ingredient', 'mixing', 'baking',
  'cream', 'spreading', 'rolling', 'score',
] as const;

export const PERFECT_MS = 65;
export const GOOD_MS = 130;
export const TRAVEL_MS = 1600;
