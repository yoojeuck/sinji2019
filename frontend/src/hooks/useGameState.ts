import { useReducer } from 'react';
import type { GameState, GameAction, Stage } from '../types/game';
import { STAGE_LABELS, STAGE_ORDER } from '../data/recipes';

const initialState: GameState = {
  currentStage: 'welcome',
  stageScores: [],
  totalScore: 0,
  ingredientAmounts: {},
};

function gameReducer(state: GameState, action: GameAction): GameState {
  switch (action.type) {
    case 'NEXT_STAGE': {
      const idx = STAGE_ORDER.indexOf(state.currentStage as typeof STAGE_ORDER[number]);
      const next = STAGE_ORDER[Math.min(idx + 1, STAGE_ORDER.length - 1)] as Stage;
      return { ...state, currentStage: next };
    }
    case 'SET_INGREDIENT':
      return {
        ...state,
        ingredientAmounts: {
          ...state.ingredientAmounts,
          [action.id]: action.amount,
        },
      };
    case 'COMPLETE_STAGE': {
      const existing = state.stageScores.find((s) => s.stage === action.stage);
      const updated = existing
        ? state.stageScores.map((s) =>
            s.stage === action.stage ? { ...s, score: action.score } : s
          )
        : [
            ...state.stageScores,
            {
              stage: action.stage,
              score: action.score,
              maxScore: 100,
              label: STAGE_LABELS[action.stage] ?? action.stage,
            },
          ];
      const total = Math.round(
        updated.reduce((sum, s) => sum + s.score, 0) / updated.length
      );
      const idx = STAGE_ORDER.indexOf(action.stage as typeof STAGE_ORDER[number]);
      const next = STAGE_ORDER[Math.min(idx + 1, STAGE_ORDER.length - 1)] as Stage;
      return {
        ...state,
        stageScores: updated,
        totalScore: total,
        currentStage: next,
      };
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
