// src/js/tabs/tab-super-raros.js

import { items } from '../data.js';
import { saveData } from '../dataManager.js';
import { renderMiniProgressBar } from '../progressBarManager.js';

// Função para renderizar a aba Super Raros
function renderSuperRarosTab(container, savedData) {
    container.innerHTML = '';

    items.forEach(animal => {
        const animalContainer = document.createElement('div');
        animalContainer.className = 'animal-entry';

        const title = document.createElement('h3');
        title.textContent = animal;
        animalContainer.appendChild(title);

        const input = document.createElement('input');
        input.type = 'number';
        input.placeholder = 'Qtd. Super Raros';
        input.min = 0;

        const key = `${animal}_super_raro`;
        input.value = savedData.super_raros[key] || 0;

        input.addEventListener('change', () => {
            savedData.super_raros[key] = parseInt(input.value) || 0;
            saveData(savedData);
            renderMiniProgressBar(progressBarContainer, 1, savedData.super_raros[key]);
        });

        animalContainer.appendChild(input);

        const progressBarContainer = document.createElement('div');
        animalContainer.appendChild(progressBarContainer);
        renderMiniProgressBar(progressBarContainer, 1, parseInt(input.value) || 0);

        container.appendChild(animalContainer);
    });
}

export { renderSuperRarosTab };