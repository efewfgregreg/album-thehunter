// services/firebaseService.js
// Módulo de inicialização e operações com Firebase

import firebase from 'firebase/app';
import 'firebase/auth';
import 'firebase/firestore';

// Configuração do Firebase (use as mesmas credenciais do seu script original)
const firebaseConfig = {
  apiKey: "AIzaSyD_vgZDTseipBQgo2oXJeZUyczCEzWg_8w",
  authDomain: "album-thehunter.firebaseapp.com",
  projectId: "album-thehunter",
  storageBucket: "album-thehunter.firebasestorage.app",
  messageSenderId: "369481100721",
  appId: "1:369481100721:web:e5ce08c635536fb7e0a190",
  measurementId: "G-3G5VBWBEDL"
};

// Inicializa Firebase uma única vez
if (!firebase.apps.length) {
  firebase.initializeApp(firebaseConfig);
}

// Exporta instâncias reutilizáveis
export const auth = firebase.auth();
export const db = firebase.firestore();

// Estrutura de dados padrão para novos usuários
export function getDefaultData() {
  return {
    pelagens: {},
    diamantes: {},
    greats: {},
    super_raros: {},
    grindSessions: []
  };
}

// Carrega dados do usuário logado ou cria novo documento
export async function loadUserData() {
  const user = auth.currentUser;
  if (!user) throw new Error('Usuário não autenticado');
  const userRef = db.collection('usuários').doc(user.uid);
  const doc = await userRef.get();
  if (doc.exists) {
    const cloudData = doc.data();
    return { ...getDefaultData(), ...cloudData };
  } else {
    const defaultData = getDefaultData();
    await userRef.set(defaultData);
    return defaultData;
  }
}

// Salva objeto de dados completo no Firestore
export async function saveUserData(data) {
  const user = auth.currentUser;
  if (!user) throw new Error('Usuário não autenticado');
  const userRef = db.collection('usuários').doc(user.uid);
  await userRef.set(data);
}
