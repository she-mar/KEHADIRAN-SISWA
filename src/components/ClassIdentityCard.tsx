import React, { useState } from 'react';
import { Calendar, School, User, BookOpen, Users, Edit3, Check, CheckCircle2 } from 'lucide-react';
import { ClassMetadata } from '../types/attendance';

interface ClassIdentityCardProps {
  metadata: ClassMetadata;
  setMetadata: (meta: ClassMetadata) => void;
  selectedDate: string;
  setSelectedDate: (date: string) => void;
  isAlreadySaved: boolean;
  lastSavedAt?: string;
}

const COMMON_SUBJECTS = [
  'Bahasa Indonesia',
  'Matematika',
  'Bahasa Inggris',
  'Fisika',
  'Kimia',
  'Biologi',
  'Sejarah Indonesia',
  'Pendidikan Pancasila & Kewarganegaraan',
  'Informatika',
  'Pendidikan Jasmani & Olahraga',
  'Seni Budaya',
  'Pendidikan Agama & Budi Pekerti',
];

const COMMON_CLASSES = [
  'X IPA 1',
  'X IPA 2',
  'X IPS 1',
  'XI MIPA 1',
  'XI MIPA 2',
  'XI IPS 1',
  'XI IPS 2',
  'XII MIPA 1',
  'XII MIPA 2',
  'XII IPS 1',
];

export const ClassIdentityCard: React.FC<ClassIdentityCardProps> = ({
  metadata,
  setMetadata,
  selectedDate,
  setSelectedDate,
  isAlreadySaved,
  lastSavedAt,
}) => {
  const [isEditingSchool, setIsEditingSchool] = useState(false);
  const [tempSchool, setTempSchool] = useState(metadata.schoolName);

  // Indonesian date formatter
  const formattedDate = (() => {
    try {
      const [y, m, d] = selectedDate.split('-').map(Number);
      const dateObj = new Date(y, m - 1, d);
      return new Intl.DateTimeFormat('id-ID', {
        weekday: 'long',
        day: 'numeric',
        month: 'long',
        year: 'numeric',
      }).format(dateObj);
    } catch {
      return selectedDate;
    }
  })();

  const handleSaveSchool = () => {
    if (tempSchool.trim()) {
      setMetadata({ ...metadata, schoolName: tempSchool.trim() });
    }
    setIsEditingSchool(false);
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200/90 shadow-xs p-5 sm:p-6 mb-6 transition-all">
      {/* Top row: School Name & Saved Badge */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-slate-100">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-700 flex items-center justify-center shrink-0 border border-blue-100">
            <School className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              {isEditingSchool ? (
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    value={tempSchool}
                    onChange={(e) => setTempSchool(e.target.value)}
                    className="text-base sm:text-lg font-bold text-slate-900 border-b-2 border-blue-600 focus:outline-hidden px-1 py-0.5"
                    autoFocus
                  />
                  <button
                    onClick={handleSaveSchool}
                    className="p-1 rounded bg-blue-600 text-white hover:bg-blue-700 transition-colors"
                  >
                    <Check className="w-4 h-4" />
                  </button>
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <h2 className="text-base sm:text-lg font-bold text-slate-900 tracking-tight">
                    {metadata.schoolName}
                  </h2>
                  <button
                    onClick={() => {
                      setTempSchool(metadata.schoolName);
                      setIsEditingSchool(true);
                    }}
                    title="Ubah Nama Sekolah"
                    className="p-1 text-slate-400 hover:text-blue-600 rounded transition-colors"
                  >
                    <Edit3 className="w-3.5 h-3.5" />
                  </button>
                </div>
              )}
            </div>
            <div className="flex items-center gap-2 text-xs text-slate-500 mt-0.5">
              <span>Tahun Ajaran {metadata.academicYear}</span>
              <span aria-hidden="true">·</span>
              <span>Semester {metadata.semester}</span>
            </div>
          </div>
        </div>

        {/* Status Indicator */}
        <div className="flex items-center gap-2 shrink-0">
          {isAlreadySaved ? (
            <div className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-50 text-emerald-700 rounded-lg text-xs font-semibold border border-emerald-200">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
              <span>Data Tersimpan</span>
              {lastSavedAt && (
                <span className="text-[11px] text-emerald-600/80 font-normal">
                  ({new Date(lastSavedAt).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })} WIB)
                </span>
              )}
            </div>
          ) : (
            <div className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 text-slate-600 rounded-lg text-xs font-medium border border-slate-200">
              <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse"></span>
              <span>Presensi Belum Disimpan</span>
            </div>
          )}
        </div>
      </div>

      {/* Grid of details: Teacher, Subject, Class, Date */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mt-5">
        {/* Guru */}
        <div className="p-3.5 rounded-xl bg-slate-50/70 border border-slate-200/70 focus-within:border-blue-400 focus-within:bg-blue-50/20 transition-all">
          <label className="flex items-center gap-1.5 text-xs font-semibold text-slate-500 mb-1">
            <User className="w-3.5 h-3.5 text-blue-600" />
            Nama Guru
          </label>
          <input
            type="text"
            value={metadata.teacherName}
            onChange={(e) => setMetadata({ ...metadata, teacherName: e.target.value })}
            placeholder="Nama Guru Pengampu"
            className="w-full text-sm font-semibold text-slate-800 bg-transparent focus:outline-hidden"
          />
        </div>

        {/* Mata Pelajaran */}
        <div className="p-3.5 rounded-xl bg-slate-50/70 border border-slate-200/70 focus-within:border-blue-400 focus-within:bg-blue-50/20 transition-all">
          <label className="flex items-center gap-1.5 text-xs font-semibold text-slate-500 mb-1">
            <BookOpen className="w-3.5 h-3.5 text-blue-600" />
            Mata Pelajaran
          </label>
          <input
            type="text"
            list="subject-presets"
            value={metadata.subject}
            onChange={(e) => setMetadata({ ...metadata, subject: e.target.value })}
            placeholder="Pilih atau ketik mapel"
            className="w-full text-sm font-semibold text-slate-800 bg-transparent focus:outline-hidden"
          />
          <datalist id="subject-presets">
            {COMMON_SUBJECTS.map((s) => (
              <option key={s} value={s} />
            ))}
          </datalist>
        </div>

        {/* Kelas */}
        <div className="p-3.5 rounded-xl bg-slate-50/70 border border-slate-200/70 focus-within:border-blue-400 focus-within:bg-blue-50/20 transition-all">
          <label className="flex items-center gap-1.5 text-xs font-semibold text-slate-500 mb-1">
            <Users className="w-3.5 h-3.5 text-blue-600" />
            Kelas
          </label>
          <input
            type="text"
            list="class-presets"
            value={metadata.className}
            onChange={(e) => setMetadata({ ...metadata, className: e.target.value })}
            placeholder="Contoh: XI MIPA 2"
            className="w-full text-sm font-semibold text-slate-800 bg-transparent focus:outline-hidden"
          />
          <datalist id="class-presets">
            {COMMON_CLASSES.map((c) => (
              <option key={c} value={c} />
            ))}
          </datalist>
        </div>

        {/* Tanggal (Date Picker) */}
        <div className="p-3.5 rounded-xl bg-blue-50/40 border border-blue-200/80 focus-within:border-blue-500 transition-all">
          <label className="flex items-center justify-between text-xs font-semibold text-blue-700 mb-1">
            <span className="flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5 text-blue-600" />
              Tanggal Presensi
            </span>
            <span className="text-[10px] text-blue-600/70 font-normal">Otomatis / Ubah</span>
          </label>
          <input
            type="date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            className="w-full text-sm font-bold text-slate-900 bg-transparent focus:outline-hidden cursor-pointer"
          />
          <div className="text-[11px] text-slate-600 truncate mt-0.5">
            {formattedDate}
          </div>
        </div>
      </div>
    </div>
  );
};
