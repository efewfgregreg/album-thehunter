// js/utils.js

// Converte um texto para um formato de slug (ex: "Veado Vermelho" -> "veado_vermelho")
export function slugify(texto) { 
    return texto.toLowerCase().replace(/[-\s]+/g, '_').replace(/'/g, ''); 
}

// Função para obter a estrutura de dados padrão para um novo usuário
export function getDefaultDataStructure() {
    return {
        pelagens: {},
        diamantes: {},
        greats: {},
        super_raros: {},
        grindSessions: []
    };
}