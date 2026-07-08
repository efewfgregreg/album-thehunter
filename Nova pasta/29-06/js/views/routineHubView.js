// =================================================================
// ARQUIVO: js/views/routineHubView.js (VERSÃO FINAL ORGANIZADA E CORRIGIDA)
// =================================================================
import { reservesData, greatsFursData } from '../../data/gameData.js';
import { renderRoutineDetailView } from './routineView.js';
import { createCardElement } from '../components/AnimalCard.js';

export function renderRoutineHubView(container, navigateCallback) {
    // ATUALIZA O HEADER PARA VOLTAR AO DASHBOARD PRINCIPAL
    const headerTitle = document.querySelector('.page-header h2');
    const backBtn = document.querySelector('.page-header .back-button');
    if (headerTitle) headerTitle.textContent = 'Rotina & População';
    if (backBtn) {
        backBtn.innerHTML = '&larr; Voltar para o Início';
        import('../main.js').then(module => {
            backBtn.onclick = () => module.renderNavigationHub();
        });
    }

    container.innerHTML = `
        <style>
            .routine-hub-wrapper { padding: 40px; color: #fff; }
            .reserves-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(240px, 1fr)); gap: 25px; margin-top: 30px; }
            
            .nav-card {
                background: #1a1a1a; border: 1px solid rgba(255, 255, 255, 0.1);
                border-radius: 12px; cursor: pointer; transition: all 0.3s ease;
                display: flex; flex-direction: column; height: 160px; position: relative; overflow: hidden;
            }
            .nav-card:hover { border-color: var(--primary-color); transform: translateY(-5px); box-shadow: 0 5px 15px rgba(0,188,212,0.2); }
            
            .card-bg-img { width: 100%; height: 100%; object-fit: cover; opacity: 0.6; transition: opacity 0.3s; }
            .nav-card:hover .card-bg-img { opacity: 0.8; }
            
            .card-title { 
                position: absolute; bottom: 0; width: 100%; padding: 12px 0; 
                background: rgba(0,0,0,0.85); font-family: 'Bebas Neue', sans-serif; 
                font-size: 1.1rem; text-align: center; border-top: 1px solid var(--primary-color);
            }
            .go-card { justify-content: center; align-items: center; border: 1px solid var(--primary-color); }
        </style>
        
        <div class="routine-hub-wrapper">
            <h2 style="font-family: 'Bebas Neue'; color: var(--primary-color);">SELECIONE UMA RESERVA</h2>
            <div class="reserves-grid">
                <div class="nav-card go-card" id="go-trigger">
                    <i class="fas fa-crown" style="font-size: 2rem; color: #ffd700;"></i>
                    <h3 style="margin: 10px 0 0 0;">GREAT ONES</h3>
                </div>
                ${Object.entries(reservesData).map(([key, res]) => `
                    <div class="nav-card reserve-item" data-key="${key}">
                        <img src="${res.image}" class="card-bg-img">
                        <div class="card-title">${res.name}</div>
                    </div>
                `).join('')}
            </div>
        </div>
    `;

    container.querySelectorAll('.reserve-item').forEach(card => {
        card.onclick = () => renderAnimalSelector(container, card.dataset.key, navigateCallback);
    });

    container.querySelector('#go-trigger').onclick = () => {
        const goAnimals = Object.keys(greatsFursData);
        renderAnimalSelector(container, null, navigateCallback, goAnimals);
    };
}

export function renderAnimalSelector(container, reserveKey, navigateCallback, goAnimals = null) {
    // ATUALIZA O HEADER PARA VOLTAR À SELEÇÃO DE RESERVAS
    const headerTitle = document.querySelector('.page-header h2');
    const backBtn = document.querySelector('.page-header .back-button');
    if (headerTitle) headerTitle.textContent = reserveKey ? reservesData[reserveKey].name.toUpperCase() : "GREAT ONES";
    if (backBtn) {
        backBtn.innerHTML = '&larr; Voltar para Reservas';
        backBtn.onclick = () => renderRoutineHubView(container, navigateCallback);
    }

    const title = reserveKey ? reservesData[reserveKey].name.toUpperCase() : "GREAT ONES";
    const animals = goAnimals || reservesData[reserveKey].animals;

    container.innerHTML = `
        <div class="routine-hub-wrapper">
            <h2 style="font-family: 'Bebas Neue'; color: var(--primary-color); margin-bottom: 20px;">
                ${title}
            </h2>
            <div class="animal-grid" style="display: grid; grid-template-columns: repeat(auto-fill, minmax(180px, 1fr)); gap: 20px;">
            </div>
        </div>
    `;

    const grid = container.querySelector('.animal-grid');

    animals.forEach(slug => {
        const displayName = slug.replace(/_/g, ' ').toUpperCase();
        
        const card = createCardElement(displayName, { diamondsPercentage: 0, isCompleted: false });
        
        // Remove elementos visuais de progresso
        const progressContainer = card.querySelector('.progress-container');
        if (progressContainer) progressContainer.remove();
        
        const badge = card.querySelector('.completion-badge');
        if (badge) badge.remove();

        card.onclick = () => {
            if (!reserveKey) {
                renderGoReserveSelector(container, slug, navigateCallback);
            } else {
                renderRoutineDetailView(container, displayName, slug, reserveKey);
            }
        };
        
        grid.appendChild(card);
    });
}

function renderGoReserveSelector(container, animalSlug, navigateCallback) {
    // ATUALIZA O HEADER PARA VOLTAR À SELEÇÃO DE ANIMAIS (GREAT ONES)
    const headerTitle = document.querySelector('.page-header h2');
    const backBtn = document.querySelector('.page-header .back-button');
    const displayName = animalSlug.replace(/_/g, ' ').toUpperCase();
    
    if (headerTitle) headerTitle.textContent = `MAPAS: ${displayName}`;
    if (backBtn) {
        backBtn.innerHTML = '&larr; Voltar para Animais';
        backBtn.onclick = () => renderAnimalSelector(container, null, navigateCallback, Object.keys(greatsFursData));
    }

    const availableReserves = Object.entries(reservesData).filter(([key, res]) => 
        res.animals.includes(animalSlug)
    );

    container.innerHTML = `
        <div class="routine-hub-wrapper">
            <h2 style="font-family: 'Bebas Neue'; color: var(--primary-color); margin-bottom: 30px;">ONDE VOCÊ ESTÁ CAÇANDO?</h2>
            <div class="reserves-grid">
                ${availableReserves.map(([key, res]) => `
                    <div class="nav-card reserve-item" data-key="${key}" style="display: flex; flex-direction: column; height: 160px; position: relative; overflow: hidden; border: 1px solid rgba(255,255,255,0.1); border-radius: 12px; cursor: pointer;">
                        <img src="${res.image}" style="width: 100%; height: 100%; object-fit: cover; opacity: 0.6;">
                        <div class="card-title" style="position: absolute; bottom: 0; width: 100%; padding: 10px; background: rgba(0,0,0,0.8); text-align: center; font-family: 'Bebas Neue';">${res.name}</div>
                    </div>
                `).join('')}
            </div>
        </div>
    `;

    container.querySelectorAll('.reserve-item').forEach(card => {
        card.onclick = () => renderRoutineDetailView(container, animalSlug.replace(/_/g, ' ').toUpperCase(), animalSlug, card.dataset.key);
    });
}