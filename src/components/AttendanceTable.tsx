import React, { useState } from 'react';
import {
  CheckCheck,
  UserPlus,
  Search,
  CheckCircle2,
  Clock,
  AlertTriangle,
  XCircle,
  HelpCircle,
  Edit2,
  Trash2,
  Save,
  MessageSquare,
  Sparkles,
} from 'lucide-react';
import {
  AttendanceStatus,
  STATUS_CONFIG,
  Student,
  StudentAttendanceRecord,
} from '../types/attendance';
import { sounds } from '../utils/audio';

interface AttendanceTableProps {
  students: Student[];
  records: Record<string, StudentAttendanceRecord>;
  onStatusChange: (studentId: string, status: AttendanceStatus) => void;
  onNoteChange: (studentId: string, note: string) => void;
  onMarkAllPresent: () => void;
  onOpenAddStudent: () => void;
  onEditStudent: (student: Student) => void;
  onDeleteStudent: (studentId: string) => void;
  onSaveAttendance: () => void;
  isSaving: boolean;
}

export const AttendanceTable: React.FC<AttendanceTableProps> = ({
  students,
  records,
  onStatusChange,
  onNoteChange,
  onMarkAllPresent,
  onOpenAddStudent,
  onEditStudent,
  onDeleteStudent,
  onSaveAttendance,
  isSaving,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState<'ALL' | AttendanceStatus | 'UNMARKED'>('ALL');
  const [activeNoteStudentId, setActiveNoteStudentId] = useState<string | null>(null);

  // Calculate live statistics
  const totalStudents = students.length;
  let hadirCount = 0;
  let izinCount = 0;
  let sakitCount = 0;
  let alphaCount = 0;
  let unmarkedCount = 0;

  students.forEach((s) => {
    const status = records[s.id]?.status;
    if (status === 'HADIR') hadirCount++;
    else if (status === 'IZIN') izinCount++;
    else if (status === 'SAKIT') sakitCount++;
    else if (status === 'ALPHA') alphaCount++;
    else unmarkedCount++;
  });

  const markedCount = totalStudents - unmarkedCount;
  const attendanceRate = totalStudents > 0 ? Math.round((hadirCount / totalStudents) * 100) : 0;

  // Filter students by search and status filter
  const filteredStudents = students.filter((s) => {
    const matchesSearch =
      s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.nisn.includes(searchQuery);

    if (!matchesSearch) return false;

    if (activeFilter === 'ALL') return true;
    const currentStatus = records[s.id]?.status;
    if (activeFilter === 'UNMARKED') return !currentStatus;
    return currentStatus === activeFilter;
  });

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden mb-12">
      {/* Top Action Toolbar */}
      <div className="p-4 sm:p-6 border-b border-slate-200/80 bg-slate-50/50 flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        
        {/* Left: Quick Actions */}
        <div className="flex flex-wrap items-center gap-2.5">
          {/* Tombol Hadir Semua */}
          <button
            onClick={onMarkAllPresent}
            type="button"
            className="flex items-center gap-2 px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white font-semibold text-xs sm:text-sm rounded-xl shadow-xs shadow-emerald-600/20 transition-all cursor-pointer whitespace-nowrap"
          >
            <CheckCheck className="w-4 h-4 text-emerald-100" />
            <span>Hadir Semua</span>
          </button>

          {/* Tombol Tambah Siswa */}
          <button
            onClick={onOpenAddStudent}
            type="button"
            className="flex items-center gap-2 px-4 py-2.5 bg-white hover:bg-slate-50 active:bg-slate-100 text-slate-700 font-semibold text-xs sm:text-sm rounded-xl border border-slate-200 transition-all cursor-pointer whitespace-nowrap"
          >
            <UserPlus className="w-4 h-4 text-blue-600" />
            <span>Tambah Siswa</span>
          </button>

          <span className="text-xs text-slate-400 hidden xl:inline">
            Status kehadiran tetap dapat diubah manual per siswa.
          </span>
        </div>

        {/* Right: Search & Filter */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5">
          {/* Search Input */}
          <div className="relative min-w-[220px]">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Cari siswa atau NISN..."
              className="w-full pl-9 pr-3 py-2 text-xs sm:text-sm rounded-xl border border-slate-200 bg-white placeholder:text-slate-400 focus:outline-hidden focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all"
            />
          </div>

          {/* Status Filter Segment */}
          <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl overflow-x-auto text-xs font-medium text-slate-600">
            <button
              onClick={() => setActiveFilter('ALL')}
              className={`px-2.5 py-1.5 rounded-lg whitespace-nowrap transition-all ${
                activeFilter === 'ALL'
                  ? 'bg-white text-slate-900 font-bold shadow-xs'
                  : 'hover:text-slate-900'
              }`}
            >
              Semua ({totalStudents})
            </button>
            <button
              onClick={() => setActiveFilter('HADIR')}
              className={`px-2.5 py-1.5 rounded-lg whitespace-nowrap transition-all ${
                activeFilter === 'HADIR'
                  ? 'bg-emerald-600 text-white font-bold shadow-xs'
                  : 'hover:text-slate-900'
              }`}
            >
              H ({hadirCount})
            </button>
            <button
              onClick={() => setActiveFilter('IZIN')}
              className={`px-2.5 py-1.5 rounded-lg whitespace-nowrap transition-all ${
                activeFilter === 'IZIN'
                  ? 'bg-blue-600 text-white font-bold shadow-xs'
                  : 'hover:text-slate-900'
              }`}
            >
              I ({izinCount})
            </button>
            <button
              onClick={() => setActiveFilter('SAKIT')}
              className={`px-2.5 py-1.5 rounded-lg whitespace-nowrap transition-all ${
                activeFilter === 'SAKIT'
                  ? 'bg-amber-500 text-white font-bold shadow-xs'
                  : 'hover:text-slate-900'
              }`}
            >
              S ({sakitCount})
            </button>
            <button
              onClick={() => setActiveFilter('ALPHA')}
              className={`px-2.5 py-1.5 rounded-lg whitespace-nowrap transition-all ${
                activeFilter === 'ALPHA'
                  ? 'bg-rose-600 text-white font-bold shadow-xs'
                  : 'hover:text-slate-900'
              }`}
            >
              A ({alphaCount})
            </button>
            {unmarkedCount > 0 && (
              <button
                onClick={() => setActiveFilter('UNMARKED')}
                className={`px-2.5 py-1.5 rounded-lg whitespace-nowrap transition-all ${
                  activeFilter === 'UNMARKED'
                    ? 'bg-slate-700 text-white font-bold shadow-xs'
                    : 'text-amber-700 hover:text-slate-900'
                }`}
              >
                Belum ({unmarkedCount})
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Summary KPI Bar */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 divide-x divide-y sm:divide-y-0 divide-slate-100 border-b border-slate-200 bg-white">
        <div className="p-3.5 sm:p-4 text-center">
          <span className="block text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
            Total Siswa
          </span>
          <span className="text-xl sm:text-2xl font-extrabold text-slate-900 tabular-nums">
            {totalStudents}
          </span>
        </div>

        <div className="p-3.5 sm:p-4 text-center bg-emerald-50/30">
          <span className="block text-[11px] font-semibold text-emerald-700 uppercase tracking-wider">
            Hadir (H)
          </span>
          <span className="text-xl sm:text-2xl font-extrabold text-emerald-600 tabular-nums">
            {hadirCount}
          </span>
        </div>

        <div className="p-3.5 sm:p-4 text-center bg-blue-50/30">
          <span className="block text-[11px] font-semibold text-blue-700 uppercase tracking-wider">
            Izin (I)
          </span>
          <span className="text-xl sm:text-2xl font-extrabold text-blue-600 tabular-nums">
            {izinCount}
          </span>
        </div>

        <div className="p-3.5 sm:p-4 text-center bg-amber-50/30">
          <span className="block text-[11px] font-semibold text-amber-700 uppercase tracking-wider">
            Sakit (S)
          </span>
          <span className="text-xl sm:text-2xl font-extrabold text-amber-600 tabular-nums">
            {sakitCount}
          </span>
        </div>

        <div className="p-3.5 sm:p-4 text-center bg-rose-50/30">
          <span className="block text-[11px] font-semibold text-rose-700 uppercase tracking-wider">
            Alpha (A)
          </span>
          <span className="text-xl sm:text-2xl font-extrabold text-rose-600 tabular-nums">
            {alphaCount}
          </span>
        </div>

        <div className="p-3.5 sm:p-4 text-center bg-slate-50/60">
          <span className="block text-[11px] font-semibold text-slate-600 uppercase tracking-wider">
            Kehadiran Kelas
          </span>
          <span className="text-xl sm:text-2xl font-extrabold text-slate-900 tabular-nums">
            {attendanceRate}%
          </span>
        </div>
      </div>

      {/* Main Table View */}
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-slate-200 bg-slate-50/75 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
              <th className="py-3 px-4 w-12 text-center">No</th>
              <th className="py-3 px-4 min-w-[200px]">Nama Siswa</th>
              <th className="py-3 px-4 w-32 font-mono">NISN</th>
              <th className="py-3 px-4 w-16 text-center">L/P</th>
              <th className="py-3 px-4 min-w-[340px] text-center">Status Kehadiran</th>
              <th className="py-3 px-4 w-20 text-center">Aksi</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {filteredStudents.length === 0 ? (
              <tr>
                <td colSpan={6} className="py-12 text-center text-slate-500 text-sm">
                  <div className="max-w-xs mx-auto space-y-2">
                    <p className="font-semibold text-slate-700">Tidak ada siswa yang sesuai kriteria.</p>
                    <p className="text-xs text-slate-400">
                      Coba ganti kata kunci pencarian atau ubah filter status di atas.
                    </p>
                  </div>
                </td>
              </tr>
            ) : (
              filteredStudents.map((student, idx) => {
                const record = records[student.id];
                const currentStatus = record?.status;
                const hasNote = Boolean(record?.note && record.note.trim());
                const isNoteOpen = activeNoteStudentId === student.id;

                return (
                  <tr
                    key={student.id}
                    className="hover:bg-slate-50/70 transition-colors group"
                  >
                    {/* Column 1: No */}
                    <td className="py-3.5 px-4 text-center text-xs font-semibold text-slate-400 tabular-nums">
                      {idx + 1}
                    </td>

                    {/* Column 2: Nama Siswa */}
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-3">
                        {/* Avatar */}
                        <div
                          className={`w-9 h-9 rounded-xl flex items-center justify-center font-bold text-xs shrink-0 ${
                            student.gender === 'L'
                              ? 'bg-blue-100 text-blue-800'
                              : 'bg-purple-100 text-purple-800'
                          }`}
                        >
                          {student.name
                            .split(' ')
                            .slice(0, 2)
                            .map((n) => n[0])
                            .join('')}
                        </div>
                        <div className="min-w-0">
                          <span className="block font-semibold text-sm text-slate-900 truncate">
                            {student.name}
                          </span>
                          {/* Note snippet if present */}
                          {hasNote && !isNoteOpen && (
                            <span className="block text-[11px] text-amber-700 truncate italic">
                              Ket: {record.note}
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Expandable note input */}
                      {isNoteOpen && (
                        <div className="mt-2 flex items-center gap-2">
                          <input
                            type="text"
                            value={record?.note || ''}
                            onChange={(e) => onNoteChange(student.id, e.target.value)}
                            placeholder="Tulis alasan izin, sakit, atau catatan..."
                            className="text-xs px-2.5 py-1.5 rounded-lg border border-slate-300 w-full focus:outline-hidden focus:border-blue-500"
                            autoFocus
                          />
                          <button
                            type="button"
                            onClick={() => setActiveNoteStudentId(null)}
                            className="px-2 py-1 text-[11px] bg-slate-200 text-slate-700 rounded-lg hover:bg-slate-300"
                          >
                            Tutup
                          </button>
                        </div>
                      )}
                    </td>

                    {/* Column 3: NISN */}
                    <td className="py-3.5 px-4 text-xs font-mono text-slate-600 tabular-nums">
                      {student.nisn}
                    </td>

                    {/* Column 4: Gender */}
                    <td className="py-3.5 px-4 text-center">
                      <span
                        className={`inline-block px-2 py-0.5 text-[11px] font-bold rounded-md ${
                          student.gender === 'L'
                            ? 'bg-blue-50 text-blue-700'
                            : 'bg-purple-50 text-purple-700'
                        }`}
                      >
                        {student.gender}
                      </span>
                    </td>

                    {/* Column 5: Status Kehadiran (Interactive 4-button group) */}
                    <td className="py-3.5 px-4">
                      <div className="flex items-center justify-center gap-1.5 sm:gap-2">
                        {/* HADIR */}
                        <button
                          type="button"
                          onClick={() => {
                            onStatusChange(student.id, 'HADIR');
                            sounds.playTap();
                          }}
                          className={`flex-1 sm:flex-none flex items-center justify-center gap-1.5 px-3 py-2 sm:py-2.5 rounded-xl text-xs font-bold transition-all min-w-[70px] sm:min-w-[80px] min-h-[42px] cursor-pointer ${
                            currentStatus === 'HADIR'
                              ? STATUS_CONFIG.HADIR.activeBg
                              : 'bg-slate-100 hover:bg-emerald-50 text-slate-700 hover:text-emerald-700 border border-slate-200/80 hover:border-emerald-300'
                          }`}
                        >
                          <span className="sm:hidden font-extrabold text-sm">H</span>
                          <span className="hidden sm:inline">Hadir</span>
                        </button>

                        {/* IZIN */}
                        <button
                          type="button"
                          onClick={() => {
                            onStatusChange(student.id, 'IZIN');
                            sounds.playTap();
                            if (!record?.note) setActiveNoteStudentId(student.id);
                          }}
                          className={`flex-1 sm:flex-none flex items-center justify-center gap-1.5 px-3 py-2 sm:py-2.5 rounded-xl text-xs font-bold transition-all min-w-[70px] sm:min-w-[80px] min-h-[42px] cursor-pointer ${
                            currentStatus === 'IZIN'
                              ? STATUS_CONFIG.IZIN.activeBg
                              : 'bg-slate-100 hover:bg-blue-50 text-slate-700 hover:text-blue-700 border border-slate-200/80 hover:border-blue-300'
                          }`}
                        >
                          <span className="sm:hidden font-extrabold text-sm">I</span>
                          <span className="hidden sm:inline">Izin</span>
                        </button>

                        {/* SAKIT */}
                        <button
                          type="button"
                          onClick={() => {
                            onStatusChange(student.id, 'SAKIT');
                            sounds.playTap();
                            if (!record?.note) setActiveNoteStudentId(student.id);
                          }}
                          className={`flex-1 sm:flex-none flex items-center justify-center gap-1.5 px-3 py-2 sm:py-2.5 rounded-xl text-xs font-bold transition-all min-w-[70px] sm:min-w-[80px] min-h-[42px] cursor-pointer ${
                            currentStatus === 'SAKIT'
                              ? STATUS_CONFIG.SAKIT.activeBg
                              : 'bg-slate-100 hover:bg-amber-50 text-slate-700 hover:text-amber-700 border border-slate-200/80 hover:border-amber-300'
                          }`}
                        >
                          <span className="sm:hidden font-extrabold text-sm">S</span>
                          <span className="hidden sm:inline">Sakit</span>
                        </button>

                        {/* ALPHA */}
                        <button
                          type="button"
                          onClick={() => {
                            onStatusChange(student.id, 'ALPHA');
                            sounds.playTap();
                          }}
                          className={`flex-1 sm:flex-none flex items-center justify-center gap-1.5 px-3 py-2 sm:py-2.5 rounded-xl text-xs font-bold transition-all min-w-[70px] sm:min-w-[80px] min-h-[42px] cursor-pointer ${
                            currentStatus === 'ALPHA'
                              ? STATUS_CONFIG.ALPHA.activeBg
                              : 'bg-slate-100 hover:bg-rose-50 text-slate-700 hover:text-rose-700 border border-slate-200/80 hover:border-rose-300'
                          }`}
                        >
                          <span className="sm:hidden font-extrabold text-sm">A</span>
                          <span className="hidden sm:inline">Alpha</span>
                        </button>
                      </div>
                    </td>

                    {/* Column 6: Actions (Edit Student, Add Note, Delete) */}
                    <td className="py-3.5 px-4 text-center">
                      <div className="flex items-center justify-center gap-1">
                        <button
                          type="button"
                          onClick={() => setActiveNoteStudentId(isNoteOpen ? null : student.id)}
                          title={hasNote ? 'Edit Catatan' : 'Tambah Catatan Izin/Sakit'}
                          className={`p-1.5 rounded-lg transition-colors ${
                            hasNote
                              ? 'text-blue-600 bg-blue-50'
                              : 'text-slate-400 hover:text-slate-700 hover:bg-slate-100'
                          }`}
                        >
                          <MessageSquare className="w-4 h-4" />
                        </button>

                        <button
                          type="button"
                          onClick={() => onEditStudent(student)}
                          title="Edit Siswa"
                          className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>

                        <button
                          type="button"
                          onClick={() => {
                            if (window.confirm(`Hapus siswa ${student.name} dari daftar?`)) {
                              onDeleteStudent(student.id);
                            }
                          }}
                          title="Hapus Siswa"
                          className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Sticky Bottom Save / Kirim Bar */}
      <div className="sticky bottom-0 z-20 p-4 sm:p-5 bg-white border-t border-slate-200 shadow-lg flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-3 w-full sm:w-auto">
          <div className="w-2.5 h-2.5 rounded-full bg-blue-600"></div>
          <div className="text-xs sm:text-sm text-slate-700">
            <span className="font-bold text-slate-900">{markedCount}</span> dari{' '}
            <span className="font-bold text-slate-900">{totalStudents}</span> siswa telah diabsen{' '}
            <span className="text-slate-500 font-mono">({hadirCount}H, {izinCount}I, {sakitCount}S, {alphaCount}A)</span>
          </div>
        </div>

        {/* Action Button: Kirim / Simpan */}
        <button
          onClick={onSaveAttendance}
          disabled={isSaving}
          className="w-full sm:w-auto flex items-center justify-center gap-2.5 px-6 py-3 bg-gradient-to-r from-blue-700 to-blue-600 hover:from-blue-800 hover:to-blue-700 text-white font-bold text-sm rounded-xl shadow-md shadow-blue-600/25 active:scale-[0.99] transition-all cursor-pointer disabled:opacity-50"
        >
          <Save className="w-4 h-4" />
          <span>{isSaving ? 'Menyimpan...' : 'Kirim & Simpan Presensi'}</span>
        </button>
      </div>
    </div>
  );
};
