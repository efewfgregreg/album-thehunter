// =================================================================
// ========================== MÓDULOS ==============================
// =================================================================
import { slugify, debounce, isTimeInRanges } from '../utils.js';
import { items, reservesData, animalHotspotData, greatsFursData } from '../../data/gameData.js'; // Adicionado greatsFursData
import { savedData, tabScrollPositions} from '../main.js';
import { TABS } from '../constants.js'; // Adicionado TABS
import { getUniqueAnimalData, getAnimalAttributes } from '../progressLogic.js';
import { createCardElement } from '../components/AnimalCard.js';
import { showDetailView, updateCardAppearance } from './detailView.js';
import { categorias } from '../constants.js';
const normalizeText = (text) => {
    if (!text) return '';
    return text.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
};

// =================================================================
// --- FUNÇÃO: Renderiza a visualização padrão (Filtros + Grade) ---
// =================================================================
export function renderStandardCategoryView(container, tabKey) {
    const currentTab = categorias[tabKey];
    if (!currentTab || !container) return;
// 1. Container de Filtros (Layout Horizontal Unificado V2)
    const filtersContainer = document.createElement('div');
    filtersContainer.className = 'filters-container-v2'; // Mudamos para v2 para bater com o CSS
    
    // Campo de Busca
    const filterInput = document.createElement('input');
    filterInput.type = 'text';
    filterInput.className = 'filter-input-main-v2'; // Mudamos para v2
    filterInput.placeholder = '🔍 Buscar animal...';

    // Seletores Técnicos
    const { classes, levels } = getUniqueAnimalData(); 
    const sortedReserves = Object.entries(reservesData).sort(([, a], [, b]) => a.name.localeCompare(b.name));

    const classSelect = document.createElement('select');
    classSelect.className = 'filter-select-v2'; // Mudamos para v2
    classSelect.innerHTML = `<option value="">Classe (Todas)</option>` + classes.map(c => `<option value="${c}">Classe ${c}</option>`).join('');
    
    const levelSelect = document.createElement('select');
    levelSelect.className = 'filter-select-v2'; // Mudamos para v2
    levelSelect.innerHTML = `<option value="">Dificuldade (Todas)</option>` + levels.map(l => `<option value="${l}">${l}</option>`).join('');
    
    const reserveSelect = document.createElement('select');
    reserveSelect.className = 'filter-select-v2'; // Mudamos para v2
    reserveSelect.innerHTML = `<option value="">Reserva (Todas)</option>` + sortedReserves.map(([key, data]) => `<option value="${key}">${data.name}</option>`).join('');

    // Seletor de Horário
    const timeInput = document.createElement('input');
    timeInput.type = 'time';
    timeInput.className = 'filter-input-time-v2'; // Mudamos para v2
    timeInput.title = "Filtrar por Horário de Bebida";

    // Adiciona todos no mesmo container
    filtersContainer.append(filterInput, classSelect, levelSelect, reserveSelect, timeInput);
    
    container.appendChild(filtersContainer);

    // 2. Grid de Animais
    const albumGrid = document.createElement('div');
    albumGrid.className = 'album-grid';
    container.appendChild(albumGrid);

    // --- LÓGICA DE FILTRAGEM DE CATEGORIA (SOLUÇÃO DO GREAT ONES) ---
    let itemsToRender = currentTab.items || items;

    // Se a aba for Great Ones, filtra a lista para mostrar apenas quem tem variante Great One
    if (tabKey === TABS.GREATS) {
        itemsToRender = itemsToRender.filter(name => greatsFursData.hasOwnProperty(slugify(name)));
    }

    itemsToRender.filter(item => typeof item === 'string' && item.trim() !== '')
        .sort((a, b) => a.localeCompare(b))
        .forEach(name => {
            const card = createAnimalCard(name, tabKey);
            albumGrid.appendChild(card);
        });
    
    // 3. Lógica de Busca e Filtros Ativos (Corrigida para V2)
    const applyFilters = () => {
        const searchTerm = normalizeText(filterInput.value);
        const selectedClass = classSelect.value;
        const selectedLevel = levelSelect.value;
        const selectedReserve = reserveSelect.value;
        const selectedTime = timeInput.value;

        albumGrid.querySelectorAll('.animal-card').forEach(card => {
            const infoElement = card.querySelector('.info');
            const animalName = infoElement ? normalizeText(infoElement.textContent) : "";
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

            // CORREÇÃO: Usa setProperty para vencer o !important do CSS
            if (nameMatch && classMatch && levelMatch && reserveMatch && timeMatch) {
                card.style.setProperty('display', 'flex', 'important');
            } else {
                card.style.setProperty('display', 'none', 'important');
            }
        });
    };

    filterInput.addEventListener('input', debounce(applyFilters, 300));
    [classSelect, levelSelect, reserveSelect].forEach(el => el.addEventListener('change', applyFilters));
    timeInput.addEventListener('input', applyFilters);

    if (typeof tabScrollPositions !== 'undefined' && tabScrollPositions[tabKey]) {
        setTimeout(() => { window.scrollTo(0, tabScrollPositions[tabKey]); }, 50); 
    } else {
        window.scrollTo(0, 0);
    }
}

function createAnimalCard(name, tabKey) {
    const card = createCardElement(name);
    const slug = card.dataset.slug;
    card.addEventListener('click', () => showDetailView(name, tabKey));
    updateCardAppearance(card, slug, tabKey);
    return card;
}