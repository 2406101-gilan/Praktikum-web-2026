// File: main.js
// Integrasi Logika Data dan Render ke Elemen DOM

// ===== DATA & STATE =====
let projects = [
    {
        id: 1,
        title: "Sistem Inventaris Keuangan",
        category: "Web App",
        budget: 2500000,
        completed: true
    },
    {
        id: 2,
        title: "Sistem Kasir Digital POS",
        category: "Desktop App",
        budget: 5000000,
        completed: true
    },
    {
        id: 3,
        title: "Landing Page Profil Perusahaan",
        category: "Web App",
        budget: 1500000,
        completed: false
    },
    {
        id: 4,
        title: "Aplikasi Presensi GPS Mobile",
        category: "Mobile App",
        budget: 4500000,
        completed: false
    }
];

// State filter terpadu (kategori + kata kunci pencarian)
let activeCategory = "Semua";
let searchKeyword = "";

// ===== HELPER =====
const formatRupiah = (angka) => {
    return new Intl.NumberFormat('id-ID', {
        style: 'currency',
        currency: 'IDR',
        maximumFractionDigits: 0
    }).format(angka);
};

// Mencegah HTML injection dari input pengguna
const escapeHTML = (text) => {
    const div = document.createElement("div");
    div.textContent = text;
    return div.innerHTML;
};

// ===== STATISTIK =====
const updateStats = (dataList) => {
    const totalProjects = dataList.length;
    const totalBudget = dataList.reduce((acc, curr) => acc + curr.budget, 0);
    const completedCount = dataList.filter(item => item.completed).length;

    document.getElementById("stat-total-projects").textContent = totalProjects;
    document.getElementById("stat-total-budget").textContent = formatRupiah(totalBudget);
    document.getElementById("stat-completed-projects").textContent = completedCount;
};

// ===== RENDER DAFTAR PROYEK =====
const renderProjects = (filteredList) => {
    const container = document.getElementById("project-list");
    if (!container) return;

    if (filteredList.length === 0) {
        container.innerHTML = "<p class='empty-message'>Tidak ada proyek yang cocok.</p>";
        return;
    }

    const htmlString = filteredList.map(proj => {
        const badgeClass = proj.completed ? "badge-success" : "badge-pending";
        const statusText = proj.completed ? "Selesai" : "Dalam Pengerjaan";

        return `
        <div class="project-card" data-id="${proj.id}">
            <div class="project-info">
                <span class="project-category">${escapeHTML(proj.category)}</span>
                <h4>${escapeHTML(proj.title)}</h4>
                <p class="project-budget">${formatRupiah(proj.budget)}</p>
            </div>
            <div class="project-side">
                <span class="badge ${badgeClass}">${statusText}</span>
                <div class="card-actions">
                    <button type="button" class="btn-action btn-toggle" data-action="toggle" data-id="${proj.id}">Ubah Status</button>
                    <button type="button" class="btn-action btn-delete" data-action="delete" data-id="${proj.id}">Hapus Proyek</button>
                </div>
            </div>
        </div>
        `;
    }).join("");

    container.innerHTML = htmlString;
};

// ===== FILTER TERPADU (kategori + pencarian) =====
const getFilteredProjects = () => {
    return projects
        .filter(p => activeCategory === "Semua" || p.category === activeCategory)
        .filter(p => p.title.toLowerCase().includes(searchKeyword.toLowerCase()));
};

// Render ulang daftar + statistik sekaligus
const refreshView = () => {
    renderProjects(getFilteredProjects());
    updateStats(projects);
};

// ===== VALIDASI FORM =====
const setError = (inputEl, errorEl, message) => {
    errorEl.textContent = message;
    inputEl.classList.toggle("invalid", message !== "");
};

const validateForm = (title, budget) => {
    const titleInput = document.getElementById("input-title");
    const budgetInput = document.getElementById("input-budget");
    const errorTitle = document.getElementById("error-title");
    const errorBudget = document.getElementById("error-budget");
    let valid = true;

    if (title === "") {
        setError(titleInput, errorTitle, "Judul proyek tidak boleh kosong.");
        valid = false;
    } else {
        setError(titleInput, errorTitle, "");
    }

    if (isNaN(budget) || budget <= 0) {
        setError(budgetInput, errorBudget, "Anggaran harus lebih besar dari 0.");
        valid = false;
    } else {
        setError(budgetInput, errorBudget, "");
    }

    return valid;
};

// ===== INISIALISASI =====
document.addEventListener("DOMContentLoaded", () => {
    refreshView();

    // --- FITUR 1: Submit form ---
    const form = document.getElementById("project-form");
    form.addEventListener("submit", (e) => {
        e.preventDefault();

        const title = document.getElementById("input-title").value.trim();
        const category = document.getElementById("input-category").value;
        const budget = Number(document.getElementById("input-budget").value);
        const completed = document.getElementById("input-completed").checked;

        if (!validateForm(title, budget)) return;

        const newProject = {
            id: Date.now(),
            title,
            category,
            budget,
            completed
        };

        // Spread operator: membuat array baru (immutable)
        projects = [...projects, newProject];

        form.reset();
        refreshView();
    });

    // --- FITUR 2: Pencarian real-time ---
    const searchInput = document.getElementById("search-input");
    searchInput.addEventListener("input", (e) => {
        searchKeyword = e.target.value.trim();
        refreshView();
    });

    // --- Filter kategori (terpadu dengan pencarian) ---
    const filterButtons = document.querySelectorAll(".btn-filter");
    filterButtons.forEach(btn => {
        btn.addEventListener("click", (e) => {
            filterButtons.forEach(b => b.classList.remove("active"));
            e.target.classList.add("active");
            activeCategory = e.target.getAttribute("data-category");
            refreshView();
        });
    });

    // --- FITUR 3: Aksi kartu (event delegation) ---
    document.getElementById("project-list").addEventListener("click", (e) => {
        const button = e.target.closest("button[data-action]");
        if (!button) return;

        const id = Number(button.getAttribute("data-id"));
        const action = button.getAttribute("data-action");

        if (action === "toggle") {
            projects = projects.map(p =>
                p.id === id ? { ...p, completed: !p.completed } : p
            );
        } else if (action === "delete") {
            projects = projects.filter(p => p.id !== id);
        }

        refreshView();
    });
});
