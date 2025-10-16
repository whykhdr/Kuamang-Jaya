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
        return 'Rp' + angka.toLocaleString('id-ID');
    };

    // Fungsi pembantu untuk baris dengan garis putus-putus
    const dottedValue = (value) => {
        return `<span style="border-bottom: 1px dotted #000; padding-bottom: 1px; flex-grow: 1; text-align: right;">${value}</span>`;
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

        <div class="info-row"><span style="width: 110px;">Periode Bulan</span>: <span>${periode}</span></div>
        <div class="info-row"><span style="width: 110px;">Nama Pelanggan</span>: <span><b>${nama}</b></span></div>
        <div class="info-row"><span style="width: 110px;">No Pelanggan</span>: <span>${noPelanggan}</span></div>
        <div class="info-row"><span style="width: 110px;">Alamat Rumah</span>: <span>${alamat}</span></div>

        <hr style="border: 0; border-top: 1px dashed #000; margin: 5px 0;">

        <div class="info-row"><span style="width: 110px;">Stand Awal</span>: <span>${standAwal} M</span></div>
        <div class="info-row"><span style="width: 110px;">Stand Akhir</span>: <span>${standAkhir} M</span></div>
        <div class="info-row"><span style="width: 110px;">Jumlah Pemakaian</span>: <span>${jumlahPemakaian} M</span></div>

        <hr style="border: 0; border-top: 1px dashed #000; margin: 5px 0;">

        <div class="info-row">
            <span style="width: 50%;">Iuran ${formatRupiah(hargaPerM).replace('Rp', '')}/m</span>
            ${dottedValue(formatRupiah(iuranBiaya))}
        </div>
        <div class="info-row">
            <span style="width: 50%;">Pokok Beban</span>
            ${dottedValue(formatRupiah(pokokBeban))}
        </div>
        
        <div class="info-row total-row">
            <span>Jumlah Bayar:</span>
            <span>${formatRupiah(jumlahBayar)}</span>
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
