'use client';

import React from 'react';
import { TPItem } from '@/lib/types/perangkat';
import { Plus, Trash2, ArrowUp, ArrowDown, AlertCircle } from 'lucide-react';

interface TPEditorProps {
  tpList: TPItem[];
  isGuru: boolean;
  onUpdateTPList: (newList: TPItem[]) => void;
}

export default function TPEditor({ tpList, isGuru, onUpdateTPList }: TPEditorProps) {
  const handleAddTP = () => {
    if (!isGuru) return;
    const nextIndex = tpList.length + 1;
    const newTP: TPItem = {
      id: `tp-temp-${Date.now()}`,
      kode_tp: `TP 1.${nextIndex}`,
      teks_tp: '',
      elemen_materi: 'Akuntansi Keuangan',
      alokasi_jp: 4,
      kktp_indikator: 'Mampu menyusun jurnal tanpa kesalahan akun.',
      urutan: nextIndex,
    };
    onUpdateTPList([...tpList, newTP]);
  };

  const handleItemChange = (id: string, field: keyof TPItem, val: any) => {
    if (!isGuru) return;
    const updated = tpList.map((t) => (t.id === id ? { ...t, [field]: val } : t));
    onUpdateTPList(updated);
  };

  const handleDelete = (id: string) => {
    if (!isGuru) return;
    if (confirm('⚠️ Menghapus TP yang sudah dipakai di Gradebook/LMS akan memberikan peringatan. Yakin hapus?')) {
      const filtered = tpList.filter((t) => t.id !== id);
      // Re-index kode
      const reindexed = filtered.map((t, idx) => ({
        ...t,
        kode_tp: `TP 1.${idx + 1}`,
        urutan: idx + 1,
      }));
      onUpdateTPList(reindexed);
    }
  };

  const handleMove = (index: number, direction: 'up' | 'down') => {
    if (!isGuru) return;
    if ((direction === 'up' && index === 0) || (direction === 'down' && index === tpList.length - 1)) return;

    const newList = [...tpList];
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    const temp = newList[index];
    newList[index] = newList[targetIndex];
    newList[targetIndex] = temp;

    // Reindex kode TP
    const reindexed = newList.map((t, idx) => ({
      ...t,
      kode_tp: `TP 1.${idx + 1}`,
      urutan: idx + 1,
    }));
    onUpdateTPList(reindexed);
  };

  return (
    <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm space-y-4">
      <div className="flex justify-between items-center border-b border-gray-100 pb-3">
        <div>
          <h3 className="font-extrabold text-sm text-gray-800">
            Daftar Tujuan Pembelajaran (TP)
          </h3>
          <p className="text-xs text-gray-500">Penomoran otomatis TP 1.1, TP 1.2, Alokasi JP & KKTP</p>
        </div>

        {isGuru && (
          <button
            onClick={handleAddTP}
            className="px-3.5 py-1.5 bg-[#E8F5E9] text-[#2E7D32] hover:bg-green-100 font-bold text-xs rounded-xl border border-[#A5D6A7] transition-all flex items-center gap-1.5"
          >
            <Plus className="w-4 h-4" /> Tambah TP
          </button>
        )}
      </div>

      <div className="space-y-3">
        {tpList.length === 0 ? (
          <div className="p-6 text-center text-gray-400 bg-gray-50 rounded-2xl border border-dashed border-gray-200 text-xs">
            Belum ada Tujuan Pembelajaran yang ditambahkan.
          </div>
        ) : (
          tpList.map((tp, idx) => (
            <div
              key={tp.id}
              className="p-4 bg-gray-50/70 border border-gray-200 rounded-2xl space-y-3 hover:border-gray-300 transition-all"
            >
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <span className="px-2.5 py-1 bg-[#2E7D32] text-white font-extrabold text-xs rounded-lg shadow-sm">
                    {tp.kode_tp}
                  </span>
                  <span className="text-xs font-bold text-gray-600">Urutan ke-{tp.urutan}</span>
                </div>

                {isGuru && (
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => handleMove(idx, 'up')}
                      disabled={idx === 0}
                      className="p-1.5 bg-white border border-gray-200 rounded-lg text-gray-600 hover:bg-gray-100 disabled:opacity-30"
                    >
                      <ArrowUp className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => handleMove(idx, 'down')}
                      disabled={idx === tpList.length - 1}
                      className="p-1.5 bg-white border border-gray-200 rounded-lg text-gray-600 hover:bg-gray-100 disabled:opacity-30"
                    >
                      <ArrowDown className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => handleDelete(tp.id)}
                      className="p-1.5 bg-red-50 border border-red-200 text-red-600 rounded-lg hover:bg-red-100 ml-1"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <div className="md:col-span-2">
                  <label className="block text-[11px] font-bold text-gray-600 mb-1">Teks Tujuan Pembelajaran:</label>
                  <input
                    type="text"
                    disabled={!isGuru}
                    value={tp.teks_tp}
                    onChange={(e) => handleItemChange(tp.id, 'teks_tp', e.target.value)}
                    placeholder="Menganalisis dokumen transaksi & menyusun Jurnal Umum..."
                    className="w-full p-2.5 bg-white border border-gray-200 rounded-xl text-xs font-medium focus:outline-none focus:border-[#2E7D32] disabled:opacity-75"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-gray-600 mb-1">Alokasi Waktu (JP):</label>
                  <input
                    type="number"
                    disabled={!isGuru}
                    value={tp.alokasi_jp}
                    onChange={(e) => handleItemChange(tp.id, 'alokasi_jp', parseInt(e.target.value) || 0)}
                    className="w-full p-2.5 bg-white border border-gray-200 rounded-xl text-xs font-bold text-gray-800 focus:outline-none focus:border-[#2E7D32] disabled:opacity-75"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-gray-600 mb-1">Indikator Kriteria Ketuntasan (KKTP):</label>
                <input
                  type="text"
                  disabled={!isGuru}
                  value={tp.kktp_indikator}
                  onChange={(e) => handleItemChange(tp.id, 'kktp_indikator', e.target.value)}
                  placeholder="Kriteria indikator ketuntasan minimal..."
                  className="w-full p-2.5 bg-white border border-gray-200 rounded-xl text-xs text-gray-700 focus:outline-none focus:border-[#2E7D32] disabled:opacity-75"
                />
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
