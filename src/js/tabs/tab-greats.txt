// src/js/tabs/tab-greats.js
import { greatsFursData } from '../data.js';
import { slugify, showCustomAlert, updateCardAppearance } from '../ui.js';

export function setupGreatsTab(container, currentData, saveData) {
  container.innerHTML = `
    <input type="text" class="filter-input" placeholder="Filtrar Great Ones...">
    <div class="overall-progress-grid"></div>
  `;
  const filterInput = container.querySelector('.filter-input');
  const grid = container.querySelector('.overall-progress-grid');

  function renderList(filter = '') {
    grid.innerHTML = '';
    Object.keys(greatsFursData).forEach(slug => {
      const name = slug.replace(/_/g, ' ');
      if (!name.includes(filter.toLowerCase())) return;
      const card = document.createElement('div');
      card.className = 'progress-dial-card';
      card.dataset.slug = slug;
      card.dataset.key = 'greats';

      const title = document.createElement('span');
      title.innerHTML = `<i class="fas fa-crown"></i> ${name}`;
      card.appendChild(title);

      updateCardAppearance(card, slug, 'greats');
      card.onclick = () => showCustomAlert(`Detalhes de Great One: ${name}`);
      grid.appendChild(card);
    });
  }

  filterInput.addEventListener('input', e => renderList(e.target.value));
  renderList();
}
