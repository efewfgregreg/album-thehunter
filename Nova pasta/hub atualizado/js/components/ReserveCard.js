// Arquivo: js/components/ReserveCard.js

/**
 * Cria o card visual de uma Reserva com design "Dossiê Tático" - Versão Final.
 */
export function createReserveCard(reserve, progress, onClick) {
    const card = document.createElement('div');
    card.className = 'reserve-card-dossier'; 
    
    const p = {
        rares: progress.collectedRares || 0,
        diamonds: progress.collectedDiamonds || 0,
        superRares: progress.collectedSuperRares || 0,
        greatOnes: progress.collectedGreatOnes || 0
    };

    let activityScore = (p.diamonds * 1.5) + (p.greatOnes * 10) + (p.rares * 0.5);
    activityScore = Math.min(activityScore, 100);

    card.innerHTML = `
        <div class="dossier-header" style="background-image: url('${reserve.image}');">
            <div class="header-overlay"></div>
            </div>

        <div class="dossier-body">
            
            <div class="stats-row primary-stats">
                
                <div class="stat-pod diamond-pod" title="Total de Diamantes">
                    <div class="pod-icon">
                        <img src="icones/diamante_icon.png" alt="Diamante">
                    </div>
                    <div class="pod-info">
                        <span class="pod-value">${p.diamonds}</span>
                        <span class="pod-label">Diamantes</span>
                    </div>
                </div>

                <div class="stat-pod go-pod ${p.greatOnes > 0 ? 'go-active' : ''}" title="Total de Great Ones">
                    <div class="pod-icon">
                        <img src="icones/greatone_icon.png" alt="Great One">
                    </div>
                    <div class="pod-info">
                        <span class="pod-value">${p.greatOnes}</span>
                        <span class="pod-label">Great Ones</span>
                    </div>
                </div>
            </div>

            <div class="stats-row secondary-stats">
                <div class="mini-stat" title="Raros Coletados">
                    <i class="fa-solid fa-paw" style="color: #aaa;"></i>
                    <span>${p.rares} Raros</span>
                </div>
                <div class="mini-stat" title="Super Raros Coletados">
                    <i class="fa-solid fa-crown" style="color: #aaa;"></i>
                    <span>${p.superRares} S. Raros</span>
                </div>
            </div>

            <div class="dossier-footer">
                <div class="progress-track">
                    <div class="progress-fill" style="width: ${activityScore}%"></div>
                </div>
                <div class="access-btn">
                    ACESSAR <i class="fa-solid fa-arrow-right-long"></i>
                </div>
            </div>
        </div>
    `;
    
    card.addEventListener('click', (e) => {
        card.classList.add('card-clicked');
        setTimeout(() => {
            card.classList.remove('card-clicked');
            onClick();
        }, 150);
    });

    return card;
}