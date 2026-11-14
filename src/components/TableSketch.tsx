import React from "react";

interface TableSketchProps {
  top: string;
  frame: string;
  className?: string;
}

/** Darken or lighten a #rrggbb colour by a factor (0.8 = 20% darker). */
const shade = (hex: string, factor: number) => {
  const n = parseInt(hex.slice(1), 16);
  const ch = (v: number) => Math.max(0, Math.min(255, Math.round(v * factor)));
  return `rgb(${ch((n >> 16) & 255)}, ${ch((n >> 8) & 255)}, ${ch(n & 255)})`;
};

/**
 * A simple drawing of a Table LK table (board top on two steel loop legs) that takes
 * the chosen top and frame colours. Used on the home page; the full 3D designer lives at /design.
 */
const TableSketch: React.FC<TableSketchProps> = ({ top, frame, className }) => {
  const fill = { transition: "fill 0.6s cubic-bezier(0.16, 1, 0.3, 1), stroke 0.6s cubic-bezier(0.16, 1, 0.3, 1)" };
  const frameEdge = shade(frame, frame === "#17181b" ? 2.4 : 0.78);
  return (
    <svg viewBox="0 0 540 400" className={className} role="img" aria-label="Drawing of a table in the chosen top and frame colours">
      <ellipse cx="275" cy="352" rx="225" ry="26" fill="rgba(0,0,0,0.28)" />

      {/* back loop leg (right end) */}
      <g fill="none" strokeWidth="11" strokeLinejoin="round" strokeLinecap="square" style={fill} stroke={frame}>
        <path d="M362 96v160l108 56V152" />
      </g>

      {/* top: surface, then the two visible edges */}
      <path d="M60 120 360 70 482 140 182 190Z" fill={top} style={fill} />
      <path d="M60 120 182 190v13L60 133Z" fill={shade(top, 0.74)} style={fill} />
      <path d="M182 190 482 140v13L182 203Z" fill={shade(top, 0.86)} style={fill} />

      {/* front loop leg (left end) */}
      <g fill="none" strokeWidth="11" strokeLinejoin="round" strokeLinecap="square" style={fill} stroke={frame}>
        <path d="M74 138v160l108 56V203" />
      </g>
      <g fill="none" strokeWidth="2" strokeLinecap="round" style={fill} stroke={frameEdge} opacity="0.55">
        <path d="M70 142v154M178 208v142" />
      </g>
    </svg>
  );
};

export default TableSketch;
