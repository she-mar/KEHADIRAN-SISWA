import React, { useState, useEffect } from 'react';
import {
  Student,
  AttendanceSession,
  AttendanceStatus,
  ClassMetadata,
  StudentAttendanceRecord,
} from './types/attendance';
import {
  loadStudents,
  saveStudents,
  loadClassMeta,
  saveClassMeta,
  loadAttendanceSessions,
  saveOrUpdateSession,
  resetToDefaults,
} from './utils/storage';
import { sounds } from './utils/audio';
import { Header } from './components/Header';
import { ClassIdentityCard } from './components/ClassIdentityCard';
import { AttendanceTable } from './components/AttendanceTable';
import { AddStudentModal } from './components/AddStudentModal';
import { SaveSuccessModal } from './components/SaveSuccessModal';
import { RecapView } from './components/RecapView';
import { PrintReportView } from './components/PrintReportView';

export default function App() {
  const [activeTab, setActiveTab] = useState<'attendance' | 'recap'>('attendance');
  const [students, setStudents] = useState<Student[]>([]);
  const [metadata, setMetadata] = useState<ClassMetadata>(loadClassMeta());
  const [sessions, setSessions] = useState<AttendanceSession[]>([]);
  
  // Default to today's date (2026-09-28)
  const [selectedDate, setSelectedDate] = useState<string>('2026-09-28');

  // Attendance records for the active date session
  const [currentRecords, setCurrentRecords] = useState<Record<string, StudentAttendanceRecord>>({});
  const [isSaving, setIsSaving] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(true);

  // Modals state
  const [isAddStudentOpen, setIsAddStudentOpen] = useState(false);
  const [editingStudent, setEditingStudent] = useState<Student | null>(null);
  const [isSuccessModalOpen, setIsSuccessModalOpen] = useState(false);
  const [savedSessionData, setSavedSessionData] = useState<AttendanceSession | null>(null);

  // Print Modal
  const [isPrintModalOpen, setIsPrintModalOpen] = useState(false);
  const [printMode, setPrintMode] = useState<'monthly' | 'daily'>('monthly');
  const [printSessionTarget, setPrintSessionTarget] = useState<AttendanceSession | null>(null);

  // Load initial data
  useEffect(() => {
    const loadedStudents = loadStudents();
    setStudents(loadedStudents);

    const loadedMeta = loadClassMeta();
    setMetadata(loadedMeta);

    const loadedSessions = loadAttendanceSessions();
    setSessions(loadedSessions);
  }, []);

  // When selectedDate, class, or subject changes, load existing session if available
  useEffect(() => {
    if (!selectedDate || !metadata.className || !metadata.subject) return;

    const existingSession = sessions.find(
      (s) =>
        s.date === selectedDate &&
        s.className === metadata.className &&
        s.subject === metadata.subject
    );

    if (existingSession) {
      setCurrentRecords(existingSession.records || {});
    } else {
      // Initialize with empty records or existing statuses
      setCurrentRecords({});
    }
  }, [selectedDate, metadata.className, metadata.subject, sessions]);

  // Check if current date session is already saved
  const existingSession = sessions.find(
    (s) =>
      s.date === selectedDate &&
      s.className === metadata.className &&
      s.subject === metadata.subject
  );
  const isAlreadySaved = Boolean(existingSession);

  // Mark All Present (Hadir Semua)
  const handleMarkAllPresent = () => {
    const updated: Record<string, StudentAttendanceRecord> = { ...currentRecords };
    students.forEach((student) => {
      updated[student.id] = {
        studentId: student.id,
        status: 'HADIR',
        note: updated[student.id]?.note || '',
      };
    });
    setCurrentRecords(updated);
    sounds.playAllPresent();
  };

  // Change individual student attendance status
  const handleStatusChange = (studentId: string, status: AttendanceStatus) => {
    setCurrentRecords((prev) => ({
      ...prev,
      [studentId]: {
        studentId,
        status,
        note: prev[studentId]?.note || '',
      },
    }));
  };

  // Change individual student note
  const handleNoteChange = (studentId: string, note: string) => {
    setCurrentRecords((prev) => ({
      ...prev,
      [studentId]: {
        studentId,
        status: prev[studentId]?.status || 'HADIR',
        note,
      },
    }));
  };

  // Add or Edit student
  const handleSaveStudent = (savedStudent: Student) => {
    let updated: Student[];
    const index = students.findIndex((s) => s.id === savedStudent.id);
    if (index >= 0) {
      updated = [...students];
      updated[index] = savedStudent;
    } else {
      updated = [...students, savedStudent];
    }
    setStudents(updated);
    saveStudents(updated);
  };

  // Delete student
  const handleDeleteStudent = (studentId: string) => {
    const updated = students.filter((s) => s.id !== studentId);
    setStudents(updated);
    saveStudents(updated);

    const updatedRecords = { ...currentRecords };
    delete updatedRecords[studentId];
    setCurrentRecords(updatedRecords);
  };

  // Save / Kirim Presensi
  const handleSaveAttendance = () => {
    setIsSaving(true);

    // Auto-mark any unmarked student as HADIR by default to ensure complete record,
    // or preserve their state
    const completeRecords: Record<string, StudentAttendanceRecord> = { ...currentRecords };
    students.forEach((s) => {
      if (!completeRecords[s.id]) {
        completeRecords[s.id] = {
          studentId: s.id,
          status: 'HADIR',
        };
      }
    });

    const sessionId = `${selectedDate}_${metadata.className.replace(/\s+/g, '-')}_${metadata.subject.replace(/\s+/g, '-')}`;
    const newSession: AttendanceSession = {
      id: sessionId,
      date: selectedDate,
      schoolName: metadata.schoolName,
      teacherName: metadata.teacherName,
      subject: metadata.subject,
      className: metadata.className,
      academicYear: metadata.academicYear,
      semester: metadata.semester,
      records: completeRecords,
      savedAt: new Date().toISOString(),
    };

    // Save to storage
    const updatedSessions = saveOrUpdateSession(newSession);
    setSessions(updatedSessions);
    saveClassMeta(metadata);
    setCurrentRecords(completeRecords);

    // Audio & Visual celebratory feedback
    sounds.playSuccess();
    setSavedSessionData(newSession);
    setIsSaving(false);
    setIsSuccessModalOpen(true);
  };

  // Trigger Print modal
  const handleTriggerPrint = (mode: 'monthly' | 'daily', target?: AttendanceSession) => {
    setPrintMode(mode);
    setPrintSessionTarget(target || existingSession || null);
    setIsPrintModalOpen(true);
  };

  // Reset to default sample data
  const handleResetData = () => {
    if (window.confirm('Kembalikan ke data simulasi bawaan? Perubahan kustom akan direset.')) {
      resetToDefaults();
      const freshStudents = loadStudents();
      const freshMeta = loadClassMeta();
      const freshSessions = loadAttendanceSessions();
      setStudents(freshStudents);
      setMetadata(freshMeta);
      setSessions(freshSessions);
      setSelectedDate('2026-09-28');
    }
  };

  return (
    <div className="min-h-screen bg-slate-50/70 text-slate-800 flex flex-col font-sans">
      {/* Top Header */}
      <Header
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onResetData={handleResetData}
        soundEnabled={soundEnabled}
        setSoundEnabled={setSoundEnabled}
      />

      {/* Main Page Viewport */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        {/* TAB 1: FORMULIR & DAFTAR HADIR */}
        {activeTab === 'attendance' && (
          <div className="animate-in fade-in duration-150">
            {/* Page Header Title */}
            <div className="mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
                  Formulir Presensi Kelas
                </h1>
                <p className="text-xs sm:text-sm text-slate-500 mt-1">
                  Catat kehadiran peserta didik secara cepat, akurat, dan interaktif.
                </p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleTriggerPrint('daily', existingSession || undefined)}
                  className="flex items-center gap-2 px-3.5 py-2 text-xs font-semibold text-slate-700 bg-white hover:bg-slate-100 rounded-xl border border-slate-200 transition-colors shadow-xs"
                >
                  Pratinjau Cetak Hari Ini
                </button>
              </div>
            </div>

            {/* School & Class Identity Card */}
            <ClassIdentityCard
              metadata={metadata}
              setMetadata={setMetadata}
              selectedDate={selectedDate}
              setSelectedDate={setSelectedDate}
              isAlreadySaved={isAlreadySaved}
              lastSavedAt={existingSession?.savedAt}
            />

            {/* Attendance Table & Interactive Buttons */}
            <AttendanceTable
              students={students}
              records={currentRecords}
              onStatusChange={handleStatusChange}
              onNoteChange={handleNoteChange}
              onMarkAllPresent={handleMarkAllPresent}
              onOpenAddStudent={() => {
                setEditingStudent(null);
                setIsAddStudentOpen(true);
              }}
              onEditStudent={(std) => {
                setEditingStudent(std);
                setIsAddStudentOpen(true);
              }}
              onDeleteStudent={handleDeleteStudent}
              onSaveAttendance={handleSaveAttendance}
              isSaving={isSaving}
            />
          </div>
        )}

        {/* TAB 2: REKAPITULASI KEHADIRAN */}
        {activeTab === 'recap' && (
          <div className="animate-in fade-in duration-150">
            {/* Page Header Title */}
            <div className="mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
                  Rekapitulasi Kehadiran Siswa
                </h1>
                <p className="text-xs sm:text-sm text-slate-500 mt-1">
                  Pantau statistik kehadiran harian dan matriks bulanan secara komprehensif.
                </p>
              </div>
            </div>

            <RecapView
              sessions={sessions}
              students={students}
              currentClass={metadata.className}
              currentSubject={metadata.subject}
              schoolName={metadata.schoolName}
              teacherName={metadata.teacherName}
              onSelectSessionToView={(sess) => {
                setSelectedDate(sess.date);
                setMetadata((prev) => ({
                  ...prev,
                  className: sess.className,
                  subject: sess.subject,
                }));
                setActiveTab('attendance');
              }}
              onTriggerPrint={handleTriggerPrint}
            />
          </div>
        )}
      </main>

      {/* Add / Edit Student Modal */}
      <AddStudentModal
        isOpen={isAddStudentOpen}
        onClose={() => {
          setIsAddStudentOpen(false);
          setEditingStudent(null);
        }}
        onSaveStudent={handleSaveStudent}
        editingStudent={editingStudent}
      />

      {/* Save Success Celebratory Modal */}
      <SaveSuccessModal
        isOpen={isSuccessModalOpen}
        onClose={() => setIsSuccessModalOpen(false)}
        session={savedSessionData}
        onGoToRecap={() => {
          setIsSuccessModalOpen(false);
          setActiveTab('recap');
        }}
        onPrintSession={() => {
          setIsSuccessModalOpen(false);
          handleTriggerPrint('daily', savedSessionData || undefined);
        }}
      />

      {/* Official Print View Dialog */}
      <PrintReportView
        mode={printMode}
        isOpen={isPrintModalOpen}
        onClose={() => setIsPrintModalOpen(false)}
        session={printSessionTarget}
        sessions={sessions}
        students={students}
        schoolName={metadata.schoolName}
        teacherName={metadata.teacherName}
        className={metadata.className}
        subject={metadata.subject}
        year={parseInt(selectedDate.split('-')[0], 10) || 2026}
        month={parseInt(selectedDate.split('-')[1], 10) || 9}
      />

      {/* Footer */}
      <footer className="bg-white border-t border-slate-200 py-6 text-center text-xs text-slate-500 no-print">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <p>© 2026 HadirKu — Sistem Presensi Digital Kelas & Sekolah Terpadu.</p>
          <p className="text-[11px] text-slate-400">
            Dirancang untuk Guru, Tenaga Pendidik, dan Administrasi Sekolah.
          </p>
        </div>
      </footer>
    </div>
  );
}
