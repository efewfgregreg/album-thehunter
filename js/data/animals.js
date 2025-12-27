export const animalsDB = {
"alce": {
        name: "Alce",
        slug: "alce",
        class: 8,
        maxLevel: 5,
        img: "animais/alce.png",
        
        // Extraído cruzando reservesData
        reserves: ["layton_lake", "medved_taiga", "yukon_valley", "revontuli_coast", "new_england_mountains", "askiy_ridge"],
        
        // Extraído de animalHotspotData (Layton Lake usado como base)
        stats: {
            maxScore: "274.99",
            maxWeight: "545-620 KG",
            drinkTime: "12:00 - 16:00",
        },

        furs: {
            rare: {
                macho: ["Albino", "Melânico", "Malhado", "Café", "Mosaico", "Acromelanístico"],
                femea: ["Albino", "Melânico", "Malhado", "Acromelanístico"]
            },
            diamond: {
                macho: ["Bronzeado", "Pardo", "Pardo Claro"],
                femea: []
            },
            // Extraído de greatsFursData
            greatOne: ["Dois Tons Lendário", "Cinza Lendário", "Bétula lendária", "Carvalho Lendário", "Salpicado Lendário", "Abeto lendário"]
        }
    },
       "antilocapra": {
        name: "Antilocapra",
        slug: "antilocapra",
        class: 3,
        maxLevel: 5,
        img: "animais/antilocapra.png",
        reserves: ["silver_ridge_peaks", "rancho_del_arroyo", "askiy_ridge"],
        stats: {
            maxScore: "108",
            maxWeight: "57-65 KG",
            drinkTime: "18:00 - 21:00"
        },
        furs: {
            rare: {
                macho: ["Albino", "Leucismo", "Melânico", "Malhado Variação 1", "Malhado Variação 2"],
                femea: ["Albino", "Malhado", "Leucismo", "Melânico"]
            },
            diamond: {
                macho: ["Bronzeado", "Escuro", "Pardo"],
                femea: []
            },
            greatOne: []
        }
    },

    "antílope_negro": {
        name: "Antílope Negro",
        slug: "antílope_negro",
        class: 3,
        maxLevel: 5,
        img: "animais/antílope_negro.png",
        reserves: ["vurhonga_savanna", "parque_fernando", "sundarpatan"],
        stats: {
            maxScore: "132.26",
            maxWeight: "44-51 KG",
            drinkTime: "18:00 - 21:00"
        },
        furs: {
            rare: {
                macho: ["Albino", "Melânico", "Malhado", "Leucismo"],
                femea: ["Albino", "Melânico", "Malhado", "Leucismo"]
            },
            diamond: {
                macho: ["Escuro", "Pardo Escuro", "Preto", "Bege"],
                femea: []
            },
            greatOne: []
        }
    },

    "bantengue": {
        name: "Bantengue",
        slug: "bantengue",
        class: 9,
        maxLevel: 5,
        img: "animais/bantengue.png",
        reserves: ["emerald_coast"],
        stats: {
            maxScore: "137",
            maxWeight: "747-800 KG",
            drinkTime: "17:00 - 20:00"
        },
        furs: {
            rare: {
                macho: ["Albino", "Melânico"],
                femea: ["Albino", "Melânico"]
            },
            diamond: {
                macho: ["Preto", "Café", "Pardo", "Pardo Escuro"],
                femea: []
            },
            greatOne: []
        }
    },

    "bisão_da_floresta": {
        name: "Bisão da Floresta",
        slug: "bisão_da_floresta",
        class: 9,
        maxLevel: 5,
        img: "animais/bisão_da_floresta.png",
        reserves: ["askiy_ridge"],
        stats: {
            maxScore: "158",
            maxWeight: "1112-1350 KG",
            drinkTime: "08:00 - 12:00"
        },
        furs: {
            rare: {
                macho: ["Albino", "Melânico", "Leucismo", "Malhado", "Pardo Escuro"],
                femea: ["Albino", "Melânico", "Leucismo", "Malhado", "Pardo Escuro"]
            },
            diamond: {
                macho: ["Pardo Escuro", "Ruivo", "Metade Ruivo", "Pardo Claro"],
                femea: []
            },
            greatOne: []
        }
    },

    "bisão_das_planícies": {
        name: "Bisão das Planícies",
        slug: "bisão_das_planícies",
        class: 9,
        maxLevel: 5,
        img: "animais/bisão_das_planícies.png",
        reserves: ["yukon_valley", "silver_ridge_peaks"],
        stats: {
            maxScore: "183.5",
            maxWeight: "987-1200 KG",
            drinkTime: "08:00 - 12:00"
        },
        furs: {
            rare: {
                macho: ["Albino", "Melânico", "Leucismo"],
                femea: ["Albino", "Melânico", "Leucismo"]
            },
            diamond: {
                macho: ["Escuro", "Cinza Claro", "Pardo", "Pardo Claro"],
                femea: []
            },
            greatOne: []
        }
    },

    "bisão_europeu": {
        name: "Bisão Europeu",
        slug: "bisão_europeu",
        class: 9,
        maxLevel: 5,
        img: "animais/bisão_europeu.png",
        reserves: ["hirschfelden"],
        stats: {
            maxScore: "127.62",
            maxWeight: "765-920 KG",
            drinkTime: "10:00 - 14:00"
        },
        furs: {
            rare: {
                macho: ["Albino", "Melânico", "Malhado"],
                femea: ["Albino", "Melânico", "Malhado"]
            },
            diamond: {
                macho: ["Pardo", "Pardo Claro", "Pardo Escuro"],
                femea: []
            },
            greatOne: []
        }
    },
    "búfalo_africano": {
        name: "Búfalo Africano",
        slug: "búfalo_africano",
        class: 9,
        maxLevel: 9,
        img: "animais/búfalo_africano.png",
        reserves: ["vurhonga_savanna"],
        stats: {
            maxScore: "151.35",
            maxWeight: "802-950 KG",
            drinkTime: "09:00 - 12:00"
        },
        furs: {
            rare: {
                macho: ["Albino", "Leucismo"],
                femea: ["Albino", "Leucismo"]
            },
            diamond: {
                macho: ["Cinzento", "Pardo", "Preto"],
                femea: []
            },
            greatOne: []
        }
    },

    "búfalo_dágua": {
        name: "Búfalo D'Água",
        slug: "búfalo_dágua",
        class: 9,
        maxLevel: 9,
        img: "animais/búfalo_dágua.png",
        reserves: ["parque_fernando", "sundarpatan"],
        stats: {
            maxScore: "167.54",
            maxWeight: "1067-1250 KG",
            drinkTime: "12:00 - 15:00"
        },
        furs: {
            rare: {
                macho: ["Albino", "Laranja"],
                femea: ["Albino", "Laranja"]
            },
            diamond: {
                macho: ["Cinzento", "Preto", "Laranja"],
                femea: []
            },
            greatOne: []
        }
    },

    "cabra_da_montanha": {
        name: "Cabra da Montanha",
        slug: "cabra_da_montanha",
        class: 4,
        maxLevel: 5,
        img: "animais/cabra_da_montanha.png",
        reserves: ["silver_ridge_peaks", "askiy_ridge"],
        stats: {
            maxScore: "107.67",
            maxWeight: "120-145 KG",
            drinkTime: "O DIA TODO"
        },
        furs: {
            rare: {
                macho: ["Albino", "Melânico"],
                femea: ["Albino", "Melânico"]
            },
            diamond: {
                macho: ["Bege", "Branco", "Cinza Claro", "Pardo Claro"],
                femea: []
            },
            greatOne: []
        }
    },

    "cabra_de_leque": {
        name: "Cabra de Leque",
        slug: "cabra_de_leque",
        class: 3,
        maxLevel: 5,
        img: "animais/cabra_de_leque.png",
        reserves: ["vurhonga_savanna"],
        stats: {
            maxScore: "78.55",
            maxWeight: "38-42 KG",
            drinkTime: "O DIA TODO"
        },
        furs: {
            rare: {
                macho: ["Albino"],
                femea: ["Albino"]
            },
            diamond: {
                macho: ["Bronzeado", "Laranja", "Pardo Escuro"],
                femea: []
            },
            greatOne: []
        }
    },

    "cabra_selvagem": {
        name: "Cabra Selvagem",
        slug: "cabra_selvagem",
        class: 3,
        maxLevel: 5,
        img: "animais/cabra_selvagem.png",
        reserves: ["te_awaroa", "emerald_coast", "torr_nan_sithean"],
        stats: {
            maxScore: "208.71",
            maxWeight: "43-50 KG",
            drinkTime: "15:00 - 18:00"
        },
        furs: {
            rare: {
                macho: ["Albino", "Preto", "Cores Mistas Variação 1", "Cores Mistas Variação 2"],
                femea: ["Albino", "Preto"]
            },
            diamond: {
                macho: ["Amarelado", "Branco", "Pardo e Branco", "Pardo Negro", "Preto e Branco", "Pardo"],
                femea: []
            },
            greatOne: []
        }
    },

    "caititu": {
        name: "Caititu",
        slug: "caititu",
        class: 3,
        maxLevel: 5,
        img: "animais/caititu.png",
        reserves: ["parque_fernando", "rancho_del_arroyo"],
        stats: {
            maxScore: "144.25",
            maxWeight: "26-31 KG",
            drinkTime: "00:00 - 03:00"
        },
        furs: {
            rare: {
                macho: ["Albino", "Melânico", "Ochre", "Leucismo"],
                femea: ["Albino", "Melânico", "Ochre", "Leucismo"]
            },
            diamond: {
                macho: ["Cinza Escuro", "Cinzento", "Pardo", "Pardo Escuro"],
                femea: []
            },
            greatOne: []
        }
    },

    "camurça": {
        name: "Camurça",
        slug: "camurça",
        class: 3,
        maxLevel: 5,
        img: "animais/camurça.png",
        reserves: ["te_awaroa"],
        stats: {
            maxScore: "58",
            maxWeight: "57-65 KG",
            drinkTime: "O DIA TODO"
        },
        furs: {
            rare: {
                macho: ["Albino", "Melânico", "Leucismo"],
                femea: ["Albino", "Melânico", "Leucismo"]
            },
            diamond: {
                macho: ["Cor de Mel", "Pardo", "Pardo e Cinza", "Pardo Escuro"],
                femea: []
            },
            greatOne: []
        }
    },

    "canguru_cinza_oriental": {
        name: "Canguru-Cinza Oriental",
        slug: "canguru_cinza_oriental",
        class: 4,
        maxLevel: 9,
        img: "animais/canguru_cinza_oriental.png",
        reserves: ["emerald_coast"],
        stats: {
            maxScore: "492",
            maxWeight: "53-66 KG",
            drinkTime: "00:00 - 03:00"
        },
        furs: {
            rare: {
                macho: ["Albino", "Melânico", "Leucismo Variação 1", "Leucismo Variação 2", "Leucismo Variação 3"],
                femea: ["Albino", "Melânico", "Leucismo Variação 1", "Leucismo Variação 2", "Leucismo Variação 3"]
            },
            diamond: {
                macho: ["Cinzento Variação 1", "Cinzento Variação 2", "Pardo e Cinza", "Pardo Variação 1", "Pardo Variação 2"],
                femea: []
            },
            greatOne: []
        }
    },

    "cão_guaxinim": {
        name: "Cão Guaxinim",
        slug: "cão_guaxinim",
        class: 2,
        maxLevel: 9,
        img: "animais/cão_guaxinim.png",
        reserves: ["revontuli_coast", "salzwiesen"],
        stats: {
            maxScore: "9.29",
            maxWeight: "8-10 kg",
            drinkTime: "10:00 - 13:00"
        },
        furs: {
            rare: {
                macho: ["Albino", "Laranja", "Pardo Escuro", "Malhado Variação 1", "Malhado Variação 2"],
                femea: ["Albino", "Laranja", "Pardo Escuro", "Malhado Variação 1", "Malhado Variação 2"]
            },
            diamond: {
                macho: ["Cinzento", "Pardo Claro", "Preto e Branco"],
                femea: []
            },
            greatOne: []
        }
    },
      "caribu": {
        name: "Caribu",
        slug: "caribu",
        class: 6,
        maxLevel: 5,
        img: "animais/caribu.png",
        reserves: ["yukon_valley"],
        stats: {
            maxScore: "430.23",
            maxWeight: "161-190KG",
            drinkTime: "04:00 - 08:00"
        },
        furs: {
            rare: {
                macho: ["Albino", "Melânico", "Leucismo", "Malhado"],
                femea: ["Albino", "Melânico", "Leucismo"]
            },
            diamond: {
                macho: ["Pardo Claro", "Pardo Escuro"],
                femea: []
            },
            greatOne: []
        }
    },

    "caribu_da_floresta_boreal": {
        name: "Caribu da Floresta Boreal",
        slug: "caribu_da_floresta_boreal",
        class: 6,
        maxLevel: 5,
        img: "animais/caribu_da_floresta_boreal.png",
        reserves: ["askiy_ridge"],
        stats: {
            maxScore: "430.23",
            maxWeight: "161-190 KG",
            drinkTime: "20:00 - 00:00"
        },
        furs: {
            rare: {
                macho: ["Albino", "Melânico", "Leucismo", "Malhado Variação 1", "Malhado Variação 2"],
                femea: ["Albino", "Melânico", "Leucismo", "Malhado Variação 1", "Malhado Variação 2"]
            },
            diamond: {
                macho: ["Pardo Escuro", "Pardo Claro"],
                femea: []
            },
            greatOne: []
        }
    },

    "carneiro_azul": {
        name: "Carneiro Azul",
        slug: "carneiro_azul",
        class: 4,
        maxLevel: 5,
        img: "animais/carneiro_azul.png",
        reserves: ["sundarpatan"],
        stats: {
            maxScore: "154.08",
            maxWeight: "65-75 KG",
            drinkTime: "14:00 - 17:00"
        },
        furs: {
            rare: {
                macho: ["Albino", "Melânico", "Leucismo"],
                femea: ["Albino", "Melânico", "Leucismo"]
            },
            diamond: {
                macho: ["Cinza Ardósia", "Pardo", "Cinza Azulado", "Amarelo"],
                femea: []
            },
            greatOne: []
        }
    },

    "carneiro_selvagem": {
        name: "Carneiro Selvagem",
        slug: "carneiro_selvagem",
        class: 5,
        maxLevel: 5,
        img: "animais/carneiro_selvagem.png",
        reserves: ["silver_ridge_peaks", "rancho_del_arroyo", "askiy_ridge"],
        stats: {
            maxScore: "196.93",
            maxWeight: "132-160 KG",
            drinkTime: "12:00 - 16:00"
        },
        furs: {
            rare: {
                macho: ["Albino", "Malhado Variação 1", "Malhado Variação 2", "Leucismo", "Melânico"],
                femea: ["Albino", "Malhado Variação 1", "Malhado Variação 2", "Leucismo", "Melânico"]
            },
            diamond: {
                macho: ["Preto", "Pardo", "Cinzento", "Bronze"],
                femea: []
            },
            greatOne: []
        }
    },

    "castor_norte_americano": {
        name: "Castor Norte-Americano",
        slug: "castor_norte_americano",
        class: 2,
        maxLevel: 5,
        img: "animais/castor_norte_americano.png",
        reserves: ["askiy_ridge"],
        stats: {
            maxScore: "30.40",
            maxWeight: "28-32 kg",
            drinkTime: "04:00-08:00, 08:00-12:00, 16:00-20:00"
        },
        furs: {
            rare: {
                macho: ["Albino", "Melânico", "Leucismo", "Malhado"],
                femea: ["Albino", "Melânico", "Leucismo", "Malhado"]
            },
            diamond: {
                macho: [],
                femea: ["Pardo Escuro", "Pardo Claro", "Marrom Avermelhado"]
            },
            greatOne: []
        }
    },

    "cervo_almiscarado": {
        name: "Cervo Almiscarado",
        slug: "cervo_almiscarado",
        class: 2,
        maxLevel: 3,
        img: "animais/cervo_almiscarado.png",
        reserves: ["medved_taiga"],
        stats: {
            maxScore: "249",
            maxWeight: "14-17 KG",
            drinkTime: "08:00 - 12:00"
        },
        furs: {
            rare: {
                macho: ["Albino", "Melânico", "Malhado"],
                femea: ["Albino", "Melânico", "Malhado"]
            },
            diamond: {
                macho: ["Pardo e Cinza", "Pardo Escuro"],
                femea: []
            },
            greatOne: []
        }
    },

    "cervo_canadense": {
        name: "Cervo Canadense",
        slug: "cervo_canadense",
        class: 7,
        maxLevel: 5,
        img: "animais/cervo_canadense.png",
        reserves: ["askiy_ridge"],
        stats: {
            maxScore: "457.56",
            maxWeight: "395-450 kg",
            drinkTime: "04:00 - 08:00"
        },
        furs: {
            rare: {
                macho: ["Albino", "Melânico", "Leucismo", "Malhado"],
                femea: ["Albino", "Melânico", "Leucismo", "Malhado"]
            },
            diamond: {
                macho: ["Juba Marrom", "Escuro", "Malhado"],
                femea: ["Malhado"]
            },
            greatOne: []
        }
    },

    "cervo_de_timor": {
        name: "Cervo de Timor",
        slug: "cervo_de_timor",
        class: 6,
        maxLevel: 5,
        img: "animais/cervo_de_timor.png",
        reserves: ["emerald_coast"],
        stats: {
            maxScore: "148.78",
            maxWeight: "145-172 KG",
            drinkTime: "20:00 - 00:00"
        },
        furs: {
            rare: {
                macho: ["Albino", "Leucismo", "Malhado Variação 1", "Malhado Variação 2"],
                femea: ["Leucismo"]
            },
            diamond: {
                macho: ["Dois Tons", "Pardo", "Pardo Claro", "Pardo e Branco"],
                femea: []
            },
            greatOne: []
        }
    },

    "cervo_do_pântano": {
        name: "Cervo do Pântano",
        slug: "cervo_do_pântano",
        class: 6,
        maxLevel: 5,
        img: "animais/cervo_do_pântano.png",
        reserves: ["sundarpatan"],
        stats: {
            maxScore: "226.05",
            maxWeight: "242-280 KG",
            drinkTime: "12:00 - 15:00"
        },
        furs: {
            rare: {
                macho: ["Albino", "Malhado", "Leucismo", "Melânico"],
                femea: ["Albino", "Malhado", "Leucismo", "Melânico"]
            },
            diamond: {
                macho: ["Pardo", "Pardo Claro", "Vermelho", "Pardo Escuro", "Vermelho Escuro"],
                femea: []
            },
            greatOne: []
        }
    },

    "cervo_porco_indiano": {
        name: "Cervo-porco Indiano",
        slug: "cervo_porco_indiano",
        class: 3,
        maxLevel: 5,
        img: "animais/cervo_porco_indiano.png",
        reserves: ["emerald_coast"],
        stats: {
            maxScore: "108.68",
            maxWeight: "43-50 KG",
            drinkTime: "13:00 - 17:00"
        },
        furs: {
            rare: {
                macho: ["Malhado", "Leucismo"],
                femea: ["Malhado", "Leucismo"]
            },
            diamond: {
                macho: ["Pardo", "Escuro e Pintado", "Pardo Escuro", "Pintado"],
                femea: []
            },
            greatOne: []
        }
    },

    "cervo_sika": {
        name: "Cervo Sika",
        slug: "cervo_sika",
        class: 4,
        maxLevel: 5,
        img: "animais/cervo_sika.png",
        reserves: ["te_awaroa", "torr_nan_sithean"],
        stats: {
            maxScore: "198.74",
            maxWeight: "62-75 KG",
            drinkTime: "10:00 - 13:00"
        },
        furs: {
            rare: {
                macho: ["Albino", "pintado vermelho"],
                femea: ["Albino", "pintado vermelho"]
            },
            diamond: {
                macho: ["Escuro e Pintado", "Pardo", "Pintado", "Preto"],
                femea: []
            },
            greatOne: []
        }
    },

    "chacal_listrado": {
        name: "Chacal Listrado",
        slug: "chacal_listrado",
        class: 2,
        maxLevel: 9,
        img: "animais/chacal_listrado.png",
        reserves: ["vurhonga_savanna"],
        stats: {
            maxScore: "29.10",
            maxWeight: "12-14 KG",
            drinkTime: "O DIA TODO"
        },
        furs: {
            rare: {
                macho: ["Albino", "Melânico"],
                femea: ["Albino", "Melânico"]
            },
            diamond: {
                macho: ["Pardo Claro", "Pardo Cinza", "Cinzento"],
                femea: []
            },
            greatOne: []
        }
    },

    "chital": {
        name: "Chital",
        slug: "chital",
        class: 3,
        maxLevel: 5,
        img: "animais/chital.png",
        reserves: ["parque_fernando", "emerald_coast"],
        stats: {
            maxScore: "217.29",
            maxWeight: "67-75 KG",
            drinkTime: "03:00 - 06:00"
        },
        furs: {
            rare: {
                macho: ["Albino", "Malhado", "Melânico"],
                femea: ["Albino", "Malhado", "Melânico"]
            },
            diamond: {
                macho: ["Pintado", "Escuro"],
                femea: []
            },
            greatOne: []
        }
    },

  "codorna_de_restolho": {
        name: "Codorna-de-restolho",
        slug: "codorna_de_restolho",
        class: 1,
        maxLevel: 3,
        img: "animais/codorna_de_restolho.png",
        reserves: ["emerald_coast"],
        stats: {
            maxScore: "238",
            maxWeight: "0.12-0.13 kg",
            drinkTime: "O DIA TODO"
        },
        furs: {
            rare: {
                macho: ["Albino", "Pardo Escuro"],
                femea: ["Albino"]
            },
            diamond: {
                macho: ["Pardo", "Pardo e Cinza", "Pardo Escuro"],
                femea: []
            },
            greatOne: []
        }
    },

    "codorniz_da_virgínia": {
        name: "Codorniz da Virgínia",
        slug: "codorniz_da_virgínia",
        class: 1,
        maxLevel: 3,
        img: "animais/codorniz_da_virgínia.png",
        reserves: ["mississippi_acres", "new_england_mountains"],
        stats: {
            maxScore: "238",
            maxWeight: "0 kg",
            drinkTime: "O DIA TODO"
        },
        furs: {
            rare: {
                macho: ["Albino"],
                femea: ["Albino"]
            },
            diamond: {
                macho: [],
                femea: ["Pardo"]
            },
            greatOne: []
        }
    },

    "coelho_da_flórida": {
        name: "Coelho da Flórida",
        slug: "coelho_da_flórida",
        class: 1,
        maxLevel: 3,
        img: "animais/coelho_da_flórida.png",
        reserves: ["mississippi_acres", "new_england_mountains"],
        stats: {
            maxScore: "1.97",
            maxWeight: "1-2 KG",
            drinkTime: "O DIA TODO"
        },
        furs: {
            rare: {
                macho: ["Albino", "Melânico", "Leucismo Variação 1", "Leucismo Variação 2"],
                femea: ["Albino", "Melânico", "Leucismo Variação 1", "Leucismo Variação 2"]
            },
            diamond: {
                macho: [],
                femea: ["Pardo", "Pardo Claro", "Cinzento", "Cinza Claro"]
            },
            greatOne: []
        }
    },

    "coelho_europeu": {
        name: "Coelho Europeu",
        slug: "coelho_europeu",
        class: 1,
        maxLevel: 3,
        img: "animais/coelho_europeu.png",
        reserves: ["hirschfelden", "te_awaroa", "salzwiesen"],
        stats: {
            maxScore: "2.42",
            maxWeight: "2 KG",
            drinkTime: "O DIA TODO"
        },
        furs: {
            rare: {
                macho: ["Albino", "Melânico", "Leucismo", "Cinza Claro"],
                femea: ["Albino", "Melânico", "Leucismo", "Cinza Claro"]
            },
            diamond: {
                macho: ["Bronzeado", "Pardo", "Pardo Claro", "Pardo Escuro"],
                femea: []
            },
            greatOne: []
        }
    },

    "coiote": {
        name: "Coiote",
        slug: "coiote",
        class: 2,
        maxLevel: 9,
        img: "animais/coiote.png",
        reserves: ["layton_lake", "rancho_del_arroyo", "new_england_mountains"],
        stats: {
            maxScore: "56.87",
            maxWeight: "24-27 KG",
            drinkTime: "00:00 - 04:00"
        },
        furs: {
            rare: {
                macho: ["Albino", "Melânico", "Malhado"],
                femea: ["Albino", "Melânico", "Malhado"]
            },
            diamond: {
                macho: ["Cinza Escuro", "Pardo e Cinza"],
                femea: []
            },
            greatOne: []
        }
    },

    "corça": {
        name: "Corça",
        slug: "corça",
        class: 3,
        maxLevel: 3,
        img: "animais/corça.png",
        reserves: ["hirschfelden", "cuatro_colinas", "torr_nan_sithean"],
        stats: {
            maxScore: "81.86",
            maxWeight: "29-35 KG",
            drinkTime: "14:00 - 17:00"
        },
        furs: {
            rare: {
                macho: ["Albino", "Melânico", "Malhado Variação 1", "Malhado Variação 2", "Leucismo"],
                femea: ["Albino", "Melânico", "Malhado", "Leucismo"]
            },
            diamond: {
                macho: ["Cinza Escuro", "Pardo", "Pardo Escuro"],
                femea: []
            },
            greatOne: []
        }
    },

    "crocodilo_de_água_salgada": {
        name: "Crocodilo de Água Salgada",
        slug: "crocodilo_de_água_salgada",
        class: 7,
        maxLevel: 9,
        img: "animais/crocodilo_de_água_salgada.png",
        reserves: ["emerald_coast"],
        stats: {
            maxScore: "1015",
            maxWeight: "856-1100 KG",
            drinkTime: "O DIA TODO"
        },
        furs: {
            rare: {
                macho: ["Albino", "Melânico", "Pardo Claro", "Malhado Variação 1", "Malhado Variação 2", "Leucismo"],
                femea: ["Albino", "Melânico", "Pardo Claro", "Malhado Variação 1", "Malhado Variação 2", "Leucismo"]
            },
            diamond: {
                macho: ["Cinzento", "Oliva", "Pardo Escuro"],
                femea: []
            },
            greatOne: []
        }
    },

    "cudo_menor": {
        name: "Cudo Menor",
        slug: "cudo_menor",
        class: 4,
        maxLevel: 5,
        img: "animais/cudo_menor.png",
        reserves: ["vurhonga_savanna"],
        stats: {
            maxScore: "151.64",
            maxWeight: "91-105 KG",
            drinkTime: "18:00 - 21:00"
        },
        furs: {
            rare: {
                macho: ["Albino", "Melânico"],
                femea: ["Albino", "Marrom Avermelhado", "Escuro"]
            },
            diamond: {
                macho: ["Cinzento"],
                femea: []
            },
            greatOne: []
        }
    },

   "faisão_de_pescoço_anelado": {
        name: "Faisão de Pescoço Anelado",
        slug: "faisão_de_pescoço_anelado",
        class: 1,
        maxLevel: 3,
        img: "animais/faisão_de_pescoço_anelado.png",
        reserves: ["hirschfelden", "cuatro_colinas", "rancho_del_arroyo", "new_england_mountains", "salzwiesen", "askiy_ridge", "torr_nan_sithean"],
        stats: {
            maxScore: "20.29",
            maxWeight: "2-3 KG",
            drinkTime: "O DIA TODO"
        },
        furs: {
            rare: {
                macho: ["Albino", "Melânico", "Leucismo"],
                femea: ["Albino", "Melânico", "Leucismo"]
            },
            diamond: {
                macho: ["Cinzento", "Muda", "Pardo", "Pardo e Branco"],
                femea: []
            },
            greatOne: ["Rubi Lendário", "Pérola Lendário", "Granada Lendário", "Safira Lendário", "Obsidiana Lendário", "Citrino Lendário", "Esmeralda Lendário", "Morganita Lendário"]
        }
    },

    "frisada": {
        name: "Frisada",
        slug: "frisada",
        class: 1,
        maxLevel: 3,
        img: "animais/frisada.png",
        reserves: ["salzwiesen"],
        stats: {
            maxScore: "1050",
            maxWeight: "0-1 KG",
            drinkTime: "O DIA TODO"
        },
        furs: {
            rare: {
                macho: ["Albino", "Melânico", "Leucismo"],
                femea: ["Albino", "Melânico", "Leucismo"]
            },
            diamond: {
                macho: ["Cinzento", "Plum. de Inverno"],
                femea: []
            },
            greatOne: []
        }
    },

    "galinha_montês": {
        name: "Galinha-Montês",
        slug: "galinha_montês",
        class: 1,
        maxLevel: 3,
        img: "animais/galinha_montês.png",
        reserves: ["revontuli_coast"],
        stats: {
            maxScore: "435",
            maxWeight: "0.41-0.45 KG",
            drinkTime: "O DIA TODO"
        },
        furs: {
            rare: {
                macho: ["Pálida", "Híbrido", "Escuro"],
                femea: ["Pálida", "Híbrido", "Escuro"]
            },
            diamond: {
                macho: ["Cinzento", "Escuro", "Pardo", "Pardo Claro"],
                femea: []
            },
            greatOne: []
        }
    },

    "galinhola_eurasiática": {
        name: "Galinhola Eurasiática",
        slug: "galinhola_eurasiática",
        class: 1,
        maxLevel: 3,
        img: "animais/galinhola_eurasiática.png",
        reserves: ["torr_nan_sithean"],
        stats: {
            maxScore: "41.03",
            maxWeight: "0-0.25 KG",
            drinkTime: "O DIA TODO"
        },
        furs: {
            rare: {
                macho: ["Albino", "Melânico", "Leucismo", "Pardo Escuro"],
                femea: ["Albino", "Melânico", "Leucismo", "Pardo Escuro"]
            },
            diamond: {
                macho: ["Pardo", "Cinza"],
                femea: ["Pardo", "Cinza"]
            },
            greatOne: []
        }
    },

    "galo_lira": {
        name: "Galo Lira",
        slug: "galo_lira",
        class: 1,
        maxLevel: 3,
        img: "animais/galo_lira.png",
        reserves: ["revontuli_coast", "salzwiesen", "torr_nan_sithean"],
        stats: {
            maxScore: "120",
            maxWeight: "0-1 kg",
            drinkTime: "O DIA TODO"
        },
        furs: {
            rare: {
                macho: ["Leucismo Variação 1", "Leucismo Variação 2", "Leucismo Variação 3", "Melânico Variação 1", "Melânico Variação 2"],
                femea: ["Laranja"]
            },
            diamond: {
                macho: ["Escuro"],
                femea: []
            },
            greatOne: []
        }
    },

    "gamo": {
        name: "Gamo",
        slug: "gamo",
        class: 4,
        maxLevel: 5,
        img: "animais/gamo.png",
        reserves: ["hirschfelden", "te_awaroa", "emerald_coast", "new_england_mountains", "torr_nan_sithean"],
        stats: {
            maxScore: "249.99",
            maxWeight: "82-100 KG",
            drinkTime: "10:00 - 13:00"
        },
        furs: {
            rare: {
                macho: ["Albino", "Melânico", "Malhado Variação 1", "Malhado Variação 2"],
                femea: ["Albino", "Melânico", "Malhado"]
            },
            diamond: {
                macho: ["Escuro", "Escuro e Pintado", "Pintado", "Branco", "Chocolate"],
                femea: []
            },
            greatOne: ["Café Lendário", "Pintado Lendário", "Dourado Lendário", "Misto Lendário", "Prata Lendário"]
        }
    },

    "ganso_bravo": {
        name: "Ganso Bravo",
        slug: "ganso_bravo",
        class: 1,
        maxLevel: 5,
        img: "animais/ganso_bravo.png",
        reserves: ["revontuli_coast", "sundarpatan", "salzwiesen"],
        stats: {
            maxScore: "3.85",
            maxWeight: "3-4 KG",
            drinkTime: "O DIA TODO"
        },
        furs: {
            rare: {
                macho: ["Híbrido", "Leucismo Variação 1", "Leucismo Variação 2", "Leucismo Variação 3", "Leucismo Variação 4", "Leucismo Variação 5"],
                femea: ["Híbrido", "Leucismo Variação 1", "Leucismo Variação 2", "Leucismo Variação 3", "Leucismo Variação 4", "Leucismo Variação 5"]
            },
            diamond: {
                macho: ["Pardo", "Cinzento"],
                femea: []
            },
            greatOne: []
        }
    },

    "ganso_campestre_da_tundra": {
        name: "Ganso Campestre da Tundra",
        slug: "ganso_campestre_da_tundra",
        class: 1,
        maxLevel: 5,
        img: "animais/ganso_campestre_da_tundra.png",
        reserves: ["revontuli_coast", "salzwiesen"],
        stats: {
            maxScore: "3.16",
            maxWeight: "2-3 kg",
            drinkTime: "O DIA TODO"
        },
        furs: {
            rare: {
                macho: ["Leucismo Variação 1", "Leucismo Variação 2", "Leucismo Variação 3"],
                femea: ["Leucismo Variação 1", "Leucismo Variação 2", "Leucismo Variação 3"]
            },
            diamond: {
                macho: ["Cinza Claro", "Cinza Escuro", "Pardo"],
                femea: []
            },
            greatOne: []
        }
    },

    "ganso_das_neves": {
        name: "Ganso das Neves",
        slug: "ganso_das_neves",
        class: 1,
        maxLevel: 5,
        img: "animais/ganso_das_neves.png",
        reserves: ["askiy_ridge"],
        stats: {
            maxScore: "3.85",
            maxWeight: "3-4 kg",
            drinkTime: "O DIA TODO"
        },
        furs: {
            rare: {
                macho: ["Albino", "Melânico", "Variação azul", "hibrido", "intermediario"],
                femea: ["Albino", "Melânico", "Variação azul", "hibrido", "intermediario"]
            },
            diamond: {
                macho: ["Variação Branca"],
                femea: []
            },
            greatOne: []
        }
    },

    "ganso_do_canadá": {
        name: "Ganso do Canadá",
        slug: "ganso_do_canadá",
        class: 1,
        maxLevel: 5,
        img: "animais/ganso_do_canadá.png",
        reserves: ["hirschfelden", "yukon_valley", "revontuli_coast", "askiy_ridge"],
        stats: {
            maxScore: "8.59",
            maxWeight: "8-9 KG",
            drinkTime: "O DIA TODO"
        },
        furs: {
            rare: {
                macho: ["Melânico", "Leucismo Cinza Claro", "Hibrido Branco", "Marrom Hibrido", "Albino"],
                femea: ["Marrom Hibrido", "Melânico", "Leucismo Cinza Claro", "Hibrido Branco", "Albino"]
            },
            diamond: {
                macho: ["Marrom Híbrido", "Pardo e Cinza"],
                femea: []
            },
            greatOne: []
        }
    },

    "ganso_pega": {
        name: "Ganso Pega",
        slug: "ganso_pega",
        class: 1,
        maxLevel: 5,
        img: "animais/ganso_pega.png",
        reserves: ["emerald_coast"],
        stats: {
            maxScore: "3.85",
            maxWeight: "2-3 KG",
            drinkTime: "O DIA TODO"
        },
        furs: {
            rare: {
                macho: ["Melânico", "Leucismo Variação 1", "Leucismo Variação 2", "Malhado Variação 1", "Malhado Variação 2"],
                femea: ["Melânico", "Leucismo Variação 1", "Leucismo Variação 2", "Malhado Variação 1", "Malhado Variação 2"]
            },
            diamond: {
                macho: ["Amarelo", "Bordô", "Laranja"],
                femea: []
            },
            greatOne: []
        }
    },

    "gnu_de_cauda_preta": {
        name: "Gnu de Cauda Preta",
        slug: "gnu_de_cauda_preta",
        class: 6,
        maxLevel: 5,
        img: "animais/gnu_de_cauda_preta.png",
        reserves: ["vurhonga_savanna"],
        stats: {
            maxScore: "37.69",
            maxWeight: "265-290 KG",
            drinkTime: "06:00 - 09:00"
        },
        furs: {
            rare: {
                macho: ["Albino"],
                femea: ["Albino", "Coroado"]
            },
            diamond: {
                macho: ["Cinzento", "Cinza Escuro", "Ouro"],
                femea: []
            },
            greatOne: []
        }
    },

    "guaxinim_comum": {
        name: "Guaxinim Comum",
        slug: "guaxinim_comum",
        class: 2,
        maxLevel: 5,
        img: "animais/guaxinim_comum.png",
        reserves: ["mississippi_acres", "new_england_mountains", "salzwiesen"],
        stats: {
            maxScore: "12",
            maxWeight: "10-13 KG",
            drinkTime: "00:00 - 06:00"
        },
        furs: {
            rare: {
                macho: ["Albino", "Melânico", "Loiro Malhado", "Cinza Malhado"],
                femea: ["Albino", "Melânico", "Loiro Malhado", "Cinza Malhado"]
            },
            diamond: {
                macho: ["Amarelado", "Cinzento", "Pardo"],
                femea: []
            },
            greatOne: []
        }
    },

  "iaque_selvagem": {
        name: "Iaque Selvagem",
        slug: "iaque_selvagem",
        class: 9,
        maxLevel: 9,
        img: "animais/iaque_selvagem.png",
        reserves: ["sundarpatan"],
        stats: {
            maxScore: "273.23",
            maxWeight: "1025-1200 KG",
            drinkTime: "08:00-12:00"
        },
        furs: {
            rare: {
                macho: ["Ouro", "Leucismo", "Albino Variação 1", "Albino Variação 2"],
                femea: ["Ouro", "Leucismo", "Albino Variação 1", "Albino Variação 2", "marrom profundo", "preto profundo"]
            },
            diamond: {
                macho: ["Pardo Escuro", "Vermelho Escuro", "Vermelho Escuro Lendário", "Preto Profundo", "Marrom Profundo"],
                femea: []
            },
            greatOne: []
        }
    },

    "ibex_de_beceite": {
        name: "Ibex de Beceite",
        slug: "ibex_de_beceite",
        class: 4,
        maxLevel: 5,
        img: "animais/ibex_de_beceite.png",
        reserves: ["cuatro_colinas"],
        stats: {
            maxScore: "191.63",
            maxWeight: "91-110 KG",
            drinkTime: "10:00-14:00"
        },
        furs: {
            rare: {
                macho: ["Cinzento", "Marrom Híbrido", "Laranja", "Pardo e Cinza"],
                femea: []
            },
            diamond: {
                macho: ["Cinzento", "Marrom Híbrido", "Laranja", "Pardo e Cinza"],
                femea: []
            },
            greatOne: []
        }
    },

    "ibex_de_gredos": {
        name: "Ibex de Gredos",
        slug: "ibex_de_gredos",
        class: 4,
        maxLevel: 5,
        img: "animais/ibex_de_gredos.png",
        reserves: ["cuatro_colinas"],
        stats: {
            maxScore: "100.17",
            maxWeight: "85-102 KG",
            drinkTime: "10:00-14:00"
        },
        furs: {
            rare: {
                macho: ["Albino", "Melânico"],
                femea: ["Albino", "Melânico"]
            },
            diamond: {
                macho: ["Pardo e Cinza", "Marrom Hibrido", "Cinza Claro", "Cinzento"],
                femea: []
            },
            greatOne: []
        }
    },

    "ibex_de_ronda": {
        name: "Ibex de Ronda",
        slug: "ibex_de_ronda",
        class: 4,
        maxLevel: 5,
        img: "animais/ibex_de_ronda.png",
        reserves: ["cuatro_colinas"],
        stats: {
            maxScore: "107.98",
            maxWeight: "61-70 KG",
            drinkTime: "10:00-14:00"
        },
        furs: {
            rare: {
                macho: ["Albino", "Melânico"],
                femea: ["Albino", "Melânico"]
            },
            diamond: {
                macho: ["Pardo", "Pardo e Cinza", "Marrom Hibrido", "Cinzento"],
                femea: []
            },
            greatOne: []
        }
    },

    "ibex_espanhol_do_sudeste": {
        name: "Ibex Espanhol do Sudeste",
        slug: "ibex_espanhol_do_sudeste",
        class: 4,
        maxLevel: 5,
        img: "animais/ibex_espanhol_do_sudeste.png",
        reserves: ["cuatro_colinas"],
        stats: {
            maxScore: "89.68",
            maxWeight: "74-87 KG",
            drinkTime: "10:00-14:00"
        },
        furs: {
            rare: {
                macho: ["Albino", "Melânico", "laranja", "Cinza Claro", "castanho acinzentado", "marrom hibrido"],
                femea: ["Albino", "Melânico"]
            },
            diamond: {
                macho: ["Pardo", "Marrom Hibrido", "Pardo Hibrido", "Castanho Acinzentado", "Cinza Claro", "Laranja"],
                femea: []
            },
            greatOne: []
        }
    },

    "jacaré_americano": {
        name: "Jacaré Americano",
        slug: "jacaré_americano",
        class: 7,
        maxLevel: 9,
        img: "animais/jacaré_americano.png",
        reserves: ["mississippi_acres"],
        stats: {
            maxScore: "492",
            maxWeight: "416-530 KG",
            drinkTime: "08:00 - 12:00, 12:00 - 16:00, 16:00 - 20:00"
        },
        furs: {
            rare: {
                macho: ["Albino", "Melânico", "Malhado Variação 1", "Malhado Variação 2"],
                femea: ["Albino", "Melânico", "Malhado Variação 1", "Malhado Variação 2"]
            },
            diamond: {
                macho: ["Pardo Escuro", "Oliva"],
                femea: []
            },
            greatOne: []
        }
    },

    "javali": {
        name: "Javali",
        slug: "javali",
        class: 5,
        maxLevel: 5,
        img: "animais/javali.png",
        reserves: ["hirschfelden", "medved_taiga", "cuatro_colinas", "torr_nan_sithean"],
        stats: {
            maxScore: "144.25",
            maxWeight: "186-240 KG",
            drinkTime: "00:00-03:00"
        },
        furs: {
            rare: {
                macho: ["Albino", "Melânico", "preto e dourado", "Cinza Roxo"],
                femea: ["Albino", "Melânico", "preto e dourado", "Cinza Roxo"]
            },
            diamond: {
                macho: ["Pardo Variação 1", "Pardo Variação 2", "Pardo Claro ", "Pardo Escuro"],
                femea: []
            },
            greatOne: ["Retalho Lendário", "Ardente Lendário", "Caramelo Lendário", "Queimado Lendário", "Malhado Lendário", "Pintado Lendário", "Cinzento Lendário", "Giz Lendário", "Carvão Lendário"]
        }
    },

    "javali_africano": {
        name: "Javali Africano",
        slug: "javali_africano",
        class: 4,
        maxLevel: 5,
        img: "animais/javali_africano.png",
        reserves: ["vurhonga_savanna"],
        stats: {
            maxScore: "58.19",
            maxWeight: "123-150 KG",
            drinkTime: "15:00-18:00"
        },
        furs: {
            rare: {
                macho: ["Albino"],
                femea: ["Albino", "Vermelho"]
            },
            diamond: {
                macho: ["Pardo Avermelhado", "Cinzento Escuro", "Escuro"],
                femea: []
            },
            greatOne: []
        }
    },

    "lagópode_branco": {
        name: "Lagópode-Branco",
        slug: "lagópode_branco",
        class: 1,
        maxLevel: 3,
        img: "animais/lagópode_branco.png",
        reserves: ["revontuli_coast"],
        stats: {
            maxScore: "709",
            maxWeight: "0.66-0.74 kg",
            drinkTime: "O DIA TODO"
        },
        furs: {
            rare: {
                macho: ["Branco", "Muda Variação 1", "Muda Variação 2"],
                femea: ["Branco", "Muda Variação 1", "Muda Variação 2", "mosqueado Variação 1", "mosqueado Variação 2"]
            },
            diamond: {
                macho: ["Muda Variação 1", "Muda Variação 2", "Bicolor"],
                femea: []
            },
            greatOne: []
        }
    },

    "lagópode_escocês": {
        name: "Lagópode-Escocês",
        slug: "lagópode_escocês",
        class: 1,
        maxLevel: 3,
        img: "animais/lagópode_escocês.png",
        reserves: ["revontuli_coast"],
        stats: {
            maxScore: "772",
            maxWeight: "0.72-0.81 kg",
            drinkTime: "O DIA TODO"
        },
        furs: {
            rare: {
                macho: ["Branco"],
                femea: ["Branco"]
            },
            diamond: {
                macho: ["Muda", "Bicolor"],
                femea: []
            },
            greatOne: []
        }
    },

    "lebre_antílope": {
        name: "Lebre-antílope",
        slug: "lebre_antílope",
        class: 1,
        maxLevel: 3,
        img: "animais/lebre_antílope.png",
        reserves: ["rancho_del_arroyo", "askiy_ridge"],
        stats: {
            maxScore: "6.33",
            maxWeight: "3-4 kg",
            drinkTime: "O DIA TODO"
        },
        furs: {
            rare: {
                macho: ["Albino", "Melânico"],
                femea: ["Albino", "Melânico"]
            },
            diamond: {
                macho: ["Mosqueado", "Cinzento", "Pardo Escuro", "Pardo"],
                femea: []
            },
            greatOne: []
        }
    },

    "lebre_da_cauda_branca": {
        name: "Lebre-da-cauda-branca",
        slug: "lebre_da_cauda_branca",
        class: 1,
        maxLevel: 3,
        img: "animais/lebre_da_cauda_branca.png",
        reserves: ["layton_lake"],
        stats: {
            maxScore: "6.33",
            maxWeight: "5-6 KG",
            drinkTime: "O DIA TODO"
        },
        furs: {
            rare: {
                macho: ["Albino"],
                femea: ["Albino"]
            },
            diamond: {
                macho: ["Bege", "Cinzento", "Pardo", "Pardo Claro"],
                femea: []
            },
            greatOne: []
        }
    },

    "lebre_da_eurásia": {
        name: "Lebre Da Eurásia",
        slug: "lebre_da_eurásia",
        class: 1,
        maxLevel: 3,
        img: "animais/lebre_da_eurásia.png",
        reserves: ["revontuli_coast", "torr_nan_sithean"],
        stats: {
            maxScore: "5.6",
            maxWeight: "5-6 kg",
            drinkTime: "O DIA TODO"
        },
        furs: {
            rare: {
                macho: ["Albino", "Branco", "Muda Variação 1", "Muda Variação 2", "Pardo Claro", "Pardo Escuro", "Cinza Claro", "Cinza Escuro"],
                femea: ["Albino", "Branco", "Muda Variação 1", "Muda Variação 2"]
            },
            diamond: {
                macho: ["Cinza Claro", "Cinza Escuro", "Pardo Claro", "Pardo Escuro"],
                femea: ["Cinza Claro", "Cinza Escuro", "Pardo Claro", "Pardo Escuro"]
            },
            greatOne: []
        }
    },

    "lebre_europeia": {
        name: "Lebre Europeia",
        slug: "lebre_europeia",
        class: 1,
        maxLevel: 3,
        img: "animais/lebre_europeia.png",
        reserves: ["cuatro_colinas"],
        stats: {
            maxScore: "6.5",
            maxWeight: "5-7 KG",
            drinkTime: "O DIA TODO"
        },
        furs: {
            rare: {
                macho: ["Albino", "Melânico"],
                femea: ["Albino", "Melânico"]
            },
            diamond: {
                macho: [],
                femea: ["Cinza", "Pardo", "Escuro", "Pardo Claro"]
            },
            greatOne: []
        }
    },

    "lebre_nuca_dourada": {
        name: "Lebre Nuca Dourada",
        slug: "lebre_nuca_dourada",
        class: 1,
        maxLevel: 3,
        img: "animais/lebre_nuca_dourada.png",
        reserves: ["vurhonga_savanna"],
        stats: {
            maxScore: "5.37",
            maxWeight: "4-5 KG",
            drinkTime: "O DIA TODO"
        },
        furs: {
            rare: {
                macho: ["Cinza Claro"],
                femea: ["Cinza Claro"]
            },
            diamond: {
                macho: [],
                femea: ["Castanho", "Pardo", "Cinzento"]
            },
            greatOne: []
        }
    },

    "lebre_peluda": {
        name: "Lebre Peluda",
        slug: "lebre_peluda",
        class: 1,
        maxLevel: 3,
        img: "animais/lebre_peluda.png",
        reserves: ["sundarpatan"],
        stats: {
            maxScore: "3.28",
            maxWeight: "2-3 KG",
            drinkTime: "O DIA TODO"
        },
        furs: {
            rare: {
                macho: ["Albino", "Branco"],
                femea: ["Albino", "Branco"]
            },
            diamond: {
                macho: ["Cinza Claro", "Pardo Claro", "Pardo Escuro", "Muda"],
                femea: ["Cinza Claro", "Pardo Claro", "Pardo Escuro", "Muda"]
            },
            greatOne: []
        }
    },

    "leão": {
        name: "Leão",
        slug: "leão",
        class: 9,
        maxLevel: 9,
        img: "animais/leão.png",
        reserves: ["vurhonga_savanna"],
        stats: {
            maxScore: "48.50",
            maxWeight: "236-270 KG",
            drinkTime: "12:00-15:00"
        },
        furs: {
            rare: {
                macho: ["Albino", "Amarelado", "Pardo Escuro"],
                femea: ["Albino", "Amarelado", "Pardo Escuro"]
            },
            diamond: {
                macho: ["Bronzeado", "Pardo Claro"],
                femea: []
            },
            greatOne: []
        }
    },

    "leopardo_das_neves": {
        name: "Leopardo das Neves",
        slug: "leopardo_das_neves",
        class: 4,
        maxLevel: 9,
        img: "animais/leopardo_das_neves.png",
        reserves: ["sundarpatan"],
        stats: {
            maxScore: "29",
            maxWeight: "63-75 KG",
            drinkTime: "O DIA TODO"
        },
        furs: {
            rare: {
                macho: ["Albino", "Melânico", "Leucismo"],
                femea: ["Albino", "Melânico", "Leucismo"]
            },
            diamond: {
                macho: ["Neve", "Caramelo"],
                femea: []
            },
            greatOne: []
        }
    },
    "lince_pardo": {
        name: "Lince Pardo",
        slug: "lince_pardo",
        class: 2,
        maxLevel: 9,
        img: "animais/lince_pardo.png",
    
        reserves: [ "new_england_mountains"],
        stats: {
            maxScore: "27.68",
            maxWeight: "3-18 KG",
            drinkTime: "03:00 - 06:00"
        },
        furs: {
            rare: {
                macho: ["Albino", "Melânico", "Azul"],
                femea: ["Albino", "Melânico", "Azul"]
            },
            diamond: {
                macho: ["Vermelho", "Cinza", "Pardo Claro", "Pardo"],
                femea: []
            },
            greatOne: []
        }
    },

    "lince_euroasiática": {
        name: "Lince Euroasiática",
        slug: "lince_euroasiática",
        class: 3,
        maxLevel: 9,
        img: "animais/lince_euroasiática.png",
        reserves: ["medved_taiga", "revontuli_coast"],
        stats: {
            maxScore: "27.68",
            maxWeight: "35-45 KG",
            drinkTime: "03:00-06:00"
        },
        furs: {
            rare: {
                macho: ["Albino", "Melânico", "Malhado"],
                femea: ["Albino", "Melânico", "Malhado"]
            },
            diamond: {
                macho: ["Cinzento", "Pardo Claro"],
                femea: []
            },
            greatOne: []
        }
    },

    "lince_pardo_do_mexico": {
        name: "Lince Pardo do México",
        slug: "lince_pardo_do_mexico", 
        class: 2,
        maxLevel: 9,
        img: "animais/lince_pardo_do_mexico.png",
        reserves: ["rancho_del_arroyo"],
        stats: {
            maxScore: "27.68",
            maxWeight: "35-45 KG",
            drinkTime: "03:00 - 06:00"
        },
        furs: {
            rare: {
                macho: ["Albino", "Melânico", "Azul"],
                femea: ["Albino", "Melânico", "Azul"]
            },
            diamond: {
                macho: ["Bronzeado", "Cinzento", "Pardo", "Vermelho"],
                femea: []
            },
            greatOne: []
        }
    },

    "lobo_cinzento": {
        name: "Lobo Cinzento",
        slug: "lobo_cinzento",
        class: 5,
        maxLevel: 9,
        img: "animais/lobo_cinzento.png",
        reserves: ["medved_taiga", "yukon_valley", "askiy_ridge"],
        stats: {
            maxScore: "39",
            maxWeight: "67-80 KG",
            drinkTime: "17:00-20:00"
        },
        furs: {
            rare: {
                macho: ["Albino", "Melânico", "Cinza Escuro", "Clara de Ovo", "Pardo Avermelhado", "Acromelanístico", "Carvão Melanístico"],
                femea: ["Albino", "Melânico", "Cinza Escuro", "Clara de Ovo", "Pardo Avermelhado", "Acromelanístico", "Carvão Melanístico"]
            },
            diamond: {
                macho: ["Cinzento"],
                femea: []
            },
            greatOne: ["Congelado Lendário", "Esqueleto Lendário", "Vento Cortante Lendário", "Corneta de Batalha Lendário", "Cicatriz Lendário", "Vanguarda Lendário", "Duas-Almas Lendário", "Amanhecer Lendário", "Oco Lendário"]
        }
    },

    "lobo_ibérico": {
        name: "Lobo Ibérico",
        slug: "lobo_ibérico",
        class: 5,
        maxLevel: 9,
        img: "animais/lobo_ibérico.png",
        reserves: ["cuatro_colinas"],
        stats: {
            maxScore: "39",
            maxWeight: "45-50 KG",
            drinkTime: "03:00-06:00"
        },
        furs: {
            rare: {
                macho: ["Albino", "Melânico", "Fantasma", "Ogro", "Sombra", "Inverno", "Oliva", "Prístino"],
                femea: ["Albino", "Melânico", "Inverno", "Oliva", "Prístino"]
            },
            diamond: {
                macho: ["Cinzento", "Pardo e Cinza"],
                femea: []
            },
            greatOne: []
        }
    },

  "marreca_arrebio": {
        name: "Marreca Arrebio",
        slug: "marreca_arrebio",
        class: 1,
        maxLevel: 3,
        img: "animais/marreca_arrebio.png",
        reserves: ["askiy_ridge"],
        stats: {
            maxScore: "1040",
            maxWeight: "0-1 kg",
            drinkTime: "O DIA TODO"
        },
        furs: {
            rare: {
                macho: ["Albino", "Melânico", "Malhado", "Leucismo", "Eritristico"],
                femea: ["Albino", "Melânico", "Leucismo", "Malhado", "Brilhante", "Eritristico"]
            },
            diamond: {
                macho: ["Eclipse", "Cinza"],
                femea: []
            },
            greatOne: []
        }
    },

    "marreca_carijó": {
        name: "Marreca Carijó",
        slug: "marreca_carijó",
        class: 1,
        maxLevel: 3,
        img: "animais/marreca_carijó.png",
        reserves: ["parque_fernando"],
        stats: {
            maxScore: "4.62",
            maxWeight: "0 KG",
            drinkTime: "O DIA TODO"
        },
        furs: {
            rare: {
                macho: ["Melânico"],
                femea: ["Bege"]
            },
            diamond: {
                macho: ["Canela", "Vermelho", "Malhado"],
                femea: []
            },
            greatOne: []
        }
    },

    "marrequinha_americana": {
        name: "Marrequinha Americana",
        slug: "marrequinha_americana",
        class: 1,
        maxLevel: 3,
        img: "animais/marrequinha_americana.png",
        reserves: ["mississippi_acres", "new_england_mountains"],
        stats: {
            maxScore: "480",
            maxWeight: "0 KG",
            drinkTime: "O DIA TODO"
        },
        furs: {
            rare: {
                macho: ["Albino", "Verde Claro", "Malhado Variação 1", "Malhado Variação 2", "Malhado Variação 3"],
                femea: ["Malhado Variação 1", "Malhado Variação 2"]
            },
            diamond: {
                macho: ["Verde Claro"],
                femea: []
            },
            greatOne: []
        }
    },

    "marrequinha_comum": {
        name: "Marrequinha Comum",
        slug: "marrequinha_comum",
        class: 1,
        maxLevel: 3,
        img: "animais/marrequinha_comum.png",
        reserves: ["revontuli_coast", "salzwiesen"],
        stats: {
            maxScore: "354",
            maxWeight: "0 KG",
            drinkTime: "O DIA TODO"
        },
        furs: {
            rare: {
                macho: ["Híbrido Azul", "Híbrido Verde", "Leucismo Variação 1", "Leucismo Variação 2"],
                femea: ["Leucismo"]
            },
            diamond: {
                macho: ["Verde Escuro", "Verde Claro"],
                femea: []
            },
            greatOne: []
        }
    },

    "marta_europeia": {
        name: "Marta Europeia",
        slug: "marta_europeia",
        class: 1,
        maxLevel: 5,
        img: "animais/marta_europeia.png",
        reserves: ["torr_nan_sithean"],
        stats: {
            maxScore: "208",
            maxWeight: "1-2.20 KG",
            drinkTime: "O DIA TODO"
        },
        furs: {
            rare: {
                macho: ["Albino", "Melânico", "Leucismo", "Castanho", "Malhado Variação 1", "Malhado Variação 2"],
                femea: ["Albino", "Melânico", "Leucismo", "Castanho", "Malhado Variação 1", "Malhado Variação 2"]
            },
            diamond: {
                macho: ["Pardo", "Pardo Claro", "Preto"],
                femea: []
            },
            greatOne: []
        }
    },

    "mouflão_ibérico": {
        name: "Mouflão Ibérico",
        slug: "mouflão_ibérico",
        class: 4,
        maxLevel: 5,
        img: "animais/mouflão_ibérico.png",
        reserves: ["cuatro_colinas"],
        stats: {
            maxScore: "179.56",
            maxWeight: "52-60 KG",
            drinkTime: "18:00-21:00"
        },
        furs: {
            rare: {
                macho: ["Albino", "Melânico", "Cinza"],
                femea: ["Albino", "Melânico", "Cinza"]
            },
            diamond: {
                macho: ["Pardo Claro", "Pardo"],
                femea: []
            },
            greatOne: []
        }
    },

    "muntíaco_vermelho_do_norte": {
        name: "Muntíaco Vermelho do Norte",
        slug: "muntíaco_vermelho_do_norte",
        class: 2,
        maxLevel: 5,
        img: "animais/muntíaco_vermelho_do_norte.png",
        reserves: ["sundarpatan"],
        stats: {
            maxScore: "35.24",
            maxWeight: "23-28 KG",
            drinkTime: "15:00-18:00"
        },
        furs: {
            rare: {
                macho: ["Albino", "Melânico", "Leucismo Variação 1", "Leucismo Variação 2"],
                femea: ["Albino", "Melânico", "Leucismo Variação 1", "Leucismo Variação 2"]
            },
            diamond: {
                macho: ["Vermelho Variação 1", "Vermelho Variação 2"],
                femea: []
            },
            greatOne: []
        }
    },

    "nilgó": {
        name: "Nilgó",
        slug: "nilgó",
        class: 6,
        maxLevel: 5,
        img: "animais/nilgó.png",
        reserves: ["sundarpatan"],
        stats: {
            maxScore: "94.89",
            maxWeight: "256-308 KG",
            drinkTime: "08:00-12:00"
        },
        furs: {
            rare: {
                macho: ["Malhado Variação 1", "Malhado Variação 2"],
                femea: ["Malhado Variação 1", "Malhado Variação 2"]
            },
            diamond: {
                macho: ["Azul", "Pardo Escuro"],
                femea: []
            },
            greatOne: []
        }
    },

    "onça_parda": {
        name: "Onça Parda",
        slug: "onça_parda",
        class: 5,
        maxLevel: 9,
        img: "animais/onça_parda.png",
        reserves: ["parque_fernando", "silver_ridge_peaks"],
        stats: {
            maxScore: "39",
            maxWeight: "86-105 KG",
            drinkTime: "00:00-03:00"
        },
        furs: {
            rare: {
                macho: ["Albino", "Melânico"],
                femea: ["Albino", "Melânico"]
            },
            diamond: {
                macho: ["Cinzento", "Vermelho Escuro", "Pardo Claro"],
                femea: []
            },
            greatOne: []
        }
    },

    "órix_do_cabo": {
        name: "Órix do Cabo",
        slug: "órix_do_cabo",
        class: 6,
        maxLevel: 5,
        img: "animais/órix_do_cabo.png",
        reserves: ["vurhonga_savanna"],
        stats: {
            maxScore: "337.59",
            maxWeight: "210-240 KG",
            drinkTime: "03:00-06:00"
        },
        furs: {
            rare: {
                macho: ["Bege", "Escuro", "Ouro"],
                femea: ["Bege", "Escuro", "Ouro"]
            },
            diamond: {
                macho: ["Cinzento", "Cinza Claro"],
                femea: ["Cinzento", "Cinza Claro"]
            },
            greatOne: []
        }
    },
  "pato_arlequim": {
        name: "Pato Arlequim",
        slug: "pato_arlequim",
        class: 1,
        maxLevel: 3,
        img: "animais/pato_arlequim.png",
        reserves: ["yukon_valley"],
        stats: {
            maxScore: "7.23",
            maxWeight: "0 KG",
            drinkTime: "O DIA TODO"
        },
        furs: {
            rare: {
                macho: ["Albino", "Melânico"],
                femea: ["Albino", "Cinza", "Escuro"]
            },
            diamond: {
                macho: ["Malhado", "Cinza Escuro"],
                femea: []
            },
            greatOne: []
        }
    },

    "pato_carolino": {
        name: "Pato Carolino",
        slug: "pato_carolino",
        class: 1,
        maxLevel: 3,
        img: "animais/pato_carolino.png",
        reserves: ["askiy_ridge"],
        stats: {
            maxScore: "670",
            maxWeight: "0 kg",
            drinkTime: "O DIA TODO"
        },
        furs: {
            rare: {
                macho: ["Albino", "Prata Diluída", "Dourado Eritrístico", "Leucísmo", "Melânico", "Malhado"],
                femea: ["Albino", "Prata Diluída", "Dourado Eritrístico", "Leucísmo", "Melânico", "Malhado"]
            },
            diamond: {
                macho: ["Escuro", "Padrão"],
                femea: []
            },
            greatOne: []
        }
    },

    "pato_olho_de_ouro": {
        name: "Pato Olho de Ouro",
        slug: "pato_olho_de_ouro",
        class: 1,
        maxLevel: 3,
        img: "animais/pato_olho_de_ouro.png",
        reserves: ["revontuli_coast", "new_england_mountains", "salzwiesen"],
        stats: {
            maxScore: "1230",
            maxWeight: "0-1 KG",
            drinkTime: "O DIA TODO"
        },
        furs: {
            rare: {
                macho: ["eclipse", "Leucismo Variação 1", "Leucismo Variação 2"],
                femea: ["Escuro", "Leucismo Variação 1", "Leucismo Variação 2"]
            },
            diamond: {
                macho: ["Preto"],
                femea: []
            },
            greatOne: []
        }
    },

    "pato_real": {
        name: "Pato Real",
        slug: "pato_real",
        class: 1,
        maxLevel: 3,
        img: "animais/pato_real.png",
        reserves: ["layton_lake", "revontuli_coast", "te_awaroa", "new_england_mountains", "askiy_ridge", "salzwiesen"],
        stats: {
            maxScore: "19.61",
            maxWeight: "1-2 KG",
            drinkTime: "O DIA TODO"
        },
        furs: {
            rare: {
                macho: ["Melânico", "Leucismo"],
                femea: ["Melânico", "amarelado"]
            },
            diamond: {
                macho: ["Pardo Negro", "Marrom Híbrido", "Malhado"],
                femea: []
            },
            greatOne: []
        }
    },

    "peru_merriami": {
        name: "Peru Merriami",
        slug: "peru_merriami",
        class: 1,
        maxLevel: 3,
        img: "animais/peru_merriami.png",
        reserves: ["layton_lake", "silver_ridge_peaks", "te_awaroa"],
        stats: {
            maxScore: "4.62",
            maxWeight: "9-11 KG",
            drinkTime: "O DIA TODO"
        },
        furs: {
            rare: {
                macho: ["Albino", "Melânico", "Leucismo"],
                femea: ["Albino", "Melânico", "Leucismo"]
            },
            diamond: {
                macho: ["Pardo", "Pardo Escuro", "Pardo Claro"],
                femea: []
            },
            greatOne: []
        }
    },

    "peru_selvagem": {
        name: "Peru Selvagem",
        slug: "peru_selvagem",
        class: 1,
        maxLevel: 3,
        img: "animais/peru_selvagem.png",
        reserves: ["mississippi_acres", "new_england_mountains"],
        stats: {
            maxScore: "4.6",
            maxWeight: "9-11 KG",
            drinkTime: "O DIA TODO"
        },
        furs: {
            rare: {
                macho: ["Albino", "Melânico", "Leucismo", "bronze"],
                femea: ["Albino", "Melânico", "Leucismo"]
            },
            diamond: {
                macho: ["Pardo Claro", "Bronze", "Pardo"],
                femea: []
            },
            greatOne: []
        }
    },

    "peru_selvagem_do_rio_grande": {
        name: "Peru Selvagem do Rio Grande",
        slug: "peru_selvagem_do_rio_grande",
        class: 1,
        maxLevel: 3,
        img: "animais/peru_selvagem_do_rio_grande.png",
        reserves: ["rancho_del_arroyo"],
        stats: {
            maxScore: "4.62",
            maxWeight: "9-11 KG",
            drinkTime: "O DIA TODO"
        },
        furs: {
            rare: {
                macho: ["Albino", "Melânico", "Leucismo"],
                femea: ["Albino", "Melânico", "Leucismo"]
            },
            diamond: {
                macho: ["Pardo", "Siena", "Siena Claro", "Pardo Claro"],
                femea: []
            },
            greatOne: []
        }
    },

    "piadeira": {
        name: "Piadeira",
        slug: "piadeira",
        class: 1,
        maxLevel: 3,
        img: "animais/piadeira.png",
        reserves: ["vurhonga_savanna", "revontuli_coast", "torr_nan_sithean", "salzwiesen"],
        stats: {
            maxScore: "905",
            maxWeight: "0 KG",
            drinkTime: "O DIA TODO"
        },
        furs: {
            rare: {
                macho: ["Híbrido", "Eclipse", "Leucismo Variação 1", "Leucismo Variação 2"],
                femea: ["Leucismo Variação 1", "Leucismo Variação 2"]
            },
            diamond: {
                macho: ["Pardo", "Cinzento"],
                femea: []
            },
            greatOne: []
        }
    },

    "porco_selvagem": {
        name: "Porco Selvagem",
        slug: "porco_selvagem",
        class: 5,
        maxLevel: 5,
        img: "animais/porco_selvagem.png",
        reserves: ["te_awaroa", "emerald_coast", "mississippi_acres"],
        stats: {
            maxScore: "144.25",
            maxWeight: "161-205 KG",
            drinkTime: "03:00-06:00"
        },
        furs: {
            rare: {
                macho: ["Albino", "Rosa"],
                femea: ["Rosa"]
            },
            diamond: {
                macho: ["Preto", "Preto e Dourado", "Manchas Pretas Variação 1", "Manchas Pretas Variação 2", "Hibrido Marrom Variação 1", "Hibrido Marrom Variação 2", "Marrom Escuro Variação 1", "Marrom Escuro Variação 2"],
                femea: []
            },
            greatOne: []
        }
    },

    "raposa_cinzenta": {
        name: "Raposa Cinzenta",
        slug: "raposa_cinzenta",
        class: 2,
        maxLevel: 9,
        img: "animais/raposa_cinzenta.png",
        reserves: ["mississippi_acres", "new_england_mountains"],
        stats: {
            maxScore: "6.43",
            maxWeight: "5-6 KG",
            drinkTime: "17:00 - 20:00"
        },
        furs: {
            rare: {
                macho: ["Albino", "Melânico", "Leucismo", "Malhado Variação 1", "Malhado Variação 2"],
                femea: ["Albino", "Melânico", "Leucismo", "Malhado Variação 1", "Malhado Variação 2"]
            },
            diamond: {
                macho: ["Vermelho", "Dois Tons", "Cinzento"],
                femea: ["Vermelho", "Dois Tons", "Cinzento"]
            },
            greatOne: []
        }
    },

    "raposa_tibetana": {
        name: "Raposa Tibetana",
        slug: "raposa_tibetana",
        class: 2,
        maxLevel: 9,
        img: "animais/raposa_tibetana.png",
        reserves: ["sundarpatan"],
        stats: {
            maxScore: "6.37",
            maxWeight: "5-6 kg",
            drinkTime: "17:00-20:00"
        },
        furs: {
            rare: {
                macho: ["Albino", "Melânico", "Areia", "Esfumaçado", "Leucismo"],
                femea: ["Albino", "Melânico", "Areia", "Esfumaçado", "Leucismo"]
            },
            diamond: {
                macho: ["Vermelho", "Pardo", "Laranja", "Cinzento"],
                femea: []
            },
            greatOne: []
        }
    },

    "raposa_vermelha": {
        name: "Raposa Vermelha",
        slug: "raposa_vermelha",
        class: 2,
        maxLevel: 9,
        img: "animais/raposa_vermelha.png",
        reserves: ["hirschfelden", "yukon_valley", "new_england_mountains", "emerald_coast", "salzwiesen", "torr_nan_sithean"],
        stats: {
            maxScore: "14.05",
            maxWeight: "12-15 KG",
            drinkTime: "17:00-20:00"
        },
        furs: {
            rare: {
                macho: ["Albino", "Melânico", "Malhado"],
                femea: ["Albino", "Melânico", "Malhado"]
            },
            diamond: {
                macho: ["Vermelho", "Vermelho Escuro", "Laranja"],
                femea: []
            },
            greatOne: ["Lua de Sangue Lendária", "Bengala Doce Lendária", "Flor de Cerejeira Lendária", "Alcaçuz lendário", "Papoula da Meia Noite Lendária", "Floco de Neve Mística Lendária", "Hortelã-Pimenta Lendária", "Gelo Botão de Rosa Lendária", "Beladona Escarlate Lendária"]
        }
    },

    "rena_da_montanha": {
        name: "Rena da Montanha",
        slug: "rena_da_montanha",
        class: 6,
        maxLevel: 5,
        img: "animais/rena_da_montanha.png",
        reserves: ["medved_taiga"],
        stats: {
            maxScore: "430.23",
            maxWeight: "156-182 KG",
            drinkTime: "04:00 - 08:00"
        },
        furs: {
            rare: {
                macho: ["Albino", "Melânico", "Malhado", "Leucismo"],
                femea: ["Albino", "Melânico", "Malhado", "Leucismo"]
            },
            diamond: {
                macho: ["Pardo Escuro", "Pardo Claro"],
                femea: []
            },
            greatOne: []
        }
    },
     "sambar": {
        name: "Sambar",
        slug: "sambar",
        class: 6,
        maxLevel: 5,
        img: "animais/sambar.png",
        reserves: ["emerald_coast"],
        stats: {
            maxScore: "199.37",
            maxWeight: "310-340 KG",
            drinkTime: "18:00 - 21:00"
        },
        furs: {
            rare: {
                macho: ["Albino", "Melânico", "Leucismo"],
                femea: ["Albino", "Melânico", "Leucismo"]
            },
            diamond: {
                macho: ["Escuro", "Pardo Escuro", "Pardo e Cinza"],
                femea: []
            },
            greatOne: []
        }
    },

    "texugo_americano": {
        name: "Texugo Americano",
        slug: "texugo_americano",
        class: 2,
        maxLevel: 5,
        img: "animais/texugo_americano.png",
        reserves: ["silver_ridge_peaks"],
        stats: {
            maxScore: "26.8",
            maxWeight: "11-14 KG",
            drinkTime: "00:00 - 04:00"
        },
        furs: {
            rare: {
                macho: ["Albino", "Melânico", "Amarelo"],
                femea: ["Albino", "Melânico", "Amarelo"]
            },
            diamond: {
                macho: ["Pardo Claro", "Pardo", "Escuro"],
                femea: []
            },
            greatOne: []
        }
    },

    "tigre_de_bengala": {
        name: "Tigre de Bengala",
        slug: "tigre_de_bengala",
        class: 9,
        maxLevel: 9,
        img: "animais/tigre_de_bengala.png",
        reserves: ["sundarpatan"],
        stats: {
            maxScore: "63",
            maxWeight: "220-275 KG",
            drinkTime: "04:00 - 07:00"
        },
        furs: {
            rare: {
                macho: ["Albino", "Melânico", "Pseudo-Melânico"],
                femea: ["Albino", "Melânico", "Pseudo-Melânico"]
            },
            diamond: {
                macho: ["Laranja", "Pardo Claro"],
                femea: []
            },
            greatOne: []
        }
    },

    "urso_negro": {
        name: "Urso Negro",
        slug: "urso_negro",
        class: 7,
        maxLevel: 9,
        img: "animais/urso_negro.png",
        reserves: ["layton_lake", "silver_ridge_peaks", "mississippi_acres"],
        stats: {
            maxScore: "22.8",
            maxWeight: "228-290 KG",
            drinkTime: "16:00 - 20:00"
        },
        furs: {
            rare: {
                macho: ["Albino", "Canela", "Glaciar"],
                femea: ["Albino", "Canela", "Glaciar"]
            },
            diamond: {
                macho: ["Preto", "Pardo", "Pardo Escuro", "Loiro"],
                femea: []
            },
            greatOne: ["Creme Lendário", "Malhado Lendário", "Espirito Lendário", "Castanha Lendária", "Duas-Almas Lendária", "Oco Lendário"]
        }
    },

    "urso_pardo": {
        name: "Urso Pardo",
        slug: "urso_pardo",
        class: 7,
        maxLevel: 9,
        img: "animais/urso_pardo.png",
        reserves: ["medved_taiga", "yukon_valley"],
        stats: {
            maxScore: "27.6",
            maxWeight: "444-650 KG",
            drinkTime: "04:00 - 08:00"
        },
        furs: {
            rare: {
                macho: ["Albino", "Melânico"],
                femea: ["Albino", "Melânico"]
            },
            diamond: {
                macho: ["Vermelho e Marrom", "Loiro", "Canela", "Ouro", "Pardo Escuro", "Pardo Claro", "Cinzento", "Avermelhado"],
                femea: []
            },
            greatOne: ["Feldspato Lendário", "Glaciar Lendário", "Mogno Lendário", "Aveia Lendária", "Espírito Lendário", "Cártamo Lendário"]
        }
    },

    "veado_mula": {
        name: "Veado Mula",
        slug: "veado_mula",
        class: 6,
        maxLevel: 5,
        img: "animais/veado_mula.png",
        reserves: ["layton_lake", "parque_fernando", "silver_ridge_peaks", "rancho_del_arroyo", "askiy_ridge"],
        stats: {
            maxScore: "312.38",
            maxWeight: "185-210 KG",
            drinkTime: "15:00 - 18:00"
        },
        furs: {
            rare: {
                macho: ["Albino", "Melânico", "Malhado"],
                femea: ["Albino", "Melânico", "Malhado"]
            },
            diamond: {
                macho: ["Cinzento", "Loiro", "Pardo"],
                femea: []
            },
            greatOne: []
        }
    },

    "veado_vermelho": {
        name: "Veado Vermelho",
        slug: "veado_vermelho",
        class: 6,
        maxLevel: 9,
        img: "animais/veado_vermelho.png",
        reserves: ["hirschfelden", "parque_fernando", "cuatro_colinas", "te_awaroa", "emerald_coast"],
        stats: {
            maxScore: "251.07",
            maxWeight: "210-240 KG",
            drinkTime: "06:00 - 09:00"
        },
        furs: {
            rare: {
                macho: ["Albino", "Melânico", "Malhado"],
                femea: ["Albino", "Melânico", "Malhado"]
            },
            diamond: {
                macho: ["Pardo Escuro", "Cinzento", "Pardo Claro"],
                femea: []
            },
            greatOne: ["Bétula Lendária", "Carvalho Lendário", "Abeto Lendário", "Cinza Lendário", "Salgueiro Lendário"]
        }
    },

    "zarro_castanho": {
        name: "Zarro Castanho",
        slug: "zarro_castanho",
        class: 1,
        maxLevel: 3,
        img: "animais/zarro_castanho.png",
        reserves: ["revontuli_coast"],
        stats: {
            maxScore: "732",
            maxWeight: "0.65-0.70 KG",
            drinkTime: "O DIA TODO"
        },
        furs: {
            rare: {
                macho: ["Albino", "Leucismo", "Melânico"],
                femea: ["Albino", "Leucismo", "Melânico"]
            },
            diamond: {
                macho: ["Vermelho Escuro", "Vermelho Claro"],
                femea: []
            },
            greatOne: []
        }
    },

    "zarro_negrinha": {
        name: "Zarro Negrinha",
        slug: "zarro_negrinha",
        class: 1,
        maxLevel: 3,
        img: "animais/zarro_negrinha.png",
        reserves: ["revontuli_coast", "salzwiesen"],
        stats: {
            maxScore: "964",
            maxWeight: "0.80-0.90 KG",
            drinkTime: "O DIA TODO"
        },
        furs: {
            rare: {
                macho: ["Albino", "Leucismo", "Melânico"],
                femea: ["Albino", "Leucismo", "Melânico"]
            },
            diamond: {
                macho: ["Cinzento", "Preto"],
                femea: []
            },
            greatOne: []
        }
    },

 "tahr": {
        name: "Tahr",
        slug: "tahr",
        class: 4,
        maxLevel: 5,
        img: "animais/tahr.png",
        reserves: ["te_awaroa", "sundarpatan"],
        stats: {
            maxScore: "101.87",
            maxWeight: "117-140 KG",
            drinkTime: "04:00-07:00, 07:00-11:00, 14:00-17:00, 17:00-20:00"
        },
        furs: {
            rare: {
                macho: ["Albino", "Branco", "Vermelho", "Preto", "Vermelho Escuro", "Pardo Escuro"],
                femea: ["Albino", "Branco", "Vermelho"]
            },
            diamond: {
                macho: ["Pardo Claro", "Palha", "Pardo Avermelhado"],
                femea: []
            },
            greatOne: ["Dourado Lendário", "Cicatrizes Lendárias", "Cinza Lendário", "Café com Leite Lendário", "Crânio Lendário", "Metade Lendária", "Neve Lendário"]
        }
    },

    "tetraz_azul": {
        name: "Tetraz Azul",
        slug: "tetraz_azul",
        class: 1,
        maxLevel: 3,
        img: "animais/tetraz_azul.png",
        reserves: ["askiy_ridge"],
        stats: {
            maxScore: "151",
            maxWeight: "1.38-1.60 kg",
            drinkTime: "O DIA TODO"
        },
        furs: {
            rare: {
                macho: ["Albino", "Melânico", "Leucismo"],
                femea: ["Albino", "Melânico", "Leucismo"]
            },
            diamond: {
                macho: ["Pardo", "Muda", "Cinza Ardósia"],
                femea: []
            },
            greatOne: []
        }
    },

    "tetraz_grande": {
        name: "Tetraz Grande",
        slug: "tetraz_grande",
        class: 1,
        maxLevel: 3,
        img: "animais/tetraz_grande.png",
        reserves: ["medved_taiga", "revontuli_coast", "torr_nan_sithean"],
        stats: {
            maxScore: "4.64",
            maxWeight: "4-5 KG",
            drinkTime: "O DIA TODO"
        },
        furs: {
            rare: {
                macho: ["Pálido", "Leucismo"],
                femea: ["Leucismo"]
            },
            diamond: {
                macho: ["Escuro"],
                femea: []
            },
            greatOne: []
        }
    },

    "tetraz_vermelho": {
        name: "Tetraz Vermelho",
        slug: "tetraz_vermelho",
        class: 1,
        maxLevel: 3,
        img: "animais/tetraz_vermelho.png",
        reserves: ["torr_nan_sithean"],
        stats: {
            maxScore: "72.75",
            maxWeight: "0-0.64 KG",
            drinkTime: "O DIA TODO"
        },
        furs: {
            rare: {
                macho: ["Albino", "Melânico"],
                femea: ["Leucismo", "Malhado"]
            },
            diamond: {
                macho: ["Vermelho", "Vermelho Escuro"],
                femea: []
            },
            greatOne: []
        }
    },

    "texugo_europeu": {
        name: "Texugo Europeu",
        slug: "texugo_europeu",
        class: 1,
        maxLevel: 5,
        img: "animais/texugo_europeu.png",
        reserves: ["torr_nan_sithean"],
        stats: {
            maxScore: "16",
            maxWeight: "0-12.83 KG",
            drinkTime: "O DIA TODO"
        },
        furs: {
            rare: {
                macho: ["Albino", "Melânico", "Leucismo", "Malhado", "Vermelho Eritrístico diluído"],
                femea: ["Albino", "Melânico", "Leucismo", "Malhado", "Vermelho Eritrístico diluído"]
            },
            diamond: {
                macho: ["Cinza Escuro", "Cinza", "Pardo", "Diluido"],
                femea: []
            },
            greatOne: []
        }
    },

    "urso_cinzento": {
        name: "Urso Cinzento",
        slug: "urso_cinzento",
        class: 8,
        maxLevel: 9,
        img: "animais/urso_cinzento.png",
        reserves: ["yukon_valley"],
        stats: {
            maxScore: "66.94",
            maxWeight: "551-680 KG",
            drinkTime: "04:00 - 08:00"
        },
        furs: {
            rare: {
                macho: ["Albino", "Marrom"],
                femea: ["Albino"]
            },
            diamond: {
                macho: ["Pardo e Cinza"],
                femea: []
            },
            greatOne: []
        }
    },

    "veado_das_montanhas_rochosas": {
        name: "Veado das Montanhas Rochosas",
        slug: "veado_das_montanhas_rochosas",
        class: 7,
        maxLevel: 5,
        img: "animais/veado_das_montanhas_rochosas.png",
        reserves: ["silver_ridge_peaks"],
        stats: {
            maxScore: "481.41",
            maxWeight: "410-480 KG",
            drinkTime: "04:00-08:00"
        },
        furs: {
            rare: {
                macho: ["Albino", "Malhado Variação 1", "Malhado Mariação 2"],
                femea: ["Albino", "Malhado Variação 1", "Malhado Variação 2"]
            },
            diamond: {
                macho: ["Pardo", "Pardo Claro"],
                femea: []
            },
            greatOne: []
        }
    },

    "veado_de_cauda_preta": {
        name: "Veado de Cauda Preta",
        slug: "veado_de_cauda_preta",
        class: 4,
        maxLevel: 5,
        img: "animais/veado_de_cauda_preta.png",
        reserves: ["layton_lake"],
        stats: {
            maxScore: "177.58",
            maxWeight: "81-95 KG",
            drinkTime: "16:00 - 20:00"
        },
        furs: {
            rare: {
                macho: ["Albino", "Melânico", "Malhado"],
                femea: ["Albino", "Melânico", "Malhado"]
            },
            diamond: {
                macho: ["Pardo e Cinza", "Cinzento", "Cinza Escuro"],
                femea: []
            },
            greatOne: []
        }
    },

    "veado_de_roosevelt": {
        name: "Veado de Roosevelt",
        slug: "veado_de_roosevelt",
        class: 7,
        maxLevel: 5,
        img: "animais/veado_de_roosevelt.png",
        reserves: ["layton_lake"],
        stats: {
            maxScore: "380.84",
            maxWeight: "450-500 KG",
            drinkTime: "04:00 - 08:00"
        },
        furs: {
            rare: {
                macho: ["Albino", "Melânico", "Malhado"],
                femea: ["Albino", "Melânico", "Malhado"]
            },
            diamond: {
                macho: ["Pardo", "Laranja", "Bronzeado"],
                femea: []
            },
            greatOne: []
        }
    },

    "vison_americano": {
        name: "Vison Americano",
        slug: "vison_americano",
        class: 1,
        maxLevel: 5,
        img: "animais/vison_americano.png",
        reserves: ["torr_nan_sithean"],
        stats: {
            maxScore: "151",
            maxWeight: "0.7-1.60 KG",
            drinkTime: "O DIA TODO"
        },
        furs: {
            rare: {
                macho: ["Albino", "Melânico", "Leucismo", "Preto", "Malhado Variação 1", "Malhado Variação 2", "Prateado"],
                femea: ["Albino", "Melânico", "Leucismo", "Preto", "Malhado Variação 1", "Malhado Variação 2", "Prateado"]
            },
            diamond: {
                macho: ["Pardo Escuro", "Pardo"],
                femea: []
            },
            greatOne: []
        }
    },

    "veado_de_cauda_branca": {
        name: "Veado de Cauda Branca",
        slug: "veado_de_cauda_branca",
        class: 4,
        maxLevel: 3,
        img: "animais/veado_de_cauda_branca.png",
        reserves: ["layton_lake", "rancho_del_arroyo", "mississippi_acres", "revontuli_coast", "new_england_mountains", "askiy_ridge"],
        stats: {
            maxScore: "255.09",
            maxWeight: "75-100 KG",
            drinkTime: "08:00 - 12:00"
        },
        furs: {
            rare: {
                macho: ["Albino", "Melânico", "Malhado"],
                femea: ["Albino", "Melânico", "Malhado"]
            },
            diamond: {
                macho: ["Pardo", "Pardo Escuro", "Bronzeado"],
                femea: []
            },
            greatOne: ["Pardo", "Pardo Escuro", "Bronzeado", "Malhado"]
        }
    }
};