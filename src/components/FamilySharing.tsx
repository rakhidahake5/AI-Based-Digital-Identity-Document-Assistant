import React, { useState } from "react";
import { 
  Users, 
  UserPlus, 
  Mail, 
  Eye, 
  Edit, 
  Trash2, 
  ShieldAlert, 
  FolderCheck,
  Check,
  X,
  FileText
} from "lucide-react";
import { FamilyMember, Document } from "../types";
import GlassCard from "./GlassCard";

interface FamilySharingProps {
  familyMembers: FamilyMember[];
  documents: Document[];
  onAddMember: (member: any) => Promise<FamilyMember>;
  onDeleteMember: (id: string) => Promise<void>;
}

export default function FamilySharing({
  familyMembers,
  documents,
  onAddMember,
  onDeleteMember,
}: FamilySharingProps) {
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [relation, setRelation] = useState<"Spouse" | "Child" | "Parent" | "Sibling" | "Other">("Spouse");
  const [permission, setPermission] = useState<"read" | "write">("read");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !email) return;

    try {
      await onAddMember({ name, email, relation, permission });
      setName("");
      setEmail("");
      setIsAddOpen(false);
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="space-y-6">
      {/* Upper header */}
      <div className="flex flex-col sm:flex-row justify-between gap-4">
        <div>
          <h2 className="font-sans font-bold text-slate-800 dark:text-white text-lg">
            Family Document Sharing
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Set up encrypted identity nodes to sync critical family documentation safely during medical emergencies or travels
          </p>
        </div>

        <button
          onClick={() => setIsAddOpen(true)}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white shadow-md shadow-indigo-500/10 cursor-pointer self-start sm:self-auto transition-transform hover:scale-101"
        >
          <UserPlus className="h-4 w-4" />
          Add Family Member
        </button>
      </div>

      {/* Grid of members */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <div className="space-y-4">
          <h3 className="text-xs font-semibold text-slate-400 dark:text-slate-500 tracking-wide uppercase font-mono">
            Access Circles
          </h3>
          {familyMembers.length === 0 ? (
            <div className="p-8 text-center rounded-xl border border-dashed border-slate-200 dark:border-slate-800">
              <Users className="h-8 w-8 text-slate-300 mx-auto mb-2" />
              <p className="text-xs text-slate-400">No family members registered yet.</p>
            </div>
          ) : (
            <div className="space-y-3.5">
              {familyMembers.map((member) => {
                // Find docs shared with this member
                const sharedDocs = documents.filter((d) => 
                  d.sharedWith.some((s) => s.userId === member.id || s.email === member.email)
                );

                return (
                  <GlassCard key={member.id} className="p-4 flex flex-col justify-between">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <img 
                          src={member.avatar} 
                          alt={member.name} 
                          className="h-11 w-11 rounded-xl object-cover ring-2 ring-indigo-500/10" 
                        />
                        <div>
                          <h4 className="font-sans font-bold text-slate-800 dark:text-white text-sm">
                            {member.name}
                          </h4>
                          <span className="inline-block px-1.5 py-0.5 rounded text-[9px] font-mono font-semibold bg-slate-100 dark:bg-slate-800 text-slate-500 mt-1 uppercase">
                            {member.relation}
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center gap-1.5">
                        <span className={`text-[10px] font-semibold px-2 py-1 rounded-md flex items-center gap-1 ${
                          member.permission === "write"
                            ? "bg-emerald-500/10 text-emerald-600"
                            : "bg-indigo-500/10 text-indigo-500"
                        }`}>
                          {member.permission === "write" ? <Edit className="h-3 w-3" /> : <Eye className="h-3 w-3" />}
                          {member.permission === "write" ? "Read/Write" : "Read-Only"}
                        </span>
                        
                        <button
                          onClick={async () => {
                            if (confirm(`Remove family member "${member.name}"? Revoking access closes cryptographic nodes immediately.`)) {
                              await onDeleteMember(member.id);
                            }
                          }}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-red-500 hover:bg-red-500/10 transition-colors"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </div>

                    <div className="mt-4 pt-3 border-t border-slate-200/40 dark:border-slate-800/40 flex justify-between items-center text-[10px] text-slate-400 dark:text-slate-500">
                      <span className="flex items-center gap-1 font-medium text-slate-500 dark:text-slate-400">
                        <Mail className="h-3.5 w-3.5" />
                        {member.email}
                      </span>
                      <span className="bg-slate-100 dark:bg-slate-900 px-2 py-0.5 rounded font-bold">
                        {sharedDocs.length} Shared Documents
                      </span>
                    </div>
                  </GlassCard>
                );
              })}
            </div>
          )}
        </div>

        {/* Security / Audit Information */}
        <div className="space-y-4">
          <h3 className="text-xs font-semibold text-slate-400 dark:text-slate-500 tracking-wide uppercase font-mono">
            Permission Logs
          </h3>
          <GlassCard className="p-5 space-y-4">
            <div className="flex items-start gap-3">
              <FolderCheck className="h-5 w-5 text-indigo-500 shrink-0 mt-0.5" />
              <div>
                <h4 className="text-xs font-bold text-slate-800 dark:text-white">Emergency Key Sync</h4>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">
                  By default, documents are isolated with end-to-end zero-knowledge encryption on your profile. When you share with a family member:
                </p>
                <ul className="list-disc list-inside text-[10px] text-slate-400 mt-2 space-y-1 pl-1">
                  <li>They will see shared items under their secure dashboard</li>
                  <li><strong>Read-Only</strong> members cannot delete or alter tags</li>
                  <li><strong>Read/Write</strong> members can append comments or trigger renewals</li>
                </ul>
              </div>
            </div>

            <div className="p-3 bg-amber-500/5 rounded-xl border border-amber-200/20 dark:border-amber-950/25 flex gap-2.5 items-start">
              <ShieldAlert className="h-5 w-5 text-amber-500 shrink-0 mt-0.5" />
              <div>
                <h4 className="text-xs font-bold text-amber-800 dark:text-amber-400">Immediate Revocation Invariant</h4>
                <p className="text-[10px] text-slate-500 dark:text-slate-400 leading-relaxed mt-1">
                  Once a family member node is deleted, all decryption channels collapse instantly, ensuring zero metadata leakages.
                </p>
              </div>
            </div>
          </GlassCard>
        </div>
      </div>

      {/* ADD MEMBER MODAL */}
      {isAddOpen && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <GlassCard className="p-6 max-w-sm w-full space-y-4">
            <div className="flex justify-between items-center border-b border-slate-200/20 dark:border-slate-800/20 pb-3">
              <h3 className="font-sans font-bold text-sm text-slate-800 dark:text-white">Add Family Member</h3>
              <button onClick={() => setIsAddOpen(false)} className="text-slate-400 hover:text-slate-600">
                <X className="h-4 w-4" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="text-xs text-slate-400 block mb-1">Full Name</label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Anjali Ahake"
                  className="w-full bg-slate-50 dark:bg-slate-900 text-slate-800 dark:text-white text-xs px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-850 focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="text-xs text-slate-400 block mb-1">Email Address</label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="spouse@example.com"
                  className="w-full bg-slate-50 dark:bg-slate-900 text-slate-800 dark:text-white text-xs px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-850 focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs text-slate-400 block mb-1">Relation</label>
                  <select
                    value={relation}
                    onChange={(e: any) => setRelation(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-slate-900 text-slate-800 dark:text-white text-xs px-2.5 py-2 rounded-xl border border-slate-200 dark:border-slate-850 focus:outline-none"
                  >
                    <option value="Spouse">Spouse</option>
                    <option value="Child">Child</option>
                    <option value="Parent">Parent</option>
                    <option value="Sibling">Sibling</option>
                    <option value="Other">Other</option>
                  </select>
                </div>

                <div>
                  <label className="text-xs text-slate-400 block mb-1">Access Level</label>
                  <select
                    value={permission}
                    onChange={(e: any) => setPermission(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-slate-900 text-slate-800 dark:text-white text-xs px-2.5 py-2 rounded-xl border border-slate-200 dark:border-slate-850 focus:outline-none"
                  >
                    <option value="read">Read Only</option>
                    <option value="write">Read & Write</option>
                  </select>
                </div>
              </div>

              <button
                type="submit"
                className="w-full bg-indigo-500 hover:bg-indigo-600 text-white text-xs font-semibold py-2.5 rounded-xl cursor-pointer"
              >
                Enroll Member
              </button>
            </form>
          </GlassCard>
        </div>
      )}
    </div>
  );
}
