/**
 * ============================================================================
 * BIMBINGAN PROGRAM TUNTAS - LAPISAN API SUPABASE (V7)
 * Pengarang: 0.1% Elite Senior Software Architect
 * Keterangan: Menguruskan semua komunikasi data (CRUD) dengan Supabase.
 * ============================================================================
 */

const supabase = window.supabaseClient;

const API = {
    /**
     * Mencari maklumat sekolah dari jadual 'smpid_sekolah_data'
     * @param {string} carian - Kod atau Nama Sekolah
     * @returns {Promise<Object>} Status dan senarai padanan
     */
    cariSenaraiSekolah: async function(carian) {
        try {
            if (!carian || carian.length < 2) return { status: 'success', data: [] };

            const kataKunci = `%${carian.toUpperCase()}%`;
            
            const { data, error } = await supabase
                .from('smpid_sekolah_data')
                .select('kod_sekolah, nama_sekolah')
                .or(`kod_sekolah.ilike.${kataKunci},nama_sekolah.ilike.${kataKunci}`)
                .limit(15);

            if (error) throw error;

            return { status: 'success', data: data || [] };
        } catch (error) {
            console.error('Ralat API cariSenaraiSekolah:', error);
            return { status: 'error', message: 'Gagal mencari data sekolah dari pangkalan data.' };
        }
    },

    /**
     * Menyemak dan menarik rekod bimbingan terdahulu (jika wujud)
     * @param {string} kodSekolah - Kod sekolah yang tepat
     * @returns {Promise<Object>} Status dan rekod sekolah (jika ada)
     */
    semakRekodTerdahulu: async function(kodSekolah) {
        try {
            if (!kodSekolah) return { status: 'error', message: 'Kod sekolah tidak sah.' };

            const { data, error } = await supabase
                .from('tuntas_bimbingan')
                .select('*')
                .eq('kod_sekolah', kodSekolah.toUpperCase())
                .maybeSingle(); // maybeSingle mengelakkan ralat jika tiada rekod (mengembalikan null)

            if (error) throw error;

            if (data) {
                return { status: 'success', isExisting: true, data: data };
            } else {
                return { status: 'success', isExisting: false, data: null };
            }
        } catch (error) {
            console.error('Ralat API semakRekodTerdahulu:', error);
            return { status: 'error', message: 'Gagal menyemak rekod terdahulu: ' + error.message };
        }
    },

    /**
     * Menyimpan data borang ke dalam pangkalan data.
     * Menggunakan operasi UPSERT (Update jika wujud kod_sekolah, Insert jika baharu)
     * @param {Object} payloadData - Objek data lengkap borang
     * @returns {Promise<Object>} Status operasi penyimpan
     */
    simpanBorangBimbingan: async function(payloadData) {
        try {
            // Membina objek untuk disimpan selaras dengan skema SQL
            const simpanan = {
                kod_sekolah: payloadData.kodSekolah.toUpperCase(),
                nama_sekolah: payloadData.namaSekolah.toUpperCase(),
                // Rumusan tidak dihantar dari borang utama, jadi tidak ditindih jika sudah ada.
                // Operasi upsert akan mengekalkan lajur yang tidak dinyatakan jika kita hanya mengemas kini.
            };

            // Memasukkan skor item1 hingga item47 secara dinamik
            for (let i = 1; i <= 47; i++) {
                let namaItem = 'item' + i;
                simpanan[namaItem] = parseInt(payloadData[namaItem], 10) || 0;
            }

            // Laksanakan fungsi UPSERT dengan kod_sekolah sebagai kunci unik
            const { error } = await supabase
                .from('tuntas_bimbingan')
                .upsert(simpanan, { onConflict: 'kod_sekolah' });

            if (error) throw error;

            return { 
                status: 'success', 
                message: `Rekod bimbingan untuk ${simpanan.kod_sekolah} berjaya disimpan.` 
            };
        } catch (error) {
            console.error('Ralat API simpanBorangBimbingan:', error);
            return { status: 'error', message: 'Ralat penyimpan data: ' + error.message };
        }
    },

    /**
     * Mendapatkan data pelaporan berdasarkan Kod Sekolah
     * @param {string} kodSekolah - Kod sekolah untuk carian spesifik
     * @returns {Promise<Object>} Status dan data untuk penjanaan laporan/carta
     */
    dapatkanDataPelaporan: async function(kodSekolah) {
        try {
            const { data, error } = await supabase
                .from('tuntas_bimbingan')
                .select('*')
                .eq('kod_sekolah', kodSekolah.toUpperCase())
                .single();

            if (error) throw error;

            // Format data mengikut kehendak antaramuka
            const formatLaporan = {
                timestamp: data.updated_at || data.created_at,
                kodSekolah: data.kod_sekolah,
                namaSekolah: data.nama_sekolah,
                rumusan: data.rumusan || '',
                scores: {}
            };

            for (let i = 1; i <= 47; i++) {
                formatLaporan.scores['item' + i] = data['item' + i] || 0;
            }

            return { status: 'success', data: formatLaporan };
        } catch (error) {
            console.error('Ralat API dapatkanDataPelaporan:', error);
            return { status: 'error', message: 'Tiada rekod bimbingan dijumpai untuk sekolah ini.' };
        }
    },

    /**
     * Fungsi khas untuk Admin mengemas kini ruangan 'Rumusan'
     * Mempunyai lapisan pengesahan (Auth check) berasaskan JS selaras arahan
     * @param {string} kodSekolah - Kod sekolah sasaran
     * @param {string} rumusanTeks - Nota rumusan dari admin
     * @param {string} emailInput - Emel log masuk
     * @param {string} passwordInput - Kata laluan log masuk
     * @returns {Promise<Object>} Status kemas kini
     */
    kemaskiniRumusanAdmin: async function(kodSekolah, rumusanTeks, emailInput, passwordInput) {
        try {
            // Pengesahan Kredensial (Semakan JS - RLS Terbuka)
            if (emailInput !== window.ADMIN_EMAIL || passwordInput !== window.ADMIN_PASSWORD_FALLBACK) {
                return { status: 'error', message: 'Akses Ditolak: E-mel atau Kata Laluan tidak sah.' };
            }

            // Kemas kini hanya lajur 'rumusan' dan tarikh ubah suai akan terpicu secara automatik oleh trigger DB
            const { error } = await supabase
                .from('tuntas_bimbingan')
                .update({ rumusan: rumusanTeks })
                .eq('kod_sekolah', kodSekolah.toUpperCase());

            if (error) throw error;

            return { 
                status: 'success', 
                message: `Rumusan untuk ${kodSekolah.toUpperCase()} berjaya dikemas kini.` 
            };
        } catch (error) {
            console.error('Ralat API kemaskiniRumusanAdmin:', error);
            return { status: 'error', message: 'Gagal menyimpan rumusan: ' + error.message };
        }
    }
};

// Mendedahkan API ke skop global untuk dipanggil oleh modul app.js
window.API = API;

console.log('Sistem Tuntas: Modul API Pangkalan Data berjaya dimuatkan.');