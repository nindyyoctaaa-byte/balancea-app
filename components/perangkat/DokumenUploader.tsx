'use client';

import React, { useState } from 'react';
import { DokumenPerangkat } from '@/lib/types/perangkat';
import { FileWord, FileText, Download, UploadCloud, Trash2, CheckCircle2 } from 'lucide-react';

interface DokumenUploaderProps {
  dokumenList: DokumenPerangkat[];
  isGuru: boolean;
  onUpload: (newDoc: DokumenPerangkat) => void;
  onDelete: (id: string) => void;
}

export default function DokumenUploader({ dokumenList, isGuru, onUpload, onDelete }: DokumenUploaderProps) {
  const [uploadProgress, setUploadProgress] = useState<number | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !isGuru) return;

    // Validasi Ukuran File (Maksimal 15MB)
    if (file.size > 15 * 1024 * 1024) {
      alert('⚠️ Ukuran file melebihi batas maksimal 15MB!');
      return;
    }

    // Validasi Format (.docx, .doc, .pdf, .xlsx)
    const allowedExtensions = ['docx', 'doc', 'pdf', 'xlsx'];
    const ext = file.name.split('.').pop()?.toLowerCase();
    if (!ext || !allowedExtensions.includes(ext)) {
      alert('⚠️ Format file tidak didukung! Hanya file .docx, .pdf, dan .xlsx yang diperbolehkan.');
      return;
    }

    // Simulate Upload Progress
    setUploadProgress(20);
    const interval = setInterval(() => {
      setUploadProgress((prev) => {
        if (prev === null || prev >= 100) {
          clearInterval(interval);
          setUploadProgress(null);

          const newDoc: DokumenPerangkat = {
            id: `doc-${Date.now()}`,
            nama_file: file.name,
            file_path: `/storage/perangkat/${file.name}`,
            file_type: ext,
            file_size: file.size,
            status: 'Draft',
            created_at: new Date().toISOString(),
          };
          onUpload(newDoc);
          return null;
        }
        return prev + 30;
      });
    }, 200);
  };

  const downloadTemplateExcel = () => {
    const csvContent = "data:text/csv;charset=utf-8,Kode_TP,Teks_TP,Alokasi_JP,KKTP\nTP 1.1,Menganalisis dokumen transaksi,4,Siswa mampu mencatat jurnal tanpa salah akun\nTP 1.2,Menyusun Jurnal Penyesuaian,4,Mampu menghitung depresiasi garis lurus";
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "Template_TP_ATP_BALANCEA.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 border-b border-gray-100 pb-3">
        <div>
          <h3 className="font-extrabold text-sm text-gray-800">
            Unggah Berkas Modul Ajar / LKPD / Template TP
          </h3>
          <p className="text-xs text-gray-500">Mendukung format .docx, .pdf, .xlsx (Maksimal 15MB)</p>
        </div>

        <button
          onClick={downloadTemplateExcel}
          className="px-3.5 py-1.5 bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold text-xs rounded-xl transition-all flex items-center gap-1.5 border border-gray-200"
        >
          <Download className="w-4 h-4 text-[#2E7D32]" /> Unduh Template TP Excel
        </button>
      </div>

      {isGuru && (
        <div className="border-2 border-dashed border-gray-300 rounded-2xl p-6 text-center hover:border-[#C2185B] transition-all bg-gray-50/50 relative">
          <UploadCloud className="w-8 h-8 text-[#C2185B] mx-auto mb-2" />
          <p className="text-xs font-bold text-gray-700">Klik atau Drag & Drop Berkas di Sini</p>
          <p className="text-[10px] text-gray-400 mt-1">Ukuran berkas maksimal 15MB per file</p>
          
          <input
            type="file"
            onChange={handleFileChange}
            accept=".docx, .doc, .pdf, .xlsx"
            className="absolute inset-0 opacity-0 cursor-pointer"
          />

          {uploadProgress !== null && (
            <div className="mt-3 w-full bg-gray-200 rounded-full h-2 overflow-hidden">
              <div
                className="bg-[#2E7D32] h-2 transition-all duration-300"
                style={{ width: `${uploadProgress}%` }}
              />
            </div>
          )}
        </div>
      )}

      {/* List Uploaded Files */}
      <div className="space-y-2">
        <p className="text-xs font-bold text-gray-700">Berkas Terunggah ({dokumenList.length}):</p>
        {dokumenList.length === 0 ? (
          <p className="text-xs text-gray-400 italic">Belum ada dokumen yang diunggah.</p>
        ) : (
          dokumenList.map((doc) => (
            <div
              key={doc.id}
              className="p-3 bg-gray-50 border border-gray-200 rounded-xl flex items-center justify-between text-xs"
            >
              <div className="flex items-center gap-3">
                <FileText className="w-5 h-5 text-[#2E7D32]" />
                <div>
                  <p className="font-bold text-gray-800">{doc.nama_file}</p>
                  <p className="text-[10px] text-gray-400">
                    {(doc.file_size / (1024 * 1024)).toFixed(2)} MB • Status: {doc.status}
                  </p>
                </div>
              </div>

              {isGuru && (
                <button
                  onClick={() => onDelete(doc.id)}
                  className="p-1.5 text-red-400 hover:text-red-600 rounded-lg"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
}
