import React, { useState, useRef } from 'react';
import {
  FileSpreadsheet,
  Upload,
  Download,
  CheckCircle,
  AlertTriangle,
  X,
  Sparkles,
  RefreshCw,
  FileCheck,
  Building2,
} from 'lucide-react';
import { Warga, RTNumber } from '../types';
import {
  parseWargaFromCSV,
  parseWargaFromJSON,
  generateTemplateCSV,
  generateSampleCsvForRT,
  ImportValidationResult,
} from '../utils/wargaImporter';
import { exportToCSV } from '../utils/formatters';

interface ImportRtModalProps {
  isOpen: boolean;
  onClose: () => void;
  onImportSuccess: (newWarga: Warga[]) => void;
  existingWarga: Warga[];
  initialRt?: RTNumber;
}

export const ImportRtModal: React.FC<ImportRtModalProps> = ({
  isOpen,
  onClose,
  onImportSuccess,
  existingWarga,
  initialRt,
}) => {
  const [selectedRt, setSelectedRt] = useState<RTNumber>(initialRt || 1);
  const [activeInputTab, setActiveInputTab] = useState<'paste' | 'file'>('file');
  const [pastedText, setPastedText] = useState('');
  const [duplicateStrategy, setDuplicateStrategy] = useState<'skip' | 'update'>('skip');
  const [validationResult, setValidationResult] = useState<ImportValidationResult | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [uploadedFileName, setUploadedFileName] = useState<string>('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  // Template CSV Download
  const handleDownloadTemplate = () => {
    const csvContent = generateTemplateCSV();
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.setAttribute('download', `template_import_warga_rt_rw22.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Sample data quick injector for RT 1-9 testing
  const handleLoadSampleRT = (rtNum: RTNumber) => {
    const sample = generateSampleCsvForRT(rtNum);
    setPastedText(sample);
    setActiveInputTab('paste');
    const res = parseWargaFromCSV(sample, rtNum, existingWarga);
    setValidationResult(res);
  };

  const handleProcessText = (text: string, rt: RTNumber = selectedRt) => {
    if (!text.trim()) {
      setValidationResult(null);
      return;
    }

    if (text.trim().startsWith('{') || text.trim().startsWith('[')) {
      const res = parseWargaFromJSON(text, rt, existingWarga);
      setValidationResult(res);
    } else {
      const res = parseWargaFromCSV(text, rt, existingWarga);
      setValidationResult(res);
    }
  };

  const handleFileChange = (file: File) => {
    setUploadedFileName(file.name);
    const reader = new FileReader();
    reader.onload = (evt) => {
      const content = evt.target?.result as string;
      setPastedText(content);
      handleProcessText(content, selectedRt);
    };
    reader.readAsText(file);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const file = e.dataTransfer.files[0];
      handleFileChange(file);
    }
  };

  const handleExecuteImport = () => {
    if (!validationResult || validationResult.validWarga.length === 0) return;
    setIsProcessing(true);

    setTimeout(() => {
      const imported = validationResult.validWarga;
      let finalWargaList: Warga[] = [];

      if (duplicateStrategy === 'update') {
        // Replace existing with same NIK or add new
        const incomingNikMap = new Map(imported.map((w) => [w.nik, w]));
        const updatedExisting = existingWarga.map((w) =>
          incomingNikMap.has(w.nik) ? incomingNikMap.get(w.nik)! : w
        );
        const existingNiks = new Set(existingWarga.map((w) => w.nik));
        const purelyNew = imported.filter((w) => !existingNiks.has(w.nik));
        finalWargaList = [...purelyNew, ...updatedExisting];
      } else {
        // Skip existing NIKs
        const existingNiks = new Set(existingWarga.map((w) => w.nik));
        const purelyNew = imported.filter((w) => !existingNiks.has(w.nik));
        finalWargaList = [...purelyNew, ...existingWarga];
      }

      onImportSuccess(finalWargaList);
      setIsProcessing(false);
      onClose();
    }, 400);
  };

  const previewList = validationResult?.validWarga || [];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-3 sm:p-5 overflow-y-auto">
      <div className="bg-white rounded-2xl max-w-4xl w-full shadow-2xl border border-slate-200 overflow-hidden my-auto max-h-[92vh] flex flex-col">
        {/* Modal Header */}
        <div className="bg-slate-900 text-white p-4 sm:p-5 flex justify-between items-center flex-shrink-0">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-600 flex items-center justify-center text-white shadow-xs">
              <FileSpreadsheet className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <span>Import Data Warga Pengurus RT 01 s/d RT 09</span>
              </h3>
              <p className="text-xs text-slate-300">
                Sistem Informasi Manajemen RW 22 Bumi Pesona Asri • Desa Jelegong
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

        {/* Modal Body */}
        <div className="p-4 sm:p-6 overflow-y-auto space-y-4 flex-1">
          {/* Target RT Selection & Quick Template */}
          <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 flex flex-col md:flex-row md:items-center justify-between gap-3">
            <div>
              <label className="text-xs font-bold text-slate-800 block mb-0.5">
                Pengurus RT Asal / Target Wilayah:
              </label>
              <p className="text-xs text-slate-500">
                Pilih RT jika berkas sumber tidak menyertakan kolom nomor RT eksplisit.
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <select
                id="select-import-rt"
                value={selectedRt}
                onChange={(e) => {
                  const newRt = Number(e.target.value) as RTNumber;
                  setSelectedRt(newRt);
                  if (pastedText) {
                    handleProcessText(pastedText, newRt);
                  }
                }}
                className="px-3 py-1.5 bg-white border border-slate-300 rounded-lg text-xs font-semibold text-slate-800 focus:ring-2 focus:ring-emerald-500 outline-hidden"
              >
                {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((rt) => (
                  <option key={rt} value={rt}>
                    RT 0{rt} (Rukun Tetangga 0{rt})
                  </option>
                ))}
              </select>
              <button
                onClick={handleDownloadTemplate}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white hover:bg-slate-100 text-slate-700 border border-slate-300 rounded-lg text-xs font-medium transition"
                title="Unduh format spreadsheet CSV"
              >
                <Download className="w-3.5 h-3.5 text-emerald-600" />
                <span>Unduh Format CSV</span>
              </button>
            </div>
          </div>

          {/* Preset Buttons for Quick Testing RT 1 to RT 9 */}
          <div className="p-3 bg-emerald-50/60 rounded-xl border border-emerald-100 space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="font-bold text-emerald-900 flex items-center gap-1.5">
                <Sparkles className="w-4 h-4 text-emerald-600" />
                <span>Contoh Data Siap Pakai per RT:</span>
              </span>
              <span className="text-emerald-700 text-[11px]">
                Klik RT untuk mengisi contoh format otomatis
              </span>
            </div>
            <div className="flex flex-wrap gap-1.5">
              {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((rtNum) => (
                <button
                  key={rtNum}
                  onClick={() => {
                    setSelectedRt(rtNum as RTNumber);
                    handleLoadSampleRT(rtNum as RTNumber);
                  }}
                  className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition ${
                    selectedRt === rtNum
                      ? 'bg-emerald-600 text-white shadow-xs'
                      : 'bg-white text-slate-700 hover:bg-emerald-100 border border-emerald-200'
                  }`}
                >
                  Contoh RT 0{rtNum}
                </button>
              ))}
            </div>
          </div>

          {/* Mode Switch: Paste Table vs File Upload */}
          <div className="flex border-b border-slate-200 gap-4">
            <button
              onClick={() => setActiveInputTab('file')}
              className={`pb-2 text-xs font-bold border-b-2 transition flex items-center gap-1.5 ${
                activeInputTab === 'file'
                  ? 'border-emerald-600 text-emerald-700'
                  : 'border-transparent text-slate-500 hover:text-slate-800'
              }`}
            >
              <Upload className="w-4 h-4" />
              <span>Unggah Berkas (CSV / TXT / JSON)</span>
            </button>
            <button
              onClick={() => setActiveInputTab('paste')}
              className={`pb-2 text-xs font-bold border-b-2 transition flex items-center gap-1.5 ${
                activeInputTab === 'paste'
                  ? 'border-emerald-600 text-emerald-700'
                  : 'border-transparent text-slate-500 hover:text-slate-800'
              }`}
            >
              <FileSpreadsheet className="w-4 h-4" />
              <span>Salin & Tempel Teks (Copy-Paste)</span>
            </button>
          </div>

          {/* File Upload Zone */}
          {activeInputTab === 'file' ? (
            <div
              onDragOver={(e) => {
                e.preventDefault();
                setIsDragging(true);
              }}
              onDragLeave={() => setIsDragging(false)}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
              className={`border-2 border-dashed rounded-2xl p-6 text-center transition cursor-pointer ${
                isDragging
                  ? 'border-emerald-500 bg-emerald-50'
                  : 'border-slate-300 hover:border-emerald-500 bg-slate-50'
              }`}
            >
              <Upload className="w-8 h-8 text-emerald-600 mx-auto mb-2" />
              <p className="text-xs font-bold text-slate-800">
                {uploadedFileName
                  ? `Berkas Terpilih: ${uploadedFileName}`
                  : 'Klik atau Seret (Drag & Drop) File CSV / TXT / JSON ke Sini'}
              </p>
              <p className="text-[11px] text-slate-500 mt-1 mb-3">
                Mendukung ekspor tabel warga dari Excel/Spreadsheet pengurus RT 01 s/d RT 09
              </p>
              <input
                ref={fileInputRef}
                type="file"
                accept=".csv, .txt, .json, .tsv"
                onChange={(e) => {
                  if (e.target.files?.[0]) {
                    handleFileChange(e.target.files[0]);
                  }
                }}
                className="hidden"
              />
              <button
                type="button"
                className="px-3.5 py-1.5 bg-emerald-600 text-white rounded-lg text-xs font-semibold hover:bg-emerald-700 shadow-xs"
              >
                Pilih Berkas dari Komputer
              </button>
            </div>
          ) : (
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-xs text-slate-500">
                  Tempel data CSV (koma / titik koma / tab) atau JSON dari RT:
                </span>
                {pastedText && (
                  <button
                    onClick={() => {
                      setPastedText('');
                      setValidationResult(null);
                    }}
                    className="text-xs text-rose-600 hover:underline"
                  >
                    Bersihkan Teks
                  </button>
                )}
              </div>
              <textarea
                id="input-paste-warga"
                rows={5}
                value={pastedText}
                onChange={(e) => {
                  setPastedText(e.target.value);
                  handleProcessText(e.target.value, selectedRt);
                }}
                placeholder="Format kolom: NIK, NoKK, NamaLengkap, RT, Alamat, JenisKelamin(L/P), TempatLahir, TanggalLahir, Agama, StatusPerkawinan, StatusKeluarga, Pekerjaan, NoHP, StatusDomisili, GolonganDarah"
                className="w-full p-3 font-mono text-xs bg-slate-50 border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:bg-white outline-hidden"
              />
            </div>
          )}

          {/* Duplicate Handling Options */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 p-3 bg-slate-100 rounded-xl text-xs">
            <span className="font-semibold text-slate-700">
              Kebijakan Data NIK yang Sudah Ada:
            </span>
            <div className="flex items-center gap-3">
              <label className="inline-flex items-center gap-1.5 cursor-pointer">
                <input
                  type="radio"
                  name="dup-strat"
                  checked={duplicateStrategy === 'skip'}
                  onChange={() => setDuplicateStrategy('skip')}
                  className="text-emerald-600 focus:ring-emerald-500"
                />
                <span className="text-slate-800">Lewati Duplikat (Aman)</span>
              </label>
              <label className="inline-flex items-center gap-1.5 cursor-pointer">
                <input
                  type="radio"
                  name="dup-strat"
                  checked={duplicateStrategy === 'update'}
                  onChange={() => setDuplicateStrategy('update')}
                  className="text-emerald-600 focus:ring-emerald-500"
                />
                <span className="text-slate-800">Perbarui / Timpa Data Lama</span>
              </label>
            </div>
          </div>

          {/* Validation summary & Warnings */}
          {validationResult && (
            <div className="space-y-3">
              {/* Summary Stats */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                <div className="p-2.5 bg-emerald-50 border border-emerald-200 rounded-xl text-center">
                  <span className="text-[10px] uppercase font-bold text-emerald-700 block">
                    Data Valid
                  </span>
                  <span className="text-lg font-extrabold text-emerald-800">
                    {validationResult.summary.validCount}
                  </span>
                </div>
                <div className="p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-center">
                  <span className="text-[10px] uppercase font-bold text-slate-600 block">
                    Total Baris
                  </span>
                  <span className="text-lg font-extrabold text-slate-800">
                    {validationResult.summary.totalRows}
                  </span>
                </div>
                <div className="p-2.5 bg-amber-50 border border-amber-200 rounded-xl text-center">
                  <span className="text-[10px] uppercase font-bold text-amber-700 block">
                    NIK Duplikat
                  </span>
                  <span className="text-lg font-extrabold text-amber-800">
                    {validationResult.summary.duplicateNikCount}
                  </span>
                </div>
                <div className="p-2.5 bg-blue-50 border border-blue-200 rounded-xl text-center">
                  <span className="text-[10px] uppercase font-bold text-blue-700 block">
                    Distribusi RT
                  </span>
                  <span className="text-xs font-bold text-blue-800 mt-1 block">
                    {Object.entries(validationResult.summary.perRtCount)
                      .filter(([_, count]) => Number(count) > 0)
                      .map(([rt, count]) => `RT 0${rt}: ${count}`)
                      .join(', ') || 'Belum ada'}
                  </span>
                </div>
              </div>

              {/* Error messages if any */}
              {validationResult.errors.length > 0 && (
                <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-900 space-y-1">
                  <div className="flex items-center gap-1.5 font-bold text-rose-800">
                    <AlertTriangle className="w-4 h-4 text-rose-600" />
                    <span>Kendala Validasi Berkas:</span>
                  </div>
                  <ul className="list-disc pl-5 space-y-0.5 max-h-20 overflow-y-auto">
                    {validationResult.errors.map((err, i) => (
                      <li key={i}>{err}</li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Warning messages if any */}
              {validationResult.warnings.length > 0 && (
                <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-xs text-amber-900 space-y-1">
                  <div className="flex items-center gap-1.5 font-bold text-amber-800">
                    <AlertTriangle className="w-4 h-4 text-amber-600" />
                    <span>Catatan & Peringatan ({validationResult.warnings.length}):</span>
                  </div>
                  <ul className="list-disc pl-5 space-y-0.5 max-h-20 overflow-y-auto">
                    {validationResult.warnings.map((warn, i) => (
                      <li key={i}>{warn}</li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Preview Table */}
              {previewList.length > 0 && (
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-xs font-bold text-slate-800">
                      Pratinjau Hasil Parsing ({previewList.length} Calon Warga):
                    </span>
                    <span className="text-[11px] text-emerald-700 font-semibold bg-emerald-50 px-2 py-0.5 rounded flex items-center gap-1">
                      <FileCheck className="w-3.5 h-3.5" />
                      <span>Format Terverifikasi</span>
                    </span>
                  </div>

                  <div className="border border-slate-200 rounded-xl overflow-hidden max-h-48 overflow-y-auto">
                    <table className="w-full text-left text-xs">
                      <thead className="bg-slate-100 text-slate-600 font-semibold sticky top-0">
                        <tr>
                          <th className="p-2">No</th>
                          <th className="p-2">Nama Lengkap</th>
                          <th className="p-2">NIK</th>
                          <th className="p-2">RT</th>
                          <th className="p-2">Alamat</th>
                          <th className="p-2">JK</th>
                          <th className="p-2">Status Keluarga</th>
                          <th className="p-2">No HP</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {previewList.map((row, idx) => (
                          <tr key={idx} className="hover:bg-slate-50">
                            <td className="p-2 text-slate-400">{idx + 1}</td>
                            <td className="p-2 font-semibold text-slate-900">{row.nama}</td>
                            <td className="p-2 font-mono text-slate-600">{row.nik}</td>
                            <td className="p-2">
                              <span className="bg-emerald-100 text-emerald-800 px-1.5 py-0.5 rounded font-bold text-[10px]">
                                RT 0{row.rt}
                              </span>
                            </td>
                            <td className="p-2 text-slate-600 truncate max-w-[140px]">
                              {row.alamat}
                            </td>
                            <td className="p-2">{row.jenisKelamin}</td>
                            <td className="p-2 text-slate-600">{row.statusDalamKeluarga}</td>
                            <td className="p-2 font-mono text-slate-500">{row.noHp || '-'}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="bg-slate-50 p-4 border-t border-slate-200 flex justify-between items-center flex-shrink-0">
          <button
            onClick={onClose}
            className="px-4 py-2 border border-slate-300 text-slate-700 hover:bg-slate-100 rounded-xl text-xs font-semibold transition"
          >
            Batal
          </button>

          <button
            id="btn-confirm-import"
            disabled={previewList.length === 0 || isProcessing}
            onClick={handleExecuteImport}
            className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white rounded-xl text-xs font-bold shadow-xs transition flex items-center gap-2"
          >
            <CheckCircle className="w-4 h-4" />
            <span>
              {isProcessing
                ? 'Menyimpan Data...'
                : `Simpan & Import ${previewList.length} Data Warga ke RW 22`}
            </span>
          </button>
        </div>
      </div>
    </div>
  );
};
