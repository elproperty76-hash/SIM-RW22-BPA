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
  ItemInventaris,
} from '../types';
import {
  INFO_RW22,
  DAFTAR_RT,
  INITIAL_PENGURUS_POSYANDU,
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

const STORAGE_KEYS = {
  WARGA: 'sim_rw22_warga_v1',
  PKK: 'sim_rw22_pkk_v1',
  KEGIATAN_PKK: 'sim_rw22_kegiatan_pkk_v1',
  POSYANDU: 'sim_rw22_posyandu_v1',
  JADWAL_POSYANDU: 'sim_rw22_jadwal_posyandu_v1',
  INVENTARIS_POSYANDU: 'sim_rw22_inv_posyandu_v1',
  INVENTARIS_PKK: 'sim_rw22_inv_pkk_v1',
  KAS: 'sim_rw22_kas_v1',
  LAPORAN: 'sim_rw22_laporan_v1',
  PENGURUS_RW: 'sim_rw22_info_v1',
  PENGURUS_RT: 'sim_rw22_rt_v1',
  PENGURUS_POSYANDU: 'sim_rw22_pengurus_posyandu_v1',
};

function getStored<T>(key: string, fallback: T): T {
  try {
    const item = localStorage.getItem(key);
    if (!item) return fallback;
    return JSON.parse(item);
  } catch (err) {
    console.warn(`Error reading localStorage for key ${key}:`, err);
    return fallback;
  }
}

function setStored<T>(key: string, value: T): void {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (err) {
    console.warn(`Error saving to localStorage for key ${key}:`, err);
  }
}

export const StorageService = {
  getPengurusRW(): PengurusRWInfo {
    const stored = getStored<PengurusRWInfo>(STORAGE_KEYS.PENGURUS_RW, INFO_RW22);
    if (!stored) return INFO_RW22;

    // Automatically update if old address or old phone number is stored in localStorage
    if (
      stored.alamatSekretariat?.includes('Blok C') ||
      stored.kontakSekretariat === '0812-2244-9876' ||
      stored.kontakSekretariat !== '+62 813-3216-6332'
    ) {
      const updated: PengurusRWInfo = {
        ...stored,
        alamatSekretariat: INFO_RW22.alamatSekretariat,
        kontakSekretariat: INFO_RW22.kontakSekretariat,
      };
      setStored(STORAGE_KEYS.PENGURUS_RW, updated);
      return updated;
    }
    return stored;
  },
  getInfoRW(): PengurusRWInfo {
    return this.getPengurusRW();
  },
  savePengurusRW(info: PengurusRWInfo): void {
    setStored(STORAGE_KEYS.PENGURUS_RW, info);
  },

  getDaftarRT(): PengurusRTInfo[] {
    return getStored<PengurusRTInfo[]>(STORAGE_KEYS.PENGURUS_RT, DAFTAR_RT);
  },
  saveDaftarRT(list: PengurusRTInfo[]): void {
    setStored(STORAGE_KEYS.PENGURUS_RT, list);
  },

  getPengurusPosyandu(): PengurusPosyandu[] {
    return getStored<PengurusPosyandu[]>(STORAGE_KEYS.PENGURUS_POSYANDU, INITIAL_PENGURUS_POSYANDU);
  },
  savePengurusPosyandu(list: PengurusPosyandu[]): void {
    setStored(STORAGE_KEYS.PENGURUS_POSYANDU, list);
  },

  getWarga(): Warga[] {
    return getStored<Warga[]>(STORAGE_KEYS.WARGA, INITIAL_WARGA);
  },
  saveWarga(warga: Warga[]): void {
    setStored(STORAGE_KEYS.WARGA, warga);
  },

  getAnggotaPKK(): AnggotaPKK[] {
    return getStored<AnggotaPKK[]>(STORAGE_KEYS.PKK, INITIAL_PKK);
  },
  getPKK(): AnggotaPKK[] {
    return this.getAnggotaPKK();
  },
  saveAnggotaPKK(pkk: AnggotaPKK[]): void {
    setStored(STORAGE_KEYS.PKK, pkk);
  },
  savePKK(pkk: AnggotaPKK[]): void {
    this.saveAnggotaPKK(pkk);
  },

  getKegiatanPKK(): KegiatanPKK[] {
    return getStored<KegiatanPKK[]>(STORAGE_KEYS.KEGIATAN_PKK, INITIAL_KEGIATAN_PKK);
  },
  saveKegiatanPKK(kegiatan: KegiatanPKK[]): void {
    setStored(STORAGE_KEYS.KEGIATAN_PKK, kegiatan);
  },

  getPosyandu(): PasienPosyandu[] {
    return getStored<PasienPosyandu[]>(STORAGE_KEYS.POSYANDU, INITIAL_POSYANDU);
  },
  savePosyandu(posyandu: PasienPosyandu[]): void {
    setStored(STORAGE_KEYS.POSYANDU, posyandu);
  },

  getJadwalPosyandu(): JadwalPosyandu[] {
    return getStored<JadwalPosyandu[]>(STORAGE_KEYS.JADWAL_POSYANDU, INITIAL_JADWAL_POSYANDU);
  },
  saveJadwalPosyandu(jadwal: JadwalPosyandu[]): void {
    setStored(STORAGE_KEYS.JADWAL_POSYANDU, jadwal);
  },

  getInventarisPosyandu(): ItemInventaris[] {
    return getStored<ItemInventaris[]>(STORAGE_KEYS.INVENTARIS_POSYANDU, INITIAL_INVENTARIS_POSYANDU);
  },
  saveInventarisPosyandu(items: ItemInventaris[]): void {
    setStored(STORAGE_KEYS.INVENTARIS_POSYANDU, items);
  },

  getInventarisPKK(): ItemInventaris[] {
    return getStored<ItemInventaris[]>(STORAGE_KEYS.INVENTARIS_PKK, INITIAL_INVENTARIS_PKK);
  },
  saveInventarisPKK(items: ItemInventaris[]): void {
    setStored(STORAGE_KEYS.INVENTARIS_PKK, items);
  },

  getKas(): TransaksiKas[] {
    return getStored<TransaksiKas[]>(STORAGE_KEYS.KAS, INITIAL_TRANSAKSI_KAS);
  },
  saveKas(kas: TransaksiKas[]): void {
    setStored(STORAGE_KEYS.KAS, kas);
  },

  getLaporan(): LaporanBulanan[] {
    const stored = getStored<LaporanBulanan[]>(STORAGE_KEYS.LAPORAN, INITIAL_LAPORAN);
    if (!stored || !Array.isArray(stored) || stored.length === 0) {
      return INITIAL_LAPORAN;
    }
    // If stored reports has fewer items than INITIAL_LAPORAN, merge any missing historical reports
    const storedIds = new Set(stored.map((l) => l.id));
    const missing = INITIAL_LAPORAN.filter((initLap) => !storedIds.has(initLap.id));
    if (missing.length > 0) {
      const merged = [...stored, ...missing];
      setStored(STORAGE_KEYS.LAPORAN, merged);
      return merged;
    }
    return stored;
  },
  saveLaporan(laporan: LaporanBulanan[]): void {
    setStored(STORAGE_KEYS.LAPORAN, laporan);
  },

  resetAllData(): void {
    localStorage.removeItem(STORAGE_KEYS.WARGA);
    localStorage.removeItem(STORAGE_KEYS.PKK);
    localStorage.removeItem(STORAGE_KEYS.KEGIATAN_PKK);
    localStorage.removeItem(STORAGE_KEYS.POSYANDU);
    localStorage.removeItem(STORAGE_KEYS.JADWAL_POSYANDU);
    localStorage.removeItem(STORAGE_KEYS.INVENTARIS_POSYANDU);
    localStorage.removeItem(STORAGE_KEYS.INVENTARIS_PKK);
    localStorage.removeItem(STORAGE_KEYS.KAS);
    localStorage.removeItem(STORAGE_KEYS.LAPORAN);
    localStorage.removeItem(STORAGE_KEYS.PENGURUS_RW);
    localStorage.removeItem(STORAGE_KEYS.PENGURUS_RT);
    localStorage.removeItem(STORAGE_KEYS.PENGURUS_POSYANDU);
  },

  exportFullBackupJSON(): string {
    const data = {
      version: '1.0',
      exportedAt: new Date().toISOString(),
      pengurusRW: this.getPengurusRW(),
      daftarRT: this.getDaftarRT(),
      pengurusPosyandu: this.getPengurusPosyandu(),
      warga: this.getWarga(),
      pkk: this.getAnggotaPKK(),
      kegiatanPKK: this.getKegiatanPKK(),
      posyandu: this.getPosyandu(),
      jadwalPosyandu: this.getJadwalPosyandu(),
      inventarisPosyandu: this.getInventarisPosyandu(),
      inventarisPKK: this.getInventarisPKK(),
      kas: this.getKas(),
      laporan: this.getLaporan(),
    };
    return JSON.stringify(data, null, 2);
  },
};
