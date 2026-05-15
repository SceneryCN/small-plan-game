import { useGameStore } from '../store/gameStore';
import { audioEngine } from '../audio/AudioEngine';
import './StartScreen.css';

export default function StartScreen() {
  const screen = useGameStore(s => s.screen);

  const handleStart = () => {
    audioEngine.sfx?.play('click');
    audioEngine.sfx?.play('transition');
    useGameStore.getState().setScreen('playing');
  };

  if (screen !== 'start') return null;

  return (
    <div className="start-screen">
      <h1 className="start-title">弹幕抉择</h1>
      <div className="start-info">
        <p>左右拖动控制战机</p>
        <p>自动射击 · <span className="hl-green">打碎左侧道具获得强化</span></p>
        <p><span className="hl-red">消灭右侧怪物保护自己</span></p>
        <p className="start-sub">贪婪还是生存？你来抉择！</p>
      </div>
      <button className="start-btn" onClick={handleStart}>
        开始战斗
      </button>
    </div>
  );
}
