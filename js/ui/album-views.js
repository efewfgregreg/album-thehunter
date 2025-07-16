// js/ui/album-views.js

// ========================================================================
// ========================== DEPENDÊNCIAS ================================
// ========================================================================
import { slugify } from '../utils.js';
import { items, categorias, rareFursData, diamondFursData, greatsFursData, reservesData, animalHotspotData, multiMountsData } from '../data.js';

// Callbacks que serão fornecidos pelo script.js
let onSaveCallback;
let onNavigateCallback;
let getSavedDataCallback;

// ========================================================================
// ========================== FUNÇÃO DE INICIALIZAÇÃO =====================
// ========================================================================

export function initAlbumViews(dependencies) {
    onSaveCallback = dependencies.onSave;
    onNavigateCallback = dependencies.onNavigate;
    getSavedDataCallback = dependencies.getSavedData;
}

// ========================================================================
// ========================== FUNÇÕES EXPORTADAS ==========================
// ========================================================================

export function renderNavigationHub(container) {
    container.innerHTML = '';
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
        card.addEventListener('click', () => onNavigateCallback(key));
        hub.appendChild(card);
    });
    container.appendChild(hub);
}

export function renderAnimalListView(container, tabKey, savedData) {
    const currentTab = categorias[tabKey];
    if (!currentTab) return;
    container.innerHTML = '';
    const filterInput = document.createElement('input');
    filterInput.type = 'text';
    filterInput.className = 'filter-input';
    filterInput.placeholder = 'Buscar animal...';
    container.appendChild(filterInput);
    const albumGrid = document.createElement('div');
    albumGrid.className = 'album-grid';
    container.appendChild(albumGrid);
    const itemsToRender = (currentTab.items || []).filter(item => typeof item === 'string' && item.trim() !== '');
    itemsToRender.sort((a, b) => a.localeCompare(b)).forEach(name => {
        const card = createAnimalCard(name, tabKey, savedData, () => showDetailView(name, tabKey, savedData));
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

export function renderReservesList(container) {
    container.innerHTML = '';
    const grid = document.createElement('div');
    grid.className = 'reserves-grid';
    container.appendChild(grid);
    const sortedReserves = Object.entries(reservesData).sort(([, a], [, b]) => a.name.localeCompare(b.name));
    for (const [reserveKey, reserve] of sortedReserves) {
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
        card.addEventListener('click', () => showReserveDetailView(reserveKey));
        grid.appendChild(card);
    }
}

export function renderMultiMountsView(container, savedData) {
    container.innerHTML = '';
    const grid = document.createElement('div');
    grid.className = 'mounts-grid';
    container.appendChild(grid);
    Object.entries(multiMountsData).sort(([,a],[,b]) => a.name.localeCompare(b.name)).forEach(([mountKey, mount]) => {
        const status = checkMountRequirements(mount.animals, savedData);
        const progressCount = status.fulfillmentRequirements.filter(r => r.met).length;
        const card = document.createElement('div');
        card.className = `mount-card ${status.isComplete ? 'completed' : 'incomplete'}`;
        card.innerHTML = `
            <div class="mount-card-header">
                <h3>${mount.name}</h3>
                <div class="mount-progress">${progressCount} / ${mount.animals.length}</div>
            </div>
            <div class="mount-card-animals">
                ${mount.animals.map(animal => `<img src="animais/${animal.slug}.png" title="${animal.slug}" onerror="this.style.display='none'">`).join('')}
            </div>
            ${status.isComplete ? '<div class="mount-completed-banner"><i class="fas fa-check"></i></div>' : ''}
        `;
        card.addEventListener('click', () => renderMultiMountDetailModal(mountKey, savedData));
        grid.appendChild(card);
    });
}

// ========================================================================
// ========= FUNÇÕES INTERNAS (NÃO EXPORTADAS) ============================
// ========================================================================

function showDetailView(name, tabKey, savedData, originReserveKey = null) {
    const mainContent = document.querySelector('.main-content');
    const contentContainer = mainContent.querySelector('.content-container');
    
    if (originReserveKey) {
        renderAnimalDossier(contentContainer, name, originReserveKey, savedData);
    } else {
        mainContent.querySelector('.page-header h2').textContent = name;
        mainContent.querySelector('.page-header .back-button').onclick = () => onNavigateCallback(tabKey);
        renderSimpleDetailView(contentContainer, name, tabKey, savedData);
    }
}

function renderSimpleDetailView(container, name, tabKey, savedData) {
    const slug = slugify(name);
    container.innerHTML = ''; 
    
    const onSave = (data) => {
        onSaveCallback(data);
        renderSimpleDetailView(container, name, tabKey, data);
    };

    if (tabKey === 'greats') renderGreatsDetailView(container, name, slug, savedData, onSave);
    else if (tabKey === 'pelagens') renderRareFursDetailView(container, name, slug, savedData, onSave);
    else if (tabKey === 'super_raros') renderSuperRareDetailView(container, name, slug, savedData, onSave);
    else if (tabKey === 'diamantes') renderDiamondsDetailView(container, name, slug, savedData, onSave);
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
    backButton.onclick = () => onNavigateCallback('reservas'); 

    const viewArea = document.createElement('div');
    viewArea.className = 'reserve-view-area';
    const toggleButtons = document.createElement('div');
    toggleButtons.className = 'reserve-view-toggle';
    const btnAnimals = document.createElement('button');
    btnAnimals.textContent = 'Animais da Reserva';
    btnAnimals.className = 'toggle-button active';
    const btnHotspots = document.createElement('button');
    btnHotspots.textContent = 'Mapas de Hotspot';
    btnHotspots.className = 'toggle-button';

    toggleButtons.appendChild(btnAnimals);
    toggleButtons.appendChild(btnHotspots);
    contentContainer.appendChild(toggleButtons);
    contentContainer.appendChild(viewArea);

    const onShowAnimalDossier = (animalName, rKey) => {
        const currentSavedData = getSavedDataCallback();
        renderAnimalDossier(contentContainer, animalName, rKey, currentSavedData);
    };

    btnAnimals.onclick = () => {
        btnAnimals.classList.add('active');
        btnHotspots.classList.remove('active');
        renderAnimalChecklist(viewArea, reserveKey, onShowAnimalDossier);
    };
    btnHotspots.onclick = () => {
        btnHotspots.classList.add('active');
        btnAnimals.classList.remove('active');
        renderHotspotGalleryView(viewArea, reserveKey);
    };

    renderAnimalChecklist(viewArea, reserveKey, onShowAnimalDossier);
}

function renderAnimalDossier(container, name, originReserveKey, savedData) {
    const mainContent = document.querySelector('.main-content');
    const slug = slugify(name);
    container.className = 'content-container dossier-view';
    container.innerHTML = '';
    mainContent.querySelector('.page-header h2').textContent = `Dossiê: ${name}`;
    const backButton = mainContent.querySelector('.page-header .back-button');
    backButton.innerHTML = `&larr; Voltar para ${reservesData[originReserveKey].name}`;
    backButton.onclick = () => showReserveDetailView(originReserveKey);
    
    const dossierTabs = document.createElement('div');
    dossierTabs.className = 'dossier-tabs';
    const dossierContent = document.createElement('div');
    dossierContent.className = 'dossier-content';
    
    const onSaveFromDossier = (data) => {
        onSaveCallback(data);
        renderAnimalDossier(container, name, originReserveKey, data);
    };
    
    const tabs = {
        hotspot: { title: 'Hotspots', renderFunc: (c) => renderHotspotDetailView(c, name, slug, originReserveKey) },
        pelagens: { title: 'Pelagens Raras', renderFunc: (c) => renderRareFursDetailView(c, name, slug, savedData, onSaveFromDossier) },
        diamantes: { title: 'Diamantes', renderFunc: (c) => renderDiamondsDetailView(c, name, slug, savedData, onSaveFromDossier) },
        super_raros: { title: 'Super Raros', renderFunc: (c) => renderSuperRareDetailView(c, name, slug, savedData, onSaveFromDossier) },
    };
    if (greatsFursData[slug]) {
        tabs.greats = { title: '<i class="fas fa-crown"></i> Great Ones', renderFunc: (c) => renderGreatsDetailView(c, name, slug, savedData, onSaveFromDossier) };
    }

    Object.entries(tabs).forEach(([key, value]) => {
        const tab = document.createElement('div');
        tab.className = 'dossier-tab';
        tab.innerHTML = value.title;
        tab.dataset.key = key;
        dossierTabs.appendChild(tab);
    });

    container.appendChild(dossierTabs);
    container.appendChild(dossierContent);
    
    dossierTabs.addEventListener('click', e => {
        const tab = e.target.closest('.dossier-tab');
        if(!tab) return;
        dossierTabs.querySelectorAll('.dossier-tab').forEach(t => t.classList.remove('active'));
        tab.classList.add('active');
        const tabKey = tab.dataset.key;
        tabs[tabKey].renderFunc(dossierContent);
    });
    
    dossierTabs.querySelector('.dossier-tab').click();
}

function createAnimalCard(name, tabKey, savedData, onClick) {
    const card = document.createElement('div');
    card.className = 'animal-card';
    const slug = slugify(name);
    card.dataset.slug = slug;
    card.innerHTML = `<img src="animais/${slug}.png" alt="${name}" onerror="this.onerror=null;this.src='animais/placeholder.png';"><div class="info">${name}</div>`;
    card.addEventListener('click', onClick);
    updateCardAppearance(card, slug, tabKey, savedData);
    return card;
}

function updateCardAppearance(card, slug, tabKey, savedData) {
    if (!card || !savedData) return;
    card.classList.remove('completed', 'inprogress', 'incomplete');
    let status = 'incomplete';
    let collectedCount = 0;
    let totalCount = 0;
    switch (tabKey) {
        case 'pelagens':
            collectedCount = Object.values(savedData.pelagens?.[slug] || {}).filter(v => v === true).length;
            totalCount = (rareFursData[slug]?.macho?.length || 0) + (rareFursData[slug]?.femea?.length || 0);
            break;
        case 'diamantes':
            collectedCount = new Set((savedData.diamantes?.[slug] || []).map(t => t.type)).size;
            totalCount = (diamondFursData[slug]?.macho?.length || 0) + (diamondFursData[slug]?.femea?.length || 0);
            break;
        case 'super_raros':
            collectedCount = Object.values(savedData.super_raros?.[slug] || {}).filter(v => v === true).length;
            const srRare = rareFursData[slug];
            const srDiamond = diamondFursData[slug];
            if (srRare) {
                if (srRare.macho && (srDiamond?.macho?.length || 0) > 0) totalCount += srRare.macho.length;
                if (srRare.femea && (srDiamond?.femea?.length || 0) > 0) totalCount += srRare.femea.length;
            }
            break;
        case 'greats':
            const goData = savedData.greats?.[slug] || {};
            const requiredFurs = greatsFursData[slug] || [];
            totalCount = requiredFurs.length;
            collectedCount = requiredFurs.filter(furName => goData.furs?.[furName]?.trophies?.length > 0).length;
            break;
    }
    if (totalCount > 0) {
        if (collectedCount >= totalCount) status = 'completed';
        else if (collectedCount > 0) status = 'inprogress';
    }
    card.classList.add(status);
}

function renderRareFursDetailView(container, name, slug, savedData, onSave) {
    container.innerHTML = '';
    const furGrid = document.createElement('div');
    furGrid.className = 'fur-grid';
    container.appendChild(furGrid);
    const speciesFurs = rareFursData[slug];
    if (!speciesFurs || (!speciesFurs.macho?.length && !speciesFurs.femea?.length)) {
        furGrid.innerHTML = '<p>Nenhuma pelagem rara listada para este animal.</p>';
        return;
    }
    const genderedFurs = [];
    if (speciesFurs.macho) speciesFurs.macho.forEach(fur => genderedFurs.push({ displayName: `Macho ${fur}`, originalName: fur, gender: 'macho' }));
    if (speciesFurs.femea) speciesFurs.femea.forEach(fur => genderedFurs.push({ displayName: `Fêmea ${fur}`, originalName: fur, gender: 'femea' }));

    genderedFurs.sort((a, b) => a.displayName.localeCompare(b.displayName)).forEach(furInfo => {
        const isCompleted = savedData.pelagens?.[slug]?.[furInfo.displayName] === true;
        const furCard = document.createElement('div');
        furCard.className = `fur-card ${isCompleted ? 'completed' : 'incomplete'}`;
        const furSlug = slugify(furInfo.originalName);
        const imagePath = `animais/pelagens/${slug}_${furSlug}_${furInfo.gender}.png`;
        const fallbackPath = `animais/${slug}.png`;
        furCard.innerHTML = `<img src="${imagePath}" onerror="this.onerror=null; this.src='${fallbackPath}';"><div class="info">${furInfo.displayName}</div><button class="fullscreen-btn" title="Ver em tela cheia">⛶</button>`;
        furCard.querySelector('.fullscreen-btn').onclick = (e) => { e.stopPropagation(); openImageViewer(furCard.querySelector('img').src); };
        
        furCard.addEventListener('click', () => {
            if (!savedData.pelagens) savedData.pelagens = {};
            if (!savedData.pelagens[slug]) savedData.pelagens[slug] = {};
            savedData.pelagens[slug][furInfo.displayName] = !isCompleted;
            onSave(savedData);
        });
        furGrid.appendChild(furCard);
    });
}

function renderDiamondsDetailView(container, name, slug, savedData, onSave) {
    container.innerHTML = '';
    const furGrid = document.createElement('div');
    furGrid.className = 'fur-grid';
    container.appendChild(furGrid);
    const speciesDiamondFurs = diamondFursData[slug];
    if (!speciesDiamondFurs || (!speciesDiamondFurs.macho?.length && !speciesDiamondFurs.femea?.length)) {
        furGrid.innerHTML = '<p>Nenhuma pelagem de diamante listada para este animal.</p>';
        return;
    }
    const allPossibleFurs = [];
    if (speciesDiamondFurs.macho) speciesDiamondFurs.macho.forEach(fur => allPossibleFurs.push({ displayName: fur, gender: 'Macho' }));
    if (speciesDiamondFurs.femea) speciesDiamondFurs.femea.forEach(fur => allPossibleFurs.push({ displayName: fur, gender: 'Fêmea' }));

    allPossibleFurs.sort((a, b) => a.displayName.localeCompare(b.displayName)).forEach(furInfo => {
        const furCard = document.createElement('div');
        const fullTrophyName = `${furInfo.gender} ${furInfo.displayName}`;
        const highestScoreTrophy = (savedData.diamantes?.[slug] || []).filter(t => t.type === fullTrophyName).reduce((max, t) => t.score > max.score ? t : max, { score: -1 });
        const isCompleted = highestScoreTrophy.score !== -1;
        furCard.className = `fur-card ${isCompleted ? 'completed' : 'incomplete'}`;
        const furSlug = slugify(furInfo.displayName);
        const genderSlug = furInfo.gender.toLowerCase();
        const imagePath = `animais/pelagens/${slug}_${furSlug}_${genderSlug}.png`;
        const fallbackPath = `animais/${slug}.png`;
        furCard.innerHTML = `<img src="${imagePath}" onerror="this.onerror=null;this.src='${fallbackPath}';"><div class="info-header"><span class="gender-tag">${furInfo.gender}</span><div class="info">${furInfo.displayName}</div></div><div class="score-container">${isCompleted ? `<span class="score-display"><i class="fas fa-trophy"></i> ${highestScoreTrophy.score}</span>` : '<span class="score-add-btn">Adicionar Pontuação</span>'}</div><button class="fullscreen-btn" title="Ver em tela cheia">⛶</button>`;
        furCard.querySelector('.fullscreen-btn').onclick = (e) => { e.stopPropagation(); openImageViewer(furCard.querySelector('img').src); };
        
        const scoreContainer = furCard.querySelector('.score-container');
        scoreContainer.addEventListener('click', e => {
            e.stopPropagation();
            if (scoreContainer.querySelector('input')) return;
            const currentScore = isCompleted ? highestScoreTrophy.score : '';
            scoreContainer.innerHTML = `<input type="number" class="score-input" value="${currentScore}" placeholder="0.0">`;
            const input = scoreContainer.querySelector('input');
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
                onSave(savedData);
            };
            input.addEventListener('blur', saveScore);
            input.addEventListener('keydown', e => { if (e.key === 'Enter') saveScore(); });
        });
        furGrid.appendChild(furCard);
    });
}

function renderGreatsDetailView(container, animalName, slug, savedData, onSave) {
    container.innerHTML = '';
    const furGrid = document.createElement('div');
    furGrid.className = 'fur-grid trophy-room';
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
            <button class="fullscreen-btn" title="Ver em tela cheia">⛶</button>`;
        furCard.querySelector('.fullscreen-btn').onclick = (e) => { e.stopPropagation(); openImageViewer(furCard.querySelector('img').src); };
        furCard.addEventListener('click', () => {
            openGreatsTrophyModal(animalName, slug, furName, savedData, onSave);
        });
        furGrid.appendChild(furCard);
    });
}

function renderSuperRareDetailView(container, name, slug, savedData, onSave) {
    container.innerHTML = '';
    const furGrid = document.createElement('div');
    furGrid.className = 'fur-grid';
    container.appendChild(furGrid);
    const speciesRareFurs = rareFursData[slug];
    const speciesDiamondData = diamondFursData[slug];
    const fursToDisplay = [];
    if (speciesRareFurs?.macho && (speciesDiamondData?.macho?.length || 0) > 0) {
        speciesRareFurs.macho.forEach(rareFur => fursToDisplay.push({ displayName: `Macho ${rareFur}`, originalName: rareFur, gender: 'macho' }));
    }
    if (speciesRareFurs?.femea && (speciesDiamondData?.femea?.length || 0) > 0) {
        speciesRareFurs.femea.forEach(rareFur => fursToDisplay.push({ displayName: `Fêmea ${rareFur}`, originalName: rareFur, gender: 'femea' }));
    }

    if (fursToDisplay.length === 0) {
        furGrid.innerHTML = '<p>Nenhuma pelagem Super Rara (rara + diamante) encontrada para este animal.</p>';
        return;
    }

    fursToDisplay.sort((a, b) => a.displayName.localeCompare(b.displayName)).forEach(furInfo => {
        const isCompleted = savedData.super_raros?.[slug]?.[furInfo.displayName] === true;
        const furCard = document.createElement('div');
        furCard.className = `fur-card ${isCompleted ? 'completed' : 'incomplete'} potential-super-rare`;
        const furSlug = slugify(furInfo.originalName);
        const imagePath = `animais/pelagens/${slug}_${furSlug}_${furInfo.gender}.png`;
        const fallbackPath = `animais/${slug}.png`;
        furCard.innerHTML = `<img src="${imagePath}" onerror="this.onerror=null; this.src='${fallbackPath}';"><div class="info">${furInfo.displayName}</div><button class="fullscreen-btn" title="Ver em tela cheia">⛶</button>`;
        furCard.querySelector('.fullscreen-btn').onclick = (e) => { e.stopPropagation(); openImageViewer(furCard.querySelector('img').src); };
        
        furCard.addEventListener('click', () => {
            if (!savedData.super_raros) savedData.super_raros = {};
            if (!savedData.super_raros[slug]) savedData.super_raros[slug] = {};
            savedData.super_raros[slug][furInfo.displayName] = !isCompleted;
            onSave(savedData);
        });
        furGrid.appendChild(furCard);
    });
}

function renderAnimalChecklist(container, reserveKey, onShowAnimalDossier) {
    container.innerHTML = '';
    const checklistContainer = document.createElement('div');
    checklistContainer.className = 'animal-checklist';
    container.appendChild(checklistContainer);
    const reserve = reservesData[reserveKey];
    const animalNames = reserve.animals.map(slug => items.find(item => slugify(item) === slug)).filter(Boolean);

    animalNames.sort((a,b) => a.localeCompare(b)).forEach(animalName => {
        const slug = slugify(animalName);
        const row = document.createElement('div');
        row.className = 'animal-checklist-row';
        row.innerHTML = `
            <img class="animal-icon" src="animais/${slug}.png" onerror="this.src='animais/placeholder.png'">
            <div class="animal-name">${animalName}</div>
            <i class="fas fa-info-circle"></i>
        `;
        row.addEventListener('click', () => onShowAnimalDossier(animalName, reserveKey));
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
        .filter(animal => animal.name && animalHotspotData[reserveKey]?.[animal.slug]);

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
                <div class="info-row"><strong>Peso Máx (Est.):</strong> <span>${hotspotInfo.maxWeightEstimate || 'N/A'}</span></div>
                <div class="info-row"><strong>Zonas de Bebida:</strong> <span>${hotspotInfo.drinkZonesPotential || 'N/A'}</span></div>
                <div class="info-row"><strong>Classe:</strong> <span>${hotspotInfo.animalClass || 'N/A'}</span></div>
                <div class="info-row"><strong>Nível Máximo:</strong> <span>${hotspotInfo.maxLevel || 'N/A'}</span></div>
            </div>
        </div>
        <button class="fullscreen-btn hotspot-fullscreen back-button">Ver mapa em tela cheia</button>
    `;
    container.querySelector('.hotspot-fullscreen').onclick = () => openImageViewer(imagePath);
}

function renderHotspotDetailModal(reserveKey, animalSlug) {
    const hotspotInfo = animalHotspotData[reserveKey]?.[animalSlug];
    const animalName = items.find(item => slugify(item) === animalSlug);
    const reserveName = reservesData[reserveKey].name;
    if (!hotspotInfo) return;
    const modal = document.getElementById('image-viewer-modal');
    modal.innerHTML = '';
    const slugReserve = slugify(reserveName);
    const imagePath = `hotspots/${slugReserve}_${animalSlug}_hotspot.jpg`;
    modal.innerHTML = `
        <span class="modal-close">&times;</span>
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
    modal.querySelector('.modal-close').onclick = () => closeModal('image-viewer-modal');
    modal.style.display = 'flex';
}

function getCompleteTrophyInventory(savedData) {
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
                        savedData.greats[slug].furs[furName].trophies.forEach(() => {
                            inventory.push({ slug, gender: 'macho', type: 'Great One', detail: furName });
                        });
                    }
                }
            }
        }
    }
    return inventory;
}

function checkMountRequirements(requiredAnimals, savedData) {
    const inventory = getCompleteTrophyInventory(savedData);
    const fulfillmentRequirements = [];
    let isComplete = true;
    const availableInventory = [...inventory];
    for (const requirement of requiredAnimals) {
        let fulfilled = false;
        let fulfillmentTrophy = null;
        const foundIndex = availableInventory.findIndex(trophy =>
            trophy.slug === requirement.slug && trophy.gender === requirement.gender
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

function renderMultiMountDetailModal(mountKey, savedData) {
    const mount = multiMountsData[mountKey];
    if (!mount) return;
    const status = checkMountRequirements(mount.animals, savedData);
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

function openImageViewer(imageUrl) {
    const modal = document.getElementById('image-viewer-modal');
    if (!modal) return;
    modal.innerHTML = `
        <span class="modal-close">&times;</span>
        <img class="modal-content-viewer" src="${imageUrl}" alt="Imagem em tela cheia">
    `;
    modal.style.display = 'flex';
    modal.querySelector('.modal-close').onclick = () => closeModal('image-viewer-modal');
}

function closeModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
        modal.style.display = "none";
    }
}

function openGreatsTrophyModal(animalName, slug, furName, savedData, onSave) {
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
            deleteBtn.onclick = () => {
                trophies.splice(index, 1);
                onSave(savedData);
                closeModal('form-modal');
                const container = document.querySelector('.detail-view .fur-grid, .dossier-content');
                if (container) {
                    renderGreatsDetailView(container, animalName, slug, savedData, onSave);
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
            date: form.querySelector('[name="date"]').value || new Date().toISOString().split('T')[0],
            abates: parseInt(form.querySelector('[name="abates"]').value) || 0,
            diamantes: parseInt(form.querySelector('[name="diamantes"]').value) || 0,
            pelesRaras: parseInt(form.querySelector('[name="pelesRaras"]').value) || 0,
        };
        if (!savedData.greats) savedData.greats = {};
        if (!savedData.greats[slug]) savedData.greats[slug] = {};
        if (!savedData.greats[slug].furs) savedData.greats[slug].furs = {};
        if (!savedData.greats[slug].furs[furName]) {
            savedData.greats[slug].furs[furName] = { trophies: [] };
        }
        savedData.greats[slug].furs[furName].trophies.push(newTrophy);
        onSave(savedData);
        closeModal('form-modal');
        const container = document.querySelector('.detail-view .fur-grid, .dossier-content');
        if (container) {
            renderGreatsDetailView(container, animalName, slug, savedData, onSave);
        }
    };
    buttonsDiv.appendChild(cancelBtn);
    buttonsDiv.appendChild(saveBtn);
    modalContent.appendChild(buttonsDiv);
    modal.style.display = 'flex'