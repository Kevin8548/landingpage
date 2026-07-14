import React from "react";

interface IconButtonProps {
  icon: React.ReactNode;
  href: string;
  label: string;
}

export function IconButton({ icon, href, label }: IconButtonProps) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      aria-label={label}
      className="flex h-9 w-9 items-center justify-center rounded-lg border border-white/15 bg-white/5 text-white transition-all duration-200 hover:-translate-y-0.5 hover:bg-[#D85A30]"
    >
      {icon}
    </a>
  );
}