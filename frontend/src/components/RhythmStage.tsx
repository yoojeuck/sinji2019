import { useEffect, useCallback, useRef, useState } from 'react';
import { useRhythmEngine } from '../hooks/useRhythmEngine';
import type { StageConfig, Stage } from '../types/game';
import type { GameAction } from '../types/game';
import { TRAVEL_MS } from '../data/stageConfigs';

interface Props {
  config: StageConfig;
  dispatch: React.Dispatch<GameAction>;
}

interface Explosion {
  id: number;
  lane: number;
  type: 'perfect' | 'good';
  color: string;
}

const TRACK_H = 340;
const HIT_Y   = TRACK_H - 56;

export default function RhythmStage({ config, dispatch }: Props) {
  const { lanes, notes, accentColor, bpm } = config;

  // Visual effect states
  const [explosions,  setExplosions]  = useState<Explosion[]>([]);
  const [laneFlash,   setLaneFlash]   = useState<Record<number, boolean>>({});
  const [screenFlash, setScreenFlash] = useState<string | null>(null);
  const [btnActive,   setBtnActive]   = useState<Record<number, boolean>>({});
  const expId = useRef(0);

  const triggerEffects = useCallback((lane: number, type: 'perfect' | 'good') => {
    const id = ++expId.current;
    const color = lanes[lane]?.color ?? '#fff';

    setExplosions(prev => [...prev, { id, lane, type, color }]);
    setTimeout(() => setExplosions(prev => prev.filter(e => e.id !== id)), 480);

    setLaneFlash(prev => ({ ...prev, [lane]: true }));
    setTimeout(() => setLaneFlash(prev => ({ ...prev, [lane]: false })), 160);

    if (type === 'perfect') {
      setScreenFlash(accentColor);
      setTimeout(() => setScreenFlash(null), 180);
    }
  }, [lanes, accentColor]);

  const handleComplete = useCallback(
    (score: number, perfect: number, good: number, miss: number) => {
      setTimeout(() => {
        dispatch({ type: 'COMPLETE_STAGE', stage: config.stageKey as Stage, score, perfect, good, miss });
      }, 1200);
    },
    [config.stageKey, dispatch],
  );

  const { state, start, hitLane } = useRhythmEngine(notes, bpm, handleComplete);

  // Trigger visual effects when lastFeedback changes
  useEffect(() => {
    if (state.lastFeedback && state.lastFeedback.type !== 'miss') {
      triggerEffects(state.lastFeedback.lane, state.lastFeedback.type);
    }
  }, [state.lastFeedback]);

  // Keyboard support
  useEffect(() => {
    const keyMap: Record<string, number> = {};
    lanes.forEach((l, i) => { keyMap[l.key.toLowerCase()] = i; });
    const onKey = (e: KeyboardEvent) => {
      if (e.repeat) return;
      const idx = keyMap[e.key.toLowerCase()];
      if (idx !== undefined) {
        hitLane(idx);
        setBtnActive(prev => ({ ...prev, [idx]: true }));
        setTimeout(() => setBtnActive(prev => ({ ...prev, [idx]: false })), 120);
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [lanes, hitLane]);

  const { currentTime, combo, totalScore, lastFeedback, started, finished, countdown } = state;

  return (
    <div className="rhythm-stage" style={{ '--accent': accentColor } as React.CSSProperties}>
      {/* Screen flash overlay */}
      {screenFlash && (
        <div className="screen-flash" style={{ background: screenFlash }} />
      )}

      {/* Header */}
      <div className="rhythm-header">
        <div className="rhythm-title">{config.title}</div>
        <div className="rhythm-meta">
          <span className="rhythm-score">🎵 {totalScore}</span>
          {combo >= 3 && (
            <span className="rhythm-combo" key={combo}>x{combo} COMBO</span>
          )}
        </div>
      </div>
      <p className="rhythm-desc">{config.description}</p>

      {/* Track */}
      <div className="rhythm-track" style={{ height: TRACK_H }}>
        {/* Lane columns with flash */}
        {lanes.map((lane, i) => (
          <div
            key={i}
            className={`lane-col ${laneFlash[i] ? 'lane-flash' : ''}`}
            style={{
              left: `${(i / lanes.length) * 100}%`,
              width: `${100 / lanes.length}%`,
              background: laneFlash[i] ? lane.color + '30' : 'transparent',
            }}
          />
        ))}

        {/* Hit zone line */}
        <div className="hit-zone-line" style={{ top: HIT_Y }}>
          {lanes.map((lane, i) => (
            <div
              key={i}
              className={`hit-circle ${laneFlash[i] ? 'hit-circle-active' : ''}`}
              style={{
                left: `${(i / lanes.length) * 100 + 50 / lanes.length}%`,
                background: laneFlash[i] ? lane.color : '#1a1a2e',
                boxShadow: laneFlash[i]
                  ? `0 0 24px ${lane.color}, 0 0 48px ${lane.color}60`
                  : `0 0 8px ${lane.color}40`,
                borderColor: lane.color,
                transform: `translate(-50%, -50%) scale(${laneFlash[i] ? 1.3 : 1})`,
              }}
            >
              {lane.emoji}
            </div>
          ))}
        </div>

        {/* Explosion rings */}
        {explosions.map(exp => {
          const laneW = 100 / lanes.length;
          const cx = exp.lane * laneW + laneW / 2;
          return (
            <div key={exp.id}>
              <div
                className={`exp-ring ${exp.type}`}
                style={{ left: `${cx}%`, top: HIT_Y, borderColor: exp.color }}
              />
              <div
                className={`exp-ring exp-ring-2 ${exp.type}`}
                style={{ left: `${cx}%`, top: HIT_Y, borderColor: exp.color }}
              />
              {exp.type === 'perfect' && (
                <>
                  {[...Array(6)].map((_, pi) => (
                    <div
                      key={pi}
                      className="exp-spark"
                      style={{
                        left: `${cx}%`,
                        top: HIT_Y,
                        background: exp.color,
                        '--angle': `${pi * 60}deg`,
                      } as React.CSSProperties}
                    />
                  ))}
                </>
              )}
            </div>
          );
        })}

        {/* Falling notes */}
        {state.notes.map(note => {
          const laneW = 100 / lanes.length;
          const cx = note.lane * laneW + laneW / 2;
          const color = lanes[note.lane]?.color ?? '#fff';

          if (note.status === 'hit-perfect' || note.status === 'hit-good') return null;

          const progress = (currentTime - (note.beatTime - TRAVEL_MS)) / TRAVEL_MS;
          if (progress < 0) return null;
          const y = progress * TRACK_H;
          if (y > TRACK_H + 40) return null;

          const isMissed = note.status === 'miss';
          const nearHit  = !isMissed && Math.abs(y - HIT_Y) < 48;

          return (
            <div
              key={note.id}
              className={`falling-note ${isMissed ? 'note-miss' : ''} ${nearHit ? 'note-near' : ''}`}
              style={{
                top: y,
                left: `${cx}%`,
                background: isMissed ? '#333' : color,
                boxShadow: isMissed ? 'none'
                  : nearHit
                    ? `0 0 20px ${color}, 0 0 40px ${color}80`
                    : `0 0 10px ${color}80`,
              }}
            />
          );
        })}

        {/* Hit text feedback */}
        {lastFeedback && (
          <div
            className={`hit-burst ${lastFeedback.type}`}
            key={`${lastFeedback.id}`}
            style={{
              left: `${(lastFeedback.lane / lanes.length) * 100 + 50 / lanes.length}%`,
              top: HIT_Y - 30,
            }}
          >
            {lastFeedback.type === 'perfect' ? '✨ PERFECT!' : '👍 GOOD!'}
          </div>
        )}

        {/* Countdown overlay */}
        {!started && (
          <div className="countdown-overlay">
            {countdown > 0
              ? <span className="countdown-num" key={countdown}>{countdown}</span>
              : <span className="countdown-go">GO!</span>
            }
          </div>
        )}

        {/* Finished overlay */}
        {finished && (
          <div className="finish-overlay">
            <div className="finish-text">🎂 완성!</div>
          </div>
        )}
      </div>

      {/* Lane buttons */}
      <div className="lane-buttons">
        {lanes.map((lane, i) => (
          <button
            key={i}
            className={`lane-btn ${btnActive[i] ? 'lane-btn-pressed' : ''}`}
            style={{
              borderColor: lane.color,
              background: btnActive[i] ? lane.color + '55' : lane.color + '18',
              boxShadow: btnActive[i] ? `0 0 20px ${lane.color}` : 'none',
            }}
            onPointerDown={e => {
              e.preventDefault();
              hitLane(i);
              setBtnActive(prev => ({ ...prev, [i]: true }));
              setTimeout(() => setBtnActive(prev => ({ ...prev, [i]: false })), 120);
            }}
          >
            <span className="lane-btn-emoji">{lane.emoji}</span>
            <span className="lane-btn-label">{lane.label}</span>
            <span className="lane-btn-key">{lane.key}</span>
          </button>
        ))}
      </div>

      {!started && countdown === 3 && (
        <button
          className="rhythm-start-btn"
          style={{ background: `linear-gradient(135deg, ${accentColor}, ${accentColor}bb)` }}
          onClick={start}
        >
          🎵 시작!
        </button>
      )}
    </div>
  );
}
