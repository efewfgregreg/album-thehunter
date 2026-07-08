// Importamos TUDO o que é necessário do seu arquivo de dados central
import { items, reservesData, animalHotspotData, greatsFursData } from '../../data/gameData.js';
// Certifique-se de que a função slugify está correta no utils, ou use a função interna abaixo
import { slugify } from '../utils.js'; 

export function renderRouletteView(container) {
    container.innerHTML = '';

    // --- CONFIGURAÇÃO VISUAL ---
    // NOVA PALETA: Cores vibrantes "Cyber/Neon"
    const PALETTE = [
        '#8E24AA', // Roxo Vibrante
        '#C2185B', // Magenta Escuro
        '#3949AB', // Azul Indigo
        '#00ACC1', // Cyan Escuro
        '#1E1E1E', // Preto Fosco (para contraste)
        '#D81B60'  // Rosa Choque
    ];

    // --- ESTADO DA APLICAÇÃO ---
    const state = {
        focus: 'animal',         
        isSecondaryPhase: false, 
        filterMode: 'all',       
        selectedClasses: [],     
        selectedReserves: [],
        selectedDifficulty: 'all', // 'all', 'mid', 'legendary'
        selectedTime: null,      // null ou inteiro (0-23)
        excludedItems: [],       
        activePool: [],          
        winner: null,
        isSpinning: false,
        rotation: 0,
        velocity: 0
    };

    // --- HELPER: NORMALIZAÇÃO DE DADOS (CRÍTICO PARA CORREÇÃO) ---
    // Esta função garante que "Antílope Negro" vire "antilope_negro"
    const toKey = (str) => {
        if (!str) return '';
        return str.toLowerCase()
                  .normalize("NFD").replace(/[\u0300-\u036f]/g, "") // Remove acentos
                  .replace(/[^a-z0-9]/g, "_") // Remove caracteres especiais
                  .replace(/_+/g, "_"); // Remove underlines duplicados
    };

    const getAnimalMeta = (animalName) => {
        const key = toKey(animalName);
        const isGO = greatsFursData.hasOwnProperty(key);
        let techData = null;
        
        // Busca dados técnicos normalizando as chaves
        for (const resKey in animalHotspotData) {
            if (animalHotspotData[resKey][key]) {
                techData = animalHotspotData[resKey][key];
                break; 
            }
        }

        return {
            key: key,
            isGO: isGO,
            class: techData ? parseInt(techData.animalClass) : null,
            maxLevelText: techData ? techData.maxLevel : '', 
            maxLevelNum: techData ? parseInt(techData.maxLevel.split(' ')[0]) : 0,
            drinkZones: getDrinkZonesList(key) 
        };
    };

    const getDrinkZonesList = (animalKey) => {
        let zones = [];
        for (const resKey in animalHotspotData) {
            const data = animalHotspotData[resKey][animalKey];
            if (data && data.drinkZonesPotential) {
                zones.push(data.drinkZonesPotential);
            }
        }
        return zones; 
    };

    // --- CSS (Estilização) ---
    const style = document.createElement('style');
    style.textContent = `
        /* Layout Principal */
        .roulette-container { 
            padding: 20px; 
            color: #e0e0e0; 
            max-width: 1600px; 
            margin: 0 auto; 
            display: grid; 
            grid-template-columns: 400px 1fr; 
            gap: 40px; 
            min-height: 85vh; 
            font-family: 'Montserrat', sans-serif; 
            align-items: start;
        }

        /* Sidebar (Central de Sorteio) */
        .controls-panel { 
            background: #121212; 
            padding: 0; 
            border-radius: 12px; 
            border: 1px solid #333; 
            display: flex; 
            flex-direction: column; 
            gap: 0; 
            overflow: hidden;
            box-shadow: 0 4px 20px rgba(0,0,0,0.5);
        }

        .panel-header {
            padding: 20px;
            background: #1a1a1a;
            border-bottom: 1px solid #333;
        }

        .panel-title { 
            font-family: 'Bebas Neue', cursive; 
            font-size: 1.8rem; 
            color: #fff; 
            letter-spacing: 1px;
        }

        .panel-content-scroll {
            padding: 20px;
            overflow-y: auto;
            max-height: 75vh;
            display: flex;
            flex-direction: column;
            gap: 15px;
        }

        /* Componentes de Filtro */
        .filter-group { margin-bottom: 5px; }
        
        details.custom-accordion {
            background: rgba(255,255,255,0.03);
            border-radius: 8px;
            border: 1px solid rgba(255,255,255,0.05);
            overflow: hidden;
            transition: all 0.3s ease;
        }
        details.custom-accordion[open] {
            background: rgba(255,255,255,0.05);
            border-color: rgba(255,255,255,0.1);
        }
        summary.accordion-header {
            padding: 12px 15px;
            cursor: pointer;
            font-weight: 700;
            font-size: 0.85rem;
            color: #ccc;
            text-transform: uppercase;
            list-style: none;
            display: flex;
            align-items: center;
            justify-content: space-between;
            user-select: none;
            transition: color 0.2s;
        }
        summary.accordion-header:hover { color: #fff; }
        summary.accordion-header::-webkit-details-marker { display: none; }
        summary.accordion-header::after {
            content: '+'; 
            font-size: 1.1rem; 
            font-weight: 300;
            color: var(--primary-color);
        }
        details[open] summary.accordion-header::after { content: '-'; }
        
        .accordion-body {
            padding: 15px;
            border-top: 1px solid rgba(255,255,255,0.05);
            animation: fadeIn 0.3s ease;
        }

        /* Botões e Chips */
        .chips-container { display: flex; flex-wrap: wrap; gap: 8px; }
        
        .mode-btn { 
            flex: 1; 
            padding: 14px; 
            text-align: center; 
            background: #222; 
            border: 1px solid #444; 
            border-radius: 6px; 
            cursor: pointer; 
            font-size: 0.9rem; 
            font-weight: 800; 
            color: #777; 
            transition: all 0.2s; 
        }
        .mode-btn.active { 
            background: var(--primary-color); 
            color: #fff; 
            border-color: var(--primary-color); 
            box-shadow: 0 0 10px rgba(var(--primary-rgb), 0.3);
            text-shadow: 0 1px 2px rgba(0,0,0,0.5);
        }

        .chip-btn { 
            padding: 8px 16px; 
            font-size: 0.75rem; 
            border-radius: 4px; 
            background: #252525; 
            border: 1px solid #333; 
            color: #aaa; 
            cursor: pointer; 
            transition: 0.2s; 
            flex-grow: 1;
            text-align: center;
        }
        .chip-btn.active { 
            background: rgba(var(--primary-rgb), 0.2); 
            border-color: var(--primary-color); 
            color: #fff; 
            font-weight: 700; 
        }

        .classes-grid {
            display: grid;
            grid-template-columns: repeat(5, 1fr);
            gap: 8px;
        }
        .class-btn { 
            aspect-ratio: 1;
            display: flex; 
            align-items: center; 
            justify-content: center; 
            border-radius: 6px; 
            background: #222; 
            border: 1px solid #444; 
            font-weight: bold; 
            font-size: 1rem;
            cursor: pointer; 
            transition: 0.2s; 
        }
        .class-btn:hover { border-color: #666; }
        .class-btn.active { 
            background: var(--primary-color); 
            color: #fff; 
            border-color: #fff; 
            transform: scale(1.05); 
            box-shadow: 0 2px 8px rgba(0,0,0,0.3);
        }

        .time-control { background: #1a1a1a; padding: 10px; border-radius: 6px; border: 1px solid #333; }
        .time-slider-container { width: 100%; padding: 10px 0; }
        input[type=range] { width: 100%; accent-color: var(--primary-color); cursor: pointer; }

        .reserves-grid {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 8px;
        }
        .reserves-grid .chip-btn { margin: 0; width: 100%; }

        .granular-list { 
            display: flex; flex-direction: column; gap: 4px; 
            max-height: 200px; overflow-y: auto; 
            background: #111; padding: 10px; border-radius: 6px; border: 1px solid #333;
        }
        .granular-item { 
            font-size: 0.8rem; padding: 8px 12px; 
            border-radius: 4px; display: flex; align-items: center; justify-content: space-between; 
            color: #888; background: #1a1a1a; transition: 0.2s;
        }
        .granular-item.selected { 
            color: #eee; 
            background: #2a2a2a; 
            border-left: 3px solid var(--primary-color); 
        }
        .granular-item:hover { background: #333; }

        /* --- WHEEL STAGE --- */
        .wheel-stage { display: flex; flex-direction: column; align-items: center; justify-content: center; position: relative; }
        
        .wheel-wrapper { 
            position: relative; width: 600px; height: 600px; border-radius: 50%; 
            box-shadow: 0 0 100px rgba(0,0,0,0.8); 
            border: 15px solid #1a1a1a; 
            background: #111;
        }
        
        #wheel-canvas { width: 100%; height: 100%; border-radius: 50%; }
        
        .wheel-arrow { 
            position: absolute; top: 50%; right: -35px; 
            width: 0; height: 0; 
            border-top: 20px solid transparent; 
            border-bottom: 20px solid transparent; 
            border-right: 40px solid #fff; 
            transform: translateY(-50%); 
            z-index: 10; 
            filter: drop-shadow(-2px 0 5px rgba(0,0,0,0.5));
        }

        .spin-button { 
            margin-top: 40px; 
            padding: 20px 80px; 
            font-family: 'Bebas Neue', cursive; 
            font-size: 2.2rem; 
            background: var(--primary-color); 
            color: #fff; 
            border: none; 
            border-radius: 8px; 
            cursor: pointer; 
            transition: 0.3s; 
            box-shadow: 0 10px 30px rgba(var(--primary-rgb), 0.2); 
            letter-spacing: 2px;
        }
        .spin-button:hover { transform: translateY(-3px); box-shadow: 0 15px 40px rgba(var(--primary-rgb), 0.4); }
        .spin-button:disabled { background: #333; color: #555; cursor: not-allowed; transform: none; box-shadow: none; }

        /* --- RESULT OVERLAY --- */
        .result-overlay { 
            position: absolute; 
            inset: 0; 
            background: rgba(10, 10, 10, 0.95); 
            display: none; 
            flex-direction: column; 
            align-items: center; 
            justify-content: center; 
            z-index: 100; 
            border-radius: 50%; 
            backdrop-filter: blur(8px);
            padding: 40px; 
        }
        
        .winner-card { 
            width: 100%;
            height: 100%;
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            text-align: center;
        }

        .wc-label {
            color: var(--primary-color);
            font-weight: bold;
            letter-spacing: 3px;
            text-transform: uppercase;
            font-size: 1rem;
            margin-bottom: 10px;
        }
        
        .wc-title { 
            font-family: 'Bebas Neue'; 
            font-size: 3.8rem; 
            color: #fff; 
            margin: 5px 0 15px 0; 
            line-height: 1;
            text-shadow: 0 0 25px rgba(var(--primary-rgb), 0.5); 
        }

        .wc-sub {
            color: #ccc;
            margin-bottom: 30px;
            font-size: 1rem;
            max-width: 80%;
            line-height: 1.4;
        }

        .wc-actions {
            display: flex;
            gap: 15px;
            justify-content: center;
            width: 100%;
        }

        .btn-act { 
            padding: 14px 28px; 
            border-radius: 8px; 
            border: none; 
            font-weight: 800; 
            cursor: pointer; 
            text-transform: uppercase; 
            font-family: 'Montserrat', sans-serif;
            font-size: 0.9rem;
            transition: all 0.2s;
            min-width: 140px;
        }

        .btn-close { 
            background: #333; 
            color: #fff; 
            border: 1px solid #555;
        }
        .btn-close:hover { background: #444; border-color: #777; }

        .btn-next { 
            background: var(--primary-color); 
            color: #fff; 
            box-shadow: 0 4px 15px rgba(0,0,0,0.3);
        }
        .btn-next:hover { transform: translateY(-2px); box-shadow: 0 6px 20px rgba(var(--primary-rgb), 0.4); }

        /* Scrollbar */
        ::-webkit-scrollbar { width: 6px; }
        ::-webkit-scrollbar-track { background: #111; }
        ::-webkit-scrollbar-thumb { background: #444; border-radius: 3px; }
        ::-webkit-scrollbar-thumb:hover { background: #666; }

        @keyframes fadeIn { from { opacity: 0; transform: translateY(-5px); } to { opacity: 1; transform: translateY(0); } }
    `;
    container.appendChild(style);

    // --- HTML ---
    const content = document.createElement('div');
    content.className = 'roulette-container';
    content.innerHTML = `
        <div class="controls-panel">
            <div class="panel-header">
                <div class="panel-title">ROLETA TÁTICA</div>
                <div style="font-size: 0.8rem; color: #666; margin-top: 5px;">Configure os parâmetros da missão</div>
            </div>

            <div class="panel-content-scroll">
                
                <div class="filter-group">
                    <div class="chips-container" id="focus-selector">
                        <div class="mode-btn active" data-focus="animal"><i class="fas fa-paw"></i> ANIMAIS</div>
                        <div class="mode-btn" data-focus="reserve"><i class="fas fa-map"></i> RESERVAS</div>
                    </div>
                </div>

                <div id="animal-filters" style="display:block;">
                    
                    <details class="custom-accordion" open>
                        <summary class="accordion-header"><i class="fas fa-crosshairs"></i> Especificações do Alvo</summary>
                        <div class="accordion-body">
                            
                            <div style="margin-bottom: 15px;">
                                <div style="font-size:0.75rem; color:#888; margin-bottom:8px;">CLASSE DO ANIMAL</div>
                                <div class="classes-grid" id="class-selector">
                                    ${[1,2,3,4,5,6,7,8,9].map(n => `<div class="class-btn" data-class="${n}">${n}</div>`).join('')}
                                </div>
                            </div>

                            <div style="margin-bottom: 15px;">
                                <div style="font-size:0.75rem; color:#888; margin-bottom:8px;">DIFICULDADE</div>
                                <div class="chips-container" id="diff-selector">
                                    <div class="chip-btn active" data-diff="all">Todas</div>
                                    <div class="chip-btn" data-diff="mid">Médio (Até Lv5)</div>
                                    <div class="chip-btn" data-diff="legendary">Predadores (Até Lv9)</div>
                                </div>
                            </div>

                            <div>
                                <div style="font-size:0.75rem; color:#888; margin-bottom:8px;">CATEGORIA ESPECIAL</div>
                                <div class="chips-container" id="mode-selector">
                                    <div class="chip-btn active" data-mode="all">Padrão</div>
                                    <div class="chip-btn" data-mode="greats" style="color:#ffd700; border-color:#ffd700;">Apenas Great Ones</div>
                                </div>
                            </div>
                        </div>
                    </details>

                    <details class="custom-accordion">
                        <summary class="accordion-header"><i class="fas fa-stopwatch"></i> Condições de Caça</summary>
                        <div class="accordion-body">
                            
                            <div class="time-control">
                                <div style="display:flex; justify-content:space-between; margin-bottom:5px;">
                                    <span style="font-size:0.8rem; color:#ccc;">Horário (Zona de Bebida)</span>
                                    <span style="color:var(--primary-color); font-weight:bold;" id="time-val">Todos</span>
                                </div>
                                <div class="time-slider-container">
                                    <input type="range" id="time-slider" min="-1" max="23" value="-1" step="1">
                                </div>
                                <div style="font-size:0.65rem; color:#666; display:flex; justify-content:space-between;">
                                    <span>OFF</span> <span>12:00</span> <span>23:00</span>
                                </div>
                            </div>

                            <div style="margin-top: 15px;">
                                <div style="font-size:0.75rem; color:#888; margin-bottom:8px;">RESTRINGIR HABITAT</div>
                                <div class="reserves-grid" id="reserve-filter-animal-mode">
                                    ${Object.keys(reservesData).map(k => `<div class="chip-btn" data-res="${k}">${reservesData[k].name}</div>`).join('')}
                                </div>
                            </div>

                        </div>
                    </details>
                </div>

                <div id="reserve-filters" style="display:none;">
                    <details class="custom-accordion" open>
                        <summary class="accordion-header"><i class="fas fa-map-marked-alt"></i> Seleção de Mapas</summary>
                        <div class="accordion-body">
                            <div class="reserves-grid" id="reserve-selector">
                                ${Object.keys(reservesData).map(k => `<div class="chip-btn" data-res="${k}">${reservesData[k].name}</div>`).join('')}
                            </div>
                        </div>
                    </details>
                </div>

                <div class="filter-group" style="margin-top:auto;">
                    <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:10px;">
                        <h4 style="margin:0; font-size:0.85rem; color:#fff;"><i class="fas fa-list-ul"></i> Itens na Roleta</h4>
                        <span id="pool-count" style="background:#333; padding:2px 8px; border-radius:10px; font-size:0.75rem;">0</span>
                    </div>
                    <div class="granular-list" id="granular-list"></div>
                </div>

                <div style="margin-top: 15px; padding-top: 15px; border-top: 1px solid #333;">
                    <label style="display:flex; align-items:center; gap:10px; cursor:pointer; color:#aaa; font-size:0.8rem;">
                        <input type="checkbox" id="chk-sequence" checked style="accent-color: var(--primary-color); width:16px; height:16px;"> 
                        <span id="seq-label">Continuar sorteio (Combo)</span>
                    </label>
                </div>

            </div>
        </div>

        <div class="wheel-stage">
            <div class="stage-header" style="text-align:center; margin-bottom:20px;">
                <h2 id="stage-main-text" style="font-family:'Bebas Neue'; font-size:3rem; margin:0; letter-spacing:2px;">SORTEIO: ANIMAL</h2>
                <p id="stage-sub-text" style="color:#666; margin:0;">Aguardando comando...</p>
            </div>
            
            <div class="wheel-wrapper">
                <canvas id="wheel-canvas" width="600" height="600"></canvas>
                <div class="wheel-arrow"></div>
                
                <div class="result-overlay" id="result-overlay">
                    <div class="winner-card">
                        <div class="wc-label">ALVO CONFIRMADO</div>
                        <div class="wc-title" id="res-winner">---</div>
                        <div class="wc-sub" id="res-question">---</div>
                        <div class="wc-actions">
                            <button class="btn-act btn-close" id="btn-close">Encerrar</button>
                            <button class="btn-act btn-next" id="btn-next-step">Sortear Local</button>
                        </div>
                    </div>
                </div>
            </div>

            <button class="spin-button" id="btn-spin">GIRAR SISTEMA</button>
        </div>
    `;
    container.appendChild(content);

    // --- LÓGICA CORE ---
    const canvas = content.querySelector('#wheel-canvas');
    const ctx = canvas.getContext('2d');
    const centerX = canvas.width / 2;
    const centerY = canvas.height / 2;
    const radius = centerX - 20;

    function updatePoolDisplay() {
        let rawList = [];

        if (state.isSecondaryPhase) {
            rawList = [...state.activePool];
        } 
        else {
            if (state.focus === 'animal') {
                let candidates = [...items];

                if (state.selectedReserves.length > 0) {
                    const allowedAnimals = new Set();
                    state.selectedReserves.forEach(resKey => {
                        const res = reservesData[resKey];
                        if(res && res.animals) {
                            // CORREÇÃO: Normaliza os animais da reserva antes de adicionar ao Set
                            res.animals.forEach(animSlug => allowedAnimals.add(toKey(animSlug)));
                        }
                    });
                    // Compara a chave normalizada do item com o Set normalizado
                    candidates = candidates.filter(item => allowedAnimals.has(toKey(item)));
                }

                candidates = candidates.filter(item => {
                    const meta = getAnimalMeta(item);

                    if (state.filterMode === 'greats' && !meta.isGO) return false;
                    if (state.selectedClasses.length > 0) {
                        if (!meta.class || !state.selectedClasses.includes(meta.class)) return false;
                    }
                    if (state.selectedDifficulty !== 'all') {
                        if (state.selectedDifficulty === 'mid' && meta.maxLevelNum > 5) return false;
                        if (state.selectedDifficulty === 'legendary' && meta.maxLevelNum <= 5) return false;
                    }
                    if (state.selectedTime !== null && state.selectedTime !== -1) {
                        if (!meta.drinkZones || meta.drinkZones.length === 0) return false;
                        const hasMatch = meta.drinkZones.some(zoneStr => {
                            if (zoneStr === "O DIA TODO") return true;
                            const ranges = zoneStr.split(', ');
                            return ranges.some(r => {
                                const parts = r.split(' - ');
                                if(parts.length !== 2) return false;
                                const start = parseInt(parts[0].split(':')[0]); 
                                const end = parseInt(parts[1].split(':')[0]);   
                                if (start < end) {
                                    return state.selectedTime >= start && state.selectedTime < end;
                                } else {
                                    return state.selectedTime >= start || state.selectedTime < end;
                                }
                            });
                        });
                        if (!hasMatch) return false;
                    }
                    return true;
                });
                rawList = candidates;
            } else {
                if (state.selectedReserves.length > 0) {
                    rawList = state.selectedReserves.map(k => reservesData[k].name);
                } else {
                    rawList = Object.values(reservesData).map(r => r.name);
                }
            }
            rawList = rawList.filter(i => !state.excludedItems.includes(i));
            state.activePool = rawList;
        }
        renderGranularList();
        drawWheel();
    }

    function renderGranularList() {
        const listContainer = content.querySelector('#granular-list');
        const countSpan = document.getElementById('pool-count');
        listContainer.innerHTML = '';
        countSpan.textContent = state.activePool.length;

        if (state.activePool.length === 0) {
            listContainer.innerHTML = '<div style="padding:10px; color:#666; font-size:0.8rem; text-align:center;">Nenhum alvo compatível.</div>';
            return;
        }

        const createItem = (item, isExcluded) => {
            const el = document.createElement('div');
            el.className = isExcluded ? 'granular-item' : 'granular-item selected';
            if(isExcluded) el.style.opacity = '0.5';
            
            el.innerHTML = `<span>${item}</span> <i class="fas ${isExcluded ? 'fa-plus' : (state.isSecondaryPhase ? 'fa-lock' : 'fa-check')}"></i>`;
            
            if (!state.isSecondaryPhase) {
                el.onclick = () => {
                    if (isExcluded) state.excludedItems = state.excludedItems.filter(i => i !== item);
                    else state.excludedItems.push(item);
                    updatePoolDisplay();
                };
            }
            listContainer.appendChild(el);
        };

        state.activePool.sort().forEach(item => createItem(item, false));

        if (state.excludedItems.length > 0) {
            const divider = document.createElement('div');
            divider.style.borderTop = '1px dashed #333'; divider.style.margin = '5px 0';
            listContainer.appendChild(divider);
            state.excludedItems.forEach(item => createItem(item, true));
        }
    }

    function drawWheel() {
        let visualPool = [...state.activePool];
        if (visualPool.length > 50) visualPool = visualPool.slice(0, 50);
        if (visualPool.length === 0) visualPool = ['SEM DADOS'];

        const len = visualPool.length;
        const sliceAngle = (2 * Math.PI) / len;

        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.save();
        ctx.translate(centerX, centerY);
        ctx.rotate(state.rotation);

        visualPool.forEach((text, i) => {
            const angle = i * sliceAngle;
            ctx.beginPath();
            ctx.moveTo(0, 0);
            ctx.arc(0, 0, radius, angle, angle + sliceAngle);
            ctx.fillStyle = PALETTE[i % PALETTE.length]; 
            ctx.fill();
            ctx.strokeStyle = "#1a1a1a"; 
            ctx.lineWidth = 2;
            ctx.stroke();

            const theta = state.rotation + angle + sliceAngle / 2;
            const normalizedTheta = (theta % (2 * Math.PI) + 2 * Math.PI) % (2 * Math.PI);

            ctx.save();
            ctx.rotate(angle + sliceAngle / 2);
            ctx.fillStyle = "#fff"; 
            ctx.font = "bold 14px Montserrat";
            ctx.shadowColor = "rgba(0,0,0,1)";
            ctx.shadowBlur = 3;

            let display = text.length > 22 ? text.substring(0, 20) + '..' : text;
            if (normalizedTheta > Math.PI / 2 && normalizedTheta < 3 * Math.PI / 2) {
                ctx.rotate(Math.PI); ctx.textAlign = "left"; ctx.fillText(display.toUpperCase(), -radius + 25, 5);
            } else {
                ctx.textAlign = "right"; ctx.fillText(display.toUpperCase(), radius - 25, 5);
            }
            ctx.restore();
        });
        ctx.restore();
        
        ctx.beginPath(); ctx.arc(centerX, centerY, 45, 0, 2 * Math.PI);
        ctx.fillStyle = '#111'; ctx.fill(); 
        ctx.lineWidth = 4; ctx.strokeStyle = '#444'; ctx.stroke();
        
        ctx.beginPath(); ctx.arc(centerX, centerY, 10, 0, 2 * Math.PI);
        ctx.fillStyle = 'var(--primary-color)'; ctx.fill();
    }

    function spin() {
        if (state.isSpinning || state.activePool.length === 0) return;
        state.isSpinning = true;
        content.querySelector('#btn-spin').disabled = true;
        state.velocity = Math.random() * 0.25 + 0.35; 
        const friction = 0.988; 

        function animate() {
            if (!state.isSpinning) return;
            state.rotation += state.velocity;
            state.velocity *= friction;
            drawWheel();
            if (state.velocity < 0.0015) {
                state.isSpinning = false;
                determineWinner();
            } else { requestAnimationFrame(animate); }
        }
        requestAnimationFrame(animate);
    }

    function determineWinner() {
        let visualPool = [...state.activePool];
        if (visualPool.length > 50) visualPool = visualPool.slice(0, 50);
        if (visualPool.length === 0) visualPool = ['ERRO'];

        const len = visualPool.length;
        const sliceAngle = (2 * Math.PI) / len;
        const currentRot = state.rotation % (2 * Math.PI);
        const index = Math.floor(((2 * Math.PI) - currentRot) / sliceAngle) % len;
        state.winner = visualPool[index];
        showResult();
    }

    function showResult() {
        const overlay = content.querySelector('#result-overlay');
        const title = content.querySelector('#res-winner');
        const question = content.querySelector('#res-question');
        const btnNext = content.querySelector('#btn-next-step');
        
        title.textContent = state.winner;
        overlay.style.display = 'flex';
        const isSequenciaActive = content.querySelector('#chk-sequence').checked;

        if (!state.isSecondaryPhase && isSequenciaActive) {
            btnNext.style.display = 'block';
            if (state.focus === 'animal') {
                question.textContent = `Deseja sortear onde caçar o ${state.winner}?`;
                btnNext.textContent = "Sortear Reserva";
                btnNext.onclick = setupReserveSpin;
            } else {
                question.textContent = `Deseja sortear o que caçar em ${state.winner}?`;
                btnNext.textContent = "Sortear Animal";
                btnNext.onclick = setupAnimalSpin;
            }
        } else {
            question.textContent = "Caçada Definida. Boa sorte!";
            btnNext.style.display = 'none';
        }
        content.querySelector('#btn-spin').disabled = false;
    }

    function setupReserveSpin() {
        content.querySelector('#result-overlay').style.display = 'none';
        state.isSecondaryPhase = true;
        
        // CORREÇÃO: Normaliza o nome do vencedor antes de buscar nas reservas
        const winnerClean = toKey(state.winner);
        let validReserves = [];

        for(const resKey in reservesData) {
            // CORREÇÃO: Normaliza a lista de animais de cada reserva para garantir match
            const reserveAnimalsNormalized = reservesData[resKey].animals.map(a => toKey(a));
            
            if (reserveAnimalsNormalized.includes(winnerClean)) {
                validReserves.push(reservesData[resKey].name);
            }
        }
        
        if (validReserves.length === 0) validReserves = ['Sem Habitat Conhecido'];

        if (validReserves.length === 1) {
            const uniqueReserve = validReserves[0];
            state.winner = uniqueReserve;
            const overlay = content.querySelector('#result-overlay');
            content.querySelector('#res-winner').textContent = uniqueReserve;
            content.querySelector('#res-question').innerHTML = `<i class="fas fa-info-circle"></i> Habitat único detectado.`;
            content.querySelector('#btn-next-step').style.display = 'none';
            overlay.style.display = 'flex';
            return; 
        }
        state.activePool = validReserves;
        document.getElementById('stage-main-text').textContent = "SORTEIO DE LOCAL";
        document.getElementById('stage-sub-text').textContent = `Habitat do ${state.winner}`;
        updatePoolDisplay(); 
    }

    function setupAnimalSpin() {
        content.querySelector('#result-overlay').style.display = 'none';
        state.isSecondaryPhase = true;
        const reserveName = state.winner;
        const resKey = Object.keys(reservesData).find(k => reservesData[k].name === reserveName);
        
        // CORREÇÃO: Normaliza os slugs da reserva para comparação
        const animalSlugs = (reservesData[resKey]?.animals || []).map(a => toKey(a));
        
        // Compara item normalizado com lista normalizada
        let validAnimals = items.filter(i => animalSlugs.includes(toKey(i)));
        
        if(validAnimals.length === 0) validAnimals = ['Sem dados'];

        state.activePool = validAnimals;
        document.getElementById('stage-main-text').textContent = "SORTEIO DE FAUNA";
        document.getElementById('stage-sub-text').textContent = `Região: ${reserveName}`;
        updatePoolDisplay();
    }

    // --- EVENT LISTENERS ---

    content.querySelectorAll('#focus-selector .mode-btn').forEach(btn => {
        btn.onclick = () => {
            state.isSecondaryPhase = false; state.excludedItems = []; state.rotation = 0;
            content.querySelectorAll('#focus-selector .mode-btn').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            state.focus = btn.dataset.focus;
            state.selectedReserves = []; state.selectedClasses = [];
            
            const isAnimal = state.focus === 'animal';
            document.getElementById('animal-filters').style.display = isAnimal ? 'block' : 'none';
            document.getElementById('reserve-filters').style.display = isAnimal ? 'none' : 'block';
            document.getElementById('seq-label').textContent = isAnimal ? 'Continuar sorteio (Combo)' : 'Sortear Animal após Reserva';
            document.getElementById('stage-main-text').textContent = isAnimal ? 'SORTEIO: ANIMAL' : 'SORTEIO: RESERVA';
            
            content.querySelectorAll('.chip-btn, .class-btn').forEach(b => b.classList.remove('active'));
            content.querySelector('[data-mode="all"]').classList.add('active');
            content.querySelector('[data-diff="all"]').classList.add('active');
            updatePoolDisplay();
        };
    });

    content.querySelectorAll('#mode-selector .chip-btn').forEach(btn => {
        btn.onclick = () => {
            content.querySelectorAll('#mode-selector .chip-btn').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            state.filterMode = btn.dataset.mode;
            updatePoolDisplay();
        };
    });

    content.querySelectorAll('#class-selector .class-btn').forEach(btn => {
        btn.onclick = () => {
            btn.classList.toggle('active');
            const cls = parseInt(btn.dataset.class);
            if (state.selectedClasses.includes(cls)) state.selectedClasses = state.selectedClasses.filter(c => c !== cls);
            else state.selectedClasses.push(cls);
            updatePoolDisplay();
        };
    });

    content.querySelectorAll('#diff-selector .chip-btn').forEach(btn => {
        btn.onclick = () => {
            content.querySelectorAll('#diff-selector .chip-btn').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            state.selectedDifficulty = btn.dataset.diff;
            updatePoolDisplay();
        };
    });

    const timeSlider = content.querySelector('#time-slider');
    timeSlider.oninput = (e) => {
        const val = parseInt(e.target.value);
        state.selectedTime = val === -1 ? null : val;
        document.getElementById('time-val').textContent = val === -1 ? 'Todos' : `${val}:00`;
        updatePoolDisplay();
    };

    const reserveListener = (btn) => {
        btn.classList.toggle('active');
        const res = btn.dataset.res;
        if (state.selectedReserves.includes(res)) state.selectedReserves = state.selectedReserves.filter(r => r !== res);
        else state.selectedReserves.push(res);
        updatePoolDisplay();
    };
    content.querySelectorAll('#reserve-filter-animal-mode .chip-btn').forEach(btn => btn.onclick = () => reserveListener(btn));
    content.querySelectorAll('#reserve-selector .chip-btn').forEach(btn => btn.onclick = () => reserveListener(btn));

    content.querySelector('#btn-spin').onclick = spin;
    
    content.querySelector('#btn-close').onclick = () => {
        content.querySelector('#result-overlay').style.display = 'none';
        if (state.isSecondaryPhase) {
            state.isSecondaryPhase = false; state.excludedItems = []; state.rotation = 0;
            const isAnimal = state.focus === 'animal';
            document.getElementById('stage-main-text').textContent = isAnimal ? 'SORTEIO: ANIMAL' : 'SORTEIO: RESERVA';
            updatePoolDisplay();
        }
    };

    updatePoolDisplay();
}