// src/js/views/viewGreatsDetail.js

import { greatsFursData } from '../data.js';
import { showCustomAlert, updateCardAppearance } from '../ui.js';

/**
 * Renderiza detalhes dos Great Ones para um slug específico
 * @param {HTMLElement} container
 * @param {string} slug
 * @param {Object} currentData
 * @param {Function} saveData
 * @param {Function} onBack
 */
export function renderGreatsDetailView(container, slug, currentData, saveData, onBack) {
  const furs = greatsFursData[slug] || [];

  container.innerHTML = `
    <div class="page-header">
      <button class="back-button">← Voltar</button>
      <h2>${slug.replace(/_/g, ' ')}</h2>
    </div>
    <div class="greats-fur-details"></div>
  `;
  container.querySelector('.back-button').onclick = () => onBack();
  const details = container.querySelector('.greats-fur-details');

  const ul = document.createElement('ul');
  ul.className = 'fur-list';

  furs.forEach(type => {
    const li = document.createElement('li');
    const saved = currentData.greats?.[slug]?.furs || {};
    const checked = saved[type]?.trophies?.length > 0;
    li.innerHTML = `<label><input type="checkbox" ${checked ? 'checked' : ''}> ${type}</label>`;
    const checkbox = li.querySelector('input');
    checkbox.onchange = e => {
      if (!currentData.greats) currentData.greats = {};
      if (!currentData.greats[slug]) currentData.greats[slug] = { furs: {} };
      if (!currentData.greats[slug].furs[type]) currentData.greats[slug].furs[type] = { trophies: [] };
      if (e.target.checked) {
        currentData.greats[slug].furs[type].trophies.push({ timestamp: Date.now() });
      } else {
        currentData.greats[slug].furs[type].trophies = [];
      }
      saveData(currentData);

      const card = document.querySelector(`.progress-dial-card[data-slug="${slug}"]`);
      updateCardAppearance(card, slug, 'greats');
    };
    ul.appendChild(li);
  });

  details.appendChild(ul);
}
