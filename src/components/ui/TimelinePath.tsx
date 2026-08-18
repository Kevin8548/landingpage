import { useMemo } from "react";
import { motion, useTransform, type MotionValue } from "motion/react";
import { generateNetworkPath, type NetworkBranch } from "../../lib/generateNetworkPath";

interface TimelinePathProps {
  sections: number;
  sectionLabels?: string[];
  branchLabels?: string[][];
  sectionWidth: number;
  progress: MotionValue<number>;
  className?: string;
}

// The whole network deliberately uses only these two accent colors.
const COLORS = ["#FFB703", "#196700"];
const NARANJA = COLORS[0];
const FONDO = "#0c1422";

interface MiniBranch {
  x1: number;
  y1: number;
  x2: number;
  y2: number;
  colorIndex: number;
  r: number;
}

// Detalles fijos: tres mini-ramas por sección, ancladas a puntos ya existentes.
const MINI_BRANCH_OFFSETS = [
  { source: "majorAnchor", dx: -32, dy: -24, colorIndex: 1, r: 2.4 },
  { source: "majorNode", dx: 34, dy: 20, colorIndex: 0, r: 2.1 },
  { source: "minorNode", dx: 26, dy: -22, colorIndex: 1, r: 2.0 },
] as const;

export function TimelinePath({
  sections,
  sectionLabels,
  branchLabels,
  sectionWidth,
  progress,
  className = "",
}: TimelinePathProps) {
  const totalWidth = sectionWidth * sections;
  const { pathD, branches } = useMemo(
    () => generateNetworkPath({ sections, sectionWidth, branchLabels }),
    [sections, sectionWidth, branchLabels]
  );
  const miniBranches = useMemo(() => createMiniBranches(branches), [branches]);

  return (
    <div
      className={`absolute ${className}`}
      style={{ width: totalWidth, willChange: "transform", contentVisibility: "auto" }}
    >
      <svg
        viewBox={`-24 -220 ${totalWidth + 48} 440`}
        width={totalWidth}
        height="440"
        preserveAspectRatio="none"
        className="h-[calc(100dvh-120px)] max-h-[440px] md:h-[370px] md:max-h-none"
        fill="none"
      >
        <defs>
          <filter id="timeline-glow" x="-80%" y="-120%" width="260%" height="340%">
            <feGaussianBlur stdDeviation="3" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        {/* Rama/tronco principal: mismo trazo con dips que ya calcula generateNetworkPath */}
        <MainTrunk pathD={pathD} totalWidth={totalWidth} progress={progress} />

        <MiniBranchesLayer miniBranches={miniBranches} />

        {branches.map((branch, index) => (
          <AnimatedBranch
            key={`${branch.nodeX}-${branch.nodeY}`}
            branch={branch}
            branchIndex={index % 2}
            section={Math.floor(index / 2)}
            sections={sections}
            progress={progress}
          />
        ))}
      </svg>
    </div>
  );
}

function createMiniBranches(branches: NetworkBranch[]): MiniBranch[] {
  const miniBranches: MiniBranch[] = [];

  for (let index = 0; index < branches.length; index += 2) {
    const major = branches[index];
    const minor = branches[index + 1];
    if (!major || !minor) continue;

    MINI_BRANCH_OFFSETS.forEach((detail) => {
      const source = detail.source === "majorAnchor"
        ? { x: major.anchorX, y: major.anchorY }
        : detail.source === "majorNode"
          ? { x: major.nodeX, y: major.nodeY }
          : { x: minor.nodeX, y: minor.nodeY };

      miniBranches.push({
        x1: source.x,
        y1: source.y,
        x2: source.x + detail.dx,
        y2: source.y + detail.dy,
        colorIndex: detail.colorIndex,
        r: detail.r,
      });
    });
  }

  return miniBranches;
}

function MiniBranchesLayer({ miniBranches }: { miniBranches: MiniBranch[] }) {
  return (
    <g aria-hidden="true" className="hidden md:inline">
      {miniBranches.map((branch, index) => {
        const color = COLORS[branch.colorIndex];

        return (
          <g key={`mini-${index}`} opacity="0.7">
            <line
              x1={branch.x1}
              y1={branch.y1}
              x2={branch.x2}
              y2={branch.y2}
              stroke={color}
              strokeWidth="1.2"
              strokeLinecap="round"
            />
            <circle cx={branch.x2} cy={branch.y2} r={branch.r} fill={color} />
          </g>
        );
      })}
    </g>
  );
}

function MainTrunk({
  pathD,
  totalWidth,
  progress,
}: {
  pathD: string;
  totalWidth: number;
  progress: MotionValue<number>;
}) {
  const dashLength = totalWidth + 40;
  const dashOffset = useTransform(progress, [0, 1], [dashLength, 0]);

  // El octágono de inicio aparece casi de inmediato; el final, cuando el scroll termina.
  const startOpacity = useTransform(progress, [0, 0.03], [0, 1]);
  const endOpacity = useTransform(progress, [0.94, 1], [0, 1]);

  return (
    <>
      <motion.path
        d={pathD}
        stroke={NARANJA}
        strokeWidth="2"
        strokeOpacity="0.72"
        strokeLinecap="round"
        strokeDasharray={dashLength}
        style={{ strokeDashoffset: dashOffset }}
        filter="url(#timeline-glow)"
      />

      <motion.g style={{ opacity: startOpacity }} filter="url(#timeline-glow)">
        <polygon points={octagonPoints(0, 0, 11)} fill={FONDO} stroke={NARANJA} strokeWidth="2" />
      </motion.g>

      <motion.g style={{ opacity: endOpacity }} filter="url(#timeline-glow)">
        <polygon points={octagonPoints(totalWidth, 0, 11)} fill={NARANJA} stroke={NARANJA} strokeWidth="2" />
      </motion.g>
    </>
  );
}

function octagonPoints(cx: number, cy: number, r: number): string {
  return Array.from({ length: 8 }, (_, i) => {
    const angle = (Math.PI / 4) * i + Math.PI / 8; // rotado para que quede "plano" arriba/abajo
    return `${cx + r * Math.cos(angle)},${cy + r * Math.sin(angle)}`;
  }).join(" ");
}

function revealWindow(section: number, branchIndex: number, sections: number): [number, number] {
  const step = 1 / Math.max(sections - 1, 1);
  const start = Math.max(0, (section - 0.55) * step + branchIndex * step * 0.18);
  const end = Math.min(1, start + step * 0.48);
  return [start, end];
}

const OFFSET_GREEN = -208;

function AnimatedBranch({
  branch,
  branchIndex,
  section,
  sections,
  progress,
}: {
  branch: NetworkBranch;
  branchIndex: number;
  section: number;
  sections: number;
  progress: MotionValue<number>;
}) {
  const [start, end] = revealWindow(section, branchIndex, sections);

  const offsetX = branch.colorIndex === 1 ? OFFSET_GREEN : 0;
  const elbowX = branch.elbowX + offsetX; // 👈 ahora también se mueve
  const nodeX = branch.nodeX + offsetX;

  const diagonalLength = Math.hypot(elbowX - branch.anchorX, branch.elbowY - branch.anchorY);
  const length = diagonalLength + Math.abs(nodeX - elbowX);
  const dashOffset = useTransform(progress, [start, end], [length, 0]);
  const anchorOpacity = useTransform(progress, [start, Math.min(end, start + 0.02)], [0, 1]);
  const nodeOpacity = useTransform(progress, [Math.max(start, end - 0.025), end], [0, 1]);
  const color = COLORS[branch.colorIndex];

  return (
    <g>
      <motion.path
        d={`M${branch.anchorX},${branch.anchorY} L${elbowX},${branch.elbowY} H${nodeX}`}
        stroke={color}
        strokeWidth="1.35"
        strokeOpacity="0.7"
        strokeLinecap="round"
        strokeDasharray={length}
        style={{ strokeDashoffset: dashOffset }}
      />

      <motion.circle
        cx={branch.anchorX}
        cy={branch.anchorY}
        r="2.5"
        fill={NARANJA}
        style={{ opacity: anchorOpacity }}
      />

      <motion.g style={{ opacity: nodeOpacity }}>
        {branch.filled ? (
          <circle
            cx={nodeX}
            cy={branch.nodeY}
            r={branch.r}
            fill={color}
            filter={branch.major ? "url(#timeline-glow)" : undefined}
          />
        ) : (
          <circle
            cx={nodeX}
            cy={branch.nodeY}
            r={branch.r}
            fill={FONDO}
            stroke={color}
            strokeWidth="1.7"
            filter="url(#timeline-glow)"
          />
        )}
        <text
          className="hidden md:inline"
          x={nodeX + branch.r + 10}
          y={branch.nodeY + 4}
          fill="#E5EEF5"
          fontSize="11"
          fontWeight="600"
          letterSpacing="0.35"
        >
          {branch.label.toUpperCase()}
        </text>
      </motion.g>
    </g>
  );
}