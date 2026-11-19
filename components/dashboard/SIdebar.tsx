
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Users,
  Settings,
  FileText,
  ChartNoAxesCombined,
  FolderKanban,
  CircleHelp,
  LogOut,
  X,
  ChevronDown,
  ShieldCheck,
  UserRound,
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
    try {
      await signOut(auth);
      window.location.href = "/login";
    } catch (error) {
      console.error("Logout error:", error);
    }
  }

  return (
    <>
      {open && (
        <button
          onClick={onClose}
          aria-label="Tutup sidebar"
          className="fixed inset-0 z-40 bg-black/40 lg:hidden"
        />
      )}

      <aside
        className={`
          fixed inset-y-0 left-0 z-50 flex w-[260px]
          flex-col border-r border-gray-200 bg-white
          shadow-sm transition-transform duration-300
          lg:translate-x-0
          ${open ? "translate-x-0" : "-translate-x-full"}
        `}
      >
        {/* Brand */}
        <div className="flex h-[60px] shrink-0 items-center justify-between border-b border-gray-200 px-5">
          <Link
            href={`/dashboard/${role}`}
            className="flex items-center gap-3"
            onClick={onClose}
          >
            <div className="flex h-9 w-9 items-center justify-center rounded-md bg-[#3C8DBC] text-white">
              <ShieldCheck size={21} />
            </div>

            <div>
              <h1 className="text-[17px] font-bold tracking-wide text-gray-800">
                PONPES AL-ARBAIN
              </h1>
              <p className="text-[9px] tracking-[2px] text-gray-400">
                MANAGEMENT SYSTEM
              </p>
            </div>
          </Link>

          <button
            onClick={onClose}
            className="text-gray-500 lg:hidden"
            aria-label="Tutup sidebar"
          >
            <X size={20} />
          </button>
        </div>

        {/* User Information */}
       
         

        {/* Navigation */}
        <nav className="flex-1 space-y-6 overflow-y-auto px-3 py-5">
          {menus.map((group) => (
            <div key={group.title}>
              <p className="mb-2 px-3 text-[10px] font-bold tracking-wider text-gray-400">
                {group.title}
              </p>

              <div className="space-y-1">
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
                      className={`
                        flex items-center gap-3 rounded-md
                        px-3 py-[10px] text-[13px]
                        transition-colors
                        ${
                          active
                            ? "bg-[#3C8DBC] font-semibold text-white shadow-sm"
                            : "text-gray-600 hover:bg-gray-100 hover:text-[#3C8DBC]"
                        }
                      `}
                    >
                      <Icon size={17} strokeWidth={1.8} />

                      <span className="flex-1">{item.label}</span>

                      {active && <ChevronDown className="-rotate-90" size={14} />}
                    </Link>
                  );
                })}
              </div>
            </div>
          ))}
        </nav>

        {/* Footer */}
        <div className="border-t border-gray-200 p-4">
          <button
            onClick={handleLogout}
            className="flex w-full items-center gap-3 rounded-md px-3 py-3 text-sm text-red-500 transition hover:bg-red-50"
          >
            <LogOut size={17} />
            Keluar dari aplikasi
          </button>

          <p className="mt-3 text-center text-[10px] text-gray-400">
            TASKORA v1.0.0
          </p>
        </div>
      </aside>
    </>
  );
}
