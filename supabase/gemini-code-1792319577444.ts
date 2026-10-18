import * as XLSX from 'xlsx';
import { StudentCalculatedGrade, ComponentWeight } from './gradeCalculator';

export interface ExcelImportResult {
  success: boolean;
  students: Array<{
    nama: string;
    nisn: string;
    lkpd: number;
    simulator: number;
    kuis: number;
    sumatif: number;
    topikSulit?: string;
    detailKesalahan?: string;
  }>;
  errors: string[];
}

/**
 * Ekspor Rekap Nilai ke File Excel (.xlsx) Multi-Sheet
 */
export function exportGradebookToExcel(
  students: StudentCalculatedGrade[],
  weights: ComponentWeight,
  kkm: number,
  className: string = 'XI_AKL_1',
  subjectName: string = 'Akuntansi_Keuangan'
) {
  // Sheet 1: Rekap Nilai
  const sheet1Data = [
    ['REKAPITULASI EVALUASI DAN GRADEBOOK SISWA - BALANCEA'],
    [`Kelas: ${className}`, `Mata Pelajaran: ${subjectName}`, `KKM / KKTP: ${kkm}`],
    [`Bobot Penilaian: LKPD (${weights.lkpd}%), Simulator (${weights.simulator}%), Kuis (${weights.kuis}%), Sumatif (${weights.sumatif}%)`],
    [],
    ['No', 'NISN', 'Nama Siswa', `LKPD (${weights.lkpd}%)`, `Simulator (${weights.simulator}%)`, `Kuis (${weights.kuis}%)`, `Sumatif (${weights.sumatif}%)`, 'Nilai Akhir', 'Status KKTP'],
    ...students.map((s, idx) => [
      idx + 1,
      s.nisn,
      s.nama,
      s.lkpd,
      s.simulator,
      s.kuis,
      s.sumatif,
      s.nilaiAkhir,
      s.isTuntas ? 'Tuntas' : 'Perlu Bimbingan',
    ]),
  ];

  // Sheet 2: Data Diagnostik Kesalahan Siswa
  const sheet2Data = [
    ['DIAGNOSTIK TOPIS SULIT DAN KESALAHAN SIKLUS AKUNTANSI'],
    [],
    ['No', 'NISN', 'Nama Siswa', 'Topik Tersulit / Kendala', 'Detail Diagnostik Kesalahan'],
    ...students.map((s, idx) => [
      idx + 1,
      s.nisn,
      s.nama,
      s.topikSulit || 'Tidak Ada Kendala Berarti',
      s.detailKesalahan || 'Mencapai penguasaan indikator secara konsisten.',
    ]),
  ];

  const wb = XLSX.utils.book_new();
  const ws1 = XLSX.utils.aoa_to_sheet(sheet1Data);
  const ws2 = XLSX.utils.aoa_to_sheet(sheet2Data);

  XLSX.utils.book_append_sheet(wb, ws1, 'Rekap Nilai');
  XLSX.utils.book_append_sheet(wb, ws2, 'Diagnostik Kesalahan');

  const fileName = `Rekap_Nilai_${className}_${subjectName}.xlsx`;
  XLSX.writeFile(wb, fileName);
}

/**
 * Impor Multi-Sheet Excel dengan Validasi Per Baris
 */
export async function parseExcelGradebook(file: File): Promise<ExcelImportResult> {
  return new Promise((resolve) => {
    const reader = new FileReader();

    reader.onload = (e) => {
      try {
        const data = new Uint8Array(e.target?.result as ArrayBuffer);
        const workbook = XLSX.read(data, { type: 'array' });

        if (workbook.SheetNames.length === 0) {
          resolve({ success: false, students: [], errors: ['File Excel kosong atau corrupt.'] });
          return;
        }

        const sheet1 = workbook.Sheets[workbook.SheetNames[0]];
        const rawJson: any[] = XLSX.utils.sheet_to_json(sheet1, { header: 1 });

        const errors: string[] = [];
        const importedStudents: ExcelImportResult['students'] = [];

        // Cari baris header yang mengandung "Nama Siswa"
        let headerRowIndex = -1;
        for (let i = 0; i < rawJson.length; i++) {
          const rowStr = JSON.stringify(rawJson[i]).toLowerCase();
          if (rowStr.includes('nama') || rowStr.includes('siswa')) {
            headerRowIndex = i;
            break;
          }
        }

        if (headerRowIndex === -1) {
          resolve({
            success: false,
            students: [],
            errors: ['Format kolom Excel tidak cocok. Tidak ditemukan header Nama/NISN.'],
          });
          return;
        }

        // Parse Baris Data Siswa
        for (let i = headerRowIndex + 1; i < rawJson.length; i++) {
          const row = rawJson[i];
          if (!row || row.length < 3 || !row[1]) continue;

          const nisn = String(row[1] || '').trim();
          const nama = String(row[2] || '').trim();
          const lkpd = parseFloat(row[3]) || 0;
          const simulator = parseFloat(row[4]) || 0;
          const kuis = parseFloat(row[5]) || 0;
          const sumatif = parseFloat(row[6]) || 0;

          // Validasi rentang nilai 0 - 100
          if (lkpd < 0 || lkpd > 100 || simulator < 0 || simulator > 100 || kuis < 0 || kuis > 100 || sumatif < 0 || sumatif > 100) {
            errors.push(`Baris ${i + 1} (${nama}): Terdapat nilai di luar rentang 0–100.`);
            continue;
          }

          if (nama) {
            importedStudents.push({ nisn, nama, lkpd, simulator, kuis, sumatif });
          }
        }

        if (importedStudents.length === 0) {
          errors.push('Tidak ada baris data siswa yang valid ditemukan pada file Excel.');
        }

        resolve({
          success: errors.length === 0,
          students: importedStudents,
          errors,
        });
      } catch (err: any) {
        resolve({
          success: false,
          students: [],
          errors: [`Gagal memproses file Excel: ${err.message}`],
        });
      }
    };

    reader.readAsArrayBuffer(file);
  });
}