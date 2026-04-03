import { useGameState } from './hooks/useGameState';
import { STAGE_CONFIGS, STAGE_ORDER, STAGE_LABELS } from './data/stageConfigs';
import RhythmStage from './components/RhythmStage';
import ScoreScreen from './components/stages/ScoreScreen';
import './styles/app.css';

const PLAYABLE = STAGE_ORDER.slice(1, -1); // exclude welcome & score

const STAGE_ICONS: Record<string, string> = {
  ingredient: '🌾', mixing: '🥣', baking: '🔥',
  cream: '🍦', spreading: '🎨', rolling: '🌀', score: '🎂',
};

export default function App() {
  const { state, dispatch } = useGameState();

  if (state.currentStage === 'welcome') {
    return (
      <div className="welcome-screen">
        <div className="welcome-bg" />
        <div className="welcome-content">
          <div className="welcome-cake">🎂</div>
          <h1 className="welcome-h1">롤케이크 공방</h1>
          <p className="welcome-sub">리듬에 맞춰 롤케이크를 만들어 보세요!</p>
          <div className="welcome-steps">
            {PLAYABLE.map((s, i) => (
              <div key={s} className="ws-step">
                <span>{STAGE_ICONS[s]}</span>
                <span className="ws-label">{STAGE_LABELS[s]}</span>
                {i < PLAYABLE.length - 1 && <span className="ws-arrow">›</span>}
              </div>
            ))}
          </div>
          <div className="welcome-keys">
            <span>키보드 <kbd>D</kbd><kbd>F</kbd><kbd>J</kbd><kbd>K</kbd> 또는 버튼 클릭</span>
          </div>
          <button className="welcome-btn" onClick={() => dispatch({ type: 'NEXT_STAGE' })}>
            게임 시작!
          </button>
        </div>
      </div>
    );
  }

  if (state.currentStage === 'score') {
    return (
      <div className="app-dark">
        <ScoreScreen state={state} dispatch={dispatch} />
      </div>
    );
  }

  const config = STAGE_CONFIGS.find(c => c.stageKey === state.currentStage);
  if (!config) return null;

  const currentIdx = PLAYABLE.indexOf(state.currentStage as typeof PLAYABLE[number]);

  return (
    <div className="app-dark">
      {/* Stage progress bar */}
      <header className="game-header">
        <span className="game-logo">🎂</span>
        <div className="stage-pills">
          {PLAYABLE.map((s, i) => (
            <div
              key={s}
              className={`stage-pill ${i < currentIdx ? 'done' : i === currentIdx ? 'active' : 'pending'}`}
              title={STAGE_LABELS[s]}
            >
              {STAGE_ICONS[s]}
            </div>
          ))}
        </div>
        <span className="game-total-score">{state.totalScore}점</span>
      </header>

      <main className="game-main">
        <RhythmStage key={state.currentStage} config={config} dispatch={dispatch} />
      </main>
    </div>
  );
}
