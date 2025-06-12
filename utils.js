// utils.js

// Fungsi untuk mengonversi angka menjadi teks terbilang dalam bahasa Indonesia
function terbilang(number) {
    if (typeof number !== 'number' || isNaN(number)) {
        console.warn("terbilang: Input bukan angka atau NaN:", number);
        return "Bukan Angka";
    }

    const units = ['', 'satu', 'dua', 'tiga', 'empat', 'lima', 'enam', 'tujuh', 'delapan', 'sembilan'];
    const teens = ['sepuluh', 'sebelas', 'dua belas', 'tiga belas', 'empat belas', 'lima belas', 'enam belas', 'tujuh belas', 'delapan belas', 'sembilan belas'];
    const tens = ['', '', 'dua puluh', 'tiga puluh', 'empat puluh', 'lima puluh', 'enam puluh', 'tujuh puluh', 'delapan puluh', 'sembilan puluh'];
    const thousands = ['', 'ribu', 'juta', 'miliar', 'triliun'];

    function convertGroup(n) {
        let text = '';
        const hundred = Math.floor(n / 100);
        const remainder = n % 100;

        if (hundred === 1) {
            text += 'seratus';
        } else if (hundred > 0) {
            text += units[hundred] + ' ratus';
        }

        if (remainder > 0) {
            if (text !== '') text += ' ';
            if (remainder < 10) {
                text += units[remainder];
            } else if (remainder >= 10 && remainder < 20) {
                text += teens[remainder - 10];
            } else {
                text += tens[Math.floor(remainder / 10)];
                if (remainder % 10 > 0) {
                    text += ' ' + units[remainder % 10];
                }
            }
        }
        return text;
    }

    if (number === 0) return 'Nol';

    let result = '';
    let numStr = String(Math.floor(number));
    let groups = [];

    while (numStr.length > 0) {
        if (numStr.length <= 3) {
            groups.unshift(numStr);
            numStr = '';
        } else {
            groups.unshift(numStr.slice(-3));
            numStr = numStr.slice(0, -3);
        }
    }

    for (let i = 0; i < groups.length; i++) {
        const groupNum = parseInt(groups[i], 10);
        if (groupNum === 0) continue;

        let groupText = convertGroup(groupNum);
        if (groupText !== '') {
            if (i === groups.length - 2 && groupNum === 1 && groups.length > 1) {
                groupText = "seribu";
            } else {
                groupText += ' ' + thousands[groups.length - 1 - i];
            }
        }

        if (result !== '') result += ' ';
        result += groupText;
    }

    result = result.trim();
    if (result.length > 0) {
        result = result.charAt(0).toUpperCase() + result.slice(1);
    }

    return result + " Rupiah";
}

// Fungsi untuk memformat mata uang (misal: 500000 -> 500.000)
function formatCurrency(number) {
    const num = parseFloat(number);
    if (isNaN(num)) {
        console.warn("formatCurrency: Input bukan angka:", number);
        return "NaN";
    }
    return new Intl.NumberFormat('id-ID', { minimumFractionDigits: 0, maximumFractionDigits: 0 }).format(num);
}

// Fungsi untuk memformat tanggal
function formatDate(dateString) {
    const options = { day: 'numeric', month: 'long', year: 'numeric' };
    return new Date(dateString).toLocaleDateString('id-ID', options);
}
