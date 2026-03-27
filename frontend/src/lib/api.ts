import type {
  AdminAccount,
  AdminLog,
  AdminProfileUpdateRequest,
  AdminRegistrationRequest,
  AdminSession,
  BanUserRequest,
  CarListing,
  CarStatus,
  DashboardSummary,
  ListingDecisionRequest,
  LoginRequest,
  SalesReport,
  UserManagement,
  UserStatus
} from "../types/api";

const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL ?? "").replace(/\/$/, "");

interface RequestOptions {
  method?: string;
  adminId?: number | null;
  body?: unknown;
}

async function request<T>(path: string, options: RequestOptions = {}): Promise<T> {
  const headers = new Headers({
    Accept: "application/json"
  });

  if (options.body !== undefined) {
    headers.set("Content-Type", "application/json");
  }

  if (options.adminId) {
    headers.set("X-Admin-Id", String(options.adminId));
  }

  const response = await fetch(`${API_BASE_URL}${path}`, {
    method: options.method ?? "GET",
    headers,
    body: options.body === undefined ? undefined : JSON.stringify(options.body)
  });

  const raw = await response.text();
  const data = raw ? JSON.parse(raw) : null;

  if (!response.ok) {
    throw new Error(data?.message ?? "The request could not be completed.");
  }

  return data as T;
}

function createQuery(params: Record<string, string | undefined>) {
  const query = new URLSearchParams();

  Object.entries(params).forEach(([key, value]) => {
    if (value) {
      query.set(key, value);
    }
  });

  const queryString = query.toString();
  return queryString ? `?${queryString}` : "";
}

export function login(payload: LoginRequest) {
  return request<AdminSession>("/api/admin/auth/login", {
    method: "POST",
    body: payload
  });
}

export function getDashboardSummary(adminId: number) {
  return request<DashboardSummary>("/api/admin/dashboard/summary", {
    adminId
  });
}

export function getSalesReport(adminId: number) {
  return request<SalesReport>("/api/admin/reports/sales", {
    adminId
  });
}

export function getAdminLogs(adminId: number) {
  return request<AdminLog[]>("/api/admin/logs", {
    adminId
  });
}

export function getPendingListings(adminId: number) {
  return request<CarListing[]>("/api/admin/listings/pending", {
    adminId
  });
}

export function getListings(adminId: number, status?: CarStatus | "ALL") {
  const query = createQuery({
    status: status && status !== "ALL" ? status : undefined
  });

  return request<CarListing[]>(`/api/admin/listings${query}`, {
    adminId
  });
}

export function getListingImageUrl(listingId: number) {
  return `${API_BASE_URL}/api/admin/listings/${listingId}/image`;
}

export function approveListing(adminId: number, listingId: number, payload: ListingDecisionRequest) {
  return request<CarListing>(`/api/admin/listings/${listingId}/approve`, {
    method: "PUT",
    adminId,
    body: payload
  });
}

export function rejectListing(adminId: number, listingId: number, payload: ListingDecisionRequest) {
  return request<CarListing>(`/api/admin/listings/${listingId}/reject`, {
    method: "PUT",
    adminId,
    body: payload
  });
}

export function getUsers(
  adminId: number,
  filters: {
    role?: "BUYER" | "SELLER" | "ALL";
    accountStatus?: UserStatus | "ALL";
  } = {}
) {
  const query = createQuery({
    role: filters.role && filters.role !== "ALL" ? filters.role : undefined,
    accountStatus:
      filters.accountStatus && filters.accountStatus !== "ALL" ? filters.accountStatus : undefined
  });

  return request<UserManagement[]>(`/api/admin/users${query}`, {
    adminId
  });
}

export function banUser(adminId: number, userId: number, payload: BanUserRequest) {
  return request<UserManagement>(`/api/admin/users/${userId}/ban`, {
    method: "PUT",
    adminId,
    body: payload
  });
}

export function unbanUser(adminId: number, userId: number) {
  return request<UserManagement>(`/api/admin/users/${userId}/unban`, {
    method: "PUT",
    adminId
  });
}

export function getAdminAccounts(adminId: number) {
  return request<AdminAccount[]>("/api/admin/accounts", {
    adminId
  });
}

export function createAdminAccount(adminId: number, payload: AdminRegistrationRequest) {
  return request<AdminAccount>("/api/admin/accounts", {
    method: "POST",
    adminId,
    body: payload
  });
}

export function updateMyAdminAccount(adminId: number, payload: AdminProfileUpdateRequest) {
  return request<AdminAccount>("/api/admin/accounts/me", {
    method: "PUT",
    adminId,
    body: payload
  });
}
