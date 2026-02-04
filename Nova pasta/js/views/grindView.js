import { createCardElement } from '../components/AnimalCard.js';
import { normalizeText, debounce, slugify, showToast, createSafeImgTag } from '../utils.js';
import { renderMainView, renderNavigationHub, savedData, saveData, closeModal, showCustomAlert } from '../main.js';
import { renderHotspotDetailModal } from './reserveView.js'; 
import { items, reservesData, animalHotspotData, rareFursData, diamondFursData, greatsFursData } from '../../data/gameData.js';
import { renderZoneManager, setActiveToolMode } from '../components/ZoneManager.js';
import { createGrindCard } from '../components/GrindCard.js'; 

// =================================================================
// ==================== LÓGICA DO CONTADOR DE GRIND ================
// =================================================================

export function renderGrindHubView(container) {
    const mainContent = container.closest('.main-content');
    if (mainContent) {
        const headerTitle = mainContent.querySelector('.page-header h2');
        const backButton = mainContent.querySelector('.page-header .back-button');
        
        if (headerTitle) headerTitle.textContent = 'MEUS GRINDS';
        if (backButton) {
            backButton.innerHTML = `<i class="fas fa-arrow-left"></i>`;
            backButton.onclick = () => renderNavigationHub(); 
            backButton.title = "Voltar ao Menu Principal";
        }
    }

    container.innerHTML = `
        <div class="grind-hub-container">
            <div class="hub-controls">
                <button class="action-btn-primary" id="btn-new-grind">
                    <i class="fas fa-plus"></i> NOVO GRIND
                </button>
            </div>
            <div id="active-grinds-list" class="hub-list-area"></div>
        </div>
    `;

    const listArea = container.querySelector('#active-grinds-list');
    container.querySelector('#btn-new-grind').onclick = () => renderNewGrindAnimalSelection(container);

    if (savedData.grindSessions && savedData.grindSessions.length > 0) {
        const grindsByReserve = savedData.grindSessions.reduce((acc, session) => {
            const key = session.reserveKey;
            if (!acc[key]) acc[key] = [];
            acc[key].push(session);
            return acc;
        }, {});

        const sortedReserveKeys = Object.keys(grindsByReserve).sort((a, b) => 
            (reservesData[a]?.name || '').localeCompare(reservesData[b]?.name || '')
        );

        sortedReserveKeys.forEach(reserveKey => {
            const reserveSessions = grindsByReserve[reserveKey];
            const reserve = reservesData[reserveKey];
            
            const reserveGroup = document.createElement('div');
            reserveGroup.className = 'grind-reserve-group';
            
            const reserveTitle = document.createElement('div');
            reserveTitle.className = 'grind-reserve-header';
            reserveTitle.innerHTML = `
                <i class="fas fa-map-marker-alt"></i> 
                <span>${reserve.name}</span>
                <div class="header-line"></div>
            `;
            reserveGroup.appendChild(reserveTitle);

            const grid = document.createElement('div');
            grid.className = 'grinds-grid';
            
            reserveSessions.forEach(session => {
                const animalName = items.find(item => slugify(item) === session.animalSlug);
                const card = createGrindCard(session, animalName, () => renderGrindCounterView(session.id));
                grid.appendChild(card);
            });
            
            reserveGroup.appendChild(grid);
            listArea.appendChild(reserveGroup);
        });

    } else {
        const emptyState = document.createElement('div');
        emptyState.className = 'empty-state-container';
        emptyState.innerHTML = `
            <div class="empty-icon-circle"><i class="fas fa-crosshairs"></i></div>
            <h3 class="empty-state-title">Nenhum Grind Ativo</h3>
            <p class="empty-state-message">Inicie um novo projeto de caça para rastrear seus abates e troféus.</p>
        `;
        listArea.appendChild(emptyState);
    }
}

/* ==========================================================================
   SUBSTITUIR A FUNÇÃO: renderNewGrindAnimalSelection
   ========================================================================== */

function renderNewGrindAnimalSelection(container) {
    const mainContent = container.closest('.main-content');
    const header = mainContent.querySelector('.page-header h2');
    const backButton = mainContent.querySelector('.page-header .back-button');

    if (header) header.textContent = 'SELECIONE UM ANIMAL';
    if (backButton) {
        backButton.innerHTML = '<i class="fas fa-arrow-left"></i> Voltar para o Hub';
        backButton.onclick = () => renderMainView('grind');
    }

    container.innerHTML = ''; 

    // 1. Injeção de CSS Específico e Robusto (Correção Definitiva)
    const style = document.createElement('style');
    style.textContent = `
        .search-wrapper {
            position: relative;
            margin: 0 auto 30px auto;
            max-width: 800px;
            width: 95%;
        }
        .search-wrapper i.search-icon {
            position: absolute;
            left: 15px;
            top: 50%;
            transform: translateY(-50%);
            color: var(--cyan-color, #00bcd4);
            font-size: 1.1rem;
            pointer-events: none;
        }
        .search-wrapper input {
            width: 100%;
            padding: 15px 45px 15px 45px;
            background: #222;
            border: 2px solid #333;
            border-radius: 50px;
            color: white;
            font-size: 1rem;
            outline: none;
            transition: all 0.3s ease;
        }
        .search-wrapper input:focus {
            border-color: var(--cyan-color, #00bcd4);
            box-shadow: 0 0 15px rgba(0, 188, 212, 0.2);
        }
        .search-wrapper i.clear-btn {
            position: absolute;
            right: 15px;
            top: 50%;
            transform: translateY(-50%);
            color: #666;
            cursor: pointer;
            padding: 5px;
            transition: color 0.3s;
            display: none;
        }
        .search-wrapper i.clear-btn:hover {
            color: #fff;
        }
        
        /* CLASSE DE OCULTAÇÃO FORÇADA */
        /* Usa !important para vencer qualquer CSS global que esteja bloqueando o filtro */
        .animal-card.hidden-card {
            display: none !important;
        }

        /* Oculta barras de progresso vazias (UI Limpa) */
        .selection-mode .animal-card > div:last-child,
        .selection-mode .progress-container,
        .selection-mode .progress-bar {
            display: none !important;
        }
        
        /* Ajuste do Card */
        .selection-mode .animal-card {
            justify-content: center;
            padding-bottom: 10px;
        }
    `;
    container.appendChild(style);

    // 2. Criação da Barra de Busca
    const searchWrapper = document.createElement('div');
    searchWrapper.className = 'search-wrapper';
    
    const iconSearch = document.createElement('i');
    iconSearch.className = 'fas fa-search search-icon';
    
    const filterInput = document.createElement('input');
    filterInput.type = 'text';
    filterInput.placeholder = 'Buscar por nome...';
    filterInput.id = 'animal-search-input';
    filterInput.autocomplete = 'off';
    
    const iconClear = document.createElement('i');
    iconClear.className = 'fas fa-times clear-btn';
    
    searchWrapper.appendChild(iconSearch);
    searchWrapper.appendChild(filterInput);
    searchWrapper.appendChild(iconClear);
    container.appendChild(searchWrapper);

    // 3. Criação da Grid
    const grid = document.createElement('div');
    grid.className = 'album-grid selection-mode';
    container.appendChild(grid);

    // Filtra animais com hotspots
    const grindableAnimals = items.filter(animal => {
        const slug = slugify(animal);
        let animalData = null;
        for (const reserveKey in animalHotspotData) {
            if (animalHotspotData[reserveKey][slug]) {
                animalData = animalHotspotData[reserveKey][slug];
                break; 
            }
        }
        return !!animalData;
    });

    // 4. Renderização dos Cards com Atributos de Busca
    grindableAnimals.sort().forEach(animalName => {
        const slug = slugify(animalName);
        const card = createCardElement(animalName);
        
        card.classList.add('animal-card');
        
        // Normalização Segura: Garante que o texto de busca seja minúsculo e sem acentos
        const safeSearchName = normalizeText(animalName) || animalName.toLowerCase();
        card.setAttribute('data-name', safeSearchName);
        
        card.addEventListener('click', () => renderReserveSelectionForGrind(container, slug));
        grid.appendChild(card);
    });

    // 5. Lógica de Filtro (Via Classes CSS)
    const performSearch = () => {
        // Normalização do termo digitado
        const term = normalizeText(filterInput.value) || filterInput.value.toLowerCase();
        const cards = grid.querySelectorAll('.animal-card');
        
        // Controle do botão limpar
        iconClear.style.display = term.length > 0 ? 'block' : 'none';

        cards.forEach(card => {
            const name = card.getAttribute('data-name') || '';
            
            // Lógica Invertida: Se NÃO inclui o termo, adiciona a classe que esconde
            if (name.includes(term)) {
                card.classList.remove('hidden-card'); // Remove a classe para mostrar
            } else {
                card.classList.add('hidden-card'); // Adiciona a classe com !important para esconder
            }
        });
    };

    // Event Listeners
    filterInput.addEventListener('input', performSearch);
    
    iconClear.addEventListener('click', () => {
        filterInput.value = '';
        performSearch(); // Reseta a grid
        filterInput.focus();
    });

    // Foco automático
    setTimeout(() => filterInput.focus(), 100);
}   
async function renderReserveSelectionForGrind(container, animalSlug) {
    const mainContent = container.closest('.main-content');
    const header = mainContent.querySelector('.page-header h2');
    const animalName = items.find(item => slugify(item) === animalSlug);

    header.textContent = `Selecione a Reserva para ${animalName}`;
    mainContent.querySelector('.page-header .back-button').onclick = () => renderNewGrindAnimalSelection(container);

    container.innerHTML = '';

    const grid = document.createElement('div');
    grid.className = 'reserves-grid';
    container.appendChild(grid);

    const availableReserves = Object.entries(reservesData)
        .filter(([_, data]) => data.animals.includes(animalSlug))
        .sort((a, b) => a[1].name.localeCompare(b[1].name));

    if (availableReserves.length === 0) {
        grid.innerHTML = `<p class="no-data-message">Nenhuma reserva encontrada para este animal.</p>`;
        return;
    }

    availableReserves.forEach(([reserveKey, reserve]) => {
        const card = document.createElement('div');
        card.className = 'reserve-card';
        card.innerHTML = `
            <div class="reserve-image-container">
                <img class="reserve-card-image" src="${reserve.image}" onerror="this.style.display='none'">
            </div>
            <div class="reserve-card-info-panel">
                <h3>${reserve.name}</h3>
            </div>
        `;
        card.addEventListener('click', async () => {
            const newSession = {
                id: Date.now(),
                animalSlug: animalSlug, 
                reserveKey: reserveKey,
                startDate: new Date().toISOString(),
                counts: { total: 0, diamonds: [], rares: [], super_raros: [], trolls: [], great_ones: [] },
                zones: [] 
            };

            if (!savedData.grindSessions) savedData.grindSessions = [];
            savedData.grindSessions.push(newSession);
            saveData(savedData);
            await showCustomAlert(`Grind de ${animalName} em ${reserve.name} iniciado com sucesso!`, 'Grind Iniciado');
            renderGrindCounterView(newSession.id);
        });
        grid.appendChild(card);
    });
}

export async function renderGrindCounterView(sessionId) {
    const session = savedData.grindSessions.find(s => s.id === sessionId);
    if (!session) return renderMainView('grind');

    if (!session.counts) session.counts = { total: 0, rares: [], diamonds: [], trolls: [], great_ones: [], super_raros: [] };
    if (!session.zones) session.zones = []; 

    const { animalSlug, reserveKey } = session;
    const animalName = items.find(item => slugify(item) === animalSlug);
    const reserveName = reservesData[reserveKey].name;
    const hotspotInfo = animalHotspotData[reserveKey]?.[animalSlug] || {};
    
    const mainContent = document.querySelector('.main-content');
    const container = mainContent.querySelector('.content-container');
    mainContent.querySelector('.page-header h2').textContent = `Grind Ativo`;
    const backButton = mainContent.querySelector('.page-header .back-button');
    backButton.innerHTML = `&larr; Voltar`;
    backButton.onclick = () => renderMainView('grind');

    container.innerHTML = '';

    const totalKills = session.counts.total || 0;
    const GO_AVERAGE = 3000;
    const percentage = Math.min((totalKills / GO_AVERAGE) * 100, 100);

    const grindContainer = document.createElement('div');
    grindContainer.className = 'grind-container';

    const animalImgSlug = animalSlug.replace(/-/g, '_');

    grindContainer.innerHTML = `
        <div class="grind-v3-card">
            <div class="v3-header" style="background-image: url('animais/${animalImgSlug}.png'), url('animais/placeholder.jpg');">
                <div class="v3-overlay-top">
                    <h2 class="v3-animal-name">${animalName}</h2>
                    <span class="v3-reserve-tag"><i class="fas fa-map-marker-alt"></i> ${reserveName}</span>
                </div>
                <div class="v3-stats-bar-container">
                    <div class="hud-info-box">
                        <i class="fas fa-clock hud-icon icon-time"></i>
                        <span class="hud-label">Horário</span>
                        <span class="hud-value">${hotspotInfo.drinkZonesPotential || 'N/A'}</span>
                    </div>
                    <div class="hud-info-box">
                        <i class="fas fa-crosshairs hud-icon icon-class"></i>
                        <span class="hud-label">Classe</span>
                        <span class="hud-value">${hotspotInfo.animalClass || '?'}</span>
                    </div>
                    <div class="hud-info-box">
                        <i class="fas fa-weight-hanging hud-icon icon-weight"></i>
                        <span class="hud-label">Peso Máx</span>
                        <span class="hud-value">${hotspotInfo.maxWeightEstimate || '?'}</span>
                    </div>
                    <div class="hud-info-box">
                        <i class="fas fa-trophy hud-icon icon-score"></i>
                        <span class="hud-label">Score</span>
                        <span class="hud-value">${hotspotInfo.maxScore || '?'}</span>
                    </div>
                </div>
            </div>

            <div class="v3-counter-deck">
                <button class="btn-circle-action act-minus" id="btn-dec-main"><i class="fas fa-minus"></i></button>
                <div class="v3-display-box">
                    <input type="number" class="v3-input-number" id="v3-kill-input" value="${totalKills}">
                    <div class="v3-sub-label">TOTAL DE ABATES</div>
                    <div class="prob-line-container"><div class="prob-line-fill" style="width: ${percentage}%"></div></div>
                </div>
                <button class="btn-circle-action act-plus" id="btn-inc-main"><i class="fas fa-plus"></i></button>
            </div>

            <div class="v5-specials-grid" id="specials-grid-container"></div>
            
            <div class="v4-footer-actions" style="display: flex; gap: 10px; padding: 20px;">
                <button class="hotspot-button" id="btn-view-map" style="flex:1; font-size:0.8rem; background:#333; color:white; border:none; padding:12px; border-radius:8px; font-weight:bold; cursor:pointer; text-transform:uppercase;">
                    <i class="fas fa-map"></i> Mapa Hotspot
                </button>
                <button class="back-button" id="btn-delete-grind" style="flex:1; font-size:0.8rem; background:#c62828; color:white; border:none; padding:12px; border-radius:8px; font-weight:bold; cursor:pointer; text-transform:uppercase;">
                    <i class="fas fa-trash"></i> Excluir
                </button>
            </div>
        </div>
    `;
    
    container.appendChild(grindContainer);

    const updateMainDisplay = () => {
        const input = document.getElementById('v3-kill-input');
        if(input) input.value = session.counts.total;
    };

    const createControlTile = (type, label, iconPath, cssClass, useModal = false) => {
        if (!Array.isArray(session.counts[type])) session.counts[type] = [];
        const count = session.counts[type].length;

        const tile = document.createElement('div');
        tile.className = `v5-control-tile ${cssClass}`;
        tile.innerHTML = `
            <div class="v5-tile-header">
                <img src="${iconPath}" class="v5-icon-img">
                <span class="v5-label">${label}</span>
            </div>
            <div class="v5-tile-controls">
                <button class="btn-tile minus" id="btn-dec-${type}"><i class="fas fa-minus"></i></button>
                <input type="number" class="input-tile" id="input-${type}" value="${count}">
                <button class="btn-tile plus" id="btn-inc-${type}"><i class="fas fa-plus"></i></button>
            </div>
        `;

        tile.querySelector(`#btn-inc-${type}`).onclick = () => {
            if (useModal) {
                saveData(savedData); 
                openGrindDetailModal(sessionId, type, session.counts.total + 1);
            } else {
                session.counts[type].push({ id: Date.now(), killCount: session.counts.total + 1, variation: 'Rápido' });
                session.counts.total++; 
                saveData(savedData);
                tile.querySelector(`#input-${type}`).value = session.counts[type].length;
                updateMainDisplay();
                showToast(`+1 ${label}`);
            }
        };

        tile.querySelector(`#btn-dec-${type}`).onclick = () => {
            if (session.counts[type].length > 0) {
                session.counts[type].pop();
                if (session.counts.total > 0) session.counts.total--; 
                saveData(savedData);
                tile.querySelector(`#input-${type}`).value = session.counts[type].length;
                updateMainDisplay();
            }
        };

        tile.querySelector(`#input-${type}`).addEventListener('change', (e) => {
            let val = parseInt(e.target.value);
            if (isNaN(val) || val < 0) val = 0;
            const currentLen = session.counts[type].length;
            const diff = val - currentLen;
            if (diff > 0) {
                for(let i=0; i<diff; i++) session.counts[type].push({ id: Date.now()+i, variation: 'Manual' });
            } else if (diff < 0) {
                for(let i=0; i<Math.abs(diff); i++) session.counts[type].pop();
            }
            saveData(savedData);
        });

        return tile;
    };

    const gridContainer = document.getElementById('specials-grid-container');
    
    gridContainer.appendChild(createControlTile('diamonds', 'Diamante', 'icones/diamante_icon.png', 'tile-dia', false));
    gridContainer.appendChild(createControlTile('rares', 'Raro', 'icones/pata_icon.png', 'tile-rare', true));
    gridContainer.appendChild(createControlTile('great_ones', 'Great One', 'icones/greatone_icon.png', 'tile-go', true));
    gridContainer.appendChild(createControlTile('super_raros', 'Super Raro', 'icones/coroa_icon.png', 'tile-super', true));
    gridContainer.appendChild(createControlTile('trolls', 'Troll', 'icones/fantasma_icon.png', 'tile-troll', false));

    const mapTile = document.createElement('div');
    mapTile.className = 'v5-control-tile tile-map';
    mapTile.style.cursor = 'pointer'; 
    mapTile.innerHTML = `
        <div class="v5-tile-header" style="border:none; margin-bottom:0;">
            <i class="fa-solid fa-map-location-dot" style="font-size: 1.2rem; color: var(--primary-color);"></i>
            <span class="v5-label">MAPA TÁTICO</span>
        </div>
        <div class="v5-tile-controls map-action-box" style="justify-content: center; background: #333; border: 1px solid #444; padding: 6px;">
            <span style="color: #fff; font-weight: bold; font-size: 0.75rem; text-transform: uppercase;">ABRIR</span>
        </div>
    `;
    
    mapTile.onclick = () => renderTacticalMapDedicatedView(sessionId);
    
    mapTile.addEventListener('mouseenter', () => {
        mapTile.style.borderColor = 'var(--primary-color)';
        const btn = mapTile.querySelector('.map-action-box');
        btn.style.background = 'var(--primary-color)';
        btn.querySelector('span').style.color = '#000';
    });
    mapTile.addEventListener('mouseleave', () => {
        mapTile.style.borderColor = '#333';
        const btn = mapTile.querySelector('.map-action-box');
        btn.style.background = '#333';
        btn.querySelector('span').style.color = '#fff';
    });

    gridContainer.appendChild(mapTile);

    const mainInput = document.getElementById('v3-kill-input');
    const saveMain = () => {
        let val = parseInt(mainInput.value);
        if (isNaN(val) || val < 0) val = 0;
        session.counts.total = val;
        saveData(savedData);
    };
    mainInput.addEventListener('change', saveMain);

    document.getElementById('btn-dec-main').onclick = () => {
        if(session.counts.total > 0) { session.counts.total--; mainInput.value = session.counts.total; saveData(savedData); }
    };
    document.getElementById('btn-inc-main').onclick = () => {
        session.counts.total++; mainInput.value = session.counts.total; saveData(savedData);
    };

    document.getElementById('btn-view-map').onclick = () => renderHotspotDetailModal(reserveKey, animalSlug);

    document.getElementById('btn-delete-grind').onclick = async () => { 
        if (await showCustomAlert(`Apagar grind de ${animalName}?`, 'Confirmar', true)) { 
            const idx = savedData.grindSessions.findIndex(s => s.id === sessionId); 
            if (idx > -1) { 
                savedData.grindSessions.splice(idx, 1); 
                saveData(savedData); 
                renderMainView('grind'); 
            } 
        } 
    };
}
export function renderTacticalMapDedicatedView(sessionId) {
    const session = savedData.grindSessions.find(s => s.id === sessionId);
    if (!session) return renderGrindCounterView(sessionId);

    const mainContent = document.querySelector('.main-content');
    const container = mainContent.querySelector('.content-container');
    
    // Header
    mainContent.querySelector('.page-header h2').textContent = `MAPA TÁTICO: ${session.animalSlug.toUpperCase()}`;
    const backButton = mainContent.querySelector('.page-header .back-button');
    backButton.onclick = () => {
        mainContent.classList.remove('full-screen-mode');
        renderGrindCounterView(sessionId);
    };
    mainContent.classList.add('full-screen-mode');
    container.innerHTML = '';

    // Layout
    const layoutContainer = document.createElement('div');
    layoutContainer.className = 'tactical-fullscreen-layout';

    // 1. SIDEBAR ESQUERDA (EDIÇÃO)
    const leftSidebar = document.createElement('aside');
    leftSidebar.className = 'tactical-sidebar-left';
    leftSidebar.innerHTML = `
        <div class="sidebar-header">
            <h3 id="left-sb-title">Editar</h3>
            <button class="sidebar-close-btn" id="close-left-sb"><i class="fas fa-times"></i></button>
        </div>
        <div class="edit-form-container" id="pin-edit-form"></div>
    `;

    // 2. ÁREA DO MAPA
    const mapArea = document.createElement('div');
    mapArea.className = 'tactical-map-area';
    
    const zoneManagerContainer = document.createElement('div');
    zoneManagerContainer.style.width = '100%';
    zoneManagerContainer.style.height = '100%';
    
    // FAB (REMOVIDO BOTÃO DE FILTRO)
    const fabContainer = document.createElement('div');
    fabContainer.className = 'map-fab-container';
    fabContainer.innerHTML = `
        <div class="fab-options">
            <button class="fab-opt-btn" id="btn-add-shape" data-tooltip="Adicionar Forma"><i class="fas fa-shapes"></i></button>
            <button class="fab-opt-btn" id="btn-add-text" data-tooltip="Adicionar Texto"><i class="fas fa-font"></i></button>
        </div>
        <button class="fab-main-btn" id="btn-fab-main"><i class="fas fa-plus"></i></button>
    `;

    const btnReopen = document.createElement('button');
    btnReopen.className = 'btn-reopen-tips';
    btnReopen.id = 'btn-reopen-tips';
    btnReopen.title = 'Mostrar Dicas';
    btnReopen.innerHTML = '<i class="fas fa-info"></i>';

    mapArea.appendChild(zoneManagerContainer);
    mapArea.appendChild(fabContainer);
    mapArea.appendChild(btnReopen);
    
    // 3. SIDEBAR DIREITA (DICAS) - CORRIGIDO: Layout de botões e dica de navegação restaurada
    const rightSidebar = document.createElement('aside');
    rightSidebar.className = 'tactical-sidebar';
    rightSidebar.innerHTML = `
        <div class="sidebar-header">
            <h3>Dicas do Mapa</h3>
            <button class="sidebar-close-btn" id="hide-right-sb" title="Ocultar Dicas"><i class="fas fa-chevron-right"></i></button>
        </div>
        <div class="sidebar-content">
            <div class="accordion-item">
                <div class="accordion-header"><span><i class="fas fa-arrows-alt"></i> Navegação</span><i class="fas fa-chevron-down"></i></div>
                <div class="accordion-content">
                    <div class="sig-text" style="padding:10px 0;">Clique e arraste com o <strong>botão esquerdo</strong> do mouse para mover o mapa. Use a <strong>roda do mouse</strong> para dar zoom.</div>
                </div>
            </div>
            <div class="accordion-item"><div class="accordion-header"><span><i class="fas fa-map-marker-alt"></i> Novo Pino</span><i class="fas fa-chevron-down"></i></div><div class="accordion-content"><div class="sig-text" style="padding:10px 0;">Clique com o <strong>botão direito</strong> do mouse em qualquer área do mapa.</div></div></div>
            <div class="accordion-item"><div class="accordion-header"><span><i class="fas fa-shapes"></i> Formas</span><i class="fas fa-chevron-down"></i></div><div class="accordion-content"><div class="sig-text" style="padding:10px 0;">Use o menu (+) para adicionar formas. Arraste para posicionar.</div></div></div>
            <div class="accordion-item"><div class="accordion-header"><span><i class="fas fa-font"></i> Modo Texto</span><i class="fas fa-chevron-down"></i></div><div class="accordion-content"><div class="sig-text" style="padding:10px 0;">Use o botão flutuante <strong>(+)</strong>.</div></div></div>
            <div class="accordion-item"><div class="accordion-header"><span><i class="fas fa-mouse-pointer"></i> Edição</span><i class="fas fa-chevron-down"></i></div><div class="accordion-content"><div class="sig-text" style="padding:10px 0;">Clique com o <strong>botão esquerdo</strong> em um pino para editar.</div></div></div>
            <div class="accordion-item">
                <div class="accordion-header"><span><i class="fas fa-file-export"></i> Dados</span><i class="fas fa-chevron-down"></i></div>
                <div class="accordion-content">
                    <div class="sig-text" style="padding:10px 0; display: flex; gap: 8px;">
                        <button id="btn-export-data" class="rp-btn" style="flex: 1; background: var(--primary-color); color: #000; border: none; padding: 10px 0; border-radius: 4px; font-weight: 800; cursor: pointer; text-transform: uppercase; font-size: 0.75rem;">Exportar</button>
                        <button id="btn-import-data" class="rp-btn" style="flex: 1; background: #222; color: #fff; border: 1px solid #444; padding: 10px 0; border-radius: 4px; font-weight: 800; cursor: pointer; text-transform: uppercase; font-size: 0.75rem;">Importar</button>
                    </div>
                </div>
            </div>
        </div>
    `;

    // --- CALLBACKS ---

    // Callback 1: Seleção de Pino (COM SLIDER DE TAMANHO RESTAURADO)
    const handlePinSelection = (pinIndex, zoneData) => {
        leftSidebar.querySelector('#left-sb-title').textContent = 'Editar Marcação';
        const formContainer = leftSidebar.querySelector('#pin-edit-form');
        leftSidebar.classList.add('open');
        if (pinIndex === null || !zoneData) { leftSidebar.classList.remove('open'); return; }

        const safeZone = { 
            name: zoneData.name||'', type: zoneData.type||'drink', priority: zoneData.priority||'main', 
            herdType: zoneData.herdType||'solo', males: zoneData.males||0, females: zoneData.females||0, 
            time: zoneData.time||'', scale: zoneData.scale||1, notes: zoneData.notes||'' 
        };

        formContainer.innerHTML = `
            <div><span class="edit-label">Nome</span><input id="input-name" class="edit-input" value="${safeZone.name}"></div>
            <div><span class="edit-label">Tipo</span><div class="type-selector-group">
                <div class="type-btn t-drink ${safeZone.type==='drink'?'active':''}" data-val="drink"><i class="fas fa-tint"></i></div>
                <div class="type-btn t-feed ${safeZone.type==='feed'?'active':''}" data-val="feed"><i class="fas fa-leaf"></i></div>
                <div class="type-btn t-rest ${safeZone.type==='rest'?'active':''}" data-val="rest"><i class="fas fa-bed"></i></div>
            </div></div>
            <div><span class="edit-label">Prioridade</span><div class="toggle-group"><div class="toggle-opt ${safeZone.priority==='main'?'active':''}" data-val="main">Principal</div><div class="toggle-opt ${safeZone.priority==='secondary'?'active':''}" data-val="secondary">Secundária</div></div></div>
            <div><span class="edit-label">Composição</span><div class="toggle-group"><div class="toggle-opt ${safeZone.herdType==='solo'?'active':''}" data-herd="solo">Solo</div><div class="toggle-opt ${safeZone.herdType==='casal'?'active':''}" data-herd="casal">Casal</div><div class="toggle-opt ${safeZone.herdType==='rebanho'?'active':''}" data-herd="rebanho">Rebanho</div></div></div>
            <div class="form-row-grid"><div><span class="edit-label">Machos</span><input type="number" class="edit-input" id="input-males" value="${safeZone.males}"></div><div><span class="edit-label">Fêmeas</span><input type="number" class="edit-input" id="input-females" value="${safeZone.females}"></div></div>
            <div><span class="edit-label">Horário</span><input class="edit-input" id="input-time" value="${safeZone.time}"></div>
            
            <div><span class="edit-label">Tamanho do Ícone</span><div class="range-container"><input type="range" class="range-input" id="input-scale" min="0.1" max="2.0" step="0.1" value="${safeZone.scale}"><span class="range-value" id="lbl-scale">${safeZone.scale}x</span></div></div>
            
            <div><span class="edit-label">Anotações</span><textarea class="edit-textarea" id="input-notes">${safeZone.notes}</textarea></div>
            <div class="action-buttons-container"><button class="btn-save-pin" id="btn-save">Salvar</button><button class="btn-delete-icon" id="btn-delete"><i class="fas fa-trash"></i></button></div>
        `;

        // Event Listeners
        formContainer.querySelector('#input-name').oninput = (e) => { session.zones[pinIndex].name = e.target.value; document.dispatchEvent(new CustomEvent('map-data-changed')); };
        formContainer.querySelectorAll('.type-btn').forEach(b => b.onclick = () => { session.zones[pinIndex].type = b.dataset.val; handlePinSelection(pinIndex, session.zones[pinIndex]); document.dispatchEvent(new CustomEvent('map-data-changed')); });
        formContainer.querySelectorAll('.toggle-opt[data-val]').forEach(b => b.onclick = () => { session.zones[pinIndex].priority = b.dataset.val; handlePinSelection(pinIndex, session.zones[pinIndex]); document.dispatchEvent(new CustomEvent('map-data-changed')); });
        formContainer.querySelectorAll('.toggle-opt[data-herd]').forEach(b => b.onclick = () => { session.zones[pinIndex].herdType = b.dataset.herd; handlePinSelection(pinIndex, session.zones[pinIndex]); });
        formContainer.querySelector('#input-males').oninput = (e) => session.zones[pinIndex].males = parseInt(e.target.value)||0;
        formContainer.querySelector('#input-females').oninput = (e) => session.zones[pinIndex].females = parseInt(e.target.value)||0;
        formContainer.querySelector('#input-time').onchange = (e) => session.zones[pinIndex].time = e.target.value;
        formContainer.querySelector('#input-notes').oninput = (e) => session.zones[pinIndex].notes = e.target.value;
        
        // Lógica do Slider
        const rangeInp = formContainer.querySelector('#input-scale');
        const rangeLbl = formContainer.querySelector('#lbl-scale');
        rangeInp.oninput = (e) => {
            const val = parseFloat(e.target.value);
            rangeLbl.textContent = val + 'x';
            session.zones[pinIndex].scale = val;
            document.dispatchEvent(new CustomEvent('map-data-changed'));
        };

        formContainer.querySelector('#btn-save').onclick = () => { saveData(savedData); leftSidebar.classList.remove('open'); };
        formContainer.querySelector('#btn-delete').onclick = async () => { if(await showCustomAlert("Excluir?", "Sim", true)) { session.zones.splice(pinIndex, 1); saveData(savedData); leftSidebar.classList.remove('open'); document.dispatchEvent(new CustomEvent('map-data-changed')); }};
    };

    // Callback 2: Texto
    const handleTextSelection = (textIndex, textData) => {
        leftSidebar.querySelector('#left-sb-title').textContent = 'Editar Texto';
        const formContainer = leftSidebar.querySelector('#pin-edit-form');
        leftSidebar.classList.add('open');
        if (textIndex === null || !textData) { leftSidebar.classList.remove('open'); return; }
        const safeText = { content: textData.content || 'Novo Texto', color: textData.color || '#ffffff', fontSize: textData.fontSize || 24 };
        const colors = ['#ffffff', '#00bcd4', '#4caf50', '#ff9800', '#f44336', '#ffd700', '#9c27b0', '#000000'];
        formContainer.innerHTML = `<div><span class="edit-label">Conteúdo</span><input type="text" class="edit-input" id="txt-content" value="${safeText.content}"></div><div><span class="edit-label">Tamanho</span><input type="range" class="range-input" id="txt-size" min="8" max="72" value="${safeText.fontSize}"></div><div><span class="edit-label">Cor</span><div class="color-picker-grid">${colors.map(c => `<div class="color-dot ${c===safeText.color?'active':''}" style="background-color:${c}" data-color="${c}"></div>`).join('')}</div></div><div class="action-buttons-container"><button class="btn-save-pin" id="btn-save-txt">Salvar</button><button class="btn-delete-icon" id="btn-delete-txt"><i class="fas fa-trash-alt"></i></button></div>`;
        formContainer.querySelector('#txt-content').oninput = e => { session.texts[textIndex].content = e.target.value; document.dispatchEvent(new CustomEvent('map-data-changed')); };
        formContainer.querySelector('#txt-size').oninput = e => { session.texts[textIndex].fontSize = parseInt(e.target.value); document.dispatchEvent(new CustomEvent('map-data-changed')); };
        formContainer.querySelectorAll('.color-dot').forEach(d => d.onclick = () => { session.texts[textIndex].color = d.dataset.color; document.dispatchEvent(new CustomEvent('map-data-changed')); handleTextSelection(textIndex, session.texts[textIndex]); });
        formContainer.querySelector('#btn-save-txt').onclick = () => { saveData(savedData); leftSidebar.classList.remove('open'); };
        formContainer.querySelector('#btn-delete-txt').onclick = async () => { if(await showCustomAlert("Excluir?","Sim",true)){ session.texts.splice(textIndex,1); saveData(savedData); leftSidebar.classList.remove('open'); document.dispatchEvent(new CustomEvent('map-data-changed')); }};
    };

    // Callback 3: Forma (Com Ícones e Slider de Espessura Ajustado)
    const handleShapeSelection = (shapeIndex, shapeData) => {
        leftSidebar.querySelector('#left-sb-title').textContent = 'Editar Forma';
        const formContainer = leftSidebar.querySelector('#pin-edit-form');
        leftSidebar.classList.add('open');
        if (shapeIndex === null || !shapeData) { leftSidebar.classList.remove('open'); return; }
        
        const safeShape = { 
            type: shapeData.type || 'circle', 
            scale: shapeData.scale || 5, 
            color: shapeData.color || '#ffa500',
            strokeWidth: shapeData.strokeWidth || 0.2 
        };
        
        const colors = ['#ffa500', '#ff0000', '#00ff00', '#0000ff', '#ffffff', '#000000', '#ffff00', '#ff00ff'];
        
        formContainer.innerHTML = `
            <div>
                <span class="edit-label">Tipo de Forma</span>
                <div class="shape-btn-group">
                    <div class="shape-btn ${safeShape.type==='circle'?'active':''}" data-type="circle"><i class="far fa-circle"></i></div>
                    <div class="shape-btn ${safeShape.type==='square'?'active':''}" data-type="square"><i class="far fa-square"></i></div>
                    <div class="shape-btn ${safeShape.type==='triangle'?'active':''}" data-type="triangle"><i class="fas fa-play" style="transform: rotate(-90deg); font-size: 0.9rem;"></i></div>
                    <div class="shape-btn ${safeShape.type==='x'?'active':''}" data-type="x"><i class="fas fa-times"></i></div>
                </div>
            </div>
            
            <div>
                <span class="edit-label">Tamanho</span>
                <div class="range-container">
                    <input type="range" class="range-input" id="shape-scale" min="1" max="20" step="0.5" value="${safeShape.scale}">
                </div>
            </div>

            <div>
                <span class="edit-label">Espessura da Linha</span>
                <div class="range-container">
                    <input type="range" class="range-input" id="shape-thickness" min="0.1" max="2.0" step="0.1" value="${safeShape.strokeWidth}">
                </div>
            </div>

            <div><span class="edit-label">Cor</span><div class="color-picker-grid">${colors.map(c => `<div class="color-dot ${c===safeShape.color?'active':''}" style="background-color:${c}" data-color="${c}"></div>`).join('')}</div></div>
            <div class="action-buttons-container"><button class="btn-save-pin" id="btn-save-shape">Salvar</button><button class="btn-delete-icon" id="btn-delete-shape"><i class="fas fa-trash-alt"></i></button></div>
        `;

        formContainer.querySelectorAll('.shape-btn').forEach(btn => { 
            btn.onclick = () => { 
                formContainer.querySelectorAll('.shape-btn').forEach(b => b.classList.remove('active')); 
                btn.classList.add('active'); 
                session.shapes[shapeIndex].type = btn.dataset.type; 
                document.dispatchEvent(new CustomEvent('map-data-changed')); 
            }; 
        });
        
        formContainer.querySelector('#shape-scale').oninput = e => { 
            session.shapes[shapeIndex].scale = parseFloat(e.target.value); 
            document.dispatchEvent(new CustomEvent('map-data-changed')); 
        };

        formContainer.querySelector('#shape-thickness').oninput = e => { 
            session.shapes[shapeIndex].strokeWidth = parseFloat(e.target.value); 
            document.dispatchEvent(new CustomEvent('map-data-changed')); 
        };

        formContainer.querySelectorAll('.color-dot').forEach(d => { d.onclick = () => { formContainer.querySelectorAll('.color-dot').forEach(x => x.classList.remove('active')); d.classList.add('active'); session.shapes[shapeIndex].color = d.dataset.color; document.dispatchEvent(new CustomEvent('map-data-changed')); }; });
        formContainer.querySelector('#btn-save-shape').onclick = () => { saveData(savedData); leftSidebar.classList.remove('open'); };
        formContainer.querySelector('#btn-delete-shape').onclick = async () => { if(await showCustomAlert("Apagar esta forma?", "Confirmar", true)) { session.shapes.splice(shapeIndex, 1); saveData(savedData); leftSidebar.classList.remove('open'); document.dispatchEvent(new CustomEvent('map-data-changed')); }};
    };
    // Montagem Final
    layoutContainer.appendChild(leftSidebar);
    layoutContainer.appendChild(mapArea);
    layoutContainer.appendChild(rightSidebar);
    container.appendChild(layoutContainer);

    const btnFabMain = fabContainer.querySelector('#btn-fab-main');
    btnFabMain.onclick = () => { fabContainer.classList.toggle('open'); btnFabMain.classList.toggle('active'); };
    fabContainer.querySelector('#btn-add-shape').onclick = () => { fabContainer.classList.remove('open'); btnFabMain.classList.remove('active'); document.dispatchEvent(new CustomEvent('zm-create-shape')); };
    fabContainer.querySelector('#btn-add-text').onclick = () => { setActiveToolMode('pan'); fabContainer.classList.remove('open'); btnFabMain.classList.remove('active'); document.dispatchEvent(new CustomEvent('zm-create-text')); };
    
    // Accordion Logic
    rightSidebar.querySelectorAll('.accordion-header').forEach(h => h.onclick = () => { h.classList.toggle('active'); const c = h.nextElementSibling; if(h.classList.contains('active')){c.style.maxHeight=c.scrollHeight+"px";c.classList.add('open')}else{c.style.maxHeight=null;c.classList.remove('open')} });
    rightSidebar.querySelector('#hide-right-sb').onclick = () => { rightSidebar.classList.add('collapsed'); btnReopen.classList.add('visible'); };
    btnReopen.onclick = () => { rightSidebar.classList.remove('collapsed'); btnReopen.classList.remove('visible'); };
    leftSidebar.querySelector('#close-left-sb').onclick = () => leftSidebar.classList.remove('open');

    /* ==========================================================================
       LÓGICA DE EXPORTAÇÃO E IMPORTAÇÃO (APENAS MAPA ATUAL)
       ========================================================================== */
    const btnExport = rightSidebar.querySelector('#btn-export-data');
    const btnImport = rightSidebar.querySelector('#btn-import-data');

    if (btnExport) {
        btnExport.onclick = async (e) => {
            e.preventDefault();
            e.stopPropagation();

            const animalName = items.find(item => slugify(item) === session.animalSlug) || 'animal';
            const reserveName = reservesData[session.reserveKey]?.name || 'reserva';
            const fileNameBase = `Grind_${slugify(animalName)}_${slugify(reserveName)}`;

            // 1. Exportar JSON (Apenas os dados deste mapa)
            const dataStr = JSON.stringify(session, null, 2);
            const jsonBlob = new Blob([dataStr], { type: "application/json" });
            const jsonUrl = URL.createObjectURL(jsonBlob);
            const linkJson = document.createElement('a');
            linkJson.href = jsonUrl;
            linkJson.download = `${fileNameBase}.json`;
            linkJson.click();
            URL.revokeObjectURL(jsonUrl);

            // 2. Exportar Imagem (Snapshot tático)
            const imgElement = document.getElementById('zm-map-img');
            if (imgElement) {
                const { generateMapSnapshot } = await import('../components/ZoneManager.js');
                const imgData = await generateMapSnapshot(session, imgElement);
                const linkImg = document.createElement('a');
                linkImg.href = imgData;
                linkImg.download = `${fileNameBase}_Snapshot.png`;
                linkImg.click();
            }

            showToast("Exportação concluída!");
        };
    }

   /* ==========================================================================
   ARQUIVO: grindView.js
   CONTEXTO: Lógica de Importação dentro de renderTacticalMapDedicatedView
   ========================================================================== */

    if (btnImport) {
        btnImport.onclick = (e) => {
            e.preventDefault();
            const input = document.createElement('input');
            input.type = 'file';
            input.accept = '.json';
            input.onchange = e => {
                const file = e.target.files[0];
                if (!file) return;
                const reader = new FileReader();
                reader.onload = async event => {
                    try {
                        const importedSession = JSON.parse(event.target.result);
                        
                        // 1. Validação de Compatibilidade
                        const isSameAnimal = importedSession.animalSlug === session.animalSlug;
                        const isSameReserve = importedSession.reserveKey === session.reserveKey;

                        if (!isSameAnimal || !isSameReserve) {
                            const confirmMixed = await showCustomAlert(
                                `Atenção: Este arquivo pertence a outro mapa (${importedSession.animalSlug} em ${importedSession.reserveKey}). Deseja importar os pinos mesmo assim?`,
                                "Importar", 
                                true
                            );
                            if (!confirmMixed) return;
                        }

                        // 2. Injeção de Dados (Mantendo a referência do objeto original)
                        // Isso resolve o erro dos pinos não aparecerem após a importação
                        session.zones = importedSession.zones || [];
                        session.texts = importedSession.texts || [];
                        session.shapes = importedSession.shapes || [];
                        
                        // Opcional: Importar também os contadores de abates/diamantes
                        if (importedSession.counts) {
                            session.counts = importedSession.counts;
                        }

                        // 3. Persistência e Atualização da UI
                        saveData(savedData);
                        showToast("Dados do mapa carregados com sucesso!");

                        // Dispara o evento que o ZoneManager.js está ouvindo para redesenhar a tela
                        document.dispatchEvent(new CustomEvent('zm-update-view'));
                        document.dispatchEvent(new CustomEvent('map-data-changed'));

                    } catch (err) {
                        console.error("Erro na importação:", err);
                        showToast("Erro ao ler o arquivo JSON.");
                    }
                };
                reader.readAsText(file);
            };
            input.click();
        };
    }
    // Inicializa Mapa
    const reserveFilename = session.reserveKey.toLowerCase().replace(/[\s-]/g, '_');
    renderZoneManager(zoneManagerContainer, session, true, () => saveData(savedData), `mapas/${reserveFilename}_mapa.jpg`, handlePinSelection, handleTextSelection, handleShapeSelection);
}
// FIM DO ARQUIVO
function openGrindDetailModal(sessionId, type, killCount) {
    const session = savedData.grindSessions.find(s => s.id === sessionId);
    if (!session) return;

    const { animalSlug } = session;
    const animalName = items.find(item => slugify(item) === animalSlug);
    let potentialFurs = [];
    let title = '';

    switch (type) {
        case 'rares':
            title = 'Selecione a Pelagem Rara';
            const rareData = rareFursData[animalSlug];
            if (rareData?.macho) potentialFurs.push(...rareData.macho.map(f => ({ displayName: `Macho ${f}`, originalName: f, gender: 'macho' })));
            if (rareData?.femea) potentialFurs.push(...rareData.femea.map(f => ({ displayName: `Fêmea ${f}`, originalName: f, gender: 'femea' })));
            break;
        case 'super_raros':
            title = 'Selecione a Pelagem Super Rara';
            const srRareData = rareFursData[animalSlug];
            const srDiamondData = diamondFursData[animalSlug];
            if (srRareData?.macho && srDiamondData?.macho?.length > 0) potentialFurs.push(...srRareData.macho.map(f => ({ displayName: `Macho ${f}`, originalName: f, gender: 'macho' })));
            if (srRareData?.femea && srDiamondData?.femea?.length > 0) potentialFurs.push(...srRareData.femea.map(f => ({ displayName: `Fêmea ${f}`, originalName: f, gender: 'femea' })));
            break;
        case 'great_ones':
            title = 'Selecione a Pelagem Great One';
            const greatData = greatsFursData[animalSlug];
            if (greatData) potentialFurs.push(...greatData.map(f => ({ displayName: f, originalName: f, gender: 'macho' })));
            break;
    }

    if (potentialFurs.length === 0) {
        showCustomAlert(`Nenhuma pelagem detalhada encontrada para ${animalName} nesta categoria.`, 'Aviso');
        return;
    }

    const modal = document.getElementById('form-modal');
    modal.innerHTML = '';
    modal.className = 'modal-overlay form-modal';

    const modalContent = document.createElement('div');
    modalContent.className = 'modal-content-box';
    modalContent.style.maxWidth = '800px';
    modalContent.style.width = '95%';
    
    modalContent.innerHTML = `
        <div class="modal-header-simple">
            <h3 style="color: var(--accent-color); margin: 0;">${title}</h3>
            <p style="color: #888; margin: 5px 0 0 0;">${animalName}</p>
        </div>
        <div class="grind-select-grid"></div>
        <div style="margin-top: 20px; display: flex; justify-content: flex-end;">
            <button id="btn-cancel-select" class="back-button">Cancelar</button>
        </div>
    `;

    const gridContainer = modalContent.querySelector('.grind-select-grid');

    potentialFurs.forEach((fur) => {
        const cleanName = fur.originalName.replace(/[:]/g, '').trim();
        const furSlug = slugify(cleanName).replace(/-/g, '_');
        const animalSlugFixed = slugify(animalName).replace(/-/g, '_'); 
        const genderSuffix = fur.gender === 'macho' ? '_macho' : (fur.gender === 'femea' ? '_femea' : '');
        let primaryPath;
        if (type === 'great_ones') {
             primaryPath = `animais/pelagens/great_${animalSlugFixed}_${furSlug}.png`;
        } else {
             primaryPath = `animais/pelagens/${animalSlugFixed}_${furSlug}${genderSuffix}.png`;
        }
        const fallbackPath = `animais/pelagens/${animalSlugFixed}_${furSlug}.png`; 
        const placeholderPath = `animais/${animalSlugFixed}.png`; 
        const imgTag = createSafeImgTag(primaryPath, fallbackPath, placeholderPath, fur.displayName);

        const card = document.createElement('div');
        card.className = 'grind-option-card';
        card.innerHTML = `
            <div class="grind-opt-img">${imgTag}</div>
            <div class="grind-opt-name">${fur.displayName}</div>
        `;

        card.onclick = () => {
            const displayName = fur.displayName;
            if (!session.counts[type]) session.counts[type] = []; 
            session.counts[type].push({ id: Date.now(), killCount: killCount, variation: displayName });

            let collectionKey = type;
            if (type === 'great_ones') collectionKey = 'greats';
            else if (type === 'rares') collectionKey = 'pelagens';
            else if (type === 'diamonds') collectionKey = 'diamantes';

            if (collectionKey === 'greats') {
                if (!savedData.greats[animalSlug]) savedData.greats[animalSlug] = { furs: {} };
                if (!savedData.greats[animalSlug].furs[displayName]) savedData.greats[animalSlug].furs[displayName] = { trophies: [] };
                savedData.greats[animalSlug].furs[displayName].trophies.push({ date: new Date().toISOString() });
            } else {
                if (!savedData[collectionKey]) savedData[collectionKey] = {};
                if (!savedData[collectionKey][animalSlug]) savedData[collectionKey][animalSlug] = {};
                
                if (collectionKey === 'diamantes') {
                     if (!Array.isArray(savedData[collectionKey][animalSlug])) savedData[collectionKey][animalSlug] = [];
                     savedData[collectionKey][animalSlug].push({ id: Date.now(), type: displayName, score: 0 });
                } else {
                     savedData[collectionKey][animalSlug][displayName] = true;
                }
            }

            saveData(savedData);
            closeModal('form-modal');
            renderGrindCounterView(sessionId);
            showToast(`${displayName} salvo no Grind e na Coleção Principal!`);
        };
        gridContainer.appendChild(card);
    });

    modal.appendChild(modalContent);
    modalContent.querySelector('#btn-cancel-select').onclick = () => closeModal('form-modal');
    modal.style.display = 'flex';
}

function renderGreatOneHistoryView(container, animalName, slug, furName, originReserveKey) {
    if (!savedData.greats) savedData.greats = {};
    if (!savedData.greats[slug]) savedData.greats[slug] = {};
    if (!savedData.greats[slug].furs) savedData.greats[slug].furs = {};
    if (!savedData.greats[slug].furs[furName]) savedData.greats[slug].furs[furName] = { trophies: [] };

    const trophies = savedData.greats[slug].furs[furName].trophies;
    container.innerHTML = '';
    const historyContainer = document.createElement('div');
    historyContainer.className = 'go-history-view-container'; 

    const globalBackButton = document.querySelector('.page-header .back-button');
    if (globalBackButton) {
        const newBackButton = globalBackButton.cloneNode(true);
        globalBackButton.parentNode.replaceChild(newBackButton, globalBackButton);
        newBackButton.innerHTML = `<i class="fas fa-arrow-left"></i> Voltar ao Dossiê`;
        newBackButton.onclick = () => {
            const headerTitle = document.querySelector('.page-header h2');
            if (headerTitle) headerTitle.textContent = animalName.toUpperCase();
            if (originReserveKey && reservesData[originReserveKey]) {
                newBackButton.innerHTML = `<i class="fas fa-arrow-left"></i> Voltar para ${reservesData[originReserveKey].name}`;
                newBackButton.onclick = () => showReserveDetailView(originReserveKey);
            } else {
                newBackButton.innerHTML = `<i class="fas fa-arrow-left"></i> Voltar para Great Ones`;
                newBackButton.onclick = () => renderMainView('greats');
            }
            renderGreatsDetailView(container, animalName, slug, originReserveKey, 'all');
        };
    }
    
    const headerHtml = `
        <div class="go-history-header centered-layout">
            <div class="go-header-details">
                <h2>${animalName}</h2>
                <div class="go-fur-tag"><i class="fas fa-crown"></i> ${furName}</div>
            </div>
            <div class="go-header-stats-row"><div class="go-stat-badge"><span class="lbl">REGISTROS</span><span class="val">${trophies.length}</span></div></div>
        </div>
        <div class="go-controls-bar centered-controls">
            <button id="btn-add-entry" class="action-btn-primary"><i class="fas fa-plus"></i> NOVO REGISTRO</button>
            <p class="info-text-centered"><i class="fas fa-info-circle"></i> Gerencie seus abates individuais abaixo.</p>
        </div>
    `;
    
    const gridContainer = document.createElement('div');
    gridContainer.className = 'go-history-grid';

    if (trophies.length === 0) {
        gridContainer.innerHTML = `<div class="empty-state-container"><div class="empty-icon-circle"><i class="fas fa-folder-open"></i></div><h3 class="empty-state-title">Histórico Vazio</h3><p class="empty-state-message">Adicione seu primeiro registro de grind para esta pelagem.</p></div>`;
    } else {
        const sortedTrophies = [...trophies].sort((a, b) => new Date(b.date) - new Date(a.date));
        sortedTrophies.forEach((t) => {
            const originalIndex = trophies.indexOf(t);
            const stats = t.stats || { kills: 0, diamonds: 0, trolls: 0, rares: 0 };
            const dateStr = t.date ? new Date(t.date).toLocaleDateString() : '--/--';
            
            const cardElement = document.createElement('div');
            cardElement.className = 'go-history-item-card v2';
            cardElement.innerHTML = `
                <div class="card-top-bar"><div class="card-date"><i class="far fa-calendar-alt"></i> ${dateStr}</div><button class="btn-delete-item" title="Excluir"><i class="fas fa-trash-alt"></i></button></div>
                <div class="card-main-stat"><span class="stat-value-big">${stats.kills}</span><span class="stat-label-big">ABATES</span></div>
                <div class="card-footer-grid">
                    <div class="stat-pill dia ${stats.diamonds > 0 ? 'active' : ''}"><i class="fas fa-gem"></i> <span>${stats.diamonds}</span></div>
                    <div class="stat-pill rare ${stats.rares > 0 ? 'active' : ''}"><i class="fas fa-paw"></i> <span>${stats.rares}</span></div>
                    <div class="stat-pill troll ${stats.trolls > 0 ? 'active' : ''}"><i class="fas fa-ghost"></i> <span>${stats.trolls}</span></div>
                </div>
            `;
            
            const deleteBtn = cardElement.querySelector('.btn-delete-item');
            if (deleteBtn) {
                deleteBtn.onclick = async () => {
                    if (await showCustomAlert('Excluir este registro?', 'Confirmar', true)) {
                        trophies.splice(originalIndex, 1);
                        saveData(savedData);
                        checkAndSetGreatOneCompletion(slug, savedData.greats[slug]);
                        renderGreatOneHistoryView(container, animalName, slug, furName, originReserveKey);
                    }
                };
            }
            gridContainer.appendChild(cardElement);
        });
    }

    historyContainer.innerHTML = headerHtml;
    historyContainer.appendChild(gridContainer);
    container.appendChild(historyContainer);

    const btnAdd = historyContainer.querySelector('#btn-add-entry');
    if (btnAdd) {
        btnAdd.onclick = () => {
            openAddEntryModal(animalName, furName, (newEntry) => {
                trophies.push(newEntry);
                saveData(savedData);
                checkAndSetGreatOneCompletion(slug, savedData.greats[slug]);
                renderGreatOneHistoryView(container, animalName, slug, furName, originReserveKey);
            });
        };
    }
}

function openAddEntryModal(animalName, furName, onSave) {
    const modal = document.getElementById('form-modal');
    modal.className = 'modal-overlay form-modal'; 
    const today = new Date().toISOString().split('T')[0];

    modal.innerHTML = `
        <div class="modal-content-box go-dossier-modal input-mode">
            <div class="go-modal-header centered"><span class="dossier-label">NOVO REGISTRO TÁTICO</span><h3>${animalName}</h3><div class="go-fur-tag"><i class="fas fa-crown"></i> ${furName}</div></div>
            <div class="go-form-body">
                <div class="date-section"><label>DATA DA CAPTURA</label><input type="date" id="input-date" value="${today}" class="tactical-date-input"></div>
                <div class="tactical-input-grid">
                    <div class="stat-input-cell kills"><div class="cell-icon"><i class="fas fa-skull"></i></div><label>ABATES</label><input type="number" id="input-kills" placeholder="0" min="0"></div>
                    <div class="stat-input-cell diamonds"><div class="cell-icon"><i class="fas fa-gem"></i></div><label>DIAMANTES</label><input type="number" id="input-diamonds" placeholder="0" min="0"></div>
                    <div class="stat-input-cell rares"><div class="cell-icon"><i class="fas fa-paw"></i></div><label>RAROS</label><input type="number" id="input-rares" placeholder="0" min="0"></div>
                    <div class="stat-input-cell trolls"><div class="cell-icon"><i class="fas fa-ghost"></i></div><label>TROLLS</label><input type="number" id="input-trolls" placeholder="0" min="0"></div>
                </div>
            </div>
            <div class="go-btn-group"><button id="btn-cancel-add" class="go-btn go-btn-secondary">CANCELAR</button><button id="btn-confirm-add" class="go-btn go-btn-primary">SALVAR REGISTRO</button></div>
        </div>`;

    modal.style.display = 'flex';
    setTimeout(() => document.getElementById('input-kills').focus(), 100);
    modal.querySelector('#btn-cancel-add').onclick = () => closeModal('form-modal');
    modal.querySelector('#btn-confirm-add').onclick = () => {
        const selectedDate = document.getElementById('input-date').value;
        if (!selectedDate) { alert("Por favor, selecione uma data."); return; }
        const newEntry = {
            date: selectedDate ? new Date(selectedDate).toISOString() : new Date().toISOString(),
            stats: {
                kills: parseInt(document.getElementById('input-kills').value) || 0,
                diamonds: parseInt(document.getElementById('input-diamonds').value) || 0,
                trolls: parseInt(document.getElementById('input-trolls').value) || 0,
                rares: parseInt(document.getElementById('input-rares').value) || 0
            }
        };
        closeModal('form-modal');
        if (onSave) onSave(newEntry);
    };
}