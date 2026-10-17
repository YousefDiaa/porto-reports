import { notFound } from "next/navigation";
import { supabase } from "@/lib/supabase";
import ReportForm from "@/components/ReportForm";

export const dynamic = "force-dynamic";

async function getReport(id: string) {
  const { data, error } = await supabase
    .from("reports")
    .select("*")
    .eq("id", id)
    .single();

  if (error || !data) return null;
  return data;
}

export default async function EditReportPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const report = await getReport(id);

  if (!report) notFound();

  return (
    <ReportForm
      initialData={{
        id: report.id,
        title: report.title,
        content: report.content as object,
        content_html: report.content_html,
        specialization_id: report.specialization_id,
        report_date: report.report_date,
        is_published: report.is_published,
      }}
    />
  );
}
