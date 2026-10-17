"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { Report, Specialization } from "@/lib/supabase";
import { getDateRange } from "@/lib/utils";
import { Download, FileText, Filter, Calendar, Tags, ChevronDown } from "lucide-react";

const PERIODS = [
  { value: "monthly", label: "شهري" },
  { value: "quarterly", label: "ربع سنوي" },
  { value: "semi-annual", label: "نصف سنوي" },
  { value: "annual", label: "سنوي" },
];

const MONTHS = ["يناير", "فبراير", "مارس", "أبريل", "مايو", "يونيو", "يوليو", "أغسطس", "سبتمبر", "أكتوبر", "نوفمبر", "ديسمبر"];
const QUARTERS = ["الربع الأول (يناير - مارس)", "الربع الثاني (أبريل - يونيو)", "الربع الثالث (يوليو - سبتمبر)", "الربع الرابع (أكتوبر - ديسمبر)"];
const HALF_YEARS = ["النصف الأول (يناير - يونيو)", "النصف الثاني (يوليو - ديسمبر)"];
const currentYear = new Date().getFullYear();
const YEARS = Array.from({ length: 5 }, (_, i) => currentYear - i);

export default function ExportPage() {
  const [specializations, setSpecializations] = useState<Specialization[]>([]);
  const [specId, setSpecId] = useState("");
  const [period, setPeriod] = useState("monthly");
  const [year, setYear] = useState(currentYear.toString());
  const [month, setMonth] = useState("1");
  const [quarter, setQuarter] = useState("1");
  const [half, setHalf] = useState("1");
  const [foundReports, setFoundReports] = useState<Report[]>([]);
  const [searched, setSearched] = useState(false);
  const [searching, setSearching] = useState(false);
  const [exportingPdf, setExportingPdf] = useState(false);
  const [exportingWord, setExportingWord] = useState(false);

  useEffect(() => {
    supabase.from("specializations").select("*").order("name").then(({ data }) => {
      setSpecializations(data || []);
    });
  }, []);

  const buildPeriodLabel = () => {
    const y = year;
    if (period === "monthly") return `${MONTHS[parseInt(month) - 1]} ${y}`;
    if (period === "quarterly") return `${QUARTERS[parseInt(quarter) - 1]} ${y}`;
    if (period === "semi-annual") return `${HALF_YEARS[parseInt(half) - 1]} ${y}`;
    if (period === "annual") return `سنوي ${y}`;
    return "";
  };

  const handleSearch = async () => {
    setSearching(true);
    setSearched(false);

    let dateRange;
    const y = parseInt(year);
    if (period === "monthly") dateRange = getDateRange("monthly", y, parseInt(month));
    else if (period === "quarterly") dateRange = getDateRange("quarterly", y, undefined, parseInt(quarter));
    else if (period === "semi-annual") dateRange = getDateRange("semi-annual", y, parseInt(half) <= 1 ? 1 : 7);
    else dateRange = getDateRange("annual", y);

    let query = supabase
      .from("reports")
      .select("*, specializations(*)")
      .eq("is_published", true)
      .gte("report_date", dateRange!.start)
      .lte("report_date", dateRange!.end)
      .order("report_date", { ascending: true });

    if (specId) query = query.eq("specialization_id", specId);

    const { data } = await query;
    setFoundReports((data as Report[]) || []);
    setSearched(true);
    setSearching(false);
  };

  const handleExportPDF = async () => {
    if (foundReports.length === 0) return;
    setExportingPdf(true);
    try {
      const { exportReportToPDF } = await import("@/lib/export-pdf");
      const spec = specId ? specializations.find((s) => s.id === specId) : null;
      await exportReportToPDF(foundReports, spec, buildPeriodLabel());
    } catch (error) {
      console.error(error);
      alert("حدث خطأ أثناء التصدير");
    } finally {
      setExportingPdf(false);
    }
  };

  const handleExportWord = async () => {
    if (foundReports.length === 0) return;
    setExportingWord(true);
    try {
      const { exportReportToWord } = await import("@/lib/export-word");
      const spec = specId ? specializations.find((s) => s.id === specId) : null;
      await exportReportToWord(foundReports, spec, buildPeriodLabel());
    } catch (error) {
      console.error(error);
      alert("حدث خطأ أثناء التصدير");
    } finally {
      setExportingWord(false);
    }
  };

  return (
    <div className="p-8 max-w-5xl">
      <div className="mb-6">
        <h1 className="text-2xl font-black text-slate-900 dark:text-white flex items-center gap-3">
          <Download className="w-7 h-7 text-porto-pink" />
          تصدير مجمع للتقارير
        </h1>
        <p className="text-slate-600 dark:text-slate-400 mt-1">
          صدّر مجموعة تقارير في ملف PDF أو Word واحد حسب الفترة الزمنية والتخصص
        </p>
      </div>

      {/* Filter */}
      <div className="bg-white dark:bg-[#151D2F] rounded-xl shadow-porto border border-slate-200 dark:border-[#222F49] p-6 mb-6">
        <h2 className="font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
          <Filter className="w-5 h-5 text-porto-cyan" />
          حدد الفلتر
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-4">
          {/* Specialization */}
          <div>
            <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1.5 flex items-center gap-1.5">
              <Tags className="w-4 h-4 text-porto-pink" />
              التخصص
            </label>
            <div className="relative">
              <select
                value={specId}
                onChange={(e) => setSpecId(e.target.value)}
                className="w-full border border-slate-200 dark:border-[#222F49] rounded-lg px-4 py-2.5 bg-white dark:bg-[#0B0F19] text-slate-900 dark:text-white appearance-none focus:outline-none focus:ring-2 focus:ring-porto-pink text-sm"
              >
                <option value="">جميع التخصصات</option>
                {specializations.map((s) => (
                  <option key={s.id} value={s.id}>{s.name}</option>
                ))}
              </select>
              <ChevronDown className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 dark:text-slate-500 pointer-events-none" />
            </div>
          </div>

          {/* Period */}
          <div>
            <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1.5 flex items-center gap-1.5">
              <Calendar className="w-4 h-4 text-porto-cyan" />
              الفترة الزمنية
            </label>
            <div className="relative">
              <select
                value={period}
                onChange={(e) => setPeriod(e.target.value)}
                className="w-full border border-slate-200 dark:border-[#222F49] rounded-lg px-4 py-2.5 bg-white dark:bg-[#0B0F19] text-slate-900 dark:text-white appearance-none focus:outline-none focus:ring-2 focus:ring-porto-pink text-sm"
              >
                {PERIODS.map((p) => (
                  <option key={p.value} value={p.value}>{p.label}</option>
                ))}
              </select>
              <ChevronDown className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 dark:text-slate-500 pointer-events-none" />
            </div>
          </div>

          {/* Year */}
          <div>
            <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1.5">السنة</label>
            <div className="relative">
              <select
                value={year}
                onChange={(e) => setYear(e.target.value)}
                className="w-full border border-slate-200 dark:border-[#222F49] rounded-lg px-4 py-2.5 bg-white dark:bg-[#0B0F19] text-slate-900 dark:text-white appearance-none focus:outline-none focus:ring-2 focus:ring-porto-pink text-sm"
              >
                {YEARS.map((y) => <option key={y} value={y}>{y}</option>)}
              </select>
              <ChevronDown className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 dark:text-slate-500 pointer-events-none" />
            </div>
          </div>

          {/* Month */}
          {period === "monthly" && (
            <div>
              <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1.5">الشهر</label>
              <div className="relative">
                <select
                  value={month}
                  onChange={(e) => setMonth(e.target.value)}
                  className="w-full border border-slate-200 dark:border-[#222F49] rounded-lg px-4 py-2.5 bg-white dark:bg-[#0B0F19] text-slate-900 dark:text-white appearance-none focus:outline-none focus:ring-2 focus:ring-porto-pink text-sm"
                >
                  {MONTHS.map((m, i) => <option key={i + 1} value={i + 1}>{m}</option>)}
                </select>
                <ChevronDown className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 dark:text-slate-500 pointer-events-none" />
              </div>
            </div>
          )}

          {/* Quarter */}
          {period === "quarterly" && (
            <div>
              <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1.5">الربع</label>
              <div className="relative">
                <select
                  value={quarter}
                  onChange={(e) => setQuarter(e.target.value)}
                  className="w-full border border-slate-200 dark:border-[#222F49] rounded-lg px-4 py-2.5 bg-white dark:bg-[#0B0F19] text-slate-900 dark:text-white appearance-none focus:outline-none focus:ring-2 focus:ring-porto-pink text-sm"
                >
                  {QUARTERS.map((q, i) => <option key={i + 1} value={i + 1}>{q}</option>)}
                </select>
                <ChevronDown className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 dark:text-slate-500 pointer-events-none" />
              </div>
            </div>
          )}

          {/* Half year */}
          {period === "semi-annual" && (
            <div>
              <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1.5">النصف</label>
              <div className="relative">
                <select
                  value={half}
                  onChange={(e) => setHalf(e.target.value)}
                  className="w-full border border-slate-200 dark:border-[#222F49] rounded-lg px-4 py-2.5 bg-white dark:bg-[#0B0F19] text-slate-900 dark:text-white appearance-none focus:outline-none focus:ring-2 focus:ring-porto-pink text-sm"
                >
                  {HALF_YEARS.map((h, i) => <option key={i + 1} value={i + 1}>{h}</option>)}
                </select>
                <ChevronDown className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 dark:text-slate-500 pointer-events-none" />
              </div>
            </div>
          )}
        </div>

        <button
          onClick={handleSearch}
          disabled={searching}
          className="flex items-center gap-2 bg-gradient-to-r from-porto-pink to-[#c40068] hover:opacity-95 text-white font-bold px-5 py-2.5 rounded-lg transition-all shadow-md hover:shadow-lg disabled:opacity-60 cursor-pointer"
        >
          {searching ? (
            <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
          ) : (
            <Filter className="w-4 h-4" />
          )}
          بحث عن التقارير
        </button>
      </div>

      {/* Results */}
      {searched && (
        <div className="bg-white dark:bg-[#151D2F] rounded-xl shadow-porto border border-slate-200 dark:border-[#222F49] p-6 animate-fade-in">
          {foundReports.length === 0 ? (
            <div className="text-center py-8">
              <FileText className="w-12 h-12 text-slate-300 dark:text-slate-600 mx-auto mb-3" />
              <h3 className="font-bold text-slate-900 dark:text-white mb-1">لا توجد تقارير</h3>
              <p className="text-slate-500 dark:text-slate-400 text-sm">لا توجد تقارير منشورة للفترة المحددة.</p>
            </div>
          ) : (
            <>
              <div className="flex items-center justify-between mb-4 flex-wrap gap-4">
                <div>
                  <h2 className="font-bold text-slate-900 dark:text-white text-lg">
                    {foundReports.length} تقرير — {buildPeriodLabel()}
                  </h2>
                  {specId && (
                    <p className="text-sm text-slate-500 dark:text-slate-400">
                      تخصص: {specializations.find((s) => s.id === specId)?.name}
                    </p>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={handleExportPDF}
                    disabled={exportingPdf}
                    className="flex items-center gap-1.5 bg-gradient-to-r from-red-600 to-rose-700 hover:opacity-95 text-white font-bold text-sm px-4 py-2.5 rounded-lg transition-all shadow-sm hover:shadow-md disabled:opacity-60 cursor-pointer"
                  >
                    <Download className="w-4 h-4" />
                    {exportingPdf ? "جارٍ..." : "تصدير PDF"}
                  </button>
                  <button
                    onClick={handleExportWord}
                    disabled={exportingWord}
                    className="flex items-center gap-1.5 bg-gradient-to-r from-porto-cyan to-[#0084B4] hover:opacity-95 text-white font-bold text-sm px-4 py-2.5 rounded-lg transition-all shadow-sm hover:shadow-md disabled:opacity-60 cursor-pointer"
                  >
                    <FileText className="w-4 h-4" />
                    {exportingWord ? "جارٍ..." : "تصدير Word"}
                  </button>
                </div>
              </div>

              <div className="divide-y divide-slate-100 dark:divide-[#222F49] border border-slate-200 dark:border-[#222F49] rounded-lg overflow-hidden">
                {foundReports.map((r) => (
                  <div key={r.id} className="px-4 py-3 flex items-center justify-between hover:bg-slate-50 dark:hover:bg-[#0B0F19]/60 transition-colors">
                    <div>
                      <span className="font-semibold text-slate-800 dark:text-slate-200 text-sm">{r.title}</span>
                      <span className="text-slate-500 dark:text-slate-400 text-xs mr-3">
                        {new Date(r.report_date).toLocaleDateString("ar-EG", { day: "numeric", month: "long" })}
                      </span>
                    </div>
                    <FileText className="w-4 h-4 text-slate-400 dark:text-slate-500" />
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
}
