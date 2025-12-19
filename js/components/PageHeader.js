// Arquivo: js/components/PageHeader.js

/**
 * Cria um cabeçalho padrão para as páginas (Título + Botão Voltar).
 * @param {string} titleText - O título da página.
 * @param {Function} onBackClick - A função que roda ao clicar em voltar.
 * @param {string} backText - (Opcional) Texto do botão voltar. Padrão: "Voltar".
 * @returns {HTMLElement} O elemento do cabeçalho pronto.
 */
export function createPageHeader(titleText, onBackClick, backText = 'Voltar ao Menu') {
    const header = document.createElement('div');
    header.className = 'page-header';

    const title = document.createElement('h2');
    title.textContent = titleText;

    const backButton = document.createElement('button');
    backButton.className = 'back-button';
    backButton.innerHTML = `&larr; ${backText}`;
    
    // 1. ANIMAÇÃO (Fixa, nunca muda)
    backButton.addEventListener('click', (e) => {
        e.target.style.transform = "scale(0.95)";
        setTimeout(() => {
            e.target.style.transform = "scale(1)";
        }, 100);
    });

    // 2. AÇÃO DE NAVEGAÇÃO (Flexível, pode ser substituída)
    // Usamos .onclick aqui para permitir que outras telas sobrescrevam isso depois
    backButton.onclick = (e) => {
        // Pequeno delay para a animação aparecer antes de trocar a tela
        setTimeout(() => {
            onBackClick();
        }, 100);
    };

    header.appendChild(title);
    header.appendChild(backButton);

    return header;
}