// --- DADOS E FUNÇÕES BÁSICAS ---
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

function slugify(text) { return text.toLowerCase().replace(/[-\s]+/g, '_').replace(/'/g, ''); }

const categorias = { 
    pelagens: { title: 'Pelagens Raras', items: items }, 
    diamantes: { title: 'Diamantes', items: items }, 
    greats: { title: 'Greats One', items: ["Alce","Urso Negro","Veado-Mula","Veado Vermelho","Veado-de-cauda-branca","Raposa","Faisão","Gamo","Tahr"] }, 
    super_raros: { title: 'Super Raros', items: Object.keys(rareFursData).filter(slug => (rareFursData[slug].macho?.length > 0) || (rareFursData[slug].femea?.length > 0)).map(slug => items.find(item => slugify(item) === slug) || slug) }, 
    progresso: { title: 'Painel de Progresso' } 
};

let mainContent;

function renderMainView(tabKey) {
    mainContent.innerHTML = ''; 

    const currentTab = categorias[tabKey];
    if (!currentTab) return;

    const header = document.createElement('h2');
    header.textContent = currentTab.title;
    mainContent.appendChild(header);

    if (tabKey === 'progresso') {
        // Implementar a renderização do painel de progresso aqui
        mainContent.innerHTML += `<p>Painel de progresso em construção.</p>`;
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
    
    currentTab.items.sort((a, b) => a.localeCompare(b)).forEach(name => {
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
    
    card.innerHTML = `
        <img src="animais/${slug}.png" alt="${name}" onerror="this.onerror=null;this.src='animais/placeholder.png';">
        <div class="info">${name}</div>
    `;
    
    card.addEventListener('click', () => showDetailView(name, tabKey));
    
    // A aparência será atualizada dinamicamente
    updateCardAppearance(card, slug, tabKey); 
    return card;
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
    
    if (tabKey === 'greats') {
        renderGreatsDetailView(mainContent, slug, tabKey);
    } else {
        const detailContent = document.createElement('div');
        mainContent.appendChild(detailContent);
        detailContent.innerHTML = `<p>Funcionalidade de detalhes para esta aba ainda não implementada.</p>`;
    }
}

function renderGreatsDetailView(container, slug, tabKey) {
    // Implementação da tela de detalhes para Great Ones
    // (A ser preenchido com a lógica de grind e lista de troféus)
    container.innerHTML += `<p>Detalhes de Great Ones para ${slug} em construção.</p>`;
}

function updateCardAppearance(card, slug, tabKey) {
    // Lógica para atualizar a aparência do card principal (cinza/colorido)
    // (A ser implementado)
}

document.addEventListener('DOMContentLoaded', () => {
    mainContent = document.querySelector('.main-content');
    const navButtons = document.querySelectorAll('.nav-button');
    
    function setActiveTab(tabKey) {
        navButtons.forEach(b => {
            b.classList.toggle('active', b.dataset.target === tabKey);
        });
        renderMainView(tabKey);
    }
    
    navButtons.forEach(btn => {
        btn.addEventListener('click', (e) => {
            setActiveTab(e.currentTarget.dataset.target);
        });
    });

    setActiveTab('pelagens');
});