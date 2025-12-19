// Arquivo: js/dataValidator.js
import { rareFursData, items, reservesData } from '../data/gameData.js';
import { slugify } from './utils.js';

export function runDataValidation() {
    console.group("🔍 RELATÓRIO DO DETETIVE DE DADOS");
    let errorCount = 0;
    let warningCount = 0;

    const allSlugs = items.map(slugify);
    const rareFurSlugs = Object.keys(rareFursData);

    // 1. Verificar se todos os animais nas Pelagens Raras existem na lista principal (items)
    rareFurSlugs.forEach(slug => {
        if (!allSlugs.includes(slug)) {
            console.error(`❌ ERRO CRÍTICO: O animal '${slug}' está em 'rareFursData' mas NÃO está na lista principal 'items'.`);
            errorCount++;
        }
    });

    // 2. Verificar se animais das Reservas existem na lista principal
    Object.entries(reservesData).forEach(([reserveKey, data]) => {
        data.animals.forEach(animalSlug => {
            // Verifica se o slug do animal na reserva bate com algum slug da lista de itens
            // Nota: Às vezes items tem nomes acentuados, então convertemos ambos para comparar
            const exists = allSlugs.includes(animalSlug); 
            
            if (!exists) {
                console.warn(`⚠️ AVISO: A reserva '${data.name}' lista o animal '${animalSlug}', mas ele não foi encontrado exatamente assim na lista 'items'. Verifique se é erro de digitação.`);
                warningCount++;
            }
        });
    });

    // 3. Verificar Imagens (Simulação básica de caminhos)
    console.log("ℹ️ Dica: Verifique a aba 'Rede' (Network) se ver muitas imagens 404.");

    if (errorCount === 0 && warningCount === 0) {
        console.log("%c✅ TUDO PARECE CORRETO!", "color: green; font-weight: bold; font-size: 14px;");
    } else {
        console.log(`%c🚨 Encontrados ${errorCount} erros e ${warningCount} avisos. Corrija-os para evitar bugs!`, "color: orange; font-weight: bold;");
    }
    console.groupEnd();
}