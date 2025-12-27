// Arquivo: js/components/ZoneManager.js
import { showCustomAlert } from '../auth.js';

export function renderZoneManager(container, session, isOpen, onUpdate) {
    const wrapper = document.createElement('div');
    wrapper.className = 'zone-manager-container';
    
    wrapper.innerHTML = `
        <details ${isOpen ? 'open' : ''}>
            <summary class="zone-manager-header">
                <h3><i class="fas fa-map-pin"></i> Gerenciador de Zonas</h3>
                <span class="zone-count-badge">${session.zones.length} Zonas</span>
            </summary>
            <div class="zone-manager-body">
                <div class="add-zone-form">
                    <input type="text" id="zone-name-input" placeholder="Nome da Zona (Ex: Lago Superior)" style="flex: 1;">
                    <button id="add-zone-btn" class="back-button"><i class="fas fa-plus"></i> Add</button>
                </div>
                <div id="zone-list" class="zone-list"></div>
            </div>
        </details>
    `;

    const zoneListContainer = wrapper.querySelector('#zone-list');
    
    // Renderiza a lista interna
    const renderList = () => {
        zoneListContainer.innerHTML = '';
        if (session.zones.length === 0) {
            zoneListContainer.innerHTML = '<p class="no-zones-message">Nenhuma zona registrada.</p>';
            return;
        }
        
        session.zones.map((z, i) => ({...z, idx: i})).sort((a, b) => a.name.localeCompare(b.name, undefined, { numeric: true }))
        .forEach(zone => {
            const el = document.createElement('div');
            el.className = `zone-card`;
            
            let statusLabel = 'ATIVA';
            let statusClass = 'status-active';
            if (zone.status === 'stacking') { statusLabel = 'STACKING'; statusClass = 'status-stacking'; }
            if (zone.status === 'solo') { statusLabel = 'SOLO'; statusClass = 'status-solo'; }

            let animalsHTML = '<div class="zone-animal-list">';
            if (zone.animals && zone.animals.length > 0) {
                zone.animals.forEach((animal, aIdx) => {
                    animalsHTML += `<div class="zone-animal-item"><span>Nv ${animal.level} (${animal.gender === 'macho'?'M':'F'})</span><div class="animal-quantity-controls"><button class="qty-btn dec" data-z="${zone.idx}" data-a="${aIdx}">-</button><span>${animal.quantity}</span><button class="qty-btn inc" data-z="${zone.idx}" data-a="${aIdx}">+</button></div></div>`;
                });
            } else { animalsHTML += '<small style="opacity:0.5;">Sem animais registrados.</small>'; }
            animalsHTML += '</div>';

            el.innerHTML = `
                <div class="zone-card-header">
                    <div style="display:flex; align-items:center;">
                        <h4>${zone.name}</h4>
                        <button class="zone-status-btn ${statusClass}" data-idx="${zone.idx}" title="Clique para mudar">${statusLabel}</button>
                    </div>
                    <div class="zone-card-controls">
                        <button class="zone-action-btn edit" data-idx="${zone.idx}"><i class="fas fa-pencil-alt"></i></button>
                        <button class="zone-action-btn del" data-idx="${zone.idx}">&times;</button>
                    </div>
                </div>
                ${animalsHTML}
                <div class="add-animal-form">
                    <input type="number" class="lvl-in" placeholder="Nv" style="width: 50px;">
                    <select class="gnd-sel"><option value="macho">M</option><option value="femea">F</option></select>
                    <button class="add-ani-btn" data-idx="${zone.idx}">Add</button>
                </div>
            `;
            zoneListContainer.appendChild(el);
        });
    };

    // Eventos
    wrapper.querySelector('#add-zone-btn').onclick = () => {
        const name = wrapper.querySelector('#zone-name-input').value.trim();
        if (!name) return showCustomAlert('Digite um nome para a zona', 'Erro');
        session.zones.push({ id: Date.now(), name, status: 'active', animals: [] });
        onUpdate(); // Chama o callback para salvar e atualizar
    };

    zoneListContainer.onclick = (e) => {
        const t = e.target;
        if (t.classList.contains('zone-status-btn')) {
            const idx = parseInt(t.dataset.idx);
            const current = session.zones[idx].status || 'active';
            if (current === 'active') session.zones[idx].status = 'stacking';
            else if (current === 'stacking') session.zones[idx].status = 'solo';
            else session.zones[idx].status = 'active';
            onUpdate();
            return;
        }

        const btn = t.closest('button');
        if (!btn) return;
        
        const zIdx = parseInt(btn.dataset.idx || btn.dataset.z);
        const aIdx = parseInt(btn.dataset.a);

        if (btn.classList.contains('del')) {
            // Usando confirm nativo aqui para simplicidade dentro do componente, ou pode importar showCustomAlert
            if(confirm('Deletar zona?')) {
                session.zones.splice(zIdx, 1);
                onUpdate();
            }
        } else if (btn.classList.contains('edit')) {
            const newName = prompt('Novo nome:', session.zones[zIdx].name);
            if (newName) { session.zones[zIdx].name = newName; onUpdate(); }
        } else if (btn.classList.contains('add-ani-btn')) {
            const card = btn.closest('.zone-card');
            const lvl = parseInt(card.querySelector('.lvl-in').value);
            const gen = card.querySelector('.gnd-sel').value;
            if (!lvl) return;
            const existing = session.zones[zIdx].animals.find(a => a.level === lvl && a.gender === gen);
            if (existing) existing.quantity++;
            else session.zones[zIdx].animals.push({ level: lvl, gender: gen, quantity: 1 });
            onUpdate();
        } else if (btn.classList.contains('inc')) {
            session.zones[zIdx].animals[aIdx].quantity++;
            onUpdate();
        } else if (btn.classList.contains('dec')) {
            session.zones[zIdx].animals[aIdx].quantity--;
            if (session.zones[zIdx].animals[aIdx].quantity <= 0) session.zones[zIdx].animals.splice(aIdx, 1);
            onUpdate();
        }
    };

    renderList();
    container.appendChild(wrapper);
}