import React, { useState, useEffect } from 'react';
import { X, Save, User, Home, Phone, IdCard } from 'lucide-react';
import { Warga, RTNumber } from '../types';

interface WargaModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (warga: Warga) => void;
  editData?: Warga | null;
  defaultRt?: RTNumber;
}

export const WargaModal: React.FC<WargaModalProps> = ({
  isOpen,
  onClose,
  onSave,
  editData,
  defaultRt = 1,
}) => {
  const [formData, setFormData] = useState<Partial<Warga>>({
    rt: defaultRt,
    rw: '22',
    jenisKelamin: 'L',
    statusPerkawinan: 'Kawin',
    statusDalamKeluarga: 'Kepala Keluarga',
    statusDomisili: 'Tetap',
    agama: 'Islam',
    golonganDarah: '-',
  });

  useEffect(() => {
    if (editData) {
      setFormData(editData);
    } else {
      setFormData({
        id: `warga-${Date.now()}`,
        nik: '',
        noKk: '',
        nama: '',
        rt: defaultRt,
        rw: '22',
        alamat: `Bumi Pesona Asri RT 0${defaultRt}`,
        jenisKelamin: 'L',
        tempatLahir: 'Bandung',
        tanggalLahir: '1990-01-01',
        agama: 'Islam',
        statusPerkawinan: 'Kawin',
        statusDalamKeluarga: 'Kepala Keluarga',
        pekerjaan: '',
        noHp: '',
        statusDomisili: 'Tetap',
        golonganDarah: '-',
        tanggalTerdaftar: new Date().toISOString().slice(0, 10),
      });
    }
  }, [editData, defaultRt, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.nama || !formData.nik || !formData.noKk) {
      alert('Mohon lengkapi NIK, No. KK, dan Nama Lengkap Warga.');
      return;
    }

    const finalItem: Warga = {
      id: formData.id || `warga-${Date.now()}`,
      nik: formData.nik,
      noKk: formData.noKk,
      nama: formData.nama,
      rt: (formData.rt || 1) as RTNumber,
      rw: '22',
      alamat: formData.alamat || '',
      jenisKelamin: (formData.jenisKelamin || 'L') as 'L' | 'P',
      tempatLahir: formData.tempatLahir || 'Bandung',
      tanggalLahir: formData.tanggalLahir || '1990-01-01',
      agama: formData.agama || 'Islam',
      statusPerkawinan: (formData.statusPerkawinan || 'Kawin') as any,
      statusDalamKeluarga: (formData.statusDalamKeluarga || 'Kepala Keluarga') as any,
      pekerjaan: formData.pekerjaan || '-',
      noHp: formData.noHp || '',
      statusDomisili: (formData.statusDomisili || 'Tetap') as any,
      golonganDarah: formData.golonganDarah || '-',
      tanggalTerdaftar: formData.tanggalTerdaftar || new Date().toISOString().slice(0, 10),
    };

    onSave(finalItem);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-3 sm:p-5 overflow-y-auto">
      <div className="bg-white rounded-2xl max-w-2xl w-full shadow-2xl border border-slate-200 overflow-hidden my-auto max-h-[92vh] flex flex-col">
        {/* Header */}
        <div className="bg-slate-900 text-white p-4 sm:p-5 flex justify-between items-center flex-shrink-0">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-600 flex items-center justify-center text-white">
              <User className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">
                {editData ? 'Edit Data Warga RW 22' : 'Tambah Data Warga Baru'}
              </h3>
              <p className="text-xs text-slate-300">
                Bumi Pesona Asri • Desa Jelegong, Rancaekek
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-4 sm:p-6 overflow-y-auto space-y-4 flex-1">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* NIK */}
            <div>
              <label className="text-xs font-semibold text-slate-700 block mb-1">
                NIK (Nomor Induk Kependudukan) *
              </label>
              <input
                type="text"
                required
                maxLength={16}
                value={formData.nik || ''}
                onChange={(e) => setFormData({ ...formData, nik: e.target.value })}
                placeholder="320405xxxxxxxxxx"
                className="w-full px-3 py-2 text-xs sm:text-sm border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500 font-mono outline-hidden"
              />
            </div>

            {/* No KK */}
            <div>
              <label className="text-xs font-semibold text-slate-700 block mb-1">
                Nomor Kartu Keluarga (KK) *
              </label>
              <input
                type="text"
                required
                maxLength={16}
                value={formData.noKk || ''}
                onChange={(e) => setFormData({ ...formData, noKk: e.target.value })}
                placeholder="320405xxxxxxxxxx"
                className="w-full px-3 py-2 text-xs sm:text-sm border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500 font-mono outline-hidden"
              />
            </div>

            {/* Nama Lengkap */}
            <div className="sm:col-span-2">
              <label className="text-xs font-semibold text-slate-700 block mb-1">
                Nama Lengkap Sesuai KTP *
              </label>
              <input
                type="text"
                required
                value={formData.nama || ''}
                onChange={(e) => setFormData({ ...formData, nama: e.target.value })}
                placeholder="Nama Lengkap Warga"
                className="w-full px-3 py-2 text-xs sm:text-sm border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-hidden font-medium"
              />
            </div>

            {/* RT & RW */}
            <div>
              <label className="text-xs font-semibold text-slate-700 block mb-1">
                Rukun Tetangga (RT) *
              </label>
              <select
                value={formData.rt || 1}
                onChange={(e) => setFormData({ ...formData, rt: Number(e.target.value) as RTNumber })}
                className="w-full px-3 py-2 text-xs sm:text-sm border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-hidden bg-white"
              >
                {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((rt) => (
                  <option key={rt} value={rt}>
                    RT 0{rt} (Pengurus RT 0{rt})
                  </option>
                ))}
              </select>
            </div>

            {/* Jenis Kelamin */}
            <div>
              <label className="text-xs font-semibold text-slate-700 block mb-1">
                Jenis Kelamin
              </label>
              <select
                value={formData.jenisKelamin || 'L'}
                onChange={(e) => setFormData({ ...formData, jenisKelamin: e.target.value as 'L' | 'P' })}
                className="w-full px-3 py-2 text-xs sm:text-sm border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-hidden bg-white"
              >
                <option value="L">Laki-laki (L)</option>
                <option value="P">Perempuan (P)</option>
              </select>
            </div>

            {/* Alamat / No Rumah */}
            <div className="sm:col-span-2">
              <label className="text-xs font-semibold text-slate-700 block mb-1">
                Alamat / Blok & Nomor Rumah
              </label>
              <input
                type="text"
                value={formData.alamat || ''}
                onChange={(e) => setFormData({ ...formData, alamat: e.target.value })}
                placeholder="Contoh: Bumi Pesona Asri Blok A2 No. 14"
                className="w-full px-3 py-2 text-xs sm:text-sm border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-hidden"
              />
            </div>

            {/* Tempat & Tgl Lahir */}
            <div>
              <label className="text-xs font-semibold text-slate-700 block mb-1">
                Tempat Lahir
              </label>
              <input
                type="text"
                value={formData.tempatLahir || ''}
                onChange={(e) => setFormData({ ...formData, tempatLahir: e.target.value })}
                placeholder="Bandung"
                className="w-full px-3 py-2 text-xs sm:text-sm border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-hidden"
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-slate-700 block mb-1">
                Tanggal Lahir
              </label>
              <input
                type="date"
                value={formData.tanggalLahir || ''}
                onChange={(e) => setFormData({ ...formData, tanggalLahir: e.target.value })}
                className="w-full px-3 py-2 text-xs sm:text-sm border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-hidden bg-white"
              />
            </div>

            {/* Status Keluarga & Perkawinan */}
            <div>
              <label className="text-xs font-semibold text-slate-700 block mb-1">
                Status Dalam Keluarga
              </label>
              <select
                value={formData.statusDalamKeluarga || 'Kepala Keluarga'}
                onChange={(e) => setFormData({ ...formData, statusDalamKeluarga: e.target.value as any })}
                className="w-full px-3 py-2 text-xs sm:text-sm border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-hidden bg-white"
              >
                <option value="Kepala Keluarga">Kepala Keluarga</option>
                <option value="Istri">Istri</option>
                <option value="Anak">Anak</option>
                <option value="Famili Lain">Famili Lain</option>
              </select>
            </div>
            <div>
              <label className="text-xs font-semibold text-slate-700 block mb-1">
                Status Perkawinan
              </label>
              <select
                value={formData.statusPerkawinan || 'Kawin'}
                onChange={(e) => setFormData({ ...formData, statusPerkawinan: e.target.value as any })}
                className="w-full px-3 py-2 text-xs sm:text-sm border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-hidden bg-white"
              >
                <option value="Kawin">Kawin</option>
                <option value="Belum Kawin">Belum Kawin</option>
                <option value="Cerai Hidup">Cerai Hidup</option>
                <option value="Cerai Mati">Cerai Mati</option>
              </select>
            </div>

            {/* Pekerjaan & No HP */}
            <div>
              <label className="text-xs font-semibold text-slate-700 block mb-1">
                Pekerjaan
              </label>
              <input
                type="text"
                value={formData.pekerjaan || ''}
                onChange={(e) => setFormData({ ...formData, pekerjaan: e.target.value })}
                placeholder="Karyawan Swasta / Wiraswasta / PNS"
                className="w-full px-3 py-2 text-xs sm:text-sm border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-hidden"
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-slate-700 block mb-1">
                No. Telepon / WhatsApp
              </label>
              <input
                type="text"
                value={formData.noHp || ''}
                onChange={(e) => setFormData({ ...formData, noHp: e.target.value })}
                placeholder="0812-xxxx-xxxx"
                className="w-full px-3 py-2 text-xs sm:text-sm border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-hidden"
              />
            </div>

            {/* Status Domisili & Gol Darah */}
            <div>
              <label className="text-xs font-semibold text-slate-700 block mb-1">
                Status Domisili Tempat Tinggal
              </label>
              <select
                value={formData.statusDomisili || 'Tetap'}
                onChange={(e) => setFormData({ ...formData, statusDomisili: e.target.value as any })}
                className="w-full px-3 py-2 text-xs sm:text-sm border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-hidden bg-white"
              >
                <option value="Tetap">Warga Tetap (Pemilik)</option>
                <option value="Kontrak">Warga Kontrak / Sewa</option>
                <option value="Kos">Kos / Singgah</option>
              </select>
            </div>
            <div>
              <label className="text-xs font-semibold text-slate-700 block mb-1">
                Golongan Darah
              </label>
              <select
                value={formData.golonganDarah || '-'}
                onChange={(e) => setFormData({ ...formData, golonganDarah: e.target.value })}
                className="w-full px-3 py-2 text-xs sm:text-sm border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-hidden bg-white"
              >
                <option value="-">Tidak Tahu (-)</option>
                <option value="A">A</option>
                <option value="B">B</option>
                <option value="AB">AB</option>
                <option value="O">O</option>
              </select>
            </div>
          </div>

          {/* Footer actions */}
          <div className="mt-6 pt-4 border-t border-slate-200 flex justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-slate-300 text-slate-700 hover:bg-slate-100 rounded-xl text-xs font-semibold transition"
            >
              Batal
            </button>
            <button
              type="submit"
              className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-semibold shadow-xs transition flex items-center gap-2"
            >
              <Save className="w-4 h-4" />
              <span>Simpan Data Warga</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
