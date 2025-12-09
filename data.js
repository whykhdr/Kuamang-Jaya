const dataAPBDus = {
    // BAGIAN 1: RINGKASAN ATAS
    // Masukkan angka murni tanpa titik/koma (contoh: 1000000)
    ringkasan: {
        pendapatan: 1850000000,
        belanja: 1900000000,
        pembiayaan: 50000000 // SiLPA
    },

    // BAGIAN 2: TABEL PENDAPATAN
    sumberPendapatan: [
        { nama: "Dana Desa (DD) - APBN", jumlah: 900000000 },
        { nama: "Alokasi Dana Desa (ADD) - APBD", jumlah: 500000000 },
        { nama: "Bagi Hasil Pajak & Retribusi", jumlah: 50000000 },
        { nama: "Pendapatan Asli Desa (PADes)", jumlah: 350000000 },
        { nama: "Bantuan Keuangan Provinsi", jumlah: 50000000 },
    ],

    // BAGIAN 3: RINCIAN BELANJA (ACCORDION)
    // Anda bisa menambah baris baru di dalam kurung kurawal {}
    belanja: [
        {
            bidang: "1. Bidang Penyelenggaraan Pemerintahan",
            total: 600000000,
            rincian: [
                { kegiatan: "Siltap Kades & Perangkat", biaya: 350000000 },
                { kegiatan: "Tunjangan & Operasional BPD", biaya: 50000000 },
                { kegiatan: "Operasional Kantor Desa", biaya: 100000000 },
                { kegiatan: "Operasional RT/RW", biaya: 100000000 }
            ]
        },
        {
            bidang: "2. Bidang Pelaksanaan Pembangunan",
            total: 800000000,
            rincian: [
                { kegiatan: "Pembangunan Jalan Usaha Tani", biaya: 250000000 },
                { kegiatan: "Rehabilitasi Drainase", biaya: 150000000 },
                { kegiatan: "Penyelenggaraan PAUD", biaya: 50000000 },
                { kegiatan: "Stunting & Posyandu", biaya: 150000000 },
                { kegiatan: "Lampu Jalan (PJU)", biaya: 200000000 }
            ]
        },
        {
            bidang: "3. Bidang Pembinaan Kemasyarakatan",
            total: 150000000,
            rincian: [
                { kegiatan: "Pembinaan PKK & Karang Taruna", biaya: 50000000 },
                { kegiatan: "Peringatan Hari Besar", biaya: 40000000 },
                { kegiatan: "Linmas / Keamanan", biaya: 60000000 }
            ]
        },
        {
            bidang: "4. Bidang Pemberdayaan Masyarakat",
            total: 200000000,
            rincian: [
                { kegiatan: "Ketahanan Pangan (Bibit/Ternak)", biaya: 150000000 },
                { kegiatan: "Pelatihan Siskeudes", biaya: 25000000 },
                { kegiatan: "Pelatihan Kelompok Tani", biaya: 25000000 }
            ]
        },
        {
            bidang: "5. Bidang Penanggulangan Bencana",
            total: 150000000,
            rincian: [
                { kegiatan: "BLT Dana Desa", biaya: 100000000 },
                { kegiatan: "Dana Darurat Bencana", biaya: 50000000 }
            ]
        }
    ]
};
