'use client';

import React, { useState, useEffect } from 'react';
import { CPData } from '@/lib/types/perangkat';
import { Save, CheckCircle2, Clock, Sparkles } from 'lucide-react';

interface CPEditorProps {
  cpData: CPData;
  isGuru: boolean;
  onSave: (updated: CPData) => void;
}

export default function CPEditor({ cpData, isGuru, onSave }: CPEditorProps) {
  const [formData, setFormData] = useState<CPData>(cpData);
  const [isSaving, setIsSaving] = useState(false);
  const [lastSavedTime, setLastSavedTime] = useState<string>('Baru Saja');

  useEffect(() => {
    setFormData(cpData);
  }, [cpData]);

  const handleChange = (field: keyof CPData, val: any) => {
    if (!isGuru) return;
    const updated = { ...formData, [field]: val };
    setFormData(updated);

    // Auto-save debounced effect
    setIsSaving(true);
    const timer = setTimeout(() => {
      onSave(updated);
      setIsSaving(false);
      const now = new Date();
      setLastSavedTime(`${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`);
    }, 800);

    return () => clearTimeout(timer);
  };

  return (
    <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm space-y-5">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 border-b border-gray-100 pb-4">
        <div>
          <h3 className="font-extrabold text-sm text-gray-800 flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-[#2E7D32]" /> Formulir Capaian Pembelajaran (CP)
          </h3>
          <p className="text-xs text-gray-500">
            Fase F • Akuntansi dan Keuangan Lembaga (SMK AKL)
          </p>
        </div>

        {/* Auto-save Status Indicator */}
        <div className="flex items-center gap-2 text-xs font-semibold">
          {isSaving ? (
            <span className="flex items-center gap-1.5 text-amber-600 bg-amber-50 px-3 py-1 rounded-full border border-amber-200">
              <Clock className="w-3.5 h-3.5 animate-spin" /> Menyimpan draf...
            </span>
          ) : (
            <span className="flex items-center gap-1.5 text-[#2E7D32] bg-[#E8F5E9] px-3 py-1 rounded-full border border-[#A5D6A7]">
              <CheckCircle2 className="w-3.5 h-3.5" /> Tersimpan ({lastSavedTime})
            </span>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-xs font-bold text-gray-700 mb-1">Elemen CP:</label>
          <input
            type="text"
            disabled={!isGuru}
            value={formData.elemen}
            onChange={(e) => handleChange('elemen', e.target.value)}
            className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl text-xs font-semibold focus:outline-none focus:border-[#2E7D32] disabled:opacity-75"
            placeholder="e.g. Akuntansi Keuangan Perusahaan Dagang"
          />
        </div>

        <div>
          <label className="block text-xs font-bold text-gray-700 mb-1">Versi Dokumen Saat Ini:</label>
          <div className="p-3 bg-gray-50 border border-gray-200 rounded-xl text-xs font-bold text-gray-700 flex justify-between items-center">
            <span>Versi ke-{formData.versi}</span>
            <span
              className={`px-2.5 py-0.5 rounded-lg text-[10px] uppercase font-extrabold ${
                formData.status === 'Final'
                  ? 'bg-[#E8F5E9] text-[#2E7D32] border border-[#A5D6A7]'
                  : 'bg-amber-100 text-amber-800 border border-amber-300'
              }`}
            >
              Status: {formData.status}
            </span>
          </div>
        </div>
      </div>

      <div>
        <label className="block text-xs font-bold text-gray-700 mb-1">Teks Capaian Pembelajaran (CP):</label>
        <textarea
          rows={4}
          disabled={!isGuru}
          value={formData.teks_cp}
          onChange={(e) => handleChange('teks_cp', e.target.value)}
          className="w-full p-3 bg-gray-50 border border-gray-200 rounded-2xl text-xs text-gray-800 leading-relaxed focus:outline-none focus:border-[#2E7D32] disabled:opacity-75"
          placeholder="Tuliskan narasi Capaian Pembelajaran Kurikulum Merdeka..."
        />
      </div>
    </div>
  );
}