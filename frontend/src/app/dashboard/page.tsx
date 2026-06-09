"use client";

import React, { useState, useEffect } from "react";
import { Users, UserCheck, UserMinus, Building, ArrowUpRight, Loader2, RefreshCw } from "lucide-react";
import Link from "next/link";
import SplitText from "@/components/SplitText";
import { getEmployeeStatsAPI, type EmployeeStats } from "@/lib/api";

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { Bar, BarChart, CartesianGrid, XAxis } from "recharts";

const chartConfig = {
  hires: {
    label: "Hires",
    color: "hsl(var(--primary))",
  },
};

export default function DashboardPage() {
  const [stats, setStats] = useState<EmployeeStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchStats = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await getEmployeeStatsAPI();
      setStats(res.data);
    } catch (err: any) {
      setError(err.message || "Failed to load dashboard data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="flex flex-col items-center gap-3">
          <Loader2 size={36} className="animate-spin text-primary" />
          <p className="text-sm font-semibold text-muted-foreground">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center space-y-4">
          <p className="text-destructive font-semibold">{error}</p>
          <button onClick={fetchStats} className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-primary text-primary-foreground text-sm font-bold hover:bg-primary/90 transition">
            <RefreshCw size={16} /> Retry
          </button>
        </div>
      </div>
    );
  }

  if (!stats) return null;

  const statCards = [
    { title: "Total Employees", value: stats.total, icon: Users, trend: "+12%" },
    { title: "Active Employees", value: stats.active, icon: UserCheck, trend: "+5%" },
    { title: "Inactive Employees", value: stats.inactive, icon: UserMinus, trend: "-2%" },
    { title: "Departments", value: stats.departments, icon: Building, trend: "0%" },
  ];

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      
      <div className="flex items-center justify-between">
        <div>
          <div className="block">
            <SplitText
              text="Dashboard Overview"
              tag="h1"
              className="text-3xl font-extrabold text-foreground tracking-tight"
              delay={50}
              duration={0.65}
              ease="power4.out"
              splitType="chars"
              from={{ opacity: 0, y: 40 }}
              to={{ opacity: 1, y: 0 }}
              threshold={0.5}
              rootMargin="0px"
              textAlign="left"
            />
          </div>
          <div className="block mt-1">
            <SplitText
              text="Welcome back! Here's what's happening at WorkMate today."
              tag="p"
              className="text-muted-foreground text-lg"
              delay={25}
              duration={0.45}
              ease="power2.out"
              splitType="words"
              from={{ opacity: 0, y: 15 }}
              to={{ opacity: 1, y: 0 }}
              threshold={0.5}
              rootMargin="0px"
              textAlign="left"
            />
          </div>
        </div>
        <button
          onClick={fetchStats}
          className="hidden sm:inline-flex items-center gap-2 px-4 py-2 rounded-xl border border-border text-sm font-semibold text-muted-foreground hover:text-foreground hover:bg-muted/50 transition"
        >
          <RefreshCw size={14} /> Refresh
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((stat, idx) => {
          const Icon = stat.icon;
          return (
            <Card key={idx} className="border-border shadow-sm transition-all hover:shadow-md hover:border-primary/50">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">{stat.title}</CardTitle>
                <div className="p-2 rounded-xl bg-primary/10 text-primary">
                  <Icon size={20} strokeWidth={2.5} />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-extrabold text-foreground">{stat.value}</div>
                <div className="mt-2 flex items-center text-sm font-semibold">
                  <span className={stat.trend.startsWith('+') ? 'text-emerald-600' : stat.trend.startsWith('-') ? 'text-rose-600' : 'text-muted-foreground'}>
                    {stat.trend}
                  </span>
                  <span className="text-slate-500 ml-2">vs last month</span>
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        <Card className="lg:col-span-2 hidden lg:flex flex-col shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>Employment Growth</CardTitle>
              <CardDescription>Monthly new hires over the past 6 months</CardDescription>
            </div>
          </CardHeader>
          <CardContent className="flex-1 pb-4">
            <ChartContainer config={chartConfig} className="h-[300px] w-full">
              <BarChart accessibilityLayer data={stats.monthlyHires}>
                <CartesianGrid vertical={false} strokeDasharray="3 3"/>
                <XAxis
                  dataKey="month"
                  tickLine={false}
                  tickMargin={10}
                  axisLine={false}
                  tickFormatter={(value) => value.slice(0, 3)}
                />
                <ChartTooltip
                  cursor={false}
                  content={<ChartTooltipContent hideLabel />}
                />
                <Bar dataKey="hires" fill="var(--color-hires)" radius={8} />
              </BarChart>
            </ChartContainer>
          </CardContent>
        </Card>

        <Card className="shadow-sm flex flex-col">
          <CardHeader className="flex flex-row items-center justify-between pb-4">
            <div>
              <CardTitle>Recent Hires</CardTitle>
              <CardDescription>Newest team members</CardDescription>
            </div>
            <Link href="/dashboard/employees" className="text-xs font-semibold text-primary hover:text-primary/80 flex items-center gap-1 group">
              View All <ArrowUpRight size={14} className="group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
            </Link>
          </CardHeader>
          <CardContent className="flex-col gap-6 flex">
            {stats.recentHires.map(emp => (
              <div key={emp.id} className="flex items-center gap-4">
                <Avatar className="h-10 w-10 border border-primary/20">
                  <AvatarImage src={`https://avatar.vercel.sh/${emp.name}`} alt={emp.name} />
                  <AvatarFallback className="bg-primary/10 text-primary font-bold">
                    {emp.name.split(' ').map(n => n[0]).join('')}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-bold text-foreground truncate leading-tight">{emp.name}</p>
                  <p className="text-xs font-medium text-muted-foreground truncate mt-0.5">{emp.role}</p>
                </div>
                <div className="text-right flex flex-col items-end gap-1">
                  <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold ${
                    emp.status === 'Active' ? 'bg-emerald-50 text-emerald-700' : 'bg-rose-50 text-rose-700'
                  }`}>
                    {emp.status}
                  </span>
                  <p className="text-[10px] uppercase font-bold text-muted-foreground">{new Date(emp.joinedDate).toLocaleDateString(undefined, {month: 'short', day: 'numeric'})}</p>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
