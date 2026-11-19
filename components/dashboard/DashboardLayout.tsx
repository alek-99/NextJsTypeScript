
"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Sidebar from "./SIdebar";
import Navbar from "./Navbar";
import { useAuth } from "@/hooks/useAuth";

interface DashboardLayoutProps {
  children: React.ReactNode;
}

export default function DashboardLayout({
  children,
}: DashboardLayoutProps) {
  const router = useRouter();
  const { user: firebaseUser, loading } = useAuth();

  const [profile, setProfile] = useState<any>(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    if (loading) return;

    if (!firebaseUser) {
      router.replace("/login");
      return;
    }

    let cancelled = false;

    async function checkUser() {
      try {
        const token = await firebaseUser!.getIdToken();

        const response = await fetch("/api/auth/me", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
          cache: "no-store",
        });

        const result = await response.json();

        if (!response.ok || !result.success) {
          router.replace("/login");
          return;
        }

        if (cancelled) return;

        const currentPath = window.location.pathname;
        const expectedPath =
          result.user.role === "admin"
            ? "/dashboard/admin"
            : "/dashboard/santri";

        if (
          currentPath.startsWith("/dashboard/admin") &&
          result.user.role !== "admin"
        ) {
          router.replace(expectedPath);
          return;
        }

        if (
          currentPath.startsWith("/dashboard/user") &&
          result.user.role !== "user"
        ) {
          router.replace(expectedPath);
          return;
        }

        setProfile(result.user);
      } catch (error) {
        console.error("Dashboard auth error:", error);
        router.replace("/login");
      } finally {
        if (!cancelled) setChecking(false);
      }
    }

    checkUser();

    return () => {
      cancelled = true;
    };
  }, [firebaseUser, loading, router]);

  if (loading || checking || !profile) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="mx-auto h-10 w-10 animate-spin rounded-full border-4 border-blue-100 border-t-blue-600" />
          <p className="mt-4 text-sm text-gray-500">
            Memuat dashboard...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F5F7FB]">
      <Sidebar
        role={profile.role}
        open={menuOpen}
        onClose={() => setMenuOpen(false)}
      />

      <div className="min-h-screen lg:pl-[270px]">
        <Navbar
          user={profile}
          onMenuClick={() => setMenuOpen(!menuOpen)}
        />

        <main className="p-4 sm:p-7">
          {children}
        </main>
      </div>
    </div>
  );
}
