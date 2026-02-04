import { slugify, createSafeImgTag } from '../utils.js';
import { items, reservesData, animalHotspotData } from '../../data/gameData.js';
import { savedData, saveData } from '../main.js'; // Por enquanto importamos do main, depois moveremos o estado

// =================================================================
// =========== HALL DA FAMA (V13 FINAL): COMPLETO & OTIMIZADO ======
// =================================================================

// --- 1. FUNÇÕES AUXILIARES BÁSICAS ---
function getSpeciesMaxScore(animalSlug) {
    for (const reserveKey in animalHotspotData) {
        if (animalHotspotData[reserveKey][animalSlug]) {
            return parseFloat(animalHotspotData[reserveKey][animalSlug].maxScore) || 1000;
        }
    }
    return 1000; 
}

function calculateHunterScore(data) {
    let score = 0;
    const POINTS = { RARE: 5, DIAMOND: 15, GREAT: 100, SUPER: 50 };
    if (data.pelagens) Object.values(data.pelagens).forEach(obj => score += Object.values(obj).filter(Boolean).length * POINTS.RARE);
    if (data.diamantes) Object.values(data.diamantes).forEach(list => score += list.length * POINTS.DIAMOND);
    if (data.greats) Object.values(data.greats).forEach(go => { if(go.furs) Object.values(go.furs).forEach(f => { if(f.trophies) score += f.trophies.length * POINTS.GREAT; })});
    if (data.super_raros) Object.values(data.super_raros).forEach(obj => score += Object.values(obj).filter(Boolean).length * POINTS.SUPER);
    return score;
}

// --- 2. CONFIGURAÇÃO DE RANKS E DIFICULDADE ---
const RANK_LEVELS = [
    { min: 0, title: "Novato", icon: "fa-shoe-prints", color: "#99aab5" },
    { min: 100, title: "Rastreador", icon: "fa-compass", color: "#CD7F32" },
    { min: 500, title: "Caçador Pro", icon: "fa-crosshairs", color: "#C0C0C0" },
    { min: 1500, title: "Mestre da Caça", icon: "fa-crown", color: "#FFD700" },
    { min: 3000, title: "Lenda Viva", icon: "fa-dragon", color: "#E040FB" },
    { min: 6000, title: "Predador Apex", icon: "fa-skull", color: "#FF5252" }
];

function getHunterRankInfo(score) {
    let currentRank = RANK_LEVELS[0];
    let nextRank = null;
    for (let i = 0; i < RANK_LEVELS.length; i++) {
        if (score >= RANK_LEVELS[i].min) {
            currentRank = RANK_LEVELS[i];
            nextRank = RANK_LEVELS[i + 1] || null;
        }
    }
    return { current: currentRank, next: nextRank };
}

function getGrindDifficulty(kills) {
    if (!kills || kills === 0) return { label: "INDEFINIDO", class: "manual" };
    if (kills < 500) return { label: "MILAGRE", class: "miracle" };
    if (kills < 1500) return { label: "SORTE RÁPIDA", class: "standard" };
    if (kills < 3000) return { label: "PADRÃO", class: "standard" };
    return { label: "PESADELO", class: "nightmare" };
}

function calculateGrindRank(kills, diamonds, go) {
    if (go > 0) return 'S'; 
    if (kills < 50) return 'C'; 
    const ratio = (diamonds / kills) * 100;
    if (ratio > 1.5) return 'S';
    if (ratio > 1.0) return 'A';
    if (ratio > 0.5) return 'B';
    return 'C';
}

// --- 3. PROCESSADOR UNIFICADO DE GREAT ONES (Manual + Automático) ---
function getAllGreatOnesUnified(savedData) {
    let unifiedList = [];
    const grindMap = new Map();

    // 1. Mapeia Grinds Automáticos
    if (savedData.grindSessions) {
        savedData.grindSessions.forEach(session => {
            if (session.counts?.great_ones?.length > 0) {
                session.counts.great_ones.forEach(go => {
                    const key = `${session.animalSlug}_${go.id}`;
                    grindMap.set(key, {
                        kills: session.counts.total,
                        diamonds: session.counts.diamonds?.length || 0,
                        rares: session.counts.rares?.length || 0,
                        supers: session.counts.super_raros?.length || 0,
                        reserve: reservesData[session.reserveKey]?.name || 'Desconhecida',
                        date: go.id
                    });
                });
            }
        });
    }

    // 2. Varre Álbum Principal e Mescla Dados
    if (savedData.greats) {
        Object.entries(savedData.greats).forEach(([slug, goData]) => {
            const animalName = items.find(i => slugify(i) === slug) || slug;
            if (goData.furs) {
                Object.entries(goData.furs).forEach(([furName, furData]) => {
                    if (furData.trophies && furData.trophies.length > 0) {
                        furData.trophies.forEach(trophy => {
                            const key = `${slug}_${trophy.id}`;
                            const grindInfo = grindMap.get(key);
                            const dateObj = new Date(trophy.id || Date.now());
                            
                            // Lógica de Prioridade: Grind > Manual > Zero
                            const manualStats = trophy.stats || {};
                            
                            const finalKills = grindInfo ? grindInfo.kills : (parseInt(manualStats.kills) || 0);
                            const finalDia = grindInfo ? grindInfo.diamonds : (parseInt(manualStats.diamonds) || 0);
                            const finalRare = grindInfo ? grindInfo.rares : (parseInt(manualStats.rares) || 0);
                            const finalSuper = grindInfo ? grindInfo.supers : (parseInt(manualStats.trolls) || 0);

                            unifiedList.push({
                                animalName: animalName,
                                animalSlug: slug,
                                fur: furName,
                                date: dateObj.toLocaleDateString('pt-BR'),
                                timestamp: trophy.id,
                                source: grindInfo ? 'grind' : 'manual',
                                reserveName: grindInfo ? grindInfo.reserve : 'Desconhecida',
                                
                                // Dados Unificados
                                kills: finalKills,
                                diamondsFound: finalDia,
                                raresFound: finalRare,
                                supersFound: finalSuper,
                                
                                difficulty: getGrindDifficulty(finalKills)
                            });
                        });
                    }
                });
            }
        });
    }
    return unifiedList.sort((a, b) => b.timestamp - a.timestamp);
}

// --- 4. ANALISADOR DE GRINDS (ESTATÍSTICAS GERAIS) ---
function analyzeGrindData(sessions) {
    let stats = {
        mostKills: { count: 0, animal: '---' },
        mostDiamonds: { count: 0, animal: '---' },
        mostRares: { count: 0, animal: '---' },
        bestRate: { val: 0, animal: '---' },
        totalGrindKills: 0,
        allSessions: []
    };

    if (sessions) {
        sessions.forEach(s => {
            const animalName = items.find(i => slugify(i) === s.animalSlug) || s.animalSlug;
            const kills = s.counts?.total || 0;
            const dias = s.counts?.diamonds?.length || 0;
            const rares = s.counts?.rares?.length || 0;
            const gos = s.counts?.great_ones?.length || 0;
            const lastActivity = s.id ? new Date(s.id).toLocaleDateString('pt-BR') : '-';
            
            stats.totalGrindKills += kills;
            
            stats.allSessions.push({
                animalName,
                animalSlug: s.animalSlug,
                reserveName: reservesData[s.reserveKey]?.name,
                kills, dias, rares, gos,
                rank: calculateGrindRank(kills, dias, gos),
                date: lastActivity,
                timestamp: s.id // Para ordenação
            });

            if (kills > stats.mostKills.count) stats.mostKills = { count: kills, animal: animalName };
            if (dias > stats.mostDiamonds.count) stats.mostDiamonds = { count: dias, animal: animalName };
            if (rares > stats.mostRares.count) stats.mostRares = { count: rares, animal: animalName };
            if (kills > 50) {
                const rate = (dias / kills) * 100;
                if (rate > stats.bestRate.val) stats.bestRate = { val: rate, animal: animalName };
            }
        });
        stats.allSessions.sort((a, b) => b.kills - a.kills);
    }
    return stats;
}

// --- 5. GERADOR DE CONQUISTAS (LISTA COMPLETA 60+) ---
function generateAchievements(data, score, masterTrophyList, grindStats) {
    const totalDiamonds = masterTrophyList.filter(t => t.category === 'diamante').length;
    const totalGreats = masterTrophyList.filter(t => t.category === 'greats').length;
    const totalSuperRares = masterTrophyList.filter(t => t.category === 'super_raros').length;
    const totalRares = Object.values(data.pelagens || {}).reduce((acc, obj) => acc + Object.values(obj).filter(Boolean).length, 0);
    const uniqueSpecies = new Set(masterTrophyList.map(t => t.slug)).size;
    const uniqueReserves = new Set(data.grindSessions?.map(s => s.reserveKey)).size;

    return [
        // --- BRONZE (Iniciante) ---
        { tier: 'bronze', name: "Primeiro Passo", desc: "Faça seu primeiro login.", check: score > 0, icon: "fa-shoe-prints" },
        { tier: 'bronze', name: "Primeira Baixa", desc: "Registre 1 abate no Grind.", check: grindStats.totalGrindKills >= 1, icon: "fa-crosshairs" },
        { tier: 'bronze', name: "Sorte de Principiante", desc: "Colete 1 Diamante.", check: totalDiamonds >= 1, icon: "fa-gem" },
        { tier: 'bronze', name: "Diferentão", desc: "Colete 1 Pelagem Rara.", check: totalRares >= 1, icon: "fa-paw" },
        { tier: 'bronze', name: "Turista", desc: "Grinds em 2 reservas.", check: uniqueReserves >= 2, icon: "fa-map" },
        { tier: 'bronze', name: "Aquecimento", desc: "50 abates totais.", check: grindStats.totalGrindKills >= 50, icon: "fa-fire" },
        { tier: 'bronze', name: "Observador", desc: "5 Diamantes coletados.", check: totalDiamonds >= 5, icon: "fa-binoculars" },
        { tier: 'bronze', name: "Pequeno Colecionador", desc: "5 Pelagens Raras.", check: totalRares >= 5, icon: "fa-box-open" },
        { tier: 'bronze', name: "Variedade", desc: "Troféus de 3 espécies diferentes.", check: uniqueSpecies >= 3, icon: "fa-layer-group" },
        { tier: 'bronze', name: "Pontuador", desc: "100 Pontos de Rank.", check: score >= 100, icon: "fa-star-half-alt" },
        { tier: 'bronze', name: "Pé Quente", desc: "Grind com mais de 50 abates.", check: grindStats.mostKills.count >= 50, icon: "fa-walking" },
        { tier: 'bronze', name: "Fotógrafo", desc: "Tenha um Great One (qualquer fonte).", check: totalGreats >= 1, icon: "fa-camera" },

        // --- PRATA (Amador) ---
        { tier: 'silver', name: "Caçador Dedicado", desc: "500 abates totais.", check: grindStats.totalGrindKills >= 500, icon: "fa-skull" },
        { tier: 'silver', name: "Caçador de Joias", desc: "10 Diamantes.", check: totalDiamonds >= 10, icon: "fa-gem" },
        { tier: 'silver', name: "Exótico", desc: "10 Pelagens Raras.", check: totalRares >= 10, icon: "fa-palette" },
        { tier: 'silver', name: "Viajante", desc: "Grinds em 5 reservas.", check: uniqueReserves >= 5, icon: "fa-globe-americas" },
        { tier: 'silver', name: "Veterano", desc: "500 Pontos de Rank.", check: score >= 500, icon: "fa-medal" },
        { tier: 'silver', name: "Foco Total", desc: "Grind com 200+ abates.", check: grindStats.mostKills.count >= 200, icon: "fa-bullseye" },
        { tier: 'silver', name: "Multitarefa", desc: "5 Grinds ativos simultaneamente.", check: (data.grindSessions?.length || 0) >= 5, icon: "fa-tasks" },
        { tier: 'silver', name: "Rastreador", desc: "Diamantes de 5 espécies.", check: uniqueSpecies >= 5, icon: "fa-search" },
        { tier: 'silver', name: "Sortudo", desc: "2 Diamantes em um único Grind.", check: grindStats.mostDiamonds.count >= 2, icon: "fa-clover" },
        { tier: 'silver', name: "Rei dos Cervos", desc: "Diamante de qualquer Veado.", check: masterTrophyList.some(t => t.slug.includes('veado') && t.category === 'diamante'), icon: "fa-leaf" },
        { tier: 'silver', name: "Perigo Real", desc: "Diamante de Leão, Urso ou Lobo.", check: masterTrophyList.some(t => ['leão','urso','lobo'].some(k => t.slug.includes(k)) && t.category === 'diamante'), icon: "fa-teeth" },
        { tier: 'silver', name: "Atirador de Elite", desc: "Obtenha um Grind Rank A.", check: grindStats.allSessions.some(s => s.rank === 'A' || s.rank === 'S'), icon: "fa-crosshairs" },

        // --- OURO (Profissional) ---
        { tier: 'gold', name: "Exterminador", desc: "2.000 abates totais.", check: grindStats.totalGrindKills >= 2000, icon: "fa-skull-crossbones" },
        { tier: 'gold', name: "Magnata", desc: "50 Diamantes.", check: totalDiamonds >= 50, icon: "fa-gem" },
        { tier: 'gold', name: "Zoólogo", desc: "30 Pelagens Raras.", check: totalRares >= 30, icon: "fa-book" },
        { tier: 'gold', name: "Matador de Lendas", desc: "Abata um Great One.", check: totalGreats >= 1, icon: "fa-dragon" },
        { tier: 'gold', name: "Mestre da Caça", desc: "1.500 Pontos de Rank.", check: score >= 1500, icon: "fa-crown" },
        { tier: 'gold', name: "Maratona", desc: "Grind com 1.000+ abates.", check: grindStats.mostKills.count >= 1000, icon: "fa-running" },
        { tier: 'gold', name: "Chuva de Pedras", desc: "5 Diamantes em um único grind.", check: grindStats.mostDiamonds.count >= 5, icon: "fa-meteor" },
        { tier: 'gold', name: "Fantasma Branco", desc: "Colete um Albino.", check: JSON.stringify(data.pelagens).toLowerCase().includes('albino'), icon: "fa-ghost" },
        { tier: 'gold', name: "Sombra da Noite", desc: "Colete um Melânico.", check: JSON.stringify(data.pelagens).toLowerCase().includes('melânico'), icon: "fa-moon" },
        { tier: 'gold', name: "Mundial", desc: "Diamantes de 30 espécies.", check: uniqueSpecies >= 30, icon: "fa-atlas" },
        { tier: 'gold', name: "Eficiência Pura", desc: "Obtenha um Grind Rank S.", check: grindStats.allSessions.some(s => s.rank === 'S'), icon: "fa-certificate" },
        { tier: 'gold', name: "O Colecionador", desc: "100 Troféus (Geral).", check: masterTrophyList.length >= 100, icon: "fa-th" },

        // --- PLATINA (Elite) ---
        { tier: 'platinum', name: "Genocídio", desc: "5.000 abates totais.", check: grindStats.totalGrindKills >= 5000, icon: "fa-biohazard" },
        { tier: 'platinum', name: "Museu Vivo", desc: "100 Diamantes.", check: totalDiamonds >= 100, icon: "fa-university" },
        { tier: 'platinum', name: "Trindade", desc: "3 Great Ones.", check: totalGreats >= 3, icon: "fa-chess-king" },
        { tier: 'platinum', name: "Super Sorte", desc: "Colete 1 Super Raro.", check: totalSuperRares >= 1, icon: "fa-star" },
        { tier: 'platinum', name: "Lenda Viva", desc: "3.000 Pontos de Rank.", check: score >= 3000, icon: "fa-sun" },
        { tier: 'platinum', name: "Ímã de Raros", desc: "5 Raros em um único grind.", check: grindStats.mostRares.count >= 5, icon: "fa-magnet" },
        { tier: 'platinum', name: "Enciclopédia", desc: "Diamantes de 40 espécies.", check: uniqueSpecies >= 40, icon: "fa-book-open" },
        { tier: 'platinum', name: "Perfeccionista", desc: "Taxa de Diamante > 2% (min 100 kills).", check: grindStats.bestRate.val > 2 && grindStats.mostKills.count > 100, icon: "fa-check-double" },
        { tier: 'platinum', name: "Veterano de Guerra", desc: "Grind com 2.000+ abates.", check: grindStats.mostKills.count >= 2000, icon: "fa-shield-alt" },
        { tier: 'platinum', name: "Dominador", desc: "Rank S em 3 grinds diferentes.", check: grindStats.allSessions.filter(s => s.rank === 'S').length >= 3, icon: "fa-trophy" },
        { tier: 'platinum', name: "Rei da Savana", desc: "Diamante de Leão, Búfalo e Gnu.", check: masterTrophyList.filter(t => ['leão', 'búfalo', 'gnu'].some(k => t.slug.includes(k))).length >= 3, icon: "fa-paw" },
        { tier: 'platinum', name: "Rei do Norte", desc: "Diamante de Urso e Alce.", check: masterTrophyList.filter(t => ['urso', 'alce'].some(k => t.slug.includes(k))).length >= 2, icon: "fa-snowflake" },

        // --- OBSIDIANA (Impossível) ---
        { tier: 'obsidian', name: "A Morte em Pessoa", desc: "10.000 abates totais.", check: grindStats.totalGrindKills >= 10000, icon: "fa-scythe" },
        { tier: 'obsidian', name: "Sala do Tesouro", desc: "300 Diamantes.", check: totalDiamonds >= 300, icon: "fa-dungeon" },
        { tier: 'obsidian', name: "Panteão", desc: "10 Great Ones.", check: totalGreats >= 10, icon: "fa-place-of-worship" },
        { tier: 'obsidian', name: "Um em um Milhão", desc: "3 Super Raros.", check: totalSuperRares >= 3, icon: "fa-dice-d20" },
        { tier: 'obsidian', name: "Predador Apex", desc: "Rank Máximo (6.000 pts).", check: score >= 6000, icon: "fa-khanda" },
        { tier: 'obsidian', name: "Arca de Noé", desc: "Diamantes de 50 espécies.", check: uniqueSpecies >= 50, icon: "fa-ship" },
        { tier: 'obsidian', name: "Ceifeiro", desc: "5.000 abates em um único grind.", check: grindStats.mostKills.count >= 5000, icon: "fa-hourglass-end" },
        { tier: 'obsidian', name: "Deus da Guerra", desc: "5 Great Ones diferentes.", check: (new Set(masterTrophyList.filter(t => t.category === 'greats').map(t => t.slug))).size >= 5, icon: "fa-fist-raised" },
        { tier: 'obsidian', name: "Lenda Dourada", desc: "10 Grinds Rank S.", check: grindStats.allSessions.filter(s => s.rank === 'S').length >= 10, icon: "fa-award" },
        { tier: 'obsidian', name: "Mito", desc: "Great One + Super Raro + 500 Diamantes.", check: totalGreats > 0 && totalSuperRares > 0 && totalDiamonds >= 500, icon: "fa-infinity" }
    ];
}

// --- 6. RENDERIZAÇÃO PRINCIPAL (INTEGRAÇÃO TOTAL) ---
export function renderHuntingRankingView(container) {
    container.innerHTML = '';
    const wrapper = document.createElement('div');
    wrapper.className = 'hall-of-fame-container';
    wrapper.style.animation = "fadeIn 0.5s ease";

    const score = calculateHunterScore(savedData);
    const { current, next } = getHunterRankInfo(score);
    const grindStats = analyzeGrindData(savedData.grindSessions);
    const allGOs = getAllGreatOnesUnified(savedData);

    let masterTrophyList = [];
    if (savedData.diamantes) Object.entries(savedData.diamantes).forEach(([s, l]) => l.forEach(t => masterTrophyList.push({ ...t, slug: s, category: 'diamante', badgeText: 'Diamante', score: t.score || 0 })));
    if (savedData.greats) Object.entries(savedData.greats).forEach(([s, g]) => { if(g.furs) Object.values(g.furs).forEach(f => { if(f.trophies) f.trophies.forEach(t => masterTrophyList.push({ ...t, slug: s, category: 'greats', badgeText: 'Great One', score: 10000 })) })});
    if (savedData.super_raros) Object.entries(savedData.super_raros).forEach(([s, f]) => { Object.values(f).forEach(h => { if(h) masterTrophyList.push({ slug: s, category: 'super_raros', badgeText: 'Super Raro', score: 5000 }) }) });

    // 1. BANNER LICENÇA (3D)
    let progressPerc = 100; let xpText = "MAX";
    if (next) { const range = next.min - current.min; const gained = score - current.min; progressPerc = Math.min(100, Math.max(0, (gained / range) * 100)); xpText = `${score} / ${next.min}`; }
    const licenseCard = document.createElement('div');
    licenseCard.className = 'hunter-license-card';
    licenseCard.innerHTML = `<div class="license-strip"></div><div class="license-content"><i class="fas fa-paw license-watermark"></i><div class="license-identity"><div class="license-rank-icon-box" style="border-color: ${current.color}; box-shadow: 0 0 15px ${current.color};"><i class="fas ${current.icon}" style="color: ${current.color};"></i></div><div class="license-text"><h2>${current.title}</h2><p>LICENÇA DE CAÇA OFICIAL</p></div></div><div class="license-stats-row"><div class="license-stat"><span class="ls-label">Pontuação</span><span class="ls-value">${score}</span></div><div class="license-stat"><span class="ls-label">Great Ones</span><span class="ls-value">${allGOs.length}</span></div><div class="license-stat" style="flex-grow: 2;"><span class="ls-label">Próximo Rank</span><div class="license-xp-bar"><div class="license-xp-fill" style="width: ${progressPerc}%; background-color: ${current.color};"></div></div><div style="text-align: right; font-size: 0.8rem; color: #aaa;">${xpText}</div></div></div></div>`;
    licenseCard.addEventListener('mousemove', (e) => { const rect = licenseCard.getBoundingClientRect(); const x = e.clientX - rect.left; const y = e.clientY - rect.top; licenseCard.style.setProperty('--mouse-x', `${(x / rect.width) * 100}%`); licenseCard.style.setProperty('--mouse-y', `${(y / rect.height) * 100}%`); licenseCard.style.transform = `perspective(1000px) scale(1.02) rotateX(${((y - rect.height/2)/rect.height)*-10}deg) rotateY(${((x - rect.width/2)/rect.width)*10}deg)`; });
    licenseCard.addEventListener('mouseleave', () => { licenseCard.style.transform = `perspective(1000px) scale(1) rotateX(0) rotateY(0)`; });
    wrapper.appendChild(licenseCard);

    // 2. ARQUIVOS DA LENDA (INTELIGÊNCIA + GRID EXPANSÍVEL)
    if (allGOs.length > 0) {
        const legacySection = document.createElement('div');
        legacySection.className = 'go-legacy-container';
        
        // Cálculos de Inteligência (Ignora kills = 0 para recorde de velocidade real)
        const validGOs = allGOs.filter(g => g.kills > 0);
        let fastest = validGOs.length > 0 ? validGOs.sort((a,b) => a.kills - b.kills)[0] : {kills:0, animalName: '-'};
        let longest = validGOs.length > 0 ? validGOs.sort((a,b) => b.kills - a.kills)[0] : {kills:0, animalName: '-'};
        let avgKills = validGOs.length > 0 ? Math.round(validGOs.reduce((a,b)=>a+b.kills,0) / validGOs.length) : 0;

        legacySection.innerHTML = `
            <div class="go-legacy-header"><h3><i class="fas fa-dragon"></i> Arquivos da Lenda</h3><span style="color:#aaa; font-size:0.9rem;">${allGOs.length} Capturados</span></div>
            <div style="padding: 20px;">
                <div class="go-intelligence-bar">
                    <div class="go-intel-item"><div class="go-intel-icon icon-fast"><i class="fas fa-bolt"></i></div><div class="go-intel-text"><span class="go-intel-label">Recorde Rápido</span><span class="go-intel-value">${fastest.kills} <small>Kills</small></span><span class="go-intel-sub">${fastest.animalName}</span></div></div>
                    <div class="go-intel-item"><div class="go-intel-icon icon-slow"><i class="fas fa-hourglass-half"></i></div><div class="go-intel-text"><span class="go-intel-label">Mais Longo</span><span class="go-intel-value">${longest.kills} <small>Kills</small></span><span class="go-intel-sub">${longest.animalName}</span></div></div>
                    <div class="go-intel-item"><div class="go-intel-icon icon-avg"><i class="fas fa-chart-bar"></i></div><div class="go-intel-text"><span class="go-intel-label">Média Global</span><span class="go-intel-value">${avgKills} <small>Kills</small></span><span class="go-intel-sub">Por Great One</span></div></div>
                </div>
            </div>`;

        const dossierList = document.createElement('div');
        dossierList.className = 'go-dossier-list';

        allGOs.forEach((go, index) => {
            const imgPath = `animais/pelagens/great_${slugify(go.animalSlug)}_${slugify(go.fur)}.png`;
            const placeholder = `animais/${slugify(go.animalSlug)}.png`;
            const imgTag = createSafeImgTag(imgPath, placeholder, placeholder, go.animalName, 'go-dossier-img');
            const sourceLabel = go.source === 'grind' ? '<span class="go-source-badge source-grind">AUTO</span>' : '<span class="go-source-badge source-manual">MANUAL</span>';
            
            // Dados (mostra --- se for 0)
            const displayKills = go.kills > 0 ? go.kills : "---";
            const displayDia = go.diamondsFound > 0 ? go.diamondsFound : "---";
            
            // Oculta itens acima de 4 inicialmente
            const hiddenClass = index >= 4 ? 'go-card-hidden' : '';

            dossierList.innerHTML += `
                <div class="go-dossier-card ${hiddenClass}">
                    <div class="go-dossier-stripe difficulty-${go.difficulty.class}"></div>
                    <div class="go-dossier-visual">${imgTag}<div class="go-dossier-fur-badge">${go.fur}</div></div>
                    <div class="go-dossier-info">
                        <div class="go-dossier-header">
                            <div class="go-title-group"><div style="display:flex; align-items:center;"><h4>${go.animalName}</h4>${sourceLabel}</div><div class="go-reserve-tag"><i class="fas fa-map-marker-alt"></i> ${go.reserveName}</div></div>
                        </div>
                        <div class="go-stats-grid">
                            <div class="go-stat-box" title="Abates"><span>Abates</span><strong class="val-kills">${displayKills}</strong></div>
                            <div class="go-stat-box" title="Diamantes"><span>Diamantes</span><strong class="val-dia">${displayDia}</strong></div>
                            <div class="go-stat-box" title="Raros"><span>Raros</span><strong class="val-rare">${go.raresFound}</strong></div>
                            <div class="go-stat-box" title="Data"><span>Data</span><strong style="color:#bbb; font-size:0.8rem;">${go.date}</strong></div>
                        </div>
                    </div>
                </div>`;
        });
        legacySection.appendChild(dossierList);

        // Botão Ver Mais
        if (allGOs.length > 4) {
            const btnContainer = document.createElement('div');
            btnContainer.className = 'go-expand-btn-container';
            btnContainer.innerHTML = `<button class="go-expand-btn"><i class="fas fa-chevron-down"></i> Acessar Arquivo Completo (${allGOs.length - 4})</button>`;
            btnContainer.querySelector('button').addEventListener('click', function() {
                dossierList.querySelectorAll('.go-card-hidden').forEach(c => { c.classList.remove('go-card-hidden'); c.style.animation = "fadeIn 0.5s ease"; });
                this.parentElement.remove();
            });
            legacySection.appendChild(btnContainer);
        }
        wrapper.appendChild(legacySection);
    } else {
        wrapper.innerHTML += `<div style="text-align:center; padding:40px; color:#666;"><h3>Nenhum Great One encontrado.</h3></div>`;
    }

    // 3. ARQUIVOS TÁTICOS (CONSOLE V2 COM SCROLL E BUSCA)
    const grindSection = document.createElement('div');
    grindSection.className = 'grind-history-section';
    grindSection.innerHTML = `
        <div class="gh-toolbar">
            <div class="gh-title"><i class="fas fa-list"></i> Registro de Operações (${grindStats.allSessions.length})</div>
            <div class="gh-controls"><input type="text" class="gh-search-input" placeholder="Buscar grind..." id="grind-search-input"></div>
        </div>
        <div class="grind-table-scroll-area">
            <table class="grind-table">
                <thead><tr><th>Animal</th><th>Reserva</th><th>Abates</th><th>Saque</th><th>Rank</th><th>Data</th></tr></thead>
                <tbody id="grind-table-body">${grindStats.allSessions.map(g => `<tr class="grind-row" data-name="${g.animalName.toLowerCase()}"><td><div class="gt-animal"><img src="animais/${g.animalSlug}.png" onerror="this.src='animais/placeholder.jpg'">${g.animalName}</div></td><td>${g.reserveName}</td><td style="font-weight:bold; color:#fff;">${g.kills}</td><td><div class="gt-stats-micro">${g.gos>0?`<span class="gt-pill go"><i class="fas fa-crown"></i> ${g.gos}</span>`:''}<span class="gt-pill dia"><i class="fas fa-gem"></i> ${g.dias}</span><span class="gt-pill rare"><i class="fas fa-paw"></i> ${g.rares}</span></div></td><td><div class="grind-rank-badge rank-${g.rank}">${g.rank}</div></td><td class="gt-date">${g.date}</td></tr>`).join('')}</tbody>
            </table>
        </div>`;
    
    wrapper.appendChild(grindSection);

    // Lógica de Busca
    setTimeout(() => {
        const searchInput = grindSection.querySelector('#grind-search-input');
        if(searchInput) {
            searchInput.addEventListener('input', (e) => {
                const term = e.target.value.toLowerCase();
                const rows = grindSection.querySelectorAll('.grind-row');
                rows.forEach(row => {
                    const name = row.getAttribute('data-name');
                    row.style.display = name.includes(term) ? '' : 'none';
                });
            });
        }
    }, 100);

    // 4. CONQUISTAS
    const achievementsList = generateAchievements(savedData, score, masterTrophyList, grindStats);
    const unlockedCount = achievementsList.filter(a => a.check).length;
    const perc = (unlockedCount / achievementsList.length) * 100;
    const badgesSection = document.createElement('div');
    badgesSection.className = 'badges-section';
    badgesSection.style.marginTop = '40px';
    badgesSection.innerHTML = `<h3 class="grind-reserve-title" style="margin-top:0; font-size:1.2rem; display:flex; justify-content:space-between;"><span><i class="fas fa-medal"></i> Caminho do Predador (${unlockedCount}/${achievementsList.length})</span></h3><div class="achievements-progress-bar"><div class="achievements-progress-fill" style="width: ${perc}%"></div></div><div class="badges-container-scroll">${['bronze', 'silver', 'gold', 'platinum', 'obsidian'].map(tier => { const tierBadges = achievementsList.filter(a => a.tier === tier); if(tierBadges.length === 0) return ''; return `<div class="badge-group-title">Nível ${tier.toUpperCase()}</div><div class="badges-grid">${tierBadges.map(badge => `<div class="badge-card tier-${badge.tier} ${badge.check ? 'unlocked' : 'locked'}"><div class="badge-inner"><div class="badge-front"><div class="badge-icon-circle"><i class="fas ${badge.icon}" ${badge.check ? '' : 'style="opacity:0.3"'}></i></div><div class="badge-name">${badge.name}</div></div><div class="badge-back"><p>${badge.desc}</p><small style="color:${badge.check ? '#4CAF50' : '#d9534f'}">${badge.check ? 'CONQUISTADO' : 'BLOQUEADO'}</small></div></div></div>`).join('')}</div>`; }).join('')}</div>`;
    badgesSection.addEventListener('click', function(e) { const card = e.target.closest('.badge-card'); if(card) card.classList.toggle('flipped'); });
    wrapper.appendChild(badgesSection);

    container.appendChild(wrapper);
}