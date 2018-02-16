export function clamp(num: number, min: number, max: number): number {
  return Math.min(Math.max(num, min), max);
}

export function linearInterpolation(p1: {x: number; y: number}, p2: {x: number; y: number}, k: number): {x: number; y: number} {
  if (k < 0 || k > 1) {
    throw new Error('Linear Interpolation formula expects a percentage');
  }

  return {
    x: (1 - k) * p1.x + k * p2.x,
    y: (1 - k) * p1.y + k * p2.y,
  };
}
