import type { Ingredient } from '../types/game';

export const PLAIN_CREAM_INGREDIENTS: Ingredient[] = [
  {
    id: 'flour',
    name: '밀가루',
    emoji: '🌾',
    unit: 'g',
    targetAmount: 100,
    minAmount: 85,
    maxAmount: 115,
    color: '#f5e6c8',
  },
  {
    id: 'egg',
    name: '달걀',
    emoji: '🥚',
    unit: '개',
    targetAmount: 3,
    minAmount: 2,
    maxAmount: 4,
    color: '#ffd700',
  },
  {
    id: 'sugar',
    name: '설탕',
    emoji: '🍬',
    unit: 'g',
    targetAmount: 80,
    minAmount: 65,
    maxAmount: 95,
    color: '#fff9c4',
  },
  {
    id: 'milk',
    name: '우유',
    emoji: '🥛',
    unit: 'ml',
    targetAmount: 50,
    minAmount: 40,
    maxAmount: 60,
    color: '#e3f2fd',
  },
  {
    id: 'butter',
    name: '버터',
    emoji: '🧈',
    unit: 'g',
    targetAmount: 30,
    minAmount: 22,
    maxAmount: 38,
    color: '#ffe082',
  },
];

export const CREAM_INGREDIENTS: Ingredient[] = [
  {
    id: 'heavy_cream',
    name: '생크림',
    emoji: '🍦',
    unit: 'ml',
    targetAmount: 200,
    minAmount: 180,
    maxAmount: 220,
    color: '#f8f9fa',
  },
  {
    id: 'cream_sugar',
    name: '설탕',
    emoji: '🍬',
    unit: 'g',
    targetAmount: 20,
    minAmount: 15,
    maxAmount: 25,
    color: '#fff9c4',
  },
];

export const STAGE_LABELS: Record<string, string> = {
  welcome: '시작',
  ingredient: '재료 준비',
  mixing: '반죽',
  baking: '굽기',
  cream: '크림 만들기',
  spreading: '크림 바르기',
  rolling: '케이크 말기',
  score: '완성!',
};

export const STAGE_ORDER = [
  'welcome',
  'ingredient',
  'mixing',
  'baking',
  'cream',
  'spreading',
  'rolling',
  'score',
] as const;

export const OPTIMAL_TEMP = { min: 170, max: 180 };
export const MIXING_TARGET_CLICKS = 30;
export const CREAM_TARGET_CLICKS = 40;
export const SPREADING_ZONES = 12;
export const ROLLING_TARGET_SUCCESS = 3;
