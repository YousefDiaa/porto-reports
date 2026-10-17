import { notFound } from "next/navigation";
import Link from "next/link";
import { supabase } from "@/lib/supabase";
import Header from "@/components/Header";
import ExportButtons from "@/components/ExportButtons";
import { formatDate } from "@/lib/utils";
import { Calendar, Tag, ArrowRight } from "lucide-react";
import type { Metadata } from "next";
import { Report, Specialization } from "@/lib/supabase";

export const dynamic = "force-dynamic";

async function getReport(id: string): Promise<(Report & { specializations?: Specialization }) | null> {
  const { data, error } = await supabase
    .from("reports")
    .select("*, specializations(*)")
    .eq("id", id)
    .eq("is_published", true)
    .single();

  if (error || !data) return null;
  return data as Report & { specializations?: Specialization };
}

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const { id } = await params;
  const report = await getReport(id);
  if (!report) return { title: "تقرير غير موجود | نادي بورتو" };
  return {
    title: `${report.title} — تقارير نادي بورتو الرياضي`,
    description: `تقرير رسمي بتاريخ ${formatDate(report.report_date)}`,
  };
}

export default async function ReportPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const report = await getReport(id);

  if (!report) notFound();

  const spec = report.specializations;

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#0B0F19] text-slate-900 dark:text-slate-100 transition-colors duration-300">
      <Header />

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        {/* Back button */}
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-porto-pink dark:text-porto-cyan hover:underline transition-colors mb-6 font-bold text-sm"
        >
          <ArrowRight className="w-4 h-4" />
          العودة إلى قائمة التقارير
        </Link>

        {/* Report Article */}
        <article className="bg-white dark:bg-[#151D2F] rounded-2xl shadow-sm border border-slate-200 dark:border-[#222F49] overflow-hidden animate-fade-in">
          {/* Report Header Banner */}
          <div className="bg-gradient-to-r from-[#E4007C] via-[#C20063] to-[#800040] dark:from-[#350723] dark:via-[#1A142D] dark:to-[#0B0F19] p-8 md:p-10 relative overflow-hidden">
            <div className="absolute top-0 left-0 w-64 h-64 rounded-full bg-porto-cyan/20 blur-3xl pointer-events-none" />
            
            {/* Badges */}
            <div className="flex items-center gap-3 mb-4 flex-wrap relative z-10">
              {spec && (
                <span
                  className="inline-flex items-center gap-1.5 text-xs font-black px-3.5 py-1.5 rounded-full border shadow-sm"
                  style={{
                    backgroundColor: `${spec.color}25`,
                    borderColor: `${spec.color}60`,
                    color: "#FFFFFF",
                  }}
                >
                  <Tag className="w-3.5 h-3.5" />
                  {spec.name}
                </span>
              )}
              <span className="inline-flex items-center gap-1.5 text-porto-yellow text-sm font-bold bg-black/20 px-3 py-1 rounded-full">
                <Calendar className="w-3.5 h-3.5" />
                {formatDate(report.report_date, "full")}
              </span>
            </div>

            {/* Title */}
            <h1 className="text-2xl md:text-4xl font-black text-white leading-tight relative z-10">
              {report.title}
            </h1>
          </div>

          {/* Accent Ribbon (Pink -> Cyan -> Yellow) */}
          <div className="h-1.5 bg-gradient-to-r from-porto-pink via-porto-cyan to-porto-yellow" />

          {/* Report Body */}
          <div className="p-8 md:p-10">
            <div
              className="report-content"
              dangerouslySetInnerHTML={{ __html: report.content_html }}
            />
          </div>

          {/* Footer actions */}
          <div className="border-t border-slate-200 dark:border-[#222F49] px-8 py-5 bg-slate-50 dark:bg-[#101726] flex items-center justify-between flex-wrap gap-4">
            <div className="text-xs text-slate-500 dark:text-slate-400 font-medium">
              آخر تحديث: {formatDate(report.updated_at)}
            </div>
            <ExportButtons report={report} specialization={spec} />
          </div>
        </article>
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
