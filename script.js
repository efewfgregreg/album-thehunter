// ==========================================================
// script.js (VERSÃO FINAL - O ORQUESTRADOR)
// Papel: Orquestrador Principal do Aplicativo
// ==========================================================

// --- 1. IMPORTAÇÃO DE TODOS OS MÓDULOS ---
import { firebaseConfig } from './js/config.js';
import { rareFursData, greatsFursData, items, diamondFursData, reservesData, animalHotspotData, multiMountsData, categorias } from './js/data.js';
import { slugify, getDefaultDataStructure } from './js/utils.js';
import * as FirebaseService from './js/firebase-service.js';
import * as AuthUI from './js/auth.js';
import * as ProgressUI from './js/ui/progress.js';
import * as GrindUI from './js/ui/grind.js';

// --- 2. INICIALIZAÇÃO DO FIREBASE ---
const app = firebase.initializeApp(firebaseConfig);
const auth = firebase.auth();
const db = firebase.firestore();
FirebaseService.initializeFirebaseService(db);

// --- 3. ESTADO GLOBAL DO APLICATIVO ---
let currentUser = null;
let savedData = {};
let appContainer;
let lastClickedAnimalName = '';

// --- 4. FUNÇÃO CENTRAL DE CONTROLE DE DADOS ---
async function saveDataAndUpdateUI(newData) {
    savedData = newData; 
    try {
        await FirebaseService.saveDataToFirestore(currentUser, savedData);
        console.log("Progresso salvo na nuvem com sucesso!");
    } catch (error) {
        console.error("Erro ao salvar dados na nuvem: ", error);
    }

    // Lógica para atualizar a UI que estiver ativa
    if (document.getElementById('progress-panel-main-container')) {
        const progressContainer = document.querySelector('.progress-view-container');
        if (progressContainer) ProgressUI.renderProgressView(progressContainer);
    }
    const mountsGrid = document.querySelector('.mounts-grid');
    if (mountsGrid) {
        renderMultiMountsView(mountsGrid.parentNode); 
    }
    const activeCard = document.querySelector(`.animal-card[data-slug="${slugify(lastClickedAnimalName)}"]`);
    if(activeCard) {
        const container = document.querySelector('.content-container');
        const tabKey = container.className.split(' ').find(cls => cls.endsWith('-view'))?.replace('-view', '');
        if(tabKey) {
           updateCardAppearance(activeCard, slugify(lastClickedAnimalName), tabKey);
        }
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


// =================================================================
// ===== FUNÇÕES GLOBAIS E DE ROTEAMENTO =====
// =================================================================

function renderNavigationHub() {
    appContainer.innerHTML = '';
    const hub = document.createElement('div');
    hub.className = 'navigation-hub';
    const title = document.createElement('h1');
    title.className = 'hub-title';
    title.textContent = 'Álbum de Caça';
    hub.appendChild(title);
    Object.keys(categorias).forEach(key => {
        const cat = categorias[key];
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

// Esta função age como o "roteador" principal da aplicação
function renderMainView(tabKey) {
    appContainer.innerHTML = '';
    const currentTab = categorias[tabKey];
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
    mainContent.appendChild(contentContainer);
    appContainer.appendChild(mainContent);
    AuthUI.setupLogoutButton(currentUser, auth, appContainer);
    
    // Delega a renderização para o módulo correto
    if (tabKey === 'progresso') {
        ProgressUI.renderProgressView(contentContainer);
    } else if (tabKey === 'grind') {
        GrindUI.renderGrindHubView(contentContainer);
    } else {
        // As funções abaixo serão as próximas a serem movidas
        renderGenericAlbumView(contentContainer, tabKey);
    }
}

// Futuramente, esta função e as que ela chama irão para um módulo 'album-views.js'
function renderGenericAlbumView(contentContainer, tabKey) {
    const currentTab = categorias[tabKey];
    const filterInput = document.createElement('input');
    filterInput.type = 'text';
    filterInput.className = 'filter-input';
    filterInput.placeholder = 'Buscar animal...';
    contentContainer.appendChild(filterInput);
    const albumGrid = document.createElement('div');
    albumGrid.className = 'album-grid';
    contentContainer.appendChild(albumGrid);
    const itemsToRender = (currentTab.items || []).filter(item => typeof item === 'string' && item !== null && item.trim() !== '');
    itemsToRender.sort((a, b) => a.localeCompare(b)).forEach(name => {
        const card = createAnimalCard(name, tabKey);
        albumGrid.appendChild(card);
    });
    filterInput.addEventListener('input', (event) => {
        const searchTerm = event.target.value.toLowerCase();
        albumGrid.querySelectorAll('.animal-card').forEach(card => {
            const animalName = card.querySelector('.info').textContent.toLowerCase();
            card.style.display = animalName.includes(searchTerm) ? 'block' : 'none';
        });
    });
}

function createAnimalCard(name, tabKey) {
    // ... Esta função ainda está aqui
}

// ... Todas as outras funções de renderização (montagens, detalhes, reservas, etc.)
//     ainda estão aqui por enquanto...


// --- 5. INICIALIZAÇÃO DO APP ---
document.addEventListener('DOMContentLoaded', () => {
    appContainer = document.getElementById('app-container');
    auth.onAuthStateChanged(async (user) => {
        if (user) {
            currentUser = user;
            appContainer.innerHTML = `<div class="loading-spinner">Carregando seus dados...</div>`;
            savedData = await FirebaseService.loadDataFromFirestore(user);

            // Coleta todas as funções e variáveis que os módulos precisam
            const dependencies = {
                savedData, currentUser, auth, appContainer, items, slugify, 
                reservesData, rareFursData, diamondFursData, greatsFursData, animalHotspotData, multiMountsData, categorias,
                renderMainView, showCustomAlert, saveDataAndUpdateUI, syncTrophyToAlbum,
                calcularReserveProgress, getAggregatedGrindStats, getDefaultDataStructure,
                // Funções que ainda estão no script.js mas são necessárias em outros módulos
                updateCardAppearance, openImageViewer, closeModal, openGreatsTrophyModal 
            };
            
            // Inicializa todos os módulos de UI que criamos
            ProgressUI.init(dependencies);
            GrindUI.init(dependencies);
            // AlbumViews.init(dependencies); // <-- Adicionaremos quando criarmos o último módulo
            
            renderNavigationHub();
        } else {
            currentUser = null;
            AuthUI.renderLoginForm(appContainer, auth);
        }
    });

    // Código para fechar modais e event listener de 'keydown'
    // (O restante do seu DOMContentLoaded vai aqui)
});