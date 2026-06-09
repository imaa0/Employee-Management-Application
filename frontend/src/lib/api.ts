const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";

// ─── Types ──────────────────────────────────────────────────────────────────

export type Employee = {
  id: string;
  name: string;
  email: string;
  role: string;
  department?: string;
  phone?: string;
  status: "Active" | "Inactive";
  salary?: number;
  joinedDate: string;
  createdAt?: string;
  updatedAt?: string;
};

export type Pagination = {
  page: number;
  limit: number;
  totalItems: number;
  totalPages: number;
  hasNext: boolean;
  hasPrev: boolean;
};

export type EmployeeStats = {
  total: number;
  active: number;
  inactive: number;
  departments: number;
  departmentList: string[];
  recentHires: Employee[];
  monthlyHires: { month: string; hires: number }[];
};

export type LoginPayload = { email: string; password: string };
export type RegisterPayload = { name: string; email: string; password: string; role?: string };
export type CreateEmployeePayload = {
  name: string;
  email: string;
  role: string;
  department?: string;
  phone?: string;
  status: "Active" | "Inactive";
  salary?: number;
  joinedDate?: string;
};
export type UpdateEmployeePayload = Partial<CreateEmployeePayload>;

export type EmployeeQuery = {
  search?: string;
  status?: string;
  department?: string;
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: string;
};

// ─── Helpers ────────────────────────────────────────────────────────────────

function getToken(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem("ems_token");
}

export function setToken(token: string) {
  localStorage.setItem("ems_token", token);
}

export function clearToken() {
  localStorage.removeItem("ems_token");
  localStorage.removeItem("ems_user");
}

export function setUser(user: { id: string; name: string; email: string; role: string }) {
  localStorage.setItem("ems_user", JSON.stringify(user));
}

export function getUser() {
  if (typeof window === "undefined") return null;
  const raw = localStorage.getItem("ems_user");
  return raw ? JSON.parse(raw) : null;
}

async function request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const token = getToken();
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...((options.headers as Record<string, string>) || {}),
  };
  if (token) headers["Authorization"] = `Bearer ${token}`;

  const res = await fetch(`${API_BASE}${endpoint}`, { ...options, headers });
  const json = await res.json();

  if (!res.ok) {
    const error: any = new Error(json.error || "Request failed");
    error.status = res.status;
    error.details = json.details;
    throw error;
  }

  return json;
}

// ─── Auth API ───────────────────────────────────────────────────────────────

export async function loginAPI(data: LoginPayload) {
  return request<{ success: boolean; message: string; data: { token: string; user: any } }>("/auth/login", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export async function registerAPI(data: RegisterPayload) {
  return request<{ success: boolean; message: string; data: { token: string; user: any } }>("/auth/register", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

// ─── Employee API ───────────────────────────────────────────────────────────

export async function getEmployeesAPI(query: EmployeeQuery = {}) {
  const params = new URLSearchParams();
  if (query.search) params.set("search", query.search);
  if (query.status) params.set("status", query.status);
  if (query.department) params.set("department", query.department);
  if (query.page) params.set("page", String(query.page));
  if (query.limit) params.set("limit", String(query.limit));
  if (query.sortBy) params.set("sortBy", query.sortBy);
  if (query.sortOrder) params.set("sortOrder", query.sortOrder);

  return request<{
    success: boolean;
    data: Employee[];
    pagination: Pagination;
    stats: { total: number; active: number; inactive: number };
  }>(`/employees?${params.toString()}`);
}

export async function getEmployeeStatsAPI() {
  return request<{ success: boolean; data: EmployeeStats }>("/employees/stats");
}

export async function getEmployeeByIdAPI(id: string) {
  return request<{ success: boolean; data: Employee }>(`/employees/${id}`);
}

export async function createEmployeeAPI(data: CreateEmployeePayload) {
  return request<{ success: boolean; message: string; data: Employee }>("/employees", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export async function updateEmployeeAPI(id: string, data: UpdateEmployeePayload) {
  return request<{ success: boolean; message: string; data: Employee }>(`/employees/${id}`, {
    method: "PUT",
    body: JSON.stringify(data),
  });
}

export async function deleteEmployeeAPI(id: string) {
  return request<{ success: boolean; message: string }>(`/employees/${id}`, {
    method: "DELETE",
  });
}
