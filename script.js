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
    
    // 2. Jeda singkat (50ms) agar browser selesai me-render konten baru.
    setTimeout(() => {
        window.print();
    }, 50); 
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
        // Menggunakan toLocaleString untuk pemisah ribuan
        return 'Rp' + angka.toLocaleString('id-ID');
    };
    
    // Fungsi Pembantu Garis Bawah Dotted (untuk nilai)
    const dottedValue = (value) => {
        return `<span style="border-bottom: 1px dotted #000; padding-bottom: 1px;">${value}</span>`;
    };

    // 4. Buat dan Tampilkan Konten Kuitansi
    const output = document.getElementById('receipt-output');
    
    output.innerHTML = `
        <div style="text-align: center; font-weight: bold; margin-bottom: 5px;">
            <p style="margin: 0; font-size: 10pt;">KWITANSI PEMBAYARAN AIR</p>
            <p style="margin: 0; font-size: 8pt;">PAMSIMAS DESA [NAMA DESA]</p>
        </div>
        <hr style="border: 0; border-top: 1px dashed #000; margin: 5px 0;">
        
        <div style="text-align: right; font-size: 8pt; margin-bottom: 5px;">Tgl. Cetak: ${tglCetak}</div>

        <div class="receipt-grid">
            
            <div class="info-row"><span class="label">Periode Bulan</span>: <span class="value">${periode}</span></div>
            <div class="info-row"><span class="label">Stand Awal</span>: <span class="value">${standAwal} M</span></div>
            <div class="info-row"><span class="label">Nama Pelanggan</span>: <span class="value"><b>${nama}</b></span></div>
            <div class="info-row"><span class="label">Stand Akhir</span>: <span class="value">${standAkhir} M</span></div>
            <div class="info-row"><span class="label">No Pelanggan</span>: <span class="value">${noPelanggan}</span></div>
            <div class="info-row"><span class="label">Jumlah Pemakaian</span>: <span class="value">${jumlahPemakaian} M</span></div>
            <div class="info-row"><span class="label">Alamat Rumah</span>: <span class="value">${alamat}</span></div>

            <hr style="border: 0; border-top: 1px dotted #000; grid-column: 1 / 3; margin: 2px 0;">
            
            <div class="info-row" style="grid-column: 1 / 3;">
                <span class="label">Iuran ${formatRupiah(hargaPerM).replace('Rp', '')}/m</span>: <span class="value">${dottedValue(formatRupiah(iuranBiaya))}</span>
            </div>
            <div class="info-row" style="grid-column: 1 / 3;">
                <span class="label">Pokok Beban</span>: <span class="value">${dottedValue(formatRupiah(pokokBeban))}</span>
            </div>
            
            <hr style="border: 0; border-top: 1px dotted #000; grid-column: 1 / 3; margin: 2px 0;">
            <div class="info-row" style="font-weight: bold; font-size: 1.1em; grid-column: 1 / 3;">
                <span class="label">Jumlah Bayar</span>: <span class="value">${formatRupiah(jumlahBayar)}</span>
            </div>
            
        </div>
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
