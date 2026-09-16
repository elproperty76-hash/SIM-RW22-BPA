import React, { useState, useMemo } from 'react';
import {
  Radio,
  FileText,
  Wallet,
  Calendar,
  Activity,
  HeartHandshake,
  Phone,
  Shield,
  Send,
  CheckCircle,
  Building2,
  ChevronRight,
  ExternalLink,
  Search,
  X,
  RotateCcw,
  SlidersHorizontal,
  Printer,
  FileDown,
} from 'lucide-react';
import {
  PengurusRWInfo,
  PengurusRTInfo,
  LaporanBulanan,
  TransaksiKas,
  JadwalPosyandu,
  KegiatanPKK,
} from '../types';
import { formatRupiah, formatDateIndo } from '../utils/formatters';
import { GaleriDokumentasi } from './GaleriDokumentasi';
import { openPrintableReportWindow } from '../utils/pdfExporter';

interface PortalWargaViewProps {
  infoRW: PengurusRWInfo;
  daftarRT: PengurusRTInfo[];
  laporan: LaporanBulanan[];
  kas: TransaksiKas[];
  jadwalPosyandu: JadwalPosyandu[];
  kegiatanPKK: KegiatanPKK[];
  onOpenLogin: () => void;
}

export const PortalWargaView: React.FC<PortalWargaViewProps> = ({
  infoRW,
  daftarRT,
  laporan,
  kas,
  jadwalPosyandu,
  kegiatanPKK,
  onOpenLogin,
}) => {
  const [selectedReportId, setSelectedReportId] = useState<string>(laporan[0]?.id || '');
  const [reportSearchQuery, setReportSearchQuery] = useState('');
  const [reportFilterTahun, setReportFilterTahun] = useState('Semua');
  const [aspirasiNama, setAspirasiNama] = useState('');
  const [aspirasiRt, setAspirasiRt] = useState('1');
  const [aspirasiPesan, setAspirasiPesan] = useState('');
  const [aspirasiSubmitted, setAspirasiSubmitted] = useState(false);

  const filteredReports = useMemo(() => {
    return laporan.filter((l) => {
      if (reportFilterTahun !== 'Semua' && String(l.tahun) !== reportFilterTahun) {
        return false;
      }
      if (reportSearchQuery.trim()) {
        const q = reportSearchQuery.toLowerCase().trim();
        const matchJudul = l.judul.toLowerCase().includes(q);
        const matchBulan = l.periodeBulan.toLowerCase().includes(q);
        const matchTahun = String(l.tahun).includes(q);
        const matchRingkasan = l.ringkasanEksekutif.toLowerCase().includes(q);
        const matchKegiatan = l.daftarKegiatan.some(
          (k) =>
            k.judul.toLowerCase().includes(q) ||
            k.deskripsi.toLowerCase().includes(q) ||
            k.lokasi.toLowerCase().includes(q) ||
            k.kategori.toLowerCase().includes(q)
        );
        const matchGaleri = l.galeriFoto?.some(
          (g) =>
            g.judul.toLowerCase().includes(q) ||
            g.keterangan.toLowerCase().includes(q) ||
            (g.lokasi?.toLowerCase().includes(q) || false)
        );
        if (!matchJudul && !matchBulan && !matchTahun && !matchRingkasan && !matchKegiatan && !matchGaleri) {
          return false;
        }
      }
      return true;
    });
  }, [laporan, reportSearchQuery, reportFilterTahun]);

  const activeReport =
    filteredReports.find((l) => l.id === selectedReportId) ||
    filteredReports[0] ||
    laporan.find((l) => l.id === selectedReportId) ||
    laporan[0];

  // Financial summary
  const totalMasuk = kas.filter((k) => k.jenis === 'Masuk').reduce((s, i) => s + i.nominal, 0);
  const totalKeluar = kas.filter((k) => k.jenis === 'Keluar').reduce((s, i) => s + i.nominal, 0);
  const saldoAkhir = totalMasuk - totalKeluar;

  const handleSubmitAspirasi = (e: React.FormEvent) => {
    e.preventDefault();
    if (!aspirasiNama || !aspirasiPesan) return;
    setAspirasiSubmitted(true);
    setTimeout(() => {
      setAspirasiNama('');
      setAspirasiPesan('');
      setAspirasiSubmitted(false);
      alert('Terima kasih! Pesan dan aspirasi warga telah tercatat untuk ditindaklanjuti Pengurus RW 22.');
    }, 800);
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Top Banner Mode Warga */}
      <div className="bg-gradient-to-r from-slate-900 via-emerald-950 to-slate-900 rounded-3xl p-6 sm:p-8 text-white shadow-lg relative overflow-hidden">
        <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 text-xs font-bold border border-emerald-500/30">
              <Radio className="w-3.5 h-3.5 animate-pulse" />
              <span>Portal Informasi & Transparansi Publik Warga</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-black tracking-tight">
              Warga RW 22 {infoRW.perumahan}
            </h2>
            <p className="text-xs sm:text-sm text-slate-300 max-w-xl">
              Desa Jelegong, Kec. Rancaekek, Kab. Bandung 40394. Informasi terbuka laporan kegiatan bulanan, kas keuangan, agenda posyandu, dan layanan warga 9 RT.
            </p>
          </div>

          <button
            onClick={onOpenLogin}
            className="px-4 py-2.5 bg-white/10 hover:bg-white/20 border border-white/20 rounded-xl text-xs font-semibold text-white transition backdrop-blur-xs flex items-center gap-2"
          >
            <span>Login Admin</span>
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* 3 Pillar Board Showcase */}
      <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs space-y-3">
        <div className="flex justify-between items-center border-b border-slate-100 pb-2">
          <span className="text-xs font-bold text-slate-900 uppercase tracking-wider">
            Pengurus Harian RW 22 Bumi Pesona Asri
          </span>
          <span className="text-[11px] text-slate-500">Masa Bakti Berjalan</span>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
          <div className="p-3 bg-emerald-50/70 border border-emerald-200/80 rounded-xl">
            <span className="text-[10px] uppercase font-bold text-emerald-800">Ketua RW 22</span>
            <h4 className="text-sm font-bold text-slate-900">{infoRW.ketuaRw}</h4>
            <p className="text-[11px] text-slate-600 mt-0.5">Penanggung Jawab Wilayah</p>
          </div>
          <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl">
            <span className="text-[10px] uppercase font-bold text-slate-600">Sekretaris RW 22</span>
            <h4 className="text-sm font-bold text-slate-900">{infoRW.sekretaris}</h4>
            <p className="text-[11px] text-slate-600 mt-0.5">Administrasi & Pelayanan Warga</p>
          </div>
          <div className="p-3 bg-amber-50/70 border border-amber-200/80 rounded-xl">
            <span className="text-[10px] uppercase font-bold text-amber-800">Bendahara RW 22</span>
            <h4 className="text-sm font-bold text-slate-900">{infoRW.bendahara}</h4>
            <p className="text-[11px] text-slate-600 mt-0.5">Pengelolaan Kas & Iuran Warga</p>
          </div>
        </div>
      </div>

      {/* Laporan Bulanan Terbuka untuk Warga */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden space-y-4">
        {/* Search & Filter Header for Reports */}
        <div className="p-4 bg-slate-100/70 border-b border-slate-200 flex flex-col sm:flex-row gap-2.5 items-stretch sm:items-center justify-between">
          <div className="flex items-center gap-2">
            <FileText className="w-4 h-4 text-emerald-600" />
            <span className="text-xs font-bold text-slate-800">
              Arsip Laporan Bulanan RW 22 ({filteredReports.length} dari {laporan.length})
            </span>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            <div className="relative flex-1 sm:w-64">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={reportSearchQuery}
                onChange={(e) => setReportSearchQuery(e.target.value)}
                placeholder="Cari kegiatan, CCTV, posyandu, drainase..."
                className="w-full pl-8 pr-7 py-1.5 bg-white border border-slate-300 rounded-lg text-xs font-medium text-slate-800 placeholder-slate-400 focus:outline-hidden focus:ring-2 focus:ring-emerald-500"
              />
              {reportSearchQuery && (
                <button
                  type="button"
                  onClick={() => setReportSearchQuery('')}
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                >
                  <X className="w-3 h-3" />
                </button>
              )}
            </div>

            <select
              value={reportFilterTahun}
              onChange={(e) => setReportFilterTahun(e.target.value)}
              className="px-2.5 py-1.5 bg-white border border-slate-300 rounded-lg text-xs font-semibold text-slate-800"
            >
              <option value="Semua">Semua Tahun</option>
              <option value="2026">Tahun 2026</option>
              <option value="2025">Tahun 2025</option>
            </select>

            {(reportSearchQuery || reportFilterTahun !== 'Semua') && (
              <button
                type="button"
                onClick={() => {
                  setReportSearchQuery('');
                  setReportFilterTahun('Semua');
                }}
                className="p-1.5 bg-rose-50 text-rose-600 hover:bg-rose-100 rounded-lg text-xs transition"
                title="Reset pencarian"
              >
                <RotateCcw className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>

        {activeReport ? (
          <div>
            <div className="p-5 border-b border-slate-100 bg-slate-50/70 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <span className="text-[10px] font-bold text-emerald-800 uppercase tracking-wider bg-emerald-100 px-2 py-0.5 rounded">
                  Laporan Terbitan Warga
                </span>
                <h3 className="text-base sm:text-lg font-bold text-slate-900 mt-1">
                  {activeReport.judul}
                </h3>
                <p className="text-xs text-slate-500">
                  Disahkan resmi oleh Ketua RW: {activeReport.ketuaRw}, Sekretaris: {activeReport.sekretaris}, Bendahara: {activeReport.bendahara}
                </p>
              </div>

              {/* Actions & Report Switcher */}
              <div className="flex items-center gap-2 flex-wrap">
                {filteredReports.length > 1 && (
                  <div className="flex items-center gap-1.5">
                    <span className="text-[11px] font-medium text-slate-500">Pilih Periode:</span>
                    <select
                      value={activeReport.id}
                      onChange={(e) => setSelectedReportId(e.target.value)}
                      className="px-3 py-1.5 bg-white border border-slate-300 rounded-lg text-xs font-semibold text-slate-800"
                    >
                      {filteredReports.map((l) => (
                        <option key={l.id} value={l.id}>
                          {l.periodeBulan} {l.tahun}
                        </option>
                      ))}
                    </select>
                  </div>
                )}

                <button
                  type="button"
                  onClick={() => openPrintableReportWindow(activeReport, infoRW)}
                  className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-semibold shadow-2xs transition inline-flex items-center gap-1.5"
                  title="Buka pratinjau cetak dan simpan PDF dokumen resmi RW 22"
                >
                  <Printer className="w-3.5 h-3.5" />
                  <span>Cetak / Ekspor PDF</span>
                </button>
              </div>
            </div>

            <div className="p-5 sm:p-6 space-y-6 text-xs sm:text-sm">
            {/* Ringkasan */}
            <div className="space-y-1.5 text-slate-700 leading-relaxed bg-slate-50 p-4 rounded-xl border border-slate-200">
              <span className="font-bold text-slate-900 block text-xs uppercase tracking-wider">
                Ringkasan Capaian Kegiatan Bulan {activeReport.periodeBulan} {activeReport.tahun}:
              </span>
              <p>{activeReport.ringkasanEksekutif}</p>
            </div>

            {/* Realisasi Kas Terbuka */}
            <div className="space-y-2">
              <span className="font-bold text-slate-900 block text-xs uppercase tracking-wider">
                Transparansi Kas Lingkungan RW 22:
              </span>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center">
                <div className="p-3 bg-white border border-slate-200 rounded-xl">
                  <span className="text-[10px] text-slate-400 block uppercase">Saldo Awal</span>
                  <strong className="text-slate-900 font-bold">{formatRupiah(activeReport.ringkasanKas.saldoAwal)}</strong>
                </div>
                <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl">
                  <span className="text-[10px] text-emerald-700 block uppercase">Pemasukan</span>
                  <strong className="text-emerald-900 font-bold">{formatRupiah(activeReport.ringkasanKas.totalPemasukan)}</strong>
                </div>
                <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl">
                  <span className="text-[10px] text-rose-700 block uppercase">Pengeluaran</span>
                  <strong className="text-rose-900 font-bold">{formatRupiah(activeReport.ringkasanKas.totalPengeluaran)}</strong>
                </div>
                <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl">
                  <span className="text-[10px] text-amber-700 block uppercase">Saldo Akhir</span>
                  <strong className="text-amber-900 font-bold">{formatRupiah(activeReport.ringkasanKas.saldoAkhir)}</strong>
                </div>
              </div>
            </div>

            {/* Realisasi Kegiatan yang Dijalankan */}
            <div className="space-y-2">
              <span className="font-bold text-slate-900 block text-xs uppercase tracking-wider">
                Rangkaian Kegiatan yang Terlaksana ({activeReport.daftarKegiatan.length} Kegiatan):
              </span>
              <div className="space-y-2">
                {activeReport.daftarKegiatan.map((keg) => (
                  <div
                    key={keg.id}
                    className="p-3 bg-white border border-slate-200 rounded-xl flex flex-col sm:flex-row justify-between sm:items-center gap-2"
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-800">
                          {keg.kategori}
                        </span>
                        <strong className="text-slate-900 text-xs sm:text-sm">{keg.judul}</strong>
                      </div>
                      <p className="text-xs text-slate-600 mt-1">{keg.deskripsi}</p>
                      <span className="text-[11px] text-slate-400 mt-0.5 block">
                        {formatDateIndo(keg.tanggal)} • {keg.lokasi}
                      </span>
                    </div>
                    {keg.anggaranDigunakan && (
                      <span className="text-xs font-mono font-bold text-slate-800 bg-slate-50 px-2.5 py-1 rounded-lg border border-slate-200 whitespace-nowrap self-start sm:self-auto">
                        Biaya: {formatRupiah(keg.anggaranDigunakan)}
                      </span>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Galeri Foto Dokumentasi Kegiatan Warga */}
            {activeReport.galeriFoto && activeReport.galeriFoto.length > 0 && (
              <div className="pt-2 border-t border-slate-200">
                <GaleriDokumentasi
                  galeri={activeReport.galeriFoto}
                  daftarKegiatan={activeReport.daftarKegiatan}
                  isReadOnly={true}
                  title="Galeri Dokumentasi Foto Kegiatan Lapangan Warga RW 22"
                  subtitle="Bukti dokumentasi foto kegiatan gotong royong, posyandu, rapat, dan pembangunan lingkungan RW 22"
                />
              </div>
            )}

            {/* Pengumuman Warga */}
            <div className="space-y-2">
              <span className="font-bold text-slate-900 block text-xs uppercase tracking-wider">
                Maklumat & Pengumuman Resmi Pengurus untuk Warga:
              </span>
              <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 text-xs text-amber-900">
                <ul className="list-disc pl-4 space-y-1.5">
                  {activeReport.pengumumanWarga.map((p, i) => (
                    <li key={i} className="leading-relaxed">
                      {p}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </div>
      ) : (
          <div className="p-10 text-center space-y-3">
            <Search className="w-8 h-8 text-slate-400 mx-auto" />
            <div className="space-y-1">
              <h4 className="text-sm font-bold text-slate-800">
                Laporan yang Anda cari tidak ditemukan
              </h4>
              <p className="text-xs text-slate-500 max-w-sm mx-auto">
                Tidak ada laporan kegiatan yang sesuai dengan kata kunci "{reportSearchQuery}" atau tahun {reportFilterTahun}.
              </p>
            </div>
            <button
              type="button"
              onClick={() => {
                setReportSearchQuery('');
                setReportFilterTahun('Semua');
              }}
              className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-semibold shadow-2xs transition inline-flex items-center gap-1.5"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Reset Pencarian</span>
            </button>
          </div>
        )}
      </div>

      {/* Agenda & Jadwal Terdekat (Posyandu & PKK) */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Posyandu Melati */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs space-y-3">
          <div className="flex items-center gap-2">
            <Activity className="w-5 h-5 text-cyan-600" />
            <h4 className="text-sm font-bold text-slate-900">Jadwal Posyandu Melati RW 22</h4>
          </div>
          {jadwalPosyandu.length > 0 ? (
            <div className="p-3 bg-cyan-50/60 rounded-xl border border-cyan-200 space-y-1 text-xs">
              <span className="font-bold text-cyan-900 text-sm block">
                {jadwalPosyandu[0].judul}
              </span>
              <p className="text-cyan-800">
                Tanggal: <strong>{formatDateIndo(jadwalPosyandu[0].tanggal)}</strong> ({jadwalPosyandu[0].waktu})
              </p>
              <p className="text-slate-600">Tempat: {jadwalPosyandu[0].lokasi}</p>
              <p className="text-slate-500 text-[11px] pt-1">
                Layanan: Penimbangan Balita, Vitamin A, Tensi Darah Lansia.
              </p>
            </div>
          ) : (
            <p className="text-xs text-slate-500">Belum ada jadwal posyandu terdekat.</p>
          )}
        </div>

        {/* PKK RW 22 */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs space-y-3">
          <div className="flex items-center gap-2">
            <HeartHandshake className="w-5 h-5 text-pink-600" />
            <h4 className="text-sm font-bold text-slate-900">Agenda TP-PKK RW 22 Terdekat</h4>
          </div>
          {kegiatanPKK.length > 0 ? (
            <div className="p-3 bg-pink-50/60 rounded-xl border border-pink-200 space-y-1 text-xs">
              <span className="font-bold text-pink-900 text-sm block">
                {kegiatanPKK[0].namaKegiatan}
              </span>
              <p className="text-pink-800">
                Waktu: <strong>{formatDateIndo(kegiatanPKK[0].tanggal)}</strong> ({kegiatanPKK[0].waktu})
              </p>
              <p className="text-slate-600">Lokasi: {kegiatanPKK[0].lokasi}</p>
              <p className="text-slate-500 text-[11px] pt-1">{kegiatanPKK[0].deskripsi}</p>
            </div>
          ) : (
            <p className="text-xs text-slate-500">Belum ada agenda PKK terdekat.</p>
          )}
        </div>
      </div>

      {/* Kotak Suara & Aspirasi Warga */}
      <div className="bg-white rounded-2xl p-5 sm:p-6 border border-slate-200 shadow-xs space-y-4">
        <div>
          <span className="text-[10px] font-bold text-emerald-800 uppercase tracking-wider bg-emerald-100 px-2 py-0.5 rounded">
            Layanan Aspirasi Warga
          </span>
          <h3 className="text-base font-bold text-slate-900 mt-1">
            Kirim Saran, Pengaduan Lingkungan, atau Usulan Kegiatan
          </h3>
          <p className="text-xs text-slate-500">
            Pesan akan diteruskan langsung ke Pengurus RW 22 dan Ketua RT setempat untuk ditindaklanjuti.
          </p>
        </div>

        <form onSubmit={handleSubmitAspirasi} className="space-y-3 text-xs">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="font-semibold text-slate-700 block mb-1">Nama Warga / Keluarga *</label>
              <input
                type="text"
                required
                value={aspirasiNama}
                onChange={(e) => setAspirasiNama(e.target.value)}
                placeholder="Contoh: Bpk. Herman (Blok C3 No 10)"
                className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-hidden"
              />
            </div>

            <div>
              <label className="font-semibold text-slate-700 block mb-1">Wilayah RT Asal *</label>
              <select
                value={aspirasiRt}
                onChange={(e) => setAspirasiRt(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-xl bg-white outline-hidden"
              >
                {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((rt) => (
                  <option key={rt} value={rt}>
                    RT 0{rt} Bumi Pesona Asri
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="font-semibold text-slate-700 block mb-1">Isi Pesan / Pengaduan Lingkungan *</label>
            <textarea
              rows={3}
              required
              value={aspirasiPesan}
              onChange={(e) => setAspirasiPesan(e.target.value)}
              placeholder="Tuliskan aspirasi, laporan fasilitas umum (lampu PJU, selokan), atau permohonan surat pengantar..."
              className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-hidden"
            />
          </div>

          <div className="flex justify-end">
            <button
              type="submit"
              className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-semibold text-xs shadow-xs transition flex items-center gap-2"
            >
              <Send className="w-4 h-4" />
              <span>Kirim Aspirasi ke Pengurus RW 22</span>
            </button>
          </div>
        </form>
      </div>

      {/* Daftar Kontak Penting Pengurus RT 01 s/d RT 09 & Sekretariat RW */}
      <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs space-y-4">
        {/* Sekretariat RW 22 Card */}
        <div className="p-4 rounded-xl bg-gradient-to-r from-emerald-50 to-teal-50 border border-emerald-200/80 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
          <div className="space-y-1">
            <span className="text-[10px] font-bold text-emerald-800 uppercase tracking-wider bg-emerald-100 px-2 py-0.5 rounded">
              Sekretariat Resmi RW 22
            </span>
            <h4 className="text-sm font-bold text-slate-900 mt-1">
              {infoRW.alamatSekretariat}
            </h4>
            <p className="text-slate-600">
              Desa Jelegong, Kec. Rancaekek, Kab. Bandung {infoRW.kodePos}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <a
              href="https://wa.me/6281332166332"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-semibold shadow-xs transition"
            >
              <Phone className="w-3.5 h-3.5" />
              <span>WhatsApp: {infoRW.kontakSekretariat}</span>
            </a>
          </div>
        </div>

        <h4 className="text-sm font-bold text-slate-900 flex items-center gap-2 pt-2 border-t border-slate-100">
          <Phone className="w-4 h-4 text-emerald-600" />
          <span>Kontak Koordinasi 9 Rukun Tetangga (RT 01 s/d RT 09)</span>
        </h4>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs">
          {daftarRT.map((rt) => (
            <div key={rt.rt} className="p-2.5 bg-slate-50 rounded-xl border border-slate-200">
              <span className="font-bold text-emerald-800 block">RT 0{rt.rt} ({rt.blokWilayah})</span>
              <span className="text-slate-800 block">{rt.namaKetua}</span>
              <span className="text-slate-500 font-mono text-[11px]">{rt.kontak}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
