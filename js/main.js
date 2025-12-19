// Arquivo: js/main.js

// =================================================================
// ========================== MÓDULOS ==============================
// =================================================================
import { renderLoginForm, renderRegisterForm, setupLogoutButton, closeModal, showCustomAlert } from './auth.js';
import { rareFursData, greatsFursData, items, diamondFursData, reservesData, animalHotspotData, multiMountsData } from '../data/gameData.js';
import { auth, db } from './firebase.js';
import { runDataValidation } from './dataValidator.js';
// Adicione esta linha junto com os outros imports no topo
import { slugify, showToast, setRandomBackground, isTimeInRanges } from './utils.js';
import { createCardElement } from './components/AnimalCard.js';
import { TABS } from './constants.js';
import { createPageHeader } from './components/PageHeader.js';
import { createFurCard } from './components/FurCard.js';
import { createReserveCard } from './components/ReserveCard.js';
import { createGrindCard } from './components/GrindCard.js';
import { createHotspotCard } from './components/HotspotCard.js';
import { createMultiMountCard } from './components/MultiMountCard.js';
import { createReserveProgressCard } from './components/ReserveProgressCard.js';
import { createAchievementCard } from './components/AchievementCard.js';
import { createAnimalChecklistRow } from './components/AnimalChecklistRow.js';
import { createGrindCounter } from './components/GrindCounter.js';
import { createGreatOneTrophyContent, createGrindFurSelectionContent } from './components/Modals.js';
import { createNavigationCard } from './components/NavigationCard.js';
import { createSettingsPanel } from './components/SettingsPanel.js';
// --- IMPORTAÇÕES DA NOVA LÓGICA (PASSO 2) ---
import { 
    getUniqueAnimalData, 
    getAnimalAttributes, 
    checkAndSetGreatOneCompletion, 
    calcularProgressoDetalhado, 
    calcularReserveProgress, 
    getAnimalCardStatus
} from './progressLogic.js';
// =================================================================
// =================== VARIÁVEIS GLOBAIS DO APP ====================
// =================================================================
let appContainer;
let currentUser = null;
let savedData = {};

// =================================================================
// =================== GERENCIAMENTO DE HISTÓRICO ==================
// =================================================================

// Escuta quando o usuário aperta "Voltar" no navegador/celular
window.addEventListener('popstate', (event) => {
    if (event.state) {
        // Se houver um estado salvo, restaura a tela correta
        if (event.state.view === 'hub') {
            renderNavigationHub(false); // false = não criar novo histórico
        } else if (event.state.view === 'category') {
            renderMainView(event.state.tabKey, false);
        } else if (event.state.view === 'detail') {
            showDetailView(event.state.name, event.state.tabKey, event.state.originReserve, false);
        }
    } else {
        // Se não houver estado (ex: carregou a página agora), vai pro Hub
        renderNavigationHub(false);
    }
});

// Função auxiliar para salvar o histórico sem repetir código
function pushHistory(stateObj) {
    // Só salva se o estado atual for diferente do novo (evita duplicatas)
    const currentState = history.state;
    if (!currentState || currentState.view !== stateObj.view || currentState.name !== stateObj.name) {
        history.pushState(stateObj, '', '');
    }
}
// =================================================================
// ===================== FUNÇÕES UTILITÁRIAS =======================
// =================================================================



// =================================================================
// ====================== DADOS E CATEGORIAS =======================
// =================================================================

const categorias = {
    [TABS.PELAGENS]: { title: 'Pelagens Raras', items: items, icon: '<img src="icones/pata_icon.png" class="custom-icon">', isHtml: true },
    [TABS.DIAMANTES]: { title: 'Diamantes', items: items, icon: '<img src="icones/diamante_icon.png" class="custom-icon">', isHtml: true },
    [TABS.GREATS]: { title: 'Great Ones', items: items.filter(item => Object.keys(greatsFursData).includes(slugify(item))), icon: '<img src="icones/greatone_icon.png" class="custom-icon">', isHtml: true },
    [TABS.SUPER_RAROS]: { title: 'Super Raros', items: items, icon: '<img src="icones/coroa_icon.png" class="custom-icon">', isHtml: true },
    [TABS.MONTAGENS]: { title: 'Montagens Múltiplas', icon: '<img src="icones/trofeu_icon.png" class="custom-icon">', isHtml: true },
    [TABS.GRIND]: { title: 'Contador de Grind', icon: '<img src="icones/cruz_icon.png" class="custom-icon">', isHtml: true },
    [TABS.RESERVAS]: { title: 'Reservas de Caça', icon: '<img src="icones/mapa_icon.png" class="custom-icon">', isHtml: true },
    [TABS.PROGRESSO]: { title: 'Painel de Progresso', icon: '<img src="icones/progresso_icon.png" class="custom-icon">', isHtml: true },
    [TABS.CONFIGURACOES]: { title: 'Configurações', icon: '<img src="icones/configuracoes_icon.png" class="custom-icon">', isHtml: true }
};

// =================================================================
// =================== LÓGICA DE DADOS (FIREBASE) ==================
// =================================================================

function getDefaultDataStructure() {
    return {
        pelagens: {},
        diamantes: {},
        greats: {},
        super_raros: {},
        grindSessions: []
    };
}

async function loadDataFromFirestore() {
    if (!currentUser) {
        console.error("Tentando carregar dados sem usuário logado.");
        return getDefaultDataStructure();
    }
    const userDocRef = db.collection('usuarios').doc(currentUser.uid);
    try {
        const doc = await userDocRef.get();
        if (doc.exists) {
            console.log("Dados carregados do Firestore!");
            const cloudData = doc.data();
            return { ...getDefaultDataStructure(), ...cloudData };
        } else {
            console.log("Nenhum dado encontrado para o usuário, criando novo documento.");
            const defaultData = getDefaultDataStructure();
            await userDocRef.set(defaultData);
            return defaultData;
        }
    } catch (error) {
        console.error("Erro ao carregar dados do Firestore:", error);
        return getDefaultDataStructure();
    }
}

function saveData(data) {
    if (!currentUser) {
        console.error("Tentando salvar dados sem usuário logado.");
        return;
    }
    const userDocRef = db.collection('usuarios').doc(currentUser.uid);
    
    // --- CORREÇÃO DE SEGURANÇA (PASSO 1) ---
    // Usamos { merge: true } para evitar sobrescrever dados não carregados
    userDocRef.set(data, { merge: true })
        .then(() => {
            // console.log("Salvo..."); // Pode comentar o log se quiser
            showToast("Progresso salvo com sucesso!"); // <--- FEEDBACK VISUAL
        })
        .catch((error) => {
            console.error("Erro ao salvar dados na nuvem: ", error);
        });

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
        renderMultiMountsView(mountsGrid.parentNode);
    }
}


// =================================================================
// =================== LÓGICA DE RENDERIZAÇÃO (UI) =================
// =================================================================

function renderSkeletonLoader() {
    appContainer.innerHTML = `
        <div class="skeleton-loader-container">
            <div class="skeleton skeleton-title"></div>
            <div class="skeleton-cards-container">
                ${Array(8).fill(0).map(() => `<div class="skeleton skeleton-nav-card"></div>`).join('')}
            </div>
        </div>
    `;
}

function renderNavigationHub(addToHistory = true) {
    if (addToHistory) {
        history.pushState({ view: 'hub' }, '', '');
    }
    
    appContainer.innerHTML = '';
    
    // Container Principal
    const hub = document.createElement('div');
    hub.className = 'navigation-hub design-flutuante';

    // Título
    const title = document.createElement('h1');
    title.className = 'hub-title design-flutuante';
    title.textContent = 'Registro do Caçador';
    hub.appendChild(title);

    // Grid de Cards
    const cardsContainer = document.createElement('div');
    cardsContainer.className = 'cards-container-flutuante';

    Object.keys(categorias).forEach(key => {
        const cat = categorias[key];
        if (!cat) return;

        // USA O NOVO COMPONENTE
        const card = createNavigationCard({
            key: key,
            title: cat.title,
            icon: cat.icon,
            isHtml: cat.isHtml,
            onClick: () => renderMainView(key)
        });

        cardsContainer.appendChild(card);
    });

    hub.appendChild(cardsContainer);
    appContainer.appendChild(hub);
    
    setupLogoutButton(currentUser, appContainer);
}

function renderMainView(tabKey, addToHistory = true) {
    if (addToHistory) {
        pushHistory({ view: 'category', tabKey: tabKey });
    }
    // ... resto da função continua igual
    appContainer.innerHTML = '';
    const currentTab = categorias[tabKey];
    if (!currentTab) return;

    const mainContent = document.createElement('div');
    mainContent.className = 'main-content';

    // Cria o cabeçalho usando o novo componente
const header = createPageHeader(currentTab.title, renderNavigationHub, 'Voltar ao Menu');
mainContent.appendChild(header);

    const contentContainer = document.createElement('div');
    contentContainer.className = `content-container ${tabKey}-view`;
    mainContent.appendChild(contentContainer);
    appContainer.appendChild(mainContent);

    setupLogoutButton(currentUser, appContainer);

    // Lógica para páginas especiais (sem filtros)
    if (tabKey === 'progresso') {
        renderProgressView(contentContainer);
    } else if (tabKey === 'reservas') {
        renderReservesList(contentContainer);
    } else if (tabKey === 'montagens') {
        renderMultiMountsView(contentContainer);
    } else if (tabKey === 'grind') {
        renderGrindHubView(contentContainer);
    } else if (tabKey === 'configuracoes') {
        renderSettingsView(contentContainer);
    } else {
        // --- INÍCIO DA SEÇÃO DE FILTROS (ATUALIZADA) ---
        const filtersContainer = document.createElement('div');
        filtersContainer.className = 'filters-container';
        
        // 1. Busca por Nome
        const filterInput = document.createElement('input');
        filterInput.type = 'text';
        filterInput.className = 'filter-input';
        filterInput.placeholder = 'Buscar animal...';
        filtersContainer.appendChild(filterInput);

        const { classes, levels } = getUniqueAnimalData();
        const sortedReserves = Object.entries(reservesData).sort(([, a], [, b]) => a.name.localeCompare(b.name));

        // 2. Filtro de Classe
        const classSelect = document.createElement('select');
        classSelect.innerHTML = `<option value="">Classe (Todas)</option>` + classes.map(c => `<option value="${c}">Classe ${c}</option>`).join('');
        filtersContainer.appendChild(classSelect);

        // 3. Filtro de Dificuldade
        const levelSelect = document.createElement('select');
        levelSelect.innerHTML = `<option value="">Dificuldade (Todas)</option>` + levels.map(l => `<option value="${l}">${l}</option>`).join('');
        filtersContainer.appendChild(levelSelect);

        // 4. Filtro de Reserva
        const reserveSelect = document.createElement('select');
        reserveSelect.innerHTML = `<option value="">Reserva (Todas)</option>` + sortedReserves.map(([key, data]) => `<option value="${key}">${data.name}</option>`).join('');
        filtersContainer.appendChild(reserveSelect);

        // 5. NOVO: Filtro de Horário
        const timeInput = document.createElement('input');
        timeInput.type = 'time';
        timeInput.className = 'filter-input'; // Reutiliza estilo para manter consistência
        timeInput.style.minWidth = '130px'; // Ajuste fino para não ficar espremido
        timeInput.title = "Filtrar por Horário de Bebida";
        filtersContainer.appendChild(timeInput);
        
        contentContainer.appendChild(filtersContainer);
        // --- FIM DA SEÇÃO DE FILTROS ---

        const albumGrid = document.createElement('div');
        albumGrid.className = 'album-grid';
        contentContainer.appendChild(albumGrid);

        const itemsToRender = (currentTab.items || []).filter(item => typeof item === 'string' && item !== null && item.trim() !== '');

        itemsToRender.sort((a, b) => a.localeCompare(b)).forEach(name => {
            const card = createAnimalCard(name, tabKey);
            albumGrid.appendChild(card);
        });
        
        albumGrid.querySelectorAll('.animal-card').forEach((card, index) => {
            card.style.animationDelay = `${index * 0.03}s`;
        });

        // --- LÓGICA PARA APLICAR FILTROS (COM HORÁRIO) ---
        const applyFilters = () => {
            const searchTerm = filterInput.value.toLowerCase();
            const selectedClass = classSelect.value;
            const selectedLevel = levelSelect.value;
            const selectedReserve = reserveSelect.value;
            const selectedTime = timeInput.value; // Pega o valor do relógio (HH:MM)

            albumGrid.querySelectorAll('.animal-card').forEach(card => {
                const animalName = card.querySelector('.info').textContent.toLowerCase();
                const slug = card.dataset.slug;
                const attributes = getAnimalAttributes(slug);

                const nameMatch = animalName.includes(searchTerm);
                const classMatch = !selectedClass || attributes.classes.includes(selectedClass);
                const levelMatch = !selectedLevel || attributes.levels.includes(selectedLevel);
                const reserveMatch = !selectedReserve || attributes.reserves.includes(selectedReserve);
                
                // Nova Lógica de Horário:
                let timeMatch = true;
                if (selectedTime) {
                    if (selectedReserve) {
                        // Se tem reserva selecionada, checa o horário específico nela
                        const info = animalHotspotData[selectedReserve]?.[slug];
                        timeMatch = info ? isTimeInRanges(selectedTime, info.drinkZonesPotential) : false;
                    } else {
                        // Se "Todas as Reservas", checa se ele bebe nesse horário em QUALQUER lugar
                        timeMatch = Object.values(animalHotspotData).some(reserve => 
                            reserve[slug] && isTimeInRanges(selectedTime, reserve[slug].drinkZonesPotential)
                        );
                    }
                }

                if (nameMatch && classMatch && levelMatch && reserveMatch && timeMatch) {
                    card.style.display = 'flex';
                } else {
                    card.style.display = 'none';
                }
            });
        };

        // Adiciona os "escutadores" de eventos
        filterInput.addEventListener('input', applyFilters);
        classSelect.addEventListener('change', applyFilters);
        levelSelect.addEventListener('change', applyFilters);
        reserveSelect.addEventListener('change', applyFilters);
        timeInput.addEventListener('input', applyFilters); // Escuta mudança no relógio

        
    }
}

function createAnimalCard(name, tabKey) {
    // 1. Usa o componente novo para criar o visual
    const card = createCardElement(name);
    const slug = card.dataset.slug; // Pega o slug que o componente gerou

    // 2. Adiciona o evento de clique (Lógica)
    card.addEventListener('click', () => showDetailView(name, tabKey));

    // 3. Atualiza as barrinhas de progresso e cores (Lógica)
    updateCardAppearance(card, slug, tabKey);
    
    return card;
}
// Decide qual tipo de visualização de detalhes mostrar
function showDetailView(name, tabKey, originReserveKey = null, addToHistory = true) {
    if (addToHistory) {
        pushHistory({ view: 'detail', name: name, tabKey: tabKey, originReserve: originReserveKey });
    }
    // ... resto da função continua igual
    if (originReserveKey) {
        renderAnimalDossier(name, originReserveKey);
    } else {
        renderSimpleDetailView(name, tabKey);
    }
}

// Renderiza a visualização de detalhes simples (quando acessado pelo menu principal)
function renderSimpleDetailView(name, tabKey) {
    const mainContent = document.querySelector('.main-content');
    const slug = slugify(name); // Importado
    const contentContainer = mainContent.querySelector('.content-container');
    contentContainer.className = `content-container detail-view ${tabKey}-detail-view`;
    contentContainer.innerHTML = '';
    mainContent.querySelector('.page-header h2').textContent = name;
    const backButton = mainContent.querySelector('.page-header .back-button');
    backButton.innerHTML = `&larr; Voltar para ${categorias[tabKey].title}`;
    backButton.onclick = () => renderMainView(tabKey);

    const oldFilterContainer = mainContent.querySelector('.filter-toggle-container');
    if (oldFilterContainer) oldFilterContainer.remove();

    const filterContainer = document.createElement('div');
    filterContainer.className = 'filter-toggle-container';
    const btnShowAll = document.createElement('button');
    btnShowAll.className = 'filter-toggle-btn active';
    btnShowAll.textContent = 'Mostrar Todos';
    const btnShowMissing = document.createElement('button');
    btnShowMissing.className = 'filter-toggle-btn';
    btnShowMissing.textContent = 'Mostrar Faltantes';
    filterContainer.appendChild(btnShowAll);
    filterContainer.appendChild(btnShowMissing);
    mainContent.querySelector('.page-header').insertAdjacentElement('afterend', filterContainer);

    const renderFunctionMap = {
        'pelagens': renderRareFursDetailView,
        'diamantes': renderDiamondsDetailView,
        'super_raros': renderSuperRareDetailView,
        'greats': renderGreatsDetailView
    };

    const setActiveButton = (activeButton) => {
        btnShowAll.classList.remove('active');
        btnShowMissing.classList.remove('active');
        activeButton.classList.add('active');
    };
    
    const renderContent = (filter) => {
        const renderFunc = renderFunctionMap[tabKey];
        if (renderFunc) {
            renderFunc(contentContainer, name, slug, null, filter);
        }
    };

    btnShowAll.addEventListener('click', () => {
        setActiveButton(btnShowAll);
        renderContent('all');
    });
    
    btnShowMissing.addEventListener('click', () => {
        setActiveButton(btnShowMissing);
        renderContent('missing');
    });
    
    renderContent('all');
}

// Renderiza o dossiê completo de um animal (quando acessado por uma reserva)
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
    
    const filterContainer = document.createElement('div');
    filterContainer.className = 'filter-toggle-container';
    const btnShowAll = document.createElement('button');
    btnShowAll.className = 'filter-toggle-btn active';
    btnShowAll.textContent = 'Mostrar Todos';
    const btnShowMissing = document.createElement('button');
    btnShowMissing.className = 'filter-toggle-btn';
    btnShowMissing.textContent = 'Mostrar Faltantes';
    filterContainer.appendChild(btnShowAll);
    filterContainer.appendChild(btnShowMissing);
    
    const dossierContent = document.createElement('div');
    dossierContent.className = 'dossier-content';
    
    contentContainer.appendChild(filterContainer);
    contentContainer.appendChild(dossierTabs);
    contentContainer.appendChild(dossierContent);
    
    const tabs = {
        pelagens: { title: 'Pelagens Raras', renderFunc: renderRareFursDetailView },
        diamantes: { title: 'Diamantes', renderFunc: renderDiamondsDetailView },
        super_raros: { title: 'Super Raros', renderFunc: renderSuperRareDetailView },
        hotspot: { title: 'Hotspots', renderFunc: () => renderHotspotDetailModal(originReserveKey, slug) },
    };
    if (greatsFursData[slug]) {
        tabs.greats = { title: '<img src="icones/greatone_icon.png" class="custom-icon"> Great Ones', renderFunc: renderGreatsDetailView };
    }

    Object.entries(tabs).forEach(([key, value]) => {
        const tab = document.createElement('div');
        tab.className = 'dossier-tab';
        tab.innerHTML = value.title;
        tab.dataset.key = key;
        dossierTabs.appendChild(tab);
    });
    
    const reRenderActiveTab = (filter) => {
        const activeTab = dossierTabs.querySelector('.dossier-tab.active');
        if (activeTab) {
            const tabKey = activeTab.dataset.key;
            const renderFunc = tabs[tabKey]?.renderFunc;
            if (renderFunc) {
                if (tabKey === 'hotspot') {
                    renderFunc();
                } else {
                    renderFunc(dossierContent, animalName, slug, originReserveKey, filter);
                }
            }
        }
    };
    
    dossierTabs.addEventListener('click', e => {
        const tab = e.target.closest('.dossier-tab');
        if(!tab) return;
        dossierTabs.querySelectorAll('.dossier-tab').forEach(t => t.classList.remove('active'));
        tab.classList.add('active');
        const currentFilter = btnShowAll.classList.contains('active') ? 'all' : 'missing';
        filterContainer.style.display = tab.dataset.key === 'hotspot' ? 'none' : 'flex';
        reRenderActiveTab(currentFilter);
    });

    const setActiveButton = (activeButton) => {
        btnShowAll.classList.remove('active');
        btnShowMissing.classList.remove('active');
        activeButton.classList.add('active');
    };
    
    btnShowAll.addEventListener('click', () => {
        setActiveButton(btnShowAll);
        reRenderActiveTab('all');
    });

    btnShowMissing.addEventListener('click', () => {
        setActiveButton(btnShowMissing);
        reRenderActiveTab('missing');
    });

    dossierTabs.querySelector('.dossier-tab').click();
}

// Substitua a função antiga por esta:
function renderReservesList(container) {
    container.innerHTML = '';
    const grid = document.createElement('div');
    grid.className = 'reserves-grid';
    container.appendChild(grid);

    const sortedReserves = Object.entries(reservesData).sort(([, a], [, b]) => a.name.localeCompare(b.name));

    for (const [reserveKey, reserve] of sortedReserves) {
        // 1. Calcula o progresso (Lógica)
        const progress = calcularReserveProgress(reserveKey, savedData);
        
        // 2. Cria o visual usando o componente novo
        const card = createReserveCard(reserve, progress, () => showReserveDetailView(reserveKey));
        
        grid.appendChild(card);
    }
}
// Mostra a visualização de detalhes de uma reserva
function showReserveDetailView(reserveKey, originPage = 'reservas') { 
    const mainContent = document.querySelector('.main-content');
    const contentContainer = mainContent.querySelector('.content-container');
    contentContainer.className = 'content-container reserve-detail-view';
    contentContainer.innerHTML = '';

    const reserve = reservesData[reserveKey];
    if (!reserve) return;

    mainContent.querySelector('.page-header h2').textContent = reserve.name;
    const backButton = mainContent.querySelector('.page-header .back-button');
    
    backButton.innerHTML = `&larr; Voltar para ${categorias[originPage].title}`;
    backButton.onclick = () => renderMainView(originPage);

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

// Renderiza a lista de animais de uma reserva (VERSÃO NOVA)
function renderAnimalChecklist(container, reserveKey) {
    container.innerHTML = '';
    const checklistContainer = document.createElement('div');
    checklistContainer.className = 'animal-checklist';
    container.appendChild(checklistContainer);

    const reserve = reservesData[reserveKey];
    const animalNames = reserve.animals
        .map(slug => items.find(item => slugify(item) === slug))
        .filter(name => typeof name === 'string' && name !== null && name.trim() !== '');

    animalNames.sort((a,b) => a.localeCompare(b)).forEach(animalName => {
        const slug = slugify(animalName);
        
        // Mantemos os cálculos aqui para garantir precisão
        const totalRares = (rareFursData[slug]?.macho?.length || 0) + (rareFursData[slug]?.femea?.length || 0);
        const collectedRares = Object.values(savedData.pelagens?.[slug] || {}).filter(v => v === true).length;
        const raresPercentage = totalRares > 0 ? (collectedRares / totalRares) * 100 : 0;
        
        const totalDiamonds = (diamondFursData[slug]?.macho?.length || 0) + (diamondFursData[slug]?.femea?.length || 0);
        const collectedDiamonds = new Set((savedData.diamantes?.[slug] || []).map(t => t.type)).size;
        const diamondsPercentage = totalDiamonds > 0 ? (collectedDiamonds / totalDiamonds) * 100 : 0;
        
        const isGreatOne = greatsFursData.hasOwnProperty(slug);

        // Agrupamos os dados para passar pro componente
        const stats = {
            collectedRares, totalRares, raresPercentage,
            collectedDiamonds, totalDiamonds, diamondsPercentage
        };

        // USA O NOVO COMPONENTE
        const row = createAnimalChecklistRow({
            animalName,
            stats,
            isGreatOne,
            onClick: () => showDetailView(animalName, 'reservas', reserveKey)
        });

        checklistContainer.appendChild(row);
    });
}

// Renderiza a galeria de hotspots de uma reserva
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
        // Mantemos a lógica de nome de arquivo aqui, pois é específica dessa tela
        const slugReserve = slugify(reservesData[reserveKey].name).normalize("NFD").replace(/[\u0300-\u036f]/g, "");
        const imagePath = `hotspots/${slugReserve}_${animal.slug}_hotspot.jpg`;
        
        // Usamos o componente
        const card = createHotspotCard(
            animal.name, 
            imagePath, 
            () => renderHotspotDetailModal(reserveKey, animal.slug)
        );
        
        hotspotGrid.appendChild(card);
    });
}
// Renderiza o modal com detalhes do hotspot
function renderHotspotDetailModal(reserveKey, animalSlug) {
    const hotspotInfo = animalHotspotData[reserveKey]?.[animalSlug];
    const animalName = items.find(item => slugify(item) === animalSlug);
    const reserveName = reservesData[reserveKey].name;

    if (!hotspotInfo) {
        showCustomAlert('Dados de hotspot não encontrados.', 'Erro');
        return;
    }

    const slugReserve = slugify(reserveName);
    const imagePath = `hotspots/${slugReserve}_${animalSlug}_hotspot.jpg`;
    const modal = document.getElementById('image-viewer-modal');
    modal.innerHTML = `
        <span class="modal-close">&times;</span>
        <div class="hotspot-detail-content">
            <div id="map-container" class="hotspot-image-container">
                <img class="modal-content-viewer" src="${imagePath}" alt="Mapa de Hotspot ${animalName}" onerror="this.onerror=null;this.src='animais/placeholder.jpg';">
            </div>
            <div class="hotspot-info-panel">
                 <h3>${animalName} - ${reserveName}</h3>
                 <div class="info-row"><strong>Pont. Troféu:</strong> <span>${hotspotInfo.maxScore || 'N/A'}</span></div>
                 <div class="info-row"><strong>Peso Máx:</strong> <span>${hotspotInfo.maxWeightEstimate || 'N/A'}</span></div>
                 <div class="info-row"><strong>Zonas Potenciais:</strong> <span>${hotspotInfo.drinkZonesPotential || 'N/A'}</span></div>
                 <div class="info-row"><strong>Classe:</strong> <span>${hotspotInfo.animalClass || 'N/A'}</span></div>
                 <div class="info-row"><strong>Nível Máximo:</strong> <span>${hotspotInfo.maxLevel || 'N/A'}</span></div>
            </div>
        </div>
    `;
    
    modal.querySelector('.modal-close').addEventListener('click', () => closeModal('image-viewer-modal'));
    modal.style.display = 'flex';

    if (window.panzoom) {
        const image = modal.querySelector('.modal-content-viewer');
        panzoom(image, { maxZoom: 5, minZoom: 1 });
    }
}
// =================================================================
// ============ LÓGICA DE DETALHES E CONTEÚDO ESPECÍFICO ==========
// =================================================================

function updateCardAppearance(card, slug, tabKey) {
    if (!card) return;

    // 1. Limpa o visual anterior
    card.classList.remove('completed', 'inprogress', 'incomplete');
    const progressContainer = card.querySelector('.progress-container');
    if (progressContainer) progressContainer.innerHTML = '';

    // 2. Obtém os dados calculados da nossa nova função centralizada
    const stats = getAnimalCardStatus(slug, tabKey, savedData);

    // 3. Aplica as classes CSS baseadas no status retornado
    card.classList.add(stats.status);

    // 4. Desenha a barra de progresso (apenas visual)
    if (progressContainer && stats.total > 0) {
        // Garante que não ultrapasse 100% visualmente
        const displayCollected = Math.min(stats.collected, stats.total);
        const percentage = (displayCollected / stats.total) * 100;
        const progressText = `${displayCollected} / ${stats.total}`;
        
        progressContainer.innerHTML = `
            <div class="progress-bar-container" title="${progressText}">
                <div class="progress-bar-fill" style="width: ${percentage}%;"></div>
            </div>
            <span class="progress-bar-text">${progressText}</span>
        `;
    }
}
function renderRareFursDetailView(container, name, slug, originReserveKey = null, filter = 'all') {
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
        if (filter === 'missing' && isCompleted) return;

        // USA O NOVO COMPONENTE AQUI
        const card = createFurCard({
            animalSlug: slug,
            furOriginalName: furInfo.originalName,
            furDisplayName: furInfo.displayName,
            gender: furInfo.gender,
            isCompleted: isCompleted,
            onToggle: () => {
                // Lógica de Salvar
                if (!savedData.pelagens) savedData.pelagens = {};
                if (!savedData.pelagens[slug]) savedData.pelagens[slug] = {};
                savedData.pelagens[slug][furInfo.displayName] = !savedData.pelagens[slug][furInfo.displayName];
                saveData(savedData);
                
                // Se estivermos num dossiê (reserva), atualiza o progresso visualmente
                if (originReserveKey) reRenderActiveDossierTab(originReserveKey, name, slug);
            },
            onFullscreen: (src) => openImageViewer(src)
        });

        furGrid.appendChild(card);
    });
}

function renderSuperRareDetailView(container, name, slug, originReserveKey = null, filter = 'all') {
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
        furGrid.innerHTML = '<p>Nenhuma pelagem Super Rara encontrada para este animal.</p>';
        return;
    }

    fursToDisplay.sort((a, b) => a.displayName.localeCompare(b.displayName)).forEach(furInfo => {
        const isCompleted = savedData.super_raros?.[slug]?.[furInfo.displayName] === true;
        if (filter === 'missing' && isCompleted) return;

        // USA O NOVO COMPONENTE AQUI (Com isSuperRare = true)
        const card = createFurCard({
            animalSlug: slug,
            furOriginalName: furInfo.originalName,
            furDisplayName: furInfo.displayName,
            gender: furInfo.gender,
            isCompleted: isCompleted,
            isSuperRare: true, // Adiciona borda especial
            onToggle: () => {
                if (!savedData.super_raros) savedData.super_raros = {};
                if (!savedData.super_raros[slug]) savedData.super_raros[slug] = {};
                savedData.super_raros[slug][furInfo.displayName] = !savedData.super_raros[slug][furInfo.displayName];
                saveData(savedData);
                if (originReserveKey) reRenderActiveDossierTab(originReserveKey, name, slug);
            },
            onFullscreen: (src) => openImageViewer(src)
        });

        furGrid.appendChild(card);
    });
}

function renderDiamondsDetailView(container, name, slug, originReserveKey = null, filter = 'all') {
    container.innerHTML = '';
    const furGrid = document.createElement('div');
    furGrid.className = 'fur-grid';
    container.appendChild(furGrid);
    let animalStats = Object.values(animalHotspotData).map(r => r[slug]).find(s => s) || null;
    const speciesDiamondFurs = diamondFursData[slug];
    if (!speciesDiamondFurs) {
        furGrid.innerHTML = '<p>Nenhuma pelagem de diamante listada para este animal.</p>';
        return;
    }
    const allPossibleFurs = [];
    if (speciesDiamondFurs.macho) speciesDiamondFurs.macho.forEach(fur => allPossibleFurs.push({ displayName: `${fur}`, originalName: fur, gender: 'Macho' }));
    if (speciesDiamondFurs.femea) speciesDiamondFurs.femea.forEach(fur => allPossibleFurs.push({ displayName: `${fur}`, originalName: fur, gender: 'Fêmea' }));
    allPossibleFurs.sort((a, b) => a.displayName.localeCompare(b.displayName)).forEach(furInfo => {
        const fullTrophyName = `${furInfo.gender} ${furInfo.displayName}`;
        const highestScoreTrophy = (savedData.diamantes?.[slug] || []).filter(t => t.type === fullTrophyName).reduce((max, t) => t.score > max.score ? t : max, { score: -1 });
        const isCompleted = highestScoreTrophy.score !== -1;
        if (filter === 'missing' && isCompleted) return;
        const furCard = document.createElement('div');
        furCard.className = `fur-card ${isCompleted ? 'completed' : 'incomplete'}`;
        const furSlug = slugify(furInfo.originalName), genderSlug = furInfo.gender.toLowerCase();
        let statsHTML = animalStats ? `<div class="animal-stats-info"><div><i class="fas fa-trophy"></i>&nbsp;<strong>Pont. Troféu:</strong> ${animalStats.maxScore || 'N/A'}</div><div><i class="fas fa-weight-hanging"></i>&nbsp;<strong>Peso Máx:</strong> ${animalStats.maxWeightEstimate || 'N/A'}</div></div>` : '';
        furCard.innerHTML = `<img src="animais/pelagens/${slug}_${furSlug}_${genderSlug}.png" onerror="this.onerror=null; this.src='animais/pelagens/${slug}_${furSlug}.png'; this.onerror=null; this.src='animais/${slug}.png';"><div class="info-header"><span class="gender-tag">${furInfo.gender}</span><div class="info">${furInfo.displayName}</div></div>${statsHTML}<div class="score-container">${isCompleted ? `<span class="score-display"><i class="fas fa-trophy"></i> ${highestScoreTrophy.score}</span>` : '<span class="score-add-btn">Adicionar Pontuação</span>'}</div><button class="fullscreen-btn" title="Ver em tela cheia">⛶</button>`;
        const scoreContainer = furCard.querySelector('.score-container');
        scoreContainer.addEventListener('click', e => {
            e.stopPropagation();
            if (scoreContainer.querySelector('input')) return;
            scoreContainer.innerHTML = `<input type="number" class="score-input" value="${isCompleted ? highestScoreTrophy.score : ''}" placeholder="0.0">`;
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
                saveData(savedData);
                if (originReserveKey) reRenderActiveDossierTab(originReserveKey, name, slug);
                else renderSimpleDetailView(name, 'diamantes');
            };
            input.addEventListener('blur', saveScore);
            input.addEventListener('keydown', e => {
                if (e.key === 'Enter') saveScore();
                else if (e.key === 'Escape') {
                    if (originReserveKey) reRenderActiveDossierTab(originReserveKey, name, slug);
                    else renderSimpleDetailView(name, 'diamantes');
                }
            });
        });
        furGrid.appendChild(furCard);
    });
    furGrid.querySelectorAll('.fullscreen-btn').forEach(btn => {
        btn.addEventListener('click', (event) => {
            event.stopPropagation();
            const imgSrc = btn.closest('.fur-card').querySelector('img').src;
            openImageViewer(imgSrc);
        });
    });
}

function reRenderActiveDossierTab(reserveKey, animalName, slug) {
    const activeTab = document.querySelector('.dossier-tab.active');
    const filterContainer = document.querySelector('.filter-toggle-container');
    const currentFilter = filterContainer.querySelector('.active').textContent.includes('Todos') ? 'all' : 'missing';
    if (activeTab) {
        const tabKey = activeTab.dataset.key;
        const tabs = {
            pelagens: { renderFunc: renderRareFursDetailView },
            diamantes: { renderFunc: renderDiamondsDetailView },
            super_raros: { renderFunc: renderSuperRareDetailView },
            hotspot: { renderFunc: () => renderHotspotDetailModal(reserveKey, slug) },
            greats: { renderFunc: renderGreatsDetailView }
        };
        const renderFunc = tabs[tabKey]?.renderFunc;
        if (renderFunc) {
            const dossierContent = document.querySelector('.dossier-content');
            renderFunc(dossierContent, animalName, slug, reserveKey, currentFilter);
        }
    }
}

function renderGreatsDetailView(container, animalName, slug, originReserveKey = null, filter = 'all') {
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
        const isCompleted = trophies.length > 0;
        if (filter === 'missing' && isCompleted) return;
        const furCard = document.createElement('div');
        furCard.className = `fur-card trophy-frame ${isCompleted ? 'completed' : 'incomplete'}`;
        const furSlug = slugify(furName);
        furCard.innerHTML = `
            <img src="animais/pelagens/great_${slug}_${furSlug}.png" alt="${furName}" onerror="this.onerror=null; this.src='animais/${slug}.png';">
            <div class="info-plaque"><div class="info">${furName}</div><div class="kill-counter"><i class="fas fa-trophy"></i> x${trophies.length}</div></div>
            <button class="fullscreen-btn" title="Ver em tela cheia">⛶</button>`;
        furCard.addEventListener('click', () => openGreatsTrophyModal(animalName, slug, furName, originReserveKey));
        furGrid.appendChild(furCard);
    });
    furGrid.querySelectorAll('.fullscreen-btn').forEach(btn => {
        btn.addEventListener('click', (event) => {
            event.stopPropagation();
            const imgSrc = btn.closest('.fur-card').querySelector('img').src;
            openImageViewer(imgSrc);
        });
    });
}

async function openGreatsTrophyModal(animalName, slug, furName, originReserveKey = null) {
    const modal = document.getElementById('form-modal');
    modal.innerHTML = '';
    modal.className = 'modal-overlay form-modal';

    const trophies = savedData.greats?.[slug]?.furs?.[furName]?.trophies || [];

    // Lógica de Salvar
    const handleSave = (newTrophyData) => {
        if (!savedData.greats) savedData.greats = {};
        if (!savedData.greats[slug]) savedData.greats[slug] = {};
        if (!savedData.greats[slug].furs) savedData.greats[slug].furs = {};
        if (!savedData.greats[slug].furs[furName]) savedData.greats[slug].furs[furName] = { trophies: [] };
        
        savedData.greats[slug].furs[furName].trophies.push(newTrophyData);
        checkAndSetGreatOneCompletion(slug, savedData.greats[slug]);
        saveData(savedData);
        closeModal('form-modal');
        
        // Atualiza a tela de fundo
        const activeDossierTab = document.querySelector('.dossier-tab.active');
        if (activeDossierTab) reRenderActiveDossierTab(originReserveKey, animalName, slug);
        else renderSimpleDetailView(animalName, 'greats');
    };

    // Lógica de Deletar
    const handleDelete = async (index) => {
        if (await showCustomAlert('Tem certeza que deseja remover este abate?', 'Confirmar Exclusão', true)) {
            trophies.splice(index, 1);
            saveData(savedData);
            closeModal('form-modal');
            
            // Atualiza a tela de fundo
            const activeDossierTab = document.querySelector('.dossier-tab.active');
            if (activeDossierTab) reRenderActiveDossierTab(originReserveKey, animalName, slug);
            else renderSimpleDetailView(animalName, 'greats');
        }
    };

    // Usa o novo componente
    const content = createGreatOneTrophyContent({
        animalName, furName, trophies,
        onSave: handleSave,
        onDelete: handleDelete,
        onCancel: () => closeModal('form-modal')
    });

    modal.appendChild(content);
    modal.style.display = 'flex';
}
// =================================================================
// =================== LÓGICA DE TELAS DE RECURSOS =================
// =================================================================

function openImageViewer(imageUrl) {
    const modal = document.getElementById('image-viewer-modal');
    modal.innerHTML = `
        <span class="modal-close">&times;</span>
        <img class="modal-content-viewer" src="${imageUrl}" alt="Imagem em tela cheia">
    `;
    modal.querySelector('.modal-close').addEventListener('click', () => closeModal('image-viewer-modal'));
    
    const modalImg = modal.querySelector('.modal-content-viewer');
    if (modalImg) {
        modalImg.style.maxWidth = '90%';
        modalImg.style.maxHeight = '90%';
        modalImg.style.objectFit = 'contain';
    }
    modal.style.display = "flex";
}

function renderSettingsView(container) {
    container.innerHTML = '';
    
    const panel = createSettingsPanel({
        onExport: exportUserData,
        onImport: importUserData,
        onReset: async () => {
            if (await showCustomAlert('Tem certeza que deseja apagar TODO o seu progresso? Esta ação não pode ser desfeita.', 'Resetar Progresso', true)) {
                if (currentUser) {
                    try {
                        const userDocRef = db.collection('usuarios').doc(currentUser.uid);
                        await userDocRef.set(getDefaultDataStructure());
                        await showCustomAlert('Seu progresso foi resetado com sucesso.', 'Progresso Resetado');
                        location.reload();
                    } catch (error) {
                        console.error("Erro ao resetar os dados:", error);
                        showCustomAlert('Ocorreu um erro ao tentar resetar seus dados.', 'Erro');
                    }
                } else {
                    showCustomAlert('Nenhum usuário logado para resetar os dados.', 'Erro');
                }
            }
        },
        onThemeToggle: () => {
            document.body.classList.toggle('light-theme');
            localStorage.setItem('theme', document.body.classList.contains('light-theme') ? 'light' : 'dark');
        }
    });

    container.appendChild(panel);
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
    container.appendChild(wrapper);
    showNewProgressPanel(); 
}

function updateNewProgressPanel(container) {
    container.innerHTML = '';
    const panel = document.createElement('div');
    panel.id = 'progress-panel-v3'; 

    // CORREÇÃO: Passando savedData
    const progress = calcularProgressoDetalhado(savedData);

    // --- SEÇÃO DE PROGRESSO GERAL ---
    panel.innerHTML = `<div class="progress-v2-header"><h3>Progresso Geral do Caçador</h3><p>Suas estatísticas de caça detalhadas.</p></div>`;
    const overallGrid = document.createElement('div');
    overallGrid.className = 'stats-card-grid';

    // Card de Pelagens Raras
    const raresCard = document.createElement('div');
    raresCard.className = 'stat-card rares';
    const raresPerc = progress.rares.total > 0 ? Math.round((progress.rares.collected / progress.rares.total) * 100) : 0;
    raresCard.innerHTML = `
        <div class="stat-card-header">
            <img src="icones/pata_icon.png" class="custom-icon">
            <h4>Pelagens Raras</h4>
            <div class="stat-card-total-perc">${raresPerc}%</div>
        </div>
        <div class="stat-card-body">
            <div class="stat-line main-stat">
                <span>Total de Pelagens:</span>
                <strong>${progress.rares.collected} / ${progress.rares.total}</strong>
            </div>
            <div class="stat-line">
                <span>Machos:</span>
                <span>${progress.rares.maleCollected} / ${progress.rares.maleTotal}</span>
            </div>
            <div class="stat-line">
                <span>Fêmeas:</span>
                <span>${progress.rares.femaleCollected} / ${progress.rares.femaleTotal}</span>
            </div>
        </div>
        <div class="stat-card-footer">
            <span>${progress.rares.speciesCollected} de ${progress.rares.speciesTotal} espécies 100% completas</span>
        </div>
    `;
    overallGrid.appendChild(raresCard);

    // Card de Diamantes
    const diamondsCard = document.createElement('div');
    diamondsCard.className = 'stat-card diamonds';
    const diamondsPerc = progress.diamonds.total > 0 ? Math.round((progress.diamonds.collected / progress.diamonds.total) * 100) : 0;
    diamondsCard.innerHTML = `
        <div class="stat-card-header">
            <img src="icones/diamante_icon.png" class="custom-icon">
            <h4>Diamantes</h4>
            <div class="stat-card-total-perc">${diamondsPerc}%</div>
        </div>
        <div class="stat-card-body">
            <div class="stat-line main-stat">
                <span>Total de Variações:</span>
                <strong>${progress.diamonds.collected} / ${progress.diamonds.total}</strong>
            </div>
            <div class="stat-line">
                <span>(Contando cada pelagem possível)</span>
            </div>
        </div>
        <div class="stat-card-footer">
            <span>${progress.diamonds.speciesCollected} de ${progress.diamonds.speciesTotal} espécies com 💎</span>
        </div>
    `;
    overallGrid.appendChild(diamondsCard);

    // Card de Great Ones
    const greatsCard = document.createElement('div');
    greatsCard.className = 'stat-card greats';
    const greatsPerc = progress.greats.total > 0 ? Math.round((progress.greats.collected / progress.greats.total) * 100) : 0;
    let greatDetailHTML = '';
    for (const animal in progress.greats.byAnimal) {
        const data = progress.greats.byAnimal[animal];
        greatDetailHTML += `<div class="stat-line"><span>${animal}:</span> <span>${data.collected} / ${data.total}</span></div>`;
    }
    greatsCard.innerHTML = `
        <div class="stat-card-header">
            <img src="icones/greatone_icon.png" class="custom-icon">
            <h4>Great Ones</h4>
            <div class="stat-card-total-perc">${greatsPerc}%</div>
        </div>
        <div class="stat-card-body">
            <div class="stat-line main-stat">
                <span>Total de Pelagens:</span>
                <strong>${progress.greats.collected} / ${progress.greats.total}</strong>
            </div>
            ${greatDetailHTML}
        </div>
    `;
    overallGrid.appendChild(greatsCard);

    // Card de Super Raros
    const superRaresCard = document.createElement('div');
    superRaresCard.className = 'stat-card super-raros';
    const srPerc = progress.super_raros.total > 0 ? Math.round((progress.super_raros.collected / progress.super_raros.total) * 100) : 0;
    superRaresCard.innerHTML = `
        <div class="stat-card-header">
            <img src="icones/coroa_icon.png" class="custom-icon">
            <h4>Super Raros</h4>
            <div class="stat-card-total-perc">${srPerc}%</div>
        </div>
        <div class="stat-card-body">
            <div class="stat-line main-stat">
                <span>Total de Variações:</span>
                <strong>${progress.super_raros.collected} / ${progress.super_raros.total}</strong>
            </div>
            <div class="stat-line">
                <span>(Pelagens Raras em animais Diamante)</span>
            </div>
        </div>
    `;
    overallGrid.appendChild(superRaresCard);

    panel.appendChild(overallGrid);

    // --- SEÇÃO DE DOMÍNIO DAS RESERVAS ---
    const reservesSection = document.createElement('div');
    reservesSection.innerHTML = `<div class="progress-v2-header"><h3>Domínio das Reservas</h3><p>Seu progresso detalhado em cada território de caça.</p></div>`;
    const reservesCardsContainer = document.createElement('div');
    reservesCardsContainer.className = 'reserves-cards-container';
    
    // --- SEÇÃO DE DOMÍNIO DAS RESERVAS (NOVA LÓGICA) ---
    Object.entries(reservesData).sort(([, a], [, b]) => a.name.localeCompare(b.name)).forEach(([reserveKey, reserve]) => {
        const reserveProgress = calcularReserveProgress(reserveKey, savedData);
        
        // Usa o componente novo (toda a lógica de clique e visual está dentro dele)
        const card = createReserveProgressCard(
            reserve, 
            reserveProgress, 
            () => showReserveDetailView(reserveKey, 'progresso'), // Ação do botão Detalhes
            () => renderHotspotGalleryView(document.querySelector('.reserve-view-area') || container, reserveKey) // Ação do botão Mapa
        );

        reservesCardsContainer.appendChild(card);
    });

    reservesSection.appendChild(reservesCardsContainer);
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

    // 1. Coleta Diamantes
    if(savedData.diamantes) {
        Object.entries(savedData.diamantes).forEach(([slug, trophies]) => {
            const animalName = items.find(i => slugify(i) === slug) || slug;
            trophies.forEach(trophy => allTrophies.push({ id: trophy.id, animalName, furName: trophy.type, slug, type: 'diamante' }));
        });
    }

    // 2. Coleta Great Ones
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

    // 3. Renderiza os Top 4 mais recentes
    if (allTrophies.length === 0) {
        grid.innerHTML = '<p style="color: var(--text-color-muted); grid-column: 1 / -1;">Nenhum troféu de destaque registrado ainda.</p>';
    } else {
        allTrophies.sort((a, b) => b.id - a.id).slice(0, 4).forEach(trophy => {
            // USA O NOVO COMPONENTE AQUI
            const card = createAchievementCard(trophy);
            grid.appendChild(card);
        });
    }
    
    panel.appendChild(grid);
    return panel;
}

// Obtém o inventário completo de troféus para montagens múltiplas
// NOTA: Esta função pode ser movida para progressLogic.js futuramente, mas mantemos aqui para evitar quebras imediatas
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

// Verifica os requisitos de uma montagem múltipla
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

/// Renderiza a visualização de montagens múltiplas (VERSÃO NOVA)
function renderMultiMountsView(container) {
    container.innerHTML = '';
    const grid = document.createElement('div');
    grid.className = 'mounts-grid';
    container.appendChild(grid);

    const sortedMounts = Object.entries(multiMountsData).sort((a, b) => a[1].name.localeCompare(b[1].name));

    if (sortedMounts.length === 0) {
        grid.innerHTML = `<div class="empty-state-container"><i class="fas fa-trophy empty-state-icon"></i><h3 class="empty-state-title">Nenhuma Montagem Disponível</h3><p class="empty-state-message">Os dados das montagens múltiplas não foram carregados.</p></div>`;
        return;
    }

    sortedMounts.forEach(([mountKey, mount]) => {
        // 1. Calcula o status
        const status = checkMountRequirements(mount.animals);
        
        // 2. Cria o card visual usando o componente novo
        const card = createMultiMountCard(mount, status, () => renderMultiMountDetailModal(mountKey));
        
        grid.appendChild(card);
    });
}

// Renderiza o modal de detalhes de montagens múltiplas
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
                <i class="fas ${genderIcon}"></i><span>${animalName} (${req.gender})</span>
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


// =================================================================
// ==================== LÓGICA DO CONTADOR DE GRIND ================
// =================================================================

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
    if (savedData.grindSessions && savedData.grindSessions.length > 0) {
        const grindsByReserve = savedData.grindSessions.reduce((acc, session) => {
            const key = session.reserveKey;
            if (!acc[key]) acc[key] = [];
            acc[key].push(session);
            return acc;
        }, {});
        const sortedReserveKeys = Object.keys(grindsByReserve).sort((a, b) => (reservesData[a]?.name || '').localeCompare(reservesData[b]?.name || ''));
        sortedReserveKeys.forEach(reserveKey => {
            const reserveSessions = grindsByReserve[reserveKey];
            const reserve = reservesData[reserveKey];
            const reserveGroup = document.createElement('div');
            reserveGroup.className = 'grind-reserve-group';
            const reserveTitle = document.createElement('h4');
            reserveTitle.className = 'grind-reserve-title';
            reserveTitle.innerHTML = `<i class="fas fa-map-marked-alt"></i> ${reserve.name}`;
            reserveGroup.appendChild(reserveTitle);
            const grid = document.createElement('div');
            grid.className = 'grinds-grid';
           reserveSessions.forEach(session => {
                const animalName = items.find(item => slugify(item) === session.animalSlug);
                
                // Usa o novo componente, muito mais limpo!
                const card = createGrindCard(session, animalName, () => renderGrindCounterView(session.id));
                
                grid.appendChild(card);
            });
            reserveGroup.appendChild(grid);
            hubContainer.appendChild(reserveGroup);
        });
    } else {
        const emptyStateContainer = document.createElement('div');
        emptyStateContainer.innerHTML = `<div class="empty-state-container"><i class="fas fa-crosshairs empty-state-icon"></i><h3 class="empty-state-title">Nenhum Grind Iniciado</h3><p class="empty-state-message">O Contador de Grind ajuda a rastrear seus abates, diamantes e raros enquanto você caça um troféu específico. Crie seu primeiro grind agora!</p><button class="empty-state-cta">Começar meu primeiro Grind</button></div>`;
        emptyStateContainer.querySelector('.empty-state-cta').addEventListener('click', () => renderNewGrindAnimalSelection(container));
        hubContainer.appendChild(emptyStateContainer);
    }
}

function renderNewGrindAnimalSelection(container) {
    const mainContent = container.closest('.main-content');
    const header = mainContent.querySelector('.page-header h2');
    const backButton = mainContent.querySelector('.page-header .back-button');

    header.textContent = 'Selecione um Animal para o Grind';
    backButton.innerHTML = '&larr; Voltar para o Hub de Grind';
    backButton.onclick = () => renderMainView('grind');

    container.innerHTML = ''; 

    const filterInput = document.createElement('input');
    filterInput.type = 'text';
    filterInput.className = 'filter-input';
    filterInput.placeholder = 'Buscar animal...';
    container.appendChild(filterInput);

    const grid = document.createElement('div');
    grid.className = 'album-grid';
    container.appendChild(grid);

    // Filtra apenas animais que têm Hotspots (mapas)
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

    grindableAnimals.sort().forEach(animalName => {
        const slug = slugify(animalName);
        
        // 1. REUTILIZAÇÃO: Usa o componente padrão (já vem com loading="lazy")
        const card = createCardElement(animalName);
        
        // 2. LÓGICA ESPECÍFICA: Ao clicar, vai para a seleção de reserva (não para detalhes)
        card.addEventListener('click', () => renderReserveSelectionForGrind(container, slug));
        
        grid.appendChild(card);
    });

    // 3. PERFORMANCE: Aplica o Debounce na busca
    const filterAnimals = () => {
        const searchTerm = filterInput.value.toLowerCase();
        grid.querySelectorAll('.animal-card').forEach(card => {
            const name = card.querySelector('.info').textContent.toLowerCase();
            card.style.display = name.includes(searchTerm) ? 'flex' : 'none';
        });
    };
    
    filterInput.addEventListener('input', debounce(filterAnimals, 300));
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
                counts: {
                    total: 0,
                    diamonds: [],
                    rares: [],
                    super_raros: [],
                    trolls: [],
                    great_ones: []
                },
                zones: [] 
            };

            if (!savedData.grindSessions) {
                savedData.grindSessions = [];
            }
            savedData.grindSessions.push(newSession);
            saveData(savedData);
            await showCustomAlert(`Grind de ${animalName} em ${reserve.name} iniciado com sucesso!`, 'Grind Iniciado');
            renderGrindCounterView(newSession.id);
        });
        grid.appendChild(card);
    });
}

// Renderiza a tela principal do Contador de Grind
async function renderGrindCounterView(sessionId, isZonesOpenState = false) {
    const session = savedData.grindSessions.find(s => s.id === sessionId);
    if (!session) return renderMainView('grind');

    // Inicializa dados se não existirem
    if (!session.counts) session.counts = { total: 0, rares: [], diamonds: [], trolls: [], great_ones: [], super_raros: [] };
    if (!session.zones) session.zones = []; 

    const { animalSlug, reserveKey } = session;
    const animalName = items.find(item => slugify(item) === animalSlug);
    const reserveName = reservesData[reserveKey].name;
    const hotspotInfo = animalHotspotData[reserveKey]?.[animalSlug] || {};
    
    const mainContent = document.querySelector('.main-content');
    const container = mainContent.querySelector('.content-container');
    mainContent.querySelector('.page-header h2').textContent = `Contador de Grind`;
    
    // Configura botão voltar
    const backButton = mainContent.querySelector('.page-header .back-button');
    backButton.innerHTML = `&larr; Voltar para o Hub de Grind`;
    backButton.onclick = () => renderMainView('grind');

    // Limpa e prepara o container
    container.innerHTML = '';
    
    // 1. Renderiza o Cabeçalho (Header)
    const headerHTML = `
        <div class="grind-header">
            <div class="grind-header-info"><h2>${animalName.toUpperCase()}</h2><span><i class="fas fa-map-marker-alt"></i> Em ${reserveName}</span></div>
            <div class="grind-header-details">
                <div class="detail-item"><i class="fas fa-trophy"></i><strong>Pont. Troféu:</strong><span>${hotspotInfo.maxScore || 'N/A'}</span></div>
                <div class="detail-item"><i class="fas fa-weight-hanging"></i><strong>Peso Máx:</strong><span>${hotspotInfo.maxWeightEstimate || 'N/A'}</span></div>
                <div class="detail-item"><i class="fas fa-clock"></i><strong>Bebida:</strong><span>${hotspotInfo.drinkZonesPotential || 'N/A'}</span></div>
                <div class="detail-item"><i class="fas fa-crosshairs"></i><strong>Classe:</strong><span>${hotspotInfo.animalClass || 'N/A'}</span></div>
                <div class="detail-item"><i class="fas fa-star"></i><strong>Nível Máx:</strong><span>${hotspotInfo.maxLevel || 'N/A'}</span></div>
                <div class="detail-item"><button class="hotspot-button"><i class="fas fa-map-marked-alt"></i> Ver Mapa</button></div>
            </div>
        </div>`;
    container.insertAdjacentHTML('beforeend', headerHTML);
    container.querySelector('.hotspot-button').addEventListener('click', () => renderHotspotDetailModal(reserveKey, animalSlug));

    const grindContainer = document.createElement('div');
    grindContainer.className = 'grind-container';
    
    // 2. Renderiza os Contadores usando o NOVO COMPONENTE
    const countersWrapper = document.createElement('div');
    countersWrapper.className = 'counters-wrapper';

    // Helper para lógica de adicionar troféu detalhado
    const handleIncrease = async (type, isDetailed) => {
        session.counts.total++;
        if (isDetailed) {
            openGrindDetailModal(sessionId, type, session.counts.total);
        } else {
            session.counts[type].push({ id: Date.now(), killCount: session.counts.total });
            saveData(savedData);
            renderGrindCounterView(sessionId, isZonesOpenState);
        }
        // Se for apenas abates, já salva no input change, mas aqui garante atualização visual se precisar
        if (type === 'total') saveData(savedData); 
    };

    // Helper para lógica de remover último troféu
    const handleDecrease = async (type) => {
        if (type === 'total') {
            if (session.counts.total > 0) {
                session.counts.total--;
                saveData(savedData);
                renderGrindCounterView(sessionId, isZonesOpenState);
            }
            return;
        }
        if (session.counts[type].length > 0) {
            const lastItem = session.counts[type][session.counts[type].length - 1];
            const itemName = lastItem.variation || type.replace(/_s$/, '').replace('_', ' ');
            if (await showCustomAlert(`Remover o último item: "${itemName}"?`, 'Confirmar', true)) {
                session.counts[type].pop();
                saveData(savedData);
                renderGrindCounterView(sessionId, isZonesOpenState);
            }
        }
    };

    // Lista de configurações dos contadores
    const countersConfig = [
        { label: 'Total de Abates', icon: 'icones/caveira_icon.png', value: session.counts.total, type: 'total-kills', isInput: true, 
          onInput: (val) => { session.counts.total = parseInt(val) || 0; saveData(savedData); } },
        { label: 'Diamantes', icon: 'icones/diamante_icon.png', value: session.counts.diamonds?.length || 0, type: 'diamond', dataKey: 'diamonds' },
        { label: 'Raros', icon: 'icones/pata_icon.png', value: session.counts.rares?.length || 0, type: 'rare', dataKey: 'rares', detailed: true },
        { label: 'Trolls', icon: 'icones/fantasma_icon.png', value: session.counts.trolls?.length || 0, type: 'troll', dataKey: 'trolls' },
        { label: 'Great One', icon: 'icones/greatone_icon.png', value: session.counts.great_ones?.length || 0, type: 'great-one', dataKey: 'great_ones', detailed: true },
        { label: 'Super Raros', icon: 'icones/coroa_icon.png', value: session.counts.super_raros?.length || 0, type: 'super-rare', dataKey: 'super_raros', detailed: true }
    ];

    countersConfig.forEach(cfg => {
        const card = createGrindCounter({
            label: cfg.label,
            icon: cfg.icon,
            value: cfg.value,
            type: cfg.type,
            isInput: cfg.isInput,
            onIncrease: () => handleIncrease(cfg.dataKey || 'total', cfg.detailed),
            onDecrease: () => handleDecrease(cfg.dataKey || 'total'),
            onInput: cfg.onInput
        });
        countersWrapper.appendChild(card);
    });

    grindContainer.appendChild(countersWrapper);
    
    // 3. Renderiza o Gerenciador de Zonas (Função separada agora!)
    renderZoneManager(grindContainer, session, isZonesOpenState);

    // Botão de Excluir Grind
    const deleteBtn = document.createElement('button');
    deleteBtn.id = 'delete-grind-btn';
    deleteBtn.className = 'back-button';
    deleteBtn.textContent = 'Excluir este Grind';
    deleteBtn.onclick = async () => { 
        const isZonesOpen = grindContainer.querySelector('details')?.open; 
        if (await showCustomAlert(`Tem certeza que deseja excluir o grind de ${animalName}?`, 'Excluir Grind', true)) { 
            const idx = savedData.grindSessions.findIndex(s => s.id === sessionId); 
            if (idx > -1) { 
                savedData.grindSessions.splice(idx, 1); 
                saveData(savedData); 
                renderMainView('grind'); 
            } 
        } 
    };
    grindContainer.appendChild(deleteBtn);

    container.appendChild(grindContainer);
}

// Função Separada para Gerenciar Zonas (Limpeza de código!)
function renderZoneManager(container, session, isOpen) {
    const wrapper = document.createElement('div');
    wrapper.className = 'zone-manager-container';
    
    wrapper.innerHTML = `
        <details ${isOpen ? 'open' : ''}>
            <summary class="zone-manager-header">
                <h3><i class="fas fa-map-pin"></i> Gerenciador de Zonas de Grind</h3>
                <span class="zone-count-badge">${session.zones.length} Zonas</span>
            </summary>
            <div class="zone-manager-body">
                <div class="add-zone-form">
                    <select id="zone-type-select"><option value="principal">Zona Principal</option><option value="secundaria">Zona Secundária</option><option value="solo">Zona Solo</option></select>
                    <input type="text" id="zone-name-input" placeholder="Nome (Ex: Lago 1)">
                    <button id="add-zone-btn" class="back-button"><i class="fas fa-plus"></i> Adicionar Zona</button>
                </div>
                <div id="zone-list" class="zone-list"></div>
            </div>
        </details>
    `;

    const zoneListContainer = wrapper.querySelector('#zone-list');
    
    // Lógica de Renderizar Lista de Zonas
    const renderList = () => {
        zoneListContainer.innerHTML = '';
        if (session.zones.length === 0) {
            zoneListContainer.innerHTML = '<p class="no-zones-message">Nenhuma zona adicionada.</p>';
            return;
        }
        
        session.zones.map((z, i) => ({...z, idx: i})).sort((a, b) => a.name.localeCompare(b.name, undefined, { numeric: true }))
        .forEach(zone => {
            const el = document.createElement('div');
            el.className = `zone-card zone-type-${zone.type}`;
            
            let animalsHTML = '<div class="zone-animal-list">';
            if (zone.animals && zone.animals.length > 0) {
                zone.animals.forEach((animal, aIdx) => {
                    animalsHTML += `<div class="zone-animal-item"><span>Nv ${animal.level} (${animal.gender === 'macho'?'M':'F'})</span><div class="animal-quantity-controls"><button class="qty-btn dec" data-z="${zone.idx}" data-a="${aIdx}">-</button><span>${animal.quantity}</span><button class="qty-btn inc" data-z="${zone.idx}" data-a="${aIdx}">+</button></div></div>`;
                });
            } else { animalsHTML += '<small>Sem animais.</small>'; }
            animalsHTML += '</div>';

            el.innerHTML = `
                <div class="zone-card-header">
                    <h4>${zone.name}</h4>
                    <div class="zone-card-controls"><span class="zone-type-badge">${zone.type}</span><button class="zone-action-btn edit" data-idx="${zone.idx}"><i class="fas fa-pencil-alt"></i></button><button class="zone-action-btn del" data-idx="${zone.idx}">&times;</button></div>
                </div>
                ${animalsHTML}
                <div class="add-animal-form"><input type="number" class="lvl-in" placeholder="Nv"><select class="gnd-sel"><option value="macho">M</option><option value="femea">F</option></select><button class="add-ani-btn" data-idx="${zone.idx}">Add</button></div>
            `;
            zoneListContainer.appendChild(el);
        });
    };

    // Eventos da Zona
    wrapper.querySelector('#add-zone-btn').onclick = () => {
        const name = wrapper.querySelector('#zone-name-input').value.trim();
        const type = wrapper.querySelector('#zone-type-select').value;
        if (!name) return showCustomAlert('Nome inválido', 'Erro');
        session.zones.push({ id: Date.now(), name, type, animals: [] });
        saveData(savedData);
        renderGrindCounterView(session.id, true); // Recarrega mantendo aberto
    };

    zoneListContainer.onclick = (e) => {
        const t = e.target;
        const btn = t.closest('button');
        if (!btn) return;
        
        const zIdx = parseInt(btn.dataset.idx || btn.dataset.z);
        const aIdx = parseInt(btn.dataset.a);

        if (btn.classList.contains('del')) {
            session.zones.splice(zIdx, 1);
            saveData(savedData);
            renderGrindCounterView(session.id, true);
        } else if (btn.classList.contains('edit')) {
            const newName = prompt('Novo nome:', session.zones[zIdx].name);
            if (newName) { session.zones[zIdx].name = newName; saveData(savedData); renderGrindCounterView(session.id, true); }
        } else if (btn.classList.contains('add-ani-btn')) {
            const card = btn.closest('.zone-card');
            const lvl = parseInt(card.querySelector('.lvl-in').value);
            const gen = card.querySelector('.gnd-sel').value;
            if (!lvl) return;
            const existing = session.zones[zIdx].animals.find(a => a.level === lvl && a.gender === gen);
            if (existing) existing.quantity++;
            else session.zones[zIdx].animals.push({ level: lvl, gender: gen, quantity: 1 });
            saveData(savedData);
            renderGrindCounterView(session.id, true);
        } else if (btn.classList.contains('inc')) {
            session.zones[zIdx].animals[aIdx].quantity++;
            saveData(savedData);
            renderGrindCounterView(session.id, true);
        } else if (btn.classList.contains('dec')) {
            session.zones[zIdx].animals[aIdx].quantity--;
            if (session.zones[zIdx].animals[aIdx].quantity <= 0) session.zones[zIdx].animals.splice(aIdx, 1);
            saveData(savedData);
            renderGrindCounterView(session.id, true);
        }
    };

    renderList();
    container.appendChild(wrapper);
}

function openGrindDetailModal(sessionId, type, killCount) {
    const session = savedData.grindSessions.find(s => s.id === sessionId);
    if (!session) return;

    const { animalSlug } = session;
    const animalName = items.find(item => slugify(item) === animalSlug);
    let potentialFurs = [];
    let title = '';

    // Prepara os dados (Mantivemos a lógica aqui, só tiramos o visual)
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
    modal.innerHTML = ''; // Limpa
    modal.className = 'modal-overlay form-modal';

    // Usa o novo componente
    const content = createGrindFurSelectionContent({
        title, animalName, animalSlug,
        furs: potentialFurs,
        onCancel: () => closeModal('form-modal'),
        onSelect: (displayName) => {
            // Lógica de Salvar Seleção
            session.counts[type].push({ id: Date.now(), killCount: killCount, variation: displayName });

            const collectionKey = (type === 'great_ones') ? 'greats' : type;
            if (collectionKey === 'greats') {
                if (!savedData.greats[animalSlug]) savedData.greats[animalSlug] = { furs: {} };
                if (!savedData.greats[animalSlug].furs[displayName]) savedData.greats[animalSlug].furs[displayName] = { trophies: [] };
                savedData.greats[animalSlug].furs[displayName].trophies.push({ date: new Date().toISOString() });
            } else {
                if (!savedData[collectionKey]) savedData[collectionKey] = {};
                if (!savedData[collectionKey][animalSlug]) savedData[collectionKey][animalSlug] = {};
                savedData[collectionKey][animalSlug][displayName] = true;
            }

            saveData(savedData);
            closeModal('form-modal');
            renderGrindCounterView(sessionId);
        }
    });

    modal.appendChild(content);
    modal.style.display = 'flex';
}

function exportUserData() {
    if (!currentUser) {
        showCustomAlert('Você precisa estar logado para fazer o backup.', 'Aviso');
        return;
    }
    
    const dataStr = JSON.stringify(savedData, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);

    const a = document.createElement('a');
    a.href = url;
    const date = new Date().toISOString().split('T')[0];
    a.download = `backup_registro_cacador_${date}.json`;
    
    document.body.appendChild(a);
    a.click();
    
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    showCustomAlert('Backup gerado com sucesso!', 'Backup Concluído');
}

async function importUserData(event) {
    if (!currentUser) {
        showCustomAlert('Você precisa estar logado para restaurar um backup.', 'Aviso');
        return;
    }
    
    const file = event.target.files[0];
    if (!file) return;

    if (file.type !== 'application/json') {
        showCustomAlert('Por favor, selecione um arquivo de backup .json válido.', 'Arquivo Inválido');
        event.target.value = '';
        return;
    }

    if (!await showCustomAlert(
        'Restaurar este backup substituirá TODOS os seus dados atuais. Esta ação não pode ser desfeita. Deseja continuar?',
        'Atenção: Restaurar Backup',
        true
    )) {
        event.target.value = '';
        return;
    }

    const reader = new FileReader();
    reader.onload = async (e) => {
        try {
            const importedData = JSON.parse(e.target.result);
            let newData = getDefaultDataStructure();

            // --- LÓGICA FINAL DE MIGRAÇÃO E LIMPEZA ---

            if (!importedData || typeof importedData !== 'object') {
                throw new Error("Formato de backup inválido.");
            }

            console.log("Iniciando processo de restauração, limpeza e migração de backup...");

            // 1. Migração de Pelagens Raras com LIMPEZA
            if (importedData.pelagens && typeof importedData.pelagens === 'object') {
                for (const slug in importedData.pelagens) {
                    const furs = importedData.pelagens[slug];
                    if (typeof furs === 'object' && furs !== null) { 
                        newData.pelagens[slug] = {};
                        for (const furName in furs) {
                            if (furs[furName] === true) {
                                newData.pelagens[slug][furName] = true;
                            }
                        }
                    }
                }
            }

            // 2. Migração de Diamantes
            if (importedData.diamantes && typeof importedData.diamantes === 'object') {
                const firstAnimalData = Object.values(importedData.diamantes)[0];
                if (firstAnimalData && !Array.isArray(firstAnimalData)) { 
                     console.log("Detectado formato antigo de Diamantes. Convertendo...");
                     for (const slug in importedData.diamantes) {
                         const count = importedData.diamantes[slug];
                         newData.diamantes[slug] = [];
                         if (typeof count === 'number') {
                            for (let i = 0; i < count; i++) {
                                newData.diamantes[slug].push({ id: Date.now() + i, type: 'Pelagem de Legado', score: 'N/A' });
                            }
                         }
                     }
                } else { 
                    newData.diamantes = importedData.diamantes;
                }
            }
            
            // 3. Migração de Greats e Super Raros
            if (importedData.greats) newData.greats = importedData.greats;
            if (importedData.super_raros) newData.super_raros = importedData.super_raros;
            if (importedData.customMarkers) newData.customMarkers = importedData.customMarkers;

            // 4. Migração de Grind Sessions
            if (Array.isArray(importedData.grindSessions)) {
                newData.grindSessions = importedData.grindSessions.map(session => {
                    const newCounts = { total: session.counts.total || 0, rares: [], diamonds: [], trolls: [], great_ones: [], super_raros: [] };
                    for(const key in session.counts){
                        if(Array.isArray(session.counts[key])){
                            newCounts[key] = session.counts[key];
                        } else if (typeof session.counts[key] === 'number' && key !== 'total'){
                            newCounts[key] = Array(session.counts[key]).fill({ id: Date.now(), killCount: 'antigo' });
                        }
                    }
                    return { ...session, counts: newCounts, zones: session.zones || [] };
                });
            }

            // --- FIM DA LÓGICA DE MIGRAÇÃO ---

            savedData = newData;
            saveData(savedData);
            
            await showCustomAlert('Backup restaurado e atualizado com sucesso! O aplicativo será recarregado.', 'Restauração Concluída');
            location.reload();

        } catch (error) {
            console.error("Erro ao processar o arquivo JSON:", error);
            showCustomAlert('Ocorreu um erro ao ler o arquivo de backup. Verifique se ele não está corrompido ou em um formato inesperado.', 'Erro de Importação');
        } finally {
            event.target.value = '';
        }
    };

    reader.onerror = () => {
        showCustomAlert('Não foi possível ler o arquivo selecionado.', 'Erro de Leitura');
        event.target.value = '';
    };

    reader.readAsText(file);
}

// =================================================================
// ==================== INICIALIZAÇÃO DO APP =======================
// =================================================================

document.addEventListener('DOMContentLoaded', () => {
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme === 'light') {
        document.body.classList.add('light-theme');
    }
    setRandomBackground();
    const backgroundOverlay = document.createElement('div');
    backgroundOverlay.className = 'background-overlay';
    document.body.appendChild(backgroundOverlay);
    appContainer = document.getElementById('app-container');
    auth.onAuthStateChanged(async (user) => {
        if (user) {
            currentUser = user;
            renderSkeletonLoader();
            savedData = await loadDataFromFirestore();
            renderNavigationHub();
        } else {
            currentUser = null;
            renderLoginForm(appContainer);
        }
    });
    ['image-viewer-modal', 'form-modal', 'custom-alert-modal'].forEach(id => {
        const modal = document.getElementById(id);
        if (modal) {
            modal.addEventListener('click', e => {
                if (e.target === modal) closeModal(id);
            });
            const closeBtn = modal.querySelector('.modal-close');
            if(closeBtn) closeBtn.addEventListener('click', () => closeModal(id));
        }
    });
    window.addEventListener('keydown', (event) => {
        if (event.key === 'Escape') {
            ['image-viewer-modal', 'form-modal', 'custom-alert-modal'].forEach(id => closeModal(id));
        }
    });
    const backToTopButton = document.createElement('button');
    backToTopButton.id = 'back-to-top-btn';
    backToTopButton.innerHTML = '<i class="fas fa-arrow-up"></i>';
    document.body.appendChild(backToTopButton);
    window.addEventListener('scroll', () => {
        if (window.scrollY > 300) {
            backToTopButton.classList.add('show');
        } else {
            backToTopButton.classList.remove('show');
        }
    });
    backToTopButton.addEventListener('click', () => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
    });

    // Roda a verificação de erros no Console (Apenas para desenvolvimento)
    runDataValidation();
});