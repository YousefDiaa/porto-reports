"use client";

import { useState } from "react";
import { Download, FileText } from "lucide-react";
import { Report, Specialization } from "@/lib/supabase";

interface ExportButtonsProps {
  report: Report;
  specialization?: Specialization | null;
}

export default function ExportButtons({ report, specialization }: ExportButtonsProps) {
  const [loadingPdf, setLoadingPdf] = useState(false);
  const [loadingWord, setLoadingWord] = useState(false);

  const handleExportPDF = async () => {
    setLoadingPdf(true);
    try {
      const { exportReportToPDF } = await import("@/lib/export-pdf");
      await exportReportToPDF([report], specialization);
    } catch (error) {
      console.error(error);
      alert("حدث خطأ أثناء تصدير PDF");
    } finally {
      setLoadingPdf(false);
    }
  };

  const handleExportWord = async () => {
    setLoadingWord(true);
    try {
      const { exportReportToWord } = await import("@/lib/export-word");
      await exportReportToWord([report], specialization);
    } catch (error) {
      console.error(error);
      alert("حدث خطأ أثناء تصدير Word");
    } finally {
      setLoadingWord(false);
    }
  };

  return (
    <div className="flex items-center gap-2 sm:gap-2.5 flex-wrap">
      <span className="text-xs sm:text-sm font-bold text-slate-700 dark:text-slate-300">تصدير التقرير:</span>
      <button
        onClick={handleExportPDF}
        disabled={loadingPdf}
        className="flex items-center gap-1.5 bg-gradient-to-r from-red-600 to-rose-700 hover:from-red-500 hover:to-rose-600 text-white text-xs font-black px-3 sm:px-4 py-2 sm:py-2.5 rounded-xl transition-all shadow-sm hover:scale-105 active:scale-95 disabled:opacity-60 disabled:cursor-not-allowed"
      >
        <Download className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
        {loadingPdf ? "جارٍ..." : "PDF"}
      </button>
      <button
        onClick={handleExportWord}
        disabled={loadingWord}
        className="flex items-center gap-1.5 bg-gradient-to-r from-porto-cyan to-blue-600 hover:from-porto-cyan-light hover:to-blue-500 text-white text-xs font-black px-3 sm:px-4 py-2 sm:py-2.5 rounded-xl transition-all shadow-sm hover:scale-105 active:scale-95 disabled:opacity-60 disabled:cursor-not-allowed"
      >
        <FileText className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
        {loadingWord ? "جارٍ..." : "Word"}
      </button>
    </div>
  );
}
