// Arquivo: js/auth.js

import { auth } from './firebase.js';

// --- FUNÇÕES DE AUTENTICAÇÃO ---
export function renderLoginForm(container) {
    container.innerHTML = `
        <div class="auth-container">
            <div class="auth-box">
                <h2>Login - Álbum de Caça</h2>
                <p>Acesse sua conta para sincronizar seu progresso.</p>
                <input type="email" id="loginEmail" placeholder="Seu e-mail">
                <input type="password" id="loginPassword" placeholder="Sua senha">
                <button id="loginButton" class="auth-button">Entrar</button>
                <button id="showPasswordReset" class="link-button">Esqueceu sua senha?</button>
                <button id="showRegister" class="link-button">Não tem uma conta? Cadastre-se</button>
                <div id="authError" class="auth-error"></div>
            </div>
        </div>
    `;

    document.getElementById('loginButton').addEventListener('click', () => {
        const email = document.getElementById('loginEmail').value;
        const password = document.getElementById('loginPassword').value;
        const errorDiv = document.getElementById('authError');
        auth.signInWithEmailAndPassword(email, password)
            .catch((error) => { errorDiv.textContent = `Erro ao entrar: ${error.message}`; });
    });

    document.getElementById('showRegister').addEventListener('click', () => renderRegisterForm(container));
    document.getElementById('showPasswordReset').addEventListener('click', renderPasswordResetForm);
}

export function renderPasswordResetForm() {
    const modal = document.getElementById('password-reset-modal');
    const emailInput = document.getElementById('resetEmailInput');
    const sendBtn = document.getElementById('send-reset-btn');
    const cancelBtn = document.getElementById('cancel-reset-btn');
    const errorDiv = document.getElementById('resetError');

    modal.style.display = 'flex';
    emailInput.value = ''; 
    errorDiv.textContent = ''; 

    const closeModalReset = () => modal.style.display = 'none';

    sendBtn.onclick = () => {
        const email = emailInput.value;
        if (!email) {
            errorDiv.textContent = 'Por favor, preencha seu e-mail.';
            return;
        }
        auth.sendPasswordResetEmail(email)
            .then(() => {
                closeModalReset();
                showCustomAlert('Um e-mail de redefinição de senha foi enviado para ' + email + '.', 'E-mail Enviado');
            })
            .catch((error) => {
                errorDiv.textContent = `Erro: ${error.message}`;
            });
    };
    cancelBtn.onclick = closeModalReset;
}

export function renderRegisterForm(container) {
    container.innerHTML = `
        <div class="auth-container">
            <div class="auth-box">
                <h2>Cadastro - Álbum de Caça</h2>
                <p>Crie sua conta para salvar seu progresso na nuvem.</p>
                <input type="email" id="registerEmail" placeholder="Seu e-mail">
                <input type="password" id="registerPassword" placeholder="Sua senha (mínimo 6 caracteres)">
                <button id="registerButton" class="auth-button">Cadastrar</button>
                <button id="showLogin" class="link-button">Já tem uma conta? Faça o login</button>
                <div id="authError" class="auth-error"></div>
            </div>
        </div>
    `;

    document.getElementById('registerButton').addEventListener('click', () => {
        const email = document.getElementById('registerEmail').value;
        const password = document.getElementById('registerPassword').value;
        const errorDiv = document.getElementById('authError');
        auth.createUserWithEmailAndPassword(email, password)
            .catch((error) => { errorDiv.textContent = `Erro no cadastro: ${error.message}`; });
    });

    document.getElementById('showLogin').addEventListener('click', () => renderLoginForm(container));
}

export function setupLogoutButton(user, container) {
    if (!user) return;
    let pageHeader = document.querySelector('.page-header');
    if (!pageHeader) {
        let existingHeader = document.querySelector('.page-header-logout-only');
        if (existingHeader) existingHeader.remove();
        pageHeader = document.createElement('div');
        pageHeader.className = 'page-header-logout-only';
        const navHub = document.querySelector('.navigation-hub');
        if (navHub) {
            navHub.before(pageHeader);
        } else {
            container.prepend(pageHeader);
        }
    }
    let logoutContainer = document.getElementById('logout-container');
    if (logoutContainer) logoutContainer.remove();
    logoutContainer = document.createElement('div');
    logoutContainer.id = 'logout-container';
    logoutContainer.innerHTML = `
        <span class="user-email">${user.email}</span>
        <button id="logoutButton" class="back-button">Sair</button>
    `;
    pageHeader.appendChild(logoutContainer);
    document.getElementById('logoutButton').addEventListener('click', () => { auth.signOut(); });
}

export function closeModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
        modal.style.display = "none";
    }
}

export function showCustomAlert(message, title = 'Aviso', isConfirm = false) {
    return new Promise((resolve) => {
        const modal = document.getElementById('custom-alert-modal');
        const modalTitle = document.getElementById('custom-alert-title');
        const modalMessage = document.getElementById('custom-alert-message');
        const okBtn = document.getElementById('custom-alert-ok-btn');
        const cancelBtn = document.getElementById('custom-alert-cancel-btn');
        modalTitle.textContent = title;
        modalMessage.textContent = message;
        okBtn.onclick = () => {
            modal.style.display = 'none';
            resolve(true);
        };
        if (isConfirm) {
            cancelBtn.style.display = 'inline-block';
            cancelBtn.onclick = () => {
                modal.style.display = 'none';
                resolve(false);
            };
        } else {
            cancelBtn.style.display = 'none';
        }
        modal.style.display = 'flex';
    });
}