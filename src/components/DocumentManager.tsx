import React, { useState, useRef } from "react";
import { 
  Search, 
  Grid, 
  List as ListIcon, 
  Upload, 
  Folder as FolderIcon, 
  Plus, 
  Tag, 
  Calendar, 
  Trash2, 
  Eye, 
  Share2, 
  CheckCircle2, 
  AlertTriangle, 
  Loader2, 
  FileText, 
  Sparkles,
  ChevronRight,
  Filter,
  X,
  FileCheck2
} from "lucide-react";
import { Document, Folder, FamilyMember, DocumentCategory } from "../types";
import GlassCard from "./GlassCard";

interface DocumentManagerProps {
  documents: Document[];
  folders: Folder[];
  familyMembers: FamilyMember[];
  onUpload: (payload: any) => Promise<Document>;
  onDelete: (id: string) => Promise<void>;
  onUpdateTags: (id: string, tags: string[]) => Promise<Document>;
  onUpdateFolder: (id: string, folderId: string | null) => Promise<Document>;
  onShare: (id: string, familyMemberId: string, permission: "read" | "write") => Promise<Document>;
  onCreateFolder: (name: string, color: string) => Promise<Folder>;
  onDeleteFolder: (id: string) => Promise<void>;
}

export default function DocumentManager({
  documents,
  folders,
  familyMembers,
  onUpload,
  onDelete,
  onUpdateTags,
  onUpdateFolder,
  onShare,
  onCreateFolder,
  onDeleteFolder,
}: DocumentManagerProps) {
  // Navigation & Search State
  const [selectedFolderId, setSelectedFolderId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("");
  const [selectedExpiryFilter, setSelectedExpiryFilter] = useState<string>("");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");

  // Document Upload States
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Modals & Popups States
  const [selectedDoc, setSelectedDoc] = useState<Document | null>(null);
  const [isNewFolderModalOpen, setIsNewFolderModalOpen] = useState(false);
  const [newFolderName, setNewFolderName] = useState("");
  const [newFolderColor, setNewFolderColor] = useState("#3B82F6");
  const [newTagInput, setNewTagInput] = useState("");
  const [shareDocId, setShareDocId] = useState<string | null>(null);

  // Categories list
  const categories: DocumentCategory[] = [
    "Aadhaar",
    "PAN Card",
    "Passport",
    "Driving License",
    "Voter ID",
    "Education",
    "Health",
    "Insurance",
    "Finance",
    "Property",
    "Tax",
    "Other",
  ];

  // Helper: Convert File to Base64
  const fileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => {
        const base64String = reader.result?.toString().split(",")[1];
        resolve(base64String || "");
      };
      reader.onerror = (error) => reject(error);
    });
  };

  // Upload handler
  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    const file = files[0];

    setIsUploading(true);
    setUploadProgress("Converting document for secure transmission...");

    try {
      const base64Data = await fileToBase64(file);
      const isPdf = file.type === "application/pdf" || file.name.endsWith(".pdf");
      
      setUploadProgress("Analyzing document with Gemini AI (OCR, Classifying & Summarizing)...");
      
      const payload = {
        name: file.name,
        type: isPdf ? "pdf" : "image",
        mimeType: file.type || (isPdf ? "application/pdf" : "image/png"),
        size: file.size,
        base64Data,
        folderId: selectedFolderId
      };

      await onUpload(payload);
      setUploadProgress("");
    } catch (err) {
      console.error(err);
      alert("Verification or uploading failed. Please check file properties and try again.");
    } finally {
      setIsUploading(false);
    }
  };

  // Drag and drop events
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    const files = e.dataTransfer.files;
    if (!files || files.length === 0) return;
    
    setIsUploading(true);
    setUploadProgress("Converting document for secure transmission...");

    try {
      const file = files[0];
      const base64Data = await fileToBase64(file);
      const isPdf = file.type === "application/pdf" || file.name.endsWith(".pdf");

      setUploadProgress("Analyzing document with Gemini AI (OCR, Classifying & Summarizing)...");
      
      const payload = {
        name: file.name,
        type: isPdf ? "pdf" : "image",
        mimeType: file.type || (isPdf ? "application/pdf" : "image/png"),
        size: file.size,
        base64Data,
        folderId: selectedFolderId
      };

      await onUpload(payload);
    } catch (err) {
      console.error(err);
      alert("Failed to analyze file.");
    } finally {
      setIsUploading(false);
    }
  };

  // Create folder
  const handleCreateFolderSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newFolderName.trim()) return;
    try {
      await onCreateFolder(newFolderName, newFolderColor);
      setNewFolderName("");
      setIsNewFolderModalOpen(false);
    } catch (err) {
      console.error(err);
    }
  };

  // Add custom tags
  const handleAddTag = async (docId: string, currentTags: string[]) => {
    if (!newTagInput.trim()) return;
    const updatedTags = [...currentTags, newTagInput.trim()];
    try {
      const updated = await onUpdateTags(docId, updatedTags);
      if (selectedDoc?.id === docId) {
        setSelectedDoc(updated);
      }
      setNewTagInput("");
    } catch (err) {
      console.error(err);
    }
  };

  // Remove tag
  const handleRemoveTag = async (docId: string, currentTags: string[], tagToRemove: string) => {
    const updatedTags = currentTags.filter((t) => t !== tagToRemove);
    try {
      const updated = await onUpdateTags(docId, updatedTags);
      if (selectedDoc?.id === docId) {
        setSelectedDoc(updated);
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Update folder assignment
  const handleFolderChange = async (docId: string, fId: string | null) => {
    try {
      const updated = await onUpdateFolder(docId, fId);
      if (selectedDoc?.id === docId) {
        setSelectedDoc(updated);
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Share with family member
  const handleShareSubmit = async (docId: string, memberId: string) => {
    try {
      const updated = await onShare(docId, memberId, "read");
      if (selectedDoc?.id === docId) {
        setSelectedDoc(updated);
      }
      alert("Document shared successfully!");
      setShareDocId(null);
    } catch (err) {
      console.error(err);
    }
  };

  // Filter Logic
  const filteredDocuments = documents.filter((doc) => {
    // 1. Folder filter
    if (selectedFolderId && doc.folderId !== selectedFolderId) return false;
    
    // 2. Search query (matches name, tag, or OCR content)
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      const matchName = doc.name.toLowerCase().includes(q);
      const matchCategory = doc.category.toLowerCase().includes(q);
      const matchTags = doc.tags.some((t) => t.toLowerCase().includes(q));
      const matchOcr = doc.textContent.toLowerCase().includes(q);
      if (!matchName && !matchCategory && !matchTags && !matchOcr) return false;
    }

    // 3. Category filter
    if (selectedCategory && doc.category !== selectedCategory) return false;

    // 4. Expiry status filter
    if (selectedExpiryFilter) {
      if (doc.status !== selectedExpiryFilter) return false;
    }

    return true;
  });

  return (
    <div className="space-y-6">
      {/* Upper action area */}
      <div className="flex flex-col sm:flex-row justify-between gap-4">
        <div>
          <h2 className="font-sans font-bold text-slate-800 dark:text-white text-lg">
            My Documents Vault
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Securely upload, organize in folders, tag, and explore your documents using AI
          </p>
        </div>

        <div className="flex items-center gap-2.5 shrink-0 self-end">
          <button
            onClick={() => fileInputRef.current?.click()}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white shadow-md shadow-indigo-500/10 cursor-pointer transition-all duration-200 hover:scale-101"
          >
            <Upload className="h-4 w-4" />
            Upload Document
          </button>
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileChange}
            accept="image/*,application/pdf"
            className="hidden"
          />

          <button
            onClick={() => setIsNewFolderModalOpen(true)}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-900/60 transition-colors cursor-pointer"
          >
            <FolderIcon className="h-4 w-4" />
            New Folder
          </button>
        </div>
      </div>

      {/* Upload progress popup overlay */}
      {isUploading && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <GlassCard className="p-8 max-w-md w-full text-center space-y-4">
            <Loader2 className="h-10 w-10 text-indigo-500 animate-spin mx-auto" />
            <div>
              <h4 className="font-sans font-bold text-slate-800 dark:text-white">Processing Document</h4>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-2 leading-relaxed">
                {uploadProgress}
              </p>
            </div>
            <div className="w-full bg-slate-100 dark:bg-slate-800 h-1.5 rounded-full overflow-hidden">
              <div className="bg-indigo-500 h-full animate-pulse w-3/4 rounded-full"></div>
            </div>
          </GlassCard>
        </div>
      )}

      {/* Folder selector bar */}
      <div className="space-y-2">
        <span className="text-xs font-semibold text-slate-400 dark:text-slate-500 tracking-wide uppercase font-mono">Folders</span>
        <div className="flex flex-wrap gap-2.5">
          <button
            onClick={() => setSelectedFolderId(null)}
            className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all ${
              selectedFolderId === null
                ? "bg-indigo-500 text-white shadow-md shadow-indigo-500/10"
                : "bg-white/60 dark:bg-slate-900/40 text-slate-700 dark:text-slate-300 border border-slate-200/50 dark:border-slate-800/50 hover:bg-slate-50 dark:hover:bg-slate-900/80"
            }`}
          >
            All Folders
          </button>
          {folders.map((f) => (
            <div key={f.id} className="relative group">
              <button
                onClick={() => setSelectedFolderId(f.id)}
                className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all flex items-center gap-2 ${
                  selectedFolderId === f.id
                    ? "bg-indigo-500 text-white shadow-md"
                    : "bg-white/60 dark:bg-slate-900/40 text-slate-700 dark:text-slate-300 border border-slate-200/50 dark:border-slate-800/50 hover:bg-slate-50"
                }`}
              >
                <span className="h-2 w-2 rounded-full" style={{ backgroundColor: f.color }}></span>
                {f.name}
              </button>
              {folders.length > 3 && (
                <button
                  onClick={async (e) => {
                    e.stopPropagation();
                    if (confirm(`Are you sure you want to delete folder "${f.name}"? Documents in it won't be deleted.`)) {
                      await onDeleteFolder(f.id);
                      if (selectedFolderId === f.id) setSelectedFolderId(null);
                    }
                  }}
                  className="absolute -top-1 -right-1 hidden group-hover:flex items-center justify-center h-4 w-4 bg-red-500 text-white text-[9px] rounded-full hover:bg-red-600 shadow"
                >
                  <X className="h-2.5 w-2.5" />
                </button>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Filter and Search Bar */}
      <GlassCard className="p-4 flex flex-col md:flex-row gap-4 items-center">
        {/* Search */}
        <div className="relative w-full md:flex-1">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search documents by name, category, text content, tags..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-slate-50/50 dark:bg-slate-950/30 text-slate-800 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 text-xs pl-10 pr-4 py-2.5 rounded-xl border border-slate-200/50 dark:border-slate-850/50 focus:outline-none focus:border-indigo-500 transition-colors"
          />
        </div>

        {/* Dropdown Filters */}
        <div className="flex w-full md:w-auto items-center gap-2">
          {/* Category Filter */}
          <div className="relative flex-1 md:w-44">
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="w-full bg-slate-50/50 dark:bg-slate-950/30 text-slate-850 dark:text-slate-300 text-xs px-3 py-2.5 rounded-xl border border-slate-200/50 dark:border-slate-850/50 focus:outline-none focus:border-indigo-500 appearance-none cursor-pointer"
            >
              <option value="">All Categories</option>
              {categories.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
            <Filter className="absolute right-3.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400 pointer-events-none" />
          </div>

          {/* Expiry Filter */}
          <div className="relative flex-1 md:w-44">
            <select
              value={selectedExpiryFilter}
              onChange={(e) => setSelectedExpiryFilter(e.target.value)}
              className="w-full bg-slate-50/50 dark:bg-slate-950/30 text-slate-850 dark:text-slate-300 text-xs px-3 py-2.5 rounded-xl border border-slate-200/50 dark:border-slate-850/50 focus:outline-none focus:border-indigo-500 appearance-none cursor-pointer"
            >
              <option value="">Expiry Status</option>
              <option value="valid">Valid Documents</option>
              <option value="expiring">Expiring Soon (30d)</option>
              <option value="expired">Expired</option>
              <option value="none">No Expiry</option>
            </select>
            <Calendar className="absolute right-3.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400 pointer-events-none" />
          </div>

          {/* View Mode */}
          <div className="flex border border-slate-200/50 dark:border-slate-800/50 rounded-xl overflow-hidden shrink-0">
            <button
              onClick={() => setViewMode("grid")}
              className={`p-2.5 transition-colors ${
                viewMode === "grid"
                  ? "bg-indigo-500/10 text-indigo-600 dark:text-indigo-400"
                  : "bg-white/60 dark:bg-slate-900/40 text-slate-400 hover:text-slate-600"
              }`}
            >
              <Grid className="h-4 w-4" />
            </button>
            <button
              onClick={() => setViewMode("list")}
              className={`p-2.5 transition-colors ${
                viewMode === "list"
                  ? "bg-indigo-500/10 text-indigo-600 dark:text-indigo-400"
                  : "bg-white/60 dark:bg-slate-900/40 text-slate-400 hover:text-slate-600"
              }`}
            >
              <ListIcon className="h-4 w-4" />
            </button>
          </div>
        </div>
      </GlassCard>

      {/* Empty State vs Document list */}
      {filteredDocuments.length === 0 ? (
        <div 
          onDragOver={handleDragOver}
          onDrop={handleDrop}
          className="p-12 text-center rounded-2xl border-2 border-dashed border-slate-200 dark:border-slate-800 bg-white/40 dark:bg-slate-900/10"
        >
          <Upload className="h-10 w-10 text-slate-300 dark:text-slate-700 mx-auto mb-4 animate-bounce" />
          <h3 className="font-sans font-bold text-slate-700 dark:text-slate-300">
            No Documents Found
          </h3>
          <p className="text-xs text-slate-400 dark:text-slate-500 max-w-sm mx-auto mt-2 leading-relaxed">
            Drag and drop files here, or use the "Upload Document" button at the top to secure your Aadhaar, PASSPORT, health insurance etc.
          </p>
        </div>
      ) : (
        <>
          {viewMode === "grid" ? (
            /* GRID VIEW */
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {filteredDocuments.map((doc) => {
                const folderColor = folders.find((f) => f.id === doc.folderId)?.color || "#64748B";
                return (
                  <GlassCard 
                    key={doc.id} 
                    hoverEffect 
                    onClick={() => setSelectedDoc(doc)}
                    className="p-4 flex flex-col justify-between border-t-4"
                    style={{ borderTopColor: folderColor }}
                  >
                    <div>
                      {/* Top bar info */}
                      <div className="flex justify-between items-start mb-2">
                        <span className="text-[9px] font-mono tracking-wider font-semibold bg-indigo-500/5 text-indigo-600 dark:text-indigo-400 px-1.5 py-0.5 rounded">
                          {doc.category}
                        </span>
                        
                        {/* Expiry Badge */}
                        {doc.expiryDate && (
                          <span className={`text-[9px] font-semibold px-2 py-0.5 rounded flex items-center gap-1 ${
                            doc.status === "expired"
                              ? "bg-red-500/10 text-red-600"
                              : doc.status === "expiring"
                              ? "bg-amber-500/10 text-amber-600 animate-pulse"
                              : "bg-emerald-500/10 text-emerald-600"
                          }`}>
                            <Calendar className="h-2.5 w-2.5" />
                            {doc.status.toUpperCase()}
                          </span>
                        )}
                      </div>

                      {/* File Name */}
                      <h4 className="font-sans font-bold text-sm text-slate-800 dark:text-white truncate" title={doc.name}>
                        {doc.name}
                      </h4>

                      {/* Summary snippet */}
                      <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2 mt-1.5 leading-relaxed">
                        {doc.summary}
                      </p>

                      {/* Warnings if duplicates */}
                      {doc.isDuplicate && (
                        <div className="mt-2.5 p-2 bg-red-500/5 rounded-lg border border-red-100/50 dark:border-red-950/20 flex items-center gap-1.5">
                          <AlertTriangle className="h-3.5 w-3.5 text-red-500 shrink-0" />
                          <span className="text-[10px] text-red-600 dark:text-red-400 truncate">Duplicate document detected</span>
                        </div>
                      )}
                    </div>

                    {/* Bottom bar */}
                    <div className="flex items-center justify-between border-t border-slate-200/30 dark:border-slate-800/30 pt-3 mt-4">
                      <span className="text-[10px] text-slate-400 dark:text-slate-500 font-mono">
                        {(doc.size / 1024).toFixed(0)} KB • {new Date(doc.createdAt).toLocaleDateString()}
                      </span>
                      <div className="flex gap-2">
                        <button 
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedDoc(doc);
                          }}
                          className="p-1.5 rounded-lg bg-slate-50 dark:bg-slate-900/60 text-slate-500 dark:text-slate-400 hover:text-indigo-600 hover:bg-indigo-500/5 transition-colors"
                          title="View Details"
                        >
                          <Eye className="h-4 w-4" />
                        </button>
                        <button 
                          onClick={(e) => {
                            e.stopPropagation();
                            setShareDocId(doc.id);
                          }}
                          className="p-1.5 rounded-lg bg-slate-50 dark:bg-slate-900/60 text-slate-500 dark:text-slate-400 hover:text-indigo-600 hover:bg-indigo-500/5 transition-colors"
                          title="Share"
                        >
                          <Share2 className="h-4 w-4" />
                        </button>
                        <button 
                          onClick={async (e) => {
                            e.stopPropagation();
                            if (confirm(`Delete permanently "${doc.name}"? This operation is end-to-end shredded.`)) {
                              await onDelete(doc.id);
                            }
                          }}
                          className="p-1.5 rounded-lg bg-slate-50 dark:bg-slate-900/60 text-slate-400 hover:text-red-500 hover:bg-red-500/5 transition-colors"
                          title="Delete"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  </GlassCard>
                );
              })}
            </div>
          ) : (
            /* LIST VIEW */
            <GlassCard className="divide-y divide-slate-200/40 dark:divide-slate-800/40">
              {filteredDocuments.map((doc) => {
                const folderColor = folders.find((f) => f.id === doc.folderId)?.color || "#64748B";
                return (
                  <div 
                    key={doc.id}
                    onClick={() => setSelectedDoc(doc)}
                    className="p-4 flex items-center justify-between hover:bg-slate-50/50 dark:hover:bg-slate-900/20 cursor-pointer transition-colors"
                  >
                    <div className="flex items-center gap-4 min-w-0 flex-1">
                      <div className="p-2.5 rounded-xl text-slate-500 dark:text-slate-400 shrink-0 border-l-4" style={{ borderLeftColor: folderColor, backgroundColor: "rgba(99,102,241,0.05)" }}>
                        <FileText className="h-5 w-5" />
                      </div>
                      <div className="min-w-0 flex-1 pr-4">
                        <h4 className="font-sans font-bold text-xs text-slate-800 dark:text-white truncate">
                          {doc.name}
                        </h4>
                        <div className="flex flex-wrap items-center gap-2 mt-1">
                          <span className="text-[9px] font-mono font-semibold bg-indigo-500/5 text-indigo-500 px-1 py-0.5 rounded">
                            {doc.category}
                          </span>
                          <span className="text-[10px] text-slate-400 dark:text-slate-500 font-mono">
                            {(doc.size / 1024).toFixed(0)} KB
                          </span>
                          {doc.expiryDate && (
                            <span className={`text-[9px] font-semibold px-2 py-0.5 rounded ${
                              doc.status === "expired"
                                ? "bg-red-500/10 text-red-600"
                                : doc.status === "expiring"
                                ? "bg-amber-500/10 text-amber-600 animate-pulse"
                                : "bg-emerald-500/10 text-emerald-600"
                            }`}>
                              {doc.status.toUpperCase()}: {doc.expiryDate}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="flex gap-2 shrink-0" onClick={(e) => e.stopPropagation()}>
                      <button 
                        onClick={() => setSelectedDoc(doc)}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-indigo-600 hover:bg-indigo-500/5 transition-colors"
                      >
                        <Eye className="h-4 w-4" />
                      </button>
                      <button 
                        onClick={() => setShareDocId(doc.id)}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-indigo-600 hover:bg-indigo-500/5 transition-colors"
                      >
                        <Share2 className="h-4 w-4" />
                      </button>
                      <button 
                        onClick={async () => {
                          if (confirm(`Delete permanently "${doc.name}"?`)) {
                            await onDelete(doc.id);
                          }
                        }}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-red-500 hover:bg-red-500/5 transition-colors"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </GlassCard>
          )}
        </>
      )}

      {/* NEW FOLDER MODAL */}
      {isNewFolderModalOpen && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <GlassCard className="p-6 max-w-sm w-full space-y-4">
            <div className="flex justify-between items-center border-b border-slate-200/20 dark:border-slate-800/20 pb-3">
              <h3 className="font-sans font-bold text-sm text-slate-800 dark:text-white">Create New Folder</h3>
              <button onClick={() => setIsNewFolderModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                <X className="h-4 w-4" />
              </button>
            </div>
            <form onSubmit={handleCreateFolderSubmit} className="space-y-4">
              <div>
                <label className="text-xs text-slate-400 block mb-1">Folder Name</label>
                <input
                  type="text"
                  required
                  value={newFolderName}
                  onChange={(e) => setNewFolderName(e.target.value)}
                  placeholder="e.g. Identity Dossier"
                  className="w-full bg-slate-50 dark:bg-slate-900 text-slate-800 dark:text-white text-xs px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="text-xs text-slate-400 block mb-1">Folder Accent Color</label>
                <div className="flex gap-2">
                  {["#3B82F6", "#10B981", "#F59E0B", "#EF4444", "#8B5CF6", "#EC4899"].map((c) => (
                    <button
                      key={c}
                      type="button"
                      onClick={() => setNewFolderColor(c)}
                      className={`h-7 w-7 rounded-full transition-transform ${newFolderColor === c ? "ring-2 ring-indigo-500 scale-110" : ""}`}
                      style={{ backgroundColor: c }}
                    />
                  ))}
                </div>
              </div>

              <button
                type="submit"
                className="w-full bg-indigo-500 hover:bg-indigo-600 text-white text-xs font-semibold py-2.5 rounded-xl cursor-pointer"
              >
                Create Folder
              </button>
            </form>
          </GlassCard>
        </div>
      )}

      {/* SHARE MODAL */}
      {shareDocId && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <GlassCard className="p-6 max-w-sm w-full space-y-4">
            <div className="flex justify-between items-center border-b border-slate-200/20 dark:border-slate-800/20 pb-3">
              <h3 className="font-sans font-bold text-sm text-slate-800 dark:text-white">Share Secure Document</h3>
              <button onClick={() => setShareDocId(null)} className="text-slate-400 hover:text-slate-600">
                <X className="h-4 w-4" />
              </button>
            </div>

            {familyMembers.length === 0 ? (
              <p className="text-xs text-slate-400 text-center py-4">
                No family members configured yet. Visit the "Family Sharing" tab to add members first.
              </p>
            ) : (
              <div className="space-y-3">
                <p className="text-[11px] text-slate-400 leading-relaxed">
                  Select a family member to share this document with permission-based access:
                </p>
                {familyMembers.map((member) => (
                  <div 
                    key={member.id}
                    className="p-3 bg-slate-50 dark:bg-slate-900/30 rounded-xl border border-slate-200/10 dark:border-slate-800/10 flex items-center justify-between"
                  >
                    <div className="flex items-center gap-2">
                      <img src={member.avatar} className="h-7 w-7 rounded-full object-cover" />
                      <div>
                        <p className="text-xs font-bold text-slate-800 dark:text-white">{member.name}</p>
                        <p className="text-[9px] text-slate-400 font-mono">{member.relation}</p>
                      </div>
                    </div>
                    <button
                      onClick={() => handleShareSubmit(shareDocId, member.id)}
                      className="text-[10px] font-semibold bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-600 dark:text-indigo-400 px-2.5 py-1.5 rounded-lg"
                    >
                      Share Access
                    </button>
                  </div>
                ))}
              </div>
            )}
          </GlassCard>
        </div>
      )}

      {/* DETAILED DOCUMENT DETAILS OVERLAY MODAL */}
      {selectedDoc && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto">
          <GlassCard className="max-w-3xl w-full max-h-[90vh] flex flex-col shadow-2xl overflow-hidden my-auto">
            {/* Header */}
            <div className="p-5 border-b border-slate-200/20 dark:border-slate-800/20 flex justify-between items-center bg-slate-50/50 dark:bg-slate-900/50">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-indigo-500/10 rounded-xl text-indigo-600 dark:text-indigo-400">
                  <FileText className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="font-sans font-bold text-slate-800 dark:text-white text-sm truncate max-w-md">
                    {selectedDoc.name}
                  </h3>
                  <div className="flex items-center gap-1.5 mt-0.5">
                    <span className="text-[9px] font-mono font-semibold bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 px-1.5 py-0.5 rounded">
                      {selectedDoc.category} ({(selectedDoc.categoryConfidence * 100).toFixed(0)}% Match)
                    </span>
                    {selectedDoc.isDuplicate && (
                      <span className="text-[9px] font-bold bg-red-500/10 text-red-500 px-1.5 py-0.5 rounded flex items-center gap-0.5">
                        <AlertTriangle className="h-2.5 w-2.5" /> Duplicate
                      </span>
                    )}
                  </div>
                </div>
              </div>
              <button 
                onClick={() => setSelectedDoc(null)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100/50 dark:hover:bg-slate-900 transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Content Body Scrollable */}
            <div className="p-6 overflow-y-auto flex-1 grid grid-cols-1 md:grid-cols-12 gap-6 leading-relaxed">
              {/* Left Column: AI summary & OCR output */}
              <div className="md:col-span-7 space-y-5">
                {/* AI Summary Card */}
                <div className="p-4 rounded-xl bg-gradient-to-br from-indigo-500/5 via-purple-500/5 to-pink-500/5 border border-indigo-100/30 dark:border-slate-850">
                  <div className="flex items-center gap-2 mb-2 text-indigo-600 dark:text-indigo-400">
                    <Sparkles className="h-4.5 w-4.5 animate-pulse" />
                    <h4 className="text-xs font-bold font-sans">AI-Generated Plain Language Summary</h4>
                  </div>
                  <p className="text-xs text-slate-700 dark:text-slate-300 italic leading-relaxed">
                    "{selectedDoc.summary}"
                  </p>
                </div>

                {/* Duplicate Notification Warning */}
                {selectedDoc.isDuplicate && (
                  <div className="p-3.5 bg-red-500/5 rounded-xl border border-red-200/20 dark:border-red-950/20 flex gap-2.5 items-start">
                    <AlertTriangle className="h-5 w-5 text-red-500 shrink-0" />
                    <div>
                      <h4 className="text-xs font-bold text-red-800 dark:text-red-300">Duplicate Registry Match</h4>
                      <p className="text-[10px] text-red-600/90 dark:text-red-400 leading-relaxed mt-0.5">
                        This digital file shares a cryptographic checksum hash matching an existing document. Please verify identity records to ensure continuous version sync.
                      </p>
                    </div>
                  </div>
                )}

                {/* OCR text extractor block */}
                <div>
                  <h4 className="text-xs font-semibold text-slate-400 dark:text-slate-500 font-mono tracking-wider uppercase mb-2">OCR Extracted Text content</h4>
                  <div className="p-4 rounded-xl bg-slate-950 text-slate-300 font-mono text-[10px] whitespace-pre-wrap leading-relaxed max-h-56 overflow-y-auto border border-slate-800">
                    {selectedDoc.textContent || "No text could be extracted."}
                  </div>
                </div>

                {/* AI Recommendations */}
                <div className="space-y-2">
                  <h4 className="text-xs font-semibold text-slate-400 dark:text-slate-500 font-mono tracking-wider uppercase">AI Next Steps & recommendations</h4>
                  <div className="space-y-2">
                    {selectedDoc.recommendations.map((rec, idx) => (
                      <div key={idx} className="p-2.5 bg-slate-50 dark:bg-slate-900/30 border border-slate-200/10 dark:border-slate-800/10 rounded-lg flex gap-2 items-start text-xs text-slate-700 dark:text-slate-300">
                        <CheckCircle2 className="h-4 w-4 text-emerald-500 shrink-0 mt-0.5" />
                        {rec}
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Right Column: Folders, tags, and actions */}
              <div className="md:col-span-5 space-y-5">
                {/* Meta details */}
                <div className="p-4 bg-slate-50 dark:bg-slate-900/20 rounded-xl space-y-3.5">
                  <h4 className="text-xs font-bold text-slate-800 dark:text-white border-b border-slate-200/20 pb-1.5">Document Metadata</h4>
                  
                  {/* Folder selector inside metadata */}
                  <div className="space-y-1">
                    <span className="text-[10px] text-slate-400 font-mono">Move to Folder</span>
                    <select
                      value={selectedDoc.folderId || ""}
                      onChange={(e) => handleFolderChange(selectedDoc.id, e.target.value || null)}
                      className="w-full bg-white dark:bg-slate-950 text-xs px-2.5 py-1.5 rounded-lg border border-slate-200 dark:border-slate-800 text-slate-750 dark:text-slate-300"
                    >
                      <option value="">Unassigned</option>
                      {folders.map((f) => (
                        <option key={f.id} value={f.id}>
                          {f.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Expiry detail */}
                  <div className="space-y-0.5">
                    <span className="text-[10px] text-slate-400 font-mono block">Expiration Date</span>
                    <p className="text-xs font-semibold text-slate-800 dark:text-white flex items-center gap-1.5">
                      <Calendar className="h-4 w-4 text-slate-400" />
                      {selectedDoc.expiryDate || "Lifetime Validity / None"}
                    </p>
                  </div>

                  {/* Size info */}
                  <div className="space-y-0.5">
                    <span className="text-[10px] text-slate-400 font-mono block">Ingestion metrics</span>
                    <p className="text-xs font-semibold text-slate-800 dark:text-white font-mono">
                      {(selectedDoc.size / 1024).toFixed(1)} KB • {selectedDoc.mimeType}
                    </p>
                  </div>
                </div>

                {/* Tag manager */}
                <div className="space-y-2">
                  <h4 className="text-xs font-semibold text-slate-400 dark:text-slate-500 font-mono tracking-wider uppercase">Tags</h4>
                  <div className="flex flex-wrap gap-1.5">
                    {selectedDoc.tags.map((tag) => (
                      <span key={tag} className="text-[10px] bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 px-2 py-1 rounded-md flex items-center gap-1">
                        {tag}
                        <button 
                          onClick={() => handleRemoveTag(selectedDoc.id, selectedDoc.tags, tag)}
                          className="text-slate-400 hover:text-red-500 font-bold"
                        >
                          ×
                        </button>
                      </span>
                    ))}
                  </div>

                  <div className="flex gap-2">
                    <input
                      type="text"
                      placeholder="Add custom tag"
                      value={newTagInput}
                      onChange={(e) => setNewTagInput(e.target.value)}
                      onKeyDown={(e) => e.key === "Enter" && handleAddTag(selectedDoc.id, selectedDoc.tags)}
                      className="flex-1 bg-slate-50 dark:bg-slate-900 text-xs px-2.5 py-1.5 rounded-lg border border-slate-200 dark:border-slate-800 focus:outline-none"
                    />
                    <button 
                      onClick={() => handleAddTag(selectedDoc.id, selectedDoc.tags)}
                      className="p-1.5 rounded-lg bg-indigo-500 text-white hover:bg-indigo-600 transition-colors"
                    >
                      <Plus className="h-4 w-4" />
                    </button>
                  </div>
                </div>

                {/* Shred document button */}
                <div className="pt-4 border-t border-slate-200/10 dark:border-slate-800/10">
                  <button
                    onClick={async () => {
                      if (confirm(`Completely shred and remove this document permanently from secure vault?`)) {
                        await onDelete(selectedDoc.id);
                        setSelectedDoc(null);
                      }
                    }}
                    className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-red-500/10 hover:bg-red-500/20 text-red-500 rounded-xl text-xs font-semibold transition-colors"
                  >
                    <Trash2 className="h-4 w-4" />
                    Shred Document (E2E Wipe)
                  </button>
                </div>
              </div>
            </div>
          </GlassCard>
        </div>
      )}
    </div>
  );
}
