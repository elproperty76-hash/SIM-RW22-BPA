import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import { LaporanBulanan, PengurusRWInfo } from '../types';
import { formatRupiah, formatDateIndo } from './formatters';

/**
 * Capture the printable DOM element and generate a high-definition multi-page A4 PDF file
 */
export async function exportReportToPdf(
  elementId: string,
  filename: string
): Promise<{ success: boolean; error?: string }> {
  const element = document.getElementById(elementId);
  if (!element) {
    return { success: false, error: 'Elemen laporan tidak ditemukan' };
  }

  try {
    // Wait briefly to ensure all images in the container are fully rendered
    await new Promise((resolve) => setTimeout(resolve, 300));

    const canvas = await html2canvas(element, {
      scale: 2, // High resolution (retina crispness)
      useCORS: true,
      allowTaint: true,
      logging: false,
      backgroundColor: '#ffffff',
      windowWidth: 1024,
    });

    const imgData = canvas.toDataURL('image/jpeg', 0.95);
    const pdf = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4',
      compress: true,
    });

    const pageWidth = 210; // A4 standard width in mm
    const pageHeight = 297; // A4 standard height in mm
    const margin = 0; // element already has internal margins
    const printableWidth = pageWidth - margin * 2;
    const imgHeight = (canvas.height * printableWidth) / canvas.width;

    let heightLeft = imgHeight;
    let position = 0;

    // First page
    pdf.addImage(imgData, 'JPEG', margin, position, printableWidth, imgHeight);
    heightLeft -= pageHeight;

    // Remaining pages if report exceeds 1 page
    while (heightLeft > 0) {
      position = heightLeft - imgHeight;
      pdf.addPage();
      pdf.addImage(imgData, 'JPEG', margin, position, printableWidth, imgHeight);
      heightLeft -= pageHeight;
    }

    pdf.save(filename);
    return { success: true };
  } catch (err: any) {
    console.error('Error generating PDF:', err);
    return {
      success: false,
      error: err?.message || 'Gagal membuat file PDF. Silakan coba kembali.',
    };
  }
}

/**
 * Open a clean, self-contained printable window formatted for A4 printing/PDF saving
 */
export function openPrintableReportWindow(
  laporan: LaporanBulanan,
  infoRW: PengurusRWInfo
): void {
  const printWindow = window.open('', '_blank', 'width=900,height=800');
  if (!printWindow) {
    window.print();
    return;
  }

  const kegiatanRows = laporan.daftarKegiatan
    .map(
      (k, idx) => `
      <tr>
        <td style="padding: 8px; border: 1px solid #cbd5e1; text-align: center;">${idx + 1}</td>
        <td style="padding: 8px; border: 1px solid #cbd5e1; font-weight: bold;">${k.judul}</td>
        <td style="padding: 8px; border: 1px solid #cbd5e1;">
          ${formatDateIndo(k.tanggal)}<br/>
          <small style="color: #64748b;">${k.lokasi}</small>
        </td>
        <td style="padding: 8px; border: 1px solid #cbd5e1;"><span style="background: #e2e8f0; padding: 2px 6px; border-radius: 4px; font-size: 11px;">${k.kategori}</span></td>
        <td style="padding: 8px; border: 1px solid #cbd5e1; font-size: 12px;">${k.deskripsi}</td>
        <td style="padding: 8px; border: 1px solid #cbd5e1; text-align: right; font-weight: bold;">${formatRupiah(k.anggaranDigunakan)}</td>
      </tr>
    `
    )
    .join('');

  const iuranRows = (laporan.rekapIuranRt || [])
    .map(
      (r) => `
      <div style="border: 1px solid #cbd5e1; border-radius: 6px; padding: 8px; text-align: center; flex: 1; min-width: 90px;">
        <strong style="display: block; font-size: 12px; color: #047857;">RT 0${r.rt}</strong>
        <div style="font-size: 13px; font-weight: bold; margin: 4px 0;">${r.persentaseLunas}%</div>
        <small style="color: #64748b; font-size: 10px;">${formatRupiah(r.nominalTerkumpul)}</small>
      </div>
    `
    )
    .join('');

  const pengumumanItems = laporan.pengumumanWarga
    .map((p) => `<li style="margin-bottom: 6px; line-height: 1.4;">${p}</li>`)
    .join('');

  const photosHtml =
    laporan.galeriFoto && laporan.galeriFoto.length > 0
      ? `
      <div style="margin-top: 24px; page-break-inside: avoid;">
        <h4 style="font-size: 13px; text-transform: uppercase; font-weight: bold; border-bottom: 2px solid #0f172a; padding-bottom: 4px; margin-bottom: 12px;">
          VI. Dokumentasi Foto Kegiatan Lapangan Warga RW 22
        </h4>
        <div style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 12px;">
          ${laporan.galeriFoto
            .slice(0, 4)
            .map(
              (f) => `
            <div style="border: 1px solid #cbd5e1; border-radius: 8px; padding: 6px; background: #f8fafc; font-size: 11px;">
              <img src="${f.url}" style="width: 100%; height: 140px; object-fit: cover; border-radius: 6px;" alt="${f.judul}" />
              <div style="font-weight: bold; margin-top: 6px; color: #0f172a;">${f.judul}</div>
              <div style="color: #64748b; font-size: 10px;">${formatDateIndo(f.tanggal)} • ${f.lokasi || 'Lingkungan RW 22'}</div>
              <div style="color: #334155; margin-top: 4px;">${f.keterangan}</div>
            </div>
          `
            )
            .join('')}
        </div>
      </div>
    `
      : '';

  const html = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8" />
        <title>Laporan Bulanan RW 22 - ${laporan.periodeBulan} ${laporan.tahun}</title>
        <style>
          @page {
            size: A4 portrait;
            margin: 15mm;
          }
          body {
            font-family: Arial, Helvetica, sans-serif;
            color: #0f172a;
            line-height: 1.5;
            font-size: 12px;
            margin: 0;
            padding: 0;
            background: #fff;
          }
          .kop {
            text-align: center;
            border-bottom: 3px double #0f172a;
            padding-bottom: 12px;
            margin-bottom: 20px;
          }
          .kop h2 {
            margin: 0;
            font-size: 18px;
            font-weight: 900;
            letter-spacing: 0.5px;
          }
          .kop h3 {
            margin: 4px 0;
            font-size: 14px;
            font-weight: bold;
          }
          .kop p {
            margin: 2px 0 0;
            font-size: 11px;
            color: #475569;
          }
          .doc-title {
            text-align: center;
            margin-bottom: 24px;
          }
          .doc-title h1 {
            font-size: 16px;
            text-decoration: underline;
            margin: 0;
            font-weight: 900;
          }
          .doc-title p {
            font-size: 13px;
            font-weight: bold;
            color: #334155;
            margin: 4px 0 0;
          }
          .section {
            margin-bottom: 20px;
            page-break-inside: avoid;
          }
          .section-title {
            font-size: 13px;
            font-weight: bold;
            text-transform: uppercase;
            border-bottom: 2px solid #0f172a;
            padding-bottom: 4px;
            margin-bottom: 8px;
          }
          table {
            width: 100%;
            border-collapse: collapse;
            font-size: 11px;
          }
          .grid-kas {
            display: grid;
            grid-template-columns: repeat(4, 1fr);
            gap: 8px;
            text-align: center;
          }
          .box-kas {
            border: 1px solid #cbd5e1;
            padding: 8px;
            border-radius: 6px;
          }
          .signatures {
            display: grid;
            grid-template-columns: repeat(3, 1fr);
            gap: 16px;
            text-align: center;
            margin-top: 36px;
            page-break-inside: avoid;
          }
          .sig-space {
            margin-top: 54px;
            font-weight: bold;
            text-decoration: underline;
          }
          @media print {
            .no-print { display: none !important; }
          }
        </style>
      </head>
      <body>
        <div class="no-print" style="background: #0f172a; color: white; padding: 12px 20px; display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px;">
          <div>
            <strong>Pratinjau Cetak / Ekspor PDF Dokumen Resmi RW 22</strong>
            <div style="font-size: 11px; color: #94a3b8;">Format ukuran kertas A4 siap arsip</div>
          </div>
          <button onclick="window.print()" style="background: #10b981; color: white; border: none; padding: 8px 16px; border-radius: 6px; font-weight: bold; cursor: pointer;">
            🖨️ Cetak / Simpan PDF
          </button>
        </div>

        <div class="kop">
          <h2>PENGURUS RUKUN WARGA 22 BUMI PESONA ASRI</h2>
          <h3>DESA JELEGONG, KECAMATAN RANCAEKEK, KABUPATEN BANDUNG</h3>
          <p>Alamat Sekretariat: ${infoRW.alamatSekretariat} • Kode Pos: ${infoRW.kodePos} • Telp/WA: ${infoRW.kontakSekretariat}</p>
        </div>

        <div class="doc-title">
          <h1>LAPORAN PERTANGGUNGJAWABAN KEGIATAN & KEUANGAN BULANAN</h1>
          <p>Periode: ${laporan.periodeBulan} ${laporan.tahun}</p>
        </div>

        <div class="section">
          <div class="section-title">I. Pengantar & Ringkasan Eksekutif</div>
          <p style="text-align: justify; text-indent: 24px; line-height: 1.6;">
            ${laporan.ringkasanEksekutif}
          </p>
        </div>

        <div class="section">
          <div class="section-title">II. Realisasi Kegiatan Warga RW 22</div>
          <table>
            <thead>
              <tr style="background: #f1f5f9; font-weight: bold;">
                <th style="padding: 8px; border: 1px solid #cbd5e1; width: 30px;">No</th>
                <th style="padding: 8px; border: 1px solid #cbd5e1; width: 140px;">Nama Kegiatan</th>
                <th style="padding: 8px; border: 1px solid #cbd5e1; width: 100px;">Tanggal & Lokasi</th>
                <th style="padding: 8px; border: 1px solid #cbd5e1; width: 80px;">Kategori</th>
                <th style="padding: 8px; border: 1px solid #cbd5e1;">Uraian Hasil</th>
                <th style="padding: 8px; border: 1px solid #cbd5e1; width: 90px; text-align: right;">Biaya</th>
              </tr>
            </thead>
            <tbody>
              ${kegiatanRows}
            </tbody>
          </table>
        </div>

        <div class="section">
          <div class="section-title">III. Transparansi & Realisasi Keuangan Kas RW 22</div>
          <div class="grid-kas">
            <div class="box-kas" style="background: #f8fafc;">
              <small style="color: #64748b;">Saldo Awal</small>
              <div style="font-weight: bold; margin-top: 4px;">${formatRupiah(laporan.ringkasanKas.saldoAwal)}</div>
            </div>
            <div class="box-kas" style="background: #ecfdf5; border-color: #a7f3d0;">
              <small style="color: #047857;">Total Pemasukan</small>
              <div style="font-weight: bold; color: #065f46; margin-top: 4px;">${formatRupiah(laporan.ringkasanKas.totalPemasukan)}</div>
            </div>
            <div class="box-kas" style="background: #fff1f2; border-color: #fecdd3;">
              <small style="color: #be123c;">Total Pengeluaran</small>
              <div style="font-weight: bold; color: #9f1239; margin-top: 4px;">${formatRupiah(laporan.ringkasanKas.totalPengeluaran)}</div>
            </div>
            <div class="box-kas" style="background: #0f172a; color: white;">
              <small style="color: #94a3b8;">Saldo Akhir</small>
              <div style="font-weight: bold; color: #34d399; margin-top: 4px;">${formatRupiah(laporan.ringkasanKas.saldoAkhir)}</div>
            </div>
          </div>
          <p style="font-size: 11px; font-style: italic; color: #475569; margin-top: 8px;">
            Catatan Bendahara: ${laporan.ringkasanKas.catatanBendahara}
          </p>
        </div>

        <div class="section">
          <div class="section-title">IV. Rekapitulasi Iuran Warga per RT</div>
          <div style="display: flex; gap: 6px; flex-wrap: wrap;">
            ${iuranRows}
          </div>
        </div>

        <div class="section">
          <div class="section-title">V. Maklumat & Pengumuman Resmi Pengurus</div>
          <ul style="padding-left: 20px; margin: 6px 0;">
            ${pengumumanItems}
          </ul>
        </div>

        ${photosHtml}

        <div class="section" style="margin-top: 24px;">
          <p style="text-align: right; margin-bottom: 24px;">
            Bumi Pesona Asri, ${formatDateIndo(laporan.tanggalPublikasi)}
          </p>
          <div class="signatures">
            <div>
              <span>Sekretaris RW 22,</span>
              <div class="sig-space">${laporan.sekretaris}</div>
              <small style="color: #64748b;">Pengurus RW 22</small>
            </div>
            <div>
              <span>Bendahara RW 22,</span>
              <div class="sig-space">${laporan.bendahara}</div>
              <small style="color: #64748b;">Pengurus RW 22</small>
            </div>
            <div>
              <span>Ketua RW 22,</span>
              <div class="sig-space">${laporan.ketuaRw}</div>
              <small style="color: #64748b;">Pimpinan RW 22</small>
            </div>
          </div>
        </div>

        <script>
          window.onload = function() {
            setTimeout(function() {
              window.print();
            }, 500);
          };
        </script>
      </body>
    </html>
  `;

  printWindow.document.open();
  printWindow.document.write(html);
  printWindow.document.close();
}
