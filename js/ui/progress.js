// js/ui/progress.js

// --- Dependências do Módulo ---
// CORREÇÃO: Não precisamos mais de 'animalData'
let savedData, currentUser, items, slugify, reservesData, rareFursData, diamondFursData, greatsFursData, animalHotspotData, calculateReserveProgress;
let getAggregatedGrindStats, showCustomAlert, getDefaultDataStructure, saveDataAndUpdateUI;

// A função init recebe tudo que este módulo precisa para funcionar
export function init(dependencies) {
    savedData = dependencies.savedData;
    currentUser = dependencies.currentUser;
    items = dependencies.items;
    slugify = dependencies.slugify;
    reservesData = dependencies.reservesData;
    rareFursData = dependencies.rareFursData;
    diamondFursData = dependencies.diamondFursData;
    greatsFursData = dependencies.greatsFursData;
    animalHotspotData = dependencies.animalHotspotData;
    getAggregatedGrindStats = dependencies.getAggregatedGrindStats;
    showCustomAlert = dependencies.showCustomAlert;
    getDefaultDataStructure = dependencies.getDefaultDataStructure;
    saveDataAndUpdateUI = dependencies.saveDataAndUpdateUI;
    calculateReserveProgress = dependencies.calculateReserveProgress;
}

// --- Função Principal Exportada ---
export function renderProgressView(container) {
    container.innerHTML = '';
    const wrapper = document.createElement('div');
    wrapper.className = 'progress-view-container';
    wrapper.id = 'progress-panel-main-container';

    wrapper.appendChild(createLatestAchievementsPanel());

    const viewToggleButtons = document.createElement('div');
    viewToggleButtons.className = 'reserve-view-toggle';
    const showProgressBtn = document.createElement('button');
    showProgressBtn.textContent = 'Ver Progresso Geral';
    showProgressBtn.className = 'toggle-button';
    const showRankingBtn = document.createElement('button');
    showRankingBtn.textContent = 'Ver Classificação de Caça';
    showRankingBtn.className = 'toggle-button';
    viewToggleButtons.appendChild(showProgressBtn);
    viewToggleButtons.appendChild(showRankingBtn);
    wrapper.appendChild(viewToggleButtons);

    const contentArea = document.createElement('div');
    contentArea.id = "progress-content-area";
    wrapper.appendChild(contentArea);

    const showNewProgressPanel = () => {
        showProgressBtn.classList.add('active');
        showRankingBtn.classList.remove('active');
        updateNewProgressPanel(contentArea);
    };
    showProgressBtn.onclick = showNewProgressPanel;
    showRankingBtn.onclick = () => {
        showRankingBtn.classList.add('active');
        showProgressBtn.classList.remove('active');
        renderHuntingRankingView(contentArea);
    };

    const backupRestoreContainer = document.createElement('div');
    backupRestoreContainer.style.cssText = 'display: flex; flex-direction: column; gap: 10px; margin-top: 20px; align-items: center;';
    const exportButton = document.createElement('button');
    exportButton.id = 'export-progress-btn';
    exportButton.className = 'back-button';
    exportButton.innerHTML = '<i class="fas fa-download"></i> Fazer Backup (JSON)';
    exportButton.onclick = exportUserData;
    backupRestoreContainer.appendChild(exportButton);
    const importLabel = document.createElement('label');
    importLabel.htmlFor = 'import-file-input';
    importLabel.className = 'back-button';
    importLabel.style.cssText = 'display: block; width: fit-content; cursor: pointer; background-color: var(--inprogress-color); color: #111;';
    importLabel.innerHTML = '<i class="fas fa-upload"></i> Restaurar Backup (JSON)';
    backupRestoreContainer.appendChild(importLabel);
    const importInput = document.createElement('input');
    importInput.type = 'file';
    importInput.id = 'import-file-input';
    importInput.accept = '.json';
    importInput.style.display = 'none';
    importInput.addEventListener('change', importUserData);
    backupRestoreContainer.appendChild(importInput);
    wrapper.appendChild(backupRestoreContainer);

    const resetButton = document.createElement('button');
    resetButton.id = 'progress-reset-button';
    resetButton.textContent = 'Resetar Todo o Progresso';
    resetButton.className = 'back-button';
    resetButton.style.cssText = 'background-color: #d9534f; border-color: #d43f3a; margin-top: 20px;';
    resetButton.onclick = async () => {
        if (await showCustomAlert('Tem certeza que deseja apagar TODO o seu progresso? Esta ação não pode ser desfeita.', 'Resetar Progresso', true)) {
            const defaultData = getDefaultDataStructure();
            saveDataAndUpdateUI(defaultData);
        }
    };

    container.appendChild(wrapper);
    container.appendChild(resetButton);
    showNewProgressPanel();
}

// --- Funções Auxiliares (internas deste módulo) ---

function updateNewProgressPanel(container) {
    container.innerHTML = '';
    const panel = document.createElement('div');
    panel.id = 'progress-panel-v2';
    const overallProgress = calcularOverallProgress();
    const overallSection = document.createElement('div');
    overallSection.innerHTML = `
        <div class="progress-v2-header">
            <h3>Progresso Geral do Caçador</h3>
            <p>Sua jornada de caça em um piscar de olhos.</p>
        </div>
    `;
    const overallGrid = document.createElement('div');
    overallGrid.className = 'overall-progress-grid';
    const categoriesProgress = [
        { key: 'rares', label: 'Pelagens Raras', collected: overallProgress.collectedRares, total: overallProgress.totalRares },
        { key: 'diamonds', label: 'Diamantes', collected: overallProgress.collectedDiamonds, total: overallProgress.totalDiamonds },
        { key: 'greats', label: 'Great Ones', collected: overallProgress.collectedGreatOnes, total: overallProgress.totalGreatOnes },
        { key: 'super_raros', label: 'Super Raros', collected: overallProgress.collectedSuperRares, total: overallProgress.totalSuperRares }
    ];
    categoriesProgress.forEach(cat => {
        const percentage = cat.total > 0 ? Math.round((cat.collected / cat.total) * 100) : 0;
        const radius = 54;
        const circumference = 2 * Math.PI * radius;
        const offset = circumference - (percentage / 100) * circumference;
        const card = document.createElement('div');
        card.className = `progress-dial-card ${cat.key}`;
        card.innerHTML = `
            <div class="progress-dial">
                <svg viewBox="0 0 120 120">
                    <circle class="progress-dial-bg" cx="60" cy="60" r="${radius}"></circle>
                    <circle class="progress-dial-value" cx="60" cy="60" r="${radius}"
                            stroke-dasharray="${circumference}"
                            stroke-dashoffset="${offset}"></circle>
                </svg>
                <div class="progress-dial-percentage">${percentage}%</div>
            </div>
            <div class="progress-dial-label">${cat.label}</div>
            <div class="progress-dial-counts">${cat.collected} / ${cat.total}</div>
        `;
        overallGrid.appendChild(card);
    });
    overallSection.appendChild(overallGrid);
    panel.appendChild(overallSection);
    const reservesSection = document.createElement('div');
    reservesSection.innerHTML = `
        <div class="progress-v2-header">
            <h3>Domínio das Reservas</h3>
            <p>Seu progresso de conquistas em cada território.</p>
        </div>
    `;
    const reservesGrid = document.createElement('div');
    reservesGrid.className = 'reserve-progress-container';
    
    Object.entries(reservesData).sort(([, a], [, b]) => a.name.localeCompare(b.name)).forEach(([reserveKey, reserve]) => {
        
        // CORREÇÃO: Passando 'reservesData' em vez de 'animalData'
        const progress = calculateReserveProgress(reserveKey, reservesData, savedData);

        if (progress.total > 0) {
            const card = document.createElement('div');
            card.className = 'reserve-progress-card';
            card.innerHTML = `
                <div class="reserve-progress-header">
                    <img src="${reserve.image.replace('.png', '_logo.png')}" onerror="this.style.display='none'">
                    <span>${reserve.name}</span>
                </div>
                <div class="reserve-progress-bar-area">
                    <div class="reserve-progress-bar-bg">
                        <div class="reserve-progress-bar-fill" style="width: ${progress.percentage}%"></div>
                    </div>
                    <div class="reserve-progress-details">
                        <span>${progress.completed} / ${progress.total} Conquistados</span>
                        <span>${progress.percentage}% Completo</span>
                    </div>
                </div>
            `;
            reservesGrid.appendChild(card);
        }
    });

    reservesSection.appendChild(reservesGrid);
    panel.appendChild(reservesSection);
    container.appendChild(panel);
}

function createLatestAchievementsPanel() {
    const panel = document.createElement('div');
    panel.className = 'latest-achievements-panel';
    panel.innerHTML = '<h3><i class="fas fa-star"></i> Últimas Conquistas</h3>';
    const grid = document.createElement('div');
    grid.className = 'achievements-grid';
    const allTrophies = [];
    if(savedData.diamantes) {
        Object.entries(savedData.diamantes).forEach(([slug, trophies]) => {
            const animalName = items.find(i => slugify(i) === slug) || slug;
            trophies.forEach(trophy => allTrophies.push({ id: trophy.id, animalName, furName: trophy.type, slug, type: 'diamante' }));
        });
    }
    if(savedData.greats) {
        Object.entries(savedData.greats).forEach(([slug, greatOneData]) => {
            const animalName = items.find(i => slugify(i) === slug) || slug;
            if(greatOneData.furs) {
                Object.entries(greatOneData.furs).forEach(([furName, furData]) => {
                    (furData.trophies || []).forEach(trophy => allTrophies.push({ id: new Date(trophy.date).getTime(), animalName, furName, slug, type: 'greatone' }));
                });
            }
        });
    }
    if (allTrophies.length === 0) {
        grid.innerHTML = '<p style="color: var(--text-color-muted); grid-column: 1 / -1;">Nenhum troféu de destaque registrado ainda.</p>';
    } else {
        allTrophies.sort((a, b) => b.id - a.id).slice(0, 4).forEach(trophy => {
            const card = document.createElement('div');
            card.className = 'achievement-card';
            const rotation = Math.random() * 6 - 3;
            card.style.transform = `rotate(${rotation}deg)`;
            card.addEventListener('mouseenter', () => card.style.zIndex = 10);
            card.addEventListener('mouseleave', () => card.style.zIndex = 1);
            const animalSlug = trophy.slug;
            let imagePathString;
            if (trophy.type === 'diamante') {
                const gender = trophy.furName.toLowerCase().includes('macho') ? 'macho' : 'femea';
                const pureFurName = trophy.furName.replace(/^(macho|fêmea)\s/i, '').trim();
                const furSlug = slugify(pureFurName);
                const specificPath = `animais/pelagens/${animalSlug}_${furSlug}_${gender}.png`;
                const neutralPath = `animais/pelagens/${animalSlug}_${furSlug}.png`;
                const basePath = `animais/${animalSlug}.png`;
                imagePathString = `src="${specificPath}" onerror="this.onerror=null; this.src='${neutralPath}'; this.onerror=null; this.src='${basePath}'; this.onerror=null; this.src='animais/placeholder.jpg';"`;
            } else if (trophy.type === 'greatone') {
                const furSlug = slugify(trophy.furName);
                const specificPath = `animais/pelagens/great_${animalSlug}_${furSlug}.png`;
                const basePath = `animais/${animalSlug}.png`;
                imagePathString = `src="${specificPath}" onerror="this.onerror=null; this.src='${basePath}'; this.onerror=null; this.src='animais/placeholder.jpg';"`;
            } else {
                imagePathString = `src="animais/${animalSlug}.jpg" onerror="this.onerror=null;this.src='animais/placeholder.jpg';"`;
            }
            card.innerHTML = `
                <img ${imagePathString}>
                <div class="achievement-card-info">
                    <div class="animal-name">${trophy.animalName}</div>
                    <div class="fur-name">${trophy.furName.replace(' Diamante','')}</div>
                </div>
            `;
            grid.appendChild(card);
        });
    }
    panel.appendChild(grid);
    return panel;
}

function renderHuntingRankingView(container) {
    const stats = getAggregatedGrindStats();
    container.innerHTML = `
        <div class="ranking-header">
            <h3>Ranking de Caça</h3>
            <p>Estatísticas agregadas de todas as sessões do Contador de Grind.</p>
        </div>
        <div class="ranking-table-container">
            <table class="ranking-table">
                <thead>
                    <tr>
                        <th>Animal</th>
                        <th><i class="fas fa-crosshairs"></i> Abates</th>
                        <th><i class="fas fa-gem"></i> Diamantes</th>
                        <th><i class="fas fa-paw"></i> Raros</th>
                        <th><i class="fas fa-star"></i> Super Raros</th>
                        <th><i class="fas fa-crown"></i> Great Ones</th>
                    </tr>
                </thead>
                <tbody>
                    ${stats.map(animalStat => `
                        <tr>
                            <td data-label="Animal">
                                <img src="animais/${animalStat.animalSlug}.png" class="table-animal-icon" onerror="this.style.display='none'">
                                <span>${animalStat.animalName}</span>
                            </td>
                            <td data-label="Abates">${animalStat.totalKills}</td>
                            <td data-label="Diamantes">${animalStat.diamonds}</td>
                            <td data-label="Raros">${animalStat.rares}</td>
                            <td data-label="Super Raros">${animalStat.superRares}</td>
                            <td data-label="Grandes">${greatsFursData[animalStat.animalSlug] ? animalStat.greatOnes : 'N/A'}</td>
                        </tr>
                    `).join('')}
                </tbody>
            </table>
        </div>
    `;
}

function exportUserData() {
    if (!currentUser || !savedData) {
        showCustomAlert('Nenhum dado para exportar. Faça login primeiro.', 'Erro de Exportação');
        return;
    }
    const dataStr = JSON.stringify(savedData, null, 2);
    const blob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `thehunter_album_backup_${currentUser.uid}_${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    showCustomAlert('Seu progresso foi exportado com sucesso!', 'Backup Criado');
}

async function importUserData(event) {
    if (!currentUser) {
        await showCustomAlert('Faça login antes de tentar importar dados.', 'Erro de Importação');
        return;
    }
    const file = event.target.files[0];
    if (!file) return;
    if (file.type !== 'application/json') {
        await showCustomAlert('Por favor, selecione um arquivo JSON válido.', 'Erro de Arquivo');
        return;
    }
    const reader = new FileReader();
    reader.onload = async (e) => {
        try {
            const importedData = JSON.parse(e.target.result);
            const confirmImport = await showCustomAlert(
                'Tem certeza que deseja sobrescrever seu progresso atual com os dados deste arquivo? Esta ação não pode ser desfeita.',
                'Confirmar Importação',
                true
            );
            if (confirmImport) {
                if (importedData.pelagens || importedData.diamantes || importedData.greats || importedData.super_raros || importedData.grindSessions) {
                    savedData = importedData;
                    await saveDataAndUpdateUI(savedData);
                    await showCustomAlert('Progresso importado e salvo na nuvem com sucesso!', 'Importação Concluída');
                    location.reload();
                } else {
                    await showCustomAlert('O arquivo JSON selecionado não parece ser um backup válido do álbum de caça.', 'Erro de Validação');
                }
            } else {
                await showCustomAlert('Importação cancelada.', 'Cancelado');
            }
        } catch (error) {
            console.error('Erro ao ler ou parsear o arquivo JSON:', error);
            await showCustomAlert('Erro ao ler o arquivo de backup. Certifique-se de que é um JSON válido.', 'Erro de Leitura');
        } finally {
            event.target.value = '';
        }
    };
    reader.readAsText(file);
}

function calcularOverallProgress() {
    const progress = {
        collectedRares: 0,
        totalRares: 0,
        collectedDiamonds: 0,
        totalDiamonds: 0,
        collectedGreatOnes: 0,
        totalGreatOnes: 0,
        collectedSuperRares: 0,
        totalSuperRares: 0,
        collectedHotspots: 0,
        totalHotspots: 0
    };
    const allAnimalSlugs = [...new Set(Object.keys(rareFursData).concat(Object.keys(diamondFursData)))];
    allAnimalSlugs.forEach(slug => {
        if (rareFursData[slug]) {
            progress.totalRares += (rareFursData[slug].macho?.length || 0) + (rareFursData[slug].femea?.length || 0);
        }
        progress.collectedRares += Object.values(savedData.pelagens?.[slug] || {}).filter(v => v === true).length;
        if (diamondFursData[slug]) {
            progress.totalDiamonds += (diamondFursData[slug].macho?.length || 0) + (diamondFursData[slug].femea?.length || 0);
        }
        progress.collectedDiamonds += new Set((savedData.diamantes?.[slug] || []).map(t => t.type)).size;
        if (greatsFursData[slug]) {
            progress.totalGreatOnes += greatsFursData[slug].length;
            progress.collectedGreatOnes += Object.values(savedData.greats?.[slug]?.furs || {}).filter(f => f.trophies?.length > 0).length;
        }
        const speciesRareFurs = rareFursData[slug];
        const speciesDiamondFurs = diamondFursData[slug];
        if (speciesRareFurs) {
            if (speciesRareFurs.macho && (speciesDiamondFurs?.macho?.length || 0) > 0) {
                progress.totalSuperRares += speciesRareFurs.macho.length;
            }
            if (speciesRareFurs.femea && (speciesDiamondFurs?.femea?.length || 0) > 0) {
                progress.totalSuperRares += speciesRareFurs.femea.length;
            }
        }
        progress.collectedSuperRares += Object.values(savedData.super_raros?.[slug] || {}).filter(v => v === true).length;
    });
    progress.totalHotspots = Object.values(animalHotspotData).reduce((acc, reserve) => acc + Object.keys(reserve).length, 0);
    return progress;
}