// src/js/views/viewRareFursDetail.js

import { rareFursData } from '../data.js';
import { updateCardAppearance } from '../ui.js';

/**
 * Renderiza detalhes de pelagens raras para um animal específico
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

  container.querySelector('.back-button').onclick = () => onBack();
  const details = container.querySelector('.rare-fur-details');

  ['macho', 'femea'].forEach(gender => {
    const types = species[gender];
    if (!types || types.length === 0) return;

    const section = document.createElement('div');
    section.className = 'fur-section';
    section.innerHTML = `<h3>${gender.toUpperCase()}</h3>`;
    const list = document.createElement('ul');
    list.className = 'fur-list';

    types.forEach(type => {
      const li = document.createElement('li');
      const saved = currentData.pelagens?.[slug]?.[gender] || [];
      const checked = saved.includes(type);

      li.innerHTML = `
        <label>
          <input type="checkbox" ${checked ? 'checked' : ''}>
          ${type}
        </label>
      `;

      li.querySelector('input').onchange = (e) => {
        if (!currentData.pelagens) currentData.pelagens = {};
        if (!currentData.pelagens[slug]) currentData.pelagens[slug] = { macho: [], femea: [] };
        const arr = currentData.pelagens[slug][gender];
        if (e.target.checked) {
          if (!arr.includes(type)) arr.push(type);
        } else {
          const index = arr.indexOf(type);
          if (index > -1) arr.splice(index, 1);
        }
        saveData(currentData);
        const card = document.querySelector(`.progress-dial-card[data-slug="${slug}"]`);
        updateCardAppearance(card, slug, 'pelagens');
      };

      list.appendChild(li);
    });

    section.appendChild(list);
    details.appendChild(section);
  });
}
