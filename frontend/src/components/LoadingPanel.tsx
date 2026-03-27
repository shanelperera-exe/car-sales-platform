export function LoadingPanel() {
  return (
    <div className="rounded-[1.75rem] border border-[var(--line)] bg-[var(--panel)] p-8 shadow-[var(--shadow)]">
      <div className="space-y-4">
        <div className="h-4 w-28 animate-pulse rounded-full bg-stone-200" />
        <div className="h-8 w-64 animate-pulse rounded-full bg-stone-200" />
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {Array.from({ length: 4 }).map((_, index) => (
            <div key={index} className="h-32 animate-pulse rounded-[1.5rem] bg-stone-200/80" />
          ))}
        </div>
      </div>
    </div>
  );
}
