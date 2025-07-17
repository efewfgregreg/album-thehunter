// src/js/views/viewNavigationHub.js

// Renderiza o Hub de Navegação Inicial (Cards principais)
function renderNavigationHub(container) {
    container.innerHTML = '';

    const sections = [
        { title: 'Pelagens', tab: 'pelagens' },
        { title: 'Diamantes', tab: 'diamantes' },
        { title: 'Super Raros', tab: 'super-raros' },
        { title: 'Greats', tab: 'greats' }
    ];

    const grid = document.createElement('div');
    grid.className = 'album-grid';

    sections.forEach(section => {
        const card = document.createElement('div');
        card.className = 'nav-card';
        card.textContent = section.title;
        card.dataset.tab = section.tab;

        card.addEventListener('click', () => {
            document.querySelectorAll('.main-content').forEach(tabContent => {
                tabContent.style.display = (tabContent.dataset.tab === section.tab) ? 'block' : 'none';
            });
        });

        grid.appendChild(card);
    });

    container.appendChild(grid);
}

export { renderNavigationHub };
