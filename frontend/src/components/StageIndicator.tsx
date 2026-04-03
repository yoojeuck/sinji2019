import type { Stage } from '../types/game';
import { STAGE_LABELS, STAGE_ORDER } from '../data/recipes';

interface Props {
  currentStage: Stage;
}

const STAGE_ICONS: Record<string, string> = {
  welcome: '🏠',
  ingredient: '🌾',
  mixing: '🥣',
  baking: '🔥',
  cream: '🍦',
  spreading: '🎨',
  rolling: '🌀',
  score: '🎂',
};

const PLAYABLE = STAGE_ORDER.slice(1); // exclude 'welcome'

export default function StageIndicator({ currentStage }: Props) {
  if (currentStage === 'welcome') return null;

  const currentIdx = PLAYABLE.indexOf(currentStage as typeof PLAYABLE[number]);

  return (
    <div className="stage-indicator">
      {PLAYABLE.map((stage, i) => {
        const status =
          i < currentIdx ? 'done' : i === currentIdx ? 'active' : 'pending';
        return (
          <div key={stage} className={`stage-step ${status}`}>
            <div className="step-icon">{STAGE_ICONS[stage]}</div>
            <div className="step-label">{STAGE_LABELS[stage]}</div>
            {i < PLAYABLE.length - 1 && <div className="step-connector" />}
          </div>
        );
      })}
    </div>
  );
}
