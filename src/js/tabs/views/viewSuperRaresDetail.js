import { rareFursData, diamondFursData } from '../data.js';
import { updateCardAppearance } from '../ui.js';

/**
 * Renderiza detalhes dos Super Raros (pelagem rara + diamante) para um slug específico
 * @param {HTMLElement} container
 * @param {string} slug
 * @param {Object} currentData
 * @param {Function} saveData
 * @param {Function} onBack
 */
export function renderSuperRaresDetailView(container, slug, currentData, saveData, onBack) {
  const rare = rareFursData[slug] || {};
  const diamond = diamondFursData[slug] || {};

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
    const rareTypes = rare[gender] || [];
    const diamondTypes = diamond[gender] || [];
    const combined = rareTypes.filter(type => diamondTypes.length > 0);

    if (!combined.length) return;

    const section = document.createElement('div');
    section.className = 'fur-section';
    section.innerHTML = `<h3>${gender.charAt(0).toUpperCase() + gender.slice(1)}</h3><ul class="fur-list"></ul>`;
    const ul = section.querySelector('.fur-list');

    combined.forEach(type => {
      const li = document.createElement('li');
      const saved = currentData.super_raros?.[slug]?.[`${gender}_${type}`] === true;

      li.innerHTML = `
        <label>
          <input type="checkbox" ${saved ? 'checked' : ''}>
          ${type}
        </label>
      `;

      const checkbox = li.querySelector('input');
      checkbox.onchange = e => {
        if (!currentData.super_raros) currentData.super_raros = {};
        if (!currentData.super_raros[slug]) currentData.super_raros[slug] = {};
        currentData.super_raros[slug][`${gender}_${type}`] = e.target.checked;
        saveData(currentData);

        const card = document.querySelector(`.progress-dial-card[data-slug="${slug}"]`);
        updateCardAppearance(card, slug, 'super_raros');
      };

      ul.appendChild(li);
    });

    details.appendChild(section);
  });
}
