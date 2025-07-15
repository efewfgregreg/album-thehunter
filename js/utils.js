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
// NOVA FUNÇÃO ADICIONADA
// ====================================================================

/**
 * Calcula o progresso de uma reserva específica.
 * @param {string} reserveName - O nome da reserva a ser calculada.
 * @param {object} animalData - O objeto principal com os dados de todos os animais, vindo de data.js.
 * @param {object} savedData - Os dados de progresso salvos do usuário.
 * @returns {{completed: number, total: number, percentage: number}} - Um objeto com o total de animais, quantos foram completados e a porcentagem.
 */
export function calculateReserveProgress(reserveName, animalData, savedData) {
  // Retorna zero se a reserva não for encontrada nos nossos dados estáticos
  if (!animalData[reserveName]) {
    return { completed: 0, total: 0, percentage: 0 };
  }

  const animalsInReserve = animalData[reserveName];
  const totalAnimals = animalsInReserve.length;

  // Retorna zero se a reserva não tiver animais cadastrados
  if (totalAnimals === 0) {
    return { completed: 0, total: 0, percentage: 0 };
  }

  let completedAnimals = 0;
  animalsInReserve.forEach(animal => {
    const animalSlug = slugify(animal.name);
    // Verificamos se o animal existe nos dados salvos do usuário e se está marcado como "owned"
    if (savedData[animalSlug] && savedData[animalSlug].owned) {
      completedAnimals++;
    }
  });

  // Calcula a porcentagem, evitando divisão por zero
  const percentage = totalAnimals > 0 ? (completedAnimals / totalAnimals) * 100 : 0;

  return {
    completed: completedAnimals,
    total: totalAnimals,
    percentage: Math.round(percentage)
  };
}