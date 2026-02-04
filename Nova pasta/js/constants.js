// js/constants.js

/**
 * Chaves de identificação das abas do sistema.
 * Centralizar aqui evita erros de digitação (typos) em outros arquivos.
 */
export const TABS = {
    PELAGENS: 'pelagens',
    DIAMANTES: 'diamantes',
    GREATS: 'greats',
    SUPER_RAROS: 'super_raros',
    MONTAGENS: 'montagens',
    GRIND: 'grind',
    RESERVAS: 'reservas',
    PROGRESSO: 'progresso',
    CONFIGURACOES: 'configuracoes'
};

/**
 * Configuração visual e de conteúdo das categorias.
 * Define o título e o ícone exibidos no Hub de Navegação e nos Headers.
 */
export const categorias = {
    [TABS.PELAGENS]: { 
        title: 'Pelagens Raras', 
        icon: '<img src="icones/pata_icon.png" class="custom-icon">', 
        isHtml: true 
    },
    [TABS.DIAMANTES]: { 
        title: 'Diamantes', 
        icon: '<img src="icones/diamante_icon.png" class="custom-icon">', 
        isHtml: true 
    },
    [TABS.GREATS]: { 
        title: 'Great Ones', 
        icon: '<img src="icones/greatone_icon.png" class="custom-icon">', 
        isHtml: true 
    },
    [TABS.SUPER_RAROS]: { 
        title: 'Super Raros', 
        icon: '<img src="icones/coroa_icon.png" class="custom-icon">', 
        isHtml: true 
    },
    [TABS.MONTAGENS]: { 
        title: 'Montagens Múltiplas', 
        icon: '<img src="icones/trofeu_icon.png" class="custom-icon">', 
        isHtml: true 
    },
    [TABS.GRIND]: { 
        title: 'Contador de Grind', 
        icon: '<img src="icones/cruz_icon.png" class="custom-icon">', 
        isHtml: true 
    },
    [TABS.RESERVAS]: { 
        title: 'Reservas de Caça', 
        icon: '<img src="icones/mapa_icon.png" class="custom-icon">', 
        isHtml: true 
    },
    [TABS.PROGRESSO]: { 
        title: 'Painel de Progresso', 
        icon: '<img src="icones/progresso_icon.png" class="custom-icon">', 
        isHtml: true 
    },
    [TABS.CONFIGURACOES]: { 
        title: 'Configurações', 
        icon: '<img src="icones/configuracoes_icon.png" class="custom-icon">', 
        isHtml: true 
    }
};