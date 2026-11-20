import type { ReactNode } from "react";

/** A 2:1 isometric box. (cx, cy) is the centre of its base diamond; hw is half the width. */
export function IsoBox({
  cx,
  cy,
  hw,
  height,
  top,
  left,
  right,
  stroke,
}: {
  cx: number;
  cy: number;
  hw: number;
  height: number;
  top: string;
  left: string;
  right: string;
  stroke?: string;
}) {
  const hh = hw / 2;
  const t = cy - height;
  const pts = (p: number[][]) => p.map((q) => q.join(",")).join(" ");
  const common = { stroke: stroke ?? "none", strokeWidth: 1, strokeLinejoin: "round" as const };
  return (
    <g>
      <polygon points={pts([[cx - hw, t], [cx, t + hh], [cx, cy + hh], [cx - hw, cy]])} fill={left} {...common} />
      <polygon points={pts([[cx, t + hh], [cx + hw, t], [cx + hw, cy], [cx, cy + hh]])} fill={right} {...common} />
      <polygon points={pts([[cx, t - hh], [cx + hw, t], [cx, t + hh], [cx - hw, t]])} fill={top} {...common} />
    </g>
  );
}

export function Float({
  children,
  delay = 0,
  distance = 8,
}: {
  children: ReactNode;
  delay?: number;
  distance?: number;
}) {
  return (
    <g
      className="iso-float"
      style={{ animationDelay: `${delay}s`, ["--float" as string]: `${distance}px` }}
    >
      {children}
    </g>
  );
}
