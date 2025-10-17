// =========================================================================
// 1. DATA BIAYA TETAP (Dibaca dari input readonly)
// =========================================================================
const getFixedPrices = () => ({
    hargaPerM: parseInt(document.getElementById('harga_per_m').value) || 2000,
    pokokBeban: parseInt(document.getElementById('pokok_beban').value) || 10000,
});

document.addEventListener('DOMContentLoaded', () => {
    // Tambahkan 1 baris kosong saat pertama kali dimuat
    addRow(); 
});

/**
 * Menambahkan satu baris input baru ke dalam tabel.
 */
function addRow() {
    const tableBody = document.getElementById('data-table-body');
    const newRow = tableBody.insertRow();
    const rowIndex = tableBody.rows.length;

    newRow.innerHTML = `
        <td><input type="text" name="periode" value="OKTOBER"></td>
        <td><input type="text" name="nama" placeholder="Nama Pelanggan"></td>
        <td><input type="text" name="noPelanggan" placeholder="000"></td>
        <td><input type="text" name="alamat" placeholder="Alamat"></td>
        <td><input type="number" name="standAwal" value="0" min="0"></td>
        <td><input type="number" name="standAkhir" value="0" min="0"></td>
        <td><button onclick="deleteRow(this)">Hapus</button></td>
    `;
}

/**
 * Menghapus baris input dari tabel.
 * @param {HTMLButtonElement} btn - Tombol Hapus yang diklik.
 */
function deleteRow(btn) {
    const row = btn.parentNode.parentNode;
    row.parentNode.removeChild(row);
}


/**
 * Mengambil semua data dari tabel input.
 * @returns {Array} Array of Objects berisi data pelanggan.
 */
function getTableData() {
    const tableBody = document.getElementById('data-table-body');
    const rows = Array.from(tableBody.rows);
    const fixedPrices = getFixedPrices();
    
    return rows.map(row => {
        const inputs = row.querySelectorAll('input');
        
        // Buat objek data dari setiap baris
        const data = {
            periode: inputs[0].value.toUpperCase().trim() || "BULAN",
            nama: inputs[1].value.toUpperCase().trim() || "PELANGGAN",
            noPelanggan: inputs[2].value.trim() || "0",
            alamat: inputs[3].value.toUpperCase().trim() || "ALAMAT",
            standAwal: parseInt(inputs[4].value) || 0,
            standAkhir: parseInt(inputs[5].value) || 0,
            
            // Tambahkan harga tetap
            hargaPerM: fixedPrices.hargaPerM,
            pokokBeban: fixedPrices.pokokBeban,
        };

        // Filter data yang kosong (misal: hanya baris placeholder yang tidak diisi)
        if (data.nama === "PELANGGAN" && data.noPelanggan === "0") {
            return null; // Abaikan baris kosong
        }
        
        return data;
    }).filter(data => data !== null); // Hapus baris yang dikembalikan sebagai null
}


/**
 * Fungsi utama untuk memicu CETAK MASSAL.
 */
function handlePrintMassal() {
    const outputContainer = document.getElementById('receipt-output');
    outputContainer.innerHTML = ''; // Kosongkan container
    
    const massData = getTableData();

    if (massData.length === 0) {
        alert("Tidak ada data pelanggan yang terisi untuk dicetak.");
        return;
    }

    // 1. Generate semua kuitansi
    const receiptsToPrint = massData.map(data => generateSingleReceiptHTML(data));

    // 2. Tampilkan semua kuitansi ke DOM
    receiptsToPrint.forEach(html => {
        outputContainer.innerHTML += `<div class="receipt-item">${html}</div>`;
    });

    // 3. Pastikan area kuitansi terlihat dan cetak
    outputContainer.style.display = 'block'; 

    // 4. Jeda singkat (100ms) agar browser selesai me-render konten baru.
    setTimeout(() => {
        window.print();
        
        // 5. Setelah mencetak, kosongkan kembali dan tampilkan pesan
        outputContainer.innerHTML = `<div class="receipt-item" style="text-align: center; margin-top: 50px;">
            <p>Proses cetak ${receiptsToPrint.length} kuitansi selesai.</p>
            <p>Anda dapat menutup dialog cetak.</p>
         </div>`;
        outputContainer.style.display = 'none'; // Sembunyikan lagi pratinjau
    }, 100); 
}


// =========================================================================
// FUNGSI GENERATOR HTML (TIDAK BERUBAH)
// =========================================================================

/**
 * Fungsi ini HANYA menghasilkan string HTML untuk SATU kuitansi berdasarkan data yang diberikan.
 * @param {Object} data - Objek yang berisi semua detail pelanggan.
 */
function generateSingleReceiptHTML(data) {
    // 2. Lakukan Perhitungan
    const jumlahPemakaian = Math.max(0, data.standAkhir - data.standAwal);
    const iuranBiaya = jumlahPemakaian * data.hargaPerM;
    const jumlahBayar = iuranBiaya + data.pokokBeban;
    
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

    // FUNGSI BARU UNTUK TOTAL
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
    
    // 4. RETURN KONTEN HTML
    return `
        <div style="text-align: center; font-weight: bold;">
            <p style="margin: 0; font-size: 10pt;">KWITANSI PEMBAYARAN AIR</p>
            <p style="margin: 0; font-size: 8pt;">PAMSIMAS DESA [NAMA DESA]</p>
        </div>
        <hr style="border: 0; border-top: 1px dashed #000; margin: 5px 0;">
        
        <div style="text-align: right; font-size: 8pt; margin-bottom: 5px;">Tgl. Cetak: ${tglCetak}</div>

        ${createAlignedRow("Periode Bulan", data.periode)}
        ${createAlignedRow("Nama Pelanggan", `<b>${data.nama}</b>`)}
        ${createAlignedRow("No Pelanggan", data.noPelanggan)}
        ${createAlignedRow("Alamat Rumah", data.alamat)}

        <hr style="border: 0; border-top: 1px dashed #000; margin: 5px 0;">

        ${createAlignedRow("Stand Awal", `${data.standAwal} M`)}
        ${createAlignedRow("Stand Akhir", `${data.standAkhir} M`)}
        ${createAlignedRow("Jumlah Pemakaian", `${jumlahPemakaian} M`)}

        <hr style="border: 0; border-top: 1px dashed #000; margin: 5px 0;">

        ${createAlignedRow(`Iuran ${formatRupiah(data.hargaPerM).replace('Rp', '')}/m`, formatRupiah(iuranBiaya), true)}
        ${createAlignedRow("Pokok Beban", formatRupiah(data.pokokBeban), true)}
        
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
}
