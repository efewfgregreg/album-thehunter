// src/js/views/viewDiamondDetail.js

// Função para renderizar os detalhes de Pelagens Diamante
function renderDiamondDetail(container, animalName, diamondFurs) {
    container.innerHTML = '';

    const title = document.createElement('h2');
    title.textContent = `Pelagens Diamante de ${animalName}`;
    container.appendChild(title);

    const list = document.createElement('ul');
    diamondFurs.forEach(fur => {
        const item = document.createElement('li');
        item.textContent = fur;
        list.appendChild(item);
    });
    container.appendChild(list);
}

export { renderDiamondDetail };
