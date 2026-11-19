
"use client";

import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import Sidebar from "./Sidebar";
import Navbar from "./Navbar";
import { useAuth } from "@/hooks/useAuth";

interface Profile {
  nama?: string;
  email?: string;
  role: "admin" | "user";
}

interface DashboardLayoutProps {
  children: React.ReactNode;
}

export default function DashboardLayout({
  children,
}: DashboardLayoutProps) {
  const router = useRouter();
  const pathname = usePathname();

  const { user: firebaseUser, loading } = useAuth();

  const [profile, setProfile] = useState<Profile | null>(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    if (loading) return;

    let cancelled = false;

    async function checkUser() {
      if (!firebaseUser) {
        router.replace("/login");
        return;
      }

      try {
        const token = await firebaseUser.getIdToken();

        const response = await fetch("/api/auth/me", {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
          },
          cache: "no-store",
        });

        const result = await response.json();

        if (!response.ok || !result.success || !result.user) {
          router.replace("/login");
          return;
        }

        if (cancelled) return;

        const currentUser = result.user as Profile;

        if (
          currentUser.role !== "admin" &&
          currentUser.role !== "user"
        ) {
          router.replace("/login");
          return;
        }

        const expectedPath =
          currentUser.role === "admin"
            ? "/dashboard/admin"
            : "/dashboard/user";

        const accessingAdmin =
          pathname.startsWith("/dashboard/admin");

        const accessingUser =
          pathname.startsWith("/dashboard/user");

        if (
          (accessingAdmin && currentUser.role !== "admin") ||
          (accessingUser && currentUser.role !== "user")
        ) {
          router.replace(expectedPath);
          return;
        }

        if (!cancelled) {
          setProfile(currentUser);
        }
      } catch (error) {
        console.error("Dashboard auth error:", error);

        if (!cancelled) {
          router.replace("/login");
        }
      } finally {
        if (!cancelled) {
          setChecking(false);
        }
      }
    }

    checkUser();

    return () => {
      cancelled = true;
    };
  }, [firebaseUser, loading, pathname, router]);

  if (loading || checking || !profile) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#F4F6F9]">
        <div className="text-center">
          <div className="mx-auto h-10 w-10 animate-spin rounded-full border-4 border-blue-100 border-t-[#3C8DBC]" />

          <p className="mt-4 text-sm font-medium text-gray-500">
            Memuat dashboard...
          </p>

          <p className="mt-1 text-xs text-gray-400">
            TASKORA Management System
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F4F6F9]">
      <Sidebar
        role={profile.role}
        open={menuOpen}
        onClose={() => setMenuOpen(false)}
      />

      <div className="min-h-screen transition-all duration-300 lg:pl-[260px]">
        <Navbar
          user={profile}
          onMenuClick={() => setMenuOpen(!menuOpen)}
        />

        <main className="min-h-[calc(100vh-110px)] p-4 sm:p-6">
          {children}
        </main>

        <footer className="border-t border-gray-200 bg-white px-6 py-4 text-center text-[11px] text-gray-400">
          Copyright © 2026 TASKORA Management System.
          All rights reserved.
        </footer>
      </div>
    </div>
  );
}
