import React, { useState, useEffect } from 'react';
import {
  Building2,
  Users,
  Shield,
  FileSpreadsheet,
  RefreshCw,
  Download,
  Eye,
  Settings,
  HelpCircle,
  Cloud,
  CloudOff,
  CheckCircle2,
  Loader2,
} from 'lucide-react';
import { PengurusRWInfo } from '../types';
import { StorageService } from '../services/storage';
import {
  subscribeSyncStatus,
  SyncStatus,
  CloudStorageService,
  CLOUD_KEYS,
} from '../services/cloudStorage';
import {
  INFO_RW22,
  DAFTAR_RT,
  INITIAL_WARGA,
  INITIAL_PKK,
  INITIAL_KEGIATAN_PKK,
  INITIAL_POSYANDU,
  INITIAL_JADWAL_POSYANDU,
  INITIAL_TRANSAKSI_KAS,
  INITIAL_LAPORAN,
  INITIAL_INVENTARIS_POSYANDU,
  INITIAL_INVENTARIS_PKK,
} from '../data/initialData';

interface HeaderProps {
  infoRW: PengurusRWInfo;
  isPortalMode: boolean;
  onTogglePortalMode: () => void;
  onDataChange: () => void;
  isPengurusLoggedIn: boolean;
  onOpenLogin: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  infoRW,
  isPortalMode,
  onTogglePortalMode,
  onDataChange,
  isPengurusLoggedIn,
  onOpenLogin,
}) => {
  const [showModalInfo, setShowModalInfo] = useState(false);
  const [syncStatus, setSyncStatus] = useState<SyncStatus>('synced');
  const [syncMessage, setSyncMessage] = useState<string>('');

  useEffect(() => {
    return subscribeSyncStatus((status, msg) => {
      setSyncStatus(status);
      if (msg) setSyncMessage(msg);
    });
  }, []);

  const handleReset = async () => {
    if (
      window.confirm(
        'Apakah Anda yakin ingin mereset seluruh data kembali ke data awal bawaan RW 22 Bumi Pesona Asri?'
      )
    ) {
      StorageService.resetAllData();
      // Re-seed defaults to cloud as well
      await Promise.all([
        CloudStorageService.saveToCloud(CLOUD_KEYS.WARGA, INITIAL_WARGA),
        CloudStorageService.saveToCloud(CLOUD_KEYS.PKK, INITIAL_PKK),
        CloudStorageService.saveToCloud(CLOUD_KEYS.KEGIATAN_PKK, INITIAL_KEGIATAN_PKK),
        CloudStorageService.saveToCloud(CLOUD_KEYS.INVENTARIS_PKK, INITIAL_INVENTARIS_PKK),
        CloudStorageService.saveToCloud(CLOUD_KEYS.POSYANDU, INITIAL_POSYANDU),
        CloudStorageService.saveToCloud(CLOUD_KEYS.JADWAL_POSYANDU, INITIAL_JADWAL_POSYANDU),
        CloudStorageService.saveToCloud(CLOUD_KEYS.INVENTARIS_POSYANDU, INITIAL_INVENTARIS_POSYANDU),
        CloudStorageService.saveToCloud(CLOUD_KEYS.KAS, INITIAL_TRANSAKSI_KAS),
        CloudStorageService.saveToCloud(CLOUD_KEYS.LAPORAN, INITIAL_LAPORAN),
        CloudStorageService.saveToCloud(CLOUD_KEYS.PENGURUS_RW, INFO_RW22),
        CloudStorageService.saveToCloud(CLOUD_KEYS.PENGURUS_RT, DAFTAR_RT),
      ]);
      onDataChange();
    }
  };

  const handleBackup = () => {
    const jsonStr = StorageService.exportFullBackupJSON();
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `backup_sim_rw22_bumi_pesona_asri_${new Date().toISOString().slice(0, 10)}.json`;
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <header className="bg-slate-900 text-white shadow-md border-b border-slate-800">
      {/* Top Banner with Administrative Identity */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3.5">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          
          {/* Logo & Wilayah Identity */}
          <div className="flex items-center space-x-3.5">
            <div className="w-12 h-12 rounded-xl bg-emerald-600/90 border border-emerald-500/40 flex items-center justify-center text-white shadow-inner flex-shrink-0">
              <Building2 className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <span className="bg-emerald-500/20 text-emerald-300 text-xs font-semibold px-2 py-0.5 rounded border border-emerald-500/30">
                  RUKUN WARGA 22
                </span>
                <span className="text-xs text-slate-400">Desa Jelegong • Kec. Rancaekek • Kab. Bandung {infoRW.kodePos}</span>
              </div>
              <h1 className="text-lg sm:text-xl font-bold tracking-tight text-white mt-0.5">
                {infoRW.perumahan}
              </h1>
              <p className="text-xs text-slate-300">
                Sistem Informasi Manajemen Pengurus RW 22 (Membawahi RT 01 s/d RT 09)
              </p>
            </div>
          </div>

          {/* Pengurus Inti Badges & Action Controls */}
          <div className="flex flex-wrap items-center gap-2 sm:gap-3">
            {/* Pejabat RW Info Chip */}
            <div className="hidden lg:flex items-center space-x-3 bg-slate-800/80 px-3 py-1.5 rounded-lg border border-slate-700/60 text-xs">
              <div className="border-r border-slate-700 pr-3">
                <span className="text-slate-400 block text-[10px] uppercase font-medium">Ketua RW 22</span>
                <span className="font-semibold text-emerald-300">{infoRW.ketuaRw}</span>
              </div>
              <div className="border-r border-slate-700 pr-3">
                <span className="text-slate-400 block text-[10px] uppercase font-medium">Sekretaris</span>
                <span className="font-semibold text-slate-200">{infoRW.sekretaris}</span>
              </div>
              <div>
                <span className="text-slate-400 block text-[10px] uppercase font-medium">Bendahara</span>
                <span className="font-semibold text-amber-300">{infoRW.bendahara}</span>
              </div>
            </div>

            {/* Cloud Sync Status Indicator */}
            <div
              className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs border font-medium transition-all ${
                syncStatus === 'syncing'
                  ? 'bg-amber-950/60 border-amber-500/40 text-amber-200 animate-pulse'
                  : syncStatus === 'error' || syncStatus === 'offline'
                  ? 'bg-rose-950/60 border-rose-500/40 text-rose-200'
                  : 'bg-emerald-950/50 border-emerald-500/40 text-emerald-200'
              }`}
              title={syncMessage || 'Penyimpanan Cloud Firestore aktif'}
            >
              {syncStatus === 'syncing' ? (
                <Loader2 className="w-3.5 h-3.5 animate-spin text-amber-400" />
              ) : syncStatus === 'offline' || syncStatus === 'error' ? (
                <CloudOff className="w-3.5 h-3.5 text-rose-400" />
              ) : (
                <Cloud className="w-3.5 h-3.5 text-emerald-400" />
              )}
              <span className="hidden sm:inline">
                {syncStatus === 'syncing'
                  ? 'Sinkron Cloud...'
                  : syncStatus === 'offline'
                  ? 'Offline (Lokal)'
                  : 'Cloud Aktif'}
              </span>
            </div>

            {/* Mode Switcher / Login */}
            {!isPengurusLoggedIn ? (
              isPortalMode && (
                <button
                  id="btn-login-admin"
                  onClick={onOpenLogin}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all shadow-sm bg-emerald-600 text-white hover:bg-emerald-500"
                  title="Login Admin RW 22"
                >
                  <Shield className="w-3.5 h-3.5" />
                  <span>Login Admin</span>
                </button>
              )
            ) : (
              <button
                id="btn-toggle-portal"
                onClick={onTogglePortalMode}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all shadow-sm ${
                  isPortalMode
                    ? 'bg-amber-500 text-slate-950 font-semibold hover:bg-amber-400'
                    : 'bg-emerald-600 text-white hover:bg-emerald-500'
                }`}
                title={isPortalMode ? "Masuk ke Dashboard Admin" : "Lihat Portal Transparansi Warga"}
              >
                <Eye className="w-3.5 h-3.5" />
                <span>{isPortalMode ? 'Dashboard Admin' : 'Portal Transparansi Warga'}</span>
              </button>
            )}

            {/* Quick backup button */}
            <button
              id="btn-backup-data"
              onClick={handleBackup}
              className="p-1.5 text-slate-400 hover:text-white bg-slate-800 hover:bg-slate-700 rounded-lg border border-slate-700 transition"
              title="Unduh Cadangan Data (JSON Backup)"
            >
              <Download className="w-4 h-4" />
            </button>

            {/* Reset data to default button */}
            <button
              id="btn-reset-data"
              onClick={handleReset}
              className="p-1.5 text-slate-400 hover:text-rose-400 bg-slate-800 hover:bg-slate-700 rounded-lg border border-slate-700 transition"
              title="Reset ke Data Bawaan Awal"
            >
              <RefreshCw className="w-4 h-4" />
            </button>

            <button
              id="btn-help-info"
              onClick={() => setShowModalInfo(true)}
              className="p-1.5 text-slate-400 hover:text-white bg-slate-800 hover:bg-slate-700 rounded-lg border border-slate-700 transition"
              title="Informasi Wilayah & Pengurus"
            >
              <HelpCircle className="w-4 h-4" />
            </button>
          </div>

        </div>
      </div>

      {/* Info Modal */}
      {showModalInfo && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
          <div className="bg-white text-slate-900 rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-200">
            <div className="flex justify-between items-start mb-4">
              <div>
                <span className="text-xs font-semibold text-emerald-700 uppercase tracking-wider bg-emerald-50 px-2 py-0.5 rounded">
                  Profil Lembaga
                </span>
                <h3 className="text-lg font-bold text-slate-900 mt-1">
                  RUKUN WARGA 22 BUMI PESONA ASRI
                </h3>
                <p className="text-xs text-slate-500">
                  Desa Jelegong, Kec. Rancaekek, Kab. Bandung 40394
                </p>
              </div>
              <button
                onClick={() => setShowModalInfo(false)}
                className="text-slate-400 hover:text-slate-600 text-lg font-bold p-1"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3.5 text-xs text-slate-700">
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                <p className="font-semibold text-slate-900 text-sm mb-2">Pengurus Harian RW 22:</p>
                <div className="grid grid-cols-3 gap-2 text-center">
                  <div className="p-2 bg-white rounded-lg border border-slate-200">
                    <span className="text-[10px] text-slate-400 block uppercase">Ketua RW</span>
                    <strong className="text-emerald-700 text-xs">{infoRW.ketuaRw}</strong>
                  </div>
                  <div className="p-2 bg-white rounded-lg border border-slate-200">
                    <span className="text-[10px] text-slate-400 block uppercase">Sekretaris</span>
                    <strong className="text-slate-800 text-xs">{infoRW.sekretaris}</strong>
                  </div>
                  <div className="p-2 bg-white rounded-lg border border-slate-200">
                    <span className="text-[10px] text-slate-400 block uppercase">Bendahara</span>
                    <strong className="text-amber-700 text-xs">{infoRW.bendahara}</strong>
                  </div>
                </div>
              </div>

              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-1.5">
                <p className="font-semibold text-slate-900">Alamat Sekretariat & Kontak:</p>
                <p className="text-slate-600">{infoRW.alamatSekretariat}</p>
                <p className="text-slate-600 font-mono">Telepon / WhatsApp: {infoRW.kontakSekretariat}</p>
                <p className="text-emerald-700 font-medium">Wilayah Binaan: 9 Rukun Tetangga (RT 01 s/d RT 09)</p>
              </div>

              <div className="p-3 bg-emerald-50 rounded-xl border border-emerald-200 text-emerald-900 text-xs">
                <p className="font-semibold mb-1">Aplikasi Webapp Manajemen RW 22 mencakup:</p>
                <ul className="list-disc pl-4 space-y-0.5 text-slate-700">
                  <li>Pendataan warga dengan fitur import data format RT 01 - RT 09</li>
                  <li>Manajemen PKK (Struktur Pokja I - IV & agenda kerja)</li>
                  <li>Sistem Posyandu Melati (Balita & Lansia, monitoring tumbuh kembang & tensi)</li>
                  <li>Buku Keuangan Kas RW (Setoran iuran per RT & pengeluaran)</li>
                  <li>Modul Laporan Bulanan Resmi Warga (Print-ready & Transparansi Publik)</li>
                </ul>
              </div>
            </div>

            <div className="mt-5 flex justify-end">
              <button
                onClick={() => setShowModalInfo(false)}
                className="px-4 py-2 bg-slate-900 text-white rounded-xl text-xs font-semibold hover:bg-slate-800 transition"
              >
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}
    </header>
  );
};
