/**
 * ============================================================================
 * BIMBINGAN PROGRAM TUNTAS - LOGIK APLIKASI (UI & EVENTS) V8 (Eksport PDF)
 * Pengarang: 0.1% Elite Senior Software Architect
 * Keterangan: Mengawal manipulasi DOM, navigasi, validasi, carta, sesi admin,
 * dan penjanaan pelaporan PDF berbilang muka surat.
 * ============================================================================
 */

// Konfigurasi SweetAlert2 Toast Global
const SwalToast = Swal.mixin({
    toast: true,
    position: 'top-end',
    showConfirmButton: false,
    timer: 3000,
    timerProgressBar: true,
    didOpen: (toast) => {
        toast.addEventListener('mouseenter', Swal.stopTimer);
        toast.addEventListener('mouseleave', Swal.resumeTimer);
    }
});

function showToast(message, type = 'success') {
    SwalToast.fire({
        icon: type === 'success' ? 'success' : 'error',
        title: message
    });
}

// Pembolehubah Global (State)
let currentStep = 0;
// Merujuk terus kepada objek global yang dijana oleh data.js.
const totalSteps = window.strukturBimbingan.length + 1; // 1 Langkah Info + 11 Langkah Komponen
let bimbinganChart = null;
let laporanSemasaData = null;
let lastFetchedKod = '';
let debounceTimer;
let tindakanSelepasLogin = null; // Menyimpan konteks tindakan jika modal admin dipanggil

// Inisialisasi Aplikasi apabila DOM sedia
document.addEventListener('DOMContentLoaded', () => {
    janaBorangDinamik();
    janaNavigasiPantas();
    janaDropdownPenapisLaporan();
    kemaskiniUIIndicators();
    ikatEventListerSistem();
    kemaskiniUIAdmin(); // Semak sesi admin semasa muat semula
});

/**
 * ==========================================
 * PENGIKAT ACARA (EVENT LISTENERS BINDING)
 * ==========================================
 */
function ikatEventListerSistem() {
    // 1. Tab Switching
    document.getElementById('btn-tab-form').addEventListener('click', () => switchTab('form'));
    document.getElementById('btn-tab-report').addEventListener('click', () => switchTab('report'));

    // 2. Navigasi Borang (Next, Prev, Submit, Quick Nav)
    document.getElementById('btn-prev').addEventListener('click', () => navigateStep(-1));
    document.getElementById('btn-next').addEventListener('click', () => navigateStep(1));
    document.getElementById('btn-quick-save').addEventListener('click', (e) => handleFormSubmit(e, true));
    document.getElementById('bimbinganForm').addEventListener('submit', (e) => handleFormSubmit(e, false));
    
    const btnInfo = document.getElementById('nav-step-0');
    if (btnInfo) btnInfo.addEventListener('click', () => lompatKeLangkah(0));
    
    document.getElementById('bimbinganForm').addEventListener('change', kemaskiniStatusNavigasi);

    // 3. Carian Kod Sekolah (Borang) - Autocomplete
    const kodInput = document.getElementById('kodSekolah');
    kodInput.addEventListener('input', (e) => {
        e.target.value = e.target.value.toUpperCase();
        kawalCarianAutokomplet(e.target.value, 'kodSekolahSuggestions', pilihSekolahBorang);
    });
    
    kodInput.addEventListener('blur', () => {
        setTimeout(() => {
            document.getElementById('kodSekolahSuggestions').classList.add('hidden');
            semakDataTerdahuluBorang(kodInput.value);
        }, 200); 
    });

    // 4. Reset Borang
    document.getElementById('btn-reset-borang').addEventListener('click', resetBorangKeseluruhan);

    // 5. Laporan - Pilihan Sekolah & Eksport PDF
    document.getElementById('selectSekolahDinilai').addEventListener('change', (e) => {
        if(e.target.value) {
            laksanakanJanaanLaporan(e.target.value);
        } else {
            document.getElementById('reportContainer').classList.add('hidden');
            document.getElementById('emptyStateContainer').classList.remove('hidden');
            document.getElementById('btnExportPDF').classList.add('hidden');
        }
    });

    document.getElementById('filterKomponen').addEventListener('change', kemasKiniCarta);
    
    document.getElementById('btnExportPDF').addEventListener('click', janaDokumenPDF);

    // 6. Pengurusan Admin (Login, Logout, Kemas Kini, Padam)
    document.getElementById('btn-admin-auth-nav').addEventListener('click', kawalSesiAdmin);
    document.getElementById('btnTutupSilangAdmin').addEventListener('click', tutupModalAdmin);
    document.getElementById('btnBatalAdmin').addEventListener('click', tutupModalAdmin);
    document.getElementById('btnSahkanAdmin').addEventListener('click', prosesLogMasukAdmin);
    
    document.getElementById('btnRumusanAdmin').addEventListener('click', () => urusTindakanAdmin('kemaskini_rumusan'));
    document.getElementById('btnPadamRekodAdmin').addEventListener('click', () => urusTindakanAdmin('padam_rekod'));

    // PENGOPTIMUMAN: Auto Huruf Besar untuk kotak rumusan admin
    document.getElementById('rumusanTeks').addEventListener('input', (e) => {
        e.target.value = e.target.value.toUpperCase();
    });
}

/**
 * ==========================================
 * SISTEM AUTOKOMPLET (AUTOCOMPLETE DEBOUNCE)
 * ==========================================
 */
function kawalCarianAutokomplet(nilai, dropdownId, callbackPilihan) {
    clearTimeout(debounceTimer);
    const dropdown = document.getElementById(dropdownId);
    
    if (nilai.trim().length < 2) {
        dropdown.classList.add('hidden');
        dropdown.innerHTML = '';
        return;
    }

    debounceTimer = setTimeout(async () => {
        const respon = await window.API.cariSenaraiSekolah(nilai);
        dropdown.innerHTML = '';
        
        if (respon.status === 'success' && respon.data.length > 0) {
            respon.data.forEach(sek => {
                const li = document.createElement('li');
                li.className = 'px-4 py-2 hover:bg-blue-50 cursor-pointer border-b border-gray-100 text-sm font-semibold text-gray-700';
                li.innerHTML = `<span class="text-blue-600">${sek.kod_sekolah}</span> - ${sek.nama_sekolah}`;
                li.addEventListener('click', () => callbackPilihan(sek));
                dropdown.appendChild(li);
            });
            dropdown.classList.remove('hidden');
        } else {
            dropdown.classList.add('hidden');
        }
    }, 400); 
}

function pilihSekolahBorang(sekolah) {
    document.getElementById('kodSekolah').value = sekolah.kod_sekolah;
    document.getElementById('namaSekolah').value = sekolah.nama_sekolah;
    document.getElementById('kodSekolahSuggestions').classList.add('hidden');
    semakDataTerdahuluBorang(sekolah.kod_sekolah);
}

/**
 * ==========================================
 * LOGIK BORANG DINAMIK & NAVIGASI PANTAS
 * ==========================================
 */
function janaBorangDinamik() {
    const container = document.getElementById('dynamic-steps-container');
    container.innerHTML = '';

    window.strukturBimbingan.forEach((komponen, index) => {
        const stepNum = index + 1;
        const stepDiv = document.createElement('div');
        stepDiv.id = `step-${stepNum}`;
        stepDiv.className = 'step-container hidden';
        
        const badgeHtml = komponen.wajib 
            ? `<span class="bg-blue-600 text-white text-[10px] uppercase font-black px-2 py-0.5 rounded ml-3">Wajib</span>`
            : `<span class="bg-amber-100 text-amber-700 text-[10px] uppercase font-black px-2 py-0.5 rounded ml-3">Pilihan</span>`;

        let htmlContent = `
            <div class="mb-6"><h3 class="flex items-center text-xl font-bold text-gray-800 bg-gray-50 p-4 rounded-lg border-l-4 border-blue-600 shadow-sm">Komponen ${komponen.tajuk} ${badgeHtml}</h3></div>
            <div class="space-y-4">
        `;

        komponen.items.forEach(item => {
            htmlContent += `
                <div class="bg-white border border-gray-100 rounded-xl p-5 shadow-sm hover:border-blue-200 transition-all">
                    <p class="text-sm font-bold text-gray-700 mb-4 leading-relaxed">${item.teks}</p>
                    <div class="flex flex-wrap gap-4">
                        <label class="flex items-center p-2 rounded-lg border border-gray-200 cursor-pointer hover:bg-red-50 transition-colors">
                            <input type="radio" name="${item.id}" value="1" ${komponen.wajib ? 'required' : ''} class="w-5 h-5 text-red-600">
                            <span class="ml-2 text-xs font-black text-red-700">Skor 1</span>
                        </label>
                        <label class="flex items-center p-2 rounded-lg border border-gray-200 cursor-pointer hover:bg-orange-50 transition-colors">
                            <input type="radio" name="${item.id}" value="2" class="w-5 h-5 text-orange-500">
                            <span class="ml-2 text-xs font-black text-orange-700">Skor 2</span>
                        </label>
                        <label class="flex items-center p-2 rounded-lg border border-gray-200 cursor-pointer hover:bg-green-50 transition-colors">
                            <input type="radio" name="${item.id}" value="3" class="w-5 h-5 text-green-600">
                            <span class="ml-2 text-xs font-black text-green-700">Skor 3</span>
                        </label>
                    </div>
                </div>
            `;
        });
        
        htmlContent += `</div>`;
        stepDiv.innerHTML = htmlContent;
        container.appendChild(stepDiv);
    });
}

function janaNavigasiPantas() {
    const navContainer = document.getElementById('quick-nav');
    window.strukturBimbingan.forEach((komponen, index) => {
        const stepIdx = index + 1;
        const btn = document.createElement('button');
        btn.type = 'button';
        btn.id = `nav-step-${stepIdx}`;
        btn.className = 'px-3 py-2 border border-gray-300 rounded-md text-xs font-bold transition-all bg-white hover:bg-gray-50 text-gray-700';
        btn.innerText = komponen.id;
        btn.addEventListener('click', () => lompatKeLangkah(stepIdx));
        navContainer.appendChild(btn);
    });
}

/**
 * ==========================================
 * KAWALAN ALIRAN LANGKAH (STEP WORKFLOW)
 * ==========================================
 */
function lompatKeLangkah(n) {
    if (n > 0) {
        const kod = document.getElementById('kodSekolah').value.trim();
        const nama = document.getElementById('namaSekolah').value.trim();
        if (!kod || !nama) {
            showToast("Sila lengkapkan Kod dan Nama Sekolah terlebih dahulu.", "error");
            return;
        }
    }

    document.getElementById(`step-${currentStep}`).classList.add('hidden');
    document.getElementById(`nav-step-${currentStep}`).classList.remove('nav-btn-active');
    
    currentStep = n;
    
    document.getElementById(`step-${currentStep}`).classList.remove('hidden');
    document.getElementById(`nav-step-${currentStep}`).classList.add('nav-btn-active');
    
    kemaskiniUIIndicators();
    document.getElementById('section-form').scrollIntoView({ behavior: 'smooth' });
}

function navigateStep(direction) {
    if (direction === 1) {
        if (currentStep === 0) {
            const kod = document.getElementById('kodSekolah').value.trim();
            const nama = document.getElementById('namaSekolah').value.trim();
            if (!kod || !nama) {
                showToast("Sila lengkapkan maklumat sekolah terlebih dahulu.", "error");
                return;
            }
        } else {
            const activeKomponen = window.strukturBimbingan[currentStep - 1];
            if (activeKomponen.wajib) {
                let allFilled = true;
                activeKomponen.items.forEach(item => {
                    const checked = document.querySelector(`input[name="${item.id}"]:checked`);
                    if (!checked) allFilled = false;
                });
                if (!allFilled) {
                    showToast(`Sila lengkapkan semua skor wajib untuk Komponen ${activeKomponen.id}.`, "error");
                    return;
                }
            }
        }
    }

    document.getElementById(`step-${currentStep}`).classList.add('hidden');
    document.getElementById(`nav-step-${currentStep}`).classList.remove('nav-btn-active');
    
    currentStep += direction;
    
    document.getElementById(`step-${currentStep}`).classList.remove('hidden');
    document.getElementById(`nav-step-${currentStep}`).classList.add('nav-btn-active');
    
    kemaskiniUIIndicators();
    document.getElementById('section-form').scrollIntoView({ behavior: 'smooth' });
}

function kemaskiniUIIndicators() {
    const progressPct = ((currentStep + 1) / totalSteps) * 100;
    document.getElementById('progress-bar').style.width = `${progressPct}%`;
    
    const indicatorText = currentStep === 0 ? "Maklumat Sekolah" : window.strukturBimbingan[currentStep - 1].tajuk;
    document.getElementById('step-indicator').innerText = indicatorText;
    
    document.getElementById('btn-prev').classList.toggle('hidden', currentStep === 0);
    document.getElementById('btn-next').classList.toggle('hidden', currentStep === totalSteps - 1);
    document.getElementById('btn-submit').classList.toggle('hidden', currentStep !== totalSteps - 1);
    
    const isAtIJK = (currentStep >= 9 && currentStep <= 11);
    document.getElementById('btn-quick-save').classList.toggle('hidden', !isAtIJK);
    
    document.getElementById('btn-reset-borang').classList.toggle('hidden', currentStep !== 0);
}

function kemaskiniStatusNavigasi() {
    window.strukturBimbingan.forEach((komponen, index) => {
        const stepIdx = index + 1;
        const navBtn = document.getElementById(`nav-step-${stepIdx}`);
        let allFilled = true;
        
        komponen.items.forEach(item => {
            const radios = document.getElementsByName(item.id);
            let checked = false;
            for (let r of radios) { if (r.checked) checked = true; }
            if (!checked) allFilled = false;
        });
        
        if (allFilled) navBtn.classList.add('nav-btn-filled');
        else navBtn.classList.remove('nav-btn-filled');
    });
}

/**
 * ==========================================
 * LOGIK PENGISIAN & PENYERAHAN DATA BORANG
 * ==========================================
 */
async function semakDataTerdahuluBorang(kodSekolah) {
    const kod = kodSekolah.trim().toUpperCase();
    if (!kod) {
        lastFetchedKod = '';
        return;
    }
    
    if (lastFetchedKod === kod) return;
    lastFetchedKod = kod;

    const loaderStatus = document.getElementById('statusCarianKod');
    const infoText = document.getElementById('teksInfoKod');
    
    loaderStatus.classList.remove('hidden');
    infoText.innerText = "Menyemak rekod pangkalan data...";

    const respon = await window.API.semakRekodTerdahulu(kod);
    loaderStatus.classList.add('hidden');

    if (respon.status === 'success') {
        if (respon.isExisting) {
            if (!document.getElementById('namaSekolah').value && respon.data.nama_sekolah) {
                document.getElementById('namaSekolah').value = respon.data.nama_sekolah;
            }
            kosongkanSemuaRadio();
            // V8 Update: Loop hingga 48
            for (let i = 1; i <= 48; i++) {
                let namaItem = 'item' + i;
                let skor = respon.data[namaItem];
                if (skor && skor > 0) {
                    const radio = document.querySelector(`input[name="${namaItem}"][value="${skor}"]`);
                    if (radio) radio.checked = true;
                }
            }
            infoText.innerHTML = `<span class="text-green-600 font-bold uppercase">Rekod Dijumpai!</span> Markah terdahulu telah dimuatkan.`;
            showToast("Data bimbingan sekolah berjaya dimuatkan.", "success");
            kemaskiniStatusNavigasi();
        } else {
            kosongkanSemuaRadio();
            infoText.innerHTML = `<span class="text-blue-600 font-bold uppercase">Rekod Baharu.</span> Sila lengkapkan borang bimbingan.`;
            kemaskiniStatusNavigasi();
        }
    } else {
        lastFetchedKod = ''; 
        infoText.innerText = "Gagal menyemak rekod.";
        showToast(respon.message, "error");
    }
}

async function handleFormSubmit(event, isQuickSave = false) {
    if (event) event.preventDefault();

    const kod = document.getElementById('kodSekolah').value.trim();
    const nama = document.getElementById('namaSekolah').value.trim();
    if (!kod || !nama) {
        showToast("Sila lengkapkan maklumat Kod dan Nama Sekolah di ruangan INFO.", "error");
        lompatKeLangkah(0);
        return;
    }

    const submitBtn = document.getElementById('btn-submit');
    const quickBtn = document.getElementById('btn-quick-save');
    const btnText = document.getElementById('submitBtnText');
    const loader = isQuickSave ? document.getElementById('quickSaveLoader') : document.getElementById('submitBtnLoader');
    
    if (isQuickSave) quickBtn.disabled = true;
    else submitBtn.disabled = true;
    
    if (!isQuickSave) btnText.innerText = "Menyimpan Rekod...";
    loader.classList.remove('hidden');

    const formDataObj = new FormData(document.getElementById('bimbinganForm'));
    const payload = {};
    formDataObj.forEach((value, key) => { payload[key] = value; });

    const respon = await window.API.simpanBorangBimbingan(payload);

    if (isQuickSave) quickBtn.disabled = false;
    else submitBtn.disabled = false;
    
    loader.classList.add('hidden');
    if (!isQuickSave) btnText.innerText = "Hantar Penilaian Akhir";

    if (respon.status === 'success') {
        showToast(respon.message, 'success');
        if (!isQuickSave) {
            lompatKeLangkah(0);
        }
    } else {
        showToast(respon.message, 'error');
    }
}

function resetBorangKeseluruhan() {
    Swal.fire({
        title: 'Reset Borang?',
        text: "Adakah anda pasti untuk mengosongkan semua input dalam borang ini?",
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#3b82f6',
        cancelButtonColor: '#ef4444',
        confirmButtonText: 'Ya, Kosongkan',
        cancelButtonText: 'Batal'
    }).then((result) => {
        if (result.isConfirmed) {
            document.getElementById('bimbinganForm').reset();
            kosongkanSemuaRadio();
            
            lastFetchedKod = '';
            document.getElementById('teksInfoKod').innerText = "Sistem akan mengesan nama sekolah dan memuatkan data secara automatik.";
            
            const navBtns = document.querySelectorAll('[id^="nav-step-"]');
            navBtns.forEach(btn => btn.classList.remove('nav-btn-filled'));
            
            showToast("Borang telah dikosongkan.", "success");
        }
    });
}

function kosongkanSemuaRadio() {
    const allRadios = document.querySelectorAll('input[type="radio"]');
    allRadios.forEach(r => r.checked = false);
}

/**
 * ==========================================
 * LOGIK PELAPORAN, CARTA & PENJANAAN PDF
 * ==========================================
 */
async function muatTurunSenaraiDinilai() {
    const selectEl = document.getElementById('selectSekolahDinilai');
    const teksJumlah = document.getElementById('teks-jumlah-rekod');
    const indikator = document.getElementById('indikator-rekod');
    
    teksJumlah.innerText = "Memuatkan senarai...";
    indikator.className = "w-2 h-2 rounded-full mr-2 bg-yellow-400 animate-pulse";
    
    const respon = await window.API.dapatkanSenaraiTelahDinilai();
    
    if (respon.status === 'success') {
        selectEl.innerHTML = '<option value="">-- PILIH DARI SENARAI SEDIA ADA --</option>';
        respon.data.forEach(sek => {
            const opt = document.createElement('option');
            opt.value = sek.kod_sekolah;
            opt.text = `${sek.kod_sekolah} - ${sek.nama_sekolah}`;
            selectEl.appendChild(opt);
        });
        teksJumlah.innerText = `${respon.data.length} Rekod Tersedia`;
        indikator.className = "w-2 h-2 rounded-full mr-2 bg-green-500";
    } else {
        teksJumlah.innerText = "Gagal memuatkan senarai";
        indikator.className = "w-2 h-2 rounded-full mr-2 bg-red-500";
    }
}

function janaDropdownPenapisLaporan() {
    const filterSelect = document.getElementById('filterKomponen');
    filterSelect.innerHTML = '';
    window.strukturBimbingan.forEach((k, i) => {
        const opt = document.createElement('option');
        opt.value = i; 
        opt.text = k.tajuk;
        filterSelect.appendChild(opt);
    });
}

async function laksanakanJanaanLaporan(kodSekolah) {
    if (!kodSekolah) return;

    const selectEl = document.getElementById('selectSekolahDinilai');
    selectEl.disabled = true;
    showToast("Mengekstrak data sekolah...", "info");

    const respon = await window.API.dapatkanDataPelaporan(kodSekolah);

    selectEl.disabled = false;

    if (respon.status === 'success') {
        laporanSemasaData = respon.data;
        paparAntaramukaPelaporan();
        kemasKiniCarta();
        document.getElementById('btnExportPDF').classList.remove('hidden');
        showToast("Pelaporan berjaya dimuatkan.", "success");
    } else {
        showToast(respon.message, 'error');
        document.getElementById('reportContainer').classList.add('hidden');
        document.getElementById('emptyStateContainer').classList.remove('hidden');
        document.getElementById('btnExportPDF').classList.add('hidden');
    }
}

function paparAntaramukaPelaporan() {
    document.getElementById('reportContainer').classList.remove('hidden');
    document.getElementById('emptyStateContainer').classList.add('hidden');
    
    document.getElementById('paparanNamaSekolah').innerText = laporanSemasaData.namaSekolah;
    document.getElementById('paparanKodSekolah').innerText = laporanSemasaData.kodSekolah;
    
    const dateObj = new Date(laporanSemasaData.timestamp);
    document.getElementById('paparanTimestamp').innerText = `Kemas kini: ${dateObj.toLocaleString('ms-MY')}`;
    document.getElementById('rumusanTeks').value = laporanSemasaData.rumusan || '';
    
    kemaskiniUIAdmin(); // Pastikan butang padam dipaparkan jika sesi aktif
}

function wrapTextChart(text, maxLength) {
    // Bersihkan tag HTML sebelum proses word wrap untuk elak ralat dalam carta / PDF
    const div = document.createElement("div");
    div.innerHTML = text;
    const plainText = div.textContent || div.innerText || "";
    
    const words = plainText.split(' ');
    const lines = [];
    let currentLine = '';
    words.forEach(word => {
        if ((currentLine + word).length > maxLength) {
            lines.push(currentLine.trim());
            currentLine = word + ' ';
        } else {
            currentLine += word + ' ';
        }
    });
    lines.push(currentLine.trim());
    return lines;
}

function kemasKiniCarta() {
    if (!laporanSemasaData) return;
    
    const idx = document.getElementById('filterKomponen').value;
    const kObj = window.strukturBimbingan[idx];
    
    const labels = []; 
    const scores = [];
    
    kObj.items.forEach(item => {
        labels.push(wrapTextChart(item.teks, 25)); 
        scores.push(laporanSemasaData.scores[item.id] || 0);
    });
    
    const bgColors = scores.map(s => 
        s === 1 ? 'rgba(239, 68, 68, 0.8)' : 
        s === 2 ? 'rgba(249, 115, 22, 0.8)' : 
        s === 3 ? 'rgba(34, 197, 94, 0.8)' : 
        'rgba(200, 200, 200, 0.5)'
    );

    const ctx = document.getElementById('barChart').getContext('2d');
    
    if (bimbinganChart) bimbinganChart.destroy();
    
    bimbinganChart = new Chart(ctx, {
        type: 'bar',
        data: { 
            labels: labels, 
            datasets: [{ label: 'Skor', data: scores, backgroundColor: bgColors, borderRadius: 5 }] 
        },
        options: {
            responsive: true, 
            maintainAspectRatio: false,
            scales: { 
                y: { beginAtZero: true, max: 3, ticks: { stepSize: 1, font: { weight: 'bold' } } }, 
                x: { ticks: { autoSkip: false, font: { size: 10, weight: 'bold' } } } 
            },
            plugins: { legend: { display: false } }
        }
    });
}

/**
 * ==========================================
 * SISTEM PENJANAAN PDF (OFF-SCREEN RENDERING)
 * ==========================================
 */
function muatLogoPPD() {
    return new Promise((resolve) => {
        const img = new Image();
        img.crossOrigin = 'Anonymous';
        img.src = 'icoppdag.png';
        img.onload = () => {
            const canvas = document.createElement('canvas');
            canvas.width = img.width;
            canvas.height = img.height;
            const ctx = canvas.getContext('2d');
            ctx.drawImage(img, 0, 0);
            // Kembalikan base64 beserta saiz asal imej untuk pengiraan aspect ratio
            resolve({
                base64: canvas.toDataURL('image/png'),
                width: img.width,
                height: img.height
            });
        };
        img.onerror = () => {
            resolve(null); // Jika gagal, teruskan tanpa logo
        };
    });
}

async function janaDokumenPDF() {
    if (!laporanSemasaData) return;

    const btn = document.getElementById('btnExportPDF');
    const teksBtn = document.getElementById('teksBtnExportPDF');
    const loader = document.getElementById('loaderExportPDF');

    btn.disabled = true;
    teksBtn.innerText = "Menjana PDF...";
    loader.classList.remove('hidden');

    try {
        const { jsPDF } = window.jspdf;
        const doc = new jsPDF('p', 'mm', 'a4');
        const pageWidth = doc.internal.pageSize.getWidth();
        const pageHeight = doc.internal.pageSize.getHeight();
        let currentY = 30; // Penjejak koordinat Y secara dinamik

        const centerText = (text, y, size = 12, isBold = false) => {
            doc.setFontSize(size);
            doc.setFont("helvetica", isBold ? "bold" : "normal");
            const textWidth = doc.getStringUnitWidth(text) * doc.internal.getFontSize() / doc.internal.scaleFactor;
            const textOffset = (pageWidth - textWidth) / 2;
            doc.text(text, textOffset, y);
        };

        // 1. MUKA HADAPAN (FRONT PAGE)
        const logoData = await muatLogoPPD();
        if (logoData && logoData.base64) {
            const targetWidth = 60; // Lebar tetap logo
            const aspectRatio = logoData.height / logoData.width;
            const targetHeight = targetWidth * aspectRatio; // Ketinggian proporsional
            
            doc.addImage(logoData.base64, 'PNG', (pageWidth - targetWidth) / 2, currentY, targetWidth, targetHeight);
            currentY += targetHeight + 10;
        } else {
            currentY += 40; // Jika logo gagal muat, terus sediakan ruang kosong
        }

        // Teks Pengenalan Rasmi di bawah logo (Auto-adjusted Y)
        centerText("KEMENTERIAN PENDIDIKAN", currentY, 14, true);
        currentY += 8;
        centerText("PEJABAT PENDIDIKAN DAERAH ALOR GAJAH", currentY, 14, true);
        currentY += 12;

        doc.setDrawColor(200, 200, 200);
        doc.line(20, currentY, pageWidth - 20, currentY);
        currentY += 15;

        centerText("LAPORAN PENILAIAN KENDIRI TUNTAS", currentY, 18, true);
        currentY += 20;
        
        doc.setTextColor(30, 64, 175); // Warna Biru
        centerText(laporanSemasaData.namaSekolah, currentY, 14, true);
        currentY += 10;
        
        doc.setTextColor(0, 0, 0); // Warna Hitam
        centerText(`KOD SEKOLAH: ${laporanSemasaData.kodSekolah}`, currentY, 12, false);
        currentY += 10;

        const dateObj = new Date(laporanSemasaData.timestamp);
        centerText(`Tarikh Kemas Kini: ${dateObj.toLocaleString('ms-MY')}`, currentY, 10, false);
        currentY += 20;

        // Pemprosesan Rumusan Panjang (Word-wrap & Pagination)
        if (laporanSemasaData.rumusan) {
            doc.setFontSize(11);
            doc.setFont("helvetica", "bold");
            doc.text("RUMUSAN ADMIN:", 20, currentY);
            currentY += 10;
            
            doc.setFont("helvetica", "normal");
            
            // Menggunakan fungsi jsPDF terbina untuk memisahkan teks mengikut lebar muka surat
            // Ia juga akan mengesan watak baris baharu (\n) secara lalai.
            const splitRumusan = doc.splitTextToSize(laporanSemasaData.rumusan, pageWidth - 40);
            
            // Loop untuk mencetak baris demi baris, dan menambah page jika ruang tidak cukup
            splitRumusan.forEach(baris => {
                if (currentY > pageHeight - 20) {
                    doc.addPage();
                    currentY = 20; // Reset ke ruang atas muka surat baharu
                }
                doc.text(baris, 20, currentY);
                currentY += 6; // Jarak line height
            });
        }

        // 2. RENDERING CARTA (HIDDEN CANVAS) & PENAMBAHAN MUKA SURAT
        const canvasEl = document.getElementById('pdfHiddenCanvas');
        canvasEl.width = 800; // Tetapkan resolusi statik tinggi
        canvasEl.height = 400;
        const ctxHidden = canvasEl.getContext('2d');

        for (let i = 0; i < window.strukturBimbingan.length; i++) {
            const komponen = window.strukturBimbingan[i];
            doc.addPage();

            doc.setFontSize(14);
            doc.setFont("helvetica", "bold");
            doc.setTextColor(30, 64, 175);
            doc.text(komponen.tajuk, 15, 20);
            doc.setTextColor(0, 0, 0);

            const labels = [];
            const scores = [];
            komponen.items.forEach(item => {
                labels.push(wrapTextChart(item.teks, 45)); 
                scores.push(laporanSemasaData.scores[item.id] || 0);
            });

            const bgColors = scores.map(s =>
                s === 1 ? 'rgba(239, 68, 68, 1)' :
                s === 2 ? 'rgba(249, 115, 22, 1)' :
                s === 3 ? 'rgba(34, 197, 94, 1)' :
                'rgba(200, 200, 200, 1)'
            );

            // Bina carta tersembunyi tanpa animasi untuk rendering segera
            const chartImageBase64 = await new Promise((resolve) => {
                const tempChart = new Chart(ctxHidden, {
                    type: 'bar',
                    data: {
                        labels: labels,
                        datasets: [{ label: 'Skor', data: scores, backgroundColor: bgColors, borderWidth: 1 }]
                    },
                    options: {
                        animation: false, // Penting untuk elak canvas rendering kosong
                        responsive: false,
                        devicePixelRatio: 2, // Kualiti imej lebih tajam
                        scales: {
                            y: { beginAtZero: true, max: 3, ticks: { stepSize: 1, font: { weight: 'bold' } } },
                            x: { ticks: { font: { size: 10, weight: 'bold' } } }
                        },
                        plugins: { legend: { display: false } }
                    }
                });

                // Ruang penampan masa singkat untuk proses rendering diselesaikan oleh GPU
                setTimeout(() => {
                    const base64 = tempChart.toBase64Image();
                    tempChart.destroy();
                    resolve(base64);
                }, 150);
            });

            // Tampal Imej Carta
            doc.addImage(chartImageBase64, 'PNG', 15, 30, pageWidth - 30, 100);

            // Tampal Perincian Skor Teks di Bawah Carta
            doc.setFontSize(10);
            doc.setFont("helvetica", "bold");
            doc.text("PERINCIAN SKOR:", 15, 140);

            doc.setFont("helvetica", "normal");
            let yPosScores = 148;
            komponen.items.forEach((item) => {
                const skor = laporanSemasaData.scores[item.id] || 0;
                
                // Buang tag HTML (<br>, <div> dll) untuk teks PDF yang bersih
                const div = document.createElement("div");
                div.innerHTML = item.teks;
                const plainText = div.textContent || div.innerText || "";
                
                const textStr = `${plainText} (Skor Semasa: ${skor})`;
                const splitText = doc.splitTextToSize(textStr, pageWidth - 30);

                // Jika teks melebihi ruang bawah, tambah muka surat baharu
                if (yPosScores + (splitText.length * 5) > pageHeight - 15) {
                    doc.addPage();
                    yPosScores = 20;
                }

                doc.text(splitText, 15, yPosScores);
                yPosScores += (splitText.length * 5) + 3; // Jarak ruang per item
            });
        }

        // Muat Turun Fail
        doc.save(`Laporan_TUNTAS_${laporanSemasaData.kodSekolah}.pdf`);
        showToast("PDF berjaya dimuat turun.", "success");

    } catch (error) {
        console.error('Ralat Penjanaan PDF:', error);
        showToast("Gagal menjana PDF. Sila hubungi admin.", "error");
    } finally {
        btn.disabled = false;
        teksBtn.innerText = "Eksport PDF";
        loader.classList.add('hidden');
    }
}

/**
 * ==========================================
 * LOGIK MODAL ADMIN PPD & SESSION CACHING
 * ==========================================
 */
function kemaskiniUIAdmin() {
    const isVerified = sessionStorage.getItem('tuntas_admin_verified') === 'true';
    const navBtn = document.getElementById('btn-admin-auth-nav');
    const navTeks = document.getElementById('teks-admin-auth-nav');
    const btnPadam = document.getElementById('btnPadamRekodAdmin');
    
    if (isVerified) {
        navBtn.classList.replace('bg-amber-500', 'bg-red-600');
        navBtn.classList.replace('hover:bg-amber-600', 'hover:bg-red-700');
        navTeks.innerText = 'Log Keluar Admin';
        if(laporanSemasaData && btnPadam) btnPadam.classList.remove('hidden');
    } else {
        navBtn.classList.replace('bg-red-600', 'bg-amber-500');
        navBtn.classList.replace('hover:bg-red-700', 'hover:bg-amber-600');
        navTeks.innerText = 'Log Masuk Admin';
        if(btnPadam) btnPadam.classList.add('hidden');
    }
}

function kawalSesiAdmin() {
    const isVerified = sessionStorage.getItem('tuntas_admin_verified') === 'true';
    
    if (isVerified) {
        Swal.fire({
            title: 'Log Keluar Admin',
            text: 'Adakah anda pasti untuk menamatkan sesi admin?',
            icon: 'question',
            showCancelButton: true,
            confirmButtonColor: '#ef4444',
            cancelButtonColor: '#6b7280',
            confirmButtonText: 'Ya, Log Keluar',
            cancelButtonText: 'Batal'
        }).then((result) => {
            if (result.isConfirmed) {
                sessionStorage.removeItem('tuntas_admin_verified');
                kemaskiniUIAdmin();
                showToast('Berjaya log keluar dari sistem.', 'success');
            }
        });
    } else {
        bukaModalAdmin('login_sahaja');
    }
}

function urusTindakanAdmin(tindakan) {
    if (tindakan === 'kemaskini_rumusan') {
        const teks = document.getElementById('rumusanTeks').value.trim();
        if (!teks) {
            showToast("Sila masukkan teks rumusan terlebih dahulu.", "error");
            return;
        }
    }

    const isVerified = sessionStorage.getItem('tuntas_admin_verified') === 'true';
    if (isVerified) {
        if (tindakan === 'kemaskini_rumusan') laksanaKemasKiniSegera();
        else if (tindakan === 'padam_rekod') padamRekodSistem();
    } else {
        bukaModalAdmin(tindakan);
    }
}

function bukaModalAdmin(tindakan = 'login_sahaja') {
    tindakanSelepasLogin = tindakan;
    document.getElementById('inputPassAdmin').value = '';
    document.getElementById('modalAdminAuth').classList.remove('hidden');
}

function tutupModalAdmin() {
    document.getElementById('modalAdminAuth').classList.add('hidden');
    tindakanSelepasLogin = null;
}

async function prosesLogMasukAdmin() {
    const email = document.getElementById('inputEmailAdmin').value;
    const password = document.getElementById('inputPassAdmin').value;
    
    if (!password) {
        showToast("Sila masukkan kata laluan untuk pengesahan.", "error");
        return;
    }

    const loader = document.getElementById('loaderAdminModal');
    const btn = document.getElementById('btnSahkanAdmin');
    const teksBtn = document.getElementById('teksBtnSahkanAdmin');
    
    btn.disabled = true;
    teksBtn.innerText = "Mengesahkan...";
    loader.classList.remove('hidden');

    // Simulasi pengesahan klien seperti arahan reka bentuk
    setTimeout(() => {
        btn.disabled = false;
        teksBtn.innerText = "Log Masuk";
        loader.classList.add('hidden');
        
        if (email === window.ADMIN_EMAIL && password === window.ADMIN_PASSWORD_FALLBACK) {
            sessionStorage.setItem('tuntas_admin_verified', 'true');
            kemaskiniUIAdmin();
            tutupModalAdmin();
            showToast('Pengesahan Berjaya. Sesi Admin Aktif.', 'success');
            
            // Laksanakan rantaian fungsi jika log masuk dipanggil dari butang spesifik
            if (tindakanSelepasLogin === 'kemaskini_rumusan') {
                laksanaKemasKiniSegera();
            } else if (tindakanSelepasLogin === 'padam_rekod') {
                padamRekodSistem();
            }
        } else {
            showToast('Akses Ditolak: Kata Laluan tidak sah.', 'error');
        }
    }, 800);
}

async function laksanaKemasKiniSegera() {
    if (!laporanSemasaData || !laporanSemasaData.kodSekolah) return;

    const rumusanTeks = document.getElementById('rumusanTeks').value;
    const btn = document.getElementById('btnRumusanAdmin');
    const loader = document.getElementById('adminLoader');
    
    btn.disabled = true;
    loader.classList.remove('hidden');

    const respon = await window.API.kemaskiniRumusanAdmin(
        laporanSemasaData.kodSekolah, 
        rumusanTeks, 
        window.ADMIN_EMAIL, 
        window.ADMIN_PASSWORD_FALLBACK
    );

    btn.disabled = false;
    loader.classList.add('hidden');

    if (respon.status === 'success') {
        showToast("Rumusan dikemas kini dengan jayanya.", 'success');
        laporanSemasaData.rumusan = rumusanTeks.toUpperCase();
    } else {
        showToast(respon.message, 'error');
        sessionStorage.removeItem('tuntas_admin_verified');
        kemaskiniUIAdmin();
    }
}

function padamRekodSistem() {
    if (!laporanSemasaData || !laporanSemasaData.kodSekolah) return;
    
    Swal.fire({
        title: 'AMARAN PENGHAPUSAN!',
        html: `Anda pasti mahu memadam semua rekod dan data bagi sekolah <b>${laporanSemasaData.kodSekolah}</b>?<br><br><span class="text-red-600 font-bold">Tindakan ini tidak boleh dipulihkan.</span>`,
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#ef4444',
        cancelButtonColor: '#6b7280',
        confirmButtonText: 'Ya, Padam Pangkalan Data',
        cancelButtonText: 'Batal'
    }).then(async (result) => {
        if (result.isConfirmed) {
            const btn = document.getElementById('btnPadamRekodAdmin');
            const loader = document.getElementById('loaderPadamAdmin');
            
            btn.disabled = true;
            loader.classList.remove('hidden');
            
            const respon = await window.API.padamRekodBimbingan(
                laporanSemasaData.kodSekolah,
                window.ADMIN_EMAIL,
                window.ADMIN_PASSWORD_FALLBACK
            );
            
            btn.disabled = false;
            loader.classList.add('hidden');
            
            if(respon.status === 'success') {
                showToast(respon.message, 'success');
                document.getElementById('reportContainer').classList.add('hidden');
                document.getElementById('emptyStateContainer').classList.remove('hidden');
                document.getElementById('btnExportPDF').classList.add('hidden');
                document.getElementById('selectSekolahDinilai').value = '';
                laporanSemasaData = null;
                
                // Segar semula senarai carian sekolah
                muatTurunSenaraiDinilai();
            } else {
                showToast(respon.message, 'error');
            }
        }
    });
}

/**
 * ==========================================
 * UTILITI PAPARAN UI (TABS)
 * ==========================================
 */
function switchTab(tabId) {
    document.getElementById('section-form').classList.toggle('hidden', tabId !== 'form');
    document.getElementById('section-report').classList.toggle('hidden', tabId !== 'report');
    document.getElementById('btn-tab-form').classList.toggle('bg-blue-800', tabId === 'form');
    document.getElementById('btn-tab-report').classList.toggle('bg-blue-800', tabId === 'report');
    
    // Muat turun senarai sekolah secara auto-populate jika tab Pelaporan dibuka
    if (tabId === 'report') {
        muatTurunSenaraiDinilai();
    }
}