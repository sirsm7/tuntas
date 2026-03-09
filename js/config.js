/**
 * ============================================================================
 * BIMBINGAN PROGRAM TUNTAS - KONFIGURASI SUPABASE
 * Pengarang: 0.1% Elite Senior Software Architect
 * Keterangan: Tetapan pangkalan data dan pengesahan utama sistem.
 * ============================================================================
 */

// 1. TETAPAN KREDENSIAL SUPABASE (SILA TUKAR KEPADA KREDENSIAL SEBENAR)
const SUPABASE_URL = 'https://app.tech4ag.my';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJyb2xlIjoiYW5vbiIsImlzcyI6InN1cGFiYXNlIiwiaWF0IjoxNzYzMzczNjQ1LCJleHAiOjIwNzg3MzM2NDV9.vZOedqJzUn01PjwfaQp7VvRzSm4aRMr21QblPDK8AoY';

// 2. TETAPAN PENGESAHAN ADMIN
const ADMIN_EMAIL = 'hairoldinrahim@moe.gov.my';
const ADMIN_PASSWORD_FALLBACK = 'ppdag@12345';

// 3. INISIALISASI PELANGGAN SUPABASE
// Menggunakan tatasusunan global 'supabase' yang dimuat turun dari CDN di index.html
if (typeof supabase === 'undefined') {
    console.error('Ralat Kritikal: Pustaka Supabase JS tidak dijumpai. Pastikan CDN telah dimuatkan di index.html');
}

const supabaseClient = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// Memastikan klien boleh diakses oleh fail-fail JS yang lain
window.supabaseClient = supabaseClient;
window.ADMIN_EMAIL = ADMIN_EMAIL;
window.ADMIN_PASSWORD_FALLBACK = ADMIN_PASSWORD_FALLBACK;

console.log('Sistem Tuntas: Konfigurasi Supabase berjaya diinisialisasi.');