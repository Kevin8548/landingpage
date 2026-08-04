export interface NetworkAnchor {
  cx: number;
  cy: number;
}

export interface NetworkBranch {
  anchorX: number;
  anchorY: number;
  elbowX: number;
  elbowY: number;
  nodeX: number;
  nodeY: number;
  r: number;
  filled: boolean;
  major: boolean;
  colorIndex: number;
  label: string;
}

export interface NetworkGraph {
  pathD: string;
  anchors: NetworkAnchor[];
  branches: NetworkBranch[];
}

interface GenerateOptions {
  sections: number;
  sectionWidth?: number;
  branchLabels?: string[][];
}

/**
 * Creates the timeline from a fixed layout. Keeping the geometry as data (and
 * not using Math.random) makes the network calm, predictable and responsive.
 */
export function generateNetworkPath({
  sections,
  sectionWidth = 1200,
  branchLabels = [],
}: GenerateOptions): NetworkGraph {
  const totalWidth = sectionWidth * sections;
  const anchors: NetworkAnchor[] = [];
  const branches: NetworkBranch[] = [];

  const layout = [
    { anchor: 0.1, elbow: 0.15, node: 0.50, y: -170, r: 8, filled: true, major: true, colorIndex: 0 },
    { anchor: 0.40, elbow: 0.62, node: 0.70, y: 180, r: 5.5, filled: false, major: false, colorIndex: 1 },
  ];

  // Cuánto "dobla" el tronco hacia cada rama al pasar por su anchor.
  const WAVE = 29;

  const trunkPoints: { x: number; y: number }[] = [{ x: 0, y: 0 }];

  for (let section = 0; section < sections; section += 1) {
    const offset = section * sectionWidth;

    layout.forEach((item, branchIndex) => {
      const anchorX = offset + sectionWidth * item.anchor;
      const elbowX = offset + sectionWidth * item.elbow;
      const nodeX = offset + sectionWidth * item.node;
      const dip = item.y < 0 ? -WAVE : WAVE; // mismo lado que la rama

      anchors.push({ cx: anchorX, cy: dip });
      trunkPoints.push({ x: anchorX, y: dip });

      branches.push({
        anchorX,
        anchorY: dip, // la rama nace justo donde el tronco se dobla
        elbowX,
        elbowY: item.y,
        nodeX,
        nodeY: item.y,
        r: item.r,
        filled: item.filled,
        major: item.major,
        colorIndex: item.colorIndex,
        label: branchLabels[section]?.[branchIndex] ?? `HITO ${branchIndex + 1}`,
      });
    });
  }

  trunkPoints.push({ x: totalWidth, y: 0 });

  // Curva suave (Q) que pasa por cada punto, dando el efecto de tronco "vivo".
  let pathD = `M${trunkPoints[0].x},${trunkPoints[0].y}`;
  for (let i = 0; i < trunkPoints.length - 1; i += 1) {
    const p0 = trunkPoints[i];
    const p1 = trunkPoints[i + 1];
    const midX = (p0.x + p1.x) / 2;
    pathD += ` Q${midX},${p0.y} ${p1.x},${p1.y}`;
  }

  return { pathD, anchors, branches };
}