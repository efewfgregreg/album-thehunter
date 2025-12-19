// Arquivo: js/components/AnimalCard.js
import { slugify } from '../utils.js';

/**
 * Cria apenas a estrutura visual (HTML) do card do animal.
 * Adicionamos loading="lazy" para melhorar a performance.
 */
export function createCardElement(name) {
    const slug = slugify(name);
    const card = document.createElement('div');
    card.className = 'animal-card';
    card.dataset.slug = slug;
    
    // Dica Visual: loading="lazy" faz o app carregar imagens sob demanda
    card.innerHTML = `
        <img src="animais/${slug}.png" 
             alt="${name}" 
             loading="lazy" 
             onerror="this.onerror=null;this.src='animais/placeholder.png';">
        <div class="card-info">
            <div class="info">${name}</div>
            <div class="progress-container"></div> 
        </div>
    `;
    
    return card;
}