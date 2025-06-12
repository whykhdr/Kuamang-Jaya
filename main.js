// main.js

document.addEventListener('DOMContentLoaded', function() {
    const kwitansiForm = document.getElementById('kwitansiForm');
    const itemsContainer = document.getElementById('items-container');
    const addItemButton = document.getElementById('add-item');
    const tanggalInput = document.getElementById('tanggal');
    const nomorKwitansiInput = document.getElementById('nomorKwitansi');
    const jumlahUangInput = document.getElementById('jumlahUang');
    const terbilangInput = document.getElementById('terbilang');
    const printKwitansiBtn = document.getElementById('printKwitansiBtn');

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

    // Tambahkan event listener untuk input jumlah uang
    jumlahUangInput.addEventListener('input', function() {
        terbilangInput.value = terbilang(parseFloat(jumlahUangInput.value) || 0);
    });

    // --- FUNGSI UNTUK MENGELOLA ITEM DAN TOTAL ---
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
    });

    // Helper function to calculate total for a specific row and trigger grand total update
    function calculateItemTotalForElement(inputElement) {
        const row = inputElement.closest('.item-row');
        const quantity = parseFloat(row.querySelector('.item-quantity').value) || 0;
        const price = parseFloat(row.querySelector('.item-price').value) || 0;
        row.querySelector('.item-total').value = quantity * price; // Update the individual item total
        updateGrandTotal(); // Update the overall grand total and terbilang
    }

    // Attach event listeners (input events) to quantity and price fields in a row
    function attachEventListenersToNewItemRow(row) {
        const quantityInput = row.querySelector('.item-quantity');
        const priceInput = row.querySelector('.item-price');

        quantityInput.addEventListener('input', () => calculateItemTotalForElement(quantityInput));
        priceInput.addEventListener('input', () => calculateItemTotalForElement(priceInput));
    }

    // Calculates the sum of all item totals and updates the main total and terbilang fields.
    function updateGrandTotal() {
        let grandTotal = 0;
        document.querySelectorAll('.item-total').forEach(totalInput => {
            grandTotal += parseFloat(totalInput.value) || 0;
        });
        console.log("Grand Total Terhitung (Angka):", grandTotal); // DEBUG
        jumlahUangInput.value = grandTotal; // Update the main numerical total input
        terbilangInput.value = terbilang(grandTotal); // Update the "terbilang" text input
        console.log("Terbilang Teks (Output):", terbilangInput.value); // DEBUG
    }

    // Remove item from list and update grand total
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
        totalInput.value = initialQuantity * initialPrice; // Calculate initial total for each existing row
        
        attachEventListenersToNewItemRow(row); // Attach listeners for future changes
    });

    // Perform an initial grand total calculation and terbilang update on page load.
    updateGrandTotal();

    // --- FUNGSI UNTUK GENERATE KWITANSI HTML UNTUK PRINT/PREVIEW ---
    function generateKwitansiHtml() {
        const nomorKwitansi = document.getElementById('nomorKwitansi').value;
        const tanggal = document.getElementById('tanggal').value;
        const jumlahUang = parseFloat(document.getElementById('jumlahUang').value) || 0; // Ensure numerical
        const terbilangText = document.getElementById('terbilang').value; // Get the already calculated terbilang text
        const untukPembayaran = document.getElementById('untukPembayaran').value;
        const penerimaUang = document.getElementById('penerimaUang').value;
        const bendaharaPamsimas = document.getElementById('bendaharaPamsimas').value;

        const items = [];
        document.querySelectorAll('#items-container .item-row').forEach(row => {
            const itemName = row.querySelector('.item-name').value;
            const itemQuantity = row.querySelector('.item-quantity').value; // Keep as string for display
            const itemPrice = parseFloat(row.querySelector('.item-price').value) || 0; // Ensure numerical for formatting
            const itemTotal = parseFloat(row.querySelector('.item-total').value) || 0; // Ensure numerical for formatting
            if (itemName) {
                items.push({
                    name: itemName,
                    quantity: itemQuantity,
                    price: itemPrice,
                    total: itemTotal
                });
            }
        });

        // Construct the kwitansi HTML based on form inputs
        return `
            <!DOCTYPE html>
            <html lang="id">
            <head>
                <meta charset="UTF-8">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                <title>Kwitansi Pengeluaran Uang Kas - Pamsimas Kuamang Jaya</title>
                <style>
                    /* Embed all kwitansi styles directly for consistent printing */
                    body {
                        margin: 0;
                        padding: 0;
                        font-family: 'Poppins', sans-serif;
                        color: #333;
                        background-color: #fff; /* Ensure white background for print */
                    }
                    .kwitansi-print-container {
                        width: 20cm;
                        margin: 0.5cm auto;
                        padding: 1cm;
                        box-shadow: none;
                        border: none;
                        position: relative;
                        overflow: hidden;
                    }
                    .kwitansi-print-container::before {
                        content: '';
                        position: absolute;
                        top: 0;
                        left: 0;
                        width: 100%;
                        height: 3px;
                        background: linear-gradient(to right, #4CAF50, #2196F3);
                    }
                    h1, h2 {
                        text-align: center;
                        color: #2c3e50;
                        margin-bottom: 3px;
                        text-transform: uppercase;
                        letter-spacing: 0.5px;
                        line-height: 1.1;
                    }
                    h1 {
                        font-size: 20px;
                        font-weight: 700;
                        margin-top: 10px;
                        color: #34495e;
                    }
                    h2 {
                        font-size: 14px;
                        margin-top: 0;
                        margin-bottom: 15px;
                        color: #555;
                        font-weight: 500;
                        position: relative;
                        padding-bottom: 5px;
                    }
                    h2::after {
                        content: '';
                        position: absolute;
                        left: 50%;
                        bottom: 0;
                        transform: translateX(-50%);
                        width: 40px;
                        height: 1px;
                        background-color: #2196F3;
                        border-radius: 1px;
                    }
                    .info-header {
                        display: flex;
                        justify-content: space-between;
                        margin-bottom: 10px;
                        border-bottom: 1px solid #dee2e6;
                        padding-bottom: 5px;
                        font-size: 10px;
                        font-weight: 600;
                        color: #666;
                    }
                    .detail-row {
                        display: flex;
                        margin-bottom: 5px;
                        line-height: 1.2;
                        font-size: 10px;
                        align-items: baseline;
                    }
                    .detail-row .label {
                        width: 100px;
                        font-weight: 600;
                        color: #4a4a4a;
                        flex-shrink: 0;
                    }
                    .amount-text {
                        font-style: italic;
                        border: 1px dashed #a2d9ab;
                        padding: 6px 10px;
                        margin-top: 15px;
                        margin-bottom: 15px;
                        background-color: #eafbea;
                        font-size: 12px;
                        font-weight: 600;
                        text-align: center;
                        color: #28a745;
                        border-radius: 4px;
                        box-shadow: none;
                    }
                    .section-label {
                        font-weight: 700;
                        margin-top: 15px;
                        margin-bottom: 8px;
                        border-bottom: 1px solid #dee2e6;
                        padding-bottom: 5px;
                        color: #34495e;
                        font-size: 11px;
                        text-transform: uppercase;
                        letter-spacing: 0.2px;
                    }
                    .rincian-table {
                        width: 100%;
                        border-collapse: collapse;
                        margin-top: 10px;
                        margin-bottom: 15px;
                        border-radius: 4px;
                        overflow: hidden;
                        border: 1px solid #e0e0e0;
                    }
                    .rincian-table th, .rincian-table td {
                        border: 1px solid #e0e0e0;
                        padding: 5px 8px;
                        text-align: left;
                        font-size: 9px;
                    }
                    .rincian-table th {
                        background-color: #f2f2f2;
                        font-weight: 600;
                        color: #555;
                        text-transform: uppercase;
                        font-size: 9px;
                    }
                    tfoot td {
                        background-color: #e9ecef;
                        font-weight: 700;
                        color: #2c3e50;
                        border-top: 2px solid #ced4da;
                        font-size: 10px;
                    }
                    .rincian-table td:last-child,
                    .rincian-table th:last-child {
                        text-align: right;
                    }
                    .rincian-table td:nth-child(2),
                    .rincian-table th:nth-child(2),
                    .rincian-table td:nth-child(3),
                    .rincian-table th:nth-child(3) {
                        text-align: center;
                    }
                    .date-location {
                        text-align: right;
                        margin-top: 20px;
                        margin-bottom: 15px;
                        font-size: 10px;
                        font-weight: 600;
                        color: #555;
                        padding-right: 0px;
                    }
                    .signatures {
                        display: flex;
                        justify-content: space-around;
                        margin-top: 30px;
                        text-align: center;
                        align-items: flex-end;
                        font-size: 10px;
                    }
                    .signature-box {
                        width: 48%;
                        padding: 2px;
                        display: flex;
                        flex-direction: column;
                        justify-content: flex-end;
                        min-height: 70px;
                    }
                    .signature-box p {
                        margin-top: auto;
                        margin-bottom: 3px;
                        border-bottom: 1px solid #444;
                        padding-bottom: 3px;
                        display: inline-block;
                        min-width: 100px;
                        font-weight: 700;
                        color: #333;
                        font-size: 10px;
                        line-height: 1.2;
                    }
                    .signature-box .role {
                        font-size: 9px;
                        color: #666;
                        font-weight: 500;
                        text-transform: uppercase;
                        letter-spacing: 0.1px;
                        margin-bottom: 0;
                    }

                    /* Media query for printing */
                    @media print {
                        body {
                            margin: 0;
                            padding: 0;
                            background-color: #fff;
                            font-size: 8pt;
                        }
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
                        .kwitansi-print-container::before {
                            display: none;
                        }

                        .kwitansi-print-container h1 { font-size: 16pt; margin-top: 0; margin-bottom: 5pt; }
                        .kwitansi-print-container h2 { font-size: 10pt; margin-bottom: 10pt; padding-bottom: 3pt; }
                        .kwitansi-print-container h2::after { display: none; }

                        .kwitansi-print-container .info-header { font-size: 8pt; margin-bottom: 8pt; padding-bottom: 4pt; }
                        .kwitansi-print-container .detail-row { font-size: 8pt; margin-bottom: 3pt; line-height: 1.1; }
                        .kwitansi-print-container .detail-row .label { width: 80px; }
                        .kwitansi-print-container .amount-text { font-size: 10pt; padding: 4pt 8pt; margin-top: 10pt; margin-bottom: 10pt; }

                        .kwitansi-print-container .section-label { font-size: 9pt; margin-top: 10pt; margin-bottom: 5pt; padding-bottom: 3pt; }

                        .kwitansi-print-container .rincian-table { margin-top: 5pt; margin-bottom: 10pt; }
                        .kwitansi-print-container .rincian-table th, .kwitansi-print-container .rincian-table td {
                            padding: 3pt 5pt;
                            font-size: 7.5pt;
                        }
                        .kwitansi-print-container tfoot td { font-size: 8pt; }

                        .kwitansi-print-container .date-location { font-size: 8pt; margin-top: 15pt; margin-bottom: 10pt; }

                        .kwitansi-print-container .signatures { margin-top: 20pt; }
                        .kwitansi-print-container .signature-box { min-height: 60px; }
                        .kwitansi-print-container .signature-box p { font-size: 8pt; margin-bottom: 2pt; padding-bottom: 2pt; min-width: 90px; }
                        .kwitansi-print-container .signature-box .role { font-size: 7pt; }

                        @page {
                            size: 21.59cm 16.51cm; /* Half F4: 8.5 x 6.5 inches */
                            margin: 0.5cm; /* Minimal margins for the page itself */
                        }
                    }
                </style>
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
                   
