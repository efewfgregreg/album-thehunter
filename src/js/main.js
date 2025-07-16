// src/js/main.js

import { auth, loadDataFromFirestore, saveData } from './firebase.js';
import { rareFursData, diamondFursData, greatsFursData, reservesData, items, animalHotspotData, multiMountsData } from './data.js';
import { openImageViewer, closeModal, showCustomAlert, updateCardAppearance, slugify } from './ui.js';
import { setupPelagensTab } from './tabs/tab-pelagens.js';
import { setupDiamantesTab } from './tabs/tab-diamantes.js';
import { setupSuperRarosTab } from './tabs/tab-super-raros.js';
import { setupGreatsTab } from './tabs/tab-greats.js';

let currentData = {};

// Inicialização após DOM carregado
window.addEventListener('DOMContentLoaded', () => {
  // Listener de autenticação
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

  // Criar barra de navegação
  const nav = document.createElement('div');
  nav.className = 'tab-nav';
  nav.innerHTML = `
    <button id="btn-pelagens">Pelagens</button>
    <button id="btn-diamantes">Diamantes</button>
    <button id="btn-super-raros">Super Raros</button>
    <button id="btn-greats">Greats</button>
  `;
  app.appendChild(nav);

  // Conteúdo das abas
  const content = document.createElement('div');
  content.id = 'tab-content';
  app.appendChild(content);

  // Mudar de aba
  document.getElementById('btn-pelagens').onclick = () => showTab('pelagens');
  document.getElementById('btn-diamantes').onclick = () => showTab('diamantes');
  document.getElementById('btn-super-raros').onclick = () => showTab('super_raros');
  document.getElementById('btn-greats').onclick = () => showTab('greats');

  // Função para renderizar aba
  function showTab(key) {
    content.innerHTML = '';
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
  }

  // Exibir aba inicial
  showTab('pelagens');

  // Fechar modais ao clicar no X
  window.closeModal = closeModal;
}
