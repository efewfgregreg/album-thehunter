// js/utils.js

// Função para gerar slugs (identificadores) a partir de nomes
function slugify(text) {
    return text
        .toString()
        .toLowerCase()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "") // Remove acentos
        .replace(/\s+/g, "_")            // Substitui espaços por _
        .replace(/[^\w\-]+/g, "")        // Remove caracteres inválidos
        .replace(/\-\-+/g, "_")          // Substitui múltiplos - por _
        .replace(/^-+/, "")              // Remove traços no início
        .replace(/-+$/, "");             // Remove traços no final
}

// Função para criar estrutura padrão de dados para um animal
function getDefaultDataStructure() {
    return {
        total: 0,
        diamonds: [],
        trolls: 0,
        rares: [],
        super_rares: [],
        great_ones: []
    };
}

export { slugify, getDefaultDataStructure };
