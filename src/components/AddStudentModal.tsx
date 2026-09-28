import React, { useState, useEffect } from 'react';
import { X, UserPlus, UserCheck, AlertCircle } from 'lucide-react';
import { Student } from '../types/attendance';

interface AddStudentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSaveStudent: (student: Student) => void;
  editingStudent?: Student | null;
}

export const AddStudentModal: React.FC<AddStudentModalProps> = ({
  isOpen,
  onClose,
  onSaveStudent,
  editingStudent,
}) => {
  const [name, setName] = useState('');
  const [nisn, setNisn] = useState('');
  const [gender, setGender] = useState<'L' | 'P'>('L');
  const [error, setError] = useState('');

  useEffect(() => {
    if (editingStudent) {
      setName(editingStudent.name);
      setNisn(editingStudent.nisn);
      setGender(editingStudent.gender);
    } else {
      setName('');
      // Suggest realistic random 10-digit NISN
      const randNisn = '00' + Math.floor(10000000 + Math.random() * 90000000);
      setNisn(randNisn);
      setGender('L');
    }
    setError('');
  }, [editingStudent, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setError('Nama siswa tidak boleh kosong.');
      return;
    }
    if (!nisn.trim() || nisn.trim().length < 6) {
      setError('NISN harus valid (minimal 6 digit angka).');
      return;
    }

    const student: Student = {
      id: editingStudent ? editingStudent.id : `std-${Date.now()}`,
      name: name.trim(),
      nisn: nisn.trim(),
      gender,
    };

    onSaveStudent(student);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs transition-opacity animate-in fade-in duration-200">
      <div
        className="bg-white rounded-2xl shadow-xl border border-slate-200 w-full max-w-md overflow-hidden animate-in zoom-in-95 duration-200"
        role="dialog"
        aria-modal="true"
      >
        {/* Modal Header */}
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-blue-100 text-blue-700 flex items-center justify-center">
              {editingStudent ? <UserCheck className="w-4 h-4" /> : <UserPlus className="w-4 h-4" />}
            </div>
            <h3 className="text-base font-bold text-slate-900">
              {editingStudent ? 'Edit Data Siswa' : 'Tambah Siswa Baru'}
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && (
            <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 rounded-lg text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              Nama Lengkap Siswa <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Contoh: Muhammad Bintang Pratama"
              autoFocus
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 text-sm font-medium text-slate-900 placeholder:text-slate-400 transition-all outline-hidden"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              NISN (Nomor Induk Siswa Nasional) <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              value={nisn}
              onChange={(e) => setNisn(e.target.value.replace(/[^0-9]/g, ''))}
              placeholder="10 digit nomor NISN"
              maxLength={10}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 text-sm font-mono tracking-wider text-slate-900 placeholder:text-slate-400 transition-all outline-hidden"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              Jenis Kelamin
            </label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setGender('L')}
                className={`py-2 px-3 text-xs font-semibold rounded-xl border transition-all text-center ${
                  gender === 'L'
                    ? 'bg-blue-50 border-blue-500 text-blue-700 shadow-xs'
                    : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                }`}
              >
                Laki-Laki (L)
              </button>
              <button
                type="button"
                onClick={() => setGender('P')}
                className={`py-2 px-3 text-xs font-semibold rounded-xl border transition-all text-center ${
                  gender === 'P'
                    ? 'bg-purple-50 border-purple-500 text-purple-700 shadow-xs'
                    : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                }`}
              >
                Perempuan (P)
              </button>
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex items-center justify-end gap-2.5 pt-4 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-medium text-slate-600 hover:text-slate-800 hover:bg-slate-100 rounded-xl transition-colors"
            >
              Batal
            </button>
            <button
              type="submit"
              className="px-5 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 active:bg-blue-800 rounded-xl transition-colors shadow-sm shadow-blue-500/20"
            >
              {editingStudent ? 'Simpan Perubahan' : 'Tambahkan Siswa'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
