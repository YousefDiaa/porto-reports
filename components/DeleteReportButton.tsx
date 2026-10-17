"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { Trash2 } from "lucide-react";

export default function DeleteReportButton({ id }: { id: string }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const handleDelete = async () => {
    if (!confirm("هل أنت متأكد من حذف هذا التقرير؟ لا يمكن التراجع عن هذا الإجراء.")) return;
    
    setLoading(true);
    const { error } = await supabase.from("reports").delete().eq("id", id);
    setLoading(false);

    if (error) {
      alert("حدث خطأ أثناء الحذف: " + error.message);
    } else {
      router.refresh();
    }
  };

  return (
    <button
      onClick={handleDelete}
      disabled={loading}
      className="p-1.5 text-red-400 hover:text-red-600 transition-colors disabled:opacity-50"
      title="حذف"
    >
      {loading ? (
        <span className="w-4 h-4 border-2 border-red-300 border-t-red-600 rounded-full animate-spin inline-block" />
      ) : (
        <Trash2 className="w-4 h-4" />
      )}
    </button>
  );
}
