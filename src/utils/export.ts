import { AttendanceSession, Student } from '../types/attendance';

export function exportDailyRecapToCSV(
  session: AttendanceSession,
  students: Student[]
): void {
  const headers = ['No', 'NISN', 'Nama Siswa', 'L/P', 'Status Kehadiran', 'Keterangan'];
  
  const rows = students.map((std, idx) => {
    const record = session.records[std.id];
    const status = record?.status || 'Belum Diisi';
    const note = record?.note || '-';
    return [
      idx + 1,
      `'${std.nisn}`, // prefix with apostrophe so Excel keeps 0-prefixes
      `"${std.name.replace(/"/g, '""')}"`,
      std.gender,
      status,
      `"${note.replace(/"/g, '""')}"`,
    ];
  });

  const metadataRows = [
    ['LAPORAN PRESENSI HARIAN SISWA'],
    ['Sekolah', `"${session.schoolName}"`],
    ['Guru Pengampu', `"${session.teacherName}"`],
    ['Mata Pelajaran', `"${session.subject}"`],
    ['Kelas', `"${session.className}"`],
    ['Tanggal', session.date],
    ['Tahun Ajaran', `${session.academicYear} - Semester ${session.semester}`],
    [],
  ];

  const csvContent =
    metadataRows.map((r) => r.join(',')).join('\n') +
    '\n' +
    [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');

  downloadCSV(csvContent, `Presensi_Harian_${session.className.replace(/\s+/g, '_')}_${session.date}.csv`);
}

export function exportMonthlyRecapToCSV(
  year: number,
  month: number, // 1 - 12
  className: string,
  subject: string,
  schoolName: string,
  teacherName: string,
  students: Student[],
  sessions: AttendanceSession[]
): void {
  const monthNames = [
    'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
    'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember',
  ];
  const monthName = monthNames[month - 1];

  // Filter sessions in this month and class
  const prefix = `${year}-${String(month).padStart(2, '0')}`;
  const monthSessions = sessions
    .filter((s) => s.date.startsWith(prefix) && s.className === className)
    .sort((a, b) => a.date.localeCompare(b.date));

  const totalEffectiveDays = monthSessions.length;

  const headers = [
    'No',
    'NISN',
    'Nama Siswa',
    'L/P',
    ...monthSessions.map((s) => s.date.split('-')[2]), // day numbers
    'Hadir (H)',
    'Izin (I)',
    'Sakit (S)',
    'Alpha (A)',
    '% Kehadiran',
  ];

  const rows = students.map((std, idx) => {
    let hCount = 0;
    let iCount = 0;
    let sCount = 0;
    let aCount = 0;

    const dayStatuses = monthSessions.map((sess) => {
      const rec = sess.records[std.id];
      if (!rec) return '-';
      if (rec.status === 'HADIR') {
        hCount++;
        return 'H';
      }
      if (rec.status === 'IZIN') {
        iCount++;
        return 'I';
      }
      if (rec.status === 'SAKIT') {
        sCount++;
        return 'S';
      }
      if (rec.status === 'ALPHA') {
        aCount++;
        return 'A';
      }
      return '-';
    });

    const percentage = totalEffectiveDays > 0 ? Math.round((hCount / totalEffectiveDays) * 100) : 0;

    return [
      idx + 1,
      `'${std.nisn}`,
      `"${std.name.replace(/"/g, '""')}"`,
      std.gender,
      ...dayStatuses,
      hCount,
      iCount,
      sCount,
      aCount,
      `${percentage}%`,
    ];
  });

  const metadataRows = [
    ['LAPORAN REKAPITULASI PRESENSI BULANAN'],
    ['Sekolah', `"${schoolName}"`],
    ['Guru Pengampu', `"${teacherName}"`],
    ['Mata Pelajaran', `"${subject}"`],
    ['Kelas', `"${className}"`],
    ['Periode', `"${monthName} ${year}"`],
    ['Total Pertemuan', totalEffectiveDays],
    [],
  ];

  const csvContent =
    metadataRows.map((r) => r.join(',')).join('\n') +
    '\n' +
    [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');

  downloadCSV(
    csvContent,
    `Rekap_Bulanan_${className.replace(/\s+/g, '_')}_${monthName}_${year}.csv`
  );
}

function downloadCSV(content: string, filename: string): void {
  // Use UTF-8 BOM so Excel opens Indonesian characters with proper encoding
  const blob = new Blob(['\uFEFF' + content], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', filename);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
