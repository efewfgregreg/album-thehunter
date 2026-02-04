import { slugify, createSafeImgTag } from '../utils.js';
import { items, reservesData } from '../../data/gameData.js';
import { savedData } from '../main.js';
import { showDetailView } from './detailView.js';
import { 
    calcularProgressoDetalhado, 
    getAnimalCardStatus, 
    getAnimalAttributes, 
    calcularReserveProgress 
} from '../progressLogic.js';
import { renderHuntingRankingView } from './hallOfFameView.js';
import { createAchievementCard } from '../components/AchievementCard.js';

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
    container.appendChild(wrapper);
    showNewProgressPanel(); 
}

export function updateNewProgressPanel(container) {
    container.innerHTML = '';
    const panel = document.createElement('div');
    panel.id = 'progress-panel-v3'; 
    panel.style.animation = "fadeIn 0.5s ease";

    // Calcula estatísticas globais
    const progress = calcularProgressoDetalhado(savedData);

    // =======================================================
    // 1. HEADER E GRÁFICOS CIRCULARES (DONUTS)
    // =======================================================
    const headerStats = document.createElement('div');
    headerStats.innerHTML = `<div class="progress-v2-header" style="text-align:center; margin-bottom:30px;">
        <h3 style="font-size:2rem; margin-bottom:5px;">Visão Geral da Carreira</h3>
        <p style="color:#888;">Suas estatísticas vitais e marcos globais.</p>
    </div>`;
    panel.appendChild(headerStats);

    const overallGrid = document.createElement('div');
    overallGrid.className = 'overall-progress-grid';

    // Helper para criar Card Circular
    const createDialCard = (title, iconClass, color, collected, total, subtext) => {
        const percent = total > 0 ? Math.round((collected / total) * 100) : 0;
        const degrees = (percent / 100) * 360;
        
        return `
        <div class="progress-dial-card">
            <div class="progress-dial" style="--dial-color: ${color}; background: conic-gradient(${color} ${degrees}deg, #333 0deg);">
                <div class="progress-dial-inner">
                    <i class="${iconClass} dial-icon"></i>
                    <span class="dial-percent">${percent}%</span>
                </div>
            </div>
            <h4>${title}</h4>
            <div class="progress-dial-stats">${collected} / ${total}</div>
            <div class="progress-dial-subtext">${subtext}</div>
        </div>`;
    };

    overallGrid.innerHTML += createDialCard("Pelagens Raras", "fas fa-paw", "#FFC107", progress.rares.collected, progress.rares.total, `${progress.rares.speciesCompleted} Espécies Platinadas`);
    overallGrid.innerHTML += createDialCard("Diamantes", "fas fa-gem", "#00bcd4", progress.diamonds.collected, progress.diamonds.total, `${progress.diamonds.speciesCollected} Espécies c/ Diamante`);
    overallGrid.innerHTML += createDialCard("Great Ones", "fas fa-crown", "#ffd700", progress.greats.collected, progress.greats.total, "O auge da caça");
    overallGrid.innerHTML += createDialCard("Super Raros", "fas fa-star", "#e040fb", progress.super_raros.collected, progress.super_raros.total, "Raros + Diamante");

    panel.appendChild(overallGrid);

    // =======================================================
    // 2. SEÇÃO DE INTELIGÊNCIA (NOVO!)
    // =======================================================
    
    // --- Lógica: Encontrar animais "Quase Lá" (Oportunidades) ---
    const opportunities = [];
    const classProgress = {}; // Armazena contagem { '1': {collected: 5, total: 10}, ... }

    items.forEach(animalName => {
        const slug = slugify(animalName);
        const stats = getAnimalCardStatus(slug, 'pelagens', savedData);
        const attr = getAnimalAttributes(slug); // Pega a classe do animal

        // 1. Dados para o Radar (Filtro: > 50% e < 100%)
        if (stats.total > 0 && stats.collected < stats.total) {
            const perc = (stats.collected / stats.total) * 100;
            if (perc >= 50) {
                opportunities.push({
                    name: animalName,
                    slug: slug,
                    perc: Math.round(perc),
                    missing: stats.total - stats.collected,
                    total: stats.total
                });
            }
        }

        // 2. Dados para Classes
        if (attr.classes && attr.classes.length > 0) {
            // Um animal pode ter múltiplas classes em reservas diferentes, pegamos a primeira válida ou a mais alta
            const mainClass = attr.classes[0]; 
            if (mainClass) {
                if (!classProgress[mainClass]) classProgress[mainClass] = { col: 0, tot: 0 };
                // Usamos dados de pelagens como métrica de proficiência
                classProgress[mainClass].tot += stats.total;
                classProgress[mainClass].col += stats.collected;
            }
        }
    });

    // Ordena oportunidades (maior porcentagem primeiro) e pega top 4
    opportunities.sort((a, b) => b.perc - a.perc);
    const topOpportunities = opportunities.slice(0, 4);

    // --- HTML da Seção de Inteligência ---
    const intelSection = document.createElement('div');
    intelSection.className = 'intelligence-section';

    // PAINEL ESQUERDO: Radar de Oportunidades
    const radarPanel = document.createElement('div');
    radarPanel.className = 'opportunity-panel';
    let oppHTML = `<div class="intel-title"><i class="fas fa-crosshairs"></i> Radar de Oportunidades</div>`;
    
    if (topOpportunities.length > 0) {
        oppHTML += `<div class="opportunity-list">`;
        topOpportunities.forEach(opp => {
            oppHTML += `
            <div class="opportunity-card" onclick="document.dispatchEvent(new CustomEvent('navToDetail', {detail: {name: '${opp.name}'}}))">
                <img src="animais/${opp.slug}.png" class="opp-img" onerror="this.src='animais/placeholder.jpg'">
                <div class="opp-info">
                    <span class="opp-name">${opp.name}</span>
                    <span class="opp-missing">Faltam apenas <strong>${opp.missing}</strong> pelagens</span>
                </div>
                <div class="opp-perc">${opp.perc}%</div>
            </div>`;
        });
        oppHTML += `</div>`;
    } else {
        oppHTML += `<p style="color:#888; font-style:italic;">Nenhuma espécie próxima de completar. Continue caçando!</p>`;
    }
    radarPanel.innerHTML = oppHTML;

    // Adiciona listener global para o clique (gambiarra elegante para navegar dentro do HTML string)
    if (!window.hasNavListener) {
        document.addEventListener('navToDetail', (e) => showDetailView(e.detail.name, 'pelagens'));
        window.hasNavListener = true;
    }

    // PAINEL DIREITO: Proficiência por Classe
    const classPanel = document.createElement('div');
    classPanel.className = 'classes-panel';
    let classHTML = `<div class="intel-title"><i class="fas fa-layer-group"></i> Proficiência por Classe</div>`;
    classHTML += `<div class="classes-grid">`;

    // Ordena classes 1-9
    Object.keys(classProgress).sort((a, b) => parseInt(a) - parseInt(b)).forEach(cls => {
        const data = classProgress[cls];
        const p = data.tot > 0 ? Math.round((data.col / data.tot) * 100) : 0;
        
        classHTML += `
        <div class="class-stat-row">
            <div class="class-header">
                <span>Classe ${cls}</span>
                <span>${p}%</span>
            </div>
            <div class="class-bar-bg">
                <div class="class-bar-fill" style="width: ${p}%"></div>
            </div>
        </div>`;
    });
    classHTML += `</div>`;
    classPanel.innerHTML = classHTML;

    intelSection.appendChild(radarPanel);
    intelSection.appendChild(classPanel);
    panel.appendChild(intelSection);


    // =======================================================
    // 3. SEÇÃO DE DOMÍNIO DAS RESERVAS (CARTÕES V4)
    // =======================================================
    const reservesSection = document.createElement('div');
    reservesSection.innerHTML = `
        <div class="progress-v2-header" style="margin-top:50px; border-top:1px solid #333; padding-top:30px; margin-bottom:20px;">
            <h3><i class="fas fa-map"></i> Domínio Territorial</h3>
            <p>Clique em uma reserva para ver estatísticas e acessar.</p>
        </div>`;
    
    const reservesContainer = document.createElement('div');
    reservesContainer.className = 'reserves-cards-container';
    
    // Ordena as reservas por nome
    Object.entries(reservesData)
        .sort(([, a], [, b]) => a.name.localeCompare(b.name))
        .forEach(([reserveKey, reserve]) => {
            // 1. Calcula progresso de forma segura (Corrige o bug do undefined%)
            const rp = calcularReserveProgress(reserveKey, savedData);
            const percent = (rp && !isNaN(rp.percentage)) ? rp.percentage : 0; 

            // 2. Conta estatísticas reais dessa reserva
            let diaCount = 0;
            let rareCount = 0;
            
            // Varre os animais desta reserva para contar troféus específicos dela
            reserve.animals.forEach(slug => {
                if (savedData.diamantes?.[slug]) diaCount += savedData.diamantes[slug].length;
                
                // Conta pelagens raras (valores true)
                if (savedData.pelagens?.[slug]) {
                    rareCount += Object.values(savedData.pelagens[slug]).filter(v => v === true).length;
                }
            });

            // 3. Cria o Cartão Interativo
            const card = document.createElement('div');
            card.className = 'reserve-progress-card-v4';
            // Usa a imagem da reserva como fundo (se não tiver, usa placeholder)
            const bgImage = reserve.image || 'reservas/placeholder.jpg';
            card.style.backgroundImage = `url('${bgImage}')`;
            
            card.innerHTML = `
                <div class="rp-card-overlay">
                    <div class="rp-header-row">
                        <h3>${reserve.name}</h3>
                        <span class="rp-percent-badge">${percent}%</span>
                    </div>
                    
                    <div class="rp-mini-bar">
                        <div class="rp-mini-bar-fill" style="width: ${percent}%"></div>
                    </div>

                    <div class="rp-expand-hint"><i class="fas fa-chevron-down"></i> Detalhes</div>

                    <div class="rp-details-panel">
                        <div class="rp-stats-row">
                            <div class="rp-stat-box">
                                <strong style="color:#00bcd4"><i class="fas fa-gem"></i> ${diaCount}</strong>
                                <span>Diamantes</span>
                            </div>
                            <div class="rp-stat-box">
                                <strong style="color:#ffa726"><i class="fas fa-paw"></i> ${rareCount}</strong>
                                <span>Raros</span>
                            </div>
                        </div>
                        
                        <div class="rp-actions">
                            <button class="rp-btn btn-enter"><i class="fas fa-list"></i> Animais</button>
                            <button class="rp-btn btn-map"><i class="fas fa-map-marked-alt"></i> Hotspots</button>
                        </div>
                    </div>
                </div>
            `;

            // Lógica de Expansão (Acordeão)
            card.addEventListener('click', (e) => {
                // Se clicou num botão dentro do card, não executa a expansão
                if (e.target.closest('button')) return;
                
                // Fecha outros cards abertos para manter o visual limpo
                document.querySelectorAll('.reserve-progress-card-v4.expanded').forEach(c => {
                    if (c !== card) c.classList.remove('expanded');
                });
                
                // Alterna este card
                card.classList.toggle('expanded');
            });

            // Ações dos Botões Internos
            const btnEnter = card.querySelector('.btn-enter');
            btnEnter.addEventListener('click', () => showReserveDetailView(reserveKey, 'progresso'));

            const btnMap = card.querySelector('.btn-map');
            btnMap.addEventListener('click', () => {
                showReserveDetailView(reserveKey, 'progresso');
                // Pequeno hack: espera a tela carregar e clica no botão de "Mapas"
                setTimeout(() => {
                    const toggleBtns = document.querySelectorAll('.reserve-view-toggle .toggle-button');
                    if(toggleBtns[1]) toggleBtns[1].click();
                }, 100);
            });
            
            reservesContainer.appendChild(card);
    });

    reservesSection.appendChild(reservesContainer);
    panel.appendChild(reservesSection);
    
    container.appendChild(panel);
}

function createLatestAchievementsPanel() {
    const panel = document.createElement('div');
    panel.className = 'latest-achievements-panel';
    
    // Título com contador
    panel.innerHTML = `
        <div style="display:flex; justify-content:space-between; align-items:flex-end; border-bottom:1px solid var(--border-color); padding-bottom:10px; margin-bottom:10px;">
            <h3 style="margin:0; border:none; padding:0;"><i class="fas fa-star"></i> Galeria de Conquistas</h3>
            <span style="font-size:0.8rem; color:var(--text-color-muted);">Deslize para ver mais &rarr;</span>
        </div>
    `;
    
    const allTrophies = [];

    // 1. Coleta Diamantes
    if(savedData.diamantes) {
        Object.entries(savedData.diamantes).forEach(([slug, trophies]) => {
            const animalName = items.find(i => slugify(i) === slug) || slug;
            trophies.forEach(trophy => allTrophies.push({ id: trophy.id, animalName, furName: trophy.type, slug, type: 'diamante', score: trophy.score }));
        });
    }

    // 2. Coleta Great Ones
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

    // Se não tiver nada
    if (allTrophies.length === 0) {
        const emptyMsg = document.createElement('div');
        emptyMsg.innerHTML = '<p style="color: var(--text-color-muted); padding: 20px; text-align: center; font-style: italic;">Nenhum troféu de destaque (Diamante ou Great One) registrado ainda.</p>';
        panel.appendChild(emptyMsg);
        return panel;
    }

    // 3. Ordena (Mais recente primeiro) e pega os top 15
    const recentTrophies = allTrophies.sort((a, b) => b.id - a.id).slice(0, 15);

    // 4. Cria a Estrutura do Carrossel
    const carouselWrapper = document.createElement('div');
    carouselWrapper.className = 'achievements-carousel-wrapper';

    const btnPrev = document.createElement('button');
    btnPrev.className = 'carousel-btn prev';
    btnPrev.innerHTML = '<i class="fas fa-chevron-left"></i>';
    
    const trackContainer = document.createElement('div');
    trackContainer.className = 'achievements-track-container';
    
    const track = document.createElement('div');
    track.className = 'achievements-track';

    recentTrophies.forEach(trophy => {
        const card = createAchievementCard(trophy);
        track.appendChild(card);
    });

    const btnNext = document.createElement('button');
    btnNext.className = 'carousel-btn next';
    btnNext.innerHTML = '<i class="fas fa-chevron-right"></i>';

    trackContainer.appendChild(track);
    carouselWrapper.appendChild(btnPrev);
    carouselWrapper.appendChild(trackContainer);
    carouselWrapper.appendChild(btnNext);
    panel.appendChild(carouselWrapper);

    // 5. Lógica de Scroll
    btnPrev.addEventListener('click', () => {
        trackContainer.scrollBy({ left: -300, behavior: 'smooth' });
    });

    btnNext.addEventListener('click', () => {
        trackContainer.scrollBy({ left: 300, behavior: 'smooth' });
    });

    return panel;
} // Fecha createLatestAchievementsPanel