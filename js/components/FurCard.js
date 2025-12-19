// Arquivo: js/components/FurCard.js
import { slugify } from '../utils.js';

/**
 * Cria o card visual de uma pelagem.
 * @param {Object} params - Dados para montar o card.
 * @param {string} params.animalSlug - Slug do animal (ex: 'alce').
 * @param {string} params.furOriginalName - Nome original da pelagem.
 * @param {string} params.furDisplayName - Nome exibido (ex: 'Macho Albino').
 * @param {string} params.gender - 'macho' ou 'femea'.
 * @param {boolean} params.isCompleted - Se o usuário já tem essa pelagem.
 * @param {boolean} params.isSuperRare - (Opcional) Se é super raro.
 * @param {Function} params.onToggle - Função ao clicar no card.
 * @param {Function} params.onFullscreen - Função ao clicar no botão de tela cheia.
 */
export function createFurCard({ animalSlug, furOriginalName, furDisplayName, gender, isCompleted, isSuperRare = false, onToggle, onFullscreen }) {
    const card = document.createElement('div');
    // Adiciona as classes CSS dinamicamente
    card.className = `fur-card ${isCompleted ? 'completed' : 'incomplete'} ${isSuperRare ? 'potential-super-rare' : ''}`;
    
    const furSlug = slugify(furOriginalName);
    const genderSlug = gender.toLowerCase();

    // HTML interno (com Lazy Loading para performance)
    card.innerHTML = `
        <img src="animais/pelagens/${animalSlug}_${furSlug}_${genderSlug}.png" 
             alt="${furDisplayName}"
             loading="lazy"
             onerror="this.onerror=null; this.src='animais/pelagens/${animalSlug}_${furSlug}.png'; this.onerror=null; this.src='animais/${animalSlug}.png';">
        <div class="info">${furDisplayName}</div>
        <button class="fullscreen-btn" title="Ver em tela cheia">⛶</button>
    `;

    // Evento de clique no card inteiro (marcar/desmarcar)
    card.addEventListener('click', () => {
        // Efeito visual instantâneo
        const newStatus = !card.classList.contains('completed');
        if (newStatus) {
            card.classList.remove('incomplete');
            card.classList.add('completed');
        } else {
            card.classList.remove('completed');
            card.classList.add('incomplete');
        }
        // Chama a lógica de salvar
        onToggle();
    });

    // Evento do botão de tela cheia
    const btn = card.querySelector('.fullscreen-btn');
    btn.addEventListener('click', (event) => {
        event.stopPropagation(); // Impede que marque o card ao clicar no zoom
        const imgSrc = card.querySelector('img').src;
        onFullscreen(imgSrc);
    });

    return card;
}