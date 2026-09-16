import React, { useState, useMemo } from 'react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  PieChart,
  Pie,
  Cell,
} from 'recharts';
import {
  Users,
  Briefcase,
  UserCheck,
  Baby,
  HeartPulse,
  Filter,
  BarChart3,
  PieChart as PieIcon,
  HelpCircle,
  TrendingUp,
} from 'lucide-react';
import { Warga, PengurusRTInfo, RTNumber } from '../types';

interface DemografiChartsProps {
  warga: Warga[];
  daftarRT: PengurusRTInfo[];
}

interface KelompokUsiaItem {
  kelompok: string;
  rangeLabel: string;
  total: number;
  lakiLaki: number;
  perempuan: number;
  persentase: number;
}

interface PekerjaanItem {
  kategori: string;
  jumlah: number;
  persentase: number;
  warna: string;
}

// Color palette for occupations
const OCCUPATION_COLORS = [
  '#059669', // Emerald
  '#2563eb', // Blue
  '#d97706', // Amber
  '#7c3aed', // Purple
  '#0891b2', // Cyan
  '#e11d48', // Rose
  '#4f46e5', // Indigo
  '#64748b', // Slate
  '#0d9488', // Teal
  '#ea580c', // Orange
];

function calculateAge(tanggalLahir: string): number {
  if (!tanggalLahir) return 0;
  const parts = tanggalLahir.split('-');
  if (parts.length === 3) {
    const y = parseInt(parts[0], 10);
    const m = parseInt(parts[1], 10) - 1;
    const d = parseInt(parts[2], 10);
    const birth = new Date(y, m, d);
    const now = new Date();
    let age = now.getFullYear() - birth.getFullYear();
    const monthDiff = now.getMonth() - birth.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && now.getDate() < birth.getDate())) {
      age--;
    }
    return Math.max(0, age);
  }
  return 0;
}

// Helper to group occupation string into standardized category
function normalizePekerjaan(pekerjaanStr: string): string {
  if (!pekerjaanStr) return 'Lainnya / Tidak Diisi';
  const clean = pekerjaanStr.trim().toLowerCase();

  if (clean.includes('swasta') || clean.includes('buruh') || clean.includes('pabrik')) {
    return 'Karyawan Swasta';
  }
  if (clean.includes('wiraswasta') || clean.includes('usaha') || clean.includes('dagang') || clean.includes('bisnis')) {
    return 'Wiraswasta / Pedagang';
  }
  if (clean.includes('pns') || clean.includes('asn') || clean.includes('guru') || clean.includes('dosen') || clean.includes('pamong') || clean.includes('tni') || clean.includes('polri') || clean.includes('bumn')) {
    return 'PNS / ASN / BUMN / Guru';
  }
  if (clean.includes('rumah tangga') || clean.includes('irt')) {
    return 'Ibu Rumah Tangga';
  }
  if (clean.includes('pelajar') || clean.includes('siswa') || clean.includes('mahasiswa')) {
    return 'Pelajar / Mahasiswa';
  }
  if (clean.includes('pensiun')) {
    return 'Pensiunan';
  }
  if (clean.includes('belum') || clean.includes('tidak bekerja') || clean.includes('menganggur') || clean.includes('mencari kerja')) {
    return 'Belum / Tidak Bekerja';
  }
  if (clean.includes('medis') || clean.includes('dokter') || clean.includes('perawat') || clean.includes('bidan')) {
    return 'Tenaga Kesehatan';
  }

  // Capitalize original if short
  return pekerjaanStr.length > 22 ? 'Lainnya' : pekerjaanStr;
}

export const DemografiCharts: React.FC<DemografiChartsProps> = ({ warga, daftarRT }) => {
  const [selectedRtFilter, setSelectedRtFilter] = useState<RTNumber | 'ALL'>('ALL');
  const [chartViewMode, setChartViewMode] = useState<'all' | 'usia' | 'pekerjaan'>('all');
  const [pekerjaanGroupingMode, setPekerjaanGroupingMode] = useState<'kategori' | 'rinci'>('kategori');

  // Filter warga by RT if selected
  const filteredWarga = useMemo(() => {
    if (selectedRtFilter === 'ALL') return warga;
    return warga.filter((w) => w.rt === selectedRtFilter);
  }, [warga, selectedRtFilter]);

  const totalFiltered = filteredWarga.length;

  // 1. Calculate Kelompok Usia distribution
  const dataKelompokUsia: KelompokUsiaItem[] = useMemo(() => {
    const buckets = [
      { key: 'balita', label: 'Balita', range: '0 - 5 Th', min: 0, max: 5 },
      { key: 'anak', label: 'Anak-anak', range: '6 - 12 Th', min: 6, max: 12 },
      { key: 'remaja', label: 'Remaja', range: '13 - 17 Th', min: 13, max: 17 },
      { key: 'dewasa_muda', label: 'Dewasa Muda', range: '18 - 35 Th', min: 18, max: 35 },
      { key: 'dewasa_madya', label: 'Dewasa Madya', range: '36 - 55 Th', min: 36, max: 55 },
      { key: 'lansia', label: 'Lansia', range: '> 55 Th', min: 56, max: 200 },
    ];

    const counts: Record<string, { total: number; lakiLaki: number; perempuan: number }> = {};
    buckets.forEach((b) => {
      counts[b.key] = { total: 0, lakiLaki: 0, perempuan: 0 };
    });

    filteredWarga.forEach((w) => {
      const age = calculateAge(w.tanggalLahir);
      const matched = buckets.find((b) => age >= b.min && age <= b.max) || buckets[buckets.length - 1];
      counts[matched.key].total++;
      if (w.jenisKelamin === 'L') {
        counts[matched.key].lakiLaki++;
      } else {
        counts[matched.key].perempuan++;
      }
    });

    return buckets.map((b) => {
      const count = counts[b.key];
      return {
        kelompok: b.label,
        rangeLabel: b.range,
        total: count.total,
        lakiLaki: count.lakiLaki,
        perempuan: count.perempuan,
        persentase: totalFiltered > 0 ? Math.round((count.total / totalFiltered) * 100) : 0,
      };
    });
  }, [filteredWarga, totalFiltered]);

  // Key demographic metrics
  const metricBalita = dataKelompokUsia.find((d) => d.kelompok === 'Balita')?.total || 0;
  const metricAnakRemaja = (dataKelompokUsia.find((d) => d.kelompok === 'Anak-anak')?.total || 0) +
    (dataKelompokUsia.find((d) => d.kelompok === 'Remaja')?.total || 0);
  const metricProduktif =
    (dataKelompokUsia.find((d) => d.kelompok === 'Dewasa Muda')?.total || 0) +
    (dataKelompokUsia.find((d) => d.kelompok === 'Dewasa Madya')?.total || 0);
  const metricLansia = dataKelompokUsia.find((d) => d.kelompok === 'Lansia')?.total || 0;

  const rasioProduktifPct = totalFiltered > 0 ? Math.round((metricProduktif / totalFiltered) * 100) : 0;

  // 2. Calculate Status Pekerjaan distribution
  const dataPekerjaan: PekerjaanItem[] = useMemo(() => {
    const mapCount: Record<string, number> = {};

    filteredWarga.forEach((w) => {
      const key = pekerjaanGroupingMode === 'kategori' ? normalizePekerjaan(w.pekerjaan) : (w.pekerjaan.trim() || 'Lainnya');
      mapCount[key] = (mapCount[key] || 0) + 1;
    });

    const entries = Object.entries(mapCount)
      .map(([kategori, jumlah], index) => ({
        kategori,
        jumlah,
        persentase: totalFiltered > 0 ? Math.round((jumlah / totalFiltered) * 100) : 0,
        warna: OCCUPATION_COLORS[index % OCCUPATION_COLORS.length],
      }))
      .sort((a, b) => b.jumlah - a.jumlah);

    return entries;
  }, [filteredWarga, totalFiltered, pekerjaanGroupingMode]);

  // Custom Tooltip for Age Chart
  const CustomAgeTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const item = payload[0].payload as KelompokUsiaItem;
      return (
        <div className="bg-slate-900 text-white p-3 rounded-xl shadow-lg border border-slate-800 text-xs space-y-1">
          <div className="font-bold text-sm text-emerald-300">
            {label} ({item.rangeLabel})
          </div>
          <div className="border-t border-slate-800 pt-1.5 space-y-1">
            <div className="flex justify-between gap-4 text-slate-300">
              <span className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-teal-400" />
                Laki-laki:
              </span>
              <strong className="text-white">{item.lakiLaki} jiwa</strong>
            </div>
            <div className="flex justify-between gap-4 text-slate-300">
              <span className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-rose-400" />
                Perempuan:
              </span>
              <strong className="text-white">{item.perempuan} jiwa</strong>
            </div>
            <div className="flex justify-between gap-4 pt-1 border-t border-slate-800 font-semibold text-white">
              <span>Total Jiwa:</span>
              <span className="text-emerald-400">
                {item.total} ({item.persentase}%)
              </span>
            </div>
          </div>
        </div>
      );
    }
    return null;
  };

  // Custom Tooltip for Pekerjaan Chart
  const CustomJobTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload as PekerjaanItem;
      return (
        <div className="bg-slate-900 text-white p-3 rounded-xl shadow-lg border border-slate-800 text-xs">
          <p className="font-bold text-sm text-slate-100 mb-1">{data.kategori}</p>
          <div className="flex items-center justify-between gap-4 text-slate-300">
            <span>Jumlah Warga:</span>
            <strong className="text-emerald-400 font-bold">{data.jumlah} jiwa</strong>
          </div>
          <div className="flex items-center justify-between gap-4 text-slate-300 mt-0.5">
            <span>Porsi Populasi:</span>
            <strong className="text-white font-bold">{data.persentase}%</strong>
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="bg-white rounded-2xl p-5 sm:p-6 border border-slate-200 shadow-xs space-y-6">
      {/* Component Header & Control Toolbar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-100 pb-4">
        <div>
          <div className="flex items-center gap-2 flex-wrap mb-1">
            <span className="text-[10px] uppercase font-bold text-emerald-800 tracking-wider bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200/60">
              Visualisasi Demografi Recharts
            </span>
            <span className="text-xs text-slate-500 font-medium">
              Analisis Komposisi Penduduk & Ketenagakerjaan
            </span>
          </div>
          <h3 className="text-base sm:text-lg font-bold text-slate-900 tracking-tight">
            Distribusi Kelompok Usia & Status Pekerjaan Warga
          </h3>
        </div>

        {/* Filters and View Switchers */}
        <div className="flex flex-wrap items-center gap-2.5">
          {/* RT Selector */}
          <div className="flex items-center gap-1.5 bg-slate-50 p-1 rounded-xl border border-slate-200 text-xs">
            <Filter className="w-3.5 h-3.5 text-slate-500 ml-1.5" />
            <select
              id="filter-rt-demografi"
              value={selectedRtFilter}
              onChange={(e) =>
                setSelectedRtFilter(
                  e.target.value === 'ALL' ? 'ALL' : (Number(e.target.value) as RTNumber)
                )
              }
              className="bg-transparent text-slate-800 font-semibold focus:outline-hidden pr-2 py-1 text-xs cursor-pointer"
            >
              <option value="ALL">Semua Wilayah (RW 22)</option>
              {daftarRT.map((rt) => (
                <option key={rt.rt} value={rt.rt}>
                  RT 0{rt.rt} - {rt.blokWilayah}
                </option>
              ))}
            </select>
          </div>

          {/* View Tab Filter */}
          <div className="flex items-center bg-slate-100 p-1 rounded-xl text-xs font-semibold text-slate-600">
            <button
              onClick={() => setChartViewMode('all')}
              className={`px-2.5 py-1 rounded-lg transition ${
                chartViewMode === 'all'
                  ? 'bg-white text-emerald-800 shadow-2xs'
                  : 'hover:text-slate-900'
              }`}
            >
              Semua
            </button>
            <button
              onClick={() => setChartViewMode('usia')}
              className={`px-2.5 py-1 rounded-lg transition ${
                chartViewMode === 'usia'
                  ? 'bg-white text-emerald-800 shadow-2xs'
                  : 'hover:text-slate-900'
              }`}
            >
              Kelompok Usia
            </button>
            <button
              onClick={() => setChartViewMode('pekerjaan')}
              className={`px-2.5 py-1 rounded-lg transition ${
                chartViewMode === 'pekerjaan'
                  ? 'bg-white text-emerald-800 shadow-2xs'
                  : 'hover:text-slate-900'
              }`}
            >
              Pekerjaan
            </button>
          </div>
        </div>
      </div>

      {/* Snapshot Demographic Indicator Badges */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
        <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200">
          <div className="flex items-center justify-between text-slate-500 mb-1">
            <span className="font-medium">Total Terdata</span>
            <Users className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-xl sm:text-2xl font-bold text-slate-900">
            {totalFiltered} <span className="text-xs font-normal text-slate-500">Jiwa</span>
          </div>
          <p className="text-[11px] text-slate-500 mt-0.5">
            {selectedRtFilter === 'ALL' ? '9 RT di RW 22' : `Wilayah RT 0${selectedRtFilter}`}
          </p>
        </div>

        <div className="p-3.5 rounded-xl bg-emerald-50/60 border border-emerald-200/80">
          <div className="flex items-center justify-between text-emerald-800 mb-1">
            <span className="font-medium">Usia Produktif</span>
            <UserCheck className="w-4 h-4 text-emerald-700" />
          </div>
          <div className="text-xl sm:text-2xl font-bold text-slate-900">
            {metricProduktif} <span className="text-xs font-normal text-slate-500">Jiwa</span>
          </div>
          <p className="text-[11px] text-emerald-800 mt-0.5">
            <strong>{rasioProduktifPct}%</strong> dari populasi (18-55 th)
          </p>
        </div>

        <div className="p-3.5 rounded-xl bg-amber-50/60 border border-amber-200/80">
          <div className="flex items-center justify-between text-amber-800 mb-1">
            <span className="font-medium">Balita & Anak</span>
            <Baby className="w-4 h-4 text-amber-700" />
          </div>
          <div className="text-xl sm:text-2xl font-bold text-slate-900">
            {metricBalita + metricAnakRemaja}{' '}
            <span className="text-xs font-normal text-slate-500">Jiwa</span>
          </div>
          <p className="text-[11px] text-amber-800 mt-0.5">
            {metricBalita} Balita (0-5) • {metricAnakRemaja} Anak/Remaja
          </p>
        </div>

        <div className="p-3.5 rounded-xl bg-indigo-50/60 border border-indigo-200/80">
          <div className="flex items-center justify-between text-indigo-800 mb-1">
            <span className="font-medium">Lanjut Usia (Lansia)</span>
            <HeartPulse className="w-4 h-4 text-indigo-700" />
          </div>
          <div className="text-xl sm:text-2xl font-bold text-slate-900">
            {metricLansia} <span className="text-xs font-normal text-slate-500">Jiwa</span>
          </div>
          <p className="text-[11px] text-indigo-800 mt-0.5">
            Usia di atas 55 tahun
          </p>
        </div>
      </div>

      {/* Visual Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* CHART 1: KELOMPOK USIA */}
        {(chartViewMode === 'all' || chartViewMode === 'usia') && (
          <div
            className={`bg-slate-50/50 rounded-xl p-4 sm:p-5 border border-slate-200 flex flex-col justify-between ${
              chartViewMode === 'usia' ? 'lg:col-span-2' : ''
            }`}
          >
            <div>
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <div className="p-1.5 rounded-lg bg-emerald-100 text-emerald-800">
                    <BarChart3 className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-slate-900">
                      Distribusi Berdasarkan Kelompok Usia
                    </h4>
                    <p className="text-[11px] text-slate-500">
                      Pengelompokan usia dengan perbandingan jenis kelamin
                    </p>
                  </div>
                </div>
              </div>

              {/* Chart Canvas */}
              <div className="h-64 sm:h-72 w-full mt-3">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={dataKelompokUsia}
                    margin={{ top: 15, right: 10, left: -20, bottom: 20 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
                    <XAxis
                      dataKey="kelompok"
                      tick={{ fill: '#475569', fontSize: 11 }}
                      interval={0}
                      tickLine={false}
                      angle={-15}
                      textAnchor="end"
                    />
                    <YAxis
                      tick={{ fill: '#64748b', fontSize: 11 }}
                      tickLine={false}
                      axisLine={false}
                      allowDecimals={false}
                    />
                    <Tooltip content={<CustomAgeTooltip />} />
                    <Legend
                      wrapperStyle={{ paddingTop: 10, fontSize: '11px' }}
                      iconSize={10}
                    />
                    <Bar
                      name="Laki-laki"
                      dataKey="lakiLaki"
                      fill="#0d9488"
                      radius={[4, 4, 0, 0]}
                    />
                    <Bar
                      name="Perempuan"
                      dataKey="perempuan"
                      fill="#f43f5e"
                      radius={[4, 4, 0, 0]}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Age Group Breakdown Pills */}
            <div className="mt-4 pt-3 border-t border-slate-200/80 grid grid-cols-2 sm:grid-cols-3 gap-2 text-xs">
              {dataKelompokUsia.map((item) => (
                <div
                  key={item.kelompok}
                  className="bg-white p-2 rounded-lg border border-slate-200/70 flex items-center justify-between"
                >
                  <div>
                    <span className="text-slate-800 font-semibold block">{item.kelompok}</span>
                    <span className="text-[10px] text-slate-400">{item.rangeLabel}</span>
                  </div>
                  <div className="text-right">
                    <span className="font-bold text-slate-900 block">{item.total} jiwa</span>
                    <span className="text-[10px] font-medium text-emerald-700">
                      {item.persentase}%
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* CHART 2: STATUS PEKERJAAN */}
        {(chartViewMode === 'all' || chartViewMode === 'pekerjaan') && (
          <div
            className={`bg-slate-50/50 rounded-xl p-4 sm:p-5 border border-slate-200 flex flex-col justify-between ${
              chartViewMode === 'pekerjaan' ? 'lg:col-span-2' : ''
            }`}
          >
            <div>
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-2">
                <div className="flex items-center gap-2">
                  <div className="p-1.5 rounded-lg bg-blue-100 text-blue-800">
                    <Briefcase className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-slate-900">
                      Distribusi Status Mata Pencaharian / Pekerjaan
                    </h4>
                    <p className="text-[11px] text-slate-500">
                      Klasifikasi profesi utama warga binaan
                    </p>
                  </div>
                </div>

                {/* Grouping switch */}
                <div className="inline-flex rounded-lg border border-slate-200 bg-white p-0.5 text-[11px]">
                  <button
                    onClick={() => setPekerjaanGroupingMode('kategori')}
                    className={`px-2 py-0.5 rounded-md transition ${
                      pekerjaanGroupingMode === 'kategori'
                        ? 'bg-slate-900 text-white font-semibold'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    Kategori Umum
                  </button>
                  <button
                    onClick={() => setPekerjaanGroupingMode('rinci')}
                    className={`px-2 py-0.5 rounded-md transition ${
                      pekerjaanGroupingMode === 'rinci'
                        ? 'bg-slate-900 text-white font-semibold'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    Data Asli
                  </button>
                </div>
              </div>

              {/* Chart Canvas: Donut and Bar Hybrid for deep insight */}
              <div className="grid grid-cols-1 sm:grid-cols-12 gap-4 items-center mt-3">
                {/* Donut Chart */}
                <div className="h-56 sm:h-64 sm:col-span-5 relative flex items-center justify-center">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={dataPekerjaan}
                        cx="50%"
                        cy="50%"
                        innerRadius={50}
                        outerRadius={80}
                        paddingAngle={3}
                        dataKey="jumlah"
                        nameKey="kategori"
                      >
                        {dataPekerjaan.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.warna} />
                        ))}
                      </Pie>
                      <Tooltip content={<CustomJobTooltip />} />
                    </PieChart>
                  </ResponsiveContainer>
                  <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none text-center">
                    <span className="text-[10px] text-slate-400 font-medium uppercase">
                      Total Profesi
                    </span>
                    <span className="text-xl font-black text-slate-800">{dataPekerjaan.length}</span>
                    <span className="text-[10px] text-slate-400">Variasi</span>
                  </div>
                </div>

                {/* Ranked List with Progress Bars */}
                <div className="sm:col-span-7 space-y-2 max-h-64 overflow-y-auto pr-1">
                  {dataPekerjaan.map((item, idx) => (
                    <div
                      key={item.kategori}
                      className="p-2 rounded-lg bg-white border border-slate-200/80 text-xs hover:border-slate-300 transition"
                    >
                      <div className="flex justify-between items-center mb-1">
                        <div className="flex items-center gap-2 truncate">
                          <span
                            className="w-2.5 h-2.5 rounded-full shrink-0"
                            style={{ backgroundColor: item.warna }}
                          />
                          <span className="font-semibold text-slate-800 truncate">
                            {item.kategori}
                          </span>
                        </div>
                        <div className="text-right shrink-0">
                          <span className="font-bold text-slate-900">{item.jumlah}</span>
                          <span className="text-[10px] text-slate-500 ml-1 font-medium">
                            ({item.persentase}%)
                          </span>
                        </div>
                      </div>
                      <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
                        <div
                          className="h-full rounded-full transition-all duration-300"
                          style={{
                            width: `${Math.max(4, item.persentase)}%`,
                            backgroundColor: item.warna,
                          }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Insight Note */}
            <div className="mt-4 pt-3 border-t border-slate-200/80 text-[11px] text-slate-500 flex items-center justify-between">
              <span>
                Profesi terbanyak:{' '}
                <strong className="text-slate-800">
                  {dataPekerjaan[0]?.kategori || '-'}
                </strong>{' '}
                ({dataPekerjaan[0]?.jumlah || 0} orang)
              </span>
              <span className="text-emerald-700 font-medium">
                Aktif bekerja: {rasioProduktifPct}% usia produktif
              </span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
