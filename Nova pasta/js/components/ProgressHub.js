// Arquivo: js/components/ProgressHub.js

/**
 * Renderiza a ESTRUTURA da aba de Progresso (Botões, Painel de Conquistas, etc)
 * Mantendo o layout original do usuário.
 */
export function renderProgressHub(parentElement, {
    onRenderLatestAchievements, // Função que cria o painel de conquistas
    onRenderGeneralProgress,    // Função que desenha o progresso (cards de reservas)
    onRenderRanking             // Função que desenha o ranking
}) {
    // 1. Limpa o container pai
    parentElement.innerHTML = '';

    // 2. CRIA O ISOLAMENTO (O "Cercadinho" - ID Mágico)
    const protectionWrapper = document.createElement('div');
    protectionWrapper.id = 'tab-progress'; // <--- Protege o CSS desta aba
    protectionWrapper.style.width = '100%';

    // 3. Recria a estrutura original do seu layout
    const wrapper = document.createElement('div');
    wrapper.className = 'progress-view-container';
    wrapper.id = 'progress-panel-main-container';
    protectionWrapper.appendChild(wrapper);

    // 4. Adiciona o Painel de Conquistas (se a função for passada)
    if (onRenderLatestAchievements) {
        // Chama a função do main.js para criar o painel e anexa aqui
        const achievementsPanel = onRenderLatestAchievements();
        if (achievementsPanel) {
            wrapper.appendChild(achievementsPanel);
        }
    }

    // 5. Botões de Alternância (Progresso vs Ranking)
    const viewToggleButtons = document.createElement('div');
    viewToggleButtons.className = 'reserve-view-toggle';

    const showProgressBtn = document.createElement('button');
    showProgressBtn.textContent = 'Ver Progresso Geral';
    showProgressBtn.className = 'toggle-button'; // A classe 'active' será controlada abaixo

    const showRankingBtn = document.createElement('button');
    showRankingBtn.textContent = 'Ver Classificação de Caça';
    showRankingBtn.className = 'toggle-button';

    viewToggleButtons.appendChild(showProgressBtn);
    viewToggleButtons.appendChild(showRankingBtn);
    wrapper.appendChild(viewToggleButtons);

    // 6. Área de Conteúdo (onde os cards ou ranking vão aparecer)
    const contentArea = document.createElement('div');
    contentArea.id = "progress-content-area";
    wrapper.appendChild(contentArea);

    // --- LÓGICA DOS BOTÕES ---
    
    const handleShowProgress = () => {
        // Atualiza botões
        showProgressBtn.classList.add('active');
        showRankingBtn.classList.remove('active');
        
        // Limpa e desenha o progresso
        contentArea.innerHTML = '';
        if (onRenderGeneralProgress) onRenderGeneralProgress(contentArea);
    };

    const handleShowRanking = () => {
        // Atualiza botões
        showRankingBtn.classList.add('active');
        showProgressBtn.classList.remove('active');
        
        // Limpa e desenha o ranking
        contentArea.innerHTML = '';
        if (onRenderRanking) onRenderRanking(contentArea);
    };

    // Eventos de clique
    showProgressBtn.onclick = handleShowProgress;
    showRankingBtn.onclick = handleShowRanking;

    // Inicia mostrando o progresso (padrão)
    handleShowProgress();

    // 7. Adiciona tudo à tela
    parentElement.appendChild(protectionWrapper);
}