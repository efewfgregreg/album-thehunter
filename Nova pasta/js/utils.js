// Arquivo: js/utils.js

/**
 * Normaliza textos removendo acentos e convertendo para minúsculo.
 * Essencial para que a busca funcione com "Évora" ou "evora".
 */
export function normalizeText(text) {
    if (!text) return '';
    return text.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
}

/**
 * Transforma textos em "slugs" (ex: "Veado de Cauda Branca" -> "veado_de_cauda_branca")
 */
export function slugify(texto) {
    if (!texto) return '';
    return texto.toLowerCase().replace(/[-\s]+/g, '_').replace(/'/g, '');
}

/**
 * Exibe a notificação flutuante (Toast) na tela.
 */
export function showToast(message) {
    let toast = document.getElementById('toast-notification');
    if (!toast) {
        toast = document.createElement('div');
        toast.id = 'toast-notification';
        document.body.appendChild(toast);
    }
    toast.textContent = message;
    toast.className = "show";
    setTimeout(() => { 
        toast.className = toast.className.replace("show", ""); 
    }, 3000);
}

/**
 * Define o fundo aleatório.
 */
export function setRandomBackground() {
    const totalBackgrounds = 39;
    let lastBg = localStorage.getItem('lastBg');
    let randomNumber;
    do {
        randomNumber = Math.floor(Math.random() * totalBackgrounds) + 1;
    } while (randomNumber == lastBg);
    localStorage.setItem('lastBg', randomNumber);
    const imageUrl = `background/background_${randomNumber}.png`;
    document.body.style.backgroundImage = `url('${imageUrl}')`;
}

/**
 * Verifica intervalos de tempo.
 */
export function isTimeInRanges(searchTime, rangesStr) {
    if (!searchTime || !rangesStr) return true;
    const cleanRanges = rangesStr.toUpperCase().trim();
    if (cleanRanges === "O DIA TODO" || cleanRanges === "ANY TIME") return true;
    const [h, m] = searchTime.split(':').map(Number);
    const searchMinutes = h * 60 + m;
    const ranges = cleanRanges.split(',').map(r => r.trim());
    for (const range of ranges) {
        const parts = range.split('-').map(p => p.trim());
        if (parts.length !== 2) continue;
        const [startH, startM] = parts[0].split(':').map(Number);
        const [endH, endM] = parts[1].split(':').map(Number);
        const startTotal = startH * 60 + startM;
        const endTotal = endH * 60 + endM;
        if (startTotal <= endTotal) {
            if (searchMinutes >= startTotal && searchMinutes <= endTotal) return true;
        } else {
            if (searchMinutes >= startTotal || searchMinutes <= endTotal) return true;
        }
    }
    return false;
}

/**
 * Evita múltiplas execuções seguidas (Debounce).
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
 * Gera tag <img> com fallback.
 */
export function createSafeImgTag(primaryPath, fallbackPath, placeholderPath, altText, className = '') {
    const safePrimary = primaryPath.replace(/'/g, "\\'");
    const safeFallback = fallbackPath ? fallbackPath.replace(/'/g, "\\'") : '';
    const safePlaceholder = placeholderPath ? placeholderPath.replace(/'/g, "\\'") : '';
    let onErrorLogic = `this.onerror=null; `;
    if (safeFallback) {
        onErrorLogic += `if (this.src !== '${safeFallback}') { this.src = '${safeFallback}'; } else { this.src = '${safePlaceholder}'; }`;
    } else {
        onErrorLogic += `this.src = '${safePlaceholder}';`;
    }
    return `<img src="${safePrimary}" alt="${altText}" class="${className}" loading="lazy" onerror="${onErrorLogic}">`;
}
/**
 * Abre o visualizador de imagem em tela cheia.
 */
export function openImageViewer(imageUrl) {
    const modal = document.getElementById('image-viewer-modal');
    if (!modal) return;
    
    modal.innerHTML = `
        <span class="modal-close">&times;</span>
        <img class="modal-content-viewer" src="${imageUrl}" alt="Imagem em tela cheia">
    `;
    
    const closeBtn = modal.querySelector('.modal-close');
    if (closeBtn) {
        closeBtn.onclick = () => {
            modal.style.display = "none";
            const img = modal.querySelector('img');
            if(img) img.src = '';
        };
    }
    
    const modalImg = modal.querySelector('.modal-content-viewer');
    if (modalImg) {
        modalImg.style.maxWidth = '90%';
        modalImg.style.maxHeight = '90%';
        modalImg.style.objectFit = 'contain';
    }
    modal.style.display = "flex";
}