"use client";

import React, { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Eye, EyeOff, CheckSquare, AlertCircle, Loader2 } from "lucide-react";
import SplitText from "@/components/SplitText";
import { loginAPI, setToken, setUser } from "@/lib/api";

const loginSchema = z.object({
  email: z
    .string()
    .min(1, { message: "Email is required" })
    .email({ message: "Please enter a valid email address" }),
  password: z.string().min(1, { message: "Password is required" }),
  rememberMe: z.boolean().optional(),
});

type LoginFormValues = z.infer<typeof loginSchema>;

export default function LoginPage() {
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const [serverError, setServerError] = useState("");

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
      rememberMe: false,
    },
  });

  const rememberMeValue = watch("rememberMe");

  const onSubmit = async (data: LoginFormValues) => {
    setServerError("");
    try {
      const res = await loginAPI({ email: data.email, password: data.password });
      setToken(res.data.token);
      setUser(res.data.user);
      router.push("/dashboard");
    } catch (err: any) {
      setServerError(err.message || "Login failed. Please try again.");
    }
  };

  return (
    <div className="flex min-h-screen w-full bg-theme-bg lg:bg-theme-card text-theme-heading font-sans">
      <div className="flex w-full flex-col lg:w-1/2 relative lg:border-r border-theme-border bg-theme-card shadow-2xl lg:shadow-none sm:rounded-r-3xl lg:rounded-none z-10 transition-all">
        
        <div className="p-6 sm:p-10 lg:p-12 pb-0">
          <Link href="/" className="inline-flex items-center gap-2 group">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-600 text-white shadow-md shadow-indigo-600/20 transition-transform group-hover:scale-105">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M2 12h10"/><path d="M9 4v16"/><path d="m3 9 3 3-3 3"/></svg>
            </div>
            <span className="text-2xl font-black text-indigo-950 tracking-tight">WorkMate</span>
          </Link>
        </div>

        <div className="flex flex-1 items-center justify-center p-6 sm:p-10 lg:p-12">
          <div className="w-full max-w-[440px] animate-in fade-in slide-in-from-bottom-4 duration-700">
            <SplitText
              text="Sign in"
              tag="h1"
              className="text-3xl sm:text-4xl font-extrabold text-theme-heading mb-3 tracking-tight"
              delay={60}
              duration={0.7}
              ease="power4.out"
              splitType="chars"
              from={{ opacity: 0, y: 50 }}
              to={{ opacity: 1, y: 0 }}
              threshold={0.5}
              rootMargin="0px"
              textAlign="left"
            />
            <SplitText
              text="Welcome back! Please enter your details."
              tag="p"
              className="text-theme-text mb-8 sm:mb-10 text-base sm:text-lg"
              delay={30}
              duration={0.5}
              ease="power2.out"
              splitType="words"
              from={{ opacity: 0, y: 20 }}
              to={{ opacity: 1, y: 0 }}
              threshold={0.5}
              rootMargin="0px"
              textAlign="left"
            />

            {serverError && (
              <div className="mb-6 flex items-center gap-3 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-semibold text-red-700 animate-in slide-in-from-top-2 duration-300">
                <AlertCircle size={18} className="shrink-0" />
                {serverError}
              </div>
            )}

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-5 sm:space-y-6">
              
              <div className="space-y-2">
                <label className="text-sm font-bold text-theme-heading" htmlFor="email">
                  Email
                </label>
                <div className="relative">
                  <input
                    id="email"
                    type="email"
                    placeholder="Enter your email"
                    className={`block w-full rounded-xl border-0 py-3.5 px-4 text-theme-heading shadow-sm ring-1 ring-inset transition-all sm:text-sm sm:leading-6 ${
                      errors.email 
                        ? "ring-red-500 focus:ring-2 focus:ring-inset focus:ring-red-600 bg-red-50" 
                        : "ring-slate-300 placeholder:text-slate-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 bg-theme-card"
                    }`}
                    {...register("email")}
                  />
                  {errors.email && (
                    <p className="text-red-500 text-xs sm:text-sm mt-1.5 font-medium">{errors.email.message}</p>
                  )}
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-bold text-theme-heading" htmlFor="password">
                  Password
                </label>
                <div className="relative">
                  <input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="••••••••"
                    className={`block w-full rounded-xl border-0 py-3.5 pl-4 pr-12 text-theme-heading shadow-sm ring-1 ring-inset transition-all sm:text-sm sm:leading-6 ${
                      errors.password 
                        ? "ring-red-500 focus:ring-2 focus:ring-inset focus:ring-red-600 bg-red-50" 
                        : "ring-slate-300 placeholder:text-slate-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 bg-theme-card"
                    }`}
                    {...register("password")}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-3.5 text-slate-400 hover:text-slate-600 transition-colors"
                  >
                    {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                  </button>
                  {errors.password && (
                    <p className="text-red-500 text-xs sm:text-sm mt-1.5 font-medium">{errors.password.message}</p>
                  )}
                </div>
              </div>

              <div className="flex items-center justify-between pt-1">
                <button
                  type="button"
                  onClick={() => setValue("rememberMe", !rememberMeValue)}
                  className="flex items-center gap-2.5 group focus:outline-none"
                >
                  <div className="flex h-5 w-5 items-center justify-center rounded border border-slate-300 bg-theme-card text-indigo-600 transition-colors group-hover:border-indigo-500 group-focus:ring-2 group-focus:ring-indigo-600 group-focus:ring-offset-2">
                    {rememberMeValue && <CheckSquare size={16} strokeWidth={3} className="text-indigo-600" />}
                  </div>
                  <span className="text-sm font-medium text-slate-600 group-hover:text-theme-heading transition-colors select-none">Remember for 30 days</span>
                </button>
                <Link href="#" className="text-sm font-semibold text-indigo-600 hover:text-indigo-500 transition-colors">
                  Forgot password?
                </Link>
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="mt-6 w-full rounded-xl bg-indigo-600 px-4 py-3.5 text-center text-sm sm:text-base font-bold text-white shadow-md shadow-indigo-600/20 transition-all hover:bg-indigo-500 hover:shadow-lg hover:shadow-indigo-600/30 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 active:scale-[0.98] disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 size={18} className="animate-spin" />
                    Signing in...
                  </>
                ) : (
                  "Sign in"
                )}
              </button>

              <p className="text-center text-sm text-slate-500 mt-4">
                Demo: <span className="font-semibold text-slate-700">admin@workmate.com</span> / <span className="font-semibold text-slate-700">Admin@123</span>
              </p>

            </form>
          </div>
        </div>
      </div>

      <div className="hidden lg:flex w-1/2 flex-col bg-theme-bg relative overflow-hidden">
        
        <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-indigo-100 rounded-full blur-[100px] opacity-70"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-blue-100 rounded-full blur-[100px] opacity-70"></div>

        <div className="absolute top-8 right-12 z-20 flex items-center gap-8">
          <Link href="#" className="text-theme-text font-semibold text-sm hover:text-indigo-600 transition-colors">Home</Link>
          <Link href="#" className="text-theme-text font-semibold text-sm hover:text-indigo-600 transition-colors">About us</Link>
          <Link href="#" className="text-theme-text font-semibold text-sm hover:text-indigo-600 transition-colors">Blog</Link>
          <Link href="#" className="text-theme-text font-semibold text-sm hover:text-indigo-600 transition-colors">Pricing</Link>
        </div>

        <div className="flex flex-1 items-center justify-center p-12 z-10">
          <div className="relative w-full max-w-[600px] aspect-square transition-transform duration-700 hover:scale-[1.02]">
            <Image
              src="/ems_illustration.png"
              alt="WorkMate Dashboard"
              fill
              className="object-contain drop-shadow-2xl opacity-95"
              priority
            />
          </div>
        </div>

      </div>
    </div>
  );
}
