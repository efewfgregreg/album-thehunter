// =================================================================
// ========================== MÓDULOS ==============================
// =================================================================
import { renderLoginForm, setupLogoutButton, closeModal, showCustomAlert } from './auth.js';
import { auth } from './firebase.js';
import { runDataValidation } from './dataValidator.js';
import { slugify, setRandomBackground, debounce } from './utils.js';
import { TABS, categorias } from './constants.js';
import { createPageHeader } from './components/PageHeader.js';
import { createSettingsPanel } from './components/SettingsPanel.js';
import { createNavigationCard } from './components/NavigationCard.js';
import { items, greatsFursData, reservesData } from '../data/gameData.js';

// Importação do Motor de Navegação (Router)
import { initRouter, pushHistory } from './router.js';

// Importações de Serviços e Lógica de Dados
import { getDefaultDataStructure, loadDataFromFirestore, persistData } from './services/storageService.js';
import { renderStandardCategoryView } from './views/categoryGridView.js';

// Importações das Views (Interface do Usuário)
import { renderMultiMountsView } from './views/multiMountView.js';
import { showDetailView, updateCardAppearance } from './views/detailView.js';
import { renderHuntingRankingView } from './views/hallOfFameView.js';
import { renderGrindHubView, renderGrindCounterView } from './views/grindView.js';
import { renderProgressView, updateNewProgressPanel } from './views/progressView.js';
import { renderSettingsView } from './views/settingsView.js';

// --- NOVOS COMPONENTES (ADICIONADO) ---
import { renderReservesHub, renderReserveDetails } from './components/ReservesHub.js';

// =================================================================
// =================== VARIÁVEIS GLOBAIS DO APP ====================
// =================================================================
export let currentUser = null;
export let savedData = {};
export let tabScrollPositions = {};
let appContainer; 

// =================================================================
// =================== LÓGICA DE RENDERIZAÇÃO ======================
// =================================================================

/**
 * Renderiza o Menu Principal (Hub).
 */
export function renderNavigationHub(addToHistory = true) {
    if (addToHistory) pushHistory({ view: 'hub' });
    
    appContainer.innerHTML = '';
    const hub = document.createElement('div');
    hub.className = 'navigation-hub design-flutuante';

    const title = document.createElement('h1');
    title.className = 'hub-title design-flutuante';
    title.textContent = 'Registro do Caçador';
    hub.appendChild(title);

    const cardsContainer = document.createElement('div');
    cardsContainer.className = 'cards-container-flutuante';

    Object.keys(categorias).forEach(key => {
        const cat = categorias[key];
        const card = createNavigationCard({
            key: key,
            title: cat.title,
            icon: cat.icon,
            isHtml: cat.isHtml,
            onClick: () => renderMainView(key)
        });
        cardsContainer.appendChild(card);
    });

    hub.appendChild(cardsContainer);
    appContainer.appendChild(hub);
}

/**
 * Renderiza a visualização principal de cada aba/categoria.
 */
export function renderMainView(tabKey, addToHistory = true) {
    if (addToHistory) pushHistory({ view: 'category', tabKey: tabKey });

    appContainer.innerHTML = '';
    
    const mainWrapper = document.createElement('div');
    mainWrapper.className = 'main-content'; 
    appContainer.appendChild(mainWrapper);

    const cat = categorias[tabKey];
    const header = createPageHeader(cat.title, () => renderNavigationHub());
    mainWrapper.appendChild(header);

    const content = document.createElement('div');
    content.className = 'content-container';
    mainWrapper.appendChild(content);

    // Roteamento interno de abas
    if ([TABS.PELAGENS, TABS.DIAMANTES, TABS.GREATS, TABS.SUPER_RAROS].includes(tabKey)) {
        renderStandardCategoryView(content, tabKey);
    } else if (tabKey === TABS.RESERVAS) {
        const rData = reservesData || {}; 
        
        renderReservesHub(content, rData, savedData, (reserveKey) => {
            // Callback: Entrar na Reserva
            renderReserveDetails(
                content, 
                reserveKey, 
                rData[reserveKey], 
                savedData, 
                // Callback 1: Voltar para Lista de Reservas
                () => renderMainView(TABS.RESERVAS),
                // Callback 2: Clicou num animal (CORREÇÃO DE NAVEGAÇÃO AQUI)
                (animalSlug) => {
                    // Agora informa que a origem é RESERVAS e passa a chave da reserva
                    showDetailView(animalSlug, TABS.RESERVAS, reserveKey); 
                }
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
    }

    setupLogoutButton(currentUser, appContainer);
}

// =================================================================
// ==================== FUNÇÕES GLOBAIS ÚTEIS ======================
// =================================================================

export async function saveData(newData) {
    if (!currentUser) {
        console.error("Tentativa de salvar sem usuário logado.");
        return;
    }
    savedData = newData;
    await persistData(currentUser, newData);
}

export function openImageViewer(src, altText = 'Imagem') {
    const viewer = document.createElement('div');
    viewer.className = 'image-viewer-overlay';
    viewer.style.cssText = `
        position: fixed; top: 0; left: 0; width: 100%; height: 100%;
        background: rgba(0,0,0,0.95); z-index: 2000;
        display: flex; align-items: center; justify-content: center;
        opacity: 0; transition: opacity 0.3s ease; backdrop-filter: blur(5px);
    `;

    const img = document.createElement('img');
    img.src = src;
    img.alt = altText;
    img.style.cssText = `
        max-width: 90%; max-height: 90%; 
        box-shadow: 0 0 30px rgba(0,0,0,0.8); border-radius: 4px;
        transform: scale(0.9); transition: transform 0.3s ease;
        border: 2px solid var(--primary-color);
    `;

    viewer.addEventListener('click', (e) => {
        if (e.target === viewer) closeViewer();
    });

    const closeBtn = document.createElement('button');
    closeBtn.innerHTML = '<i class="fa-solid fa-times"></i>';
    closeBtn.style.cssText = `
        position: absolute; top: 20px; right: 20px;
        background: transparent; border: none; color: #fff;
        font-size: 2.5rem; cursor: pointer; z-index: 2001;
        text-shadow: 0 2px 10px rgba(0,0,0,0.5);
    `;
    closeBtn.onclick = closeViewer;

    viewer.appendChild(img);
    viewer.appendChild(closeBtn);
    document.body.appendChild(viewer);

    requestAnimationFrame(() => {
        viewer.style.opacity = '1';
        img.style.transform = 'scale(1)';
    });

    function closeViewer() {
        viewer.style.opacity = '0';
        img.style.transform = 'scale(0.9)';
        setTimeout(() => viewer.remove(), 300);
    }
}

// =================================================================
// ==================== INICIALIZAÇÃO DO APP =======================
// =================================================================

document.addEventListener('DOMContentLoaded', () => {
    // Inicialização de Temas
    const storedTheme = localStorage.getItem('theme');
    if (storedTheme === 'light') {
        document.body.classList.add('light-theme');
    }

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
            const logoutCont = document.getElementById('logout-container');
            if (logoutCont) logoutCont.remove();
            renderLoginForm(appContainer);
        }
    });

    runDataValidation();
});

export { 
    closeModal,
    showCustomAlert,
    getDefaultDataStructure
};