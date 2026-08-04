// src/components/cards/StatCard.tsx
import { Terminal } from "lucide-react";
import { iconMap } from "../../lib/iconMap";

interface StatCardProps {
  icon: string;
  label: string;
  value: string;
  desc: string;
}

export default function StatCard({ icon, label, value, desc }: StatCardProps) {
  const Icon = iconMap[icon] ?? Terminal;

  return (
    <div className="border border-neutral-700 rounded-lg p-6 hover:border-dark-green-primary transition-colors">
      <div className="w-10 h-10 rounded-md border border-dark-green-primary flex items-center justify-center mb-6">
        <Icon size={18} className="text-dark-green-primary" />
      </div>

      <p className="text-xs uppercase tracking-wide text-neutral-400 mb-2">
        {label}
      </p>
      <p className="font-serif text-3xl text-dark-green-primary mb-3">
        {value}
      </p>
      <p className="text-sm text-neutral-400">{desc}</p>
    </div>
  );
}