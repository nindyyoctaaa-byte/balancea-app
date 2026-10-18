/**
 * BALANCEA - PERANGKAT PEMBELAJARAN TYPES
 */

export type StatusPerangkat = 'Draft' | 'Final';

export interface CPData {
  id: string;
  kelas_id: string;
  mapel_id: string;
  fase: string; // 'Fase F'
  elemen: string; // e.g., 'Akuntansi Keuangan Perusahaan Dagang'
  teks_cp: string;
  status: StatusPerangkat;
  versi: number;
  updated_at: string;
}

export interface TPItem {
  id: string;
  cp_id?: string;
  kode_tp: string; // e.g., 'TP 1.1'
  teks_tp: string;
  elemen_materi: string;
  alokasi_jp: number;
  kktp_indikator: string;
  urutan: number;
}

export interface ATPItemData {
  id: string;
  tp_id: string;
  kode_tp: string;
  teks_tp: string;
  semester: '1' | '2';
  materi_pokok: string;
  alokasi_jp: number;
  model_pembelajaran: 'Problem-Based Learning' | 'Project-Based Learning' | 'Discovery Learning';
  urutan: number;
}

export interface DokumenPerangkat {
  id: string;
  nama_file: string;
  file_path: string;
  file_type: string;
  file_size: number;
  status: StatusPerangkat;
  uploaded_by?: string;
  created_at: string;
}

export interface VersionHistoryItem {
  id: string;
  versi: number;
  status: StatusPerangkat;
  created_at: string;
  created_by_name: string;
  snapshot_summary: string;
}