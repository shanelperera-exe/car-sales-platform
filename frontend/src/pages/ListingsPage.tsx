import {
  HiOutlineCheckCircle,
  HiOutlineSearch,
  HiOutlineXCircle
} from "react-icons/hi";
import { useDeferredValue, useEffect, useState } from "react";
import { ErrorBanner } from "../components/ErrorBanner";
import { EmptyState } from "../components/EmptyState";
import { ListingImage } from "../components/ListingImage";
import { PageHeader } from "../components/PageHeader";
import { SectionCard } from "../components/SectionCard";
import { StatusBadge } from "../components/StatusBadge";
import { useAuth } from "../context/AuthContext";
import { approveListing, getListings, rejectListing } from "../lib/api";
import { cn } from "../lib/cn";
import { formatCurrency, formatDateTime, formatCompactNumber } from "../lib/format";
import type { CarListing, CarStatus } from "../types/api";

const tabs: Array<{ label: string; value: CarStatus | "ALL" }> = [
  { label: "All", value: "ALL" },
  { label: "Pending", value: "PENDING_APPROVAL" },
  { label: "Active", value: "ACTIVE" },
  { label: "Rejected", value: "REJECTED" },
  { label: "Reserved", value: "RESERVED" },
  { label: "Sold", value: "SOLD" }
];

const inputClassName =
  "w-full rounded-2xl border border-stone-200 bg-white px-4 py-3 text-sm text-stone-900 outline-none transition focus:border-teal-500 focus:ring-4 focus:ring-teal-100";

export function ListingsPage() {
  const { session } = useAuth();
  const [status, setStatus] = useState<CarStatus | "ALL">("PENDING_APPROVAL");
  const [query, setQuery] = useState("");
  const deferredQuery = useDeferredValue(query);
  const [listings, setListings] = useState<CarListing[]>([]);
  const [notes, setNotes] = useState<Record<number, string>>({});
  const [busyListingId, setBusyListingId] = useState<number | null>(null);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!session) {
      return;
    }

    const adminId = session.id;
    let isMounted = true;

    async function loadListings() {
      setIsLoading(true);
      setError("");

      try {
        const response = await getListings(adminId, status);

        if (isMounted) {
          setListings(response);
          setNotes(
            response.reduce<Record<number, string>>((accumulator, listing) => {
              accumulator[listing.id] = listing.moderationNote ?? "";
              return accumulator;
            }, {})
          );
        }
      } catch (loadError) {
        if (isMounted) {
          setError(loadError instanceof Error ? loadError.message : "Listings could not be loaded.");
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    }

    loadListings();

    return () => {
      isMounted = false;
    };
  }, [session, status]);

  const normalizedQuery = deferredQuery.trim().toLowerCase();
  const filteredListings = !normalizedQuery
    ? listings
    : listings.filter((listing) =>
        [listing.make, listing.model, listing.sellerName, listing.vin ?? "", listing.location ?? ""]
          .join(" ")
          .toLowerCase()
          .includes(normalizedQuery)
      );

  async function handleDecision(listingId: number, decision: "approve" | "reject") {
    if (!session) {
      return;
    }

    setBusyListingId(listingId);
    setError("");

    try {
      const moderationNote = notes[listingId]?.trim() ?? "";
      const updated =
        decision === "approve"
          ? await approveListing(session.id, listingId, { moderationNote })
          : await rejectListing(session.id, listingId, { moderationNote });

      setListings((current) =>
        current.map((listing) => (listing.id === listingId ? updated : listing))
      );
      setNotes((current) => ({
        ...current,
        [listingId]: updated.moderationNote ?? moderationNote
      }));
    } catch (actionError) {
      setError(actionError instanceof Error ? actionError.message : "The listing could not be updated.");
    } finally {
      setBusyListingId(null);
    }
  }

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Listing Moderation"
        title="Approval queue and listing decisions"
        description="Review seller submissions, add moderation notes, and move listings into approved or rejected states."
      />

      <SectionCard
        title="Queue controls"
        description="Filter server-side by listing status, then search locally by make, model, VIN, or seller name."
      >
        <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
          <div className="flex flex-wrap gap-2">
            {tabs.map((tab) => (
              <button
                key={tab.value}
                type="button"
                onClick={() => setStatus(tab.value)}
                className={cn(
                  "rounded-full px-4 py-2 text-sm font-semibold transition",
                  status === tab.value
                    ? "bg-stone-900 text-white"
                    : "border border-[var(--line)] bg-white/70 text-stone-700 hover:bg-white"
                )}
              >
                {tab.label}
              </button>
            ))}
          </div>

          <div className="w-full max-w-md">
            <div className="relative">
              <HiOutlineSearch className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-lg text-stone-400" />
              <input
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Search listing, seller, location, or VIN"
                className={`${inputClassName} pl-11`}
              />
            </div>
          </div>
        </div>
      </SectionCard>

      {error ? <ErrorBanner message={error} /> : null}

      {isLoading ? (
        <div className="grid gap-4 xl:grid-cols-2">
          {Array.from({ length: 4 }).map((_, index) => (
            <div
              key={index}
              className="h-72 animate-pulse rounded-[2rem] border border-[var(--line)] bg-[var(--panel)]"
            />
          ))}
        </div>
      ) : filteredListings.length > 0 ? (
        <div className="grid gap-5 2xl:grid-cols-2">
          {filteredListings.map((listing) => {
            const isBusy = busyListingId === listing.id;
            const isSold = listing.status === "SOLD";

            return (
              <article
                key={listing.id}
                className="rounded-[2rem] border border-[var(--line)] bg-[var(--panel)] p-6 shadow-[var(--shadow)]"
              >
                <div className="mb-5 overflow-hidden rounded-[1.5rem] border border-[var(--line)] bg-white/60">
                  <ListingImage
                    src={listing.imageUrl}
                    alt={`${listing.make} ${listing.model}`}
                    className="h-52 w-full object-cover"
                    fallbackClassName="flex h-52 w-full items-center justify-center bg-stone-100 text-sm font-semibold text-stone-500"
                    fallbackLabel="Image unavailable"
                  />
                </div>

                <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                  <div className="space-y-3">
                    <div className="flex flex-wrap items-center gap-3">
                      <h2 className="font-display text-2xl font-bold tracking-tight text-stone-900">
                        {listing.year} {listing.make} {listing.model}
                      </h2>
                      <StatusBadge value={listing.status} />
                    </div>
                    <p className="text-sm leading-7 text-[var(--muted)]">
                      Submitted by {listing.sellerName} on {formatDateTime(listing.createdAt)}
                    </p>
                  </div>

                  <div className="rounded-[1.5rem] bg-white/65 px-4 py-3 text-right">
                    <p className="text-xs font-semibold uppercase tracking-[0.18em] text-stone-500">
                      Asking Price
                    </p>
                    <p className="mt-2 font-display text-2xl font-bold text-stone-900">
                      {formatCurrency(listing.price)}
                    </p>
                  </div>
                </div>

                <div className="mt-5 grid gap-3 md:grid-cols-2 xl:grid-cols-4">
                  <div className="rounded-[1.25rem] bg-white/55 p-4">
                    <p className="text-xs font-semibold uppercase tracking-[0.16em] text-stone-500">
                      Mileage
                    </p>
                    <p className="mt-2 text-sm font-semibold text-stone-900">
                      {formatCompactNumber(listing.mileage)} km
                    </p>
                  </div>
                  <div className="rounded-[1.25rem] bg-white/55 p-4">
                    <p className="text-xs font-semibold uppercase tracking-[0.16em] text-stone-500">
                      Fuel Type
                    </p>
                    <p className="mt-2 text-sm font-semibold text-stone-900">{listing.fuelType || "Pending"}</p>
                  </div>
                  <div className="rounded-[1.25rem] bg-white/55 p-4">
                    <p className="text-xs font-semibold uppercase tracking-[0.16em] text-stone-500">
                      Location
                    </p>
                    <p className="mt-2 text-sm font-semibold text-stone-900">{listing.location || "Pending"}</p>
                  </div>
                  <div className="rounded-[1.25rem] bg-white/55 p-4">
                    <p className="text-xs font-semibold uppercase tracking-[0.16em] text-stone-500">
                      VIN
                    </p>
                    <p className="mt-2 break-all text-sm font-semibold text-stone-900">{listing.vin || "Not added"}</p>
                  </div>
                </div>

                <div className="mt-5 space-y-3">
                  <label className="block space-y-2">
                    <span className="text-sm font-semibold text-stone-700">Moderation note</span>
                    <textarea
                      rows={4}
                      value={notes[listing.id] ?? ""}
                      onChange={(event) =>
                        setNotes((current) => ({
                          ...current,
                          [listing.id]: event.target.value
                        }))
                      }
                      placeholder="Document why this listing was approved or rejected."
                      className={inputClassName}
                    />
                  </label>

                  <div className="flex flex-col gap-3 md:flex-row">
                    <button
                      type="button"
                      disabled={isBusy || isSold}
                      onClick={() => handleDecision(listing.id, "approve")}
                      className="flex flex-1 items-center justify-center gap-2 rounded-2xl bg-teal-700 px-5 py-3 text-sm font-semibold text-white transition hover:bg-teal-600 disabled:cursor-not-allowed disabled:opacity-60"
                    >
                      <HiOutlineCheckCircle className="text-lg" />
                      {isBusy ? "Saving..." : "Approve listing"}
                    </button>
                    <button
                      type="button"
                      disabled={isBusy || isSold}
                      onClick={() => handleDecision(listing.id, "reject")}
                      className="flex flex-1 items-center justify-center gap-2 rounded-2xl bg-stone-900 px-5 py-3 text-sm font-semibold text-white transition hover:bg-stone-700 disabled:cursor-not-allowed disabled:opacity-60"
                    >
                      <HiOutlineXCircle className="text-lg" />
                      {isBusy ? "Saving..." : "Reject listing"}
                    </button>
                  </div>

                  {isSold ? (
                    <p className="text-sm text-[var(--warning)]">
                      Sold listings cannot be moved back into an active or rejected state.
                    </p>
                  ) : null}
                </div>
              </article>
            );
          })}
        </div>
      ) : (
        <EmptyState
          title="No listings matched this view"
          description="Try a different status filter or clear your search to broaden the queue."
        />
      )}
    </div>
  );
}
