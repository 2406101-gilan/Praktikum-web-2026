// File: script.js
document.addEventListener("DOMContentLoaded", () => {
    // 1. Ambil elemen DOM
    const todoForm = document.querySelector("#todoForm");
    const taskInput = document.querySelector("#taskInput");
    const inputError = document.querySelector("#inputError");
    const inputError1 = document.querySelector("#inputError1");
    const MAX_TASKS = 5; // batas maksimum jumlah tugas
    const todoList = document.querySelector("#todoList");
    const taskCounter = document.querySelector("#taskCounter");
    const clearCompletedBtn = document.querySelector("#clearCompletedBtn");
    // 2. Fungsi membaca dan menyimpan ke LocalStorage
    const getTasks = () => JSON.parse(localStorage.getItem("todo_tasks")) || [];
    const saveTasks = (tasks) => localStorage.setItem("todo_tasks",
        JSON.stringify(tasks));
    // FITUR 1: Perbarui ringkasan jumlah tugas
    const updateCounter = (tasks) => {
        const total = tasks.length;
        const done = tasks.filter(task => task.completed).length;
        taskCounter.textContent = `Total: ${total} Tugas | Selesai: ${done} | Belum Selesai: ${total - done}`;
        // FITUR 2: tombol nonaktif jika belum ada tugas selesai
        clearCompletedBtn.disabled = done === 0;
    };
    // 3. Fungsi menampilkan daftar tugas ke layar
    const renderTasks = () => {
        const tasks = getTasks();
        updateCounter(tasks); // dipanggil sebelum return agar kondisi kosong (0 tugas) juga terhitung
        if (tasks.length < MAX_TASKS && inputError1.style.display === "block") {
            inputError1.style.display = "none";
            taskInput.classList.remove("error");
        }
        todoList.innerHTML = "";
        if (tasks.length === 0) {
            todoList.innerHTML = "<p style='text-align:center; color:#64748b; fontsize:13px; padding:10px;'>Belum ada tugas tersimpan.</p>";
            return;
        }
        tasks.forEach((task, index) => {
            const li = document.createElement("li");
            li.className = `todo-item ${task.completed ? 'completed' : ''}`;
            li.innerHTML = `
 <span class="todo-text">${task.text}</span>
 <div class="todo-actions">
 <button class="action-btn complete-btn" data-index="${index}">
 ${task.completed ? 'Batal' : 'Selesai'}
 </button>
<button class="action-btn delete-btn" data-index="${index}">Hapus</button>
 </div>
 `;
            todoList.appendChild(li);
        });
    };
    // 4. Tambah tugas saat formulir dikirim
    todoForm.addEventListener("submit", (e) => {
        e.preventDefault();
        const taskText = taskInput.value.trim();
        const tasks = getTasks();
        // Validasi batas maksimum 5 tugas
        if (tasks.length >= MAX_TASKS) {
            taskInput.classList.add("error");
            inputError.style.display = "none";
            inputError1.style.display = "block";
            return;
        }
        inputError1.style.display = "none";
        // Validasi input sederhana
        if (taskText.length < 3) {
            taskInput.classList.add("error");
            inputError.style.display = "block";
            return;
        }
        // Jika valid, hilangkan pesan error
        taskInput.classList.remove("error");
        inputError.style.display = "none";
        // Simpan tugas baru ke array LocalStorage
        tasks.push({ text: taskText, completed: false });
        saveTasks(tasks);
        taskInput.value = "";
        renderTasks();
    });
    todoList.addEventListener("click", (e) => {
        const index = e.target.dataset.index;
        if (index === undefined) return;
        const tasks = getTasks();
        if (e.target.classList.contains("complete-btn")) {
            tasks[index].completed = !tasks[index].completed;
            saveTasks(tasks);
            renderTasks();
        } else if (e.target.classList.contains("delete-btn")) {
            // FITUR 3: konfirmasi sebelum menghapus
            if (confirm("Apakah Anda yakin ingin menghapus tugas ini?")) {
                tasks.splice(index, 1);
                saveTasks(tasks);
                renderTasks();
            }
            // Jika Cancel, tidak ada yang diubah
        }
    });
    // FITUR 2: Hapus hanya tugas dengan completed: true, sisanya tetap tersimpan
    clearCompletedBtn.addEventListener("click", () => {
        const remaining = getTasks().filter(task => !task.completed);
        saveTasks(remaining);
        renderTasks();
    });
    // Render pertama kali saat halaman selesai dimuat
    renderTasks();
});
