// src/js/views/viewDiamondDetail.js

import { diamondFursData } from '../data.js';
import { showCustomAlert, updateCardAppearance } from '../ui.js';

/**
 * Renderiza detalhes dos diamantes (macho/fêmea) para um slug específico
 * @param {HTMLElement} container - Elemento onde inserir o conteúdo
 * @param {string} slug - Identificador da espécie (underline)
 * @param {Object} currentData - Estado atual carregado do usuário
 * @param {Function} saveData - Função para salvar estado no Firestore
 * @param {Function} onBack - Callback para voltar à lista
 */
export function renderDiamondDetailView(container, slug, currentData, saveData, onBack) {
  const species = diamondFursData[slug] || { macho: [], femea: [] };

  container.innerHTML = `
    <div class="page-header">
      <button class="back-button">← Voltar</button>
      <h2>${slug.replace(/_/g, ' ')}</h2>
    </div>
    <div class="diamond-fur-details"></div>
  `;

  container.querySelector('.back-button').onclick = () => onBack();
  const details = container.querySelector('.diamond-fur-details');

  ['macho', 'femea'].forEach(gender => {
    const types = species[gender] || [];
    if (!types.length) return;

    const section = document.createElement('div');
    section.className = 'fur-section';
    section.innerHTML = `<h3>${gender.charAt(0).toUpperCase() + gender.slice(1)}</h3><ul class="fur-list"></ul>`;
    const ul = section.querySelector('.fur-list');

    types.forEach(type => {
      const li = document.createElement('li');
      const saved = currentData.diamantes?.[slug] || [];
      const checked = saved.includes(type);
      li.innerHTML = `
        <label>
          <input type="checkbox" ${checked ? 'checked' : ''}>
          ${type}
        </label>
      `;
      const checkbox = li.querySelector('input');
      checkbox.onchange = e => {
        if (!currentData.diamantes) currentData.diamantes = {};
        if (!currentData.diamantes[slug]) currentData.diamantes[slug] = [];
        const arr = currentData.diamantes[slug];
        if (e.target.checked) {
          arr.push(type);
        } else {
          const idx = arr.indexOf(type);
          if (idx > -1) arr.splice(idx, 1);
        }
        saveData(currentData);

        const card = document.querySelector(`.progress-dial-card[data-slug="${slug}"]`);
        updateCardAppearance(card, slug, 'diamantes');
      };
      ul.appendChild(li);
    });

    details.appendChild(section);
  });
}
