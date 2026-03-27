interface EmptyStateProps {
  title: string;
  description: string;
}

export function EmptyState({ title, description }: EmptyStateProps) {
  return (
    <div className="rounded-[1.5rem] border border-dashed border-[var(--line)] bg-white/40 p-10 text-center">
      <h3 className="font-display text-xl font-bold text-stone-900">{title}</h3>
      <p className="mt-3 text-sm leading-6 text-[var(--muted)]">{description}</p>
    </div>
  );
}
