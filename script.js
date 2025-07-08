const saveDataKey = 'theHunterAlbumData';

function loadData() {
    try {
        const data = localStorage.getItem(saveDataKey);
        const parsedData = data ? JSON.parse(data) : {};
        if (parsedData.diamantes) {
            for (const slug in parsedData.diamantes) {
                if (!Array.isArray(parsedData.diamantes[slug])) {
                    parsedData.diamantes[slug] = [];
                }
            }
        }
        return parsedData;
    } catch (e) {
        console.error("Erro ao carregar dados do localStorage", e);
        localStorage.clear();
        return {};
    }
}

function saveData(data) {
    try {
        localStorage.setItem(saveDataKey, JSON.stringify(data));
        
        if (document.getElementById('progress-panel-main-container')) {
            const container = document.getElementById('progress-panel-main-container').parentNode;
            renderProgressView(container);
        }

        const mountsGrid = document.querySelector('.mounts-grid');
        if (mountsGrid) {
            const container = mountsGrid.parentNode;
            renderMultiMountsView(container);
        }

        // Adicionado para re-renderizar o contador de grind, se estiver ativo
        const grindContainer = document.querySelector('.grind-container');
        if (grindContainer) {
            const animalSlug = grindContainer.dataset.animalSlug;
            renderGrindCounterView(animalSlug);
        }

    } catch (e) {
        console.error("Erro ao salvar dados no localStorage", e);
    }
}

const savedData = loadData();

// --- CONSTANTES DE DADOS ---
const rareFursData = { "alce": { macho: ["Albino", "Melanístico", "Malhado", "Café"], femea: ["Albino", "Melanístico", "Malhado"] }, "antilocapra": { macho: ["Albino", "Malhado", "Leucismo"], femea: ["Albino", "Malhado", "Leucismo"] }, "antílope_negro": { macho: ["Albino", "Melânico", "Malhado", "Leucismo"], femea: ["Albino", "Melânico", "Malhado", "Leucismo"] }, "bantengue": { macho: ["Albino", "Melânico"], femea: ["Albino", "Melânico"] }, "bisão_das_planícies": { macho: ["Albino", "Melânico", "Leucismo"], femea: ["Albino", "Melânico", "Leucismo"] }, "bisão_europeu": { macho: ["Albino", "Melânico", "Malhado"], femea: ["Albino", "Melânico", "Malhado"] }, "búfalo_africano": { macho: ["Albino", "Leucismo"], femea: ["Albino", "Leucismo"] }, "búfalo_dágua": { macho: ["Albino", "Laranja"], femea: ["Albino", "Laranja"] }, "cabra_da_montanha": { macho: ["Albino", "Melânico"], femea: ["Albino", "Melânico"] }, "cabra_de_leque": { macho: ["Albino"], femea: ["Albino"] }, "cabra_selvagem": { macho: ["Albino", "Preto", "Cores Mistas"], femea: ["Albino", "Preto"] }, "caititu": { macho: ["Albino", "Melânico", "Ochre", "Leucismo"], femea: ["Albino", "Melânico", "Ochre", "Leucismo"] }, "camurça": { macho: ["Albino", "Melânico", "Leucismo"], femea: ["Albino", "Melânico", "Leucismo"] }, "canguru_cinza_oriental": { macho: ["Albino", "Melânico", "Leucismo"], femea: ["Albino", "Melânico", "Leucismo"] }, "caribu": { macho: ["Albino", "Melânico", "Leucismo"], femea: ["Albino", "Melânico", "Leucismo"] }, "carneiro_azul": { macho: ["Albino", "Melânico", "Leucismo"], femea: ["Albino", "Melânico", "Leucismo"] }, "carneiro_selvagem": { macho: ["Albino"], femea: ["Albino"] }, "cervo_porco_indiano": { macho: ["Malhado", "Leucismo"], femea: ["Malhado", "Leucismo"] }, "cervo_almiscarado": { macho: ["Albino", "Melânico", "Malhado"], femea: [] }, "cervo_de_timor": { macho: ["Albino", "leucistico", "malhado variação 1", "malhado variação 2"], femea: ["leucistico"] }, "cervo_do_pântano": { macho: ["Albino", "Malhado", "Leucismo"], femea: ["Albino", "Malhado", "Leucismo"] }, "cervo_sika": { macho: ["Albino", "pintado vermelho"], femea: ["Albino", "pintado vermelho"] }, "chital": { macho: ["Albino", "malhado", "melanico"], femea: ["Albino", "malhado", "melanico"] }, "chacal_listrado": { macho: ["Albino", "Melânico"], femea: ["Albino", "Melânico"] }, "codorna_de_restolho": { macho: ["Albino", "Pardo Escuro"], femea: ["Albino"] }, "codorniz_da_virgínia": { macho: ["Albino"], femea: ["Albino"] }, "coelho_da_flórida": { macho: ["Albino", "melanico"], femea: ["Albino", "melanico"] }, "coelho_europeu": { macho: ["Albino", "Melânico", "Leucismo"], femea: ["Albino", "Melânico", "Leucismo"] }, "coiote": { macho: ["Albino", "Melânico", "malhado"], femea: ["Albino", "Melânico", "malhado"] }, "corça": { macho: ["Albino", "Melânico", "Malhado"], femea: ["Albino", "Melânico", "Malhado"] }, "crocodilo_de_água_salgada": { macho: ["Albino", "Melânico", "Pardo Claro", "malhado variação 1", "malhado variação 2"], femea: ["Albino", "Melânico", "Pardo Claro", "malhado variação 1", "malhado variação 2"] }, "cudo_menor": { macho: ["Albino"], femea: ["Albino"] }, "cão_guaxinim": { macho: ["Albino", "Laranja", "Pardo escuro", "malhado variação 1", "malhado variação 2"], femea: ["Albino", "Laranja", "Pardo escuro", "malhado variação 1", "malhado variação 2"] }, "faisão_de_pescoço_anelado": { macho: ["Albino", "Melânico", "Leucismo"], femea: ["Albino", "Melânico", "Leucismo"] }, "faisão": { macho: ["Albino", "Melânico", "Leucismo"], femea: ["Albino", "Melânico", "Leucismo"] }, "frisada": { macho: ["Albino", "Melânico", "Leucismo"], femea: ["Albino", "Melânico", "Leucismo"] }, "galinha_montês": { macho: ["Pálida", "Híbrido", "Escuro"], femea: ["Pálida", "Híbrido", "Escuro"] }, "galo_lira": { macho: ["leucismo variação 1", "leucismo variação 2", "leucismo variação 3", "melanico variação 1", "melanico variação 2"], femea: ["Laranja"] }, "gamo": { macho: ["Albino", "Melânico", "malhado variação 1", "malhado variação 2"], femea: ["Albino", "Melânico"] }, "ganso_bravo": { macho: ["Híbrido", "leucismo variação 1", "leucismo variação 2", "leucismo variação 3", "leucismo variação 4", "leucismo variação 5"], femea: ["Híbrido", "leucismo variação 1", "leucismo variação 2", "leucismo variação 3", "leucismo variação 4", "leucismo variação 5"] }, "ganso_campestre_da_tundra": { macho: ["leucismo variação 1", "leucismo variação 2", "leucismo variação 3"], femea: ["leucismo variação 1", "leucismo variação 2", "leucismo variação 3"] }, "ganso_pega": { macho: ["Melânico", "leucismo variação 1", "leucismo variação 2", "malhado variação 1", "malhado variação 2"], femea: ["Melânico", "leucismo variação 1", "leucismo variação 2", "malhado variação 1", "malhado variação 2"] }, "ganso_do_canadá": { macho: ["Cinza", "Melânico", "Leucismo cinza claro", "hibrido branco"], femea: ["Cinza", "Melânico", "Leucismo cinza claro", "hibrido branco"] }, "ganso_das_neves": { macho: ["Albino", "Melânico", "variação azul", "hibrido", "intermediario"], femea: ["Albino", "Melânico", "variação azul", "hibrido", "intermediario"] }, "gnu_de_cauda_preta": { macho: ["Albino"], femea: ["Albino", "Coroado"] }, "guaxinim_comum": { macho: ["Albino", "Melânico", "loiro malhado", "cinza malhado"], femea: ["Albino", "Melânico", "loiro malhado", "cinza malhado"] }, "iaque_selvagem": { macho: ["Ouro", "Leucismo", "albino variação 1", "albino variação 2"], femea: ["Ouro", "Leucismo", "albino variação 1", "albino variação 2", "marrom profundo", "preto profundo"] }, "ibex_de_beceite": { macho: ["Albino", "Melânico"], femea: ["Albino", "Melânico"] }, "jacaré_americano": { macho: ["Albino", "Melânico", "malhado variação 1", "malhado variação 2"], femea: ["Albino", "Melânico", "malhado variação 1", "malhado variação 2"] }, "javali": { macho: ["Albino", "Melânico", "preto e dourado"], femea: ["Albino", "Melânico", "preto e dourado"] }, "javali_africano": { macho: ["Albino"], femea: ["Albino", "Vermelho"] }, "lagópode_branco": { macho: ["Branco", "muda variação 1", "muda variação 2"], femea: ["Branco", "muda variação 1", "muda variação 2", "mosqueado variação 1", "mosqueado variação 2"] }, "lagópode_escocês": { macho: ["Branco"], femea: ["Branco"] }, "lebre_antílope": { macho: ["Albino", "Melânico"], femea: ["Albino", "Melânico"] }, "lebre_da_eurásia": { macho: ["Albino", "Branco", "muda variação 1", "muda variação 2", "pardo claro", "pardo escuro", "cinza claro", "cinza escuro"], femea: ["Albino", "Branco", "muda variação 1", "muda variação 2"] }, "lebre_peluda": { macho: ["Albino", "Branco"], femea: ["Albino", "Branco"] }, "lebre_da_cauda_branca": { macho: ["Albino"], femea: ["Albino"] }, "lebre_nuca_dourada": { macho: ["cinza claro"], femea: ["cinza claro"] }, "lebre_europeia": { macho: ["albino", "melanico"], femea: ["albino", "melanico"] }, "leopardo_das_neves": { macho: ["Albino", "Melânico", "Leucismo"], femea: ["Albino", "Melânico", "Leucismo"] }, "leão": { macho: ["Albino", "amarelado", "pardo escuro"], femea: ["Albino", "amarelado", "pardo escuro"] }, "lince_pardo_do_méxico": { macho: ["Albino", "Melânico", "Azul"], femea: ["Albino", "Melânico", "Azul"] }, "lince_euroasiática": { macho: ["Albino", "Melânico", "Malhado"], femea: ["Albino", "Melânico", "Malhado"] }, "lobo_cinzento": { macho: ["Albino", "Melânico", "cinza escuro", "clara de ovo", "marrom averelhado"], femea: ["Albino", "Melânico", "cinza escuro", "clara de ovo", "marrom averelhado"] }, "lobo_ibérico": { macho: ["Albino", "Melânico", "fantasma", "ogro", "sombra", "inverno", "oliva", "prístino"], femea: ["Albino", "Melânico", "fantasma", "ogro", "sombra", "inverno", "oliva", "prístino"] }, "marreca_carijó": { macho: ["Melânico"], femea: ["bege"] }, "marrequinha_comum": { macho: ["híbrido azul", "híbrido verde", "Leucismo variação 1", "Leucismo variação 2"], femea: ["Leucismo"] }, "marrequinha_americana": { macho: ["Albino", "Verde Claro", "malhado variação 1", "malhado variação 2", "malhado variação 3"], femea: ["malhado variação 1", "malhado variação 2"] }, "muflão_ibérico": { macho: ["Albino", "Melânico", "cinza"], femea: ["Albino", "Melânico", "cinza"] }, "muntjac_vermelho_do_norte": { macho: ["Albino", "Melânico", "Leucismo variação 1", "Leucismo variação 2", "Vermelho variação 1", "Vermelho variação 2"], femea: ["Albino", "Melânico", "Leucismo variação 1", "Leucismo variação 2"] }, "nilgó": { macho: ["Malhado variação 1", "Malhado variação 2"], femea: ["Malhado variação 1", "Malhado variação 2"] }, "onça_parda": { macho: ["Albino", "Melânico"], femea: ["Albino", "Melânico"] }, "oryx_do_cabo": { macho: ["bege", "escuro", "ouro"], femea: ["bege", "escuro", "ouro"] }, "pato_olho_de_ouro": { macho: ["eclipse", "leucismo variação 1", "leucismo variação 2"], femea: ["escuro", "leucismo variação 1", "leucismo variação 2"] }, "pato_harlequim": { macho: ["Albino", "Melânico"], femea: ["Albino", "cinza", "escuro"] }, "pato_real": { macho: ["Melânico"], femea: ["Melânico", "amarelado"] }, "peru": { macho: ["Albino", "Melânico", "Leucismo"], femea: ["Albino", "Melânico", "Leucismo"] }, "peru_selvagem": { macho: ["Albino", "Melânico", "Leucismo", "bronze"], femea: ["Albino", "Melânico", "Leucismo"] }, "peru_selvagem_do_rio_grande": { macho: ["Albino", "Melânico", "Leucismo"], femea: ["Albino", "Melânico", "Leucismo"] }, "piadeira": { macho: ["híbrido", "eclipse", "leucismo variação 1", "leucismo variação 2"], femea: ["leucismo variação 1", "leucismo variação 2"] }, "porco_selvagem": { macho: ["Albino", "rosa", "manchas pretas variação 1", "manchas pretas variação 2", "hibrido marrom variação 1", "hibrido marrom variação 2", "marrom escuro variação 1", "marrom escuro variação 2"], femea: ["rosa"] }, "raposa_tibetana": { macho: ["Albino", "Melânico", "areia", "esfumaçado", "Leucismo"], femea: ["Albino", "Melânico", "areia", "esfumaçado", "Leucismo"] }, "raposa_cinzenta": { macho: ["Albino", "Melânico", "Leucismo", "malhado variação 1", "malhado variação 2"], femea: ["Albino", "Melânico", "Leucismo", "malhado variação 1", "malhado variação 2"] }, "raposa_vermelha": { macho: ["Albino", "Melânico", "Malhado"], femea: ["Albino", "Melânico", "Malhado"] }, "rena": { macho: ["Albino", "Melânico", "Malhado", "Leucismo"], femea: ["Albino", "Melânico", "Malhado", "Leucismo"] }, "sambar": { macho: ["Albino", "leucismo variação 1", "leucismo variação 2", "malhado variação 1", "malhado variação 2", "gradiente escuro"], femea: ["Albino", "Malhado", "Leucismo"] }, "tahr": { macho: ["Albino", "branco", "vermelho", "preto", "vermelho escuro", "pardo escuro"], femea: ["Albino", "branco", "vermelho"] }, "tetraz_grande": { macho: ["pálido", "Leucismo"], femea: ["Leucismo"] }, "tigre_de_bengala": { macho: ["Albino", "Melânico", "branco", "branco sem listras", "ouro", "pseudo melanico variação 1", "pseudo melanico variação 2", "pseudo melanico branco variação 1", "pseudo melanico branco variação 2"], femea: ["Albino", "Melânico", "branco", "branco sem listras", "ouro", "pseudo melanico variação 1", "pseudo melanico variação 2", "pseudo melanico branco variação 1", "pseudo melanico branco variação 2"] }, "urso_cinzento": { macho: ["Albino", "Marrom"], femea: ["Albino"] }, "urso_negro": { macho: ["Amarelado", "Marrom", "canela"], femea: ["Amarelado", "Marrom", "canela"] }, "urso_pardo": { macho: ["Albino", "Melanico"], femea: ["Albino", "Melanico"] }, "veado_das_montanhas_rochosas": { macho: ["Albino", "malhado variação 1", "malhado variação 2"], femea: ["Albino", "malhado variação 1", "malhado variação 2"] }, "veado_de_cauda_branca": { macho: ["Albino", "Melânico", "Malhado"], femea: ["Albino", "Melânico", "Malhado"] }, "veado_de_cauda_preta": { macho: ["Albino", "Melânico", "Malhado"], femea: ["Albino", "Melânico", "Malhado"] }, "veado_de_roosevelt": { macho: ["Albino", "Melânico", "Malhado"], femea: ["Albino", "Melânico", "Malhado"] }, "veado_mula": { macho: ["Albino", "Melânico", "diluído", "malhado variação 1", "malhado variação 2"], femea: ["Albino", "Melânico", "diluído", "malhado variação 1", "malhado variação 2"] }, "veado_vermelho": { macho: ["Albino", "Melânico", "Malhado"], femea: ["Albino", "Melânico", "Malhado"] }, "zarro_negrinha": { macho: ["Albino", "eclipse", "leucismo variação 1", "leucismo variação 2"], femea: ["leucismo variação 1", "leucismo variação 2"] }, "zarro_castanho": { macho: ["Albino", "Melânico", "Leucismo"], femea: ["Albino", "Melânico", "Leucismo"] }, "ibex_espanhol_do_sudeste": { macho: ["Albino", "Melânico", "laranja", "cinza claro", "castanho acinzentado", "marrom hibrido"], femea: ["Albino", "Melânico"] }, "ibex_de_gredos": { macho: ["Albino", "Melânico"], femea: ["Albino", "Melânico"] }, "ibex_de_ronda": { macho: ["Albino", "Melânico"], femea: ["Albino", "Melânico"] }, "tetraz_azul": { macho: ["Albino", "Melânico", "Leucismo"], femea: ["Albino", "Melânico", "Leucismo"] }, "marreca_arrebio": { macho: ["Albino", "Melânico", "malhado"], femea: ["Albino", "Melânico", "Leucismo", "malhado", "brilhante", "eritristico"] }, "pato_carolino": { macho: ["Albino", "Prata Diluída", "Dourado Eritrístico", "Leucísmo", "Melânico", "Malhado"], femea: ["Albino", "Prata Diluída", "Dourado Eritrístico", "Leucísmo", "Melânico", "Malhado"] }, "castor_norte_americano": { macho: ["Albino", "Melânico", "Leucismo"], femea: ["Albino", "Melânico", "Leucismo"] }, "caribu_da_floresta_boreal": { macho: ["Albino", "Melânico", "Leucismo"], femea: ["Albino", "Melânico", "Leucismo"] }, "cervo_canadense": { macho: ["Albino", "Melânico", "Leucismo"], femea: ["Albino", "Melânico", "Leucismo"] }, "bisão_da_floresta": { macho: ["Albino", "Melânico", "Leucismo"], femea: ["Albino", "Melânico", "Leucismo"] } };
const greatsFursData = { "alce": ["Fábula Dois Tons", "Cinza lendário", "Bétula lendária", "Carvalho Fabuloso", "Fabuloso Salpicado", "Abeto lendário"], "urso_negro": ["Creme Lendário", "Espírito Lendário", "Castanho Lendário", "Pintado Lendário", "Gelo Lendário 2", "Gelo Lendário"], "veado_de_cauda_branca": ["Pardo", "Pardo Escuro", "Bronzeado", "Malhado"], "gamo": ["Café Lendário", "Pintado Lendário", "Dourado Lendário", "Misto Lendário", "Prata Lendário"], "raposa": ["A lendária Lua de Sangue", "Bengala de doce lendária", "A lendária flor de cerejeira", "Alcaçuz lendário", "A lendária papoula da meia-noite", "Floco de Neve Místico Fabuloso", "Hortelã-pimenta lendária", "Fábula Rosebud Frost", "A lendária Beladona Escarlate"], "veado_vermelho": ["Pintado Lendário"], "tahr": ["Dourado Lendário", "Cicatrizes Lendárias", "Cinza Lendário", "Café com Leite Lendário", "Crânio Lendário", "Metade Lendária", "Neve Lendário"], "veado_mula": ["Chuva de Gotículas Lendárias", "Via Láctea Lendária", "Sopro de Pétalas Lendário", "Manto Crepuscular Lendário", "Enigma Teia de Aranha Lendário", "Listras de Canela Lendário"], "faisão": ["Rubi Lendário", "Pérola Lendário", "Granada Lendário", "Safira Lendário", "Obsidiana Lendário", "Citrino Lendário", "Esmeralda Lendário", "Morganita Lendário"] };
const items = ["Alce","Antilocapra","Antílope Negro","Bantengue","Bisão da Floresta","Bisão das Planícies","Bisão Europeu","Búfalo Africano","Búfalo D'Água","Cabra da Montanha","Cabra de Leque","Cabra Selvagem","Caititu","Camurça","Canguru-cinza Oriental", "Chacal Listrado", "Caribu","Caribu da Floresta Boreal","Carneiro Azul","Carneiro Selvagem","Castor Norte-Americano","Cervo Almiscarado","Cervo Canadense","Cervo do Pântano","Cervo de Timor","Cervo Sika","Cervo-porco Indiano","Chital","Codorna-de-restolho","Codorniz da Virgínia","Coelho da Flórida","Coelho Europeu","Coiote","Corça","Crocodilo de Água Salgada","Cudo Menor","Faisão de Pescoço Anelado","Frisada","Galo Lira","Gamo","Ganso Bravo","Ganso Campestre da Tundra","Ganso das Neves","Ganso do Canadá","Ganso Pega","Gnu de Cauda Preta","Guaxinim Comum","Iaque Selvagem","Ibex de Beceite","Ibex de Gredos","Ibex de Ronda","Ibex Espanhol do Sudeste","Jacaré Americano","Javali","Javali Africano", "Lebre Europeia", "Lebre-antílope","Lebre-da-cauda-branca","Lebre Da Eurásia","Lebre Nuca Dourada","Lebre Peluda","Leão","Leopardo das Neves","Lince Euroasiática","Lince Pardo do México","Lobo Cinzento","Lobo Ibérico","Marreca Arrebio","Marreca Carijó","Marrequinha Americana","Marrequinha Comum","Muflão Ibérico","Muntjac vermelho do norte","Nilgó","Onça Parda","Oryx do Cabo","Pato Carolino","Pato Harlequim","Pato Olho de Ouro","Pato Real","Peru","Peru Selvagem","Peru Selvagem do Rio Grande","Piadeira","Porco Selvagem","Raposa cinzenta","Raposa tibetana","Raposa Vermelha","Rena","Sambar","Tahr","Tetraz Azul","Tetraz Grande","Tigre-de-Bengala","Urso Cinzento","Urso Negro","Urso Pardo","Veado das Montanhas Rochosas","Veado de Cauda Branca","Veado de Cauda Preta","Veado-Mula","Veado de Roosevelt","Veado Vermelho","Cão Guaxinim","Lagópode-Branco","Lagópode-Escocês","Galinha-Montês","Zarro-Negrinha","Zarro-castanho"];
const diamondFursData = { "alce": { macho: ["Bronzeado", "Pardo", "Pardo Claro"], femea: [] }, "antilocapra": { macho: ["Bronzeado", "Escuro", "Pardo"], femea: [] }, "antílope_negro": { macho: ["Escuro", "Pardo Escuro", "Preto", "Bege"], femea: [] }, "bantengue": { macho: ["Preto", "Café", "Pardo", "Pardo Escuro"], femea: [] }, "bisão_da_floresta": { macho: ["Pardo Escuro", "Ruivo", "Metade Ruivo", "Pardo Claro"], femea: [] }, "bisão_das_planícies": { macho: ["Escuro", "Cinza Claro", "Pardo", "Pardo Claro"], femea: [] }, "bisão_europeu": { macho: ["Pardo", "Pardo Claro", "Pardo Escuro"], femea: [] }, "búfalo_dágua": { macho: ["Cinzento", "Preto", "Laranja"], femea: [] }, "búfalo_africano": { macho: ["Cinzento", "Pardo", "Preto"], femea: [] }, "cabra_da_montanha": { macho: ["Bege", "Branco", "Cinza Claro", "Pardo Claro"], femea: [] }, "cabra_de_leque": { macho: ["Bronzeado", "Laranja", "Pardo Escuro"], femea: [] }, "cabra_selvagem": { macho: ["Amarelado", "Branco", "Pardo e Branco", "Pardo Negro", "Preto e Branco"], femea: [] }, "caititu": { macho: ["Cinza Escuro", "Cinzento", "Pardo", "Pardo Escuro"], femea: [] }, "camurça": { macho: ["Cor de Mel", "Pardo", "Pardo e Cinza", "Pardo Escuro"], femea: [] }, "canguru_cinza_oriental": { macho: ["Cinzento", "Pardo e Cinza", "Pardo"], femea: [] }, "caribu": { macho: ["Pardo Claro", "Pardo Escuro"], femea: [] }, "caribu_da_floresta_boreal": { macho: ["Pardo Escuro", "Pardo Claro"], femea: [] }, "carneiro_azul": { macho: ["Cinza Ardósia", "Pardo", "Cinza Azulado", "Amarelo"], femea: [] }, "carneiro_selvagem": { macho: ["Preto", "Pardo", "Cinzento", "Bronze"], femea: [] }, "castor_norte_americano": { macho: ["Pardo Claro", "Pardo Escuro", "Marrom Avermelhado"], femea: ["Pardo Claro", "Pardo Escuro", "Marrom Avermelhado"] }, "cervo_almiscarado": { macho: ["Pardo e Cinza", "Pardo Escuro"], femea: [] }, "cervo_canadense": { macho: ["Juba Marrom", "Escuro"], femea: [] }, "cervo_do_pântano": { macho: ["Pardo", "Pardo Claro", "Vermelho", "Pardo Escuro", "Vermelho Escuro"], femea: [] }, "cervo_de_timor": { macho: ["Dois Tons", "Pardo", "Pardo Claro", "Pardo e Branco"], femea: [] }, "cervo_sika": { macho: ["Escuro e Pintado", "Pardo", "Pintado", "Preto"], femea: [] }, "cervo_porco_indiano": { macho: ["Pardo", "Escuro e Pintado", "Pardo Escuro", "Pintado"], femea: [] }, "chital": { macho: ["Pintado", "Escuro"], femea: [] }, "chacal_listrado": { macho: ["Pardo Claro", "Pardo Cinza", "Cinzento"], femea: [] }, "codorna_de_restolho": { macho: ["Pardo", "Pardo e Cinza", "Pardo Escuro"], femea: [] }, "codorniz_da_virgínia": { macho: ["Cinzento", "Pardo", "Pardo Avermelhado"], femea: ["Cinzento", "Pardo", "Pardo Avermelhado"] }, "coelho_da_flórida": { macho: ["Cinza Claro", "Cinzento", "Pardo", "Pardo Claro"], femea: ["Cinza Claro", "Cinzento", "Pardo", "Pardo Claro"] }, "coelho_europeu": { macho: ["Bronzeado", "Pardo", "Pardo Claro", "Pardo Escuro"], femea: [] }, "coiote": { macho: ["Cinza Escuro", "Pardo e Cinza"], femea: [] }, "corça": { macho: ["Bronzeado", "Cinza Escuro", "Pardo"], femea: [] }, "crocodilo_de_água_salgada": { macho: ["Cinzento", "Oliva", "Pardo Escuro"], femea: [] }, "cudo_menor": { macho: ["Cinzento"], femea: [] }, "cão_guaxinim": { macho: ["Cinzento", "Pardo Claro", "Preto e Branco"], femea: [] }, "faisão_de_pescoço_anelado": { macho: ["Cinzento", "Muda", "Pardo", "Pardo e Branco"], femea: [] }, "frisada": { macho: ["Cinzento", "Plum. de Inverno"], femea: [] }, "galinha_montês": { macho: ["Cinzento", "Escuro", "Pardo", "Pardo Claro"], femea: [] }, "galo_lira": { macho: ["Escuro"], femea: [] }, "gamo": { macho: ["Escuro", "Escuro e Pintado", "Pintado", "Branco", "Chocolate"], femea: [] }, "ganso_bravo": { macho: ["Pardo", "Cinzento"], femea: [] }, "ganso_campestre_da_tundra": { macho: ["Cinza Claro", "Cinza Escuro", "Pardo"], femea: [] }, "ganso_das_neves": { macho: ["Variação Branca", "Variação Azul", "Variação Interm", "Híbrido"], femea: [] }, "ganso_do_canadá": { macho: ["Marrom Híbrido", "Pardo e Cinza"], femea: [] }, "ganso_pega": { macho: ["Amarelo", "Bordô", "Laranja"], femea: [] }, "gnu_de_cauda_preta": { macho: ["Cinza escuro", "Cinzento", "Ouro"], femea: [] }, "guaxinim_comum": { macho: ["Amarelado", "Cinzento", "Pardo"], femea: [] }, "iaque_selvagem": { macho: ["Pardo Escuro", "Vermelho Escuro", "Preto Profundo", "Marrom Profundo", "Ouro"], femea: [] }, "ibex_de_beceite": { macho: ["Cinzento", "Laranja", "Marrom Híbrido", "Pardo e Cinza"], femea: [] }, "ibex_de_gredos": { macho: ["Cinza Claro", "Marrom Híbrido", "Cinzento", "Pardo e Cinza"], femea: [] }, "ibex_de_ronda": { macho: ["Cinzento", "Marrom Híbrido", "Pardo", "Pardo e Cinza"], femea: [] }, "ibex_espanhol_do_sudeste": { macho: ["pardo hibrido", "pardo acinzentado", "cinza claro", "laranja"], femea: [] }, "jacaré_americano": { macho: ["Oliva", "Pardo Escuro"], femea: [] }, "javali": { macho: ["Preto e Dourado", "pardo claro variação 1", "pardo claro variação 2"], femea: [] }, "javali_africano": { macho: ["Cinzento Escuro", "Pardo Avermelhado"], femea: [] }, "lebre_antílope": { macho: ["Cinzento", "Mosqueado", "Pardo Escuro"], femea: [] }, "lebre_da_cauda_branca": { macho: ["Bege", "Cinzento", "Pardo", "Pardo Claro"], femea: [] }, "lebre_da_eurásia": { macho: ["Branco"], femea: ["Branco"] }, "lebre_europeia": { macho: ["pardo", "pardo escuro", "pardo claro", "cinza"], femea: [] }, "lebre_nuca_dourada": { macho: ["Castanho", "Pardo", "Cinzento"], femea: ["Castanho", "Pardo", "Cinzento"] }, "lebre_peluda": { macho: ["Cinza Claro", "Pardo Claro", "Pardo Escuro", "Muda"], femea: ["Cinza Claro", "Pardo Claro", "Pardo Escuro", "Muda"] }, "leão": { macho: ["Bronzeado", "Pardo Claro"], femea: [] }, "leopardo_das_neves": { macho: ["Neve", "Caramelo"], femea: [] }, "lince_euroasiática": { macho: ["Cinzento", "Pardo Claro"], femea: [] }, "lince_pardo_do_méxico": { macho: ["Bronzeado", "Cinzento", "Pardo", "Vermelho"], femea: [] }, "lobo_cinzento": { macho: ["Cinzento"], femea: [] }, "lobo_ibérico": { macho: ["Cinzento", "Pardo e Cinza"], femea: [] }, "marreca_arrebio": { macho: ["Eclipse", "Cinza", "Eritrístico"], femea: [] }, "marreca_carijó": { macho: ["Canela", "Vermelho", "Malhado"], femea: [] }, "marrequinha_americana": { macho: ["Verde Claro"], femea: [] }, "marrequinha_comum": { macho: ["Verde Claro", "Verde Escuro"], femea: [] }, "muflão_ibérico": { macho: ["Pardo", "Pardo Claro"], femea: [] }, "muntjac_vermelho_do_norte": { macho: ["Albino", "Melânico", "Leucismo variação 1", "Leucismo variação 2", "Vermelho variação 1", "Vermelho variação 2"], femea: [] }, "nilgó": { macho: ["Azul", "Pardo Escuro"], femea: [] }, "onça_parda": { macho: ["Pardo Claro", "Vermelho Escuro", "Cinzento"], femea: [] }, "oryx_do_cabo": { macho: ["Cinza Claro", "Cinzento"], femea: ["Cinza Claro", "Cinzento"] }, "pato_carolino": { macho: ["Escuro", "Prata Diluído", "Padrão", "Dourado Eritrístico"], femea: [] }, "pato_harlequim": { macho: ["Cinza Escuro", "Malhado"], femea: [] }, "pato_olho_de_ouro": { macho: ["Preto"], femea: [] }, "pato_real": { macho: ["Malhado", "Pardo Negro", "Marrom Híbrido"], femea: [] }, "peru": { macho: ["Pardo", "Pardo Claro", "Pardo Escuro"], femea: [] }, "peru_selvagem": { macho: ["Bronze", "Bronze Claro", "Pardo", "Pardo Claro"], femea: [] }, "peru_selvagem_do_rio_grande": { macho: ["Pardo", "Pardo Claro", "Siena", "Siena Claro"], femea: [] }, "piadeira": { macho: ["Cinzento", "Pardo"], femea: [] }, "porco_selvagem": { macho: ["manchas pretas variação 1", "manchas pretas variação 2", "hibrido marrom variação 1", "hibrido marrom variação 2", "Preto", "Preto e Dourado"], femea: [] }, "raposa_cinzenta": { macho: ["Cinzento", "Dois Tons", "Vermelho"], femea: ["Cinzento", "Dois Tons", "Vermelho"] }, "raposa_tibetana": { macho: ["Laranja", "Vermelho", "Cinzento", "Pardo"], femea: [] }, "raposa_vermelha": { macho: ["Laranja", "Vermelho", "Vermelho Escuro"], femea: [] }, "rena": { macho: ["Pardo Claro", "Pardo Escuro"], femea: [] }, "sambar": { macho: ["Pardo", "Pardo Claro", "Pardo Escuro"], femea: [] }, "tahr": { macho: ["Pardo Avermelhado", "Palha", "Pardo Claro"], femea: [] }, "tetraz_azul": { macho: ["Muda", "Cinza Ardósia"], femea: [] }, "tetraz_grande": { macho: ["Escuro"], femea: [] }, "tigre_de_bengala": { macho: ["Laranja"], femea: [] }, "urso_cinzento": { macho: ["Pardo e Cinza"], femea: [] }, "urso_negro": { macho: ["Escuro", "Preto"], femea: [] }, "urso_pardo": { macho: ["Canela", "Amarelo", "Pardo escuro", "Ouro", "Cinza", "Pardo claro", "Pardo avermelhado", "Espírito"], femea: [] }, "veado_das_montanhas_rochosas": { macho: ["Cinza Claro", "Pardo", "Pardo Claro"], femea: [] }, "veado_de_cauda_branca": { macho: ["Bronzeado", "Pardo", "Pardo Escuro"], femea: [] }, "veado_de_cauda_preta": { macho: ["Cinza Escuro", "Cinzento", "Pardo e Cinza"], femea: [] }, "veado_mula": { macho: ["Cinzento", "Pardo", "Amarelado"], femea: [] }, "veado_de_roosevelt": { macho: ["Bronzeado", "Laranja", "Pardo"], femea: [] }, "veado_vermelho": { macho: ["Pardo", "Pardo Claro", "Pardo Escuro"], femea: [] }, "lagópode_branco": { macho: ["Bicolor", "Muda", "Mosqueado"], femea: [] }, "lagópode_escocês": { macho: ["Bicolor", "Muda"], femea: [] }, "zarro_negrinha": { macho: ["Preto"], femea: [] }, "zarro_castanho": { macho: ["Pardo Escuro", "Pardo Avermelhado"], femea: [] } };
const reservesData = {
    layton_lake: {
        name: "Lagos de Layton",
        image: "reservas/layton_lake.png",
        animals: ["alce", "veado_de_cauda_branca", "veado_de_cauda_preta", "veado_de_roosevelt", "urso_negro", "coiote", "pato_real", "lebre_da_cauda_branca"]
    },
    hirschfelden: {
        name: "Hirschfelden",
        image: "reservas/hirschfelden.png",
        animals: ["gamo", "corça", "veado_vermelho", "javali", "bisão_europeu", "raposa_vermelha", "ganso_do_canadá", "coelho_europeu", "faisão_de_pescoço_anelado"]
    },
    medved_taiga: {
        name: "Taiga Medved",
        image: "reservas/medved_taiga.png",
        animals: ["alce", "rena", "tetraz_grande", "cervo_almiscarado", "urso_pardo", "javali", "lince_euroasiática", "lobo_cinzento"]
    },
    vurhonga_savanna: {
        name: "Savana Vurhonga",
        image: "reservas/vurhonga_savanna.png",
        animals: ["chacal_listrado", "lebre_nuca_dourada", "piadeira", "cudo_menor", "cabra_de_leque", "javali_africano", "gnu_de_cauda_preta", "búfalo_africano", "leão", "oryx_do_cabo", "antílope_negro"]
    },
    parque_fernando: {
        name: "Parque Fernando",
        image: "reservas/parque_fernando.png",
        animals: ["veado_vermelho", "marreca_carijó", "caititu", "veado_mula", "onça_parda", "antílope_negro", "búfalo_dágua", "chital"]
    },
    yukon_valley: {
        name: "Vale do Yukon",
        image: "reservas/yukon_valley.png",
        animals: ["caribu", "ganso_do_canadá", "alce", "urso_cinzento", "lobo_cinzento", "bisão_das_planícies", "raposa_vermelha", "pato_harlequim"]
    },
    cuatro_colinas: {
        name: "Cuatro Colinas",
        image: "reservas/cuatro_colinas.png",
        animals: ["ibex_de_gredos", "faisão_de_pescoço_anelado", "ibex_de_beceite", "ibex_espanhol_do_sudeste", "ibex_de_ronda", "muflão_ibérico", "lobo_ibérico", "javali", "corça", "lebre_europeia", "veado_vermelho"]
    },
    silver_ridge_peaks: {
        name: "Picos de Silver Ridge",
        image: "reservas/silver_ridge_peaks.png",
        animals: ["antilocapra", "carneiro_selvagem", "bisão_das_planícies", "cabra_da_montanha", "veado_mula", "onça_parda", "urso_negro", "veado_das_montanhas_rochosas", "peru_selvagem"]
    },
    te_awaroa: {
        name: "Te Awaroa",
        image: "reservas/te_awaroa.png",
        animals: ["veado_vermelho", "gamo", "cabra_selvagem", "porco_selvagem", "cervo_sika", "tahr", "peru_selvagem", "camurça", "coelho_europeu", "pato_real"]
    },
    rancho_del_arroyo: {
        name: "Rancho del Arroyo",
        image: "reservas/rancho_del_arroyo.png",
        animals: ["veado_mula", "veado_de_cauda_branca", "carneiro_selvagem", "antilocapra", "caititu", "coiote", "lince_pardo_do_mexico", "peru_selvagem_do_rio_grande", "faisão_de_pescoço_anelado", "lebre_antílope"]
    },
    mississippi_acres: {
        name: "Mississippi Acres",
        image: "reservas/mississippi_acres.png",
        animals: ["veado_de_cauda_branca", "codorniz_da_virgínia", "marrequinha_americana", "peru", "porco_selvagem", "urso_negro", "raposa_cinzenta", "guaxinim_comum", "coelho_da_flórida", "jacaré_americano"]
    },
    revontuli_coast: {
        name: "Costa de Revontuli",
        image: "reservas/revontuli_coast.png",
        animals: ["galinha_montês", "veado_de_cauda_branca", "urso_pardo", "alce", "ganso_bravo", "ganso_campestre_da_tundra", "ganso_do_canadá", "lagópode_branco", "lagópode_escocês", "pato_real", "piadeira", "tetraz_grande", "cão_guaxinim", "lince_euroasiática", "galo_lira", "lebre_da_eurásia", "marrequinha_comum", "pato_olho_de_ouro", "zarro_negrinha", "veado_de_cauda_preta"]
    },
    new_england_mountains: {
        name: "New England Mountains",
        image: "reservas/new_england_mountains.png",
        animals: ["alce", "codorniz_da_virgínia", "coelho_da_flórida", "faisão_de_pescoço_anelado", "marrequinha_americana", "pato_olho_de_ouro", "pato_real", "peru_selvagem", "guaxinim_comum", "lince_pardo_do_mexico", "raposa_cinzenta", "veado_de_cauda_branca", "urso_negro", "coiote", "raposa_vermelha", "gamo"]
    },
    emerald_coast: {
        name: "Emerald Coast",
        image: "reservas/emerald_coast.png",
        animals: ["canguru_cinza_oriental", "codorna_de_restolho", "raposa_vermelha", "cabra_selvagem", "cervo_porco_indiano", "porco_selvagem", "veado_vermelho", "sambar", "cervo_de_timor", "gamo", "bantengue", "crocodilo_de_água_salgada", "ganso_pega", "chital"]
    },
    sundarpatan: {
        name: "Sundarpatan",
        image: "reservas/sundarpatan.png",
        animals: ["antílope_negro", "ganso_bravo", "lebre_peluda", "muntjac_vermelho_do_norte", "raposa_tibetana", "tahr", "carneiro_azul", "cervo_do_pântano", "nilgó", "búfalo_dágua", "leopardo_das_neves", "iaque_selvagem", "tigre_de_bengala", "javali"]
    },
    salzwiesen: {
        name: "Salzwiesen Park",
        image: "reservas/salzwiesen.png",
        animals: ["coelho_europeu", "frisada", "galo_lira", "guaxinim_comum", "raposa_vermelha", "ganso_campestre_da_tundra", "faisão_de_pescoço_anelado", "cão_guaxinim", "ganso_bravo", "marrequinha_comum", "pato_olho_de_ouro", "pato_real", "piadeira", "zarro_negrinha", "zarro_castanho", "veado_de_cauda_preta"]
    },
    askiy_ridge: {
        name: "Askiy Ridge",
        image: "reservas/askiy_ridge.png",
        animals: ["alce", "caribu_da_floresta_boreal", "urso_negro", "veado_mula", "bisão_da_floresta", "cabra_da_montanha", "antilocapra", "tetraz_azul", "pato_real", "pato_carolino", "marreca_arrebio", "ganso_do_canadá", "ganso_das_neves", "lobo_cinzento", "cervo_canadense", "veado_de_cauda_branca", "faisão_de_pescoço_anelado", "carneiro_selvagem", "castor_norte_americano"]
    }
};
const multiMountsData = {
    "a_fuga": {
        name: "A Fuga",
        animals: [
            { slug: "veado_vermelho", gender: "macho" },
            { slug: "veado_vermelho", gender: "femea" }
        ]
    },
    "abraco_do_urso": {
        name: "Abraço do Urso",
        animals: [
            { slug: "urso_cinzento", gender: "macho" },
            { slug: "urso_cinzento", gender: "macho" }
        ]
    },
    "adeus_filho": {
        name: "Adeus, Filho",
        animals: [
            { slug: "bisão_das_planícies", gender: "macho" },
            { slug: "lobo_cinzento", gender: "macho" },
            { slug: "lobo_cinzento", gender: "macho" }
        ]
    },
    "admiralces": {
        name: "Admiralces",
        animals: [
            { slug: "alce", gender: "macho" },
            { slug: "codorniz_da_virgínia", gender: "macho" }
        ]
    },
    "almoco_da_raposa": {
        name: "Almoço da Raposa",
        animals: [
            { slug: "raposa_vermelha", gender: "macho" },
            { slug: "lebre_da_cauda_branca", gender: "macho" }
        ]
    },
    "banquete_no_ar": {
        name: "Banquete no Ar",
        animals: [
            { slug: "raposa_vermelha", gender: "macho" },
            { slug: "faisão_de_pescoço_anelado", gender: "macho" }
        ]
    },
    "brincadeira_de_aves": {
        name: "Brincadeira de Aves",
        animals: [
            { slug: "lagópode_escocês", gender: "macho" },
            { slug: "cão_guaxinim", gender: "macho" }
        ]
    },
    "brincando_de_briga": {
        name: "Brincando de Briga",
        animals: [
            { slug: "lince_euroasiática", gender: "macho" },
            { slug: "lince_euroasiática", gender: "femea" }
        ]
    },
    "caudas_brancas_unidas": {
        name: "Caudas Brancas Unidas",
        animals: [
            { slug: "veado_de_cauda_branca", gender: "macho" },
            { slug: "veado_de_cauda_branca", gender: "macho" },
            { slug: "veado_de_cauda_branca", gender: "macho" }
        ]
    },
    "colisao": {
        name: "Colisão",
        animals: [
            { slug: "veado_de_cauda_preta", gender: "macho" },
            { slug: "onça_parda", gender: "macho" }
        ]
    },
    "competicao_amistosa": {
        name: "Competição Amistosa",
        animals: [
            { slug: "coiote", gender: "macho" },
            { slug: "coiote", gender: "macho" },
            { slug: "lebre_da_cauda_branca", gender: "macho" }
        ]
    },
    "corcas_unidas": {
        name: "Corças Unidas",
        animals: [
            { slug: "corça", gender: "macho" },
            { slug: "corça", gender: "macho" },
            { slug: "corça", gender: "macho" }
        ]
    },
    "davi_e_golias": {
        name: "Davi e Golias",
        animals: [
            { slug: "ganso_do_canadá", gender: "macho" },
            { slug: "bisão_europeu", gender: "macho" }
        ]
    },
    "de_cabeca": {
        name: "De Cabeça",
        animals: [
            { slug: "ibex_de_beceite", gender: "macho" },
            { slug: "ibex_de_gredos", gender: "macho" }
        ]
    },
    "decolagem_de_emergencia": {
        name: "Decolagem de Emergência",
        animals: [
            { slug: "coiote", gender: "macho" },
            { slug: "pato_real", gender: "macho" },
            { slug: "pato_real", gender: "macho" },
            { slug: "pato_real", gender: "femea" }
        ]
    },
    "despedida_do_solteiros": {
        name: "Despedida dos Solteiros",
        animals: [
            { slug: "veado_mula", gender: "macho" },
            { slug: "veado_mula", gender: "femea" },
            { slug: "veado_mula", gender: "femea" }
        ]
    },
    "dois_tipos_de_perus": {
        name: "Dois Tipos de Perus",
        animals: [
            { slug: "peru_selvagem", gender: "macho" },
            { slug: "peru_selvagem_do_rio_grande", gender: "macho" }
        ]
    },
    "espionagem_tatica": {
        name: "Espionagem Tática",
        animals: [
            { slug: "onça_parda", gender: "femea" },
            { slug: "veado_de_roosevelt", gender: "macho" }
        ]
    },
    "faisoes_em_fuga": {
        name: "Faisões em Fuga",
        animals: [
            { slug: "faisão_de_pescoço_anelado", gender: "macho" },
            { slug: "faisão_de_pescoço_anelado", gender: "macho" }
        ]
    },
    "falso_tronco": {
        name: "Falso Tronco",
        animals: [
            { slug: "jacaré_americano", gender: "macho" },
            { slug: "guaxinim_comum", gender: "macho" }
        ]
    },
    "fantasma_da_montanha": {
        name: "Fantasma da Montanha",
        animals: [
            { slug: "leopardo_das_neves", gender: "macho" },
            { slug: "carneiro_azul", gender: "macho" }
        ]
    },
    "fartura_de_bisoes": {
        name: "Fartura de Bisões",
        animals: [
            { slug: "bisão_europeu", gender: "macho" },
            { slug: "bisão_europeu", gender: "macho" }
        ]
    },
    "gamos_unidos": {
        name: "Gamos Unidos",
        animals: [
            { slug: "gamo", gender: "macho" },
            { slug: "gamo", gender: "macho" },
            { slug: "gamo", gender: "macho" }
        ]
    },
    "ganha_pao": {
        name: "Ganha-pão",
        animals: [
            { slug: "búfalo_africano", gender: "macho" },
            { slug: "leão", gender: "macho" },
            { slug: "leão", gender: "femea" },
            { slug: "leão", gender: "femea" }
        ]
    },
    "gansos_zangados": {
        name: "Gansos Zangados",
        animals: [
            { slug: "ganso_do_canadá", gender: "macho" },
            { slug: "ganso_do_canadá", gender: "macho" }
        ]
    },
    "gluglu": {
        name: "Gluglu",
        animals: [
            { slug: "peru_selvagem", gender: "macho" },
            { slug: "peru_selvagem", gender: "femea" },
            { slug: "peru_selvagem", gender: "femea" }
        ]
    },
    "lanchinho_de_tigre": {
        name: "Lanchinho de Tigre",
        animals: [
            { slug: "tahr", gender: "macho" },
            { slug: "tahr", gender: "femea" },
            { slug: "tahr", gender: "femea" }
        ]
    },
    "laod_a_lado": {
        name: "Laod a Lado",
        animals: [
            { slug: "veado_de_cauda_branca", gender: "macho" },
            { slug: "veado_de_cauda_branca", gender: "macho" }
        ]
    },
    "lebres_rivais": {
        name: "Lebres Rivais",
        animals: [
            { slug: "lebre_antílope", gender: "macho" },
            { slug: "lebre_antílope", gender: "macho" }
        ]
    },
    "lobo_alfa": {
        name: "Lobo Alfa",
        animals: [
            { slug: "lobo_cinzento", gender: "macho" },
            { slug: "lobo_cinzento", gender: "femea" },
            { slug: "lobo_cinzento", gender: "femea" }
        ]
    },
    "marujos_de_agua_doce": {
        name: "Marujos de Água Doce",
        animals: [
            { slug: "faisão_de_pescoço_anelado", gender: "macho" },
            { slug: "tetraz_grande", gender: "macho" },
            { slug: "ganso_bravo", gender: "macho" },
            { slug: "ganso_campestre_da_tundra", gender: "macho" }
        ]
    },
    "necessidades_basicas": {
        name: "Necessidades Básicas",
        animals: [
            { slug: "urso_negro", gender: "macho" },
            { slug: "urso_negro", gender: "macho" }
        ]
    },
    "o_grand_slam": {
        name: "O Grand Slam",
        animals: [
            { slug: "ibex_de_beceite", gender: "macho" },
            { slug: "ibex_de_gredos", gender: "macho" },
            { slug: "ibex_de_ronda", gender: "macho" },
            { slug: "ibex_espanhol_do_sudeste", gender: "macho" }
        ]
    },
    "operador_suave": {
        name: "Operador Suave",
        animals: [
            { slug: "tetraz_grande", gender: "macho" },
            { slug: "tetraz_grande", gender: "femea" },
            { slug: "tetraz_grande", gender: "femea" }
        ]
    },
    "os_tres_patinhos": {
        name: "Os Três Patinhos",
        animals: [
            { slug: "piadeira", gender: "macho" },
            { slug: "zarro_castanho", gender: "macho" },
            { slug: "frisada", gender: "macho" }
        ]
    },
    "parceiros_no_crime": {
        name: "Parceiros no Crime",
        animals: [
            { slug: "raposa_vermelha", gender: "macho" },
            { slug: "raposa_vermelha", gender: "macho" }
        ]
    },
    "presas_a_mostra": {
        name: "Presas à Mostra",
        animals: [
            { slug: "muflão_ibérico", gender: "macho" },
            { slug: "lobo_ibérico", gender: "macho" },
            { slug: "lobo_ibérico", gender: "macho" },
            { slug: "lobo_ibérico", gender: "macho" }
        ]
    },
    "procos_do_mato_em_conflito": {
        name: "Procos-do-Mato em Conflito",
        animals: [
            { slug: "caititu", gender: "macho" },
            { slug: "caititu", gender: "macho" }
        ]
    },
    "ramboru": {
        name: "Ramboru",
        animals: [
            { slug: "canguru_cinza_oriental", gender: "macho" },
            { slug: "canguru_cinza_oriental", gender: "macho" }
        ]
    },
    "raposas_adversarias": {
        name: "Raposas Adversárias",
        animals: [
            { slug: "raposa_vermelha", gender: "macho" },
            { slug: "raposa_cinzenta", gender: "macho" }
        ]
    },
    "realeza": {
        name: "Realeza",
        animals: [
            { slug: "leão", gender: "macho" },
            { slug: "leão", gender: "femea" }
        ]
    },
    "rixa_de_aves": {
        name: "Rixa de Aves",
        animals: [
            { slug: "galo_lira", gender: "macho" },
            { slug: "galo_lira", gender: "macho" }
        ]
    },
    "saindo_de_fininho": {
        name: "Saindo de Fininho",
        animals: [
            { slug: "pato_real", gender: "macho" },
            { slug: "pato_olho_de_ouro", gender: "macho" },
            { slug: "zarro_negrinha", gender: "macho" },
            { slug: "marrequinha_comum", gender: "macho" },
            { slug: "piadeira", gender: "macho" },
            { slug: "zarro_castanho", gender: "macho" },
   Desta vez, acredito que o erro foi resolvido. A causa era um pouco mais complexa e envolvia a ordem em que os elementos da página eram criados e os eventos de clique eram adicionados.

Abaixo estão os arquivos completos e revisados. A principal mudança está no arquivo `script.js`. Eu reestruturei algumas funções para garantir que os elementos da página sempre existam antes de tentarmos manipulá-los.

Por favor, substitua os conteúdos dos seus dois arquivos por estes abaixo.

---

### Arquivo: `index.html` (Completo)

*Nenhuma mudança neste arquivo, mas estou incluindo para garantir que você tenha a versão correta.*
```html
<!DOCTYPE html>
<html lang="pt-br">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <link rel="manifest" href="manifest.json">
    <meta name="theme-color" content="#181a1b">
    <title>Álbum de Caça - theHunter: Call of the Wild</title>
    <link rel="stylesheet" href="[https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.1/css/all.min.css](https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.1/css/all.min.css)">
    <style>
        @import url('[https://fonts.googleapis.com/css2?family=Oswald:wght@400;700&family=Nunito+Sans:wght@400;700&display=swap](https://fonts.googleapis.com/css2?family=Oswald:wght@400;700&family=Nunito+Sans:wght@400;700&display=swap)');
        
        :root {
            --bg-color: #181a1b;
            --surface-color: #2c2f33;
            --primary-color: #00bcd4;
            --border-color: #4a5568;
            --text-color: #e6e6e6;
            --text-color-muted: #99aab5;
            --gold-color: #ffd700;
            --bronze-color: #cd7f32;
            --silver-color: #c0c0c0;
            --font-headings: 'Oswald', sans-serif;
            --font-body: 'Nunito Sans', sans-serif;
        }

        * { 
            box-sizing: border-box; 
            margin: 0;
            padding: 0;
        }

        body {
            font-family: var(--font-body);
            color: var(--text-color);
            overflow-x: hidden;
            background-image: linear-gradient(rgba(0, 0, 0, 0.6), rgba(0, 0, 0, 0.6)), url('background.jpg');
            background-size: cover;
            background-position: center;
            background-attachment: fixed;
        }

        /* --- ESTILOS GERAIS --- */
        .main-content { padding: 20px 40px; background-color: rgba(24, 26, 27, 0.8); min-height: 100vh; }
        .page-header { display: flex; justify-content: space-between; align-items: center; border-bottom: 2px solid var(--primary-color); padding-bottom: 10px; margin-bottom: 25px; }
        .page-header h2 { font-family: var(--font-headings); font-size: 2.5rem; }
        .back-button { background: var(--surface-color); color: var(--text-color); border: 1px solid var(--border-color); padding: 10px 20px; border-radius: 6px; cursor: pointer; font-size: 1rem; font-family: var(--font-headings); transition: all 0.2s ease; }
        .back-button:hover { background: var(--primary-color); color: #111827; }
        
        /* --- HUB DE NAVEGAÇÃO (CORRIGIDO) --- */
        .navigation-hub { display: flex; flex-wrap: wrap; justify-content: center; align-items: center; gap: 30px; padding: 40px; min-height: 100vh; width: 100%; }
        .hub-title { width: 100%; text-align: center; font-family: var(--font-headings); font-size: 4rem; letter-spacing: 3px; color: #f0f0f0; text-transform: uppercase; text-shadow: 2px 2px 8px rgba(0, 0, 0, 0.8); margin-bottom: 40px; }
        .nav-card { background-color: rgba(44, 47, 51, 0.75); border: 1px solid var(--border-color); border-radius: 8px; width: 260px; height: 100px; display: flex; flex-direction: column; justify-content: center; align-items: center; gap: 10px; cursor: pointer; transition: all 0.3s ease; font-family: var(--font-headings); font-size: 1.2rem; text-transform: uppercase; letter-spacing: 1px; color: var(--text-color-muted); backdrop-filter: blur(5px); -webkit-backdrop-filter: blur(5px); }
        .nav-card i { font-size: 2rem; transition: color 0.3s ease; }
        .nav-card:hover { transform: translateY(-10px) scale(1.03); background-color: rgba(64, 68, 75, 0.9); color: var(--primary-color); border-color: var(--primary-color); box-shadow: 0 0 25px rgba(0, 188, 212, 0.4); }
        
        /* --- GRIDES DE CARDS GERAIS (ANIMAIS, RESERVAS, PELAGENS) --- */
        .filter-input { width: 100%; background-color: rgba(0, 0, 0, 0.3); border: 1px solid var(--border-color); border-radius: 20px; padding: 10px 20px; font-size: 1rem; color: var(--text-color); transition: all 0.3s ease; margin-bottom: 30px; }
        .filter-input:focus { outline: none; border-color: var(--primary-color); box-shadow: 0 0 10px rgba(0, 188, 212, 0.5); }
        .album-grid, .fur-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(180px, 1fr)); gap: 20px; }
        
        /* ESTILO PARA CARD DE ANIMAL (TELA PRINCIPAL DE CADA CATEGORIA) */
        .animal-card { background: linear-gradient(145deg, #383c4a, #2c2f33); border: 1px solid #4a5568; border-radius: 8px; padding: 15px; text-align: center; cursor: pointer; transition: all 0.3s ease; position: relative; overflow: hidden; box-shadow: 0 4px 15px rgba(0, 0, 0, 0.2); }
        .animal-card:hover { transform: translateY(-5px); border-color: var(--primary-color); }
        .animal-card img { width: 100%; height: 110px; object-fit: contain; margin-bottom: 15px; transition: all 0.3s ease-in-out; filter: invert(90%) sepia(6%) saturate(82%) hue-rotate(186deg) brightness(96%) contrast(95%); }
        .animal-card:hover img { transform: scale(1.1); filter: invert(90%) sepia(6%) saturate(82%) hue-rotate(186deg) brightness(96%) contrast(95%) drop-shadow(0 0 8px rgba(255, 255, 255, 0.7)); }
        .animal-card .info { font-family: var(--font-headings); font-size: 1rem; color: var(--text-color); font-weight: 700; }
        .animal-card.incomplete img { filter: grayscale(100%) brightness(0.5); }
        .animal-card.incomplete .info { color: var(--text-color-muted); }
        .animal-card.inprogress { border-color: #f0ad4e; }
        .animal-card.inprogress img { filter: invert(70%) sepia(6%) saturate(82%) hue-rotate(186deg) brightness(70%) contrast(95%); }
        .animal-card.completed { border-color: var(--primary-color); box-shadow: 0 0 20px rgba(0, 188, 212, 0.5); }
        .animal-card.completed img { filter: invert(65%) sepia(74%) saturate(1450%) hue-rotate(145deg) brightness(95%) contrast(101%) drop-shadow(0 0 5px var(--primary-color)); }
        .animal-card.completed::after { font-family: "Font Awesome 6 Free"; content: "\f058"; font-weight: 900; position: absolute; top: 10px; right: 10px; font-size: 1.5rem; color: var(--primary-color); background-color: var(--surface-color); border-radius: 50%; text-shadow: 0 0 8px rgba(0, 0, 0, 0.9); }
        
        /* --- ESTILO PARA OS CARDS DENTRO DAS PÁGINAS DE DETALHES (PELAGENS, DIAMANTES) --- */
        .fur-card {
            background: linear-gradient(145deg, #2c2f33, #232529);
            box-shadow: 0 4px 15px rgba(0,0,0,0.2), inset 0 1px 2px rgba(255,255,255,0.05);
            border-radius: 8px;
            padding: 10px;
            text-align: center;
            transition: all 0.3s ease;
            border: 2px solid transparent;
            display: flex;
            flex-direction: column;
            justify-content: space-between;
            gap: 10px;
            position: relative;
        }
        .fur-card:hover { transform: scale(1.05); }
        .fur-card img { width: 100%; height: 120px; object-fit: cover; border-radius: 4px; }
        .fur-card .info { font-family: var(--font-headings); font-size: 1rem; line-height: 1.3; font-weight: 700; }
        .fullscreen-btn { position: absolute; top: 8px; right: 8px; background-color: rgba(0, 0, 0, 0.6); color: white; border: none; border-radius: 50%; width: 28px; height: 28px; cursor: pointer; display: flex; align-items: center; justify-content: center; font-size: 16px; line-height: 28px; opacity: 0; transition: opacity 0.2s ease-in-out; z-index: 10; }
        .fur-card:hover .fullscreen-btn { opacity: 1; }

        /* ESTADOS DO .FUR-CARD */
        .fur-card.incomplete img { filter: grayscale(80%) brightness(0.6); transition: all 0.3s ease; }
        .fur-card.incomplete:hover img { filter: grayscale(50%) brightness(0.8); }
        .fur-card.incomplete .info { color: var(--text-color-muted); }
        
        /* Ajuste para PELAGENS RARAS */
        .dossier-content .fur-card.completed, .main-content .fur-grid .fur-card.completed { 
            border-color: var(--primary-color); 
            box-shadow: 0 0 15px rgba(0, 188, 212, 0.3);
        }
        .dossier-content .fur-card.completed .info, .main-content .fur-grid .fur-card.completed .info {
            color: var(--primary-color);
        }

        /* Ajuste para DIAMANTES */
        .main-content .fur-grid .fur-card.completed:not(.trophy-frame) {
            border-color: var(--gold-color);
            box-shadow: 0 0 15px rgba(255, 215, 0, 0.3), 0 4px 15px rgba(0,0,0,0.2), inset 0 1px 2px rgba(255,215,0,0.1);
        }
        .main-content .fur-grid .fur-card.completed:not(.trophy-frame) .info {
            color: var(--text-color);
        }

        /* ELEMENTOS INTERNOS DO CARD DE DIAMANTE */
        .fur-card .info-header { margin-bottom: 10px; }
        .fur-card .gender-tag { font-size: 0.75rem; padding: 2px 6px; border-radius: 4px; background-color: rgba(0,0,0,0.2); color: var(--text-color-muted); font-weight: bold; text-transform: uppercase; }
        .fur-card.completed .gender-tag { background-color: rgba(255, 215, 0, 0.1); color: var(--gold-color); }
        .fur-card .score-container { margin-top: auto; padding: 8px; border-radius: 6px; background-color: rgba(0,0,0,0.2); transition: background-color 0.3s ease; cursor: pointer; }
        .fur-card:hover .score-container { background-color: rgba(0,0,0,0.4); }
        .fur-card .score-add-btn { font-weight: bold; color: var(--text-color-muted); font-size: 0.9rem; }
        .fur-card .score-display { font-size: 1.2rem; font-weight: bold; color: var(--gold-color); }
        .fur-card .score-display .fa-trophy { margin-right: 8px; font-size: 1rem; opacity: 0.8; }
        .fur-card .score-input { width: 100%; background-color: var(--bg-color); border: 1px solid var(--gold-color); color: var(--gold-color); text-align: center; font-size: 1.2rem; border-radius: 4px; padding: 4px; font-family: var(--font-headings); }
        .fur-card .score-input:focus { outline: none; box-shadow: 0 0 10px rgba(255, 215, 0, 0.5); }
        .fur-card.completed img { filter: none; transition: all 0.3s ease; }
        .fur-card.completed:hover img { transform: scale(1.05); }

        /* --- MODAIS --- */
        .modal-overlay { display: none; position: fixed; z-index: 1000; left: 0; top: 0; width: 100%; height: 100%; background-color: rgba(0,0,0,0.85); align-items: center; justify-content: center; backdrop-filter: blur(4px); }
        .modal-content-viewer { max-width: 90%; max-height: 90%; object-fit: contain; }
        .modal-close { position: absolute; top: 15px; right: 35px; color: #f1f1f1; font-size: 40px; font-weight: bold; transition: 0.3s; cursor: pointer; z-index: 1001; }
        .modal-close:hover, .modal-close:focus { color: #bbb; text-decoration: none; }
        .modal-content-box { background: var(--surface-color); padding: 25px; border-radius: 8px; border: 1px solid var(--border-color); width: 90%; max-width: 600px; box-shadow: 0 5px 25px rgba(0,0,0,0.5); }
        .modal-content-box h3 { border-bottom: 1px solid var(--primary-color); padding-bottom: 10px; margin-bottom: 15px; }
        .modal-buttons { display: flex; justify-content: flex-end; gap: 10px; margin-top: 20px; }

        /* --- ESTILOS SALA DE TROFÉUS (GREAT ONES) --- */
        .greats-grid { background: linear-gradient(rgba(0,0,0,0.5), rgba(0,0,0,0.5)), url([https://www.transparenttextures.com/patterns/wood-pattern.png](https://www.transparenttextures.com/patterns/wood-pattern.png)); background-color: #4a3c31; padding: 25px; border-radius: 8px; gap: 25px; }
        .fur-card.trophy-frame { background: linear-gradient(145deg, #4a3f3a, #3b322d); border: 8px solid #3b2e26; border-image: linear-gradient(145deg, #6d5b51, #3b2e26) 1; box-shadow: 0 10px 20px rgba(0,0,0,0.4), inset 0 0 15px rgba(0,0,0,0.5); padding: 10px; gap: 5px; }
        .fur-card.trophy-frame:hover { box-shadow: 0 0 25px var(--gold-color), inset 0 0 15px rgba(0,0,0,0.5); }
        .trophy-frame img { border: 2px solid #2a211c; }
        .trophy-frame .info-plaque { background-color: rgba(0,0,0,0.3); padding: 8px 5px; border-radius: 4px; margin-top: 5px; }
        .trophy-frame .info { color: var(--gold-color); font-size: 1rem; line-height: 1.1; }
        .trophy-frame .kill-counter { color: var(--text-color-muted); font-size: 0.9rem; }
        .trophy-frame .kill-counter .fa-trophy { color: var(--gold-color); margin-right: 5px; }
        .trophy-frame.incomplete img { filter: grayscale(1) brightness(0.5); }
        .trophy-frame.incomplete .info { color: var(--text-color-muted); }
        .trophy-log-list { list-style: none; padding: 0; max-height: 150px; overflow-y: auto; margin-bottom: 15px; }
        .trophy-log-list li { display: flex; justify-content: space-between; padding: 10px; background-color: var(--bg-color); border-radius: 4px; margin-bottom: 5px; }
        .trophy-log-list .delete-trophy-btn { background: #d9534f; border: none; color: white; border-radius: 4px; cursor: pointer; padding: 0 10px; }
        .add-trophy-form table { width: 100%; border-spacing: 0 10px; }
        .add-trophy-form input { width: 100%; padding: 8px; background-color: var(--bg-color); border: 1px solid var(--border-color); color: white; border-radius: 4px; }
        
        /* --- ESTILOS RESERVAS e DOSSIÊ --- */
        .reserves-grid { grid-template-columns: repeat(auto-fill, minmax(250px, 1fr)); gap: 25px; }
        .reserve-card { height: 180px; position: relative; border-radius: 8px; overflow: hidden; cursor: pointer; display: flex; flex-direction: column; justify-content: space-between; border: 2px solid transparent; transition: all 0.3s ease; }
        .reserve-card:hover { transform: scale(1.03); border-color: var(--primary-color); }
        .reserve-card-bg { position: absolute; top:0; left:0; width:100%; height:100%; background-size: cover; background-position: center; transition: transform 0.4s ease; }
        .reserve-card:hover .reserve-card-bg { transform: scale(1.1); }
        .reserve-card-overlay { position: absolute; top:0; left:0; width:100%; height:100%; background: linear-gradient(to top, rgba(0,0,0,0.9) 20%, rgba(0,0,0,0.1) 60%); }
        .reserve-card-content { position: relative; z-index: 2; padding: 15px; display: flex; flex-direction: column; height: 100%; justify-content: flex-end; }
        .reserve-card-logo { max-height: 50px; width: auto; max-width: 80%; margin-bottom: 10px; filter: drop-shadow(0 2px 3px black); }
        .reserve-card-stats { display: flex; gap: 15px; font-size: 0.9rem; align-items: center; color: var(--text-color-muted); }
        .reserve-card-stats i { color: var(--primary-color); }
        .reserve-card-stats .fa-crown { color: var(--gold-color); }
        .animal-checklist { display: flex; flex-direction: column; gap: 10px; }
        .animal-checklist-row { display: grid; grid-template-columns: 50px 1fr auto; align-items: center; gap: 15px; background-color: var(--surface-color); padding: 10px; border-radius: 6px; cursor: pointer; transition: all 0.2s ease; }
        .animal-checklist-row:hover { background-color: #3c3f43; transform: translateX(5px); }
        .animal-checklist-row .animal-icon { width: 40px; height: 40px; filter: invert(90%) sepia(6%) saturate(82%) hue-rotate(186deg) brightness(96%) contrast(95%); }
        .animal-checklist-row .animal-name { font-family: var(--font-headings); font-size: 1.1rem; }
        .animal-checklist-row .mini-progress-bars { display: flex; flex-direction: column; gap: 5px; }
        .mini-progress { display: flex; align-items: center; gap: 8px; font-size: 0.8rem; }
        .mini-progress-bar-container { flex-grow: 1; height: 8px; background-color: var(--bg-color); border-radius: 4px; }
        .mini-progress-bar { height: 100%; background-color: var(--primary-color); border-radius: 4px; }
        .great-one-indicator { font-size: 1.5rem; color: var(--gold-color); opacity: 0.5; }
        .great-one-indicator.possible { opacity: 1; }
        .dossier-tabs { display: flex; border-bottom: 2px solid var(--border-color); margin-bottom: 20px; }
        .dossier-tab { padding: 10px 20px; cursor: pointer; color: var(--text-color-muted); border-bottom: 3px solid transparent; transition: all 0.2s ease; font-family: var(--font-headings); }
        .dossier-tab:hover { color: var(--text-color); }
        .dossier-tab.active { color: var(--primary-color); border-bottom-color: var(--primary-color); }
        .dossier-tab .fa-crown { color: var(--gold-color); }
        
        /* --- ESTILOS PAINEL DE PROGRESSO (RESTAURADOS) --- */
        .progress-view-container { display: flex; flex-direction: column; gap: 30px; }
        .latest-achievements-panel { background: linear-gradient(rgba(0,0,0,0.4), rgba(0,0,0,0.4)), url([https://www.transparenttextures.com/patterns/leather.png](https://www.transparenttextures.com/patterns/leather.png)); background-color: #3a3834; padding: 20px; border-radius: 8px; border: 1px solid #5a554a; }
        .latest-achievements-panel h3 { font-family: var(--font-headings); letter-spacing: 1px; border-bottom: 1px solid var(--border-color); padding-bottom: 10px; margin-bottom: 20px; }
        .achievements-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(180px, 1fr)); gap: 25px; justify-items: center; }
        .achievement-card { background-color: #f0ead6; padding: 10px 10px 15px 10px; border-radius: 4px; box-shadow: 3px 3px 8px rgba(0,0,0,0.4); transition: transform 0.2s ease, box-shadow 0.2s ease; width: 90%; cursor: pointer; }
        .achievement-card:hover { transform: scale(1.05); box-shadow: 6px 6px 12px rgba(0,0,0,0.5); z-index: 10; }
        .achievement-card img { width: 100%; height: 100px; object-fit: cover; background-color: #333; border: 1px solid #ccc; }
        .achievement-card-info { padding-top: 8px; text-align: center; }
        .achievement-card-info .animal-name { font-family: var(--font-body); font-style: italic; font-size: 1rem; color: #444; font-weight: 700; }
        .achievement-card-info .fur-name { font-size: 0.8rem; color: #666; }
        #progress-panel { display: flex; flex-direction: column; gap: 20px; }
        .progress-section { background-color: var(--surface-color); padding: 15px 20px; border-radius: 8px; cursor: pointer; transition: all 0.2s ease-in-out; border: 1px solid var(--border-color); }
        .progress-section:hover { background-color: #36393f; border-color: var(--primary-color); }
        .progress-header { display: flex; justify-content: space-between; align-items: center; }
        .progress-header h3 { margin: 0; font-family: var(--font-headings); }
        .progress-title-container { display: flex; align-items: center; gap: 10px; }
        .progress-medal { font-size: 1.5rem; }
        .progress-medal.bronze { color: var(--bronze-color); }
        .progress-medal.silver { color: var(--silver-color); }
        .progress-medal.gold { color: var(--gold-color); }
        .progress-label { text-align: right; color: var(--text-color-muted); font-size: 0.9rem; font-weight: bold; }
        .progress-bar-container { background-color: var(--bg-color); border-radius: 5px; overflow: hidden; height: 12px; margin-top: 10px; }
        .progress-bar-fill { background: linear-gradient(90deg, #43A047, #66BB6A); height: 100%; transition: width 0.5s ease; border-radius: 5px; }
        .progress-detail-view { margin-top: 15px; padding-top: 15px; border-top: 1px solid var(--border-color); display: flex; flex-direction: column; gap: 8px; }
        .progress-detail-item { display: flex; align-items: center; justify-content: space-between; font-size: 0.9rem; }
        .progress-detail-item .label { color: var(--text-color-muted); }
        .progress-detail-item .value { font-weight: bold; }

        /* --- ESTILOS PARA MONTAGENS MÚLTIPLAS E SEU MODAL --- */
        .mounts-grid {
            display: grid;
            grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
            gap: 25px;
        }
        .mount-card {
            background: var(--surface-color);
            border: 1px solid var(--border-color);
            border-radius: 8px;
            padding: 20px;
            display: flex;
            flex-direction: column;
            gap: 15px;
            transition: all 0.3s ease;
            position: relative;
            overflow: hidden;
            cursor: pointer;
        }
        .mount-card:hover {
            transform: translateY(-5px);
            border-color: var(--primary-color);
        }
        .mount-card.completed {
            border-color: var(--gold-color);
            box-shadow: 0 0 15px rgba(255, 215, 0, 0.2);
        }
        .mount-card-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
        }
        .mount-card-header h3 {
            font-family: var(--font-headings);
            color: var(--text-color);
            margin: 0;
        }
        .mount-progress {
            font-size: 0.9rem;
            font-weight: bold;
            color: var(--text-color-muted);
            background-color: var(--bg-color);
            padding: 4px 8px;
            border-radius: 12px;
        }
        .mount-card-animals {
            display: flex;
            gap: 5px;
            padding-top: 10px;
            border-top: 1px solid var(--border-color);
            filter: grayscale(0.5);
            opacity: 0.7;
        }
        .mount-card-animals img {
            width: 40px;
            height: 40px;
            object-fit: contain;
            filter: invert(80%);
        }
        .mount-card.completed .mount-card-animals {
            filter: grayscale(0);
            opacity: 1;
        }
        .mount-card.completed .mount-card-animals img {
            filter: invert(65%) sepia(74%) saturate(1450%) hue-rotate(145deg) brightness(95%) contrast(101%);
        }
        .mount-completed-banner {
            position: absolute;
            top: 15px;
            right: -50px;
            background-color: var(--gold-color);
            color: var(--bg-color);
            padding: 5px 40px;
            font-weight: bold;
            font-family: var(--font-headings);
            transform: rotate(45deg);
            box-shadow: 0 0 10px rgba(0,0,0,0.5);
            font-size: 0.8rem;
        }
        .mount-detail-list {
            list-style: none;
            padding: 0;
            display: flex;
            flex-direction: column;
            gap: 12px;
        }
        .mount-detail-item {
            display: flex;
            flex-direction: column;
            gap: 4px;
            padding-bottom: 8px;
            border-bottom: 1px dashed var(--border-color);
        }
        .mount-detail-item:last-child { border-bottom: none; }
        .detail-item-header {
            display: flex;
            align-items: center;
            gap: 10px;
            font-size: 1.1rem;
        }
        .detail-item-header .fa-mars { color: #63b3ed; }
        .detail-item-header .fa-venus { color: #f687b3; }
        .detail-item-body {
            font-size: 0.9rem;
            padding-left: 26px;
            color: var(--text-color-muted);
        }
        .detail-item-body .fa-check-circle { color: var(--gold-color); }
        .detail-item-body .fa-times-circle { color: #d9534f; }
        .detail-item-body strong { color: var(--text-color); }
        
        /* --- ESTILOS CONTADOR DE GRIND --- */
        .grind-container {
            display: flex;
            flex-direction: column;
            align-items: center;
            gap: 30px;
        }
        .grind-header {
            text-align: center;
            font-family: var(--font-headings);
        }
        .grind-header .grind-animal-icon {
            width: 80px;
            height: 80px;
            filter: invert(1);
            margin-bottom: 10px;
        }
        .grind-header h2 {
            font-size: 2.5rem;
            color: var(--text-color);
        }
        .grind-header span {
            font-size: 1.2rem;
            color: var(--text-color-muted);
        }
        .counter-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
            gap: 20px;
            width: 100%;
            max-width: 1000px;
        }
        .counter-box {
            background-color: var(--surface-color);
            border-radius: 8px;
            border: 1px solid var(--border-color);
            padding: 15px;
            display: flex;
            flex-direction: column;
        }
        .counter-box.wide {
            grid-column: span 2;
        }
        @media (max-width: 800px) {
            .counter-box.wide {
                grid-column: span 1;
            }
        }
        .counter-box .box-header {
            font-family: var(--font-headings);
            font-size: 1.1rem;
            color: var(--text-color-muted);
            margin-bottom: 15px;
        }
        .counter-box .box-header .fas {
            margin-right: 10px;
        }
        .counter-box .box-content {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-top: auto;
        }
        .counter-box .count-value {
            font-size: 2.5rem;
            font-weight: bold;
            font-family: var(--font-headings);
        }
        .counter-box .add-btn {
            background-color: var(--border-color);
            color: var(--text-color);
            border: none;
            width: 40px;
            height: 40px;
            border-radius: 8px;
            font-size: 1.2rem;
            cursor: pointer;
            transition: all 0.2s ease;
        }
        .counter-box .add-btn:hover {
            background-color: var(--primary-color);
            color: #111;
        }
        /* Cores dos Ícones */
        .box-header .diamond { color: var(--primary-color); }
        .box-header .rare { color: #d69e3a; }
        .box-header .troll { color: #a07a53; }
        .box-header .super-rare { color: #e8bd4a; text-shadow: 0 0 5px #ffc107; }
        .box-header .great-one { color: var(--gold-color); }
        .counter-box.total { background-color: #1e2124; }

        /* --- ESTILOS DASHBOARD DE GRIND --- */
        .new-grind-card {
            background: var(--surface-color);
            border: 2px dashed var(--border-color);
            border-radius: 8px;
            padding: 30px;
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            text-align: center;
            color: var(--text-color-muted);
            cursor: pointer;
            transition: all 0.3s ease;
            margin-bottom: 30px;
        }
        .new-grind-card:hover {
            border-color: var(--primary-color);
            color: var(--primary-color);
            background-color: #36393f;
        }
        .new-grind-card i {
            font-size: 3rem;
            margin-bottom: 15px;
        }
        .new-grind-card span {
            font-family: var(--font-headings);
            font-size: 1.5rem;
        }
        .section-divider {
            text-align: center;
            font-family: var(--font-headings);
            color: var(--text-color-muted);
            margin-bottom: 20px;
            text-transform: uppercase;
            letter-spacing: 1px;
        }
        .active-grinds-grid {
            display: grid;
            grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
            gap: 20px;
        }
        .grind-session-card {
            position: relative;
            height: 120px;
            border-radius: 8px;
            overflow: hidden;
            cursor: pointer;
            border: 1px solid var(--border-color);
            transition: all 0.3s ease;
        }
        .grind-session-card:hover {
            transform: scale(1.05);
            box-shadow: 0 0 15px rgba(0,0,0,0.4);
        }
        .grind-session-bg {
            position: absolute;
            width: 100%;
            height: 100%;
            background-size: cover;
            background-position: center;
            filter: blur(2px) brightness(0.7);
        }
        .grind-session-overlay {
            position: absolute;
            width: 100%;
            height: 100%;
            background: linear-gradient(90deg, rgba(44,47,51,0.85) 0%, rgba(44,47,51,0.4) 100%);
        }
        .grind-session-content {
            position: relative;
            padding: 15px;
            display: flex;
            align-items: center;
            gap: 15px;
            height: 100%;
        }
        .grind-session-content .animal-icon {
            width: 90px;
            height: 90px;
            object-fit: contain;
            filter: invert(1) drop-shadow(0 2px 3px black);
            flex-shrink: 0;
        }
        .grind-session-content .session-info {
            display: flex;
            flex-direction: column;
        }
        .session-info .animal-name {
            font-family: var(--font-headings);
            font-size: 1.5rem;
            color: var(--text-color);
            font-weight: 700;
        }
        .session-info .reserve-name {
            font-size: 1rem;
            color: var(--text-color-muted);
        }
    </style>
</head>
<body>
    <div id="app-container"></div>

    <div id="image-viewer-modal" class="modal-overlay">
      <span class="modal-close">&times;</span>
      <img class="modal-content-viewer" id="modal-image">
    </div>

    <div id="form-modal" class="modal-overlay">
        </div>

    <script src="script.js" defer></script>
</body>
</html>