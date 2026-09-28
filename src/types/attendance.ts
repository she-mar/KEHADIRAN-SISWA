export type AttendanceStatus = 'HADIR' | 'IZIN' | 'SAKIT' | 'ALPHA';

export interface Student {
  id: string;
  nisn: string;
  name: string;
  gender: 'L' | 'P';
}

export interface StudentAttendanceRecord {
  studentId: string;
  status: AttendanceStatus;
  note?: string;
}

export interface AttendanceSession {
  id: string; // e.g., "2026-09-28_XI-MIPA-2_Bahasa-Indonesia"
  date: string; // YYYY-MM-DD
  schoolName: string;
  teacherName: string;
  subject: string;
  className: string;
  academicYear: string;
  semester: 'Ganjil' | 'Genap';
  records: Record<string, StudentAttendanceRecord>;
  savedAt: string; // ISO string
}

export interface ClassMetadata {
  schoolName: string;
  teacherName: string;
  subject: string;
  className: string;
  academicYear: string;
  semester: 'Ganjil' | 'Genap';
}

export interface StatusMeta {
  code: AttendanceStatus;
  label: string;
  shortLabel: string;
  bgLight: string;
  border: string;
  text: string;
  activeBg: string;
  activeText: string;
  badgeBg: string;
  badgeText: string;
  dotColor: string;
}

export const STATUS_CONFIG: Record<AttendanceStatus, StatusMeta> = {
  HADIR: {
    code: 'HADIR',
    label: 'Hadir',
    shortLabel: 'H',
    bgLight: 'hover:bg-emerald-50 text-slate-700',
    border: 'border-slate-200 hover:border-emerald-300',
    text: 'text-slate-700',
    activeBg: 'bg-emerald-600 border-emerald-600 text-white shadow-sm ring-2 ring-emerald-500/20',
    activeText: 'text-white',
    badgeBg: 'bg-emerald-100 text-emerald-800',
    badgeText: 'text-emerald-700',
    dotColor: 'bg-emerald-500',
  },
  IZIN: {
    code: 'IZIN',
    label: 'Izin',
    shortLabel: 'I',
    bgLight: 'hover:bg-blue-50 text-slate-700',
    border: 'border-slate-200 hover:border-blue-300',
    text: 'text-slate-700',
    activeBg: 'bg-blue-600 border-blue-600 text-white shadow-sm ring-2 ring-blue-500/20',
    activeText: 'text-white',
    badgeBg: 'bg-blue-100 text-blue-800',
    badgeText: 'text-blue-700',
    dotColor: 'bg-blue-500',
  },
  SAKIT: {
    code: 'SAKIT',
    label: 'Sakit',
    shortLabel: 'S',
    bgLight: 'hover:bg-amber-50 text-slate-700',
    border: 'border-slate-200 hover:border-amber-300',
    text: 'text-slate-700',
    activeBg: 'bg-amber-500 border-amber-500 text-white shadow-sm ring-2 ring-amber-500/20',
    activeText: 'text-white',
    badgeBg: 'bg-amber-100 text-amber-800',
    badgeText: 'text-amber-700',
    dotColor: 'bg-amber-500',
  },
  ALPHA: {
    code: 'ALPHA',
    label: 'Alpha',
    shortLabel: 'A',
    bgLight: 'hover:bg-rose-50 text-slate-700',
    border: 'border-slate-200 hover:border-rose-300',
    text: 'text-slate-700',
    activeBg: 'bg-rose-600 border-rose-600 text-white shadow-sm ring-2 ring-rose-500/20',
    activeText: 'text-white',
    badgeBg: 'bg-rose-100 text-rose-800',
    badgeText: 'text-rose-700',
    dotColor: 'bg-rose-500',
  },
};
