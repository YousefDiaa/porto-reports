import Link from "next/link";
import { supabase } from "@/lib/supabase";
import { formatDate } from "@/lib/utils";
import { PlusCircle, FileText, Edit, Eye, CheckCircle, Clock } from "lucide-react";
import DeleteReportButton from "@/components/DeleteReportButton";

export const dynamic = "force-dynamic";

async function getReports() {
  const { data } = await supabase
    .from("reports")
    .select("*, specializations(name, color)")
    .order("created_at", { ascending: false });
  return data || [];
}

export default async function AdminReportsPage() {
  const reports = await getReports();

  return (
    <div className="p-8 max-w-7xl mx-auto">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-black text-slate-900 dark:text-white">إدارة التقارير</h1>
          <p className="text-slate-500 dark:text-slate-400 mt-1 font-medium">{reports.length} تقرير إجمالاً</p>
        </div>
        <Link
          href="/admin/dashboard/reports/new"
          className="flex items-center gap-2 bg-gradient-to-r from-porto-pink to-porto-pink-dark hover:from-porto-pink-light hover:to-porto-pink text-white font-black px-5 py-2.5 rounded-xl transition-all shadow-porto hover:scale-105 active:scale-95"
        >
          <PlusCircle className="w-5 h-5" />
          تقرير جديد
        </Link>
      </div>

      {reports.length === 0 ? (
        <div className="bg-white dark:bg-[#151D2F] rounded-2xl shadow-sm border border-slate-200 dark:border-[#222F49] p-16 text-center">
          <FileText className="w-16 h-16 text-slate-300 dark:text-slate-600 mx-auto mb-4" />
          <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">لا توجد تقارير بعد</h3>
          <p className="text-slate-500 dark:text-slate-400 mb-6 font-medium">ابدأ بإنشاء أول تقرير لنادي بورتو الرياضي</p>
          <Link
            href="/admin/dashboard/reports/new"
            className="inline-flex items-center gap-2 bg-gradient-to-r from-porto-pink to-porto-pink-dark text-white font-bold px-6 py-3 rounded-xl transition-all hover:scale-105 shadow-porto"
          >
            <PlusCircle className="w-5 h-5" />
            إنشاء تقرير
          </Link>
        </div>
      ) : (
        <div className="bg-white dark:bg-[#151D2F] rounded-2xl shadow-sm border border-slate-200 dark:border-[#222F49] overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-slate-900 dark:bg-black text-white text-sm border-b-2 border-porto-cyan">
                <tr>
                  <th className="text-right px-6 py-4 font-black">عنوان التقرير</th>
                  <th className="text-right px-6 py-4 font-black">التخصص</th>
                  <th className="text-right px-6 py-4 font-black">التاريخ</th>
                  <th className="text-right px-6 py-4 font-black">الحالة</th>
                  <th className="text-left px-6 py-4 font-black">الإجراءات</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-[#222F49]">
                {reports.map((report: Record<string, unknown>) => {
                  const spec = report.specializations as { name: string; color: string } | null;
                  return (
                    <tr
                      key={report.id as string}
                      className="hover:bg-slate-50 dark:hover:bg-[#1A243A] transition-colors"
                    >
                      <td className="px-6 py-4">
                        <div className="font-bold text-slate-900 dark:text-white text-sm line-clamp-1">
                          {report.title as string}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        {spec ? (
                          <span
                            className="text-xs font-bold px-3 py-1 rounded-full border"
                            style={{
                              backgroundColor: `${spec.color}15`,
                              borderColor: `${spec.color}40`,
                              color: spec.color,
                            }}
                          >
                            {spec.name}
                          </span>
                        ) : (
                          <span className="text-slate-400 text-xs">—</span>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-sm text-slate-600 dark:text-slate-300 font-medium">
                          {formatDate(report.report_date as string)}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span
                          className={`inline-flex items-center gap-1.5 text-xs font-bold px-3 py-1 rounded-full ${
                            report.is_published
                              ? "bg-green-100 text-green-700 dark:bg-green-950/50 dark:text-green-400 border border-green-200 dark:border-green-800"
                              : "bg-amber-100 text-amber-700 dark:bg-amber-950/50 dark:text-amber-400 border border-amber-200 dark:border-amber-800"
                          }`}
                        >
                          {report.is_published ? (
                            <CheckCircle className="w-3 h-3" />
                          ) : (
                            <Clock className="w-3 h-3" />
                          )}
                          {report.is_published ? "منشور" : "مسودة"}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2 justify-end">
                          {report.is_published ? (
                            <Link
                              href={`/reports/${report.id as string}`}
                              target="_blank"
                              className="p-2 text-slate-400 hover:text-porto-cyan transition-colors rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800"
                              title="عرض"
                            >
                              <Eye className="w-4 h-4" />
                            </Link>
                          ) : null}
                          <Link
                            href={`/admin/dashboard/reports/${report.id as string}/edit`}
                            className="p-2 text-slate-400 hover:text-porto-pink transition-colors rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800"
                            title="تعديل"
                          >
                            <Edit className="w-4 h-4" />
                          </Link>
                          <DeleteReportButton id={report.id as string} />
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
