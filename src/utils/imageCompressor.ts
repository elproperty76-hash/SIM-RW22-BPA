import { FotoDokumentasi } from '../types';

/**
 * Compresses an image file using an offscreen canvas to optimize storage size
 * and keep within browser localStorage quota while maintaining crisp visual quality.
 */
export async function compressImageFile(
  file: File,
  maxWidth = 1200,
  maxHeight = 900,
  quality = 0.8
): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = () => reject(new Error('Gagal membaca berkas gambar.'));
    reader.onload = () => {
      const img = new Image();
      img.onerror = () => reject(new Error('Gagal memuat elemen gambar.'));
      img.onload = () => {
        let width = img.width;
        let height = img.height;

        // Calculate aspect-ratio preserving dimensions
        if (width > height) {
          if (width > maxWidth) {
            height = Math.round((height * maxWidth) / width);
            width = maxWidth;
          }
        } else {
          if (height > maxHeight) {
            width = Math.round((width * maxHeight) / height);
            height = maxHeight;
          }
        }

        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');

        if (!ctx) {
          // Fallback to raw data URL if canvas context fails
          resolve(reader.result as string);
          return;
        }

        // Fill background with white in case of transparent png
        ctx.fillStyle = '#FFFFFF';
        ctx.fillRect(0, 0, width, height);
        ctx.drawImage(img, 0, 0, width, height);

        const dataUrl = canvas.toDataURL('image/jpeg', quality);
        resolve(dataUrl);
      };

      img.src = reader.result as string;
    };

    reader.readAsDataURL(file);
  });
}

/**
 * Realistic activity photo presets for RW 22 Bumi Pesona Asri
 */
export const SAMPLE_ACTIVITY_PHOTOS: FotoDokumentasi[] = [
  {
    id: 'foto-preset-1',
    url: 'https://images.unsplash.com/photo-1593113598332-cd288d649433?auto=format&fit=crop&w=1000&q=80',
    judul: 'Kerja Bakti Massal Normalisasi Saluran Drainase',
    keterangan: 'Warga gabungan RT 01 s/d RT 04 bergotong royong mengeruk endapan lumpur di saluran utama Boulevard Blok A demi mencegah luapan air.',
    tanggal: '2026-02-08',
    lokasi: 'Boulevard Utama Blok A - C',
    kategori: 'Kerja Bakti',
    kegiatanId: 'keg-01',
    kegiatanJudul: 'Kerja Bakti Massal Normalisasi Saluran Air & Selokan Utama',
    waktuUpload: '2026-02-08T11:30:00.000Z',
  },
  {
    id: 'foto-preset-2',
    url: 'https://images.unsplash.com/photo-1576765608535-5f04d1e3f289?auto=format&fit=crop&w=1000&q=80',
    judul: 'Penimbangan & Deteksi Tumbuh Kembang Balita Posyandu Melati',
    keterangan: 'Kader Posyandu Melati RW 22 melakukan penimbangan balita, pengukuran tinggi badan, serta pemberian PMT telur & susu.',
    tanggal: '2026-02-22',
    lokasi: 'Balai RW 22 Blok C',
    kategori: 'Posyandu',
    kegiatanId: 'keg-03',
    kegiatanJudul: 'Pelaksanaan Posyandu Melati & Pelatihan Daur Ulang PKK',
    waktuUpload: '2026-02-22T10:15:00.000Z',
  },
  {
    id: 'foto-preset-3',
    url: 'https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?auto=format&fit=crop&w=1000&q=80',
    judul: 'Rapat Koordinasi Pengurus RW 22 Bersama 9 Ketua RT',
    keterangan: 'Musyawarah bersama Ketua RW Soderi, Sekretaris Sunarto, Bendahara Dadi Suhendar dan Ketua RT 01 - 09 membahas program kerja lingkungan.',
    tanggal: '2026-02-15',
    lokasi: 'Ruang Rapat Sekretariat RW 22',
    kategori: 'Rapat Pengurus',
    kegiatanId: 'keg-02',
    kegiatanJudul: 'Rapat Koordinasi Pengurus RW 22 Bersama 9 Ketua RT',
    waktuUpload: '2026-02-15T21:45:00.000Z',
  },
  {
    id: 'foto-preset-4',
    url: 'https://images.unsplash.com/photo-1504307651254-35680f356dfd?auto=format&fit=crop&w=1000&q=80',
    judul: 'Perbaikan Gerbang & Penataan Portal Masuk Timur',
    keterangan: 'Pengecatan ulang, perbaikan engsel portal pos timur Blok G, dan pemasangan rambu kecepatan oleh seksi keamanan & fasum.',
    tanggal: '2026-02-26',
    lokasi: 'Pintu Gerbang Timur Blok G',
    kategori: 'Pembangunan/Fasum',
    kegiatanId: 'keg-04',
    kegiatanJudul: 'Pemasangan Portal Otomatis & Perbaikan Portal Pintu Masuk Timur',
    waktuUpload: '2026-02-26T15:20:00.000Z',
  },
  {
    id: 'foto-preset-5',
    url: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?auto=format&fit=crop&w=1000&q=80',
    judul: 'Senam Sehat & Sosialisasi Eco-Enzyme PKK RW 22',
    keterangan: 'Ibu-ibu kader PKK dan warga antusias mengikuti senam kesegaran jasmani dilanjutkan edukasi pemilahan sampah organik rumah tangga.',
    tanggal: '2026-02-22',
    lokasi: 'Lapangan Fasum Depan Balai RW',
    kategori: 'PKK',
    kegiatanId: 'keg-03',
    kegiatanJudul: 'Pelaksanaan Posyandu Melati & Pelatihan Daur Ulang PKK',
    waktuUpload: '2026-02-22T08:45:00.000Z',
  },
];
