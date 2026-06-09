"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Users,
  UserPlus,
  Settings,
  LogOut,
  Menu,
  X,
  Bell,
  Search,
  User,
  Shield,
  Moon,
  Sun,
  CheckCircle2,
  Clock,
  ChevronRight
} from "lucide-react";

import { DropdownMenu, DropdownMenuContent, DropdownMenuGroup, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from "@/components/ui/breadcrumb";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(false);

  const navigation = [
    { name: "Overview", href: "/dashboard", icon: LayoutDashboard },
    { name: "Employee Directory", href: "/dashboard/employees", icon: Users },
    { name: "Add Employee", href: "/dashboard/employees/add", icon: UserPlus },
  ];

  const toggleSidebar = () => setSidebarOpen(!sidebarOpen);

  const toggleDarkMode = () => {
    setIsDarkMode(!isDarkMode);
    if (!isDarkMode) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  };

  const getPageTitle = () => {
    if (pathname === '/dashboard') return "Overview";
    if (pathname === '/dashboard/employees') return "Employee Directory";
    if (pathname === '/dashboard/employees/add') return "Add Employee";
    if (pathname === '/dashboard/profile') return "My Profile";
    if (pathname === '/dashboard/settings') return "Account Settings";
    return "Dashboard";
  };

  return (
    <div className="min-h-screen bg-background flex font-sans text-foreground overflow-hidden relative transition-colors duration-300">

      {/* Mobile Sidebar Overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-slate-900/50 backdrop-blur-sm lg:hidden transition-opacity"
          onClick={toggleSidebar}
        />
      )}

      {/* Sidebar */}
      <div
        className={`fixed inset-y-0 left-0 z-50 w-72 bg-[#0A0F29] text-white transform transition-transform duration-300 lg:relative lg:translate-x-0 ${sidebarOpen ? "translate-x-0" : "-translate-x-full"}`}
      >
        <div className="flex h-20 items-center justify-between px-8 border-b border-white/10">
          <Link href="/dashboard" className="flex items-center gap-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-500 shadow-md">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M2 12h10" />
                <path d="M9 4v16" />
                <path d="m3 9 3 3-3 3" />
              </svg>
            </div>
            <span className="text-xl font-black tracking-wide text-white">
              WorkMate
            </span>
          </Link>
          <button
            onClick={toggleSidebar}
            className="lg:hidden text-slate-400 hover:text-white transition"
          >
            <X size={24} />
          </button>
        </div>

        <div className="px-4 py-8 flex flex-col gap-1">
          <p className="px-4 text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2">
            Menu
          </p>
          {navigation.map((item) => {
            const isActive = pathname === item.href;
            const Icon = item.icon;
            return (
              <Link
                key={item.name}
                href={item.href}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all font-medium ${
                  isActive
                    ? "bg-indigo-600 shadow-lg shadow-indigo-600/20 text-white"
                    : "text-slate-400 hover:bg-white/5 hover:text-slate-200"
                }`}
              >
                <Icon
                  size={20}
                  className={isActive ? "text-white" : "text-slate-400"}
                />
                {item.name}
              </Link>
            );
          })}
        </div>

        <div className="absolute bottom-8 left-0 w-full px-4">
          <Link
            href="/"
            className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-slate-400 hover:bg-white/5 hover:text-red-400 transition-colors font-medium"
          >
            <LogOut size={20} />
            Sign Out
          </Link>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 h-screen overflow-hidden relative">
        {/* Topbar */}
        <header className="h-20 bg-card border-b border-border flex items-center justify-between px-4 sm:px-8 z-30 shrink-0 transition-colors duration-300">
          <div className="flex items-center gap-4">
            <button
              onClick={toggleSidebar}
              className="lg:hidden p-2 rounded-lg text-muted-foreground hover:bg-slate-100 dark:hover:bg-slate-800 transition"
            >
              <Menu size={24} />
            </button>
            <div className="hidden md:flex items-center relative text-muted-foreground">
              <Search size={20} className="absolute left-3" />
              <input
                type="text"
                placeholder="Search anything..."
                className="pl-10 pr-4 py-2 bg-slate-100 dark:bg-slate-800 rounded-full text-sm font-medium focus:outline-none focus:ring-2 focus:ring-primary w-64 transition-all text-foreground"
              />
            </div>
          </div>

          <div className="flex items-center gap-3 sm:gap-5 z-50">
            {/* Dark Mode Toggle Button */}
            <button
              onClick={toggleDarkMode}
              className="p-2 rounded-full text-muted-foreground hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-foreground transition"
              title="Toggle Dark Mode"
            >
              {isDarkMode ? <Sun size={20} /> : <Moon size={20} />}
            </button>

            {/* Notifications Dropdown using Shadcn */}
            <DropdownMenu>
              <DropdownMenuTrigger className="relative p-2 rounded-full text-muted-foreground hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-foreground transition-colors outline-none ring-0">
                <div className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full border-2 border-card"></div>
                <Bell size={20} />
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-80 p-0 rounded-2xl">
                <div className="px-5 py-4 border-b flex items-center justify-between bg-muted/30">
                  <h3 className="font-bold text-foreground">Notifications</h3>
                  <span className="text-xs font-bold text-primary bg-primary/10 px-2 py-1 rounded-full">2 New</span>
                </div>
                <div className="flex flex-col max-h-[300px] overflow-y-auto">
                  <DropdownMenuItem className="p-4 cursor-pointer gap-3 rounded-none focus:bg-muted">
                    <div className="mt-0.5 text-emerald-500"><CheckCircle2 size={18} /></div>
                    <div className="flex-1">
                      <p className="text-sm font-bold text-foreground">System update complete</p>
                      <p className="text-xs text-muted-foreground font-medium mt-0.5">All services are running normally.</p>
                      <p className="text-[10px] text-slate-400 font-bold mt-1 uppercase tracking-widest">2 min ago</p>
                    </div>
                  </DropdownMenuItem>
                  <DropdownMenuItem className="p-4 cursor-pointer gap-3 rounded-none focus:bg-muted">
                    <div className="mt-0.5 text-blue-500"><UserPlus size={18} /></div>
                    <div className="flex-1">
                      <p className="text-sm font-bold text-foreground">New employee joined</p>
                      <p className="text-xs text-muted-foreground font-medium mt-0.5">Sarah Connor has joined as Software Engineer.</p>
                      <p className="text-[10px] text-slate-400 font-bold mt-1 uppercase tracking-widest">1 hr ago</p>
                    </div>
                  </DropdownMenuItem>
                </div>
                <div className="p-3 border-t text-center">
                  <button className="text-sm font-bold text-primary hover:text-primary/80">View All Notifications</button>
                </div>
              </DropdownMenuContent>
            </DropdownMenu>

            {/* Quick Settings */}
            <DropdownMenu>
              <DropdownMenuTrigger className="hidden sm:flex p-2 rounded-full text-muted-foreground hover:bg-slate-100 hover:text-foreground dark:hover:bg-slate-800 transition-colors outline-none ring-0">
                <Settings size={20} />
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-64 rounded-2xl">
                <DropdownMenuLabel className="font-bold text-base px-4 py-3">Quick Settings</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuGroup className="p-2">
                  <DropdownMenuItem className="flex gap-3 px-3 py-2.5 rounded-xl cursor-pointer">
                    <Shield size={18} className="text-muted-foreground" />
                    <span className="font-semibold text-sm">Security Settings</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem className="flex gap-3 px-3 py-2.5 rounded-xl cursor-pointer">
                    <Settings size={18} className="text-muted-foreground" />
                    <span className="font-semibold text-sm">General Preferences</span>
                  </DropdownMenuItem>
                </DropdownMenuGroup>
              </DropdownMenuContent>
            </DropdownMenu>

            <div className="w-px h-8 bg-border hidden sm:block"></div>

            {/* User Profile using Shadcn Dropdown & Avatar */}
            <DropdownMenu>
              <DropdownMenuTrigger className="cursor-pointer outline-none">
                <Avatar className="h-9 w-9 border border-primary/20 hover:ring-2 ring-primary/50 ring-offset-1 transition-all">
                  <AvatarImage src="https://avatar.vercel.sh/admin" />
                  <AvatarFallback className="bg-primary/10 text-primary font-bold">A</AvatarFallback>
                </Avatar>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-64 rounded-2xl mt-1">
                <div className="px-5 py-4 border-b">
                  <p className="font-bold text-lg text-foreground leading-tight tracking-tight">Admin User</p>
                  <p className="text-sm font-medium text-muted-foreground mt-1">admin@workmate.com</p>
                </div>
                <DropdownMenuGroup className="p-2 border-b">
                  <DropdownMenuItem className="rounded-xl cursor-pointer py-2.5 px-3">
                    <Link href="/dashboard/profile" className="flex items-center gap-3 w-full">
                      <User size={18} className="text-muted-foreground" />
                      <span className="font-semibold text-sm">My Profile</span>
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem className="rounded-xl cursor-pointer py-2.5 px-3">
                    <Link href="/dashboard/settings" className="flex items-center gap-3 w-full">
                      <Settings size={18} className="text-muted-foreground" />
                      <span className="font-semibold text-sm">Account Settings</span>
                    </Link>
                  </DropdownMenuItem>
                </DropdownMenuGroup>
                <div className="p-2">
                  <DropdownMenuItem className="rounded-xl cursor-pointer py-2.5 px-3 focus:bg-destructive/10 focus:text-destructive">
                    <Link href="/" className="flex items-center gap-3 w-full text-destructive">
                      <LogOut size={18} />
                      <span className="font-semibold text-sm">Sign Out</span>
                    </Link>
                  </DropdownMenuItem>
                </div>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </header>

        {/* Scrollable Page Content */}
        <main className="flex-1 overflow-y-auto bg-muted/20 p-4 sm:p-8 transition-colors duration-300">
          <div className="max-w-7xl mx-auto flex flex-col gap-6">
            
            {/* Breadcrumb Navigation Added Here */}
            <Breadcrumb className="hidden sm:flex">
              <BreadcrumbList>
                <BreadcrumbItem>
                  <BreadcrumbLink>
                    <Link href="/dashboard">Dashboard</Link>
                  </BreadcrumbLink>
                </BreadcrumbItem>
                {pathname !== '/dashboard' && (
                  <>
                    <BreadcrumbSeparator />
                    <BreadcrumbItem>
                      <BreadcrumbPage className="font-semibold text-foreground">{getPageTitle()}</BreadcrumbPage>
                    </BreadcrumbItem>
                  </>
                )}
              </BreadcrumbList>
            </Breadcrumb>

            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
