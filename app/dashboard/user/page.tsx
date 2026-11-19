"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { auth } from "@/lib/firebase/client";
import { signOut } from "firebase/auth";
import { UserRound, LogOut, Loader2 } from "lucide-react";
import type { UserData } from "@/types/user";

export default function UserDashboard() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<UserData | null>(null);

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(async (currentUser) => {
      if (!currentUser) {
        router.replace("/login");
        return;
      }

      try {
        const token = await currentUser.getIdToken();

        const res = await fetch("/api/auth/me", {
          headers: { Authorization: `Bearer ${token}` },
          cache: "no-store",
        });

        if (!res.ok) {
          await signOut(auth);
          router.replace("/login");
          return;
        }

        const data = await res.json();

        if (data.user.role !== "user") {
          router.replace("/dashboard/admin/users");
          return;
        }

        setUser(data.user);
        setLoading(false);
      } catch {
        await signOut(auth);
        router.replace("/login");
      }
    });

    return () => unsubscribe();
  }, [router]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="animate-spin text-blue-600" size={35} />
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-slate-50">
      <header className="bg-blue-700 text-white p-5">
        <div className="max-w-5xl mx-auto flex justify-between items-center">
          <h1 className="font-bold text-xl">User Dashboard</h1>

          <button
            onClick={async () => {
              await signOut(auth);
              router.replace("/login");
            }}
            className="flex items-center gap-2 bg-white/15 px-4 py-2 rounded-lg"
          >
            <LogOut size={18} /> Logout
          </button>
        </div>
      </header>

      <div className="max-w-5xl mx-auto p-6">
        <div className="bg-white rounded-2xl border p-8">
          <div className="w-16 h-16 bg-blue-100 text-blue-700 rounded-2xl flex items-center justify-center">
            <UserRound size={32} />
          </div>

          <h2 className="text-2xl font-bold mt-5">
            Selamat Datang, {user?.nama}
          </h2>

          <p className="text-slate-500 mt-2">
            Anda berhasil masuk sebagai pengguna.
          </p>

          <div className="mt-8 space-y-4">
            <div className="border-b pb-3">
              <p className="text-sm text-slate-500">Nama</p>
              <p className="font-semibold">{user?.nama}</p>
            </div>

            <div className="border-b pb-3">
              <p className="text-sm text-slate-500">Email</p>
              <p className="font-semibold">{user?.email}</p>
            </div>

            <div className="border-b pb-3">
              <p className="text-sm text-slate-500">Alamat</p>
              <p className="font-semibold">{user?.alamat}</p>
            </div>

            <div>
              <p className="text-sm text-slate-500">Jenis Kelamin</p>
              <p className="font-semibold">
                {user?.jenisKelamin === "L" ? "Laki-laki" : "Perempuan"}
              </p>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}