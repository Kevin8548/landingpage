// src/components/cards/JobCard.tsx
import { Briefcase } from "lucide-react";
import { iconMap } from "../../lib/iconMap";

interface JobCardProps {
  icon: string;
  titulo: string;
  desc: string;
}

export default function JobCard({ icon, titulo, desc }: JobCardProps) {
  const Icon = iconMap[icon] ?? Briefcase;

  return (
    <div className="border border-neutral-700 rounded-lg p-5 flex gap-4">
      <div className="w-9 h-9 rounded-md bg-dark-orange-primary/10 border border-dark-orange-primary flex items-center justify-center shrink-0">
        <Icon size={16} className="text-dark-orange-primary" />
      </div>
      <div>
        <p className="font-serif font-bold text-lg mb-1">{titulo}</p>
        <p className="text-sm text-neutral-400">{desc}</p>
      </div>
    </div>
  );
}