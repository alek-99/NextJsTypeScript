
"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { onAuthStateChanged, signOut } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import { auth, db } from "@/lib/firebase/config";
import DashboardSidebar from "./DashboardSidebar";
import {
  Bell,
  Menu,
  Search,
  ChevronDown,
  Loader2,
} from "lucide-react";

interface DashboardShellProps {
  role: "admin" | "user";
  children: React.ReactNode;
  title?: string;
  description?: string;
}

export default function DashboardShell({
  role,
  children,
  title = "Dashboard",
  description = "Selamat datang di workspace Anda.",
}: DashboardShellProps) {
  const router = useRouter();

  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [collapsed, setCollapsed] = useState(false);
  const [userInfo, setUserInfo] = useState({
    nama: "Pengguna",
    email: "",
  });

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (!user) {
        router.replace("/login");
        return;
      }

      try {
        const token = await user.getIdTokenResult(true);
        const isAdmin = token.claims.admin === true;

        // Admin hanya dikenali melalui custom claim Admin SDK.
        const actualRole = isAdmin ? "admin" : "user";

        if (actualRole !== role) {
          router.replace(
            actualRole === "admin"
              ? "/dashboard/admin"
              : "/dashboard/user"
          );
          return;
        }

        const profileRef = doc(db, "users", user.uid);
        const profileSnap = await getDoc(profileRef);

        setUserInfo({
          nama: profileSnap.exists()
            ? profileSnap.data().nama || "Pengguna"
            : "Pengguna",
          email: user.email || "",
        });

        setLoading(false);
      } catch (error) {
        console.error("Gagal memverifikasi akses:", error);
        await signOut(auth);
        router.replace("/login");
      }
    });

    return () => unsubscribe();
  }, [role, router]);

  const handleLogout = async () => {
    try {
      await signOut(auth);
      router.replace("/login");
    } catch (error) {
      console.error("Logout gagal:", error);
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="animate-spin text-blue-600" size={35} />
          <p className="text-sm text-slate-500">
            Memeriksa akses akun...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F5F7FB]">
      <DashboardSidebar
        role={role}
        open={open}
        collapsed={collapsed}
        onClose={() => setOpen(false)}
        onToggle={() => setCollapsed(!collapsed)}
        onLogout={handleLogout}
      />

      <main
        className={`min-h-screen transition-all duration-300 ${
          collapsed ? "lg:ml-[82px]" : "lg:ml-[270px]"
        }`}
      >
        {/* TOPBAR */}
        <header className="sticky top-0 z-30 flex h-[78px] items-center justify-between border-b border-slate-200/80 bg-white/90 px-4 backdrop-blur-md sm:px-7 lg:px-9">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setOpen(true)}
              className="rounded-lg p-2 text-slate-600 hover:bg-slate-100 lg:hidden"
            >
              <Menu size={22} />
            </button>

            <div>
              <h2 className="text-lg font-bold text-slate-800">
                {title}
              </h2>
              <p className="hidden text-xs text-slate-400 sm:block">
                {description}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 sm:gap-5">
            <button className="hidden rounded-xl border border-slate-200 p-2.5 text-slate-500 transition hover:bg-slate-50 sm:block">
              <Search size={18} />
            </button>

            <button className="relative rounded-xl border border-slate-200 p-2.5 text-slate-500 transition hover:bg-slate-50">
              <Bell size={18} />
              <span className="absolute right-2 top-2 h-2 w-2 rounded-full border-2 border-white bg-red-500" />
            </button>

            <div className="hidden h-8 w-px bg-slate-200 sm:block" />

            <div className="flex items-center gap-2.5">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-100 font-bold text-blue-700">
                {userInfo.nama.charAt(0).toUpperCase()}
              </div>

              <div className="hidden max-w-[150px] sm:block">
                <p className="truncate text-xs font-bold text-slate-800">
                  {userInfo.nama}
                </p>
                <p className="truncate text-[10px] text-slate-400">
                  {userInfo.email}
                </p>
              </div>

              <ChevronDown
                size={15}
                className="hidden text-slate-400 sm:block"
              />
            </div>
          </div>
        </header>

        {/* PAGE CONTENT */}
        <div className="p-4 sm:p-7 lg:p-9">
          {children}
        </div>
      </main>
    </div>
  );
}
