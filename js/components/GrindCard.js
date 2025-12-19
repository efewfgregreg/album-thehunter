// Arquivo: js/components/GrindCard.js

/**
 * Cria o card visual de uma sessão de Grind.
 * @param {Object} session - Dados da sessão (abates, diamantes, etc).
 * @param {string} animalName - Nome do animal formatado (ex: "Alce").
 * @param {Function} onClick - Função ao clicar no card.
 */
export function createGrindCard(session, animalName, onClick) {
    const card = document.createElement('div');
    card.className = 'grind-card';
    
    // Contagem segura (evita erro se for undefined)
    const counts = session.counts || {};
    const total = counts.total || 0;
    const diamonds = counts.diamonds?.length || 0;
    const rares = counts.rares?.length || 0;
    const superRares = counts.super_raros?.length || 0;

    // HTML igual ao original, mas com loading="lazy" na imagem
    card.innerHTML = `
        <img src="animais/${session.animalSlug}.png" 
             class="grind-card-bg-silhouette" 
             loading="lazy"
             onerror="this.style.display='none'">
        <div class="grind-card-content">
            <div class="grind-card-header">
                <span class="grind-card-animal-name">${animalName}</span>
            </div>
            <div class="grind-card-stats-grid">
                <div class="grind-stat">
                    <img src="icones/caveira_icon.png" class="custom-icon" alt="Abates">
                    <span>${total}</span>
                </div>
                <div class="grind-stat">
                    <img src="icones/diamante_icon.png" class="custom-icon" alt="Diamantes">
                    <span>${diamonds}</span>
                </div>
                <div class="grind-stat">
                    <img src="icones/pata_icon.png" class="custom-icon" alt="Raros">
                    <span>${rares}</span>
                </div>
                <div class="grind-stat">
                    <img src="icones/coroa_icon.png" class="custom-icon" alt="Super Raros">
                    <span>${superRares}</span>
                </div>
            </div>
        </div>
    `;

    // Efeito de clique
    card.addEventListener('click', (e) => {
        card.style.transform = "scale(0.98)";
        setTimeout(() => {
            card.style.transform = "scale(1)";
            onClick();
        }, 100);
    });

    return card;
}