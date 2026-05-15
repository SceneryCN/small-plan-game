import { useGameStore } from '../../store/gameStore';
import './HUD.css';

export default function HUD() {
  const screen = useGameStore(s => s.screen);
  const score = useGameStore(s => s.score);
  const combo = useGameStore(s => s.combo);
  const hp = useGameStore(s => s.hp);
  const maxHp = useGameStore(s => s.maxHp);
  const shieldHp = useGameStore(s => s.shieldHp);
  const activeEffects = useGameStore(s => s.activeEffects);
  const wave = useGameStore(s => s.wave);

  if (screen !== 'playing') return null;

  const hpPercent = Math.max(0, (hp / maxHp) * 100);
  const hpColor = hpPercent > 50 ? '#00ff88' : hpPercent > 25 ? '#ffaa00' : '#ff3344';

  const effectNames: Record<string, string> = {
    fireRate: '射速↑',
    tripleShot: '三连弹',
    laser: '激光炮',
    pierce: '穿透弹',
    shield: '护盾',
    drone: '浮游炮',
    homing: '跟踪弹',
  };

  const effectColors: Record<string, string> = {
    fireRate: '#00ff88',
    tripleShot: '#ffaa00',
    laser: '#ff44ff',
    pierce: '#ffff00',
    shield: '#4488ff',
    drone: '#00ccff',
    homing: '#ff8844',
  };

  return (
    <div className="hud">
      {/* Score */}
      <div className="hud-score">分数: {score}</div>

      {/* Combo */}
      {combo >= 3 && (
        <div className="hud-combo">{combo}连击!</div>
      )}

      {/* Wave */}
      <div className="hud-wave">第 {wave} 波</div>

      {/* Effects */}
      <div className="hud-effects">
        {activeEffects.map((e, i) => (
          <div key={i} className="hud-effect" style={{ color: effectColors[e.type] || '#fff' }}>
            {effectNames[e.type] || e.type} {(e.remaining / 60).toFixed(1)}秒
          </div>
        ))}
      </div>

      {/* HP Bar */}
      <div className="hud-hp-container">
        {shieldHp > 0 && (
          <div className="hud-shield-bar">
            <div className="hud-shield-fill" style={{ width: `${(shieldHp / 50) * 100}%` }} />
          </div>
        )}
        <div className="hud-hp-bar">
          <div className="hud-hp-fill" style={{ width: `${hpPercent}%`, background: hpColor }} />
        </div>
        <div className="hud-hp-text">血量: {Math.ceil(hp)} / {maxHp}</div>
      </div>
    </div>
  );
}
