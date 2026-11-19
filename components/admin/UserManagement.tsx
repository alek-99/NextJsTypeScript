
"use client";

import { useCallback, useEffect, useState } from "react";
import { auth } from "@/lib/firebase/client";
import {
  Plus, Search, Pencil, Trash2, Users,
  UserCheck, UserX, X, Loader2, RefreshCw
} from "lucide-react";
import Swal from "sweetalert2";
import type { UserData } from "@/types/user";

const initialForm = {
  nama: "",
  email: "",
  password: "",
  alamat: "",
  jenisKelamin: "L" as "L" | "P",
  status: "aktif" as "aktif" | "nonaktif",
};

export default function UserManagement() {
  const [users, setUsers] = useState<UserData[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [modal, setModal] = useState(false);
  const [editing, setEditing] = useState<string | null>(null);
  const [form, setForm] = useState(initialForm);

  const getToken = async () => {
    const currentUser = auth.currentUser;
    if (!currentUser) throw new Error("Sesi login berakhir");
    return currentUser.getIdToken();
  };


const api = async (url: string, options: RequestInit = {}) => {
  const currentUser = auth.currentUser;

  if (!currentUser) {
    throw new Error("Sesi login berakhir. Silakan login kembali.");
  }

  const token = await currentUser.getIdToken();

  const response = await fetch(url, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
      ...options.headers,
    },
    cache: "no-store",
  });

  // Baca response sebagai text terlebih dahulu
  const raw = await response.text();

  // Hindari error Unexpected end of JSON input
  let result: any = {};

  if (raw.trim()) {
    try {
      result = JSON.parse(raw);
    } catch {
      console.error("Response bukan JSON:", raw);

      throw new Error(
        `Server mengembalikan response tidak valid (HTTP ${response.status})`
      );
    }
  }

  if (!response.ok) {
    throw new Error(
      result.message ||
      result.error ||
      `Request gagal (HTTP ${response.status})`
    );
  }

  return result;
};


  const loadUsers = useCallback(async () => {
    try {
      setLoading(true);
      const result = await api("/api/admin/users");
      setUsers(result.users);
    } catch (error) {
      Swal.fire(
        "Error",
        error instanceof Error ? error.message : "Gagal mengambil data",
        "error"
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadUsers();
  }, [loadUsers]);

  const openAdd = () => {
    setEditing(null);
    setForm(initialForm);
    setModal(true);
  };

  const openEdit = (user: UserData) => {
    setEditing(user.uid);
    setForm({
      nama: user.nama,
      email: user.email,
      password: "",
      alamat: user.alamat,
      jenisKelamin: user.jenisKelamin,
      status: user.status,
    });
    setModal(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();

    if (form.password && form.password.length < 6) {
      Swal.fire("Perhatian", "Password minimal 6 karakter", "warning");
      return;
    }

    if (!editing && !form.password) {
      Swal.fire("Perhatian", "Password wajib diisi", "warning");
      return;
    }

    try {
      setSaving(true);

      const url = editing
        ? `/api/admin/users/${editing}`
        : "/api/admin/users";

      await api(url, {
        method: editing ? "PATCH" : "POST",
        body: JSON.stringify({
          ...form,
          ...(editing && !form.password ? { password: undefined } : {}),
        }),
      });

      setModal(false);

      await Swal.fire({
        icon: "success",
        title: "Berhasil",
        text: editing
          ? "Data user diperbarui"
          : "User berhasil ditambahkan",
        timer: 1400,
        showConfirmButton: false,
      });

      await loadUsers();
    } catch (error) {
      Swal.fire(
        "Gagal",
        error instanceof Error ? error.message : "Gagal menyimpan",
        "error"
      );
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (user: UserData) => {
    const confirmation = await Swal.fire({
      title: "Hapus pengguna?",
      text: `Akun ${user.nama} akan dihapus secara permanen.`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#dc2626",
      confirmButtonText: "Ya, Hapus",
      cancelButtonText: "Batal",
    });

    if (!confirmation.isConfirmed) return;

    try {
      await api(`/api/admin/users/${user.uid}`, {
        method: "DELETE",
      });

      await loadUsers();

      Swal.fire("Berhasil", "User berhasil dihapus", "success");
    } catch (error) {
      Swal.fire(
        "Gagal",
        error instanceof Error ? error.message : "Gagal menghapus",
        "error"
      );
    }
  };

  const filtered = users.filter((user) =>
    `${user.nama} ${user.email}`
      .toLowerCase()
      .includes(search.toLowerCase())
  );

  const active = users.filter((u) => u.status === "aktif").length;
  const inactive = users.filter((u) => u.status === "nonaktif").length;

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {[
          { label: "Total User", value: users.length, icon: Users },
          { label: "User Aktif", value: active, icon: UserCheck },
          { label: "User Nonaktif", value: inactive, icon: UserX },
        ].map((item) => (
          <div key={item.label} className="bg-white border rounded-xl p-5">
            <div className="flex justify-between items-center">
              <div>
                <p className="text-sm text-slate-500">{item.label}</p>
                <h3 className="text-3xl font-bold mt-2">{item.value}</h3>
              </div>
              <item.icon className="text-blue-600" size={27} />
            </div>
          </div>
        ))}
      </div>

      <div className="bg-white border rounded-xl p-5">
        <div className="flex flex-col sm:flex-row gap-4 justify-between mb-6">
          <div>
            <h2 className="font-bold text-xl">Manajemen User</h2>
            <p className="text-sm text-slate-500 mt-1">
              Kelola akun pengguna aplikasi
            </p>
          </div>

          <button
            onClick={openAdd}
            className="bg-blue-600 text-white rounded-lg px-4 py-2.5 flex items-center justify-center gap-2 hover:bg-blue-700"
          >
            <Plus size={18} /> Tambah User
          </button>
        </div>

        <div className="flex gap-2 mb-5">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-3 text-slate-400" size={18} />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Cari nama atau email..."
              className="w-full border rounded-lg py-2.5 pl-10 pr-3 outline-none focus:border-blue-500"
            />
          </div>

          <button
            onClick={loadUsers}
            className="border rounded-lg px-3 hover:bg-slate-50"
            title="Refresh"
          >
            <RefreshCw size={18} />
          </button>
        </div>

        {loading ? (
          <div className="py-16 flex justify-center">
            <Loader2 className="animate-spin text-blue-600" size={30} />
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="bg-slate-50 text-slate-600">
                <tr>
                  <th className="p-3">No</th>
                  <th className="p-3">Nama</th>
                  <th className="p-3">Email</th>
                  <th className="p-3">Jenis Kelamin</th>
                  <th className="p-3">Alamat</th>
                  <th className="p-3">Status</th>
                  <th className="p-3 text-center">Aksi</th>
                </tr>
              </thead>

              <tbody>
                {filtered.map((user, index) => (
                  <tr key={user.uid} className="border-b hover:bg-slate-50">
                    <td className="p-3">{index + 1}</td>
                    <td className="p-3 font-semibold">{user.nama}</td>
                    <td className="p-3">{user.email}</td>
                    <td className="p-3">
                      {user.jenisKelamin === "L" ? "Laki-laki" : "Perempuan"}
                    </td>
                    <td className="p-3 max-w-48 truncate">{user.alamat}</td>
                    <td className="p-3">
                      <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${
                        user.status === "aktif"
                          ? "bg-green-100 text-green-700"
                          : "bg-red-100 text-red-700"
                      }`}>
                        {user.status}
                      </span>
                    </td>
                    <td className="p-3">
                      <div className="flex justify-center gap-2">
                        <button
                          onClick={() => openEdit(user)}
                          className="p-2 text-blue-600 bg-blue-50 rounded-lg"
                          title="Edit"
                        >
                          <Pencil size={16} />
                        </button>

                        <button
                          onClick={() => handleDelete(user)}
                          className="p-2 text-red-600 bg-red-50 rounded-lg"
                          title="Hapus"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}

                {filtered.length === 0 && (
                  <tr>
                    <td colSpan={7} className="p-10 text-center text-slate-500">
                      Data pengguna tidak ditemukan.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {modal && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center p-5 border-b">
              <div>
                <h3 className="font-bold text-lg">
                  {editing ? "Edit Pengguna" : "Tambah Pengguna"}
                </h3>
                <p className="text-xs text-slate-500 mt-1">
                  Lengkapi informasi akun pengguna
                </p>
              </div>
              <button onClick={() => setModal(false)}>
                <X size={22} />
              </button>
            </div>

            <form onSubmit={handleSave} className="p-5 space-y-4">
              <div>
                <label className="text-sm font-medium">Nama Lengkap</label>
                <input
                  required
                  value={form.nama}
                  onChange={(e) => setForm({...form, nama: e.target.value})}
                  className="w-full mt-1 border rounded-lg p-3"
                  placeholder="Nama lengkap"
                />
              </div>

              <div>
                <label className="text-sm font-medium">Email</label>
                <input
                  required
                  type="email"
                  value={form.email}
                  onChange={(e) => setForm({...form, email: e.target.value})}
                  className="w-full mt-1 border rounded-lg p-3"
                  placeholder="email@example.com"
                />
              </div>

              <div>
                <label className="text-sm font-medium">
                  Password {editing && "(Kosongkan jika tidak diganti)"}
                </label>
                <input
                  type="password"
                  required={!editing}
                  minLength={6}
                  value={form.password}
                  onChange={(e) => setForm({...form, password: e.target.value})}
                  className="w-full mt-1 border rounded-lg p-3"
                  placeholder="Minimal 6 karakter"
                />
              </div>

              <div>
                <label className="text-sm font-medium">Alamat</label>
                <textarea
                  required
                  rows={3}
                  value={form.alamat}
                  onChange={(e) => setForm({...form, alamat: e.target.value})}
                  className="w-full mt-1 border rounded-lg p-3"
                  placeholder="Alamat lengkap"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-sm font-medium">Jenis Kelamin</label>
                  <select
                    value={form.jenisKelamin}
                    onChange={(e) => setForm({...form, jenisKelamin: e.target.value as "L" | "P"})}
                    className="w-full mt-1 border rounded-lg p-3"
                  >
                    <option value="L">Laki-laki</option>
                    <option value="P">Perempuan</option>
                  </select>
                </div>

                <div>
                  <label className="text-sm font-medium">Status</label>
                  <select
                    value={form.status}
                    onChange={(e) => setForm({...form, status: e.target.value as "aktif" | "nonaktif"})}
                    className="w-full mt-1 border rounded-lg p-3"
                  >
                    <option value="aktif">Aktif</option>
                    <option value="nonaktif">Nonaktif</option>
                  </select>
                </div>
              </div>

              <button
                disabled={saving}
                className="w-full bg-blue-600 text-white rounded-lg p-3 font-semibold hover:bg-blue-700 disabled:opacity-50"
              >
                {saving ? "Menyimpan..." : editing ? "Simpan Perubahan" : "Buat Akun User"}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
