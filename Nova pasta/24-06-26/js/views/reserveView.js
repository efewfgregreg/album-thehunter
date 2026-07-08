// =================================================================
// ARQUIVO: js/views/reserveView.js
// =================================================================
import { savedData, renderMainView } from '../main.js';
import { categorias } from '../constants.js';
import { showCustomAlert, closeModal } from '../auth.js';
import { showDetailView } from './detailView.js'; // Importação circular necessária
import { items, reservesData, diamondFursData, animalHotspotData } from '../../data/gameData.js';
import { slugify } from '../utils.js';
import { calcularReserveProgress } from '../progressLogic.js';
import { createReserveCard } from '../components/ReserveCard.js';
import { createHotspotCard } from '../components/HotspotCard.js';

console.log("🚀 reserveView.js ATUALIZADO - Versão V15 (Export Fix)");

// =================================================================
// =================== LÓGICA DE RENDERIZAÇÃO ======================
// =================================================================

export function renderReservesList(container) {
    container.innerHTML = '';
    const grid = document.createElement('div');
    grid.className = 'reserves-grid';
    container.appendChild(grid);

    const sortedReserves = Object.entries(reservesData).sort(([, a], [, b]) => a.name.localeCompare(b.name));

    for (const [reserveKey, reserve] of sortedReserves) {
        const progress = calcularReserveProgress(reserveKey, savedData);
        const card = createReserveCard(reserve, progress, () => showReserveDetailView(reserveKey));
        grid.appendChild(card);
    }
}

export function showReserveDetailView(reserveKey, originPage = 'reservas') { 
    const mainContent = document.querySelector('.main-content');
    let contentContainer = mainContent.querySelector('.content-container');
    
    if (!contentContainer) {
        contentContainer = document.createElement('div');
        contentContainer.className = 'content-container';
        mainContent.appendChild(contentContainer);
    }
    
    contentContainer.className = 'content-container reserve-detail-view';
    contentContainer.innerHTML = '';

    const reserve = reservesData[reserveKey];
    if (!reserve) return;

    const headerTitle = mainContent.querySelector('.page-header h2');
    if (headerTitle) headerTitle.textContent = reserve.name.toUpperCase();

    const backButton = mainContent.querySelector('.page-header .back-button');
    if (backButton) {
        backButton.innerHTML = `<i class="fa-solid fa-chevron-left"></i> VOLTAR AO HUB`; 
        const newBtn = backButton.cloneNode(true);
        backButton.parentNode.replaceChild(newBtn, backButton);
        newBtn.onclick = () => renderMainView('reservas');
    }

    const viewArea = document.createElement('div');
    viewArea.className = 'reserve-view-area';
    
    const toggleButtons = document.createElement('div');
    toggleButtons.className = 'reserve-view-toggle';
    
    const btnAnimals = document.createElement('button');
    btnAnimals.textContent = 'Animais da Reserva';
    btnAnimals.className = 'toggle-button active';
    
    const btnHotspots = document.createElement('button');
    btnHotspots.textContent = 'Mapas de Hotspot';
    btnHotspots.className = 'toggle-button';

    btnAnimals.onclick = () => {
        btnAnimals.classList.add('active');
        btnHotspots.classList.remove('active');
        renderAnimalChecklist(viewArea, reserveKey);
    };

    btnHotspots.onclick = () => {
        btnHotspots.classList.add('active');
        btnAnimals.classList.remove('active');
        renderHotspotGalleryView(viewArea, reserveKey);
    };

    toggleButtons.appendChild(btnAnimals);
    toggleButtons.appendChild(btnHotspots);

    contentContainer.appendChild(toggleButtons);
    contentContainer.appendChild(viewArea);

    renderAnimalChecklist(viewArea, reserveKey);
}

// =================================================================
// FUNÇÕES AUXILIARES (TÁTICAS / CORREÇÃO DE IMAGEM)
// =================================================================

function renderAnimalChecklist(container, reserveKey) {
    container.innerHTML = '';
    const grid = document.createElement('div');
    grid.className = 'album-grid'; 
    container.appendChild(grid);

    const reserve = reservesData[reserveKey];
    
    const processedAnimals = reserve.animals.map(slug => {
        let displayName = items.find(item => slugify(item) === slug);
        if (!displayName) {
            displayName = slug.replace(/_/g, ' ').replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
        }
        return { slug, name: displayName };
    });

    processedAnimals.sort((a, b) => a.name.localeCompare(b.name)).forEach(animal => {
        const totalDiamonds = (diamondFursData[animal.slug]?.macho?.length || 0) + (diamondFursData[animal.slug]?.femea?.length || 0);
        const collectedDiamonds = new Set((savedData.diamantes?.[animal.slug] || []).map(t => t.type)).size;
        
        let percentage = 0;
        if (totalDiamonds > 0) percentage = (collectedDiamonds / totalDiamonds) * 100;

        const stats = { diamondsPercentage: percentage, isCompleted: percentage >= 100 && totalDiamonds > 0 };

        const card = createTacticalAnimalCard(animal.name, stats);
        // Usa showDetailView passando 'reservas' como origem
        card.onclick = () => showDetailView(animal.slug, 'reservas', reserveKey);
        grid.appendChild(card);
    });
}

function createTacticalAnimalCard(name, stats) {
    const card = document.createElement('div');
    card.className = `animal-card ${stats.isCompleted ? 'is-completed' : ''}`;

    const slug = slugify(name);
    const fileSlug = slug.replace(/-/g, '_'); 
    const imagePath = `animais/${fileSlug}.png`; 

    const img = document.createElement('img');
    img.src = imagePath;
    img.alt = name;
    
    img.onerror = () => { 
        img.style.display = 'none';
        const fallbackIcon = document.createElement('i');
        fallbackIcon.className = 'fa-solid fa-paw'; 
        fallbackIcon.style.cssText = `font-size: 3rem; color: rgba(255,255,255,0.1); position: absolute; top: 40%; left: 50%; transform: translate(-50%, -50%);`;
        card.appendChild(fallbackIcon);
    };
    card.appendChild(img);

    const info = document.createElement('span');
    info.className = 'info';
    info.textContent = name;
    card.appendChild(info);

    const progressContainer = document.createElement('div');
    progressContainer.className = 'progress-container';
    const progressBar = document.createElement('div');
    progressBar.className = 'progress-bar';
    progressBar.style.width = `${stats.diamondsPercentage}%`;
    progressContainer.appendChild(progressBar);
    card.appendChild(progressContainer);

    const glint = document.createElement('div');
    glint.className = 'card-glint';
    card.appendChild(glint);

    return card;
}

function renderHotspotGalleryView(container, reserveKey) {
    container.innerHTML = '';
    const hotspotGrid = document.createElement('div');
    hotspotGrid.className = 'hotspot-grid';
    container.appendChild(hotspotGrid);

    const reserveAnimals = reservesData[reserveKey]?.animals || [];
    const availableHotspots = reserveAnimals
        .map(slug => ({ slug, name: items.find(item => slugify(item) === slug) }))
        .filter(animal => typeof animal.name === 'string' && animalHotspotData[reserveKey]?.[animal.slug]);

    if (availableHotspots.length === 0) {
        hotspotGrid.innerHTML = '<p class="no-data-message">Nenhum mapa disponível para esta reserva.</p>';
        return;
    }

    const reserve = reservesData[reserveKey];

    availableHotspots.sort((a, b) => a.name.localeCompare(b.name)).forEach(animal => {
        const slugReserve = slugify(reserve.name).normalize("NFD").replace(/[\u0300-\u036f]/g, "");
        const imagePath = `hotspots/${slugReserve}_${animal.slug}_hotspot.jpg`;
        
        const card = createHotspotCard(
            animal.name, 
            imagePath, 
            () => renderHotspotSplitView(container, reserveKey, animal.slug, reserve.name, reserve)
        );
        hotspotGrid.appendChild(card);
    });
}

// =================================================================
// FUNÇÕES DE HOTSPOT (SPLIT VIEW)
// =================================================================

// Esta função é chamada internamente por este arquivo
function renderHotspotSplitView(container, reserveKey, animalSlug, reserveName, fullReserveData) {
    const hotspotInfo = animalHotspotData[reserveKey]?.[animalSlug];
    const animalName = items.find(item => slugify(item) === animalSlug) || animalSlug;
    const slugReserve = slugify(reserveName).normalize('NFD').replace(/[\u0300-\u036f]/g, "");
    const imagePath = `hotspots/${slugReserve}_${animalSlug}_hotspot.jpg`;

    container.innerHTML = ''; 

    const splitLayout = document.createElement('div');
    splitLayout.style.cssText = `display: flex; gap: 20px; height: 70vh; width: 100%; background: #121212; border-radius: 12px; overflow: hidden; border: 1px solid #333;`;

    const mapColumn = document.createElement('div');
    mapColumn.style.cssText = `flex: 3; background: #000; position: relative; display: flex; align-items: center; justify-content: center; overflow: hidden;`;

    const backBtn = document.createElement('button');
    backBtn.innerHTML = '<i class="fa-solid fa-arrow-left"></i> Voltar';
    backBtn.style.cssText = `position: absolute; top: 15px; left: 15px; z-index: 10; background: rgba(0,0,0,0.7); color: #fff; border: 1px solid #555; padding: 8px 15px; border-radius: 20px; cursor: pointer; font-weight: bold; font-size: 0.9rem;`;
    
    // IMPORTANTE: Se fullReserveData não for passado (ex: vindo do detailView), tentamos recuperar
    backBtn.onclick = () => {
        if(fullReserveData) {
            renderHotspotGalleryView(container, reserveKey);
        } else {
            // Fallback se não tiver dados para reconstruir a galeria, apenas fecha/limpa
            container.innerHTML = '';
        }
    };
    
    mapColumn.appendChild(backBtn);

    const img = document.createElement('img');
    img.src = imagePath;
    img.style.cssText = "max-width: 100%; max-height: 100%; object-fit: contain;";
    img.onerror = () => { 
        img.style.display = 'none';
        const errorMsg = document.createElement('div');
        errorMsg.innerHTML = '<i class="fa-solid fa-map-location-dot" style="font-size: 3rem; color: #333; margin-bottom: 10px;"></i><p style="color: #666;">Mapa não disponível</p>';
        errorMsg.style.cssText = 'text-align: center;';
        mapColumn.appendChild(errorMsg);
    };
    mapColumn.appendChild(img);

    const infoColumn = document.createElement('div');
    infoColumn.style.cssText = `flex: 1; min-width: 300px; background: #1e1e1e; border-left: 2px solid var(--primary-color); padding: 25px; display: flex; flex-direction: column;`;

    const title = document.createElement('h2');
    title.textContent = animalName;
    title.style.cssText = "color: #fff; font-family: var(--font-headings); font-size: 2rem; margin: 0 0 5px 0; text-transform: uppercase;";
    
    const subtitle = document.createElement('span');
    subtitle.innerHTML = `<i class="fa-solid fa-location-dot"></i> ${reserveName}`;
    subtitle.style.cssText = "color: #888; font-size: 0.9rem; text-transform: uppercase; letter-spacing: 1px; margin-bottom: 30px; display: block;";

    infoColumn.appendChild(title);
    infoColumn.appendChild(subtitle);

    const createInfoRow = (label, value, icon, color = '#fff') => `
        <div style="margin-bottom: 20px; padding-bottom: 15px; border-bottom: 1px solid rgba(255,255,255,0.05);">
            <div style="display: flex; align-items: center; gap: 10px; color: #aaa; font-size: 0.8rem; text-transform: uppercase; margin-bottom: 5px;">
                <i class="fa-solid ${icon}" style="color: var(--primary-color); width: 20px; text-align: center;"></i>
                ${label}
            </div>
            <div style="font-size: 1.4rem; font-weight: bold; color: ${color}; font-family: var(--font-headings); padding-left: 30px;">
                ${value || '---'}
            </div>
        </div>
    `;

    infoColumn.innerHTML += createInfoRow('Horário de Bebida', hotspotInfo?.drinkZonesPotential, 'fa-clock');
    infoColumn.innerHTML += createInfoRow('Classe', hotspotInfo?.animalClass, 'fa-crosshairs');
    infoColumn.innerHTML += createInfoRow('Peso Máximo', hotspotInfo?.maxWeightEstimate, 'fa-weight-hanging');
    infoColumn.innerHTML += createInfoRow('Troféu Máximo', hotspotInfo?.maxScore, 'fa-trophy', '#ffd700');

    splitLayout.appendChild(mapColumn);
    splitLayout.appendChild(infoColumn);

    container.appendChild(splitLayout);
}

// =================================================================
// ★ CORREÇÃO DO ERRO DE IMPORTAÇÃO (Uncaught SyntaxError)
// Esta função é chamada pelo detailView.js (arquivo antigo que ainda busca essa função)
// =================================================================
export function renderHotspotDetailModal(reserveKey, animalSlug) {
    // Tenta encontrar o container do modal global
    const modal = document.getElementById('image-viewer-modal');
    const reserve = reservesData[reserveKey];
    
    // Renderiza a nova Split View dentro do modal (simulando uma visualização de tela cheia mas com o layout novo)
    // Isso satisfaz o detailView.js que espera chamar esta função, mas entrega o visual novo que você quer.
    renderHotspotSplitView(modal, reserveKey, animalSlug, reserve.name, reserve);
    
    // Força o estilo do modal para parecer uma tela cheia
    modal.style.display = 'flex';
    modal.style.alignItems = 'center';
    modal.style.justifyContent = 'center';
    modal.style.padding = '40px';
    modal.style.backgroundColor = 'rgba(0,0,0,0.95)';
    
    // Ajuste no botão de voltar para FECHAR o modal neste caso específico
    const backBtn = modal.querySelector('button');
    if(backBtn) {
        backBtn.innerHTML = '<i class="fa-solid fa-xmark"></i> FECHAR';
        backBtn.onclick = () => closeModal('image-viewer-modal');
    }
}