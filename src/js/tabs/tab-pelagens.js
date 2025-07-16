// src/js/tabs/tab-pelagens.js
import { rareFursData } from '../data.js';
import { slugify, updateCardAppearance } from '../ui.js';
import { renderRareFursDetailView } from '../views/viewRareFursDetail.js';

export function setupPelagensTab(container, currentData, saveData) {
  container.innerHTML = `
    <input type="text" class="filter-input" placeholder="Filtrar pelagens raras...">
    <div class="overall-progress-grid"></div>
  `;
  const filterInput = container.querySelector('.filter-input');
  const grid = container.querySelector('.overall-progress-grid');

  function renderList(filter = '') {
    grid.innerHTML = '';
    Object.keys(rareFursData).forEach(slug => {
      const name = slug.replace(/_/g, ' ');
      if (!name.includes(filter.toLowerCase())) return;
      const card = document.createElement('div');
      card.className = 'progress-dial-card';
      card.dataset.slug = slug;
      card.dataset.key = 'pelagens';

      const title = document.createElement('span');
      title.textContent = name;
      card.appendChild(title);

      updateCardAppearance(card, slug, 'pelagens');
      card.onclick = () => renderRareFursDetailView(container, slug, currentData, saveData, () => setupPelagensTab(container, currentData, saveData));
      grid.appendChild(card);
    });
  }

  filterInput.addEventListener('input', e => renderList(e.target.value));
  renderList();
}
