"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import dynamic from "next/dynamic";
import { supabase } from "@/lib/supabase";
import { Specialization } from "@/lib/supabase";
import { Save, Eye, Send, ArrowRight, ChevronDown, Calendar } from "lucide-react";
import Link from "next/link";

const TiptapEditor = dynamic(() => import("@/components/TiptapEditor"), { ssr: false });

const EMPTY_CONTENT = {
  type: "doc",
  content: [{ type: "paragraph" }],
};

function resolveInitialContent(content: any, contentHtml: string | undefined): object | string {
  if (typeof content === "string" && content.trim().startsWith("{")) {
    try {
      content = JSON.parse(content);
    } catch {
      // ignore
    }
  }

  if (
    content &&
    typeof content === "object" &&
    content.type === "doc" &&
    Array.isArray(content.content) &&
    content.content.length > 0
  ) {
    const hasOnlyEmptyParagraph =
      content.content.length === 1 &&
      content.content[0].type === "paragraph" &&
      (!content.content[0].content || content.content[0].content.length === 0);

    if (!hasOnlyEmptyParagraph) {
      return content;
    }
  }

  if (contentHtml && contentHtml.trim().length > 0) {
    return contentHtml;
  }

  return EMPTY_CONTENT;
}

interface ReportFormProps {
  initialData?: {
    id?: string;
    title: string;
    content: object | string;
    content_html: string;
    specialization_id: string | null;
    report_date: string;
    is_published: boolean;
  };
}

export default function ReportForm({ initialData }: ReportFormProps) {
  const router = useRouter();
  const [title, setTitle] = useState(initialData?.title || "");
  const [content, setContent] = useState<object | string>(() =>
    resolveInitialContent(initialData?.content, initialData?.content_html)
  );
  const [contentHtml, setContentHtml] = useState(initialData?.content_html || "");
  const [specId, setSpecId] = useState(initialData?.specialization_id || "");
  const [reportDate, setReportDate] = useState(
    initialData?.report_date || new Date().toISOString().split("T")[0]
  );
  const [isPublished, setIsPublished] = useState(initialData?.is_published || false);
  const [specializations, setSpecializations] = useState<Specialization[]>([]);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  useEffect(() => {
    supabase.from("specializations").select("*").order("name").then(({ data }) => {
      setSpecializations(data || []);
    });
  }, []);

  const handleEditorChange = (json: object, html: string) => {
    setContent(json);
    setContentHtml(html);
  };

  const handleSave = async (publish: boolean) => {
    if (!title.trim()) {
      setMessage({ type: "error", text: "يرجى إدخال عنوان التقرير" });
      return;
    }

    setSaving(true);
    setMessage(null);

    const payload = {
      title: title.trim(),
      content: typeof content === "object" ? content : { type: "doc", content: [] },
      content_html: contentHtml,
      specialization_id: specId || null,
      report_date: reportDate,
      is_published: publish,
      updated_at: new Date().toISOString(),
    };

    let error;

    if (initialData?.id) {
      const result = await supabase.from("reports").update(payload).eq("id", initialData.id);
      error = result.error;
    } else {
      const result = await supabase.from("reports").insert(payload).select().single();
      error = result.error;
      if (!error && result.data) {
        router.push(`/admin/dashboard/reports/${result.data.id}/edit`);
      }
    }

    setSaving(false);

    if (error) {
      setMessage({ type: "error", text: `حدث خطأ: ${error.message}` });
    } else {
      setIsPublished(publish);
      setMessage({
        type: "success",
        text: publish ? "تم نشر التقرير بنجاح ✓" : "تم حفظ المسودة بنجاح ✓",
      });
      setTimeout(() => setMessage(null), 3000);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#0B0F19] text-slate-900 dark:text-slate-100 transition-colors duration-300">
      {/* Top bar */}
      <div className="bg-white dark:bg-[#151D2F] border-b border-slate-200 dark:border-[#222F49] sticky top-0 z-30 shadow-sm transition-colors duration-300">
        <div className="max-w-6xl mx-auto px-3 sm:px-6 py-2.5 sm:py-3.5 flex items-center justify-between flex-wrap gap-2">
          <div className="flex items-center gap-2 sm:gap-3 min-w-0">
            <Link
              href="/admin/dashboard/reports"
              className="flex items-center gap-1 text-slate-500 dark:text-slate-400 hover:text-porto-pink dark:hover:text-porto-cyan transition-colors text-xs sm:text-sm font-bold shrink-0"
            >
              <ArrowRight className="w-4 h-4" />
              <span className="hidden sm:inline">التقارير</span>
            </Link>
            <span className="text-slate-300 dark:text-slate-700 hidden sm:inline">/</span>
            <span className="font-black text-slate-900 dark:text-white text-xs sm:text-sm truncate">
              {initialData?.id ? "تعديل التقرير" : "إنشاء تقرير جديد"}
            </span>
          </div>

          <div className="flex items-center gap-1.5 sm:gap-2.5 shrink-0">
            {message && (
              <span
                className={`text-[11px] sm:text-xs px-2.5 sm:px-3.5 py-1 sm:py-1.5 rounded-xl font-bold animate-fade-in ${
                  message.type === "success"
                    ? "bg-green-100 text-green-700 dark:bg-green-950/60 dark:text-green-300 border border-green-300 dark:border-green-800"
                    : "bg-red-100 text-red-700 dark:bg-red-950/60 dark:text-red-300 border border-red-300 dark:border-red-800"
                }`}
              >
                {message.text}
              </span>
            )}
            {initialData?.id && (
              <Link
                href={`/reports/${initialData.id}`}
                target="_blank"
                className="flex items-center gap-1.5 text-slate-600 dark:text-slate-300 hover:text-porto-cyan transition-colors text-xs sm:text-sm px-2.5 sm:px-3.5 py-1.5 sm:py-2 rounded-xl border border-slate-300 dark:border-slate-700 hover:border-porto-cyan font-bold"
              >
                <Eye className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                <span className="hidden sm:inline">معاينة</span>
              </Link>
            )}
            <button
              onClick={() => handleSave(false)}
              disabled={saving}
              className="flex items-center gap-1 sm:gap-1.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 font-bold text-xs sm:text-sm px-3 sm:px-4 py-1.5 sm:py-2 rounded-xl transition-all border border-slate-300 dark:border-slate-700 disabled:opacity-60"
            >
              <Save className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
              <span>مسودة</span>
            </button>
            <button
              onClick={() => handleSave(true)}
              disabled={saving}
              className="flex items-center gap-1 sm:gap-1.5 bg-gradient-to-r from-porto-pink to-porto-pink-dark hover:from-porto-pink-light hover:to-porto-pink text-white font-black text-xs sm:text-sm px-3.5 sm:px-5 py-1.5 sm:py-2 rounded-xl transition-all shadow-porto hover:scale-105 active:scale-95 disabled:opacity-60"
            >
              {saving ? (
                <span className="w-3.5 h-3.5 sm:w-4 sm:h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <Send className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
              )}
              <span>{isPublished ? "تحديث" : "نشر"}</span>
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-3 sm:px-6 py-4 sm:py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 sm:gap-6">
          {/* Main Editor */}
          <div className="lg:col-span-3 space-y-4">
            {/* Title */}
            <div className="bg-white dark:bg-[#151D2F] rounded-2xl shadow-sm border border-slate-200 dark:border-[#222F49] p-4 sm:p-5 transition-colors duration-300">
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="عنوان التقرير..."
                className="w-full text-xl sm:text-2xl font-black text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-600 focus:outline-none border-none bg-transparent"
                dir="rtl"
              />
            </div>

            {/* Editor */}
            <TiptapEditor
              key={initialData?.id || "new"}
              content={content}
              onChange={handleEditorChange}
              placeholder="اكتب محتوى التقرير هنا... يمكنك إضافة عناوين وجداول وصور وروابط"
            />
          </div>

          {/* Sidebar */}
          <div className="space-y-4">
            {/* Publish status */}
            <div className="bg-white dark:bg-[#151D2F] rounded-2xl shadow-sm border border-slate-200 dark:border-[#222F49] p-5 transition-colors duration-300">
              <h3 className="font-bold text-slate-900 dark:text-white mb-3 text-sm">حالة التقرير</h3>
              <div
                className={`flex items-center gap-2 px-3.5 py-2.5 rounded-xl text-sm font-bold ${
                  isPublished
                    ? "bg-green-100 text-green-700 dark:bg-green-950/60 dark:text-green-300 border border-green-300 dark:border-green-800"
                    : "bg-amber-100 text-amber-700 dark:bg-amber-950/60 dark:text-amber-300 border border-amber-300 dark:border-amber-800"
                }`}
              >
                <div
                  className={`w-2.5 h-2.5 rounded-full ${isPublished ? "bg-green-500 animate-pulse" : "bg-amber-500"}`}
                />
                {isPublished ? "منشور للعامة" : "مسودة خاصة"}
              </div>
            </div>

            {/* Report Date */}
            <div className="bg-white dark:bg-[#151D2F] rounded-2xl shadow-sm border border-slate-200 dark:border-[#222F49] p-5 transition-colors duration-300">
              <h3 className="font-bold text-slate-900 dark:text-white mb-3 text-sm flex items-center gap-2">
                <Calendar className="w-4 h-4 text-porto-cyan" />
                تاريخ التقرير
              </h3>
              <input
                type="date"
                value={reportDate}
                onChange={(e) => setReportDate(e.target.value)}
                className="w-full border border-slate-300 dark:border-slate-700 rounded-xl px-3.5 py-2.5 text-slate-800 dark:text-slate-100 bg-slate-50 dark:bg-[#1C263D] focus:outline-none focus:ring-2 focus:ring-porto-pink dark:focus:ring-porto-cyan text-sm"
              />
            </div>

            {/* Specialization */}
            <div className="bg-white dark:bg-[#151D2F] rounded-2xl shadow-sm border border-slate-200 dark:border-[#222F49] p-5 transition-colors duration-300">
              <h3 className="font-bold text-slate-900 dark:text-white mb-3 text-sm">التخصص</h3>
              <div className="relative">
                <select
                  value={specId}
                  onChange={(e) => setSpecId(e.target.value)}
                  className="w-full border border-slate-300 dark:border-slate-700 rounded-xl px-3.5 py-2.5 text-slate-800 dark:text-slate-100 bg-slate-50 dark:bg-[#1C263D] appearance-none focus:outline-none focus:ring-2 focus:ring-porto-pink dark:focus:ring-porto-cyan text-sm"
                >
                  <option value="">بدون تخصص</option>
                  {specializations.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.name}
                    </option>
                  ))}
                </select>
                <ChevronDown className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
              </div>
              <Link
                href="/admin/dashboard/specializations"
                className="block text-xs font-bold text-porto-pink dark:text-porto-cyan hover:underline mt-2.5 transition-colors"
              >
                + إضافة أو إدارة التخصصات
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
