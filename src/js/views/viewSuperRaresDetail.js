// src/js/views/viewSuperRaresDetail.js

// Função para renderizar detalhes dos Super Raros
function renderSuperRaresDetail(container, animalName, count) {
    container.innerHTML = '';

    const title = document.createElement('h2');
    title.textContent = `Super Raros de ${animalName}`;
    container.appendChild(title);

    const countDisplay = document.createElement('p');
    countDisplay.textContent = `Total registrado: ${count}`;
    container.appendChild(countDisplay);
}

export { renderSuperRaresDetail };
