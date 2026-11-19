
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Users,
  Settings,
  ShieldCheck,
  UserRound,
  FileText,
  HelpCircle,
  LogOut,
  X,
  ChevronLeft,
  Menu,
} from "lucide-react";

interface DashboardSidebarProps {
  role: "admin" | "user";
  open: boolean;
  collapsed: boolean;
  onClose: () => void;
  onToggle: () => void;
  onLogout: () => void;
}

const adminMenus = [
  {
    title: "MENU UTAMA",
    items: [
      { label: "Dashboard", href: "/dashboard/admin", icon: LayoutDashboard },
      { label: "Kelola Pengguna", href: "/dashboard/admin/users", icon: Users },
      { label: "Data Laporan", href: "/dashboard/admin/reports", icon: FileText },
    ],
  },
  {
    title: "PREFERENSI",
    items: [
      { label: "Pengaturan", href: "/dashboard/admin/settings", icon: Settings },
    ],
  },
];

const userMenus = [
  {
    title: "MENU UTAMA",
    items: [
      { label: "Dashboard", href: "/dashboard/user", icon: LayoutDashboard },
      { label: "Profil Saya", href: "/dashboard/user/profile", icon: UserRound },
      { label: "Aktivitas Saya", href: "/dashboard/user/activity", icon: FileText },
    ],
  },
  {
    title: "LAINNYA",
    items: [
      { label: "Bantuan", href: "/dashboard/user/help", icon: HelpCircle },
    ],
  },
];

export default function DashboardSidebar({
  role,
  open,
  collapsed,
  onClose,
  onToggle,
  onLogout,
}: DashboardSidebarProps) {
  const pathname = usePathname();
  const menus = role === "admin" ? adminMenus : userMenus;

  return (
    <>
      {open && (
        <div
          onClick={onClose}
          className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm lg:hidden"
        />
      )}

      <aside
        className={`fixed inset-y-0 left-0 z-50 flex flex-col bg-[#101B35] text-white transition-all duration-300
        ${collapsed ? "w-[82px]" : "w-[270px]"}
        ${open ? "translate-x-0" : "-translate-x-full lg:translate-x-0"}`}
      >
        {/* LOGO */}
        <div className="flex h-[78px] items-center justify-between border-b border-white/10 px-5">
          <div className="flex items-center gap-3 overflow-hidden">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-500 shadow-lg shadow-blue-500/20">
              <ShieldCheck size={23} />
            </div>

            {!collapsed && (
              <div className="min-w-0">
                <h1 className="text-sm font-bold tracking-wide">TASKORA</h1>
                <p className="text-[10px] text-slate-400">
                  Management System
                </p>
              </div>
            )}
          </div>

          <button
            onClick={onClose}
            className="rounded-lg p-1 text-slate-400 hover:bg-white/10 lg:hidden"
          >
            <X size={20} />
          </button>

          <button
            onClick={onToggle}
            className="hidden rounded-lg p-1.5 text-slate-400 hover:bg-white/10 lg:block"
            title="Toggle sidebar"
          >
            <ChevronLeft
              size={19}
              className={collapsed ? "rotate-180" : ""}
            />
          </button>
        </div>

        {/* ROLE BADGE */}
        {!collapsed && (
          <div className="mx-4 mt-5 rounded-xl border border-white/10 bg-white/5 p-3">
            <div className="flex items-center gap-2">
              <div className="h-2 w-2 rounded-full bg-emerald-400" />
              <span className="text-xs font-medium text-slate-300">
                {role === "admin" ? "Administrator" : "Member Account"}
              </span>
            </div>
            <p className="mt-1 text-[10px] text-slate-500">
              {role === "admin" ? "Full Access Control" : "Personal Workspace"}
            </p>
          </div>
        )}

        {/* NAVIGATION */}
        <nav className="flex-1 space-y-7 overflow-y-auto px-3 py-6">
          {menus.map((group) => (
            <div key={group.title}>
              {!collapsed && (
                <p className="mb-3 px-3 text-[10px] font-bold tracking-[2px] text-slate-500">
                  {group.title}
                </p>
              )}

              <div className="space-y-1.5">
                {group.items.map((item) => {
                  const Icon = item.icon;
                  const active =
                    pathname === item.href ||
                    (item.href !== `/dashboard/${role}` &&
                      pathname.startsWith(item.href + "/"));

                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      onClick={onClose}
                      title={collapsed ? item.label : undefined}
                      className={`group flex items-center gap-3 rounded-xl px-3 py-3 text-sm transition-all
                        ${
                          active
                            ? "bg-blue-600 text-white shadow-lg shadow-blue-600/20"
                            : "text-slate-400 hover:bg-white/5 hover:text-white"
                        }
                        ${collapsed ? "justify-center" : ""}`}
                    >
                      <Icon size={19} className="shrink-0" />
                      {!collapsed && (
                        <span className="font-medium">{item.label}</span>
                      )}
                      {active && !collapsed && (
                        <span className="ml-auto h-1.5 w-1.5 rounded-full bg-white" />
                      )}
                    </Link>
                  );
                })}
              </div>
            </div>
          ))}
        </nav>

        {/* LOGOUT */}
        <div className="border-t border-white/10 p-3">
          <button
            onClick={onLogout}
            className={`flex w-full items-center gap-3 rounded-xl px-3 py-3 text-sm text-red-300 transition hover:bg-red-500/10 hover:text-red-200
              ${collapsed ? "justify-center" : ""}`}
          >
            <LogOut size={19} />
            {!collapsed && <span className="font-medium">Keluar</span>}
          </button>

          {!collapsed && (
            <p className="mt-3 text-center text-[10px] text-slate-600">
              TASKORA © 2026
            </p>
          )}
        </div>
      </aside>
    </>
  );
}
