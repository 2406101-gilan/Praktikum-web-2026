// File: public/script.js - Logika Client-Side JavaScript CRUD
document.addEventListener("DOMContentLoaded", () => {
  // 1. Tangkap elemen DOM
  const mhsForm = document.querySelector("#mhsForm");
  const mhsIdInput = document.querySelector("#mhsId");
  const nimInput = document.querySelector("#nim");
  const namaInput = document.querySelector("#nama");
  const jurusanInput = document.querySelector("#jurusan");
  const emailInput = document.querySelector("#email");
  const btnSubmit = document.querySelector("#btnSubmit");
  const btnCancel = document.querySelector("#btnCancel");
  const formTitle = document.querySelector("#formTitle");
  const mhsTableBody = document.querySelector("#mhsTableBody");
  const alertMessage = document.querySelector("#alertMessage");
  const searchInput = document.querySelector("#searchInput"); // Fitur 1
  const totalCount = document.querySelector("#totalCount");   // Fitur 3

  let listMahasiswa = [];

  // Mencegah karakter HTML dari data ikut dieksekusi sebagai markup
  const esc = (str) => String(str).replace(/[&<>"']/g, (c) => ({
    "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;"
  }[c]));

  // Notifikasi
  const showAlert = (teks, tipe = "success") => {
    alertMessage.textContent = teks;
    alertMessage.className = `alert alert-${tipe}`;
    alertMessage.style.display = "block";
    setTimeout(() => { alertMessage.style.display = "none"; }, 3000);
  };

  // Fitur 3: perbarui counter total mahasiswa
  const updateCounter = () => {
    totalCount.textContent = listMahasiswa.length;
  };

  // Fitur 1: terapkan filter pencarian pada listMahasiswa lalu render
  const applyFilter = () => {
    const keyword = searchInput.value.trim().toLowerCase();
    const hasil = listMahasiswa.filter((m) =>
      m.nama.toLowerCase().includes(keyword) ||
      m.nim.toLowerCase().includes(keyword)
    );
    renderTable(hasil);
  };

  // 2. READ: Ambil data mahasiswa dari API Node.js
  const loadMahasiswa = async () => {
    try {
      const res = await fetch("/api/mahasiswa");
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      listMahasiswa = await res.json();
      updateCounter(); // Fitur 3: otomatis ikut berubah setiap data dimuat ulang
      applyFilter();   // Fitur 1: filter tetap berlaku setelah data dimuat ulang
    } catch (error) {
      showAlert("Gagal memuat data dari server backend", "error");
    }
  };

  const renderTable = (data) => {
    mhsTableBody.innerHTML = "";
    if (data.length === 0) {
      mhsTableBody.innerHTML = "<tr><td colspan='6' style='text-align:center; color:#64748b;'>Tidak ada data mahasiswa yang ditemukan.</td></tr>";
      return;
    }
    data.forEach((mhs, idx) => {
      const tr = document.createElement("tr");
      tr.innerHTML = `
        <td>${idx + 1}</td>
        <td>${esc(mhs.nim)}</td>
        <td>${esc(mhs.nama)}</td>
        <td>${esc(mhs.jurusan)}</td>
        <td>${esc(mhs.email)}</td>
        <td>
          <button class="btn-action btn-edit" data-id="${mhs.id}">Edit</button>
          <button class="btn-action btn-delete" data-id="${mhs.id}">Hapus</button>
        </td>
      `;
      mhsTableBody.appendChild(tr);
    });
  };

  // Fitur 1: event listener 'input' pada kolom pencarian
  searchInput.addEventListener("input", applyFilter);

  // 3. CREATE & UPDATE: Kirim formulir
  mhsForm.addEventListener("submit", async (e) => {
    e.preventDefault();

    const payload = {
      nim: nimInput.value.trim(),
      nama: namaInput.value.trim(),
      jurusan: jurusanInput.value,
      email: emailInput.value.trim()
    };

    const id = mhsIdInput.value;
    const isEdit = Boolean(id);

    // Fitur 2: validasi NIM duplikat memakai .some()
    // Saat edit, data yang sedang diedit tidak dihitung sebagai duplikat.
    const nimSudahAda = listMahasiswa.some(
      (m) => m.nim === payload.nim && String(m.id) !== String(id)
    );
    if (nimSudahAda) {
      alert("NIM sudah terdaftar!");
      return; // batalkan submit, fetch tidak dijalankan
    }

    const url = isEdit ? `/api/mahasiswa/${id}` : "/api/mahasiswa";
    const method = isEdit ? "PUT" : "POST";

    try {
      const res = await fetch(url, {
        method: method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });
      const result = await res.json();

      if (result.success) {
        showAlert(result.message);
        resetForm();
        loadMahasiswa();
      } else {
        showAlert("Terjadi kesalahan: " + result.message, "error");
      }
    } catch (error) {
      showAlert("Gagal mengirim data ke server", "error");
    }
  });

  // 4. DELETE & EDIT: event delegation pada tabel
  mhsTableBody.addEventListener("click", async (e) => {
    const id = Number(e.target.dataset.id);
    if (!id) return;

    // Mode Edit
    if (e.target.classList.contains("btn-edit")) {
      const targetMhs = listMahasiswa.find((m) => m.id === id);
      if (targetMhs) {
        mhsIdInput.value = targetMhs.id;
        nimInput.value = targetMhs.nim;
        namaInput.value = targetMhs.nama;
        jurusanInput.value = targetMhs.jurusan;
        emailInput.value = targetMhs.email;
        formTitle.textContent = "Edit Data Mahasiswa";
        btnSubmit.textContent = "Perbarui Mahasiswa";
        btnCancel.style.display = "inline-block";
        window.scrollTo({ top: 0, behavior: "smooth" });
      }
    }

    // Mode Hapus
    if (e.target.classList.contains("btn-delete")) {
      if (confirm("Apakah Anda yakin ingin menghapus data mahasiswa ini?")) {
        try {
          const res = await fetch(`/api/mahasiswa/${id}`, { method: "DELETE" });
          const result = await res.json();
          if (result.success) {
            showAlert(result.message);
            loadMahasiswa(); // counter ikut diperbarui lewat loadMahasiswa
          }
        } catch (error) {
          showAlert("Gagal menghapus data dari server", "error");
        }
      }
    }
  });

  // 5. Reset formulir ke mode tambah
  const resetForm = () => {
    mhsForm.reset();
    mhsIdInput.value = "";
    formTitle.textContent = "Tambah Mahasiswa Baru";
    btnSubmit.textContent = "Simpan Mahasiswa";
    btnCancel.style.display = "none";
  };

  btnCancel.addEventListener("click", resetForm);

  // Ambil data pertama kali
  loadMahasiswa();
});
