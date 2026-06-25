export function initSearch() {
    // Lógica de Buscador y Filtros (Tienda y Blog)
    const searchInput = document.getElementById('product-search') || document.getElementById('blog-search');
    const filterBtns = document.querySelectorAll('.filter-btn');
    const itemCards = document.querySelectorAll('.product-card, .blog-card');
    const noResultsMsg = document.getElementById('no-results-msg');

    if ((searchInput || filterBtns.length > 0) && itemCards.length > 0) {
        let currentCategory = 'todos';
        let currentSearchTerm = '';

        // Caché del DOM: Leemos la información de los items una sola vez para rendimiento
        const itemsData = Array.from(itemCards).map(card => {
            return {
                element: card,
                category: card.getAttribute('data-category'),
                title: (card.querySelector('h3')?.textContent || card.querySelector('h2')?.textContent || '').toLowerCase(),
                description: (card.querySelector('p')?.textContent || '').toLowerCase()
            };
        });

        const filterItems = () => {
            let visibleCount = 0;
            
            itemsData.forEach(item => {
                const matchesCategory = currentCategory === 'todos' || item.category === currentCategory;
                const matchesSearch = item.title.includes(currentSearchTerm) || item.description.includes(currentSearchTerm);

                if (matchesCategory && matchesSearch) {
                    item.element.style.display = ''; // Restaura el display natural
                    visibleCount++;
                } else {
                    item.element.style.display = 'none'; // Oculta el elemento
                }
            });

            // Mostrar u ocultar el mensaje de "No se encontraron resultados"
            if (noResultsMsg) {
                if (visibleCount === 0) {
                    noResultsMsg.classList.remove('hidden');
                } else {
                    noResultsMsg.classList.add('hidden');
                }
            }
        };

        if (searchInput) {
            searchInput.addEventListener('input', (e) => {
                currentSearchTerm = e.target.value.toLowerCase().trim();
                filterItems();
            });
        }

        filterBtns.forEach(btn => {
            btn.addEventListener('click', (e) => {
                currentCategory = e.target.getAttribute('data-category');
                filterBtns.forEach(b => {
                    b.classList.remove('bg-accent', 'text-white', 'border-accent');
                    b.classList.add('bg-white', 'dark:bg-brand-darker', 'text-gray-600', 'dark:text-gray-300', 'hover:bg-gray-50', 'dark:hover:bg-brand-dark');
                    b.setAttribute('aria-pressed', 'false');
                });
                e.target.classList.remove('bg-white', 'dark:bg-brand-darker', 'text-gray-600', 'dark:text-gray-300', 'hover:bg-gray-50', 'dark:hover:bg-brand-dark');
                e.target.classList.add('bg-accent', 'text-white', 'border-accent');
                e.target.setAttribute('aria-pressed', 'true');
                filterItems();
            });
        });
    }
}