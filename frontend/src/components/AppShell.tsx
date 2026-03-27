import { Outlet, useNavigate } from "react-router-dom";
import { Sidebar } from "./Sidebar";
import { useAuth } from "../context/AuthContext";

export function AppShell() {
  const { logout, session } = useAuth();
  const navigate = useNavigate();

  return (
    <div className="min-h-screen p-4 md:p-6">
      <div className="mx-auto grid max-w-[1600px] gap-6 xl:grid-cols-[310px_minmax(0,1fr)]">
        <Sidebar />

        <main className="space-y-6">
          <header className="rounded-[2rem] border border-[var(--line)] bg-[var(--panel)] px-6 py-5 shadow-[var(--shadow)] backdrop-blur">
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[var(--brand-strong)]">
                  Moderation Workspace
                </p>
                <h2 className="mt-2 font-display text-2xl font-bold tracking-tight text-stone-900">
                  Welcome back, {session?.fullName}
                </h2>
              </div>

              <div className="flex flex-wrap items-center gap-3">
                <div className="rounded-full border border-[var(--line)] bg-white/70 px-4 py-2 text-sm text-stone-700">
                  {session?.role === "SUPER_ADMIN" ? "Super Admin" : "Admin"}
                </div>
                <button
                  type="button"
                  onClick={() => {
                    logout();
                    navigate("/login", { replace: true });
                  }}
                  className="rounded-full bg-stone-900 px-4 py-2 text-sm font-semibold text-white transition hover:bg-stone-700"
                >
                  Sign out
                </button>
              </div>
            </div>
          </header>

          <Outlet />
        </main>
      </div>
    </div>
  );
}
