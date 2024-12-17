// Inisialisasi data
let medicines = [];
let currentReminder = null;
let currentDate = new Date();
let healthTips = [
    "Minum air putih minimal 8 gelas sehari",
    "Tidur 7-8 jam setiap malam untuk kesehatan optimal",
    "Olahraga ringan minimal 30 menit setiap hari",
    "Konsumsi sayur dan buah setiap hari",
    "Jaga pola makan yang teratur",
    "Lakukan peregangan setiap 2 jam saat bekerja",
    "Kontrol tekanan darah secara rutin",
    "Kurangi makanan tinggi gula dan garam"
];

// Data edukasi kesehatan dengan gambar dan link
const healthEducationArticles = [
    {
        title: "Manfaat Olahraga Rutin",
        content: "Olahraga rutin dapat meningkatkan kesehatan jantung, mengurangi stres, dan meningkatkan kualitas tidur. Cobalah untuk berolahraga setidaknya 30 menit setiap hari.",
        image: "images/olahraga.jpg", // Pastikan path gambar benar
        link: "https://www.alodokter.com/beragam-manfaat-olahraga" // Ganti dengan link yang sesuai
    },
    {
        title: "Pentingnya Pola Makan Seimbang",
        content: "Mengonsumsi makanan seimbang yang kaya akan sayuran, buah-buahan, protein, dan biji-bijian dapat membantu menjaga kesehatan tubuh dan mencegah penyakit kronis.",
        image: "images/pola_makan.jpg",
        link: "https://yankes.kemkes.go.id/view_artikel/3467/pola-makan-yang-sehat"
    },
    {
        title: "Cara Mengelola Stres",
        content: "Mengelola stres dapat dilakukan dengan meditasi, yoga, atau aktivitas relaksasi lainnya. Penting untuk menemukan waktu untuk diri sendiri setiap hari.",
        image: "images/stres.png",
        link: "https://p2ptm.kemkes.go.id/infographic-p2ptm/stress/cara-mengatasi-stres-dan-mencapai-jiwa-yang-sehat"
    },
    {
        title: "Pentingnya Tidur yang Cukup",
        content: "Tidur yang cukup sangat penting untuk kesehatan mental dan fisik. Usahakan untuk tidur 7-9 jam setiap malam untuk mendukung fungsi tubuh yang optimal.",
        image: "images/tidur.jpg",
        link: "https://herminahospitals.com/id/articles/peran-tidur-dalam-kesehatan-fisik-dan-mental.html"
    },
    {
        title: "Hidrasi yang Baik",
        content: "Minum cukup air setiap hari sangat penting untuk menjaga kesehatan. Cobalah untuk minum minimal 8 gelas air per hari.",
        image: "images/hidrasi.jpg",
        link: "https://www.halodoc.com/artikel/fakta-menarik-tentang-hidrasi-yang-perlu-diketahui?srsltid=AfmBOorOjnK1fQz2t1CHpXkInVD-ke2-AzNjr4kSF2coWB8GubTf1kDO"
    },
    {
        title: "Vaksinasi dan Kesehatan",
        content: "Vaksinasi adalah cara yang efektif untuk melindungi diri dari berbagai penyakit. Pastikan untuk mendapatkan vaksin yang diperlukan sesuai dengan rekomendasi kesehatan.",
        image: "images/vaksinasi.jpg",
        link: "https://www.prudential.co.id/id/pulse/article/tiga-fakta-vaksin-yang-perlu-anda-ketahui/"
    }
];

// Load data dari localStorage saat halaman dimuat
document.addEventListener('DOMContentLoaded', () => {
    loadMedicines();
    checkSchedules();
    requestNotificationPermission();
    displayHealthTip();
    updateCalendar();
    displayHealthEducation();
    
    // Event listener untuk form tambah obat
    document.getElementById('addMedicineForm').addEventListener('submit', addMedicine);
    
    // Perbarui tip kesehatan setiap 24 jam
    setInterval(displayHealthTip, 24 * 60 * 60 * 1000);
});

// Fungsi untuk meminta izin notifikasi
function requestNotificationPermission() {
    if ("Notification" in window) {
        Notification.requestPermission();
    }
}

// Fungsi untuk menambah obat baru
function addMedicine(event) {
    event.preventDefault();
    
    const medicine = {
        id: Date.now(),
        name: document.getElementById('medicineName').value,
        dosage: document.getElementById('dosage').value,
        time: document.getElementById('time').value,
        duration: parseInt(document.getElementById('duration').value),
        notes: document.getElementById('notes').value,
        startDate: new Date().toISOString().split('T')[0],
        taken: []
    };

    medicines.push(medicine);
    saveMedicines();
    updateDisplay();
    closeModal('addMedicineModal');
    document.getElementById('addMedicineForm').reset();
}

// Fungsi untuk menyimpan data ke localStorage
function saveMedicines() {
    localStorage.setItem('medicines', JSON.stringify(medicines));
}

// Fungsi untuk memuat data dari localStorage
function loadMedicines() {
    const saved = localStorage.getItem('medicines');
    if (saved) {
        medicines = JSON.parse(saved);
        updateDisplay();
    }
}

// Fungsi untuk memperbarui tampilan
function updateDisplay() {
    updateTodayList();
    updateMedicineList();
}

// Fungsi untuk memperbarui daftar obat hari ini
function updateTodayList() {
    const todayList = document.getElementById('todayList');
    todayList.innerHTML = '';

    const today = new Date().toISOString().split('T')[0];
    const currentMedicines = medicines.filter(medicine => {
        const startDate = new Date(medicine.startDate);
        const endDate = new Date(startDate);
        endDate.setDate(endDate.getDate() + medicine.duration);
        const currentDate = new Date(today);
        return currentDate >= startDate && currentDate <= endDate;
    });

    if (currentMedicines.length === 0) {
        todayList.innerHTML = '<p class="no-medicines">Tidak ada jadwal obat hari ini</p>';
        return;
    }

    currentMedicines.forEach(medicine => {
        const isTaken = medicine.taken.includes(today);
        const item = document.createElement('div');
        item.className = `medicine-item ${isTaken ? 'taken' : ''}`;
        item.innerHTML = `
            <div class="medicine-info">
                <h3>${medicine.name}</h3>
                <p>${medicine.time} - ${medicine.dosage}</p>
                <small>${medicine.notes}</small>
            </div>
            <button onclick="toggleTaken(${medicine.id})" class="status-btn">
                ${isTaken ? 'Sudah Diminum' : 'Belum Diminum'}
            </button>
        `;
        todayList.appendChild(item);
    });
}

// Fungsi untuk memperbarui daftar semua obat
function updateMedicineList() {
    const medicineList = document.getElementById('medicineList');
    medicineList.innerHTML = '';

    if (medicines.length === 0) {
        medicineList.innerHTML = '<p class="no-medicines">Belum ada obat yang ditambahkan</p>';
        return;
    }

    medicines.forEach(medicine => {
        const item = document.createElement('div');
        item.className = 'medicine-item';
        item.innerHTML = `
            <div class="medicine-info">
                <h3>${medicine.name}</h3>
                <p>${medicine.time} - ${medicine.dosage}</p>
                <p>Durasi: ${medicine.duration} hari</p>
                <small>${medicine.notes}</small>
            </div>
            <button onclick="deleteMedicine(${medicine.id})" class="delete-btn">
                <i class="fas fa-trash"></i>
            </button>
        `;
        medicineList.appendChild(item);
    });
}

// Fungsi untuk menandai obat sudah/belum diminum
function toggleTaken(id) {
    const today = new Date().toISOString().split('T')[0];
    const medicine = medicines.find(m => m.id === id);
    
    if (medicine) {
        const takenIndex = medicine.taken.indexOf(today);
        if (takenIndex === -1) {
            medicine.taken.push(today);
        } else {
            medicine.taken.splice(takenIndex, 1);
        }
        saveMedicines();
        updateDisplay();
    }
}

// Fungsi untuk menghapus obat
function deleteMedicine(id) {
    if (confirm('Apakah Anda yakin ingin menghapus obat ini?')) {
        medicines = medicines.filter(medicine => medicine.id !== id);
        saveMedicines();
        updateDisplay();
    }
}

// Fungsi untuk membuka modal
function openModal(modalId) {
    document.getElementById(modalId).style.display = 'block';
}

// Fungsi untuk menutup modal
function closeModal(modalId) {
    document.getElementById(modalId).style.display = 'none';
}

// Fungsi untuk memeriksa jadwal
function checkSchedules() {
    setInterval(() => {
        const now = new Date();
        const currentTime = now.toTimeString().slice(0, 5);
        const today = now.toISOString().split('T')[0];

        medicines.forEach(medicine => {
            if (medicine.time === currentTime && !medicine.taken.includes(today)) {
                showReminder(medicine);
            }
        });
    }, 1000); // Cek setiap detik
}

// Fungsi untuk menampilkan pengingat
function showReminder(medicine) {
    playAlarmSound();
    currentReminder = medicine;
    document.getElementById('reminderMessage').textContent = 
        `Waktunya minum ${medicine.name} - ${medicine.dosage}`;
    openModal('reminderModal');
    
    if (Notification.permission === "granted") {
        new Notification("Pengingat Obat", {
            body: `Waktunya minum ${medicine.name} - ${medicine.dosage}`,
            icon: "/favicon.ico"
        });
    }
}

// Fungsi untuk sound alaram
function playAlarmSound(){
    const alarmSound = document.getElementById("alarm-sound");
    if (alarmSound) {
        alarmSound.src = "sounds/sound.mp3";
        alarmSound.play().catch(err => {
            console.error("Tidak dapat memutar alarm: ", err);
        });
    } else {
        console.warn("Elemen alarm-sound tidak ditemukan.");
    }
}

// Fungsi untuk sound alaram berhenti secara otomatis
function stopAlarmSound(){
    const alarmSound = document.getElementById("alarm-sound");
    if (alarmSound) {
        alarmSound.pause(); // Menghentikan audio
        alarmSound.currentTime = 0; // Mengatur ulang ke awal
    } else {
        console.warn("Elemen alarm-sound tidak ditemukan.");
    }
}

// Fungsi untuk menandai obat sudah diminum dari pengingat
function markAsTaken() {
    if (currentReminder) {
        toggleTaken(currentReminder.id);
        stopAlarmSound();
        closeModal('reminderModal');
        currentReminder = null;
    }
}

// Fungsi untuk menunda pengingat
function snoozeReminder() {
    stopAlarmSound();
    if (currentReminder) {
        setTimeout(() => {
            showReminder(currentReminder);
        }, 15 * 60 * 1000); // 15 menit
        closeModal('reminderModal');
    }
}

// Event listener untuk menutup modal saat mengklik di luar modal
window.onclick = (event) => {
    stopAlarmSound();
    const modals = document.getElementsByClassName('modal');
    for (let modal of modals) {
        if (event.target === modal) {
            modal.style.display = 'none';
        }
    }
}

// Fungsi untuk menampilkan tip kesehatan
function displayHealthTip() {
    const tipIndex = Math.floor(Math.random() * healthTips.length);
    const tipCard = document.getElementById('healthTipCard');
    tipCard.innerHTML = `
        <p><i class="fas fa-lightbulb"></i> ${healthTips[tipIndex]}</p>
    `;
}

// Fungsi untuk memperbarui kalender
function updateCalendar() {
    const monthNames = ["Januari", "Februari", "Maret", "April", "Mei", "Juni",
        "Juli", "Agustus", "September", "Oktober", "November", "Desember"
    ];
    
    document.getElementById('currentMonth').textContent = 
        `${monthNames[currentDate.getMonth()]} ${currentDate.getFullYear()}`;
    
    const firstDay = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
    const lastDay = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0);
    const daysGrid = document.getElementById('calendarDays');
    daysGrid.innerHTML = '';
    
    // Tambah padding untuk hari-hari sebelum tanggal 1
    for(let i = 0; i < firstDay.getDay(); i++) {
        daysGrid.appendChild(document.createElement('div'));
    }
    
    // Isi kalender dengan tanggal
    for(let day = 1; day <= lastDay.getDate(); day++) {
        const dayDiv = document.createElement('div');
        dayDiv.className = 'calendar-day';
        dayDiv.textContent = day;
        
        // Cek apakah ada jadwal obat pada tanggal ini
        const checkDate = new Date(currentDate.getFullYear(), currentDate.getMonth(), day)
            .toISOString().split('T')[0];
        
        if(hasMedicine(checkDate)) {
            dayDiv.classList.add('has-medicine');
        }
        
        // Tandai hari ini
        if(isToday(day)) {
            dayDiv.classList.add('today');
        }
        
        dayDiv.addEventListener('click', () => showScheduleForDate(day));
        daysGrid.appendChild(dayDiv);
    }
}

// Fungsi untuk mengecek apakah ada obat pada tanggal tertentu
function hasMedicine(date) {
    return medicines.some(medicine => {
        const startDate = new Date(medicine.startDate);
        const endDate = new Date(startDate);
        endDate.setDate(endDate.getDate() + medicine.duration);
        const checkDate = new Date(date);
        return checkDate >= startDate && checkDate <= endDate;
    });
}

// Fungsi untuk mengecek apakah tanggal hari ini
function isToday(day) {
    const today = new Date();
    return day === today.getDate() && 
           currentDate.getMonth() === today.getMonth() && 
           currentDate.getFullYear() === today.getFullYear();
}

// Fungsi untuk menampilkan jadwal obat pada tanggal tertentu
function showScheduleForDate(day) {
    const selectedDate = new Date(currentDate.getFullYear(), currentDate.getMonth(), day)
        .toISOString().split('T')[0];
    
    const scheduleList = document.getElementById('medicineSchedule');
    scheduleList.innerHTML = '';
    
    const dayMedicines = medicines.filter(medicine => {
        const startDate = new Date(medicine.startDate);
        const endDate = new Date(startDate);
        endDate.setDate(endDate.getDate() + medicine.duration);
        const checkDate = new Date(selectedDate);
        return checkDate >= startDate && checkDate <= endDate;
    });
    
    if(dayMedicines.length === 0) {
        scheduleList.innerHTML = '<p>Tidak ada jadwal obat pada tanggal ini</p>';
        return;
    }
    
    dayMedicines.forEach(medicine => {
        const item = document.createElement('div');
        item.className = 'schedule-item';
        item.innerHTML = `
            <h4>${medicine.name}</h4>
            <p>${medicine.time} - ${medicine.dosage}</p>
            <small>${medicine.notes}</small>
        `;
        scheduleList.appendChild(item);
    });
}

// Fungsi untuk kembali ke bulan sebelumnya
function previousMonth() {
    currentDate.setMonth(currentDate.getMonth() - 1);
    updateCalendar();
}

// Fungsi untuk maju ke bulan berikutnya
function nextMonth() {
    currentDate.setMonth(currentDate.getMonth() + 1);
    updateCalendar();
}

self.addEventListener('push', function(event) {
    const data = event.data.json();
    self.registration.showNotification(data.title, {
        body: data.body,
        icon: data.icon || 'icon.png', // URL ikon notifikasi
        badge: 'badge.png', // Ikon kecil (opsional)
    });
});

if ('serviceWorker' in navigator && 'PushManager' in window) {
    navigator.serviceWorker.register('/service-worker.js')
        .then(function(reg) {
            console.log('Service Worker terdaftar!', reg);
        })
        .catch(function(error) {
            console.error('Gagal mendaftarkan Service Worker:', error);
        });
}

// Fungsi menambahkan jadwal konsultasi
function addConsultation() {
    // Ambil nilai input dari form
    const date = document.getElementById("consultationDate").value;
    const time = document.getElementById("consultationTime").value;
    const notes = document.getElementById("consultationNotes").value;

    // Validasi input
    if (!date || !time) {
        alert("Tanggal dan waktu wajib diisi!");
        return;
    }

    // Temukan elemen daftar konsultasi
    const consultationList = document.getElementById("consultationList");

    // Buat elemen baru untuk jadwal konsultasi
    const listItem = document.createElement("div");
    listItem.classList.add("consultation-item"); // Tambahkan class untuk styling
    listItem.innerHTML = `
        <div>
            <p><strong>Date:</strong> <span class="consultation-date">${date}</span></p>
            <p><strong>Time:</strong> <span class="consultation-time">${time}</span></p>
            <p><strong>Note:</strong> <span class="consultation-note">${notes || "Tidak ada catatan"}</span></p>
        </div>
        <div class="consultation-actions">
            <button class="edit-btn" onclick="editConsultation(this)">Edit</button>
            <button class="delete-btn" onclick="deleteConsultation(this)">Hapus</button>
        </div>
    `;

    // Tambahkan elemen baru ke dalam daftar
    consultationList.appendChild(listItem);

    // Reset form setelah jadwal ditambahkan
    document.getElementById("addConsultationForm").reset();

    // Tutup modal
    closeAddConsultationModal();

    // Memutar suara saat menambahkan jadwal konsultasi
    playAlarmSound();

    // Notifikasi sukses
    alert("Jadwal konsultasi berhasil ditambahkan!");
}

// Fungsi mengedit jadwal konsultasi
function editConsultation(button) {
    const listItem = button.closest(".consultation-item");

    // Ambil data yang ada
    const currentDate = listItem.querySelector(".consultation-date").textContent;
    const currentTime = listItem.querySelector(".consultation-time").textContent;
    const currentNote = listItem.querySelector(".consultation-note").textContent;

    // Prompt untuk input baru
    const newDate = prompt("Edit tanggal (YYYY-MM-DD):", currentDate);
    const newTime = prompt("Edit waktu (HH:MM):", currentTime);
    const newNote = prompt("Edit catatan:", currentNote);

    // Validasi input baru
    if (newDate && newTime) {
        // Perbarui isi elemen dengan nilai baru
        listItem.querySelector(".consultation-date").textContent = newDate;
        listItem.querySelector(".consultation-time").textContent = newTime;
        listItem.querySelector(".consultation-note").textContent = newNote || "Tidak ada catatan";
        alert("Jadwal berhasil diperbarui!");
    } else {
        alert("Tanggal dan waktu tidak boleh kosong!");
    }
}

// Fungsi menghapus jadwal konsultasi
function deleteConsultation(button) {
    const listItem = button.closest(".consultation-item"); // Ambil elemen induk
    if (confirm("Apakah Anda yakin ingin menghapus jadwal ini?")) {
        listItem.remove(); // Hapus elemen dari daftar
        alert("Jadwal berhasil dihapus!");
    }
}

// Fungsi untuk membuka modal tambah jadwal
function openAddConsultationModal() {
    const modal = document.getElementById("addConsultationModal");
    modal.style.display = "block"; // Tampilkan modal
}

// Fungsi untuk menutup modal tambah jadwal
function closeAddConsultationModal() {
    const modal = document.getElementById("addConsultationModal");
    modal.style.display = "none"; // Sembunyikan modal
}

function displayHealthEducation() {
    const educationContent = document.getElementById('educationContent');
    educationContent.innerHTML = ''; // Clear previous content

    healthEducationArticles.forEach(article => {
        const cardDiv = document.createElement('div');
        cardDiv.className = 'education-card'; // Use a card class
        cardDiv.innerHTML = `
            <a href="${article.link}" target="_blank">
                <img src="${article.image}" alt="${article.title}" class="card-image">
                <div class="card-body">
                    <h3 class="card-title">${article.title}</h3>
                    <p class="card-text">${article.content}</p>
                </div>
            </a>
        `;
        educationContent.appendChild(cardDiv);
    });
}

// Play notification sound
const notificationSound = document.getElementById('notificationSound');
notificationSound.currentTime = 0; // Rewind to the start
notificationSound.play(); // Play the sound
