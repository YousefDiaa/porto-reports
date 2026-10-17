"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { signOut } from "next-auth/react";
import ThemeToggle from "@/components/ThemeToggle";
import {
  LayoutDashboard,
  FileText,
  PlusCircle,
  Tags,
  Download,
  LogOut,
  ExternalLink,
} from "lucide-react";
import { cn } from "@/lib/utils";

const NAV_ITEMS = [
  { href: "/admin/dashboard", icon: LayoutDashboard, label: "لوحة التحكم" },
  { href: "/admin/dashboard/reports/new", icon: PlusCircle, label: "إنشاء تقرير جديد" },
  { href: "/admin/dashboard/reports", icon: FileText, label: "إدارة التقارير" },
  { href: "/admin/dashboard/specializations", icon: Tags, label: "إدارة التخصصات" },
  { href: "/admin/dashboard/export", icon: Download, label: "تصدير مجمع" },
];

export function AdminSidebar() {
  const pathname = usePathname();

  return (
    <aside className="w-64 bg-slate-900 dark:bg-[#070B14] border-l border-slate-800 dark:border-[#1A2338] min-h-screen flex flex-col shadow-xl transition-colors duration-300">
      {/* Logo Header */}
      <div className="p-6 border-b border-slate-800 dark:border-[#1A2338]">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-white dark:bg-slate-800 p-1 border-2 border-porto-cyan flex items-center justify-center overflow-hidden shadow-sm">
            <Image
              src="/porto-logo.png"
              alt="Porto Logo"
              width={48}
              height={48}
              className="w-full h-full object-contain"
            />
          </div>
          <div>
            <h2 className="text-white font-black text-sm">لوحة الأدمن</h2>
            <p className="text-porto-yellow text-xs font-bold">بورتو الرياضي</p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-1.5">
        {NAV_ITEMS.map((item) => {
          const isActive =
            item.href === "/admin/dashboard"
              ? pathname === "/admin/dashboard"
              : pathname.startsWith(item.href);

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 text-sm font-bold",
                isActive
                  ? "bg-gradient-to-r from-porto-pink to-porto-pink-dark text-white shadow-porto"
                  : "text-slate-300 hover:text-white hover:bg-white/10 dark:hover:bg-slate-800/60"
              )}
            >
              <item.icon className="w-4 h-4 text-porto-cyan" />
              {item.label}
            </Link>
          );
        })}
      </nav>

      {/* Bottom actions & Theme toggle */}
      <div className="p-4 border-t border-slate-800 dark:border-[#1A2338] space-y-2">
        <div className="flex items-center justify-between px-2 py-1">
          <span className="text-xs text-slate-400 font-bold">المظهر:</span>
          <ThemeToggle />
        </div>

        <Link
          href="/"
          target="_blank"
          className="flex items-center gap-3 px-4 py-2.5 rounded-xl text-slate-300 hover:text-white hover:bg-white/10 transition-all text-sm font-medium"
        >
          <ExternalLink className="w-4 h-4 text-porto-cyan" />
          عرض الموقع
        </Link>
        <button
          onClick={() => signOut({ callbackUrl: "/admin/login" })}
          className="w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-red-400 hover:text-red-300 hover:bg-red-500/10 transition-all text-sm font-bold"
        >
          <LogOut className="w-4 h-4" />
          تسجيل الخروج
        </button>
      </div>
    </aside>
  );
}
