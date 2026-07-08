import { items, greatsFursData, rareFursData, diamondFursData, animalHotspotData } from '../../data/gameData.js';
import { saveData, savedData } from '../main.js'; 

// --- MOCK DATABASE (SIMULAÇÃO DE REDE) ---
// Utilizado apenas para popular a aba "Rede de Caça" visualmente
const MOCK_CLOUD_DB = {
    'MARCOS99': {
        name: 'Marcos Vinicius', title: 'O Rei do Grind', level: 60, avatarColor: '#FFD700',
        lastSeen: new Date().toISOString(), favoriteWeapon: '.300 Canning Magnum', favoriteReserve: 'Revontuli Coast',
        stats: { diamonds: 45, greatOnes: 3, rares: 120, superRares: 2, totalKills: 15420, classes: [80, 45, 90, 60, 30, 50, 70, 95, 40] },
        signatureCatch: { animal: 'Alce', fur: 'Melanístico', score: 300.5, img: 'https://steamuserimages-a.akamaihd.net/ugc/1839156365922883313/B5C850E239021B1C8D2F8125C76543D757476562/' },
        showcase: [
            { animal: 'Urso Negro', fur: 'Great One', score: 'GO', img: 'https://steamuserimages-a.akamaihd.net/ugc/1839156365922883313/B5C850E239021B1C8D2F8125C76543D757476562/' },
            { animal: 'Cervo Vermelho', fur: 'Great One', score: 'GO', img: 'https://steamuserimages-a.akamaihd.net/ugc/784122849544729352/E60E8E7D5F7628867568A0337E88A31D8D279E53/' }
        ],
        recentLogs: []
    },
    'HUNTER_X': {
        name: 'Xavier Hunter', title: 'Rastreador', level: 42, avatarColor: '#00BCD4',
        lastSeen: '2025-01-20T10:00:00.000Z', favoriteWeapon: 'Arco CB-70', favoriteReserve: 'Silver Ridge',
        stats: { diamonds: 12, greatOnes: 0, rares: 30, superRares: 0, totalKills: 4200, classes: [20, 30, 50, 80, 60, 40, 30, 20, 10] },
        signatureCatch: { animal: 'Puma', fur: 'Albino', score: 39.2, img: 'https://steamuserimages-a.akamaihd.net/ugc/784122849544729352/E60E8E7D5F7628867568A0337E88A31D8D279E53/' },
        showcase: [],
        recentLogs: []
    }
};

// --- HELPER: EXTRAÇÃO INTELIGENTE DE DADOS ---
const normalizeKey = (str) => {
    if (!str) return '';
    return str.toLowerCase()
        .normalize("NFD").replace(/[\u0300-\u036f]/g, "")
        .replace(/[- ]/g, "_")
        .replace(/[^a-z0-9_]/g, "");
};

const findDataByKey = (dataset, rawName) => {
    if (!dataset || !rawName) return null;
    const target = normalizeKey(rawName);
    if (dataset[target]) return dataset[target];
    const foundKey = Object.keys(dataset).find(k => normalizeKey(k) === target);
    return foundKey ? dataset[foundKey] : null;
};

const extractFurs = (data) => {
    if (!data) return [];
    if (Array.isArray(data)) return data;
    if (typeof data === 'object') {
        const m = data.macho || [];
        const f = data.femea || [];
        return [...new Set([...m, ...f])].sort();
    }
    return [];
};

export function renderTrophyView(container) {
    console.log("TrophyView Carregada - Versão Final Limpa"); // Debug para confirmar atualização
    container.innerHTML = '';

    const THEME = {
        gold: '#FFD700',
        cyan: '#00BCD4',
        magenta: '#D500F9',
        orange: '#FF9800',
        purple: '#9C27B0',
        dark: '#121212',
        panelBg: '#161616',
        text: '#E0E0E0',
        danger: '#F44336',
        success: '#4CAF50'
    };

    if (!savedData.album) savedData.album = [];
    if (!savedData.friendsList) savedData.friendsList = [];
    if (!savedData.playerId) savedData.playerId = "PLAYER1"; 

    const state = {
        currentView: 'friends', 
        activeAlbumFilter: 'great_one', 
        tempImage: null, 
        myAlbum: savedData.album,
        myFriends: savedData.friendsList,
        myId: savedData.playerId
    };

    // --- CONFIGURAÇÃO POR ABA ---
    const TAB_CONFIG = {
        'great_one': {
            title: "REGISTRAR GREAT ONE",
            showSessionStats: true, 
            filterAnimals: (list) => list.filter(a => findDataByKey(greatsFursData, a)),
            getFurs: (name) => extractFurs(findDataByKey(greatsFursData, name)),
            applyGenderRule: (elements) => {
                elements.genderSel.innerHTML = '<option value="Macho">Macho</option>';
                elements.genderSel.value = 'Macho';
                elements.genderSel.classList.add('input-disabled');
            }
        },
        'diamond': {
            title: "REGISTRAR DIAMANTE",
            showSessionStats: false, 
            filterAnimals: (list) => list.filter(a => findDataByKey(diamondFursData, a)),
            getFurs: (name) => extractFurs(findDataByKey(diamondFursData, name)),
            applyGenderRule: (elements) => {
                elements.genderSel.innerHTML = '<option value="Macho">Macho</option><option value="Fêmea">Fêmea</option>';
                elements.genderSel.classList.remove('input-disabled');
            }
        },
        'super_rare': {
            title: "REGISTRAR SUPER RARO",
            showSessionStats: false, 
            filterAnimals: (list) => list, 
            getFurs: (name) => {
                const data = findDataByKey(rareFursData, name);
                return data ? extractFurs(data) : ['Albino', 'Melanístico', 'Piebald'];
            },
            applyGenderRule: (elements) => {
                elements.genderSel.innerHTML = '<option value="Macho">Macho</option><option value="Fêmea">Fêmea</option>';
                elements.genderSel.classList.remove('input-disabled');
            }
        },
        'rare': {
            title: "REGISTRAR RARO",
            showSessionStats: false,
            filterAnimals: (list) => list,
            getFurs: (name) => {
                const data = findDataByKey(rareFursData, name);
                return data ? extractFurs(data) : ['Marrom', 'Louro', 'Vermelho'];
            },
            applyGenderRule: (elements) => {
                elements.genderSel.innerHTML = '<option value="Macho">Macho</option><option value="Fêmea">Fêmea</option>';
                elements.genderSel.classList.remove('input-disabled');
            }
        },
        'lodge': {
            title: "REGISTRAR CASARÃO",
            showSessionStats: false,
            filterAnimals: () => [], 
            getFurs: () => [], 
            applyGenderRule: () => {} 
        }
    };

    const style = document.createElement('style');
    style.textContent = `
        .trophy-container { width: 100%; min-height: 85vh; color: ${THEME.text}; font-family: 'Montserrat', sans-serif; position: relative; padding-bottom: 50px; }
        .hidden { display: none !important; }
        .view-section { display: none; animation: fadeIn 0.4s ease; }
        .view-section.active { display: block; }
        #app-hub-header { display: flex; justify-content: space-between; align-items: center; margin: 20px 0 40px 0; border-bottom: 1px solid rgba(255,255,255,0.05); padding-bottom: 20px; padding-left: 20px; padding-right: 20px; }
        .tabs-nav { display: flex; gap: 40px; }
        .tab-btn { background: transparent; border: none; color: #666; font-family: 'Bebas Neue', sans-serif; font-size: 1.8rem; letter-spacing: 1px; cursor: pointer; transition: 0.3s; padding: 5px 0; position: relative; }
        .tab-btn:hover { color: #aaa; }
        .tab-btn.active { color: #fff; text-shadow: 0 0 15px rgba(255,255,255,0.15); }
        .tab-btn.active::after { content: ''; position: absolute; bottom: -22px; left: 0; width: 100%; height: 3px; background: ${THEME.gold}; box-shadow: 0 -2px 10px ${THEME.gold}; }
        .user-tag { background: rgba(0,0,0,0.4); padding: 8px 20px; border-radius: 8px; border: 1px solid rgba(255,255,255,0.1); display: flex; align-items: center; gap: 15px; }
        .user-tag span { color: ${THEME.gold}; font-weight: 800; font-size: 0.9rem; letter-spacing: 1px; }
        .btn-edit-id { background: none; border: none; color: #666; cursor: pointer; transition: 0.2s; }
        .btn-edit-id:hover { color: #fff; }
        .network-layout { display: grid; grid-template-columns: 350px 1fr; gap: 40px; align-items: start; padding: 0 20px; }
        .recruit-panel { background: #0f0f0f; border: 1px solid #2a2a2a; border-radius: 12px; padding: 25px; position: sticky; top: 20px; box-shadow: 0 10px 40px rgba(0,0,0,0.5); }
        .panel-title { font-family: 'Bebas Neue'; font-size: 2rem; color: #fff; margin-bottom: 15px; }
        .input-cyber { background: #000; border: 1px solid #333; color: #fff; padding: 15px; width: 100%; border-radius: 6px; font-family: 'Montserrat'; font-weight: 700; text-transform: uppercase; margin-bottom: 10px; transition: 0.3s; }
        .input-cyber:focus { border-color: ${THEME.gold}; outline: none; }
        .btn-cyber-add { background: ${THEME.gold}; border: none; border-radius: 6px; width: 100%; padding: 15px; cursor: pointer; color: #000; font-weight: 900; letter-spacing: 1px; transition: 0.2s; }
        .btn-cyber-add:hover { transform: translateY(-2px); box-shadow: 0 5px 15px rgba(255,215,0,0.3); }
        .squad-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(300px, 1fr)); gap: 30px; }
        .hunter-tag { background: linear-gradient(145deg, #121212 0%, #0a0a0a 100%); border: 1px solid #2a2a2a; border-radius: 16px; position: relative; overflow: hidden; display: flex; flex-direction: column; align-items: center; transition: all 0.3s; padding: 30px 20px 25px 20px; box-shadow: 0 10px 30px rgba(0,0,0,0.2); }
        .hunter-tag:hover { border-color: rgba(255, 215, 0, 0.3); transform: translateY(-5px); box-shadow: 0 20px 40px rgba(0,0,0,0.4); }
        .btn-trash-corner { position: absolute; top: 15px; right: 15px; background: transparent; border: none; color: #444; font-size: 1rem; cursor: pointer; transition: 0.2s; width: 30px; height: 30px; border-radius: 50%; display: flex; align-items: center; justify-content: center; }
        .btn-trash-corner:hover { background: rgba(244, 67, 54, 0.1); color: ${THEME.danger}; }
        .ht-avatar-container { position: relative; margin-bottom: 15px; }
        .ht-avatar-circle { width: 80px; height: 80px; background: #222; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 2rem; font-weight: 900; color: #000; border: 3px solid #1a1a1a; box-shadow: 0 0 20px rgba(0,0,0,0.5); }
        .hunter-tag:hover .ht-avatar-circle { border-color: ${THEME.gold}; }
        .ht-info { text-align: center; margin-bottom: 25px; }
        .ht-info h3 { font-family: 'Bebas Neue'; font-size: 2rem; color: #fff; margin: 0; letter-spacing: 1px; }
        .ht-info span { font-size: 0.75rem; color: #888; font-weight: 700; text-transform: uppercase; letter-spacing: 2px; background: rgba(255,255,255,0.05); padding: 4px 12px; border-radius: 20px; }
        .ht-stats-row { display: flex; justify-content: center; gap: 30px; margin-bottom: 25px; width: 100%; border-top: 1px solid rgba(255,255,255,0.05); border-bottom: 1px solid rgba(255,255,255,0.05); padding: 15px 0; }
        .ht-stat-item { text-align: center; }
        .ht-stat-val { display: block; font-weight: 900; font-size: 1.5rem; line-height: 1; }
        .ht-stat-lbl { font-size: 0.65rem; color: #666; font-weight: 700; text-transform: uppercase; letter-spacing: 1px; margin-top: 5px; }
        .val-gold { color: ${THEME.gold}; text-shadow: 0 0 10px rgba(255, 215, 0, 0.2); }
        .val-cyan { color: ${THEME.cyan}; text-shadow: 0 0 10px rgba(0, 188, 212, 0.2); }
        .btn-inspect-outline { width: 100%; background: transparent; color: ${THEME.text}; border: 1px solid #333; padding: 12px; font-weight: 800; text-transform: uppercase; font-size: 0.8rem; letter-spacing: 2px; border-radius: 8px; cursor: pointer; transition: all 0.2s ease; display: flex; align-items: center; justify-content: center; gap: 10px; }
        .btn-inspect-outline:hover { border-color: ${THEME.gold}; color: ${THEME.gold}; background: rgba(255, 215, 0, 0.05); box-shadow: 0 0 15px rgba(255,215,0,0.1); }
        .gallery-toolbar { display: flex; justify-content: space-between; margin-bottom: 30px; padding: 0 20px; }
        .filter-pills { display: flex; gap: 8px; background: #111; padding: 6px; border-radius: 50px; border: 1px solid #333; }
        .sub-btn { background: transparent; border: none; color: #777; padding: 8px 24px; font-size: 0.75rem; font-weight: 700; text-transform: uppercase; cursor: pointer; border-radius: 40px; transition: all 0.3s; }
        .sub-btn.active { background: ${THEME.gold}; color: #000; box-shadow: 0 4px 12px rgba(0,0,0,0.3); }
        .sub-btn.active[data-filter="diamond"] { background: ${THEME.cyan}; }
        .sub-btn.active[data-filter="super_rare"] { background: ${THEME.magenta}; color: #fff; }
        .sub-btn.active[data-filter="rare"] { background: ${THEME.orange}; }
        .sub-btn.active[data-filter="lodge"] { background: ${THEME.purple}; color: #fff; }
        .btn-add-hero { background: #fff; color: #000; border: none; padding: 12px 30px; border-radius: 8px; font-weight: 800; text-transform: uppercase; cursor: pointer; display: flex; align-items: center; gap: 10px; transition: 0.3s; box-shadow: 0 0 15px rgba(255,255,255,0.1); }
        .vault-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(280px, 1fr)); gap: 25px; padding: 0 20px; }
        .vault-card { background: #141414; border-radius: 10px; border: 1px solid #333; overflow: hidden; transition: all 0.3s cubic-bezier(0.25, 0.8, 0.25, 1); display: flex; flex-direction: column; position: relative; }
        .vault-card:hover { transform: translateY(-7px); box-shadow: 0 15px 30px rgba(0,0,0,0.5); border-color: var(--card-color); }
        .vault-img-box { position: relative; width: 100%; aspect-ratio: 16/9; cursor: zoom-in; overflow: hidden; border-bottom: 1px solid #222; }
        .vault-img { width: 100%; height: 100%; object-fit: cover; transition: transform 0.5s; }
        .vault-card:hover .vault-img { transform: scale(1.1); }
        .zoom-overlay { position: absolute; inset: 0; background: rgba(0,0,0,0.4); display: flex; align-items: center; justify-content: center; opacity: 0; transition: 0.3s; }
        .vault-img-box:hover .zoom-overlay { opacity: 1; }
        .zoom-icon { font-size: 2rem; color: #fff; text-shadow: 0 2px 10px rgba(0,0,0,0.8); }
        .vc-body { padding: 15px; display: flex; flex-direction: column; gap: 5px; flex: 1; background: linear-gradient(180deg, #1a1a1a 0%, #121212 100%); }
        .vc-top-row { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 5px; }
        .vc-animal { font-family: 'Bebas Neue'; font-size: 1.5rem; color: #fff; line-height: 1; }
        .vc-score-tag { font-family: 'Bebas Neue'; font-size: 1.1rem; color: #121212; background: var(--card-color); padding: 3px 10px; border-radius: 4px; box-shadow: 0 0 15px var(--card-glow); font-weight: bold; }
        .vc-fur { font-size: 0.85rem; color: #ddd; font-weight: 700; text-transform: uppercase; letter-spacing: 0.5px; }
        .vc-custom-title { font-size: 0.75rem; color: #777; font-style: italic; margin-bottom: 5px; display: block; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
        .vc-footer { margin-top: auto; padding-top: 12px; border-top: 1px solid #2a2a2a; display: flex; justify-content: space-between; align-items: center; }
        .vc-date { font-size: 0.7rem; color: #555; font-weight: 600; text-transform: uppercase; letter-spacing: 1px; }
        .btn-card-trash { background: transparent; border: 1px solid #333; color: #555; width: 32px; height: 32px; border-radius: 6px; display: flex; align-items: center; justify-content: center; cursor: pointer; transition: 0.2s; }
        .btn-card-trash:hover { border-color: ${THEME.danger}; color: ${THEME.danger}; background: rgba(244, 67, 54, 0.1); }
        .upload-modal-overlay, .confirm-modal-overlay, .lightbox-overlay { position: fixed; inset: 0; background: rgba(0,0,0,0.95); z-index: 10002; display: none; align-items: flex-start; justify-content: center; overflow-y: auto; padding: 20px; }
        .upload-modal { background: #121212; width: 950px; border-radius: 16px; border: 1px solid #333; padding: 40px; display: flex; gap: 30px; align-items: flex-start; position: absolute; top: 50px; left: 50%; transform: translateX(-50%); margin-bottom: 50px; max-height: 85vh; overflow-y: auto; z-index: 10005; }
        .upload-modal > div:first-child { flex: 1; min-width: 0; }
        .form-section { flex: 1.2; display: flex; flex-direction: column; gap: 15px; min-width: 0; }
        .input-compact { background: #000; border: 1px solid #333; color: #fff; padding: 14px; width: 100%; border-radius: 6px; font-weight: 600; font-size: 0.9rem; transition: 0.2s; color-scheme: dark; }
        .input-compact:focus { border-color: ${THEME.gold}; outline: none; }
        .form-row { display: grid; grid-template-columns: 1fr 1fr; gap: 15px; }
        .input-date-styled { background: #000; border: 1px solid #333; color: #ccc; padding: 14px; width: 100%; border-radius: 6px; font-weight: 600; text-align: center; font-family: 'Montserrat'; text-transform: uppercase; color-scheme: dark; }
        .input-score-styled { background: #000; border: 1px solid ${THEME.gold}; color: ${THEME.gold}; padding: 14px; width: 100%; border-radius: 6px; font-weight: 900; font-size: 1rem; text-align: center; }
        .um-stats-panel { background: #0d0d0d; border: 1px solid #222; border-radius: 12px; padding: 15px; margin-top: auto; display: none; flex-direction: column; gap: 10px; }
        .um-stats-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 10px; }
        .um-stat-card { background: #161616; border: 1px solid #2a2a2a; border-radius: 8px; padding: 10px 5px; text-align: center; }
        .um-stat-icon { font-size: 1rem; margin-bottom: 2px; }
        .um-stat-label { font-size: 0.55rem; color: #666; font-weight: 800; letter-spacing: 0.5px; }
        .um-stat-input { background: transparent; border: none; color: #fff; font-size: 1.1rem; font-weight: 900; text-align: center; width: 100%; outline: none; }
        .confirm-box { background: #161616; padding: 30px; border-radius: 12px; border: 1px solid #333; width: 400px; text-align: center; margin-top: 20vh; }
        .lightbox-container { position: relative; margin-top: 5vh; }
        .lightbox-img { max-width: 90vw; max-height: 85vh; border: 1px solid #333; box-shadow: 0 0 50px #000; }
        .lightbox-close-btn { position: absolute; top: -20px; right: -20px; background: #000; border: 2px solid ${THEME.gold}; color: ${THEME.gold}; width: 40px; height: 40px; border-radius: 50%; display: flex; align-items: center; justify-content: center; cursor: pointer; }
        .toast-container { position: fixed; top: 20px; right: 20px; z-index: 10001; pointer-events: none; }
        .toast { background: #1a1a1a; color: #fff; padding: 16px 24px; border-radius: 8px; box-shadow: 0 5px 20px rgba(0,0,0,0.5); display: flex; align-items: center; gap: 15px; min-width: 300px; border-left: 4px solid #fff; animation: slideInRight 0.4s; }
        @keyframes slideInRight { from { opacity: 0; transform: translateX(50px); } to { opacity: 1; transform: translateX(0); } }
        @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
        #view-dossier { position: fixed; inset: 0; background: rgba(0, 0, 0, 0.2); backdrop-filter: blur(8px); z-index: 10000; overflow-y: auto; padding: 0; display: none; }
        #view-dossier.active { display: block; animation: fadeInZoom 0.3s; }
        @keyframes fadeInZoom { from { opacity: 0; transform: scale(0.98); } to { opacity: 1; transform: scale(1); } }
        .ds-hero { padding: 60px 20px 40px 20px; display: flex; flex-direction: column; align-items: center; justify-content: center; position: relative; background: linear-gradient(180deg, rgba(0,0,0,0.6) 0%, rgba(0,0,0,0) 100%); }
        .ds-back-btn { position: absolute; top: 30px; left: 30px; background: rgba(255,255,255,0.05); border: 1px solid rgba(255,255,255,0.1); color: #ccc; padding: 8px 20px; border-radius: 30px; cursor: pointer; font-weight: 600; transition: 0.2s; display: flex; align-items: center; gap: 10px; font-size: 0.75rem; text-transform: uppercase; }
        .ds-back-btn:hover { background: #fff; color: #000; border-color: #fff; }
        .ds-header-content { display: flex; flex-direction: column; align-items: center; gap: 20px; margin-top: 10px; }
        .avatar-container { position: relative; }
        .ds-avatar-xl { width: 110px; height: 110px; background: ${THEME.panelBg}; color: ${THEME.gold}; font-size: 2.5rem; font-weight: 900; display: flex; align-items: center; justify-content: center; border-radius: 50%; border: 2px solid ${THEME.gold}; box-shadow: 0 0 25px rgba(255, 215, 0, 0.15); }
        .ds-rank-badge { position: absolute; bottom: 0; right: 0; background: ${THEME.gold}; color: #000; font-family: 'Bebas Neue', sans-serif; font-size: 1rem; padding: 2px 8px; border-radius: 4px; border: 2px solid #121212; box-shadow: 0 4px 10px rgba(0,0,0,0.5); }
        .ds-name-xl { font-family: 'Bebas Neue'; font-size: 3.5rem; color: #fff; line-height: 1; margin: 0; text-shadow: 0 4px 15px rgba(0,0,0,0.5); letter-spacing: 1px; }
        .ds-title-tag { color: ${THEME.cyan}; font-size: 0.85rem; font-weight: 700; text-transform: uppercase; letter-spacing: 2px; margin-top: 5px; display: block; }
        .ds-grid { max-width: 1200px; margin: 0 auto; padding: 20px 40px 80px 40px; display: flex; flex-direction: column; gap: 50px; }
        .stats-section { display: grid; grid-template-columns: repeat(4, 1fr); gap: 25px; }
        .stat-card { background: #111; border: 1px solid #222; border-radius: 12px; padding: 30px; text-align: center; position: relative; }
        .sc-circle { width: 90px; height: 90px; border-radius: 50%; border: 8px solid #1a1a1a; margin: 0 auto 20px auto; position: relative; display: flex; align-items: center; justify-content: center; font-size: 1.4rem; font-weight: 800; color: #fff; }
        .sc-circle::after { content: ''; position: absolute; inset: -8px; border-radius: 50%; background: conic-gradient(var(--c) var(--p), transparent 0); -webkit-mask: radial-gradient(farthest-side, transparent calc(100% - 8px), #fff 0); mask: radial-gradient(farthest-side, transparent calc(100% - 8px), #fff 0); }
        .sc-label { font-size: 0.75rem; font-weight: 800; color: #888; letter-spacing: 1px; }
        .sc-sub { font-size: 0.7rem; color: #555; margin-top: 5px; display: block; }
        .showcase-grid { display: flex; gap: 20px; overflow-x: auto; padding-bottom: 20px; }
        .polaroid { min-width: 220px; background: #e0e0e0; padding: 10px 10px 40px 10px; transform: rotate(-1deg); transition: 0.3s; cursor: pointer; box-shadow: 0 5px 20px rgba(0,0,0,0.5); border-radius: 2px; }
        .polaroid:hover { transform: scale(1.05) rotate(0deg); z-index: 2; background: #fff; }
        .polaroid img { width: 100%; aspect-ratio: 4/3; object-fit: cover; background: #000; filter: sepia(0.1); }
        .polaroid-caption { color: #333; font-family: 'Courier New', monospace; font-weight: bold; text-align: center; margin-top: 15px; font-size: 0.85rem; line-height: 1.2; }
        .logs-table { width: 100%; border-collapse: collapse; margin-top: 20px; }
        .logs-table th { text-align: left; color: #666; font-size: 0.75rem; text-transform: uppercase; padding: 15px; border-bottom: 1px solid #333; font-weight: 800; }
        .logs-table td { padding: 15px; border-bottom: 1px solid #1a1a1a; color: #ccc; font-size: 0.9rem; }
        .logs-table tr:hover td { background: #111; color: #fff; }
        .ds-sec-title { font-family: 'Bebas Neue'; font-size: 1.8rem; color: #fff; margin-bottom: 25px; display: flex; align-items: center; gap: 15px; }
        .ds-sec-title::after { content: ''; flex: 1; height: 1px; background: #222; }
    `;
    container.appendChild(style);

    const content = document.createElement('div');
    content.className = 'trophy-container';
    content.innerHTML = `
        <div id="app-hub">
            <div id="app-hub-header">
                <div class="tabs-nav">
                    <button class="tab-btn" id="nav-album">GALERIA PESSOAL</button>
                    <button class="tab-btn active" id="nav-friends">REDE DE CAÇA</button>
                </div>
                <div class="user-tag">
                    <span id="display-player-id">#${state.myId}</span>
                    <button class="btn-edit-id" id="btn-edit-id"><i class="fas fa-pen"></i></button>
                </div>
            </div>

            <div id="view-friends" class="view-section active">
                <div class="network-layout">
                    <div class="recruit-panel">
                        <div class="panel-title">RECRUTAMENTO</div>
                        <p style="color:#666; font-size:0.85rem; margin-bottom:20px;">Localize operadores na rede global.</p>
                        <input type="text" class="input-cyber" id="friend-id-input" placeholder="ID DO ALVO">
                        <button class="btn-cyber-add" id="btn-add-friend">ENVIAR SOLICITAÇÃO</button>
                    </div>
                    <div>
                        <h4 style="font-family:'Bebas Neue'; font-size:2rem; color:#fff; margin-bottom:25px;">ESQUADRÃO ATIVO (<span id="friends-count">0</span>)</h4>
                        <div class="squad-grid" id="friends-list-render"></div>
                    </div>
                </div>
            </div>

            <div id="view-album" class="view-section">
                <div class="gallery-toolbar">
                    <div class="filter-pills" id="album-filters">
                        <button class="sub-btn active" data-filter="great_one">Great Ones</button>
                        <button class="sub-btn" data-filter="diamond">Diamantes</button>
                        <button class="sub-btn" data-filter="super_rare">Super Raros</button>
                        <button class="sub-btn" data-filter="rare">Raros</button>
                        <button class="sub-btn" data-filter="lodge">Casarão</button>
                    </div>
                    <button id="btn-open-upload" class="btn-add-hero">+ NOVO TROFÉU</button>
                </div>
                <div class="vault-grid" id="album-grid-container"></div>
            </div>
        </div>

        <input type="file" id="file-upload-input" style="display: none;" accept="image/*">
        
        <div class="upload-modal-overlay" id="upload-modal" style="display:none;">
             <div class="upload-modal">
                <div style="background:#000; border-radius:15px; overflow:hidden; aspect-ratio:16/9;">
                    <img id="um-preview-img" style="width:100%; height:100%; object-fit:cover;">
                </div>
                
                <div class="form-section">
                    <h2 style="font-family:'Bebas Neue'; font-size:1.8rem; color:#fff; margin:0 0 5px 0;" id="um-modal-title">REGISTRAR CAÇA</h2>
                    <input type="text" id="um-custom-name" class="input-compact" placeholder="TÍTULO DO TROFÉU (OPCIONAL)">
                    <select id="um-animal-select" class="input-compact"></select>
                    
                    <div class="form-row">
                        <input type="date" id="um-date-input" class="input-date-styled">
                        <input type="number" id="um-score-input" class="input-score-styled" placeholder="SCORE (Ex: 260.5)">
                    </div>
                    
                    <div class="form-row" id="um-attributes-row">
                        <select id="um-fur-select" class="input-compact"></select>
                        <select id="um-gender-select" class="input-compact"><option>Macho</option><option>Fêmea</option></select>
                    </div>
                    
                    <div class="um-stats-panel" id="um-stats-panel">
                        <label style="color:#888; font-size:0.65rem; font-weight:800; text-transform:uppercase; margin-bottom:5px;">ESTATÍSTICAS DA SESSÃO (OPCIONAL)</label>
                        <div class="um-stats-grid">
                            <div class="um-stat-card"><div class="um-stat-icon" style="color:#F44336">💀</div><div class="um-stat-label">ABATES</div><input type="number" id="um-stat-kills" class="um-stat-input" value="0"></div>
                            <div class="um-stat-card"><div class="um-stat-icon" style="color:#00BCD4">💎</div><div class="um-stat-label">DIAMANTES</div><input type="number" id="um-stat-diamonds" class="um-stat-input" value="0"></div>
                            <div class="um-stat-card"><div class="um-stat-icon" style="color:#FFD700">🐾</div><div class="um-stat-label">RAROS</div><input type="number" id="um-stat-rares" class="um-stat-input" value="0"></div>
                            <div class="um-stat-card"><div class="um-stat-icon" style="color:#D500F9">👻</div><div class="um-stat-label">TROLLS</div><input type="number" id="um-stat-trolls" class="um-stat-input" value="0"></div>
                        </div>
                    </div>

                    <div style="display:flex; gap:10px; margin-top:auto;">
                        <button id="btn-modal-cancel" style="flex:1; background:#222; color:#ccc; border:none; padding:15px; border-radius:6px; cursor:pointer; font-weight:700;">CANCELAR</button>
                        <button id="btn-modal-save" style="flex:2; background:${THEME.gold}; color:#000; border:none; padding:15px; border-radius:6px; font-weight:900; cursor:pointer;">SALVAR REGISTRO</button>
                    </div>
                </div>
            </div>
        </div>

        <div class="confirm-modal-overlay" id="confirm-modal" style="display:none;"><div class="confirm-box"><div style="font-family:'Bebas Neue'; font-size:2rem; color:#fff; margin-bottom:20px;">CONFIRMAR AÇÃO?</div><div style="display:flex; justify-content:center; gap:10px;"><button id="btn-confirm-yes" style="background:${THEME.danger}; color:#fff; border:none; padding:10px 30px; border-radius:6px; cursor:pointer; font-weight:bold;">SIM</button><button id="btn-confirm-no" style="background:#333; color:#fff; border:none; padding:10px 30px; border-radius:6px; cursor:pointer; font-weight:bold;">NÃO</button></div></div></div>
        <div class="lightbox-overlay" id="trophy-lightbox" style="display:none;"><div class="lightbox-container"><button class="lightbox-close-btn" id="lightbox-close"><i class="fas fa-times"></i></button><img src="" class="lightbox-img" id="lightbox-img"></div></div>
        <div class="toast-container" id="toast-container"></div>
        <div id="view-dossier"><div class="ds-hero"><button class="ds-back-btn" id="btn-close-dossier"><i class="fas fa-arrow-left"></i> VOLTAR</button><div class="ds-header-content"></div></div><div class="ds-grid"><div><div class="ds-sec-title">ESTATÍSTICAS</div><div class="stats-section"><div class="stat-card"><div class="sc-circle" style="--c:${THEME.orange}; --p:0%;">0%</div><div class="sc-label">RAROS</div><span class="sc-sub" id="ov-rares">0</span></div><div class="stat-card"><div class="sc-circle" style="--c:${THEME.cyan}; --p:0%;">0%</div><div class="sc-label">DIAMANTES</div><span class="sc-sub" id="ov-diamonds">0</span></div><div class="stat-card"><div class="sc-circle" style="--c:${THEME.gold}; --p:0%;">0%</div><div class="sc-label">GREAT ONES</div><span class="sc-sub" id="ov-greats">0</span></div><div class="stat-card"><div class="sc-circle" style="--c:${THEME.magenta}; --p:0%;">0%</div><div class="sc-label">SUPER RAROS</div><span class="sc-sub" id="ov-super">0</span></div></div></div><div><div class="ds-sec-title">GALERIA</div><div class="showcase-grid" id="ds-showcase"></div></div><div><div class="ds-sec-title">LOGS</div><table class="logs-table"><tbody id="ds-logs-body"></tbody></table></div></div></div>
    `;
    container.appendChild(content);

    // --- FUNÇÕES E LÓGICA ---
    const safeAddEvent = (id, event, handler) => {
        const el = document.getElementById(id);
        if(el) el[event] = handler;
    };

    // --- TOAST NOTIFICATION ---
    // Esta função estava faltando no seu arquivo duplicado
    const showToast = (message, type = 'info') => {
        const container = document.getElementById('toast-container');
        if (!container) return;

        const toast = document.createElement('div');
        toast.className = 'toast';
        
        let accentColor = '#fff';
        let iconClass = 'fa-info-circle';
        if (type === 'success') { accentColor = THEME.success; iconClass = 'fa-check-circle'; }
        else if (type === 'error') { accentColor = THEME.danger; iconClass = 'fa-times-circle'; }
        else if (type === 'warning') { accentColor = THEME.orange; iconClass = 'fa-exclamation-triangle'; }

        toast.style.borderLeftColor = accentColor;
        toast.innerHTML = `<i class="fas ${iconClass}" style="color:${accentColor}"></i> <span>${message}</span>`;
        
        container.appendChild(toast);
        setTimeout(() => {
            toast.style.transition = 'opacity 0.5s';
            toast.style.opacity = '0';
            setTimeout(() => toast.remove(), 500);
        }, 3000);
    };

    let confirmCallback = null;
    safeAddEvent('btn-confirm-no', 'onclick', () => document.getElementById('confirm-modal').style.display = 'none');
    safeAddEvent('btn-confirm-yes', 'onclick', () => { if(confirmCallback) confirmCallback(); document.getElementById('confirm-modal').style.display = 'none'; });

    // --- NAVEGAÇÃO ---
    const switchHubTab = (viewName) => {
        document.getElementById('app-hub').classList.remove('hidden');
        document.getElementById('view-dossier').classList.remove('active');
        document.querySelectorAll('.view-section').forEach(v => v.classList.remove('active'));
        const target = document.getElementById(`view-${viewName}`);
        if(target) target.classList.add('active');
        document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
        const navBtn = document.getElementById(`nav-${viewName}`);
        if(navBtn) navBtn.classList.add('active');
        if(viewName === 'friends') renderFriends();
        if(viewName === 'album') renderAlbum();
    };

    const toggleDossierMode = (active) => {
        const hub = document.getElementById('app-hub');
        const dossier = document.getElementById('view-dossier');
        if(active) { hub.classList.add('hidden'); dossier.classList.add('active'); } 
        else { dossier.classList.remove('active'); hub.classList.remove('hidden'); }
    };

    safeAddEvent('nav-album', 'onclick', () => switchHubTab('album'));
    safeAddEvent('nav-friends', 'onclick', () => switchHubTab('friends'));
    safeAddEvent('btn-close-dossier', 'onclick', () => toggleDossierMode(false));

    // --- FORM LOGIC ---
    const updateFormAttributes = (animalKey) => {
        try {
            const currentTab = state.activeAlbumFilter || 'lodge';
            const config = TAB_CONFIG[currentTab] || TAB_CONFIG['lodge'];
            const furSel = document.getElementById('um-fur-select');
            const genderSel = document.getElementById('um-gender-select');
            if(!furSel || !genderSel) return;

            furSel.innerHTML = '<option value="">PELAGEM...</option>';
            const furs = config.getFurs(animalKey);
            if (furs && furs.length > 0) {
                furs.forEach(f => furSel.innerHTML += `<option>${f}</option>`);
            } else {
                if(currentTab !== 'lodge') furSel.innerHTML += '<option>Comum</option><option>Rara</option><option>Diamante</option>';
            }
            config.applyGenderRule({ genderSel }, animalKey);
        } catch (e) { console.error(e); }
    };

    // --- RENDERS ---
    const renderFriends = () => {
        const list = document.getElementById('friends-list-render');
        if(!list) return;
        list.innerHTML = '';
        document.getElementById('friends-count').textContent = state.myFriends.length;
        if(state.myFriends.length === 0) { list.innerHTML = '<div style="color:#666; padding:20px;">Nenhum aliado.</div>'; return; }
        state.myFriends.forEach(fid => {
            const data = MOCK_CLOUD_DB[fid] || { name: 'Desconhecido', stats: { diamonds: 0, greatOnes: 0 } };
            const card = document.createElement('div');
            card.className = 'hunter-tag';
            card.innerHTML = `
                <button class="btn-trash-corner" data-fid="${fid}"><i class="fas fa-times"></i></button>
                <div class="ht-avatar-container"><div class="ht-avatar-circle" style="background:${data.avatarColor||'#333'}">${data.name.charAt(0)}</div></div>
                <div class="ht-info"><h3>${data.name}</h3><span>#${fid}</span></div>
                <div class="ht-stats-row"><div class="ht-stat-item"><span class="ht-stat-val val-gold">${data.stats.greatOnes}</span><span class="ht-stat-lbl">Great Ones</span></div><div style="width:1px; background:rgba(255,255,255,0.1);"></div><div class="ht-stat-item"><span class="ht-stat-val val-cyan">${data.stats.diamonds}</span><span class="ht-stat-lbl">Diamantes</span></div></div>
                <button class="btn-inspect-outline" data-fid="${fid}"><i class="fas fa-search"></i> Inspecionar</button>
            `;
            card.querySelector('.btn-inspect-outline').onclick = () => openDossier(fid);
            card.querySelector('.btn-trash-corner').onclick = () => {
                confirmCallback = () => {
                    state.myFriends = state.myFriends.filter(id => id !== fid);
                    savedData.friendsList = state.myFriends;
                    saveData(savedData);
                    renderFriends();
                };
                document.getElementById('confirm-modal').style.display = 'flex';
            };
            list.appendChild(card);
        });
    };

    const openDossier = (fid) => {
        const data = MOCK_CLOUD_DB[fid];
        if(!data) return;
        document.querySelector('.ds-header-content').innerHTML = `<div class="avatar-container"><div class="ds-avatar-xl" style="background:${data.avatarColor || '#333'}">${data.name.charAt(0)}</div><div class="ds-rank-badge">LVL ${data.level}</div></div><div class="ds-info-block"><h1 class="ds-name-xl">${data.name}</h1><span class="ds-title-tag">${data.title}</span></div>`;
        document.getElementById('ov-rares').textContent = `${data.stats.rares}`;
        document.getElementById('ov-diamonds').textContent = `${data.stats.diamonds}`;
        document.getElementById('ov-greats').textContent = `${data.stats.greatOnes}`;
        document.getElementById('ov-super').textContent = `${data.stats.superRares}`;
        toggleDossierMode(true);
    };

    const renderAlbum = () => {
        const grid = document.getElementById('album-grid-container');
        if(!grid) return;
        grid.innerHTML = '';
        state.myAlbum.filter(i => i.category === state.activeAlbumFilter).forEach(p => {
            let cardColor = THEME.gold; let cardGlow = 'rgba(255, 215, 0, 0.2)';
            if(p.category === 'diamond') { cardColor = THEME.cyan; cardGlow = 'rgba(0, 188, 212, 0.2)'; }
            else if(p.category === 'super_rare') { cardColor = THEME.magenta; cardGlow = 'rgba(213, 0, 249, 0.2)'; }
            else if(p.category === 'rare') { cardColor = THEME.orange; cardGlow = 'rgba(255, 152, 0, 0.2)'; }
            else if(p.category === 'lodge') { cardColor = '#9E9E9E'; cardGlow = 'rgba(158, 158, 158, 0.2)'; }

            const card = document.createElement('div');
            card.className = 'vault-card';
            card.style.setProperty('--card-color', cardColor);
            card.style.setProperty('--card-glow', cardGlow);

            card.innerHTML = `
                <div class="vault-img-box" id="img-box-${p.id}">
                    <img src="${p.image}" class="vault-img" loading="lazy">
                    <div class="zoom-overlay"><i class="fas fa-expand-alt zoom-icon"></i></div>
                </div>
                <div class="vc-body">
                    <div class="vc-top-row">
                        <div class="vc-animal">${p.animal}</div>
                        ${p.score ? `<div class="vc-score-tag">${p.score}</div>` : ''}
                    </div>
                    ${p.fur ? `<div class="vc-fur">${p.fur}</div>` : ''}
                    ${p.displayTitle ? `<span class="vc-custom-title">"${p.displayTitle}"</span>` : ''}
                    <div class="vc-footer">
                        <span class="vc-date">${p.date}</span>
                        <button class="btn-card-trash" id="btn-del-${p.id}"><i class="fas fa-trash"></i></button>
                    </div>
                </div>
            `;
            card.querySelector(`#img-box-${p.id}`).onclick = () => { document.getElementById('lightbox-img').src = p.image; document.getElementById('trophy-lightbox').style.display = 'flex'; };
            card.querySelector(`#btn-del-${p.id}`).onclick = (e) => {
                e.stopPropagation();
                confirmCallback = () => {
                    state.myAlbum = state.myAlbum.filter(x => x.id !== p.id);
                    savedData.album = state.myAlbum; saveData(savedData); renderAlbum(); showToast('TROFÉU REMOVIDO', 'success');
                };
                document.getElementById('confirm-modal').style.display = 'flex';
            };
            grid.appendChild(card);
        });
        if(grid.children.length === 0) grid.innerHTML = `<div style="grid-column: 1/-1; text-align:center; color:#444; padding:50px; font-style:italic;">Nenhum troféu nesta categoria.</div>`;
    };

   // --- EVENTS ---
    
    // CORREÇÃO 1: Reset do input de arquivo para resolver o problema de cliques falhos/delay
    safeAddEvent('btn-open-upload', 'onclick', () => {
        const fileInput = document.getElementById('file-upload-input');
        if (fileInput) {
            fileInput.value = ''; // Limpa o valor anterior para garantir disparo do evento change
            fileInput.click();
        }
    });

    safeAddEvent('file-upload-input', 'onchange', (e) => {
        if(e.target.files[0]) {
            // Feedback visual imediato (opcional, mas bom para UX)
            showToast('PROCESSANDO IMAGEM...', 'info');

            const reader = new FileReader();
            reader.onload = (ev) => {
                state.tempImage = ev.target.result;
                const previewImg = document.getElementById('um-preview-img');
                if (previewImg) previewImg.src = state.tempImage;
                
                const currentTab = state.activeAlbumFilter || 'lodge';
                const config = TAB_CONFIG[currentTab] || TAB_CONFIG['lodge'];
                const isLodge = currentTab === 'lodge';
                
                document.getElementById('um-modal-title').textContent = config.title;
                
                // Controle de Visibilidade dos Campos
                const animalSel = document.getElementById('um-animal-select');
                const scoreInput = document.getElementById('um-score-input');
                const statsPanel = document.getElementById('um-stats-panel');
                const attrRow = document.getElementById('um-attributes-row');

                if (animalSel) animalSel.style.display = isLodge ? 'none' : 'block';
                if (attrRow) attrRow.style.display = isLodge ? 'none' : 'grid';
                
                // Ajuste de Grid para o Score
                const scoreContainer = scoreInput ? scoreInput.parentElement : null;
                if (scoreInput) scoreInput.style.display = isLodge ? 'none' : 'block';
                if (scoreContainer) scoreContainer.style.gridTemplateColumns = isLodge ? '1fr' : '1fr 1fr';

                if (statsPanel) statsPanel.style.display = config.showSessionStats ? 'flex' : 'none';
                
                // Popula Dropdown de Animais (Apenas se NÃO for Casarão)
                if (animalSel) {
                    animalSel.innerHTML = '<option value="">SELECIONE O ANIMAL...</option>';
                    if (!isLodge) {
                        const filteredAnimals = config.filterAnimals([...items].sort());
                        filteredAnimals.forEach(a => animalSel.innerHTML += `<option value="${a}">${a}</option>`);
                    }
                }

                // Reseta Campos do Formulário
                const customNameInput = document.getElementById('um-custom-name');
                if (customNameInput) customNameInput.value = ''; // Começa vazio
                
                if (scoreInput) scoreInput.value = '';
                
                const dateInput = document.getElementById('um-date-input');
                if (dateInput) dateInput.valueAsDate = new Date();
                
                const furSel = document.getElementById('um-fur-select');
                if (furSel) furSel.innerHTML = '<option value="">PELAGEM...</option>';
                
                document.getElementById('upload-modal').style.display = 'flex'; 
            };
            reader.readAsDataURL(e.target.files[0]);
        }
    });

    safeAddEvent('um-animal-select', 'onchange', function() { updateFormAttributes(this.value); });

   // CORREÇÃO 2: Lógica de Salvamento com Sincronização Total (Fix Integração Álbum/Progresso)
    safeAddEvent('btn-modal-save', 'onclick', () => {
        try {
            const currentCategory = state.activeAlbumFilter || 'lodge';
            const isLodge = currentCategory === 'lodge';
            
            // Elementos do DOM
            const animalEl = document.getElementById('um-animal-select');
            const nameEl = document.getElementById('um-custom-name');
            const scoreEl = document.getElementById('um-score-input');
            const genderEl = document.getElementById('um-gender-select');
            const furEl = document.getElementById('um-fur-select');
            const dateEl = document.getElementById('um-date-input');

            // 1. Validação e Preparação
            let finalAnimal = '';
            let finalAnimalId = '';
            let finalFur = '';
            let finalGender = '';
            let finalScore = 0;
            let finalTitle = nameEl ? nameEl.value.trim() : '';

            if (isLodge) {
                finalAnimal = 'CASARÃO';
                finalAnimalId = 'lodge_entry';
                if (!finalTitle) finalTitle = 'Registro do Casarão';
            } else {
                if (!animalEl || !animalEl.value) return showToast('SELECIONE UM ANIMAL!', 'warning');
                finalAnimal = animalEl.value;
                finalAnimalId = normalizeKey(finalAnimal); // Slugify (ex: "faisao_de_pescoco_anelado")
                
                finalFur = furEl ? furEl.value : 'Comum';
                finalGender = genderEl ? genderEl.value : 'Macho';
                finalScore = scoreEl ? parseFloat(scoreEl.value) : 0;
            }

            // Tratamento de Data
            const rawDate = dateEl ? dateEl.value : null;
            const isoDate = rawDate ? new Date(rawDate).toISOString() : new Date().toISOString();
            const displayDate = new Date(isoDate).toLocaleDateString('pt-BR');

            // 2. Criação do Objeto para a Galeria Pessoal (Visual)
            const newTrophy = {
                id: Date.now(), 
                category: currentCategory,
                displayTitle: finalTitle,
                animal: finalAnimal,
                animalId: finalAnimalId, 
                gender: finalGender,
                fur: finalFur,
                score: finalScore,
                image: state.tempImage, 
                date: displayDate,
                sessionStats: null
            };

            // Captura de Stats Opcionais
            if (!isLodge) {
                const statsPanel = document.getElementById('um-stats-panel');
                if (statsPanel && statsPanel.style.display !== 'none') {
                    newTrophy.sessionStats = {
                        kills: parseInt(document.getElementById('um-stat-kills')?.value) || 0,
                        diamonds: parseInt(document.getElementById('um-stat-diamonds')?.value) || 0,
                        rares: parseInt(document.getElementById('um-stat-rares')?.value) || 0,
                        trolls: parseInt(document.getElementById('um-stat-trolls')?.value) || 0
                    };
                }
            }

            // 3. Persistência na Galeria Pessoal
            savedData.album.unshift(newTrophy);
            state.myAlbum = savedData.album; 

            // 4. SINCRONIZAÇÃO CRUZADA (O Pulo do Gato)
            // Grava os dados nas estruturas específicas que o detailView.js lê para marcar como concluído
            if (!isLodge) {
                // A. Sincronia para GREAT ONES
                if (currentCategory === 'great_one') {
                    if (!savedData.greats) savedData.greats = {};
                    if (!savedData.greats[finalAnimalId]) savedData.greats[finalAnimalId] = { furs: {} };
                    if (!savedData.greats[finalAnimalId].furs) savedData.greats[finalAnimalId].furs = {};
                    
                    // O detailView.js busca exatamente pelo nome da pelagem (ex: "Rubi Lendário")
                    if (!savedData.greats[finalAnimalId].furs[finalFur]) {
                        savedData.greats[finalAnimalId].furs[finalFur] = { trophies: [] };
                    }
                    
                    savedData.greats[finalAnimalId].furs[finalFur].trophies.push({
                        id: Date.now(),
                        date: isoDate,
                        stats: newTrophy.sessionStats || { kills: 0 }
                    });
                } 
                
                // B. Sincronia para DIAMANTES
                else if (currentCategory === 'diamond') {
                    if (!savedData.diamantes) savedData.diamantes = {};
                    if (!savedData.diamantes[finalAnimalId]) savedData.diamantes[finalAnimalId] = [];
                    
                    // O detailView.js monta a chave como "Gênero Pelagem" (ex: "Macho Albino")
                    const fullType = `${finalGender} ${finalFur}`;
                    
                    savedData.diamantes[finalAnimalId].push({
                        id: Date.now(),
                        type: fullType, 
                        score: finalScore
                    });
                }

                // C. Sincronia para RAROS (Pelagens)
                else if (currentCategory === 'rare') {
                    if (!savedData.pelagens) savedData.pelagens = {};
                    if (!savedData.pelagens[finalAnimalId]) savedData.pelagens[finalAnimalId] = {};
                    
                    const fullType = `${finalGender} ${finalFur}`;
                    savedData.pelagens[finalAnimalId][fullType] = true;
                }

                // D. Sincronia para SUPER RAROS
                else if (currentCategory === 'super_rare') {
                    if (!savedData.super_raros) savedData.super_raros = {};
                    if (!savedData.super_raros[finalAnimalId]) savedData.super_raros[finalAnimalId] = {};
                    
                    const fullType = `${finalGender} ${finalFur}`;
                    savedData.super_raros[finalAnimalId][fullType] = true;
                }
            }
            
            saveData(savedData);
            
            // Feedback e Fechamento
            document.getElementById('upload-modal').style.display = 'none';
            renderAlbum();
            showToast('REGISTRO SINCRONIZADO COM SUCESSO!', 'success');

        } catch (error) {
            console.error("Erro crítico ao salvar:", error);
            showToast('ERRO NO SISTEMA', 'error');
        }
    });

    // CORREÇÃO: Funcionalidade do botão CANCELAR (Fecha o Modal)
    safeAddEvent('btn-modal-cancel', 'onclick', () => {
        document.getElementById('upload-modal').style.display = 'none';
    });

    safeAddEvent('lightbox-close', 'onclick', () => document.getElementById('trophy-lightbox').style.display = 'none');
    safeAddEvent('btn-add-friend', 'onclick', () => {
        const input = document.getElementById('friend-id-input');
        if (!input) return;
        const id = input.value.trim().toUpperCase();
        if(!id || !MOCK_CLOUD_DB[id]) return showToast('ID NÃO ENCONTRADO', 'error');
        if(state.myFriends.includes(id)) return showToast('JÁ ADICIONADO', 'warning');
        state.myFriends.push(id); savedData.friendsList = state.myFriends; saveData(savedData);
        input.value = ''; renderFriends(); showToast('ALIADO CONECTADO', 'success');
    });

    safeAddEvent('btn-edit-id', 'onclick', () => {
        const n = prompt("Novo Codinome:", state.myId);
        if(n) { state.myId = n.toUpperCase(); savedData.playerId = state.myId; saveData(savedData); document.getElementById('display-player-id').textContent = `#${state.myId}`; }
    });

    document.querySelectorAll('.sub-btn').forEach(btn => btn.onclick = () => {
        document.querySelectorAll('.sub-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active'); state.activeAlbumFilter = btn.dataset.filter; renderAlbum();
    });

    // INIT
    renderFriends();
    if(document.getElementById('display-player-id')) document.getElementById('display-player-id').textContent = `#${state.myId}`;
}