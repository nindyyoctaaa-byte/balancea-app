import { CPData, TPItem, ATPItemData } from '@/lib/types/perangkat';

interface PrintHeaderData {
  namaSekolah: string;
  namaGuru: string;
  kelasName: string;
  mapelName: string;
  tahunAjaran: string;
  faseName: string;
}

/**
 * Mencetak Dokumen Perangkat Pembelajaran dengan Kop Sekolah Resmi
 */
export function printPerangkatPDF(
  header: PrintHeaderData,
  cp: CPData,
  tpList: TPItem[],
  atpList: ATPItemData[]
) {
  const printWindow = window.open('', '_blank');
  if (!printWindow) return;

  const htmlContent = `
    <!DOCTYPE html>
    <html lang="id">
    <head>
      <meta charset="UTF-8">
      <title>PERANGKAT_PEMBELAJARAN_${header.mapelName.replace(/\s+/g, '_')}</title>
      <style>
        body { font-family: 'Times New Roman', Times, serif; font-size: 12pt; margin: 20mm; color: #000; }
        .kop-header { text-align: center; border-bottom: 3px double #000; padding-bottom: 10px; margin-bottom: 20px; }
        .kop-header h2 { margin: 0; font-size: 16pt; font-weight: bold; text-transform: uppercase; }
        .kop-header h3 { margin: 2px 0; font-size: 14pt; font-weight: bold; text-transform: uppercase; }
        .kop-header p { margin: 0; font-size: 10pt; font-style: italic; }
        .meta-table { width: 100%; margin-bottom: 20px; border-collapse: collapse; }
        .meta-table td { padding: 4px; font-size: 11pt; vertical-align: top; }
        .section-title { font-size: 12pt; font-weight: bold; text-transform: uppercase; background-color: #f0f0f0; padding: 6px; border: 1px solid #000; margin-top: 15px; margin-bottom: 10px; }
        table.data-table { width: 100%; border-collapse: collapse; margin-bottom: 15px; }
        table.data-table th, table.data-table td { border: 1px solid #000; padding: 6px; font-size: 10.5pt; text-align: left; }
        table.data-table th { background-color: #e6e6e6; font-weight: bold; text-align: center; }
        .ttd-container { width: 100%; margin-top: 40px; display: flex; justify-content: space-between; page-break-inside: avoid; }
        .ttd-box { width: 40%; text-align: center; font-size: 11pt; }
        @media print {
          body { margin: 10mm; }
          .no-print { display: none; }
        }
      </style>
    </head>
    <body>
      <div class="kop-header">
        <h2>PEMERINTAH DAERAH PROVINSI</h2>
        <h3>DINAS PENDIDIKAN DAN KEBUDAYAAN</h3>
        <h3>${header.namaSekolah.toUpperCase()}</h3>
        <p>Jl. Pendidikan Akuntansi No. 1, Telp: (0274) 555-0199 • Website: www.smk-akl.sch.id</p>
      </div>

      <h3 style="text-align: center; margin-bottom: 20px; text-decoration: underline;">
        PERANGKAT PEMBELAJARAN KURIKULUM MERDEKA
      </h3>

      <table class="meta-table">
        <tr>
          <td width="20%"><strong>Mata Pelajaran</strong></td><td width="3%">:</td><td width="27%">${header.mapelName}</td>
          <td width="20%"><strong>Fase / Kelas</strong></td><td width="3%">:</td><td width="27%">${header.faseName} / ${header.kelasName}</td>
        </tr>
        <tr>
          <td><strong>Guru Pengampu</strong></td><td>:</td><td>${header.namaGuru}</td>
          <td><strong>Tahun Ajaran</strong></td><td>:</td><td>${header.tahunAjaran}</td>
        </tr>
      </table>

      <!-- 1. CAPAIAN PEMBELAJARAN -->
      <div class="section-title">I. CAPAIAN PEMBELAJARAN (CP)</div>
      <p><strong>Elemen:</strong> ${cp.elemen}</p>
      <p style="text-align: justify; line-height: 1.5;">${cp.teks_cp}</p>

      <!-- 2. TUJUAN PEMBELAJARAN -->
      <div class="section-title">II. DAFTAR TUJUAN PEMBELAJARAN (TP)</div>
      <table class="data-table">
        <thead>
          <tr>
            <th width="12%">Kode TP</th>
            <th width="45%">Tujuan Pembelajaran</th>
            <th width="13%">Alokasi JP</th>
            <th width="30%">Indikator / KKTP</th>
          </tr>
        </thead>
        <tbody>
          ${tpList.map(t => `
            <tr>
              <td style="text-align: center; font-weight: bold;">${t.kode_tp}</td>
              <td>${t.teks_tp}</td>
              <td style="text-align: center;">${t.alokasi_jp} JP</td>
              <td>${t.kktp_indikator}</td>
            </tr>
          `).join('')}
        </tbody>
      </table>

      <!-- 3. ALUR TUJUAN PEMBELAJARAN -->
      <div class="section-title">III. ALUR TUJUAN PEMBELAJARAN (ATP)</div>
      <table class="data-table">
        <thead>
          <tr>
            <th width="8%">Urutan</th>
            <th width="12%">Kode TP</th>
            <th width="10%">Sem.</th>
            <th width="35%">Materi Pokok</th>
            <th width="20%">Model Pembelajaran</th>
            <th width="15%">Alokasi JP</th>
          </tr>
        </thead>
        <tbody>
          ${atpList.map(a => `
            <tr>
              <td style="text-align: center;">${a.urutan}</td>
              <td style="text-align: center; font-weight: bold;">${a.kode_tp}</td>
              <td style="text-align: center;">${a.semester}</td>
              <td>${a.materi_pokok}</td>
              <td>${a.model_pembelajaran}</td>
              <td style="text-align: center;">${a.alokasi_jp} JP</td>
            </tr>
          `).join('')}
        </tbody>
      </table>

      <!-- TANDA TANGAN -->
      <div class="ttd-container">
        <div class="ttd-box">
          <p>Mengetahui,<br>Kepala Sekolah</p>
          <br><br><br>
          <p><strong>Drs. H. Mulyono, M.Pd.</strong><br>NIP. 19680312 199403 1 004</p>
        </div>
        <div class="ttd-box">
          <p>Yogyakarta, 18 Oktober 2026<br>Guru Mata Pelajaran</p>
          <br><br><br>
          <p><strong>${header.namaGuru}</strong><br>NIP. 19850415 201001 2 018</p>
        </div>
      </div>

      <script>
        window.onload = function() { window.print(); }
      </script>
    </body>
    </html>
  `;

  printWindow.document.write(htmlContent);
  printWindow.document.close();
}