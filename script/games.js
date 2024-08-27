const gameSearch = document.getElementById('game-search');
        const searchButton = document.getElementById('search-button');
        const categorySelect = document.getElementById('category-select');
        const gameCards = document.querySelectorAll('.game-card');

        function filterGames() {
            const searchTerm = gameSearch.value.toLowerCase();
            const selectedCategory = categorySelect.value;

            gameCards.forEach(card => {
                const title = card.querySelector('h3').textContent.toLowerCase();
                const category = card.dataset.category;
                const matchesSearch = title.includes(searchTerm);
                const matchesCategory = selectedCategory === 'all' || category === selectedCategory;

                if (matchesSearch && matchesCategory) {
                    card.style.display = 'block';
                } else {
                    card.style.display = 'none';
                }
            });
        }

        searchButton.addEventListener('click', filterGames);
        gameSearch.addEventListener('keyup', filterGames);
        categorySelect.addEventListener('change', filterGames);