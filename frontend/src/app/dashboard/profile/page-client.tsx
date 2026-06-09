"use client";

import React from "react";
import { Camera, Mail, Phone, MapPin, Building, Briefcase } from "lucide-react";

export default function ProfileClient() {
  return (
    <div className="max-w-4xl mx-auto space-y-6 animate-in fade-in duration-500">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-extrabold text-theme-heading tracking-tight">
            My Profile
          </h1>
          <p className="text-theme-text mt-1 text-sm font-medium">
            Manage your personal information and details.
          </p>
        </div>
        <button className="px-5 py-2.5 rounded-xl bg-indigo-600 text-white font-bold text-sm shadow-md shadow-indigo-600/20 hover:bg-indigo-500 transition-all active:scale-95">
          Save Changes
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Profile Card (Left side) */}
        <div className="md:col-span-1 border border-theme-border bg-theme-card rounded-2xl shadow-sm overflow-hidden flex flex-col items-center p-6 pb-8">
          <div className="w-32 h-32 rounded-full bg-gradient-to-tr from-indigo-500 to-purple-500 p-1 mb-4 relative shadow-md">
            <div className="w-full h-full bg-white rounded-full flex items-center justify-center font-black text-5xl text-indigo-600">
              A
            </div>
            <button className="absolute bottom-0 right-0 w-8 h-8 rounded-full bg-white border border-theme-border flex items-center justify-center shadow-sm text-slate-400 hover:text-indigo-600 transition-colors">
              <Camera size={16} />
            </button>
          </div>
          <h2 className="text-xl font-bold text-theme-heading">Admin User</h2>
          <p className="text-theme-text text-sm font-semibold mb-4">
            admin@workmate.com
          </p>
          <span className="bg-indigo-50 text-indigo-600 px-3 py-1 rounded-full text-xs font-bold ring-1 ring-inset ring-indigo-600/20">
            System Administrator
          </span>
        </div>

        {/* Details Form (Right side) */}
        <div className="md:col-span-2 border border-theme-border bg-theme-card rounded-2xl shadow-sm p-8 space-y-6">
          <h3 className="text-lg font-bold text-theme-heading mb-4">
            Personal Information
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-sm font-bold text-theme-heading">
                Full Name
              </label>
              <input
                type="text"
                defaultValue="Admin User"
                className="w-full rounded-xl bg-theme-bg border border-theme-border py-2.5 px-4 text-theme-heading focus:ring-2 focus:ring-indigo-600 outline-none transition-all font-medium text-sm"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-bold text-theme-heading">
                Email Address
              </label>
              <div className="relative">
                <Mail
                  size={16}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                />
                <input
                  type="email"
                  defaultValue="admin@workmate.com"
                  className="w-full rounded-xl bg-theme-bg border border-theme-border py-2.5 pl-10 pr-4 text-theme-heading focus:ring-2 focus:ring-indigo-600 outline-none transition-all font-medium text-sm"
                />
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-bold text-theme-heading">
                Phone Number
              </label>
              <div className="relative">
                <Phone
                  size={16}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                />
                <input
                  type="tel"
                  defaultValue="+1 (555) 000-1234"
                  className="w-full rounded-xl bg-theme-bg border border-theme-border py-2.5 pl-10 pr-4 text-theme-heading focus:ring-2 focus:ring-indigo-600 outline-none transition-all font-medium text-sm"
                />
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-bold text-theme-heading">
                Location
              </label>
              <div className="relative">
                <MapPin
                  size={16}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                />
                <input
                  type="text"
                  defaultValue="New York, USA"
                  className="w-full rounded-xl bg-theme-bg border border-theme-border py-2.5 pl-10 pr-4 text-theme-heading focus:ring-2 focus:ring-indigo-600 outline-none transition-all font-medium text-sm"
                />
              </div>
            </div>
          </div>

          <div className="border-t border-theme-border pt-6 mt-6">
            <h3 className="text-lg font-bold text-theme-heading mb-4">
              Work Information
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-sm font-bold text-theme-heading">
                  Department
                </label>
                <div className="relative">
                  <Building
                    size={16}
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                  />
                  <input
                    type="text"
                    defaultValue="Technology"
                    readOnly
                    className="w-full rounded-xl bg-theme-bg border border-theme-border py-2.5 pl-10 pr-4 text-theme-text font-medium text-sm"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-bold text-theme-heading">
                  Job Title
                </label>
                <div className="relative">
                  <Briefcase
                    size={16}
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                  />
                  <input
                    type="text"
                    defaultValue="System Administrator"
                    readOnly
                    className="w-full rounded-xl bg-theme-bg border border-theme-border py-2.5 pl-10 pr-4 text-theme-text font-medium text-sm"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
