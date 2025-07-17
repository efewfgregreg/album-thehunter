// src/js/views/viewNavigationHub.js

function renderNavigationHub(container) {
    container.innerHTML = '';

    const grid = document.createElement('div');
    grid.className = 'album-grid';

    const sections = [
        { title: 'Pelagens', tab: 'pelagens' },
        { title: 'Diamantes', tab: 'diamantes' },
        { title: 'Super Raros', tab: 'super-raros' },
        { title: 'Great Ones', tab: 'greats' },
        { title: 'Sala de Troféus', tab: 'trophy-room' },
        { title: 'Multi-Montarias', tab: 'multi-mounts' }
    ];

    sections.forEach(section => {
        const card = document.createElement('div');
        card.className = 'nav-card';
        card.textContent = section.title;

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
