// src/js/main.js

import { auth } from './firebase.js';
import './data.js';
import './ui.js';
import './dataManager.js';
import './modalManager.js';
import './tabs/tab-pelagens.js';
import './tabs/tab-diamantes.js';
import './tabs/tab-super-raros.js';
import './tabs/tab-greats.js';
import './views/viewReserveSelection.js';
import './views/viewRareFursDetail.js';
import './views/viewDiamondDetail.js';
import './views/viewSuperRaresDetail.js';
import './views/viewGreatsDetail.js';
import { renderTrophyRoom } from './trophyRoomManager.js';
import { renderMultiMountsView } from './views/viewMultiMounts.js';
import { renderNavigationHub } from './views/viewNavigationHub.js';

const tabs = document.querySelectorAll('.nav-card');
tabs.forEach(tab => {
    tab.addEventListener('click', () => {
        switchTab(tab.dataset.tab);
    });
});

function switchTab(tabName) {
    document.querySelectorAll('.main-content').forEach(tabContent => {
        if (tabContent.dataset.tab === tabName) {
            tabContent.style.display = 'block';
            if (tabName === 'trophy-room') {
                renderTrophyRoom(tabContent, window.savedData || {});
            }
            if (tabName === 'multi-mounts') {
                renderMultiMountsView(tabContent);
            }
        } else {
            tabContent.style.display = 'none';
        }
    });
}

function initializeApp() {
    auth.onAuthStateChanged(user => {
        currentUser = user;
        if (user) {
            console.log('Usuário logado:', user.email);
        } else {
            console.log('Usuário deslogado');
        }
    });

    const appContainer = document.getElementById('app-container');
    renderNavigationHub(appContainer);

    switchTab('pelagens');
}

window.addEventListener('load', initializeApp);
