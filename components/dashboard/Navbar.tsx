
"use client";

import { useState } from "react";
import {
  Menu,
  Bell,
  ChevronDown,
  User,
  Settings,
  LogOut,
} from "lucide-react";
import { signOut } from "firebase/auth";
import { auth } from "@/lib/firebase/client";

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

  async function handleLogout() {
    await signOut(auth);
    window.location.href = "/login";
  }

  return (
    <header className="sticky top-0 z-30 flex h-[76px] items-center justify-between border-b border-gray-200 bg-white px-4 sm:px-7">
      <div className="flex items-center gap-4">
        <button
          onClick={onMenuClick}
          className="rounded-lg p-2 text-gray-600 hover:bg-gray-100 lg:hidden"
          aria-label="Buka menu"
        >
          <Menu size={22} />
        </button>

        <div>
          <h2 className="text-sm font-bold text-gray-800 sm:text-base">
            Dashboard
          </h2>
          <p className="hidden text-xs text-gray-400 sm:block">
            Selamat datang kembali di Taskora
          </p>
        </div>
      </div>

      <div className="flex items-center gap-3 sm:gap-5">
        <button
          className="relative rounded-xl border border-gray-100 p-2.5 text-gray-500 hover:bg-gray-50"
          aria-label="Notifikasi"
        >
          <Bell size={19} />
          <span className="absolute right-2 top-2 h-2 w-2 rounded-full bg-red-500 ring-2 ring-white" />
        </button>

        <div className="h-8 w-px bg-gray-200" />

        <div className="relative">
          <button
            onClick={() => setDropdown(!dropdown)}
            className="flex items-center gap-2 sm:gap-3"
          >
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-600 text-sm font-bold text-white">
              {user.nama?.charAt(0).toUpperCase() || "U"}
            </div>

            <div className="hidden text-left sm:block">
              <p className="max-w-[150px] truncate text-xs font-bold text-gray-800">
                {user.nama || "Pengguna"}
              </p>
              <p className="mt-1 text-[10px] capitalize text-gray-400">
                {user.role}
              </p>
            </div>

            <ChevronDown size={15} className="text-gray-400" />
          </button>

          {dropdown && (
            <>
              <button
                className="fixed inset-0 z-40 cursor-default"
                onClick={() => setDropdown(false)}
                aria-label="Tutup dropdown"
              />

              <div className="absolute right-0 top-14 z-50 w-56 rounded-xl border border-gray-100 bg-white p-2 shadow-xl">
                <div className="border-b border-gray-100 px-3 py-3">
                  <p className="truncate text-sm font-bold text-gray-800">
                    {user.nama}
                  </p>
                  <p className="mt-1 truncate text-xs text-gray-400">
                    {user.email}
                  </p>
                </div>

                <button
                  onClick={() => {
                    window.location.href = `/dashboard/${user.role}/pengaturan`;
                  }}
                  className="flex w-full items-center gap-3 rounded-lg px-3 py-3 text-sm text-gray-600 hover:bg-gray-50"
                >
                  <User size={16} />
                  Profil Saya
                </button>

                <button
                  onClick={() => {
                    window.location.href = `/dashboard/${user.role}/pengaturan`;
                  }}
                  className="flex w-full items-center gap-3 rounded-lg px-3 py-3 text-sm text-gray-600 hover:bg-gray-50"
                >
                  <Settings size={16} />
                  Pengaturan
                </button>

                <button
                  onClick={handleLogout}
                  className="flex w-full items-center gap-3 rounded-lg px-3 py-3 text-sm text-red-500 hover:bg-red-50"
                >
                  <LogOut size={16} />
                  Logout
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
