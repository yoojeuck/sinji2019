export type Stage =
  | 'welcome'
  | 'ingredient'
  | 'mixing'
  | 'baking'
  | 'cream'
  | 'spreading'
  | 'rolling'
  | 'score';

export interface RhythmNoteData {
  id: number;
  lane: number;
  beatTime: number; // ms from stage start
}

export interface ActiveNote extends RhythmNoteData {
  status: 'pending' | 'hit-perfect' | 'hit-good' | 'miss';
}

export interface HitFeedback {
  type: 'perfect' | 'good' | 'miss';
  lane: number;
  id: number;
}

export interface LaneConfig {
  label: string;
  emoji: string;
  color: string;
  key: string;
}

export interface StageConfig {
  stageKey: Stage;
  title: string;
  description: string;
  lanes: LaneConfig[];
  notes: RhythmNoteData[];
  accentColor: string;
  bpm: number;
}

export interface StageScore {
  stage: Stage;
  label: string;
  score: number;
  perfect: number;
  good: number;
  miss: number;
}

export interface GameState {
  currentStage: Stage;
  stageScores: StageScore[];
  totalScore: number;
}

export interface ScoreEntry {
  name: string;
  score: number;
  date: string;
}

export type GameAction =
  | { type: 'COMPLETE_STAGE'; stage: Stage; score: number; perfect: number; good: number; miss: number }
  | { type: 'NEXT_STAGE' }
  | { type: 'RESTART' };
