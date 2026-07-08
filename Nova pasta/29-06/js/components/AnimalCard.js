import { slugify } from '../utils.js';

/**
 * Cria o elemento visual do card de animal para a checklist da reserva.
 * @param {string} name - Nome formatado do animal.
 * @param {object} stats - Objeto contendo percentual de diamantes e estado de conclusão.
 */
export function createCardElement(name, stats = { diamondsPercentage: 0, isCompleted: false }) {
    const card = document.createElement('div');
    const slug = slugify(name);
    
    // Define a classe base e a classe de conclusão se necessário
    card.className = `animal-card ${stats.isCompleted ? 'is-completed' : ''}`;
    card.dataset.slug = slug;

    // Estrutura profissional com suporte a badge de conclusão e normalização de imagem
    card.innerHTML = `
        <div class="completion-badge" style="${stats.isCompleted ? 'opacity: 1; transform: scale(1);' : 'display: none;'}">
            <i class="fa-solid fa-check"></i>
        </div>
        
        <div class="animal-icon-container">
            <img 
                src="animais/${slug.replace(/-/g, '_')}.png" 
                alt="${name}" 
                loading="lazy"
                onerror="this.onerror=null; this.src='animais/placeholder.png';"
            >
        </div>
        
        <div class="info">${name}</div>
        
        <div class="progress-container">
            <div class="progress-bar" style="width: ${stats.diamondsPercentage}%"></div>
        </div>
    `;

    return card;
}