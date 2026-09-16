import React, { useState, useRef } from 'react';
import {
  Image as ImageIcon,
  Upload,
  Plus,
  Trash2,
  Maximize2,
  ChevronLeft,
  ChevronRight,
  X,
  Calendar,
  MapPin,
  Tag,
  Download,
  Filter,
  Camera,
  CheckCircle,
  Sparkles,
} from 'lucide-react';
import { FotoDokumentasi, PoinKegiatanLaporan } from '../types';
import { formatDateIndo } from '../utils/formatters';
import { compressImageFile, SAMPLE_ACTIVITY_PHOTOS } from '../utils/imageCompressor';

interface GaleriDokumentasiProps {
  galeri: FotoDokumentasi[];
  daftarKegiatan?: PoinKegiatanLaporan[];
  onUpdateGaleri?: (newGaleri: FotoDokumentasi[]) => void;
  isReadOnly?: boolean;
  title?: string;
  subtitle?: string;
}

export const GaleriDokumentasi: React.FC<GaleriDokumentasiProps> = ({
  galeri = [],
  daftarKegiatan = [],
  onUpdateGaleri,
  isReadOnly = false,
  title = 'Galeri Dokumentasi Foto Kegiatan Lapangan',
  subtitle = 'Bukti otentik pelaksanaan program kerja, transparansi anggaran, dan partisipasi warga RW 22',
}) => {
  const [selectedFilter, setSelectedFilter] = useState<string>('Semua');
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  // New photo pending form state
  const [pendingPhotos, setPendingPhotos] = useState<
    Array<{
      url: string;
      judul: string;
      keterangan: string;
      kategori: string;
      kegiatanId?: string;
      kegiatanJudul?: string;
      tanggal?: string;
      lokasi?: string;
    }>
  >([]);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Extract categories for filter
  const categories = ['Semua', ...Array.from(new Set(galeri.map((g) => g.kategori || 'Kegiatan RW')))];

  const filteredPhotos = galeri.filter((foto) => {
    if (selectedFilter === 'Semua') return true;
    return foto.kategori === selectedFilter;
  });

  // Handle file processing for drag & drop or click
  const processFiles = async (files: FileList | File[]) => {
    const validFiles = Array.from(files).filter((file) => file.type.startsWith('image/'));
    if (validFiles.length === 0) {
      alert('Silakan pilih berkas gambar berekstensi JPG, PNG, atau WEBP.');
      return;
    }

    setIsProcessing(true);
    try {
      const newPendingItems = [];
      for (const file of validFiles) {
        // Compress image to save local storage quota
        const dataUrl = await compressImageFile(file, 1200, 900, 0.82);
        
        // Auto default title from file name
        const cleanName = file.name.replace(/\.[^/.]+$/, '').replace(/[-_]/g, ' ');
        const autoJudul = cleanName.charAt(0).toUpperCase() + cleanName.slice(1);

        newPendingItems.push({
          url: dataUrl,
          judul: autoJudul || 'Dokumentasi Kegiatan RW 22',
          keterangan: 'Dokumentasi foto kegiatan lapangan warga RW 22 Bumi Pesona Asri.',
          kategori: daftarKegiatan[0]?.kategori || 'Kerja Bakti',
          kegiatanId: daftarKegiatan[0]?.id || '',
          kegiatanJudul: daftarKegiatan[0]?.judul || '',
          tanggal: new Date().toISOString().slice(0, 10),
          lokasi: 'Bumi Pesona Asri RW 22',
        });
      }

      setPendingPhotos((prev) => [...prev, ...newPendingItems]);
      setIsUploadModalOpen(true);
    } catch (err) {
      console.error(err);
      alert('Terjadi kendala saat membaca foto. Silakan coba kembali.');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      processFiles(e.dataTransfer.files);
    }
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      processFiles(e.target.files);
      e.target.value = '';
    }
  };

  const handleSavePendingPhotos = () => {
    if (pendingPhotos.length === 0) return;
    const newItems: FotoDokumentasi[] = pendingPhotos.map((p, idx) => ({
      id: `foto-${Date.now()}-${idx}`,
      url: p.url,
      judul: p.judul.trim() || 'Dokumentasi Kegiatan RW',
      keterangan: p.keterangan.trim(),
      tanggal: p.tanggal,
      lokasi: p.lokasi,
      kategori: p.kategori,
      kegiatanId: p.kegiatanId,
      kegiatanJudul: p.kegiatanJudul,
      waktuUpload: new Date().toISOString(),
    }));

    if (onUpdateGaleri) {
      onUpdateGaleri([...galeri, ...newItems]);
    }
    setPendingPhotos([]);
    setIsUploadModalOpen(false);
  };

  const handleDeletePhoto = (photoId: string) => {
    if (!onUpdateGaleri) return;
    if (window.confirm('Hapus foto dokumentasi ini dari laporan bulanan?')) {
      const updated = galeri.filter((g) => g.id !== photoId);
      onUpdateGaleri(updated);
      if (lightboxIndex !== null) {
        setLightboxIndex(null);
      }
    }
  };

  const handleLoadSamplePresets = () => {
    if (!onUpdateGaleri) return;
    const existingIds = new Set(galeri.map((g) => g.id));
    const toAdd = SAMPLE_ACTIVITY_PHOTOS.filter((p) => !existingIds.has(p.id));
    if (toAdd.length === 0) {
      alert('Seluruh contoh foto kegiatan sudah terpasang di galeri laporan ini.');
      return;
    }
    onUpdateGaleri([...galeri, ...toAdd]);
  };

  // Lightbox keyboard navigation
  const activeLightboxPhoto = lightboxIndex !== null ? filteredPhotos[lightboxIndex] : null;

  const handlePrevLightbox = () => {
    if (lightboxIndex === null) return;
    setLightboxIndex((prev) => (prev !== null && prev > 0 ? prev - 1 : filteredPhotos.length - 1));
  };

  const handleNextLightbox = () => {
    if (lightboxIndex === null) return;
    setLightboxIndex((prev) => (prev !== null && prev < filteredPhotos.length - 1 ? prev + 1 : 0));
  };

  return (
    <div className="space-y-4" id="galeri-dokumentasi-rw">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-200 pb-3">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-1 rounded-md bg-emerald-100 text-emerald-800">
              <Camera className="w-4 h-4" />
            </span>
            <h4 className="font-bold text-slate-900 uppercase text-xs sm:text-sm tracking-wide">
              {title}
            </h4>
            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
              {galeri.length} Foto
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">{subtitle}</p>
        </div>

        {/* Action Buttons for Pengurus */}
        {!isReadOnly && onUpdateGaleri && (
          <div className="flex items-center gap-2 self-start sm:self-auto flex-wrap">
            <button
              type="button"
              onClick={handleLoadSamplePresets}
              className="px-2.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition"
              title="Muat contoh foto dokumentasi lapangan RW 22"
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-600" />
              <span>Muat Contoh Foto</span>
            </button>
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 shadow-xs transition"
            >
              <Upload className="w-3.5 h-3.5" />
              <span>Unggah Foto Kegiatan</span>
            </button>
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileInputChange}
              accept="image/*"
              multiple
              className="hidden"
            />
          </div>
        )}
      </div>

      {/* Drag and Drop Zone for Quick Upload (Admin mode) */}
      {!isReadOnly && onUpdateGaleri && (
        <div
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
          className={`border-2 border-dashed rounded-xl p-4 sm:p-5 text-center transition cursor-pointer ${
            isDragging
              ? 'border-emerald-500 bg-emerald-50/80 ring-2 ring-emerald-200'
              : 'border-slate-300 hover:border-emerald-400 bg-slate-50/60 hover:bg-emerald-50/30'
          }`}
        >
          <div className="flex flex-col items-center justify-center space-y-1.5">
            <div className="p-2.5 bg-white rounded-full shadow-xs text-emerald-600 border border-slate-200">
              <Upload className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs font-bold text-slate-800">
                Tarik & Letakkan foto kegiatan warga di sini, atau{' '}
                <span className="text-emerald-700 underline">pilih berkas gambar</span>
              </p>
              <p className="text-[11px] text-slate-500 mt-0.5">
                Mendukung JPG, PNG, WEBP (Otomatis dikompresi untuk efisiensi penyimpanan)
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Filter Tabs */}
      {categories.length > 2 && (
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar text-xs">
          <Filter className="w-3.5 h-3.5 text-slate-400 mr-1 flex-shrink-0" />
          {categories.map((cat) => (
            <button
              key={cat}
              type="button"
              onClick={() => setSelectedFilter(cat)}
              className={`px-2.5 py-1 rounded-lg font-medium whitespace-nowrap transition ${
                selectedFilter === cat
                  ? 'bg-slate-900 text-white shadow-xs'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      )}

      {/* Photo Grid Gallery */}
      {filteredPhotos.length === 0 ? (
        <div className="p-8 text-center bg-slate-50 rounded-xl border border-slate-200 space-y-2">
          <ImageIcon className="w-8 h-8 text-slate-300 mx-auto" />
          <p className="text-xs font-semibold text-slate-600">Belum ada foto dokumentasi pada kategori ini.</p>
          {!isReadOnly && onUpdateGaleri && (
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="text-xs text-emerald-700 font-bold hover:underline"
            >
              Klik untuk melampirkan foto pertama
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
          {filteredPhotos.map((foto, index) => (
            <div
              key={foto.id}
              className="group bg-white rounded-xl border border-slate-200 shadow-xs hover:shadow-md transition overflow-hidden flex flex-col"
            >
              {/* Image Box */}
              <div
                className="relative aspect-[16/10] bg-slate-100 overflow-hidden cursor-pointer"
                onClick={() => setLightboxIndex(index)}
              >
                <img
                  src={foto.url}
                  alt={foto.judul}
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover transition duration-300 group-hover:scale-105"
                  loading="lazy"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/20 opacity-0 group-hover:opacity-100 transition flex items-end justify-between p-3 text-white">
                  <span className="text-[11px] font-semibold flex items-center gap-1 bg-black/40 px-2 py-1 rounded-md backdrop-blur-xs">
                    <Maximize2 className="w-3 h-3" />
                    Lihat Penuh
                  </span>
                  {!isReadOnly && onUpdateGaleri && (
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeletePhoto(foto.id);
                      }}
                      className="p-1.5 bg-rose-600/90 hover:bg-rose-700 text-white rounded-md shadow-xs transition"
                      title="Hapus foto ini"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>

                {/* Badge Kategori */}
                {foto.kategori && (
                  <div className="absolute top-2 left-2">
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-900/80 text-white backdrop-blur-xs shadow-xs">
                      {foto.kategori}
                    </span>
                  </div>
                )}
              </div>

              {/* Photo Meta & Caption */}
              <div className="p-3 flex-1 flex flex-col justify-between space-y-2 text-xs">
                <div>
                  <h5 className="font-bold text-slate-900 line-clamp-1 group-hover:text-emerald-700 transition">
                    {foto.judul}
                  </h5>
                  <p className="text-slate-600 text-[11px] leading-relaxed mt-1 line-clamp-2">
                    {foto.keterangan}
                  </p>
                </div>

                <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[10px] text-slate-400">
                  <div className="flex items-center gap-1 truncate max-w-[140px]" title={foto.lokasi || ''}>
                    <MapPin className="w-3 h-3 text-emerald-600 flex-shrink-0" />
                    <span className="truncate">{foto.lokasi || 'Bumi Pesona Asri'}</span>
                  </div>
                  {foto.tanggal && (
                    <div className="flex items-center gap-1">
                      <Calendar className="w-3 h-3 text-slate-400" />
                      <span>{formatDateIndo(foto.tanggal)}</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Lightbox Modal */}
      {activeLightboxPhoto && lightboxIndex !== null && (
        <div
          className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex items-center justify-center p-3 sm:p-6"
          onClick={() => setLightboxIndex(null)}
        >
          <div
            className="relative max-w-4xl w-full bg-slate-900 text-white rounded-2xl overflow-hidden shadow-2xl flex flex-col max-h-[92vh]"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Top Toolbar */}
            <div className="p-3 sm:p-4 bg-slate-950/80 border-b border-slate-800 flex justify-between items-center text-xs">
              <div className="flex items-center gap-2">
                <span className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 font-bold border border-emerald-500/30 text-[11px]">
                  {activeLightboxPhoto.kategori || 'Kegiatan RW 22'}
                </span>
                <span className="text-slate-400 text-[11px]">
                  Foto {lightboxIndex + 1} dari {filteredPhotos.length}
                </span>
              </div>

              <div className="flex items-center gap-2">
                <a
                  href={activeLightboxPhoto.url}
                  download={`foto-kegiatan-rw22-${activeLightboxPhoto.id}.jpg`}
                  target="_blank"
                  rel="noreferrer"
                  className="p-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white rounded-lg transition"
                  title="Unduh Berkas Gambar"
                >
                  <Download className="w-4 h-4" />
                </a>
                <button
                  type="button"
                  onClick={() => setLightboxIndex(null)}
                  className="p-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white rounded-lg transition"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Photo Center Display with Next / Prev */}
            <div className="relative flex-1 bg-black/60 flex items-center justify-center overflow-hidden min-h-[300px] sm:min-h-[420px]">
              <img
                src={activeLightboxPhoto.url}
                alt={activeLightboxPhoto.judul}
                referrerPolicy="no-referrer"
                className="max-h-[60vh] sm:max-h-[65vh] w-auto max-w-full object-contain mx-auto"
              />

              {filteredPhotos.length > 1 && (
                <>
                  <button
                    type="button"
                    onClick={handlePrevLightbox}
                    className="absolute left-2 top-1/2 -translate-y-1/2 p-2 rounded-full bg-black/60 hover:bg-black/80 text-white border border-white/20 transition"
                  >
                    <ChevronLeft className="w-5 h-5" />
                  </button>
                  <button
                    type="button"
                    onClick={handleNextLightbox}
                    className="absolute right-2 top-1/2 -translate-y-1/2 p-2 rounded-full bg-black/60 hover:bg-black/80 text-white border border-white/20 transition"
                  >
                    <ChevronRight className="w-5 h-5" />
                  </button>
                </>
              )}
            </div>

            {/* Bottom Caption Bar */}
            <div className="p-4 bg-slate-950 border-t border-slate-800 space-y-2">
              <h4 className="text-sm sm:text-base font-bold text-white">
                {activeLightboxPhoto.judul}
              </h4>
              <p className="text-xs text-slate-300 leading-relaxed">
                {activeLightboxPhoto.keterangan}
              </p>

              <div className="flex flex-wrap items-center gap-3 pt-1 text-[11px] text-slate-400">
                {activeLightboxPhoto.lokasi && (
                  <span className="flex items-center gap-1">
                    <MapPin className="w-3.5 h-3.5 text-emerald-400" />
                    <span>{activeLightboxPhoto.lokasi}</span>
                  </span>
                )}
                {activeLightboxPhoto.tanggal && (
                  <span className="flex items-center gap-1">
                    <Calendar className="w-3.5 h-3.5 text-slate-400" />
                    <span>{formatDateIndo(activeLightboxPhoto.tanggal)}</span>
                  </span>
                )}
                {activeLightboxPhoto.kegiatanJudul && (
                  <span className="flex items-center gap-1 bg-slate-900 px-2 py-0.5 rounded text-slate-300">
                    <Tag className="w-3 h-3 text-amber-400" />
                    <span>Terkait: {activeLightboxPhoto.kegiatanJudul}</span>
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal Configure Uploaded Photos before saving */}
      {isUploadModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-2xl w-full p-5 shadow-2xl border border-slate-200 max-h-[90vh] flex flex-col my-auto">
            <div className="flex justify-between items-center border-b border-slate-100 pb-3 mb-3 flex-shrink-0">
              <div className="flex items-center gap-2">
                <span className="p-1.5 rounded-lg bg-emerald-100 text-emerald-800">
                  <Upload className="w-4 h-4" />
                </span>
                <div>
                  <h3 className="text-sm font-bold text-slate-900">
                    Konfirmasi Unggahan Foto Dokumentasi ({pendingPhotos.length})
                  </h3>
                  <p className="text-[11px] text-slate-500">
                    Beri judul dan keterangan agar warga memahami konteks kegiatan
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => {
                  setPendingPhotos([]);
                  setIsUploadModalOpen(false);
                }}
                className="text-slate-400 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="overflow-y-auto space-y-4 flex-1 pr-1">
              {pendingPhotos.map((item, idx) => (
                <div
                  key={idx}
                  className="p-3 bg-slate-50 border border-slate-200 rounded-xl flex flex-col sm:flex-row gap-3 text-xs"
                >
                  <div className="w-full sm:w-36 h-28 bg-slate-200 rounded-lg overflow-hidden flex-shrink-0 relative">
                    <img
                      src={item.url}
                      alt="Pratinjau"
                      referrerPolicy="no-referrer"
                      className="w-full h-full object-cover"
                    />
                    <button
                      type="button"
                      onClick={() => setPendingPhotos(pendingPhotos.filter((_, i) => i !== idx))}
                      className="absolute top-1 right-1 p-1 bg-rose-600 text-white rounded-md hover:bg-rose-700 shadow-xs"
                      title="Hapus foto ini"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  </div>

                  <div className="flex-1 space-y-2">
                    <div>
                      <label className="font-semibold text-slate-700 block text-[11px] mb-0.5">
                        Judul Foto
                      </label>
                      <input
                        type="text"
                        value={item.judul}
                        onChange={(e) => {
                          const updated = [...pendingPhotos];
                          updated[idx].judul = e.target.value;
                          setPendingPhotos(updated);
                        }}
                        className="w-full px-2.5 py-1.5 bg-white border border-slate-300 rounded-lg focus:ring-1 focus:ring-emerald-500"
                        placeholder="Contoh: Kerja Bakti Pembersihan Selokan Blok A"
                      />
                    </div>

                    <div>
                      <label className="font-semibold text-slate-700 block text-[11px] mb-0.5">
                        Keterangan & Uraian Foto
                      </label>
                      <textarea
                        rows={2}
                        value={item.keterangan}
                        onChange={(e) => {
                          const updated = [...pendingPhotos];
                          updated[idx].keterangan = e.target.value;
                          setPendingPhotos(updated);
                        }}
                        className="w-full px-2.5 py-1.5 bg-white border border-slate-300 rounded-lg focus:ring-1 focus:ring-emerald-500"
                        placeholder="Ceritakan detail kegiatan, antusiasme warga, atau capaian..."
                      />
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      <div>
                        <label className="font-semibold text-slate-700 block text-[11px] mb-0.5">
                          Terkait Kegiatan
                        </label>
                        <select
                          value={item.kegiatanId || ''}
                          onChange={(e) => {
                            const found = daftarKegiatan.find((k) => k.id === e.target.value);
                            const updated = [...pendingPhotos];
                            updated[idx].kegiatanId = e.target.value;
                            updated[idx].kegiatanJudul = found?.judul || '';
                            if (found?.kategori) updated[idx].kategori = found.kategori;
                            if (found?.tanggal) updated[idx].tanggal = found.tanggal;
                            if (found?.lokasi) updated[idx].lokasi = found.lokasi;
                            setPendingPhotos(updated);
                          }}
                          className="w-full px-2 py-1 bg-white border border-slate-300 rounded-lg text-[11px]"
                        >
                          <option value="">-- Kegiatan Umum RW 22 --</option>
                          {daftarKegiatan.map((k) => (
                            <option key={k.id} value={k.id}>
                              {k.judul}
                            </option>
                          ))}
                        </select>
                      </div>

                      <div>
                        <label className="font-semibold text-slate-700 block text-[11px] mb-0.5">
                          Kategori
                        </label>
                        <select
                          value={item.kategori}
                          onChange={(e) => {
                            const updated = [...pendingPhotos];
                            updated[idx].kategori = e.target.value;
                            setPendingPhotos(updated);
                          }}
                          className="w-full px-2 py-1 bg-white border border-slate-300 rounded-lg text-[11px]"
                        >
                          <option value="Kerja Bakti">Kerja Bakti</option>
                          <option value="Posyandu">Posyandu</option>
                          <option value="PKK">PKK</option>
                          <option value="Pembangunan/Fasum">Pembangunan / Fasum</option>
                          <option value="Keamanan">Keamanan & Ronda</option>
                          <option value="Rapat Pengurus">Rapat Pengurus</option>
                          <option value="Sosial & Keagamaan">Sosial & Keagamaan</option>
                        </select>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="pt-3 border-t border-slate-100 flex justify-end gap-2 flex-shrink-0">
              <button
                type="button"
                onClick={() => {
                  setPendingPhotos([]);
                  setIsUploadModalOpen(false);
                }}
                className="px-3.5 py-1.5 border border-slate-300 text-slate-700 rounded-xl text-xs font-semibold"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={handleSavePendingPhotos}
                className="px-4 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-semibold flex items-center gap-1.5 shadow-xs"
              >
                <CheckCircle className="w-3.5 h-3.5" />
                <span>Simpan ke Laporan Bulanan</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
