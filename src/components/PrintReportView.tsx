import React from 'react';
import { Printer, X, Download } from 'lucide-react';
import { AttendanceSession, Student, AttendanceStatus } from '../types/attendance';

interface PrintReportViewProps {
  mode: 'monthly' | 'daily';
  isOpen: boolean;
  onClose: () => void;
  session?: AttendanceSession | null;
  sessions: AttendanceSession[];
  students: Student[];
  schoolName: string;
  teacherName: string;
  className: string;
  subject: string;
  year: number;
  month: number;
}

const MONTH_NAMES = [
  'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
  'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember',
];

export const PrintReportView: React.FC<PrintReportViewProps> = ({
  mode,
  isOpen,
  onClose,
  session,
  sessions,
  students,
  schoolName,
  teacherName,
  className,
  subject,
  year,
  month,
}) => {
  if (!isOpen) return null;

  const handlePrint = () => {
    window.print();
  };

  // Month prefix
  const monthPrefix = `${year}-${String(month).padStart(2, '0')}`;
  const monthSessions = sessions
    .filter((s) => s.date.startsWith(monthPrefix) && s.className === className)
    .sort((a, b) => a.date.localeCompare(b.date));

  const totalEffectiveDays = monthSessions.length;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex justify-center p-4 sm:p-6 print:p-0 print:bg-white print:fixed-none">
      <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full p-6 sm:p-10 my-auto print:shadow-none print:m-0 print:p-0 print:max-w-none print:w-full">
        {/* On-screen control bar (hidden in print) */}
        <div className="no-print flex items-center justify-between pb-6 mb-6 border-b border-slate-200">
          <div>
            <h4 className="text-base font-bold text-slate-900">
              Pratinjau Cetak Laporan Presensi
            </h4>
            <p className="text-xs text-slate-500">
              Format siap cetak dengan Kop Surat resmi dan lembar pengesahan.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="flex items-center gap-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow-xs transition-colors cursor-pointer"
            >
              <Printer className="w-4 h-4" />
              <span>Cetak Sekarang (Print)</span>
            </button>
            <button
              onClick={onClose}
              className="p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* PRINTABLE CONTENT AREA */}
        <div className="text-black bg-white print:w-full">
          {/* Official Kop Surat */}
          <div className="text-center pb-3 border-b-2 border-black relative">
            <div className="uppercase tracking-widest text-[11px] font-semibold text-slate-800">
              Pemerintah Daerah Provinsi · Dinas Pendidikan dan Kebudayaan
            </div>
            <h1 className="text-lg sm:text-xl font-extrabold uppercase tracking-wide mt-0.5 text-black">
              {schoolName}
            </h1>
            <p className="text-[11px] text-slate-600">
              Jalan Pendidikan No. 45 · Telp. (021) 7890123 · Email: info@sekolah.sch.id
            </p>
          </div>
          {/* Double underline standard for Kop Surat */}
          <div className="border-b border-black mt-[2px] mb-4"></div>

          {/* Report Title */}
          <div className="text-center my-3">
            <h2 className="text-sm sm:text-base font-bold uppercase underline">
              {mode === 'daily'
                ? 'Laporan Presensi Harian Siswa'
                : 'Laporan Rekapitulasi Presensi Bulanan Siswa'}
            </h2>
            <div className="text-xs font-semibold text-slate-700 mt-1">
              {mode === 'daily' && session ? (
                <span>Tanggal: {session.date}</span>
              ) : (
                <span>
                  Periode: {MONTH_NAMES[month - 1]} {year}
                </span>
              )}
            </div>
          </div>

          {/* Identity Table */}
          <div className="grid grid-cols-2 gap-4 text-xs mb-4 py-2 border-y border-slate-300">
            <div className="space-y-1">
              <div>
                <span className="font-semibold text-slate-600 w-28 inline-block">
                  Mata Pelajaran:
                </span>
                <span className="font-bold">{subject}</span>
              </div>
              <div>
                <span className="font-semibold text-slate-600 w-28 inline-block">Kelas:</span>
                <span className="font-bold">{className}</span>
              </div>
            </div>
            <div className="space-y-1">
              <div>
                <span className="font-semibold text-slate-600 w-28 inline-block">
                  Guru Pengampu:
                </span>
                <span className="font-bold">{teacherName}</span>
              </div>
              <div>
                <span className="font-semibold text-slate-600 w-28 inline-block">
                  Tahun Ajaran:
                </span>
                <span className="font-bold">2026/2027 (Ganjil)</span>
              </div>
            </div>
          </div>

          {/* Daily Table Mode */}
          {mode === 'daily' && session && (
            <table className="w-full text-left border-collapse border border-slate-400 text-xs">
              <thead>
                <tr className="bg-slate-100 font-bold border-b border-slate-400">
                  <th className="py-2 px-3 w-10 text-center border-r border-slate-400">No</th>
                  <th className="py-2 px-3 border-r border-slate-400">NISN</th>
                  <th className="py-2 px-3 border-r border-slate-400">Nama Siswa</th>
                  <th className="py-2 px-2 text-center border-r border-slate-400 w-12">L/P</th>
                  <th className="py-2 px-3 text-center border-r border-slate-400 w-28">Status</th>
                  <th className="py-2 px-3">Keterangan</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-300">
                {students.map((std, idx) => {
                  const rec = session.records[std.id];
                  const status = rec?.status || '-';
                  const note = rec?.note || '-';

                  return (
                    <tr key={std.id} className="border-b border-slate-300">
                      <td className="py-1.5 px-3 text-center border-r border-slate-300 tabular-nums">
                        {idx + 1}
                      </td>
                      <td className="py-1.5 px-3 font-mono border-r border-slate-300">
                        {std.nisn}
                      </td>
                      <td className="py-1.5 px-3 font-semibold border-r border-slate-300">
                        {std.name}
                      </td>
                      <td className="py-1.5 px-2 text-center border-r border-slate-300">
                        {std.gender}
                      </td>
                      <td className="py-1.5 px-3 text-center font-bold border-r border-slate-300">
                        {status}
                      </td>
                      <td className="py-1.5 px-3 text-slate-700 italic">{note}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}

          {/* Monthly Table Mode */}
          {mode === 'monthly' && (
            <table className="w-full text-left border-collapse border border-slate-400 text-xs">
              <thead>
                <tr className="bg-slate-100 font-bold border-b border-slate-400">
                  <th className="py-2 px-2 w-8 text-center border-r border-slate-400">No</th>
                  <th className="py-2 px-3 border-r border-slate-400">Nama Siswa</th>
                  <th className="py-2 px-2 text-center border-r border-slate-400 w-10">L/P</th>
                  {monthSessions.map((sess) => (
                    <th
                      key={sess.id}
                      className="py-1.5 px-1 text-center border-r border-slate-400 w-6 tabular-nums"
                    >
                      {sess.date.split('-')[2]}
                    </th>
                  ))}
                  <th className="py-2 px-2 text-center border-r border-slate-400 w-8">H</th>
                  <th className="py-2 px-2 text-center border-r border-slate-400 w-8">I</th>
                  <th className="py-2 px-2 text-center border-r border-slate-400 w-8">S</th>
                  <th className="py-2 px-2 text-center border-r border-slate-400 w-8">A</th>
                  <th className="py-2 px-2 text-center w-12 font-bold">%</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-300">
                {students.map((std, idx) => {
                  let h = 0;
                  let i = 0;
                  let s = 0;
                  let a = 0;

                  const sessionCells = monthSessions.map((sess) => {
                    const rec = sess.records[std.id];
                    let code = '-';
                    if (rec) {
                      if (rec.status === 'HADIR') {
                        h++;
                        code = 'H';
                      } else if (rec.status === 'IZIN') {
                        i++;
                        code = 'I';
                      } else if (rec.status === 'SAKIT') {
                        s++;
                        code = 'S';
                      } else if (rec.status === 'ALPHA') {
                        a++;
                        code = 'A';
                      }
                    }
                    return (
                      <td
                        key={sess.id}
                        className="py-1 px-1 text-center border-r border-slate-300 font-bold"
                      >
                        {code}
                      </td>
                    );
                  });

                  const pct =
                    totalEffectiveDays > 0 ? Math.round((h / totalEffectiveDays) * 100) : 0;

                  return (
                    <tr key={std.id} className="border-b border-slate-300">
                      <td className="py-1 px-2 text-center border-r border-slate-300 tabular-nums">
                        {idx + 1}
                      </td>
                      <td className="py-1 px-3 border-r border-slate-300 font-semibold">
                        {std.name}
                      </td>
                      <td className="py-1 px-2 text-center border-r border-slate-300">
                        {std.gender}
                      </td>
                      {sessionCells}
                      <td className="py-1 px-2 text-center font-bold border-r border-slate-300">
                        {h}
                      </td>
                      <td className="py-1 px-2 text-center font-bold border-r border-slate-300">
                        {i}
                      </td>
                      <td className="py-1 px-2 text-center font-bold border-r border-slate-300">
                        {s}
                      </td>
                      <td className="py-1 px-2 text-center font-bold border-r border-slate-300">
                        {a}
                      </td>
                      <td className="py-1 px-2 text-center font-bold">{pct}%</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}

          {/* Signatures Block (Lembar Pengesahan) */}
          <div className="mt-8 pt-4 grid grid-cols-2 text-xs">
            <div className="text-center">
              <p>Mengetahui,</p>
              <p className="font-semibold">Kepala Sekolah {schoolName}</p>
              <div className="h-16"></div>
              <p className="font-bold underline">Drs. H. Bambang Sudarmono, M.Pd.</p>
              <p className="text-[11px] text-slate-600">NIP. 19680512 199303 1 004</p>
            </div>

            <div className="text-center">
              <p>Jakarta, 28 September 2026</p>
              <p className="font-semibold">Guru Pengampu Mata Pelajaran</p>
              <div className="h-16"></div>
              <p className="font-bold underline">{teacherName}</p>
              <p className="text-[11px] text-slate-600">NIP. 19840215 200801 2 007</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
