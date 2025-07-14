// ========================================================================
// ======== INICIALIZAÇÃO DO FIREBASE (COM SEUS DADOS) ========
// Utilizando Firebase SDK versão 8.10.1
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
        // Chama a função de renderização correta, dependendo da vista ativa
        const contentArea = document.getElementById('progress-content-area');
        if (contentArea) {
             if (document.querySelector('.ranking-table')) { // Se o ranking estiver visível
                 renderHuntingRankingView(contentArea);
             } else { // Caso contrário, atualiza o painel de progresso
                 updateNewProgressPanel(contentArea);
             }
        }
    }
    const mountsGrid = document.querySelector('.mounts-grid');
    if (mountsGrid) {
        const container = mountsGrid.parentNode;
        renderMultiMountsView(container);
    }
}

// --- CONSTANTES DE DADOS ---
const rareFursData = {
    "alce": { macho: ["Albino", "Melânico", "Malhado", "Café"], femea: ["Albino", "Melânico", "Malhado"] },
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
    "canguru_cinza_oriental": { macho: ["Albino", "Melânico", "Leucismo Variação 1", "Leucismo Variação 2", "Leucismo Variação 3"], femea: ["Albino", "Melânico", "Leucismo Variação 1", "Leucismo Variação 2", "Leucismo Variação 3"] },
    "caribu": { macho: ["Albino", "Melânico", "Leucismo","Malhado"], femea: ["Albino", "Melânico", "Leucismo"] },
    "carneiro_azul": { macho: ["Albino", "Melânico", "Leucismo"], femea: ["Albino", "Melânico", "Leucismo"] },
    "carneiro_selvagem": { macho: ["Albino", "Malhado Variação 1", "Malhado Variação 2","Leucismo"], femea: ["Albino", "Malhado Variação 1", "Malhado Variação 2","Leucismo"] },
    "cervo_porco_indiano": { macho: ["Malhado", "Leucismo"], femea: ["Malhado", "Leucismo"] },
    "cervo_almiscarado": { macho: ["Albino", "Melânico", "Malhado"], femea: ["Albino", "Melânico", "Malhado"] },
    "cervo_de_timor": { macho: ["Albino", "leucistico", "Malhado Variação 1", "Malhado Variação 2"], femea: ["leucistico"] },
    "cervo_do_pântano": { macho: ["Albino", "Malhado", "Leucismo","Melânico"], femea: ["Albino", "Malhado", "Leucismo","Melânico"] },
    "cervo_sika": { macho: ["Albino", "pintado vermelho"], femea: ["Albino", "pintado vermelho"] },
    "chital": { macho: ["Albino", "Malhado", "melanico"], femea: ["Albino", "Malhado", "melanico"] },
    "chacal_listrado": { macho: ["Albino", "Melânico"], femea: ["Albino", "Melânico"] },
    "codorna_de_restolho": { macho: ["Albino", "Pardo Escuro"], femea: ["Albino"] },
    "codorniz_da_virgínia": { macho: ["Albino"], femea: ["Albino"] },
    "coelho_da_flórida": { macho: ["Albino", "melanico", "Leucismo Variação 1","Leucismo Variação 2" ], femea: ["Albino", "melanico", "Leucismo Variação 1","Leucismo Variação 2"] },
    "coelho_europeu": { macho: ["Albino", "Melânico", "Leucismo", "Pardo Claro"], femea: ["Albino", "Melânico", "Leucismo", "Pardo Claro"] },
    "coiote": { macho: ["Albino", "Melânico", "Malhado"], femea: ["Albino", "Melânico", "Malhado"] },
    "corça": { macho: ["Albino", "Melânico", "Malhado"], femea: ["Albino", "Melânico", "Malhado"] },
    "crocodilo_de_água_salgada": { macho: ["Albino", "Melânico", "Pardo Claro", "Malhado Variação 1", "Malhado Variação 2", "Leucismo"], femea: ["Albino", "Melânico", "Pardo Claro", "Malhado Variação 1", "Malhado Variação 2", "Leucismo"] },
    "cudo_menor": { macho: ["Albino"], femea: ["Albino"] },
    "cão_guaxinim": { macho: ["Albino", "Laranja", "Pardo escuro", "Malhado Variação 1", "Malhado Variação 2"], femea: ["Albino", "Laranja", "Pardo escuro", "Malhado Variação 1", "Malhado Variação 2"] },
    "faisão_de_pescoço_anelado": { macho: ["Albino", "Melânico", "Leucismo"], femea: ["Albino", "Melânico", "Leucismo"] },
    "faisão": { macho: ["Albino", "Melânico", "Leucismo"], femea: ["Albino", "Melânico", "Leucismo"] },
    "frisada": { macho: ["Albino", "Melânico", "Leucismo"], femea: ["Albino", "Melânico", "Leucismo"] },
    "galinha_montês": { macho: ["Pálida", "Híbrido", "Escuro"], femea: ["Pálida", "Híbrido", "Escuro"] },
    "galo_lira": { macho: ["Leucismo Variação 1", "Leucismo Variação 2", "Leucismo Variação 3", "melanico Variação 1", "melanico Variação 2"], femea: ["Laranja"] },
    "gamo": { macho: ["Albino", "Melânico", "Malhado Variação 1", "Malhado Variação 2"], femea: ["Albino", "Melânico"] },
    "ganso_bravo": { macho: ["Híbrido", "Leucismo Variação 1", "Leucismo Variação 2", "Leucismo Variação 3", "Leucismo Variação 4", "Leucismo Variação 5"], femea: ["Híbrido", "Leucismo Variação 1", "Leucismo Variação 2", "Leucismo Variação 3", "Leucismo Variação 4", "Leucismo Variação 5"] },
    "ganso_campestre_da_tundra": { macho: ["Leucismo Variação 1", "Leucismo Variação 2", "Leucismo Variação 3"], femea: ["Leucismo Variação 1", "Leucismo Variação 2", "Leucismo Variação 3"] },
    "ganso_pega": { macho: ["Melânico", "Leucismo Variação 1", "Leucismo Variação 2", "Malhado Variação 1", "Malhado Variação 2"], femea: ["Melânico", "Leucismo Variação 1", "Leucismo Variação 2", "Malhado Variação 1", "Malhado Variação 2"] },
    "ganso_do_canadá": { macho: ["Cinza", "Melânico", "Leucismo cinza claro", "hibrido branco"], femea: ["Cinza", "Melânico", "Leucismo cinza claro", "hibrido branco"] },
    "ganso_das_neves": { macho: ["Albino", "Melânico", "Variação azul", "hibrido", "intermediario"], femea: ["Albino", "Melânico", "Variação azul", "hibrido", "intermediario"] },
    "gnu_de_cauda_preta": { macho: ["Albino"], femea: ["Albino", "Coroado"] },
    "guaxinim_comum": { macho: ["Albino", "Melânico", "loiro Malhado", "cinza Malhado"], femea: ["Albino", "Melânico", "loiro Malhado", "cinza Malhado"] },
    "iaque_selvagem": { macho: ["Ouro", "Leucismo", "albino Variação 1", "albino Variação 2"], femea: ["Ouro", "Leucismo", "albino Variação 1", "albino Variação 2", "marrom profundo", "preto profundo"] },
    "ibex_de_beceite": { macho: ["Albino", "Melânico"], femea: ["Albino", "Melânico"] },
    "jacaré_americano": { macho: ["Albino", "Melânico", "Malhado Variação 1", "Malhado Variação 2"], femea: ["Albino", "Melânico", "Malhado Variação 1", "Malhado Variação 2"] },
    "javali": { macho: ["Albino", "Melânico", "preto e dourado"], femea: ["Albino", "Melânico", "preto e dourado"] },
    "javali_africano": { macho: ["Albino"], femea: ["Albino", "Vermelho"] },
    "lagópode_branco": { macho: ["Branco", "muda Variação 1", "muda Variação 2"], femea: ["Branco", "muda Variação 1", "muda Variação 2", "mosqueado Variação 1", "mosqueado Variação 2"] },
    "lagópode_escocês": { macho: ["Branco"], femea: ["Branco"] },
    "lebre_antílope": { macho: ["Albino", "Melânico"], femea: ["Albino", "Melânico"] },
    "lebre_da_eurásia": { macho: ["Albino", "Branco", "muda Variação 1", "muda Variação 2", "pardo claro", "pardo escuro", "cinza claro", "cinza escuro"], femea: ["Albino", "Branco", "muda Variação 1", "muda Variação 2"] },
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
    "marrequinha_comum": { macho: ["híbrido azul", "híbrido verde", "Leucismo Variação 1", "Leucismo Variação 2"], femea: ["Leucismo"] },
    "marrequinha_americana": { macho: ["Albino", "Verde Claro", "Malhado Variação 1", "Malhado Variação 2", "Malhado Variação 3"], femea: ["Malhado Variação 1", "Malhado Variação 2"] },
    "mouflão_ibérico": { macho: ["Albino", "Melânico", "cinza"], femea: ["Albino", "Melânico", "cinza"] },
    "muntíaco_vermelho_do_norte": { macho: ["Albino", "Melânico", "Leucismo Variação 1", "Leucismo Variação 2", "Vermelho Variação 1", "Vermelho Variação 2"], femea: ["Albino", "Melânico", "Leucismo Variação 1", "Leucismo Variação 2"] },
    "nilgó": { macho: ["Malhado Variação 1", "Malhado Variação 2"], femea: ["Malhado Variação 1", "Malhado Variação 2"] },
    "onça_parda": { macho: ["Albino", "Melânico"], femea: ["Albino", "Melânico"] },
    "órix_do_cabo": { macho: ["bege", "escuro", "ouro"], femea: ["bege", "escuro", "ouro"] },
    "pato_olho_de_ouro": { macho: ["eclipse", "Leucismo Variação 1", "Leucismo Variação 2"], femea: ["escuro", "Leucismo Variação 1", "Leucismo Variação 2"] },
    "pato_arlequim": { macho: ["Albino", "Melânico"], femea: ["Albino", "cinza", "escuro"] },
    "pato_real": { macho: ["Melânico"], femea: ["Melânico", "amarelado"] },
    "peru_merriami": { macho: ["Albino", "Melânico", "Leucismo"], femea: ["Albino", "Melânico", "Leucismo"] },
    "peru_selvagem": { macho: ["Albino", "Melânico", "Leucismo", "bronze"], femea: ["Albino", "Melânico", "Leucismo"] },
    "peru_selvagem_do_rio_grande": { macho: ["Albino", "Melânico", "Leucismo"], femea: ["Albino", "Melânico", "Leucismo"] },
    "piadeira": { macho: ["híbrido", "eclipse", "Leucismo Variação 1", "Leucismo Variação 2"], femea: ["Leucismo Variação 1", "Leucismo Variação 2"] },
    "porco_selvagem": { macho: ["Albino", "rosa", "manchas pretas Variação 1", "manchas pretas Variação 2", "hibrido marrom Variação 1", "hibrido marrom Variação 2", "marrom escuro Variação 1", "marrom escuro Variação 2"], femea: ["rosa"] },
    "raposa_tibetana": { macho: ["Albino", "Melânico", "areia", "esfumaçado", "Leucismo"], femea: ["Albino", "Melânico", "areia", "esfumaçado", "Leucismo"] },
    "raposa_cinzenta": { macho: ["Albino", "Melânico", "Leucismo", "Malhado Variação 1", "Malhado Variação 2"], femea: ["Albino", "Melânico", "Leucismo", "Malhado Variação 1", "Malhado Variação 2"] },
    "raposa_vermelha": { macho: ["Albino", "Melânico", "Malhado"], femea: ["Albino", "Melânico", "Malhado"] },
    "rena_da_montanha": { macho: ["Albino", "Melânico", "Malhado", "Leucismo"], femea: ["Albino", "Melânico", "Malhado", "Leucismo"] },
    "sambar": { macho: ["Albino", "Leucismo Variação 1", "Leucismo Variação 2", "Malhado Variação 1", "Malhado Variação 2", "gradiente escuro"], femea: ["Albino", "Malhado", "Leucismo"] },
    "tahr": { macho: ["Albino", "branco", "vermelho", "preto", "vermelho escuro", "pardo escuro"], femea: ["Albino", "branco", "vermelho"] },
    "tetraz_grande": { macho: ["pálido", "Leucismo"], femea: ["Leucismo"] },
    "tigre_de_bengala": { macho: ["Albino", "Melânico", "branco", "branco sem listras", "ouro", "pseudo melanico Variação 1", "pseudo melanico Variação 2", "pseudo melanico branco Variação 1", "pseudo melanico branco Variação 2"], femea: ["Albino", "Melânico", "branco", "branco sem listras", "ouro", "pseudo melanico Variação 1", "pseudo melanico Variação 2", "pseudo melanico branco Variação 1", "pseudo melanico branco Variação 2"] },
    "urso_cinzento": { macho: ["Albino", "Marrom"], femea: ["Albino"] },
    "urso_negro": { macho: ["Amarelado", "Pardo", "Canela"], femea: ["Amarelado", "Pardo", "Canela"] },
    "urso_pardo": { macho: ["Albino", "Melanico"], femea: ["Albino", "Melanico"] },
    "veado_das_montanhas_rochosas": { macho: ["Albino", "Malhado Variação 1", "Malhado Mariação 2"], femea: ["Albino", "Malhado Variação 1", "Malhado Variação 2"] },
    "veado_de_cauda_branca": { macho: ["Albino", "Melânico", "Malhado"], femea: ["Albino", "Melânico", "Malhado"] },
    "veado_de_cauda_preta": { macho: ["Albino", "Melânico", "Malhado"], femea: ["Albino", "Melânico", "Malhado"] },
    "veado_de_roosevelt": { macho: ["Albino", "Melânico", "Malhado"], femea: ["Albino", "Melânico", "Malhado"] },
    "veado_mula": { macho: ["Albino", "Melânico", "diluído", "Malhado Variação 1", "Malhado Variação 2"], femea: ["Albino", "Melânico", "diluído", "Malhado Variação 1", "Malhado Variação 2"] },
    "veado_vermelho": { macho: ["Albino", "Melânico", "Malhado"], femea: ["Albino", "Melânico", "Malhado"] },
    "zarro_negrinha": { macho: ["Albino", "eclipse", "Leucismo Variação 1", "Leucismo Variação 2"], femea: ["Leucismo Variação 1", "Leucismo Variação 2"] },
    "zarro_castanho": { macho: ["Albino", "Melânico", "Leucismo"], femea: ["Albino", "Melânico", "Leucismo"] },
    "ibex_espanhol_do_sudeste": { macho: ["Albino", "Melânico", "laranja", "cinza claro", "castanho acinzentado", "marrom hibrido"], femea: ["Albino", "Melânico"] },
    "ibex_de_gredos": { macho: ["Albino", "Melânico"], femea: ["Albino", "Melânico"] },
    "ibex_de_ronda": { macho: ["Albino", "Melânico"], femea: ["Albino", "Melânico"] },
    "tetraz_azul": { macho: ["Albino", "Melânico", "Leucismo"], femea: ["Albino", "Melânico", "Leucismo"] },
    "marreca_arrebio": { macho: ["Albino", "Melânico", "Malhado"], femea: ["Albino", "Melânico", "Leucismo", "Malhado", "brilhante", "eritristico"] },
    "pato_carolino": { macho: ["Albino", "Prata Diluída", "Dourado Eritrístico", "Leucísmo", "Melânico", "Malhado"], femea: ["Albino", "Prata Diluída", "Dourado Eritrístico", "Leucísmo", "Melânico", "Malhado"] },
    "castor_norte_americano": { macho: ["Albino", "Melânico", "Leucismo","Malhado"], femea: ["Albino", "Melânico", "Leucismo","Malhado"] },
    "caribu_da_floresta_boreal": { macho: ["Albino", "Melânico", "Leucismo","Malhado Variação 1", "Malhado Variação 2"], femea: ["Albino", "Melânico", "Leucismo", "Malhado Variação 1", "Malhado Variação 2"] },
    "cervo_canadense": { macho: ["Albino", "Melânico", "Leucismo", "Malhado"], femea: ["Albino", "Melânico", "Leucismo", "Malhado"] },
    "bisão_da_floresta": { macho: ["Albino", "Melânico", "Leucismo", "Malhado", "Pardo Escuro"], femea: ["Albino", "Melânico", "Leucismo","Malhado","Pardo Escuro"] }
};
const greatsFursData = { "alce": [" Dois Tons Lendário", "Cinza Lendário", "Bétula lendária", "Carvalho Lendário", "Salpicado Lendário", "Abeto lendário"], "urso_negro": ["Creme Lendário", "Espírito Lendário", "Castanho Lendário", "Pintado Lendário", "Gelo Lendário 2", "Gelo Lendário"], "veado_de_cauda_branca": ["Pardo", "Pardo Escuro", "Bronzeado", "Malhado"], "gamo": ["Café Lendário", "Pintado Lendário", "Dourado Lendário", "Misto Lendário", "Prata Lendário"], "raposa_vermelha": ["Lua de Sangue Lendária", "Bengala  Doce Lendária", "Flor de Cerejeira Lendária", "Alcaçuz lendário", "Papoula da Meia-Noite Lendária", "Floco de Neve Mística Lendária", "Hortelã-pimenta lendária", "Gelo Botão de Rosa Lendária", "Beladona Escarlate Lendária"], "veado_vermelho": ["Pintado Lendário"], "tahr": ["Dourado Lendário", "Cicatrizes Lendárias", "Cinza Lendário", "Café com Leite Lendário", "Crânio Lendário", "Metade Lendária", "Neve Lendário"], "veado_mula": ["Chuva de Gotículas Lendárias", "Via Láctea Lendária", "Sopro de Pétalas Lendário", "Manto Crepuscular Lendário", "Enigma Teia de Aranha Lendário", "Faixas de Canela Lendário"], "faisão": ["Rubi Lendário", "Pérola Lendário", "Granada Lendário", "Safira Lendário", "Obsidiana Lendário", "Citrino Lendário", "Esmeralda Lendário", "Morganita Lendário"] };

const items = ["Alce","Antilocapra","Antílope Negro","Bantengue","Bisão da Floresta","Bisão das Planícies","Bisão Europeu","Búfalo Africano","Búfalo D'Água","Cabra da Montanha","Cabra de Leque","Cabra Selvagem","Caititu","Camurça","Canguru-cinza Oriental", "Chacal Listrado", "Caribu","Caribu da Floresta Boreal","Carneiro Azul","Carneiro Selvagem","Castor Norte-Americano","Cervo Almiscarado","Cervo Canadense","Cervo do Pântano","Cervo de Timor","Cervo Sika","Cervo-porco Indiano","Chital","Codorna-de-restolho","Codorniz da Virgínia","Coelho da Flórida","Coelho Europeu","Coiote","Corça","Crocodilo de Água Salgada","Cudo Menor","Faisão de Pescoço Anelado","Frisada","Galo Lira","Gamo","Ganso Bravo","Ganso Campestre da Tundra","Ganso das Neves","Ganso do Canadá","Ganso Pega","Gnu de Cauda Preta","Guaxinim Comum","Iaque Selvagem","Ibex de Beceite","Ibex de Gredos","Ibex de Ronda","Ibex Espanhol do Sudeste","Jacaré Americano","Javali","Javali Africano", "Lebre Europeia", "Lebre-antílope","Lebre-da-cauda-branca","Lebre Da Eurásia","Lebre Nuca Dourada","Lebre Peluda","Leão","Leopardo das Neves","Lince Euroasiática","Lince Pardo do México","Lobo Cinzento","Lobo Ibérico","Marreca Arrebio","Marreca Carijó","Marrequinha Americana","Marrequinha Comum","Mouflão Ibérico","Muntíaco vermelho do norte","Nilgó","Onça Parda","Órix do Cabo","Pato Carolino","Pato Arlequim","Pato Olho de Ouro","Pato Real","Peru Merriami","Peru Selvagem","Peru Selvagem do Rio Grande","Piadeira","Porco Selvagem","Raposa cinzenta","Raposa tibetana","Raposa Vermelha","Rena da Montanha","Sambar","Tahr","Tetraz Azul","Tetraz Grande","Tigre-de-Bengala","Urso Cinzento","Urso Negro","Urso Pardo","Veado das Montanhas Rochosas","Veado de Cauda Branca","Veado de Cauda Preta","Veado-Mula","Veado de Roosevelt","Veado Vermelho","Cão Guaxinim","Lagópode-Branco","Lagópode-Escocês","Galinha-Montês","Zarro-Negrinha","Zarro-castanho", "Peru Merriami"];

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
    "canguru_cinza_oriental": { macho: ["Cinzento Variação 1", "Cinzento Variação 2","Pardo e Cinza", "Pardo Variação 1", "Pardo Variação 2"], femea: [] },
    "caribu": { macho: ["Pardo Claro", "Pardo Escuro"], femea: [] },
    "caribu_da_floresta_boreal": { macho: ["Pardo Escuro", "Pardo Claro"], femea: [] },
    "carneiro_azul": { macho: ["Cinza Ardósia", "Pardo", "Cinza Azulado", "Amarelo"], femea: [] },
    "carneiro_selvagem": { macho: ["Preto", "Pardo", "Cinzento", "Bronze"], femea: [] },
    "castor_norte_americano": { macho: [], femea: ["Pardo Escuro", "Pardo Claro", "Marrom Avermelhado"] },
    "cervo_almiscarado": { macho: ["Pardo e Cinza", "Pardo Escuro"], femea: [] },
    "cervo_canadense": { macho: ["Juba Marrom", "Escuro", "Malhado"], femea: ["Malhado"] },
    "cervo_do_pântano": { macho: ["Pardo", "Pardo Claro", "Vermelho", "Pardo Escuro", "Vermelho Escuro"], femea: [] },
    "cervo_de_timor": { macho: ["Dois Tons", "Pardo", "Pardo Claro", "Pardo e Branco"], femea: [] },
    "cervo_sika": { macho: ["Escuro e Pintado", "Pardo", "Pintado", "Preto"], femea: [] },
    "cervo_porco_indiano": { macho: ["Pardo", "Escuro e Pintado", "Pardo Escuro", "Pintado"], femea: [] },
    "chital": { macho: ["Pintado", "Escuro"], femea: [] },
    "chacal_listrado": { macho: ["Pardo Claro", "Pardo Cinza", "Cinzento"], femea: [] },
    "codorna_de_restolho": { macho: ["Pardo", "Pardo e Cinza", "Pardo Escuro"], femea: [] },
    "codorniz_da_virgínia": { macho: [], femea: ["Pardo"] },
    "coelho_da_flórida": { macho: [], femea: ["Pardo", "Pardo Claro", "Cinzento", "Cinza Claro"] },
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
    "gnu_de_cauda_preta": { macho: ["Cinzento", "Cinza Escuro", "Ouro"], femea: [] },
    "guaxinim_comum": { macho: ["Amarelado", "Cinzento", "Pardo"], femea: [] },
    "iaque_selvagem": { macho: ["Pardo Escuro", "Vermelho Escuro", "Preto Profundo", "Marrom Profundo", "Ouro"], femea: [] },
    "ibex_de_beceite": { macho: ["Albino", "Melânico"], femea: ["Albino", "Melânico"] },
    "jacaré_americano": { macho: ["Pardo_Escuro", "Oliva"], femea: [] },
    "lebre_da_cauda_branca": { macho: ["Bege", "Cinzento", "Pardo", "Pardo Claro"], femea: [] },
    "lebre_da_eurásia": { macho: ["Cinza Claro", "Cinza Escuro", "Pardo Claro", "Pardo Escuro"], femea: ["Cinza Claro", "Cinza Escuro", "Pardo Claro", "Pardo Escuro"] },
    "lebre_europeia": { macho: [], femea: ["cinza", "pardo", "escuro", "pardo claro"] },
    "lebre_nuca_dourada": { macho: [], femea: ["Castanho", "Pardo", "Cinzento"] },
    "lebre_peluda": { macho: ["Cinza Claro", "Pardo Claro", "Pardo Escuro", "Muda"], femea: ["Cinza Claro", "Pardo Claro", "Pardo Escuro", "Muda"] },
    "leão": { macho: ["Bronzeado", "Pardo Claro"], femea: [] },
    "leopardo_das_neves": { macho: ["Neve", "Caramelo"], femea: [] },
    "lince_euroasiática": { macho: ["Cinzento", "Pardo Claro"], femea: [] },
    "lince_pardo_do_méxico": { macho: ["Bronzeado", "Cinzento", "Pardo", "Vermelho"], femea: [] },
    "lobo_cinzento": { macho: ["Cinzento"], femea: [] },
    "lobo_ibérico": { macho: ["Cinzento", "Pardo e Cinza"], femea: [] },
    "marreca_arrebio": { macho: ["Eclipse", "Cinza", "Eritrístico"], femea: [] },
    "marreca_carijó": { macho: ["Canela", "Vermelho", "Malhado"], femea: [] },
    "marrequinha_comum": { macho: ["Verde Escuro", "Verde Claro"], femea: [] },
    "marrequinha_americana": { macho: [ "Verde Claro"], femea: [] },
    "mouflão_ibérico": { macho: ["Pardo Claro", "Pardo"], femea: [] },
    "muntíaco_vermelho_do_norte": { macho: [ "Vermelho Variação 1", "Vermelho Variação 2"], femea: [] },
    "nilgó": { macho: ["Azul", "Pardo Escuro"], femea: [] },
    "onça_parda": { macho: ["Cinzento", "Vermelho Escuro", "Pardo Claro"], femea: [] },
    "órix_do_cabo": { macho: ["Cinzento", "Cinza Claro"], femea: ["Cinzento", "Cinza Claro"] },
    "pato_olho_de_ouro": { macho: ["Preto"], femea: [] },
    "pato_arlequim": { macho: ["Malhado", "Cinza Escuro"], femea: [] },
    "pato_real": { macho: ["Pardo Negro","Marrom Híbrido", "Malhado"], femea: [] },
    "peru_merriami": { macho: ["Pardo", "Pardo Escuro", "Pardo Claro"], femea: [] },
    "peru_selvagem": { macho: ["Pardo Claro", "Bronze", "Pardo"], femea: [] },
    "peru_selvagem_do_rio_grande": { macho: ["Pardo", "Siena", "Siena Claro","Pardo Claro"], femea: [] },
    "piadeira": { macho: ["Pardo", "Cinzento"], femea: [] },
    "porco_selvagem": { macho: [ "Preto", "Preto e Dourado", "Manchas Pretas Variação 1", "Manchas Pretas Variação 2", "Hibrido Marrom Variação 1", "Hibrido Marrom Variação 2", "Marrom Escuro Variação 1", "Marrom Escuro Variação 2"], femea: [] },
    "raposa_tibetana": { macho: ["Vermelho", "Pardo", "Laranja", "Cinzento"], femea: [] },
    "raposa_cinzenta": { macho: ["Vermelho", "Dois Tons","Cinzento"], femea: ["Vermelho", "Dois Tons","Cinzento"] },
    "raposa_vermelha": { macho: ["Vermelho", "Vermelho Escuro", "Laranja"], femea: [] },
    "rena_da_montanha": { macho: ["Pardo Escuro", "Pardo Claro"], femea: [] },
    "sambar": { macho: ["Pardo", "Pardo Escuro", "Pardo Claro", "Gradiente Escuro"], femea: [] },
    "tahr": { macho: ["Pardo Claro", "Pardo", "Palha", "Pardo Avermelhado"], femea: [] },
    "tetraz_grande": { macho: ["Escuro"], femea: [] },
    "tigre_de_bengala": { macho: ["Laranja"], femea: [] },
    "urso_cinzento": { macho: ["Pardo e Cinza"], femea: [] },
    "urso_negro": { macho: ["Preto", "Escuro"], femea: [] },
    "urso_pardo": { macho: ["Espírito", "Pardo", "Pardo Avermelhado", "Ouro", "Pardo Claro", "Pardo Escuro", "Amarelo", "Canela"], femea: [] },
    "veado_das_montanhas_rochosas": { macho: ["Pardo", "Pardo Claro"], femea: [] },
    "veado_de_cauda_branca": { macho: ["Pardo", "Pardo Escuro", "Bronzeado"], femea: [] },
    "veado_de_cauda_preta": { macho: ["Pardo e Cinza", "Cinzento", "Cinza Escuro"], femea: [] },
    "veado_de_roosevelt": { macho: ["Pardo", "Laranja", "Bronzeado"], femea: [] },
    "veado_mula": { macho: ["Pardo", "Cinzento", "Amarelado"], femea: [] },
    "veado_vermelho": { macho: ["Pardo Escuro", "Pardo Claro", "Pardo"], femea: [] },
    "zarro_negrinha": { macho: ["Preto"], femea: [] },
    "zarro_castanho": { macho: ["Escuro", "Pardo Avermelhado"], femea: [] },
    "ibex_espanhol_do_sudeste": { macho: ["Pardo", "Marrom Hibrido", "Pardo Hibrido",  "Castanho Acinzentado", "Cinza Claro", "Laranja"], femea: [] },
    "ibex_de_gredos": { macho: ["Pardo e Cinza", "Marrom Hibrido", "Cinza Claro", "Cinzento"], femea: [] },
    "ibex_de_ronda": { macho: ["Pardo", "Pardo e Cinza", "Marrom Hibrido", "Cinzento"], femea: [] },
    "tetraz_azul": { macho: ["Pardo", "Muda", "Cinza Ardósia"], femea: [] },
    "marreca_arrebio": { macho: ["Eclipse", "Cinza"], femea: [] },
    "pato_carolino": { macho: ["Escuro", "Padrão"], femea: [] },
    "castor_norte_americano": { macho: [], femea: ["Pardo Escuro", "Pardo Claro", "Marrom Avermelado"] },
    "caribu_da_floresta_boreal": { macho: ["Pardo Escuro", "Pardo Claro"], femea: [] },
    "cervo_canadense": { macho: ["Escuro", "Juba Marrom"], femea: [] },
    "bisão_da_floresta": { macho: ["Ruivo", "Pardo Claro", "Metade Ruivo"], femea: [] }
};

const reservesData = { layton_lake: { name: "Layton Lake", image: "reservas/layton_lake.png", animals: ["alce", "veado_de_cauda_branca", "veado_de_cauda_preta", "veado_de_roosevelt", "urso_negro", "coiote", "pato_real", "lebre_da_cauda_branca", "peru_merriami"] }, hirschfelden: { name: "Hirschfelden", image: "reservas/hirschfelden.png", animals: ["gamo", "corça", "veado_vermelho", "javali", "bisão_europeu", "raposa_vermelha", "ganso_do_canadá", "coelho_europeu", "faisão_de_pescoço_anelado"] }, medved_taiga: { name: "Medved Taiga", image: "reservas/medved_taiga.png", animals: ["alce", "rena_da_montanha", "tetraz_grande", "cervo_almiscarado", "urso_pardo", "javali", "lince_euroasiática", "lobo_cinzento"] }, vurhonga_savanna: { name: "Vurhonga Savana", image: "reservas/vurhonga_savanna.png", animals: ["chacal_listrado", "lebre_nuca_dourada", "piadeira", "cudo_menor", "cabra_de_leque", "javali_africano", "gnu_de_cauda_preta", "búfalo_africano", "leão", "órix_do_cabo"] }, parque_fernando: { name: "Parque Fernando", image: "reservas/parque_fernando.png", animals: ["veado_vermelho", "marreca_carijó", "caititu", "veado_mula", "onça_parda", "antílope_negro", "búfalo_dágua", "chital"] }, yukon_valley: { name: "Yukon Valley", image: "reservas/yukon_valley.png", animals: ["caribu", "ganso_do_canadá", "alce", "urso_cinzento", "lobo_cinzento", "bisão_das_planícies", "raposa_vermelha", "pato_arlequim"] }, cuatro_colinas: { name: "Cuatro Colinas", image: "reservas/cuatro_colinas.png", animals: ["ibex_de_gredos", "faisão_de_pescoço_anelado", "ibex_de_beceite", "ibex_espanhol_do_sudeste", "ibex_de_ronda", "mouflão_ibérico", "lobo_ibérico", "javali", "corça", "lebre_europeia", "veado_vermelho"] }, silver_ridge_peaks: { name: "Silver Ridge Peaks", image: "reservas/silver_ridge_peaks.png", animals: ["antilocapra", "carneiro_selvagem", "bisão_das_planícies", "cabra_da_montanha", "veado_mula", "onça_parda", "urso_negro", "veado_das_montanhas_rochosas", "peru_merriami"] }, te_awaroa: { name: "Te Awaroa", image: "reservas/te_awaroa.png", animals: ["veado_vermelho","gamo", "cabra_selvagem", "porco_selvagem", "cervo_sika", "tahr", "peru_merriami", "camurça", "coelho_europeu", "pato_real"] }, rancho_del_arroyo: { name: "Rancho del Arroyo", image: "reservas/rancho_del_arroyo.png", animals: ["veado_mula", "veado_de_cauda_branca", "carneiro_selvagem", "antilocapra", "caititu", "coiote", "lince_pardo_do_mexico", "peru_selvagem_do_rio_grande", "faisão_de_pescoço_anelado", "lebre_antílope"] }, mississippi_acres: { name: "Mississippi Acres", image: "reservas/mississippi_acres.png", animals: ["veado_de_cauda_branca", "codorniz_da_virgínia", "marrequinha_americana", "peru_selvagem", "porco_selvagem", "urso_negro", "raposa_cinzenta", "guaxinim_comum", "coelho_da_flórida", "jacaré_americano"] }, revontuli_coast: { name: "Costa de Revontuli", image: "reservas/revontuli_coast.png", animals: ["galinha_montês", "veado_de_cauda_branca", "urso_pardo", "alce", "ganso_bravo", "ganso_campestre_da_tundra", "ganso_do_canadá", "lagópode_branco", "lagópode_escocês", "pato_real", "piadeira", "tetraz_grande", "cão_guaxinim", "lince_euroasiática", "galo_lira", "lebre_da_eurásia", "marrequinha_comum", "pato_olho_de_ouro", "zarro_negrinha"] }, new_england_mountains: { name: "New England Mountains", image: "reservas/new_england_mountains.png", animals: ["alce", "codorniz_da_virgínia", "coelho_da_flórida", "faisão_de_pescoço_anelado", "marrequinha_americana", "pato_olho_de_ouro", "pato_real", "peru_selvagem", "guaxinim_comum", "lince_pardo_do_mexico", "raposa_cinzenta", "veado_de_cauda_branca", "urso_negro", "coiote", "raposa_vermelha", "gamo"] }, emerald_coast: { name: "Emerald Coast", image: "reservas/emerald_coast.png", animals: ["canguru_cinza_oriental", "codorna_de_restolho", "raposa_vermelha", "cabra_selvagem", "cervo_porco_indiano", "porco_selvagem", "veado_vermelho", "sambar", "cervo_de_timor", "gamo", "bantengue", "crocodilo_de_água_salgada", "ganso_pega", "chital"] }, sundarpatan: { name: "Sundarpatan", image: "reservas/sundarpatan.png", animals: ["antílope_negro", "ganso_bravo","lebre_peluda", "muntíaco_vermelho_do_norte", "raposa_tibetana", "tahr", "carneiro_azul", "cervo_do_pântano", "nilgó", "búfalo_dágua", "leopardo_das_neves", "iaque_selvagem", "tigre_de_bengala"] }, salzwiesen: { name: "Salzwiesen Park", image: "reservas/salzwiesen.png", animals: ["coelho_europeu", "frisada", "galo_lira", "guaxinim_comum", "raposa_vermelha", "ganso_campestre_da_tundra", "faisão_de_pescoço_anelado", "cão_guaxinim", "ganso_bravo", "marrequinha_comum", "pato_olho_de_ouro", "pato_real", "piadeira", "zarro_negrinha", "zarro_castanho"] }, askiy_ridge: { name: "Askiy Ridge", image: "reservas/askiy_ridge.png", animals: ["alce", "caribu_da_floresta_boreal", "urso_negro", "veado_mula", "bisão_da_floresta", "cabra_da_montanha", "antilocapra", "tetraz_azul", "pato_real", "pato_carolino", "marreca_arrebio", "ganso_do_canadá", "ganso_das_neves", "lobo_cinzento", "cervo_canadense", "veado_de_cauda_branca", "faisão_de_pescoço_anelado", "carneiro_selvagem", "castor_norte_americano"] } };

// NOVO: Dados dos Hotspots por Reserva e Animal
const animalHotspotData = {
    "layton_lake": {
        "alce": { maxScore: "274.99", maxWeightEstimate: "545-620 KG", drinkZonesPotential: "12:00 - 16:00", animalClass: "8", maxLevel: "5 (Médio)" },
        "veado_de_cauda_branca": { maxScore: "255.09", maxWeightEstimate: "75-100 KG", drinkZonesPotential: "08:00 - 12:00", animalClass: "4", maxLevel: "3 (Muito Fácil)" },
        "veado_de_cauda_preta": { maxScore: "177.58", maxWeightEstimate: "81-95 KG", drinkZonesPotential: "16:00 - 20:00", animalClass: "4", maxLevel: "5 (Médio)" },
        "veado_de_roosevelt": { maxScore: "380.84", maxWeightEstimate: "450-500 KG", drinkZonesPotential: "04:00 - 08:00", animalClass: "7", maxLevel: "5 (Médio)" },
        "urso_negro": { maxScore: "22.8", maxWeightEstimate: "227-290 KG", drinkZonesPotential: "04:00 - 08:00", animalClass: "7", maxLevel: "9 (Lendário)" },
        "coiote": { maxScore: "56.87", maxWeightEstimate: "24-27 KG", drinkZonesPotential: "00:00 - 04:00", animalClass: "2", maxLevel: "9 (Lendário)" },
        "pato_real": { maxScore: "19.61", maxWeightEstimate: "1-2 KG", drinkZonesPotential: "O DIA TODO", animalClass: "1", maxLevel: "3 (Muito Fácil)" },
        "lebre_da_cauda_branca": { maxScore: "6.33", maxWeightEstimate: "5-6 KG", drinkZonesPotential: "O DIA TODO", animalClass: "1", maxLevel: "3 (Muito Fácil)" },
        "peru_merriami": { maxScore: "4.62", maxWeightEstimate: "9-11 KG", drinkZonesPotential: "O DIA TODO", animalClass: "1", maxLevel: "3 (Muito Fácil)" }
    },
    "hirschfelden": {
        "gamo": { maxScore: "249.99", maxWeightEstimate: "82-100 KG", drinkZonesPotential: "10:00-13:00", animalClass: "4", maxLevel: "5 (Médio)" },
        "corça": { maxScore: "81.86", maxWeightEstimate: "29-35 KG", drinkZonesPotential: "14:00-17:00", animalClass: "3", maxLevel: "3 (Muito Fácil)" },
        "veado_vermelho": { maxScore: "251.07", maxWeightEstimate: "210-240 KG", drinkZonesPotential: "06:00-10:00", animalClass: "6", maxLevel: "9 (Lendário)" },
        "javali": { maxScore: "144.25", maxWeightEstimate: "186-240 KG", drinkZonesPotential: "00:00-03:00", animalClass: "5", maxLevel: "5 (Médio)" },
        "bisão_europeu": { maxScore: "127.62", maxWeightEstimate: "765-920 KG", drinkZonesPotential: "10:00-14:00", animalClass: "9", maxLevel: "5 (Médio)" },
        "raposa_vermelha": { maxScore: "14.05", maxWeightEstimate: "12-15 KG", drinkZonesPotential: "17:00-20:00", animalClass: "2", maxLevel: "9 (Lendário)" },
        "ganso_do_canadá": { maxScore: "8.59", maxWeightEstimate: "8-9 KG", drinkZonesPotential: "O DIA TODO", animalClass: "1", maxLevel: "5 (Médio)" },
        "coelho_europeu": { maxScore: "2.42", maxWeightEstimate: "2 KG", drinkZonesPotential: "O DIA TODO", animalClass: "1", maxLevel: "3 (Muito Fácil)" },
        "faisão_de_pescoço_anelado": { maxScore: "20.29", maxWeightEstimate: "2-3 kg", drinkZonesPotential: "O DIA TODO", animalClass: "1", maxLevel: "3 (Muito Fácil)" }
    },
    // ... (O restante dos dados de hotspot foram omitidos aqui para brevidade, mas devem ser incluídos no seu arquivo)
    "askiy_ridge": {
        "alce": { maxScore: "274.99", maxWeightEstimate: "545-620 KG", drinkZonesPotential: "12:00 - 16:00", animalClass: "8", maxLevel: "5 (Médio)" },
        "caribu_da_floresta_boreal": { maxScore: "430.23", maxWeightEstimate: "161-190 KG", drinkZonesPotential: "20:00 - 00:00", animalClass: "6", maxLevel: "5 (Médio)" },
        "urso_negro": { maxScore: "22.8", maxWeightEstimate: "227-290 KG", drinkZonesPotential: "04:00 - 08:00", animalClass: "7", maxLevel: "9 (Lendário)" },
        "veado_mula": { maxScore: "312.17", maxWeightEstimate: "175-210 KG", drinkZonesPotential: "15:00-18:00", animalClass: "5", maxLevel: "5 (Médio)" },
        "bisão_da_floresta": { maxScore: "158", maxWeightEstimate: "1112-1350 KG", drinkZonesPotential: "08:00-12:00", animalClass: "9", maxLevel: "5 (Médio)" },
        "cabra_da_montanha": { maxScore: "107.67", maxWeightEstimate: "120-145 KG", drinkZonesPotential: "O DIA TODO", animalClass: "4", maxLevel: "5 (Médio)" },
        "antilocapra": { maxScore: "108", maxWeightEstimate: "57-65 KG", drinkZonesPotential: "18:00-21:00", animalClass: "3", maxLevel: "5 (Médio)" },
        "tetraz_azul": { maxScore: "151", maxWeightEstimate: "1.38-1.60 kg", drinkZonesPotential: "O DIA TODO", animalClass: "1", maxLevel: "3 (Muito Fácil)" },
        "pato_real": { maxScore: "19.61", maxWeightEstimate: "1-2 KG", drinkZonesPotential: "O DIA TODO", animalClass: "1", maxLevel: "3 (Muito Fácil)" },
        "pato_carolino": { maxScore: "670", maxWeightEstimate: "0 kg", drinkZonesPotential: "O DIA TODO", animalClass: "1", maxLevel: "3 (Muito Fácil)" },
        "marreca_arrebio": { maxScore: "1040", maxWeightEstimate: "0-1 kg", drinkZonesPotential: "O DIA TODO", animalClass: "1", maxLevel: "3 (Muito Fácil)" },
        "ganso_do_canadá": { maxScore: "8.59", maxWeightEstimate: "8-9 KG", drinkZonesPotential: "O DIA TODO", animalClass: "1", maxLevel: "5 (Médio)" },
        "ganso_das_neves": { maxScore: "3.85", maxWeightEstimate: "3-4 kg", drinkZonesPotential: "O DIA TODO", animalClass: "1", maxLevel: "5 (Médio)" },
        "lobo_cinzento": { maxScore: "39", maxWeightEstimate: "67-80 KG", drinkZonesPotential: "17:00-20:00", animalClass: "5", maxLevel: "9 (Lendário)" },
        "cervo_canadense": { maxScore: "457.56", maxWeightEstimate: "395-450 kg", drinkZonesPotential: "04:00-08:00", animalClass: "7", maxLevel: "5 (Médio)" },
        "veado_de_cauda_branca": { maxScore: "255.09", maxWeightEstimate: "75-100 KG", drinkZonesPotential: "08:00 - 12:00", animalClass: "4", maxLevel: "3 (Muito Fácil)" },
        "faisão_de_pescoço_anelado": { maxScore: "20.29", maxWeightEstimate: "2-3 kg", drinkZonesPotential: "O DIA TODO", animalClass: "1", maxLevel: "3 (Muito Fácil)" },
        "carneiro_selvagem": { maxScore: "196.93", maxWeightEstimate: "132-160 KG", drinkZonesPotential: "12:00-16:00", animalClass: "5", maxLevel: "5 (Médio)" },
        "castor_norte_americano": { maxScore: "30.40", maxWeightEstimate: "28-32 kg", drinkZonesPotential: "04:00-08:00, 08:00-12:00, 16:00-20:00", animalClass: "2", maxLevel: "5 (Médio)" }
    }
};

const multiMountsData = { "a_fuga": { name: "A Fuga", animals: [{ slug: "veado_vermelho", gender: "macho" },{ slug: "veado_vermelho", gender: "femea" }] }, "abraco_do_urso": { name: "Abraço do Urso", animals: [{ slug: "urso_cinzento", gender: "macho" },{ slug: "urso_cinzento", gender: "macho" }] }, "adeus_filho": { name: "Adeus, Filho", animals: [{ slug: "bisão_das_planícies", gender: "macho" },{ slug: "lobo_cinzento", gender: "macho" },{ slug: "lobo_cinzento", gender: "macho" }] }, "admiralces": { name: "Admiralces", animals: [{ slug: "alce", gender: "macho" },{ slug: "codorniz_da_virgínia", gender: "macho" }] }, "almoco_da_raposa": { name: "Almoço da Raposa", animals: [{ slug: "raposa_vermelha", gender: "macho" },{ slug: "lebre_da_cauda_branca", gender: "macho" }] }, "banquete_no_ar": { name: "Banquete no Ar", animals: [{ slug: "raposa_vermelha", gender: "macho" },{ slug: "faisão_de_pescoço_anelado", gender: "macho" }] }, "brincadeira_de_aves": { name: "Brincadeira de Aves", animals: [{ slug: "lagópode_escocês", gender: "macho" },{ slug: "cão_guaxinim", gender: "macho" }] }, "brincando_de_briga": { name: "Brincando de Briga", animals: [{ slug: "lince_euroasiática", gender: "macho" },{ slug: "lince_euroasiática", gender: "femea" }] }, "caudas_brancas_unidas": { name: "Caudas Brancas Unidas", animals: [{ slug: "veado_de_cauda_branca", gender: "macho" },{ slug: "veado_de_cauda_branca", gender: "macho" },{ slug: "veado_de_cauda_branca", gender: "macho" }] }, "colisao": { name: "Colisão", animals: [{ slug: "veado_de_cauda_preta", gender: "macho" },{ slug: "onça_parda", gender: "macho" }] }, "competicao_amistosa": { name: "Competição Amistosa", animals: [{ slug: "coiote", gender: "macho" },{ slug: "coiote", gender: "macho" },{ slug: "lebre_da_cauda_branca", gender: "macho" }] }, "corcas_unidas": { name: "Corças Unidas", animals: [{ slug: "corça", gender: "macho" },{ slug: "corça", gender: "macho" },{ slug: "corça", gender: "macho" }] }, "davi_e_golias": { name: "Davi e Golias", animals: [{ slug: "ganso_do_canadá", gender: "macho" },{ slug: "bisão_europeu", gender: "macho" }] }, "de_cabeca": { name: "De Cabeça", animals: [{ slug: "ibex_de_beceite", gender: "macho" },{ slug: "ibex_de_gredos", gender: "macho" }] }, "decolagem_de_emergencia": { name: "Decolagem de Emergência", animals: [{ slug: "coiote", gender: "macho" },{ slug: "pato_real", gender: "macho" },{ slug: "pato_real", gender: "macho" },{ slug: "pato_real", gender: "femea" }] }, "despedida_do_solteiros": { name: "Despedida dos Solteiros", animals: [{ slug: "veado_mula", gender: "macho" },{ slug: "veado_mula", gender: "femea" },{ slug: "veado_mula", gender: "femea" }] }, "dois_tipos_de_perus": { name: "Dois Tipos de Perus", animals: [{ slug: "peru_selvagem", gender: "macho" },{ slug: "peru_selvagem_do_rio_grande", gender: "macho" }] }, "espionagem_tatica": { name: "Espionagem Tática", animals: [{ slug: "onça_parda", gender: "femea" },{ slug: "veado_de_roosevelt", gender: "macho" }] }, "faisoes_em_fuga": { name: "Faisões em Fuga", animals: [{ slug: "faisão_de_pescoço_anelado", gender: "macho" },{ slug: "faisão_de_pescoço_anelado", gender: "macho" }] }, "falso_tronco": { name: "Falso Tronco", animals: [{ slug: "jacaré_americano", gender: "macho" },{ slug: "guaxinim_comum", gender: "macho" }] }, "fantasma_da_montanha": { name: "Fantasma da Montanha", animals: [{ slug: "leopardo_das_neves", gender: "macho" },{ slug: "carneiro_azul", gender: "macho" }] }, "fartura_de_bisoes": { name: "Fartura de Bisões", animals: [{ slug: "bisão_europeu", gender: "macho" },{ slug: "bisão_europeu", gender: "macho" }] }, "gamos_unidos": { name: "Gamos Unidos", animals: [{ slug: "gamo", gender: "macho" },{ slug: "gamo", gender: "macho" },{ slug: "gamo", gender: "macho" }] }, "ganha_pao": { name: "Ganha-pão", animals: [{ slug: "búfalo_africano", gender: "macho" },{ slug: "leão", gender: "macho" },{ slug: "leão", gender: "femea" },{ slug: "leão", gender: "femea" }] }, "gansos_zangados": { name: "Gansos Zangados", animals: [{ slug: "ganso_do_canadá", gender: "macho" },{ slug: "ganso_do_canadá", gender: "macho" }] }, "gluglu": { name: "Gluglu", animals: [{ slug: "peru_selvagem", gender: "macho" },{ slug: "peru_selvagem", gender: "femea" },{ slug: "peru_selvagem", gender: "femea" }] }, "lanchinho_de_tigre": { name: "Lanchinho de Tigre", animals: [{ slug: "tahr", gender: "macho" },{ slug: "tahr", gender: "femea" },{ slug: "tahr", gender: "femea" }] }, "laod_a_lado": { name: "Laod a Lado", animals: [{ slug: "veado_de_cauda_branca", gender: "macho" },{ slug: "veado_de_cauda_branca", gender: "macho" }] }, "lebres_rivais": { name: "Lebres Rivais", animals: [{ slug: "lebre_antílope", gender: "macho" },{ slug: "lebre_antílope", gender: "macho" }] }, "lobo_alfa": { name: "Lobo Alfa", animals: [{ slug: "lobo_cinzento", gender: "macho" },{ slug: "lobo_cinzento", gender: "femea" },{ slug: "lobo_cinzento", gender: "femea" }] }, "marujos_de_agua_doce": { name: "Marujos de Água Doce", animals: [{ slug: "faisão_de_pescoço_anelado", gender: "macho" },{ slug: "tetraz_grande", gender: "macho" },{ slug: "ganso_bravo", gender: "macho" },{ slug: "ganso_campestre_da_tundra", gender: "macho" }] }, "necessidades_basicas": { name: "Necessidades Básicas", animals: [{ slug: "urso_negro", gender: "macho" },{ slug: "urso_negro", gender: "macho" }] }, "o_grand_slam": { name: "O Grand Slam", animals: [{ slug: "ibex_de_beceite", gender: "macho" },{ slug: "ibex_de_gredos", gender: "macho" },{ slug: "ibex_de_ronda", gender: "macho" },{ slug: "ibex_espanhol_do_sudeste", gender: "macho" }] }, "operador_suave": { name: "Operador Suave", animals: [{ slug: "tetraz_grande", gender: "macho" },{ slug: "tetraz_grande", gender: "femea" },{ slug: "tetraz_grande", gender: "femea" }] }, "os_tres_patinhos": { name: "Os Três Patinhos", animals: [{ slug: "piadeira", gender: "macho" },{ slug: "zarro_castanho", gender: "macho" },{ slug: "frisada", gender: "macho" }] }, "parceiros_no_crime": { name: "Parceiros no Crime", animals: [{ slug: "raposa_vermelha", gender: "macho" },{ slug: "raposa_vermelha", gender: "macho" }] }, "presas_a_mostra": { name: "Presas à Mostra", animals: [{ slug: "mouflão_ibérico", gender: "macho" },{ slug: "lobo_ibérico", gender: "macho" },{ slug: "lobo_ibérico", gender: "macho" },{ slug: "lobo_ibérico", gender: "macho" }] }, "procos_do_mato_em_conflito": { name: "Procos-do-Mato em Conflito", animals: [{ slug: "caititu", gender: "macho" },{ slug: "caititu", gender: "macho" }] }, "ramboru": { name: "Ramboru", animals: [{ slug: "canguru_cinzento_oriental", gender: "macho" },{ slug: "canguru_cinzento_oriental", gender: "macho" }] }, "raposas_adversarias": { name: "Raposas Adversárias", animals: [{ slug: "raposa_vermelha", gender: "macho" },{ slug: "raposa_cinzenta", gender: "macho" }] }, "realeza": { name: "Realeza", animals: [{ slug: "leão", gender: "macho" },{ slug: "leão", gender: "femea" }] }, "rixa_de_aves": { name: "Rixa de Aves", animals: [{ slug: "galo_lira", gender: "macho" },{ slug: "galo_lira", gender: "macho" }] }, "saindo_de_fininho": { name: "Saindo de Fininho", animals: [{ slug: "pato_real", gender: "macho" },{ slug: "pato_olho_de_ouro", gender: "macho" },{ slug: "zarro_negrinha", gender: "macho" },{ slug: "marrequinha_comum", gender: "macho" },{ slug: "piadeira", gender: "macho" },{ slug: "zarro_castanho", gender: "macho" },{ slug: "frisada", gender: "macho" }] }, "tahr_angulo_amoroso": { name: "Tahr-ângulo Amoroso", animals: [{ slug: "tigre_de_bengala", gender: "macho" },{ slug: "cervo_do_pântano", gender: "macho" }] }, "treno_vendido_separadamente": { name: "Trenó Vendido Separadamente", animals: [{ slug: "rena_da_montanha", gender: "macho" },{ slug: "rena_da_montanha", gender: "macho" },{ slug: "rena_da_montanha", gender: "macho" }] }, "turma_dos_coelhos": { name: "Turma dos Coelhos", animals: [{ slug: "lebre_da_cauda_branca", gender: "macho" },{ slug: "lebre_da_cauda_branca", gender: "macho" },{ slug: "lebre_da_cauda_branca", gender: "femea" },{ slug: "lebre_da_cauda_branca", gender: "femea" }] }, "um_crocodilo_sortudo": { name: "Um Crocodilo Sortudo", animals: [{ slug: "ganso_pega", gender: "macho" },{ slug: "crocodilo_de_água_salgada", gender: "macho" }] }, "um_par_de_predadores": { name: "Um Par de Predadores", animals: [{ slug: "coiote", gender: "macho" },{ slug: "lince_pardo_do_mexico", gender: "macho" }] }, "vigilancia": { name: "Vigilância", animals: [{ slug: "cudo_menor", gender: "macho" },{ slug: "cudo_menor", gender: "femea" }] }, "viver_amar_lenhar": { name: "Viver, Amar, Lenhar", animals: [{ slug: "castor_norte_americano", gender: "macho" },{ slug: "castor_norte_americano", gender: "femea" }] } };

// --- FUNÇÕES E LÓGICA PRINCIPAL ---
function slugify(texto) { return texto.toLowerCase().replace(/[-\s]+/g, '_').replace(/'/g, ''); }

// Define as categorias e seus ícones
const categorias = {
    pelagens: { title: 'Pelagens Raras', items: items, icon: 'fas fa-paw' },
    diamantes: { title: 'Diamantes', items: items, icon: 'fas fa-gem' },
    greats: { title: 'Great Ones', items: ["Alce", "Urso Negro", "Veado-Mula", "Veado Vermelho", "Veado-de-cauda-branca", "Raposa Vermelha", "Faisão", "Gamo", "Tahr"], icon: 'fas fa-crown' },
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
    title.textContent = 'Álbum de Caça';
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

        const itemsToRender = (currentTab.items || []).filter(item => typeof item === 'string' && item !== null && item.trim() !== '');

        itemsToRender.sort((a, b) => a.localeCompare(b)).forEach(name => {
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
        hotspot: { title: 'Hotspots', renderFunc: renderHotspotDetailView },
    };
    // Adiciona a aba Great Ones se o animal puder ser um Great One
    if (greatsFursData[slug]) {
        tabs.greats = { title: '<i class="fas fa-crown"></i> Great Ones', renderFunc: renderGreatsDetailView };
    }

    Object.entries(tabs).forEach(([key, value]) => {
        const tab = document.createElement('div');
        tab.className = 'dossier-tab';
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

    const viewArea = document.createElement('div');
    viewArea.className = 'reserve-view-area';
    contentContainer.appendChild(viewArea);

    const toggleButtons = document.createElement('div');
    toggleButtons.className = 'reserve-view-toggle';
    contentContainer.prepend(toggleButtons);

    const btnAnimals = document.createElement('button');
    btnAnimals.textContent = 'Animais da Reserva';
    btnAnimals.className = 'toggle-button active';
    btnAnimals.onclick = () => {
        toggleButtons.querySelectorAll('.toggle-button').forEach(btn => btn.classList.remove('active'));
        btnAnimals.classList.add('active');
        renderAnimalChecklist(viewArea, reserveKey);
    };
    toggleButtons.appendChild(btnAnimals);

    const btnHotspots = document.createElement('button');
    btnHotspots.textContent = 'Mapas de Hotspot';
    btnHotspots.className = 'toggle-button';
    btnHotspots.onclick = () => {
        toggleButtons.querySelectorAll('.toggle-button').forEach(btn => btn.classList.remove('active'));
        btnHotspots.classList.add('active');
        renderHotspotGalleryView(viewArea, reserveKey);
    };
    toggleButtons.appendChild(btnHotspots);

    renderAnimalChecklist(viewArea, reserveKey);
}

// Renderiza a lista de animais com seus progressos
function renderAnimalChecklist(container, reserveKey) {
    container.innerHTML = '';
    const checklistContainer = document.createElement('div');
    checklistContainer.className = 'animal-checklist';
    container.appendChild(checklistContainer);

    const reserve = reservesData[reserveKey];
    const animalNames = reserve.animals
        .map(slug => items.find(item => slugify(item) === slug))
        .filter(name => typeof name === 'string' && name !== null && name.trim() !== '');

    animalNames.sort((a,b) => a.localeCompare(b)).forEach(animalName => {
        const slug = slugify(animalName);
        const totalRares = (rareFursData[slug]?.macho?.length || 0) + (rareFursData[slug]?.femea?.length || 0);
        const collectedRares = Object.values(savedData.pelagens?.[slug] || {}).filter(v => v === true).length;
        const raresPercentage = totalRares > 0 ? (collectedRares / totalRares) * 100 : 0;
        const totalDiamonds = (diamondFursData[slug]?.macho?.length || 0) + (diamondFursData[slug]?.femea?.length || 0);
        const collectedDiamonds = new Set((savedData.diamantes?.[slug] || []).map(t => t.type)).size;
        const diamondsPercentage = totalDiamonds > 0 ? (collectedDiamonds / totalDiamonds) * 100 : 0;
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
}
// Renderiza a galeria de mapas de hotspot para uma reserva
function renderHotspotGalleryView(container, reserveKey) {
    container.innerHTML = '';
    const hotspotGrid = document.createElement('div');
    hotspotGrid.className = 'hotspot-grid';
    container.appendChild(hotspotGrid);

    const reserveAnimals = reservesData[reserveKey]?.animals || [];
    const availableHotspots = reserveAnimals
        .map(slug => ({ slug, name: items.find(item => slugify(item) === slug) }))
        .filter(animal => typeof animal.name === 'string' && animal.name !== null && animalHotspotData[reserveKey]?.[animal.slug]);

    if (availableHotspots.length === 0) {
        hotspotGrid.innerHTML = '<p class="no-data-message">Nenhum mapa de hotspot disponível para esta reserva ainda.</p>';
        return;
    }

    availableHotspots.sort((a, b) => a.name.localeCompare(b.name)).forEach(animal => {
        const slugReserve = slugify(reservesData[reserveKey].name);
        const imagePath = `hotspots/${slugReserve}_${animal.slug}_hotspot.jpg`;

        const card = document.createElement('div');
        card.className = 'hotspot-card';
        card.innerHTML = `
            <img src="${imagePath}" alt="Mapa de Hotspot ${animal.name}" onerror="this.onerror=null;this.src='animais/placeholder.jpg';">
            <div class="info-overlay">
                <span class="animal-name">${animal.name}</span>
                <span class="hotspot-label"><i class="fas fa-map-marker-alt"></i> Hotspot</span>
            </div>
        `;
        card.addEventListener('click', () => renderHotspotDetailModal(reserveKey, animal.slug));
        hotspotGrid.appendChild(card);
    });
}

// Renderiza o modal de detalhes do hotspot
function renderHotspotDetailModal(reserveKey, animalSlug) {
    const hotspotInfo = animalHotspotData[reserveKey]?.[animalSlug];
    const animalName = items.find(item => slugify(item) === animalSlug);
    const reserveName = reservesData[reserveKey].name;

    if (!hotspotInfo) {
        showCustomAlert('Dados de hotspot não encontrados para este animal nesta reserva.', 'Erro');
        return;
    }

    const slugReserve = slugify(reserveName);
    const imagePath = `hotspots/${slugReserve}_${animalSlug}_hotspot.jpg`;
    
    const modal = document.getElementById('image-viewer-modal');
    modal.innerHTML = `
        <span class="modal-close" onclick="closeModal('image-viewer-modal')">&times;</span>
        <div class="hotspot-detail-content">
            <div class="hotspot-image-container">
                <img class="modal-content-viewer" src="${imagePath}" alt="Mapa de Hotspot ${animalName} em ${reserveName}" onerror="this.onerror=null;this.src='animais/placeholder.jpg';">
            </div>
            <div class="hotspot-info-panel">
                <h3>${animalName} - ${reserveName}</h3>
                <div class="info-row"><strong>Pontuação Máxima:</strong> <span>${hotspotInfo.maxScore || 'N/A'}</span></div>
                <div class="info-row"><strong>Estimativa de Peso Máximo:</strong> <span>${hotspotInfo.maxWeightEstimate || 'N/A'}</span></div>
                <div class="info-row"><strong>Potencial Zonas:</strong> <span>${hotspotInfo.drinkZonesPotential || 'N/A'}</span></div>
                <div class="info-row"><strong>Classe:</strong> <span>${hotspotInfo.animalClass || 'N/A'}</span></div>
                <div class="info-row"><strong>Nível Máximo:</strong> <span>${hotspotInfo.maxLevel || 'N/A'}</span></div>
            </div>
        </div>
    `;
    modal.style.display = 'flex';
}

// Renderiza o dossiê de um animal (usado nas reservas), esta função agora será para o DETALHE do animal no dossiê
function renderHotspotDetailView(container, animalName, slug, originReserveKey) {
    container.innerHTML = '';
    const hotspotInfo = animalHotspotData[originReserveKey]?.[slug];

    if (!hotspotInfo) {
        container.innerHTML = '<p class="no-data-message">Nenhum dado de hotspot disponível para este animal nesta reserva.</p>';
        return;
    }

    const slugReserve = slugify(reservesData[originReserveKey].name);
    const imagePath = `hotspots/${slugReserve}_${slug}_hotspot.jpg`;
    
    container.innerHTML = `
        <div class="hotspot-dossier-card">
            <div class="hotspot-dossier-image-wrapper">
                 <img src="${imagePath}" alt="Mapa de Hotspot ${animalName}" onerror="this.onerror=null;this.src='animais/placeholder.jpg';" class="hotspot-dossier-image">
            </div>
            <div class="hotspot-dossier-info">
                <div class="info-row"><strong>Pontuação Máxima:</strong> <span>${hotspotInfo.maxScore || 'N/A'}</span></div>
                <div class="info-row"><strong>Estimativa de Peso Máximo:</strong> <span>${hotspotInfo.maxWeightEstimate || 'N/A'}</span></div>
                <div class="info-row"><strong>Potencial Zonas:</strong> <span>${hotspotInfo.drinkZonesPotential || 'N/A'}</span></div>
                <div class="info-row"><strong>Classe:</strong> <span>${hotspotInfo.animalClass || 'N/A'}</span></div>
                <div class="info-row"><strong>Nível Máximo:</strong> <span>${hotspotInfo.maxLevel || 'N/A'}</span></div>
            </div>
        </div>
        <button class="fullscreen-btn hotspot-fullscreen back-button" onclick="openImageViewer('${imagePath}')" title="Ver mapa em tela cheia">Ver mapa em tela cheia</button>
    `;
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
function renderRareFursDetailView(container, name, slug, originReserveKey = null) {
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
function renderSuperRareDetailView(container, name, slug, originReserveKey = null) {
    container.innerHTML = '';
    const furGrid = document.createElement('div');
    furGrid.className = 'fur-grid';
    container.appendChild(furGrid);

    const speciesRareFurs = rareFursData[slug];
    const speciesDiamondData = diamondFursData[slug];

    const fursToDisplay = [];

    const canBeDiamondMacho = (speciesDiamondData?.macho?.length || 0) > 0;
    const canBeDiamondFemea = (speciesDiamondData?.femea?.length || 0) > 0;

    if (speciesRareFurs?.macho && canBeDiamondMacho) {
        speciesRareFurs.macho.forEach(rareFur => {
            fursToDisplay.push({ displayName: `Macho ${rareFur}`, originalName: rareFur, gender: 'macho' });
        });
    }

    if (speciesRareFurs?.femea && canBeDiamondFemea) {
        speciesRareFurs.femea.forEach(rareFur => {
            fursToDisplay.push({ displayName: `Fêmea ${rareFur}`, originalName: rareFur, gender: 'femea' });
        });
    }

    if (fursToDisplay.length === 0) {
        furGrid.innerHTML = '<p>Nenhuma pelagem Super Rara (rara + diamante) encontrada para este animal.</p>';
        return;
    }

    fursToDisplay.sort((a, b) => a.displayName.localeCompare(b.displayName)).forEach(furInfo => {
        const furCard = document.createElement('div');
        const keyInSavedData = furInfo.displayName;
        const isCompleted = savedData.super_raros?.[slug]?.[keyInSavedData] === true;
        furCard.className = `fur-card ${isCompleted ? 'completed' : 'incomplete'} potential-super-rare`;

        const furSlug = slugify(furInfo.originalName);
        const genderSlug = furInfo.gender.toLowerCase();

        furCard.innerHTML = `<img src="animais/pelagens/${slug}_${furSlug}_${genderSlug}.png" onerror="this.onerror=null; this.src='animais/pelagens/${slug}_${furSlug}.png'; this.onerror=null; this.src='animais/${slug}.png';"><div class="info">${furInfo.displayName}</div><button class="fullscreen-btn" onclick="openImageViewer(this.closest('.fur-card').querySelector('img').src); event.stopPropagation();" title="Ver em tela cheia">⛶</button>`;

        furCard.addEventListener('click', () => {
            if (!savedData.super_raros) savedData.super_raros = {};
            if (!savedData.super_raros[slug]) savedData.super_raros[slug] = {};
            const currentState = savedData.super_raros[slug][keyInSavedData] || false;
            savedData.super_raros[slug][keyInSavedData] = !currentState;
            saveData(savedData);
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
function renderDiamondsDetailView(container, name, slug, originReserveKey = null) {
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
        const highestScoreTrophy = (savedData.diamantes?.[slug] || []).filter(t => t.type === fullTrophyName).reduce((max, t) => t.score > max.score ? t : max, { score: -1 });
        const isCompleted = highestScoreTrophy.score !== -1;
        furCard.classList.add(isCompleted ? 'completed' : 'incomplete');
        const furSlug = slugify(furInfo.originalName), genderSlug = furInfo.gender.toLowerCase();
        furCard.innerHTML = `<img src="animais/pelagens/${slug}_${furSlug}_${genderSlug}.png" onerror="this.onerror=null; this.src='animais/pelagens/${slug}_${furSlug}.png'; this.onerror=null; this.src='animais/${slug}.png';"><div class="info-header"><span class="gender-tag">${furInfo.gender}</span><div class="info">${furInfo.displayName}</div></div><div class="score-container">${isCompleted ? `<span class="score-display"><i class="fas fa-trophy"></i> ${highestScoreTrophy.score}</span>` : '<span class="score-add-btn">Adicionar Pontuação</span>'}</div><button class="fullscreen-btn" onclick="openImageViewer(this.closest('.fur-card').querySelector('img').src); event.stopPropagation();" title="Ver em tela cheia">⛶</button>`;

        const scoreContainer = furCard.querySelector('.score-container');
        scoreContainer.addEventListener('click', e => {
            e.stopPropagation();
            if (scoreContainer.querySelector('input')) return;

            const currentScore = isCompleted ? highestScoreTrophy.score : '';
            scoreContainer.innerHTML = `<input type="number" class="score-input" value="${currentScore}" placeholder="0.0">`;
            const input = scoreContainer.querySelector('.score-input');
            input.focus();
            input.select();

            const saveScore = () => {
                const scoreValue = parseFloat(input.value);
                if (!savedData.diamantes) savedData.diamantes = {};
                if (!Array.isArray(savedData.diamantes[slug])) savedData.diamantes[slug] = [];

                let otherTrophies = savedData.diamantes[slug].filter(t => t.type !== fullTrophyName);

                if (!isNaN(scoreValue) && scoreValue > 0) {
                    otherTrophies.push({ id: Date.now(), type: fullTrophyName, score: scoreValue });
                }

                savedData.diamantes[slug] = otherTrophies;
                saveData(savedData);
                if (originReserveKey) {
                    renderAnimalDossier(name, originReserveKey);
                } else {
                    renderDiamondsDetailView(container, name, slug);
                }
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
function renderGreatsDetailView(container, animalName, slug, originReserveKey = null) {
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
        
        const imagePath = `animais/pelagens/great_${slug}_${furSlug}.png`;
        const fallbackImagePath = `animais/${slug}.png`;

        furCard.innerHTML = `
            <img src="${imagePath}" alt="${furName}" onerror="this.onerror=null; this.src='${fallbackImagePath}';">
            <div class="info-plaque">
                <div class="info">${furName}</div>
                <div class="kill-counter"><i class="fas fa-trophy"></i> x${trophies.length}</div>
            </div>
            <button class="fullscreen-btn" onclick="openImageViewer(this.closest('.fur-card').querySelector('img').src); event.stopPropagation();" title="Ver em tela cheia">⛶</button>
        `;
        furCard.addEventListener('click', () => openGreatsTrophyModal(animalName, slug, furName, originReserveKey));
        furGrid.appendChild(furCard);
    });
}
// Abre o modal de troféus de Great Ones
async function openGreatsTrophyModal(animalName, slug, furName, originReserveKey = null) {
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
                        if (originReserveKey) {
                            renderAnimalDossier(animalName, originReserveKey);
                        } else {
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
            if (originReserveKey) {
                renderAnimalDossier(animalName, originReserveKey);
            } else {
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
 * Atualiza a aparência de um cartão de animal (completed, inprogress, incomplete)
 */
function updateCardAppearance(card, slug, tabKey) {
    if (!card) return;
    card.classList.remove('completed', 'inprogress', 'incomplete');
    let status = 'incomplete'; 

    let collectedCount = 0;
    let totalCount = 0;

    switch (tabKey) {
        case 'greats':
            const animalData = savedData.greats?.[slug] || {};
            checkAndSetGreatOneCompletion(slug, animalData); 
            const totalGreatFurs = greatsFursData[slug]?.length || 0;

            if (animalData.completo) {
                status = 'completed';
            } else {
                const collectedFurs = animalData.furs ? Object.values(animalData.furs).filter(fur => fur.trophies?.length > 0).length : 0;
                if (collectedFurs > 0 && collectedFurs < totalGreatFurs) {
                    status = 'inprogress';
                }
            }
            break;

        case 'diamantes':
            const collectedDiamondTrophies = savedData.diamantes?.[slug] || [];
            collectedCount = new Set(collectedDiamondTrophies.map(t => t.type)).size; 

            const speciesDiamondData = diamondFursData[slug];
            if (speciesDiamondData) {
                totalCount = (speciesDiamondData.macho?.length || 0) + (speciesDiamondData.femea?.length || 0);
                if (totalCount > 0 && collectedCount === totalCount) {
                    status = 'completed';
                } else if (collectedCount > 0 && collectedCount < totalCount) {
                    status = 'inprogress';
                }
            }
            break;

        case 'super_raros':
            const collectedSuperRares = savedData.super_raros?.[slug] || {};
            collectedCount = Object.values(collectedSuperRares).filter(v => v === true).length;

            const speciesRareFursForSuper = rareFursData[slug];
            const speciesDiamondFursForSuper = diamondFursData[slug];

            if (speciesRareFursForSuper) {
                let possibleSuperRares = 0;
                if (speciesRareFursForSuper.macho && (speciesDiamondFursForSuper?.macho?.length || 0) > 0) {
                    possibleSuperRares += speciesRareFursForSuper.macho.length;
                }
                if (speciesRareFursForSuper.femea && (speciesDiamondFursForSuper?.femea?.length || 0) > 0) {
                    possibleSuperRares += speciesRareFursForSuper.femea.length;
                }
                totalCount = possibleSuperRares;

                if (totalCount > 0 && collectedCount === totalCount) {
                    status = 'completed';
                } else if (collectedCount > 0 && collectedCount < totalCount) {
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
                if (totalCount > 0 && collectedCount === totalCount) {
                    status = 'completed';
                } else if (collectedCount > 0 && collectedCount < totalCount) {
                    status = 'inprogress';
                }
            }
            break;
    }
    
    card.classList.add(status);
}

// =================================================================
// ============== FUNÇÃO DE CÁLCULO DE PROGRESSO GERAL ==============
// =================================================================

function calcularOverallProgress() {
    const progress = {
        collectedRares: 0,
        totalRares: 0,
        collectedDiamonds: 0,
        totalDiamonds: 0,
        collectedGreatOnes: 0,
        totalGreatOnes: 0,
        collectedSuperRares: 0,
        totalSuperRares: 0,
        collectedHotspots: 0,
        totalHotspots: 0
    };

    const allAnimalSlugs = [...new Set(Object.keys(rareFursData).concat(Object.keys(diamondFursData)))];

    allAnimalSlugs.forEach(slug => {
        if (rareFursData[slug]) {
            progress.totalRares += (rareFursData[slug].macho?.length || 0) + (rareFursData[slug].femea?.length || 0);
        }
        progress.collectedRares += Object.values(savedData.pelagens?.[slug] || {}).filter(v => v === true).length;

        if (diamondFursData[slug]) {
            progress.totalDiamonds += (diamondFursData[slug].macho?.length || 0) + (diamondFursData[slug].femea?.length || 0);
        }
        progress.collectedDiamonds += new Set((savedData.diamantes?.[slug] || []).map(t => t.type)).size;

        if (greatsFursData[slug]) {
            progress.totalGreatOnes += greatsFursData[slug].length;
            progress.collectedGreatOnes += Object.values(savedData.greats?.[slug]?.furs || {}).filter(f => f.trophies?.length > 0).length;
        }

        const speciesRareFurs = rareFursData[slug];
        const speciesDiamondFurs = diamondFursData[slug];
        if (speciesRareFurs) {
            if (speciesRareFurs.macho && (speciesDiamondFurs?.macho?.length || 0) > 0) {
                progress.totalSuperRares += speciesRareFurs.macho.length;
            }
            if (speciesRareFurs.femea && (speciesDiamondFurs?.femea?.length || 0) > 0) {
                progress.totalSuperRares += speciesRareFurs.femea.length;
            }
        }
        progress.collectedSuperRares += Object.values(savedData.super_raros?.[slug] || {}).filter(v => v === true).length;
    });
    
    progress.totalHotspots = Object.values(animalHotspotData).reduce((acc, reserve) => acc + Object.keys(reserve).length, 0);

    return progress;
}

// Renderiza o visualização do painel de progresso
function renderProgressView(container) {
    container.innerHTML = ''; // Limpa o container
    const wrapper = document.createElement('div');
    wrapper.className = 'progress-view-container';
    wrapper.id = 'progress-panel-main-container';

    // -- PAINEL DE CONQUISTAS --
    wrapper.appendChild(createLatestAchievementsPanel());

    // -- BOTÕES DE NAVEGAÇÃO --
    const viewToggleButtons = document.createElement('div');
    viewToggleButtons.className = 'reserve-view-toggle'; // Reutilizando estilo

    const showProgressBtn = document.createElement('button');
    showProgressBtn.textContent = 'Ver Progresso Geral';
    showProgressBtn.className = 'toggle-button';

    const showRankingBtn = document.createElement('button');
    showRankingBtn.textContent = 'Ver Classificação de Caça';
    showRankingBtn.className = 'toggle-button';

    viewToggleButtons.appendChild(showProgressBtn);
    viewToggleButtons.appendChild(showRankingBtn);
    wrapper.appendChild(viewToggleButtons);

    // -- ÁREA DE CONTEÚDO DINÂMICO --
    const contentArea = document.createElement('div');
    contentArea.id = "progress-content-area";
    wrapper.appendChild(contentArea);
    
    // Função para renderizar o novo painel de progresso
    const showNewProgressPanel = () => {
        showProgressBtn.classList.add('active');
        showRankingBtn.classList.remove('active');
        updateNewProgressPanel(contentArea); // Chama a nova função de renderização
    };

    showProgressBtn.onclick = showNewProgressPanel;

    showRankingBtn.onclick = () => {
        showRankingBtn.classList.add('active');
        showProgressBtn.classList.remove('active');
        renderHuntingRankingView(contentArea);
    };

    // -- BOTÕES DE BACKUP/RESTAURAÇÃO --
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
            savedData = getDefaultDataStructure();
            saveData(savedData);
            location.reload();    
        }
    };
    
    container.appendChild(wrapper);
    container.appendChild(resetButton);

    // Mostra o novo painel de progresso por padrão
    showNewProgressPanel(); 
}

/**
 * ATUALIZAÇÃO: Nova função para renderizar o painel de progresso com design 2.0
 * @param {HTMLElement} container O elemento onde o painel será renderizado.
 */
function updateNewProgressPanel(container) {
    container.innerHTML = ''; // Limpa a área de conteúdo

    const panel = document.createElement('div');
    panel.id = 'progress-panel-v2';
    
    const overallProgress = calcularOverallProgress();

    // -- SEÇÃO DE MEDIDORES GERAIS --
    const overallSection = document.createElement('div');
    overallSection.innerHTML = `
        <div class="progress-v2-header">
            <h3>Progresso Geral do Caçador</h3>
            <p>Sua jornada de caça em um piscar de olhos.</p>
        </div>
    `;
    const overallGrid = document.createElement('div');
    overallGrid.className = 'overall-progress-grid';

    const categories = [
        { key: 'rares', label: 'Pelagens Raras', collected: overallProgress.collectedRares, total: overallProgress.totalRares },
        { key: 'diamonds', label: 'Diamantes', collected: overallProgress.collectedDiamonds, total: overallProgress.totalDiamonds },
        { key: 'greats', label: 'Great Ones', collected: overallProgress.collectedGreatOnes, total: overallProgress.totalGreatOnes },
        { key: 'super_raros', label: 'Super Raros', collected: overallProgress.collectedSuperRares, total: overallProgress.totalSuperRares }
    ];

    categories.forEach(cat => {
        const percentage = cat.total > 0 ? Math.round((cat.collected / cat.total) * 100) : 0;
        const radius = 54;
        const circumference = 2 * Math.PI * radius;
        const offset = circumference - (percentage / 100) * circumference;

        const card = document.createElement('div');
        card.className = `progress-dial-card ${cat.key}`;
        card.innerHTML = `
            <div class="progress-dial">
                <svg viewBox="0 0 120 120">
                    <circle class="progress-dial-bg" cx="60" cy="60" r="${radius}"></circle>
                    <circle class="progress-dial-value" cx="60" cy="60" r="${radius}"
                            stroke-dasharray="${circumference}"
                            stroke-dashoffset="${offset}"></circle>
                </svg>
                <div class="progress-dial-percentage">${percentage}%</div>
            </div>
            <div class="progress-dial-label">${cat.label}</div>
            <div class="progress-dial-counts">${cat.collected} / ${cat.total}</div>
        `;
        overallGrid.appendChild(card);
    });
    
    overallSection.appendChild(overallGrid);
    panel.appendChild(overallSection);

    // -- SEÇÃO DE PROGRESSO POR RESERVA --
    const reservesSection = document.createElement('div');
    reservesSection.innerHTML = `
        <div class="progress-v2-header">
            <h3>Domínio das Reservas</h3>
            <p>Seu progresso em cada território de caça.</p>
        </div>
    `;
    const reservesGrid = document.createElement('div');
    reservesGrid.className = 'reserve-progress-container';

    Object.entries(reservesData).sort(([, a], [, b]) => a.name.localeCompare(b.name)).forEach(([reserveKey, reserve]) => {
        const reserveProgress = calcularReserveProgress(reserveKey);
        const totalItems = reserveProgress.totalRares + reserveProgress.totalDiamonds + reserveProgress.totalGreatOnes;
        const collectedItems = reserveProgress.collectedRares + reserveProgress.collectedDiamonds + reserveProgress.collectedGreatOnes;
        const percentage = totalItems > 0 ? Math.round((collectedItems / totalItems) * 100) : 0;

        if (totalItems > 0) {
            const card = document.createElement('div');
            card.className = 'reserve-progress-card';
            card.innerHTML = `
                <div class="reserve-progress-header">
                    <img src="${reserve.image.replace('.png', '_logo.png')}" onerror="this.style.display='none'">
                    <span>${reserve.name}</span>
                </div>
                <div class="reserve-progress-bar-area">
                    <div class="reserve-progress-bar-bg">
                        <div class="reserve-progress-bar-fill" style="width: ${percentage}%"></div>
                    </div>
                    <div class="reserve-progress-details">
                        <span>${collectedItems} / ${totalItems} Coletados</span>
                        <span>${percentage}% Completo</span>
                    </div>
                </div>
            `;
            reservesGrid.appendChild(card);
        }
    });
    
    reservesSection.appendChild(reservesGrid);
    panel.appendChild(reservesSection);

    container.appendChild(panel);
}

// Cria o painel de últimas conquistas
function createLatestAchievementsPanel() {
    const panel = document.createElement('div');
    panel.className = 'latest-achievements-panel';
    panel.innerHTML = '<h3><i class="fas fa-star"></i> Últimas Conquistas</h3>';

    const grid = document.createElement('div');
    grid.className = 'achievements-grid';

    const allTrophies = [];
    if(savedData.diamantes) {
        Object.entries(savedData.diamantes).forEach(([slug, trophies]) => {
            const animalName = items.find(i => slugify(i) === slug) || slug;
            trophies.forEach(trophy => allTrophies.push({ id: trophy.id, animalName, furName: trophy.type, slug, type: 'diamante' }));
        });
    }
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
        allTrophies.sort((a, b) => b.id - a.id).slice(0, 4).forEach(trophy => {
            const card = document.createElement('div');
            card.className = 'achievement-card';
            const rotation = Math.random() * 6 - 3;
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
                imagePathString = `src="${specificPath}" onerror="this.onerror=null; this.src='${neutralPath}'; this.onerror=null; this.src='${basePath}'; this.onerror=null; this.src='animais/placeholder.jpg';"`;
            } else if (trophy.type === 'greatone') {
                const furSlug = slugify(trophy.furName);
                const specificPath = `animais/pelagens/great_${animalSlug}_${furSlug}.png`;
                const basePath = `animais/${animalSlug}.png`;
                imagePathString = `src="${specificPath}" onerror="this.onerror=null; this.src='${basePath}'; this.onerror=null; this.src='animais/placeholder.jpg';"`;
            } else {
                imagePathString = `src="animais/${animalSlug}.jpg" onerror="this.onerror=null;this.src='animais/placeholder.jpg';"`;
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

// Abre o visualizador de imagens em tela cheia
function openImageViewer(imageUrl) {
    const modal = document.getElementById('image-viewer-modal');
    modal.innerHTML = `
        <span class="modal-close" onclick="closeModal('image-viewer-modal')">&times;</span>
        <img class="modal-content-viewer" src="${imageUrl}" alt="Imagem em tela cheia">
    `;
    const modalImg = modal.querySelector('.modal-content-viewer');
    if (modalImg) {
        modalImg.style.maxWidth = '90%';
        modalImg.style.maxHeight = '90%';
        modalImg.style.objectFit = 'contain';
    }
    modal.style.display = "flex";
}

// Fecha um modal
function closeModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
        modal.style.display = "none";
    }
}

// Função para exibir um modal customizado de alerta/confirmação
function showCustomAlert(message, title = 'Aviso', isConfirm = false) {
    const modal = document.getElementById('custom-alert-modal');
    const modalTitle = document.getElementById('custom-alert-title');
    const modalMessage = document.getElementById('custom-alert-message');
    const okBtn = document.getElementById('custom-alert-ok-btn');
    const cancelBtn = document.getElementById('custom-alert-cancel-btn');

    modalTitle.textContent = title;
    modalMessage.textContent = message;

    return new Promise((resolve) => {
        okBtn.onclick = () => {
            modal.style.display = 'none';
            resolve(true);
        };

        if (isConfirm) {
            cancelBtn.style.display = 'inline-block';
            cancelBtn.onclick = () => {
                modal.style.display = 'none';
                resolve(false);
            };
        } else {
            cancelBtn.style.display = 'none';
        }

        modal.style.display = 'flex';
    });
}
// Obtém o inventário completo de troféus para montagens múltiplas
function getCompleteTrophyInventory() {
    const inventory = [];

    if (savedData.pelagens) {
        for (const slug in savedData.pelagens) {
            for (const furName in savedData.pelagens[slug]) {
                if (savedData.pelagens[slug][furName] === true) {
                    const gender = furName.toLowerCase().startsWith('macho') ? 'macho' : 'femea';
                    const pureFur = furName.replace(/^(macho|fêmea)\s/i, '').trim();
                    inventory.push({ slug, gender, type: 'Pelagem Rara', detail: pureFur });
                }
            }
        }
    }

    if (savedData.diamantes) {
        for (const slug in savedData.diamantes) {
            savedData.diamantes[slug].forEach(trophy => {
                const gender = trophy.type.toLowerCase().startsWith('macho') ? 'macho' : 'femea';
                inventory.push({ slug, gender, type: 'Diamante', detail: `Pontuação ${trophy.score}` });
            });
        }
    }

    if (savedData.super_raros) {
        for (const slug in savedData.super_raros) {
            for (const furName in savedData.super_raros[slug]) {
                if (savedData.super_raros[slug][furName] === true) {
                    const gender = furName.toLowerCase().startsWith('macho') ? 'macho' : 'femea';
                    const pureFur = furName.replace(/^(macho|fêmea)\s/i, '').trim();    
                    inventory.push({ slug, gender, type: 'Super Raro', detail: pureFur });
                }
            }
        }
    }

    if (savedData.greats) {
        for (const slug in savedData.greats) {
            if (savedData.greats[slug].furs) {
                for (const furName in savedData.greats[slug].furs) {
                    if (savedData.greats[slug].furs[furName].trophies?.length > 0) {
                        savedData.greats[slug].furs[furName].trophies.forEach(trophy => {
                            inventory.push({ slug, gender: 'macho', type: 'Grande', detail: furName });
                        });
                    }
                }
            }
        }
    }
    return inventory;
}

// Verifica os requisitos de uma montagem múltipla
function checkMountRequirements(requiredAnimals) {
    const inventory = getCompleteTrophyInventory();
    const fulfillmentRequirements = [];
    let isComplete = true;

    const availableInventory = [...inventory];

    for (const requirement of requiredAnimals) {
        let fulfilled = false;
        let fulfillmentTrophy = null;

        const foundIndex = availableInventory.findIndex(trophy =>
            trophy.slug === requirement.slug &&
            trophy.gender === requirement.gender
        );

        if (foundIndex !== -1) {
            fulfilled = true;
            fulfillmentTrophy = availableInventory[foundIndex];
            availableInventory.splice(foundIndex, 1);
        } else {
            isComplete = false;
        }
        fulfillmentRequirements.push({ met: fulfilled, requirement: requirement, trophy: fulfillmentTrophy });
    }
    return { isComplete, fulfillmentRequirements };
}

// Renderiza a visualização de montagens múltiplas
function renderMultiMountsView(container) {
    container.innerHTML = '';
    const grid = document.createElement('div');
    grid.className = 'mounts-grid';
    container.appendChild(grid);

    const sortedMounts = Object.entries(multiMountsData).sort((a, b) => a[1].name.localeCompare(b[1].name));

    sortedMounts.forEach(([mountKey, mount]) => {
        const status = checkMountRequirements(mount.animals);
        const progressCount = status.fulfillmentRequirements.filter(r => r.met).length;

        const card = document.createElement('div');
        card.className = `mount-card ${status.isComplete ? 'completed' : 'incomplete'}`;
        card.dataset.mountKey = mountKey;

        let animalsHTML = '<div class="mount-card-animals">';
        mount.animals.forEach(animal => {
            animalsHTML += `<img src="animais/${animal.slug}.png" title="${animal.slug}" onerror="this.style.display='none'">`;
        });
        animalsHTML += '</div>';

        card.innerHTML = `
            <div class="mount-card-header">
                <h3>${mount.name}</h3>
                <div class="mount-progress">${progressCount} / ${mount.animals.length}</div>
            </div>
            ${status.isComplete ? '<div class="mount-completed-banner"><i class="fas fa-check"></i></div>' : ''}
        `;
        card.addEventListener('click', () => renderMultiMountDetailModal(mountKey));
        grid.appendChild(card);
    });
}

// Renderiza o modal de detalhes de montagens múltiplas
function renderMultiMountDetailModal(mountKey) {
    const mount = multiMountsData[mountKey];
    if (!mount) return;

    const status = checkMountRequirements(mount.animals);

    const modal = document.getElementById('form-modal');
    modal.innerHTML = '';
    modal.className = 'modal-overlay form-modal';

    const modalContent = document.createElement('div');
    modalContent.className = 'modal-content-box';
    modalContent.innerHTML = `<h3><i class="fas fa-trophy"></i> Detalhes: ${mount.name}</h3>`;

    const detailList = document.createElement('ul');
    detailList.className = 'mount-detail-list';

    status.fulfillmentRequirements.forEach(fulfillment => {
        const req = fulfillment.requirement;
        const trophy = fulfillment.trophy;
        const animalName = items.find(item => slugify(item) === req.slug) || req.slug;
        const genderIcon = req.gender === 'macho' ? 'fa-mars' : 'fa-venus';

        const li = document.createElement('li');
        li.className = 'mount-detail-item';

        let bodyHTML = '';
        if (fulfillment.met) {
            bodyHTML = `<div class="detail-item-body"><i class="fas fa-check-circle"></i> Obtido com: <strong>${trophy.type}</strong> (${trophy.detail})</div>`;
        } else {
            bodyHTML = `<div class="detail-item-body"><i class="fas fa-times-circle"></i> Pendente</div>`;
        }

        li.innerHTML = `
            <div class="detail-item-header">
                <i class="fas ${genderIcon}"></i><span>${animalName}</span>
            </div>
            ${bodyHTML}
        `;
        detailList.appendChild(li);
    });

    modalContent.appendChild(detailList);

    const buttonsDiv = document.createElement('div');
    buttonsDiv.className = 'modal-buttons';
    const closeBtn = document.createElement('button');
    closeBtn.className = 'back-button';
    closeBtn.textContent = 'Fechar';
    closeBtn.onclick = () => closeModal('form-modal');
    buttonsDiv.appendChild(closeBtn);
    modalContent.appendChild(buttonsDiv);
    modal.appendChild(modalContent);

    modal.style.display = 'flex';
}
// --- FUNÇÕES CONTADOR DE GRIND ---
function renderGrindHubView(container) {
    container.innerHTML = `<div class="grind-hub-container"></div>`;
    const hubContainer = container.querySelector('.grind-hub-container');

    const newGrindButton = document.createElement('div');
    newGrindButton.className = 'new-grind-btn';
    newGrindButton.innerHTML = `<i class="fas fa-plus-circle"></i><span>Iniciar Novo Grind</span>`;
    newGrindButton.onclick = () => renderNewGrindAnimalSelection(container);
    hubContainer.appendChild(newGrindButton);

    const existingGrindsTitle = document.createElement('h3');
    existingGrindsTitle.className = 'existing-grinds-title';
    existingGrindsTitle.innerHTML = '<i class="fas fa-history"></i> Grinds em Andamento';
    hubContainer.appendChild(existingGrindsTitle);

    const grid = document.createElement('div');
    grid.className = 'grinds-grid';
    hubContainer.appendChild(grid);

    if (savedData.grindSessions && savedData.grindSessions.length > 0) {
        savedData.grindSessions.forEach(session => {
            const reserve = reservesData[session.reserveKey];
            const animalName = items.find(item => slugify(item) === session.animalSlug);
            const counts = session.counts;

            const card = document.createElement('div');
            card.className = 'grind-card';
            card.addEventListener('click', () => renderGrindCounterView(session.id));
            card.innerHTML = `
                <img src="animais/${session.animalSlug}.png" class="grind-card-bg-silhouette" onerror="this.style.display='none'">
                <div class="grind-card-content">
                    <div class="grind-card-header">
                        <span class="grind-card-animal-name">${animalName}</span>
                        <span class="grind-card-reserve-name"><i class="fas fa-map-marker-alt"></i> ${reserve.name}</span>
                    </div>
                    <div class="grind-card-stats-grid">
                        <div class="grind-stat">
                            <i class="fas fa-crosshairs"></i>
                            <span>${counts.total || 0}</span>
                        </div>
                        <div class="grind-stat">
                            <i class="fas fa-gem"></i>
                            <span>${counts.diamonds || 0}</span>
                        </div>
                        <div class="grind-stat">
                            <i class="fas fa-paw"></i>
                            <span>${counts.rares?.length || 0}</span>
                        </div>
                    </div>
                </div>
            `;
            grid.appendChild(card);
        });
    } else {
        grid.innerHTML = '<p class="no-grinds-message">Nenhum grind iniciado. Clique no botão acima para começar!</p>';
    }
}

// Renderiza a seleção de animais para um novo grind
function renderNewGrindAnimalSelection(container) {
    container.innerHTML = '<h2>Selecione um Animal para o Novo Grind</h2>';

    const filterInput = document.createElement('input');
    filterInput.type = 'text';
    filterInput.className = 'filter-input';
    filterInput.placeholder = 'Buscar animal...';
    container.appendChild(filterInput);

    const albumGrid = document.createElement('div');
    albumGrid.className = 'album-grid';
    container.appendChild(albumGrid);

    (items || []).sort((a, b) => a.localeCompare(b)).forEach(name => {
        const slug = slugify(name);
        const card = document.createElement('div');
        card.className = 'animal-card';
        card.innerHTML = `<img src="animais/${slug}.png" alt="${name}" onerror="this.onerror=null;this.src='animais/placeholder.png';"><div class="info">${name}</div>`;
        card.addEventListener('click', () => renderReserveSelectionForGrind(container, slug));
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

// Renderiza a seleção de reserva para um novo grind
async function renderReserveSelectionForGrind(container, animalSlug) {
    const animalName = items.find(item => slugify(item) === animalSlug);
    container.innerHTML = `<h2>Onde você vai grindar ${animalName}?</h2>`;

    const grid = document.createElement('div');
    grid.className = 'reserves-grid';
    container.appendChild(grid);

    const availableReserves = Object.entries(reservesData).filter(([, reserveData]) => reserveData.animals.includes(animalSlug)).sort(([, a], [, b]) => a.name.localeCompare(b.name));

    if (availableReserves.length === 0) {
        grid.innerHTML = `<p class="no-grinds-message">Nenhuma reserva encontrada para caçar ${animalName}.</p>`;
        return;
    }

    for (const [reserveKey, reserve] of availableReserves) {
        const card = document.createElement('div');
        card.className = 'reserve-card';
        card.innerHTML = `
            <div class="reserve-image-container">
                <img class="reserve-card-image" src="${reserve.image}" onerror="this.style.display='none'">
            </div>
            <div class="reserve-card-info-panel">
                <img src="${reserve.image.replace('.png', '_logo.png')}" class="reserve-card-logo" alt="${reserve.name}" onerror="this.style.display='none'">
            </div>
        `;
        card.addEventListener('click', async () => {
            const existingSession = savedData.grindSessions.find(s => s.animalSlug === animalSlug && s.reserveKey === reserveKey);
            if(existingSession) {
                await showCustomAlert('Um grind para este animal nesta reserva já existe. Abrindo o grind existente.');
                renderGrindCounterView(existingSession.id);
                return;
            }
            const newSessionId = `grind_${Date.now()}`;
            const newSession = { id: newSessionId, animalSlug: animalSlug, reserveKey: reserveKey, counts: { total: 0, diamonds: 0, trolls: 0, rares: [], super_rares: [], great_ones: [] } };
            savedData.grindSessions.push(newSession);
            saveData(savedData);
            renderGrindCounterView(newSessionId);
        });
        grid.appendChild(card);
    }
}

// Renderiza a visualização do contador de grind
async function renderGrindCounterView(sessionId) {
    const session = savedData.grindSessions.find(s => s.id === sessionId);
    if (!session) { console.error("Sessão de grind não encontrada!", sessionId); renderMainView('grind'); return; }

    const counts = {
        total: session.counts.total || 0,
        diamonds: session.counts.diamonds || 0,
        trolls: session.counts.trolls || 0,
        rares: session.counts.rares || [],
        super_rares: session.counts.super_rares || [],
        great_ones: session.counts.great_ones || []
    };
    session.counts = counts;

    const { animalSlug, reserveKey } = session;
    const mainContent = document.querySelector('.main-content');
    const container = mainContent.querySelector('.content-container');
    const animalName = items.find(item => slugify(item) === animalSlug);
    const reserveName = reservesData[reserveKey].name;

    mainContent.querySelector('.page-header h2').textContent = `Contador de Grind`;
    const backButton = mainContent.querySelector('.page-header .back-button');
    backButton.innerHTML = `&larr; Voltar para o Hub de Grind`;
    backButton.onclick = () => renderMainView('grind');

    container.innerHTML = `
        <div class="grind-container">
            <div class="grind-header">
                <div class="grind-header-info">
                    <img src="animais/${animalSlug}.png" class="grind-animal-icon" onerror="this.style.display='none'">
                    <div>
                        <h2>${animalName.toUpperCase()}</h2>
                        <span><i class="fas fa-map-marker-alt"></i> Em ${reserveName}</span>
                    </div>
                </div>
            </div>
            <div class="counters-wrapper">
                <div class="grind-counter-item diamond" data-type="diamonds"><div class="grind-counter-header"><i class="fas fa-gem"></i><span>Diamantes</span></div><div class="grind-counter-body"><button class="grind-counter-btn decrease"><i class="fas fa-minus"></i></button><span class="grind-counter-value">${counts.diamonds}</span><button class="grind-counter-btn increase"><i class="fas fa-plus"></i></button></div></div>
                <div class="grind-counter-item rare" data-type="rares" data-detailed="true"><div class="grind-counter-header"><i class="fas fa-paw"></i><span>Raros</span></div><div class="grind-counter-body"><button class="grind-counter-btn decrease"><i class="fas fa-minus"></i></button><span class="grind-counter-value">${counts.rares.length}</span><button class="grind-counter-btn increase"><i class="fas fa-plus"></i></button></div></div>
                <div class="grind-counter-item troll" data-type="trolls"><div class="grind-counter-header"><i class="fas fa-star-half-alt"></i><span>Trolls</span></div><div class="grind-counter-body"><button class="grind-counter-btn decrease"><i class="fas fa-minus"></i></button><span class="grind-counter-value">${counts.trolls}</span><button class="grind-counter-btn increase"><i class="fas fa-plus"></i></button></div></div>
                <div class="grind-counter-item great-ones" data-type="great_ones" data-detailed="true"><div class="grind-counter-header"><i class="fas fa-crown"></i><span>Great One</span></div><div class="grind-counter-body"><button class="grind-counter-btn decrease"><i class="fas fa-minus"></i></button><span class="grind-counter-value">${counts.great_ones.length}</span><button class="grind-counter-btn increase"><i class="fas fa-plus"></i></button></div></div>
                <div class="grind-counter-item super-rare" data-type="super_rares" data-detailed="true"><div class="grind-counter-header"><i class="fas fa-star"></i><span>Super Raros</span></div><div class="grind-counter-body"><button class="grind-counter-btn decrease"><i class="fas fa-minus"></i></button><span class="grind-counter-value">${counts.super_rares.length}</span><button class="grind-counter-btn increase"><i class="fas fa-plus"></i></button></div></div>
                <div class="grind-counter-item total-kills" data-type="total"><div class="grind-counter-header"><i class="fas fa-crosshairs"></i><span>Total de Abatimentos</span></div><div class="grind-counter-body"><button class="grind-counter-btn decrease"><i class="fas fa-minus"></i></button><span class="grind-counter-value" id="total-kills-value">${counts.total}</span><button class="grind-counter-btn increase"><i class="fas fa-plus"></i></button></div></div>
            </div>
            <button id="delete-grind-btn" class="back-button">Excluir este Grind</button>
        </div>`;

    container.querySelectorAll('.grind-counter-btn').forEach(button => {
        button.addEventListener('click', async (e) => {
            e.stopPropagation();
            const isIncrease = button.classList.contains('increase');
            const counterItem = button.closest('.grind-counter-item');
            const type = counterItem.dataset.type;
            const isDetailed = counterItem.dataset.detailed === 'true';
            const currentSession = savedData.grindSessions.find(s => s.id === sessionId);
            if (!currentSession) return;

            if (isIncrease) {
                if (type === 'total') {
                    currentSession.counts.total++;
                }
                else if (isDetailed) { openGrindDetailModal(sessionId, type); return; }
                else { currentSession.counts[type]++; }
            } else {
                if (type === 'total') { 
                    if (currentSession.counts.total > 0) { currentSession.counts.total--; }
                }
                else if (isDetailed) {
                    if (currentSession.counts[type].length > 0) {
                        const lastItem = currentSession.counts[type][currentSession.counts[type].length - 1];
                        const cleanVariationName = lastItem.variation.replace(/^(Macho|Fêmea)\s|\sDiamante$/gmi, '').trim();
                        if (await showCustomAlert(`Tem certeza que deseja remover o último item registrado: "${cleanVariationName}"?`, 'Confirmar Exclusão', true)) {
                            currentSession.counts[type].pop();
                        }
                    }
                } else {
                    if (currentSession.counts[type] > 0) { currentSession.counts[type]--; }
                }
            }
            saveData(savedData);
            renderGrindCounterView(sessionId);
        });
    });

    const totalKillsValue = container.querySelector('#total-kills-value');
    if (totalKillsValue) {
        totalKillsValue.addEventListener('click', (e) => {
            e.stopPropagation();
            const body = totalKillsValue.parentElement;
            if (body.querySelector('input')) return;

            const currentTotal = session.counts.total || 0;

            body.innerHTML = `
                <button class="grind-counter-btn decrease"><i class="fas fa-minus"></i></button>
                <input type="number" class="grind-total-input" value="${currentTotal}">
                <button class="grind-counter-btn increase"><i class="fas fa-plus"></i></button>
            `;
            const input = body.querySelector('input');
            input.focus();
            input.select();

            const saveNewTotal = () => {
                const newValue = parseInt(input.value, 10);
                if (!isNaN(newValue) && newValue >= 0) {
                    session.counts.total = newValue;
                    saveData(savedData);
                }
                renderGrindCounterView(sessionId);
            };

            input.addEventListener('blur', saveNewTotal);
            input.addEventListener('keydown', (e) => {
                if (e.key === 'Enter') saveNewTotal();
                else if (e.key === 'Escape') renderGrindCounterView(sessionId);
            });
        });
    }

    container.querySelector('#delete-grind-btn').addEventListener('click', async () => {
        if (await showCustomAlert(`Tem certeza que deseja excluir o grind de ${animalName} em ${reserveName}?`, 'Excluir Grind', true)) {
            const sessionIndex = savedData.grindSessions.findIndex(s => s.id === sessionId);
            if (sessionIndex > -1) {
                savedData.grindSessions.splice(sessionIndex, 1);
                saveData(savedData);
                renderMainView('grind');
            }
        }
    });
}

// Sincroniza um troféu do grind para o álbum principal
function syncTrophyToAlbum(animalSlug, rarityType, details) {
    if (!savedData) return;

    switch(rarityType) {
        case 'rares':
            if (!savedData.pelagens) savedData.pelagens = {};
            if (!savedData.pelagens[animalSlug]) savedData.pelagens[animalSlug] = {};
            savedData.pelagens[animalSlug][details.variation] = true;
            console.log(`Sincronizado: Pelagem Rara '${details.variation}' para ${animalSlug}`);
            break;

        case 'super_raros':
            if (!savedData.super_raros) savedData.super_raros = {};
            if (!savedData.super_raros[animalSlug]) savedData.super_raros[animalSlug] = {};
            const superRareKey = details.variation;    
            savedData.super_raros[animalSlug][superRareKey] = true;
            console.log(`Sincronizado: Super Raro '${superRareKey}' para ${animalSlug}`);
            break;

        case 'great_ones':
            if (!savedData.greats) savedData.greats = {};
            if (!savedData.greats[animalSlug]) savedData.greats[animalSlug] = {};
            if (!savedData.greats[animalSlug].furs) savedData.greats[animalSlug].furs = {};
            if (!savedData.greats[animalSlug].furs[details.variation]) {
                savedData.greats[animalSlug].furs[details.variation] = { trophies: [] };
            }

            const newGreatOneTrophy = {
                date: new Date().toISOString(),
                abates: details.grindCounts.total,
                diamantes: details.grindCounts.diamonds,
                pelesRaras: details.grindCounts.rares.length
            };

            savedData.greats[animalSlug].furs[details.variation].trophies.push(newGreatOneTrophy);
            console.log(`Sincronizado: Great One '${details.variation}' para ${animalSlug} com detalhes do grind.`);
            break;
    }
}

// Abre o modal de detalhes do grind (para pelagens raras, super raros, great ones)
async function openGrindDetailModal(sessionId, rarityType) {
    const session = savedData.grindSessions.find(s => s.id === sessionId);
    if (!session) return;

    const { animalSlug } = session;
    let options = [];
    let title = "Registrar ";

    switch (rarityType) {
        case 'rares':
            title += "Pelagem Rara";
            const furData = rareFursData[animalSlug];
            if (furData) {
                if (furData.macho) furData.macho.forEach(fur => options.push(`Macho ${fur}`));
                if (furData.femea) furData.femea.forEach(fur => options.push(`Fêmea ${fur}`));
            }
            break;
        case 'super_raros':
            title += "Super Raro";
            const speciesRareFurs = rareFursData[animalSlug];
            const speciesDiamondData = diamondFursData[animalSlug];
            if (speciesRareFurs) {
                if (speciesRareFurs.macho && (speciesDiamondData?.macho?.length || 0) > 0) {
                    speciesRareFurs.macho.forEach(rareFur => {
                        options.push(`Macho ${rareFur}`);
                    });
                }
                if (speciesRareFurs.femea && (speciesDiamondData?.femea?.length || 0) > 0) {
                    speciesRareFurs.femea.forEach(rareFur => {
                        options.push(`Fêmea ${rareFur}`);
                    });
                }
            }
            break;
        case 'great_ones':
            title += "Great One";
            const greatData = greatsFursData[animalSlug];
            if (greatData) {
                options = greatData;
            }
            break;
    }

    if (options.length === 0) {
        await showCustomAlert(`Nenhuma variação de '${rarityType.replace('_', ' ')}' encontrada para este animal.`, 'Aviso');
        return;
    }

    const modal = document.getElementById('form-modal');
    modal.innerHTML = `
        <div class="modal-content-box">
            <h3>${title}</h3>
            <select id="grind-detail-modal-select">
                ${options.map(opt => `<option value="${opt}">${opt}</option>`).join('')}
            </select>
            <div class="modal-buttons">
                <button id="grind-detail-cancel" class="back-button">Cancelar</button>
                <button id="grind-detail-save" class="back-button" style="background-color: var(--primary-color); color: #111;">Salvar</button>
            </div>
        </div>
    `;

    modal.querySelector('#grind-detail-cancel').onclick = () => closeModal('form-modal');
    modal.querySelector('#grind-detail-save').onclick = () => {
        const select = document.getElementById('grind-detail-modal-select');
        const selectedValue = select.value;

        const logDetails = {
            variation: selectedValue,
            grindCounts: session.counts
        };
        const newLog = { id: Date.now(), variation: selectedValue, date: new Date().toISOString() };

        if (!session.counts[rarityType]) session.counts[rarityType] = [];
        session.counts[rarityType].push(newLog);

        syncTrophyToAlbum(animalSlug, rarityType, logDetails);

        saveData(savedData);
        closeModal('form-modal');
        renderGrindCounterView(sessionId);
    };

    modal.style.display = 'flex';
}

// Obtém estatísticas agregadas de grind para o ranking
function getAggregatedGrindStats() {
    const allAnimalSlugs = items.map(name => slugify(name));
    const stats = {};

    allAnimalSlugs.forEach(slug => {
        stats[slug] = {
            animalSlug: slug,
            animalName: items.find(i => slugify(i) === slug) || slug,
            totalKills: 0,
            diamonds: 0,
            rares: 0,
            superRares: 0,
            greatOnes: 0
        };
    });

    if (savedData.grindSessions && savedData.grindSessions.length > 0) {
        savedData.grindSessions.forEach(session => {
            const slug = session.animalSlug;
            if (stats[slug]) {
                stats[slug].totalKills += session.counts.total || 0;
                stats[slug].diamonds += session.counts.diamonds || 0;
                stats[slug].rares += session.counts.rares?.length || 0;
                stats[slug].superRares += session.counts.super_rares?.length || 0;
                stats[slug].greatOnes += session.counts.great_ones?.length || 0;
            }
        });
    }

    return Object.values(stats).sort((a, b) => a.animalName.localeCompare(b.animalName));
}

// Renderiza a visualização do ranking de caça
function renderHuntingRankingView(container) {
    const stats = getAggregatedGrindStats();

    container.innerHTML = `
        <div class="ranking-header">
            <h3>Ranking de Caça</h3>
            <p>Estatísticas agregadas de todas as sessões do Contador de Grind.</p>
        </div>
        <div class="ranking-table-container">
            <table class="ranking-table">
                <thead>
                    <tr>
                        <th>Animal</th>
                        <th><i class="fas fa-crosshairs"></i> Abates</th>
                        <th><i class="fas fa-gem"></i> Diamantes</th>
                        <th><i class="fas fa-paw"></i> Raros</th>
                        <th><i class="fas fa-star"></i> Super Raros</th>
                        <th><i class="fas fa-crown"></i> Great Ones</th>
                    </tr>
                </thead>
                <tbody>
                    ${stats.map(animalStat => `
                        <tr>
                            <td data-label="Animal">
                                <img src="animais/${animalStat.animalSlug}.png" class="table-animal-icon" onerror="this.style.display='none'">
                                <span>${animalStat.animalName}</span>
                            </td>
                            <td data-label="Abates">${animalStat.totalKills}</td>
                            <td data-label="Diamantes">${animalStat.diamonds}</td>
                            <td data-label="Raros">${animalStat.rares}</td>
                            <td data-label="Super Raros">${animalStat.superRares}</td>
                            <td data-label="Grandes">${greatsFursData[animalStat.animalSlug] ? animalStat.greatOnes : 'N/A'}</td>
                        </tr>
                    `).join('')}
                </tbody>
            </table>
        </div>
    `;
}

// --- FUNÇÕES DE AUTENTICAÇÃO ---
function renderLoginForm() {
    appContainer.innerHTML = `
        <div class="auth-container">
            <div class="auth-box">
                <h2>Login - Álbum de Caça</h2>
                <p>Acesse sua conta para sincronizar seu progresso.</p>
                <input type="email" id="loginEmail" placeholder="Seu e-mail">
                <input type="password" id="loginPassword" placeholder="Sua senha">
                <button id="loginButton" class="auth-button">Entrar</button>
                <button id="showRegister" class="link-button">Não tem uma conta? Cadastre-se</button>
                <div id="authError" class="auth-error"></div>
            </div>
        </div>
    `;

    document.getElementById('loginButton').addEventListener('click', () => {
        const email = document.getElementById('loginEmail').value;
        const password = document.getElementById('loginPassword').value;
        const errorDiv = document.getElementById('authError');

        auth.signInWithEmailAndPassword(email, password)
            .catch((error) => {
                errorDiv.textContent = `Erro ao entrar: ${error.message}`;
            });
    });

    document.getElementById('showRegister').addEventListener('click', renderRegisterForm);
}

function renderRegisterForm() {
    appContainer.innerHTML = `
        <div class="auth-container">
            <div class="auth-box">
                <h2>Cadastro - Álbum de Caça</h2>
                <p>Crie sua conta para salvar seu progresso na nuvem.</p>
                <input type="email" id="registerEmail" placeholder="Seu e-mail">
                <input type="password" id="registerPassword" placeholder="Sua senha (mínimo 6 caracteres)">
                <button id="registerButton" class="auth-button">Cadastrar</button>
                <button id="showLogin" class="link-button">Já tem uma conta? Faça o login</button>
                <div id="authError" class="auth-error"></div>
            </div>
        </div>
    `;

    document.getElementById('registerButton').addEventListener('click', () => {
        const email = document.getElementById('registerEmail').value;
        const password = document.getElementById('registerPassword').value;
        const errorDiv = document.getElementById('authError');

        auth.createUserWithEmailAndPassword(email, password)
            .catch((error) => {
                errorDiv.textContent = `Erro no cadastro: ${error.message}`;
            });
    });

    document.getElementById('showLogin').addEventListener('click', renderLoginForm);
}

function setupLogoutButton(user) {
    if (!user) return;

    let pageHeader = document.querySelector('.page-header');
    if (!pageHeader) {
        let existingHeader = document.querySelector('.page-header-logout-only');
        if (existingHeader) existingHeader.remove();

        pageHeader = document.createElement('div');
        pageHeader.className = 'page-header-logout-only';

        const navHub = document.querySelector('.navigation-hub');
        if (navHub) {
            navHub.before(pageHeader);
        } else {
            appContainer.prepend(pageHeader);
        }
    }

    let logoutContainer = document.getElementById('logout-container');
    if (logoutContainer) logoutContainer.remove();

    logoutContainer = document.createElement('div');
    logoutContainer.id = 'logout-container';
    logoutContainer.innerHTML = `
        <span class="user-email">${user.email}</span>
        <button id="logoutButton" class="back-button">Sair</button>
    `;
    pageHeader.appendChild(logoutContainer);

    document.getElementById('logoutButton').addEventListener('click', () => {
        auth.signOut();
    });
}

// --- FUNÇÕES DE BACKUP/RESTAURAÇÃO ---
function exportUserData() {
    if (!currentUser || !savedData) {
        showCustomAlert('Nenhum dado para exportar. Faça login primeiro.', 'Erro de Exportação');
        return;
    }

    const dataStr = JSON.stringify(savedData, null, 2);
    const blob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `thehunter_album_backup_${currentUser.uid}_${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    showCustomAlert('Seu progresso foi exportado com sucesso!', 'Backup Criado');
}

async function importUserData(event) {
    if (!currentUser) {
        await showCustomAlert('Faça login antes de tentar importar dados.', 'Erro de Importação');
        return;
    }

    const file = event.target.files[0];
    if (!file) return;

    if (file.type !== 'application/json') {
        await showCustomAlert('Por favor, selecione um arquivo JSON válido.', 'Erro de Arquivo');
        return;
    }

    const reader = new FileReader();
    reader.onload = async (e) => {
        try {
            const importedData = JSON.parse(e.target.result);

            const confirmImport = await showCustomAlert(
                'Tem certeza que deseja sobrescrever seu progresso atual com os dados deste arquivo? Esta ação não pode ser desfeita.',
                'Confirmar Importação',
                true
            );

            if (confirmImport) {
                if (importedData.pelagens || importedData.diamantes || importedData.greats || importedData.super_raros || importedData.grindSessions) {
                    savedData = importedData;
                    await saveData(savedData);
                    await showCustomAlert('Progresso importado e salvo na nuvem com sucesso!', 'Importação Concluída');
                    location.reload();
                } else {
                    await showCustomAlert('O arquivo JSON selecionado não parece ser um backup válido do álbum de caça.', 'Erro de Validação');
                }
            } else {
                await showCustomAlert('Importação cancelada.', 'Cancelado');
            }
        } catch (error) {
            console.error('Erro ao ler ou parsear o arquivo JSON:', error);
            await showCustomAlert('Erro ao ler o arquivo de backup. Certifique-se de que é um JSON válido.', 'Erro de Leitura');
        } finally {
            event.target.value = '';    
        }
    };
    reader.readAsText(file);
}


// --- INICIALIZAÇÃO DO APP ---
document.addEventListener('DOMContentLoaded', () => {
    appContainer = document.getElementById('app-container');

    auth.onAuthStateChanged(async (user) => {
        if (user) {
            currentUser = user;
            appContainer.innerHTML = `<div class="loading-spinner">Carregando seus dados...</div>`;
            savedData = await loadDataFromFirestore();
            renderNavigationHub();
        } else {
            currentUser = null;
            renderLoginForm();
        }
    });

    const imageModal = document.getElementById('image-viewer-modal');
    const formModal = document.getElementById('form-modal');
    [imageModal, formModal].forEach(modal => {
        if(modal) {
            const closeBtn = modal.querySelector('.modal-close');
            if (closeBtn) closeBtn.onclick = () => closeModal(modal.id);
            modal.addEventListener('click', e => {
                if (e.target === modal) closeModal(modal.id);
            });
        }
    });

    const customAlertModal = document.getElementById('custom-alert-modal');
    if (customAlertModal) {
        customAlertModal.addEventListener('click', e => {
            if (e.target === customAlertModal) customAlertModal.style.display = 'none';
        });
    }

    window.addEventListener('keydown', (event) => {
        if (event.key === 'Escape') {
            closeModal('image-viewer-modal');
            closeModal('form-modal');
            closeModal('custom-alert-modal');
        }
    });
});