export type Stage =
  | 'welcome'
  | 'ingredient'
  | 'mixing'
  | 'baking'
  | 'cream'
  | 'spreading'
  | 'rolling'
  | 'score';

export interface Ingredient {
  id: string;
  name: string;
  emoji: string;
  unit: string;
  targetAmount: number;
  minAmount: number;
  maxAmount: number;
  color: string;
}

export interface StageScore {
  stage: Stage;
  score: number;
  maxScore: number;
  label: string;
}

export interface GameState {
  currentStage: Stage;
  stageScores: StageScore[];
  totalScore: number;
  ingredientAmounts: Record<string, number>;
}

export type GameAction =
  | { type: 'NEXT_STAGE' }
  | { type: 'SET_INGREDIENT'; id: string; amount: number }
  | { type: 'COMPLETE_STAGE'; stage: Stage; score: number }
  | { type: 'RESTART' };

export interface ScoreEntry {
  name: string;
  score: number;
  date: string;
}
