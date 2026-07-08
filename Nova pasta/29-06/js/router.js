// js/router.js
import { renderNavigationHub, renderMainView } from './main.js';
import { showDetailView } from './views/detailView.js';

/**
 * Inicializa o escutador de eventos do botão "Voltar" do navegador.
 * Deve ser chamado apenas uma vez no carregamento do App.
 */
export function initRouter() {
    window.addEventListener('popstate', (event) => {
        if (event.state) {
            if (event.state.view === 'hub') renderNavigationHub(false);
            else if (event.state.view === 'category') renderMainView(event.state.tabKey, false);
            else if (event.state.view === 'detail') showDetailView(event.state.name, event.state.tabKey, event.state.originReserve, false);
        } else {
            renderNavigationHub(false);
        }
    });
}

/**
 * Adiciona uma nova entrada no histórico do navegador sem duplicar estados.
 */
export function pushHistory(stateObj) {
    const currentState = history.state;
    // Evita adicionar a mesma página repetidamente no histórico
    if (!currentState || currentState.view !== stateObj.view || currentState.name !== stateObj.name) {
        history.pushState(stateObj, '', '');
    }
}