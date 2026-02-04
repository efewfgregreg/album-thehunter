// Arquivo: js/dataValidator.js

import { items, reservesData, rareFursData, diamondFursData, animalHotspotData } from '../data/gameData.js';
import { slugify } from './utils.js';

export function runDataValidation() {
    console.groupCollapsed('🔍 🛡️ Validação de Dados do Caçador (Clique para ver)');
    const start = performance.now();
    let errors = 0;
    let warnings = 0;

    const validSlugs = new Set(items.map(i => slugify(i)));
    
    // 1. Verificar Duplicatas na Lista Principal (items)
    const seenItems = new Set();
    items.forEach(item => {
        if (seenItems.has(item)) {
            console.error(`❌ DUPLICATA em 'items': O animal "${item}" aparece duas vezes.`);
            errors++;
        }
        seenItems.add(item);
    });

    // 2. Verificar Animais nas Reservas (Se existem na lista items)
    Object.entries(reservesData).forEach(([resKey, resData]) => {
        if (!resData.animals) return;
        resData.animals.forEach(animalSlug => {
            if (!validSlugs.has(animalSlug)) {
                console.error(`❌ ERRO CRÍTICO em ${resData.name}: O animal "${animalSlug}" está na reserva mas NÃO existe na lista 'items' (ou o nome está digitado diferente).`);
                errors++;
            }
        });
    });

    // 3. Verificar Hotspots Perdidos
    Object.entries(animalHotspotData).forEach(([resKey, animalsObj]) => {
        // Verifica se a reserva do hotspot existe
        if (!reservesData[resKey]) {
            console.error(`❌ ERRO EM HOTSPOTS: A chave de reserva "${resKey}" não existe em 'reservesData'.`);
            errors++;
        } else {
            // Verifica se os animais do hotspot são válidos
            Object.keys(animalsObj).forEach(slug => {
                if (!validSlugs.has(slug)) {
                    console.warn(`⚠️ AVISO: Hotspot definido para "${slug}" em ${resKey}, mas este animal não está na lista 'items'.`);
                    warnings++;
                }
            });
        }
    });

    // 4. Verificar Pelagens sem Correspondência
    const checkFurs = (dataSet, name) => {
        Object.keys(dataSet).forEach(slug => {
            if (!validSlugs.has(slug)) {
                console.warn(`⚠️ DADOS ÓRFÃOS em ${name}: Existem dados para "${slug}", mas ele não está na lista 'items'.`);
                warnings++;
            }
        });
    };
    
    checkFurs(rareFursData, 'rareFursData');
    checkFurs(diamondFursData, 'diamondFursData');

    const end = performance.now();
    
    if (errors === 0 && warnings === 0) {
        console.log(`✅ Tudo certo! Nenhum erro encontrado nos dados (${(end - start).toFixed(2)}ms).`);
    } else {
        console.log(`🏁 Validação concluída com ${errors} erros e ${warnings} avisos.`);
    }
    console.groupEnd();
}