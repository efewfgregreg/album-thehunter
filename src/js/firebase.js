// src/js/firebase.js
// Versão modular do Firebase v9+ (ESM) carregada via CDN

import { initializeApp } from 'https://www.gstatic.com/firebasejs/9.22.1/firebase-app.js';
import { getAuth, onAuthStateChanged } from 'https://www.gstatic.com/firebasejs/9.22.1/firebase-auth.js';
import {
  getFirestore,
  doc,
  getDoc,
  setDoc
} from 'https://www.gstatic.com/firebasejs/9.22.1/firebase-firestore.js';

// Configuração do seu projeto Firebase
const firebaseConfig = {
  apiKey: "AIzaSyD_vgZDTseipBQgo2oXJeZUyczCEzWg_8w",
  authDomain: "album-thehunter.firebaseapp.com",
  projectId: "album-thehunter",
  storageBucket: "album-thehunter.firebasestorage.app",
  messagingSenderId: "369481100721",
  appId: "1:369481100721:web:e5ce08c635536fb7e0a190",
  measurementId: "G-3G5VBWBEDL"
};

// Inicializa app, Auth e Firestore
const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);

// Controla usuário logado
export let currentUser = null;
onAuthStateChanged(auth, user => {
  currentUser = user;
});

// Estrutura padrão de dados
export function getDefaultDataStructure() {
  return {
    pelagens: {},
    diamantes: {},
    greats: {},
    super_raros: {},
    grindSessions: []
  };
}

// Carrega dados do Firestore (ou inicializa caso não exista)
export async function loadDataFromFirestore() {
  if (!currentUser) return getDefaultDataStructure();

  const userRef = doc(db, 'usuários', currentUser.uid);
  try {
    const snap = await getDoc(userRef);
    if (snap.exists()) {
      return { ...getDefaultDataStructure(), ...snap.data() };
    } else {
      const def = getDefaultDataStructure();
      await setDoc(userRef, def);
      return def;
    }
  } catch (error) {
    console.error(error);
    return getDefaultDataStructure();
  }
}

// Salva dados no Firestore
export function saveData(data) {
  if (!currentUser) return;
  const userRef = doc(db, 'usuários', currentUser.uid);
  setDoc(userRef, data).catch(console.error);
}
