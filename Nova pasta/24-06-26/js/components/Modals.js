export function createGreatOneTrophyContent({ animalName, furName, trophies, onSave, onDelete, onCancel }) {
    const container = document.createElement('div');
    container.className = 'modal-content-box';
    
    container.innerHTML = `
        <h3>Gerenciar Great One: ${animalName}</h3>
        <p>Pelagem: <strong>${furName}</strong></p>
        
        <div class="trophy-list-column">
            <h4>Seus Abates:</h4>
            ${trophies.length === 0 ? '<p class="no-trophies-message">Nenhum registrado ainda.</p>' : ''}
            <div class="trophy-log-grid">
                ${trophies.map((t, index) => `
                    <div class="trophy-log-card">
                        <div class="trophy-card-header">
                            <strong>Abate #${index + 1}</strong>
                            <button class="delete-trophy-btn" data-index="${index}">&times;</button>
                        </div>
                        <div class="stat-item"><i class="far fa-calendar-alt"></i> ${new Date(t.date).toLocaleDateString()}</div>
                    </div>
                `).join('')}
            </div>
        </div>
        
        <div class="modal-buttons">
            <button id="modal-cancel-btn" class="back-button">Fechar</button>
            <button id="modal-add-btn" class="auth-button" style="width: auto;">+ Registrar Novo</button>
        </div>
    `;

    // Eventos
    container.querySelector('#modal-cancel-btn').onclick = onCancel;
    
    container.querySelector('#modal-add-btn').onclick = () => {
        // Salva com a data de hoje
        onSave({ date: new Date().toISOString() });
    };

    container.querySelectorAll('.delete-trophy-btn').forEach(btn => {
        btn.onclick = () => onDelete(parseInt(btn.dataset.index));
    });

    return container;
}

export function createGrindFurSelectionContent({ title, animalName, animalSlug, furs, onCancel, onSelect }) {
    const container = document.createElement('div');
    container.className = 'grind-detail-modal-content modal-content-box';

    container.innerHTML = `
        <h3>${title}</h3>
        <p>${animalName}</p>
        <div class="fur-selection-grid"></div>
        <div class="modal-buttons">
            <button class="back-button">Cancelar</button>
        </div>
    `;

    const grid = container.querySelector('.fur-selection-grid');
    furs.forEach(fur => {
        const card = document.createElement('div');
        card.className = 'fur-selection-card';
        
        // Tenta montar o caminho da imagem baseado no padrão do seu projeto
        let imgSrc = `animais/pelagens/${animalSlug}_${fur.originalName.toLowerCase().replace(/ /g, '_')}`;
        if (fur.gender) imgSrc += `_${fur.gender}`;
        imgSrc += '.png';

        card.innerHTML = `
            <img src="${imgSrc}" onerror="this.src='animais/${animalSlug}.png'">
            <span>${fur.displayName}</span>
        `;
        
        card.onclick = () => onSelect(fur.displayName);
        grid.appendChild(card);
    });

    container.querySelector('.back-button').onclick = onCancel;

    return container;
}