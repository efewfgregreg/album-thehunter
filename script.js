const saveDataKey = 'theHunterAlbumData';

function loadData() {
    try {
        const data = localStorage.getItem(saveDataKey);
        const parsedData = data ? JSON.parse(data) : {};
        if (parsedData.diamantes) {
            for (const slug in parsedData.diamantes) {
                // Garante que o dado para cada animal na seção de diamantes seja sempre um array.
                // Se for um formato antigo (que não é um array), ele será resetado para uma lista vazia.
                if (!Array.isArray(parsedData.diamantes[slug])) {
                    parsedData.diamantes[slug] = [];
                }
            }
        }
        return parsedData;
    } catch (e) {
        console.error("Erro ao carregar dados do localStorage", e);
        localStorage.clear(); // Limpa dados corrompidos
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

// --- FUNÇÕES E LÓGICA PRINCIPAL ---

function slugify(text) {
    return text.toLowerCase().replace(/[-\s]+/g, '_').replace(/'/g, '');
}

const categorias = {
    pelagens: { title: 'Pelagens Raras', items: items },
    diamantes: { title: 'Diamantes', items: items },
    greats: { title: 'Greats One', items: ["Alce", "Urso Negro", "Veado-Mula", "Veado Vermelho", "Veado-de-cauda-branca", "Raposa", "Faisão", "Gamo", "Tahr"] },
    super_raros: { title: 'Super Raros', items: Object.keys(rareFursData).filter(slug => (rareFursData[slug].macho?.length > 0) || (rareFursData[slug].femea?.length > 0)).map(slug => items.find(item => slugify(item) === slug) || slug) },
    reservas: { title: 'Reservas de Caça' },
    progresso: { title: 'Painel de Progresso' }
};

let appContainer;

function checkAndSetGreatOneCompletion(slug, currentData) {
    const requiredFurs = greatsFursData[slug];
    if (!requiredFurs || !currentData) return;
    currentData.completo = requiredFurs.every(furName => currentData.furs?.[furName]?.trophies?.length > 0);
}

function renderNavigationHub() {
    appContainer.innerHTML = '';
    
    const hub = document.createElement('div');
    hub.className = 'navigation-hub';
    
    const title = document.createElement('h1');
    title.className = 'hub-title';
    title.textContent = 'Álbum de Caça';
    hub.appendChild(title);

    const icons = {
        pelagens: "fas fa-paw",
        diamantes: "fas fa-gem",
        greats: "fas fa-crown",
        super_raros: "fas fa-star",
        reservas: "fas fa-map-marked-alt",
        progresso: "fas fa-chart-line"
    };

    Object.keys(categorias).forEach(key => {
        const cat = categorias[key];
        const card = document.createElement('div');
        card.className = 'nav-card';
        card.innerHTML = `
            <i class="${icons[key] || 'fas fa-question-circle'}"></i>
            <span>${cat.title}</span>
        `;
        card.dataset.target = key;
        card.addEventListener('click', () => renderMainView(key));
        hub.appendChild(card);
    });

    appContainer.appendChild(hub);
}

function renderMainView(tabKey) {
    appContainer.innerHTML = '';
    const currentTab = categorias[tabKey];
    if (!currentTab) return;

    const mainContent = document.createElement('div');
    mainContent.className = 'main-content';

    const header = document.createElement('div');
    header.className = 'page-header';
    
    const title = document.createElement('h2');
    title.textContent = currentTab.title;
    
    const backButton = document.createElement('button');
    backButton.className = 'back-button';
    backButton.innerHTML = '&larr; Voltar ao Menu';
    backButton.addEventListener('click', renderNavigationHub);
    
    header.appendChild(title);
    header.appendChild(backButton);
    mainContent.appendChild(header);
    
    appContainer.appendChild(mainContent);

    if (tabKey === 'progresso') {
        const progressContent = createProgressPanel();
        mainContent.appendChild(progressContent);

        const resetButton = document.createElement('button');
        resetButton.id = 'reset-progress-btn';
        resetButton.textContent = 'Resetar Todo o Progresso';
        resetButton.className = 'back-button';
        resetButton.style.backgroundColor = '#d9534f';
        resetButton.style.borderColor = '#d43f3a';
        resetButton.style.marginTop = '20px';
        resetButton.onclick = () => {
            if (confirm('Tem certeza que deseja apagar TODO o seu progresso? Esta ação não pode ser desfeita.')) {
                localStorage.removeItem(saveDataKey);
                location.reload();
            }
        };
        mainContent.appendChild(resetButton);
        
        updateProgressPanel();
    } else if (tabKey === 'reservas') {
        renderReservesList(mainContent);
    } else {
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
}

function renderReservesList(container) {
    const grid = document.createElement('div');
    grid.className = 'album-grid';
    container.appendChild(grid);

    const sortedReserves = Object.entries(reservesData).sort(([, a], [, b]) => a.name.localeCompare(b.name));

    for (const [reserveKey, reserve] of sortedReserves) {
        const card = document.createElement('div');
        card.className = 'animal-card';
        card.innerHTML = `
            <img src="${reserve.image}" alt="${reserve.name}" onerror="this.onerror=null;this.src='animais/placeholder.png';">
            <div class="info">${reserve.name}</div>
        `;
        card.addEventListener('click', () => showReserveDetailView(reserveKey));
        grid.appendChild(card);
    }
}

function showReserveDetailView(reserveKey) {
    appContainer.innerHTML = '';
    const reserve = reservesData[reserveKey];
    if (!reserve) return;

    const mainContent = document.createElement('div');
    mainContent.className = 'main-content';

    const header = document.createElement('div');
    header.className = 'page-header';
    
    const title = document.createElement('h2');
    title.textContent = reserve.name;
    
    const backButton = document.createElement('button');
    backButton.className = 'back-button';
    backButton.innerHTML = '&larr; Voltar para Reservas';
    backButton.addEventListener('click', () => renderMainView('reservas'));
    
    header.appendChild(title);
    header.appendChild(backButton);
    mainContent.appendChild(header);

    const albumGrid = document.createElement('div');
    albumGrid.className = 'album-grid';
    mainContent.appendChild(albumGrid);

    const animalNames = reserve.animals.map(slug => {
        return items.find(item => slugify(item) === slug);
    }).filter(name => name);

    animalNames.sort((a,b) => a.localeCompare(b)).forEach(animalName => {
        const card = createAnimalCard(animalName, 'pelagens');
        albumGrid.appendChild(card);
    });

    appContainer.appendChild(mainContent);
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

function showDetailView(name, tabKey) {
    appContainer.innerHTML = '';
    const slug = slugify(name);

    const mainContent = document.createElement('div');
    mainContent.className = 'main-content';

    const header = document.createElement('div');
    header.className = 'page-header';

    const detailHeader = document.createElement('h2');
    detailHeader.textContent = name;

    const backButton = document.createElement('button');
    backButton.className = 'back-button';
    backButton.innerHTML = `&larr; Voltar para ${categorias[tabKey].title}`;
    backButton.addEventListener('click', () => renderMainView(tabKey));
    
    header.appendChild(detailHeader);
    header.appendChild(backButton);
    mainContent.appendChild(header);

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
    
    appContainer.appendChild(mainContent);
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
            genderedFurs.push({ displayName: `Macho ${fur}`, originalName: fur, gender: 'macho' });
        });
    }
    if (speciesFurs.femea) {
        speciesFurs.femea.forEach(fur => {
            genderedFurs.push({ displayName: `Fêmea ${fur}`, originalName: fur, gender: 'femea' });
        });
    }
    genderedFurs.sort((a, b) => a.displayName.localeCompare(b.displayName));
    genderedFurs.forEach(furInfo => {
        const furCard = document.createElement('div');
        const isCompleted = savedData.pelagens?.[slug]?.[furInfo.displayName] === true;
        furCard.className = `fur-card ${isCompleted ? 'completed' : 'incomplete'}`;
        
        const furSlug = slugify(furInfo.originalName);
        const genderSlug = furInfo.gender;
        const genderSpecificPath = `animais/pelagens/${slug}_${furSlug}_${genderSlug}.png`;
        const genderNeutralPath = `animais/pelagens/${slug}_${furSlug}.png`;
        const genericAnimalPath = `animais/${slug}.png`;

        furCard.innerHTML = `
            <img src="${genderSpecificPath}" onerror="this.onerror=null; this.src='${genderNeutralPath}'; this.onerror=null; this.src='${genericAnimalPath}';">
            <div class="info">${furInfo.displayName}</div>
            <button class="fullscreen-btn" onclick="openModal(this.closest('.fur-card').querySelector('img').src); event.stopPropagation();" title="Ver em tela cheia">&#x26F6;</button>
        `;
        
        furCard.addEventListener('click', () => {
            if (!savedData.pelagens) savedData.pelagens = {};
            if (!savedData.pelagens[slug]) savedData.pelagens[slug] = {};
            const currentState = savedData.pelagens[slug][furInfo.displayName] || false;
            savedData.pelagens[slug][furInfo.displayName] = !currentState;
            saveData(savedData);
            furCard.classList.toggle('completed', !currentState);
            furCard.classList.toggle('incomplete', currentState);
            updateCardAppearance(document.querySelector(`.animal-card[data-slug='${slug}']`), slug, 'pelagens');
        });

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
            genderedFurs.push({ displayName: `Macho ${fur} Diamante`, originalName: fur, gender: 'macho' });
        });
    }

    const femaleCanBeDiamond = diamondFursData[slug]?.femea?.length > 0;
    if (speciesFurs.femea && femaleCanBeDiamond) {
        speciesFurs.femea.forEach(fur => {
            genderedFurs.push({ displayName: `Fêmea ${fur} Diamante`, originalName: fur, gender: 'femea' });
        });
    }

    if (genderedFurs.length === 0) {
        furGrid.innerHTML = '<p>Nenhuma opção de Super Raro (Pelagem Rara + Diamante) disponível para este animal.</p>';
        return;
    }

    genderedFurs.sort((a, b) => a.displayName.localeCompare(b.displayName));

    genderedFurs.forEach(furInfo => {
        const furCard = document.createElement('div');
        const isCompleted = savedData.super_raros?.[slug]?.[furInfo.displayName] === true;
        furCard.className = `fur-card ${isCompleted ? 'completed' : 'incomplete'}`;
        const furSlug = slugify(furInfo.originalName);
        const genderSlug = furInfo.gender;
        const genderSpecificPath = `animais/pelagens/${slug}_${furSlug}_${genderSlug}.png`;
        const genderNeutralPath = `animais/pelagens/${slug}_${furSlug}.png`;
        const genericAnimalPath = `animais/${slug}.png`;
        
        furCard.innerHTML = `
            <img src="${genderSpecificPath}" onerror="this.onerror=null; this.src='${genderNeutralPath}'; this.onerror=null; this.src='${genericAnimalPath}';">
            <div class="info">${furInfo.displayName}</div>
            <button class="fullscreen-btn" onclick="openModal(this.closest('.fur-card').querySelector('img').src); event.stopPropagation();" title="Ver em tela cheia">&#x26F6;</button>
        `;
        
        furCard.addEventListener('click', () => {
            if (!savedData.super_raros) savedData.super_raros = {};
            if (!savedData.super_raros[slug]) savedData.super_raros[slug] = {};
            const currentState = savedData.super_raros[slug][furInfo.displayName] || false;
            savedData.super_raros[slug][furInfo.displayName] = !currentState;
            saveData(savedData);
            furCard.classList.toggle('completed', !currentState);
            furCard.classList.toggle('incomplete', currentState);
            updateCardAppearance(document.querySelector(`.animal-card[data-slug='${slug}']`), slug, 'super_raros');
        });
        
        furGrid.appendChild(furCard);
    });
}

function renderDiamondsDetailView(container, name, slug) {
    const furGrid = document.createElement('div');
    furGrid.className = 'fur-grid';
    container.appendChild(furGrid);

    const speciesDiamondFurs = diamondFursData[slug];
    if (!speciesDiamondFurs) {
        furGrid.innerHTML = '<p>Nenhuma pelagem de diamante listada para este animal.</p>';
        return;
    }

    const allPossibleFurs = [];
    if (speciesDiamondFurs.macho) {
        speciesDiamondFurs.macho.forEach(fur => allPossibleFurs.push({ displayName: `Macho ${fur}`, originalName: fur, gender: 'macho' }));
    }
    if (speciesDiamondFurs.femea) {
        speciesDiamondFurs.femea.forEach(fur => allPossibleFurs.push({ displayName: `Fêmea ${fur}`, originalName: fur, gender: 'femea' }));
    }

    allPossibleFurs.sort((a, b) => a.displayName.localeCompare(b.displayName));

    allPossibleFurs.forEach(furInfo => {
        const furCard = document.createElement('div');
        furCard.className = 'fur-card';

        // Encontra todos os troféus para este tipo de pelagem e pega o de maior score
        const savedTrophiesForFur = (savedData.diamantes?.[slug] || []).filter(t => t.type === furInfo.displayName);
        const highestScoreTrophy = savedTrophiesForFur.reduce((max, t) => t.score > max.score ? t : max, { score: -1 });

        const isCompleted = highestScoreTrophy.score !== -1;
        furCard.classList.add(isCompleted ? 'completed' : 'incomplete');

        const furSlug = slugify(furInfo.originalName);
        const genderSlug = furInfo.gender;
        const genderSpecificPath = `animais/pelagens/${slug}_${furSlug}_${genderSlug}.png`;
        const genderNeutralPath = `animais/pelagens/${slug}_${furSlug}.png`;
        const genericAnimalPath = `animais/${slug}.png`;

        furCard.innerHTML = `
            <img src="${genderSpecificPath}" onerror="this.onerror=null; this.src='${genderNeutralPath}'; this.onerror=null; this.src='${genericAnimalPath}';">
            <div class="info">${furInfo.displayName.replace(' Diamante', '')}</div>
            <div class="highest-score">${isCompleted ? `Score: <b>${highestScoreTrophy.score}</b>` : 'Não obtido'}</div>
            <button class="fullscreen-btn" onclick="openModal(this.closest('.fur-card').querySelector('img').src); event.stopPropagation();" title="Ver em tela cheia">&#x26F6;</button>
        `;

        furCard.addEventListener('click', () => {
            const currentScore = isCompleted ? highestScoreTrophy.score : '';
            const newScore = prompt(`Digite a pontuação (score) para "${furInfo.displayName}":`, currentScore);

            if (newScore !== null && !isNaN(newScore) && newScore.trim() !== '') {
                // Adiciona ou atualiza o troféu
                if (!savedData.diamantes) savedData.diamantes = {};
                if (!Array.isArray(savedData.diamantes[slug])) savedData.diamantes[slug] = [];

                // Remove troféus antigos para este tipo para evitar duplicatas (mantém apenas o mais recente)
                const otherTrophies = savedData.diamantes[slug].filter(t => t.type !== furInfo.displayName);
                
                const newTrophy = {
                    id: Date.now(),
                    type: furInfo.displayName,
                    score: parseFloat(newScore)
                };

                savedData.diamantes[slug] = [...otherTrophies, newTrophy];
                saveData(savedData);
                
                // Re-renderiza a view para refletir a mudança
                renderDiamondsDetailView(container, name, slug);
            } else if (newScore === null) {
                // Usuário cancelou
            } else {
                alert("Por favor, insira um número válido para a pontuação.");
            }
        });
        furGrid.appendChild(furCard);
    });
}

// A função showAddDiamondForm não é mais necessária e pode ser apagada ou deixada em branco.
// A lógica dela foi incorporada no click do card acima.
function showAddDiamondForm(container, name, slug, onSaveCallback) {
    // Esta função não é mais usada neste novo design.
    console.log("Esta função (showAddDiamondForm) foi substituída pelo novo design de cards.");
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
                <button class="fullscreen-btn" onclick="openModal(this.closest('.fur-card').querySelector('img').src); event.stopPropagation();" title="Ver em tela cheia">&#x26F6;</button>
            `;
            furCard.addEventListener('click', () => renderTrophyList(fur, slug, tabKey, name, refreshFurGrid));
            furGrid.appendChild(furCard);
        });
        const mainCard = document.querySelector(`.album-grid .animal-card[data-slug='${slug}']`);
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
            detailsDiv.innerHTML = `<p><strong>Abates na Grind:</strong> ${trophy.abates || 'N/A'}</p><p><strong>Diamantes na Grind:</strong> ${trophy.diamantes || 'N/A'}</p><p><strong>Peles Raras na Grind:</strong> ${trophy.pelesRaras || 'N/A'}</p>`;
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
        } else {
            const collectedFurs = animalData.furs ? Object.values(animalData.furs).filter(fur => fur.trophies?.length > 0).length : 0;
            if (collectedFurs > 0) {
                status = 'inprogress';
            }
        }
    } else {
        let requiredOptions = [];
        const speciesData = (tabKey === 'diamantes') ? diamondFursData[slug] : rareFursData[slug];
        if (speciesData) {
            if (speciesData.macho) {
                speciesData.macho.forEach(fur => {
                    let optionName = `Macho ${fur}`;
                    if (tabKey === 'diamantes' || tabKey === 'super_raros') optionName += ' Diamante';
                    requiredOptions.push(optionName);
                });
            }
            if (speciesData.femea) {
                speciesData.femea.forEach(fur => {
                    let optionName = `Fêmea ${fur}`;
                    if (tabKey === 'diamantes' || tabKey === 'super_raros') optionName += ' Diamante';
                    requiredOptions.push(optionName);
                });
            }
        }

        if (requiredOptions.length > 0) {
            const animalData = savedData[tabKey]?.[slug] || {};
            const completedCount = requiredOptions.filter(option => {
                const optionData = animalData[option];
                return optionData === true || (typeof optionData === 'object' && optionData.completed);
            }).length;

            if (completedCount === requiredOptions.length) {
                status = 'completed';
            } else if (completedCount > 0) {
                status = 'inprogress';
            }
        }
    }
    card.classList.add(status);
}

function createProgressPanel() {
    const panel = document.createElement('div');
    panel.className = 'progress-panel';
    panel.id = 'progress-panel';

    panel.innerHTML = `
        <div class="progress-section">
            <h3>Progresso de Pelagens Raras</h3>
            <div id="rares-progress-label" class="progress-label">Calculando...</div>
            <div class="progress-bar-container">
                <div id="rares-progress-bar" class="progress-bar-fill"></div>
            </div>
        </div>
        <div class="progress-section">
            <h3>Progresso de Super Raros</h3>
            <div id="super-rares-progress-label" class="progress-label">Calculando...</div>
            <div class="progress-bar-container">
                <div id="super-rares-progress-bar" class="progress-bar-fill"></div>
            </div>
        </div>
        <div class="progress-section">
            <h3>Progresso de Diamantes</h3>
            <div id="diamond-progress-label" class="progress-label">Calculando...</div>
            <div class="progress-bar-container">
                <div id="diamond-progress-bar" class="progress-bar-fill"></div>
            </div>
        </div>
        <div class="progress-section">
            <h3>Progresso de Great Ones</h3>
            <div id="greatone-progress-label" class="progress-label">Calculando...</div>
            <div class="progress-bar-container">
                <div id="greatone-progress-bar" class="progress-bar-fill"></div>
            </div>
        </div>
    `;
    return panel;
}

function updateProgressPanel() {
    const currentData = loadData(); 

    const updateSection = (id, collected, total) => {
        const label = document.getElementById(`${id}-progress-label`);
        const bar = document.getElementById(`${id}-progress-bar`);
        const percentage = total > 0 ? (collected / total) * 100 : 0;

        if (label) {
            label.textContent = `${collected} / ${total}`;
        }
        if (bar) {
            bar.style.width = `${percentage}%`;
            bar.textContent = `${Math.round(percentage)}%`;
        }
    };

    let totalRares = 0;
    Object.values(rareFursData).forEach(species => {
        totalRares += (species.macho?.length || 0);
        totalRares += (species.femea?.length || 0);
    });
    let collectedRares = 0;
    if (currentData.pelagens) {
        Object.values(currentData.pelagens).forEach(speciesData => {
            collectedRares += Object.values(speciesData).filter(isCollected => isCollected === true).length;
        });
    }
    updateSection('rares', collectedRares, totalRares);

    let totalSuperRares = 0;
    Object.entries(rareFursData).forEach(([slug, species]) => {
        totalSuperRares += (species.macho?.length || 0);
        const femaleCanBeDiamond = diamondFursData[slug]?.femea?.length > 0;
        if (femaleCanBeDiamond) {
            totalSuperRares += (species.femea?.length || 0);
        }
    });
    let collectedSuperRares = 0;
    if (currentData.super_raros) {
        Object.values(currentData.super_raros).forEach(speciesData => {
            collectedSuperRares += Object.values(speciesData).filter(isCollected => isCollected === true).length;
        });
    }
    updateSection('super-rares', collectedSuperRares, totalSuperRares);

    let totalDiamonds = 0;
    Object.values(diamondFursData).forEach(species => {
        totalDiamonds += (species.macho?.length || 0);
        totalDiamonds += (species.femea?.length || 0);
    });
    let collectedDiamonds = 0;
    if (currentData.diamantes) {
        Object.values(currentData.diamantes).forEach(speciesData => {
            if (Array.isArray(speciesData)) {
                collectedDiamonds += speciesData.length;
            }
        });
    }
    updateSection('diamond', collectedDiamonds, totalDiamonds);

    let totalGreatOnesFurs = 0;
    Object.values(greatsFursData).forEach(fursArray => {
        totalGreatOnesFurs += fursArray.length;
    });
    let collectedGreatOnesFurs = 0;
    if (currentData.greats) {
        Object.values(currentData.greats).forEach(speciesData => {
            if (speciesData.furs) {
                Object.values(speciesData.furs).forEach(furData => {
                    if (furData.trophies?.length > 0) {
                        collectedGreatOnesFurs++;
                    }
                });
            }
        });
    }
    updateSection('greatone', collectedGreatOnesFurs, totalGreatOnesFurs);
}

function openModal(imageUrl) {
    const modal = document.getElementById('fullscreen-modal');
    const modalImg = document.getElementById('modal-image');
    if (modal && modalImg) {
        modalImg.src = imageUrl;
        modal.style.display = "flex";
        window.addEventListener('keydown', closeModalOnEscape);
    }
}

function closeModal() {
    const modal = document.getElementById('fullscreen-modal');
    if (modal) {
        modal.style.display = "none";
        window.removeEventListener('keydown', closeModalOnEscape);
    }
}

function closeModalOnEscape(event) {
    if (event.key === 'Escape') {
        closeModal();
    }
}

document.addEventListener('DOMContentLoaded', () => {
    appContainer = document.getElementById('app-container');
    
    renderNavigationHub();

    const modal = document.getElementById('fullscreen-modal');
    const closeBtn = document.querySelector('.modal-close');
    if (closeBtn) {
        closeBtn.addEventListener('click', closeModal);
    }
    if (modal) {
        modal.addEventListener('click', (event) => {
            if (event.target === modal) {
                closeModal();
            }
        });
    }
});