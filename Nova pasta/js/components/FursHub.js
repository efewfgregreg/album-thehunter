// Arquivo: js/components/FursHub.js

import { items } from '../../data/gameData.js';
import { createCardElement } from './AnimalCard.js';

/**
 * Renderiza a grelha de animais para as abas de pelagens
 * @param {HTMLElement} parentElement - Onde desenhar
 * @param {string} tabId - O ID único da aba (ex: 'tab-diamonds', 'tab-rares')
 * @param {Function} onAnimalClick - O que acontece ao clicar no animal
 */
export function renderFursHub(parentElement, tabId, onAnimalClick) {
    // 1. Limpa o container
    parentElement.innerHTML = '';

    // 2. CRIA O ISOLAMENTO (O "Cercadinho")
    const wrapper = document.createElement('div');
    wrapper.id = tabId; // <--- O ID que protege o CSS (ex: #tab-diamonds)
    wrapper.className = 'furs-hub-wrapper';
    wrapper.style.width = '100%';

    // 3. Container da Grelha
    const grid = document.createElement('div');
    grid.className = 'animal-grid'; // Usa a sua classe padrão de grelha
    wrapper.appendChild(grid);

    // 4. Renderiza os cards de animais
    items.forEach(animalName => {
        const card = createCardElement(animalName);
        card.onclick = () => onAnimalClick(animalName);
        grid.appendChild(card);
    });

    // 5. Adiciona à tela
    parentElement.appendChild(wrapper);
}