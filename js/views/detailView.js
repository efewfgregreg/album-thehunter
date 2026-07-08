// =================================================================
// ARQUIVO: js/views/detailView.js
// =================================================================
import { slugify, createSafeImgTag } from '../utils.js';
import { closeModal } from '../auth.js'; 
import { rareFursData, greatsFursData, diamondFursData, items, animalHotspotData, reservesData } from '../../data/gameData.js';
import { categorias } from '../constants.js';
import { renderRoutineDetailView } from './routineView.js';
import { createGreatComboCard } from '../components/GreatComboCard.js';
// Importações do Maestre (main.js)
import { 
    savedData, 
    saveData, 
    showCustomAlert, 
    tabScrollPositions, 
    renderMainView,
    openImageViewer 
} from '../main.js';

// Importação do Motor de Histórico
import { pushHistory } from '../router.js';

// Importações de Lógica e outras Views
import { checkAndSetGreatOneCompletion, getAnimalCardStatus } from '../progressLogic.js';
import { showReserveDetailView } from './reserveView.js';

console.log("🚀 detailView.js CARREGADO - Versão V17 (Universal Migration Engine)");

let hasRunGlobalMigration = false;

/**
 * Normaliza, limpa e cura de forma robusta os dados de backups antigos.
 * Corrige erros de caixa alta/baixa, espaçamentos, digitação e unifica hífens/underlines globais.
 */
function normalizeAnimalLegacyData(currentSlug) {
    if (!savedData) return;

    const toCleanSlug = (str) => {
        return str ? str.toLowerCase()
                        .replace(/_/g, '-')
                        .normalize("NFD")
                        .replace(/[\u0300-\u036f]/g, "")
                        .trim() : "";
    };

    const healString = (val) => {
        if (typeof val !== 'string') return val;
        let clean = val.trim().replace(/\s+/g, ' ');
        // Correção cirúrgica de falhas gramaticais e de digitação identificadas no backup legado
        clean = clean.replace(/Mariação/g, 'Variação');
        clean = clean.replace(/Macho amarelado/g, 'Macho Amarelado');
        clean = clean.replace(/Fêmea rosa/g, 'Fêmea Rosa');
        clean = clean.replace(/preto e dourado/g, 'Preto e Dourado');
        return clean;
    };

    const categoriasSaves = ['pelagens', 'diamantes', 'super_raros', 'greats', 'greatOnes'];

    // Varrimento preventivo completo efetuado na inicialização para erradicar o problema do Lazy Load
    if (!hasRunGlobalMigration) {
        hasRunGlobalMigration = true;
        categoriasSaves.forEach(category => {
            if (savedData[category] && typeof savedData[category] === 'object' && !Array.isArray(savedData[category])) {
                const newCategoryNode = {};
                
                Object.entries(savedData[category]).forEach(([oldKey, oldVal]) => {
                    const standardizedKey = toCleanSlug(oldKey);
                    
                    let curedVal = oldVal;
                    if (oldVal && typeof oldVal === 'object' && !Array.isArray(oldVal)) {
                        curedVal = {};
                        Object.entries(oldVal).forEach(([innerKey, innerVal]) => {
                            curedVal[healString(innerKey)] = innerVal;
                        });
                    } else if (Array.isArray(oldVal)) {
                        curedVal = oldVal.map(item => {
                            if (item && typeof item === 'object' && item.type) {
                                return { ...item, type: healString(item.type) };
                            }
                            return typeof item === 'string' ? healString(item) : item;
                        });
                    }

                    if (!newCategoryNode[standardizedKey]) {
                        newCategoryNode[standardizedKey] = curedVal;
                    } else {
                        if (Array.isArray(curedVal) && Array.isArray(newCategoryNode[standardizedKey])) {
                            newCategoryNode[standardizedKey] = [...newCategoryNode[standardizedKey], ...curedVal];
                        } else if (typeof curedVal === 'object') {
                            newCategoryNode[standardizedKey] = { ...newCategoryNode[standardizedKey], ...curedVal };
                        }
                    }
                });

                // Consolida e espelha bidirecionalmente (hífen e underline) todas as coleções migradas
                Object.entries(newCategoryNode).forEach(([cleanKey, cleanVal]) => {
                    savedData[category][cleanKey] = cleanVal;
                    const underscoreKey = cleanKey.replace(/-/g, '_');
                    savedData[category][underscoreKey] = JSON.parse(JSON.stringify(cleanVal));
                });
            }
        });

        if (Array.isArray(savedData.grindSessions)) {
            savedData.grindSessions.forEach(session => {
                if (session.animalSlug) {
                    session.animalSlug = toCleanSlug(session.animalSlug);
                }
            });
        }
    }

    // Garante a integridade e sincronismo no ciclo de vida atual da visualização ativa
    const targetSlug = toCleanSlug(currentSlug);
    if (!targetSlug) return;
    const legacySlug = targetSlug.replace(/-/g, '_'); 

    categoriasSaves.forEach(category => {
        if (savedData[category] && savedData[category][targetSlug]) {
            savedData[category][legacySlug] = JSON.parse(JSON.stringify(savedData[category][targetSlug]));
        }
    });
}

// =================================================================
// =================== LÓGICA DE NAVEGAÇÃO =========================
// =================================================================

export function showDetailView(name, tabKey, originReserveKey = null, addToHistory = true) {
    const slug = slugify(name);
    
    // Executa a higienização de chaves antigas antes de renderizar qualquer componente visual
    normalizeAnimalLegacyData(slug);

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

/**
 * Renderiza a visualização de detalhes simples (acesso direto pelo menu)
 */
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

    // Gerenciamento de Filtros
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
        'greats': renderGreatsDetailView,
        'rotina': renderRoutineDetailView
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

// =================================================================
// =================== LÓGICA DE NAVEGAÇÃO =========================
// =================================================================

/**
 * Renderiza o dossiê completo de um animal (acesso via reserva)
 * Versão V3: Header Limpo e Sem Hotspots
 */
function renderAnimalDossier(animalName, originReserveKey) {
    const mainContent = document.querySelector('.main-content');
    const slug = slugify(animalName);
    const contentContainer = mainContent.querySelector('.content-container');
    
    contentContainer.className = 'content-container dossier-view';
    contentContainer.innerHTML = '';
    
    mainContent.querySelector('.page-header h2').textContent = `${animalName.toUpperCase()}`;

    const backButton = mainContent.querySelector('.page-header .back-button');
    const isRoutineFlow = document.querySelector('.routine-population-container');

    if (isRoutineFlow) {
        backButton.innerHTML = `&larr; Voltar para Animais`;
        backButton.onclick = () => {
            import('./routineHubView.js').then(module => {
                module.renderAnimalSelector(contentContainer, originReserveKey, null);
            });
        };
    } else {
        backButton.innerHTML = `&larr; Voltar para ${reservesData[originReserveKey]?.name || 'Reservas'}`;
        backButton.onclick = () => showReserveDetailView(originReserveKey);
    }

    const filterContainer = document.createElement('div');
    filterContainer.className = 'filter-toggle-container';
    
    const btnShowAll = document.createElement('button');
    btnShowAll.className = 'filter-toggle-btn active';
    btnShowAll.innerHTML = '<i class="fas fa-th-large"></i> Mostrar Todos';
    
    const btnShowMissing = document.createElement('button');
    btnShowMissing.className = 'filter-toggle-btn';
    btnShowMissing.innerHTML = '<i class="fas fa-eye-slash"></i> Mostrar Faltantes';
    
    filterContainer.appendChild(btnShowAll);
    filterContainer.appendChild(btnShowMissing);
    
    const dossierTabs = document.createElement('div');
    dossierTabs.className = 'dossier-tabs';
    
    const dossierContent = document.createElement('div');
    dossierContent.className = 'dossier-content';
    
    contentContainer.appendChild(filterContainer);
    contentContainer.appendChild(dossierTabs);
    contentContainer.appendChild(dossierContent);
    
    const tabs = {
        pelagens: { title: 'Pelagens Raras', renderFunc: renderRareFursDetailView },
        diamantes: { title: 'Diamantes', renderFunc: renderDiamondsDetailView },
        super_raros: { title: 'Super Raros', renderFunc: renderSuperRareDetailView },
        rotina: { title: '<i class="fas fa-clock"></i> Rotina & População', renderFunc: renderRoutineDetailView }
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
                renderFunc(dossierContent, animalName, slug, originReserveKey, filter);
            }
        }
    };
    
    dossierTabs.addEventListener('click', e => {
        const tab = e.target.closest('.dossier-tab');
        if(!tab) return;
        dossierTabs.querySelectorAll('.dossier-tab').forEach(t => t.classList.remove('active'));
        tab.classList.add('active');
        const currentFilter = btnShowAll.classList.contains('active') ? 'all' : 'missing';
        filterContainer.style.display = 'flex'; 
        reRenderActiveTab(currentFilter);
    });

    btnShowAll.onclick = () => {
        btnShowAll.classList.add('active');
        btnShowMissing.classList.remove('active');
        reRenderActiveTab('all');
    };

    btnShowMissing.onclick = () => {
        btnShowMissing.classList.add('active');
        btnShowAll.classList.remove('active');
        reRenderActiveTab('missing');
    };

    dossierTabs.querySelector('.dossier-tab').click();
}

// =================================================================
// ============ LÓGICA DE CARDS E ATUALIZAÇÃO VISUAL ==============
// =================================================================

export function updateCardAppearance(card, slug, tabKey) {
    if (!card) return;

    card.classList.remove('completed', 'inprogress', 'incomplete', 'is-completed');
    const progressBar = card.querySelector('.progress-bar');
    
    const stats = getAnimalCardStatus(slug, tabKey, savedData);
    
    // Intercepção tática para manter o brilho e progresso de Great Ones vindos de backups legados
    if (tabKey === 'greats' && stats.collected === 0) {
        const targetSlug = slug.toLowerCase().replace(/_/g, '-');
        const legacySlug = slug.toLowerCase().replace(/-/g, '_');
        const trophiesCount = savedData.greats?.[targetSlug]?.trophies?.length || savedData.greats?.[legacySlug]?.trophies?.length || 0;
        
        if (trophiesCount > 0) {
            stats.collected = trophiesCount;
            stats.status = 'inprogress';
        }
    }

    card.classList.add(stats.status);

    if (stats.total > 0) {
        const displayCollected = Math.min(stats.collected, stats.total);
        const percentage = (displayCollected / stats.total) * 100;
        
        if (progressBar) {
            progressBar.style.width = `${percentage}%`;
        }

        if (percentage >= 100) {
            card.classList.add('is-completed');
        }
    }
}

// =================================================================
// ============ RENDERIZADORES DE CONTEÚDO ESPECÍFICO =============
// =================================================================

function renderRareFursDetailView(container, name, slug, originReserveKey = null, filter = 'all') {
    container.innerHTML = '';
    const speciesData = rareFursData[slug];

    if (!speciesData) {
        container.innerHTML = '<p class="no-data-message">Nenhuma pelagem rara listada.</p>';
        return;
    }

    const renderSection = (genderKey, label) => {
        const furs = speciesData[genderKey] || [];
        if (furs.length === 0) return;

        const processedFurs = furs.map(fur => {
            const displayName = `${label} ${fur}`;
            return {
                displayName,
                originalName: fur,
                gender: genderKey,
                isCompleted: savedData.pelagens?.[slug]?.[displayName] === true
            };
        });

        const filteredFurs = filter === 'missing' ? processedFurs.filter(f => !f.isCompleted) : processedFurs;
        if (filteredFurs.length === 0 && filter === 'missing') return;

        const collectedCount = processedFurs.filter(f => f.isCompleted).length;
        const totalCount = processedFurs.length;
        const percentage = (collectedCount / totalCount) * 100;

        const sectionHeader = document.createElement('div');
        sectionHeader.className = 'gender-section-header';
        sectionHeader.innerHTML = `
            <div class="header-info">
                <h3>${label}s</h3>
                <span class="count-badge">${collectedCount}/${totalCount}</span>
            </div>
            <div class="mini-progress-track">
                <div class="mini-progress-fill" style="width: ${percentage}%"></div>
            </div>
        `;
        container.appendChild(sectionHeader);

        const furGrid = document.createElement('div');
        furGrid.className = 'fur-grid';
        container.appendChild(furGrid);

        filteredFurs.forEach(furInfo => {
            const furSlug = slugify(furInfo.originalName);
            const imgTag = createSafeImgTag(
                `animais/pelagens/${slug}_${furSlug}_${genderKey}.png`,
                `animais/pelagens/${slug}_${furSlug}.png`,
                `animais/${slug}.png`,
                furInfo.displayName
            );

            const card = document.createElement('div');
            card.className = `fur-card ${furInfo.isCompleted ? 'completed' : 'incomplete'}`;
            card.innerHTML = `
                <div class="card-image-wrapper">${imgTag}</div>
                <div class="info-header">
                    <div class="info">${furInfo.originalName}</div>
                </div>
                <button class="fullscreen-btn" title="Ver em tela cheia">⛶</button>
                ${furInfo.isCompleted ? '<div class="check-badge"><i class="fas fa-check"></i></div>' : ''}
            `;

            card.addEventListener('click', () => {
                if (!savedData.pelagens) savedData.pelagens = {};
                if (!savedData.pelagens[slug]) savedData.pelagens[slug] = {};
                
                savedData.pelagens[slug][furInfo.displayName] = !furInfo.isCompleted;
                saveData(savedData);
                
                if (originReserveKey) reRenderActiveDossierTab(originReserveKey, name, slug);
                else renderRareFursDetailView(container, name, slug, null, filter);
            });

            card.querySelector('.fullscreen-btn').onclick = (e) => {
                e.stopPropagation();
                const imgUrl = card.querySelector('img').src;
                openImageViewer(imgUrl, `${name}: ${furInfo.originalName}`);
            };

            furGrid.appendChild(card);
        });
    };

    renderSection('macho', 'Macho');
    renderSection('femea', 'Fêmea');
}

// =================================================================
// ============ RENDERIZADORES: ABA DIAMANTES (V2) ================
// =================================================================

function renderDiamondsDetailView(container, name, slug, originReserveKey = null, filter = 'all') {
    container.innerHTML = '';
    const speciesDiamondFurs = diamondFursData[slug];

    if (!speciesDiamondFurs) {
        container.innerHTML = '<p class="no-data-message">Nenhum diamante listado para esta espécie.</p>';
        return;
    }

    const renderDiamondSection = (genderKey, label) => {
        const furs = speciesDiamondFurs[genderKey] || [];
        if (furs.length === 0) return;

        const processedFurs = furs.map(fur => {
            const fullTrophyName = `${label} ${fur}`;
            const highestTrophy = (savedData.diamantes?.[slug] || [])
                .filter(t => t.type === fullTrophyName)
                .reduce((max, t) => t.score > max.score ? t : max, { score: -1 });

            return {
                displayName: fur,
                fullTrophyName: fullTrophyName,
                originalName: fur,
                gender: genderKey,
                isCompleted: highestTrophy.score !== -1,
                score: highestTrophy.score
            };
        });

        const filteredFurs = filter === 'missing' ? processedFurs.filter(f => !f.isCompleted) : processedFurs;
        if (filteredFurs.length === 0 && filter === 'missing') return;

        const collectedCount = processedFurs.filter(f => f.isCompleted).length;
        const totalCount = processedFurs.length;
        const percentage = (collectedCount / totalCount) * 100;

        const sectionHeader = document.createElement('div');
        sectionHeader.className = 'gender-section-header diamond-theme';
        sectionHeader.innerHTML = `
            <div class="header-info">
                <h3>${label}s Diamante</h3>
                <span class="count-badge">${collectedCount}/${totalCount}</span>
            </div>
            <div class="mini-progress-track">
                <div class="mini-progress-fill" style="width: ${percentage}%"></div>
            </div>
        `;
        container.appendChild(sectionHeader);

        const furGrid = document.createElement('div');
        furGrid.className = 'fur-grid';
        container.appendChild(furGrid);

        filteredFurs.forEach(furInfo => {
            const furSlug = slugify(furInfo.originalName);
            const imgTag = createSafeImgTag(
                `animais/pelagens/${slug}_${furSlug}_${genderKey}.png`,
                `animais/pelagens/${slug}_${furSlug}.png`,
                `animais/${slug}.png`,
                furInfo.displayName
            );

            const card = document.createElement('div');
            card.className = `fur-card diamond-card ${furInfo.isCompleted ? 'completed' : 'incomplete'}`;
            card.innerHTML = `
                <div class="card-image-wrapper">${imgTag}</div>
                <div class="info-header">
                    <div class="info">${furInfo.displayName}</div>
                </div>
                <div class="score-container">
                    ${furInfo.isCompleted 
                        ? `<span class="score-display"><i class="fas fa-gem"></i> ${furInfo.score}</span>` 
                        : '<span class="score-add-btn">Add Score</span>'}
                </div>
                <button class="fullscreen-btn" title="Ver em tela cheia">⛶</button>
                ${furInfo.isCompleted ? '<div class="check-badge diamond"><i class="fas fa-check"></i></div>' : ''}
            `;

            card.querySelector('.score-container').onclick = (e) => {
                e.stopPropagation();
                const scoreBox = card.querySelector('.score-container');
                if (scoreBox.querySelector('input')) return;
                
                scoreBox.innerHTML = `<input type="number" class="score-input" value="${furInfo.isCompleted ? furInfo.score : ''}" placeholder="0.0" step="0.1">`;
                const input = scoreBox.querySelector('.score-input');
                input.focus();
                
                const saveScore = () => {
                    const val = parseFloat(input.value);
                    if (!savedData.diamantes) savedData.diamantes = {};
                    if (!savedData.diamantes[slug]) savedData.diamantes[slug] = [];
                    
                    savedData.diamantes[slug] = savedData.diamantes[slug].filter(t => t.type !== furInfo.fullTrophyName);
                    if (!isNaN(val) && val > 0) {
                        savedData.diamantes[slug].push({ id: Date.now(), type: furInfo.fullTrophyName, score: val });
                    }
                    
                    saveData(savedData);
                    if (originReserveKey) reRenderActiveDossierTab(originReserveKey, name, slug);
                    else renderDiamondsDetailView(container, name, slug, null, filter);
                };
                
                input.onblur = saveScore;
                input.onkeydown = (ev) => { if(ev.key === 'Enter') saveScore(); };
            };

            card.querySelector('.fullscreen-btn').onclick = (e) => {
                e.stopPropagation();
                openImageViewer(card.querySelector('img').src, `${name}: ${furInfo.displayName} (Diamante)`);
            };

            furGrid.appendChild(card);
        });
    };

    renderDiamondSection('macho', 'Macho');
    renderDiamondSection('femea', 'Fêmea');
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
        speciesRareFurs.macho.forEach(fur => fursToDisplay.push({ displayName: `Macho ${fur}`, originalName: fur, gender: 'macho' }));
    }
    if (speciesRareFurs?.femea && (speciesDiamondData?.femea?.length || 0) > 0) {
        speciesRareFurs.femea.forEach(fur => fursToDisplay.push({ displayName: `Fêmea ${fur}`, originalName: fur, gender: 'femea' }));
    }

    if (fursToDisplay.length === 0) {
        furGrid.innerHTML = '<p class="no-data-message">Nenhuma pelagem Super Rara para este animal.</p>';
        return;
    }

    fursToDisplay.sort((a, b) => a.displayName.localeCompare(b.displayName)).forEach(furInfo => {
        const isCompleted = savedData.super_raros?.[slug]?.[furInfo.displayName] === true;
        if (filter === 'missing' && isCompleted) return;

        const animalSlug = slugify(name);
        const furSlug = slugify(furInfo.originalName);
        const genderKey = furInfo.gender.toLowerCase();

        const imgTag = createSafeImgTag(
            `animais/pelagens/${animalSlug}_${furSlug}_${genderKey}.png`,
            `animais/pelagens/${animalSlug}_${furSlug}.png`,
            `animais/${animalSlug}.png`,
            furInfo.displayName
        );

        const card = document.createElement('div');
        card.className = `fur-card super-rare-card ${isCompleted ? 'completed' : 'incomplete'}`;
        card.innerHTML = `
            ${imgTag}
            <div class="info-header"><div class="info">${furInfo.displayName}</div></div>
            <button class="fullscreen-btn" title="Ver em tela cheia">⛶</button>
        `;

        card.addEventListener('click', () => {
            if (!savedData.super_raros) savedData.super_raros = {};
            if (!savedData.super_raros[slug]) savedData.super_raros[slug] = {};
            const newState = !savedData.super_raros[slug][furInfo.displayName];
            savedData.super_raros[slug][furInfo.displayName] = newState;
            saveData(savedData);
            if (originReserveKey) reRenderActiveDossierTab(originReserveKey, name, slug);
            else card.classList.toggle('completed');
        });

        card.querySelector('.fullscreen-btn').onclick = (e) => {
            e.stopPropagation();
            openImageViewer(card.querySelector('img').src);
        };

        furGrid.appendChild(card);
    });
}

// =================================================================
// ============ ARQUITETURA DE MIGRAÇÃO DE SAVES ANTIGOS ===========
// =================================================================

/**
 * Motor de Migração Refinado - Garantia de Integridade para Registros Legados
 * Processa a transição de arquivos antigos para o formato unificado de troféus.
 */
export function migrateGreatOnesSaveData(slug) {
    if (!savedData || !savedData.greats) return;
    
    const slugWithUnderscore = slug.replace(/-/g, '_');
    const slugWithHyphen = slug.replace(/_/g, '-');
    const targetSlug = slugWithHyphen; 
    
    let speciesNode = savedData.greats[targetSlug] || 
                      savedData.greats[slugWithUnderscore];

    if (!speciesNode) {
        savedData.greats[targetSlug] = { trophies: [] };
        savedData.greats[slugWithUnderscore] = { trophies: [] };
        return;
    }

    if (!speciesNode.trophies) speciesNode.trophies = [];

    const getSpeciesDataFlexibly = (dataSource, currentSlug) => {
        if (!dataSource) return [];
        if (dataSource[currentSlug]) return dataSource[currentSlug];
        const clean = (s) => s.toLowerCase().replace(/[^a-z0-9]/g, '');
        const target = clean(currentSlug);
        const matchKey = Object.keys(dataSource).find(k => clean(k) === target);
        return matchKey ? dataSource[matchKey] : [];
    };

    const officialFursList = getSpeciesDataFlexibly(greatsFursData, targetSlug);
    
    const normalizeForMatch = (str) => {
        if (!str) return "";
        return str.toLowerCase()
            .normalize("NFD")
            .replace(/[\u0300-\u036f]/g, "")
            .replace(/\s*[Ll]endári[oa]\s*/g, "")
            .replace(/[^a-z0-9]/g, "")
            .trim();
    };

    const findOfficialFurName = (legacyName) => {
        if (!legacyName) return legacyName;
        const normalizedLegacy = normalizeForMatch(legacyName);
        
        // 1ª Passada: Busca estrita e exata pela pelagem pura oficial
        for (const item of officialFursList) {
            if (typeof item === 'string') {
                if (normalizeForMatch(item) === normalizedLegacy) return item;
            } else if (item && typeof item === 'object' && item.pelagem) {
                if (normalizeForMatch(item.pelagem) === normalizedLegacy) return item.pelagem;
            }
        }
        
        // 2ª Passada: Fallback tático executado APENAS se o registro legado contiver marcas de combo
        if (legacyName.includes('-') || legacyName.includes('(')) {
            for (const item of officialFursList) {
                if (item && typeof item === 'object' && item.combo) {
                    if (normalizeForMatch(item.combo) === normalizedLegacy || normalizeForMatch(item.combo).includes(normalizedLegacy)) {
                        return item.pelagem;
                    }
                }
            }
        }
        return legacyName;
    };

    // 1. Identificar com precisão cirúrgica quais pelagens realmente possuem registros de troféus legítimos
    const trulyRegisteredFurs = new Set();
    
    if (speciesNode.trophies && Array.isArray(speciesNode.trophies)) {
        speciesNode.trophies.forEach(t => {
            if (t.furName) trulyRegisteredFurs.add(normalizeForMatch(t.furName));
        });
    }

    if (speciesNode.furs) {
        Object.entries(speciesNode.furs).forEach(([rawFurName, furData]) => {
            if (furData && Array.isArray(furData.trophies) && furData.trophies.length > 0) {
                let officialFurName = findOfficialFurName(rawFurName);
                trulyRegisteredFurs.add(normalizeForMatch(officialFurName));
            }
        });
    }

    // 2. Processamento de Furs Legadas (Auto-cura e extração seletiva de Grind)
    if (speciesNode.furs) {
        Object.entries(speciesNode.furs).forEach(([rawFurName, furData]) => {
            if (furData && Array.isArray(furData.trophies)) {
                let officialFurName = findOfficialFurName(rawFurName);
                
                furData.trophies.forEach(oldTrophy => {
                    const isDuplicate = speciesNode.trophies.some(t => 
                        t.date === (oldTrophy.date || '') && 
                        (t.stats?.kills === (parseInt(oldTrophy.stats?.kills || oldTrophy.abates || 0)))
                    );

                    if (!isDuplicate) {
                        speciesNode.trophies.push({
                            id: oldTrophy.id || Date.now() + Math.random(),
                            date: oldTrophy.date || new Date().toISOString(),
                            furName: officialFurName,
                            variation: oldTrophy.variation || oldTrophy.variacao || null,
                            stats: {
                                kills: parseInt(oldTrophy.stats?.kills || oldTrophy.abates || 0),
                                diamonds: parseInt(oldTrophy.stats?.diamonds || oldTrophy.diamantes || 0),
                                rares: parseInt(oldTrophy.stats?.rares || oldTrophy.pelesRaras || 0),
                                trolls: parseInt(oldTrophy.stats?.trolls || 0)
                            }
                        });
                    }
                });
            }
        });
        delete speciesNode.furs;
    }

    // 3. ENGENHARIA DE SINCRONIZAÇÃO DO CHECKLIST COM PURGA ABSOLUTA DE COMBOS FANTASMAS
    if (!savedData.greatOnes) savedData.greatOnes = {};
    
    const checklistItems = [
        ...(savedData.greatOnes[targetSlug] || []),
        ...(savedData.greatOnes[slugWithUnderscore] || [])
    ];
    
    const consolidatedItems = [];
    
    // Filtra o checklist legado mantendo APENAS pelagens puras validadas com troféus existentes
    checklistItems.forEach(item => {
        if (typeof item === 'string') {
            // Expuga imediatamente qualquer combo corrompido herdado de migrações anteriores
            if (item.includes(' - ') || item.includes(' (')) return;
            
            const officialName = findOfficialFurName(item);
            if (trulyRegisteredFurs.has(normalizeForMatch(officialName))) {
                if (!consolidatedItems.includes(officialName)) {
                    consolidatedItems.push(officialName);
                }
            }
        }
    });

    // Sincroniza os troféus legítimos ativos para alimentar o checklist e os combos reais
    speciesNode.trophies.forEach(t => {
        const officialName = findOfficialFurName(t.furName);
        if (trulyRegisteredFurs.has(normalizeForMatch(officialName))) {
            if (!consolidatedItems.includes(officialName)) {
                consolidatedItems.push(officialName);
            }
        }
        
        // Só reconstrói e marca o ID de combo se o troféu possuir uma variação explícita (cadastrada na nova versão)
        if (t.variation) {
            const matchCombo = officialFursList.find(c => 
                typeof c === 'object' && 
                normalizeForMatch(c.pelagem) === normalizeForMatch(officialName) && 
                normalizeForMatch(c.variacao) === normalizeForMatch(t.variation)
            );
            const targetComboId = matchCombo && matchCombo.combo ? matchCombo.combo : `${officialName} - ${t.variation}`;
            if (!consolidatedItems.includes(targetComboId)) {
                consolidatedItems.push(targetComboId);
            }
        }
    });

    const uniqueConsolidated = [...new Set(consolidatedItems)];
    
    savedData.greatOnes[targetSlug] = uniqueConsolidated;
    savedData.greatOnes[slugWithUnderscore] = uniqueConsolidated;

    savedData.greats[targetSlug] = speciesNode;
    savedData.greats[slugWithUnderscore] = JSON.parse(JSON.stringify(speciesNode));

    saveData(savedData);
}

// =================================================================
// ============ HISTÓRICO / ARQUIVO TÁTICO DE ABATES ==============
// =================================================================

export function renderGreatOneHistoryView(container, animalName, slug, furName, originReserveKey) {
    migrateGreatOnesSaveData(slug);

    const slugWithUnderscore = slug.replace(/-/g, '_');
    const slugWithHyphen = slug.replace(/_/g, '-');

    if (!savedData.greats) savedData.greats = {};
    const speciesNode = savedData.greats[slugWithHyphen] || savedData.greats[slugWithUnderscore] || { trophies: [] };

    // Sincronização profilática preventiva bidirecional de nós de histórico
    savedData.greats[slugWithHyphen] = speciesNode;
    savedData.greats[slugWithUnderscore] = speciesNode;

    if (!speciesNode.trophies) speciesNode.trophies = [];

    const normalizeMatch = (s) => s ? s.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-z0-9]/g, "").trim() : "";
    
    // Algoritmo Fuzzy Resolutor de Nomes Curtos de Combos vs Pelagens Longas (Caso Veado-Mula / Veado-Vermelho)
    const officialFursList = greatsFursData[slugWithUnderscore] || greatsFursData[slugWithHyphen] || [];
    let targetOfficialFur = furName.split(' - ')[0].split(' (')[0].trim();
    const normInput = normalizeMatch(targetOfficialFur);

    for (const item of officialFursList) {
        if (typeof item === 'string' && (normalizeMatch(item).includes(normInput) || normInput.includes(normalizeMatch(item)))) {
            targetOfficialFur = item;
            break;
        } else if (item && typeof item === 'object') {
            if (normalizeMatch(item.pelagem).includes(normInput) || normInput.includes(normalizeMatch(item.pelagem)) || normalizeMatch(item.combo).includes(normInput) || normInput.includes(normalizeMatch(item.combo))) {
                targetOfficialFur = item.pelagem;
                break;
            }
        }
    }

    const allTrophies = speciesNode.trophies;
    const trophies = allTrophies.filter(t => normalizeMatch(t.furName) === normalizeMatch(targetOfficialFur));
    
    // Declaração de aliasing para manter a integridade referencial dos templates HTML e modais filhos
    const baseFurName = targetOfficialFur;

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
                <div class="go-fur-tag" style="background: rgba(163, 51, 200, 0.15) !important; border: 1px solid #a333c8 !important; color: #fff !important;"><i class="fas fa-crown" style="color: #ffc107;"></i> ${baseFurName.toUpperCase()}</div>
            </div>
            
            <div class="go-header-stats-row">
                <div class="go-stat-badge">
                    <span class="lbl">REGISTROS</span>
                    <span class="val">${trophies.length}</span>
                </div>
            </div>
        </div>
        
        <div class="go-controls-bar centered-controls">
            <button id="btn-add-entry" class="action-btn-primary" style="background: #a333c8 !important; border-color: #a333c8 !important; box-shadow: 0 0 15px rgba(163,51,200,0.4) !important;">
                <i class="fas fa-plus"></i> NOVO REGISTRO
            </button>
            <p class="info-text-centered"><i class="fas fa-info-circle"></i> Gerencie seus abates individuais abaixo.</p>
        </div>
    `;
    
    const gridContainer = document.createElement('div');
    gridContainer.className = 'go-history-grid';

    if (trophies.length === 0) {
        gridContainer.innerHTML = `
            <div class="empty-state-container">
                <div class="empty-icon-circle"><i class="fas fa-folder-open"></i></div>
                <h3 class="empty-state-title">Histórico Vazio</h3>
                <p class="empty-state-message">Adicione seu primeiro registro de grind para esta pelagem.</p>
            </div>`;
    } else {
        const sortedTrophies = [...trophies].sort((a, b) => new Date(b.date) - new Date(a.date));
        
        sortedTrophies.forEach((t) => {
            const globalIndex = allTrophies.indexOf(t);
            const stats = t.stats || { kills: 0, diamonds: 0, trolls: 0, rares: 0 };
            const dateStr = t.date ? new Date(t.date).toLocaleDateString() : '--/--';
            
            const cardElement = document.createElement('div');
            cardElement.className = 'go-history-item-card v2';
            
            cardElement.innerHTML = `
                <div class="card-top-bar">
                    <div class="card-date"><i class="far fa-calendar-alt"></i> ${dateStr}</div>
                    <div style="display: flex; gap: 8px;">
                        <button class="btn-edit-item" title="Editar Galhada/Métricas" style="background: rgba(255,193,7,0.1); border: 1px solid rgba(255,193,7,0.3); color: #ffc107; padding: 4px 8px; border-radius: 4px; cursor: pointer; transition: all 0.2s;"><i class="fas fa-edit"></i></button>
                        <button class="btn-delete-item" title="Excluir" style="background: rgba(255,82,82,0.1); border: 1px solid rgba(255,82,82,0.3); color: #ff5252; padding: 4px 8px; border-radius: 4px; cursor: pointer; transition: all 0.2s;"><i class="fas fa-trash-alt"></i></button>
                    </div>
                </div>
                
                <div class="card-main-stat">
                    <span class="stat-value-big">${stats.kills}</span>
                    <span class="stat-label-big">ABATES</span>
                </div>

                ${t.variation ? `
                    <div class="card-variation-badge" style="margin: -5px 0 10px 0; font-family:'Bebas Neue', sans-serif; font-size:0.9rem; color:#ffc107; text-align:center; background:rgba(255,193,7,0.06); padding:4px; border-radius:4px; border:1px solid rgba(255,193,7,0.15); letter-spacing:0.5px;">
                        <i class="fas fa-crown"></i> ${t.variation.toUpperCase()}
                    </div>
                ` : `
                    <div class="card-variation-badge legacy-pending" style="margin: -5px 0 10px 0; font-family:'Bebas Neue', sans-serif; font-size:0.85rem; color:#888; text-align:center; background:rgba(255,255,255,0.02); padding:4px; border-radius:4px; border:1px solid rgba(255,255,255,0.05); letter-spacing:0.5px; border-style: dashed;">
                        <i class="fas fa-exclamation-triangle"></i> GALHADA NÃO INFORMADA
                    </div>
                `}

                <div class="card-footer-grid">
                    <div class="stat-pill dia ${stats.diamonds > 0 ? 'active' : ''}">
                        <i class="fas fa-gem"></i> <span>${stats.diamonds}</span>
                    </div>
                    <div class="stat-pill rare ${stats.rares > 0 ? 'active' : ''}">
                        <i class="fas fa-paw"></i> <span>${stats.rares}</span>
                    </div>
                    <div class="stat-pill troll ${stats.trolls > 0 ? 'active' : ''}">
                        <i class="fas fa-ghost"></i> <span>${stats.trolls}</span>
                    </div>
                </div>
            `;
            
            // Evento de Clique para Editar o Registro Existente
            cardElement.querySelector('.btn-edit-item').onclick = () => {
                openAddEntryModal(animalName, baseFurName, (updatedData) => {
                    // Mescla as atualizações de forma cirúrgica na referência original da memória
                    t.date = updatedData.date;
                    t.variation = updatedData.variation;
                    t.stats = updatedData.stats;

                    // Atualização Cruzada Inteligente: Sincroniza retroativamente os cards das abas
                    if (t.variation) {
                        const rawFursData = greatsFursData[slug] || [];
                        const normalize = (str) => str ? str.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").trim() : "";
                        const matchCombo = rawFursData.find(c => {
                            if (typeof c !== 'object') return false;
                            const cPelagem = c.pelagem ? normalize(c.pelagem) : (c.combo ? normalize(c.combo.split('-')[0]) : "");
                            const cVariacao = c.variacao ? normalize(c.variacao) : (c.combo && c.combo.includes('-') ? normalize(c.combo.split('-')[1]) : "");
                            return cPelagem === normalize(baseFurName) && cVariacao === normalize(t.variation);
                        });
                        const targetComboId = matchCombo && matchCombo.combo ? matchCombo.combo : `${baseFurName} - ${t.variation}`;
                        if (!savedData.greatOnes[slug].includes(targetComboId)) {
                            savedData.greatOnes[slug].push(targetComboId);
                        }
                    }

                    saveData(savedData);
                    checkAndSetGreatOneCompletion(slug, savedData.greatOnes[slug]);
                    renderGreatOneHistoryView(container, animalName, slug, furName, originReserveKey);
                }, t); // <-- Injeta a referência do troféu para ativar o Modo de Edição
            };

            const deleteBtn = cardElement.querySelector('.btn-delete-item');
            if (deleteBtn) {
                deleteBtn.onclick = async () => {
                    if (await showCustomAlert('Excluir este registro?', 'Confirmar', true)) {
                        allTrophies.splice(globalIndex, 1);
                        saveData(savedData);
                        if (savedData.greatOnes?.[slug]) checkAndSetGreatOneCompletion(slug, savedData.greatOnes[slug]);
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
            openAddEntryModal(animalName, baseFurName, (newEntry) => {
                newEntry.id = Date.now();
                newEntry.furName = baseFurName;
                allTrophies.push(newEntry);
                
                if (!savedData.greatOnes) savedData.greatOnes = {};
                if (!savedData.greatOnes[slug]) savedData.greatOnes[slug] = [];
                
                if (!savedData.greatOnes[slug].includes(baseFurName)) {
                    savedData.greatOnes[slug].push(baseFurName);
                }
                
                if (newEntry.variation) {
                    const normalize = (str) => str ? str.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").trim() : "";
                    const matchCombo = (greatsFursData[slug] || []).find(c => {
                        if (typeof c !== 'object') return false;
                        const cPelagem = c.pelagem ? normalize(c.pelagem) : (c.combo ? normalize(c.combo.split('-')[0]) : "");
                        const cVariacao = c.variacao ? normalize(c.variacao) : (c.combo && c.combo.includes('-') ? normalize(c.combo.split('-')[1]) : "");
                        return cPelagem === normalize(baseFurName) && cVariacao === normalize(newEntry.variation);
                    });
                    
                    const targetComboId = matchCombo && matchCombo.combo ? matchCombo.combo : `${baseFurName} - ${newEntry.variation}`;
                    
                    if (!savedData.greatOnes[slug].includes(targetComboId)) {
                        savedData.greatOnes[slug].push(targetComboId);
                    }
                }
                
                saveData(savedData);
                checkAndSetGreatOneCompletion(slug, savedData.greatOnes[slug]);
                renderGreatOneHistoryView(container, animalName, slug, furName, originReserveKey);
            });
        };
    }
}

/**
 * Modal para inserção ou Edição de dados (Input/Edit Mode)
 * Versão AAA HUD Premium - Polimórfica com suporte a Retrocompatibilidade
 */
function openAddEntryModal(animalName, furName, onSave, trophyToEdit = null) {
    const modal = document.getElementById('form-modal');
    modal.className = 'modal-overlay form-modal'; 
    const slug = slugify(animalName);
    const baseFurName = furName.split(' - ')[0].split(' (')[0].trim();

    // Valores padrão ou herdados do objeto em edição para preenchimento automático
    const initialDate = trophyToEdit ? trophyToEdit.date.split('T')[0] : new Date().toISOString().split('T')[0];
    const initialKills = trophyToEdit ? trophyToEdit.stats.kills : '';
    const initialDiamonds = trophyToEdit ? trophyToEdit.stats.diamonds : '';
    const initialRares = trophyToEdit ? trophyToEdit.stats.rares : '';
    const initialTrolls = trophyToEdit ? trophyToEdit.stats.trolls : '';
    const initialVariation = trophyToEdit ? trophyToEdit.variation : '';

    const getSpeciesDataFlexibly = (dataSource, currentSlug) => {
        if (!dataSource) return [];
        if (dataSource[currentSlug]) return dataSource[currentSlug];
        const clean = (s) => s.toLowerCase().replace(/[^a-z0-9]/g, '');
        const target = clean(currentSlug);
        const matchKey = Object.keys(dataSource).find(k => clean(k) === target);
        return matchKey ? dataSource[matchKey] : [];
    };
    const rawFursData = getSpeciesDataFlexibly(greatsFursData, slug);
    const variations = [];
    
    const normalize = (str) => str ? str.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").trim() : "";
    const targetNormalized = normalize(baseFurName);

    rawFursData.forEach(item => {
        if (item && typeof item === 'object') {
            const itemPelagem = item.pelagem ? normalize(item.pelagem) : (item.combo ? normalize(item.combo.split('-')[0]) : "");
            if (itemPelagem === targetNormalized || itemPelagem.includes(targetNormalized)) {
                const variacao = item.variacao ? item.variacao.trim() : (item.combo && item.combo.includes('-') ? item.combo.split('-')[1].trim() : null);
                if (variacao && !variations.includes(variacao)) {
                    variations.push(variacao);
                }
            }
        }
    });

    const furSlug = slugify(baseFurName);
    const primaryPath = `animais/pelagens/great_${slug}_${furSlug}.png`;
    const placeholderPath = `animais/${slug}.png`;
    const imgTag = createSafeImgTag(primaryPath, '', placeholderPath, baseFurName);

    const variationHtml = variations.length > 0 ? `
        <div class="date-section" style="margin-top: 4px; width: 100%; box-sizing: border-box;">
            <label style="font-family:'Bebas Neue', sans-serif; font-size: 0.95rem; color: #ffc107; letter-spacing: 1.2px; display: block; margin-bottom: 6px;"><i class="fas fa-crown"></i> REGISTRAR MODELO DE GALHADA / PRESA (OPCIONAL)</label>
            <div style="position: relative; width: 100%;">
                <select id="input-variation" class="tactical-date-input" style="width: 100%; background: rgba(25, 18, 32, 0.85) url('data:image/svg+xml;utf8,<svg xmlns=\'http://www.w3.org/2000/svg\' width=\'24\' height=\'24\' viewBox=\'0 0 24 24\' fill=\'none\' stroke=\'%23ffc107\' stroke-width=\'2\' stroke-linecap=\'round\' stroke-linejoin=\'round\'><polyline points=\'6 9 12 15 18 9\'></polyline></svg>') no-repeat right 15px center; background-size: 16px; border: 1px solid rgba(163, 51, 200, 0.4); color: #fff; padding: 12px 40px 12px 15px; border-radius: 8px; font-family: 'Bebas Neue', sans-serif; font-size: 1.1rem; letter-spacing: 0.8px; outline: none; cursor: pointer; transition: all 0.3s; appearance: none; -webkit-appearance: none; -moz-appearance: none; box-sizing: border-box; box-shadow: inset 0 0 10px rgba(0,0,0,0.5);">
                    <option value="" style="background: #100c16; color: #888;">-- NÃO ESPECIFICADO / APENAS PELAGEM --</option>
                    ${variations.map(v => `<option value="${v}" style="background: #100c16; color: #fff;" ${normalize(v) === normalize(initialVariation) ? 'selected' : ''}>${v.toUpperCase()}</option>`).join('')}
                </select>
            </div>
        </div>
    ` : '';

    modal.innerHTML = `
        <div class="modal-content-box go-dossier-modal input-mode" style="max-width: 480px; width: 92%; max-height: 90vh; overflow-y: auto; background: rgba(14, 10, 20, 0.98); border: 2px solid ${trophyToEdit ? '#ffc107' : '#a333c8'}; box-shadow: 0 0 40px ${trophyToEdit ? 'rgba(255,193,7,0.35)' : 'rgba(163,51,200,0.45)'}, inset 0 0 20px rgba(0,0,0,0.6); border-radius: 16px; padding: 30px 25px; backdrop-filter: blur(30px); position: relative; box-sizing: border-box; display: flex; flex-direction: column; gap: 0;">
            
            <div class="card-glint" style="position: absolute; top: 0; left: 0; width: 100%; height: 100%; background: linear-gradient(135deg, rgba(255,255,255,0.02) 0%, transparent 50%); pointer-events: none;"></div>

            <div class="go-modal-header centered" style="text-align: center; margin-bottom: 20px; border-bottom: 1px solid rgba(163, 51, 200, 0.25); padding-bottom: 14px; width: 100%; box-sizing: border-box;">
                <span class="dossier-label" style="font-family:'Bebas Neue', sans-serif; font-size: 0.85rem; color: ${trophyToEdit ? '#ffc107' : '#a333c8'}; letter-spacing: 2px; font-weight: bold; display: block; margin-bottom: 3px;">${trophyToEdit ? 'ATUALIZAR ARQUIVO HISTÓRICO' : 'NOVO REGISTRO TÁTICO'}</span>
                <h3 style="font-family:'Bebas Neue', sans-serif; font-size: 2.6rem; color: #fff; letter-spacing: 1px; margin: 0; text-transform: uppercase; line-height: 1.1;">${animalName}</h3>
                <div class="go-fur-tag" style="display: inline-flex; align-items: center; gap: 6px; background: rgba(163, 51, 200, 0.15); border: 1px solid #a333c8; color: #fff; padding: 5px 16px; border-radius: 20px; font-family:'Bebas Neue', sans-serif; font-size: 1.1rem; letter-spacing: 0.5px; margin-top: 10px; box-shadow: 0 0 12px rgba(163,51,200,0.25);"><i class="fas fa-trophy" style="color: #ffc107;"></i> ${baseFurName.toUpperCase()}</div>
            </div>
            
            <div class="go-form-body" style="display: flex; flex-direction: column; gap: 16px; width: 100%; box-sizing: border-box;">
                
                <div class="modal-image-preview-container" style="width: 100%; height: 120px; display: flex; justify-content: center; align-items: center; background: rgba(5, 5, 5, 0.5); border-radius: 12px; padding: 12px; border: 1px solid rgba(163, 51, 200, 0.2); overflow: hidden; box-shadow: inset 0 0 25px rgba(0,0,0,0.95); box-sizing: border-box;">
                    <div style="width: 100%; height: 100%; display: flex; justify-content: center; align-items: center;">
                        ${imgTag.replace('<img', '<img style="max-width: 100%; max-height: 100%; object-fit: contain !important; filter: drop-shadow(0 0 10px rgba(163,51,200,0.5)); transform: scale(1.05);"' )}
                    </div>
                </div>

                <div class="date-section" style="width: 100%; box-sizing: border-box;">
                    <label style="font-family:'Bebas Neue', sans-serif; font-size: 0.95rem; color: #888; letter-spacing: 1.2px; display: block; margin-bottom: 6px;">DATA DA CAPTURA</label>
                    <input type="date" id="input-date" value="${initialDate}" class="tactical-date-input" style="width: 100%; background: rgba(25, 20, 32, 0.6); border: 1px solid rgba(163, 51, 200, 0.3); color: #fff; padding: 12px; border-radius: 8px; font-family: sans-serif; font-size: 1rem; outline: none; transition: all 0.3s; box-sizing: border-box; box-shadow: inset 0 0 10px rgba(0,0,0,0.3);">
                </div>

                ${variationHtml}

                <div style="width: 100%; box-sizing: border-box;">
                    <label style="font-family:'Bebas Neue', sans-serif; font-size: 0.95rem; color: #888; letter-spacing: 1.2px; display: block; margin-top: 2px; margin-bottom: 8px;">MÉTRICAS COLETADAS DO GRIND</label>
                    <div class="tactical-input-grid" style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 14px; width: 100%; box-sizing: border-box;">
                        
                        <div class="stat-input-cell kills" style="background: rgba(255,255,255,0.01); border: 1px solid rgba(255,255,255,0.05); padding: 12px 10px; border-radius: 10px; display: flex; flex-direction: column; align-items: center; position: relative; transition: all 0.25s; box-sizing: border-box;">
                            <div class="cell-icon" style="color: #ff4d4d; font-size: 1.2rem; margin-bottom: 3px;"><i class="fas fa-skull"></i></div>
                            <label style="font-family:'Bebas Neue', sans-serif; font-size: 0.85rem; color: #aaa; letter-spacing: 0.5px;">ABATES</label>
                            <input type="number" id="input-kills" placeholder="0" min="0" value="${initialKills}" style="width: 80%; background: transparent; border: none; border-bottom: 2px solid rgba(255,77,77,0.3); color: #fff; text-align: center; font-family:'Bebas Neue', sans-serif; font-size: 1.7rem; outline: none; margin-top: 5px; padding: 2px 0;">
                        </div>

                        <div class="stat-input-cell diamonds" style="background: rgba(255,255,255,0.01); border: 1px solid rgba(255,255,255,0.05); padding: 12px 10px; border-radius: 10px; display: flex; flex-direction: column; align-items: center; position: relative; transition: all 0.25s; box-sizing: border-box;">
                            <div class="cell-icon" style="color: #00bcd4; font-size: 1.2rem; margin-bottom: 3px;"><i class="fas fa-gem"></i></div>
                            <label style="font-family:'Bebas Neue', sans-serif; font-size: 0.85rem; color: #aaa; letter-spacing: 0.5px;">DIAMANTES</label>
                            <input type="number" id="input-diamonds" placeholder="0" min="0" value="${initialDiamonds}" style="width: 80%; background: transparent; border: none; border-bottom: 2px solid rgba(0,188,212,0.3); color: #fff; text-align: center; font-family:'Bebas Neue', sans-serif; font-size: 1.7rem; outline: none; margin-top: 5px; padding: 2px 0;">
                        </div>

                        <div class="stat-input-cell rares" style="background: rgba(255,255,255,0.01); border: 1px solid rgba(255,255,255,0.05); padding: 12px 10px; border-radius: 10px; display: flex; flex-direction: column; align-items: center; position: relative; transition: all 0.25s; box-sizing: border-box;">
                            <div class="cell-icon" style="color: #ff9800; font-size: 1.2rem; margin-bottom: 3px;"><i class="fas fa-paw"></i></div>
                            <label style="font-family:'Bebas Neue', sans-serif; font-size: 0.85rem; color: #aaa; letter-spacing: 0.5px;">RAROS</label>
                            <input type="number" id="input-rares" placeholder="0" min="0" value="${initialRares}" style="width: 80%; background: transparent; border: none; border-bottom: 2px solid rgba(255,152,0,0.3); color: #fff; text-align: center; font-family:'Bebas Neue', sans-serif; font-size: 1.7rem; outline: none; margin-top: 5px; padding: 2px 0;">
                        </div>

                        <div class="stat-input-cell trolls" style="background: rgba(255,255,255,0.01); border: 1px solid rgba(255,255,255,0.05); padding: 12px 10px; border-radius: 10px; display: flex; flex-direction: column; align-items: center; position: relative; transition: all 0.25s; box-sizing: border-box;">
                            <div class="cell-icon" style="color: #00e5ff; font-size: 1.2rem; margin-bottom: 3px;"><i class="fas fa-ghost"></i></div>
                            <label style="font-family:'Bebas Neue', sans-serif; font-size: 0.85rem; color: #aaa; letter-spacing: 0.5px;">TROLLS</label>
                            <input type="number" id="input-trolls" placeholder="0" min="0" value="${initialTrolls}" style="width: 80%; background: transparent; border: none; border-bottom: 2px solid rgba(0,229,255,0.3); color: #fff; text-align: center; font-family:'Bebas Neue', sans-serif; font-size: 1.7rem; outline: none; margin-top: 5px; padding: 2px 0;">
                        </div>
                        
                    </div>
                </div>
            </div>

            <div class="go-btn-group" style="display: flex; gap: 14px; margin-top: 25px; border-top: 1px solid rgba(163, 51, 200, 0.25); padding-top: 20px; width: 100%; box-sizing: border-box;">
                <button id="btn-cancel-add" class="go-btn go-btn-secondary" style="flex: 1; padding: 14px; background: rgba(255,255,255,0.03); border: 1px solid rgba(255,255,255,0.08); color: #bbb; border-radius: 8px; font-family:'Bebas Neue', sans-serif; font-size: 1.25rem; letter-spacing: 1.2px; cursor: pointer; transition: all 0.2s; box-sizing: border-box;">CANCELAR</button>
                <button id="btn-confirm-add" class="go-btn go-btn-primary" style="flex: 1; padding: 14px; background: ${trophyToEdit ? '#ffc107' : '#a333c8'}; border: 1px solid ${trophyToEdit ? '#ffc107' : '#a333c8'}; color: ${trophyToEdit ? '#111' : '#fff'}; border-radius: 8px; font-family:'Bebas Neue', sans-serif; font-size: 1.25rem; letter-spacing: 1.2px; cursor: pointer; transition: all 0.2s; box-shadow: 0 4px 15px rgba(163,51,200,0.4); font-weight: bold; box-sizing: border-box;">${trophyToEdit ? 'SALVAR ALTERAÇÕES' : 'SALVAR REGISTRO'}</button>
            </div>
        </div>`;

    const styleId = 'go-modal-scrollbar-style';
    if (!document.getElementById(styleId)) {
        const styleTag = document.createElement('style');
        styleTag.id = styleId;
        styleTag.innerHTML = `
            .go-dossier-modal::-webkit-scrollbar { width: 6px; }
            .go-dossier-modal::-webkit-scrollbar-track { background: transparent; }
            .go-dossier-modal::-webkit-scrollbar-thumb { background: rgba(163, 51, 200, 0.4); border-radius: 4px; }
            .go-dossier-modal::-webkit-scrollbar-thumb:hover { background: rgba(163, 51, 200, 0.7); }
        `;
        document.head.appendChild(styleTag);
    }

    modal.querySelectorAll('.tactical-input-grid input').forEach(input => {
        input.addEventListener('focus', () => {
            input.parentElement.style.background = 'rgba(163, 51, 200, 0.08)';
            input.parentElement.style.borderColor = 'rgba(163, 51, 200, 0.4)';
            input.parentElement.style.transform = 'translateY(-2px)';
        });
        input.addEventListener('blur', () => {
            input.parentElement.style.background = 'rgba(255, 255, 255, 0.01)';
            input.parentElement.style.borderColor = 'rgba(255, 255, 255, 0.05)';
            input.parentElement.style.transform = 'translateY(0)';
        });
    });

    modal.style.display = 'flex';
    setTimeout(() => document.getElementById('input-kills').focus(), 100);

    modal.querySelector('#btn-cancel-add').onclick = () => closeModal('form-modal');
    
    modal.querySelector('#btn-confirm-add').onclick = () => {
        const selectedDate = document.getElementById('input-date').value;
        const selectedVariation = document.getElementById('input-variation')?.value || null;
        
        if (!selectedDate) {
            alert("Por favor, selecione uma data.");
            return;
        }

        const payloadData = {
            date: selectedDate ? new Date(selectedDate).toISOString() : new Date().toISOString(),
            variation: selectedVariation,
            stats: {
                kills: parseInt(document.getElementById('input-kills').value) || 0,
                diamonds: parseInt(document.getElementById('input-diamonds').value) || 0,
                trolls: parseInt(document.getElementById('input-trolls').value) || 0,
                rares: parseInt(document.getElementById('input-rares').value) || 0
            }
        };
        
        closeModal('form-modal');
        if (onSave) onSave(payloadData);
    };
}


// =================================================================
// ============ RENDERIZADOR COMPLETO DA ABA GREAT ONES ============
// =================================================================

function renderGreatsDetailView(container, animalName, slug, originReserveKey = null, filter = 'all') {
    // Dispara preventivamente o ecossistema de migração e auditoria para curar o backup legado
    migrateGreatOnesSaveData(slug);

   container.innerHTML = '';
    const getSpeciesDataFlexibly = (dataSource, currentSlug) => {
        if (!dataSource) return null;
        if (dataSource[currentSlug]) return dataSource[currentSlug];
        const clean = (s) => s.toLowerCase().replace(/[^a-z0-9]/g, '');
        const target = clean(currentSlug);
        const matchKey = Object.keys(dataSource).find(k => clean(k) === target);
        return matchKey ? dataSource[matchKey] : null;
    };
    const rawFursData = getSpeciesDataFlexibly(greatsFursData, slug);
    if (!rawFursData) return;

    const globalFilters = document.querySelector('.main-content > .filter-toggle-container');
    if (globalFilters) globalFilters.style.display = 'none';

    // Avalia eletronicamente se a espécie atual possui combos mapeados na camada de dados
    const hasValidCombos = Array.isArray(rawFursData) && rawFursData.some(item => item && typeof item === 'object' && item.combo);
    
    // Se o animal não possuir combos, força a interface a permanecer sempre no modo de pelagens puras
    let isComboMode = hasValidCombos && localStorage.getItem('greatOnes_viewMode') === 'combo';

    const hudControlsHeader = document.createElement('div');
    hudControlsHeader.className = 'filters-container-v2';
    hudControlsHeader.style.cssText = `
        display: flex;
        justify-content: space-between;
        align-items: center;
        gap: 20px;
        width: 100%;
        padding: 15px 25px;
        margin-bottom: 35px;
        background: rgba(15, 15, 15, 0.85);
        border: 1px solid rgba(255, 193, 7, 0.25);
        border-radius: 12px;
        box-shadow: 0 8px 32px rgba(0, 0, 0, 0.5);
    `;

    hudControlsHeader.innerHTML = `
        <div class="mode-switch-row" style="display: flex; gap: 12px; justify-content: flex-start; align-items: center; flex-wrap: nowrap;">
            <button class="filter-toggle-btn ${!isComboMode ? 'active' : ''}" id="btn-mode-pelagem" style="font-family:'Bebas Neue', sans-serif; font-size:1.1rem; letter-spacing:1px; padding:10px 22px; border-radius:6px; text-transform:uppercase; white-space: nowrap; cursor:pointer; transition:all 0.25s; background:${!isComboMode ? '#a333c8' : 'rgba(30,30,30,0.75)'} !important; color:${!isComboMode ? '#ffffff' : '#888888'} !important; border:1px solid ${!isComboMode ? '#a333c8' : 'rgba(255,255,255,0.1)'} !important; font-weight:${!isComboMode ? 'bold' : 'normal'} !important; box-shadow:${!isComboMode ? '0 0 15px rgba(163,51,200,0.5)' : 'none'} !important;">Foco em Pelagens</button>
            <button class="filter-toggle-btn ${isComboMode ? 'active' : ''}" id="btn-mode-combo" style="font-family:'Bebas Neue', sans-serif; font-size:1.1rem; letter-spacing:1px; padding:10px 22px; border-radius:6px; text-transform:uppercase; white-space: nowrap; cursor:pointer; display:${hasValidCombos ? 'flex' : 'none'}; align-items:center; gap:8px; transition:all 0.25s; background:${isComboMode ? '#a333c8' : 'rgba(30,30,30,0.75)'} !important; color:${isComboMode ? '#ffffff' : '#888888'} !important; border:1px solid ${isComboMode ? '#a333c8' : 'rgba(255,255,255,0.1)'} !important; font-weight:${isComboMode ? 'bold' : 'normal'} !important; box-shadow:${isComboMode ? '0 0 15px rgba(163,51,200,0.5)' : 'none'} !important;"><i class="fas fa-crown"></i> Coleção de Combos</button>
        </div>
        <div class="filter-toggle-container" style="display: flex; gap: 10px; justify-content: flex-end; align-items: center; margin: 0; flex-wrap: nowrap;">
            <span style="font-size: 0.8rem; color: #666; font-weight: bold; text-transform: uppercase; letter-spacing: 1px; margin-right: 5px; white-space: nowrap;">Filtrar Dossiê:</span>
            <button class="filter-toggle-btn ${filter === 'all' ? 'active' : ''}" id="btn-filter-all" style="font-family:'Bebas Neue', sans-serif; font-size: 1rem; padding: 8px 18px; text-transform: uppercase; letter-spacing: 1px; white-space: nowrap;">Mostrar Todos</button>
            <button class="filter-toggle-btn ${filter === 'missing' ? 'active' : ''}" id="btn-filter-missing" style="font-family:'Bebas Neue', sans-serif; font-size: 1rem; padding: 8px 18px; text-transform: uppercase; letter-spacing: 1px; white-space: nowrap;">Faltantes</button>
        </div>
    `;
    container.appendChild(hudControlsHeader);

    hudControlsHeader.querySelector('#btn-mode-pelagem').onclick = () => {
        localStorage.setItem('greatOnes_viewMode', 'pelagem');
        renderGreatsDetailView(container, animalName, slug, originReserveKey, filter);
    };
    
    if (hasValidCombos) {
        hudControlsHeader.querySelector('#btn-mode-combo').onclick = () => {
            localStorage.setItem('greatOnes_viewMode', 'combo');
            renderGreatsDetailView(container, animalName, slug, originReserveKey, filter);
        };
    }
    hudControlsHeader.querySelector('#btn-filter-all').onclick = () => {
        renderGreatsDetailView(container, animalName, slug, originReserveKey, 'all');
    };
    hudControlsHeader.querySelector('#btn-filter-missing').onclick = () => {
        renderGreatsDetailView(container, animalName, slug, originReserveKey, 'missing');
    };

    const completedList = [];
    const missingList = [];
    const userGreats = savedData?.greatOnes?.[slug] || [];

   if (isComboMode) {
        rawFursData.forEach(item => {
            if (typeof item === 'object' && item.combo) {
                // Restringe a validação estritamente ao combo: impede que a posse da pelagem marque galhadas não confirmadas
                const isCompleted = userGreats.includes(item.combo);
                const payload = { furName: item.pelagem, combos: [item], isCompleted };
                if (isCompleted) completedList.push(payload);
                else missingList.push(payload);
            } else if (typeof item === 'string') {
                const isCompleted = userGreats.includes(item);
                const payload = { furName: item, combos: null, isCompleted };
                if (isCompleted) completedList.push(payload);
                else missingList.push(payload);
            }
        });
    } else {
        const uniqueFurs = [];
        rawFursData.forEach(item => {
            if (typeof item === 'string') {
                if (!uniqueFurs.includes(item)) uniqueFurs.push(item);
            } else if (item && item.pelagem) {
                if (!uniqueFurs.includes(item.pelagem)) uniqueFurs.push(item.pelagem);
            }
        });

        uniqueFurs.forEach(furName => {
            const associatedCombos = Array.isArray(rawFursData) 
                ? rawFursData.filter(c => typeof c === 'object' && c.pelagem === furName)
                : [];

            let isCompleted = false;
            if (associatedCombos.length > 0) {
                const completedCount = associatedCombos.filter(c => userGreats.includes(c.combo)).length;
                // FALLBACK: Garante que pelagens legadas puras marquem o card principal de foco em pelagem como conquistado
                isCompleted = completedCount > 0 || userGreats.includes(furName);
            } else {
                isCompleted = userGreats.includes(furName);
            }

            const payload = { furName, combos: associatedCombos, isCompleted };
            if (isCompleted) completedList.push(payload);
            else missingList.push(payload);
        });
    }

    const renderSectionGrid = (list, titleLabel, sectionClass) => {
        if (list.length === 0) return;

        const isCompletedSection = sectionClass.includes('completed');
        const themeColor = isCompletedSection ? '#4CAF50' : '#ffc107';
        const themeIcon = isCompletedSection ? 'fa-check-circle' : 'fa-crosshairs';

        const sectionHeader = document.createElement('div');
        sectionHeader.className = `gender-section-header greats-theme ${sectionClass}`;
        sectionHeader.style.cssText = `
            display: flex;
            flex-direction: column;
            gap: 8px;
            margin: 25px 0 15px 0;
            width: 100%;
            border-bottom: 1px solid rgba(255,255,255,0.05);
            padding-bottom: 10px;
        `;

        sectionHeader.innerHTML = `
            <div class="header-info" style="display: flex; align-items: center; justify-content: space-between; width: 100%;">
                <h3 style="font-family: 'Bebas Neue', sans-serif; font-size: 1.8rem; color: #fff; letter-spacing: 1.5px; display: flex; align-items: center; gap: 10px; margin: 0;">
                    <i class="fas ${themeIcon}" style="color: ${themeColor}; font-size: 1.3rem;"></i> 
                    ${titleLabel.toUpperCase()}
                </h3>
                <span class="count-badge" style="background: rgba(255,255,255,0.05); border: 1px solid rgba(255,255,255,0.1); padding: 4px 14px; border-radius: 20px; font-family: 'Bebas Neue', sans-serif; font-size: 1.1rem; color: ${themeColor}; letter-spacing: 1px;">
                    ${list.length} ${isComboMode ? 'Combos Ativos' : 'Pelagens'}
                </span>
            </div>
            <div class="mini-progress-track" style="width: 100%; height: 2px; background: rgba(255,255,255,0.03); border-radius: 1px; overflow: hidden;">
                <div class="mini-progress-fill" style="width: 100%; height: 100%; background: linear-gradient(90deg, ${themeColor}, transparent);"></div>
            </div>
        `;
        container.appendChild(sectionHeader);

        if (isComboMode) {
                // Mapeamento Arquitetural: Organiza os elementos dinamicamente por Pelagem Base
                const groups = {};
                list.forEach(item => {
                    if (!groups[item.furName]) groups[item.furName] = [];
                    groups[item.furName].push(item);
                });

                // Renderiza cada grupo de pelagem de forma isolada e organizada na tela
                Object.entries(groups).forEach(([furGroup, groupItems]) => {
                    const subHeader = document.createElement('div');
                    subHeader.className = 'fur-group-subheader';
                    subHeader.style.cssText = `
                        font-family: 'Bebas Neue', sans-serif;
                        font-size: 1.15rem;
                        color: #777;
                        letter-spacing: 1.5px;
                        margin: 25px 0 12px 6px;
                        display: flex;
                        align-items: center;
                        gap: 10px;
                        text-transform: uppercase;
                        width: 100%;
                    `;
                    subHeader.innerHTML = `
                        <i class="fas fa-fingerprint" style="color: #a333c8; font-size: 0.95rem;"></i> 
                        GRUPO DE PELAGEM: <span style="color: #fff; font-weight: bold; background: rgba(163, 51, 200, 0.1); padding: 2px 10px; border-radius: 4px; border: 1px solid rgba(163, 51, 200, 0.2); margin-left: 4px;">${furGroup}</span>
                    `;
                    container.appendChild(subHeader);

                    const furGrid = document.createElement('div');
                    furGrid.className = 'fur-grid greats-grid';
                    container.appendChild(furGrid);

                    groupItems.forEach(item => {
                        const cardElement = createGreatComboCard({
                            animalSlug: slug,
                            furName: item.furName,
                            combos: item.combos,
                            isComboMode: isComboMode,
                            savedData: savedData,
                            onToggle: (animal, targetId, status) => {
                                if (!savedData.greatOnes) savedData.greatOnes = {};
                                if (!savedData.greatOnes[animal]) savedData.greatOnes[animal] = [];

                                if (status) {
                                    if (!savedData.greatOnes[animal].includes(targetId)) {
                                        savedData.greatOnes[animal].push(targetId);
                                    }
                                } else {
                                    savedData.greatOnes[animal] = savedData.greatOnes[animal].filter(id => id !== targetId);
                                }
                                
                                saveData(savedData);
                                checkAndSetGreatOneCompletion(slug, savedData.greatOnes[animal]);
                                renderGreatsDetailView(container, animalName, slug, originReserveKey, filter);
                            },
                            onFullscreen: (imgUrl) => {
                                openImageViewer(imgUrl, `${animalName}: ${item.furName}`);
                            }
                        });

                        if (cardElement && cardElement instanceof HTMLElement) {
                            const btnFull = cardElement.querySelector('.fullscreen-btn');
                            if (btnFull) {
                                btnFull.style.cssText = "position: absolute !important; top: 12px !important; right: 12px !important; background: rgba(14, 10, 20, 0.9) !important; border: 1px solid #a333c8 !important; color: #ffffff !important; border-radius: 6px !important; padding: 6px 10px !important; cursor: pointer !important; z-index: 999 !important; font-size: 1rem !important; line-height: 1 !important; box-shadow: 0 0 12px rgba(163, 51, 200, 0.6) !important; opacity: 0 !important; visibility: hidden !important; transition: opacity 0.2s ease-in-out, visibility 0.2s ease-in-out !important;";
                                btnFull.onclick = (e) => {
                                    e.stopPropagation();
                                    e.preventDefault();
                                    const cardImg = cardElement.querySelector('img');
                                    if (cardImg) {
                                        openImageViewer(cardImg.src, `${animalName}: ${item.furName}`);
                                    }
                                };
                                cardElement.addEventListener('mouseenter', () => {
                                    btnFull.style.setProperty('opacity', '1', 'important');
                                    btnFull.style.setProperty('visibility', 'visible', 'important');
                                });
                                cardElement.addEventListener('mouseleave', () => {
                                    btnFull.style.setProperty('opacity', '0', 'important');
                                    btnFull.style.setProperty('visibility', 'hidden', 'important');
                                });
                                cardElement.addEventListener('touchstart', () => {
                                    btnFull.style.setProperty('opacity', '1', 'important');
                                    btnFull.style.setProperty('visibility', 'visible', 'important');
                                }, { passive: true });
                            }
                            furGrid.appendChild(cardElement);
                        }
                    });
                });
            } else {
                // Mantém o layout plano limpo original intacto para o modo de foco em pelagens simples
                const furGrid = document.createElement('div');
                furGrid.className = 'fur-grid greats-grid';
                container.appendChild(furGrid);

                list.forEach(item => {
                    const cardElement = createGreatComboCard({
                        animalSlug: slug,
                        furName: item.furName,
                        combos: item.combos,
                        isComboMode: isComboMode,
                        savedData: savedData,
                        onToggle: (animal, targetId, status) => {
                            if (!savedData.greatOnes) savedData.greatOnes = {};
                            if (!savedData.greatOnes[animal]) savedData.greatOnes[animal] = [];

                            if (status) {
                                if (!savedData.greatOnes[animal].includes(targetId)) {
                                    savedData.greatOnes[animal].push(targetId);
                                }
                            } else {
                                savedData.greatOnes[animal] = savedData.greatOnes[animal].filter(id => id !== targetId);
                            }
                            
                            saveData(savedData);
                            checkAndSetGreatOneCompletion(slug, savedData.greatOnes[animal]);
                            renderGreatsDetailView(container, animalName, slug, originReserveKey, filter);
                        },
                        onFullscreen: (imgUrl) => {
                            openImageViewer(imgUrl, `${animalName}: ${item.furName}`);
                        }
                    });

                    if (cardElement && cardElement instanceof HTMLElement) {
                        const btnFull = cardElement.querySelector('.fullscreen-btn');
                        if (btnFull) {
                            btnFull.style.cssText = "position: absolute !important; top: 12px !important; right: 12px !important; background: rgba(14, 10, 20, 0.9) !important; border: 1px solid #a333c8 !important; color: #ffffff !important; border-radius: 6px !important; padding: 6px 10px !important; cursor: pointer !important; z-index: 999 !important; font-size: 1rem !important; line-height: 1 !important; box-shadow: 0 0 12px rgba(163, 51, 200, 0.6) !important; opacity: 0 !important; visibility: hidden !important; transition: opacity 0.2s ease-in-out, visibility 0.2s ease-in-out !important;";
                            btnFull.onclick = (e) => {
                                e.stopPropagation();
                                e.preventDefault();
                                const cardImg = cardElement.querySelector('img');
                                if (cardImg) {
                                    openImageViewer(cardImg.src, `${animalName}: ${item.furName}`);
                                }
                            };
                            cardElement.addEventListener('mouseenter', () => {
                                btnFull.style.setProperty('opacity', '1', 'important');
                                btnFull.style.setProperty('visibility', 'visible', 'important');
                            });
                            cardElement.addEventListener('mouseleave', () => {
                                btnFull.style.setProperty('opacity', '0', 'important');
                                btnFull.style.setProperty('visibility', 'hidden', 'important');
                            });
                            cardElement.addEventListener('touchstart', () => {
                                btnFull.style.setProperty('opacity', '1', 'important');
                                btnFull.style.setProperty('visibility', 'visible', 'important');
                            }, { passive: true });
                        }
                        furGrid.appendChild(cardElement);
                    }
                });
            }
    }; // <- ESSA CHAVE E PONTO E VÍRGULA FECHAM CORRETAMENTE O renderSectionGrid!

    if (filter === 'all') renderSectionGrid(completedList, "Lendas Conquistadas", "completed-section");
    renderSectionGrid(missingList, "Em Busca da Lenda", "missing-section");
} // Fechamento correto do renderGreatsDetailView