import { Suspense } from "react";
import { supabase } from "@/lib/supabase";
import Header from "@/components/Header";
import ReportCard from "@/components/ReportCard";
import ReportFilter from "@/components/ReportFilter";
import { getDateRange } from "@/lib/utils";
import { Report, Specialization } from "@/lib/supabase";
import { FileText, BookOpen } from "lucide-react";

export const dynamic = "force-dynamic";

async function getReports(searchParams: Record<string, string>): Promise<Report[]> {
  let query = supabase
    .from("reports")
    .select("*, specializations(*)")
    .eq("is_published", true)
    .order("report_date", { ascending: false });

  // Filter by specialization
  if (searchParams.spec) {
    query = query.eq("specialization_id", searchParams.spec);
  }

  // Filter by date range
  if (searchParams.period) {
    const year = parseInt(searchParams.year || new Date().getFullYear().toString());
    let dateRange;

    if (searchParams.period === "monthly") {
      dateRange = getDateRange("monthly", year, parseInt(searchParams.month || "1"));
    } else if (searchParams.period === "quarterly") {
      dateRange = getDateRange("quarterly", year, undefined, parseInt(searchParams.quarter || "1"));
    } else if (searchParams.period === "semi-annual") {
      dateRange = getDateRange("semi-annual", year, parseInt(searchParams.half || "1") <= 1 ? 1 : 7);
    } else if (searchParams.period === "annual") {
      dateRange = getDateRange("annual", year);
    }

    if (dateRange) {
      query = query.gte("report_date", dateRange.start).lte("report_date", dateRange.end);
    }
  }

  const { data, error } = await query;
  if (error) {
    console.error("Error fetching reports:", error);
    return [];
  }
  return (data as Report[]) || [];
}

async function getSpecializations(): Promise<Specialization[]> {
  const { data } = await supabase
    .from("specializations")
    .select("*")
    .order("name");
  return data || [];
}

export default async function HomePage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string>>;
}) {
  const params = await searchParams;
  const [reports, specializations] = await Promise.all([
    getReports(params),
    getSpecializations(),
  ]);

  const activeSpecName = params.spec
    ? specializations.find((s) => s.id === params.spec)?.name
    : null;

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#0B0F19] text-slate-900 dark:text-slate-100 transition-colors duration-300">
      <Header />

      {/* Hero Section */}
      <div className="bg-gradient-to-br from-[#E4007C] via-[#B8005A] to-[#6B0035] dark:from-[#330822] dark:via-[#1A162B] dark:to-[#0B0F19] text-white py-10 sm:py-16 px-4 relative overflow-hidden border-b-2 border-porto-cyan/40">
        <div className="absolute inset-0 opacity-15">
          <div className="absolute top-0 right-1/4 w-80 h-80 rounded-full bg-porto-cyan blur-3xl" />
          <div className="absolute bottom-0 left-1/4 w-80 h-80 rounded-full bg-porto-yellow blur-3xl" />
        </div>
        <div className="max-w-7xl mx-auto text-center relative z-10">
          <div className="flex items-center justify-center gap-2 sm:gap-3 mb-3 sm:mb-4">
            <BookOpen className="w-6 h-6 sm:w-8 sm:h-8 text-porto-yellow shrink-0" />
            <h1 className="text-2xl sm:text-4xl md:text-5xl font-black tracking-wide">
              التقارير الرسمية
            </h1>
          </div>
          <p className="text-white/90 text-sm sm:text-lg md:text-xl font-medium max-w-2xl mx-auto px-2">
            بوابة تقارير وأنشطة نادي بورتو الرياضي — عامر جروب
          </p>
          <div className="mt-4 sm:mt-6 inline-flex items-center gap-2 bg-black/25 backdrop-blur-md border border-white/20 text-porto-yellow px-4 sm:px-5 py-2 sm:py-2.5 rounded-full text-xs sm:text-sm font-bold shadow-md max-w-full">
            <FileText className="w-4 h-4 text-porto-cyan shrink-0" />
            <span className="truncate">
              {reports.length} تقرير متاح
              {activeSpecName && ` — ${activeSpecName}`}
            </span>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-6 sm:py-10">
        {/* Filter */}
        <Suspense fallback={null}>
          <ReportFilter specializations={specializations} />
        </Suspense>

        {/* Reports Grid */}
        {reports.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
            {reports.map((report) => (
              <ReportCard key={report.id} report={report as Report & { specializations?: Specialization }} />
            ))}
          </div>
        ) : (
          <div className="text-center py-12 sm:py-24 px-4 bg-white dark:bg-[#151D2F] rounded-2xl border border-slate-200 dark:border-[#222F49] shadow-sm">
            <FileText className="w-12 h-12 sm:w-16 sm:h-16 text-slate-300 dark:text-slate-600 mx-auto mb-4" />
            <h3 className="text-lg sm:text-xl font-bold text-slate-800 dark:text-slate-200 mb-2">لا توجد تقارير</h3>
            <p className="text-slate-500 dark:text-slate-400 text-sm sm:text-base max-w-md mx-auto">
              {Object.keys(params).length > 0
                ? "لا توجد تقارير تطابق الفلتر المحدد. جرب تغيير خيارات البحث."
                : "لم يتم نشر أي تقارير بعد."}
            </p>
          </div>
        )}
      </div>

      {/* Footer */}
      <footer className="bg-slate-900 dark:bg-black text-white text-center py-8 mt-16 border-t-4 border-porto-pink">
        <p className="text-porto-yellow text-sm font-bold">
          نادي بورتو الرياضي — PORTO SPORTING CLUB
        </p>
        <p className="text-white/60 text-xs mt-1">
          Amer Group © {new Date().getFullYear()} — جميع الحقوق محفوظة
        </p>
      </footer>
    </div>
  );
}
