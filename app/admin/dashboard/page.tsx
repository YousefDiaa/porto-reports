import Link from "next/link";
import { supabase } from "@/lib/supabase";
import { formatDate } from "@/lib/utils";
import { FileText, Tags, PlusCircle, Clock, CheckCircle, AlertCircle, ArrowLeft } from "lucide-react";

export const dynamic = "force-dynamic";

async function getDashboardStats() {
  const [reportsResult, specsResult] = await Promise.all([
    supabase.from("reports").select("id, is_published, created_at"),
    supabase.from("specializations").select("id, name"),
  ]);

  const reports = reportsResult.data || [];
  const published = reports.filter((r) => r.is_published).length;
  const drafts = reports.filter((r) => !r.is_published).length;
  const specs = specsResult.data || [];

  return { total: reports.length, published, drafts, specs: specs.length };
}

async function getRecentReports() {
  const { data } = await supabase
    .from("reports")
    .select("id, title, is_published, report_date, specializations(name)")
    .order("created_at", { ascending: false })
    .limit(5);
  return data || [];
}

export default async function AdminDashboardPage() {
  const [stats, recentReports] = await Promise.all([
    getDashboardStats(),
    getRecentReports(),
  ]);

  const statCards = [
    { label: "إجمالي التقارير", value: stats.total, icon: FileText, color: "text-porto-pink bg-porto-pink/15 dark:bg-porto-pink/25" },
    { label: "تقارير منشورة", value: stats.published, icon: CheckCircle, color: "text-green-600 dark:text-green-400 bg-green-100 dark:bg-green-950/40" },
    { label: "مسودات", value: stats.drafts, icon: AlertCircle, color: "text-amber-600 dark:text-porto-yellow bg-amber-100 dark:bg-amber-950/40" },
    { label: "التخصصات", value: stats.specs, icon: Tags, color: "text-porto-cyan bg-porto-cyan/15 dark:bg-porto-cyan/25" },
  ];

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto">
      <div className="mb-6 sm:mb-8">
        <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white">لوحة التحكم</h1>
        <p className="text-slate-500 dark:text-slate-400 mt-1 text-xs sm:text-sm font-medium">
          مرحباً بك في نظام إدارة تقارير نادي بورتو الرياضي (Porto Sporting Club)
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-6 sm:mb-8">
        {statCards.map((card) => (
          <div
            key={card.label}
            className="bg-white dark:bg-[#151D2F] rounded-2xl shadow-sm p-4 sm:p-6 border border-slate-200 dark:border-[#222F49] transition-all hover:scale-[1.02]"
          >
            <div className={`w-9 h-9 sm:w-11 sm:h-11 rounded-xl flex items-center justify-center mb-3 sm:mb-4 ${card.color}`}>
              <card.icon className="w-5 h-5 sm:w-6 sm:h-6" />
            </div>
            <div className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white mb-1">{card.value}</div>
            <div className="text-[11px] sm:text-xs text-slate-500 dark:text-slate-400 font-bold truncate">{card.label}</div>
          </div>
        ))}
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-5 mb-6 sm:mb-8">
        <Link
          href="/admin/dashboard/reports/new"
          className="flex items-center gap-3 sm:gap-4 bg-gradient-to-r from-porto-pink to-porto-pink-dark hover:from-porto-pink-light hover:to-porto-pink text-white p-4 sm:p-6 rounded-2xl shadow-porto transition-all hover:scale-[1.01] group"
        >
          <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center shrink-0">
            <PlusCircle className="w-6 h-6 sm:w-7 sm:h-7 text-porto-yellow" />
          </div>
          <div className="min-w-0">
            <div className="font-black text-base sm:text-xl truncate">إنشاء تقرير جديد</div>
            <div className="text-white/80 text-xs sm:text-sm mt-0.5 truncate">اكتب تقريراً جديداً بالمحرر الاحترافي</div>
          </div>
          <ArrowLeft className="mr-auto w-5 h-5 text-white/70 group-hover:-translate-x-1 transition-transform shrink-0" />
        </Link>

        <Link
          href="/admin/dashboard/specializations"
          className="flex items-center gap-3 sm:gap-4 bg-white dark:bg-[#151D2F] hover:border-porto-cyan border border-slate-200 dark:border-[#222F49] text-slate-900 dark:text-white p-4 sm:p-6 rounded-2xl shadow-sm transition-all hover:scale-[1.01] group"
        >
          <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl bg-porto-cyan/15 dark:bg-porto-cyan/25 flex items-center justify-center shrink-0">
            <Tags className="w-6 h-6 sm:w-7 sm:h-7 text-porto-cyan" />
          </div>
          <div className="min-w-0">
            <div className="font-black text-base sm:text-xl truncate">إدارة التخصصات</div>
            <div className="text-slate-500 dark:text-slate-400 text-xs sm:text-sm mt-0.5 truncate">أضف أو عدل تخصصات النادي وألوانها</div>
          </div>
          <ArrowLeft className="mr-auto w-5 h-5 text-slate-400 group-hover:-translate-x-1 transition-transform shrink-0" />
        </Link>
      </div>

      {/* Recent reports */}
      <div className="bg-white dark:bg-[#151D2F] rounded-2xl shadow-sm border border-slate-200 dark:border-[#222F49] overflow-hidden">
        <div className="flex items-center justify-between p-4 sm:p-6 border-b border-slate-200 dark:border-[#222F49]">
          <div className="flex items-center gap-2">
            <Clock className="w-5 h-5 text-porto-pink dark:text-porto-cyan" />
            <h2 className="font-black text-slate-900 dark:text-white text-base sm:text-lg">آخر التقارير</h2>
          </div>
          <Link
            href="/admin/dashboard/reports"
            className="text-xs sm:text-sm font-bold text-porto-pink dark:text-porto-cyan hover:underline transition-colors"
          >
            عرض جميع التقارير
          </Link>
        </div>

        <div className="divide-y divide-slate-100 dark:divide-[#222F49]">
          {recentReports.length === 0 ? (
            <div className="p-8 sm:p-10 text-center text-slate-500 dark:text-slate-400 font-medium text-sm">
              لا توجد تقارير بعد. اضغط على زر "إنشاء تقرير جديد" للبدء.
            </div>
          ) : (
            recentReports.map((report: Record<string, unknown>) => (
              <div
                key={report.id as string}
                className="flex items-center justify-between p-3.5 sm:p-5 hover:bg-slate-50 dark:hover:bg-[#1A243A] transition-colors gap-3"
              >
                <div className="flex items-center gap-2.5 sm:gap-3.5 min-w-0">
                  <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-porto-pink/10 dark:bg-porto-pink/20 flex items-center justify-center shrink-0">
                    <FileText className="w-4 h-4 text-porto-pink" />
                  </div>
                  <div className="min-w-0">
                    <div className="font-bold text-slate-900 dark:text-white text-xs sm:text-sm truncate">
                      {report.title as string}
                    </div>
                    <div className="text-[11px] sm:text-xs text-slate-500 dark:text-slate-400 mt-0.5 truncate">
                      {formatDate(report.report_date as string)}
                      {(report.specializations as { name: string } | null)?.name &&
                        ` — ${(report.specializations as { name: string }).name}`}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <span
                    className={`text-[10px] sm:text-xs font-bold px-2 sm:px-3 py-0.5 sm:py-1 rounded-full ${
                      report.is_published
                        ? "bg-green-100 text-green-700 dark:bg-green-950/50 dark:text-green-400 border border-green-200 dark:border-green-800"
                        : "bg-amber-100 text-amber-700 dark:bg-amber-950/50 dark:text-amber-400 border border-amber-200 dark:border-amber-800"
                    }`}
                  >
                    {report.is_published ? "منشور" : "مسودة"}
                  </span>
                  <Link
                    href={`/admin/dashboard/reports/${report.id as string}/edit`}
                    className="text-xs font-bold text-porto-cyan hover:underline transition-colors px-1.5 py-1"
                  >
                    تعديل
                  </Link>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
