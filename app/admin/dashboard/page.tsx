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
    <div className="p-8 max-w-7xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-black text-slate-900 dark:text-white">لوحة التحكم</h1>
        <p className="text-slate-500 dark:text-slate-400 mt-1 font-medium">
          مرحباً بك في نظام إدارة تقارير نادي بورتو الرياضي (Porto Sporting Club)
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {statCards.map((card) => (
          <div
            key={card.label}
            className="bg-white dark:bg-[#151D2F] rounded-2xl shadow-sm p-6 border border-slate-200 dark:border-[#222F49] transition-all hover:scale-[1.02]"
          >
            <div className={`w-11 h-11 rounded-xl flex items-center justify-center mb-4 ${card.color}`}>
              <card.icon className="w-6 h-6" />
            </div>
            <div className="text-3xl font-black text-slate-900 dark:text-white mb-1">{card.value}</div>
            <div className="text-xs text-slate-500 dark:text-slate-400 font-bold">{card.label}</div>
          </div>
        ))}
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-8">
        <Link
          href="/admin/dashboard/reports/new"
          className="flex items-center gap-4 bg-gradient-to-r from-porto-pink to-porto-pink-dark hover:from-porto-pink-light hover:to-porto-pink text-white p-6 rounded-2xl shadow-porto transition-all hover:scale-[1.01] group"
        >
          <div className="w-14 h-14 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center">
            <PlusCircle className="w-7 h-7 text-porto-yellow" />
          </div>
          <div>
            <div className="font-black text-xl">إنشاء تقرير جديد</div>
            <div className="text-white/80 text-sm mt-0.5">اكتب تقريراً جديداً بالمحرر الاحترافي</div>
          </div>
          <ArrowLeft className="mr-auto w-5 h-5 text-white/70 group-hover:-translate-x-1 transition-transform" />
        </Link>

        <Link
          href="/admin/dashboard/specializations"
          className="flex items-center gap-4 bg-white dark:bg-[#151D2F] hover:border-porto-cyan border border-slate-200 dark:border-[#222F49] text-slate-900 dark:text-white p-6 rounded-2xl shadow-sm transition-all hover:scale-[1.01] group"
        >
          <div className="w-14 h-14 rounded-2xl bg-porto-cyan/15 dark:bg-porto-cyan/25 flex items-center justify-center">
            <Tags className="w-7 h-7 text-porto-cyan" />
          </div>
          <div>
            <div className="font-black text-xl">إدارة التخصصات</div>
            <div className="text-slate-500 dark:text-slate-400 text-sm mt-0.5">أضف أو عدل تخصصات النادي وألوانها</div>
          </div>
          <ArrowLeft className="mr-auto w-5 h-5 text-slate-400 group-hover:-translate-x-1 transition-transform" />
        </Link>
      </div>

      {/* Recent reports */}
      <div className="bg-white dark:bg-[#151D2F] rounded-2xl shadow-sm border border-slate-200 dark:border-[#222F49] overflow-hidden">
        <div className="flex items-center justify-between p-6 border-b border-slate-200 dark:border-[#222F49]">
          <div className="flex items-center gap-2">
            <Clock className="w-5 h-5 text-porto-pink dark:text-porto-cyan" />
            <h2 className="font-black text-slate-900 dark:text-white text-lg">آخر التقارير</h2>
          </div>
          <Link
            href="/admin/dashboard/reports"
            className="text-sm font-bold text-porto-pink dark:text-porto-cyan hover:underline transition-colors"
          >
            عرض جميع التقارير
          </Link>
        </div>

        <div className="divide-y divide-slate-100 dark:divide-[#222F49]">
          {recentReports.length === 0 ? (
            <div className="p-10 text-center text-slate-500 dark:text-slate-400 font-medium">
              لا توجد تقارير بعد. اضغط على زر "إنشاء تقرير جديد" للبدء.
            </div>
          ) : (
            recentReports.map((report: Record<string, unknown>) => (
              <div
                key={report.id as string}
                className="flex items-center justify-between p-5 hover:bg-slate-50 dark:hover:bg-[#1A243A] transition-colors"
              >
                <div className="flex items-center gap-3.5">
                  <div className="w-9 h-9 rounded-xl bg-porto-pink/10 dark:bg-porto-pink/20 flex items-center justify-center">
                    <FileText className="w-4 h-4 text-porto-pink" />
                  </div>
                  <div>
                    <div className="font-bold text-slate-900 dark:text-white text-sm">
                      {report.title as string}
                    </div>
                    <div className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                      {formatDate(report.report_date as string)}
                      {(report.specializations as { name: string } | null)?.name &&
                        ` — ${(report.specializations as { name: string }).name}`}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <span
                    className={`text-xs font-bold px-3 py-1 rounded-full ${
                      report.is_published
                        ? "bg-green-100 text-green-700 dark:bg-green-950/50 dark:text-green-400 border border-green-200 dark:border-green-800"
                        : "bg-amber-100 text-amber-700 dark:bg-amber-950/50 dark:text-amber-400 border border-amber-200 dark:border-amber-800"
                    }`}
                  >
                    {report.is_published ? "منشور" : "مسودة"}
                  </span>
                  <Link
                    href={`/admin/dashboard/reports/${report.id as string}/edit`}
                    className="text-xs font-bold text-porto-cyan hover:underline transition-colors px-2 py-1"
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
