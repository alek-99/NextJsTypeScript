
"use client";

import { useState } from "react";
import {
  Menu,
  Bell,
  ChevronDown,
  User,
  Settings,
  LogOut,
  Search,
} from "lucide-react";
import { signOut } from "firebase/auth";
import { auth } from "@/lib/firebase/client";
import Breadcrumb from "./BreadCrumb";

interface NavbarProps {
  onMenuClick: () => void;
  user: {
    nama?: string;
    email?: string;
    role: string;
  };
}

export default function Navbar({ onMenuClick, user }: NavbarProps) {
  const [dropdown, setDropdown] = useState(false);
  const [notifications, setNotifications] = useState(false);

  const basePath = `/dashboard/${user.role}`;

  async function handleLogout() {
    try {
      await signOut(auth);
      window.location.href = "/login";
    } catch (error) {
      console.error("Logout error:", error);
    }
  }

  return (
    <header className="sticky top-0 z-30 border-b border-gray-200 bg-white">
      {/* Topbar */}
      <div className="flex h-[60px] items-center justify-between px-4 sm:px-6">
        <div className="flex items-center gap-3">
          <button
            onClick={onMenuClick}
            className="rounded-md p-2 text-gray-600 hover:bg-gray-100 lg:hidden"
            aria-label="Buka sidebar"
          >
            <Menu size={21} />
          </button>

          <div className="hidden items-center gap-2 rounded-md border border-gray-200 bg-gray-50 px-3 py-2 md:flex">
            <Search size={15} className="text-gray-400" />
            <input
              type="search"
              placeholder="Cari sesuatu..."
              className="w-44 bg-transparent text-xs outline-none placeholder:text-gray-400"
            />
          </div>

          <p className="text-xs font-semibold text-gray-700 md:hidden">
            TASKORA
          </p>
        </div>

        <div className="flex items-center gap-2 sm:gap-4">
          {/* Notifications */}
          <div className="relative">
            <button
              onClick={() => {
                setNotifications(!notifications);
                setDropdown(false);
              }}
              aria-label="Notifikasi"
              className="relative rounded-md p-2 text-gray-500 hover:bg-gray-100"
            >
              <Bell size={19} />
              <span className="absolute right-1.5 top-1.5 h-2 w-2 rounded-full border-2 border-white bg-red-500" />
            </button>

            {notifications && (
              <>
                <button
                  className="fixed inset-0 z-40 cursor-default"
                  onClick={() => setNotifications(false)}
                  aria-label="Tutup notifikasi"
                />

                <div className="absolute right-0 top-12 z-50 w-64 rounded-md border border-gray-200 bg-white p-4 shadow-xl">
                  <p className="text-sm font-semibold text-gray-800">
                    Notifikasi
                  </p>
                  <p className="mt-3 text-xs text-gray-500">
                    Belum ada notifikasi baru.
                  </p>
                </div>
              </>
            )}
          </div>

          <div className="h-7 w-px bg-gray-200" />

          {/* Profile */}
          <div className="relative">
            <button
              onClick={() => {
                setDropdown(!dropdown);
                setNotifications(false);
              }}
              className="flex items-center gap-2 rounded-md px-2 py-1.5 hover:bg-gray-50"
            >
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[#3C8DBC] text-sm font-bold text-white">
                {user.nama?.charAt(0).toUpperCase() || "U"}
              </div>

              <div className="hidden text-left sm:block">
                <p className="max-w-[130px] truncate text-xs font-semibold text-gray-700">
                  {user.nama || "Pengguna"}
                </p>
                <p className="text-[10px] capitalize text-gray-400">
                  {user.role}
                </p>
              </div>

              <ChevronDown size={14} className="text-gray-400" />
            </button>

            {dropdown && (
              <>
                <button
                  className="fixed inset-0 z-40 cursor-default"
                  onClick={() => setDropdown(false)}
                  aria-label="Tutup menu profil"
                />

                <div className="absolute right-0 top-12 z-50 w-60 overflow-hidden rounded-md border border-gray-200 bg-white shadow-xl">
                  <div className="border-b border-gray-100 bg-gray-50 p-4">
                    <p className="truncate text-sm font-semibold text-gray-800">
                      {user.nama || "Pengguna"}
                    </p>
                    <p className="mt-1 truncate text-xs text-gray-400">
                      {user.email || ""}
                    </p>
                  </div>

                  <div className="p-2">
                    <button
                      onClick={() => {
                        window.location.href = `${basePath}/pengaturan`;
                      }}
                      className="flex w-full items-center gap-3 rounded-md px-3 py-2.5 text-xs text-gray-600 hover:bg-gray-100"
                    >
                      <User size={16} />
                      Profil Saya
                    </button>

                    <button
                      onClick={() => {
                        window.location.href = `${basePath}/pengaturan`;
                      }}
                      className="flex w-full items-center gap-3 rounded-md px-3 py-2.5 text-xs text-gray-600 hover:bg-gray-100"
                    >
                      <Settings size={16} />
                      Pengaturan
                    </button>

                    <button
                      onClick={handleLogout}
                      className="flex w-full items-center gap-3 rounded-md px-3 py-2.5 text-xs text-red-500 hover:bg-red-50"
                    >
                      <LogOut size={16} />
                      Keluar
                    </button>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Breadcrumb */}
      <div className="border-t border-gray-100 bg-[#FAFAFA] px-4 py-3 sm:px-6">
        <Breadcrumb />
      </div>
    </header>
  );
}
