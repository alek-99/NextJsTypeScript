"use client";

import { useState } from "react";
import { signInWithEmailAndPassword, signOut } from "firebase/auth";
import { auth } from "@/lib/firebase/client";
import { useRouter } from "next/navigation";
import { LockKeyhole, Mail, Loader2 } from "lucide-react";
import Swal from "sweetalert2";

type AuthResponse = {
  message?: string;
  user?: {
    nama?: string;
    role?: string;
  };
};

export default function LoginPage() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!email.trim() || !password) {
      Swal.fire("Perhatian", "Email dan password wajib diisi", "warning");
      return;
    }

    setLoading(true);

    try {
      const credential = await signInWithEmailAndPassword(
        auth,
        email.trim(),
        password
      );
      const token = await credential.user.getIdToken();

      const response = await fetch("/api/auth/me", {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        cache: "no-store",
      });

      const raw = await response.text();
      let result: AuthResponse;

      try {
        const parsed: unknown = raw ? JSON.parse(raw) : {};

        if (typeof parsed !== "object" || parsed === null) {
          throw new Error("Format respons autentikasi tidak valid");
        }

        result = parsed as AuthResponse;
      } catch {
        console.error("AUTH RESPONSE:", raw);
        throw new Error(`Response server tidak valid. HTTP ${response.status}`);
      }

      if (!response.ok) {
        await signOut(auth);
        throw new Error(result.message || "Akun tidak memiliki akses");
      }

      const user = result.user;

      if (!user || (user.role !== "admin" && user.role !== "user")) {
        await signOut(auth);
        throw new Error("Role pengguna tidak dikenali");
      }

      await Swal.fire({
        icon: "success",
        title: "Login Berhasil",
        text: `Selamat datang, ${user.nama || email.trim()}`,
        timer: 1200,
        showConfirmButton: false,
      });

      router.replace(
        user.role === "admin" ? "/dashboard/admin/users" : "/dashboard/user"
      );
    } catch (error: unknown) {
      console.error("LOGIN ERROR:", error);

      const errorCode =
        typeof error === "object" &&
        error !== null &&
        "code" in error &&
        typeof error.code === "string"
          ? error.code
          : "";
      const errorMessage =
        error instanceof Error ? error.message : "Login gagal";

      if (
        errorCode === "auth/user-disabled" ||
        errorMessage.includes("Akun Anda telah dinonaktifkan")
      ) {
        await signOut(auth);
      }

      let message = errorMessage;

      if (errorCode === "auth/invalid-credential") {
        message = "Email atau password salah.";
      } else if (errorCode === "auth/user-not-found") {
        message = "Akun tidak ditemukan.";
      } else if (errorCode === "auth/user-disabled") {
        message = "Akun Anda dinonaktifkan.";
      } else if (errorCode === "auth/too-many-requests") {
        message = "Terlalu banyak percobaan. Coba lagi nanti.";
      } else if (errorCode === "auth/network-request-failed") {
        message = "Koneksi internet bermasalah.";
      }

      await Swal.fire("Login Gagal", message, "error");
    } finally {
      setLoading(false);
    }
  };
  return (
    <main className="min-h-screen bg-slate-950 flex items-center justify-center p-5">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-2xl p-8">
        <div className="text-center mb-8">
          <div className="w-14 h-14 mx-auto rounded-2xl bg-blue-600 text-white flex items-center justify-center mb-4">
            <LockKeyhole size={28} />
          </div>

          <h1 className="text-2xl font-bold text-slate-900">
            Welcome Back
          </h1>

          <p className="text-sm text-slate-500 mt-2">
            Silakan login ke akun Anda
          </p>
        </div>

        <form onSubmit={handleLogin} className="space-y-5">
          <div>
            <label className="text-sm font-semibold text-slate-700">
              Email
            </label>

            <div className="relative mt-2">
              <Mail className="absolute left-3 top-3.5 text-slate-400" size={19} />

              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="nama@email.com"
                className="w-full border border-slate-200 rounded-xl py-3 pl-11 pr-4 outline-none focus:border-blue-600"
                required
              />
            </div>
          </div>

          <div>
            <label className="text-sm font-semibold text-slate-700">
              Password
            </label>

            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Masukkan password"
              className="w-full mt-2 border border-slate-200 rounded-xl p-3 outline-none focus:border-blue-600"
              required
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white rounded-xl py-3 font-semibold flex justify-center items-center gap-2 disabled:opacity-60"
          >
            {loading ? (
              <>
                <Loader2 className="animate-spin" size={19} />
                Memproses...
              </>
            ) : (
              "Login Sekarang"
            )}
          </button>
        </form>
      </div>
    </main>
  );
}