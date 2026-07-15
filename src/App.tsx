import React, { useState, useEffect } from "react";
import { 
  Menu, 
  X, 
  Languages, 
  Sparkles, 
  ShieldCheck, 
  ChevronDown 
} from "lucide-react";
import { User, Document, Folder, FamilyMember } from "./types";
import Sidebar from "./components/Sidebar";
import Dashboard from "./components/Dashboard";
import DocumentManager from "./components/DocumentManager";
import FamilySharing from "./components/FamilySharing";
import BackupAndSecurity from "./components/BackupAndSecurity";
import FloatingAssistant from "./components/FloatingAssistant";
import AuthPage from "./components/AuthPage";

export default function App() {
  // Global States
  const [user, setUser] = useState<User | null>(null);
  const [activeTab, setActiveTab] = useState<string>("dashboard");
  const [darkMode, setDarkMode] = useState<boolean>(false);
  const [language, setLanguage] = useState<string>("en"); // en, hi, mr, ta, te

  // Ingestion lists
  const [documents, setDocuments] = useState<Document[]>([]);
  const [folders, setFolders] = useState<Folder[]>([]);
  const [familyMembers, setFamilyMembers] = useState<FamilyMember[]>([]);

  // Mobile navigation drawer toggle
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

  // Active document context tracking for floating AI chatbot
  const [lastSelectedDocId, setLastSelectedDocId] = useState<string | undefined>(undefined);

  // 1. Ingestion on load
  useEffect(() => {
    // Check if user has active session
    fetch("/api/auth/me")
      .then((res) => res.json())
      .then((data) => {
        if (data.user) {
          setUser(data.user);
        }
      })
      .catch((err) => console.error("Me fetch failed", err));

    // Load Dark mode settings from local preferences
    const isDark = localStorage.getItem("theme") === "dark" || 
                   (!("theme" in localStorage) && window.matchMedia("(prefers-color-scheme: dark)").matches);
    setDarkMode(isDark);
    if (isDark) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }, []);

  // Fetch collections when user changes/logs in
  useEffect(() => {
    if (user) {
      fetchData();
    } else {
      setDocuments([]);
      setFolders([]);
      setFamilyMembers([]);
    }
  }, [user]);

  const fetchData = async () => {
    try {
      const [docsRes, foldersRes, familyRes] = await Promise.all([
        fetch("/api/documents"),
        fetch("/api/folders"),
        fetch("/api/family")
      ]);

      const docs = await docsRes.json();
      const folds = await foldersRes.json();
      const fam = await familyRes.json();

      setDocuments(docs);
      setFolders(folds);
      setFamilyMembers(fam);

      // Default the context of AI chatbot to the first expiring document if any
      const expiring = docs.find((d: Document) => d.status === "expiring");
      if (expiring) {
        setLastSelectedDocId(expiring.id);
      }
    } catch (err) {
      console.error("Failed to load secure database indices:", err);
    }
  };

  // 2. Dark Mode Toggle
  const toggleDarkMode = () => {
    const nextDark = !darkMode;
    setDarkMode(nextDark);
    if (nextDark) {
      document.documentElement.classList.add("dark");
      localStorage.setItem("theme", "dark");
    } else {
      document.documentElement.classList.remove("dark");
      localStorage.setItem("theme", "light");
    }
  };

  // 3. Document operations
  const handleUploadDocument = async (payload: any): Promise<Document> => {
    const res = await fetch("/api/documents/upload", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });
    if (!res.ok) throw new Error("Ingestion error");
    const newDoc = await res.json();
    setDocuments((prev) => [newDoc, ...prev]);
    return newDoc;
  };

  const handleDeleteDocument = async (id: string) => {
    const res = await fetch(`/api/documents/${id}`, { method: "DELETE" });
    if (res.ok) {
      setDocuments((prev) => prev.filter((d) => d.id !== id));
      if (lastSelectedDocId === id) setLastSelectedDocId(undefined);
    }
  };

  const handleUpdateTags = async (id: string, tags: string[]): Promise<Document> => {
    const res = await fetch(`/api/documents/${id}/tags`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ tags })
    });
    const updated = await res.json();
    setDocuments((prev) => prev.map((d) => d.id === id ? updated : d));
    return updated;
  };

  const handleUpdateFolder = async (id: string, folderId: string | null): Promise<Document> => {
    const res = await fetch(`/api/documents/${id}/folder`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ folderId })
    });
    const updated = await res.json();
    setDocuments((prev) => prev.map((d) => d.id === id ? updated : d));
    return updated;
  };

  const handleShareDocument = async (id: string, familyMemberId: string, permission: "read" | "write"): Promise<Document> => {
    const res = await fetch(`/api/documents/${id}/share`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ familyMemberId, permission })
    });
    const updated = await res.json();
    setDocuments((prev) => prev.map((d) => d.id === id ? updated : d));
    return updated;
  };

  // 4. Folder operations
  const handleCreateFolder = async (name: string, color: string): Promise<Folder> => {
    const res = await fetch("/api/folders", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, color })
    });
    const newFolder = await res.json();
    setFolders((prev) => [...prev, newFolder]);
    return newFolder;
  };

  const handleDeleteFolder = async (id: string) => {
    const res = await fetch(`/api/folders/${id}`, { method: "DELETE" });
    if (res.ok) {
      setFolders((prev) => prev.filter((f) => f.id !== id));
      setDocuments((prev) => prev.map((d) => d.folderId === id ? { ...d, folderId: null } : d));
    }
  };

  // 5. Family operations
  const handleAddFamilyMember = async (payload: any): Promise<FamilyMember> => {
    const res = await fetch("/api/family", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });
    const newMember = await res.json();
    setFamilyMembers((prev) => [...prev, newMember]);
    return newMember;
  };

  const handleDeleteFamilyMember = async (id: string) => {
    const res = await fetch(`/api/family/${id}`, { method: "DELETE" });
    if (res.ok) {
      setFamilyMembers((prev) => prev.filter((m) => m.id !== id));
    }
  };

  // 6. Security 2FA Operations
  const handleToggle2FA = async (): Promise<any> => {
    const res = await fetch("/api/auth/toggle-2fa", { method: "POST" });
    const data = await res.json();
    setUser(data.user);
    return data.user;
  };

  // 7. Auth triggers
  const handleLoginSuccess = (signedInUser: User) => {
    setUser(signedInUser);
    setActiveTab("dashboard");
  };

  const handleLogout = async () => {
    await fetch("/api/auth/logout", { method: "POST" });
    setUser(null);
  };

  // Dynamic voice query response mapping
  const handleVoiceFilterApplied = (filters: { search: string; category: string; expiryFilter: string }) => {
    setActiveTab("documents");
  };

  // Multi-language glossary text
  const translations: { [key: string]: { greeting: string; shield: string; switch: string } } = {
    en: {
      greeting: "Welcome back, Rakhid",
      shield: "Secure Ingestion Channel",
      switch: "Translate Language"
    },
    hi: {
      greeting: "आपका स्वागत है, राखीद",
      shield: "सुरक्षित अपलोड चैनल",
      switch: "भाषा बदलें"
    },
    mr: {
      greeting: "स्वागत आहे, राखीद",
      shield: "सुरक्षित अपलोड मार्ग",
      switch: "भाषा बदला"
    },
    ta: {
      greeting: "வரவேற்கிறோம், ரகீத்",
      shield: "பாதுகாப்பான தரவுத்தளம்",
      switch: "மொழியை மாற்றவும்"
    },
    te: {
      greeting: "స్వాగతం, రఖీద్",
      shield: "సురక్షిత అప్‌లోడ్ ఛానల్",
      switch: "భాషను మార్చండి"
    }
  };

  const t = translations[language] || translations.en;

  if (!user) {
    return <AuthPage onLoginSuccess={handleLoginSuccess} />;
  }

  return (
    <div className="flex h-screen bg-[#0a0a0c] text-slate-100 font-sans overflow-hidden">
      
      {/* Desktop Sidebar */}
      <div className="hidden lg:block h-full shrink-0">
        <Sidebar
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          user={user}
          onLogout={handleLogout}
          darkMode={darkMode}
          toggleDarkMode={toggleDarkMode}
        />
      </div>

      {/* Mobile Drawer Slide-In */}
      {isMobileSidebarOpen && (
        <div className="fixed inset-0 z-50 flex lg:hidden">
          <div className="fixed inset-0 bg-black/60 backdrop-blur-xs" onClick={() => setIsMobileSidebarOpen(false)}></div>
          <div className="relative w-64 h-full flex flex-col z-10 animate-slideRight">
            <Sidebar
              activeTab={activeTab}
              setActiveTab={(tab) => {
                setActiveTab(tab);
                setIsMobileSidebarOpen(false);
              }}
              user={user}
              onLogout={() => {
                handleLogout();
                setIsMobileSidebarOpen(false);
              }}
              darkMode={darkMode}
              toggleDarkMode={toggleDarkMode}
            />
            <button
              onClick={() => setIsMobileSidebarOpen(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-white"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>
      )}

      {/* Main App Workspace */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Top Header Controls Bar */}
        <header className="h-16 border-b border-[#1c1c24]/80 bg-[#0d0d12]/80 backdrop-blur-xl flex items-center justify-between px-6 shrink-0 z-30">
          
          {/* Mobile hamburger menu */}
          <button
            onClick={() => setIsMobileSidebarOpen(true)}
            className="p-2 -ml-2 rounded-lg text-slate-400 hover:bg-[#121216] lg:hidden cursor-pointer"
          >
            <Menu className="h-5 w-5" />
          </button>

          {/* Quick status information */}
          <div className="flex items-center gap-2">
            <h2 className="font-sans font-bold text-sm text-white">
              {t.greeting}
            </h2>
            <div className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded bg-emerald-500/10 text-emerald-400 text-[10px] font-mono font-semibold">
              <ShieldCheck className="h-3 w-3" />
              {t.shield}
            </div>
          </div>

          {/* Multi-Language & Status */}
          <div className="flex items-center gap-3">
            <div className="relative group">
              <button 
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-[#1c1c24] text-xs text-slate-300 hover:bg-[#121216] cursor-pointer"
                title={t.switch}
              >
                <Languages className="h-4 w-4" />
                <span className="font-medium font-mono uppercase">{language}</span>
                <ChevronDown className="h-3.5 w-3.5" />
              </button>

              {/* Language dropdown menu */}
              <div className="absolute right-0 top-full mt-1.5 w-32 bg-[#121216] border border-[#1c1c24] rounded-xl shadow-2xl py-1.5 hidden group-hover:block animate-fadeIn z-50">
                {[
                  { id: "en", label: "English" },
                  { id: "hi", label: "हिन्दी (Hindi)" },
                  { id: "mr", label: "मराठी (Marathi)" },
                  { id: "ta", label: "தமிழ் (Tamil)" },
                  { id: "te", label: "తెలుగు (Telugu)" }
                ].map((lang) => (
                  <button
                    key={lang.id}
                    onClick={() => setLanguage(lang.id)}
                    className={`w-full text-left px-4 py-2 text-xs font-medium transition-colors hover:bg-[#1c1c24] ${
                      language === lang.id ? "text-indigo-400 font-bold" : "text-slate-400"
                    }`}
                  >
                    {lang.label}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </header>

        {/* Scrollable Tab Workspace */}
        <main className="flex-1 overflow-y-auto p-6 space-y-6">
          {activeTab === "dashboard" && (
            <Dashboard
              documents={documents}
              folders={folders}
              onNavigateToDocs={(folderId) => {
                // If moving to docs via folders click on dashboard
                setActiveTab("documents");
              }}
              onDeleteDoc={handleDeleteDocument}
            />
          )}

          {activeTab === "documents" && (
            <DocumentManager
              documents={documents}
              folders={folders}
              familyMembers={familyMembers}
              onUpload={handleUploadDocument}
              onDelete={handleDeleteDocument}
              onUpdateTags={handleUpdateTags}
              onUpdateFolder={handleUpdateFolder}
              onShare={handleShareDocument}
              onCreateFolder={handleCreateFolder}
              onDeleteFolder={handleDeleteFolder}
            />
          )}

          {activeTab === "family" && (
            <FamilySharing
              familyMembers={familyMembers}
              documents={documents}
              onAddMember={handleAddFamilyMember}
              onDeleteMember={handleDeleteFamilyMember}
            />
          )}

          {activeTab === "backup" && (
            <BackupAndSecurity
              user={user}
              onToggle2FA={handleToggle2FA}
            />
          )}
        </main>
      </div>

      {/* Floating AI assistant widget */}
      <FloatingAssistant
        documents={documents}
        selectedDocumentId={lastSelectedDocId}
        onVoiceFilterApplied={handleVoiceFilterApplied}
      />
    </div>
  );
}
