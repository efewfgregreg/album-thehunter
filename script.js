// ==========================================================
// script.js (VERSÃO FINAL DO PASSO 5)
// ==========================================================

// --- MÓDULOS (NOVAS IMPORTAÇÕES) ---
import { firebaseConfig } from './js/config.js';
import { rareFursData, greatsFursData, items, diamondFursData, reservesData, animalHotspotData, multiMountsData, categorias } from './js/data.js';
import { slugify, getDefaultDataStructure } from './js/utils.js';
import * as FirebaseService from './js/firebase-service.js';
import * as AuthUI from './js/auth.js';


// --- INICIALIZAÇÃO DO FIREBASE (ATUALIZADA) ---
const app = firebase.initializeApp(firebaseConfig);
const auth = firebase.auth();
const db = firebase.firestore();
FirebaseService.initializeFirebaseService(db);


// --- ESTADO GLOBAL DO APLICATIVO ---
let currentUser = null;
let savedData = {};
let appContainer;
let lastClickedAnimalName = '';


// --- NOVA FUNÇÃO CENTRAL PARA SALVAR E ATUALIZAR UI ---
async function saveDataAndUpdateUI(newData) {
    savedData = newData; // Atualiza o estado local imediatamente
    try {
        await FirebaseService.saveDataToFirestore(currentUser, savedData);
        console.log("Progresso salvo na nuvem com sucesso!");
    } catch (error) {
        console.error("Erro ao salvar dados na nuvem: ", error);
    }

    // A UI continua sendo atualizada localmente de forma otimista
    if (document.getElementById('progress-panel-main-container')) {
        const contentArea = document.getElementById('progress-content-area');
        if (contentArea) {
             if (document.querySelector('.ranking-table')) {
                 renderHuntingRankingView(contentArea);
             } else {
                 updateNewProgressPanel(contentArea);
             }
        }
    }
    const mountsGrid = document.querySelector('.mounts-grid');
    if (mountsGrid) {
        const container = mountsGrid.parentNode;
        renderMultiMountsView(container);
    }
    const mainCard = document.querySelector(`.animal-card[data-slug="${slugify(lastClickedAnimalName)}"]`);
    if(mainCard) {
        const tabKey = document.querySelector('.content-container').className.split(' ').find(cls => cls.endsWith('-view'))?.replace('-view', '');
        if(tabKey) {
           updateCardAppearance(mainCard, slugify(lastClickedAnimalName), tabKey);
        }
    }
}


// =================================================================
// ===== FUNÇÕES DE RENDERIZAÇÃO E LÓGICA PRINCIPAL =====
// =================================================================

function checkAndSetGreatOneCompletion(slug, currentData) {
    const requiredFurs = greatsFursData[slug];
    if (!requiredFurs || !currentData) return;
    currentData.completo = requiredFurs.every(furName => currentData.furs?.[furName]?.trophies?.length > 0);
}

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
    if (tabKey === 'progresso') {
        renderProgressView(contentContainer);
    } else if (tabKey === 'reservas') {
        renderReservesList(contentContainer);
    } else if (tabKey === 'montagens') {
        renderMultiMountsView(contentContainer);
    } else if (tabKey === 'grind') {
        renderGrindHubView(contentContainer);
    } else {
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
}

function createAnimalCard(name, tabKey) {
    const card = document.createElement('div');
    card.className = 'animal-card';
    const slug = slugify(name);
    card.dataset.slug = slug;
    card.innerHTML = `<img src="animais/${slug}.png" alt="${name}" onerror="this.onerror=null;this.src='animais/placeholder.png';"><div class="info">${name}</div>`;
    card.addEventListener('click', () => {
        lastClickedAnimalName = name;
        showDetailView(name, tabKey);
    });
    updateCardAppearance(card, slug, tabKey);
    return card;
}

function showDetailView(name, tabKey, originReserveKey = null) {
    if (originReserveKey) {
        renderAnimalDossier(name, originReserveKey);
    } else {
        renderSimpleDetailView(name, tabKey);
    }
}

function renderSimpleDetailView(name, tabKey) {
    const mainContent = document.querySelector('.main-content');
    const slug = slugify(name);
    const contentContainer = mainContent.querySelector('.content-container');
    contentContainer.className = `content-container detail-view ${tabKey}-detail-view`;
    contentContainer.innerHTML = '';
    mainContent.querySelector('.page-header h2').textContent = name;
    const backButton = mainContent.querySelector('.page-header .back-button');
    backButton.innerHTML = `&larr; Voltar para ${categorias[tabKey].title}`;
    backButton.onclick = () => renderMainView(tabKey);
    const detailContent = contentContainer;
    if (tabKey === 'greats') {
        renderGreatsDetailView(detailContent, name, slug);
    } else if (tabKey === 'pelagens') {
        renderRareFursDetailView(detailContent, name, slug);
    } else if (tabKey === 'super_raros') {
        renderSuperRareDetailView(detailContent, name, slug);
    } else if (tabKey === 'diamantes') {
        renderDiamondsDetailView(detailContent, name, slug);
    }
}

function renderAnimalDossier(animalName, originReserveKey) {
    const mainContent = document.querySelector('.main-content');
    const slug = slugify(animalName);
    const contentContainer = mainContent.querySelector('.content-container');
    contentContainer.className = 'content-container dossier-view';
    contentContainer.innerHTML = '';
    mainContent.querySelector('.page-header h2').textContent = `Dossiê: ${animalName}`;
    const backButton = mainContent.querySelector('.page-header .back-button');
    backButton.innerHTML = `&larr; Voltar para ${reservesData[originReserveKey].name}`;
    backButton.onclick = () => showReserveDetailView(originReserveKey);
    const dossierTabs = document.createElement('div');
    dossierTabs.className = 'dossier-tabs';
    const dossierContent = document.createElement('div');
    dossierContent.className = 'dossier-content';
    const tabs = {
        pelagens: { title: 'Pelagens Raras', renderFunc: renderRareFursDetailView },
        diamantes: { title: 'Diamantes', renderFunc: renderDiamondsDetailView },
        super_raros: { title: 'Super Raros', renderFunc: renderSuperRareDetailView },
        hotspot: { title: 'Hotspots', renderFunc: renderHotspotDetailView },
    };
    if (greatsFursData[slug]) {
        tabs.greats = { title: '<i class="fas fa-crown"></i> Great Ones', renderFunc: renderGreatsDetailView };
    }
    Object.entries(tabs).forEach(([key, value]) => {
        const tab = document.createElement('div');
        tab.className = 'dossier-tab';
        tab.innerHTML = value.title;
        tab.dataset.key = key;
        dossierTabs.appendChild(tab);
    });
    contentContainer.appendChild(dossierTabs);
    contentContainer.appendChild(dossierContent);
    dossierTabs.addEventListener('click', e => {
        const tab = e.target.closest('.dossier-tab');
        if (!tab) return;
        dossierTabs.querySelectorAll('.dossier-tab').forEach(t => t.classList.remove('active'));
        tab.classList.add('active');
        const tabKey = tab.dataset.key;
        tabs[tabKey].renderFunc(dossierContent, animalName, slug, originReserveKey);
    });
    dossierTabs.querySelector('.dossier-tab').click();
}

function renderReservesList(container) {
    container.innerHTML = '';
    const grid = document.createElement('div');
    grid.className = 'reserves-grid';
    container.appendChild(grid);
    const sortedReserves = Object.entries(reservesData).sort(([, a], [, b]) => a.name.localeCompare(b.name));
    for (const [reserveKey, reserve] of sortedReserves) {
        const progress = calcularReserveProgress(reserveKey);
        const card = document.createElement('div');
        card.className = 'reserve-card';
        card.innerHTML = `
            <div class="reserve-image-container">
                <img class="reserve-card-image" src="${reserve.image}" onerror="this.style.display='none'">
            </div>
            <div class="reserve-card-info-panel">
                <img src="${reserve.image.replace('.png', '_logo.png')}" class="reserve-card-logo" alt="${reserve.name}" onerror="this.style.display='none'">
                <div class="reserve-card-stats">
                    <span><i class="fas fa-paw"></i> ${progress.collectedRares}</span>
                    <span><i class="fas fa-gem"></i> ${progress.collectedDiamonds}</span>
                    <span><i class="fas fa-crown"></i> ${progress.collectedGreatOnes}</span>
                </div>
            </div>
        `;
        card.addEventListener('click', () => showReserveDetailView(reserveKey));
        grid.appendChild(card);
    }
}

function showReserveDetailView(reserveKey) {
    const mainContent = document.querySelector('.main-content');
    const contentContainer = mainContent.querySelector('.content-container');
    contentContainer.className = 'content-container reserve-detail-view';
    contentContainer.innerHTML = '';
    const reserve = reservesData[reserveKey];
    if (!reserve) return;
    mainContent.querySelector('.page-header h2').textContent = reserve.name;
    const backButton = mainContent.querySelector('.page-header .back-button');
    backButton.innerHTML = `&larr; Voltar para Reservas`;
    backButton.onclick = () => renderMainView('reservas');
    const viewArea = document.createElement('div');
    viewArea.className = 'reserve-view-area';
    contentContainer.appendChild(viewArea);
    const toggleButtons = document.createElement('div');
    toggleButtons.className = 'reserve-view-toggle';
    contentContainer.prepend(toggleButtons);
    const btnAnimals = document.createElement('button');
    btnAnimals.textContent = 'Animais da Reserva';
    btnAnimals.className = 'toggle-button active';
    btnAnimals.onclick = () => {
        toggleButtons.querySelectorAll('.toggle-button').forEach(btn => btn.classList.remove('active'));
        btnAnimals.classList.add('active');
        renderAnimalChecklist(viewArea, reserveKey);
    };
    toggleButtons.appendChild(btnAnimals);
    const btnHotspots = document.createElement('button');
    btnHotspots.textContent = 'Mapas de Hotspot';
    btnHotspots.className = 'toggle-button';
    btnHotspots.onclick = () => {
        toggleButtons.querySelectorAll('.toggle-button').forEach(btn => btn.classList.remove('active'));
        btnHotspots.classList.add('active');
        renderHotspotGalleryView(viewArea, reserveKey);
    };
    toggleButtons.appendChild(btnHotspots);
    renderAnimalChecklist(viewArea, reserveKey);
}

function renderAnimalChecklist(container, reserveKey) {
    container.innerHTML = '';
    const checklistContainer = document.createElement('div');
    checklistContainer.className = 'animal-checklist';
    container.appendChild(checklistContainer);
    const reserve = reservesData[reserveKey];
    const animalNames = reserve.animals
        .map(slug => items.find(item => slugify(item) === slug))
        .filter(name => typeof name === 'string' && name !== null && name.trim() !== '');
    animalNames.sort((a, b) => a.localeCompare(b)).forEach(animalName => {
        const slug = slugify(animalName);
        const totalRares = (rareFursData[slug]?.macho?.length || 0) + (rareFursData[slug]?.femea?.length || 0);
        const collectedRares = Object.values(savedData.pelagens?.[slug] || {}).filter(v => v === true).length;
        const raresPercentage = totalRares > 0 ? (collectedRares / totalRares) * 100 : 0;
        const totalDiamonds = (diamondFursData[slug]?.macho?.length || 0) + (diamondFursData[slug]?.femea?.length || 0);
        const collectedDiamonds = new Set((savedData.diamantes?.[slug] || []).map(t => t.type)).size;
        const diamondsPercentage = totalDiamonds > 0 ? (collectedDiamonds / totalDiamonds) * 100 : 0;
        const isGreatOne = greatsFursData.hasOwnProperty(slug);
        const row = document.createElement('div');
        row.className = 'animal-checklist-row';
        row.innerHTML = `
            <img class="animal-icon" src="animais/${slug}.png" onerror="this.src='animais/placeholder.png'">
            <div class="animal-name">${animalName}</div>
            <div class="mini-progress-bars">
                <div class="mini-progress" title="Pelagens Raras: ${collectedRares}/${totalRares}">
                    <i class="fas fa-paw"></i>
                    <div class="mini-progress-bar-container">
                        <div class="mini-progress-bar" style="width: ${raresPercentage}%"></div>
                    </div>
                </div>
                <div class="mini-progress" title="Diamantes: ${collectedDiamonds}/${totalDiamonds}">
                    <i class="fas fa-gem"></i>
                    <div class="mini-progress-bar-container">
                        <div class="mini-progress-bar" style="width: ${diamondsPercentage}%"></div>
                    </div>
                </div>
            </div>
            <i class="fas fa-crown great-one-indicator ${isGreatOne ? 'possible' : ''}" title="Pode ser Great One"></i>
        `;
        row.addEventListener('click', () => showDetailView(animalName, 'reservas', reserveKey));
        checklistContainer.appendChild(row);
    });
}

function renderHotspotGalleryView(container, reserveKey) {
    container.innerHTML = '';
    const hotspotGrid = document.createElement('div');
    hotspotGrid.className = 'hotspot-grid';
    container.appendChild(hotspotGrid);
    const reserveAnimals = reservesData[reserveKey]?.animals || [];
    const availableHotspots = reserveAnimals
        .map(slug => ({ slug, name: items.find(item => slugify(item) === slug) }))
        .filter(animal => typeof animal.name === 'string' && animal.name !== null && animalHotspotData[reserveKey]?.[animal.slug]);
    if (availableHotspots.length === 0) {
        hotspotGrid.innerHTML = '<p class="no-data-message">Nenhum mapa de hotspot disponível para esta reserva ainda.</p>';
        return;
    }
    availableHotspots.sort((a, b) => a.name.localeCompare(b.name)).forEach(animal => {
        const slugReserve = slugify(reservesData[reserveKey].name);
        const imagePath = `hotspots/${slugReserve}_${animal.slug}_hotspot.jpg`;
        const card = document.createElement('div');
        card.className = 'hotspot-card';
        card.innerHTML = `
            <img src="${imagePath}" alt="Mapa de Hotspot ${animal.name}" onerror="this.onerror=null;this.src='animais/placeholder.jpg';">
            <div class="info-overlay">
                <span class="animal-name">${animal.name}</span>
                <span class="hotspot-label"><i class="fas fa-map-marker-alt"></i> Hotspot</span>
            </div>
        `;
        card.addEventListener('click', () => renderHotspotDetailModal(reserveKey, animal.slug));
        hotspotGrid.appendChild(card);
    });
}

function renderHotspotDetailModal(reserveKey, animalSlug) {
    const hotspotInfo = animalHotspotData[reserveKey]?.[animalSlug];
    const animalName = items.find(item => slugify(item) === animalSlug);
    const reserveName = reservesData[reserveKey].name;
    if (!hotspotInfo) {
        showCustomAlert('Dados de hotspot não encontrados para este animal nesta reserva.', 'Erro');
        return;
    }
    const slugReserve = slugify(reserveName);
    const imagePath = `hotspots/${slugReserve}_${animalSlug}_hotspot.jpg`;
    const modal = document.getElementById('image-viewer-modal');
    modal.innerHTML = `
        <span class="modal-close" onclick="closeModal('image-viewer-modal')">&times;</span>
        <div class="hotspot-detail-content">
            <div class="hotspot-image-container">
                <img class="modal-content-viewer" src="${imagePath}" alt="Mapa de Hotspot ${animalName} em ${reserveName}" onerror="this.onerror=null;this.src='animais/placeholder.jpg';">
            </div>
            <div class="hotspot-info-panel">
                <h3>${animalName} - ${reserveName}</h3>
                <div class="info-row"><strong>Pontuação Máxima:</strong> <span>${hotspotInfo.maxScore || 'N/A'}</span></div>
                <div class="info-row"><strong>Estimativa de Peso Máximo:</strong> <span>${hotspotInfo.maxWeightEstimate || 'N/A'}</span></div>
                <div class="info-row"><strong>Potencial Zonas:</strong> <span>${hotspotInfo.drinkZonesPotential || 'N/A'}</span></div>
                <div class="info-row"><strong>Classe:</strong> <span>${hotspotInfo.animalClass || 'N/A'}</span></div>
                <div class="info-row"><strong>Nível Máximo:</strong> <span>${hotspotInfo.maxLevel || 'N/A'}</span></div>
            </div>
        </div>
    `;
    modal.style.display = 'flex';
}

function renderHotspotDetailView(container, animalName, slug, originReserveKey) {
    container.innerHTML = '';
    const hotspotInfo = animalHotspotData[originReserveKey]?.[slug];
    if (!hotspotInfo) {
        container.innerHTML = '<p class="no-data-message">Nenhum dado de hotspot disponível para este animal nesta reserva.</p>';
        return;
    }
    const slugReserve = slugify(reservesData[originReserveKey].name);
    const imagePath = `hotspots/${slugReserve}_${slug}_hotspot.jpg`;
    container.innerHTML = `
        <div class="hotspot-dossier-card">
            <div class="hotspot-dossier-image-wrapper">
                 <img src="${imagePath}" alt="Mapa de Hotspot ${animalName}" onerror="this.onerror=null;this.src='animais/placeholder.jpg';" class="hotspot-dossier-image">
            </div>
            <div class="hotspot-dossier-info">
                <div class="info-row"><strong>Pontuação Máxima:</strong> <span>${hotspotInfo.maxScore || 'N/A'}</span></div>
                <div class="info-row"><strong>Estimativa de Peso Máximo:</strong> <span>${hotspotInfo.maxWeightEstimate || 'N/A'}</span></div>
                <div class="info-row"><strong>Potencial Zonas:</strong> <span>${hotspotInfo.drinkZonesPotential || 'N/A'}</span></div>
                <div class="info-row"><strong>Classe:</strong> <span>${hotspotInfo.animalClass || 'N/A'}</span></div>
                <div class="info-row"><strong>Nível Máximo:</strong> <span>${hotspotInfo.maxLevel || 'N/A'}</span></div>
            </div>
        </div>
        <button class="fullscreen-btn hotspot-fullscreen back-button" onclick="openImageViewer('${imagePath}')" title="Ver mapa em tela cheia">Ver mapa em tela cheia</button>
    `;
}

function calcularReserveProgress(reserveKey) {
    const reserveAnimals = reservesData[reserveKey]?.animals || [];
    let progress = {
        collectedRares: 0,
        totalRares: 0,
        collectedDiamonds: 0,
        totalDiamonds: 0,
        collectedGreatOnes: 0,
        totalGreatOnes: 0
    };
    reserveAnimals.forEach(slug => {
        if (rareFursData[slug]) {
            progress.totalRares += (rareFursData[slug].macho?.length || 0) + (rareFursData[slug].femea?.length || 0);
            progress.collectedRares += Object.values(savedData.pelagens?.[slug] || {}).filter(v => v === true).length;
        }
        if (diamondFursData[slug]) {
            progress.totalDiamonds += (diamondFursData[slug].macho?.length || 0) + (diamondFursData[slug].femea?.length || 0);
            progress.collectedDiamonds += new Set((savedData.diamantes?.[slug] || []).map(t => t.type)).size;
        }
        if (greatsFursData[slug]) {
            progress.totalGreatOnes += greatsFursData[slug].length;
            progress.collectedGreatOnes += Object.values(savedData.greats?.[slug]?.furs || {}).filter(f => f.trophies?.length > 0).length;
        }
    });
    return progress;
}

function renderRareFursDetailView(container, name, slug, originReserveKey = null) {
    container.innerHTML = '';
    const furGrid = document.createElement('div');
    furGrid.className = 'fur-grid';
    container.appendChild(furGrid);
    const speciesFurs = rareFursData[slug];
    if (!speciesFurs || (speciesFurs.macho.length === 0 && speciesFurs.femea.length === 0)) {
        furGrid.innerHTML = '<p>Nenhuma pelagem rara listada para este animal.</p>';
        return;
    }
    const genderedFurs = [];
    if (speciesFurs.macho) speciesFurs.macho.forEach(fur => genderedFurs.push({ displayName: `Macho ${fur}`, originalName: fur, gender: 'macho' }));
    if (speciesFurs.femea) speciesFurs.femea.forEach(fur => genderedFurs.push({ displayName: `Fêmea ${fur}`, originalName: fur, gender: 'femea' }));
    genderedFurs.sort((a, b) => a.displayName.localeCompare(b.displayName)).forEach(furInfo => {
        const furCard = document.createElement('div');
        const isCompleted = savedData.pelagens?.[slug]?.[furInfo.displayName] === true;
        furCard.className = `fur-card ${isCompleted ? 'completed' : 'incomplete'}`;
        const furSlug = slugify(furInfo.originalName), genderSlug = furInfo.gender;
        furCard.innerHTML = `<img src="animais/pelagens/${slug}_${furSlug}_${genderSlug}.png" onerror="this.onerror=null; this.src='animais/pelagens/${slug}_${furSlug}.png'; this.onerror=null; this.src='animais/${slug}.png';"><div class="info">${furInfo.displayName}</div><button class="fullscreen-btn" onclick="openImageViewer(this.closest('.fur-card').querySelector('img').src); event.stopPropagation();" title="Ver em tela cheia">⛶</button>`;
        furCard.addEventListener('click', () => {
            if (!savedData.pelagens) savedData.pelagens = {};
            if (!savedData.pelagens[slug]) savedData.pelagens[slug] = {};
            const currentState = savedData.pelagens[slug][furInfo.displayName] || false;
            savedData.pelagens[slug][furInfo.displayName] = !currentState;
            saveDataAndUpdateUI(savedData);
            if (originReserveKey) {
                renderAnimalDossier(name, originReserveKey);
            } else {
                renderSimpleDetailView(name, 'pelagens');
            }
        });
        furGrid.appendChild(furCard);
    });
}

function renderSuperRareDetailView(container, name, slug, originReserveKey = null) {
    container.innerHTML = '';
    const furGrid = document.createElement('div');
    furGrid.className = 'fur-grid';
    container.appendChild(furGrid);
    const speciesRareFurs = rareFursData[slug];
    const speciesDiamondData = diamondFursData[slug];
    const fursToDisplay = [];
    const canBeDiamondMacho = (speciesDiamondData?.macho?.length || 0) > 0;
    const canBeDiamondFemea = (speciesDiamondData?.femea?.length || 0) > 0;
    if (speciesRareFurs?.macho && canBeDiamondMacho) {
        speciesRareFurs.macho.forEach(rareFur => {
            fursToDisplay.push({ displayName: `Macho ${rareFur}`, originalName: rareFur, gender: 'macho' });
        });
    }
    if (speciesRareFurs?.femea && canBeDiamondFemea) {
        speciesRareFurs.femea.forEach(rareFur => {
            fursToDisplay.push({ displayName: `Fêmea ${rareFur}`, originalName: rareFur, gender: 'femea' });
        });
    }
    if (fursToDisplay.length === 0) {
        furGrid.innerHTML = '<p>Nenhuma pelagem Super Rara (rara + diamante) encontrada para este animal.</p>';
        return;
    }
    fursToDisplay.sort((a, b) => a.displayName.localeCompare(b.displayName)).forEach(furInfo => {
        const furCard = document.createElement('div');
        const keyInSavedData = furInfo.displayName;
        const isCompleted = savedData.super_raros?.[slug]?.[keyInSavedData] === true;
        furCard.className = `fur-card ${isCompleted ? 'completed' : 'incomplete'} potential-super-rare`;
        const furSlug = slugify(furInfo.originalName);
        const genderSlug = furInfo.gender.toLowerCase();
        furCard.innerHTML = `<img src="animais/pelagens/${slug}_${furSlug}_${genderSlug}.png" onerror="this.onerror=null; this.src='animais/pelagens/${slug}_${furSlug}.png'; this.onerror=null; this.src='animais/${slug}.png';"><div class="info">${furInfo.displayName}</div><button class="fullscreen-btn" onclick="openImageViewer(this.closest('.fur-card').querySelector('img').src); event.stopPropagation();" title="Ver em tela cheia">⛶</button>`;
        furCard.addEventListener('click', () => {
            if (!savedData.super_raros) savedData.super_raros = {};
            if (!savedData.super_raros[slug]) savedData.super_raros[slug] = {};
            const currentState = savedData.super_raros[slug][keyInSavedData] || false;
            savedData.super_raros[slug][keyInSavedData] = !currentState;
            saveDataAndUpdateUI(savedData);
            if (originReserveKey) {
                renderAnimalDossier(name, originReserveKey);
            } else {
                renderSimpleDetailView(name, 'super_raros');
            }
        });
        furGrid.appendChild(furCard);
    });
}

function renderDiamondsDetailView(container, name, slug, originReserveKey = null) {
    container.innerHTML = '';
    const furGrid = document.createElement('div');
    furGrid.className = 'fur-grid';
    container.appendChild(furGrid);
    const speciesDiamondFurs = diamondFursData[slug];
    if (!speciesDiamondFurs) {
        furGrid.innerHTML = '<p>Nenhuma pelagem de diamante listada para este animal.</p>';
        return;
    }
    const allPossibleFurs = [];
    if (speciesDiamondFurs.macho) speciesDiamondFurs.macho.forEach(fur => allPossibleFurs.push({ displayName: `${fur}`, originalName: fur, gender: 'Macho' }));
    if (speciesDiamondFurs.femea) speciesDiamondFurs.femea.forEach(fur => allPossibleFurs.push({ displayName: `${fur}`, originalName: fur, gender: 'Fêmea' }));
    allPossibleFurs.sort((a, b) => a.displayName.localeCompare(b.displayName)).forEach(furInfo => {
        const furCard = document.createElement('div');
        furCard.className = 'fur-card';
        const fullTrophyName = `${furInfo.gender} ${furInfo.displayName}`;
        const highestScoreTrophy = (savedData.diamantes?.[slug] || []).filter(t => t.type === fullTrophyName).reduce((max, t) => t.score > max.score ? t : max, { score: -1 });
        const isCompleted = highestScoreTrophy.score !== -1;
        furCard.classList.add(isCompleted ? 'completed' : 'incomplete');
        const furSlug = slugify(furInfo.originalName), genderSlug = furInfo.gender.toLowerCase();
        furCard.innerHTML = `<img src="animais/pelagens/${slug}_${furSlug}_${genderSlug}.png" onerror="this.onerror=null; this.src='animais/pelagens/${slug}_${furSlug}.png'; this.onerror=null; this.src='animais/${slug}.png';"><div class="info-header"><span class="gender-tag">${furInfo.gender}</span><div class="info">${furInfo.displayName}</div></div><div class="score-container">${isCompleted ? `<span class="score-display"><i class="fas fa-trophy"></i> ${highestScoreTrophy.score}</span>` : '<span class="score-add-btn">Adicionar Pontuação</span>'}</div><button class="fullscreen-btn" onclick="openImageViewer(this.closest('.fur-card').querySelector('img').src); event.stopPropagation();" title="Ver em tela cheia">⛶</button>`;
        const scoreContainer = furCard.querySelector('.score-container');
        scoreContainer.addEventListener('click', e => {
            e.stopPropagation();
            if (scoreContainer.querySelector('input')) return;
            const currentScore = isCompleted ? highestScoreTrophy.score : '';
            scoreContainer.innerHTML = `<input type="number" class="score-input" value="${currentScore}" placeholder="0.0">`;
            const input = scoreContainer.querySelector('.score-input');
            input.focus();
            input.select();
            const saveScore = () => {
                const scoreValue = parseFloat(input.value);
                if (!savedData.diamantes) savedData.diamantes = {};
                if (!Array.isArray(savedData.diamantes[slug])) savedData.diamantes[slug] = [];
                let otherTrophies = savedData.diamantes[slug].filter(t => t.type !== fullTrophyName);
                if (!isNaN(scoreValue) && scoreValue > 0) {
                    otherTrophies.push({ id: Date.now(), type: fullTrophyName, score: scoreValue });
                }
                savedData.diamantes[slug] = otherTrophies;
                saveDataAndUpdateUI(savedData);
                if (originReserveKey) {
                    renderAnimalDossier(name, originReserveKey);
                } else {
                    renderDiamondsDetailView(container, name, slug);
                }
                const mainCard = document.querySelector(`.animal-card[data-slug="${slug}"]`);
                if (mainCard) {
                    updateCardAppearance(mainCard, slug, 'diamantes');
                }
            };
            input.addEventListener('blur', saveScore);
            input.addEventListener('keydown', e => {
                if (e.key === 'Enter') saveScore();
                else if (e.key === 'Escape') {
                    if (originReserveKey) {
                        renderAnimalDossier(name, originReserveKey);
                    } else {
                        renderDiamondsDetailView(container, name, slug);
                    }
                }
            });
        });
        furGrid.appendChild(furCard);
    });
}

function renderGreatsDetailView(container, animalName, slug, originReserveKey = null) {
    container.innerHTML = '';
    const furGrid = document.createElement('div');
    furGrid.className = 'fur-grid';
    container.appendChild(furGrid);
    const fursInfo = greatsFursData[slug];
    if (!fursInfo) {
        furGrid.innerHTML = '<p>Nenhuma pelagem de Great One para este animal.</p>';
        return;
    }
    fursInfo.forEach(furName => {
        const trophies = savedData.greats?.[slug]?.furs?.[furName]?.trophies || [];
        const furCard = document.createElement('div');
        furCard.className = `fur-card trophy-frame ${trophies.length > 0 ? 'completed' : 'incomplete'}`;
        const furSlug = slugify(furName);
        const imagePath = `animais/pelagens/great_${slug}_${furSlug}.png`;
        const fallbackImagePath = `animais/${slug}.png`;
        furCard.innerHTML = `
            <img src="${imagePath}" alt="${furName}" onerror="this.onerror=null; this.src='${fallbackImagePath}';">
            <div class="info-plaque">
                <div class="info">${furName}</div>
                <div class="kill-counter"><i class="fas fa-trophy"></i> x${trophies.length}</div>
            </div>
            <button class="fullscreen-btn" onclick="openImageViewer(this.closest('.fur-card').querySelector('img').src); event.stopPropagation();" title="Ver em tela cheia">⛶</button>
        `;
        furCard.addEventListener('click', () => openGreatsTrophyModal(animalName, slug, furName, originReserveKey));
        furGrid.appendChild(furCard);
    });
}

async function openGreatsTrophyModal(animalName, slug, furName, originReserveKey = null) {
    const modal = document.getElementById('form-modal');
    modal.innerHTML = '';
    modal.className = 'modal-overlay form-modal';
    const modalContent = document.createElement('div');
    modalContent.className = 'modal-content-box';
    modal.appendChild(modalContent);
    modalContent.innerHTML = `<h3><i class="fas fa-trophy"></i> Troféus de: ${furName}</h3>`;
    const logList = document.createElement('ul');
    logList.className = 'trophy-log-list';
    const trophies = savedData.greats?.[slug]?.furs?.[furName]?.trophies || [];
    if (trophies.length === 0) {
        logList.innerHTML = '<li>Nenhum abate registrado.</li>';
    } else {
        trophies.forEach((trophy, index) => {
            const li = document.createElement('li');
            const grindDetails = `Grind: ${trophy.abates || 0} | <i class="fas fa-gem"></i> ${trophy.diamantes || 0} | <i class="fas fa-paw"></i> ${trophy.pelesRaras || 0}`;
            li.innerHTML = `<span>Abate ${new Date(trophy.date).toLocaleDateString()} (${grindDetails})</span>`;
            const deleteBtn = document.createElement('button');
            deleteBtn.className = 'delete-trophy-btn';
            deleteBtn.innerHTML = '×';
            deleteBtn.onclick = async () => {
                if (await showCustomAlert('Tem certeza que deseja remover este abate?', 'Confirmar Exclusão', true)) {
                    trophies.splice(index, 1);
                    saveDataAndUpdateUI(savedData);
                    closeModal('form-modal');
                    const detailContent = document.querySelector('.dossier-content') || document.querySelector('.main-content > .content-container');
                    if (detailContent) {
                        if (originReserveKey) {
                            renderAnimalDossier(animalName, originReserveKey);
                        } else {
                            renderGreatsDetailView(detailContent, animalName, slug);
                        }
                    }
                }
            };
            li.appendChild(deleteBtn);
            logList.appendChild(li);
        });
    }
    modalContent.appendChild(logList);
    const form = document.createElement('div');
    form.className = 'add-trophy-form';
    form.innerHTML = `
        <h4>Registrar Novo Abate</h4>
        <table><tbody>
            <tr><td>Qtd. Abates na Grind:</td><td><input type="number" name="abates" placeholder="0"></td></tr>
            <tr><td>Qtd. Diamantes na Grind:</td><td><input type="number" name="diamantes" placeholder="0"></td></tr>
            <tr><td>Qtd. Peles Raras na Grind:</td><td><input type="number" name="pelesRaras" placeholder="0"></td></tr>
            <tr><td>Data de Abatimento:</td><td><input type="date" name="date" value="${new Date().toISOString().split('T')[0]}"></td></tr>
        </tbody></table>`;
    modalContent.appendChild(form);
    const buttonsDiv = document.createElement('div');
    buttonsDiv.className = 'modal-buttons';
    const cancelBtn = document.createElement('button');
    cancelBtn.className = 'back-button';
    cancelBtn.textContent = 'Cancelar';
    cancelBtn.onclick = () => closeModal('form-modal');
    const saveBtn = document.createElement('button');
    saveBtn.className = 'back-button';
    saveBtn.style.cssText = 'background-color: var(--primary-color); color: #111;';
    saveBtn.textContent = 'Salvar Troféu';
    saveBtn.onclick = () => {
        const newTrophy = {
            abates: parseInt(form.querySelector('[name="abates"]').value) || 0,
            diamantes: parseInt(form.querySelector('[name="diamantes"]').value) || 0,
            pelesRaras: parseInt(form.querySelector('[name="pelesRaras"]').value) || 0,
            date: form.querySelector('[name="date"]').value || new Date().toISOString().split('T')[0]
        };
        if (!savedData.greats) savedData.greats = {};
        if (!savedData.greats[slug]) savedData.greats[slug] = {};
        if (!savedData.greats[slug].furs) savedData.greats[slug].furs = {};
        if (!savedData.greats[slug].furs[furName]) {
            savedData.greats[slug].furs[furName] = { trophies: [] };
        }
        savedData.greats[slug].furs[furName].trophies.push(newTrophy);
        checkAndSetGreatOneCompletion(slug, savedData.greats[slug]);
        saveDataAndUpdateUI(savedData);
        closeModal('form-modal');
        const detailContent = document.querySelector('.dossier-content') || document.querySelector('.main-content > .content-container');
        if (detailContent) {
            if (originReserveKey) {
                renderAnimalDossier(animalName, originReserveKey);
            } else {
                renderGreatsDetailView(detailContent, animalName, slug);
            }
        }
    };
    buttonsDiv.appendChild(cancelBtn);
    buttonsDiv.appendChild(saveBtn);
    modalContent.appendChild(buttonsDiv);
    modal.style.display = 'flex';
}

function updateCardAppearance(card, slug, tabKey) {
    if (!card) return;
    card.classList.remove('completed', 'inprogress', 'incomplete');
    let status = 'incomplete';
    let collectedCount = 0;
    let totalCount = 0;
    switch (tabKey) {
        case 'greats':
            const animalData = savedData.greats?.[slug] || {};
            checkAndSetGreatOneCompletion(slug, animalData);
            const totalGreatFurs = greatsFursData[slug]?.length || 0;
            if (animalData.completo) {
                status = 'completed';
            } else {
                const collectedFurs = animalData.furs ? Object.values(animalData.furs).filter(fur => fur.trophies?.length > 0).length : 0;
                if (collectedFurs > 0 && collectedFurs < totalGreatFurs) {
                    status = 'inprogress';
                }
            }
            break;
        case 'diamantes':
            const collectedDiamondTrophies = savedData.diamantes?.[slug] || [];
            collectedCount = new Set(collectedDiamondTrophies.map(t => t.type)).size;
            const speciesDiamondData = diamondFursData[slug];
            if (speciesDiamondData) {
                totalCount = (speciesDiamondData.macho?.length || 0) + (speciesDiamondData.femea?.length || 0);
                if (totalCount > 0 && collectedCount === totalCount) {
                    status = 'completed';
                } else if (collectedCount > 0 && collectedCount < totalCount) {
                    status = 'inprogress';
                }
            }
            break;
        case 'super_raros':
            const collectedSuperRares = savedData.super_raros?.[slug] || {};
            collectedCount = Object.values(collectedSuperRares).filter(v => v === true).length;
            const speciesRareFursForSuper = rareFursData[slug];
            const speciesDiamondFursForSuper = diamondFursData[slug];
            if (speciesRareFursForSuper) {
                let possibleSuperRares = 0;
                if (speciesRareFursForSuper.macho && (speciesDiamondFursForSuper?.macho?.length || 0) > 0) {
                    possibleSuperRares += speciesRareFursForSuper.macho.length;
                }
                if (speciesRareFursForSuper.femea && (speciesDiamondFursForSuper?.femea?.length || 0) > 0) {
                    possibleSuperRares += speciesRareFursForSuper.femea.length;
                }
                totalCount = possibleSuperRares;
                if (totalCount > 0 && collectedCount === totalCount) {
                    status = 'completed';
                } else if (collectedCount > 0 && collectedCount < totalCount) {
                    status = 'inprogress';
                }
            }
            break;
        case 'pelagens':
            const collectedRareFurs = savedData.pelagens?.[slug] || {};
            collectedCount = Object.values(collectedRareFurs).filter(v => v === true).length;
            const speciesRareData = rareFursData[slug];
            if (speciesRareData) {
                totalCount = (speciesRareData.macho?.length || 0) + (speciesRareData.femea?.length || 0);
                if (totalCount > 0 && collectedCount === totalCount) {
                    status = 'completed';
                } else if (collectedCount > 0 && collectedCount < totalCount) {
                    status = 'inprogress';
                }
            }
            break;
    }
    card.classList.add(status);
}

function calcularOverallProgress() {
    const progress = {
        collectedRares: 0,
        totalRares: 0,
        collectedDiamonds: 0,
        totalDiamonds: 0,
        collectedGreatOnes: 0,
        totalGreatOnes: 0,
        collectedSuperRares: 0,
        totalSuperRares: 0,
        collectedHotspots: 0,
        totalHotspots: 0
    };
    const allAnimalSlugs = [...new Set(Object.keys(rareFursData).concat(Object.keys(diamondFursData)))];
    allAnimalSlugs.forEach(slug => {
        if (rareFursData[slug]) {
            progress.totalRares += (rareFursData[slug].macho?.length || 0) + (rareFursData[slug].femea?.length || 0);
        }
        progress.collectedRares += Object.values(savedData.pelagens?.[slug] || {}).filter(v => v === true).length;
        if (diamondFursData[slug]) {
            progress.totalDiamonds += (diamondFursData[slug].macho?.length || 0) + (diamondFursData[slug].femea?.length || 0);
        }
        progress.collectedDiamonds += new Set((savedData.diamantes?.[slug] || []).map(t => t.type)).size;
        if (greatsFursData[slug]) {
            progress.totalGreatOnes += greatsFursData[slug].length;
            progress.collectedGreatOnes += Object.values(savedData.greats?.[slug]?.furs || {}).filter(f => f.trophies?.length > 0).length;
        }
        const speciesRareFurs = rareFursData[slug];
        const speciesDiamondFurs = diamondFursData[slug];
        if (speciesRareFurs) {
            if (speciesRareFurs.macho && (speciesDiamondFurs?.macho?.length || 0) > 0) {
                progress.totalSuperRares += speciesRareFurs.macho.length;
            }
            if (speciesRareFurs.femea && (speciesDiamondFurs?.femea?.length || 0) > 0) {
                progress.totalSuperRares += speciesRareFurs.femea.length;
            }
        }
        progress.collectedSuperRares += Object.values(savedData.super_raros?.[slug] || {}).filter(v => v === true).length;
    });
    progress.totalHotspots = Object.values(animalHotspotData).reduce((acc, reserve) => acc + Object.keys(reserve).length, 0);
    return progress;
}

function renderProgressView(container) {
    container.innerHTML = '';
    const wrapper = document.createElement('div');
    wrapper.className = 'progress-view-container';
    wrapper.id = 'progress-panel-main-container';
    wrapper.appendChild(createLatestAchievementsPanel());
    const viewToggleButtons = document.createElement('div');
    viewToggleButtons.className = 'reserve-view-toggle';
    const showProgressBtn = document.createElement('button');
    showProgressBtn.textContent = 'Ver Progresso Geral';
    showProgressBtn.className = 'toggle-button';
    const showRankingBtn = document.createElement('button');
    showRankingBtn.textContent = 'Ver Classificação de Caça';
    showRankingBtn.className = 'toggle-button';
    viewToggleButtons.appendChild(showProgressBtn);
    viewToggleButtons.appendChild(showRankingBtn);
    wrapper.appendChild(viewToggleButtons);
    const contentArea = document.createElement('div');
    contentArea.id = "progress-content-area";
    wrapper.appendChild(contentArea);
    const showNewProgressPanel = () => {
        showProgressBtn.classList.add('active');
        showRankingBtn.classList.remove('active');
        updateNewProgressPanel(contentArea);
    };
    showProgressBtn.onclick = showNewProgressPanel;
    showRankingBtn.onclick = () => {
        showRankingBtn.classList.add('active');
        showProgressBtn.classList.remove('active');
        renderHuntingRankingView(contentArea);
    };
    const backupRestoreContainer = document.createElement('div');
    backupRestoreContainer.style.cssText = 'display: flex; flex-direction: column; gap: 10px; margin-top: 20px; align-items: center;';
    const exportButton = document.createElement('button');
    exportButton.id = 'export-progress-btn';
    exportButton.className = 'back-button';
    exportButton.innerHTML = '<i class="fas fa-download"></i> Fazer Backup (JSON)';
    exportButton.onclick = exportUserData;
    backupRestoreContainer.appendChild(exportButton);
    const importLabel = document.createElement('label');
    importLabel.htmlFor = 'import-file-input';
    importLabel.className = 'back-button';
    importLabel.style.cssText = 'display: block; width: fit-content; cursor: pointer; background-color: var(--inprogress-color); color: #111;';
    importLabel.innerHTML = '<i class="fas fa-upload"></i> Restaurar Backup (JSON)';
    backupRestoreContainer.appendChild(importLabel);
    const importInput = document.createElement('input');
    importInput.type = 'file';
    importInput.id = 'import-file-input';
    importInput.accept = '.json';
    importInput.style.display = 'none';
    importInput.addEventListener('change', importUserData);
    backupRestoreContainer.appendChild(importInput);
    wrapper.appendChild(backupRestoreContainer);
    const resetButton = document.createElement('button');
    resetButton.id = 'progress-reset-button';
    resetButton.textContent = 'Resetar Todo o Progresso';
    resetButton.className = 'back-button';
    resetButton.style.cssText = 'background-color: #d9534f; border-color: #d43f3a; margin-top: 20px;';
    resetButton.onclick = async () => {
        if (await showCustomAlert('Tem certeza que deseja apagar TODO o seu progresso? Esta ação não pode ser desfeita.', 'Resetar Progresso', true)) {
            savedData = getDefaultDataStructure();
            saveDataAndUpdateUI(savedData);
        }
    };
    container.appendChild(wrapper);
    container.appendChild(resetButton);
    showNewProgressPanel();
}

function updateNewProgressPanel(container) {
    container.innerHTML = '';
    const panel = document.createElement('div');
    panel.id = 'progress-panel-v2';
    const overallProgress = calcularOverallProgress();
    const overallSection = document.createElement('div');
    overallSection.innerHTML = `
        <div class="progress-v2-header">
            <h3>Progresso Geral do Caçador</h3>
            <p>Sua jornada de caça em um piscar de olhos.</p>
        </div>
    `;
    const overallGrid = document.createElement('div');
    overallGrid.className = 'overall-progress-grid';
    const categories = [
        { key: 'rares', label: 'Pelagens Raras', collected: overallProgress.collectedRares, total: overallProgress.totalRares },
        { key: 'diamonds', label: 'Diamantes', collected: overallProgress.collectedDiamonds, total: overallProgress.totalDiamonds },
        { key: 'greats', label: 'Great Ones', collected: overallProgress.collectedGreatOnes, total: overallProgress.totalGreatOnes },
        { key: 'super_raros', label: 'Super Raros', collected: overallProgress.collectedSuperRares, total: overallProgress.totalSuperRares }
    ];
    categories.forEach(cat => {
        const percentage = cat.total > 0 ? Math.round((cat.collected / cat.total) * 100) : 0;
        const radius = 54;
        const circumference = 2 * Math.PI * radius;
        const offset = circumference - (percentage / 100) * circumference;
        const card = document.createElement('div');
        card.className = `progress-dial-card ${cat.key}`;
        card.innerHTML = `
            <div class="progress-dial">
                <svg viewBox="0 0 120 120">
                    <circle class="progress-dial-bg" cx="60" cy="60" r="${radius}"></circle>
                    <circle class="progress-dial-value" cx="60" cy="60" r="${radius}"
                            stroke-dasharray="${circumference}"
                            stroke-dashoffset="${offset}"></circle>
                </svg>
                <div class="progress-dial-percentage">${percentage}%</div>
            </div>
            <div class="progress-dial-label">${cat.label}</div>
            <div class="progress-dial-counts">${cat.collected} / ${cat.total}</div>
        `;
        overallGrid.appendChild(card);
    });
    overallSection.appendChild(overallGrid);
    panel.appendChild(overallSection);
    const reservesSection = document.createElement('div');
    reservesSection.innerHTML = `
        <div class="progress-v2-header">
            <h3>Domínio das Reservas</h3>
            <p>Seu progresso em cada território de caça.</p>
        </div>
    `;
    const reservesGrid = document.createElement('div');
    reservesGrid.className = 'reserve-progress-container';
    Object.entries(reservesData).sort(([, a], [, b]) => a.name.localeCompare(b.name)).forEach(([reserveKey, reserve]) => {
        const reserveProgress = calcularReserveProgress(reserveKey);
        const totalItems = reserveProgress.totalRares + reserveProgress.totalDiamonds + reserveProgress.totalGreatOnes;
        const collectedItems = reserveProgress.collectedRares + reserveProgress.collectedDiamonds + reserveProgress.collectedGreatOnes;
        const percentage = totalItems > 0 ? Math.round((collectedItems / totalItems) * 100) : 0;
        if (totalItems > 0) {
            const card = document.createElement('div');
            card.className = 'reserve-progress-card';
            card.innerHTML = `
                <div class="reserve-progress-header">
                    <img src="${reserve.image.replace('.png', '_logo.png')}" onerror="this.style.display='none'">
                    <span>${reserve.name}</span>
                </div>
                <div class="reserve-progress-bar-area">
                    <div class="reserve-progress-bar-bg">
                        <div class="reserve-progress-bar-fill" style="width: ${percentage}%"></div>
                    </div>
                    <div class="reserve-progress-details">
                        <span>${collectedItems} / ${totalItems} Coletados</span>
                        <span>${percentage}% Completo</span>
                    </div>
                </div>
            `;
            reservesGrid.appendChild(card);
        }
    });
    reservesSection.appendChild(reservesGrid);
    panel.appendChild(reservesSection);
    container.appendChild(panel);
}

function createLatestAchievementsPanel() {
    const panel = document.createElement('div');
    panel.className = 'latest-achievements-panel';
    panel.innerHTML = '<h3><i class="fas fa-star"></i> Últimas Conquistas</h3>';
    const grid = document.createElement('div');
    grid.className = 'achievements-grid';
    const allTrophies = [];
    if(savedData.diamantes) {
        Object.entries(savedData.diamantes).forEach(([slug, trophies]) => {
            const animalName = items.find(i => slugify(i) === slug) || slug;
            trophies.forEach(trophy => allTrophies.push({ id: trophy.id, animalName, furName: trophy.type, slug, type: 'diamante' }));
        });
    }
    if(savedData.greats) {
        Object.entries(savedData.greats).forEach(([slug, greatOneData]) => {
            const animalName = items.find(i => slugify(i) === slug) || slug;
            if(greatOneData.furs) {
                Object.entries(greatOneData.furs).forEach(([furName, furData]) => {
                    (furData.trophies || []).forEach(trophy => allTrophies.push({ id: new Date(trophy.date).getTime(), animalName, furName, slug, type: 'greatone' }));
                });
            }
        });
    }
    if (allTrophies.length === 0) {
        grid.innerHTML = '<p style="color: var(--text-color-muted); grid-column: 1 / -1;">Nenhum troféu de destaque registrado ainda.</p>';
    } else {
        allTrophies.sort((a, b) => b.id - a.id).slice(0, 4).forEach(trophy => {
            const card = document.createElement('div');
            card.className = 'achievement-card';
            const rotation = Math.random() * 6 - 3;
            card.style.transform = `rotate(${rotation}deg)`;
            card.addEventListener('mouseenter', () => card.style.zIndex = 10);
            card.addEventListener('mouseleave', () => card.style.zIndex = 1);
            const animalSlug = trophy.slug;
            let imagePathString;
            if (trophy.type === 'diamante') {
                const gender = trophy.furName.toLowerCase().includes('macho') ? 'macho' : 'femea';
                const pureFurName = trophy.furName.replace(/^(macho|fêmea)\s/i, '').trim();
                const furSlug = slugify(pureFurName);
                const specificPath = `animais/pelagens/${animalSlug}_${furSlug}_${gender}.png`;
                const neutralPath = `animais/pelagens/${animalSlug}_${furSlug}.png`;
                const basePath = `animais/${animalSlug}.png`;
                imagePathString = `src="${specificPath}" onerror="this.onerror=null; this.src='${neutralPath}'; this.onerror=null; this.src='${basePath}'; this.onerror=null; this.src='animais/placeholder.jpg';"`;
            } else if (trophy.type === 'greatone') {
                const furSlug = slugify(trophy.furName);
                const specificPath = `animais/pelagens/great_${animalSlug}_${furSlug}.png`;
                const basePath = `animais/${animalSlug}.png`;
                imagePathString = `src="${specificPath}" onerror="this.onerror=null; this.src='${basePath}'; this.onerror=null; this.src='animais/placeholder.jpg';"`;
            } else {
                imagePathString = `src="animais/${animalSlug}.jpg" onerror="this.onerror=null;this.src='animais/placeholder.jpg';"`;
            }
            card.innerHTML = `
                <img ${imagePathString}>
                <div class="achievement-card-info">
                    <div class="animal-name">${trophy.animalName}</div>
                    <div class="fur-name">${trophy.furName.replace(' Diamante','')}</div>
                </div>
            `;
            grid.appendChild(card);
        });
    }
    panel.appendChild(grid);
    return panel;
}

function openImageViewer(imageUrl) {
    const modal = document.getElementById('image-viewer-modal');
    modal.innerHTML = `
        <span class="modal-close" onclick="closeModal('image-viewer-modal')">&times;</span>
        <img class="modal-content-viewer" src="${imageUrl}" alt="Imagem em tela cheia">
    `;
    const modalImg = modal.querySelector('.modal-content-viewer');
    if (modalImg) {
        modalImg.style.maxWidth = '90%';
        modalImg.style.maxHeight = '90%';
        modalImg.style.objectFit = 'contain';
    }
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

function getCompleteTrophyInventory() {
    const inventory = [];
    if (savedData.pelagens) {
        for (const slug in savedData.pelagens) {
            for (const furName in savedData.pelagens[slug]) {
                if (savedData.pelagens[slug][furName] === true) {
                    const gender = furName.toLowerCase().startsWith('macho') ? 'macho' : 'femea';
                    const pureFur = furName.replace(/^(macho|fêmea)\s/i, '').trim();
                    inventory.push({ slug, gender, type: 'Pelagem Rara', detail: pureFur });
                }
            }
        }
    }
    if (savedData.diamantes) {
        for (const slug in savedData.diamantes) {
            savedData.diamantes[slug].forEach(trophy => {
                const gender = trophy.type.toLowerCase().startsWith('macho') ? 'macho' : 'femea';
                inventory.push({ slug, gender, type: 'Diamante', detail: `Pontuação ${trophy.score}` });
            });
        }
    }
    if (savedData.super_raros) {
        for (const slug in savedData.super_raros) {
            for (const furName in savedData.super_raros[slug]) {
                if (savedData.super_raros[slug][furName] === true) {
                    const gender = furName.toLowerCase().startsWith('macho') ? 'macho' : 'femea';
                    const pureFur = furName.replace(/^(macho|fêmea)\s/i, '').trim();
                    inventory.push({ slug, gender, type: 'Super Raro', detail: pureFur });
                }
            }
        }
    }
    if (savedData.greats) {
        for (const slug in savedData.greats) {
            if (savedData.greats[slug].furs) {
                for (const furName in savedData.greats[slug].furs) {
                    if (savedData.greats[slug].furs[furName].trophies?.length > 0) {
                        savedData.greats[slug].furs[furName].trophies.forEach(trophy => {
                            inventory.push({ slug, gender: 'macho', type: 'Grande', detail: furName });
                        });
                    }
                }
            }
        }
    }
    return inventory;
}

function checkMountRequirements(requiredAnimals) {
    const inventory = getCompleteTrophyInventory();
    const fulfillmentRequirements = [];
    let isComplete = true;
    const availableInventory = [...inventory];
    for (const requirement of requiredAnimals) {
        let fulfilled = false;
        let fulfillmentTrophy = null;
        const foundIndex = availableInventory.findIndex(trophy =>
            trophy.slug === requirement.slug &&
            trophy.gender === requirement.gender
        );
        if (foundIndex !== -1) {
            fulfilled = true;
            fulfillmentTrophy = availableInventory[foundIndex];
            availableInventory.splice(foundIndex, 1);
        } else {
            isComplete = false;
        }
        fulfillmentRequirements.push({ met: fulfilled, requirement: requirement, trophy: fulfillmentTrophy });
    }
    return { isComplete, fulfillmentRequirements };
}

function renderMultiMountsView(container) {
    container.innerHTML = '';
    const grid = document.createElement('div');
    grid.className = 'mounts-grid';
    container.appendChild(grid);
    const sortedMounts = Object.entries(multiMountsData).sort((a, b) => a[1].name.localeCompare(b[1].name));
    sortedMounts.forEach(([mountKey, mount]) => {
        const status = checkMountRequirements(mount.animals);
        const progressCount = status.fulfillmentRequirements.filter(r => r.met).length;
        const card = document.createElement('div');
        card.className = `mount-card ${status.isComplete ? 'completed' : 'incomplete'}`;
        card.dataset.mountKey = mountKey;
        let animalsHTML = '<div class="mount-card-animals">';
        mount.animals.forEach(animal => {
            animalsHTML += `<img src="animais/${animal.slug}.png" title="${animal.slug}" onerror="this.style.display='none'">`;
        });
        animalsHTML += '</div>';
        card.innerHTML = `
            <div class="mount-card-header">
                <h3>${mount.name}</h3>
                <div class="mount-progress">${progressCount} / ${mount.animals.length}</div>
            </div>
            ${status.isComplete ? '<div class="mount-completed-banner"><i class="fas fa-check"></i></div>' : ''}
        `;
        card.addEventListener('click', () => renderMultiMountDetailModal(mountKey));
        grid.appendChild(card);
    });
}

function renderMultiMountDetailModal(mountKey) {
    const mount = multiMountsData[mountKey];
    if (!mount) return;
    const status = checkMountRequirements(mount.animals);
    const modal = document.getElementById('form-modal');
    modal.innerHTML = '';
    modal.className = 'modal-overlay form-modal';
    const modalContent = document.createElement('div');
    modalContent.className = 'modal-content-box';
    modalContent.innerHTML = `<h3><i class="fas fa-trophy"></i> Detalhes: ${mount.name}</h3>`;
    const detailList = document.createElement('ul');
    detailList.className = 'mount-detail-list';
    status.fulfillmentRequirements.forEach(fulfillment => {
        const req = fulfillment.requirement;
        const trophy = fulfillment.trophy;
        const animalName = items.find(item => slugify(item) === req.slug) || req.slug;
        const genderIcon = req.gender === 'macho' ? 'fa-mars' : 'fa-venus';
        const li = document.createElement('li');
        li.className = 'mount-detail-item';
        let bodyHTML = '';
        if (fulfillment.met) {
            bodyHTML = `<div class="detail-item-body"><i class="fas fa-check-circle"></i> Obtido com: <strong>${trophy.type}</strong> (${trophy.detail})</div>`;
        } else {
            bodyHTML = `<div class="detail-item-body"><i class="fas fa-times-circle"></i> Pendente</div>`;
        }
        li.innerHTML = `
            <div class="detail-item-header">
                <i class="fas ${genderIcon}"></i><span>${animalName}</span>
            </div>
            ${bodyHTML}
        `;
        detailList.appendChild(li);
    });
    modalContent.appendChild(detailList);
    const buttonsDiv = document.createElement('div');
    buttonsDiv.className = 'modal-buttons';
    const closeBtn = document.createElement('button');
    closeBtn.className = 'back-button';
    closeBtn.textContent = 'Fechar';
    closeBtn.onclick = () => closeModal('form-modal');
    buttonsDiv.appendChild(closeBtn);
    modalContent.appendChild(buttonsDiv);
    modal.appendChild(modalContent);
    modal.style.display = 'flex';
}

function renderGrindHubView(container) {
    container.innerHTML = `<div class="grind-hub-container"></div>`;
    const hubContainer = container.querySelector('.grind-hub-container');
    const newGrindButton = document.createElement('div');
    newGrindButton.className = 'new-grind-btn';
    newGrindButton.innerHTML = `<i class="fas fa-plus-circle"></i><span>Iniciar Novo Grind</span>`;
    newGrindButton.onclick = () => renderNewGrindAnimalSelection(container);
    hubContainer.appendChild(newGrindButton);
    const existingGrindsTitle = document.createElement('h3');
    existingGrindsTitle.className = 'existing-grinds-title';
    existingGrindsTitle.innerHTML = '<i class="fas fa-history"></i> Grinds em Andamento';
    hubContainer.appendChild(existingGrindsTitle);
    const grid = document.createElement('div');
    grid.className = 'grinds-grid';
    hubContainer.appendChild(grid);
    if (savedData.grindSessions && savedData.grindSessions.length > 0) {
        savedData.grindSessions.forEach(session => {
            const reserve = reservesData[session.reserveKey];
            const animalName = items.find(item => slugify(item) === session.animalSlug);
            const counts = session.counts;
            const card = document.createElement('div');
            card.className = 'grind-card';
            card.addEventListener('click', () => renderGrindCounterView(session.id));
            card.innerHTML = `
                <img src="animais/${session.animalSlug}.png" class="grind-card-bg-silhouette" onerror="this.style.display='none'">
                <div class="grind-card-content">
                    <div class="grind-card-header">
                        <span class="grind-card-animal-name">${animalName}</span>
                        <span class="grind-card-reserve-name"><i class="fas fa-map-marker-alt"></i> ${reserve.name}</span>
                    </div>
                    <div class="grind-card-stats-grid">
                        <div class="grind-stat">
                            <i class="fas fa-crosshairs"></i>
                            <span>${counts.total || 0}</span>
                        </div>
                        <div class="grind-stat">
                            <i class="fas fa-gem"></i>
                            <span>${counts.diamonds || 0}</span>
                        </div>
                        <div class="grind-stat">
                            <i class="fas fa-paw"></i>
                            <span>${counts.rares?.length || 0}</span>
                        </div>
                    </div>
                </div>
            `;
            grid.appendChild(card);
        });
    } else {
        grid.innerHTML = '<p class="no-grinds-message">Nenhum grind iniciado. Clique no botão acima para começar!</p>';
    }
}

function renderNewGrindAnimalSelection(container) {
    container.innerHTML = '<h2>Selecione um Animal para o Novo Grind</h2>';
    const filterInput = document.createElement('input');
    filterInput.type = 'text';
    filterInput.className = 'filter-input';
    filterInput.placeholder = 'Buscar animal...';
    container.appendChild(filterInput);
    const albumGrid = document.createElement('div');
    albumGrid.className = 'album-grid';
    container.appendChild(albumGrid);
    (items || []).sort((a, b) => a.localeCompare(b)).forEach(name => {
        const slug = slugify(name);
        const card = document.createElement('div');
        card.className = 'animal-card';
        card.innerHTML = `<img src="animais/${slug}.png" alt="${name}" onerror="this.onerror=null;this.src='animais/placeholder.png';"><div class="info">${name}</div>`;
        card.addEventListener('click', () => renderReserveSelectionForGrind(container, slug));
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

async function renderReserveSelectionForGrind(container, animalSlug) {
    const animalName = items.find(item => slugify(item) === animalSlug);
    container.innerHTML = `<h2>Onde você vai grindar ${animalName}?</h2>`;
    const grid = document.createElement('div');
    grid.className = 'reserves-grid';
    container.appendChild(grid);
    const availableReserves = Object.entries(reservesData).filter(([, reserveData]) => reserveData.animals.includes(animalSlug)).sort(([, a], [, b]) => a.name.localeCompare(b.name));
    if (availableReserves.length === 0) {
        grid.innerHTML = `<p class="no-grinds-message">Nenhuma reserva encontrada para caçar ${animalName}.</p>`;
        return;
    }
    for (const [reserveKey, reserve] of availableReserves) {
        const card = document.createElement('div');
        card.className = 'reserve-card';
        card.innerHTML = `
            <div class="reserve-image-container">
                <img class="reserve-card-image" src="${reserve.image}" onerror="this.style.display='none'">
            </div>
            <div class="reserve-card-info-panel">
                <img src="${reserve.image.replace('.png', '_logo.png')}" class="reserve-card-logo" alt="${reserve.name}" onerror="this.style.display='none'">
            </div>
        `;
        card.addEventListener('click', async () => {
            const existingSession = savedData.grindSessions.find(s => s.animalSlug === animalSlug && s.reserveKey === reserveKey);
            if(existingSession) {
                await showCustomAlert('Um grind para este animal nesta reserva já existe. Abrindo o grind existente.');
                renderGrindCounterView(existingSession.id);
                return;
            }
            const newSessionId = `grind_${Date.now()}`;
            const newSession = { id: newSessionId, animalSlug: animalSlug, reserveKey: reserveKey, counts: { total: 0, diamonds: 0, trolls: 0, rares: [], super_rares: [], great_ones: [] } };
            savedData.grindSessions.push(newSession);
            saveDataAndUpdateUI(savedData);
            renderGrindCounterView(newSessionId);
        });
        grid.appendChild(card);
    }
}

async function renderGrindCounterView(sessionId) {
    const session = savedData.grindSessions.find(s => s.id === sessionId);
    if (!session) { console.error("Sessão de grind não encontrada!", sessionId); renderMainView('grind'); return; }
    const counts = {
        total: session.counts.total || 0,
        diamonds: session.counts.diamonds || 0,
        trolls: session.counts.trolls || 0,
        rares: session.counts.rares || [],
        super_rares: session.counts.super_rares || [],
        great_ones: session.counts.great_ones || []
    };
    session.counts = counts;
    const { animalSlug, reserveKey } = session;
    const mainContent = document.querySelector('.main-content');
    const container = mainContent.querySelector('.content-container');
    const animalName = items.find(item => slugify(item) === animalSlug);
    const reserveName = reservesData[reserveKey].name;
    mainContent.querySelector('.page-header h2').textContent = `Contador de Grind`;
    const backButton = mainContent.querySelector('.page-header .back-button');
    backButton.innerHTML = `&larr; Voltar para o Hub de Grind`;
    backButton.onclick = () => renderMainView('grind');
    container.innerHTML = `
        <div class="grind-container">
            <div class="grind-header">
                <div class="grind-header-info">
                    <img src="animais/${animalSlug}.png" class="grind-animal-icon" onerror="this.style.display='none'">
                    <div>
                        <h2>${animalName.toUpperCase()}</h2>
                        <span><i class="fas fa-map-marker-alt"></i> Em ${reserveName}</span>
                    </div>
                </div>
            </div>
            <div class="counters-wrapper">
                <div class="grind-counter-item diamond" data-type="diamonds"><div class="grind-counter-header"><i class="fas fa-gem"></i><span>Diamantes</span></div><div class="grind-counter-body"><button class="grind-counter-btn decrease"><i class="fas fa-minus"></i></button><span class="grind-counter-value">${counts.diamonds}</span><button class="grind-counter-btn increase"><i class="fas fa-plus"></i></button></div></div>
                <div class="grind-counter-item rare" data-type="rares" data-detailed="true"><div class="grind-counter-header"><i class="fas fa-paw"></i><span>Raros</span></div><div class="grind-counter-body"><button class="grind-counter-btn decrease"><i class="fas fa-minus"></i></button><span class="grind-counter-value">${counts.rares.length}</span><button class="grind-counter-btn increase"><i class="fas fa-plus"></i></button></div></div>
                <div class="grind-counter-item troll" data-type="trolls"><div class="grind-counter-header"><i class="fas fa-star-half-alt"></i><span>Trolls</span></div><div class="grind-counter-body"><button class="grind-counter-btn decrease"><i class="fas fa-minus"></i></button><span class="grind-counter-value">${counts.trolls}</span><button class="grind-counter-btn increase"><i class="fas fa-plus"></i></button></div></div>
                <div class="grind-counter-item great-ones" data-type="great_ones" data-detailed="true"><div class="grind-counter-header"><i class="fas fa-crown"></i><span>Great One</span></div><div class="grind-counter-body"><button class="grind-counter-btn decrease"><i class="fas fa-minus"></i></button><span class="grind-counter-value">${counts.great_ones.length}</span><button class="grind-counter-btn increase"><i class="fas fa-plus"></i></button></div></div>
                <div class="grind-counter-item super-rare" data-type="super_rares" data-detailed="true"><div class="grind-counter-header"><i class="fas fa-star"></i><span>Super Raros</span></div><div class="grind-counter-body"><button class="grind-counter-btn decrease"><i class="fas fa-minus"></i></button><span class="grind-counter-value">${counts.super_rares.length}</span><button class="grind-counter-btn increase"><i class="fas fa-plus"></i></button></div></div>
                <div class="grind-counter-item total-kills" data-type="total"><div class="grind-counter-header"><i class="fas fa-crosshairs"></i><span>Total de Abatimentos</span></div><div class="grind-counter-body"><button class="grind-counter-btn decrease"><i class="fas fa-minus"></i></button><span class="grind-counter-value" id="total-kills-value">${counts.total}</span><button class="grind-counter-btn increase"><i class="fas fa-plus"></i></button></div></div>
            </div>
            <button id="delete-grind-btn" class="back-button">Excluir este Grind</button>
        </div>`;
    container.querySelectorAll('.grind-counter-btn').forEach(button => {
        button.addEventListener('click', async (e) => {
            e.stopPropagation();
            const isIncrease = button.classList.contains('increase');
            const counterItem = button.closest('.grind-counter-item');
            const type = counterItem.dataset.type;
            const isDetailed = counterItem.dataset.detailed === 'true';
            const currentSession = savedData.grindSessions.find(s => s.id === sessionId);
            if (!currentSession) return;
            if (isIncrease) {
                if (type === 'total') {
                    currentSession.counts.total++;
                }
                else if (isDetailed) { openGrindDetailModal(sessionId, type); return; }
                else { currentSession.counts[type]++; }
            } else {
                if (type === 'total') {
                    if (currentSession.counts.total > 0) { currentSession.counts.total--; }
                }
                else if (isDetailed) {
                    if (currentSession.counts[type].length > 0) {
                        const lastItem = currentSession.counts[type][currentSession.counts[type].length - 1];
                        const cleanVariationName = lastItem.variation.replace(/^(Macho|Fêmea)\s|\sDiamante$/gmi, '').trim();
                        if (await showCustomAlert(`Tem certeza que deseja remover o último item registrado: "${cleanVariationName}"?`, 'Confirmar Exclusão', true)) {
                            currentSession.counts[type].pop();
                        }
                    }
                } else {
                    if (currentSession.counts[type] > 0) { currentSession.counts[type]--; }
                }
            }
            saveDataAndUpdateUI(savedData);
            renderGrindCounterView(sessionId);
        });
    });
    const totalKillsValue = container.querySelector('#total-kills-value');
    if (totalKillsValue) {
        totalKillsValue.addEventListener('click', (e) => {
            e.stopPropagation();
            const body = totalKillsValue.parentElement;
            if (body.querySelector('input')) return;
            const currentTotal = session.counts.total || 0;
            body.innerHTML = `
                <button class="grind-counter-btn decrease"><i class="fas fa-minus"></i></button>
                <input type="number" class="grind-total-input" value="${currentTotal}">
                <button class="grind-counter-btn increase"><i class="fas fa-plus"></i></button>
            `;
            const input = body.querySelector('input');
            input.focus();
            input.select();
            const saveNewTotal = () => {
                const newValue = parseInt(input.value, 10);
                if (!isNaN(newValue) && newValue >= 0) {
                    session.counts.total = newValue;
                    saveDataAndUpdateUI(savedData);
                }
                renderGrindCounterView(sessionId);
            };
            input.addEventListener('blur', saveNewTotal);
            input.addEventListener('keydown', (e) => {
                if (e.key === 'Enter') saveNewTotal();
                else if (e.key === 'Escape') renderGrindCounterView(sessionId);
            });
        });
    }
    container.querySelector('#delete-grind-btn').addEventListener('click', async () => {
        if (await showCustomAlert(`Tem certeza que deseja excluir o grind de ${animalName} em ${reserveName}?`, 'Excluir Grind', true)) {
            const sessionIndex = savedData.grindSessions.findIndex(s => s.id === sessionId);
            if (sessionIndex > -1) {
                savedData.grindSessions.splice(sessionIndex, 1);
                saveDataAndUpdateUI(savedData);
                renderMainView('grind');
            }
        }
    });
}

function syncTrophyToAlbum(animalSlug, rarityType, details) {
    if (!savedData) return;
    switch(rarityType) {
        case 'rares':
            if (!savedData.pelagens) savedData.pelagens = {};
            if (!savedData.pelagens[animalSlug]) savedData.pelagens[animalSlug] = {};
            savedData.pelagens[animalSlug][details.variation] = true;
            console.log(`Sincronizado: Pelagem Rara '${details.variation}' para ${animalSlug}`);
            break;
        case 'super_raros':
            if (!savedData.super_raros) savedData.super_raros = {};
            if (!savedData.super_raros[animalSlug]) savedData.super_raros[animalSlug] = {};
            const superRareKey = details.variation;
            savedData.super_raros[animalSlug][superRareKey] = true;
            console.log(`Sincronizado: Super Raro '${superRareKey}' para ${animalSlug}`);
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
            console.log(`Sincronizado: Great One '${details.variation}' para ${animalSlug} com detalhes do grind.`);
            break;
    }
}

async function openGrindDetailModal(sessionId, rarityType) {
    const session = savedData.grindSessions.find(s => s.id === sessionId);
    if (!session) return;
    const { animalSlug } = session;
    let options = [];
    let title = "Registrar ";
    switch (rarityType) {
        case 'rares':
            title += "Pelagem Rara";
            const furData = rareFursData[animalSlug];
            if (furData) {
                if (furData.macho) furData.macho.forEach(fur => options.push(`Macho ${fur}`));
                if (furData.femea) furData.femea.forEach(fur => options.push(`Fêmea ${fur}`));
            }
            break;
        case 'super_raros':
            title += "Super Raro";
            const speciesRareFurs = rareFursData[animalSlug];
            const speciesDiamondData = diamondFursData[animalSlug];
            if (speciesRareFurs) {
                if (speciesRareFurs.macho && (speciesDiamondData?.macho?.length || 0) > 0) {
                    speciesRareFurs.macho.forEach(rareFur => {
                        options.push(`Macho ${rareFur}`);
                    });
                }
                if (speciesRareFurs.femea && (speciesDiamondData?.femea?.length || 0) > 0) {
                    speciesRareFurs.femea.forEach(rareFur => {
                        options.push(`Fêmea ${rareFur}`);
                    });
                }
            }
            break;
        case 'great_ones':
            title += "Great One";
            const greatData = greatsFursData[animalSlug];
            if (greatData) {
                options = greatData;
            }
            break;
    }
    if (options.length === 0) {
        await showCustomAlert(`Nenhuma variação de '${rarityType.replace('_', ' ')}' encontrada para este animal.`, 'Aviso');
        return;
    }
    const modal = document.getElementById('form-modal');
    modal.innerHTML = `
        <div class="modal-content-box">
            <h3>${title}</h3>
            <select id="grind-detail-modal-select">
                ${options.map(opt => `<option value="${opt}">${opt}</option>`).join('')}
            </select>
            <div class="modal-buttons">
                <button id="grind-detail-cancel" class="back-button">Cancelar</button>
                <button id="grind-detail-save" class="back-button" style="background-color: var(--primary-color); color: #111;">Salvar</button>
            </div>
        </div>
    `;
    modal.querySelector('#grind-detail-cancel').onclick = () => closeModal('form-modal');
    modal.querySelector('#grind-detail-save').onclick = () => {
        const select = document.getElementById('grind-detail-modal-select');
        const selectedValue = select.value;
        const logDetails = {
            variation: selectedValue,
            grindCounts: session.counts
        };
        const newLog = { id: Date.now(), variation: selectedValue, date: new Date().toISOString() };
        if (!session.counts[rarityType]) session.counts[rarityType] = [];
        session.counts[rarityType].push(newLog);
        syncTrophyToAlbum(animalSlug, rarityType, logDetails);
        saveDataAndUpdateUI(savedData);
        closeModal('form-modal');
        renderGrindCounterView(sessionId);
    };
    modal.style.display = 'flex';
}

function getAggregatedGrindStats() {
    const allAnimalSlugs = items.map(name => slugify(name));
    const stats = {};
    allAnimalSlugs.forEach(slug => {
        stats[slug] = {
            animalSlug: slug,
            animalName: items.find(i => slugify(i) === slug) || slug,
            totalKills: 0,
            diamonds: 0,
            rares: 0,
            superRares: 0,
            greatOnes: 0
        };
    });
    if (savedData.grindSessions && savedData.grindSessions.length > 0) {
        savedData.grindSessions.forEach(session => {
            const slug = session.animalSlug;
            if (stats[slug]) {
                stats[slug].totalKills += session.counts.total || 0;
                stats[slug].diamonds += session.counts.diamonds || 0;
                stats[slug].rares += session.counts.rares?.length || 0;
                stats[slug].superRares += session.counts.super_rares?.length || 0;
                stats[slug].greatOnes += session.counts.great_ones?.length || 0;
            }
        });
    }
    return Object.values(stats).sort((a, b) => a.animalName.localeCompare(b.animalName));
}

function renderHuntingRankingView(container) {
    const stats = getAggregatedGrindStats();
    container.innerHTML = `
        <div class="ranking-header">
            <h3>Ranking de Caça</h3>
            <p>Estatísticas agregadas de todas as sessões do Contador de Grind.</p>
        </div>
        <div class="ranking-table-container">
            <table class="ranking-table">
                <thead>
                    <tr>
                        <th>Animal</th>
                        <th><i class="fas fa-crosshairs"></i> Abates</th>
                        <th><i class="fas fa-gem"></i> Diamantes</th>
                        <th><i class="fas fa-paw"></i> Raros</th>
                        <th><i class="fas fa-star"></i> Super Raros</th>
                        <th><i class="fas fa-crown"></i> Great Ones</th>
                    </tr>
                </thead>
                <tbody>
                    ${stats.map(animalStat => `
                        <tr>
                            <td data-label="Animal">
                                <img src="animais/${animalStat.animalSlug}.png" class="table-animal-icon" onerror="this.style.display='none'">
                                <span>${animalStat.animalName}</span>
                            </td>
                            <td data-label="Abates">${animalStat.totalKills}</td>
                            <td data-label="Diamantes">${animalStat.diamonds}</td>
                            <td data-label="Raros">${animalStat.rares}</td>
                            <td data-label="Super Raros">${animalStat.superRares}</td>
                            <td data-label="Grandes">${greatsFursData[animalStat.animalSlug] ? animalStat.greatOnes : 'N/A'}</td>
                        </tr>
                    `).join('')}
                </tbody>
            </table>
        </div>
    `;
}

function exportUserData() {
    if (!currentUser || !savedData) {
        showCustomAlert('Nenhum dado para exportar. Faça login primeiro.', 'Erro de Exportação');
        return;
    }
    const dataStr = JSON.stringify(savedData, null, 2);
    const blob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `thehunter_album_backup_${currentUser.uid}_${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    showCustomAlert('Seu progresso foi exportado com sucesso!', 'Backup Criado');
}

async function importUserData(event) {
    if (!currentUser) {
        await showCustomAlert('Faça login antes de tentar importar dados.', 'Erro de Importação');
        return;
    }
    const file = event.target.files[0];
    if (!file) return;
    if (file.type !== 'application/json') {
        await showCustomAlert('Por favor, selecione um arquivo JSON válido.', 'Erro de Arquivo');
        return;
    }
    const reader = new FileReader();
    reader.onload = async (e) => {
        try {
            const importedData = JSON.parse(e.target.result);
            const confirmImport = await showCustomAlert(
                'Tem certeza que deseja sobrescrever seu progresso atual com os dados deste arquivo? Esta ação não pode ser desfeita.',
                'Confirmar Importação',
                true
            );
            if (confirmImport) {
                if (importedData.pelagens || importedData.diamantes || importedData.greats || importedData.super_raros || importedData.grindSessions) {
                    savedData = importedData;
                    await saveDataAndUpdateUI(savedData); // Usando a nova função
                    await showCustomAlert('Progresso importado e salvo na nuvem com sucesso!', 'Importação Concluída');
                    location.reload();
                } else {
                    await showCustomAlert('O arquivo JSON selecionado não parece ser um backup válido do álbum de caça.', 'Erro de Validação');
                }
            } else {
                await showCustomAlert('Importação cancelada.', 'Cancelado');
            }
        } catch (error) {
            console.error('Erro ao ler ou parsear o arquivo JSON:', error);
            await showCustomAlert('Erro ao ler o arquivo de backup. Certifique-se de que é um JSON válido.', 'Erro de Leitura');
        } finally {
            event.target.value = '';
        }
    };
    reader.readAsText(file);
}


// --- INICIALIZAÇÃO DO APP ---
document.addEventListener('DOMContentLoaded', () => {
    appContainer = document.getElementById('app-container');
    auth.onAuthStateChanged(async (user) => {
        if (user) {
            currentUser = user;
            appContainer.innerHTML = `<div class="loading-spinner">Carregando seus dados...</div>`;
            savedData = await FirebaseService.loadDataFromFirestore(user);
            renderNavigationHub();
        } else {
            currentUser = null;
            AuthUI.renderLoginForm(appContainer, auth);
        }
    });
    const imageModal = document.getElementById('image-viewer-modal');
    const formModal = document.getElementById('form-modal');
    [imageModal, formModal].forEach(modal => {
        if(modal) {
            const closeBtn = modal.querySelector('.modal-close');
            if (closeBtn) closeBtn.onclick = () => closeModal(modal.id);
            modal.addEventListener('click', e => {
                if (e.target === modal) closeModal(modal.id);
            });
        }
    });
    const customAlertModal = document.getElementById('custom-alert-modal');
    if (customAlertModal) {
        customAlertModal.addEventListener('click', e => {
            if (e.target === customAlertModal) customAlertModal.style.display = 'none';
        });
    }
    window.addEventListener('keydown', (event) => {
        if (event.key === 'Escape') {
            closeModal('image-viewer-modal');
            closeModal('form-modal');
            closeModal('custom-alert-modal');
        }
    });
});