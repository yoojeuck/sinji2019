import { useState, useEffect } from 'react';
import type { GameAction, GameState, ScoreEntry } from '../../types/game';

interface Props {
  state: GameState;
  dispatch: React.Dispatch<GameAction>;
}

function getStars(score: number) {
  if (score >= 90) return 5;
  if (score >= 75) return 4;
  if (score >= 60) return 3;
  if (score >= 40) return 2;
  return 1;
}

export default function ScoreScreen({ state, dispatch }: Props) {
  const [name, setName] = useState('');
  const [saved, setSaved] = useState(false);
  const [leaderboard, setLeaderboard] = useState<ScoreEntry[]>([]);
  const stars = getStars(state.totalScore);

  useEffect(() => {
    fetch('http://localhost:3001/api/scores')
      .then((r) => r.json())
      .then((data: ScoreEntry[]) => setLeaderboard(data))
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
    <div className="stage-container score-stage">
      <div className="cake-final">🎂</div>
      <h2 className="stage-title">롤케이크 완성!</h2>

      <div className="stars">
        {Array.from({ length: 5 }, (_, i) => (
          <span key={i} className={i < stars ? 'star filled' : 'star empty'}>
            ★
          </span>
        ))}
      </div>

      <div className="total-score">{state.totalScore}점</div>

      <div className="stage-scores">
        {state.stageScores.map((s) => (
          <div key={s.stage} className="stage-score-row">
            <span className="ss-label">{s.label}</span>
            <div className="ss-bar-track">
              <div className="ss-bar-fill" style={{ width: `${s.score}%` }} />
            </div>
            <span className="ss-value">{s.score}점</span>
          </div>
        ))}
      </div>

      {!saved ? (
        <div className="save-section">
          <input
            className="name-input"
            type="text"
            placeholder="이름을 입력하세요"
            value={name}
            maxLength={10}
            onChange={(e) => setName(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSave()}
          />
          <button className="btn-primary" onClick={handleSave} disabled={!name.trim()}>
            점수 저장
          </button>
        </div>
      ) : (
        <p className="saved-msg">🎉 저장 완료!</p>
      )}

      {leaderboard.length > 0 && (
        <div className="leaderboard">
          <h3>🏆 명예의 전당</h3>
          {leaderboard.map((e, i) => (
            <div key={i} className="lb-row">
              <span className="lb-rank">{i + 1}위</span>
              <span className="lb-name">{e.name}</span>
              <span className="lb-score">{e.score}점</span>
            </div>
          ))}
        </div>
      )}

      <button className="btn-secondary" onClick={() => dispatch({ type: 'RESTART' })}>
        다시 만들기 🔄
      </button>
    </div>
  );
}
