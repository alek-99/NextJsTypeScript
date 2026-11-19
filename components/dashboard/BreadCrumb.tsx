
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ChevronRight, Home } from "lucide-react";

export default function Breadcrumb() {
  const pathname = usePathname();

  const segments = pathname.split("/").filter(Boolean);

  const labels: Record<string, string> = {
    dashboard: "Dashboard",
    admin: "Administrator",
    user: "User",
    santri: "Kelola Pengguna",
    laporan: "Data Laporan",
    analitik: "Analitik",
    pengaturan: "Pengaturan",
    bantuan: "Bantuan",
    proyek: "Proyek Saya",
    dokumen: "Dokumen",
  };

  return (
    <div className="flex flex-wrap items-center gap-2 text-xs text-gray-500">
      <Link
        href="/dashboard"
        className="flex items-center gap-1 hover:text-[#3C8DBC]"
      >
        <Home size={14} />
        Home
      </Link>

      {segments.map((segment, index) => {
        const href = "/" + segments.slice(0, index + 1).join("/");
        const active = index === segments.length - 1;
        const label =
          labels[segment] ||
          segment.charAt(0).toUpperCase() + segment.slice(1);

        return (
          <div key={href} className="flex items-center gap-2">
            <ChevronRight size={13} className="text-gray-300" />

            {active ? (
              <span className="font-semibold text-gray-700">
                {label}
              </span>
            ) : (
              <Link href={href} className="hover:text-[#3C8DBC]">
                {label}
              </Link>
            )}
          </div>
        );
      })}
    </div>
  );
}
