export function createNavigationCard({ key, title, icon, isHtml, onClick }) {
    const card = document.createElement('div');
    // Usa classes do CSS que já existem
    card.className = `nav-card design-flutuante card-${key}`;
    card.onclick = onClick;

    const iconDiv = document.createElement('div');
    if (isHtml) {
        // Se for uma imagem HTML (ex: <img ...>)
        iconDiv.innerHTML = icon;
        const img = iconDiv.querySelector('img');
        if (img) img.className = 'nav-card-icon';
    } else {
        // Se for um ícone de classe (ex: fas fa-star)
        iconDiv.className = 'nav-card-icon';
        iconDiv.innerHTML = `<i class="${icon}"></i>`;
    }

    const titleDiv = document.createElement('div');
    titleDiv.className = 'nav-card-title';
    titleDiv.textContent = title;

    card.appendChild(iconDiv);
    card.appendChild(titleDiv);

    return card;
}