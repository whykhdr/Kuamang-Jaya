document.addEventListener('DOMContentLoaded', function() {
    const kwitansiForm = document.getElementById('kwitansiForm');
    const itemsContainer = document.getElementById('items-container');
    const addItemButton = document.getElementById('add-item');
    const tanggalInput = document.getElementById('tanggal');
    const nomorKwitansiInput = document.getElementById('nomorKwitansi');
    const jumlahUangInput = document.getElementById('jumlahUang');
    const terbilangInput = document.getElementById('terbilang');
    const printKwitansiBtn = document.getElementById('printKwitansiBtn');

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
    
    // Generate a simple default receipt number based on date and time
    const hours = String(today.getHours()).padStart(2, '0');
    const minutes = String(today.getMinutes()).padStart(2, '0');
    const seconds = String(today.getSeconds()).padStart(2, '0');
    nomorKwitansiInput.value = `KAS/KJ/${dd}${mm}/${currentYear}/${hours}${minutes}${seconds}`;


    // --- FUNGSI UNTUK MENGELOLA ITEM DAN TOTAL DI FORM UTAMA ---

    addItemButton.addEventListener('click', function() {
        const newItemRow = document.createElement('div');
        newItemRow.classList.add('item-row');
        newItemRow.innerHTML = `
            <input type="text" class="item-name" placeholder="Item">
            <input type="number" class="item-quantity" placeholder="Jumlah">
            <input type="number" class="item-price" placeholder="Harga Satuan">
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
        updateGrandTotal();
    }

    function attachEventListenersToNewItemRow(row) {
        const quantityInput = row.querySelector('.item-quantity');
        const priceInput = row.querySelector('.item-price');

        quantityInput.addEventListener('input', () => calculateItemTotalForElement(quantityInput));
        priceInput.addEventListener('input', () => calculateItemTotalForElement(priceInput));
    }

    function updateGrandTotal() {
        let grandTotal = 0;
        document.querySelectorAll('.item-total').forEach(totalInput => {
            grandTotal += parseFloat(totalInput.value) || 0;
        });
        console.log("DEBUG: Grand Total Terhitung (Angka):", grandTotal);
        jumlahUangInput.value = grandTotal;
        
        const calculatedTerbilang = terbilang(grandTotal); // Hitung terbilang
        terbilangInput.value = calculatedTerbilang; // Set ke input terbilang
        
        console.log("DEBUG: Terbilang Teks (Set ke Input):", calculatedTerbilang); // Log nilai yang di-set
        console.log("DEBUG: Nilai Terbilang di Input (Saat Ini):", terbilangInput.value); // Log nilai yang benar-benar ada di input
    }

    function removeItem(button) {
        button.closest('.item-row').remove();
        updateGrandTotal();
    }

    // --- INISIALISASI AWAL ITEM DAN TOTAL PADA LOAD HALAMAN ---
    document.querySelectorAll('.item-row').forEach(row => {
        const quantityInput = row.querySelector('.item-quantity');
        const priceInput = row.querySelector('.item-price');
        const totalInput = row.querySelector('.item-total');

        const initialQuantity = parseFloat(quantityInput.value) || 0;
        const initialPrice = parseFloat(priceInput.value) || 0;
        totalInput.value = initialQuantity * initialPrice;
        
        attachEventListenersToNewItemRow(row);
        console.log(`Initial item total for '${row.querySelector('.item-name').value}': ${totalInput.value}`);
    });

    updateGrandTotal(); // Panggil saat memuat untuk inisialisasi awal


    // --- FUNGSI UNTUK GENERATE KWITANSI HTML UNTUK PRINT/PREVIEW ---
    function generateKwitansiHtml() {
        const nomorKwitansi = document.getElementById('nomorKwitansi').value;
        const tanggal = document.getElementById('tanggal').value;
        const jumlahUang = parseFloat(document.getElementById('jumlahUang').value) || 0;
        const terbilangText = document.getElementById('terbilang').value;
        const untukPembayaran = document.getElementById('untukPembayaran').value;
        const penerimaUang = document.getElementById('penerimaUang').value;
        const bendaharaPamsimas = document.getElementById('bendaharaPamsimas').value;

        console.log("Generating Kwitansi HTML - JumlahUang:", jumlahUang, "TerbilangText:", terbilangText);

        const items = [];
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

        // --- Definisi Fungsi Helper untuk Jendela Cetak (didefinisikan secara langsung) ---
        // Fungsi-fungsi ini didefinisikan ulang di sini agar tersedia di scope jendela baru.
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
                        if (groupText !== '') { if (i === groups.length - 2 && groupNum === 1 && groups.length > 1) { groupText = "seribu"; } else { groupText += ' ' + thousands[groups.length - 1 - i]; } }
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
                .kwitansi-print-container { width: 20cm; margin: 0.5cm auto; padding: 1cm; box-shadow: none; border: none; position: relative; overflow: hidden; }
                .kwitansi-print-container::before { content: ''; position: absolute; top: 0; left: 0; width: 100%; height: 3px; background: linear-gradient(to right, #4CAF50, #2196F3); }
                h1, h2 { text-align: center; color: #2c3e50; margin-bottom: 3px; text-transform: uppercase; letter-spacing: 0.5px; line-height: 1.1; }
                h1 { font-size: 20px; font-weight: 700; margin-top: 10px; color: #34495e; }
                h2 { font-size: 14px; margin-top: 0; margin-bottom: 15px; color: #555; font-weight: 500; position: relative; padding-bottom: 5px; }
                h2::after { content: ''; position: absolute; left: 50%; bottom: 0; transform: translateX(-50%); width: 40px; height: 1px; background-color: #2196F3; border-radius: 1px; }
                .info-header { display: flex; justify-content: space-between; margin-bottom: 10px; border-bottom: 1px solid #dee2e6; padding-bottom: 5px; font-size: 10px; font-weight: 600; color: #666; }
                .detail-row { display: flex; margin-bottom: 5px; line-height: 1.2; font-size: 10px; align-items: baseline; }
                .detail-row .label { width: 100px; font-weight: 600; color: #4a4a4a; flex-shrink: 0; }
                .amount-text { font-style: italic; border: 1px dashed #a2d9ab; padding: 6px 10px; margin-top: 15px; margin-bottom: 15px; background-color: #eafbea; font-size: 12px; font-weight: 600; text-align: center; color: #28a745; border-radius: 4px; box-shadow: none; }
                .section-label { font-weight: 700; margin-top: 15px; margin-bottom: 8px; border-bottom: 1px solid #dee2e6; padding-bottom: 5px; color: #34495e; font-size: 11px; text-transform: uppercase; letter-spacing: 0.2px; }
                .rincian-table { width: 100%; border-collapse: collapse; margin-top: 10px; margin-bottom: 15px; border-radius: 4px; overflow: hidden; border: 1px solid #e0e0e0; }
                .rincian-table th, .rincian-table td { border: 1px solid #e0e0e0; padding: 5px 8px; text-align: left; font-size: 9px; }
                .rincian-table th { background-color: #f2f2f2; font-weight: 600; color: #555; text-transform: uppercase; font-size: 9px; }
                tfoot td { background-color: #e9ecef; font-weight: 700; color: #2c3e50; border-top: 2px solid #ced4da; font-size: 10px; }
                .rincian-table td:last-child, .rincian-table th:last-child { text-align: right; }
                .rincian-table td:nth-child(2), .rincian-table th:nth-child(2), .rincian-table td:nth-child(3), .rincian-table th:nth-child(3) { text-align: center; }
                .date-location { text-align: right; margin-top: 20px; margin-bottom: 15px; font-size: 10px; font-weight: 600; color: #555; padding-right: 0px; }
                .signatures { display: flex; justify-content: space-around; margin-top: 30px; text-align: center; align-items: flex-end; font-size: 10px; }
                .signature-box { width: 48%; padding: 2px; display: flex; flex-direction: column; justify-content: flex-end; min-height: 70px; }
                .signature-box p { margin-top: auto; margin-bottom: 3px; border-bottom: 1px solid #444; padding-bottom: 3px; display: inline-block; min-width: 100px; font-weight: 700; color: #333; font-size: 10px; line-height: 1.2; }
                .signature-box .role { font-size: 9px; color: #666; font-weight: 500; text-transform: uppercase; letter-spacing: 0.1px; margin-bottom: 0; }

                @media print {
                    body { margin: 0; padding: 0; background-color: #fff; font-size: 8pt; }
                    .kwitansi-print-container { display: block; width: 100%; max-width: none; margin: 0; padding: 0.5cm; box-shadow: none; border: none; position: static; overflow: visible; box-sizing: border-box; }
                    .kwitansi-print-container::before { display: none; }
                    .kwitansi-print-container h1 { font-size: 16pt; margin-top: 0; margin-bottom: 5pt; }
                    .kwitansi-print-container h2 { font-size: 10pt; margin-bottom: 10pt; padding-bottom: 3pt; }
                    .kwitansi-print-container h2::after { display: none; }
                    .kwitansi-print-container .info-header { font-size: 8pt; margin-bottom: 8pt; padding-bottom: 4pt; }
                    .kwitansi-print-container .detail-row { font-size: 8pt; margin-bottom: 3pt; line-height: 1.1; }
                    .kwitansi-print-container .detail-row .label { width: 80px; }
                    .kwitansi-print-container .amount-text { font-size: 10pt; padding: 4pt 8pt; margin-top: 10pt; margin-bottom: 10pt; }
                    .kwitansi-print-container .section-label { font-size: 9pt; margin-top: 10pt; margin-bottom: 5pt; padding-bottom: 3pt; }
                    .kwitansi-print-container .rincian-table { margin-top: 5pt; margin-bottom: 10pt; }
                    .kwitansi-print-container .rincian-table th, .kwitansi-print-container .rincian-table td { padding: 3pt 5pt; font-size: 7.5pt; }
                    .kwitansi-print-container tfoot td { font-size: 8pt; }
                    .kwitansi-print-container .date-location { font-size: 8pt; margin-top: 15pt; margin-bottom: 10pt; }
                    .kwitansi-print-container .signatures { margin-top: 20pt; }
                    .kwitansi-print-container .signature-box { min-height: 60px; }
                    .kwitansi-print-container .signature-box p { font-size: 8pt; margin-bottom: 2pt; padding-bottom: 2pt; min-width: 90px; }
                    .kwitansi-print-container .role { font-size: 7pt; }
                    @page { size: 21.59cm 16.51cm; margin: 0.5cm; }
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
                        <div class="value">: Rp. ${formatCurrency(jumlahUang)},-</div>
                    </div>

                    <div class="amount-text">
                        Terbilang: ${terbilangText}
                    </div>

                    <div class="detail-row">
                        <div class="label">Untuk Pembayaran</div>
                        <div class="value">: ${untukPembayaran}</div>
                    </div>

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
                                <td style="text-align: right;">Rp. ${formatCurrency(jumlahUang)},-</td>
                            </tr>
                        </tfoot>
                    </table>

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
                ${kwitansiPrintHelperFunctions} <!-- Inject the helper functions here -->
            </body>
            </html>
        `;
    }


    kwitansiForm.addEventListener('submit', function(event) {
        event.preventDefault(); // Mencegah form submit default

        const kwitansiHtml = generateKwitansiHtml();

        // Buka di jendela baru
        const newWindow = window.open('', '_blank');
        newWindow.document.write(kwitansiHtml);
        newWindow.document.close();
    });

    // Event listener untuk tombol Print Kwitansi
    printKwitansiBtn.addEventListener('click', function() {
        const kwitansiHtml = generateKwitansiHtml();

        const printWindow = window.open('', '_blank');
        printWindow.document.write(kwitansiHtml);
        printWindow.document.close();

        // Tunggu konten dimuat sebelum print
        printWindow.onload = function() {
            printWindow.focus(); // Fokus ke jendela baru
            printWindow.print(); // Trigger dialog print
        };
    });


    // Expose removeItem to global scope so it can be called from onclick
    window.removeItem = removeItem;
}); // END OF DOMContentLoaded LISTENER
