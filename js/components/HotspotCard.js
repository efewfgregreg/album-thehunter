// Arquivo: js/components/HotspotCard.js

/**
 * Cria o card visual de um Hotspot (Mapa).
 * @param {string} animalName - Nome do animal.
 * @param {string} imagePath - Caminho da imagem do mapa.
 * @param {Function} onClick - Função ao clicar no card.
 */
export function createHotspotCard(animalName, imagePath, onClick) {
    const card = document.createElement('div');
    card.className = 'hotspot-card';
    
    // HTML idêntico ao original, com loading="lazy"
    card.innerHTML = `
        <img src="${imagePath}" 
             alt="Mapa de Hotspot ${animalName}" 
             loading="lazy"
             onerror="this.onerror=null;this.src='animais/placeholder.jpg';">
        <div class="info-overlay">
            <span class="animal-name">${animalName}</span>
            <span class="hotspot-label"><i class="fas fa-map-marker-alt"></i> Hotspot</span>
        </div>
    `;

    // Efeito de clique padrão
    card.addEventListener('click', (e) => {
        card.style.transform = "scale(0.98)";
        setTimeout(() => {
            card.style.transform = "scale(1)";
            onClick();
        }, 100);
    });

    return card;
}