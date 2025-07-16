// js/ui/progress.js

export function renderProgressPanel(container, savedData) {
    container.innerHTML = '<h2>Progresso do Álbum</h2>';

    const totalAnimals = Object.keys(savedData).length;
    let totalCaptures = 0;

    Object.values(savedData).forEach(animalData => {
        totalCaptures += (animalData.diamonds?.length || 0);
        totalCaptures += (animalData.rares?.length || 0);
        totalCaptures += (animalData.super_rares?.length || 0);
        totalCaptures += (animalData.great_ones?.length || 0);
    });

    const summary = document.createElement('p');
    summary.textContent = `Total de Animais Registrados: ${totalAnimals}
    | Total de Capturas: ${totalCaptures}`;

    container.appendChild(summary);

    // Gráfico ou estatísticas futuras podem ser adicionadas aqui
}
