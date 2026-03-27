import {
  HiOutlineClipboardCheck,
  HiOutlineShieldCheck,
  HiOutlineUsers,
  HiOutlineViewGrid
} from "react-icons/hi";
import { NavLink } from "react-router-dom";
import { cn } from "../lib/cn";
import logo from "../assets/logo_light.svg";

const navigation = [
  {
    to: "/dashboard",
    label: "Dashboard",
    hint: "Reports and platform health",
    icon: HiOutlineViewGrid
  },
  {
    to: "/listings",
    label: "Approval Queue",
    hint: "Review and moderate vehicles",
    icon: HiOutlineClipboardCheck
  },
  {
    to: "/users",
    label: "Users",
    hint: "Ban and restore accounts",
    icon: HiOutlineUsers
  },
  {
    to: "/admins",
    label: "Admins",
    hint: "Create and monitor admins",
    icon: HiOutlineShieldCheck
  }
];

export function Sidebar() {
  return (
    <aside className="rounded-[2rem] border border-[var(--line)] bg-[rgba(24,24,27,0.92)] p-5 text-stone-100 shadow-[var(--shadow)]">
      <div className="rounded-[1.5rem] border border-white/10 bg-white/5 p-5">
        <img src={logo} alt="ReDrive" className="h-30 w-auto max-w-[220px] object-contain" />
        <h1 className="mt-2 font-display text-3xl font-bold tracking-tight">Admin Console</h1>
        <p className="mt-3 text-sm leading-6 text-stone-300">
          Oversight for listings, users, reports, and elevated platform actions.
        </p>
      </div>

      <nav className="mt-6 space-y-3">
        {navigation.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            className={({ isActive }) =>
              cn(
                "group block rounded-[1.5rem] border border-white/10 p-4 transition duration-200",
                isActive ? "bg-teal-500/20" : "bg-white/5 hover:bg-white/10"
              )
            }
          >
            {({ isActive }) => (
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="flex items-center gap-3 font-display text-lg font-semibold">
                    <span
                      className={cn(
                        "flex h-10 w-10 items-center justify-center rounded-2xl text-lg",
                        isActive ? "bg-teal-200 text-teal-900" : "bg-white/10 text-stone-200"
                      )}
                    >
                      <item.icon />
                    </span>
                    {item.label}
                  </span>
                  <span
                    className={cn(
                      "rounded-full px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.18em]",
                      isActive ? "bg-teal-200 text-teal-900" : "bg-white/10 text-stone-200"
                    )}
                  >
                    Open
                  </span>
                </div>
                <p className="text-sm leading-6 text-stone-300">{item.hint}</p>
              </div>
            )}
          </NavLink>
        ))}
      </nav>
    </aside>
  );
}
