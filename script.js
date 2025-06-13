document.addEventListener('DOMContentLoaded', function() {
    const kwitansiForm = document.getElementById('kwitansiForm');
    const itemsContainer = document.getElementById('items-container');
    const addItemButton = document.getElementById('add-item');
    const tanggalInput = document.getElementById('tanggal');
    const nomorKwitansiInput = document.getElementById('nomorKwitansi');
    const jumlahUangInput = document.getElementById('jumlahUang');
    const terbilangInput = document.getElementById('terbilang');
    const printKwitansiBtn = document.getElementById('printKwitansiBtn');

    // Referensi elemen baru
    const jenisPembayaranSelect = document.getElementById('jenisPembayaran');
    const detailPembayaranGroup = document.getElementById('detailPembayaranGroup');
    const namaPeminjamInput = document.getElementById('namaPeminjam');
    const namaPeminjamLabel = document.getElementById('namaPeminjamLabel');
    const untukPembayaranTextarea = document.getElementById('untukPembayaranTextarea');
    const untukPembayaranTextareaLabel = document.getElementById('untukPembayaranTextareaLabel');


    // --- FUNGSI HELPER YANG DIBUTUHKAN DI WINDOW UTAMA DAN WINDOW CETAK ---
    // Fungsi terbilang (akan di-string-ify dan di-inject ke HTML yang dihasilkan)
    function terbilang(number) {
        if (typeof number !== 'number' || isNaN(number)) { return "Bukan Angka"; }
        const units = ['', 'satu', 'dua', 'tiga', 'empat', 'lima', 'enam', 'tujuh', 'delapan', 'sembilan'];
        const teens = ['sepuluh', 'sebelas', 'dua belas', 'tiga belas', 'empat belas', 'lima belas', 'enam belas', 'tujuh belas', 'delapan belas', 'sembilan belas'];
        const tens = ['', '', 'dua puluh', 'tiga puluh', 'empat puluh', 'lima puluh', 'enam puluh', 'tujuh puluh', 'delapan puluh', 'sembilan puluh'];
        const thousands = ['', 'ribu', 'juta', 'miliar', 'triliun'];
        function convertGroup(n) {
            let text = ''; const hundred = Math.floor(n / 100); const remainder = n % 100;
            if (hundred === 1) { text += 'seratus'; } else if (hundred > 0) { text += units[hundred] + ' ratus'; }
            if (remainder > 0) {
                if (text !== '') text += ' ';
                if (remainder < 10) { text += units[remainder]; } else if (remainder >= 10 && remainder < 20) { text += teens[remainder - 10]; } else { text += tens[Math.floor(remainder / 10)]; if (remainder % 10 > 0) { text += ' ' + units[remainder % 10]; } }
            }
            return text;
        }
        if (number === 0) return 'Nol';
        let result = ''; let numStr = String(Math.floor(number)); let groups = [];
        while (numStr.length > 0) { if (numStr.length <= 3) { groups.unshift(numStr); numStr = ''; } else { groups.unshift(numStr.slice(-3)); numStr = numStr.slice(0, -3); } }
        for (let i = 0; i < groups.length; i++) {
            const groupNum = parseInt(groups[i], 10); if (groupNum === 0) continue;
            let groupText = convertGroup(groupNum);
            if (groupText !== '') { if (i === groups.length - 2 && groupNum === 1 && groups.length > 1) { groupText = "seribu"; } else { groupText += ' ' + thousands[groups.length - 1 - i]; } }
            if (result !== '') result += ' '; result += groupText;
        }
        result = result.trim(); if (result.length > 0) { result = result.charAt(0).toUpperCase() + result.slice(1); }
        return result + " Rupiah";
    }

    // Fungsi formatCurrency (akan di-string-ify dan di-inject ke HTML yang dihasilkan)
    function formatCurrency(number) {
        const num = parseFloat(number);
        if (isNaN(num)) { return "NaN"; }
        return new Intl.NumberFormat('id-ID', { minimumFractionDigits: 0, maximumFractionDigits: 0 }).format(num);
    }

    // Fungsi formatDate (akan di-string-ify dan di-inject ke HTML yang dihasilkan)
    function formatDate(dateString) {
        const options = { day: 'numeric', month: 'long', year: 'numeric' };
        return new Date(dateString).toLocaleDateString('id-ID', options);
    }


    // --- INISIALISASI FORM SAAT DOMContentLoaded ---

    // Set default date to current date
    const today = new Date();
    const currentYear = today.getFullYear();
    const mm = String(today.getMonth() + 1).padStart(2, '0');
    const dd = String(today.getDate()).padStart(2, '0');
    tanggalInput.value = `${currentYear}-${mm}-${dd}`;
    
    // Rubah nomor Kwitansi Menjadi KAS/PKJ/001/VI/2025
    nomorKwitansiInput.value = 'KAS/PKJ/001/VI/2025';


    // --- FUNGSI UNTUK MENGELOLA ITEM DAN TOTAL DI FORM UTAMA ---

    addItemButton.addEventListener('click', function() {
        const newItemRow = document.createElement('div');
        newItemRow.classList.add('item-row');
        newItemRow.innerHTML = `
            <input type="text" class="item-name" placeholder="Nama Item">
            <input type="number" class="item-quantity" placeholder="Kuantitas" value="0">
            <input type="number" class="item-price" placeholder="Harga Satuan (Rp)" value="0">
            <input type="number" class="item-total" placeholder="Total" readonly>
            <button type="button" onclick="removeItem(this)">Hapus</button>
        `;
        itemsContainer.appendChild(newItemRow);
        attachEventListenersToNewItemRow(newItemRow); 
        
        newItemRow.querySelector('.item-quantity').value = '0';
        newItemRow.querySelector('.item-price').value = '0';
        calculateItemTotalForElement(newItemRow.querySelector('.item-quantity'));
    });

    function calculateItemTotalForElement(inputElement) {
        const row = inputElement.closest('.item-row');
        const quantity = parseFloat(row.querySelector('.item-quantity').value) || 0;
        const price = parseFloat(row.querySelector('.item-price').value) || 0;
        row.querySelector('.item-total').value = quantity * price;
        updateGrandTotal(); // Recalculate grand total after item change
    }

    function attachEventListenersToNewItemRow(row) {
        const quantityInput = row.querySelector('.item-quantity');
        const priceInput = row.querySelector('.item-price');

        quantityInput.addEventListener('input', () => calculateItemTotalForElement(quantityInput));
        priceInput.addEventListener('input', () => calculateItemTotalForElement(priceInput));
    }

    function updateGrandTotal() {
        const jenis = jenisPembayaranSelect.value;
        let grandTotal = 0;

        if (jenis === 'peminjaman_uang') {
            // Jika Peminjaman Uang, izinkan input manual untuk jumlahUang dan perbarui terbilang dari itu
            jumlahUangInput.readOnly = false; // Bisa diketik
            itemsContainer.style.display = 'none'; // Sembunyikan rincian item
            addItemButton.style.display = 'none'; // Sembunyikan tombol tambah item

            const amountFromInput = parseFloat(jumlahUangInput.value.replace(/[^0-9.]/g, '')) || 0;
            terbilangInput.value = terbilang(amountFromInput);
            console.log("DEBUG: updateGrandTotal (Peminjaman Uang) - Jumlah dari input:", amountFromInput, "Terbilang:", terbilangInput.value);
            // Tidak perlu set jumlahUangInput.value di sini karena pengguna langsung mengetiknya
        } else {
            // Untuk jenis pembayaran lain, hitung dari rincian item
            jumlahUangInput.readOnly = true; // Kembali ke readonly
            itemsContainer.style.display = 'block'; // Tampilkan rincian item
            addItemButton.style.display = 'block'; // Tampilkan tombol tambah item

            document.querySelectorAll('.item-total').forEach(totalInput => {
                grandTotal += parseFloat(totalInput.value) || 0;
            });
            jumlahUangInput.value = grandTotal;
            terbilangInput.value = terbilang(grandTotal);
            console.log("DEBUG: updateGrandTotal (Rincian Item) - Grand Total:", grandTotal, "Terbilang:", terbilangInput.value);
        }
        console.log("DEBUG: updateGrandTotal - Nilai Terbilang di Input (Saat Ini):", terbilangInput.value);
    }

    function removeItem(button) {
        button.closest('.item-row').remove();
        updateGrandTotal();
    }

    // --- INISIALISASI AWAL ITEM DAN TOTAL PADA LOAD HALAMAN ---
    // Loop ini memasang listener ke item awal jika ada, dan menghitung totalnya.
    // Jika items-container kosong, grandTotal akan 0.
    document.querySelectorAll('#items-container .item-row').forEach(row => {
        const quantityInput = row.querySelector('.item-quantity');
        const priceInput = row.querySelector('.item-price');
        const totalInput = row.querySelector('.item-total');

        const initialQuantity = parseFloat(quantityInput.value) || 0;
        const initialPrice = parseFloat(priceInput.value) || 0;
        totalInput.value = initialQuantity * initialPrice;
        
        attachEventListenersToNewItemRow(row);
        console.log(`DEBUG: Initial item total for '${row.querySelector('.item-name').value}': ${totalInput.value}`);
    });
    
    // Panggil saat memuat untuk inisialisasi awal (termasuk status readonly dan visibilitas item-container)
    updateGrandTotal();

    // Tambahkan event listener untuk input manual pada jumlahUang saat bisa diedit (untuk peminjaman)
    jumlahUangInput.addEventListener('input', function() {
        if (!jumlahUangInput.readOnly) { // Hanya perbarui terbilang jika bisa diedit
            const amount = parseFloat(jumlahUangInput.value.replace(/[^0-9.]/g, '')) || 0;
            terbilangInput.value = terbilang(amount);
            console.log("DEBUG: jumlahUangInput manual input - Terbilang diperbarui:", terbilangInput.value);
        }
    });


    // --- FUNGSI UNTUK MENGELOLA LOGIKA JENIS PEMBAYARAN ---
    function updateUntukPembayaranField() {
        const jenis = jenisPembayaranSelect.value;
        const namaPeminjam = namaPeminjamInput.value.trim();
        let finalUntukPembayaranText = "";

        // Tampilkan/sembunyikan grup detail pembayaran
        if (jenis === "") {
            detailPembayaranGroup.style.display = 'none';
            untukPembayaranTextarea.value = ""; // Kosongkan saat tidak ada pilihan
            namaPeminjamInput.value = ""; // Kosongkan nama peminjam
            namaPeminjamLabel.style.display = 'none';
            namaPeminjamInput.style.display = 'none';
            namaPeminjamInput.required = false;

        } else {
            detailPembayaranGroup.style.display = 'block';
        }

        // Atur visibilitas input nama peminjam dan teks label/placeholder
        if (jenis === "peminjaman_uang") {
            namaPeminjamLabel.style.display = 'none';
            namaPeminjamInput.style.display = 'none';
            namaPeminjamInput.required = false;
            untukPembayaranTextareaLabel.textContent = "Keterangan Peminjaman:";
            untukPembayaranTextarea.placeholder = "Masukkan keterangan peminjaman di sini...";
        } else {
            namaPeminjamLabel.style.display = 'none';
            namaPeminjamInput.style.display = 'none';
            namaPeminjamInput.required = false;
            untukPembayaranTextareaLabel.textContent = "Detail Pembayaran:";
            untukPembayaranTextarea.placeholder = "Masukkan detail pembayaran di sini...";
        }

        // Bangun teks untuk 'Untuk Pembayaran' (Hanya tujuan utama, tanpa detail)
        if (jenis === "pembelian_material") {
            finalUntukPembayaranText = "Pembelian Material";
        } else if (jenis === "transportasi") {
            finalUntukPembayaranText = "Biaya Transportasi";
        } else if (jenis === "peminjaman_uang") {
            finalUntukPembayaranText = "Peminjaman Uang";
        } else if (jenis === "lain_lain") {
            finalUntukPembayaranText = "Lain-lain";
        }
        // Detail dari textarea tidak lagi digabung di sini, akan ditangani di generateKwitansiHtml

        // Panggil updateGrandTotal untuk menyesuaikan status readonly dan visibilitas item
        updateGrandTotal();
    }

    // Event listener untuk perubahan jenis pembayaran
    jenisPembayaranSelect.addEventListener('change', updateUntukPembayaranField);
    namaPeminjamInput.addEventListener('input', updateUntukPembayaranField);
    untukPembayaranTextarea.addEventListener('input', updateUntukPembayaranField);

    // Panggil saat load untuk inisialisasi awal
    updateUntukPembayaranField();


    // --- FUNGSI UNTUK GENERATE KWITANSI HTML UNTUK PRINT/PREVIEW ---
    function generateKwitansiHtml(jumlahUangFinal, terbilangTextFinal) {
        console.log("DEBUG: generateKwitansiHtml - JumlahUang yang Diterima:", jumlahUangFinal);
        console.log("DEBUG: generateKwitansiHtml - TerbilangText yang Diterima:", terbilangTextFinal);

        const nomorKwitansi = document.getElementById('nomorKwitansi').value;
        const tanggal = document.getElementById('tanggal').value;
        
        const jenis = jenisPembayaranSelect.value;
        const keteranganDetail = untukPembayaranTextarea.value.trim();

        let mainPurposeText = "";
        if (jenis === "pembelian_material") {
            mainPurposeText = "Pembelian Material";
        } else if (jenis === "transportasi") {
            mainPurposeText = "Biaya Transportasi";
        } else if (jenis === "peminjaman_uang") {
            mainPurposeText = "Peminjaman Uang";
        } else if (jenis === "lain_lain") {
            mainPurposeText = "Lain-lain";
        }

        const penerimaUang = document.getElementById('penerimaUang').value;
        const bendaharaPamsimas = document.getElementById('bendaharaPamsimas').value;

        const items = [];
        // Hanya tambahkan item jika jenis pembayaran BUKAN peminjaman uang
        if (jenis !== 'peminjaman_uang') {
            document.querySelectorAll('#items-container .item-row').forEach(row => {
                const itemName = row.querySelector('.item-name').value;
                const itemQuantity = row.querySelector('.item-quantity').value;
                const itemPrice = parseFloat(row.querySelector('.item-price').value) || 0;
                const itemTotal = parseFloat(row.querySelector('.item-total').value) || 0;
                if (itemName) {
                    items.push({
                        name: itemName,
                        quantity: itemQuantity,
                        price: itemPrice,
                        total: itemTotal
                    });
                }
            });
        }
        
        // Rendering kondisional untuk tabel item di HTML kwitansi
        const itemsTableHtml = items.length > 0 ? `
            <div class="section-label">Rincian Pengeluaran</div>
            <table class="rincian-table">
                <thead>
                    <tr>
                        <th>Item</th>
                        <th>Jumlah</th>
                        <th>Harga Satuan</th>
                        <th>Total</th>
                    </tr>
                </thead>
                <tbody>
                    ${items.map(item => `
                        <tr>
                            <td>${item.name}</td>
                            <td style="text-align: center;">${item.quantity}</td>
                            <td style="text-align: center;">Rp. ${formatCurrency(item.price)},-</td>
                            <td style="text-align: right;">Rp. ${formatCurrency(item.total)},-</td>
                        </tr>
                    `).join('')}
                </tbody>
                <tfoot>
                    <tr>
                        <td colspan="3" style="text-align:right;">TOTAL KESELURUHAN</td>
                        <td style="text-align: right;">Rp. ${formatCurrency(jumlahUangFinal)},-</td>
                    </tr>
                </tfoot>
            </table>
        ` : '';

        // HTML untuk keterangan tambahan, ditampilkan di baris terpisah jika ada
        const keteranganTambahanHtml = keteranganDetail ? `
            <div class="detail-row detail-sub-row">
                <div class="label"></div> <!-- Label kosong untuk menjaga alignment -->
                <div class="value">${keteranganDetail}</div>
            </div>
        ` : '';


        // Definisi Fungsi Helper untuk Jendela Cetak (didefinisikan secara langsung)
        const kwitansiPrintHelperFunctions = `
            <script>
                function terbilang(number) {
                    if (typeof number !== 'number' || isNaN(number)) { return "Bukan Angka"; }
                    const units = ['', 'satu', 'dua', 'tiga', 'empat', 'lima', 'enam', 'tujuh', 'delapan', 'sembilan'];
                    const teens = ['sepuluh', 'sebelas', 'dua belas', 'tiga belas', 'empat belas', 'lima belas', 'enam belas', 'tujuh belas', 'delapan belas', 'sembilan belas'];
                    const tens = ['', '', 'dua puluh', 'tiga puluh', 'empat puluh', 'lima puluh', 'enam puluh', 'tujuh puluh', 'delapan puluh', 'sembilan puluh'];
                    const thousands = ['', 'ribu', 'juta', 'miliar', 'triliun'];
                    function convertGroup(n) {
                        let text = ''; const hundred = Math.floor(n / 100); const remainder = n % 100;
                        if (hundred === 1) { text += 'seratus'; } else if (hundred > 0) { text += units[hundred] + ' ratus'; }
                        if (remainder > 0) {
                            if (text !== '') text += ' ';
                            if (remainder < 10) { text += units[remainder]; } else if (remainder >= 10 && remainder < 20) { text += teens[remainder - 10]; } else { text += tens[Math.floor(remainder / 10)]; if (remainder % 10 > 0) { text += ' ' + units[remainder % 10]; } }
                        }
                        return text;
                    }
                    if (number === 0) return 'Nol';
                    let result = ''; let numStr = String(Math.floor(number)); let groups = [];
                    while (numStr.length > 0) { if (numStr.length <= 3) { groups.unshift(numStr); numStr = ''; } else { groups.unshift(numStr.slice(-3)); numStr = numStr.slice(0, -3); } }
                    for (let i = 0; i < groups.length; i++) {
                        const groupNum = parseInt(groups[i], 10); if (groupNum === 0) continue;
                        let groupText = convertGroup(groupNum);
                        if (groupText !== '') {
                            if (i === groups.length - 2 && groupNum === 1 && groups.length > 1) { groupText = "seribu"; } else { groupText += ' ' + thousands[groups.length - 1 - i]; }
                        }
                        if (result !== '') result += ' '; result += groupText;
                    }
                    result = result.trim(); if (result.length > 0) { result = result.charAt(0).toUpperCase() + result.slice(1); }
                    return result + " Rupiah";
                }

                function formatCurrency(number) {
                    const num = parseFloat(number);
                    if (isNaN(num)) { return "NaN"; }
                    return new Intl.NumberFormat('id-ID', { minimumFractionDigits: 0, maximumFractionDigits: 0 }).format(num);
                }

                function formatDate(dateString) {
                    const options = { day: 'numeric', month: 'long', year: 'numeric' };
                    return new Date(dateString).toLocaleDateString('id-ID', options);
                }
            </script>
        `;

        // Style untuk kwitansi cetak (diulang di sini agar self-contained)
        const kwitansiPrintStyle = `
            <style>
                body { margin: 0; padding: 0; font-family: 'Poppins', sans-serif; color: #333; background-color: #fff; }
                .kwitansi-print-container {
                    width: 20cm;
                    margin: 0.5cm auto;
                    padding: 1cm;
                    box-shadow: none;
                    border: 1px solid #ddd;
                    position: relative;
                    overflow: hidden;
                    box-sizing: border-box;
                }
                .kwitansi-print-container::before { content: ''; position: absolute; top: 0; left: 0; width: 100%; height: 3px; background: linear-gradient(to right, #4CAF50, #2196F3); }
                h1, h2 { text-align: center; color: #2c3e50; margin-bottom: 3px; text-transform: uppercase; letter-spacing: 0.5px; line-height: 1.1; }
                h1 { font-size: 20px; font-weight: 700; margin-top: 10px; color: #34495e; }
                h2 { font-size: 14px; margin-top: 0; margin-bottom: 15px; color: #555; font-weight: 500; position: relative; padding-bottom: 5px; }
                h2::after { content: ''; position: absolute; left: 50%; bottom: 0; transform: translateX(-50%); width: 40px; height: 1px; background-color: #2196F3; border-radius: 1px; }
                .info-header { display: flex; justify-content: space-between; margin-bottom: 15px; border-bottom: 1px solid #dee2e6; padding-bottom: 8px; font-size: 10px; font-weight: 600; color: #666; }
                .detail-row { display: flex; margin-bottom: 7px; line-height: 1.3; font-size: 11px; align-items: baseline; }
                .detail-row .label { width: 120px; font-weight: 600; color: #4a4a4a; flex-shrink: 0; }
                .detail-row .value {
                    flex-grow: 1;
                    border-bottom: 1px dotted #ccc;
                    padding-bottom: 2px;
                    word-wrap: break-word;
                    white-space: pre-wrap;
                }
                
                /* Gaya khusus untuk baris keterangan tambahan */
                .detail-row.detail-sub-row {
                    margin-top: -5px;
                    margin-bottom: 7px;
                }
                .detail-row.detail-sub-row .label {
                    width: 120px;
                    visibility: hidden;
                    flex-shrink: 0;
                }
                .detail-row.detail-sub-row .value {
                    border-bottom: none;
                    padding-bottom: 0;
                    margin-left: -1px;
                    font-size: 10.5px;
                    color: #555;
                    line-height: 1.5;
                }

                .amount-text { 
                    font-style: italic; 
                    border: 1px dashed #a2d9ab; 
                    padding: 8px 15px; 
                    margin-top: 20px; 
                    margin-bottom: 25px;
                    background-color: #eafbea; 
                    font-size: 13px; 
                    font-weight: 600; 
                    text-align: center; 
                    color: #28a745; 
                    border-radius: 4px; 
                    box-shadow: 0 1px 3px rgba(0,0,0,0.05);
                }
                .section-label { font-weight: 700; margin-top: 20px; margin-bottom: 10px; border-bottom: 1px solid #dee2e6; padding-bottom: 6px; color: #34495e; font-size: 12px; text-transform: uppercase; letter-spacing: 0.2px; }
                .rincian-table { width: 100%; border-collapse: collapse; margin-top: 10px; margin-bottom: 20px; border-radius: 4px; overflow: hidden; border: 1px solid #e0e0e0; }
                .rincian-table th, .rincian-table td { border: 1px solid #e0e0e0; padding: 7px 10px; text-align: left; font-size: 10px; }
                .rincian-table th { background-color: #f8f8f8; font-weight: 600; color: #555; text-transform: uppercase; font-size: 9.5px; }
                tfoot td { background-color: #e9ecef; font-weight: 700; color: #2c3e50; border-top: 2px solid #ced4da; font-size: 11px; }
                .rincian-table td:last-child, .rincian-table th:last-child { text-align: right; }
                .rincian-table td:nth-child(2), .rincian-table th:nth-child(2), .rincian-table td:nth-child(3), .rincian-table th:nth-child(3) { text-align: center; }
                .date-location { text-align: right; margin-top: 25px; margin-bottom: 20px; font-size: 11px; font-weight: 600; color: #555; padding-right: 0px; }
                .signatures { display: flex; justify-content: space-around; margin-top: 40px; text-align: center; align-items: flex-end; font-size: 11px; }
                .signature-box { width: 48%; padding: 5px; display: flex; flex-direction: column; justify-content: flex-end; min-height: 80px; }
                .signature-box p { margin-top: auto; margin-bottom: 5px; border-bottom: 1px solid #444; padding-bottom: 4px; display: inline-block; min-width: 120px; font-weight: 700; color: #333; font-size: 11px; line-height: 1.3; }
                .signature-box .role { font-size: 10px; color: #666; font-weight: 500; text-transform: uppercase; letter-spacing: 0.1px; margin-bottom: 0; }

                /* Print specific styles */
                @media print {
                    body { margin: 0; padding: 0; background-color: #fff; font-size: 8pt; }
                    .kwitansi-print-container {
                        display: block;
                        width: 100%;
                        max-width: none;
                        margin: 0;
                        padding: 0.5cm;
                        box-shadow: none;
                        border: none;
                        position: static;
                        overflow: visible;
                        box-sizing: border-box;
                    }
                    .kwitansi-print-container::before { display: none; }
                    .kwitansi-print-container h1 { font-size: 14pt; margin-top: 0; margin-bottom: 5pt; } /* Reduced font size for print */
                    .kwitansi-print-container h2 { font-size: 9pt; margin-bottom: 10pt; padding-bottom: 3pt; } /* Reduced font size for print */
                    .kwitansi-print-container .info-header { font-size: 7.5pt; margin-bottom: 8pt; padding-bottom: 4pt; } /* Reduced font size for print */
                    .kwitansi-print-container .detail-row { font-size: 8pt; margin-bottom: 3pt; line-height: 1.1; }
                    .kwitansi-print-container .detail-row .label { width: 80px; }
                    .kwitansi-print-container .amount-text { font-size: 11pt; padding: 4pt 8pt; margin-top: 10pt; margin-bottom: 10pt; } /* Reduced font size for print */
                    .kwitansi-print-container .section-label { font-size: 9pt; margin-top: 10pt; margin-bottom: 5pt; padding-bottom: 3pt; } /* Reduced font size for print */
                    .kwitansi-print-container .rincian-table { margin-top: 5pt; margin-bottom: 10pt; }
                    .kwitansi-print-container .rincian-table th, .kwitansi-print-container .rincian-table td { padding: 3pt 5pt; font-size: 7pt; } /* Reduced font size for print */
                    tfoot td { font-size: 8pt; }
                    .kwitansi-print-container .date-location { font-size: 7.5pt; margin-top: 15pt; margin-bottom: 10pt; } /* Reduced font size for print */
                    .kwitansi-print-container .signatures { margin-top: 15pt; } /* Reduced margin for print */
                    .kwitansi-print-container .signature-box { min-height: 50px; } /* Reduced min-height for print */
                    .kwitansi-print-container .signature-box p { font-size: 7.5pt; margin-bottom: 2pt; padding-bottom: 2pt; min-width: 90px; } /* Reduced font size for print */
                    .kwitansi-print-container .role { font-size: 6.5pt; } /* Reduced font size for print */
                    
                    /* New page size for half F4 portrait */
                    @page { 
                        size: 21.5cm 16.5cm portrait; /* Lebar F4 x Setengah Tinggi F4, orientasi portrait */
                        margin: 0.5cm; /* Margin yang rapi di semua sisi */
                    }
                }
            </style>
        `;

        // Construct the kwitansi HTML based on form inputs
        return `
            <!DOCTYPE html>
            <html lang="id">
            <head>
                <meta charset="UTF-8">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                <title>Kwitansi Pengeluaran Uang Kas - Pamsimas Kuamang Jaya</title>
                ${kwitansiPrintStyle}
                <link href="https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;500;600;700&display=swap" rel="stylesheet">
            </head>
            <body>
                <div class="kwitansi-print-container">
                    <h1>KWITANSI PENGELUARAN UANG KAS</h1>
                    <h2>PAMSIMAS KUAMANG JAYA</h2>

                    <div class="info-header">
                        <div>
                            Nomor Kwitansi: ${nomorKwitansi}
                        </div>
                        <div>
                            Tanggal: ${formatDate(tanggal)}
                        </div>
                    </div>

                    <div class="detail-row">
                        <div class="label">Sudah Terima Dari</div>
                        <div class="value">: Bendahara Pamsimas Kuamang Jaya</div>
                    </div>
                    <div class="detail-row">
                        <div class="label">Jumlah Uang Sebesar</div>
                        <div class="value">: Rp. ${formatCurrency(jumlahUangFinal)},-</div>
                    </div>

                    <div class="amount-text">
                        Terbilang: ${terbilangTextFinal}
                    </div>

                    <div class="detail-row">
                        <div class="label">Untuk Pembayaran</div>
                        <div class="value">: ${mainPurposeText}</div>
                    </div>
                    ${keteranganTambahanHtml}

                    ${itemsTableHtml}

                    <div class="date-location">
                        Kuamang Jaya, ${formatDate(tanggal)}
                    </div>

                    <div class="signatures">
                        <div class="signature-box">
                            <p>${bendaharaPamsimas}</p>
                            <span class="role">Bendahara Pamsimas</span>
                        </div>
                        <div class="signature-box">
                            <p>${penerimaUang}</p>
                            <span class="role">Penerima Uang</span>
                        </div>
                    </div>
                </div>
                ${kwitansiPrintHelperFunctions}
            </body>
            </html>
        `;
    }


    kwitansiForm.addEventListener('submit', function(event) {
        event.preventDefault();

        const currentJumlahUang = parseFloat(jumlahUangInput.value) || 0;
        const currentTerbilangText = terbilangInput.value;

        const kwitansiHtml = generateKwitansiHtml(currentJumlahUang, currentTerbilangText);

        const newWindow = window.open('', '_blank');
        newWindow.document.write(kwitansiHtml);
        newWindow.document.close();
    });

    printKwitansiBtn.addEventListener('click', function() {
        const currentJumlahUang = parseFloat(jumlahUangInput.value) || 0;
        const currentTerbilangText = terbilangInput.value;

        const kwitansiHtml = generateKwitansiHtml(currentJumlahUang, currentTerbilangText);

        const printWindow = window.open('', '_blank');
        printWindow.document.write(kwitansiHtml);
        printWindow.document.close();

        printWindow.onload = function() {
            printWindow.focus();
            printWindow.print();
        };
    });

    window.removeItem = removeItem;
});
