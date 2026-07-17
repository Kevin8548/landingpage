// src/components/sections/detail/WhyChooseSection.tsx
import StatCard from "../../cards/StatCard";

interface Stat {
  icon: string;
  label: string;
  value: string;
  desc: string;
}

interface WhyChooseSectionProps {
  stats: Stat[];
}

export default function WhyChooseSection({ stats }: WhyChooseSectionProps) {
  return (
    <section className="py-24 px-6 md:px-16">
      <h2 className="font-serif text-4xl mb-4">
        ¿Por qué elegir esta carrera?
      </h2>
      <p className="text-neutral-400 max-w-2xl mb-12">
        Formamos líderes técnicos capaces de transformar ideas complejas en
        soluciones digitales robustas y escalables.
      </p>

      <div
        className="grid gap-6"
        style={{
          gridTemplateColumns: `repeat(auto-fit, minmax(220px, 1fr))`,
        }}
      >
        {stats.map((stat) => (
          <StatCard key={stat.label} {...stat} />
        ))}
      </div>
    </section>
  );
}