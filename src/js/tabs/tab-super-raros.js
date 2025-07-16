// src/js/tabs/tab-super-raros.js
import { rareFursData, diamondFursData } from '../data.js';
import { slugify, showCustomAlert, updateCardAppearance } from '../ui.js';

export function setupSuperRarosTab(container, currentData, saveData) {
  container.innerHTML = `
    <input type="text" class="filter-input" placeholder="Filtrar super raros...">
    <div class="overall-progress-grid"></div>
  `;

  const filterInput = container.querySelector('.filter-input');
  const grid = container.querySelector('.overall-progress-grid');

  function renderList(filter = '') {
    grid.innerHTML = '';
    Object.keys(rareFursData).forEach(slug => {
      const name = slug.replace(/_/g, ' ');
      if (!name.includes(filter.toLowerCase())) return;

      const speciesRare = rareFursData[slug];
      const speciesDiamond = diamondFursData[slug];
      if (!speciesRare || !speciesDiamond) return;

      const card = document.createElement('div');
      card.className = 'animal-card';
      card.dataset.slug = slug;
      card.dataset.key = 'super_raros';

      const img = document.createElement('img');
      img.src = `assets/animals/${slug}.jpg`;
      img.alt = name;

      const title = document.createElement('span');
      title.textContent = name;

      card.appendChild(img);
      card.appendChild(title);

      updateCardAppearance(card, slug, 'super_raros');

      card.onclick = () => showCustomAlert(`Detalhes de super raro: ${name}`);

      grid.appendChild(card);
    });
  }

  filterInput.addEventListener('input', e => renderList(e.target.value));
  renderList();
}
