document.addEventListener('DOMContentLoaded', () => {
    // 1. Logic cho Trang Chủ (index.html)
    const appGrid = document.getElementById('appGrid');
    if (appGrid) {
        loadClientApps();
        
        const searchInput = document.getElementById('searchInput');
        const tagBtns = document.querySelectorAll('.tag-btn');
        const btnBatchDownload = document.getElementById('btnBatchDownload');
        let selectedApps = [];

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

    // 2. Logic cho Admin Dashboard (admin.html)
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
                formData.append('rating', document.getElementById('appRating').value);
                formData.append('description', document.getElementById('appDescription').value);
                formData.append('changelog', document.getElementById('appChangelog').value);
                formData.append('softwareFile', fileInput.files[0]);

                showToastVIP('Đang tải file lên Server...');
                const res = await fetch('/api/admin/upload', { method: 'POST', body: formData });
                const data = await res.json();
                if (data.success) {
                    showToastVIP('Tải lên thành công!');
                    uploadForm.reset();
                    document.getElementById('selectedFileName').textContent = '';
                    loadAdminApps();
                } else {
                    alert(data.message);
                }
            });
        }
    }
});

// Tải danh sách app cho Trang Chủ
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
            <div class="card-select"><input type="checkbox" class="app-checkbox" data-app-id="${app.id}"></div>
            <div class="app-info-vip">
                <div class="app-icon-vip tools-glow"><i class="fa-solid fa-rocket"></i></div>
                <div class="app-details-vip">
                    <h3>${app.name}</h3>
                    <p class="version">${app.version} • ${app.size}</p>
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

// Tải danh sách app cho Admin Panel
async function loadAdminApps() {
    const res = await fetch('/api/apps');
    const apps = await res.json();
    let totalDownloads = 0, totalMB = 0;
    const tbody = document.getElementById('adminAppTable');
    tbody.innerHTML = '';

    apps.forEach(app => {
        totalDownloads += app.downloads || 0;
        totalMB += parseFloat(app.size) || 0;
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td><strong>${app.name}</strong></td>
            <td><span class="version">${app.version}</span></td>
            <td><span class="badge-pro">${app.category}</span></td>
            <td>${app.size}</td>
            <td><i class="fa-solid fa-download text-cyan"></i> ${app.downloads}</td>
            <td><code>uploads/${app.filename}</code></td>
            <td><button onclick="deleteApp('${app.id}')" class="btn-delete"><i class="fa-solid fa-trash"></i> Xóa</button></td>
        `;
        tbody.appendChild(tr);
    });

    document.getElementById('statTotalApps').textContent = apps.length;
    document.getElementById('statTotalDownloads').textContent = totalDownloads.toLocaleString();
    document.getElementById('statTotalStorage').textContent = totalMB.toFixed(1) + ' MB';
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
    if (!confirm('Bạn có chắc chắn muốn xóa phần mềm này?')) return;
    const res = await fetch(`/api/admin/apps/${id}`, { method: 'DELETE' });
    const data = await res.json();
    if (data.success) {
        showToastVIP('Đã xóa thành công!');
        loadAdminApps();
    }
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
    showToastVIP('Đã gửi bình luận thành công!');
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
