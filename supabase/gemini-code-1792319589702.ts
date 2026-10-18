'use client';

import React, { useState } from 'react';
import { ComponentWeight, validateWeights } from '@/lib/utils/gradeCalculator';
import { Sliders, CheckCircle2, AlertTriangle, X } from 'lucide-react';

interface BobotConfigModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentWeights: ComponentWeight;
  currentKKM: number;
  onSave: (newWeights: ComponentWeight, newKKM: number) => void;
}

export default function BobotConfigModal({
  isOpen,
  onClose,
  currentWeights,
  currentKKM,
  onSave,
}: BobotConfigModalProps) {
  const [weights, setWeights] = useState<ComponentWeight>(currentWeights);
  const [kkm, setKKM] = useState<number>(currentKKM);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleWeightChange = (key: keyof ComponentWeight, val: number) => {
    const updated = { ...weights, [key]: val };
    setWeights(updated);
    
    const validation = validateWeights(updated);
    if (!validation.isValid) {
      setErrorMsg(validation.message);
    } else {
      setErrorMsg(null);
    }
  };

  const handleSave = () => {
    const validation = validateWeights(weights);
    if (!validation.isValid) {
      setErrorMsg(validation.message);
      return;
    }
    onSave(weights, kkm);
    onClose();
  };

  const totalCurrent = Number((weights.lkpd + weights.simulator + weights.kuis + weights.sumatif).toFixed(1));

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
      <div className="bg-white rounded-3xl p-6 w-full max-w-lg shadow-2xl space-y-6 border border-gray-100">
        
        <div className="flex justify-between items-center border-b border-gray-100 pb-3">
          <div className="flex items-center gap-2">
            <Sliders className="w-5 h-5 text-[#2E7D32]" />
            <h3 className="font-extrabold text-base text-gray-800">Pengaturan Bobot & KKM / KKTP</h3>
          </div>
          <button onClick={onClose} className="p-1 text-gray-400 hover:text-gray-600 rounded-lg">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Input KKM */}
        <div className="bg-gray-50 p-4 rounded-2xl border border-gray-200 space-y-2">
          <label className="block text-xs font-bold text-gray-700">
            Batas Ketuntasan Minimal (KKM / KKTP Mapel):
          </label>
          <input
            type="number"
            min="0"
            max="100"
            value={kkm}
            onChange={(e) => setKKM(Number(e.target.value))}
            className="w-full p-2.5 bg-white border border-gray-200 rounded-xl text-xs font-bold text-gray-800 focus:outline-none focus:border-[#2E7D32]"
          />
        </div>

        {/* Sliders Bobot */}
        <div className="space-y-4">
          <p className="text-xs font-bold text-gray-700">Bobot Komponen Penilaian (Total Wajib 100%):</p>

          <div className="space-y-3">
            <div>
              <div className="flex justify-between text-xs font-semibold mb-1">
                <span>Tugas / LKPD</span>
                <span className="font-bold text-[#2E7D32]">{weights.lkpd}%</span>
              </div>
              <input
                type="range"
                min="0"
                max="100"
                value={weights.lkpd}
                onChange={(e) => handleWeightChange('lkpd', Number(e.target.value))}
                className="w-full accent-[#2E7D32]"
              />
            </div>

            <div>
              <div className="flex justify-between text-xs font-semibold mb-1">
                <span>Simulator Jurnal</span>
                <span className="font-bold text-[#2E7D32]">{weights.simulator}%</span>
              </div>
              <input
                type="range"
                min="0"
                max="100"
                value={weights.simulator}
                onChange={(e) => handleWeightChange('simulator', Number(e.target.value))}
                className="w-full accent-[#2E7D32]"
              />
            </div>

            <div>
              <div className="flex justify-between text-xs font-semibold mb-1">
                <span>Kuis LMS</span>
                <span className="font-bold text-[#2E7D32]">{weights.kuis}%</span>
              </div>
              <input
                type="range"
                min="0"
                max="100"
                value={weights.kuis}
                onChange={(e) => handleWeightChange('kuis', Number(e.target.value))}
                className="w-full accent-[#2E7D32]"
              />
            </div>

            <div>
              <div className="flex justify-between text-xs font-semibold mb-1">
                <span>Ujian Sumatif</span>
                <span className="font-bold text-[#2E7D32]">{weights.sumatif}%</span>
              </div>
              <input
                type="range"
                min="0"
                max="100"
                value={weights.sumatif}
                onChange={(e) => handleWeightChange('sumatif', Number(e.target.value))}
                className="w-full accent-[#2E7D32]"
              />
            </div>
          </div>
        </div>

        {/* Indicator Total Bobot */}
        <div
          className={`p-3 rounded-2xl flex items-center justify-between text-xs font-bold ${
            totalCurrent === 100
              ? 'bg-[#E8F5E9] text-[#2E7D32] border border-[#A5D6A7]'
              : 'bg-[#FCE4EC] text-[#C2185B] border border-[#F8BBD0]'
          }`}
        >
          <span className="flex items-center gap-1.5">
            {totalCurrent === 100 ? <CheckCircle2 className="w-4 h-4" /> : <AlertTriangle className="w-4 h-4" />}
            Total Alokasi Bobot:
          </span>
          <span>{totalCurrent}%</span>
        </div>

        {errorMsg && <p className="text-[11px] font-bold text-[#C2185B]">{errorMsg}</p>}

        {/* Action Buttons */}
        <div className="flex justify-end gap-2 pt-2">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold text-xs rounded-xl"
          >
            Batal
          </button>
          <button
            onClick={handleSave}
            disabled={totalCurrent !== 100}
            className={`px-5 py-2 font-bold text-xs rounded-xl text-white shadow transition-all ${
              totalCurrent === 100 ? 'bg-[#2E7D32] hover:bg-green-800' : 'bg-gray-300 cursor-not-allowed'
            }`}
          >
            Simpan Konfigurasi
          </button>
        </div>

      </div>
    </div>
  );
}