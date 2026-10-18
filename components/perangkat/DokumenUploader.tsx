'use client';

import React, { useState } from 'react';
import { DokumenPerangkat } from '@/lib/types/perangkat';
import { FileText, Download, UploadCloud, Trash2 } from 'lucide-react';

interface DokumenUploaderProps {
  dokumenList: DokumenPerangkat[];
  onUpload?: (file: File, jenis: string) => void;
  onDelete?: (id: string) => void;
}

export default function DokumenUploader({
  dokumenList = [],
  onUpload,
  onDelete,
}: DokumenUploaderProps) {
  const [selectedJenis, setSelectedJenis] = useState<string>('Modul Ajar');

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0] && onUpload) {
      onUpload(e.target.files[0], selectedJenis);
    }
  };

  return (
    <div className="space-y-6">
      <div className="p-6 bg-gray-50 border-2 border-dashed border-gray-200 rounded-3xl text-center space-y-4">
        <div className="mx-auto w-12 h-12 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center">
          <UploadCloud className="w-6 h-6" />
        </div>
        <div>
          <p className="text-sm font-semibold text-gray-800">Unggah Dokumen Perangkat Ajar</p>
          <p className="text-xs text-gray-500">Format PDF, DOCX, atau XLSX (Maksimal 10MB)</p>
        </div>
        <div className="flex flex-wrap items-center justify-center gap-3">
          <select
            value={selectedJenis}
            onChange={(e) => setSelectedJenis(e.target.value)}
            className="px-3 py-2 bg-white border border-gray-200 rounded-xl text-xs focus:ring-2 focus:ring-blue-500 outline-none"
          >
            <option value="Modul Ajar">Modul Ajar</option>
            <option value="Bahan Ajar">Bahan Ajar</option>
            <option value="Lembar Kerja Siswa">Lembar Kerja Siswa (LKS)</option>
            <option value="Rubrik Penilaian">Rubrik Penilaian</option>
          </select>
          <label className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-medium rounded-xl cursor-pointer transition">
            Pilih File
            <input type="file" onChange={handleFileChange} className="hidden" />
          </label>
        </div>
      </div>

      <div className="space-y-3">
        <h4 className="text-sm font-semibold text-gray-800">Daftar Dokumen Terunggah</h4>
        {dokumenList.length === 0 ? (
          <p className="text-xs text-gray-400 italic">Belum ada dokumen yang diunggah.</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {dokumenList.map((doc, index) => (
              <div
                key={doc.id || index}
                className="p-4 bg-white border border-gray-100 rounded-2xl shadow-sm flex items-center justify-between"
              >
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-gray-50 text-blue-600 rounded-xl">
                    <FileText className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-gray-800 line-clamp-1">
                      {doc.nama_file || doc.nama_dokumen || 'Dokumen Perangkat'}
                    </p>
                    <p className="text-[10px] text-gray-400">
                      {doc.jenis_dokumen || 'Dokumen'} • {doc.ukuran || 'PDF/DOCX'}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-1">
                  {doc.url && (
                    <a
                      href={doc.url}
                      target="_blank"
                      rel="noreferrer"
                      className="p-2 text-gray-400 hover:text-blue-600 rounded-lg hover:bg-gray-50 transition"
                    >
                      <Download className="w-4 h-4" />
                    </a>
                  )}
                  {onDelete && (
                    <button
                      onClick={() => onDelete(doc.id)}
                      className="p-2 text-gray-400 hover:text-red-600 rounded-lg hover:bg-gray-50 transition"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
