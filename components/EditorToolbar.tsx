"use client";

import { Editor } from "@tiptap/react";
import {
  Bold,
  Italic,
  Underline,
  Strikethrough,
  Heading1,
  Heading2,
  Heading3,
  List,
  ListOrdered,
  AlignRight,
  AlignCenter,
  AlignLeft,
  AlignJustify,
  Image,
  Link,
  Table,
  Quote,
  Undo,
  Redo,
  Highlighter,
  Palette,
} from "lucide-react";
import { useRef } from "react";
import { cn } from "@/lib/utils";

interface EditorToolbarProps {
  editor: Editor;
  onImageUpload: (file: File) => void;
}

function ToolbarButton({
  onClick,
  isActive,
  disabled,
  title,
  children,
}: {
  onClick: () => void;
  isActive?: boolean;
  disabled?: boolean;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      title={title}
      className={cn(
        "p-2 rounded-xl transition-all duration-150 flex items-center justify-center",
        isActive
          ? "bg-gradient-to-r from-porto-pink to-porto-pink-dark text-white shadow-sm"
          : "text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-porto-pink dark:hover:text-porto-cyan",
        disabled && "opacity-40 cursor-not-allowed"
      )}
    >
      {children}
    </button>
  );
}

function ToolbarDivider() {
  return <div className="w-px h-6 bg-slate-200 dark:bg-slate-700 mx-1" />;
}

export default function EditorToolbar({ editor, onImageUpload }: EditorToolbarProps) {
  const imageInputRef = useRef<HTMLInputElement>(null);

  const setLink = () => {
    const url = window.prompt("أدخل الرابط (URL):");
    if (!url) return;
    if (url === "") {
      editor.chain().focus().extendMarkRange("link").unsetLink().run();
      return;
    }
    editor.chain().focus().extendMarkRange("link").setLink({ href: url }).run();
  };

  const addTable = () => {
    editor.chain().focus().insertTable({ rows: 3, cols: 3, withHeaderRow: true }).run();
  };

  return (
    <div className="border-b border-slate-200 dark:border-[#222F49] bg-white dark:bg-[#151D2F] px-3.5 py-2.5 flex items-center flex-wrap gap-1 transition-colors duration-300">
      {/* History */}
      <ToolbarButton
        onClick={() => editor.chain().focus().undo().run()}
        disabled={!editor.can().undo()}
        title="تراجع"
      >
        <Undo className="w-4 h-4" />
      </ToolbarButton>
      <ToolbarButton
        onClick={() => editor.chain().focus().redo().run()}
        disabled={!editor.can().redo()}
        title="إعادة"
      >
        <Redo className="w-4 h-4" />
      </ToolbarButton>

      <ToolbarDivider />

      {/* Headings */}
      <ToolbarButton
        onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
        isActive={editor.isActive("heading", { level: 1 })}
        title="عنوان 1"
      >
        <Heading1 className="w-4 h-4" />
      </ToolbarButton>
      <ToolbarButton
        onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
        isActive={editor.isActive("heading", { level: 2 })}
        title="عنوان 2"
      >
        <Heading2 className="w-4 h-4" />
      </ToolbarButton>
      <ToolbarButton
        onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
        isActive={editor.isActive("heading", { level: 3 })}
        title="عنوان 3"
      >
        <Heading3 className="w-4 h-4" />
      </ToolbarButton>

      <ToolbarDivider />

      {/* Text formatting */}
      <ToolbarButton
        onClick={() => editor.chain().focus().toggleBold().run()}
        isActive={editor.isActive("bold")}
        title="خط عريض"
      >
        <Bold className="w-4 h-4" />
      </ToolbarButton>
      <ToolbarButton
        onClick={() => editor.chain().focus().toggleItalic().run()}
        isActive={editor.isActive("italic")}
        title="خط مائل"
      >
        <Italic className="w-4 h-4" />
      </ToolbarButton>
      <ToolbarButton
        onClick={() => editor.chain().focus().toggleUnderline().run()}
        isActive={editor.isActive("underline")}
        title="خط تحته"
      >
        <Underline className="w-4 h-4" />
      </ToolbarButton>
      <ToolbarButton
        onClick={() => editor.chain().focus().toggleStrike().run()}
        isActive={editor.isActive("strike")}
        title="خط في المنتصف"
      >
        <Strikethrough className="w-4 h-4" />
      </ToolbarButton>
      <ToolbarButton
        onClick={() => editor.chain().focus().toggleHighlight({ color: "#FFE500" }).run()}
        isActive={editor.isActive("highlight")}
        title="تظليل بالأصفر"
      >
        <Highlighter className="w-4 h-4" />
      </ToolbarButton>

      {/* Text Color Dropdown */}
      <div className="relative group" title="لون النص">
        <button
          type="button"
          className="p-2 rounded-xl text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-porto-pink transition-all flex items-center"
        >
          <Palette className="w-4 h-4" />
        </button>
        <div className="absolute top-full right-0 mt-1 bg-white dark:bg-[#1C263D] border border-slate-200 dark:border-slate-700 rounded-2xl shadow-xl p-2.5 hidden group-hover:flex flex-wrap gap-1.5 w-36 z-50 animate-fade-in">
          {["#E4007C", "#00AEEF", "#FFE500", "#DC2626", "#16A34A", "#9333EA", "#000000", "#FFFFFF", "#64748B"].map((color) => (
            <button
              key={color}
              type="button"
              title={color}
              onClick={() => editor.chain().focus().setColor(color).run()}
              className="w-6 h-6 rounded-full border-2 border-white dark:border-slate-800 hover:scale-125 transition-all shadow-sm"
              style={{ backgroundColor: color }}
            />
          ))}
          <button
            type="button"
            onClick={() => editor.chain().focus().unsetColor().run()}
            className="text-xs text-slate-500 hover:text-red-500 w-full text-center mt-1.5 font-bold"
          >
            إزالة اللون
          </button>
        </div>
      </div>

      <ToolbarDivider />

      {/* Lists */}
      <ToolbarButton
        onClick={() => editor.chain().focus().toggleBulletList().run()}
        isActive={editor.isActive("bulletList")}
        title="قائمة نقطية"
      >
        <List className="w-4 h-4" />
      </ToolbarButton>
      <ToolbarButton
        onClick={() => editor.chain().focus().toggleOrderedList().run()}
        isActive={editor.isActive("orderedList")}
        title="قائمة مرقمة"
      >
        <ListOrdered className="w-4 h-4" />
      </ToolbarButton>
      <ToolbarButton
        onClick={() => editor.chain().focus().toggleBlockquote().run()}
        isActive={editor.isActive("blockquote")}
        title="اقتباس"
      >
        <Quote className="w-4 h-4" />
      </ToolbarButton>

      <ToolbarDivider />

      {/* Text Alignment */}
      <ToolbarButton
        onClick={() => editor.chain().focus().setTextAlign("right").run()}
        isActive={editor.isActive({ textAlign: "right" })}
        title="محاذاة يمين"
      >
        <AlignRight className="w-4 h-4" />
      </ToolbarButton>
      <ToolbarButton
        onClick={() => editor.chain().focus().setTextAlign("center").run()}
        isActive={editor.isActive({ textAlign: "center" })}
        title="توسيط"
      >
        <AlignCenter className="w-4 h-4" />
      </ToolbarButton>
      <ToolbarButton
        onClick={() => editor.chain().focus().setTextAlign("left").run()}
        isActive={editor.isActive({ textAlign: "left" })}
        title="محاذاة يسار"
      >
        <AlignLeft className="w-4 h-4" />
      </ToolbarButton>
      <ToolbarButton
        onClick={() => editor.chain().focus().setTextAlign("justify").run()}
        isActive={editor.isActive({ textAlign: "justify" })}
        title="ضبط"
      >
        <AlignJustify className="w-4 h-4" />
      </ToolbarButton>

      <ToolbarDivider />

      {/* Media & Table */}
      <ToolbarButton
        onClick={() => imageInputRef.current?.click()}
        title="إدراج صورة من جهازك"
      >
        <Image className="w-4 h-4 text-porto-cyan" />
      </ToolbarButton>
      <input
        ref={imageInputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) onImageUpload(file);
          e.target.value = "";
        }}
      />

      <ToolbarButton
        onClick={setLink}
        isActive={editor.isActive("link")}
        title="إدراج رابط"
      >
        <Link className="w-4 h-4" />
      </ToolbarButton>

      <ToolbarButton
        onClick={addTable}
        title="إدراج جدول"
      >
        <Table className="w-4 h-4" />
      </ToolbarButton>

      {/* Table controls */}
      {editor.isActive("table") && (
        <>
          <ToolbarDivider />
          <button
            type="button"
            onClick={() => editor.chain().focus().addColumnBefore().run()}
            title="إضافة عمود قبل"
            className="px-2.5 py-1 text-xs font-bold text-porto-cyan hover:bg-porto-cyan/15 rounded-lg transition-colors"
          >
            + عمود
          </button>
          <button
            type="button"
            onClick={() => editor.chain().focus().addRowBefore().run()}
            title="إضافة صف قبل"
            className="px-2.5 py-1 text-xs font-bold text-porto-cyan hover:bg-porto-cyan/15 rounded-lg transition-colors"
          >
            + صف
          </button>
          <button
            type="button"
            onClick={() => editor.chain().focus().deleteColumn().run()}
            title="حذف العمود"
            className="px-2.5 py-1 text-xs font-bold text-red-500 hover:bg-red-50 dark:hover:bg-red-950/40 rounded-lg transition-colors"
          >
            - عمود
          </button>
          <button
            type="button"
            onClick={() => editor.chain().focus().deleteRow().run()}
            title="حذف الصف"
            className="px-2.5 py-1 text-xs font-bold text-red-500 hover:bg-red-50 dark:hover:bg-red-950/40 rounded-lg transition-colors"
          >
            - صف
          </button>
        </>
      )}
    </div>
  );
}
