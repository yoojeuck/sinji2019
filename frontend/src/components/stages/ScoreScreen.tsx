import { useState, useEffect } from 'react';
import type { GameAction, GameState } from '../../types/game';
import type { ScoreEntry } from '../../types/game';

// ScoreEntry re-export for compatibility
export type { ScoreEntry };

interface Props {
  state: GameState;
  dispatch: React.Dispatch<GameAction>;
}

function getStars(score: number) {
  if (score >= 95) return 5;
  if (score >= 80) return 4;
  if (score >= 65) return 3;
  if (score >= 45) return 2;
  return 1;
}

function getRank(score: number) {
  if (score >= 95) return { label: 'S', color: '#ffd700' };
  if (score >= 80) return { label: 'A', color: '#69f0ae' };
  if (score >= 65) return { label: 'B', color: '#40c4ff' };
  if (score >= 45) return { label: 'C', color: '#ce93d8' };
  return { label: 'D', color: '#ef9a9a' };
}

export default function ScoreScreen({ state, dispatch }: Props) {
  const [name, setName] = useState('');
  const [saved, setSaved] = useState(false);
  const [leaderboard, setLeaderboard] = useState<{ name: string; score: number; date: string }[]>([]);
  const stars = getStars(state.totalScore);
  const rank = getRank(state.totalScore);

  useEffect(() => {
    fetch('http://localhost:3001/api/scores')
      .then(r => r.json())
      .then(setLeaderboard)
      .catch(() => {});
  }, [saved]);

  const handleSave = async () => {
    if (!name.trim()) return;
    await fetch('http://localhost:3001/api/scores', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: name.trim(), score: state.totalScore }),
    }).catch(() => {});
    setSaved(true);
  };

  return (
    <div className="score-screen">
      <div className="score-cake-anim">🎂</div>
      <h2 className="score-title">롤케이크 완성!</h2>

      <div className="rank-badge" style={{ color: rank.color, borderColor: rank.color }}>
        {rank.label}
      </div>

      <div className="stars-row">
        {Array.from({ length: 5 }, (_, i) => (
          <span key={i} className={i < stars ? 'star on' : 'star off'}>★</span>
        ))}
      </div>

      <div className="total-score-display" style={{ color: rank.color }}>
        {state.totalScore}<span className="score-unit">점</span>
      </div>

      {/* Per-stage breakdown */}
      <div className="stage-breakdown">
        {state.stageScores.map(s => (
          <div key={s.stage} className="breakdown-row">
            <span className="br-label">{s.label}</span>
            <div className="br-bar-track">
              <div className="br-bar-fill" style={{ width: `${s.score}%` }} />
            </div>
            <span className="br-score">{s.score}점</span>
            <span className="br-detail">
              {s.perfect}P {s.good}G {s.miss}M
            </span>
          </div>
        ))}
      </div>

      {!saved ? (
        <div className="save-row">
          <input
            className="name-input"
            type="text"
            placeholder="이름 입력"
            value={name}
            maxLength={10}
            onChange={e => setName(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleSave()}
          />
          <button className="btn-primary" onClick={handleSave} disabled={!name.trim()}>
            저장
          </button>
        </div>
      ) : (
        <p className="saved-ok">🎉 저장 완료!</p>
      )}

      {leaderboard.length > 0 && (
        <div className="leaderboard">
          <h3>🏆 명예의 전당</h3>
          {leaderboard.map((e, i) => (
            <div key={i} className="lb-row">
              <span className="lb-rank">{i + 1}</span>
              <span className="lb-name">{e.name}</span>
              <span className="lb-score">{e.score}점</span>
            </div>
          ))}
        </div>
      )}

      <button className="btn-retry" onClick={() => dispatch({ type: 'RESTART' })}>
        🔄 다시 도전!
      </button>
    </div>
  );
}
