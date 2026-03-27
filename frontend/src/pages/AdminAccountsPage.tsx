import { HiOutlinePencilAlt, HiOutlinePlusCircle, HiOutlineShieldCheck } from "react-icons/hi";
import { useEffect, useState, type FormEvent } from "react";
import { ErrorBanner } from "../components/ErrorBanner";
import { EmptyState } from "../components/EmptyState";
import { PageHeader } from "../components/PageHeader";
import { SectionCard } from "../components/SectionCard";
import { StatusBadge } from "../components/StatusBadge";
import { useAuth } from "../context/AuthContext";
import { createAdminAccount, getAdminAccounts, updateMyAdminAccount } from "../lib/api";
import { formatDateTime } from "../lib/format";
import logo from "../assets/logo_light.svg";
import type { AdminAccount, AdminProfileUpdateRequest, AdminRegistrationRequest } from "../types/api";

const inputClassName =
  "w-full rounded-2xl border border-stone-200 bg-white px-4 py-3 text-sm text-stone-900 outline-none transition focus:border-teal-500 focus:ring-4 focus:ring-teal-100";

const initialForm: AdminRegistrationRequest = {
  firstName: "",
  lastName: "",
  email: "",
  password: "",
  phone: "",
  location: "",
  role: "ADMIN"
};

const initialProfileForm: AdminProfileUpdateRequest = {
  firstName: "",
  lastName: "",
  email: "",
  phone: "",
  location: "",
  password: ""
};

export function AdminAccountsPage() {
  const { isSuperAdmin, session, updateSession } = useAuth();
  const [accounts, setAccounts] = useState<AdminAccount[]>([]);
  const [form, setForm] = useState<AdminRegistrationRequest>(initialForm);
  const [profileForm, setProfileForm] = useState<AdminProfileUpdateRequest>(initialProfileForm);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSavingProfile, setIsSavingProfile] = useState(false);
  const [error, setError] = useState("");
  const [createSuccessMessage, setCreateSuccessMessage] = useState("");
  const [profileSuccessMessage, setProfileSuccessMessage] = useState("");

  useEffect(() => {
    if (!session) {
      return;
    }

    const adminId = session.id;
    let isMounted = true;

    async function loadAccounts() {
      setIsLoading(true);
      setError("");

      try {
        const response = await getAdminAccounts(adminId);

        if (isMounted) {
          setAccounts(response);
          const myAccount = response.find((account) => account.id === adminId);
          if (myAccount) {
            setProfileForm({
              firstName: myAccount.firstName,
              lastName: myAccount.lastName,
              email: myAccount.email,
              phone: myAccount.phone ?? "",
              location: myAccount.location ?? "",
              password: ""
            });
          }
        }
      } catch (loadError) {
        if (isMounted) {
          setError(loadError instanceof Error ? loadError.message : "Admin accounts could not be loaded.");
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    }

    loadAccounts();

    return () => {
      isMounted = false;
    };
  }, [session]);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!session) {
      return;
    }

    setIsSubmitting(true);
    setError("");
    setCreateSuccessMessage("");
    setProfileSuccessMessage("");

    try {
      const createdAccount = await createAdminAccount(session.id, form);
      setAccounts((current) => [createdAccount, ...current]);
      setForm(initialForm);
      setCreateSuccessMessage(`${createdAccount.firstName} ${createdAccount.lastName} was added successfully.`);
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : "Admin account could not be created.");
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleProfileSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!session) {
      return;
    }

    setIsSavingProfile(true);
    setError("");
    setProfileSuccessMessage("");
    setCreateSuccessMessage("");

    try {
      const payload: AdminProfileUpdateRequest = {
        firstName: profileForm.firstName,
        lastName: profileForm.lastName,
        email: profileForm.email,
        phone: profileForm.phone,
        location: profileForm.location,
        password: profileForm.password?.trim() ? profileForm.password.trim() : undefined
      };

      const updated = await updateMyAdminAccount(session.id, payload);

      setAccounts((current) =>
        current.map((account) => (account.id === updated.id ? updated : account))
      );
      setProfileForm({
        firstName: updated.firstName,
        lastName: updated.lastName,
        email: updated.email,
        phone: updated.phone ?? "",
        location: updated.location ?? "",
        password: ""
      });
      updateSession({
        fullName: `${updated.firstName} ${updated.lastName}`,
        email: updated.email,
        role: updated.role,
        accountStatus: updated.accountStatus
      });
      setProfileSuccessMessage("Your admin profile has been updated.");
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : "Your profile could not be updated.");
    } finally {
      setIsSavingProfile(false);
    }
  }

  const myAccount = accounts.find((account) => account.id === session?.id);

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Admin Accounts"
        title="Administrative permissions and account creation"
        description="Review existing admin users and create new operational or super admin accounts when elevated access allows it."
      />

      {error ? <ErrorBanner message={error} /> : null}

      <div className="grid gap-6 xl:grid-cols-[1fr_0.95fr]">
        <SectionCard
          title="Admin directory"
          description="All current admin and super admin accounts registered in the platform."
        >
          {isLoading ? (
            <div className="grid gap-4 md:grid-cols-2">
              {Array.from({ length: 4 }).map((_, index) => (
                <div key={index} className="h-44 animate-pulse rounded-[1.75rem] bg-stone-200/80" />
              ))}
            </div>
          ) : accounts.length > 0 ? (
            <div className="grid gap-4 md:grid-cols-2">
              {accounts.map((account) => (
                <article key={account.id} className="rounded-[1.75rem] bg-white/60 p-5">
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div>
                      <h2 className="flex items-center gap-2 font-display text-xl font-bold text-stone-900">
                        <HiOutlineShieldCheck className="text-lg text-[var(--brand-strong)]" />
                        {account.firstName} {account.lastName}
                      </h2>
                      <p className="mt-2 text-sm text-stone-600">{account.email}</p>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      <StatusBadge value={account.role} />
                      <StatusBadge value={account.accountStatus} />
                    </div>
                  </div>

                  <div className="mt-5 space-y-2 text-sm text-stone-600">
                    <p>Phone: {account.phone || "Not provided"}</p>
                    <p>Location: {account.location || "Not provided"}</p>
                    <p>Created: {formatDateTime(account.createdAt)}</p>
                  </div>
                </article>
              ))}
            </div>
          ) : (
            <EmptyState
              title="No admin accounts found"
              description="Create the first operational admin once a super admin is available."
            />
          )}
        </SectionCard>

        <div className="space-y-6">
          <SectionCard
            title="My admin profile"
            description="Update your own account details and keep your contact information current."
          >
            {isLoading ? (
              <div className="h-56 animate-pulse rounded-[1.75rem] bg-stone-200/80" />
            ) : myAccount ? (
              <form onSubmit={handleProfileSubmit} className="space-y-4">
                <div className="grid gap-4 md:grid-cols-2">
                  <label className="space-y-2">
                    <span className="text-sm font-semibold text-stone-700">First name</span>
                    <input
                      className={inputClassName}
                      value={profileForm.firstName}
                      onChange={(event) =>
                        setProfileForm((current) => ({ ...current, firstName: event.target.value }))
                      }
                      required
                    />
                  </label>

                  <label className="space-y-2">
                    <span className="text-sm font-semibold text-stone-700">Last name</span>
                    <input
                      className={inputClassName}
                      value={profileForm.lastName}
                      onChange={(event) =>
                        setProfileForm((current) => ({ ...current, lastName: event.target.value }))
                      }
                      required
                    />
                  </label>
                </div>

                <label className="space-y-2">
                  <span className="text-sm font-semibold text-stone-700">Email</span>
                  <input
                    className={inputClassName}
                    type="email"
                    value={profileForm.email}
                    onChange={(event) =>
                      setProfileForm((current) => ({ ...current, email: event.target.value }))
                    }
                    required
                  />
                </label>

                <div className="grid gap-4 md:grid-cols-2">
                  <label className="space-y-2">
                    <span className="text-sm font-semibold text-stone-700">Phone</span>
                    <input
                      className={inputClassName}
                      value={profileForm.phone}
                      onChange={(event) =>
                        setProfileForm((current) => ({ ...current, phone: event.target.value }))
                      }
                    />
                  </label>

                  <label className="space-y-2">
                    <span className="text-sm font-semibold text-stone-700">Location</span>
                    <input
                      className={inputClassName}
                      value={profileForm.location}
                      onChange={(event) =>
                        setProfileForm((current) => ({ ...current, location: event.target.value }))
                      }
                    />
                  </label>
                </div>

                <label className="space-y-2">
                  <span className="text-sm font-semibold text-stone-700">New password (optional)</span>
                  <input
                    className={inputClassName}
                    type="password"
                    minLength={8}
                    value={profileForm.password ?? ""}
                    onChange={(event) =>
                      setProfileForm((current) => ({ ...current, password: event.target.value }))
                    }
                    placeholder="Leave blank to keep current password"
                  />
                </label>

                {profileSuccessMessage ? (
                  <div className="rounded-2xl border border-teal-200 bg-teal-50 px-4 py-3 text-sm text-teal-800">
                    {profileSuccessMessage}
                  </div>
                ) : null}

                <button
                  type="submit"
                  disabled={isSavingProfile}
                  className="inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-teal-700 px-5 py-3 text-sm font-semibold text-white transition hover:bg-teal-600 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  <HiOutlinePencilAlt className="text-lg" />
                  {isSavingProfile ? "Saving profile..." : "Save my details"}
                </button>
              </form>
            ) : (
              <EmptyState
                title="Your profile is not available"
                description="Refresh the page once. If it persists, check whether your admin session is valid."
              />
            )}
          </SectionCard>

          <SectionCard
            title="Create admin account"
            description="This action demonstrates the super admin inheritance path and elevated platform privileges."
          >
            {isSuperAdmin ? (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="flex flex-col gap-3 rounded-[1.75rem] border border-stone-200 bg-stone-950 px-6 py-5 sm:flex-row sm:items-center sm:gap-4">
                  <img src={logo} alt="ReDrive" className="h-12 w-auto max-w-[220px] object-contain" />
                  <p className="text-sm leading-6 text-stone-300">
                    Register a new admin identity for the moderation workspace.
                  </p>
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                  <label className="space-y-2">
                    <span className="text-sm font-semibold text-stone-700">First name</span>
                    <input
                      className={inputClassName}
                      value={form.firstName}
                      onChange={(event) => setForm((current) => ({ ...current, firstName: event.target.value }))}
                      required
                    />
                  </label>

                  <label className="space-y-2">
                    <span className="text-sm font-semibold text-stone-700">Last name</span>
                    <input
                      className={inputClassName}
                      value={form.lastName}
                      onChange={(event) => setForm((current) => ({ ...current, lastName: event.target.value }))}
                      required
                    />
                  </label>
                </div>

                <label className="space-y-2">
                  <span className="text-sm font-semibold text-stone-700">Email</span>
                  <input
                    className={inputClassName}
                    type="email"
                    value={form.email}
                    onChange={(event) => setForm((current) => ({ ...current, email: event.target.value }))}
                    required
                  />
                </label>

                <div className="grid gap-4 md:grid-cols-2">
                  <label className="space-y-2">
                    <span className="text-sm font-semibold text-stone-700">Password</span>
                    <input
                      className={inputClassName}
                      type="password"
                      value={form.password}
                      onChange={(event) => setForm((current) => ({ ...current, password: event.target.value }))}
                      minLength={8}
                      required
                    />
                  </label>

                  <label className="space-y-2">
                    <span className="text-sm font-semibold text-stone-700">Role</span>
                    <select
                      className={inputClassName}
                      value={form.role}
                      onChange={(event) =>
                        setForm((current) => ({
                          ...current,
                          role: event.target.value as AdminRegistrationRequest["role"]
                        }))
                      }
                    >
                      <option value="ADMIN">Admin</option>
                      <option value="SUPER_ADMIN">Super Admin</option>
                    </select>
                  </label>
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                  <label className="space-y-2">
                    <span className="text-sm font-semibold text-stone-700">Phone</span>
                    <input
                      className={inputClassName}
                      value={form.phone}
                      onChange={(event) => setForm((current) => ({ ...current, phone: event.target.value }))}
                    />
                  </label>

                  <label className="space-y-2">
                    <span className="text-sm font-semibold text-stone-700">Location</span>
                    <input
                      className={inputClassName}
                      value={form.location}
                      onChange={(event) => setForm((current) => ({ ...current, location: event.target.value }))}
                    />
                  </label>
                </div>

                {createSuccessMessage ? (
                  <div className="rounded-2xl border border-teal-200 bg-teal-50 px-4 py-3 text-sm text-teal-800">
                    {createSuccessMessage}
                  </div>
                ) : null}

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-stone-900 px-5 py-3 text-sm font-semibold text-white transition hover:bg-stone-700 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  <HiOutlinePlusCircle className="text-lg" />
                  {isSubmitting ? "Creating account..." : "Create admin"}
                </button>
              </form>
            ) : (
              <div className="rounded-[1.75rem] border border-dashed border-[var(--line)] bg-white/45 p-6">
                <h3 className="font-display text-xl font-bold text-stone-900">Super admin access required</h3>
                <p className="mt-3 text-sm leading-7 text-stone-700">
                  Standard admins can review registered accounts, but only a super admin can create new
                  admin users or perform platform-wide overrides.
                </p>
              </div>
            )}
          </SectionCard>
        </div>
      </div>
    </div>
  );
}
