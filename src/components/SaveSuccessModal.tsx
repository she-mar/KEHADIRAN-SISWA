import React, { useEffect } from 'react';
import confetti from 'canvas-confetti';
import { CheckCircle2, Calendar, Users, Printer, ArrowRight, X } from 'lucide-react';
import { AttendanceSession } from '../types/attendance';

interface SaveSuccessModalProps {
  isOpen: boolean;
  onClose: () => void;
  session: AttendanceSession | null;
  onGoToRecap: () => void;
  onPrintSession: () => void;
}

export const SaveSuccessModal: React.FC<SaveSuccessModalProps> = ({
  isOpen,
  onClose,
  session,
  onGoToRecap,
  onPrintSession,
}) => {
  useEffect(() => {
    if (isOpen) {
      // Fire festive school-themed confetti
      try {
        confetti({
          particleCount: 80,
          spread: 70,
          origin: { y: 0.6 },
          colors: ['#2563eb', '#10b981', '#38bdf8', '#f59e0b'],
        });
      } catch {
        // ignore
      }
    }
  }, [isOpen]);

  if (!isOpen || !session) return null;

  // Calculate session summary stats
  const total = Object.keys(session.records).length;
  let hadir = 0;
  let izin = 0;
  let sakit = 0;
  let alpha = 0;

  Object.values(session.records).forEach((r) => {
    if (r.status === 'HADIR') hadir++;
    else if (r.status === 'IZIN') izin++;
    else if (r.status === 'SAKIT') sakit++;
    else if (r.status === 'ALPHA') alpha++;
  });

  const percent = total > 0 ? Math.round((hadir / total) * 100) : 0;

  const formattedDate = (() => {
    try {
      const [y, m, d] = session.date.split('-').map(Number);
      return new Intl.DateTimeFormat('id-ID', {
        weekday: 'long',
        day: 'numeric',
        month: 'long',
        year: 'numeric',
      }).format(new Date(y, m - 1, d));
    } catch {
      return session.date;
    }
  })();

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs transition-opacity animate-in fade-in duration-200">
      <div
        className="bg-white rounded-3xl shadow-2xl border border-slate-200 w-full max-w-lg overflow-hidden animate-in zoom-in-95 duration-200"
        role="dialog"
        aria-modal="true"
      >
        {/* Top Header graphic */}
        <div className="bg-gradient-to-br from-blue-700 via-blue-600 to-sky-600 p-6 text-white text-center relative">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-1.5 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
          
          <div className="w-16 h-16 mx-auto mb-3 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center shadow-inner">
            <CheckCircle2 className="w-9 h-9 text-white" />
          </div>
          
          <h3 className="text-xl font-extrabold tracking-tight">Presensi Berhasil Disimpan!</h3>
          <p className="text-xs text-blue-100 mt-1">
            Data kehadiran siswa telah tercatat dan tersimpan rapi di sistem.
          </p>
        </div>

        {/* Content body */}
        <div className="p-6 space-y-5">
          {/* Metadata banner */}
          <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200/80 text-xs space-y-1.5">
            <div className="flex items-center justify-between text-slate-700">
              <span className="font-medium text-slate-500">Sekolah & Kelas:</span>
              <span className="font-bold text-slate-900">
                {session.className} · {session.schoolName}
              </span>
            </div>
            <div className="flex items-center justify-between text-slate-700">
              <span className="font-medium text-slate-500">Mata Pelajaran:</span>
              <span className="font-semibold text-slate-800">{session.subject}</span>
            </div>
            <div className="flex items-center justify-between text-slate-700">
              <span className="font-medium text-slate-500">Tanggal:</span>
              <span className="font-semibold text-slate-800">{formattedDate}</span>
            </div>
            <div className="flex items-center justify-between text-slate-700">
              <span className="font-medium text-slate-500">Guru Pengampu:</span>
              <span className="font-semibold text-slate-800">{session.teacherName}</span>
            </div>
          </div>

          {/* Quick Stats Grid */}
          <div className="grid grid-cols-4 gap-2 text-center">
            <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200">
              <span className="text-[10px] font-bold text-emerald-800 block uppercase">Hadir</span>
              <span className="text-lg font-extrabold text-emerald-600 tabular-nums">{hadir}</span>
            </div>
            <div className="p-3 rounded-xl bg-blue-50 border border-blue-200">
              <span className="text-[10px] font-bold text-blue-800 block uppercase">Izin</span>
              <span className="text-lg font-extrabold text-blue-600 tabular-nums">{izin}</span>
            </div>
            <div className="p-3 rounded-xl bg-amber-50 border border-amber-200">
              <span className="text-[10px] font-bold text-amber-800 block uppercase">Sakit</span>
              <span className="text-lg font-extrabold text-amber-600 tabular-nums">{sakit}</span>
            </div>
            <div className="p-3 rounded-xl bg-rose-50 border border-rose-200">
              <span className="text-[10px] font-bold text-rose-800 block uppercase">Alpha</span>
              <span className="text-lg font-extrabold text-rose-600 tabular-nums">{alpha}</span>
            </div>
          </div>

          {/* Percentage highlight */}
          <div className="p-3 bg-blue-50/60 rounded-xl border border-blue-100 flex items-center justify-between">
            <span className="text-xs font-semibold text-blue-900">Tingkat Kehadiran Kelas</span>
            <span className="text-base font-extrabold text-blue-700 tabular-nums">{percent}%</span>
          </div>

          {/* Action buttons */}
          <div className="pt-2 flex flex-col sm:flex-row items-center gap-2.5">
            <button
              onClick={() => {
                onClose();
                onGoToRecap();
              }}
              className="w-full flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl shadow-xs transition-colors cursor-pointer"
            >
              <span>Buka Rekapitulasi</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>

            <button
              onClick={() => {
                onClose();
                onPrintSession();
              }}
              className="w-full sm:w-auto flex items-center justify-center gap-2 px-4 py-2.5 bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold rounded-xl border border-slate-200 transition-colors cursor-pointer"
            >
              <Printer className="w-3.5 h-3.5 text-slate-500" />
              <span>Cetak Bukti</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
