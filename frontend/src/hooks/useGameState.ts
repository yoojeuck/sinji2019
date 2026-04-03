import { useReducer } from 'react';
import type { GameState, GameAction, Stage } from '../types/game';
import { STAGE_LABELS, STAGE_ORDER } from '../data/stageConfigs';

const initialState: GameState = {
  currentStage: 'welcome',
  stageScores: [],
  totalScore: 0,
};

function gameReducer(state: GameState, action: GameAction): GameState {
  switch (action.type) {
    case 'NEXT_STAGE': {
      const idx = STAGE_ORDER.indexOf(state.currentStage as typeof STAGE_ORDER[number]);
      const next = STAGE_ORDER[Math.min(idx + 1, STAGE_ORDER.length - 1)] as Stage;
      return { ...state, currentStage: next };
    }
    case 'COMPLETE_STAGE': {
      const newScore = {
        stage: action.stage,
        label: STAGE_LABELS[action.stage] ?? action.stage,
        score: action.score,
        perfect: action.perfect,
        good: action.good,
        miss: action.miss,
      };
      const updated = [
        ...state.stageScores.filter(s => s.stage !== action.stage),
        newScore,
      ];
      const total = Math.round(updated.reduce((sum, s) => sum + s.score, 0) / updated.length);
      const idx = STAGE_ORDER.indexOf(action.stage as typeof STAGE_ORDER[number]);
      const next = STAGE_ORDER[Math.min(idx + 1, STAGE_ORDER.length - 1)] as Stage;
      return { ...state, stageScores: updated, totalScore: total, currentStage: next };
    }
    case 'RESTART':
      return { ...initialState };
    default:
      return state;
  }
}

export function useGameState() {
  const [state, dispatch] = useReducer(gameReducer, initialState);
  return { state, dispatch };
}
