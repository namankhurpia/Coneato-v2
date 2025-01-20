import React from 'react';

/** Which team. */
type Team = 'A' | 'B';

/**
 * Props for our triangle icon:
 * - `team`: 'A' or 'B'
 * - `size`: 1..4
 * - `scale` (optional): scale factor for the overall icon size (e.g. 0.8 for inventory).
 */
interface TriangleIconProps {
  team: Team;
  size: number;
  scale?: number;
}

const TriangleIcon: React.FC<TriangleIconProps> = ({ team, size, scale = 1 }) => {
  // Pick fill color (blue for A, red for B)
  const fillColor = team === 'A' ? '#2196F3' : '#F44336';

  /**
   * We'll interpret size=1..4 as a fraction of full height (1..4 => 0.25..1).
   * E.g. size=4 => fraction=1 => tall triangle from top(0) to base(100).
   * E.g. size=1 => fraction=0.25 => short triangle with top at y=75, base at y=100.
   */
  const fraction = size / 4;

  // The "top" of the triangle moves upward with fraction.
  // - For size=4, topY=0 (very top of the viewBox).
  // - For size=1, topY=75 (shorter triangle).
  const topY = 100 - 100 * fraction; // moves from 100..0

  // Triangle width also scales with fraction. Full width=100 => halfWidth=50
  const halfWidth = 50 * fraction;
  const leftX = 50 - halfWidth;
  const rightX = 50 + halfWidth;
  const polygonPoints = `${50},${topY} ${leftX},100 ${rightX},100`;

  /**
   * We want the number near the base for all cones, so let's place the text
   * at a fixed y=90 or 88 (slightly above 100). This ensures numbers line up horizontally.
   */
  const textY = 82; // move this up/down to taste (e.g. 85..92).

  /**
   * Font size scales so the text isn't too big for a small cone.
   * For fraction=1 (size=4), let's go bigger. For fraction=0.25 (size=1), smaller.
   */
  const fontSize = 18 + 10 * fraction; // e.g. 14..24

  /**
   * The overall SVG is 0..100 in each direction, but we decide final pixel size with 'baseDim * scale'.
   */
  const baseDim = 70;
  const finalDim = baseDim * scale;

  return (
    <svg
      width={finalDim}
      height={finalDim}
      viewBox="0 0 100 100"
      style={{ display: 'block' }}
    >
      {/* The triangle itself: base is always at y=100, top depends on fraction */}
      <polygon points={polygonPoints} fill={fillColor} />

    </svg>
  );
};

export default TriangleIcon;
