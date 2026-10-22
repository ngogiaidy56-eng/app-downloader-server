document.addEventListener('DOMContentLoaded', () => {
    // 1. Logic Trang chủ Client
    const appGrid = document.getElementById('appGrid');
    if (appGrid) {
        loadClientApps();
        const searchInput = document.getElementById('searchInput');
        const tagBtns = document.querySelectorAll('.tag-btn');

        tagBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                tagBtns.forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                const filter = btn.dataset.filter;
                document.querySelectorAll('.app-card-vip').forEach(card => {
                    if (filter === 'all' || card.dataset.category === filter) {
                        card.classList.remove('hidden');
                    } else {
                        card.classList.add('hidden');
                    }
                });
            });
        });

        if (searchInput) {
            searchInput.addEventListener('input', (e) => {
                const query = e.target.value.toLowerCase().trim();
                document.querySelectorAll('.app-card-vip').forEach(card => {
                    const title = card.querySelector('h3').textContent.toLowerCase();
                    const desc = card.querySelector('.description').textContent.toLowerCase();
                    if (title.includes(query) || desc.includes(query)) {
                        card.classList.remove('hidden');
                    } else {
                        card.classList.add('hidden');
                    }
                });
            });
        }
    }

    // 2. Logic Admin Developer Panel
    const adminTable = document.getElementById('adminAppTable');
    if (adminTable) {
        let authToken = localStorage.getItem('adminToken');
        if (authToken) {
            document.getElementById('loginOverlay').classList.add('hidden');
            loadAdminApps();
        }

        const dropZone = document.getElementById('dropZone');
        const fileInput = document.getElementById('softwareFile');
        if (dropZone && fileInput) {
            dropZone.addEventListener('click', () => fileInput.click());
            fileInput.addEventListener('change', () => {
                if (fileInput.files.length > 0) {
                    document.getElementById('selectedFileName').textContent = `File đã chọn: ${fileInput.files[0].name}`;
                }
            });
        }

        const uploadForm = document.getElementById('uploadForm');
        if (uploadForm) {
            uploadForm.addEventListener('submit', async (e) => {
                e.preventDefault();
                const formData = new FormData();
                formData.append('name', document.getElementById('appName').value);
                formData.append('version', document.getElementById('appVersion').value);
                formData.append('category', document.getElementById('appCategory').value);
                formData.append('channel', document.getElementById('appChannel').value);
                formData.append('description', document.getElementById('appDescription').value);
                formData.append('changelog', document.getElementById('appChangelog').value);
                formData.append('softwareFile', fileInput.files[0]);

                showToastVIP('Đang tải file lên Server...');
                const res = await fetch('/api/admin/upload', { method: 'POST', body: formData });
                const data = await res.json();
                if (data.success) {
                    showToastVIP('Phát hành Build mới thành công!');
                    uploadForm.reset();
                    document.getElementById('selectedFileName').textContent = '';
                    loadAdminApps();
                } else {
                    alert(data.message);
                }
            });
        }

        // Search nhanh trong bảng Admin
        const adminSearchInput = document.getElementById('adminSearchInput');
        if (adminSearchInput) {
            adminSearchInput.addEventListener('input', (e) => {
                const query = e.target.value.toLowerCase().trim();
                document.querySelectorAll('#adminAppTable tr').forEach(tr => {
                    const text = tr.textContent.toLowerCase();
                    if (text.includes(query)) {
                        tr.classList.remove('hidden');
                    } else {
                        tr.classList.add('hidden');
                    }
                });
            });
        }

        // Form Edit thông tin App
        const editForm = document.getElementById('editForm');
        if (editForm) {
            editForm.addEventListener('submit', async (e) => {
                e.preventDefault();
                const id = document.getElementById('editAppId').value;
                const bodyData = {
                    name: document.getElementById('editName').value,
                    version: document.getElementById('editVersion').value,
                    category: document.getElementById('editCategory').value,
                    channel: document.getElementById('editChannel').value,
                    description: document.getElementById('editDescription').value,
                    changelog: document.getElementById('editChangelog').value
                };

                const res = await fetch(`/api/admin/apps/${id}`, {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(bodyData)
                });
                const data = await res.json();
                if (data.success) {
                    showToastVIP('Lưu cập nhật thành công!');
                    closeEditModal();
                    loadAdminApps();
                } else {
                    alert(data.message);
                }
            });
        }
    }
});

// Load Client Apps
async function loadClientApps() {
    const res = await fetch('/api/apps');
    const apps = await res.json();
    const grid = document.getElementById('appGrid');
    grid.innerHTML = '';

    apps.forEach(app => {
        const card = document.createElement('div');
        card.className = 'app-card-vip';
        card.dataset.id = app.id;
        card.dataset.category = app.category;
        card.innerHTML = `
            <div class="app-info-vip">
                <div class="app-icon-vip tools-glow"><i class="fa-solid fa-rocket"></i></div>
                <div class="app-details-vip">
                    <h3>${app.name}</h3>
                    <p class="version">${app.version} • ${app.size} <span class="badge-pro" style="font-size:0.65rem; padding:0.1rem 0.4rem;">${(app.channel || 'stable').toUpperCase()}</span></p>
                    <p class="description">${app.description}</p>
                </div>
            </div>
            <div class="card-stats-vip">
                <span><i class="fa-solid fa-star text-gold"></i> ${app.rating}</span>
                <span class="speed-tag"><i class="fa-solid fa-download"></i> ${app.downloads} lượt tải</span>
            </div>
            <div class="card-actions-vip">
                <button class="btn-glass" onclick="openModal('${app.id}')"><i class="fa-solid fa-eye"></i> Chi tiết</button>
                <a href="/api/download/${app.id}" class="btn-download-vip" target="_blank">
                    <i class="fa-solid fa-download"></i> Tải Về
                </a>
            </div>
        `;
        grid.appendChild(card);
    });
}

// Load Admin Apps & Build Statistics
async function loadAdminApps() {
    const res = await fetch('/api/apps');
    const apps = await res.json();
    let totalDownloads = 0;
    const tbody = document.getElementById('adminAppTable');
    tbody.innerHTML = '';

    apps.forEach(app => {
        totalDownloads += app.downloads || 0;
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td><strong>${app.name}</strong></td>
            <td><span class="version">${app.version}</span></td>
            <td><span class="badge-pro" style="background:${app.channel === 'beta' ? '#f59e0b' : '#10b981'}; color:#000;">${(app.channel || 'stable').toUpperCase()}</span></td>
            <td>${app.category}</td>
            <td>${app.size}</td>
            <td><i class="fa-solid fa-download text-cyan"></i> ${app.downloads}</td>
            <td>
                <div class="btn-actions-group">
                    <button onclick="openEditModal('${app.id}')" class="btn-edit"><i class="fa-solid fa-pen"></i> Sửa</button>
                    <button onclick="deleteApp('${app.id}')" class="btn-delete"><i class="fa-solid fa-trash"></i> Xóa</button>
                </div>
            </td>
        `;
        tbody.appendChild(tr);
    });

    document.getElementById('statTotalApps').textContent = apps.length;
}

// Admin Tab Switching
function switchDevTab(tabId, btn) {
    document.querySelectorAll('.dev-tab-content').forEach(tab => tab.classList.add('hidden'));
    document.querySelectorAll('.filter-tags .tag-btn').forEach(b => b.classList.remove('active'));
    
    document.getElementById(tabId).classList.remove('hidden');
    btn.classList.add('active');
}

// License Key Generator
function generateLicenseKey() {
    const client = document.getElementById('licenseClientName').value.trim() || 'Tester';
    const duration = document.getElementById('licenseDuration').value;
    const key = 'KEY-' + Math.random().toString(36).substring(2, 10).toUpperCase() + '-' + Date.now().toString().slice(-4);

    const tbody = document.getElementById('licenseTableBody');
    const tr = document.createElement('tr');
    tr.innerHTML = `
        <td><code>${key}</code></td>
        <td>${client}</td>
        <td>${duration === '9999' ? 'Vĩnh Viễn' : duration + ' Ngày'}</td>
        <td><code>Chưa Bind HWID</code></td>
        <td><span class="badge-pro" style="background:#10b981; color:#000;">SẴN SÀNG</span></td>
    `;
    tbody.prepend(tr);
    showToastVIP(`Đã khởi tạo License Key mới!`);
}

async function loginAdmin() {
    const password = document.getElementById('adminPassword').value;
    const res = await fetch('/api/admin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password })
    });
    const data = await res.json();
    if (data.success) {
        localStorage.setItem('adminToken', data.token);
        document.getElementById('loginOverlay').classList.add('hidden');
        loadAdminApps();
        showToastVIP('Đăng nhập quản trị thành công!');
    } else {
        alert(data.message);
    }
}

function logoutAdmin() {
    localStorage.removeItem('adminToken');
    location.reload();
}

async function deleteApp(id) {
    if (!confirm('Bạn có chắc chắn muốn xóa phần mềm này khỏi Server?')) return;
    const res = await fetch(`/api/admin/apps/${id}`, { method: 'DELETE' });
    const data = await res.json();
    if (data.success) {
        showToastVIP('Đã xóa thành công!');
        loadAdminApps();
    }
}

async function openEditModal(appId) {
    const res = await fetch('/api/apps');
    const apps = await res.json();
    const app = apps.find(a => a.id === appId);
    if (!app) return;

    document.getElementById('editAppId').value = app.id;
    document.getElementById('editName').value = app.name;
    document.getElementById('editVersion').value = app.version;
    document.getElementById('editCategory').value = app.category;
    document.getElementById('editChannel').value = app.channel || 'stable';
    document.getElementById('editDescription').value = app.description || '';
    document.getElementById('editChangelog').value = app.changelog || '';

    document.getElementById('editModal').classList.remove('hidden');
}

function closeEditModal() {
    document.getElementById('editModal').classList.add('hidden');
}

async function openModal(appId) {
    const res = await fetch('/api/apps');
    const apps = await res.json();
    const app = apps.find(a => a.id === appId);
    if (!app) return;

    document.getElementById('modalTitle').textContent = app.name;
    document.getElementById('modalVersion').textContent = `${app.version} • ${app.size}`;
    document.getElementById('modalChangelog').textContent = app.changelog || 'Không có ghi chú.';
    document.getElementById('modalDownloadBtn').href = `/api/download/${app.id}`;
    document.getElementById('appModal').classList.remove('hidden');
}

function closeModal() {
    document.getElementById('appModal').classList.add('hidden');
}

function postComment() {
    const input = document.getElementById('commentInput');
    const val = input.value.trim();
    if (!val) return;
    const list = document.getElementById('commentsList');
    const item = document.createElement('div');
    item.className = 'comment-item';
    item.innerHTML = `<strong><i class="fa-solid fa-crown text-gold"></i> Thành viên:</strong> ${val}`;
    list.prepend(item);
    input.value = '';
    showToastVIP('Đã gửi bình luận!');
}

function showToastVIP(msg) {
    const container = document.getElementById('toastContainer');
    if (!container) return;
    const toast = document.createElement('div');
    toast.className = 'toast-vip';
    toast.innerHTML = `<i class="fa-solid fa-bolt" style="color:#06b6d4"></i> ${msg}`;
    container.appendChild(toast);
    setTimeout(() => toast.remove(), 3500);
}
