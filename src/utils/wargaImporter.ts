import { Warga, RTNumber } from '../types';

export interface ImportValidationResult {
  success: boolean;
  validWarga: Warga[];
  errors: string[];
  warnings: string[];
  summary: {
    totalRows: number;
    validCount: number;
    duplicateNikCount: number;
    perRtCount: Record<RTNumber, number>;
  };
}

// Normalize field names to handle various header formats from RT 1-9
export function normalizeHeaderKey(header: string): string {
  const cleaned = header
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]/g, '');

  if (cleaned.includes('nik') || cleaned.includes('ktp') || cleaned.includes('nomorinduk')) return 'nik';
  if (cleaned.includes('nokk') || cleaned.includes('kartukeluarga') || cleaned.includes('kk')) return 'noKk';
  if (cleaned.includes('nama') || cleaned.includes('fullname') || cleaned.includes('warga')) return 'nama';
  if (cleaned === 'rt' || cleaned.includes('rukuntetangga') || cleaned.includes('nomorrt')) return 'rt';
  if (cleaned.includes('alamat') || cleaned.includes('blok') || cleaned.includes('rumah') || cleaned.includes('jalan')) return 'alamat';
  if (cleaned.includes('jk') || cleaned.includes('jeniskelamin') || cleaned.includes('kelamin') || cleaned.includes('sex') || cleaned.includes('gender')) return 'jenisKelamin';
  if (cleaned.includes('tempat') || cleaned.includes('tmp') || cleaned.includes('tempatlahir')) return 'tempatLahir';
  if (cleaned.includes('tanggallahir') || cleaned.includes('tgllahir') || cleaned.includes('tgl') || cleaned.includes('dob') || cleaned.includes('birthdate')) return 'tanggalLahir';
  if (cleaned.includes('agama') || cleaned.includes('religion')) return 'agama';
  if (cleaned.includes('perkawinan') || cleaned.includes('nikah') || cleaned.includes('marital')) return 'statusPerkawinan';
  if (cleaned.includes('keluarga') || cleaned.includes('statuskeluarga') || cleaned.includes('hubungan')) return 'statusDalamKeluarga';
  if (cleaned.includes('pekerjaan') || cleaned.includes('profesi') || cleaned.includes('kerja') || cleaned.includes('job')) return 'pekerjaan';
  if (cleaned.includes('hp') || cleaned.includes('telepon') || cleaned.includes('telp') || cleaned.includes('wa') || cleaned.includes('phone') || cleaned.includes('kontak')) return 'noHp';
  if (cleaned.includes('domisili') || cleaned.includes('tinggal') || cleaned.includes('statusdomisili')) return 'statusDomisili';
  if (cleaned.includes('darah') || cleaned.includes('goldarah')) return 'golonganDarah';

  return cleaned;
}

// Auto-detect CSV/TSV delimiter
function detectDelimiter(firstFewLines: string): string {
  const delimiters = [',', ';', '\t', '|'];
  let bestDelimiter = ',';
  let maxCount = -1;

  for (const del of delimiters) {
    const count = (firstFewLines.match(new RegExp(`\\${del}`, 'g')) || []).length;
    if (count > maxCount) {
      maxCount = count;
      bestDelimiter = del;
    }
  }

  return bestDelimiter;
}

// Helper to parse CSV line preserving quotes
function splitCsvLine(line: string, delimiter: string): string[] {
  const result: string[] = [];
  let current = '';
  let inQuotes = false;

  for (let i = 0; i < line.length; i++) {
    const char = line[i];
    if (char === '"') {
      if (inQuotes && line[i + 1] === '"') {
        current += '"';
        i++;
      } else {
        inQuotes = !inQuotes;
      }
    } else if (char === delimiter && !inQuotes) {
      result.push(current.trim());
      current = '';
    } else {
      current += char;
    }
  }
  result.push(current.trim());
  return result.map((s) => s.replace(/^"|"$/g, '').trim());
}

// Normalize date into YYYY-MM-DD
export function normalizeDate(dateStr?: string): string {
  if (!dateStr) return '1990-01-01';
  const clean = dateStr.trim();

  // If already YYYY-MM-DD
  if (/^\d{4}-\d{2}-\d{2}$/.test(clean)) {
    return clean;
  }

  // If DD/MM/YYYY or DD-MM-YYYY
  const dmyMatch = clean.match(/^(\d{1,2})[\/\-](\d{1,2})[\/\-](\d{4})$/);
  if (dmyMatch) {
    const day = dmyMatch[1].padStart(2, '0');
    const month = dmyMatch[2].padStart(2, '0');
    const year = dmyMatch[3];
    return `${year}-${month}-${day}`;
  }

  return '1990-01-01';
}

// Clean phone numbers
export function normalizePhone(rawPhone?: string): string {
  if (!rawPhone) return '';
  let cleaned = rawPhone.replace(/[^\d+]/g, '');
  if (cleaned.startsWith('+62')) {
    cleaned = '0' + cleaned.substring(3);
  } else if (cleaned.startsWith('62')) {
    cleaned = '0' + cleaned.substring(2);
  }
  return cleaned;
}

// Validate RT number between 1 and 9
export function normalizeRt(rawRt: any, fallbackRt: RTNumber = 1): RTNumber {
  if (!rawRt) return fallbackRt;
  const num = parseInt(String(rawRt).replace(/[^\d]/g, ''), 10);
  if (num >= 1 && num <= 9) {
    return num as RTNumber;
  }
  return fallbackRt;
}

/**
 * Main parser function for CSV / Text input from RT 1-9
 */
export function parseWargaFromCSV(
  csvContent: string,
  targetDefaultRt: RTNumber = 1,
  existingWarga: Warga[] = []
): ImportValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];
  const validWarga: Warga[] = [];
  const existingNiks = new Set(existingWarga.map((w) => w.nik));
  let duplicateNikCount = 0;

  const perRtCount: Record<RTNumber, number> = {
    1: 0,
    2: 0,
    3: 0,
    4: 0,
    5: 0,
    6: 0,
    7: 0,
    8: 0,
    9: 0,
  };

  const lines = csvContent
    .split(/\r?\n/)
    .map((l) => l.trim())
    .filter((l) => l.length > 0);

  if (lines.length === 0) {
    return {
      success: false,
      validWarga: [],
      errors: ['Konten berkas/teks kosong. Silakan unggah file CSV atau salin data teks warga.'],
      warnings: [],
      summary: { totalRows: 0, validCount: 0, duplicateNikCount: 0, perRtCount },
    };
  }

  const delimiter = detectDelimiter(lines.slice(0, 5).join('\n'));
  const rawHeaders = splitCsvLine(lines[0], delimiter);
  const normalizedHeaders = rawHeaders.map(normalizeHeaderKey);

  // Check if first line is a header row
  const hasHeader =
    normalizedHeaders.includes('nama') ||
    normalizedHeaders.includes('nik') ||
    normalizedHeaders.includes('alamat');

  const dataStartIndex = hasHeader ? 1 : 0;

  // Header indices map
  const headerMap: Record<string, number> = {};
  if (hasHeader) {
    normalizedHeaders.forEach((key, index) => {
      if (!headerMap[key]) {
        headerMap[key] = index;
      }
    });
  }

  for (let i = dataStartIndex; i < lines.length; i++) {
    const lineNum = i + 1;
    const cols = splitCsvLine(lines[i], delimiter);

    // If empty row
    if (cols.every((c) => c === '')) continue;

    let nik = '';
    let noKk = '';
    let nama = '';
    let rtNum = targetDefaultRt;
    let alamat = '';
    let jk: 'L' | 'P' = 'L';
    let tempatLahir = 'Bandung';
    let tanggalLahir = '1990-01-01';
    let agama = 'Islam';
    let statusPerkawinan: any = 'Kawin';
    let statusDalamKeluarga: any = 'Kepala Keluarga';
    let pekerjaan = 'Karyawan Swasta';
    let noHp = '';
    let statusDomisili: any = 'Tetap';
    let golonganDarah = '-';

    if (hasHeader) {
      nama = (cols[headerMap['nama']] || '').trim();
      nik = (cols[headerMap['nik']] || '').replace(/[^\d]/g, '');
      noKk = (cols[headerMap['noKk']] || '').replace(/[^\d]/g, '') || nik;
      const rawRtVal = cols[headerMap['rt']];
      rtNum = normalizeRt(rawRtVal, targetDefaultRt);
      alamat = (cols[headerMap['alamat']] || '').trim();
      
      const rawJk = (cols[headerMap['jenisKelamin']] || '').toUpperCase().trim();
      jk = rawJk.startsWith('P') || rawJk.startsWith('W') ? 'P' : 'L';
      
      tempatLahir = (cols[headerMap['tempatLahir']] || 'Bandung').trim();
      tanggalLahir = normalizeDate(cols[headerMap['tanggalLahir']]);
      agama = (cols[headerMap['agama']] || 'Islam').trim();
      
      const rawKawin = (cols[headerMap['statusPerkawinan']] || '').toLowerCase();
      if (rawKawin.includes('belum')) statusPerkawinan = 'Belum Kawin';
      else if (rawKawin.includes('hidup')) statusPerkawinan = 'Cerai Hidup';
      else if (rawKawin.includes('mati')) statusPerkawinan = 'Cerai Mati';
      else statusPerkawinan = 'Kawin';

      const rawKeluarga = (cols[headerMap['statusDalamKeluarga']] || '').toLowerCase();
      if (rawKeluarga.includes('istri')) statusDalamKeluarga = 'Istri';
      else if (rawKeluarga.includes('anak')) statusDalamKeluarga = 'Anak';
      else if (rawKeluarga.includes('famili') || rawKeluarga.includes('lain')) statusDalamKeluarga = 'Famili Lain';
      else statusDalamKeluarga = 'Kepala Keluarga';

      pekerjaan = (cols[headerMap['pekerjaan']] || 'Wiraswasta').trim();
      noHp = normalizePhone(cols[headerMap['noHp']]);
      
      const rawDom = (cols[headerMap['statusDomisili']] || '').toLowerCase();
      if (rawDom.includes('kontrak') || rawDom.includes('sewa')) statusDomisili = 'Kontrak';
      else if (rawDom.includes('kos')) statusDomisili = 'Kos';
      else statusDomisili = 'Tetap';

      golonganDarah = (cols[headerMap['golonganDarah']] || '-').toUpperCase().trim();
    } else {
      // Positional fallback: NIK, NoKK, Nama, RT, Alamat, JK, Tempat, Tgl, Agama, Kawin, Keluarga, Kerja, HP, Dom, Gol
      nik = (cols[0] || '').replace(/[^\d]/g, '');
      noKk = (cols[1] || '').replace(/[^\d]/g, '') || nik;
      nama = (cols[2] || '').trim();
      rtNum = normalizeRt(cols[3], targetDefaultRt);
      alamat = (cols[4] || `Bumi Pesona Asri RT 0${rtNum}`).trim();
      const rawJk = (cols[5] || '').toUpperCase().trim();
      jk = rawJk.startsWith('P') ? 'P' : 'L';
      tempatLahir = cols[6] || 'Bandung';
      tanggalLahir = normalizeDate(cols[7]);
      agama = cols[8] || 'Islam';
      statusPerkawinan = (cols[9] as any) || 'Kawin';
      statusDalamKeluarga = (cols[10] as any) || 'Kepala Keluarga';
      pekerjaan = cols[11] || 'Karyawan Swasta';
      noHp = normalizePhone(cols[12]);
      statusDomisili = (cols[13] as any) || 'Tetap';
      golonganDarah = cols[14] || '-';
    }

    // Validation checks
    if (!nama) {
      errors.push(`Baris ${lineNum}: Kolom Nama Warga tidak boleh kosong.`);
      continue;
    }

    if (!nik || nik.length < 12) {
      // Create a deterministic fallback NIK if missing
      const generatedNik = `320405${String(Date.now()).slice(-6)}${String(i).padStart(4, '0')}`;
      warnings.push(`Baris ${lineNum}: NIK warga "${nama}" tidak lengkap/kosong, digenerate sementara: ${generatedNik}`);
      nik = generatedNik;
    }

    if (!alamat) {
      alamat = `Bumi Pesona Asri Blok RT 0${rtNum} RW 22`;
    }

    if (existingNiks.has(nik)) {
      duplicateNikCount++;
      warnings.push(`Baris ${lineNum}: NIK ${nik} (${nama}) sudah terdaftar dalam sistem (akan diperbarui).`);
    }

    const item: Warga = {
      id: `w-imp-${Date.now()}-${i}`,
      nik,
      noKk: noKk || nik,
      nama,
      rt: rtNum,
      rw: '22',
      alamat,
      jenisKelamin: jk,
      tempatLahir,
      tanggalLahir,
      agama,
      statusPerkawinan,
      statusDalamKeluarga,
      pekerjaan,
      noHp,
      statusDomisili,
      golonganDarah,
      tanggalTerdaftar: new Date().toISOString().slice(0, 10),
    };

    validWarga.push(item);
    perRtCount[rtNum] = (perRtCount[rtNum] || 0) + 1;
  }

  return {
    success: validWarga.length > 0,
    validWarga,
    errors,
    warnings,
    summary: {
      totalRows: lines.length - dataStartIndex,
      validCount: validWarga.length,
      duplicateNikCount,
      perRtCount,
    },
  };
}

/**
 * Parse JSON format from RT records
 */
export function parseWargaFromJSON(
  jsonText: string,
  targetDefaultRt: RTNumber = 1,
  existingWarga: Warga[] = []
): ImportValidationResult {
  try {
    const rawData = JSON.parse(jsonText);
    const arrayData = Array.isArray(rawData) ? rawData : rawData.warga || rawData.data || [];

    if (!Array.isArray(arrayData) || arrayData.length === 0) {
      return {
        success: false,
        validWarga: [],
        errors: ['Format JSON tidak valid atau tidak berisi array data warga.'],
        warnings: [],
        summary: {
          totalRows: 0,
          validCount: 0,
          duplicateNikCount: 0,
          perRtCount: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0, 6: 0, 7: 0, 8: 0, 9: 0 },
        },
      };
    }

    const existingNiks = new Set(existingWarga.map((w) => w.nik));
    let duplicateNikCount = 0;
    const warnings: string[] = [];
    const validWarga: Warga[] = [];
    const perRtCount: Record<RTNumber, number> = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0, 6: 0, 7: 0, 8: 0, 9: 0 };

    arrayData.forEach((row: any, idx: number) => {
      const nama = row.nama || row.namaLengkap || row.name || '';
      if (!nama) return;

      let nik = String(row.nik || '').replace(/[^\d]/g, '');
      if (!nik || nik.length < 12) {
        nik = `320405${Date.now()}${idx}`;
      }

      if (existingNiks.has(nik)) {
        duplicateNikCount++;
      }

      const rtNum = normalizeRt(row.rt, targetDefaultRt);

      const item: Warga = {
        id: `w-json-${Date.now()}-${idx}`,
        nik,
        noKk: String(row.noKk || row.kk || nik).replace(/[^\d]/g, ''),
        nama,
        rt: rtNum,
        rw: '22',
        alamat: row.alamat || `Bumi Pesona Asri Blok RT 0${rtNum}`,
        jenisKelamin: (row.jenisKelamin || 'L').toUpperCase().startsWith('P') ? 'P' : 'L',
        tempatLahir: row.tempatLahir || 'Bandung',
        tanggalLahir: normalizeDate(row.tanggalLahir),
        agama: row.agama || 'Islam',
        statusPerkawinan: row.statusPerkawinan || 'Kawin',
        statusDalamKeluarga: row.statusDalamKeluarga || 'Kepala Keluarga',
        pekerjaan: row.pekerjaan || 'Karyawan Swasta',
        noHp: normalizePhone(row.noHp || row.telepon),
        statusDomisili: row.statusDomisili || 'Tetap',
        golonganDarah: row.golonganDarah || '-',
        tanggalTerdaftar: new Date().toISOString().slice(0, 10),
      };

      validWarga.push(item);
      perRtCount[rtNum] = (perRtCount[rtNum] || 0) + 1;
    });

    return {
      success: validWarga.length > 0,
      validWarga,
      errors: [],
      warnings,
      summary: {
        totalRows: arrayData.length,
        validCount: validWarga.length,
        duplicateNikCount,
        perRtCount,
      },
    };
  } catch (err: any) {
    return {
      success: false,
      validWarga: [],
      errors: [`Gagal memproses berkas JSON: ${err.message || 'Syntax JSON tidak valid'}`],
      warnings: [],
      summary: {
        totalRows: 0,
        validCount: 0,
        duplicateNikCount: 0,
        perRtCount: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0, 6: 0, 7: 0, 8: 0, 9: 0 },
      },
    };
  }
}

/**
 * Generate official CSV Template for RT 01 to RT 09
 */
export function generateTemplateCSV(): string {
  const headers = [
    'NIK',
    'NoKK',
    'NamaLengkap',
    'RT',
    'Alamat',
    'JenisKelamin_L_P',
    'TempatLahir',
    'TanggalLahir_YYYY_MM_DD',
    'Agama',
    'StatusPerkawinan',
    'StatusKeluarga',
    'Pekerjaan',
    'NoHP',
    'StatusDomisili',
    'GolonganDarah',
  ];

  const exampleRow1 = [
    '3204051101900001',
    '3204051101900088',
    'Budi Santoso',
    '1',
    'Bumi Pesona Asri Blok A1 No. 08',
    'L',
    'Bandung',
    '1990-01-11',
    'Islam',
    'Kawin',
    'Kepala Keluarga',
    'Karyawan Swasta',
    '0812-3456-7890',
    'Tetap',
    'O',
  ];

  const exampleRow2 = [
    '3204055208940002',
    '3204051101900088',
    'Siti Rahayu',
    '1',
    'Bumi Pesona Asri Blok A1 No. 08',
    'P',
    'Garut',
    '1994-08-12',
    'Islam',
    'Kawin',
    'Istri',
    'Mengurus Rumah Tangga',
    '0812-3456-7891',
    'Tetap',
    'A',
  ];

  return [headers.join(','), exampleRow1.join(','), exampleRow2.join(',')].join('\n');
}

/**
 * Generate Sample CSV for specific RT (1-9)
 */
export function generateSampleCsvForRT(rt: RTNumber): string {
  const headers = 'NIK,NoKK,NamaLengkap,RT,Alamat,JenisKelamin_L_P,TempatLahir,TanggalLahir_YYYY_MM_DD,Agama,StatusPerkawinan,StatusKeluarga,Pekerjaan,NoHP,StatusDomisili,GolonganDarah';
  const rows = [
    `3204051204880001,3204051204880099,Agus Supriyatna,${rt},Bumi Pesona Asri Blok C${rt} No. 01,L,Bandung,1988-04-12,Islam,Kawin,Kepala Keluarga,Wiraswasta,0812-7700-0001,Tetap,O`,
    `3204055506900002,3204051204880099,Dewi Sartika,${rt},Bumi Pesona Asri Blok C${rt} No. 01,P,Sumedang,1990-06-15,Islam,Kawin,Istri,Karyawan BUMN,0812-7700-0002,Tetap,A`,
    `3204052009210003,3204051204880099,Rayhan Pratama,${rt},Bumi Pesona Asri Blok C${rt} No. 01,L,Bandung,2021-09-20,Islam,Belum Kawin,Anak,Belum Bekerja,,Tetap,O`,
    `3204051802820004,3204051802820088,Hendra Gunawan,${rt},Bumi Pesona Asri Blok C${rt} No. 07,L,Bandung,1982-02-18,Islam,Kawin,Kepala Keluarga,PNS Guru,0813-8899-0004,Tetap,B`,
    `3204056207850005,3204051802820088,Ratna Komala,${rt},Bumi Pesona Asri Blok C${rt} No. 07,P,Cimahi,1985-07-22,Islam,Kawin,Istri,Dosen,0813-8899-0005,Tetap,AB`,
  ];

  return [headers, ...rows].join('\n');
}
