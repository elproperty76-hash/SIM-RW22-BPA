import React, { useState, useMemo } from 'react';
import {
  Users,
  Search,
  Filter,
  Plus,
  FileSpreadsheet,
  Download,
  Printer,
  Edit2,
  Trash2,
  Phone,
  Home,
  Shield,
  Eye,
  X,
  UserCheck,
} from 'lucide-react';
import { Warga, PengurusRTInfo, RTNumber } from '../types';
import { ImportRtModal } from './ImportRtModal';
import { WargaModal } from './WargaModal';
import { formatDateIndo, calculateAge, exportToCSV } from '../utils/formatters';

interface WargaManagerProps {
  warga: Warga[];
  daftarRT: PengurusRTInfo[];
  onSaveWarga: (wargaList: Warga[]) => void;
  selectedRtFilter: RTNumber | 'ALL';
  onRtFilterChange: (rt: RTNumber | 'ALL') => void;
  isImportModalOpen: boolean;
  setIsImportModalOpen: (open: boolean) => void;
}

export const WargaManager: React.FC<WargaManagerProps> = ({
  warga,
  daftarRT,
  onSaveWarga,
  selectedRtFilter,
  onRtFilterChange,
  isImportModalOpen,
  setIsImportModalOpen,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [filterGender, setFilterGender] = useState<'ALL' | 'L' | 'P'>('ALL');
  const [filterDomisili, setFilterDomisili] = useState<'ALL' | 'Tetap' | 'Kontrak'>('ALL');
  const [filterKeluarga, setFilterKeluarga] = useState<'ALL' | 'Kepala Keluarga' | 'Istri' | 'Anak'>('ALL');
  
  // Modal states
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingWarga, setEditingWarga] = useState<Warga | null>(null);
  const [selectedWargaDetail, setSelectedWargaDetail] = useState<Warga | null>(null);

  // Filtered warga
  const filteredWarga = useMemo(() => {
    return warga.filter((item) => {
      // RT filter
      if (selectedRtFilter !== 'ALL' && item.rt !== selectedRtFilter) {
        return false;
      }
      // Gender filter
      if (filterGender !== 'ALL' && item.jenisKelamin !== filterGender) {
        return false;
      }
      // Domisili filter
      if (filterDomisili !== 'ALL' && item.statusDomisili !== filterDomisili) {
        return false;
      }
      // Status Keluarga filter
      if (filterKeluarga !== 'ALL' && item.statusDalamKeluarga !== filterKeluarga) {
        return false;
      }
      // Search query
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase();
        const matchName = item.nama.toLowerCase().includes(query);
        const matchNik = item.nik.includes(query);
        const matchKk = item.noKk.includes(query);
        const matchAlamat = item.alamat.toLowerCase().includes(query);
        const matchPekerjaan = item.pekerjaan.toLowerCase().includes(query);
        return matchName || matchNik || matchKk || matchAlamat || matchPekerjaan;
      }
      return true;
    });
  }, [warga, selectedRtFilter, filterGender, filterDomisili, filterKeluarga, searchQuery]);

  // Calculations
  const totalWargaFiltered = filteredWarga.length;
  const totalKKFiltered = filteredWarga.filter((w) => w.statusDalamKeluarga === 'Kepala Keluarga').length;

  const handleImportSuccess = (newWarga: Warga[]) => {
    // Merge without duplicating NIK
    const existingNiks = new Set(warga.map((w) => w.nik));
    const toAdd = newWarga.filter((w) => !existingNiks.has(w.nik));
    const updated = [...toAdd, ...warga];
    onSaveWarga(updated);
    alert(`Berhasil mengimpor ${toAdd.length} data warga baru dari pengurus RT!`);
  };

  const handleSaveSingleWarga = (savedItem: Warga) => {
    const exists = warga.some((w) => w.id === savedItem.id);
    let updated: Warga[];
    if (exists) {
      updated = warga.map((w) => (w.id === savedItem.id ? savedItem : w));
    } else {
      updated = [savedItem, ...warga];
    }
    onSaveWarga(updated);
  };

  const handleDeleteWarga = (id: string, nama: string) => {
    if (window.confirm(`Apakah Anda yakin ingin menghapus data warga "${nama}"?`)) {
      const updated = warga.filter((w) => w.id !== id);
      onSaveWarga(updated);
    }
  };

  const handleExportCSV = () => {
    const headers = [
      'No',
      'NIK',
      'No KK',
      'Nama Lengkap',
      'RT',
      'RW',
      'Alamat',
      'Jenis Kelamin',
      'Tempat Lahir',
      'Tanggal Lahir',
      'Usia',
      'Agama',
      'Status Perkawinan',
      'Status Keluarga',
      'Pekerjaan',
      'No HP',
      'Domisili',
      'Gol Darah',
    ];

    const rows = filteredWarga.map((w, idx) => [
      idx + 1,
      w.nik,
      w.noKk,
      w.nama,
      `RT 0${w.rt}`,
      'RW 22',
      w.alamat,
      w.jenisKelamin === 'L' ? 'Laki-laki' : 'Perempuan',
      w.tempatLahir,
      w.tanggalLahir,
      calculateAge(w.tanggalLahir),
      w.agama,
      w.statusPerkawinan,
      w.statusDalamKeluarga,
      w.pekerjaan,
      w.noHp,
      w.statusDomisili,
      w.golonganDarah,
    ]);

    const rtLabel = selectedRtFilter === 'ALL' ? 'SEMUA_RT' : `RT0${selectedRtFilter}`;
    exportToCSV(`data_warga_rw22_${rtLabel}_${new Date().toISOString().slice(0, 10)}.csv`, [
      headers,
      ...rows,
    ]);
  };

  const handlePrintList = () => {
    window.print();
  };

  return (
    <div className="space-y-6">
      {/* Header Controls */}
      <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-3">
          <div>
            <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
              <Users className="w-5 h-5 text-emerald-600" />
              <span>Pendataan Warga RW 22 Bumi Pesona Asri</span>
            </h2>
            <p className="text-xs text-slate-500">
              Sinkronisasi dan integrasi berkas kependudukan dari Pengurus RT 01 s/d RT 09
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              id="btn-open-import-warga"
              onClick={() => setIsImportModalOpen(true)}
              className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-semibold shadow-xs transition flex items-center gap-1.5"
            >
              <FileSpreadsheet className="w-4 h-4" />
              <span>Import Data dari Pengurus RT</span>
            </button>

            <button
              id="btn-add-single-warga"
              onClick={() => {
                setEditingWarga(null);
                setIsEditModalOpen(true);
              }}
              className="px-3.5 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-semibold transition flex items-center gap-1.5"
            >
              <Plus className="w-4 h-4" />
              <span>Tambah Warga</span>
            </button>

            <button
              onClick={handleExportCSV}
              className="p-2 border border-slate-300 hover:bg-slate-50 text-slate-700 rounded-xl text-xs font-medium transition"
              title="Ekspor Data ke File CSV"
            >
              <Download className="w-4 h-4" />
            </button>

            <button
              onClick={handlePrintList}
              className="p-2 border border-slate-300 hover:bg-slate-50 text-slate-700 rounded-xl text-xs font-medium transition"
              title="Cetak Daftar Warga"
            >
              <Printer className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* RT Filter Tabs (RT 01 s/d RT 09) */}
        <div>
          <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-2">
            Pilih Unit RT (Pengurus RT 01 s/d RT 09):
          </label>
          <div className="flex gap-1.5 overflow-x-auto pb-1 no-scrollbar">
            <button
              onClick={() => onRtFilterChange('ALL')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition ${
                selectedRtFilter === 'ALL'
                  ? 'bg-emerald-700 text-white shadow-xs'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              Semua Wilayah ({warga.length} Jiwa)
            </button>
            {daftarRT.map((rtItem) => {
              const count = warga.filter((w) => w.rt === rtItem.rt).length;
              const isSelected = selectedRtFilter === rtItem.rt;
              return (
                <button
                  key={rtItem.rt}
                  id={`filter-rt-${rtItem.rt}`}
                  onClick={() => onRtFilterChange(rtItem.rt)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition flex items-center gap-1.5 ${
                    isSelected
                      ? 'bg-emerald-700 text-white shadow-xs'
                      : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                  }`}
                >
                  <span>RT 0{rtItem.rt}</span>
                  <span
                    className={`text-[10px] px-1.5 py-0.2 rounded-full ${
                      isSelected ? 'bg-emerald-800 text-white' : 'bg-slate-200 text-slate-600'
                    }`}
                  >
                    {count}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Search & Secondary Filters */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5 pt-1">
          {/* Search bar */}
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Cari nama, NIK, alamat..."
              className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm focus:ring-2 focus:ring-emerald-500 focus:bg-white outline-hidden"
            />
          </div>

          {/* Gender */}
          <div>
            <select
              value={filterGender}
              onChange={(e) => setFilterGender(e.target.value as any)}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm focus:ring-2 focus:ring-emerald-500 outline-hidden"
            >
              <option value="ALL">Semua Jenis Kelamin</option>
              <option value="L">Laki-laki (L)</option>
              <option value="P">Perempuan (P)</option>
            </select>
          </div>

          {/* Domisili */}
          <div>
            <select
              value={filterDomisili}
              onChange={(e) => setFilterDomisili(e.target.value as any)}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm focus:ring-2 focus:ring-emerald-500 outline-hidden"
            >
              <option value="ALL">Semua Status Domisili</option>
              <option value="Tetap">Warga Tetap</option>
              <option value="Kontrak">Warga Kontrak / Sewa</option>
            </select>
          </div>

          {/* Status Keluarga */}
          <div>
            <select
              value={filterKeluarga}
              onChange={(e) => setFilterKeluarga(e.target.value as any)}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm focus:ring-2 focus:ring-emerald-500 outline-hidden"
            >
              <option value="ALL">Semua Posisi Keluarga</option>
              <option value="Kepala Keluarga">Kepala Keluarga (KK)</option>
              <option value="Istri">Istri</option>
              <option value="Anak">Anak</option>
            </select>
          </div>
        </div>
      </div>

      {/* Info Banner when filtering by RT */}
      {selectedRtFilter !== 'ALL' && (
        <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs text-emerald-900">
          <div className="flex items-center gap-2">
            <span className="font-bold text-sm text-emerald-800">
              Wilayah RT 0{selectedRtFilter} Bumi Pesona Asri:
            </span>
            <span>
              Ketua RT: <strong>{daftarRT.find((r) => r.rt === selectedRtFilter)?.namaKetua}</strong> (
              {daftarRT.find((r) => r.rt === selectedRtFilter)?.kontak})
            </span>
          </div>
          <button
            onClick={() => setIsImportModalOpen(true)}
            className="text-emerald-700 font-semibold underline hover:text-emerald-800 text-left"
          >
            + Import Tambahan Data Khusus RT 0{selectedRtFilter}
          </button>
        </div>
      )}

      {/* Table of Citizens */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="p-4 bg-slate-50 border-b border-slate-200 flex justify-between items-center text-xs">
          <span className="font-semibold text-slate-700">
            Menampilkan <strong className="text-slate-900">{totalWargaFiltered}</strong> warga terdata ({totalKKFiltered} Kepala Keluarga)
          </span>
          <span className="text-slate-400">RW 22 Desa Jelegong</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs sm:text-sm">
            <thead className="bg-slate-100/75 text-slate-600 font-semibold uppercase text-[11px] tracking-wider border-b border-slate-200">
              <tr>
                <th className="py-3 px-3.5">Nama & NIK</th>
                <th className="py-3 px-3">RT / Wilayah</th>
                <th className="py-3 px-3">Alamat</th>
                <th className="py-3 px-3">JK / Usia</th>
                <th className="py-3 px-3">Status KK</th>
                <th className="py-3 px-3">Domisili</th>
                <th className="py-3 px-3">Kontak</th>
                <th className="py-3 px-3.5 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredWarga.length > 0 ? (
                filteredWarga.map((item) => (
                  <tr key={item.id} className="hover:bg-slate-50/80 transition group">
                    {/* Nama & NIK */}
                    <td className="py-3 px-3.5">
                      <div className="font-semibold text-slate-900">{item.nama}</div>
                      <div className="text-[11px] text-slate-500 font-mono">
                        NIK: {item.nik}
                      </div>
                    </td>

                    {/* RT */}
                    <td className="py-3 px-3">
                      <span className="inline-flex items-center px-2 py-0.5 rounded-md bg-emerald-100 text-emerald-800 font-bold text-xs">
                        RT 0{item.rt}
                      </span>
                    </td>

                    {/* Alamat */}
                    <td className="py-3 px-3 text-slate-600 max-w-[200px] truncate">
                      {item.alamat}
                    </td>

                    {/* JK / Usia */}
                    <td className="py-3 px-3">
                      <span
                        className={`inline-block px-1.5 py-0.2 rounded font-semibold text-[10px] mr-1.5 ${
                          item.jenisKelamin === 'L'
                            ? 'bg-blue-100 text-blue-800'
                            : 'bg-pink-100 text-pink-800'
                        }`}
                      >
                        {item.jenisKelamin}
                      </span>
                      <span className="text-slate-600 text-xs">
                        {calculateAge(item.tanggalLahir)} Thn
                      </span>
                    </td>

                    {/* Status KK */}
                    <td className="py-3 px-3">
                      <span
                        className={`px-2 py-0.5 rounded-full text-[11px] font-medium ${
                          item.statusDalamKeluarga === 'Kepala Keluarga'
                            ? 'bg-indigo-50 text-indigo-700 font-semibold border border-indigo-200'
                            : 'bg-slate-100 text-slate-600'
                        }`}
                      >
                        {item.statusDalamKeluarga}
                      </span>
                    </td>

                    {/* Domisili */}
                    <td className="py-3 px-3">
                      <span
                        className={`px-2 py-0.5 rounded text-[11px] font-medium ${
                          item.statusDomisili === 'Tetap'
                            ? 'bg-emerald-50 text-emerald-700'
                            : 'bg-amber-50 text-amber-700'
                        }`}
                      >
                        {item.statusDomisili}
                      </span>
                    </td>

                    {/* Kontak */}
                    <td className="py-3 px-3 font-mono text-xs text-slate-600">
                      {item.noHp ? (
                        <span className="flex items-center gap-1">
                          <Phone className="w-3 h-3 text-slate-400" />
                          {item.noHp}
                        </span>
                      ) : (
                        <span className="text-slate-400">-</span>
                      )}
                    </td>

                    {/* Actions */}
                    <td className="py-3 px-3.5 text-right whitespace-nowrap">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => setSelectedWargaDetail(item)}
                          className="p-1.5 text-slate-500 hover:text-emerald-700 hover:bg-emerald-50 rounded-lg transition"
                          title="Lihat Rincian Data Warga"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => {
                            setEditingWarga(item);
                            setIsEditModalOpen(true);
                          }}
                          className="p-1.5 text-slate-500 hover:text-blue-700 hover:bg-blue-50 rounded-lg transition"
                          title="Ubah Data"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteWarga(item.id, item.nama)}
                          className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition"
                          title="Hapus Data"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={8} className="py-8 text-center text-slate-400 text-xs">
                    Tidak ada data warga yang cocok dengan kriteria pencarian atau filter RT.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Citizen Detail Modal Drawer */}
      {selectedWargaDetail && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-200">
            <div className="flex justify-between items-start border-b border-slate-100 pb-3 mb-4">
              <div>
                <span className="text-xs font-semibold text-emerald-700 uppercase tracking-wider bg-emerald-50 px-2 py-0.5 rounded">
                  Biodata Lengkap Warga
                </span>
                <h3 className="text-lg font-bold text-slate-900 mt-1">
                  {selectedWargaDetail.nama}
                </h3>
                <p className="text-xs text-slate-500">
                  RT 0{selectedWargaDetail.rt} / RW 22 Bumi Pesona Asri
                </p>
              </div>
              <button
                onClick={() => setSelectedWargaDetail(null)}
                className="text-slate-400 hover:text-slate-600 p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="grid grid-cols-2 gap-3 text-xs text-slate-700">
              <div className="p-2.5 bg-slate-50 rounded-xl">
                <span className="text-[10px] text-slate-400 uppercase font-medium block">Nomor Induk Kependudukan (NIK)</span>
                <strong className="text-slate-900 font-mono">{selectedWargaDetail.nik}</strong>
              </div>
              <div className="p-2.5 bg-slate-50 rounded-xl">
                <span className="text-[10px] text-slate-400 uppercase font-medium block">Nomor Kartu Keluarga (KK)</span>
                <strong className="text-slate-900 font-mono">{selectedWargaDetail.noKk}</strong>
              </div>

              <div className="col-span-2 p-2.5 bg-slate-50 rounded-xl">
                <span className="text-[10px] text-slate-400 uppercase font-medium block">Alamat / Nomor Rumah</span>
                <strong className="text-slate-900">{selectedWargaDetail.alamat}</strong>
              </div>

              <div className="p-2.5 bg-slate-50 rounded-xl">
                <span className="text-[10px] text-slate-400 uppercase font-medium block">Tempat, Tanggal Lahir</span>
                <strong className="text-slate-900">
                  {selectedWargaDetail.tempatLahir}, {formatDateIndo(selectedWargaDetail.tanggalLahir)} ({calculateAge(selectedWargaDetail.tanggalLahir)} thn)
                </strong>
              </div>
              <div className="p-2.5 bg-slate-50 rounded-xl">
                <span className="text-[10px] text-slate-400 uppercase font-medium block">Jenis Kelamin & Gol Darah</span>
                <strong className="text-slate-900">
                  {selectedWargaDetail.jenisKelamin === 'L' ? 'Laki-laki' : 'Perempuan'} (Gol: {selectedWargaDetail.golonganDarah || '-'})
                </strong>
              </div>

              <div className="p-2.5 bg-slate-50 rounded-xl">
                <span className="text-[10px] text-slate-400 uppercase font-medium block">Status Keluarga & Kawin</span>
                <strong className="text-slate-900">
                  {selectedWargaDetail.statusDalamKeluarga} • {selectedWargaDetail.statusPerkawinan}
                </strong>
              </div>
              <div className="p-2.5 bg-slate-50 rounded-xl">
                <span className="text-[10px] text-slate-400 uppercase font-medium block">Pekerjaan & Agama</span>
                <strong className="text-slate-900">
                  {selectedWargaDetail.pekerjaan || '-'} • {selectedWargaDetail.agama}
                </strong>
              </div>

              <div className="p-2.5 bg-slate-50 rounded-xl">
                <span className="text-[10px] text-slate-400 uppercase font-medium block">Kontak Telepon / WA</span>
                <strong className="text-slate-900 font-mono">{selectedWargaDetail.noHp || '-'}</strong>
              </div>
              <div className="p-2.5 bg-slate-50 rounded-xl">
                <span className="text-[10px] text-slate-400 uppercase font-medium block">Status Domisili</span>
                <strong className="text-emerald-700">{selectedWargaDetail.statusDomisili}</strong>
              </div>
            </div>

            <div className="mt-5 flex justify-end gap-2">
              <button
                onClick={() => {
                  setEditingWarga(selectedWargaDetail);
                  setSelectedWargaDetail(null);
                  setIsEditModalOpen(true);
                }}
                className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-semibold transition"
              >
                Ubah Data Ini
              </button>
              <button
                onClick={() => setSelectedWargaDetail(null)}
                className="px-4 py-2 bg-slate-200 hover:bg-slate-300 text-slate-800 rounded-xl text-xs font-semibold transition"
              >
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Import Modal */}
      <ImportRtModal
        isOpen={isImportModalOpen}
        onClose={() => setIsImportModalOpen(false)}
        onImportSuccess={handleImportSuccess}
        existingWarga={warga}
        initialRt={selectedRtFilter === 'ALL' ? 1 : selectedRtFilter}
      />

      {/* Single Add / Edit Modal */}
      <WargaModal
        isOpen={isEditModalOpen}
        onClose={() => {
          setIsEditModalOpen(false);
          setEditingWarga(null);
        }}
        onSave={handleSaveSingleWarga}
        editData={editingWarga}
        defaultRt={selectedRtFilter === 'ALL' ? 1 : selectedRtFilter}
      />
    </div>
  );
};
