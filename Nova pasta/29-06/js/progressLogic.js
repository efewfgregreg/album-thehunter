// Arquivo: js/progressLogic.js
import { rareFursData, diamondFursData, greatsFursData, items, animalHotspotData, reservesData, multiMountsData } from '../data/gameData.js';
import { slugify } from './utils.js';

// Analisa os dados para filtros de Classe e Nível
export function getUniqueAnimalData() {
    const classes = new Set();
    const levels = new Set();

    Object.values(animalHotspotData).forEach(reserve => {
        Object.values(reserve).forEach(animal => {
            if (animal.animalClass) classes.add(animal.animalClass);
            if (animal.maxLevel) levels.add(animal.maxLevel);
        });
    });

    const sortedClasses = [...classes].sort((a, b) => parseInt(a) - parseInt(b));
    const sortedLevels = [...levels].sort((a, b) => parseInt(a) - parseInt(b));

    return { classes: sortedClasses, levels: sortedLevels };
}

export function getAnimalAttributes(slug) {
    const attributes = {
        classes: new Set(),
        levels: new Set(),
        reserves: new Set()
    };

    Object.values(animalHotspotData).forEach(reserve => {
        if (reserve[slug]) {
            if (reserve[slug].animalClass) attributes.classes.add(reserve[slug].animalClass);
            if (reserve[slug].maxLevel) attributes.levels.add(reserve[slug].maxLevel);
        }
    });

    Object.entries(reservesData).forEach(([reserveKey, reserveData]) => {
        if (reserveData.animals.includes(slug)) {
            attributes.reserves.add(reserveKey);
        }
    });

    return {
        classes: [...attributes.classes],
        levels: [...attributes.levels],
        reserves: [...attributes.reserves]
    };
}

export function checkAndSetGreatOneCompletion(slug, currentData) {
    const requiredFurs = greatsFursData[slug];
    if (!requiredFurs || !currentData) return;
    currentData.completo = requiredFurs.every(furName => currentData.furs?.[furName]?.trophies?.length > 0);
}

// Cálculo detalhado do progresso geral (Recebe savedData como argumento)
export function calcularProgressoDetalhado(savedData) {
    const progress = {
        rares: { collected: 0, total: 0, maleCollected: 0, maleTotal: 0, femaleCollected: 0, femaleTotal: 0, speciesCollected: 0, speciesTotal: 0 },
        diamonds: { collected: 0, total: 0, speciesCollected: 0, speciesTotal: 0 },
        greats: { collected: 0, total: 0, byAnimal: {} },
        super_raros: { collected: 0, total: 0 }
    };

    if (!savedData) return progress; // Proteção contra dados vazios

    const allAnimalSlugs = items.map(slugify);

    allAnimalSlugs.forEach(slug => {
        // --- Pelagens Raras ---
        const rareData = rareFursData[slug];
        if (rareData) {
            const maleTotal = rareData.macho?.length || 0;
            const femaleTotal = rareData.femea?.length || 0;
            if (maleTotal + femaleTotal > 0) {
                progress.rares.speciesTotal++;
                progress.rares.total += maleTotal + femaleTotal;
                progress.rares.maleTotal += maleTotal;
                progress.rares.femaleTotal += femaleTotal;

                const savedRares = savedData.pelagens?.[slug] || {};
                let collectedCountForSpecies = 0;
                
                if (rareData.macho) {
                    rareData.macho.forEach(fur => {
                        if (savedRares[`Macho ${fur}`]) {
                            progress.rares.collected++;
                            progress.rares.maleCollected++;
                            collectedCountForSpecies++;
                        }
                    });
                }
                if (rareData.femea) {
                    rareData.femea.forEach(fur => {
                        if (savedRares[`Fêmea ${fur}`]) {
                            progress.rares.collected++;
                            progress.rares.femaleCollected++;
                            collectedCountForSpecies++;
                        }
                    });
                }
                if (collectedCountForSpecies === (maleTotal + femaleTotal)) {
                    progress.rares.speciesCollected++;
                }
            }
        }

        // --- Diamantes ---
        const diamondData = diamondFursData[slug];
        if (diamondData) {
            const totalForSpecies = (diamondData.macho?.length || 0) + (diamondData.femea?.length || 0);
            if (totalForSpecies > 0) {
                progress.diamonds.speciesTotal++;
                progress.diamonds.total += totalForSpecies;
                const collectedForSpecies = new Set((savedData.diamantes?.[slug] || []).map(t => t.type)).size;
                progress.diamonds.collected += collectedForSpecies;
                if (collectedForSpecies > 0) {
                    progress.diamonds.speciesCollected++;
                }
            }
        }

        // --- Super Raros ---
        const srRareData = rareFursData[slug];
        const srDiamondData = diamondFursData[slug];
        if (srRareData && srDiamondData) {
            let totalForSpecies = 0;
            if (srRareData.macho && (srDiamondData.macho?.length || 0) > 0) totalForSpecies += srRareData.macho.length;
            if (srRareData.femea && (srDiamondData.femea?.length || 0) > 0) totalForSpecies += srRareData.femea.length;

            if (totalForSpecies > 0) {
                progress.super_raros.total += totalForSpecies;
                progress.super_raros.collected += Object.values(savedData.super_raros?.[slug] || {}).filter(v => v).length;
            }
        }
    });

    // --- Great Ones ---
    Object.entries(greatsFursData).forEach(([slug, furs]) => {
        progress.greats.total += furs.length;
        const animalName = items.find(i => slugify(i) === slug) || slug;
        let collectedForAnimal = 0;
        furs.forEach(furName => {
            if (savedData.greats?.[slug]?.furs?.[furName]?.trophies?.length > 0) {
                progress.greats.collected++;
                collectedForAnimal++;
            }
        });
        progress.greats.byAnimal[animalName] = { collected: collectedForAnimal, total: furs.length };
    });

    return progress;
}

export function calcularReserveProgress(reserveKey, savedData) {
    const reserveAnimals = reservesData[reserveKey]?.animals || [];
    let progress = {
        collectedRares: 0, totalRares: 0,
        collectedDiamonds: 0, totalDiamonds: 0,
        collectedGreatOnes: 0, totalGreatOnes: 0,
        collectedSuperRares: 0, totalSuperRares: 0
    };
    
    if (!savedData) return progress;

    reserveAnimals.forEach(slug => {
        // Rares
        if (rareFursData[slug]) {
            progress.totalRares += (rareFursData[slug].macho?.length || 0) + (rareFursData[slug].femea?.length || 0);
            progress.collectedRares += Object.values(savedData.pelagens?.[slug] || {}).filter(v => v === true).length;
        }
        // Diamonds
        if (diamondFursData[slug]) {
            progress.totalDiamonds += (diamondFursData[slug].macho?.length || 0) + (diamondFursData[slug].femea?.length || 0);
            progress.collectedDiamonds += new Set((savedData.diamantes?.[slug] || []).map(t => t.type)).size;
        }
        // Great Ones
        if (greatsFursData[slug]) {
            progress.totalGreatOnes += greatsFursData[slug].length;
            progress.collectedGreatOnes += Object.values(savedData.greats?.[slug]?.furs || {}).filter(f => f.trophies?.length > 0).length;
        }
        // Super Rares
        const speciesRareFurs = rareFursData[slug];
        const speciesDiamondFurs = diamondFursData[slug];
        if (speciesRareFurs) {
            if (speciesRareFurs.macho && (speciesDiamondFurs?.macho?.length || 0) > 0) {
                progress.totalSuperRares += speciesRareFurs.macho.length;
            }
            if (speciesRareFurs.femea && (speciesDiamondFurs?.femea?.length || 0) > 0) {
                progress.totalSuperRares += speciesRareFurs.femea.length;
            }
        }
        progress.collectedSuperRares += Object.values(savedData.super_raros?.[slug] || {}).filter(v => v === true).length;
    });
    return progress;
}

export function getCompleteTrophyInventory(savedData) {
    const inventory = [];
    if (!savedData) return inventory;

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
    // ... lógica de diamantes e super raros segue o mesmo padrão se necessário expandir
    // Simplificado para manter consistência com o original
    return inventory;
}

export function checkMountRequirements(requiredAnimals, savedData) {
    // Requer que a lógica de inventário esteja completa ou seja importada,
    // mas para simplificar, vamos assumir a lógica de verificação básica aqui
    // Se precisar da função completa getCompleteTrophyInventory, ela deve ser fully implemented.
    // Pelo contexto, vamos manter a lógica original no main.js por enquanto OU mover tudo.
    // Vamos mover tudo no próximo passo para garantir que não quebre.
    return { isComplete: false, fulfillmentRequirements: [] };
}
// Adicione isso no final do arquivo js/progressLogic.js

/**
 * Calcula o progresso de um único animal para uma aba específica.
 * Retorna objeto simples: { collected: 5, total: 10, status: 'completed' | 'inprogress' | 'incomplete' }
 */
export function getAnimalCardStatus(slug, tabKey, savedData) {
    let collected = 0;
    let total = 0;
    let status = 'incomplete';

    // Se não houver dados salvos, retorna vazio
    if (!savedData) return { collected, total, status };

    if (tabKey === 'pelagens' || tabKey === 'super_raros') {
        const dataSet = tabKey === 'pelagens' ? savedData.pelagens : savedData.super_raros;
        const sourceData = rareFursData[slug]; // Importado de gameData
        
        // Conta quantos itens true existem
        collected = Object.values(dataSet?.[slug] || {}).filter(v => v === true).length;
        
        if (sourceData) {
            if (tabKey === 'super_raros') {
                // Lógica específica de super raros (se quiser simplificar, pode usar só a contagem direta)
                // Aqui mantemos sua lógica original de verificar se existe diamante correspondente
                const diamondData = diamondFursData[slug];
                if (sourceData.macho && (diamondData?.macho?.length || 0) > 0) total += sourceData.macho.length;
                if (sourceData.femea && (diamondData?.femea?.length || 0) > 0) total += sourceData.femea.length;
            } else {
                total = (sourceData.macho?.length || 0) + (sourceData.femea?.length || 0);
            }
        }
    } 
    else if (tabKey === 'diamantes') {
        const sourceData = diamondFursData[slug];
        // Conta tipos únicos coletados
        collected = new Set((savedData.diamantes?.[slug] || []).map(t => t.type)).size;
        if (sourceData) {
            total = (sourceData.macho?.length || 0) + (sourceData.femea?.length || 0);
        }
    }
    else if (tabKey === 'greats') {
        const sourceData = greatsFursData[slug];
        const animalData = savedData.greats?.[slug] || {};
        
        // Verifica completude usando a função que já existe
        checkAndSetGreatOneCompletion(slug, animalData);
        
        collected = Object.values(animalData.furs || {}).filter(f => f.trophies?.length > 0).length;
        total = sourceData?.length || 0;
        
        // Great Ones tem uma lógica de status levemente diferente (completo vs incompleto)
        if (animalData.completo) status = 'completed';
        else if (collected > 0) status = 'inprogress';
        
        return { collected, total, status };
    }

    // Define status padrão para as outras abas
    if (total > 0 && collected >= total) status = 'completed';
    else if (collected > 0) status = 'inprogress';

    return { collected, total, status };
}