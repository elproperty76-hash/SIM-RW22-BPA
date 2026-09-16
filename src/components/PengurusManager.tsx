import React, { useState } from 'react';
import {
  ShieldCheck,
  Users,
  Building,
  HeartHandshake,
  Activity,
  Plus,
  Edit2,
  Trash2,
  Save,
  Check,
  X,
  Phone,
  MapPin,
  Award,
  UserCheck,
} from 'lucide-react';
import {
  PengurusRWInfo,
  PengurusRTInfo,
  AnggotaPKK,
  PengurusPosyandu,
  RTNumber,
} from '../types';

interface PengurusManagerProps {
  infoRW: PengurusRWInfo;
  daftarRT: PengurusRTInfo[];
  pkkList: AnggotaPKK[];
  pengurusPosyandu: PengurusPosyandu[];
  onSaveRW: (info: PengurusRWInfo) => void;
  onSaveRT: (list: PengurusRTInfo[]) => void;
  onSavePKK: (list: AnggotaPKK[]) => void;
  onSavePosyandu: (list: PengurusPosyandu[]) => void;
  isLoggedIn?: boolean;
  onLogout?: () => void;
}

export const PengurusManager: React.FC<PengurusManagerProps> = ({
  infoRW,
  daftarRT,
  pkkList,
  pengurusPosyandu,
  onSaveRW,
  onSaveRT,
  onSavePKK,
  onSavePosyandu,
  isLoggedIn,
  onLogout,
}) => {
  const [activeSubTab, setActiveSubTab] = useState<'rw' | 'rt' | 'pkk' | 'posyandu'>('rw');

  // RW Edit State
  const [rwForm, setRwForm] = useState<PengurusRWInfo>({ ...infoRW });
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // RT Edit/Add State
  const [isRtModalOpen, setIsRtModalOpen] = useState(false);
  const [editingRt, setEditingRt] = useState<PengurusRTInfo | null>(null);
  const [rtForm, setRtForm] = useState<Partial<PengurusRTInfo>>({
    rt: 1,
    namaKetua: '',
    kontak: '',
    blokWilayah: '',
  });

  // PKK Edit/Add State
  const [isPkkModalOpen, setIsPkkModalOpen] = useState(false);
  const [editingPkk, setEditingPkk] = useState<AnggotaPKK | null>(null);
  const [pkkForm, setPkkForm] = useState<Partial<AnggotaPKK>>({
    nama: '',
    rt: 1,
    jabatan: 'Kader PKK',
    pokja: 'Pokja I',
    noHp: '',
    keahlian: '',
    statusAktif: true,
  });

  // Posyandu Kader Edit/Add State
  const [isPosyanduModalOpen, setIsPosyanduModalOpen] = useState(false);
  const [editingPosyandu, setEditingPosyandu] = useState<PengurusPosyandu | null>(null);
  const [posyanduForm, setPosyanduForm] = useState<Partial<PengurusPosyandu>>({
    nama: '',
    jabatan: 'Kader Posyandu',
    rt: 1,
    noHp: '',
    statusAktif: true,
  });

  // Delete Confirmation State
  const [deleteTarget, setDeleteTarget] = useState<{
    type: 'rt' | 'pkk' | 'posyandu';
    id: any;
    label: string;
  } | null>(null);

  const showNotification = (msg: string) => {
    setSuccessMessage(msg);
    setTimeout(() => setSuccessMessage(null), 3500);
  };

  const confirmDelete = () => {
    if (!deleteTarget) return;
    if (deleteTarget.type === 'rt') {
      const updated = daftarRT.filter((r) => r.rt !== deleteTarget.id);
      onSaveRT(updated);
      showNotification(`Data Ketua RT 0${deleteTarget.id} berhasil dihapus`);
    } else if (deleteTarget.type === 'pkk') {
      const updated = pkkList.filter((p) => p.id !== deleteTarget.id);
      onSavePKK(updated);
      showNotification('Data anggota PKK berhasil dihapus');
    } else if (deleteTarget.type === 'posyandu') {
      const updated = pengurusPosyandu.filter((p) => p.id !== deleteTarget.id);
      onSavePosyandu(updated);
      showNotification('Data kader posyandu berhasil dihapus');
    }
    setDeleteTarget(null);
  };

  // --- RW Handlers ---
  const handleSaveRwSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSaveRW(rwForm);
    showNotification('Data Pengurus RW berhasil disimpan!');
  };

  // --- RT Handlers ---
  const handleOpenAddRt = () => {
    setEditingRt(null);
    setRtForm({
      rt: ((daftarRT.length + 1) > 9 ? 9 : (daftarRT.length + 1)) as RTNumber,
      namaKetua: '',
      kontak: '',
      blokWilayah: '',
    });
    setIsRtModalOpen(true);
  };

  const handleOpenEditRt = (item: PengurusRTInfo) => {
    setEditingRt(item);
    setRtForm({ ...item });
    setIsRtModalOpen(true);
  };

  const handleSaveRtSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!rtForm.namaKetua) return;

    let updatedList = [...daftarRT];
    if (editingRt) {
      updatedList = updatedList.map((r) =>
        r.rt === editingRt.rt ? ({ ...(rtForm as PengurusRTInfo) } as PengurusRTInfo) : r
      );
    } else {
      const newRtItem: PengurusRTInfo = {
        rt: (rtForm.rt || 1) as RTNumber,
        namaKetua: rtForm.namaKetua || '',
        kontak: rtForm.kontak || '',
        blokWilayah: rtForm.blokWilayah || '',
      };
      // check if rt already exists
      const exists = updatedList.some((r) => r.rt === newRtItem.rt);
      if (exists) {
        updatedList = updatedList.map((r) => (r.rt === newRtItem.rt ? newRtItem : r));
      } else {
        updatedList.push(newRtItem);
        updatedList.sort((a, b) => a.rt - b.rt);
      }
    }

    onSaveRT(updatedList);
    setIsRtModalOpen(false);
    showNotification('Data Pengurus RT berhasil disimpan!');
  };

  const handleDeleteRt = (rtNum: RTNumber, name: string) => {
    setDeleteTarget({ type: 'rt', id: rtNum, label: `Ketua RT 0${rtNum} (${name})` });
  };

  // --- PKK Handlers ---
  const handleOpenAddPkk = () => {
    setEditingPkk(null);
    setPkkForm({
      nama: '',
      rt: 1,
      jabatan: 'Kader PKK',
      pokja: 'Pokja I',
      noHp: '',
      keahlian: '',
      statusAktif: true,
    });
    setIsPkkModalOpen(true);
  };

  const handleOpenEditPkk = (item: AnggotaPKK) => {
    setEditingPkk(item);
    setPkkForm({ ...item });
    setIsPkkModalOpen(true);
  };

  const handleSavePkkSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!pkkForm.nama) return;

    let updatedList = [...pkkList];
    if (editingPkk) {
      updatedList = updatedList.map((p) =>
        p.id === editingPkk.id ? ({ ...p, ...pkkForm } as AnggotaPKK) : p
      );
    } else {
      const newItem: AnggotaPKK = {
        id: `pkk-${Date.now()}`,
        nama: pkkForm.nama || '',
        rt: (pkkForm.rt || 1) as RTNumber,
        jabatan: pkkForm.jabatan || 'Kader PKK',
        pokja: (pkkForm.pokja || 'Pokja I') as any,
        noHp: pkkForm.noHp || '',
        keahlian: pkkForm.keahlian || '',
        statusAktif: pkkForm.statusAktif ?? true,
      };
      updatedList.unshift(newItem);
    }

    onSavePKK(updatedList);
    setIsPkkModalOpen(false);
    showNotification('Data Pengurus/Anggota PKK berhasil disimpan!');
  };

  const handleDeletePkk = (id: string, name: string) => {
    setDeleteTarget({ type: 'pkk', id, label: name });
  };

  // --- Posyandu Kader Handlers ---
  const handleOpenAddPosyandu = () => {
    setEditingPosyandu(null);
    setPosyanduForm({
      nama: '',
      jabatan: 'Kader Posyandu',
      rt: 1,
      noHp: '',
      statusAktif: true,
    });
    setIsPosyanduModalOpen(true);
  };

  const handleOpenEditPosyandu = (item: PengurusPosyandu) => {
    setEditingPosyandu(item);
    setPosyanduForm({ ...item });
    setIsPosyanduModalOpen(true);
  };

  const handleSavePosyanduSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!posyanduForm.nama) return;

    let updatedList = [...pengurusPosyandu];
    if (editingPosyandu) {
      updatedList = updatedList.map((p) =>
        p.id === editingPosyandu.id ? ({ ...p, ...posyanduForm } as PengurusPosyandu) : p
      );
    } else {
      const newItem: PengurusPosyandu = {
        id: `pos-p-${Date.now()}`,
        nama: posyanduForm.nama || '',
        jabatan: posyanduForm.jabatan || 'Kader Posyandu',
        rt: (posyanduForm.rt || 1) as RTNumber,
        noHp: posyanduForm.noHp || '',
        statusAktif: posyanduForm.statusAktif ?? true,
      };
      updatedList.unshift(newItem);
    }

    onSavePosyandu(updatedList);
    setIsPosyanduModalOpen(false);
    showNotification('Data Pengurus/Kader Posyandu berhasil disimpan!');
  };

  const handleDeletePosyandu = (id: string, name: string) => {
    setDeleteTarget({ type: 'posyandu', id, label: name });
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-teal-900 via-slate-900 to-emerald-900 rounded-2xl p-5 sm:p-6 text-white shadow-md relative overflow-hidden">
        <div className="relative z-10 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-500/30 text-emerald-200 text-xs font-semibold backdrop-blur-xs mb-2 border border-emerald-400/30">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Mode Admin Pengurus (Aktif)</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-bold tracking-tight">
              Kelola Data Pengurus RW, RT, PKK, & Posyandu
            </h2>
            <p className="text-xs sm:text-sm text-slate-300 mt-1 max-w-2xl">
              Tambah, edit, hapus, dan simpan struktur kepengurusan wilayah Rukun Warga 22 secara real-time. Perubahan langsung tersimpan aman ke Cloud Firestore & sistem lokal.
            </p>
          </div>
          {onLogout && (
            <button
              onClick={onLogout}
              className="flex items-center gap-1.5 px-4 py-2 bg-white/10 hover:bg-white/20 text-white rounded-xl text-xs font-semibold transition border border-white/20 shadow-sm whitespace-nowrap"
            >
              Keluar Mode Admin
            </button>
          )}
        </div>
      </div>

      {/* Success Notification Alert */}
      {successMessage && (
        <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 px-4 py-3 rounded-xl flex items-center gap-2 shadow-xs transition animate-fade-in">
          <Check className="w-5 h-5 text-emerald-600 flex-shrink-0" />
          <span className="text-sm font-medium">{successMessage}</span>
        </div>
      )}

      {/* Sub-tab Navigation */}
      <div className="flex border-b border-slate-200 overflow-x-auto no-scrollbar">
        <button
          onClick={() => setActiveSubTab('rw')}
          className={`flex items-center gap-2 py-3 px-4 border-b-2 font-medium text-sm whitespace-nowrap transition ${
            activeSubTab === 'rw'
              ? 'border-emerald-600 text-emerald-700'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <Building className="w-4 h-4" />
          <span>Pengurus Inti RW 22</span>
        </button>
        <button
          onClick={() => setActiveSubTab('rt')}
          className={`flex items-center gap-2 py-3 px-4 border-b-2 font-medium text-sm whitespace-nowrap transition ${
            activeSubTab === 'rt'
              ? 'border-emerald-600 text-emerald-700'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <Users className="w-4 h-4" />
          <span>Ketua RT (01 - 09)</span>
          <span className="ml-1 px-2 py-0.5 bg-slate-100 text-slate-700 text-xs rounded-full font-bold">
            {daftarRT.length}
          </span>
        </button>
        <button
          onClick={() => setActiveSubTab('pkk')}
          className={`flex items-center gap-2 py-3 px-4 border-b-2 font-medium text-sm whitespace-nowrap transition ${
            activeSubTab === 'pkk'
              ? 'border-emerald-600 text-emerald-700'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <HeartHandshake className="w-4 h-4" />
          <span>Pengurus & Kader PKK</span>
          <span className="ml-1 px-2 py-0.5 bg-slate-100 text-slate-700 text-xs rounded-full font-bold">
            {pkkList.length}
          </span>
        </button>
        <button
          onClick={() => setActiveSubTab('posyandu')}
          className={`flex items-center gap-2 py-3 px-4 border-b-2 font-medium text-sm whitespace-nowrap transition ${
            activeSubTab === 'posyandu'
              ? 'border-emerald-600 text-emerald-700'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <Activity className="w-4 h-4" />
          <span>Kader Posyandu</span>
          <span className="ml-1 px-2 py-0.5 bg-slate-100 text-slate-700 text-xs rounded-full font-bold">
            {pengurusPosyandu.length}
          </span>
        </button>
      </div>

      {/* TAB 1: PENGURUS RW */}
      {activeSubTab === 'rw' && (
        <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs">
          <div className="flex justify-between items-center mb-6 pb-4 border-b border-slate-100">
            <div>
              <h3 className="text-lg font-bold text-slate-900">Informasi & Pengurus Inti RW 22</h3>
              <p className="text-xs text-slate-500">Edit data resmi pimpinan Rukun Warga dan sekretariat</p>
            </div>
            <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center">
              <Building className="w-5 h-5" />
            </div>
          </div>

          <form onSubmit={handleSaveRwSubmit} className="space-y-5">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Nomor RW</label>
                <input
                  type="text"
                  value={rwForm.rw}
                  onChange={(e) => setRwForm({ ...rwForm, rw: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm focus:outline-emerald-600 bg-slate-50"
                  required
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Nama Perumahan / Komplek</label>
                <input
                  type="text"
                  value={rwForm.perumahan}
                  onChange={(e) => setRwForm({ ...rwForm, perumahan: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm focus:outline-emerald-600"
                  required
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Desa / Kelurahan</label>
                <input
                  type="text"
                  value={rwForm.desa}
                  onChange={(e) => setRwForm({ ...rwForm, desa: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm focus:outline-emerald-600"
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Kecamatan</label>
                <input
                  type="text"
                  value={rwForm.kecamatan}
                  onChange={(e) => setRwForm({ ...rwForm, kecamatan: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm focus:outline-emerald-600"
                  required
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Kabupaten / Kota</label>
                <input
                  type="text"
                  value={rwForm.kabupaten}
                  onChange={(e) => setRwForm({ ...rwForm, kabupaten: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm focus:outline-emerald-600"
                  required
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Kode Pos</label>
                <input
                  type="text"
                  value={rwForm.kodePos}
                  onChange={(e) => setRwForm({ ...rwForm, kodePos: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm focus:outline-emerald-600"
                  required
                />
              </div>
            </div>

            <div className="border-t border-slate-100 pt-4 grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Nama Ketua RW</label>
                <input
                  type="text"
                  value={rwForm.ketuaRw}
                  onChange={(e) => setRwForm({ ...rwForm, ketuaRw: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm font-semibold text-slate-900 focus:outline-emerald-600"
                  required
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Nama Sekretaris RW</label>
                <input
                  type="text"
                  value={rwForm.sekretaris}
                  onChange={(e) => setRwForm({ ...rwForm, sekretaris: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm font-semibold text-slate-900 focus:outline-emerald-600"
                  required
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Nama Bendahara RW</label>
                <input
                  type="text"
                  value={rwForm.bendahara}
                  onChange={(e) => setRwForm({ ...rwForm, bendahara: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm font-semibold text-slate-900 focus:outline-emerald-600"
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Alamat Sekretariat / Balai Warga</label>
                <input
                  type="text"
                  value={rwForm.alamatSekretariat}
                  onChange={(e) => setRwForm({ ...rwForm, alamatSekretariat: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm focus:outline-emerald-600"
                  required
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Kontak / WhatsApp Sekretariat</label>
                <input
                  type="text"
                  value={rwForm.kontakSekretariat}
                  onChange={(e) => setRwForm({ ...rwForm, kontakSekretariat: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm focus:outline-emerald-600"
                  required
                />
              </div>
            </div>

            {/* PENGUMUMAN PENTING WARSGA SECTION */}
            <div className="border-t border-slate-200 pt-5 space-y-4">
              <div className="flex justify-between items-center">
                <div>
                  <h4 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-amber-500 animate-ping"></span>
                    Pengumuman Penting Warga (Tampil di Portal Warga)
                  </h4>
                  <p className="text-xs text-slate-500">
                    Tampilkan pesan darurat, himbauan, atau informasi mendesak secara mencolok di halaman utama Portal Warga.
                  </p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={rwForm.pengumumanPenting?.aktif || false}
                    onChange={(e) =>
                      setRwForm({
                        ...rwForm,
                        pengumumanPenting: {
                          ...(rwForm.pengumumanPenting || {
                            judul: '',
                            isi: '',
                            tanggal: new Date().toISOString().split('T')[0],
                            prioritas: 'Penting',
                          }),
                          aktif: e.target.checked,
                        },
                      })
                    }
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-slate-200 peer-focus:outline-hidden rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-600"></div>
                  <span className="ml-2 text-xs font-semibold text-slate-700">
                    {rwForm.pengumumanPenting?.aktif ? 'Aktif (Ditampilkan)' : 'Nonaktif'}
                  </span>
                </label>
              </div>

              {rwForm.pengumumanPenting?.aktif && (
                <div className="p-4 bg-amber-50/70 border border-amber-200 rounded-2xl space-y-3">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    <div className="md:col-span-2">
                      <label className="block text-xs font-semibold text-slate-700 mb-1">Judul Pengumuman</label>
                      <input
                        type="text"
                        value={rwForm.pengumumanPenting?.judul || ''}
                        onChange={(e) =>
                          setRwForm({
                            ...rwForm,
                            pengumumanPenting: {
                              ...(rwForm.pengumumanPenting || { aktif: true, tanggal: '', prioritas: 'Penting', isi: '' }),
                              judul: e.target.value,
                            },
                          })
                        }
                        className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs focus:outline-emerald-600 bg-white"
                        placeholder="Contoh: Himbauan Waspada Banjir / Kerja Bakti"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">Tingkat Urgensi</label>
                      <select
                        value={rwForm.pengumumanPenting?.prioritas || 'Penting'}
                        onChange={(e: any) =>
                          setRwForm({
                            ...rwForm,
                            pengumumanPenting: {
                              ...(rwForm.pengumumanPenting || { aktif: true, tanggal: '', judul: '', isi: '' }),
                              prioritas: e.target.value,
                            },
                          })
                        }
                        className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs font-semibold bg-white focus:outline-emerald-600"
                      >
                        <option value="Info">Info Publik</option>
                        <option value="Penting">Penting</option>
                        <option value="Darurat / Siaga">Darurat / Siaga</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Isi Pesan / Keterangan Mendesak</label>
                    <textarea
                      rows={3}
                      value={rwForm.pengumumanPenting?.isi || ''}
                      onChange={(e) =>
                        setRwForm({
                          ...rwForm,
                          pengumumanPenting: {
                            ...(rwForm.pengumumanPenting || { aktif: true, tanggal: '', judul: '', prioritas: 'Penting' }),
                            isi: e.target.value,
                          },
                        })
                      }
                      className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs focus:outline-emerald-600 bg-white"
                      placeholder="Tuliskan isi pengumuman penting secara jelas untuk dibaca seluruh warga..."
                    />
                  </div>
                </div>
              )}
            </div>

            <div className="flex justify-end pt-3">
              <button
                type="submit"
                className="flex items-center gap-2 px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-semibold text-sm transition shadow-sm"
              >
                <Save className="w-4 h-4" />
                <span>Simpan Perubahan RW</span>
              </button>
            </div>
          </form>
        </div>
      )}

      {/* TAB 2: KETUA RT (01 - 09) */}
      {activeSubTab === 'rt' && (
        <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs space-y-4">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 pb-4 border-b border-slate-100">
            <div>
              <h3 className="text-lg font-bold text-slate-900">Daftar Ketua RT 01 s/d 09</h3>
              <p className="text-xs text-slate-500">Kelola data kontak dan wilayah cakupan masing-masing RT</p>
            </div>
            <button
              onClick={handleOpenAddRt}
              className="flex items-center gap-2 px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-semibold text-xs transition shadow-sm"
            >
              <Plus className="w-4 h-4" />
              <span>Tambah / Set RT Baru</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {daftarRT.map((rtItem) => (
              <div
                key={rtItem.rt}
                className="bg-slate-50/70 border border-slate-200/80 rounded-2xl p-4 flex flex-col justify-between hover:border-emerald-400 transition group"
              >
                <div>
                  <div className="flex justify-between items-start mb-2">
                    <span className="px-2.5 py-1 bg-emerald-100 text-emerald-800 text-xs font-bold rounded-lg">
                      RT 0{rtItem.rt} / RW 22
                    </span>
                    <div className="flex gap-1 opacity-80 group-hover:opacity-100 transition">
                      <button
                        onClick={() => handleOpenEditRt(rtItem)}
                        className="p-1.5 hover:bg-white text-slate-600 hover:text-emerald-700 rounded-lg transition"
                        title="Edit RT"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => handleDeleteRt(rtItem.rt, rtItem.namaKetua)}
                        className="p-1.5 hover:bg-white text-slate-600 hover:text-rose-600 rounded-lg transition"
                        title="Hapus / Reset"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  <h4 className="text-base font-bold text-slate-900 mt-1">{rtItem.namaKetua}</h4>
                  <div className="flex items-center gap-1.5 text-xs text-slate-600 mt-1">
                    <MapPin className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
                    <span>Cakupan: {rtItem.blokWilayah}</span>
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t border-slate-200/60 flex items-center justify-between">
                  <div className="flex items-center gap-1.5 text-xs text-slate-600">
                    <Phone className="w-3.5 h-3.5 text-emerald-600 flex-shrink-0" />
                    <span className="font-medium">{rtItem.kontak}</span>
                  </div>
                  <span className="text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md">
                    Aktif
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 3: PENGURUS & KADER PKK */}
      {activeSubTab === 'pkk' && (
        <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs space-y-4">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 pb-4 border-b border-slate-100">
            <div>
              <h3 className="text-lg font-bold text-slate-900">Pengurus & Anggota PKK RW 22</h3>
              <p className="text-xs text-slate-500">Kelola struktur Pokja I s.d IV dan pengurus inti PKK</p>
            </div>
            <button
              onClick={handleOpenAddPkk}
              className="flex items-center gap-2 px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-semibold text-xs transition shadow-sm"
            >
              <Plus className="w-4 h-4" />
              <span>Tambah Anggota PKK</span>
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs sm:text-sm">
              <thead className="bg-slate-50 text-slate-600 uppercase tracking-wider text-[11px] font-semibold">
                <tr>
                  <th className="px-4 py-3 rounded-l-xl">Nama Anggota</th>
                  <th className="px-4 py-3">Jabatan</th>
                  <th className="px-4 py-3">Pokja</th>
                  <th className="px-4 py-3">Wilayah RT</th>
                  <th className="px-4 py-3">Kontak WA</th>
                  <th className="px-4 py-3 text-right rounded-r-xl">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {pkkList.map((p) => (
                  <tr key={p.id} className="hover:bg-slate-50/80 transition">
                    <td className="px-4 py-3 font-semibold text-slate-900">{p.nama}</td>
                    <td className="px-4 py-3 text-slate-700">{p.jabatan}</td>
                    <td className="px-4 py-3">
                      <span className="px-2.5 py-0.5 bg-teal-50 text-teal-800 rounded-lg text-xs font-medium">
                        {p.pokja}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-slate-600">RT 0{p.rt}</td>
                    <td className="px-4 py-3 text-slate-600">{p.noHp || '-'}</td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => handleOpenEditPkk(p)}
                          className="p-1.5 hover:bg-emerald-50 text-slate-600 hover:text-emerald-700 rounded-lg transition"
                          title="Edit"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDeletePkk(p.id, p.nama)}
                          className="p-1.5 hover:bg-rose-50 text-slate-600 hover:text-rose-600 rounded-lg transition"
                          title="Hapus"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 4: KADER POSYANDU */}
      {activeSubTab === 'posyandu' && (
        <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs space-y-4">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 pb-4 border-b border-slate-100">
            <div>
              <h3 className="text-lg font-bold text-slate-900">Kader & Petugas Posyandu Anggrek Bulan</h3>
              <p className="text-xs text-slate-500">Kelola tenaga kesehatan dan kader posyandu balita & lansia</p>
            </div>
            <button
              onClick={handleOpenAddPosyandu}
              className="flex items-center gap-2 px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-semibold text-xs transition shadow-sm"
            >
              <Plus className="w-4 h-4" />
              <span>Tambah Kader Posyandu</span>
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs sm:text-sm">
              <thead className="bg-slate-50 text-slate-600 uppercase tracking-wider text-[11px] font-semibold">
                <tr>
                  <th className="px-4 py-3 rounded-l-xl">Nama Kader / Petugas</th>
                  <th className="px-4 py-3">Jabatan / Peran</th>
                  <th className="px-4 py-3">Wilayah RT</th>
                  <th className="px-4 py-3">Kontak WA</th>
                  <th className="px-4 py-3 text-right rounded-r-xl">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {pengurusPosyandu.map((item) => (
                  <tr key={item.id} className="hover:bg-slate-50/80 transition">
                    <td className="px-4 py-3 font-semibold text-slate-900">{item.nama}</td>
                    <td className="px-4 py-3 text-slate-700 font-medium">{item.jabatan}</td>
                    <td className="px-4 py-3 text-slate-600">RT 0{item.rt}</td>
                    <td className="px-4 py-3 text-slate-600">{item.noHp || '-'}</td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => handleOpenEditPosyandu(item)}
                          className="p-1.5 hover:bg-emerald-50 text-slate-600 hover:text-emerald-700 rounded-lg transition"
                          title="Edit"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDeletePosyandu(item.id, item.nama)}
                          className="p-1.5 hover:bg-rose-50 text-slate-600 hover:text-rose-600 rounded-lg transition"
                          title="Hapus"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* MODAL: RT */}
      {isRtModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4">
            <div className="flex justify-between items-center pb-3 border-b border-slate-100">
              <h3 className="font-bold text-slate-900">
                {editingRt ? `Edit Data RT 0${editingRt.rt}` : 'Tambah / Set Data RT'}
              </h3>
              <button
                onClick={() => setIsRtModalOpen(false)}
                className="p-1 text-slate-400 hover:text-slate-700 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveRtSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Nomor RT</label>
                <select
                  value={rtForm.rt || 1}
                  onChange={(e) => setRtForm({ ...rtForm, rt: Number(e.target.value) as RTNumber })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm focus:outline-emerald-600 bg-white"
                  disabled={!!editingRt}
                >
                  {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((n) => (
                    <option key={n} value={n}>
                      RT 0{n}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Nama Ketua RT</label>
                <input
                  type="text"
                  value={rtForm.namaKetua || ''}
                  onChange={(e) => setRtForm({ ...rtForm, namaKetua: e.target.value })}
                  placeholder="Contoh: Bpk. Ahmad Supriyadi"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm focus:outline-emerald-600"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Nomor Kontak / WhatsApp</label>
                <input
                  type="text"
                  value={rtForm.kontak || ''}
                  onChange={(e) => setRtForm({ ...rtForm, kontak: e.target.value })}
                  placeholder="Contoh: 0813-1101-0001"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm focus:outline-emerald-600"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Cakupan Blok Wilayah</label>
                <input
                  type="text"
                  value={rtForm.blokWilayah || ''}
                  onChange={(e) => setRtForm({ ...rtForm, blokWilayah: e.target.value })}
                  placeholder="Contoh: Blok A1 - A12"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm focus:outline-emerald-600"
                  required
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsRtModalOpen(false)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-medium text-xs transition"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-semibold text-xs transition shadow-sm flex items-center gap-1.5"
                >
                  <Save className="w-3.5 h-3.5" />
                  <span>Simpan RT</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: PKK */}
      {isPkkModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4">
            <div className="flex justify-between items-center pb-3 border-b border-slate-100">
              <h3 className="font-bold text-slate-900">
                {editingPkk ? 'Edit Data Anggota/Pengurus PKK' : 'Tambah Anggota PKK Baru'}
              </h3>
              <button
                onClick={() => setIsPkkModalOpen(false)}
                className="p-1 text-slate-400 hover:text-slate-700 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSavePkkSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Nama Lengkap</label>
                <input
                  type="text"
                  value={pkkForm.nama || ''}
                  onChange={(e) => setPkkForm({ ...pkkForm, nama: e.target.value })}
                  placeholder="Contoh: Ibu Siti Aminah"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm focus:outline-emerald-600"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Wilayah RT</label>
                  <select
                    value={pkkForm.rt || 1}
                    onChange={(e) => setPkkForm({ ...pkkForm, rt: Number(e.target.value) as RTNumber })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm focus:outline-emerald-600 bg-white"
                  >
                    {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((n) => (
                      <option key={n} value={n}>
                        RT 0{n}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Bagian Pokja</label>
                  <select
                    value={pkkForm.pokja || 'Pokja I'}
                    onChange={(e) => setPkkForm({ ...pkkForm, pokja: e.target.value as any })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm focus:outline-emerald-600 bg-white"
                  >
                    <option value="Pengurus Inti">Pengurus Inti</option>
                    <option value="Pokja I">Pokja I</option>
                    <option value="Pokja II">Pokja II</option>
                    <option value="Pokja III">Pokja III</option>
                    <option value="Pokja IV">Pokja IV</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Jabatan</label>
                <input
                  type="text"
                  value={pkkForm.jabatan || ''}
                  onChange={(e) => setPkkForm({ ...pkkForm, jabatan: e.target.value })}
                  placeholder="Contoh: Ketua Pokja III / Sekretaris"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm focus:outline-emerald-600"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Nomor Kontak WhatsApp</label>
                <input
                  type="text"
                  value={pkkForm.noHp || ''}
                  onChange={(e) => setPkkForm({ ...pkkForm, noHp: e.target.value })}
                  placeholder="0813-..."
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm focus:outline-emerald-600"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsPkkModalOpen(false)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-medium text-xs transition"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-semibold text-xs transition shadow-sm flex items-center gap-1.5"
                >
                  <Save className="w-3.5 h-3.5" />
                  <span>Simpan PKK</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: POSYANDU KADER */}
      {isPosyanduModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4">
            <div className="flex justify-between items-center pb-3 border-b border-slate-100">
              <h3 className="font-bold text-slate-900">
                {editingPosyandu ? 'Edit Data Kader Posyandu' : 'Tambah Kader Posyandu Baru'}
              </h3>
              <button
                onClick={() => setIsPosyanduModalOpen(false)}
                className="p-1 text-slate-400 hover:text-slate-700 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSavePosyanduSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Nama Lengkap & Gelar</label>
                <input
                  type="text"
                  value={posyanduForm.nama || ''}
                  onChange={(e) => setPosyanduForm({ ...posyanduForm, nama: e.target.value })}
                  placeholder="Contoh: Bidan Rina Melati"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm focus:outline-emerald-600"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Jabatan / Peran Posyandu</label>
                <input
                  type="text"
                  value={posyanduForm.jabatan || ''}
                  onChange={(e) => setPosyanduForm({ ...posyanduForm, jabatan: e.target.value })}
                  placeholder="Contoh: Bidan Desa Pembina / Kader Penimbangan"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm focus:outline-emerald-600"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Wilayah RT</label>
                  <select
                    value={posyanduForm.rt || 1}
                    onChange={(e) => setPosyanduForm({ ...posyanduForm, rt: Number(e.target.value) as RTNumber })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm focus:outline-emerald-600 bg-white"
                  >
                    {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((n) => (
                      <option key={n} value={n}>
                        RT 0{n}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">No HP / WhatsApp</label>
                  <input
                    type="text"
                    value={posyanduForm.noHp || ''}
                    onChange={(e) => setPosyanduForm({ ...posyanduForm, noHp: e.target.value })}
                    placeholder="0812-..."
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm focus:outline-emerald-600"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsPosyanduModalOpen(false)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-medium text-xs transition"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-semibold text-xs transition shadow-sm flex items-center gap-1.5"
                >
                  <Save className="w-3.5 h-3.5" />
                  <span>Simpan Kader</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      {/* DELETE CONFIRMATION MODAL */}
      {deleteTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4 animate-fade-in">
          <div className="bg-white rounded-2xl max-w-sm w-full p-6 shadow-2xl space-y-4 text-center">
            <div className="w-12 h-12 rounded-full bg-rose-100 text-rose-600 flex items-center justify-center mx-auto">
              <Trash2 className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-bold text-slate-900 text-lg">Konfirmasi Hapus</h3>
              <p className="text-xs text-slate-500 mt-1">
                Apakah Anda yakin ingin menghapus data <strong className="text-slate-800">{deleteTarget.label}</strong>? Tindakan ini tidak dapat dibatalkan.
              </p>
            </div>
            <div className="flex gap-2 pt-2">
              <button
                type="button"
                onClick={() => setDeleteTarget(null)}
                className="flex-1 px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-medium text-xs transition"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={confirmDelete}
                className="flex-1 px-4 py-2.5 bg-rose-600 hover:bg-rose-700 text-white rounded-xl font-semibold text-xs transition shadow-sm"
              >
                Ya, Hapus
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
