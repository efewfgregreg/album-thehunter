// uiRenderer.js
// Módulo de renderização de UI para diferentes abas e componentes

import { rareFursData, greatsFursData, diamondFursData, items } from './data.js';

// Utilitário para criar elementos com classes e atributos
function createElement(tag, { classNames = [], attrs = {} } = {}) {
  const el = document.createElement(tag);
  classNames.forEach(cn => el.classList.add(cn));
  Object.entries(attrs).forEach(([key, val]) => el.setAttribute(key, val));
  return el;
}

// Limpa o container antes de renderizar
function clearContainer(container) {
  while (container.firstChild) container.removeChild(container.firstChild);
}

// Renderiza grid de animais com base em dados de pelagens
export function renderAnimalGrid(container, data, type) {
  clearContainer(container);
  container.className = `${type}-grid`;
  Object.entries(data).forEach(([slug, pelagens]) => {
    const card = createElement('div', { classNames: ['animal-card'] });
    const img = createElement('img', { attrs: { src: `assets/animals/${slug}.png`, alt: slug } });
    const info = createElement('div', { classNames: ['info'] });
    info.textContent = slug.replace(/_/g, ' ');
    card.append(img, info);
    card.addEventListener('click', () => renderDetailView(container.parentNode, type, slug));
    container.appendChild(card);
  });
}

// Renderiza detalhes de pelagens dentro de detail view
export function renderDetailView(root, type, slug) {
  const detailContainer = root.querySelector('#detail-view');
  clearContainer(detailContainer);
  const dataMap = { rare: rareFursData, great: greatsFursData, diamond: diamondFursData };
  const pelagens = dataMap[type][slug] || [];
  pelagens.forEach(item => {
    const card = createElement('div', { classNames: [`${type}-card`] });
    const img = createElement('img', { attrs: { src: `assets/${type}/${slug}/${item}.png`, alt: item } });
    const info = createElement('div', { classNames: ['info'] });
    info.textContent = item;
    card.append(img, info);
    detailContainer.appendChild(card);
  });
  showSection('detail-section');
}

// Controla visibilidade de seções
export function showSection(id) {
  document.querySelectorAll('.section').forEach(sec => sec.classList.add('hidden'));
  document.getElementById(id).classList.remove('hidden');
}

// Renderiza painel de progresso (exemplo simplificado)
export function updateProgressPanel(container, userData) {
  clearContainer(container);
  Object.entries(userData.pelagens).forEach(([slug, progress]) => {
    const row = createElement('div', { classNames: ['progress-row'] });
    const name = createElement('span'); name.textContent = slug.replace(/_/g, ' ');
    const bar = createElement('div', { classNames: ['progress-bar-container'] });
    const inner = createElement('div', { classNames: ['progress-bar'], attrs: { style: `width:${progress}%`} });
    bar.appendChild(inner);
    row.append(name, bar);
    container.appendChild(row);
  });
}

// Renderiza várias montarias em view multi mounts
export function renderMultiMountsView(container, mountsData) {
  clearContainer(container);
  container.className = 'mounts-grid';
  Object.values(mountsData).forEach(mount => {
    const card = createElement('div', { classNames: ['mount-card'] });
    const title = createElement('h3'); title.textContent = mount.name;
    const list = createElement('ul');
    mount.animals.forEach(a => {
      const item = createElement('li'); item.textContent = `${a.slug.replace(/_/g,' ')} (${a.gender})`;
      list.appendChild(item);
    });
    card.append(title, list);
    container.appendChild(card);
  });
}

// Renderiza reservas
export function renderReservesView(container, reservesData) {
  clearContainer(container);
  container.className = 'reserves-grid';
  Object.values(reservesData).forEach(res => {
    const card = createElement('div', { classNames: ['reserve-card'] });
    const img = createElement('img', { classNames: ['reserve-card-image'], attrs: { src: res.image, alt: res.name } });
    const info = createElement('div', { classNames: ['reserve-card-info-panel'] });
    info.innerHTML = `<h4>${res.name}</h4>`;
    card.append(img, info);
    card.addEventListener('click', () => renderReserveDetail(res));
    container.appendChild(card);
  });
}

// Exibição de detalhes de reserva (simplificado)
function renderReserveDetail(reserve) {
  const modal = document.getElementById('reserve-modal');
  modal.querySelector('.modal-content h3').textContent = reserve.name;
  showSection('reserve-modal');
}

// Filtra lista conforme input
export function setupFilter(inputEl, container) {
  inputEl.addEventListener('input', () => {
    const term = inputEl.value.toLowerCase();
    container.querySelectorAll('.animal-card .info').forEach(infoEl => {
      const name = infoEl.textContent.toLowerCase();
      infoEl.closest('.animal-card').classList.toggle('hidden', !name.includes(term));
    });
  });
}

// Inicializa navegação e eventos
export function initializeUI() {
  document.querySelectorAll('.nav-card').forEach(card => {
    card.addEventListener('click', () => {
      const target = card.getAttribute('data-target');
      showSection(target);
    });
  });
  const filterInput = document.querySelector('.filter-input');
  if (filterInput) setupFilter(filterInput, document.querySelector('#animal-grid'));
}
