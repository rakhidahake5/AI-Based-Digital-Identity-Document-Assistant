export interface User {
  id: string;
  name: string;
  email: string;
  avatar: string;
  provider: 'email' | 'google';
  otpEnabled: boolean;
  twoFactorEnabled: boolean;
  twoFactorSecret?: string;
  createdAt: string;
}

export type DocumentCategory =
  | 'Aadhaar'
  | 'PAN Card'
  | 'Passport'
  | 'Driving License'
  | 'Voter ID'
  | 'Education'
  | 'Health'
  | 'Insurance'
  | 'Finance'
  | 'Property'
  | 'Tax'
  | 'Other';

export interface SharedUser {
  userId: string;
  email: string;
  permission: 'read' | 'write';
  relation?: string;
}

export interface Document {
  id: string;
  name: string;
  type: 'pdf' | 'image' | 'other';
  mimeType: string;
  size: number;
  base64Data: string;
  textContent: string;
  category: DocumentCategory;
  categoryConfidence: number;
  summary: string;
  tags: string[];
  folderId: string | null;
  expiryDate?: string; // YYYY-MM-DD
  createdAt: string;
  updatedAt: string;
  ownerId: string;
  sharedWith: SharedUser[];
  hash: string;
  isDuplicate?: boolean;
  duplicateOfId?: string;
  missingInfo: string[];
  recommendations: string[];
  status: 'valid' | 'expiring' | 'expired' | 'none';
}

export interface Folder {
  id: string;
  name: string;
  color: string;
  ownerId: string;
  createdAt: string;
}

export interface FamilyMember {
  id: string;
  name: string;
  email: string;
  avatar: string;
  relation: 'Spouse' | 'Child' | 'Parent' | 'Sibling' | 'Other';
  permission: 'read' | 'write';
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
  documentId?: string; // If chatting about a specific document
}

export interface DocumentStats {
  categoryDistribution: { name: string; value: number; color: string }[];
  monthlyUploads: { month: string; count: number }[];
  totalSize: number;
  totalDocuments: number;
  expiryAlertsCount: number;
}
