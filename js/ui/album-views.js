// js/ui/album-views.js (VERSÃO FINAL E COMPLETA)

// --- Dependências do Módulo ---
let savedData, lastClickedAnimalName;
let items, slugify, reservesData, rareFursData, diamondFursData, greatsFursData, multiMountsData, categorias, animalHotspotData;
let renderMainView, saveDataAndUpdateUI, showCustomAlert, openImageViewer, closeModal;

export function init(dependencies) {
    savedData = dependencies.savedData;
    lastClickedAnimalName = dependencies.lastClickedAnimalName;
    items = dependencies.items;
    slugify = dependencies.slugify;
    reservesData = dependencies.reservesData;
    rareFursData = dependencies.rareFursData;
    diamondFursData = dependencies.diamondFursData;
    greatsFursData = dependencies.greatsFursData;
    multiMountsData = dependencies.multiMountsData;
    categorias = dependencies.categorias;
    animalHotspotData = dependencies.animalHotspotData;
    renderMainView = dependencies.renderMainView;
    saveDataAndUpdateUI = dependencies.saveDataAndUpdateUI;
    showCustomAlert = dependencies.showCustomAlert;
    openImageViewer = dependencies.openImageViewer;
    closeModal = dependencies.closeModal;
}

// --- Funções Principais Exportadas ---

export function renderGenericAlbumView(contentContainer, tabKey) {
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

export function renderMultiMountsView(container) {
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


// ====================================================================
// --- Funções Auxiliares (INTERNAS DESTE MÓDULO) ---
// Todas as funções abaixo foram movidas do script antigo para cá.
// ====================================================================

function checkAndSetGreatOneCompletion(slug, currentData) {
    const requiredFurs = greatsFursData[slug];
    if (!requiredFurs || !currentData) return;
    currentData.completo = requiredFurs.every(furName => currentData.furs?.[furName]?.trophies?.length > 0);
}

export function updateCardAppearance(card, slug, tabKey) {
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

function createAnimalCard(name, tabKey) {
    const card = document.createElement('div');
    card.className = 'animal-card';
    const slug = slugify(name);
    card.dataset.slug = slug;
    card.innerHTML = `<img src="animais/${slug}.png" alt="${name}" onerror="this.onerror=null;this.src='animais/placeholder.png';"><div class="info">${name}</div>`;
    card.addEventListener('click', () => {
        lastClickedAnimalName.value = name;
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
    lastClickedAnimalName.value = animalName;
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

function renderRareFursDetailView(container, name, slug, originReserveKey = null) {
    container.innerHTML = '';
    const furGrid = document.createElement('div');
    furGrid.className = 'fur-grid';
    container.appendChild(furGrid);
    const speciesFurs = rareFursData[slug];
    if (!speciesFurs || ((speciesFurs.macho?.length || 0) === 0 && (speciesFurs.femea?.length || 0) === 0)) {
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
        const furSlug = slugify(furInfo.originalName);
        const genderSlug = furInfo.gender;
        furCard.innerHTML = `<img src="animais/pelagens/${slug}_${furSlug}_${genderSlug}.png" onerror="this.onerror=null; this.src='animais/pelagens/${slug}_${furSlug}.png'; this.onerror=null; this.src='animais/${slug}.png';"><div class="info">${furInfo.displayName}</div><button class="fullscreen-btn" onclick="openImageViewer(this.closest('.fur-card').querySelector('img').src); event.stopPropagation();" title="Ver em tela cheia">⛶</button>`;
        furCard.addEventListener('click', async () => {
            if (!savedData.pelagens) savedData.pelagens = {};
            if (!savedData.pelagens[slug]) savedData.pelagens[slug] = {};
            const currentState = savedData.pelagens[slug][furInfo.displayName] || false;
            savedData.pelagens[slug][furInfo.displayName] = !currentState;
            await saveDataAndUpdateUI(savedData);
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
        furCard.addEventListener('click', async () => {
            if (!savedData.super_raros) savedData.super_raros = {};
            if (!savedData.super_raros[slug]) savedData.super_raros[slug] = {};
            const currentState = savedData.super_raros[slug][keyInSavedData] || false;
            savedData.super_raros[slug][keyInSavedData] = !currentState;
            await saveDataAndUpdateUI(savedData);
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
        const furSlug = slugify(furInfo.originalName);
        const genderSlug = furInfo.gender.toLowerCase();
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
            const saveScore = async () => {
                const scoreValue = parseFloat(input.value);
                if (!savedData.diamantes) savedData.diamantes = {};
                if (!Array.isArray(savedData.diamantes[slug])) savedData.diamantes[slug] = [];
                let otherTrophies = savedData.diamantes[slug].filter(t => t.type !== fullTrophyName);
                if (!isNaN(scoreValue) && scoreValue > 0) {
                    otherTrophies.push({ id: Date.now(), type: fullTrophyName, score: scoreValue });
                }
                savedData.diamantes[slug] = otherTrophies;
                await saveDataAndUpdateUI(savedData);
                if (originReserveKey) {
                    renderAnimalDossier(name, originReserveKey);
                } else {
                    renderDiamondsDetailView(container, name, slug);
                }
            };
            input.addEventListener('blur', saveScore);
            input.addEventListener('keydown', e => {
                if (e.key === 'Enter') saveScore();
                else if (e.key === 'Escape') {
                    renderDiamondsDetailView(container, name, slug, originReserveKey);
                }
            });
        });
        furGrid.appendChild(furCard);
    });
}