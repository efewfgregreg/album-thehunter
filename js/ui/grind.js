// js/ui/grind.js

// ========================================================================
// ========================== DEPENDÊNCIAS ================================
// ========================================================================

let savedData, items, reservesData, slugify, onSaveCallback, showCustomAlert;
let rareFursData, greatsFursData;
let onNavigateCallback;

// ========================================================================
// ========================== FUNÇÃO DE INICIALIZAÇÃO =====================
// ========================================================================

export function initGrind(dependencies) {
    savedData = dependencies.savedData;
    items = dependencies.items;
    reservesData = dependencies.reservesData;
    slugify = dependencies.slugify;
    onSaveCallback = dependencies.onSave;
    showCustomAlert = dependencies.showCustomAlert;
    rareFursData = dependencies.rareFursData;
    greatsFursData = dependencies.greatsFursData;
    onNavigateCallback = dependencies.onNavigate;
}

// ========================================================================
// ========================== FUNÇÕES EXPORTADAS ==========================
// ========================================================================

/**
 * Renderiza o hub principal do Contador de Grind.
 */
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
            card.addEventListener('click', () => renderGrindCounterView(container, session.id));
            card.innerHTML = `
                <img src="animais/${session.animalSlug}.png" class="grind-card-bg-silhouette" onerror="this.style.display='none'">
                <div class="grind-card-content">
                    <div class="grind-card-header">
                        <span class="grind-card-animal-name">${animalName}</span>
                        <span class="grind-card-reserve-name"><i class="fas fa-map-marker-alt"></i> ${reserve.name}</span>
                    </div>
                    <div class="grind-card-stats-grid">
                        <div class="grind-stat" title="Total de Abates">
                            <i class="fas fa-crosshairs"></i>
                            <span>${counts.total || 0}</span>
                        </div>
                        <div class="grind-stat" title="Diamantes">
                            <i class="fas fa-gem"></i>
                            <span>${counts.diamonds || 0}</span>
                        </div>
                        <div class="grind-stat" title="Peles Raras">
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

/**
 * Agrega estatísticas de todas as sessões de grind. Usado pelo módulo de Progresso.
 */
export function getAggregatedGrindStats() {
    const stats = {};
    if (!savedData || !savedData.grindSessions) {
        return [];
    }
    savedData.grindSessions.forEach(session => {
        const { animalSlug, counts } = session;
        if (!stats[animalSlug]) {
            stats[animalSlug] = {
                animalSlug: animalSlug,
                animalName: items.find(item => slugify(item) === animalSlug) || animalSlug,
                totalKills: 0, diamonds: 0, rares: 0, superRares: 0, greatOnes: 0
            };
        }
        stats[animalSlug].totalKills += counts.total || 0;
        stats[animalSlug].diamonds += counts.diamonds || 0;
        stats[animalSlug].rares += (counts.rares || []).length;
        stats[animalSlug].superRares += (counts.super_raros || []).length;
        stats[animalSlug].greatOnes += (counts.great_ones || []).length;
    });
    return Object.values(stats).sort((a, b) => a.animalName.localeCompare(b.animalName));
}

// ========================================================================
// ========= FUNÇÕES INTERNAS (NÃO EXPORTADAS) ============================
// ========================================================================

function renderNewGrindAnimalSelection(container) {
    // ... (código da função sem alterações)
}

async function renderReserveSelectionForGrind(container, animalSlug) {
    // ... (código da função sem alterações)
}

async function renderGrindCounterView(container, sessionId) {
    const session = savedData.grindSessions.find(s => s.id === sessionId);
    if (!session) { onNavigateCallback('grind'); return; }

    // Garante que a estrutura 'counts' esteja completa
    session.counts = {
        total: session.counts.total || 0,
        diamonds: session.counts.diamonds || 0,
        trolls: session.counts.trolls || 0,
        rares: session.counts.rares || [],
        super_raros: session.counts.super_raros || [],
        great_ones: session.counts.great_ones || []
    };
    const { counts, animalSlug, reserveKey } = session;
    const animalName = items.find(item => slugify(item) === animalSlug);
    const reserveName = reservesData[reserveKey].name;
    
    // Atualiza o cabeçalho da página principal
    const mainContent = document.querySelector('.main-content');
    if (mainContent) {
        mainContent.querySelector('.page-header h2').textContent = `Contador de Grind`;
        mainContent.querySelector('.page-header .back-button').onclick = () => onNavigateCallback('grind');
    }
    
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
                <div class="grind-counter-item total-kills" data-type="total"><div class="grind-counter-header"><i class="fas fa-crosshairs"></i><span>Total de Abates</span></div><div class="grind-counter-body"><button class="grind-counter-btn decrease"><i class="fas fa-minus"></i></button><span class="grind-counter-value" id="total-kills-value">${counts.total}</span><button class="grind-counter-btn increase"><i class="fas fa-plus"></i></button></div></div>
                <div class="grind-counter-item diamond" data-type="diamonds"><div class="grind-counter-header"><i class="fas fa-gem"></i><span>Diamantes</span></div><div class="grind-counter-body"><button class="grind-counter-btn decrease"><i class="fas fa-minus"></i></button><span class="grind-counter-value">${counts.diamonds}</span><button class="grind-counter-btn increase"><i class="fas fa-plus"></i></button></div></div>
                <div class="grind-counter-item troll" data-type="trolls"><div class="grind-counter-header"><i class="fas fa-star-half-alt"></i><span>Trolls</span></div><div class="grind-counter-body"><button class="grind-counter-btn decrease"><i class="fas fa-minus"></i></button><span class="grind-counter-value">${counts.trolls}</span><button class="grind-counter-btn increase"><i class="fas fa-plus"></i></button></div></div>
                <div class="grind-counter-item rare" data-type="rares" data-detailed="true"><div class="grind-counter-header"><i class="fas fa-paw"></i><span>Raros</span></div><div class="grind-counter-body"><button class="grind-counter-btn decrease"><i class="fas fa-minus"></i></button><span class="grind-counter-value">${counts.rares.length}</span><button class="grind-counter-btn increase"><i class="fas fa-plus"></i></button></div></div>
                <div class="grind-counter-item super-rare" data-type="super_raros" data-detailed="true"><div class="grind-counter-header"><i class="fas fa-star"></i><span>Super Raros</span></div><div class="grind-counter-body"><button class="grind-counter-btn decrease"><i class="fas fa-minus"></i></button><span class="grind-counter-value">${counts.super_raros.length}</span><button class="grind-counter-btn increase"><i class="fas fa-plus"></i></button></div></div>
                <div class="grind-counter-item great-ones" data-type="great_ones" data-detailed="true"><div class="grind-counter-header"><i class="fas fa-crown"></i><span>Great One</span></div><div class="grind-counter-body"><button class="grind-counter-btn decrease"><i class="fas fa-minus"></i></button><span class="grind-counter-value">${counts.great_ones.length}</span><button class="grind-counter-btn increase"><i class="fas fa-plus"></i></button></div></div>
            </div>
            <button id="delete-grind-btn" class="back-button">Excluir este Grind</button>
        </div>`;
    
    container.querySelectorAll('.grind-counter-btn').forEach(button => {
        button.addEventListener('click', async (e) => {
            const type = button.closest('.grind-counter-item').dataset.type;
            if (button.classList.contains('increase')) {
                if (button.closest('.grind-counter-item').dataset.detailed) {
                    openGrindDetailModal(container, sessionId, type);
                } else {
                    counts[type]++;
                    if (type !== 'total') counts.total++;
                    onSaveCallback(savedData);
                    renderGrindCounterView(container, sessionId);
                }
            } else { // Decrease
                if (button.closest('.grind-counter-item').dataset.detailed) {
                    if (counts[type].length > 0) {
                        const lastItem = counts[type].pop();
                        onSaveCallback(savedData);
                        renderGrindCounterView(container, sessionId);
                        await showCustomAlert(`Item "${lastItem.variation}" removido.`, 'Item Removido');
                    }
                } else {
                    if (counts[type] > 0) {
                        counts[type]--;
                        // CORREÇÃO: Não decrementamos o total aqui, para manter consistência. O total é melhor ajustado manualmente.
                        onSaveCallback(savedData);
                        renderGrindCounterView(container, sessionId);
                    }
                }
            }
        });
    });

    container.querySelector('#delete-grind-btn').addEventListener('click', async () => {
        if (await showCustomAlert(`Tem certeza que deseja excluir o grind de ${animalName} em ${reserveName}?`, 'Excluir Grind', true)) {
            const sessionIndex = savedData.grindSessions.findIndex(s => s.id === sessionId);
            if (sessionIndex > -1) {
                savedData.grindSessions.splice(sessionIndex, 1);
                onSaveCallback(savedData);
                onNavigateCallback('grind');
            }
        }
    });
}

async function openGrindDetailModal(container, sessionId, rarityType) {
    const session = savedData.grindSessions.find(s => s.id === sessionId);
    if (!session) return;
    const { animalSlug } = session;
    let options = [];
    let title = "Registrar ";

    if (rarityType === 'rares') {
        title += "Pelagem Rara";
        const furData = rareFursData[animalSlug] || {};
        if (furData.macho) furData.macho.forEach(fur => options.push(`Macho ${fur}`));
        if (furData.femea) furData.femea.forEach(fur => options.push(`Fêmea ${fur}`));
    } else if (rarityType === 'super_raros') {
        // Lógica para Super Raros (Raro + Diamante)
        title += "Super Raro";
        const rareFurData = rareFursData[animalSlug];
        const diamondFurData = diamondFursData[animalSlug];
        if (rareFurData && diamondFurData) {
            if (rareFurData.macho && diamondFurData.macho) rareFurData.macho.forEach(fur => options.push(`Macho ${fur}`));
            if (rareFurData.femea && diamondFurData.femea) rareFurData.femea.forEach(fur => options.push(`Fêmea ${fur}`));
        }
    } else if (rarityType === 'great_ones') {
        title += "Great One";
        options = greatsFursData[animalSlug] || [];
    }

    if (options.length === 0) {
        await showCustomAlert(`Nenhuma variação de '${rarityType.replace(/_/g, ' ')}' encontrada para este animal.`, 'Aviso');
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
                <button id="grind-detail-save" class="back-button">Salvar</button>
            </div>
        </div>
    `;
    
    const closeModal = () => { if(modal) modal.style.display = 'none'; };
    modal.querySelector('#grind-detail-cancel').onclick = closeModal;
    modal.querySelector('#grind-detail-save').onclick = () => {
        const selectedValue = document.getElementById('grind-detail-modal-select').value;
        const newLog = { id: Date.now(), variation: selectedValue, date: new Date().toISOString() };
        if (!session.counts[rarityType]) session.counts[rarityType] = [];
        session.counts[rarityType].push(newLog);
        session.counts.total++;
        
        onSaveCallback(savedData);
        closeModal();
        renderGrindCounterView(container, sessionId);
    };
    modal.style.display = 'flex';
}
