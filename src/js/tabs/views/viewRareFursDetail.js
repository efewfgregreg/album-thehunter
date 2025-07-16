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


// src/js/tabs/tab-diamantes.js
import { diamondFursData } from '../data.js';
import { slugify, updateCardAppearance } from '../ui.js';
import { renderDiamondDetailView } from '../views/viewDiamondDetail.js';

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
      card.onclick = () => renderDiamondDetailView(container, slug, currentData, saveData, () => setupDiamantesTab(container, currentData, saveData));
      grid.appendChild(card);
    });
  }

  filterInput.addEventListener('input', e => renderList(e.target.value));
  renderList();
}


// src/js/tabs/tab-super-raros.js
import { rareFursData, diamondFursData } from '../data.js';
import { slugify, updateCardAppearance } from '../ui.js';
import { renderSuperRaresDetailView } from '../views/viewSuperRaresDetail.js';

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
      card.className = 'progress-dial-card';
      card.dataset.slug = slug;
      card.dataset.key = 'super_raros';

      const title = document.createElement('span');
      title.textContent = name;
      card.appendChild(title);

      updateCardAppearance(card, slug, 'super_raros');
      card.onclick = () => renderSuperRaresDetailView(container, slug, currentData, saveData, () => setupSuperRarosTab(container, currentData, saveData));
      grid.appendChild(card);
    });
  }

  filterInput.addEventListener('input', e => renderList(e.target.value));
  renderList();
}


// src/js/tabs/tab-greats.js
import { greatsFursData } from '../data.js';
import { slugify, updateCardAppearance } from '../ui.js';
import { renderGreatsDetailView } from '../views/viewGreatsDetail.js';

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
      card.onclick = () => renderGreatsDetailView(container, slug, currentData, saveData, () => setupGreatsTab(container, currentData, saveData));
      grid.appendChild(card);
    });
  }

  filterInput.addEventListener('input', e => renderList(e.target.value));
  renderList();
}
// src/js/views/viewRareFursDetail.js

import { rareFursData } from '../data.js';
import { showCustomAlert, updateCardAppearance } from '../ui.js';

/**
 * Renderiza detalhes de pelagens raras (macho/fêmea) para um slug específico
 * @param {HTMLElement} container - Elemento onde inserir o conteúdo
 * @param {string} slug - Identificador da espécie (underline)
 * @param {Object} currentData - Estado atual carregado do usuário
 * @param {Function} saveData - Função para salvar estado no Firestore
 * @param {Function} onBack - Callback para voltar à lista
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

  const backBtn = container.querySelector('.back-button');
  backBtn.onclick = () => onBack();

  const details = container.querySelector('.rare-fur-details');

  ['macho', 'femea'].forEach(gender => {
    const types = species[gender] || [];
    if (types.length === 0) return;

    const section = document.createElement('div');
    section.className = 'fur-section';
    section.innerHTML = `<h3>${gender.charAt(0).toUpperCase() + gender.slice(1)}</h3><ul class="fur-list"></ul>`;
    const ul = section.querySelector('.fur-list');

    types.forEach(type => {
      const li = document.createElement('li');
      const checked = currentData.pelagens?.[slug]?.[gender]?.includes(type) || false;

      li.innerHTML = `
        <label>
          <input type="checkbox" ${checked ? 'checked' : ''}>
          ${type}
        </label>
      `;

      const checkbox = li.querySelector('input');
      checkbox.onchange = e => {
        if (!currentData.pelagens) currentData.pelagens = {};
        if (!currentData.pelagens[slug]) currentData.pelagens[slug] = { macho: [], femea: [] };
        const arr = currentData.pelagens[slug][gender];
        if (e.target.checked) {
          arr.push(type);
        } else {
          const idx = arr.indexOf(type);
          if (idx > -1) arr.splice(idx, 1);
        }
        saveData(currentData);

        const card = document.querySelector(`.progress-dial-card[data-slug="${slug}"]`);
        updateCardAppearance(card, slug, 'pelagens');
      };

      ul.appendChild(li);
    });

    details.appendChild(section);
  });
}
