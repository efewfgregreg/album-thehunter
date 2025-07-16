// src/js/ui.js
import { diamondFursData, greatsFursData, rareFursData } from './data.js';

/**
 * Abre o visualizador de imagens em tela cheia
 */
export function openImageViewer(imageUrl) {
  const modal = document.getElementById('image-viewer-modal');
  modal.innerHTML = `
    <span class="modal-close" onclick="closeModal('image-viewer-modal')">&times;</span>
    <img class="modal-content-viewer" src="${imageUrl}" alt="Imagem em tela cheia">
  `;
  modal.style.display = "flex";
}

/**
 * Fecha um modal
 */
export function closeModal(modalId) {
  const modal = document.getElementById(modalId);
  if (modal) modal.style.display = "none";
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
 * Atualiza a aparência do cartão (completed, inprogress, incomplete)
 */
export function updateCardAppearance(card, slug, tabKey) {
  if (!card) return;
  card.classList.remove('completed', 'inprogress', 'incomplete');
  let status = 'incomplete';

  const savedData = window.currentData || {};

  switch (tabKey) {
    case 'greats': {
      const animalData = savedData.greats?.[slug] || {};
      const totalGreatFurs = greatsFursData[slug]?.length || 0;
      if (animalData.completo) {
        status = 'completed';
      } else {
        const collected = animalData.furs ? Object.values(animalData.furs).filter(f => f.trophies?.length > 0).length : 0;
        if (collected > 0 && collected < totalGreatFurs) {
          status = 'inprogress';
        }
      }
      break;
    }
    case 'diamantes': {
      const collected = savedData.diamantes?.[slug]?.length || 0;
      const total = (diamondFursData[slug]?.macho?.length || 0) + (diamondFursData[slug]?.femea?.length || 0);
      if (collected >= total && total > 0) {
        status = 'completed';
      } else if (collected > 0) {
        status = 'inprogress';
      }
      break;
    }
    case 'super_raros': {
      const saved = savedData.super_raros?.[slug] || {};
      const collected = Object.values(saved).filter(Boolean).length;
      const rare = rareFursData[slug];
      const diamond = diamondFursData[slug];
      const total = (rare?.macho?.length || 0) + (rare?.femea?.length || 0);

      if (collected >= total && total > 0) {
        status = 'completed';
      } else if (collected > 0) {
        status = 'inprogress';
      }
      break;
    }
  }

  card.classList.add(status);
}

/**
 * Transforma texto em slug
 */
export function slugify(text) {
  return text.toLowerCase().replace(/[-\s]+/g, '_').replace(/'/g, '');
}
