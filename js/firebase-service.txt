// js/firebase-service.js
import { getDefaultDataStructure } from './utils.js';

let db; // A instância do DB será recebida de fora

export function initializeFirebaseService(database) {
    db = database;
}

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
            return { ...defaultData, ...cloudData };
        } else {
            console.log("Nenhum dado encontrado para o usuário, criando novo documento.");
            const defaultData = getDefaultDataStructure();
            await userDocRef.set(defaultData);
            return defaultData;
        }
    } catch (error) {
        console.error("Erro ao carregar dados do Firestore:", error);
        return getDefaultDataStructure();
    }
}

// Note que esta função agora só salva, ela não tenta mais atualizar a UI.
export async function saveDataToFirestore(currentUser, data) {
    if (!currentUser) {
        return Promise.reject("Nenhum usuário logado.");
    }
    const userDocRef = db.collection('usuários').doc(currentUser.uid);
    return userDocRef.set(data);
}