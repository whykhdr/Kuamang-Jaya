// =========================================================================
// 1. DATA BIAYA TETAP & UTILITY
// =========================================================================
const getFixedPrices = () => ({
    hargaPerM: parseInt(document.getElementById('harga_per_m').value) || 2000,
    pokokBeban: parseInt(document.getElementById('pokok_beban').value) || 10000,
});

/**
 * Mengambil Nama Petugas (Kolektor) dari input.
 */
const getNamaPetugas = () => {
    const input = document.getElementById('nama_petugas');
    return input ? input.value.toUpperCase() || "SUPARNO" : "SUPARNO";
};

document.addEventListener('DOMContentLoaded', () => {
    // Tambahkan 2 baris input kosong saat pertama kali dimuat
    addRow(); 
    addRow();
    
    // Set default nama petugas menjadi SUPARNO
    const petugasInput = document.getElementById('nama_petugas');
    if(petugasInput) {
        petugasInput.value = "";
    }
});

// =========================================================================
// 2. LOGIKA TABEL DINAMIS
// =========================================================================

/**
 * Menambahkan satu baris input baru ke dalam tabel, dengan placeholder yang jelas.
 */
function addRow() {
    const tableBody = document.getElementById('data-table-body');
    const newRow = tableBody.insertRow();

    newRow.innerHTML = `
        <td><input type="text" name="periode" placeholder="Cth: OKTOBER"></td>
        <td><input type="text" name="nama" placeholder="Cth: AGUS SETIAWAN"></td>
        <td><input type="text" name="noPelanggan" placeholder="Cth: 001"></td>
        <td><input type="text" name="alamat" placeholder="Cth: JL. GARUDA NO. 5"></td>
        <td><input type="number" name="standAwal" value="0" min="0" placeholder="Angka M3 awal"></td>
        <td><input type="number" name="standAkhir" value="0" min="0" placeholder="Angka M3 akhir"></td>
        <td><button onclick="deleteRow(this)">Hapus</button></td>
    `;
}

/**
 * Menghapus baris input dari tabel.
 */
function deleteRow(btn) {
    const row = btn.parentNode.parentNode;
    row.parentNode.removeChild(row);
}


/**
 * Mengambil semua data dari tabel input.
 */
function getTableData() {
    const tableBody = document.getElementById('data-table-body');
    const rows = Array.from(tableBody.rows);
    const fixedPrices = getFixedPrices();
    
    return rows.map(row => {
        const inputs = row.querySelectorAll('input');
        
        const data = {
            periode: inputs[0].value.toUpperCase().trim() || "BULAN",
            nama: inputs[1].value.toUpperCase().trim() || "", 
            noPelanggan: inputs[2].value.trim() || "",
            alamat: inputs[3].value.toUpperCase().trim() || "ALAMAT",
            standAwal: parseInt(inputs[4].value) || 0,
            standAkhir: parseInt(inputs[5].value) || 0,
            
            hargaPerM: fixedPrices.hargaPerM,
            pokokBeban: fixedPrices.pokokBeban,
        };

        // Abaikan baris jika nama dan noPelanggan kosong
        if (data.nama === "" && data.noPelanggan === "") {
            return null; 
        }
        
        return data;
    }).filter(data => data !== null);
}

// =========================================================================
// 3. LOGIKA CETAK
// =========================================================================

/**
 * Fungsi utama untuk memicu CETAK MASSAL.
 */
function handlePrintMassal() {
    const outputContainer = document.getElementById('receipt-output');
    const inputArea = document.getElementById('input-area'); 
    outputContainer.innerHTML = ''; 
    
    const massData = getTableData();

    if (massData.length === 0) {
        alert("Tidak ada data pelanggan yang terisi untuk dicetak.");
        return;
    }

    // 1. Generate dan tampilkan semua kuitansi
    const receiptsToPrint = massData.map(data => generateSingleReceiptHTML(data));
    receiptsToPrint.forEach(html => {
        outputContainer.innerHTML += `<div class="receipt-item">${html}</div>`;
    });

    // 2. SEMBUNYIKAN INPUT sebelum print
    if (inputArea) inputArea.style.display = 'none'; 
    outputContainer.style.display = 'block'; 

    // 3. Jeda singkat (100ms) agar browser selesai me-render konten baru.
    setTimeout(() => {
        window.print();
        
        // 4. Setelah mencetak, KEMBALIKAN tampilan formulir
        if (inputArea) inputArea.style.display = 'block'; 
        
        // Hapus konten cetak
        outputContainer.innerHTML = '';
        outputContainer.style.display = 'none'; 
        
        alert(`Pencetakan ${massData.length} kuitansi selesai.`);
    }, 100); 
}


/**
 * Fungsi ini HANYA menghasilkan string HTML untuk SATU kuitansi berdasarkan data yang diberikan.
 */
function generateSingleReceiptHTML(data) {
    // 2. Lakukan Perhitungan
    const jumlahPemakaian = Math.max(0, data.standAkhir - data.standAwal);
    const iuranBiaya = jumlahPemakaian * data.hargaPerM;
    const jumlahBayar = iuranBiaya + data.pokokBeban;
    
    const tglCetak = new Date().toLocaleDateString('id-ID', {day: '2-digit', month: '2-digit', year: 'numeric'}).replace(/\//g, '/');
    const namaKolektor = getNamaPetugas(); 

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
            <p style="margin: 0; font-size: 8pt;">PAMSIMAS TIRTA JAYA DESA KUAMANG JAYA</p> 
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
            Colector: ${namaKolektor}
        </div>
    `;
}
