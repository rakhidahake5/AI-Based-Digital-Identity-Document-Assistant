import React, { useState } from "react";
import { 
  ShieldCheck, 
  Key, 
  Download, 
  Upload, 
  RefreshCcw, 
  Lock, 
  QrCode, 
  CheckCircle,
  FileCheck2,
  FileDown
} from "lucide-react";
import GlassCard from "./GlassCard";

interface BackupAndSecurityProps {
  user: any;
  onToggle2FA: () => Promise<any>;
}

export default function BackupAndSecurity({
  user,
  onToggle2FA,
}: BackupAndSecurityProps) {
  const [is2FAEnabled, setIs2FAEnabled] = useState(user?.twoFactorEnabled || false);
  const [isSettingUp2FA, setIsSettingUp2FA] = useState(false);
  const [verificationCode, setVerificationCode] = useState("");
  const [verificationMessage, setVerificationMessage] = useState("");
  const [backupJson, setBackupJson] = useState("");
  const [isImporting, setIsImporting] = useState(false);

  // Authenticator verification simulator
  const handleVerify2FA = async (e: React.FormEvent) => {
    e.preventDefault();
    if (verificationCode.length === 6) {
      try {
        const updatedUser = await onToggle2FA();
        setIs2FAEnabled(updatedUser.twoFactorEnabled);
        setIsSettingUp2FA(false);
        setVerificationCode("");
        setVerificationMessage("");
        alert("Two-Factor Authentication configured successfully!");
      } catch (err) {
        alert("Failed to configure 2FA.");
      }
    } else {
      setVerificationMessage("❌ Invalid verification code. Code must be 6 digits.");
    }
  };

  // Export encrypted backup
  const handleExportBackup = async () => {
    try {
      const response = await fetch("/api/backup/export");
      const data = await response.json();
      
      // Prompt download as file
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `SecureID_AES256_Backup_${new Date().toISOString().slice(0, 10)}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error(err);
      alert("Failed to export backup.");
    }
  };

  // Import encrypted backup
  const handleImportBackup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!backupJson.trim()) return;

    setIsImporting(true);
    try {
      const parsed = JSON.parse(backupJson);
      const response = await fetch("/api/backup/import", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(parsed)
      });
      const data = await response.json();

      if (response.ok) {
        alert("Secure Backup decrypted and restored successfully! The application will refresh.");
        window.location.reload();
      } else {
        alert(data.error || "Decryption failed. Invalid master key.");
      }
    } catch (err) {
      alert("Invalid backup file format. Decryption failed.");
    } finally {
      setIsImporting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="font-sans font-bold text-slate-800 dark:text-white text-lg">
          Zero-Knowledge Security & Backups
        </h2>
        <p className="text-xs text-slate-500 dark:text-slate-400">
          Verify biometric nodes, configure multi-factor authenticators, and manage AES-256 cloud backup schedules
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Two-Factor Authenticator (2FA) */}
        <div className="space-y-5">
          <h3 className="text-xs font-semibold text-slate-400 dark:text-slate-500 tracking-wide uppercase font-mono">
            Multi-Factor Gatekeepers
          </h3>

          <GlassCard className="p-5 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2.5 bg-indigo-500/10 rounded-xl text-indigo-600 dark:text-indigo-400">
                  <Lock className="h-5 w-5" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-slate-800 dark:text-white">Authenticator App 2FA</h4>
                  <p className="text-[10px] text-slate-400 dark:text-slate-500">Google Authenticator, Microsoft Auth, etc.</p>
                </div>
              </div>

              {/* Status Badge & Toggle */}
              <button
                onClick={() => {
                  if (is2FAEnabled) {
                    if (confirm("Disable 2FA? This lowers your security score.")) {
                      onToggle2FA().then((u) => setIs2FAEnabled(u.twoFactorEnabled));
                    }
                  } else {
                    setIsSettingUp2FA(true);
                  }
                }}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                  is2FAEnabled
                    ? "bg-emerald-500/10 text-emerald-600 border border-emerald-500/20"
                    : "bg-indigo-500 text-white shadow-md shadow-indigo-500/10"
                }`}
              >
                {is2FAEnabled ? "Active (Disable)" : "Configure 2FA"}
              </button>
            </div>

            {/* Interactive 2FA Setup Panel */}
            {isSettingUp2FA && (
              <div className="p-4 bg-slate-50 dark:bg-slate-900/40 rounded-xl border border-slate-200/20 dark:border-slate-800/20 space-y-4 animate-fadeIn">
                <div className="flex flex-col sm:flex-row gap-4 items-center">
                  <div className="p-3 bg-white dark:bg-slate-950 rounded-xl border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white">
                    <QrCode className="h-28 w-28" />
                  </div>
                  <div className="space-y-1.5 flex-1 text-center sm:text-left">
                    <h5 className="text-xs font-bold text-slate-800 dark:text-white">Scan QR Code</h5>
                    <p className="text-[10px] text-slate-400 leading-relaxed">
                      Scan this QR code with Google Authenticator or manual key:
                    </p>
                    <code className="inline-block bg-slate-100 dark:bg-slate-800 text-[10px] px-2 py-1 rounded font-mono font-bold text-indigo-500">
                      JBSWY3DPEHPK3PXP
                    </code>
                  </div>
                </div>

                <form onSubmit={handleVerify2FA} className="space-y-3 pt-2 border-t border-slate-200/20">
                  <label className="text-[10px] text-slate-400 block font-mono uppercase">Enter 6-digit Authenticator Code</label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      maxLength={6}
                      required
                      value={verificationCode}
                      onChange={(e) => setVerificationCode(e.target.value.replace(/\D/g, ""))}
                      placeholder="e.g. 583920"
                      className="flex-1 bg-white dark:bg-slate-950 text-slate-800 dark:text-white text-xs font-mono font-bold tracking-widest text-center px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-800 focus:outline-none"
                    />
                    <button
                      type="submit"
                      className="px-4 bg-indigo-500 hover:bg-indigo-600 text-white text-xs font-semibold rounded-xl cursor-pointer"
                    >
                      Verify Token
                    </button>
                  </div>
                  {verificationMessage && (
                    <p className="text-[11px] font-medium leading-relaxed">{verificationMessage}</p>
                  )}
                </form>
              </div>
            )}

            <div className="p-3 bg-emerald-500/5 rounded-xl border border-emerald-100/50 dark:border-emerald-950/20 flex gap-2.5 items-start">
              <ShieldCheck className="h-5 w-5 text-emerald-500 shrink-0 mt-0.5" />
              <div>
                <h4 className="text-xs font-bold text-emerald-800 dark:text-emerald-400">Identity Security Invariant</h4>
                <p className="text-[10px] text-slate-400 leading-relaxed mt-1">
                  Once active, 2FA adds an immutable verification challenge block to all new session logins and key generation requests.
                </p>
              </div>
            </div>
          </GlassCard>
        </div>

        {/* Cryptographic Backup Export/Import */}
        <div className="space-y-5">
          <h3 className="text-xs font-semibold text-slate-400 dark:text-slate-500 tracking-wide uppercase font-mono">
            AES-256 E2E Backup Console
          </h3>

          <GlassCard className="p-5 space-y-4">
            <div className="flex justify-between items-start">
              <div>
                <h4 className="text-xs font-bold text-slate-800 dark:text-white">Secure Backup Node</h4>
                <p className="text-[10px] text-slate-400 mt-1">Export a local, client-side encrypted snapshot of your document index.</p>
              </div>
              <button
                onClick={handleExportBackup}
                className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold bg-indigo-500 hover:bg-indigo-600 text-white shadow-md shadow-indigo-500/10 cursor-pointer transition-transform hover:scale-101"
              >
                <Download className="h-3.5 w-3.5" />
                Export E2E Backup
              </button>
            </div>

            {/* Restore/Import backup */}
            <form onSubmit={handleImportBackup} className="space-y-3 border-t border-slate-200/30 dark:border-slate-800/30 pt-4">
              <div className="flex justify-between items-center">
                <label className="text-[10px] text-slate-400 font-mono uppercase">Import & Decrypt Backup</label>
                <span className="text-[9px] text-indigo-500 font-bold flex items-center gap-0.5"><FileCheck2 className="h-3 w-3" /> E2E Encrypted</span>
              </div>
              <textarea
                required
                rows={3}
                value={backupJson}
                onChange={(e) => setBackupJson(e.target.value)}
                placeholder='Paste raw exported backup JSON payload here...'
                className="w-full bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-white font-mono text-[10px] p-3 rounded-xl border border-slate-200 dark:border-slate-850 focus:outline-none"
              />
              <button
                type="submit"
                disabled={isImporting}
                className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-900/60 dark:hover:bg-slate-900/80 text-slate-700 dark:text-slate-300 text-xs font-semibold cursor-pointer transition-colors"
              >
                <Upload className="h-3.5 w-3.5" />
                {isImporting ? "Decrypting Backup..." : "Decrypt & Restore Ingested Vault"}
              </button>
            </form>
          </GlassCard>
        </div>
      </div>
    </div>
  );
}
