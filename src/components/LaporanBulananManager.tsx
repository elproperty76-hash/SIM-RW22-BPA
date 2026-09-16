import React, { useState, useMemo, useEffect } from 'react';
import {
  FileText,
  Printer,
  Plus,
  Calendar,
  CheckCircle2,
  Share2,
  Building,
  Eye,
  X,
  Send,
  Search,
  CalendarRange,
  RotateCcw,
  SlidersHorizontal,
  ArrowUpDown,
  Filter,
  FileQuestion,
  Tag,
  Clock,
  Sparkles,
  ChevronRight,
  Download,
  FileDown,
  Loader2,
} from 'lucide-react';
import {
  LaporanBulanan,
  PoinKegiatanLaporan,
  PengurusRWInfo,
  RTNumber,
  TransaksiKas,
  KegiatanPKK,
  JadwalPosyandu,
  FotoDokumentasi,
} from '../types';
import { formatRupiah, formatDateIndo } from '../utils/formatters';
import { GaleriDokumentasi } from './GaleriDokumentasi';
import { SAMPLE_ACTIVITY_PHOTOS } from '../utils/imageCompressor';
import { exportReportToPdf, openPrintableReportWindow } from '../utils/pdfExporter';

const MONTH_NAMES = [
  'Januari',
  'Februari',
  'Maret',
  'April',
  'Mei',
  'Juni',
  'Juli',
  'Agustus',
  'September',
  'Oktober',
  'November',
  'Desember',
];

interface LaporanBulananManagerProps {
  laporanList: LaporanBulanan[];
  onSaveLaporan: (list: LaporanBulanan[]) => void;
  infoRW: PengurusRWInfo;
  kasList: TransaksiKas[];
  kegiatanPKK?: KegiatanPKK[];
  jadwalPosyandu?: JadwalPosyandu[];
  onOpenPortalView: () => void;
}

export const LaporanBulananManager: React.FC<LaporanBulananManagerProps> = ({
  laporanList,
  onSaveLaporan,
  infoRW,
  kasList,
  kegiatanPKK = [],
  jadwalPosyandu = [],
  onOpenPortalView,
}) => {
  const [selectedLaporan, setSelectedLaporan] = useState<LaporanBulanan | null>(
    laporanList[0] || null
  );
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isPreviewPrintMode, setIsPreviewPrintMode] = useState(false);

  // Search and Date-Range Filter state
  const [searchQuery, setSearchQuery] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [filterKategori, setFilterKategori] = useState('Semua');
  const [sortOrder, setSortOrder] = useState<'desc' | 'asc'>('desc');
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);

  // PDF Export state
  const [isExportingPdf, setIsExportingPdf] = useState(false);
  const [exportStatusMessage, setExportStatusMessage] = useState<string | null>(null);

  // New report draft state
  const [newBulan, setNewBulan] = useState('Maret');
  const [newTahun, setNewTahun] = useState(2026);
  const [newRingkasan, setNewRingkasan] = useState(
    'Alhamdulillah seluruh rangkaian program kerja RW 22 Bumi Pesona Asri selama bulan berjalan telah terlaksana dengan lancar, meliputi pelayanan Posyandu Melati, kegiatan senam dan kebersihan lingkungan antar RT, serta kestabilan pemeliharaan lampu jalan penerangan umum.'
  );

  // Initial activities for builder
  const [kegiatanDraft, setKegiatanDraft] = useState<PoinKegiatanLaporan[]>([
    {
      id: 'k-1',
      judul: 'Pelayanan Posyandu Melati Balita & Lansia Rutin',
      tanggal: '2026-03-12',
      kategori: 'Posyandu',
      lokasi: 'Balai RW 22 Blok C',
      deskripsi: 'Penimbangan balita, pemantauan status gizi stunting, dan pemeriksaan tensi darah puluhan lansia di wilayah RT 01 s/d RT 09.',
      anggaranDigunakan: 450000,
    },
    {
      id: 'k-2',
      judul: 'Peremajaan Lampu Penerangan Jalan Umum (PJU)',
      tanggal: '2026-03-07',
      kategori: 'Pembangunan/Fasum',
      lokasi: 'Jalan Lingkungan Blok D & G',
      deskripsi: 'Penggantian 12 titik lampu LED hemat energi yang mati agar jalanan komplek terang dan aman di malam hari.',
      anggaranDigunakan: 780000,
    },
  ]);

  const [newKegJudul, setNewKegJudul] = useState('');
  const [newKegKategori, setNewKegKategori] = useState<any>('Kerja Bakti');
  const [newKegDeskripsi, setNewKegDeskripsi] = useState('');
  const [newKegAnggaran, setNewKegAnggaran] = useState(300000);

  const [pengumumanDraft, setPengumumanDraft] = useState<string[]>([
    'Warga diharapkan tetap menjaga ketertiban pembuangan sampah rumah tangga pada tempat sampah depan rumah masing-masing.',
    'Iuran kas warga bulanan dikoordinasikan melalui Ketua RT masing-masing paling lambat tanggal 10 setiap bulannya.',
  ]);
  const [newPengumumanText, setNewPengumumanText] = useState('');

  // Draft photos attached to newly created report
  const [galeriDraft, setGaleriDraft] = useState<FotoDokumentasi[]>(
    SAMPLE_ACTIVITY_PHOTOS.slice(0, 3)
  );

  const handleUpdateSelectedReportGaleri = (newGaleri: FotoDokumentasi[]) => {
    if (!selectedLaporan) return;
    const updatedReport: LaporanBulanan = {
      ...selectedLaporan,
      galeriFoto: newGaleri,
    };
    const updatedList = laporanList.map((lap) =>
      lap.id === selectedLaporan.id ? updatedReport : lap
    );
    setSelectedLaporan(updatedReport);
    onSaveLaporan(updatedList);
  };

  const handleImportFromPkkAndPosyandu = () => {
    const fromPkk: PoinKegiatanLaporan[] = kegiatanPKK
      .filter((k) => k.statusKegiatan === 'Terlaksana')
      .map((k) => ({
        id: `k-pkk-${k.id}`,
        judul: `[PKK] ${k.namaKegiatan}`,
        tanggal: k.tanggal,
        kategori: 'PKK',
        lokasi: k.lokasi,
        deskripsi: k.catatanHasil || k.deskripsi || 'Kegiatan PKK RW 22 berjalan tertib.',
        anggaranDigunakan: k.anggaran || 0,
      }));

    const fromPosyandu: PoinKegiatanLaporan[] = jadwalPosyandu
      .filter((j) => j.statusKegiatan === 'Terlaksana')
      .map((j) => ({
        id: `k-pos-${j.id}`,
        judul: `[Posyandu] ${j.judul}`,
        tanggal: j.tanggal,
        kategori: 'Posyandu',
        lokasi: j.lokasi,
        deskripsi: j.catatanHasil || j.kegiatan.join(', '),
        anggaranDigunakan: 450000,
      }));

    const combined = [...kegiatanDraft, ...fromPkk, ...fromPosyandu];
    const unique = combined.filter((v, i, a) => a.findIndex((t) => t.judul === v.judul) === i);
    setKegiatanDraft(unique);
  };

  const handleAddKegiatanToDraft = () => {
    if (!newKegJudul) return;
    const item: PoinKegiatanLaporan = {
      id: `k-${Date.now()}`,
      judul: newKegJudul,
      tanggal: new Date().toISOString().slice(0, 10),
      kategori: newKegKategori,
      lokasi: 'Lingkungan RW 22 Bumi Pesona Asri',
      deskripsi: newKegDeskripsi || 'Kegiatan kebersamaan warga berjalan lancar dan tertib.',
      anggaranDigunakan: Number(newKegAnggaran) || 0,
    };
    setKegiatanDraft([...kegiatanDraft, item]);
    setNewKegJudul('');
    setNewKegDeskripsi('');
  };

  const handleAddPengumuman = () => {
    if (!newPengumumanText.trim()) return;
    setPengumumanDraft([...pengumumanDraft, newPengumumanText.trim()]);
    setNewPengumumanText('');
  };

  const handlePublishNewReport = () => {
    // calculate cash summary from real kas
    const totalMasuk = kasList
      .filter((k) => k.jenis === 'Masuk')
      .reduce((s, i) => s + i.nominal, 0);
    const totalKeluar = kasList
      .filter((k) => k.jenis === 'Keluar')
      .reduce((s, i) => s + i.nominal, 0);

    const newReport: LaporanBulanan = {
      id: `lap-${newTahun}-${newBulan.toLowerCase()}`,
      judul: `Laporan Pertanggungjawaban Kegiatan & Keuangan RW 22 - ${newBulan} ${newTahun}`,
      periodeBulan: newBulan,
      tahun: newTahun,
      tanggalPublikasi: new Date().toISOString().slice(0, 10),
      status: 'Diterbitkan',
      ringkasanEksekutif: newRingkasan,
      daftarKegiatan: kegiatanDraft,
      galeriFoto: galeriDraft,
      ringkasanKas: {
        saldoAwal: 12000000,
        totalPemasukan: totalMasuk,
        totalPengeluaran: totalKeluar,
        saldoAkhir: 12000000 + totalMasuk - totalKeluar,
        catatanBendahara: `Seluruh pembukuan kas telah diperiksa lengkap dan ditandatangani oleh Bendahara ${infoRW.bendahara}.`,
      },
      rekapIuranRt: [1, 2, 3, 4, 5, 6, 7, 8, 9].map((rt) => ({
        rt: rt as RTNumber,
        persentaseLunas: 95,
        nominalTerkumpul: 1100000,
      })),
      pengumumanWarga: pengumumanDraft,
      ketuaRw: infoRW.ketuaRw,
      sekretaris: infoRW.sekretaris,
      bendahara: infoRW.bendahara,
    };

    const updated = [newReport, ...laporanList];
    onSaveLaporan(updated);
    setSelectedLaporan(newReport);
    setIsCreateModalOpen(false);
    alert('Laporan Bulanan berhasil dibuat dan diterbitkan untuk warga RW 22!');
  };

  const getReportSortTime = (lap: LaporanBulanan): number => {
    if (lap.tanggalPublikasi && /^\d{4}-\d{2}-\d{2}$/.test(lap.tanggalPublikasi)) {
      return new Date(lap.tanggalPublikasi).getTime();
    }
    const mIdx = MONTH_NAMES.indexOf(lap.periodeBulan);
    return new Date(lap.tahun, mIdx >= 0 ? mIdx : 0, 1).getTime();
  };

  const isFilterActive = Boolean(
    searchQuery.trim() || startDate || endDate || filterKategori !== 'Semua'
  );

  const handleResetFilters = () => {
    setSearchQuery('');
    setStartDate('');
    setEndDate('');
    setFilterKategori('Semua');
    setSortOrder('desc');
  };

  const handleQuickPreset = (preset: 'all' | '2026' | '2025' | 'last3m' | 'last6m') => {
    if (preset === 'all') {
      setStartDate('');
      setEndDate('');
    } else if (preset === '2026') {
      setStartDate('2026-01-01');
      setEndDate('2026-12-31');
    } else if (preset === '2025') {
      setStartDate('2025-01-01');
      setEndDate('2025-12-31');
    } else if (preset === 'last3m') {
      setStartDate('2025-12-01');
      setEndDate('2026-03-31');
    } else if (preset === 'last6m') {
      setStartDate('2025-09-01');
      setEndDate('2026-03-31');
    }
  };

  const handleExportPdf = async () => {
    if (!selectedLaporan) return;
    setIsExportingPdf(true);
    setExportStatusMessage(null);
    const filename = `Laporan-Bulanan-RW22-${selectedLaporan.periodeBulan}-${selectedLaporan.tahun}.pdf`;

    try {
      const result = await exportReportToPdf('printable-report', filename);
      setIsExportingPdf(false);

      if (result.success) {
        setExportStatusMessage(`Dokumen PDF "${filename}" berhasil diekspor dan diunduh ke perangkat Anda.`);
        setTimeout(() => setExportStatusMessage(null), 6000);
      } else {
        setExportStatusMessage(result.error || 'Gagal mengekspor PDF.');
        setTimeout(() => setExportStatusMessage(null), 6000);
      }
    } catch (err: any) {
      setIsExportingPdf(false);
      setExportStatusMessage('Terjadi kesalahan saat memproses ekspor PDF.');
      setTimeout(() => setExportStatusMessage(null), 6000);
    }
  };

  const handleOpenPrintWindow = () => {
    if (!selectedLaporan) return;
    openPrintableReportWindow(selectedLaporan, infoRW);
  };

  const filteredLaporan = useMemo(() => {
    return laporanList
      .filter((lap) => {
        const mIdx = MONTH_NAMES.indexOf(lap.periodeBulan);
        const mStr = mIdx >= 0 ? String(mIdx + 1).padStart(2, '0') : '01';
        const periodStart = `${lap.tahun}-${mStr}-01`;
        const pubDate = lap.tanggalPublikasi || periodStart;

        // Date range start
        if (startDate) {
          const inRange =
            (pubDate && pubDate >= startDate) ||
            periodStart >= startDate ||
            periodStart >= startDate.slice(0, 7) + '-01';
          if (!inRange) return false;
        }

        // Date range end
        if (endDate) {
          const inRange =
            (pubDate && pubDate <= endDate) ||
            periodStart <= endDate;
          if (!inRange) return false;
        }

        // Category filter
        if (filterKategori !== 'Semua') {
          const inKegiatan = lap.daftarKegiatan.some((k) => k.kategori === filterKategori);
          const inGaleri = lap.galeriFoto?.some((g) => g.kategori === filterKategori);
          if (!inKegiatan && !inGaleri) return false;
        }

        // Search query
        if (searchQuery.trim()) {
          const q = searchQuery.toLowerCase().trim();
          const matchJudul = lap.judul.toLowerCase().includes(q);
          const matchBulan = lap.periodeBulan.toLowerCase().includes(q);
          const matchTahun = String(lap.tahun).includes(q);
          const matchRingkasan = lap.ringkasanEksekutif.toLowerCase().includes(q);
          const matchKegiatan = lap.daftarKegiatan.some(
            (k) =>
              k.judul.toLowerCase().includes(q) ||
              k.deskripsi.toLowerCase().includes(q) ||
              k.lokasi.toLowerCase().includes(q) ||
              k.kategori.toLowerCase().includes(q)
          );
          const matchGaleri = lap.galeriFoto?.some(
            (g) =>
              g.judul.toLowerCase().includes(q) ||
              g.keterangan.toLowerCase().includes(q) ||
              (g.lokasi?.toLowerCase().includes(q) || false)
          );
          const matchPengumuman = lap.pengumumanWarga.some((p) => p.toLowerCase().includes(q));
          const matchPengurus =
            (lap.ketuaRw?.toLowerCase().includes(q) || false) ||
            (lap.sekretaris?.toLowerCase().includes(q) || false) ||
            (lap.bendahara?.toLowerCase().includes(q) || false);

          if (
            !matchJudul &&
            !matchBulan &&
            !matchTahun &&
            !matchRingkasan &&
            !matchKegiatan &&
            !matchGaleri &&
            !matchPengumuman &&
            !matchPengurus
          ) {
            return false;
          }
        }

        return true;
      })
      .sort((a, b) => {
        const timeA = getReportSortTime(a);
        const timeB = getReportSortTime(b);
        return sortOrder === 'desc' ? timeB - timeA : timeA - timeB;
      });
  }, [laporanList, searchQuery, startDate, endDate, filterKategori, sortOrder]);

  // Sync selected report when filtered reports change
  useEffect(() => {
    if (filteredLaporan.length > 0) {
      const stillInFiltered = filteredLaporan.some((l) => l.id === selectedLaporan?.id);
      if (!stillInFiltered) {
        setSelectedLaporan(filteredLaporan[0]);
      }
    } else {
      setSelectedLaporan(null);
    }
  }, [filteredLaporan]);

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-3">
          <div>
            <span className="text-[10px] font-bold text-emerald-700 uppercase tracking-wider bg-emerald-50 px-2.5 py-0.5 rounded">
              Transparansi & Akuntabilitas Publik
            </span>
            <h2 className="text-lg font-bold text-slate-900 mt-1 flex items-center gap-2">
              <FileText className="w-5 h-5 text-emerald-600" />
              <span>Modul Laporan Bulanan Kegiatan RW 22 untuk Warga</span>
            </h2>
            <p className="text-xs text-slate-500">
              Dokumentasi resmi kegiatan, realisasi anggaran kas, dan arsip transparansi yang dapat diakses seluruh warga RT 01 - 09
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsCreateModalOpen(true)}
              className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-semibold shadow-xs transition flex items-center gap-1.5"
            >
              <Plus className="w-4 h-4" />
              <span>Buat Laporan Bulanan Baru</span>
            </button>
            <button
              onClick={onOpenPortalView}
              className="px-3.5 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 rounded-xl text-xs font-bold shadow-xs transition flex items-center gap-1.5"
            >
              <Share2 className="w-4 h-4" />
              <span>Buka Tampilan Warga</span>
            </button>
          </div>
        </div>

        {/* Search Bar and Date Filter Control Bar */}
        <div className="pt-1 space-y-3">
          {/* Main Search Row */}
          <div className="flex flex-col md:flex-row gap-2.5 items-stretch md:items-center">
            {/* Search Input */}
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Cari arsip laporan (kata kunci kegiatan, pengaspalan, posyandu, drainase, CCTV, pengurus)..."
                className="w-full pl-9 pr-9 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-800 placeholder-slate-400 focus:outline-hidden focus:ring-2 focus:ring-emerald-500 focus:bg-white transition"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery('')}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 p-1 text-slate-400 hover:text-slate-600 rounded-md hover:bg-slate-200/60 transition"
                  title="Hapus pencarian"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            {/* Actions: Filter Toggle, Sort, Reset */}
            <div className="flex items-center gap-2 flex-wrap">
              <button
                type="button"
                onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
                className={`px-3 py-2 rounded-xl text-xs font-semibold border transition flex items-center gap-1.5 ${
                  showAdvancedFilters || startDate || endDate || filterKategori !== 'Semua'
                    ? 'bg-emerald-50 border-emerald-300 text-emerald-800'
                    : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
                }`}
              >
                <CalendarRange className="w-3.5 h-3.5 text-emerald-600" />
                <span>Filter Tanggal & Kategori</span>
                {(startDate || endDate || filterKategori !== 'Semua') && (
                  <span className="w-2 h-2 rounded-full bg-emerald-600"></span>
                )}
              </button>

              <button
                type="button"
                onClick={() => setSortOrder(sortOrder === 'desc' ? 'asc' : 'desc')}
                className="px-3 py-2 bg-slate-50 border border-slate-200 hover:bg-slate-100 text-slate-700 rounded-xl text-xs font-semibold transition flex items-center gap-1.5"
                title="Ubah urutan tanggal laporan"
              >
                <ArrowUpDown className="w-3.5 h-3.5 text-slate-500" />
                <span>{sortOrder === 'desc' ? 'Terbaru' : 'Terlama'}</span>
              </button>

              {isFilterActive && (
                <button
                  type="button"
                  onClick={handleResetFilters}
                  className="px-3 py-2 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 rounded-xl text-xs font-semibold transition flex items-center gap-1.5"
                  title="Reset semua filter pencarian"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Reset</span>
                </button>
              )}
            </div>
          </div>

          {/* Quick Date Presets */}
          <div className="flex items-center gap-1.5 flex-wrap text-xs">
            <span className="text-[11px] font-semibold text-slate-600 mr-1 flex items-center gap-1">
              <Clock className="w-3 h-3 text-slate-500" />
              Periode Cepat:
            </span>
            {[
              { label: 'Semua Periode', key: 'all' },
              { label: 'Tahun 2026', key: '2026' },
              { label: 'Tahun 2025', key: '2025' },
              { label: '3 Bulan Terakhir', key: 'last3m' },
              { label: '6 Bulan Terakhir', key: 'last6m' },
            ].map((p) => {
              const isSelected =
                (p.key === 'all' && !startDate && !endDate) ||
                (p.key === '2026' && startDate === '2026-01-01' && endDate === '2026-12-31') ||
                (p.key === '2025' && startDate === '2025-01-01' && endDate === '2025-12-31') ||
                (p.key === 'last3m' && startDate === '2025-12-01' && endDate === '2026-03-31') ||
                (p.key === 'last6m' && startDate === '2025-09-01' && endDate === '2026-03-31');

              return (
                <button
                  key={p.key}
                  type="button"
                  onClick={() => handleQuickPreset(p.key as any)}
                  className={`px-2.5 py-1 rounded-lg text-xs font-medium transition ${
                    isSelected
                      ? 'bg-emerald-600 text-white shadow-2xs font-semibold'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  {p.label}
                </button>
              );
            })}
          </div>

          {/* Expandable Advanced Date Range & Filter Panel */}
          {showAdvancedFilters && (
            <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl space-y-3 transition">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                  <SlidersHorizontal className="w-3.5 h-3.5 text-emerald-600" />
                  Filter Rentang Tanggal & Kategori Kegiatan
                </span>
                <button
                  type="button"
                  onClick={() => setShowAdvancedFilters(false)}
                  className="text-slate-600 hover:text-slate-800 text-[11px] font-medium"
                >
                  Tutup Panel
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="text-[11px] font-semibold text-slate-600 block mb-1">
                    Dari Tanggal:
                  </label>
                  <input
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    className="w-full px-3 py-1.5 bg-white border border-slate-300 rounded-lg text-xs font-medium text-slate-800 focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
                  />
                </div>
                <div>
                  <label className="text-[11px] font-semibold text-slate-600 block mb-1">
                    Sampai Tanggal:
                  </label>
                  <input
                    type="date"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    className="w-full px-3 py-1.5 bg-white border border-slate-300 rounded-lg text-xs font-medium text-slate-800 focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
                  />
                </div>
                <div>
                  <label className="text-[11px] font-semibold text-slate-600 block mb-1">
                    Kategori Agenda:
                  </label>
                  <select
                    value={filterKategori}
                    onChange={(e) => setFilterKategori(e.target.value)}
                    className="w-full px-3 py-1.5 bg-white border border-slate-300 rounded-lg text-xs font-medium text-slate-800 focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
                  >
                    <option value="Semua">Semua Kategori</option>
                    <option value="Kerja Bakti">Kerja Bakti</option>
                    <option value="Posyandu">Posyandu</option>
                    <option value="PKK">PKK</option>
                    <option value="Pembangunan/Fasum">Pembangunan/Fasum</option>
                    <option value="Keamanan">Keamanan</option>
                    <option value="Rapat Pengurus">Rapat Pengurus</option>
                    <option value="Sosial & Keagamaan">Sosial & Keagamaan</option>
                  </select>
                </div>
              </div>
            </div>
          )}

          {/* Active Filter Chips */}
          {isFilterActive && (
            <div className="flex items-center gap-1.5 flex-wrap pt-1 text-xs">
              <span className="text-[11px] text-slate-600 font-medium">Filter Aktif:</span>
              {searchQuery.trim() && (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-emerald-50 border border-emerald-200 text-emerald-800 text-[11px] font-medium">
                  <span>Kata kunci: "{searchQuery}"</span>
                  <button type="button" onClick={() => setSearchQuery('')} className="hover:text-emerald-950">
                    <X className="w-3 h-3" />
                  </button>
                </span>
              )}
              {(startDate || endDate) && (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-blue-50 border border-blue-200 text-blue-800 text-[11px] font-medium">
                  <Calendar className="w-3 h-3 text-blue-600" />
                  <span>
                    Rentang: {startDate ? formatDateIndo(startDate) : 'Awal'} s/d {endDate ? formatDateIndo(endDate) : 'Sekarang'}
                  </span>
                  <button
                    type="button"
                    onClick={() => {
                      setStartDate('');
                      setEndDate('');
                    }}
                    className="hover:text-blue-950"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </span>
              )}
              {filterKategori !== 'Semua' && (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-amber-50 border border-amber-200 text-amber-800 text-[11px] font-medium">
                  <Tag className="w-3 h-3 text-amber-600" />
                  <span>Kategori: {filterKategori}</span>
                  <button type="button" onClick={() => setFilterKategori('Semua')} className="hover:text-amber-950">
                    <X className="w-3 h-3" />
                  </button>
                </span>
              )}
              <button
                type="button"
                onClick={handleResetFilters}
                className="text-[11px] text-rose-600 hover:text-rose-700 font-semibold underline ml-1"
              >
                Hapus Semua
              </button>
            </div>
          )}
        </div>

        {/* Laporan List Selector Bar & Counter */}
        <div className="space-y-2 pt-2 border-t border-slate-100">
          <div className="flex items-center justify-between text-xs text-slate-500">
            <span className="font-semibold text-slate-700">
              Daftar Arsip Laporan Bulanan ({filteredLaporan.length} ditemukan):
            </span>
            {filteredLaporan.length !== laporanList.length && (
              <span className="text-[11px] text-slate-600">
                (Difilter dari total {laporanList.length} laporan)
              </span>
            )}
          </div>

          {filteredLaporan.length > 0 ? (
            <div className="flex gap-2 overflow-x-auto pb-1 no-scrollbar">
              {filteredLaporan.map((lap) => {
                const isSelected = selectedLaporan?.id === lap.id;
                return (
                  <button
                    key={lap.id}
                    onClick={() => setSelectedLaporan(lap)}
                    className={`px-3.5 py-2.5 rounded-xl text-xs font-semibold whitespace-nowrap transition flex items-center gap-2 border text-left ${
                      isSelected
                        ? 'bg-slate-900 text-white border-slate-900 shadow-xs'
                        : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                    }`}
                  >
                    <Calendar
                      className={`w-3.5 h-3.5 ${
                        isSelected ? 'text-emerald-400' : 'text-slate-400'
                      }`}
                    />
                    <div>
                      <div className="font-bold flex items-center gap-1.5">
                        <span>
                          {lap.periodeBulan} {lap.tahun}
                        </span>
                        <span
                          className={`text-[9px] px-1.5 py-0.2 rounded font-semibold ${
                            isSelected
                              ? 'bg-emerald-500/20 text-emerald-300'
                              : 'bg-emerald-100 text-emerald-800'
                          }`}
                        >
                          {lap.status}
                        </span>
                      </div>
                      <div
                        className={`text-[10px] ${
                          isSelected ? 'text-slate-300' : 'text-slate-600'
                        }`}
                      >
                        {lap.daftarKegiatan.length} Agenda • {lap.galeriFoto?.length || 0} Foto
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          ) : (
            <div className="p-4 bg-amber-50/70 border border-amber-200 rounded-xl text-xs text-amber-800 flex items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <FileQuestion className="w-4 h-4 text-amber-600 shrink-0" />
                <span>
                  Tidak ada laporan bulanan yang cocok dengan kriteria pencarian dan rentang tanggal yang dipilih.
                </span>
              </div>
              <button
                type="button"
                onClick={handleResetFilters}
                className="px-2.5 py-1 bg-amber-200 hover:bg-amber-300 text-amber-900 rounded-lg font-bold shrink-0 transition"
              >
                Reset Filter
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Main Report Viewer (Official Print-Ready Layout) */}
      {selectedLaporan ? (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-md overflow-hidden">
          {/* Action Bar for the report */}
          <div className="p-4 bg-slate-50 border-b border-slate-200 flex flex-col sm:flex-row justify-between sm:items-center gap-3 text-xs">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="font-bold text-slate-700">Status Dokumen:</span>
              <span className="px-2 py-0.5 rounded-md bg-emerald-100 text-emerald-800 font-bold">
                {selectedLaporan.status}
              </span>
              <span className="text-slate-400">• Diterbitkan: {formatDateIndo(selectedLaporan.tanggalPublikasi)}</span>
              <span className="text-slate-400 hidden md:inline">• Format Standar: A4 Resmi</span>
            </div>
            <div className="flex items-center gap-2 flex-wrap">
              <button
                type="button"
                onClick={handleExportPdf}
                disabled={isExportingPdf}
                className="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 disabled:bg-emerald-400 text-white rounded-lg font-semibold flex items-center gap-1.5 shadow-xs transition"
                title="Unduh langsung file PDF dokumen resmi ini ke perangkat Anda"
              >
                {isExportingPdf ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Mengekspor PDF...</span>
                  </>
                ) : (
                  <>
                    <FileDown className="w-4 h-4" />
                    <span>Ekspor ke PDF</span>
                  </>
                )}
              </button>

              <button
                type="button"
                onClick={handleOpenPrintWindow}
                className="px-3.5 py-1.5 bg-white border border-slate-300 hover:bg-slate-100 text-slate-700 rounded-lg font-semibold flex items-center gap-1.5 transition"
                title="Buka pratinjau cetak siap cetak fisik printer A4"
              >
                <Printer className="w-4 h-4 text-slate-600" />
                <span>Cetak Lembar Fisik</span>
              </button>
            </div>
          </div>

          {/* Export Success Notification Banner */}
          {exportStatusMessage && (
            <div className="mx-4 mt-3 p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs rounded-xl flex items-center justify-between gap-2 transition animate-fade-in">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span className="font-medium">{exportStatusMessage}</span>
              </div>
              <button
                type="button"
                onClick={() => setExportStatusMessage(null)}
                className="text-emerald-700 hover:text-emerald-950 p-1"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          )}

          {/* Document Content - Styled as Formal Indonesian RW Report */}
          <div className="p-6 sm:p-10 space-y-8 max-w-4xl mx-auto font-sans" id="printable-report">
            {/* Kop Surat Resmi */}
            <div className="text-center border-b-2 border-slate-900 pb-4 space-y-1">
              <h3 className="text-lg sm:text-xl font-black uppercase tracking-wider text-slate-900">
                PENGURUS RUKUN WARGA 22 BUMI PESONA ASRI
              </h3>
              <h4 className="text-sm sm:text-base font-bold uppercase text-slate-800">
                DESA JELEGONG, KECAMATAN RANCAEKEK, KABUPATEN BANDUNG
              </h4>
              <p className="text-xs text-slate-600">
                Alamat Sekretariat: {infoRW.alamatSekretariat} • Kode Pos: {infoRW.kodePos} • Telp/WA: {infoRW.kontakSekretariat}
              </p>
              <div className="h-0.5 bg-slate-900 w-full mt-2" />
            </div>

            {/* Document Title */}
            <div className="text-center space-y-1">
              <h2 className="text-base sm:text-lg font-black uppercase text-slate-900 underline underline-offset-4">
                LAPORAN PERTANGGUNGJAWABAN KEGIATAN & KEUANGAN BULANAN
              </h2>
              <p className="text-xs sm:text-sm font-semibold text-slate-600">
                Periode: {selectedLaporan.periodeBulan} {selectedLaporan.tahun}
              </p>
            </div>

            {/* I. Ringkasan Eksekutif */}
            <div className="space-y-2 text-xs sm:text-sm leading-relaxed text-slate-700">
              <h4 className="font-bold text-slate-900 uppercase border-b border-slate-200 pb-1">
                I. Pengantar & Ringkasan Eksekutif
              </h4>
              <p className="text-justify indent-6">
                {selectedLaporan.ringkasanEksekutif}
              </p>
            </div>

            {/* II. Rekap Kegiatan yang Terlaksana */}
            <div className="space-y-3 text-xs sm:text-sm">
              <h4 className="font-bold text-slate-900 uppercase border-b border-slate-200 pb-1">
                II. Realisasi Kegiatan Warga RW 22
              </h4>
              <div className="overflow-x-auto border border-slate-200 rounded-xl">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-100 text-slate-700 font-bold border-b border-slate-200">
                    <tr>
                      <th className="p-2.5">No</th>
                      <th className="p-2.5">Nama Kegiatan</th>
                      <th className="p-2.5">Tanggal & Lokasi</th>
                      <th className="p-2.5">Kategori</th>
                      <th className="p-2.5">Uraian / Hasil</th>
                      <th className="p-2.5 text-right">Biaya (Rp)</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {selectedLaporan.daftarKegiatan.map((keg, idx) => (
                      <tr key={keg.id || idx}>
                        <td className="p-2.5 text-slate-400">{idx + 1}</td>
                        <td className="p-2.5 font-bold text-slate-900">{keg.judul}</td>
                        <td className="p-2.5 text-slate-600">
                          {formatDateIndo(keg.tanggal)} <br />
                          <span className="text-[11px] text-slate-400">{keg.lokasi}</span>
                        </td>
                        <td className="p-2.5">
                          <span className="px-2 py-0.5 rounded bg-slate-100 text-slate-700 font-semibold text-[10px]">
                            {keg.kategori}
                          </span>
                        </td>
                        <td className="p-2.5 text-slate-600">{keg.deskripsi}</td>
                        <td className="p-2.5 text-right font-mono font-semibold text-slate-900">
                          {keg.anggaranDigunakan ? formatRupiah(keg.anggaranDigunakan) : '-'}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* III. Transparansi Kas Keuangan */}
            <div className="space-y-3 text-xs sm:text-sm">
              <h4 className="font-bold text-slate-900 uppercase border-b border-slate-200 pb-1">
                III. Laporan Pertanggungjawaban Kas RW 22
              </h4>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center">
                <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl">
                  <span className="text-[10px] text-slate-400 block uppercase">Saldo Awal</span>
                  <strong className="text-slate-900 text-sm">{formatRupiah(selectedLaporan.ringkasanKas.saldoAwal)}</strong>
                </div>
                <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl">
                  <span className="text-[10px] text-emerald-700 block uppercase">Total Pemasukan</span>
                  <strong className="text-emerald-900 text-sm">{formatRupiah(selectedLaporan.ringkasanKas.totalPemasukan)}</strong>
                </div>
                <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl">
                  <span className="text-[10px] text-rose-700 block uppercase">Total Pengeluaran</span>
                  <strong className="text-rose-900 text-sm">{formatRupiah(selectedLaporan.ringkasanKas.totalPengeluaran)}</strong>
                </div>
                <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl">
                  <span className="text-[10px] text-amber-700 block uppercase">Saldo Akhir</span>
                  <strong className="text-amber-900 text-sm">{formatRupiah(selectedLaporan.ringkasanKas.saldoAkhir)}</strong>
                </div>
              </div>
              <p className="text-xs text-slate-500 italic bg-slate-50 p-2.5 rounded-lg border border-slate-200">
                Catatan Bendahara: {selectedLaporan.ringkasanKas.catatanBendahara}
              </p>
            </div>

            {/* IV. Pengumuman & Agenda Warga */}
            <div className="space-y-2 text-xs sm:text-sm">
              <h4 className="font-bold text-slate-900 uppercase border-b border-slate-200 pb-1">
                IV. Pengumuman Penting untuk Warga (RT 01 s/d RT 09)
              </h4>
              <ul className="list-decimal pl-5 space-y-1.5 text-slate-700">
                {selectedLaporan.pengumumanWarga.map((pgm, i) => (
                  <li key={i}>{pgm}</li>
                ))}
              </ul>
            </div>

            {/* V. Galeri Dokumentasi Foto Kegiatan Lapangan */}
            <div className="pt-2 border-t border-slate-200">
              <GaleriDokumentasi
                galeri={selectedLaporan.galeriFoto || []}
                daftarKegiatan={selectedLaporan.daftarKegiatan}
                onUpdateGaleri={handleUpdateSelectedReportGaleri}
                isReadOnly={false}
                title="V. Galeri Dokumentasi Foto Kegiatan Lapangan RW 22"
                subtitle="Bukti otentik pelaksanaan program kerja, transparansi fisik anggaran, dan dokumentasi kebersamaan warga RT 01 s/d RT 09"
              />
            </div>

            {/* Lembar Pengesahan Tanda Tangan Tiga Pilar Pengurus RW */}
            <div className="pt-6 border-t border-slate-200">
              <p className="text-xs text-right text-slate-600 mb-4">
                Bumi Pesona Asri, {formatDateIndo(selectedLaporan.tanggalPublikasi)}
              </p>
              <div className="grid grid-cols-3 gap-4 text-center text-xs">
                {/* Sekretaris */}
                <div className="space-y-12">
                  <span className="text-slate-600 block">Sekretaris RW 22,</span>
                  <div>
                    <strong className="text-slate-900 block font-bold underline">
                      {selectedLaporan.sekretaris}
                    </strong>
                    <span className="text-[10px] text-slate-400">NIP/Pengurus RW 22</span>
                  </div>
                </div>

                {/* Bendahara */}
                <div className="space-y-12">
                  <span className="text-slate-600 block">Bendahara RW 22,</span>
                  <div>
                    <strong className="text-slate-900 block font-bold underline">
                      {selectedLaporan.bendahara}
                    </strong>
                    <span className="text-[10px] text-slate-400">NIP/Pengurus RW 22</span>
                  </div>
                </div>

                {/* Ketua RW */}
                <div className="space-y-12">
                  <span className="text-slate-600 block">Ketua RW 22,</span>
                  <div>
                    <strong className="text-slate-900 block font-bold underline">
                      {selectedLaporan.ketuaRw}
                    </strong>
                    <span className="text-[10px] text-slate-400">Pimpinan RW 22</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center space-y-4 shadow-xs">
          <div className="w-14 h-14 bg-slate-100 rounded-2xl flex items-center justify-center mx-auto text-slate-500 border border-slate-200">
            <Search className="w-6 h-6" />
          </div>
          <div className="space-y-1">
            <h3 className="text-base font-bold text-slate-800">
              Tidak Ada Laporan Bulanan yang Dipilih
            </h3>
            <p className="text-xs text-slate-500 max-w-md mx-auto">
              {isFilterActive
                ? `Tidak ada arsip laporan yang cocok dengan kata kunci atau filter tanggal saat ini.`
                : 'Pilih laporan dari daftar di atas untuk membaca dokumen resmi.'}
            </p>
          </div>
          {isFilterActive && (
            <button
              onClick={handleResetFilters}
              className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-semibold shadow-xs transition inline-flex items-center gap-1.5"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Atur Ulang Pencarian & Filter</span>
            </button>
          )}
        </div>
      )}

      {/* Modal Buat Laporan Baru */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-2xl w-full p-5 shadow-2xl border border-slate-200 max-h-[90vh] flex flex-col my-auto">
            <div className="flex justify-between items-center border-b border-slate-100 pb-3 mb-4 flex-shrink-0">
              <h3 className="text-base font-bold text-slate-900">
                Buat Laporan Kegiatan Bulanan Warga RW 22
              </h3>
              <button onClick={() => setIsCreateModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="overflow-y-auto space-y-4 flex-1 text-xs pr-1">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Periode Bulan</label>
                  <select
                    value={newBulan}
                    onChange={(e) => setNewBulan(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl outline-hidden bg-white"
                  >
                    {[
                      'Januari',
                      'Februari',
                      'Maret',
                      'April',
                      'Mei',
                      'Juni',
                      'Juli',
                      'Agustus',
                      'September',
                      'Oktober',
                      'November',
                      'Desember',
                    ].map((b) => (
                      <option key={b} value={b}>
                        {b}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Tahun</label>
                  <input
                    type="number"
                    value={newTahun}
                    onChange={(e) => setNewTahun(Number(e.target.value))}
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl outline-hidden"
                  />
                </div>
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">Pengantar / Ringkasan Eksekutif</label>
                <textarea
                  rows={3}
                  value={newRingkasan}
                  onChange={(e) => setNewRingkasan(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl outline-hidden"
                />
              </div>

              {/* Daftar Kegiatan Builder */}
              <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-3">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <span className="font-bold text-slate-800 block">Daftar Kegiatan Terlaksana ({kegiatanDraft.length}):</span>
                  <button
                    type="button"
                    onClick={handleImportFromPkkAndPosyandu}
                    className="text-xs text-emerald-700 hover:text-emerald-800 font-bold bg-emerald-50 hover:bg-emerald-100 px-2.5 py-1 rounded-lg border border-emerald-200 flex items-center gap-1 self-start sm:self-auto transition"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Tarik Kegiatan Posyandu & PKK</span>
                  </button>
                </div>
                
                <div className="space-y-1.5 max-h-32 overflow-y-auto">
                  {kegiatanDraft.map((item, idx) => (
                    <div key={idx} className="p-2 bg-white rounded-lg border border-slate-200 flex justify-between items-center">
                      <div>
                        <strong className="text-slate-900 block">{item.judul}</strong>
                        <span className="text-[11px] text-slate-500">{item.kategori} • {formatRupiah(item.anggaranDigunakan || 0)}</span>
                      </div>
                      <button
                        type="button"
                        onClick={() => setKegiatanDraft(kegiatanDraft.filter((_, i) => i !== idx))}
                        className="text-rose-600 font-semibold"
                      >
                        Hapus
                      </button>
                    </div>
                  ))}
                </div>

                <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-200">
                  <input
                    type="text"
                    placeholder="Nama kegiatan baru"
                    value={newKegJudul}
                    onChange={(e) => setNewKegJudul(e.target.value)}
                    className="px-2.5 py-1.5 bg-white border border-slate-300 rounded-lg"
                  />
                  <select
                    value={newKegKategori}
                    onChange={(e) => setNewKegKategori(e.target.value as any)}
                    className="px-2.5 py-1.5 bg-white border border-slate-300 rounded-lg"
                  >
                    <option value="Kerja Bakti">Kerja Bakti</option>
                    <option value="Posyandu">Posyandu</option>
                    <option value="PKK">PKK</option>
                    <option value="Pembangunan/Fasum">Pembangunan / Fasum</option>
                    <option value="Keamanan">Keamanan</option>
                    <option value="Rapat Pengurus">Rapat Pengurus</option>
                  </select>
                </div>
                <div className="flex gap-2">
                  <input
                    type="number"
                    placeholder="Biaya (Rp)"
                    value={newKegAnggaran}
                    onChange={(e) => setNewKegAnggaran(Number(e.target.value))}
                    className="w-32 px-2.5 py-1.5 bg-white border border-slate-300 rounded-lg"
                  />
                  <button
                    type="button"
                    onClick={handleAddKegiatanToDraft}
                    className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold rounded-lg"
                  >
                    + Tambah Kegiatan
                  </button>
                </div>
              </div>

              {/* Lampiran Foto Dokumentasi Kegiatan */}
              <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-2">
                <GaleriDokumentasi
                  galeri={galeriDraft}
                  daftarKegiatan={kegiatanDraft}
                  onUpdateGaleri={setGaleriDraft}
                  isReadOnly={false}
                  title="Lampirkan Foto Dokumentasi Kegiatan RW"
                  subtitle="Unggah foto realisasi gotong royong, posyandu, rapat, atau kegiatan warga yang berlangsung pada periode ini"
                />
              </div>

              {/* Pengumuman Warga */}
              <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-2">
                <span className="font-bold text-slate-800 block">Pengumuman Penting Warga:</span>
                <ul className="list-disc pl-4 space-y-1">
                  {pengumumanDraft.map((p, i) => (
                    <li key={i} className="text-slate-700">
                      {p}
                    </li>
                  ))}
                </ul>
                <div className="flex gap-2 pt-1">
                  <input
                    type="text"
                    placeholder="Tambahkan butir pengumuman..."
                    value={newPengumumanText}
                    onChange={(e) => setNewPengumumanText(e.target.value)}
                    className="flex-1 px-2.5 py-1.5 bg-white border border-slate-300 rounded-lg"
                  />
                  <button
                    type="button"
                    onClick={handleAddPengumuman}
                    className="px-3 py-1.5 bg-slate-800 text-white font-semibold rounded-lg"
                  >
                    Tambah
                  </button>
                </div>
              </div>
            </div>

            <div className="pt-3 border-t border-slate-100 flex justify-end gap-2 flex-shrink-0">
              <button
                type="button"
                onClick={() => setIsCreateModalOpen(false)}
                className="px-4 py-2 border border-slate-300 text-slate-700 rounded-xl"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={handlePublishNewReport}
                className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold rounded-xl flex items-center gap-1.5"
              >
                <Send className="w-4 h-4" />
                <span>Terbitkan Laporan untuk Warga</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
