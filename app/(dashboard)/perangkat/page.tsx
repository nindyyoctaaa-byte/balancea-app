'use client';

import React, { useState } from 'react';
import { CPData, TPItem, ATPItemData, DokumenPerangkat, VersionHistoryItem } from '@/lib/types/perangkat';
import CPEditor from '@/components/perangkat/CPEditor';
import TPEditor from '@/components/perangkat/TPEditor';
import ATPEditor from '@/components/perangkat/ATPEditor';
import DokumenUploader from '@/components/perangkat/DokumenUploader';
import PreviewSiswaModal from '@/components/perangkat/PreviewSiswaModal';
import { printPerangkatPDF } from '@/lib/utils/pdfPerangkat';
import { FolderOpen, FileCheck, Eye, Printer, History, Send, RotateCcw } from 'lucide-react';

// Data Awal Mockup
const initialCP: CPData = {
  id: 'cp-1',
  kelas_id: 'kls-xi-1',
  mapel_id: 'mapel-akt-keu',
  fase: 'Fase F',
  elemen: 'Akuntansi Keuangan Perusahaan Dagang',
  teks_cp: 'Pada akhir Fase F, peserta didik mampu menganalisis dan mencatat transaksi akuntansi keuangan perusahaan dagang dan jasa secara sistematis sesuai standar akuntansi.',
  status: 'Draft',
  versi: 1,
  updated_at: new Date().toISOString(),
};

const initialTP: TPItem[] = [
  { id: 'tp-1', kode_tp: 'TP 1.1', teks_tp: 'Menganalisis dokumen transaksi dan mencatat entri Jurnal Umum', elemen_materi: 'Jurnal Umum', alokasi_jp: 4, kktp_indikator: 'Tanpa kesalahan akun', urutan: 1 },
  { id: 'tp-2', kode_tp: 'TP 1.2', teks_tp: 'Menghitung depresiasi aset tetap & menyusun Jurnal Penyesuaian', elemen_materi: 'Aset Tetap', alokasi_jp: 4, kktp_indikator: 'Ketetapan rumus depresiasi', urutan: 2 },
];

export default function PerangkatPage() {
  const [isGuru, setIsGuru] = useState(true);
  const [activeTab, setActiveTab] = useState<'cp' | 'tp' | 'atp' | 'dokumen'>('cp');
  
  const [cp, setCp] = useState<CPData>(initialCP);
  const [tpList, setTpList] = useState<TPItem[]>(initialTP);
  const [atpList, setAtpList] = useState<ATPItemData[]>([]);
  const [dokumenList, setDokumenList] = useState<DokumenPerangkat[]>([]);
  
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [historyList, setHistoryList] = useState<VersionHistoryItem[]>([]);
  const [showHistoryModal, setShowHistoryModal] = useState(false);

  // Status Switcher Final / Draft
  const handleFinalize = () => {
    if (confirm('🚀 Apakah Anda yakin ingin MEMFINALKAN dan Membagikan Perangkat ini ke Siswa? Siswa akan dapat membaca versi terbaru ini.')) {
      const nextVersi = cp.versi + 1;
      const updatedCP: CPData = { ...cp, status: 'Final', versi: nextVersi };
      setCp(updatedCP);

      // Save Snapshot to History
      const historyItem: VersionHistoryItem = {
        id: `v-${Date.now()}`,
        versi: nextVersi,
        status: 'Final',
        created_at: new Date().toLocaleString('id-ID'),
        created_by_name: 'Indah W., S.Pd.',
        snapshot_summary: `CP: ${cp.elemen} (${tpList.length} TP, ${atpList.length} ATP)`,
      };
      setHistoryList([historyItem, ...historyList]);
    }
  };

  const handleReturnToDraft = () => {
    if (confirm('↩️ Kembalikan status ke DRAFT? Perubahan baru tidak akan langsung tampil di siswa sampai difinalkan kembali.')) {
      setCp({ ...cp, status: 'Draft' });
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Banner & Header */}
      <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-lg font-extrabold text-gray-800 flex items-center gap-2">
              <FolderOpen className="w-5 h-5 text-[#2E7D32]" /> Modul 1: Perangkat Pembelajaran
            </h2>
            <span
              className={`px-3 py-1 rounded-full text-xs font-extrabold uppercase ${
                cp.status === 'Final'
                  ? 'bg-[#E8F5E9] text-[#2E7D32] border border-[#A5D6A7]'
                  : 'bg-amber-100 text-amber-800 border border-amber-300'
              }`}
            >
              Status: {cp.status} (v{cp.versi})
            </span>
          </div>
          <p className="text-xs text-gray-500 mt-1">
            Manajemen Capaian Pembelajaran, TP, ATP, dan Berkas Dokumen Kurikulum Merdeka.
          </p>
        </div>

        {/* Top Action Controls */}
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => setIsPreviewOpen(true)}
            className="px-3.5 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold text-xs rounded-xl transition-all flex items-center gap-1.5"
          >
            <Eye className="w-4 h-4 text-[#C2185B]" /> Preview Siswa
          </button>

          <button
            onClick={() =>
              printPerangkatPDF(
                {
                  namaSekolah: 'SMK NEGERI 1 AKUNTANSI',
                  namaGuru: 'Indah W., S.Pd.',
                  kelasName: 'XI AKL 1',
                  mapelName: 'Akuntansi Keuangan',
                  tahunAjaran: '2026/2027',
                  faseName: 'Fase F',
                },
                cp,
                tpList,
                atpList
              )
            }
            className="px-3.5 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold text-xs rounded-xl transition-all flex items-center gap-1.5"
          >
            <Printer className="w-4 h-4 text-gray-700" /> Cetak / Export PDF
          </button>

          {isGuru && (
            <>
              {cp.status === 'Draft' ? (
                <button
                  onClick={handleFinalize}
                  className="px-4 py-2 bg-[#2E7D32] hover:bg-green-800 text-white font-bold text-xs rounded-xl shadow transition-all flex items-center gap-1.5"
                >
                  <Send className="w-4 h-4" /> Finalkan & Bagikan ke Siswa
                </button>
              ) : (
                <button
                  onClick={handleReturnToDraft}
                  className="px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs rounded-xl shadow transition-all flex items-center gap-1.5"
                >
                  <RotateCcw className="w-4 h-4" /> Kembalikan ke Draft
                </button>
              )}
            </>
          )}
        </div>
      </div>

      {/* Tabs Navigation */}
      <div className="flex gap-2 border-b border-gray-200 pb-2 overflow-x-auto">
        <button
          onClick={() => setActiveTab('cp')}
          className={`px-4 py-2 text-xs font-bold rounded-xl transition-all ${
            activeTab === 'cp'
              ? 'bg-[#FCE4EC] text-[#C2185B] border border-[#F8BBD0]'
              : 'text-gray-500 hover:bg-gray-100'
          }`}
        >
          1. Capaian Pembelajaran (CP)
        </button>

        <button
          onClick={() => setActiveTab('tp')}
          className={`px-4 py-2 text-xs font-bold rounded-xl transition-all ${
            activeTab === 'tp'
              ? 'bg-[#FCE4EC] text-[#C2185B] border border-[#F8BBD0]'
              : 'text-gray-500 hover:bg-gray-100'
          }`}
        >
          2. Tujuan Pembelajaran ({tpList.length} TP)
        </button>

        <button
          onClick={() => setActiveTab('atp')}
          className={`px-4 py-2 text-xs font-bold rounded-xl transition-all ${
            activeTab === 'atp'
              ? 'bg-[#FCE4EC] text-[#C2185B] border border-[#F8BBD0]'
              : 'text-gray-500 hover:bg-gray-100'
          }`}
        >
          3. Alur Tujuan Pembelajaran (ATP)
        </button>

        <button
          onClick={() => setActiveTab('dokumen')}
          className={`px-4 py-2 text-xs font-bold rounded-xl transition-all ${
            activeTab === 'dokumen'
              ? 'bg-[#FCE4EC] text-[#C2185B] border border-[#F8BBD0]'
              : 'text-gray-500 hover:bg-gray-100'
          }`}
        >
          4. Dokumen Unggahan ({dokumenList.length})
        </button>
      </div>

      {/* Tab Panels */}
      {activeTab === 'cp' && (
        <CPEditor cpData={cp} isGuru={isGuru} onSave={(updated) => setCp(updated)} />
      )}

      {activeTab === 'tp' && (
        <TPEditor tpList={tpList} isGuru={isGuru} onUpdateTPList={(newList) => setTpList(newList)} />
      )}

      {activeTab === 'atp' && (
        <ATPEditor
          atpList={atpList}
          tpList={tpList}
          isGuru={isGuru}
          onUpdateATPList={(newList) => setAtpList(newList)}
        />
      )}

      {activeTab === 'dokumen' && (
        <DokumenUploader
          dokumenList={dokumenList}
          isGuru={isGuru}
          onUpload={(newDoc) => setDokumenList([...dokumenList, newDoc])}
          onDelete={(id) => setDokumenList(dokumenList.filter((d) => d.id !== id))}
        />
      )}

      {/* Modal Preview Siswa */}
      <PreviewSiswaModal
        isOpen={isPreviewOpen}
        onClose={() => setIsPreviewOpen(false)}
        cp={cp}
        tpList={tpList}
        atpList={atpList}
      />
    </div>
  );
}
