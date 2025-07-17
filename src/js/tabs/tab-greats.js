// src/js/tabs/tab-greats.js

import { greatsFursData, items } from '../data.js';
import { saveData } from '../dataManager.js';
import { renderMiniProgressBar } from '../progressBarManager.js';

// Função para renderizar a aba Greats
function renderGreatsTab(container, savedData) {
    container.innerHTML = '';

    items.forEach(animal => {
        const animalContainer = document.createElement('div');
        animalContainer.className = 'animal-entry';

        const title = document.createElement('h3');
        title.textContent = animal;
        animalContainer.appendChild(title);

        const greatsFurs = greatsFursData[animal.toLowerCase()];
        if (greatsFurs && greatsFurs.length > 0) {
            let total = greatsFurs.length;
            let completed = 0;

            const list = document.createElement('ul');
            greatsFurs.forEach(fur => {
                const item = document.createElement('li');

                const checkbox = document.createElement('input');
                checkbox.type = 'checkbox';
                const key = `${animal}_great_${fur}`;
                checkbox.checked = savedData.greats[key] || false;

                if (checkbox.checked) completed++;

                checkbox.addEventListener('change', () => {
                    savedData.greats[key] = checkbox.checked;
                    saveData(savedData);
                    renderMiniProgressBar(progressBarContainer, total, Object.values(savedData.greats).filter(v => v).length);
                });

                item.appendChild(checkbox);
                item.append(` ${fur}`);
                list.appendChild(item);
            });
            animalContainer.appendChild(list);

            const progressBarContainer = document.createElement('div');
            animalContainer.appendChild(progressBarContainer);
            renderMiniProgressBar(progressBarContainer, total, completed);
        }

        container.appendChild(animalContainer);
    });
}

export { renderGreatsTab };