
import { LucideIcon, ArrowUpRight } from "lucide-react";

interface StatCardProps {
  title: string;
  value: string | number;
  description: string;
  icon: LucideIcon;
  color: string;
  background: string;
}

export default function StatCard({
  title,
  value,
  description,
  icon: Icon,
  color,
  background,
}: StatCardProps) {
  return (
    <div className="group overflow-hidden rounded-md bg-white shadow-sm ring-1 ring-gray-200/70 transition hover:-translate-y-1 hover:shadow-md">
      <div className="flex items-center justify-between p-5">
        <div>
          <p className="text-xs font-medium text-gray-500">
            {title}
          </p>

          <h3 className="mt-2 text-3xl font-bold tracking-tight text-gray-800">
            {value}
          </h3>

          <p className="mt-2 text-[11px] text-gray-400">
            {description}
          </p>
        </div>

        <div
          className="flex h-14 w-14 items-center justify-center rounded-md"
          style={{
            backgroundColor: background,
            color,
          }}
        >
          <Icon size={27} strokeWidth={1.7} />
        </div>
      </div>

      <div
        className="flex items-center justify-between px-5 py-2.5 text-xs"
        style={{
          backgroundColor: background,
          color,
        }}
      >
        <span>Lihat detail</span>
        <ArrowUpRight size={15} />
      </div>
    </div>
  );
}
