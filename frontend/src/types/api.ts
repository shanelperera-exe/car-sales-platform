export type Role = "BUYER" | "SELLER" | "ADMIN" | "SUPER_ADMIN";
export type UserStatus = "ACTIVE" | "BANNED";
export type CarStatus = "ACTIVE" | "SOLD" | "RESERVED" | "PENDING_APPROVAL" | "REJECTED";

export interface AdminSession {
  id: number;
  fullName: string;
  email: string;
  role: Role;
  accountStatus: UserStatus;
  message: string;
}

export interface DashboardSummary {
  totalUsers: number;
  totalAdmins: number;
  activeListings: number;
  pendingListings: number;
  rejectedListings: number;
  totalTransactions: number;
  completedTransactions: number;
  totalRevenue: number;
}

export interface MonthlySalesPoint {
  month: string;
  transactionCount: number;
  revenue: number;
}

export interface SalesReport {
  completedTransactions: number;
  totalRevenue: number;
  monthlySales: MonthlySalesPoint[];
}

export interface AdminLog {
  id: number;
  adminId: number;
  adminName: string;
  action: string;
  target: string;
  status: string;
  executionTimeMs: number;
  createdAt: string;
}

export interface CarListing {
  id: number;
  sellerId: number;
  sellerName: string;
  vin: string | null;
  make: string;
  model: string;
  year: number;
  mileage: number;
  fuelType: string | null;
  price: number;
  location: string | null;
  imageUrl: string | null;
  status: CarStatus;
  moderationNote: string | null;
  createdAt: string;
}

export interface UserManagement {
  id: number;
  fullName: string;
  email: string;
  phone: string | null;
  location: string | null;
  role: Exclude<Role, "ADMIN" | "SUPER_ADMIN">;
  accountStatus: UserStatus;
  createdAt: string;
}

export interface AdminAccount {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  phone: string | null;
  location: string | null;
  role: Extract<Role, "ADMIN" | "SUPER_ADMIN">;
  accountStatus: UserStatus;
  createdAt: string;
}

export interface ApiErrorBody {
  timestamp: string;
  status: number;
  error: string;
  message: string;
  path: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface ListingDecisionRequest {
  moderationNote: string;
}

export interface BanUserRequest {
  reason: string;
}

export interface AdminRegistrationRequest {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  phone: string;
  location: string;
  role: Extract<Role, "ADMIN" | "SUPER_ADMIN">;
}

export interface AdminProfileUpdateRequest {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  location: string;
  password?: string;
}
