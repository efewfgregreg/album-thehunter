// ==========================================================
// script.js (VERSÃO FINAL - O ORQUESTRADOR)
// Papel: Orquestrador Principal do Aplicativo
// ==========================================================

// --- 1. IMPORTAÇÃO DE TODOS OS MÓDULOS ---
import { firebaseConfig } from './js/config.js';
import * as Data from './js/data.js';
import * as Utils from './js/utils.js';
import * as FirebaseService from './js/firebase-service.js';
import * as AuthUI from './js/auth.js';
import * as ProgressUI from './js/ui/progress.js';
import * as GrindUI from './js/ui/grind.js';
import * as AlbumViews from './js/ui/album-views.js';

// --- 2. INICIALIZAÇÃO DO FIREBASE ---
const app = firebase.initializeApp(firebaseConfig);
const auth = firebase.auth();
const db = firebase.firestore();
FirebaseService.initializeFirebaseService(db);

// --- 3. ESTADO GLOBAL DO APLICATIVO ---
let currentUser = null;
let savedData = {};
let appContainer;
let lastClickedAnimalName = { value: '' }; // Usado para re-renderizar o card ativo

// --- 4. FUNÇÕES DE CONTROLE DE ALTO NÍVEL ---

async function saveDataAndUpdateUI(newData) {
    savedData = newData; 
    try {
        await FirebaseService.saveDataToFirestore(currentUser, savedData);
        console.log("Progresso salvo na nuvem com sucesso!");
    } catch (error) {
        console.error("Erro ao salvar dados na nuvem: ", error);
        // Opcional: Mostrar um alerta de erro para o usuário
        showCustomAlert('Houve um erro ao salvar seu progresso na nuvem.', 'Erro de Sincronização');
    }
    
    // ATUALIZA A UI DE FORMA INTELIGENTE
    // Pega a "view" atual pelo data attribute que adicionamos ao container
    const currentViewKey = document.querySelector('.content-container')?.dataset.viewKey;
    if (currentViewKey) {
        // Simplesmente renderiza a view principal novamente com os dados atualizados
        renderMainView(currentViewKey);
    } else {
        // Se não estiver em nenhuma view específica (ex: hub principal), recarrega o hub
        renderNavigationHub();
    }
}

function syncTrophyToAlbum(animalSlug, rarityType, details) {
    if (!savedData) return;
    switch(rarityType) {
        case 'rares':
            if (!savedData.pelagens) savedData.pelagens = {};
            if (!savedData.pelagens[animalSlug]) savedData.pelagens[animalSlug] = {};
            savedData.pelagens[animalSlug][details.variation] = true;
            break;
        case 'super_raros':
            if (!savedData.super_raros) savedData.super_raros = {};
            if (!savedData.super_raros[animalSlug]) savedData.super_raros[animalSlug] = {};
            savedData.super_raros[animalSlug][details.variation] = true;
            break;
        case 'great_ones':
            if (!savedData.greats) savedData.greats = {};
            if (!savedData.greats[animalSlug]) savedData.greats[animalSlug] = {};
            if (!savedData.greats[animalSlug].furs) savedData.greats[animalSlug].furs = {};
            if (!savedData.greats[animalSlug].furs[details.variation]) {
                savedData.greats[animalSlug].furs[details.variation] = { trophies: [] };
            }
            const newGreatOneTrophy = {
                date: new Date().toISOString(),
                abates: details.grindCounts.total,
                diamantes: details.grindCounts.diamonds,
                pelesRaras: details.grindCounts.rares.length
            };
            savedData.greats[animalSlug].furs[details.variation].trophies.push(newGreatOneTrophy);
            break;
    }
    console.log(`Sincronizado: ${rarityType} '${details.variation}' para ${animalSlug}`);
}

// --- 5. FUNÇÕES GLOBAIS DE UI (MODAIS) ---

function openImageViewer(imageUrl) {
    const modal = document.getElementById('image-viewer-modal');
    modal.innerHTML = `
        <span class="modal-close">&times;</span>
        <img class="modal-content-viewer" src="${imageUrl}" alt="Imagem em tela cheia">
    `;
    modal.style.display = "flex";
}

function closeModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
        modal.style.display = "none";
    }
}

function showCustomAlert(message, title = 'Aviso', isConfirm = false) {
    const modal = document.getElementById('custom-alert-modal');
    const modalTitle = document.getElementById('custom-alert-title');
    const modalMessage = document.getElementById('custom-alert-message');
    const okBtn = document.getElementById('custom-alert-ok-btn');
    const cancelBtn = document.getElementById('custom-alert-cancel-btn');
    modalTitle.textContent = title;
    modalMessage.textContent = message;
    return new Promise((resolve) => {
        okBtn.onclick = () => {
            modal.style.display = 'none';
            resolve(true);
        };
        if (isConfirm) {
            cancelBtn.style.display = 'inline-block';
            cancelBtn.onclick = () => {
                modal.style.display = 'none';
                resolve(false);
            };
        } else {
            cancelBtn.style.display = 'none';
        }
        modal.style.display = 'flex';
    });
}


// --- 6. FUNÇÕES DE ROTEAMENTO PRINCIPAL ---

function renderNavigationHub() {
    appContainer.innerHTML = '';
    const hub = document.createElement('div');
    hub.className = 'navigation-hub';
    const title = document.createElement('h1');
    title.className = 'hub-title';
    title.textContent = 'Álbum de Caça';
    hub.appendChild(title);
    Object.keys(Data.categorias).forEach(key => {
        const cat = Data.categorias[key];
        const card = document.createElement('div');
        card.className = 'nav-card';
        card.innerHTML = `<i class="${cat.icon || 'fas fa-question-circle'}"></i><span>${cat.title}</span>`;
        card.dataset.target = key;
        card.addEventListener('click', () => renderMainView(key));
        hub.appendChild(card);
    });
    appContainer.appendChild(hub);
    AuthUI.setupLogoutButton(currentUser, auth, appContainer);
}

function renderMainView(tabKey) {
    appContainer.innerHTML = '';
    const currentTab = Data.categorias[tabKey];
    if (!currentTab) return;
    const mainContent = document.createElement('div');
    mainContent.className = 'main-content';
    const header = document.createElement('div');
    header.className = 'page-header';
    const title = document.createElement('h2');
    title.textContent = currentTab.title;
    const backButton = document.createElement('button');
    backButton.className = 'back-button';
    backButton.innerHTML = '&larr; Voltar ao Menu';
    backButton.onclick = renderNavigationHub;
    header.appendChild(title);
    header.appendChild(backButton);
    mainContent.appendChild(header);
    const contentContainer = document.createElement('div');
    contentContainer.className = `content-container ${tabKey}-view`;
    contentContainer.dataset.viewKey = tabKey; // Importante para o refresh da UI
    mainContent.appendChild(contentContainer);
    appContainer.appendChild(mainContent);
    AuthUI.setupLogoutButton(currentUser, auth, appContainer);
    
    // Delega a renderização para o módulo correto
    if (tabKey === 'progresso') {
        ProgressUI.renderProgressView(contentContainer);
    } else if (tabKey === 'grind') {
        GrindUI.renderGrindHubView(contentContainer);
    } else if (tabKey === 'reservas') {
        AlbumViews.renderReservesList(contentContainer);
    } else if (tabKey === 'montagens') {
        AlbumViews.renderMultiMountsView(contentContainer);
    } else {
        AlbumViews.renderGenericAlbumView(contentContainer, tabKey);
    }
}

// --- 7. INICIALIZAÇÃO DO APP ---
document.addEventListener('DOMContentLoaded', () => {
    appContainer = document.getElementById('app-container');
    auth.onAuthStateChanged(async (user) => {
        if (user) {
            currentUser = user;
            appContainer.innerHTML = `<div class="loading-spinner">Carregando seus dados...</div>`;
            savedData = await FirebaseService.loadDataFromFirestore(user);

            // Coleta TODAS as funções e variáveis que os módulos precisam em um só lugar.
            const dependencies = {
                // Estado
                savedData, currentUser, auth, appContainer, lastClickedAnimalName,
                // Dados estáticos e utilitários
                ...Data, 
                ...Utils,
                // Funções de outros módulos que precisam ser compartilhadas
                getAggregatedGrindStats: GrindUI.getAggregatedGrindStats,
                // Funções do próprio orquestrador
                renderMainView, 
                saveDataAndUpdateUI, 
                syncTrophyToAlbum,
                openImageViewer,
                closeModal,
                showCustomAlert
            };
            
            // Inicializa todos os módulos de UI, passando o mesmo pacote de dependências para todos.
            AuthUI.init(dependencies);
            ProgressUI.init(dependencies);
            GrindUI.init(dependencies);
            AlbumViews.init(dependencies);
            
            renderNavigationHub();
        } else {
            currentUser = null;
            AuthUI.renderLoginForm(appContainer, auth);
        }
    });

    // Adiciona event listeners globais para os modais
    ['image-viewer-modal', 'form-modal', 'custom-alert-modal'].forEach(modalId => {
        const modal = document.getElementById(modalId);
        if (modal) {
            modal.addEventListener('click', e => {
                if (e.target === modal || e.target.classList.contains('modal-close')) {
                    closeModal(modalId);
                }
            });
            const closeBtn = modal.querySelector('.modal-close');
            if (closeBtn) closeBtn.onclick = () => closeModal(modalId);
        }
    });
    window.addEventListener('keydown', (event) => {
        if (event.key === 'Escape') {
            ['image-viewer-modal', 'form-modal', 'custom-alert-modal'].forEach(closeModal);
        }
    });
});