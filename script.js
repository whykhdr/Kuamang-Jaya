// =========================================================================
// 1. DATA PELANGGAN (INI SUMBER DATA UNTUK CETAK MASSAL)
// GANTI ISI ARRAY INI DENGAN DATA PELANGGAN AKTUAL ANDA
// =========================================================================
const dataPelanggan = [
    { periode: "OKTOBER", nama: "ADI WIJAYA", noPelanggan: "001", alamat: "JL. GARUDA", standAwal: 100, standAkhir: 125 },
    { periode: "OKTOBER", nama: "BUDI SANTOSO", noPelanggan: "002", alamat: "JL. MERPATI", standAwal: 50, standAkhir: 65 },
    { periode: "OKTOBER", nama: "CITRA DEWI", noPelanggan: "003", alamat: "GANG MANGGA", standAwal: 200, standAkhir: 230 },
    { periode: "OKTOBER", nama: "DWI JAYANTO", noPelanggan: "004", alamat: "JL. KENARI", standAwal: 150, standAkhir: 170 },
    // TAMBAHKAN DATA PELANGGAN LAIN DI SINI
];

// Data biaya tetap (readonly dari formulir)
const HARGA_PER_M = 2000;
const POKOK_BEBAN = 10000;

document.addEventListener('DOMContentLoaded', () => {
    // Set nilai default Jumlah Cetak = 1 saat dimuat
    const jumlahCetakInput = document.getElementById('jumlah_cetak');
    if (jumlahCetakInput) {
        jumlahCetakInput.value = 1;
    }

    // Perbarui label tombol cetak massal
    const massButton = document.querySelector('button[onclick="handlePrint(true)"]');
    if (massButton) {
        massButton.textContent = `Cetak Kuitansi Massal (${dataPelanggan.length} Pelanggan)`;
    }
    
    updateReceipt(); 
});

/**
 * Fungsi PENTING untuk mengatasi masalah timing cetak dan DUPLIKASI.
 * @param {boolean} isMassPrint - True jika mode Cetak Massal (ambil data dari Array).
 */
function handlePrint(isMassPrint) {
    const outputContainer = document.getElementById('receipt-output');
    outputContainer.innerHTML = ''; // Kosongkan container

    let receiptsToPrint = [];
    
    if (isMassPrint) {
        // Mode Massal: Ulangi array data pelanggan
        receiptsToPrint = dataPelanggan.map(data => generateSingleReceiptHTML(data));
    } else {
        // Mode Satuan: Ambil dari input HTML, duplikasi sebanyak 'jumlah_cetak'
        const inputData = collectInputData(); // Kumpulkan data dari input
        const singleReceiptHTML = generateSingleReceiptHTML(inputData);
        
        const jumlahCetak = parseInt(document.getElementById('jumlah_cetak').value) || 1;
        for (let i = 0; i < jumlahCetak; i++) {
            receiptsToPrint.push(singleReceiptHTML);
        }
    }

    // Gabungkan semua kuitansi yang perlu dicetak
    receiptsToPrint.forEach(html => {
        outputContainer.innerHTML += `<div class="receipt-item">${html}</div>`;
    });

    // 4. Pastikan area kuitansi selalu terlihat
    outputContainer.style.display = 'block'; 

    // 5. Jeda singkat (100ms) agar browser selesai me-render konten baru.
    setTimeout(() => {
        window.print();
        
        // Opsional: Setelah mencetak, kembalikan tampilan ke pratinjau tunggal
        if (!isMassPrint) {
             outputContainer.innerHTML = `<div class="receipt-item">${generateSingleReceiptHTML(collectInputData())}</div>`;
        } else {
             outputContainer.innerHTML = `<div class="receipt-item" style="text-align: center; margin-top: 50px;">
                <p>Proses cetak ${dataPelanggan.length} kuitansi selesai.</p>
                <p>Silakan gunakan tombol "Cetak Satuan" untuk pratinjau.</p>
             </div>`;
        }
    }, 100); 
}

/**
 * Fungsi untuk mengumpulkan data dari input HTML (mode satuan).
 */
function collectInputData() {
    // Ambil harga tetap dari input yang dikunci (readonly)
    const hrgM = parseInt(document.getElementById('harga_per_m').value) || HARGA_PER_M;
    const pBeban = parseInt(document.getElementById('pokok_beban').value) || POKOK_BEBAN;
    
    return {
        periode: document.getElementById('periode').value.toUpperCase() || "BULAN",
        nama: document.getElementById('nama').value.toUpperCase() || "PELANGGAN",
        noPelanggan: document.getElementById('no_pelanggan').value || "0",
        alamat: document.getElementById('alamat').value.toUpperCase() || "ALAMAT",
        standAwal: parseInt(document.getElementById('stand_awal').value) || 0,
        standAkhir: parseInt(document.getElementById('stand_akhir').value) || 0,
        hargaPerM: hrgM, 
        pokokBeban: pBeban,
    };
}


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

/**
 * Fungsi untuk memperbarui tampilan saat ada perubahan input (hanya menampilkan 1 kuitansi).
 */
function updateReceipt() {
    const output = document.getElementById('receipt-output');
    
    // Tampilkan hanya satu template dari input untuk pratinjau
    const inputData = collectInputData();
    const singleReceiptHTML = generateSingleReceiptHTML(inputData);
    output.innerHTML = `<div class="receipt-item">${singleReceiptHTML}</div>`;
    output.style.display = 'block'; 
}
