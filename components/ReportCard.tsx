import Link from "next/link";
import { Report, Specialization } from "@/lib/supabase";
import { formatDate, stripHtml, truncateText } from "@/lib/utils";
import { Calendar, Tag, ArrowLeft } from "lucide-react";

interface ReportCardProps {
  report: Report & { specializations?: Specialization };
}

export default function ReportCard({ report }: ReportCardProps) {
  const preview = truncateText(stripHtml(report.content_html), 150);
  const spec = report.specializations;

  return (
    <div className="bg-white dark:bg-[#151D2F] rounded-2xl shadow-sm hover:shadow-porto-lg dark:hover:shadow-none dark:hover:border-porto-cyan transition-all duration-300 overflow-hidden border border-slate-200 dark:border-[#222F49] group animate-fade-in flex flex-col justify-between">
      {/* Top accent bar with Porto shield colors (pink, cyan, yellow) */}
      <div className="h-1.5 bg-gradient-to-r from-porto-pink via-porto-cyan to-porto-yellow" />

      <div className="p-6 flex-1 flex flex-col">
        {/* Meta badges */}
        <div className="flex items-center gap-2 mb-3.5 flex-wrap">
          {spec && (
            <span
              className="inline-flex items-center gap-1.5 text-xs font-bold px-3 py-1 rounded-full border"
              style={{
                backgroundColor: `${spec.color}15`,
                borderColor: `${spec.color}40`,
                color: spec.color,
              }}
            >
              <Tag className="w-3 h-3" />
              {spec.name}
            </span>
          )}
          <span className="inline-flex items-center gap-1.5 text-xs font-medium text-slate-500 dark:text-slate-400">
            <Calendar className="w-3.5 h-3.5 text-porto-cyan" />
            {formatDate(report.report_date)}
          </span>
        </div>

        {/* Title */}
        <h3 className="text-lg font-black text-slate-900 dark:text-white mb-3 line-clamp-2 group-hover:text-porto-pink dark:group-hover:text-porto-cyan transition-colors leading-snug">
          {report.title}
        </h3>

        {/* Preview */}
        <p className="text-slate-600 dark:text-slate-400 text-sm leading-relaxed line-clamp-3 mb-5 flex-1">
          {preview || "لا يوجد نص للمعاينة، اضغط لقراءة التقرير بالكامل."}
        </p>

        {/* Read more link */}
        <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
          <Link
            href={`/reports/${report.id}`}
            className="inline-flex items-center gap-2 text-porto-pink dark:text-porto-cyan font-bold text-sm hover:translate-x-[-4px] transition-transform group/link"
          >
            <span>عرض التقرير</span>
            <ArrowLeft className="w-4 h-4 transition-transform group-hover/link:-translate-x-1" />
          </Link>
          <span className="w-2 h-2 rounded-full bg-porto-yellow shadow-sm" />
        </div>
      </div>
    </div>
  );
}
