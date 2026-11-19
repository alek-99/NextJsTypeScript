
import {
  Users,
  UserCheck,
  ShieldCheck,
  Activity,
  ArrowUpRight,
  Clock3,
  TrendingUp,
} from "lucide-react";

const stats = [
  {
    title: "Total Pengguna",
    value: "1.284",
    change: "+12,5%",
    icon: Users,
    color: "bg-blue-100 text-blue-600",
  },
  {
    title: "Pengguna Aktif",
    value: "1.156",
    change: "+8,2%",
    icon: UserCheck,
    color: "bg-emerald-100 text-emerald-600",
  },
  {
    title: "Administrator",
    value: "08",
    change: "Akun admin",
    icon: ShieldCheck,
    color: "bg-violet-100 text-violet-600",
  },
  {
    title: "Aktivitas Hari Ini",
    value: "246",
    change: "+18,4%",
    icon: Activity,
    color: "bg-orange-100 text-orange-600",
  },
];

export default function AdminDashboard() {
  return (
    <div className="space-y-7">

      {/* WELCOME */}
      <section className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-[#1745A5] to-[#2563EB] p-6 text-white sm:p-8">
        <div className="relative z-10 max-w-xl">
          <span className="rounded-full bg-white/15 px-3 py-1 text-[10px] font-semibold uppercase tracking-widest">
            Administrator Panel
          </span>

          <h1 className="mt-4 text-2xl font-bold sm:text-3xl">
            Selamat Datang, Admin!
          </h1>

          <p className="mt-2 text-sm leading-relaxed text-blue-100">
            Kelola sistem, pantau aktivitas pengguna, dan kontrol
            seluruh data melalui satu dashboard terintegrasi.
          </p>
        </div>

        <div className="absolute -right-10 -top-20 h-64 w-64 rounded-full border-[35px] border-white/10" />
        <div className="absolute -bottom-28 right-36 h-64 w-64 rounded-full border-[35px] border-white/5" />
      </section>

      {/* STATISTICS */}
      <section>
        <div className="mb-4 flex items-center justify-between">
          <div>
            <h2 className="font-bold text-slate-800">
              Statistik Sistem
            </h2>
            <p className="mt-1 text-xs text-slate-400">
              Ringkasan informasi sistem Anda
            </p>
          </div>

          <span className="flex items-center gap-1 text-xs text-emerald-600">
            <TrendingUp size={14} />
            Overview
          </span>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {stats.map((stat) => {
            const Icon = stat.icon;

            return (
              <div
                key={stat.title}
                className="rounded-2xl border border-slate-200/80 bg-white p-5 transition hover:-translate-y-1 hover:shadow-lg hover:shadow-slate-200/50"
              >
                <div className="flex items-center justify-between">
                  <div className={`rounded-xl p-3 ${stat.color}`}>
                    <Icon size={21} />
                  </div>

                  <ArrowUpRight
                    size={18}
                    className="text-slate-300"
                  />
                </div>

                <p className="mt-5 text-xs font-medium text-slate-400">
                  {stat.title}
                </p>

                <h3 className="mt-1 text-2xl font-bold text-slate-800">
                  {stat.value}
                </h3>

                <p className="mt-2 text-[11px] text-emerald-600">
                  {stat.change}
                </p>
              </div>
            );
          })}
        </div>
      </section>

      {/* MAIN CONTENT */}
      <section className="grid grid-cols-1 gap-5 xl:grid-cols-3">

        {/* ACTIVITY */}
        <div className="rounded-2xl border border-slate-200/80 bg-white p-6 xl:col-span-2">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="font-bold text-slate-800">
                Aktivitas Sistem
              </h2>
              <p className="mt-1 text-xs text-slate-400">
                Informasi aktivitas terbaru
              </p>
            </div>

            <Activity className="text-blue-600" size={21} />
          </div>

          <div className="mt-7 space-y-5">
            {[
              {
                title: "Sistem berjalan normal",
                detail: "Seluruh layanan tersedia",
                time: "Baru saja",
                color: "bg-emerald-500",
              },
              {
                title: "Panel administrator",
                detail: "Dashboard admin berhasil dibuka",
                time: "Hari ini",
                color: "bg-blue-500",
              },
              {
                title: "Autentikasi Firebase",
                detail: "Layanan autentikasi terhubung",
                time: "Hari ini",
                color: "bg-violet-500",
              },
            ].map((item) => (
              <div key={item.title} className="flex gap-3">
                <div
                  className={`mt-1 h-2.5 w-2.5 shrink-0 rounded-full ${item.color}`}
                />

                <div className="flex-1">
                  <p className="text-sm font-semibold text-slate-700">
                    {item.title}
                  </p>
                  <p className="mt-1 text-xs text-slate-400">
                    {item.detail}
                  </p>
                </div>

                <span className="whitespace-nowrap text-[10px] text-slate-400">
                  {item.time}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* SYSTEM INFORMATION */}
        <div className="rounded-2xl border border-slate-200/80 bg-white p-6">
          <div className="flex items-center gap-2">
            <Clock3 className="text-blue-600" size={20} />
            <h2 className="font-bold text-slate-800">
              Informasi Sistem
            </h2>
          </div>

          <div className="mt-6 space-y-5">
            <div>
              <p className="text-xs text-slate-400">Status Sistem</p>
              <p className="mt-1 flex items-center gap-2 text-sm font-semibold text-emerald-600">
                <span className="h-2 w-2 rounded-full bg-emerald-500" />
                Operational
              </p>
            </div>

            <div>
              <p className="text-xs text-slate-400">Platform</p>
              <p className="mt-1 text-sm font-semibold text-slate-700">
                Next.js + Firebase
              </p>
            </div>

            <div>
              <p className="text-xs text-slate-400">Versi Aplikasi</p>
              <p className="mt-1 text-sm font-semibold text-slate-700">
                1.0.0
              </p>
            </div>

            <div>
              <p className="text-xs text-slate-400">Hak Akses</p>
              <p className="mt-1 text-sm font-semibold text-blue-600">
                Administrator
              </p>
            </div>
          </div>
        </div>
      </section>

    </div>
  );
}
