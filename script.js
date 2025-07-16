// script.js

import { firebaseConfig } from './js/config.js';
import { initializeFirebase, loadDataFromFirestore, saveDataToFirestore } from './js/firebase-service.js';
import { renderLoginScreen } from './js/auth.js';
import { renderMainMenu } from './js/ui/album-views.js';
import { renderGrindManager } from './js/ui/grind.js';
import { renderProgressPanel } from './js/ui/progress.js';

let currentUser = null;
let savedData = {};

function initializeApp() {
    initializeFirebase(firebaseConfig);

    firebase.auth().onAuthStateChanged(async (user) => {
        if (user) {
            currentUser = user;
            savedData = await loadDataFromFirestore(currentUser.uid) || {};
            renderMainView();
        } else {
            renderLoginScreen(async (user) => {
                currentUser = user;
                savedData = await loadDataFromFirestore(currentUser.uid) || {};
                renderMainView();
            });
        }
    });
}

function renderMainView() {
    const appContainer = document.getElementById('app');
    renderMainMenu(appContainer, savedData, renderSubView, saveData);
}

function renderSubView(viewName) {
    const appContainer = document.getElementById('app');
    appContainer.innerHTML = '';

    if (viewName === 'progress') {
        renderProgressPanel(appContainer, savedData);
    } else if (viewName === 'grind') {
        renderGrindManager(appContainer, savedData, saveData);
    } else {
        renderMainMenu(appContainer, savedData, renderSubView, saveData);
    }
}

async function saveData() {
    if (currentUser) {
        await saveDataToFirestore(currentUser.uid, savedData);
    }
}

initializeApp();
