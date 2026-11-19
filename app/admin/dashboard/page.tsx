"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import { onAuthStateChanged } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import { db, auth } from "@/lib/firebase/config";
import { logout } from "@/services/auth";

export default function AdminDashboard() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(
      auth,
      async (user) => {
        if (!user) {
          router.replace("/login");
          setLoading(false);
          return;
        }

        try {
          const snap = await getDoc(doc(db, "users", user.uid));

          if (!snap.exists() || snap.data().role !== "admin") {
            router.replace("/user/dashboard");
            return;
          }

          setLoading(false);
        } catch {
          router.replace("/login");
        }
      }
    );

    return () => unsubscribe();
  }, [router]);

  if (loading) return <p>Memeriksa akses...</p>;

  return (
    <div className="p-10">
      <h1 className="text-3xl font-bold">
        Dashboard Admin
      </h1>

      <p>Selamat datang, Admin!</p>

      <button
        onClick={async () => {
          await logout();
          router.replace("/login");
        }}
        className="bg-red-500 text-white p-3 rounded mt-5"
      >
        Logout
      </button>
    </div>
  );
}