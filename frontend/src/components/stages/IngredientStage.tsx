import { useState } from 'react';
import type { GameAction } from '../../types/game';
import { PLAIN_CREAM_INGREDIENTS } from '../../data/recipes';

interface Props {
  dispatch: React.Dispatch<GameAction>;
}

export default function IngredientStage({ dispatch }: Props) {
  const [amounts, setAmounts] = useState<Record<string, number>>(() =>
    Object.fromEntries(PLAIN_CREAM_INGREDIENTS.map((i) => [i.id, i.targetAmount]))
  );
  const [submitted, setSubmitted] = useState(false);

  const getStatus = (id: string) => {
    const ing = PLAIN_CREAM_INGREDIENTS.find((i) => i.id === id)!;
    const v = amounts[id];
    if (v >= ing.minAmount && v <= ing.maxAmount) return 'good';
    if (v < ing.minAmount) return 'low';
    return 'high';
  };

  const calcScore = () => {
    let score = 0;
    for (const ing of PLAIN_CREAM_INGREDIENTS) {
      if (getStatus(ing.id) === 'good') score += 20;
    }
    return score;
  };

  const handleSubmit = () => {
    setSubmitted(true);
    const score = calcScore();
    setTimeout(() => {
      for (const ing of PLAIN_CREAM_INGREDIENTS) {
        dispatch({ type: 'SET_INGREDIENT', id: ing.id, amount: amounts[ing.id] });
      }
      dispatch({ type: 'COMPLETE_STAGE', stage: 'ingredient', score });
    }, 1400);
  };

  return (
    <div className="stage-container">
      <h2 className="stage-title">🌾 재료 준비</h2>
      <p className="stage-desc">슬라이더를 조절해 알맞은 양의 재료를 계량하세요!</p>

      <div className="ingredient-list">
        {PLAIN_CREAM_INGREDIENTS.map((ing) => {
          const status = getStatus(ing.id);
          return (
            <div key={ing.id} className={`ingredient-row ${submitted ? status : ''}`}>
              <span className="ing-emoji">{ing.emoji}</span>
              <span className="ing-name">{ing.name}</span>
              <div className="slider-wrap">
                <input
                  type="range"
                  min={Math.floor(ing.minAmount * 0.5)}
                  max={Math.ceil(ing.maxAmount * 1.5)}
                  step={ing.id === 'egg' ? 1 : 5}
                  value={amounts[ing.id]}
                  disabled={submitted}
                  onChange={(e) =>
                    setAmounts((prev) => ({ ...prev, [ing.id]: Number(e.target.value) }))
                  }
                  style={{ accentColor: ing.color }}
                />
              </div>
              <span className="ing-amount">
                {amounts[ing.id]} {ing.unit}
              </span>
              {submitted && (
                <span className="ing-status">
                  {status === 'good' ? '✅' : status === 'low' ? '📉' : '📈'}
                </span>
              )}
            </div>
          );
        })}
      </div>

      {!submitted ? (
        <button className="btn-primary" onClick={handleSubmit}>
          재료 확인!
        </button>
      ) : (
        <div className="result-msg">
          <span className="score-badge">{calcScore()}점</span>
          <span>다음 단계로 이동 중...</span>
        </div>
      )}
    </div>
  );
}
