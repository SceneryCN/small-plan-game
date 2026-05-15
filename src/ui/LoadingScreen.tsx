import { useEffect, useState } from 'react';
import { audioEngine } from '../audio/AudioEngine';
import { LoadingTrack } from '../audio/tracks/LoadingTrack';
import { MenuTrack } from '../audio/tracks/MenuTrack';
import { BattleTrack } from '../audio/tracks/BattleTrack';
import { GameOverTrack } from '../audio/tracks/GameOverTrack';
import { initSprites } from '../sprites/SpriteFactory';
import { useGameStore } from '../store/gameStore';
import './LoadingScreen.css';

export default function LoadingScreen() {
  const [progress, setProgress] = useState(0);
  const [statusText, setStatusText] = useState('');
  const [started, setStarted] = useState(false);
  const screen = useGameStore(s => s.screen);

  const handleClick = async () => {
    if (started) return;
    setStarted(true);

    try {
      // Step 1: Init audio
      setStatusText('初始化音频...');
      setProgress(10);
      audioEngine.init();
      audioEngine.resume();
      await delay(100);

      // Step 2: Register BGM tracks
      setStatusText('加载背景音乐...');
      setProgress(25);
      if (audioEngine.ctx && audioEngine.bgmGain && audioEngine.bgm) {
        const ctx = audioEngine.ctx;
        const bgmOut = audioEngine.bgmGain;
        audioEngine.bgm.registerTrack('loading', new LoadingTrack(ctx, bgmOut));
        audioEngine.bgm.registerTrack('menu', new MenuTrack(ctx, bgmOut));
        audioEngine.bgm.registerTrack('battle', new BattleTrack(ctx, bgmOut));
        audioEngine.bgm.registerTrack('gameOver', new GameOverTrack(ctx, bgmOut));
        audioEngine.bgm.transition('loading', 0, 800);
      }
      await delay(200);

      // Step 3: Generate pixel sprites
      setStatusText('生成像素精灵...');
      setProgress(50);
      await delay(50);
      try {
        initSprites();
      } catch (e) {
        console.warn('Sprite pre-init failed (will retry on game start):', e);
      }
      setProgress(75);
      await delay(150);

      // Step 4: Final prep
      setStatusText('准备就绪!');
      setProgress(100);
      await delay(400);

      // Transition to start screen
      if (audioEngine.bgm) {
        audioEngine.bgm.transition('menu', 500, 500);
      }
      audioEngine.sfx?.play('transition');
      useGameStore.getState().setScreen('start');

    } catch (e) {
      console.error('Loading error:', e);
      // Even if something fails, proceed to start screen
      setStatusText('加载完成');
      setProgress(100);
      await delay(300);
      useGameStore.getState().setScreen('start');
    }
  };

  if (screen !== 'loading') return null;

  return (
    <div className="loading-screen" onClick={handleClick}>
      {!started ? (
        <div className="loading-prompt">
          <h1 className="loading-title">弹幕抉择</h1>
          <p className="loading-tap">[ 点击开始加载 ]</p>
        </div>
      ) : (
        <div className="loading-content">
          <p className="loading-text">加载中...</p>
          <div className="loading-bar-outer">
            <div className="loading-bar-inner" style={{ width: `${progress}%` }} />
          </div>
          <p className="loading-percent">{progress}%</p>
          <p className="loading-status">{statusText}</p>
        </div>
      )}
    </div>
  );
}

function delay(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}
