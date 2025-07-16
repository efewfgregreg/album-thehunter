// src/js/views/viewReserveSelection.js

import { reservesData } from '../data.js';

/**
 * Renderiza a seleção de reservas para iniciar sessão de grind
 * @param {HTMLElement} container - Elemento onde inserir a lista
 * @param {Function} onReserveSelected - Callback com slug da reserva selecionada
 */
export function renderReserveSelectionForGrind(container, onReserveSelected) {
  container.innerHTML = `
    <h2>Escolha uma Reserva para Grind</h2>
    <div class="reserve-grid"></div>
  `;
  const grid = container.querySelector('.reserve-grid');

  Object.entries(reservesData).forEach(([slug, { name, image }]) => {
    const card = document.createElement('div');
    card.className = 'reserve-card';

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