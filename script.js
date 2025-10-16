document.addEventListener('DOMContentLoaded', () => {
    // Panggil fungsi sekali saat halaman dimuat untuk tampilan kuitansi awal
    updateReceipt(); 
});

/**
 * Fungsi pembantu untuk membuat nomor transaksi acak 6 digit.
 */
function generateTransactionId() {
    return Math.floor(100000 + Math.random() * 900000);
}

/**
 * Fungsi utama untuk mengambil input, menghitung total, dan memperbarui tampilan kuitansi.
 */
function updateReceipt() {
    // 1. Ambil Nilai Input
    const nama = document.getElementById('nama').value.trim() || "Pelanggan Yth.";
    const noSambungan = document.getElementById('no_sambungan').value.trim() || "00/0000";
    const bulanTagihan = document.getElementById('bulan_tagihan').value.trim() || "Bulan Ini";
    const pokok = parseInt(document.getElementById('pokok').value) || 0;
    const denda = parseInt(document.getElementById('denda').value) || 0;
    const bayarTunai = parseInt(document.getElementById('bayar_tunai').value) || 0;
    
    // 2. Lakukan Perhitungan & Data Tambahan
    const total = pokok + denda;
    const kembalian = bayarTunai - total;
    const tglTransaksi = new Date().toLocaleDateString('id-ID', {
        day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit'
    });
    
    // Hitung Jatuh Tempo (Misal 20 hari dari sekarang)
    const tglJatuhTempo = new Date();
    tglJatuhTempo.setDate(tglJatuhTempo.getDate() + 20);
    const jatuhTempoStr = tglJatuhTempo.toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' });

    // Gunakan ID statis atau acak (jika ingin ID selalu baru setiap kali refresh)
    const trxId = generateTransactionId(); 

    // 3. Fungsi Pembantu Format Rupiah
    const formatRupiah = (angka) => {
        return 'Rp ' + angka.toLocaleString('id-ID');
    };

    // 4. Buat dan Tampilkan Konten Kuitansi
    const output = document.getElementById('receipt-output');
    
    output.innerHTML = `
        <div class="kop-art">
             _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ 
            |    PAMSIMAS DESA SUKA MAJU   |
            |      BADAN PENGELOLA SPAMS     |
            |_ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _|
        </div>
        
        <div class="detail-row"><span>No. TRX:</span><span>${trxId}</span></div>
        <div class="detail-row"><span>Tgl. Cetak:</span><span>${tglTransaksi}</span></div>
        <div class="divider"></div>

        <div class="detail-row"><span>Pelanggan:</span><span>${nama}</span></div>
        <div class="detail-row"><span>No. Samb:</span><span>${noSambungan}</span></div>
        <div class="detail-row"><span>Bulan Tagihan:</span><span>${bulanTagihan}</span></div>
        <div class="divider"></div>

        <div class="detail-row"><span>Tagihan Pokok:</span><span>${formatRupiah(pokok)}</span></div>
        <div class="detail-row"><span>Denda:</span><span>${formatRupiah(denda)}</span></div>

        <div class="detail-row total-row"><span>TOTAL BAYAR:</span><span>${formatRupiah(total)}</span></div>
        
        <div class="detail-row"><span>Bayar Tunai:</span><span>${formatRupiah(bayarTunai)}</span></div>
        <div class="detail-row"><span>Kembalian:</span><span>${formatRupiah(kembalian)}</span></div>
        <div class="divider"></div>

        <div class="footer">
            Batas Pembayaran Bln Berikut: <br>
            ${jatuhTempoStr}
        </div>
        <div class="footer" style="margin-top: 10px;">
            TERIMA KASIH
        </div>
        <div class="footer" style="font-size: 8pt; margin-top: 5px;">
            Petugas: (Isi Nama Anda)
        </div>
        <br><br>
    `;

    // Tampilkan div kuitansi
    output.style.display = 'block';
}
