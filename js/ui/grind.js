// js/ui/grind.js

import { slugify } from '../utils.js';

export function renderGrindManager(container, savedData, onSave) {
    container.innerHTML = '<h2>Gerenciador de Grind</h2>';

    const animalSelect = document.createElement('select');
    Object.keys(savedData).forEach(animalKey => {
        const option = document.createElement('option');
        option.value = animalKey;
        option.textContent = animalKey;
        animalSelect.appendChild(option);
    });

    const newSessionButton = document.createElement('button');
    newSessionButton.textContent = 'Nova Sessão de Grind';
    newSessionButton.onclick = () => {
        const selectedAnimal = animalSelect.value;
        if (!savedData[selectedAnimal].grindSessions) {
            savedData[selectedAnimal].grindSessions = [];
        }
        const sessionId = `${selectedAnimal}_${Date.now()}`;
        savedData[selectedAnimal].grindSessions.push({
            id: sessionId,
            counts: {
                total: 0,
                diamonds: [],
                trolls: 0,
                rares: [],
                super_rares: [],
                great_ones: []
            }
        });
        onSave();
        renderGrindManager(container, savedData, onSave); // Atualiza UI
    };

    container.appendChild(animalSelect);
    container.appendChild(newSessionButton);

    Object.entries(savedData).forEach(([animalKey, animalData]) => {
        if (animalData.grindSessions?.length > 0) {
            const animalSection = document.createElement('div');
            animalSection.innerHTML = `<h3>${animalKey}</h3>`;

            animalData.grindSessions.forEach(session => {
                const sessionDiv = document.createElement('div');
                sessionDiv.textContent = `Sessão ${session.id}: Total: ${session.counts.total}`;
                animalSection.appendChild(sessionDiv);
            });

            container.appendChild(animalSection);
        }
    });
}
