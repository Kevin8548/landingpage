import React, { useMemo } from "react";
import { motion } from "motion/react";
import { generateNetworkPath } from "../../lib/generateNetworkPath";

interface TimelinePathProps {
  sections: number;
  sectionWidth: number; // ahora viene de fuera
  className?: string;
}

const COLORS = ["#D85A30", "#3B6D11"];

export function TimelinePath({ sections, sectionWidth, className = "" }: TimelinePathProps) {
  const totalWidth = sectionWidth * sections;

  const { pathD, anchors, branches } = useMemo(
    () => generateNetworkPath({ sections, sectionWidth, maxDepth: 2, maxBranches: 60 * sections }),
    [sections, sectionWidth]
  );

  return (
    <div
      className={`absolute ${className}`}
      style={{ width: totalWidth, willChange: "transform", contentVisibility: "auto" }}
    >
      <svg viewBox={`-40 -140 ${totalWidth + 80} 320`} width={totalWidth} height="320" fill="none">
        <path d={pathD} stroke="#D85A30" strokeWidth="3" strokeOpacity="0.35" strokeLinecap="round" />

        <motion.g
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true, amount: 0.1 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
        >
          {branches.map((br, i) => {
            const color = COLORS[br.colorIndex % COLORS.length];
            const depthFade = 1 / (br.depth * 0.6 + 1);
            const showHalo = br.r > 8 && i % 3 === 0;

            return (
              <g key={i} opacity={depthFade}>
                <line
                  x1={br.x1} y1={br.y1} x2={br.x2} y2={br.y2}
                  stroke={color}
                  strokeWidth={Math.max(0.6, br.r * 0.18)}
                  strokeOpacity="0.45"
                />

                {showHalo && (
                  <circle
                    className="node-halo"
                    cx={br.x2} cy={br.y2} r={br.r + 5}
                    fill={color}
                    style={{ animationDelay: `${(i * 0.13) % 2.4}s` }}
                  />
                )}

                {br.filled ? (
                  <circle cx={br.x2} cy={br.y2} r={br.r} fill={color} />
                ) : (
                  <circle cx={br.x2} cy={br.y2} r={br.r} fill="white" stroke={color} strokeWidth="1.8" />
                )}
              </g>
            );
          })}

          {anchors.map((a, i) => (
            <circle key={`anchor-${i}`} cx={a.cx} cy={a.cy} r="2.2" fill="#D85A30" opacity="0.5" />
          ))}
        </motion.g>
      </svg>
    </div>
  );
}