import React, { useState, useEffect } from 'react';
import { StorageService } from './services/storage';
import { CloudStorageService, CLOUD_KEYS } from './services/cloudStorage';
import {
  Warga,
  AnggotaPKK,
  KegiatanPKK,
  PasienPosyandu,
  JadwalPosyandu,
  TransaksiKas,
  LaporanBulanan,
  PengurusRWInfo,
  PengurusRTInfo,
  PengurusPosyandu,
  RTNumber,
  ItemInventaris,
} from './types';
import { Header } from './components/Header';
import { Navigation, TabKey } from './components/Navigation';
import { DashboardOverview } from './components/DashboardOverview';
import { WargaManager } from './components/WargaManager';
import { PengurusManager } from './components/PengurusManager';
import { PkkManager } from './components/PkkManager';
import { PosyanduManager } from './components/PosyanduManager';
import { KasManager } from './components/KasManager';
import { LaporanBulananManager } from './components/LaporanBulananManager';
import { PortalWargaView } from './components/PortalWargaView';

export default function App() {
  // Application Data States (synced with localStorage & Cloud Firestore)
  const [infoRW, setInfoRW] = useState<PengurusRWInfo>(StorageService.getInfoRW());
  const [daftarRT, setDaftarRT] = useState<PengurusRTInfo[]>(StorageService.getDaftarRT());
  const [pengurusPosyandu, setPengurusPosyandu] = useState<PengurusPosyandu[]>(StorageService.getPengurusPosyandu());
  const [warga, setWarga] = useState<Warga[]>(StorageService.getWarga());
  const [pkkList, setPkkList] = useState<AnggotaPKK[]>(StorageService.getPKK());
  const [kegiatanPKK, setKegiatanPKK] = useState<KegiatanPKK[]>(StorageService.getKegiatanPKK());
  const [posyanduList, setPosyanduList] = useState<PasienPosyandu[]>(StorageService.getPosyandu());
  const [jadwalPosyandu, setJadwalPosyandu] = useState<JadwalPosyandu[]>(StorageService.getJadwalPosyandu());
  const [inventarisPosyandu, setInventarisPosyandu] = useState<ItemInventaris[]>(StorageService.getInventarisPosyandu());
  const [inventarisPKK, setInventarisPKK] = useState<ItemInventaris[]>(StorageService.getInventarisPKK());
  const [kasList, setKasList] = useState<TransaksiKas[]>(StorageService.getKas());
  const [laporanList, setLaporanList] = useState<LaporanBulanan[]>(StorageService.getLaporan());

  // UI Navigation State
  const [activeTab, setActiveTab] = useState<TabKey>('dashboard');
  const [isPortalMode, setIsPortalMode] = useState<boolean>(false);
  const [selectedRtFilter, setSelectedRtFilter] = useState<RTNumber | 'ALL'>('ALL');
  const [isImportModalOpen, setIsImportModalOpen] = useState<boolean>(false);

  // Pengurus Login Authentication State
  const [isPengurusLoggedIn, setIsPengurusLoggedIn] = useState<boolean>(false);
  const [isPengurusLoginModalOpen, setIsPengurusLoginModalOpen] = useState<boolean>(false);
  const [loginUsername, setLoginUsername] = useState<string>('');
  const [loginPassword, setLoginPassword] = useState<string>('');
  const [loginError, setLoginError] = useState<string | null>(null);

  const handleTabChange = (tab: TabKey) => {
    if (tab === 'pengurus' && !isPengurusLoggedIn) {
      setIsPengurusLoginModalOpen(true);
      return;
    }
    if (tab === 'portal') {
      setIsPortalMode(true);
    } else {
      setIsPortalMode(false);
      setActiveTab(tab);
    }
  };

  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (loginUsername === 'admin' && loginPassword === 'rw22123') {
      setIsPengurusLoggedIn(true);
      setIsPengurusLoginModalOpen(false);
      setLoginError(null);
      setLoginUsername('');
      setLoginPassword('');
      setIsPortalMode(false);
      setActiveTab('pengurus');
    } else {
      setLoginError('Username atau password salah.');
    }
  };

  // Load from Cloud Firestore on startup to ensure data reflects latest cloud storage
  useEffect(() => {
    let isMounted = true;
    async function loadCloudState() {
      try {
        const cloud = await CloudStorageService.loadAllInitialData();
        if (isMounted) {
          setInfoRW(cloud.infoRW);
          setDaftarRT(cloud.daftarRT);
          setPengurusPosyandu(cloud.pengurusPosyandu || StorageService.getPengurusPosyandu());
          setWarga(cloud.warga);
          setPkkList(cloud.pkk);
          setKegiatanPKK(cloud.kegiatanPKK);
          setInventarisPKK(cloud.inventarisPKK);
          setPosyanduList(cloud.posyandu);
          setJadwalPosyandu(cloud.jadwalPosyandu);
          setInventarisPosyandu(cloud.inventarisPosyandu);
          setKasList(cloud.kas);
          setLaporanList(cloud.laporan);

          // Also mirror to StorageService
          StorageService.savePengurusRW(cloud.infoRW);
          StorageService.saveDaftarRT(cloud.daftarRT);
          if (cloud.pengurusPosyandu) StorageService.savePengurusPosyandu(cloud.pengurusPosyandu);
          StorageService.saveWarga(cloud.warga);
          StorageService.savePKK(cloud.pkk);
          StorageService.saveKegiatanPKK(cloud.kegiatanPKK);
          StorageService.saveInventarisPKK(cloud.inventarisPKK);
          StorageService.savePosyandu(cloud.posyandu);
          StorageService.saveJadwalPosyandu(cloud.jadwalPosyandu);
          StorageService.saveInventarisPosyandu(cloud.inventarisPosyandu);
          StorageService.saveKas(cloud.kas);
          StorageService.saveLaporan(cloud.laporan);
        }
      } catch (err) {
        console.warn('Gagal memuat sinkronisasi Cloud Firestore:', err);
      }
    }

    loadCloudState();

    return () => {
      isMounted = false;
    };
  }, []);

  // Reload all data from storage (used on reset or import)
  const refreshAllData = () => {
    setInfoRW(StorageService.getInfoRW());
    setDaftarRT(StorageService.getDaftarRT());
    setPengurusPosyandu(StorageService.getPengurusPosyandu());
    setWarga(StorageService.getWarga());
    setPkkList(StorageService.getPKK());
    setKegiatanPKK(StorageService.getKegiatanPKK());
    setPosyanduList(StorageService.getPosyandu());
    setJadwalPosyandu(StorageService.getJadwalPosyandu());
    setInventarisPosyandu(StorageService.getInventarisPosyandu());
    setInventarisPKK(StorageService.getInventarisPKK());
    setKasList(StorageService.getKas());
    setLaporanList(StorageService.getLaporan());
  };

  // Updaters with storage sync & Cloud Firestore persistence
  const handleSaveRW = (info: PengurusRWInfo) => {
    StorageService.savePengurusRW(info);
    CloudStorageService.saveToCloud(CLOUD_KEYS.PENGURUS_RW, info);
    setInfoRW(info);
  };

  const handleSaveRT = (list: PengurusRTInfo[]) => {
    StorageService.saveDaftarRT(list);
    CloudStorageService.saveToCloud(CLOUD_KEYS.PENGURUS_RT, list);
    setDaftarRT(list);
  };

  const handleSavePengurusPosyandu = (list: PengurusPosyandu[]) => {
    StorageService.savePengurusPosyandu(list);
    CloudStorageService.saveToCloud(CLOUD_KEYS.PENGURUS_POSYANDU, list);
    setPengurusPosyandu(list);
  };

  const handleSaveWarga = (newList: Warga[]) => {
    StorageService.saveWarga(newList);
    CloudStorageService.saveToCloud(CLOUD_KEYS.WARGA, newList);
    setWarga(newList);
  };

  const handleSavePkk = (newList: AnggotaPKK[]) => {
    StorageService.savePKK(newList);
    CloudStorageService.saveToCloud(CLOUD_KEYS.PKK, newList);
    setPkkList(newList);
  };

  const handleSaveKegiatanPkk = (newList: KegiatanPKK[]) => {
    StorageService.saveKegiatanPKK(newList);
    CloudStorageService.saveToCloud(CLOUD_KEYS.KEGIATAN_PKK, newList);
    setKegiatanPKK(newList);
  };

  const handleSaveInventarisPKK = (newList: ItemInventaris[]) => {
    StorageService.saveInventarisPKK(newList);
    CloudStorageService.saveToCloud(CLOUD_KEYS.INVENTARIS_PKK, newList);
    setInventarisPKK(newList);
  };

  const handleSavePosyandu = (newList: PasienPosyandu[]) => {
    StorageService.savePosyandu(newList);
    CloudStorageService.saveToCloud(CLOUD_KEYS.POSYANDU, newList);
    setPosyanduList(newList);
  };

  const handleSaveJadwalPosyandu = (newList: JadwalPosyandu[]) => {
    StorageService.saveJadwalPosyandu(newList);
    CloudStorageService.saveToCloud(CLOUD_KEYS.JADWAL_POSYANDU, newList);
    setJadwalPosyandu(newList);
  };

  const handleSaveInventarisPosyandu = (newList: ItemInventaris[]) => {
    StorageService.saveInventarisPosyandu(newList);
    CloudStorageService.saveToCloud(CLOUD_KEYS.INVENTARIS_POSYANDU, newList);
    setInventarisPosyandu(newList);
  };

  const handleSaveKas = (newList: TransaksiKas[]) => {
    StorageService.saveKas(newList);
    CloudStorageService.saveToCloud(CLOUD_KEYS.KAS, newList);
    setKasList(newList);
  };

  const handleSaveLaporan = (newList: LaporanBulanan[]) => {
    StorageService.saveLaporan(newList);
    CloudStorageService.saveToCloud(CLOUD_KEYS.LAPORAN, newList);
    setLaporanList(newList);
  };

  const handleNavigateToWargaRT = (rt: RTNumber) => {
    setSelectedRtFilter(rt);
    setActiveTab('warga');
  };



  return (
    <div className="min-h-screen bg-slate-100/70 text-slate-900 flex flex-col font-sans antialiased">
      {/* Top Application Header */}
      <Header
        infoRW={infoRW}
        isPortalMode={isPortalMode}
        onTogglePortalMode={() => setIsPortalMode(!isPortalMode)}
        onDataChange={refreshAllData}
      />

      {/* Main Tab Navigation Bar */}
      {!isPortalMode && (
        <Navigation
          activeTab={activeTab}
          onSelectTab={handleTabChange}
          counts={{
            warga: warga.length,
            pengurus: 1 + daftarRT.length + pkkList.length + pengurusPosyandu.length,
            pkk: pkkList.length,
            posyandu: posyanduList.length,
            transaksi: kasList.length,
            laporan: laporanList.length,
          }}
        />
      )}

      {/* Primary Content Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-3 sm:px-6 lg:px-8 py-5 sm:py-7">
        {isPortalMode ? (
          /* Portal Warga (Mode Transparansi Publik) */
          <PortalWargaView
            infoRW={infoRW}
            daftarRT={daftarRT}
            laporan={laporanList}
            kas={kasList}
            jadwalPosyandu={jadwalPosyandu}
            kegiatanPKK={kegiatanPKK}
            onOpenLogin={() => setIsPengurusLoginModalOpen(true)}
          />
        ) : (
          <>
            {/* Tab: Dashboard Overview */}
            {activeTab === 'dashboard' && (
              <DashboardOverview
                infoRW={infoRW}
                daftarRT={daftarRT}
                warga={warga}
                kas={kasList}
                laporan={laporanList}
                posyandu={posyanduList}
                pkk={pkkList}
                onNavigateToWargaRT={handleNavigateToWargaRT}
                onOpenImportModal={() => setIsImportModalOpen(true)}
                onSelectTab={handleTabChange}
              />
            )}

            {/* Tab: Warga & Import Data RT 1-9 */}
            {activeTab === 'warga' && (
              <WargaManager
                warga={warga}
                daftarRT={daftarRT}
                onSaveWarga={handleSaveWarga}
                selectedRtFilter={selectedRtFilter}
                onRtFilterChange={setSelectedRtFilter}
                isImportModalOpen={isImportModalOpen}
                setIsImportModalOpen={setIsImportModalOpen}
              />
            )}

            {/* Tab: Kelola Pengurus RW, RT, PKK, Posyandu */}
            {activeTab === 'pengurus' && (
              <PengurusManager
                infoRW={infoRW}
                daftarRT={daftarRT}
                pkkList={pkkList}
                pengurusPosyandu={pengurusPosyandu}
                onSaveRW={handleSaveRW}
                onSaveRT={handleSaveRT}
                onSavePKK={handleSavePkk}
                onSavePosyandu={handleSavePengurusPosyandu}
                isLoggedIn={isPengurusLoggedIn}
                onLogout={() => setIsPengurusLoggedIn(false)}
              />
            )}

            {/* Tab: PKK RW 22 */}
            {activeTab === 'pkk' && (
              <PkkManager
                pkkList={pkkList}
                kegiatanList={kegiatanPKK}
                inventarisList={inventarisPKK}
                onSavePkk={handleSavePkk}
                onSaveKegiatan={handleSaveKegiatanPkk}
                onSaveInventaris={handleSaveInventarisPKK}
                wargaList={warga}
              />
            )}

            {/* Tab: Posyandu Anggrek Bulan */}
            {activeTab === 'posyandu' && (
              <PosyanduManager
                posyanduList={posyanduList}
                jadwalList={jadwalPosyandu}
                inventarisList={inventarisPosyandu}
                onSavePosyandu={handleSavePosyandu}
                onSaveJadwal={handleSaveJadwalPosyandu}
                onSaveInventaris={handleSaveInventarisPosyandu}
                wargaList={warga}
              />
            )}

            {/* Tab: Keuangan Kas RW */}
            {activeTab === 'kas' && (
              <KasManager
                kasList={kasList}
                onSaveKas={handleSaveKas}
                infoRW={infoRW}
                daftarRT={daftarRT}
                warga={warga}
              />
            )}

            {/* Tab: Laporan Kegiatan Bulanan untuk Warga */}
            {activeTab === 'laporan' && (
              <LaporanBulananManager
                laporanList={laporanList}
                onSaveLaporan={handleSaveLaporan}
                infoRW={infoRW}
                kasList={kasList}
                kegiatanPKK={kegiatanPKK}
                jadwalPosyandu={jadwalPosyandu}
                onOpenPortalView={() => setIsPortalMode(true)}
              />
            )}
          </>
        )}
      </main>

      {/* Official Footer with RW 22 Identity */}
      <footer className="bg-slate-900 text-slate-400 text-xs py-6 border-t border-slate-800 mt-12 print:hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-3">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-3 border-b border-slate-800 pb-3">
            <div>
              <span className="font-bold text-white text-sm block">
                Sistem Informasi Manajemen Pengurus RW 22 {infoRW.perumahan}
              </span>
              <p className="text-slate-400 text-[11px] mt-0.5">
                Desa Jelegong, Kecamatan Rancaekek, Kabupaten Bandung, Jawa Barat {infoRW.kodePos}
              </p>
            </div>
            <div className="flex flex-wrap gap-3 text-[11px] text-slate-300">
              <span>Ketua RW 22: <strong className="text-emerald-400">{infoRW.ketuaRw}</strong></span>
              <span>•</span>
              <span>Sekretaris: <strong className="text-slate-200">{infoRW.sekretaris}</strong></span>
              <span>•</span>
              <span>Bendahara: <strong className="text-amber-400">{infoRW.bendahara}</strong></span>
            </div>
          </div>
          <div className="flex flex-col sm:flex-row justify-between items-center text-[11px] text-slate-500 gap-2">
            <span>
              Membawahi 9 Rukun Tetangga (RT 01, RT 02, RT 03, RT 04, RT 05, RT 06, RT 07, RT 08, RT 09).
            </span>
            <span>
              Modul: Pendataan Warga & Import RT • PKK • Posyandu Anggrek Bulan • Kas RW • Laporan Bulanan Warga
            </span>
          </div>
        </div>
      </footer>

      {/* PENGURUS LOGIN MODAL */}
      {isPengurusLoginModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-fade-in">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 sm:p-8 shadow-2xl space-y-6">
            <div className="flex justify-between items-center pb-4 border-b border-slate-100">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold">
                  🔐
                </div>
                <div>
                  <h3 className="text-lg font-bold text-slate-900">Login Akses Pengurus</h3>
                  <p className="text-xs text-slate-500">Masukkan kredensial administrator RW 22</p>
                </div>
              </div>
              <button
                onClick={() => setIsPengurusLoginModalOpen(false)}
                className="p-2 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100 transition"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleLoginSubmit} className="space-y-4">
              {loginError && (
                <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 rounded-xl text-xs font-medium">
                  {loginError}
                </div>
              )}

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Username</label>
                <input
                  type="text"
                  value={loginUsername}
                  onChange={(e) => setLoginUsername(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm focus:outline-emerald-600"
                  required
                  autoFocus
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Password</label>
                <input
                  type="password"
                  value={loginPassword}
                  onChange={(e) => setLoginPassword(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm focus:outline-emerald-600"
                  required
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsPengurusLoginModalOpen(false)}
                  className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-medium text-xs transition"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-semibold text-xs transition shadow-sm"
                >
                  Masuk Mode Pengurus
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
