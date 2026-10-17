"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Specialization } from "@/lib/supabase";
import { Search, Filter, X, ChevronDown } from "lucide-react";

interface ReportFilterProps {
  specializations: Specialization[];
}

const PERIODS = [
  { value: "", label: "كل الفترات" },
  { value: "monthly", label: "شهري" },
  { value: "quarterly", label: "ربع سنوي" },
  { value: "semi-annual", label: "نصف سنوي" },
  { value: "annual", label: "سنوي" },
];

const MONTHS = [
  { value: 1, label: "يناير" },
  { value: 2, label: "فبراير" },
  { value: 3, label: "مارس" },
  { value: 4, label: "أبريل" },
  { value: 5, label: "مايو" },
  { value: 6, label: "يونيو" },
  { value: 7, label: "يوليو" },
  { value: 8, label: "أغسطس" },
  { value: 9, label: "سبتمبر" },
  { value: 10, label: "أكتوبر" },
  { value: 11, label: "نوفمبر" },
  { value: 12, label: "ديسمبر" },
];

const QUARTERS = [
  { value: 1, label: "الربع الأول (يناير - مارس)" },
  { value: 2, label: "الربع الثاني (أبريل - يونيو)" },
  { value: 3, label: "الربع الثالث (يوليو - سبتمبر)" },
  { value: 4, label: "الربع الرابع (أكتوبر - ديسمبر)" },
];

const HALF_YEARS = [
  { value: 1, label: "النصف الأول (يناير - يونيو)" },
  { value: 2, label: "النصف الثاني (يوليو - ديسمبر)" },
];

const currentYear = new Date().getFullYear();
const YEARS = Array.from({ length: 5 }, (_, i) => currentYear - i);

export default function ReportFilter({ specializations }: ReportFilterProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [specId, setSpecId] = useState(searchParams.get("spec") || "");
  const [period, setPeriod] = useState(searchParams.get("period") || "");
  const [year, setYear] = useState(searchParams.get("year") || currentYear.toString());
  const [month, setMonth] = useState(searchParams.get("month") || "1");
  const [quarter, setQuarter] = useState(searchParams.get("quarter") || "1");
  const [half, setHalf] = useState(searchParams.get("half") || "1");

  const applyFilter = () => {
    const params = new URLSearchParams();
    if (specId) params.set("spec", specId);
    if (period) {
      params.set("period", period);
      params.set("year", year);
      if (period === "monthly") params.set("month", month);
      if (period === "quarterly") params.set("quarter", quarter);
      if (period === "semi-annual") params.set("half", half);
    }
    router.push(`/?${params.toString()}`);
  };

  const clearFilter = () => {
    setSpecId("");
    setPeriod("");
    setYear(currentYear.toString());
    setMonth("1");
    setQuarter("1");
    setHalf("1");
    router.push("/");
  };

  const hasActiveFilters = specId || period;

  return (
    <div className="bg-white dark:bg-[#151D2F] rounded-2xl shadow-sm border border-slate-200 dark:border-[#222F49] p-4 sm:p-6 mb-6 sm:mb-8 transition-colors duration-300">
      <div className="flex items-center gap-2 mb-4 sm:mb-5 flex-wrap">
        <div className="w-8 h-8 rounded-lg bg-porto-pink/10 dark:bg-porto-pink/20 flex items-center justify-center shrink-0">
          <Filter className="w-4 h-4 text-porto-pink dark:text-porto-cyan" />
        </div>
        <h2 className="font-black text-slate-900 dark:text-white text-base sm:text-lg">تصفية وبحث في التقارير</h2>
        {hasActiveFilters && (
          <button
            onClick={clearFilter}
            className="mr-auto flex items-center gap-1 text-xs text-red-500 hover:text-red-700 dark:hover:text-red-400 font-bold transition-colors bg-red-50 dark:bg-red-950/40 px-3 py-1.5 rounded-lg border border-red-200 dark:border-red-900"
          >
            <X className="w-3.5 h-3.5" />
            مسح الفلتر
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {/* Specialization Filter */}
        <div>
          <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-1.5">
            التخصص
          </label>
          <div className="relative">
            <select
              value={specId}
              onChange={(e) => setSpecId(e.target.value)}
              className="w-full border border-slate-300 dark:border-slate-700 rounded-xl px-4 py-2.5 text-slate-800 dark:text-slate-100 bg-slate-50 dark:bg-[#1C263D] appearance-none focus:outline-none focus:ring-2 focus:ring-porto-pink dark:focus:ring-porto-cyan text-sm transition-all"
            >
              <option value="">جميع التخصصات</option>
              {specializations.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name}
                </option>
              ))}
            </select>
            <ChevronDown className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
          </div>
        </div>

        {/* Period Filter */}
        <div>
          <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-1.5">
            الفترة الزمنية
          </label>
          <div className="relative">
            <select
              value={period}
              onChange={(e) => setPeriod(e.target.value)}
              className="w-full border border-slate-300 dark:border-slate-700 rounded-xl px-4 py-2.5 text-slate-800 dark:text-slate-100 bg-slate-50 dark:bg-[#1C263D] appearance-none focus:outline-none focus:ring-2 focus:ring-porto-pink dark:focus:ring-porto-cyan text-sm transition-all"
            >
              {PERIODS.map((p) => (
                <option key={p.value} value={p.value}>
                  {p.label}
                </option>
              ))}
            </select>
            <ChevronDown className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
          </div>
        </div>

        {/* Year */}
        {period && (
          <div>
            <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-1.5">
              السنة
            </label>
            <div className="relative">
              <select
                value={year}
                onChange={(e) => setYear(e.target.value)}
                className="w-full border border-slate-300 dark:border-slate-700 rounded-xl px-4 py-2.5 text-slate-800 dark:text-slate-100 bg-slate-50 dark:bg-[#1C263D] appearance-none focus:outline-none focus:ring-2 focus:ring-porto-pink dark:focus:ring-porto-cyan text-sm transition-all"
              >
                {YEARS.map((y) => (
                  <option key={y} value={y}>
                    {y}
                  </option>
                ))}
              </select>
              <ChevronDown className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
            </div>
          </div>
        )}

        {/* Month (for monthly) */}
        {period === "monthly" && (
          <div>
            <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-1.5">
              الشهر
            </label>
            <div className="relative">
              <select
                value={month}
                onChange={(e) => setMonth(e.target.value)}
                className="w-full border border-slate-300 dark:border-slate-700 rounded-xl px-4 py-2.5 text-slate-800 dark:text-slate-100 bg-slate-50 dark:bg-[#1C263D] appearance-none focus:outline-none focus:ring-2 focus:ring-porto-pink dark:focus:ring-porto-cyan text-sm transition-all"
              >
                {MONTHS.map((m) => (
                  <option key={m.value} value={m.value}>
                    {m.label}
                  </option>
                ))}
              </select>
              <ChevronDown className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
            </div>
          </div>
        )}

        {/* Quarter */}
        {period === "quarterly" && (
          <div>
            <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-1.5">
              الربع
            </label>
            <div className="relative">
              <select
                value={quarter}
                onChange={(e) => setQuarter(e.target.value)}
                className="w-full border border-slate-300 dark:border-slate-700 rounded-xl px-4 py-2.5 text-slate-800 dark:text-slate-100 bg-slate-50 dark:bg-[#1C263D] appearance-none focus:outline-none focus:ring-2 focus:ring-porto-pink dark:focus:ring-porto-cyan text-sm transition-all"
              >
                {QUARTERS.map((q) => (
                  <option key={q.value} value={q.value}>
                    {q.label}
                  </option>
                ))}
              </select>
              <ChevronDown className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
            </div>
          </div>
        )}

        {/* Half year */}
        {period === "semi-annual" && (
          <div>
            <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-1.5">
              النصف
            </label>
            <div className="relative">
              <select
                value={half}
                onChange={(e) => setHalf(e.target.value)}
                className="w-full border border-slate-300 dark:border-slate-700 rounded-xl px-4 py-2.5 text-slate-800 dark:text-slate-100 bg-slate-50 dark:bg-[#1C263D] appearance-none focus:outline-none focus:ring-2 focus:ring-porto-pink dark:focus:ring-porto-cyan text-sm transition-all"
              >
                {HALF_YEARS.map((h) => (
                  <option key={h.value} value={h.value}>
                    {h.label}
                  </option>
                ))}
              </select>
              <ChevronDown className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
            </div>
          </div>
        )}
      </div>

      <div className="flex justify-end mt-5 pt-4 border-t border-slate-100 dark:border-slate-800">
        <button
          onClick={applyFilter}
          className="flex items-center justify-center gap-2 bg-gradient-to-r from-porto-pink to-porto-pink-dark hover:from-porto-pink-light hover:to-porto-pink text-white font-black px-6 py-2.5 rounded-xl transition-all shadow-porto hover:scale-105 active:scale-95 w-full sm:w-auto"
        >
          <Search className="w-4 h-4" />
          تطبيق الفلتر
        </button>
      </div>
    </div>
  );
}
