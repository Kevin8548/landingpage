// components/ui/SocialLinks.tsx
import { IconButton } from "./IconButton";

interface SocialLink {
  icon: React.ReactNode;
  href: string;
  label: string;
}

export function SocialLinks({ links }: { links: SocialLink[] }) {
  return (
    <div className="flex gap-2">
      {links.map((s) => (
        <IconButton key={s.label} {...s} />
      ))}
    </div>
  );
}