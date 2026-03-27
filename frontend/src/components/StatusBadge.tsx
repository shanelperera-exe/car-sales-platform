import { cn } from "../lib/cn";

interface StatusBadgeProps {
  value: string;
}

const toneMap: Record<string, string> = {
  ACTIVE: "bg-emerald-100 text-emerald-800",
  PENDING_APPROVAL: "bg-amber-100 text-amber-900",
  REJECTED: "bg-rose-100 text-rose-700",
  BANNED: "bg-stone-200 text-stone-700",
  SOLD: "bg-slate-200 text-slate-700",
  RESERVED: "bg-sky-100 text-sky-800",
  ADMIN: "bg-teal-100 text-teal-800",
  SUPER_ADMIN: "bg-cyan-100 text-cyan-800",
  BUYER: "bg-orange-100 text-orange-800",
  SELLER: "bg-violet-100 text-violet-800",
  SUCCESS: "bg-emerald-100 text-emerald-700",
  FAILED: "bg-rose-100 text-rose-700"
};

function titleize(value: string) {
  return value
    .toLowerCase()
    .split("_")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

export function StatusBadge({ value }: StatusBadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold tracking-wide",
        toneMap[value] ?? "bg-stone-200 text-stone-700"
      )}
    >
      {titleize(value)}
    </span>
  );
}
