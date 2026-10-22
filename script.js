document.addEventListener('DOMContentLoaded', () => {
    const searchInput = document.getElementById('searchInput');
    const appCards = document.querySelectorAll('.app-card');
    const noResults = document.getElementById('noResults');

    searchInput.addEventListener('input', (e) => {
        const searchTerm = e.target.value.toLowerCase().trim();
        let visibleCount = 0;

        appCards.forEach((card) => {
            // Lấy thông tin tìm kiếm từ attribute 'data-title' và thẻ h3, p
            const searchData = card.getAttribute('data-title').toLowerCase();
            const title = card.querySelector('h3').textContent.toLowerCase();
            const description = card.querySelector('.description').textContent.toLowerCase();

            // Kiểm tra xem từ khóa có khớp không
            if (searchData.includes(searchTerm) || title.includes(searchTerm) || description.includes(searchTerm)) {
                card.classList.remove('hidden');
                visibleCount++;
            } else {
                card.classList.add('hidden');
            }
        });

        // Hiện thông báo nếu không có ứng dụng nào khớp
        if (visibleCount === 0) {
            noResults.classList.remove('hidden');
        } else {
            noResults.classList.add('hidden');
        }
    });
});
