// src/js/progressBarManager.js

/**
 * Gera e atualiza uma mini barra de progresso de preenchimento
 * @param {HTMLElement} container Elemento HTML onde a barra será renderizada
 * @param {number} total Total de itens possíveis
 * @param {number} completed Quantos itens foram completados
 */
function renderMiniProgressBar(container, total, completed) {
    container.innerHTML = '';

    const wrapper = document.createElement('div');
    wrapper.className = 'mini-progress-bar-container';

    const bar = document.createElement('div');
    bar.className = 'mini-progress-bar';

    const percentage = (total > 0) ? (completed / total) * 100 : 0;
    bar.style.width = `${percentage}%`;

    const text = document.createElement('span');
    text.className = 'mini-progress-text';
    text.textContent = `${completed}/${total}`;

    wrapper.appendChild(bar);
    wrapper.appendChild(text);
    container.appendChild(wrapper);
}

export { renderMiniProgressBar };