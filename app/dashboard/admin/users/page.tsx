"use client";

import UserManagement from "@/components/admin/UserManagement";

export default function AdminUsersPage() {
  return (
    <main className="min-h-screen bg-slate-50 p-6">
      <div className="mx-auto max-w-6xl">
        <h1 className="mb-6 text-2xl font-bold text-slate-900">
          Dashboard Admin
        </h1>
        <UserManagement />
      </div>
    </main>
  );
}