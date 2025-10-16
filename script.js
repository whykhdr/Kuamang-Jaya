document.addEventListener('DOMContentLoaded', () => {
    // Panggil fungsi sekali saat halaman dimuat untuk menampilkan kuitansi awal
    updateReceipt(); 
});

/**
 * Fungsi utama untuk mengambil input, menghitung total, dan memperbarui tampilan kuitansi.
 */
function updateReceipt() {
    // 1. Ambil Nilai Input
    const nama = document.getElementById('nama').value.trim() || "Pelanggan Yth.";
    const pokok = parseInt(document.getElementById('pokok').value) || 0;
    const denda = parseInt(document.getElementById('denda').value) || 0;
    
    // 2. Lakukan Perhitungan & Data Tambahan
    const total = pokok + denda;
    const tanggal = new Date().toLocaleDateString('id-ID', {
        day: '2-digit', 
        month: 'short', 
        year: 'numeric', 
        hour: '2-digit', 
        minute: '2-digit'
    });

    // 3. Fungsi Pembantu Format Rupiah
    const formatRupiah = (angka) => {
        return 'Rp ' + angka.toLocaleString('id-ID');
    };

    // 4. Buat dan Tampilkan Konten Kuitansi
    const output = document.getElementById('receipt-output');
    
    output.innerHTML = `
        <div class="header">
            BADAN PENGELOLA SPAMS<br>
            PAMSIMAS DESA SUKA MAJU
        </div>
        <div class="divider"></div>
        
        <div class="detail-row"><span>Tgl/Waktu:</span><span>${tanggal}</span></div>
        <div class="detail-row"><span>Pelanggan:</span><span>${nama}</span></div>
        <div class="divider"></div>

        <div class="detail-row"><span>Tagihan Pokok:</span><span>${formatRupiah(pokok)}</span></div>
        <div class="detail-row"><span>Denda:</span><span>${formatRupiah(denda)}</span></div>
        <div class="divider"></div>

        <div class="detail-row total-row"><span>TOTAL BAYAR:</span><span>${formatRupiah(total)}</span></div>
        <div class="divider"></div>

        <div class="footer">
            TERIMA KASIH ATAS PEMBAYARANNYA
        </div>
        <br>
        <div class="footer">
            Petugas: (Isi Nama Anda)
        </div>
        <br><br>
    `;

    // Tampilkan div kuitansi
    output.style.display = 'block';
}
