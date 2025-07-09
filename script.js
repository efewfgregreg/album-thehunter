const saveDataKey = 'theHunterAlbumData';

function loadData() {
    try {
        let data = localStorage.getItem(saveDataKey);
        let parsedData = data ? JSON.parse(data) : {};

        // --- Migração de Dados de Grind ---
        // Verifica se existe o formato antigo de grind e o converte para o novo
        if (parsedData.grindSessions && !Array.isArray(parsedData.grindSessions)) {
            console.log("Migrando dados de grind para o novo formato...");
            const newGrindSessions = [];
            for (const animalSlug in parsedData.grindSessions) {
                const oldSession = parsedData.grindSessions[animalSlug];
                if (oldSession.activeReserve && oldSession.logs) {
                    // Tenta adivinhar os contadores do formato antigo (se existirem)
                    const total = oldSession.logs.total || 0;
                    const diamonds = oldSession.logs.diamonds || 0;
                    const rares = oldSession.logs.rares || 0;
                    const trolls = oldSession.logs.trolls || 0;
                    const super_rares = oldSession.logs.super_rares || 0;
                    const great_ones = oldSession.logs.great_ones || 0;

                    newGrindSessions.push({
                        id: `${animalSlug}_${oldSession.activeReserve}`, // Cria um ID único
                        animalSlug: animalSlug,
                        reserveKey: oldSession.activeReserve,
                        counts: {
                            total: total,
                            diamonds: diamonds,
                            rares: rares,
                            trolls: trolls,
                            super_rares: super_rares,
                            great_ones: great_ones,
                        }
                    });
                }
            }
            parsedData.grindSessions = newGrindSessions;
            // Salva os dados migrados imediatamente
            localStorage.setItem(saveDataKey, JSON.stringify(parsedData));
            console.log("Migração concluída.");
        }
        // Garante que grindSessions seja um array se não existir
        if (!parsedData.grindSessions) {
            parsedData.grindSessions = [];
        }


        if (parsedData.diamantes) {
            for (const slug in parsedData.diamantes) {
                if (!Array.isArray(parsedData.diamantes[slug])) {
                    parsedData.diamantes[slug] = [];
                }
            }
        }
        return parsedData;
    } catch (e) {
        console.error("Erro ao carregar dados do localStorage", e);
        localStorage.clear();
        return { grindSessions: [] }; // Retorna o formato correto em caso de erro
    }
}

function saveData(data) {
    try {
        localStorage.setItem(saveDataKey, JSON.stringify(data));
        
        if (document.getElementById('progress-panel-main-container')) {
            const container = document.getElementById('progress-panel-main-container').parentNode;
            renderProgressView(container);
        }

        const mountsGrid = document.querySelector('.mounts-grid');
        if (mountsGrid) {
            const container = mountsGrid.parentNode;
            renderMultiMountsView(container);
        }

    } catch (e) {
        console.error("Erro ao salvar dados no localStorage", e);
    }
}

const savedData = loadData();

// --- CONSTANTES DE DADOS ---
const rareFursData = { "alce": { macho: ["Albino", "Melanístico", "Malhado", "Café"], femea: ["Albino", "Melanístico", "Malhado"] }, "antilocapra": { macho: ["Albino", "Malhado", "Leucismo"], femea: ["Albino", "Malhado", "Leucismo"] }, "antílope_negro": { macho: ["Albino", "Melânico", "Malhado", "Leucismo"], femea: ["Albino", "Melânico", "Malhado", "Leucismo"] }, "bantengue": { macho: ["Albino", "Melânico"], femea: ["Albino", "Melânico"] }, "bisão_das_planícies": { macho: ["Albino", "Melânico", "Leucismo"], femea: ["Albino", "Melânico", "Leucismo"] }, "bisão_europeu": { macho: ["Albino", "Melânico", "Malhado"], femea: ["Albino", "Melânico", "Malhado"] }, "búfalo_africano": { macho: ["Albino", "Leucismo"], femea: ["Albino", "Leucismo"] }, "búfalo_dágua": { macho: ["Albino", "Laranja"], femea: ["Albino", "Laranja"] }, "cabra_da_montanha": { macho: ["Albino", "Melânico"], femea: ["Albino", "Melânico"] }, "cabra_de_leque": { macho: ["Albino"], femea: ["Albino"] }, "cabra_selvagem": { macho: ["Albino", "Preto", "Cores Mistas"], femea: ["Albino", "Preto"] }, "caititu": { macho: ["Albino", "Melânico", "Ochre", "Leucismo"], femea: ["Albino", "Melânico", "Ochre", "Leucismo"] }, "camurça": { macho: ["Albino", "Melânico", "Leucismo"], femea: ["Albino", "Melânico", "Leucismo"] }, "canguru_cinza_oriental": { macho: ["Albino", "Melânico", "Leucismo"], femea: ["Albino", "Melânico", "Leucismo"] }, "caribu": { macho: ["Albino", "Melânico", "Leucismo"], femea: ["Albino", "Melânico", "Leucismo"] }, "carneiro_azul": { macho: ["Albino", "Melânico", "Leucismo"], femea: ["Albino", "Melânico", "Leucismo"] }, "carneiro_selvagem": { macho: ["Albino"], femea: ["Albino"] }, "cervo_porco_indiano": { macho: ["Malhado", "Leucismo"], femea: ["Malhado", "Leucismo"] }, "cervo_almiscarado": { macho: ["Albino", "Melânico", "Malhado"], femea: [] }, "cervo_de_timor": { macho: ["Albino", "leucistico", "malhado variação 1", "malhado variação 2"], femea: ["leucistico"] }, "cervo_do_pântano": { macho: ["Albino", "Malhado", "Leucismo"], femea: ["Albino", "Malhado", "Leucismo"] }, "cervo_sika": { macho: ["Albino", "pintado vermelho"], femea: ["Albino", "pintado vermelho"] }, "chital": { macho: ["Albino", "malhado", "melanico"], femea: ["Albino", "malhado", "melanico"] }, "chacal_listrado": { macho: ["Albino", "Melânico"], femea: ["Albino", "Melânico"] }, "codorna_de_restolho": { macho: ["Albino", "Pardo Escuro"], femea: ["Albino"] }, "codorniz_da_virgínia": { macho: ["Albino"], femea: ["Albino"] }, "coelho_da_flórida": { macho: ["Albino", "melanico"], femea: ["Albino", "melanico"] }, "coelho_europeu": { macho: ["Albino", "Melânico", "Leucismo"], femea: ["Albino", "Melânico", "Leucismo"] }, "coiote": { macho: ["Albino", "Melânico", "malhado"], femea: ["Albino", "Melânico", "malhado"] }, "corça": { macho: ["Albino", "Melânico", "Malhado"], femea: ["Albino", "Melânico", "Malhado"] }, "crocodilo_de_água_salgada": { macho: ["Albino", "Melânico", "Pardo Claro", "malhado variação 1", "malhado variação 2"], femea: ["Albino", "Melânico", "Pardo Claro", "malhado variação 1", "malhado variação 2"] }, "cudo_menor": { macho: ["Albino"], femea: ["Albino"] }, "cão_guaxinim": { macho: ["Albino", "Laranja", "Pardo escuro", "malhado variação 1", "malhado variação 2"], femea: ["Albino", "Laranja", "Pardo escuro", "malhado variação 1", "malhado variação 2"] }, "faisão_de_pescoço_anelado": { macho: ["Albino", "Melânico", "Leucismo"], femea: ["Albino", "Melânico", "Leucismo"] }, "faisão": { macho: ["Albino", "Melânico", "Leucismo"], femea: ["Albino", "Melânico", "Leucismo"] }, "frisada": { macho: ["Albino", "Melânico", "Leucismo"], femea: ["Albino", "Melânico", "Leucismo"] }, "galinha_montês": { macho: ["Pálida", "Híbrido", "Escuro"], femea: ["Pálida", "Híbrido", "Escuro"] }, "galo_lira": { macho: ["leucismo variação 1", "leucismo variação 2", "leucismo variação 3", "melanico variação 1", "melanico variação 2"], femea: ["Laranja"] }, "gamo": { macho: ["Albino", "Melânico", "malhado variação 1", "malhado variação 2"], femea: ["Albino", "Melânico"] }, "ganso_bravo": { macho: ["Híbrido", "leucismo variação 1", "leucismo variação 2", "leucismo variação 3", "leucismo variação 4", "leucismo variação 5"], femea: ["Híbrido", "leucismo variação 1", "leucismo variação 2", "leucismo variação 3", "leucismo variação 4", "leucismo variação 5"] }, "ganso_campestre_da_tundra": { macho: ["leucismo variação 1", "leucismo variação 2", "leucismo variação 3"], femea: ["leucismo variação 1", "leucismo variação 2", "leucismo variação 3"] }, "ganso_pega": { macho: ["Melânico", "leucismo variação 1", "leucismo variação 2", "malhado variação 1", "malhado variação 2"], femea: ["Melânico", "leucismo variação 1", "leucismo variação 2", "malhado variação 1", "malhado variação 2"] }, "ganso_do_canadá": { macho: ["Cinza", "Melânico", "Leucismo cinza claro", "hibrido branco"], femea: ["Cinza", "Melânico", "Leucismo cinza claro", "hibrido branco"] }, "ganso_das_neves": { macho: ["Albino", "Melânico", "variação azul", "hibrido", "intermediario"], femea: ["Albino", "Melânico", "variação azul", "hibrido", "intermediario"] }, "gnu_de_cauda_preta": { macho: ["Albino"], femea: ["Albino", "Coroado"] }, "guaxinim_comum": { macho: ["Albino", "Melânico", "loiro malhado", "cinza malhado"], femea: ["Albino", "Melânico", "loiro malhado", "cinza malhado"] }, "iaque_selvagem": { macho: ["Ouro", "Leucismo", "albino variação 1", "albino variação 2"], femea: ["Ouro", "Leucismo", "albino variação 1", "albino variação 2", "marrom profundo", "preto profundo"] }, "ibex_de_beceite": { macho: ["Albino", "Melânico"], femea: ["Albino", "Melânico"] }, "jacaré_americano": { macho: ["Albino", "Melânico", "malhado variação 1", "malhado variação 2"], femea: ["Albino", "Melânico", "malhado variação 1", "malhado variação 2"] }, "javali": { macho: ["Albino", "Melânico", "preto e dourado"], femea: ["Albino", "Melânico", "preto e dourado"] }, "javali_africano": { macho: ["Albino"], femea: ["Albino", "Vermelho"] }, "lagópode_branco": { macho: ["Branco", "muda variação 1", "muda variação 2"], femea: ["Branco", "muda variação 1", "muda variação 2", "mosqueado variação 1", "mosqueado variação 2"] }, "lagópode_escocês": { macho: ["Branco"], femea: ["Branco"] }, "lebre_antílope": { macho: ["Albino", "Melânico"], femea: ["Albino", "Melânico"] }, "lebre_da_eurásia": { macho: ["Albino", "Branco", "muda variação 1", "muda variação 2", "pardo claro", "pardo escuro", "cinza claro", "cinza escuro"], femea: ["Albino", "Branco", "muda variação 1", "muda variação 2"] }, "lebre_peluda": { macho: ["Albino", "Branco"], femea: ["Albino", "Branco"] }, "lebre_da_cauda_branca": { macho: ["Albino"], femea: ["Albino"] }, "lebre_nuca_dourada": { macho: ["cinza claro"], femea: ["cinza claro"] }, "lebre_europeia": { macho: ["albino", "melanico"], femea: ["albino", "melanico"] }, "leopardo_das_neves": { macho: ["Albino", "Melânico", "Leucismo"], femea: ["Albino", "Melânico", "Leucismo"] }, "leão": { macho: ["Albino", "amarelado", "pardo escuro"], femea: ["Albino", "amarelado", "pardo escuro"] }, "lince_pardo_do_méxico": { macho: ["Albino", "Melânico", "Azul"], femea: ["Albino", "Melânico", "Azul"] }, "lince_euroasiática": { macho: ["Albino", "Melânico", "Malhado"], femea: ["Albino", "Melânico", "Malhado"] }, "lobo_cinzento": { macho: ["Albino", "Melânico", "cinza escuro", "clara de ovo", "marrom averelhado"], femea: ["Albino", "Melânico", "cinza escuro", "clara de ovo", "marrom averelhado"] }, "lobo_ibérico": { macho: ["Albino", "Melânico", "fantasma", "ogro", "sombra", "inverno", "oliva", "prístino"], femea: ["Albino", "Melânico", "fantasma", "ogro", "sombra", "inverno", "oliva", "prístino"] }, "marreca_carijó": { macho: ["Melânico"], femea: ["bege"] }, "marrequinha_comum": { macho: ["híbrido azul", "híbrido verde", "Leucismo variação 1", "Leucismo variação 2"], femea: ["Leucismo"] }, "marrequinha_americana": { macho: ["Albino", "Verde Claro", "malhado variação 1", "malhado variação 2", "malhado variação 3"], femea: ["malhado variação 1", "malhado variação 2"] }, "muflão_ibérico": { macho: ["Albino", "Melânico", "cinza"], femea: ["Albino", "Melânico", "cinza"] }, "muntjac_vermelho_do_norte": { macho: ["Albino", "Melânico", "Leucismo variação 1", "Leucismo variação 2", "Vermelho variação 1", "Vermelho variação 2"], femea: ["Albino", "Melânico", "Leucismo variação 1", "Leucismo variação 2"] }, "nilgó": { macho: ["Malhado variação 1", "Malhado variação 2"], femea: ["Malhado variação 1", "Malhado variação 2"] }, "onça_parda": { macho: ["Albino", "Melânico"], femea: ["Albino", "Melânico"] }, "oryx_do_cabo": { macho: ["bege", "escuro", "ouro"], femea: ["bege", "escuro", "ouro"] }, "pato_olho_de_ouro": { macho: ["eclipse", "leucismo variação 1", "leucismo variação 2"], femea: ["escuro", "leucismo variação 1", "leucismo variação 2"] }, "pato_harlequim": { macho: ["Albino", "Melânico"], femea: ["Albino", "cinza", "escuro"] }, "pato_real": { macho: ["Melânico"], femea: ["Melânico", "amarelado"] }, "peru": { macho: ["Albino", "Melânico", "Leucismo"], femea: ["Albino", "Melânico", "Leucismo"] }, "peru_selvagem": { macho: ["Albino", "Melânico", "Leucismo", "bronze"], femea: ["Albino", "Melânico", "Leucismo"] }, "peru_selvagem_do_rio_grande": { macho: ["Albino", "Melânico", "Leucismo"], femea: ["Albino", "Melânico", "Leucismo"] }, "piadeira": { macho: ["híbrido", "eclipse", "leucismo variação 1", "leucismo variação 2"], femea: ["leucismo variação 1", "leucismo variação 2"] }, "porco_selvagem": { macho: ["Albino", "rosa", "manchas pretas variação 1", "manchas pretas variação 2", "hibrido marrom variação 1", "hibrido marrom variação 2", "marrom escuro variação 1", "marrom escuro variação 2"], femea: ["rosa"] }, "raposa_tibetana": { macho: ["Albino", "Melânico", "areia", "esfumaçado", "Leucismo"], femea: ["Albino", "Melânico", "areia", "esfumaçado", "Leucismo"] }, "raposa_cinzenta": { macho: ["Albino", "Melânico", "Leucismo", "malhado variação 1", "malhado variação 2"], femea: ["Albino", "Melânico", "Leucismo", "malhado variação 1", "malhado variação 2"] }, "raposa_vermelha": { macho: ["Albino", "Melânico", "Malhado"], femea: ["Albino", "Melânico", "Malhado"] }, "rena": { macho: ["Albino", "Melânico", "Malhado", "Leucismo"], femea: ["Albino", "Melânico", "Malhado", "Leucismo"] }, "sambar": { macho: ["Albino", "leucismo variação 1", "leucismo variação 2", "malhado variação 1", "malhado variação 2", "gradiente escuro"], femea: ["Albino", "Malhado", "Leucismo"] }, "tahr": { macho: ["Albino", "branco", "vermelho", "preto", "vermelho escuro", "pardo escuro"], femea: ["Albino", "branco", "vermelho"] }, "tetraz_grande": { macho: ["pálido", "Leucismo"], femea: ["Leucismo"] }, "tigre_de_bengala": { macho: ["Albino", "Melânico", "branco", "branco sem listras", "ouro", "pseudo melanico variação 1", "pseudo melanico variação 2", "pseudo melanico branco variação 1", "pseudo melanico branco variação 2"], femea: ["Albino", "Melânico", "branco", "branco sem listras", "ouro", "pseudo melanico variação 1", "pseudo melanico variação 2", "pseudo melanico branco variação 1", "pseudo melanico branco variação 2"] }, "urso_cinzento": { macho: ["Albino", "Marrom"], femea: ["Albino"] }, "urso_negro": { macho: ["Amarelado", "Marrom", "canela"], femea: ["Amarelado", "Marrom", "canela"] }, "urso_pardo": { macho: ["Albino", "Melanico"], femea: ["Albino", "Melanico"] }, "veado_das_montanhas_rochosas": { macho: ["Albino", "malhado variação 1", "malhado variação 2"], femea: ["Albino", "malhado variação 1", "malhado variação 2"] }, "veado_de_cauda_branca": { macho: ["Albino", "Melânico", "Malhado"], femea: ["Albino", "Melânico", "Malhado"] }, "veado_de_cauda_preta": { macho: ["Albino", "Melânico", "Malhado"], femea: ["Albino", "Melânico", "Malhado"] }, "veado_de_roosevelt": { macho: ["Albino", "Melânico", "Malhado"], femea: ["Albino", "Melânico", "Malhado"] }, "veado_mula": { macho: ["Albino", "Melânico", "diluído", "malhado variação 1", "malhado variação 2"], femea: ["Albino", "Melânico", "diluído", "malhado variação 1", "malhado variação 2"] }, "veado_vermelho": { macho: ["Albino", "Melânico", "Malhado"], femea: ["Albino", "Melânico", "Malhado"] }, "zarro_negrinha": { macho: ["Albino", "eclipse", "leucismo variação 1", "leucismo variação 2"], femea: ["leucismo variação 1", "leucismo variação 2"] }, "zarro_castanho": { macho: ["Albino", "Melânico", "Leucismo"], femea: ["Albino", "Melânico", "Leucismo"] }, "ibex_espanhol_do_sudeste": { macho: ["Albino", "Melânico", "laranja", "cinza claro", "castanho acinzentado", "marrom hibrido"], femea: ["Albino", "Melânico"] }, "ibex_de_gredos": { macho: ["Albino", "Melânico"], femea: ["Albino", "Melânico"] }, "ibex_de_ronda": { macho: ["Albino", "Melânico"], femea: ["Albino", "Melânico"] }, "tetraz_azul": { macho: ["Albino", "Melânico", "Leucismo"], femea: ["Albino", "Melânico", "Leucismo"] }, "marreca_arrebio": { macho: ["Albino", "Melânico", "malhado"], femea: ["Albino", "Melânico", "Leucismo", "malhado", "brilhante", "eritristico"] }, "pato_carolino": { macho: ["Albino", "Prata Diluída", "Dourado Eritrístico", "Leucísmo", "Melânico", "Malhado"], femea: ["Albino", "Prata Diluída", "Dourado Eritrístico", "Leucísmo", "Melânico", "Malhado"] }, "castor_norte_americano": { macho: ["Albino", "Melânico", "Leucismo"], femea: ["Albino", "Melânico", "Leucismo"] }, "caribu_da_floresta_boreal": { macho: ["Albino", "Melânico", "Leucismo"], femea: ["Albino", "Melânico", "Leucismo"] }, "cervo_canadense": { macho: ["Albino", "Melânico", "Leucismo"], femea: ["Albino", "Melânico", "Leucismo"] }, "bisão_da_floresta": { macho: ["Albino", "Melânico", "Leucismo"], femea: ["Albino", "Melânico", "Leucismo"] } };
const greatsFursData = { "alce": ["Fábula Dois Tons", "Cinza lendário", "Bétula lendária", "Carvalho Fabuloso", "Fabuloso Salpicado", "Abeto lendário"], "urso_negro": ["Creme Lendário", "Espírito Lendário", "Castanho Lendário", "Pintado Lendário", "Gelo Lendário 2", "Gelo Lendário"], "veado_de_cauda_branca": ["Pardo", "Pardo Escuro", "Bronzeado", "Malhado"], "gamo": ["Café Lendário", "Pintado Lendário", "Dourado Lendário", "Misto Lendário", "Prata Lendário"], "raposa": ["A lendária Lua de Sangue", "Bengala de doce lendária", "A lendária flor de cerejeira", "Alcaçuz lendário", "A lendária papoula da meia-noite", "Floco de Neve Místico Fabuloso", "Hortelã-pimenta lendária", "Fábula Rosebud Frost", "A lendária Beladona Escarlate"], "veado_vermelho": ["Pintado Lendário"], "tahr": ["Dourado Lendário", "Cicatrizes Lendárias", "Cinza Lendário", "Café com Leite Lendário", "Crânio Lendário", "Metade Lendária", "Neve Lendário"], "veado_mula": ["Chuva de Gotículas Lendárias", "Via Láctea Lendária", "Sopro de Pétalas Lendário", "Manto Crepuscular Lendário", "Enigma Teia de Aranha Lendário", "Listras de Canela Lendário"], "faisão": ["Rubi Lendário", "Pérola Lendário", "Granada Lendário", "Safira Lendário", "Obsidiana Lendário", "Citrino Lendário", "Esmeralda Lendário", "Morganita Lendário"] };
const items = ["Alce","Antilocapra","Antílope Negro","Bantengue","Bisão da Floresta","Bisão das Planícies","Bisão Europeu","Búfalo Africano","Búfalo D'Água","Cabra da Montanha","Cabra de Leque","Cabra Selvagem","Caititu","Camurça","Canguru-cinza Oriental", "Chacal Listrado", "Caribu","Caribu da Floresta Boreal","Carneiro Azul","Carneiro Selvagem","Castor Norte-Americano","Cervo Almiscarado","Cervo Canadense","Cervo do Pântano","Cervo de Timor","Cervo Sika","Cervo-porco Indiano","Chital","Codorna-de-restolho","Codorniz da Virgínia","Coelho da Flórida","Coelho Europeu","Coiote","Corça","Crocodilo de Água Salgada","Cudo Menor","Faisão de Pescoço Anelado","Frisada","Galo Lira","Gamo","Ganso Bravo","Ganso Campestre da Tundra","Ganso das Neves","Ganso do Canadá","Ganso Pega","Gnu de Cauda Preta","Guaxinim Comum","Iaque Selvagem","Ibex de Beceite","Ibex de Gredos","Ibex de Ronda","Ibex Espanhol do Sudeste","Jacaré Americano","Javali","Javali Africano", "Lebre Europeia", "Lebre-antílope","Lebre-da-cauda-branca","Lebre Da Eurásia","Lebre Nuca Dourada","Lebre Peluda","Leão","Leopardo das Neves","Lince Euroasiática","Lince Pardo do México","Lobo Cinzento","Lobo Ibérico","Marreca Arrebio","Marreca Carijó","Marrequinha Americana","Marrequinha Comum","Muflão Ibérico","Muntjac vermelho do norte","Nilgó","Onça Parda","Oryx do Cabo","Pato Carolino","Pato Harlequim","Pato Olho de Ouro","Pato Real","Peru","Peru Selvagem","Peru Selvagem do Rio Grande","Piadeira","Porco Selvagem","Raposa cinzenta","Raposa tibetana","Raposa Vermelha","Rena","Sambar","Tahr","Tetraz Azul","Tetraz Grande","Tigre-de-Bengala","Urso Cinzento","Urso Negro","Urso Pardo","Veado das Montanhas Rochosas","Veado de Cauda Branca","Veado de Cauda Preta","Veado-Mula","Veado de Roosevelt","Veado Vermelho","Cão Guaxinim","Lagópode-Branco","Lagópode-Escocês","Galinha-Montês","Zarro-Negrinha","Zarro-castanho"];
const diamondFursData = { "alce": { macho: ["Bronzeado", "Pardo", "Pardo Claro"], femea: [] }, "antilocapra": { macho: ["Bronzeado", "Escuro", "Pardo"], femea: [] }, "antílope_negro": { macho: ["Escuro", "Pardo Escuro", "Preto", "Bege"], femea: [] }, "bantengue": { macho: ["Preto", "Café", "Pardo", "Pardo Escuro"], femea: [] }, "bisão_da_floresta": { macho: ["Pardo Escuro", "Ruivo", "Metade Ruivo", "Pardo Claro"], femea: [] }, "bisão_das_planícies": { macho: ["Escuro", "Cinza Claro", "Pardo", "Pardo Claro"], femea: [] }, "bisão_europeu": { macho: ["Pardo", "Pardo Claro", "Pardo Escuro"], femea: [] }, "búfalo_dágua": { macho: ["Cinzento", "Preto", "Laranja"], femea: [] }, "búfalo_africano": { macho: ["Cinzento", "Pardo", "Preto"], femea: [] }, "cabra_da_montanha": { macho: ["Bege", "Branco", "Cinza Claro", "Pardo Claro"], femea: [] }, "cabra_de_leque": { macho: ["Bronzeado", "Laranja", "Pardo Escuro"], femea: [] }, "cabra_selvagem": { macho: ["Amarelado", "Branco", "Pardo e Branco", "Pardo Negro", "Preto e Branco"], femea: [] }, "caititu": { macho: ["Cinza Escuro", "Cinzento", "Pardo", "Pardo Escuro"], femea: [] }, "camurça": { macho: ["Cor de Mel", "Pardo", "Pardo e Cinza", "Pardo Escuro"], femea: [] }, "canguru_cinza_oriental": { macho: ["Cinzento", "Pardo e Cinza", "Pardo"], femea: [] }, "caribu": { macho: ["Pardo Claro", "Pardo Escuro"], femea: [] }, "caribu_da_floresta_boreal": { macho: ["Pardo Escuro", "Pardo Claro"], femea: [] }, "carneiro_azul": { macho: ["Cinza Ardósia", "Pardo", "Cinza Azulado", "Amarelo"], femea: [] }, "carneiro_selvagem": { macho: ["Preto", "Pardo", "Cinzento", "Bronze"], femea: [] }, "castor_norte_americano": { macho: ["Pardo Claro", "Pardo Escuro", "Marrom Avermelhado"], femea: ["Pardo Claro", "Pardo Escuro", "Marrom Avermelhado"] }, "cervo_almiscarado": { macho: ["Pardo e Cinza", "Pardo Escuro"], femea: [] }, "cervo_canadense": { macho: ["Juba Marrom", "Escuro"], femea: [] }, "cervo_do_pântano": { macho: ["Pardo", "Pardo Claro", "Vermelho", "Pardo Escuro", "Vermelho Escuro"], femea: [] }, "cervo_de_timor": { macho: ["Dois Tons", "Pardo", "Pardo Claro", "Pardo e Branco"], femea: [] }, "cervo_sika": { macho: ["Escuro e Pintado", "Pardo", "Pintado", "Preto"], femea: [] }, "cervo_porco_indiano": { macho: ["Pardo", "Escuro e Pintado", "Pardo Escuro", "Pintado"], femea: [] }, "chital": { macho: ["Pintado", "Escuro"], femea: [] }, "chacal_listrado": { macho: ["Pardo Claro", "Pardo Cinza", "Cinzento"], femea: [] }, "codorna_de_restolho": { macho: ["Pardo", "Pardo e Cinza", "Pardo Escuro"], femea: [] }, "codorniz_da_virgínia": { macho: ["Cinzento", "Pardo", "Pardo Avermelhado"], femea: ["Cinzento", "Pardo", "Pardo Avermelhado"] }, "coelho_da_flórida": { macho: ["Cinza Claro", "Cinzento", "Pardo", "Pardo Claro"], femea: ["Cinza Claro", "Cinzento", "Pardo", "Pardo Claro"] }, "coelho_europeu": { macho: ["Bronzeado", "Pardo", "Pardo Claro", "Pardo Escuro"], femea: [] }, "coiote": { macho: ["Cinza Escuro", "Pardo e Cinza"], femea: [] }, "corça": { macho: ["Bronzeado", "Cinza Escuro", "Pardo"], femea: [] }, "crocodilo_de_água_salgada": { macho: ["Cinzento", "Oliva", "Pardo Escuro"], femea: [] }, "cudo_menor": { macho: ["Cinzento"], femea: [] }, "cão_guaxinim": { macho: ["Cinzento", "Pardo Claro", "Preto e Branco"], femea: [] }, "faisão_de_pescoço_anelado": { macho: ["Cinzento", "Muda", "Pardo", "Pardo e Branco"], femea: [] }, "frisada": { macho: ["Cinzento", "Plum. de Inverno"], femea: [] }, "galinha_montês": { macho: ["Cinzento", "Escuro", "Pardo", "Pardo Claro"], femea: [] }, "galo_lira": { macho: ["Escuro"], femea: [] }, "gamo": { macho: ["Escuro", "Escuro e Pintado", "Pintado", "Branco", "Chocolate"], femea: [] }, "ganso_bravo": { macho: ["Pardo", "Cinzento"], femea: [] }, "ganso_campestre_da_tundra": { macho: ["Cinza Claro", "Cinza Escuro", "Pardo"], femea: [] }, "ganso_das_neves": { macho: ["Variação Branca", "Variação Azul", "Variação Interm", "Híbrido"], femea: [] }, "ganso_do_canadá": { macho: ["Marrom Híbrido", "Pardo e Cinza"], femea: [] }, "ganso_pega": { macho: ["Amarelo", "Bordô", "Laranja"], femea: [] }, "gnu_de_cauda_preta": { macho: ["Cinza escuro", "Cinzento", "Ouro"], femea: [] }, "guaxinim_comum": { macho: ["Amarelado", "Cinzento", "Pardo"], femea: [] }, "iaque_selvagem": { macho: ["Pardo Escuro", "Vermelho Escuro", "Preto Profundo", "Marrom Profundo", "Ouro"], femea: [] }, "ibex_de_beceite": { macho: ["Cinzento", "Laranja", "Marrom Híbrido", "Pardo e Cinza"], femea: [] }, "ibex_de_gredos": { macho: ["Cinza Claro", "Marrom Híbrido", "Cinzento", "Pardo e Cinza"], femea: [] }, "ibex_de_ronda": { macho: ["Cinzento", "Marrom Híbrido", "Pardo", "Pardo e Cinza"], femea: [] }, "ibex_espanhol_do_sudeste": { macho: ["pardo hibrido", "pardo acinzentado", "cinza claro", "laranja"], femea: [] }, "jacaré_americano": { macho: ["Oliva", "Pardo Escuro"], femea: [] }, "javali": { macho: ["Preto e Dourado", "pardo claro variação 1", "pardo claro variação 2"], femea: [] }, "javali_africano": { macho: ["Cinzento Escuro", "Pardo Avermelhado"], femea: [] }, "lebre_antílope": { macho: ["Cinzento", "Mosqueado", "Pardo Escuro"], femea: [] }, "lebre_da_cauda_branca": { macho: ["Bege", "Cinzento", "Pardo", "Pardo Claro"], femea: [] }, "lebre_da_eurásia": { macho: ["Branco"], femea: ["Branco"] }, "lebre_europeia": { macho: ["pardo", "pardo escuro", "pardo claro", "cinza"], femea: [] }, "lebre_nuca_dourada": { macho: ["Castanho", "Pardo", "Cinzento"], femea: ["Castanho", "Pardo", "Cinzento"] }, "lebre_peluda": { macho: ["Cinza Claro", "Pardo Claro", "Pardo Escuro", "Muda"], femea: ["Cinza Claro", "Pardo Claro", "Pardo Escuro", "Muda"] }, "leão": { macho: ["Bronzeado", "Pardo Claro"], femea: [] }, "leopardo_das_neves": { macho: ["Neve", "Caramelo"], femea: [] }, "lince_euroasiática": { macho: ["Cinzento", "Pardo Claro"], femea: [] }, "lince_pardo_do_méxico": { macho: ["Bronzeado", "Cinzento", "Pardo", "Vermelho"], femea: [] }, "lobo_cinzento": { macho: ["Cinzento"], femea: [] }, "lobo_ibérico": { macho: ["Cinzento", "Pardo e Cinza"], femea: [] }, "marreca_arrebio": { macho: ["Eclipse", "Cinza", "Eritrístico"], femea: [] }, "marreca_carijó": { macho: ["Canela", "Vermelho", "Malhado"], femea: [] }, "marrequinha_americana": { macho: ["Verde Claro"], femea: [] }, "marrequinha_comum": { macho: ["Verde Claro", "Verde Escuro"], femea: [] }, "muflão_ibérico": { macho: ["Pardo", "Pardo Claro"], femea: [] }, "muntjac_vermelho_do_norte": { macho: ["Albino", "Melânico", "Leucismo variação 1", "Leucismo variação 2", "Vermelho variação 1", "Vermelho variação 2"], femea: [] }, "nilgó": { macho: ["Azul", "Pardo Escuro"], femea: [] }, "onça_parda": { macho: ["Pardo Claro", "Vermelho Escuro", "Cinzento"], femea: [] }, "oryx_do_cabo": { macho: ["Cinza Claro", "Cinzento"], femea: ["Cinza Claro", "Cinzento"] }, "pato_carolino": { macho: ["Escuro", "Prata Diluído", "Padrão", "Dourado Eritrístico"], femea: [] }, "pato_harlequim": { macho: ["Cinza Escuro", "Malhado"], femea: [] }, "pato_olho_de_ouro": { macho: ["Preto"], femea: [] }, "pato_real": { macho: ["Malhado", "Pardo Negro", "Marrom Híbrido"], femea: [] }, "peru": { macho: ["Pardo", "Pardo Claro", "Pardo Escuro"], femea: [] }, "peru_selvagem": { macho: ["Bronze", "Bronze Claro", "Pardo", "Pardo Claro"], femea: [] }, "peru_selvagem_do_rio_grande": { macho: ["Pardo", "Pardo Claro", "Siena", "Siena Claro"], femea: [] }, "piadeira": { macho: ["Cinzento", "Pardo"], femea: [] }, "porco_selvagem": { macho: ["manchas pretas variação 1", "manchas pretas variação 2", "hibrido marrom variação 1", "hibrido marrom variação 2", "Preto", "Preto e Dourado"], femea: [] }, "raposa_cinzenta": { macho: ["Cinzento", "Dois Tons", "Vermelho"], femea: ["Cinzento", "Dois Tons", "Vermelho"] }, "raposa_tibetana": { macho: ["Laranja", "Vermelho", "Cinzento", "Pardo"], femea: [] }, "raposa_vermelha": { macho: ["Laranja", "Vermelho", "Vermelho Escuro"], femea: [] }, "rena": { macho: ["Pardo Claro", "Pardo Escuro"], femea: [] }, "sambar": { macho: ["Pardo", "Pardo Claro", "Pardo Escuro"], femea: [] }, "tahr": { macho: ["Pardo Avermelhado", "Palha", "Pardo Claro"], femea: [] }, "tetraz_azul": { macho: ["Muda", "Cinza Ardósia"], femea: [] }, "tetraz_grande": { macho: ["Escuro"], femea: [] }, "tigre_de_bengala": { macho: ["Laranja"], femea: [] }, "urso_cinzento": { macho: ["Pardo e Cinza"], femea: [] }, "urso_negro": { macho: ["Escuro", "Preto"], femea: [] }, "urso_pardo": { macho: ["Canela", "Amarelo", "Pardo escuro", "Ouro", "Cinza", "Pardo claro", "Pardo avermelhado", "Espírito"], femea: [] }, "veado_das_montanhas_rochosas": { macho: ["Cinza Claro", "Pardo", "Pardo Claro"], femea: [] }, "veado_de_cauda_branca": { macho: ["Bronzeado", "Pardo", "Pardo Escuro"], femea: [] }, "veado_de_cauda_preta": { macho: ["Cinza Escuro", "Cinzento", "Pardo e Cinza"], femea: [] }, "veado_mula": { macho: ["Cinzento", "Pardo", "Amarelado"], femea: [] }, "veado_de_roosevelt": { macho: ["Bronzeado", "Laranja", "Pardo"], femea: [] }, "veado_vermelho": { macho: ["Pardo", "Pardo Claro", "Pardo Escuro"], femea: [] }, "lagópode_branco": { macho: ["Bicolor", "Muda", "Mosqueado"], femea: [] }, "lagópode_escocês": { macho: ["Bicolor", "Muda"], femea: [] }, "zarro_negrinha": { macho: ["Preto"], femea: [] }, "zarro_castanho": { macho: ["Pardo Escuro", "Pardo Avermelhado"], femea: [] } };
const reservesData = {
    layton_lake: {
        name: "Lagos de Layton",
        image: "reservas/layton_lake.png",
        animals: ["alce", "veado_de_cauda_branca", "veado_de_cauda_preta", "veado_de_roosevelt", "urso_negro", "coiote", "pato_real", "lebre_da_cauda_branca"]
    },
    hirschfelden: {
        name: "Hirschfelden",
        image: "reservas/hirschfelden.png",
        animals: ["gamo", "corça", "veado_vermelho", "javali", "bisão_europeu", "raposa_vermelha", "ganso_do_canadá", "coelho_europeu", "faisão_de_pescoço_anelado"]
    },
    medved_taiga: {
        name: "Taiga Medved",
        image: "reservas/medved_taiga.png",
        animals: ["alce", "rena", "tetraz_grande", "cervo_almiscarado", "urso_pardo", "javali", "lince_euroasiática", "lobo_cinzento"]
    },
    vurhonga_savanna: {
        name: "Savana Vurhonga",
        image: "reservas/vurhonga_savanna.png",
        animals: ["chacal_listrado", "lebre_nuca_dourada", "piadeira", "cudo_menor", "cabra_de_leque", "javali_africano", "gnu_de_cauda_preta", "búfalo_africano", "leão", "oryx_do_cabo", "antílope_negro"]
    },
    parque_fernando: {
        name: "Parque Fernando",
        image: "reservas/parque_fernando.png",
        animals: ["veado_vermelho", "marreca_carijó", "caititu", "veado_mula", "onça_parda", "antílope_negro", "búfalo_dágua", "chital"]
    },
    yukon_valley: {
        name: "Vale do Yukon",
        image: "reservas/yukon_valley.png",
        animals: ["caribu", "ganso_do_canadá", "alce", "urso_cinzento", "lobo_cinzento", "bisão_das_planícies", "raposa_vermelha", "pato_harlequim"]
    },
    cuatro_colinas: {
        name: "Cuatro Colinas",
        image: "reservas/cuatro_colinas.png",
        animals: ["ibex_de_gredos", "faisão_de_pescoço_anelado", "ibex_de_beceite", "ibex_espanhol_do_sudeste", "ibex_de_ronda", "muflão_ibérico", "lobo_ibérico", "javali", "corça", "lebre_europeia", "veado_vermelho"]
    },
    silver_ridge_peaks: {
        name: "Picos de Silver Ridge",
        image: "reservas/silver_ridge_peaks.png",
        animals: ["antilocapra", "carneiro_selvagem", "bisão_das_planícies", "cabra_da_montanha", "veado_mula", "onça_parda", "urso_negro", "veado_das_montanhas_rochosas", "peru_selvagem"]
    },
    te_awaroa: {
        name: "Te Awaroa",
        image: "reservas/te_awaroa.png",
        animals: ["veado_vermelho", "gamo", "cabra_selvagem", "porco_selvagem", "cervo_sika", "tahr", "peru_selvagem", "camurça", "coelho_europeu", "pato_real"]
    },
    rancho_del_arroyo: {
        name: "Rancho del Arroyo",
        image: "reservas/rancho_del_arroyo.png",
        animals: ["veado_mula", "veado_de_cauda_branca", "carneiro_selvagem", "antilocapra", "caititu", "coiote", "lince_pardo_do_mexico", "peru_selvagem_do_rio_grande", "faisão_de_pescoço_anelado", "lebre_antílope"]
    },
    mississippi_acres: {
        name: "Mississippi Acres",
        image: "reservas/mississippi_acres.png",
        animals: ["veado_de_cauda_branca", "codorniz_da_virgínia", "marrequinha_americana", "peru", "porco_selvagem", "urso_negro", "raposa_cinzenta", "guaxinim_comum", "coelho_da_flórida", "jacaré_americano"]
    },
    revontuli_coast: {
        name: "Costa de Revontuli",
        image: "reservas/revontuli_coast.png",
        animals: ["galinha_montês", "veado_de_cauda_branca", "urso_pardo", "alce", "ganso_bravo", "ganso_campestre_da_tundra", "ganso_do_canadá", "lagópode_branco", "lagópode_escocês", "pato_real", "piadeira", "tetraz_grande", "cão_guaxinim", "lince_euroasiática", "galo_lira", "lebre_da_eurásia", "marrequinha_comum", "pato_olho_de_ouro", "zarro_negrinha", "veado_de_cauda_preta"]
    },
    new_england_mountains: {
        name: "New England Mountains",
        image: "reservas/new_england_mountains.png",
        animals: ["alce", "codorniz_da_virgínia", "coelho_da_flórida", "faisão_de_pescoço_anelado", "marrequinha_americana", "pato_olho_de_ouro", "pato_real", "peru_selvagem", "guaxinim_comum", "lince_pardo_do_mexico", "raposa_cinzenta", "veado_de_cauda_branca", "urso_negro", "coiote", "raposa_vermelha", "gamo"]
    },
    emerald_coast: {
        name: "Emerald Coast",
        image: "reservas/emerald_coast.png",
        animals: ["canguru_cinza_oriental", "codorna_de_restolho", "raposa_vermelha", "cabra_selvagem", "cervo_porco_indiano", "porco_selvagem", "veado_vermelho", "sambar", "cervo_de_timor", "gamo", "bantengue", "crocodilo_de_água_salgada", "ganso_pega", "chital"]
    },
    sundarpatan: {
        name: "Sundarpatan",
        image: "reservas/sundarpatan.png",
        animals: ["antílope_negro", "ganso_bravo", "lebre_peluda", "muntjac_vermelho_do_norte", "raposa_tibetana", "tahr", "carneiro_azul", "cervo_do_pântano", "nilgó", "búfalo_dágua", "leopardo_das_neves", "iaque_selvagem", "tigre_de_bengala", "javali"]
    },
    salzwiesen: {
        name: "Salzwiesen Park",
        image: "reservas/salzwiesen.png",
        animals: ["coelho_europeu", "frisada", "galo_lira", "guaxinim_comum", "raposa_vermelha", "ganso_campestre_da_tundra", "faisão_de_pescoço_anelado", "cão_guaxinim", "ganso_bravo", "marrequinha_comum", "pato_olho_de_ouro", "pato_real", "piadeira", "zarro_negrinha", "zarro_castanho", "veado_de_cauda_preta"]
    },
    askiy_ridge: {
        name: "Askiy Ridge",
        image: "reservas/askiy_ridge.png",
        animals: ["alce", "caribu_da_floresta_boreal", "urso_negro", "veado_mula", "bisão_da_floresta", "cabra_da_montanha", "antilocapra", "tetraz_azul", "pato_real", "pato_carolino", "marreca_arrebio", "ganso_do_canadá", "ganso_das_neves", "lobo_cinzento", "cervo_canadense", "veado_de_cauda_branca", "faisão_de_pescoço_anelado", "carneiro_selvagem", "castor_norte_americano"]
    }
};
const multiMountsData = {
    "a_fuga": {
        name: "A Fuga",
        animals: [
            { slug: "veado_vermelho", gender: "macho" },
            { slug: "veado_vermelho", gender: "femea" }
        ]
    },
    "abraco_do_urso": {
        name: "Abraço do Urso",
        animals: [
            { slug: "urso_cinzento", gender: "macho" },
            { slug: "urso_cinzento", gender: "macho" }
        ]
    },
    "adeus_filho": {
        name: "Adeus, Filho",
        animals: [
            { slug: "bisão_das_planícies", gender: "macho" },
            { slug: "lobo_cinzento", gender: "macho" },
            { slug: "lobo_cinzento", gender: "macho" }
        ]
    },
    "admiralces": {
        name: "Admiralces",
        animals: [
            { slug: "alce", gender: "macho" },
            { slug: "codorniz_da_virgínia", gender: "macho" }
        ]
    },
    "almoco_da_raposa": {
        name: "Almoço da Raposa",
        animals: [
            { slug: "raposa_vermelha", gender: "macho" },
            { slug: "lebre_da_cauda_branca", gender: "macho" }
        ]
    },
    "banquete_no_ar": {
        name: "Banquete no Ar",
        animals: [
            { slug: "raposa_vermelha", gender: "macho" },
            { slug: "faisão_de_pescoço_anelado", gender: "macho" }
        ]
    },
    "brincadeira_de_aves": {
        name: "Brincadeira de Aves",
        animals: [
            { slug: "lagópode_escocês", gender: "macho" },
            { slug: "cão_guaxinim", gender: "macho" }
        ]
    },
    "brincando_de_briga": {
        name: "Brincando de Briga",
        animals: [
            { slug: "lince_euroasiática", gender: "macho" },
            { slug: "lince_euroasiática", gender: "femea" }
        ]
    },
    "caudas_brancas_unidas": {
        name: "Caudas Brancas Unidas",
        animals: [
            { slug: "veado_de_cauda_branca", gender: "macho" },
            { slug: "veado_de_cauda_branca", gender: "macho" },
            { slug: "veado_de_cauda_branca", gender: "macho" }
        ]
    },
    "colisao": {
        name: "Colisão",
        animals: [
            { slug: "veado_de_cauda_preta", gender: "macho" },
            { slug: "onça_parda", gender: "macho" }
        ]
    },
    "competicao_amistosa": {
        name: "Competição Amistosa",
        animals: [
            { slug: "coiote", gender: "macho" },
            { slug: "coiote", gender: "macho" },
            { slug: "lebre_da_cauda_branca", gender: "macho" }
        ]
    },
    "corcas_unidas": {
        name: "Corças Unidas",
        animals: [
            { slug: "corça", gender: "macho" },
            { slug: "corça", gender: "macho" },
            { slug: "corça", gender: "macho" }
        ]
    },
    "davi_e_golias": {
        name: "Davi e Golias",
        animals: [
            { slug: "ganso_do_canadá", gender: "macho" },
            { slug: "bisão_europeu", gender: "macho" }
        ]
    },
    "de_cabeca": {
        name: "De Cabeça",
        animals: [
            { slug: "ibex_de_beceite", gender: "macho" },
            { slug: "ibex_de_gredos", gender: "macho" }
        ]
    },
    "decolagem_de_emergencia": {
        name: "Decolagem de Emergência",
        animals: [
            { slug: "coiote", gender: "macho" },
            { slug: "pato_real", gender: "macho" },
            { slug: "pato_real", gender: "macho" },
            { slug: "pato_real", gender: "femea" }
        ]
    },
    "despedida_do_solteiros": {
        name: "Despedida dos Solteiros",
        animals: [
            { slug: "veado_mula", gender: "macho" },
            { slug: "veado_mula", gender: "femea" },
            { slug: "veado_mula", gender: "femea" }
        ]
    },
    "dois_tipos_de_perus": {
        name: "Dois Tipos de Perus",
        animals: [
            { slug: "peru_selvagem", gender: "macho" },
            { slug: "peru_selvagem_do_rio_grande", gender: "macho" }
        ]
    },
    "espionagem_tatica": {
        name: "Espionagem Tática",
        animals: [
            { slug: "onça_parda", gender: "femea" },
            { slug: "veado_de_roosevelt", gender: "macho" }
        ]
    },
    "faisoes_em_fuga": {
        name: "Faisões em Fuga",
        animals: [
            { slug: "faisão_de_pescoço_anelado", gender: "macho" },
            { slug: "faisão_de_pescoço_anelado", gender: "macho" }
        ]
    },
    "falso_tronco": {
        name: "Falso Tronco",
        animals: [
            { slug: "jacaré_americano", gender: "macho" },
            { slug: "guaxinim_comum", gender: "macho" }
        ]
    },
    "fantasma_da_montanha": {
        name: "Fantasma da Montanha",
        animals: [
            { slug: "leopardo_das_neves", gender: "macho" },
            { slug: "carneiro_azul", gender: "macho" }
        ]
    },
    "fartura_de_bisoes": {
        name: "Fartura de Bisões",
        animals: [
            { slug: "bisão_europeu", gender: "macho" },
            { slug: "bisão_europeu", gender: "macho" }
        ]
    },
    "gamos_unidos": {
        name: "Gamos Unidos",
        animals: [
            { slug: "gamo", gender: "macho" },
            { slug: "gamo", gender: "macho" },
            { slug: "gamo", gender: "macho" }
        ]
    },
    "ganha_pao": {
        name: "Ganha-pão",
        animals: [
            { slug: "búfalo_africano", gender: "macho" },
            { slug: "leão", gender: "macho" },
            { slug: "leão", gender: "femea" },
            { slug: "leão", gender: "femea" }
        ]
    },
    "gansos_zangados": {
        name: "Gansos Zangados",
        animals: [
            { slug: "ganso_do_canadá", gender: "macho" },
            { slug: "ganso_do_canadá", gender: "macho" }
        ]
    },
    "gluglu": {
        name: "Gluglu",
        animals: [
            { slug: "peru_selvagem", gender: "macho" },
            { slug: "peru_selvagem", gender: "femea" },
            { slug: "peru_selvagem", gender: "femea" }
        ]
    },
    "lanchinho_de_tigre": {
        name: "Lanchinho de Tigre",
        animals: [
            { slug: "tahr", gender: "macho" },
            { slug: "tahr", gender: "femea" },
            { slug: "tahr", gender: "femea" }
        ]
    },
    "laod_a_lado": {
        name: "Laod a Lado",
        animals: [
            { slug: "veado_de_cauda_branca", gender: "macho" },
            { slug: "veado_de_cauda_branca", gender: "macho" }
        ]
    },
    "lebres_rivais": {
        name: "Lebres Rivais",
        animals: [
            { slug: "lebre_antílope", gender: "macho" },
            { slug: "lebre_antílope", gender: "macho" }
        ]
    },
    "lobo_alfa": {
        name: "Lobo Alfa",
        animals: [
            { slug: "lobo_cinzento", gender: "macho" },
            { slug: "lobo_cinzento", gender: "femea" },
            { slug: "lobo_cinzento", gender: "femea" }
        ]
    },
    "marujos_de_agua_doce": {
        name: "Marujos de Água Doce",
        animals: [
            { slug: "faisão_de_pescoço_anelado", gender: "macho" },
            { slug: "tetraz_grande", gender: "macho" },
            { slug: "ganso_bravo", gender: "macho" },
            { slug: "ganso_campestre_da_tundra", gender: "macho" }
        ]
    },
    "necessidades_basicas": {
        name: "Necessidades Básicas",
        animals: [
            { slug: "urso_negro", gender: "macho" },
            { slug: "urso_negro", gender: "macho" }
        ]
    },
    "o_grand_slam": {
        name: "O Grand Slam",
        animals: [
            { slug: "ibex_de_beceite", gender: "macho" },
            { slug: "ibex_de_gredos", gender: "macho" },
            { slug: "ibex_de_ronda", gender: "macho" },
            { slug: "ibex_espanhol_do_sudeste", gender: "macho" }
        ]
    },
    "operador_suave": {
        name: "Operador Suave",
        animals: [
            { slug: "tetraz_grande", gender: "macho" },
            { slug: "tetraz_grande", gender: "femea" },
            { slug: "tetraz_grande", gender: "femea" }
        ]
    },
    "os_tres_patinhos": {
        name: "Os Três Patinhos",
        animals: [
            { slug: "piadeira", gender: "macho" },
            { slug: "zarro_castanho", gender: "macho" },
            { slug: "frisada", gender: "macho" }
        ]
    },
    "parceiros_no_crime": {
        name: "Parceiros no Crime",
        animals: [
            { slug: "raposa_vermelha", gender: "macho" },
            { slug: "raposa_vermelha", gender: "macho" }
        ]
    },
    "presas_a_mostra": {
        name: "Presas à Mostra",
        animals: [
            { slug: "muflão_ibérico", gender: "macho" },
            { slug: "lobo_ibérico", gender: "macho" },
            { slug: "lobo_ibérico", gender: "macho" },
            { slug: "lobo_ibérico", gender: "macho" }
        ]
    },
    "procos_do_mato_em_conflito": {
        name: "Procos-do-Mato em Conflito",
        animals: [
            { slug: "caititu", gender: "macho" },
            { slug: "caititu", gender: "macho" }
        ]
    },
    "ramboru": {
        name: "Ramboru",
        animals: [
            { slug: "canguru_cinza_oriental", gender: "macho" },
            { slug: "canguru_cinza_oriental", gender: "macho" }
        ]
    },
    "raposas_adversarias": {
        name: "Raposas Adversárias",
        animals: [
            { slug: "raposa_vermelha", gender: "macho" },
            { slug: "raposa_cinzenta", gender: "macho" }
        ]
    },
    "realeza": {
        name: "Realeza",
        animals: [
            { slug: "leão", gender: "macho" },
            { slug: "leão", gender: "femea" }
        ]
    },
    "rixa_de_aves": {
        name: "Rixa de Aves",
        animals: [
            { slug: "galo_lira", gender: "macho" },
            { slug: "galo_lira", gender: "macho" }
        ]
    },
    "saindo_de_fininho": {
        name: "Saindo de Fininho",
        animals: [
            { slug: "pato_real", gender: "macho" },
            { slug: "pato_olho_de_ouro", gender: "macho" },
            { slug: "zarro_negrinha", gender: "macho" },
            { slug: "marrequinha_comum", gender: "macho" },
            { slug: "piadeira", gender: "macho" },
            { slug: "zarro_castanho", gender: "macho" },
            { slug: "frisada", gender: "macho" }
        ]
    },
    "tahr_angulo_amoroso": {
        name: "Tahr-ângulo Amoroso",
        animals: [
            { slug: "tigre_de_bengala", gender: "macho" },
            { slug: "cervo_do_pântano", gender: "macho" }
        ]
    },
    "treno_vendido_separadamente": {
        name: "Trenó Vendido Separadamente",
        animals: [
            { slug: "rena", gender: "macho" },
            { slug: "rena", gender: "macho" },
            { slug: "rena", gender: "macho" }
        ]
    },
    "turma_dos_coelhos": {
        name: "Turma dos Coelhos",
        animals: [
            { slug: "lebre_da_cauda_branca", gender: "macho" },
            { slug: "lebre_da_cauda_branca", gender: "macho" },
            { slug: "lebre_da_cauda_branca", gender: "femea" },
            { slug: "lebre_da_cauda_branca", gender: "femea" }
        ]
    },
    "um_crocodilo_sortudo": {
        name: "Um Crocodilo Sortudo",
        animals: [
            { slug: "ganso_pega", gender: "macho" },
            { slug: "crocodilo_de_água_salgada", gender: "macho" }
        ]
    },
    "um_par_de_predadores": {
        name: "Um Par de Predadores",
        animals: [
            { slug: "coiote", gender: "macho" },
            { slug: "lince_pardo_do_mexico", gender: "macho" }
        ]
    },
    "vigilancia": {
        name: "Vigilância",
        animals: [
            { slug: "cudo_menor", gender: "macho" },
            { slug: "cudo_menor", gender: "femea" }
        ]
    },
    "viver_amar_lenhar": {
        name: "Viver, Amar, Lenhar",
        animals: [
            { slug: "castor_norte_americano", gender: "macho" },
            { slug: "castor_norte_americano", gender: "femea" }
        ]
    }
};

// --- FUNÇÕES E LÓGICA PRINCIPAL ---

function slugify(text) {
    return text.toLowerCase().replace(/[-\s]+/g, '_').replace(/'/g, '');
}

const categorias = {
    pelagens: { title: 'Pelagens Raras', items: items, icon: 'fas fa-paw' },
    diamantes: { title: 'Diamantes', items: items, icon: 'fas fa-gem' },
    greats: { title: 'Great Ones', items: ["Alce", "Urso Negro", "Veado-Mula", "Veado Vermelho", "Veado-de-cauda-branca", "Raposa", "Faisão", "Gamo", "Tahr"], icon: 'fas fa-crown' },
    super_raros: { title: 'Super Raros', items: Object.keys(rareFursData).filter(slug => (rareFursData[slug].macho?.length > 0) || (rareFursData[slug].femea?.length > 0)).map(slug => items.find(item => slugify(item) === slug) || slug), icon: 'fas fa-star' },
    montagens: { title: 'Montagens Múltiplas', icon: 'fas fa-trophy' },
    grind: { title: 'Contador de Grind', icon: 'fas fa-crosshairs' },
    reservas: { title: 'Reservas de Caça', icon: 'fas fa-map-marked-alt' },
    progresso: { title: 'Painel de Progresso', icon: 'fas fa-chart-line' }
};

let appContainer;

function checkAndSetGreatOneCompletion(slug, currentData) {
    const requiredFurs = greatsFursData[slug];
    if (!requiredFurs || !currentData) return;
    currentData.completo = requiredFurs.every(furName => currentData.furs?.[furName]?.trophies?.length > 0);
}

function renderNavigationHub() {
    appContainer.innerHTML = '';
    
    const hub = document.createElement('div');
    hub.className = 'navigation-hub';
    
    const title = document.createElement('h1');
    title.className = 'hub-title';
    title.textContent = 'Álbum de Caça';
    hub.appendChild(title);

    Object.keys(categorias).forEach(key => {
        const cat = categorias[key];
        const card = document.createElement('div');
        card.className = 'nav-card';
        card.innerHTML = `
            <i class="${cat.icon || 'fas fa-question-circle'}"></i>
            <span>${cat.title}</span>
        `;
        card.dataset.target = key;
        card.addEventListener('click', () => renderMainView(key));
        hub.appendChild(card);
    });

    appContainer.appendChild(hub);
}

function renderMainView(tabKey) {
    appContainer.innerHTML = '';
    const currentTab = categorias[tabKey];
    if (!currentTab) return;

    const mainContent = document.createElement('div');
    mainContent.className = 'main-content';

    const header = document.createElement('div');
    header.className = 'page-header';
    
    const title = document.createElement('h2');
    title.textContent = currentTab.title;
    
    const backButton = document.createElement('button');
    backButton.className = 'back-button';
    backButton.innerHTML = '&larr; Voltar ao Menu';
    backButton.onclick = renderNavigationHub;
    
    header.appendChild(title);
    header.appendChild(backButton);
    mainContent.appendChild(header);
    
    const contentContainer = document.createElement('div');
    contentContainer.className = 'content-container';
    mainContent.appendChild(contentContainer);
    
    appContainer.appendChild(mainContent);

    if (tabKey === 'progresso') {
        renderProgressView(contentContainer);
    } else if (tabKey === 'reservas') {
        renderReservesList(contentContainer);
    } else if (tabKey === 'montagens') {
        renderMultiMountsView(contentContainer);
    } else if (tabKey === 'grind') {
        renderGrindHubView(contentContainer); // MODIFICADO: Chama a nova função do hub de grind
    } else {
        const filterInput = document.createElement('input');
        filterInput.type = 'text';
        filterInput.className = 'filter-input';
        filterInput.placeholder = 'Buscar animal...';
        contentContainer.appendChild(filterInput);

        const albumGrid = document.createElement('div');
        albumGrid.className = 'album-grid';
        contentContainer.appendChild(albumGrid);

        (currentTab.items || []).sort((a, b) => a.localeCompare(b)).forEach(name => {
            const card = createAnimalCard(name, tabKey);
            albumGrid.appendChild(card);
        });

        filterInput.addEventListener('input', (event) => {
            const searchTerm = event.target.value.toLowerCase();
            albumGrid.querySelectorAll('.animal-card').forEach(card => {
                const animalName = card.querySelector('.info').textContent.toLowerCase();
                card.style.display = animalName.includes(searchTerm) ? 'block' : 'none';
            });
        });
    }
}

function createAnimalCard(name, tabKey) {
    const card = document.createElement('div');
    card.className = 'animal-card';
    const slug = slugify(name);
    card.dataset.slug = slug;
    card.innerHTML = `<img src="animais/${slug}.png" alt="${name}" onerror="this.onerror=null;this.src='animais/placeholder.png';"><div class="info">${name}</div>`;
    card.addEventListener('click', () => showDetailView(name, tabKey));
    updateCardAppearance(card, slug, tabKey);
    return card;
}

function showDetailView(name, tabKey, originReserveKey = null) {
    if (originReserveKey) {
        renderAnimalDossier(name, originReserveKey);
    } else {
        renderSimpleDetailView(name, tabKey);
    }
}

function renderSimpleDetailView(name, tabKey) {
    const mainContent = document.querySelector('.main-content');
    const slug = slugify(name);

    const contentContainer = mainContent.querySelector('.content-container');
    contentContainer.innerHTML = '';
    
    mainContent.querySelector('.page-header h2').textContent = name;
    const backButton = mainContent.querySelector('.page-header .back-button');
    backButton.innerHTML = `&larr; Voltar para ${categorias[tabKey].title}`;
    backButton.onclick = () => renderMainView(tabKey);
    
    const detailContent = contentContainer || mainContent;

    if (tabKey === 'greats') {
        renderGreatsDetailView(detailContent, name, slug);
    } else if (tabKey === 'pelagens') {
        renderRareFursDetailView(detailContent, name, slug);
    } else if (tabKey === 'super_raros') {
        renderSuperRareDetailView(detailContent, name, slug);
    } else if (tabKey === 'diamantes') {
        renderDiamondsDetailView(detailContent, name, slug);
    }
}

function renderAnimalDossier(animalName, originReserveKey) {
    const mainContent = document.querySelector('.main-content');
    const slug = slugify(animalName);
    
    const contentContainer = mainContent.querySelector('.content-container');
    contentContainer.innerHTML = '';

    mainContent.querySelector('.page-header h2').textContent = `Dossiê: ${animalName}`;
    const backButton = mainContent.querySelector('.page-header .back-button');
    backButton.innerHTML = `&larr; Voltar para ${reservesData[originReserveKey].name}`;
    backButton.onclick = () => showReserveDetailView(originReserveKey);

    const dossierTabs = document.createElement('div');
    dossierTabs.className = 'dossier-tabs';
    
    const dossierContent = document.createElement('div');
    dossierContent.className = 'dossier-content';

    const tabs = {
        pelagens: { title: 'Pelagens Raras', renderFunc: renderRareFursDetailView },
        diamantes: { title: 'Diamantes', renderFunc: renderDiamondsDetailView },
        super_raros: { title: 'Super Raros', renderFunc: renderSuperRareDetailView },
    };
    if (greatsFursData[slug]) {
        tabs.greats = { title: '<i class="fas fa-crown"></i> Great Ones', renderFunc: renderGreatsDetailView };
    }

    Object.entries(tabs).forEach(([key, value]) => {
        const tab = document.createElement('div');
        tab.className = 'dossier-tab';
        tab.innerHTML = value.title;
        tab.dataset.key = key;
        dossierTabs.appendChild(tab);
    });

    contentContainer.appendChild(dossierTabs);
    contentContainer.appendChild(dossierContent);
    
    dossierTabs.addEventListener('click', e => {
        const tab = e.target.closest('.dossier-tab');
        if(!tab) return;
        
        dossierTabs.querySelectorAll('.dossier-tab').forEach(t => t.classList.remove('active'));
        tab.classList.add('active');
        
        const tabKey = tab.dataset.key;
        tabs[tabKey].renderFunc(dossierContent, animalName, slug);
    });
    
    dossierTabs.querySelector('.dossier-tab').click();
}


// --- LÓGICA DAS ABAS ESPECÍFICAS ---

function renderReservesList(container) {
    container.innerHTML = '';
    const grid = document.createElement('div');
    grid.className = 'album-grid reserves-grid'; 
    container.appendChild(grid);

    const sortedReserves = Object.entries(reservesData).sort(([, a], [, b]) => a.name.localeCompare(b.name));

    for (const [reserveKey, reserve] of sortedReserves) {
        const progress = calculateReserveProgress(reserveKey);
        
        const card = document.createElement('div');
        card.className = 'reserve-card';
        card.innerHTML = `
            <div class="reserve-card-bg" style="background-image: url('${reserve.image}')"></div>
            <div class="reserve-card-overlay"></div>
            <div class="reserve-card-content">
                <div class="reserve-card-stats">
                    <span><i class="fas fa-paw"></i> ${progress.collectedRares}</span>
                    <span><i class="fas fa-gem"></i> ${progress.collectedDiamonds}</span>
                    <span><i class="fas fa-crown"></i> ${progress.collectedGreatOnes}</span>
                </div>
                <img src="${reserve.image.replace('.png', '_logo.png')}" class="reserve-card-logo" alt="${reserve.name}" onerror="this.style.display='none'">
            </div>
        `;
        card.addEventListener('click', () => showReserveDetailView(reserveKey));
        grid.appendChild(card);
    }
}

function showReserveDetailView(reserveKey) {
    const mainContent = document.querySelector('.main-content');
    const contentContainer = mainContent.querySelector('.content-container');
    contentContainer.innerHTML = ''; 

    const reserve = reservesData[reserveKey];
    if (!reserve) return;

    mainContent.querySelector('.page-header h2').textContent = reserve.name;
    const backButton = mainContent.querySelector('.page-header .back-button');
    backButton.innerHTML = `&larr; Voltar para Reservas`;
    backButton.onclick = () => renderMainView('reservas');

    const checklistContainer = document.createElement('div');
    checklistContainer.className = 'animal-checklist';
    
    const animalNames = reserve.animals.map(slug => items.find(item => slugify(item) === slug)).filter(name => name);

    animalNames.sort((a,b) => a.localeCompare(b)).forEach(animalName => {
        const slug = slugify(animalName);
        
        const totalRares = (rareFursData[slug]?.macho.length || 0) + (rareFursData[slug]?.femea.length || 0);
        const collectedRares = Object.values(savedData.pelagens?.[slug] || {}).filter(v => v === true).length;
        const raresPercentage = totalRares > 0 ? (collectedRares / totalRares) * 100 : 0;

        const totalDiamonds = (diamondFursData[slug]?.macho.length || 0) + (diamondFursData[slug]?.femea.length || 0);
        const collectedDiamonds = new Set((savedData.diamantes?.[slug] || []).map(t => t.type)).size;
        const diamondsPercentage = totalDiamonds > 0 ? (collectedDiamonds / totalDiamonds) * 100 : 0;
        
        const isGreatOne = greatsFursData.hasOwnProperty(slug);

        const row = document.createElement('div');
        row.className = 'animal-checklist-row';
        row.innerHTML = `
            <img class="animal-icon" src="animais/${slug}.png" onerror="this.src='animais/placeholder.png'">
            <div class="animal-name">${animalName}</div>
            <div class="mini-progress-bars">
                <div class="mini-progress" title="Pelagens Raras: ${collectedRares}/${totalRares}">
                    <i class="fas fa-paw"></i>
                    <div class="mini-progress-bar-container"><div class="mini-progress-bar" style="width: ${raresPercentage}%"></div></div>
                </div>
                <div class="mini-progress" title="Diamantes: ${collectedDiamonds}/${totalDiamonds}">
                    <i class="fas fa-gem"></i>
                    <div class="mini-progress-bar-container"><div class="mini-progress-bar" style="width: ${diamondsPercentage}%"></div></div>
                </div>
            </div>
            <i class="fas fa-crown great-one-indicator ${isGreatOne ? 'possible' : ''}" title="Pode ser Great One"></i>
        `;
        row.addEventListener('click', () => showDetailView(animalName, 'reservas', reserveKey));
        checklistContainer.appendChild(row);
    });

    contentContainer.appendChild(checklistContainer);
}

function calculateReserveProgress(reserveKey) {
    const reserveAnimals = reservesData[reserveKey]?.animals || [];
    let progress = {
        collectedRares: 0, totalRares: 0,
        collectedDiamonds: 0, totalDiamonds: 0,
        collectedGreatOnes: 0, totalGreatOnes: 0
    };

    reserveAnimals.forEach(slug => {
        if (rareFursData[slug]) {
            progress.totalRares += (rareFursData[slug].macho?.length || 0) + (rareFursData[slug].femea?.length || 0);
            progress.collectedRares += Object.values(savedData.pelagens?.[slug] || {}).filter(v => v === true).length;
        }
        if (diamondFursData[slug]) {
            progress.totalDiamonds += (diamondFursData[slug].macho?.length || 0) + (diamondFursData[slug].femea?.length || 0);
            progress.collectedDiamonds += new Set((savedData.diamantes?.[slug] || []).map(t => t.type)).size;
        }
        if (greatsFursData[slug]) {
            progress.totalGreatOnes += greatsFursData[slug].length;
            progress.collectedGreatOnes += Object.values(savedData.greats?.[slug]?.furs || {}).filter(f => f.trophies?.length > 0).length;
        }
    });

    return progress;
}

function renderRareFursDetailView(container, name, slug) {
    container.innerHTML = '';
    const furGrid = document.createElement('div');
    furGrid.className = 'fur-grid';
    container.appendChild(furGrid);
    const speciesFurs = rareFursData[slug];
    if (!speciesFurs || (speciesFurs.macho.length === 0 && speciesFurs.femea.length === 0)) {
        furGrid.innerHTML = '<p>Nenhuma pelagem rara listada para este animal.</p>';
        return;
    }
    const genderedFurs = [];
    if (speciesFurs.macho) speciesFurs.macho.forEach(fur => genderedFurs.push({ displayName: `Macho ${fur}`, originalName: fur, gender: 'macho' }));
    if (speciesFurs.femea) speciesFurs.femea.forEach(fur => genderedFurs.push({ displayName: `Fêmea ${fur}`, originalName: fur, gender: 'femea' }));
    
    genderedFurs.sort((a, b) => a.displayName.localeCompare(b.displayName)).forEach(furInfo => {
        const furCard = document.createElement('div');
        const isCompleted = savedData.pelagens?.[slug]?.[furInfo.displayName] === true;
        furCard.className = `fur-card ${isCompleted ? 'completed' : 'incomplete'}`;
        const furSlug = slugify(furInfo.originalName), genderSlug = furInfo.gender;
        furCard.innerHTML = `
            <img src="animais/pelagens/${slug}_${furSlug}_${genderSlug}.png" onerror="this.onerror=null; this.src='animais/pelagens/${slug}_${furSlug}.png'; this.onerror=null; this.src='animais/${slug}.png';">
            <div class="info">${furInfo.displayName}</div>
            <button class="fullscreen-btn" onclick="openImageViewer(this.closest('.fur-card').querySelector('img').src); event.stopPropagation();" title="Ver em tela cheia">&#x26F6;</button>
        `;
        furCard.addEventListener('click', () => {
            if (!savedData.pelagens) savedData.pelagens = {};
            if (!savedData.pelagens[slug]) savedData.pelagens[slug] = {};
            const currentState = savedData.pelagens[slug][furInfo.displayName] || false;
            savedData.pelagens[slug][furInfo.displayName] = !currentState;
            saveData(savedData);
            furCard.classList.toggle('completed', !currentState);
            furCard.classList.toggle('incomplete', currentState);
        });
        furGrid.appendChild(furCard);
    });
}

function renderSuperRareDetailView(container, name, slug) {
    container.innerHTML = '';
    const furGrid = document.createElement('div');
    furGrid.className = 'fur-grid';
    container.appendChild(furGrid);
    
    const speciesFurs = rareFursData[slug];
    if (!speciesFurs || (speciesFurs.macho.length === 0 && speciesFurs.femea.length === 0)) {
        furGrid.innerHTML = '<p>Nenhuma pelagem rara listada para este animal.</p>'; return;
    }
    const genderedFurs = [];
    if (speciesFurs.macho) speciesFurs.macho.forEach(fur => genderedFurs.push({ displayName: `Macho ${fur} Diamante`, originalName: fur, gender: 'macho' }));
    if (diamondFursData[slug]?.femea?.length > 0) speciesFurs.femea.forEach(fur => genderedFurs.push({ displayName: `Fêmea ${fur} Diamante`, originalName: fur, gender: 'femea' }));

    if (genderedFurs.length === 0) {
        furGrid.innerHTML = '<p>Nenhuma opção de Super Raro (Pelagem Rara + Diamante) disponível para este animal.</p>'; return;
    }
    genderedFurs.sort((a, b) => a.displayName.localeCompare(b.displayName)).forEach(furInfo => {
        const furCard = document.createElement('div');
        const isCompleted = savedData.super_raros?.[slug]?.[furInfo.displayName] === true;
        furCard.className = `fur-card ${isCompleted ? 'completed' : 'incomplete'}`;
        const furSlug = slugify(furInfo.originalName), genderSlug = furInfo.gender;
        furCard.innerHTML = `
            <img src="animais/pelagens/${slug}_${furSlug}_${genderSlug}.png" onerror="this.onerror=null; this.src='animais/pelagens/${slug}_${furSlug}.png'; this.onerror=null; this.src='animais/${slug}.png';">
            <div class="info">${furInfo.displayName}</div>
            <button class="fullscreen-btn" onclick="openImageViewer(this.closest('.fur-card').querySelector('img').src); event.stopPropagation();" title="Ver em tela cheia">&#x26F6;</button>
        `;
        furCard.addEventListener('click', () => {
            if (!savedData.super_raros) savedData.super_raros = {};
            if (!savedData.super_raros[slug]) savedData.super_raros[slug] = {};
            const currentState = savedData.super_raros[slug][furInfo.displayName] || false;
            savedData.super_raros[slug][furInfo.displayName] = !currentState;
            saveData(savedData);
            furCard.classList.toggle('completed', !currentState);
            furCard.classList.toggle('incomplete', currentState);
        });
        furGrid.appendChild(furCard);
    });
}

function renderDiamondsDetailView(container, name, slug) {
    container.innerHTML = '';
    const furGrid = document.createElement('div');
    furGrid.className = 'fur-grid';
    container.appendChild(furGrid);

    const speciesDiamondFurs = diamondFursData[slug];
    if (!speciesDiamondFurs) { furGrid.innerHTML = '<p>Nenhuma pelagem de diamante listada para este animal.</p>'; return; }
    const allPossibleFurs = [];
    if (speciesDiamondFurs.macho) speciesDiamondFurs.macho.forEach(fur => allPossibleFurs.push({ displayName: `${fur}`, originalName: fur, gender: 'Macho' }));
    if (speciesDiamondFurs.femea) speciesDiamondFurs.femea.forEach(fur => allPossibleFurs.push({ displayName: `${fur}`, originalName: fur, gender: 'Fêmea' }));
    
    allPossibleFurs.sort((a, b) => a.displayName.localeCompare(b.displayName)).forEach(furInfo => {
        const furCard = document.createElement('div');
        furCard.className = 'fur-card';
        const fullTrophyName = `${furInfo.gender} ${furInfo.displayName}`;
        const highestScoreTrophy = (savedData.diamantes?.[slug] || []).filter(t => t.type === fullTrophyName).reduce((max, t) => t.score > max.score ? t : max, { score: -1 });
        const isCompleted = highestScoreTrophy.score !== -1;
        furCard.classList.add(isCompleted ? 'completed' : 'incomplete');
        const furSlug = slugify(furInfo.originalName), genderSlug = furInfo.gender.toLowerCase();
        furCard.innerHTML = `
            <img src="animais/pelagens/${slug}_${furSlug}_${genderSlug}.png" onerror="this.onerror=null; this.src='animais/pelagens/${slug}_${furSlug}.png'; this.onerror=null; this.src='animais/${slug}.png';">
            <div class="info-header"><span class="gender-tag">${furInfo.gender}</span><div class="info">${furInfo.displayName}</div></div>
            <div class="score-container">${isCompleted ? `<span class="score-display"><i class="fas fa-trophy"></i> ${highestScoreTrophy.score}</span>` : '<span class="score-add-btn">Adicionar Pontuação</span>'}</div>
            <button class="fullscreen-btn" onclick="openImageViewer(this.closest('.fur-card').querySelector('img').src); event.stopPropagation();" title="Ver em tela cheia">&#x26F6;</button>
        `;
        const scoreContainer = furCard.querySelector('.score-container');
        scoreContainer.addEventListener('click', e => {
            e.stopPropagation();
            if (scoreContainer.querySelector('input')) return;
            const currentScore = isCompleted ? highestScoreTrophy.score : '';
            scoreContainer.innerHTML = `<input type="number" class="score-input" value="${currentScore}" placeholder="0.0">`;
            const input = scoreContainer.querySelector('.score-input');
            input.focus(); input.select();
            const saveScore = () => {
                if (input.value !== null && !isNaN(input.value) && input.value.trim() !== '') {
                    if (!savedData.diamantes) savedData.diamantes = {};
                    if (!Array.isArray(savedData.diamantes[slug])) savedData.diamantes[slug] = [];
                    const otherTrophies = savedData.diamantes[slug].filter(t => t.type !== fullTrophyName);
                    savedData.diamantes[slug] = [...otherTrophies, { id: Date.now(), type: fullTrophyName, score: parseFloat(input.value) }];
                    saveData(savedData);
                }
                renderDiamondsDetailView(container, name, slug);
            };
            input.addEventListener('blur', saveScore);
            input.addEventListener('keydown', e => { if (e.key === 'Enter') saveScore(); else if (e.key === 'Escape') renderDiamondsDetailView(container, name, slug); });
        });
        furGrid.appendChild(furCard);
    });
}

function renderGreatsDetailView(container, animalName, slug) {
    container.innerHTML = '';
    const furGrid = document.createElement('div');
    furGrid.className = 'fur-grid greats-grid';
    container.appendChild(furGrid);

    const fursInfo = greatsFursData[slug];
    if (!fursInfo) { furGrid.innerHTML = '<p>Nenhuma pelagem de Great One para este animal.</p>'; return; }
    fursInfo.forEach(furName => {
        const trophies = savedData.greats?.[slug]?.furs?.[furName]?.trophies || [];
        const furCard = document.createElement('div');
        furCard.className = `fur-card trophy-frame ${trophies.length > 0 ? 'completed' : 'incomplete'}`;
        const furSlug = slugify(furName);
        furCard.innerHTML = `
            <img src="animais/pelagens/great_${slug}_${furSlug}.png" alt="${furName}" onerror="this.onerror=null; this.src='animais/${slug}.png';">
            <div class="info-plaque">
                <div class="info">${furName}</div>
                <div class="kill-counter"><i class="fas fa-trophy"></i> x${trophies.length}</div>
            </div>`;
        furCard.addEventListener('click', () => openGreatsTrophyModal(animalName, slug, furName));
        furGrid.appendChild(furCard);
    });
}

function openGreatsTrophyModal(animalName, slug, furName) {
    const modal = document.getElementById('form-modal');
    modal.innerHTML = ''; // Limpa o modal
    modal.className = 'modal-overlay form-modal'; // Adiciona classe para distinguir
    
    const modalContent = document.createElement('div');
    modalContent.className = 'modal-content-box';
    modal.appendChild(modalContent);
    
    modalContent.innerHTML = `<h3><i class="fas fa-trophy"></i> Troféus de: ${furName}</h3>`;
    const logList = document.createElement('ul');
    logList.className = 'trophy-log-list';
    const trophies = savedData.greats?.[slug]?.furs?.[furName]?.trophies || [];
    if(trophies.length === 0) { logList.innerHTML = '<li>Nenhum abate registrado.</li>'; }
    else {
        trophies.forEach((trophy, index) => {
            const li = document.createElement('li');
            li.innerHTML = `<span>Abate de ${new Date(trophy.date).toLocaleDateString()} (Grind: ${trophy.abates || 'N/A'})</span>`;
            const deleteBtn = document.createElement('button');
            deleteBtn.className = 'delete-trophy-btn'; deleteBtn.innerHTML = '&times;';
            deleteBtn.onclick = () => {
                if(confirm('Tem certeza que deseja remover este abate?')) {
                    trophies.splice(index, 1); saveData(savedData); closeModal('form-modal');
                    const detailContent = document.querySelector('.dossier-content') || document.querySelector('.main-content > .content-container');
                    if (detailContent) renderGreatsDetailView(detailContent, animalName, slug);
                }
            };
            li.appendChild(deleteBtn); logList.appendChild(li);
        });
    }
    modalContent.appendChild(logList);

    const form = document.createElement('div');
    form.className = 'add-trophy-form';
    form.innerHTML = `
        <h4>Registrar Novo Abate</h4>
        <table><tbody>
            <tr><td>Qtd. Abates na Grind:</td><td><input type="number" name="abates" placeholder="0"></td></tr>
            <tr><td>Qtd. Diamantes na Grind:</td><td><input type="number" name="diamantes" placeholder="0"></td></tr>
            <tr><td>Qtd. Peles Raras na Grind:</td><td><input type="number" name="pelesRaras" placeholder="0"></td></tr>
            <tr><td>Data do Abate:</td><td><input type="date" name="date" value="${new Date().toISOString().split('T')[0]}"></td></tr>
        </tbody></table>`;
    modalContent.appendChild(form);

    const buttonsDiv = document.createElement('div');
    buttonsDiv.className = 'modal-buttons';
    const cancelBtn = document.createElement('button');
    cancelBtn.className = 'back-button'; cancelBtn.textContent = 'Cancelar';
    cancelBtn.onclick = () => closeModal('form-modal');
    
    const saveBtn = document.createElement('button');
    saveBtn.className = 'back-button'; saveBtn.style.cssText = 'background-color: var(--primary-color); color: #111;';
    saveBtn.textContent = 'Salvar Troféu';
    saveBtn.onclick = () => {
        const newTrophy = {
            abates: form.querySelector('[name="abates"]').value,
            diamantes: form.querySelector('[name="diamantes"]').value,
            pelesRaras: form.querySelector('[name="pelesRaras"]').value,
            date: form.querySelector('[name="date"]').value || new Date().toISOString().split('T')[0]
        };
        if (!savedData.greats) savedData.greats = {};
        if (!savedData.greats[slug]) savedData.greats[slug] = {};
        if (!savedData.greats[slug].furs) savedData.greats[slug].furs = {};
        if (!savedData.greats[slug].furs[furName]) savedData.greats[slug].furs[furName] = { trophies: [] };
        savedData.greats[slug].furs[furName].trophies.push(newTrophy);
        checkAndSetGreatOneCompletion(slug, savedData.greats[slug]);
        saveData(savedData); closeModal('form-modal');
        const detailContent = document.querySelector('.dossier-content') || document.querySelector('.main-content > .content-container');
        if (detailContent) renderGreatsDetailView(detailContent, animalName, slug);
    };
    buttonsDiv.appendChild(cancelBtn); buttonsDiv.appendChild(saveBtn);
    modalContent.appendChild(buttonsDiv);
    
    modal.style.display = 'flex';
}

function updateCardAppearance(card, slug, tabKey) {
    if (!card) return;
    card.classList.remove('completed', 'inprogress', 'incomplete');
    let status = 'incomplete';

    if (tabKey === 'greats') {
        const animalData = savedData.greats?.[slug] || {};
        checkAndSetGreatOneCompletion(slug, animalData);
        if (animalData.completo) {
            status = 'completed';
        } else {
            const collectedFurs = animalData.furs ? Object.values(animalData.furs).filter(fur => fur.trophies?.length > 0).length : 0;
            if (collectedFurs > 0) {
                status = 'inprogress';
            }
        }
    } else if (tabKey === 'diamantes') {
        const diamondTrophies = savedData.diamantes?.[slug] || [];
        if (diamondTrophies.length > 0) {
            status = 'completed';
        }
    } else if (tabKey === 'super_raros') {
        const speciesFurs = rareFursData?.[slug];
        if (speciesFurs) {
            const allPossibleSuperRares = [];
            if (speciesFurs.macho) speciesFurs.macho.forEach(fur => allPossibleSuperRares.push(`Macho ${fur} Diamante`));
            if (diamondFursData?.[slug]?.femea?.length > 0) {
                speciesFurs.femea.forEach(fur => {
                    if (diamondFursData[slug].femea.includes(fur)) {
                         allPossibleSuperRares.push(`Fêmea ${fur} Diamante`);
                    }
                });
            }
            const collectedSuperRares = savedData.super_raros?.[slug] || {};
            if (allPossibleSuperRares.some(sr => collectedSuperRares[sr] === true)) {
                status = 'completed';
            }
        }
    } else if (tabKey === 'pelagens') {
        const pelagensData = savedData.pelagens?.[slug] || {};
        if (Object.values(pelagensData).some(v => v === true)) {
            status = 'completed';
        }
    }

    card.classList.add(status);
}


// --- LÓGICA DO PAINEL DE PROGRESSO ---

function renderProgressView(container) {
    container.innerHTML = '';
    
    const wrapper = document.createElement('div');
    wrapper.className = 'progress-view-container';
    wrapper.id = 'progress-panel-main-container';

    wrapper.appendChild(createLatestAchievementsPanel());

    const progressPanel = document.createElement('div');
    progressPanel.id = 'progress-panel';
    updateProgressPanel(progressPanel);
    wrapper.appendChild(progressPanel);

    const resetButton = document.createElement('button');
    resetButton.id = 'reset-progress-btn';
    resetButton.textContent = 'Resetar Todo o Progresso';
    resetButton.className = 'back-button';
    resetButton.style.cssText = 'background-color: #d9534f; border-color: #d43f3a; margin-top: 20px;';
    resetButton.onclick = () => {
        if (confirm('Tem certeza que deseja apagar TODO o seu progresso? Esta ação não pode ser desfeita.')) {
            localStorage.removeItem(saveDataKey);
            location.reload();
        }
    };
    container.appendChild(wrapper);
    container.appendChild(resetButton);
}


function createLatestAchievementsPanel() {
    const panel = document.createElement('div');
    panel.className = 'latest-achievements-panel';
    panel.innerHTML = '<h3><i class="fas fa-star"></i> Últimas Conquistas</h3>';
    
    const grid = document.createElement('div');
    grid.className = 'achievements-grid';

    const allTrophies = [];
    if(savedData.diamantes) {
        Object.entries(savedData.diamantes).forEach(([slug, trophies]) => {
            const animalName = items.find(i => slugify(i) === slug) || slug;
            trophies.forEach(trophy => allTrophies.push({ id: trophy.id, animalName, furName: trophy.type, slug, type: 'diamond' }));
        });
    }
    if(savedData.greats) {
        Object.entries(savedData.greats).forEach(([slug, greatOneData]) => {
            const animalName = items.find(i => slugify(i) === slug) || slug;
            if(greatOneData.furs) {
                Object.entries(greatOneData.furs).forEach(([furName, furData]) => {
                    (furData.trophies || []).forEach(trophy => allTrophies.push({ id: new Date(trophy.date).getTime(), animalName, furName, slug, type: 'greatone' }));
                });
            }
        });
    }

    if (allTrophies.length === 0) {
        grid.innerHTML = '<p style="color: var(--text-color-muted); grid-column: 1 / -1;">Nenhum troféu de destaque registrado ainda.</p>';
    } else {
        allTrophies.sort((a, b) => b.id - a.id).slice(0, 4).forEach(trophy => {
            const card = document.createElement('div');
            card.className = 'achievement-card';
            const rotation = Math.random() * 6 - 3; 
            card.style.transform = `rotate(${rotation}deg)`;
            card.addEventListener('mouseenter', () => card.style.zIndex = 10);
            card.addEventListener('mouseleave', () => card.style.zIndex = 1);

            const animalSlug = trophy.slug;
            let imagePathString;
            if (trophy.type === 'diamond') {
                const genderSlug = trophy.furName.toLowerCase().startsWith('macho') ? 'macho' : 'femea';
                const pureFurName = trophy.furName.replace(/^(macho|fêmea|diamante)\s/gi, '').trim();
                const furSlug = slugify(pureFurName);
                
                const specificPath = `animais/pelagens/${animalSlug}_${furSlug}_${genderSlug}.png`;
                const neutralPath = `animais/pelagens/${animalSlug}_${furSlug}.png`;
                const basePath = `animais/${animalSlug}.png`;
                imagePathString = `src="${specificPath}" onerror="this.onerror=null; this.src='${neutralPath}'; this.onerror=null; this.src='${basePath}'; this.onerror=null; this.src='animais/placeholder.png';"`;

            } else if (trophy.type === 'greatone') {
                const furSlug = slugify(trophy.furName);
                const specificPath = `animais/pelagens/great_${animalSlug}_${furSlug}.png`;
                const basePath = `animais/${animalSlug}.png`;
                imagePathString = `src="${specificPath}" onerror="this.onerror=null; this.src='${basePath}'; this.onerror=null; this.src='animais/placeholder.png';"`;
            
            } else { 
                 imagePathString = `src="animais/${animalSlug}.png" onerror="this.onerror=null;this.src='animais/placeholder.png';"`;
            }
            card.innerHTML = `<img ${imagePathString}>
                <div class="achievement-card-info">
                    <div class="animal-name">${trophy.animalName}</div>
                    <div class="fur-name">${trophy.furName.replace('Diamante','')}</div>
                </div>`;
            grid.appendChild(card);
        });
    }
    panel.appendChild(grid);
    return panel;
}

function updateProgressPanel(panel) {
    const currentData = loadData();
    const sections = {
        pelagens: { title: "Progresso de Pelagens Raras", data: rareFursData, saved: currentData.pelagens || {}, type: 'boolean' },
        super_raros: { title: "Progresso de Super Raros", data: rareFursData, saved: currentData.super_raros || {}, type: 'boolean_super' },
        diamantes: { title: "Progresso de Diamantes", data: diamondFursData, saved: currentData.diamantes || {}, type: 'array' },
        greats: { title: "Progresso de Great Ones", data: greatsFursData, saved: currentData.greats || {}, type: 'object' }
    };

    Object.keys(sections).forEach(key => {
        const sectionInfo = sections[key];
        let total = 0, collected = 0;
        if(sectionInfo.type === 'boolean') {
            Object.values(sectionInfo.data).forEach(s => { total += (s.macho?.length || 0) + (s.femea?.length || 0); });
            Object.values(sectionInfo.saved).forEach(s => { collected += Object.values(s).filter(c => c === true).length; });
        } else if (sectionInfo.type === 'boolean_super') {
             Object.entries(sectionInfo.data).forEach(([slug, s]) => { total += (s.macho?.length || 0); if (diamondFursData[slug]?.femea?.length > 0) total += (s.femea?.length || 0); });
            Object.values(sectionInfo.saved).forEach(s => { collected += Object.values(s).filter(c => c === true).length; });
        } else if(sectionInfo.type === 'array') {
             Object.values(sectionInfo.data).forEach(s => { total += (s.macho?.length || 0) + (s.femea?.length || 0); });
            Object.values(sectionInfo.saved).forEach(s => { collected += new Set(s.map(t => t.type)).size; });
        } else if (sectionInfo.type === 'object') {
            Object.values(sectionInfo.data).forEach(f => total += f.length);
            Object.values(sectionInfo.saved).forEach(s => { if(s.furs) collected += Object.values(s.furs).filter(f => f.trophies?.length > 0).length; });
        }
        const percentage = total > 0 ? (collected / total) * 100 : 0;
        let medalClass = '';
        if (percentage >= 75) medalClass = 'gold'; else if (percentage >= 50) medalClass = 'silver'; else if (percentage > 0) medalClass = 'bronze';
        const sectionEl = document.createElement('div');
        sectionEl.className = 'progress-section';
        sectionEl.innerHTML = `
            <div class="progress-header">
                <div class="progress-title-container"><i class="fas fa-medal progress-medal ${medalClass}"></i><h3>${sectionInfo.title}</h3></div>
                <div class="progress-label">${collected} / ${total}</div>
            </div>
            <div class="progress-bar-container"><div class="progress-bar-fill" style="width: ${percentage}%;"></div></div>`;
        sectionEl.addEventListener('click', () => toggleProgressDetail(sectionEl, key));
        panel.appendChild(sectionEl);
    });
}

function toggleProgressDetail(sectionEl, categoryKey) {
    const existingDetail = sectionEl.querySelector('.progress-detail-view');
    if (existingDetail) { existingDetail.remove(); return; }
    const detailView = document.createElement('div');
    detailView.className = 'progress-detail-view';
    renderProgressDetail(detailView, categoryKey);
    sectionEl.appendChild(detailView);
}

function renderProgressDetail(detailContainer, categoryKey) {
    const sourceData = categorias[categoryKey].items.map(slugify);
    const savedDataForCategory = savedData[categoryKey] || {};
    const progressByAnimal = {};
    sourceData.forEach(slug => {
        const animalName = items.find(i => slugify(i) === slug) || slug;
        let total = 0, collected = 0;
        switch(categoryKey) {
            case 'pelagens': if(!rareFursData[slug]) return; total = (rareFursData[slug].macho?.length || 0) + (rareFursData[slug].femea?.length || 0); collected = Object.values(savedDataForCategory[slug] || {}).filter(v => v === true).length; break;
            case 'diamantes': if(!diamondFursData[slug]) return; total = (diamondFursData[slug].macho?.length || 0) + (diamondFursData[slug].femea?.length || 0); collected = new Set((savedDataForCategory[slug] || []).map(t => t.type)).size; break;
            case 'greats': if(!greatsFursData[slug]) return; total = greatsFursData[slug].length; collected = Object.values(savedDataForCategory[slug]?.furs || {}).filter(f => f.trophies?.length > 0).length; break;
            case 'super_raros': if(!rareFursData[slug]) return; total = (rareFursData[slug].macho?.length || 0); if(diamondFursData[slug]?.femea?.length > 0) total += rareFursData[slug].femea?.length; collected = Object.values(savedDataForCategory[slug] || {}).filter(v => v === true).length; break;
        }
        if (total > 0 && collected > 0) progressByAnimal[animalName] = { collected, total };
    });
    if (Object.keys(progressByAnimal).length === 0) { detailContainer.innerHTML = `<div class="progress-detail-item"><span class="label">Nenhum progresso nesta categoria ainda.</span></div>`; return; }
    Object.entries(progressByAnimal).sort((a,b) => a[0].localeCompare(b[0])).forEach(([animalName, progress]) => {
        const itemEl = document.createElement('div');
        itemEl.className = 'progress-detail-item';
        itemEl.innerHTML = `<span class="label">${animalName}</span> <span class="value">${progress.collected} / ${progress.total}</span>`;
        detailContainer.appendChild(itemEl);
    });
}

// --- FUNÇÕES DE MODAL ---

function openImageViewer(imageUrl) {
    const modal = document.getElementById('image-viewer-modal');
    const modalImg = document.getElementById('modal-image');
    if (modal && modalImg) {
        modalImg.src = imageUrl;
        modal.style.display = "flex";
    }
}

function closeModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
        modal.style.display = "none";
    }
}

// --- FUNÇÕES DE MONTAGENS MÚLTIPLAS ---

function getCompleteTrophyInventory() {
    const inventory = [];

    // 1. Pelagens Raras
    if (savedData.pelagens) {
        for (const slug in savedData.pelagens) {
            for (const furName in savedData.pelagens[slug]) {
                if (savedData.pelagens[slug][furName] === true) {
                    const gender = furName.toLowerCase().startsWith('macho') ? 'macho' : 'femea';
                    const pureFur = furName.replace(/^(macho|fêmea)\s/i, '').trim();
                    inventory.push({ slug, gender, type: 'Pelagem Rara', detail: pureFur });
                }
            }
        }
    }
    // 2. Diamantes
    if (savedData.diamantes) {
        for (const slug in savedData.diamantes) {
            savedData.diamantes[slug].forEach(trophy => {
                const gender = trophy.type.toLowerCase().startsWith('macho') ? 'macho' : 'femea';
                inventory.push({ slug, gender, type: 'Diamante', detail: `Score ${trophy.score}` });
            });
        }
    }
    // 3. Super Raros
     if (savedData.super_raros) {
        for (const slug in savedData.super_raros) {
            for (const furName in savedData.super_raros[slug]) {
                if (savedData.super_raros[slug][furName] === true) {
                    const gender = furName.toLowerCase().startsWith('macho') ? 'macho' : 'femea';
                    const pureFur = furName.replace(/^(macho|fêmea)\s/i, '').replace('Diamante', '').trim();
                    inventory.push({ slug, gender, type: 'Super Raro', detail: pureFur });
                }
            }
        }
    }
    // 4. Great Ones
    if (savedData.greats) {
        for (const slug in savedData.greats) {
            if (savedData.greats[slug].furs) {
                for (const furName in savedData.greats[slug].furs) {
                    if (savedData.greats[slug].furs[furName].trophies?.length > 0) {
                        savedData.greats[slug].furs[furName].trophies.forEach(trophy => {
                             inventory.push({ slug, gender: 'macho', type: 'Great One', detail: furName });
                        });
                    }
                }
            }
        }
    }
    return inventory;
}

function checkMountRequirements(requiredAnimals) {
    const inventory = getCompleteTrophyInventory();
    const fulfilledRequirements = [];
    let isComplete = true;

    const availableInventory = [...inventory];

    for (const requirement of requiredAnimals) {
        let fulfilled = false;
        let fulfillingTrophy = null;

        const foundIndex = availableInventory.findIndex(trophy => 
            trophy.slug === requirement.slug && trophy.gender === requirement.gender
        );

        if (foundIndex !== -1) {
            fulfilled = true;
            fulfillingTrophy = availableInventory[foundIndex];
            availableInventory.splice(foundIndex, 1);
        } else {
            isComplete = false;
        }
        
        fulfilledRequirements.push({
            met: fulfilled,
            requirement: requirement,
            trophy: fulfillingTrophy
        });
    }

    return { isComplete, fulfilledRequirements };
}

function renderMultiMountsView(container) {
    container.innerHTML = '';
    const grid = document.createElement('div');
    grid.className = 'mounts-grid';
    container.appendChild(grid);

    const sortedMounts = Object.entries(multiMountsData).sort((a, b) => a[1].name.localeCompare(b[1].name));

    sortedMounts.forEach(([mountKey, mount]) => {
        const status = checkMountRequirements(mount.animals);
        const progressCount = status.fulfilledRequirements.filter(r => r.met).length;
        
        const card = document.createElement('div');
        card.className = `mount-card ${status.isComplete ? 'completed' : 'incomplete'}`;
        card.dataset.mountKey = mountKey;
        
        let animalsHTML = '<div class="mount-card-animals">';
        mount.animals.forEach(animal => {
            animalsHTML += `<img src="animais/${animal.slug}.png" title="${animal.slug}" onerror="this.style.display='none'">`;
        });
        animalsHTML += '</div>';

        card.innerHTML = `
            <div class="mount-card-header">
                <h3>${mount.name}</h3>
                <div class="mount-progress">${progressCount} / ${mount.animals.length}</div>
            </div>
            ${animalsHTML}
            ${status.isComplete ? '<div class="mount-completed-banner"><i class="fas fa-check"></i> Completo</div>' : ''}
        `;
        
        card.addEventListener('click', () => renderMultiMountDetailModal(mountKey));
        grid.appendChild(card);
    });
}

function renderMultiMountDetailModal(mountKey) {
    const mount = multiMountsData[mountKey];
    if (!mount) return;

    const status = checkMountRequirements(mount.animals);
    const modal = document.getElementById('form-modal');
    modal.innerHTML = '';
    modal.className = 'modal-overlay form-modal';

    const modalContent = document.createElement('div');
    modalContent.className = 'modal-content-box';
    modalContent.innerHTML = `<h3><i class="fas fa-trophy"></i> Detalhes: ${mount.name}</h3>`;

    const detailList = document.createElement('ul');
    detailList.className = 'mount-detail-list';

    status.fulfilledRequirements.forEach(fulfillment => {
        const req = fulfillment.requirement;
        const trophy = fulfillment.trophy;
        const animalName = items.find(item => slugify(item) === req.slug) || req.slug;
        const genderIcon = req.gender === 'macho' ? 'fa-mars' : 'fa-venus';
        
        const li = document.createElement('li');
        li.className = 'mount-detail-item';

        let bodyHTML = '';
        if (fulfillment.met) {
            bodyHTML = `<div class="detail-item-body"><i class="fas fa-check-circle"></i> Cumprido com: <strong>${trophy.type}</strong> (${trophy.detail})</div>`;
        } else {
            bodyHTML = `<div class="detail-item-body"><i class="fas fa-times-circle"></i> Pendente</div>`;
        }
        
        li.innerHTML = `
            <div class="detail-item-header">
                <i class="fas ${genderIcon}"></i>
                <span>${animalName}</span>
            </div>
            ${bodyHTML}
        `;
        detailList.appendChild(li);
    });

    modalContent.appendChild(detailList);
    
    const buttonsDiv = document.createElement('div');
    buttonsDiv.className = 'modal-buttons';
    const closeBtn = document.createElement('button');
    closeBtn.className = 'back-button';
    closeBtn.textContent = 'Fechar';
    closeBtn.onclick = () => closeModal('form-modal');
    buttonsDiv.appendChild(closeBtn);
    modalContent.appendChild(buttonsDiv);
    
    modal.appendChild(modalContent);
    modal.style.display = 'flex';
}

// --- FUNÇÕES CONTADOR DE GRIND ---

// NOVO: Renderiza o Hub de Grind com sessões existentes e botão de novo grind
function renderGrindHubView(container) {
    container.innerHTML = ''; // Limpa o container

    // Botão para iniciar novo grind
    const newGrindButton = document.createElement('div');
    newGrindButton.className = 'nav-card new-grind-btn';
    newGrindButton.innerHTML = `<i class="fas fa-plus-circle"></i><span>Iniciar Novo Grind</span>`;
    newGrindButton.onclick = () => renderNewGrindAnimalSelection(container);
    container.appendChild(newGrindButton);
    
    // Container para os cards de grinds existentes
    const existingGrindsTitle = document.createElement('h3');
    existingGrindsTitle.className = 'existing-grinds-title';
    existingGrindsTitle.innerHTML = '<i class="fas fa-history"></i> Grinds em Andamento';
    container.appendChild(existingGrindsTitle);

    const grid = document.createElement('div');
    grid.className = 'album-grid reserves-grid'; // Reutiliza estilo de grid
    container.appendChild(grid);

    if (savedData.grindSessions && savedData.grindSessions.length > 0) {
        savedData.grindSessions.forEach(session => {
            const reserve = reservesData[session.reserveKey];
            const animalName = items.find(item => slugify(item) === session.animalSlug);

            const card = document.createElement('div');
            card.className = 'reserve-card grind-session-card'; // Usa estilo de card de reserva
            card.innerHTML = `
                <div class="reserve-card-bg" style="background-image: url('${reserve.image}')"></div>
                <div class="reserve-card-overlay"></div>
                <div class="reserve-card-content">
                    <div class="grind-card-info">
                        <img src="animais/${session.animalSlug}.png" class="grind-card-animal-icon" onerror="this.style.display='none'">
                        <span class="grind-card-animal-name">${animalName}</span>
                    </div>
                    <img src="${reserve.image.replace('.png', '_logo.png')}" class="reserve-card-logo" alt="${reserve.name}" onerror="this.style.display='none'">
                    <div class="grind-card-total-kills">
                        <i class="fas fa-crosshairs"></i> ${session.counts.total || 0} Abates
                    </div>
                </div>
            `;
            card.addEventListener('click', () => renderGrindCounterView(session.id));
            grid.appendChild(card);
        });
    } else {
        grid.innerHTML = '<p class="no-grinds-message">Nenhum grind iniciado. Clique no botão acima para começar!</p>';
    }
}

// NOVO: Renomeado para maior clareza
function renderNewGrindAnimalSelection(container) {
    container.innerHTML = '<h2>Selecione um Animal para o Novo Grind</h2>';
    const albumGrid = document.createElement('div');
    albumGrid.className = 'album-grid';
    container.appendChild(albumGrid);

    items.sort((a, b) => a.localeCompare(b)).forEach(name => {
        const slug = slugify(name);
        const card = document.createElement('div');
        card.className = 'animal-card';
        card.innerHTML = `<img src="animais/${slug}.png" alt="${name}" onerror="this.onerror=null;this.src='animais/placeholder.png';"><div class="info">${name}</div>`;
        card.addEventListener('click', () => renderReserveSelectionForGrind(container, slug));
        albumGrid.appendChild(card);
    });
}

function renderReserveSelectionForGrind(container, animalSlug) {
    const animalName = items.find(item => slugify(item) === animalSlug);
    container.innerHTML = `<h2>Onde você vai grindar ${animalName}?</h2>`;
    
    const grid = document.createElement('div');
    grid.className = 'album-grid reserves-grid'; 
    container.appendChild(grid);

    const sortedReserves = Object.entries(reservesData).sort(([, a], [, b]) => a.name.localeCompare(b.name));

    for (const [reserveKey, reserve] of sortedReserves) {
        const card = document.createElement('div');
        card.className = 'reserve-card';
        card.innerHTML = `
            <div class="reserve-card-bg" style="background-image: url('${reserve.image}')"></div>
            <div class="reserve-card-overlay"></div>
            <div class="reserve-card-content">
                 <img src="${reserve.image.replace('.png', '_logo.png')}" class="reserve-card-logo" alt="${reserve.name}" onerror="this.style.display='none'">
            </div>
        `;
        card.addEventListener('click', () => {
            // Verifica se já existe um grind para essa combinação
            const existingSession = savedData.grindSessions.find(s => s.animalSlug === animalSlug && s.reserveKey === reserveKey);
            if(existingSession) {
                alert('Um grind para este animal nesta reserva já existe. Abrindo o grind existente.');
                renderGrindCounterView(existingSession.id);
                return;
            }

            // Cria uma nova sessão de grind
            const newSessionId = `grind_${Date.now()}`;
            const newSession = {
                id: newSessionId,
                animalSlug: animalSlug,
                reserveKey: reserveKey,
                counts: { total: 0, diamonds: 0, rares: 0, trolls: 0, super_rares: 0, great_ones: 0 }
            };
            
            savedData.grindSessions.push(newSession);
            saveData(savedData);
            renderGrindCounterView(newSessionId);
        });
        grid.appendChild(card);
    }
}

// MODIFICADO: Aceita sessionId para encontrar e renderizar o grind correto
function renderGrindCounterView(sessionId) {
    const session = savedData.grindSessions.find(s => s.id === sessionId);
    if (!session) {
        console.error("Sessão de grind não encontrada!", sessionId);
        renderMainView('grind');
        return;
    }

    const { animalSlug, reserveKey, counts } = session;
    const mainContent = document.querySelector('.main-content');
    const container = mainContent.querySelector('.content-container');
    const animalName = items.find(item => slugify(item) === animalSlug);
    const reserveName = reservesData[reserveKey].name;
    const animalClass = "N/A"; 

    mainContent.querySelector('.page-header h2').textContent = `Grind: ${animalName}`;
    const backButton = mainContent.querySelector('.page-header .back-button');
    backButton.innerHTML = `&larr; Voltar para o Hub de Grind`;
    backButton.onclick = () => renderMainView('grind');

    container.innerHTML = `
        <div class="grind-container">
            <div class="grind-header">
                <div class="grind-header-info">
                    <img src="animais/${animalSlug}.png" class="grind-animal-icon" onerror="this.style.display='none'">
                    <div>
                        <h2>${animalName.toUpperCase()}</h2>
                        <span><i class="fas fa-map-marked-alt"></i> Em ${reserveName}</span>
                    </div>
                </div>
            </div>

            <div class="counter-grid">
                <div class="counter-box" data-type="diamonds">
                    <div class="box-header"><i class="fas fa-gem diamond"></i> Diamonds</div>
                    <div class="box-content">
                        <span class="count-value">${counts.diamonds}</span>
                        <button class="add-btn"><i class="fas fa-plus"></i></button>
                    </div>
                </div>
                <div class="counter-box" data-type="rares">
                    <div class="box-header"><i class="fas fa-paw rare"></i> Raros</div>
                    <div class="box-content">
                        <span class="count-value">${counts.rares}</span>
                        <button class="add-btn"><i class="fas fa-plus"></i></button>
                    </div>
                </div>
                <div class="counter-box" data-type="trolls">
                    <div class="box-header"><i class="fas fa-star-half-alt troll"></i> Trolls</div>
                    <div class="box-content">
                        <span class="count-value">${counts.trolls}</span>
                        <button class="add-btn"><i class="fas fa-plus"></i></button>
                    </div>
                </div>
                <div class="counter-box" data-type="super_rares">
                    <div class="box-header"><i class="fas fa-star super-rare"></i> Super Raros</div>
                    <div class="box-content">
                        <span class="count-value">${counts.super_rares}</span>
                        <button class="add-btn"><i class="fas fa-plus"></i></button>
                    </div>
                </div>
                <div class="counter-box" data-type="great_ones">
                    <div class="box-header"><i class="fas fa-crown great-one"></i> Great One</div>
                    <div class="box-content">
                        <span class="count-value">${counts.great_ones}</span>
                        <button class="add-btn"><i class="fas fa-plus"></i></button>
                    </div>
                </div>
                <div class="counter-box wide total" data-type="total">
                    <div class="box-header"><i class="fas fa-crosshairs"></i> Total de Abates</div>
                    <div class="box-content">
                        <span class="count-value">${counts.total}</span>
                        <button class="add-btn"><i class="fas fa-plus"></i></button>
                    </div>
                </div>
            </div>
            <button id="delete-grind-btn" class="back-button">Excluir este Grind</button>
        </div>
    `;

    // Adiciona lógica aos botões de contagem
    container.querySelectorAll('.add-btn').forEach(button => {
        button.addEventListener('click', () => {
            const counterBox = button.closest('.counter-box');
            const type = counterBox.dataset.type;
            const valueSpan = counterBox.querySelector('.count-value');

            // Encontra a sessão novamente para garantir que estamos atualizando os dados mais recentes
            const currentSession = savedData.grindSessions.find(s => s.id === sessionId);
            if(currentSession) {
                currentSession.counts[type]++;
                if (type !== 'total') { // Incrementa o total automaticamente
                    currentSession.counts.total++;
                }
                valueSpan.textContent = currentSession.counts[type];
                // Atualiza o total na tela
                container.querySelector('.counter-box.total .count-value').textContent = currentSession.counts.total;
                saveData(savedData);
            }
        });
    });

    // Adiciona lógica ao botão de excluir
    container.querySelector('#delete-grind-btn').addEventListener('click', () => {
        if(confirm(`Tem certeza que deseja excluir o grind de ${animalName} em ${reserveName}? Esta ação não pode ser desfeita.`)) {
            const sessionIndex = savedData.grindSessions.findIndex(s => s.id === sessionId);
            if (sessionIndex > -1) {
                savedData.grindSessions.splice(sessionIndex, 1);
                saveData(savedData);
                renderMainView('grind');
            }
        }
    });
}

// --- INICIALIZAÇÃO E EVENTOS GERAIS ---

document.addEventListener('DOMContentLoaded', () => {
    appContainer = document.getElementById('app-container');
    renderNavigationHub();
    
    const imageModal = document.getElementById('image-viewer-modal');
    const formModal = document.getElementById('form-modal');

    [imageModal, formModal].forEach(modal => {
        if(modal) {
            const closeBtn = modal.querySelector('.modal-close');
            if (closeBtn) closeBtn.onclick = () => closeModal(modal.id);
            modal.addEventListener('click', e => {
                if (e.target === modal) closeModal(modal.id);
            });
        }
    });

    window.addEventListener('keydown', (event) => {
        if (event.key === 'Escape') {
            closeModal('image-viewer-modal');
            closeModal('form-modal');
        }
    });
});