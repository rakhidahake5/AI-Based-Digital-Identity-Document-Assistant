import React from "react";
import { 
  FileText, 
  AlertTriangle, 
  Lightbulb, 
  ShieldCheck, 
  Calendar, 
  Trash2,
  TrendingUp,
  FileCheck2,
  HardDrive
} from "lucide-react";
import { 
  ResponsiveContainer, 
  PieChart, 
  Pie, 
  Cell, 
  Tooltip, 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Legend 
} from "recharts";
import { Document, Folder } from "../types";
import GlassCard from "./GlassCard";

interface DashboardProps {
  documents: Document[];
  folders: Folder[];
  onNavigateToDocs: (folderId?: string) => void;
  onDeleteDoc: (id: string) => void;
}

export default function Dashboard({
  documents,
  folders,
  onNavigateToDocs,
  onDeleteDoc,
}: DashboardProps) {
  // 1. Calculate general stats
  const totalDocs = documents.length;
  const totalSize = documents.reduce((acc, doc) => acc + doc.size, 0);
  const formattedSize = (totalSize / (1024 * 1024)).toFixed(2); // In MB

  const expiringSoon = documents.filter((doc) => doc.status === "expiring");
  const expired = documents.filter((doc) => doc.status === "expired");
  const urgentAlerts = [...expired, ...expiringSoon];

  // 2. Category Distribution for PieChart
  const categoriesMap: { [key: string]: number } = {};
  documents.forEach((doc) => {
    categoriesMap[doc.category] = (categoriesMap[doc.category] || 0) + 1;
  });

  const categoryColors: { [key: string]: string } = {
    Aadhaar: "#3B82F6",
    "PAN Card": "#10B981",
    Passport: "#8B5CF6",
    "Driving License": "#F59E0B",
    "Voter ID": "#EC4899",
    Education: "#06B6D4",
    Health: "#EF4444",
    Insurance: "#14B8A6",
    Finance: "#6366F1",
    Property: "#F97316",
    Tax: "#84CC16",
    Other: "#64748B",
  };

  const pieData = Object.keys(categoriesMap).map((cat) => ({
    name: cat,
    value: categoriesMap[cat],
    color: categoryColors[cat] || "#6366F1",
  }));

  // 3. Monthly Trend data for BarChart
  const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  const uploadTrends = months.map((m, idx) => {
    // Check how many uploaded in this month (mocking based on creation date)
    const count = documents.filter((d) => {
      const date = new Date(d.createdAt);
      return date.getMonth() === idx;
    }).length;
    return { name: m, count };
  });

  // 4. Group all unique AI Recommendations
  const allRecommendations = documents.flatMap((d) => 
    d.recommendations.map((rec) => ({
      text: rec,
      docName: d.name,
      category: d.category,
      docId: d.id
    }))
  ).slice(0, 5); // top 5 recommendations

  const folderCount = folders.length;

  return (
    <div className="space-y-6">
      {/* Overview Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
        <GlassCard className="p-5 flex items-center gap-4 border-l-4 border-indigo-500">
          <div className="p-3.5 bg-indigo-500/10 rounded-xl text-indigo-600 dark:text-indigo-400">
            <FileText className="h-6 w-6" />
          </div>
          <div>
            <span className="text-xs font-medium text-slate-500 dark:text-slate-400">Total Documents</span>
            <h4 className="text-2xl font-bold font-sans text-slate-800 dark:text-white mt-0.5">{totalDocs}</h4>
          </div>
        </GlassCard>

        <GlassCard className="p-5 flex items-center gap-4 border-l-4 border-teal-500">
          <div className="p-3.5 bg-teal-500/10 rounded-xl text-teal-600 dark:text-teal-400">
            <HardDrive className="h-6 w-6" />
          </div>
          <div>
            <span className="text-xs font-medium text-slate-500 dark:text-slate-400">Secure Backup Size</span>
            <h4 className="text-2xl font-bold font-sans text-slate-800 dark:text-white mt-0.5">{formattedSize} MB</h4>
          </div>
        </GlassCard>

        <GlassCard className="p-5 flex items-center gap-4 border-l-4 border-amber-500">
          <div className="p-3.5 bg-amber-500/10 rounded-xl text-amber-600 dark:text-amber-400">
            <AlertTriangle className="h-6 w-6" />
          </div>
          <div>
            <span className="text-xs font-medium text-slate-500 dark:text-slate-400">Active Expiry Alerts</span>
            <h4 className="text-2xl font-bold font-sans text-slate-800 dark:text-white mt-0.5">{urgentAlerts.length}</h4>
          </div>
        </GlassCard>

        <GlassCard className="p-5 flex items-center gap-4 border-l-4 border-purple-500">
          <div className="p-3.5 bg-purple-500/10 rounded-xl text-purple-600 dark:text-purple-400">
            <ShieldCheck className="h-6 w-6" />
          </div>
          <div>
            <span className="text-xs font-medium text-slate-500 dark:text-slate-400">End-to-End Encrypted</span>
            <h4 className="text-base font-bold font-sans text-slate-800 dark:text-white mt-1.5 flex items-center gap-1.5">
              <FileCheck2 className="h-4 w-4 text-emerald-500" /> AES-256 GCM
            </h4>
          </div>
        </GlassCard>
      </div>

      {/* Critical Expiry Warnings Banner */}
      {urgentAlerts.length > 0 && (
        <GlassCard className="p-5 bg-gradient-to-r from-red-500/5 to-amber-500/5 border-red-200/50 dark:border-red-950/40">
          <div className="flex items-center gap-2.5 mb-3">
            <AlertTriangle className="h-5 w-5 text-red-500 animate-pulse" />
            <h3 className="font-sans font-semibold text-sm text-red-900 dark:text-red-300">
              Critical Actions Required
            </h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {urgentAlerts.map((doc) => {
              const isExpired = doc.status === "expired";
              return (
                <div 
                  key={doc.id} 
                  className={`p-3.5 rounded-xl border flex justify-between items-center bg-white/50 dark:bg-slate-900/40 ${
                    isExpired 
                      ? "border-red-100 dark:border-red-950/50" 
                      : "border-amber-100 dark:border-amber-950/50"
                  }`}
                >
                  <div className="min-w-0">
                    <p className="text-xs font-bold text-slate-800 dark:text-white truncate">
                      {doc.name}
                    </p>
                    <span className="inline-block px-1.5 py-0.5 rounded text-[10px] font-mono font-semibold bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 mt-1">
                      {doc.category}
                    </span>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 flex items-center gap-1">
                      <Calendar className="h-3.5 w-3.5 text-slate-400" />
                      {isExpired ? "Expired on:" : "Expires soon:"} <span className="font-semibold text-slate-700 dark:text-slate-300">{doc.expiryDate}</span>
                    </p>
                  </div>
                  <button 
                    onClick={() => onNavigateToDocs()}
                    className={`text-[10px] font-semibold px-3 py-1.5 rounded-lg transition-colors ${
                      isExpired 
                        ? "bg-red-500/10 text-red-600 hover:bg-red-500/20" 
                        : "bg-amber-500/10 text-amber-600 hover:bg-amber-500/20"
                    }`}
                  >
                    Action
                  </button>
                </div>
              );
            })}
          </div>
        </GlassCard>
      )}

      {/* Bento Layout: Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Category breakdown (Pie Chart) */}
        <GlassCard className="p-5 lg:col-span-5 flex flex-col justify-between">
          <div>
            <h3 className="font-sans font-bold text-slate-800 dark:text-white text-sm mb-1">
              Document Categories
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Distribution of documents classified by AI
            </p>
          </div>
          <div className="h-64 w-full mt-4 flex items-center justify-center">
            {pieData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    innerRadius={55}
                    outerRadius={80}
                    paddingAngle={3}
                    dataKey="value"
                  >
                    {pieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip 
                    contentStyle={{ 
                      borderRadius: "12px", 
                      background: "rgba(15, 23, 42, 0.95)", 
                      borderColor: "rgba(255,255,255,0.1)",
                      color: "#fff",
                      fontSize: "12px"
                    }} 
                  />
                  <Legend 
                    layout="horizontal" 
                    verticalAlign="bottom" 
                    align="center"
                    iconType="circle"
                    iconSize={8}
                    wrapperStyle={{ fontSize: "10px", marginTop: "10px" }}
                  />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="text-center py-10">
                <p className="text-xs text-slate-400">No documents found. Start uploading to view stats!</p>
              </div>
            )}
          </div>
        </GlassCard>

        {/* Upload activity trends (Bar Chart) */}
        <GlassCard className="p-5 lg:col-span-7 flex flex-col justify-between">
          <div>
            <div className="flex justify-between items-start">
              <div>
                <h3 className="font-sans font-bold text-slate-800 dark:text-white text-sm mb-1">
                  Upload & Scan History
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Yearly document ingestion logs and audits
                </p>
              </div>
              <div className="flex items-center gap-1.5 px-2 py-1 rounded bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 text-[10px] font-mono font-semibold">
                <TrendingUp className="h-3 w-3" />
                Active
              </div>
            </div>
          </div>
          <div className="h-64 w-full mt-4">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={uploadTrends} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(148, 163, 184, 0.1)" />
                <XAxis 
                  dataKey="name" 
                  tickLine={false} 
                  axisLine={false} 
                  tick={{ fill: "#94a3b8", fontSize: 10 }} 
                />
                <YAxis 
                  allowDecimals={false} 
                  tickLine={false} 
                  axisLine={false} 
                  tick={{ fill: "#94a3b8", fontSize: 10 }} 
                />
                <Tooltip
                  contentStyle={{ 
                    borderRadius: "12px", 
                    background: "rgba(15, 23, 42, 0.95)", 
                    borderColor: "rgba(255,255,255,0.1)",
                    color: "#fff",
                    fontSize: "12px"
                  }}
                  cursor={{ fill: "rgba(99, 102, 241, 0.05)" }}
                />
                <Bar dataKey="count" fill="url(#colorBar)" radius={[6, 6, 0, 0]}>
                  <defs>
                    <linearGradient id="colorBar" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#6366f1" stopOpacity={0.8} />
                      <stop offset="100%" stopColor="#4f46e5" stopOpacity={0.3} />
                    </linearGradient>
                  </defs>
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </GlassCard>
      </div>

      {/* AI Smart Advice & Recommendations */}
      <GlassCard className="p-5">
        <div className="flex items-center gap-2 mb-4">
          <Lightbulb className="h-5 w-5 text-amber-500" />
          <div>
            <h3 className="font-sans font-bold text-slate-800 dark:text-white text-sm mb-0.5">
              AI Smart Recommendations
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Personalized compliance suggestions derived from OCR parsing of your digital files
            </p>
          </div>
        </div>

        {allRecommendations.length > 0 ? (
          <div className="space-y-3">
            {allRecommendations.map((rec, idx) => (
              <div 
                key={idx}
                className="p-3 bg-slate-50 dark:bg-slate-900/30 hover:bg-slate-100/50 dark:hover:bg-slate-900/50 rounded-xl border border-slate-200/20 dark:border-slate-800/20 flex gap-3.5 items-start transition-colors"
              >
                <div className="h-6 w-6 shrink-0 rounded-full bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 flex items-center justify-center text-xs font-bold">
                  {idx + 1}
                </div>
                <div className="flex-1">
                  <p className="text-xs text-slate-800 dark:text-slate-300 leading-relaxed font-medium">
                    {rec.text}
                  </p>
                  <div className="flex items-center gap-1.5 mt-1.5">
                    <span className="text-[10px] font-mono text-slate-400 dark:text-slate-500 font-semibold uppercase">
                      Source:
                    </span>
                    <span className="text-[10px] bg-indigo-500/5 text-indigo-500 font-semibold px-1.5 py-0.5 rounded">
                      {rec.category} ({rec.docName})
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-10 bg-slate-50/50 dark:bg-slate-900/20 rounded-xl border border-dashed border-slate-200 dark:border-slate-800">
            <Lightbulb className="h-8 w-8 text-slate-300 dark:text-slate-700 mx-auto mb-2" />
            <p className="text-xs text-slate-400">No recommendations available. Please upload identity documents (like Aadhaar or Insurance) to trigger smart parsing!</p>
          </div>
        )}
      </GlassCard>
    </div>
  );
}
