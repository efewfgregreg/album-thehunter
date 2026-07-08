// Arquivo: js/components/GreatComboCard.js
import { slugify, createSafeImgTag } from '../utils.js';

/**
 * Cria o card visual AAA Glassmorph de um Great One com suporte a Combos e Pelagens simples.
 * @param {Object} params
 * @param {string} params.animalSlug - Slug do animal (ex: 'alce')
 * @param {string} params.furName - Nome da Pelagem (ex: 'Cinza Lendário')
 * @param {Array|null} params.combos - Lista de objetos de combos dessa pelagem, ou null se não houver
 * @param {boolean} params.isComboMode - Estado global do switch (true = Combos, false = Apenas Pelagens)
 * @param {Object} params.savedData - Estado de conquistas do usuário para persistência
 * @param {Function} params.onToggle - Callback executado ao marcar/desmarcar uma conquista
 * @param {Function} params.onFullscreen - Callback para abrir o visualizador de imagem HUD
 */
export function createGreatComboCard({
    animalSlug,
    furName,
    combos,
    isComboMode,
    savedData,
    onToggle,
    onFullscreen
}) {
    const card = document.createElement('div');
    const furSlug = slugify(furName);
    
    // Caminhos de imagem táticos (Premium HUD)
    const primaryPath = `animais/pelagens/great_${animalSlug}_${furSlug}.png`;
    const placeholderPath = `animais/${animalSlug}.png`;
    const imgTag = createSafeImgTag(primaryPath, '', placeholderPath, furName);

    // Identifica o mapeamento de conquistas no savedData para este animal
    const userGreats = savedData?.greatOnes?.[animalSlug] || [];

    // LÓGICA DE PERSISTÊNCIA: Verifica o estado de conclusão com base no modo selecionado
    let isCompleted = false;
    let progressText = '';
    let progressPercentage = 0;

   // Atributos dinâmicos baseados no mapeamento individual ou agrupado
    let dynamicImgTag = imgTag;
    let dynamicTitle = furName;
    let targetToggleId = furName;

    if (combos && combos.length > 0) {
        if (isComboMode) {
            // No modo Combo Ativo, o 'furName' recebido por parâmetro passa a representar o Combo específico em exibição
            const singleCombo = combos[0]; // Captura a instância única injetada pelo iterador do dossiê
            targetToggleId = singleCombo.combo;
            isCompleted = userGreats.includes(singleCombo.combo);
            dynamicTitle = `${furName} (${singleCombo.variacao})`;
            
            // Define o caminho de imagem único e customizado para a combinação exata de galhada/pelagem
            const comboSlug = slugify(singleCombo.combo);
            const comboPath = `animais/pelagens/great_${animalSlug}_${comboSlug}.png`;
            const fallbackPath = `animais/pelagens/great_${animalSlug}_${furSlug}.png`;
            const placeholderPath = `animais/${animalSlug}.png`;
            dynamicImgTag = createSafeImgTag(comboPath, fallbackPath, placeholderPath, dynamicTitle);
        } else {
            const completedCombosCount = combos.filter(c => userGreats.includes(c.combo)).length;
            const totalCombos = combos.length;
            progressPercentage = (completedCombosCount / totalCombos) * 100;
            progressText = `${completedCombosCount}/${totalCombos} Combos`;
            // O card de foco em pelagem acende se o usuário possuir a pelagem pura OU algum combo ganho
            isCompleted = userGreats.includes(furName) || completedCombosCount > 0;
            targetToggleId = furName;
        }
    } else {
        isCompleted = userGreats.includes(furName);
    }

    // Define classes e propriedades de opacidade/filtro HUD táticas baseadas no estado de conquista
    card.className = `animal-card unique-great-card ${isCompleted ? 'is-completed' : 'is-pending'}`;
    card.style.cssText = `
        cursor: pointer;
        position: relative;
        transition: all 0.25s ease-in-out;
        opacity: ${isCompleted ? '1' : '0.5'} !important;
        filter: ${isCompleted ? 'drop-shadow(0 0 10px rgba(163,51,200,0.3))' : 'grayscale(25%) brightness(0.85)'} !important;
        border: 1px solid ${isCompleted ? '#a333c8' : 'rgba(255,255,255,0.04)'} !important;
    `;
    
    // Renderização do Card Unificado HUD Premium Sem Checkboxes Internos
    card.innerHTML = `
        <div class="card-glint"></div>
        <!-- Badge de Conclusão Premium com Coroa de Ouro HUD -->
        <div class="completion-badge" style="${isCompleted ? 'opacity: 1; transform: scale(1); background: #ffc107 !important; color: #111 !important;' : 'display: none;'}">
            <i class="fa-solid fa-crown"></i>
        </div>
        
        <div class="animal-icon-container" style="width: 100%;">
            ${dynamicImgTag}
        </div>
        
        <!-- Reestruturação de Hierarquia: Separação de Pelagem e Variação em Badges Tecnológicos -->
        ${isComboMode && combos && combos.length > 0 ? `
            <div class="info" style="font-family:'Bebas Neue', sans-serif; font-size:1.25rem; letter-spacing:0.5px; color:#fff; margin-top:8px; text-transform:uppercase;">${furName}</div>
            <div class="variation-badge" style="font-family:'Bebas Neue', sans-serif; font-size:0.8rem; color:#ffc107; background:rgba(255,193,7,0.06); border:1px solid rgba(255,193,7,0.18); padding:2px 10px; border-radius:4px; display:inline-block; margin-top:5px; letter-spacing:0.8px; text-transform: uppercase;"><i class="fas fa-shapes"></i> ${combos[0].variacao}</div>
        ` : `
            <div class="info" style="font-family:'Bebas Neue', sans-serif; font-size:1.2rem; letter-spacing:0.5px; line-height:1.2; margin-top:8px;">${dynamicTitle}</div>
        `}
        
        ${combos && combos.length > 0 && !isComboMode ? `
            <div class="progress-container" style="margin-bottom: 5px; width: 100%;">
                <div class="progress-bar" style="width: ${progressPercentage}%"></div>
            </div>
            <span class="combo-progress-label" style="font-size: 0.75rem; color: #aaa; font-weight: bold; text-transform: uppercase; margin-bottom: 5px;">${progressText}</span>
        ` : ''}
        
        <button class="fullscreen-btn" title="Ver em tela cheia" style="position: absolute; top: 10px; right: 10px; background: rgba(0,0,0,0.5); border: 1px solid rgba(255,255,255,0.2); color: #fff; border-radius: 4px; padding: 4px 8px; cursor: pointer; z-index: 2;">⛶</button>
    `;
    // --- REESTRUTURAÇÃO DOS EVENTOS DE CLIQUE TÁTICO ---
    card.style.cursor = 'pointer';
    card.addEventListener('click', (e) => {
        // Ignora cliques no botão de tela cheia se o usuário clicar nele
        if (e.target.closest('.fullscreen-btn')) return;
        
        // Localiza dinamicamente o contêiner principal da view detalhada para renderizar o histórico por cima
        const mainContainer = document.querySelector('.dossier-content') || card.closest('.content-container');
        
        // Importa o módulo de visualização para acionar o motor de histórico e o modal de abates
        import('../views/detailView.js').then(module => {
            if (typeof module.renderGreatOneHistoryView === 'function') {
                // Oculta os seletores globais superiores para isolar o painel tático de abates
                const globalFilters = document.querySelector('.filters-container-v2');
                if (globalFilters) globalFilters.style.display = 'none';
                
                // Extrai o nome de cabeçalho formatado baseado no contexto real selecionado pelo usuário
                const cleanAnimalName = animalSlug.charAt(0).toUpperCase() + animalSlug.slice(1).replace(/_/g, ' ');
                
                // Dispara o painel nativo de abates injetando o ID correto (targetToggleId) na chave de armazenamento de pelagens
                module.renderGreatOneHistoryView(mainContainer, cleanAnimalName, animalSlug, targetToggleId, null);
            }
        }).catch(err => console.error("Erro ao carregar detailView.js:", err));
    });

    // Evento 3: Visualizador Fullscreen HUD V3.0
    const btnFull = card.querySelector('.fullscreen-btn');
    btnFull.addEventListener('click', (e) => {
        e.stopPropagation();
        const imgSrc = card.querySelector('img').src;
        onFullscreen(imgSrc);
    });

    return card;
}