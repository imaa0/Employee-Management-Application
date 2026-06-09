"use client";

import React, { useState } from "react";
import { Shield, Key, Bell, Globe, Smartphone, Lock, Loader2, AlertCircle, CheckCircle2 } from "lucide-react";
import { updatePasswordAPI } from "@/lib/api";

export default function SettingsClient() {
  const [activeTab, setActiveTab] = useState("security");
  const [isUpdatingPwd, setIsUpdatingPwd] = useState(false);
  const [pwdMsg, setPwdMsg] = useState<{type: "error" | "success", text: string} | null>(null);

  const handlePasswordUpdate = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setPwdMsg(null);
    const formData = new FormData(e.currentTarget);
    const currentPassword = formData.get("currentPassword") as string;
    const newPassword = formData.get("newPassword") as string;
    const confirmPassword = formData.get("confirmPassword") as string;

    if (newPassword !== confirmPassword) {
      return setPwdMsg({ type: "error", text: "New passwords do not match." });
    }

    if (newPassword.length < 6) {
      return setPwdMsg({ type: "error", text: "New password must be at least 6 characters." });
    }

    try {
      setIsUpdatingPwd(true);
      const res = await updatePasswordAPI({ currentPassword, newPassword });
      if (res.success) {
        setPwdMsg({ type: "success", text: "Password updated successfully!" });
        (e.target as HTMLFormElement).reset();
      }
    } catch (err: any) {
      setPwdMsg({ type: "error", text: err.message || "Failed to update password." });
    } finally {
      setIsUpdatingPwd(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 animate-in fade-in duration-500">
      {/* Header Area */}
      <div>
        <h1 className="text-3xl font-extrabold text-theme-heading tracking-tight">
          Account Settings
        </h1>
        <p className="text-theme-text mt-1 text-sm font-medium">
          Manage preferences, security, and notification settings.
        </p>
      </div>

      <div className="flex flex-col md:flex-row gap-8">
        {/* Settings Navigation Sidebar */}
        <div className="w-full md:w-64 shrink-0 space-y-2">
          <button
            onClick={() => setActiveTab("security")}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-bold text-sm transition-all ${
              activeTab === "security"
                ? "bg-indigo-50 text-indigo-700"
                : "text-theme-text hover:bg-theme-bg/50 hover:text-theme-heading"
            }`}
          >
            <Shield size={18} /> Password &amp; Security
          </button>
          <button
            onClick={() => setActiveTab("notifications")}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-bold text-sm transition-all ${
              activeTab === "notifications"
                ? "bg-indigo-50 text-indigo-700"
                : "text-theme-text hover:bg-theme-bg/50 hover:text-theme-heading"
            }`}
          >
            <Bell size={18} /> Notifications
          </button>
          <button
            onClick={() => setActiveTab("preferences")}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-bold text-sm transition-all ${
              activeTab === "preferences"
                ? "bg-indigo-50 text-indigo-700"
                : "text-theme-text hover:bg-theme-bg/50 hover:text-theme-heading"
            }`}
          >
            <Globe size={18} /> General Preferences
          </button>
        </div>

        {/* Content Area */}
        <div className="flex-1 bg-theme-card border border-theme-border rounded-2xl shadow-sm p-8">
          {activeTab === "security" && (
            <div className="space-y-8 animate-in slide-in-from-right-4 duration-300">
              <div>
                <h2 className="text-xl font-bold text-theme-heading flex items-center gap-2 mb-1">
                  <Key size={20} className="text-indigo-500" /> Change Password
                </h2>
                <p className="text-theme-text text-sm">
                  Update your password to keep your account secure.
                </p>
              </div>

              <form onSubmit={handlePasswordUpdate} className="space-y-4 max-w-md">
                
                {pwdMsg && (
                  <div className={`p-3 rounded-xl border flex items-center gap-2 text-sm font-bold ${pwdMsg.type === "error" ? "bg-red-50 text-red-600 border-red-200" : "bg-emerald-50 text-emerald-600 border-emerald-200"}`}>
                    {pwdMsg.type === "error" ? <AlertCircle size={18} /> : <CheckCircle2 size={18} />}
                    {pwdMsg.text}
                  </div>
                )}

                <div className="space-y-2">
                  <label className="text-sm font-bold text-theme-heading">
                    Current Password
                  </label>
                  <input
                    type="password"
                    name="currentPassword"
                    required
                    placeholder="••••••••"
                    className="w-full rounded-xl bg-theme-bg border border-theme-border py-2.5 px-4 text-theme-heading focus:ring-2 focus:ring-indigo-600 outline-none transition-all font-medium text-sm"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-bold text-theme-heading">
                    New Password
                  </label>
                  <input
                    type="password"
                    name="newPassword"
                    required
                    placeholder="••••••••"
                    className="w-full rounded-xl bg-theme-bg border border-theme-border py-2.5 px-4 text-theme-heading focus:ring-2 focus:ring-indigo-600 outline-none transition-all font-medium text-sm"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-bold text-theme-heading">
                    Confirm New Password
                  </label>
                  <input
                    type="password"
                    name="confirmPassword"
                    required
                    placeholder="••••••••"
                    className="w-full rounded-xl bg-theme-bg border border-theme-border py-2.5 px-4 text-theme-heading focus:ring-2 focus:ring-indigo-600 outline-none transition-all font-medium text-sm"
                  />
                </div>
                <button type="submit" disabled={isUpdatingPwd} className="px-5 py-2.5 mt-2 rounded-xl bg-indigo-600 text-white font-bold text-sm shadow-md shadow-indigo-600/20 hover:bg-indigo-500 transition-all active:scale-95 flex items-center gap-2 disabled:opacity-50">
                  {isUpdatingPwd && <Loader2 size={16} className="animate-spin" />}
                  Update Password
                </button>
              </form>

              <div className="border-t border-theme-border pt-8 mt-8">
                <h2 className="text-xl font-bold text-theme-heading flex items-center gap-2 mb-4">
                  <Smartphone size={20} className="text-indigo-500" />{" "}
                  Two-Factor Authentication
                </h2>
                <div className="flex items-center justify-between p-4 border border-theme-border rounded-xl bg-theme-bg/50">
                  <div className="flex items-start gap-4">
                    <div className="p-2 bg-indigo-100 text-indigo-600 rounded-full mt-1">
                      <Lock size={16} />
                    </div>
                    <div>
                      <h3 className="font-bold text-theme-heading">
                        Authenticator App
                      </h3>
                      <p className="text-sm text-theme-text mt-0.5 max-w-sm">
                        Use an app like Google Authenticator to generate
                        verification codes.
                      </p>
                    </div>
                  </div>
                  <button className="px-4 py-2 border border-theme-border text-theme-heading bg-theme-card hover:bg-theme-bg font-bold text-sm rounded-lg transition-colors">
                    Enable
                  </button>
                </div>
              </div>
            </div>
          )}

          {activeTab === "notifications" && (
            <div className="space-y-8 animate-in slide-in-from-right-4 duration-300">
              <div>
                <h2 className="text-xl font-bold text-theme-heading">
                  Notification Preferences
                </h2>
                <p className="text-theme-text text-sm mt-1">
                  Choose how you want to be notified about activity.
                </p>
              </div>

              <div className="space-y-4">
                {[
                  {
                    title: "Email Notifications",
                    desc: "Receive daily summary emails",
                  },
                  {
                    title: "Push Notifications",
                    desc: "Get instantly alerted on your browser",
                  },
                  {
                    title: "System Alerts",
                    desc: "Critical system and security updates",
                  },
                  {
                    title: "New Employee Alerts",
                    desc: "When someone joins your department",
                  },
                ].map((item, idx) => (
                  <div
                    key={idx}
                    className="flex items-center justify-between p-4 border-b border-theme-border last:border-0 pb-4"
                  >
                    <div>
                      <h3 className="font-bold text-theme-heading">
                        {item.title}
                      </h3>
                      <p className="text-sm text-theme-text mt-0.5">
                        {item.desc}
                      </p>
                    </div>
                    <div className="w-10 h-6 bg-indigo-600 rounded-full flex items-center p-1 cursor-pointer">
                      <div className="w-4 h-4 bg-white rounded-full translate-x-4 shadow-sm"></div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === "preferences" && (
            <div className="space-y-8 animate-in slide-in-from-right-4 duration-300">
              <div>
                <h2 className="text-xl font-bold text-theme-heading">
                  General Preferences
                </h2>
                <p className="text-theme-text text-sm mt-1">
                  Customize your basic workspace experience.
                </p>
              </div>

              <div className="space-y-6 max-w-md">
                <div className="space-y-2">
                  <label className="text-sm font-bold text-theme-heading">
                    Language
                  </label>
                  <select className="w-full rounded-xl bg-theme-bg border border-theme-border py-2.5 px-4 text-theme-heading focus:ring-2 focus:ring-indigo-600 outline-none transition-all font-medium text-sm appearance-none">
                    <option>English (United States)</option>
                    <option>Spanish</option>
                    <option>French</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-bold text-theme-heading">
                    Timezone
                  </label>
                  <select className="w-full rounded-xl bg-theme-bg border border-theme-border py-2.5 px-4 text-theme-heading focus:ring-2 focus:ring-indigo-600 outline-none transition-all font-medium text-sm appearance-none">
                    <option>Pacific Time (PT)</option>
                    <option>Eastern Time (ET)</option>
                    <option>Coordinated Universal Time (UTC)</option>
                  </select>
                </div>
                <button className="px-5 py-2.5 mt-2 rounded-xl bg-indigo-600 text-white font-bold text-sm shadow-md shadow-indigo-600/20 hover:bg-indigo-500 transition-all active:scale-95">
                  Save Preferences
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
