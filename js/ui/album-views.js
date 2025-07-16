// js/ui/album-views.js

import { slugify } from '../utils.js';
import { animals, reserves, mounts } from '../data.js';

// Função para renderizar o menu principal
export function renderMainMenu(container, onSelectCategory) {
    container.innerHTML = '';

    const categories = ['Diamantes', 'Raros', 'Super Raros', 'Great Ones'];
    categories.forEach(category => {
        const button = document.createElement('button');
        button.textContent = category;
        button.onclick = () => onSelectCategory(category.toLowerCase().replace(' ', '_'));
        container.appendChild(button);
    });
}

// Função para renderizar a lista de animais
export function renderAnimalList(container, category, onSelectAnimal) {
    container.innerHTML = `<h2>${category.replace('_', ' ').toUpperCase()}</h2>`;

    const list = document.createElement('ul');
    animals.forEach(animal => {
        const item = document.createElement('li');
        item.textContent = animal.name;
        item.onclick = () => onSelectAnimal(animal.slug, category);
        list.appendChild(item);
    });

    container.appendChild(list);
}

// Função para renderizar detalhes do animal selecionado
export function renderAnimalDetails(container, animalSlug, category, onBack) {
    container.innerHTML = '';

    const animal = animals.find(a => a.slug === animalSlug);
    if (!animal) {
        container.textContent = 'Animal não encontrado.';
        return;
    }

    const title = document.createElement('h2');
    title.textContent = animal.name;
    container.appendChild(title);

    const pelagesList = document.createElement('ul');
    animal.pelages.forEach(pelage => {
        const item = document.createElement('li');
        item.textContent = pelage;
        pelagesList.appendChild(item);
    });
    container.appendChild(pelagesList);

    const backButton = document.createElement('button');
    backButton.textContent = 'Voltar';
    backButton.onclick = onBack;
    container.appendChild(backButton);
}

// Função para renderizar reservas
export function renderReservesList(container) {
    container.innerHTML = '<h2>Reservas</h2>';

    const list = document.createElement('ul');
    reserves.forEach(reserve => {
        const item = document.createElement('li');
        item.textContent = reserve.name;
        list.appendChild(item);
    });

    container.appendChild(list);
}

// Função para renderizar montagens
export function renderMountsList(container) {
    container.innerHTML = '<h2>Montagens</h2>';

    const list = document.createElement('ul');
    mounts.forEach(mount => {
        const item = document.createElement('li');
        item.textContent = mount.name;
        list.appendChild(item);
    });

    container.appendChild(list);
}
