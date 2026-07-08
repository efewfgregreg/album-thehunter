// Arquivo: js/components/FurCard.js

import { slugify, createSafeImgTag } from '../utils.js';

/**
 * Cria o elemento HTML de um card de pelagem.
 * Versão Refatorada: Usa gerador de imagens seguro.
 */
export function createFurCard({ 
    animalSlug, 
    furOriginalName, 
    furDisplayName, 
    gender, 
    isCompleted, 
    isSuperRare = false, 
    onToggle, 
    onFullscreen 
}) {
    // Tratamento de strings
    const furSlug = slugify(furOriginalName);
    
    // --- LÓGICA DE IMAGEM CENTRALIZADA ---
    // Define os caminhos de tentativa (Específico -> Genérico -> Placeholder)
    const primaryPath = `animais/pelagens/${animalSlug}_${furSlug}_${gender}.png`;
    const fallbackPath = `animais/pelagens/${animalSlug}_${furSlug}.png`;
    const placeholderPath = `animais/${animalSlug}.png`;
    
    // Gera a tag IMG segura usando a função do utils.js
    const imgTag = createSafeImgTag(primaryPath, fallbackPath, placeholderPath, furDisplayName);
    // -------------------------------------

    const card = document.createElement('div');
    // Adiciona classe extra se for Super Raro
    const rareClass = isSuperRare ? 'super-rare-card' : '';
    card.className = `fur-card ${rareClass} ${isCompleted ? 'completed' : 'incomplete'}`;

    // Monta o HTML interno
    card.innerHTML = `
        ${imgTag}
        <div class="info-header">
            ${isSuperRare ? '' : `<span class="gender-tag">${gender}</span>`}
            <div class="info">${furDisplayName}</div>
        </div>
        <button class="fullscreen-btn" title="Ver em tela cheia">⛶</button>
    `;

    // Evento 1: Clique no card (Salvar/Alternar)
    card.addEventListener('click', () => {
        onToggle(); // Executa a lógica de dados
        
        // Atualiza o visual instantaneamente (Feedback UX)
        if (card.classList.contains('incomplete')) {
            card.classList.replace('incomplete', 'completed');
        } else {
            card.classList.replace('completed', 'incomplete');
        }
    });

    // Evento 2: Clique no botão de Tela Cheia
    const btnFull = card.querySelector('.fullscreen-btn');
    btnFull.addEventListener('click', (e) => {
        e.stopPropagation();
        const imgSrc = card.querySelector('img').src;
        onFullscreen(imgSrc);
    });

    return card;
}