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

    // 1. Tenta pegar o Backup Local primeiro (para segurança e modo offline)
    try {
        const localStr = localStorage.getItem('hunter_backup_local');
        if (localStr) {
            localData = JSON.parse(localStr);
        }
    } catch(e) { 
        console.log("Sem backup local legível"); 
    }

    // Se não houver usuário logado (currentUser é null), retorna o local ou o padrão
    if (!currentUser) {
        if (localData) return { ...finalData, ...localData };
        return finalData;
    }

    // O currentUser agora vem como parâmetro, resolvendo o ReferenceError
    const userDocRef = db.collection('usuarios').doc(currentUser.uid);

    try {
        // 2. Tenta pegar da Nuvem (Firebase)
        const doc = await userDocRef.get();
        
        if (doc.exists) {
            console.log("Dados carregados do Firestore!");
            const cloudData = doc.data();
            
            // Heurística de segurança: se a nuvem estiver muito vazia e o local cheio, prefere o local
            if (Object.keys(cloudData).length < 3 && localData && Object.keys(localData).length > 5) {
                 console.warn("Nuvem parece incompleta, usando dados locais.");
                 finalData = { ...finalData, ...localData };
                 // Sincroniza a nuvem com os dados locais mais completos
                 persistData(finalData, currentUser); 
            } else {
                 finalData = { ...finalData, ...cloudData };
            }
        } else {
            console.log("Novo usuário ou banco vazio. Criando registro inicial.");
            if (localData) {
                finalData = { ...finalData, ...localData };
                persistData(finalData, currentUser);
            } else {
                await userDocRef.set(finalData);
            }
        }
    } catch (error) {
        console.error("Erro ao carregar do Firestore:", error);
        // Em caso de erro (ex: 403 Forbidden), usamos os dados locais
        if (localData) {
            showToast("⚠️ Modo Offline: Usando dados locais.");
            finalData = { ...finalData, ...localData };
        }
    }

    return finalData;
}

/**
 * Função interna para salvar na nuvem com debounce para evitar excesso de requisições.
 */
const saveToCloudDebounced = debounce((data, currentUser) => {
    if (currentUser) {
        const userDocRef = db.collection('usuarios').doc(currentUser.uid);
        
        userDocRef.set(data, { merge: true })
            .then(() => {
                console.log("☁️ Salvo no Firebase (Sincronizado)");
            })
            .catch((error) => {
                console.error("Erro no Firebase: ", error);
                // O erro 403 nas imagens indica que você deve revisar as Rules do Firestore no console do Firebase
                showToast("⚠️ Erro de conexão. Salvo apenas localmente.");
            });
    }
}, 2000);

/**
 * Salva os dados no LocalStorage imediatamente e agenda o salvamento na nuvem.
 */
export function persistData(data, currentUser) {
    // 1. SALVAMENTO LOCAL (Imediato) - Garante segurança contra fechamento de aba
    try {
        localStorage.setItem('hunter_backup_local', JSON.stringify(data));
        localStorage.setItem('hunter_backup_time', Date.now());
    } catch (e) {
        console.warn("Aviso: Não foi possível salvar backup local", e);
    }

    // 2. SALVAMENTO NA NUVEM (Com Debounce)
    // Importante: Passamos o currentUser para que a nuvem saiba de quem são os dados
    if (currentUser) {
        saveToCloudDebounced(data, currentUser);
    }
}