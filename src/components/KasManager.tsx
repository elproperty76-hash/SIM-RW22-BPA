import React, { useState, useMemo } from 'react';
import {
  Wallet,
  ArrowUpRight,
  ArrowDownRight,
  Plus,
  Filter,
  Download,
  Printer,
  Calendar,
  CheckCircle2,
  AlertCircle,
  FileSpreadsheet,
  X,
  UserCheck,
} from 'lucide-react';
import {
  TransaksiKas,
  KategoriKas,
  RTNumber,
  PengurusRWInfo,
  PengurusRTInfo,
  Warga,
} from '../types';
import { formatRupiah, formatDateIndo, exportToCSV } from '../utils/formatters';

interface KasManagerProps {
  kasList: TransaksiKas[];
  onSaveKas: (list: TransaksiKas[]) => void;
  infoRW: PengurusRWInfo;
  daftarRT: PengurusRTInfo[];
  warga: Warga[];
}

export const KasManager: React.FC<KasManagerProps> = ({
  kasList,
  onSaveKas,
  infoRW,
  daftarRT,
  warga,
}) => {
  const [filterJenis, setFilterJenis] = useState<'ALL' | 'Masuk' | 'Keluar'>('ALL');
  const [filterKategori, setFilterKategori] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  // New Transaction Form
  const [newTx, setNewTx] = useState<Partial<TransaksiKas>>({
    tanggal: new Date().toISOString().slice(0, 10),
    jenis: 'Masuk',
    kategori: 'Iuran Warga',
    rtAsal: 1,
    keterangan: '',
    nominal: 1000000,
    penanggungJawab: `${infoRW.bendahara} (Bendahara)`,
    nomorBukti: `BKM-${new Date().getFullYear()}/${(new Date().getMonth() + 1).toString().padStart(2, '0')}/011`,
  });

  // Calculations
  const totalMasuk = useMemo(() => {
    return kasList
      .filter((k) => k.jenis === 'Masuk')
      .reduce((sum, item) => sum + item.nominal, 0);
  }, [kasList]);

  const totalKeluar = useMemo(() => {
    return kasList
      .filter((k) => k.jenis === 'Keluar')
      .reduce((sum, item) => sum + item.nominal, 0);
  }, [kasList]);

  const saldoKas = totalMasuk - totalKeluar;

  // Filtered transactions
  const filteredKas = useMemo(() => {
    return kasList.filter((item) => {
      if (filterJenis !== 'ALL' && item.jenis !== filterJenis) return false;
      if (filterKategori !== 'ALL' && item.kategori !== filterKategori) return false;
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        return (
          item.keterangan.toLowerCase().includes(q) ||
          item.nomorBukti.toLowerCase().includes(q) ||
          item.penanggungJawab.toLowerCase().includes(q)
        );
      }
      return true;
    });
  }, [kasList, filterJenis, filterKategori, searchQuery]);

  const handleCreateTransaction = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTx.nominal || !newTx.keterangan) return;

    const item: TransaksiKas = {
      id: `kas-${Date.now()}`,
      tanggal: newTx.tanggal || new Date().toISOString().slice(0, 10),
      jenis: (newTx.jenis || 'Masuk') as 'Masuk' | 'Keluar',
      kategori: (newTx.kategori || 'Iuran Warga') as KategoriKas,
      rtAsal: newTx.jenis === 'Masuk' && newTx.kategori === 'Iuran Warga' ? newTx.rtAsal : undefined,
      keterangan: newTx.keterangan,
      nominal: Number(newTx.nominal),
      penanggungJawab: newTx.penanggungJawab || infoRW.bendahara,
      nomorBukti: newTx.nomorBukti || `BKM-${Date.now()}`,
    };

    onSaveKas([item, ...kasList]);
    setIsAddModalOpen(false);
  };

  const handleExportCSV = () => {
    const headers = [
      'No',
      'Nomor Bukti',
      'Tanggal',
      'Jenis',
      'Kategori',
      'RT Asal',
      'Uraian Keterangan',
      'Nominal (Rp)',
      'Penanggung Jawab',
    ];

    const rows = filteredKas.map((k, idx) => [
      idx + 1,
      k.nomorBukti,
      k.tanggal,
      k.jenis,
      k.kategori,
      k.rtAsal ? `RT 0${k.rtAsal}` : '-',
      k.keterangan,
      k.nominal,
      k.penanggungJawab,
    ]);

    exportToCSV(
      `buku_kas_rw22_bumi_pesona_asri_${new Date().toISOString().slice(0, 10)}.csv`,
      [headers, ...rows]
    );
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-6">
      {/* Top Banner & Summary */}
      <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-3">
          <div>
            <span className="text-[10px] font-bold text-amber-700 uppercase tracking-wider bg-amber-50 px-2.5 py-0.5 rounded">
              Pertanggungjawaban Keuangan RW 22
            </span>
            <h2 className="text-lg font-bold text-slate-900 mt-1 flex items-center gap-2">
              <Wallet className="w-5 h-5 text-amber-600" />
              <span>Buku Kas RW 22 Bumi Pesona Asri Desa Jelegong</span>
            </h2>
            <p className="text-xs text-slate-500">
              Pengelola Keuangan: <strong>{infoRW.bendahara} (Bendahara RW 22)</strong> • Rekapitulasi Iuran RT 01 s/d RT 09 & Belanja Operasional
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              id="btn-add-kas"
              onClick={() => setIsAddModalOpen(true)}
              className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-semibold shadow-xs transition flex items-center gap-1.5"
            >
              <Plus className="w-4 h-4" />
              <span>Catat Kas Masuk / Keluar</span>
            </button>
            <button
              onClick={handleExportCSV}
              className="p-2 border border-slate-300 hover:bg-slate-50 text-slate-700 rounded-xl text-xs font-medium transition"
              title="Ekspor CSV"
            >
              <Download className="w-4 h-4" />
            </button>
            <button
              onClick={handlePrint}
              className="p-2 border border-slate-300 hover:bg-slate-50 text-slate-700 rounded-xl text-xs font-medium transition"
              title="Cetak Laporan Kas"
            >
              <Printer className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* 3 Metric Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider block">
              Saldo Kas RW Berjalan
            </span>
            <h3 className="text-2xl font-extrabold text-slate-900 mt-1">
              {formatRupiah(saldoKas)}
            </h3>
            <p className="text-[11px] text-slate-500 mt-1">
              Tersimpan di Rekening Kas RW 22 & Kas Tunai Sekretariat
            </p>
          </div>

          <div className="p-4 rounded-xl bg-emerald-50/60 border border-emerald-200">
            <div className="flex justify-between items-start">
              <span className="text-xs font-semibold text-emerald-800 uppercase tracking-wider block">
                Total Pemasukan
              </span>
              <ArrowUpRight className="w-4 h-4 text-emerald-700" />
            </div>
            <h3 className="text-2xl font-extrabold text-emerald-900 mt-1">
              {formatRupiah(totalMasuk)}
            </h3>
            <p className="text-[11px] text-emerald-700 mt-1">
              Iuran rutin RT 01-09, dana desa & donasi swadaya
            </p>
          </div>

          <div className="p-4 rounded-xl bg-rose-50/60 border border-rose-200">
            <div className="flex justify-between items-start">
              <span className="text-xs font-semibold text-rose-800 uppercase tracking-wider block">
                Total Pengeluaran
              </span>
              <ArrowDownRight className="w-4 h-4 text-rose-700" />
            </div>
            <h3 className="text-2xl font-extrabold text-rose-900 mt-1">
              {formatRupiah(totalKeluar)}
            </h3>
            <p className="text-[11px] text-rose-700 mt-1">
              Honor keamanan ronda, armada sampah & PJU fasum
            </p>
          </div>
        </div>
      </div>

      {/* Rekap Setoran Iuran RT 01 s/d RT 09 */}
      <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs space-y-3">
        <div className="flex justify-between items-center border-b border-slate-100 pb-3">
          <div>
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span>Monitoring Iuran Kas Warga dari 9 Pengurus RT (Bulan Berjalan)</span>
            </h3>
            <p className="text-xs text-slate-500">
              Patokan iuran lingkungan kas RW: Rp 25.000 / KK / bulan
            </p>
          </div>
          <span className="text-xs font-semibold text-slate-600 bg-slate-100 px-2.5 py-1 rounded-lg">
            9 RT Binaan
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {daftarRT.map((rtItem) => {
            const wargaDiRT = warga.filter((w) => w.rt === rtItem.rt);
            const totalKK = wargaDiRT.filter((w) => w.statusDalamKeluarga === 'Kepala Keluarga').length || 45;
            
            // Sum transactions for this RT
            const totalSetoranRT = kasList
              .filter((k) => k.jenis === 'Masuk' && k.rtAsal === rtItem.rt)
              .reduce((s, item) => s + item.nominal, 0);

            const isLunas = totalSetoranRT > 0;

            return (
              <div
                key={rtItem.rt}
                className="p-3 bg-slate-50 rounded-xl border border-slate-200 flex flex-col justify-between"
              >
                <div>
                  <div className="flex justify-between items-center">
                    <span className="px-2 py-0.5 rounded font-bold text-xs bg-emerald-700 text-white">
                      RT 0{rtItem.rt}
                    </span>
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-semibold ${
                        isLunas ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                      }`}
                    >
                      {isLunas ? 'Sudah Setor' : 'Menunggu Setoran'}
                    </span>
                  </div>

                  <div className="mt-2">
                    <span className="text-[11px] text-slate-500 block">Ketua RT: {rtItem.namaKetua}</span>
                    <span className="text-sm font-bold text-slate-900 block mt-0.5">
                      {formatRupiah(totalSetoranRT)}
                    </span>
                  </div>
                </div>

                <div className="mt-2 pt-2 border-t border-slate-200 text-[11px] text-slate-500 flex justify-between">
                  <span>Target KK: ~{totalKK} KK</span>
                  <span className="font-semibold text-slate-700">{rtItem.blokWilayah}</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Filter & Table of Transactions */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        {/* Table Filter Controls */}
        <div className="p-4 bg-slate-50 border-b border-slate-200 flex flex-wrap gap-2.5 items-center justify-between">
          <div className="flex flex-wrap gap-2 items-center flex-1">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Cari uraian, nomor bukti..."
              className="px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-xs w-60 focus:ring-2 focus:ring-emerald-500 outline-hidden"
            />

            <select
              value={filterJenis}
              onChange={(e) => setFilterJenis(e.target.value as any)}
              className="px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-xs outline-hidden"
            >
              <option value="ALL">Semua Jenis (Masuk & Keluar)</option>
              <option value="Masuk">Kas Masuk (Pemasukan)</option>
              <option value="Keluar">Kas Keluar (Pengeluaran)</option>
            </select>

            <select
              value={filterKategori}
              onChange={(e) => setFilterKategori(e.target.value)}
              className="px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-xs outline-hidden"
            >
              <option value="ALL">Semua Kategori Belanja/Penerimaan</option>
              <option value="Iuran Warga">Iuran Warga RT 01 - 09</option>
              <option value="Dana Desa / Bantuan">Dana Desa / Bantuan</option>
              <option value="Kebersihan & Sampah">Kebersihan & Sampah</option>
              <option value="Keamanan & Ronda">Keamanan & Ronda</option>
              <option value="Penerangan & Fasum">Penerangan & Fasum</option>
              <option value="Kegiatan Warga / PHBN">Kegiatan Warga / PHBN</option>
              <option value="Operasional Sekretariat">Operasional Sekretariat</option>
            </select>
          </div>

          <span className="text-xs text-slate-500 font-medium">
            {filteredKas.length} catatan transaksi
          </span>
        </div>

        {/* Transactions Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs sm:text-sm">
            <thead className="bg-slate-100 text-slate-600 font-semibold uppercase text-[11px] tracking-wider border-b border-slate-200">
              <tr>
                <th className="py-3 px-3.5">No. Bukti / Tanggal</th>
                <th className="py-3 px-3">Kategori</th>
                <th className="py-3 px-3">Uraian Keterangan Transaksi</th>
                <th className="py-3 px-3">Penanggung Jawab</th>
                <th className="py-3 px-3.5 text-right">Nominal (Rp)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredKas.map((item) => {
                const isMasuk = item.jenis === 'Masuk';
                return (
                  <tr key={item.id} className="hover:bg-slate-50/80 transition">
                    {/* No Bukti & Tanggal */}
                    <td className="py-3 px-3.5">
                      <span className="font-mono text-xs font-semibold text-slate-900 block">
                        {item.nomorBukti}
                      </span>
                      <span className="text-[11px] text-slate-500">
                        {formatDateIndo(item.tanggal)}
                      </span>
                    </td>

                    {/* Kategori */}
                    <td className="py-3 px-3">
                      <span
                        className={`inline-block px-2 py-0.5 rounded text-[10px] font-semibold ${
                          isMasuk
                            ? 'bg-emerald-100 text-emerald-800'
                            : 'bg-rose-100 text-rose-800'
                        }`}
                      >
                        {item.kategori}
                      </span>
                      {item.rtAsal && (
                        <span className="block mt-0.5 text-[10px] font-bold text-slate-500">
                          Asal RT 0{item.rtAsal}
                        </span>
                      )}
                    </td>

                    {/* Uraian */}
                    <td className="py-3 px-3 text-slate-700 font-medium max-w-md">
                      {item.keterangan}
                    </td>

                    {/* Penanggung Jawab */}
                    <td className="py-3 px-3 text-xs text-slate-600">
                      {item.penanggungJawab}
                    </td>

                    {/* Nominal */}
                    <td className="py-3 px-3.5 text-right whitespace-nowrap">
                      <span
                        className={`font-bold text-sm ${
                          isMasuk ? 'text-emerald-700' : 'text-rose-700'
                        }`}
                      >
                        {isMasuk ? '+' : '-'} {formatRupiah(item.nominal)}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Official Footer Verification Card */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 flex flex-col sm:flex-row justify-between items-center gap-3 text-xs text-slate-600">
          <div>
            <span>
              Laporan Keuangan Disahkan oleh <strong>Ketua RW 22 ({infoRW.ketuaRw})</strong> dan{' '}
              <strong>Bendahara ({infoRW.bendahara})</strong>
            </span>
          </div>
          <div className="flex gap-4 font-mono text-[11px]">
            <span>Total Masuk: <strong className="text-emerald-700">{formatRupiah(totalMasuk)}</strong></span>
            <span>Total Keluar: <strong className="text-rose-700">{formatRupiah(totalKeluar)}</strong></span>
          </div>
        </div>
      </div>

      {/* Modal Catat Transaksi Baru */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-5 shadow-2xl border border-slate-200">
            <div className="flex justify-between items-center border-b border-slate-100 pb-3 mb-4">
              <h3 className="text-base font-bold text-slate-900">
                Pencatatan Transaksi Kas RW 22
              </h3>
              <button onClick={() => setIsAddModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateTransaction} className="space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Jenis Transaksi *</label>
                  <select
                    value={newTx.jenis || 'Masuk'}
                    onChange={(e) => {
                      const val = e.target.value as 'Masuk' | 'Keluar';
                      setNewTx({
                        ...newTx,
                        jenis: val,
                        kategori: val === 'Masuk' ? 'Iuran Warga' : 'Keamanan & Ronda',
                        nomorBukti: `${val === 'Masuk' ? 'BKM' : 'BKK'}-${new Date().getFullYear()}/${(new Date().getMonth() + 1).toString().padStart(2, '0')}/${Math.floor(Math.random() * 899 + 100)}`,
                      });
                    }}
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl outline-hidden font-semibold bg-white"
                  >
                    <option value="Masuk">Kas Masuk (Pemasukan)</option>
                    <option value="Keluar">Kas Keluar (Pengeluaran)</option>
                  </select>
                </div>

                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Nomor Bukti Kas *</label>
                  <input
                    type="text"
                    required
                    value={newTx.nomorBukti || ''}
                    onChange={(e) => setNewTx({ ...newTx, nomorBukti: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl font-mono outline-hidden"
                  />
                </div>
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">Kategori Transaksi *</label>
                <select
                  value={newTx.kategori || 'Iuran Warga'}
                  onChange={(e) => setNewTx({ ...newTx, kategori: e.target.value as any })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl outline-hidden bg-white"
                >
                  {newTx.jenis === 'Masuk' ? (
                    <>
                      <option value="Iuran Warga">Iuran Warga Bulanan</option>
                      <option value="Dana Desa / Bantuan">Dana Desa / Bantuan Pemerintah</option>
                      <option value="Donasi / Swadaya">Donasi / Swadaya Warga</option>
                    </>
                  ) : (
                    <>
                      <option value="Keamanan & Ronda">Keamanan & Pos Ronda</option>
                      <option value="Kebersihan & Sampah">Kebersihan & Armada Sampah</option>
                      <option value="Penerangan & Fasum">Penerangan Jalan (PJU) & Fasilitas Umum</option>
                      <option value="Kegiatan Warga / PHBN">Kegiatan Warga / Posyandu / PHBN</option>
                      <option value="Sosial & Santunan">Sosial & Santunan Warga Sakit/Duka</option>
                      <option value="Operasional Sekretariat">Operasional Balai RW & ATK</option>
                    </>
                  )}
                </select>
              </div>

              {newTx.jenis === 'Masuk' && newTx.kategori === 'Iuran Warga' && (
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Asal Setoran RT</label>
                  <select
                    value={newTx.rtAsal || 1}
                    onChange={(e) => setNewTx({ ...newTx, rtAsal: Number(e.target.value) as RTNumber })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl outline-hidden bg-white"
                  >
                    {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((rt) => (
                      <option key={rt} value={rt}>
                        RT 0{rt} (Pengurus RT 0{rt})
                      </option>
                    ))}
                  </select>
                </div>
              )}

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Tanggal</label>
                  <input
                    type="date"
                    required
                    value={newTx.tanggal || ''}
                    onChange={(e) => setNewTx({ ...newTx, tanggal: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl outline-hidden bg-white"
                  />
                </div>
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Nominal (Rp) *</label>
                  <input
                    type="number"
                    required
                    value={newTx.nominal || ''}
                    onChange={(e) => setNewTx({ ...newTx, nominal: Number(e.target.value) })}
                    placeholder="Contoh: 1250000"
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl outline-hidden font-bold"
                  />
                </div>
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">Uraian Keterangan *</label>
                <textarea
                  rows={3}
                  required
                  value={newTx.keterangan || ''}
                  onChange={(e) => setNewTx({ ...newTx, keterangan: e.target.value })}
                  placeholder="Penjelasan rinci penggunaan anggaran atau sumber dana..."
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl outline-hidden"
                />
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">Penanggung Jawab / Penerima</label>
                <input
                  type="text"
                  value={newTx.penanggungJawab || ''}
                  onChange={(e) => setNewTx({ ...newTx, penanggungJawab: e.target.value })}
                  placeholder="Dadi Suhendar (Bendahara)"
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl outline-hidden"
                />
              </div>

              <div className="pt-3 border-t border-slate-100 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2 border border-slate-300 text-slate-700 rounded-xl"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold rounded-xl"
                >
                  Simpan Transaksi Kas
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
