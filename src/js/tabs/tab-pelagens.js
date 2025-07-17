// src/js/tabs/tab-pelagens.js

import { rareFursData, items } from '../data.js';
import { saveData } from '../dataManager.js';
import { renderMiniProgressBar } from '../progressBarManager.js';

// ================== PELAGENS TAB ==================

function renderPelagensTab(container, savedData) {
    container.innerHTML = '';

    items.forEach(animal => {
        const animalContainer = document.createElement('div');
        animalContainer.className = 'animal-entry';

        const title = document.createElement('h3');
        title.textContent = animal;
        animalContainer.appendChild(title);

        const rareFurs = rareFursData[animal.toLowerCase()];
        if (rareFurs) {
            let total = 0;
            let completed = 0;

            const sections = ['macho', 'femea'];
            sections.forEach(section => {
                const furs = rareFurs[section];
                if (furs && furs.length > 0) {
                    const sectionTitle = document.createElement('h4');
                    sectionTitle.textContent = section.toUpperCase();
                    animalContainer.appendChild(sectionTitle);

                    const list = document.createElement('ul');
                    furs.forEach(fur => {
                        const item = document.createElement('li');

                        const checkbox = document.createElement('input');
                        checkbox.type = 'checkbox';
                        const key = `${animal}_${section}_${fur}`;
                        checkbox.checked = savedData.pelagens[key] || false;

                        if (checkbox.checked) completed++;
                        total++;

                        checkbox.addEventListener('change', () => {
                            savedData.pelagens[key] = checkbox.checked;
                            saveData(savedData);
                            renderMiniProgressBar(progressBarContainer, total, Object.values(savedData.pelagens).filter(v => v).length);
                        });

                        item.appendChild(checkbox);
                        item.append(` ${fur}`);
                        list.appendChild(item);
                    });
                    animalContainer.appendChild(list);
                }
            });

            const progressBarContainer = document.createElement('div');
            animalContainer.appendChild(progressBarContainer);
            renderMiniProgressBar(progressBarContainer, total, completed);
        }

        container.appendChild(animalContainer);
    });
}

export { renderPelagensTab };