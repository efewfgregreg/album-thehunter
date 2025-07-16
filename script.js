// ========================================================================
// ========================== 1. IMPORTAÇÕES ==============================
// ========================================================================
// O Orquestrador importa todos os módulos que ele precisa controlar.

import * as Data from './data.js';
import * as Utils from './utils.js';
import * as FirebaseService from './firebase-service.js';
import * as AuthUI from './auth.js';
import * as ProgressUI from './ui/progress.js';
import * as GrindUI from './ui/grind.js';
import * as AlbumViews from './ui/album-views.js';

// ========================================================================
// ========================== 2. ESTADO GLOBAL ============================
// ========================================================================
// Variáveis que mantêm o estado da aplicação enquanto ela está rodando.

let currentUser = null;
let savedData = {};
let appContainer;

// ========================================================================
// ========================== 3. CONTROLE PRINCIPAL =======================
// ========================================================================

/**
 * Função central para salvar dados. Atualiza o estado local, o cache
 * e envia para o Firestore.
 * @param {object} newData - O novo objeto de dados a ser salvo.
 */
async function saveData(newData) {
    savedData = newData;
    localStorage.setItem('theHunterSavedData', JSON.stringify(savedData));

    try {
        await FirebaseService.saveDataToFirestore(currentUser, savedData);
    } catch (error) {
        console.error("Falha ao salvar na nuvem:", error);
        showCustomAlert('Erro ao sincronizar com a nuvem. Seu progresso está salvo localmente.', 'Erro');
    }
}

/**
 * Roteador principal. Decide qual módulo de UI deve renderizar a tela.
 * @param {string} tabKey - A chave da categoria a ser renderizada.
 */
function renderMainView(tabKey) {
    const header = document.createElement('div');
    header.className = 'page-header';
    const title = document.createElement('h2');
    title.textContent = Data.categorias[tabKey]?.title || 'Álbum de Caça';
    const backButton = document.createElement('button');
    backButton.className = 'back-button';
    backButton.innerHTML = '&larr; Voltar ao Menu';
    backButton.onclick = renderNavigationHub;
    header.appendChild(title);
    header.appendChild(backButton);

    const contentContainer = document.createElement('div');
    contentContainer.className = `content-container ${tabKey}-view`;

    const mainContent = document.createElement('div');
    mainContent.className = 'main-content';
    mainContent.appendChild(header);
    mainContent.appendChild(contentContainer);

    appContainer.innerHTML = '';
    appContainer.appendChild(mainContent);
    AuthUI.setupLogoutButton(header, currentUser);

    // Delega a renderização para o módulo de UI correto
    switch (tabKey) {
        case 'progresso':
            ProgressUI.renderProgressView(contentContainer);
            break;
        case 'grind':
            GrindUI.renderGrindHubView(contentContainer);
            break;
        case 'reservas':
            AlbumViews.renderReservesList(contentContainer);
            break;
        case 'montagens':
            AlbumViews.renderMultiMountsView(contentContainer, savedData);
            break;
        default:
            AlbumViews.renderAnimalListView(contentContainer, tabKey, savedData);
            break;
    }
}

/**
 * Renderiza o hub de navegação inicial.
 */
function renderNavigationHub() {
    appContainer.innerHTML = '';
    AlbumViews.renderNavigationHub(appContainer);
    // Adiciona o botão de logout ao header específico do hub
    const hubHeader = document.createElement('div');
    hubHeader.className = 'page-header-logout-only';
    appContainer.prepend(hubHeader);
    AuthUI.setupLogoutButton(hubHeader, currentUser);
}

// ========================================================================
// ========================== 4. INICIALIZAÇÃO DO APP =====================
// ========================================================================

document.addEventListener('DOMContentLoaded', () => {
    appContainer = document.getElementById('app-container');

    FirebaseService.auth.onAuthStateChanged(async (user) => {
        if (user) {
            currentUser = user;
            appContainer.innerHTML = `<div class="loading-spinner">Carregando seus dados...</div>`;
            savedData = await FirebaseService.loadDataFromFirestore(user);
            localStorage.setItem('theHunterSavedData', JSON.stringify(savedData));

            // Prepara o pacote de dependências que os módulos precisam
            const dependencies = {
                savedData,
                currentUser,
                ...Data,
                ...Utils,
                onSave: saveData,
                onNavigate: renderMainView,
                showCustomAlert: showCustomAlert,
                getAggregatedGrindStats: GrindUI.getAggregatedGrindStats,
            };

            // Inicializa todos os módulos, injetando suas dependências
            AuthUI.initAuth({ ...dependencies, auth: FirebaseService.auth });
            AlbumViews.initAlbumViews(dependencies);
            ProgressUI.initProgress(dependencies);
            GrindUI.initGrind(dependencies);
            
            renderNavigationHub();
        } else {
            currentUser = null;
            savedData = {};
            localStorage.removeItem('theHunterSavedData');
            AuthUI.initAuth({ auth: FirebaseService.auth });
            AuthUI.renderLoginForm(appContainer);
        }
    });

    // Listeners globais para modais
    window.addEventListener('keydown', (event) => {
        if (event.key === 'Escape') {
            ['image-viewer-modal', 'form-modal', 'custom-alert-modal'].forEach(id => {
                const modal = document.getElementById(id);
                if (modal) modal.style.display = 'none';
            });
        }
    });
});

// Função de alerta global (ela pode ficar aqui ou ser movida para utils.js no futuro)
function showCustomAlert(message, title = 'Aviso', isConfirm = false) {
    const modal = document.getElementById('custom-alert-modal');
    if (!modal) return Promise.resolve(false); // Retorna se o modal não existir

    modal.querySelector('#custom-alert-title').textContent = title;
    modal.querySelector('#custom-alert-message').textContent = message;
    const okBtn = modal.querySelector('#custom-alert-ok-btn');
    const cancelBtn = modal.querySelector('#custom-alert-cancel-btn');

    return new Promise((resolve) => {
        const closeAndResolve = (value) => {
            modal.style.display = 'none';
            // Remove event listeners para evitar múltiplos disparos
            okBtn.onclick = null;
            cancelBtn.onclick = null;
            resolve(value);
        };
        okBtn.onclick = () => closeAndResolve(true);
        cancelBtn.onclick = () => closeAndResolve(false);
        cancelBtn.style.display = isConfirm ? 'inline-block' : 'none';
        modal.style.display = 'flex';
    });
}
