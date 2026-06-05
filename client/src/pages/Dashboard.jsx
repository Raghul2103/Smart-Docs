import React, { useState, useEffect, useContext } from "react";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";
import api from "../services/api";
import Navbar from "../components/Navbar";
import ShareModal from "../components/ShareModal";
import DeleteConfirmationModal from "../components/DeleteConfirmationModal";
import {
  Plus,
  Search,
  FileText,
  Share2,
  Trash2,
  ExternalLink,
  FileUp,
  Loader2,
  Clock,
  User as UserIcon,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { toast } from "react-toastify";

const Dashboard = () => {
  const [myDocuments, setMyDocuments] = useState([]);
  const [sharedDocuments, setSharedDocuments] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);

  // Pagination states
  const [myPage, setMyPage] = useState(1);
  const [sharedPage, setSharedPage] = useState(1);
  const [myTotalPages, setMyTotalPages] = useState(1);
  const [sharedTotalPages, setSharedTotalPages] = useState(1);

  // File Upload states
  const [uploading, setUploading] = useState(false);

  // Modals state
  const [shareDocId, setShareDocId] = useState(null);
  const [deleteDoc, setDeleteDoc] = useState(null);

  const navigate = useNavigate();

  const fetchDocuments = async (query = searchQuery, mPage = myPage, sPage = sharedPage) => {
    try {
      setLoading(true);
      const { data } = await api.get(
        `/documents?search=${query}&myPage=${mPage}&sharedPage=${sPage}&limit=6`
      );
      setMyDocuments(data.myDocuments || []);
      setSharedDocuments(data.sharedDocuments || []);
      setMyTotalPages(data.myTotalPages || 1);
      setSharedTotalPages(data.sharedTotalPages || 1);
    } catch (err) {
      console.error("Error fetching documents:", err);
      toast.error("Failed to load documents.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDocuments(searchQuery, myPage, sharedPage);
  }, [myPage, sharedPage]);

  const handleSearch = (e) => {
    const val = e.target.value;
    setSearchQuery(val);
    setMyPage(1);
    setSharedPage(1);
    fetchDocuments(val, 1, 1);
  };

  const handleCreateDocument = async () => {
    try {
      setCreating(true);
      const { data } = await api.post("/documents", {});
      toast.success("Document created!");
      navigate(`/documents/${data._id}`);
    } catch (err) {
      console.error("Error creating document:", err);
      toast.error("Failed to create document.");
      setCreating(false);
    }
  };

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const ext = file.name.split(".").pop().toLowerCase();
    if (!["txt", "md", "docx"].includes(ext)) {
      toast.warning("Unsupported file type. Please upload a .txt, .md, or .docx file.");
      return;
    }

    setUploading(true);
    const formData = new FormData();
    formData.append("file", file);

    try {
      const { data } = await api.post("/upload", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
      toast.success("File imported successfully!");
      navigate(`/documents/${data._id}`);
    } catch (err) {
      toast.error(err.response?.data?.message || "File upload failed.");
      setUploading(false);
    }
  };

  const handleDeleteConfirm = async () => {
    if (!deleteDoc) return;
    try {
      await api.delete(`/documents/${deleteDoc._id}`);
      toast.success("Document deleted.");
      // Reload current page. If deletion makes current page empty, go back a page.
      const updatedDocs = myDocuments.filter((d) => d._id !== deleteDoc._id);
      if (updatedDocs.length === 0 && myPage > 1) {
        setMyPage((prev) => prev - 1);
      } else {
        fetchDocuments(searchQuery, myPage, sharedPage);
      }
      setDeleteDoc(null);
    } catch (err) {
      console.error("Error deleting document:", err);
      toast.error("Failed to delete document.");
    }
  };

  const formatDate = (dateString) => {
    const options = {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    };
    return new Date(dateString).toLocaleDateString("en-US", options);
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 pb-12 transition-colors duration-200">
      <Navbar />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 mt-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-6 border-b border-slate-200 dark:border-slate-900">
          <div>
            <h1 className="font-display font-bold text-3xl text-slate-900 dark:text-white">
              Documents
            </h1>
            <p className="text-slate-505 dark:text-slate-400 text-sm mt-1">
              Create, import and manage your rich text files
            </p>
          </div>

          <div className="flex items-center flex-wrap gap-3.5">
            <label className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 bg-white hover:bg-slate-100 dark:bg-slate-900/50 dark:hover:bg-slate-900 text-slate-700 hover:text-slate-950 dark:text-slate-300 dark:hover:text-white cursor-pointer transition-all text-sm font-medium shadow-sm">
              {uploading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin text-sky-500" />
                  <span>Uploading...</span>
                </>
              ) : (
                <>
                  <FileUp className="w-4 h-4 text-sky-500" />
                  <span>Import File</span>
                </>
              )}
              <input
                type="file"
                accept=".txt,.md,.docx"
                onChange={handleFileUpload}
                className="hidden"
                disabled={uploading}
              />
            </label>

            <button
              onClick={handleCreateDocument}
              disabled={creating}
              className="flex items-center gap-2 px-4.5 py-2.5 rounded-xl bg-sky-505 bg-sky-500 hover:bg-sky-600 text-white font-medium text-sm transition-all shadow-lg shadow-sky-500/10 hover:shadow-sky-500/20 active:scale-[0.98] cursor-pointer"
            >
              {creating ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Plus className="w-4 h-4" />
              )}
              <span>New Document</span>
            </button>
          </div>
        </div>

        <div className="relative mt-6 max-w-md">
          <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400 dark:text-slate-505">
            <Search className="w-4 h-4" />
          </div>
          <input
            type="text"
            value={searchQuery}
            onChange={handleSearch}
            placeholder="Search documents by title..."
            className="w-full bg-white dark:bg-slate-900/30 border border-slate-200 dark:border-slate-900 focus:border-slate-300 dark:focus:border-slate-800 rounded-xl pl-10 pr-4 py-2.5 text-sm text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-600 outline-none transition-all shadow-sm"
          />
        </div>

        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 gap-3">
            <Loader2 className="w-8 h-8 animate-spin text-sky-500" />
            <p className="text-slate-500 dark:text-slate-400 text-sm">Loading documents...</p>
          </div>
        ) : (
          <div className="space-y-12 mt-8">
            {/* My Documents Grid */}
            <div>
              <h2 className="font-display font-semibold text-lg text-slate-900 dark:text-white mb-4 flex items-center gap-2">
                <span>My Documents</span>
                <span className="text-xs bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-400 px-2.5 py-0.5 rounded-full font-sans font-medium">
                  {myDocuments.length}
                </span>
              </h2>

              {myDocuments.length === 0 ? (
                <div className="bg-white dark:bg-slate-900/10 border border-dashed border-slate-200 dark:border-slate-900 rounded-2xl py-12 px-4 text-center shadow-sm">
                  <FileText className="w-8 h-8 text-slate-400 dark:text-slate-700 mx-auto mb-3" />
                  <p className="text-slate-505 dark:text-slate-400 text-sm font-medium">
                    No documents owned by you
                  </p>
                  <p className="text-slate-400 dark:text-slate-600 text-xs mt-1">
                    Click New Document to create a new draft or import an
                    existing file
                  </p>
                </div>
              ) : (
                <>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                    {myDocuments.map((doc) => (
                      <div
                        key={doc._id}
                        className="group bg-white dark:bg-slate-900/20 hover:bg-slate-50 dark:hover:bg-slate-900/40 border border-slate-200 dark:border-slate-900 hover:border-slate-300 dark:hover:border-slate-800/80 rounded-2xl p-5 shadow-sm dark:shadow-none transition-all duration-300 flex flex-col justify-between"
                      >
                        <div>
                          <div className="flex items-start justify-between gap-4">
                            <div className="bg-sky-500/10 p-2.5 rounded-xl text-sky-500 dark:text-sky-400 shrink-0">
                              <FileText className="w-5 h-5" />
                            </div>
                            <div className="flex items-center gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
                              <button
                                onClick={() => setShareDocId(doc._id)}
                                title="Share Document"
                                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                              >
                                <Share2 className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => setDeleteDoc(doc)}
                                title="Delete Document"
                                className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 dark:hover:text-rose-500 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </div>

                          <h3 className="font-display font-semibold text-slate-900 dark:text-white mt-4 group-hover:text-sky-600 dark:group-hover:text-sky-400 transition-colors line-clamp-1">
                            {doc.title}
                          </h3>

                          <div className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400 mt-2">
                            <Clock className="w-3.5 h-3.5" />
                            <span>Updated {formatDate(doc.updatedAt)}</span>
                          </div>
                        </div>

                        <div className="mt-5 pt-4 border-t border-slate-100 dark:border-slate-900/60 flex items-center justify-between">
                          <span className="text-xs text-slate-400 dark:text-slate-505">
                            Owned by me
                          </span>
                          <button
                            onClick={() => navigate(`/documents/${doc._id}`)}
                            className="flex items-center gap-1.5 text-sky-500 dark:text-sky-400 hover:text-sky-600 dark:hover:text-sky-300 font-medium text-xs transition-colors cursor-pointer"
                          >
                            <span>Open</span>
                            <ExternalLink className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* My Documents Pagination Controls */}
                  {myTotalPages > 1 && (
                    <div className="flex items-center justify-center gap-4 mt-8">
                      <button
                        onClick={() => setMyPage((prev) => Math.max(prev - 1, 1))}
                        disabled={myPage === 1}
                        className="p-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:bg-slate-100 dark:hover:bg-slate-800 disabled:opacity-40 disabled:hover:bg-white dark:disabled:hover:bg-slate-900 transition-all cursor-pointer"
                      >
                        <ChevronLeft className="w-4 h-4" />
                      </button>
                      <span className="text-sm font-medium text-slate-500">
                        Page {myPage} of {myTotalPages}
                      </span>
                      <button
                        onClick={() => setMyPage((prev) => Math.min(prev + 1, myTotalPages))}
                        disabled={myPage === myTotalPages}
                        className="p-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:bg-slate-100 dark:hover:bg-slate-800 disabled:opacity-40 disabled:hover:bg-white dark:disabled:hover:bg-slate-900 transition-all cursor-pointer"
                      >
                        <ChevronRight className="w-4 h-4" />
                      </button>
                    </div>
                  )}
                </>
              )}
            </div>

            {/* Shared With Me Grid */}
            <div>
              <h2 className="font-display font-semibold text-lg text-slate-900 dark:text-white mb-4 flex items-center gap-2">
                <span>Shared with me</span>
                <span className="text-xs bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-400 px-2.5 py-0.5 rounded-full font-sans font-medium">
                  {sharedDocuments.length}
                </span>
              </h2>

              {sharedDocuments.length === 0 ? (
                <div className="bg-white dark:bg-slate-900/10 border border-dashed border-slate-200 dark:border-slate-900 rounded-2xl py-12 px-4 text-center shadow-sm">
                  <Share2 className="w-8 h-8 text-slate-400 dark:text-slate-700 mx-auto mb-3" />
                  <p className="text-slate-500 dark:text-slate-400 text-sm font-medium">
                    No documents shared with you
                  </p>
                  <p className="text-slate-400 dark:text-slate-600 text-xs mt-1">
                    Documents shared by other users will appear in this section
                  </p>
                </div>
              ) : (
                <>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                    {sharedDocuments.map((doc) => (
                      <div
                        key={doc._id}
                        className="group bg-white dark:bg-slate-900/20 hover:bg-slate-50 dark:hover:bg-slate-900/40 border border-slate-200 dark:border-slate-900 hover:border-slate-300 dark:hover:border-slate-800/80 rounded-2xl p-5 shadow-sm dark:shadow-none transition-all duration-300 flex flex-col justify-between"
                      >
                        <div>
                          <div className="flex items-start justify-between gap-4">
                            <div className="bg-purple-500/10 p-2.5 rounded-xl text-purple-600 dark:text-purple-400 shrink-0">
                              <Share2 className="w-5 h-5" />
                            </div>
                          </div>

                          <h3 className="font-display font-semibold text-slate-900 dark:text-white mt-4 group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-colors line-clamp-1">
                            {doc.title}
                          </h3>

                          <div className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400 mt-2">
                            <Clock className="w-3.5 h-3.5" />
                            <span>Updated {formatDate(doc.updatedAt)}</span>
                          </div>
                        </div>

                        <div className="mt-5 pt-4 border-t border-slate-100 dark:border-slate-900/60 flex items-center justify-between">
                          <div className="flex items-center gap-1.5">
                            <UserIcon className="w-3.5 h-3.5 text-slate-400" />
                            <span
                              className="text-xs text-slate-605 dark:text-slate-400 font-medium max-w-[150px] truncate"
                              title={doc.owner?.email}
                            >
                              {doc.owner?.name}
                            </span>
                          </div>

                          <button
                            onClick={() => navigate(`/documents/${doc._id}`)}
                            className="flex items-center gap-1.5 text-purple-500 dark:text-purple-400 hover:text-purple-600 dark:hover:text-purple-300 font-medium text-xs transition-colors cursor-pointer"
                          >
                            <span>Open</span>
                            <ExternalLink className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Shared Documents Pagination Controls */}
                  {sharedTotalPages > 1 && (
                    <div className="flex items-center justify-center gap-4 mt-8">
                      <button
                        onClick={() => setSharedPage((prev) => Math.max(prev - 1, 1))}
                        disabled={sharedPage === 1}
                        className="p-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:bg-slate-100 dark:hover:bg-slate-800 disabled:opacity-40 disabled:hover:bg-white dark:disabled:hover:bg-slate-900 transition-all cursor-pointer"
                      >
                        <ChevronLeft className="w-4 h-4" />
                      </button>
                      <span className="text-sm font-medium text-slate-505">
                        Page {sharedPage} of {sharedTotalPages}
                      </span>
                      <button
                        onClick={() => setSharedPage((prev) => Math.min(prev + 1, sharedTotalPages))}
                        disabled={sharedPage === sharedTotalPages}
                        className="p-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:bg-slate-100 dark:hover:bg-slate-800 disabled:opacity-40 disabled:hover:bg-white dark:disabled:hover:bg-slate-900 transition-all cursor-pointer"
                      >
                        <ChevronRight className="w-4 h-4" />
                      </button>
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        )}
      </main>

      <ShareModal
        isOpen={!!shareDocId}
        onClose={() => setShareDocId(null)}
        documentId={shareDocId}
      />

      <DeleteConfirmationModal
        isOpen={!!deleteDoc}
        onClose={() => setDeleteDoc(null)}
        onConfirm={handleDeleteConfirm}
        documentTitle={deleteDoc?.title || ""}
      />
    </div>
  );
};

export default Dashboard;
