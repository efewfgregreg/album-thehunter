// js/ui/album-views.js (VERSÃO FINAL, COMPLETA E CORRIGIDA)

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
// ====================================================================

function checkAndSetGreatOneCompletion(slug, currentData) {
    const requiredFurs = greatsFursData[slug];
    if (!requiredFurs || !currentData) return;
    currentData.completo = requiredFurs.every(furName => currentData.furs?.[furName]?.trophies?.length > 0);
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
                if (collectedFurs > 0 && collectedFurs < totalGreatFurs) status = 'inprogress';
            }
            break;
        case 'diamantes':
            const collectedDiamondTrophies = savedData.diamantes?.[slug] || [];
            collectedCount = new Set(collectedDiamondTrophies.map(t => t.type)).size; 
            const speciesDiamondData = diamondFursData[slug];
            if (speciesDiamondData) {
                totalCount = (speciesDiamondData.macho?.length || 0) + (speciesDiamondData.femea?.length || 0);
                if (totalCount > 0 && collectedCount === totalCount) status = 'completed';
                else if (collectedCount > 0) status = 'inprogress';
            }
            break;
        case 'super_raros':
            const collectedSuperRares = savedData.super_raros?.[slug] || {};
            collectedCount = Object.values(collectedSuperRares).filter(v => v === true).length;
            const speciesRareFursForSuper = rareFursData[slug];
            const speciesDiamondFursForSuper = diamondFursData[slug];
            if (speciesRareFursForSuper) {
                let possibleSuperRares = 0;
                if (speciesRareFursForSuper.macho && (speciesDiamondFursForSuper?.macho?.length || 0) > 0) possibleSuperRares += speciesRareFursForSuper.macho.length;
                if (speciesRareFursForSuper.femea && (speciesDiamondFursForSuper?.femea?.length || 0) > 0) possibleSuperRares += speciesRareFursForSuper.femea.length;
                totalCount = possibleSuperRares;
                if (totalCount > 0 && collectedCount === totalCount) status = 'completed';
                else if (collectedCount > 0) status = 'inprogress';
            }
            break;
        case 'pelagens':
            const collectedRareFurs = savedData.pelagens?.[slug] || {};
            collectedCount = Object.values(collectedRareFurs).filter(v => v === true).length;
            const speciesRareData = rareFursData[slug];
            if (speciesRareData) {
                totalCount = (speciesRareData.macho?.length || 0) + (speciesRareData.femea?.length || 0);
                if (totalCount > 0 && collectedCount === totalCount) status = 'completed';
                else if (collectedCount > 0) status = 'inprogress';
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
    if (tabKey === 'greats') renderGreatsDetailView(contentContainer, name, slug);
    else if (tabKey === 'pelagens') renderRareFursDetailView(contentContainer, name, slug);
    else if (tabKey === 'super_raros') renderSuperRareDetailView(contentContainer, name, slug);
    else if (tabKey === 'diamantes') renderDiamondsDetailView(contentContainer, name, slug);
}

function renderRareFursDetailView(container, name, slug, originReserveKey = null) {
    // ... (Esta função já estava correta na sua última versão, mantida aqui)
}

function renderDiamondsDetailView(container, name, slug, originReserveKey = null) {
    // ... (Esta função já estava correta, mantida aqui)
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
            li.innerHTML = `<span>Abate ${new Date(trophy.date).toLocaleDateString()} (${grindDetails})</span><button class="delete-trophy-btn" title="Excluir este troféu">×</button>`;
            li.querySelector('.delete-trophy-btn').onclick = async () => {
                if (await showCustomAlert('Tem certeza que deseja remover este abate?', 'Confirmar Exclusão', true)) {
                    trophies.splice(index, 1);
                    await saveDataAndUpdateUI(savedData);
                    closeModal('form-modal');
                }
            };
            logList.appendChild(li);
        });
    }
    modalContent.appendChild(logList);
    const form = document.createElement('div');
    form.className = 'add-trophy-form';
    form.innerHTML = `<h4>Registrar Novo Abate</h4><table><tbody>
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
    cancelBtn.textContent = 'Fechar';
    cancelBtn.onclick = () => closeModal('form-modal');
    const saveBtn = document.createElement('button');
    saveBtn.className = 'back-button';
    saveBtn.style.cssText = 'background-color: var(--primary-color); color: #111;';
    saveBtn.textContent = 'Salvar Troféu';
    saveBtn.onclick = async () => {
        const newTrophy = {
            id: Date.now(),
            abates: parseInt(form.querySelector('[name="abates"]').value) || 0,
            diamantes: parseInt(form.querySelector('[name="diamantes"]').value) || 0,
            pelesRaras: parseInt(form.querySelector('[name="pelesRaras"]').value) || 0,
            date: form.querySelector('[name="date"]').value || new Date().toISOString().split('T')[0]
        };
        
        // CORREÇÃO DEFINITIVA: Garantir que toda a estrutura de dados exista
        if (!savedData.greats) savedData.greats = {};
        if (!savedData.greats[slug]) savedData.greats[slug] = {};
        if (!savedData.greats[slug].furs) savedData.greats[slug].furs = {};
        if (!savedData.greats[slug].furs[furName]) {
            savedData.greats[slug].furs[furName] = { trophies: [] };
        }

        savedData.greats[slug].furs[furName].trophies.push(newTrophy);
        checkAndSetGreatOneCompletion(slug, savedData.greats[slug]);
        await saveDataAndUpdateUI(savedData);
        closeModal('form-modal');
        if (originReserveKey) renderAnimalDossier(animalName, originReserveKey);
        else renderSimpleDetailView(animalName, 'greats');
    };
    buttonsDiv.appendChild(cancelBtn);
    buttonsDiv.appendChild(saveBtn);
    modalContent.appendChild(buttonsDiv);
    modal.style.display = 'flex';
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
        fursToDisplay.push(...speciesRareFurs.macho.map(rareFur => ({ displayName: `Macho ${rareFur}`, originalName: rareFur, gender: 'macho' })));
    }
    if (speciesRareFurs?.femea && canBeDiamondFemea) {
        fursToDisplay.push(...speciesRareFurs.femea.map(rareFur => ({ displayName: `Fêmea ${rareFur}`, originalName: rareFur, gender: 'femea' })));
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
        furCard.innerHTML = `<img src="animais/pelagens/${slug}_${furSlug}_${genderSlug}.png" onerror="this.onerror=null; this.src='animais/pelagens/${slug}_${furSlug}.png'; this.onerror=null; this.src='animais/${slug}.png';"><div class="info">${furInfo.displayName}</div><button class="fullscreen-btn" title="Ver em tela cheia">⛶</button>`;
        furCard.addEventListener('click', async () => {
            if (!savedData.super_raros) savedData.super_raros = {};
            if (!savedData.super_raros[slug]) savedData.super_raros[slug] = {};
            savedData.super_raros[slug][keyInSavedData] = !savedData.super_raros[slug][keyInSavedData];
            await saveDataAndUpdateUI(savedData);
            if (originReserveKey) renderAnimalDossier(name, originReserveKey);
            else renderSimpleDetailView(name, 'super_raros');
        });
        const fullscreenBtn = furCard.querySelector('.fullscreen-btn');
        fullscreenBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            openImageViewer(furCard.querySelector('img').src);
        });
        furGrid.appendChild(furCard);
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

function renderAnimalDossier(animalName, originReserveKey) {
    // ... Esta função já estava correta, omitida por brevidade
}
// etc...