import {
  doc,
  getDoc,
  setDoc,
  onSnapshot,
  serverTimestamp,
} from 'firebase/firestore';
import { db } from './firebase';
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

const FIRESTORE_COLLECTION = 'sim_rw22_data';

export const CLOUD_KEYS = {
  WARGA: 'warga',
  PKK: 'pkk',
  KEGIATAN_PKK: 'kegiatan_pkk',
  POSYANDU: 'posyandu',
  JADWAL_POSYANDU: 'jadwal_posyandu',
  INVENTARIS_POSYANDU: 'inventaris_posyandu',
  INVENTARIS_PKK: 'inventaris_pkk',
  KAS: 'kas',
  LAPORAN: 'laporan',
  PENGURUS_RW: 'info_rw',
  PENGURUS_RT: 'daftar_rt',
  PENGURUS_POSYANDU: 'pengurus_posyandu',
} as const;

export type CloudKey = (typeof CLOUD_KEYS)[keyof typeof CLOUD_KEYS];

export type SyncStatus = 'idle' | 'syncing' | 'synced' | 'error' | 'offline';

type SyncListener = (status: SyncStatus, message?: string) => void;
const syncListeners: Set<SyncListener> = new Set();

let currentSyncStatus: SyncStatus = 'idle';

export function notifySyncStatus(status: SyncStatus, message?: string): void {
  currentSyncStatus = status;
  syncListeners.forEach((listener) => listener(status, message));
}

export function subscribeSyncStatus(listener: SyncListener): () => void {
  syncListeners.add(listener);
  listener(currentSyncStatus);
  return () => {
    syncListeners.delete(listener);
  };
}

// Local cache backup helpers
function getLocalFallback<T>(key: string, defaultVal: T): T {
  try {
    const raw = localStorage.getItem(`cloud_cache_${key}`);
    if (!raw) return defaultVal;
    return JSON.parse(raw);
  } catch {
    return defaultVal;
  }
}

function setLocalFallback<T>(key: string, data: T): void {
  try {
    localStorage.setItem(`cloud_cache_${key}`, JSON.stringify(data));
  } catch {
    // Ignore storage quota warnings
  }
}

/**
 * Migration helper to ensure any legacy 'Posyandu Melati' text is migrated to 'Posyandu Anggrek Bulan'
 */
function migratePosyanduNames<T>(val: T): T {
  if (typeof val === 'string') {
    return val.replace(/Posyandu Melati/g, 'Posyandu Anggrek Bulan') as unknown as T;
  }
  if (Array.isArray(val)) {
    return val.map((item) => migratePosyanduNames(item)) as unknown as T;
  }
  if (val !== null && typeof val === 'object') {
    const result: any = {};
    for (const k of Object.keys(val)) {
      result[k] = migratePosyanduNames((val as any)[k]);
    }
    return result;
  }
  return val;
}

/**
 * Save a dataset to Cloud Firestore with automatic local backup
 */
export async function saveToCloud<T>(key: CloudKey, data: T): Promise<boolean> {
  const cleanData = migratePosyanduNames(data);
  setLocalFallback(key, cleanData);
  notifySyncStatus('syncing', `Menyimpan perubahan ke Cloud...`);

  try {
    const docRef = doc(db, FIRESTORE_COLLECTION, key);
    await setDoc(
      docRef,
      {
        items: cleanData,
        updatedAt: new Date().toISOString(),
        serverTime: serverTimestamp(),
      },
      { merge: true }
    );
    notifySyncStatus('synced', 'Data tersimpan aman di Cloud Firestore');
    return true;
  } catch (err: any) {
    console.error(`Error saving ${key} to Firestore:`, err);
    notifySyncStatus('error', 'Gagal sinkron ke Cloud, tersimpan di cache lokal.');
    return false;
  }
}

/**
 * Fetch a dataset from Cloud Firestore. If missing in Firestore, seeds the initial default once.
 */
export async function loadFromCloud<T>(key: CloudKey, initialDefault: T): Promise<T> {
  notifySyncStatus('syncing', `Memuat data dari Cloud...`);

  try {
    const docRef = doc(db, FIRESTORE_COLLECTION, key);
    const snap = await getDoc(docRef);

    if (snap.exists()) {
      const snapData = snap.data();
      if (snapData && snapData.items !== undefined) {
        const cloudData = migratePosyanduNames(snapData.items as T);
        setLocalFallback(key, cloudData);

        // If legacy string was migrated, update Firestore seamlessly
        if (JSON.stringify(snapData.items) !== JSON.stringify(cloudData)) {
          setDoc(docRef, { items: cloudData, updatedAt: new Date().toISOString() }, { merge: true }).catch(() => {});
        }

        return cloudData;
      }
    }

    // If document doesn't exist yet on Cloud, seed it with the default initial data
    const localCached = getLocalFallback(key, initialDefault);
    const rawDataToSeed = localCached ?? initialDefault;
    const dataToSeed = migratePosyanduNames(rawDataToSeed);

    // Seed in the background
    setDoc(
      docRef,
      {
        items: dataToSeed,
        updatedAt: new Date().toISOString(),
        serverTime: serverTimestamp(),
        isInitialSeed: true,
      },
      { merge: true }
    ).catch((seedErr) => {
      console.warn(`Could not seed initial data for ${key}:`, seedErr);
    });

    setLocalFallback(key, dataToSeed);
    return dataToSeed;
  } catch (err: any) {
    console.warn(`Firestore read failed for ${key}, using cached copy:`, err);
    notifySyncStatus('offline', 'Koneksi cloud terganggu. Menggunakan data tersimpan.');
    return migratePosyanduNames(getLocalFallback(key, initialDefault));
  }
}

/**
 * Realtime listener to auto-sync changes made from another tab or device
 */
export function subscribeToKey<T>(key: CloudKey, onUpdate: (data: T) => void): () => void {
  try {
    const docRef = doc(db, FIRESTORE_COLLECTION, key);
    return onSnapshot(
      docRef,
      (snap) => {
        if (snap.exists()) {
          const val = snap.data()?.items;
          if (val !== undefined) {
            setLocalFallback(key, val);
            onUpdate(val as T);
          }
        }
      },
      (error) => {
        console.warn(`Snapshot listener error for ${key}:`, error);
      }
    );
  } catch (err) {
    console.warn(`Failed to attach snapshot listener for ${key}:`, err);
    return () => {};
  }
}

export const CloudStorageService = {
  saveToCloud,
  loadFromCloud,
  subscribeToKey,

  /**
   * Load all initial app data at once from Cloud Firestore
   */
   async loadAllInitialData(): Promise<{
    infoRW: PengurusRWInfo;
    daftarRT: PengurusRTInfo[];
    pengurusPosyandu: PengurusPosyandu[];
    warga: Warga[];
    pkk: AnggotaPKK[];
    kegiatanPKK: KegiatanPKK[];
    inventarisPKK: ItemInventaris[];
    posyandu: PasienPosyandu[];
    jadwalPosyandu: JadwalPosyandu[];
    inventarisPosyandu: ItemInventaris[];
    kas: TransaksiKas[];
    laporan: LaporanBulanan[];
  }> {
    notifySyncStatus('syncing', 'Menghubungkan ke Cloud Firestore...');

    const [
      infoRW,
      daftarRT,
      pengurusPosyandu,
      warga,
      pkk,
      kegiatanPKK,
      inventarisPKK,
      posyandu,
      jadwalPosyandu,
      inventarisPosyandu,
      kas,
      laporan,
    ] = await Promise.all([
      loadFromCloud<PengurusRWInfo>(CLOUD_KEYS.PENGURUS_RW, INFO_RW22),
      loadFromCloud<PengurusRTInfo[]>(CLOUD_KEYS.PENGURUS_RT, DAFTAR_RT),
      loadFromCloud<PengurusPosyandu[]>(CLOUD_KEYS.PENGURUS_POSYANDU, INITIAL_PENGURUS_POSYANDU),
      loadFromCloud<Warga[]>(CLOUD_KEYS.WARGA, INITIAL_WARGA),
      loadFromCloud<AnggotaPKK[]>(CLOUD_KEYS.PKK, INITIAL_PKK),
      loadFromCloud<KegiatanPKK[]>(CLOUD_KEYS.KEGIATAN_PKK, INITIAL_KEGIATAN_PKK),
      loadFromCloud<ItemInventaris[]>(CLOUD_KEYS.INVENTARIS_PKK, INITIAL_INVENTARIS_PKK),
      loadFromCloud<PasienPosyandu[]>(CLOUD_KEYS.POSYANDU, INITIAL_POSYANDU),
      loadFromCloud<JadwalPosyandu[]>(CLOUD_KEYS.JADWAL_POSYANDU, INITIAL_JADWAL_POSYANDU),
      loadFromCloud<ItemInventaris[]>(CLOUD_KEYS.INVENTARIS_POSYANDU, INITIAL_INVENTARIS_POSYANDU),
      loadFromCloud<TransaksiKas[]>(CLOUD_KEYS.KAS, INITIAL_TRANSAKSI_KAS),
      loadFromCloud<LaporanBulanan[]>(CLOUD_KEYS.LAPORAN, INITIAL_LAPORAN),
    ]);

    notifySyncStatus('synced', 'Data tersimpan aman di Cloud');

    return {
      infoRW,
      daftarRT,
      pengurusPosyandu,
      warga,
      pkk,
      kegiatanPKK,
      inventarisPKK,
      posyandu,
      jadwalPosyandu,
      inventarisPosyandu,
      kas,
      laporan,
    };
  },
};
