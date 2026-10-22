document.addEventListener('DOMContentLoaded', () => {
    const searchInput = document.getElementById('searchInput');
    const tagBtns = document.querySelectorAll('.tag-btn');
    const appCards = document.querySelectorAll('.app-card-vip');
    const checkboxes = document.querySelectorAll('.app-checkbox');
    const btnBatchDownload = document.getElementById('btnBatchDownload');
    const selectedCountEl = document.getElementById('selectedCount');
    const userPointsEl = document.getElementById('userPoints');

    let selectedApps = [];
    let currentPoints = parseInt(localStorage.getItem('vip_pts')) || 1250;
    userPointsEl.textContent = currentPoints.toLocaleString();

    // 1. TÍNH NĂNG MỚI: Tải Hàng Loạt (Batch Download)
    checkboxes.forEach(chk => {
        chk.addEventListener('change', () => {
            const appId = chk.dataset.appId;
            if (chk.checked) {
                selectedApps.push(appId);
            } else {
                selectedApps = selectedApps.filter(id => id !== appId);
            }

            selectedCountEl.textContent = selectedApps.length;
            if (selectedApps.length > 0) {
                btnBatchDownload.classList.remove('disabled');
            } else {
                btnBatchDownload.classList.add('disabled');
            }
        });
    });

    btnBatchDownload.addEventListener('click', () => {
        if (selectedApps.length === 0) return;

        showToastVIP(`Đang chuẩn bị tải ${selectedApps.length} ứng dụng cùng lúc...`);
        selectedApps.forEach(appId => {
            const card = document.querySelector(`.app-card-vip[data-id="${appId}"]`);
            const downloadBtn = card.querySelector('.btn-download-vip');
            
            // Kích hoạt link tải tự động
            const link = document.createElement('a');
            link.href = downloadBtn.href;
            link.download = '';
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
        });

        // Tặng điểm VIP khi sử dụng Batch Download
        addVipPoints(50);
    });

    // 2. Lọc danh mục & Tìm kiếm
    tagBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            tagBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            const filter = btn.dataset.filter;

            appCards.forEach(card => {
                const category = card.dataset.category;
                if (filter === 'all' || category === filter) {
                    card.classList.remove('hidden');
                } else {
                    card.classList.add('hidden');
                }
            });
        });
    });

    searchInput.addEventListener('input', (e) => {
        const query = e.target.value.toLowerCase().trim();
        appCards.forEach(card => {
            const title = card.querySelector('h3').textContent.toLowerCase();
            const desc = card.querySelector('.description').textContent.toLowerCase();
            if (title.includes(query) || desc.includes(query)) {
                card.classList.remove('hidden');
            } else {
                card.classList.add('hidden');
            }
        });
    });

    // Tải tự động GitHub Releases
    initGitHubReleases();
});

// 3. TÍNH NĂNG MỚI: Tích điểm Gamification
function addVipPoints(pts) {
    let currentPoints = parseInt(localStorage.getItem('vip_pts')) || 1250;
    currentPoints += pts;
    localStorage.setItem('vip_pts', currentPoints);
    document.getElementById('userPoints').textContent = currentPoints.toLocaleString();
    showToastVIP(`+${pts} Gem Points VIP!`);
}

function triggerVipEffect() {
    addVipPoints(100);
    showToastVIP("Đã kích hoạt chế độ Tải Siêu Tốc 100MB/s!");
}

// 4. Modal & Bình luận
function openModal(appId) {
    const card = document.querySelector(`.app-card-vip[data-id="${appId}"]`);
    if (!card) return;

    document.getElementById('modalTitle').textContent = card.querySelector('h3').textContent;
    document.getElementById('modalVersion').textContent = card.querySelector('.version').textContent;
    document.getElementById('modalChangelog').textContent = card.dataset.changelog || 'Chưa có ghi chú.';
    
    // Icon
    const iconClone = card.querySelector('.app-icon-vip').cloneNode(true);
    const modalIconBox = document.getElementById('modalIcon');
    modalIconBox.innerHTML = '';
    modalIconBox.className = iconClone.className;
    modalIconBox.appendChild(iconClone.children[0].cloneNode(true));

    // Screenshot
    const gallery = document.getElementById('modalScreenshots');
    gallery.innerHTML = '';
    const screens = card.dataset.screens ? card.dataset.screens.split(',') : [];
    screens.forEach(src => {
        const img = document.createElement('img');
        img.src = src;
        gallery.appendChild(img);
    });

    document.getElementById('modalDownloadBtn').href = card.querySelector('.btn-download-vip').href;
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
    item.innerHTML = `<strong><i class="fa-solid fa-crown text-gold"></i> VIP_User:</strong> ${val}`;
    list.prepend(item);
    input.value = '';

    addVipPoints(10);
}

// Toast System
function showToastVIP(msg) {
    const container = document.getElementById('toastContainer');
    const toast = document.createElement('div');
    toast.className = 'toast-vip';
    toast.innerHTML = `<i class="fa-solid fa-bolt" style="color:#06b6d4"></i> ${msg}`;
    container.appendChild(toast);
    setTimeout(() => toast.remove(), 3500);
}

// GitHub Releases API Sync
async function initGitHubReleases() {
    const githubCards = document.querySelectorAll('.app-card-vip[data-github-repo]');
    githubCards.forEach(async (card) => {
        const repo = card.getAttribute('data-github-repo');
        try {
            const res = await fetch(`https://api.github.com/repos/${repo}/releases/latest`);
            if (!res.ok) return;
            const data = await res.json();
            const asset = data.assets?.[0];
            if (asset) {
                card.querySelector('.version').textContent = `${data.tag_name} • ${(asset.size / (1024*1024)).toFixed(1)} MB`;
                card.querySelector('.btn-github').href = asset.browser_download_url;
            }
        } catch (e) {
            console.error(e);
        }
    });
}
