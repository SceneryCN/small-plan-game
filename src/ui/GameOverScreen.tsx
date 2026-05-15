import { useGameStore } from '../store/gameStore';
import { audioEngine } from '../audio/AudioEngine';
import './GameOverScreen.css';

export default function GameOverScreen() {
  const screen = useGameStore(s => s.screen);
  const finalScore = useGameStore(s => s.finalScore);

  const handleRestart = () => {
    audioEngine.sfx?.play('click');
    audioEngine.sfx?.play('transition');
    audioEngine.bgm?.transition('menu', 500, 500);
    useGameStore.getState().setScreen('start');
  };

  if (screen !== 'gameOver') return null;

  return (
    <div className="gameover-screen">
      <h1 className="gameover-title">战斗结束</h1>
      <div className="gameover-score">
        <p className="score-label">最终分数</p>
        <p className="score-value">{finalScore}</p>
      </div>
      <button className="gameover-btn" onClick={handleRestart}>
        再来一局
      </button>
    </div>
  );
}
