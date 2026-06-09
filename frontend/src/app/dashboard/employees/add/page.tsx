"use client";

import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { ArrowLeft, UserPlus, CheckCircle2, AlertCircle, Loader2 } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createEmployeeAPI } from "@/lib/api";

const addEmployeeSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters").max(100),
  email: z.string().min(1, "Email is required").email("Invalid email format"),
  role: z.string().min(1, "Role is required").max(100),
  department: z.string().min(1, "Department is required").max(100),
  phone: z.string().optional().or(z.literal("")),
  status: z.enum(["Active", "Inactive"] as const, { message: "Status is required" }),
  salary: z.string().optional().transform((val) => (val ? parseFloat(val) : undefined)).pipe(z.number().min(0, "Salary must be positive").optional()),
  joinedDate: z.string().min(1, "Joined date is required").regex(/^\d{4}-\d{2}-\d{2}$/, "Invalid date format"),
});

type AddEmployeeFormValues = z.infer<typeof addEmployeeSchema>;

const departments = ["Engineering", "Product", "Design", "Marketing", "Human Resources", "Finance", "Security", "Analytics", "General"];

export default function AddEmployeePage() {
  const router = useRouter();
  const [isSuccess, setIsSuccess] = useState(false);
  const [serverError, setServerError] = useState("");

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset
  } = useForm<AddEmployeeFormValues>({
    resolver: zodResolver(addEmployeeSchema),
    defaultValues: {
      name: "",
      email: "",
      role: "",
      department: "Engineering",
      phone: "",
      status: "Active",
      joinedDate: new Date().toISOString().split("T")[0],
    },
  });

  const onSubmit = async (data: AddEmployeeFormValues) => {
    setServerError("");
    try {
      await createEmployeeAPI({
        name: data.name,
        email: data.email,
        role: data.role,
        department: data.department,
        phone: data.phone || undefined,
        status: data.status,
        salary: data.salary,
        joinedDate: data.joinedDate,
      });

      setIsSuccess(true);
      reset();
      
      setTimeout(() => {
        router.push("/dashboard/employees");
      }, 2000);
    } catch (err: any) {
      if (err.details) {
        setServerError(err.details.map((d: any) => d.message).join(", "));
      } else {
        setServerError(err.message || "Failed to create employee. Please try again.");
      }
    }
  };

  const inputClass = (field: keyof typeof errors) =>
    `block w-full rounded-xl border-0 py-3 px-4 text-foreground shadow-sm ring-1 ring-inset transition-all sm:text-sm sm:leading-6 ${
      errors[field]
        ? "ring-red-500 focus:ring-2 focus:ring-inset focus:ring-red-600 bg-red-50"
        : "ring-border placeholder:text-muted-foreground/60 focus:ring-2 focus:ring-inset focus:ring-indigo-600 bg-card"
    }`;

  return (
    <div className="max-w-3xl mx-auto space-y-6 animate-in fade-in duration-500">
      
      <div className="flex items-center gap-4">
        <Link 
          href="/dashboard/employees" 
          className="p-2.5 rounded-xl bg-card border border-border text-muted-foreground hover:text-indigo-600 hover:bg-indigo-50 hover:border-indigo-200 transition-all shadow-sm"
        >
          <ArrowLeft size={20} />
        </Link>
        <div>
          <h1 className="text-3xl font-extrabold text-foreground tracking-tight">Add New Employee</h1>
          <p className="text-muted-foreground mt-1 text-sm font-medium">Create a new profile for a team member.</p>
        </div>
      </div>

      {isSuccess && (
        <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-4 flex items-center gap-3 animate-in slide-in-from-top-4">
          <CheckCircle2 size={24} className="text-emerald-500" />
          <p className="text-sm font-bold text-emerald-800">
            Employee added successfully! Redirecting to directory...
          </p>
        </div>
      )}

      {serverError && (
        <div className="bg-red-50 border border-red-200 rounded-2xl p-4 flex items-center gap-3 animate-in slide-in-from-top-4">
          <AlertCircle size={24} className="text-red-500" />
          <p className="text-sm font-bold text-red-800">{serverError}</p>
        </div>
      )}

      <div className="bg-card rounded-2xl shadow-sm border border-border overflow-hidden">
        <div className="bg-muted/30 px-8 py-6 border-b border-border">
          <h2 className="text-lg font-bold text-foreground flex items-center gap-2">
            <UserPlus size={20} className="text-indigo-500" /> Employee Details
          </h2>
        </div>
        
        <form onSubmit={handleSubmit(onSubmit)} className="p-8 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            <div className="space-y-2">
              <label className="text-sm font-bold text-foreground">Full Name <span className="text-red-500">*</span></label>
              <input type="text" placeholder="e.g. John Doe" className={inputClass("name")} {...register("name")} />
              {errors.name && <p className="text-red-500 text-xs mt-1.5 font-bold">{errors.name.message}</p>}
            </div>

            <div className="space-y-2">
              <label className="text-sm font-bold text-foreground">Email Address <span className="text-red-500">*</span></label>
              <input type="email" placeholder="john@workmate.com" className={inputClass("email")} {...register("email")} />
              {errors.email && <p className="text-red-500 text-xs mt-1.5 font-bold">{errors.email.message}</p>}
            </div>

            <div className="space-y-2">
              <label className="text-sm font-bold text-foreground">Job Role <span className="text-red-500">*</span></label>
              <input type="text" placeholder="e.g. Frontend Developer" className={inputClass("role")} {...register("role")} />
              {errors.role && <p className="text-red-500 text-xs mt-1.5 font-bold">{errors.role.message}</p>}
            </div>

            <div className="space-y-2">
              <label className="text-sm font-bold text-foreground">Department <span className="text-red-500">*</span></label>
              <select className={inputClass("department")} {...register("department")}>
                {departments.map(d => <option key={d} value={d}>{d}</option>)}
              </select>
              {errors.department && <p className="text-red-500 text-xs mt-1.5 font-bold">{errors.department.message}</p>}
            </div>

            <div className="space-y-2">
              <label className="text-sm font-bold text-foreground">Phone Number</label>
              <input type="text" placeholder="+1 555-0100" className={inputClass("phone")} {...register("phone")} />
              {errors.phone && <p className="text-red-500 text-xs mt-1.5 font-bold">{errors.phone.message}</p>}
            </div>

            <div className="space-y-2">
              <label className="text-sm font-bold text-foreground">Salary (Annual)</label>
              <input type="number" placeholder="e.g. 85000" className={inputClass("salary")} {...register("salary")} />
              {errors.salary && <p className="text-red-500 text-xs mt-1.5 font-bold">{errors.salary.message}</p>}
            </div>

            <div className="space-y-2">
              <label className="text-sm font-bold text-foreground">Status <span className="text-red-500">*</span></label>
              <select className={inputClass("status")} {...register("status")}>
                <option value="Active">Active</option>
                <option value="Inactive">Inactive</option>
              </select>
              {errors.status && <p className="text-red-500 text-xs mt-1.5 font-bold">{errors.status.message}</p>}
            </div>

            <div className="space-y-2">
              <label className="text-sm font-bold text-foreground">Joined Date <span className="text-red-500">*</span></label>
              <input type="date" className={inputClass("joinedDate")} {...register("joinedDate")} />
              {errors.joinedDate && <p className="text-red-500 text-xs mt-1.5 font-bold">{errors.joinedDate.message}</p>}
            </div>
          </div>

          <div className="pt-6 border-t border-border flex items-center justify-end gap-4">
            <Link 
              href="/dashboard/employees"
              className="px-6 py-3 rounded-xl text-sm font-bold text-muted-foreground hover:bg-muted transition-colors"
            >
              Cancel
            </Link>
            <button
              type="submit"
              disabled={isSubmitting || isSuccess}
              className="px-6 py-3 rounded-xl bg-indigo-600 text-sm font-bold text-white shadow-md shadow-indigo-600/20 hover:bg-indigo-500 active:scale-95 transition-all disabled:opacity-70 disabled:cursor-not-allowed flex items-center gap-2"
            >
              {isSubmitting ? (
                <>
                  <Loader2 size={16} className="animate-spin" />
                  Creating...
                </>
              ) : (
                "Create Employee"
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
