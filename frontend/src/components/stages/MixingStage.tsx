import { useState, useRef } from 'react';
import type { GameAction } from '../../types/game';
import { MIXING_TARGET_CLICKS } from '../../data/recipes';

interface Props {
  dispatch: React.Dispatch<GameAction>;
}

export default function MixingStage({ dispatch }: Props) {
  const [clicks, setClicks] = useState(0);
  const [spinning, setSpinning] = useState(false);
  const [done, setDone] = useState(false);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const progress = Math.min((clicks / MIXING_TARGET_CLICKS) * 100, 100);

  const handleClick = () => {
    if (done) return;
    setSpinning(true);
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    timeoutRef.current = setTimeout(() => setSpinning(false), 300);

    const next = clicks + 1;
    setClicks(next);

    if (next >= MIXING_TARGET_CLICKS) {
      setDone(true);
      const score = 100;
      setTimeout(() => {
        dispatch({ type: 'COMPLETE_STAGE', stage: 'mixing', score });
      }, 1200);
    }
  };

  return (
    <div className="stage-container">
      <h2 className="stage-title">🥣 반죽 만들기</h2>
      <p className="stage-desc">볼을 클릭해서 재료를 잘 섞어주세요!</p>

      <div className={`bowl-wrap ${spinning ? 'spinning' : ''} ${done ? 'done' : ''}`} onClick={handleClick}>
        <div className="bowl">🥣</div>
        {spinning && <span className="mix-effect">💫</span>}
      </div>

      <div className="progress-section">
        <div className="progress-label">반죽 완성도 {Math.round(progress)}%</div>
        <div className="progress-bar-track">
          <div className="progress-bar-fill" style={{ width: `${progress}%` }} />
        </div>
      </div>

      <div className="click-counter">{clicks} / {MIXING_TARGET_CLICKS} 번 섞기</div>

      {done && (
        <div className="result-msg">
          <span className="score-badge">100점</span>
          <span>반죽 완성! ✨</span>
        </div>
      )}
    </div>
  );
}
