
"use client";

import {
  Users,
  FolderKanban,
  FileText,
  Activity,
  ArrowUpRight,
  Clock,
  CheckCircle2,
} from "lucide-react";

import StatCard from "./StatCard";

interface DashboardOverviewProps {
  role: "admin" | "user";
  nama?: string;
}

const activities = [
  {
    title: "Pengguna baru terdaftar",
    description: "Aktivitas pengguna baru",
    time: "Baru saja",
    status: "Selesai",
  },
  {
    title: "Dokumen diperbarui",
    description: "Pembaruan data dokumen",
    time: "1 jam lalu",
    status: "Selesai",
  },
  {
    title: "Proyek baru dibuat",
    description: "Penambahan proyek",
    time: "2 jam lalu",
    status: "Proses",
  },
];

const weeklyData = [
  { day: "Sen", value: 35 },
  { day: "Sel", value: 55 },
  { day: "Rab", value: 75 },
  { day: "Kam", value: 45 },
  { day: "Jum", value: 90 },
  { day: "Sab", value: 65 },
  { day: "Min", value: 40 },
];

export default function DashboardOverview({
  role,
  nama,
}: DashboardOverviewProps) {
  const isAdmin = role === "admin";

  const stats = isAdmin
    ? [
        {
          title: "Total Pengguna",
          value: "120",
          description: "Data pengguna terdaftar",
          icon: Users,
          color: "#3C8DBC",
          background: "#EAF3F8",
        },
        {
          title: "Total Proyek",
          value: "24",
          description: "Seluruh proyek",
          icon: FolderKanban,
          color: "#00A65A",
          background: "#E5F5EC",
        },
        {
          title: "Total Dokumen",
          value: "48",
          description: "Dokumen tersimpan",
          icon: FileText,
          color: "#F39C12",
          background: "#FFF5E5",
        },
        {
          title: "Aktivitas",
          value: "8",
          description: "Aktivitas terbaru",
          icon: Activity,
          color: "#DD4B39",
          background: "#FCECE9",
        },
      ]
    : [
        {
          title: "Proyek Saya",
          value: "5",
          description: "Proyek yang dimiliki",
          icon: FolderKanban,
          color: "#3C8DBC",
          background: "#EAF3F8",
        },
        {
          title: "Dokumen",
          value: "12",
          description: "Dokumen pribadi",
          icon: FileText,
          color: "#00A65A",
          background: "#E5F5EC",
        },
        {
          title: "Aktivitas",
          value: "8",
          description: "Aktivitas saya",
          icon: Activity,
          color: "#F39C12",
          background: "#FFF5E5",
        },
        {
          title: "Status",
          value: "Aktif",
          description: "Status akun",
          icon: CheckCircle2,
          color: "#00A65A",
          background: "#E5F5EC",
        },
      ];

  return (
    <div className="space-y-6">
      {/* Welcome */}
      <section>
        <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
          <div>
            <h1 className="text-xl font-bold text-gray-800">
              Dashboard Overview
            </h1>

            <p className="mt-1 text-sm text-gray-500">
              Selamat datang kembali, {nama || "Pengguna"}!
            </p>
          </div>

          <div className="flex items-center gap-2 text-xs text-gray-400">
            <Clock size={15} />
            <span>Ringkasan aktivitas sistem</span>
          </div>
        </div>
      </section>

      {/* Statistics */}
      <section>
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-sm font-bold text-gray-700">
            Statistik {isAdmin ? "Sistem" : "Akun"}
          </h2>

          <span className="rounded bg-blue-50 px-2 py-1 text-[10px] font-semibold text-[#3C8DBC]">
            OVERVIEW
          </span>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {stats.map((stat) => (
            <StatCard key={stat.title} {...stat} />
          ))}
        </div>
      </section>

      {/* Charts and activities */}
      <section className="grid grid-cols-1 gap-5 xl:grid-cols-3">
        {/* Chart */}
        <div className="rounded-md bg-white shadow-sm ring-1 ring-gray-200/70 xl:col-span-2">
          <div className="flex items-center justify-between border-b border-gray-100 px-5 py-4">
            <div>
              <h3 className="text-sm font-bold text-gray-800">
                Grafik Aktivitas
              </h3>
              <p className="mt-1 text-[11px] text-gray-400">
                Contoh visualisasi aktivitas mingguan
              </p>
            </div>

            <span className="rounded border border-gray-200 px-2 py-1 text-[10px] text-gray-500">
              Minggu ini
            </span>
          </div>

          <div className="p-5">
            <div className="flex h-[210px] items-end justify-around gap-3 border-b border-l border-gray-200 px-3 pb-0">
              {weeklyData.map((item) => (
                <div
                  key={item.day}
                  className="flex h-full flex-1 flex-col items-center justify-end gap-2"
                >
                  <div className="flex h-full w-full items-end justify-center">
                    <div
                      className="w-full max-w-10 rounded-t-sm bg-[#3C8DBC] transition-all hover:bg-[#286090]"
                      style={{ height: `${item.value}%` }}
                      title={`${item.value}%`}
                    />
                  </div>

                  <span className="pb-2 text-[10px] text-gray-400">
                    {item.day}
                  </span>
                </div>
              ))}
            </div>

            <div className="mt-4 flex items-center justify-center gap-2">
              <span className="h-2.5 w-2.5 rounded-sm bg-[#3C8DBC]" />
              <span className="text-[10px] text-gray-400">
                Aktivitas pengguna (data ilustrasi)
              </span>
            </div>
          </div>
        </div>

        {/* Quick Information */}
        <div className="rounded-md bg-white shadow-sm ring-1 ring-gray-200/70">
          <div className="border-b border-gray-100 px-5 py-4">
            <h3 className="text-sm font-bold text-gray-800">
              Informasi Sistem
            </h3>
            <p className="mt-1 text-[11px] text-gray-400">
              Informasi dashboard
            </p>
          </div>

          <div className="space-y-5 p-5">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-md bg-green-50 text-green-600">
                <CheckCircle2 size={20} />
              </div>
              <div>
                <p className="text-xs font-semibold text-gray-700">
                  Sistem Berjalan
                </p>
                <p className="mt-1 text-[10px] text-gray-400">
                  Status tampilan sistem
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-md bg-blue-50 text-[#3C8DBC]">
                <Users size={20} />
              </div>
              <div>
                <p className="text-xs font-semibold text-gray-700">
                  {isAdmin ? "Administrator" : "Member"}
                </p>
                <p className="mt-1 text-[10px] text-gray-400">
                  Hak akses akun
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-md bg-orange-50 text-orange-500">
                <Activity size={20} />
              </div>
              <div>
                <p className="text-xs font-semibold text-gray-700">
                  TASKORA
                </p>
                <p className="mt-1 text-[10px] text-gray-400">
                  Management System v1.0
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Recent Activity */}
      <section className="overflow-hidden rounded-md bg-white shadow-sm ring-1 ring-gray-200/70">
        <div className="flex items-center justify-between border-b border-gray-100 px-5 py-4">
          <div>
            <h3 className="text-sm font-bold text-gray-800">
              Aktivitas Terbaru
            </h3>
            <p className="mt-1 text-[11px] text-gray-400">
              Ringkasan aktivitas terakhir
            </p>
          </div>

          <button className="flex items-center gap-1 text-xs font-medium text-[#3C8DBC] hover:underline">
            Selengkapnya
            <ArrowUpRight size={14} />
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full min-w-[550px] text-left">
            <thead className="bg-gray-50">
              <tr className="text-[10px] font-bold uppercase tracking-wider text-gray-400">
                <th className="px-5 py-3">Aktivitas</th>
                <th className="px-5 py-3">Deskripsi</th>
                <th className="px-5 py-3">Waktu</th>
                <th className="px-5 py-3">Status</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-gray-100">
              {activities.map((activity, index) => (
                <tr key={index} className="hover:bg-gray-50">
                  <td className="px-5 py-4 text-xs font-semibold text-gray-700">
                    {activity.title}
                  </td>

                  <td className="px-5 py-4 text-xs text-gray-500">
                    {activity.description}
                  </td>

                  <td className="px-5 py-4 text-xs text-gray-400">
                    {activity.time}
                  </td>

                  <td className="px-5 py-4">
                    <span
                      className={`rounded px-2 py-1 text-[10px] font-semibold ${
                        activity.status === "Selesai"
                          ? "bg-green-50 text-green-600"
                          : "bg-orange-50 text-orange-600"
                      }`}
                    >
                      {activity.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
