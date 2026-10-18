'use client';

import React from 'react';
import { TPItem, ATPItemData } from '@/lib/types/perangkat';
import { Wand2, Layers } from 'lucide-react';

interface ATPEditorProps {
  atpList: ATPItemData[];
  tpList: TPItem[];
  isGuru: boolean;
  onUpdateATPList: (newList: ATPItemData[]) => void;
}

export default function ATPEditor({ atpList, tpList, isGuru, onUpdateATPList }: ATPEditorProps) {
  const handleAutoGenerate = () => {
    if (!isGuru) return;
    if (tpList.length === 0) {
      alert('⚠️ Silakan isi minimal 1 Tujuan Pembelajaran (TP) terlebih dahulu!');
      return;
    }

    const generated: ATPItemData[] = tpList.map((tp, idx) => ({
      id: `atp-auto-${tp.id}`,
      tp_id: tp.id,
      kode_tp: tp.kode_tp,
      teks_tp: tp.teks_tp,
      semester: idx < Math.ceil(tpList.length / 2) ? '1' : '2',
      materi_pokok: tp.elemen_materi || 'Akuntansi Keuangan',
      alokasi_jp: tp.alokasi_jp || 4,
      model_pembelajaran: 'Problem-Based Learning',
      urutan: idx + 1,
    }));

    onUpdateATPList(generated);
  };

  const handleChange = (id: string, field: keyof ATPItemData, val: any) => {
    if (!isGuru) return;
    const updated = atpList.map((a) => (a.id === id ? { ...a, [field]: val } : a));
    onUpdateATPList(updated);
  };

  return (
    <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm space-y-4">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 border-b border-gray-100 pb-3">
        <div>
          <h3 className="font-extrabold text-sm text-gray-800 flex items-center gap-2">
            <Layers className="w-4 h-4 text-[#C2185B]" /> Alur Tujuan Pembelajaran (ATP)
          </h3>
          <p className="text-xs text-gray-500">Pemetaan alur semester, alokasi JP, dan model pembelajaran</p>
        </div>

        {isGuru && (
          <button
            onClick={handleAutoGenerate}
            className="px-4 py-2 bg-[#C2185B] hover:bg-pink-800 text-white font-bold text-xs rounded-xl shadow transition-all flex items-center gap-1.5"
          >
            <Wand2 className="w-4 h-4" /> Susun ATP Otomatis dari TP
          </button>
        )}
      </div>

      <div className="overflow-x-auto border border-gray-100 rounded-2xl">
        <table className="w-full text-xs text-left min-w-[650px]">
          <thead className="bg-gray-50 font-bold text-gray-700 border-b border-gray-100">
            <tr>
              <th className="p-3 w-12 text-center">Urutan</th>
              <th className="p-3 w-20 text-center">Kode</th>
              <th className="p-3">Tujuan Pembelajaran</th>
              <th className="p-3 w-24 text-center">Semester</th>
              <th className="p-3">Model Pembelajaran</th>
              <th className="p-3 w-20 text-center">JP</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 font-medium">
            {atpList.length === 0 ? (
              <tr>
                <td colSpan={6} className="p-6 text-center text-gray-400">
                  Belum ada alur ATP. Klik "Susun ATP Otomatis dari TP" di atas.
                </td>
              </tr>
            ) : (
              atpList.map((item) => (
                <tr key={item.id} className="hover:bg-gray-50">
                  <td className="p-3 text-center font-bold text-gray-500">{item.urutan}</td>
                  <td className="p-3 text-center font-bold text-[#2E7D32]">{item.kode_tp}</td>
                  <td className="p-3 text-gray-800">{item.teks_tp}</td>
                  
                  <td className="p-3 text-center">
                    <select
                      disabled={!isGuru}
                      value={item.semester}
                      onChange={(e) => handleChange(item.id, 'semester', e.target.value)}
                      className="p-1.5 bg-white border border-gray-200 rounded-lg text-xs font-bold focus:outline-none focus:border-[#2E7D32]"
                    >
                      <option value="1">Sem. 1</option>
                      <option value="2">Sem. 2</option>
                    </select>
                  </td>

                  <td className="p-3">
                    <select
                      disabled={!isGuru}
                      value={item.model_pembelajaran}
                      onChange={(e) => handleChange(item.id, 'model_pembelajaran', e.target.value)}
                      className="w-full p-1.5 bg-white border border-gray-200 rounded-lg text-xs font-semibold focus:outline-none focus:border-[#2E7D32]"
                    >
                      <option value="Problem-Based Learning">Problem-Based Learning (PBL)</option>
                      <option value="Project-Based Learning">Project-Based Learning (PjBL)</option>
                      <option value="Discovery Learning">Discovery Learning</option>
                    </select>
                  </td>

                  <td className="p-3 text-center font-bold text-gray-800">
                    {item.alokasi_jp} JP
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
