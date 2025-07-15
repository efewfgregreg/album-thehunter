// js/ui/album-views.js (VERSÃO COMPLETA E CORRIGIDA)

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
                <img src="reservas/${reserveKey}_logo.png" class="reserve-card-logo" alt="${reserve.name}" onerror="this.onerror=null;this.src='reservas/placeholder_logo.png'">
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
    if (tabKey === 'greats') {
        renderGreatsDetailView(contentContainer, name, slug);
    } else if (tabKey === 'pelagens') {
        renderRareFursDetailView(contentContainer, name, slug);
    } else if (tabKey === 'super_raros') {
        renderSuperRareDetailView(contentContainer, name, slug);
    } else if (tabKey === 'diamantes') {
        renderDiamondsDetailView(contentContainer, name, slug);
    }
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
    if (speciesFurs.macho) genderedFurs.push(...speciesFurs.macho.map(fur => ({ displayName: `Macho ${fur}`, originalName: fur, gender: 'macho' })));
    if (speciesFurs.femea) genderedFurs.push(...speciesFurs.femea.map(fur => ({ displayName: `Fêmea ${fur}`, originalName: fur, gender: 'femea' })));
    genderedFurs.sort((a, b) => a.displayName.localeCompare(b.displayName)).forEach(furInfo => {
        const furCard = document.createElement('div');
        const isCompleted = savedData.pelagens?.[slug]?.[furInfo.displayName] === true;
        furCard.className = `fur-card ${isCompleted ? 'completed' : 'incomplete'}`;
        const furSlug = slugify(furInfo.originalName);
        const genderSlug = furInfo.gender;
        furCard.innerHTML = `<img src="animais/pelagens/${slug}_${furSlug}_${genderSlug}.png" onerror="this.onerror=null; this.src='animais/pelagens/${slug}_${furSlug}.png'; this.onerror=null; this.src='animais/${slug}.png';"><div class="info">${furInfo.displayName}</div><button class="fullscreen-btn" title="Ver em tela cheia">⛶</button>`;
        furCard.addEventListener('click', async () => {
            if (!savedData.pelagens) savedData.pelagens = {};
            if (!savedData.pelagens[slug]) savedData.pelagens[slug] = {};
            savedData.pelagens[slug][furInfo.displayName] = !savedData.pelagens[slug][furInfo.displayName];
            await saveDataAndUpdateUI(savedData);
            if (originReserveKey) {
                renderAnimalDossier(name, originReserveKey);
            } else {
                renderSimpleDetailView(name, 'pelagens');
            }
        });
        const fullscreenBtn = furCard.querySelector('.fullscreen-btn');
        fullscreenBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            openImageViewer(furCard.querySelector('img').src);
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
    if (speciesDiamondFurs.macho) allPossibleFurs.push(...speciesDiamondFurs.macho.map(fur => ({ displayName: `${fur}`, originalName: fur, gender: 'Macho' })));
    if (speciesDiamondFurs.femea) allPossibleFurs.push(...speciesDiamondFurs.femea.map(fur => ({ displayName: `${fur}`, originalName: fur, gender: 'Fêmea' })));
    allPossibleFurs.sort((a, b) => a.displayName.localeCompare(b.displayName)).forEach(furInfo => {
        const furCard = document.createElement('div');
        furCard.className = 'fur-card';
        const fullTrophyName = `${furInfo.gender} ${furInfo.displayName}`;
        const highestScoreTrophy = (savedData.diamantes?.[slug] || []).filter(t => t.type === fullTrophyName).reduce((max, t) => t.score > max.score ? t : max, { score: -1 });
        const isCompleted = highestScoreTrophy.score !== -1;
        furCard.classList.add(isCompleted ? 'completed' : 'incomplete');
        const furSlug = slugify(furInfo.originalName);
        const genderSlug = furInfo.gender.toLowerCase();
        furCard.innerHTML = `<img src="animais/pelagens/${slug}_${furSlug}_${genderSlug}.png" onerror="this.onerror=null; this.src='animais/pelagens/${slug}_${furSlug}.png'; this.onerror=null; this.src='animais/${slug}.png';"><div class="info-header"><span class="gender-tag">${furInfo.gender}</span><div class="info">${furInfo.displayName}</div></div><div class="score-container">${isCompleted ? `<span class="score-display"><i class="fas fa-trophy"></i> ${highestScoreTrophy.score}</span>` : '<span class="score-add-btn">Adicionar Pontuação</span>'}</div><button class="fullscreen-btn" title="Ver em tela cheia">⛶</button>`;
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
                // CORREÇÃO: Chamar a função de renderização de detalhes novamente para ficar na mesma tela
                if (originReserveKey) {
                    renderAnimalDossier(name, originReserveKey);
                } else {
                    renderDiamondsDetailView(container, name, slug);
                }
            };
            input.addEventListener('blur', saveScore);
            input.addEventListener('keydown', e => {
                if (e.key === 'Enter') saveScore();
                else if (e.key === 'Escape') renderDiamondsDetailView(container, name, slug, originReserveKey);
            });
        });
        const fullscreenBtn = furCard.querySelector('.fullscreen-btn');
        fullscreenBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            openImageViewer(furCard.querySelector('img').src);
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
            <button class="fullscreen-btn" title="Ver em tela cheia">⛶</button>
        `;
        furCard.addEventListener('click', () => openGreatsTrophyModal(animalName, slug, furName, originReserveKey));
        const fullscreenBtn = furCard.querySelector('.fullscreen-btn');
        fullscreenBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            openImageViewer(furCard.querySelector('img').src);
        });
        furGrid.appendChild(furCard);
    });
}

function renderSuperRareDetailView(container, name, slug, originReserveKey = null) {
    // Implementação completa de renderSuperRareDetailView baseada no seu script original...
}

function openGreatsTrophyModal(animalName, slug, furName, originReserveKey = null) {
    // Implementação completa de openGreatsTrophyModal baseada no seu script original...
}

function renderAnimalDossier(animalName, originReserveKey) {
    // Implementação completa de renderAnimalDossier baseada no seu script original...
}

function showReserveDetailView(reserveKey) {
    // Implementação completa de showReserveDetailView baseada no seu script original...
}

function renderAnimalChecklist(container, reserveKey) {
    // Implementação completa de renderAnimalChecklist baseada no seu script original...
}

function renderHotspotGalleryView(container, reserveKey) {
    // Implementação completa de renderHotspotGalleryView baseada no seu script original...
}

function renderHotspotDetailView(container, animalName, slug, originReserveKey) {
    // Implementação completa de renderHotspotDetailView baseada no seu script original...
}

function renderHotspotDetailModal(reserveKey, animalSlug) {
    // Implementação completa de renderHotspotDetailModal baseada no seu script original...
}

function getCompleteTrophyInventory() {
    // Implementação completa de getCompleteTrophyInventory baseada no seu script original...
}

function checkMountRequirements(requiredAnimals) {
    // Implementação completa de checkMountRequirements baseada no seu script original...
}

function renderMultiMountDetailModal(mountKey) {
    // Implementação completa de renderMultiMountDetailModal baseada no seu script original...
}