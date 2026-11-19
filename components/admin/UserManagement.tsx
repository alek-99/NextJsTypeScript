
"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import type { FormEvent } from "react";
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
  ChevronDown,
  Download,
  UserPlus,
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

const inputClass =
  "w-full rounded border border-gray-300 bg-white px-3 py-2.5 text-sm text-gray-700 outline-none transition placeholder:text-gray-400 focus:border-[#3C8DBC] focus:ring-1 focus:ring-[#3C8DBC]";

const labelClass =
  "mb-1.5 block text-xs font-semibold text-gray-600";

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

  // Firebase Token
  const getToken = useCallback(async () => {
    const currentUser = auth.currentUser;

    if (!currentUser) {
      throw new Error(
        "Sesi login tidak ditemukan. Silakan login kembali."
      );
    }

    return currentUser.getIdToken();
  }, []);

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
        throw new Error(
          result.message || "Gagal mengambil data pengguna."
        );
      }

      setUsers(Array.isArray(result.users) ? result.users : []);
    } catch (error) {
      console.error(error);

      Swal.fire({
        icon: "error",
        title: "Gagal",
        text:
          error instanceof Error
            ? error.message
            : "Gagal mengambil data pengguna.",
        confirmButtonColor: "#3C8DBC",
      });
    } finally {
      setLoading(false);
    }
  }, [getToken]);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  // Filter pengguna
  const filteredUsers = useMemo(() => {
    return users.filter((user) => {
      const keyword = search.toLowerCase();

      const matchSearch =
        (user.nama || "").toLowerCase().includes(keyword) ||
        (user.email || "").toLowerCase().includes(keyword) ||
        (user.alamat || "").toLowerCase().includes(keyword);

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
      nama: user.nama || "",
      email: user.email || "",
      password: "",
      alamat: user.alamat || "",
      jenisKelamin: user.jenisKelamin || "L",
      role: user.role,
      status: user.status,
    });

    setModalOpen(true);
  }

  // Menyimpan pengguna
  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
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
        throw new Error(
          result.message || "Gagal menyimpan pengguna."
        );
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
        text:
          error instanceof Error
            ? error.message
            : "Terjadi kesalahan.",
        confirmButtonColor: "#3C8DBC",
      });
    } finally {
      setSaving(false);
    }
  }

  // Menghapus pengguna
  async function handleDelete(user: UserData) {
    const confirmation = await Swal.fire({
      title: "Hapus pengguna?",
      html: `
        <p style="font-size:13px;color:#64748b">
          Akun <b>${user.nama}</b> akan dihapus dari
          Firebase Authentication dan Firestore.
        </p>
      `,
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Ya, hapus",
      cancelButtonText: "Batal",
      confirmButtonColor: "#dc3545",
      cancelButtonColor: "#6c757d",
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
        throw new Error(
          result.message || "Gagal menghapus pengguna."
        );
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
        text:
          error instanceof Error
            ? error.message
            : "Terjadi kesalahan.",
        confirmButtonColor: "#3C8DBC",
      });
    }
  }

  // Statistik
  const totalAdmin = users.filter(
    (u) => u.role === "admin"
  ).length;

  const totalUser = users.filter(
    (u) => u.role === "user"
  ).length;

  const totalAktif = users.filter(
    (u) => u.status === "aktif"
  ).length;

  const totalNonaktif = users.length - totalAktif;

  return (
    <div className="space-y-5">

      {/* PAGE HEADER */}
      <section className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <div className="mb-2 flex items-center gap-2 text-xs text-[#3C8DBC]">
            {/* <Users size={15} />
            <span>Manajemen Sistem</span>
            <span className="text-gray-300">/</span>
            <span className="text-gray-400">Pengguna</span> */}
          </div>

          <h1 className="text-2xl font-semibold text-gray-800">
            Manajemen Pengguna (Santri)
          </h1>

          <p className="mt-1 text-sm text-gray-500">
            Kelola akun administrator dan Santri Ponpes Al-Arbain
          </p>
        </div>

        <button
          onClick={openCreateModal}
          className="flex items-center justify-center gap-2 rounded bg-[#3C8DBC] px-4 py-2.5 text-sm font-medium text-white shadow-sm transition hover:bg-[#367FA9]"
        >
          <Plus size={17} />
          Tambah Pengguna
        </button>
      </section>

      {/* STATISTICS */}
      <section>
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-sm font-semibold text-gray-700">
            Ringkasan Pengguna
          </h2>

          <span className="text-[11px] text-gray-400">
            Data keseluruhan
          </span>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">

          {/* Total Pengguna */}
          <div className="flex overflow-hidden rounded border border-gray-200 bg-white shadow-sm">
            <div className="flex flex-1 flex-col justify-center p-4">
              <p className="text-xs text-gray-500">
                Total Pengguna
              </p>

              <h3 className="mt-1 text-3xl font-bold text-gray-800">
                {loading ? "..." : users.length}
              </h3>

              <p className="mt-1 text-[11px] text-gray-400">
                Seluruh akun terdaftar
              </p>
            </div>

            <div className="flex w-[85px] items-center justify-center bg-[#3C8DBC] text-white">
              <Users size={35} strokeWidth={1.5} />
            </div>
          </div>

          {/* Administrator */}
          <div className="flex overflow-hidden rounded border border-gray-200 bg-white shadow-sm">
            <div className="flex flex-1 flex-col justify-center p-4">
              <p className="text-xs text-gray-500">
                Administrator
              </p>

              <h3 className="mt-1 text-3xl font-bold text-gray-800">
                {loading ? "..." : totalAdmin}
              </h3>

              <p className="mt-1 text-[11px] text-gray-400">
                Akun dengan akses admin
              </p>
            </div>

            <div className="flex w-[85px] items-center justify-center bg-[#605CA8] text-white">
              <ShieldCheck size={35} strokeWidth={1.5} />
            </div>
          </div>

          {/* User Aktif */}
          <div className="flex overflow-hidden rounded border border-gray-200 bg-white shadow-sm">
            <div className="flex flex-1 flex-col justify-center p-4">
              <p className="text-xs text-gray-500">
                Pengguna Aktif
              </p>

              <h3 className="mt-1 text-3xl font-bold text-gray-800">
                {loading ? "..." : totalAktif}
              </h3>

              <p className="mt-1 text-[11px] text-gray-400">
                Akun berstatus aktif
              </p>
            </div>

            <div className="flex w-[85px] items-center justify-center bg-[#00A65A] text-white">
              <UserCheck size={35} strokeWidth={1.5} />
            </div>
          </div>

          {/* User Nonaktif */}
          <div className="flex overflow-hidden rounded border border-gray-200 bg-white shadow-sm">
            <div className="flex flex-1 flex-col justify-center p-4">
              <p className="text-xs text-gray-500">
                Pengguna Nonaktif
              </p>

              <h3 className="mt-1 text-3xl font-bold text-gray-800">
                {loading ? "..." : totalNonaktif}
              </h3>

              <p className="mt-1 text-[11px] text-gray-400">
                Akun berstatus nonaktif
              </p>
            </div>

            <div className="flex w-[85px] items-center justify-center bg-[#DD4B39] text-white">
              <UserRound size={35} strokeWidth={1.5} />
            </div>
          </div>
        </div>
      </section>

      {/* MAIN TABLE */}
      <section className="overflow-hidden rounded border border-gray-200 bg-white shadow-sm">

        {/* TABLE HEADER */}
        <div className="flex flex-col justify-between gap-3 border-b border-gray-200 px-4 py-4 sm:flex-row sm:items-center sm:px-5">
          <div>
            <h2 className="text-sm font-semibold text-gray-800">
              Daftar Pengguna
            </h2>

            <p className="mt-1 text-xs text-gray-400">
              {filteredUsers.length} pengguna ditemukan
            </p>
          </div>

          <button
            onClick={fetchUsers}
            disabled={loading}
            className="flex items-center justify-center gap-2 self-start rounded border border-gray-300 px-3 py-2 text-xs text-gray-600 transition hover:bg-gray-50 disabled:opacity-50 sm:self-auto"
          >
            <RefreshCw
              size={14}
              className={loading ? "animate-spin" : ""}
            />
            Refresh Data
          </button>
        </div>

        {/* FILTER TOOLBAR */}
        <div className="border-b border-gray-200 bg-[#FAFAFA] p-4">
          <div className="mb-3 flex items-center gap-2 text-xs font-semibold text-gray-600">
            <Filter size={15} />
            Filter dan Pencarian
          </div>

          <div className="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-4">

            {/* Search */}
            <div className="relative xl:col-span-2">
              <Search
                size={16}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
              />

              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Cari nama, email atau alamat..."
                className={`${inputClass} pl-9`}
              />
            </div>

            {/* Role Filter */}
            <div className="relative">
              <select
                value={roleFilter}
                onChange={(e) => setRoleFilter(e.target.value)}
                className={`${inputClass} appearance-none pr-9`}
              >
                <option value="semua">Semua Role</option>
                <option value="admin">Administrator</option>
                <option value="user">User</option>
              </select>

              <ChevronDown
                size={15}
                className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-gray-400"
              />
            </div>

            {/* Status Filter */}
            <div className="relative">
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className={`${inputClass} appearance-none pr-9`}
              >
                <option value="semua">Semua Status</option>
                <option value="aktif">Aktif</option>
                <option value="nonaktif">Nonaktif</option>
              </select>

              <ChevronDown
                size={15}
                className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-gray-400"
              />
            </div>
          </div>
        </div>

        {/* TABLE */}
        <div className="overflow-x-auto">
          <table className="w-full min-w-[850px] text-left">

            <thead className="bg-[#F4F6F9]">
              <tr className="border-b border-gray-200 text-[11px] font-semibold uppercase tracking-wide text-gray-500">
                <th className="px-5 py-3.5">Pengguna</th>
                <th className="px-5 py-3.5">Alamat</th>
                <th className="px-5 py-3.5">Jenis Kelamin</th>
                <th className="px-5 py-3.5">Role</th>
                <th className="px-5 py-3.5">Status</th>
                <th className="px-5 py-3.5 text-center">Aksi</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-gray-100">

              {loading ? (
                <tr>
                  <td colSpan={6} className="py-16 text-center">
                    <Loader2
                      className="mx-auto animate-spin text-[#3C8DBC]"
                      size={28}
                    />

                    <p className="mt-3 text-xs text-gray-400">
                      Memuat data pengguna...
                    </p>
                  </td>
                </tr>
              ) : filteredUsers.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-16 text-center">
                    <Users
                      size={36}
                      className="mx-auto text-gray-300"
                    />

                    <p className="mt-3 text-sm font-semibold text-gray-600">
                      Pengguna tidak ditemukan
                    </p>

                    <p className="mt-1 text-xs text-gray-400">
                      Coba ubah kata kunci atau filter pencarian.
                    </p>
                  </td>
                </tr>
              ) : (
                filteredUsers.map((user) => (
                  <tr
                    key={user.uid}
                    className="transition hover:bg-[#F8FAFC]"
                  >
                    {/* User */}
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-3">
                        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#3C8DBC] text-sm font-semibold text-white">
                          {(user.nama || "U").charAt(0).toUpperCase()}
                        </div>

                        <div className="min-w-0">
                          <p className="text-xs font-semibold text-gray-700">
                            {user.nama}
                          </p>

                          <p className="mt-1 text-[11px] text-gray-400">
                            {user.email}
                          </p>
                        </div>
                      </div>
                    </td>

                    {/* Address */}
                    <td className="px-5 py-4">
                      <div className="flex max-w-[180px] items-center gap-2 text-xs text-gray-500">
                        <MapPin
                          size={14}
                          className="shrink-0 text-gray-400"
                        />

                        <span className="truncate">
                          {user.alamat || "-"}
                        </span>
                      </div>
                    </td>

                    {/* Gender */}
                    <td className="px-5 py-4 text-xs text-gray-600">
                      {user.jenisKelamin === "L"
                        ? "Laki-laki"
                        : "Perempuan"}
                    </td>

                    {/* Role */}
                    <td className="px-5 py-4">
                      <span
                        className={`inline-flex items-center rounded px-2.5 py-1 text-[10px] font-semibold ${
                          user.role === "admin"
                            ? "bg-[#605CA8]/10 text-[#605CA8]"
                            : "bg-[#3C8DBC]/10 text-[#3C8DBC]"
                        }`}
                      >
                        {user.role === "admin"
                          ? "Administrator"
                          : "User"}
                      </span>
                    </td>

                    {/* Status */}
                    <td className="px-5 py-4">
                      <span
                        className={`inline-flex items-center gap-1.5 rounded px-2.5 py-1 text-[10px] font-semibold ${
                          user.status === "aktif"
                            ? "bg-green-50 text-green-700"
                            : "bg-red-50 text-red-600"
                        }`}
                      >
                        <span
                          className={`h-1.5 w-1.5 rounded-full ${
                            user.status === "aktif"
                              ? "bg-green-500"
                              : "bg-red-500"
                          }`}
                        />

                        {user.status === "aktif"
                          ? "Aktif"
                          : "Nonaktif"}
                      </span>
                    </td>

                    {/* Actions */}
                    <td className="px-5 py-4">
                      <div className="flex items-center justify-center gap-2">
                        <button
                          onClick={() => openEditModal(user)}
                          title="Edit pengguna"
                          aria-label={`Edit ${user.nama}`}
                          className="rounded border border-gray-200 p-2 text-[#3C8DBC] transition hover:border-[#3C8DBC] hover:bg-blue-50"
                        >
                          <Pencil size={14} />
                        </button>

                        <button
                          onClick={() => handleDelete(user)}
                          title="Hapus pengguna"
                          aria-label={`Hapus ${user.nama}`}
                          className="rounded border border-gray-200 p-2 text-red-500 transition hover:border-red-400 hover:bg-red-50"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* TABLE FOOTER */}
        <div className="flex flex-col justify-between gap-2 border-t border-gray-200 bg-[#FAFAFA] px-5 py-3 text-[11px] text-gray-500 sm:flex-row">
          <span>
            Menampilkan {filteredUsers.length} dari {users.length} pengguna
          </span>

          <span>
            Administrator: {totalAdmin} | User: {totalUser}
          </span>
        </div>
      </section>

      {/* MODAL FORM */}
      {modalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center overflow-y-auto bg-black/50 p-3 sm:p-5">

          <div className="my-auto w-full max-w-xl overflow-hidden rounded-md border border-gray-200 bg-white shadow-2xl">

            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-gray-200 bg-[#F4F6F9] px-5 py-4">
              <div>
                <h2 className="text-base font-semibold text-gray-800">
                  {editMode ? "Edit Pengguna" : "Tambah Pengguna"}
                </h2>

                <p className="mt-1 text-xs text-gray-500">
                  Lengkapi informasi akun pengguna TASKORA.
                </p>
              </div>

              <button
                onClick={() => setModalOpen(false)}
                disabled={saving}
                className="rounded p-2 text-gray-500 transition hover:bg-gray-200 hover:text-gray-800"
                aria-label="Tutup modal"
              >
                <X size={19} />
              </button>
            </div>

            {/* Modal Body */}
            <form
              onSubmit={handleSubmit}
              className="max-h-[75vh] space-y-4 overflow-y-auto p-5"
            >

              {/* Nama */}
              <div>
                <label className={labelClass}>
                  Nama Lengkap
                </label>

                <div className="relative">
                  <UserRound
                    size={16}
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                  />

                  <input
                    required
                    value={form.nama}
                    onChange={(e) =>
                      setForm({ ...form, nama: e.target.value })
                    }
                    placeholder="Masukkan nama lengkap"
                    className={`${inputClass} pl-9`}
                  />
                </div>
              </div>

              {/* Email */}
              <div>
                <label className={labelClass}>
                  Email
                </label>

                <div className="relative">
                  <Mail
                    size={16}
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                  />

                  <input
                    required
                    type="email"
                    value={form.email}
                    onChange={(e) =>
                      setForm({ ...form, email: e.target.value })
                    }
                    placeholder="nama@email.com"
                    className={`${inputClass} pl-9`}
                  />
                </div>
              </div>

              {/* Password */}
              <div>
                <label className={labelClass}>
                  Password{" "}
                  {editMode && (
                    <span className="font-normal text-gray-400">
                      (Kosongkan jika tidak diubah)
                    </span>
                  )}
                </label>

                <div className="relative">
                  <LockKeyhole
                    size={16}
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                  />

                  <input
                    required={!editMode}
                    type="password"
                    minLength={6}
                    autoComplete="new-password"
                    value={form.password}
                    onChange={(e) =>
                      setForm({ ...form, password: e.target.value })
                    }
                    placeholder={
                      editMode
                        ? "Password baru (opsional)"
                        : "Minimal 6 karakter"
                    }
                    className={`${inputClass} pl-9`}
                  />
                </div>
              </div>

              {/* Address */}
              <div>
                <label className={labelClass}>
                  Alamat
                </label>

                <div className="relative">
                  <MapPin
                    size={16}
                    className="absolute left-3 top-3 text-gray-400"
                  />

                  <textarea
                    required
                    rows={3}
                    value={form.alamat}
                    onChange={(e) =>
                      setForm({ ...form, alamat: e.target.value })
                    }
                    placeholder="Masukkan alamat lengkap"
                    className={`${inputClass} resize-none pl-9`}
                  />
                </div>
              </div>

              {/* Gender and Role */}
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <label className={labelClass}>
                    Jenis Kelamin
                  </label>

                  <div className="relative">
                    <select
                      value={form.jenisKelamin}
                      onChange={(e) =>
                        setForm({
                          ...form,
                          jenisKelamin: e.target.value as "L" | "P",
                        })
                      }
                      className={`${inputClass} appearance-none pr-9`}
                    >
                      <option value="L">Laki-laki</option>
                      <option value="P">Perempuan</option>
                    </select>

                    <ChevronDown
                      size={15}
                      className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-gray-400"
                    />
                  </div>
                </div>

                <div>
                  <label className={labelClass}>
                    Role Pengguna
                  </label>

                  <div className="relative">
                    <select
                      value={form.role}
                      onChange={(e) =>
                        setForm({
                          ...form,
                          role: e.target.value as "admin" | "user",
                        })
                      }
                      className={`${inputClass} appearance-none pr-9`}
                    >
                      <option value="user">User</option>
                      <option value="admin">Administrator</option>
                    </select>

                    <ChevronDown
                      size={15}
                      className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-gray-400"
                    />
                  </div>
                </div>
              </div>

              {/* Status */}
              {editMode && (
                <div>
                  <label className={labelClass}>
                    Status Akun
                  </label>

                  <div className="relative">
                    <select
                      value={form.status}
                      onChange={(e) =>
                        setForm({
                          ...form,
                          status: e.target.value as "aktif" | "nonaktif",
                        })
                      }
                      className={`${inputClass} appearance-none pr-9`}
                    >
                      <option value="aktif">Aktif</option>
                      <option value="nonaktif">Nonaktif</option>
                    </select>

                    <ChevronDown
                      size={15}
                      className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-gray-400"
                    />
                  </div>
                </div>
              )}

              {/* Modal Footer */}
              <div className="flex flex-col-reverse gap-2 border-t border-gray-200 pt-4 sm:flex-row sm:justify-end">

                <button
                  type="button"
                  disabled={saving}
                  onClick={() => setModalOpen(false)}
                  className="rounded border border-gray-300 px-5 py-2.5 text-xs font-semibold text-gray-600 transition hover:bg-gray-100 disabled:opacity-50"
                >
                  Batal
                </button>

                <button
                  type="submit"
                  disabled={saving}
                  className="flex items-center justify-center gap-2 rounded bg-[#3C8DBC] px-5 py-2.5 text-xs font-semibold text-white transition hover:bg-[#367FA9] disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {saving ? (
                    <>
                      <Loader2 size={15} className="animate-spin" />
                      Menyimpan...
                    </>
                  ) : (
                    <>
                      {editMode ? (
                        <Pencil size={15} />
                      ) : (
                        <UserPlus size={15} />
                      )}

                      {editMode
                        ? "Simpan Perubahan"
                        : "Tambah Pengguna"}
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
