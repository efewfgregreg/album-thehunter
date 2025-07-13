// ========================================================================
// ======== INICIALIZAÇÃO DO FIREBASE (COM SEUS DADOS) ========
// =================================================================
const firebaseConfig = {
    apiKey: "AIzaSyD_vgZDTseipBQgo2oXJeZUyczCEzWg_8w",
    authDomain: "album-thehunter.firebaseapp.com",
    projectId: "album-thehunter",
    storageBucket: "album-thehunter.firebasestorage.app",
    messageSenderId: "369481100721",
    appId: "1:369481100721:web:e5ce08c635536fb7e0a190",
    measurementId: "G-3G5VBWBEDL"
};

// Inicializa os serviços do Firebase que vamos usar
const app = firebase.initializeApp(firebaseConfig);
const auth = firebase.auth(); // Serviço de Autenticação
const db = firebase.firestore(); // Banco de dados Firestore
let currentUser = null; // Variável para guardar o usuário logado

// =================================================================
// =================== LÓGICA DE DADOS COM FIREBASE =================
// =================================================================

let savedData = {}; // Objeto global para guardar os dados do usuário

// Função para obter a estrutura de dados padrão para um novo usuário
function getDefaultDataStructure() {
    return {
        pelagens: {},
        diamantes: {},
        greats: {},
        super_raros: {},
        grindSessions: []
    };
}

/**
 * Carrega os dados do usuário logado a partir do Firestore.
 * Se o usuário for novo, retorna uma estrutura de dados vazia.
 */
async function loadDataFromFirestore() {
    if (!currentUser) {
        console.error("Tentando carregar dados sem usuário logado.");
        return getDefaultDataStructure();
    }
    const userDocRef = db.collection('usuários').doc(currentUser.uid);
    try {
        const doc = await userDocRef.get();
        if (doc.exists) {
            console.log("Dados carregados do Firestore!");
            // Garante que todos os campos principais existam para evitar erros
            const cloudData = doc.data();
            const defaultData = getDefaultDataStructure();
            return { ...defaultData, ...cloudData };
        } else {
            console.log("Nenhum dado encontrado para o usuário, criando novo documento.");
            // Para um novo usuário, vamos salvar a estrutura padrão no Firestore
            const defaultData = getDefaultDataStructure();
            await userDocRef.set(defaultData);
            return defaultData;
        }
    } catch (error) {
        console.error("Erro ao carregar dados do Firestore:", error);
        return getDefaultDataStructure(); // Retorna dados padrão em caso de erro
    }
}

/**
 * Salva o objeto de dados completo no Firestore para o usuário logado.
 * @param {object} data O objeto de dados completo a ser salvo.
 */
function saveData(data) {
    if (!currentUser) {
        console.error("Tentando salvar dados sem usuário logado.");
        return;
    }
    const userDocRef = db.collection('usuários').doc(currentUser.uid);
    userDocRef.set(data)
        .then(() => {
            console.log("Progresso salvo na nuvem com sucesso!");
        })
        .catch((error) => {
            console.error("Erro ao salvar dados na nuvem: ", error);
        });

    // A UI continua sendo atualizada localmente de forma otimista
    if (document.getElementById('progress-panel-main-container')) {
        const container = document.getElementById('progress-panel-main-container').parentNode;
        renderProgressView(container);
    }
    const mountsGrid = document.querySelector('.mounts-grid');
    if (mountsGrid) {
        const container = mountsGrid.parentNode;
        renderMultiMountsView(container);
    }
}


// --- CONSTANTES DE DADOS ---
const rareFursData = {
    "alce": { macho: ["Albino", "Melanístico", "Malhado", "Café"], femea: ["Albino", "Melanístico", "Malhado"] },
    "antilocapra": { macho: ["Albino", "Malhado", "Leucismo"], femea: ["Albino", "Malhado", "Leucismo"] },
    "antílope_negro": { macho: ["Albino", "Melânico", "Malhado", "Leucismo"], femea: ["Albino", "Melânico", "Malhado", "Leucismo"] },
    "bantengue": { macho: ["Albino", "Melânico"], femea: ["Albino", "Melânico"] },
    "bisão_das_planícies": { macho: ["Albino", "Melânico", "Leucismo"], femea: ["Albino", "Melânico", "Leucismo"] },
    "bisão_europeu": { macho: ["Albino", "Melânico", "Malhado"], femea: ["Albino", "Melânico", "Malhado"] },
    "búfalo_africano": { macho: ["Albino", "Leucismo"], femea: ["Albino", "Leucismo"] },
    "búfalo_dágua": { macho: ["Albino", "Laranja"], femea: ["Albino", "Laranja"] },
    "cabra_da_montanha": { macho: ["Albino", "Melânico"], femea: ["Albino", "Melânico"] },
    "cabra_de_leque": { macho: ["Albino"], femea: ["Albino"] },
    "cabra_selvagem": { macho: ["Albino", "Preto", "Cores Mistas"], femea: ["Albino", "Preto"] },
    "caititu": { macho: ["Albino", "Melânico", "Ochre", "Leucismo"], femea: ["Albino", "Melânico", "Ochre", "Leucismo"] },
    "camurça": { macho: ["Albino", "Melânico", "Leucismo"], femea: ["Albino", "Melânico", "Leucismo"] },
    "canguru_cinza_oriental": { macho: ["Albino", "Melânico", "Leucismo variação 1", "Leucismo variação 2", "Leucismo variação 3"], femea: ["Albino", "Melânico", "Leucismo variação 1", "Leucismo variação 2", "Leucismo variação 3"] },
    "caribu": { macho: ["Albino", "Melânico", "Leucismo","Malhado"], femea: ["Albino", "Melânico", "Leucismo"] },
    "carneiro_azul": { macho: ["Albino", "Melânico", "Leucismo"], femea: ["Albino", "Melânico", "Leucismo"] },
    "carneiro_selvagem": { macho: ["Albino", "Malhado variação 1", "Malhado variação 2","Leucismo"], femea: ["Albino", "Malhado variação 1", "Malhado variação 2","Leucismo"] },
    "cervo_porco_indiano": { macho: ["Malhado", "Leucismo"], femea: ["Malhado", "Leucismo"] },
    "cervo_almiscarado": { macho: ["Albino", "Melânico", "Malhado"], femea: ["Albino", "Melânico", "Malhado"] },
    "cervo_de_timor": { macho: ["Albino", "leucistico", "malhado variação 1", "malhado variação 2"], femea: ["leucistico"] },
    "cervo_do_pântano": { macho: ["Albino", "Malhado", "Leucismo","Melânico"], femea: ["Albino", "Malhado", "Leucismo","Melânico"] },
    "cervo_sika": { macho: ["Albino", "pintado vermelho"], femea: ["Albino", "pintado vermelho"] },
    "chital": { macho: ["Albino", "malhado", "melanico"], femea: ["Albino", "malhado", "melanico"] },
    "chacal_listrado": { macho: ["Albino", "Melânico"], femea: ["Albino", "Melânico"] },
    "codorna_de_restolho": { macho: ["Albino", "Pardo Escuro"], femea: ["Albino"] },
    "codorniz_da_virgínia": { macho: ["Albino"], femea: ["Albino"] },
    "coelho_da_flórida": { macho: ["Albino", "melanico", "Leucismo variação 1","Leucismo variação 2" ], femea: ["Albino", "melanico", "Leucismo variação 1","Leucismo variação 2"] },
    "coelho_europeu": { macho: ["Albino", "Melânico", "Leucismo", "Pardo Claro"], femea: ["Albino", "Melânico", "Leucismo", "Pardo Claro"] },
    "coiote": { macho: ["Albino", "Melânico", "malhado"], femea: ["Albino", "Melânico", "malhado"] },
    "corça": { macho: ["Albino", "Melânico", "Malhado"], femea: ["Albino", "Melânico", "Malhado"] },
    "crocodilo_de_água_salgada": { macho: ["Albino", "Melânico", "Pardo Claro", "malhado variação 1", "malhado variação 2", "Leucismo"], femea: ["Albino", "Melânico", "Pardo Claro", "malhado variação 1", "malhado variação 2", "Leucismo"] },
    "cudo_menor": { macho: ["Albino"], femea: ["Albino"] },
    "cão_guaxinim": { macho: ["Albino", "Laranja", "Pardo escuro", "malhado variação 1", "malhado variação 2"], femea: ["Albino", "Laranja", "Pardo escuro", "malhado variação 1", "malhado variação 2"] },
    "faisão_de_pescoço_anelado": { macho: ["Albino", "Melânico", "Leucismo"], femea: ["Albino", "Melânico", "Leucismo"] },
    "faisão": { macho: ["Albino", "Melânico", "Leucismo"], femea: ["Albino", "Melânico", "Leucismo"] },
    "frisada": { macho: ["Albino", "Melânico", "Leucismo"], femea: ["Albino", "Melânico", "Leucismo"] },
    "galinha_montês": { macho: ["Pálida", "Híbrido", "Escuro"], femea: ["Pálida", "Híbrido", "Escuro"] },
    "galo_lira": { macho: ["leucismo variação 1", "leucismo variação 2", "leucismo variação 3", "melanico variação 1", "melanico variação 2"], femea: ["Laranja"] },
    "gamo": { macho: ["Albino", "Melânico", "malhado variação 1", "malhado variação 2"], femea: ["Albino", "Melânico"] },
    "ganso_bravo": { macho: ["Híbrido", "leucismo variação 1", "leucismo variação 2", "leucismo variação 3", "leucismo variação 4", "leucismo variação 5"], femea: ["Híbrido", "leucismo variação 1", "leucismo variação 2", "leucismo variação 3", "leucismo variação 4", "leucismo variação 5"] },
    "ganso_campestre_da_tundra": { macho: ["leucismo variação 1", "leucismo variação 2", "leucismo variação 3"], femea: ["leucismo variação 1", "leucismo variação 2", "leucismo variação 3"] },
    "ganso_pega": { macho: ["Melânico", "leucismo variação 1", "leucismo variação 2", "malhado variação 1", "malhado variação 2"], femea: ["Melânico", "leucismo variação 1", "leucismo variação 2", "malhado variação 1", "malhado variação 2"] },
    "ganso_do_canadá": { macho: ["Cinza", "Melânico", "Leucismo cinza claro", "hibrido branco"], femea: ["Cinza", "Melânico", "Leucismo cinza claro", "hibrido branco"] },
    "ganso_das_neves": { macho: ["Albino", "Melânico", "variação azul", "hibrido", "intermediario"], femea: ["Albino", "Melânico", "variação azul", "hibrido", "intermediario"] },
    "gnu_de_cauda_preta": { macho: ["Albino"], femea: ["Albino", "Coroado"] },
    "guaxinim_comum": { macho: ["Albino", "Melânico", "loiro malhado", "cinza malhado"], femea: ["Albino", "Melânico", "loiro malhado", "cinza malhado"] },
    "iaque_selvagem": { macho: ["Ouro", "Leucismo", "albino variação 1", "albino variação 2"], femea: ["Ouro", "Leucismo", "albino variação 1", "albino variação 2", "marrom profundo", "preto profundo"] },
    "ibex_de_beceite": { macho: ["Albino", "Melânico"], femea: ["Albino", "Melânico"] },
    "jacaré_americano": { macho: ["Albino", "Melânico", "malhado variação 1", "malhado variação 2"], femea: ["Albino", "Melânico", "malhado variação 1", "malhado variação 2"] },
    "javali": { macho: ["Albino", "Melânico", "preto e dourado"], femea: ["Albino", "Melânico", "preto e dourado"] },
    "javali_africano": { macho: ["Albino"], femea: ["Albino", "Vermelho"] },
    "lagópode_branco": { macho: ["Branco", "muda variação 1", "muda variação 2"], femea: ["Branco", "muda variação 1", "muda variação 2", "mosqueado variação 1", "mosqueado variação 2"] },
    "lagópode_escocês": { macho: ["Branco"], femea: ["Branco"] },
    "lebre_antílope": { macho: ["Albino", "Melânico"], femea: ["Albino", "Melânico"] },
    "lebre_da_eurásia": { macho: ["Albino", "Branco", "muda variação 1", "muda variação 2", "pardo claro", "pardo escuro", "cinza claro", "cinza escuro"], femea: ["Albino", "Branco", "muda variação 1", "muda variação 2"] },
    "lebre_peluda": { macho: ["Albino", "Branco"], femea: ["Albino", "Branco"] },
    "lebre_da_cauda_branca": { macho: ["Albino"], femea: ["Albino"] },
    "lebre_nuca_dourada": { macho: ["cinza claro"], femea: ["cinza claro"] },
    "lebre_europeia": { macho: ["albino", "melanico"], femea: ["albino", "melanico"] },
    "leopardo_das_neves": { macho: ["Albino", "Melânico", "Leucismo"], femea: ["Albino", "Melânico", "Leucismo"] },
    "leão": { macho: ["Albino", "amarelado", "pardo escuro"], femea: ["Albino", "amarelado", "pardo escuro"] },
    "lince_pardo_do_méxico": { macho: ["Albino", "Melânico", "Azul"], femea: ["Albino", "Melânico", "Azul"] },
    "lince_euroasiática": { macho: ["Albino", "Melânico", "Malhado"], femea: ["Albino", "Melânico", "Malhado"] },
    "lobo_cinzento": { macho: ["Albino", "Melânico", "cinza escuro", "clara de ovo", "marrom averelhado"], femea: ["Albino", "Melânico", "cinza escuro", "clara de ovo", "marrom averelhado"] },
    "lobo_ibérico": { macho: ["Albino", "Melânico", "fantasma", "ogro", "sombra", "inverno", "oliva", "prístino"], femea: ["Albino", "Melânico", "inverno", "oliva", "prístino"] },
    "marreca_carijó": { macho: ["Melânico"], femea: ["bege"] },
    "marrequinha_comum": { macho: ["híbrido azul", "híbrido verde", "Leucismo variação 1", "Leucismo variação 2"], femea: ["Leucismo"] },
    "marrequinha_americana": { macho: ["Albino", "Verde Claro", "malhado variação 1", "malhado variação 2", "malhado variação 3"], femea: ["malhado variação 1", "malhado variação 2"] },
    "mouflão_ibérico": { macho: ["Albino", "Melânico", "cinza"], femea: ["Albino", "Melânico", "cinza"] },
    "muntjac_vermelho_do_norte": { macho: ["Albino", "Melânico", "Leucismo variação 1", "Leucismo variação 2", "Vermelho variação 1", "Vermelho variação 2"], femea: ["Albino", "Melânico", "Leucismo variação 1", "Leucismo variação 2"] },
    "nilgó": { macho: ["Malhado variação 1", "Malhado variação 2"], femea: ["Malhado variação 1", "Malhado variação 2"] },
    "onça_parda": { macho: ["Albino", "Melânico"], femea: ["Albino", "Melânico"] },
    "órix_do_cabo": { macho: ["bege", "escuro", "ouro"], femea: ["bege", "escuro", "ouro"] },
    "pato_olho_de_ouro": { macho: ["eclipse", "leucismo variação 1", "leucismo variação 2"], femea: ["escuro", "leucismo variação 1", "leucismo variação 2"] },
    "pato_harlequim": { macho: ["Albino", "Melânico"], femea: ["Albino", "cinza", "escuro"] },
    "pato_real": { macho: ["Melânico"], femea: ["Melânico", "amarelado"] },
    "peru": { macho: ["Albino", "Melânico", "Leucismo"], femea: ["Albino", "Melânico", "Leucismo"] },
    "peru_selvagem": { macho: ["Albino", "Melânico", "Leucismo", "bronze"], femea: ["Albino", "Melânico", "Leucismo"] },
    "peru_selvagem_do_rio_grande": { macho: ["Albino", "Melânico", "Leucismo"], femea: ["Albino", "Melânico", "Leucismo"] },
    "piadeira": { macho: ["híbrido", "eclipse", "leucismo variação 1", "leucismo variação 2"], femea: ["leucismo variação 1", "leucismo variação 2"] },
    "porco_selvagem": { macho: ["Albino", "rosa", "manchas pretas variação 1", "manchas pretas variação 2", "hibrido marrom variação 1", "hibrido marrom variação 2", "marrom escuro variação 1", "marrom escuro variação 2"], femea: ["rosa"] },
    "raposa_tibetana": { macho: ["Albino", "Melânico", "areia", "esfumaçado", "Leucismo"], femea: ["Albino", "Melânico", "areia", "esfumaçado", "Leucismo"] },
    "raposa_cinzenta": { macho: ["Albino", "Melânico", "Leucismo", "malhado variação 1", "malhado variação 2"], femea: ["Albino", "Melânico", "Leucismo", "malhado variação 1", "malhado variação 2"] },
    "raposa_vermelha": { macho: ["Albino", "Melânico", "Malhado"], femea: ["Albino", "Melânico", "Malhado"] },
    "rena_da_montanha": { macho: ["Albino", "Melânico", "Malhado", "Leucismo"], femea: ["Albino", "Melânico", "Malhado", "Leucismo"] },
    "sambar": { macho: ["Albino", "leucismo variação 1", "leucismo variação 2", "malhado variação 1", "malhado variação 2", "gradiente escuro"], femea: ["Albino", "Malhado", "Leucismo"] },
    "tahr": { macho: ["Albino", "branco", "vermelho", "preto", "vermelho escuro", "pardo escuro"], femea: ["Albino", "branco", "vermelho"] },
    "tetraz_grande": { macho: ["pálido", "Leucismo"], femea: ["Leucismo"] },
    "tigre_de_bengala": { macho: ["Albino", "Melânico", "branco", "branco sem listras", "ouro", "pseudo melanico variação 1", "pseudo melanico variação 2", "pseudo melanico branco variação 1", "pseudo melanico branco variação 2"], femea: ["Albino", "Melânico", "branco", "branco sem listras", "ouro", "pseudo melanico variação 1", "pseudo melanico variação 2", "pseudo melanico branco variação 1", "pseudo melanico branco variação 2"] },
    "urso_cinzento": { macho: ["Albino", "Marrom"], femea: ["Albino"] },
    "urso_negro": { macho: ["Amarelado", "Pardo", "Canela"], femea: ["Amarelado", "Pardo", "Canela"] },
    "urso_pardo": { macho: ["Albino", "Melanico"], femea: ["Albino", "Melanico"] },
    "veado_das_montanhas_rochosas": { macho: ["Albino", "Malhado Variação 1", "Malhado Mariação 2"], femea: ["Albino", "Malhado Variação 1", "Malhado Variação 2"] },
    "veado_de_cauda_branca": { macho: ["Albino", "Melânico", "Malhado"], femea: ["Albino", "Melânico", "Malhado"] },
    "veado_de_cauda_preta": { macho: ["Albino", "Melânico", "Malhado"], femea: ["Albino", "Melânico", "Malhado"] },
    "veado_de_roosevelt": { macho: ["Albino", "Melânico", "Malhado"], femea: ["Albino", "Melânico", "Malhado"] },
    "veado_mula": { macho: ["Albino", "Melânico", "diluído", "malhado variação 1", "malhado variação 2"], femea: ["Albino", "Melânico", "diluído", "malhado variação 1", "malhado variação 2"] },
    "veado_vermelho": { macho: ["Albino", "Melânico", "Malhado"], femea: ["Albino", "Melânico", "Malhado"] },
    "zarro_negrinha": { macho: ["Albino", "eclipse", "leucismo variação 1", "leucismo variação 2"], femea: ["leucismo variação 1", "leucismo variação 2"] },
    "zarro_castanho": { macho: ["Albino", "Melânico", "Leucismo"], femea: ["Albino", "Melânico", "Leucismo"] },
    "ibex_espanhol_do_sudeste": { macho: ["Albino", "Melânico", "laranja", "cinza claro", "castanho acinzentado", "marrom hibrido"], femea: ["Albino", "Melânico"] },
    "ibex_de_gredos": { macho: ["Albino", "Melânico"], femea: ["Albino", "Melânico"] },
    "ibex_de_ronda": { macho: ["Albino", "Melânico"], femea: ["Albino", "Melânico"] },
    "tetraz_azul": { macho: ["Albino", "Melânico", "Leucismo"], femea: ["Albino", "Melânico", "Leucismo"] },
    "marreca_arrebio": { macho: ["Albino", "Melânico", "malhado"], femea: ["Albino", "Melânico", "Leucismo", "malhado", "brilhante", "eritristico"] },
    "pato_carolino": { macho: ["Albino", "Prata Diluída", "Dourado Eritrístico", "Leucísmo", "Melânico", "Malhado"], femea: ["Albino", "Prata Diluída", "Dourado Eritrístico", "Leucísmo", "Melânico", "Malhado"] },
    "castor_norte_americano": { macho: ["Albino", "Melânico", "Leucismo","Malhado"], femea: ["Albino", "Melânico", "Leucismo","Malhado"] },
    "caribu_da_floresta_boreal": { macho: ["Albino", "Melânico", "Leucismo","Malhado variação 1", "Malhado variação 2"], femea: ["Albino", "Melânico", "Leucismo", "Malhado variação 1", "Malhado variação 2"] },
    "cervo_canadense": { macho: ["Albino", "Melânico", "Leucismo", "Malhado"], femea: ["Albino", "Melânico", "Leucismo", "Malhado"] },
    "bisão_da_floresta": { macho: ["Albino", "Melânico", "Leucismo", "Malhado", "Pardo Escuro"], femea: ["Albino", "Melânico", "Leucismo","Malhado","Pardo Escuro"] }
};
const greatsFursData = { "alce": ["Fábula Dois Tons", "Cinza lendário", "Bétula lendária", "Carvalho Fabuloso", "Fabuloso Salpicado", "Abeto lendário"], "urso_negro": ["Creme Lendário", "Espírito Lendário", "Marrom Lendário", "Pintado Lendário", "Gelo Lendário 2", "Gelo Lendário"], "veado_de_cauda_branca": ["Pardo", "Pardo Escuro", "Bronzeado", "Malhado"], "gamo": ["Café Lendário", "Pintado Lendário", "Dourado Lendário", "Misto Lendário", "Prata Lendário"], "raposa": ["A lendária Lua de Sangue", "Bengala de doce lendária", "A lendária flor de cerejeira", "Alcaçuz lendário", "A lendária papoula da meia-noite", "Floco de Neve Místico Fabuloso", "Hortelã-pimenta lendária", "Fábula Rosebud Frost", "A lendária Beladona Escarlate"], "veado_vermelho": ["Pintado Lendário"], "tahr": ["Dourado Lendário", "Cicatrizes Lendárias", "Cinza Lendário", "Café com Leite Lendário", "Crânio Lendário", "Metade Lendária", "Neve Lendário"], "veado_mula": ["Chuva de Gotículas Lendárias", "Via Láctea Lendária", "Sopro de Pétalas Lendário", "Manto Crepuscular Lendário", "Enigma Teia de Aranha Lendário", "Listras de Canela Lendário"], "faisão": ["Rubi Lendário", "Pérola Lendário", "Granada Lendário", "Safira Lendário", "Obsidiana Lendário", "Citrino Lendário", "Esmeralda Lendário", "Morganita Lendário"] };
const items = ["Alce","Antilocapra","Antílope Negro","Bantengue","Bisão da Floresta","Bisão das Planícies","Bisão Europeu","Búfalo Africano","Búfalo D'Água","Cabra da Montanha","Cabra de Leque","Cabra Selvagem","Caititu","Camurça","Canguru-cinza Oriental", "Chacal Listrado", "Caribu","Caribu da Floresta Boreal","Carneiro Azul","Carneiro Selvagem","Castor Norte-Americano","Cervo Almiscarado","Cervo Canadense","Cervo do Pântano","Cervo de Timor","Cervo Sika","Cervo-porco Indiano","Chital","Codorna-de-restolho","Codorniz da Virgínia","Coelho da Flórida","Coelho Europeu","Coiote","Corça","Crocodilo de Água Salgada","Cudo Menor","Faisão de Pescoço Anelado","Frisada","Galo Lira","Gamo","Ganso Bravo","Ganso Campestre da Tundra","Ganso das Neves","Ganso do Canadá","Ganso Pega","Gnu de Cauda Preta","Guaxinim Comum","Iaque Selvagem","Ibex de Beceite","Ibex de Gredos","Ibex de Ronda","Ibex Espanhol do Sudeste","Jacaré Americano","Javali","Javali Africano", "Lebre Europeia", "Lebre-antílope","Lebre-da-cauda-branca","Lebre Da Eurásia","Lebre Nuca Dourada","Lebre Peluda","Leão","Leopardo das Neves","Lince Euroasiática","Lince Pardo do México","Lobo Cinzento","Lobo Ibérico","Marreca Arrebio","Marreca Carijó","Marrequinha Americana","Marrequinha Comum","Mouflão Ibérico","Muntjac vermelho do norte","Nilgó","Onça Parda","Órix do Cabo","Pato Carolino","Pato Harlequim","Pato Olho de Ouro","Pato Real","Peru","Peru Selvagem","Peru Selvagem do Rio Grande","Piadeira","Porco Selvagem","Raposa cinzenta","Raposa tibetana","Raposa Vermelha","Rena da Montanha","Sambar","Tahr","Tetraz Azul","Tetraz Grande","Tigre-de-Bengala","Urso Cinzento","Urso Negro","Urso Pardo","Veado das Montanhas Rochosas","Veado de Cauda Branca","Veado de Cauda Preta","Veado-Mula","Veado de Roosevelt","Veado Vermelho","Cão Guaxinim","Lagópode-Branco","Lagópode-Escocês","Galinha-Montês","Zarro-Negrinha","Zarro-castanho"];
const diamondFursData = {
    "alce": { macho: ["Bronzeado", "Pardo", "Pardo Claro"], femea: [] },
    "antilocapra": { macho: ["Bronzeado", "Escuro", "Pardo"], femea: [] },
    "antílope_negro": { macho: ["Escuro", "Pardo Escuro", "Preto", "Bege"], femea: [] },
    "bantengue": { macho: ["Preto", "Café", "Pardo", "Pardo Escuro"], femea: [] },
    "bisão_da_floresta": { macho: ["Pardo Escuro", "Ruivo", "Metade Ruivo", "Pardo Claro"], femea: [] },
    "bisão_das_planícies": { macho: ["Escuro", "Cinza Claro", "Pardo", "Pardo Claro"], femea: [] },
    "bisão_europeu": { macho: ["Pardo", "Pardo Claro"], femea: [] },
    "búfalo_dágua": { macho: ["Cinzento", "Preto", "Laranja"], femea: [] },
    "búfalo_africano": { macho: ["Cinzento", "Pardo", "Preto"], femea: [] },
    "cabra_da_montanha": { macho: ["Bege", "Branco", "Cinza Claro", "Pardo Claro"], femea: [] },
    "cabra_de_leque": { macho: ["Bronzeado", "Laranja", "Pardo Escuro"], femea: [] },
    "cabra_selvagem": { macho: ["Amarelado", "Branco", "Pardo e Branco", "Pardo Negro", "Preto e Branco", "Pardo"], femea: [] },
    "caititu": { macho: ["Cinza Escuro", "Cinzento", "Pardo", "Pardo Escuro"], femea: [] },
    "camurça": { macho: ["Cor de Mel", "Pardo", "Pardo e Cinza", "Pardo Escuro"], femea: [] },
    "canguru_cinza_oriental": { macho: ["Cinzento variação 1", "Cinzento variação 2","Pardo e Cinza", "Pardo Variação 1", "Pardo Variação 2"], femea: [] },
    "caribu": { macho: ["Pardo Claro", "Pardo Escuro"], femea: [] },
    "caribu_da_floresta_boreal": { macho: ["Pardo Escuro", "Pardo Claro"], femea: [] },
    "carneiro_azul": { macho: ["Cinza Ardósia", "Pardo", "Cinza Azulado", "Amarelo"], femea: [] },
    "carneiro_selvagem": { macho: ["Preto", "Pardo", "Cinzento", "Bronze"], femea: [] },
    "castor_norte_americano": { macho: [], femea: ["Pardo Escuro", "Pardo Claro", "Marrom Avermelhado"] }, // Corrigido
    "cervo_almiscarado": { macho: ["Pardo e Cinza", "Pardo Escuro"], femea: [] },
    "cervo_canadense": { macho: ["Juba Marrom", "Escuro", "Malhado"], femea: ["Malhado"] },
    "cervo_do_pântano": { macho: ["Pardo", "Pardo Claro", "Vermelho", "Pardo Escuro", "Vermelho Escuro"], femea: [] },
    "cervo_de_timor": { macho: ["Dois Tons", "Pardo", "Pardo Claro", "Pardo e Branco"], femea: [] },
    "cervo_sika": { macho: ["Escuro e Pintado", "Pardo", "Pintado", "Preto"], femea: [] },
    "cervo_porco_indiano": { macho: ["Pardo", "Escuro e Pintado", "Pardo Escuro", "Pintado"], femea: [] },
    "chital": { macho: ["Pintado", "Escuro"], femea: [] },
    "chacal_listrado": { macho: ["Pardo Claro", "Pardo Cinza", "Cinzento"], femea: [] },
    "codorna_de_restolho": { macho: ["Pardo", "Pardo e Cinza", "Pardo Escuro"], femea: [] },
    "codorniz_da_virgínia": { macho: [], femea: ["Pardo"] }, // Corrigido
    "coelho_da_flórida": { macho: ["Pardo", "Pardo Claro", "Cinzento", "Cinza Claro"], femea: ["Pardo", "Pardo Claro", "Cinzento", "Cinza Claro"] }, // Corrigido
    "coelho_europeu": { macho: ["Bronzeado", "Pardo", "Pardo Claro", "Pardo Escuro"], femea: [] },
    "coiote": { macho: ["Cinza Escuro", "Pardo e Cinza"], femea: [] },
    "corça": { macho: ["Bronzeado", "Cinza Escuro", "Pardo"], femea: [] },
    "crocodilo_de_água_salgada": { macho: ["Cinzento", "Oliva", "Pardo Escuro"], femea: [] },
    "cudo_menor": { macho: ["Cinzento"], femea: [] },
    "cão_guaxinim": { macho: ["Cinzento", "Pardo Claro", "Preto e Branco"], femea: [] },
    "faisão_de_pescoço_anelado": { macho: ["Cinzento", "Muda", "Pardo", "Pardo e Branco"], femea: [] },
    "frisada": { macho: ["Cinzento", "Plum. de Inverno"], femea: [] },
    "galinha_montês": { macho: ["Cinzento", "Escuro", "Pardo", "Pardo Claro"], femea: [] },
    "galo_lira": { macho: ["Escuro"], femea: [] },
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
    "ibex_espanhol_do_sudeste": { macho: ["pardo hibrido", "pardo acinzentado", "cinza claro", "laranja"], femea: [] },
    "javali": { macho: ["Preto e Dourado", "pardo claro variação 1", "pardo claro variação 2"], femea: [] },
    "javali_africano": { macho: ["Cinzento Escuro", "Pardo Avermelhado"], femea: [] },
    "lebre_antílope": { macho: ["Cinzento", "Mosqueado", "Pardo Escuro", "Pardo"], femea: [] },
    "jacaré_americano": { macho: ["Pardo_Escuro", "Oliva"], femea: [] },
    "lebre_da_cauda_branca": { macho: ["Bege", "Cinzento", "Pardo", "Pardo Claro"], femea: [] },
    "lebre_da_eurásia": { macho: ["Cinza Claro", "Cinza Escuro", "Pardo Claro", "Pardo Escuro"], femea: ["Cinza Claro", "Cinza Escuro", "Pardo Claro", "Pardo Escuro"] }, // Corrigido
    "lebre_europeia": { macho: [], femea: ["cinza", "pardo", "escuro", "pardo claro"] }, // Corrigido
    "lebre_nuca_dourada": { macho: [], femea: ["Castanho", "Pardo", "Cinzento"] }, // Corrigido
    "lebre_peluda": { macho: ["Cinza Claro", "Pardo Claro", "Pardo Escuro", "Muda"], femea: ["Cinza Claro", "Pardo Claro", "Pardo Escuro", "Muda"] }, // Corrigido
    "leão": { macho: ["Bronzeado", "Pardo Claro"], femea: [] },
    "leopardo_das_neves": { macho: ["Neve", "Caramelo"], femea: [] },
    "lince_euroasiática": { macho: ["Cinzento", "Pardo Claro"], femea: [] },
    "lince_pardo_do_méxico": { macho: ["Bronzeado", "Cinzento", "Pardo", "Vermelho"], femea: [] },
    "lobo_cinzento": { macho: ["Cinzento"], femea: [] },
    "lobo_ibérico": { macho: ["Cinzento", "Pardo e Cinza"], femea: [] },
    "marreca_arrebio": { macho: ["Eclipse", "Cinza", "Eritrístico"], femea: [] },
    "marreca_carijó": { macho: ["Canela", "Vermelho", "Malhado"], femea: [] },
    "marrequinha_americana": { macho: ["Verde Claro"], femea: [] },
    "marrequinha_comum": { macho: ["Verde Claro", "Verde Escuro"], femea: [] },
    "mouflão_ibérico": { macho: ["Pardo", "Pardo Claro"], femea: [] },
    "muntjac_vermelho_do_norte": { macho: ["Albino", "Melânico", "Leucismo variação 1", "Leucismo variação 2", "Vermelho variação 1", "Vermelho variação 2"], femea: [] },
    "nilgó": { macho: ["Azul", "Pardo Escuro"], femea: [] },
    "onça_parda": { macho: ["Pardo Claro", "Vermelho Escuro", "Cinzento"], femea: [] },
    "órix_do_cabo": { macho: ["Cinzento", "Cinza Claro"], femea: ["Cinzento", "Cinza Claro"] }, // Corrigido
    "pato_carolino": { macho: ["Escuro", "Prata Diluído", "Padrão", "Dourado Eritrístico"], femea: [] },
    "pato_harlequim": { macho: ["Cinza Escuro", "Malhado"], femea: [] },
    "pato_olho_de_ouro": { macho: ["Preto"], femea: [] },
    "pato_real": { macho: ["Malhado", "Pardo Negro", "Marrom Híbrido"], femea: [] },
    "peru": { macho: ["Pardo", "Pardo Claro", "Pardo Escuro"], femea: [] },
    "peru_selvagem": { macho: ["Bronze", "Bronze Claro", "Pardo", "Pardo Claro"], femea: [] },
    "peru_selvagem_do_rio_grande": { macho: ["Pardo", "Pardo Claro", "Siena", "Siena Claro"], femea: [] },
    "piadeira": { macho: ["Cinzento", "Pardo"], femea: [] },
    "porco_selvagem": { macho: ["manchas pretas variação 1", "manchas pretas variação 2", "hibrido marrom variação 1", "hibrido marrom variação 2", "Preto", "Preto e Dourado"], femea: [] },
    "raposa_cinzenta": { macho: ["Cinzento", "Dois Tons", "Vermelho"], femea: ["Cinzento", "Dois Tons", "Vermelho"] }, // Corrigido
    "raposa_tibetana": { macho: ["Laranja", "Vermelho", "Cinzento", "Pardo"], femea: [] },
    "raposa_vermelha": { macho: ["Laranja", "Vermelho", "Vermelho Escuro"], femea: [] },
    "rena_da_montanha": { macho: ["Pardo Claro", "Pardo Escuro"], femea: [] },
    "sambar": { macho: ["Pardo", "Pardo Claro", "Pardo Escuro"], femea: [] },
    "tahr": { macho: ["Pardo Avermelhado", "Palha", "Pardo Claro"], femea: [] },
    "tetraz_azul": { macho: ["Muda", "Cinza Ardósia"], femea: [] },
    "tetraz_grande": { macho: ["Escuro"], femea: [] },
    "tigre_de_bengala": { macho: ["Laranja"], femea: [] },
    "urso_cinzento": { macho: ["Pardo e Cinza"], femea: [] },
    "urso_negro": { macho: ["Escuro", "Preto", "Cinzento"], femea: [] },
    "urso_pardo": { macho: ["Canela", "Amarelo", "Pardo escuro", "Ouro", "Cinza", "Pardo claro", "Pardo avermelhado", "Espírito"], femea: [] },
    "veado_das_montanhas_rochosas": { macho: ["Cinza Claro", "Pardo", "Pardo Claro"], femea: [] },
    "veado_de_cauda_branca": { macho: ["Bronzeado", "Pardo", "Pardo Escuro"], femea: [] },
    "veado_de_cauda_preta": { macho: ["Cinza Escuro", "Cinzento", "Pardo e Cinza"], femea: [] },
    "veado_mula": { macho: ["Cinzento", "Pardo", "Amarelado"], femea: [] },
    "veado_de_roosevelt": { macho: ["Bronzeado", "Laranja", "Pardo"], femea: [] },
    "veado_vermelho": { macho: ["Pardo", "Pardo Claro", "Pardo Escuro"], femea: [] },
    "lagópode_branco": { macho: ["Bicolor", "Muda", "Mosqueado"], femea: [] },
    "lagópode_escocês": { macho: ["Bicolor", "Muda"], femea: [] },
    "zarro_negrinha": { macho: ["Preto"], femea: [] },
    "zarro_castanho": { macho: ["Pardo Escuro", "Pardo Avermelhado"], femea: [] },
    "ibex_espanhol_do_sudeste": { macho: ["pardo hibrido", "pardo acinzentado", "cinza claro", "laranja"], femea: [] },
    "ibex_de_gredos": { macho: ["Cinza Claro", "Marrom Híbrido", "Cinzento", "Pardo e Cinza"], femea: [] },
    "ibex_de_ronda": { macho: ["Cinzento", "Marrom Híbrido", "Pardo", "Pardo e Cinza"], femea: [] },
    "tetraz_azul": { macho: ["Muda", "Cinza Ardósia"], femea: [] },
    "marreca_arrebio": { macho: ["Eclipse", "Cinza", "Eritrístico"], femea: [] },
    "pato_carolino": { macho: ["Escuro", "Prata Diluído", "Padrão", "Dourado Eritrístico"], femea: [] },
    "caribu_da_floresta_boreal": { macho: ["Pardo Escuro", "Pardo Claro"], femea: [] },
    "cervo_canadense": { macho: ["Juba Marrom", "Escuro"], femea: [] },
    "bisão_da_floresta": { macho: ["Pardo Escuro", "Ruivo", "Metade Ruivo", "Pardo Claro"], femea: [] }
};
const reservesData = { layton_lake: { name: "Lagos de Layton", image: "reservas/layton_lake.png", animals: ["alce", "veado_de_cauda_branca", "veado_de_cauda_preta", "veado_de_roosevelt", "urso_negro", "coiote", "pato_real", "lebre_da_cauda_branca"] }, hirschfelden: { name: "Hirschfelden", image: "reservas/hirschfelden.png", animals: ["gamo", "corça", "veado_vermelho", "javali", "bisão_europeu", "raposa_vermelha", "ganso_do_canadá", "coelho_europeu", "faisão_de_pescoço_anelado"] }, medved_taiga: { name: "Taiga Medved", image: "reservas/medved_taiga.png", animals: ["alce", "rena_da_montanha", "tetraz_grande", "cervo_almiscarado", "urso_pardo", "javali", "lince_euroasiática", "lobo_cinzento"] }, vurhonga_savanna: { name: "Savana Vurhonga", image: "reservas/vurhonga_savanna.png", animals: ["chacal_listrado", "lebre_nuca_dourada", "piadeira", "cudo_menor", "cabra_de_leque", "javali_africano", "gnu_de_cauda_preta", "búfalo_africano", "leão", "órix_do_cabo", "antílope_negro"] }, parque_fernando: { name: "Parque Fernando", image: "reservas/parque_fernando.png", animals: ["veado_vermelho", "marreca_carijó", "caititu", "veado_mula", "onça_parda", "antílope_negro", "búfalo_dágua", "chital"] }, yukon_valley: { name: "Vale do Yukon", image: "reservas/yukon_valley.png", animals: ["caribu", "ganso_do_canadá", "alce", "urso_cinzento", "lobo_cinzento", "bisão_das_planícies", "raposa_vermelha", "pato_harlequim"] }, cuatro_colinas: { name: "Cuatro Colinas", image: "reservas/cuatro_colinas.png", animals: ["ibex_de_gredos", "faisão_de_pescoço_anelado", "ibex_de_beceite", "ibex_espanhol_do_sudeste", "ibex_de_ronda", "mouflão_ibérico", "lobo_ibérico", "javali", "corça", "lebre_europeia", "veado_vermelho"] }, silver_ridge_peaks: { name: "Picos de Silver Ridge", image: "reservas/silver_ridge_peaks.png", animals: ["antilocapra", "carneiro_selvagem", "bisão_das_planícies", "cabra_da_montanha", "veado_mula", "onça_parda", "urso_negro", "veado_das_montanhas_rochosas", "peru_selvagem"] }, te_awaroa: { name: "Te Awaroa", image: "reservas/te_awaroa.png", animals: ["veado_vermelho","gamo", "cabra_selvagem", "porco_selvagem", "cervo_sika", "tahr", "peru_selvagem", "camurça", "coelho_europeu", "pato_real"] }, rancho_del_arroyo: { name: "Rancho del Arroyo", image: "reservas/rancho_del_arroyo.png", animals: ["veado_mula", "veado_de_cauda_branca", "carneiro_selvagem", "antilocapra", "caititu", "coiote", "lince_pardo_do_mexico", "peru_selvagem_do_rio_grande", "faisão_de_pescoço_anelado", "lebre_antílope"] }, mississippi_acres: { name: "Mississippi Acres", image: "reservas/mississippi_acres.png", animals: ["veado_de_cauda_branca", "codorniz_da_virgínia", "marrequinha_americana", "peru", "porco_selvagem", "urso_negro", "raposa_cinzenta", "guaxinim_comum", "coelho_da_flórida", "jacaré_americano"] }, revontuli_coast: { name: "Costa de Revontuli", image: "reservas/revontuli_coast.png", animals: ["galinha_montês", "veado_de_cauda_branca", "urso_pardo", "alce", "ganso_bravo", "ganso_campestre_da_tundra", "ganso_do_canadá", "lagópode_branco", "lagópode_escocês", "pato_real", "piadeira", "tetraz_grande", "cão_guaxinim", "lince_euroasiática", "galo_lira", "lebre_da_eurásia", "marrequinha_comum", "pato_olho_de_ouro", "zarro_negrinha", "veado_de_cauda_preta"] }, new_england_mountains: { name: "New England Mountains", image: "reservas/new_england_mountains.png", animals: ["alce", "codorniz_da_virgínia", "coelho_da_flórida", "faisão_de_pescoço_anelado", "marrequinha_americana", "pato_olho_de_ouro", "pato_real", "peru_selvagem", "guaxinim_comum", "lince_pardo_do_mexico", "raposa_cinzenta", "veado_de_cauda_branca", "urso_negro", "coiote", "raposa_vermelha", "gamo"] }, emerald_coast: { name: "Emerald Coast", image: "reservas/emerald_coast.png", animals: ["canguru_cinza_oriental", "codorna_de_restolho", "raposa_vermelha", "cabra_selvagem", "cervo_porco_indiano", "porco_selvagem", "veado_vermelho", "sambar", "cervo_de_timor", "gamo", "bantengue", "crocodilo_de_água_salgada", "ganso_pega", "chital"] }, sundarpatan: { name: "Sundarpatan", image: "reservas/sundarpatan.png", animals: ["antílope_negro", "ganso_bravo","lebre_peluda", "muntjac_vermelho_do_norte", "raposa_tibetana", "tahr", "carneiro_azul", "cervo_do_pântano", "nilgó", "búfalo_dágua", "leopardo_das_neves", "iaque_selvagem", "tigre_de_bengala", "javali"] }, salzwiesen: { name: "Salzwiesen Park", image: "reservas/salzwiesen.png", animals: ["coelho_europeu", "frisada", "galo_lira", "guaxinim_comum", "raposa_vermelha", "ganso_campestre_da_tundra", "faisão_de_pescoço_anelado", "cão_guaxinim", "ganso_bravo", "marrequinha_comum", "pato_olho_de_ouro", "pato_real", "piadeira", "zarro_negrinha", "zarro_castanho", "veado_de_cauda_preta"] }, askiy_ridge: { name: "Askiy Ridge", image: "reservas/askiy_ridge.png", animals: ["alce", "caribu_da_floresta_boreal", "urso_negro", "veado_mula", "bisão_da_floresta", "cabra_da_montanha", "antilocapra", "tetraz_azul", "pato_real", "pato_carolino", "marreca_arrebio", "ganso_do_canadá", "ganso_das_neves", "lobo_cinzento", "cervo_canadense", "veado_de_cauda_branca", "faisão_de_pescoço_anelado", "carneiro_selvagem", "castor_norte_americano"] } };
const multiMountsData = { "a_fuga": { name: "A Fuga", animals: [{ slug: "veado_vermelho", gender: "macho" },{ slug: "veado_vermelho", gender: "femea" }] }, "abraco_do_urso": { name: "Abraço do Urso", animals: [{ slug: "urso_cinzento", gender: "macho" },{ slug: "urso_cinzento", gender: "macho" }] }, "adeus_filho": { name: "Adeus, Filho", animals: [{ slug: "bisão_das_planícies", gender: "macho" },{ slug: "lobo_cinzento", gender: "macho" },{ slug: "lobo_cinzento", gender: "macho" }] }, "admiralces": { name: "Admiralces", animals: [{ slug: "alce", gender: "macho" },{ slug: "codorniz_da_virgínia", gender: "macho" }] }, "almoco_da_raposa": { name: "Almoço da Raposa", animals: [{ slug: "raposa_vermelha", gender: "macho" },{ slug: "lebre_da_cauda_branca", gender: "macho" }] }, "banquete_no_ar": { name: "Banquete no Ar", animals: [{ slug: "raposa_vermelha", gender: "macho" },{ slug: "faisão_de_pescoço_anelado", gender: "macho" }] }, "brincadeira_de_aves": { name: "Brincadeira de Aves", animals: [{ slug: "lagópode_escocês", gender: "macho" },{ slug: "cão_guaxinim", gender: "macho" }] }, "brincando_de_briga": { name: "Brincando de Briga", animals: [{ slug: "lince_euroasiática", gender: "macho" },{ slug: "lince_euroasiática", gender: "femea" }] }, "caudas_brancas_unidas": { name: "Caudas Brancas Unidas", animals: [{ slug: "veado_de_cauda_branca", gender: "macho" },{ slug: "veado_de_cauda_branca", gender: "macho" },{ slug: "veado_de_cauda_branca", gender: "macho" }] }, "colisao": { name: "Colisão", animals: [{ slug: "veado_de_cauda_preta", gender: "macho" },{ slug: "onça_parda", gender: "macho" }] }, "competicao_amistosa": { name: "Competição Amistosa", animals: [{ slug: "coiote", gender: "macho" },{ slug: "coiote", gender: "macho" },{ slug: "lebre_da_cauda_branca", gender: "macho" }] }, "corcas_unidas": { name: "Corças Unidas", animals: [{ slug: "corça", gender: "macho" },{ slug: "corça", gender: "macho" },{ slug: "corça", gender: "macho" }] }, "davi_e_golias": { name: "Davi e Golias", animals: [{ slug: "ganso_do_canadá", gender: "macho" },{ slug: "bisão_europeu", gender: "macho" }] }, "de_cabeca": { name: "De Cabeça", animals: [{ slug: "ibex_de_beceite", gender: "macho" },{ slug: "ibex_de_gredos", gender: "macho" }] }, "decolagem_de_emergencia": { name: "Decolagem de Emergência", animals: [{ slug: "coiote", gender: "macho" },{ slug: "pato_real", gender: "macho" },{ slug: "pato_real", gender: "macho" },{ slug: "pato_real", gender: "femea" }] }, "despedida_do_solteiros": { name: "Despedida dos Solteiros", animals: [{ slug: "veado_mula", gender: "macho" },{ slug: "veado_mula", gender: "femea" },{ slug: "veado_mula", gender: "femea" }] }, "dois_tipos_de_perus": { name: "Dois Tipos de Perus", animals: [{ slug: "peru_selvagem", gender: "macho" },{ slug: "peru_selvagem_do_rio_grande", gender: "macho" }] }, "espionagem_tatica": { name: "Espionagem Tática", animals: [{ slug: "onça_parda", gender: "femea" },{ slug: "veado_de_roosevelt", gender: "macho" }] }, "faisoes_em_fuga": { name: "Faisões em Fuga", animals: [{ slug: "faisão_de_pescoço_anelado", gender: "macho" },{ slug: "faisão_de_pescoço_anelado", gender: "macho" }] }, "falso_tronco": { name: "Falso Tronco", animals: [{ slug: "jacaré_americano", gender: "macho" },{ slug: "guaxinim_comum", gender: "macho" }] }, "fantasma_da_montanha": { name: "Fantasma da Montanha", animals: [{ slug: "leopardo_das_neves", gender: "macho" },{ slug: "carneiro_azul", gender: "macho" }] }, "fartura_de_bisoes": { name: "Fartura de Bisões", animals: [{ slug: "bisão_europeu", gender: "macho" },{ slug: "bisão_europeu", gender: "macho" }] }, "gamos_unidos": { name: "Gamos Unidos", animals: [{ slug: "gamo", gender: "macho" },{ slug: "gamo", gender: "macho" },{ slug: "gamo", gender: "macho" }] }, "ganha_pao": { name: "Ganha-pão", animals: [{ slug: "búfalo_africano", gender: "macho" },{ slug: "leão", gender: "macho" },{ slug: "leão", gender: "femea" },{ slug: "leão", gender: "femea" }] }, "gansos_zangados": { name: "Gansos Zangados", animals: [{ slug: "ganso_do_canadá", gender: "macho" },{ slug: "ganso_do_canadá", gender: "macho" }] }, "gluglu": { name: "Gluglu", animals: [{ slug: "peru_selvagem", gender: "macho" },{ slug: "peru_selvagem", gender: "femea" },{ slug: "peru_selvagem", gender: "femea" }] }, "lanchinho_de_tigre": { name: "Lanchinho de Tigre", animals: [{ slug: "tahr", gender: "macho" },{ slug: "tahr", gender: "femea" },{ slug: "tahr", gender: "femea" }] }, "laod_a_lado": { name: "Laod a Lado", animals: [{ slug: "veado_de_cauda_branca", gender: "macho" },{ slug: "veado_de_cauda_branca", gender: "macho" }] }, "lebres_rivais": { name: "Lebres Rivais", animals: [{ slug: "lebre_antílope", gender: "macho" },{ slug: "lebre_antílope", gender: "macho" }] }, "lobo_alfa": { name: "Lobo Alfa", animals: [{ slug: "lobo_cinzento", gender: "macho" },{ slug: "lobo_cinzento", gender: "femea" },{ slug: "lobo_cinzento", gender: "femea" }] }, "marujos_de_agua_doce": { name: "Marujos de Água Doce", animals: [{ slug: "faisão_de_pescoço_anelado", gender: "macho" },{ slug: "tetraz_grande", gender: "macho" },{ slug: "ganso_bravo", gender: "macho" },{ slug: "ganso_campestre_da_tundra", gender: "macho" }] }, "necessidades_basicas": { name: "Necessidades Básicas", animals: [{ slug: "urso_negro", gender: "macho" },{ slug: "urso_negro", gender: "macho" }] }, "o_grand_slam": { name: "O Grand Slam", animals: [{ slug: "ibex_de_beceite", gender: "macho" },{ slug: "ibex_de_gredos", gender: "macho" },{ slug: "ibex_de_ronda", gender: "macho" },{ slug: "ibex_espanhol_do_sudeste", gender: "macho" }] }, "operador_suave": { name: "Operador Suave", animals: [{ slug: "tetraz_grande", gender: "macho" },{ slug: "tetraz_grande", gender: "femea" },{ slug: "tetraz_grande", gender: "femea" }] }, "os_tres_patinhos": { name: "Os Três Patinhos", animals: [{ slug: "piadeira", gender: "macho" },{ slug: "zarro_castanho", gender: "macho" },{ slug: "frisada", gender: "macho" }] }, "parceiros_no_crime": { name: "Parceiros no Crime", animals: [{ slug: "raposa_vermelha", gender: "macho" },{ slug: "raposa_vermelha", gender: "macho" }] }, "presas_a_mostra": { name: "Presas à Mostra", animals: [{ slug: "mouflão_ibérico", gender: "macho" },{ slug: "lobo_ibérico", gender: "macho" },{ slug: "lobo_ibérico", gender: "macho" },{ slug: "lobo_ibérico", gender: "macho" }] }, "procos_do_mato_em_conflito": { name: "Procos-do-Mato em Conflito", animals: [{ slug: "caititu", gender: "macho" },{ slug: "caititu", gender: "macho" }] }, "ramboru": { name: "Ramboru", animals: [{ slug: "canguru_cinzento_oriental", gender: "macho" },{ slug: "canguru_cinzento_oriental", gender: "macho" }] }, "raposas_adversarias": { name: "Raposas Adversárias", animals: [{ slug: "raposa_vermelha", gender: "macho" },{ slug: "raposa_cinzenta", gender: "macho" }] }, "realeza": { name: "Realeza", animals: [{ slug: "leão", gender: "macho" },{ slug: "leão", gender: "femea" }] }, "rixa_de_aves": { name: "Rixa de Aves", animals: [{ slug: "galo_lira", gender: "macho" },{ slug: "galo_lira", gender: "macho" }] }, "saindo_de_fininho": { name: "Saindo de Fininho", animals: [{ slug: "pato_real", gender: "macho" },{ slug: "pato_olho_de_ouro", gender: "macho" },{ slug: "zarro_negrinha", gender: "macho" },{ slug: "marrequinha_comum", gender: "macho" },{ slug: "piadeira", gender: "macho" },{ slug: "zarro_castanho", gender: "macho" },{ slug: "frisada", gender: "macho" }] }, "tahr_angulo_amoroso": { name: "Tahr-ângulo Amoroso", animals: [{ slug: "tigre_de_bengala", gender: "macho" },{ slug: "cervo_do_pântano", gender: "macho" }] }, "treno_vendido_separadamente": { name: "Trenó Vendido Separadamente", animals: [{ slug: "rena_da_montanha", gender: "macho" },{ slug: "rena_da_montanha", gender: "macho" },{ slug: "rena_da_montanha", gender: "macho" }] }, "turma_dos_coelhos": { name: "Turma dos Coelhos", animals: [{ slug: "lebre_da_cauda_branca", gender: "macho" },{ slug: "lebre_da_cauda_branca", gender: "macho" },{ slug: "lebre_da_cauda_branca", gender: "femea" },{ slug: "lebre_da_cauda_branca", gender: "femea" }] }, "um_crocodilo_sortudo": { name: "Um Crocodilo Sortudo", animals: [{ slug: "ganso_pega", gender: "macho" },{ slug: "crocodilo_de_água_salgada", gender: "macho" }] }, "um_par_de_predadores": { name: "Um Par de Predadores", animals: [{ slug: "coiote", gender: "macho" },{ slug: "lince_pardo_do_mexico", gender: "macho" }] }, "vigilancia": { name: "Vigilância", animals: [{ slug: "cudo_menor", gender: "macho" },{ slug: "cudo_menor", gender: "femea" }] }, "viver_amar_lenhar": { name: "Viver, Amar, Lenhar", animals: [{ slug: "castor_norte_americano", gender: "macho" },{ slug: "castor_norte_americano", gender: "femea" }] } };

// Nova constante com os dados de hotspot
const hotspotData = {
    "layton_lake": {
        "alce": {
            mapImage: "layton_lake_alce_hotspot",
            maxScore: 274.99,
            maxWeightEstimate: "545-620 KG",
            needZonesPotential: "12:00 - 16:00",
            animalClass: "8",
            maxLevel: "5 (Médio)"
        },
        "veado_de_cauda_branca": {
            mapImage: "layton_lake_veado_de_cauda_branca_hotspot",
            maxScore: 255.09,
            maxWeightEstimate: "75-100 KG",
            needZonesPotential: "08:00 - 12:00",
            animalClass: "4",
            maxLevel: "3 (Muito Fácil)"
        },
        "veado_de_cauda_preta": {
            mapImage: "layton_lake_veado_de_cauda_preta_hotspot",
            maxScore: 177.58,
            maxWeightEstimate: "81-95 KG",
            needZonesPotential: "16:00 - 20:00",
            animalClass: "4",
            maxLevel: "5 (Médio)"
        },
        "veado_de_roosevelt": {
            mapImage: "layton_lake_veado_de_roosevelt_hotspot",
            maxScore: 380.84,
            maxWeightEstimate: "450-500 KG",
            needZonesPotential: "04:00 - 08:00",
            animalClass: "7",
            maxLevel: "5 (Médio)"
        },
        "urso_negro": {
            mapImage: "layton_lake_urso_negro_hotspot",
            maxScore: 22.8,
            maxWeightEstimate: "227-290 KG",
            needZonesPotential: "04:00 - 08:00",
            animalClass: "7",
            maxLevel: "9 (Lendário)"
        },
        "coiote": {
            mapImage: "layton_lake_coiote_hotspot",
            maxScore: 56.87,
            maxWeightEstimate: "24-27 KG",
            needZonesPotential: "00:00 - 04:00",
            animalClass: "2",
            maxLevel: "9 (Lendário)"
        },
        "pato_real": {
            mapImage: "layton_lake_pato_real_hotspot",
            maxScore: 19.61,
            maxWeightEstimate: "1-2 KG",
            needZonesPotential: "O DIA TODO",
            animalClass: "1",
            maxLevel: "3 (Muito Fácil)"
        },
        "lebre_da_cauda_branca": {
            mapImage: "layton_lake_lebre_da_cauda_branca_hotspot",
            maxScore: 6.33,
            maxWeightEstimate: "5-6 KG",
            needZonesPotential: "O DIA TODO",
            animalClass: "1",
            maxLevel: "3 (Muito Fácil)"
        },
        "peru_selvagem": { // Assumindo "Peru Merriami" é um tipo de peru selvagem
            mapImage: "layton_lake_peru_selvagem_hotspot",
            maxScore: 4.62,
            maxWeightEstimate: "9-11 KG",
            needZonesPotential: "O DIA TODO",
            animalClass: "1",
            maxLevel: "3 (Muito Fácil)"
        }
    },
    "hirschfelden": {
        "gamo": {
            mapImage: "hirschfelden_gamo_hotspot",
            maxScore: 249.99,
            maxWeightEstimate: "82-100 KG",
            needZonesPotential: "10:00-13:00",
            animalClass: "4",
            maxLevel: "5 (Médio)"
        },
        "corça": {
            mapImage: "hirschfelden_corca_hotspot",
            maxScore: 81.86,
            maxWeightEstimate: "29-35 KG",
            needZonesPotential: "14:00-17:00",
            animalClass: "3",
            maxLevel: "3 (Muito Fácil)"
        },
        "veado_vermelho": {
            mapImage: "hirschfelden_veado_vermelho_hotspot",
            maxScore: 251.07,
            maxWeightEstimate: "210-240 KG",
            needZonesPotential: "06:00-10:00",
            animalClass: "6",
            maxLevel: "9 (Lendário)"
        },
        "javali": {
            mapImage: "hirschfelden_javali_hotspot",
            maxScore: 144.25,
            maxWeightEstimate: "186-240 KG",
            needZonesPotential: "00:00-03:00",
            animalClass: "5",
            maxLevel: "5 (Médio)"
        },
        "bisão_europeu": {
            mapImage: "hirschfelden_bisao_europeu_hotspot",
            maxScore: 127.62,
            maxWeightEstimate: "765-920 KG",
            needZonesPotential: "10:00-14:00",
            animalClass: "9",
            maxLevel: "5 (Médio)"
        },
        "raposa_vermelha": {
            mapImage: "hirschfelden_raposa_vermelha_hotspot",
            maxScore: 14.05,
            maxWeightEstimate: "12-15 KG",
            needZonesPotential: "17:00-20:00",
            animalClass: "2",
            maxLevel: "9 (Lendário)"
        },
        "ganso_do_canadá": {
            mapImage: "hirschfelden_ganso_do_canada_hotspot",
            maxScore: 8.59,
            maxWeightEstimate: "8-9 KG",
            needZonesPotential: "O DIA TODO",
            animalClass: "1",
            maxLevel: "5 (Médio)"
        },
        "coelho_europeu": {
            mapImage: "hirschfelden_coelho_europeu_hotspot",
            maxScore: 2.42,
            maxWeightEstimate: "2 KG",
            needZonesPotential: "O DIA TODO", // Tocas Potencial
            animalClass: "1",
            maxLevel: "3 (Muito Fácil)"
        },
        "faisão_de_pescoço_anelado": {
            mapImage: "hirschfelden_faisao_de_pescoco_anelado_hotspot",
            maxScore: 20.29,
            maxWeightEstimate: null, // Campo vazio
            needZonesPotential: "O DIA TODO",
            animalClass: "1",
            maxLevel: "3 (Muito Fácil)"
        }
    },
    "medved_taiga": {
        "alce": {
            mapImage: "medved_taiga_alce_hotspot",
            maxScore: 274.99,
            maxWeightEstimate: "545-620 KG",
            needZonesPotential: "12:00 - 16:00",
            animalClass: "8",
            maxLevel: "5 (Médio)"
        },
        "rena_da_montanha": {
            mapImage: "medved_taiga_rena_da_montanha_hotspot",
            maxScore: 430.23,
            maxWeightEstimate: "156-182 KG",
            needZonesPotential: "04:00 - 08:00",
            animalClass: "6",
            maxLevel: "5 (Médio)"
        },
        "tetraz_grande": {
            mapImage: "medved_taiga_tetraz_grande_hotspot",
            maxScore: 4.64,
            maxWeightEstimate: "4-5 KG",
            needZonesPotential: "O DIA TODO",
            animalClass: "1",
            maxLevel: "3 (Muito Fácil)"
        },
        "cervo_almiscarado": {
            mapImage: "medved_taiga_cervo_almiscarado_hotspot",
            maxScore: 249,
            maxWeightEstimate: "14-17 KG",
            needZonesPotential: "08:00 - 12:00",
            animalClass: "2",
            maxLevel: "3 (Muito Fácil)"
        },
        "urso_pardo": {
            mapImage: "medved_taiga_urso_pardo_hotspot",
            maxScore: 27.7,
            maxWeightEstimate: "389-452 KG",
            needZonesPotential: "04:00 - 08:00",
            animalClass: "7",
            maxLevel: "9 (Lendário)"
        },
        "javali": {
            mapImage: "medved_taiga_javali_hotspot",
            maxScore: 144.25,
            maxWeightEstimate: "186-240 KG",
            needZonesPotential: "00:00-03:00",
            animalClass: "4", // Javali em Medved é Classe 4, diferente de Hirschfelden
            maxLevel: "5 (Médio)"
        },
        "lince_euroasiática": {
            mapImage: "medved_taiga_lince_euroasiatica_hotspot",
            maxScore: 27.68,
            maxWeightEstimate: "35-45 KG",
            needZonesPotential: "03:00-06:00",
            animalClass: "3",
            maxLevel: "9 (Lendário)"
        },
        "lobo_cinzento": {
            mapImage: "medved_taiga_lobo_cinzento_hotspot",
            maxScore: 39,
            maxWeightEstimate: "67-80 KG",
            needZonesPotential: "17:00-20:00",
            animalClass: "5",
            maxLevel: "9 (Lendário)"
        }
    },
    "vurhonga_savanna": {
        "chacal_listrado": {
            mapImage: "vurhonga_savanna_chacal_listrado_hotspot",
            maxScore: 29.10,
            maxWeightEstimate: "12-14 KG",
            needZonesPotential: "O DIA TODO",
            animalClass: "2",
            maxLevel: "9 (Lendário)"
        },
        "lebre_nuca_dourada": {
            mapImage: "vurhonga_savanna_lebre_nuca_dourada_hotspot",
            maxScore: 5.37,
            maxWeightEstimate: "4-5 KG",
            needZonesPotential: "O DIA TODO",
            animalClass: "1",
            maxLevel: "3 (Muito Fácil)"
        },
        "piadeira": {
            mapImage: "vurhonga_savanna_piadeira_hotspot",
            maxScore: 905,
            maxWeightEstimate: "0 KG",
            needZonesPotential: "O DIA TODO",
            animalClass: "1",
            maxLevel: "3 (Muito Fácil)"
        },
        "cudo_menor": {
            mapImage: "vurhonga_savanna_cudo_menor_hotspot",
            maxScore: 151.64,
            maxWeightEstimate: "91-105 KG",
            needZonesPotential: "18:00-21:00",
            animalClass: "4",
            maxLevel: "5 (Médio)"
        },
        "cabra_de_leque": {
            mapImage: "vurhonga_savanna_cabra_de_leque_hotspot",
            maxScore: 78.55,
            maxWeightEstimate: "38-42 KG",
            needZonesPotential: "O DIA TODO",
            animalClass: "3",
            maxLevel: "5 (Médio)"
        },
        "javali_africano": {
            mapImage: "vurhonga_savanna_javali_africano_hotspot",
            maxScore: 58.19,
            maxWeightEstimate: "123-150 KG",
            needZonesPotential: "15:00-18:00",
            animalClass: "4",
            maxLevel: "5 (Médio)"
        },
        "gnu_de_cauda_preta": {
            mapImage: "vurhonga_savanna_gnu_de_cauda_preta_hotspot",
            maxScore: 37.69,
            maxWeightEstimate: "265-290 KG",
            needZonesPotential: "06:00-09:00",
            animalClass: "6",
            maxLevel: "5 (Médio)"
        },
        "búfalo_africano": {
            mapImage: "vurhonga_savanna_bufalo_africano_hotspot",
            maxScore: 151.35,
            maxWeightEstimate: "802-950 KG",
            needZonesPotential: "09:00-12:00",
            animalClass: "9",
            maxLevel: "9 (Lendário)"
        },
        "leão": {
            mapImage: "vurhonga_savanna_leao_hotspot",
            maxScore: 48.50,
            maxWeightEstimate: "236-270 KG",
            needZonesPotential: "12:00-15:00",
            animalClass: "9",
            maxLevel: "9 (Lendário)"
        },
        "órix_do_cabo": {
            mapImage: "vurhonga_savanna_orix_do_cabo_hotspot",
            maxScore: 337.59,
            maxWeightEstimate: "210-240 KG",
            needZonesPotential: "03:00-06:00",
            animalClass: "6",
            maxLevel: "5 (Médio)"
        },
        "antílope_negro": {
            mapImage: "vurhonga_savanna_antilope_negro_hotspot",
            maxScore: 132.26,
            maxWeightEstimate: "44-51 KG",
            needZonesPotential: "18:00-21:00",
            animalClass: "3",
            maxLevel: "5 (Médio)"
        }
    },
    "parque_fernando": {
        "veado_vermelho": {
            mapImage: "parque_fernando_veado_vermelho_hotspot",
            maxScore: 251.07,
            maxWeightEstimate: "210-240 KG",
            needZonesPotential: "06:00-10:00",
            animalClass: "6",
            maxLevel: "9 (Lendário)"
        },
        "marreca_carijó": {
            mapImage: "parque_fernando_marreca_carijo_hotspot",
            maxScore: 4.62,
            maxWeightEstimate: "0 KG",
            needZonesPotential: "O DIA TODO",
            animalClass: "1",
            maxLevel: "3 (Muito Fácil)"
        },
        "caititu": {
            mapImage: "parque_fernando_caititu_hotspot",
            maxScore: 144.25,
            maxWeightEstimate: "26-31 KG",
            needZonesPotential: "00:00-03:00",
            animalClass: "3",
            maxLevel: "5 (Médio)"
        },
        "veado_mula": {
            mapImage: "parque_fernando_veado_mula_hotspot",
            maxScore: 312.17,
            maxWeightEstimate: "175-210 KG",
            needZonesPotential: "15:00-18:00",
            animalClass: "5",
            maxLevel: "5 (Médio)"
        },
        "onça_parda": {
            mapImage: "parque_fernando_onca_parda_hotspot",
            maxScore: 39,
            maxWeightEstimate: "86-105 KG",
            needZonesPotential: "21:00-00:00",
            animalClass: "5",
            maxLevel: "9 (Lendário)"
        },
        "antílope_negro": {
            mapImage: "parque_fernando_antilope_negro_hotspot",
            maxScore: 132.26,
            maxWeightEstimate: "44-51 KG",
            needZonesPotential: "18:00-21:00",
            animalClass: "3",
            maxLevel: "5 (Médio)"
        },
        "búfalo_dágua": {
            mapImage: "parque_fernando_bufalo_dagua_hotspot",
            maxScore: 167.54,
            maxWeightEstimate: "1067-1250 KG",
            needZonesPotential: "12:00-15:00",
            animalClass: "9",
            maxLevel: "9 (Lendário)"
        },
        "chital": {
            mapImage: "parque_fernando_chital_hotspot",
            maxScore: 217.29,
            maxWeightEstimate: "67-75 KG",
            needZonesPotential: "03:00-06:00",
            animalClass: "3",
            maxLevel: "5 (Médio)"
        }
    },
    "yukon_valley": {
        "caribu": {
            mapImage: "yukon_valley_caribu_hotspot",
            maxScore: 430.23,
            maxWeightEstimate: "161-190KG",
            needZonesPotential: "04:00-08:00",
            animalClass: "6",
            maxLevel: "5 (Médio)"
        },
        "ganso_do_canadá": {
            mapImage: "yukon_valley_ganso_do_canada_hotspot",
            maxScore: 8.59,
            maxWeightEstimate: "8-9 KG",
            needZonesPotential: "O DIA TODO",
            animalClass: "1",
            maxLevel: "5 (Médio)"
        },
        "alce": {
            mapImage: "yukon_valley_alce_hotspot",
            maxScore: 274.99,
            maxWeightEstimate: "545-620 KG",
            needZonesPotential: "12:00 - 16:00",
            animalClass: "8",
            maxLevel: "5 (Médio)"
        },
        "urso_cinzento": {
            mapImage: "yukon_valley_urso_cinzento_hotspot",
            maxScore: 66.94,
            maxWeightEstimate: "551-680 KG",
            needZonesPotential: "04:00 - 08:00",
            animalClass: "8",
            maxLevel: "9 (Lendário)"
        },
        "lobo_cinzento": {
            mapImage: "yukon_valley_lobo_cinzento_hotspot",
            maxScore: 39,
            maxWeightEstimate: "67-80 KG",
            needZonesPotential: "00:00-03:00",
            animalClass: "5",
            maxLevel: "9 (Lendário)"
        },
        "bisão_das_planícies": {
            mapImage: "yukon_valley_bisao_das_planicies_hotspot",
            maxScore: 183.5,
            maxWeightEstimate: "987-1200 KG",
            needZonesPotential: "08:00-12:00",
            animalClass: "9",
            maxLevel: "5 (Médio)"
        },
        "raposa_vermelha": {
            mapImage: "yukon_valley_raposa_vermelha_hotspot",
            maxScore: 14.05,
            maxWeightEstimate: "12-15 KG",
            needZonesPotential: "17:00-20:00",
            animalClass: "2",
            maxLevel: "9 (Lendário)"
        },
        "pato_harlequim": {
            mapImage: "yukon_valley_pato_harlequim_hotspot",
            maxScore: 7.23,
            maxWeightEstimate: "0 KG",
            needZonesPotential: "O DIA TODO",
            animalClass: "1",
            maxLevel: "3 (Muito Fácil)"
        }
    },
    "cuatro_colinas": {
        "ibex_de_gredos": {
            mapImage: "cuatro_colinas_ibex_de_gredos_hotspot",
            maxScore: 100.17,
            maxWeightEstimate: "85-102 KG",
            needZonesPotential: "10:00-14:00",
            animalClass: "4",
            maxLevel: "5 (Médio)"
        },
        "faisão_de_pescoço_anelado": {
            mapImage: "cuatro_colinas_faisao_de_pescoco_anelado_hotspot",
            maxScore: 20.29,
            maxWeightEstimate: "2-3 KG",
            needZonesPotential: "O DIA TODO",
            animalClass: "1",
            maxLevel: "3 (Muito Fácil)"
        },
        "ibex_de_beceite": {
            mapImage: "cuatro_colinas_ibex_de_beceite_hotspot",
            maxScore: 191.63,
            maxWeightEstimate: "91-110 KG",
            needZonesPotential: "10:00-14:00",
            animalClass: "4",
            maxLevel: "5 (Médio)"
        },
        "ibex_espanhol_do_sudeste": {
            mapImage: "cuatro_colinas_ibex_espanhol_do_sudeste_hotspot",
            maxScore: 89.68,
            maxWeightEstimate: "74-87 KG",
            needZonesPotential: "10:00-14:00",
            animalClass: "4",
            maxLevel: "5 (Médio)"
        },
        "ibex_de_ronda": {
            mapImage: "cuatro_colinas_ibex_de_ronda_hotspot",
            maxScore: 107.98,
            maxWeightEstimate: "61-70 KG",
            needZonesPotential: "10:00-14:00",
            animalClass: "4",
            maxLevel: "5 (Médio)"
        },
        "mouflão_ibérico": {
            mapImage: "cuatro_colinas_mouflao_iberico_hotspot",
            maxScore: 179.56,
            maxWeightEstimate: "52-60 KG",
            needZonesPotential: "18:00-21:00",
            animalClass: "4",
            maxLevel: "5 (Médio)"
        },
        "lobo_ibérico": {
            mapImage: "cuatro_colinas_lobo_iberico_hotspot",
            maxScore: 39,
            maxWeightEstimate: "45-50 KG",
            needZonesPotential: "03:00-06:00",
            animalClass: "5",
            maxLevel: "9 (Lendário)"
        },
        "javali": {
            mapImage: "cuatro_colinas_javali_hotspot",
            maxScore: 144.25,
            maxWeightEstimate: "186-240 KG",
            needZonesPotential: "00:00-03:00",
            animalClass: "5",
            maxLevel: "5 (Médio)"
        },
        "corça": {
            mapImage: "cuatro_colinas_corca_hotspot",
            maxScore: 81.86,
            maxWeightEstimate: "29-35 KG",
            needZonesPotential: "14:00-17:00",
            animalClass: "3",
            maxLevel: "3 (Muito Fácil)"
        },
        "lebre_europeia": {
            mapImage: "cuatro_colinas_lebre_europeia_hotspot",
            maxScore: 6.5,
            maxWeightEstimate: "5-7 KG",
            needZonesPotential: "O DIA TODO",
            animalClass: "1",
            maxLevel: "3 (Muito Fácil)"
        },
        "veado_vermelho": {
            mapImage: "cuatro_colinas_veado_vermelho_hotspot",
            maxScore: 251.07,
            maxWeightEstimate: "210-240 KG",
            needZonesPotential: "06:00-10:00",
            animalClass: "6",
            maxLevel: "9 (Lendário)"
        }
    },
    "silver_ridge_peaks": {
        "antilocapra": {
            mapImage: "silver_ridge_peaks_antilocapra_hotspot",
            maxScore: 108,
            maxWeightEstimate: "57-65 KG",
            needZonesPotential: "18:00-21:00",
            animalClass: "3",
            maxLevel: "5 (Médio)"
        },
        "carneiro_selvagem": {
            mapImage: "silver_ridge_peaks_carneiro_selvagem_hotspot",
            maxScore: 196.93,
            maxWeightEstimate: "132-160 KG",
            needZonesPotential: "12:00-16:00",
            animalClass: "5",
            maxLevel: "5 (Médio)"
        },
        "bisão_das_planícies": {
            mapImage: "silver_ridge_peaks_bisao_das_planicies_hotspot",
            maxScore: 183.5,
            maxWeightEstimate: "987-1200 KG",
            needZonesPotential: "08:00-12:00",
            animalClass: "9",
            maxLevel: "5 (Médio)"
        },
        "cabra_da_montanha": {
            mapImage: "silver_ridge_peaks_cabra_da_montanha_hotspot",
            maxScore: 107.67,
            maxWeightEstimate: "120-145 KG",
            needZonesPotential: "O DIA TODO",
            animalClass: "4",
            maxLevel: "5 (Médio)"
        },
        "veado_mula": {
            mapImage: "silver_ridge_peaks_veado_mula_hotspot",
            maxScore: 312.17,
            maxWeightEstimate: "175-210 KG",
            needZonesPotential: "15:00-18:00",
            animalClass: "5",
            maxLevel: "5 (Médio)"
        },
        "onça_parda": {
            mapImage: "silver_ridge_peaks_onca_parda_hotspot",
            maxScore: 39,
            maxWeightEstimate: "86-105 KG",
            needZonesPotential: "21:00-00:00",
            animalClass: "5",
            maxLevel: "9 (Lendário)"
        },
        "urso_negro": {
            mapImage: "silver_ridge_peaks_urso_negro_hotspot",
            maxScore: 22.8,
            maxWeightEstimate: "227-290 KG",
            needZonesPotential: "04:00 - 08:00",
            animalClass: "7",
            maxLevel: "9 (Lendário)"
        },
        "veado_das_montanhas_rochosas": {
            mapImage: "silver_ridge_peaks_veado_das_montanhas_rochosas_hotspot",
            maxScore: 481.41,
            maxWeightEstimate: "410-480 KG",
            needZonesPotential: "04:00-08:00",
            animalClass: "7",
            maxLevel: "5 (Médio)"
        },
        "peru_selvagem": { // Assumindo "Peru Merriami" aqui também
            mapImage: "silver_ridge_peaks_peru_selvagem_hotspot",
            maxScore: 4.62,
            maxWeightEstimate: "9-11 KG",
            needZonesPotential: "O DIA TODO",
            animalClass: "1",
            maxLevel: "3 (Muito Fácil)"
        }
    },
    "te_awaroa": {
        "veado_vermelho": {
            mapImage: "te_awaroa_veado_vermelho_hotspot",
            maxScore: 251.07,
            maxWeightEstimate: "210-240 KG",
            needZonesPotential: "06:00-10:00",
            animalClass: "6",
            maxLevel: "9 (Lendário)"
        },
        "gamo": {
            mapImage: "te_awaroa_gamo_hotspot",
            maxScore: 249.99,
            maxWeightEstimate: "82-100 KG",
            needZonesPotential: "10:00-13:00",
            animalClass: "4",
            maxLevel: "5 (Médio)"
        },
        "cabra_selvagem": {
            mapImage: "te_awaroa_cabra_selvagem_hotspot",
            maxScore: 208.71,
            maxWeightEstimate: "43-50 KG",
            needZonesPotential: "15:00-18:00",
            animalClass: "3",
            maxLevel: "5 (Médio)"
        },
        "porco_selvagem": {
            mapImage: "te_awaroa_porco_selvagem_hotspot",
            maxScore: 144.25,
            maxWeightEstimate: "161-205 KG",
            needZonesPotential: "03:00-06:00",
            animalClass: "5",
            maxLevel: "5 (Médio)"
        },
        "cervo_sika": {
            mapImage: "te_awaroa_cervo_sika_hotspot",
            maxScore: 198.74,
            maxWeightEstimate: "62-75 KG",
            needZonesPotential: "10:00-13:00",
            animalClass: "4",
            maxLevel: "5 (Médio)"
        },
        "tahr": {
            mapImage: "te_awaroa_tahr_hotspot",
            maxScore: 101.87,
            maxWeightEstimate: "117-140 KG",
            needZonesPotential: "04:00-07:00, 07:00-11:00, 14:00-17:00, 17:00-20:00", // Zonas de Comida
            animalClass: "4",
            maxLevel: "5 (Médio)"
        },
        "peru_selvagem": { // Assumindo "Peru Merriami" aqui também
            mapImage: "te_awaroa_peru_selvagem_hotspot",
            maxScore: 4.62,
            maxWeightEstimate: "9-11 KG",
            needZonesPotential: "O DIA TODO",
            animalClass: "1",
            maxLevel: "3 (Muito Fácil)"
        },
        "camurça": {
            mapImage: "te_awaroa_camurca_hotspot",
            maxScore: 58,
            maxWeightEstimate: "57-65 KG",
            needZonesPotential: "O DIA TODO",
            animalClass: "3",
            maxLevel: "5 (Médio)"
        },
        "coelho_europeu": {
            mapImage: "te_awaroa_coelho_europeu_hotspot",
            maxScore: 2.42,
            maxWeightEstimate: "2 KG",
            needZonesPotential: "O DIA TODO", // Tocas Potencial
            animalClass: "1",
            maxLevel: "3 (Muito Fácil)"
        },
        "pato_real": {
            mapImage: "te_awaroa_pato_real_hotspot",
            maxScore: 19.61,
            maxWeightEstimate: "1-2 KG",
            needZonesPotential: "O DIA TODO",
            animalClass: "1",
            maxLevel: "3 (Muito Fácil)"
        }
    },
    "rancho_del_arroyo": {
        "veado_mula": {
            mapImage: "rancho_del_arroyo_veado_mula_hotspot",
            maxScore: 312.17,
            maxWeightEstimate: "175-210 KG",
            needZonesPotential: "15:00-18:00",
            animalClass: "5",
            maxLevel: "5 (Médio)"
        },
        "veado_de_cauda_branca": {
            mapImage: "rancho_del_arroyo_veado_de_cauda_branca_hotspot",
            maxScore: 255.09,
            maxWeightEstimate: "75-100 KG",
            needZonesPotential: "08:00 - 12:00",
            animalClass: "4",
            maxLevel: "3 (Muito Fácil)"
        },
        "carneiro_selvagem": {
            mapImage: "rancho_del_arroyo_carneiro_selvagem_hotspot",
            maxScore: 196.93,
            maxWeightEstimate: "132-160 KG",
            needZonesPotential: "12:00-16:00",
            animalClass: "5",
            maxLevel: "5 (Médio)"
        },
        "antilocapra": {
            mapImage: "rancho_del_arroyo_antilocapra_hotspot",
            maxScore: 108,
            maxWeightEstimate: "57-65 KG",
            needZonesPotential: "18:00-21:00",
            animalClass: "3",
            maxLevel: "5 (Médio)"
        },
        "caititu": {
            mapImage: "rancho_del_arroyo_caititu_hotspot",
            maxScore: 144.25,
            maxWeightEstimate: "26-31 KG",
            needZonesPotential: "00:00-03:00",
            animalClass: "3",
            maxLevel: "5 (Médio)"
        },
        "coiote": {
            mapImage: "rancho_del_arroyo_coiote_hotspot",
            maxScore: 56.87,
            maxWeightEstimate: "24-27 KG",
            needZonesPotential: "09:00 - 00:00",
            animalClass: "2",
            maxLevel: "9 (Lendário)"
        },
        "lince_pardo_do_mexico": {
            mapImage: "rancho_del_arroyo_lince_pardo_do_mexico_hotspot",
            maxScore: 27.68,
            maxWeightEstimate: "35-45 KG",
            needZonesPotential: "03:00 - 06:00",
            animalClass: "2",
            maxLevel: "9 (Lendário)"
        },
        "peru_selvagem_do_rio_grande": {
            mapImage: "rancho_del_arroyo_peru_selvagem_do_rio_grande_hotspot",
            maxScore: 4.62,
            maxWeightEstimate: "9-11 KG",
            needZonesPotential: "O DIA TODO",
            animalClass: "1",
            maxLevel: "3 (Muito Fácil)"
        },
        "faisão_de_pescoço_anelado": {
            mapImage: "rancho_del_arroyo_faisao_de_pescoco_anelado_hotspot",
            maxScore: 20.29,
            maxWeightEstimate: null, // Campo vazio
            needZonesPotential: "O DIA TODO",
            animalClass: "1",
            maxLevel: "3 (Muito Fácil)"
        },
        "lebre_antílope": {
            mapImage: "rancho_del_arroyo_lebre_antilope_hotspot",
            maxScore: 6.33,
            maxWeightEstimate: "3-4 kg",
            needZonesPotential: "O DIA TODO",
            animalClass: "1",
            maxLevel: "3 (Muito Fácil)"
        }
    },
    "mississippi_acres": {
        "veado_de_cauda_branca": {
            mapImage: "mississippi_acres_veado_de_cauda_branca_hotspot",
            maxScore: 255.09,
            maxWeightEstimate: "75-100 KG",
            needZonesPotential: "08:00 - 12:00",
            animalClass: "4",
            maxLevel: "3 (Muito Fácil)"
        },
        "codorniz_da_virgínia": {
            mapImage: "mississippi_acres_codorniz_da_virgínia_hotspot",
            maxScore: 238,
            maxWeightEstimate: "0 kg",
            needZonesPotential: "O DIA TODO",
            animalClass: "1",
            maxLevel: "3 (Muito Fácil)"
        },
        "marrequinha_americana": {
            mapImage: "mississippi_acres_marrequinha_americana_hotspot",
            maxScore: 480,
            maxWeightEstimate: "0 KG",
            needZonesPotential: "O DIA TODO",
            animalClass: "1",
            maxLevel: "3 (Muito Fácil)"
        },
        "peru": {
            mapImage: "mississippi_acres_peru_hotspot",
            maxScore: 4.6,
            maxWeightEstimate: "9-11 KG",
            needZonesPotential: "O DIA TODO",
            animalClass: "1",
            maxLevel: "3 (Muito Fácil)"
        },
        "porco_selvagem": {
            mapImage: "mississippi_acres_porco_selvagem_hotspot",
            maxScore: 144.25,
            maxWeightEstimate: "161-205 KG",
            needZonesPotential: "03:00-06:00",
            animalClass: "5",
            maxLevel: "5 (Médio)"
        },
        "urso_negro": {
            mapImage: "mississippi_acres_urso_negro_hotspot",
            maxScore: 22.8,
            maxWeightEstimate: "227-290 KG",
            needZonesPotential: "04:00 - 08:00",
            animalClass: "7",
            maxLevel: "9 (Lendário)"
        },
        "raposa_cinzenta": {
            mapImage: "mississippi_acres_raposa_cinzenta_hotspot",
            maxScore: 6.43,
            maxWeightEstimate: "5-6 KG",
            needZonesPotential: "17:00 - 20:00",
            animalClass: "2",
            maxLevel: "9 (Lendário)"
        },
        "guaxinim_comum": {
            mapImage: "mississippi_acres_guaxinim_comum_hotspot",
            maxScore: 12,
            maxWeightEstimate: "10-13 KG",
            needZonesPotential: "00:00 - 03:00",
            animalClass: "2",
            maxLevel: "5 (Médio)"
        },
        "coelho_da_flórida": {
            mapImage: "mississippi_acres_coelho_da_florida_hotspot",
            maxScore: 1.97,
            maxWeightEstimate: "1-2 KG",
            needZonesPotential: "O DIA TODO",
            animalClass: "1",
            maxLevel: "3 (Muito Fácil)"
        },
        "jacaré_americano": {
            mapImage: "mississippi_acres_jacare_americano_hotspot",
            maxScore: 492,
            maxWeightEstimate: "416-530 KG",
            needZonesPotential: "08:00 - 12:00, 12:00 - 16:00, 16:00 - 20:00", // Zonas de Descanso
            animalClass: "7",
            maxLevel: "9 (Lendário)"
        }
    },
    "revontuli_coast": {
        "galinha_montês": {
            mapImage: "revontuli_coast_galinha_montes_hotspot",
            maxScore: 435,
            maxWeightEstimate: "0.41-0.45 KG",
            needZonesPotential: "O DIA TODO",
            animalClass: "1",
            maxLevel: "3 (Muito Fácil)"
        },
        "veado_de_cauda_branca": {
            mapImage: "revontuli_coast_veado_de_cauda_branca_hotspot",
            maxScore: 255.09,
            maxWeightEstimate: "75-100 KG",
            needZonesPotential: "08:00 - 12:00",
            animalClass: "4",
            maxLevel: "3 (Muito Fácil)"
        },
        "urso_pardo": {
            mapImage: "revontuli_coast_urso_pardo_hotspot",
            maxScore: 27.7,
            maxWeightEstimate: "389-452 KG",
            needZonesPotential: "04:00 - 08:00",
            animalClass: "7",
            maxLevel: "9 (Lendário)"
        },
        "alce": {
            mapImage: "revontuli_coast_alce_hotspot",
            maxScore: 274.99,
            maxWeightEstimate: "545-620 KG",
            needZonesPotential: "12:00 - 16:00",
            animalClass: "8",
            maxLevel: "5 (Médio)"
        },
        "ganso_bravo": {
            mapImage: "revontuli_coast_ganso_bravo_hotspot",
            maxScore: 3.85,
            maxWeightEstimate: "3-4 KG",
            needZonesPotential: "O DIA TODO",
            animalClass: "1",
            maxLevel: "5 (Médio)"
        },
        "ganso_campestre_da_tundra": {
            mapImage: "revontuli_coast_ganso_campestre_da_tundra_hotspot",
            maxScore: null,
            maxWeightEstimate: null,
            needZonesPotential: null,
            animalClass: null,
            maxLevel: null
        },
        "ganso_do_canadá": {
            mapImage: "revontuli_coast_ganso_do_canada_hotspot",
            maxScore: 8.59,
            maxWeightEstimate: "8-9 KG",
            needZonesPotential: "O DIA TODO",
            animalClass: "1",
            maxLevel: "5 (Médio)"
        },
        "lagópode_branco": {
            mapImage: "revontuli_coast_lagopode_branco_hotspot",
            maxScore: null,
            maxWeightEstimate: null,
            needZonesPotential: null,
            animalClass: null,
            maxLevel: null
        },
        "lagópode_escocês": {
            mapImage: "revontuli_coast_lagopode_escoces_hotspot",
            maxScore: null,
            maxWeightEstimate: null,
            needZonesPotential: null,
            animalClass: null,
            maxLevel: null
        },
        "pato_real": {
            mapImage: "revontuli_coast_pato_real_hotspot",
            maxScore: 19.61,
            maxWeightEstimate: "1-2 KG",
            needZonesPotential: "O DIA TODO",
            animalClass: "1",
            maxLevel: "3 (Muito Fácil)"
        },
        "piadeira": {
            mapImage: "revontuli_coast_piadeira_hotspot",
            maxScore: 905,
            maxWeightEstimate: "0 KG",
            needZonesPotential: "O DIA TODO",
            animalClass: "1",
            maxLevel: "3 (Muito Fácil)"
        },
        "tetraz_grande": {
            mapImage: "revontuli_coast_tetraz_grande_hotspot",
            maxScore: 4.64,
            maxWeightEstimate: "4-5 KG",
            needZonesPotential: "O DIA TODO",
            animalClass: "1",
            maxLevel: "3 (Muito Fácil)"
        },
        "cão_guaxinim": {
            mapImage: "revontuli_coast_cao_guaxinim_hotspot",
            maxScore: null,
            maxWeightEstimate: null,
            needZonesPotential: null,
            animalClass: null,
            maxLevel: null
        },
        "lince_euroasiática": {
            mapImage: "revontuli_coast_lince_euroasiatica_hotspot",
            maxScore: 27.68,
            maxWeightEstimate: "35-45 KG",
            needZonesPotential: "03:00-06:00",
            animalClass: "3",
            maxLevel: "9 (Lendário)"
        },
        "galo_lira": {
            mapImage: "revontuli_coast_galo_lira_hotspot",
            maxScore: null,
            maxWeightEstimate: null,
            needZonesPotential: null,
            animalClass: null,
            maxLevel: null
        },
        "lebre_da_eurásia": {
            mapImage: "revontuli_coast_lebre_da_eurasia_hotspot",
            maxScore: null,
            maxWeightEstimate: null,
            needZonesPotential: null,
            animalClass: null,
            maxLevel: null
        },
        "marrequinha_comum": {
            mapImage: "revontuli_coast_marrequinha_comum_hotspot",
            maxScore: 354,
            maxWeightEstimate: "0 KG",
            needZonesPotential: "O DIA TODO",
            animalClass: "1",
            maxLevel: "3 (Muito Fácil)"
        },
        "pato_olho_de_ouro": {
            mapImage: "revontuli_coast_pato_olho_de_ouro_hotspot",
            maxScore: 1230,
            maxWeightEstimate: "0-1 KG",
            needZonesPotential: "O DIA TODO",
            animalClass: "1",
            maxLevel: "3 (Muito Fácil)"
        },
        "zarro_negrinha": {
            mapImage: "revontuli_coast_zarro_negrinha_hotspot",
            maxScore: 963,
            maxWeightEstimate: "0-1 KG",
            needZonesPotential: "O DIA TODO",
            animalClass: "1",
            maxLevel: "3 (Muito Fácil)"
        },
        "veado_de_cauda_preta": {
            mapImage: "revontuli_coast_veado_de_cauda_preta_hotspot",
            maxScore: 177.58,
            maxWeightEstimate: "81-95 KG",
            needZonesPotential: "16:00 - 20:00",
            animalClass: "4",
            maxLevel: "5 (Médio)"
        }
    },
    "new_england_mountains": {
        "alce": {
            mapImage: "new_england_mountains_alce_hotspot",
            maxScore: 274.99,
            maxWeightEstimate: "545-620 KG",
            needZonesPotential: "12:00 - 16:00",
            animalClass: "8",
            maxLevel: "5 (Médio)"
        },
        "codorniz_da_virgínia": {
            mapImage: "new_england_mountains_codorniz_da_virgínia_hotspot",
            maxScore: 238,
            maxWeightEstimate: "0 kg",
            needZonesPotential: "O DIA TODO",
            animalClass: "1",
            maxLevel: "3 (Muito Fácil)"
        },
        "coelho_da_flórida": {
            mapImage: "new_england_mountains_coelho_da_florida_hotspot",
            maxScore: 1.97,
            maxWeightEstimate: "1-2 KG",
            needZonesPotential: "O DIA TODO",
            animalClass: "1",
            maxLevel: "3 (Muito Fácil)"
        },
        "faisão_de_pescoço_anelado": {
            mapImage: "new_england_mountains_faisao_de_pescoco_anelado_hotspot",
            maxScore: 20.29,
            maxWeightEstimate: null, // Campo vazio
            needZonesPotential: "O DIA TODO",
            animalClass: "1",
            maxLevel: "3 (Muito Fácil)"
        },
        "marrequinha_americana": {
            mapImage: "new_england_mountains_marrequinha_americana_hotspot",
            maxScore: 480,
            maxWeightEstimate: "0 KG",
            needZonesPotential: "O DIA TODO",
            animalClass: "1",
            maxLevel: "3 (Muito Fácil)"
        },
        "pato_olho_de_ouro": {
            mapImage: "new_england_mountains_pato_olho_de_ouro_hotspot",
            maxScore: 1230,
            maxWeightEstimate: "0-1 KG",
            needZonesPotential: "O DIA TODO",
            animalClass: "1",
            maxLevel: "3 (Muito Fácil)"
        },
        "pato_real": {
            mapImage: "new_england_mountains_pato_real_hotspot",
            maxScore: 19.61,
            maxWeightEstimate: "1-2 KG",
            needZonesPotential: "O DIA TODO",
            animalClass: "1",
            maxLevel: "3 (Muito Fácil)"
        },
        "peru_selvagem": {
            mapImage: "new_england_mountains_peru_selvagem_hotspot",
            maxScore: 4.6,
            maxWeightEstimate: "9-11 KG",
            needZonesPotential: "O DIA TODO",
            animalClass: "1",
            maxLevel: "3 (Muito Fácil)"
        },
        "guaxinim_comum": {
            mapImage: "new_england_mountains_guaxinim_comum_hotspot",
            maxScore: 12,
            maxWeightEstimate: "10-13 KG",
            needZonesPotential: "03:00 - 06:00",
            animalClass: "2",
            maxLevel: "5 (Médio)"
        },
        "lince_pardo_do_mexico": {
            mapImage: "new_england_mountains_lince_pardo_do_mexico_hotspot",
            maxScore: 27.68,
            maxWeightEstimate: "35-45 KG",
            needZonesPotential: "03:00 - 06:00",
            animalClass: "2",
            maxLevel: "9 (Lendário)"
        },
        "raposa_cinzenta": {
            mapImage: "new_england_mountains_raposa_cinzenta_hotspot",
            maxScore: 6.43,
            maxWeightEstimate: "5-6 KG",
            needZonesPotential: "17:00 - 20:00",
            animalClass: "2",
            maxLevel: "9 (Lendário)"
        },
        "veado_de_cauda_branca": {
            mapImage: "new_england_mountains_veado_de_cauda_branca_hotspot",
            maxScore: 255.09,
            maxWeightEstimate: "75-100 KG",
            needZonesPotential: "08:00 - 12:00",
            animalClass: "4",
            maxLevel: "3 (Muito Fácil)"
        },
        "urso_negro": {
            mapImage: "new_england_mountains_urso_negro_hotspot",
            maxScore: 22.8,
            maxWeightEstimate: "227-290 KG",
            needZonesPotential: "04:00 - 08:00",
            animalClass: "7",
            maxLevel: "9 (Lendário)"
        },
        "coiote": {
            mapImage: "new_england_mountains_coiote_hotspot",
            maxScore: 56.87,
            maxWeightEstimate: "24-27 KG",
            needZonesPotential: "00:00 - 04:00",
            animalClass: "2",
            maxLevel: "9 (Lendário)"
        },
        "raposa_vermelha": {
            mapImage: "new_england_mountains_raposa_vermelha_hotspot",
            maxScore: 14.05,
            maxWeightEstimate: "12-15 KG",
            needZonesPotential: "17:00-20:00",
            animalClass: "2",
            maxLevel: "9 (Lendário)"
        },
        "gamo": {
            mapImage: "new_england_mountains_gamo_hotspot",
            maxScore: 249.99,
            maxWeightEstimate: "82-100 KG",
            needZonesPotential: "10:00-13:00",
            animalClass: "4",
            maxLevel: "5 (Médio)"
        }
    },
    "emerald_coast": {
        "canguru_cinza_oriental": {
            mapImage: "emerald_coast_canguru_cinza_oriental_hotspot",
            maxScore: 492,
            maxWeightEstimate: "53-66 KG",
            needZonesPotential: "00:00-03:00",
            animalClass: "4",
            maxLevel: "9 (Lendário)"
        },
        "codorna_de_restolho": {
            mapImage: "emerald_coast_codorna_de_restolho_hotspot",
            maxScore: 238,
            maxWeightEstimate: "0.12-0.13 kg",
            needZonesPotential: "O DIA TODO",
            animalClass: "1",
            maxLevel: "3 (Muito Fácil)"
        },
        "raposa_vermelha": {
            mapImage: "emerald_coast_raposa_vermelha_hotspot",
            maxScore: 14.05,
            maxWeightEstimate: "12-15 KG",
            needZonesPotential: "17:00-20:00",
            animalClass: "2",
            maxLevel: "9 (Lendário)"
        },
        "cabra_selvagem": {
            mapImage: "emerald_coast_cabra_selvagem_hotspot",
            maxScore: 208.71,
            maxWeightEstimate: "43-50 KG",
            needZonesPotential: "15:00-18:00",
            animalClass: "3",
            maxLevel: "5 (Médio)"
        },
        "cervo_porco_indiano": {
            mapImage: "emerald_coast_cervo_porco_indiano_hotspot",
            maxScore: 108.68,
            maxWeightEstimate: "43-50 KG",
            needZonesPotential: "13:00-17:00",
            animalClass: "3",
            maxLevel: "5 (Médio)"
        },
        "porco_selvagem": {
            mapImage: "emerald_coast_porco_selvagem_hotspot",
            maxScore: 144.25,
            maxWeightEstimate: "161-205 KG",
            needZonesPotential: "03:00-06:00",
            animalClass: "5",
            maxLevel: "5 (Médio)"
        },
        "veado_vermelho": {
            mapImage: "emerald_coast_veado_vermelho_hotspot",
            maxScore: 251.07,
            maxWeightEstimate: "210-240 KG",
            needZonesPotential: "06:00-10:00",
            animalClass: "6",
            maxLevel: "9 (Lendário)"
        },
        "sambar": {
            mapImage: "emerald_coast_sambar_hotspot",
            maxScore: 166.43,
            maxWeightEstimate: "270-300 KG",
            needZonesPotential: "17:00-20:00",
            animalClass: "6",
            maxLevel: "5 (Médio)"
        },
        "cervo_de_timor": {
            mapImage: "emerald_coast_cervo_de_timor_hotspot",
            maxScore: 148.78,
            maxWeightEstimate: "145-172 KG",
            needZonesPotential: "20:00-00:00",
            animalClass: "6",
            maxLevel: "5 (Médio)"
        },
        "gamo": {
            mapImage: "emerald_coast_gamo_hotspot",
            maxScore: 249.99,
            maxWeightEstimate: "82-100 KG",
            needZonesPotential: "10:00-13:00",
            animalClass: "4",
            maxLevel: "5 (Médio)"
        },
        "bantengue": {
            mapImage: "emerald_coast_bantengue_hotspot",
            maxScore: 137,
            maxWeightEstimate: "747-800 KG",
            needZonesPotential: "17:00-20:00",
            animalClass: "9",
            maxLevel: "5 (Médio)"
        },
        "crocodilo_de_água_salgada": {
            mapImage: "emerald_coast_crocodilo_de_agua_salgada_hotspot",
            maxScore: 1015,
            maxWeightEstimate: "856-1100 KG",
            needZonesPotential: "O DIA TODO",
            animalClass: "7",
            maxLevel: "9 (Lendário)"
        },
        "ganso_pega": {
            mapImage: "emerald_coast_ganso_pega_hotspot",
            maxScore: 3.85,
            maxWeightEstimate: "2-3 KG",
            needZonesPotential: "O DIA TODO",
            animalClass: "1",
            maxLevel: "5 (Médio)"
        },
        "chital": {
            mapImage: "emerald_coast_chital_hotspot",
            maxScore: 217.29,
            maxWeightEstimate: "67-75 KG",
            needZonesPotential: "03:00-06:00",
            animalClass: "3",
            maxLevel: "5 (Médio)"
        }
    },
    "sundarpatan": {
        "antílope_negro": {
            mapImage: "sundarpatan_antilope_negro_hotspot",
            maxScore: 132.26,
            maxWeightEstimate: "44-51 KG",
            needZonesPotential: "18:00-21:00",
            animalClass: "3",
            maxLevel: "5 (Médio)"
        },
        "ganso_bravo": {
            mapImage: "sundarpatan_ganso_bravo_hotspot",
            maxScore: 3.85,
            maxWeightEstimate: "3-4 KG",
            needZonesPotential: "O DIA TODO",
            animalClass: "1",
            maxLevel: "5 (Médio)"
        },
        "lebre_peluda": {
            mapImage: "sundarpatan_lebre_peluda_hotspot",
            maxScore: 3.28,
            maxWeightEstimate: "2-3 KG",
            needZonesPotential: "O DIA TODO",
            animalClass: "1",
            maxLevel: "3 (Muito Fácil)"
        },
        "muntjac_vermelho_do_norte": {
            mapImage: "sundarpatan_muntjac_vermelho_do_norte_hotspot",
            maxScore: 35.24,
            maxWeightEstimate: "23-28 KG",
            needZonesPotential: "15:00-18:00",
            animalClass: "2",
            maxLevel: "5 (Médio)"
        },
        "raposa_tibetana": {
            mapImage: "sundarpatan_raposa_tibetana_hotspot",
            maxScore: 6.37,
            maxWeightEstimate: "5-6 kg",
            needZonesPotential: "17:00-20:00",
            animalClass: "2",
            maxLevel: "9 (Lendário)"
        },
        "tahr": {
            mapImage: "sundarpatan_tahr_hotspot",
            maxScore: 101.87,
            maxWeightEstimate: "117-140 KG",
            needZonesPotential: "04:00-07:00, 07:00-11:00, 14:00-17:00, 17:00-20:00", // Zonas de Comida
            animalClass: "4",
            maxLevel: "5 (Médio)"
        },
        "carneiro_azul": {
            mapImage: "sundarpatan_carneiro_azul_hotspot",
            maxScore: 154.08,
            maxWeightEstimate: "65-75 KG",
            needZonesPotential: "14:00-17:00",
            animalClass: "4",
            maxLevel: "5 (Médio)"
        },
        "cervo_do_pântano": {
            mapImage: "sundarpatan_cervo_do_pantano_hotspot",
            maxScore: 226.05,
            maxWeightEstimate: "242-280 KG",
            needZonesPotential: "12:00-15:00",
            animalClass: "6",
            maxLevel: "5 (Médio)"
        },
        "nilgó": {
            mapImage: "sundarpatan_nilgo_hotspot",
            maxScore: 94.89,
            maxWeightEstimate: "256-308 KG",
            needZonesPotential: "08:00-12:00",
            animalClass: "6",
            maxLevel: "5 (Médio)"
        },
        "búfalo_dágua": {
            mapImage: "sundarpatan_bufalo_dagua_hotspot",
            maxScore: 167.54,
            maxWeightEstimate: "1067-1250 KG",
            needZonesPotential: "12:00-15:00",
            animalClass: "9",
            maxLevel: "9 (Lendário)"
        },
        "leopardo_das_neves": {
            mapImage: "sundarpatan_leopardo_das_neves_hotspot",
            maxScore: 29,
            maxWeightEstimate: "63-75 KG",
            needZonesPotential: "O DIA TODO",
            animalClass: "4",
            maxLevel: "9 (Lendário)"
        },
        "iaque_selvagem": {
            mapImage: "sundarpatan_iaque_selvagem_hotspot",
            maxScore: 273.23,
            maxWeightEstimate: "1025-1200 KG",
            needZonesPotential: "08:00-12:00",
            animalClass: "9",
            maxLevel: "9 (Lendário)"
        },
        "tigre_de_bengala": {
            mapImage: "sundarpatan_tigre_de_bengala_hotspot",
            maxScore: 57,
            maxWeightEstimate: "272-324",
            needZonesPotential: "04:00-07:00",
            animalClass: "9",
            maxLevel: "9 (Lendário)"
        },
        "javali": {
            mapImage: "sundarpatan_javali_hotspot",
            maxScore: 144.25,
            maxWeightEstimate: "186-240 KG",
            needZonesPotential: "00:00-03:00",
            animalClass: "5",
            maxLevel: "5 (Médio)"
        }
    },
    "salzwiesen": {
        "coelho_europeu": {
            mapImage: "salzwiesen_coelho_europeu_hotspot",
            maxScore: 2.42,
            maxWeightEstimate: "2 KG",
            needZonesPotential: "O DIA TODO", // Tocas Potencial
            animalClass: "1",
            maxLevel: "3 (Muito Fácil)"
        },
        "frisada": {
            mapImage: "salzwiesen_frisada_hotspot",
            maxScore: 1050,
            maxWeightEstimate: "0-1 KG",
            needZonesPotential: "O DIA TODO",
            animalClass: "1",
            maxLevel: "3 (Muito Fácil)"
        },
        "galo_lira": {
            mapImage: "salzwiesen_galo_lira_hotspot",
            maxScore: 120,
            maxWeightEstimate: "0-1 kg",
            needZonesPotential: "O DIA TODO",
            animalClass: "1",
            maxLevel: "3 (Muito Fácil)"
        },
        "guaxinim_comum": {
            mapImage: "salzwiesen_guaxinim_comum_hotspot",
            maxScore: 12,
            maxWeightEstimate: "10-13 KG",
            needZonesPotential: "00:00 - 03:00",
            animalClass: "2",
            maxLevel: "5 (Médio)"
        },
        "raposa_vermelha": {
            mapImage: "salzwiesen_raposa_vermelha_hotspot",
            maxScore: 14.05,
            maxWeightEstimate: "12-15 KG",
            needZonesPotential: "17:00-20:00",
            animalClass: "2",
            maxLevel: "9 (Lendário)"
        },
        "ganso_campestre_da_tundra": {
            mapImage: "salzwiesen_ganso_campestre_da_tundra_hotspot",
            maxScore: 3.16,
            maxWeightEstimate: "2-3 kg",
            needZonesPotential: "O DIA TODO",
            animalClass: "1",
            maxLevel: "5 (Médio)"
        },
        "faisão_de_pescoço_anelado": {
            mapImage: "salzwiesen_faisao_de_pescoco_anelado_hotspot",
            maxScore: 20.29,
            maxWeightEstimate: null, // Campo vazio
            needZonesPotential: "O DIA TODO",
            animalClass: "1",
            maxLevel: "3 (Muito Fácil)"
        },
        "cão_guaxinim": {
            mapImage: "salzwiesen_cao_guaxinim_hotspot",
            maxScore: 9.29,
            maxWeightEstimate: "8-10 kg",
            needZonesPotential: "10:00-13:00",
            animalClass: "2",
            maxLevel: "9 (Lendário)"
        },
        "ganso_bravo": {
            mapImage: "salzwiesen_ganso_bravo_hotspot",
            maxScore: 3.85,
            maxWeightEstimate: "3-4 KG",
            needZonesPotential: "O DIA TODO",
            animalClass: "1",
            maxLevel: "5 (Médio)"
        },
        "marrequinha_comum": {
            mapImage: "salzwiesen_marrequinha_comum_hotspot",
            maxScore: 354,
            maxWeightEstimate: "0 KG",
            needZonesPotential: "O DIA TODO",
            animalClass: "1",
            maxLevel: "3 (Muito Fácil)"
        },
        "pato_olho_de_ouro": {
            mapImage: "salzwiesen_pato_olho_de_ouro_hotspot",
            maxScore: 1230,
            maxWeightEstimate: "0-1 KG",
            needZonesPotential: "O DIA TODO",
            animalClass: "1",
            maxLevel: "3 (Muito Fácil)"
        },
        "pato_real": {
            mapImage: "salzwiesen_pato_real_hotspot",
            maxScore: 19.61,
            maxWeightEstimate: "1-2 KG",
            needZonesPotential: "O DIA TODO",
            animalClass: "1",
            maxLevel: "3 (Muito Fácil)"
        },
        "piadeira": {
            mapImage: "salzwiesen_piadeira_hotspot",
            maxScore: 905,
            maxWeightEstimate: "0 KG",
            needZonesPotential: "O DIA TODO",
            animalClass: "1",
            maxLevel: "3 (Muito Fácil)"
        },
        "zarro_negrinha": {
            mapImage: "salzwiesen_zarro_negrinha_hotspot",
            maxScore: 963,
            maxWeightEstimate: "0-1 KG",
            needZonesPotential: "O DIA TODO",
            animalClass: "1",
            maxLevel: "3 (Muito Fácil)"
        },
        "zarro_castanho": {
            mapImage: "salzwiesen_zarro_castanho_hotspot",
            maxScore: 1050,
            maxWeightEstimate: "0-1 KG",
            needZonesPotential: "O DIA TODO",
            animalClass: "1",
            maxLevel: "3 (Muito Fácil)"
        },
        "veado_de_cauda_preta": {
            mapImage: "salzwiesen_veado_de_cauda_preta_hotspot",
            maxScore: 177.58,
            maxWeightEstimate: "81-95 KG",
            needZonesPotential: "16:00 - 20:00",
            animalClass: "4",
            maxLevel: "5 (Médio)"
        }
    },
    "askiy_ridge": {
        "alce": {
            mapImage: "askiy_ridge_alce_hotspot",
            maxScore: 274.99,
            maxWeightEstimate: "545-620 KG",
            needZonesPotential: "12:00 - 16:00",
            animalClass: "8",
            maxLevel: "5 (Médio)"
        },
        "caribu_da_floresta_boreal": {
            mapImage: "askiy_ridge_caribu_da_floresta_boreal_hotspot",
            maxScore: 430.23,
            maxWeightEstimate: "161-190 KG",
            needZonesPotential: "20:00 - 00:00",
            animalClass: "6",
            maxLevel: "5 (Médio)"
        },
        "urso_negro": {
            mapImage: "askiy_ridge_urso_negro_hotspot",
            maxScore: 22.8,
            maxWeightEstimate: "227-290 KG",
            needZonesPotential: "04:00 - 08:00",
            animalClass: "7",
            maxLevel: "9 (Lendário)"
        },
        "veado_mula": {
            mapImage: "askiy_ridge_veado_mula_hotspot",
            maxScore: 312.17,
            maxWeightEstimate: "175-210 KG",
            needZonesPotential: "15:00-18:00",
            animalClass: "5",
            maxLevel: "5 (Médio)"
        },
        "bisão_da_floresta": {
            mapImage: "askiy_ridge_bisao_da_floresta_hotspot",
            maxScore: 158,
            maxWeightEstimate: "1112-1350 KG",
            needZonesPotential: "08:00-12:00",
            animalClass: "9",
            maxLevel: "5 (Médio)"
        },
        "cabra_da_montanha": {
            mapImage: "askiy_ridge_cabra_da_montanha_hotspot",
            maxScore: 107.67,
            maxWeightEstimate: "120-145 KG",
            needZonesPotential: "O DIA TODO",
            animalClass: "4",
            maxLevel: "5 (Médio)"
        },
        "antilocapra": {
            mapImage: "askiy_ridge_antilocapra_hotspot",
            maxScore: 108,
            maxWeightEstimate: "57-65 KG",
            needZonesPotential: "18:00-21:00",
            animalClass: "3",
            maxLevel: "5 (Médio)"
        },
        "tetraz_azul": {
            mapImage: "askiy_ridge_tetraz_azul_hotspot",
            maxScore: 151,
            maxWeightEstimate: "1.38-1.60 kg",
            needZonesPotential: "O DIA TODO",
            animalClass: "1",
            maxLevel: "3 (Muito Fácil)"
        },
        "pato_real": {
            mapImage: "askiy_ridge_pato_real_hotspot",
            maxScore: 19.61,
            maxWeightEstimate: "1-2 KG",
            needZonesPotential: "O DIA TODO",
            animalClass: "1",
            maxLevel: "3 (Muito Fácil)"
        },
        "pato_carolino": {
            mapImage: "askiy_ridge_pato_carolino_hotspot",
            maxScore: 670,
            maxWeightEstimate: "0 kg",
            needZonesPotential: "O DIA TODO",
            animalClass: "1",
            maxLevel: "3 (Muito Fácil)"
        },
        "marreca_arrebio": {
            mapImage: "askiy_ridge_marreca_arrebio_hotspot",
            maxScore: 1040,
            maxWeightEstimate: "0-1 kg",
            needZonesPotential: "O DIA TODO",
            animalClass: "1",
            maxLevel: "3 (Muito Fácil)"
        },
        "ganso_do_canadá": {
            mapImage: "askiy_ridge_ganso_do_canada_hotspot",
            maxScore: 8.59,
            maxWeightEstimate: "8-9 KG",
            needZonesPotential: "O DIA TODO",
            animalClass: "1",
            maxLevel: "5 (Médio)"
        },
        "ganso_das_neves": {
            mapImage: "askiy_ridge_ganso_das_neves_hotspot",
            maxScore: 3.85,
            maxWeightEstimate: "3-4 kg",
            needZonesPotential: "O DIA TODO",
            animalClass: "1",
            maxLevel: "5 (Médio)"
        },
        "lobo_cinzento": {
            mapImage: "askiy_ridge_lobo_cinzento_hotspot",
            maxScore: 39,
            maxWeightEstimate: "67-80 KG",
            needZonesPotential: "17:00-20:00",
            animalClass: "5",
            maxLevel: "9 (Lendário)"
        },
        "cervo_canadense": {
            mapImage: "askiy_ridge_cervo_canadense_hotspot",
            maxScore: 457.56,
            maxWeightEstimate: "395-450 kg",
            needZonesPotential: "04:00-08:00",
            animalClass: "7",
            maxLevel: "5 (Médio)"
        },
        "veado_de_cauda_branca": {
            mapImage: "askiy_ridge_veado_de_cauda_branca_hotspot",
            maxScore: 255.09,
            maxWeightEstimate: "75-100 KG",
            needZonesPotential: "08:00 - 12:00",
            animalClass: "4",
            maxLevel: "3 (Muito Fácil)"
        },
        "faisão_de_pescoço_anelado": {
            mapImage: "askiy_ridge_faisao_de_pescoco_anelado_hotspot",
            maxScore: 20.29,
            maxWeightEstimate: null, // Campo vazio
            needZonesPotential: "O DIA TODO",
            animalClass: "1",
            maxLevel: "3 (Muito Fácil)"
        },
        "carneiro_selvagem": {
            mapImage: "askiy_ridge_carneiro_selvagem_hotspot",
            maxScore: 196.93,
            maxWeightEstimate: "132-160 KG",
            needZonesPotential: "12:00-16:00",
            animalClass: "5",
            maxLevel: "5 (Médio)"
        },
        "castor_norte_americano": {
            mapImage: "askiy_ridge_castor_norte_americano_hotspot",
            maxScore: 30.40,
            maxWeightEstimate: "28-32 kg",
            needZonesPotential: "04:00-08:00, 08:00-12:00, 16:00-20:00", // Zonas de Coleta
            animalClass: "2",
            maxLevel: "5 (Médio)"
        }
    }
};


// --- FUNÇÕES E LÓGICA PRINCIPAL ---
function slugify(texto) { return texto.toLowerCase().replace(/[-\s]+/g, '_').replace(/'/g, ''); }

// Define as categorias e seus ícones
const categorias = {
    pelagens: { title: 'Pelagens Raras', items: items, icon: 'fas fa-paw' },
    diamantes: { title: 'Diamantes', items: items, icon: 'fas fa-gem' },
    greats: { title: 'Great Ones', items: ["Alce", "Urso Negro", "Veado-Mula", "Veado Vermelho", "Veado-de-cauda-branca", "Raposa", "Faisão", "Gamo", "Tahr"], icon: 'fas fa-crown' },
    // A lista de Super Raros agora inclui todos os animais, e a lógica de exibição detalhada filtra por sexos que podem gerar diamante.
    super_raros: {
        title: 'Super Raros',
        items: items, // TODOS os animais aparecem na lista principal
        icon: 'fas fa-star'
    },
    montagens: { title: 'Montagens Múltiplas', icon: 'fas fa-trophy' },
    grind: { title: 'Contador de grind', icon: 'fas fa-crosshairs' },
    reservas: { title: 'Reservas de Caça', icon: 'fas fa-map-marked-alt' },
    progresso: { title: 'Painel de Progresso', icon: 'fas fa-chart-line' }
};

let appContainer;

// Função para verificar e definir a conclusão de um Great One
function checkAndSetGreatOneCompletion(slug, currentData) {
    const requiredFurs = greatsFursData[slug];
    if (!requiredFurs || !currentData) return;
    // Um Great One é considerado completo se todas as suas pelagens de Great One foram coletadas
    currentData.completo = requiredFurs.every(furName => currentData.furs?.[furName]?.trophies?.length > 0);
}

// Renderiza o hub de navegação principal
function renderNavigationHub() {
    appContainer.innerHTML = '';
    const hub = document.createElement('div');
    hub.className = 'navigation-hub';

    const title = document.createElement('h1');
    title.className = 'hub-title';
    title.textContent = 'Registro do Caçador'; // Alterado aqui
    hub.appendChild(title);

    Object.keys(categorias).forEach(key => {
        const cat = categorias[key];
        const card = document.createElement('div');
        card.className = 'nav-card';
        card.innerHTML = `<i class="${cat.icon || 'fas fa-question-circle'}"></i><span>${cat.title}</span>`;
        card.dataset.target = key;
        card.addEventListener('click', () => renderMainView(key));
        hub.appendChild(card);
    });

    appContainer.appendChild(hub);
    setupLogoutButton(currentUser);
}

// Renderiza a visualização principal de uma categoria
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
    backButton.onclick = renderNavigationHub;

    header.appendChild(title);
    header.appendChild(backButton);
    mainContent.appendChild(header);

    const contentContainer = document.createElement('div');
    contentContainer.className = `content-container ${tabKey}-view`;
    mainContent.appendChild(contentContainer);
    appContainer.appendChild(mainContent);

    setupLogoutButton(currentUser);

    if (tabKey === 'progresso') {
        renderProgressView(contentContainer);
    } else if (tabKey === 'reservas') {
        renderReservesList(contentContainer);
    } else if (tabKey === 'montagens') {
        renderMultiMountsView(contentContainer);
    } else if (tabKey === 'grind') {
        renderGrindHubView(contentContainer);
    } else {
        const filterInput = document.createElement('input');
        filterInput.type = 'text';
        filterInput.className = 'filter-input';
        filterInput.placeholder = 'Buscar animal...';
        contentContainer.appendChild(filterInput);

        const albumGrid = document.createElement('div');
        albumGrid.className = 'album-grid';
        contentContainer.appendChild(albumGrid);

        // A lista de itens a ser renderizada é a definida na categoria
        const itemsToRender = currentTab.items;

        (itemsToRender || []).sort((a, b) => a.localeCompare(b)).forEach(name => {
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

// Cria um cartão de animal para as visualizações de categoria
function createAnimalCard(name, tabKey) {
    const card = document.createElement('div');
    card.className = 'animal-card';
    const slug = slugify(name);
    card.dataset.slug = slug;
    card.innerHTML = `<img src="animais/${slug}.png" alt="${name}" onerror="this.onerror=null;this.src='animais/placeholder.png';"><div class="info">${name}</div>`;
    card.addEventListener('click', () => showDetailView(name, tabKey));
    updateCardAppearance(card, slug, tabKey); // Atualiza a aparência do cartão com base no progresso
    return card;
}

// Mostra a visualização de detalhes de um animal
function showDetailView(name, tabKey, originReserveKey = null) {
    if (originReserveKey) {
        renderAnimalDossier(name, originReserveKey);
    } else {
        renderSimpleDetailView(name, tabKey);
    }
}

// Renderiza a visualização de detalhes simples de um animal
function renderSimpleDetailView(name, tabKey) {
    const mainContent = document.querySelector('.main-content');
    const slug = slugify(name);
    const contentContainer = mainContent.querySelector('.content-container');
    contentContainer.className = `content-container detail-view ${tabKey}-detail-view`;
    contentContainer.innerHTML = '';
    mainContent.querySelector('.page-header h2').textContent = name;
    const backButton = mainContent.querySelector('.page-header .back-button');
    backButton.innerHTML = `&larr; Voltar para ${categorias[tabKey].title}`;
    backButton.onclick = () => renderMainView(tabKey);

    const detailContent = contentContainer;
    if (tabKey === 'greats') {
        renderGreatsDetailView(detailContent, name, slug);
    } else if (tabKey === 'pelagens') {
        renderRareFursDetailView(detailContent, name, slug);
    } else if (tabKey === 'super_raros') {
        renderSuperRareDetailView(detailContent, name, slug);
    } else if (tabKey === 'diamantes') {
        renderDiamondsDetailView(detailContent, name, slug);
    }
}

// Renderiza o dossiê de um animal (usado nas reservas)
function renderAnimalDossier(animalName, originReserveKey) {
    const mainContent = document.querySelector('.main-content');
    const slug = slugify(animalName);
    const contentContainer = mainContent.querySelector('.content-container');
    contentContainer.className = 'content-container dossier-view';
    contentContainer.innerHTML = '';
    mainContent.querySelector('.page-header h2').textContent = `Dossiê: ${animalName}`;
    const backButton = mainContent.querySelector('.page-header .back-button');
    backButton.innerHTML = `&larr; Voltar para ${reservesData[originReserveKey].name}`;
    backButton.onclick = () => showReserveDetailView(originReserveKey);

    const dossierTabs = document.createElement('div');
    dossierTabs.className = 'dossier-tabs';
    const dossierContent = document.createElement('div');
    dossierContent.className = 'dossier-content';

    const tabs = {
        pelagens: { title: 'Pelagens Raras', renderFunc: renderRareFursDetailView },
        diamantes: { title: 'Diamantes', renderFunc: renderDiamondsDetailView },
        super_raros: { title: 'Super Raros', renderFunc: renderSuperRareDetailView },
        // Nova aba para Hotspots
        hotspots: { title: '<i class="fas fa-map-marked-alt"></i> Informações de Caça', renderFunc: renderHotspotDetailsView }
    };
    // Adiciona a aba Great Ones se o animal puder ser um Great One
    if (greatsFursData[slug]) {
        tabs.greats = { title: '<i class="fas fa-crown"></i> Grandes', renderFunc: renderGreatsDetailView };
    }

    Object.entries(tabs).forEach(([key, value]) => {
        const tab = document.createElement('div');
        tab.className = `dossier-tab ${key}-tab`; // Adiciona classe específica para estilização
        tab.innerHTML = value.title;
        tab.dataset.key = key;
        dossierTabs.appendChild(tab);
    });

    contentContainer.appendChild(dossierTabs);
    contentContainer.appendChild(dossierContent);

    dossierTabs.addEventListener('click', e => {
        const tab = e.target.closest('.dossier-tab');
        if(!tab) return;
        dossierTabs.querySelectorAll('.dossier-tab').forEach(t => t.classList.remove('active'));
        tab.classList.add('active');
        const tabKey = tab.dataset.key;
        // Passa o originReserveKey para a função de renderização correspondente
        tabs[tabKey].renderFunc(dossierContent, animalName, slug, originReserveKey);
    });
    // Ativa a primeira aba por padrão
    dossierTabs.querySelector('.dossier-tab').click();
}

// Renderizar para lista de reservas
function renderReservesList(container) {
    container.innerHTML = '';
    const grid = document.createElement('div');
    grid.className = 'reserves-grid';
    container.appendChild(grid);

    const sortedReserves = Object.entries(reservesData).sort(([, a], [, b]) => a.name.localeCompare(b.name));

    for (const [reserveKey, reserve] of sortedReserves) {
        const progress = calcularReserveProgress(reserveKey);
        const card = document.createElement('div');
        card.className = 'reserve-card';
        card.innerHTML = `
            <div class="reserve-image-container">
                <img class="reserve-card-image" src="${reserve.image}" onerror="this.style.display='none'">
            </div>
            <div class="reserve-card-info-panel">
                <img src="${reserve.image.replace('.png', '_logo.png')}" class="reserve-card-logo" alt="${reserve.name}" onerror="this.style.display='none'">
                <div class="reserve-card-stats">
                    <span><i class="fas fa-paw"></i> ${progress.collectedRares}</span>
                    <span><i class="fas fa-gem"></i> ${progress.collectedDiamonds}</span>
                    <span><i class="fas fa-crown"></i> ${progress.collectedGreatOnes}</span>
                </div>
            </div>
        `;
        card.addEventListener('click', () => showReserveDetailView(reserveKey));
        grid.appendChild(card);
    }
}

// Mostra a visualização de detalhes de uma reserva
function showReserveDetailView(reserveKey) {
    const mainContent = document.querySelector('.main-content');
    const contentContainer = mainContent.querySelector('.content-container');
    contentContainer.className = 'content-container reserve-detail-view';
    contentContainer.innerHTML = '';

    const reserve = reservesData[reserveKey];
    if (!reserve) return;

    mainContent.querySelector('.page-header h2').textContent = reserve.name;
    const backButton = mainContent.querySelector('.page-header .back-button');
    backButton.innerHTML = `&larr; Voltar para Reservas`;
    backButton.onclick = () => renderMainView('reservas');

    const checklistContainer = document.createElement('div');
    checklistContainer.className = 'animal-checklist';

    // Filtra e mapeia os slugs de animais para seus nomes de exibição
    const animalNames = reserve.animals.map(slug => items.find(item => slugify(item) === slug)).filter(name => name);

    animalNames.sort((a,b) => a.localeCompare(b)).forEach(animalName => {
        const slug = slugify(animalName);

        // Calcula o progresso de pelagens raras
        const totalRares = (rareFursData[slug]?.macho?.length || 0) + (rareFursData[slug]?.femea?.length || 0);
        const collectedRares = Object.values(savedData.pelagens?.[slug] || {}).filter(v => v === true).length;
        const raresPercentage = totalRares > 0 ? (collectedRares / totalRares) * 100 : 0;

        // Calcula o progresso de diamantes
        const totalDiamonds = (diamondFursData[slug]?.macho?.length || 0) + (diamondFursData[slug]?.femea?.length || 0);
        const collectedDiamonds = new Set((savedData.diamantes?.[slug] || []).map(t => t.type)).size;
        const diamondsPercentage = totalDiamonds > 0 ? (collectedDiamonds / totalDiamonds) * 100 : 0;

        // Verifica se o animal pode ser um Great One
        const isGreatOne = greatsFursData.hasOwnProperty(slug);

        const row = document.createElement('div');
        row.className = 'animal-checklist-row';
        row.innerHTML = `
            <img class="animal-icon" src="animais/${slug}.png" onerror="this.src='animais/placeholder.png'">
            <div class="animal-name">${animalName}</div>
            <div class="mini-progress-bars">
                <div class="mini-progress" title="Pelagens Raras: ${collectedRares}/${totalRares}">
                    <i class="fas fa-paw"></i>
                    <div class="mini-progress-bar-container">
                        <div class="mini-progress-bar" style="width: ${raresPercentage}%"></div>
                    </div>
                </div>
                <div class="mini-progress" title="Diamantes: ${collectedDiamonds}/${totalDiamonds}">
                    <i class="fas fa-gem"></i>
                    <div class="mini-progress-bar-container">
                        <div class="mini-progress-bar" style="width: ${diamondsPercentage}%"></div>
                    </div>
                </div>
            </div>
            <i class="fas fa-crown great-one-indicator ${isGreatOne ? 'possible' : ''}" title="Pode ser Great One"></i>
        `;
        row.addEventListener('click', () => showDetailView(animalName, 'reservas', reserveKey));
        checklistContainer.appendChild(row);
    });
    contentContainer.appendChild(checklistContainer);
}

// Calcula o progresso de uma reserva
function calcularReserveProgress(reserveKey) {
    const reserveAnimals = reservesData[reserveKey]?.animals || [];
    let progress = {
        collectedRares: 0,
        totalRares: 0,
        collectedDiamonds: 0,
        totalDiamonds: 0,
        collectedGreatOnes: 0,
        totalGreatOnes: 0
    };

    reserveAnimals.forEach(slug => {
        if (rareFursData[slug]) {
            progress.totalRares += (rareFursData[slug].macho?.length || 0) + (rareFursData[slug].femea?.length || 0);
            progress.collectedRares += Object.values(savedData.pelagens?.[slug] || {}).filter(v => v === true).length;
        }
        if (diamondFursData[slug]) {
            progress.totalDiamonds += (diamondFursData[slug].macho?.length || 0) + (diamondFursData[slug].femea?.length || 0);
            progress.collectedDiamonds += new Set((savedData.diamantes?.[slug] || []).map(t => t.type)).size;
        }
        if (greatsFursData[slug]) {
            progress.totalGreatOnes += greatsFursData[slug].length;
            progress.collectedGreatOnes += Object.values(savedData.greats?.[slug]?.furs || {}).filter(f => f.trophies?.length > 0).length;
        }
    });
    return progress;
}

// Renderiza a visualização de detalhes de pelagens raras
function renderRareFursDetailView(container, name, slug, originReserveKey = null) { // Adicionado originReserveKey
    container.innerHTML = '';
    const furGrid = document.createElement('div');
    furGrid.className = 'fur-grid';
    container.appendChild(furGrid);

    const speciesFurs = rareFursData[slug];
    if (!speciesFurs || (speciesFurs.macho.length === 0 && speciesFurs.femea.length === 0)) {
        furGrid.innerHTML = '<p>Nenhuma pelagem rara listada para este animal.</p>';
        return;
    }

    const genderedFurs = [];
    if (speciesFurs.macho) speciesFurs.macho.forEach(fur => genderedFurs.push({ displayName: `Macho ${fur}`, originalName: fur, gender: 'macho' }));
    if (speciesFurs.femea) speciesFurs.femea.forEach(fur => genderedFurs.push({ displayName: `Fêmea ${fur}`, originalName: fur, gender: 'femea' }));

    genderedFurs.sort((a, b) => a.displayName.localeCompare(b.displayName)).forEach(furInfo => {
        const furCard = document.createElement('div');
        const isCompleted = savedData.pelagens?.[slug]?.[furInfo.displayName] === true;
        furCard.className = `fur-card ${isCompleted ? 'completed' : 'incomplete'}`;
        const furSlug = slugify(furInfo.originalName), genderSlug = furInfo.gender;
        furCard.innerHTML = `<img src="animais/pelagens/${slug}_${furSlug}_${genderSlug}.png" onerror="this.onerror=null; this.src='animais/pelagens/${slug}_${furSlug}.png'; this.onerror=null; this.src='animais/${slug}.png';"><div class="info">${furInfo.displayName}</div><button class="fullscreen-btn" onclick="openImageViewer(this.closest('.fur-card').querySelector('img').src); event.stopPropagation();" title="Ver em tela cheia">⛶</button>`;

        furCard.addEventListener('click', () => {
            if (!savedData.pelagens) savedData.pelagens = {};
            if (!savedData.pelagens[slug]) savedData.pelagens[slug] = {};
            const currentState = savedData.pelagens[slug][furInfo.displayName] || false;
            savedData.pelagens[slug][furInfo.displayName] = !currentState;
            saveData(savedData);
            // Re-renderiza a visualização para que a aparência do card principal seja atualizada
            if (originReserveKey) {
                renderAnimalDossier(name, originReserveKey);
            } else {
                renderSimpleDetailView(name, 'pelagens');
            }
        });
        furGrid.appendChild(furCard);
    });
}

// Renderiza a visualização de detalhes de super raros
function renderSuperRareDetailView(container, name, slug, originReserveKey = null) { // Adicionado originReserveKey
    container.innerHTML = '';
    const furGrid = document.createElement('div');
    furGrid.className = 'fur-grid';
    container.appendChild(furGrid);

    const speciesRareFurs = rareFursData[slug];
    const speciesDiamondData = diamondFursData[slug]; // Dados de diamante para o animal

    const fursToDisplay = [];

    // Determina quais gêneros podem ser diamante para este animal
    const canBeDiamondMacho = (speciesDiamondData?.macho?.length || 0) > 0;
    const canBeDiamondFemea = (speciesDiamondData?.femea?.length || 0) > 0;

    // Adiciona pelagens raras masculinas SE o macho puder dar diamante
    if (speciesRareFurs?.macho && canBeDiamondMacho) {
        speciesRareFurs.macho.forEach(rareFur => {
            fursToDisplay.push({
                displayName: `Macho ${rareFur}`,
                originalName: rareFur,
                gender: 'macho'
            });
        });
    }

    // Adiciona pelagens raras femininas SE a fêmea puder dar diamante
    if (speciesRareFurs?.femea && canBeDiamondFemea) {
        speciesRareFurs.femea.forEach(rareFur => {
            fursToDisplay.push({
                displayName: `Fêmea ${rareFur}`,
                originalName: rareFur,
                gender: 'femea'
            });
        });
    }

    if (fursToDisplay.length === 0) {
        furGrid.innerHTML = '<p>Nenhuma pelagem Super Rara (rara + diamante) encontrada para este animal.</p>';
        return;
    }

    fursToDisplay.sort((a, b) => a.displayName.localeCompare(b.displayName)).forEach(furInfo => {
        const furCard = document.createElement('div');
        // A chave em savedData.super_raros será o displayName completo (ex: "Macho Café")
        const keyInSavedData = furInfo.displayName;
        const isCompleted = savedData.super_raros?.[slug]?.[keyInSavedData] === true;

        furCard.className = `fur-card ${isCompleted ? 'completed' : 'incomplete'} potential-super-rare`; // Adiciona classe para destaque
        
        const furSlug = slugify(furInfo.originalName);
        const genderSlug = furInfo.gender.toLowerCase();

        furCard.innerHTML = `<img src="animais/pelagens/${slug}_${furSlug}_${genderSlug}.png" onerror="this.onerror=null; this.src='animais/pelagens/${slug}_${furSlug}.png'; this.onerror=null; this.src='animais/${slug}.png';"><div class="info">${furInfo.displayName}</div><button class="fullscreen-btn" onclick="openImageViewer(this.closest('.fur-card').querySelector('img').src); event.stopPropagation();" title="Ver em tela cheia">⛶</button>`;

        furCard.addEventListener('click', () => {
            if (!savedData.super_raros) savedData.super_raros = {};
            if (!savedData.super_raros[slug]) savedData.super_raros[slug] = {};
            
            // Toggle do status
            const currentState = savedData.super_raros[slug][keyInSavedData] || false;
            savedData.super_raros[slug][keyInSavedData] = !currentState;
            
            saveData(savedData);
            // Re-renderiza a visualização para que a aparência do card seja atualizada
            if (originReserveKey) {
                renderAnimalDossier(name, originReserveKey);
            } else {
                renderSimpleDetailView(name, 'super_raros');
            }
        });
        furGrid.appendChild(furCard);
    });
}


// Renderiza a visualização de detalhes de diamantes
function renderDiamondsDetailView(container, name, slug, originReserveKey = null) { // Adicionado originReserveKey
    container.innerHTML = '';
    const furGrid = document.createElement('div');
    furGrid.className = 'fur-grid';
    container.appendChild(furGrid);

    const speciesDiamondFurs = diamondFursData[slug];
    if (!speciesDiamondFurs) {
        furGrid.innerHTML = '<p>Nenhuma pelagem de diamante listada para este animal.</p>';
        return;
    }

    const allPossibleFurs = [];
    if (speciesDiamondFurs.macho) speciesDiamondFurs.macho.forEach(fur => allPossibleFurs.push({ displayName: `${fur}`, originalName: fur, gender: 'Macho' }));
    if (speciesDiamondFurs.femea) speciesDiamondFurs.femea.forEach(fur => allPossibleFurs.push({ displayName: `${fur}`, originalName: fur, gender: 'Fêmea' }));

    allPossibleFurs.sort((a, b) => a.displayName.localeCompare(b.displayName)).forEach(furInfo => {
        const furCard = document.createElement('div');
        furCard.className = 'fur-card';
        const fullTrophyName = `${furInfo.gender} ${furInfo.displayName}`;
        // Encontra o troféu com a maior pontuação para este tipo de pelagem
        const highestScoreTrophy = (savedData.diamantes?.[slug] || []).filter(t => t.type === fullTrophyName).reduce((max, t) => t.score > max.score ? t : max, { score: -1 });
        const isCompleted = highestScoreTrophy.score !== -1;
        furCard.classList.add(isCompleted ? 'completed' : 'incomplete');
        const furSlug = slugify(furInfo.originalName), genderSlug = furInfo.gender.toLowerCase();
        furCard.innerHTML = `<img src="animais/pelagens/${slug}_${furSlug}_${genderSlug}.png" onerror="this.onerror=null; this.src='animais/pelagens/${slug}_${furSlug}.png'; this.onerror=null; this.src='animais/${slug}.png';"><div class="info-header"><span class="gender-tag">${furInfo.gender}</span><div class="info">${furInfo.displayName}</div></div><div class="score-container">${isCompleted ? `<span class="score-display"><i class="fas fa-trophy"></i> ${highestScoreTrophy.score}</span>` : '<span class="score-add-btn">Adicionar Pontuação</span>'}</div><button class="fullscreen-btn" onclick="openImageViewer(this.closest('.fur-card').querySelector('img').src); event.stopPropagation();" title="Ver em tela cheia">⛶</button>`;

        const scoreContainer = furCard.querySelector('.score-container');
        scoreContainer.addEventListener('click', e => {
            e.stopPropagation();
            if (scoreContainer.querySelector('input')) return; // Evita abrir múltiplos inputs

            const currentScore = isCompleted ? highestScoreTrophy.score : '';
            scoreContainer.innerHTML = `<input type="number" class="score-input" value="${currentScore}" placeholder="0.0">`;
            const input = scoreContainer.querySelector('.score-input');
            input.focus();
            input.select();

            const saveScore = () => {
                const scoreValue = parseFloat(input.value);
                if (!savedData.diamantes) savedData.diamantes = {};
                if (!Array.isArray(savedData.diamantes[slug])) savedData.diamantes[slug] = [];

                // Filtra os troféus existentes para remover o que está sendo editado/removido
                let otherTrophies = savedData.diamantes[slug].filter(t => t.type !== fullTrophyName);

                // Se a pontuação for válida (não NaN e maior que 0), adiciona o novo troféu
                if (!isNaN(scoreValue) && scoreValue > 0) {
                    otherTrophies.push({ id: Date.now(), type: fullTrophyName, score: scoreValue });
                }

                savedData.diamantes[slug] = otherTrophies;
                saveData(savedData);
                // Re-renderiza a visualização de detalhes para refletir as mudanças
                if (originReserveKey) {
                    renderAnimalDossier(name, originReserveKey);
                } else {
                    renderDiamondsDetailView(container, name, slug);
                }
                // Atualiza a aparência do card principal na view de categoria
                const mainCard = document.querySelector(`.animal-card[data-slug="${slug}"]`);
                if (mainCard) {
                    updateCardAppearance(mainCard, slug, 'diamantes');
                }
            };

            input.addEventListener('blur', saveScore);
            input.addEventListener('keydown', e => {
                if (e.key === 'Enter') saveScore();
                else if (e.key === 'Escape') {
                    if (originReserveKey) {
                        renderAnimalDossier(name, originReserveKey);
                    } else {
                        renderDiamondsDetailView(container, name, slug);
                    }
                }
            });
        });
        furGrid.appendChild(furCard);
    });
}

// Renderiza a visualização de detalhes de Great Ones
function renderGreatsDetailView(container, animalName, slug, originReserveKey = null) { // Adicionado originReserveKey
    container.innerHTML = '';
    const furGrid = document.createElement('div');
    furGrid.className = 'fur-grid';
    container.appendChild(furGrid);

    const fursInfo = greatsFursData[slug];
    if (!fursInfo) {
        furGrid.innerHTML = '<p>Nenhuma pelagem de Great One para este animal.</p>';
        return;
    }

    fursInfo.forEach(furName => {
        const trophies = savedData.greats?.[slug]?.furs?.[furName]?.trophies || [];
        const furCard = document.createElement('div');
        furCard.className = `fur-card trophy-frame ${trophies.length > 0 ? 'completed' : 'incomplete'}`;
        const furSlug = slugify(furName);
        furCard.innerHTML = `<img src="animais/pelagens/great_${slug}_${furSlug}.png" alt="${furName}" onerror="this.onerror=null; this.src='animais/${slug}.png';"><div class="info-plaque"><div class="info">${furName}</div><div class="kill-counter"><i class="fas fa-trophy"></i> x${trophies.length}</div></div>`;
        furCard.addEventListener('click', () => openGreatsTrophyModal(animalName, slug, furName, originReserveKey)); // Passa originReserveKey
        furGrid.appendChild(furCard);
    });
}

// Abre o modal de troféus de Great Ones
async function openGreatsTrophyModal(animalName, slug, furName, originReserveKey = null) { // Adicionado 'originReserveKey'
    const modal = document.getElementById('form-modal');
    modal.innerHTML = '';
    modal.className = 'modal-overlay form-modal';
    const modalContent = document.createElement('div');
    modalContent.className = 'modal-content-box';
    modal.appendChild(modalContent);

    modalContent.innerHTML = `<h3><i class="fas fa-trophy"></i> Troféus de: ${furName}</h3>`;
    const logList = document.createElement('ul');
    logList.className = 'trophy-log-list';
    const trophies = savedData.greats?.[slug]?.furs?.[furName]?.trophies || [];
    if (trophies.length === 0) {
        logList.innerHTML = '<li>Nenhum abate registrado.</li>';
    } else {
        trophies.forEach((trophy, index) => {
            const li = document.createElement('li');
            const grindDetails = `Grind: ${trophy.abates || 0} | <i class="fas fa-gem"></i> ${trophy.diamantes || 0} | <i class="fas fa-paw"></i> ${trophy.pelesRaras || 0}`;
            li.innerHTML = `<span>Abate ${new Date(trophy.date).toLocaleDateString()} (${grindDetails})</span>`;

            const deleteBtn = document.createElement('button');
            deleteBtn.className = 'delete-trophy-btn';
            deleteBtn.innerHTML = '×';
            deleteBtn.onclick = async () => {
                if (await showCustomAlert('Tem certeza que deseja remover este abate?', 'Confirmar Exclusão', true)) {
                    trophies.splice(index, 1);
                    saveData(savedData);
                    closeModal('form-modal');
                    const detailContent = document.querySelector('.dossier-content') || document.querySelector('.main-content > .content-container');
                    if (detailContent) {
                        if (originReserveKey) { // Se estiver no contexto do dossiê, re-renderiza o dossiê
                            renderAnimalDossier(animalName, originReserveKey);
                        } else { // Caso contrário, re-renderiza a visualização Greats normal
                            renderGreatsDetailView(detailContent, animalName, slug);
                        }
                    }
                }
            };
            li.appendChild(deleteBtn);
            logList.appendChild(li);
        });
    }
    modalContent.appendChild(logList);

    const form = document.createElement('div');
    form.className = 'add-trophy-form';
    form.innerHTML = `
        <h4>Registrar Novo Abate</h4>
        <table><tbody>
            <tr><td>Qtd. Abates na Grind:</td><td><input type="number" name="abates" placeholder="0"></td></tr>
            <tr><td>Qtd. Diamantes na Grind:</td><td><input type="number" name="diamantes" placeholder="0"></td></tr>
            <tr><td>Qtd. Peles Raras na Grind:</td><td><input type="number" name="pelesRaras" placeholder="0"></td></tr>
            <tr><td>Data de Abatimento:</td><td><input type="date" name="date" value="${new Date().toISOString().split('T')[0]}"></td></tr>
        </tbody></table>`;
    modalContent.appendChild(form);

    const buttonsDiv = document.createElement('div');
    buttonsDiv.className = 'modal-buttons';
    const cancelBtn = document.createElement('button');
    cancelBtn.className = 'back-button';
    cancelBtn.textContent = 'Cancelar';
    cancelBtn.onclick = () => closeModal('form-modal');

    const saveBtn = document.createElement('button');
    saveBtn.className = 'back-button';
    saveBtn.style.cssText = 'background-color: var(--primary-color); color: #111;';
    saveBtn.textContent = 'Salvar Troféu';
    saveBtn.onclick = () => {
        const newTrophy = {
            abates: parseInt(form.querySelector('[name="abates"]').value) || 0,
            diamantes: parseInt(form.querySelector('[name="diamantes"]').value) || 0,
            pelesRaras: parseInt(form.querySelector('[name="pelesRaras"]').value) || 0,
            date: form.querySelector('[name="date"]').value || new Date().toISOString().split('T')[0]
        };
        if (!savedData.greats) savedData.greats = {};
        if (!savedData.greats[slug]) savedData.greats[slug] = {};
        if (!savedData.greats[slug].furs) savedData.greats[slug].furs = {};
        if (!savedData.greats[slug].furs[furName]) {
            savedData.greats[slug].furs[furName] = { trophies: [] };
        }
        savedData.greats[slug].furs[furName].trophies.push(newTrophy);
        checkAndSetGreatOneCompletion(slug, savedData.greats[slug]);
        saveData(savedData);
        closeModal('form-modal');
        const detailContent = document.querySelector('.dossier-content') || document.querySelector('.main-content > .content-container');
        if (detailContent) {
            if (originReserveKey) { // Se estiver no contexto do dossiê, re-renderiza o dossiê
                renderAnimalDossier(animalName, originReserveKey);
            } else { // Caso contrário, re-renderiza a visualização Greats normal
                renderGreatsDetailView(detailContent, animalName, slug);
            }
        }
    };
    buttonsDiv.appendChild(cancelBtn);
    buttonsDiv.appendChild(saveBtn);
    modalContent.appendChild(buttonsDiv);

    modal.style.display = 'flex';
}

/**
 * Renderiza a visualização de detalhes de Hotspot para um animal específico em uma reserva.
 * @param {HTMLElement} container O container onde o conteúdo será renderizado.
 * @param {string} animalName O nome de exibição do animal.
 * @param {string} animalSlug O slug do animal.
 * @param {string} reserveKey A chave da reserva.
 */
function renderHotspotDetailsView(container, animalName, animalSlug, reserveKey) {
    container.innerHTML = ''; // Limpa o conteúdo anterior

    const hotspotInfo = hotspotData[reserveKey]?.[animalSlug];

    if (!hotspotInfo) {
        container.innerHTML = `<p>Nenhuma informação de hotspot disponível para ${animalName} nesta reserva.</p>`;
        return;
    }

    const hotspotContainer = document.createElement('div');
    hotspotContainer.className = 'hotspot-details-container';

    // Seção do Mapa
    const mapWrapper = document.createElement('div');
    mapWrapper.className = 'hotspot-map-wrapper';
    mapWrapper.innerHTML = `
        <h4>Mapa de Hotspot</h4>
        <img class="hotspot-map-image" 
             src="hotspots/${hotspotInfo.mapImage}.jpg" 
             alt="Mapa de Hotspot para ${animalName} em ${reservesData[reserveKey].name}"
             onerror="this.onerror=null;this.src='animais/placeholder.png';"
             onclick="openImageViewer(this.src);">
    `;
    hotspotContainer.appendChild(mapWrapper);

    // Seção de Informações Detalhadas
    const infoPanel = document.createElement('div');
    infoPanel.className = 'hotspot-info-panel';
    infoPanel.innerHTML = `
        <h4>Detalhes de Caça</h4>
        <ul class="info-list">
            <li class="info-item"><i class="fas fa-trophy"></i> <strong>Pontuação Máxima:</strong> ${hotspotInfo.maxScore || 'Não disponível'}</li>
            <li class="info-item"><i class="fas fa-balance-scale-right"></i> <strong>Estimativa de Peso Máximo:</strong> ${hotspotInfo.maxWeightEstimate || 'Não disponível'}</li>
            <li class="info-item"><i class="fas fa-clock"></i> <strong>Potencial de Zonas:</strong> ${hotspotInfo.needZonesPotential || 'Não disponível'}</li>
            <li class="info-item"><i class="fas fa-layer-group"></i> <strong>Classe:</strong> ${hotspotInfo.animalClass || 'Não disponível'}</li>
            <li class="info-item"><i class="fas fa-arrow-alt-circle-up"></i> <strong>Nível Máximo:</strong> ${hotspotInfo.maxLevel || 'Não disponível'}</li>
        </ul>
    `;
    hotspotContainer.appendChild(infoPanel);

    container.appendChild(hotspotContainer);
}


/**
 * Atualiza a aparência de um cartão de animal (completed, inprogress, incomplete)
 * com base no progresso na categoria específica.
 * @param {HTMLElement} card O elemento do cartão do animal.
 * @param {string} slug O slug do animal.
 * @param {string} tabKey A chave da aba (ex: 'pelagens', 'diamantes', 'super_raros', 'greats').
 */
function updateCardAppearance(card, slug, tabKey) {
    if (!card) return;
    card.classList.remove('completed', 'inprogress', 'incomplete');
    let status = 'incomplete'; // Status padrão

    let collectedCount = 0;
    let totalCount = 0;

    switch (tabKey) {
        case 'greats':
            const animalData = savedData.greats?.[slug] || {};
            checkAndSetGreatOneCompletion(slug, animalData); // Garante que o status 'completo' seja atualizado
            const totalGreatFurs = greatsFursData[slug]?.length || 0; // Total de peixes Great One para este animal

            if (animalData.completo) {
                status = 'completed';
            } else {
                const collectedFurs = animalData.furs ? Object.values(animalData.furs).filter(fur => fur.trophies?.length > 0).length : 0;
                if (collectedFurs > 0 && collectedFurs < totalGreatFurs) { // Em progresso se coletou alguns, mas não todos
                    status = 'inprogress';
                }
            }
            break;

        case 'diamantes':
            const collectedDiamondTrophies = savedData.diamantes?.[slug] || [];
            collectedCount = new Set(collectedDiamondTrophies.map(t => t.type)).size; // Conta tipos únicos de diamantes coletados

            const speciesDiamondData = diamondFursData[slug];
            if (speciesDiamondData) {
                totalCount = (speciesDiamondData.macho?.length || 0) + (speciesDiamondData.femea?.length || 0);
                if (totalCount > 0 && collectedCount === totalCount) { // 100% coletado
                    status = 'completed';
                } else if (collectedCount > 0 && collectedCount < totalCount) { // Em progresso
                    status = 'inprogress';
                }
            }
            break;

        case 'super_raros':
            // Para Super Raros, a lógica de contagem agora se baseia nas pelagens raras que podem ser diamante para o gênero
            const collectedSuperRares = savedData.super_raros?.[slug] || {};
            collectedCount = Object.values(collectedSuperRares).filter(v => v === true).length;

            const speciesRareFursForSuper = rareFursData[slug];
            const speciesDiamondFursForSuper = diamondFursData[slug];

            if (speciesRareFursForSuper) {
                let possibleSuperRares = 0;
                // Conta as combinações de pelagem rara + gênero diamante para macho
                if (speciesRareFursForSuper.macho && (speciesDiamondFursForSuper?.macho?.length || 0) > 0) {
                    possibleSuperRares += speciesRareFursForSuper.macho.length;
                }
                // Conta as combinações de pelagem rara + gênero diamante para fêmea
                if (speciesRareFursForSuper.femea && (speciesDiamondFursForSuper?.femea?.length || 0) > 0) {
                    possibleSuperRares += speciesRareFursForSuper.femea.length;
                }
                totalCount = possibleSuperRares;

                if (totalCount > 0 && collectedCount === totalCount) { // 100% coletado
                    status = 'completed';
                } else if (collectedCount > 0 && collectedCount < totalCount) { // Em progresso
                    status = 'inprogress';
                }
            }
            break;

        case 'pelagens':
            const collectedRareFurs = savedData.pelagens?.[slug] || {};
            collectedCount = Object.values(collectedRareFurs).filter(v => v === true).length;
            const speciesRareData = rareFursData[slug];
            if (speciesRareData) {
                totalCount = (speciesRareData.macho?.length || 0) + (speciesRareData.femea?.length || 0);
                if (totalCount > 0 && collectedCount === totalCount) { // 100% coletado
                    status = 'completed';
                } else if (collectedCount > 0 && collectedCount < totalCount) { // Em progresso
                    status = 'inprogress';
                }
            }
            break;
    }

    // Log para depuração
    console.log(`updateCardAppearance para ${card.querySelector('.info').textContent} (slug: ${slug}) em ${tabKey}: coletados=${collectedCount}, total=${totalCount}, status=${status}`);
    card.classList.add(status);
}


// Renderiza a visualização do painel de progresso
function renderProgressView(container) {
    container.innerHTML = '';
    const wrapper = document.createElement('div');
    wrapper.className = 'progress-view-container';
    wrapper.id = 'progress-panel-main-container';
    wrapper.appendChild(createLatestAchievementsPanel());

    const viewToggleButtons = document.createElement('div');
    viewToggleButtons.style.cssText = 'display: flex; gap: 10px; margin-bottom: 20px;';

    const showProgressBtn = document.createElement('button');
    showProgressBtn.textContent = 'Ver Progresso Geral';
    showProgressBtn.className = 'back-button';

    const showRankingBtn = document.createElement('button');
    showRankingBtn.textContent = 'Ver Classificação de Caça';
    showRankingBtn.className = 'back-button';

    viewToggleButtons.appendChild(showProgressBtn);
    viewToggleButtons.appendChild(showRankingBtn);
    wrapper.appendChild(viewToggleButtons);

    const contentArea = document.createElement('div');
    wrapper.appendChild(contentArea);

    showProgressBtn.onclick = () => {
        contentArea.innerHTML = '';
        const progressPanel = document.createElement('div');
        progressPanel.id = 'progress-panel';
        updateProgressPanel(progressPanel);
        contentArea.appendChild(progressPanel);
    };

    showRankingBtn.onclick = () => {
        renderHuntingRankingView(contentArea);
    };

    // Botões de Backup/Restauração
    const backupRestoreContainer = document.createElement('div');
    backupRestoreContainer.style.cssText = 'display: flex; flex-direction: column; gap: 10px; margin-top: 20px; align-items: center;';

    const exportButton = document.createElement('button');
    exportButton.id = 'export-progress-btn';
    exportButton.className = 'back-button';
    exportButton.innerHTML = '<i class="fas fa-download"></i> Fazer Backup (JSON)';
    exportButton.onclick = exportUserData;
    backupRestoreContainer.appendChild(exportButton);

    const importLabel = document.createElement('label');
    importLabel.htmlFor = 'import-file-input';
    importLabel.className = 'back-button';
    importLabel.style.cssText = 'display: block; width: fit-content; cursor: pointer; background-color: var(--inprogress-color); color: #111;';    
    importLabel.innerHTML = '<i class="fas fa-upload"></i> Restaurar Backup (JSON)';
    backupRestoreContainer.appendChild(importLabel);

    const importInput = document.createElement('input');
    importInput.type = 'file';
    importInput.id = 'import-file-input';
    importInput.accept = '.json';
    importInput.style.display = 'none';
    importInput.addEventListener('change', importUserData);
    backupRestoreContainer.appendChild(importInput);

    wrapper.appendChild(backupRestoreContainer);


    const resetButton = document.createElement('button');
    resetButton.id = 'progress-reset-button';
    resetButton.textContent = 'Resetar Todo o Progresso';
    resetButton.className = 'back-button';
    resetButton.style.cssText = 'background-color: #d9534f; border-color: #d43f3a; margin-top: 20px;';
    resetButton.onclick = async () => {
        if (await showCustomAlert('Tem certeza que deseja apagar TODO o seu progresso? Esta ação não pode ser desfeita.', 'Resetar Progresso', true)) {
            const defaultData = getDefaultDataStructure();
            savedData = defaultData; // Atualiza savedData localmente antes de salvar
            saveData(savedData);
            location.reload();    
        }
    };

    container.appendChild(wrapper);
    container.appendChild(resetButton); // Adiciona o botão de reset ao container principal, fora do wrapper para alinhar com os outros.

    showProgressBtn.click(); // Mostra o progresso geral por padrão
}

// Cria o painel de últimas conquistas
function createLatestAchievementsPanel() {
    const panel = document.createElement('div');
    panel.className = 'latest-achievements-panel';
    panel.innerHTML = '<h3><i class="fas fa-star"></i> Últimas Conquistas</h3>';

    const grid = document.createElement('div');
    grid.className = 'achievements-grid';

    const allTrophies = [];
    // Adiciona troféus de diamantes
    if(savedData.diamantes) {
        Object.entries(savedData.diamantes).forEach(([slug, trophies]) => {
            const animalName = items.find(i => slugify(i) === slug) || slug;
            trophies.forEach(trophy => allTrophies.push({ id: trophy.id, animalName, furName: trophy.type, slug, type: 'diamante' }));
        });
    }
    // Adiciona troféus de Great Ones
    if(savedData.greats) {
        Object.entries(savedData.greats).forEach(([slug, greatOneData]) => {
            const animalName = items.find(i => slugify(i) === slug) || slug;
            if(greatOneData.furs) {
                Object.entries(greatOneData.furs).forEach(([furName, furData]) => {
                    (furData.trophies || []).forEach(trophy => allTrophies.push({ id: new Date(trophy.date).getTime(), animalName, furName, slug, type: 'greatone' }));
                });
            }
        });
    }

    if (allTrophies.length === 0) {
        grid.innerHTML = '<p style="color: var(--text-color-muted); grid-column: 1 / -1;">Nenhum troféu de destaque registrado ainda.</p>';
    } else {
        // Ordena por ID (data de criação) e pega os 4 mais recentes
        allTrophies.sort((a, b) => b.id - a.id).slice(0, 4).forEach(trophy => {
            const card = document.createElement('div');
            card.className = 'achievement-card';
            const rotation = Math.random() * 6 - 3; // Pequena rotação para efeito visual
            card.style.transform = `rotate(${rotation}deg)`;
            card.addEventListener('mouseenter', () => card.style.zIndex = 10);
            card.addEventListener('mouseleave', () => card.style.zIndex = 1);

            const animalSlug = trophy.slug;
            let imagePathString;

            if (trophy.type === 'diamante') {
                const gender = trophy.furName.toLowerCase().includes('macho') ? 'macho' : 'femea';
                const pureFurName = trophy.furName.replace(/^(macho|fêmea)\s/i, '').trim();
                const furSlug = slugify(pureFurName);
                const specificPath = `animais/pelagens/${animalSlug}_${furSlug}_${gender}.png`;
                const neutralPath = `animais/pelagens/${animalSlug}_${furSlug}.png`;
                const basePath = `animais/${animalSlug}.png`;
                imagePathString = `src="${specificPath}" onerror="this.onerror=null; this.src='${neutralPath}'; this.onerror=null; this.src='${basePath}'; this.onerror=null; this.src='animais/placeholder.png';"`;
            } else if (trophy.type === 'greatone') {
                const furSlug = slugify(trophy.furName);
                const specificPath = `animais/pelagens/great_${animalSlug}_${furSlug}.png`;
                const basePath = `animais/${animalSlug}.png`;
                imagePathString = `src="${specificPath}" onerror="this.onerror=null; this.src='${basePath}'; this.onerror=null; this.src='animais/placeholder.png';"`;
            } else {
                // Fallback para outros tipos ou se não houver imagem específica
                imagePathString = `src="animais/${animalSlug}.png" onerror="this.onerror=null;this.src='animais/placeholder.png';"`;
            }

            card.innerHTML = `
                <img ${imagePathString}>
                <div class="achievement-card-info">
                    <div class="animal-name">${trophy.animalName}</div>
                    <div class="fur-name">${trophy.furName.replace(' Diamante','')}</div>
                </div>
            `;
            grid.appendChild(card);
        });
    }
    panel.appendChild(grid);
    return panel;
}

// Atualiza o painel de progresso geral
function updateProgressPanel(panel) {
    const sections = {
        pelagens: { title: "Progresso de Pelagens Raras", data: rareFursData, saved: savedData.pelagens || {}, type: 'boolean' },
        super_raros: { title: "Progresso de Super Raros", data: rareFursData, saved: savedData.super_raros || {}, type: 'boolean_super' },
        diamantes: { title: "Progresso de Diamantes", data: diamondFursData, saved: savedData.diamantes || {}, type: 'array' },
        greats: { title: "Progresso dos Grandes", data: greatsFursData, saved: savedData.greats || {}, type: 'object' }
    };

    Object.keys(sections).forEach(key => {
        const sectionInfo = sections[key];
        let total = 0, collected = 0;

        if(sectionInfo.type === 'boolean') { // Para pelagens raras
            Object.values(sectionInfo.data).forEach(s => {
                total += (s.macho?.length || 0) + (s.femea?.length || 0);
            });
            Object.values(sectionInfo.saved).forEach(s => {
                collected += Object.values(s).filter(c => c === true).length;
            