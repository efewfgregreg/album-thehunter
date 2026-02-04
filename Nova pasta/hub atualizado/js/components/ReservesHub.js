// =================================================================
// ARQUIVO: js/components/ReservesHub.js
// =================================================================
import { items, diamondFursData, animalHotspotData } from '../../data/gameData.js';
import { slugify } from '../utils.js';
import { calcularReserveProgress } from '../progressLogic.js';
import { createReserveCard } from './ReserveCard.js';
import { createHotspotCard } from './HotspotCard.js';
import { closeModal, showCustomAlert } from '../auth.js';

console.log("🚀 ReservesHub.js CARREGADO - Versão V14 (Split View + No 404)");

/**
 * RENDERIZA A LISTA DE RESERVAS
 */
export function renderReservesHub(container, reservesData, savedData, onReserveClick) {
    container.innerHTML = '';
    const grid = document.createElement('div');
    grid.className = 'reserves-grid';
    container.appendChild(grid);

    const sortedReserves = Object.entries(reservesData).sort(([, a], [, b]) => a.name.localeCompare(b.name));

    for (const [reserveKey, reserve] of sortedReserves) {
        const progress = calcularReserveProgress(reserveKey, savedData);
        const card = createReserveCard(reserve, progress, () => {
            if (onReserveClick) onReserveClick(reserveKey);
        });
        grid.appendChild(card);
    }
}

/**
 * RENDERIZA OS DETALHES DA RESERVA (Abas de Animais e Hotspots)
 */
export function renderReserveDetails(container, reserveKey, reserve, savedData, onBack, onAnimalClick) {
    container.className = 'content-container reserve-detail-view';
    container.innerHTML = '';

    // Header Config
    const pageHeader = document.querySelector('.page-header');
    if (pageHeader) {
        const titleEl = pageHeader.querySelector('h2');
        if (titleEl) titleEl.textContent = reserve.name.toUpperCase();

        const backBtn = pageHeader.querySelector('.back-button');
        if (backBtn) {
            backBtn.innerHTML = `<i class="fa-solid fa-chevron-left"></i> VOLTAR AO HUB`;
            const newBtn = backBtn.cloneNode(true);
            backBtn.parentNode.replaceChild(newBtn, backBtn);
            newBtn.onclick = onBack;
        }
    }

    // Área de Conteúdo
    const viewArea = document.createElement('div');
    viewArea.className = 'reserve-view-area';
    
    // Botões de Aba
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
        renderAnimalList(viewArea, reserve, savedData, onAnimalClick);
    };

    btnHotspots.onclick = () => {
        btnHotspots.classList.add('active');
        btnAnimals.classList.remove('active');
        renderHotspotGallery(viewArea, reserveKey, reserve);
    };

    toggleButtons.appendChild(btnAnimals);
    toggleButtons.appendChild(btnHotspots);

    container.appendChild(toggleButtons);
    container.appendChild(viewArea);

    renderAnimalList(viewArea, reserve, savedData, onAnimalClick);
}

// --- ABA 1: ANIMAIS ---
function renderAnimalList(container, reserve, savedData, onAnimalClick) {
    container.innerHTML = '';
    const grid = document.createElement('div');
    grid.className = 'album-grid'; 
    container.appendChild(grid);

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

        const stats = {
            diamondsPercentage: percentage,
            isCompleted: percentage >= 100 && totalDiamonds > 0
        };

        const card = createTacticalAnimalCard(animal.name, stats);
        card.onclick = () => { if (onAnimalClick) onAnimalClick(animal.slug); };
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
    
    // Tratamento de Erro Silencioso (Sem console vermelho)
    img.onerror = () => { 
        img.style.display = 'none'; // Esconde a imagem quebrada
        const fallbackIcon = document.createElement('i');
        fallbackIcon.className = 'fa-solid fa-paw'; // Ícone de Pata
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

// --- ABA 2: GALERIA DE HOTSPOTS ---
function renderHotspotGallery(container, reserveKey, reserve) {
    container.innerHTML = '';
    const hotspotGrid = document.createElement('div');
    hotspotGrid.className = 'hotspot-grid';
    container.appendChild(hotspotGrid);

    const availableHotspots = reserve.animals
        .map(slug => ({ slug, name: items.find(item => slugify(item) === slug) }))
        .filter(animal => typeof animal.name === 'string' && animalHotspotData[reserveKey]?.[animal.slug]);

    if (availableHotspots.length === 0) {
        hotspotGrid.innerHTML = '<p class="no-data-message">Nenhum mapa disponível para esta reserva.</p>';
        return;
    }

    availableHotspots.sort((a, b) => a.name.localeCompare(b.name)).forEach(animal => {
        const slugReserve = slugify(reserve.name).normalize("NFD").replace(/[\u0300-\u036f]/g, "");
        const imagePath = `hotspots/${slugReserve}_${animal.slug}_hotspot.jpg`;
        
        const card = createHotspotCard(
            animal.name, 
            imagePath, 
            // AQUI É A MÁGICA: Chama a Split View passando o container e os dados completos
            () => renderHotspotSplitView(container, reserveKey, animal.slug, reserve.name, reserve)
        );
        hotspotGrid.appendChild(card);
    });
}

/**
 * VISUALIZAÇÃO DIVIDIDA (SPLIT VIEW) - MAPA + INFO
 */
function renderHotspotSplitView(container, reserveKey, animalSlug, reserveName, fullReserveData) {
    const hotspotInfo = animalHotspotData[reserveKey]?.[animalSlug];
    const animalName = items.find(item => slugify(item) === animalSlug) || animalSlug;
    
    const slugReserve = slugify(reserveName).normalize('NFD').replace(/[\u0300-\u036f]/g, "");
    const imagePath = `hotspots/${slugReserve}_${animalSlug}_hotspot.jpg`;

    container.innerHTML = ''; // Limpa a galeria para mostrar o split view

    // Layout Flexbox
    const splitLayout = document.createElement('div');
    splitLayout.style.cssText = `display: flex; gap: 20px; height: 70vh; width: 100%; background: #121212; border-radius: 12px; overflow: hidden; border: 1px solid #333;`;

    // 1. Coluna Esquerda (Mapa)
    const mapColumn = document.createElement('div');
    mapColumn.style.cssText = `flex: 3; background: #000; position: relative; display: flex; align-items: center; justify-content: center; overflow: hidden;`;

    // Botão Voltar para Galeria
    const backBtn = document.createElement('button');
    backBtn.innerHTML = '<i class="fa-solid fa-arrow-left"></i> Voltar';
    backBtn.style.cssText = `position: absolute; top: 15px; left: 15px; z-index: 10; background: rgba(0,0,0,0.7); color: #fff; border: 1px solid #555; padding: 8px 15px; border-radius: 20px; cursor: pointer; font-weight: bold; font-size: 0.9rem;`;
    
    // Ação de Voltar: Reconstrói a galeria usando os dados salvos
    backBtn.onclick = () => renderHotspotGallery(container, reserveKey, fullReserveData);
    mapColumn.appendChild(backBtn);

    const img = document.createElement('img');
    img.src = imagePath;
    img.style.cssText = "max-width: 100%; max-height: 100%; object-fit: contain;";
    
    // Tratamento de Erro do Mapa
    img.onerror = () => { 
        img.style.display = 'none';
        const errorMsg = document.createElement('div');
        errorMsg.innerHTML = '<i class="fa-solid fa-map-location-dot" style="font-size: 3rem; color: #333; margin-bottom: 10px;"></i><p style="color: #666;">Mapa não disponível</p>';
        errorMsg.style.cssText = 'text-align: center;';
        mapColumn.appendChild(errorMsg);
    };
    mapColumn.appendChild(img);

    // 2. Coluna Direita (Info)
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