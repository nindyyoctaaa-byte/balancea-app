'use client';

import React from 'react';
import { X, CheckCircle, FileText } from 'lucide-react';

interface PreviewSiswaModalProps {
  isOpen: boolean;
  onClose: () => void;
  cpData?: any;
}

export default function PreviewSiswaModal({
  isOpen,
  onClose,
  cpData,
}: PreviewSiswaModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 overflow-y-auto">
      <div className="bg-white rounded-3xl p-6 w-full max-w-3xl shadow-2xl space-y-6 border border-gray-100 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between border-b pb-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-blue-50 text-blue-600 rounded-2xl">
              <FileText className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-gray-900">
                Preview Perangkat Ajar (Siswa)
              </h3>
              <p className="text-sm text-gray-500">
                Tampilan dokumen Capaian Pembelajaran untuk Siswa
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-gray-600 rounded-full hover:bg-gray-100 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="space-y-4 text-sm text-gray-700">
          <div className="p-4 bg-gray-50 rounded-2xl space-y-2 border border-gray-100">
            <p><strong>Mata Pelajaran:</strong> {cpData?.nama_matpel || 'Akuntansi Keuangan'}</p>
            <p><strong>Fase/Kategori:</strong> {cpData?.fase || 'Fase F'} - SMK AKL</p>
            <p><strong>Status Modul:</strong> {cpData?.status || 'Draft'}</p>
          </div>

          <div className="p-4 border rounded-2xl space-y-2">
            <h4 className="font-semibold text-gray-900 flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-emerald-500" />
              Capaian Pembelajaran
            </h4>
            <p className="text-gray-600 leading-relaxed">
              {cpData?.deskripsi || 'Belum ada deskripsi Capaian Pembelajaran yang diunggah.'}
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="flex justify-end pt-2">
          <button
            onClick={onClose}
            className="px-5 py-2.5 bg-gray-900 hover:bg-gray-800 text-white text-sm font-semibold rounded-xl transition"
          >
            Tutup Preview
          </button>
        </div>
      </div>
    </div>
  );
}
