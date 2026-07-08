// Arquivo: js/components/GrindHub.js

// ATENÇÃO: Os dois pontos (../../) são para voltar duas pastas (components -> js -> raiz)
import { reservesData, items } from '../../data/gameData.js'; 
import { slugify } from '../utils.js';
import { createGrindCard } from './GrindCard.js';

/**
 * Renderiza a tela principal do Hub de Grind (Lista de Grinds Ativos)
 */
export function createGrindHub(parentElement, savedData, onNewGrind, onOpenGrind) {
    // 1. Limpa o pai
    parentElement.innerHTML = '';

    // 2. Cria o Container Isolado (O "Cercadinho" com ID para o CSS)
    const wrapper = document.createElement('div');
    wrapper.id = 'tab-grind'; 
    wrapper.className = 'grind-hub-wrapper';
    wrapper.style.width = '100%';

    // 3. Estrutura interna
    const hubContainer = document.createElement('div');
    hubContainer.className = 'grind-hub-container';
    wrapper.appendChild(hubContainer);

    // 4. Botão de Novo Grind
    const newGrindButton = document.createElement('div');
    newGrindButton.className = 'new-grind-btn';
    newGrindButton.innerHTML = `<i class="fas fa-plus-circle"></i><span>Iniciar Novo Grind</span>`;
    newGrindButton.onclick = onNewGrind; 
    hubContainer.appendChild(newGrindButton);

    // 5. Título
    const existingGrindsTitle = document.createElement('h3');
    existingGrindsTitle.className = 'existing-grinds-title';
    existingGrindsTitle.innerHTML = '<i class="fas fa-history"></i> Grinds em Andamento';
    hubContainer.appendChild(existingGrindsTitle);

    // 6. Lista de Grinds
    if (savedData.grindSessions && savedData.grindSessions.length > 0) {
        // Agrupa por reserva
        const grindsByReserve = savedData.grindSessions.reduce((acc, session) => {
            const key = session.reserveKey;
            if (!acc[key]) acc[key] = [];
            acc[key].push(session);
            return acc;
        }, {});

        // Ordena reservas por nome
        const sortedReserveKeys = Object.keys(grindsByReserve).sort((a, b) => 
            (reservesData[a]?.name || '').localeCompare(reservesData[b]?.name || '')
        );

        sortedReserveKeys.forEach(reserveKey => {
            const reserveSessions = grindsByReserve[reserveKey];
            const reserve = reservesData[reserveKey];

            // Grupo da Reserva
            const reserveGroup = document.createElement('div');
            reserveGroup.className = 'grind-reserve-group';

            const reserveTitle = document.createElement('h4');
            reserveTitle.className = 'grind-reserve-title';
            reserveTitle.innerHTML = `<i class="fas fa-map-marked-alt"></i> ${reserve.name}`;
            reserveGroup.appendChild(reserveTitle);

            // Grid de Cards
            const grid = document.createElement('div');
            grid.className = 'grinds-grid';

            reserveSessions.forEach(session => {
                const animalName = items.find(item => slugify(item) === session.animalSlug);
                
                // Cria o Card usando o componente existente
                const card = createGrindCard(session, animalName, () => onOpenGrind(session.id));
                grid.appendChild(card);
            });

            reserveGroup.appendChild(grid);
            hubContainer.appendChild(reserveGroup);
        });
    } else {
        // Estado Vazio (Sem grinds)
        const emptyStateContainer = document.createElement('div');
        emptyStateContainer.innerHTML = `
            <div class="empty-state-container">
                <i class="fas fa-crosshairs empty-state-icon"></i>
                <h3 class="empty-state-title">Nenhum Grind Iniciado</h3>
                <p class="empty-state-message">O Contador de Grind ajuda a rastrear seus abates e troféus. Crie seu primeiro grind agora!</p>
                <button class="empty-state-cta">Começar meu primeiro Grind</button>
            </div>`;
        emptyStateContainer.querySelector('.empty-state-cta').addEventListener('click', onNewGrind);
        hubContainer.appendChild(emptyStateContainer);
    }

    // 7. Adiciona tudo à tela
    parentElement.appendChild(wrapper);
}