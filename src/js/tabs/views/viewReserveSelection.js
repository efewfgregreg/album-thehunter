// src/js/views/viewReserveSelection.js

export function renderReserveSelection(reserves, onSelectCallback) {
  const container = document.getElementById('app');
  container.innerHTML = `
    <h1 class="app-header">Selecione uma Reserva</h1>
    <div class="reserve-list">
      ${reserves.map(reserve => `
        <button class="reserve-button" data-reserve="${reserve.id}">
          ${reserve.name}
        </button>
      `).join('')}
    </div>
  `;

  document.querySelectorAll('.reserve-button').forEach(button => {
    button.addEventListener('click', () => {
      const reserveId = button.getAttribute('data-reserve');
      onSelectCallback(reserveId);
    });
  });
}
