const saveDataKey = 'theHunterAlbumData';
function loadData() {
    const data = localStorage.getItem(saveDataKey);
    return data ? JSON.parse(data) : {};
}
function saveData(data) {
    localStorage.setItem(saveDataKey, JSON.stringify(data));
    updateProgressPanel();
}
const savedData = loadData();

// --- LÓGICA FINAL E CORRIGIDA ---
const femaleOnlyDiamondSpecies = [
    "lebre_nuca_dourada",
    "lebre_europeia",
    "codorniz_da_virginia",
    "castor_norte_americano"
];
const maleAndFemaleDiamondSpecies = [
    "lebre_peluda",
    "raposa_cinzenta",
    "lebre_da_eurasia", // Alias para lebre_europeia, tratando como M/F
    "coelho_da_florida",
    "oryx_do_cabo"
];


const rareFursData = { "alce": { macho: ["Albino", "Melanístico", "Malhado", "Café"], femea: ["Albino", "Melanístico", "Malhado"] }, "antilocapra": { macho: ["Albino", "Malhado", "Leucismo"], femea: ["Albino", "Malhado", "Leucismo"] }, "antílope_negro": { macho: ["Albino", "Melânico", "Malhado", "Leucismo"], femea: ["Albino", "Melânico", "Malhado", "Leucismo"] }, "bantengue": { macho: ["Albino", "Melânico"], femea: ["Albino", "Melânico"] }, "bisão_das_planícies": { macho: ["Albino", "Melânico", "Leucismo"], femea: ["Albino", "Melânico", "Leucismo"] }, "bisão_europeu": { macho: ["Albino", "Melânico", "Malhado"], femea: ["Albino", "Melânico", "Malhado"] }, "búfalo_africano": { macho: ["Albino", "Leucismo"], femea: ["Albino", "Leucismo"] }, "búfalo_d'água": { macho: ["Albino", "Laranja"], femea: ["Albino", "Laranja"] }, "cabra_da_montanha": { macho: ["Albino", "Melânico"], femea: ["Albino", "Melânico"] }, "cabra_de_leque": { macho: ["Albino"], femea: ["Albino"] }, "cabra_selvagem": { macho: ["Albino", "Preto", "Cores Mistas"], femea: ["Albino", "Preto", "Cores Mistas"] }, "caititu": { macho: ["Albino", "Melânico", "Ochre", "Leucismo"], femea: ["Albino", "Melânico", "Ochre", "Leucismo"] }, "camurça": { macho: ["Albino", "Melânico", "Leucismo"], femea: ["Albino", "Melânico", "Leucismo"] }, "canguru_cinza_oriental": { macho: ["Albino", "Melânico", "Leucismo"], femea: ["Albino", "Melânico", "Leucismo"] }, "caribu": { macho: ["Albino", "Melânico", "Malhado", "Leucismo"], femea: ["Albino", "Melânico", "Malhado", "Leucismo"] }, "carneiro_azul": { macho: ["Albino", "Melânico", "Leucismo"], femea: ["Albino", "Melânico", "Leucismo"] }, "carneiro_selvagem": { macho: ["Albino"], femea: ["Albino"] }, "cervo_porco_indiano": { macho: ["Malhado", "Leucismo"], femea: ["Malhado", "Leucismo"] }, "cervo_almiscarado": { macho: ["Albino", "Melânico", "Malhado"], femea: [] }, "cervo_de_timor": { macho: ["Albino", "Melânico", "Malhado"], femea: ["Albino", "Melânico", "Malhado"] }, "cervo_do_pântano": { macho: ["Albino", "Malhado", "Leucismo"], femea: ["Albino", "Malhado", "Leucismo"] }, "cervo_sika": { macho: ["Albino", "Melânico", "Malhado", "Leucismo"], femea: ["Albino", "Melânico", "Malhado", "Leucismo"] }, "chital": { macho: ["Albino", "Manchado Vermelho"], femea: ["Albino", "Manchado Vermelho"] }, "chacal_listrado": { macho: ["Albino", "Melânico"], femea: ["Albino", "Melânico"] }, "codorna_de_restolho": { macho: ["Albino", "Pardo Escuro"], femea: ["Albino", "Pardo Escuro"] }, "codorniz_da_virgínia": { macho: ["Albino"], femea: ["Albino"] }, "coelho_da_flórida": { macho: ["Albino"], femea: ["Albino"] }, "coelho_europeu": { macho: ["Albino", "Melânico", "Leucismo"], femea: ["Albino", "Melânico", "Leucismo"] }, "coiote": { macho: ["Albino", "Melânico", "Cinza claro", "Leucismo"], femea: ["Albino", "Melânico", "Cinza claro", "Leucismo"] }, "corça": { macho: ["Albino", "Melânico", "Malhado"], femea: ["Albino", "Melânico", "Malhado"] }, "crocodilo_de_água_salgada": { macho: ["Albino", "Melânico", "Malhado", "Leucismo", "Pardo Claro"], femea: ["Albino", "Melânico", "Malhado", "Leucismo", "Pardo Claro"] }, "cudo_menor": { macho: ["Albino", "Melânico", "Cinzento", "Marrom avermelhado"], femea: ["Albino", "Melânico", "Cinzento", "Marrom avermelhado"] }, "cão_guaxinim": { macho: ["Albino", "Laranja", "Malhado", "Pardo escuro"], femea: ["Albino", "Laranja", "Malhado", "Pardo escuro"] }, "faisão_de_pescoço_anelado": { macho: ["Albino", "Melânico", "Leucismo"], femea: ["Albino", "Melânico", "Leucismo"] }, "faisão": { macho: ["Albino", "Melânico", "Leucismo"], femea: ["Albino", "Melânico", "Leucismo"] }, "frisada": { macho: ["Albino", "Melânico", "Leucismo"], femea: ["Albino", "Melânico", "Leucismo"] }, "galinha_montês": { macho: ["Pálida", "Híbrido", "Escuro"], femea: ["Pálida", "Híbrido", "Escuro"] }, "galo_lira": { macho: ["Laranja", "Melânico", "Ouro", "Leucismo"], femea: ["Laranja", "Melânico", "Ouro", "Leucismo"] }, "gamo": { macho: ["Albino", "Melânico", "Malhado"], femea: ["Albino", "Melânico", "Malhado"] }, "ganso_bravo": { macho: ["Híbrido", "Leucismo"], femea: ["Híbrido", "Leucismo"] }, "ganso_campestre_da_tundra": { macho: ["Leucismo"], femea: ["Leucismo"] }, "ganso_pega": { macho: ["Melânico", "Malhado", "Leucismo"], femea: ["Melânico", "Malhado", "Leucismo"] }, "ganso_do_canadá": { macho: ["Cinza", "Melânico", "Leucismo manchas escuras", "Leucismo cinza claro"], femea: ["Cinza", "Melânico", "Leucismo manchas escuras", "Leucismo cinza claro"] }, "gnu_de_cauda_preta": { macho: ["Albino", "Coroado"], femea: ["Albino", "Coroado"] }, "guaxinim_comum": { macho: ["Albino", "Melânico", "loiro malhado", "cinza malhado"], femea: ["Albino", "Melânico", "loiro malhado", "cinza malhado"] }, "iaque_selvagem": { macho: ["Albino", "Ouro", "Leucismo"], femea: ["Albino", "Ouro", "Leucismo"] }, "ibex_de_beceite": { macho: ["Albino", "Melânico"], femea: ["Albino", "Melânico"] }, "jacaré_americano": { macho: ["Albino", "Melânico", "Malhado"], femea: ["Albino", "Melânico", "Malhado"] }, "javali": { macho: ["Albino", "Melânico", "preto e dourado"], femea: ["Albino", "Melânico", "preto e dourado"] }, "javali_africano": { macho: ["Albino", "Vermelho"], femea: ["Albino", "Vermelho"] }, "lagópode_branco": { macho: ["Branco"], femea: ["Branco"] }, "lagópode_escocês": { macho: ["Branco", "Vermelho"], femea: ["Branco", "Vermelho"] }, "lebre_antílope": { macho: ["Albino", "Melânico"], femea: ["Albino", "Melânico"] }, "lebre_da_eurásia": { macho: ["Albino", "Muda", "Branco"], femea: ["Albino", "Muda", "Branco"] }, "lebre_peluda": { macho: ["Albino", "Branco"], femea: ["Albino", "Branco"] }, "lebre_da_cauda_branca": { macho: ["Albino"], femea: ["Albino"] }, "lebre_nuca_dourada": { macho: ["cinza claro"], femea: ["cinza claro"] }, "lebre_europeia": { macho: ["Albino", "Melânico"], femea: ["Albino", "Melânico"] }, "leopardo_das_neves": { macho: ["Albino", "Melânico", "Leucismo"], femea: ["Albino", "Melânico", "Leucismo"] }, "leão": { macho: ["Albino", "amarelado", "pardo escuro"], femea: ["Albino", "amarelado", "pardo escuro"] }, "lince_pardo_do_méxico": { macho: ["Albino", "Melânico", "Azul"], femea: ["Albino", "Melânico", "Azul"] }, "lince_euroasiática": { macho: ["Albino", "Melânico", "Malhado"], femea: ["Albino", "Melânico", "Malhado"] }, "lobo_cinzento": { macho: ["Albino", "Melânico", "cinza escuro", "clara de ovo", "marrom averelhado"], femea: ["Albino", "Melânico", "cinza escuro", "clara de ovo", "marrom averelhado"] }, "lobo_ibérico": { macho: ["Albino", "Melânico", "fantasma", "ogro", "sombra", "inverno", "oliva", "prístino"], femea: ["Albino", "Melânico", "fantasma", "ogro", "sombra", "inverno", "oliva", "prístino"] }, "marreca_carijó": { macho: ["bege", "Melânico"], femea: ["bege", "Melânico"] }, "marrequinha_comum": { macho: ["híbrido azul", "híbrido verde", "Leucismo"], femea: ["híbrido azul", "híbrido verde", "Leucismo"] }, "marrequinha_americana": { macho: ["Albino", "Malhado"], femea: ["Albino", "Malhado"] }, "muflão_ibérico": { macho: ["Albino", "Melânico", "cinza"], femea: ["Albino", "Melânico", "cinza"] }, "muntjac_vermelho_do_norte": { macho: ["Albino", "Melânico", "Leucismo"], femea: ["Albino", "Melânico", "Leucismo"] }, "nilgó": { macho: ["Malhado"], femea: ["Malhado"] }, "onça_parda": { macho: ["Albino", "Melânico"], femea: ["Albino", "Melânico"] }, "oryx_do_cabo": { macho: ["bege", "escuro", "ouro"], femea: ["bege", "escuro", "ouro"] }, "pato_olho_de_ouro": { macho: ["híbrido", "eclipse", "escuro", "Leucismo"], femea: ["híbrido", "eclipse", "escuro", "Leucismo"] }, "pato_harlequim": { macho: ["Albino", "Melânico", "cinza", "escuro"], femea: ["Albino", "Melânico", "cinza", "escuro"] }, "pato_real": { macho: ["Melânico", "amarelado", "Leucismo"], femea: ["Melânico", "amarelado", "Leucismo"] }, "peru": { macho: ["Albino", "Melânico", "Leucismo"], femea: ["Albino", "Melânico", "Leucismo"] }, "peru_selvagem": { macho: ["Albino", "Melânico", "Leucismo"], femea: ["Albino", "Melânico", "Leucismo"] }, "peru_selvagem_do_rio_grande": { macho: ["Albino", "Melânico", "Leucismo"], femea: ["Albino", "Melânico", "Leucismo"] }, "piadeira": { macho: ["híbrido", "eclipse", "escuro", "Leucismo"], femea: ["híbrido", "eclipse", "escuro", "Leucismo"] }, "porco_selvagem": { macho: ["Albino", "rosa"], femea: ["Albino", "rosa"] }, "raposa_tibetana": { macho: ["Albino", "Melânico", "areia", "esfumaçado", "Leucismo"], femea: ["Albino", "Melânico", "areia", "esfumaçado", "Leucismo"] }, "raposa_cinzenta": { macho: ["Albino", "Melânico", "Malhado", "Leucismo"], femea: ["Albino", "Melânico", "Malhado", "Leucismo"] }, "raposa_vermelha": { macho: ["Albino", "Melânico", "Malhado"], femea: ["Albino", "Melânico", "Malhado"] }, "rena": { macho: ["Albino", "Melânico", "Malhado", "Leucismo"], femea: ["Albino", "Melânico", "Malhado", "Leucismo"] }, "sambar": { macho: ["Albino", "Malhado", "Leucismo"], femea: ["Albino", "Malhado", "Leucismo"] }, "tahr": { macho: ["Albino", "branco", "vermelho", "pardo escuro", "preto", "vermelho escuro"], femea: ["Albino", "branco", "vermelho", "pardo escuro", "preto", "vermelho escuro"] }, "tetraz_grande": { macho: ["pale", "Leucismo"], femea: ["pale", "Leucismo"] }, "tigre_de_bengala": { macho: ["Albino", "Melânico", "branco", "branco sem listras", "ouro", "pseudo melânico", "pseudo melânico branco"], femea: ["Albino", "Melânico", "branco", "branco sem listras", "ouro", "pseudo melânico", "pseudo melânico branco"] }, "urso_cinzento": { macho: ["Albino", "Melanístico", "Marrom"], femea: ["Albino", "Melanístico", "Marrom"] }, "urso_negro": { macho: ["Amarelado", "Marrom", "canela"], femea: ["Amarelado", "Marrom", "canela"] }, "urso_pardo": { macho: ["Albino", "Melanístico"], femea: ["Albino", "Melanístico"] }, "veado_das_montanhas_rochosas": { macho: ["Albino", "Malhado"], femea: ["Albino", "Malhado"] }, "veado_de_cauda_branca": { macho: ["Albino", "Melânico", "Malhado"], femea: ["Albino", "Melânico", "Malhado"] }, "veado_de_cauda_preta": { macho: ["Albino", "Melânico", "Malhado"], femea: ["Albino", "Melânico", "Malhado"] }, "veado_de_roosevelt": { macho: ["Albino", "Melânico", "Malhado"], femea: ["Albino", "Melânico", "Malhado"] }, "veado_mula": { macho: ["Albino", "Melânico", "Malhado", "diluído"], femea: ["Albino", "Melânico", "Malhado", "diluído"] }, "veado_vermelho": { macho: ["Albino", "Melânico", "Malhado"], femea: ["Albino", "Melânico", "Malhado"] }, "zarro_negrinha": { macho: ["Albino", "eclipse", "creme", "Leucismo"], femea: ["Albino", "eclipse", "creme", "Leucismo"] }, "zarro_castanho": { macho: ["Albino", "Melânico", "Leucismo"], femea: ["Albino", "Melânico", "Leucismo"] }, "ibex_espanhol_do_sudeste": { macho: ["Albino", "Melânico"], femea: ["Albino", "Melânico"] }, "ibex_de_gredos": { macho: ["Albino", "Melânico"], femea: ["Albino", "Melânico"] }, "ibex_de_ronda": { macho: ["Albino", "Melânico"], femea: ["Albino", "Melânico"] }, "tetraz_azul": { macho: ["Albino", "Melânico", "Leucismo"], femea: ["Albino", "Melânico", "Leucismo"] }, "marreca_arrebio": { macho: ["Albino", "Melânico", "Leucismo", "malhado"], femea: ["Albino", "Melânico", "Leucismo", "malhado"] }, "ganso_das_neves": { macho: ["Albino", "Melânico"], femea: ["Albino", "Melânico"] }, "pato_carolino": { macho: ["Albino", "Prata Diluída", "Dourado Eritrístico", "Leucísmo", "Melânico", "Malhado"], femea: ["Albino", "Prata Diluída", "Dourado Eritrístico", "Leucísmo", "Melânico", "Malhado"] }, "castor_norte_americano": { macho: ["Albino", "Melânico", "Leucismo"], femea: ["Albino", "Melânico", "Leucismo"] }, "caribu_da_floresta_boreal": { macho: ["Albino", "Melânico", "Leucismo"], femea: ["Albino", "Melânico", "Leucismo"] }, "cervo_canadense": { macho: ["Albino", "Melânico", "Leucismo"], femea: ["Albino", "Melânico", "Leucismo"] }, "bisão_da_floresta": { macho: ["Albino", "Melânico", "Leucismo"], femea: ["Albino", "Melânico", "Leucismo"] } };
const greatsFursData = { "alce": ["Fábula Dois Tons", "Cinza lendário", "Bétula lendária", "Carvalho Fabuloso", "Fabuloso Salpicado", "Abeto lendário"], "urso_negro": ["Creme Lendário", "Espírito Lendário", "Castanho Lendário", "Pintado Lendário", "Gelo Lendário 2", "Gelo Lendário"], "veado_de_cauda_branca": ["Pardo", "Pardo Escuro", "Bronzeado", "Malhado"], "gamo": ["Café Lendário", "Pintado Lendário", "Dourado Lendário", "Misto Lendário", "Prata Lendário"], "raposa": ["A lendária Lua de Sangue", "Bengala de doce lendária", "A lendária flor de cerejeira", "Alcaçuz lendário", "A lendária papoula da meia-noite", "Floco de Neve Místico Fabuloso", "Hortelã-pimenta lendária", "Fábula Rosebud Frost", "A lendária Beladona Escarlate"], "veado_vermelho": ["Pintado Lendário"], "tahr": ["Dourado Lendário", "Cicatrizes Lendárias", "Cinza Lendário", "Café com Leite Lendário", "Crânio Lendário", "Metade Lendária", "Neve Lendário"], "veado_mula": ["Chuva de Gotículas Lendárias", "Via Láctea Lendária", "Sopro de Pétalas Lendário", "Manto Crepuscular Lendário", "Enigma Teia de Aranha Lendário", "Listras de Canela Lendário"], "faisão": ["Rubi Lendário", "Pérola Lendário", "Granada Lendário", "Safira Lendário", "Obsidiana Lendário", "Citrino Lendário", "Esmeralda Lendário", "Morganita Lendário"] };
const items = ["Alce","Antilocapra","Antílope Negro","Bantengue","Bisão da Floresta","Bisão das Planícies","Bisão Europeu","Búfalo Africano","Búfalo D'Água","Cabra da Montanha","Cabra de Leque","Cabra Selvagem","Caititu","Camurça","Canguru-cinza Oriental","Caribu","Caribu da Floresta Boreal","Carneiro Azul","Carneiro Selvagem","Castor Norte-Americano","Cervo Almiscarado","Cervo Canadense","Cervo do Pântano","Cervo de Timor","Cervo Sika","Cervo-porco Indiano","Chital","Codorna-de-restolho","Codorniz da Virgínia","Coelho da Flórida","Coelho Europeu","Coiote","Corça","Crocodilo de Água Salgada","Cudo Menor","Faisão de Pescoço Anelado","Frisada","Galo Lira","Gamo","Ganso Bravo","Ganso Campestre da Tundra","Ganso das Neves","Ganso do Canadá","Ganso Pega","Gnu de Cauda Preta","Guaxinim Comum","Iaque Selvagem","Ibex de Beceite","Ibex de Gredos","Ibex de Ronda","Ibex Espanhol do Sudeste","Jacaré Americano","Javali","Javali Africano","Lebre-antílope","Lebre-da-cauda-branca","Lebre Da Eurásia","Lebre Nuca Dourada","Lebre Peluda","Leão","Leopardo das Neves","Lince Euroasiática","Lince Pardo do México","Lobo Cinzento","Lobo Ibérico","Marreca Arrebio","Marreca Carijó","Marrequinha Americana","Marrequinha Comum","Muflão Ibérico","Muntjac vermelho do norte","Nilgó","Onça Parda","Oryx do Cabo","Pato Carolino","Pato Harlequim","Pato Olho de Ouro","Pato Real","Peru","Peru Selvagem","Peru Selvagem do Rio Grande","Piadeira","Porco Selvagem","Raposa cinzenta","Raposa tibetana","Raposa Vermelha","Rena","Sambar","Tahr","Tetraz Azul","Tetraz Grande","Tigre-de-Bengala","Urso Cinzento","Urso Negro","Urso Pardo","Veado das Montanhas Rochosas","Veado de Cauda Branca","Veado de Cauda Preta","Veado-Mula","Veado de Roosevelt","Veado Vermelho","Cão Guaxinim","Lagópode-Branco","Lagópode-Escocês","Galinha-Montês","Zarro-Negrinha","Zarro-castanho"];
const superRareAnimals = Object.keys(rareFursData).filter(slug => { const furs = rareFursData[slug]; return (furs.macho && furs.macho.length > 0) || (furs.femea && furs.femea.length > 0); }).map(slug => { return items.find(item => slugify(item) === slug) || slug; });
const categorias = { pelagens: items, diamantes: [...items], greats: ["Alce","Urso Negro","Veado-Mula","Veado Vermelho","Veado-de-cauda-branca","Raposa","Faisão","Gamo","Tahr"], super_raros: superRareAnimals };

function slugify(text) { return text.toLowerCase().replace(/[-\s]+/g, '_'); }
function checkAndSetGreatOneCompletion(slug, currentData) { const requiredFurs = greatsFursData[slug]; if (!requiredFurs) { currentData.completo = false; return; }; const allComplete = requiredFurs.every(furName => currentData.furs?.[furName]?.completed === true ); currentData.completo = allComplete; }
function checkAndSetSuperRaroCompletion(slug, currentData) { const fursInfo = rareFursData[slug]; if (!fursInfo) { currentData.completo = false; return; } const allFurs = [...new Set([...(fursInfo.macho || []), ...(fursInfo.femea || [])])]; const allComplete = allFurs.every(furName => currentData.combinations?.[furName]?.completed === true ); currentData.completo = allComplete; }

function updateCardAppearance(card, slug, tabKey) {
    card.classList.remove('card-unstarted', 'card-inprogress', 'card-all-done');
    const animalData = savedData[tabKey]?.[slug] || {};

    let isComplete = false;
    let isInProgress = false;

    if (tabKey === 'pelagens') {
        const fursInfo = rareFursData[slug];
        if (fursInfo) {
            const totalFurs = (fursInfo.macho?.length || 0) + (fursInfo.femea?.length || 0);
            const completedCount = Object.values(animalData).filter(val => val === true).length;
            if (completedCount > 0) isInProgress = true;
            if (totalFurs > 0 && completedCount === totalFurs) isComplete = true;
            
            const counterDiv = card.querySelector('.missing-counter');
             if(counterDiv) {
                if (totalFurs === 0) {
                    counterDiv.style.display = 'none';
                } else {
                    const missingCount = totalFurs - completedCount;
                    counterDiv.textContent = missingCount > 0 ? missingCount : '✓';
                    counterDiv.style.display = 'block';
                }
            }
        }
    } else if (tabKey === 'diamantes') {
        // Lógica de "completo" para diamantes: ter score de macho OU de fêmea, dependendo do que é aplicável.
        if ((animalData.macho && animalData.macho.score) || (animalData.femea && animalData.femea.score)) {
            isComplete = true;
        }
    } else if (tabKey === 'greats' || tabKey === 'super_raros') {
        if (animalData.completo) {
            isComplete = true;
        }
    }

    if (isComplete) {
        card.classList.add('card-all-done');
    } else if (isInProgress) {
        card.classList.add('card-inprogress');
    }
}

function toggleDetails(card, tabKey, name) {
    const existing = card.querySelector('.details');
    if (existing) { existing.remove(); return; }
    const detailDiv = document.createElement('div');
    detailDiv.className = 'details';
    const slug = slugify(name);
    if (!savedData[tabKey]) savedData[tabKey] = {};
    const animalData = savedData[tabKey][slug] || {};
    let detailsHTML = '';
    
    if (tabKey === 'diamantes') {
        const createTrophyHTML = (gender) => {
            const genderKey = gender.toLowerCase();
            const genderData = animalData[genderKey] || {};
            return `
                <div class="trophy-card">
                    <h4>Troféu de ${gender}</h4>
                    <table>
                        <tbody>
                            <tr><td>Pontuação do Troféu</td><td><input type="number" step="0.1" name="${genderKey}Score" placeholder="0.0" value="${genderData.score || ''}"></td></tr>
                            <tr><td>Peso</td><td><input type="number" step="0.1" name="${genderKey}Peso" placeholder="0.0" value="${genderData.peso || ''}"></td></tr>
                        </tbody>
                    </table>
                </div>
            `;
        };

        // --- LÓGICA FINAL DOS 3 GRUPOS ---
        if (maleAndFemaleDiamondSpecies.includes(slug)) {
            detailsHTML = createTrophyHTML('Macho') + createTrophyHTML('Fêmea');
        } else if (femaleOnlyDiamondSpecies.includes(slug)) {
            detailsHTML = createTrophyHTML('Fêmea');
        } else {
            detailsHTML = createTrophyHTML('Macho');
        }

    } else if (tabKey === 'pelagens') {
        const fursInfo = rareFursData[slug];
        if (fursInfo) {
            const generateFurList = (furs, gender) => furs.map(fur => {
                const uniqueKey = `${gender}_${fur}`;
                return `<div class="fur-item ${animalData[uniqueKey] ? 'completed' : ''}" data-fur-name="${fur}" data-gender="${gender}">${fur}</div>`
            }).join('');
            detailsHTML = `<div class="fur-table">
                <div class="fur-column"><h4>PELAGEM MACHO</h4><div class="fur-list">${generateFurList(fursInfo.macho || [], 'macho')}</div></div>
                <div class="fur-column"><h4>PELAGEM FÊMEA</h4><div class="fur-list">${generateFurList(fursInfo.femea || [], 'femea')}</div></div>
            </div>`;
        } else { detailsHTML = '<p>Nenhuma pelagem rara registrada para este animal.</p>'; }
    } else if (tabKey === 'greats') {
        const greatFurs = greatsFursData[slug];
        if (greatFurs && greatFurs.length > 0) {
            detailsHTML = greatFurs.map(furName => {
                const furSlug = slugify(furName);
                const furData = animalData.furs?.[furName] || {};
                const isCompleted = furData.completed ? 'completed' : '';
                const imagePath = `animais/great_${slug}_${furSlug}.png`;
                return `<div class="great-one-fur-row ${isCompleted}" data-fur-name="${furName}"><div class="great-one-fur-photo"><img src="${imagePath}" alt="Foto de ${furName}"></div><div class="great-one-fur-content"><h4>${furName}</h4><table><tbody><tr><td>Qtd. abates</td><td><input type="number" name="abates" data-fur-name="${furName}" value="${furData.abates || ''}" placeholder="0"></td></tr><tr><td>Qtd. diamantes</td><td><input type="number" name="diamantes" data-fur-name="${furName}" value="${furData.diamantes || ''}" placeholder="0"></td></tr><tr><td>Qtd. Peles Raras</td><td><input type="number" name="peleRara" data-fur-name="${furName}" value="${furData.peleRara || ''}" placeholder="0"></td></tr></tbody></table></div></div>`;
            }).join('');
        } else { detailsHTML = '<p>Nenhuma pelagem de Great One registrada para este animal.</p>'; }
    } else if (tabKey === 'super_raros') {
        const fursInfo = rareFursData[slug];
        const allFurs = [...new Set([...(fursInfo.macho || []), ...(fursInfo.femea || [])])];
        if (allFurs.length > 0) {
            detailsHTML = allFurs.map(furName => {
                const comboData = animalData.combinations?.[furName] || {};
                const isCompleted = comboData.completed ? 'completed' : '';
                const isVisible = comboData.completed ? 'visible' : '';
                return `<div class="super-rare-combo-row ${isCompleted}" data-fur-name="${furName}"><div class="super-rare-combo-content"><h4>${furName} Diamante</h4><div class="image-link-container ${isVisible}"><input type="text" placeholder="Cole o link da imagem aqui..." value="${comboData.image || ''}" data-fur-name="${furName}" name="imageLink"></div></div></div>`;
            }).join('');
        } else { detailsHTML = '<p>Nenhuma combinação de Super Raro para este animal.</p>'; }
    } else { detailsHTML = '<p>Detalhes a serem adicionados...</p>'; }
    
    detailDiv.innerHTML = `<h3>${name}</h3>${detailsHTML}`;
    card.append(detailDiv);

    const updateAndSave = () => { saveData(savedData); updateCardAppearance(card, slug, tabKey); };

    if (tabKey === 'diamantes') {
        detailDiv.querySelectorAll('input').forEach(input => {
            input.addEventListener('input', () => {
                const gender = input.name.includes('macho') ? 'macho' : 'femea';
                const field = input.name.endsWith('Score') ? 'score' : 'peso';
                
                if (!animalData[gender]) animalData[gender] = {};
                animalData[gender][field] = input.value;
                
                savedData[tabKey][slug] = animalData;
                updateAndSave();
            });
        });
    } else if (tabKey === 'pelagens') {
        detailDiv.querySelectorAll('.fur-item').forEach(item => {
            item.addEventListener('click', () => {
                const furName = item.dataset.furName;
                const gender = item.dataset.gender;
                const uniqueKey = `${gender}_${furName}`;
                animalData[uniqueKey] = !animalData[uniqueKey];
                savedData[tabKey][slug] = animalData;
                item.classList.toggle('completed');
                updateAndSave();
            });
        });
    } else if (tabKey === 'super_raros') {
        detailDiv.querySelectorAll('.super-rare-combo-row').forEach(row => { row.addEventListener('click', (event) => { if (event.target.tagName.toLowerCase() === 'input') return; const furName = row.dataset.furName; if (!animalData.combinations) animalData.combinations = {}; if (!animalData.combinations[furName]) animalData.combinations[furName] = {}; animalData.combinations[furName].completed = !animalData.combinations[furName].completed; row.classList.toggle('completed'); row.querySelector('.image-link-container').classList.toggle('visible'); checkAndSetSuperRaroCompletion(slug, animalData); savedData[tabKey][slug] = animalData; updateAndSave(); }); });
        detailDiv.querySelectorAll('input[name="imageLink"]').forEach(input => { input.addEventListener('input', () => { const furName = input.dataset.furName; if (!animalData.combinations) animalData.combinations = {}; if (!animalData.combinations[furName]) animalData.combinations[furName] = {}; animalData.combinations[furName].image = input.value; savedData[tabKey][slug] = animalData; updateAndSave(); }); });
    } else if (tabKey === 'greats') {
        detailDiv.addEventListener('click', (event) => {
            const row = event.target.closest('.great-one-fur-row');
            if (row && tabKey === 'greats') { if (event.target.tagName.toLowerCase() === 'input') return; const furName = row.dataset.furName; if (!animalData.furs) animalData.furs = {}; if (!animalData.furs[furName]) animalData.furs[furName] = {}; animalData.furs[furName].completed = !animalData.furs[furName].completed; row.classList.toggle('completed'); checkAndSetGreatOneCompletion(slug, animalData); savedData[tabKey][slug] = animalData; updateAndSave(); }
        });
        detailDiv.addEventListener('input', (event) => {
            if(event.target.matches('input[data-fur-name]')) { const furName = event.target.dataset.furName; const fieldName = event.target.name; if (!animalData.furs) animalData.furs = {}; if (!animalData.furs[furName]) animalData.furs[furName] = {}; animalData.furs[furName][fieldName] = event.target.value; }
            savedData[tabKey][slug] = animalData;
            updateAndSave();
        });
    }
}
function updateProgressPanel() {
    const data = savedData;
    const totalPelagens = Object.values(rareFursData).reduce((acc, furs) => acc + (furs.macho?.length || 0) + (furs.femea?.length || 0), 0);
    const obtidasPelagens = Object.values(data.pelagens || {}).reduce((acc, animal) => acc + Object.values(animal).filter(v => v === true).length, 0);
    document.getElementById('progress-pelagens').value = obtidasPelagens; document.getElementById('progress-pelagens').max = totalPelagens; document.getElementById('stats-pelagens').textContent = `Obtidas: ${obtidasPelagens} / ${totalPelagens}`; document.getElementById('missing-pelagens').textContent = `Faltam: ${totalPelagens - obtidasPelagens}`;
    
    const totalDiamantes = categorias.diamantes.length;
    const obtidosDiamantes = Object.values(data.diamantes || {}).filter(animal => (animal.macho && animal.macho.score) || (animal.femea && animal.femea.score)).length;
    document.getElementById('progress-diamantes').value = obtidosDiamantes; document.getElementById('progress-diamantes').max = totalDiamantes; document.getElementById('stats-diamantes').textContent = `Obtidos: ${obtidosDiamantes} / ${totalDiamantes}`; document.getElementById('missing-diamantes').textContent = `Faltam: ${totalDiamantes - obtidosDiamantes}`;

    const totalGreats = Object.values(greatsFursData).reduce((acc, furs) => acc + furs.length, 0);
    const obtidosGreats = Object.values(data.greats || {}).reduce((acc, animal) => acc + Object.values(animal.furs || {}).filter(f => f.completed).length, 0);
    document.getElementById('progress-greats').value = obtidosGreats; document.getElementById('progress-greats').max = totalGreats; document.getElementById('stats-greats').textContent = `Obtidos: ${obtidosGreats} / ${totalGreats}`; document.getElementById('missing-greats').textContent = `Faltam: ${totalGreats - obtidosGreats}`;
    const totalSuperRaros = categorias.super_raros.reduce((acc, animalName) => { const slug = slugify(animalName); const fursInfo = rareFursData[slug]; if (!fursInfo) return acc; return acc + new Set([...(fursInfo.macho || []), ...(fursInfo.femea || [])]).size; }, 0);
    const obtidosSuperRaros = Object.values(data.super_raros || {}).reduce((acc, animal) => acc + Object.values(animal.combinations || {}).filter(c => c.completed).length, 0);
    document.getElementById('progress-super_raros').value = obtidosSuperRaros; document.getElementById('progress-super_raros').max = totalSuperRaros;
    document.getElementById('stats-super_raros').textContent = `Obtidos: ${obtidosSuperRaros} / ${totalSuperRaros}`;
    document.getElementById('missing-super_raros').textContent = `Faltam: ${totalSuperRaros - obtidosSuperRaros}`;
}
Object.entries(categorias).forEach(([key, names]) => {
    const container = document.getElementById(`album-${key}`);
    if (!container) return;
    [...new Set(names)].sort((a, b) => a.localeCompare(b)).forEach(name => {
        const card = document.createElement('div');
        card.className = 'card';
        const slug = slugify(name);
        card.innerHTML = `<img src="animais/${slug}.png" alt="${name}"><div class="info">${name}</div><div class="missing-counter"></div>`;
        card.addEventListener('click', (event) => { if (event.target.closest('.details')) return; toggleDetails(card, key, name) });
        container.append(card);
        updateCardAppearance(card, slug, key);
    });
});
document.querySelectorAll('.tab-button').forEach(btn => {
    btn.addEventListener('click', () => {
        document.querySelectorAll('.tab-button').forEach(b => b.classList.remove('active'));
        document.querySelectorAll('.tab-content').forEach(t => t.classList.remove('active'));
        btn.classList.add('active');
        document.getElementById(btn.dataset.target).classList.add('active');
    });
});
document.querySelectorAll('.filter-input').forEach(input => {
    input.addEventListener('input', (event) => {
        const searchTerm = event.target.value.toLowerCase();
        const albumId = event.target.dataset.target;
        const album = document.getElementById(albumId);
        album.querySelectorAll('.card').forEach(card => {
            const animalName = card.querySelector('.info').textContent.toLowerCase();
            if (animalName.includes(searchTerm)) {
                card.style.display = 'flex';
            } else {
                card.style.display = 'none';
            }
        });
    });
});
updateProgressPanel();