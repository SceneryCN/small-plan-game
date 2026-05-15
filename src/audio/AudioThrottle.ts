const THROTTLE_MS: Record<string, number> = {
  shoot: 50,
  hit: 40,
  combo: 80,
};

const lastPlayed: Record<string, number> = {};

export function shouldThrottle(type: string): boolean {
  const throttle = THROTTLE_MS[type] || 0;
  if (throttle === 0) return false;
  const now = performance.now();
  if (lastPlayed[type] && now - lastPlayed[type] < throttle) return true;
  lastPlayed[type] = now;
  return false;
}
