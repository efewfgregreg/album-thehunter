// src/js/views/viewGreatsDetail.js

// Função para renderizar detalhes dos Greats
function renderGreatsDetail(container, animalName, greatFurs) {
    container.innerHTML = '';

    const title = document.createElement('h2');
    title.textContent = `Greats de ${animalName}`;
    container.appendChild(title);

    const list = document.createElement('ul');
    greatFurs.forEach(fur => {
        const item = document.createElement('li');
        item.textContent = fur;
        list.appendChild(item);
    });
    container.appendChild(list);
}

export { renderGreatsDetail };
