function updateProgressPanel() {
    // Helper function para atualizar uma seção da barra de progresso
    const updateSection = (id, collected, total) => {
        const label = document.getElementById(`${id}-progress-label`);
        const bar = document.getElementById(`${id}-progress-bar`);
        const percentage = total > 0 ? (collected / total) * 100 : 0;

        if (label) label.textContent = `${collected} / ${total}`;
        if (bar) {
            bar.style.width = `${percentage}%`;
            bar.textContent = `${Math.round(percentage)}%`;
        }
    };

    // --- Cálculo Pelagens Raras ---
    let totalRares = 0;
    Object.values(rareFursData).forEach(species => {
        totalRares += (species.macho?.length || 0);
        totalRares += (species.femea?.length || 0);
    });

    let collectedRares = 0;
    if (savedData.pelagens) {
        Object.values(savedData.pelagens).forEach(speciesData => {
            collectedRares += Object.values(speciesData).filter(isCollected => isCollected).length;
        });
    }
    updateSection('rares', collectedRares, totalRares);

    // --- Cálculo Super Raros ---
    const totalSuperRares = totalRares; // A base de colecionáveis é a mesma das raras
    let collectedSuperRares = 0;
    if (savedData.super_raros) {
        Object.values(savedData.super_raros).forEach(speciesData => {
            collectedSuperRares += Object.values(speciesData).filter(isCollected => isCollected).length;
        });
    }
    updateSection('super-rares', collectedSuperRares, totalSuperRares);

    // --- Cálculo Diamantes ---
    let totalDiamonds = 0;
    Object.values(diamondFursData).forEach(species => {
        totalDiamonds += (species.macho?.length || 0);
        totalDiamonds += (species.femea?.length || 0);
    });

    let collectedDiamonds = 0;
    if (savedData.diamantes) {
        Object.values(savedData.diamantes).forEach(speciesData => {
            Object.values(speciesData).forEach(trophyData => {
                if (trophyData === true || (typeof trophyData === 'object' && trophyData.completed)) {
                    collectedDiamonds++;
                }
            });
        });
    }
    updateSection('diamond', collectedDiamonds, totalDiamonds);

    // --- Cálculo Great Ones ---
    // O total é a soma de todas as pelagens raras de GO possíveis
    let totalGreatOnesFurs = 0;
    Object.values(greatsFursData).forEach(fursArray => {
        totalGreatOnesFurs += fursArray.length;
    });
    
    // O coletado é a quantidade de tipos de pelagens de GO que você já pegou ao menos uma vez
    let collectedGreatOnesFurs = 0;
    if (savedData.greats) {
        Object.values(savedData.greats).forEach(speciesData => {
            if (speciesData.furs) {
                Object.values(speciesData.furs).forEach(furData => {
                    if (furData.trophies?.length > 0) {
                        collectedGreatOnesFurs++;
                    }
                });
            }
        });
    }
    updateSection('greatone', collectedGreatOnesFurs, totalGreatOnesFurs);
}