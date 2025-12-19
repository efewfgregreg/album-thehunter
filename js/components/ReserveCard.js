// Arquivo: js/components/ReserveCard.js

/**
 * Cria o card visual de uma Reserva com suas estatísticas.
 * @param {Object} reserve - Dados da reserva (nome, imagem).
 * @param {Object} progress - Dados de progresso (collectedRares, collectedDiamonds, etc).
 * @param {Function} onClick - Função executada ao clicar no card.
 */
export function createReserveCard(reserve, progress, onClick) {
    const card = document.createElement('div');
    card.className = 'reserve-card';
    
    // Mantemos o HTML idêntico ao original para preservar o estilo
    // Adicionamos loading="lazy" na imagem
    card.innerHTML = `
        <div class="reserve-image-container">
            <img class="reserve-card-image" 
                 src="${reserve.image}" 
                 loading="lazy" 
                 onerror="this.style.display='none'">
        </div>
        <div class="reserve-card-info-panel">
            <h3>${reserve.name}</h3>
            <div class="reserve-card-stats">
                <span title="Peles Raras">
                    <img src="icones/pata_icon.png" class="custom-icon"> ${progress.collectedRares}
                </span>
                <span title="Diamantes">
                    <img src="icones/diamante_icon.png" class="custom-icon"> ${progress.collectedDiamonds}
                </span>
                <span title="Super Raros">
                    <img src="icones/coroa_icon.png" class="custom-icon"> ${progress.collectedSuperRares}
                </span>
                <span title="Great Ones">
                    <img src="icones/greatone_icon.png" class="custom-icon"> ${progress.collectedGreatOnes}
                </span>
            </div>
        </div>
    `;
    
    // Adiciona efeito visual de clique (opcional, igual ao PageHeader)
    card.addEventListener('click', (e) => {
        // Pequena animação
        card.style.transform = "scale(0.98)";
        setTimeout(() => {
            card.style.transform = "scale(1)";
            onClick();
        }, 100);
    });

    return card;
}