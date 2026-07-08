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

function openTacticalModal(title, contentHtml) {
    // Injeção de estilos para o Design Premium HUD (Atualizado)
    if (!document.getElementById('tactical-modal-styles')) {
        const style = document.createElement('style');
        style.id = 'tactical-modal-styles';
        style.innerHTML = `
            .tactical-modal-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; margin-top: 15px; }
            .tactical-stat-card { background: rgba(255, 255, 255, 0.03); border: 1px solid rgba(255, 255, 255, 0.1); padding: 15px; border-radius: 8px; display: flex; flex-direction: column; align-items: center; transition: 0.3s; }
            .tactical-stat-card:hover { border-color: var(--primary-color); background: rgba(0, 188, 212, 0.05); }
            .tactical-stat-card i { color: var(--primary-color); font-size: 1.2rem; margin-bottom: 8px; filter: drop-shadow(0 0 5px var(--primary-color)); }
            .tactical-stat-label { font-family: var(--font-headings); font-size: 0.7rem; color: #aaa; text-transform: uppercase; letter-spacing: 1.5px; margin-bottom: 5px; }
            .tactical-stat-value { font-size: 1.8rem; font-weight: 800; color: #fff; line-height: 1; }
            
            /* Estilo Otimizado para Listas (Zonas) */
            .zone-list-container { display: flex; flex-direction: column; gap: 8px; }
            .zone-list-item { 
                display: flex; justify-content: space-between; align-items: center; 
                padding: 12px 15px; background: rgba(255,255,255,0.03); 
                border-left: 3px solid var(--primary-color); border-radius: 4px;
                font-size: 0.95rem; transition: 0.2s;
            }
            .zone-list-item:hover { background: rgba(0, 188, 212, 0.1); }
            .zone-time { font-weight: bold; color: var(--primary-color); font-family: monospace; }
            .zone-icon { font-size: 1.1rem; color: #fff; opacity: 0.8; }
        `;
        document.head.appendChild(style);
    }

    const modal = document.createElement('div');
    modal.className = 'modal-overlay';
    modal.style.cssText = 'position:fixed; top:0; left:0; width:100%; height:100%; background:rgba(0,0,0,0.85); backdrop-filter:blur(8px); z-index:9999; display:flex; align-items:center; justify-content:center; padding: 20px;';
    
    modal.innerHTML = `
        <div class="modal-content" style="background:linear-gradient(145deg, #1a1a1a, #111); border:1px solid rgba(0, 188, 212, 0.3); padding:25px; border-radius:12px; width:100%; max-width:400px; color:#fff; position:relative; box-shadow:0 15px 40px rgba(0,0,0,0.8);">
            <h3 style="color:var(--primary-color); margin-top:0; margin-bottom:20px; text-transform:uppercase; letter-spacing:2px; font-family:Bebas Neue, sans-serif; text-align:center; border-bottom:1px solid rgba(0, 188, 212, 0.2); padding-bottom:10px;">${title}</h3>
            <div class="zone-list-container" style="font-size:1rem; line-height:1.6;">${contentHtml}</div>
            <button id="close-modal-btn" style="margin-top:25px; width:100%; padding:12px; background:transparent; border:1px solid var(--primary-color); color:var(--primary-color); font-weight:bold; cursor:pointer; text-transform:uppercase; border-radius:4px; transition:0.3s;">Fechar</button>
        </div>
    `;

    modal.querySelector('#close-modal-btn').onmouseover = (e) => { e.target.style.background = 'var(--primary-color)'; e.target.style.color = '#000'; };
    modal.querySelector('#close-modal-btn').onmouseout = (e) => { e.target.style.background = 'transparent'; e.target.style.color = 'var(--primary-color)'; };
    modal.querySelector('#close-modal-btn').onclick = () => document.body.removeChild(modal);
    modal.onclick = (e) => { if(e.target === modal) document.body.removeChild(modal); };
    document.body.appendChild(modal);
}

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
                // Função auxiliar interna para higienizar e normalizar strings de forma idêntica
                const cleanForCompare = (str) => {
                    return str ? str.toLowerCase()
                                    .normalize("NFD")
                                    .replace(/[\u0300-\u036f]/g, "")
                                    .replace(/[^a-z0-9]/g, "") // Remove hífens, espaços e sublinhados
                                    .trim() : "";
                };

                const targetSlug = cleanForCompare(session.animalSlug);
                
                // Busca robusta comparando tanto o nome puro quanto o slug mapeado
                const animalName = items.find(item => 
                    cleanForCompare(item) === targetSlug || 
                    cleanForCompare(slugify(item)) === targetSlug
                );

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

    const style = document.createElement('style');
    style.textContent = `
        .search-wrapper { position: relative; margin: 0 auto 30px auto; max-width: 800px; width: 95%; }
        .search-wrapper input { width: 100%; padding: 15px 45px 15px 45px; background: #222; border: 2px solid #333; border-radius: 50px; color: white; font-size: 1rem; outline: none; }
        .animal-card.hidden-card { display: none !important; }
    `;
    container.appendChild(style);

    const searchWrapper = document.createElement('div');
    searchWrapper.className = 'search-wrapper';
    searchWrapper.innerHTML = `
        <i class="fas fa-search search-icon" style="position:absolute; left:15px; top:50%; transform:translateY(-50%); color:#00bcd4;"></i>
        <input type="text" placeholder="Buscar por nome..." id="animal-search-input">
        <i class="fas fa-times clear-btn" style="position:absolute; right:15px; top:50%; transform:translateY(-50%); color:#666; cursor:pointer; display:none;"></i>
    `;
    container.appendChild(searchWrapper);

    const grid = document.createElement('div');
    grid.className = 'album-grid selection-mode';
    container.appendChild(grid);

    const grindableAnimals = items.filter(animal => {
        const slug = slugify(animal);
        let animalData = null;
        for (const reserveKey in animalHotspotData) {
            if (animalHotspotData[reserveKey][slug]) { animalData = animalHotspotData[reserveKey][slug]; break; }
        }
        return !!animalData;
    });

    grindableAnimals.sort().forEach(animalName => {
        const slug = slugify(animalName);
        const card = createCardElement(animalName);
        card.classList.add('animal-card');
        card.setAttribute('data-name', normalizeText(animalName) || animalName.toLowerCase());
        card.addEventListener('click', () => renderReserveSelectionForGrind(container, slug));
        grid.appendChild(card);
    });

    const filterInput = searchWrapper.querySelector('input');
    const iconClear = searchWrapper.querySelector('.clear-btn');
    
    filterInput.addEventListener('input', () => {
        const term = normalizeText(filterInput.value) || filterInput.value.toLowerCase();
        iconClear.style.display = term.length > 0 ? 'block' : 'none';
        grid.querySelectorAll('.animal-card').forEach(card => {
            card.classList.toggle('hidden-card', !(card.getAttribute('data-name') || '').includes(term));
        });
    });
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

    Object.entries(reservesData).filter(([_, data]) => data.animals.includes(animalSlug)).sort((a, b) => a[1].name.localeCompare(b[1].name)).forEach(([reserveKey, reserve]) => {
        const card = document.createElement('div');
        card.className = 'reserve-card';
        card.innerHTML = `<img src="${reserve.image}"><h3>${reserve.name}</h3>`;
        card.addEventListener('click', async () => {
            const newSession = { id: Date.now(), animalSlug, reserveKey, startDate: new Date().toISOString(), counts: { total: 0, diamonds: [], rares: [], super_raros: [], trolls: [], great_ones: [] }, zones: [] };
            if (!savedData.grindSessions) savedData.grindSessions = [];
            savedData.grindSessions.push(newSession);
            saveData(savedData);
            await showCustomAlert(`Grind de ${animalName} iniciado!`, 'Sucesso');
            renderGrindCounterView(newSession.id);
        });
        grid.appendChild(card);
    });
}

export async function renderGrindCounterView(sessionId) {
    const session = savedData.grindSessions.find(s => s.id === sessionId);
    if (!session) return renderMainView('grind');

    session.lastUpdate = new Date().toISOString();
    saveData(savedData); 

    const { animalSlug, reserveKey } = session;
    
    // Função de higienização para garantir correspondência idêntica e tolerante a hífens/sublinhados
    const cleanString = (str) => {
        return str ? str.toLowerCase()
                        .normalize("NFD")
                        .replace(/[\u0300-\u036f]/g, "")
                        .replace(/[^a-z0-9]/g, "")
                        .trim() : "";
    };

    const targetSlugClean = cleanString(animalSlug);

    // Encontra o nome do animal mapeado na lista oficial de forma flexível
    const animalName = items.find(item => 
        cleanString(item) === targetSlugClean || 
        cleanString(slugify(item)) === targetSlugClean
    ) || (animalSlug ? animalSlug.charAt(0).toUpperCase() + animalSlug.slice(1).replace(/[-_]/g, ' ') : "Animal Desconhecido");

    const reserveName = reservesData[reserveKey]?.name || "Reserva Desconhecida";

    // Realiza a busca tolerante dentro do animalHotspotData da reserva
    let hotspotInfo = {};
    let verifiedHotspotKey = animalSlug;
    
    if (animalHotspotData[reserveKey]) {
        const matchingKey = Object.keys(animalHotspotData[reserveKey]).find(key => cleanString(key) === targetSlugClean);
        if (matchingKey) {
            hotspotInfo = animalHotspotData[reserveKey][matchingKey];
            verifiedHotspotKey = matchingKey; // Preserva a chave correta para o modal do mapa
        }
    }
    
    const mainContent = document.querySelector('.main-content');
    const container = mainContent.querySelector('.content-container');
    mainContent.querySelector('.page-header h2').textContent = `Grind Ativo`;
    mainContent.querySelector('.page-header .back-button').onclick = () => renderMainView('grind');

    container.innerHTML = '';
    const totalKills = session.counts.total || 0;
    const percentage = Math.min((totalKills / 3000) * 100, 100);

    // Preparação dos Modais
    const pop = hotspotInfo.population || { machos: 0, femeas: 0, zonasGrupo: 0, solos: 0 };
    // Define o tipo prioritário: 'drink' primeiro, senão 'eat'
    const hasDrink = hotspotInfo.schedules?.some(s => s.type === 'drink');
    const priorityType = hasDrink ? 'drink' : 'eat';

    const schedulesList = hotspotInfo.schedules ? hotspotInfo.schedules.map(s => {
        const isPriority = s.type === priorityType;
        return `
            <div class="zone-list-item ${isPriority ? 'zone-highlight' : ''}" style="${isPriority ? 'border-left: 4px solid var(--primary-color); background: rgba(0, 188, 212, 0.15); box-shadow: 0 0 10px rgba(0, 188, 212, 0.2);' : ''}">
                <span class="${isPriority ? 'zone-time-highlight' : ''}" style="${isPriority ? 'font-weight: 800; color: #fff; text-shadow: 0 0 8px rgba(255,255,255,0.5);' : ''}">${s.time}</span>
                <i class="fas fa-${s.type === 'drink' ? 'water' : s.type === 'eat' ? 'leaf' : 'bed'}"></i>
            </div>
        `;
    }).join('') : '<span>Sem dados</span>';

    const grindContainer = document.createElement('div');
    grindContainer.className = 'grind-container';
    grindContainer.innerHTML = `
        <div class="grind-v3-card">
            <div class="v3-header" style="background-image: url('animais/${animalSlug.replace(/-/g, '_')}.png');">
                <div class="v3-overlay-top">
                    <h2 class="v3-animal-name">${animalName}</h2>
                    <span class="v3-reserve-tag"><i class="fas fa-map-marker-alt"></i> ${reserveName}</span>
                </div>
                <div class="v3-stats-bar-container">
                    <div class="hud-info-box"><span class="hud-label">Classe</span><span class="hud-value">${hotspotInfo.animalClass || '?'}</span></div>
                    <div class="hud-info-box"><span class="hud-label">Peso Máx</span><span class="hud-value">${hotspotInfo.maxWeightEstimate || '?'}</span></div>
                    <div class="hud-info-box"><span class="hud-label">Score</span><span class="hud-value">${hotspotInfo.maxScore || '?'}</span></div>
                    <div class="hud-info-box"><span class="hud-label">População</span><span class="hud-value">${pop.machos + pop.femeas}</span></div>
                </div>
            </div>

          <div class="tactical-nav-grid" style="display:grid; grid-template-columns:1fr 1fr; gap:10px; padding:15px;">
                <button id="btn-open-pop" style="background:#222; border:1px solid #333; padding:12px; color:var(--primary-color); font-weight:bold; border-radius:8px; cursor:pointer;"><i class="fas fa-users"></i> POPULAÇÃO ANIMAL</button>
                <button id="btn-open-zones" style="background:#222; border:1px solid #333; padding:12px; color:var(--primary-color); font-weight:bold; border-radius:8px; cursor:pointer;"><i class="fas fa-clock"></i> ZONAS DE NECESSIDADE</button>
            </div>

            <div class="v3-counter-deck" style="margin: 15px; padding: 20px; background: rgba(255, 255, 255, 0.03); backdrop-filter: blur(15px); border: 1px solid rgba(255, 255, 255, 0.1); border-radius: 16px; display: flex; align-items: center; justify-content: space-between; box-shadow: 0 4px 15px rgba(0,0,0,0.3);">
                <button class="btn-circle-action act-minus" id="btn-dec-main" style="width: 45px; height: 45px; border-radius: 50%; background: rgba(0, 188, 212, 0.1); border: 1px solid var(--primary-color); color: var(--primary-color); cursor: pointer;"><i class="fas fa-minus"></i></button>
                
                <div class="v3-display-box" style="text-align: center; flex: 1;">
                    <div class="v3-sub-label" style="font-size: 0.6rem; color: #888; text-transform: uppercase; letter-spacing: 2px; margin-bottom: 5px;">Total de Abates</div>
                    <input type="number" class="v3-input-number" id="v3-kill-input" value="${totalKills}" style="background: transparent; border: none; color: #fff; font-size: 2.5rem; font-weight: 700; width: 100%; text-align: center; font-family: 'Bebas Neue', sans-serif;">
                    <div class="prob-line-container" style="height: 2px; background: rgba(255,255,255,0.1); width: 80%; margin: 8px auto 0;">
                        <div class="prob-line-fill" style="height: 100%; background: var(--primary-color); width: ${percentage}%; box-shadow: 0 0 10px var(--primary-color);"></div>
                    </div>
                </div>
                
                <button class="btn-circle-action act-plus" id="btn-inc-main" style="width: 45px; height: 45px; border-radius: 50%; background: var(--primary-color); border: none; color: #000; cursor: pointer; font-weight: bold;"><i class="fas fa-plus"></i></button>
            </div>
            <div class="v5-specials-grid" id="specials-grid-container"></div>
            <div class="v4-footer-actions" style="display: flex; gap: 12px; padding: 15px 20px; border-top: 1px solid rgba(255,255,255,0.05);">
                <button class="hotspot-button" id="btn-view-map" style="flex:2; padding:12px; background: rgba(0, 188, 212, 0.1); border: 1px solid var(--primary-color); color: var(--primary-color); font-weight: bold; border-radius: 6px; cursor: pointer; text-transform: uppercase;">
                    <i class="fas fa-map"></i> MAPA HOTSPOT
                </button>
                <button class="back-button" id="btn-delete-grind" style="flex:1; padding:12px; background: rgba(255, 82, 82, 0.1); border: 1px solid #ff5252; color: #ff5252; font-weight: bold; border-radius: 6px; cursor: pointer; text-transform: uppercase;">
                    <i class="fas fa-trash"></i> EXCLUIR
                </button>
            </div>
        </div>
    `;
    
    container.appendChild(grindContainer);

    grindContainer.querySelector('#btn-open-pop').onclick = () => openTacticalModal('População', `
        <div class="tactical-modal-grid">
            <div class="tactical-stat-card"><i class="fas fa-mars" style="color:#42a5f5; filter: drop-shadow(0 0 5px rgba(66, 165, 245, 0.6));"></i><span class="tactical-stat-label">Machos</span><span class="tactical-stat-value" style="color:#42a5f5;">${pop.machos}</span></div>
            <div class="tactical-stat-card"><i class="fas fa-venus" style="color:#ec407a; filter: drop-shadow(0 0 5px rgba(236, 64, 122, 0.6));"></i><span class="tactical-stat-label">Fêmeas</span><span class="tactical-stat-value" style="color:#ec407a;">${pop.femeas}</span></div>
            <div class="tactical-stat-card"><i class="fas fa-map-marked-alt" style="color:var(--primary-color); filter: drop-shadow(0 0 5px rgba(var(--primary-rgb), 0.6));"></i><span class="tactical-stat-label">Zonas</span><span class="tactical-stat-value">${pop.zonasGrupo}</span></div>
            <div class="tactical-stat-card"><i class="fas fa-dot-circle" style="color:var(--primary-color); filter: drop-shadow(0 0 5px rgba(var(--primary-rgb), 0.6));"></i><span class="tactical-stat-label">Solos</span><span class="tactical-stat-value">${pop.solos}</span></div>
        </div>
    `);
    grindContainer.querySelector('#btn-open-zones').onclick = () => openTacticalModal('Zonas de Necessidade', schedulesList);

    // Grid de Especiais (Diamante, Raros, etc)
    const updateMainDisplay = () => { const input = document.getElementById('v3-kill-input'); if(input) input.value = session.counts.total; };
    const createControlTile = (type, label, iconPath, cssClass, useModal = false) => {
        if (!Array.isArray(session.counts[type])) session.counts[type] = [];
        const count = session.counts[type].length;
        const tile = document.createElement('div');
        tile.className = `v5-control-tile ${cssClass}`;
       tile.innerHTML = `
            <div class="v5-tile-header">
                <img src="${iconPath}" class="v5-icon-img">
                <span class="v5-label">${label.toUpperCase()}</span>
            </div>
            <div class="v5-tile-controls">
                <button class="btn-tile minus" id="btn-dec-${type}"><i class="fas fa-minus"></i></button>
                <input type="number" class="input-tile" id="input-${type}" value="${count}">
                <button class="btn-tile plus" id="btn-inc-${type}"><i class="fas fa-plus"></i></button>
            </div>
        `;
        tile.querySelector(`#btn-inc-${type}`).onclick = () => { if(useModal) openGrindDetailModal(sessionId, type, session.counts.total + 1); else { session.counts[type].push({id:Date.now()}); session.counts.total++; saveData(savedData); tile.querySelector(`#input-${type}`).value = session.counts[type].length; updateMainDisplay(); }};
        tile.querySelector(`#btn-dec-${type}`).onclick = () => { if(session.counts[type].length>0){ session.counts[type].pop(); if(session.counts.total>0) session.counts.total--; saveData(savedData); tile.querySelector(`#input-${type}`).value = session.counts[type].length; updateMainDisplay(); }};
        return tile;
    };

    const gridContainer = document.getElementById('specials-grid-container');
    gridContainer.style.display = 'grid';
    gridContainer.style.gridTemplateColumns = '1fr 1fr'; // Fixa em 2 colunas
    gridContainer.style.gap = '12px';

    const specials = [
        { type: 'diamonds', label: 'Diamante', icon: 'icones/diamante_icon.png', css: 'tile-dia' },
        { type: 'rares', label: 'Raro', icon: 'icones/pata_icon.png', css: 'tile-rare', modal: true },
        { type: 'great_ones', label: 'Great One', icon: 'icones/greatone_icon.png', css: 'tile-go', modal: true },
        { type: 'super_raros', label: 'Super Raro', icon: 'icones/coroa_icon.png', css: 'tile-super', modal: true },
        { type: 'trolls', label: 'Troll', icon: 'icones/fantasma_icon.png', css: 'tile-troll' }
    ];

    specials.forEach(s => gridContainer.appendChild(createControlTile(s.type, s.label, s.icon, s.css, !!s.modal)));

    // Tile Mapa Tático - Integrado ao Grid
    const mapTile = document.createElement('div');
    mapTile.className = 'v5-control-tile tile-map';
    mapTile.style.cursor = 'pointer';
    mapTile.innerHTML = `
        <div class="v5-tile-header"><i class="fa-solid fa-map-location-dot" style="color:var(--primary-color);"></i><span class="v5-label">MAPA</span></div>
        <div class="v5-tile-controls" style="justify-content: center;"><span>ABRIR</span></div>
    `;
    mapTile.onclick = () => renderTacticalMapDedicatedView(sessionId);
    gridContainer.appendChild(mapTile);

// Referência ao input de contagem
    const killInput = document.getElementById('v3-kill-input');

    // Garante que o session.counts.total seja atualizado caso o usuário digite manualmente
    killInput.onchange = () => {
        session.counts.total = parseInt(killInput.value) || 0;
        saveData(savedData);
    };

    // Botão DECREMENTAR (Lê o valor atual do DOM e subtrai)
    document.getElementById('btn-dec-main').onclick = () => {
        let currentVal = parseInt(killInput.value) || 0;
        if (currentVal > 0) {
            currentVal--;
            killInput.value = currentVal;
            session.counts.total = currentVal;
            saveData(savedData);
        }
    };

    // Botão INCREMENTAR (Lê o valor atual do DOM e soma)
    document.getElementById('btn-inc-main').onclick = () => {
        let currentVal = parseInt(killInput.value) || 0;
        currentVal++;
        killInput.value = currentVal;
        session.counts.total = currentVal;
        saveData(savedData);
    };

    // Vincular o novo Dossiê Tático V2 ao botão do mapa
    document.getElementById('btn-view-map').onclick = () => renderPremiumHotspotModal(reserveKey, animalSlug, hotspotInfo);
    document.getElementById('btn-delete-grind').onclick = async () => { if(await showCustomAlert("Excluir?", "Confirmar", true)) { savedData.grindSessions.splice(savedData.grindSessions.findIndex(s=>s.id===sessionId), 1); saveData(savedData); renderMainView('grind'); }};
}

/**
 * RECONSTRUTOR DE ELITE V3: renderPremiumHotspotModal (Dossiê Tático V2)
 * Arquitetura de bloco puro para o cabeçalho. Garante o alinhamento e respiros perfeitos de forma automática
 * mesmo se o nome do animal ocupar duas ou mais linhas. Vinculado estritamente à var(--font-headings) mestre do app.
 */
function renderPremiumHotspotModal(reserveKey, animalSlug, hotspotInfo) {
    const reserveName = reservesData[reserveKey]?.name || "Reserva Desconhecida";
    
    // 1. Sincronização exata e higienização do Nome de Apresentação Oficial
    const cleanStringForMatch = (str) => str ? str.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-z0-9]/g, "").trim() : "";
    const targetSlugClean = cleanStringForMatch(animalSlug);
    const animalName = items.find(item => cleanStringForMatch(item) === targetSlugClean || cleanStringForMatch(slugify(item)) === targetSlugClean) || animalSlug.replace(/[-_]/g, ' ');

    const pop = hotspotInfo?.population || { machos: 0, femeas: 0, zonasGrupo: 0, solos: 0 };
    const totalPop = (pop.machos || 0) + (pop.femeas || 0);

    // 2. Mapeamento de Arquivos do Repositório Local
    const formatToFilename = (str) => {
        if (!str) return "";
        return str.toLowerCase().replace(/[\s-]/g, '_').trim();
    };
    
    const reserveFilename = formatToFilename(reserveName);
    const animalFilename = formatToFilename(animalName);
    const mapImgSrc = `hotspots/${reserveFilename}_${animalFilename}_hotspot.jpg`;
    const fallbackMapImgSrc = `mapas/${reserveFilename}_mapa.jpg`;

    // 3. Processamento Exclusivo de Horários Táticos
    const schedules = hotspotInfo?.schedules || [];
    const drinkZones = schedules.filter(s => s.type === 'drink');
    const eatZones = schedules.filter(s => s.type === 'eat' || s.type === 'feed');

    let scheduleCardsHtml = '';

    if (drinkZones.length > 0) {
        drinkZones.forEach((z, idx) => {
            scheduleCardsHtml += `
                <div class="hud-v2-card highlight drink-theme">
                    <div class="h2-c-icon" style="color: #00e5ff; background: rgba(0, 229, 255, 0.1);"><i class="fas fa-tint"></i></div>
                    <div class="h2-c-data">
                        <span class="h2-c-label">Horário de Bebida ${drinkZones.length > 1 ? `#${idx + 1}` : 'Principal'}</span>
                        <span class="h2-c-val" style="color: #00e5ff;">${z.time}</span>
                    </div>
                </div>
            `;
        });
    } else if (eatZones.length > 0) {
        eatZones.forEach((z, idx) => {
            scheduleCardsHtml += `
                <div class="hud-v2-card highlight eat-theme">
                    <div class="h2-c-icon" style="color: #81c784; background: rgba(129, 199, 132, 0.1);"><i class="fas fa-leaf"></i></div>
                    <div class="h2-c-data">
                        <span class="h2-c-label">Horário de Alimentação ${eatZones.length > 1 ? `#${idx + 1}` : 'Principal'}</span>
                        <span class="h2-c-val" style="color: #81c784;">${z.time}</span>
                    </div>
                </div>
            `;
        });
    } else {
        scheduleCardsHtml += `
            <div class="hud-v2-card highlight empty-theme">
                <div class="h2-c-icon" style="color: #ff5252; background: rgba(255, 82, 82, 0.1);"><i class="fas fa-clock"></i></div>
                <div class="h2-c-data">
                    <span class="h2-c-label">Zonas Ativas</span>
                    <span class="h2-c-val" style="color: #ff5252; font-size: 1.2rem;">Horários Indisponíveis</span>
                </div>
            </div>
        `;
    }

    // 4. PURGA DE CACHE E INJEÇÃO DO DESIGN ADAPTATIVO FLUIDO
    const oldStyles = document.getElementById('premium-dossier-v2-styles');
    if (oldStyles) oldStyles.remove();

    const style = document.createElement('style');
    style.id = 'premium-dossier-v2-styles';
    style.textContent = `
        .hud-v2-overlay {
            position: fixed; inset: 0; background: rgba(4, 4, 6, 0.93);
            backdrop-filter: blur(20px); -webkit-backdrop-filter: blur(20px);
            z-index: 99999; display: flex; align-items: center; justify-content: center; padding: 20px;
        }
        .hud-v2-wrapper {
            display: grid; grid-template-columns: 1fr 390px;
            width: 96vw; max-width: 1300px; height: 85vh; min-height: 580px;
            background: rgba(14, 14, 18, 0.88); border: 1px solid rgba(0, 188, 212, 0.3);
            border-radius: 16px; overflow: hidden; box-shadow: 0 30px 70px rgba(0,0,0,0.95);
        }
        .hud-v2-map-canvas {
            background: #050507; position: relative; display: flex; align-items: center; justify-content: center;
            padding: 25px; overflow: hidden; border-right: 1px solid rgba(255,255,255,0.05);
        }
        .hud-v2-map-canvas img {
            max-width: 100%; max-height: 100%; object-fit: contain;
            border-radius: 10px; box-shadow: 0 0 40px rgba(0,0,0,0.9);
            border: 1px solid rgba(255,255,255,0.03);
        }
        .hud-v2-close-floating {
            position: absolute; top: 20px; left: 20px; z-index: 10;
            background: rgba(15, 15, 20, 0.85); border: 1px solid rgba(0, 188, 212, 0.4);
            color: #fff; padding: 10px 20px; border-radius: 30px; font-family: 'Montserrat', sans-serif;
            font-size: 0.85rem; font-weight: 700; letter-spacing: 1px; cursor: pointer; transition: all 0.25s;
            display: flex; align-items: center; gap: 8px; box-shadow: 0 4px 15px rgba(0,0,0,0.5);
        }
        .hud-v2-close-floating:hover {
            background: #c62828; border-color: #ff5252; box-shadow: 0 0 20px rgba(198,40,40,0.5);
            transform: translateY(-1px);
        }
        .hud-v2-panel {
            background: linear-gradient(180deg, rgba(20, 20, 24, 0.98) 0%, rgba(10, 10, 12, 1) 100%);
            padding: 30px 24px; display: flex; flex-direction: column; overflow-y: auto; height: 100%; box-sizing: border-box;
        }
        .hud-v2-panel::-webkit-scrollbar { width: 6px; }
        .hud-v2-panel::-webkit-scrollbar-track { background: transparent; }
        .hud-v2-panel::-webkit-scrollbar-thumb { background: rgba(0, 188, 212, 0.25); border-radius: 3px; }
        
        /* SOLUÇÃO DE BLOCO DINÂMICO: Garante auto-organização natural baseada no conteúdo */
        .hud-v2-header { 
            display: block !important;
            width: 100% !important;
            height: auto !important; /* Força o cálculo dinâmico da altura bloqueando restrições externas */
            max-height: none !important;
            position: relative !important;
            margin: 0 0 25px 0 !important; 
            border-bottom: 2px solid var(--primary-color) !important; 
            padding: 0 0 22px 0 !important; /* Espaço confortável mestre até a linha divisória */
            box-sizing: border-box !important;
            flex-shrink: 0 !important;
        }
        
        /* UNIFICAÇÃO TIPOGRÁFICA DE ELITE (Mesmo padrão das telas principais e h2) */
        .hud-v2-title { 
            font-family: var(--font-headings, 'Bebas Neue', sans-serif) !important; 
            font-size: 2.5rem !important; 
            font-weight: 800 !important;
            color: #ffffff !important; 
            margin: 0 0 8px 0 !important; /* Margem inferior controlada para o respiro perfeito */
            line-height: 1.2 !important; /* Respiro vertical perfeito para as acentuações nativas */
            text-transform: uppercase !important; 
            letter-spacing: 1px !important;
            display: block !important;
            width: 100% !important;
            height: auto !important; /* Evita aprisionamento de caixas de texto multilinha */
            white-space: normal !important;
            word-wrap: break-word !important;
            overflow-wrap: break-word !important;
            text-shadow: 0 2px 10px rgba(0, 0, 0, 0.5) !important;
        }
        
        /* INDICADOR SECUNDÁRIO SUBORDINADO (Reserva) */
        .hud-v2-loc { 
            font-family: 'Montserrat', sans-serif !important;
            font-size: 0.85rem !important; 
            font-weight: 600 !important; 
            color: #888888 !important; 
            text-transform: uppercase !important; 
            letter-spacing: 1.5px !important; 
            display: flex !important; 
            align-items: center !important; 
            gap: 6px !important;
            margin: 0 !important;
            padding: 0 !important;
        }
        .hud-v2-loc i {
            color: var(--primary-color) !important;
            font-size: 0.9rem !important;
        }

        .hud-v2-grid { display: flex; flex-direction: column; gap: 12px; }
        .hud-v2-section-title { font-family: var(--font-headings, sans-serif); font-size: 1.1rem; color: #555; letter-spacing: 1.5px; text-transform: uppercase; margin: 15px 0 2px 0; border-bottom: 1px solid rgba(255,255,255,0.03); padding-bottom: 4px;}
        
        .hud-v2-card {
            background: rgba(255, 255, 255, 0.01); border: 1px solid rgba(255, 255, 255, 0.04);
            border-radius: 10px; padding: 12px 16px; display: flex; align-items: center; gap: 14px;
            backdrop-filter: blur(5px); transition: all 0.25s ease;
        }
        .hud-v2-card:hover { border-color: rgba(255, 255, 255, 0.15); background: rgba(255, 255, 255, 0.02); }
        .hud-v2-card.highlight {
            border-left: 4px solid var(--primary-color); background: rgba(0, 188, 212, 0.02);
        }
        .hud-v2-card.highlight.drink-theme { border-left-color: #00e5ff; }
        .hud-v2-card.highlight.eat-theme { border-left-color: #81c784; }

        .h2-c-icon { width: 38px; height: 38px; background: rgba(255,255,255,0.02); border: 1px solid rgba(255,255,255,0.04); border-radius: 8px; display: flex; align-items: center; justify-content: center; font-size: 1.15rem; color: #777; flex-shrink: 0; }
        .h2-c-data { display: flex; flex-direction: column; }
        .h2-c-label { font-size: 0.65rem; color: #555; text-transform: uppercase; font-weight: 700; letter-spacing: 0.8px; }
        .h2-c-val { font-family: var(--font-headings, sans-serif); font-size: 1.45rem; color: #eee; line-height: 1.2; margin-top: 2px; letter-spacing: 0.5px; }
        .h2-c-val small { font-size: 0.85rem; color: #666; margin-left: 4px; font-weight: normal; }
        
        @media (max-width: 900px) {
            .hud-v2-wrapper { grid-template-columns: 1fr; height: 90vh; }
            .hud-v2-map-canvas { height: 42vh; border-right: none; border-bottom: 1px solid rgba(255,255,255,0.05); padding: 15px; }
            .hud-v2-panel { height: 48vh; padding: 20px 15px; }
            .hud-v2-close-floating { top: 15px; left: 15px; padding: 7px 14px; font-size: 0.9rem; }
        }
    `;
    document.head.appendChild(style);

    // 5. RENDERIZAÇÃO COERENTE DO MODAL
    const modalElement = document.createElement('div');
    modalElement.className = 'hud-v2-overlay';
    modalElement.innerHTML = `
        <div class="hud-v2-wrapper">
            <div class="hud-v2-map-canvas">
                <button class="hud-v2-close-floating" id="btn-close-hud-v2">
                    <i class="fas fa-times"></i> FECHAR
                </button>
                <img src="${mapImgSrc}" alt="Dossiê de Hotspots" onerror="this.onerror=null; this.src='${fallbackMapImgSrc}';">
            </div>
            <div class="hud-v2-panel">
                <header class="hud-v2-header">
                    <h2 class="hud-v2-title">${animalName.replace(/-/g, ' ')}</h2>
                    <div class="hud-v2-loc"><i class="fas fa-map-marker-alt"></i> ${reserveName}</div>
                </header>
                <div class="hud-v2-grid">
                    <div class="hud-v2-section-title">Horários de Bedida ou Comida</div>
                    ${scheduleCardsHtml}
                    
                    <div class="hud-v2-section-title">Parâmetros Biométricos</div>
                    <div class="hud-v2-card">
                        <div class="h2-c-icon" style="color:#e0e0e0;"><i class="fas fa-shield-alt"></i></div>
                        <div class="h2-c-data">
                            <span class="h2-c-label">Classe Animal</span>
                            <span class="h2-c-val">${hotspotInfo?.animalClass || 'Não listada'}</span>
                        </div>
                    </div>
                    <div class="hud-v2-card">
                        <div class="h2-c-icon" style="color:#e0e0e0;"><i class="fas fa-weight-hanging"></i></div>
                        <div class="h2-c-data">
                            <span class="h2-c-label">Estimativa de Peso Máximo</span>
                            <span class="h2-c-val">${hotspotInfo?.maxWeightEstimate || '??'} <small>KG</small></span>
                        </div>
                    </div>
                    <div class="hud-v2-card">
                        <div class="h2-c-icon" style="color:#ffd700; background:rgba(255,215,0,0.03);"><i class="fas fa-trophy"></i></div>
                        <div class="h2-c-data">
                            <span class="h2-c-label">Trofél Máximo Estimado</span>
                            <span class="h2-c-val">${hotspotInfo?.maxScore || '0.00'} <small style="color:rgba(255,215,0,0.5);">RATING</small></span>
                        </div>
                    </div>
                    <div class="hud-v2-card">
                        <div class="h2-c-icon" style="color:#42a5f5;"><i class="fas fa-users"></i></div>
                        <div class="h2-c-data">
                            <span class="h2-c-label">População Estimada na Reserva</span>
                            <span class="h2-c-val">${totalPop} <small>M:${pop.machos || 0} | F:${pop.femeas || 0}</small></span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    `;

    const destroyModal = () => {
        document.body.removeChild(modalElement);
    };

    modalElement.querySelector('#btn-close-hud-v2').onclick = destroyModal;
    modalElement.onclick = (e) => {
        if (e.target === modalElement) destroyModal();
    };

    document.body.appendChild(modalElement);
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
    
    // Função de higienização resiliente idêntica à do renderGrindCounterView
    const cleanString = (str) => {
        return str ? str.toLowerCase()
                        .normalize("NFD")
                        .replace(/[\u0300-\u036f]/g, "")
                        .replace(/[^a-z0-9]/g, "")
                        .trim() : "";
    };
    const targetSlugClean = cleanString(animalSlug);

    // Encontra o nome do animal mapeado na lista oficial de forma flexível para evitar 'undefined'
    const animalName = items.find(item => 
        cleanString(item) === targetSlugClean || 
        cleanString(slugify(item)) === targetSlugClean
    ) || (animalSlug ? animalSlug.charAt(0).toUpperCase() + animalSlug.slice(1).replace(/[-_]/g, ' ') : "Animal Desconhecido");

    // Motor de busca flexível para as bases de dados de pelagens (evita falhas por hífens/underlines)
    const getSpeciesDataFlexibly = (dataSource, currentSlug) => {
        if (!dataSource) return null;
        if (dataSource[currentSlug]) return dataSource[currentSlug];
        const target = cleanString(currentSlug);
        const matchKey = Object.keys(dataSource).find(k => cleanString(k) === target);
        return matchKey ? dataSource[matchKey] : null;
    };

    let potentialFurs = [];
    let title = '';

    switch (type) {
        case 'rares':
            title = 'Selecione a Pelagem Rara';
            const rareData = getSpeciesDataFlexibly(rareFursData, animalSlug);
            if (rareData?.macho) potentialFurs.push(...rareData.macho.map(f => ({ displayName: `Macho ${f}`, originalName: f, gender: 'macho' })));
            if (rareData?.femea) potentialFurs.push(...rareData.femea.map(f => ({ displayName: `Fêmea ${f}`, originalName: f, gender: 'femea' })));
            break;
        case 'super_raros':
            title = 'Selecione a Pelagem Super Rara';
            const srRareData = getSpeciesDataFlexibly(rareFursData, animalSlug);
            const srDiamondData = getSpeciesDataFlexibly(diamondFursData, animalSlug);
            if (srRareData?.macho && srDiamondData?.macho?.length > 0) potentialFurs.push(...srRareData.macho.map(f => ({ displayName: `Macho ${f}`, originalName: f, gender: 'macho' })));
            if (srRareData?.femea && srDiamondData?.femea?.length > 0) potentialFurs.push(...srRareData.femea.map(f => ({ displayName: `Fêmea ${f}`, originalName: f, gender: 'femea' })));
            break;
        case 'great_ones':
            title = 'Selecione a Pelagem Great One';
            const greatData = getSpeciesDataFlexibly(greatsFursData, animalSlug);
            if (greatData) {
                // Filtra para pegar apenas as pelagens únicas e limpas para exibição inicial no grid
                const uniqueFurs = [];
                greatData.forEach(f => {
                    const name = typeof f === 'string' ? f : (f.pelagem || '');
                    if (name && !uniqueFurs.includes(name)) uniqueFurs.push(name);
                });
                potentialFurs = uniqueFurs.map(f => ({ displayName: f, originalName: f, gender: 'macho' }));
            }
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
    modalContent.style.cssText = `max-width: 900px; width: 95%; background: #120e1a; border: 2px solid #a333c8; border-radius: 16px; display: flex; flex-direction: column; max-height: 90vh; overflow: hidden; position: relative; box-shadow: 0 0 35px rgba(163,51,200,0.4);`;
    
    modalContent.innerHTML = `
        <div class="modal-header-simple" style="padding: 20px; flex-shrink: 0; text-align: center; border-bottom: 1px solid rgba(163,51,200,0.25);">
            <h3 id="grind-modal-title" style="color: #fff; margin: 0; font-family: 'Bebas Neue', sans-serif; font-size: 2rem; letter-spacing: 1.5px;">${title.toUpperCase()}</h3>
            <p style="color: #a333c8; margin: 3px 0 0 0; font-family: 'Bebas Neue', sans-serif; font-size: 1.2rem; letter-spacing: 1px;">${animalName.toUpperCase()}</p>
        </div>
        <div class="grind-select-grid" style="flex: 1; overflow-y: auto; padding: 20px; display: grid; grid-template-columns: repeat(auto-fill, minmax(140px, 1fr)); gap: 15px; box-sizing: border-box;"></div>
        <div class="modal-buttons" style="padding: 15px 20px; border-top: 1px solid rgba(163,51,200,0.2); display: flex; justify-content: center; background: rgba(10,8,16,0.95); flex-shrink: 0; box-sizing: border-box;">
            <button id="btn-cancel-select" class="back-button" style="width: 100%; max-width: 300px; padding: 12px; background: rgba(255,255,255,0.02); border: 1px solid rgba(255,255,255,0.1); color: #ccc; border-radius: 8px; font-family: 'Bebas Neue', sans-serif; font-size: 1.2rem; cursor: pointer; letter-spacing: 1px; transition: all 0.2s;">CANCELAR</button>
        </div>
    `;

    const gridContainer = modalContent.querySelector('.grind-select-grid');

    potentialFurs.forEach((fur) => {
        const animalSlugFixed = slugify(animalName).replace(/-/g, '_'); 
        const furSlug = slugify(fur.originalName).replace(/-/g, '_');
        const genderPart = fur.gender === 'macho' ? '_macho' : (fur.gender === 'femea' ? '_femea' : '');

        let fileName = type === 'great_ones' ? `great_${animalSlugFixed}_${furSlug}` : `${animalSlugFixed}_${furSlug}${genderPart}`;
        const imgUrl = `animais/pelagens/${fileName}.png`;

        const card = document.createElement('div');
        card.className = 'grind-option-card';
        card.style.cssText = `display: flex; flex-direction: column; align-items: center; padding: 12px; background: rgba(255,255,255,0.01); border: 1px solid rgba(255,255,255,0.06); border-radius: 10px; cursor: pointer; transition: all 0.2s; min-height: 140px; box-sizing: border-box;`;

        const imgContainer = document.createElement('div');
        imgContainer.style.cssText = "width:100%; height:100px; display:flex; align-items:center; justify-content:center; overflow:hidden; margin-bottom:8px; background: rgba(0,0,0,0.4); border-radius: 6px; border: 1px solid rgba(255,255,255,0.03);";
        
        const img = new Image();
        img.src = imgUrl;
        img.onerror = () => { img.src = `animais/${animalSlugFixed}.png`; };
        img.style.cssText = "max-width:100%; max-height:100%; object-fit:contain; filter: drop-shadow(0 4px 8px rgba(0,0,0,0.5));";
        imgContainer.appendChild(img);

        const nameDiv = document.createElement('div');
        nameDiv.style.cssText = "font-size: 1rem; color: #fff; text-align: center; font-family: 'Bebas Neue', sans-serif; letter-spacing: 0.5px; text-transform: uppercase;";
        nameDiv.textContent = fur.displayName;

        card.appendChild(imgContainer);
        card.appendChild(nameDiv);

        // Feedback Visual de seleção HUD
        card.onmouseenter = () => { card.style.borderColor = '#a333c8'; card.style.background = 'rgba(163,51,200,0.05)'; };
        card.onmouseleave = () => { card.style.borderColor = 'rgba(255,255,255,0.06)'; card.style.background = 'rgba(255,255,255,0.01)'; };

       // Executa a lógica de persistência e sincronização de dados unificados
        card.onclick = () => {
            const baseFurName = fur.displayName.split(' - ')[0].split(' (')[0].trim();

            if (type === 'great_ones') {
                // UX Avançada: Escaneia se existem variações (Combos) para esta pelagem específica utilizando busca flexível
                const rawFursData = getSpeciesDataFlexibly(greatsFursData, animalSlug) || [];
                const variations = [];
                const normalize = (str) => str ? str.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").trim() : "";
                const targetNormalized = normalize(baseFurName);

                rawFursData.forEach(item => {
                    if (item && typeof item === 'object') {
                        const itemPelagem = item.pelagem ? normalize(item.pelagem) : (item.combo ? normalize(item.combo.split('-')[0]) : "");
                        if (itemPelagem === targetNormalized || itemPelagem.includes(targetNormalized)) {
                            const varName = item.variacao ? item.variacao.trim() : (item.combo && item.combo.includes('-') ? item.combo.split('-')[1].trim() : null);
                            if (varName && !variations.includes(varName)) variations.push(varName);
                        }
                    }
                });

                // Função interna isolada para consolidar o salvamento do Great One compartilhado
                const finalizeGreatOneSave = (selectedVariation) => {
                    if (!savedData.greats) savedData.greats = {};
                    if (!savedData.greats[animalSlug]) savedData.greats[animalSlug] = {};
                    if (!savedData.greats[animalSlug].trophies) savedData.greats[animalSlug].trophies = [];

                    // Cria o log preenchendo automaticamente as informações do Grind atual!
                    const newTrophyEntry = {
                        date: new Date().toISOString(),
                        furName: baseFurName,
                        variation: selectedVariation || null,
                        stats: {
                            kills: session.counts.total || 0,
                            diamonds: session.counts.diamonds?.length || 0,
                            trolls: session.counts.trolls?.length || 0,
                            rares: session.counts.rares?.length || 0
                        }
                    };
                    savedData.greats[animalSlug].trophies.push(newTrophyEntry);

                    // Sincroniza e concede as conclusões nas abas correspondentes
                    if (!savedData.greatOnes) savedData.greatOnes = {};
                    if (!savedData.greatOnes[animalSlug]) savedData.greatOnes[animalSlug] = [];
                    
                    if (!savedData.greatOnes[animalSlug].includes(baseFurName)) {
                        savedData.greatOnes[animalSlug].push(baseFurName);
                    }

                    if (selectedVariation) {
                        const matchCombo = rawFursData.find(c => {
                            if (typeof c !== 'object') return false;
                            const cPelagem = c.pelagem ? normalize(c.pelagem) : (c.combo ? normalize(c.combo.split('-')[0]) : "");
                            const cVariacao = c.variacao ? normalize(c.variacao) : (c.combo && c.combo.includes('-') ? normalize(c.combo.split('-')[1]) : "");
                            return cPelagem === targetNormalized && cVariacao === normalize(selectedVariation);
                        });
                        const targetComboId = matchCombo && matchCombo.combo ? matchCombo.combo : `${baseFurName} - ${selectedVariation}`;
                        if (!savedData.greatOnes[animalSlug].includes(targetComboId)) {
                            savedData.greatOnes[animalSlug].push(targetComboId);
                        }
                    }

                    // Incrementa o contador local do grind ativo
                    session.counts.great_ones.push({ id: Date.now(), furName: baseFurName, variation: selectedVariation || null });
                    session.counts.total++;

                    saveData(savedData);
                    closeModal('form-modal');
                    renderGrindCounterView(sessionId);
                    showToast(`GREAT ONE: ${baseFurName.toUpperCase()} REGISTRADO!`, 'success');
                };

                // Se houver combos, apresenta o menu tático de botões imediatos
                if (variations.length > 0) {
                    modalContent.querySelector('#grind-modal-title').textContent = "SELECIONE A GALHADA / PRESA";
                    gridContainer.innerHTML = '';
                    gridContainer.style.gridTemplateColumns = '1fr';
                    gridContainer.style.display = 'flex';
                    gridContainer.style.flexDirection = 'column';
                    gridContainer.style.gap = '10px';

                    variations.forEach(v => {
                        const btnVar = document.createElement('button');
                        btnVar.style.cssText = "width: 100%; padding: 14px; background: rgba(255,193,7,0.03); border: 1px solid rgba(255,193,7,0.2); color: #ffc107; border-radius: 8px; font-family: 'Bebas Neue', sans-serif; font-size: 1.3rem; letter-spacing: 1px; cursor: pointer; transition: all 0.2s; text-transform: uppercase;";
                        btnVar.innerHTML = `<i class="fas fa-crown"></i> MODELO: ${v}`;
                        btnVar.onmouseenter = () => { btnVar.style.background = 'rgba(255,193,7,0.1)'; btnVar.style.boxShadow = '0 0 10px rgba(255,193,7,0.2)'; };
                        btnVar.onmouseleave = () => { btnVar.style.background = 'rgba(255,193,7,0.03)'; btnVar.style.boxShadow = 'none'; };
                        btnVar.onclick = () => finalizeGreatOneSave(v);
                        gridContainer.appendChild(btnVar);
                    });

                    const btnSkip = document.createElement('button');
                    btnSkip.style.cssText = "width: 100%; padding: 12px; background: rgba(255,255,255,0.02); border: 1px solid rgba(255,255,255,0.08); color: #888; border-radius: 8px; font-family: 'Bebas Neue', sans-serif; font-size: 1.15rem; letter-spacing: 1px; cursor: pointer; margin-top: 5px; text-transform: uppercase;";
                    btnSkip.textContent = "APENAS PELAGEM (NÃO ESPECIFICAR GALHADA)";
                    btnSkip.onclick = () => finalizeGreatOneSave(null);
                    gridContainer.appendChild(btnSkip);
                    return;
                }

                // Se não houver variações, salva diretamente
                finalizeGreatOneSave(null);

            } else {
                // Fluxo de Persistência Convencional para Raros e Super Raros normais
                if (type === 'rares') {
                    if (!savedData.pelagens) savedData.pelagens = {};
                    if (!savedData.pelagens[animalSlug]) savedData.pelagens[animalSlug] = {};
                    savedData.pelagens[animalSlug][fur.displayName] = true;
                    session.counts.rares.push({ id: Date.now(), furName: fur.displayName });
                } else if (type === 'super_raros') {
                    if (!savedData.super_raros) savedData.super_raros = {};
                    if (!savedData.super_raros[animalSlug]) savedData.super_raros[animalSlug] = {};
                    savedData.super_raros[animalSlug][fur.displayName] = true;
                    session.counts.super_raros.push({ id: Date.now(), furName: fur.displayName });
                }
                
                session.counts.total++;
                saveData(savedData);
                closeModal('form-modal');
                renderGrindCounterView(sessionId);
                showToast(`${fur.displayName.toUpperCase()} SALVO COM SUCESSO!`);
            }
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
    // --- CÓDIGO DE SUBSTITUIÇÃO PARA O BOTÃO SALVAR ---
    modal.querySelector('#btn-confirm-add').onclick = () => {
        const selectedDate = document.getElementById('input-date').value;
        
        // Validação simples
        if (!selectedDate) { 
            alert("Por favor, selecione uma data."); 
            return; 
        }

        // Cria a nova entrada de registro
        const newEntry = {
            date: selectedDate ? new Date(selectedDate).toISOString() : new Date().toISOString(),
            stats: {
                kills: parseInt(document.getElementById('input-kills').value) || 0,
                diamonds: parseInt(document.getElementById('input-diamonds').value) || 0,
                trolls: parseInt(document.getElementById('input-trolls').value) || 0,
                rares: parseInt(document.getElementById('input-rares').value) || 0
            }
        };

        // Garante que o array de logs existe
        if (!state.currentSession.logs) state.currentSession.logs = [];
        state.currentSession.logs.unshift(newEntry);

        // Garante que o objeto de contadores existe
        if (!state.currentSession.counts) state.currentSession.counts = { total: 0, diamonds: 0, greatOnes: 0, rares: 0, trolls: 0 };
        
        // Atualiza os totais matemáticos
        state.currentSession.counts.total += newEntry.stats.kills;
        state.currentSession.counts.diamonds += newEntry.stats.diamonds;
        state.currentSession.counts.rares += newEntry.stats.rares;
        state.currentSession.counts.trolls += newEntry.stats.trolls;

        // =================================================================
        // ★ A CORREÇÃO ESTÁ AQUI: Atualiza o carimbo de tempo (Timestamp)
        // Isso avisa o Dashboard que este grind acabou de ser mexido!
        // =================================================================
        // 1. Atualiza o timestamp com precisão de milissegundos
        state.currentSession.lastUpdate = new Date().toISOString(); 
        
        // 2. Sincroniza o estado global explicitamente antes do salvamento
        const sessionIndex = savedData.grindSessions.findIndex(s => s.id === state.currentSession.id);
        if (sessionIndex !== -1) {
            savedData.grindSessions[sessionIndex] = { ...state.currentSession };
        }

        // 3. Persistência imediata para evitar perda em navegação rápida no mobile
        saveData(savedData);
        closeModal('form-modal');
        renderStatsPanel(); 
        renderLogsList();
        showToast('REGISTRO ADICIONADO!', 'success');
  };
}