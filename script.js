document.addEventListener('DOMContentLoaded', () => {
    const searchInput = document.getElementById('searchInput');
    const filterBtns = document.querySelectorAll('.filter-btn');
    const appCards = document.querySelectorAll('.app-card');
    const noResults = document.getElementById('noResults');

    let currentFilter = 'all';

    // 1. Tự động lấy thông tin từ GitHub API cho các app-card có cấu hình data-github-repo
    initGitHubReleases();

    // 2. Tìm kiếm từ khóa
    searchInput.addEventListener('input', filterApps);

    // 3. Lọc theo danh mục
    filterBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            filterBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            currentFilter = btn.getAttribute('data-filter');
            filterApps();
        });
    });

    function filterApps() {
        const searchTerm = searchInput.value.toLowerCase().trim();
        let visibleCount = 0;

        appCards.forEach(card => {
            const title = card.querySelector('h3').textContent.toLowerCase();
            const description = card.querySelector('.description').textContent.toLowerCase();
            const category = card.getAttribute('data-category');

            const matchesSearch = title.includes(searchTerm) || description.includes(searchTerm);
            const matchesCategory = (currentFilter === 'all') || (category === currentFilter);

            if (matchesSearch && matchesCategory) {
                card.classList.remove('hidden');
                visibleCount++;
            } else {
                card.classList.add('hidden');
            }
        });

        if (visibleCount === 0) {
            noResults.classList.remove('hidden');
        } else {
            noResults.classList.add('hidden');
        }
    }

    // Hàm gọi GitHub REST API để lấy bản phát hành mới nhất
    async function initGitHubReleases() {
        const githubCards = document.querySelectorAll('.app-card[data-github-repo]');

        githubCards.forEach(async (card) => {
            const repo = card.getAttribute('data-github-repo');
            const versionEl = card.querySelector('.version');
            const downloadBtn = card.querySelector('.btn-github');
            const downloadsCountEl = card.querySelector('.downloads-count');

            try {
                const response = await fetch(`https://api.github.com/repos/${repo}/releases/latest`);
                if (!response.ok) throw new Error('API Error');

                const data = await response.json();

                // Lấy thông tin tag_name, asset đầu tiên
                const version = data.tag_name || 'v1.0.0';
                const asset = data.assets && data.assets.length > 0 ? data.assets[0] : null;

                if (asset) {
                    const sizeMB = (asset.size / (1024 * 1024)).toFixed(1);
                    versionEl.innerHTML = `Phiên bản: ${version} • ${sizeMB} MB`;
                    downloadBtn.href = asset.browser_download_url;
                    
                    if (downloadsCountEl) {
                        downloadsCountEl.innerHTML = `<i class="fa-solid fa-download"></i> ${asset.download_count} lượt tải`;
                    }
                } else {
                    versionEl.textContent = `Phiên bản: ${version}`;
                    downloadBtn.href = data.html_url;
                }

            } catch (error) {
                console.error(`Lỗi khi tải thông tin từ GitHub (${repo}):`, error);
                versionEl.textContent = 'Phiên bản: Bản phát hành trực tiếp';
                downloadBtn.textContent = 'Đến trang GitHub';
            }
        });
    }
});
