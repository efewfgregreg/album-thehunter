// js/firebase-service.js
// Propósito: Centralizar toda a comunicação com o banco de dados Firestore.

import { getDefaultDataStructure } from './utils.js';

let db; // A instância do DB será recebida de fora para evitar duplicação.

export function initializeFirebaseService(database) {
    db = database;
}

/**
 * Carrega os dados do usuário logado a partir do Firestore.
 * Se o usuário for novo, cria um documento para ele.
 * @param {object} currentUser O objeto do usuário autenticado.
 * @returns {Promise<object>} Os dados do usuário.
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
            const defaultData = getDefaultDataStructure();
            // Garante que a estrutura de dados local sempre tenha todos os campos
            return { ...defaultData, ...cloudData };
        } else {
            console.log("Nenhum dado encontrado para o usuário, criando novo documento.");
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
 * @param {object} currentUser O objeto do usuário autenticado.
 * @param {object} data O objeto de dados completo a ser salvo.
 * @returns {Promise<void>} Uma Promise que resolve quando os dados são salvos.
 */
export async function saveDataToFirestore(currentUser, data) {
    if (!currentUser) {
        console.error("Tentando salvar dados sem usuário logado.");
        return Promise.reject("Nenhum usuário logado.");
    }
    const userDocRef = db.collection('usuários').doc(currentUser.uid);
    
    // Retorna a Promise da operação de 'set' para que quem chamou saiba quando terminou.
    return userDocRef.set(data);
}