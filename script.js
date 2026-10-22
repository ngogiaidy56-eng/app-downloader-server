// Dữ liệu mẫu mặc định (Sẽ lưu và đồng bộ qua localStorage)
const defaultApps = [
    {
        id: "app-1",
        title: "Automation Workflows Hub",
        category: "Tools",
        version: "v2.5.0 • 60 MB",
        description: "Hệ thống quản lý kịch bản tự động hóa, nuôi tài khoản và Reg Webhook.",
        downloadUrl: "downloads/automation-tool.exe",
        iconClass: "fa-solid fa-robot"
    },
    {
        id: "app-2",
        title: "AI Subtitle & Translator Studio",
        category: "Tools",
        version: "v3.5.0 PRO • 320 MB",
        description: "Trích xuất âm thanh, tạo phụ đề tự động bằng AI Whisper & Gemini.",
        downloadUrl: "https://drive.google.com",
        iconClass: "fa-solid fa-closed-captioning"
    },
    {
        id: "app-3",
        title: "Telegram Bot & Mini App Manager",
        category: "Android",
        version: "v2.8.1 • 45 MB",
        description: "Quản lý Bot Telegram, Webhook và điều khiển VPS trực tiếp trên Android.",
        downloadUrl: "downloads/telegram-app.apk",
        iconClass: "fa-brands fa-telegram"
    }
];

let appsData = JSON.parse(localStorage.getItem('appstore_apps')) || defaultApps;
let isAdminMode = false;

document.addEventListener('DOMContentLoaded', () => {
    renderUserApps('all');
    renderAdminTable();

    // Lọc danh mục User View
    document.querySelectorAll('.tag-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            document.querySelectorAll('.tag-btn').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            renderUserApps(btn.dataset.filter);
        });
    });

    // Form CRUD Submit
    document.getElementById('appCrudForm').addEventListener('submit', handleCrudSubmit);
});

// Switch chế độ User / Admin
function toggleAdminPanel() {
    isAdminMode = !isAdminMode;
    const userView = document.getElementById('userView');
    const adminPanel = document.getElementById('adminPanel');
    const btnText = document.getElementById('adminToggleText');

    if (isAdminMode) {
        userView.classList.add('hidden');
        adminPanel.classList.remove('hidden');
        btnText.textContent = "Xem Trang Khách";
        showToastVIP("Đã mở giao diện Quản Trị Admin!");
    } else {
        adminPanel.classList.add('hidden');
        userView.classList.remove('hidden');
        btnText.textContent = "Quản Trị Admin";
        renderUserApps('all');
    }
}

// Render Danh Sách Ứng Dụng lên Trang Khách (User View)
function renderUserApps(filterCategory) {
    const grid = document.getElementById('appGrid');
    grid.innerHTML = '';

    const filtered = (filterCategory === 'all') 
        ? appsData 
        : appsData.filter(a => a.category === filterCategory);

    filtered.forEach(app => {
        const card = document.createElement('div');
        card.className = 'app-card-vip';
        card.innerHTML = `
            <div class="vip-ribbon"><i class="fa-solid fa-crown"></i> VIP</div>
            <div class="app-info-vip">
                <div class="app-icon-vip tools-glow">
                    <i class="${app.iconClass || 'fa-solid fa-cube'}"></i>
                </div>
                <div class="app-details-vip">
                    <h3>${app.title}</h3>
                    <p class="version">${app.version}</p>
                    <p class="description">${app.description}</p>
                </div>
            </div>
            <div class="card-stats-vip">
                <span><i class="fa-solid fa-star text-gold"></i> 5.0</span>
                <span class="speed-tag"><i class="fa-solid fa-shield-halved"></i> Verified</span>
            </div>
            <div class="card-actions-vip">
                <a href="${app.downloadUrl}" target="_blank" class="btn-download-vip w-100" download>
                    <i class="fa-solid fa-download"></i> Tải Về Ngay
                </a>
            </div>
        `;
        grid.appendChild(card);
    });
}

// Render Bảng Quản Trị Admin
function renderAdminTable() {
    const tbody = document.getElementById('adminAppTableBody');
    tbody.innerHTML = '';

    appsData.forEach((app, index) => {
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td><div class="tbl-icon"><i class="${app.iconClass || 'fa-solid fa-cube'}"></i></div></td>
            <td><strong>${app.title}</strong></td>
            <td><span class="badge-pro">${app.category}</span></td>
            <td>${app.version}</td>
            <td style="max-width: 150px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;">${app.downloadUrl}</td>
            <td>
                <button class="btn-action-edit" onclick="editApp('${app.id}')"><i class="fa-solid fa-pen"></i></button>
                <button class="btn-action-delete" onclick="deleteApp('${app.id}')"><i class="fa-solid fa-trash"></i></button>
            </td>
        `;
        tbody.appendChild(tr);
    });

    document.getElementById('statTotalApps').textContent = appsData.length;
}

// Mở Modal Form CRUD
function openAppFormModal() {
    document.getElementById('appCrudForm').reset();
    document.getElementById('appFormId').value = '';
    document.getElementById('formModalTitle').innerHTML = `<i class="fa-solid fa-plus text-gold"></i> Thêm Phần Mềm Mới`;
    document.getElementById('appFormModal').classList.remove('hidden');
}

function closeAppFormModal() {
    document.getElementById('appFormModal').classList.add('hidden');
}

// Sửa Phần Mềm
function editApp(id) {
    const app = appsData.find(a => a.id === id);
    if (!app) return;

    document.getElementById('appFormId').value = app.id;
    document.getElementById('formTitle').value = app.title;
    document.getElementById('formCategory').value = app.category;
    document.getElementById('formVersion').value = app.version;
    document.getElementById('formDescription').value = app.description;
    document.getElementById('formDownloadUrl').value = app.downloadUrl;
    document.getElementById('formIconClass').value = app.iconClass;

    document.getElementById('formModalTitle').innerHTML = `<i class="fa-solid fa-pen-to-square text-gold"></i> Chỉnh Sửa Phần Mềm`;
    document.getElementById('appFormModal').classList.remove('hidden');
}

// Xóa Phần Mềm
function deleteApp(id) {
    if (confirm("Bạn có chắc chắn muốn xóa phần mềm này khỏi hệ thống?")) {
        appsData = appsData.filter(a => a.id !== id);
        saveAndSync();
        showToastVIP("Đã xóa phần mềm thành công!");
    }
}

// Xử lý Lưu Form (Thêm mới hoặc Cập nhật)
function handleCrudSubmit(e) {
    e.preventDefault();
    const id = document.getElementById('appFormId').value;
    const title = document.getElementById('formTitle').value.trim();
    const category = document.getElementById('formCategory').value;
    const version = document.getElementById('formVersion').value.trim();
    const description = document.getElementById('formDescription').value.trim();
    const downloadUrl = document.getElementById('formDownloadUrl').value.trim();
    const iconClass = document.getElementById('formIconClass').value.trim() || 'fa-solid fa-cube';

    if (id) {
        // Update
        const index = appsData.findIndex(a => a.id === id);
        if (index !== -1) {
            appsData[index] = { id, title, category, version, description, downloadUrl, iconClass };
            showToastVIP("Đã cập nhật thông tin phần mềm!");
        }
    } else {
        // Create
        const newApp = {
            id: 'app-' + Date.now(),
            title, category, version, description, downloadUrl, iconClass
        };
        appsData.push(newApp);
        showToastVIP("Đã thêm phần mềm mới vào danh sách!");
    }

    saveAndSync();
    closeAppFormModal();
}

function saveAndSync() {
    localStorage.setItem('appstore_apps', JSON.stringify(appsData));
    renderAdminTable();
}

// Toast
function showToastVIP(msg) {
    const container = document.getElementById('toastContainer');
    const toast = document.createElement('div');
    toast.className = 'toast-vip';
    toast.innerHTML = `<i class="fa-solid fa-bolt" style="color:#06b6d4"></i> ${msg}`;
    container.appendChild(toast);
    setTimeout(() => toast.remove(), 3500);
}
