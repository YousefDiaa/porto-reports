"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { Specialization } from "@/lib/supabase";
import { PlusCircle, Trash2, Edit2, Check, X, Tags } from "lucide-react";

const PRESET_COLORS = [
  "#E4007C", "#00AEEF", "#FFE500", "#10B981",
  "#8B5CF6", "#F97316", "#06B6D4", "#EC4899",
  "#3B82F6", "#64748B",
];

export default function SpecializationsPage() {
  const [specs, setSpecs] = useState<Specialization[]>([]);
  const [loading, setLoading] = useState(true);
  const [newName, setNewName] = useState("");
  const [newDesc, setNewDesc] = useState("");
  const [newColor, setNewColor] = useState(PRESET_COLORS[0]);
  const [adding, setAdding] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState("");
  const [editDesc, setEditDesc] = useState("");
  const [editColor, setEditColor] = useState("");
  const [saving, setSaving] = useState(false);

  const fetchSpecs = async () => {
    const { data } = await supabase.from("specializations").select("*").order("name");
    setSpecs(data || []);
    setLoading(false);
  };

  useEffect(() => { fetchSpecs(); }, []);

  const handleAdd = async () => {
    if (!newName.trim()) return;
    setAdding(true);
    const { error } = await supabase.from("specializations").insert({
      name: newName.trim(),
      description: newDesc.trim() || null,
      color: newColor,
    });
    if (!error) {
      setNewName("");
      setNewDesc("");
      setNewColor(PRESET_COLORS[0]);
      fetchSpecs();
    } else {
      alert("خطأ: " + error.message);
    }
    setAdding(false);
  };

  const handleEdit = (spec: Specialization) => {
    setEditingId(spec.id);
    setEditName(spec.name);
    setEditDesc(spec.description || "");
    setEditColor(spec.color);
  };

  const handleSaveEdit = async () => {
    if (!editingId || !editName.trim()) return;
    setSaving(true);
    const { error } = await supabase.from("specializations").update({
      name: editName.trim(),
      description: editDesc.trim() || null,
      color: editColor,
    }).eq("id", editingId);
    if (!error) {
      setEditingId(null);
      fetchSpecs();
    } else {
      alert("خطأ: " + error.message);
    }
    setSaving(false);
  };

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`هل تريد حذف تخصص "${name}"؟ التقارير المرتبطة به لن تُحذف.`)) return;
    const { error } = await supabase.from("specializations").delete().eq("id", id);
    if (!error) {
      fetchSpecs();
    } else {
      alert("خطأ: " + error.message);
    }
  };

  return (
    <div className="p-8 max-w-5xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-black text-slate-900 dark:text-white flex items-center gap-3">
          <Tags className="w-8 h-8 text-porto-pink dark:text-porto-cyan" />
          إدارة التخصصات
        </h1>
        <p className="text-slate-500 dark:text-slate-400 mt-1 font-medium">
          أضف وعدل تخصصات النادي وألوانها لتمييز التقارير بسهولة — {specs.length} تخصص حالياً
        </p>
      </div>

      {/* Add new specialization */}
      <div className="bg-white dark:bg-[#151D2F] rounded-2xl shadow-sm border border-slate-200 dark:border-[#222F49] p-6 mb-8 transition-colors duration-300">
        <h2 className="font-black text-slate-900 dark:text-white mb-4 text-lg">إضافة تخصص جديد</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <div>
            <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-1.5">
              اسم التخصص *
            </label>
            <input
              type="text"
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              placeholder="مثال: كرة القدم، السباحة، التنس، الإدارة..."
              className="w-full border border-slate-300 dark:border-slate-700 rounded-xl px-4 py-2.5 text-slate-800 dark:text-slate-100 bg-slate-50 dark:bg-[#1C263D] focus:outline-none focus:ring-2 focus:ring-porto-pink dark:focus:ring-porto-cyan text-sm"
              onKeyDown={(e) => e.key === "Enter" && handleAdd()}
            />
          </div>
          <div>
            <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-1.5">
              وصف التخصص (اختياري)
            </label>
            <input
              type="text"
              value={newDesc}
              onChange={(e) => setNewDesc(e.target.value)}
              placeholder="وصف موجز لنشاط أو قسم التخصص"
              className="w-full border border-slate-300 dark:border-slate-700 rounded-xl px-4 py-2.5 text-slate-800 dark:text-slate-100 bg-slate-50 dark:bg-[#1C263D] focus:outline-none focus:ring-2 focus:ring-porto-pink dark:focus:ring-porto-cyan text-sm"
            />
          </div>
        </div>

        <div className="mb-5">
          <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">
            اختر لوناً مميزاً
          </label>
          <div className="flex items-center gap-2.5 flex-wrap">
            {PRESET_COLORS.map((color) => (
              <button
                key={color}
                type="button"
                onClick={() => setNewColor(color)}
                className={`w-8 h-8 rounded-full border-2 transition-all ${
                  newColor === color
                    ? "border-slate-900 dark:border-white scale-125 shadow-md ring-2 ring-porto-pink/50"
                    : "border-transparent hover:scale-110"
                }`}
                style={{ backgroundColor: color }}
                title={color}
              />
            ))}
            <input
              type="color"
              value={newColor}
              onChange={(e) => setNewColor(e.target.value)}
              className="w-8 h-8 rounded-full cursor-pointer border border-slate-300 dark:border-slate-700"
              title="اختر لوناً مخصصاً"
            />
            <span
              className="text-xs font-bold px-3.5 py-1.5 rounded-full text-white shadow-sm mr-2"
              style={{ backgroundColor: newColor }}
            >
              معاينة: {newName || "التخصص"}
            </span>
          </div>
        </div>

        <button
          onClick={handleAdd}
          disabled={adding || !newName.trim()}
          className="flex items-center gap-2 bg-gradient-to-r from-porto-pink to-porto-pink-dark hover:from-porto-pink-light hover:to-porto-pink text-white font-black px-6 py-2.5 rounded-xl transition-all shadow-porto hover:scale-105 active:scale-95 disabled:opacity-60 disabled:cursor-not-allowed"
        >
          {adding ? (
            <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
          ) : (
            <PlusCircle className="w-4 h-4" />
          )}
          إضافة التخصص
        </button>
      </div>

      {/* List */}
      <div className="bg-white dark:bg-[#151D2F] rounded-2xl shadow-sm border border-slate-200 dark:border-[#222F49] overflow-hidden transition-colors duration-300">
        <div className="px-6 py-4 border-b-2 border-porto-cyan bg-slate-900 dark:bg-black">
          <h2 className="font-black text-white text-sm">قائمة التخصصات الحالية</h2>
        </div>

        {loading ? (
          <div className="p-10 text-center text-slate-500 font-medium">جارٍ التحميل...</div>
        ) : specs.length === 0 ? (
          <div className="p-10 text-center text-slate-500 font-medium">لا توجد تخصصات مضافة بعد. أضف أول تخصص أعلاه.</div>
        ) : (
          <div className="divide-y divide-slate-100 dark:divide-[#222F49]">
            {specs.map((spec) => (
              <div key={spec.id} className="px-6 py-4.5 hover:bg-slate-50 dark:hover:bg-[#1A243A] transition-colors">
                {editingId === spec.id ? (
                  <div className="space-y-3">
                    <div className="grid grid-cols-2 gap-3">
                      <input
                        value={editName}
                        onChange={(e) => setEditName(e.target.value)}
                        className="border border-porto-pink rounded-xl px-3.5 py-2 text-sm bg-white dark:bg-[#1C263D] text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-porto-pink"
                        autoFocus
                      />
                      <input
                        value={editDesc}
                        onChange={(e) => setEditDesc(e.target.value)}
                        placeholder="الوصف"
                        className="border border-slate-300 dark:border-slate-700 rounded-xl px-3.5 py-2 text-sm bg-white dark:bg-[#1C263D] text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-porto-pink"
                      />
                    </div>
                    <div className="flex items-center gap-2">
                      {PRESET_COLORS.map((color) => (
                        <button
                          key={color}
                          type="button"
                          onClick={() => setEditColor(color)}
                          className={`w-6 h-6 rounded-full border-2 transition-all ${
                            editColor === color ? "border-slate-900 dark:border-white scale-125" : "border-transparent"
                          }`}
                          style={{ backgroundColor: color }}
                        />
                      ))}
                      <input
                        type="color"
                        value={editColor}
                        onChange={(e) => setEditColor(e.target.value)}
                        className="w-6 h-6 rounded-full cursor-pointer"
                      />
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={handleSaveEdit}
                        disabled={saving}
                        className="flex items-center gap-1.5 bg-green-600 hover:bg-green-700 text-white text-xs font-bold px-3 py-1.5 rounded-lg transition-colors"
                      >
                        <Check className="w-3.5 h-3.5" />
                        حفظ التعديل
                      </button>
                      <button
                        onClick={() => setEditingId(null)}
                        className="flex items-center gap-1.5 bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300 text-xs font-bold px-3 py-1.5 rounded-lg transition-colors"
                      >
                        <X className="w-3.5 h-3.5" />
                        إلغاء
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div
                        className="w-4 h-4 rounded-full flex-shrink-0 shadow-sm"
                        style={{ backgroundColor: spec.color }}
                      />
                      <div>
                        <span
                          className="font-bold text-sm px-3 py-1 rounded-full border"
                          style={{
                            backgroundColor: `${spec.color}15`,
                            borderColor: `${spec.color}40`,
                            color: spec.color,
                          }}
                        >
                          {spec.name}
                        </span>
                        {spec.description && (
                          <span className="text-xs text-slate-500 dark:text-slate-400 mr-2.5">
                            {spec.description}
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <button
                        onClick={() => handleEdit(spec)}
                        className="p-2 text-slate-400 hover:text-porto-cyan transition-colors rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800"
                        title="تعديل"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(spec.id, spec.name)}
                        className="p-2 text-red-400 hover:text-red-600 transition-colors rounded-lg hover:bg-red-50 dark:hover:bg-red-950/40"
                        title="حذف"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
