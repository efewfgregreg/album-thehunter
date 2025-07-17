// src/js/grindManager.js

import { saveData } from './dataManager.js';

// Adiciona nova sessão de grind
function addGrindSession(savedData, sessionData) {
    if (!savedData.grindSessions) {
        savedData.grindSessions = [];
    }
    savedData.grindSessions.push(sessionData);
    saveData(savedData);
}

// Renderiza lista de sessões de grind
function renderGrindSessions(container, savedData) {
    container.innerHTML = '';

    const title = document.createElement('h2');
    title.textContent = 'Histórico de Sessões de Grind';
    container.appendChild(title);

    const list = document.createElement('ul');

    (savedData.grindSessions || []).forEach((session, index) => {
        const item = document.createElement('li');
        item.textContent = `Sessão ${index + 1}: ${session.animal} - ${session.count} registros`;
        list.appendChild(item);
    });

    container.appendChild(list);
}

export { addGrindSession, renderGrindSessions };
