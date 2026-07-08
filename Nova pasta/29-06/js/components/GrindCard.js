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
    const diamonds = counts.diamonds?.length || 0;
    const rares = counts.rares?.length || 0;
    const superRares = counts.super_raros?.length || 0;

    // Tratamento de data (prevendo campo futuro 'lastActivity' ou usando fallback)
    let dateText = "Sem registro";
    if (session.lastActivity) {
        const dateObj = new Date(session.lastActivity);
        dateText = !isNaN(dateObj) ? dateObj.toLocaleDateString('pt-BR') : session.lastActivity;
    }

    card.innerHTML = `
        <div class="grind-card-background">
            <img src="animais/${session.animalSlug}.png" 
                 alt="${animalName}" 
                 loading="lazy"
                 onerror="this.style.opacity='0';"> 
        </div>
        
        <div class="grind-card-overlay"></div>

        <div class="grind-card-content simple-layout">
            <div class="grind-card-header">
                <h3 class="grind-card-title">${animalName}</h3>
            </div>
            
            <div class="grind-card-main-stat">
                <span class="stat-label">ABATES TOTAIS</span>
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