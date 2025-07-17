// src/js/firebase.js

// ========================================================================
// ======== INICIALIZAÇÃO DO FIREBASE (COM SEUS DADOS) ========
// ========================================================================

const firebaseConfig = {
    apiKey: "AIzaSyD_vgZDTseipBQgo2oXJeZUyczCEzWg_8w",
    authDomain: "album-thehunter.firebaseapp.com",
    projectId: "album-thehunter",
    storageBucket: "album-thehunter.firebasestorage.app",
    messageSenderId: "369481100721",
    appId: "1:369481100721:web:e5ce08c635536fb7e0a190",
    measurementId: "G-3G5VBWBEDL"
};

// Inicializa Firebase
const app = firebase.initializeApp(firebaseConfig);

// Autenticação e Firestore
const auth = firebase.auth();
const db = firebase.firestore();

// Variável global opcional (pode ser removida se não usada)
let currentUser = null;

// Exporta auth para ser usado nos outros módulos
export { auth };
