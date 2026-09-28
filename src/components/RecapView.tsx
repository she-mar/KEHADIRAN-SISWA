import React, { useState, useMemo } from 'react';
import {
  Calendar,
  FileSpreadsheet,
  Printer,
  Search,
  Filter,
  Users,
  Award,
  AlertCircle,
  Clock,
  ChevronRight,
  TrendingUp,
  BookOpen,
} from 'lucide-react';
import { AttendanceSession, Student, AttendanceStatus } from '../types/attendance';
import { exportDailyRecapToCSV, exportMonthlyRecapToCSV } from '../utils/export';

interface RecapViewProps {
  sessions: AttendanceSession[];
  students: Student[];
  currentClass: string;
  currentSubject: string;
  schoolName: string;
  teacherName: string;
  onSelectSessionToView: (session: AttendanceSession) => void;
  onTriggerPrint: (mode: 'monthly' | 'daily', targetSession?: AttendanceSession) => void;
}

const MONTH_NAMES = [
  'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
  'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember',
];

export const RecapView: React.FC<RecapViewProps> = ({
  sessions,
  students,
  currentClass,
  currentSubject,
  schoolName,
  teacherName,
  onSelectSessionToView,
  onTriggerPrint,
}) => {
  const [subTab, setSubTab] = useState<'monthly' | 'daily'>('monthly');
  const [selectedYear, setSelectedYear] = useState<number>(2026);
  const [selectedMonth, setSelectedMonth] = useState<number>(9); // September (1-12)
  const [searchQuery, setSearchQuery] = useState('');
  const [filterClass, setFilterClass] = useState(currentClass);

  // Month prefix: e.g. "2026-09"
  const monthPrefix = `${selectedYear}-${String(selectedMonth).padStart(2, '0')}`;

  // Filter sessions in selected month and class
  const filteredMonthlySessions = useMemo(() => {
    return sessions
      .filter((s) => s.date.startsWith(monthPrefix) && s.className === filterClass)
      .sort((a, b) => a.date.localeCompare(b.date));
  }, [sessions, monthPrefix, filterClass]);

  // Unique classes across all sessions
  const availableClasses = useMemo(() => {
    const set = new Set<string>();
    set.add(currentClass);
    sessions.forEach((s) => set.add(s.className));
    return Array.from(set);
  }, [sessions, currentClass]);

  // Number of days in selected month
  const daysInMonth = useMemo(() => {
    return new Date(selectedYear, selectedMonth, 0).getDate();
  }, [selectedYear, selectedMonth]);

  // Compute student stats for this month
  const studentStats = useMemo(() => {
    const totalEffectiveDays = filteredMonthlySessions.length;

    return students.map((std) => {
      let h = 0;
      let i = 0;
      let s = 0;
      let a = 0;

      const dayMap: Record<number, { status: AttendanceStatus; note?: string }> = {};

      filteredMonthlySessions.forEach((sess) => {
        const dayNum = parseInt(sess.date.split('-')[2], 10);
        const rec = sess.records[std.id];
        if (rec) {
          dayMap[dayNum] = rec;
          if (rec.status === 'HADIR') h++;
          else if (rec.status === 'IZIN') i++;
          else if (rec.status === 'SAKIT') s++;
          else if (rec.status === 'ALPHA') a++;
        }
      });

      const percentage = totalEffectiveDays > 0 ? Math.round((h / totalEffectiveDays) * 100) : 0;

      return {
        student: std,
        h,
        i,
        s,
        a,
        totalEffectiveDays,
        percentage,
        dayMap,
      };
    });
  }, [students, filteredMonthlySessions]);

  // Filter students by search
  const visibleStudentStats = useMemo(() => {
    return studentStats.filter(
      (st) =>
        st.student.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        st.student.nisn.includes(searchQuery)
    );
  }, [studentStats, searchQuery]);

  // Overall class metrics for this month
  const classStats = useMemo(() => {
    const totalSessionsCount = filteredMonthlySessions.length;
    if (totalSessionsCount === 0 || studentStats.length === 0) {
      return { avgRate: 0, totalH: 0, totalI: 0, totalS: 0, totalA: 0 };
    }

    let sumH = 0;
    let sumI = 0;
    let sumS = 0;
    let sumA = 0;

    studentStats.forEach((st) => {
      sumH += st.h;
      sumI += st.i;
      sumS += st.s;
      sumA += st.a;
    });

    const totalPossibleAttendances = studentStats.length * totalSessionsCount;
    const avgRate =
      totalPossibleAttendances > 0 ? Math.round((sumH / totalPossibleAttendances) * 100) : 0;

    return { avgRate, totalH: sumH, totalI: sumI, totalS: sumS, totalA: sumA };
  }, [filteredMonthlySessions, studentStats]);

  // Handle Export to CSV
  const handleExportMonthly = () => {
    exportMonthlyRecapToCSV(
      selectedYear,
      selectedMonth,
      filterClass,
      currentSubject,
      schoolName,
      teacherName,
      students,
      sessions
    );
  };

  return (
    <div className="space-y-6">
      {/* Top Filter and Controls Bar */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-4 sm:p-6 space-y-4">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          
          {/* Sub Navigation: Rekap Bulanan vs Rekap Harian */}
          <div className="flex items-center p-1 bg-slate-100 rounded-xl border border-slate-200/80 w-fit">
            <button
              onClick={() => setSubTab('monthly')}
              className={`px-4 py-2 text-xs sm:text-sm font-semibold rounded-lg transition-all ${
                subTab === 'monthly'
                  ? 'bg-white text-blue-700 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Rekap Bulanan (Matriks)
            </button>
            <button
              onClick={() => setSubTab('daily')}
              className={`px-4 py-2 text-xs sm:text-sm font-semibold rounded-lg transition-all ${
                subTab === 'daily'
                  ? 'bg-white text-blue-700 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Rekap Harian ({filteredMonthlySessions.length} Sesi)
            </button>
          </div>

          {/* Action Buttons: Cetak & Ekspor */}
          <div className="flex flex-wrap items-center gap-2.5">
            <button
              onClick={() => onTriggerPrint('monthly')}
              className="flex items-center gap-2 px-4 py-2 bg-white hover:bg-slate-50 text-slate-700 text-xs sm:text-sm font-semibold rounded-xl border border-slate-200 shadow-xs transition-colors cursor-pointer"
            >
              <Printer className="w-4 h-4 text-blue-600" />
              <span>Cetak Laporan</span>
            </button>

            <button
              onClick={handleExportMonthly}
              className="flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs sm:text-sm font-semibold rounded-xl shadow-xs shadow-emerald-600/20 transition-colors cursor-pointer"
            >
              <FileSpreadsheet className="w-4 h-4 text-emerald-100" />
              <span>Ekspor Excel/CSV</span>
            </button>
          </div>
        </div>

        {/* Filter Inputs Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 pt-3 border-t border-slate-100">
          {/* Pilih Bulan */}
          <div>
            <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1">
              Bulan
            </label>
            <select
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(Number(e.target.value))}
              className="w-full px-3 py-2 text-xs sm:text-sm font-semibold text-slate-800 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-hidden focus:border-blue-500"
            >
              {MONTH_NAMES.map((name, idx) => (
                <option key={name} value={idx + 1}>
                  {name}
                </option>
              ))}
            </select>
          </div>

          {/* Pilih Tahun */}
          <div>
            <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1">
              Tahun
            </label>
            <select
              value={selectedYear}
              onChange={(e) => setSelectedYear(Number(e.target.value))}
              className="w-full px-3 py-2 text-xs sm:text-sm font-semibold text-slate-800 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-hidden focus:border-blue-500"
            >
              <option value={2026}>2026</option>
              <option value={2027}>2027</option>
            </select>
          </div>

          {/* Filter Kelas */}
          <div>
            <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1">
              Kelas
            </label>
            <select
              value={filterClass}
              onChange={(e) => setFilterClass(e.target.value)}
              className="w-full px-3 py-2 text-xs sm:text-sm font-semibold text-slate-800 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-hidden focus:border-blue-500"
            >
              {availableClasses.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </div>

          {/* Pencarian Siswa */}
          <div>
            <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1">
              Cari Siswa
            </label>
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Nama atau NISN..."
                className="w-full pl-8 pr-3 py-2 text-xs sm:text-sm rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-hidden focus:border-blue-500"
              />
            </div>
          </div>
        </div>
      </div>

      {/* KPI Summary Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-5 gap-3.5">
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 mb-1">
            <span className="text-xs font-semibold">Tingkat Kehadiran</span>
            <TrendingUp className="w-4 h-4 text-blue-600" />
          </div>
          <div className="text-2xl font-extrabold text-slate-900 tabular-nums">
            {classStats.avgRate}%
          </div>
          <p className="text-[11px] text-slate-500 mt-1">
            Periode {MONTH_NAMES[selectedMonth - 1]} {selectedYear}
          </p>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 mb-1">
            <span className="text-xs font-semibold">Hari Pertemuan</span>
            <Calendar className="w-4 h-4 text-indigo-600" />
          </div>
          <div className="text-2xl font-extrabold text-slate-900 tabular-nums">
            {filteredMonthlySessions.length}
          </div>
          <p className="text-[11px] text-slate-500 mt-1">Sesi KBM tercatat</p>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between text-emerald-700 mb-1">
            <span className="text-xs font-semibold">Total Hadir</span>
            <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
          </div>
          <div className="text-2xl font-extrabold text-emerald-600 tabular-nums">
            {classStats.totalH}
          </div>
          <p className="text-[11px] text-slate-500 mt-1">Akumulasi presensi (H)</p>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between text-amber-700 mb-1">
            <span className="text-xs font-semibold">Izin & Sakit</span>
            <span className="w-2 h-2 rounded-full bg-amber-500"></span>
          </div>
          <div className="text-2xl font-extrabold text-amber-600 tabular-nums">
            {classStats.totalI + classStats.totalS}
          </div>
          <p className="text-[11px] text-slate-500 mt-1">
            {classStats.totalI} Izin · {classStats.totalS} Sakit
          </p>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs col-span-2 lg:col-span-1">
          <div className="flex items-center justify-between text-rose-700 mb-1">
            <span className="text-xs font-semibold">Total Alpha</span>
            <span className="w-2 h-2 rounded-full bg-rose-500"></span>
          </div>
          <div className="text-2xl font-extrabold text-rose-600 tabular-nums">
            {classStats.totalA}
          </div>
          <p className="text-[11px] text-slate-500 mt-1">Tanpa keterangan</p>
        </div>
      </div>

      {/* SubTab 1: Monthly Matrix Table View */}
      {subTab === 'monthly' && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
          {/* Header of Table */}
          <div className="p-4 sm:p-5 border-b border-slate-200/80 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h3 className="text-base font-bold text-slate-900">
                Matriks Kehadiran Siswa — {MONTH_NAMES[selectedMonth - 1]} {selectedYear}
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Kelas: <span className="font-semibold text-slate-800">{filterClass}</span> ·
                Mata Pelajaran:{' '}
                <span className="font-semibold text-slate-800">{currentSubject}</span>
              </p>
            </div>

            {/* Matrix Legend */}
            <div className="flex items-center gap-2 text-xs font-medium">
              <span className="flex items-center gap-1 text-slate-600">
                <span className="w-4 h-4 rounded bg-emerald-600 text-white flex items-center justify-center text-[10px] font-bold">
                  H
                </span>
                Hadir
              </span>
              <span className="flex items-center gap-1 text-slate-600">
                <span className="w-4 h-4 rounded bg-blue-600 text-white flex items-center justify-center text-[10px] font-bold">
                  I
                </span>
                Izin
              </span>
              <span className="flex items-center gap-1 text-slate-600">
                <span className="w-4 h-4 rounded bg-amber-500 text-white flex items-center justify-center text-[10px] font-bold">
                  S
                </span>
                Sakit
              </span>
              <span className="flex items-center gap-1 text-slate-600">
                <span className="w-4 h-4 rounded bg-rose-600 text-white flex items-center justify-center text-[10px] font-bold">
                  A
                </span>
                Alpha
              </span>
            </div>
          </div>

          {/* Matrix Grid */}
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50 text-slate-600 font-bold uppercase tracking-wider text-[11px]">
                  <th className="py-3 px-3 w-10 text-center sticky left-0 bg-slate-50 z-10 border-r border-slate-200">
                    No
                  </th>
                  <th className="py-3 px-4 min-w-[180px] sticky left-10 bg-slate-50 z-10 border-r border-slate-200">
                    Nama Siswa
                  </th>
                  <th className="py-3 px-2 w-10 text-center border-r border-slate-200">L/P</th>

                  {/* Days 1 to 31 */}
                  {Array.from({ length: daysInMonth }, (_, i) => i + 1).map((day) => {
                    const dayStr = String(day).padStart(2, '0');
                    const dateStr = `${monthPrefix}-${dayStr}`;
                    const hasSession = filteredMonthlySessions.some((s) => s.date === dateStr);

                    return (
                      <th
                        key={day}
                        className={`py-2 px-1 text-center w-7 border-r border-slate-200/60 tabular-nums ${
                          hasSession ? 'bg-blue-50/70 text-blue-700 font-extrabold' : 'text-slate-400 font-normal'
                        }`}
                        title={hasSession ? `Pertemuan pada tanggal ${day}` : `Tidak ada sesi pada tanggal ${day}`}
                      >
                        {day}
                      </th>
                    );
                  })}

                  {/* Summary Columns */}
                  <th className="py-3 px-2 text-center w-8 bg-emerald-50 text-emerald-800 border-r border-slate-200">
                    H
                  </th>
                  <th className="py-3 px-2 text-center w-8 bg-blue-50 text-blue-800 border-r border-slate-200">
                    I
                  </th>
                  <th className="py-3 px-2 text-center w-8 bg-amber-50 text-amber-800 border-r border-slate-200">
                    S
                  </th>
                  <th className="py-3 px-2 text-center w-8 bg-rose-50 text-rose-800 border-r border-slate-200">
                    A
                  </th>
                  <th className="py-3 px-3 text-center w-14 bg-slate-100 text-slate-800 font-bold">
                    %
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {visibleStudentStats.length === 0 ? (
                  <tr>
                    <td colSpan={daysInMonth + 8} className="py-12 text-center text-slate-500">
                      Tidak ada data siswa yang cocok dengan pencarian.
                    </td>
                  </tr>
                ) : (
                  visibleStudentStats.map((st, idx) => (
                    <tr key={st.student.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="py-2.5 px-3 text-center font-medium text-slate-400 sticky left-0 bg-white border-r border-slate-200 tabular-nums">
                        {idx + 1}
                      </td>
                      <td className="py-2.5 px-4 font-semibold text-slate-900 sticky left-10 bg-white border-r border-slate-200 whitespace-nowrap">
                        <span className="truncate block max-w-[200px]">{st.student.name}</span>
                        <span className="text-[10px] text-slate-400 font-mono block">
                          {st.student.nisn}
                        </span>
                      </td>
                      <td className="py-2.5 px-2 text-center font-bold text-slate-600 border-r border-slate-200">
                        {st.student.gender}
                      </td>

                      {/* Day cells 1..31 */}
                      {Array.from({ length: daysInMonth }, (_, i) => i + 1).map((day) => {
                        const rec = st.dayMap[day];

                        let cellContent = <span className="text-slate-200">·</span>;
                        if (rec) {
                          if (rec.status === 'HADIR') {
                            cellContent = (
                              <span className="w-5 h-5 rounded-md bg-emerald-600 text-white font-bold flex items-center justify-center mx-auto text-[10px] shadow-xs">
                                H
                              </span>
                            );
                          } else if (rec.status === 'IZIN') {
                            cellContent = (
                              <span
                                title={rec.note ? `Izin: ${rec.note}` : 'Izin'}
                                className="w-5 h-5 rounded-md bg-blue-600 text-white font-bold flex items-center justify-center mx-auto text-[10px] shadow-xs cursor-help"
                              >
                                I
                              </span>
                            );
                          } else if (rec.status === 'SAKIT') {
                            cellContent = (
                              <span
                                title={rec.note ? `Sakit: ${rec.note}` : 'Sakit'}
                                className="w-5 h-5 rounded-md bg-amber-500 text-white font-bold flex items-center justify-center mx-auto text-[10px] shadow-xs cursor-help"
                              >
                                S
                              </span>
                            );
                          } else if (rec.status === 'ALPHA') {
                            cellContent = (
                              <span className="w-5 h-5 rounded-md bg-rose-600 text-white font-bold flex items-center justify-center mx-auto text-[10px] shadow-xs">
                                A
                              </span>
                            );
                          }
                        }

                        return (
                          <td
                            key={day}
                            className="py-2 px-1 text-center border-r border-slate-100"
                          >
                            {cellContent}
                          </td>
                        );
                      })}

                      {/* Totals */}
                      <td className="py-2.5 px-2 text-center font-bold text-emerald-700 bg-emerald-50/40 border-r border-slate-200 tabular-nums">
                        {st.h}
                      </td>
                      <td className="py-2.5 px-2 text-center font-bold text-blue-700 bg-blue-50/40 border-r border-slate-200 tabular-nums">
                        {st.i}
                      </td>
                      <td className="py-2.5 px-2 text-center font-bold text-amber-700 bg-amber-50/40 border-r border-slate-200 tabular-nums">
                        {st.s}
                      </td>
                      <td className="py-2.5 px-2 text-center font-bold text-rose-700 bg-rose-50/40 border-r border-slate-200 tabular-nums">
                        {st.a}
                      </td>
                      <td className="py-2.5 px-3 text-center font-extrabold text-slate-900 bg-slate-100/70 tabular-nums">
                        {st.percentage}%
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* SubTab 2: Daily Session Log View */}
      {subTab === 'daily' && (
        <div className="space-y-4">
          {filteredMonthlySessions.length === 0 ? (
            <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center">
              <Calendar className="w-12 h-12 text-slate-300 mx-auto mb-3" />
              <h4 className="text-base font-bold text-slate-800">
                Belum ada data presensi pada bulan ini
              </h4>
              <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
                Silakan lakukan absensi siswa pada tab "Formulir & Daftar Hadir" untuk tanggal yang diinginkan.
              </p>
            </div>
          ) : (
            filteredMonthlySessions.map((session) => {
              const totalRec = Object.keys(session.records).length;
              let h = 0;
              let i = 0;
              let s = 0;
              let a = 0;

              Object.values(session.records).forEach((r) => {
                if (r.status === 'HADIR') h++;
                else if (r.status === 'IZIN') i++;
                else if (r.status === 'SAKIT') s++;
                else if (r.status === 'ALPHA') a++;
              });

              const rate = totalRec > 0 ? Math.round((h / totalRec) * 100) : 0;

              return (
                <div
                  key={session.id}
                  className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4 hover:border-blue-300 transition-colors"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="text-base font-bold text-slate-900">
                        {session.date}
                      </span>
                      <span className="text-xs px-2.5 py-0.5 rounded-full bg-blue-100 text-blue-800 font-semibold">
                        {session.className}
                      </span>
                      <span className="text-xs text-slate-500">
                        {session.subject}
                      </span>
                    </div>

                    <div className="flex flex-wrap items-center gap-4 text-xs text-slate-500 pt-1">
                      <span>Guru: {session.teacherName}</span>
                      <span>·</span>
                      <span className="flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5" />
                        Tersimpan:{' '}
                        {new Date(session.savedAt).toLocaleTimeString('id-ID', {
                          hour: '2-digit',
                          minute: '2-digit',
                        })}{' '}
                        WIB
                      </span>
                    </div>
                  </div>

                  {/* Stats Badges */}
                  <div className="flex items-center gap-2">
                    <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-50 border border-slate-200 text-xs">
                      <span className="font-bold text-emerald-600">{h} Hadir</span>
                      <span className="text-slate-300">|</span>
                      <span className="font-bold text-blue-600">{i} Izin</span>
                      <span className="text-slate-300">|</span>
                      <span className="font-bold text-amber-600">{s} Sakit</span>
                      <span className="text-slate-300">|</span>
                      <span className="font-bold text-rose-600">{a} Alpha</span>
                    </div>

                    <div className="px-3 py-1.5 rounded-xl bg-blue-50 text-blue-700 text-xs font-bold border border-blue-200">
                      {rate}% Hadir
                    </div>

                    {/* Action buttons */}
                    <button
                      onClick={() => onSelectSessionToView(session)}
                      title="Buka & Edit di Formulir"
                      className="px-3 py-1.5 text-xs font-semibold text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded-lg transition-colors border border-blue-200 cursor-pointer"
                    >
                      Buka Form
                    </button>

                    <button
                      onClick={() => onTriggerPrint('daily', session)}
                      title="Cetak Presensi Hari Ini"
                      className="p-2 text-slate-500 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors border border-slate-200 cursor-pointer"
                    >
                      <Printer className="w-4 h-4" />
                    </button>

                    <button
                      onClick={() => exportDailyRecapToCSV(session, students)}
                      title="Ekspor CSV Sesi Ini"
                      className="p-2 text-emerald-600 hover:text-emerald-800 hover:bg-emerald-50 rounded-lg transition-colors border border-emerald-200 cursor-pointer"
                    >
                      <FileSpreadsheet className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>
      )}
    </div>
  );
};
