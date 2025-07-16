// src/js/views/viewSuperRaresDetail.js

import { rareFursData, diamondFursData } from '../data.js';
import { showCustomAlert, updateCardAppearance } from '../ui.js';

/**
 * Renderiza detalhes de super raros (pelagens 'rares' que também são diamantes)
 * @param {HTMLElement} container
 * @param {string} slug
 * @param {Object} currentData
 * @param {Function} saveData
 * @param {Function} onBack
 */
export function renderSuperRaresDetailView(container, slug, currentData, saveData, onBack) {
  const rare = rareFursData[slug] || { macho: [], femea: [] };
  const diamond = diamondFursData[slug] || { macho: [], femea: [] };

  container.innerHTML = `
    <div class="page-header">
      <button class="back-button">← Voltar</button>
      <h2>${slug.replace(/_/g, ' ')}</h2>
    </div>
    <div class="super-rares-details"></div>
  `;
  container.querySelector('.back-button').onclick = () => onBack();
  const details = container.querySelector('.super-rares-details');

  ['macho', 'femea'].forEach(gender => {
    const rTypes = rare[gender] || [];
    const dTypes = diamond[gender] || [];
    const supTypes = rTypes.filter(t => dTypes.includes(t));
    if (supTypes.length === 0) return;

    const section = document.createElement('div');
    section.className = 'fur-section';
    section.innerHTML = `<h3>${gender.charAt(0).toUpperCase() + gender.slice(1)}</h3><ul class="fur-list"></ul>`;
    const ul = section.querySelector('.fur-list');

    supTypes.forEach(type => {
      const li = document.createElement('li');
      const saved = currentData.super_raros?.[slug] || {};
      const checked = saved[type] === true;
      li.innerHTML = `<label><input type="checkbox" ${checked ? 'checked' : ''}> ${type}</label>`;
      const checkbox = li.querySelector('input');
      checkbox.onchange = e => {
        if (!currentData.super_raros) currentData.super_raros = {};
        if (!currentData.super_raros[slug]) currentData.super_raros[slug] = {};
        currentData.super_raros[slug][type] = e.target.checked;
        saveData(currentData);

        const card = document.querySelector(`.progress-dial-card[data-slug="${slug}"]`);
        updateCardAppearance(card, slug, 'super_raros');
      };
      ul.appendChild(li);
    });

    details.appendChild(section);
  });
}
