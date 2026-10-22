document.addEventListener('DOMContentLoaded', () => {
    const searchInput = document.getElementById('searchInput');
    const filterBtns = document.querySelectorAll('.filter-btn');
    const appCards = document.querySelectorAll('.app-card');
    const noResults = document.getElementById('noResults');
    const themeToggleBtn = document.getElementById('themeToggle');

    // Các phần tử Modal
    const appModal = document.getElementById('appModal');
    const modalClose = document.getElementById('modalClose');
    const modalTitle = document.getElementById('modalTitle');
    const modalIcon = document.getElementById('modalIcon');
    const modalVersion = document.getElementById('modalVersion');
    const modalDescription = document.getElementById('modalDescription');
    const modalChangelog = document.getElementById('modalChangelog');
    const modalRequirements = document.getElementById('modalRequirements');
    const modalScreenshot = document.getElementById('modalScreenshot');
    const screenshotSection = document.getElementById('screenshotSection');
    const modalDownloadBtn = document.getElementById('modalDownloadBtn');

    let currentFilter = 'all';
    let totalDownloadSum = 0;

    // 1. Khởi tạo & Cập nhật Thống kê hệ thống
    document.getElementById('totalAppsCount').textContent = appCards.length;

    // 2. Xử lý Dark Mode
    initTheme();
    themeToggleBtn.addEventListener('click', toggleTheme);

    // 3. Tự động lấy dữ liệu từ GitHub API
    initGitHubReleases();

    // 4. Tìm kiếm & Lọc Danh mục
    searchInput.addEventListener('input', filterApps);

    filterBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            filterBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            currentFilter = btn.getAttribute('data-filter');
            filterApps();
        });
    });

    // 5. Xử lý sự kiện mở Modal xem chi tiết
    appCards.forEach(card => {
        const detailBtn = card.querySelector('.btn-detail-view');
        detailBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            openModal(card);
        });
    });

    modalClose.addEventListener('click', closeModal);
    appModal.addEventListener('click', (e) => {
        if (e.target === appModal) closeModal();
    });

    // --- CÁC HÀM XỬ LÝ (FUNCTIONS) ---

    function initTheme() {
        const savedTheme = localStorage.getItem('theme') || 'light';
        document.documentElement.setAttribute('data-theme', savedTheme);
        updateThemeIcon(savedTheme);
    }

    function toggleTheme() {
        const currentTheme = document.documentElement.getAttribute('data-theme');
        const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
        document.documentElement.setAttribute('data-theme', newTheme);
        localStorage.setItem('theme', newTheme);
        updateThemeIcon(newTheme);
    }

    function updateThemeIcon(theme) {
        const icon = themeToggleBtn.querySelector('i');
        if (theme === 'dark') {
            icon.className = 'fa-solid fa-sun';
        } else {
            icon.className = 'fa-solid fa-moon';
        }
    }

    function openModal(card) {
        const title = card.querySelector('h3').textContent;
        const iconHTML = card.querySelector('.app-icon').innerHTML;
        const iconClass = card.querySelector('.app-icon').className;
        const version = card.querySelector('.version').textContent;
        const description = card.querySelector('.description').textContent;
        const changelog = card.getAttribute('data-changelog') || 'Chưa có nhật ký cập nhật.';
        const requirements = card.getAttribute('data-requirements') || 'Không có yêu cầu đặc biệt.';
        const screenshot = card.getAttribute('data-screenshots');
        const downloadLink = card.querySelector('.btn-download').href;

        modalTitle.textContent = title;
        modalIcon.innerHTML = iconHTML;
        modalIcon.className = iconClass;
        modalVersion.textContent = version;
        modalDescription.textContent = description;
        modalChangelog.textContent = changelog;
        modalRequirements.textContent = requirements;
        modalDownloadBtn.href = downloadLink;

        if (screenshot) {
            modalScreenshot.src = screenshot;
            screenshotSection.classList.remove('hidden');
        } else {
            screenshotSection.classList.add('hidden');
        }

        appModal.classList.remove('hidden');
    }

    function closeModal() {
        appModal.classList.add('hidden');
    }

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

    async function initGitHubReleases() {
        const githubCards = document.querySelectorAll('.app-card[data-github-repo]');

        for (const card of githubCards) {
            const repo = card.getAttribute('data-github-repo');
            const versionEl = card.querySelector('.version');
            const downloadBtn = card.querySelector('.btn-github');
            const downloadsCountEl = card.querySelector('.downloads-count');

            try {
                const response = await fetch(`https://api.github.com/repos/${repo}/releases/latest`);
                if (!response.ok) throw new Error('API Error');

                const data = await response.json();
                const version = data.tag_name || 'v1.0.0';
                const asset = data.assets && data.assets.length > 0 ? data.assets[0] : null;

                if (asset) {
                    const sizeMB = (asset.size / (1024 * 1024)).toFixed(1);
                    versionEl.innerHTML = `Phiên bản: ${version} • ${sizeMB} MB`;
                    downloadBtn.href = asset.browser_download_url;
                    
                    if (downloadsCountEl) {
                        downloadsCountEl.innerHTML = `<i class="fa-solid fa-download"></i> ${asset.download_count} lượt tải`;
                    }
                    totalDownloadSum += asset.download_count;
                }
            } catch (error) {
                versionEl.textContent = 'Phiên bản: Trực tiếp';
            }
        }

        const totalDownloadsEl = document.getElementById('totalDownloadsCount');
        if (totalDownloadsEl && totalDownloadSum > 0) {
            totalDownloadsEl.textContent = totalDownloadSum.toLocaleString('vi-VN');
        }
    }
});
