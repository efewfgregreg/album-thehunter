// Arquivo: js/components/AchievementCard.js
import { slugify } from '../utils.js';

/**
 * Cria o card visual de uma Conquista (Card Rotacionado).
 * @param {Object} trophy - Dados do troféu (animalName, furName, slug, type).
 */
export function createAchievementCard(trophy) {
    const card = document.createElement('div');
    card.className = 'achievement-card';
    
    // 1. Define a rotação aleatória para dar o efeito de "jogado na mesa"
    const rotation = Math.random() * 6 - 3; // Entre -3deg e +3deg
    card.style.transform = `rotate(${rotation}deg)`;

    // 2. Lógica de Imagem (baseada no tipo de troféu)
    let imagePathString;
    const animalSlug = trophy.slug;
    
    if (trophy.type === 'diamante') {
        // Tenta achar a imagem da pelagem específica, se não der, usa a padrão
        const gender = trophy.furName.toLowerCase().includes('macho') ? 'macho' : 'femea';
        const pureFurName = trophy.furName.replace(/^(macho|fêmea)\s/i, '').trim();
        const furSlug = slugify(pureFurName);
        imagePathString = `src="animais/pelagens/${animalSlug}_${furSlug}_${gender}.png" onerror="this.onerror=null; this.src='animais/pelagens/${animalSlug}_${furSlug}.png'; this.onerror=null; this.src='animais/${animalSlug}.png';"`;
    } else if (trophy.type === 'greatone') {
        const furSlug = slugify(trophy.furName);
        imagePathString = `src="animais/pelagens/great_${animalSlug}_${furSlug}.png" onerror="this.onerror=null; this.src='animais/${animalSlug}.png';"`;
    } else {
        imagePathString = `src="animais/${animalSlug}.png"`;
    }

    // 3. Monta o HTML com loading="lazy"
    card.innerHTML = `
        <img ${imagePathString} loading="lazy">
        <div class="achievement-card-info">
            <div class="animal-name">${trophy.animalName}</div>
            <div class="fur-name">${trophy.furName.replace(' Diamante','')}</div>
        </div>
    `;

    // 4. Eventos de Mouse (Z-Index para ficar por cima ao passar o mouse)
    card.addEventListener('mouseenter', () => card.style.zIndex = 10);
    card.addEventListener('mouseleave', () => card.style.zIndex = 1);

    return card;
}