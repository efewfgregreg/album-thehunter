export function loadInitialScreen() {
  const app = document.getElementById('app');
  app.innerHTML = `
    <div class="reserve-selection">
      <h2>Escolha uma Reserva</h2>
      <button onclick="selectReserve('Reserva A')">Reserva A</button>
      <button onclick="selectReserve('Reserva B')">Reserva B</button>
    </div>
  `;
}

window.selectReserve = function(reserveName) {
  sessionStorage.setItem('selectedReserve', reserveName);
  document.querySelector('.tabs').style.display = 'flex';
  document.getElementById('app').innerHTML = ''; // Limpa tela inicial
  loadTabs(); // ou qualquer função que ativa suas tabs
}
