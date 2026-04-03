import type { GameAction } from '../../types/game';

interface Props {
  dispatch: React.Dispatch<GameAction>;
}

export default function WelcomeScreen({ dispatch }: Props) {
  return (
    <div className="stage-container welcome-stage">
      <div className="welcome-emoji">🎂</div>
      <h1 className="welcome-title">롤케이크 공방</h1>
      <p className="welcome-subtitle">플레인 크림 롤케이크를 만들어 보세요!</p>
      <div className="welcome-steps">
        <div className="step-preview">🌾 재료 준비</div>
        <div className="step-arrow">→</div>
        <div className="step-preview">🥣 반죽</div>
        <div className="step-arrow">→</div>
        <div className="step-preview">🔥 굽기</div>
        <div className="step-arrow">→</div>
        <div className="step-preview">🍦 크림</div>
        <div className="step-arrow">→</div>
        <div className="step-preview">🎂 완성</div>
      </div>
      <button
        className="btn-primary btn-large"
        onClick={() => dispatch({ type: 'NEXT_STAGE' })}
      >
        게임 시작!
      </button>
    </div>
  );
}
