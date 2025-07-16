import { reservesData } from '../data.js';

/**
 * Renderiza a seleção de reservas para iniciar sessão de grind
 * @param {HTMLElement} container - Elemento onde inserir a lista
 * @param {Function} onReserveSelected - Callback com slug da reserva selecionada
 */
export function renderReserveSelectionForGrind(container, onReserveSelected) {
  container.innerHTML = `
    <div class="page-header">
      <h2>Escolha uma Reserva</h2>
    </div>
    <div class="overall-progress-grid"></div>
  `;
  const grid = container.querySelector('.overall-progress-grid');

  Object.entries(reservesData).forEach(([slug, { name, image }]) => {
    const card = document.createElement('div');
    card.className = 'reserve-card';
    card.dataset.slug = slug;

    const img = document.createElement('img');
    img.src = image;
    img.alt = name;
    card.appendChild(img);

    const title = document.createElement('span');
    title.textContent = name;
    card.appendChild(title);

    card.onclick = () => onReserveSelected(slug);

    grid.appendChild(card);
  });
}
