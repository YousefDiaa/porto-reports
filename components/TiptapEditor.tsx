"use client";

import { useCallback, useEffect } from "react";
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Image from "@tiptap/extension-image";
import Link from "@tiptap/extension-link";
import { Table } from "@tiptap/extension-table";
import TableRow from "@tiptap/extension-table-row";
import TableCell from "@tiptap/extension-table-cell";
import TableHeader from "@tiptap/extension-table-header";
import TextAlign from "@tiptap/extension-text-align";
import Underline from "@tiptap/extension-underline";
import Color from "@tiptap/extension-color";
import Highlight from "@tiptap/extension-highlight";
import Placeholder from "@tiptap/extension-placeholder";
import CharacterCount from "@tiptap/extension-character-count";
import { TextStyle } from "@tiptap/extension-text-style";
import EditorToolbar from "./EditorToolbar";

interface TiptapEditorProps {
  content: object | string;
  onChange: (json: object, html: string) => void;
  placeholder?: string;
}

export default function TiptapEditor({ content, onChange, placeholder }: TiptapEditorProps) {
  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        bulletList: { keepMarks: true },
        orderedList: { keepMarks: true },
      }),
      Image.configure({ HTMLAttributes: { class: "editor-image" } }),
      Link.configure({
        openOnClick: false,
        HTMLAttributes: { class: "editor-link", target: "_blank", rel: "noopener noreferrer" },
      }),
      Table.configure({ resizable: true }),
      TableRow,
      TableCell,
      TableHeader,
      TextAlign.configure({ types: ["heading", "paragraph"], defaultAlignment: "right" }),
      Underline,
      TextStyle,
      Color,
      Highlight.configure({ multicolor: true }),
      Placeholder.configure({ placeholder: placeholder || "اكتب محتوى التقرير هنا..." }),
      CharacterCount,
    ],
    content: content as any,
    editorProps: {
      attributes: {
        class: "tiptap-editor focus:outline-none",
        dir: "rtl",
      },
    },
    onCreate: ({ editor }) => {
      onChange(editor.getJSON(), editor.getHTML());
    },
    onUpdate: ({ editor }) => {
      onChange(editor.getJSON(), editor.getHTML());
    },
    immediatelyRender: false,
  });

  // Sync content if editor was empty when mounted
  useEffect(() => {
    if (editor && content) {
      if (editor.isEmpty) {
        editor.commands.setContent(content);
      }
    }
  }, [editor, content]);

  const handleImageUpload = useCallback(
    async (file: File) => {
      if (!editor) return;

      const formData = new FormData();
      formData.append("file", file);

      try {
        const res = await fetch("/api/upload", { method: "POST", body: formData });
        const data = await res.json();
        if (data.url) {
          editor.chain().focus().setImage({ src: data.url }).run();
        }
      } catch (error) {
        console.error("Image upload failed:", error);
        alert("فشل رفع الصورة. تأكد من إعدادات Cloudinary.");
      }
    },
    [editor]
  );

  if (!editor) return null;

  const wordCount = editor.storage.characterCount?.words() || 0;
  const charCount = editor.storage.characterCount?.characters() || 0;

  return (
    <div className="border border-slate-200 dark:border-[#222F49] rounded-2xl overflow-hidden bg-white dark:bg-[#151D2F] shadow-sm transition-colors duration-300">
      <EditorToolbar editor={editor} onImageUpload={handleImageUpload} />
      <div className="min-h-[320px] sm:min-h-[450px] max-h-[700px] overflow-y-auto">
        <EditorContent editor={editor} />
      </div>
      <div className="border-t border-slate-200 dark:border-[#222F49] px-3.5 sm:px-4 py-2 sm:py-2.5 flex items-center justify-between sm:justify-end gap-3 sm:gap-4 text-[11px] sm:text-xs font-bold text-slate-500 dark:text-slate-400 bg-slate-50 dark:bg-[#101726]">
        <span>{wordCount} كلمة</span>
        <span>{charCount} حرف</span>
      </div>
    </div>
  );
}
