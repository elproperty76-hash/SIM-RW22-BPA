export type RTNumber = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9;

export interface Warga {
  id: string;
  nik: string;
  noKk: string;
  nama: string;
  rt: RTNumber;
  rw: string; // "22"
  alamat: string;
  jenisKelamin: 'L' | 'P';
  tempatLahir: string;
  tanggalLahir: string;
  agama: string;
  statusPerkawinan: 'Belum Kawin' | 'Kawin' | 'Cerai Hidup' | 'Cerai Mati';
  statusDalamKeluarga: 'Kepala Keluarga' | 'Istri' | 'Anak' | 'Famili Lain';
  pekerjaan: string;
  noHp: string;
  statusDomisili: 'Tetap' | 'Kontrak' | 'Kos';
  golonganDarah: string;
  tanggalTerdaftar: string;
}

export interface PengurusRWInfo {
  rw: string; // "22"
  perumahan: string; // "Bumi Pesona Asri"
  desa: string; // "Jelegong"
  kecamatan: string; // "Rancaekek"
  kabupaten: string; // "Bandung"
  kodePos: string; // "40394"
  ketuaRw: string; // "Soderi"
  sekretaris: string; // "Sunarto"
  bendahara: string; // "Dadi Suhendar"
  alamatSekretariat: string;
  kontakSekretariat: string;
}

export interface PengurusRTInfo {
  rt: RTNumber;
  namaKetua: string;
  kontak: string;
  blokWilayah: string;
}

export interface AnggotaPKK {
  id: string;
  nama: string;
  rt: RTNumber;
  jabatan: string;
  pokja: 'Pengurus Inti' | 'Pokja I' | 'Pokja II' | 'Pokja III' | 'Pokja IV';
  noHp: string;
  keahlian?: string;
  statusAktif: boolean;
}

export interface PartisipanWarga {
  id: string;
  nama: string;
  rt: RTNumber;
  kategori?: string; // 'Kader', 'Warga', 'Balita', 'Lansia', 'Ibu Hamil'
  keterangan?: string;
  statusHadir: boolean;
}

export interface KegiatanPKK {
  id: string;
  namaKegiatan: string;
  tanggal: string;
  waktu: string;
  lokasi: string;
  pokja: string;
  deskripsi: string;
  jumlahPeserta: number;
  dokumentasiUrl?: string;
  anggaran: number;
  statusKegiatan?: 'Akan Datang' | 'Terlaksana' | 'Dibatalkan';
  partisipasiWarga?: PartisipanWarga[];
  catatanHasil?: string;
}

export interface PemeriksaanPosyandu {
  id: string;
  tanggal: string;
  beratBadan: number; // kg
  tinggiBadan: number; // cm
  lingkarKepala?: number; // cm untuk balita
  tensiDarah?: string; // untuk lansia (contoh: 120/80)
  gulaDarah?: number; // mg/dL untuk lansia
  statusGizi: 'Gizi Baik' | 'Gizi Kurang' | 'Beresiko Stunting' | 'Gizi Lebih' | 'Normal' | 'Pra-Hipertensi' | 'Hipertensi';
  vitaminImunisasi?: string; // e.g. "Vitamin A Merah, Vaksin Polio"
  catatanKader: string;
}

export interface PasienPosyandu {
  id: string;
  jenis: 'Balita' | 'Lansia';
  nama: string;
  nik: string;
  rt: RTNumber;
  tanggalLahir: string;
  jenisKelamin: 'L' | 'P';
  namaWali?: string; // Nama Ibu/Ayah untuk balita, atau kontak keluarga untuk lansia
  alamat: string;
  noHp: string;
  riwayatPemeriksaan: PemeriksaanPosyandu[];
}

export interface JadwalPosyandu {
  id: string;
  judul: string;
  tanggal: string;
  waktu: string;
  lokasi: string;
  kegiatan: string[];
  kaderBertugas: string[];
  statusKegiatan?: 'Akan Datang' | 'Terlaksana' | 'Dibatalkan';
  partisipasiWarga?: PartisipanWarga[];
  catatanHasil?: string;
}

export type KategoriInventaris =
  | 'Obat & Vitamin'
  | 'Peralatan Medis/Kesehatan'
  | 'Perlengkapan Posyandu'
  | 'Peralatan PKK & Boga'
  | 'Inventaris Balai/Fasum'
  | 'ATK & Administrasi'
  | string;

export interface ItemInventaris {
  id: string;
  modul?: 'POSYANDU' | 'PKK' | 'RW';
  namaBarang: string;
  kategori: KategoriInventaris;
  jumlah: number;
  satuan: string; // e.g. 'Unit', 'Kotak', 'Strip', 'Botol', 'Set', 'Pcs'
  kondisi: 'Baik' | 'Cukup' | 'Rusak' | 'Habis / Perlu Restock' | 'Perlu Kalibrasi' | string;
  lokasiPenyimpanan: string;
  tanggalPembaruan?: string;
  tanggalPengadaan?: string;
  penanggungJawab?: string;
  catatan?: string;
  keterangan?: string;
  minimumStok?: number;
}

export type KategoriKas =
  | 'Iuran Warga'
  | 'Dana Desa / Bantuan'
  | 'Donasi / Swadaya'
  | 'Kebersihan & Sampah'
  | 'Keamanan & Ronda'
  | 'Penerangan & Fasum'
  | 'Kegiatan Warga / PHBN'
  | 'Sosial & Santunan'
  | 'Operasional Sekretariat';

export interface TransaksiKas {
  id: string;
  tanggal: string;
  jenis: 'Masuk' | 'Keluar';
  kategori: KategoriKas;
  rtAsal?: RTNumber; // spesifik jika merupakan setoran iuran RT
  keterangan: string;
  nominal: number;
  penanggungJawab: string;
  nomorBukti: string;
}

export interface FotoDokumentasi {
  id: string;
  url: string; // base64 data URL or external URL
  judul: string;
  keterangan: string;
  tanggal?: string;
  lokasi?: string;
  kategori?: string;
  kegiatanId?: string; // Optional link to specific activity
  kegiatanJudul?: string;
  waktuUpload?: string;
}

export interface PoinKegiatanLaporan {
  id: string;
  judul: string;
  tanggal: string;
  kategori: 'Kerja Bakti' | 'Keamanan' | 'Sosial & Keagamaan' | 'PKK' | 'Posyandu' | 'Pembangunan/Fasum' | 'Rapat Pengurus';
  lokasi: string;
  deskripsi: string;
  anggaranDigunakan?: number;
  dokumentasiText?: string;
  fotoDokumentasi?: FotoDokumentasi[];
}

export interface LaporanBulanan {
  id: string;
  judul: string;
  periodeBulan: string; // e.g. "Maret"
  tahun: number; // e.g. 2026
  tanggalPublikasi: string;
  status: 'Diterbitkan' | 'Draft';
  ringkasanEksekutif: string;
  daftarKegiatan: PoinKegiatanLaporan[];
  galeriFoto?: FotoDokumentasi[];
  ringkasanKas: {
    saldoAwal: number;
    totalPemasukan: number;
    totalPengeluaran: number;
    saldoAkhir: number;
    catatanBendahara: string;
  };
  rekapIuranRt: {
    rt: RTNumber;
    persentaseLunas: number;
    nominalTerkumpul: number;
  }[];
  pengumumanWarga: string[];
  ketuaRw: string; // "Soderi"
  sekretaris: string; // "Sunarto"
  bendahara: string; // "Dadi Suhendar"
}
