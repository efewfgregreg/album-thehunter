import { slugify } from '../utils.js';

export function createCardElement(name) {
    const card = document.createElement('div');
    card.className = 'animal-card';
    
    // Gera o slug (nome do arquivo) usando a nova lógica sem acentos
    const slug = slugify(name);
    card.dataset.slug = slug; // Guarda o slug para uso nos filtros

    // Tenta carregar a imagem da pasta 'animais'
    // Se der erro, carrega o ícone da pata (pata_icon.png) que sabemos que existe na pasta icones
    const imgHTML = `
        <img 
            src="animais/${slug}.png" 
            alt="${name}" 
            loading="lazy"
            onerror="this.onerror=null; this.src='icones/pata_icon.png';"
        >
    `;

    card.innerHTML = `
        <div class="card-image-wrapper">
            ${imgHTML}
        </div>
        <div class="info-container">
            <div class="info">${name}</div>
            <div class="progress-container"></div> 
        </div>
    `;

    return card;
}