import {
  HiOutlineChartSquareBar,
  HiEye,
  HiEyeOff,
  HiOutlineLightningBolt,
  HiOutlineShieldCheck,
  HiOutlineUserGroup
} from "react-icons/hi";
import { useState, type FormEvent } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import logo from "../assets/logo_light.svg";

const inputClassName =
  "w-full rounded-2xl border border-stone-200 bg-white px-4 py-3 text-sm text-stone-900 outline-none transition focus:border-teal-500 focus:ring-4 focus:ring-teal-100";

export function LoginPage() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const highlights = [
    {
      title: "Vehicle Approvals",
      description: "Review submitted cars quickly and keep the marketplace quality high.",
      icon: HiOutlineShieldCheck
    },
    {
      title: "Account Safety",
      description: "Protect buyers and sellers with cleaner moderation and safer account controls.",
      icon: HiOutlineUserGroup
    },
    {
      title: "Sales Insights",
      description: "See how listings, users, and platform activity are performing at a glance.",
      icon: HiOutlineChartSquareBar
    }
  ];

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsSubmitting(true);
    setError("");

    try {
      await login(email, password);
      navigate("/dashboard", { replace: true });
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : "Login failed.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="min-h-screen">
      <div className="grid min-h-screen w-full lg:grid-cols-[1.25fr_0.85fr]">
        <section className="login-showroom relative overflow-hidden p-8 text-white md:p-12 xl:p-16">
          <div className="absolute inset-0 bg-[linear-gradient(120deg,rgba(14,19,24,0.94)_0%,rgba(14,19,24,0.64)_48%,rgba(14,19,24,0.9)_100%)]" />
          <div className="absolute left-8 top-8 h-56 w-56 rounded-full bg-[rgba(15,118,110,0.22)] blur-3xl" />
          <div className="absolute bottom-10 right-10 h-64 w-64 rounded-full bg-[rgba(180,83,9,0.2)] blur-3xl" />

          <div className="relative flex h-full flex-col justify-center gap-10">
            <div className="space-y-8">
              <div className="space-y-5">
                <div className="inline-flex items-center gap-3 rounded-full border border-white/12 bg-white/10 px-4 py-2 text-xs font-semibold uppercase tracking-[0.28em] text-teal-100 backdrop-blur">
                  <HiOutlineLightningBolt className="text-sm text-emerald-300" />
                  Trusted Marketplace Control
                </div>

                <img src={logo} alt="ReDrive" className="h-50 w-auto max-w-[340px] object-contain" />

                <div className="space-y-4">
                  <h1 className="max-w-2xl font-display text-5xl font-bold tracking-tight text-white md:text-6xl">
                    Business-grade admin control for marketplace operations, compliance, and listing governance.
                  </h1>
                  <p className="max-w-2xl text-base leading-8 text-stone-300">
                    A focused workspace for vehicle approvals, safer accounts, and stronger marketplace trust.
                  </p>
                </div>
              </div>

              <div className="grid gap-4 md:grid-cols-2 2xl:grid-cols-3">
                {highlights.map(({ title, description, icon: Icon }) => (
                  <div
                    key={title}
                    className="rounded-[1.75rem] border border-white/10 bg-white/8 p-5 backdrop-blur-md"
                  >
                    <div className="flex items-center justify-start text-2xl text-teal-100">
                      <Icon />
                    </div>
                    <h2 className="mt-4 font-display text-xl font-semibold">{title}</h2>
                    <p className="mt-3 text-sm leading-6 text-stone-300">{description}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        <section className="flex items-center justify-center border-l border-[var(--line)] bg-[var(--panel)] p-6 md:p-10 xl:p-14">
          <div className="w-full max-w-xl space-y-8">
            <div className="space-y-3">
              <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[var(--brand-strong)]">
                Secure Sign In
              </p>
              <h2 className="font-display text-4xl font-bold tracking-tight text-stone-900">
                Welcome back
              </h2>
              <p className="text-sm leading-7 text-[var(--muted)]">
                Sign in with your admin or super admin account to continue to the moderation dashboard.
              </p>
            </div>

            <form
              onSubmit={handleSubmit}
              className="flex flex-col space-y-5 rounded-[2rem] border border-white/70 bg-[rgba(255,255,255,0.82)] p-6 shadow-lg shadow-stone-950/8 backdrop-blur"
            >
              <div className="flex items-center justify-between rounded-[1.5rem] bg-[rgba(15,118,110,0.08)] px-4 py-3">
                <div>
                  <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-[var(--brand-strong)]">
                    Admin Workspace
                  </p>
                  <p className="mt-1 text-sm text-stone-700">Sign in to continue</p>
                </div>
                <div className="flex items-center justify-center text-[var(--brand-strong)]">
                  <HiOutlineShieldCheck className="text-2xl" />
                </div>
              </div>

              <label className="block space-y-2">
                <span className="text-sm font-semibold text-stone-700">Email</span>
                <input
                  className={inputClassName}
                  type="email"
                  autoComplete="email"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  placeholder="admin@redrive.com"
                  required
                />
              </label>

              <label className="block space-y-2">
                <span className="text-sm font-semibold text-stone-700">Password</span>
                <div className="relative">
                  <input
                    className={`${inputClassName} pr-12`}
                    type={showPassword ? "text" : "password"}
                    autoComplete="current-password"
                    value={password}
                    onChange={(event) => setPassword(event.target.value)}
                    placeholder="Enter password"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((current) => !current)}
                    aria-label={showPassword ? "Hide password" : "Show password"}
                    className="absolute right-3 top-1/2 -translate-y-1/2 rounded-full p-2 text-stone-500 transition hover:bg-stone-100 hover:text-stone-700"
                  >
                    {showPassword ? <HiEyeOff className="text-lg" /> : <HiEye className="text-lg" />}
                  </button>
                </div>
              </label>

              {error ? (
                <div className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
                  {error}
                </div>
              ) : null}

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full rounded-2xl bg-[linear-gradient(135deg,var(--brand-strong),var(--brand))] px-5 py-3 text-sm font-semibold text-white transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {isSubmitting ? "Signing in..." : "Sign in"}
              </button>
            </form>

          </div>
        </section>
      </div>
    </div>
  );
}
