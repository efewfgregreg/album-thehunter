// src/js/views/viewMultiMounts.js

// Renderiza a visualização das multi-montarias
function renderMultiMountsView(container) {
    container.innerHTML = '';

    const title = document.createElement('h2');
    title.textContent = 'Multi-Montarias';
    container.appendChild(title);

    const message = document.createElement('p');
    message.textContent = 'Esta é uma área especial para visualização de troféus multi-montaria.';
    container.appendChild(message);

    const placeholder = document.createElement('div');
    placeholder.className = 'multi-mounts-placeholder';
    placeholder.textContent = '🔒 Conteúdo exclusivo!';
    container.appendChild(placeholder);
}

export { renderMultiMountsView };
