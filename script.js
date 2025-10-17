document.addEventListener('DOMContentLoaded', () => {
    // Pastikan kuitansi terisi segera setelah DOM dimuat
    updateReceipt(); 
});

/**
 * Fungsi PENTING untuk mengatasi masalah timing cetak.
 */
function handlePrint() {
    // 1. Pastikan DOM diperbarui sebelum mencetak
    updateReceipt(); 
    
    // 2. Jeda singkat (100ms) agar browser selesai me-render konten baru.
    setTimeout(() => {
        window.print();
    }, 100); 
}

/**
 * Fungsi utama untuk mengambil input, menghitung total, dan memperbarui tampilan kuitansi.
 */
function updateReceipt() {
    // 1. Ambil Nilai Input
    const periode = document.getElementById('periode').value.toUpperCase() || "BULAN";
    const nama = document.getElementById('nama').value.toUpperCase() || "PELANGGAN";
    const noPelanggan = document.getElementById('no_pelanggan').value || "0";
    const alamat = document.getElementById('alamat').value.toUpperCase() || "ALAMAT";
    const standAwal = parseInt(document.getElementById('stand_awal').value) || 0;
    const standAkhir = parseInt(document.getElementById('stand_akhir').value) || 0;
    const hargaPerM = parseInt(document.getElementById('harga_per_m').value) || 0;
    const pokokBeban = parseInt(document.getElementById('pokok_beban').value) || 0;

    // 2. Lakukan Perhitungan
    const jumlahPemakaian = Math.max(0, standAkhir - standAwal);
    const iuranBiaya = jumlahPemakaian * hargaPerM;
    const jumlahBayar = iuranBiaya + pokokBeban;
    
    const tglCetak = new Date().toLocaleDateString('id-ID', {day: '2-digit', month: '2-digit', year: 'numeric'}).replace(/\//g, '/');

    // 3. Fungsi Pembantu Format Rupiah
    const formatRupiah = (angka) => {
        return 'Rp' + angka.toLocaleString('id-ID');
    };

    // FUNGSI UTAMA PERATAAN
    const createAlignedRow = (label, value, isDotted = false) => {
        let valueContent = value;
        let alignment = 'left';

        if (isDotted) {
            // Untuk Biaya (Iuran & Pokok Beban): Dotted dan Align Right
            valueContent = `<span style="border-bottom: 1px dotted #000; padding-bottom: 1px; text-align: right; display: block; width: 100%;">${value}</span>`;
            alignment = 'right';
        }

        return `
            <div class="info-row">
                <span class="label-col">
                    <span>${label}</span>
                    <span>:</span>
                </span>
                <span class="value-col" style="text-align: ${alignment};">${valueContent}</span>
            </div>
        `;
    };

    // FUNGSI BARU UNTUK TOTAL (Memastikan titik dua sejajar, nilai Bold & Align Right)
    const createTotalRow = (label, value) => {
        return `
            <div class="info-row total-row" style="font-weight: bold;">
                <span class="label-col">
                    <span>${label}</span>
                    <span>:</span>
                </span>
                <span class="value-col" style="text-align: right;">${value}</span>
            </div>
        `;
    };
    
    // 4. Buat dan Tampilkan Konten Kuitansi (Mode Flex/Block)
    const output = document.getElementById('receipt-output');
    
    output.innerHTML = `
        <div style="text-align: center; font-weight: bold;">
            <p style="margin: 0; font-size: 10pt;">KWITANSI PEMBAYARAN AIR</p>
            <p style="margin: 0; font-size: 8pt;">PAMSIMAS DESA [NAMA DESA]</p>
        </div>
        <hr style="border: 0; border-top: 1px dashed #000; margin: 5px 0;">
        
        <div style="text-align: right; font-size: 8pt; margin-bottom: 5px;">Tgl. Cetak: ${tglCetak}</div>

        ${createAlignedRow("Periode Bulan", periode)}
        ${createAlignedRow("Nama Pelanggan", `<b>${nama}</b>`)}
        ${createAlignedRow("No Pelanggan", noPelanggan)}
        ${createAlignedRow("Alamat Rumah", alamat)}

        <hr style="border: 0; border-top: 1px dashed #000; margin: 5px 0;">

        ${createAlignedRow("Stand Awal", `${standAwal} M`)}
        ${createAlignedRow("Stand Akhir", `${standAkhir} M`)}
        ${createAlignedRow("Jumlah Pemakaian", `${jumlahPemakaian} M`)}

        <hr style="border: 0; border-top: 1px dashed #000; margin: 5px 0;">

        ${createAlignedRow(`Iuran ${formatRupiah(hargaPerM).replace('Rp', '')}/m`, formatRupiah(iuranBiaya), true)}
        ${createAlignedRow("Pokok Beban", formatRupiah(pokokBeban), true)}
        
        <hr style="border: 0; border-top: 1px dashed #000; margin: 2px 0;">
        ${createTotalRow("Jumlah Bayar", formatRupiah(jumlahBayar))}
        
        <hr style="border: 0; border-top: 1px dashed #000; margin: 5px 0;">
        <div style="text-align: center; font-size: 8pt; font-weight: bold;">
            TERIMA KASIH
        </div>
        <div style="text-align: center; font-size: 7pt; margin-top: 2px;">
            Operator: [Nama Petugas Anda]
        </div>
    `;
    
    // Pastikan area kuitansi selalu terlihat
    output.style.display = 'block'; 
}
