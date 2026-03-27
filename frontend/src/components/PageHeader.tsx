import type { ReactNode } from "react";
import { cn } from "../lib/cn";

interface PageHeaderProps {
  eyebrow: string;
  title: string;
  description: string;
  actions?: ReactNode;
  className?: string;
}

export function PageHeader({ eyebrow, title, description, actions, className }: PageHeaderProps) {
  return (
    <div
      className={cn(
        "rounded-[2rem] border border-[var(--line)] bg-[var(--panel)] p-6 shadow-[var(--shadow)] backdrop-blur md:p-8",
        className
      )}
    >
      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div className="max-w-2xl space-y-3">
          <p className="text-xs font-semibold uppercase tracking-[0.28em] text-[var(--brand-strong)]">
            {eyebrow}
          </p>
          <div className="space-y-2">
            <h1 className="font-display text-3xl font-bold tracking-tight text-stone-900 md:text-4xl">
              {title}
            </h1>
            <p className="max-w-2xl text-sm leading-7 text-[var(--muted)] md:text-base">{description}</p>
          </div>
        </div>
        {actions ? <div className="flex flex-wrap gap-3">{actions}</div> : null}
      </div>
    </div>
  );
}
