// src/js/progressManager.js

import { saveData } from './dataManager.js';

// Atualiza o painel de progresso padrão
function updateNewProgressPanel(contentArea, savedData) {
    contentArea.innerHTML = '';

    const summary = document.createElement('div');
    summary.className = 'progress-summary';

    const pelagensCount = Object.values(savedData.pelagens).filter(v => v).length;
    const diamantesCount = Object.values(savedData.diamantes).filter(v => v).length;
    const greatsCount = Object.values(savedData.greats).filter(v => v).length;
    const superRarosTotal = Object.values(savedData.super_raros).reduce((acc, val) => acc + val, 0);

    summary.innerHTML = `
        <p><strong>Pelagens registradas:</strong> ${pelagensCount}</p>
        <p><strong>Diamantes registrados:</strong> ${diamantesCount}</p>
        <p><strong>Greats registrados:</strong> ${greatsCount}</p>
        <p><strong>Total Super Raros:</strong> ${superRarosTotal}</p>
    `;

    contentArea.appendChild(summary);
}

// Renderiza o ranking de caça
function renderHuntingRankingView(contentArea, savedData) {
    contentArea.innerHTML = '';

    const table = document.createElement('table');
    table.className = 'ranking-table';

    const header = document.createElement('tr');
    header.innerHTML = `
        <th>Categoria</th>
        <th>Total Registrado</th>
    `;
    table.appendChild(header);

    const categories = [
        { name: 'Pelagens', total: Object.values(savedData.pelagens).filter(v => v).length },
        { name: 'Diamantes', total: Object.values(savedData.diamantes).filter(v => v).length },
        { name: 'Greats', total: Object.values(savedData.greats).filter(v => v).length },
        { name: 'Super Raros', total: Object.values(savedData.super_raros).reduce((acc, val) => acc + val, 0) }
    ];

    categories.forEach(cat => {
        const row = document.createElement('tr');
        row.innerHTML = `<td>${cat.name}</td><td>${cat.total}</td>`;
        table.appendChild(row);
    });

    contentArea.appendChild(table);
}

export { updateNewProgressPanel, renderHuntingRankingView };