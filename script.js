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
const diamondFursData = {
    "alce": { macho: ["Bronzeado", "Pardo", "Pardo Claro"], femea: [] },
    "antilocapra": { macho: ["Bronzeado", "Escuro", "Pardo"], femea: [] },
    "antílope_negro": { macho: ["Escuro", "Pardo Escuro", "Preto", "Bege"], femea: [] },
    "bantengue": { macho: ["Preto", "Café", "Pardo", "Pardo Escuro"], femea: [] },
    "bisão_da_floresta": { macho: ["Pardo Escuro", "Ruivo", "Metade Ruivo", "Pardo Claro"], femea: [] },
    "bisão_das_planícies": { macho: ["Escuro", "Cinza Claro", "Pardo", "Pardo Claro"], femea: [] },
    "bisão_europeu": { macho: ["Pardo", "Pardo Claro", "Pardo Escuro"], femea: [] },
    "búfalo_africano": { macho: ["Cinzento", "Pardo", "Preto"], femea: [] },
    "búfalo_d'água": { macho: ["Cinzento", "Preto", "Laranja"], femea: [] },
    "cabra_da_montanha": { macho: ["Bege", "Branco", "Cinza Claro", "Pardo Claro"], femea: [] },
    "cabra_de_leque": { macho: ["Bronzeado", "Laranja", "Pardo Escuro", "Pardo Negro"], femea: [] },
    "cabra_selvagem": { macho: ["Amarelado", "Branco", "Pardo e Branco", "Pardo Negro", "Preto e Branco"], femea: [] },
    "caititu": { macho: ["Cinza Escuro", "Cinzento", "Pardo", "Pardo Escuro"], femea: [] },
    "camurça": { macho: ["Cor de Mel", "Pardo", "Pardo e Cinza", "Pardo Escuro"], femea: [] },
    "canguru_cinza_oriental": { macho: ["Cinzento", "Pardo e Cinza", "Pardo"], femea: [] },
    "caribu": { macho: ["Pardo Claro", "Pardo Escuro"], femea: [] },
    "caribu_da_floresta_boreal": { macho: ["Pardo Escuro", "Pardo Claro"], femea: [] },
    "carneiro_azul": { macho: ["Cinza Ardósia", "Pardo", "Cinza Azulado", "Amarelo"], femea: [] },
    "carneiro_selvagem": { macho: ["Preto", "Pardo", "Cinzento", "Bronze"], femea: [] },
    "castor_norte_americano": { macho: ["Pardo Claro", "Pardo Escuro", "Marrom Avermelhado"], femea: ["Pardo Claro", "Pardo Escuro", "Marrom Avermelhado"] },
    "cervo_almiscarado": { macho: ["Pardo e Cinza", "Pardo Escuro"], femea: [] },
    "cervo_canadense": { macho: ["Juba Marrom", "Escuro"], femea: [] },
    "cervo_do_pântano": { macho: ["Pardo", "Pardo Claro", "Vermelho", "Pardo Escuro", "Vermelho Escuro"], femea: [] },
    "cervo_de_timor": { macho: ["Dois Tons", "Pardo", "Pardo Claro", "Pardo e Branco"], femea: [] },
    "cervo_sika": { macho: ["Escuro e Pintado", "Pardo", "Pintado", "Preto"], femea: [] },
    "cervo-porco_indiano": { macho: ["Pardo", "Escuro e Pintado", "Pardo Escuro", "Pintado"], femea: [] },
    "chital": { macho: ["Pintado", "Escuro"], femea: [] },
    "codorna-de-restolho": { macho: ["Pardo", "Pardo e Cinza", "Pardo Escuro"], femea: [] },
    "codorniz_da_virgínia": { macho: ["Cinzento", "Pardo", "Pardo Avermelhado"], femea: ["Cinzento", "Pardo", "Pardo Avermelhado"] },
    "coelho_da_flórida": { macho: ["Cinza Claro", "Cinzento", "Pardo", "Pardo Claro"], femea: ["Cinza Claro", "Cinzento", "Pardo", "Pardo Claro"] },
    "coelho_europeu": { macho: ["Bronzeado", "Pardo", "Pardo Claro", "Pardo Escuro"], femea: [] },
    "coiote": { macho: ["Cinza Claro", "Cinza Escuro", "Laranja", "Pardo e Cinza"], femea: [] },
    "corça": { macho: ["Bronzeado", "Cinza Escuro", "Laranja", "Pardo", "Pardo Escuro"], femea: [] },
    "crocodilo_de_água_salgada": { macho: ["Cinzento", "Oliva", "Pardo Escuro"], femea: [] },
    "cudo_menor": { macho: ["Cinzento"], femea: [] },
    "faisão_de_pescoço_anelado": { macho: ["Cinzento", "Muda", "Pardo", "Pardo e Branco"], femea: [] },
    "frisada": { macho: ["Cinzento", "Plum. de Inverno"], femea: [] },
    "galo_lira": { macho: ["Escuro", "Laranja", "Ouro"], femea: [] },
    "gamo": { macho: ["Escuro", "Escuro e Pintado", "Pintado", "Branco", "Chocolate"], femea: [] },
    "ganso_bravo": { macho: ["Pardo", "Cinzento"], femea: [] },
    "ganso_campestre_da_tundra": { macho: ["Cinza Claro", "Cinza Escuro", "Pardo"], femea: [] },
    "ganso_das_neves": { macho: ["Variação Branca", "Variação Azul", "Variação Interm", "Híbrido"], femea: [] },
    "ganso_do_canadá": { macho: ["Marrom Híbrido", "Pardo e Cinza"], femea: [] },
    "ganso_pega": { macho: ["Amarelo", "Bordô", "Laranja"], femea: [] },
    "gnu_de_cauda_preta": { macho: ["Cinza escuro", "Cinzento", "Ouro"], femea: [] },
    "guaxinim_comum": { macho: ["Amarelado", "Cinzento", "Pardo"], femea: [] },
    "iaque_selvagem": { macho: ["Pardo Escuro", "Vermelho Escuro", "Preto Profundo", "Marrom Profundo", "Ouro"], femea: [] },
    "ibex_de_beceite": { macho: ["Cinzento", "Laranja", "Marrom Híbrido", "Pardo e Cinza"], femea: [] },
    "ibex_de_gredos": { macho: ["Cinza Claro", "Marrom Híbrido", "Cinzento", "Pardo e Cinza"], femea: [] },
    "ibex_de_ronda": { macho: ["Cinzento", "Marrom Híbrido", "Pardo", "Pardo e Cinza"], femea: [] },
    "ibex_espanhol_do_sudeste": { macho: [], femea: [] },
    "javali": { macho: ["Pardo", "Pardo Claro", "Pardo Escuro", "Preto e Dourado"], femea: [] },
    "javali_africano": { macho: ["Cinzento Escuro", "Pardo Avermelhado"], femea: [] },
    "lebre-antílope": { macho: ["Cinzento", "Mosqueado", "Pardo Escuro"], femea: [] },
    "lebre-da-cauda-branca": { macho: ["Bege", "Cinzento", "Pardo", "Pardo Claro"], femea: [] },
    "lebre_da_eurasia": { macho: ["Branco"], femea: ["Branco"] },
    "lebre_nuca_dourada": { macho: ["Castanho", "Pardo", "Cinzento"], femea: ["Castanho", "Pardo", "Cinzento"] },
    "lebre_peluda": { macho: ["Cinza Claro", "Pardo Claro", "Pardo Escuro", "Muda"], femea: ["Cinza Claro", "Pardo Claro", "Pardo Escuro", "Muda"] },
    "leão": { macho: ["Bronzeado", "Pardo Claro"], femea: [] },
    "leopardo_das_neves": { macho: ["Neve", "Caramelo"], femea: [] },
    "lince_euroasiática": { macho: ["Cinzento", "Pardo Claro"], femea: [] },
    "lince_pardo_do_méxico": { macho: ["Bronzeado", "Cinzento", "Pardo", "Vermelho"], femea: [] },
    "lobo_cinzento": { macho: ["Cinzento"], femea: [] },
    "lobo_ibérico": { macho: ["Cinzento", "Pardo e Cinza"], femea: [] },
    "marreca_arrebio": { macho: ["Eclipse", "Cinza", "Pardo", "Brilhante", "Eritrístico"], femea: [] },
    "marreca_carijó": { macho: ["Canela", "Vermelho", "Malhado"], femea: [] },
    "marrequinha_americana": { macho: ["Verde Claro", "Verde Escuro"], femea: [] },
    "marrequinha_comum": { macho: ["Verde Claro", "Verde Escuro"], femea: [] },
    "muflão_ibérico": { macho: ["Pardo", "Pardo Claro"], femea: [] },
    "muntjac_vermelho_do_norte": { macho: ["Vermelho"], femea: [] },
    "nilgó": { macho: ["Azul", "Pardo Escuro"], femea: [] },
    "onça_parda": { macho: ["Pardo Claro", "Vermelho Escuro", "Cinzento"], femea: [] },
    "oryx_do_cabo": { macho: ["Cinza Claro", "Cinzento"], femea: ["Cinza Claro", "Cinzento"] },
    "pato_carolino": { macho: ["Escuro", "Prata Diluído", "Padrão", "Dourado Eritrístico"], femea: [] },
    "pato_harlequim": { macho: ["Cinza Escuro", "Malhado"], femea: [] },
    "pato_olho_de_ouro": { macho: ["Cinzento", "Preto"], femea: [] },
    "pato_real": { macho: ["Malhado", "Pardo Negro", "Marrom Híbrido"], femea: [] },
    "peru": { macho: ["Pardo", "Pardo Claro", "Pardo Escuro"], femea: [] },
    "peru_selvagem": { macho: ["Bronze", "Bronze Claro", "Pardo", "Pardo Claro"], femea: [] },
    "peru_selvagem_do_rio_grande": { macho: ["Pardo", "Pardo Claro", "Siena", "Siena Claro"], femea: [] },
    "piadeira": { macho: ["Cinzento", "Pardo"], femea: [] },
    "porco_selvagem": { macho: ["Manchas Pretas", "Pardo Escuro", "Preto", "Preto e Dourado", "Marrom Híbrido"], femea: [] },
    "raposa_cinzenta": { macho: ["Cinzento", "Dois Tons", "Vermelho"], femea: ["Cinzento", "Dois Tons", "Vermelho"] },
    "raposa_tibetana": { macho: ["Laranja", "Vermelho", "Cinzento", "Pardo"], femea: [] },
    "raposa_vermelha": { macho: ["Laranja", "Vermelho", "Vermelho Escuro"], femea: [] },
    "rena": { macho: ["Pardo Claro", "Pardo Escuro"], femea: [] },
    "sambar": { macho: ["Pardo", "Pardo Claro", "Pardo Escuro"], femea: [] },
    "tahr": { macho: ["Pardo Avermelhado", "Palha", "Pardo Claro"], femea: [] },
    "tetraz_azul": { macho: ["Pardo", "Pardo e Cinza", "Muda", "Cinza Ardósia"], femea: [] },
    "tetraz_grande": { macho: ["Escuro"], femea: [] },
    "tigre_de_bengala": { macho: ["Laranja"], femea: [] },
    "urso_cinzento": { macho: ["Pardo e Cinza"], femea: [] },
    "urso_negro": { macho: ["Cinzento", "Escuro", "Preto"], femea: [] },
    "urso_pardo": { macho: ["Canela", "Pardo Avermelhado", "Pardo Claro", "Amarelado", "Cinzento", "Pardo Escuro", "Espirito", "Ouro"], femea: [] },
    "veado_das_montanhas_rochosas": { macho: ["Cinza Claro", "Pardo", "Pardo Claro"], femea: [] },
    "veado_de_cauda_branca": { macho: ["Bronzeado", "Pardo", "Pardo Escuro"], femea: [] },
    "veado_de_cauda_preta": { macho: ["Cinza Escuro", "Cinzento", "Pardo e Cinza"], femea: [] },
    "veado-mula": { macho: ["Cinzento", "Pardo", "Amarelado"], femea: [] },
    "veado_de_roosevelt": { macho: ["Bronzeado", "Laranja", "Pardo"], femea: [] },
    "veado_vermelho": { macho: ["Pardo", "Pardo Claro", "Pardo Escuro", "Cinzento"], femea: [] },
    "cão_guaxinim": { macho: ["Cinzento", "Pardo Claro", "Preto e Branco"], femea: [] },
    "lagópode-branco": { macho: ["Bicolor", "Muda", "Mosqueado"], femea: [] },
    "lagópode-escocês": { macho: ["Bicolor", "Muda"], femea: [] },
    "galinha-montês": { macho: ["Cinzento", "Escuro", "Pardo", "Pardo Claro"], femea: [] },
    "zarro-negrinha": { macho: ["Preto", "Pardo"], femea: [] },
    "zarro-castanho": { macho: ["Pardo Escuro", "Pardo Avermelhado"], femea: [] }
};


function slugify(text) {
    return text.toLowerCase().replace(/[-\s]+/g, '_').replace(/'/g, '');
}

const categorias = {
    pelagens: { title: 'Pelagens Raras', items: items },
    diamantes: { title: 'Diamantes', items: items },
    greats: { title: 'Greats One', items: ["Alce", "Urso Negro", "Veado-Mula", "Veado Vermelho", "Veado-de-cauda-branca", "Raposa", "Faisão", "Gamo", "Tahr"] },
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

        furCard.innerHTML = `<img src="${genderSpecificPath}" onerror="this.onerror=null; this.src='${genderNeutralPath}'; this.onerror=null; this.src='${genericAnimalPath}';"><div class="info">${furInfo.displayName}</div>`;
        
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
    if (speciesFurs.femea) {
        speciesFurs.femea.forEach(fur => {
            genderedFurs.push({ displayName: `Fêmea ${fur} Diamante`, originalName: fur, gender: 'femea' });
        });
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
        furCard.innerHTML = `<img src="${genderSpecificPath}" onerror="this.onerror=null; this.src='${genderNeutralPath}'; this.onerror=null; this.src='${genericAnimalPath}';"><div class="info">${furInfo.displayName}</div>`;
        
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
    const grid = document.createElement('div');
    grid.className = 'fur-grid';
    container.appendChild(grid);
    
    const speciesDiamondFurs = diamondFursData[slug];
    if (!speciesDiamondFurs || (speciesDiamondFurs.macho.length === 0 && speciesDiamondFurs.femea.length === 0)) {
        grid.innerHTML = '<p>Nenhuma pelagem de diamante listada para este animal.</p>';
        return;
    }

    const diamondTrophyOptions = [];
    if (speciesDiamondFurs.macho) {
        speciesDiamondFurs.macho.forEach(fur => {
            diamondTrophyOptions.push({
                displayText: `Macho ${fur} Diamante`,
                furName: fur,
                gender: 'macho'
            });
        });
    }
    if (speciesDiamondFurs.femea) {
        speciesDiamondFurs.femea.forEach(fur => {
            diamondTrophyOptions.push({
                displayText: `Fêmea ${fur} Diamante`,
                furName: fur,
                gender: 'femea'
            });
        });
    }

    const animalData = savedData['diamantes']?.[slug] || {};

    diamondTrophyOptions.sort((a,b) => a.displayText.localeCompare(b.displayText)).forEach(option => {
        const card = document.createElement('div');
        const optionData = animalData[option.displayText];
        const isCompleted = optionData === true || (typeof optionData === 'object' && optionData.completed);
        const score = (typeof optionData === 'object' && optionData.score) ? optionData.score : '';
        card.className = `fur-card ${isCompleted ? 'completed' : 'incomplete'}`;
        
        const furSlug = slugify(option.furName);
        const genderSlug = option.gender;
        const genderSpecificPath = `animais/pelagens/${slug}_${furSlug}_${genderSlug}.png`;
        const genderNeutralPath = `animais/pelagens/${slug}_${furSlug}.png`;
        const genericAnimalPath = `animais/${slug}.png`;
        
        card.innerHTML = `
            <img src="${genderSpecificPath}" alt="${option.displayText}" onerror="this.onerror=null; this.src='${genderNeutralPath}'; this.onerror=null; this.src='${genericAnimalPath}';">
            <div class="info-and-score">
                <span class="trophy-name">${option.displayText}</span>
                <div class="trophy-score-controls">
                    <input type="text" class="trophy-score-input" placeholder="---" value="${score}">
                    <button class="trophy-score-save-btn">Salvar</button>
                </div>
            </div>
        `;
        grid.appendChild(card);
        const scoreInput = card.querySelector('.trophy-score-input');
        const saveBtn = card.querySelector('.trophy-score-save-btn');
        
        saveBtn.style.display = 'none';
        
        scoreInput.addEventListener('focus', () => {
            saveBtn.style.display = 'inline-block';
        });

        scoreInput.addEventListener('click', (e) => e.stopPropagation());
        saveBtn.addEventListener('click', (e) => e.stopPropagation());

        saveBtn.addEventListener('click', () => {
            if (!savedData['diamantes']) savedData['diamantes'] = {};
            if (!savedData['diamantes'][slug]) savedData['diamantes'][slug] = {};
            savedData['diamantes'][slug][option.displayText] = {
                completed: true,
                score: scoreInput.value
            };
            saveData(savedData);
            card.classList.add('completed');
            card.classList.remove('incomplete');
            const mainAnimalCard = document.querySelector(`.album-grid .animal-card[data-slug='${slug}']`);
            updateCardAppearance(mainAnimalCard, slug, 'diamantes');
            saveBtn.style.display = 'none';
        });

        card.addEventListener('click', () => {
            const currentOptionData = savedData['diamantes']?.[slug]?.[option.displayText];
            const currentCompleted = currentOptionData === true || (typeof currentOptionData === 'object' && currentOptionData.completed);
            if (!savedData['diamantes']) savedData['diamantes'] = {};
            if (!savedData['diamantes'][slug]) savedData['diamantes'][slug] = {};
            const existingScore = (typeof currentOptionData === 'object' && currentOptionData.score) ? currentOptionData.score : scoreInput.value;
            savedData['diamantes'][slug][option.displayText] = {
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
            furCard.innerHTML = `<img src="${specificImagePath}" alt="${fur}" onerror="this.onerror=null; this.src='${genericImagePath}';"><div class="info">${fur}</div><div class="trophy-count">x${trophies.length}</div>`;
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
        }
    } else if (tabKey === 'diamantes') {
        const speciesDiamondFurs = diamondFursData[slug];
        if (speciesDiamondFurs) {
            const requiredOptions = [];
            if (speciesDiamondFurs.macho) {
                speciesDiamondFurs.macho.forEach(fur => requiredOptions.push(`Macho ${fur} Diamante`));
            }
            if (speciesDiamondFurs.femea) {
                speciesDiamondFurs.femea.forEach(fur => requiredOptions.push(`Fêmea ${fur} Diamante`));
            }
            if (requiredOptions.length > 0) {
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
        }
    } else if (tabKey === 'pelagens' || tabKey === 'super_raros') {
        const speciesRareFurs = rareFursData[slug];
        if (speciesRareFurs) {
            const requiredOptions = [];
            if (speciesRareFurs.macho) {
                speciesRareFurs.macho.forEach(fur => requiredOptions.push(`Macho ${fur}`));
            }
            if (speciesRareFurs.femea) {
                speciesRareFurs.femea.forEach(fur => requiredOptions.push(`Fêmea ${fur}`));
            }
            if(requiredOptions.length > 0) {
                const saveDataKeyForTab = tabKey === 'pelagens' ? 'pelagens' : 'super_raros';
                const animalData = savedData[saveDataKeyForTab]?.[slug] || {};
                const completedOptions = requiredOptions.filter(option => animalData[option] === true);
                if (completedOptions.length === requiredOptions.length) {
                    status = 'completed';
                } else if (completedOptions.length > 0) {
                    status = 'inprogress';
                }
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
    // --- Cálculo Pelagens Raras ---
    let totalRares = 0;
    const uniqueRareFurs = new Set();
    for (const slug in rareFursData) {
        rareFursData[slug].macho.forEach(fur => uniqueRareFurs.add(`Macho ${fur}`));
        rareFursData[slug].femea.forEach(fur => uniqueRareFurs.add(`Fêmea ${fur}`));
    }
    totalRares = uniqueRareFurs.size;
    
    let collectedRares = 0;
    if (savedData.pelagens) {
        for (const slug in savedData.pelagens) {
            collectedRares += Object.keys(savedData.pelagens[slug]).filter(key => savedData.pelagens[slug][key]).length;
        }
    }

    const rarePercentage = totalRares > 0 ? (collectedRares / totalRares) * 100 : 0;
    const rareLabel = document.getElementById('rares-progress-label');
    const rareBar = document.getElementById('rares-progress-bar');
    if(rareLabel) rareLabel.textContent = `${collectedRares} / ${totalRares}`;
    if(rareBar) {
        rareBar.style.width = `${rarePercentage}%`;
        rareBar.textContent = `${Math.round(rarePercentage)}%`;
    }

    // --- Cálculo Super Raros ---
    const totalSuperRares = totalRares; // A base de colecionáveis é a mesma
    let collectedSuperRares = 0;
    if (savedData.super_raros) {
        for (const slug in savedData.super_raros) {
            collectedSuperRares += Object.keys(savedData.super_raros[slug]).filter(key => savedData.super_raros[slug][key]).length;
        }
    }

    const superRarePercentage = totalSuperRares > 0 ? (collectedSuperRares / totalSuperRares) * 100 : 0;
    const superRareLabel = document.getElementById('super-rares-progress-label');
    const superRareBar = document.getElementById('super-rares-progress-bar');
    if(superRareLabel) superRareLabel.textContent = `${collectedSuperRares} / ${totalSuperRares}`;
    if(superRareBar) {
        superRareBar.style.width = `${superRarePercentage}%`;
        superRareBar.textContent = `${Math.round(superRarePercentage)}%`;
    }

    // --- Cálculo Diamantes ---
    let totalDiamonds = 0;
    for (const slug in diamondFursData) {
        totalDiamonds += diamondFursData[slug].macho.length;
        totalDiamonds += diamondFursData[slug].femea.length;
    }

    let collectedDiamonds = 0;
    if (savedData.diamantes) {
        for (const slug in savedData.diamantes) {
            for (const trophy in savedData.diamantes[slug]) {
                const optionData = savedData.diamantes[slug][trophy];
                if (optionData === true || (typeof optionData === 'object' && optionData.completed)) {
                    collectedDiamonds++;
                }
            }
        }
    }
    
    const diamondPercentage = totalDiamonds > 0 ? (collectedDiamonds / totalDiamonds) * 100 : 0;
    const diamondLabel = document.getElementById('diamond-progress-label');
    const diamondBar = document.getElementById('diamond-progress-bar');
    if(diamondLabel) diamondLabel.textContent = `${collectedDiamonds} / ${totalDiamonds}`;
    if(diamondBar) {
        diamondBar.style.width = `${diamondPercentage}%`;
        diamondBar.textContent = `${Math.round(diamondPercentage)}%`;
    }

    // --- Cálculo Great Ones ---
    const totalGreatOnes = Object.keys(greatsFursData).length;
    let collectedGreatOnes = 0;
    if (savedData.greats) {
        for (const slug in savedData.greats) {
            if (savedData.greats[slug].completo) {
                collectedGreatOnes++;
            }
        }
    }

    const greatOnePercentage = totalGreatOnes > 0 ? (collectedGreatOnes / totalGreatOnes) * 100 : 0;
    const greatOneLabel = document.getElementById('greatone-progress-label');
    const greatOneBar = document.getElementById('greatone-progress-bar');
    if(greatOneLabel) greatOneLabel.textContent = `${collectedGreatOnes} / ${totalGreatOnes}`;
    if(greatOneBar) {
        greatOneBar.style.width = `${greatOnePercentage}%`;
        greatOneBar.textContent = `${Math.round(greatOnePercentage)}%`;
    }
}


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
    
    const initialTab = 'progresso'; 
    navButtons.forEach(b => b.classList.toggle('active', b.dataset.target === initialTab));
    renderMainView(initialTab);
});