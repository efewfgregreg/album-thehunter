// app.js
// Arquivo principal que integra Firebase, dados e UI

import { auth, loadUserData, saveUserData } from './services/firebaseService.js';
import {
  initializeUI,
  renderAnimalGrid,
  renderDetailView,
  updateProgressPanel,
  renderMultiMountsView,
  renderReservesView
} from './uiRenderer.js';
import {
  rareFursData,
  greatsFursData,
  diamondFursData,
  items,
  multiMountsData,
  reservesData,
  animalHotspotData
} from './data.js';

// Autenticação e carregamento inicial
auth.onAuthStateChanged(async user => {
  if (user) {
    try {
      const userData = await loadUserData();
      initializeUI();
      // Renderiza grids principais
      renderAnimalGrid(document.getElementById('rare-grid'), rareFursData, 'rare');
      renderAnimalGrid(document.getElementById('great-grid'), greatsFursData, 'great');
      renderAnimalGrid(document.getElementById('diamond-grid'), diamondFursData, 'diamond');
      // Renderiza montarias e reservas
      renderMultiMountsView(document.getElementById('mounts-container'), multiMountsData);
      renderReservesView(document.getElementById('reserves-container'), reservesData);
      // Atualiza painel de progresso
      updateProgressPanel(document.getElementById('progress-panel-main-container'), userData);
    } catch (err) {
      console.error('Erro ao carregar dados do usuário:', err);
    }
  } else {
    // Redirecionar para login ou exibir componente de autenticação
    window.location.href = '/login.html';
  }
});

// Exemplo de salvamento automático ao fechar a aba
window.addEventListener('beforeunload', async () => {
  try {
    const container = document.getElementById('progress-panel-main-container');
    // Supondo que userData tenha sido mantido em memória global
    await saveUserData(window.currentUserData);
  } catch (err) {
    console.error('Erro ao salvar dados antes de sair:', err);
  }
});

// Evento de logout
document.getElementById('logout-button')?.addEventListener('click', () => {
  auth.signOut();
});
