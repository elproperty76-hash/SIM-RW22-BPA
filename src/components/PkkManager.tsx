import React, { useState } from 'react';
import {
  HeartHandshake,
  Users,
  Calendar,
  Plus,
  Search,
  CheckCircle,
  Clock,
  MapPin,
  X,
  Phone,
  BookOpen,
  Boxes,
  ClipboardList,
  Package,
  Trash2,
  Check,
  UserCheck,
} from 'lucide-react';
import { AnggotaPKK, KegiatanPKK, ItemInventaris, PartisipanWarga, Warga, RTNumber } from '../types';
import { formatDateIndo, formatRupiah } from '../utils/formatters';

interface PkkManagerProps {
  pkkList: AnggotaPKK[];
  kegiatanList: KegiatanPKK[];
  inventarisList: ItemInventaris[];
  onSavePkk: (list: AnggotaPKK[]) => void;
  onSaveKegiatan: (list: KegiatanPKK[]) => void;
  onSaveInventaris: (list: ItemInventaris[]) => void;
  wargaList?: Warga[];
}

export const PkkManager: React.FC<PkkManagerProps> = ({
  pkkList,
  kegiatanList,
  inventarisList,
  onSavePkk,
  onSaveKegiatan,
  onSaveInventaris,
  wargaList = [],
}) => {
  const [activeTab, setActiveTab] = useState<'anggota' | 'kegiatan' | 'inventaris' | 'pokja'>('anggota');
  const [filterPokja, setFilterPokja] = useState<string>('ALL');
  const [filterRt, setFilterRt] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState('');

  // Modals
  const [isAddAnggotaOpen, setIsAddAnggotaOpen] = useState(false);
  const [isAddKegiatanOpen, setIsAddKegiatanOpen] = useState(false);
  const [isAddInventarisOpen, setIsAddInventarisOpen] = useState(false);
  const [selectedKegiatanForAttendance, setSelectedKegiatanForAttendance] = useState<KegiatanPKK | null>(null);

  // Inventaris filter
  const [selectedKategoriInv, setSelectedKategoriInv] = useState<string>('ALL');

  // Form states
  const [newAnggota, setNewAnggota] = useState<Partial<AnggotaPKK>>({
    nama: '',
    rt: 1,
    jabatan: 'Anggota Kader',
    pokja: 'Pokja I',
    noHp: '',
    keahlian: '',
    statusAktif: true,
  });

  const [newKegiatan, setNewKegiatan] = useState<Partial<KegiatanPKK>>({
    namaKegiatan: '',
    tanggal: new Date().toISOString().slice(0, 10),
    waktu: '08:30 - 11:30 WIB',
    lokasi: 'Balai Warga RW 22',
    pokja: 'Pokja IV',
    deskripsi: '',
    jumlahPeserta: 30,
    anggaran: 300000,
    statusKegiatan: 'Akan Datang',
    partisipasiWarga: [],
    catatanHasil: '',
  });

  const [newInv, setNewInv] = useState<Partial<ItemInventaris>>({
    namaBarang: '',
    kategori: 'Peralatan Kegiatan',
    jumlah: 1,
    satuan: 'Unit',
    kondisi: 'Baik',
    lokasiPenyimpanan: 'Sekretariat PKK RW 22 Bumi Pesona Asri',
    tanggalPengadaan: new Date().toISOString().slice(0, 10),
    keterangan: '',
    minimumStok: 1,
  });

  // Participant form for attendance modal
  const [newPartNama, setNewPartNama] = useState('');
  const [newPartRt, setNewPartRt] = useState<RTNumber>(1);
  const [newPartKategori, setNewPartKategori] = useState('Kader PKK');
  const [newPartKet, setNewPartKet] = useState('');

  // Filtered anggota
  const filteredAnggota = pkkList.filter((item) => {
    if (filterPokja !== 'ALL' && item.pokja !== filterPokja) return false;
    if (filterRt !== 'ALL' && item.rt !== Number(filterRt)) return false;
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      return (
        item.nama.toLowerCase().includes(q) ||
        item.jabatan.toLowerCase().includes(q) ||
        item.noHp.includes(q)
      );
    }
    return true;
  });

  // Filtered inventaris
  const filteredInventaris = inventarisList.filter((item) => {
    if (selectedKategoriInv !== 'ALL' && item.kategori !== selectedKategoriInv) return false;
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      return (
        item.namaBarang.toLowerCase().includes(q) ||
        item.lokasiPenyimpanan.toLowerCase().includes(q) ||
        (item.keterangan && item.keterangan.toLowerCase().includes(q))
      );
    }
    return true;
  });

  const handleCreateAnggota = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newAnggota.nama) return;
    const item: AnggotaPKK = {
      id: `pkk-${Date.now()}`,
      nama: newAnggota.nama,
      rt: (newAnggota.rt || 1) as RTNumber,
      jabatan: newAnggota.jabatan || 'Kader PKK',
      pokja: (newAnggota.pokja || 'Pokja I') as any,
      noHp: newAnggota.noHp || '',
      keahlian: newAnggota.keahlian || '',
      statusAktif: true,
    };
    onSavePkk([item, ...pkkList]);
    setIsAddAnggotaOpen(false);
    setNewAnggota({
      nama: '',
      rt: 1,
      jabatan: 'Anggota Kader',
      pokja: 'Pokja I',
      noHp: '',
      keahlian: '',
      statusAktif: true,
    });
  };

  const handleDeleteAnggota = (id: string, nama: string) => {
    if (window.confirm(`Hapus kader PKK "${nama}"?`)) {
      onSavePkk(pkkList.filter((p) => p.id !== id));
    }
  };

  const handleCreateKegiatan = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newKegiatan.namaKegiatan) return;
    const item: KegiatanPKK = {
      id: `kpkk-${Date.now()}`,
      namaKegiatan: newKegiatan.namaKegiatan,
      tanggal: newKegiatan.tanggal || new Date().toISOString().slice(0, 10),
      waktu: newKegiatan.waktu || '09:00 WIB',
      lokasi: newKegiatan.lokasi || 'Balai Warga RW 22',
      pokja: newKegiatan.pokja || 'Pengurus Inti',
      deskripsi: newKegiatan.deskripsi || '',
      jumlahPeserta: Number(newKegiatan.jumlahPeserta) || 0,
      anggaran: Number(newKegiatan.anggaran) || 0,
      statusKegiatan: (newKegiatan.statusKegiatan || 'Akan Datang') as any,
      partisipasiWarga: [],
      catatanHasil: '',
    };
    onSaveKegiatan([item, ...kegiatanList]);
    setIsAddKegiatanOpen(false);
    setNewKegiatan({
      namaKegiatan: '',
      tanggal: new Date().toISOString().slice(0, 10),
      waktu: '08:30 - 11:30 WIB',
      lokasi: 'Balai Warga RW 22',
      pokja: 'Pokja IV',
      deskripsi: '',
      jumlahPeserta: 30,
      anggaran: 300000,
      statusKegiatan: 'Akan Datang',
      partisipasiWarga: [],
      catatanHasil: '',
    });
  };

  const handleToggleKegiatanStatus = (kegiatanId: string, newStatus: 'Akan Datang' | 'Terlaksana' | 'Dibatalkan') => {
    const updated = kegiatanList.map((k) => (k.id === kegiatanId ? { ...k, statusKegiatan: newStatus } : k));
    onSaveKegiatan(updated);
    if (selectedKegiatanForAttendance?.id === kegiatanId) {
      setSelectedKegiatanForAttendance({ ...selectedKegiatanForAttendance, statusKegiatan: newStatus });
    }
  };

  // Participant actions for Kegiatan
  const handleAddParticipantToKegiatan = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedKegiatanForAttendance || !newPartNama.trim()) return;

    const newP: PartisipanWarga = {
      id: `part-pkk-${Date.now()}`,
      nama: newPartNama.trim(),
      rt: newPartRt,
      kategori: newPartKategori,
      statusHadir: true,
      keterangan: newPartKet.trim() || 'Hadir pada kegiatan PKK RW 22',
    };

    const curParts = selectedKegiatanForAttendance.partisipasiWarga || [];
    const updatedParts = [newP, ...curParts];

    const updatedKeg = {
      ...selectedKegiatanForAttendance,
      partisipasiWarga: updatedParts,
      jumlahPeserta: updatedParts.filter((p) => p.statusHadir).length,
    };

    const updatedList = kegiatanList.map((k) => (k.id === selectedKegiatanForAttendance.id ? updatedKeg : k));
    onSaveKegiatan(updatedList);
    setSelectedKegiatanForAttendance(updatedKeg);
    setNewPartNama('');
    setNewPartKet('');
  };

  const handleToggleAttendancePkk = (partId: string) => {
    if (!selectedKegiatanForAttendance) return;
    const curParts = selectedKegiatanForAttendance.partisipasiWarga || [];
    const updatedParts = curParts.map((p) => (p.id === partId ? { ...p, statusHadir: !p.statusHadir } : p));
    const updatedKeg = {
      ...selectedKegiatanForAttendance,
      partisipasiWarga: updatedParts,
      jumlahPeserta: updatedParts.filter((p) => p.statusHadir).length,
    };
    const updatedList = kegiatanList.map((k) => (k.id === selectedKegiatanForAttendance.id ? updatedKeg : k));
    onSaveKegiatan(updatedList);
    setSelectedKegiatanForAttendance(updatedKeg);
  };

  const handleRemoveParticipantPkk = (partId: string) => {
    if (!selectedKegiatanForAttendance) return;
    const curParts = selectedKegiatanForAttendance.partisipasiWarga || [];
    const updatedParts = curParts.filter((p) => p.id !== partId);
    const updatedKeg = {
      ...selectedKegiatanForAttendance,
      partisipasiWarga: updatedParts,
      jumlahPeserta: updatedParts.filter((p) => p.statusHadir).length,
    };
    const updatedList = kegiatanList.map((k) => (k.id === selectedKegiatanForAttendance.id ? updatedKeg : k));
    onSaveKegiatan(updatedList);
    setSelectedKegiatanForAttendance(updatedKeg);
  };

  const handleSaveCatatanHasilPkk = (catatan: string) => {
    if (!selectedKegiatanForAttendance) return;
    const updatedKeg = {
      ...selectedKegiatanForAttendance,
      catatanHasil: catatan,
    };
    const updatedList = kegiatanList.map((k) => (k.id === selectedKegiatanForAttendance.id ? updatedKeg : k));
    onSaveKegiatan(updatedList);
    setSelectedKegiatanForAttendance(updatedKeg);
  };

  // Inventaris Actions
  const handleCreateInventaris = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newInv.namaBarang) return;

    const item: ItemInventaris = {
      id: `inv-pkk-${Date.now()}`,
      namaBarang: newInv.namaBarang,
      kategori: newInv.kategori || 'Peralatan Kegiatan',
      jumlah: Number(newInv.jumlah) || 1,
      satuan: newInv.satuan || 'Unit',
      kondisi: (newInv.kondisi || 'Baik') as any,
      lokasiPenyimpanan: newInv.lokasiPenyimpanan || 'Sekretariat PKK RW 22',
      tanggalPengadaan: newInv.tanggalPengadaan || new Date().toISOString().slice(0, 10),
      keterangan: newInv.keterangan || '',
      minimumStok: Number(newInv.minimumStok) || 1,
    };

    onSaveInventaris([item, ...inventarisList]);
    setIsAddInventarisOpen(false);
    setNewInv({
      namaBarang: '',
      kategori: 'Peralatan Kegiatan',
      jumlah: 1,
      satuan: 'Unit',
      kondisi: 'Baik',
      lokasiPenyimpanan: 'Sekretariat PKK RW 22 Bumi Pesona Asri',
      tanggalPengadaan: new Date().toISOString().slice(0, 10),
      keterangan: '',
      minimumStok: 1,
    });
  };

  const handleDeleteInventaris = (id: string, nama: string) => {
    if (window.confirm(`Hapus barang inventaris "${nama}" dari PKK RW 22?`)) {
      onSaveInventaris(inventarisList.filter((i) => i.id !== id));
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-3">
          <div>
            <span className="text-[10px] font-bold text-pink-700 uppercase tracking-wider bg-pink-50 px-2.5 py-0.5 rounded">
              Pemberdayaan Kesejahteraan Keluarga
            </span>
            <h2 className="text-lg font-bold text-slate-900 mt-1 flex items-center gap-2">
              <HeartHandshake className="w-5 h-5 text-pink-600" />
              <span>Tim Penggerak PKK RW 22 Bumi Pesona Asri</span>
            </h2>
            <p className="text-xs text-slate-500">
              Desa Jelegong, Kecamatan Rancaekek • Sinergi kader dan perwakilan warga RT 01 s/d RT 09
            </p>
          </div>

          <div className="flex items-center gap-2">
            {activeTab === 'inventaris' ? (
              <button
                onClick={() => setIsAddInventarisOpen(true)}
                className="px-3.5 py-2 bg-pink-600 hover:bg-pink-700 text-white rounded-xl text-xs font-semibold shadow-xs transition flex items-center gap-1.5"
              >
                <Plus className="w-4 h-4" />
                <span>Tambah Inventaris PKK</span>
              </button>
            ) : activeTab === 'kegiatan' ? (
              <button
                onClick={() => setIsAddKegiatanOpen(true)}
                className="px-3.5 py-2 bg-pink-600 hover:bg-pink-700 text-white rounded-xl text-xs font-semibold shadow-xs transition flex items-center gap-1.5"
              >
                <Plus className="w-4 h-4" />
                <span>Buat Agenda Kegiatan</span>
              </button>
            ) : (
              <button
                onClick={() => setIsAddAnggotaOpen(true)}
                className="px-3.5 py-2 bg-pink-600 hover:bg-pink-700 text-white rounded-xl text-xs font-semibold shadow-xs transition flex items-center gap-1.5"
              >
                <Plus className="w-4 h-4" />
                <span>Tambah Kader PKK</span>
              </button>
            )}
          </div>
        </div>

        {/* Tab Selection */}
        <div className="flex border-b border-slate-200 gap-4 overflow-x-auto">
          <button
            onClick={() => setActiveTab('anggota')}
            className={`pb-2.5 text-xs font-bold border-b-2 transition flex items-center gap-1.5 shrink-0 ${
              activeTab === 'anggota'
                ? 'border-pink-600 text-pink-700'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <Users className="w-4 h-4" />
            <span>Kader & Anggota ({pkkList.length})</span>
          </button>
          <button
            onClick={() => setActiveTab('kegiatan')}
            className={`pb-2.5 text-xs font-bold border-b-2 transition flex items-center gap-1.5 shrink-0 ${
              activeTab === 'kegiatan'
                ? 'border-pink-600 text-pink-700'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <Calendar className="w-4 h-4" />
            <span>Agenda & Presensi Warga ({kegiatanList.length})</span>
          </button>
          <button
            onClick={() => setActiveTab('inventaris')}
            className={`pb-2.5 text-xs font-bold border-b-2 transition flex items-center gap-1.5 shrink-0 ${
              activeTab === 'inventaris'
                ? 'border-pink-600 text-pink-700'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <Boxes className="w-4 h-4" />
            <span>Inventaris & Logistik PKK ({inventarisList.length})</span>
          </button>
          <button
            onClick={() => setActiveTab('pokja')}
            className={`pb-2.5 text-xs font-bold border-b-2 transition flex items-center gap-1.5 shrink-0 ${
              activeTab === 'pokja'
                ? 'border-pink-600 text-pink-700'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <BookOpen className="w-4 h-4" />
            <span>Struktur 4 Pokja PKK</span>
          </button>
        </div>
      </div>

      {/* Tab 1: Anggota PKK */}
      {activeTab === 'anggota' && (
        <div className="space-y-4">
          {/* Filter Bar */}
          <div className="bg-white p-4 rounded-xl border border-slate-200 flex flex-wrap gap-3 items-center justify-between">
            <div className="flex flex-wrap gap-2 items-center flex-1">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Cari nama kader / jabatan..."
                className="px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs w-56 focus:ring-2 focus:ring-pink-500 outline-hidden"
              />

              <select
                value={filterPokja}
                onChange={(e) => setFilterPokja(e.target.value)}
                className="px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs outline-hidden"
              >
                <option value="ALL">Semua Pokja / Bagian</option>
                <option value="Pengurus Inti">Pengurus Inti</option>
                <option value="Pokja I">Pokja I (Pancasila & Gotong Royong)</option>
                <option value="Pokja II">Pokja II (Pendidikan & Keterampilan)</option>
                <option value="Pokja III">Pokja III (Pangan Sandang Rumah Tangga)</option>
                <option value="Pokja IV">Pokja IV (Kesehatan & Lingkungan)</option>
              </select>

              <select
                value={filterRt}
                onChange={(e) => setFilterRt(e.target.value)}
                className="px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs outline-hidden"
              >
                <option value="ALL">Semua RT (RT 01 - 09)</option>
                {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((rt) => (
                  <option key={rt} value={rt}>
                    RT 0{rt}
                  </option>
                ))}
              </select>
            </div>
            <span className="text-xs text-slate-500 font-medium">
              {filteredAnggota.length} kader ditemukan
            </span>
          </div>

          {/* Grid Cards of Anggota */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
            {filteredAnggota.map((kader) => (
              <div
                key={kader.id}
                className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs hover:border-pink-300 transition flex flex-col justify-between"
              >
                <div>
                  <div className="flex justify-between items-start">
                    <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-pink-100 text-pink-800">
                      {kader.pokja}
                    </span>
                    <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-slate-100 text-slate-600">
                      RT 0{kader.rt}
                    </span>
                  </div>

                  <div className="mt-3">
                    <h4 className="text-sm font-bold text-slate-900">{kader.nama}</h4>
                    <p className="text-xs font-semibold text-pink-700 mt-0.5">{kader.jabatan}</p>
                    {kader.keahlian && (
                      <p className="text-[11px] text-slate-500 mt-1 italic">
                        Keahlian: {kader.keahlian}
                      </p>
                    )}
                  </div>
                </div>

                <div className="mt-3 pt-3 border-t border-slate-100 flex justify-between items-center text-xs">
                  <span className="text-slate-500 font-mono text-[11px] flex items-center gap-1">
                    <Phone className="w-3 h-3 text-slate-400" />
                    {kader.noHp || '-'}
                  </span>
                  <button
                    onClick={() => handleDeleteAnggota(kader.id, kader.nama)}
                    className="text-slate-400 hover:text-rose-600 text-[11px] font-medium"
                  >
                    Hapus
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tab 2: Kegiatan PKK & Presensi Partisipasi Warga */}
      {activeTab === 'kegiatan' && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {kegiatanList.map((keg) => {
              const participants = keg.partisipasiWarga || [];
              const hadirCount = participants.filter((p) => p.statusHadir).length;
              const statusBadge =
                keg.statusKegiatan === 'Terlaksana'
                  ? 'bg-emerald-100 text-emerald-800 border-emerald-200'
                  : keg.statusKegiatan === 'Dibatalkan'
                  ? 'bg-rose-100 text-rose-800 border-rose-200'
                  : 'bg-pink-50 text-pink-700 border-pink-200';

              return (
                <div
                  key={keg.id}
                  className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs hover:border-pink-300 transition flex flex-col justify-between"
                >
                  <div className="space-y-2.5">
                    <div className="flex justify-between items-start mb-1">
                      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-pink-50 text-pink-700 border border-pink-200">
                        {keg.pokja}
                      </span>
                      <div className="flex items-center gap-1.5">
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${statusBadge}`}>
                          {keg.statusKegiatan || 'Akan Datang'}
                        </span>
                        <span className="text-[11px] font-semibold text-slate-500">
                          {formatDateIndo(keg.tanggal)}
                        </span>
                      </div>
                    </div>

                    <h4 className="text-sm font-bold text-slate-900">{keg.namaKegiatan}</h4>
                    <p className="text-xs text-slate-600 leading-relaxed">{keg.deskripsi}</p>

                    <div className="mt-2 space-y-1 text-xs text-slate-500">
                      <div className="flex items-center gap-1.5">
                        <Clock className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                        <span>{keg.waktu}</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                        <span className="truncate">{keg.lokasi}</span>
                      </div>
                    </div>

                    {/* Participation summary */}
                    <div className="p-2.5 bg-pink-50/60 rounded-xl border border-pink-100 flex items-center justify-between text-xs mt-2">
                      <div>
                        <span className="font-bold text-pink-900 block">
                          Kehadiran: {hadirCount} Warga ({participants.length} Terdata)
                        </span>
                        <span className="text-[10px] text-slate-500">
                          Anggaran: {formatRupiah(keg.anggaran)}
                        </span>
                      </div>
                      <button
                        onClick={() => setSelectedKegiatanForAttendance(keg)}
                        className="px-2.5 py-1 bg-pink-600 hover:bg-pink-700 text-white font-semibold rounded-lg text-xs flex items-center gap-1 shadow-2xs"
                      >
                        <ClipboardList className="w-3.5 h-3.5" />
                        <span>Presensi</span>
                      </button>
                    </div>

                    {keg.catatanHasil && (
                      <div className="p-2 bg-slate-50 rounded-lg text-[11px] text-slate-600 border border-slate-200">
                        <span className="font-bold text-slate-800 block mb-0.5">Hasil Kegiatan:</span>
                        <p className="italic">"{keg.catatanHasil}"</p>
                      </div>
                    )}
                  </div>

                  <div className="mt-3 pt-2.5 border-t border-slate-100 flex items-center justify-between text-[11px]">
                    <span className="text-slate-500">Status:</span>
                    <div className="flex items-center gap-1">
                      {(['Akan Datang', 'Terlaksana', 'Dibatalkan'] as const).map((st) => (
                        <button
                          key={st}
                          onClick={() => handleToggleKegiatanStatus(keg.id, st)}
                          className={`px-2 py-0.5 rounded text-[10px] font-semibold transition ${
                            keg.statusKegiatan === st
                              ? 'bg-slate-900 text-white'
                              : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                          }`}
                        >
                          {st}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Tab 3: Inventaris & Logistik PKK */}
      {activeTab === 'inventaris' && (
        <div className="space-y-4">
          {/* Filter Bar */}
          <div className="bg-white p-4 rounded-xl border border-slate-200 flex flex-wrap gap-3 items-center justify-between">
            <div className="flex flex-wrap gap-2 items-center flex-1">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Cari perlengkapan, sound, tenda, banner..."
                className="px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs w-64 focus:ring-2 focus:ring-pink-500 outline-hidden"
              />

              <select
                value={selectedKategoriInv}
                onChange={(e) => setSelectedKategoriInv(e.target.value)}
                className="px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs outline-hidden"
              >
                <option value="ALL">Semua Kategori Inventaris</option>
                <option value="Peralatan Kegiatan">Peralatan Kegiatan</option>
                <option value="Elektronik & Sound">Elektronik & Sound</option>
                <option value="Seragam & Atribut">Seragam & Atribut</option>
                <option value="Fasilitas & Tenda">Fasilitas & Tenda</option>
                <option value="Administrasi & Buku">Administrasi & Buku</option>
              </select>
            </div>
            <span className="text-xs text-slate-500 font-medium">
              {filteredInventaris.length} barang inventaris tercatat
            </span>
          </div>

          {/* Table of PKK Inventory */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 text-slate-700 font-bold border-b border-slate-200">
                  <tr>
                    <th className="p-3">Nama Barang</th>
                    <th className="p-3">Kategori</th>
                    <th className="p-3">Jumlah</th>
                    <th className="p-3">Kondisi</th>
                    <th className="p-3">Lokasi Simpan</th>
                    <th className="p-3">Tgl Pengadaan</th>
                    <th className="p-3">Keterangan</th>
                    <th className="p-3 text-right">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredInventaris.length > 0 ? (
                    filteredInventaris.map((item) => (
                      <tr key={item.id} className="hover:bg-slate-50/80 transition">
                        <td className="p-3 font-bold text-slate-900">
                          <div className="flex items-center gap-2">
                            <Package className="w-4 h-4 text-pink-600 shrink-0" />
                            <span>{item.namaBarang}</span>
                          </div>
                        </td>
                        <td className="p-3">
                          <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-pink-50 text-pink-800 border border-pink-200">
                            {item.kategori}
                          </span>
                        </td>
                        <td className="p-3 font-semibold text-slate-800">
                          {item.jumlah} {item.satuan}
                        </td>
                        <td className="p-3">
                          <span
                            className={`px-2 py-0.5 rounded-md text-[11px] font-semibold ${
                              item.kondisi === 'Baik'
                                ? 'bg-emerald-100 text-emerald-800'
                                : item.kondisi === 'Perlu Kalibrasi'
                                ? 'bg-amber-100 text-amber-800'
                                : 'bg-rose-100 text-rose-800'
                            }`}
                          >
                            {item.kondisi}
                          </span>
                        </td>
                        <td className="p-3 text-slate-600">{item.lokasiPenyimpanan}</td>
                        <td className="p-3 text-slate-500 font-mono text-[11px]">
                          {item.tanggalPengadaan || '-'}
                        </td>
                        <td className="p-3 text-slate-500 max-w-[200px] truncate">
                          {item.keterangan || '-'}
                        </td>
                        <td className="p-3 text-right">
                          <button
                            onClick={() => handleDeleteInventaris(item.id, item.namaBarang)}
                            className="text-slate-400 hover:text-rose-600 p-1"
                            title="Hapus barang inventaris"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={8} className="p-8 text-center text-slate-400">
                        Tidak ada barang inventaris PKK yang cocok.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Tab 4: Struktur Pokja */}
      {activeTab === 'pokja' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-2">
            <span className="text-xs font-bold text-pink-700 bg-pink-50 px-2 py-0.5 rounded">
              POKJA I
            </span>
            <h4 className="text-base font-bold text-slate-900">
              Penghayatan & Pengamalan Pancasila, Gotong Royong
            </h4>
            <p className="text-xs text-slate-600 leading-relaxed">
              Bertanggung jawab atas pembinaan kerukunan warga perumahan, pengajian bulanan, kepedulian sosial santunan kematian, dan kegiatan gotong royong antar RT di lingkungan Bumi Pesona Asri.
            </p>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-2">
            <span className="text-xs font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded">
              POKJA II
            </span>
            <h4 className="text-base font-bold text-slate-900">
              Pendidikan, Keterampilan & Pengembangan Kehidupan Berkoperasi
            </h4>
            <p className="text-xs text-slate-600 leading-relaxed">
              Mengelola pembinaan PAUD binaan komplek, bimbingan belajar anak warga, pelatihan kerajinan daur ulang/souvenir, arisan berkoperasi mandiri, dan literasi pojok baca RW 22.
            </p>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-2">
            <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded">
              POKJA III
            </span>
            <h4 className="text-base font-bold text-slate-900">
              Pangan, Sandang, Perumahan & Tata Laksana Rumah Tangga
            </h4>
            <p className="text-xs text-slate-600 leading-relaxed">
              Pengembangan program Halaman Asri Teratur Indah dan Nyaman (HATINYA PKK), kebun bibit TOGA (Tanaman Obat Keluarga), sosialisasi diversifikasi menu pangan sehat, serta pengolahan limbah organik rumah tangga (Eco-Enzyme).
            </p>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-2">
            <span className="text-xs font-bold text-cyan-700 bg-cyan-50 px-2 py-0.5 rounded">
              POKJA IV
            </span>
            <h4 className="text-base font-bold text-slate-900">
              Kesehatan, Kelestarian Lingkungan Hidup & Perencanaan Sehat
            </h4>
            <p className="text-xs text-slate-600 leading-relaxed">
              Menaungi operasional Posyandu Melati RW 22 (Balita & Lansia), pencegahan stunting balita, gerakan cuci tangan pakai sabun, pos pembinaan terpadu penyakit tidak menular, dan program keluarga berencana.
            </p>
          </div>
        </div>
      )}

      {/* Modal Presensi & Partisipasi Warga Kegiatan PKK */}
      {selectedKegiatanForAttendance && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-3 sm:p-5 overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-2xl w-full shadow-2xl border border-slate-200 overflow-hidden my-auto max-h-[90vh] flex flex-col">
            <div className="bg-slate-900 text-white p-4 sm:p-5 flex justify-between items-start flex-shrink-0">
              <div>
                <span className="text-[10px] font-bold text-pink-400 uppercase tracking-wider bg-pink-950 px-2 py-0.5 rounded border border-pink-800">
                  Presensi & Partisipasi Kegiatan PKK
                </span>
                <h3 className="text-base font-bold text-white mt-1">
                  {selectedKegiatanForAttendance.namaKegiatan}
                </h3>
                <p className="text-xs text-slate-300">
                  {formatDateIndo(selectedKegiatanForAttendance.tanggal)} • {selectedKegiatanForAttendance.lokasi}
                </p>
              </div>
              <button
                onClick={() => setSelectedKegiatanForAttendance(null)}
                className="text-slate-400 hover:text-white p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-4 sm:p-6 overflow-y-auto space-y-4 flex-1 text-xs">
              {/* Add Participant Input */}
              <form
                onSubmit={handleAddParticipantToKegiatan}
                className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 space-y-3"
              >
                <span className="font-bold text-slate-800 block">
                  Catat Warga / Kader Hadir:
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                  <input
                    type="text"
                    required
                    value={newPartNama}
                    onChange={(e) => setNewPartNama(e.target.value)}
                    placeholder="Nama Warga / Kader Hadir"
                    className="px-3 py-1.5 bg-white border border-slate-300 rounded-lg outline-hidden font-medium"
                  />
                  <select
                    value={newPartRt}
                    onChange={(e) => setNewPartRt(Number(e.target.value) as RTNumber)}
                    className="px-3 py-1.5 bg-white border border-slate-300 rounded-lg outline-hidden"
                  >
                    {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((rt) => (
                      <option key={rt} value={rt}>
                        RT 0{rt}
                      </option>
                    ))}
                  </select>
                  <select
                    value={newPartKategori}
                    onChange={(e) => setNewPartKategori(e.target.value)}
                    className="px-3 py-1.5 bg-white border border-slate-300 rounded-lg outline-hidden"
                  >
                    <option value="Kader Inti">Kader Inti RW 22</option>
                    <option value="Kader Pokja I">Kader Pokja I</option>
                    <option value="Kader Pokja II">Kader Pokja II</option>
                    <option value="Kader Pokja III">Kader Pokja III</option>
                    <option value="Kader Pokja IV">Kader Pokja IV</option>
                    <option value="Warga">Warga Peserta</option>
                    <option value="Tamu Undangan">Tamu Undangan / Narasumber</option>
                  </select>
                </div>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={newPartKet}
                    onChange={(e) => setNewPartKet(e.target.value)}
                    placeholder="Keterangan / peran (misal: peserta senam, panitia konsumsi)..."
                    className="px-3 py-1.5 bg-white border border-slate-300 rounded-lg outline-hidden flex-1"
                  />
                  <button
                    type="submit"
                    className="px-4 py-1.5 bg-pink-600 hover:bg-pink-700 text-white font-bold rounded-lg shrink-0"
                  >
                    + Catat Kehadiran
                  </button>
                </div>
              </form>

              {/* Attendance List */}
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="font-bold text-slate-800">
                    Daftar Partisipan Warga ({selectedKegiatanForAttendance.partisipasiWarga?.length || 0}):
                  </span>
                  <span className="text-slate-500 text-[11px]">
                    Klik ceklis untuk mengubah kehadiran
                  </span>
                </div>

                <div className="border border-slate-200 rounded-xl overflow-hidden max-h-60 overflow-y-auto">
                  <table className="w-full text-left">
                    <thead className="bg-slate-100 text-slate-600 font-semibold sticky top-0">
                      <tr>
                        <th className="p-2.5">Status</th>
                        <th className="p-2.5">Nama Warga</th>
                        <th className="p-2.5">Wilayah</th>
                        <th className="p-2.5">Kategori</th>
                        <th className="p-2.5">Keterangan</th>
                        <th className="p-2.5 text-right">Aksi</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {selectedKegiatanForAttendance.partisipasiWarga &&
                      selectedKegiatanForAttendance.partisipasiWarga.length > 0 ? (
                        selectedKegiatanForAttendance.partisipasiWarga.map((part) => (
                          <tr key={part.id} className="hover:bg-slate-50">
                            <td className="p-2.5">
                              <button
                                onClick={() => handleToggleAttendancePkk(part.id)}
                                className={`w-6 h-6 rounded-md flex items-center justify-center transition ${
                                  part.statusHadir
                                    ? 'bg-pink-600 text-white'
                                    : 'border border-slate-300 text-transparent hover:border-slate-400'
                                }`}
                              >
                                <Check className="w-4 h-4" />
                              </button>
                            </td>
                            <td className="p-2.5 font-bold text-slate-900">{part.nama}</td>
                            <td className="p-2.5">
                              <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-pink-100 text-pink-800">
                                RT 0{part.rt}
                              </span>
                            </td>
                            <td className="p-2.5 text-slate-600">{part.kategori}</td>
                            <td className="p-2.5 text-slate-500">{part.keterangan || '-'}</td>
                            <td className="p-2.5 text-right">
                              <button
                                onClick={() => handleRemoveParticipantPkk(part.id)}
                                className="text-slate-400 hover:text-rose-600"
                              >
                                <X className="w-4 h-4" />
                              </button>
                            </td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan={6} className="p-6 text-center text-slate-400">
                            Belum ada presensi kehadiran warga dicatat untuk agenda ini.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Catatan Hasil Kegiatan */}
              <div className="space-y-1.5 pt-2 border-t border-slate-100">
                <label className="font-bold text-slate-800 block">
                  Uraian Hasil & Kesimpulan Kegiatan:
                </label>
                <textarea
                  rows={2}
                  defaultValue={selectedKegiatanForAttendance.catatanHasil || ''}
                  onBlur={(e) => handleSaveCatatanHasilPkk(e.target.value)}
                  placeholder="Contoh: Kegiatan dihadiri perwakilan ibu-ibu dari 9 RT, menghasilkan kesepakatan jadwal ronda kebersihan dan pengumpulan sampah plastik terpilah..."
                  className="w-full p-2.5 border border-slate-300 rounded-xl outline-hidden focus:ring-2 focus:ring-pink-500"
                />
              </div>
            </div>

            <div className="bg-slate-50 p-4 border-t border-slate-200 flex justify-end flex-shrink-0">
              <button
                onClick={() => setSelectedKegiatanForAttendance(null)}
                className="px-5 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl font-bold text-xs"
              >
                Selesai
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Tambah Kader Anggota */}
      {isAddAnggotaOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-5 shadow-2xl border border-slate-200">
            <div className="flex justify-between items-center border-b border-slate-100 pb-3 mb-4">
              <h3 className="text-base font-bold text-slate-900">Tambah Kader PKK RW 22</h3>
              <button onClick={() => setIsAddAnggotaOpen(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateAnggota} className="space-y-3 text-xs">
              <div>
                <label className="font-semibold text-slate-700 block mb-1">Nama Kader *</label>
                <input
                  type="text"
                  required
                  value={newAnggota.nama || ''}
                  onChange={(e) => setNewAnggota({ ...newAnggota, nama: e.target.value })}
                  placeholder="Nama Lengkap Kader"
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-pink-500 outline-hidden font-medium"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Asal RT *</label>
                  <select
                    value={newAnggota.rt || 1}
                    onChange={(e) => setNewAnggota({ ...newAnggota, rt: Number(e.target.value) as RTNumber })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl outline-hidden bg-white"
                  >
                    {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((rt) => (
                      <option key={rt} value={rt}>
                        RT 0{rt}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Bagian Pokja</label>
                  <select
                    value={newAnggota.pokja || 'Pokja I'}
                    onChange={(e) => setNewAnggota({ ...newAnggota, pokja: e.target.value as any })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl outline-hidden bg-white"
                  >
                    <option value="Pengurus Inti">Pengurus Inti</option>
                    <option value="Pokja I">Pokja I</option>
                    <option value="Pokja II">Pokja II</option>
                    <option value="Pokja III">Pokja III</option>
                    <option value="Pokja IV">Pokja IV</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">Jabatan / Amanah</label>
                <input
                  type="text"
                  value={newAnggota.jabatan || ''}
                  onChange={(e) => setNewAnggota({ ...newAnggota, jabatan: e.target.value })}
                  placeholder="Ketua Pokja / Anggota Kader / Bendahara"
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl outline-hidden"
                />
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">No. WhatsApp / HP</label>
                <input
                  type="text"
                  value={newAnggota.noHp || ''}
                  onChange={(e) => setNewAnggota({ ...newAnggota, noHp: e.target.value })}
                  placeholder="0812-xxxx-xxxx"
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl outline-hidden"
                />
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">Keahlian / Minat</label>
                <input
                  type="text"
                  value={newAnggota.keahlian || ''}
                  onChange={(e) => setNewAnggota({ ...newAnggota, keahlian: e.target.value })}
                  placeholder="Tata Boga, Tanaman Hias, Daur Ulang, Kesehatan"
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl outline-hidden"
                />
              </div>

              <div className="pt-3 border-t border-slate-100 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsAddAnggotaOpen(false)}
                  className="px-4 py-2 border border-slate-300 text-slate-700 rounded-xl"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-pink-600 hover:bg-pink-700 text-white font-semibold rounded-xl"
                >
                  Simpan Kader
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Tambah Agenda Kegiatan */}
      {isAddKegiatanOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-5 shadow-2xl border border-slate-200">
            <div className="flex justify-between items-center border-b border-slate-100 pb-3 mb-4">
              <h3 className="text-base font-bold text-slate-900">Catat Agenda Kegiatan PKK</h3>
              <button onClick={() => setIsAddKegiatanOpen(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateKegiatan} className="space-y-3 text-xs">
              <div>
                <label className="font-semibold text-slate-700 block mb-1">Nama Kegiatan *</label>
                <input
                  type="text"
                  required
                  value={newKegiatan.namaKegiatan || ''}
                  onChange={(e) => setNewKegiatan({ ...newKegiatan, namaKegiatan: e.target.value })}
                  placeholder="Contoh: Senam Sehat & Sosialisasi Eco-Enzyme"
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-pink-500 outline-hidden font-medium"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Tanggal</label>
                  <input
                    type="date"
                    value={newKegiatan.tanggal || ''}
                    onChange={(e) => setNewKegiatan({ ...newKegiatan, tanggal: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl outline-hidden bg-white"
                  />
                </div>
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Waktu</label>
                  <input
                    type="text"
                    value={newKegiatan.waktu || ''}
                    onChange={(e) => setNewKegiatan({ ...newKegiatan, waktu: e.target.value })}
                    placeholder="08:30 - 11:00 WIB"
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl outline-hidden"
                  />
                </div>
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">Pokja Penyelenggara</label>
                <input
                  type="text"
                  value={newKegiatan.pokja || ''}
                  onChange={(e) => setNewKegiatan({ ...newKegiatan, pokja: e.target.value })}
                  placeholder="Pokja I / Pokja IV / Pengurus Inti"
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl outline-hidden"
                />
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">Lokasi Kegiatan</label>
                <input
                  type="text"
                  value={newKegiatan.lokasi || ''}
                  onChange={(e) => setNewKegiatan({ ...newKegiatan, lokasi: e.target.value })}
                  placeholder="Balai Warga RW 22 / Lapangan Blok A"
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl outline-hidden"
                />
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">Deskripsi Kegiatan</label>
                <textarea
                  rows={3}
                  value={newKegiatan.deskripsi || ''}
                  onChange={(e) => setNewKegiatan({ ...newKegiatan, deskripsi: e.target.value })}
                  placeholder="Uraian agenda, sasaran peserta, dan hasil kegiatan..."
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl outline-hidden"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Target Peserta (Ibu)</label>
                  <input
                    type="number"
                    value={newKegiatan.jumlahPeserta || 0}
                    onChange={(e) => setNewKegiatan({ ...newKegiatan, jumlahPeserta: Number(e.target.value) })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl outline-hidden"
                  />
                </div>
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Anggaran (Rp)</label>
                  <input
                    type="number"
                    value={newKegiatan.anggaran || 0}
                    onChange={(e) => setNewKegiatan({ ...newKegiatan, anggaran: Number(e.target.value) })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl outline-hidden"
                  />
                </div>
              </div>

              <div className="pt-3 border-t border-slate-100 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsAddKegiatanOpen(false)}
                  className="px-4 py-2 border border-slate-300 text-slate-700 rounded-xl"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white font-semibold rounded-xl"
                >
                  Simpan Kegiatan
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Tambah Inventaris PKK */}
      {isAddInventarisOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-5 shadow-2xl border border-slate-200">
            <div className="flex justify-between items-center border-b border-slate-100 pb-3 mb-4">
              <h3 className="text-base font-bold text-slate-900">Tambah Inventaris & Logistik PKK</h3>
              <button onClick={() => setIsAddInventarisOpen(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateInventaris} className="space-y-3 text-xs">
              <div>
                <label className="font-semibold text-slate-700 block mb-1">Nama Barang / Fasilitas *</label>
                <input
                  type="text"
                  required
                  value={newInv.namaBarang || ''}
                  onChange={(e) => setNewInv({ ...newInv, namaBarang: e.target.value })}
                  placeholder="Contoh: Sound System Portable / Seragam Batik PKK"
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-pink-500 outline-hidden font-medium"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Kategori *</label>
                  <select
                    value={newInv.kategori || 'Peralatan Kegiatan'}
                    onChange={(e) => setNewInv({ ...newInv, kategori: e.target.value as any })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl outline-hidden bg-white"
                  >
                    <option value="Peralatan Kegiatan">Peralatan Kegiatan</option>
                    <option value="Elektronik & Sound">Elektronik & Sound</option>
                    <option value="Seragam & Atribut">Seragam & Atribut</option>
                    <option value="Fasilitas & Tenda">Fasilitas & Tenda</option>
                    <option value="Administrasi & Buku">Administrasi & Buku</option>
                  </select>
                </div>
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Kondisi Barang *</label>
                  <select
                    value={newInv.kondisi || 'Baik'}
                    onChange={(e) => setNewInv({ ...newInv, kondisi: e.target.value as any })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl outline-hidden bg-white font-semibold"
                  >
                    <option value="Baik">Baik & Berfungsi</option>
                    <option value="Perlu Kalibrasi">Perlu Perbaikan</option>
                    <option value="Rusak">Rusak</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Jumlah</label>
                  <input
                    type="number"
                    min="1"
                    required
                    value={newInv.jumlah || 1}
                    onChange={(e) => setNewInv({ ...newInv, jumlah: Number(e.target.value) })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl outline-hidden"
                  />
                </div>
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Satuan</label>
                  <input
                    type="text"
                    required
                    value={newInv.satuan || 'Unit'}
                    onChange={(e) => setNewInv({ ...newInv, satuan: e.target.value })}
                    placeholder="Unit / Stel / Pcs / Set"
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl outline-hidden"
                  />
                </div>
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">Lokasi Penyimpanan</label>
                <input
                  type="text"
                  value={newInv.lokasiPenyimpanan || ''}
                  onChange={(e) => setNewInv({ ...newInv, lokasiPenyimpanan: e.target.value })}
                  placeholder="Sekretariat PKK RW 22 / Balai Warga"
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl outline-hidden"
                />
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">Keterangan</label>
                <textarea
                  rows={2}
                  value={newInv.keterangan || ''}
                  onChange={(e) => setNewInv({ ...newInv, keterangan: e.target.value })}
                  placeholder="Keterangan pengadaan, PIC pengelola, catatan kelayakan..."
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl outline-hidden"
                />
              </div>

              <div className="pt-3 border-t border-slate-100 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsAddInventarisOpen(false)}
                  className="px-4 py-2 border border-slate-300 text-slate-700 rounded-xl"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-pink-600 hover:bg-pink-700 text-white font-semibold rounded-xl"
                >
                  Simpan Barang
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
