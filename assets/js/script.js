// Fungsi ini akan dipanggil saat pengguna mengetik di kotak pencarian
function filterTable() {
    // 1. Deklarasi Variabel
    var input, filter, table, tr, td, i, txtValue;
    
    // Ambil elemen input pencarian (asumsikan ID-nya 'searchInput')
    input = document.getElementById("searchInput");
    // Konversi teks input ke huruf besar untuk pencarian non-sensitif huruf
    filter = input.value.toUpperCase();
    
    // Ambil tabel yang ingin difilter (asumsikan ID-nya 'apbdesTable')
    table = document.getElementById("apbdesTable");
    // Ambil semua baris (row) dalam bagian body tabel (tbody)
    tr = table.getElementsByTagName("tr");

    // 2. Iterasi Melalui Semua Baris Tabel
    for (i = 0; i < tr.length; i++) {
        // Kita akan mencari di kolom kedua (indeks 1), yaitu Uraian Kegiatan/Rekening
        // Pastikan baris tersebut memiliki data (bukan baris header atau footer total)
        td = tr[i].getElementsByTagName("td")[1]; 
        
        if (td) {
            // Ambil teks dari sel Uraian
            txtValue = td.textContent || td.innerText;
            
            // 3. Bandingkan dan Tampilkan/Sembunyikan Baris
            if (txtValue.toUpperCase().indexOf(filter) > -1) {
                // Jika teks input ditemukan dalam Uraian, tampilkan baris
                tr[i].style.display = "";
            } else {
                // Jika tidak ditemukan, sembunyikan baris
                tr[i].style.display = "none";
            }
        }
        
        // Tambahan: Pastikan baris header-group tetap terlihat agar struktur Bidang tetap jelas
        if (tr[i].classList.contains('header-group') || tr[i].classList.contains('sub-group')) {
            tr[i].style.display = "";
        }
    }
}
