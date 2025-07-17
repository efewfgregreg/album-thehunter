// src/js/trophyRoomManager.js

import { saveData } from './dataManager.js';

function renderTrophyRoom(container, savedData) {
    container.innerHTML = '';

    const title = document.createElement('h2');
    title.textContent = 'Sala de Troféus';
    container.appendChild(title);

    const grid = document.createElement('div');
    grid.className = 'trophy-grid';

    Object.entries(savedData.greats).forEach(([key, value]) => {
        if (value) {
            const trophyFrame = document.createElement('div');
            trophyFrame.className = 'trophy-frame';

            const trophyText = document.createElement('p');
            trophyText.textContent = key.replaceAll('_', ' ');

            trophyFrame.appendChild(trophyText);
            grid.appendChild(trophyFrame);
        }
    });

    container.appendChild(grid);
}

export { renderTrophyRoom };