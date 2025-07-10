import { initializeApp } from "https://www.gstatic.com/firebasejs/11.6.1/firebase-app.js";
import { getAuth, signInAnonymously, signInWithCustomToken, onAuthStateChanged, createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut } from "https://www.gstatic.com/firebasejs/11.6.1/firebase-auth.js";
import { getFirestore, doc, getDoc, setDoc, collection, query, where, addDoc, getDocs, onSnapshot, deleteDoc } from "https://www.gstatic.com/firebasejs/11.6.1/firebase-firestore.js";

// Global variables for Firebase config and app ID
const appId = typeof __app_id !== 'undefined' ? __app_id : 'default-app-id';
const firebaseConfig = typeof __firebase_config !== 'undefined' ? JSON.parse(__firebase_config) : {};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
let currentUser = null; // Variable to store the logged-in user

// Global object to store user data
let savedData = {};

// Function to get the default data structure for a new user
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
 * Loads user data from Firestore for the logged-in user.
 * If the user is new, returns an empty data structure.
 */
async function loadDataFromFirestore() {
    if (!currentUser) {
        console.error("Attempting to load data without a logged-in user.");
        return getDefaultDataStructure();
    }
    const userDocRef = doc(db, `artifacts/${appId}/users/${currentUser.uid}/data/user_progress`);
    try {
        const docSnap = await getDoc(userDocRef);
        if (docSnap.exists()) {
            console.log("Data loaded from Firestore!");
            // Ensure all main fields exist to prevent errors
            const cloudData = docSnap.data();
            const defaultData = getDefaultDataStructure();
            return { ...defaultData, ...cloudData };
        } else {
            console.log("No data found for the user, creating new document.");
            // For a new user, save the default structure to Firestore
            const defaultData = getDefaultDataStructure();
            await setDoc(userDocRef, defaultData);
            return defaultData;
        }
    } catch (error) {
        console.error("Error loading data from Firestore:", error);
        return getDefaultDataStructure(); // Return default data in case of error
    }
}

/**
 * Saves the complete data object to Firestore for the logged-in user.
 * @param {object} data The complete data object to be saved.
 */
function saveData(data) {
    if (!currentUser) {
        console.error("Attempting to save data without a logged-in user.");
        return;
    }
    const userDocRef = doc(db, `artifacts/${appId}/users/${currentUser.uid}/data/user_progress`);
    setDoc(userDocRef, data)
        .then(() => {
            console.log("Progress saved to cloud successfully!");
        })
        .catch((error) => {
            console.error("Error saving data to cloud: ", error);
        });
    
    // UI is optimistically updated locally
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
const rareFursData = { "alce": { macho: ["Albino", "Melanístico", "Malhado", "Café"], femea: ["Albino", "Melanístico", "Malhado"] }, "antilocapra": { macho: ["Albino", "Malhado", "Leucismo"], femea: ["Albino", "Malhado", "Leucismo"] }, "antílope_negro": { macho: ["Albino", "Melânico", "Malhado", "Leucismo"], femea: ["Albino", "Melânico", "Malhado", "Leucismo"] }, "bantengue": { macho: ["Albino", "Melânico"], femea: ["Albino", "Melânico"] }, "bisão_das_planícies": { macho: ["Albino", "Melânico", "Leucismo"], femea: ["Albino", "Melânico", "Leucismo"] }, "bisão_europeu": { macho: ["Albino", "Melânico", "Malhado"], femea: ["Albino", "Melânico", "Malhado"] }, "búfalo_africano": { macho: ["Albino", "Leucismo"], femea: ["Albino", "Leucismo"] }, "búfalo_dágua": { macho: ["Albino", "Laranja"], femea: ["Albino", "Laranja"] }, "cabra_da_montanha": { macho: ["Albino", "Melânico"], femea: ["Albino", "Melânico"] }, "cabra_de_leque": { macho: ["Albino"], femea: ["Albino"] }, "cabra_selvagem": { macho: ["Albino", "Preto", "Cores Mistas"], femea: ["Albino", "Preto"] }, "caititu": { macho: ["Albino", "Melânico", "Ochre", "Leucismo"], femea: ["Albino", "Melânico", "Ochre", "Leucismo"] }, "camurça": { macho: ["Albino", "Melânico", "Leucismo"], femea: ["Albino", "Melânico", "Leucismo"] }, "canguru_cinza_oriental": { macho: ["Albino", "Melânico", "Leucismo"], femea: ["Albino", "Melânico", "Leucismo"] }, "caribu": { macho: ["Albino", "Melânico", "Leucismo"], femea: ["Albino", "Melânico", "Leucismo"] }, "carneiro_azul": { macho: ["Albino", "Melânico", "Leucismo"], femea: ["Albino", "Melânico", "Leucismo"] }, "carneiro_selvagem": { macho: ["Albino", "Malhado variação 1", "Malhado variação 2"], femea: ["Albino", "Malhado variação 1", "Malhado variação 2"] }, "cervo_porco_indiano": { macho: ["Malhado", "Leucismo"], femea: ["Malhado", "Leucismo"] }, "cervo_almiscarado": { macho: ["Albino", "Melânico", "Malhado"], femea: [] }, "cervo_de_timor": { macho: ["Albino", "leucistico", "malhado variação 1", "malhado variação 2"], femea: ["leucistico"] }, "cervo_do_pântano": { macho: ["Albino", "Malhado", "Leucismo"], femea: ["Albino", "Malhado", "Leucismo"] }, "cervo_sika": { macho: ["Albino", "pintado vermelho"], femea: ["Albino", "pintado vermelho"] }, "chital": { macho: ["Albino", "malhado", "melanico"], femea: ["Albino", "malhado", "melanico"] }, "chacal_listrado": { macho: ["Albino", "Melânico"], femea: ["Albino", "Melânico"] }, "codorna_de_restolho": { macho: ["Albino", "Pardo Escuro"], femea: ["Albino"] }, "codorniz_da_virgínia": { macho: ["Albino"], femea: ["Albino"] }, "coelho_da_flórida": { macho: ["Albino", "melanico"], femea: ["Albino", "melanico"] }, "coelho_europeu": { macho: ["Albino", "Melânico", "Leucismo"], femea: ["Albino", "Melânico", "Leucismo"] }, "coiote": { macho: ["Albino", "Melânico", "malhado"], femea: ["Albino", "Melânico", "malhado"] }, "corça": { macho: ["Albino", "Melânico", "Malhado"], femea: ["Albino", "Melânico", "Malhado"] }, "crocodilo_de_água_salgada": { macho: ["Albino", "Melânico", "Pardo Claro", "malhado variação 1", "malhado variação 2", "Leucismo"], femea: ["Albino", "Melânico", "Pardo Claro", "malhado variação 1", "malhado variação 2", "Leucismo"] }, "cudo_menor": { macho: ["Albino"], femea: ["Albino"] }, "cão_guaxinim": { macho: ["Albino", "Laranja", "Pardo escuro", "malhado variação 1", "malhado variação 2"], femea: ["Albino", "Laranja", "Pardo escuro", "malhado variação 1", "malhado variação 2"] }, "faisão_de_pescoço_anelado": { macho: ["Albino", "Melânico", "Leucismo"], femea: ["Albino", "Melânico", "Leucismo"] }, "faisão": { macho: ["Albino", "Melânico", "Leucismo"], femea: ["Albino", "Melânico", "Leucismo"] }, "frisada": { macho: ["Albino", "Melânico", "Leucismo"], femea: ["Albino", "Melânico", "Leucismo"] }, "galinha_montês": { macho: ["Pálida", "Híbrido", "Escuro"], femea: ["Pálida", "Híbrido", "Escuro"] }, "galo_lira": { macho: ["leucismo variação 1", "leucismo variação 2", "leucismo variação 3", "melanico variação 1", "melanico variação 2"], femea: ["Laranja"] }, "gamo": { macho: ["Albino", "Melânico", "malhado variação 1", "malhado variação 2"], femea: ["Albino", "Melânico"] }, "ganso_bravo": { macho: ["Híbrido", "leucismo variação 1", "leucismo variação 2", "leucismo variação 3", "leucismo variação 4", "leucismo variação 5"], femea: ["Híbrido", "leucismo variação 1", "leucismo variação 2", "leucismo variação 3", "leucismo variação 4", "leucismo variação 5"] }, "ganso_campestre_da_tundra": { macho: ["leucismo variação 1", "leucismo variação 2", "leucismo variação 3"], femea: ["leucismo variação 1", "leucismo variação 2", "leucismo variação 3"] }, "ganso_pega": { macho: ["Melânico", "leucismo variação 1", "leucismo variação 2", "malhado variação 1", "malhado variação 2"], femea: ["Melânico", "leucismo variação 1", "leucismo variação 2", "malhado variação 1", "malhado variação 2"] }, "ganso_do_canadá": { macho: ["Cinza", "Melânico", "Leucismo cinza claro", "hibrido branco"], femea: ["Cinza", "Melânico", "Leucismo cinza claro", "hibrido branco"] }, "ganso_das_neves": { macho: ["Albino", "Melânico", "variação azul", "hibrido", "intermediario"], femea: ["Albino", "Melânico", "variação azul", "hibrido", "intermediario"] }, "gnu_de_cauda_preta": { macho: ["Albino"], femea: ["Albino", "Coroado"] }, "guaxinim_comum": { macho: ["Albino", "Melânico", "loiro malhado", "cinza malhado"], femea: ["Albino", "Melânico", "loiro malhado", "cinza malhado"] }, "iaque_selvagem": { macho: ["Ouro", "Leucismo", "albino variação 1", "albino variação 2"], femea: ["Ouro", "Leucismo", "albino variação 1", "albino variação 2", "marrom profundo", "preto profundo"] }, "ibex_de_beceite": { macho: ["Albino", "Melânico"], femea: ["Albino", "Melânico"] }, "jacaré_americano": { macho: ["Albino", "Melânico", "malhado variação 1", "malhado variação 2"], femea: ["Albino", "Melânico", "malhado variação 1", "malhado variação 2"] }, "javali": { macho: ["Albino", "Melânico", "preto e dourado"], femea: ["Albino", "Melânico", "preto e dourado"] }, "javali_africano": { macho: ["Albino"], femea: ["Albino", "Vermelho"] }, "lagópode_branco": { macho: ["Branco", "muda variação 1", "muda variação 2"], femea: ["Branco", "muda variação 1", "muda variação 2", "mosqueado variação 1", "mosqueado variação 2"] }, "lagópode_escocês": { macho: ["Branco"], femea: ["Branco"] }, "lebre_antílope": { macho: ["Albino", "Melânico"], femea: ["Albino", "Melânico"] }, "lebre_da_eurásia": { macho: ["Albino", "Branco", "muda variação 1", "muda variação 2", "pardo claro", "pardo escuro", "cinza claro", "cinza escuro"], femea: ["Albino", "Branco", "muda variação 1", "muda variação 2"] }, "lebre_peluda": { macho: ["Albino", "Branco"], femea: ["Albino", "Branco"] }, "lebre_da_cauda_branca": { macho: ["Albino"], femea: ["Albino"] }, "lebre_nuca_dourada": { macho: ["cinza claro"], femea: ["cinza claro"] }, "lebre_europeia": { macho: ["albino", "melanico"], femea: ["albino", "melanico"] }, "leopardo_das_neves": { macho: ["Albino", "Melânico", "Leucismo"], femea: ["Albino", "Melânico", "Leucismo"] }, "leão": { macho: ["Albino", "amarelado", "pardo escuro"], femea: ["Albino", "amarelado", "pardo escuro"] }, "lince_pardo_do_méxico": { macho: ["Albino", "Melânico", "Azul"], femea: ["Albino", "Melânico", "Azul"] }, "lince_euroasiática": { macho: ["Albino", "Melânico", "Malhado"], femea: ["Albino", "Melânico", "Malhado"] }, "lobo_cinzento": { macho: ["Albino", "Melânico", "cinza escuro", "clara de ovo", "marrom averelhado"], femea: ["Albino", "Melânico", "cinza escuro", "clara de ovo", "marrom averelhado"] }, "lobo_ibérico": { macho: ["Albino", "Melânico", "fantasma", "ogro", "sombra", "inverno", "oliva", "prístino"], femea: ["Albino", "Melânico", "fantasma", "ogro", "sombra", "inverno", "oliva", "prístino"] }, "marreca_carijó": { macho: ["Melânico"], femea: ["bege"] }, "marrequinha_comum": { macho: ["híbrido azul", "híbrido verde", "Leucismo variação 1", "Leucismo variação 2"], femea: ["Leucismo"] }, "marrequinha_americana": { macho: ["Albino", "Verde Claro", "malhado variação 1", "malhado variação 2", "malhado variação 3"], femea: ["malhado variação 1", "malhado variação 2"] }, "muflão_ibérico": { macho: ["Albino", "Melânico", "cinza"], femea: ["Albino", "Melânico", "cinza"] }, "muntjac_vermelho_do_norte": { macho: ["Albino", "Melânico", "Leucismo variação 1", "Leucismo variação 2", "Vermelho variação 1", "Vermelho variação 2"], femea: ["Albino", "Melânico", "Leucismo variação 1", "Leucismo variação 2"] }, "nilgó": { macho: ["Malhado variação 1", "Malhado variação 2"], femea: ["Malhado variação 1", "Malhado variação 2"] }, "onça_parda": { macho: ["Albino", "Melânico"], femea: ["Albino", "Melânico"] }, "oryx_do_cabo": { macho: ["bege", "escuro", "ouro"], femea: ["bege", "escuro", "ouro"] }, "pato_olho_de_ouro": { macho: ["eclipse", "leucismo variação 1", "leucismo variação 2"], femea: ["escuro", "leucismo variação 1", "leucismo variação 2"] }, "pato_harlequim": { macho: ["Albino", "Melânico"], femea: ["Albino", "cinza", "escuro"] }, "pato_real": { macho: ["Melânico"], femea: ["Melânico", "amarelado"] }, "peru": { macho: ["Albino", "Melânico", "Leucismo"], femea: ["Albino", "Melânico", "Leucismo"] }, "peru_selvagem": { macho: ["Albino", "Melânico", "Leucismo", "bronze"], femea: ["Albino", "Melânico", "Leucismo"] }, "peru_selvagem_do_rio_grande": { macho: ["Albino", "Melânico", "Leucismo"], femea: ["Albino", "Melânico", "Leucismo"] }, "piadeira": { macho: ["híbrido", "eclipse", "leucismo variação 1", "leucismo variação 2"], femea: ["leucismo variação 1", "leucismo variação 2"] }, "porco_selvagem": { macho: ["Albino", "rosa", "manchas pretas variação 1", "manchas pretas variação 2", "hibrido marrom variação 1", "hibrido marrom variação 2", "marrom escuro variação 1", "marrom escuro variação 2"], femea: ["rosa"] }, "raposa_tibetana": { macho: ["Albino", "Melânico", "areia", "esfumaçado", "Leucismo"], femea: ["Albino", "Melânico", "areia", "esfumaçado", "Leucismo"] }, "raposa_cinzenta": { macho: ["Albino", "Melânico", "Leucismo", "malhado variação 1", "malhado variação 2"], femea: ["Albino", "Melânico", "Leucismo", "malhado variação 1", "malhado variação 2"] }, "raposa_vermelha": { macho: ["Albino", "Melânico", "Malhado"], femea: ["Albino", "Melânico", "Malhado"] }, "rena": { macho: ["Albino", "Melânico", "Malhado", "Leucismo"], femea: ["Albino", "Melânico", "Malhado", "Leucismo"] }, "sambar": { macho: ["Albino", "leucismo variação 1", "leucismo variação 2", "malhado variação 1", "malhado variação 2", "gradiente escuro"], femea: ["Albino", "Malhado", "Leucismo"] }, "tahr": { macho: ["Albino", "branco", "vermelho", "preto", "vermelho escuro", "pardo escuro"], femea: ["Albino", "branco", "vermelho"] }, "tetraz_grande": { macho: ["pálido", "Leucismo"], femea: ["Leucismo"] }, "tigre_de_bengala": { macho: ["Albino", "Melânico", "branco", "branco sem listras", "ouro", "pseudo melanico variação 1", "pseudo melanico variação 2", "pseudo melanico branco variação 1", "pseudo melanico branco variação 2"], femea: ["Albino", "Melânico", "branco", "branco sem listras", "ouro", "pseudo melanico variação 1", "pseudo melanico variação 2", "pseudo melanico branco variação 1", "pseudo melanico branco variação 2"] }, "urso_cinzento": { macho: ["Albino", "Marrom"], femea: ["Albino"] }, "urso_negro": { macho: ["Amarelado", "Marrom", "canela"], femea: ["Amarelado", "Marrom", "canela"] }, "urso_pardo": { macho: ["Albino", "Melanico"], femea: ["Albino", "Melanico"] }, "veado_das_montanhas_rochosas": { macho: ["Albino", "malhado variação 1", "malhado variação 2"], femea: ["Albino", "malhado variação 1", "malhado variação 2"] }, "veado_de_cauda_branca": { macho: ["Albino", "Melânico", "Malhado"], femea: ["Albino", "Melânico", "Malhado"] }, "veado_de_cauda_preta": { macho: ["Albino", "Melânico", "Malhado"], femea: ["Albino", "Melânico", "Malhado"] }, "veado_de_roosevelt": { macho: ["Albino", "Melânico", "Malhado"], femea: ["Albino", "Melânico", "Malhado"] }, "veado_mula": { macho: ["Albino", "Melânico", "diluído", "malhado variação 1", "malhado variação 2"], femea: ["Albino", "Melânico", "diluído", "malhado variação 1", "malhado variação 2"] }, "veado_vermelho": { macho: ["Albino", "Melânico", "Malhado"], femea: ["Albino", "Melânico", "Malhado"] }, "zarro_negrinha": { macho: ["Albino", "eclipse", "leucismo variação 1", "leucismo variação 2"], femea: ["leucismo variação 1", "leucismo variação 2"] }, "zarro_castanho": { macho: ["Albino", "Melânico", "Leucismo"], femea: ["Albino", "Melânico", "Leucismo"] }, "ibex_espanhol_do_sudeste": { macho: ["Albino", "Melânico", "laranja", "cinza claro", "castanho acinzentado", "marrom hibrido"], femea: ["Albino", "Melânico"] }, "ibex_de_gredos": { macho: ["Albino", "Melânico"], femea: ["Albino", "Melânico"] }, "ibex_de_ronda": { macho: ["Albino", "Melânico"], femea: ["Albino", "Melânico"] }, "tetraz_azul": { macho: ["Albino", "Melânico", "Leucismo"], femea: ["Albino", "Melânico", "Leucismo"] }, "marreca_arrebio": { macho: ["Albino", "Melânico", "malhado"], femea: ["Albino", "Melânico", "Leucismo", "malhado", "brilhante", "eritristico"] }, "pato_carolino": { macho: ["Albino", "Prata Diluída", "Dourado Eritrístico", "Leucísmo", "Melânico", "Malhado"], femea: ["Albino", "Prata Diluída", "Dourado Eritrístico", "Leucísmo", "Melânico", "Malhado"] }, "castor_norte_americano": { macho: ["Albino", "Melânico", "Leucismo"], femea: ["Albino", "Melânico", "Leucismo"] }, "caribu_da_floresta_boreal": { macho: ["Albino", "Melânico", "Leucismo"], femea: ["Albino", "Melânico", "Leucismo"] }, "cervo_canadense": { macho: ["Albino", "Melânico", "Leucismo", "Malhado"], femea: ["Albino", "Melânico", "Leucismo", "Malhado"] }, "bisão_da_floresta": { macho: ["Albino", "Melânico", "Leucismo"], femea: ["Albino", "Melânico", "Leucismo"] } };
const greatsFursData = { "alce": ["Fábula Dois Tons", "Cinza lendário", "Bétula lendária", "Carvalho Fabuloso", "Fabuloso Salpicado", "Abeto lendário"], "urso_negro": ["Creme Lendário", "Espírito Lendário", "Castanho Lendário", "Pintado Lendário", "Gelo Lendário 2", "Gelo Lendário"], "veado_de_cauda_branca": ["Pardo", "Pardo Escuro", "Bronzeado", "Malhado"], "gamo": ["Café Lendário", "Pintado Lendário", "Dourado Lendário", "Misto Lendário", "Prata Lendário"], "raposa": ["A lendária Lua de Sangue", "Bengala de doce lendária", "A lendária flor de cerejeira", "Alcaçuz lendário", "A lendária papoula da meia-noite", "Floco de Neve Místico Fabuloso", "Hortelã-pimenta lendária", "Fábula Rosebud Frost", "A lendária Beladona Escarlate"], "veado_vermelho": ["Pintado Lendário"], "tahr": ["Dourado Lendário", "Cicatrizes Lendárias", "Cinza Lendário", "Café com Leite Lendário", "Crânio Lendário", "Metade Lendária", "Neve Lendário"], "veado_mula": ["Chuva de Gotículas Lendárias", "Via Láctea Lendária", "Sopro de Pétalas Lendário", "Manto Crepuscular Lendário", "Enigma Teia de Aranha Lendário", "Listras de Canela Lendário"], "faisão": ["Rubi Lendário", "Pérola Lendário", "Granada Lendário", "Safira Lendário", "Obsidiana Lendário", "Citrino Lendário", "Esmeralda Lendário", "Morganita Lendário"] };
const items = ["Alce","Antilocapra","Antílope Negro","Bantengue","Bisão da Floresta","Bisão das Planícies","Bisão Europeu","Búfalo Africano","Búfalo D'Água","Cabra da Montanha","Cabra de Leque","Cabra Selvagem","Caititu","Camurça","Canguru-cinza Oriental", "Chacal Listrado", "Caribu","Caribu da Floresta Boreal","Carneiro Azul","Carneiro Selvagem","Castor Norte-Americano","Cervo Almiscarado","Cervo Canadense","Cervo do Pântano","Cervo de Timor","Cervo Sika","Cervo-porco Indiano","Chital","Codorna-de-restolho","Codorniz da Virgínia","Coelho da Flórida","Coelho Europeu","Coiote","Corça","Crocodilo de Água Salgada","Cudo Menor","Faisão de Pescoço Anelado","Frisada","Galo Lira","Gamo","Ganso Bravo","Ganso Campestre da Tundra","Ganso das Neves","Ganso do Canadá","Ganso Pega","Gnu de Cauda Preta","Guaxinim Comum","Iaque Selvagem","Ibex de Beceite","Ibex de Gredos","Ibex de Ronda","Ibex Espanhol do Sudeste","Jacaré Americano","Javali","Javali Africano", "Lebre Europeia", "Lebre-antílope","Lebre-da-cauda-branca","Lebre Da Eurásia","Lebre Nuca Dourada","Lebre Peluda","Leão","Leopardo das Neves","Lince Euroasiática","Lince Pardo do México","Lobo Cinzento","Lobo Ibérico","Marreca Arrebio","Marreca Carijó","Marrequinha Americana","Marrequinha Comum","Muflão Ibérico","Muntjac vermelho do norte","Nilgó","Onça Parda","Oryx do Cabo","Pato Carolino","Pato Harlequim","Pato Olho de Ouro","Pato Real","Peru","Peru Selvagem","Peru Selvagem do Rio Grande","Piadeira","Porco Selvagem","Raposa cinzenta","Raposa tibetana","Raposa Vermelha","Rena","Sambar","Tahr","Tetraz Azul","Tetraz Grande","Tigre-de-Bengala","Urso Cinzento","Urso Negro","Urso Pardo","Veado das Montanhas Rochosas","Veado de Cauda Branca","Veado de Cauda Preta","Veado-Mula","Veado de Roosevelt","Veado Vermelho","Cão Guaxinim","Lagópode-Branco","Lagópode-Escocês","Galinha-Montês","Zarro-Negrinha","Zarro-castanho"];
const diamondFursData = { "alce": { macho: ["Bronzeado", "Pardo", "Pardo Claro"], femea: [] }, "antilocapra": { macho: ["Bronzeado", "Escuro", "Pardo"], femea: [] }, "antílope_negro": { macho: ["Escuro", "Pardo Escuro", "Preto", "Bege"], femea: [] }, "bantengue": { macho: ["Preto", "Café", "Pardo", "Pardo Escuro"], femea: [] }, "bisão_da_floresta": { macho: ["Pardo Escuro", "Ruivo", "Metade Ruivo", "Pardo Claro"], femea: [] }, "bisão_das_planícies": { macho: ["Escuro", "Cinza Claro", "Pardo", "Pardo Claro"], femea: [] }, "bisão_europeu": { macho: ["Pardo", "Pardo Claro", "Pardo Escuro"], femea: [] }, "búfalo_dágua": { macho: ["Cinzento", "Preto", "Laranja"], femea: [] }, "búfalo_africano": { macho: ["Cinzento", "Pardo", "Preto"], femea: [] }, "cabra_da_montanha": { macho: ["Bege", "Branco", "Cinza Claro", "Pardo Claro"], femea: [] }, "cabra_de_leque": { macho: ["Bronzeado", "Laranja", "Pardo Escuro"], femea: [] }, "cabra_selvagem": { macho: ["Amarelado", "Branco", "Pardo e Branco", "Pardo Negro", "Preto e Branco"], femea: [] }, "caititu": { macho: ["Cinza Escuro", "Cinzento", "Pardo", "Pardo Escuro"], femea: [] }, "camurça": { macho: ["Cor de Mel", "Pardo", "Pardo e Cinza", "Pardo Escuro"], femea: [] }, "canguru_cinza_oriental": { macho: ["Cinzento", "Pardo e Cinza", "Pardo"], femea: [] }, "caribu": { macho: ["Pardo Claro", "Pardo Escuro"], femea: [] }, "caribu_da_floresta_boreal": { macho: ["Pardo Escuro", "Pardo Claro"], femea: [] }, "carneiro_azul": { macho: ["Cinza Ardósia", "Pardo", "Cinza Azulado", "Amarelo"], femea: [] }, "carneiro_selvagem": { macho: ["Preto", "Pardo", "Cinzento", "Bronze"], femea: [] }, "castor_norte_americano": { macho: ["Pardo Claro", "Pardo Escuro", "Marrom Avermelhado"], femea: ["Pardo Claro", "Pardo Escuro", "Marrom Avermelhado"] }, "cervo_almiscarado": { macho: ["Pardo e Cinza", "Pardo Escuro"], femea: [] }, "cervo_canadense": { macho: ["Juba Marrom", "Escuro"], femea: [] }, "cervo_do_pântano": { macho: ["Pardo", "Pardo Claro", "Vermelho", "Pardo Escuro", "Vermelho Escuro"], femea: [] }, "cervo_de_timor": { macho: ["Dois Tons", "Pardo", "Pardo Claro", "Pardo e Branco"], femea: [] }, "cervo_sika": { macho: ["Escuro e Pintado", "Pardo", "Pintado", "Preto"], femea: [] }, "cervo_porco_indiano": { macho: ["Pardo", "Escuro e Pintado", "Pardo Escuro", "Pintado"], femea: [] }, "chital": { macho: ["Pintado", "Escuro"], femea: [] }, "chacal_listrado": { macho: ["Pardo Claro", "Pardo Cinza", "Cinzento"], femea: [] }, "codorna_de_restolho": { macho: ["Pardo", "Pardo e Cinza", "Pardo Escuro"], femea: [] }, "codorniz_da_virgínia": { macho: ["Cinzento", "Pardo", "Pardo Avermelhado"], femea: ["Cinzento", "Pardo", "Pardo Avermelhado"] }, "coelho_da_flórida": { macho: ["Cinza Claro", "Cinzento", "Pardo", "Pardo Claro"], femea: ["Cinza Claro", "Cinzento", "Pardo", "Pardo Claro"] }, "coelho_europeu": { macho: ["Bronzeado", "Pardo", "Pardo Claro", "Pardo Escuro"], femea: [] }, "coiote": { macho: ["Cinza Escuro", "Pardo e Cinza"], femea: [] }, "corça": { macho: ["Bronzeado", "Cinza Escuro", "Pardo"], femea: [] }, "crocodilo_de_água_salgada": { macho: ["Cinzento", "Oliva", "Pardo Escuro"], femea: [] }, "cudo_menor": { macho: ["Cinzento"], femea: [] }, "cão_guaxinim": { macho: ["Cinzento", "Pardo Claro", "Preto e Branco"], femea: [] }, "faisão_de_pescoço_anelado": { macho: ["Cinzento", "Muda", "Pardo", "Pardo e Branco"], femea: [] }, "frisada": { macho: ["Cinzento", "Plum. de Inverno"], femea: [] }, "galinha_montês": { macho: ["Cinzento", "Escuro", "Pardo", "Pardo Claro"], femea: [] }, "galo_lira": { macho: ["Escuro"], femea: [] }, "gamo": { macho: ["Escuro", "Escuro e Pintado", "Pintado", "Branco", "Chocolate"], femea: [] }, "ganso_bravo": { macho: ["Pardo", "Cinzento"], femea: [] }, "ganso_campestre_da_tundra": { macho: ["Cinza Claro", "Cinza Escuro", "Pardo"], femea: [] }, "ganso_das_neves": { macho: ["Variação Branca", "Variação Azul", "Variação Interm", "Híbrido"], femea: [] }, "ganso_do_canadá": { macho: ["Marrom Híbrido", "Pardo e Cinza"], femea: [] }, "ganso_pega": { macho: ["Amarelo", "Bordô", "Laranja"], femea: [] }, "gnu_de_cauda_preta": { macho: ["Cinza escuro", "Cinzento", "Ouro"], femea: [] }, "guaxinim_comum": { macho: ["Amarelado", "Cinzento", "Pardo"], femea: [] }, "iaque_selvagem": { macho: ["Pardo Escuro", "Vermelho Escuro", "Preto Profundo", "Marrom Profundo", "Ouro"], femea: [] }, "ibex_de_beceite": { macho: ["Cinzento", "Laranja", "Marrom Híbrido", "Pardo e Cinza"], femea: [] }, "ibex_de_gredos": { macho: ["Cinza Claro", "Marrom Híbrido", "Cinzento", "Pardo e Cinza"], femea: [] }, "ibex_de_ronda": { macho: ["Cinzento", "Marrom Híbrido", "Pardo", "Pardo e Cinza"], femea: [] }, "ibex_espanhol_do_sudeste": { macho: ["pardo hibrido", "pardo acinzentado", "cinza claro", "laranja"], femea: [] }, "javali": { macho: ["Preto e Dourado", "pardo claro variação 1", "pardo claro variação 2"], femea: [] }, "javali_africano": { macho: ["Cinzento Escuro", "Pardo Avermelhado"], femea: [] }, "lebre_antílope": { macho: ["Cinzento", "Mosqueado", "Pardo Escuro"], femea: [] }, "lebre_da_cauda_branca": { macho: ["Bege", "Cinzento", "Pardo", "Pardo Claro"], femea: [] }, "lebre_da_eurásia": { macho: ["Branco"], femea: ["Branco"] }, "lebre_europeia": { macho: ["pardo", "pardo escuro", "pardo claro", "cinza"], femea: [] }, "lebre_nuca_dourada": { macho: ["Castanho", "Pardo", "Cinzento"], femea: ["Castanho", "Pardo", "Cinzento"] }, "lebre_peluda": { macho: ["Cinza Claro", "Pardo Claro", "Pardo Escuro", "Muda"], femea: ["Cinza Claro", "Pardo Claro", "Pardo Escuro", "Muda"] }, "leão": { macho: ["Bronzeado", "Pardo Claro"], femea: [] }, "leopardo_das_neves": { macho: ["Neve", "Caramelo"], femea: [] }, "lince_euroasiática": { macho: ["Cinzento", "Pardo Claro"], femea: [] }, "lince_pardo_do_méxico": { macho: ["Bronzeado", "Cinzento", "Pardo", "Vermelho"], femea: [] }, "lobo_cinzento": { macho: ["Cinzento"], femea: [] }, "lobo_ibérico": { macho: ["Cinzento", "Pardo e Cinza"], femea: [] }, "marreca_arrebio": { macho: ["Eclipse", "Cinza", "Eritrístico"], femea: [] }, "marreca_carijó": { macho: ["Canela", "Vermelho", "Malhado"], femea: [] }, "marrequinha_americana": { macho: ["Verde Claro"], femea: [] }, "marrequinha_comum": { macho: ["Verde Claro", "Verde Escuro"], femea: [] }, "muflão_ibérico": { macho: ["Pardo", "Pardo Claro"], femea: [] }, "muntjac_vermelho_do_norte": { macho: ["Albino", "Melânico", "Leucismo variação 1", "Leucismo variação 2", "Vermelho variação 1", "Vermelho variação 2"], femea: [] }, "nilgó": { macho: ["Azul", "Pardo Escuro"], femea: [] }, "onça_parda": { macho: ["Pardo Claro", "Vermelho Escuro", "Cinzento"], femea: [] }, "oryx_do_cabo": { macho: ["Cinza Claro", "Cinzento"], femea: ["Cinza Claro", "Cinzento"] }, "pato_carolino": { macho: ["Escuro", "Prata Diluído", "Padrão", "Dourado Eritrístico"], femea: [] }, "pato_harlequim": { macho: ["Cinza Escuro", "Malhado"], femea: [] }, "pato_olho_de_ouro": { macho: ["Preto"], femea: [] }, "pato_real": { macho: ["Malhado", "Pardo Negro", "Marrom Híbrido"], femea: [] }, "peru": { macho: ["Pardo", "Pardo Claro", "Pardo Escuro"], femea: [] }, "peru_selvagem": { macho: ["Bronze", "Bronze Claro", "Pardo", "Pardo Claro"], femea: [] }, "peru_selvagem_do_rio_grande": { macho: ["Pardo", "Pardo Claro", "Siena", "Siena Claro"], femea: [] }, "piadeira": { macho: ["Cinzento", "Pardo"], femea: [] }, "porco_selvagem": { macho: ["manchas pretas variação 1", "manchas pretas variação 2", "hibrido marrom variação 1", "hibrido marrom variação 2", "Preto", "Preto e Dourado"], femea: [] }, "raposa_cinzenta": { macho: ["Cinzento", "Dois Tons", "Vermelho"], femea: ["Cinzento", "Dois Tons", "Vermelho"] }, "raposa_tibetana": { macho: ["Laranja", "Vermelho", "Cinzento", "Pardo"], femea: [] }, "raposa_vermelha": { macho: ["Laranja", "Vermelho", "Vermelho Escuro"], femea: [] }, "rena": { macho: ["Pardo Claro", "Pardo Escuro"], femea: [] }, "sambar": { macho: ["Pardo", "Pardo Claro", "Pardo Escuro"], femea: [] }, "tahr": { macho: ["Pardo Avermelhado", "Palha", "Pardo Claro"], femea: [] }, "tetraz_azul": { macho: ["Muda", "Cinza Ardósia"], femea: [] }, "tetraz_grande": { macho: ["Escuro"], femea: [] }, "tigre_de_bengala": { macho: ["Laranja"], femea: [] }, "urso_cinzento": { macho: ["Pardo e Cinza"], femea: [] }, "urso_negro": { macho: ["Escuro", "Preto", "Cinzento"], femea: [] }, "urso_pardo": { macho: ["Canela", "Amarelo", "Pardo escuro", "Ouro", "Cinza", "Pardo claro", "Pardo avermelhado", "Espírito"], femea: [] }, "veado_das_montanhas_rochosas": { macho: ["Cinza Claro", "Pardo", "Pardo Claro"], femea: [] }, "veado_de_cauda_branca": { macho: ["Bronzeado", "Pardo", "Pardo Escuro"], femea: [] }, "veado_de_cauda_preta": { macho: ["Cinza Escuro", "Cinzento", "Pardo e Cinza"], femea: [] }, "veado_mula": { macho: ["Cinzento", "Pardo", "Amarelado"], femea: [] }, "veado_de_roosevelt": { macho: ["Bronzeado", "Laranja", "Pardo"], femea: [] }, "veado_vermelho": { macho: ["Pardo", "Pardo Claro", "Pardo Escuro"], femea: [] }, "lagópode_branco": { macho: ["Bicolor", "Muda", "Mosqueado"], femea: [] }, "lagópode_escocês": { macho: ["Bicolor", "Muda"], femea: [] }, "zarro_negrinha": { macho: ["Preto"], femea: [] }, "zarro_castanho": { macho: ["Pardo Escuro", "Pardo Avermelhado"], femea: [] } };
const reservesData = { layton_lake: { name: "Lagos de Layton", image: "reservas/layton_lake.png", animals: ["alce", "veado_de_cauda_branca", "veado_de_cauda_preta", "veado_de_roosevelt", "urso_negro", "coiote", "pato_real", "lebre_da_cauda_branca"] }, hirschfelden: { name: "Hirschfelden", image: "reservas/hirschfelden.png", animals: ["gamo", "corça", "veado_vermelho", "javali", "bisão_europeu", "raposa_vermelha", "ganso_do_canadá", "coelho_europeu", "faisão_de_pescoço_anelado"] }, medved_taiga: { name: "Taiga Medved", image: "reservas/medved_taiga.png", animals: ["alce", "rena", "tetraz_grande", "cervo_almiscarado", "urso_pardo", "javali", "lince_euroasiática", "lobo_cinzento"] }, vurhonga_savanna: { name: "Savana Vurhonga", image: "reservas/vurhonga_savanna.png", animals: ["chacal_listrado", "lebre_nuca_dourada", "piadeira", "cudo_menor", "cabra_de_leque", "javali_africano", "gnu_de_cauda_preta", "búfalo_africano", "leão", "oryx_do_cabo", "antílope_negro"] }, parque_fernando: { name: "Parque Fernando", image: "reservas/parque_fernando.png", animals: ["veado_vermelho", "marreca_carijó", "caititu", "veado_mula", "onça_parda", "antílope_negro", "búfalo_dágua", "chital"] }, yukon_valley: { name: "Vale do Yukon", image: "reservas/yukon_valley.png", animals: ["caribu", "ganso_do_canadá", "alce", "urso_cinzento", "lobo_cinzento", "bisão_das_planícies", "raposa_vermelha", "pato_harlequim"] }, cuatro_colinas: { name: "Cuatro Colinas", image: "reservas/cuatro_colinas.png", animals: ["ibex_de_gredos", "faisão_de_pescoço_anelado", "ibex_de_beceite", "ibex_espanhol_do_sudeste", "ibex_de_ronda", "muflão_ibérico", "lobo_ibérico", "javali", "corça", "lebre_europeia", "veado_vermelho"] }, silver_ridge_peaks: { name: "Picos de Silver Ridge", image: "reservas/silver_ridge_peaks.png", animals: ["antilocapra", "carneiro_selvagem", "bisão_das_planícies", "cabra_da_montanha", "veado_mula", "onça_parda", "urso_negro", "veado_das_montanhas_rochosas", "peru_selvagem"] }, te_awaroa: { name: "Te Awaroa", image: "reservas/te_awaroa.png", animals: ["veado_vermelho", "gamo", "cabra_selvagem", "porco_selvagem", "cervo_sika", "tahr", "peru_selvagem", "camurça", "coelho_europeu", "pato_real"] }, rancho_del_arroyo: { name: "Rancho del Arroyo", image: "reservas/rancho_del_arroyo.png", animals: ["veado_mula", "veado_de_cauda_branca", "carneiro_selvagem", "antilocapra", "caititu", "coiote", "lince_pardo_do_mexico", "peru_selvagem_do_rio_grande", "faisão_de_pescoço_anelado", "lebre_antílope"] }, mississippi_acres: { name: "Mississippi Acres", image: "reservas/mississippi_acres.png", animals: ["veado_de_cauda_branca", "codorniz_da_virgínia", "marrequinha_americana", "peru", "porco_selvagem", "urso_negro", "raposa_cinzenta", "guaxinim_comum", "coelho_da_flórida", "jacaré_americano"] }, revontuli_coast: { name: "Costa de Revontuli", image: "reservas/revontuli_coast.png", animals: ["galinha_montês", "veado_de_cauda_branca", "urso_pardo", "alce", "ganso_bravo", "ganso_campestre_da_tundra", "ganso_do_canadá", "lagópode_branco", "lagópode_escocês", "pato_real", "piadeira", "tetraz_grande", "cão_guaxinim", "lince_euroasiática", "galo_lira", "lebre_da_eurásia", "marrequinha_comum", "pato_olho_de_ouro", "zarro_negrinha", "veado_de_cauda_preta"] }, new_england_mountains: { name: "New England Mountains", image: "reservas/new_england_mountains.png", animals: ["alce", "codorniz_da_virgínia", "coelho_da_flórida", "faisão_de_pescoço_anelado", "marrequinha_americana", "pato_olho_de_ouro", "pato_real", "peru_selvagem", "guaxinim_comum", "lince_pardo_do_mexico", "raposa_cinzenta", "veado_de_cauda_branca", "urso_negro", "coiote", "raposa_vermelha", "gamo"] }, emerald_coast: { name: "Emerald Coast", image: "reservas/emerald_coast.png", animals: ["canguru_cinza_oriental", "codorna_de_restolho", "raposa_vermelha", "cabra_selvagem", "cervo_porco_indiano", "porco_selvagem", "veado_vermelho", "sambar", "cervo_de_timor", "gamo", "bantengue", "crocodilo_de_água_salgada", "ganso_pega", "chital"] }, sundarpatan: { name: "Sundarpatan", image: "reservas/sundarpatan.png", animals: ["antílope_negro", "ganso_bravo", "lebre_peluda", "muntjac_vermelho_do_norte", "raposa_tibetana", "tahr", "carneiro_azul", "cervo_do_pântano", "nilgó", "búfalo_dágua", "leopardo_das_neves", "iaque_selvagem", "tigre_de_bengala", "javali"] }, salzwiesen: { name: "Salzwiesen Park", image: "reservas/salzwiesen.png", animals: ["coelho_europeu", "frisada", "galo_lira", "guaxinim_comum", "raposa_vermelha", "ganso_campestre_da_tundra", "faisão_de_pescoço_anelado", "cão_guaxinim", "ganso_bravo", "marrequinha_comum", "pato_olho_de_ouro", "pato_real", "piadeira", "zarro_negrinha", "zarro_castanho", "veado_de_cauda_preta"] }, askiy_ridge: { name: "Askiy Ridge", image: "reservas/askiy_ridge.png", animals: ["alce", "caribu_da_floresta_boreal", "urso_negro", "veado_mula", "bisão_da_floresta", "cabra_da_montanha", "antilocapra", "tetraz_azul", "pato_real", "pato_carolino", "marreca_arrebio", "ganso_do_canadá", "ganso_das_neves", "lobo_cinzento", "cervo_canadense", "veado_de_cauda_branca", "faisão_de_pescoço_anelado", "carneiro_selvagem", "castor_norte_americano"] } };
const multiMountsData = { "a_fuga": { name: "A Fuga", animals: [{ slug: "veado_vermelho", gender: "macho" },{ slug: "veado_vermelho", gender: "femea" }] }, "abraco_do_urso": { name: "Abraço do Urso", animals: [{ slug: "urso_cinzento", gender: "macho" },{ slug: "urso_cinzento", gender: "macho" }] }, "adeus_filho": { name: "Adeus, Filho", animals: [{ slug: "bisão_das_planícies", gender: "macho" },{ slug: "lobo_cinzento", gender: "macho" },{ slug: "lobo_cinzento", gender: "macho" }] }, "admiralces": { name: "Admiralces", animals: [{ slug: "alce", gender: "macho" },{ slug: "codorniz_da_virgínia", gender: "macho" }] }, "almoco_da_raposa": { name: "Almoço da Raposa", animals: [{ slug: "raposa_vermelha", gender: "macho" },{ slug: "lebre_da_cauda_branca", gender: "macho" }] }, "banquete_no_ar": { name: "Banquete no Ar", animals: [{ slug: "raposa_vermelha", gender: "macho" },{ slug: "faisão_de_pescoço_anelado", gender: "macho" }] }, "brincadeira_de_aves": { name: "Brincadeira de Aves", animals: [{ slug: "lagópode_escocês", gender: "macho" },{ slug: "cão_guaxinim", gender: "macho" }] }, "brincando_de_briga": { name: "Brincando de Briga", animals: [{ slug: "lince_euroasiática", gender: "macho" },{ slug: "lince_euroasiática", gender: "femea" }] }, "caudas_brancas_unidas": { name: "Caudas Brancas Unidas", animals: [{ slug: "veado_de_cauda_branca", gender: "macho" },{ slug: "veado_de_cauda_branca", gender: "macho" },{ slug: "veado_de_cauda_branca", gender: "macho" }] }, "colisao": { name: "Colisão", animals: [{ slug: "veado_de_cauda_preta", gender: "macho" },{ slug: "onça_parda", gender: "macho" }] }, "competicao_amistosa": { name: "Competição Amistosa", animals: [{ slug: "coiote", gender: "macho" },{ slug: "coiote", gender: "macho" },{ slug: "lebre_da_cauda_branca", gender: "macho" }] }, "corcas_unidas": { name: "Corças Unidas", animals: [{ slug: "corça", gender: "macho" },{ slug: "corça", gender: "macho" },{ slug: "corça", gender: "macho" }] }, "davi_e_golias": { name: "Davi e Golias", animals: [{ slug: "ganso_do_canadá", gender: "macho" },{ slug: "bisão_europeu", gender: "macho" }] }, "de_cabeca": { name: "De Cabeça", animals: [{ slug: "ibex_de_beceite", gender: "macho" },{ slug: "ibex_de_gredos", gender: "macho" }] }, "decolagem_de_emergencia": { name: "Decolagem de Emergência", animals: [{ slug: "coiote", gender: "macho" },{ slug: "pato_real", gender: "macho" },{ slug: "pato_real", gender: "macho" },{ slug: "pato_real", gender: "femea" }] }, "despedida_do_solteiros": { name: "Despedida dos Solteiros", animals: [{ slug: "veado_mula", gender: "macho" },{ slug: "veado_mula", gender: "femea" },{ slug: "veado_mula", gender: "femea" }] }, "dois_tipos_de_perus": { name: "Dois Tipos de Perus", animals: [{ slug: "peru_selvagem", gender: "macho" },{ slug: "peru_selvagem_do_rio_grande", gender: "macho" }] }, "espionagem_tatica": { name: "Espionagem Tática", animals: [{ slug: "onça_parda", gender: "femea" },{ slug: "veado_de_roosevelt", gender: "macho" }] }, "faisoes_em_fuga": { name: "Faisões em Fuga", animals: [{ slug: "faisão_de_pescoço_anelado", gender: "macho" },{ slug: "faisão_de_pescoço_anelado", gender: "macho" }] }, "falso_tronco": { name: "Falso Tronco", animals: [{ slug: "jacaré_americano", gender: "macho" },{ slug: "guaxinim_comum", gender: "macho" }] }, "fantasma_da_montanha": { name: "Fantasma da Montanha", animals: [{ slug: "leopardo_das_neves", gender: "macho" },{ slug: "carneiro_azul", gender: "macho" }] }, "fartura_de_bisoes": { name: "Fartura de Bisões", animals: [{ slug: "bisão_europeu", gender: "macho" },{ slug: "bisão_europeu", gender: "macho" }] }, "gamos_unidos": { name: "Gamos Unidos", animals: [{ slug: "gamo", gender: "macho" },{ slug: "gamo", gender: "macho" },{ slug: "gamo", gender: "macho" }] }, "ganha_pao": { name: "Ganha-pão", animals: [{ slug: "búfalo_africano", gender: "macho" },{ slug: "leão", gender: "macho" },{ slug: "leão", gender: "femea" },{ slug: "leão", gender: "femea" }] }, "gansos_zangados": { name: "Gansos Zangados", animals: [{ slug: "ganso_do_canadá", gender: "macho" },{ slug: "ganso_do_canadá", gender: "macho" }] }, "gluglu": { name: "Gluglu", animals: [{ slug: "peru_selvagem", gender: "macho" },{ slug: "peru_selvagem", gender: "femea" },{ slug: "peru_selvagem", gender: "femea" }] }, "lanchinho_de_tigre": { name: "Lanchinho de Tigre", animals: [{ slug: "tahr", gender: "macho" },{ slug: "tahr", gender: "femea" },{ slug: "tahr", gender: "femea" }] }, "laod_a_lado": { name: "Laod a Lado", animals: [{ slug: "veado_de_cauda_branca", gender: "macho" },{ slug: "veado_de_cauda_branca", gender: "macho" }] }, "lebres_rivais": { name: "Lebres Rivais", animals: [{ slug: "lebre_antílope", gender: "macho" },{ slug: "lebre_antílope", gender: "macho" }] }, "lobo_alfa": { name: "Lobo Alfa", animals: [{ slug: "lobo_cinzento", gender: "macho" },{ slug: "lobo_cinzento", gender: "femea" },{ slug: "lobo_cinzento", gender: "femea" }] }, "marujos_de_agua_doce": { name: "Marujos de Água Doce", animals: [{ slug: "faisão_de_pescoço_anelado", gender: "macho" },{ slug: "tetraz_grande", gender: "macho" },{ slug: "ganso_bravo", gender: "macho" },{ slug: "ganso_campestre_da_tundra", gender: "macho" }] }, "necessidades_basicas": { name: "Necessidades Básicas", animals: [{ slug: "urso_negro", gender: "macho" },{ slug: "urso_negro", gender: "macho" }] }, "o_grand_slam": { name: "O Grand Slam", animals: [{ slug: "ibex_de_beceite", gender: "macho" },{ slug: "ibex_de_gredos", gender: "macho" },{ slug: "ibex_de_ronda", gender: "macho" },{ slug: "ibex_espanhol_do_sudeste", gender: "macho" }] }, "operador_suave": { name: "Operador Suave", animals: [{ slug: "tetraz_grande", gender: "macho" },{ slug: "tetraz_grande", gender: "femea" },{ slug: "tetraz_grande", gender: "femea" }] }, "os_tres_patinhos": { name: "Os Três Patinhos", animals: [{ slug: "piadeira", gender: "macho" },{ slug: "zarro_castanho", gender: "macho" },{ slug: "frisada", gender: "macho" }] }, "parceiros_no_crime": { name: "Parceiros no Crime", animals: [{ slug: "raposa_vermelha", gender: "macho" },{ slug: "raposa_vermelha", gender: "macho" }] }, "presas_a_mostra": { name: "Presas à Mostra", animals: [{ slug: "muflão_ibérico", gender: "macho" },{ slug: "lobo_ibérico", gender: "macho" },{ slug: "lobo_ibérico", gender: "macho" },{ slug: "lobo_ibérico", gender: "macho" }] }, "procos_do_mato_em_conflito": { name: "Procos-do-Mato em Conflito", animals: [{ slug: "caititu", gender: "macho" },{ slug: "caititu", gender: "macho" }] }, "ramboru": { name: "Ramboru", animals: [{ slug: "canguru_cinza_oriental", gender: "macho" },{ slug: "canguru_cinzenta_oriental", gender: "macho" }] }, "raposas_adversarias": { name: "Raposas Adversárias", animals: [{ slug: "raposa_vermelha", gender: "macho" },{ slug: "raposa_cinzenta", gender: "macho" }] }, "realeza": { name: "Realeza", animals: [{ slug: "leão", gender: "macho" },{ slug: "leão", gender: "femea" }] }, "rixa_de_aves": { name: "Rixa de Aves", animals: [{ slug: "galo_lira", gender: "macho" },{ slug: "galo_lira", gender: "macho" }] }, "saindo_de_fininho": { name: "Saindo de Fininho", animals: [{ slug: "pato_real", gender: "macho" },{ slug: "pato_olho_de_ouro", gender: "macho" },{ slug: "zarro_negrinha", gender: "macho" },{ slug: "marrequinha_comum", gender: "macho" },{ slug: "piadeira", gender: "macho" },{ slug: "zarro_castanho", gender: "macho" },{ slug: "frisada", gender: "macho" }] }, "tahr_angulo_amoroso": { name: "Tahr-ângulo Amoroso", animals: [{ slug: "tigre_de_bengala", gender: "macho" },{ slug: "cervo_do_pântano", gender: "macho" }] }, "treno_vendido_separadamente": { name: "Trenó Vendido Separadamente", animals: [{ slug: "rena", gender: "macho" },{ slug: "rena", gender: "macho" },{ slug: "rena", gender: "macho" }] }, "turma_dos_coelhos": { name: "Turma dos Coelhos", animals: [{ slug: "lebre_da_cauda_branca", gender: "macho" },{ slug: "lebre_da_cauda_branca", gender: "macho" },{ slug: "lebre_da_cauda_branca", gender: "femea" },{ slug: "lebre_da_cauda_branca", gender: "femea" }] }, "um_crocodilo_sortudo": { name: "Um Crocodilo Sortudo", animals: [{ slug: "ganso_pega", gender: "macho" },{ slug: "crocodilo_de_água_salgada", gender: "macho" }] }, "um_par_de_predadores": { name: "Um Par de Predadores", animals: [{ slug: "coiote", gender: "macho" },{ slug: "lince_pardo_do_mexico", gender: "macho" }] }, "vigilancia": { name: "Vigilância", animals: [{ slug: "cudo_menor", gender: "macho" },{ slug: "cudo_menor", gender: "femea" }] }, "viver_amar_lenhar": { name: "Viver, Amar, Lenhar", animals: [{ slug: "castor_norte_americano", gender: "macho" },{ slug: "castor_norte_americano", gender: "femea" }] } };

// Global app container reference
let appContainer;

// --- FUNÇÕES E LÓGICA PRINCIPAL ---

/**
 * Renders the main navigation hub of the application.
 */
function renderNavigationHub() {
    appContainer.innerHTML = `
        <div class="navigation-hub">
            <h1 class="hub-title">Álbum de Caça</h1>
            <div class="nav-card" id="nav-pelagens">
                <i class="fas fa-paw"></i>
                <span>Pelagens Raras</span>
            </div>
            <div class="nav-card" id="nav-diamantes">
                <i class="fas fa-gem"></i>
                <span>Diamantes</span>
            </div>
            <div class="nav-card" id="nav-greats">
                <i class="fas fa-crown"></i>
                <span>Great Ones</span>
            </div>
            <div class="nav-card" id="nav-super-raros">
                <i class="fas fa-star"></i>
                <span>Super Raros</span>
            </div>
            <div class="nav-card" id="nav-reservas">
                <i class="fas fa-map-marked-alt"></i>
                <span>Reservas</span>
            </div>
            <div class="nav-card" id="nav-multi-mounts">
                <i class="fas fa-mountain"></i>
                <span>Montagens Múltiplas</span>
            </div>
            <div class="nav-card" id="nav-grind-hub">
                <i class="fas fa-crosshairs"></i>
                <span>Contador de Grind</span>
            </div>
            <div class="nav-card" id="nav-progress">
                <i class="fas fa-chart-bar"></i>
                <span>Meu Progresso</span>
            </div>
            <div class="nav-card" id="nav-ranking">
                <i class="fas fa-trophy"></i>
                <span>Ranking de Caça</span>
            </div>
        </div>
    `;
    setupLogoutButton(currentUser);

    document.getElementById('nav-pelagens').addEventListener('click', () => renderMainView('pelagens'));
    document.getElementById('nav-diamantes').addEventListener('click', () => renderMainView('diamantes'));
    document.getElementById('nav-greats').addEventListener('click', () => renderGreatsView());
    document.getElementById('nav-super-raros').addEventListener('click', () => renderSuperRaresView());
    document.getElementById('nav-reservas').addEventListener('click', () => renderReservesView());
    document.getElementById('nav-multi-mounts').addEventListener('click', () => renderMultiMountsView());
    document.getElementById('nav-grind-hub').addEventListener('click', () => renderGrindHub());
    document.getElementById('nav-progress').addEventListener('click', () => renderProgressView());
    document.getElementById('nav-ranking').addEventListener('click', () => renderRankingView());
}

/**
 * Renders the main view for a given category (pelagens or diamantes).
 * @param {string} category 'pelagens' or 'diamantes'
 */
function renderMainView(category) {
    const data = category === 'pelagens' ? rareFursData : diamondFursData;
    const title = category === 'pelagens' ? 'Pelagens Raras' : 'Diamantes';

    let animalsHtml = '';
    items.forEach(animal => {
        const animalSlug = animal.toLowerCase().replace(/ /g, '_').replace(/-/g, '_');
        const animalData = data[animalSlug];
        
        let completedCount = 0;
        let totalCount = 0;

        if (animalData) {
            // Check male furs
            if (animalData.macho) {
                totalCount += animalData.macho.length;
                animalData.macho.forEach(fur => {
                    if (savedData[category] && savedData[category][animalSlug] && savedData[category][animalSlug].macho && savedData[category][animalSlug].macho[fur]) {
                        completedCount++;
                    }
                });
            }
            // Check female furs
            if (animalData.femea) {
                totalCount += animalData.femea.length;
                animalData.femea.forEach(fur => {
                    if (savedData[category] && savedData[category][animalSlug] && savedData[category][animalSlug].femea && savedData[category][animalSlug].femea[fur]) {
                        completedCount++;
                    }
                });
            }
        }

        const isCompleted = completedCount === totalCount && totalCount > 0;
        const isInProgress = completedCount > 0 && completedCount < totalCount;
        const cardClass = isCompleted ? 'completed' : (isInProgress ? 'inprogress' : '');

        animalsHtml += `
            <div class="animal-card ${cardClass}" data-animal-slug="${animalSlug}" data-category="${category}">
                <img src="https://placehold.co/110x110/2c2f33/e6e6e6?text=${animal.replace(/ /g, '+')}" alt="${animal}">
                <div class="info">${animal}</div>
                ${totalCount > 0 ? `<div class="progress-info">${completedCount}/${totalCount}</div>` : ''}
            </div>
        `;
    });

    appContainer.innerHTML = `
        <div class="main-content">
            <div class="page-header">
                <h2>${title}</h2>
                <button class="back-button" id="back-to-hub">Voltar</button>
            </div>
            <input type="text" id="animal-filter" class="filter-input" placeholder="Filtrar animais...">
            <div class="album-grid">
                ${animalsHtml}
            </div>
        </div>
    `;
    setupLogoutButton(currentUser);

    document.getElementById('back-to-hub').addEventListener('click', renderNavigationHub);
    document.getElementById('animal-filter').addEventListener('input', (e) => filterAnimals(e.target.value, category));

    document.querySelectorAll('.animal-card').forEach(card => {
        card.addEventListener('click', (e) => {
            const animalSlug = e.currentTarget.dataset.animalSlug;
            const category = e.currentTarget.dataset.category;
            renderDossierView(animalSlug, category);
        });
    });
}

/**
 * Filters animal cards based on search input.
 * @param {string} filterText The text to filter by.
 * @param {string} category The current category ('pelagens' or 'diamantes').
 */
function filterAnimals(filterText, category) {
    const animalCards = document.querySelectorAll('.animal-card');
    const lowerCaseFilterText = filterText.toLowerCase();

    animalCards.forEach(card => {
        const animalName = card.querySelector('.info').textContent.toLowerCase();
        if (animalName.includes(lowerCaseFilterText)) {
            card.style.display = '';
        } else {
            card.style.display = 'none';
        }
    });
}

/**
 * Renders the dossier view for a specific animal and category.
 * @param {string} animalSlug The slug of the animal.
 * @param {string} category The category ('pelagens' or 'diamantes').
 */
function renderDossierView(animalSlug, category) {
    const animalName = animalSlug.replace(/_/g, ' ').split(' ').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
    const data = category === 'pelagens' ? rareFursData : diamondFursData;
    const animalFurs = data[animalSlug];

    let tabsHtml = `
        <div class="dossier-tabs">
            <div class="dossier-tab ${category === 'pelagens' ? 'active' : ''}" data-tab="pelagens">Pelagens</div>
            <div class="dossier-tab ${category === 'diamantes' ? 'active' : ''}" data-tab="diamantes">Diamantes</div>
        </div>
    `;
    
    let fursHtml = '';
    if (animalFurs) {
        // Male furs
        if (animalFurs.macho && animalFurs.macho.length > 0) {
            fursHtml += `<h3>Macho</h3><div class="fur-grid">`;
            animalFurs.macho.forEach(fur => {
                const isCompleted = savedData[category] && savedData[category][animalSlug] && savedData[category][animalSlug].macho && savedData[category][animalSlug].macho[fur];
                const furClass = isCompleted ? 'completed' : 'incomplete';
                const score = isCompleted ? (savedData[category][animalSlug].macho[fur].score || 'N/A') : '';
                const scoreDisplay = isCompleted ? `<div class="score-display"><i class="fas fa-trophy"></i>${score}</div>` : `<div class="score-add-btn">Adicionar Pontuação</div>`;

                fursHtml += `
                    <div class="fur-card ${furClass}" data-animal-slug="${animalSlug}" data-gender="macho" data-fur="${fur}" data-completed="${isCompleted}">
                        <div class="info-header">
                            <span class="gender-tag">Macho</span>
                        </div>
                        <img src="https://placehold.co/120x120/333/fff?text=${animalSlug.replace(/_/g, '+')}+${fur.replace(/ /g, '+')}" alt="${fur}">
                        <div class="info">${fur}</div>
                        <div class="score-container" data-action="toggle-score-input">
                            ${scoreDisplay}
                        </div>
                        <button class="fullscreen-btn" data-image="https://placehold.co/800x600/333/fff?text=${animalSlug.replace(/_/g, '+')}+${fur.replace(/ /g, '+')}"><i class="fas fa-expand"></i></button>
                    </div>
                `;
            });
            fursHtml += `</div>`;
        }

        // Female furs
        if (animalFurs.femea && animalFurs.femea.length > 0) {
            fursHtml += `<h3>Fêmea</h3><div class="fur-grid">`;
            animalFurs.femea.forEach(fur => {
                const isCompleted = savedData[category] && savedData[category][animalSlug] && savedData[category][animalSlug].femea && savedData[category][animalSlug].femea[fur];
                const furClass = isCompleted ? 'completed' : 'incomplete';
                const score = isCompleted ? (savedData[category][animalSlug].femea[fur].score || 'N/A') : '';
                const scoreDisplay = isCompleted ? `<div class="score-display"><i class="fas fa-trophy"></i>${score}</div>` : `<div class="score-add-btn">Adicionar Pontuação</div>`;

                fursHtml += `
                    <div class="fur-card ${furClass}" data-animal-slug="${animalSlug}" data-gender="femea" data-fur="${fur}" data-completed="${isCompleted}">
                        <div class="info-header">
                            <span class="gender-tag">Fêmea</span>
                        </div>
                        <img src="https://placehold.co/120x120/333/fff?text=${animalSlug.replace(/_/g, '+')}+${fur.replace(/ /g, '+')}" alt="${fur}">
                        <div class="info">${fur}</div>
                        <div class="score-container" data-action="toggle-score-input">
                            ${scoreDisplay}
                        </div>
                        <button class="fullscreen-btn" data-image="https://placehold.co/800x600/333/fff?text=${animalSlug.replace(/_/g, '+')}+${fur.replace(/ /g, '+')}"><i class="fas fa-expand"></i></button>
                    </div>
                `;
            });
            fursHtml += `</div>`;
        }
    } else {
        fursHtml = `<p class="no-data-message">Nenhuma pelagem ou diamante disponível para este animal.</p>`;
    }

    appContainer.innerHTML = `
        <div class="main-content">
            <div class="page-header">
                <h2>${animalName} - ${category === 'pelagens' ? 'Pelagens' : 'Diamantes'}</h2>
                <button class="back-button" id="back-to-category">Voltar</button>
            </div>
            ${tabsHtml}
            <div class="dossier-content">
                ${fursHtml}
            </div>
        </div>
    `;
    setupLogoutButton(currentUser);

    document.getElementById('back-to-category').addEventListener('click', () => renderMainView(category));

    document.querySelectorAll('.dossier-tab').forEach(tab => {
        tab.addEventListener('click', (e) => {
            document.querySelectorAll('.dossier-tab').forEach(t => t.classList.remove('active'));
            e.target.classList.add('active');
            renderDossierView(animalSlug, e.target.dataset.tab);
        });
    });

    document.querySelectorAll('.fur-card').forEach(card => {
        card.addEventListener('click', (e) => {
            const target = e.target;
            const animalSlug = card.dataset.animalSlug;
            const gender = card.dataset.gender;
            const fur = card.dataset.fur;
            let isCompleted = card.dataset.completed === 'true';

            if (target.classList.contains('fullscreen-btn') || target.closest('.fullscreen-btn')) {
                const imageUrl = target.closest('.fullscreen-btn').dataset.image;
                openModal('image-viewer-modal', imageUrl);
                return;
            }

            if (target.closest('.score-container')) {
                if (!isCompleted) {
                    // Show input for score
                    const scoreContainer = target.closest('.score-container');
                    scoreContainer.innerHTML = `<input type="number" step="0.01" class="score-input" placeholder="Pontuação" data-action="save-score">`;
                    const scoreInput = scoreContainer.querySelector('.score-input');
                    scoreInput.focus();
                    scoreInput.addEventListener('keydown', (event) => {
                        if (event.key === 'Enter') {
                            const score = parseFloat(scoreInput.value);
                            if (!isNaN(score)) {
                                markFurCompleted(animalSlug, gender, fur, score, category);
                            } else {
                                scoreContainer.innerHTML = `<div class="score-add-btn">Adicionar Pontuação</div>`;
                            }
                        }
                    });
                    scoreInput.addEventListener('blur', () => {
                        const score = parseFloat(scoreInput.value);
                        if (!isNaN(score)) {
                            markFurCompleted(animalSlug, gender, fur, score, category);
                        } else {
                            scoreContainer.innerHTML = `<div class="score-add-btn">Adicionar Pontuação</div>`;
                        }
                    });
                } else {
                    // Toggle completion status if already completed
                    markFurCompleted(animalSlug, gender, fur, null, category, true); // Pass true to toggle
                }
            } else {
                // If clicking on the card itself (not score container or fullscreen button)
                if (!isCompleted) {
                    markFurCompleted(animalSlug, gender, fur, null, category);
                } else {
                    // If already completed, clicking the card (not score area) will unmark it
                    markFurCompleted(animalSlug, gender, fur, null, category, true);
                }
            }
        });
    });
}

/**
 * Marks a fur as completed or incomplete and saves the data.
 * @param {string} animalSlug The slug of the animal.
 * @param {string} gender The gender ('macho' or 'femea').
 * @param {string} fur The name of the fur.
 * @param {number|null} score The score, if applicable.
 * @param {string} category The category ('pelagens' or 'diamantes').
 * @param {boolean} toggle If true, toggles the completion status.
 */
function markFurCompleted(animalSlug, gender, fur, score = null, category, toggle = false) {
    if (!savedData[category]) {
        savedData[category] = {};
    }
    if (!savedData[category][animalSlug]) {
        savedData[category][animalSlug] = {};
    }
    if (!savedData[category][animalSlug][gender]) {
        savedData[category][animalSlug][gender] = {};
    }

    const isCurrentlyCompleted = savedData[category][animalSlug][gender][fur];

    if (toggle) {
        if (isCurrentlyCompleted) {
            delete savedData[category][animalSlug][gender][fur];
            console.log(`Pelagem/Diamante '${fur}' de '${animalSlug}' (${gender}) desmarcado.`);
        } else {
            savedData[category][animalSlug][gender][fur] = { completed: true, score: score };
            console.log(`Pelagem/Diamante '${fur}' de '${animalSlug}' (${gender}) marcado como completo.`);
        }
    } else {
        if (!isCurrentlyCompleted) {
            savedData[category][animalSlug][gender][fur] = { completed: true, score: score };
            console.log(`Pelagem/Diamante '${fur}' de '${animalSlug}' (${gender}) marcado como completo.`);
        }
    }
    
    saveData(savedData);
    renderDossierView(animalSlug, category); // Re-render to update UI
}

/**
 * Renders the Great Ones trophy room view.
 */
function renderGreatsView() {
    let greatsHtml = '';
    const animalSlugs = Object.keys(greatsFursData);

    if (animalSlugs.length === 0) {
        greatsHtml = `<p class="no-data-message">Nenhum Great One configurado.</p>`;
    } else {
        animalSlugs.forEach(animalSlug => {
            const animalName = animalSlug.replace(/_/g, ' ').split(' ').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
            const furs = greatsFursData[animalSlug];

            furs.forEach(fur => {
                const isCompleted = savedData.greats && savedData.greats[animalSlug] && savedData.greats[animalSlug][fur];
                const furClass = isCompleted ? 'completed' : 'incomplete';
                const killCount = isCompleted ? (savedData.greats[animalSlug][fur].kills || 0) : 0;
                const score = isCompleted ? (savedData.greats[animalSlug][fur].score || 'N/A') : '';
                const date = isCompleted ? (savedData.greats[animalSlug][fur].date || 'N/A') : '';

                greatsHtml += `
                    <div class="fur-card trophy-frame ${furClass}" data-animal-slug="${animalSlug}" data-fur="${fur}" data-completed="${isCompleted}">
                        <img src="https://placehold.co/120x120/4a3c31/ffd700?text=${animalSlug.replace(/_/g, '+')}+${fur.replace(/ /g, '+')}" alt="${fur}">
                        <div class="info-plaque">
                            <div class="info">${animalName}</div>
                            <div class="info">${fur}</div>
                            <div class="kill-counter"><i class="fas fa-crosshairs"></i>Mortes: ${killCount}</div>
                            <div class="kill-counter"><i class="fas fa-trophy"></i>Pontuação: ${score}</div>
                            <div class="kill-counter"><i class="fas fa-calendar-alt"></i>Data: ${date}</div>
                        </div>
                        <button class="fullscreen-btn" data-image="https://placehold.co/800x600/4a3c31/ffd700?text=${animalSlug.replace(/_/g, '+')}+${fur.replace(/ /g, '+')}"><i class="fas fa-expand"></i></button>
                    </div>
                `;
            });
        });
    }

    appContainer.innerHTML = `
        <div class="main-content">
            <div class="page-header">
                <h2>Great Ones (Sala de Troféus)</h2>
                <button class="back-button" id="back-to-hub">Voltar</button>
            </div>
            <div class="greats-grid">
                ${greatsHtml}
            </div>
        </div>
    `;
    setupLogoutButton(currentUser);

    document.getElementById('back-to-hub').addEventListener('click', renderNavigationHub);

    document.querySelectorAll('.fur-card.trophy-frame').forEach(card => {
        card.addEventListener('click', (e) => {
            const target = e.target;
            const animalSlug = card.dataset.animalSlug;
            const fur = card.dataset.fur;
            const isCompleted = card.dataset.completed === 'true';

            if (target.classList.contains('fullscreen-btn') || target.closest('.fullscreen-btn')) {
                const imageUrl = target.closest('.fullscreen-btn').dataset.image;
                openModal('image-viewer-modal', imageUrl);
                return;
            }

            if (!isCompleted) {
                // Open form to add Great One details
                openGreatOneForm(animalSlug, fur);
            } else {
                // Toggle completion status if already completed
                toggleGreatOneCompletion(animalSlug, fur);
            }
        });
    });
}

/**
 * Opens a form to add details for a Great One.
 * @param {string} animalSlug The slug of the animal.
 * @param {string} fur The name of the fur.
 */
function openGreatOneForm(animalSlug, fur) {
    const animalName = animalSlug.replace(/_/g, ' ').split(' ').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
    const formHtml = `
        <div class="modal-content-box">
            <h3>Adicionar Great One: ${animalName} - ${fur}</h3>
            <form id="add-great-one-form">
                <table>
                    <tr>
                        <td><label for="kills">Número de Mortes:</label></td>
                        <td><input type="number" id="kills" value="0" min="0"></td>
                    </tr>
                    <tr>
                        <td><label for="score">Pontuação:</label></td>
                        <td><input type="number" step="0.01" id="score" placeholder="Ex: 987.5"></td>
                    </tr>
                    <tr>
                        <td><label for="date">Data da Caça:</label></td>
                        <td><input type="date" id="date"></td>
                    </tr>
                </table>
                <div class="modal-buttons">
                    <button type="button" class="back-button" id="cancel-add-great-one">Cancelar</button>
                    <button type="submit" class="auth-button">Salvar Great One</button>
                </div>
            </form>
        </div>
    `;
    openModal('form-modal', formHtml);

    document.getElementById('cancel-add-great-one').addEventListener('click', () => closeModal('form-modal'));
    document.getElementById('add-great-one-form').addEventListener('submit', (e) => {
        e.preventDefault();
        const kills = parseInt(document.getElementById('kills').value);
        const score = parseFloat(document.getElementById('score').value);
        const date = document.getElementById('date').value;

        if (isNaN(kills) || isNaN(score) || !date) {
            alert('Por favor, preencha todos os campos corretamente.'); // Use a custom modal for this in a real app
            return;
        }

        if (!savedData.greats) {
            savedData.greats = {};
        }
        if (!savedData.greats[animalSlug]) {
            savedData.greats[animalSlug] = {};
        }
        savedData.greats[animalSlug][fur] = { kills, score, date, completed: true };
        saveData(savedData);
        closeModal('form-modal');
        renderGreatsView(); // Re-render to update UI
    });
}

/**
 * Toggles the completion status of a Great One.
 * @param {string} animalSlug The slug of the animal.
 * @param {string} fur The name of the fur.
 */
function toggleGreatOneCompletion(animalSlug, fur) {
    if (savedData.greats && savedData.greats[animalSlug] && savedData.greats[animalSlug][fur]) {
        delete savedData.greats[animalSlug][fur];
        console.log(`Great One '${fur}' de '${animalSlug}' desmarcado.`);
    }
    saveData(savedData);
    renderGreatsView(); // Re-render to update UI
}

/**
 * Renders the Super Rares view.
 */
function renderSuperRaresView() {
    let superRaresHtml = '';
    const superRares = { /* Add your super rare data here if available */ }; // Placeholder for super rare data

    if (Object.keys(superRares).length === 0) {
        superRaresHtml = `<p class="no-data-message">Nenhum Super Raro configurado.</p>`;
    } else {
        // Example: Loop through super rares and generate cards
        for (const animalSlug in superRares) {
            const animalName = animalSlug.replace(/_/g, ' ').split(' ').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
            superRares[animalSlug].forEach(fur => {
                const isCompleted = savedData.super_raros && savedData.super_raros[animalSlug] && savedData.super_raros[animalSlug][fur];
                const furClass = isCompleted ? 'completed' : 'incomplete';
                superRaresHtml += `
                    <div class="fur-card ${furClass}" data-animal-slug="${animalSlug}" data-fur="${fur}" data-completed="${isCompleted}">
                        <img src="https://placehold.co/120x120/333/e8bd4a?text=${animalSlug.replace(/_/g, '+')}+${fur.replace(/ /g, '+')}" alt="${fur}">
                        <div class="info">${animalName} - ${fur}</div>
                        <button class="fullscreen-btn" data-image="https://placehold.co/800x600/333/e8bd4a?text=${animalSlug.replace(/_/g, '+')}+${fur.replace(/ /g, '+')}"><i class="fas fa-expand"></i></button>
                    </div>
                `;
            });
        }
    }

    appContainer.innerHTML = `
        <div class="main-content">
            <div class="page-header">
                <h2>Super Raros</h2>
                <button class="back-button" id="back-to-hub">Voltar</button>
            </div>
            <div class="fur-grid">
                ${superRaresHtml}
            </div>
        </div>
    `;
    setupLogoutButton(currentUser);

    document.getElementById('back-to-hub').addEventListener('click', renderNavigationHub);

    document.querySelectorAll('.fur-card').forEach(card => {
        card.addEventListener('click', (e) => {
            const target = e.target;
            const animalSlug = card.dataset.animalSlug;
            const fur = card.dataset.fur;
            let isCompleted = card.dataset.completed === 'true';

            if (target.classList.contains('fullscreen-btn') || target.closest('.fullscreen-btn')) {
                const imageUrl = target.closest('.fullscreen-btn').dataset.image;
                openModal('image-viewer-modal', imageUrl);
                return;
            }
            
            // Toggle completion status
            if (!savedData.super_raros) {
                savedData.super_raros = {};
            }
            if (!savedData.super_raros[animalSlug]) {
                savedData.super_raros[animalSlug] = {};
            }

            if (isCompleted) {
                delete savedData.super_raros[animalSlug][fur];
                console.log(`Super Raro '${fur}' de '${animalSlug}' desmarcado.`);
            } else {
                savedData.super_raros[animalSlug][fur] = { completed: true };
                console.log(`Super Raro '${fur}' de '${animalSlug}' marcado como completo.`);
            }
            saveData(savedData);
            renderSuperRaresView(); // Re-render to update UI
        });
    });
}

/**
 * Renders the reserves view.
 */
function renderReservesView() {
    let reservesHtml = '';
    for (const slug in reservesData) {
        const reserve = reservesData[slug];
        let completedAnimals = 0;
        let totalAnimals = reserve.animals.length;

        reserve.animals.forEach(animalSlug => {
            const rareCount = rareFursData[animalSlug]?.macho?.length || 0;
            const rareFemaleCount = rareFursData[animalSlug]?.femea?.length || 0;
            const diamondCount = diamondFursData[animalSlug]?.macho?.length || 0;
            const diamondFemaleCount = diamondFursData[animalSlug]?.femea?.length || 0;

            const totalFurs = rareCount + rareFemaleCount + diamondCount + diamondFemaleCount;
            let currentFurs = 0;

            if (savedData.pelagens && savedData.pelagens[animalSlug]) {
                if (savedData.pelagens[animalSlug].macho) {
                    currentFurs += Object.keys(savedData.pelagens[animalSlug].macho).length;
                }
                if (savedData.pelagens[animalSlug].femea) {
                    currentFurs += Object.keys(savedData.pelagens[animalSlug].femea).length;
                }
            }
            if (savedData.diamantes && savedData.diamantes[animalSlug]) {
                if (savedData.diamantes[animalSlug].macho) {
                    currentFurs += Object.keys(savedData.diamantes[animalSlug].macho).length;
                }
                if (savedData.diamantes[animalSlug].femea) {
                    currentFurs += Object.keys(savedData.diamantes[animalSlug].femea).length;
                }
            }

            if (totalFurs > 0 && currentFurs === totalFurs) {
                completedAnimals++;
            }
        });

        const isCompleted = completedAnimals === totalAnimals && totalAnimals > 0;
        const cardClass = isCompleted ? 'completed' : '';

        reservesHtml += `
            <div class="reserve-card ${cardClass}" data-reserve-slug="${slug}">
                <div class="reserve-image-container">
                    <img src="https://placehold.co/280x140/2c2f33/e6e6e6?text=${reserve.name.replace(/ /g, '+')}" alt="${reserve.name}" class="reserve-card-image">
                </div>
                <div class="reserve-card-info-panel">
                    <h3>${reserve.name}</h3>
                    <div class="reserve-card-stats">
                        <span><i class="fas fa-paw"></i>${completedAnimals}/${totalAnimals}</span>
                        ${isCompleted ? '<span><i class="fas fa-crown"></i>Completa</span>' : ''}
                    </div>
                </div>
            </div>
        `;
    }

    appContainer.innerHTML = `
        <div class="main-content">
            <div class="page-header">
                <h2>Reservas</h2>
                <button class="back-button" id="back-to-hub">Voltar</button>
            </div>
            <div class="reserves-grid">
                ${reservesHtml}
            </div>
        </div>
    `;
    setupLogoutButton(currentUser);

    document.getElementById('back-to-hub').addEventListener('click', renderNavigationHub);

    document.querySelectorAll('.reserve-card').forEach(card => {
        card.addEventListener('click', (e) => {
            const reserveSlug = e.currentTarget.dataset.reserveSlug;
            renderReserveDossier(reserveSlug);
        });
    });
}

/**
 * Renders the dossier for a specific reserve.
 * @param {string} reserveSlug The slug of the reserve.
 */
function renderReserveDossier(reserveSlug) {
    const reserve = reservesData[reserveSlug];
    if (!reserve) {
        appContainer.innerHTML = `<p class="main-content">Reserva não encontrada.</p>`;
        return;
    }

    let animalsChecklistHtml = '';
    reserve.animals.forEach(animalSlug => {
        const animalName = animalSlug.replace(/_/g, ' ').split(' ').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
        
        const rareCount = rareFursData[animalSlug]?.macho?.length || 0;
        const rareFemaleCount = rareFursData[animalSlug]?.femea?.length || 0;
        const diamondCount = diamondFursData[animalSlug]?.macho?.length || 0;
        const diamondFemaleCount = diamondFursData[animalSlug]?.femea?.length || 0;

        const totalFurs = rareCount + rareFemaleCount + diamondCount + diamondFemaleCount;
        let currentFurs = 0;

        if (savedData.pelagens && savedData.pelagens[animalSlug]) {
            if (savedData.pelagens[animalSlug].macho) {
                currentFurs += Object.keys(savedData.pelagens[animalSlug].macho).length;
            }
            if (savedData.pelagens[animalSlug].femea) {
                currentFurs += Object.keys(savedData.pelagens[animalSlug].femea).length;
            }
        }
        if (savedData.diamantes && savedData.diamantes[animalSlug]) {
            if (savedData.diamantes[animalSlug].macho) {
                currentFurs += Object.keys(savedData.diamantes[animalSlug].macho).length;
            }
            if (savedData.diamantes[animalSlug].femea) {
                currentFurs += Object.keys(savedData.diamantes[animalSlug].femea).length;
            }
        }

        const progressPercentage = totalFurs > 0 ? (currentFurs / totalFurs) * 100 : 0;
        const isGreatOnePossible = greatsFursData[animalSlug] && greatsFursData[animalSlug].length > 0;
        const isGreatOneCompleted = savedData.greats && savedData.greats[animalSlug] && Object.keys(savedData.greats[animalSlug]).length > 0;


        animalsChecklistHtml += `
            <div class="animal-checklist-row" data-animal-slug="${animalSlug}">
                <img src="https://placehold.co/40x40/2c2f33/e6e6e6?text=${animalSlug.replace(/_/g, '+')}" alt="${animalName}" class="animal-icon">
                <div class="animal-name">${animalName}</div>
                <div class="mini-progress-bars">
                    <div class="mini-progress">
                        <span>Pelagens/Diamantes:</span>
                        <div class="mini-progress-bar-container">
                            <div class="mini-progress-bar" style="width: ${progressPercentage.toFixed(0)}%;"></div>
                        </div>
                        <span>${currentFurs}/${totalFurs}</span>
                    </div>
                </div>
                <div class="great-one-indicator ${isGreatOnePossible ? 'possible' : ''}">
                    <i class="fas fa-crown" title="${isGreatOnePossible ? 'Great One Possível' : 'Nenhum Great One'}"></i>
                    ${isGreatOneCompleted ? '<i class="fas fa-check-circle" style="color: var(--gold-color);"></i>' : ''}
                </div>
            </div>
        `;
    });

    appContainer.innerHTML = `
        <div class="main-content">
            <div class="page-header">
                <h2>${reserve.name}</h2>
                <button class="back-button" id="back-to-reserves">Voltar</button>
            </div>
            <div class="animal-checklist">
                ${animalsChecklistHtml}
            </div>
        </div>
    `;
    setupLogoutButton(currentUser);

    document.getElementById('back-to-reserves').addEventListener('click', renderReservesView);

    document.querySelectorAll('.animal-checklist-row').forEach(row => {
        row.addEventListener('click', (e) => {
            const animalSlug = e.currentTarget.dataset.animalSlug;
            renderDossierView(animalSlug, 'pelagens'); // Default to pelagens tab
        });
    });
}

/**
 * Renders the multi-mounts view.
 */
function renderMultiMountsView() {
    let mountsHtml = '';
    for (const slug in multiMountsData) {
        const mount = multiMountsData[slug];
        let completedAnimals = 0;
        let totalAnimals = mount.animals.length;

        mount.animals.forEach(animal => {
            const animalSlug = animal.slug;
            const gender = animal.gender;
            // For multi-mounts, we check if the diamond or rare fur of that animal/gender is completed
            // This is a simplified check, you might want to refine it based on specific fur requirements for each mount
            const isDiamondCompleted = savedData.diamantes && savedData.diamantes[animalSlug] && savedData.diamantes[animalSlug][gender] && Object.keys(savedData.diamantes[animalSlug][gender]).length > 0;
            const isRareCompleted = savedData.pelagens && savedData.pelagens[animalSlug] && savedData.pelagens[animalSlug][gender] && Object.keys(savedData.pelagens[animalSlug][gender]).length > 0;

            if (isDiamondCompleted || isRareCompleted) { // Assuming either rare or diamond counts for the mount
                completedAnimals++;
            }
        });

        const isCompleted = completedAnimals === totalAnimals;
        const cardClass = isCompleted ? 'completed' : '';

        let animalIconsHtml = '';
        mount.animals.forEach(animal => {
            const animalSlug = animal.slug;
            const animalName = animalSlug.replace(/_/g, ' ').split(' ').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
            animalIconsHtml += `<img src="https://placehold.co/40x40/2c2f33/e6e6e6?text=${animalName.replace(/ /g, '+')}" alt="${animalName}" title="${animalName} (${animal.gender})">`;
        });

        mountsHtml += `
            <div class="mount-card ${cardClass}" data-mount-slug="${slug}">
                <div class="mount-card-header">
                    <h3>${mount.name}</h3>
                    <span class="mount-progress">${completedAnimals}/${totalAnimals}</span>
                </div>
                <div class="mount-card-animals">
                    ${animalIconsHtml}
                </div>
                ${isCompleted ? '<div class="mount-completed-banner"><i class="fas fa-check"></i></div>' : ''}
            </div>
        `;
    }

    appContainer.innerHTML = `
        <div class="main-content">
            <div class="page-header">
                <h2>Montagens Múltiplas</h2>
                <button class="back-button" id="back-to-hub">Voltar</button>
            </div>
            <div class="mounts-grid">
                ${mountsHtml}
            </div>
        </div>
    `;
    setupLogoutButton(currentUser);

    document.getElementById('back-to-hub').addEventListener('click', renderNavigationHub);

    document.querySelectorAll('.mount-card').forEach(card => {
        card.addEventListener('click', (e) => {
            const mountSlug = e.currentTarget.dataset.mountSlug;
            renderMountDetailModal(mountSlug);
        });
    });
}

/**
 * Renders the detail modal for a specific multi-mount.
 * @param {string} mountSlug The slug of the multi-mount.
 */
function renderMountDetailModal(mountSlug) {
    const mount = multiMountsData[mountSlug];
    if (!mount) return;

    let detailListHtml = '';
    mount.animals.forEach(animal => {
        const animalName = animal.slug.replace(/_/g, ' ').split(' ').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
        const genderIcon = animal.gender === 'macho' ? '<i class="fas fa-mars"></i>' : '<i class="fas fa-venus"></i>';
        
        // Check if the animal (any fur, rare or diamond) is completed for this gender
        const isCompleted = (savedData.pelagens && savedData.pelagens[animal.slug] && savedData.pelagens[animal.slug][animal.gender] && Object.keys(savedData.pelagens[animal.slug][animal.gender]).length > 0) ||
                          (savedData.diamantes && savedData.diamantes[animal.slug] && savedData.diamantes[animal.slug][animal.gender] && Object.keys(savedData.diamantes[animal.slug][animal.gender]).length > 0);

        const completionIcon = isCompleted ? '<i class="fas fa-check-circle"></i>' : '<i class="fas fa-times-circle"></i>';
        const completionText = isCompleted ? 'Completo' : 'Incompleto';

        detailListHtml += `
            <li class="mount-detail-item">
                <div class="detail-item-header">
                    ${genderIcon} ${animalName}
                </div>
                <div class="detail-item-body">
                    ${completionIcon} ${completionText}
                </div>
            </li>
        `;
    });

    const modalContent = `
        <div class="modal-content-box">
            <h3>Detalhes da Montagem: ${mount.name}</h3>
            <ul class="mount-detail-list">
                ${detailListHtml}
            </ul>
            <div class="modal-buttons">
                <button class="back-button" onclick="closeModal('form-modal')">Fechar</button>
            </div>
        </div>
    `;
    openModal('form-modal', modalContent);
}

/**
 * Renders the grind hub view.
 */
function renderGrindHub() {
    let grindsHtml = '';
    if (savedData.grindSessions && savedData.grindSessions.length > 0) {
        savedData.grindSessions.forEach((session, index) => {
            const animalName = session.animal.replace(/_/g, ' ').split(' ').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
            const reserveName = reservesData[session.reserve]?.name || 'Desconhecida';
            grindsHtml += `
                <div class="grind-card" data-grind-index="${index}">
                    <img src="https://placehold.co/100x100/2c2f33/e6e6e6?text=${session.animal.replace(/_/g, '+')}" alt="${animalName}" class="grind-card-bg-silhouette">
                    <div class="grind-card-content">
                        <div class="grind-card-header">
                            <span class="grind-card-animal-name">${animalName}</span>
                            <span class="grind-card-reserve-name"><i class="fas fa-map-marker-alt"></i>${reserveName}</span>
                        </div>
                        <div class="grind-card-stats-grid">
                            <div class="grind-stat">
                                <i class="fas fa-crosshairs"></i>
                                <span>${session.kills}</span>
                                <div class="label">Mortes</div>
                            </div>
                            <div class="grind-stat">
                                <i class="fas fa-gem"></i>
                                <span>${session.diamonds}</span>
                                <div class="label">Diamantes</div>
                            </div>
                            <div class="grind-stat">
                                <i class="fas fa-paw"></i>
                                <span>${session.rares}</span>
                                <div class="label">Raras</div>
                            </div>
                        </div>
                    </div>
                </div>
            `;
        });
    } else {
        grindsHtml = `<p class="no-grinds-message">Você ainda não tem nenhuma sessão de grind registrada. Comece uma nova!</p>`;
    }

    appContainer.innerHTML = `
        <div class="main-content">
            <div class="page-header">
                <h2>Contador de Grind</h2>
                <button class="back-button" id="back-to-hub">Voltar</button>
            </div>
            <button class="new-grind-btn" id="create-new-grind">
                <i class="fas fa-plus-circle"></i> <span>Nova Sessão de Grind</span>
            </button>
            <h3 class="existing-grinds-title"><i class="fas fa-list"></i>Minhas Sessões de Grind</h3>
            <div class="grinds-grid">
                ${grindsHtml}
            </div>
        </div>
    `;
    setupLogoutButton(currentUser);

    document.getElementById('back-to-hub').addEventListener('click', renderNavigationHub);
    document.getElementById('create-new-grind').addEventListener('click', openNewGrindForm);

    document.querySelectorAll('.grind-card').forEach(card => {
        card.addEventListener('click', (e) => {
            const grindIndex = parseInt(e.currentTarget.dataset.grindIndex);
            renderGrindCounter(grindIndex);
        });
    });
}

/**
 * Opens a form to create a new grind session.
 */
function openNewGrindForm() {
    const animalsOptions = items.map(animal => {
        const slug = animal.toLowerCase().replace(/ /g, '_').replace(/-/g, '_');
        return `<option value="${slug}">${animal}</option>`;
    }).join('');

    const reservesOptions = Object.keys(reservesData).map(slug => {
        return `<option value="${slug}">${reservesData[slug].name}</option>`;
    }).join('');

    const formHtml = `
        <div class="modal-content-box">
            <h3>Criar Nova Sessão de Grind</h3>
            <form id="new-grind-session-form">
                <table>
                    <tr>
                        <td><label for="grind-animal-select">Animal:</label></td>
                        <td>
                            <select id="grind-animal-select">
                                <option value="">Selecione um animal</option>
                                ${animalsOptions}
                            </select>
                        </td>
                    </tr>
                    <tr>
                        <td><label for="grind-reserve-select">Reserva:</label></td>
                        <td>
                            <select id="grind-reserve-select">
                                <option value="">Selecione uma reserva</option>
                                ${reservesOptions}
                            </select>
                        </td>
                    </tr>
                </table>
                <div class="modal-buttons">
                    <button type="button" class="back-button" id="cancel-new-grind">Cancelar</button>
                    <button type="submit" class="auth-button">Iniciar Grind</button>
                </div>
            </form>
        </div>
    `;
    openModal('form-modal', formHtml);

    document.getElementById('cancel-new-grind').addEventListener('click', () => closeModal('form-modal'));
    document.getElementById('new-grind-session-form').addEventListener('submit', (e) => {
        e.preventDefault();
        const animal = document.getElementById('grind-animal-select').value;
        const reserve = document.getElementById('grind-reserve-select').value;

        if (!animal || !reserve) {
            alert('Por favor, selecione um animal e uma reserva.'); // Use custom modal
            return;
        }

        const newGrind = {
            animal: animal,
            reserve: reserve,
            kills: 0,
            diamonds: 0,
            rares: 0,
            trolls: 0,
            super_rares: 0,
            great_ones: 0,
            log: []
        };

        if (!savedData.grindSessions) {
            savedData.grindSessions = [];
        }
        savedData.grindSessions.push(newGrind);
        saveData(savedData);
        closeModal('form-modal');
        renderGrindHub(); // Go back to grind hub
    });
}

/**
 * Renders the grind counter for a specific session.
 * @param {number} grindIndex The index of the grind session in savedData.grindSessions.
 */
function renderGrindCounter(grindIndex) {
    const session = savedData.grindSessions[grindIndex];
    if (!session) {
        renderGrindHub();
        return;
    }

    const animalName = session.animal.replace(/_/g, ' ').split(' ').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
    const reserveName = reservesData[session.reserve]?.name || 'Desconhecida';

    let logHtml = '';
    if (session.log && session.log.length > 0) {
        session.log.forEach((entry, entryIndex) => {
            logHtml += `
                <li>
                    <span>${entry.type} (${entry.gender || 'N/A'}) - ${entry.fur || 'N/A'}</span>
                    <div class="trophy-log-details">
                        ${entry.score ? `<span><i class="fas fa-trophy"></i>${entry.score}</span>` : ''}
                        ${entry.date ? `<span><i class="fas fa-calendar-alt"></i>${entry.date}</span>` : ''}
                    </div>
                    <button class="delete-trophy-btn" data-entry-index="${entryIndex}">Excluir</button>
                </li>
            `;
        });
    } else {
        logHtml = `<li>Nenhum registro de caça nesta sessão.</li>`;
    }

    appContainer.innerHTML = `
        <div class="main-content grind-container">
            <div class="page-header">
                <button class="back-button" id="back-to-grind-hub">Voltar</button>
                <button class="back-button" id="delete-grind-btn">Excluir Sessão</button>
            </div>
            <div class="grind-header">
                <div class="grind-header-info">
                    <img src="https://placehold.co/80x80/2c2f33/e6e6e6?text=${session.animal.replace(/_/g, '+')}" alt="${animalName}" class="grind-animal-icon">
                    <h2>${animalName}</h2>
                </div>
                <span><i class="fas fa-map-marker-alt"></i>${reserveName}</span>
            </div>

            <div class="counters-wrapper">
                <div class="grind-counter-item total-kills">
                    <div class="grind-counter-header"><i class="fas fa-crosshairs"></i>Total de Mortes</div>
                    <div class="grind-counter-body">
                        <button class="grind-counter-btn decrease" data-type="kills">-</button>
                        <input type="number" class="grind-total-input" id="total-kills-input" value="${session.kills}" readonly>
                        <button class="grind-counter-btn increase" data-type="kills">+</button>
                    </div>
                </div>

                <div class="grind-counter-item diamond">
                    <div class="grind-counter-header"><i class="fas fa-gem"></i>Diamantes</div>
                    <div class="grind-counter-body">
                        <button class="grind-counter-btn decrease" data-type="diamonds">-</button>
                        <span class="grind-counter-value" data-type="diamonds">${session.diamonds}</span>
                        <button class="grind-counter-btn increase" data-type="diamonds">+</button>
                    </div>
                </div>

                <div class="grind-counter-item rare">
                    <div class="grind-counter-header"><i class="fas fa-paw"></i>Raras</div>
                    <div class="grind-counter-body">
                        <button class="grind-counter-btn decrease" data-type="rares">-</button>
                        <span class="grind-counter-value" data-type="rares">${session.rares}</span>
                        <button class="grind-counter-btn increase" data-type="rares">+</button>
                    </div>
                </div>

                <div class="grind-counter-item troll">
                    <div class="grind-counter-header"><i class="fas fa-skull"></i>Trolls</div>
                    <div class="grind-counter-body">
                        <button class="grind-counter-btn decrease" data-type="trolls">-</button>
                        <span class="grind-counter-value" data-type="trolls">${session.trolls}</span>
                        <button class="grind-counter-btn increase" data-type="trolls">+</button>
                    </div>
                </div>

                <div class="grind-counter-item super-rare">
                    <div class="grind-counter-header"><i class="fas fa-star"></i>Super Raros</div>
                    <div class="grind-counter-body">
                        <button class="grind-counter-btn decrease" data-type="super_rares">-</button>
                        <span class="grind-counter-value" data-type="super_rares">${session.super_rares}</span>
                        <button class="grind-counter-btn increase" data-type="super_rares">+</button>
                    </div>
                </div>

                <div class="grind-counter-item great-one">
                    <div class="grind-counter-header"><i class="fas fa-crown"></i>Great Ones</div>
                    <div class="grind-counter-body">
                        <button class="grind-counter-btn decrease" data-type="great_ones">-</button>
                        <span class="grind-counter-value" data-type="great_ones">${session.great_ones}</span>
                        <button class="grind-counter-btn increase" data-type="great_ones">+</button>
                    </div>
                </div>
            </div>

            <div class="modal-content-box">
                <h3>Registrar Nova Caça</h3>
                <form id="add-trophy-form">
                    <table>
                        <tr>
                            <td><label for="trophy-type">Tipo:</label></td>
                            <td>
                                <select id="trophy-type">
                                    <option value="">Selecione o Tipo</option>
                                    <option value="Diamante">Diamante</option>
                                    <option value="Rara">Rara</option>
                                    <option value="Troll">Troll</option>
                                    <option value="Super Raro">Super Raro</option>
                                    <option value="Great One">Great One</option>
                                </select>
                            </td>
                        </tr>
                        <tr>
                            <td><label for="trophy-gender">Gênero:</label></td>
                            <td>
                                <select id="trophy-gender">
                                    <option value="">Selecione o Gênero</option>
                                    <option value="macho">Macho</option>
                                    <option value="femea">Fêmea</option>
                                </select>
                            </td>
                        </tr>
                        <tr>
                            <td><label for="trophy-fur">Pelagem:</label></td>
                            <td><input type="text" id="trophy-fur" placeholder="Nome da Pelagem"></td>
                        </tr>
                        <tr>
                            <td><label for="trophy-score">Pontuação:</label></td>
                            <td><input type="number" step="0.01" id="trophy-score" placeholder="Pontuação (opcional)"></td>
                        </tr>
                        <tr>
                            <td><label for="trophy-date">Data:</label></td>
                            <td><input type="date" id="trophy-date"></td>
                        </tr>
                    </table>
                    <div class="modal-buttons">
                        <button type="submit" class="auth-button">Adicionar Registro</button>
                    </div>
                </form>
            </div>

            <div class="modal-content-box">
                <h3>Histórico de Caças</h3>
                <ul class="trophy-log-list">
                    ${logHtml}
                </ul>
            </div>
        </div>
    `;
    setupLogoutButton(currentUser);

    document.getElementById('back-to-grind-hub').addEventListener('click', renderGrindHub);
    document.getElementById('delete-grind-btn').addEventListener('click', () => {
        if (confirm('Tem certeza que deseja excluir esta sessão de grind?')) { // Use custom modal
            savedData.grindSessions.splice(grindIndex, 1);
            saveData(savedData);
            renderGrindHub();
        }
    });

    document.querySelectorAll('.grind-counter-btn').forEach(button => {
        button.addEventListener('click', (e) => {
            const type = e.currentTarget.dataset.type;
            if (e.currentTarget.classList.contains('increase')) {
                session[type]++;
            } else {
                if (session[type] > 0) {
                    session[type]--;
                }
            }
            if (type === 'kills') {
                document.getElementById('total-kills-input').value = session.kills;
            } else {
                e.currentTarget.parentNode.querySelector('.grind-counter-value').textContent = session[type];
            }
            saveData(savedData);
        });
    });

    document.getElementById('add-trophy-form').addEventListener('submit', (e) => {
        e.preventDefault();
        const type = document.getElementById('trophy-type').value;
        const gender = document.getElementById('trophy-gender').value;
        const fur = document.getElementById('trophy-fur').value;
        const score = parseFloat(document.getElementById('trophy-score').value) || null;
        const date = document.getElementById('trophy-date').value;

        if (!type || !gender || !fur || !date) {
            alert('Por favor, preencha todos os campos obrigatórios para o registro de caça.'); // Use custom modal
            return;
        }

        const newEntry = { type, gender, fur, score, date };
        if (!session.log) {
            session.log = [];
        }
        session.log.push(newEntry);
        saveData(savedData);
        renderGrindCounter(grindIndex); // Re-render to update log
    });

    document.querySelectorAll('.delete-trophy-btn').forEach(button => {
        button.addEventListener('click', (e) => {
            const entryIndex = parseInt(e.currentTarget.dataset.entryIndex);
            if (confirm('Tem certeza que deseja excluir este registro?')) { // Use custom modal
                session.log.splice(entryIndex, 1);
                saveData(savedData);
                renderGrindCounter(grindIndex);
            }
        });
    });
}

/**
 * Renders the progress view.
 */
function renderProgressView() {
    let totalRareFurs = 0;
    let collectedRareFurs = 0;
    for (const animal in rareFursData) {
        if (rareFursData[animal].macho) totalRareFurs += rareFursData[animal].macho.length;
        if (rareFursData[animal].femea) totalRareFurs += rareFursData[animal].femea.length;
        if (savedData.pelagens && savedData.pelagens[animal]) {
            if (savedData.pelagens[animal].macho) collectedRareFurs += Object.keys(savedData.pelagens[animal].macho).length;
            if (savedData.pelagens[animal].femea) collectedRareFurs += Object.keys(savedData.pelagens[animal].femea).length;
        }
    }
    const rareProgress = totalRareFurs > 0 ? (collectedRareFurs / totalRareFurs) * 100 : 0;
    const rareMedal = rareProgress === 100 ? 'gold' : (rareProgress > 50 ? 'silver' : 'bronze');

    let totalDiamonds = 0;
    let collectedDiamonds = 0;
    for (const animal in diamondFursData) {
        if (diamondFursData[animal].macho) totalDiamonds += diamondFursData[animal].macho.length;
        if (diamondFursData[animal].femea) totalDiamonds += diamondFursData[animal].femea.length;
        if (savedData.diamantes && savedData.diamantes[animal]) {
            if (savedData.diamantes[animal].macho) collectedDiamonds += Object.keys(savedData.diamantes[animal].macho).length;
            if (savedData.diamantes[animal].femea) collectedDiamonds += Object.keys(savedData.diamantes[animal].femea).length;
        }
    }
    const diamondProgress = totalDiamonds > 0 ? (collectedDiamonds / totalDiamonds) * 100 : 0;
    const diamondMedal = diamondProgress === 100 ? 'gold' : (diamondProgress > 50 ? 'silver' : 'bronze');

    let totalGreatOnes = 0;
    let collectedGreatOnes = 0;
    for (const animal in greatsFursData) {
        totalGreatOnes += greatsFursData[animal].length;
        if (savedData.greats && savedData.greats[animal]) {
            collectedGreatOnes += Object.keys(savedData.greats[animal]).length;
        }
    }
    const greatOneProgress = totalGreatOnes > 0 ? (collectedGreatOnes / totalGreatOnes) * 100 : 0;
    const greatOneMedal = greatOneProgress === 100 ? 'gold' : (greatOneProgress > 50 ? 'silver' : 'bronze');

    let totalSuperRares = 0;
    let collectedSuperRares = 0;
    const superRares = { /* Add your super rare data here if available */ }; // Placeholder for super rare data
    for (const animal in superRares) {
        totalSuperRares += superRares[animal].length;
        if (savedData.super_raros && savedData.super_raros[animal]) {
            collectedSuperRares += Object.keys(savedData.super_raros[animal]).length;
        }
    }
    const superRareProgress = totalSuperRares > 0 ? (collectedSuperRares / totalSuperRares) * 100 : 0;
    const superRareMedal = superRareProgress === 100 ? 'gold' : (superRareProgress > 50 ? 'silver' : 'bronze');

    let totalReserves = Object.keys(reservesData).length;
    let completedReserves = 0;
    for (const slug in reservesData) {
        const reserve = reservesData[slug];
        let reserveAnimalsCompleted = 0;
        let reserveTotalAnimals = reserve.animals.length;

        reserve.animals.forEach(animalSlug => {
            const rareCount = rareFursData[animalSlug]?.macho?.length || 0;
            const rareFemaleCount = rareFursData[animalSlug]?.femea?.length || 0;
            const diamondCount = diamondFursData[animalSlug]?.macho?.length || 0;
            const diamondFemaleCount = diamondFursData[animalSlug]?.femea?.length || 0;

            const totalFurs = rareCount + rareFemaleCount + diamondCount + diamondFemaleCount;
            let currentFurs = 0;

            if (savedData.pelagens && savedData.pelagens[animalSlug]) {
                if (savedData.pelagens[animalSlug].macho) {
                    currentFurs += Object.keys(savedData.pelagens[animalSlug].macho).length;
                }
                if (savedData.pelagens[animalSlug].femea) {
                    currentFurs += Object.keys(savedData.pelagens[animalSlug].femea).length;
                }
            }
            if (savedData.diamantes && savedData.diamantes[animalSlug]) {
                if (savedData.diamantes[animalSlug].macho) {
                    currentFurs += Object.keys(savedData.diamantes[animalSlug].macho).length;
                }
                if (savedData.diamantes[animalSlug].femea) {
                    currentFurs += Object.keys(savedData.diamantes[animalSlug].femea).length;
                }
            }

            if (totalFurs > 0 && currentFurs === totalFurs) {
                reserveAnimalsCompleted++;
            }
        });

        if (reserveTotalAnimals > 0 && reserveAnimalsCompleted === reserveTotalAnimals) {
            completedReserves++;
        }
    }
    const reservesProgress = totalReserves > 0 ? (completedReserves / totalReserves) * 100 : 0;
    const reservesMedal = reservesProgress === 100 ? 'gold' : (reservesProgress > 50 ? 'silver' : 'bronze');

    let totalMultiMounts = Object.keys(multiMountsData).length;
    let completedMultiMounts = 0;
    for (const slug in multiMountsData) {
        const mount = multiMountsData[slug];
        let mountAnimalsCompleted = 0;
        let mountTotalAnimals = mount.animals.length;

        mount.animals.forEach(animal => {
            const animalSlug = animal.slug;
            const gender = animal.gender;
            const isDiamondCompleted = savedData.diamantes && savedData.diamantes[animalSlug] && savedData.diamantes[animalSlug][gender] && Object.keys(savedData.diamantes[animalSlug][gender]).length > 0;
            const isRareCompleted = savedData.pelagens && savedData.pelagens[animalSlug] && savedData.pelagens[animalSlug][gender] && Object.keys(savedData.pelagens[animalSlug][gender]).length > 0;

            if (isDiamondCompleted || isRareCompleted) {
                mountAnimalsCompleted++;
            }
        });

        if (mountTotalAnimals > 0 && mountAnimalsCompleted === mountTotalAnimals) {
            completedMultiMounts++;
        }
    }
    const multiMountsProgress = totalMultiMounts > 0 ? (completedMultiMounts / totalMultiMounts) * 100 : 0;
    const multiMountsMedal = multiMountsProgress === 100 ? 'gold' : (multiMountsProgress > 50 ? 'silver' : 'bronze');


    appContainer.innerHTML = `
        <div class="main-content progress-view-container" id="progress-panel-main-container">
            <div class="page-header">
                <h2>Meu Progresso</h2>
                <button class="back-button" id="back-to-hub">Voltar</button>
            </div>

            <div id="progress-panel">
                <div class="progress-section" data-view="pelagens">
                    <div class="progress-header">
                        <div class="progress-title-container">
                            <i class="fas fa-paw progress-medal ${rareMedal}"></i>
                            <h3>Pelagens Raras</h3>
                        </div>
                        <span class="progress-label">${collectedRareFurs}/${totalRareFurs}</span>
                    </div>
                    <div class="progress-bar-container">
                        <div class="progress-bar-fill" style="width: ${rareProgress.toFixed(0)}%;"></div>
                    </div>
                    <div class="progress-detail-view">
                        <div class="progress-detail-item">
                            <span class="label">Progresso:</span>
                            <span class="value">${rareProgress.toFixed(2)}%</span>
                        </div>
                    </div>
                </div>

                <div class="progress-section" data-view="diamantes">
                    <div class="progress-header">
                        <div class="progress-title-container">
                            <i class="fas fa-gem progress-medal ${diamondMedal}"></i>
                            <h3>Diamantes</h3>
                        </div>
                        <span class="progress-label">${collectedDiamonds}/${totalDiamonds}</span>
                    </div>
                    <div class="progress-bar-container">
                        <div class="progress-bar-fill" style="width: ${diamondProgress.toFixed(0)}%;"></div>
                    </div>
                    <div class="progress-detail-view">
                        <div class="progress-detail-item">
                            <span class="label">Progresso:</span>
                            <span class="value">${diamondProgress.toFixed(2)}%</span>
                        </div>
                    </div>
                </div>

                <div class="progress-section" data-view="great