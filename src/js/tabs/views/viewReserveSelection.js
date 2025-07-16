export function renderReserveSelection(reserves, onSelectCallback) {
  const app = document.getElementById('app-container');
  app.innerHTML = `
    <div class="reserve-selection">
      <h2>Selecione sua Reserva</h2>
      <div class="reserve-list">
        ${reserves.map(reserve => `
          <button class="reserve-button" data-id="${reserve.id}">
            ${reserve.name}
          </button>
        `).join('')}
      </div>
    </div>
  `;

  document.querySelectorAll('.reserve-button').forEach(button => {
    button.addEventListener('click', (e) => {
      const id = e.target.getAttribute('data-id');
      onSelectCallback(id);

      document.querySelector('.tabs').style.display = 'block';  // Exibe tabs após seleção
    });
  });
}
