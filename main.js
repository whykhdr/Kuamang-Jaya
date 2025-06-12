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
            </body>
            </html>
        `;
    }

    // Add event listener for print button
    printKwitansiBtn.addEventListener('click', function() {
        const kwitansiHtml = generateKwitansiHtml();
        const newWindow = window.open('', '_blank');
        newWindow.document.write(kwitansiHtml);
        newWindow.document.close();
        newWindow.print();
    });
});
