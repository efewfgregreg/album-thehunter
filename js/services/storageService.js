import { db } from '../firebase.js';
import { showToast, debounce } from '../utils.js';

// =================================================================
// =================== LÓGICA DE DADOS (STORAGE) ===================
// =================================================================

/**
 * Retorna a estrutura inicial de dados para novos usuários ou resets.
 */
export function getDefaultDataStructure() {
    return {
        pelagens: {},
        diamantes: {},
        greats: {},
        super_raros: {},
        grindSessions: []
    };
}

/**
 * Carrega os dados do usuário, priorizando a nuvem mas mantendo backup local.
 */
export async function loadDataFromFirestore(currentUser) {
    let finalData = getDefaultDataStructure();
    let localData = null;

    try {
        const localStr = localStorage.getItem('hunter_backup_local');
        if (localStr) {
            localData = JSON.parse(localStr);
        }
    } catch(e) { 
        console.log("Sem backup local legível"); 
    }

    if (!currentUser) {
        if (localData) return { ...finalData, ...localData };
        return finalData;
    }

    const userDocRef = db.collection('usuarios').doc(currentUser.uid);

    try {
        const doc = await userDocRef.get();
        
        if (doc.exists) {
            console.log("Dados carregados do Firestore!");
            const cloudData = doc.data();
            
            if (Object.keys(cloudData).length < 3 && localData && Object.keys(localData).length > 5) {
                 console.warn("Nuvem parece incompleta, usando dados locais.");
                 finalData = { ...finalData, ...localData };
                 persistData(finalData, currentUser); 
            } else {
                 finalData = { ...finalData, ...cloudData };
            }
        } else {
            console.log("Novo usuário. Criando registro.");
            if (localData) {
                finalData = { ...finalData, ...localData };
                persistData(finalData, currentUser);
            } else {
                await userDocRef.set(finalData);
            }
        }
    } catch (error) {
        console.error("Erro ao carregar do Firestore:", error);
        if (localData) {
            showToast("⚠️ Modo Offline: Usando dados locais.");
            finalData = { ...finalData, ...localData };
        }
    }

    return finalData;
}

/**
 * Função interna para salvar na nuvem com debounce.
 */
const saveToCloudDebounced = debounce((data, currentUser) => {
    if (currentUser) {
        const userDocRef = db.collection('usuarios').doc(currentUser.uid);
        
        // --- CORREÇÃO CRÍTICA APLICADA AQUI ---
        // Converte para objeto puro para evitar erro "custom object" do Firebase
        const sanitizedData = JSON.parse(JSON.stringify(data));

        userDocRef.set(sanitizedData, { merge: true })
            .then(() => {
                console.log("☁️ Salvo no Firebase (Sincronizado)");
            })
            .catch((error) => {
                console.error("Erro no Firebase: ", error);
                showToast("⚠️ Erro de conexão. Salvo apenas localmente.");
            });
    }
}, 2000);

/**
 * Salva os dados no LocalStorage imediatamente e agenda o salvamento na nuvem.
 */
export function persistData(data, currentUser) {
    // 1. SALVAMENTO LOCAL (Imediato)
    try {
        localStorage.setItem('hunter_backup_local', JSON.stringify(data));
        localStorage.setItem('hunter_backup_time', Date.now());
    } catch (e) {
        console.warn("Aviso: Não foi possível salvar backup local", e);
    }

    // 2. SALVAMENTO NA NUVEM
    if (currentUser) {
        saveToCloudDebounced(data, currentUser);
    }
}