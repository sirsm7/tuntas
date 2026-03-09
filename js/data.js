/**
 * ============================================================================
 * BIMBINGAN PROGRAM TUNTAS - DATA INDUK SOALAN (V7)
 * Pengarang: 0.1% Elite Senior Software Architect
 * Keterangan: Konfigurasi 11 Komponen dan 47 Item Bimbingan.
 * ============================================================================
 */

const strukturBimbingan = [
    { 
        id: "A", 
        tajuk: "A. PENGURUSAN KURIKULUM", 
        wajib: true, 
        items: [
            { id: "item1", teks: "1. Adakah unit kurikulum sekolah menyediakan analisa SWOT / analisis lain yang bersesuaian" },
            { id: "item2", teks: "2. Adakah unit kurikulum menyediakan isu-isu utama dalam kurikulum yang perlu diambil tindakan" },
            { id: "item3", teks: "3. Adakah setiap isu yang ingin diselesaikan mempunyai TOV dan KPI yang ditetapkan secara relevan" },
            { id: "item4", teks: "4. Adakah unit kurikulum menyebarluaskan KPI yang ingin dicapai kepada semua panitia" }
        ]
    },
    { 
        id: "B", 
        tajuk: "B. PENGURUSAN STANDARD 4", 
        wajib: true, 
        items: [
            { id: "item5", teks: "5. Adakah Jadual pencerapan guru dalam pdp telah dibina sekurang-kurangnya 2 kali setahun" },
            { id: "item6", teks: "6. Adakah borang pencerapan kendiri guru telah dibuat dan dikumpulkan" },
            { id: "item7", teks: "7. Adakah Unit kurikukum membuat analisis terhadap skor kendiri guru untuk melihat kekuatan dan kelemahan" },
            { id: "item8", teks: "8. Adakah hasil pencerapan Pdpc setiap guru diberikan maklum balas dan bimbingan" },
            { id: "item9", teks: "9. Adakah intervensi dirancang hasil dapatan daripada skor kendiri, pencerapan pertama dan pencerapan kedua." }
        ]
    },
    { 
        id: "C", 
        tajuk: "C. PENGURUSAN KUALITI PEMBELAJARAN DAN PENGAJARAN", 
        wajib: true, 
        items: [
            { id: "item10", teks: "10. Adakah panitia membina perangcangan berkaitan dengan Pembangunan profesionalisme berkaitan mata pelajaran seperti PLC, Dialog Prestasi dan lain-lain" },
            { id: "item11", teks: "11. Adakah panitia membina pelan operasi bagi melaksanakan intervensi ke arah peningkatan kemenjadian murid berkaitan dengan mata pelajaran" },
            { id: "item12", teks: "12. Adakah panitia membina perancangan bagi memanfaatkan bantuan per kapita mata pelajaran" },
            { id: "item13", teks: "13. Adakah unit kurikulum merancang jadual peperiksaan dan pentaksiran" }
        ]
    },
    { 
        id: "D", 
        tajuk: "D. PENGURUSAN KOKURIKULUM", 
        wajib: true, 
        items: [
            { id: "item14", teks: "14. Adakah Unit Kokurikulum menyediakan anlisa SWOT/ analisis lain yang bersesuaian" },
            { id: "item15", teks: "15. Adakah Unit Kokurikulum menetapkan isu-isu strategik yang perlu diselesaikan" },
            { id: "item16", teks: "16. Adakah setiap isu strategik yang dibina mempunyai TOV dan KPI yang sesuai" },
            { id: "item17", teks: "17. Adakah setiap isu yang dibina telah disebarluaskan kepada semua guru" }
        ]
    },
    { 
        id: "E", 
        tajuk: "E. PENGURUSAN KELAB DAN PERSATUAN", 
        wajib: true, 
        items: [
            { id: "item18", teks: "18. Adakah semua kelab/persatuan yang wujud di sekolah mempunyai perancangan tahun semasa" },
            { id: "item19", teks: "19. Adakah semua unit membina KPI penglibatan dan pencapaian murid ke peringkat daerah, negeri, kebangsaan atau antarabangsa" },
            { id: "item20", teks: "20. Adakah intervensi yang dirancang mempunyai aktiviti penglibatan murid ke peringkat daerah, negeri, kebangsaan atau antarabangsa" }
        ]
    },
    { 
        id: "F", 
        tajuk: "F. PENGURUSAN BADAN BERUNIFORM", 
        wajib: true, 
        items: [
            { id: "item21", teks: "21. Adakah semua Badan Beruniform yang wujud di sekolah mempunyai perancangan tahun semasa" },
            { id: "item22", teks: "22. Adakah semua unit membina KPI penglibatan dan pencapaian murid ke peringkat daerah, negeri, kebangsaan atau antarabangsa" },
            { id: "item23", teks: "23. Adakah intervensi yang dirancang mempunyai aktiviti penglibatan murid ke peringkat daerah, negeri, kebangsaan atau antarabangsa" },
            { id: "item24", teks: "24. Adakah buku pelaporan setiap unit disediakan dengan mempunyai maklumat seperti: pelaporan pelaksanaan aktiviti, rekod pencapaian murid, Bahagian analisis data dan maklumat kehadiran, pencapaian dan peglibatan murid diperingkat daerah, negeri, kebangsaan dan antarabangsa" }
        ]
    },
    { 
        id: "G", 
        tajuk: "G. PENGURUSAN SUKAN/PERMAINAN", 
        wajib: true, 
        items: [
            { id: "item25", teks: "25. Adakah semua unit sukan/permainan yang wujud di sekolah mempunyai perancangan tahun semasa" },
            { id: "item26", teks: "26. Adakah semua unit membina KPI penglibatan dan pencapaian murid ke peringkat daerah, negeri, kebangsaan atau antarabangsa" },
            { id: "item27", teks: "27. Adakah intervensi yang dirancang mempunyai aktiviti penglibatan murid ke peringkat daerah, negeri, kebangsaan atau antarabangsa" },
            { id: "item28", teks: "28. Adakah buku pelaporan setiap unit disediakan dengan mempunyai maklumat seperti: pelaporan pelaksanaan aktiviti, rekod pencapaian murid, Bahagian analisis data dan maklumat kehadiran, pencapaian dan peglibatan murid diperingkat daerah, negeri, kebangsaan dan antarabangsa" }
        ]
    },
    { 
        id: "H", 
        tajuk: "H. PENGURUSAN HEM", 
        wajib: true, 
        items: [
            { id: "item29", teks: "29. Adakah Unit Disiplin membina perancangan pendidikan disiplin berpandukan analisis data disiplin" },
            { id: "item30", teks: "30. Adakah Unit Keselamatan membina peerancangan pencegahan dan kesedaran keselamatan" },
            { id: "item31", teks: "31. Adakah Unit Bantuan Kebajikan Murid merekodkan maklumat murid yang menerima bantuan-bantuan yang ada di sekolah" },
            { id: "item32", teks: "32. Adakah Unit Bimbingan dan Kaunseling merancang program bimbingan dan kaunseling" },
            { id: "item33", teks: "33. Adakah Unit Bimbingan dan Kaunseling merancang pentaksiran psikometrik" },
            { id: "item34", teks: "34. Adakah hasil pentaksiran psikometrik dianalisis dan digunapakai untuk membina intervensi kurikulum dan kokurikulum" }
        ]
    },
    { 
        id: "I", 
        tajuk: "I. SK@S AWAL SESI PERSEKOLAHAN", 
        wajib: false, 
        items: [
            { id: "item35", teks: "35. Adakah Jawatankuasa SKPM telah dibentuk dan mengadakan mesyuarat J/K Induk" },
            { id: "item36", teks: "36. Adakah Pasukan Pelaksana Standard (PPS) telah dilantik" },
            { id: "item37", teks: "37. Adakah penataran tentang SKPM telah diberikan kepada semua PPS agar mereka memahami proses Pengisian Skor Kendiri (PKS)" }
        ]
    },
    { 
        id: "J", 
        tajuk: "J. SK@S PERTENGAHAN SESI PERSEKOLAHAN", 
        wajib: false, 
        items: [
            { id: "item38", teks: "38. Adakah PPS telah mengisi Skor Kendiri kali pertama secara berintegriti" },
            { id: "item39", teks: "39. Adakah Skor Kendiri oleh PPS selari dengan eviden" },
            { id: "item40", teks: "40. Adakah PPS telah menyediakan eviden-eviden yang relevan dan menyimpannya secara terancang agar mudah dirujuk dan diakses" },
            { id: "item41", teks: "41. Adakah J/K Induk SKPM megadakan mesyuarat untuk menganalisis dapatan Skor Kendiri oleh PPS" }
        ]
    },
    { 
        id: "K", 
        tajuk: "K. SK@S AKHIR SESI PERSEKOLAHAN", 
        wajib: false, 
        items: [
            { id: "item42", teks: "42. Adakah PPS telah mengisi Skor Kendiri kali kedua secara berintegriti" },
            { id: "item43", teks: "43. Adakah Skor Kendiri oleh PPS selari dengan eviden dan membuat penambahbaikan hasil daripada dapatan analisis pengisian skor kali pertama" },
            { id: "item44", teks: "44. Adakah PPS telah menyediakan eviden-eviden penambahbaikan dan menyimpannya secara terancang agar mudah dirujuk dan diakses" },
            { id: "item45", teks: "45. Adakah J/K Induk SKPM megadakan mesyuarat untuk menganalisis dapatan Skor Kendiri oleh PPS kali ke 2" },
            { id: "item46", teks: "46. Sekolah Berjaya memaparkan bukti kejayaan, pencapaian dan aktiviti secara sistematik dan jelas" },
            { id: "item47", teks: "47. Sekolah menghasilkan inovasi yang memberi impak kepada kemenjadian murid" }
        ]
    }
];

// Mendedahkan pembolehubah ke skop global untuk dipanggil oleh modul lain
window.strukturBimbingan = strukturBimbingan;

console.log('Sistem Tuntas: Modul Data Induk berjaya dimuatkan.');