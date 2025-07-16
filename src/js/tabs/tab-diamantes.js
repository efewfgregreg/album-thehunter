// src/js/tabs/tab-diamantes.js
import { diamondFursData } from '../data.js';
import { slugify, showCustomAlert, updateCardAppearance } from '../ui.js';

export function setupDiamantesTab(container, currentData, saveData) {
  container.innerHTML = `
    <input type="text" class="filter-input" placeholder="Filtrar diamantes...">
    <div class="overall-progress-grid"></div>
  `;
  const filterInput = container.querySelector('.filter-input');
  const grid = container.querySelector('.overall-progress-grid');

  function renderList(filter = '') {
    grid.innerHTML = '';
    Object.keys(diamondFursData).forEach(slug => {
      const name = slug.replace(/_/g, ' ');
      if (!name.includes(filter.toLowerCase())) return;
      const card = document.createElement('div');
      card.className = 'progress-dial-card';
      card.dataset.slug = slug;
      card.dataset.key = 'diamantes';

      const title = document.createElement('span');
      title.textContent = name;
      card.appendChild(title);

      updateCardAppearance(card, slug, 'diamantes');
      card.onclick = () => showCustomAlert(`Detalhes de diamante: ${name}`);
      grid.appendChild(card);
    });
  }

  filterInput.addEventListener('input', e => renderList(e.target.value));
  renderList();
}