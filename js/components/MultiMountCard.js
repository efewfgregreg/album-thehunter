export function createMultiMountCard(mount, status, onClick) {
    const card = document.createElement('div');
    card.className = `mount-card ${status.isComplete ? 'completed' : ''}`;
    card.onclick = onClick;

    // Cabeçalho
    const header = document.createElement('div');
    header.className = 'mount-card-header';
    header.innerHTML = `<h3>${mount.name}</h3>`;
    
    if (status.isComplete) {
        header.innerHTML += `<span class="mount-progress" style="color: var(--completed-color);"><i class="fas fa-check"></i> Completo</span>`;
        // Adiciona a faixa de canto se completo
        const banner = document.createElement('div');
        banner.className = 'mount-completed-banner';
        banner.innerHTML = '<i class="fas fa-crown"></i>';
        card.appendChild(banner);
    } else {
        const metCount = status.fulfillmentRequirements.filter(r => r.met).length;
        const totalCount = status.fulfillmentRequirements.length;
        header.innerHTML += `<span class="mount-progress">${metCount}/${totalCount}</span>`;
    }
    card.appendChild(header);

    // Ícones dos animais
    const animalsContainer = document.createElement('div');
    animalsContainer.className = 'mount-card-animals';
    
    // Mostra até 3 ícones para não poluir
    const uniqueAnimals = [...new Set(mount.animals.map(a => a.slug))].slice(0, 3);
    uniqueAnimals.forEach(slug => {
        const img = document.createElement('img');
        img.src = `icones/${slug}_icon.png`; // Tenta carregar ícone específico
        img.onerror = () => { img.src = 'icones/pata_icon.png'; }; // Fallback
        animalsContainer.appendChild(img);
    });
    
    card.appendChild(animalsContainer);

    return card;
}