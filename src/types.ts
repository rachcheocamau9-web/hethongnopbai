export interface Competition {
  id: string;
  title: string;
  description: string;
  startDate: string; // ISO string format (YYYY-MM-DDTHH:mm)
  endDate: string;   // ISO string format (YYYY-MM-DDTHH:mm)
  allowedTypes: ('pdf' | 'image')[];
  maxFileSizeMb: number;
  status?: 'active' | 'upcoming' | 'ended';
  createdAt: string;
}

export interface Submission {
  id: string;
  competitionId: string;
  competitionTitle: string;
  fullName: string;
  phoneNumber?: string;
  email?: string;
  studentCode?: string;
  notes?: string;
  fileName: string;
  fileSize: number; // in bytes
  fileType: string; // mime type
  fileData: string; // base64 / data URL for stored file
  submittedAt: string; // ISO string format
  status: 'pending' | 'approved' | 'rejected';
}

export type AdminTab = 'submissions' | 'competitions' | 'analytics';
