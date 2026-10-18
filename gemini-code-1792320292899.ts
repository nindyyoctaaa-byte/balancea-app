'use client';

import React from 'react';
import { CPData, TPItem, ATPItemData } from '@/lib/types/perangkat';
import { X, Eye, ShieldCheck, AlertTriangle } from 'lucide-react';

interface PreviewSiswaModalProps {
  isOpen: boolean;
  onClose: () => void;
  cp: CPData;
  tpList: TPItem[];
  atpList: ATPItemData[];
}

export default function PreviewSiswaModal({
  isOpen,
  onClose,
  cp,
  tpList,
  atpList,
}: PreviewSiswaModalProps) {
  if (!isOpen) return null;

  const isFinal = cp.status === 'Final';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 overflow-y-auto">
      <div className="bg-white rounded-3xl p-6 w-full max-w-3xl shadow-2xl space-y-6 border border-gray-100 max-h-[90vh] overflow-y-auto">
        
        {/* Modal Header */}
        <div className="flex justify-between items-center border-b border-gray-100 pb-3">
          <div className="flex items-center gap-2">
            <Eye className="w-5 h-5 text-[#C2185B]" />
            <h3 className="font-extrabold text-base text-gray-800">
              Simulasi Tampilan Siswa (Read-Only)
            </h3>
          </div>
          <button onClick={onClose} className="p-1 text-gray-400 hover:text-gray-600 rounded-lg">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Guarding Alert */}
        {!isFinal ? (
          <div className="p-6 bg-[#FCE4EC] border border-[#F8BBD0] rounded-2xl text-center space-y-2">
            <AlertTriangle className="w-8 h-8 text-[#C2185B] mx-auto" />
            <h4 className="font-extrabold text-sm text-[#C2185B]">
              Perangkat Masih Berstatus DRAFT!
            </h4>
            <p className="text-xs text-gray-600">
              Siswa tidak akan dapat melihat dokumen ini di portal siswa sampai Guru menekan tombol
              <strong> "Finalkan & Bagikan ke Siswa"</strong>.
            </p>
          </div>
        ) : (
          <div className="space-y-6">
            <div className="p-3 bg-[#E8F5E9] border border-[#A5D6A7] rounded-xl text-xs font-bold text-[#2E7D32] flex items-center gap-2">
              <ShieldCheck className="w-4 h-4" /> Dokumen Final & Diterbitkan untuk Siswa (Versi ke-{cp.versi})
            </div>

            {/* Content Preview */}
            <div className="space-y-4 text-xs">
              <div className="p-4 bg-gray-50 rounded-2xl space-y-1">
                <p className="font-bold text-gray-700">Elemen CP: {cp.elemen}</p>
                <p className="text-gray-600 leading-relaxed">{cp.teks_cp}</p>
              </div>

              <div>
                <p className="font-bold text-gray-700 mb-2">Tujuan Pembelajaran (TP):</p>
                <ul className="list-disc pl-5 space-y-1 text-gray-600">
                  {tpList.map((t) => (
                    <li key={t.id}>
                      <strong className="text-[#2E7D32]">{t.kode_tp}:</strong> {t.teks_tp} ({t.alokasi_jp} JP)
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          )}

        <div className="flex justify-end pt-2">
          <button
            onClick={onClose}
            className="px-5 py-2 bg-gray-800 text-white font-bold text-xs rounded-xl shadow"
          >
            Tutup Preview
          </button>
        </div>

      </div>
    </div>
  );
}