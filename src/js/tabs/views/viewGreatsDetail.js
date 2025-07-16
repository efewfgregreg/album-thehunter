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

  const listContainer = document.createElement('div');
  listContainer.className = 'fur-list-grid';

  furs.forEach(type => {
    const saved = currentData.greats?.[slug]?.furs || {};
    const checked = saved[type]?.trophies?.length > 0;

    const card = document.createElement('div');
    card.className = `fur-card ${checked ? 'completed' : ''}`;

    const img = document.createElement('img');
    img.src = `assets/furs/${slug}_${type}.jpg`;
    img.alt = type;

    const label = document.createElement('span');
    label.textContent = type;

    const checkbox = document.createElement('input');
    checkbox.type = 'checkbox';
    checkbox.checked = checked;
    checkbox.className = 'fur-checkbox';

    checkbox.onchange = e => {
      if (!currentData.greats) currentData.greats = {};
      if (!currentData.greats[slug]) currentData.greats[slug] = { furs: {} };
      if (!currentData.greats[slug].furs[type]) currentData.greats[slug].furs[type] = { trophies: [] };

      if (e.target.checked) {
        currentData.greats[slug].furs[type].trophies.push({ timestamp: Date.now() });
        card.classList.add('completed');
      } else {
        currentData.greats[slug].furs[type].trophies = [];
        card.classList.remove('completed');
      }

      saveData(currentData);

      const summaryCard = document.querySelector(`.progress-dial-card[data-slug="${slug}"]`);
      updateCardAppearance(summaryCard, slug, 'greats');
    };

    card.appendChild(img);
    card.appendChild(label);
    card.appendChild(checkbox);

    listContainer.appendChild(card);
  });

  details.appendChild(listContainer);
}
