import { useState, useEffect, useRef } from 'react';
import type { GameAction } from '../../types/game';
import { OPTIMAL_TEMP } from '../../data/recipes';

interface Props {
  dispatch: React.Dispatch<GameAction>;
}

const BAKE_DURATION = 15; // seconds

export default function BakingStage({ dispatch }: Props) {
  const [temp, setTemp] = useState(160);
  const [timeLeft, setTimeLeft] = useState(BAKE_DURATION);
  const [started, setStarted] = useState(false);
  const [done, setDone] = useState(false);
  const [goodSeconds, setGoodSeconds] = useState(0);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const isOptimal = temp >= OPTIMAL_TEMP.min && temp <= OPTIMAL_TEMP.max;

  useEffect(() => {
    if (!started || done) return;
    intervalRef.current = setInterval(() => {
      setTimeLeft((t) => {
        if (t <= 1) {
          clearInterval(intervalRef.current!);
          setDone(true);
          return 0;
        }
        return t - 1;
      });
      if (isOptimal) setGoodSeconds((g) => g + 1);
    }, 1000);
    return () => clearInterval(intervalRef.current!);
  }, [started, isOptimal, done]);

  useEffect(() => {
    if (done) {
      const score = Math.round((goodSeconds / BAKE_DURATION) * 100);
      setTimeout(() => {
        dispatch({ type: 'COMPLETE_STAGE', stage: 'baking', score });
      }, 1400);
    }
  }, [done]);

  const ovenEmoji = () => {
    if (!started) return '🫙';
    if (isOptimal) return '🔥';
    if (temp > OPTIMAL_TEMP.max) return '♨️';
    return '❄️';
  };

  const tempColor = isOptimal ? '#4caf50' : temp > OPTIMAL_TEMP.max ? '#f44336' : '#2196f3';

  return (
    <div className="stage-container">
      <h2 className="stage-title">🔥 굽기</h2>
      <p className="stage-desc">
        최적 온도 <strong>{OPTIMAL_TEMP.min}°C ~ {OPTIMAL_TEMP.max}°C</strong> 를 유지하세요!
      </p>

      <div className={`oven-display ${started && isOptimal ? 'oven-glow' : ''}`}>
        <span className="oven-emoji">{ovenEmoji()}</span>
        <span className="oven-cake">{started ? '🍰' : '🥣'}</span>
        <div className="temp-display" style={{ color: tempColor }}>
          {temp}°C
        </div>
      </div>

      <div className="slider-section">
        <label>온도 조절</label>
        <input
          type="range"
          min={140}
          max={210}
          step={5}
          value={temp}
          disabled={!started || done}
          onChange={(e) => setTemp(Number(e.target.value))}
          style={{ accentColor: tempColor }}
        />
        <div className="temp-hint">
          {isOptimal ? '✅ 완벽한 온도!' : temp > OPTIMAL_TEMP.max ? '🔺 너무 높아요!' : '🔻 온도를 높이세요!'}
        </div>
      </div>

      {started && (
        <div className="timer-section">
          <div className="timer-bar-track">
            <div
              className="timer-bar-fill"
              style={{ width: `${(timeLeft / BAKE_DURATION) * 100}%` }}
            />
          </div>
          <div className="timer-text">남은 시간: {timeLeft}초 · 적정 온도 유지: {goodSeconds}초</div>
        </div>
      )}

      {!started && !done && (
        <button className="btn-primary" onClick={() => setStarted(true)}>
          오븐 시작! 🔥
        </button>
      )}

      {done && (
        <div className="result-msg">
          <span className="score-badge">{Math.round((goodSeconds / BAKE_DURATION) * 100)}점</span>
          <span>굽기 완성! 🎉</span>
        </div>
      )}
    </div>
  );
}
