// js/firebase-service.js
// Propósito: Centralizar toda a comunicação com o Firebase.

// Importamos apenas o que este módulo precisa
import { firebaseConfig } from './config.js';
import { getDefaultDataStructure } from './utils.js';

// 1. INICIALIZAÇÃO DO FIREBASE - Acontece aqui!
const app = firebase.initializeApp(firebaseConfig);

// 2. EXPORTAÇÃO DOS SERVIÇOS - Para que outros módulos possam usar
export const auth = firebase.auth();
export const db = firebase.firestore();

/**
 * Carrega os dados do usuário logado a partir do Firestore.
 * @param {object} currentUser - O objeto do usuário atualmente logado.
 * @returns {Promise<object>} Uma promessa que resolve com os dados do usuário.
 */
export async function loadDataFromFirestore(currentUser) {
    if (!currentUser) {
        console.error("Tentando carregar dados sem usuário logado.");
        return getDefaultDataStructure();
    }

    const userDocRef = db.collection('usuários').doc(currentUser.uid);
    try {
        const doc = await userDocRef.get();
        if (doc.exists) {
            console.log("Dados carregados do Firestore!");
            const cloudData = doc.data();
            // Garante que a estrutura de dados local sempre tenha todos os campos
            return { ...getDefaultDataStructure(), ...cloudData };
        } else {
            console.log("Nenhum dado encontrado, criando novo documento para o usuário.");
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
 * @param {object} currentUser - O objeto do usuário atualmente logado.
 * @param {object} dataToSave - O objeto de dados completo a ser salvo.
 */
export async function saveDataToFirestore(currentUser, dataToSave) {
    if (!currentUser) {
        console.error("Tentando salvar dados sem usuário logado.");
        return; // Não faz nada se não houver usuário
    }
    const userDocRef = db.collection('usuários').doc(currentUser.uid);
    await userDocRef.set(dataToSave);
}
