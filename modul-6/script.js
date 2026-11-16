// File: script.js
document.addEventListener("DOMContentLoaded", () => {
  // 1. Tangkap elemen DOM
  const btnFetch = document.querySelector("#btnFetch");
  const statusMessage = document.querySelector("#statusMessage");
  const userList = document.querySelector("#userList");

  // 2. Fungsi asinkronus untuk mengambil data pengguna dari server API
  const fetchUsers = async () => {
    // A. Tampilkan status pemuatan
    btnFetch.disabled = true;
    statusMessage.textContent = "Sedang memuat data dari server...";
    statusMessage.className = "status-msg";
    userList.innerHTML = "";

    try {
      // B. Kirim permintaan HTTP
      const response = await fetch("https://jsonplaceholder.typicode.com/users");

      // C. Periksa apakah server merespons dengan sukses
      if (!response.ok) {
        throw new Error(`Gagal mengambil data! Status HTTP: ${response.status}`);
      }

      // D. Konversi JSON menjadi array objek
      const users = await response.json();

      // E. Render data ke kartu HTML
      statusMessage.textContent = `Berhasil memuat ${users.length} data pengguna!`;
      renderUsers(users);
    } catch (error) {
      // F. Tangani error jaringan / URL salah
      statusMessage.textContent = `Gagal memuat data: ${error.message}`;
      statusMessage.className = "status-msg error";
    } finally {
      // G. Aktifkan kembali tombol
      btnFetch.disabled = false;
    }
  };

  // 3. Fungsi render kartu pengguna ke DOM
  const renderUsers = (users) => {
    userList.innerHTML = "";
    users.forEach((user) => {
      const card = document.createElement("div");
      card.className = "user-card";
      card.innerHTML = `
        <div class="user-name">${user.name}</div>
        <div class="user-email">${user.email}</div>
        <div class="user-company">${user.company.name}</div>
      `;
      userList.appendChild(card);
    });
  };

  // 4. Event listener tombol
  btnFetch.addEventListener("click", fetchUsers);
});
