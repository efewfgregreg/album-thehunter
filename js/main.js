// Arquivo: js/main.js

// =================================================================
// ========================== MÓDULOS ==============================
// =================================================================
import { renderLoginForm, renderRegisterForm, setupLogoutButton, closeModal, showCustomAlert } from './auth.js';
import { rareFursData, greatsFursData, items, diamondFursData, reservesData, animalHotspotData, multiMountsData } from '../data/gameData.js';
import { auth, db } from './firebase.js';


// =================================================================
// =================== VARIÁVEIS GLOBAIS DO APP ====================
// =================================================================
let appContainer;
let currentUser = null;
let savedData = {};


// =================================================================
// ===================== FUNÇÕES UTILITÁRIAS =======================
// =================================================================

function setRandomBackground() {
    const totalBackgrounds = 39;
    let lastBg = localStorage.getItem('lastBg');
    let randomNumber;
    do {
        randomNumber = Math.floor(Math.random() * totalBackgrounds) + 1;
    } while (randomNumber == lastBg);
    localStorage.setItem('lastBg', randomNumber);
    const imageUrl = `background/background_${randomNumber}.png`;
    document.body.style.backgroundImage = `url('${imageUrl}')`;
}

function slugify(texto) {
    return texto.toLowerCase().replace(/[-\s]+/g, '_').replace(/'/g, '');
}
// ▼▼▼ COLE ESTE NOVO BLOCO DE CÓDIGO AQUI ▼▼▼

function getUniqueAnimalData() {
    const classes = new Set();
    const levels = new Set();

    Object.values(animalHotspotData).forEach(reserve => {
        Object.values(reserve).forEach(animal => {
            if (animal.animalClass) classes.add(animal.animalClass);
            if (animal.maxLevel) levels.add(animal.maxLevel);
        });
    });

    // Ordena numericamente, tratando "9 (Lendário)" como 9.
    const sortedClasses = [...classes].sort((a, b) => parseInt(a) - parseInt(b));
    const sortedLevels = [...levels].sort((a, b) => parseInt(a) - parseInt(b));

    return { classes: sortedClasses, levels: sortedLevels };
}

function getAnimalAttributes(slug) {
    const attributes = {
        classes: new Set(),
        levels: new Set(),
        reserves: new Set()
    };

    // Coleta classes e níveis
    Object.values(animalHotspotData).forEach(reserve => {
        if (reserve[slug]) {
            if (reserve[slug].animalClass) attributes.classes.add(reserve[slug].animalClass);
            if (reserve[slug].maxLevel) attributes.levels.add(reserve[slug].maxLevel);
        }
    });

    // Coleta reservas
    Object.entries(reservesData).forEach(([reserveKey, reserveData]) => {
        if (reserveData.animals.includes(slug)) {
            attributes.reserves.add(reserveKey);
        }
    });

    return {
        classes: [...attributes.classes],
        levels: [...attributes.levels],
        reserves: [...attributes.reserves]
    };
}

// ▲▲▲ FIM DO BLOCO A SER ADICIONADO ▲▲▲

// =================================================================
// ====================== DADOS E CATEGORIAS =======================
// =================================================================

const categorias = {
    pelagens: { title: 'Pelagens Raras', items: items, icon: '<img src="icones/pata_icon.png" class="custom-icon">', isHtml: true },
    diamantes: { title: 'Diamantes', items: items, icon: '<img src="icones/diamante_icon.png" class="custom-icon">', isHtml: true },
    greats: { title: 'Great Ones', items: items.filter(item => Object.keys(greatsFursData).includes(slugify(item))), icon: '<img src="icones/greatone_icon.png" class="custom-icon">', isHtml: true },
    super_raros: { title: 'Super Raros', items: items, icon: '<img src="icones/coroa_icon.png" class="custom-icon">', isHtml: true },
    montagens: { title: 'Montagens Múltiplas', icon: '<img src="icones/trofeu_icon.png" class="custom-icon">', isHtml: true },
    grind: { title: 'Contador de Grind', icon: '<img src="icones/cruz_icon.png" class="custom-icon">', isHtml: true },
    reservas: { title: 'Reservas de Caça', icon: '<img src="icones/mapa_icon.png" class="custom-icon">', isHtml: true },
    progresso: { title: 'Painel de Progresso', icon: '<img src="icones/progresso_icon.png" class="custom-icon">', isHtml: true },
    configuracoes: { title: 'Configurações', icon: '<img src="icones/configuracoes_icon.png" class="custom-icon">', isHtml: true } // <<< LINHA ALTERADA
};


// =================================================================
// ============ LÓGICA DE CÁLCULOS DE PROGRESSO ==================
// =================================================================

function checkAndSetGreatOneCompletion(slug, currentData) {
    const requiredFurs = greatsFursData[slug];
    if (!requiredFurs || !currentData) return;
    currentData.completo = requiredFurs.every(furName => currentData.furs?.[furName]?.trophies?.length > 0);
}

function calcularOverallProgress() {
    const progress = {
        collectedRares: 0, totalRares: 0,
        collectedDiamonds: 0, totalDiamonds: 0,
        collectedGreatOnes: 0, totalGreatOnes: 0,
        collectedSuperRares: 0, totalSuperRares: 0
    };
    const allAnimalSlugs = [...new Set(Object.keys(rareFursData).concat(Object.keys(diamondFursData)))];
    allAnimalSlugs.forEach(slug => {
        if (rareFursData[slug]) {
            progress.totalRares += (rareFursData[slug].macho?.length || 0) + (rareFursData[slug].femea?.length || 0);
        }
        progress.collectedRares += Object.values(savedData.pelagens?.[slug] || {}).filter(v => v === true).length;
        if (diamondFursData[slug]) {
            progress.totalDiamonds += (diamondFursData[slug].macho?.length || 0) + (diamondFursData[slug].femea?.length || 0);
        }
        progress.collectedDiamonds += new Set((savedData.diamantes?.[slug] || []).map(t => t.type)).size;
        if (greatsFursData[slug]) {
            progress.totalGreatOnes += greatsFursData[slug].length;
            progress.collectedGreatOnes += Object.values(savedData.greats?.[slug]?.furs || {}).filter(f => f.trophies?.length > 0).length;
        }
        const speciesRareFurs = rareFursData[slug];
        const speciesDiamondFurs = diamondFursData[slug];
        if (speciesRareFurs) {
            if (speciesRareFurs.macho && (speciesDiamondFurs?.macho?.length || 0) > 0) {
                progress.totalSuperRares += speciesRareFurs.macho.length;
            }
            if (speciesRareFurs.femea && (speciesDiamondFurs?.femea?.length || 0) > 0) {
                progress.totalSuperRares += speciesRareFurs.femea.length;
            }
        }
        progress.collectedSuperRares += Object.values(savedData.super_raros?.[slug] || {}).filter(v => v === true).length;
    });
    return progress;
}

function calcularReserveProgress(reserveKey) {
    const reserveAnimals = reservesData[reserveKey]?.animals || [];
    let progress = {
        collectedRares: 0, totalRares: 0,
        collectedDiamonds: 0, totalDiamonds: 0,
        collectedGreatOnes: 0, totalGreatOnes: 0,
        collectedSuperRares: 0, totalSuperRares: 0
    };
    reserveAnimals.forEach(slug => {
        if (rareFursData[slug]) {
            progress.totalRares += (rareFursData[slug].macho?.length || 0) + (rareFursData[slug].femea?.length || 0);
            progress.collectedRares += Object.values(savedData.pelagens?.[slug] || {}).filter(v => v === true).length;
        }
        if (diamondFursData[slug]) {
            progress.totalDiamonds += (diamondFursData[slug].macho?.length || 0) + (diamondFursData[slug].femea?.length || 0);
            progress.collectedDiamonds += new Set((savedData.diamantes?.[slug] || []).map(t => t.type)).size;
        }
        if (greatsFursData[slug]) {
            progress.totalGreatOnes += greatsFursData[slug].length;
            progress.collectedGreatOnes += Object.values(savedData.greats?.[slug]?.furs || {}).filter(f => f.trophies?.length > 0).length;
        }
        const speciesRareFurs = rareFursData[slug];
        const speciesDiamondFurs = diamondFursData[slug];
        if (speciesRareFurs) {
            if (speciesRareFurs.macho && (speciesDiamondFurs?.macho?.length || 0) > 0) {
                progress.totalSuperRares += speciesRareFurs.macho.length;
            }
            if (speciesRareFurs.femea && (speciesDiamondFurs?.femea?.length || 0) > 0) {
                progress.totalSuperRares += speciesRareFurs.femea.length;
            }
        }
        progress.collectedSuperRares += Object.values(savedData.super_raros?.[slug] || {}).filter(v => v === true).length;
    });
    return progress;
}
// ▼▼▼ COLE ESTE NOVO BLOCO DE CÓDIGO AQUI ▼▼▼

// ▼▼▼ COLE ESTE NOVO BLOCO NO LUGAR DO ANTIGO ▼▼▼

function calcularProgressoCorrigido() {
    const progress = {
        rares: { collected: 0, total: 0 },
        diamonds: { collected: 0, total: 0 },
        greats: { collected: 0, total: 0 },
        super_raros: { collected: 0, total: 0 }
    };

    const allAnimalSlugs = items.map(slugify);

    allAnimalSlugs.forEach(slug => {
        // Pelagens Raras (por espécie)
        const totalRaresForSlug = (rareFursData[slug]?.macho?.length || 0) + (rareFursData[slug]?.femea?.length || 0);
        if (totalRaresForSlug > 0) {
            progress.rares.total++;
            const collectedRares = Object.values(savedData.pelagens?.[slug] || {}).filter(v => v).length;
            if (collectedRares === totalRaresForSlug) {
                progress.rares.collected++;
            }
        }
        
        // Diamantes (por espécie)
        const totalDiamondsForSlug = (diamondFursData[slug]?.macho?.length || 0) + (diamondFursData[slug]?.femea?.length || 0);
        if (totalDiamondsForSlug > 0) {
            progress.diamonds.total++;
            if ((savedData.diamantes?.[slug] || []).length > 0) {
                progress.diamonds.collected++;
            }
        }

        // Great Ones (por espécie)
        if (greatsFursData[slug]) {
            progress.greats.total++;
            const requiredFurs = greatsFursData[slug];
            const isComplete = requiredFurs.every(fur => savedData.greats?.[slug]?.furs?.[fur]?.trophies?.length > 0);
            if (isComplete) {
                progress.greats.collected++;
            }
        }

        // Super Raros (por espécie)
        const speciesRareFurs = rareFursData[slug];
        const speciesDiamondData = diamondFursData[slug]; // Nome correto da variável
        let totalSuperRaresForSlug = 0;
        // CORREÇÃO APLICADA AQUI: Usando "speciesDiamondData"
        if (speciesRareFurs?.macho && (speciesDiamondData?.macho?.length || 0) > 0) totalSuperRaresForSlug += speciesRareFurs.macho.length;
        if (speciesRareFurs?.femea && (speciesDiamondData?.femea?.length || 0) > 0) totalSuperRaresForSlug += speciesRareFurs.femea.length;
        
        if (totalSuperRaresForSlug > 0) {
            progress.super_raros.total++;
            const collectedSuperRares = Object.values(savedData.super_raros?.[slug] || {}).filter(v => v).length;
            if (collectedSuperRares === totalSuperRaresForSlug) {
                progress.super_raros.collected++;
            }
        }
    });

    return progress;
}

// ▼▼▼ COLE ESTE NOVO BLOCO DE CÓDIGO AQUI ▼▼▼

function calcularProgressoDetalhado() {
    const progress = {
        rares: { collected: 0, total: 0, maleCollected: 0, maleTotal: 0, femaleCollected: 0, femaleTotal: 0, speciesCollected: 0, speciesTotal: 0 },
        diamonds: { collected: 0, total: 0, speciesCollected: 0, speciesTotal: 0 },
        greats: { collected: 0, total: 0, byAnimal: {} },
        super_raros: { collected: 0, total: 0 }
    };

    const allAnimalSlugs = items.map(slugify);

    // Itera sobre todos os animais para os cálculos
    allAnimalSlugs.forEach(slug => {
        // --- Pelagens Raras ---
        const rareData = rareFursData[slug];
        if (rareData) {
            const maleTotal = rareData.macho?.length || 0;
            const femaleTotal = rareData.femea?.length || 0;
            if (maleTotal + femaleTotal > 0) {
                progress.rares.speciesTotal++;
                progress.rares.total += maleTotal + femaleTotal;
                progress.rares.maleTotal += maleTotal;
                progress.rares.femaleTotal += femaleTotal;

                const savedRares = savedData.pelagens?.[slug] || {};
                let collectedCountForSpecies = 0;
                if (rareData.macho) {
                    rareData.macho.forEach(fur => {
                        if (savedRares[`Macho ${fur}`]) {
                            progress.rares.collected++;
                            progress.rares.maleCollected++;
                            collectedCountForSpecies++;
                        }
                    });
                }
                if (rareData.femea) {
                    rareData.femea.forEach(fur => {
                        if (savedRares[`Fêmea ${fur}`]) {
                            progress.rares.collected++;
                            progress.rares.femaleCollected++;
                            collectedCountForSpecies++;
                        }
                    });
                }
                if (collectedCountForSpecies === (maleTotal + femaleTotal)) {
                    progress.rares.speciesCollected++;
                }
            }
        }

        // --- Diamantes ---
        const diamondData = diamondFursData[slug];
        if (diamondData) {
            const totalForSpecies = (diamondData.macho?.length || 0) + (diamondData.femea?.length || 0);
            if (totalForSpecies > 0) {
                progress.diamonds.speciesTotal++;
                progress.diamonds.total += totalForSpecies;
                const collectedForSpecies = new Set((savedData.diamantes?.[slug] || []).map(t => t.type)).size;
                progress.diamonds.collected += collectedForSpecies;
                if (collectedForSpecies > 0) {
                    progress.diamonds.speciesCollected++;
                }
            }
        }

        // --- Super Raros ---
        const srRareData = rareFursData[slug];
        const srDiamondData = diamondFursData[slug];
        if (srRareData && srDiamondData) {
            let totalForSpecies = 0;
            if (srRareData.macho && (srDiamondData.macho?.length || 0) > 0) totalForSpecies += srRareData.macho.length;
            if (srRareData.femea && (srDiamondData.femea?.length || 0) > 0) totalForSpecies += srRareData.femea.length;

            if (totalForSpecies > 0) {
                progress.super_raros.total += totalForSpecies;
                progress.super_raros.collected += Object.values(savedData.super_raros?.[slug] || {}).filter(v => v).length;
            }
        }
    });

    // --- Great Ones ---
    Object.entries(greatsFursData).forEach(([slug, furs]) => {
        progress.greats.total += furs.length;
        const animalName = items.find(i => slugify(i) === slug) || slug;
        let collectedForAnimal = 0;
        furs.forEach(furName => {
            if (savedData.greats?.[slug]?.furs?.[furName]?.trophies?.length > 0) {
                progress.greats.collected++;
                collectedForAnimal++;
            }
        });
        progress.greats.byAnimal[animalName] = { collected: collectedForAnimal, total: furs.length };
    });

    return progress;
}

// ▲▲▲ FIM DO BLOCO A SER ADICIONADO ▲▲▲
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
    userDocRef.set(data)
        .then(() => {
            console.log("Progresso salvo na nuvem com sucesso!");
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

function renderNavigationHub() {
    appContainer.innerHTML = '';
    const hub = document.createElement('div');
    hub.className = 'navigation-hub design-flutuante';

    const title = document.createElement('h1');
    title.className = 'hub-title design-flutuante';
    title.textContent = 'Registro do Caçador';
    hub.appendChild(title);


    const cardsContainer = document.createElement('div');
    cardsContainer.className = 'cards-container-flutuante';
    Object.keys(categorias).forEach(key => {
        const cat = categorias[key];
        if (!cat) return;
        const card = document.createElement('div');
card.className = `nav-card design-flutuante card-${key}`;
        const iconHtml = cat.isHtml ? cat.icon.replace('custom-icon', 'custom-icon nav-card-icon') : `<i class="${cat.icon || 'fas fa-question-circle'}"></i>`;
        card.innerHTML = `${iconHtml}<span>${cat.title}</span>`;
        card.addEventListener('click', () => renderMainView(key));
        cardsContainer.appendChild(card);
    });
    hub.appendChild(cardsContainer);

    appContainer.appendChild(hub);
    setupLogoutButton(currentUser, appContainer);
}

// ▼▼▼ COLE ESTE NOVO BLOCO NO LUGAR DO ANTIGO ▼▼▼

function renderMainView(tabKey) {
    appContainer.innerHTML = '';
    const currentTab = categorias[tabKey];
    if (!currentTab) return;

    const mainContent = document.createElement('div');
    mainContent.className = 'main-content';

    const header = document.createElement('div');
    header.className = 'page-header';
    const title = document.createElement('h2');
    title.textContent = currentTab.title;
    const backButton = document.createElement('button');
    backButton.className = 'back-button';
    backButton.innerHTML = '&larr; Voltar ao Menu';
    backButton.onclick = renderNavigationHub;
    header.appendChild(title);
    header.appendChild(backButton);
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
        // --- INÍCIO DA SEÇÃO DE FILTROS ---
        const filtersContainer = document.createElement('div');
        filtersContainer.className = 'filters-container';
        
        const filterInput = document.createElement('input');
        filterInput.type = 'text';
        filterInput.className = 'filter-input';
        filterInput.placeholder = 'Buscar animal...';
        filtersContainer.appendChild(filterInput);

        const { classes, levels } = getUniqueAnimalData();
        const sortedReserves = Object.entries(reservesData).sort(([, a], [, b]) => a.name.localeCompare(b.name));

        // Dropdown de Classe
        const classSelect = document.createElement('select');
        classSelect.innerHTML = `<option value="">Classe (Todas)</option>` + classes.map(c => `<option value="${c}">Classe ${c}</option>`).join('');
        filtersContainer.appendChild(classSelect);

        // Dropdown de Dificuldade
        const levelSelect = document.createElement('select');
        levelSelect.innerHTML = `<option value="">Dificuldade (Todas)</option>` + levels.map(l => `<option value="${l}">${l}</option>`).join('');
        filtersContainer.appendChild(levelSelect);

        // Dropdown de Reserva
        const reserveSelect = document.createElement('select');
        reserveSelect.innerHTML = `<option value="">Reserva (Todas)</option>` + sortedReserves.map(([key, data]) => `<option value="${key}">${data.name}</option>`).join('');
        filtersContainer.appendChild(reserveSelect);
        
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

        // --- LÓGICA PARA APLICAR FILTROS ---
        const applyFilters = () => {
            const searchTerm = filterInput.value.toLowerCase();
            const selectedClass = classSelect.value;
            const selectedLevel = levelSelect.value;
            const selectedReserve = reserveSelect.value;

            albumGrid.querySelectorAll('.animal-card').forEach(card => {
                const animalName = card.querySelector('.info').textContent.toLowerCase();
                const slug = card.dataset.slug;
                const attributes = getAnimalAttributes(slug);

                const nameMatch = animalName.includes(searchTerm);
                const classMatch = !selectedClass || attributes.classes.includes(selectedClass);
                const levelMatch = !selectedLevel || attributes.levels.includes(selectedLevel);
                const reserveMatch = !selectedReserve || attributes.reserves.includes(selectedReserve);
                
                // O card só é visível se corresponder a TODOS os filtros ativos
                if (nameMatch && classMatch && levelMatch && reserveMatch) {
                    card.style.display = 'flex'; // Usamos 'flex' por causa do novo estilo do card
                } else {
                    card.style.display = 'none';
                }
            });
        };

        // Adiciona os "escutadores" de eventos a todos os campos de filtro
        filterInput.addEventListener('input', applyFilters);
        classSelect.addEventListener('change', applyFilters);
        levelSelect.addEventListener('change', applyFilters);
        reserveSelect.addEventListener('change', applyFilters);
    }
}

// ▲▲▲ FIM DO BLOCO NOVO ▲▲▲

function createAnimalCard(name, tabKey) {
    const card = document.createElement('div');
    card.className = 'animal-card';
    const slug = slugify(name);
    card.dataset.slug = slug;
    // Nova estrutura em main.js -> createAnimalCard
card.innerHTML = `
    <img src="animais/${slug}.png" alt="${name}" onerror="this.onerror=null;this.src='animais/placeholder.png';">
    <div class="card-info">
        <div class="info">${name}</div>
        <div class="progress-container"></div> 
    </div>
`;
    card.addEventListener('click', () => showDetailView(name, tabKey));
    updateCardAppearance(card, slug, tabKey);
    return card;
}
// Decide qual tipo de visualização de detalhes mostrar
function showDetailView(name, tabKey, originReserveKey = null) {
    if (originReserveKey) {
        renderAnimalDossier(name, originReserveKey);
    } else {
        renderSimpleDetailView(name, tabKey);
    }
}

// Renderiza a visualização de detalhes simples (quando acessado pelo menu principal)
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

// Renderiza a lista de reservas
function renderReservesList(container) {
    container.innerHTML = '';
    const grid = document.createElement('div');
    grid.className = 'reserves-grid';
    container.appendChild(grid);

    const sortedReserves = Object.entries(reservesData).sort(([, a], [, b]) => a.name.localeCompare(b.name));

    for (const [reserveKey, reserve] of sortedReserves) {
        const progress = calcularReserveProgress(reserveKey);
        const card = document.createElement('div');
        card.className = 'reserve-card';
         card.innerHTML = `
            <div class="reserve-image-container">
                <img class="reserve-card-image" src="${reserve.image}" onerror="this.style.display='none'">
            </div>
            <div class="reserve-card-info-panel">
                <h3>${reserve.name}</h3>
                <div class="reserve-card-stats">
                    <span><img src="icones/pata_icon.png" class="custom-icon" title="Peles Raras"> ${progress.collectedRares}</span>
                    <span><img src="icones/diamante_icon.png" class="custom-icon" title="Diamantes"> ${progress.collectedDiamonds}</span>
                    <span><img src="icones/coroa_icon.png" class="custom-icon" title="Super Raros"> ${progress.collectedSuperRares}</span>
                    <span><img src="icones/greatone_icon.png" class="custom-icon" title="Great Ones"> ${progress.collectedGreatOnes}</span>
                </div>
            </div>
        `;
        card.addEventListener('click', () => showReserveDetailView(reserveKey));
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

// Renderiza a lista de animais de uma reserva
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
                    <img src="icones/pata_icon.png" class="custom-icon">
                    <div class="mini-progress-bar-container">
                        <div class="mini-progress-bar" style="width: ${raresPercentage}%"></div>
                    </div>
                </div>
                <div class="mini-progress" title="Diamantes: ${collectedDiamonds}/${totalDiamonds}">
                    <img src="icones/diamante_icon.png" class="custom-icon">
                    <div class="mini-progress-bar-container">
                        <div class="mini-progress-bar" style="width: ${diamondsPercentage}%"></div>
                    </div>
                </div>
            </div>
            <img src="icones/greatone_icon.png" class="custom-icon great-one-indicator ${isGreatOne ? 'possible' : ''}" title="Pode ser Great One">
        `;
        row.addEventListener('click', () => showDetailView(animalName, 'reservas', reserveKey));
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
        const slugReserve = slugify(reservesData[reserveKey].name);
        const imagePath = `hotspots/${slugReserve}_${animal.slug}_hotspot.jpg`;
        const card = document.createElement('div');
        card.className = 'hotspot-card';
        card.innerHTML = `
            <img src="${imagePath}" alt="Mapa de Hotspot ${animal.name}" onerror="this.onerror=null;this.src='animais/placeholder.jpg';">
            <div class="info-overlay">
                <span class="animal-name">${animal.name}</span>
                <span class="hotspot-label"><i class="fas fa-map-marker-alt"></i> Hotspot</span>
            </div>
        `;
        card.addEventListener('click', () => renderHotspotDetailModal(reserveKey, animal.slug));
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
// ▼▼▼ COLE ESTE NOVO BLOCO NO LUGAR DO ANTIGO ▼▼▼

function updateCardAppearance(card, slug, tabKey) {
    if (!card) return;

    // 1. Limpa o estado visual anterior do card
    card.classList.remove('completed', 'inprogress', 'incomplete');
    const progressContainer = card.querySelector('.progress-container');
    if (progressContainer) progressContainer.innerHTML = '';
    const oldSummary = card.querySelector('.card-progress-summary');
    if (oldSummary) oldSummary.remove();

    // 2. Variáveis para calcular o progresso
    let collectedCount = 0;
    let totalCount = 0;

    // 3. Bloco ÚNICO para calcular os totais baseado no tipo de aba
    switch (tabKey) {
        case 'pelagens':
        case 'super_raros': {
            const dataSet = tabKey === 'pelagens' ? savedData.pelagens : savedData.super_raros;
            const sourceData = rareFursData[slug];
            collectedCount = Object.values(dataSet?.[slug] || {}).filter(v => v === true).length;
            if (sourceData) {
                if (tabKey === 'super_raros') {
                    const diamondData = diamondFursData[slug];
                    let possible = 0;
                    if (sourceData.macho && (diamondData?.macho?.length || 0) > 0) possible += sourceData.macho.length;
                    if (sourceData.femea && (diamondData?.femea?.length || 0) > 0) possible += sourceData.femea.length;
                    totalCount = possible;
                } else {
                    totalCount = (sourceData.macho?.length || 0) + (sourceData.femea?.length || 0);
                }
            }
            break;
        }
        case 'diamantes': {
            const sourceData = diamondFursData[slug];
            collectedCount = new Set((savedData.diamantes?.[slug] || []).map(t => t.type)).size;
            if (sourceData) {
                totalCount = (sourceData.macho?.length || 0) + (sourceData.femea?.length || 0);
            }
            break;
        }
        case 'greats': {
            const sourceData = greatsFursData[slug];
            const animalData = savedData.greats?.[slug] || {};
            checkAndSetGreatOneCompletion(slug, animalData);
            collectedCount = Object.values(animalData.furs || {}).filter(f => f.trophies?.length > 0).length;
            totalCount = sourceData?.length || 0;
            
            // --- CORREÇÃO APLICADA AQUI ---
            // Adicionada a lógica para o status 'inprogress' dos Great Ones
            if (animalData.completo) {
                card.classList.add('completed');
            } else if (collectedCount > 0) {
                card.classList.add('inprogress'); // <-- ESTA LINHA FOI ADICIONADA
            } else {
                card.classList.add('incomplete'); // <-- ESTA LINHA FOI ADICIONADA
            }
            break;
        }
    }

    // 4. Define o status do card para as outras abas
    if (tabKey !== 'greats') {
        if (totalCount > 0 && collectedCount >= totalCount) {
            card.classList.add('completed');
        } else if (collectedCount > 0) {
            card.classList.add('inprogress');
        } else {
            card.classList.add('incomplete');
        }
    }

    // 5. Renderiza a barra de progresso visual, se houver dados
    if (progressContainer && totalCount > 0) {
        const displayCollected = Math.min(collectedCount, totalCount);
        const percentage = totalCount > 0 ? (displayCollected / totalCount) * 100 : 0;
        const progressText = `${displayCollected} / ${totalCount}`;
        
        const progressBarHTML = `
            <div class="progress-bar-container" title="${progressText}">
                <div class="progress-bar-fill" style="width: ${percentage}%;"></div>
            </div>
            <span class="progress-bar-text">${progressText}</span>
        `;
        progressContainer.innerHTML = progressBarHTML;
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
        const furCard = document.createElement('div');
        furCard.className = `fur-card ${isCompleted ? 'completed' : 'incomplete'}`;
        const furSlug = slugify(furInfo.originalName), genderSlug = furInfo.gender;
        furCard.innerHTML = `<img src="animais/pelagens/${slug}_${furSlug}_${genderSlug}.png" onerror="this.onerror=null; this.src='animais/pelagens/${slug}_${furSlug}.png'; this.onerror=null; this.src='animais/${slug}.png';"><div class="info">${furInfo.displayName}</div><button class="fullscreen-btn" title="Ver em tela cheia">⛶</button>`;
        furCard.addEventListener('click', () => {
            if (!savedData.pelagens) savedData.pelagens = {};
            if (!savedData.pelagens[slug]) savedData.pelagens[slug] = {};
            savedData.pelagens[slug][furInfo.displayName] = !savedData.pelagens[slug][furInfo.displayName];
            saveData(savedData);
            if (originReserveKey) reRenderActiveDossierTab(originReserveKey, name, slug);
            else renderSimpleDetailView(name, 'pelagens');
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
        furGrid.innerHTML = '<p>Nenhuma pelagem Super Rara (rara + diamante) encontrada para este animal.</p>';
        return;
    }
    fursToDisplay.sort((a, b) => a.displayName.localeCompare(b.displayName)).forEach(furInfo => {
        const isCompleted = savedData.super_raros?.[slug]?.[furInfo.displayName] === true;
        if (filter === 'missing' && isCompleted) return;
        const furCard = document.createElement('div');
        furCard.className = `fur-card ${isCompleted ? 'completed' : 'incomplete'} potential-super-rare`;
        const furSlug = slugify(furInfo.originalName);
        const genderSlug = furInfo.gender.toLowerCase();
        furCard.innerHTML = `<img src="animais/pelagens/${slug}_${furSlug}_${genderSlug}.png" onerror="this.onerror=null; this.src='animais/pelagens/${slug}_${furSlug}.png'; this.onerror=null; this.src='animais/${slug}.png';"><div class="info">${furInfo.displayName}</div><button class="fullscreen-btn" title="Ver em tela cheia">⛶</button>`;
        furCard.addEventListener('click', () => {
            if (!savedData.super_raros) savedData.super_raros = {};
            if (!savedData.super_raros[slug]) savedData.super_raros[slug] = {};
            savedData.super_raros[slug][furInfo.displayName] = !savedData.super_raros[slug][furInfo.displayName];
            saveData(savedData);
            if (originReserveKey) reRenderActiveDossierTab(originReserveKey, name, slug);
            else renderSimpleDetailView(name, 'super_raros');
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

// Em main.js, substitua a função inteira por esta:

async function openGreatsTrophyModal(animalName, slug, furName, originReserveKey = null) {
    const modal = document.getElementById('form-modal');
    modal.innerHTML = ''; // Limpa o modal anterior
    modal.className = 'modal-overlay form-modal';

    const modalContent = document.createElement('div');
    modalContent.className = 'modal-content-box trophy-modal-content'; // Nova classe para estilização específica
    modal.appendChild(modalContent);

    // Título do Modal
    modalContent.innerHTML = `
        <div class="trophy-modal-header">
            <h3><img src="icones/greatone_icon.png" class="custom-icon">${furName}</h3>
            <p>Gerencie seus troféus de Great One para ${animalName}</p>
        </div>
    `;

    // Container principal com layout de duas colunas
    const mainContainer = document.createElement('div');
    mainContainer.className = 'trophy-modal-main';
    modalContent.appendChild(mainContainer);

    // Coluna da Esquerda: Lista de Troféus
    const trophyListColumn = document.createElement('div');
    trophyListColumn.className = 'trophy-column trophy-list-column';
    trophyListColumn.innerHTML = '<h4>Troféus Registrados</h4>';
    mainContainer.appendChild(trophyListColumn);

    const logList = document.createElement('div');
    logList.className = 'trophy-log-grid'; // Usaremos grid ao invés de lista
    const trophies = savedData.greats?.[slug]?.furs?.[furName]?.trophies || [];

    if (trophies.length === 0) {
        logList.innerHTML = '<p class="no-trophies-message">Nenhum abate registrado ainda.</p>';
    } else {
        trophies.forEach((trophy, index) => {
            const trophyCard = document.createElement('div');
            trophyCard.className = 'trophy-log-card';
            trophyCard.innerHTML = `
                <div class="trophy-card-header">
                    <strong>Abate de ${new Date(trophy.date).toLocaleDateString()}</strong>
                    <button class="delete-trophy-btn" title="Excluir troféu">&times;</button>
                </div>
                <div class="trophy-card-stats">
                    <div class="stat-item">
                        <img src="icones/caveira_icon.png" class="custom-icon">
                        <span>${trophy.abates || 0} Abates</span>
                    </div>
                    <div class="stat-item">
                        <img src="icones/diamante_icon.png" class="custom-icon">
                        <span>${trophy.diamantes || 0} Diamantes</span>
                    </div>
                    <div class="stat-item">
                        <img src="icones/pata_icon.png" class="custom-icon">
                        <span>${trophy.pelesRaras || 0} Raros</span>
                    </div>
                </div>
            `;
            trophyCard.querySelector('.delete-trophy-btn').onclick = async () => {
                if (await showCustomAlert('Tem certeza que deseja remover este abate?', 'Confirmar Exclusão', true)) {
                    trophies.splice(index, 1);
                    saveData(savedData);
                    closeModal('form-modal');
                    // Atualiza a visualização anterior
                    const activeDossierTab = document.querySelector('.dossier-tab.active');
                    if (activeDossierTab) {
                        reRenderActiveDossierTab(originReserveKey, animalName, slug);
                    } else {
                        renderSimpleDetailView(animalName, 'greats');
                    }
                }
            };
            logList.appendChild(trophyCard);
        });
    }
    trophyListColumn.appendChild(logList);

    // Coluna da Direita: Formulário de Registro
    const formColumn = document.createElement('div');
    formColumn.className = 'trophy-column trophy-form-column';
    formColumn.innerHTML = `
        <h4>Registrar Novo Abate</h4>
        <div class="add-trophy-form">
            <label for="abates">Qtd. Abates na Grind:</label>
            <input type="number" id="abates" name="abates" placeholder="0">
            <label for="diamantes">Qtd. Diamantes na Grind:</label>
            <input type="number" id="diamantes" name="diamantes" placeholder="0">
            <label for="pelesRaras">Qtd. Peles Raras na Grind:</label>
            <input type="number" id="pelesRaras" name="pelesRaras" placeholder="0">
            <label for="date">Data do Abate:</label>
            <input type="date" id="date" name="date" value="${new Date().toISOString().split('T')[0]}">
        </div>
    `;
    mainContainer.appendChild(formColumn);

    // Botões de Ação
    const buttonsDiv = document.createElement('div');
    buttonsDiv.className = 'modal-buttons trophy-modal-buttons';
    const cancelBtn = document.createElement('button');
    cancelBtn.className = 'back-button';
    cancelBtn.textContent = 'Cancelar';
    cancelBtn.onclick = () => closeModal('form-modal');

    const saveBtn = document.createElement('button');
    saveBtn.className = 'back-button primary-action'; // Nova classe para destaque
    saveBtn.textContent = 'Salvar Troféu';
    saveBtn.onclick = () => {
        const form = modal.querySelector('.add-trophy-form');
        const newTrophy = {
            abates: parseInt(form.querySelector('[name="abates"]').value) || 0,
            diamantes: parseInt(form.querySelector('[name="diamantes"]').value) || 0,
            pelesRaras: parseInt(form.querySelector('[name="pelesRaras"]').value) || 0,
            date: form.querySelector('[name="date"]').value || new Date().toISOString().split('T')[0]
        };
        // Lógica para salvar os dados (semelhante à sua versão)
        if (!savedData.greats) savedData.greats = {};
        if (!savedData.greats[slug]) savedData.greats[slug] = {};
        if (!savedData.greats[slug].furs) savedData.greats[slug].furs = {};
        if (!savedData.greats[slug].furs[furName]) savedData.greats[slug].furs[furName] = { trophies: [] };
        savedData.greats[slug].furs[furName].trophies.push(newTrophy);
        checkAndSetGreatOneCompletion(slug, savedData.greats[slug]);
        saveData(savedData);
        closeModal('form-modal');
        // Atualiza a visualização anterior
        const activeDossierTab = document.querySelector('.dossier-tab.active');
        if (activeDossierTab) {
            reRenderActiveDossierTab(originReserveKey, animalName, slug);
        } else {
            renderSimpleDetailView(animalName, 'greats');
        }
    };
    buttonsDiv.appendChild(cancelBtn);
    buttonsDiv.appendChild(saveBtn);
    modalContent.appendChild(buttonsDiv);
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

// ▼▼▼ COLE ESTE NOVO BLOCO NO LUGAR DO ANTIGO ▼▼▼

function renderSettingsView(container) {
    container.innerHTML = '';
    const settingsContainer = document.createElement('div');
    settingsContainer.className = 'settings-container';
    
    const exportButton = document.createElement('button');
    exportButton.className = 'back-button';
    exportButton.innerHTML = '<i class="fas fa-download"></i> Fazer Backup (JSON)';
    exportButton.onclick = exportUserData;
    settingsContainer.appendChild(exportButton);

    const importLabel = document.createElement('label');
    importLabel.htmlFor = 'import-file-input';
    importLabel.className = 'back-button';
    importLabel.style.cssText = 'display: inline-block; width: fit-content; cursor: pointer; background-color: var(--inprogress-color); color: #111;';    
    importLabel.innerHTML = '<i class="fas fa-upload"></i> Restaurar Backup (JSON)';
    settingsContainer.appendChild(importLabel);

    const importInput = document.createElement('input');
    importInput.type = 'file';
    importInput.id = 'import-file-input';
    importInput.accept = '.json';
    importInput.style.display = 'none';
    importInput.addEventListener('change', importUserData);
    settingsContainer.appendChild(importInput);

    const themeButton = document.createElement('button');
    themeButton.id = 'theme-toggle-btn';
    themeButton.className = 'back-button';
    settingsContainer.appendChild(themeButton);

    const resetButton = document.createElement('button');
    resetButton.textContent = 'Resetar Todo o Progresso';
    resetButton.className = 'back-button';
    resetButton.style.cssText = 'background-color: #d9534f; border-color: #d43f3a;';
    
    // --- LÓGICA DE RESET CORRIGIDA ---
    resetButton.onclick = async () => {
        if (await showCustomAlert('Tem certeza que deseja apagar TODO o seu progresso? Esta ação não pode ser desfeita.', 'Resetar Progresso', true)) {
            if (currentUser) {
                try {
                    // Pega a referência do documento do usuário
                    const userDocRef = db.collection('usuarios').doc(currentUser.uid);
                    // Salva a estrutura de dados padrão (vazia) diretamente
                    await userDocRef.set(getDefaultDataStructure());
                    // Mostra um alerta de sucesso e recarrega a página
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
    };
    settingsContainer.appendChild(resetButton);
    container.appendChild(settingsContainer);

    const updateThemeButton = () => {
        if (document.body.classList.contains('light-theme')) {
            themeButton.innerHTML = '<i class="fas fa-moon"></i> Mudar para Tema Escuro';
        } else {
            themeButton.innerHTML = '<i class="fas fa-sun"></i> Mudar para Tema Claro';
        }
    };
    themeButton.addEventListener('click', () => {
        document.body.classList.toggle('light-theme');
        localStorage.setItem('theme', document.body.classList.contains('light-theme') ? 'light' : 'dark');
        updateThemeButton();
    });
    updateThemeButton();
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

// ▼▼▼ COLE ESTE NOVO BLOCO NO LUGAR DO ANTIGO ▼▼▼

function updateNewProgressPanel(container) {
    container.innerHTML = '';
    const panel = document.createElement('div');
    panel.id = 'progress-panel-v3'; // Nova ID para o painel

    const progress = calcularProgressoDetalhado();

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

    // ▼▼▼ COLE ESTE NOVO BLOCO NO LUGAR DO ANTIGO (APENAS a seção Domínio das Reservas) ▼▼▼

    // --- SEÇÃO DE DOMÍNIO DAS RESERVAS (NOVO LAYOUT DE CARDS EXPANSÍVEIS) ---
    const reservesSection = document.createElement('div');
    reservesSection.innerHTML = `<div class="progress-v2-header"><h3>Domínio das Reservas</h3><p>Seu progresso detalhado em cada território de caça.</p></div>`;
    const reservesCardsContainer = document.createElement('div');
    reservesCardsContainer.className = 'reserves-cards-container';
    
    Object.entries(reservesData).sort(([, a], [, b]) => a.name.localeCompare(b.name)).forEach(([reserveKey, reserve]) => {
        const reserveProgress = calcularReserveProgress(reserveKey);
        const totalOverallItems = (reserveProgress.totalRares || 0) + (reserveProgress.totalDiamonds || 0) + (reserveProgress.totalGreatOnes || 0) + (reserveProgress.totalSuperRares || 0);
        const collectedOverallItems = (reserveProgress.collectedRares || 0) + (reserveProgress.collectedDiamonds || 0) + (reserveProgress.collectedGreatOnes || 0) + (reserveProgress.collectedSuperRares || 0);
        const overallPercentage = totalOverallItems > 0 ? Math.round((collectedOverallItems / totalOverallItems) * 100) : 0;

        const reserveCard = document.createElement('div');
        reserveCard.className = 'reserve-progress-card-v4';
        reserveCard.dataset.reserveKey = reserveKey;
        reserveCard.style.backgroundImage = `linear-gradient(rgba(44, 47, 51, 0.7), rgba(44, 47, 51, 0.9)), url('${reserve.image}')`;
        
        let detailBarsHTML = '';
        const reserveCats = [
            { label: 'Raras', collected: reserveProgress.collectedRares, total: reserveProgress.totalRares, icon: 'icones/pata_icon.png' },
            { label: 'Diamantes', collected: reserveProgress.collectedDiamonds, total: reserveProgress.totalDiamonds, icon: 'icones/diamante_icon.png' },
            { label: 'Super Raras', collected: reserveProgress.collectedSuperRares, total: reserveProgress.totalSuperRares, icon: 'icones/coroa_icon.png' },
            { label: 'Great Ones', collected: reserveProgress.collectedGreatOnes, total: reserveProgress.totalGreatOnes, icon: 'icones/greatone_icon.png' }
        ];

        reserveCats.forEach(cat => {
            if (cat.total > 0) {
                const perc = (cat.collected / cat.total) * 100;
                detailBarsHTML += `
                    <div class="rp-detail-item">
                        <img src="${cat.icon}" class="custom-icon" alt="${cat.label}">
                        <span>${cat.label}:</span>
                        <div class="rp-bar-bg"><div class="rp-bar-fill" style="width: ${perc}%;"></div></div>
                        <span class="rp-bar-percentage">${Math.round(perc)}%</span>
                    </div>`;
            }
        });

        reserveCard.innerHTML = `
            <div class="rp-card-header">
                <h3>${reserve.name}</h3>
                <div class="rp-header-percentage">${overallPercentage}%</div>
            </div>
            <div class="rp-card-details">
                ${detailBarsHTML}
                <div class="rp-actions">
                    <button class="back-button view-reserve-btn" data-reserve-key="${reserveKey}">Ver Detalhes</button>
                    <button class="back-button view-hotspots-btn" data-reserve-key="${reserveKey}"><i class="fas fa-map-marked-alt"></i> Ver Mapa</button>
                </div>
            </div>
            <i class="fas fa-chevron-down rp-toggle-icon"></i>
        `;
        reservesCardsContainer.appendChild(reserveCard);
    });

    reservesSection.appendChild(reservesCardsContainer);
    panel.appendChild(reservesSection);
    container.appendChild(panel);

    // Adicionar funcionalidade de expansão/colapso
    container.querySelectorAll('.reserve-progress-card-v4').forEach(card => {
        card.addEventListener('click', (e) => {
            // Impedir que cliques nos botões fechem/abram o card
            if (e.target.closest('.rp-actions button')) {
                return;
            }
            card.classList.toggle('expanded');
            const icon = card.querySelector('.rp-toggle-icon');
            if (card.classList.contains('expanded')) {
                icon.classList.remove('fa-chevron-down');
                icon.classList.add('fa-chevron-up');
            } else {
                icon.classList.remove('fa-chevron-up');
                icon.classList.add('fa-chevron-down');
            }
        });
    });

    // Eventos para os botões "Ver Detalhes"
    container.querySelectorAll('.reserve-progress-card-v4 .view-reserve-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.stopPropagation(); // Evita que o card se colapse
            showReserveDetailView(btn.dataset.reserveKey, 'progresso');
        });
    });

    // Eventos para os botões "Ver Mapa"
    container.querySelectorAll('.reserve-progress-card-v4 .view-hotspots-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.stopPropagation(); // Evita que o card se colapse
            renderHotspotModalByReserve(btn.dataset.reserveKey);
        });
    });
 }

// ▲▲▲ FIM DO BLOCO NOVO (APENAS a seção Domínio das Reservas) ▲▲▲

function createLatestAchievementsPanel() {
    const panel = document.createElement('div');
    panel.className = 'latest-achievements-panel';
    panel.innerHTML = '<h3><i class="fas fa-star"></i> Últimas Conquistas</h3>';
    const grid = document.createElement('div');
    grid.className = 'achievements-grid';
    const allTrophies = [];
    if(savedData.diamantes) {
        Object.entries(savedData.diamantes).forEach(([slug, trophies]) => {
            const animalName = items.find(i => slugify(i) === slug) || slug;
            trophies.forEach(trophy => allTrophies.push({ id: trophy.id, animalName, furName: trophy.type, slug, type: 'diamante' }));
        });
    }
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
    if (allTrophies.length === 0) {
        grid.innerHTML = '<p style="color: var(--text-color-muted); grid-column: 1 / -1;">Nenhum troféu de destaque registrado ainda.</p>';
    } else {
        allTrophies.sort((a, b) => b.id - a.id).slice(0, 4).forEach(trophy => {
            const card = document.createElement('div');
            card.className = 'achievement-card';
            const rotation = Math.random() * 6 - 3;
            card.style.transform = `rotate(${rotation}deg)`;
            card.addEventListener('mouseenter', () => card.style.zIndex = 10);
            card.addEventListener('mouseleave', () => card.style.zIndex = 1);
            const animalSlug = trophy.slug;
            let imagePathString;
            if (trophy.type === 'diamante') {
                const gender = trophy.furName.toLowerCase().includes('macho') ? 'macho' : 'femea';
                const pureFurName = trophy.furName.replace(/^(macho|fêmea)\s/i, '').trim();
                const furSlug = slugify(pureFurName);
                imagePathString = `src="animais/pelagens/${animalSlug}_${furSlug}_${gender}.png" onerror="this.onerror=null; this.src='animais/pelagens/${animalSlug}_${furSlug}.png'; this.onerror=null; this.src='animais/${animalSlug}.png';"`;
            } else if (trophy.type === 'greatone') {
                const furSlug = slugify(trophy.furName);
                imagePathString = `src="animais/pelagens/great_${animalSlug}_${furSlug}.png" onerror="this.onerror=null; this.src='animais/${animalSlug}.png';"`;
            } else {
                imagePathString = `src="animais/${animalSlug}.png"`;
            }
            card.innerHTML = `<img ${imagePathString}><div class="achievement-card-info"><div class="animal-name">${trophy.animalName}</div><div class="fur-name">${trophy.furName.replace(' Diamante','')}</div></div>`;
            grid.appendChild(card);
        });
    }
    panel.appendChild(grid);
    return panel;
}
// ▼▼▼ COLE ESTE NOVO BLOCO DE CÓDIGO AQUI ▼▼▼

// Obtém o inventário completo de troféus para montagens múltiplas
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

// Renderiza a visualização de montagens múltiplas
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
        const status = checkMountRequirements(mount.animals);
        const progressCount = status.fulfillmentRequirements.filter(r => r.met).length;

        const card = document.createElement('div');
        card.className = `mount-card ${status.isComplete ? 'completed' : 'incomplete'}`;
        card.dataset.mountKey = mountKey;

        let animalsHTML = '<div class="mount-card-animals">';
        mount.animals.forEach(animal => {
            animalsHTML += `<img src="animais/${animal.slug}.png" title="${items.find(i => slugify(i) === animal.slug) || animal.slug}" onerror="this.style.display='none'">`;
        });
        animalsHTML += '</div>';

        card.innerHTML = `
            <div class="mount-card-header">
                <h3>${mount.name}</h3>
                <div class="mount-progress">${progressCount} / ${mount.animals.length}</div>
            </div>
            ${animalsHTML}
            ${status.isComplete ? '<div class="mount-completed-banner"><i class="fas fa-check"></i></div>' : ''}
        `;
        card.addEventListener('click', () => renderMultiMountDetailModal(mountKey));
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
                const counts = session.counts;
                const card = document.createElement('div');
                card.className = 'grind-card';
                card.addEventListener('click', () => renderGrindCounterView(session.id));
                card.innerHTML = `
                    <img src="animais/${session.animalSlug}.png" class="grind-card-bg-silhouette" onerror="this.style.display='none'">
                    <div class="grind-card-content">
                        <div class="grind-card-header"><span class="grind-card-animal-name">${animalName}</span></div>
                        <div class="grind-card-stats-grid">
                            <div class="grind-stat"><img src="icones/caveira_icon.png" class="custom-icon" alt="Abates"><span>${counts.total || 0}</span></div>
                            <div class="grind-stat"><img src="icones/diamante_icon.png" class="custom-icon" alt="Diamantes"><span>${counts.diamonds?.length || 0}</span></div>
                            <div class="grind-stat"><img src="icones/pata_icon.png" class="custom-icon" alt="Raros"><span>${counts.rares?.length || 0}</span></div>
                            <div class="grind-stat"><img src="icones/coroa_icon.png" class="custom-icon" alt="Super Raros"><span>${counts.super_raros?.length || 0}</span></div>
                        </div>
                    </div>`;
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

// ▼▼▼ COLE ESTE NOVO BLOCO NO LUGAR DO ANTIGO ▼▼▼

function renderNewGrindAnimalSelection(container) {
    const mainContent = container.closest('.main-content');
    const header = mainContent.querySelector('.page-header h2');
    const backButton = mainContent.querySelector('.page-header .back-button');

    header.textContent = 'Selecione um Animal para o Grind';
    backButton.innerHTML = '&larr; Voltar para o Hub de Grind';
    backButton.onclick = () => renderMainView('grind');

    container.innerHTML = ''; // Limpa o conteúdo anterior

    const filterInput = document.createElement('input');
    filterInput.type = 'text';
    filterInput.className = 'filter-input';
    filterInput.placeholder = 'Buscar animal...';
    container.appendChild(filterInput);

    const grid = document.createElement('div');
    grid.className = 'album-grid';
    container.appendChild(grid);

    // Filtra para mostrar apenas animais que podem ser "grindados" (ex: não aves pequenas)
    const grindableAnimals = items.filter(animal => {
        const slug = slugify(animal);
        const data = Object.values(animalHotspotData).map(r => r[slug]).find(d => d);
        return data && parseInt(data.animalClass) > 1; // Exemplo: Classe maior que 1
    });

    grindableAnimals.sort().forEach(animalName => {
        const slug = slugify(animalName);
        const card = document.createElement('div');
        card.className = 'animal-card'; // Reutiliza o estilo do card de animal
        card.innerHTML = `
            <img src="animais/${slug}.png" alt="${animalName}" onerror="this.onerror=null;this.src='animais/placeholder.png';">
            <div class="card-info">
                <div class="info">${animalName}</div>
            </div>
        `;
        card.addEventListener('click', () => renderReserveSelectionForGrind(container, slug));
        grid.appendChild(card);
    });

    filterInput.addEventListener('input', (e) => {
        const searchTerm = e.target.value.toLowerCase();
        grid.querySelectorAll('.animal-card').forEach(card => {
            const name = card.querySelector('.info').textContent.toLowerCase();
            card.style.display = name.includes(searchTerm) ? 'flex' : 'none';
        });
    });
}

async function renderReserveSelectionForGrind(container, animalSlug) {
    const mainContent = container.closest('.main-content');
    const header = mainContent.querySelector('.page-header h2');
    const animalName = items.find(item => slugify(item) === animalSlug);

    header.textContent = `Selecione a Reserva para ${animalName}`;
    // O botão voltar agora retorna para a seleção de animal
    mainContent.querySelector('.page-header .back-button').onclick = () => renderNewGrindAnimalSelection(container);


    container.innerHTML = ''; // Limpa a lista de animais

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
        card.className = 'reserve-card'; // Reutiliza o estilo do card de reserva
        card.innerHTML = `
            <div class="reserve-image-container">
                <img class="reserve-card-image" src="${reserve.image}" onerror="this.style.display='none'">
            </div>
            <div class="reserve-card-info-panel">
                <h3>${reserve.name}</h3>
            </div>
        `;
        card.addEventListener('click', async () => {
           // ▼▼▼ COLE ESTE NOVO OBJETO NO LUGAR DO ANTIGO ▼▼▼
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
                zones: [] // <<< NOVA PROPRIEDADE PARA ARMAZENAR AS ZONAS
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

// ▲▲▲ FIM DO NOVO BLOCO ▲▲▲

// ▼▼▼ COLE ESTE NOVO BLOCO NO LUGAR DO ANTIGO ▼▼▼

async function renderGrindCounterView(sessionId) {
    const session = savedData.grindSessions.find(s => s.id === sessionId);
    if (!session) return renderMainView('grind');

    if (!session.counts) session.counts = {};
    if (!session.zones) session.zones = []; 

    const { animalSlug, reserveKey } = session;
    const animalName = items.find(item => slugify(item) === animalSlug);
    const reserveName = reservesData[reserveKey].name;
    const hotspotInfo = animalHotspotData[reserveKey]?.[animalSlug] || {};
    
    const mainContent = document.querySelector('.main-content');
    const container = mainContent.querySelector('.content-container');
    mainContent.querySelector('.page-header h2').textContent = `Contador de Grind`;
    const backButton = mainContent.querySelector('.page-header .back-button');
    backButton.innerHTML = `&larr; Voltar para o Hub de Grind`;
    backButton.onclick = () => renderMainView('grind');

    container.innerHTML = `
        <div class="grind-container">
            <div class="grind-header">
                <div class="grind-header-info">
                    <h2>${animalName.toUpperCase()}</h2>
                    <span><i class="fas fa-map-marker-alt"></i> Em ${reserveName}</span>
                </div>
                <div class="grind-header-details">
                    <div class="detail-item"><i class="fas fa-trophy"></i><strong>Pont. Troféu:</strong><span>${hotspotInfo.maxScore || 'N/A'}</span></div>
                    <div class="detail-item"><i class="fas fa-weight-hanging"></i><strong>Peso Máx:</strong><span>${hotspotInfo.maxWeightEstimate || 'N/A'}</span></div>
                    <div class="detail-item"><i class="fas fa-clock"></i><strong>Bebida:</strong><span>${hotspotInfo.drinkZonesPotential || 'N/A'}</span></div>
                    <div class="detail-item"><i class="fas fa-crosshairs"></i><strong>Classe:</strong><span>${hotspotInfo.animalClass || 'N/A'}</span></div>
                    <div class="detail-item"><i class="fas fa-star"></i><strong>Nível Máx:</strong><span>${hotspotInfo.maxLevel || 'N/A'}</span></div>
                    <div class="detail-item"><button class="hotspot-button"><i class="fas fa-map-marked-alt"></i> Ver Mapa</button></div>
                </div>
            </div>
            <div class="counters-wrapper">
                <div class="grind-counter-item total-kills" data-type="total">
                    <div class="grind-counter-header"><img src="icones/caveira_icon.png" class="custom-icon" alt="Total de Abates"><span>Total de Abates</span></div>
                    <div class="grind-counter-body"><button class="grind-counter-btn decrease"><i class="fas fa-minus"></i></button><input type="number" class="grind-total-input" id="total-kills-input" value="${session.counts.total || 0}"><button class="grind-counter-btn increase"><i class="fas fa-plus"></i></button></div>
                </div>
                <div class="grind-counter-item diamond" data-type="diamonds"><div class="grind-counter-header"><img src="icones/diamante_icon.png" class="custom-icon" alt="Diamante"><span>Diamantes</span></div><div class="grind-counter-body"><button class="grind-counter-btn decrease"><i class="fas fa-minus"></i></button><span class="grind-counter-value">${session.counts.diamonds?.length || 0}</span><button class="grind-counter-btn increase"><i class="fas fa-plus"></i></button></div></div>
                <div class="grind-counter-item rare" data-type="rares" data-detailed="true"><div class="grind-counter-header"><img src="icones/pata_icon.png" class="custom-icon" alt="Raros"><span>Raros</span></div><div class="grind-counter-body"><button class="grind-counter-btn decrease"><i class="fas fa-minus"></i></button><span class="grind-counter-value">${session.counts.rares?.length || 0}</span><button class="grind-counter-btn increase"><i class="fas fa-plus"></i></button></div></div>
                <div class="grind-counter-item troll" data-type="trolls"><div class="grind-counter-header"><img src="icones/fantasma_icon.png" class="custom-icon" alt="Trolls"><span>Trolls</span></div><div class="grind-counter-body"><button class="grind-counter-btn decrease"><i class="fas fa-minus"></i></button><span class="grind-counter-value">${session.counts.trolls?.length || 0}</span><button class="grind-counter-btn increase"><i class="fas fa-plus"></i></button></div></div>
                <div class="grind-counter-item great-one" data-type="great_ones" data-detailed="true"><div class="grind-counter-header"><img src="icones/greatone_icon.png" class="custom-icon" alt="Great One"><span>Great One</span></div><div class="grind-counter-body"><button class="grind-counter-btn decrease"><i class="fas fa-minus"></i></button><span class="grind-counter-value">${session.counts.great_ones?.length || 0}</span><button class="grind-counter-btn increase"><i class="fas fa-plus"></i></button></div></div>
                <div class="grind-counter-item super-rare" data-type="super_raros" data-detailed="true"><div class="grind-counter-header"><img src="icones/coroa_icon.png" class="custom-icon" alt="Super Raros"><span>Super Raros</span></div><div class="grind-counter-body"><button class="grind-counter-btn decrease"><i class="fas fa-minus"></i></button><span class="grind-counter-value">${session.counts.super_raros?.length || 0}</span><button class="grind-counter-btn increase"><i class="fas fa-plus"></i></button></div></div>
            </div>
            <div class="zone-manager-container">
                <details>
                    <summary class="zone-manager-header">
                        <h3><i class="fas fa-map-pin"></i> Gerenciador de Zonas de Grind</h3>
                        <span class="zone-count-badge">${session.zones.length} Zonas</span>
                    </summary>
                    <div class="zone-manager-body">
                        <div class="add-zone-form">
                            <select id="zone-type-select"><option value="principal">Zona Principal</option><option value="secundaria">Zona Secundária</option><option value="solo">Zona Solo</option></select>
                            <input type="text" id="zone-name-input" placeholder="Nome da Zona (Ex: Lago Sul)">
                            <button id="add-zone-btn" class="back-button"><i class="fas fa-plus"></i> Adicionar Zona</button>
                        </div>
                        <div id="zone-list" class="zone-list"></div>
                    </div>
                </details>
            </div>
            <button id="delete-grind-btn" class="back-button">Excluir este Grind</button>
        </div>
    `;

    // --- LÓGICA DO GERENCIADOR DE ZONAS ---
    // (A sua lógica de zonas existente permanece aqui, sem alterações...)
    const zoneListContainer = container.querySelector('#zone-list');
    const renderZones = () => { /* ... sua função renderZones ... */ };
    const addZone = () => { /* ... sua função addZone ... */ };
    const addAnimalToZone = (zoneIndex) => { /* ... sua função addAnimalToZone ... */ };
    const updateAnimalQuantity = (zoneIndex, animalIndex, amount) => { /* ... sua função updateAnimalQuantity ... */ };
    container.querySelector('#add-zone-btn').addEventListener('click', addZone);
    zoneListContainer.addEventListener('click', (e) => { /* ... sua lógica de eventos de zona ... */ });
    renderZones();

    // --- INÍCIO DA LÓGICA DOS CONTADORES (QUE ESTAVA FALTANDO) ---
    container.querySelector('.hotspot-button').addEventListener('click', () => renderHotspotDetailModal(reserveKey, animalSlug));
    const totalInput = document.getElementById('total-kills-input');

    const saveTotalKills = () => {
        const newValue = parseInt(totalInput.value, 10);
        if (!isNaN(newValue) && newValue >= 0) {
            const currentSession = savedData.grindSessions.find(s => s.id === sessionId);
            if (currentSession && currentSession.counts.total !== newValue) {
                currentSession.counts.total = newValue;
                saveData(savedData);
            }
        }
    };

    totalInput.addEventListener('change', saveTotalKills);
    totalInput.addEventListener('blur', saveTotalKills);

    container.querySelector('.total-kills .increase').addEventListener('click', () => {
        totalInput.value = parseInt(totalInput.value, 10) + 1;
        saveTotalKills();
    });
    container.querySelector('.total-kills .decrease').addEventListener('click', () => {
        const currentValue = parseInt(totalInput.value, 10);
        if (currentValue > 0) {
            totalInput.value = currentValue - 1;
            saveTotalKills();
        }
    });

    // Adiciona funcionalidade aos botões + e - dos outros contadores
    container.querySelectorAll('.grind-counter-item:not(.total-kills) .grind-counter-btn').forEach(button => {
        button.addEventListener('click', async (e) => {
            e.stopPropagation();
            const isIncrease = button.classList.contains('increase');
            const counterItem = button.closest('.grind-counter-item');
            const type = counterItem.dataset.type;
            const isDetailed = counterItem.dataset.detailed === 'true';
            const currentSession = savedData.grindSessions.find(s => s.id === sessionId);
            if (!currentSession) return;
            if (!Array.isArray(currentSession.counts[type])) currentSession.counts[type] = [];

            if (isIncrease) {
                currentSession.counts.total++; // Sempre incrementa o total de abates
                totalInput.value = currentSession.counts.total; // Atualiza o campo visualmente
                
                const killCountForTrophy = currentSession.counts.total;

                // Para itens detalhados, abre um modal para adicionar informações
                if (isDetailed) {
                    openGrindDetailModal(sessionId, type, killCountForTrophy);
                    return; // Sai da função para não salvar duas vezes
                } else {
                    currentSession.counts[type].push({ id: Date.now(), killCount: killCountForTrophy });
                }
            } else { // Se for diminuir
                if (currentSession.counts[type].length > 0) {
                    const lastItem = currentSession.counts[type][currentSession.counts[type].length - 1];
                    const itemName = lastItem.variation || type.replace(/_s$/, '').replace('_', ' ');
                    
                    if (await showCustomAlert(`Tem certeza que deseja remover o último item: "${itemName}"?`, 'Confirmar Exclusão', true)) {
                        currentSession.counts[type].pop();
                    }
                }
            }
            saveData(savedData);
            renderGrindCounterView(sessionId); // Recarrega a view para mostrar os novos totais
        });
    });

    container.querySelector('#delete-grind-btn').addEventListener('click', async () => {
        if (await showCustomAlert(`Tem certeza que deseja excluir o grind de ${animalName} em ${reserveName}?`, 'Excluir Grind', true)) {
            const sessionIndex = savedData.grindSessions.findIndex(s => s.id === sessionId);
            if (sessionIndex > -1) {
                savedData.grindSessions.splice(sessionIndex, 1);
                saveData(savedData);
                renderMainView('grind');
            }
        }
    });
    // --- FIM DA LÓGICA DOS CONTADORES ---
}

function renderHuntingRankingView(container) {
    container.innerHTML = '';
    const panel = document.createElement('div');
    panel.id = 'hunting-ranking-panel';
    panel.innerHTML = `<div class="progress-v2-header"><h3>Classificação de Caça</h3><p>Seu ranking de troféus por espécie animal.</p></div>`;

    const animalScores = items.map(animalName => {
        const slug = slugify(animalName);
        let score = 0;
        let breakdown = { rares: 0, diamonds: 0, greats: 0 };
        
        breakdown.rares = Object.values(savedData.pelagens?.[slug] || {}).filter(v => v === true).length;
        breakdown.diamonds = (savedData.diamantes?.[slug] || []).length;
        breakdown.greats = Object.values(savedData.greats?.[slug]?.furs || {}).reduce((acc, fur) => acc + (fur.trophies?.length || 0), 0);
        
        // Sistema de Pontuação: Raro=1, Diamante=5, GreatOne=25
        score = (breakdown.rares * 1) + (breakdown.diamonds * 5) + (breakdown.greats * 25);
        
        return { name: animalName, slug, score, breakdown };
    }).filter(animal => animal.score > 0) // Mostra apenas animais com alguma pontuação
      .sort((a, b) => b.score - a.score);

    const rankingList = document.createElement('div');
    rankingList.className = 'hunting-ranking-list';

    if (animalScores.length === 0) {
        rankingList.innerHTML = '<p class="no-data-message">Nenhum troféu registrado para iniciar a classificação.</p>';
    } else {
        animalScores.forEach((animal, index) => {
            const item = document.createElement('div');
            item.className = 'ranking-item';
            item.innerHTML = `
                <div class="ranking-position">#${index + 1}</div>
                <img class="ranking-animal-icon" src="animais/${animal.slug}.png" onerror="this.style.display='none'">
                <div class="ranking-animal-name">${animal.name}</div>
                <div class="ranking-trophy-breakdown">
                    ${animal.breakdown.greats > 0 ? `<span><img src="icones/greatone_icon.png" class="custom-icon">${animal.breakdown.greats}</span>` : ''}
                    ${animal.breakdown.diamonds > 0 ? `<span><img src="icones/diamante_icon.png" class="custom-icon">${animal.breakdown.diamonds}</span>` : ''}
                    ${animal.breakdown.rares > 0 ? `<span><img src="icones/pata_icon.png" class="custom-icon">${animal.breakdown.rares}</span>` : ''}
                </div>
                <div class="ranking-score">${animal.score} pts</div>
            `;
            rankingList.appendChild(item);
        });
    }
    
    panel.appendChild(rankingList);
    container.appendChild(panel);
}

// ▲▲▲ FIM DO BLOCO NOVO ▲▲▲
// ▼▼▼ COLE ESTE NOVO BLOCO NO LUGAR DO ANTIGO ▼▼▼

function exportUserData() {
    if (!currentUser) {
        showCustomAlert('Você precisa estar logado para fazer o backup.', 'Aviso');
        return;
    }
    
    // Cria uma string JSON formatada a partir dos dados salvos
    const dataStr = JSON.stringify(savedData, null, 2);
    // Cria um objeto Blob, que é um objeto semelhante a um arquivo
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    // Cria uma URL temporária para o Blob
    const url = URL.createObjectURL(dataBlob);

    // Cria um link de download invisível
    const a = document.createElement('a');
    a.href = url;
    // Define o nome do arquivo de backup
    const date = new Date().toISOString().split('T')[0];
    a.download = `backup_registro_cacador_${date}.json`;
    
    // Simula um clique no link para iniciar o download
    document.body.appendChild(a);
    a.click();
    
    // Limpa o link e a URL da memória
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    showCustomAlert('Backup gerado com sucesso!', 'Backup Concluído');
}

// ▼▼▼ COLE ESTE NOVO BLOCO NO LUGAR DO ANTIGO ▼▼▼

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
                    if (typeof furs === 'object' && furs !== null) { // Adicionada verificação para não ser nulo
                        newData.pelagens[slug] = {}; // Inicia o objeto para o animal
                        for (const furName in furs) {
                            // SÓ ADICIONA SE A PELAGEM ESTIVER MARCADA COMO 'true'
                            if (furs[furName] === true) {
                                newData.pelagens[slug][furName] = true;
                            }
                        }
                    }
                }
            }

            // 2. Migração de Diamantes (convertendo de contagem para lista se necessário)
            if (importedData.diamantes && typeof importedData.diamantes === 'object') {
                const firstAnimalData = Object.values(importedData.diamantes)[0];
                if (firstAnimalData && !Array.isArray(firstAnimalData)) { // Detecta formato antigo (ex: "alce": 2)
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
                } else { // Formato novo ou vazio
                    newData.diamantes = importedData.diamantes;
                }
            }
            
            // 3. Migração de Greats e Super Raros (copiando diretamente)
            if (importedData.greats) newData.greats = importedData.greats;
            if (importedData.super_raros) newData.super_raros = importedData.super_raros;
            if (importedData.customMarkers) newData.customMarkers = importedData.customMarkers;

            // 4. Migração de Grind Sessions (convertendo contagens numéricas para listas)
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
});