import { useEffect, useCallback } from 'react';
import { useRhythmEngine } from '../hooks/useRhythmEngine';
import type { StageConfig, Stage } from '../types/game';
import type { GameAction } from '../types/game';
import { TRAVEL_MS } from '../data/stageConfigs';

interface Props {
  config: StageConfig;
  dispatch: React.Dispatch<GameAction>;
}

const TRACK_H = 340;
const HIT_Y   = TRACK_H - 56; // px from top of track where hit zone is

export default function RhythmStage({ config, dispatch }: Props) {
  const { lanes, notes, accentColor } = config;

  const handleComplete = useCallback(
    (score: number, perfect: number, good: number, miss: number) => {
      setTimeout(() => {
        dispatch({
          type: 'COMPLETE_STAGE',
          stage: config.stageKey as Stage,
          score,
          perfect,
          good,
          miss,
        });
      }, 1200);
    },
    [config.stageKey, dispatch],
  );

  const { state, start, hitLane } = useRhythmEngine(notes, handleComplete);

  // Keyboard support
  useEffect(() => {
    const keyMap: Record<string, number> = {};
    lanes.forEach((l, i) => { keyMap[l.key.toLowerCase()] = i; });

    const onKey = (e: KeyboardEvent) => {
      if (e.repeat) return;
      const idx = keyMap[e.key.toLowerCase()];
      if (idx !== undefined) hitLane(idx);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [lanes, hitLane]);

  const { currentTime, combo, totalScore, lastFeedback, started, finished, countdown } = state;

  return (
    <div className="rhythm-stage" style={{ '--accent': accentColor } as React.CSSProperties}>
      {/* Header */}
      <div className="rhythm-header">
        <div className="rhythm-title">{config.title}</div>
        <div className="rhythm-meta">
          <span className="rhythm-score">🎵 {totalScore}</span>
          {combo >= 3 && <span className="rhythm-combo">x{combo} COMBO</span>}
        </div>
      </div>

      <p className="rhythm-desc">{config.description}</p>

      {/* Track */}
      <div className="rhythm-track" style={{ height: TRACK_H }}>
        {/* Lane dividers */}
        {lanes.map((_, i) => (
          <div
            key={i}
            className="lane-col"
            style={{ left: `${(i / lanes.length) * 100}%`, width: `${100 / lanes.length}%` }}
          />
        ))}

        {/* Hit zone line */}
        <div className="hit-zone-line" style={{ top: HIT_Y }}>
          {lanes.map((lane, i) => (
            <div
              key={i}
              className="hit-circle"
              style={{
                left: `${(i / lanes.length) * 100 + 50 / lanes.length}%`,
                background: lane.color,
                boxShadow: `0 0 12px ${lane.color}`,
              }}
            >
              {lane.emoji}
            </div>
          ))}
        </div>

        {/* Falling notes */}
        {state.notes.map(note => {
          if (note.status === 'hit-perfect' || note.status === 'hit-good') return null;
          const progress = (currentTime - (note.beatTime - TRAVEL_MS)) / TRAVEL_MS;
          if (progress < 0) return null;
          const y = progress * TRACK_H;
          if (y > TRACK_H + 40) return null;

          const laneW = 100 / lanes.length;
          const laneCenter = note.lane * laneW + laneW / 2;
          const isMissed = note.status === 'miss';

          return (
            <div
              key={note.id}
              className={`falling-note ${isMissed ? 'note-miss' : ''}`}
              style={{
                top: y,
                left: `${laneCenter}%`,
                background: isMissed ? '#444' : lanes[note.lane]?.color ?? '#fff',
                boxShadow: isMissed ? 'none' : `0 0 14px ${lanes[note.lane]?.color ?? '#fff'}`,
              }}
            />
          );
        })}

        {/* Hit feedback burst */}
        {lastFeedback && (
          <div
            className={`hit-burst ${lastFeedback.type}`}
            style={{
              left: `${(lastFeedback.lane / lanes.length) * 100 + 50 / lanes.length}%`,
              top: HIT_Y - 20,
            }}
          >
            {lastFeedback.type === 'perfect' ? 'PERFECT!' : 'GOOD!'}
          </div>
        )}

        {/* Countdown overlay */}
        {!started && (
          <div className="countdown-overlay">
            {countdown > 0
              ? <span className="countdown-num">{countdown}</span>
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
            className="lane-btn"
            style={{ background: lane.color + '33', borderColor: lane.color }}
            onPointerDown={() => hitLane(i)}
          >
            <span className="lane-btn-emoji">{lane.emoji}</span>
            <span className="lane-btn-label">{lane.label}</span>
            <span className="lane-btn-key">{lane.key}</span>
          </button>
        ))}
      </div>

      {/* Start button */}
      {!started && countdown === 3 && (
        <button className="rhythm-start-btn" onClick={start}
          style={{ background: accentColor }}>
          시작!
        </button>
      )}
    </div>
  );
}
