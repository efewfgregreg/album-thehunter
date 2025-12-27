// Arquivo: js/utils.js

/**
 * Transforma textos em "slugs" (ex: "Veado de Cauda Branca" -> "veado_de_cauda_branca")
 * Usada para encontrar imagens e dados nos objetos.
 */
export function slugify(texto) {
    if (!texto) return '';
    // Versão que MANTÉM acentos (ã, é, ç), apenas coloca em minúsculo e troca espaços por _
    return texto.toLowerCase().replace(/[-\s]+/g, '_').replace(/'/g, '');
}

/**
 * Exibe a notificação flutuante (Toast) na tela.
 */
export function showToast(message) {
    // Verifica se o elemento já existe, se não, cria
    let toast = document.getElementById('toast-notification');
    if (!toast) {
        toast = document.createElement('div');
        toast.id = 'toast-notification';
        document.body.appendChild(toast);
    }

    toast.textContent = message;
    toast.className = "show";

    // Faz sumir depois de 3 segundos
    setTimeout(() => { 
        toast.className = toast.className.replace("show", ""); 
    }, 3000);
}

/**
 * Define o fundo aleatório, evitando repetir o anterior.
 */
export function setRandomBackground() {
    const totalBackgrounds = 39;
    let lastBg = localStorage.getItem('lastBg');
    let randomNumber;
    
    // Tenta gerar um número diferente do anterior
    do {
        randomNumber = Math.floor(Math.random() * totalBackgrounds) + 1;
    } while (randomNumber == lastBg);
    
    localStorage.setItem('lastBg', randomNumber);
    const imageUrl = `background/background_${randomNumber}.png`;
    document.body.style.backgroundImage = `url('${imageUrl}')`;
}
// Adicione ao final de js/utils.js

/**
 * Verifica se um horário (ex: "14:30") está dentro de intervalos de string (ex: "08:00 - 12:00, 14:00 - 18:00").
 * Retorna true ou false.
 */
export function isTimeInRanges(searchTime, rangesStr) {
    if (!searchTime || !rangesStr) return true; // Se não tem filtro ou dados, mostra tudo
    
    const cleanRanges = rangesStr.toUpperCase().trim();
    if (cleanRanges === "O DIA TODO" || cleanRanges === "ANY TIME") return true;

    // Converte "14:30" para minutos totais (ex: 870) para facilitar a conta
    const [h, m] = searchTime.split(':').map(Number);
    const searchMinutes = h * 60 + m;

    // Separa os intervalos (pode ter vírgula ou não)
    const ranges = cleanRanges.split(',').map(r => r.trim());

    for (const range of ranges) {
        // Espera formato "HH:MM - HH:MM"
        const parts = range.split('-').map(p => p.trim());
        if (parts.length !== 2) continue;

        const [startH, startM] = parts[0].split(':').map(Number);
        const [endH, endM] = parts[1].split(':').map(Number);

        const startTotal = startH * 60 + startM;
        const endTotal = endH * 60 + endM;

        // Verifica se está dentro (trata casos normais e virada de noite ex: 23:00 - 02:00)
        if (startTotal <= endTotal) {
            if (searchMinutes >= startTotal && searchMinutes <= endTotal) return true;
        } else {
            // Virada de noite (ex: 22:00 - 04:00)
            if (searchMinutes >= startTotal || searchMinutes <= endTotal) return true;
        }
    }

    return false;
}

/**
 * Função para evitar que uma ação seja executada muitas vezes seguidas (ex: digitar na busca).
 */
export function debounce(func, wait) {
    let timeout;
    return function(...args) {
        const context = this;
        clearTimeout(timeout);
        timeout = setTimeout(() => func.apply(context, args), wait);
    };
}
/**
 * Gera uma tag <img> segura com lógica de fallback (tentativas em cascata).
 * Útil para pelagens onde tentamos: Específico (com gênero) -> Genérico (sem gênero) -> Placeholder do Animal.
 */
export function createSafeImgTag(primaryPath, fallbackPath, placeholderPath, altText, className = '') {
    // Escapa as aspas simples para evitar quebrar o HTML inline
    const safePrimary = primaryPath.replace(/'/g, "\\'");
    const safeFallback = fallbackPath ? fallbackPath.replace(/'/g, "\\'") : '';
    const safePlaceholder = placeholderPath ? placeholderPath.replace(/'/g, "\\'") : '';
    
    // Monta a lógica do onerror
    // 1. Se falhar o primário, tenta o secundário.
    // 2. Se falhar o secundário (ou não existir), vai para o placeholder.
    let onErrorLogic = `this.onerror=null; `;
    
    if (safeFallback) {
        onErrorLogic += `if (this.src !== '${safeFallback}') { this.src = '${safeFallback}'; } else { this.src = '${safePlaceholder}'; }`;
    } else {
        onErrorLogic += `this.src = '${safePlaceholder}';`;
    }

    return `<img src="${safePrimary}" alt="${altText}" class="${className}" loading="lazy" onerror="${onErrorLogic}">`;
}