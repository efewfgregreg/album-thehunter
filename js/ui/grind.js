// js/ui/grind.js

// --- Dependências do Módulo ---
let savedData, items, reservesData, slugify, showCustomAlert, saveDataAndUpdateUI;
let rareFursData, diamondFursData, greatsFursData, syncTrophyToAlbum, renderMainView;

// A função init recebe tudo que este módulo precisa para funcionar
export function init(dependencies) {
    savedData = dependencies.savedData;
    items = dependencies.items;
    reservesData = dependencies.reservesData;
    slugify = dependencies.slugify;
    showCustomAlert = dependencies.showCustomAlert;
    saveDataAndUpdateUI = dependencies.saveDataAndUpdateUI;
    rareFursData = dependencies.rareFursData;
    diamondFursData = dependencies.diamondFursData;
    greatsFursData = dependencies.greatsFursData;
    syncTrophyToAlbum = dependencies.syncTrophyToAlbum;
    renderMainView = dependencies.renderMainView;
}


// --- Funções Principais Exportadas ---
export function renderGrindHubView(container) {
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

// ====================================================================
// NOVA FUNÇÃO EXPORTADA
// ====================================================================
/**
 * Agrega estatísticas de todas as sessões de grind.
 * @returns {Array} Uma lista de objetos, cada um representando as estatísticas totais para um animal.
 */
export function getAggregatedGrindStats() {
    const stats = {};

    if (!savedData || !savedData.grindSessions) {
        return [];
    }

    savedData.grindSessions.forEach(session => {
        const { animalSlug, counts } = session;

        // Se o animal ainda não está no nosso objeto de estatísticas, inicialize-o.
        if (!stats[animalSlug]) {
            stats[animalSlug] = {
                animalSlug: animalSlug,
                animalName: items.find(item => slugify(item) === animalSlug) || animalSlug,
                totalKills: 0,
                diamonds: 0,
                rares: 0,
                superRares: 0,
                greatOnes: 0
            };
        }

        // Soma as contagens da sessão atual às estatísticas agregadas.
        stats[animalSlug].totalKills += counts.total || 0;
        stats[animalSlug].diamonds += counts.diamonds || 0;
        stats[animalSlug].rares += (counts.rares || []).length;
        stats[animalSlug].superRares += (counts.super_raros || []).length;
        stats[animalSlug].greatOnes += (counts.great_ones || []).length;
    });

    // Converte o objeto de estatísticas em um array e o ordena pelo nome do animal.
    return Object.values(stats).sort((a, b) => a.animalName.localeCompare(b.animalName));
}


// --- Funções Auxiliares (internas deste módulo) ---

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
            const newSession = { id: newSessionId, animalSlug: animalSlug, reserveKey: reserveKey, counts: { total: 0, diamonds: 0, trolls: 0, rares: [], super_raros: [], great_ones: [] } };
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
        super_raros: session.counts.super_raros || [],
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
                <div class="grind-counter-item super-rare" data-type="super_rares" data-detailed="true"><div class="grind-counter-header"><i class="fas fa-star"></i><span>Super Raros</span></div><div class="grind-counter-body"><button class="grind-counter-btn decrease"><i class="fas fa-minus"></i></button><span class="grind-counter-value">${counts.super_raros.length}</span><button class="grind-counter-btn increase"><i class="fas fa-plus"></i></button></div></div>
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
                } else if (isDetailed) {
                    openGrindDetailModal(sessionId, type);
                    return;
                } else {
                    currentSession.counts[type]++;
                }
            } else {
                if (type === 'total') {
                    if (currentSession.counts.total > 0) { currentSession.counts.total--; }
                } else if (isDetailed) {
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
                    speciesRareFurs.macho.forEach(rareFur => { options.push(`Macho ${rareFur}`); });
                }
                if (speciesRareFurs.femea && (speciesDiamondData?.femea?.length || 0) > 0) {
                    speciesRareFurs.femea.forEach(rareFur => { options.push(`Fêmea ${rareFur}`); });
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
    
    function closeModal(modalId) {
        const modal = document.getElementById(modalId);
        if(modal) modal.style.display = 'none';
    }

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