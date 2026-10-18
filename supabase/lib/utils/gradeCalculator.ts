/**
 * BALANCEA - GRADE CALCULATOR & VALIDATION UTILITIES
 */

export interface ComponentWeight {
  lkpd: number;      // e.g., 30
  simulator: number; // e.g., 20
  kuis: number;      // e.g., 20
  sumatif: number;   // e.g., 30
}

export interface StudentScoreInput {
  id: string;
  nama: string;
  nisn: string;
  lkpd: number;
  simulator: number;
  kuis: number;
  sumatif: number;
  topikSulit?: string;
  detailKesalahan?: string;
}

export interface StudentCalculatedGrade extends StudentScoreInput {
  nilaiAkhir: number;
  isTuntas: boolean;
  statusLabel: '🟢 Tuntas' | '🟡 Perlu Bimbingan';
}

export interface GradebookSummary {
  rataRata: number;
  nilaiTertinggi: number;
  nilaiTerendah: number;
  jumlahSiswa: number;
  jumlahTuntas: number;
  persentaseKetuntasan: number;
  jumlahPerluBimbingan: number;
}

/**
 * Memvalidasi apakah total bobot persentase sama dengan 100%
 */
export function validateWeights(weights: ComponentWeight): { isValid: boolean; message: string; total: number } {
  const total = Number((weights.lkpd + weights.simulator + weights.kuis + weights.sumatif).toFixed(1));
  if (Math.abs(total - 100) > 0.01) {
    return {
      isValid: false,
      message: `Total bobot komponen harus tepat 100%. Saat ini total bobot adalah ${total}%.`,
      total,
    };
  }
  return { isValid: true, message: 'Bobot valid.', total: 100 };
}

/**
 * Menghitung Nilai Akhir Berbobot dan Dibulatkan ke 1 Desimal
 */
export function calculateFinalScore(scores: StudentScoreInput, weights: ComponentWeight): number {
  const scoreLKPD = (scores.lkpd * weights.lkpd) / 100;
  const scoreSim = (scores.simulator * weights.simulator) / 100;
  const scoreKuis = (scores.kuis * weights.kuis) / 100;
  const scoreSumatif = (scores.sumatif * weights.sumatif) / 100;

  const rawFinal = scoreLKPD + scoreSim + scoreKuis + scoreSumatif;
  return Number(rawFinal.toFixed(1));
}

/**
 * Menghitung Nilai Akhir Kustom (3 Komponen, misal: UH, UTS, UAS)
 */
export function calculateCustomWeightedScore(
  scoresWithWeights: Array<{ score: number; weightPercent: number }>
): { finalScore: number; isValid: boolean; totalWeight: number } {
  const totalWeight = scoresWithWeights.reduce((acc, curr) => acc + curr.weightPercent, 0);
  if (Math.abs(totalWeight - 100) > 0.01) {
    return { finalScore: 0, isValid: false, totalWeight };
  }

  const rawFinal = scoresWithWeights.reduce((acc, curr) => acc + (curr.score * curr.weightPercent) / 100, 0);
  return { finalScore: Number(rawFinal.toFixed(1)), isValid: true, totalWeight: 100 };
}

/**
 * Mengolah Rekap Siswa Lengkap dengan Status KKTP
 */
export function processStudentGrades(
  students: StudentScoreInput[],
  weights: ComponentWeight,
  kkm: number = 75
): StudentCalculatedGrade[] {
  return students.map((s) => {
    const nilaiAkhir = calculateFinalScore(s, weights);
    const isTuntas = nilaiAkhir >= kkm;
    return {
      ...s,
      nilaiAkhir,
      isTuntas,
      statusLabel: isTuntas ? '🟢 Tuntas' : '🟡 Perlu Bimbingan',
    };
  });
}

/**
 * Menghitung Ringkasan Statistik Kelas
 */
export function calculateGradebookSummary(students: StudentCalculatedGrade[], kkm: number = 75): GradebookSummary {
  if (students.length === 0) {
    return {
      rataRata: 0,
      nilaiTertinggi: 0,
      nilaiTerendah: 0,
      jumlahSiswa: 0,
      jumlahTuntas: 0,
      persentaseKetuntasan: 0,
      jumlahPerluBimbingan: 0,
    };
  }

  const totalFinal = students.reduce((sum, s) => sum + s.nilaiAkhir, 0);
  const rataRata = Number((totalFinal / students.length).toFixed(1));
  
  const finalScores = students.map((s) => s.nilaiAkhir);
  const nilaiTertinggi = Math.max(...finalScores);
  const nilaiTerendah = Math.min(...finalScores);

  const tuntasList = students.filter((s) => s.isTuntas);
  const jumlahTuntas = tuntasList.length;
  const jumlahPerluBimbingan = students.length - jumlahTuntas;
  const persentaseKetuntasan = Number(((jumlahTuntas / students.length) * 100).toFixed(1));

  return {
    rataRata,
    nilaiTertinggi,
    nilaiTerendah,
    jumlahSiswa: students.length,
    jumlahTuntas,
    persentaseKetuntasan,
    jumlahPerluBimbingan,
  };
}

/**
 * SUITE UJI OTOMATIS ATURAN LOGIKA
 */
export function runMandatoryGradeTests() {
  const defaultWeights: ComponentWeight = { lkpd: 30, simulator: 20, kuis: 20, sumatif: 30 };

  // Test 1: Ahmad Fauzi (95, 98, 95, 92) -> Expected 94.7
  const fauziScore = calculateFinalScore(
    { id: '1', nama: 'Ahmad Fauzi', nisn: '001', lkpd: 95, simulator: 98, kuis: 95, sumatif: 92 },
    defaultWeights
  );

  // Test 2: Dewi Lestari (85, 90, 85, 88) -> Expected 86.9
  const dewiScore = calculateFinalScore(
    { id: '2', nama: 'Dewi Lestari', nisn: '002', lkpd: 85, simulator: 90, kuis: 85, sumatif: 88 },
    defaultWeights
  );

  // Test 3: Fitri Rahayu (60, 60, 65, 62) -> Expected 61.6
  const fitriScore = calculateFinalScore(
    { id: '3', nama: 'Fitri Rahayu', nisn: '003', lkpd: 60, simulator: 60, kuis: 65, sumatif: 62 },
    defaultWeights
  );

  // Test 4: Custom 40/30/30 (UH: 80, UTS: 70, UAS: 90) -> Expected 80.0
  const customTest = calculateCustomWeightedScore([
    { score: 80, weightPercent: 40 },
    { score: 70, weightPercent: 30 },
    { score: 90, weightPercent: 30 },
  ]);

  console.assert(fauziScore === 94.7, `TEST FAUZI FAILED: Expected 94.7, got ${fauziScore}`);
  console.assert(dewiScore === 86.9, `TEST DEWI FAILED: Expected 86.9, got ${dewiScore}`);
  console.assert(fitriScore === 61.6, `TEST FITRI FAILED: Expected 61.6, got ${fitriScore}`);
  console.assert(customTest.finalScore === 80.0, `TEST CUSTOM FAILED: Expected 80.0, got ${customTest.finalScore}`);

  return {
    fauziScore,
    dewiScore,
    fitriScore,
    customTestScore: customTest.finalScore,
    allPassed: fauziScore === 94.7 && dewiScore === 86.9 && fitriScore === 61.6 && customTest.finalScore === 80.0,
  };
}
