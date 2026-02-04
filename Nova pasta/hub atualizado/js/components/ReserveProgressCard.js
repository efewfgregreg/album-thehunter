// Arquivo: js/components/ReserveProgressCard.js

/**
 * Cria o card expansível de progresso da reserva.
 * @param {Object} reserve - Dados da reserva (nome, imagem).
 * @param {Object} progress - Dados calculados (collectedRares, totalRares, etc).
 * @param {Function} onDetailsClick - Ao clicar em "Ver Detalhes".
 * @param {Function} onMapClick - Ao clicar em "Ver Mapa".
 */
export function createReserveProgressCard(reserve, progress, onDetailsClick, onMapClick) {
    const card = document.createElement('div');
    card.className = 'reserve-progress-card-v4';
    
    // Define o fundo com gradiente escuro para o texto aparecer
    card.style.backgroundImage = `linear-gradient(rgba(44, 47, 51, 0.7), rgba(44, 47, 51, 0.9)), url('${reserve.image}')`;

    // Calcula porcentagem geral
    const total = (progress.totalRares || 0) + (progress.totalDiamonds || 0) + (progress.totalGreatOnes || 0) + (progress.totalSuperRares || 0);
    const collected = (progress.collectedRares || 0) + (progress.collectedDiamonds || 0) + (progress.collectedGreatOnes || 0) + (progress.collectedSuperRares || 0);
    const percentage = total > 0 ? Math.round((collected / total) * 100) : 0;

    // Função interna para criar as barrinhas coloridas
    const createBar = (label, collected, total, icon) => {
        if (total <= 0) return '';
        const perc = (collected / total) * 100;
        return `
            <div class="rp-detail-item">
                <img src="${icon}" class="custom-icon" alt="${label}">
                <span>${label}:</span>
                <div class="rp-bar-bg"><div class="rp-bar-fill" style="width: ${perc}%;"></div></div>
                <span class="rp-bar-percentage">${Math.round(perc)}%</span>
            </div>`;
    };

    const detailsHTML = [
        createBar('Raras', progress.collectedRares, progress.totalRares, 'icones/pata_icon.png'),
        createBar('Diamantes', progress.collectedDiamonds, progress.totalDiamonds, 'icones/diamante_icon.png'),
        createBar('Super Raras', progress.collectedSuperRares, progress.totalSuperRares, 'icones/coroa_icon.png'),
        createBar('Great Ones', progress.collectedGreatOnes, progress.totalGreatOnes, 'icones/greatone_icon.png')
    ].join('');

    card.innerHTML = `
        <div class="rp-card-header">
            <h3>${reserve.name}</h3>
            <div class="rp-header-percentage">${percentage}%</div>
        </div>
        <div class="rp-card-details">
            ${detailsHTML}
            <div class="rp-actions">
                <button class="back-button view-reserve-btn">Ver Detalhes</button>
                <button class="back-button view-hotspots-btn"><i class="fas fa-map-marked-alt"></i> Ver Mapa</button>
            </div>
        </div>
        <i class="fas fa-chevron-down rp-toggle-icon"></i>
    `;

    // --- EVENTOS ---
    const btnReserve = card.querySelector('.view-reserve-btn');
    const btnHotspots = card.querySelector('.view-hotspots-btn');

    btnReserve.addEventListener('click', (e) => { e.stopPropagation(); onDetailsClick(); });
    btnHotspots.addEventListener('click', (e) => { e.stopPropagation(); onMapClick(); });

    // Lógica de Expandir/Recolher
    card.addEventListener('click', (e) => {
        if (e.target === btnReserve || e.target === btnHotspots) return;
        
        card.classList.toggle('expanded');
        const icon = card.querySelector('.rp-toggle-icon');
        if (card.classList.contains('expanded')) {
            icon.classList.remove('fa-chevron-down');
            icon.classList.add('fa-chevron-up');
        } else {
            icon.classList.remove('fa-chevron-up');
            icon.classList.add('fa-chevron-down');
        }
    });

    return card;
}