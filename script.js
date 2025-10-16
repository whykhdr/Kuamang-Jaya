// Konfigurasi Printer (GANTI SESUAI PRINTER ANDA!)
const PRINTER_SERVICE_UUID = '000018f0-0000-1000-8000-00805f9b34fb'; 
const PRINTER_CHARACTERISTIC_UUID = '00002af1-0000-1000-8000-00805f9b34fb'; 

async function requestBluetoothDevice() {
    if (!navigator.bluetooth) {
        alert('Browser Anda tidak mendukung Web Bluetooth. Gunakan Chrome di Android.');
        return;
    }

    try {
        // 1. Ambil Data dari Form
        const data = {
            nama: document.getElementById('pelanggan').value,
            nomor: document.getElementById('no_samb').value,
            pemakaian: document.getElementById('pemakaian').value,
            total: document.getElementById('total').value,
            tanggal: new Date().toLocaleString('id-ID'),
        };

        // 2. Minta Izin & Hubungkan ke Printer
        console.log('Meminta izin perangkat Bluetooth...');
        const device = await navigator.bluetooth.requestDevice({
            filters: [{ services: [PRINTER_SERVICE_UUID] }],
            optionalServices: [PRINTER_SERVICE_UUID]
        });

        const server = await device.gatt.connect();
        const service = await server.getPrimaryService(PRINTER_SERVICE_UUID);
        const characteristic = await service.getCharacteristic(PRINTER_CHARACTERISTIC_UUID);

        // 3. Buat String ESC/POS
        const receiptText = generateEscposReceipt(data);
        const dataToPrint = new TextEncoder().encode(receiptText);

        // 4. Kirim data cetak
        await characteristic.writeValue(dataToPrint);
        alert('Kuitansi berhasil dicetak!');
        server.disconnect(); // Putuskan koneksi setelah selesai
        
    } catch (error) {
        console.error('Proses Pencetakan Gagal:', error);
        alert('ERROR CETAK: Gagal terhubung atau mencetak. Cek koneksi printer dan coba lagi.');
    }
}


function generateEscposReceipt(data) {
    // --- FUNGSI UNTUK MEMBUAT STRING ESC/POS (Kode dari tutorial sebelumnya) ---

    // Kunci Kode ESC/POS
    const ALIGN_CENTER = '\x1B\x61\x01';
    const ALIGN_LEFT = '\x1B\x61\x00';
    const BOLD_ON = '\x1B\x45\x01';
    const BOLD_OFF = '\x1B\x45\x00';
    const CUT = '\x1D\x56\x00';
    const LF = '\n';
    
    let receipt = '';

    // HEADER
    receipt += ALIGN_CENTER + BOLD_ON + 'PAMSIMAS DESA SUKA MAJU' + LF;
    receipt += 'KWITANSI PEMBAYARAN' + LF;
    receipt += BOLD_OFF + '--------------------------------' + LF;

    // INFO PELANGGAN
    receipt += ALIGN_LEFT;
    receipt += 'Tgl/Waktu: ' + data.tanggal + LF;
    receipt += 'Pelanggan: ' + data.nama + LF;
    receipt += 'No. Samb.: ' + data.nomor + LF;
    receipt += '--------------------------------' + LF;

    // DETAIL
    receipt += 'Pemakaian (M3):'.padEnd(17, ' ') + data.pemakaian.padStart(15, ' ') + LF;
    receipt += '--------------------------------' + LF;

    // TOTAL (BESAR)
    receipt += BOLD_ON + 'TOTAL BAYAR:'.padEnd(17, ' ') + ('Rp ' + data.total).padStart(15, ' ') + LF;
    receipt += BOLD_OFF + '--------------------------------' + LF;

    // FOOTER
    receipt += ALIGN_CENTER + 'TERIMA KASIH' + LF + LF + LF;
    
    receipt += CUT;
    return receipt;
}
