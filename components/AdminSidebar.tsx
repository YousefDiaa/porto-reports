"use client";

import { useState, useEffect } from "react";
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
  Menu,
  X,
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
  const [isOpen, setIsOpen] = useState(false);

  // Close mobile drawer on route navigation
  useEffect(() => {
    setIsOpen(false);
  }, [pathname]);

  // Lock body scroll when mobile drawer is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  const navContent = (
    <>
      {/* Logo Header */}
      <div className="p-5 sm:p-6 border-b border-slate-800 dark:border-[#1A2338] flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 sm:w-12 sm:h-12 rounded-xl bg-white dark:bg-slate-800 p-1 border-2 border-porto-cyan flex items-center justify-center overflow-hidden shadow-sm shrink-0">
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
            <p className="text-porto-yellow text-xs font-bold">نادي بورتو الرياضي</p>
          </div>
        </div>

        {/* Close button for mobile */}
        <button
          onClick={() => setIsOpen(false)}
          className="lg:hidden p-2 text-slate-400 hover:text-white rounded-xl hover:bg-slate-800 transition-colors"
          aria-label="إغلاق القائمة"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Navigation Links */}
      <nav className="flex-1 p-4 space-y-1.5 overflow-y-auto">
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
              <item.icon className="w-4 h-4 text-porto-cyan shrink-0" />
              <span>{item.label}</span>
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
          <ExternalLink className="w-4 h-4 text-porto-cyan shrink-0" />
          <span>عرض الموقع</span>
        </Link>

        <button
          onClick={() => signOut({ callbackUrl: "/admin/login" })}
          className="w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-red-400 hover:text-red-300 hover:bg-red-500/10 transition-all text-sm font-bold"
        >
          <LogOut className="w-4 h-4 shrink-0" />
          <span>تسجيل الخروج</span>
        </button>
      </div>
    </>
  );

  return (
    <>
      {/* 1. Mobile Top Navigation Bar */}
      <div className="lg:hidden sticky top-0 z-30 bg-slate-900 dark:bg-[#070B14] border-b border-slate-800 dark:border-[#1A2338] px-4 py-3 flex items-center justify-between shadow-md transition-colors duration-300">
        <div className="flex items-center gap-3">
          <button
            onClick={() => setIsOpen(true)}
            className="p-2 text-slate-300 hover:text-white rounded-xl hover:bg-slate-800 transition-colors"
            aria-label="فتح القائمة"
          >
            <Menu className="w-6 h-6 text-porto-cyan" />
          </button>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-white dark:bg-slate-800 p-0.5 border border-porto-cyan flex items-center justify-center overflow-hidden">
              <Image
                src="/porto-logo.png"
                alt="Porto Logo"
                width={32}
                height={32}
                className="w-full h-full object-contain"
              />
            </div>
            <span className="text-white font-black text-sm">لوحة الأدمن</span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <ThemeToggle />
        </div>
      </div>

      {/* 2. Mobile Drawer & Backdrop */}
      {isOpen && (
        <div className="fixed inset-0 z-50 lg:hidden flex">
          {/* Backdrop */}
          <div
            onClick={() => setIsOpen(false)}
            className="fixed inset-0 bg-black/70 backdrop-blur-sm animate-fade-in transition-opacity"
            aria-hidden="true"
          />

          {/* Drawer slide-in panel from right (RTL) */}
          <aside className="relative z-10 w-72 max-w-[80vw] bg-slate-900 dark:bg-[#070B14] border-l border-slate-800 dark:border-[#1A2338] h-full flex flex-col shadow-2xl animate-slide-up">
            {navContent}
          </aside>
        </div>
      )}

      {/* 3. Desktop Static Sidebar */}
      <aside className="hidden lg:flex w-64 bg-slate-900 dark:bg-[#070B14] border-l border-slate-800 dark:border-[#1A2338] min-h-screen flex-col shadow-xl transition-colors duration-300 shrink-0">
        {navContent}
      </aside>
    </>
  );
}
