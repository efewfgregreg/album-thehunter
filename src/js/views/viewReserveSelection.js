// src/js/views/viewReserveSelection.js

import { reservesData } from '../data.js';

// Função para renderizar a seleção de reservas
function renderReserveSelection(container) {
    container.innerHTML = '';

    Object.keys(reservesData).forEach(reserveKey => {
        const reserve = reservesData[reserveKey];

        const card = document.createElement('div');
        card.className = 'reserve-card';

        const image = document.createElement('img');
        image.src = reserve.image;
        image.alt = reserve.name;

        const title = document.createElement('h3');
        title.textContent = reserve.name;

        card.appendChild(image);
        card.appendChild(title);
        container.appendChild(card);

        card.addEventListener('click', () => {
            alert(`Reserva selecionada: ${reserve.name}`);
            // Lógica para navegação ou filtragem específica pode ser aplicada aqui
        });
    });
}

export { renderReserveSelection };
