// js/auth.js

import { initializeFirebase } from './firebase-service.js';

let auth = null;

function initAuth(onAuthStateChangedCallback) {
    initializeFirebase();
    auth = firebase.auth();
    auth.onAuthStateChanged(onAuthStateChangedCallback);
}

function loginUser(email, password) {
    return auth.signInWithEmailAndPassword(email, password);
}

function registerUser(email, password) {
    return auth.createUserWithEmailAndPassword(email, password);
}

function logoutUser() {
    return auth.signOut();
}

function getCurrentUser() {
    return auth.currentUser;
}

function renderLoginView(onLogin, onRegister) {
    const app = document.getElementById('app');
    app.innerHTML = `
        <h2>Login</h2>
        <input type="email" id="email" placeholder="Email">
        <input type="password" id="password" placeholder="Password">
        <button id="loginBtn">Login</button>
        <button id="registerBtn">Register</button>
    `;

    document.getElementById('loginBtn').addEventListener('click', () => {
        const email = document.getElementById('email').value.trim();
        const password = document.getElementById('password').value.trim();
        onLogin(email, password);
    });

    document.getElementById('registerBtn').addEventListener('click', () => {
        const email = document.getElementById('email').value.trim();
        const password = document.getElementById('password').value.trim();
        onRegister(email, password);
    });
}

function renderLogoutButton(onLogout) {
    const logoutButton = document.createElement('button');
    logoutButton.textContent = 'Logout';
    logoutButton.addEventListener('click', onLogout);

    document.body.prepend(logoutButton);
}

export {
    initAuth,
    loginUser,
    registerUser,
    logoutUser,
    getCurrentUser,
    renderLoginView,
    renderLogoutButton
};
