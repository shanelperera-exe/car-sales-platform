import {
  HiOutlineBan,
  HiOutlineSearch,
  HiOutlineShieldCheck
} from "react-icons/hi";
import { useDeferredValue, useEffect, useState } from "react";
import { ErrorBanner } from "../components/ErrorBanner";
import { EmptyState } from "../components/EmptyState";
import { PageHeader } from "../components/PageHeader";
import { SectionCard } from "../components/SectionCard";
import { StatusBadge } from "../components/StatusBadge";
import { useAuth } from "../context/AuthContext";
import { banUser, getUsers, unbanUser } from "../lib/api";
import { cn } from "../lib/cn";
import { formatDateTime, titleize } from "../lib/format";
import type { UserManagement, UserStatus } from "../types/api";

const inputClassName =
  "w-full rounded-2xl border border-stone-200 bg-white px-4 py-3 text-sm text-stone-900 outline-none transition focus:border-teal-500 focus:ring-4 focus:ring-teal-100";

export function UsersPage() {
  const { isSuperAdmin, session } = useAuth();
  const [roleFilter, setRoleFilter] = useState<"ALL" | "BUYER" | "SELLER">("ALL");
  const [statusFilter, setStatusFilter] = useState<"ALL" | UserStatus>("ALL");
  const [query, setQuery] = useState("");
  const deferredQuery = useDeferredValue(query);
  const [users, setUsers] = useState<UserManagement[]>([]);
  const [selectedUserId, setSelectedUserId] = useState<number | null>(null);
  const [banReason, setBanReason] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!session) {
      return;
    }

    const adminId = session.id;
    let isMounted = true;

    async function loadUsers() {
      setIsLoading(true);
      setError("");

      try {
        const response = await getUsers(adminId, {
          role: roleFilter,
          accountStatus: statusFilter
        });

        if (isMounted) {
          setUsers(response);
          setSelectedUserId((current) => current ?? response[0]?.id ?? null);
        }
      } catch (loadError) {
        if (isMounted) {
          setError(loadError instanceof Error ? loadError.message : "Users could not be loaded.");
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    }

    loadUsers();

    return () => {
      isMounted = false;
    };
  }, [roleFilter, session, statusFilter]);

  const normalizedQuery = deferredQuery.trim().toLowerCase();
  const filteredUsers = !normalizedQuery
    ? users
    : users.filter((user) =>
        [user.fullName, user.email, user.location ?? "", user.phone ?? ""]
          .join(" ")
          .toLowerCase()
          .includes(normalizedQuery)
      );

  const selectedUser =
    filteredUsers.find((user) => user.id === selectedUserId) ??
    filteredUsers[0] ??
    null;

  useEffect(() => {
    if (!selectedUser && filteredUsers.length > 0) {
      setSelectedUserId(filteredUsers[0].id);
    }
  }, [filteredUsers, selectedUser]);

  async function handleBan() {
    if (!session || !selectedUser) {
      return;
    }

    if (!banReason.trim()) {
      setError("Ban reason is required.");
      return;
    }

    setBusy(true);
    setError("");

    try {
      const updatedUser = await banUser(session.id, selectedUser.id, {
        reason: banReason.trim()
      });

      setUsers((current) =>
        current.map((user) => (user.id === updatedUser.id ? updatedUser : user))
      );
      setBanReason("");
    } catch (actionError) {
      setError(actionError instanceof Error ? actionError.message : "User could not be banned.");
    } finally {
      setBusy(false);
    }
  }

  async function handleUnban() {
    if (!session || !selectedUser) {
      return;
    }

    setBusy(true);
    setError("");

    try {
      const updatedUser = await unbanUser(session.id, selectedUser.id);

      setUsers((current) =>
        current.map((user) => (user.id === updatedUser.id ? updatedUser : user))
      );
    } catch (actionError) {
      setError(actionError instanceof Error ? actionError.message : "User could not be restored.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="User Management"
        title="Marketplace user oversight"
        description="Filter buyer and seller accounts, inspect profile details, and take moderation action on policy violations."
      />

      <SectionCard
        title="Filter users"
        description="Use server-side role and account status filters, then search by contact details or location."
      >
        <div className="grid gap-4 xl:grid-cols-[0.9fr_0.9fr_1.2fr]">
          <label className="space-y-2">
            <span className="text-sm font-semibold text-stone-700">Role</span>
            <select
              className={inputClassName}
              value={roleFilter}
              onChange={(event) => setRoleFilter(event.target.value as "ALL" | "BUYER" | "SELLER")}
            >
              <option value="ALL">All roles</option>
              <option value="BUYER">Buyer</option>
              <option value="SELLER">Seller</option>
            </select>
          </label>

          <label className="space-y-2">
            <span className="text-sm font-semibold text-stone-700">Account status</span>
            <select
              className={inputClassName}
              value={statusFilter}
              onChange={(event) => setStatusFilter(event.target.value as "ALL" | UserStatus)}
            >
              <option value="ALL">All statuses</option>
              <option value="ACTIVE">Active</option>
              <option value="BANNED">Banned</option>
            </select>
          </label>

          <label className="space-y-2">
            <span className="text-sm font-semibold text-stone-700">Search</span>
            <div className="relative">
              <HiOutlineSearch className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-lg text-stone-400" />
              <input
                className={`${inputClassName} pl-11`}
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Search by name, email, phone, or location"
              />
            </div>
          </label>
        </div>
      </SectionCard>

      {error ? <ErrorBanner message={error} /> : null}

      {isLoading ? (
        <div className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
          <div className="h-96 animate-pulse rounded-[2rem] border border-[var(--line)] bg-[var(--panel)]" />
          <div className="h-96 animate-pulse rounded-[2rem] border border-[var(--line)] bg-[var(--panel)]" />
        </div>
      ) : filteredUsers.length > 0 && selectedUser ? (
        <div className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
          <SectionCard
            title="User directory"
            description={`${filteredUsers.length} accounts match the current filters.`}
          >
            <div className="space-y-3">
              {filteredUsers.map((user) => (
                <button
                  key={user.id}
                  type="button"
                  onClick={() => setSelectedUserId(user.id)}
                  className={cn(
                    "w-full rounded-[1.5rem] border px-4 py-4 text-left transition",
                    selectedUser.id === user.id
                      ? "border-teal-400 bg-teal-50"
                      : "border-[var(--line)] bg-white/60 hover:bg-white"
                  )}
                >
                  <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                    <div>
                      <p className="font-display text-lg font-semibold text-stone-900">{user.fullName}</p>
                      <p className="mt-1 text-sm text-stone-600">{user.email}</p>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      <StatusBadge value={user.role} />
                      <StatusBadge value={user.accountStatus} />
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </SectionCard>

          <SectionCard
            title="Selected user"
            description="Inspect the account and take moderation action when necessary."
          >
            <div className="space-y-5">
              <div className="rounded-[1.75rem] bg-white/60 p-5">
                <div className="flex flex-wrap items-start justify-between gap-4">
                  <div>
                    <h2 className="font-display text-2xl font-bold text-stone-900">{selectedUser.fullName}</h2>
                    <p className="mt-2 text-sm text-stone-600">{selectedUser.email}</p>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <StatusBadge value={selectedUser.role} />
                    <StatusBadge value={selectedUser.accountStatus} />
                  </div>
                </div>

                <div className="mt-5 grid gap-3 md:grid-cols-2">
                  <div className="rounded-[1.25rem] bg-stone-950/5 p-4">
                    <p className="text-xs font-semibold uppercase tracking-[0.18em] text-stone-500">Phone</p>
                    <p className="mt-2 text-sm font-semibold text-stone-900">{selectedUser.phone || "Not provided"}</p>
                  </div>
                  <div className="rounded-[1.25rem] bg-stone-950/5 p-4">
                    <p className="text-xs font-semibold uppercase tracking-[0.18em] text-stone-500">Location</p>
                    <p className="mt-2 text-sm font-semibold text-stone-900">
                      {selectedUser.location || "Not provided"}
                    </p>
                  </div>
                  <div className="rounded-[1.25rem] bg-stone-950/5 p-4">
                    <p className="text-xs font-semibold uppercase tracking-[0.18em] text-stone-500">Role</p>
                    <p className="mt-2 text-sm font-semibold text-stone-900">{titleize(selectedUser.role)}</p>
                  </div>
                  <div className="rounded-[1.25rem] bg-stone-950/5 p-4">
                    <p className="text-xs font-semibold uppercase tracking-[0.18em] text-stone-500">Created</p>
                    <p className="mt-2 text-sm font-semibold text-stone-900">
                      {formatDateTime(selectedUser.createdAt)}
                    </p>
                  </div>
                </div>
              </div>

              {selectedUser.accountStatus === "ACTIVE" ? (
                <div className="space-y-3 rounded-[1.75rem] border border-amber-200 bg-[var(--danger-soft)] p-5">
                  <h3 className="font-display text-xl font-bold text-stone-900">Ban user</h3>
                  <p className="text-sm leading-6 text-stone-700">
                    Provide a short moderation reason before disabling this account.
                  </p>
                  <textarea
                    rows={4}
                    value={banReason}
                    onChange={(event) => setBanReason(event.target.value)}
                    placeholder="Example: repeated fake listing inquiries or policy violations."
                    className={inputClassName}
                  />
                  <button
                    type="button"
                    disabled={busy}
                    onClick={handleBan}
                    className="inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-stone-900 px-5 py-3 text-sm font-semibold text-white transition hover:bg-stone-700 disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    <HiOutlineBan className="text-lg" />
                    {busy ? "Applying moderation..." : "Ban this user"}
                  </button>
                </div>
              ) : (
                <div className="space-y-3 rounded-[1.75rem] border border-teal-200 bg-teal-50 p-5">
                  <h3 className="font-display text-xl font-bold text-stone-900">Restore account</h3>
                  <p className="text-sm leading-6 text-stone-700">
                    Only super admins can perform platform-wide account overrides and restore a banned user.
                  </p>
                  <button
                    type="button"
                    disabled={busy || !isSuperAdmin}
                    onClick={handleUnban}
                    className="inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-teal-700 px-5 py-3 text-sm font-semibold text-white transition hover:bg-teal-600 disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    <HiOutlineShieldCheck className="text-lg" />
                    {busy ? "Restoring..." : isSuperAdmin ? "Unban user" : "Super admin access required"}
                  </button>
                </div>
              )}
            </div>
          </SectionCard>
        </div>
      ) : (
        <EmptyState
          title="No users found"
          description="Adjust the current filters or search query to find marketplace accounts."
        />
      )}
    </div>
  );
}
