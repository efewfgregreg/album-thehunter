// =================================================================
// ARQUIVO: js/views/detailView.js
// =================================================================
import { slugify, createSafeImgTag } from '../utils.js';
import { closeModal } from '../auth.js'; 
import { rareFursData, greatsFursData, diamondFursData, items, animalHotspotData, reservesData } from '../../data/gameData.js';
import { categorias } from '../constants.js';
import { renderRoutineDetailView } from './routineView.js';

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

console.log("🚀 detailView.js CARREGADO - Versão V16 (Clean Header & No Hotspots)");

// =================================================================
// =================== LÓGICA DE NAVEGAÇÃO =========================
// =================================================================

export function showDetailView(name, tabKey, originReserveKey = null, addToHistory = true) {
    // Salva a posição da rolagem para retornar depois
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
    
    // --- SUBSTITUA NO ARQUIVO js/views/detailView.js ---

// Atualização do Título e Botão Voltar no Layout Base
mainContent.querySelector('.page-header h2').textContent = `${animalName.toUpperCase()}`;

// --- CORREÇÃO DO BOTÃO VOLTAR ---
const backButton = mainContent.querySelector('.page-header .back-button');

// Verifica se estamos no fluxo da "Rotina"
const isRoutineFlow = document.querySelector('.routine-population-container') || tabKey === 'rotina';

if (isRoutineFlow) {
    backButton.innerHTML = `&larr; Voltar para Animais`;
    backButton.onclick = () => {
        // Importa o hub e chama o seletor da reserva de onde o usuário veio
        import('./routineHubView.js').then(module => {
            module.renderAnimalSelector(contentContainer, originReserveKey, null);
        });
    };
} else {
    // Comportamento padrão para as outras abas
    backButton.innerHTML = `&larr; Voltar para ${reservesData[originReserveKey]?.name || 'Reservas'}`;
    backButton.onclick = () => showReserveDetailView(originReserveKey);
}
    // *** REMOVIDO: BLOCO DO HERO HEADER (IMAGEM/ABATES/PROGRESSO) ***

    // --- TABS E FILTROS ---
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
    
    // *** AJUSTE: REMOVIDA A ABA 'HOTSPOTS' ***
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
        // Filtros sempre visíveis agora que não tem hotspot
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

    // 1. Limpeza de estados e preparação
    card.classList.remove('completed', 'inprogress', 'incomplete', 'is-completed');
    const progressBar = card.querySelector('.progress-bar');
    
    // 2. Recupera estatísticas do motor de progresso
    const stats = getAnimalCardStatus(slug, tabKey, savedData);
    card.classList.add(stats.status);

    // 3. Lógica de Preenchimento da Barra e Badge
    if (stats.total > 0) {
        const displayCollected = Math.min(stats.collected, stats.total);
        const percentage = (displayCollected / stats.total) * 100;
        
        // Atualiza a largura da barra neon com transição suave
        if (progressBar) {
            progressBar.style.width = `${percentage}%`;
        }

        // 4. Ativação do Estado de Conclusão Máxima
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

    // Função auxiliar para renderizar cada seção (Macho/Fêmea)
    const renderSection = (genderKey, label) => {
        const furs = speciesData[genderKey] || [];
        if (furs.length === 0) return;

        // Filtragem e cálculo de progresso
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

        // Criar Header da Seção com Barra de Progresso
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

    // Função auxiliar para renderizar seções de Diamantes (Macho/Fêmea)
    const renderDiamondSection = (genderKey, label) => {
        const furs = speciesDiamondFurs[genderKey] || [];
        if (furs.length === 0) return;

        // Processamento de dados e cálculo de progresso
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

        // Header da Seção com Progresso (Ciano para Diamantes)
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

            // Lógica de clique para adicionar pontuação
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
// ============ RENDERIZADORES: ABA GREAT ONES (V3 - FULL VIEW) ===
// =================================================================

function renderGreatsDetailView(container, animalName, slug, originReserveKey = null, filter = 'all') {
    container.innerHTML = '';
    const fursInfo = greatsFursData[slug];
    if (!fursInfo) return;

    // 1. Processar dados
    const completedFurs = [];
    const missingFurs = [];

    fursInfo.forEach(furName => {
        const trophies = savedData.greats?.[slug]?.furs?.[furName]?.trophies || [];
        const isCompleted = trophies.length > 0;
        
        const furData = {
            name: furName,
            trophies: trophies,
            isCompleted: isCompleted,
            slug: slugify(furName)
        };

        if (isCompleted) completedFurs.push(furData);
        else missingFurs.push(furData);
    });

    // 2. Renderizador de Grade
    const renderGreatGrid = (list, titleLabel, sectionClass) => {
        if (list.length === 0) return;

        const sectionHeader = document.createElement('div');
        sectionHeader.className = `gender-section-header greats-theme ${sectionClass}`;
        sectionHeader.innerHTML = `
            <div class="header-info">
                <h3><i class="fas fa-crown"></i> ${titleLabel}</h3>
                <span class="count-badge">${list.length}</span>
            </div>
            <div class="mini-progress-track">
                <div class="mini-progress-fill" style="width: 100%"></div>
            </div>
        `;
        container.appendChild(sectionHeader);

        const furGrid = document.createElement('div');
        furGrid.className = 'fur-grid greats-grid';
        container.appendChild(furGrid);

        list.forEach(fur => {
            if (filter === 'missing' && fur.isCompleted) return;

            const imgTag = createSafeImgTag(
                `animais/pelagens/great_${slug}_${fur.slug}.png`, 
                null, 
                `animais/${slug}.png`, 
                fur.name
            );

            const furCard = document.createElement('div');
            furCard.className = `fur-card trophy-frame ${fur.isCompleted ? 'completed' : 'incomplete'}`;
            
            const trophyCount = fur.trophies.length;
            
            furCard.innerHTML = `
                ${fur.isCompleted && trophyCount > 1 ? `<div class="trophy-count-badge">x${trophyCount}</div>` : ''}
                <div class="card-image-wrapper">${imgTag}</div>
                <div class="info-plaque">
                    <div class="info">${fur.name}</div>
                </div>
                <button class="fullscreen-btn" title="Ver em tela cheia">⛶</button>
            `;
                
            // MUDANÇA: Agora chama a renderGreatOneHistoryView (Tela Cheia) em vez do Modal
            furCard.addEventListener('click', () => {
                renderGreatOneHistoryView(container, animalName, slug, fur.name, originReserveKey);
            });
            
            furCard.querySelector('.fullscreen-btn').onclick = (e) => {
                e.stopPropagation();
                const title = fur.isCompleted 
                    ? `Troféu Lendário: ${animalName} (${fur.name})` 
                    : `Alvo Identificado: ${animalName} (${fur.name})`;
                openImageViewer(furCard.querySelector('img').src, title);
            };
            
            furGrid.appendChild(furCard);
        });
    };

    if (filter === 'all') renderGreatGrid(completedFurs, "Lendas Conquistadas", "completed-section");
    renderGreatGrid(missingFurs, "Em Busca da Lenda", "missing-section");
}

function reRenderActiveDossierTab(reserveKey, animalName, slug) {
    const activeTab = document.querySelector('.dossier-tab.active');
    const filterContainer = document.querySelector('.filter-toggle-container');
    // Verifica se os botões existem antes de acessar textContent
    const activeFilterBtn = filterContainer?.querySelector('.active');
    const currentFilter = activeFilterBtn && activeFilterBtn.textContent.includes('Todos') ? 'all' : 'missing';
    
    if (activeTab) {
        const tabKey = activeTab.dataset.key;
        const dossierContent = document.querySelector('.dossier-content');
        
        // Removido 'hotspot' daqui também
        const tabRenders = {
            pelagens: renderRareFursDetailView,
            diamantes: renderDiamondsDetailView,
            super_raros: renderSuperRareDetailView,
            greats: renderGreatsDetailView,
            rotina: renderRoutineDetailView
        };

        if (tabRenders[tabKey]) {
            tabRenders[tabKey](dossierContent, animalName, slug, reserveKey, currentFilter);
        }
    }
}

/**
 * NOVA FUNÇÃO: Renderiza a tela de histórico (Arquivo Tático) em vez de modal
 * V5: Correção de Navegação (Botão Voltar) e Estabilidade do Card
 */
function renderGreatOneHistoryView(container, animalName, slug, furName, originReserveKey) {
    // 1. Preparação dos Dados
    if (!savedData.greats) savedData.greats = {};
    if (!savedData.greats[slug]) savedData.greats[slug] = {};
    if (!savedData.greats[slug].furs) savedData.greats[slug].furs = {};
    if (!savedData.greats[slug].furs[furName]) savedData.greats[slug].furs[furName] = { trophies: [] };

    const trophies = savedData.greats[slug].furs[furName].trophies;
    
    // 2. Limpar Container e Definir Classe
    container.innerHTML = '';
    const historyContainer = document.createElement('div');
    historyContainer.className = 'go-history-view-container'; 

    // --- CORREÇÃO CRÍTICA DE NAVEGAÇÃO (GLOBAL HEADER) ---
    // Captura o botão voltar do topo da página
    const globalBackButton = document.querySelector('.page-header .back-button');
    
    if (globalBackButton) {
        // Clona o botão para limpar listeners antigos
        const newBackButton = globalBackButton.cloneNode(true);
        globalBackButton.parentNode.replaceChild(newBackButton, globalBackButton);
        
        // Define o comportamento para "Voltar ao Dossiê"
        newBackButton.innerHTML = `<i class="fas fa-arrow-left"></i> Voltar ao Dossiê`;
        
        newBackButton.onclick = () => {
            // 1. Restaurar Título do Header
            const headerTitle = document.querySelector('.page-header h2');
            if (headerTitle) headerTitle.textContent = animalName.toUpperCase();

            // 2. Restaurar Comportamento Original do Botão Voltar
            // Se veio de uma reserva, o botão deve voltar para a reserva
            if (originReserveKey && reservesData[originReserveKey]) {
                newBackButton.innerHTML = `<i class="fas fa-arrow-left"></i> Voltar para ${reservesData[originReserveKey].name}`;
                newBackButton.onclick = () => showReserveDetailView(originReserveKey);
            } else {
                // Se veio do menu principal
                newBackButton.innerHTML = `<i class="fas fa-arrow-left"></i> Voltar para Great Ones`;
                newBackButton.onclick = () => renderMainView('greats');
            }

            // 3. Recarregar a Grid de Great Ones (Sai da tela de histórico)
            renderGreatsDetailView(container, animalName, slug, originReserveKey, 'all');
        };
    }
    
    // 3. Cabeçalho da View (Centralizado e Limpo)
    const headerHtml = `
        <div class="go-history-header centered-layout">
            <div class="go-header-details">
                <h2>${animalName}</h2>
                <div class="go-fur-tag"><i class="fas fa-crown"></i> ${furName}</div>
            </div>
            
            <div class="go-header-stats-row">
                <div class="go-stat-badge">
                    <span class="lbl">REGISTROS</span>
                    <span class="val">${trophies.length}</span>
                </div>
            </div>
        </div>
        
        <div class="go-controls-bar centered-controls">
            <button id="btn-add-entry" class="action-btn-primary">
                <i class="fas fa-plus"></i> NOVO REGISTRO
            </button>
            <p class="info-text-centered"><i class="fas fa-info-circle"></i> Gerencie seus abates individuais abaixo.</p>
        </div>
    `;
    
    // 4. Grid de Cards (Histórico Redesenhado)
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
            // Busca o índice original correto para deleção
            const originalIndex = trophies.indexOf(t);
            const stats = t.stats || { kills: 0, diamonds: 0, trolls: 0, rares: 0 };
            const dateStr = t.date ? new Date(t.date).toLocaleDateString() : '--/--';
            
            // CRIAÇÃO DO ELEMENTO CARD (DEFINIDO AQUI PARA EVITAR ERRO DE REFERÊNCIA)
            const cardElement = document.createElement('div');
            cardElement.className = 'go-history-item-card v2';
            
            // HTML do Card
            cardElement.innerHTML = `
                <div class="card-top-bar">
                    <div class="card-date"><i class="far fa-calendar-alt"></i> ${dateStr}</div>
                    <button class="btn-delete-item" title="Excluir"><i class="fas fa-trash-alt"></i></button>
                </div>
                
                <div class="card-main-stat">
                    <span class="stat-value-big">${stats.kills}</span>
                    <span class="stat-label-big">ABATES</span>
                </div>

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
            
            // Lógica de Exclusão (Vinculada ao cardElement que acabamos de criar)
            const deleteBtn = cardElement.querySelector('.btn-delete-item');
            if (deleteBtn) {
                deleteBtn.onclick = async () => {
                    if (await showCustomAlert('Excluir este registro?', 'Confirmar', true)) {
                        trophies.splice(originalIndex, 1);
                        saveData(savedData);
                        checkAndSetGreatOneCompletion(slug, savedData.greats[slug]);
                        // Recarrega a própria view para atualizar a lista
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

    // Event Listener do Botão Novo
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


    historyContainer.innerHTML = headerHtml;
    historyContainer.appendChild(gridContainer);
    container.appendChild(historyContainer);

    // Event Listener do Botão Novo (Mantido igual)
    historyContainer.querySelector('#btn-add-entry').onclick = () => {
        openAddEntryModal(animalName, furName, (newEntry) => {
            trophies.push(newEntry);
            saveData(savedData);
            checkAndSetGreatOneCompletion(slug, savedData.greats[slug]);
            renderGreatOneHistoryView(container, animalName, slug, furName, originReserveKey);
        });
    };

            
            gridContainer.appendChild(card);
    

    historyContainer.innerHTML = headerHtml;
    historyContainer.appendChild(gridContainer);
    container.appendChild(historyContainer);

    // 5. Event Listeners da View
    historyContainer.querySelector('#btn-back-dossier').onclick = () => {
        // Volta para o dossiê principal
        reRenderActiveDossierTab(originReserveKey, animalName, slug);
    };

    historyContainer.querySelector('#btn-add-entry').onclick = () => {
        openAddEntryModal(animalName, furName, (newEntry) => {
            trophies.push(newEntry);
            saveData(savedData);
            checkAndSetGreatOneCompletion(slug, savedData.greats[slug]);
            renderGreatOneHistoryView(container, animalName, slug, furName, originReserveKey);
        });
    };
}

/**
 * Modal APENAS para inserção de dados (Input)
 * V2: Design Tático e Organizado
 */
function openAddEntryModal(animalName, furName, onSave) {
    const modal = document.getElementById('form-modal');
    modal.className = 'modal-overlay form-modal'; 
    const today = new Date().toISOString().split('T')[0];

    modal.innerHTML = `
        <div class="modal-content-box go-dossier-modal input-mode">
            <div class="go-modal-header centered">
                <span class="dossier-label">NOVO REGISTRO TÁTICO</span>
                <h3>${animalName}</h3>
                <div class="go-fur-tag"><i class="fas fa-crown"></i> ${furName}</div>
            </div>
            
            <div class="go-form-body">
                <div class="date-section">
                    <label>DATA DA CAPTURA</label>
                    <input type="date" id="input-date" value="${today}" class="tactical-date-input">
                </div>

                <div class="tactical-input-grid">
                    <div class="stat-input-cell kills">
                        <div class="cell-icon"><i class="fas fa-skull"></i></div>
                        <label>ABATES</label>
                        <input type="number" id="input-kills" placeholder="0" min="0">
                    </div>

                    <div class="stat-input-cell diamonds">
                        <div class="cell-icon"><i class="fas fa-gem"></i></div>
                        <label>DIAMANTES</label>
                        <input type="number" id="input-diamonds" placeholder="0" min="0">
                    </div>

                    <div class="stat-input-cell rares">
                        <div class="cell-icon"><i class="fas fa-paw"></i></div>
                        <label>RAROS</label>
                        <input type="number" id="input-rares" placeholder="0" min="0">
                    </div>

                    <div class="stat-input-cell trolls">
                        <div class="cell-icon"><i class="fas fa-ghost"></i></div>
                        <label>TROLLS</label>
                        <input type="number" id="input-trolls" placeholder="0" min="0">
                    </div>
                </div>
            </div>

            <div class="go-btn-group">
                <button id="btn-cancel-add" class="go-btn go-btn-secondary">CANCELAR</button>
                <button id="btn-confirm-add" class="go-btn go-btn-primary">SALVAR REGISTRO</button>
            </div>
        </div>`;

    modal.style.display = 'flex';

    // Foco automático no primeiro campo (Abates) para agilidade
    setTimeout(() => document.getElementById('input-kills').focus(), 100);

    modal.querySelector('#btn-cancel-add').onclick = () => closeModal('form-modal');
    
    modal.querySelector('#btn-confirm-add').onclick = () => {
        const selectedDate = document.getElementById('input-date').value;
        
        // Validação simples: Impede salvar sem data
        if (!selectedDate) {
            alert("Por favor, selecione uma data.");
            return;
        }

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
