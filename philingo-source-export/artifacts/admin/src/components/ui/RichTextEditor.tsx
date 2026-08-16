import React, { useEffect, useRef, useCallback, useState } from 'react';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import ImageExt from '@tiptap/extension-image';
import Placeholder from '@tiptap/extension-placeholder';
import UnderlineExt from '@tiptap/extension-underline';
import TextAlign from '@tiptap/extension-text-align';
import imageCompression from 'browser-image-compression';
import {
  Bold, Italic, Underline, List, ListOrdered,
  Heading1, Heading2, Heading3, AlignLeft, AlignCenter, AlignRight,
  Image, Minus, Loader2, Undo, Redo,
} from 'lucide-react';

// ── Upload helper ─────────────────────────────────────────────────────────────
async function uploadImageFile(file: File): Promise<string | null> {
  try {
    let uploadFile: File = file;
    try {
      const compressed = await imageCompression(file, {
        maxSizeMB: 0.8, maxWidthOrHeight: 1920, useWebWorker: true, fileType: 'image/webp',
      });
      const base = file.name.replace(/\.[^.]+$/, '');
      uploadFile = new File([compressed], `${base}.webp`, { type: 'image/webp' });
    } catch { /* fallback to original */ }

    const token = localStorage.getItem('philingo_admin_token') ?? '';
    const metaRes = await fetch('/api/storage/uploads/request-url', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify({
        name: uploadFile.name, size: uploadFile.size,
        contentType: uploadFile.type, category: 'other',
      }),
    });
    if (!metaRes.ok) return null;
    const { uploadURL, objectPath } = await metaRes.json();
    const putRes = await fetch(uploadURL, {
      method: 'PUT', headers: { 'Content-Type': uploadFile.type }, body: uploadFile,
    });
    if (!putRes.ok) return null;
    return '/api/storage' + objectPath;
  } catch {
    return null;
  }
}

// ── Convert plain text / light-markdown → HTML so TipTap can parse it ────────
export function plainTextToHtml(text: string): string {
  if (!text) return '';
  if (/<(p|h[1-6]|ul|ol|div|img|br)\b/i.test(text)) return text; // already HTML
  const lines = text.replace(/\r\n/g, '\n').replace(/\r/g, '\n').split('\n');
  const out: string[] = [];
  let inUl = false;
  for (const raw of lines) {
    const inline = (s: string) =>
      s.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
       .replace(/\*(.+?)\*/g, '<em>$1</em>');
    if (/^#{1,2} /.test(raw)) {
      if (inUl) { out.push('</ul>'); inUl = false; }
      out.push(`<h2>${inline(raw.replace(/^#{1,2} /, ''))}</h2>`);
    } else if (/^### /.test(raw)) {
      if (inUl) { out.push('</ul>'); inUl = false; }
      out.push(`<h3>${inline(raw.replace(/^### /, ''))}</h3>`);
    } else if (/^[-*] /.test(raw)) {
      if (!inUl) { out.push('<ul>'); inUl = true; }
      out.push(`<li>${inline(raw.replace(/^[-*] /, ''))}</li>`);
    } else if (/^---+$/.test(raw.trim())) {
      if (inUl) { out.push('</ul>'); inUl = false; }
      out.push('<hr/>');
    } else if (!raw.trim()) {
      if (inUl) { out.push('</ul>'); inUl = false; }
      out.push('<p></p>');
    } else {
      if (inUl) { out.push('</ul>'); inUl = false; }
      out.push(`<p>${inline(raw)}</p>`);
    }
  }
  if (inUl) out.push('</ul>');
  return out.join('');
}

// ── Toolbar button ────────────────────────────────────────────────────────────
function ToolBtn({
  active = false, onClick, title, children, disabled = false,
}: { active?: boolean; onClick: () => void; title: string; children: React.ReactNode; disabled?: boolean }) {
  return (
    <button
      type="button"
      title={title}
      disabled={disabled}
      onMouseDown={e => { e.preventDefault(); onClick(); }}
      className={`p-1.5 rounded text-sm transition-colors ${
        active ? 'bg-blue-600 text-white' : 'text-gray-600 hover:bg-gray-100'
      } disabled:opacity-30`}
    >
      {children}
    </button>
  );
}

// ── Main component ────────────────────────────────────────────────────────────
interface RichTextEditorProps {
  value: string;
  onChange: (html: string) => void;
  placeholder?: string;
  minHeight?: number;
}

export function RichTextEditor({ value, onChange, placeholder, minHeight = 400 }: RichTextEditorProps) {
  const [uploading, setUploading] = useState(false);
  const [uploadErr, setUploadErr] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);
  // Track whether the last change came from within the editor (avoid infinite loop)
  const isInternalChange = useRef(false);

  // ── Upload and insert image ────────────────────────────────────────────────
  const insertImageFile = useCallback(async (file: File, editorRef: ReturnType<typeof useEditor>) => {
    if (!file.type.startsWith('image/')) return;
    setUploading(true);
    setUploadErr('');
    const url = await uploadImageFile(file);
    setUploading(false);
    if (url) {
      editorRef?.chain().focus().setImage({ src: url, alt: file.name }).run();
    } else {
      setUploadErr('อัปโหลดรูปไม่สำเร็จ');
      setTimeout(() => setUploadErr(''), 3000);
    }
  }, []);

  const editor = useEditor({
    extensions: [
      StarterKit.configure({ heading: { levels: [1, 2, 3] } }),
      ImageExt.configure({ inline: false, allowBase64: false }),
      UnderlineExt,
      TextAlign.configure({ types: ['heading', 'paragraph'] }),
      Placeholder.configure({ placeholder: placeholder ?? 'เขียนเนื้อหาบทความที่นี่...' }),
    ],
    content: plainTextToHtml(value),
    onUpdate: ({ editor }) => {
      isInternalChange.current = true;
      onChange(editor.getHTML());
    },
    editorProps: {
      attributes: { class: 'outline-none' },
      // Drag-drop images from desktop
      handleDrop: (view, event) => {
        const files = event.dataTransfer?.files;
        if (!files || files.length === 0) return false;
        const imageFiles = Array.from(files).filter(f => f.type.startsWith('image/'));
        if (imageFiles.length === 0) return false;
        event.preventDefault();
        imageFiles.forEach(f => insertImageFile(f, editor));
        return true;
      },
      // Paste images from clipboard
      handlePaste: (view, event) => {
        const items = event.clipboardData?.items;
        if (!items) return false;
        const imageItems = Array.from(items).filter(i => i.type.startsWith('image/'));
        if (imageItems.length === 0) return false;
        event.preventDefault();
        imageItems.forEach(item => {
          const file = item.getAsFile();
          if (file) insertImageFile(file, editor);
        });
        return true;
      },
    },
  });

  // Sync value coming from OUTSIDE (e.g. AI generation) into the editor
  useEffect(() => {
    if (!editor) return;
    if (isInternalChange.current) {
      isInternalChange.current = false;
      return;
    }
    const incoming = plainTextToHtml(value);
    // Only update if content actually differs (avoid cursor-jump on every keystroke)
    if (incoming !== editor.getHTML()) {
      editor.commands.setContent(incoming, false);
    }
  }, [value, editor]);

  // ── File picker upload ─────────────────────────────────────────────────────
  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || !editor) return;
    Array.from(files).forEach(f => insertImageFile(f, editor));
    e.target.value = '';
  };

  if (!editor) return null;

  const tb = editor; // shorthand

  return (
    <div className="border border-gray-300 rounded-xl overflow-hidden focus-within:ring-2 focus-within:ring-blue-400 focus-within:border-blue-400 transition-colors">
      {/* ── Toolbar ── */}
      <div className="flex flex-wrap items-center gap-0.5 px-2 py-1.5 border-b border-gray-200 bg-gray-50">
        {/* History */}
        <ToolBtn title="Undo" onClick={() => tb.chain().focus().undo().run()} disabled={!tb.can().undo()}>
          <Undo className="w-4 h-4" />
        </ToolBtn>
        <ToolBtn title="Redo" onClick={() => tb.chain().focus().redo().run()} disabled={!tb.can().redo()}>
          <Redo className="w-4 h-4" />
        </ToolBtn>

        <span className="w-px h-5 bg-gray-200 mx-1" />

        {/* Headings */}
        <ToolBtn title="หัวข้อใหญ่ (H1)" active={tb.isActive('heading', { level: 1 })}
          onClick={() => tb.chain().focus().toggleHeading({ level: 1 }).run()}>
          <Heading1 className="w-4 h-4" />
        </ToolBtn>
        <ToolBtn title="หัวข้อกลาง (H2)" active={tb.isActive('heading', { level: 2 })}
          onClick={() => tb.chain().focus().toggleHeading({ level: 2 }).run()}>
          <Heading2 className="w-4 h-4" />
        </ToolBtn>
        <ToolBtn title="หัวข้อเล็ก (H3)" active={tb.isActive('heading', { level: 3 })}
          onClick={() => tb.chain().focus().toggleHeading({ level: 3 }).run()}>
          <Heading3 className="w-4 h-4" />
        </ToolBtn>

        <span className="w-px h-5 bg-gray-200 mx-1" />

        {/* Inline styles */}
        <ToolBtn title="ตัวหนา" active={tb.isActive('bold')}
          onClick={() => tb.chain().focus().toggleBold().run()}>
          <Bold className="w-4 h-4" />
        </ToolBtn>
        <ToolBtn title="ตัวเอียง" active={tb.isActive('italic')}
          onClick={() => tb.chain().focus().toggleItalic().run()}>
          <Italic className="w-4 h-4" />
        </ToolBtn>
        <ToolBtn title="ขีดเส้นใต้" active={tb.isActive('underline')}
          onClick={() => tb.chain().focus().toggleUnderline().run()}>
          <Underline className="w-4 h-4" />
        </ToolBtn>

        <span className="w-px h-5 bg-gray-200 mx-1" />

        {/* Lists */}
        <ToolBtn title="รายการหัวข้อ" active={tb.isActive('bulletList')}
          onClick={() => tb.chain().focus().toggleBulletList().run()}>
          <List className="w-4 h-4" />
        </ToolBtn>
        <ToolBtn title="รายการตัวเลข" active={tb.isActive('orderedList')}
          onClick={() => tb.chain().focus().toggleOrderedList().run()}>
          <ListOrdered className="w-4 h-4" />
        </ToolBtn>

        <span className="w-px h-5 bg-gray-200 mx-1" />

        {/* Alignment */}
        <ToolBtn title="ชิดซ้าย" active={tb.isActive({ textAlign: 'left' })}
          onClick={() => tb.chain().focus().setTextAlign('left').run()}>
          <AlignLeft className="w-4 h-4" />
        </ToolBtn>
        <ToolBtn title="กึ่งกลาง" active={tb.isActive({ textAlign: 'center' })}
          onClick={() => tb.chain().focus().setTextAlign('center').run()}>
          <AlignCenter className="w-4 h-4" />
        </ToolBtn>
        <ToolBtn title="ชิดขวา" active={tb.isActive({ textAlign: 'right' })}
          onClick={() => tb.chain().focus().setTextAlign('right').run()}>
          <AlignRight className="w-4 h-4" />
        </ToolBtn>

        <span className="w-px h-5 bg-gray-200 mx-1" />

        {/* Divider */}
        <ToolBtn title="เส้นแบ่ง" onClick={() => tb.chain().focus().setHorizontalRule().run()}>
          <Minus className="w-4 h-4" />
        </ToolBtn>

        <span className="w-px h-5 bg-gray-200 mx-1" />

        {/* Image upload */}
        <label
          title="แทรกรูปภาพ (หรือลากวางรูปในเนื้อหาได้เลย)"
          className={`p-1.5 rounded cursor-pointer transition-colors flex items-center gap-1 text-xs font-medium
            ${uploading ? 'text-blue-400' : 'text-gray-600 hover:bg-gray-100'}`}
        >
          {uploading ? (
            <><Loader2 className="w-4 h-4 animate-spin" /> กำลังอัปโหลด...</>
          ) : (
            <><Image className="w-4 h-4" /> แทรกรูป</>
          )}
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            multiple
            className="hidden"
            onChange={handleFileInputChange}
          />
        </label>

        {uploadErr && <span className="text-xs text-red-500 ml-1">{uploadErr}</span>}

        <span className="ml-auto text-xs text-gray-400 pr-1">
          ลากรูปวางในเนื้อหาได้เลย · Ctrl+V วางรูปจาก clipboard
        </span>
      </div>

      {/* ── Editor area ── */}
      <EditorContent
        editor={editor}
        className="px-4 py-3 text-sm text-gray-800 leading-relaxed
          [&_.ProseMirror]:outline-none
          [&_.ProseMirror_p]:mb-3
          [&_.ProseMirror_h1]:text-2xl [&_.ProseMirror_h1]:font-bold [&_.ProseMirror_h1]:mb-3 [&_.ProseMirror_h1]:mt-4
          [&_.ProseMirror_h2]:text-xl [&_.ProseMirror_h2]:font-bold [&_.ProseMirror_h2]:mb-2 [&_.ProseMirror_h2]:mt-4
          [&_.ProseMirror_h3]:text-lg [&_.ProseMirror_h3]:font-semibold [&_.ProseMirror_h3]:mb-2 [&_.ProseMirror_h3]:mt-3
          [&_.ProseMirror_ul]:list-disc [&_.ProseMirror_ul]:pl-5 [&_.ProseMirror_ul]:mb-3
          [&_.ProseMirror_ol]:list-decimal [&_.ProseMirror_ol]:pl-5 [&_.ProseMirror_ol]:mb-3
          [&_.ProseMirror_li]:mb-1
          [&_.ProseMirror_hr]:border-gray-300 [&_.ProseMirror_hr]:my-4
          [&_.ProseMirror_img]:max-w-full [&_.ProseMirror_img]:rounded-lg [&_.ProseMirror_img]:my-3 [&_.ProseMirror_img]:shadow-sm [&_.ProseMirror_img]:cursor-pointer
          [&_.ProseMirror_img.ProseMirror-selectednode]:ring-2 [&_.ProseMirror_img.ProseMirror-selectednode]:ring-blue-400
          [&_.ProseMirror_blockquote]:border-l-4 [&_.ProseMirror_blockquote]:border-blue-300 [&_.ProseMirror_blockquote]:pl-4 [&_.ProseMirror_blockquote]:italic [&_.ProseMirror_blockquote]:text-gray-600 [&_.ProseMirror_blockquote]:my-3
          [&_.ProseMirror_.is-editor-empty:first-child::before]:content-[attr(data-placeholder)] [&_.ProseMirror_.is-editor-empty:first-child::before]:text-gray-400 [&_.ProseMirror_.is-editor-empty:first-child::before]:pointer-events-none [&_.ProseMirror_.is-editor-empty:first-child::before]:float-left [&_.ProseMirror_.is-editor-empty:first-child::before]:h-0"
        style={{ minHeight }}
      />

      {/* Drop zone hint overlay — only visible when content is empty */}
      <div className="px-4 pb-2 text-center text-xs text-gray-300 select-none">
        🖼 ลากไฟล์รูปมาวางที่ใดก็ได้ในเนื้อหา
      </div>
    </div>
  );
}
