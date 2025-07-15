// js/script.js (VERSÃO FINAL E COMPLETA - O ORQUESTRADOR)

// --- 1. IMPORTAÇÃO DE TODOS OS MÓDULOS ---
import { firebaseConfig } from './js/config.js';
import * as Data from './js/data.js';
import * as Utils from './js/utils.js';
import * as FirebaseService from './js/firebase-service.js';
import * as AuthUI from './js/auth.js';
import * as ProgressUI from './js/ui/progress.js';
import * as GrindUI from './js/ui/grind.js';
import * as AlbumViews from './js/ui/album-views.js';

// --- 2. INICIALIZAÇÃO DO FIREBASE ---
const app = firebase.initializeApp(firebaseConfig);
const auth = firebase.auth();
const db = firebase.firestore();
FirebaseService.initializeFirebaseService(db);

// --- 3. ESTADO GLOBAL DO APLICATIVO ---
let currentUser = null;
let savedData = {};
let appContainer;
let lastClickedAnimalName = { value: '' };

// --- 4. FUNÇÕES DE CONTROLE DE ALTO NÍVEL ---
async function saveDataAndUpdateUI(newData) {
    savedData = newData; 
    try {
        await FirebaseService.saveDataToFirestore(currentUser, savedData);
        console.log("Progresso salvo na nuvem com sucesso!");
    } catch (error) {
        console.error("Erro ao salvar dados na nuvem: ", error);
        showCustomAlert('Houve um erro ao salvar seu progresso na nuvem.', 'Erro de Sincronização');
    }
}

// ... (função syncTrophyToAlbum, sem alterações)

// --- 5. FUNÇÕES GLOBAIS DE UI (MODAIS) ---
// ... (funções openImageViewer, closeModal, showCustomAlert, sem alterações)

// --- 6. FUNÇÕES DE ROTEAMENTO PRINCIPAL ---
// ... (funções renderNavigationHub e renderMainView, sem alterações)

// --- 7. INICIALIZAÇÃO DO APP ---
document.addEventListener('DOMContentLoaded', () => {
    appContainer = document.getElementById('app-container');
    auth.onAuthStateChanged(async (user) => {
        if (user) {
            currentUser = user;
            appContainer.innerHTML = `<div class="loading-spinner">Carregando seus dados...</div>`;
            savedData = await FirebaseService.loadDataFromFirestore(user);

            const dependencies = {
                savedData, currentUser, auth, appContainer, lastClickedAnimalName,
                ...Data, 
                ...Utils,
                getAggregatedGrindStats: GrindUI.getAggregatedGrindStats,
                renderMainView, 
                saveDataAndUpdateUI, 
                syncTrophyToAlbum,
                openImageViewer,
                closeModal,
                showCustomAlert
            };
            
            AuthUI.init(dependencies);
            ProgressUI.init(dependencies);
            GrindUI.init(dependencies);
            AlbumViews.init(dependencies);
            
            renderNavigationHub();
        } else {
            currentUser = null;
            AuthUI.renderLoginForm(appContainer, auth);
        }
    });

    // ... (event listeners globais para modais, sem alterações)
});