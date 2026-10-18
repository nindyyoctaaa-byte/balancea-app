'use client';

import React, { useState, useEffect } from 'react';
import {
  ComponentWeight,
  StudentScoreInput,
  processStudentGrades,
  calculateGradebookSummary,
  runMandatoryGradeTests,
} from '@/lib/utils/gradeCalculator';
import { exportGradebookToExcel, parseExcelGradebook } from '@/lib/utils/excelHandler';
import GradeTable from '@/components/gradebook/GradeTable';
import BobotConfigModal from '@/components/gradebook/BobotConfigModal';
import {
  BarChart3,
  Sliders,
  FileSpreadsheet,
  Upload,
  Trophy,
  AlertTriangle,
  CheckCircle2,
  Users,
} from 'lucide-react';

// Data Awal Sesuai Uji Mandatori
const initialStudents: StudentScoreInput[] = [
  { id: '1', nama: 'Ahmad Fauzi', nisn: '0058291823', lkpd: 95, simulator: 98, kuis: 95, sumatif: 92, topikSulit: 'Tidak ada' },
  { id: '2', nama: 'Dewi Lestari', nisn: '0058291824', lkpd: 85, simulator: 90, kuis: 85, sumatif: 88, topikSulit: 'Depresiasi Aset' },
  { id: '3', nama: 'Fitri Rahayu', nisn: '0058291825', lkpd: 60, simulator: 60, kuis: 65, sumatif: 62, topikSulit: 'Jurnal Penyesuaian' },
];

export default function EvaluasiPage() {
  const [isGuru, setIsGuru] = useState(true);
  const [kkm, setKKM] = useState(75);
  const [weights, setWeights] = useState<ComponentWeight>({
    lkpd: 30,
    simulator: 20,
    kuis: 20,
    sumatif: 30,
  });
  const [students, setStudents] = useState<StudentScoreInput[]>(initialStudents);
  const [isConfigOpen, setIsConfigOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Jalankan Uji Otomatis Saat Mount
  useEffect(() => {
    const testRes = runMandatoryGradeTests();
    if (testRes.allPassed) {
      console.log('✅ SELURUH UJI LOGIKA NILAI MANDATORI DITERIMA!');
    }
  }, []);

  const calculatedStudents = processStudentGrades(students, weights, kkm);
  const summary = calculateGradebookSummary(calculatedStudents, kkm);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const handleUpdateScore = (id: string, field: any, val: number) => {
    setStudents((prev) =>
      prev.map((s) => (s.id === id ? { ...s, [field]: val } : s))
    );
  };

  const handleExcelImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const res = await parseExcelGradebook(file);
    if (res.success && res.students.length > 0) {
      const formatted: StudentScoreInput[] = res.students.map((s, idx) => ({
        id: String(idx + 10),
        nama: s.nama,
        nisn: s.nisn,
        lkpd: s.lkpd,
        simulator: s.simulator,
        kuis: s.kuis,
        sumatif: s.sumatif,
      }));
      setStudents(formatted);
      showToast(`📄 Berhasil mengimpor ${formatted.length} data siswa dari Excel!`);
    } else {
      showToast(`⚠️ Gagal Impor Excel: ${res.errors.join(', ')}`);
    }
  };

  return (
    <div className="space-y-6">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-5 right-5 z-50 bg-[#2E7D32] text-white px-4 py-2.5 rounded-xl font-bold text-xs shadow-lg animate-bounce">
          {toastMessage}
        </div>
      )}

      {/* Header Area */}
      <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-lg font-extrabold text-gray-800 flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-[#2E7D32]" />
            Modul 3: Evaluasi & Gradebook System
          </h2>
          <p className="text-xs text-gray-500">
            Pengolahan Nilai Otomatis Berbobot, Batas KKTP ({kkm}), dan Integrasi Excel (.xlsx).
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {isGuru && (
            <>
              <button
                onClick={() => setIsConfigOpen(true)}
                className="px-3.5 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold text-xs rounded-xl transition-all flex items-center gap-1.5"
              >
                <Sliders className="w-4 h-4 text-[#2E7D32]" /> Atur Bobot & KKM
              </button>

              <label className="px-3.5 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold text-xs rounded-xl cursor-pointer transition-all flex items-center gap-1.5 border border-gray-200">
                <Upload className="w-4 h-4 text-green-700" /> Import Excel
                <input type="file" accept=".xlsx, .xls" className="hidden" onChange={handleExcelImport} />
              </label>
            </>
          )}

          <button
            onClick={() => exportGradebookToExcel(calculatedStudents, weights, kkm)}
            className="px-4 py-2 bg-[#2E7D32] hover:bg-green-800 text-white font-bold text-xs rounded-xl shadow transition-all flex items-center gap-1.5"
          >
            <FileSpreadsheet className="w-4 h-4" /> Export Excel (.xlsx)
          </button>
        </div>
      </div>

      {/* Top Cards Summary */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm flex items-center justify-between">
          <div>
            <p class="text-[10px] font-bold text-gray-400 uppercase">RATA-RATA KELAS</p>
            <h3 className="text-2xl font-extrabold text-gray-800 mt-1">{summary.rataRata}</h3>
            <p className="text-[10px] text-gray-500 mt-1">Dihitung dari {summary.jumlahSiswa} Siswa</p>
          </div>
          <div className="w-10 h-10 rounded-xl bg-[#E8F5E9] text-[#2E7D32] flex items-center justify-center font-bold">
            <Users className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm flex items-center justify-between">
          <div>
            <p class="text-[10px] font-bold text-gray-400 uppercase">NILAI TERTINGGI</p>
            <h3 className="text-2xl font-extrabold text-gray-800 mt-1">{summary.nilaiTertinggi}</h3>
            <p className="text-[10px] text-[#2E7D32] font-semibold mt-1">Ahmad Fauzi</p>
          </div>
          <div className="w-10 h-10 rounded-xl bg-[#FCE4EC] text-[#C2185B] flex items-center justify-center font-bold">
            <Trophy className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm flex items-center justify-between">
          <div>
            <p class="text-[10px] font-bold text-gray-400 uppercase">KETUNTASAN KKTP</p>
            <h3 className="text-2xl font-extrabold text-[#2E7D32] mt-1">{summary.persentaseKetuntasan}%</h3>
            <p className="text-[10px] text-gray-500 mt-1">{summary.jumlahTuntas} dari {summary.jumlahSiswa} Siswa Tuntas</p>
          </div>
          <div className="w-10 h-10 rounded-xl bg-[#E8F5E9] text-[#2E7D32] flex items-center justify-center font-bold">
            <CheckCircle2 className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm flex items-center justify-between">
          <div>
            <p class="text-[10px] font-bold text-gray-400 uppercase">PERLU BIMBINGAN</p>
            <h3 className="text-2xl font-extrabold text-[#C2185B] mt-1">{summary.jumlahPerluBimbingan} Siswa</h3>
            <p className="text-[10px] text-[#C2185B] mt-1">Nilai di bawah KKTP ({kkm})</p>
          </div>
          <div className="w-10 h-10 rounded-xl bg-[#FCE4EC] text-[#C2185B] flex items-center justify-center font-bold">
            <AlertTriangle className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* Main Gradebook Table */}
      <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm space-y-4">
        <h3 className="font-bold text-xs text-gray-800 uppercase tracking-wider">
          Tabel Rekapitulasi Nilai Berbobot (Weighted Gradebook)
        </h3>
        
        <GradeTable
          students={calculatedStudents}
          weights={weights}
          isGuru={isGuru}
          onUpdateScore={handleUpdateScore}
        />
      </div>

      {/* Modal Konfigurasi Bobot */}
      <BobotConfigModal
        isOpen={isConfigOpen}
        onClose={() => setIsConfigOpen(false)}
        currentWeights={weights}
        currentKKM={kkm}
        onSave={(newW, newK) => {
          setWeights(newW);
          setKKM(newK);
          showToast('✅ Konfigurasi Bobot Penilaian & KKTP Berhasil Diperbarui!');
        }}
      />
    </div>
  );
}
