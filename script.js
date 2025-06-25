const saveDataKey = 'theHunterAlbumData';

function loadData() {
    try {
        const data = localStorage.getItem(saveDataKey);
        return data ? JSON.parse(data) : {};
    } catch (e) {
        console.error("Erro ao carregar dados do localStorage", e);
        return {};
    }
}

function saveData(data) {
    try {
        localStorage.setItem(saveDataKey, JSON.stringify(data));
        if (document.getElementById('progress-panel')) {
            updateProgressPanel();
        }
    } catch (e) {
        console.error("Erro ao salvar dados no localStorage", e);
    }
}

const savedData = loadData();
const femaleOnlyDiamondSpecies = ["lebre_nuca_dourada", "lebre_europeia", "codorniz_da_virginia", "castor_norte_americano"];
const maleAndFemaleDiamondSpecies = ["lebre_peluda", "raposa_cinzenta", "lebre_da_eurasia", "coelho_da_florida", "oryx_do_cabo"];
const rareFursData = { "alce": { macho: ["Albino", "Melanístico", "Malhado", "Café"], femea: ["Albino", "Melanístico", "Malhado"] }, "antilocapra": { macho: ["Albino", "Malhado", "Leucismo"], femea: ["Albino", "Malhado", "Leucismo"] }, "antílope_negro": { macho: ["Albino", "Melânico", "Malhado", "Leucismo"], femea: ["Albino", "Melânico", "Malhado", "Leucismo"] }, "bantengue": { macho: ["Albino", "Melânico"], femea: ["Albino", "Melânico"] }, "bisão_das_planícies": { macho: ["Albino", "Melânico", "Leucismo"], femea: ["Albino", "Melânico", "Leucismo"] }, "bisão_europeu": { macho: ["Albino", "Melânico", "Malhado"], femea: ["Albino", "Melânico", "Malhado"] }, "búfalo_africano": { macho: ["Albino", "Leucismo"], femea: ["Albino", "Leucismo"] }, "búfalo_d'água": { macho: ["Albino", "Laranja"], femea: ["Albino", "Laranja"] }, "cabra_da_montanha": { macho: ["Albino", "Melânico"], femea: ["Albino", "Melânico"] }, "cabra_de_leque": { macho: ["Albino"], femea: ["Albino"] }, "cabra_selvagem": { macho: ["Albino", "Preto", "Cores Mistas"], femea: ["Albino", "Preto", "Cores Mistas"] }, "caititu": { macho: ["Albino", "Melânico", "Ochre", "Leucismo"], femea: ["Albino", "Melânico", "Ochre", "Leucismo"] }, "camurça": { macho: ["Albino", "Melânico", "Leucismo"], femea: ["Albino", "Melânico", "Leucismo"] }, "canguru_cinza_oriental": { macho: ["Albino", "Melânico", "Leucismo"], femea: ["Albino", "Melânico", "Leucismo"] }, "caribu": { macho: ["Albino", "Melânico", "Malhado", "Leucismo"], femea: ["Albino", "Melânico", "Malhado", "Leucismo"] }, "carneiro_azul": { macho: ["Albino", "Melânico", "Leucismo"], femea: ["Albino", "Melânico", "Leucismo"] }, "carneiro_selvagem": { macho: ["Albino"], femea: ["Albino"] }, "cervo_porco_indiano": { macho: ["Malhado", "Leucismo"], femea: ["Malhado", "Leucismo"] }, "cervo_almiscarado": { macho: ["Albino", "Melânico", "Malhado"], femea: [] }, "cervo_de_timor": { macho: ["Albino", "Melânico", "Malhado"], femea: ["Albino", "Melânico", "Malhado"] }, "cervo_do_pântano": { macho: ["Albino", "Malhado", "Leucismo"], femea: ["Albino", "Malhado", "Leucismo"] }, "cervo_sika": { macho: ["Albino", "Melânico", "Malhado", "Leucismo"], femea: ["Albino", "Melânico", "Malhado", "Leucismo"] }, "chital": { macho: ["Albino", "Manchado Vermelho"], femea: ["Albino", "Manchado Vermelho"] }, "chacal_listrado": { macho: ["Albino", "Melânico"], femea: ["Albino", "Melânico"] }, "codorna_de_restolho": { macho: ["Albino", "Pardo Escuro"], femea: ["Albino", "Pardo Escuro"] }, "codorniz_da_virgínia": { macho: ["Albino"], femea: ["Albino"] }, "coelho_da_flórida": { macho: ["Albino"], femea: ["Albino"] }, "coelho_europeu": { macho: ["Albino", "Melânico", "Leucismo"], femea: ["Albino", "Melânico", "Leucismo"] }, "coiote": { macho: ["Albino", "Melânico", "Cinza claro", "Leucismo"], femea: ["Albino", "Melânico", "Cinza claro", "Leucismo"] }, "corça": { macho: ["Albino", "Melânico", "Malhado"], femea: ["Albino", "Melânico", "Malhado"] }, "crocodilo_de_água_salgada": { macho: ["Albino", "Melânico", "Malhado", "Leucismo", "Pardo Claro"], femea: ["Albino", "Melânico", "Malhado", "Leucismo", "Pardo Claro"] }, "cudo_menor": { macho: ["Albino", "Melânico", "Cinzento", "Marrom avermelhado"], femea: ["Albino", "Melânico", "Cinzento", "Marrom avermelhado"] }, "cão_guaxinim": { macho: ["Albino", "Laranja", "Malhado", "Pardo escuro"], femea: ["Albino", "Laranja", "Malhado", "Pardo escuro"] }, "faisão_de_pescoço_anelado": { macho: ["Albino", "Melânico", "Leucismo"], femea: ["Albino", "Melânico", "Leucismo"] }, "faisão": { macho: ["Albino", "Melânico", "Leucismo"], femea: ["Albino", "Melânico", "Leucismo"] }, "frisada": { macho: ["Albino", "Melânico", "Leucismo"], femea: ["Albino", "Melânico", "Leucismo"] }, "galinha_montês": { macho: ["Pálida", "Híbrido", "Escuro"], femea: ["Pálida", "Híbrido", "Escuro"] }, "galo_lira": { macho: ["Laranja", "Melânico", "Ouro", "Leucismo"], femea: ["Laranja", "Melânico", "Ouro", "Leucismo"] }, "gamo": { macho: ["Albino", "Melânico", "Malhado"], femea: ["Albino", "Melânico", "Malhado"] }, "ganso_bravo": { macho: ["Híbrido", "Leucismo"], femea: ["Híbrido", "Leucismo"] }, "ganso_campestre_da_tundra": { macho: ["Leucismo"], femea: ["Leucismo"] }, "ganso_pega": { macho: ["Melânico", "Malhado", "Leucismo"], femea: ["Melânico", "Malhado", "Leucismo"] }, "ganso_do_canadá": { macho: ["Cinza", "Melânico", "Leucismo manchas escuras", "Leucismo cinza claro"], femea: ["Cinza", "Melânico", "Leucismo manchas escuras", "Leucismo cinza claro"] }, "gnu_de_cauda_preta": { macho: ["Albino", "Coroado"], femea: ["Albino", "Coroado"] }, "guaxinim_comum": { macho: ["Albino", "Melânico", "loiro malhado", "cinza malhado"], femea: ["Albino", "Melânico", "loiro malhado", "cinza malhado"] }, "iaque_selvagem": { macho: ["Albino", "Ouro", "Leucismo"], femea: ["Albino", "Ouro", "Leucismo"] }, "ibex_de_beceite": { macho: ["Albino", "Melânico"], femea: ["Albino", "Melânico"] }, "jacaré_americano": { macho: ["Albino", "Melânico", "Malhado"], femea: ["Albino", "Melânico", "Malhado"] }, "javali": { macho: ["Albino", "Melânico", "preto e dourado"], femea: ["Albino", "Melânico", "preto e dourado"] }, "javali_africano": { macho: ["Albino", "Vermelho"], femea: ["Albino", "Vermelho"] }, "lagópode_branco": { macho: ["Branco"], femea: ["Branco"] }, "lagópode_escocês": { macho: ["Branco", "Vermelho"], femea: ["Branco", "Vermelho"] }, "lebre_antílope": { macho: ["Albino", "Melânico"], femea: ["Albino", "Melânico"] }, "lebre_da_eurásia": { macho: ["Albino", "Muda", "Branco"], femea: ["Albino", "Muda", "Branco"] }, "lebre_peluda": { macho: ["Albino", "Branco"], femea: ["Albino", "Branco"] }, "lebre_da_cauda_branca": { macho: ["Albino"], femea: ["Albino"] }, "lebre_nuca_dourada": { macho: ["cinza claro"], femea: ["cinza claro"] }, "lebre_europeia": { macho: ["Albino", "Melânico"], femea: ["Albino", "Melânico"] }, "leopardo_das_neves": { macho: ["Albino", "Melânico", "Leucismo"], femea: ["Albino", "Melânico", "Leucismo"] }, "leão": { macho: ["Albino", "amarelado", "pardo escuro"], femea: ["Albino", "amarelado", "pardo escuro"] }, "lince_pardo_do_méxico": { macho: ["Albino", "Melânico", "Azul"], femea: ["Albino", "Melânico", "Azul"] }, "lince_euroasiática": { macho: ["Albino", "Melânico", "Malhado"], femea: ["Albino", "Melânico", "Malhado"] }, "lobo_cinzento": { macho: ["Albino", "Melânico", "cinza escuro", "clara de ovo", "marrom averelhado"], femea: ["Albino", "Melânico", "cinza escuro", "clara de ovo", "marrom averelhado"] }, "lobo_ibérico": { macho: ["Albino", "Melânico", "fantasma", "ogro", "sombra", "inverno", "oliva", "prístino"], femea: ["Albino", "Melânico", "fantasma", "ogro", "sombra", "inverno", "oliva", "prístino"] }, "marreca_carijó": { macho: ["bege", "Melânico"], femea: ["bege", "Melânico"] }, "marrequinha_comum": { macho: ["híbrido azul", "híbrido verde", "Leucismo"], femea: ["híbrido azul", "híbrido verde", "Leucismo"] }, "marrequinha_americana": { macho: ["Albino", "Malhado"], femea: ["Albino", "Malhado"] }, "muflão_ibérico": { macho: ["Albino", "Melânico", "cinza"], femea: ["Albino", "Melânico", "cinza"] }, "muntjac_vermelho_do_norte": { macho: ["Albino", "Melânico", "Leucismo"], femea: ["Albino", "Melânico", "Leucismo"] }, "nilgó": { macho: ["Malhado"], femea: ["Malhado"] }, "onça_parda": { macho: ["Albino", "Melânico"], femea: ["Albino", "Melânico"] }, "oryx_do_cabo": { macho: ["bege", "escuro", "ouro"], femea: ["bege", "escuro", "ouro"] }, "pato_olho_de_ouro": { macho: ["híbrido", "eclipse", "escuro", "Leucismo"], femea: ["híbrido", "eclipse", "escuro", "Leucismo"] }, "pato_harlequim": { macho: ["Albino", "Melânico", "cinza", "escuro"], femea: ["Albino", "Melânico", "cinza", "escuro"] }, "pato_real": { macho: ["Melânico", "amarelado", "Leucismo"], femea: ["Melânico", "amarelado", "Leucismo"] }, "peru": { macho: ["Albino", "Melânico", "Leucismo"], femea: ["Albino", "Melânico", "Leucismo"] }, "peru_selvagem": { macho: ["Albino", "Melânico", "Leucismo"], femea: ["Albino", "Melânico", "Leucismo"] }, "peru_selvagem_do_rio_grande": { macho: ["Albino", "Melânico", "Leucismo"], femea: ["Albino", "Melânico", "Leucismo"] }, "piadeira": { macho: ["híbrido", "eclipse", "escuro", "Leucismo"], femea: ["híbrido", "eclipse", "escuro", "Leucismo"] }, "porco_selvagem": { macho: ["Albino", "rosa"], femea: ["Albino", "rosa"] }, "raposa_tibetana": { macho: ["Albino", "Melânico", "areia", "esfumaçado", "Leucismo"], femea: ["Albino", "Melânico", "areia", "esfumaçado", "Leucismo"] }, "raposa_cinzenta": { macho: ["Albino", "Melânico", "Malhado", "Leucismo"], femea: ["Albino", "Melânico", "Malhado", "Leucismo"] }, "raposa_vermelha": { macho: ["Albino", "Melânico", "Malhado"], femea: ["Albino", "Melânico", "Malhado"] }, "rena": { macho: ["Albino", "Melânico", "Malhado", "Leucismo"], femea: ["Albino", "Melânico", "Malhado", "Leucismo"] }, "sambar": { macho: ["Albino", "Malhado", "Leucismo"], femea: ["Albino", "Malhado", "Leucismo"] }, "tahr": { macho: ["Albino", "branco", "vermelho", "pardo escuro", "preto", "vermelho escuro"], femea: ["Albino", "branco", "vermelho", "pardo escuro", "preto", "vermelho escuro"] }, "tetraz_grande": { macho: ["pale", "Leucismo"], femea: ["pale", "Leucismo"] }, "tigre_de_bengala": { macho: ["Albino", "Melânico", "branco", "branco sem listras", "ouro", "pseudo melânico", "pseudo melânico branco"], femea: ["Albino", "Melânico", "branco", "branco sem listras", "ouro", "pseudo melânico", "pseudo melânico branco"] }, "urso_cinzento": { macho: ["Albino", "Melanístico", "Marrom"], femea: ["Albino", "Melanístico", "Marrom"] }, "urso_negro": { macho: ["Amarelado", "Marrom", "canela"], femea: ["Amarelado", "Marrom", "canela"] }, "urso_pardo": { macho: ["Albino", "Melanístico"], femea: ["Albino", "Melanístico"] }, "veado_das_montanhas_rochosas": { macho: ["Albino", "Malhado"], femea: ["Albino", "Malhado"] }, "veado_de_cauda_branca": { macho: ["Albino", "Melânico", "Malhado"], femea: ["Albino", "Melânico", "Malhado"] }, "veado_de_cauda_preta": { macho: ["Albino", "Melânico", "Malhado"], femea: ["Albino", "Melânico", "Malhado"] }, "veado_de_roosevelt": { macho: ["Albino", "Melânico", "Malhado"], femea: ["Albino", "Melânico", "Malhado"] }, "veado_mula": { macho: ["Albino", "Melânico", "Malhado", "diluído"], femea: ["Albino", "Melânico", "Malhado", "diluído"] }, "veado_vermelho": { macho: ["Albino", "Melânico", "Malhado"], femea: ["Albino", "Melânico", "Malhado"] }, "zarro_negrinha": { macho: ["Albino", "eclipse", "creme", "Leucismo"], femea: ["Albino", "eclipse", "creme", "Leucismo"] }, "zarro_castanho": { macho: ["Albino", "Melânico", "Leucismo"], femea: ["Albino", "Melânico", "Leucismo"] }, "ibex_espanhol_do_sudeste": { macho: ["Albino", "Melânico"], femea: ["Albino", "Melânico"] }, "ibex_de_gredos": { macho: ["Albino", "Melânico"], femea: ["Albino", "Melânico"] }, "ibex_de_ronda": { macho: ["Albino", "Melânico"], femea: ["Albino", "Melânico"] }, "tetraz_azul": { macho: ["Albino", "Melânico", "Leucismo"], femea: ["Albino", "Melânico", "Leucismo"] }, "marreca_arrebio": { macho: ["Albino", "Melânico", "Leucismo", "malhado"], femea: ["Albino", "Melânico", "Leucismo", "malhado"] }, "ganso_das_neves": { macho: ["Albino", "Melânico"], femea: ["Albino", "Melânico"] }, "pato_carolino": { macho: ["Albino", "Prata Diluída", "Dourado Eritrístico", "Leucísmo", "Melânico", "Malhado"], femea: ["Albino", "Prata Diluída", "Dourado Eritrístico", "Leucísmo", "Melânico", "Malhado"] }, "castor_norte_americano": { macho: ["Albino", "Melânico", "Leucismo"], femea: ["Albino", "Melânico", "Leucismo"] }, "caribu_da_floresta_boreal": { macho: ["Albino", "Melânico", "Leucismo"], femea: ["Albino", "Melânico", "Leucismo"] }, "cervo_canadense": { macho: ["Albino", "Melânico", "Leucismo"], femea: ["Albino", "Melânico", "Leucismo"] }, "bisão_da_floresta": { macho: ["Albino", "Melânico", "Leucismo"], femea: ["Albino", "Melânico", "Leucismo"] } };
const greatsFursData = { "alce": ["Fábula Dois Tons", "Cinza lendário", "Bétula lendária", "Carvalho Fabuloso", "Fabuloso Salpicado", "Abeto lendário"], "urso_negro": ["Creme Lendário", "Espírito Lendário", "Castanho Lendário", "Pintado Lendário", "Gelo Lendário 2", "Gelo Lendário"], "veado_de_cauda_branca": ["Pardo", "Pardo Escuro", "Bronzeado", "Malhado"], "gamo": ["Café Lendário", "Pintado Lendário", "Dourado Lendário", "Misto Lendário", "Prata Lendário"], "raposa": ["A lendária Lua de Sangue", "Bengala de doce lendária", "A lendária flor de cerejeira", "Alcaçuz lendário", "A lendária papoula da meia-noite", "Floco de Neve Místico Fabuloso", "Hortelã-pimenta lendária", "Fábula Rosebud Frost", "A lendária Beladona Escarlate"], "veado_vermelho": ["Pintado Lendário"], "tahr": ["Dourado Lendário", "Cicatrizes Lendárias", "Cinza Lendário", "Café com Leite Lendário", "Crânio Lendário", "Metade Lendária", "Neve Lendário"], "veado_mula": ["Chuva de Gotículas Lendárias", "Via Láctea Lendária", "Sopro de Pétalas Lendário", "Manto Crepuscular Lendário", "Enigma Teia de Aranha Lendário", "Listras de Canela Lendário"], "faisão": ["Rubi Lendário", "Pérola Lendário", "Granada Lendário", "Safira Lendário", "Obsidiana Lendário", "Citrino Lendário", "Esmeralda Lendário", "Morganita Lendário"] };
const items = ["Alce","Antilocapra","Antílope Negro","Bantengue","Bisão da Floresta","Bisão das Planícies","Bisão Europeu","Búfalo Africano","Búfalo D'Água","Cabra da Montanha","Cabra de Leque","Cabra Selvagem","Caititu","Camurça","Canguru-cinza Oriental","Caribu","Caribu da Floresta Boreal","Carneiro Azul","Carneiro Selvagem","Castor Norte-Americano","Cervo Almiscarado","Cervo Canadense","Cervo do Pântano","Cervo de Timor","Cervo Sika","Cervo-porco Indiano","Chital","Codorna-de-restolho","Codorniz da Virgínia","Coelho da Flórida","Coelho Europeu","Coiote","Corça","Crocodilo de Água Salgada","Cudo Menor","Faisão de Pescoço Anelado","Frisada","Galo Lira","Gamo","Ganso Bravo","Ganso Campestre da Tundra","Ganso das Neves","Ganso do Canadá","Ganso Pega","Gnu de Cauda Preta","Guaxinim Comum","Iaque Selvagem","Ibex de Beceite","Ibex de Gredos","Ibex de Ronda","Ibex Espanhol do Sudeste","Jacaré Americano","Javali","Javali Africano","Lebre-antílope","Lebre-da-cauda-branca","Lebre Da Eurásia","Lebre Nuca Dourada","Lebre Peluda","Leão","Leopardo das Neves","Lince Euroasiática","Lince Pardo do México","Lobo Cinzento","Lobo Ibérico","Marreca Arrebio","Marreca Carijó","Marrequinha Americana","Marrequinha Comum","Muflão Ibérico","Muntjac vermelho do norte","Nilgó","Onça Parda","Oryx do Cabo","Pato Carolino","Pato Harlequim","Pato Olho de Ouro","Pato Real","Peru","Peru Selvagem","Peru Selvagem do Rio Grande","Piadeira","Porco Selvagem","Raposa cinzenta","Raposa tibetana","Raposa Vermelha","Rena","Sambar","Tahr","Tetraz Azul","Tetraz Grande","Tigre-de-Bengala","Urso Cinzento","Urso Negro","Urso Pardo","Veado das Montanhas Rochosas","Veado de Cauda Branca","Veado de Cauda Preta","Veado-Mula","Veado de Roosevelt","Veado Vermelho","Cão Guaxinim","Lagópode-Branco","Lagópode-Escocês","Galinha-Montês","Zarro-Negrinha","Zarro-castanho"];

/**
 * Converte texto para um formato de nome de arquivo seguro (slug),
 * removendo acentos, convertendo para minúsculas, e substituindo espaços.
 * @param {string} text O texto para converter.
 * @returns {string} O texto convertido.
 */
function slugify(text) {
    return text
        .normalize("NFD") // Separa os acentos dos caracteres base (ex: 'á' -> 'a' + ´)
        .replace(/[\u0300-\u036f]/g, "") // Remove os acentos (diacríticos)
        .toLowerCase() // Converte para minúsculas
        .replace(/[-\s]+/g, '_') // Substitui espaços e hifens por underscore
        .replace(/'/g, ''); // Remove apóstrofos
}

const categorias = {
    pelagens: { title: 'Pelagens Raras', items: items },
    diamantes: { title: 'Diamantes', items: items },
    greats: { title: 'Greats One', items: ["Alce","Urso Negro","Veado-Mula","Veado Vermelho","Veado-de-cauda-branca","Raposa","Faisão","Gamo","Tahr"] },
    super_raros: { title: 'Super Raros', items: Object.keys(rareFursData).filter(slug => (rareFursData[slug].macho?.length > 0) || (rareFursData[slug].femea?.length > 0)).map(slug => items.find(item => slugify(item) === slug) || slug) },
    progresso: { title: 'Painel de Progresso' }
};

let mainContent;

function checkAndSetGreatOneCompletion(slug, currentData) {
    const requiredFurs = greatsFursData[slug];
    if (!requiredFurs || !currentData) return;
    currentData.completo = requiredFurs.every(furName => currentData.furs?.[furName]?.trophies?.length > 0);
}

function renderMainView(tabKey) {
    mainContent.innerHTML = '';
    const currentTab = categorias[tabKey];
    if (!currentTab) return;
    const header = document.createElement('h2');
    header.textContent = currentTab.title;
    mainContent.appendChild(header);
    if (tabKey === 'progresso') {
        mainContent.appendChild(createProgressPanel());
        updateProgressPanel();
        return;
    }
    const filterInput = document.createElement('input');
    filterInput.type = 'text';
    filterInput.className = 'filter-input';
    filterInput.placeholder = 'Buscar animal...';
    mainContent.appendChild(filterInput);
    const albumGrid = document.createElement('div');
    albumGrid.className = 'album-grid';
    mainContent.appendChild(albumGrid);
    (currentTab.items || []).sort((a, b) => a.localeCompare(b)).forEach(name => {
        const card = createAnimalCard(name, tabKey);
        albumGrid.appendChild(card);
    });
    filterInput.addEventListener('input', (event) => {
        const searchTerm = event.target.value.toLowerCase();
        albumGrid.querySelectorAll('.animal-card').forEach(card => {
            const animalName = card.querySelector('.info').textContent.toLowerCase();
            card.style.display = animalName.includes(searchTerm) ? 'block' : 'none';
        });
    });
}

function createAnimalCard(name, tabKey) {
    const card = document.createElement('div');
    card.className = 'animal-card';
    const slug = slugify(name);
    card.dataset.slug = slug;
    card.innerHTML = `<img src="animais/${slug}.png" alt="${name}" onerror="this.onerror=null;this.src='animais/placeholder.png';"><div class="info">${name}</div>`;
    card.addEventListener('click', () => showDetailView(name, tabKey));
    updateCardAppearance(card, slug, tabKey);
    return card;
}

function renderRareFursDetailView(container, name, slug) {
    const furGrid = document.createElement('div');
    furGrid.className = 'fur-grid';
    container.appendChild(furGrid);
    const speciesFurs = rareFursData[slug];
    if (!speciesFurs || (speciesFurs.macho.length === 0 && speciesFurs.femea.length === 0)) {
        furGrid.innerHTML = '<p>Nenhuma pelagem rara listada para este animal.</p>';
        return;
    }
    const genderedFurs = [];
    if (speciesFurs.macho) {
        speciesFurs.macho.forEach(fur => {
            genderedFurs.push({ displayName: `Macho ${fur}`, originalName: fur });
        });
    }
    if (speciesFurs.femea) {
        speciesFurs.femea.forEach(fur => {
            genderedFurs.push({ displayName: `Fêmea ${fur}`, originalName: fur });
        });
    }
    genderedFurs.sort((a, b) => a.displayName.localeCompare(b.displayName));
    genderedFurs.forEach(furInfo => {
        const furCard = document.createElement('div');
        furCard.className = 'fur-card incomplete';
        const furSlug = slugify(furInfo.originalName);
        const specificImagePath = `animais/pelagens/${slug}_${furSlug}.png`;
        const genericImagePath = `animais/${slug}.png`;
        furCard.innerHTML = `
            <img src="${specificImagePath}" alt="${furInfo.displayName}" onerror="this.onerror=null; this.src='${genericImagePath}';">
            <div class="info">${furInfo.displayName}</div>
        `;
        furGrid.appendChild(furCard);
    });
}

function renderSuperRareDetailView(container, name, slug) {
    const furGrid = document.createElement('div');
    furGrid.className = 'fur-grid';
    container.appendChild(furGrid);
    const speciesFurs = rareFursData[slug];
    if (!speciesFurs || (speciesFurs.macho.length === 0 && speciesFurs.femea.length === 0)) {
        furGrid.innerHTML = '<p>Nenhuma pelagem rara listada para este animal.</p>';
        return;
    }
    const genderedFurs = [];
    if (speciesFurs.macho) {
        speciesFurs.macho.forEach(fur => {
            genderedFurs.push({ displayName: `Macho ${fur} Diamante`, originalName: fur });
        });
    }
    if (speciesFurs.femea) {
        speciesFurs.femea.forEach(fur => {
            genderedFurs.push({ displayName: `Fêmea ${fur} Diamante`, originalName: fur });
        });
    }
    genderedFurs.sort((a, b) => a.displayName.localeCompare(b.displayName));
    genderedFurs.forEach(furInfo => {
        const furCard = document.createElement('div');
        furCard.className = 'fur-card incomplete';
        const furSlug = slugify(furInfo.originalName);
        const specificImagePath = `animais/pelagens/${slug}_${furSlug}.png`;
        const genericImagePath = `animais/${slug}.png`;
        furCard.innerHTML = `
            <img src="${specificImagePath}" alt="${furInfo.displayName}" onerror="this.onerror=null; this.src='${genericImagePath}';">
            <div class="info">${furInfo.displayName}</div>
        `;
        furGrid.appendChild(furCard);
    });
}

function renderDiamondsDetailView(container, name, slug) {
    const grid = document.createElement('div');
    grid.className = 'fur-grid';
    container.appendChild(grid);
    let diamondOptions = [];
    if (femaleOnlyDiamondSpecies.includes(slug)) {
        diamondOptions.push('Fêmea Diamante');
    } else if (maleAndFemaleDiamondSpecies.includes(slug)) {
        diamondOptions.push('Macho Diamante');
        diamondOptions.push('Fêmea Diamante');
    } else {
        diamondOptions.push('Macho Diamante');
    }
    const animalData = savedData['diamantes']?.[slug] || {};
    diamondOptions.forEach(option => {
        const card = document.createElement('div');
        const optionData = animalData[option];
        const isCompleted = optionData === true || (typeof optionData === 'object' && optionData.completed);
        const score = (typeof optionData === 'object' && optionData.score) ? optionData.score : '';
        card.className = `fur-card ${isCompleted ? 'completed' : 'incomplete'}`;
        const imagePath = `animais/${slug}.png`;
        card.innerHTML = `
            <img src="${imagePath}" alt="${name}" onerror="this.onerror=null; this.src='animais/placeholder.png';">
            <div class="info">${option}</div>
            <div class="trophy-score-container">
                <input type="text" class="trophy-score-input" placeholder="Pontos" value="${score}">
                <button class="trophy-score-save-btn">Salvar</button>
            </div>
        `;
        grid.appendChild(card);
        const scoreInput = card.querySelector('.trophy-score-input');
        const saveBtn = card.querySelector('.trophy-score-save-btn');
        scoreInput.addEventListener('click', (e) => e.stopPropagation());
        saveBtn.addEventListener('click', (e) => e.stopPropagation());
        saveBtn.addEventListener('click', () => {
            if (!savedData['diamantes']) savedData['diamantes'] = {};
            if (!savedData['diamantes'][slug]) savedData['diamantes'][slug] = {};
            savedData['diamantes'][slug][option] = {
                completed: true,
                score: scoreInput.value
            };
            saveData(savedData);
            card.classList.add('completed');
            card.classList.remove('incomplete');
            const mainAnimalCard = document.querySelector(`.album-grid .animal-card[data-slug='${slug}']`);
            updateCardAppearance(mainAnimalCard, slug, 'diamantes');
            saveBtn.textContent = 'Salvo!';
            setTimeout(() => { saveBtn.textContent = 'Salvar'; }, 2000);
        });
        card.addEventListener('click', () => {
            const currentOptionData = savedData['diamantes']?.[slug]?.[option];
            const currentCompleted = currentOptionData === true || (typeof currentOptionData === 'object' && currentOptionData.completed);
            if (!savedData['diamantes']) savedData['diamantes'] = {};
            if (!savedData['diamantes'][slug]) savedData['diamantes'][slug] = {};
            const existingScore = (typeof currentOptionData === 'object' && currentOptionData.score) ? currentOptionData.score : scoreInput.value;
            savedData['diamantes'][slug][option] = {
                completed: !currentCompleted,
                score: existingScore
            };
            saveData(savedData);
            card.classList.toggle('completed', !currentCompleted);
            card.classList.toggle('incomplete', currentCompleted);
            const mainAnimalCard = document.querySelector(`.album-grid .animal-card[data-slug='${slug}']`);
            updateCardAppearance(mainAnimalCard, slug, 'diamantes');
        });
    });
}

function showDetailView(name, tabKey) {
    mainContent.innerHTML = '';
    const slug = slugify(name);
    const backButton = document.createElement('button');
    backButton.className = 'back-button';
    backButton.innerHTML = '&larr; Voltar para a Lista';
    backButton.addEventListener('click', () => renderMainView(tabKey));
    mainContent.appendChild(backButton);
    const detailHeader = document.createElement('h2');
    detailHeader.textContent = `${name} - ${categorias[tabKey].title}`;
    mainContent.appendChild(detailHeader);
    const detailContent = document.createElement('div');
    mainContent.appendChild(detailContent);
    if (tabKey === 'greats') {
        renderGreatsDetailView(detailContent, name, slug, tabKey);
    } else if (tabKey === 'pelagens') {
        renderRareFursDetailView(detailContent, name, slug);
    } else if (tabKey === 'super_raros') {
        renderSuperRareDetailView(detailContent, name, slug);
    } else if (tabKey === 'diamantes') {
        renderDiamondsDetailView(detailContent, name, slug);
    } else {
        detailContent.innerHTML = `<p>Funcionalidade de detalhes para esta aba ainda não implementada.</p>`;
    }
}

function renderGreatsDetailView(container, name, slug, tabKey) {
    const trophyListContainer = document.createElement('div');
    trophyListContainer.id = 'trophy-list-container';
    const furGrid = document.createElement('div');
    furGrid.className = 'fur-grid';
    container.appendChild(furGrid);
    container.appendChild(trophyListContainer);
    const fursInfo = greatsFursData[slug];
    if (!fursInfo) { furGrid.innerHTML = '<p>Nenhuma pelagem de Great One para este animal.</p>'; return; }
    const refreshFurGrid = () => {
        furGrid.innerHTML = '';
        const animalData = savedData[tabKey]?.[slug] || {};
        fursInfo.forEach(fur => {
            const furData = animalData.furs?.[fur] || {};
            const trophies = furData.trophies || [];
            const furCard = document.createElement('div');
            furCard.className = `fur-card ${trophies.length > 0 ? 'completed' : 'incomplete'}`;
            const furSlug = slugify(fur);
            const specificImagePath = `animais/pelagens/great_${slug}_${furSlug}.png`;
            const genericImagePath = `animais/${slug}.png`;
            furCard.innerHTML = `
                <img src="${specificImagePath}" alt="${fur}" onerror="this.onerror=null; this.src='${genericImagePath}';">
                <div class="info">${fur}</div>
                <div class="trophy-count">x${trophies.length}</div>
            `;
            furCard.addEventListener('click', () => renderTrophyList(fur, slug, tabKey, name, refreshFurGrid));
            furGrid.appendChild(furCard);
        });
        const mainCard = document.querySelector(`.animal-card[data-slug='${slug}']`);
        updateCardAppearance(mainCard, slug, tabKey);
    };
    refreshFurGrid();
}

function renderTrophyList(fur, slug, tabKey, name, onListChangeCallback) {
    const container = document.getElementById('trophy-list-container');
    container.innerHTML = '';
    const animalData = savedData[tabKey]?.[slug] || {};
    const furData = animalData.furs?.[fur] || {};
    const trophies = furData.trophies || [];
    const listWrapper = document.createElement('div');
    listWrapper.className = 'trophy-list';
    listWrapper.innerHTML = `<h4>Troféus "${fur}" Registrados:</h4>`;
    const ul = document.createElement('ul');
    if (trophies.length > 0) {
        trophies.forEach((trophy, index) => {
            const li = document.createElement('li');
            li.className = 'trophy-item';
            const dateSpan = document.createElement('span');
            dateSpan.className = 'trophy-date';
            dateSpan.textContent = `Data do Abate: ${trophy.date}`;
            const detailsDiv = document.createElement('div');
            detailsDiv.className = 'trophy-item-details';
            detailsDiv.style.display = 'none';
            detailsDiv.innerHTML = `
                <p><strong>Abates na Grind:</strong> ${trophy.abates || 'N/A'}</p>
                <p><strong>Diamantes na Grind:</strong> ${trophy.diamantes || 'N/A'}</p>
                <p><strong>Peles Raras na Grind:</strong> ${trophy.pelesRaras || 'N/A'}</p>
            `;
            const removeBtn = document.createElement('button');
            removeBtn.className = 'remove-trophy-btn';
            removeBtn.textContent = 'Remover';
            removeBtn.onclick = (e) => {
                e.stopPropagation();
                trophies.splice(index, 1);
                checkAndSetGreatOneCompletion(slug, savedData[tabKey][slug]);
                saveData(savedData);
                onListChangeCallback();
                renderTrophyList(fur, slug, tabKey, name, onListChangeCallback);
            };
            const contentWrapper = document.createElement('div');
            contentWrapper.style.flexGrow = '1';
            contentWrapper.appendChild(dateSpan);
            contentWrapper.appendChild(detailsDiv);
            li.appendChild(contentWrapper);
            li.appendChild(removeBtn);
            li.addEventListener('click', () => {
                detailsDiv.style.display = detailsDiv.style.display === 'none' ? 'block' : 'none';
            });
            ul.appendChild(li);
        });
    } else {
        ul.innerHTML = '<li>Nenhum troféu registrado.</li>';
    }
    listWrapper.appendChild(ul);
    const addBtn = document.createElement('button');
    addBtn.className = 'add-trophy-btn';
    addBtn.textContent = `Adicionar Novo Abate "${fur}"`;
    addBtn.onclick = () => showAddTrophyForm(fur, slug, tabKey, name, onListChangeCallback);
    listWrapper.appendChild(addBtn);
    container.appendChild(listWrapper);
}

function showAddTrophyForm(fur, slug, tabKey, name, onListChangeCallback) {
    const container = document.getElementById('trophy-list-container');
    container.innerHTML = '';
    const formWrapper = document.createElement('div');
    formWrapper.className = 'grind-stats';
    formWrapper.innerHTML = `
        <h4>Registrar Novo Troféu: ${fur}</h4>
        <table><tbody>
            <tr><td>Qtd. Abates na Grind:</td><td><input type="number" name="abates" placeholder="0"></td></tr>
            <tr><td>Qtd. Diamantes na Grind:</td><td><input type="number" name="diamantes" placeholder="0"></td></tr>
            <tr><td>Qtd. Peles Raras na Grind:</td><td><input type="number" name="pelesRaras" placeholder="0"></td></tr>
            <tr><td>Data do Abate:</td><td><input type="date" name="date"></td></tr>
        </tbody></table>
        <button id="save-trophy-btn">Salvar Troféu</button>
        <button id="cancel-trophy-btn">Cancelar</button>
    `;
    container.appendChild(formWrapper);
    document.getElementById('save-trophy-btn').onclick = () => {
        const dateInput = formWrapper.querySelector('[name="date"]').value;
        const newTrophy = {
            abates: formWrapper.querySelector('[name="abates"]').value,
            diamantes: formWrapper.querySelector('[name="diamantes"]').value,
            pelesRaras: formWrapper.querySelector('[name="pelesRaras"]').value,
            date: dateInput || new Date().toISOString().split('T')[0]
        };
        if (!savedData[tabKey]) savedData[tabKey] = {};
        if (!savedData[tabKey][slug]) savedData[tabKey][slug] = {};
        if (!savedData[tabKey][slug].furs) savedData[tabKey][slug].furs = {};
        if (!savedData[tabKey][slug].furs[fur]) savedData[tabKey][slug].furs[fur] = { trophies: [] };
        savedData[tabKey][slug].furs[fur].trophies.push(newTrophy);
        checkAndSetGreatOneCompletion(slug, savedData[tabKey][slug]);
        saveData(savedData);
        onListChangeCallback();
        renderTrophyList(fur, slug, tabKey, name, onListChangeCallback);
    };
    document.getElementById('cancel-trophy-btn').onclick = () => {
        renderTrophyList(fur, slug, tabKey, name, onListChangeCallback);
    };
}

function updateCardAppearance(card, slug, tabKey) {
    if (!card) return;
    card.classList.remove('completed', 'inprogress', 'incomplete');
    let status = 'incomplete';
    if (tabKey === 'greats') {
        const animalData = savedData[tabKey]?.[slug] || {};
        checkAndSetGreatOneCompletion(slug, animalData);
        if (animalData.completo) {
            status = 'completed';
        }
    } else if (tabKey === 'diamantes') {
        let requiredOptions = [];
        if (femaleOnlyDiamondSpecies.includes(slug)) {
            requiredOptions.push('Fêmea Diamante');
        } else if (maleAndFemaleDiamondSpecies.includes(slug)) {
            requiredOptions.push('Macho Diamante');
            requiredOptions.push('Fêmea Diamante');
        } else {
            requiredOptions.push('Macho Diamante');
        }
        const animalData = savedData[tabKey]?.[slug] || {};
        const completedOptions = requiredOptions.filter(option => {
            const optionData = animalData[option];
            return optionData === true || (typeof optionData === 'object' && optionData.completed);
        });
        if (completedOptions.length === requiredOptions.length) {
            status = 'completed';
        } else if (completedOptions.length > 0) {
            status = 'inprogress';
        }
    }
    card.classList.add(status);
}

function createProgressPanel() { /* ... */ return document.createElement('div'); }
function updateProgressPanel() { /* ... */ }

document.addEventListener('DOMContentLoaded', () => {
    mainContent = document.querySelector('.main-content');
    const navButtons = document.querySelectorAll('.nav-button');
    function setActiveTab(tabKey) {
        navButtons.forEach(b => b.classList.toggle('active', b.dataset.target === tabKey));
        renderMainView(tabKey);
    }
    navButtons.forEach(btn => {
        btn.addEventListener('click', (e) => {
            setActiveTab(e.currentTarget.dataset.target);
        });
    });
    setActiveTab('pelagens');
});