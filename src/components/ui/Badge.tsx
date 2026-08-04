import React from "react";

type BadgeColor = "orange" | "green" | "neutral";

interface BadgeProps {
  children: React.ReactNode;
  color?: BadgeColor;
  withDot?: boolean;
}

const colorClasses: Record<BadgeColor, string> = {
  orange: "bg-[#D85A30]/15 text-[#D85A30] border-[#D85A30]/30",
  green: "bg-[#3B6D11]/15 text-[#3B6D11] border-[#3B6D11]/30",
  neutral: "bg-white/10 text-white border-white/20",
};

export function Badge({ children, color = "orange", withDot = false }: BadgeProps) {
  return (
    <span
      className={`inline-flex items-center gap-2 rounded-full border px-3 py-1 text-xs font-medium ${colorClasses[color]}`}
    >
      {withDot && (
        <span className="h-2 w-2 rounded-full bg-green-400 shadow-[0_0_6px_#4ade80]" />
      )}
      {children}
    </span>
  );
}