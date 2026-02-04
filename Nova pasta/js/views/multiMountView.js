import { slugify } from '../utils.js';
import { items, multiMountsData } from '../../data/gameData.js';
import { savedData, closeModal } from '../main.js';
import { createMultiMountCard } from '../components/MultiMountCard.js';

function getCompleteTrophyInventory() {
    const inventory = [];

    if (savedData.pelagens) {
        for (const slug in savedData.pelagens) {
            for (const furName in savedData.pelagens[slug]) {
                if (savedData.pelagens[slug][furName] === true) {
                    const gender = furName.toLowerCase().startsWith('macho') ? 'macho' : 'femea';
                    const pureFur = furName.replace(/^(macho|fêmea)\s/i, '').trim();
                    inventory.push({ slug, gender, type: 'Pelagem Rara', detail: pureFur });
                }
            }
        }
    }

    if (savedData.diamantes) {
        for (const slug in savedData.diamantes) {
            savedData.diamantes[slug].forEach(trophy => {
                const gender = trophy.type.toLowerCase().startsWith('macho') ? 'macho' : 'femea';
                inventory.push({ slug, gender, type: 'Diamante', detail: `Pontuação ${trophy.score}` });
            });
        }
    }

    if (savedData.super_raros) {
        for (const slug in savedData.super_raros) {
            for (const furName in savedData.super_raros[slug]) {
                if (savedData.super_raros[slug][furName] === true) {
                    const gender = furName.toLowerCase().startsWith('macho') ? 'macho' : 'femea';
                    const pureFur = furName.replace(/^(macho|fêmea)\s/i, '').trim();
                    inventory.push({ slug, gender, type: 'Super Raro', detail: pureFur });
                }
            }
        }
    }

    if (savedData.greats) {
        for (const slug in savedData.greats) {
            if (savedData.greats[slug].furs) {
                for (const furName in savedData.greats[slug].furs) {
                    if (savedData.greats[slug].furs[furName].trophies?.length > 0) {
                        savedData.greats[slug].furs[furName].trophies.forEach(trophy => {
                            inventory.push({ slug, gender: 'macho', type: 'Grande', detail: furName });
                        });
                    }
                }
            }
        }
    }
    return inventory;
}

// Verifica os requisitos de uma montagem múltipla
export function checkMountRequirements(requiredAnimals) {
    const inventory = getCompleteTrophyInventory();
    const fulfillmentRequirements = [];
    let isComplete = true;

    const availableInventory = [...inventory];

    for (const requirement of requiredAnimals) {
        let fulfilled = false;
        let fulfillmentTrophy = null;

        const foundIndex = availableInventory.findIndex(trophy =>
            trophy.slug === requirement.slug &&
            trophy.gender === requirement.gender
        );

        if (foundIndex !== -1) {
            fulfilled = true;
            fulfillmentTrophy = availableInventory[foundIndex];
            availableInventory.splice(foundIndex, 1);
        } else {
            isComplete = false;
        }
        fulfillmentRequirements.push({ met: fulfilled, requirement: requirement, trophy: fulfillmentTrophy });
    }
    return { isComplete, fulfillmentRequirements };
}

/// Renderiza a visualização de montagens múltiplas (VERSÃO NOVA)
export function renderMultiMountsView(container) {
    container.innerHTML = '';
    const grid = document.createElement('div');
    grid.className = 'mounts-grid';
    container.appendChild(grid);

    const sortedMounts = Object.entries(multiMountsData).sort((a, b) => a[1].name.localeCompare(b[1].name));

    if (sortedMounts.length === 0) {
        grid.innerHTML = `<div class="empty-state-container"><i class="fas fa-trophy empty-state-icon"></i><h3 class="empty-state-title">Nenhuma Montagem Disponível</h3><p class="empty-state-message">Os dados das montagens múltiplas não foram carregados.</p></div>`;
        return;
    }

    sortedMounts.forEach(([mountKey, mount]) => {
        // 1. Calcula o status
        const status = checkMountRequirements(mount.animals);
        
        // 2. Cria o card visual usando o componente novo
        const card = createMultiMountCard(mount, status, () => renderMultiMountDetailModal(mountKey));
        
        grid.appendChild(card);
    });
}

// Renderiza o modal de detalhes de montagens múltiplas
function renderMultiMountDetailModal(mountKey) {
    const mount = multiMountsData[mountKey];
    if (!mount) return;

    const status = checkMountRequirements(mount.animals);

    const modal = document.getElementById('form-modal');
    modal.innerHTML = '';
    modal.className = 'modal-overlay form-modal';

    const modalContent = document.createElement('div');
    modalContent.className = 'modal-content-box';
    modalContent.innerHTML = `<h3><i class="fas fa-trophy"></i> Detalhes: ${mount.name}</h3>`;

    const detailList = document.createElement('ul');
    detailList.className = 'mount-detail-list';

    status.fulfillmentRequirements.forEach(fulfillment => {
        const req = fulfillment.requirement;
        const trophy = fulfillment.trophy;
        const animalName = items.find(item => slugify(item) === req.slug) || req.slug;
        const genderIcon = req.gender === 'macho' ? 'fa-mars' : 'fa-venus';

        const li = document.createElement('li');
        li.className = 'mount-detail-item';

        let bodyHTML = '';
        if (fulfillment.met) {
            bodyHTML = `<div class="detail-item-body"><i class="fas fa-check-circle"></i> Obtido com: <strong>${trophy.type}</strong> (${trophy.detail})</div>`;
        } else {
            bodyHTML = `<div class="detail-item-body"><i class="fas fa-times-circle"></i> Pendente</div>`;
        }

        li.innerHTML = `
            <div class="detail-item-header">
                <i class="fas ${genderIcon}"></i><span>${animalName} (${req.gender})</span>
            </div>
            ${bodyHTML}
        `;
        detailList.appendChild(li);
    });

    modalContent.appendChild(detailList);

    const buttonsDiv = document.createElement('div');
    buttonsDiv.className = 'modal-buttons';
    const closeBtn = document.createElement('button');
    closeBtn.className = 'back-button';
    closeBtn.textContent = 'Fechar';
    closeBtn.onclick = () => closeModal('form-modal');
    buttonsDiv.appendChild(closeBtn);
    modalContent.appendChild(buttonsDiv);
    modal.appendChild(modalContent);

    modal.style.display = 'flex';
}