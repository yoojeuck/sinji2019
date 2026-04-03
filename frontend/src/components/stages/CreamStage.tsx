import { useState } from 'react';
import type { GameAction } from '../../types/game';
import { CREAM_TARGET_CLICKS } from '../../data/recipes';

interface Props {
  dispatch: React.Dispatch<GameAction>;
}

export default function CreamStage({ dispatch }: Props) {
  const [clicks, setClicks] = useState(0);
  const [whipping, setWhipping] = useState(false);
  const [done, setDone] = useState(false);

  const progress = Math.min((clicks / CREAM_TARGET_CLICKS) * 100, 100);

  const creamEmoji = () => {
    if (progress < 30) return '🥛';
    if (progress < 60) return '🍶';
    if (progress < 90) return '🍦';
    return '☁️';
  };

  const handleWhip = () => {
    if (done) return;
    setWhipping(true);
    setTimeout(() => setWhipping(false), 200);
    const next = clicks + 1;
    setClicks(next);
    if (next >= CREAM_TARGET_CLICKS) {
      setDone(true);
      const score = 100;
      setTimeout(() => {
        dispatch({ type: 'COMPLETE_STAGE', stage: 'cream', score });
      }, 1200);
    }
  };

  return (
    <div className="stage-container">
      <h2 className="stage-title">🍦 크림 만들기</h2>
      <p className="stage-desc">버튼을 연속으로 눌러 생크림을 휘핑하세요!</p>

      <div
        className={`cream-bowl ${whipping ? 'whipping' : ''} ${done ? 'done' : ''}`}
        onClick={handleWhip}
      >
        <span className="cream-emoji">{creamEmoji()}</span>
        {whipping && <span className="whip-effect">💨</span>}
      </div>

      <div className="progress-section">
        <div className="progress-label">
          휘핑 완성도 {Math.round(progress)}%
          {progress >= 100 && ' 🎉'}
        </div>
        <div className="progress-bar-track">
          <div
            className="progress-bar-fill cream-fill"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      <div className="click-counter">{clicks} / {CREAM_TARGET_CLICKS} 번 휘핑</div>

      {done && (
        <div className="result-msg">
          <span className="score-badge">100점</span>
          <span>크림 완성! ☁️</span>
        </div>
      )}
    </div>
  );
}
