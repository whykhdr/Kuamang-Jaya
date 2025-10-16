document.addEventListener('DOMContentLoaded', () => {
    // Panggil fungsi sekali saat halaman dimuat
    updateReceipt(); 
});

/**
 * Fungsi utama untuk mengambil input, menghitung total, dan memperbarui tampilan kuitansi.
 */
function updateReceipt() {
    // 1. Ambil Nilai Input
    const periode = document.getElementById('periode').value.toUpperCase() || "BULAN";
    const tglPeriksaInput = document.getElementById('tgl_periksa').value;
    const tglBayarInput = document.getElementById('tgl_bayar').value;
    const nama = document.getElementById('nama').value.toUpperCase() || "PELANGGAN";
    const noPelanggan = document.getElementById('no_pelanggan').value || "0";
    const alamat = document.getElementById('alamat').value.toUpperCase() || "ALAMAT";
    const standAwal = parseInt(document.getElementById('stand_awal').value) || 0;
    const standAkhir = parseInt(document.getElementById('stand_akhir').value) || 0;
    const hargaPerM = parseInt(document.getElementById('harga_per_m').value) || 0;
    const pokokBeban = parseInt(document.getElementById('pokok_beban').value) || 0;

    // 2. Lakukan Perhitungan
    const jumlahPemakaian = standAkhir - standAwal;
    const iuranBiaya = jumlahPemakaian * hargaPerM;
    const jumlahBayar = iuranBiaya + pokokBeban;
    
    // Format Tanggal ke DD/MM/YYYY
    const formatTanggal = (dateString) => {
        if (!dateString) return '';
        const date = new Date(dateString);
        return date.toLocaleDateString('id-ID', {day: '2-digit', month: '2-digit', year: 'numeric'}).replace(/\//g, '/');
    };

    // 3. Fungsi Pembantu Format Rupiah
    const formatRupiah = (angka) => {
        return 'Rp' + angka.toLocaleString('id-ID');
    };

    // 4. Buat dan Tampilkan Konten Kuitansi
    const output = document.getElementById('receipt-output');
    
    output.innerHTML = `
        <div class="receipt-grid">
            <div class="left-col">
                <div class="info-row"><span class="label">Periode Bulan</span> &nbsp;: &nbsp; ${periode}</div>
                <div class="info-row"><span class="label">Tanggal Periksa</span> &nbsp;: &nbsp; ${formatTanggal(tglPeriksaInput)}</div>
                <div class="info-row"><span class="label">Nama Pelanggan</span> &nbsp;: &nbsp; <b>${nama}</b></div>
                <div class="info-row"><span class="label">No Pelanggan</span> &nbsp;: &nbsp; ${noPelanggan}</div>
                <div class="info-row"><span class="label">Alamat Rumah</span> &nbsp;: &nbsp; ${alamat}</div>
                <div class="info-row"><span class="label">Tanggal Pembayaran</span> &nbsp;: &nbsp; ${formatTanggal(tglBayarInput)}</div>
            </div>

            <div class="right-col">
                <div class="info-row"><span class="label">Stand Awal</span> &nbsp;: &nbsp;<span class="right-value">${standAwal}<span style="font-style: italic;">M</span></span></div>
                <div class="info-row"><span class="label">Stand Akhir</span> &nbsp;: &nbsp;<span class="right-value">${standAkhir}<span style="font-style: italic;">M</span></span></div>
                <div class="info-row"><span class="label">Jumlah Pemakaian</span> &nbsp;: &nbsp;<span class="right-value">${jumlahPemakaian}<span style="font-style: italic;">M</span></span></div>
                
                <div class="info-row"><span class="label">Iuran ${formatRupiah(hargaPerM)}/m</span> &nbsp;: &nbsp;<span class="right-value"><span class="rp-label">${formatRupiah(iuranBiaya)}</span></span></div>
                <div class="info-row"><span class="label">Pokok Beban</span> &nbsp;: &nbsp;<span class="right-value"><span class="rp-label">${formatRupiah(pokokBeban)}</span></span></div>
                
                <div class="info-row"><span class="label">Jumlah Bayar</span> &nbsp;: &nbsp;<span class="total-display">${formatRupiah(jumlahBayar)}</span></div>
            </div>
        </div>
    `;

    output.style.display = 'grid'; // Menggunakan grid untuk layout utama
}
