import { AttendanceSession, ClassMetadata, Student, AttendanceStatus } from '../types/attendance';

export const DEFAULT_STUDENTS: Student[] = [
  { id: 'std-01', nisn: '0078912341', name: 'Ahmad Fauzi Pratama', gender: 'L' },
  { id: 'std-02', nisn: '0078912342', name: 'Annisa Nurul Hidayah', gender: 'P' },
  { id: 'std-03', nisn: '0078912343', name: 'Bima Satria Wicaksono', gender: 'L' },
  { id: 'std-04', nisn: '0078912344', name: 'Cantika Dewi Maharani', gender: 'P' },
  { id: 'std-05', nisn: '0078912345', name: 'Dafa Alamsyah Putra', gender: 'L' },
  { id: 'std-06', nisn: '0078912346', name: 'Dinda Lestari Wulandari', gender: 'P' },
  { id: 'std-07', nisn: '0078912347', name: 'Fajar Nugroho Saputro', gender: 'L' },
  { id: 'std-08', nisn: '0078912348', name: 'Gita Permatasari', gender: 'P' },
  { id: 'std-09', nisn: '0078912349', name: 'Hafiz Rizky Ramadhan', gender: 'L' },
  { id: 'std-10', nisn: '0078912350', name: 'Indah Cahyaningrum', gender: 'P' },
  { id: 'std-11', nisn: '0078912351', name: 'Jevon Nathan Alexander', gender: 'L' },
  { id: 'std-12', nisn: '0078912352', name: 'Keisha Salma Salsabila', gender: 'P' },
  { id: 'std-13', nisn: '0078912353', name: 'Muhammad Rayhan Kusuma', gender: 'L' },
  { id: 'std-14', nisn: '0078912354', name: 'Nabila Syakirah Putri', gender: 'P' },
  { id: 'std-15', nisn: '0078912355', name: 'Rangga Danendra Wijaya', gender: 'L' },
  { id: 'std-16', nisn: '0078912356', name: 'Safira Aulia Rahmawati', gender: 'P' },
  { id: 'std-17', nisn: '0078912357', name: 'Tegar Arya Pangestu', gender: 'L' },
  { id: 'std-18', nisn: '0078912358', name: 'Zahra Amelia Santoso', gender: 'P' },
];

export const DEFAULT_CLASS_META: ClassMetadata = {
  schoolName: 'SMA Negeri 1 Harapan Bangsa',
  teacherName: 'Ibu Siti Nurhaliza, S.Pd.',
  subject: 'Bahasa Indonesia',
  className: 'XI MIPA 2',
  academicYear: '2026/2027',
  semester: 'Ganjil',
};

const STORAGE_KEYS = {
  STUDENTS: 'hadirku_students_v1',
  CLASS_META: 'hadirku_class_meta_v1',
  SESSIONS: 'hadirku_attendance_sessions_v1',
};

// Generate realistic past sessions for demo
function generateInitialSessions(): AttendanceSession[] {
  const dates = [
    '2026-09-01',
    '2026-09-04',
    '2026-09-08',
    '2026-09-11',
    '2026-09-15',
    '2026-09-18',
    '2026-09-22',
    '2026-09-25',
  ];

  return dates.map((date, idx) => {
    const records: Record<string, { studentId: string; status: AttendanceStatus; note?: string }> = {};

    DEFAULT_STUDENTS.forEach((student, sIdx) => {
      // Create occasional absence for realism
      let status: AttendanceStatus = 'HADIR';
      let note: string | undefined = undefined;

      if ((sIdx + idx) % 17 === 0) {
        status = 'SAKIT';
        note = 'Demam flu';
      } else if ((sIdx + idx * 2) % 21 === 0) {
        status = 'IZIN';
        note = 'Dispensasi lomba OSN';
      } else if (sIdx === 14 && idx === 3) {
        status = 'ALPHA';
        note = 'Tanpa keterangan';
      }

      records[student.id] = {
        studentId: student.id,
        status,
        note,
      };
    });

    return {
      id: `${date}_${DEFAULT_CLASS_META.className.replace(/\s+/g, '-')}_${DEFAULT_CLASS_META.subject.replace(/\s+/g, '-')}`,
      date,
      schoolName: DEFAULT_CLASS_META.schoolName,
      teacherName: DEFAULT_CLASS_META.teacherName,
      subject: DEFAULT_CLASS_META.subject,
      className: DEFAULT_CLASS_META.className,
      academicYear: DEFAULT_CLASS_META.academicYear,
      semester: DEFAULT_CLASS_META.semester,
      records,
      savedAt: `${date}T07:45:00.000Z`,
    };
  });
}

export function loadStudents(): Student[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.STUDENTS);
    if (!raw) {
      saveStudents(DEFAULT_STUDENTS);
      return DEFAULT_STUDENTS;
    }
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) && parsed.length > 0 ? parsed : DEFAULT_STUDENTS;
  } catch {
    return DEFAULT_STUDENTS;
  }
}

export function saveStudents(students: Student[]): void {
  try {
    localStorage.setItem(STORAGE_KEYS.STUDENTS, JSON.stringify(students));
  } catch (err) {
    console.error('Failed to save students to localStorage', err);
  }
}

export function loadClassMeta(): ClassMetadata {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.CLASS_META);
    if (!raw) {
      saveClassMeta(DEFAULT_CLASS_META);
      return DEFAULT_CLASS_META;
    }
    return JSON.parse(raw);
  } catch {
    return DEFAULT_CLASS_META;
  }
}

export function saveClassMeta(meta: ClassMetadata): void {
  try {
    localStorage.setItem(STORAGE_KEYS.CLASS_META, JSON.stringify(meta));
  } catch (err) {
    console.error('Failed to save class meta to localStorage', err);
  }
}

export function loadAttendanceSessions(): AttendanceSession[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.SESSIONS);
    if (!raw) {
      const initial = generateInitialSessions();
      saveAttendanceSessions(initial);
      return initial;
    }
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function saveAttendanceSessions(sessions: AttendanceSession[]): void {
  try {
    localStorage.setItem(STORAGE_KEYS.SESSIONS, JSON.stringify(sessions));
  } catch (err) {
    console.error('Failed to save sessions to localStorage', err);
  }
}

export function saveOrUpdateSession(newSession: AttendanceSession): AttendanceSession[] {
  const current = loadAttendanceSessions();
  const index = current.findIndex(
    (s) =>
      s.date === newSession.date &&
      s.className === newSession.className &&
      s.subject === newSession.subject
  );

  let updated: AttendanceSession[];
  if (index >= 0) {
    updated = [...current];
    updated[index] = newSession;
  } else {
    updated = [newSession, ...current];
  }

  saveAttendanceSessions(updated);
  return updated;
}

export function resetToDefaults(): void {
  localStorage.removeItem(STORAGE_KEYS.STUDENTS);
  localStorage.removeItem(STORAGE_KEYS.CLASS_META);
  localStorage.removeItem(STORAGE_KEYS.SESSIONS);
}
