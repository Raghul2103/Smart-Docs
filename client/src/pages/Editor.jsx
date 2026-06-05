import React, { useState, useEffect, useContext } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import UnderlineExtension from "@tiptap/extension-underline";
import { AuthContext } from "../context/AuthContext";
import api from "../services/api";
import ShareModal from "../components/ShareModal";
import {
  ArrowLeft,
  Save,
  Share2,
  Bold,
  Italic,
  Underline,
  List,
  ListOrdered,
  Undo,
  Redo,
  Loader2,
} from "lucide-react";
import { toast } from "react-toastify";

const Editor = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useContext(AuthContext);

  const [doc, setDoc] = useState(null);
  const [title, setTitle] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [hasSetContent, setHasSetContent] = useState(false);
  const [shareModalOpen, setShareModalOpen] = useState(false);

  const editor = useEditor({
    extensions: [StarterKit, UnderlineExtension],
    content: "",
  });

  useEffect(() => {
    const fetchDoc = async () => {
      try {
        setLoading(true);
        const { data } = await api.get(`/documents/${id}`);
        setDoc(data);
        setTitle(data.title);
      } catch (err) {
        console.error("Error loading document:", err);
        toast.error("Document not found or access denied.");
        navigate("/dashboard");
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchDoc();
    }
  }, [id, navigate]);

  useEffect(() => {
    if (doc && editor && !hasSetContent) {
      editor.commands.setContent(doc.content);
      setHasSetContent(true);
    }
  }, [doc, editor, hasSetContent]);

  useEffect(() => {
    return () => {
      if (editor) {
        editor.destroy();
      }
    };
  }, [editor]);

  if (loading || !editor) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-955 bg-slate-50 dark:bg-slate-950 flex flex-col items-center justify-center gap-3">
        <Loader2 className="w-8 h-8 animate-spin text-sky-500" />
        <p className="text-slate-505 dark:text-slate-400 text-sm">Loading document editor...</p>
      </div>
    );
  }

  const isOwner = doc.owner._id === user._id || doc.owner === user._id;

  const handleTitleBlur = async () => {
    if (!isOwner || title.trim() === doc.title) return;
    if (!title.trim()) {
      setTitle(doc.title);
      return;
    }
    try {
      const { data } = await api.put(`/documents/${id}`, { title });
      setDoc(data);
      toast.success("Document renamed successfully!");
    } catch (err) {
      toast.error("Failed to rename document.");
      setTitle(doc.title);
    }
  };

  const handleSave = async () => {
    if (!editor) return;
    setSaving(true);
    try {
      const contentHtml = editor.getHTML();
      const { data } = await api.put(`/documents/${id}`, {
        content: contentHtml,
      });
      setDoc(data);
      toast.success("Document saved successfully!");
    } catch (err) {
      toast.error("Failed to save document.");
    } finally {
      setSaving(false);
    }
  };

  const convertHtmlToMarkdown = (html) => {
    let md = html;
    // Convert Headings
    md = md.replace(/<h1>(.*?)<\/h1>/gi, "# $1\n\n");
    md = md.replace(/<h2>(.*?)<\/h2>/gi, "## $1\n\n");
    md = md.replace(/<h3>(.*?)<\/h3>/gi, "### $1\n\n");
    // Convert Paragraphs
    md = md.replace(/<p>(.*?)<\/p>/gi, "$1\n\n");
    // Convert Bold
    md = md.replace(/<strong>(.*?)<\/strong>/gi, "**$1**");
    md = md.replace(/<b>(.*?)<\/b>/gi, "**$1**");
    // Convert Italic
    md = md.replace(/<em>(.*?)<\/em>/gi, "*$1*");
    md = md.replace(/<i>(.*?)<\/i>/gi, "*$1*");
    // Convert Underline
    md = md.replace(/<u>(.*?)<\/u>/gi, "<u>$1</u>");
    // Convert Lists
    md = md.replace(/<li>(.*?)<\/li>/gi, "- $1\n");
    md = md.replace(/<ul>/gi, "\n");
    md = md.replace(/<\/ul>/gi, "\n");
    md = md.replace(/<ol>/gi, "\n");
    md = md.replace(/<\/ol>/gi, "\n");
    // Clean double linebreaks
    md = md.replace(/\n\s*\n\s*\n/gi, "\n\n");
    // Clean HTML tags
    md = md.replace(/<[^>]*>/g, "");
    // Decode HTML entities
    md = md.replace(/&amp;/g, "&").replace(/&lt;/g, "<").replace(/&gt;/g, ">");
    return md.trim();
  };

  const handleExportMarkdown = () => {
    if (!editor) return;
    const htmlContent = editor.getHTML();
    const markdown = convertHtmlToMarkdown(htmlContent);

    const element = document.createElement("a");
    const file = new Blob([markdown], { type: "text/markdown" });
    element.href = URL.createObjectURL(file);
    element.download = `${title || "document"}.md`;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
    toast.success("Document exported to Markdown!");
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex flex-col transition-colors duration-200">
      {/* Header Panel */}
      <header className="sticky top-0 z-40 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 px-4 sm:px-6 py-4 flex flex-col md:flex-row items-center justify-between gap-4 shadow-sm">
        <div className="flex items-center gap-3 w-full md:w-auto">
          <button
            onClick={() => navigate("/dashboard")}
            className="p-2 rounded-xl text-slate-505 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>

          <div className="flex-1 md:flex-initial">
            {isOwner ? (
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                onBlur={handleTitleBlur}
                className="bg-transparent border-b border-transparent hover:border-slate-300 dark:hover:border-slate-700 focus:border-sky-500 font-display font-bold text-lg text-slate-900 dark:text-white px-1 py-0.5 outline-none transition-all w-full max-w-xs sm:max-w-md"
                title="Click to rename"
              />
            ) : (
              <h2 className="font-display font-bold text-lg text-slate-800 dark:text-slate-300 px-1 py-0.5">
                {title}
              </h2>
            )}
            <div className="text-xs text-slate-400 dark:text-slate-505 px-1 mt-0.5">
              {isOwner ? (
                "Owned by you"
              ) : (
                <span>Shared by {doc.owner?.name || "another user"}</span>
              )}
            </div>
          </div>
        </div>

        {/* Buttons Panel */}
        <div className="flex items-center gap-3.5 w-full md:w-auto justify-end">
          <button
            onClick={handleExportMarkdown}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 hover:text-slate-955 dark:text-slate-200 dark:hover:text-white font-medium text-sm transition-all border border-slate-200 dark:border-slate-700 cursor-pointer"
          >
            <span>Export MD</span>
          </button>

          {isOwner && (
            <button
              onClick={() => setShareModalOpen(true)}
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 hover:text-slate-950 dark:text-slate-200 dark:hover:text-white font-medium text-sm transition-all border border-slate-200 dark:border-slate-700 cursor-pointer"
            >
              <Share2 className="w-4 h-4 text-sky-500 dark:text-sky-400" />
              <span>Share</span>
            </button>
          )}

          <button
            onClick={handleSave}
            disabled={saving}
            className="flex items-center gap-2 px-4.5 py-2 rounded-xl bg-sky-500 hover:bg-sky-600 text-white font-medium text-sm transition-all shadow-lg shadow-sky-500/10 hover:shadow-sky-500/20 disabled:bg-slate-200 dark:disabled:bg-slate-800 disabled:text-slate-400 dark:disabled:text-slate-500 cursor-pointer"
          >
            {saving ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Save className="w-4 h-4" />
            )}
            <span>Save Document</span>
          </button>
        </div>
      </header>

      {/* Editor Toolbar */}
      <div className="bg-slate-100/80 dark:bg-slate-900/60 border-b border-slate-200 dark:border-slate-900 px-4 sm:px-6 py-2.5 flex flex-wrap items-center gap-1.5 transition-colors duration-200">
        <button
          onClick={() => editor.chain().focus().toggleBold().run()}
          className={`p-2 rounded-lg transition-colors cursor-pointer ${
            editor.isActive("bold")
              ? "bg-sky-500/15 text-sky-600 dark:text-sky-400"
              : "text-slate-505 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white hover:bg-slate-200 dark:hover:bg-slate-800"
          }`}
          title="Bold"
        >
          <Bold className="w-4 h-4" />
        </button>

        <button
          onClick={() => editor.chain().focus().toggleItalic().run()}
          className={`p-2 rounded-lg transition-colors cursor-pointer ${
            editor.isActive("italic")
              ? "bg-sky-500/15 text-sky-600 dark:text-sky-400"
              : "text-slate-505 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white hover:bg-slate-200 dark:hover:bg-slate-800"
          }`}
          title="Italic"
        >
          <Italic className="w-4 h-4" />
        </button>

        <button
          onClick={() => editor.chain().focus().toggleUnderline().run()}
          className={`p-2 rounded-lg transition-colors cursor-pointer ${
            editor.isActive("underline")
              ? "bg-sky-500/15 text-sky-600 dark:text-sky-400"
              : "text-slate-505 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white hover:bg-slate-200 dark:hover:bg-slate-800"
          }`}
          title="Underline"
        >
          <Underline className="w-4 h-4" />
        </button>

        <div className="w-px h-5 bg-slate-300 dark:bg-slate-800 mx-1.5" />

        <button
          onClick={() =>
            editor.chain().focus().toggleHeading({ level: 1 }).run()
          }
          className={`px-2.5 py-1 text-xs font-bold font-display rounded-lg transition-colors cursor-pointer ${
            editor.isActive("heading", { level: 1 })
              ? "bg-sky-500/15 text-sky-600 dark:text-sky-400"
              : "text-slate-505 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white hover:bg-slate-200 dark:hover:bg-slate-800"
          }`}
          title="Heading 1"
        >
          H1
        </button>

        <button
          onClick={() =>
            editor.chain().focus().toggleHeading({ level: 2 }).run()
          }
          className={`px-2.5 py-1 text-xs font-bold font-display rounded-lg transition-colors cursor-pointer ${
            editor.isActive("heading", { level: 2 })
              ? "bg-sky-500/15 text-sky-600 dark:text-sky-400"
              : "text-slate-505 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white hover:bg-slate-200 dark:hover:bg-slate-800"
          }`}
          title="Heading 2"
        >
          H2
        </button>

        <div className="w-px h-5 bg-slate-300 dark:bg-slate-800 mx-1.5" />

        <button
          onClick={() => editor.chain().focus().toggleBulletList().run()}
          className={`p-2 rounded-lg transition-colors cursor-pointer ${
            editor.isActive("bulletList")
              ? "bg-sky-500/15 text-sky-600 dark:text-sky-400"
              : "text-slate-505 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white hover:bg-slate-200 dark:hover:bg-slate-800"
          }`}
          title="Bullet List"
        >
          <List className="w-4 h-4" />
        </button>

        <button
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
          className={`p-2 rounded-lg transition-colors cursor-pointer ${
            editor.isActive("orderedList")
              ? "bg-sky-500/15 text-sky-600 dark:text-sky-400"
              : "text-slate-505 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white hover:bg-slate-200 dark:hover:bg-slate-800"
          }`}
          title="Numbered List"
        >
          <ListOrdered className="w-4 h-4" />
        </button>

        <div className="w-px h-5 bg-slate-300 dark:bg-slate-800 mx-1.5" />

        <button
          onClick={() => editor.chain().focus().undo().run()}
          disabled={!editor.can().undo()}
          className="p-2 rounded-lg text-slate-505 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-200 dark:hover:bg-slate-800 disabled:opacity-30 disabled:hover:bg-transparent transition-colors cursor-pointer"
          title="Undo"
        >
          <Undo className="w-4 h-4" />
        </button>

        <button
          onClick={() => editor.chain().focus().redo().run()}
          disabled={!editor.can().redo()}
          className="p-2 rounded-lg text-slate-505 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-200 dark:hover:bg-slate-800 disabled:opacity-30 disabled:hover:bg-transparent transition-colors cursor-pointer"
          title="Redo"
        >
          <Redo className="w-4 h-4" />
        </button>
      </div>

      {/* Editor Content Canvas */}
      <div className="flex-1 bg-slate-100 dark:bg-slate-950 overflow-y-auto px-4 sm:px-6 py-6 sm:py-8 flex justify-center transition-colors duration-200">
        <div className="w-full max-w-4xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-900/60 rounded-3xl p-5 sm:p-8 shadow-sm dark:shadow-xl min-h-[400px]">
          <EditorContent editor={editor} />
        </div>
      </div>

      <ShareModal
        isOpen={shareModalOpen}
        onClose={() => setShareModalOpen(false)}
        documentId={id}
      />
    </div>
  );
};

export default Editor;
