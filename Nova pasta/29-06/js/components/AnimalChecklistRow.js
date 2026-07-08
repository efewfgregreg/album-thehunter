// Arquivo: js/components/AnimalChecklistRow.js
import { slugify } from '../utils.js';

/**
 * Cria uma linha visual para a lista de animais da reserva.
 * @param {Object} params - Parâmetros do componente.
 * @param {string} params.animalName - Nome do animal.
 * @param {Object} params.stats - Estatísticas (collectedRares, totalRares, etc).
 * @param {boolean} params.isGreatOne - Se o animal tem Great One.
 * @param {Function} params.onClick - Função ao clicar na linha.
 */
export function createAnimalChecklistRow({ animalName, stats, isGreatOne, onClick }) {
    const slug = slugify(animalName);
    const row = document.createElement('div');
    row.className = 'animal-checklist-row';
    
    // HTML limpo com Lazy Loading
    row.innerHTML = `
        <img class="animal-icon" 
             src="animais/${slug}.png" 
             loading="lazy"
             onerror="this.src='animais/placeholder.png'">
        <div class="animal-name">${animalName}</div>
        <div class="mini-progress-bars">
            <div class="mini-progress" title="Pelagens Raras: ${stats.collectedRares}/${stats.totalRares}">
                <img src="icones/pata_icon.png" class="custom-icon">
                <div class="mini-progress-bar-container">
                    <div class="mini-progress-bar" style="width: ${stats.raresPercentage}%"></div>
                </div>
            </div>
            <div class="mini-progress" title="Diamantes: ${stats.collectedDiamonds}/${stats.totalDiamonds}">
                <img src="icones/diamante_icon.png" class="custom-icon">
                <div class="mini-progress-bar-container">
                    <div class="mini-progress-bar" style="width: ${stats.diamondsPercentage}%"></div>
                </div>
            </div>
        </div>
        <img src="icones/greatone_icon.png" class="custom-icon great-one-indicator ${isGreatOne ? 'possible' : ''}" title="Pode ser Great One">
    `;
    
    // Efeito visual de clique (feedback tátil)
    row.addEventListener('click', () => {
        row.style.backgroundColor = 'rgba(255, 255, 255, 0.1)'; // Ilumina levemente
        setTimeout(() => {
            row.style.backgroundColor = '';
            onClick();
        }, 100);
    });
    
    return row;
}