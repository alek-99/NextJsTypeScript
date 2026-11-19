
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Users,
  Settings,
  FileText,
  ChartNoAxesCombined,
  ShieldCheck,
  FolderKanban,
  CircleHelp,
  LogOut,
  X,
  ChevronRight,
} from "lucide-react";
import { signOut } from "firebase/auth";
import { auth } from "@/lib/firebase/client";

interface SidebarProps {
  role: "admin" | "user";
  open: boolean;
  onClose: () => void;
}

const adminMenus = [
  {
    title: "MENU UTAMA",
    items: [
      { label: "Dashboard", href: "/dashboard/admin", icon: LayoutDashboard },
      { label: "Kelola Pengguna", href: "/dashboard/admin/santri", icon: Users },
      { label: "Data Laporan", href: "/dashboard/admin/laporan", icon: FileText },
      { label: "Analitik", href: "/dashboard/admin/analitik", icon: ChartNoAxesCombined },
    ],
  },
  {
    title: "PREFERENSI",
    items: [
      { label: "Pengaturan", href: "/dashboard/admin/pengaturan", icon: Settings },
      { label: "Bantuan", href: "/dashboard/admin/bantuan", icon: CircleHelp },
    ],
  },
];

const userMenus = [
  {
    title: "MENU UTAMA",
    items: [
      { label: "Dashboard", href: "/dashboard/user", icon: LayoutDashboard },
      { label: "Proyek Saya", href: "/dashboard/user/proyek", icon: FolderKanban },
      { label: "Dokumen", href: "/dashboard/user/dokumen", icon: FileText },
    ],
  },
  {
    title: "PREFERENSI",
    items: [
      { label: "Pengaturan", href: "/dashboard/user/pengaturan", icon: Settings },
      { label: "Bantuan", href: "/dashboard/user/bantuan", icon: CircleHelp },
    ],
  },
];

export default function Sidebar({
  role,
  open,
  onClose,
}: SidebarProps) {
  const pathname = usePathname();

  const menus = role === "admin" ? adminMenus : userMenus;

  async function handleLogout() {
    await signOut(auth);
    window.location.href = "/login";
  }

  return (
    <>
      {open && (
        <div
          onClick={onClose}
          className="fixed inset-0 z-40 bg-black/50 lg:hidden"
        />
      )}

      <aside
        className={`
          fixed inset-y-0 left-0 z-50 flex w-[270px]
          flex-col bg-[#111827] text-white
          transition-transform duration-300
          lg:translate-x-0
          ${open ? "translate-x-0" : "-translate-x-full"}
        `}
      >
        {/* Logo */}
        <div className="flex h-[76px] items-center justify-between border-b border-white/10 px-6">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-600">
              <ShieldCheck size={22} />
            </div>

            <div>
              <h1 className="text-base font-bold tracking-wide">
                TASKORA
              </h1>
              <p className="text-[10px] tracking-[2px] text-gray-400">
                MANAGEMENT SYSTEM
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="lg:hidden"
            aria-label="Tutup sidebar"
          >
            <X size={21} />
          </button>
        </div>

        {/* Role */}
        <div className="mx-4 mt-6 rounded-xl border border-white/10 bg-white/5 p-3">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-blue-500/20 text-blue-400">
              <ShieldCheck size={19} />
            </div>

            <div>
              <p className="text-xs font-semibold">
                {role === "admin" ? "Administrator" : "User Account"}
              </p>
              <p className="mt-1 text-[10px] text-gray-400">
                {role === "admin" ? "Full Access" : "Limited Access"}
              </p>
            </div>

            <span className="ml-auto h-2 w-2 rounded-full bg-green-400" />
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 space-y-7 overflow-y-auto px-4 py-7">
          {menus.map((group) => (
            <div key={group.title}>
              <p className="mb-3 px-3 text-[10px] font-bold tracking-[2px] text-gray-500">
                {group.title}
              </p>

              <div className="space-y-1">
                {group.items.map((item) => {
                  const Icon = item.icon;
                  const active = pathname === item.href ||
                    (item.href !== `/dashboard/${role}` &&
                      pathname.startsWith(item.href + "/"));

                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      onClick={onClose}
                      className={`
                        group flex items-center gap-3 rounded-xl
                        px-3 py-3 text-[13px] font-medium
                        transition-all
                        ${
                          active
                            ? "bg-blue-600 text-white shadow-lg shadow-blue-600/20"
                            : "text-gray-400 hover:bg-white/5 hover:text-white"
                        }
                      `}
                    >
                      <Icon size={18} />

                      <span className="flex-1">
                        {item.label}
                      </span>

                      {active && <ChevronRight size={15} />}
                    </Link>
                  );
                })}
              </div>
            </div>
          ))}
        </nav>

        {/* Logout */}
        <div className="border-t border-white/10 p-4">
          <button
            onClick={handleLogout}
            className="flex w-full items-center gap-3 rounded-xl px-3 py-3 text-sm text-red-400 transition hover:bg-red-500/10"
          >
            <LogOut size={18} />
            Keluar dari aplikasi
          </button>

          <p className="mt-4 text-center text-[10px] text-gray-600">
            © 2026 TASKORA SYSTEM
          </p>
        </div>
      </aside>
    </>
  );
}
