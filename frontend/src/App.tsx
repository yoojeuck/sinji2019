import { useGameState } from './hooks/useGameState';
import StageIndicator from './components/StageIndicator';
import WelcomeScreen from './components/stages/WelcomeScreen';
import IngredientStage from './components/stages/IngredientStage';
import MixingStage from './components/stages/MixingStage';
import BakingStage from './components/stages/BakingStage';
import CreamStage from './components/stages/CreamStage';
import SpreadingStage from './components/stages/SpreadingStage';
import RollingStage from './components/stages/RollingStage';
import ScoreScreen from './components/stages/ScoreScreen';
import './styles/app.css';

export default function App() {
  const { state, dispatch } = useGameState();

  const renderStage = () => {
    switch (state.currentStage) {
      case 'welcome':
        return <WelcomeScreen dispatch={dispatch} />;
      case 'ingredient':
        return <IngredientStage dispatch={dispatch} />;
      case 'mixing':
        return <MixingStage dispatch={dispatch} />;
      case 'baking':
        return <BakingStage dispatch={dispatch} />;
      case 'cream':
        return <CreamStage dispatch={dispatch} />;
      case 'spreading':
        return <SpreadingStage dispatch={dispatch} />;
      case 'rolling':
        return <RollingStage dispatch={dispatch} />;
      case 'score':
        return <ScoreScreen state={state} dispatch={dispatch} />;
      default:
        return null;
    }
  };

  return (
    <div className="app">
      <header className="app-header">
        <span className="header-logo">🎂</span>
        <span className="header-title">롤케이크 공방</span>
      </header>
      <StageIndicator currentStage={state.currentStage} />
      <main className="app-main">{renderStage()}</main>
    </div>
  );
}
