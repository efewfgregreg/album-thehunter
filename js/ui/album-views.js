// js/ui/album-views.js (VERSÃO CORRIGIDA)

// --- Dependências do Módulo ---
let savedData, lastClickedAnimalName;
let items, slugify, reservesData, rareFursData, diamondFursData, greatsFursData, multiMountsData, categorias, animalHotspotData;
let renderMainView, saveDataAndUpdateUI, showCustomAlert, openImageViewer, closeModal, calcularReserveProgress;

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
    // Embora não seja usado aqui, é bom ter acesso se necessário no futuro
    calcularReserveProgress = dependencies.calculateReserveProgress; 
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
        // Esta função 'calcularReserveProgress' pode não estar disponível aqui,
        // depende de como o script.js é configurado. Vamos assumir que sim por agora
        // ou criar uma versão local se necessário. Por enquanto, deixarei um placeholder.
        const progress = { collectedRares: '?', collectedDiamonds: '?', collectedGreatOnes: '?' };

        const card = document.createElement('div');
        card.className = 'reserve-card';
        card.innerHTML = `
            <div class="reserve-image-container">
                <img class="reserve-card-image" src="${reserve.image}" onerror="this.style.display='none'">
            </div>
            <div class="reserve-card-info-panel">
                <img src="${reserve.image}" class="reserve-card-logo" alt="${reserve.name}" onerror="this.style.display='none'">
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


// --- Funções Auxiliares (internas deste módulo) ---

// ====================================================================
// FUNÇÕES CORRIGIDAS E ADICIONADAS
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
    updateCardAppearance(card, slug, tabKey); // Esta chamada agora vai funcionar
    return card;
}

// O resto do seu arquivo js/ui/album-views.js continua aqui...
// Colei apenas o início e o final, o meio do arquivo que você me enviou deve ser mantido.
// A parte importante é adicionar as duas funções acima (checkAndSetGreatOneCompletion e updateCardAppearance).
// ... (resto do seu código original)
// ... (showDetailView, renderSimpleDetailView, etc.)
// ... (até o final do arquivo)


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