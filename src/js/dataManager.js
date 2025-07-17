// src/js/dataManager.js

import { db, auth } from './firebase.js';
import { renderHuntingRankingView, updateNewProgressPanel, renderMultiMountsView } from './ui.js';

// ================== ESTRUTURA PADRÃO ==================
export function getDefaultDataStructure() {
    return {
        pelagens: {},
        diamantes: {},
        greats: {},
        super_raros: {},
        grindSessions: []
    };
}

// ================== CARREGAR DADOS ==================
export async function loadDataFromFirestore() {
    const user = auth.currentUser;
    if (!user) {
        console.error("Tentando carregar dados sem usuário logado.");
        return getDefaultDataStructure();
    }
    const userDocRef = db.collection('usuários').doc(user.uid);
    try {
        const doc = await userDocRef.get();
        if (doc.exists) {
            const cloudData = doc.data();
            const defaultData = getDefaultDataStructure();
            return { ...defaultData, ...cloudData };
        } else {
            const defaultData = getDefaultDataStructure();
            await userDocRef.set(defaultData);
            return defaultData;
        }
    } catch (error) {
        console.error("Erro ao carregar dados do Firestore:", error);
        return getDefaultDataStructure();
    }
}

// ================== SALVAR DADOS ==================
export function saveData(data) {
    const user = auth.currentUser;
    if (!user) {
        console.error("Tentando salvar dados sem usuário logado.");
        return;
    }
    const userDocRef = db.collection('usuários').doc(user.uid);
    userDocRef.set(data)
        .then(() => {
            console.log("Progresso salvo na nuvem com sucesso!");
        })
        .catch((error) => {
            console.error("Erro ao salvar dados na nuvem: ", error);
        });

    if (document.getElementById('progress-panel-main-container')) {
        const container = document.getElementById('progress-panel-main-container').parentNode;
        const contentArea = document.getElementById('progress-content-area');
        if (contentArea) {
            if (document.querySelector('.ranking-table')) {
                renderHuntingRankingView(contentArea);
            } else {
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
