/* =================================================================
   ARQUIVO PRINCIPAL DO APP (MAIN.JS) - VERSÃO FINAL V67.0
   ================================================================= */

import { renderLoginForm, setupLogoutButton, closeModal, showCustomAlert } from './auth.js';
import { auth } from './firebase.js';
import { runDataValidation } from './dataValidator.js';
import { setRandomBackground } from './utils.js';
import { TABS, categorias } from './constants.js';
import { createPageHeader } from './components/PageHeader.js';
import { items, reservesData } from '../data/gameData.js';

// Imports das Views
import { renderFeedersView } from './views/feedersView.js';
import { renderDashboardView } from './views/dashboardView.js';
import { renderRouletteView } from './views/rouletteView.js';
import { renderStandardCategoryView } from './views/categoryGridView.js';
import { renderMultiMountsView } from './views/multiMountView.js';
import { showDetailView } from './views/detailView.js';
import { renderGrindHubView, renderGrindCounterView } from './views/grindView.js';
import { renderProgressView } from './views/progressView.js';
import { renderSettingsView } from './views/settingsView.js';
import { renderReservesHub, renderReserveDetails } from './components/ReservesHub.js';
// NOVO IMPORT: CLUBE DE TROFÉUS
import { renderTrophyView } from './views/trophyView.js';

// Serviços
import { loadDataFromFirestore, persistData } from './services/storageService.js';
import { initRouter, pushHistory } from './router.js';

// Variáveis Globais Exportadas
export let currentUser = null;
export let savedData = {};
export const tabScrollPositions = {}; // Necessário para detailView.js

let appContainer; 

export function renderNavigationHub(addToHistory = true) {
    if (addToHistory) pushHistory({ view: 'hub' });
    appContainer.innerHTML = '';
    const dashboardWrapper = document.createElement('div');
    dashboardWrapper.style.width = '100%';
    appContainer.appendChild(dashboardWrapper);

    renderDashboardView(dashboardWrapper, savedData, (targetTab) => {
        renderMainView(targetTab);
    });
}

export function renderMainView(tabKey, addToHistory = true) {
    if (addToHistory) pushHistory({ view: 'category', tabKey: tabKey });

    appContainer.innerHTML = '';
    const mainWrapper = document.createElement('div');
    mainWrapper.className = 'main-content'; 
    appContainer.appendChild(mainWrapper);

    // Lógica para definir o título correto no Header
    let title = 'Seção';
    if (categorias[tabKey]) {
        title = categorias[tabKey].title;
    } else if (tabKey === 'TRATADORES') {
        title = 'Tratadores & Iscas';
    } else if (tabKey === 'ROLETA') {
        title = 'Roleta Tática';
    } else if (tabKey === 'TROPHIES') { // Título da Nova Seção
        title = 'Clube de Troféus';
    } else if (tabKey === TABS.CONFIGURACOES) {
        title = 'Configurações';
    }

    const header = createPageHeader(title, () => renderNavigationHub());
    mainWrapper.appendChild(header);

    const content = document.createElement('div');
    content.className = 'content-container';
    mainWrapper.appendChild(content);

    // ROUTER (Sistema de Navegação)
    if ([TABS.PELAGENS, TABS.DIAMANTES, TABS.GREATS, TABS.SUPER_RAROS].includes(tabKey)) {
        renderStandardCategoryView(content, tabKey);
    } else if (tabKey === TABS.RESERVAS) {
        renderReservesHub(content, reservesData || {}, savedData, (reserveKey) => {
            renderReserveDetails(content, reserveKey, reservesData[reserveKey], savedData, 
                () => renderMainView(TABS.RESERVAS),
                (animalSlug) => showDetailView(animalSlug, TABS.RESERVAS, reserveKey)
            );
        });
    } else if (tabKey === TABS.PROGRESSO) {
        renderProgressView(content);
    } else if (tabKey === TABS.GRIND) {
        renderGrindHubView(content);
    } else if (tabKey === TABS.MONTAGENS) {
        renderMultiMountsView(content);
    } else if (tabKey === TABS.CONFIGURACOES) {
        renderSettingsView(content);
    } else if (tabKey === 'TRATADORES') {
        renderFeedersView(content);
    } else if (tabKey === 'ROLETA') {
        renderRouletteView(content);
    } else if (tabKey === 'TROPHIES') { // NOVA ROTA LIGADA
        renderTrophyView(content);
    }
    
    setupLogoutButton(currentUser, appContainer);
}

export async function saveData(newData) {
    if (!currentUser) return;
    savedData = newData;
    await persistData(currentUser, newData);
}

/**
 * Visualizador de Imagens V2.0 - Correção de Centralização e UI
 * Melhora a visibilidade do botão fechar, estiliza a legenda e centraliza o conteúdo.
 */
/**
 * Visualizador de Imagens V3.0 - "Tactical HUD Edition"
 * Corrige a sobreposição do botão fechar, centraliza a imagem e organiza a hierarquia.
 */
export function openImageViewer(imgSrc, title = '') {
    const modal = document.getElementById('image-viewer-modal');
    if (!modal) return;

    // 1. Injeção de CSS de Interface de Alta Performance
    if (!document.getElementById('viewer-v3-styles')) {
        const style = document.createElement('style');
        style.id = 'viewer-v3-styles';
        style.textContent = `
            #image-viewer-modal {
                display: none; position: fixed; z-index: 99999; left: 0; top: 0; 
                width: 100vw; height: 100vh; background: rgba(0,0,0,0.92);
                backdrop-filter: blur(15px); -webkit-backdrop-filter: blur(15px);
                flex-direction: column; align-items: center; justify-content: center;
                overflow: hidden;
            }
            
            /* BARRA SUPERIOR HUD */
            .viewer-top-hud {
                position: absolute; top: 0; left: 0; width: 100%; height: 90px;
                display: flex; align-items: center; justify-content: space-between;
                padding: 0 50px; background: linear-gradient(180deg, rgba(0,0,0,0.8) 0%, transparent 100%);
                z-index: 100;
            }

            .viewer-title-box {
                background: rgba(0, 188, 212, 0.1); border-left: 4px solid var(--primary-color);
                padding: 10px 25px; border-radius: 4px; display: flex; flex-direction: column;
            }
            .viewer-label-tag { font-size: 0.65rem; color: var(--primary-color); font-weight: 900; letter-spacing: 2px; text-transform: uppercase; margin-bottom: 2px; }
            .viewer-main-title { font-family: 'Bebas Neue', cursive; font-size: 2.2rem; color: #fff; line-height: 1; letter-spacing: 1px; }

            .viewer-close-circle {
                width: 50px; height: 50px; background: rgba(255,255,255,0.05); border: 1px solid rgba(255,255,255,0.1);
                border-radius: 50%; display: flex; align-items: center; justify-content: center;
                cursor: pointer; transition: all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275);
            }
            .viewer-close-circle i { font-size: 1.5rem; color: #fff; }
            .viewer-close-circle:hover { 
                background: #c62828; border-color: #ff5252; transform: rotate(90deg) scale(1.1); 
                box-shadow: 0 0 20px rgba(198, 40, 40, 0.4);
            }

            /* ÁREA DA IMAGEM CENTRALIZADA */
            .viewer-canvas {
                width: 100%; height: 100%; display: flex; align-items: center; justify-content: center;
                padding: 100px 40px 40px 40px; box-sizing: border-box;
            }
            .viewer-img-main {
                max-width: 95%; max-height: 85%; object-fit: contain;
                border-radius: 8px; box-shadow: 0 20px 50px rgba(0,0,0,0.8);
                border: 1px solid rgba(255,255,255,0.05);
            }

            /* DICA DE ZOOM NO RODAPÉ */
            .viewer-footer-tip {
                position: absolute; bottom: 30px; left: 50%; transform: translateX(-50%);
                color: #666; font-size: 0.7rem; text-transform: uppercase; letter-spacing: 2px;
                background: rgba(0,0,0,0.4); padding: 5px 15px; border-radius: 20px;
            }
        `;
        document.head.appendChild(style);
    }

    // 2. Montagem do HTML Tático
    modal.innerHTML = `
        <div class="viewer-top-hud">
            <div class="viewer-title-box">
                <span class="viewer-label-tag">Dossiê de Troféu</span>
                <span class="viewer-main-title">${title || 'Animal Desconhecido'}</span>
            </div>
            <div class="viewer-close-circle" id="btn-close-viewer" title="Fechar Visualização">
                <i class="fas fa-times"></i>
            </div>
        </div>
        <div class="viewer-canvas" id="canvas-trigger">
            <img src="${imgSrc}" class="viewer-img-main" id="img-target">
        </div>
        <div class="viewer-footer-tip"><i class="fas fa-search-plus"></i> Use o Scroll para dar Zoom</div>
    `;

    modal.style.display = "flex";

    // 3. Inicialização do Zoom
    const imgElement = modal.querySelector('#img-target');
    if (typeof panzoom !== 'undefined') {
        panzoom(imgElement, {
            maxZoom: 5,
            minZoom: 0.5,
            bounds: true,
            boundsPadding: 0.1
        });
    }

    // 4. Lógica de Encerramento Segura
    const closeViewer = () => {
        modal.style.display = "none";
        modal.innerHTML = '';
    };

    modal.querySelector('#btn-close-viewer').onclick = closeViewer;
    modal.querySelector('#canvas-trigger').onclick = (e) => {
        if (e.target.id === 'canvas-trigger') closeViewer();
    };
    
    // Fechar com tecla ESC
    const escHandler = (e) => { if (e.key === "Escape") { closeViewer(); document.removeEventListener('keydown', escHandler); } };
    document.addEventListener('keydown', escHandler);
}

document.addEventListener('resume-grind', (e) => {
    const { sessionId } = e.detail;
    if (sessionId) {
        pushHistory({ view: 'grind-counter', sessionId });
        appContainer.innerHTML = '';
        const mainWrapper = document.createElement('div');
        mainWrapper.className = 'main-content'; 
        mainWrapper.innerHTML = `<div class="page-header"><h2>Carregando...</h2><button class="back-button"></button></div><div class="content-container"></div>`;
        appContainer.appendChild(mainWrapper);
        renderGrindCounterView(sessionId);
    }
});

// Inicialização
document.addEventListener('DOMContentLoaded', () => {
    const storedTheme = localStorage.getItem('theme');
    if (storedTheme === 'light') document.body.classList.add('light-theme');

    const storedColor = localStorage.getItem('customThemeColor');
    if (storedColor) {
        const r = parseInt(storedColor.slice(1, 3), 16);
        const g = parseInt(storedColor.slice(3, 5), 16);
        const b = parseInt(storedColor.slice(5, 7), 16);
        document.documentElement.style.setProperty('--primary-color', storedColor);
        document.documentElement.style.setProperty('--primary-rgb', `${r}, ${g}, ${b}`);
    }

    initRouter();
    setRandomBackground();
    appContainer = document.getElementById('app-container');

    auth.onAuthStateChanged(async (user) => {
        if (user) {
            currentUser = user;
            savedData = await loadDataFromFirestore(user);
            setupLogoutButton(currentUser, document.body); 
            renderNavigationHub();
        } else {
            currentUser = null;
            renderLoginForm(appContainer);
        }
    });
    runDataValidation();
});

// EXPORTAÇÕES FINAIS
export { 
    closeModal,
    showCustomAlert
};