
"use client";

import {
  Users,
  FolderKanban,
  FileText,
  TrendingUp,
  ArrowUpRight,
  MoreHorizontal,
} from "lucide-react";

interface Props {
  nama: string;
  role: string;
}

export default function DashboardOverview({ nama, role }: Props) {
  const isAdmin = role === "admin";

  const stats = isAdmin
    ? [
        { label: "Total Pengguna", value: "128", icon: Users, color: "blue" },
        { label: "Total Proyek", value: "24", icon: FolderKanban, color: "violet" },
        { label: "Total Laporan", value: "86", icon: FileText, color: "amber" },
        { label: "Pertumbuhan", value: "12.8%", icon: TrendingUp, color: "emerald" },
      ]
    : [
        { label: "Proyek Saya", value: "08", icon: FolderKanban, color: "blue" },
        { label: "Dokumen", value: "16", icon: FileText, color: "violet" },
        { label: "Aktivitas", value: "24", icon: TrendingUp, color: "amber" },
        { label: "Selesai", value: "06", icon: Users, color: "emerald" },
      ];

  const colorClasses: Record<string, string> = {
    blue: "bg-blue-50 text-blue-600",
    violet: "bg-violet-50 text-violet-600",
    amber: "bg-amber-50 text-amber-600",
    emerald: "bg-emerald-50 text-emerald-600",
  };

  return (
    <div className="space-y-7">
      <section className="relative overflow-hidden rounded-2xl bg-[#1746C8] p-6 text-white sm:p-8">
        <div className="relative z-10 max-w-xl">
          <span className="rounded-lg bg-white/15 px-3 py-1.5 text-[10px] font-semibold tracking-wider">
            {isAdmin ? "ADMINISTRATOR PANEL" : "USER PANEL"}
          </span>

          <h1 className="mt-5 text-2xl font-bold sm:text-3xl">
            Selamat datang, {nama}!
          </h1>

          <p className="mt-3 text-sm leading-relaxed text-blue-100">
            {isAdmin
              ? "Kelola seluruh aktivitas sistem dan pantau perkembangan melalui dashboard administrator."
              : "Pantau aktivitas dan kelola pekerjaan Anda melalui dashboard pengguna."}
          </p>

          <div className="mt-6 flex items-center gap-2 text-xs text-blue-100">
            <span className="h-2 w-2 rounded-full bg-green-400" />
            Sistem berjalan dengan normal
          </div>
        </div>

        <div className="absolute -right-12 -top-24 h-72 w-72 rounded-full border-[35px] border-white/5" />
        <div className="absolute -bottom-36 right-28 h-64 w-64 rounded-full border-[30px] border-white/5" />
      </section>

      <section>
        <div className="mb-5 flex items-center justify-between">
          <div>
            <h2 className="text-base font-bold text-gray-800">
              Ringkasan Dashboard
            </h2>
            <p className="mt-1 text-xs text-gray-400">
              Informasi aktivitas sistem
            </p>
          </div>

          <span className="text-xs text-gray-400">
            Overview
          </span>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {stats.map((stat) => {
            const Icon = stat.icon;

            return (
              <div
                key={stat.label}
                className="rounded-2xl border border-gray-100 bg-white p-5 transition hover:-translate-y-1 hover:shadow-lg"
              >
                <div className="flex items-center justify-between">
                  <div className={`flex h-11 w-11 items-center justify-center rounded-xl ${colorClasses[stat.color]}`}>
                    <Icon size={21} />
                  </div>

                  <ArrowUpRight size={18} className="text-gray-300" />
                </div>

                <p className="mt-5 text-xs font-medium text-gray-400">
                  {stat.label}
                </p>

                <h3 className="mt-1 text-2xl font-bold text-gray-800">
                  {stat.value}
                </h3>
              </div>
            );
          })}
        </div>
      </section>

      <section className="rounded-2xl border border-gray-100 bg-white p-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="font-bold text-gray-800">
              Aktivitas Terbaru
            </h2>
            <p className="mt-1 text-xs text-gray-400">
              Ringkasan aktivitas terbaru Anda
            </p>
          </div>

          <MoreHorizontal className="text-gray-400" />
        </div>

        <div className="mt-8 flex min-h-32 flex-col items-center justify-center text-center">
          <div className="rounded-full bg-gray-50 p-4">
            <FileText size={25} className="text-gray-400" />
          </div>
          <p className="mt-3 text-sm font-medium text-gray-600">
            Belum ada aktivitas
          </p>
          <p className="mt-1 text-xs text-gray-400">
            Aktivitas terbaru akan ditampilkan di sini.
          </p>
        </div>
      </section>
    </div>
  );
}
