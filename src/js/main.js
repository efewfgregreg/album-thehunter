import { auth, loadDataFromFirestore, saveData } from './firebase.js';
import { setupPelagensTab } from './tabs/tab-pelagens.js';
import { setupDiamantesTab } from './tabs/tab-diamantes.js';
import { setupSuperRarosTab } from './tabs/tab-super-raros.js';
import { setupGreatsTab } from './tabs/tab-greats.js';
import { closeModal } from './ui.js';
import { renderReserveSelection } from './views/viewReserveSelection.js';

let currentData = {};

window.addEventListener('DOMContentLoaded', () => {
  auth.onAuthStateChanged(async user => {
    if (user) {
      currentData = await loadDataFromFirestore();
      initializeApp();
    } else {
      auth.signInAnonymously().catch(console.error);
    }
  });
});

function initializeApp() {
  const app = document.getElementById('app-container');

  const nav = document.createElement('div');
  nav.className = 'tab-nav';
  nav.innerHTML = `
    <button id="btn-pelagens">Pelagens</button>
    <button id="btn-diamantes">Diamantes</button>
    <button id="btn-super-raros">Super Raros</button>
    <button id="btn-greats">Greats</button>
  `;
  app.appendChild(nav);

  const content = document.createElement('div');
  content.id = 'tab-content';
  app.appendChild(content);

  const buttons = {
    pelagens: document.getElementById('btn-pelagens'),
    diamantes: document.getElementById('btn-diamantes'),
    super_raros: document.getElementById('btn-super-raros'),
    greats: document.getElementById('btn-greats')
  };

  Object.entries(buttons).forEach(([key, button]) => {
    button.onclick = () => showTab(key);
  });

  function showTab(key) {
    content.innerHTML = '';

    Object.values(buttons).forEach(btn => btn.classList.remove('active'));
    buttons[key].classList.add('active');

    switch (key) {
      case 'pelagens':
        setupPelagensTab(content, currentData, saveData);
        break;
      case 'diamantes':
        setupDiamantesTab(content, currentData, saveData);
        break;
      case 'super_raros':
        setupSuperRarosTab(content, currentData, saveData);
        break;
      case 'greats':
        setupGreatsTab(content, currentData, saveData);
        break;
    }

    window.scrollTo(0, 0);
  }

  showTab('pelagens');

  window.closeModal = closeModal;
}
function loadInitialScreen() {
  const reserves = [
    { id: 'reserve1', name: 'Reserva do Norte' },
    { id: 'reserve2', name: 'Reserva do Sul' },
    { id: 'reserve3', name: 'Reserva Oeste' }
  ];

  renderReserveSelection(reserves, (selectedReserveId) => {
    console.log('Reserva selecionada:', selectedReserveId);
    // Aqui você pode chamar seu roteador ou trocar para a tab correspondente
  });
}
