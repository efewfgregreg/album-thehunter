import { db } from '../firebase.js';
import { debounce } from '../utils.js';

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
 * Função interna para salvar na nuvem com debounce.
 * ORDEM DOS PARÂMETROS CORRIGIDA: (currentUser, data)
 */
const saveToCloudDebounced = debounce((currentUser, data) => {
    if (!currentUser || !data) return;

    const userDocRef = db.collection('usuarios').doc(currentUser.uid);
    
    try {
        // Sanitização para garantir objeto puro
        const sanitizedData = JSON.parse(JSON.stringify(data));

        userDocRef.set(sanitizedData, { merge: true })
            .then(() => {
                console.log("☁️ Salvo no Firebase (Sincronizado)");
            })
            .catch((error) => {
                console.error("Erro ao salvar no Firebase: ", error);
            });
    } catch (e) {
        console.error("Erro na sanitização dos dados:", e);
    }
}, 2000);

/**
 * Carrega os dados do usuário.
 * Prioriza o Firestore. Se falhar ou estiver vazio, tenta o LocalStorage.
 * Retorna a estrutura padrão se nada for encontrado.
 */
export async function loadDataFromFirestore(currentUser) {
    let finalData = getDefaultDataStructure();

    // 1. Tenta carregar backup local primeiro (como fallback imediato)
    let localData = null;
    try {
        const localStr = localStorage.getItem('hunter_backup_local');
        if (localStr) {
            localData = JSON.parse(localStr);
        }
    } catch(e) { 
        console.warn("Sem backup local legível ou corrompido."); 
    }

    if (!currentUser) {
        // Se não há usuário logado, usa o local ou o padrão
        return localData ? { ...finalData, ...localData } : finalData;
    }

    // 2. Tenta buscar do Firestore
    const userDocRef = db.collection('usuarios').doc(currentUser.uid);

    try {
        const doc = await userDocRef.get();
        
        if (doc.exists) {
            const cloudData = doc.data();
            
            // Verificação de integridade básica
            if (Object.keys(cloudData).length > 0) {
                console.log("Dados carregados do Firestore com sucesso.");
                // Mescla com a estrutura padrão para garantir que campos novos existam
                finalData = { ...finalData, ...cloudData };
                
                // Atualiza o backup local com o que veio da nuvem (Sincronização Nuvem -> Local)
                localStorage.setItem('hunter_backup_local', JSON.stringify(finalData));
            } else {
                 console.warn("Documento na nuvem existe mas está vazio.");
                 if (localData) finalData = { ...finalData, ...localData };
            }
        } else {
            console.log("Nenhum dado na nuvem encontrado. Usando local ou padrão.");
            if (localData) finalData = { ...finalData, ...localData };
        }
    } catch (error) {
        console.error("Erro ao carregar do Firestore (Offline ou Sem Permissão):", error);
        // Fallback para local em caso de erro de rede
        if (localData) {
            finalData = { ...finalData, ...localData };
        }
    }

    return finalData;
}

/**
 * Salva os dados no LocalStorage imediatamente e agenda o salvamento na nuvem.
 * ATENÇÃO: A assinatura da função foi ajustada para (currentUser, data)
 * para coincidir com a chamada no main.js (linha 105).
 */
export async function persistData(currentUser, data) {
    if (!data) {
        console.error("Tentativa de salvar dados nulos ou indefinidos abortada.");
        return;
    }

    // 1. SALVAMENTO LOCAL (Imediato e Síncrono)
    try {
        localStorage.setItem('hunter_backup_local', JSON.stringify(data));
        localStorage.setItem('hunter_backup_time', Date.now().toString());
    } catch (e) {
        console.warn("Erro ao escrever no LocalStorage:", e);
    }

    // 2. SALVAMENTO NA NUVEM (Assíncrono via Debounce)
    if (currentUser) {
        saveToCloudDebounced(currentUser, data);
    }
}