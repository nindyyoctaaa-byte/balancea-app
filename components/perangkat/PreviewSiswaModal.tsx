'use client';

import React from 'react';
import { X, CheckCircle, FileText, Layers, ListChecks } from 'lucide-react';

interface PreviewSiswaModalProps {
  isOpen: boolean;
  onClose: () => void;
  cp?: any;
  tpList?: any[];
  atpList?: any[];
}

export default function PreviewSiswaModal({
  isOpen,
  onClose,
  cp,
  tpList = [],
  atpList = [],
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
                Tampilan dokumen Capaian Pembelajaran, TP, dan ATP untuk Siswa
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
        <div className="space-y-6 text-sm text-gray-700">
          {/* Header Info */}
          <div className="p-4 bg-gray-50 rounded-2xl space-y-2 border border-gray-100">
            <p><strong>Mata Pelajaran:</strong> {cp?.nama_matpel || cp?.matpel || 'Akuntansi Keuangan'}</p>
            <p><strong>Fase/Kategori:</strong> {cp?.fase || 'Fase F'} - SMK AKL</p>
            <p><strong>Status Modul:</strong> {cp?.status || 'Draft'}</p>
          </div>

          {/* CP Section */}
          <div className="p-4 border rounded-2xl space-y-2">
            <h4 className="font-semibold text-gray-900 flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-emerald-500" />
              Capaian Pembelajaran (CP)
            </h4>
            <p className="text-gray-600 leading-relaxed">
              {cp?.deskripsi || cp?.elemen || 'Belum ada deskripsi Capaian Pembelajaran.'}
            </p>
          </div>

          {/* TP Section */}
          {tpList.length > 0 && (
            <div className="p-4 border rounded-2xl space-y-3">
              <h4 className="font-semibold text-gray-900 flex items-center gap-2">
                <Layers className="w-4 h-4 text-blue-500" />
                Tujuan Pembelajaran (TP)
              </h4>
              <ul className="list-disc list-inside space-y-1 text-gray-600">
                {tpList.map((tp: any, index: number) => (
                  <li key={index}>
                    {tp.kode_tp ? `[${tp.kode_tp}] ` : ''}{tp.deskripsi || tp.tp_text || JSON.stringify(tp)}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* ATP Section */}
          {atpList.length > 0 && (
            <div className="p-4 border rounded-2xl space-y-3">
              <h4 className="font-semibold text-gray-900 flex items-center gap-2">
                <ListChecks className="w-4 h-4 text-purple-500" />
                Alur Tujuan Pembelajaran (ATP)
              </h4>
              <ul className="list-decimal list-inside space-y-1 text-gray-600">
                {atpList.map((atp: any, index: number) => (
                  <li key={index}>
                    {atp.materi || atp.atp_text || JSON.stringify(atp)}
                  </li>
                ))}
              </ul>
            </div>
          )}
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
