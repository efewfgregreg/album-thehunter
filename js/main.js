// Arquivo: js/main.js

// =================================================================
// ========================== MÓDULOS ==============================
// =================================================================
import { renderLoginForm, renderRegisterForm, setupLogoutButton, closeModal, showCustomAlert } from './auth.js';
import { rareFursData, greatsFursData, items, diamondFursData, reservesData, animalHotspotData, multiMountsData } from '../data/gameData.js';
import { auth, db } from './firebase.js';
import { runDataValidation } from './dataValidator.js';
// Adicione esta linha junto com os outros imports no topo
import { slugify, showToast, setRandomBackground, isTimeInRanges, debounce, createSafeImgTag } from './utils.js';
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
import { renderZoneManager } from './components/ZoneManager.js';
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
let tabScrollPositions = {}; 
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
    // Dados padrão para começar
    let finalData = getDefaultDataStructure();
    let localData = null;

    // 1. Tenta pegar o Backup Local primeiro (para garantir)
    try {
        const localStr = localStorage.getItem('hunter_backup_local');
        if (localStr) {
            localData = JSON.parse(localStr);
        }
    } catch(e) { console.log("Sem backup local legível"); }

    if (!currentUser) {
        // Se não tem usuário logado, mas tem dados locais, usa eles (Modo Offline)
        if (localData) return { ...finalData, ...localData };
        return finalData;
    }

    const userDocRef = db.collection('usuarios').doc(currentUser.uid);

    try {
        // 2. Tenta pegar da Nuvem (Firebase)
        const doc = await userDocRef.get();
        
        if (doc.exists) {
            console.log("Dados carregados do Firestore!");
            const cloudData = doc.data();
            
            // Lógica de Segurança: Se a nuvem estiver vazia mas você tiver backup local,
            // (ex: erro de sincronização anterior), preferimos o local para não zerar seu progresso.
            if (Object.keys(cloudData).length < 3 && localData && Object.keys(localData).length > 5) {
                 console.warn("Nuvem parece vazia, recuperando do Local Storage.");
                 finalData = { ...finalData, ...localData };
                 // Atualiza a nuvem com o backup local
                 saveData(finalData);
            } else {
                 finalData = { ...finalData, ...cloudData };
            }
        } else {
            console.log("Novo usuário ou banco resetado.");
            if (localData) {
                console.log("Recuperando backup local para nova conta.");
                finalData = { ...finalData, ...localData };
                saveData(finalData); // Sobe pro Firebase
            } else {
                await userDocRef.set(finalData);
            }
        }
    } catch (error) {
        console.error("Erro ao carregar do Firestore (Sem internet?):", error);
        // 3. Se der erro na nuvem (Net caiu), usa o Backup Local
        if (localData) {
            showToast("⚠️ Modo Offline: Usando dados salvos no dispositivo.");
            finalData = { ...finalData, ...localData };
        }
    }

    return finalData;
}

function saveData(data) {
    // 1. Atualiza a variável global imediatamente
    savedData = data;

    // 2. BACKUP LOCAL DE SEGURANÇA (Isso resolve seu problema de tempo ocioso)
    // Salva no navegador instantaneamente. Se a net cair, isso te salva.
    try {
        localStorage.setItem('hunter_backup_local', JSON.stringify(data));
        // Marcamos a hora que salvou
        localStorage.setItem('hunter_backup_time', Date.now());
    } catch (e) {
        console.warn("Aviso: Não foi possível salvar backup local (Memória cheia?)", e);
    }

    // 3. Salvamento na Nuvem (Firebase)
    if (currentUser) {
        const userDocRef = db.collection('usuarios').doc(currentUser.uid);
        
        userDocRef.set(data, { merge: true })
            .then(() => {
                showToast("Progresso salvo!"); 
            })
            .catch((error) => {
                console.error("Erro no Firebase (mas salvo localmente): ", error);
                // Avisa o usuário que deu erro na nuvem, mas o local garantiu
                showToast("⚠️ Nuvem instável. Salvo no dispositivo.");
            });
    }

    // 4. Atualiza a Interface (Mantido do seu código original)
    if (document.getElementById('progress-panel-main-container')) {
        const contentArea = document.getElementById('progress-content-area');
        if (contentArea) {
             if (document.querySelector('.ranking-table')) {
                 // Se tiver a função de ranking importada, chame-a aqui, senão ignore
                 if(typeof renderHuntingRankingView === 'function') renderHuntingRankingView(contentArea);
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

// =================================================================
// --- NOVA FUNÇÃO: Renderiza a visualização padrão (Filtros + Grade) ---
// =================================================================
function renderStandardCategoryView(container, tabKey, currentTab) {
    // 1. Cria container de filtros
    const filtersContainer = document.createElement('div');
    filtersContainer.className = 'filters-container';
    
    // 2. Busca por Nome
    const filterInput = document.createElement('input');
    filterInput.type = 'text';
    filterInput.className = 'filter-input';
    filterInput.placeholder = 'Buscar animal...';
    filtersContainer.appendChild(filterInput);

    // Prepara dados para os selects (importados de progressLogic.js e gameData.js)
    const { classes, levels } = getUniqueAnimalData(); 
    const sortedReserves = Object.entries(reservesData).sort(([, a], [, b]) => a.name.localeCompare(b.name));

    // 3. Filtro de Classe
    const classSelect = document.createElement('select');
    classSelect.innerHTML = `<option value="">Classe (Todas)</option>` + classes.map(c => `<option value="${c}">Classe ${c}</option>`).join('');
    filtersContainer.appendChild(classSelect);

    // 4. Filtro de Dificuldade
    const levelSelect = document.createElement('select');
    levelSelect.innerHTML = `<option value="">Dificuldade (Todas)</option>` + levels.map(l => `<option value="${l}">${l}</option>`).join('');
    filtersContainer.appendChild(levelSelect);

    // 5. Filtro de Reserva
    const reserveSelect = document.createElement('select');
    reserveSelect.innerHTML = `<option value="">Reserva (Todas)</option>` + sortedReserves.map(([key, data]) => `<option value="${key}">${data.name}</option>`).join('');
    filtersContainer.appendChild(reserveSelect);

    // 6. Filtro de Horário
    const timeInput = document.createElement('input');
    timeInput.type = 'time';
    timeInput.className = 'filter-input';
    timeInput.style.minWidth = '130px';
    timeInput.title = "Filtrar por Horário de Bebida";
    filtersContainer.appendChild(timeInput);
    
    container.appendChild(filtersContainer);

    // 7. Grid de Animais
    const albumGrid = document.createElement('div');
    albumGrid.className = 'album-grid';
    container.appendChild(albumGrid);

    const itemsToRender = (currentTab.items || []).filter(item => typeof item === 'string' && item !== null && item.trim() !== '');

    itemsToRender.sort((a, b) => a.localeCompare(b)).forEach(name => {
        const card = createAnimalCard(name, tabKey);
        albumGrid.appendChild(card);
    });
    
    // Animação de entrada
    albumGrid.querySelectorAll('.animal-card').forEach((card, index) => {
        card.style.animationDelay = `${index * 0.03}s`;
    });

    // 8. Lógica de Filtragem
    const applyFilters = () => {
        const searchTerm = filterInput.value.toLowerCase();
        const selectedClass = classSelect.value;
        const selectedLevel = levelSelect.value;
        const selectedReserve = reserveSelect.value;
        const selectedTime = timeInput.value;

        albumGrid.querySelectorAll('.animal-card').forEach(card => {
            const animalName = card.querySelector('.info').textContent.toLowerCase();
            const slug = card.dataset.slug;
            const attributes = getAnimalAttributes(slug);

            const nameMatch = animalName.includes(searchTerm);
            const classMatch = !selectedClass || attributes.classes.includes(selectedClass);
            const levelMatch = !selectedLevel || attributes.levels.includes(selectedLevel);
            const reserveMatch = !selectedReserve || attributes.reserves.includes(selectedReserve);
            
            let timeMatch = true;
            if (selectedTime) {
                if (selectedReserve) {
                    const info = animalHotspotData[selectedReserve]?.[slug];
                    timeMatch = info ? isTimeInRanges(selectedTime, info.drinkZonesPotential) : false;
                } else {
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

    filterInput.addEventListener('input', applyFilters);
    classSelect.addEventListener('change', applyFilters);
    levelSelect.addEventListener('change', applyFilters);
    reserveSelect.addEventListener('change', applyFilters);
    timeInput.addEventListener('input', applyFilters);

    // --- NOVO (PASSO 3): Restaura a posição da rolagem ---
    // Verifica se existe uma posição salva para esta aba
    if (typeof tabScrollPositions !== 'undefined' && tabScrollPositions[tabKey]) {
        // Um pequeno delay (50ms) é necessário para o navegador "respirar" e desenhar os cards antes de rolar
        setTimeout(() => {
            window.scrollTo(0, tabScrollPositions[tabKey]);
        }, 50); 
    } else {
        // Se for a primeira vez entrando na aba, garante que começa no topo
        window.scrollTo(0, 0);
    }
}

// =================================================================
// --- FUNÇÃO PRINCIPAL REFATORADA (ROTEADOR) ---
// =================================================================
function renderMainView(tabKey, addToHistory = true) {
    if (addToHistory) {
        pushHistory({ view: 'category', tabKey: tabKey });
    }
    
    appContainer.innerHTML = '';
    const currentTab = categorias[tabKey];
    if (!currentTab) return;

    const mainContent = document.createElement('div');
    mainContent.className = 'main-content';

    // Cria o cabeçalho usando o componente existente
    const header = createPageHeader(currentTab.title, renderNavigationHub, 'Voltar ao Menu');
    mainContent.appendChild(header);

    const contentContainer = document.createElement('div');
    contentContainer.className = `content-container ${tabKey}-view`;
    mainContent.appendChild(contentContainer);
    appContainer.appendChild(mainContent);

    setupLogoutButton(currentUser, appContainer);

    // --- ROTEADOR: Mapa de Rotas ---
    // Define qual função desenha cada tela específica
    const routes = {
        [TABS.PROGRESSO]: () => renderProgressView(contentContainer),
        [TABS.RESERVAS]: () => renderReservesList(contentContainer),
        [TABS.MONTAGENS]: () => renderMultiMountsView(contentContainer),
        [TABS.GRIND]: () => renderGrindHubView(contentContainer),
        [TABS.CONFIGURACOES]: () => renderSettingsView(contentContainer)
    };

    // Verifica se existe uma rota especial para a aba clicada
    const renderFunction = routes[tabKey];

    if (renderFunction) {
        // Se for uma tela especial (Progresso, Grind, etc), executa a função dela
        renderFunction();
    } else {
        // Se não for especial, desenha a tela padrão de grade (Pelagens, Diamantes, etc)
        renderStandardCategoryView(contentContainer, tabKey, currentTab);
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
    // --- NOVO (PASSO 2): Salva a posição da rolagem ---
    // Guarda a altura atual da tela para usarmos quando voltar
    if (typeof tabScrollPositions !== 'undefined') {
        tabScrollPositions[tabKey] = window.scrollY;
    }

    if (addToHistory) {
        pushHistory({ view: 'detail', name: name, tabKey: tabKey, originReserve: originReserveKey });
    }
    
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

    // CORREÇÃO: Força a remoção de acentos (ó -> o, í -> i) para bater com o nome do arquivo
    const slugReserve = slugify(reserveName).normalize('NFD').replace(/[\u0300-\u036f]/g, "");
    
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

    const speciesData = rareFursData[slug];
    if (!speciesData) {
        furGrid.innerHTML = '<p>Nenhuma pelagem rara listada para este animal.</p>';
        return;
    }

    const fursToDisplay = [];
    // Adiciona machos e fêmeas à lista
    if (speciesData.macho) speciesData.macho.forEach(fur => fursToDisplay.push({ displayName: `Macho ${fur}`, originalName: fur, gender: 'macho' }));
    if (speciesData.femea) speciesData.femea.forEach(fur => fursToDisplay.push({ displayName: `Fêmea ${fur}`, originalName: fur, gender: 'femea' }));

    if (fursToDisplay.length === 0) {
        furGrid.innerHTML = '<p>Dados incompletos para este animal.</p>';
        return;
    }

    fursToDisplay.sort((a, b) => a.displayName.localeCompare(b.displayName)).forEach(furInfo => {
        // Verifica se já está marcado no save
        const isCompleted = savedData.pelagens?.[slug]?.[furInfo.displayName] === true;

        // Filtro de "Mostrar Faltantes"
        if (filter === 'missing' && isCompleted) return;

        // --- LÓGICA DE IMAGEM SEGURA ---
        const furSlug = slugify(furInfo.originalName);
        const genderSlug = furInfo.gender; // 'macho' ou 'femea'
        
        // Caminho 1: Específico com gênero (ex: alce_albino_macho.png)
        const primaryPath = `animais/pelagens/${slug}_${furSlug}_${genderSlug}.png`;
        // Caminho 2: Genérico (ex: alce_albino.png) - caso a imagem seja igual pros dois
        const fallbackPath = `animais/pelagens/${slug}_${furSlug}.png`;
        // Caminho 3: Placeholder (ex: alce.png)
        const placeholderPath = `animais/${slug}.png`;
        
        const imgTag = createSafeImgTag(primaryPath, fallbackPath, placeholderPath, furInfo.displayName);
        // -------------------------------

        const card = document.createElement('div');
        card.className = `fur-card ${isCompleted ? 'completed' : 'incomplete'}`;
        
        card.innerHTML = `
            ${imgTag}
            <div class="info-header">
                <div class="info">${furInfo.displayName}</div>
            </div>
            <button class="fullscreen-btn" title="Ver em tela cheia">⛶</button>
        `;

        // Evento de Clique para Marcar/Desmarcar
        card.addEventListener('click', () => {
            if (!savedData.pelagens) savedData.pelagens = {};
            if (!savedData.pelagens[slug]) savedData.pelagens[slug] = {};
            
            // Inverte o estado (se true vira false, se false vira true)
            const newState = !savedData.pelagens[slug][furInfo.displayName];
            savedData.pelagens[slug][furInfo.displayName] = newState;
            
            // Atualiza visual instantâneo
            if (newState) card.classList.replace('incomplete', 'completed');
            else card.classList.replace('completed', 'incomplete');
            
            // Salva
            saveData(savedData);
            
            // Se estiver dentro do Dossiê de Reserva, atualiza as abas
            if (originReserveKey) reRenderActiveDossierTab(originReserveKey, name, slug);
        });

        // Evento de Tela Cheia
        const btnFull = card.querySelector('.fullscreen-btn');
        btnFull.addEventListener('click', (e) => {
            e.stopPropagation(); // Impede que marque o card ao clicar no botão
            const imgSrc = card.querySelector('img').src;
            openImageViewer(imgSrc);
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

    // Só mostra Super Raros se o animal tiver Diamante E Pelagem Rara
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

        // --- LÓGICA DE IMAGEM SEGURA ---
        const furSlug = slugify(furInfo.originalName);
        const genderSlug = furInfo.gender;
        const primaryPath = `animais/pelagens/${slug}_${furSlug}_${genderSlug}.png`;
        const fallbackPath = `animais/pelagens/${slug}_${furSlug}.png`;
        const placeholderPath = `animais/${slug}.png`;
        
        const imgTag = createSafeImgTag(primaryPath, fallbackPath, placeholderPath, furInfo.displayName);
        // -------------------------------

        const card = document.createElement('div');
        // Adicionamos 'super-rare-card' para estilização extra (borda dourada/roxa)
        card.className = `fur-card super-rare-card ${isCompleted ? 'completed' : 'incomplete'}`;
        card.innerHTML = `
            ${imgTag}
            <div class="info-header">
                <div class="info">${furInfo.displayName}</div>
            </div>
            <button class="fullscreen-btn" title="Ver em tela cheia">⛶</button>
        `;

        card.addEventListener('click', () => {
            if (!savedData.super_raros) savedData.super_raros = {};
            if (!savedData.super_raros[slug]) savedData.super_raros[slug] = {};
            
            const newState = !savedData.super_raros[slug][furInfo.displayName];
            savedData.super_raros[slug][furInfo.displayName] = newState;
            
            if (newState) card.classList.replace('incomplete', 'completed');
            else card.classList.replace('completed', 'incomplete');
            
            saveData(savedData);
            if (originReserveKey) reRenderActiveDossierTab(originReserveKey, name, slug);
        });

        const btnFull = card.querySelector('.fullscreen-btn');
        btnFull.addEventListener('click', (e) => {
            e.stopPropagation();
            const imgSrc = card.querySelector('img').src;
            openImageViewer(imgSrc);
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
        // Lógica de troféu mais alto
        const highestScoreTrophy = (savedData.diamantes?.[slug] || [])
            .filter(t => t.type === fullTrophyName)
            .reduce((max, t) => t.score > max.score ? t : max, { score: -1 });
            
        const isCompleted = highestScoreTrophy.score !== -1;
        if (filter === 'missing' && isCompleted) return;
        
        const furCard = document.createElement('div');
        furCard.className = `fur-card ${isCompleted ? 'completed' : 'incomplete'}`;
        
        // --- AQUI ESTÁ A MÁGICA DA LIMPEZA ---
        const furSlug = slugify(furInfo.originalName);
        const genderSlug = furInfo.gender.toLowerCase();
        
        // Definimos os caminhos
        const primaryPath = `animais/pelagens/${slug}_${furSlug}_${genderSlug}.png`;
        const fallbackPath = `animais/pelagens/${slug}_${furSlug}.png`;
        const placeholderPath = `animais/${slug}.png`;
        
        // Geramos a imagem segura
        const imgTag = createSafeImgTag(primaryPath, fallbackPath, placeholderPath, furInfo.displayName);
        // -------------------------------------

        let statsHTML = animalStats ? `<div class="animal-stats-info"><div><i class="fas fa-trophy"></i>&nbsp;<strong>Pont. Troféu:</strong> ${animalStats.maxScore || 'N/A'}</div><div><i class="fas fa-weight-hanging"></i>&nbsp;<strong>Peso Máx:</strong> ${animalStats.maxWeightEstimate || 'N/A'}</div></div>` : '';
        
        furCard.innerHTML = `
            ${imgTag}
            <div class="info-header">
                <span class="gender-tag">${furInfo.gender}</span>
                <div class="info">${furInfo.displayName}</div>
            </div>
            ${statsHTML}
            <div class="score-container">
                ${isCompleted ? `<span class="score-display"><i class="fas fa-trophy"></i> ${highestScoreTrophy.score}</span>` : '<span class="score-add-btn">Adicionar Pontuação</span>'}
            </div>
            <button class="fullscreen-btn" title="Ver em tela cheia">⛶</button>
        `;

        // ... (O resto da lógica de clique e input continua igual, omiti para brevidade, mas você deve manter o código original de eventos abaixo) ...
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
        
        // --- USO DA NOVA FUNÇÃO SEGURA ---
        const primaryPath = `animais/pelagens/great_${slug}_${furSlug}.png`;
        const placeholderPath = `animais/${slug}.png`;
        
        // Cria a imagem usando nossa fábrica segura (sem fallback secundário aqui, vai direto pro placeholder)
        const imgTag = createSafeImgTag(primaryPath, null, placeholderPath, furName);
        // ---------------------------------

        furCard.innerHTML = `
            ${imgTag}
            <div class="info-plaque">
                <div class="info">${furName}</div>
                <div class="kill-counter"><i class="fas fa-trophy"></i> x${trophies.length}</div>
            </div>
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
    modal.className = 'modal-overlay form-modal';

    // Garante que a estrutura de dados existe
    if (!savedData.greats) savedData.greats = {};
    if (!savedData.greats[slug]) savedData.greats[slug] = {};
    if (!savedData.greats[slug].furs) savedData.greats[slug].furs = {};
    if (!savedData.greats[slug].furs[furName]) savedData.greats[slug].furs[furName] = { trophies: [] };

    const trophies = savedData.greats[slug].furs[furName].trophies;


    // --- FUNÇÃO 1: RENDERIZA A LISTA (Tela Inicial) ---
    const renderList = () => {
        let htmlContent = `
            <div class="modal-content-box" style="max-width: 500px; width: 95%;">
                <div class="go-modal-header">
                    <h3>${animalName}</h3>
                    <p><i class="fas fa-crown"></i> ${furName}</p>
                </div>
                
                <div class="trophy-list-container" style="max-height: 350px; overflow-y: auto; padding-right: 5px;">
        `;

        if (trophies.length === 0) {
            htmlContent += `
                <div style="text-align: center; padding: 30px 10px; opacity: 0.6;">
                    <i class="fas fa-scroll" style="font-size: 3rem; margin-bottom: 10px;"></i>
                    <p>Nenhum registro encontrado.<br>Comece seu legado agora!</p>
                </div>`;
        } else {
            trophies.forEach((t, index) => {
                const dateStr = new Date(t.date).toLocaleDateString('pt-BR');
                const stats = t.stats || {};
                
                htmlContent += `
                    <div class="go-history-card">
                        <div class="go-card-top">
                            <strong style="color: white;">Registro #${index + 1}</strong>
                            <small style="color: #888;">${dateStr}</small>
                        </div>
                        <div class="go-card-stats">
                            <div class="go-stat-pill"><i class="fas fa-skull icon-kill"></i> ${stats.kills || 0} Abates</div>
                            <div class="go-stat-pill"><i class="fas fa-gem icon-dia"></i> ${stats.diamonds || 0} Diamantes</div>
                            <div class="go-stat-pill"><i class="fas fa-ghost icon-troll"></i> ${stats.trolls || 0} Trolls</div>
                            <div class="go-stat-pill"><i class="fas fa-paw icon-rare"></i> ${stats.rares || 0} Raros</div>
                        </div>
                        <button class="btn-delete-log" data-index="${index}" title="Excluir"><i class="fas fa-trash"></i></button>
                    </div>
                `;
            });
        }

        htmlContent += `
                </div>
                <div class="go-btn-group">
                    <button id="btn-close-modal" class="go-btn go-btn-secondary">Fechar</button>
                    <button id="btn-add-new" class="go-btn go-btn-primary"><i class="fas fa-plus"></i> Novo Registro</button>
                </div>
            </div>
        `;

        modal.innerHTML = htmlContent;

        // Eventos
        modal.querySelector('#btn-close-modal').onclick = () => closeModal('form-modal');
        modal.querySelector('#btn-add-new').onclick = () => renderForm();
        modal.querySelectorAll('.btn-delete-log').forEach(btn => {
            btn.onclick = async (e) => {
                // currentTarget garante que pegamos o botão, mesmo clicando no ícone da lixeira
                const idx = e.currentTarget.dataset.index; 
                if (await showCustomAlert('Excluir este registro permanentemente?', 'Confirmar', true)) {
                    trophies.splice(idx, 1);
                    saveAndRefresh();
                }
            };
        });
    };

    // --- FUNÇÃO 2: RENDERIZA O FORMULÁRIO (Tela de Cadastro) ---
    const renderForm = () => {
        modal.innerHTML = `
            <div class="modal-content-box" style="max-width: 500px; width: 95%;">
                <div class="go-modal-header">
                    <h3>Novo Registro</h3>
                    <p>Insira as estatísticas finais do Grind</p>
                </div>

                <div class="go-form-grid">
                    <div>
                        <span class="go-label">Total de Abates</span>
                        <div class="go-input-wrapper">
                            <input type="number" id="input-kills" placeholder="0">
                            <i class="fas fa-skull icon-kill"></i>
                        </div>
                    </div>
                    <div>
                        <span class="go-label">Diamantes</span>
                        <div class="go-input-wrapper">
                            <input type="number" id="input-diamonds" placeholder="0">
                            <i class="fas fa-gem icon-dia"></i>
                        </div>
                    </div>
                    <div>
                        <span class="go-label">Trolls</span>
                        <div class="go-input-wrapper">
                            <input type="number" id="input-trolls" placeholder="0">
                            <i class="fas fa-ghost icon-troll"></i>
                        </div>
                    </div>
                    <div>
                        <span class="go-label">Raros</span>
                        <div class="go-input-wrapper">
                            <input type="number" id="input-rares" placeholder="0">
                            <i class="fas fa-paw icon-rare"></i>
                        </div>
                    </div>
                </div>

                <div class="go-btn-group">
                    <button id="btn-cancel-add" class="go-btn go-btn-secondary">Voltar</button>
                    <button id="btn-save-stats" class="go-btn go-btn-primary"><i class="fas fa-save"></i> Salvar</button>
                </div>
            </div>
        `;

        // Foca no primeiro campo automaticamente
        setTimeout(() => document.getElementById('input-kills').focus(), 100);

        document.getElementById('btn-cancel-add').onclick = () => renderList();
        
        document.getElementById('btn-save-stats').onclick = () => {
            const kills = parseInt(document.getElementById('input-kills').value) || 0;
            const diamonds = parseInt(document.getElementById('input-diamonds').value) || 0;
            const trolls = parseInt(document.getElementById('input-trolls').value) || 0;
            const rares = parseInt(document.getElementById('input-rares').value) || 0;

            trophies.push({
                date: new Date().toISOString(),
                stats: { kills, diamonds, trolls, rares }
            });

            saveAndRefresh();
        };
    };

    // --- FUNÇÃO AUXILIAR ---
    const saveAndRefresh = () => {
        checkAndSetGreatOneCompletion(slug, savedData.greats[slug]);
        saveData(savedData);
        renderList(); 
        
        const activeDossierTab = document.querySelector('.dossier-tab.active');
        if (activeDossierTab && originReserveKey) {
            reRenderActiveDossierTab(originReserveKey, animalName, slug);
        } else {
            renderSimpleDetailView(animalName, 'greats');
        }
    };

    renderList();
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
        // Incrementa o número total visualmente e nos dados
        session.counts.total++;
        
        if (isDetailed) {
            openGrindDetailModal(sessionId, type, session.counts.total);
        } else {
            // CORREÇÃO: Só tenta salvar na lista específica se NÃO for o contador total
            if (type !== 'total') {
                if (!Array.isArray(session.counts[type])) {
                    session.counts[type] = []; // Garante que é uma lista
                }
                session.counts[type].push({ id: Date.now(), killCount: session.counts.total });
            }
            
            saveData(savedData);
            renderGrindCounterView(sessionId, isZonesOpenState);
        }
    };

    // Helper para lógica de remover último troféu
    const handleDecrease = async (type) => {
        // Se for o contador total (apenas número)
        if (type === 'total') {
            if (session.counts.total > 0) {
                session.counts.total--;
                saveData(savedData);
                renderGrindCounterView(sessionId, isZonesOpenState);
            }
            return;
        }
        
        // Se for lista (Diamantes, Raros, etc) - Remove o último sem perguntar
        if (session.counts[type] && session.counts[type].length > 0) {
            session.counts[type].pop(); // Remove o último item da lista
            saveData(savedData);
            renderGrindCounterView(sessionId, isZonesOpenState);
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

        // LÓGICA DO BRILHO: Adiciona classes extras se tiver valor > 0
        card.classList.add(`type-${cfg.type}`);
        if (cfg.value > 0) {
            card.classList.add('active-glow');
        }

        countersWrapper.appendChild(card);
    });

    grindContainer.appendChild(countersWrapper);
    
    // 3. Renderiza o Gerenciador de Zonas (Usando Componente Importado)
    renderZoneManager(grindContainer, session, isZonesOpenState, () => {
        saveData(savedData);
        renderGrindCounterView(sessionId, true); // true mantem o details aberto
    });

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

function openGrindDetailModal(sessionId, type, killCount) {
    const session = savedData.grindSessions.find(s => s.id === sessionId);
    if (!session) return;

    const { animalSlug } = session;
    const animalName = items.find(item => slugify(item) === animalSlug);
    let potentialFurs = [];
    let title = '';

    // Prepara os dados (Mantemos a lógica original que já estava boa)
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

    // Cria a estrutura base do modal
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

    // Gera os cartões usando a lógica segura
    potentialFurs.forEach((fur) => {
        const furSlug = slugify(fur.originalName);
        const animalSlugFixed = slugify(animalName); 
        const genderSuffix = fur.gender === 'macho' ? '_macho' : (fur.gender === 'femea' ? '_femea' : '');
        
        let primaryPath;
        if (type === 'great_ones') {
             primaryPath = `animais/pelagens/great_${animalSlugFixed}_${furSlug}.png`;
        } else {
             primaryPath = `animais/pelagens/${animalSlugFixed}_${furSlug}${genderSuffix}.png`;
        }

        const fallbackPath = `animais/pelagens/${animalSlugFixed}_${furSlug}.png`; // Tenta sem gênero se falhar
        const placeholderPath = `animais/${animalSlugFixed}.png`; // Último caso: foto do animal

        // --- MÁGICA SEGURA ---
        // Aqui usamos a função centralizada que criamos no utils.js
        const imgTag = createSafeImgTag(primaryPath, fallbackPath, placeholderPath, fur.displayName);
        // --------------------

        const card = document.createElement('div');
        card.className = 'grind-option-card';
        card.innerHTML = `
            <div class="grind-opt-img">
                ${imgTag}
            </div>
            <div class="grind-opt-name">${fur.displayName}</div>
        `;

        // Evento de Clique
        card.onclick = () => {
            const displayName = fur.displayName;

            // 1. Salvar no Contador do Grind (Sessão Atual)
            if (!session.counts[type]) session.counts[type] = []; 
            session.counts[type].push({ id: Date.now(), killCount: killCount, variation: displayName });

            // 2. TRADUÇÃO DE CHAVES (A Correção da Sincronização)
            // Aqui garantimos que o nome usado no Grind bata com o nome usado nas abas principais
            let collectionKey = type;
            if (type === 'great_ones') collectionKey = 'greats';
            else if (type === 'rares') collectionKey = 'pelagens';   // <--- CORREÇÃO: Mapeia 'rares' para 'pelagens'
            else if (type === 'diamonds') collectionKey = 'diamantes'; // Precaução para diamantes

            // 3. Salvar na Coleção Geral
            if (collectionKey === 'greats') {
                // Lógica específica para Great Ones
                if (!savedData.greats[animalSlug]) savedData.greats[animalSlug] = { furs: {} };
                if (!savedData.greats[animalSlug].furs[displayName]) savedData.greats[animalSlug].furs[displayName] = { trophies: [] };
                savedData.greats[animalSlug].furs[displayName].trophies.push({ date: new Date().toISOString() });
            } else {
                // Lógica para Pelagens e Diamantes
                if (!savedData[collectionKey]) savedData[collectionKey] = {};
                if (!savedData[collectionKey][animalSlug]) savedData[collectionKey][animalSlug] = {};
                
                // Se for Diamante, salva como array (lista). Se for pelagem, salva como "true" (marcado).
                if (collectionKey === 'diamantes') {
                     if (!Array.isArray(savedData[collectionKey][animalSlug])) savedData[collectionKey][animalSlug] = [];
                     // Adiciona o diamante com pontuação 0, pois no grind rápido não colocamos a pontuação na hora
                     savedData[collectionKey][animalSlug].push({ id: Date.now(), type: displayName, score: 0 });
                } else {
                     savedData[collectionKey][animalSlug][displayName] = true;
                }
            }

            saveData(savedData);
            closeModal('form-modal');
            renderGrindCounterView(sessionId);
            
            // Feedback visual para você saber que funcionou
            showToast(`${displayName} salvo no Grind e na Coleção Principal!`);
        };

        gridContainer.appendChild(card);
    });

    modal.appendChild(modalContent);
    modalContent.querySelector('#btn-cancel-select').onclick = () => closeModal('form-modal');
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

// Substitua toda a função importUserData por esta versão robusta:

async function importUserData(event) {
    if (!currentUser) {
        showCustomAlert('Você precisa estar logado para restaurar um backup.', 'Aviso');
        return;
    }
    
    const file = event.target.files[0];
    if (!file) return;

    if (file.type !== 'application/json') {
        showCustomAlert('Por favor, selecione um arquivo .json válido.', 'Arquivo Inválido');
        event.target.value = '';
        return;
    }

    // Alerta de segurança
    if (!await showCustomAlert(
        'Isso irá mesclar o backup com seus dados. Dados do arquivo substituirão os atuais. Campos novos de atualizações futuras serão preservados. Deseja continuar?',
        'Restaurar Backup',
        true
    )) {
        event.target.value = '';
        return;
    }

    const reader = new FileReader();
    reader.onload = async (e) => {
        try {
            const importedData = JSON.parse(e.target.result);
            
            // 1. Carrega a estrutura mais atual do aplicativo (com todas as abas novas que existirem)
            let finalData = getDefaultDataStructure();

            console.log("Iniciando Mesclagem Inteligente de Backup...");

            // ======================================================
            // MIGRAÇÃO DE DADOS ANTIGOS (Para backups velhos)
            // ======================================================
            
            // Correção de Diamantes (Número -> Objeto)
            if (importedData.diamantes) {
                for (const slug in importedData.diamantes) {
                    const data = importedData.diamantes[slug];
                    // Se for número antigo, converte para array novo
                    if (typeof data === 'number') {
                         if (!Array.isArray(importedData.diamantes[slug])) importedData.diamantes[slug] = [];
                         for (let i = 0; i < data; i++) {
                            importedData.diamantes[slug].push({ id: Date.now() + i, type: 'Legado', score: 0 });
                         }
                    }
                }
            }

            // Correção de Grind Sessions (Estrutura antiga -> Nova)
            if (Array.isArray(importedData.grindSessions)) {
                importedData.grindSessions = importedData.grindSessions.map(session => {
                    // Garante que a sessão tenha todos os arrays necessários
                    const safeCounts = { 
                        total: session.counts?.total || 0, 
                        rares: session.counts?.rares || [], 
                        diamonds: session.counts?.diamonds || [], 
                        trolls: session.counts?.trolls || [], 
                        great_ones: session.counts?.great_ones || [], 
                        super_raros: session.counts?.super_raros || [] 
                    };
                    return { ...session, counts: safeCounts, zones: session.zones || [] };
                });
            }

            // ======================================================
            // LÓGICA DE DEEP MERGE (O SEGREDO DA COMPATIBILIDADE)
            // ======================================================
            
            // Função auxiliar para mesclar objetos sem apagar chaves novas
            const deepMerge = (target, source) => {
                for (const key in source) {
                    // Se for objeto (e não array), mergulha mais fundo
                    if (source[key] instanceof Object && key in target && !Array.isArray(source[key])) {
                        Object.assign(source[key], deepMerge(target[key], source[key]));
                    } else {
                        // Se for valor direto ou array, o backup ganha
                        target[key] = source[key];
                    }
                }
                return target;
            };

            // Aplica o backup (source) sobre a estrutura padrão (target)
            // Assim, se getDefaultDataStructure() tiver uma chave nova "novos_recursos: {}",
            // e o backup não tiver, a chave "novos_recursos" continua existindo vazia.
            finalData = deepMerge(finalData, importedData);

            // Adiciona metadados de controle
            finalData.lastBackupRestore = new Date().toISOString();

            // Salva na Nuvem e Local
            savedData = finalData;
            saveData(savedData);
            
            await showCustomAlert('Backup restaurado e atualizado com sucesso! A página será recarregada.', 'Concluído');
            location.reload();

        } catch (error) {
            console.error("Erro crítico no import:", error);
            showCustomAlert('Arquivo corrompido ou incompatível.', 'Erro Fatal');
        } finally {
            event.target.value = '';
        }
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