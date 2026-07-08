// Arquivo: js/components/GrindCard.js

/**
 * Cria o card visual de uma sessão de Grind com novo design tático.
 * Estrutura focada em imagem de fundo, destaque numérico e hierarquia clara.
 * * @param {Object} session - Dados da sessão (abates, diamantes, etc).
 * @param {string} animalName - Nome do animal formatado (ex: "Alce").
 * @param {Function} onClick - Função executada ao clicar no card.
 */
export function createGrindCard(session, animalName, onClick) {
    const card = document.createElement('div');
    card.className = 'grind-card';
    
    // Extração segura de dados
    const counts = session.counts || {};
    const total = counts.total || 0;

    // Fallback resiliente para garantir que o título do animal nunca renderize "undefined"
    const displayAnimalName = (animalName && animalName !== 'undefined') 
        ? animalName 
        : (session.animalSlug ? session.animalSlug.charAt(0).toUpperCase() + session.animalSlug.slice(1).replace(/[-_]/g, ' ') : 'Animal Desconhecido');

    // Suporte unificado para carimbo de tempo (lastUpdate presente no backup vs lastActivity)
    const actualTimestamp = session.lastUpdate || session.lastActivity || null;
    let dateText = "Sem registro";
    if (actualTimestamp) {
        const dateObj = new Date(actualTimestamp);
        dateText = !isNaN(dateObj) ? dateObj.toLocaleDateString('pt-BR') : actualTimestamp;
    }

    // Normalização do caminho do arquivo de imagem convertendo hífens para sublinhados
    const safeImageSlug = session.animalSlug ? session.animalSlug.replace(/-/g, '_') : 'placeholder';

    card.innerHTML = `
        <div class="grind-card-background">
            <img src="animais/${safeImageSlug}.png" 
                 alt="${displayAnimalName}" 
                 loading="lazy"
                 onerror="this.onerror=null; this.src='animais/placeholder.png';"> 
        </div>
        
        <div class="grind-card-overlay"></div>

        <div class="grind-card-content simple-layout">
            <div class="grind-card-header">
                <h3 class="grind-card-title">${displayAnimalName}</h3>
            </div>
            
            <div class="grind-card-main-stat">
                <span class="stat-value highlight-glow">${total}</span>
            </div>

            <div class="grind-card-footer">
                <span class="last-activity"><i class="fas fa-clock"></i> ${dateText}</span>
            </div>
        </div>
    `;

    // Interatividade
    card.addEventListener('click', (e) => {
        // Feedback tátil simples via JS, animações complexas ficam no CSS
        onClick();
    });

    return card;
}