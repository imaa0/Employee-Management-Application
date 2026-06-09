"use client";

import React, { useState, useEffect, useCallback } from "react";
import { Search, Filter, ChevronLeft, ChevronRight, Plus, Loader2, ToggleLeft, ToggleRight, Trash2, RefreshCw, AlertCircle, CheckCircle2 } from "lucide-react";
import Link from "next/link";
import { getEmployeesAPI, updateEmployeeAPI, deleteEmployeeAPI, type Employee, type Pagination } from "@/lib/api";

export default function EmployeeListPage() {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [pagination, setPagination] = useState<Pagination | null>(null);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [currentPage, setCurrentPage] = useState(1);
  const [toast, setToast] = useState<{ type: "success" | "error"; message: string } | null>(null);
  const itemsPerPage = 8;

  const fetchEmployees = useCallback(async () => {
    setLoading(true);
    try {
      const res = await getEmployeesAPI({
        search,
        status: statusFilter,
        page: currentPage,
        limit: itemsPerPage,
        sortBy: "joinedDate",
        sortOrder: "desc",
      });
      setEmployees(res.data);
      setPagination(res.pagination);
    } catch (err: any) {
      showToast("error", err.message || "Failed to load employees");
    } finally {
      setLoading(false);
    }
  }, [search, statusFilter, currentPage]);

  useEffect(() => {
    fetchEmployees();
  }, [fetchEmployees]);

  const showToast = (type: "success" | "error", message: string) => {
    setToast({ type, message });
    setTimeout(() => setToast(null), 3000);
  };

  const handleToggleStatus = async (emp: Employee) => {
    const newStatus = emp.status === "Active" ? "Inactive" : "Active";
    try {
      await updateEmployeeAPI(emp.id, { status: newStatus });
      showToast("success", `${emp.name} is now ${newStatus}`);
      fetchEmployees();
    } catch (err: any) {
      showToast("error", err.message || "Failed to update status");
    }
  };

  const handleDelete = async (emp: Employee) => {
    if (!confirm(`Are you sure you want to remove ${emp.name}?`)) return;
    try {
      await deleteEmployeeAPI(emp.id);
      showToast("success", `${emp.name} removed successfully`);
      fetchEmployees();
    } catch (err: any) {
      showToast("error", err.message || "Failed to delete employee");
    }
  };

  const handlePageChange = (page: number) => {
    if (pagination && page >= 1 && page <= pagination.totalPages) {
      setCurrentPage(page);
    }
  };

  const totalPages = pagination?.totalPages || 1;

  const renderPageNumbers = () => {
    const pages: (number | string)[] = [];
    for (let i = 1; i <= totalPages; i++) {
      if (i === 1 || i === totalPages || (i >= currentPage - 1 && i <= currentPage + 1)) {
        pages.push(i);
      } else if (pages[pages.length - 1] !== "...") {
        pages.push("...");
      }
    }
    return pages;
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      
      {toast && (
        <div className={`fixed top-6 right-6 z-[100] flex items-center gap-3 rounded-xl border px-5 py-3 shadow-lg animate-in slide-in-from-right-4 duration-300 ${
          toast.type === "success"
            ? "bg-emerald-50 border-emerald-200 text-emerald-800"
            : "bg-red-50 border-red-200 text-red-800"
        }`}>
          {toast.type === "success" ? <CheckCircle2 size={18} /> : <AlertCircle size={18} />}
          <span className="text-sm font-bold">{toast.message}</span>
        </div>
      )}

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-foreground tracking-tight">Employee Directory</h1>
          <p className="text-muted-foreground mt-1 text-sm font-medium">
            Manage your team members and view their details.
            {pagination && <span className="ml-1 text-foreground font-bold">({pagination.totalItems} total)</span>}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={fetchEmployees}
            className="p-2.5 rounded-xl border border-border text-muted-foreground hover:text-foreground hover:bg-muted/50 transition shadow-sm"
            title="Refresh list"
          >
            <RefreshCw size={18} />
          </button>
          <Link 
            href="/dashboard/employees/add" 
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-indigo-600 px-5 py-2.5 text-sm font-bold text-white shadow-md shadow-indigo-600/20 transition-all hover:bg-indigo-500 active:scale-95"
          >
            <Plus size={18} strokeWidth={3} />
            Add Employee
          </Link>
        </div>
      </div>

      <div className="bg-card p-4 rounded-2xl shadow-sm border border-border flex flex-col sm:flex-row gap-4 items-center justify-between mt-4">
        <div className="relative w-full sm:w-96 text-muted-foreground">
          <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2" />
          <input 
            type="text" 
            placeholder="Search by name, email, or role..." 
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setCurrentPage(1);
            }}
            className="w-full pl-10 pr-4 py-2.5 bg-background border-0 ring-1 ring-inset ring-border rounded-xl text-sm font-medium text-foreground focus:ring-2 focus:ring-indigo-600 transition-all outline-none"
          />
        </div>

        <div className="flex items-center gap-3 w-full sm:w-auto">
          <div className="relative w-full sm:w-auto text-muted-foreground">
            <Filter size={18} className="absolute left-3 top-1/2 -translate-y-1/2" />
            <select
              value={statusFilter}
              onChange={(e) => {
                setStatusFilter(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full sm:w-auto pl-10 pr-8 py-2.5 bg-background border-0 ring-1 ring-inset ring-border rounded-xl text-sm font-bold text-foreground focus:ring-2 focus:ring-indigo-600 transition-all outline-none appearance-none"
            >
              <option value="All">All Status</option>
              <option value="Active">Active</option>
              <option value="Inactive">Inactive</option>
            </select>
          </div>
        </div>
      </div>

      <div className="bg-card rounded-2xl shadow-sm border border-border overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 size={28} className="animate-spin text-primary" />
            <span className="ml-3 text-sm font-semibold text-muted-foreground">Loading employees...</span>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-muted/30 border-b border-border text-xs uppercase tracking-wider text-muted-foreground font-bold">
                  <th className="py-4 px-6 font-bold">Employee</th>
                  <th className="py-4 px-6 font-bold">Role</th>
                  <th className="py-4 px-6 font-bold hidden md:table-cell">Department</th>
                  <th className="py-4 px-6 font-bold">Status</th>
                  <th className="py-4 px-6 font-bold hidden lg:table-cell">Joined</th>
                  <th className="py-4 px-6 font-bold text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {employees.length > 0 ? (
                  employees.map((emp) => (
                    <tr key={emp.id} className="hover:bg-muted/20 transition-colors group">
                      <td className="py-4 px-6">
                        <div className="flex items-center gap-4">
                          <div className="w-10 h-10 rounded-full bg-indigo-50 text-indigo-700 font-black flex items-center justify-center text-sm shadow-sm group-hover:scale-105 transition-transform">
                            {emp.name.split(' ').map(n => n[0]).join('')}
                          </div>
                          <div>
                            <div className="font-bold text-foreground">{emp.name}</div>
                            <div className="text-xs font-semibold text-muted-foreground">{emp.email}</div>
                          </div>
                        </div>
                      </td>
                      <td className="py-4 px-6">
                        <span className="font-semibold text-foreground text-sm">{emp.role}</span>
                      </td>
                      <td className="py-4 px-6 hidden md:table-cell">
                        <span className="inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-bold bg-muted text-muted-foreground">
                          {emp.department || "General"}
                        </span>
                      </td>
                      <td className="py-4 px-6">
                        <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold ${
                          emp.status === 'Active' ? 'bg-emerald-50 text-emerald-700 ring-1 ring-inset ring-emerald-600/20' : 'bg-rose-50 text-rose-700 ring-1 ring-inset ring-rose-600/20'
                        }`}>
                          {emp.status}
                        </span>
                      </td>
                      <td className="py-4 px-6 hidden lg:table-cell">
                        <span className="text-sm text-muted-foreground font-medium">
                          {new Date(emp.joinedDate).toLocaleDateString(undefined, { year: "numeric", month: "short", day: "numeric" })}
                        </span>
                      </td>
                      <td className="py-4 px-6 text-right">
                        <div className="flex items-center justify-end gap-1">
                          <button
                            onClick={() => handleToggleStatus(emp)}
                            className={`p-2 rounded-lg transition-colors ${
                              emp.status === "Active"
                                ? "text-emerald-600 hover:bg-emerald-50"
                                : "text-slate-400 hover:bg-slate-50"
                            }`}
                            title={`Set ${emp.status === "Active" ? "Inactive" : "Active"}`}
                          >
                            {emp.status === "Active" ? <ToggleRight size={20} /> : <ToggleLeft size={20} />}
                          </button>
                          <button
                            onClick={() => handleDelete(emp)}
                            className="p-2 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 transition-colors"
                            title="Remove employee"
                          >
                            <Trash2 size={18} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={6} className="py-16 text-center">
                      <div className="flex flex-col items-center gap-2">
                        <Search size={32} className="text-muted-foreground/40" />
                        <p className="text-muted-foreground font-semibold">No employees found</p>
                        <p className="text-sm text-muted-foreground/70">Try adjusting your search or filter criteria.</p>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {pagination && pagination.totalItems > 0 && (
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 px-2">
          <p className="text-sm font-semibold text-muted-foreground">
            Showing <span className="font-bold text-foreground">{(currentPage - 1) * itemsPerPage + 1}</span> to <span className="font-bold text-foreground">{Math.min(currentPage * itemsPerPage, pagination.totalItems)}</span> of <span className="font-bold text-foreground">{pagination.totalItems}</span> results
          </p>
          <div className="flex items-center gap-1">
            <button 
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={!pagination.hasPrev}
              className="p-2 rounded-lg bg-card border border-border text-foreground hover:bg-muted disabled:opacity-40 disabled:cursor-not-allowed transition-colors shadow-sm"
            >
              <ChevronLeft size={18} />
            </button>
            {renderPageNumbers().map((p, i) =>
              typeof p === "number" ? (
                <button
                  key={i}
                  onClick={() => handlePageChange(p)}
                  className={`w-9 h-9 rounded-lg text-sm font-bold transition-colors ${
                    p === currentPage
                      ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/20"
                      : "bg-card border border-border text-foreground hover:bg-muted"
                  }`}
                >
                  {p}
                </button>
              ) : (
                <span key={i} className="px-1 text-muted-foreground font-bold">...</span>
              )
            )}
            <button 
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={!pagination.hasNext}
              className="p-2 rounded-lg bg-card border border-border text-foreground hover:bg-muted disabled:opacity-40 disabled:cursor-not-allowed transition-colors shadow-sm"
            >
              <ChevronRight size={18} />
            </button>
          </div>
        </div>
      )}

    </div>
  );
}
