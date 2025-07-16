// src/js/ui.js

/**
 * Abre o visualizador de imagens em tela cheia
 */
export function openImageViewer(imageUrl) {
    const modal = document.getElementById('image-viewer-modal');
    modal.innerHTML = `
        <span class="modal-close" onclick="closeModal('image-viewer-modal')">&times;</span>
        <img class="modal-content-viewer" src="${imageUrl}" alt="Imagem em tela cheia">
    `;
    const modalImg = modal.querySelector('.modal-content-viewer');
    if (modalImg) {
        modalImg.style.maxWidth = '90%';
        modalImg.style.maxHeight = '90%';
        modalImg.style.objectFit = 'contain';
    }
    modal.style.display = "flex";
}

/**
 * Fecha um modal
 */
export function closeModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
        modal.style.display = "none";
    }
}

/**
 * Exibe um modal customizado de alerta/confirmação
 */
export function showCustomAlert(message, title = 'Aviso', isConfirm = false) {
    const modal = document.getElementById('custom-alert-modal');
    const modalTitle = document.getElementById('custom-alert-title');
    const modalMessage = document.getElementById('custom-alert-message');
    const okBtn = document.getElementById('custom-alert-ok-btn');
    const cancelBtn = document.getElementById('custom-alert-cancel-btn');

    modalTitle.textContent = title;
    modalMessage.textContent = message;

    return new Promise((resolve) => {
        okBtn.onclick = () => {
            modal.style.display = 'none';
            resolve(true);
        };

        if (isConfirm) {
            cancelBtn.style.display = 'inline-block';
            cancelBtn.onclick = () => {
                modal.style.display = 'none';
                resolve(false);
            };
        } else {
            cancelBtn.style.display = 'none';
        }

        modal.style.display = 'flex';
    });
}

/**
 * Atualiza a aparência de um cartão de animal (completed, inprogress, incomplete)
 */
export function updateCardAppearance(card, slug, tabKey) {
    if (!card) return;
    card.classList.remove('completed', 'inprogress', 'incomplete');
    let status = 'incomplete';
    let collectedCount = 0;
    let totalCount = 0;

    switch (tabKey) {
        case 'greats': {
            const animalData = savedData.greats?.[slug] || {};
            const totalGreatFurs = greatsFursData[slug]?.length || 0;
            if (animalData.completo) {
                status = 'completed';
            } else {
                const collectedFurs = animalData.furs ? Object.values(animalData.furs).filter(fur => fur.trophies?.length > 0).length : 0;
                if (collectedFurs > 0 && collectedFurs < totalGreatFurs) {
                    status = 'inprogress';
                }
            }
            break;
        }
        case 'diamantes': {
            const collectedDiamondTrophies = savedData.diamantes?.[slug] || [];
            collectedCount = new Set(collectedDiamondTrophies.map(t => t.type)).size;
            const speciesDiamondData = diamondFursData[slug];
            totalCount = (speciesDiamondData?.macho?.length || 0) + (speciesDiamondData?.femea?.length || 0);
            if (totalCount > 0) {
                if (collectedCount === totalCount) {
                    status = 'completed';
                } else if (collectedCount > 0) {
                    status = 'inprogress';
                }
            }
            break;
        }
        case 'super_raros': {
            const collectedSuperRares = savedData.super_raros?.[slug] || {};
            collectedCount = Object.values(collectedSuperRares).filter(v => v === true).length;
            const speciesRareFurs = rareFursData[slug];
            const speciesDiamondFurs = diamondFursData[slug];
            if (speciesRareFurs) {
                let possibleSuperRares = 0;
                if (speciesRareFurs.macho && speciesDiamondFurs?.macho?.length) possibleSuperRares += speciesRareFurs.macho.length;
                if (speciesRareFurs.femea && speciesDiamondFurs?.femea?.length) possibleSuperRares += speciesRareFurs.femea.length;
                totalCount = possibleSuperRares;
                if (collectedCount === totalCount) {
                    status = 'completed';
                } else if (collectedCount > 0) {
                    status = 'inprogress';
                }
            }
            break;
        }
        default:
            break;
    }

    card.classList.add(status);
}

/**
 * Transforma texto em slug (underline, lowercase)
 */
export function slugify(text) {
    return text.toLowerCase().replace(/[-\s]+/g, '_').replace(/'/g, '');
}
