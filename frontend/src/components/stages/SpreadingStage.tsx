import { useState } from 'react';
import type { GameAction } from '../../types/game';
import { SPREADING_ZONES } from '../../data/recipes';

interface Props {
  dispatch: React.Dispatch<GameAction>;
}

export default function SpreadingStage({ dispatch }: Props) {
  const [covered, setCovered] = useState<Set<number>>(new Set());
  const [done, setDone] = useState(false);

  const progress = Math.round((covered.size / SPREADING_ZONES) * 100);

  const handleZoneClick = (idx: number) => {
    if (done) return;
    const next = new Set(covered);
    next.add(idx);
    setCovered(next);
    if (next.size >= SPREADING_ZONES) {
      setDone(true);
      setTimeout(() => {
        dispatch({ type: 'COMPLETE_STAGE', stage: 'spreading', score: 100 });
      }, 1200);
    }
  };

  return (
    <div className="stage-container">
      <h2 className="stage-title">🎨 크림 바르기</h2>
      <p className="stage-desc">케이크 시트의 모든 칸을 클릭해 크림을 골고루 발라주세요!</p>

      <div className="cake-sheet">
        {Array.from({ length: SPREADING_ZONES }, (_, i) => (
          <div
            key={i}
            className={`cake-zone ${covered.has(i) ? 'covered' : ''}`}
            onClick={() => handleZoneClick(i)}
          >
            {covered.has(i) ? '🍦' : ''}
          </div>
        ))}
      </div>

      <div className="progress-section">
        <div className="progress-label">크림 도포 {progress}%</div>
        <div className="progress-bar-track">
          <div className="progress-bar-fill cream-fill" style={{ width: `${progress}%` }} />
        </div>
      </div>

      {done && (
        <div className="result-msg">
          <span className="score-badge">100점</span>
          <span>크림 완성! 완벽해요! 🎉</span>
        </div>
      )}
    </div>
  );
}
