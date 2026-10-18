'use client';

import React, { useState } from 'react';
import { StudentCalculatedGrade, ComponentWeight } from '@/lib/utils/gradeCalculator';
import { Search, Filter, Edit2, ArrowUpDown } from 'lucide-react';

interface GradeTableProps {
  students: StudentCalculatedGrade[];
  weights: ComponentWeight;
  isGuru: boolean;
  onUpdateScore?: (studentId: string, field: keyof StudentCalculatedGrade, value: number) => void;
}

export default function GradeTable({ students, weights, isGuru, onUpdateScore }: GradeTableProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<'all' | 'tuntas' | 'remedial'>('all');
  const [sortField, setSortField] = useState<keyof StudentCalculatedGrade>('nama');
  const [sortAsc, setSortAsc] = useState(true);

  // Filter & Search Logic
  const filteredStudents = students.filter((s) => {
    const matchesSearch =
      s.nama.toLowerCase().includes(searchTerm.toLowerCase()) || s.nisn.includes(searchTerm);
    const matchesFilter =
      filterStatus === 'all'
        ? true
        : filterStatus === 'tuntas'
        ? s.isTuntas
        : !s.isTuntas;
    return matchesSearch && matchesFilter;
  });

  // Sorting Logic
  const sortedStudents = [...filteredStudents].sort((a, b) => {
    let valA = a[sortField];
    let valB = b[sortField];

    if (typeof valA === 'string') {
      return sortAsc
        ? (valA as string).localeCompare(valB as string)
        : (valB as string).localeCompare(valA as string);
    }
    return sortAsc ? (valA as number) - (valB as number) : (valB as number) - (valA as number);
  });

  const handleSort = (field: keyof StudentCalculatedGrade) => {
    if (sortField === field) {
      setSortAsc(!sortAsc);
    } else {
      setSortField(field);
      setSortAsc(true);
    }
  };

  return (
    <div className="space-y-4">
      {/* Search & Filter Bar */}
      <div className="flex flex-col sm:flex-row justify-between gap-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 absolute left-3 top-3 text-gray-400" />
          <input
            type="text"
            placeholder="Cari nama siswa atau NISN..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs focus:outline-none focus:border-[#2E7D32]"
          />
        </div>

        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-gray-500" />
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value as any)}
            className="bg-gray-50 border border-gray-200 rounded-xl px-3 py-2 text-xs font-semibold text-gray-700"
          >
            <option value="all">Semua Status KKTP</option>
            <option value="tuntas">🟢 Hanya Tuntas</option>
            <option value="remedial">🟡 Hanya Remedial</option>
          </select>
        </div>
      </div>

      {/* Responsive Table Wrapper */}
      <div className="overflow-x-auto border border-gray-100 rounded-2xl shadow-sm bg-white">
        <table className="w-full text-xs text-left min-w-[700px]">
          <thead className="bg-gray-50 text-gray-600 font-bold border-b border-gray-100">
            <tr>
              <th className="p-3 w-12">No</th>
              <th className="p-3 cursor-pointer" onClick={() => handleSort('nama')}>
                <div className="flex items-center gap-1">
                  Nama Siswa <ArrowUpDown className="w-3 h-3" />
                </div>
              </th>
              <th className="p-3 text-center">LKPD ({weights.lkpd}%)</th>
              <th className="p-3 text-center">Simulator ({weights.simulator}%)</th>
              <th className="p-3 text-center">Kuis ({weights.kuis}%)</th>
              <th className="p-3 text-center">Sumatif ({weights.sumatif}%)</th>
              <th className="p-3 text-center cursor-pointer" onClick={() => handleSort('nilaiAkhir')}>
                <div className="flex items-center justify-center gap-1">
                  Nilai Akhir <ArrowUpDown className="w-3 h-3" />
                </div>
              </th>
              <th className="p-3 text-center">Status KKTP</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 font-medium text-gray-700">
            {sortedStudents.length === 0 ? (
              <tr>
                <td colSpan={8} className="p-6 text-center text-gray-400">
                  Tidak ada data siswa yang cocok.
                </td>
              </tr>
            ) : (
              sortedStudents.map((s, idx) => (
                <tr key={s.id} className="hover:bg-gray-50/80 transition-all">
                  <td className="p-3">{idx + 1}</td>
                  <td className="p-3 font-bold text-gray-800">
                    {s.nama}
                    <span className="block text-[10px] text-gray-400 font-normal">NISN: {s.nisn}</span>
                  </td>

                  {/* Inline Score Editors for Teacher */}
                  {['lkpd', 'simulator', 'kuis', 'sumatif'].map((field) => (
                    <td key={field} className="p-3 text-center">
                      {isGuru && onUpdateScore ? (
                        <input
                          type="number"
                          min="0"
                          max="100"
                          value={s[field as keyof StudentCalculatedGrade] as number}
                          onChange={(e) =>
                            onUpdateScore(s.id, field as keyof StudentCalculatedGrade, parseFloat(e.target.value) || 0)
                          }
                          className="w-16 p-1 text-center bg-gray-50 border border-gray-200 rounded-lg text-xs font-bold text-gray-800 focus:bg-white focus:border-[#2E7D32]"
                        />
                      ) : (
                        <span>{s[field as keyof StudentCalculatedGrade] as number}</span>
                      )}
                    </td>
                  ))}

                  {/* Nilai Akhir (Calculated) */}
                  <td className="p-3 text-center">
                    <span
                      className={`font-extrabold text-sm ${
                        s.isTuntas ? 'text-[#2E7D32]' : 'text-[#C2185B]'
                      }`}
                    >
                      {s.nilaiAkhir.toFixed(1)}
                    </span>
                  </td>

                  {/* Status Badge */}
                  <td className="p-3 text-center">
                    <span
                      className={`px-2.5 py-1 text-[11px] font-bold rounded-xl border ${
                        s.isTuntas
                          ? 'bg-[#E8F5E9] text-[#2E7D32] border-[#A5D6A7]'
                          : 'bg-[#FCE4EC] text-[#C2185B] border-[#F8BBD0]'
                      }`}
                    >
                      {s.statusLabel}
                    </span>
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