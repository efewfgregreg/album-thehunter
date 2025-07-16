// src/js/tabs/tab-pelagens.js
import { rareFursData } from '../data.js';
import { slugify, showCustomAlert, updateCardAppearance } from '../ui.js';

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
      card.className = 'animal-card';
      card.dataset.slug = slug;
      card.dataset.key = 'pelagens';

      const img = document.createElement('img');
      img.src = `assets/animals/${slug}.jpg`;
      img.alt = name;

      const title = document.createElement('span');
      title.textContent = name;

      card.appendChild(img);
      card.appendChild(title);

      updateCardAppearance(card, slug, 'pelagens');

      card.onclick = () => showCustomAlert(`Detalhes de pelagem: ${name}`);

      grid.appendChild(card);
    });
  }

  filterInput.addEventListener('input', e => renderList(e.target.value));
  renderList();
}
