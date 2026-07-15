import React from "react";
import { 
  LayoutDashboard, 
  FolderLock, 
  Users, 
  ShieldCheck, 
  LogOut, 
  Moon, 
  Sun,
  Fingerprint
} from "lucide-react";
import { User } from "../types";

interface SidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  user: User | null;
  onLogout: () => void;
  darkMode: boolean;
  toggleDarkMode: () => void;
}

export default function Sidebar({
  activeTab,
  setActiveTab,
  user,
  onLogout,
  darkMode,
  toggleDarkMode,
}: SidebarProps) {
  const menuItems = [
    { id: "dashboard", label: "Dashboard", icon: LayoutDashboard },
    { id: "documents", label: "My Documents", icon: FolderLock },
    { id: "family", label: "Family Sharing", icon: Users },
    { id: "backup", label: "Backup & 2FA", icon: ShieldCheck },
  ];

  return (
    <aside id="sidebar-navigation" className="w-64 bg-[#0d0d12] border-r border-[#1c1c24] flex flex-col h-full shrink-0">
      {/* Brand Header */}
      <div className="p-6 flex items-center gap-3 border-b border-[#1c1c24]/60">
        <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 flex items-center justify-center text-white shadow-md shadow-indigo-500/20">
          <Fingerprint className="h-6 w-6" />
        </div>
        <div>
          <h1 className="font-sans font-bold text-base leading-tight bg-gradient-to-r from-white to-indigo-200 bg-clip-text text-transparent">
            SecureID
          </h1>
          <span className="text-[10px] font-mono tracking-wider uppercase text-slate-500 font-semibold block">
            AI Document Vault
          </span>
        </div>
      </div>

      {/* Main Navigation Links */}
      <nav className="flex-1 px-4 py-6 space-y-1.5 overflow-y-auto">
        {menuItems.map((item) => {
          const IconComponent = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`w-full flex items-center gap-3.5 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-250 ${
                isActive
                  ? "bg-indigo-500/10 text-indigo-400 border-l-4 border-indigo-500 shadow-sm shadow-indigo-500/5 font-semibold"
                  : "text-slate-400 hover:bg-[#121216] hover:text-white"
              }`}
            >
              <IconComponent className={`h-5 w-5 ${isActive ? "text-indigo-400" : "text-slate-500"}`} />
              {item.label}
            </button>
          );
        })}
      </nav>

      {/* Footer Area - Dark Mode & User Profile */}
      <div className="p-4 border-t border-[#1c1c24]/60 space-y-4 bg-[#0a0a0c]/40">
        {/* Dark Mode Switcher */}
        <div className="flex items-center justify-between px-2">
          <span className="text-xs text-slate-400 font-medium font-mono">Theme Active</span>
          <div className="px-2 py-1 bg-[#121216] border border-[#1c1c24] rounded-lg text-[10px] font-mono uppercase text-indigo-400 font-bold">
            Elegant Dark
          </div>
        </div>

        {/* Profile Card */}
        {user && (
          <div className="flex items-center gap-3 p-2 bg-[#121216]/60 border border-[#1c1c24]/40 rounded-xl">
            <img
              src={user.avatar}
              alt={user.name}
              className="h-10 w-10 rounded-lg object-cover ring-2 ring-indigo-500/20"
            />
            <div className="flex-1 min-w-0">
              <p className="text-xs font-semibold text-white truncate">
                {user.name}
              </p>
              <p className="text-[10px] text-slate-500 truncate font-mono">
                {user.email}
              </p>
            </div>
            <button
              onClick={onLogout}
              className="p-1.5 rounded-lg text-slate-400 hover:text-red-500 hover:bg-red-500/10 transition-colors"
              title="Logout"
            >
              <LogOut className="h-4 w-4" />
            </button>
          </div>
        )}
      </div>
    </aside>
  );
}
