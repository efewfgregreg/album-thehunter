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
    // Cria o card
    const card = document.createElement('div');
    card.className = 'reserve-card';

    // Imagem principal da reserva
    const img = document.createElement('img');
    img.src = image;
    img.alt = name;
    img.classList.add('reserve-image');
    card.appendChild(img);

    // Nome da reserva abaixo da imagem
    const nameElem = document.createElement('div');
    nameElem.classList.add('reserve-name');
    nameElem.textContent = name;
    card.appendChild(nameElem);

    // Clique dispara seleção
    card.onclick = () => onReserveSelected(slug);

    grid.appendChild(card);
  });
}
