// src/js/views/viewRareFursDetail.js

// Função para renderizar os detalhes de Pelagens Raras
function renderRareFursDetail(container, animalName, rareFurs) {
    container.innerHTML = '';

    const title = document.createElement('h2');
    title.textContent = `Pelagens Raras de ${animalName}`;
    container.appendChild(title);

    const list = document.createElement('ul');
    rareFurs.forEach(fur => {
        const item = document.createElement('li');
        item.textContent = fur;
        list.appendChild(item);
    });
    container.appendChild(list);
}

export { renderRareFursDetail };
