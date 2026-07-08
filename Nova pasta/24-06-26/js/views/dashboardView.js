import { items, reservesData, rareFursData } from '../../data/gameData.js';
import { slugify } from '../utils.js';
import { TABS } from '../constants.js';

/**
 * Dashboard V67.0 - "Social Hub Integration"
 * - Novo: Adicionado Card "Clube de Troféus" (Dourado) ao lado da Roleta.
 */
export function renderDashboardView(container, savedData, navigateCallback) {
    container.innerHTML = '';

    // 1. LÓGICA DE DADOS
    const activeGrind = getMostRecentGrind(savedData);
    const collectionGoal = findSmartCollectionGoal(savedData);
    
    const bgKey = activeGrind?.reserveKey?.toLowerCase().replace(/\s+/g, '_') || 'main';
    const bgImage = `backgrounds/${bgKey}.jpg`;

    // 2. CSS SCOPED
    const style = document.createElement('style');
    style.textContent = `
        .app-layout {
            display: flex; height: 100vh; background: #000; color: #e0e0e0;
            font-family: 'Montserrat', sans-serif; overflow: hidden;
            --sidebar-w: 260px; --cyan: #00bcd4; --magenta: #d500f9; --yellow: #ffd700; --orange: #ff9800;
            --card-bg: rgba(18, 18, 18, 0.9); --border: 1px solid rgba(255, 255, 255, 0.1);
            --glass: blur(15px);
        }

        .sidebar { width: var(--sidebar-w); background: #0b0b0b; border-right: var(--border); display: flex; flex-direction: column; padding: 40px 30px; z-index: 20; }
        .brand h1 { font-family: 'Bebas Neue', cursive; font-size: 3rem; margin: 0; line-height: 0.85; color: #fff; }
        .nav-list { display: flex; flex-direction: column; gap: 10px; margin-top: 40px; }
        .nav-item { display: flex; align-items: center; gap: 15px; padding: 12px 15px; border-radius: 6px; color: #777; cursor: pointer; transition: 0.3s ease; font-size: 0.85rem; font-weight: 600; text-transform: uppercase; }
        .nav-item:hover { background: rgba(255,255,255,0.03); transform: translateX(5px); color: #fff; }
        .nav-item.active { background: rgba(0, 188, 212, 0.08); color: #fff; border-left: 3px solid var(--cyan); }

        .content-area { 
            flex: 1; padding: 40px 50px; overflow-y: auto; position: relative; 
            display: grid; grid-template-columns: 1fr 320px; gap: 30px; 
            background-size: cover; background-position: center; 
        }

        /* Ajuste Adaptativo para Telemóveis */
        @media (max-width: 1024px) {
            .content-area {
                display: flex;
                flex-direction: column;
                padding: 20px 15px;
                gap: 20px;
            }
            .dashboard-left-column, .dashboard-right-sidebar {
                width: 100%;
                max-width: 100%;
            }
            .dashboard-right-sidebar {
                order: -1; /* Coloca o Grind Ativo no topo no telemóvel */
            }
        }

        /* Ajustes para Dispositivos Móveis (Celulares) */
        @media (max-width: 1024px) {
            .content-area {
                display: flex;
                flex-direction: column;
                padding: 20px 15px;
                grid-template-columns: 1fr;
                gap: 20px;
            }
            .dashboard-left-column, .dashboard-right-sidebar {
                width: 100%;
                max-width: 100%;
            }
            /* Garante que o Card de Grind Ativo seja o primeiro a ser visto no mobile se desejar, 
               ou mantenha a ordem lógica de leitura. */
            .dashboard-right-sidebar {
                order: -1; /* Opcional: Coloca o Grind Ativo no topo no mobile */
            }
        }

        /* GRID CENTRAL */
        .trophy-grid-main { 
            grid-column: 1; z-index: 1; display: grid; 
            grid-template-columns: repeat(auto-fill, minmax(300px, 1fr)); 
            grid-auto-rows: auto; 
            gap: 15px; 
        }

        /* Card Padrão (Pequeno) */
        .trophy-card-big { 
            height: 100px; 
            background: var(--card-bg); border: var(--border); border-radius: 12px; padding: 0 25px; 
            display: flex; align-items: center; gap: 20px; cursor: pointer; 
            transition: all 0.4s cubic-bezier(0.165, 0.84, 0.44, 1); backdrop-filter: var(--glass); position: relative; overflow: hidden; 
        }
        .trophy-card-big:hover { transform: translateY(-5px); border-color: rgba(255, 255, 255, 0.3); }
        .trophy-card-big::before { content: ''; position: absolute; left: 0; top: 0; bottom: 0; width: 4px; background: var(--c); }
        
        .tc-icon-box { width: 40px; height: 40px; display: flex; align-items: center; justify-content: center; flex-shrink: 0; }
        .tc-icon-box img { width: 100%; height: 100%; object-fit: contain; }
        .tc-icon-box i { font-size: 1.6rem; color: #ccc; }
        .tc-info { display: flex; flex-direction: column; justify-content: center; text-align: left; }
        .tc-name { font-family: 'Bebas Neue', cursive; font-size: 1.6rem; color: #fff; line-height: 1; margin: 0; }
        .tc-sub { font-size: 0.65rem; color: #666; font-weight: 700; text-transform: uppercase; margin-top: 3px; }

        /* CARD ESPECIAL - ROLETA (Roxo) */
        .special-card-roulette {
            height: 220px; 
            background: radial-gradient(circle at top right, rgba(156, 39, 176, 0.15), rgba(18, 18, 18, 0.95));
            border: var(--border); border-radius: 15px; position: relative; overflow: hidden;
            display: flex; flex-direction: column; align-items: center; justify-content: center;
            cursor: pointer; transition: 0.4s; backdrop-filter: blur(20px);
            border-bottom: 4px solid #9c27b0;
            grid-column: span 1; 
        }
        .special-card-roulette:hover { transform: translateY(-5px); border-color: #ba68c8; box-shadow: 0 10px 30px rgba(156, 39, 176, 0.2); }
        
        .scr-icon { font-size: 3.5rem; color: #fff; margin-bottom: 15px; text-shadow: 0 0 20px rgba(156, 39, 176, 0.6); transition: 0.5s; }
        .special-card-roulette:hover .scr-icon { transform: rotate(180deg) scale(1.1); }
        
        .scr-title { font-family: 'Bebas Neue', cursive; font-size: 2.2rem; color: #fff; line-height: 1; margin-bottom: 5px; }
        .scr-sub { font-size: 0.75rem; color: #aaa; text-transform: uppercase; letter-spacing: 2px; font-weight: 700; }
        
        /* CARD ESPECIAL - CLUBE DE TROFÉUS (Dourado - NOVO) */
        .special-card-trophy {
            height: 220px;
            background: radial-gradient(circle at top left, rgba(255, 215, 0, 0.15), rgba(18, 18, 18, 0.95));
            border: var(--border); border-radius: 15px; position: relative; overflow: hidden;
            display: flex; flex-direction: column; align-items: center; justify-content: center;
            cursor: pointer; transition: 0.4s; backdrop-filter: blur(20px);
            border-bottom: 4px solid #FFD700;
            grid-column: span 1;
        }
        .special-card-trophy:hover { transform: translateY(-5px); border-color: #FFD700; box-shadow: 0 10px 30px rgba(255, 215, 0, 0.2); }
        
        .sct-icon { font-size: 3.5rem; color: #fff; margin-bottom: 15px; text-shadow: 0 0 20px rgba(255, 215, 0, 0.6); transition: 0.5s; }
        .special-card-trophy:hover .sct-icon { transform: scale(1.1) rotate(-10deg); }
        
        .sct-title { font-family: 'Bebas Neue', cursive; font-size: 2.2rem; color: #fff; line-height: 1; margin-bottom: 5px; }
        .sct-sub { font-size: 0.75rem; color: #aaa; text-transform: uppercase; letter-spacing: 2px; font-weight: 700; }

        .scr-bg-deco {
            position: absolute; top: 0; left: 0; width: 100%; height: 100%;
            background-image: url('https://www.transparenttextures.com/patterns/carbon-fibre.png');
            opacity: 0.1; pointer-events: none; z-index: 0;
        }

        /* COLUNA DIREITA */
        .right-col { grid-column: 2; z-index: 1; display: flex; flex-direction: column; gap: 25px; }
        .goal-box { background: var(--card-bg); border: var(--border); border-radius: 15px; padding: 25px; border-top: 4px solid var(--accent); backdrop-filter: var(--glass); transition: 0.4s; }
        .gb-label { font-size: 0.7rem; font-weight: 800; color: var(--accent); text-transform: uppercase; letter-spacing: 1px; margin-bottom: 10px; display: block; }
        .gb-target-name { font-family: 'Bebas Neue', cursive; font-size: 1.6rem; color: #fff; line-height: 1; margin-bottom: 15px; display: block; }
        .gb-pct { font-family: 'Bebas Neue', cursive; font-size: 4.5rem; color: #fff; line-height: 1; margin-bottom: 10px; display: block; }
        .gb-bar { width: 100%; height: 8px; background: rgba(255,255,255,0.1); border-radius: 4px; overflow: hidden; margin-bottom: 15px; }
        .gb-fill { height: 100%; background: var(--accent); box-shadow: 0 0 15px var(--accent); transition: width 1s ease; }
        .gb-desc { font-size: 0.85rem; color: #bbb; line-height: 1.4; }

        .active-session-card {
            background: #111; border: var(--border); border-radius: 15px; width: 100%; height: 260px; 
            display: flex; flex-direction: column; align-items: center; justify-content: center;
            position: relative; overflow: hidden; backdrop-filter: var(--glass);
            border-bottom: 4px solid var(--magenta); cursor: pointer; 
            transition: all 0.4s cubic-bezier(0.165, 0.84, 0.44, 1); box-shadow: 0 10px 30px rgba(0,0,0,0.7);
        }
        .active-session-card:hover { transform: translateY(-8px); border-color: var(--magenta); }
        .as-full-bg { position: absolute; inset: 0; opacity: 0.15; z-index: 0; background-size: contain; background-position: center; background-repeat: no-repeat; filter: grayscale(1); }
        .as-header { position: relative; z-index: 2; display: flex; flex-direction: column; align-items: center; margin-bottom: 5px; }
        .as-status-tag { background: var(--magenta); color: #fff; font-size: 0.55rem; font-weight: 900; padding: 2px 8px; border-radius: 2px; text-transform: uppercase; letter-spacing: 1px; margin-bottom: 3px; }
        .as-reserve-name { color: var(--cyan); font-size: 0.75rem; font-weight: 800; text-transform: uppercase; letter-spacing: 0.5px; }
        .as-animal-name { font-family: 'Bebas Neue', cursive; font-size: 2rem; color: #fff; position: relative; z-index: 2; text-transform: uppercase; letter-spacing: 1.5px; margin-top: 5px; }
        .as-divider { width: 25%; height: 1px; background: linear-gradient(90deg, transparent, var(--magenta), transparent); margin: 10px 0; position: relative; z-index: 2; }
        .as-kills-value { font-family: 'Bebas Neue', cursive; font-size: 5.5rem; color: #fff; line-height: 0.8; position: relative; z-index: 2; text-shadow: 0 0 25px rgba(213, 0, 249, 0.3); }
        .as-label { font-size: 0.65rem; color: #888; font-weight: 800; text-transform: uppercase; letter-spacing: 1.5px; position: relative; z-index: 2; margin-top: 5px; }
    `;
    container.appendChild(style);

    const dashElement = document.createElement('div');
    dashElement.className = 'app-layout';
    dashElement.innerHTML = `
        <aside class="sidebar">
            <div class="brand"><h1>HUNTER<br>COMPANION</h1></div>
            <nav class="nav-list">
                <div class="nav-item active"><i class="fas fa-home"></i> Início</div>
                <div class="nav-item" id="nav-reserves"><i class="fas fa-map"></i> Reservas</div>
                <div class="nav-item" id="nav-grind"><i class="fas fa-list"></i> Grinds</div>
                <div class="nav-item" id="nav-progresso"><i class="fas fa-chart-line"></i> Progresso</div>
                <div class="nav-item" id="nav-settings"><i class="fas fa-cog"></i> Ajustes</div>
            </nav>
        </aside>
        <main class="content-area" style="background-image: url('${bgImage}');">
            <div class="content-overlay"></div>
            <div class="trophy-grid-main">
                <div class="trophy-card-big" id="nav-greats" style="--c: var(--yellow)">
                    <div class="tc-icon-box"><img src="icones/greatone_icon.png"></div>
                    <div class="tc-info"><span class="tc-name">Great Ones</span><span class="tc-sub">Lendas</span></div>
                </div>
                <div class="trophy-card-big" id="nav-diamonds" style="--c: var(--cyan)">
                    <div class="tc-icon-box"><img src="icones/diamante_icon.png"></div>
                    <div class="tc-info"><span class="tc-name">Diamantes</span><span class="tc-sub">Elite</span></div>
                </div>

                <div class="trophy-card-big" id="nav-rares" style="--c: var(--orange)">
                    <div class="tc-icon-box"><img src="icones/pata_icon.png"></div>
                    <div class="tc-info"><span class="tc-name">Pelagens Raras</span><span class="tc-sub">Raros</span></div>
                </div>
                <div class="trophy-card-big" id="nav-super" style="--c: var(--magenta)">
                    <div class="tc-icon-box"><img src="icones/coroa_icon.png"></div>
                    <div class="tc-info"><span class="tc-name">Super Raros</span><span class="tc-sub">Únicos</span></div>
                </div>
                
                <div class="trophy-card-big" id="nav-feeders" style="--c: var(--primary-color)">
                    <div class="tc-icon-box"><i class="fas fa-utensils" style="color:var(--primary-color)"></i></div>
                    <div class="tc-info"><span class="tc-name">Tratadores</span><span class="tc-sub">Guia de Iscas</span></div>
                </div>
                <div class="trophy-card-big" id="nav-mounts" style="--c: #888">
                    <div class="tc-icon-box"><i class="fas fa-shapes"></i></div>
                    <div class="tc-info"><span class="tc-name">Montagens</span><span class="tc-sub">Taxidermia</span></div>
                </div>

                <div class="special-card-roulette" id="nav-roulette">
                    <div class="scr-bg-deco"></div>
                    <i class="fas fa-dice scr-icon"></i>
                    <span class="scr-title">ROLETA TÁTICA</span>
                    <span class="scr-sub">SORTEIO DE CAÇA</span>
                </div>

                <div class="special-card-trophy" id="nav-trophies">
                    <div class="scr-bg-deco"></div>
                    <i class="fas fa-trophy sct-icon"></i>
                    <span class="sct-title">CLUBE DE TROFÉUS</span>
                    <span class="sct-sub">GALERIA & SOCIAL</span>
                </div>

            </div>
            
            <div class="right-col">
                <div class="goal-box" style="--accent: ${collectionGoal.color}">
                    <span class="gb-label">Status de Coleção</span>
                    <span class="gb-target-name">${collectionGoal.name}</span>
                    <span class="gb-pct">${collectionGoal.percent}%</span>
                    <div class="gb-bar"><div class="gb-fill" style="width:${collectionGoal.percent}%"></div></div>
                    <p class="gb-desc">${collectionGoal.text}</p>
                </div>
                ${activeGrind ? `
                <div class="active-session-card" id="btn-resume-grind">
                    <div class="as-full-bg" style="background-image: url('animais/${activeGrind.slug.replace(/-/g, '_')}.png');"></div>
                    <div class="as-header">
                        <span class="as-status-tag">Ativa</span>
                        <span class="as-reserve-name">${activeGrind.reserveName}</span>
                    </div>
                    <span class="as-animal-name">${activeGrind.name}</span>
                    <div class="as-divider"></div>
                    <span class="as-kills-value">${activeGrind.kills}</span>
                    <span class="as-label">Abates</span>
                </div>
                ` : ''}
            </div>
        </main>
    `;
    container.appendChild(dashElement);

    const bind = (id, tab) => {
        const el = dashElement.querySelector(`#${id}`);
        if(el) el.onclick = () => navigateCallback(tab);
    };

    bind('nav-reserves', TABS.RESERVAS);
    bind('nav-grind', TABS.GRIND);
    bind('nav-progresso', TABS.PROGRESSO);
    bind('nav-settings', TABS.CONFIGURACOES);
    bind('nav-greats', TABS.GREATS);
    bind('nav-diamonds', TABS.DIAMANTES);
    bind('nav-rares', TABS.PELAGENS);
    bind('nav-super', TABS.SUPER_RAROS);
    bind('nav-mounts', TABS.MONTAGENS);
    bind('nav-feeders', 'TRATADORES');
    bind('nav-roulette', 'ROLETA');
    // BIND DO NOVO CARD
    bind('nav-trophies', 'TROPHIES');

    const resumeBtn = dashElement.querySelector('#btn-resume-grind');
    if (resumeBtn && activeGrind) {
        resumeBtn.onclick = () => {
             const event = new CustomEvent('resume-grind', { detail: { sessionId: activeGrind.id } });
             document.dispatchEvent(event);
        };
    }
}

function findSmartCollectionGoal(data) {
    let goals = [];
    if (data.diamantes) {
        Object.entries(data.diamantes).forEach(([slug, list]) => {
            const current = Array.isArray(list) ? list.length : 0;
            const target = rareFursData[slug] ? (Array.isArray(rareFursData[slug]) ? rareFursData[slug].length : Object.keys(rareFursData[slug]).length) : 5;
            if (current > 0 && current < target) {
                const animalName = items.find(i => slugify(i) === slug) || slug;
                goals.push({ name: `${animalName} Diamante`, percent: Math.round((current/target)*100), text: `Faltam <strong>${target - current}</strong> para completar o álbum.`, color: '#00bcd4' });
            }
        });
    }
    if (data.pelagens) {
        Object.entries(data.pelagens).forEach(([slug, userRares]) => {
            const current = Object.keys(userRares).length;
            const target = rareFursData[slug] ? (Array.isArray(rareFursData[slug]) ? rareFursData[slug].length : Object.keys(rareFursData[slug]).length) : 5;
            if (current > 0 && current < target) {
                const animalName = items.find(i => slugify(i) === slug) || slug;
                goals.push({ name: `${animalName} Raros`, percent: Math.round((current/target)*100), text: `Falta <strong>${target - current}</strong> variação para fechar a coleção.`, color: '#ff9800' });
            }
        });
    }
    if (goals.length === 0) return { name: "Nova Jornada", percent: 0, text: "Comece a coletar!", color: '#ffd700' };
    const randomIndex = Math.floor(Math.random() * goals.length);
    return goals[randomIndex];
}

function getMostRecentGrind(data) {
    if (!data || !data.grindSessions || data.grindSessions.length === 0) return null;
    
    // CORREÇÃO: Converte strings de data para timestamp (número) antes de ordenar
    const sorted = [...data.grindSessions].sort((a, b) => {
        // Tenta pegar a data de atualização, ou o timestamp de criação, ou o ID
        const dateA = new Date(a.lastUpdate || a.timestamp || a.id || 0).getTime();
        const dateB = new Date(b.lastUpdate || b.timestamp || b.id || 0).getTime();
        
        // Se a conversão falhar (NaN), assume 0
        const valA = isNaN(dateA) ? 0 : dateA;
        const valB = isNaN(dateB) ? 0 : dateB;

        return valB - valA; // Ordena do maior (mais novo) para o menor
    });

    const last = sorted[0];
    const name = items.find(i => slugify(i) === last.animalSlug) || last.animalSlug;
    const reserve = reservesData[last.reserveKey];
    
    return { 
        id: last.id, 
        name, 
        slug: last.animalSlug, 
        reserveName: reserve ? reserve.name : 'Desconhecida', 
        reserveKey: last.reserveKey, 
        kills: last.counts?.total || 0 
    };
}