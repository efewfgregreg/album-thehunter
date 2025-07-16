// src/js/views/viewRareFursDetail.js

import { rareFursData } from '../data.js';
import { showCustomAlert, updateCardAppearance } from '../ui.js';

/**
 * Renderiza detalhes de pelagens raras (macho/fêmea) para um slug específico
 * @param {HTMLElement} container - Elemento onde inserir o conteúdo
 * @param {string} slug - Identificador da espécie (underline)
 * @param {Object} currentData - Estado atual carregado do usuário
 * @param {Function} saveData - Função para salvar estado no Firestore
 * @param {Function} onBack - Callback para voltar à lista
 */
export function renderRareFursDetailView(container, slug, currentData, saveData, onBack) {
  const species = rareFursData[slug] || { macho: [], femea: [] };

  container.innerHTML = `
    <div class="page-header">
      <button class="back-button">← Voltar</button>
      <h2>${slug.replace(/_/g, ' ')}</h2>
    </div>
    <div class="rare-fur-details"></div>
  `;

  const backBtn = container.querySelector('.back-button');
  backBtn.onclick = () => onBack();

  const details = container.querySelector('.rare-fur-details');

  ['macho', 'femea'].forEach(gender => {
    const types = species[gender] || [];
    if (types.length === 0) return;

    const section = document.createElement('div');
    section.className = 'fur-section';
    section.innerHTML = `<h3>${gender.charAt(0).toUpperCase() + gender.slice(1)}</h3><ul class="fur-list"></ul>`;
    const ul = section.querySelector('.fur-list');

    types.forEach(type => {
      const li = document.createElement('li');
      const checked = currentData.pelagens?.[slug]?.[gender]?.includes(type) || false;

      li.innerHTML = `
        <label>
          <input type="checkbox" ${checked ? 'checked' : ''}>
          ${type}
        </label>
      `;

      const checkbox = li.querySelector('input');
      checkbox.onchange = e => {
        if (!currentData.pelagens) currentData.pelagens = {};
        if (!currentData.pelagens[slug]) currentData.pelagens[slug] = { macho: [], femea: [] };
        const arr = currentData.pelagens[slug][gender];
        if (e.target.checked) {
          arr.push(type);
        } else {
          const idx = arr.indexOf(type);
          if (idx > -1) arr.splice(idx, 1);
        }
        saveData(currentData);

        const card = document.querySelector(`.progress-dial-card[data-slug="${slug}"]`);
        updateCardAppearance(card, slug, 'pelagens');
      };

      ul.appendChild(li);
    });

    details.appendChild(section);
  });
}
