// Propósito: Armazenar funções auxiliares pequenas e reutilizáveis.

// Converte um texto para um formato de slug (ex: "Veado Vermelho" -> "veado_vermelho")
export function slugify(texto) {
    return texto.toLowerCase().replace(/[-\s]+/g, '_').replace(/'/g, '');
}

// Retorna a estrutura de dados padrão para um novo usuário
export function getDefaultDataStructure() {
    return {
        pelagens: {},
        diamantes: {},
        greats: {},
        super_raros: {},
        grindSessions: []
    };
}

// ====================================================================
// VERSÃO CORRIGIDA DA FUNÇÃO
// ====================================================================

/**
 * Calcula o progresso de uma reserva específica.
 * @param {string} reserveKey - A chave da reserva (ex: "layton_lake").
 * @param {object} reservesData - O objeto com os dados de todas as reservas.
 * @param {object} savedData - Os dados de progresso salvos do usuário.
 * @returns {{completed: number, total: number, percentage: number}}
 */
export function calculateReserveProgress(reserveKey, reservesData, savedData) {
  // CORREÇÃO: Usando reservesData e checando se a lista de animais existe
  if (!reservesData[reserveKey] || !reservesData[reserveKey].animals) {
    return { completed: 0, total: 0, percentage: 0 };
  }

  // CORREÇÃO: Pegando a lista de animais (que já são slugs) direto de reservesData
  const animalsInReserve = reservesData[reserveKey].animals;
  const totalAnimals = animalsInReserve.length;

  if (totalAnimals === 0) {
    return { completed: 0, total: 0, percentage: 0 };
  }

  let completedAnimals = 0;
  // CORREÇÃO: Iterando sobre os slugs dos animais
  animalsInReserve.forEach(animalSlug => {
    // Verificamos se o animal existe nos dados salvos do usuário e se está marcado como "owned"
    if (savedData[animalSlug] && savedData[animalSlug].owned) {
      completedAnimals++;
    }
  });

  const percentage = totalAnimals > 0 ? (completedAnimals / totalAnimals) * 100 : 0;

  return {
    completed: completedAnimals,
    total: totalAnimals,
    percentage: Math.round(percentage)
  };
}