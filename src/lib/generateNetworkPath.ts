export interface NetworkAnchor {
  cx: number;
  cy: number;
}

export interface NetworkBranch {
  x1: number;
  y1: number;
  x2: number;
  y2: number;
  r: number;
  filled: boolean;
  depth: number;
  colorIndex: number;
}

export interface NetworkGraph {
  pathD: string;
  anchors: NetworkAnchor[];
  branches: NetworkBranch[];
}

interface GenerateOptions {
  sections: number;
  sectionWidth?: number;
  anchorsPerSection?: number;
  maxDepth?: number;
  maxBranches?: number; // tope duro, protege el rendimiento
}

function randomRadius(depth: number): number {
  const rand = Math.random();
  let base: number;
  if (rand < 0.5) base = 2 + Math.random() * 2;
  else if (rand < 0.85) base = 4 + Math.random() * 3;
  else base = 8 + Math.random() * 6;
  return base / (depth + 1);
}

export function generateNetworkPath({
  sections,
  sectionWidth = 1200,
  anchorsPerSection = 6,
  maxDepth = 2,
  maxBranches = 120,
}: GenerateOptions): NetworkGraph {
  const totalWidth = sectionWidth * sections;
  const totalAnchors = anchorsPerSection * sections;
  const step = totalWidth / (totalAnchors - 1);

  const anchors: NetworkAnchor[] = Array.from({ length: totalAnchors }, (_, i) => ({
    cx: i * step,
    cy: 30 + Math.sin(i * 1.2) * 12,
  }));

  let pathD = `M${anchors[0].cx},${anchors[0].cy}`;
  for (let i = 0; i < anchors.length - 1; i++) {
    const p0 = anchors[i - 1] || anchors[i];
    const p1 = anchors[i];
    const p2 = anchors[i + 1];
    const p3 = anchors[i + 2] || p2;
    const cp1x = p1.cx + (p2.cx - p0.cx) / 6;
    const cp1y = p1.cy + (p2.cy - p0.cy) / 6;
    const cp2x = p2.cx - (p3.cx - p1.cx) / 6;
    const cp2y = p2.cy - (p3.cy - p1.cy) / 6;
    pathD += ` C${cp1x},${cp1y} ${cp2x},${cp2y} ${p2.cx},${p2.cy}`;
  }

  const branches: NetworkBranch[] = [];

  function spawnBranch(originX: number, originY: number, depth: number, colorIndex: number) {
    if (depth > maxDepth || branches.length >= maxBranches) return;

    const angleUp = Math.random() > 0.5;
    const spread = 120 / (depth + 1);
    const dx = (Math.random() - 0.5) * spread;
    const distance = (25 + Math.random() * 70) / (depth + 0.6);
    const dy = angleUp ? -distance : distance;
    const x2 = originX + dx;
    const y2 = originY + dy;

    branches.push({
      x1: originX,
      y1: originY,
      x2,
      y2,
      r: randomRadius(depth),
      filled: Math.random() > 0.35,
      depth,
      colorIndex,
    });

    if (depth < maxDepth && branches.length < maxBranches && Math.random() > 0.3 + depth * 0.25) {
      const numChildren = 1 + Math.floor(Math.random() * 2);
      for (let c = 0; c < numChildren && branches.length < maxBranches; c++) {
        spawnBranch(x2, y2, depth + 1, colorIndex);
      }
    }
  }

  for (const [ai, a] of anchors.entries()) {
    if (branches.length >= maxBranches) break;
    const numRootBranches = 1 + Math.floor(Math.random() * 3);
    for (let b = 0; b < numRootBranches && branches.length < maxBranches; b++) {
      spawnBranch(a.cx, a.cy, 0, (ai + b) % 2);
    }
  }

  return { pathD, anchors, branches };
}