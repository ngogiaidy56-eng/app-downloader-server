document.addEventListener('DOMContentLoaded', () => {
    loadAppsFromJSON();

    const searchInput = document.getElementById('searchInput');
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
});

async function loadAppsFromJSON() {
    try {
        // Tự động nhận diện đường dẫn phù hợp với GitHub Pages (phòng lỗi 404 sub-path)
        const res = await fetch('./apps.json');
        if (!res.ok) throw new Error('Không thể tải dữ liệu apps.json');
        const apps = await res.json();
        
        const grid = document.getElementById('appGrid');
        grid.innerHTML = '';

        apps.forEach(app => {
            const card = document.createElement('div');
            card.className = 'app-card-vip';
            card.innerHTML = `
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
                    <a href="${app.filename}" class="btn-download-vip" download>
                        <i class="fa-solid fa-download"></i> Tải Về Ngay
                    </a>
                </div>
            `;
            grid.appendChild(card);
        });
    } catch (error) {
        console.error('Lỗi load dữ liệu:', error);
    }
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
