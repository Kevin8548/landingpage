// src/lib/iconMap.ts
import {
  Terminal, Code, Shield, Server, Palette, Cpu, Briefcase,
  Cloud, Database, Smartphone, ChartBar, ShieldAlert, Brain,
  Video, Megaphone, Gamepad2, type LucideIcon,
} from "lucide-react";

export const iconMap: Record<string, LucideIcon> = {
  terminal: Terminal,
  code: Code,
  shield: Shield,
  server: Server,
  palette: Palette,
  cpu: Cpu,
  briefcase: Briefcase,
  cloud: Cloud,
  database: Database,
  smartphone: Smartphone,
  "chart-bar": ChartBar,
  "shield-alert": ShieldAlert,
  brain: Brain,
  video: Video,
  megaphone: Megaphone,
  gamepad: Gamepad2,
  vr: Cpu, // fallback, no existe ícono VR nativo en lucide
};