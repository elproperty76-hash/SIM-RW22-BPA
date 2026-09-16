import React from 'react';
import {
  Users,
  Wallet,
  Activity,
  HeartHandshake,
  ArrowUpRight,
  ArrowDownRight,
  Building,
  Phone,
  FileSpreadsheet,
  PlusCircle,
  TrendingUp,
  MapPin,
  Calendar,
  CheckCircle2,
  AlertCircle,
  ExternalLink,
} from 'lucide-react';
import {
  Warga,
  PengurusRWInfo,
  PengurusRTInfo,
  TransaksiKas,
  LaporanBulanan,
  PasienPosyandu,
  AnggotaPKK,
  RTNumber,
} from '../types';
import { formatRupiah, formatDateIndo } from '../utils/formatters';
import { DemografiCharts } from './DemografiCharts';

interface DashboardOverviewProps {
  infoRW: PengurusRWInfo;
  daftarRT: PengurusRTInfo[];
  warga: Warga[];
  kas: TransaksiKas[];
  laporan: LaporanBulanan[];
  posyandu: PasienPosyandu[];
  pkk: AnggotaPKK[];
  onNavigateToWargaRT: (rt: RTNumber) => void;
  onOpenImportModal: () => void;
  onSelectTab: (tab: any) => void;
}

export const DashboardOverview: React.FC<DashboardOverviewProps> = ({
  infoRW,
  daftarRT,
  warga,
  kas,
  laporan,
  posyandu,
  pkk,
  onNavigateToWargaRT,
  onOpenImportModal,
  onSelectTab,
}) => {
  // Calculations
  const totalWarga = warga.length;
  const totalKK = warga.filter((w) => w.statusDalamKeluarga === 'Kepala Keluarga').length;
  
  const totalPemasukan = kas
    .filter((k) => k.jenis === 'Masuk')
    .reduce((sum, item) => sum + item.nominal, 0);

  const totalPengeluaran = kas
    .filter((k) => k.jenis === 'Keluar')
    .reduce((sum, item) => sum + item.nominal, 0);

  const saldoKas = totalPemasukan - totalPengeluaran;

  const totalBalita = posyandu.filter((p) => p.jenis === 'Balita').length;
  const totalLansia = posyandu.filter((p) => p.jenis === 'Lansia').length;

  const laporanTerbaru = laporan[0];

  return (
    <div className="space-y-6">
      {/* Top Banner & Quick Actions */}
      <div className="bg-gradient-to-r from-emerald-800 via-teal-900 to-slate-900 rounded-2xl p-5 sm:p-6 text-white shadow-md relative overflow-hidden">
        <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div className="space-y-1">
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-500/30 text-emerald-200 text-xs font-semibold backdrop-blur-xs">
              <span>Selamat Datang di Portal Pengurus</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-bold tracking-tight">
              Rukun Warga 22 {infoRW.perumahan}
            </h2>
            <p className="text-xs sm:text-sm text-slate-300 max-w-2xl">
              Desa Jelegong, Kecamatan Rancaekek, Kabupaten Bandung {infoRW.kodePos}. Pusat koordinasi terpadu 9 RT (RT 01 s/d RT 09), PKK, Posyandu Anggrek Bulan, dan transparansi kas warga.
            </p>
          </div>

          <div className="flex flex-wrap gap-2 sm:gap-3 w-full md:w-auto">
            <button
              id="btn-quick-import"
              onClick={onOpenImportModal}
              className="flex-1 md:flex-none flex items-center justify-center gap-2 px-3.5 py-2.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 rounded-xl font-semibold text-xs sm:text-sm transition shadow-sm"
            >
              <FileSpreadsheet className="w-4 h-4" />
              <span>Import Data RT</span>
            </button>
            <button
              id="btn-quick-kas"
              onClick={() => onSelectTab('kas')}
              className="flex-1 md:flex-none flex items-center justify-center gap-2 px-3.5 py-2.5 bg-slate-800/90 hover:bg-slate-700 text-white rounded-xl font-medium text-xs sm:text-sm border border-slate-700 transition"
            >
              <Wallet className="w-4 h-4 text-amber-400" />
              <span>Kelola Kas</span>
            </button>
          </div>
        </div>

        {/* Decorative subtle background overlay */}
        <div className="absolute -right-12 -bottom-12 w-64 h-64 bg-emerald-500/10 rounded-full blur-2xl pointer-events-none" />
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-5">
        {/* Total Warga */}
        <div
          onClick={() => onSelectTab('warga')}
          className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200 shadow-xs hover:border-emerald-300 transition cursor-pointer group"
        >
          <div className="flex justify-between items-start mb-2">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Total Warga</span>
            <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center group-hover:scale-110 transition">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <h3 className="text-2xl sm:text-3xl font-bold text-slate-900">{totalWarga}</h3>
            <span className="text-xs text-slate-500">Jiwa</span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Tersebar di <span className="font-semibold text-emerald-700">9 RT</span> ({totalKK} Kepala Keluarga)
          </p>
        </div>

        {/* Saldo Kas RW */}
        <div
          onClick={() => onSelectTab('kas')}
          className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200 shadow-xs hover:border-amber-300 transition cursor-pointer group"
        >
          <div className="flex justify-between items-start mb-2">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Saldo Kas RW</span>
            <div className="w-9 h-9 rounded-xl bg-amber-50 text-amber-700 flex items-center justify-center group-hover:scale-110 transition">
              <Wallet className="w-4 h-4" />
            </div>
          </div>
          <h3 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
            {formatRupiah(saldoKas)}
          </h3>
          <div className="flex items-center gap-2 mt-1 text-[11px] text-slate-500">
            <span className="text-emerald-700 font-semibold flex items-center">
              <ArrowUpRight className="w-3 h-3 inline" /> Masuk: {formatRupiah(totalPemasukan)}
            </span>
          </div>
        </div>

        {/* Posyandu Anggrek Bulan */}
        <div
          onClick={() => onSelectTab('posyandu')}
          className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200 shadow-xs hover:border-cyan-300 transition cursor-pointer group"
        >
          <div className="flex justify-between items-start mb-2">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Posyandu Anggrek Bulan</span>
            <div className="w-9 h-9 rounded-xl bg-cyan-50 text-cyan-700 flex items-center justify-center group-hover:scale-110 transition">
              <Activity className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <h3 className="text-2xl sm:text-3xl font-bold text-slate-900">{posyandu.length}</h3>
            <span className="text-xs text-slate-500">Sasaran Terdata</span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            <span className="font-semibold text-cyan-800">{totalBalita} Balita</span> • <span className="font-semibold text-indigo-800">{totalLansia} Lansia</span>
          </p>
        </div>

        {/* PKK RW 22 */}
        <div
          onClick={() => onSelectTab('pkk')}
          className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200 shadow-xs hover:border-pink-300 transition cursor-pointer group"
        >
          <div className="flex justify-between items-start mb-2">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Kader PKK RW 22</span>
            <div className="w-9 h-9 rounded-xl bg-pink-50 text-pink-700 flex items-center justify-center group-hover:scale-110 transition">
              <HeartHandshake className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <h3 className="text-2xl sm:text-3xl font-bold text-slate-900">{pkk.length}</h3>
            <span className="text-xs text-slate-500">Kader Aktif</span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Pokja I s/d Pokja IV & Pengurus Inti
          </p>
        </div>
      </div>

      {/* Visualisasi Demografi & Profil Ketenagakerjaan dengan Recharts */}
      <DemografiCharts warga={warga} daftarRT={daftarRT} />

      {/* Pengurus Inti RW 22 Showcase */}
      <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4 border-b border-slate-100 pb-3">
          <div>
            <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <Building className="w-4 h-4 text-emerald-600" />
              Susunan Pengurus Inti Rukun Warga 22 Periode Berjalan
            </h3>
            <p className="text-xs text-slate-500">
              Bumi Pesona Asri, Desa Jelegong, Kecamatan Rancaekek, Kabupaten Bandung (40394)
            </p>
          </div>
          <span className="inline-flex items-center gap-1 text-xs text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full font-semibold">
            <CheckCircle2 className="w-3.5 h-3.5" /> Surat Keputusan Desa Jelegong Aktif
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {/* Ketua RW */}
          <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-emerald-600 text-white flex items-center justify-center font-bold text-sm shadow-xs flex-shrink-0">
              RW
            </div>
            <div>
              <span className="text-[10px] uppercase font-bold text-emerald-700 tracking-wider">Ketua RW 22</span>
              <h4 className="text-sm font-bold text-slate-900 leading-snug">{infoRW.ketuaRw}</h4>
              <p className="text-[11px] text-slate-500">Pimpinan & Penanggung Jawab Wilayah</p>
            </div>
          </div>

          {/* Sekretaris */}
          <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-slate-700 text-white flex items-center justify-center font-bold text-sm shadow-xs flex-shrink-0">
              SEK
            </div>
            <div>
              <span className="text-[10px] uppercase font-bold text-slate-600 tracking-wider">Sekretaris RW 22</span>
              <h4 className="text-sm font-bold text-slate-900 leading-snug">{infoRW.sekretaris}</h4>
              <p className="text-[11px] text-slate-500">Administrasi Warga & Pelaporan</p>
            </div>
          </div>

          {/* Bendahara */}
          <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-amber-600 text-white flex items-center justify-center font-bold text-sm shadow-xs flex-shrink-0">
              BEN
            </div>
            <div>
              <span className="text-[10px] uppercase font-bold text-amber-700 tracking-wider">Bendahara RW 22</span>
              <h4 className="text-sm font-bold text-slate-900 leading-snug">{infoRW.bendahara}</h4>
              <p className="text-[11px] text-slate-500">Tata Kelola Kas & Iuran Warga</p>
            </div>
          </div>
        </div>
      </div>

      {/* Grid Rekap 9 RT (RT 01 s/d RT 09) */}
      <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-3">
          <div>
            <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <Users className="w-4 h-4 text-emerald-600" />
              Rekapitulasi Pengurus RT Binaan RW 22 (RT 01 s/d RT 09)
            </h3>
            <p className="text-xs text-slate-500">
              Klik pada kartu RT untuk memfilter data warga atau mengimpor data langsung dari RT bersangkutan
            </p>
          </div>
          <button
            onClick={onOpenImportModal}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 text-xs font-semibold rounded-lg transition border border-emerald-200"
          >
            <FileSpreadsheet className="w-3.5 h-3.5" />
            <span>Form Import Data RT</span>
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
          {daftarRT.map((rtItem) => {
            const wargaDiRT = warga.filter((w) => w.rt === rtItem.rt);
            const kkDiRT = wargaDiRT.filter((w) => w.statusDalamKeluarga === 'Kepala Keluarga').length;

            return (
              <div
                key={rtItem.rt}
                id={`card-rt-${rtItem.rt}`}
                className="p-3.5 rounded-xl border border-slate-200 bg-slate-50/60 hover:bg-white hover:border-emerald-300 hover:shadow-xs transition duration-150 flex flex-col justify-between"
              >
                <div>
                  <div className="flex justify-between items-start">
                    <span className="inline-flex items-center px-2 py-0.5 rounded-md bg-emerald-700 text-white font-bold text-xs">
                      RT 0{rtItem.rt}
                    </span>
                    <span className="text-[11px] font-medium text-slate-400">
                      {rtItem.blokWilayah}
                    </span>
                  </div>

                  <div className="mt-2.5">
                    <span className="text-[10px] text-slate-400 uppercase font-medium block">Ketua RT:</span>
                    <p className="text-sm font-bold text-slate-800">{rtItem.namaKetua}</p>
                    <p className="text-[11px] text-slate-500 font-mono mt-0.5 flex items-center gap-1">
                      <Phone className="w-3 h-3 text-slate-400" /> {rtItem.kontak}
                    </p>
                  </div>

                  <div className="mt-3 pt-2.5 border-t border-slate-200/80 grid grid-cols-2 gap-2 text-center text-xs">
                    <div className="bg-white p-1.5 rounded-lg border border-slate-100">
                      <span className="text-[10px] text-slate-400 block">Warga</span>
                      <strong className="text-slate-900 font-bold">{wargaDiRT.length}</strong> jiwa
                    </div>
                    <div className="bg-white p-1.5 rounded-lg border border-slate-100">
                      <span className="text-[10px] text-slate-400 block">Kepala KK</span>
                      <strong className="text-slate-900 font-bold">{kkDiRT}</strong> KK
                    </div>
                  </div>
                </div>

                <div className="mt-3 flex gap-2">
                  <button
                    onClick={() => onNavigateToWargaRT(rtItem.rt)}
                    className="flex-1 py-1.5 px-2 bg-white hover:bg-emerald-50 text-emerald-800 border border-slate-200 hover:border-emerald-300 rounded-lg text-xs font-semibold flex items-center justify-center gap-1 transition"
                  >
                    <span>Lihat Data Warga</span>
                    <ArrowUpRight className="w-3 h-3" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Laporan Bulanan Terakhir & Informasi Kas */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Laporan Warga Terbaru */}
        <div className="lg:col-span-2 bg-white rounded-2xl p-5 border border-slate-200 shadow-xs space-y-3">
          <div className="flex justify-between items-center border-b border-slate-100 pb-3">
            <div>
              <span className="text-[10px] uppercase font-bold text-emerald-700 tracking-wider bg-emerald-50 px-2 py-0.5 rounded">
                Laporan Warga Terbaru
              </span>
              <h3 className="text-base font-bold text-slate-900 mt-1">
                {laporanTerbaru ? laporanTerbaru.judul : 'Laporan Kegiatan RW 22'}
              </h3>
            </div>
            <button
              onClick={() => onSelectTab('laporan')}
              className="text-xs font-semibold text-emerald-700 hover:text-emerald-800 flex items-center gap-1"
            >
              <span>Arsip Laporan</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {laporanTerbaru ? (
            <div className="space-y-3 text-xs text-slate-600">
              <p className="line-clamp-2 leading-relaxed text-slate-700">
                {laporanTerbaru.ringkasanEksekutif}
              </p>

              <div>
                <p className="font-semibold text-slate-900 mb-1.5">Kegiatan Terlaksana:</p>
                <div className="space-y-1.5">
                  {laporanTerbaru.daftarKegiatan.slice(0, 3).map((keg) => (
                    <div
                      key={keg.id}
                      className="p-2.5 rounded-lg bg-slate-50 border border-slate-100 flex items-start justify-between gap-2"
                    >
                      <div>
                        <span className="font-semibold text-slate-900 block">{keg.judul}</span>
                        <span className="text-[11px] text-slate-500">
                          {formatDateIndo(keg.tanggal)} • {keg.lokasi}
                        </span>
                      </div>
                      <span className="px-2 py-0.5 rounded text-[10px] font-medium bg-emerald-100 text-emerald-800 flex-shrink-0">
                        {keg.kategori}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="pt-2 flex justify-between items-center">
                <span className="text-[11px] text-slate-400">
                  Diterbitkan oleh Pengurus RW 22 ({infoRW.ketuaRw}, {infoRW.sekretaris}, {infoRW.bendahara})
                </span>
                <button
                  onClick={() => onSelectTab('laporan')}
                  className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-semibold text-xs transition"
                >
                  Buka & Cetak Laporan
                </button>
              </div>
            </div>
          ) : (
            <p className="text-xs text-slate-500 py-4 text-center">Belum ada laporan kegiatan dibuat.</p>
          )}
        </div>

        {/* Transparansi Kas Cepat */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs flex flex-col justify-between space-y-4">
          <div>
            <span className="text-[10px] uppercase font-bold text-amber-700 tracking-wider bg-amber-50 px-2 py-0.5 rounded">
              Pertanggungjawaban Kas
            </span>
            <h3 className="text-base font-bold text-slate-900 mt-1">Transparansi Kas RW 22</h3>
            <p className="text-xs text-slate-500 mt-0.5">Penanggung Jawab: Bendahara {infoRW.bendahara}</p>

            <div className="mt-4 p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-3">
              <div>
                <span className="text-xs text-slate-500 block">Saldo Kas Terkini:</span>
                <span className="text-2xl font-bold text-slate-900">{formatRupiah(saldoKas)}</span>
              </div>

              <div className="grid grid-cols-2 gap-2 text-xs pt-2 border-t border-slate-200">
                <div>
                  <span className="text-[10px] text-slate-400 uppercase block">Total Pemasukan</span>
                  <span className="font-semibold text-emerald-700">{formatRupiah(totalPemasukan)}</span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 uppercase block">Total Pengeluaran</span>
                  <span className="font-semibold text-rose-700">{formatRupiah(totalPengeluaran)}</span>
                </div>
              </div>
            </div>
          </div>

          <button
            onClick={() => onSelectTab('kas')}
            className="w-full py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-semibold transition"
          >
            Lihat Buku Kas & Rekap Iuran RT
          </button>
        </div>
      </div>
    </div>
  );
};
