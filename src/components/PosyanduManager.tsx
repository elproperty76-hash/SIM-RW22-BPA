import React, { useState } from 'react';
import {
  Activity,
  Baby,
  Heart,
  Plus,
  Search,
  Calendar,
  CheckCircle2,
  AlertTriangle,
  Clock,
  MapPin,
  ChevronRight,
  X,
  FileText,
  Package,
  Boxes,
  ClipboardList,
  UserCheck,
  Download,
  Trash2,
  Edit2,
  Check,
  MessageCircle,
} from 'lucide-react';
import {
  PasienPosyandu,
  JadwalPosyandu,
  PemeriksaanPosyandu,
  ItemInventaris,
  PartisipanWarga,
  Warga,
  RTNumber,
} from '../types';
import { formatDateIndo, calculateAgeDetailed } from '../utils/formatters';

interface PosyanduManagerProps {
  posyanduList: PasienPosyandu[];
  jadwalList: JadwalPosyandu[];
  inventarisList: ItemInventaris[];
  onSavePosyandu: (list: PasienPosyandu[]) => void;
  onSaveJadwal: (list: JadwalPosyandu[]) => void;
  onSaveInventaris: (list: ItemInventaris[]) => void;
  wargaList?: Warga[];
}

export const PosyanduManager: React.FC<PosyanduManagerProps> = ({
  posyanduList,
  jadwalList,
  inventarisList,
  onSavePosyandu,
  onSaveJadwal,
  onSaveInventaris,
  wargaList = [],
}) => {
  const [activeCategory, setActiveCategory] = useState<'Balita' | 'Lansia' | 'Jadwal' | 'Inventaris'>('Balita');
  const [filterRt, setFilterRt] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState('');

  // Modals
  const [isAddPatientOpen, setIsAddPatientOpen] = useState(false);
  const [selectedPatientForExam, setSelectedPatientForExam] = useState<PasienPosyandu | null>(null);
  const [selectedPatientDetail, setSelectedPatientDetail] = useState<PasienPosyandu | null>(null);

  // Jadwal Attendance / Participation Modal
  const [selectedJadwalForAttendance, setSelectedJadwalForAttendance] = useState<JadwalPosyandu | null>(null);
  const [isAddJadwalOpen, setIsAddJadwalOpen] = useState(false);

  // WhatsApp Reminder Modal State
  const [whatsappTargetJadwal, setWhatsappTargetJadwal] = useState<JadwalPosyandu | null>(null);
  const [waMessageTemplate, setWaMessageTemplate] = useState<string>('');
  const [waFilterRt, setWaFilterRt] = useState<string>('ALL');

  // Inventaris Modal
  const [isAddInventarisOpen, setIsAddInventarisOpen] = useState(false);
  const [selectedKategoriInv, setSelectedKategoriInv] = useState<string>('ALL');
  const [newInv, setNewInv] = useState<Partial<ItemInventaris>>({
    namaBarang: '',
    kategori: 'Alat',
    jumlah: 1,
    satuan: 'Unit',
    kondisi: 'Baik',
    lokasiPenyimpanan: 'Lemari Medis Posyandu Anggrek Bulan',
    tanggalPengadaan: new Date().toISOString().slice(0, 10),
    keterangan: '',
    minimumStok: 1,
  });

  // New Jadwal form
  const [newJadwal, setNewJadwal] = useState<Partial<JadwalPosyandu>>({
    tanggal: new Date().toISOString().slice(0, 10),
    waktu: '08:30 - 11:30 WIB',
    judul: '',
    lokasi: 'Posyandu Anggrek Bulan RW 22',
    kegiatan: ['Penimbangan balita & deteksi stunting', 'Pemeriksaan tensi & gula darah lansia', 'Penyaluran PMT bergizi'],
    kaderBertugas: ['Bidan Desa Jelegong', 'Kader Posyandu RW 22'],
    statusKegiatan: 'Dijadwalkan',
    partisipasiWarga: [],
    catatanHasil: '',
  });

  // New patient form
  const [newPatient, setNewPatient] = useState<Partial<PasienPosyandu>>({
    jenis: 'Balita',
    nama: '',
    nik: '',
    rt: 1,
    tanggalLahir: '2024-01-01',
    jenisKelamin: 'L',
    namaWali: '',
    alamat: 'Bumi Pesona Asri',
    noHp: '',
  });

  // New exam form
  const [newExam, setNewExam] = useState<Partial<PemeriksaanPosyandu>>({
    tanggal: new Date().toISOString().slice(0, 10),
    beratBadan: 10.0,
    tinggiBadan: 80.0,
    lingkarKepala: 45.0,
    tensiDarah: '120/80',
    gulaDarah: 110,
    statusGizi: 'Gizi Baik',
    vitaminImunisasi: 'Vitamin A / PMT Biskuit',
    catatanKader: '',
  });

  // Participant input form for attendance
  const [newPartisipanNama, setNewPartisipanNama] = useState('');
  const [newPartisipanRt, setNewPartisipanRt] = useState<RTNumber>(1);
  const [newPartisipanKategori, setNewPartisipanKategori] = useState('Orang Tua Balita');
  const [newPartisipanKet, setNewPartisipanKet] = useState('');

  // Filtered patients
  const currentPatients = posyanduList.filter((p) => {
    if (activeCategory !== 'Jadwal' && activeCategory !== 'Inventaris' && p.jenis !== activeCategory) return false;
    if (filterRt !== 'ALL' && p.rt !== Number(filterRt)) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return (
        p.nama.toLowerCase().includes(q) ||
        p.nik.includes(q) ||
        (p.namaWali && p.namaWali.toLowerCase().includes(q))
      );
    }
    return true;
  });

  // Filtered inventaris
  const currentInventaris = inventarisList.filter((item) => {
    if (selectedKategoriInv !== 'ALL' && item.kategori !== selectedKategoriInv) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return (
        item.namaBarang.toLowerCase().includes(q) ||
        item.lokasiPenyimpanan.toLowerCase().includes(q) ||
        (item.keterangan && item.keterangan.toLowerCase().includes(q))
      );
    }
    return true;
  });

  const handleCreatePatient = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPatient.nama) return;

    const created: PasienPosyandu = {
      id: `pos-${Date.now()}`,
      jenis: newPatient.jenis || 'Balita',
      nama: newPatient.nama,
      nik: newPatient.nik || `320405${Date.now()}`,
      rt: (newPatient.rt || 1) as RTNumber,
      tanggalLahir: newPatient.tanggalLahir || '2024-01-01',
      jenisKelamin: (newPatient.jenisKelamin || 'L') as 'L' | 'P',
      namaWali: newPatient.namaWali || '',
      alamat: newPatient.alamat || '',
      noHp: newPatient.noHp || '',
      riwayatPemeriksaan: [],
    };

    onSavePosyandu([created, ...posyanduList]);
    setIsAddPatientOpen(false);
    setNewPatient({
      jenis: activeCategory === 'Lansia' ? 'Lansia' : 'Balita',
      nama: '',
      nik: '',
      rt: 1,
      tanggalLahir: activeCategory === 'Lansia' ? '1960-01-01' : '2024-01-01',
      jenisKelamin: 'L',
      namaWali: '',
      alamat: 'Bumi Pesona Asri',
      noHp: '',
    });
  };

  const handleSaveExam = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPatientForExam) return;

    const examItem: PemeriksaanPosyandu = {
      id: `exam-${Date.now()}`,
      tanggal: newExam.tanggal || new Date().toISOString().slice(0, 10),
      beratBadan: Number(newExam.beratBadan) || 0,
      tinggiBadan: Number(newExam.tinggiBadan) || 0,
      lingkarKepala: newExam.lingkarKepala ? Number(newExam.lingkarKepala) : undefined,
      tensiDarah: newExam.tensiDarah || undefined,
      gulaDarah: newExam.gulaDarah ? Number(newExam.gulaDarah) : undefined,
      statusGizi: (newExam.statusGizi || 'Gizi Baik') as any,
      vitaminImunisasi: newExam.vitaminImunisasi || '-',
      catatanKader: newExam.catatanKader || 'Pemeriksaan rutin berjalan tertib.',
    };

    const updated = posyanduList.map((p) => {
      if (p.id === selectedPatientForExam.id) {
        return {
          ...p,
          riwayatPemeriksaan: [examItem, ...p.riwayatPemeriksaan],
        };
      }
      return p;
    });

    onSavePosyandu(updated);
    setSelectedPatientForExam(null);
  };

  // Inventaris Actions
  const handleCreateInventaris = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newInv.namaBarang) return;

    const item: ItemInventaris = {
      id: `inv-pos-${Date.now()}`,
      namaBarang: newInv.namaBarang,
      kategori: newInv.kategori || 'Alat',
      jumlah: Number(newInv.jumlah) || 1,
      satuan: newInv.satuan || 'Unit',
      kondisi: (newInv.kondisi || 'Baik') as any,
      lokasiPenyimpanan: newInv.lokasiPenyimpanan || 'Lemari Posyandu Anggrek Bulan RW 22',
      tanggalPengadaan: newInv.tanggalPengadaan || new Date().toISOString().slice(0, 10),
      keterangan: newInv.keterangan || '',
      minimumStok: Number(newInv.minimumStok) || 1,
    };

    onSaveInventaris([item, ...inventarisList]);
    setIsAddInventarisOpen(false);
    setNewInv({
      namaBarang: '',
      kategori: 'Alat',
      jumlah: 1,
      satuan: 'Unit',
      kondisi: 'Baik',
      lokasiPenyimpanan: 'Lemari Medis Posyandu Anggrek Bulan',
      tanggalPengadaan: new Date().toISOString().slice(0, 10),
      keterangan: '',
      minimumStok: 1,
    });
  };

  const handleDeleteInventaris = (id: string, nama: string) => {
    if (window.confirm(`Hapus barang inventaris "${nama}" dari daftar Posyandu?`)) {
      onSaveInventaris(inventarisList.filter((i) => i.id !== id));
    }
  };

  // Jadwal and Attendance Actions
  const handleCreateJadwal = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newJadwal.judul) return;

    const item: JadwalPosyandu = {
      id: `jdw-${Date.now()}`,
      tanggal: newJadwal.tanggal || new Date().toISOString().slice(0, 10),
      waktu: newJadwal.waktu || '08:30 - 11:30 WIB',
      judul: newJadwal.judul,
      lokasi: newJadwal.lokasi || 'Posyandu Anggrek Bulan RW 22',
      kegiatan: newJadwal.kegiatan && newJadwal.kegiatan.length > 0 ? newJadwal.kegiatan : ['Pelayanan Posyandu Anggrek Bulan'],
      kaderBertugas: newJadwal.kaderBertugas && newJadwal.kaderBertugas.length > 0 ? newJadwal.kaderBertugas : ['Kader RW 22'],
      statusKegiatan: newJadwal.statusKegiatan || 'Dijadwalkan',
      partisipasiWarga: [],
      catatanHasil: '',
    };

    onSaveJadwal([item, ...jadwalList]);
    setIsAddJadwalOpen(false);
    setNewJadwal({
      tanggal: new Date().toISOString().slice(0, 10),
      waktu: '08:30 - 11:30 WIB',
      judul: '',
      lokasi: 'Posyandu Anggrek Bulan RW 22',
      kegiatan: ['Penimbangan balita & deteksi stunting', 'Pemeriksaan tensi & gula darah lansia', 'Penyaluran PMT bergizi'],
      kaderBertugas: ['Bidan Desa Jelegong', 'Kader Posyandu RW 22'],
      statusKegiatan: 'Dijadwalkan',
      partisipasiWarga: [],
      catatanHasil: '',
    });
  };

  const handleToggleJadwalStatus = (jadwalId: string, newStatus: 'Dijadwalkan' | 'Berlangsung' | 'Terlaksana') => {
    const updated = jadwalList.map((j) => (j.id === jadwalId ? { ...j, statusKegiatan: newStatus } : j));
    onSaveJadwal(updated);
    if (selectedJadwalForAttendance?.id === jadwalId) {
      setSelectedJadwalForAttendance({ ...selectedJadwalForAttendance, statusKegiatan: newStatus });
    }
  };

  const handleAddParticipantToJadwal = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedJadwalForAttendance || !newPartisipanNama.trim()) return;

    const newPart: PartisipanWarga = {
      id: `part-${Date.now()}`,
      nama: newPartisipanNama.trim(),
      rt: newPartisipanRt,
      kategori: newPartisipanKategori,
      statusHadir: true,
      keterangan: newPartisipanKet.trim() || 'Hadir di Posyandu Anggrek Bulan',
    };

    const currentParts = selectedJadwalForAttendance.partisipasiWarga || [];
    const updatedParts = [newPart, ...currentParts];

    const updatedJadwal = {
      ...selectedJadwalForAttendance,
      partisipasiWarga: updatedParts,
    };

    const updatedList = jadwalList.map((j) => (j.id === selectedJadwalForAttendance.id ? updatedJadwal : j));
    onSaveJadwal(updatedList);
    setSelectedJadwalForAttendance(updatedJadwal);
    setNewPartisipanNama('');
    setNewPartisipanKet('');
  };

  const handleToggleAttendance = (partId: string) => {
    if (!selectedJadwalForAttendance) return;
    const currentParts = selectedJadwalForAttendance.partisipasiWarga || [];
    const updatedParts = currentParts.map((p) => (p.id === partId ? { ...p, statusHadir: !p.statusHadir } : p));
    const updatedJadwal = {
      ...selectedJadwalForAttendance,
      partisipasiWarga: updatedParts,
    };
    const updatedList = jadwalList.map((j) => (j.id === selectedJadwalForAttendance.id ? updatedJadwal : j));
    onSaveJadwal(updatedList);
    setSelectedJadwalForAttendance(updatedJadwal);
  };

  const handleRemoveParticipant = (partId: string) => {
    if (!selectedJadwalForAttendance) return;
    const currentParts = selectedJadwalForAttendance.partisipasiWarga || [];
    const updatedParts = currentParts.filter((p) => p.id !== partId);
    const updatedJadwal = {
      ...selectedJadwalForAttendance,
      partisipasiWarga: updatedParts,
    };
    const updatedList = jadwalList.map((j) => (j.id === selectedJadwalForAttendance.id ? updatedJadwal : j));
    onSaveJadwal(updatedList);
    setSelectedJadwalForAttendance(updatedJadwal);
  };

  const handleSaveCatatanHasil = (catatan: string) => {
    if (!selectedJadwalForAttendance) return;
    const updatedJadwal = {
      ...selectedJadwalForAttendance,
      catatanHasil: catatan,
    };
    const updatedList = jadwalList.map((j) => (j.id === selectedJadwalForAttendance.id ? updatedJadwal : j));
    onSaveJadwal(updatedList);
    setSelectedJadwalForAttendance(updatedJadwal);
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-3">
          <div>
            <span className="text-[10px] font-bold text-cyan-700 uppercase tracking-wider bg-cyan-50 px-2.5 py-0.5 rounded">
              Layanan Kesehatan Terpadu Warga
            </span>
            <h2 className="text-lg font-bold text-slate-900 mt-1 flex items-center gap-2">
              <Activity className="w-5 h-5 text-cyan-600" />
              <span>Posyandu Anggrek Bulan RW 22 Bumi Pesona Asri</span>
            </h2>
            <p className="text-xs text-slate-500">
              Pemantauan balita (cegah stunting), lansia, jadwal & presensi warga, serta logistik inventaris alat & obat di RT 01 s/d RT 09
            </p>
          </div>

          <div className="flex items-center gap-2">
            {activeCategory === 'Inventaris' ? (
              <button
                onClick={() => setIsAddInventarisOpen(true)}
                className="px-3.5 py-2 bg-cyan-600 hover:bg-cyan-700 text-white rounded-xl text-xs font-semibold shadow-xs transition flex items-center gap-1.5"
              >
                <Plus className="w-4 h-4" />
                <span>Tambah Alat / Obat</span>
              </button>
            ) : activeCategory === 'Jadwal' ? (
              <button
                onClick={() => setIsAddJadwalOpen(true)}
                className="px-3.5 py-2 bg-cyan-600 hover:bg-cyan-700 text-white rounded-xl text-xs font-semibold shadow-xs transition flex items-center gap-1.5"
              >
                <Plus className="w-4 h-4" />
                <span>Jadwalkan Layanan</span>
              </button>
            ) : (
              <button
                onClick={() => {
                  setNewPatient((prev) => ({
                    ...prev,
                    jenis: activeCategory === 'Lansia' ? 'Lansia' : 'Balita',
                    tanggalLahir: activeCategory === 'Lansia' ? '1960-01-01' : '2024-01-01',
                  }));
                  setIsAddPatientOpen(true);
                }}
                className="px-3.5 py-2 bg-cyan-600 hover:bg-cyan-700 text-white rounded-xl text-xs font-semibold shadow-xs transition flex items-center gap-1.5"
              >
                <Plus className="w-4 h-4" />
                <span>Tambah Pasien ({activeCategory === 'Lansia' ? 'Lansia' : 'Balita'})</span>
              </button>
            )}
          </div>
        </div>

        {/* Tab Selection */}
        <div className="flex border-b border-slate-200 gap-4 overflow-x-auto">
          <button
            onClick={() => setActiveCategory('Balita')}
            className={`pb-2.5 text-xs font-bold border-b-2 transition flex items-center gap-1.5 shrink-0 ${
              activeCategory === 'Balita'
                ? 'border-cyan-600 text-cyan-700'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <Baby className="w-4 h-4" />
            <span>
              Posyandu Balita ({posyanduList.filter((p) => p.jenis === 'Balita').length})
            </span>
          </button>
          <button
            onClick={() => setActiveCategory('Lansia')}
            className={`pb-2.5 text-xs font-bold border-b-2 transition flex items-center gap-1.5 shrink-0 ${
              activeCategory === 'Lansia'
                ? 'border-cyan-600 text-cyan-700'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <Heart className="w-4 h-4" />
            <span>
              Posyandu Lansia ({posyanduList.filter((p) => p.jenis === 'Lansia').length})
            </span>
          </button>
          <button
            onClick={() => setActiveCategory('Jadwal')}
            className={`pb-2.5 text-xs font-bold border-b-2 transition flex items-center gap-1.5 shrink-0 ${
              activeCategory === 'Jadwal'
                ? 'border-cyan-600 text-cyan-700'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <Calendar className="w-4 h-4" />
            <span>Jadwal & Presensi Warga ({jadwalList.length})</span>
          </button>
          <button
            onClick={() => setActiveCategory('Inventaris')}
            className={`pb-2.5 text-xs font-bold border-b-2 transition flex items-center gap-1.5 shrink-0 ${
              activeCategory === 'Inventaris'
                ? 'border-cyan-600 text-cyan-700'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <Boxes className="w-4 h-4" />
            <span>Inventaris Alat & Obat ({inventarisList.length})</span>
          </button>
        </div>
      </div>

      {/* Patient List (Balita or Lansia) */}
      {(activeCategory === 'Balita' || activeCategory === 'Lansia') && (
        <div className="space-y-4">
          {/* Filter Bar */}
          <div className="bg-white p-4 rounded-xl border border-slate-200 flex flex-wrap gap-3 items-center justify-between">
            <div className="flex flex-wrap gap-2 items-center flex-1">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Cari nama pasien, NIK, nama wali..."
                className="px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs w-64 focus:ring-2 focus:ring-cyan-500 outline-hidden"
              />

              <select
                value={filterRt}
                onChange={(e) => setFilterRt(e.target.value)}
                className="px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs outline-hidden"
              >
                <option value="ALL">Semua RT (RT 01 s/d RT 09)</option>
                {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((rt) => (
                  <option key={rt} value={rt}>
                    RT 0{rt}
                  </option>
                ))}
              </select>
            </div>
            <span className="text-xs text-slate-500 font-medium">
              {currentPatients.length} pasien terdaftar
            </span>
          </div>

          {/* Cards of Patients */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {currentPatients.map((patient) => {
              const lastExam = patient.riwayatPemeriksaan[0];
              const isRisk =
                lastExam?.statusGizi === 'Beresiko Stunting' ||
                lastExam?.statusGizi === 'Gizi Kurang' ||
                lastExam?.statusGizi === 'Hipertensi';

              return (
                <div
                  key={patient.id}
                  className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs hover:border-cyan-300 transition flex flex-col justify-between"
                >
                  <div>
                    <div className="flex justify-between items-start mb-2">
                      <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-cyan-100 text-cyan-800">
                        RT 0{patient.rt}
                      </span>
                      <span
                        className={`px-2 py-0.5 rounded-full text-[10px] font-semibold ${
                          lastExam
                            ? isRisk
                              ? 'bg-rose-100 text-rose-800 border border-rose-200'
                              : 'bg-emerald-100 text-emerald-800'
                            : 'bg-slate-100 text-slate-600'
                        }`}
                      >
                        {lastExam ? lastExam.statusGizi : 'Belum Ditimbang'}
                      </span>
                    </div>

                    <h4 className="text-sm font-bold text-slate-900">{patient.nama}</h4>
                    <p className="text-xs text-slate-500 mt-0.5">
                      Usia:{' '}
                      <strong className="text-slate-800">
                        {calculateAgeDetailed(patient.tanggalLahir)}
                      </strong>{' '}
                      ({patient.jenisKelamin === 'L' ? 'Laki-laki' : 'Perempuan'})
                    </p>
                    {patient.namaWali && (
                      <p className="text-xs text-slate-600 mt-1">
                        Wali / Kontak: <span className="font-medium">{patient.namaWali}</span>
                      </p>
                    )}
                    <p className="text-[11px] text-slate-500 mt-0.5 truncate">{patient.alamat}</p>

                    {/* Latest check metrics */}
                    {lastExam && (
                      <div className="mt-3 p-2.5 bg-slate-50 rounded-xl border border-slate-100 text-xs grid grid-cols-2 gap-2">
                        <div>
                          <span className="text-[10px] text-slate-400 block uppercase">Berat Badan</span>
                          <strong className="text-slate-900">{lastExam.beratBadan} kg</strong>
                        </div>
                        <div>
                          <span className="text-[10px] text-slate-400 block uppercase">Tinggi Badan</span>
                          <strong className="text-slate-900">{lastExam.tinggiBadan} cm</strong>
                        </div>
                        {lastExam.lingkarKepala && (
                          <div>
                            <span className="text-[10px] text-slate-400 block uppercase">
                              Lingkar Kepala
                            </span>
                            <strong className="text-slate-900">{lastExam.lingkarKepala} cm</strong>
                          </div>
                        )}
                        {lastExam.tensiDarah && (
                          <div>
                            <span className="text-[10px] text-slate-400 block uppercase">
                              Tensi Darah
                            </span>
                            <strong className="text-slate-900">{lastExam.tensiDarah}</strong>
                          </div>
                        )}
                        <div className="col-span-2 pt-1 border-t border-slate-200/60 text-[11px] text-slate-600">
                          <span className="text-slate-400">Pemeriksaan:</span>{' '}
                          {formatDateIndo(lastExam.tanggal)}
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
                    <button
                      onClick={() => setSelectedPatientDetail(patient)}
                      className="text-xs text-slate-600 hover:text-cyan-700 font-semibold"
                    >
                      Riwayat ({patient.riwayatPemeriksaan.length})
                    </button>
                    <button
                      onClick={() => {
                        setSelectedPatientForExam(patient);
                        setNewExam({
                          tanggal: new Date().toISOString().slice(0, 10),
                          beratBadan: lastExam ? lastExam.beratBadan : 10,
                          tinggiBadan: lastExam ? lastExam.tinggiBadan : 80,
                          lingkarKepala: lastExam?.lingkarKepala || 45,
                          tensiDarah: lastExam?.tensiDarah || '120/80',
                          gulaDarah: lastExam?.gulaDarah || 110,
                          statusGizi: 'Gizi Baik',
                          vitaminImunisasi: 'Vitamin A / PMT',
                          catatanKader: '',
                        });
                      }}
                      className="text-xs text-cyan-700 hover:text-cyan-800 font-bold bg-cyan-50 px-2.5 py-1 rounded-lg"
                    >
                      + Catat Timbangan
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Tab 3: Jadwal & Presensi Partisipasi Warga */}
      {activeCategory === 'Jadwal' && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {jadwalList.map((jdw) => {
              const participants = jdw.partisipasiWarga || [];
              const hadirCount = participants.filter((p) => p.statusHadir).length;
              const statusBadge =
                jdw.statusKegiatan === 'Terlaksana'
                  ? 'bg-emerald-100 text-emerald-800 border-emerald-200'
                  : jdw.statusKegiatan === 'Berlangsung'
                  ? 'bg-amber-100 text-amber-800 border-amber-200'
                  : 'bg-cyan-50 text-cyan-700 border-cyan-200';

              return (
                <div
                  key={jdw.id}
                  className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-3.5 hover:border-cyan-300 transition flex flex-col justify-between"
                >
                  <div className="space-y-2.5">
                    <div className="flex justify-between items-start gap-2">
                      <div className="flex items-center gap-2">
                        <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-slate-100 text-slate-700">
                          {formatDateIndo(jdw.tanggal)}
                        </span>
                        <span className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold border ${statusBadge}`}>
                          {jdw.statusKegiatan || 'Dijadwalkan'}
                        </span>
                      </div>
                      <span className="text-xs text-slate-500 font-medium">{jdw.waktu}</span>
                    </div>

                    <h3 className="text-base font-bold text-slate-900">{jdw.judul}</h3>
                    <p className="text-xs text-slate-600 flex items-center gap-1.5">
                      <MapPin className="w-4 h-4 text-cyan-600 shrink-0" />
                      <span>{jdw.lokasi}</span>
                    </p>

                    <div>
                      <span className="text-xs font-bold text-slate-700 block mb-1">
                        Rangkaian Layanan:
                      </span>
                      <ul className="list-disc pl-4 text-xs text-slate-600 space-y-0.5">
                        {jdw.kegiatan.map((k, i) => (
                          <li key={i}>{k}</li>
                        ))}
                      </ul>
                    </div>

                    <div className="pt-2 border-t border-slate-100">
                      <span className="text-xs font-bold text-slate-700 block mb-1">
                        Kader & Petugas Bertugas:
                      </span>
                      <div className="flex flex-wrap gap-1.5">
                        {jdw.kaderBertugas.map((kader, i) => (
                          <span
                            key={i}
                            className="px-2 py-0.5 bg-slate-100 text-slate-700 rounded text-[11px] font-medium"
                          >
                            {kader}
                          </span>
                        ))}
                      </div>
                    </div>

                    {/* Participation summary */}
                    <div className="p-3 bg-cyan-50/50 rounded-xl border border-cyan-100 flex items-center justify-between text-xs">
                      <div>
                        <span className="font-bold text-cyan-900 block">
                          Partisipasi Warga: {hadirCount} Hadir ({participants.length} Terdata)
                        </span>
                        <span className="text-[11px] text-slate-500">
                          Mencakup warga balita & lansia perwakilan RT 01 s/d RT 09
                        </span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <button
                          onClick={() => {
                            setWhatsappTargetJadwal(jdw);
                            setWaMessageTemplate(
                              `Yth. Bpk/Ibu Warga RW 22,\n\nPengingat Giat Posyandu Anggrek Bulan:\n📅 *${jdw.judul}*\n🗓️ Tanggal: ${formatDateIndo(jdw.tanggal)} (${jdw.waktu})\n📍 Lokasi: ${jdw.lokasi}\n\nMohon kehadiran Bpk/Ibu sekalian. Terima kasih.\n- Pengurus RW 22 Bumi Pesona Asri`
                            );
                          }}
                          className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold rounded-lg shadow-2xs text-xs flex items-center gap-1.5 transition"
                          title="Kirim pesan WhatsApp pengingat ke warga"
                        >
                          <MessageCircle className="w-3.5 h-3.5" />
                          <span>Kirim WA</span>
                        </button>
                        <button
                          onClick={() => setSelectedJadwalForAttendance(jdw)}
                          className="px-3 py-1.5 bg-cyan-600 hover:bg-cyan-700 text-white font-semibold rounded-lg shadow-2xs text-xs flex items-center gap-1.5"
                        >
                          <ClipboardList className="w-3.5 h-3.5" />
                          <span>Presensi</span>
                        </button>
                      </div>
                    </div>

                    {jdw.catatanHasil && (
                      <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-200 text-xs text-slate-700">
                        <span className="font-bold text-slate-900 block mb-0.5">Hasil Pelayanan:</span>
                        <p className="italic text-slate-600">"{jdw.catatanHasil}"</p>
                      </div>
                    )}
                  </div>

                  <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs">
                    <span className="text-slate-500">Ubah Status:</span>
                    <div className="flex items-center gap-1">
                      {(['Dijadwalkan', 'Berlangsung', 'Terlaksana'] as const).map((st) => (
                        <button
                          key={st}
                          onClick={() => handleToggleJadwalStatus(jdw.id, st)}
                          className={`px-2 py-1 rounded text-[11px] font-semibold transition ${
                            jdw.statusKegiatan === st
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

      {/* Tab 4: Inventaris Alat & Obat Posyandu */}
      {activeCategory === 'Inventaris' && (
        <div className="space-y-4">
          {/* Filter Bar */}
          <div className="bg-white p-4 rounded-xl border border-slate-200 flex flex-wrap gap-3 items-center justify-between">
            <div className="flex flex-wrap gap-2 items-center flex-1">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Cari nama alat kesehatan, obat, vitamin..."
                className="px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs w-64 focus:ring-2 focus:ring-cyan-500 outline-hidden"
              />

              <select
                value={selectedKategoriInv}
                onChange={(e) => setSelectedKategoriInv(e.target.value)}
                className="px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs outline-hidden"
              >
                <option value="ALL">Semua Kategori</option>
                <option value="Alat">Alat Medis / Timbangan</option>
                <option value="Obat">Obat-obatan</option>
                <option value="Vaksin & Vitamin">Vaksin & Vitamin</option>
                <option value="Habis Pakai">Bahan Habis Pakai</option>
                <option value="Administrasi">Buku & Administrasi</option>
              </select>
            </div>
            <span className="text-xs text-slate-500 font-medium">
              {currentInventaris.length} item inventaris tercatat
            </span>
          </div>

          {/* Cards Table */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 text-slate-700 font-bold border-b border-slate-200">
                  <tr>
                    <th className="p-3">Nama Barang</th>
                    <th className="p-3">Kategori</th>
                    <th className="p-3">Jumlah Stok</th>
                    <th className="p-3">Kondisi</th>
                    <th className="p-3">Lokasi Simpan</th>
                    <th className="p-3">Tgl Masuk</th>
                    <th className="p-3">Keterangan</th>
                    <th className="p-3 text-right">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {currentInventaris.length > 0 ? (
                    currentInventaris.map((item) => {
                      const isLowStock = item.minimumStok && item.jumlah <= item.minimumStok;
                      return (
                        <tr key={item.id} className="hover:bg-slate-50/80 transition">
                          <td className="p-3 font-bold text-slate-900">
                            <div className="flex items-center gap-2">
                              <Package className="w-4 h-4 text-cyan-600 shrink-0" />
                              <span>{item.namaBarang}</span>
                            </div>
                          </td>
                          <td className="p-3">
                            <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-cyan-50 text-cyan-800 border border-cyan-200">
                              {item.kategori}
                            </span>
                          </td>
                          <td className="p-3">
                            <span
                              className={`px-2 py-0.5 rounded-full font-bold text-xs ${
                                isLowStock
                                  ? 'bg-rose-100 text-rose-800 border border-rose-200'
                                  : 'bg-slate-100 text-slate-800'
                              }`}
                            >
                              {item.jumlah} {item.satuan}
                            </span>
                            {isLowStock && (
                              <span className="block text-[10px] text-rose-600 font-semibold mt-0.5">
                                Stok Menipis
                              </span>
                            )}
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
                              title="Hapus barang"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </td>
                        </tr>
                      );
                    })
                  ) : (
                    <tr>
                      <td colSpan={8} className="p-8 text-center text-slate-400">
                        Tidak ada barang inventaris yang sesuai pencarian.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Modal Presensi & Partisipasi Warga pada Jadwal */}
      {selectedJadwalForAttendance && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-3 sm:p-5 overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-2xl w-full shadow-2xl border border-slate-200 overflow-hidden my-auto max-h-[90vh] flex flex-col">
            <div className="bg-slate-900 text-white p-4 sm:p-5 flex justify-between items-start flex-shrink-0">
              <div>
                <span className="text-[10px] font-bold text-cyan-400 uppercase tracking-wider bg-cyan-950 px-2 py-0.5 rounded border border-cyan-800">
                  Presensi & Partisipasi Warga
                </span>
                <h3 className="text-base font-bold text-white mt-1">
                  {selectedJadwalForAttendance.judul}
                </h3>
                <p className="text-xs text-slate-300">
                  {formatDateIndo(selectedJadwalForAttendance.tanggal)} • {selectedJadwalForAttendance.lokasi}
                </p>
              </div>
              <button
                onClick={() => setSelectedJadwalForAttendance(null)}
                className="text-slate-400 hover:text-white p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-4 sm:p-6 overflow-y-auto space-y-4 flex-1 text-xs">
              {/* Add Participant Input */}
              <form
                onSubmit={handleAddParticipantToJadwal}
                className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 space-y-3"
              >
                <span className="font-bold text-slate-800 block">
                  Tambah Partisipan / Warga Hadir:
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                  <input
                    type="text"
                    required
                    value={newPartisipanNama}
                    onChange={(e) => setNewPartisipanNama(e.target.value)}
                    placeholder="Nama Warga / Orang Tua / Lansia"
                    className="px-3 py-1.5 bg-white border border-slate-300 rounded-lg outline-hidden font-medium"
                  />
                  <select
                    value={newPartisipanRt}
                    onChange={(e) => setNewPartisipanRt(Number(e.target.value) as RTNumber)}
                    className="px-3 py-1.5 bg-white border border-slate-300 rounded-lg outline-hidden"
                  >
                    {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((rt) => (
                      <option key={rt} value={rt}>
                        RT 0{rt}
                      </option>
                    ))}
                  </select>
                  <select
                    value={newPartisipanKategori}
                    onChange={(e) => setNewPartisipanKategori(e.target.value)}
                    className="px-3 py-1.5 bg-white border border-slate-300 rounded-lg outline-hidden"
                  >
                    <option value="Orang Tua Balita">Orang Tua Balita</option>
                    <option value="Lansia">Warga Lansia</option>
                    <option value="Ibu Hamil">Ibu Hamil</option>
                    <option value="Kader Posyandu">Kader Posyandu</option>
                    <option value="Petugas Nakes">Petugas Nakes</option>
                  </select>
                </div>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={newPartisipanKet}
                    onChange={(e) => setNewPartisipanKet(e.target.value)}
                    placeholder="Keterangan / Balita yang ditimbang..."
                    className="px-3 py-1.5 bg-white border border-slate-300 rounded-lg outline-hidden flex-1"
                  />
                  <button
                    type="submit"
                    className="px-4 py-1.5 bg-cyan-600 hover:bg-cyan-700 text-white font-bold rounded-lg shrink-0"
                  >
                    + Catat Kehadiran
                  </button>
                </div>
              </form>

              {/* Attendance List */}
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="font-bold text-slate-800">
                    Daftar Partisipan Warga ({selectedJadwalForAttendance.partisipasiWarga?.length || 0}):
                  </span>
                  <span className="text-slate-500 text-[11px]">
                    Klik ceklis untuk mengubah status hadir
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
                        <th className="p-2.5">Catatan</th>
                        <th className="p-2.5 text-right">Aksi</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {selectedJadwalForAttendance.partisipasiWarga &&
                      selectedJadwalForAttendance.partisipasiWarga.length > 0 ? (
                        selectedJadwalForAttendance.partisipasiWarga.map((part) => (
                          <tr key={part.id} className="hover:bg-slate-50">
                            <td className="p-2.5">
                              <button
                                onClick={() => handleToggleAttendance(part.id)}
                                className={`w-6 h-6 rounded-md flex items-center justify-center transition ${
                                  part.statusHadir
                                    ? 'bg-emerald-600 text-white'
                                    : 'border border-slate-300 text-transparent hover:border-slate-400'
                                }`}
                              >
                                <Check className="w-4 h-4" />
                              </button>
                            </td>
                            <td className="p-2.5 font-bold text-slate-900">{part.nama}</td>
                            <td className="p-2.5">
                              <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-cyan-100 text-cyan-800">
                                RT 0{part.rt}
                              </span>
                            </td>
                            <td className="p-2.5 text-slate-600">{part.kategori}</td>
                            <td className="p-2.5 text-slate-500">{part.keterangan || '-'}</td>
                            <td className="p-2.5 text-right">
                              <button
                                onClick={() => handleRemoveParticipant(part.id)}
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
                            Belum ada data kehadiran warga dicatat untuk kegiatan ini.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Catatan Hasil Pelayanan */}
              <div className="space-y-1.5 pt-2 border-t border-slate-100">
                <label className="font-bold text-slate-800 block">
                  Ringkasan & Catatan Hasil Pelayanan Kegiatan:
                </label>
                <textarea
                  rows={2}
                  defaultValue={selectedJadwalForAttendance.catatanHasil || ''}
                  onBlur={(e) => handleSaveCatatanHasil(e.target.value)}
                  placeholder="Contoh: Seluruh balita target sasaran telah ditimbang lengkap dengan pemberian vitamin A dan bubur kacang hijau organik..."
                  className="w-full p-2.5 border border-slate-300 rounded-xl outline-hidden focus:ring-2 focus:ring-cyan-500"
                />
              </div>
            </div>

            <div className="bg-slate-50 p-4 border-t border-slate-200 flex justify-end flex-shrink-0">
              <button
                onClick={() => setSelectedJadwalForAttendance(null)}
                className="px-5 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl font-bold text-xs"
              >
                Selesai
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Tambah Alat / Obat Inventaris */}
      {isAddInventarisOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-5 shadow-2xl border border-slate-200">
            <div className="flex justify-between items-center border-b border-slate-100 pb-3 mb-4">
              <h3 className="text-base font-bold text-slate-900">
                Tambah Inventaris Posyandu Anggrek Bulan
              </h3>
              <button
                onClick={() => setIsAddInventarisOpen(false)}
                className="text-slate-400 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateInventaris} className="space-y-3 text-xs">
              <div>
                <label className="font-semibold text-slate-700 block mb-1">Nama Barang / Obat *</label>
                <input
                  type="text"
                  required
                  value={newInv.namaBarang || ''}
                  onChange={(e) => setNewInv({ ...newInv, namaBarang: e.target.value })}
                  placeholder="Contoh: Timbangan Dacin Digital / Vitamin A Kapsul Biru"
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-cyan-500 outline-hidden font-medium"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Kategori *</label>
                  <select
                    value={newInv.kategori || 'Alat'}
                    onChange={(e) => setNewInv({ ...newInv, kategori: e.target.value as any })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl outline-hidden bg-white"
                  >
                    <option value="Alat">Alat Medis / Timbangan</option>
                    <option value="Obat">Obat-obatan</option>
                    <option value="Vaksin & Vitamin">Vaksin & Vitamin</option>
                    <option value="Habis Pakai">Bahan Habis Pakai</option>
                    <option value="Administrasi">Buku & Administrasi</option>
                  </select>
                </div>
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Kondisi Barang *</label>
                  <select
                    value={newInv.kondisi || 'Baik'}
                    onChange={(e) => setNewInv({ ...newInv, kondisi: e.target.value as any })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl outline-hidden bg-white font-semibold"
                  >
                    <option value="Baik">Baik & Siap Pakai</option>
                    <option value="Perlu Kalibrasi">Perlu Kalibrasi</option>
                    <option value="Rusak">Rusak / Tidak Layak</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-2">
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
                    placeholder="Unit / Botol / Strip"
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl outline-hidden"
                  />
                </div>
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Min. Stok</label>
                  <input
                    type="number"
                    value={newInv.minimumStok || 1}
                    onChange={(e) => setNewInv({ ...newInv, minimumStok: Number(e.target.value) })}
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
                  placeholder="Lemari Medis Posyandu Anggrek Bulan"
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl outline-hidden"
                />
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">Keterangan Tambahan</label>
                <textarea
                  rows={2}
                  value={newInv.keterangan || ''}
                  onChange={(e) => setNewInv({ ...newInv, keterangan: e.target.value })}
                  placeholder="Bantuan Dinkes / Masa kedaluwarsa / No seri..."
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
                  className="px-4 py-2 bg-cyan-600 hover:bg-cyan-700 text-white font-semibold rounded-xl"
                >
                  Simpan Item Inventaris
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Tambah Jadwal Baru */}
      {isAddJadwalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-5 shadow-2xl border border-slate-200">
            <div className="flex justify-between items-center border-b border-slate-100 pb-3 mb-4">
              <h3 className="text-base font-bold text-slate-900">Jadwalkan Layanan Posyandu</h3>
              <button onClick={() => setIsAddJadwalOpen(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateJadwal} className="space-y-3 text-xs">
              <div>
                <label className="font-semibold text-slate-700 block mb-1">Judul Layanan / Kegiatan *</label>
                <input
                  type="text"
                  required
                  value={newJadwal.judul || ''}
                  onChange={(e) => setNewJadwal({ ...newJadwal, judul: e.target.value })}
                  placeholder="Contoh: Posyandu Anggrek Bulan Rutin & Imunisasi Balita"
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl outline-hidden font-medium"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Tanggal</label>
                  <input
                    type="date"
                    required
                    value={newJadwal.tanggal || ''}
                    onChange={(e) => setNewJadwal({ ...newJadwal, tanggal: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl outline-hidden bg-white"
                  />
                </div>
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Waktu</label>
                  <input
                    type="text"
                    value={newJadwal.waktu || ''}
                    onChange={(e) => setNewJadwal({ ...newJadwal, waktu: e.target.value })}
                    placeholder="08:30 - 11:30 WIB"
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl outline-hidden"
                  />
                </div>
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">Lokasi</label>
                <input
                  type="text"
                  value={newJadwal.lokasi || ''}
                  onChange={(e) => setNewJadwal({ ...newJadwal, lokasi: e.target.value })}
                  placeholder="Posyandu Anggrek Bulan RW 22 (Blok C1)"
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl outline-hidden"
                />
              </div>

              <div className="pt-3 border-t border-slate-100 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsAddJadwalOpen(false)}
                  className="px-4 py-2 border border-slate-300 text-slate-700 rounded-xl"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-cyan-600 hover:bg-cyan-700 text-white font-semibold rounded-xl"
                >
                  Simpan Jadwal
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Tambah Pasien */}
      {isAddPatientOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-5 shadow-2xl border border-slate-200">
            <div className="flex justify-between items-center border-b border-slate-100 pb-3 mb-4">
              <h3 className="text-base font-bold text-slate-900">
                Pendaftaran Pasien Posyandu RW 22
              </h3>
              <button onClick={() => setIsAddPatientOpen(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreatePatient} className="space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Kategori Sasaran *</label>
                  <select
                    value={newPatient.jenis || 'Balita'}
                    onChange={(e) => setNewPatient({ ...newPatient, jenis: e.target.value as any })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl outline-hidden bg-white font-semibold text-cyan-800"
                  >
                    <option value="Balita">Balita (0 - 5 Tahun)</option>
                    <option value="Lansia">Lansia (Lanjut Usia)</option>
                  </select>
                </div>
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Wilayah RT *</label>
                  <select
                    value={newPatient.rt || 1}
                    onChange={(e) => setNewPatient({ ...newPatient, rt: Number(e.target.value) as RTNumber })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl outline-hidden bg-white"
                  >
                    {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((rt) => (
                      <option key={rt} value={rt}>
                        RT 0{rt}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">Nama Pasien *</label>
                <input
                  type="text"
                  required
                  value={newPatient.nama || ''}
                  onChange={(e) => setNewPatient({ ...newPatient, nama: e.target.value })}
                  placeholder="Nama Lengkap Balita / Lansia"
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-cyan-500 outline-hidden font-medium"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Tanggal Lahir *</label>
                  <input
                    type="date"
                    required
                    value={newPatient.tanggalLahir || ''}
                    onChange={(e) => setNewPatient({ ...newPatient, tanggalLahir: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl outline-hidden bg-white"
                  />
                </div>
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Jenis Kelamin</label>
                  <select
                    value={newPatient.jenisKelamin || 'L'}
                    onChange={(e) => setNewPatient({ ...newPatient, jenisKelamin: e.target.value as any })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl outline-hidden bg-white"
                  >
                    <option value="L">Laki-laki (L)</option>
                    <option value="P">Perempuan (P)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">
                  Nama Orang Tua / Wali / Kontak Keluarga
                </label>
                <input
                  type="text"
                  value={newPatient.namaWali || ''}
                  onChange={(e) => setNewPatient({ ...newPatient, namaWali: e.target.value })}
                  placeholder="Ibu/Ayah untuk balita, atau anak untuk lansia"
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-cyan-500 outline-hidden"
                />
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">Alamat Rumah / Blok</label>
                <input
                  type="text"
                  value={newPatient.alamat || ''}
                  onChange={(e) => setNewPatient({ ...newPatient, alamat: e.target.value })}
                  placeholder="Contoh: Blok B1 No. 05"
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-cyan-500 outline-hidden"
                />
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">No. WhatsApp / HP</label>
                <input
                  type="text"
                  value={newPatient.noHp || ''}
                  onChange={(e) => setNewPatient({ ...newPatient, noHp: e.target.value })}
                  placeholder="0812-xxxx-xxxx"
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-cyan-500 outline-hidden"
                />
              </div>

              <div className="pt-3 border-t border-slate-100 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsAddPatientOpen(false)}
                  className="px-4 py-2 border border-slate-300 text-slate-700 rounded-xl"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-cyan-600 hover:bg-cyan-700 text-white font-semibold rounded-xl"
                >
                  Daftarkan Pasien
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Input Pemeriksaan / Penimbangan Baru */}
      {selectedPatientForExam && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-5 shadow-2xl border border-slate-200">
            <div className="flex justify-between items-start border-b border-slate-100 pb-3 mb-4">
              <div>
                <span className="text-[10px] font-bold text-cyan-700 uppercase tracking-wider bg-cyan-50 px-2 py-0.5 rounded">
                  Pencatatan Pemeriksaan
                </span>
                <h3 className="text-base font-bold text-slate-900 mt-1">
                  {selectedPatientForExam.nama} ({selectedPatientForExam.jenis})
                </h3>
                <p className="text-xs text-slate-500">RT 0{selectedPatientForExam.rt} Bumi Pesona Asri</p>
              </div>
              <button onClick={() => setSelectedPatientForExam(null)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveExam} className="space-y-3 text-xs">
              <div>
                <label className="font-semibold text-slate-700 block mb-1">Tanggal Pemeriksaan *</label>
                <input
                  type="date"
                  required
                  value={newExam.tanggal || ''}
                  onChange={(e) => setNewExam({ ...newExam, tanggal: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl outline-hidden bg-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Berat Badan (kg) *</label>
                  <input
                    type="number"
                    step="0.1"
                    required
                    value={newExam.beratBadan || ''}
                    onChange={(e) => setNewExam({ ...newExam, beratBadan: Number(e.target.value) })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl outline-hidden"
                  />
                </div>
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Tinggi / Panjang (cm) *</label>
                  <input
                    type="number"
                    step="0.5"
                    required
                    value={newExam.tinggiBadan || ''}
                    onChange={(e) => setNewExam({ ...newExam, tinggiBadan: Number(e.target.value) })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl outline-hidden"
                  />
                </div>
              </div>

              {selectedPatientForExam.jenis === 'Balita' ? (
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Lingkar Kepala (cm)</label>
                  <input
                    type="number"
                    step="0.5"
                    value={newExam.lingkarKepala || ''}
                    onChange={(e) => setNewExam({ ...newExam, lingkarKepala: Number(e.target.value) })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl outline-hidden"
                  />
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="font-semibold text-slate-700 block mb-1">Tekanan Darah (Tensi)</label>
                    <input
                      type="text"
                      placeholder="120/80"
                      value={newExam.tensiDarah || ''}
                      onChange={(e) => setNewExam({ ...newExam, tensiDarah: e.target.value })}
                      className="w-full px-3 py-2 border border-slate-300 rounded-xl outline-hidden font-mono"
                    />
                  </div>
                  <div>
                    <label className="font-semibold text-slate-700 block mb-1">Gula Darah (mg/dL)</label>
                    <input
                      type="number"
                      placeholder="110"
                      value={newExam.gulaDarah || ''}
                      onChange={(e) => setNewExam({ ...newExam, gulaDarah: Number(e.target.value) })}
                      className="w-full px-3 py-2 border border-slate-300 rounded-xl outline-hidden"
                    />
                  </div>
                </div>
              )}

              <div>
                <label className="font-semibold text-slate-700 block mb-1">Status Gizi / Evaluasi *</label>
                <select
                  value={newExam.statusGizi || 'Gizi Baik'}
                  onChange={(e) => setNewExam({ ...newExam, statusGizi: e.target.value as any })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl outline-hidden bg-white"
                >
                  <option value="Gizi Baik">Gizi Baik</option>
                  <option value="Normal">Normal</option>
                  <option value="Beresiko Stunting">Beresiko Stunting (Balita)</option>
                  <option value="Gizi Kurang">Gizi Kurang</option>
                  <option value="Gizi Lebih">Gizi Lebih</option>
                  <option value="Pra-Hipertensi">Pra-Hipertensi (Lansia)</option>
                  <option value="Hipertensi">Hipertensi (Lansia)</option>
                </select>
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">Imunisasi / Vitamin / PMT Diberikan</label>
                <input
                  type="text"
                  value={newExam.vitaminImunisasi || ''}
                  onChange={(e) => setNewExam({ ...newExam, vitaminImunisasi: e.target.value })}
                  placeholder="Vitamin A, Polio, PMT Bubur Kacang Hijau"
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl outline-hidden"
                />
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">Catatan & Saran Kader / Bidan</label>
                <textarea
                  rows={2}
                  value={newExam.catatanKader || ''}
                  onChange={(e) => setNewExam({ ...newExam, catatanKader: e.target.value })}
                  placeholder="Kondisi aktif, konsumsi gizi seimbang, rujukan puskesmas..."
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl outline-hidden"
                />
              </div>

              <div className="pt-3 border-t border-slate-100 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setSelectedPatientForExam(null)}
                  className="px-4 py-2 border border-slate-300 text-slate-700 rounded-xl"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-cyan-600 hover:bg-cyan-700 text-white font-semibold rounded-xl"
                >
                  Simpan Hasil Pemeriksaan
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Riwayat Pasien */}
      {selectedPatientDetail && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-5 shadow-2xl border border-slate-200 max-h-[85vh] flex flex-col">
            <div className="flex justify-between items-start border-b border-slate-100 pb-3 mb-3 flex-shrink-0">
              <div>
                <span className="text-[10px] font-bold text-cyan-700 uppercase tracking-wider bg-cyan-50 px-2 py-0.5 rounded">
                  Buku Kesehatan Posyandu Anggrek Bulan
                </span>
                <h3 className="text-base font-bold text-slate-900 mt-1">
                  {selectedPatientDetail.nama}
                </h3>
                <p className="text-xs text-slate-500">
                  {selectedPatientDetail.jenis} • RT 0{selectedPatientDetail.rt} Bumi Pesona Asri
                </p>
              </div>
              <button onClick={() => setSelectedPatientDetail(null)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="overflow-y-auto space-y-3 flex-1 pr-1 text-xs">
              {selectedPatientDetail.riwayatPemeriksaan.length > 0 ? (
                selectedPatientDetail.riwayatPemeriksaan.map((item, idx) => (
                  <div key={item.id || idx} className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="font-bold text-slate-900">{formatDateIndo(item.tanggal)}</span>
                      <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-cyan-100 text-cyan-800">
                        {item.statusGizi}
                      </span>
                    </div>

                    <div className="grid grid-cols-2 gap-2 text-slate-700">
                      <div>
                        <span className="text-[10px] text-slate-400 block">Berat Badan:</span>
                        <strong>{item.beratBadan} kg</strong>
                      </div>
                      <div>
                        <span className="text-[10px] text-slate-400 block">Tinggi Badan:</span>
                        <strong>{item.tinggiBadan} cm</strong>
                      </div>
                      {item.lingkarKepala && (
                        <div>
                          <span className="text-[10px] text-slate-400 block">Lingkar Kepala:</span>
                          <strong>{item.lingkarKepala} cm</strong>
                        </div>
                      )}
                      {item.tensiDarah && (
                        <div>
                          <span className="text-[10px] text-slate-400 block">Tensi Darah:</span>
                          <strong>{item.tensiDarah}</strong>
                        </div>
                      )}
                    </div>

                    {item.vitaminImunisasi && (
                      <p className="text-slate-600 pt-1 border-t border-slate-200">
                        <span className="text-slate-400">Pemberian:</span> {item.vitaminImunisasi}
                      </p>
                    )}

                    {item.catatanKader && (
                      <p className="text-slate-600 italic">
                        "{item.catatanKader}"
                      </p>
                    )}
                  </div>
                ))
              ) : (
                <p className="text-center text-slate-400 py-6">Belum ada riwayat penimbangan tercatat.</p>
              )}
            </div>

            <div className="pt-3 border-t border-slate-100 flex justify-end flex-shrink-0">
              <button
                onClick={() => setSelectedPatientDetail(null)}
                className="px-4 py-1.5 bg-slate-900 text-white rounded-xl text-xs font-semibold"
              >
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}
      {/* WHATSAPP REMINDER BROADCAST MODAL */}
      {whatsappTargetJadwal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-fade-in overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-2xl w-full p-6 sm:p-7 shadow-2xl space-y-5 my-8">
            <div className="flex justify-between items-center pb-4 border-b border-slate-100">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold">
                  <MessageCircle className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-slate-900">Kirim Pengingat WhatsApp Warga</h3>
                  <p className="text-xs text-slate-500">Jadwal: {whatsappTargetJadwal.judul}</p>
                </div>
              </div>
              <button
                onClick={() => setWhatsappTargetJadwal(null)}
                className="p-2 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100 transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Template Pesan WhatsApp</label>
                <textarea
                  rows={5}
                  value={waMessageTemplate}
                  onChange={(e) => setWaMessageTemplate(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs focus:outline-emerald-600 font-sans"
                  placeholder="Tulis pesan pengingat..."
                />
                <p className="text-[11px] text-slate-500 mt-1">
                  Pesan di atas akan dikirimkan dengan menggabungkan data nomor telepon warga dari modul data warga RW 22.
                </p>
              </div>

              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 pt-2">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-semibold text-slate-700">Filter Wilayah RT:</span>
                  <select
                    value={waFilterRt}
                    onChange={(e) => setWaFilterRt(e.target.value)}
                    className="px-3 py-1.5 rounded-lg border border-slate-300 text-xs font-medium focus:outline-emerald-600"
                  >
                    <option value="ALL">Semua RT (01 - 09)</option>
                    {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((rt) => (
                      <option key={rt} value={rt}>RT 0{rt}</option>
                    ))}
                  </select>
                </div>

                <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-lg">
                  {wargaList.filter((w) => w.noHp && w.noHp.trim() !== '' && (waFilterRt === 'ALL' || w.rt.toString() === waFilterRt)).length} Warga memiliki No. HP
                </span>
              </div>

              <div className="max-h-60 overflow-y-auto border border-slate-200 rounded-xl divide-y divide-slate-100">
                {wargaList.filter((w) => w.noHp && w.noHp.trim() !== '' && (waFilterRt === 'ALL' || w.rt.toString() === waFilterRt)).length > 0 ? (
                  wargaList
                    .filter((w) => w.noHp && w.noHp.trim() !== '' && (waFilterRt === 'ALL' || w.rt.toString() === waFilterRt))
                    .map((warga) => {
                      let cleanPhone = warga.noHp.replace(/\D/g, '');
                      if (cleanPhone.startsWith('0')) {
                        cleanPhone = '62' + cleanPhone.slice(1);
                      }
                      const waUrl = `https://wa.me/${cleanPhone}?text=` + encodeURIComponent(waMessageTemplate);

                      return (
                        <div key={warga.id} className="p-3 flex items-center justify-between hover:bg-slate-50 transition text-xs">
                          <div>
                            <span className="font-bold text-slate-900 block">{warga.nama}</span>
                            <span className="text-[11px] text-slate-500">RT 0{warga.rt} • HP: {warga.noHp}</span>
                          </div>
                          <a
                            href={waUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-semibold flex items-center gap-1.5 shadow-2xs transition"
                          >
                            <MessageCircle className="w-3.5 h-3.5" />
                            <span>Kirim WA</span>
                          </a>
                        </div>
                      );
                    })
                ) : (
                  <div className="p-6 text-center text-slate-400 text-xs">
                    Tidak ada warga dengan nomor HP valid pada filter yang dipilih.
                  </div>
                )}
              </div>
            </div>

            <div className="flex justify-between items-center pt-3 border-t border-slate-100">
              <button
                type="button"
                onClick={() => {
                  navigator.clipboard.writeText(waMessageTemplate);
                  alert('Template pesan berhasil disalin ke clipboard!');
                }}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-medium text-xs transition"
              >
                Salin Template Pesan
              </button>
              <button
                type="button"
                onClick={() => setWhatsappTargetJadwal(null)}
                className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl font-semibold text-xs transition"
              >
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
