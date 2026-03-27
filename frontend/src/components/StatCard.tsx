import type { IconType } from "react-icons";

interface StatCardProps {
  label: string;
  value: string;
  note: string;
  icon: IconType;
}

export function StatCard({ label, value, note, icon: Icon }: StatCardProps) {
  return (
    <article className="rounded-[1.75rem] border border-[var(--line)] bg-[var(--panel-strong)] p-5 shadow-[var(--shadow)] backdrop-blur transition-transform duration-200 hover:-translate-y-1">
      <div className="flex items-start justify-between gap-4">
        <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[var(--brand-strong)]">{label}</p>
        <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-teal-50 text-xl text-[var(--brand-strong)]">
          <Icon />
        </span>
      </div>
      <p className="mt-4 font-display text-3xl font-bold tracking-tight text-stone-900">{value}</p>
      <p className="mt-3 text-sm leading-6 text-[var(--muted)]">{note}</p>
    </article>
  );
}
