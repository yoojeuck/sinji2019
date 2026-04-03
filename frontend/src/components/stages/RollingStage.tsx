import { useState, useEffect, useRef } from 'react';
import type { GameAction } from '../../types/game';
import { ROLLING_TARGET_SUCCESS } from '../../data/recipes';

interface Props {
  dispatch: React.Dispatch<GameAction>;
}

const BAR_WIDTH = 300;
const ZONE_WIDTH = 60;
const SPEED = 2.5; // px per frame

export default function RollingStage({ dispatch }: Props) {
  const [barPos, setBarPos] = useState(0);
  const [successes, setSuccesses] = useState(0);
  const [failed, setFailed] = useState(0);
  const [feedback, setFeedback] = useState<'success' | 'fail' | null>(null);
  const [done, setDone] = useState(false);
  const animRef = useRef<number | null>(null);
  const posRef = useRef(0);
  const dirRef = useRef(1);

  useEffect(() => {
    if (done) return;
    const animate = () => {
      posRef.current += SPEED * dirRef.current;
      if (posRef.current >= BAR_WIDTH - ZONE_WIDTH) {
        dirRef.current = -1;
      } else if (posRef.current <= 0) {
        dirRef.current = 1;
      }
      setBarPos(posRef.current);
      animRef.current = requestAnimationFrame(animate);
    };
    animRef.current = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(animRef.current!);
  }, [done]);

  const zoneStart = (BAR_WIDTH - ZONE_WIDTH) / 2;
  const zoneEnd = zoneStart + ZONE_WIDTH;

  const handlePress = () => {
    if (done) return;
    const inZone = posRef.current >= zoneStart && posRef.current <= zoneEnd;
    if (inZone) {
      const next = successes + 1;
      setSuccesses(next);
      setFeedback('success');
      setTimeout(() => setFeedback(null), 500);
      if (next >= ROLLING_TARGET_SUCCESS) {
        setDone(true);
        cancelAnimationFrame(animRef.current!);
        const score = Math.round((next / ROLLING_TARGET_SUCCESS) * 100);
        setTimeout(() => {
          dispatch({ type: 'COMPLETE_STAGE', stage: 'rolling', score });
        }, 1400);
      }
    } else {
      setFailed((f) => f + 1);
      setFeedback('fail');
      setTimeout(() => setFeedback(null), 500);
    }
  };

  return (
    <div className="stage-container">
      <h2 className="stage-title">🌀 케이크 말기</h2>
      <p className="stage-desc">
        바가 <strong>초록 구역</strong>에 들어올 때 버튼을 누르세요! ({successes}/{ROLLING_TARGET_SUCCESS} 성공)
      </p>

      <div className="rolling-track">
        <div
          className="zone-indicator"
          style={{ left: zoneStart, width: ZONE_WIDTH }}
        />
        <div
          className="rolling-bar"
          style={{ left: barPos, backgroundColor: feedback === 'success' ? '#4caf50' : feedback === 'fail' ? '#f44336' : '#ffa726' }}
        />
      </div>

      <div className={`cake-roll-visual ${done ? 'rolled' : ''}`}>
        {done ? '🎂' : '🍰'}
      </div>

      <button
        className={`btn-roll ${feedback === 'success' ? 'success-flash' : ''} ${feedback === 'fail' ? 'fail-flash' : ''}`}
        onClick={handlePress}
        disabled={done}
      >
        {feedback === 'success' ? '🎉 성공!' : feedback === 'fail' ? '❌ 빗나감' : '🌀 지금 말기!'}
      </button>

      <div className="roll-stats">
        <span>✅ 성공: {successes}</span>
        <span>❌ 실패: {failed}</span>
      </div>

      {done && (
        <div className="result-msg">
          <span className="score-badge">100점</span>
          <span>롤케이크 완성! 🎂</span>
        </div>
      )}
    </div>
  );
}
