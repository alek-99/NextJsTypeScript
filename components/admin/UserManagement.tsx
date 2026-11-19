
"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { auth } from "@/lib/firebase/client";
import {
  Search,
  Plus,
  Pencil,
  Trash2,
  Users,
  ShieldCheck,
  UserCheck,
  X,
  Loader2,
  RefreshCw,
  Filter,
  Mail,
  MapPin,
  UserRound,
  LockKeyhole,
} from "lucide-react";
import Swal from "sweetalert2";

interface UserData {
  uid: string;
  nama: string;
  email: string;
  alamat: string;
  jenisKelamin: "L" | "P";
  role: "admin" | "user";
  status: "aktif" | "nonaktif";
  createdAt?: unknown;
}

const initialForm = {
  nama: "",
  email: "",
  password: "",
  alamat: "",
  jenisKelamin: "L" as "L" | "P",
  role: "user" as "admin" | "user",
  status: "aktif" as "aktif" | "nonaktif",
};

export default function UserManagement() {
  const [users, setUsers] = useState<UserData[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("semua");
  const [statusFilter, setStatusFilter] = useState("semua");

  const [modalOpen, setModalOpen] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [selectedUid, setSelectedUid] = useState("");

  const [form, setForm] = useState(initialForm);

  const getToken = async () => {
    const currentUser = auth.currentUser;

    if (!currentUser) {
      throw new Error("Sesi login tidak ditemukan. Silakan login kembali.");
    }

    return currentUser.getIdToken();
  };

  // Mengambil data pengguna
  const fetchUsers = useCallback(async () => {
    try {
      setLoading(true);

      const token = await getToken();

      const response = await fetch("/api/admin/users", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
        cache: "no-store",
      });

      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(result.message || "Gagal mengambil data");
      }

      setUsers(result.users);
    } catch (error) {
      console.error(error);

      Swal.fire({
        icon: "error",
        title: "Gagal",
        text: error instanceof Error ? error.message : "Gagal mengambil pengguna",
      });
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  // Filter pengguna
  const filteredUsers = useMemo(() => {
    return users.filter((user) => {
      const keyword = search.toLowerCase();

      const matchSearch =
        user.nama.toLowerCase().includes(keyword) ||
        user.email.toLowerCase().includes(keyword) ||
        user.alamat.toLowerCase().includes(keyword);

      const matchRole =
        roleFilter === "semua" || user.role === roleFilter;

      const matchStatus =
        statusFilter === "semua" || user.status === statusFilter;

      return matchSearch && matchRole && matchStatus;
    });
  }, [users, search, roleFilter, statusFilter]);

  // Membuka form tambah
  function openCreateModal() {
    setEditMode(false);
    setSelectedUid("");
    setForm(initialForm);
    setModalOpen(true);
  }

  // Membuka form edit
  function openEditModal(user: UserData) {
    setEditMode(true);
    setSelectedUid(user.uid);

    setForm({
      nama: user.nama,
      email: user.email,
      password: "",
      alamat: user.alamat,
      jenisKelamin: user.jenisKelamin,
      role: user.role,
      status: user.status,
    });

    setModalOpen(true);
  }

  // Menyimpan pengguna
  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();

    if (saving) return;

    try {
      setSaving(true);

      const token = await getToken();

      const response = await fetch("/api/admin/users", {
        method: editMode ? "PATCH" : "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          ...form,
          uid: selectedUid,
        }),
      });

      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(result.message || "Gagal menyimpan pengguna");
      }

      setModalOpen(false);
      setForm(initialForm);

      await fetchUsers();

      Swal.fire({
        icon: "success",
        title: "Berhasil!",
        text: result.message,
        timer: 1800,
        showConfirmButton: false,
      });
    } catch (error) {
      Swal.fire({
        icon: "error",
        title: "Gagal menyimpan",
        text: error instanceof Error ? error.message : "Terjadi kesalahan",
      });
    } finally {
      setSaving(false);
    }
  }

  // Menghapus pengguna
  async function handleDelete(user: UserData) {
    const confirmation = await Swal.fire({
      title: "Hapus pengguna?",
      text: `Akun ${user.nama} akan dihapus dari Firebase Authentication dan Firestore.`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Ya, hapus",
      cancelButtonText: "Batal",
      confirmButtonColor: "#dc2626",
      cancelButtonColor: "#64748b",
    });

    if (!confirmation.isConfirmed) return;

    try {
      const token = await getToken();

      const response = await fetch("/api/admin/users", {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ uid: user.uid }),
      });

      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(result.message || "Gagal menghapus pengguna");
      }

      await fetchUsers();

      Swal.fire({
        icon: "success",
        title: "Berhasil",
        text: result.message,
        timer: 1800,
        showConfirmButton: false,
      });
    } catch (error) {
      Swal.fire({
        icon: "error",
        title: "Gagal menghapus",
        text: error instanceof Error ? error.message : "Terjadi kesalahan",
      });
    }
  }

  const totalAdmin = users.filter((u) => u.role === "admin").length;
  const totalUser = users.filter((u) => u.role === "user").length;
  const totalAktif = users.filter((u) => u.status === "aktif").length;

  return (
    <div className="space-y-6">

      {/* HEADER */}
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <div className="flex items-center gap-2 text-xs text-blue-600">
            <Users size={15} />
            Manajemen Sistem
          </div>

          <h1 className="mt-2 text-2xl font-bold text-slate-800">
            Manajemen Pengguna
          </h1>

          <p className="mt-1 text-sm text-slate-400">
            Kelola akun administrator dan pengguna sistem.
          </p>
        </div>

        <button
          onClick={openCreateModal}
          className="flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-blue-600/20 transition hover:bg-blue-700"
        >
          <Plus size={18} />
          Tambah Pengguna
        </button>
      </div>

      {/* STATISTICS */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        {[
          {
            title: "Total Pengguna",
            value: users.length,
            icon: Users,
            color: "bg-blue-50 text-blue-600",
          },
          {
            title: "Administrator",
            value: totalAdmin,
            icon: ShieldCheck,
            color: "bg-violet-50 text-violet-600",
          },
          {
            title: "Pengguna Aktif",
            value: totalAktif,
            icon: UserCheck,
            color: "bg-emerald-50 text-emerald-600",
          },
        ].map((item) => {
          const Icon = item.icon;

          return (
            <div
              key={item.title}
              className="rounded-2xl border border-slate-200/80 bg-white p-5"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-slate-400">{item.title}</p>
                  <h3 className="mt-2 text-2xl font-bold text-slate-800">
                    {loading ? "..." : item.value}
                  </h3>
                </div>

                <div className={`rounded-xl p-3 ${item.color}`}>
                  <Icon size={22} />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* USER TABLE */}
      <section className="overflow-hidden rounded-2xl border border-slate-200/80 bg-white">

        <div className="border-b border-slate-100 p-5">
          <div className="flex flex-col justify-between gap-4 lg:flex-row lg:items-center">
            <div>
              <h2 className="font-bold text-slate-800">
                Daftar Pengguna
              </h2>
              <p className="mt-1 text-xs text-slate-400">
                {filteredUsers.length} pengguna ditemukan
              </p>
            </div>

            <div className="flex flex-col gap-3 sm:flex-row">
              <div className="relative flex-1 sm:min-w-[220px]">
                <Search
                  size={17}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                />

                <input
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Cari nama, email..."
                  className="w-full rounded-xl border border-slate-200 py-2.5 pl-10 pr-4 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                />
              </div>

              <select
                value={roleFilter}
                onChange={(e) => setRoleFilter(e.target.value)}
                className="rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm outline-none focus:border-blue-500"
              >
                <option value="semua">Semua Role</option>
                <option value="admin">Admin</option>
                <option value="user">User</option>
              </select>

              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm outline-none focus:border-blue-500"
              >
                <option value="semua">Semua Status</option>
                <option value="aktif">Aktif</option>
                <option value="nonaktif">Nonaktif</option>
              </select>

              <button
                onClick={fetchUsers}
                disabled={loading}
                className="flex items-center justify-center rounded-xl border border-slate-200 px-3 py-2.5 text-slate-500 hover:bg-slate-50"
                title="Refresh data"
              >
                <RefreshCw
                  size={17}
                  className={loading ? "animate-spin" : ""}
                />
              </button>
            </div>
          </div>
        </div>

        {/* TABLE */}
        <div className="overflow-x-auto">
          <table className="w-full min-w-[850px] text-left">
            <thead className="bg-slate-50">
              <tr className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">
                <th className="px-5 py-4">Pengguna</th>
                <th className="px-5 py-4">Alamat</th>
                <th className="px-5 py-4">Jenis Kelamin</th>
                <th className="px-5 py-4">Role</th>
                <th className="px-5 py-4">Status</th>
                <th className="px-5 py-4 text-center">Aksi</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td colSpan={6} className="py-16 text-center">
                    <Loader2
                      className="mx-auto animate-spin text-blue-600"
                      size={28}
                    />
                    <p className="mt-3 text-sm text-slate-400">
                      Memuat data pengguna...
                    </p>
                  </td>
                </tr>
              ) : filteredUsers.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-16 text-center">
                    <Users
                      size={35}
                      className="mx-auto text-slate-300"
                    />
                    <p className="mt-3 text-sm font-medium text-slate-600">
                      Pengguna tidak ditemukan
                    </p>
                    <p className="mt-1 text-xs text-slate-400">
                      Coba ubah kata kunci pencarian.
                    </p>
                  </td>
                </tr>
              ) : (
                filteredUsers.map((user) => (
                  <tr
                    key={user.uid}
                    className="transition hover:bg-slate-50/70"
                  >
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-50 font-bold text-blue-600">
                          {user.nama.charAt(0).toUpperCase()}
                        </div>

                        <div>
                          <p className="text-sm font-semibold text-slate-700">
                            {user.nama}
                          </p>
                          <p className="mt-1 text-xs text-slate-400">
                            {user.email}
                          </p>
                        </div>
                      </div>
                    </td>

                    <td className="px-5 py-4">
                      <div className="flex max-w-[180px] items-center gap-2 text-xs text-slate-500">
                        <MapPin size={14} className="shrink-0" />
                        <span className="truncate">{user.alamat}</span>
                      </div>
                    </td>

                    <td className="px-5 py-4 text-xs text-slate-600">
                      {user.jenisKelamin === "L" ? "Laki-laki" : "Perempuan"}
                    </td>

                    <td className="px-5 py-4">
                      <span
                        className={`rounded-lg px-2.5 py-1.5 text-[11px] font-semibold ${
                          user.role === "admin"
                            ? "bg-violet-50 text-violet-600"
                            : "bg-blue-50 text-blue-600"
                        }`}
                      >
                        {user.role === "admin" ? "Administrator" : "User"}
                      </span>
                    </td>

                    <td className="px-5 py-4">
                      <span
                        className={`inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-[11px] font-semibold ${
                          user.status === "aktif"
                            ? "bg-emerald-50 text-emerald-600"
                            : "bg-red-50 text-red-500"
                        }`}
                      >
                        <span
                          className={`h-1.5 w-1.5 rounded-full ${
                            user.status === "aktif"
                              ? "bg-emerald-500"
                              : "bg-red-500"
                          }`}
                        />
                        {user.status === "aktif" ? "Aktif" : "Nonaktif"}
                      </span>
                    </td>

                    <td className="px-5 py-4">
                      <div className="flex items-center justify-center gap-2">
                        <button
                          onClick={() => openEditModal(user)}
                          title="Edit pengguna"
                          className="rounded-lg border border-slate-200 p-2 text-blue-600 transition hover:bg-blue-50"
                        >
                          <Pencil size={15} />
                        </button>

                        <button
                          onClick={() => handleDelete(user)}
                          title="Hapus pengguna"
                          className="rounded-lg border border-slate-200 p-2 text-red-500 transition hover:bg-red-50"
                        >
                          <Trash2 size={15} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        <div className="flex flex-col justify-between gap-2 border-t border-slate-100 px-5 py-4 text-xs text-slate-400 sm:flex-row">
          <span>Menampilkan {filteredUsers.length} dari {users.length} pengguna</span>
          <span>Taskora User Management</span>
        </div>
      </section>

      {/* MODAL FORM */}
      {modalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center overflow-y-auto bg-slate-950/50 p-4 backdrop-blur-sm">
          <div className="my-auto w-full max-w-xl overflow-hidden rounded-2xl bg-white shadow-2xl">

            <div className="flex items-center justify-between border-b border-slate-100 px-6 py-5">
              <div>
                <h2 className="font-bold text-slate-800">
                  {editMode ? "Edit Pengguna" : "Tambah Pengguna"}
                </h2>
                <p className="mt-1 text-xs text-slate-400">
                  Lengkapi informasi akun pengguna.
                </p>
              </div>

              <button
                onClick={() => setModalOpen(false)}
                disabled={saving}
                className="rounded-lg p-2 text-slate-400 hover:bg-slate-100"
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4 p-6">

              <div>
                <label className="mb-2 block text-xs font-semibold text-slate-600">
                  Nama Lengkap
                </label>
                <div className="relative">
                  <UserRound size={17} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    required
                    value={form.nama}
                    onChange={(e) => setForm({ ...form, nama: e.target.value })}
                    placeholder="Masukkan nama lengkap"
                    className="w-full rounded-xl border border-slate-200 py-3 pl-10 pr-4 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                  />
                </div>
              </div>

              <div>
                <label className="mb-2 block text-xs font-semibold text-slate-600">
                  Email
                </label>
                <div className="relative">
                  <Mail size={17} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    required
                    type="email"
                    value={form.email}
                    onChange={(e) => setForm({ ...form, email: e.target.value })}
                    placeholder="nama@email.com"
                    className="w-full rounded-xl border border-slate-200 py-3 pl-10 pr-4 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                  />
                </div>
              </div>

              <div>
                <label className="mb-2 block text-xs font-semibold text-slate-600">
                  Password {editMode && "(Kosongkan jika tidak diubah)"}
                </label>
                <div className="relative">
                  <LockKeyhole size={17} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    required={!editMode}
                    type="password"
                    minLength={6}
                    autoComplete="new-password"
                    value={form.password}
                    onChange={(e) => setForm({ ...form, password: e.target.value })}
                    placeholder={editMode ? "Password baru (opsional)" : "Minimal 6 karakter"}
                    className="w-full rounded-xl border border-slate-200 py-3 pl-10 pr-4 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                  />
                </div>
              </div>

              <div>
                <label className="mb-2 block text-xs font-semibold text-slate-600">
                  Alamat
                </label>
                <div className="relative">
                  <MapPin size={17} className="absolute left-3 top-3.5 text-slate-400" />
                  <textarea
                    required
                    rows={2}
                    value={form.alamat}
                    onChange={(e) => setForm({ ...form, alamat: e.target.value })}
                    placeholder="Masukkan alamat lengkap"
                    className="w-full resize-none rounded-xl border border-slate-200 py-3 pl-10 pr-4 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <label className="mb-2 block text-xs font-semibold text-slate-600">
                    Jenis Kelamin
                  </label>
                  <select
                    value={form.jenisKelamin}
                    onChange={(e) => setForm({
                      ...form,
                      jenisKelamin: e.target.value as "L" | "P",
                    })}
                    className="w-full rounded-xl border border-slate-200 bg-white px-3 py-3 text-sm outline-none focus:border-blue-500"
                  >
                    <option value="L">Laki-laki</option>
                    <option value="P">Perempuan</option>
                  </select>
                </div>

                <div>
                  <label className="mb-2 block text-xs font-semibold text-slate-600">
                    Role
                  </label>
                  <select
                    value={form.role}
                    onChange={(e) => setForm({
                      ...form,
                      role: e.target.value as "admin" | "user",
                    })}
                    className="w-full rounded-xl border border-slate-200 bg-white px-3 py-3 text-sm outline-none focus:border-blue-500"
                  >
                    <option value="user">User</option>
                    <option value="admin">Administrator</option>
                  </select>
                </div>
              </div>

              {editMode && (
                <div>
                  <label className="mb-2 block text-xs font-semibold text-slate-600">
                    Status Akun
                  </label>
                  <select
                    value={form.status}
                    onChange={(e) => setForm({
                      ...form,
                      status: e.target.value as "aktif" | "nonaktif",
                    })}
                    className="w-full rounded-xl border border-slate-200 bg-white px-3 py-3 text-sm outline-none focus:border-blue-500"
                  >
                    <option value="aktif">Aktif</option>
                    <option value="nonaktif">Nonaktif</option>
                  </select>
                </div>
              )}

              <div className="flex flex-col-reverse gap-3 border-t border-slate-100 pt-5 sm:flex-row sm:justify-end">
                <button
                  type="button"
                  disabled={saving}
                  onClick={() => setModalOpen(false)}
                  className="rounded-xl border border-slate-200 px-5 py-3 text-sm font-semibold text-slate-600 hover:bg-slate-50"
                >
                  Batal
                </button>

                <button
                  type="submit"
                  disabled={saving}
                  className="flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-6 py-3 text-sm font-semibold text-white transition hover:bg-blue-700 disabled:opacity-60"
                >
                  {saving ? (
                    <>
                      <Loader2 size={17} className="animate-spin" />
                      Menyimpan...
                    </>
                  ) : (
                    <>
                      <Plus size={17} />
                      {editMode ? "Simpan Perubahan" : "Tambah Pengguna"}
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
