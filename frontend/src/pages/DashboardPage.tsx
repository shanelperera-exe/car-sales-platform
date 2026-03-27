import {
  HiOutlineClipboardCheck,
  HiOutlineCurrencyDollar,
  HiOutlineShoppingBag,
  HiOutlineUsers
} from "react-icons/hi";
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { ErrorBanner } from "../components/ErrorBanner";
import { LoadingPanel } from "../components/LoadingPanel";
import { PageHeader } from "../components/PageHeader";
import { SectionCard } from "../components/SectionCard";
import { StatCard } from "../components/StatCard";
import { StatusBadge } from "../components/StatusBadge";
import { BarChart } from "../components/BarChart";
import { EmptyState } from "../components/EmptyState";
import { ListingImage } from "../components/ListingImage";
import { useAuth } from "../context/AuthContext";
import { formatCompactNumber, formatCurrency, formatDateTime, titleize } from "../lib/format";
import {
  getAdminLogs,
  getDashboardSummary,
  getPendingListings,
  getSalesReport
} from "../lib/api";
import type { AdminLog, CarListing, DashboardSummary, SalesReport } from "../types/api";

interface DashboardState {
  summary: DashboardSummary | null;
  sales: SalesReport | null;
  logs: AdminLog[];
  pending: CarListing[];
}

export function DashboardPage() {
  const { session } = useAuth();
  const [data, setData] = useState<DashboardState>({
    summary: null,
    sales: null,
    logs: [],
    pending: []
  });
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!session) {
      return;
    }

    const adminId = session.id;
    let isMounted = true;

    async function loadDashboard() {
      setIsLoading(true);
      setError("");

      try {
        const [summary, sales, logs, pending] = await Promise.all([
          getDashboardSummary(adminId),
          getSalesReport(adminId),
          getAdminLogs(adminId),
          getPendingListings(adminId)
        ]);

        if (isMounted) {
          setData({ summary, sales, logs, pending });
        }
      } catch (loadError) {
        if (isMounted) {
          setError(loadError instanceof Error ? loadError.message : "Dashboard data could not be loaded.");
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    }

    loadDashboard();

    return () => {
      isMounted = false;
    };
  }, [session]);

  if (isLoading) {
    return <LoadingPanel />;
  }

  if (!data.summary || !data.sales) {
    return (
      <div className="space-y-4">
        <PageHeader
          eyebrow="Platform Snapshot"
          title="Control room overview"
          description="A consolidated view of listing approvals, user activity, reports, and admin operations."
        />
        {error ? <ErrorBanner message={error} /> : null}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Platform Snapshot"
        title="Control room overview"
        description="A consolidated view of listing approvals, user activity, reports, and admin operations."
        actions={
          <>
            <Link
              to="/listings"
              className="inline-flex items-center gap-2 rounded-full bg-stone-900 px-5 py-3 text-sm font-semibold text-white transition hover:bg-stone-700"
            >
              <HiOutlineClipboardCheck className="text-base" />
              Review listings
            </Link>
            <Link
              to="/users"
              className="inline-flex items-center gap-2 rounded-full border border-[var(--line)] bg-white/75 px-5 py-3 text-sm font-semibold text-stone-800 transition hover:bg-white"
            >
              <HiOutlineUsers className="text-base" />
              Open user panel
            </Link>
          </>
        }
      />

      {error ? <ErrorBanner message={error} /> : null}

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <StatCard
          label="Total Users"
          value={formatCompactNumber(data.summary.totalUsers)}
          note={`${data.summary.totalAdmins} admin accounts included in the wider platform population.`}
          icon={HiOutlineUsers}
        />
        <StatCard
          label="Pending Listings"
          value={formatCompactNumber(data.summary.pendingListings)}
          note={`${data.summary.activeListings} listings are active right now and ${data.summary.rejectedListings} were rejected.`}
          icon={HiOutlineClipboardCheck}
        />
        <StatCard
          label="Completed Deals"
          value={formatCompactNumber(data.summary.completedTransactions)}
          note={`${data.summary.totalTransactions} total transactions have been recorded by the platform.`}
          icon={HiOutlineShoppingBag}
        />
        <StatCard
          label="Revenue"
          value={formatCurrency(data.summary.totalRevenue)}
          note="Based on completed transactions recorded in the reporting module."
          icon={HiOutlineCurrencyDollar}
        />
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.4fr_0.9fr]">
        <SectionCard
          title="Sales performance"
          description="Monthly completed transaction totals pulled from the admin reporting endpoint."
        >
          {data.sales.monthlySales.length > 0 ? (
            <div className="space-y-5">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="rounded-[1.5rem] bg-white/55 p-5">
                  <p className="text-sm font-semibold text-stone-500">Total completed transactions</p>
                  <p className="mt-3 font-display text-3xl font-bold text-stone-900">
                    {formatCompactNumber(data.sales.completedTransactions)}
                  </p>
                </div>
                <div className="rounded-[1.5rem] bg-white/55 p-5">
                  <p className="text-sm font-semibold text-stone-500">Revenue recognized</p>
                  <p className="mt-3 font-display text-3xl font-bold text-stone-900">
                    {formatCurrency(data.sales.totalRevenue)}
                  </p>
                </div>
              </div>

              <BarChart data={data.sales.monthlySales} />
            </div>
          ) : (
            <EmptyState
              title="No sales data yet"
              description="Completed transactions will appear here as soon as purchases are finalized."
            />
          )}
        </SectionCard>

        <SectionCard
          title="Pending approval queue"
          description="The newest seller submissions waiting for a moderation decision."
          action={
            <Link
              to="/listings"
              className="rounded-full border border-[var(--line)] bg-white/75 px-4 py-2 text-sm font-semibold text-stone-800 transition hover:bg-white"
            >
              Open queue
            </Link>
          }
        >
          {data.pending.length > 0 ? (
            <div className="space-y-4">
              {data.pending.slice(0, 4).map((listing) => (
                <article key={listing.id} className="rounded-[1.5rem] bg-white/55 p-4">
                  <div className="flex items-start justify-between gap-4">
                    <div className="h-16 w-24 shrink-0 overflow-hidden rounded-xl border border-[var(--line)] bg-white/70">
                      <ListingImage
                        src={listing.imageUrl}
                        alt={`${listing.make} ${listing.model}`}
                        className="h-full w-full object-cover"
                        fallbackClassName="flex h-full w-full items-center justify-center bg-stone-100 text-[11px] font-semibold uppercase tracking-[0.08em] text-stone-500"
                        fallbackLabel="No image"
                      />
                    </div>
                    <div>
                      <p className="font-display text-lg font-semibold text-stone-900">
                        {listing.year} {listing.make} {listing.model}
                      </p>
                      <p className="mt-1 text-sm text-stone-600">
                        Seller {listing.sellerName} • {listing.location || "Location pending"}
                      </p>
                    </div>
                    <StatusBadge value={listing.status} />
                  </div>
                  <div className="mt-4 flex flex-wrap gap-3 text-sm text-stone-600">
                    <span>{formatCurrency(listing.price)}</span>
                    <span>{formatCompactNumber(listing.mileage)} km</span>
                    <span>{listing.fuelType || "Fuel type pending"}</span>
                  </div>
                </article>
              ))}
            </div>
          ) : (
            <EmptyState
              title="Queue is clear"
              description="No listings are currently waiting for approval."
            />
          )}
        </SectionCard>
      </div>

      <SectionCard
        title="Recent admin activity"
        description="The latest 100 admin log records with execution timing and targets."
      >
        {data.logs.length > 0 ? (
          <div className="overflow-hidden rounded-[1.5rem] border border-[var(--line)]">
            <div className="hidden grid-cols-[1.1fr_1.2fr_0.8fr_0.8fr_1fr] gap-4 bg-stone-950 px-5 py-4 text-xs font-semibold uppercase tracking-[0.18em] text-stone-300 md:grid">
              <span>Admin</span>
              <span>Action</span>
              <span>Status</span>
              <span>Duration</span>
              <span>When</span>
            </div>

            <div className="divide-y divide-[var(--line)] bg-white/60">
              {data.logs.slice(0, 8).map((log) => (
                <article key={log.id} className="grid gap-2 px-5 py-4 md:grid-cols-[1.1fr_1.2fr_0.8fr_0.8fr_1fr] md:items-center md:gap-4">
                  <div>
                    <p className="font-semibold text-stone-900">{log.adminName}</p>
                    <p className="text-sm text-stone-600">Admin ID {log.adminId}</p>
                  </div>
                  <div>
                    <p className="font-semibold text-stone-900">{titleize(log.action)}</p>
                    <p className="text-sm text-stone-600">{log.target}</p>
                  </div>
                  <div>
                    <StatusBadge value={log.status} />
                  </div>
                  <div className="text-sm font-semibold text-stone-700">{log.executionTimeMs} ms</div>
                  <div className="text-sm text-stone-600">{formatDateTime(log.createdAt)}</div>
                </article>
              ))}
            </div>
          </div>
        ) : (
          <EmptyState
            title="No activity yet"
            description="Admin actions will show up here once the control panel starts being used."
          />
        )}
      </SectionCard>
    </div>
  );
}
