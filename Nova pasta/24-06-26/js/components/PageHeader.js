// =================================================================
// ===================== COMPONENTE DE CABEÇALHO ===================
// =================================================================

export function createPageHeader(title, backAction) {
    const header = document.createElement('header');
    // VOLTAMOS PARA A CLASSE PADRÃO PARA EVITAR ERROS DE LÓGICA NO MAIN.JS
    header.className = 'page-header';

    // Forçamos o estilo inline para garantir nossa correção visual
    header.style.cssText = `
        display: flex;
        align-items: center;
        justify-content: center;
        height: 80px; 
        width: 100%;
        background-color: rgba(0, 0, 0, 0.85);
        border-bottom: 2px solid var(--primary-color);
        position: relative; 
        box-shadow: 0 4px 15px rgba(0,0,0,0.6);
        box-sizing: border-box;
        margin: 0;
        margin-bottom: 30px;
        padding: 0;
        z-index: 100;
    `;

    // -----------------------------------------------------------
    // 1. ÂNCORA ESQUERDA (Botão Voltar)
    // -----------------------------------------------------------
    const leftContainer = document.createElement('div');
    leftContainer.className = 'header-left';
    leftContainer.style.cssText = `
        position: absolute !important;
        left: 0 !important;
        top: 0 !important;
        bottom: 0 !important;
        display: flex !important;
        align-items: center !important;
        z-index: 10 !important;
        padding-left: 15px !important; 
    `;

    if (backAction) {
        const backBtn = document.createElement('button');
        backBtn.className = 'back-button';
        backBtn.style.cssText = `
            display: flex; 
            align-items: center; 
            height: 100%; 
            padding: 0 15px; 
            margin: 0;
            font-size: 1rem;
            white-space: nowrap;
            cursor: pointer;
            background: transparent; 
            border: none;
            color: #ddd;
            transition: color 0.3s ease;
            text-transform: uppercase;
            letter-spacing: 1px;
            font-weight: 600;
        `;
        
        backBtn.onmouseenter = () => backBtn.style.color = 'var(--primary-color)';
        backBtn.onmouseleave = () => backBtn.style.color = '#ddd';
        
        backBtn.innerHTML = '<i class="fas fa-arrow-left" style="margin-right: 8px;"></i> VOLTAR';
        backBtn.onclick = backAction;
        leftContainer.appendChild(backBtn);
    }
    
    header.appendChild(leftContainer);

    // -----------------------------------------------------------
    // 2. TÍTULO (Centralizado Absoluto)
    // -----------------------------------------------------------
    const titleEl = document.createElement('h2');
    titleEl.innerHTML = title; 
    
    titleEl.style.cssText = `
        position: absolute;
        left: 50%;
        top: 50%;
        transform: translate(-50%, -50%);
        margin: 0;
        font-family: 'Bebas Neue', sans-serif;
        font-size: 3rem; 
        color: var(--primary-color);
        text-transform: uppercase;
        letter-spacing: 2px;
        white-space: nowrap;
        text-shadow: 2px 2px 4px rgba(0,0,0,0.8);
        pointer-events: none;
        z-index: 1;
    `;
    
    header.appendChild(titleEl);

    // -----------------------------------------------------------
    // 3. ÂNCORA DIREITA (Slot para Logout)
    // -----------------------------------------------------------
    const rightContainer = document.createElement('div');
    rightContainer.id = 'header-right-section';
    rightContainer.style.cssText = `
        position: absolute !important;
        right: 0 !important;
        top: 0 !important;
        bottom: 0 !important;
        display: flex !important;
        align-items: center !important;
        justify-content: flex-end !important;
        padding-right: 15px !important;
        z-index: 10 !important;
        height: 100% !important;
    `;
    
    header.appendChild(rightContainer);

    return header;
}