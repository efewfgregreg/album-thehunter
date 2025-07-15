// js/auth.js

// Nota: Agora as funções recebem 'appContainer' e 'auth' como parâmetros
// para não dependerem de variáveis globais.

export function renderLoginForm(appContainer, auth) {
    appContainer.innerHTML = `
        <div class="auth-container">
            <div class="auth-box">
                <h2>Login - Álbum de Caça</h2>
                <p>Acesse sua conta para sincronizar seu progresso.</p>
                <input type="email" id="loginEmail" placeholder="Seu e-mail">
                <input type="password" id="loginPassword" placeholder="Sua senha">
                <button id="loginButton" class="auth-button">Entrar</button>
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
            .catch((error) => {
                errorDiv.textContent = `Erro ao entrar: ${error.message}`;
            });
    });

    document.getElementById('showRegister').addEventListener('click', () => renderRegisterForm(appContainer, auth));
}

export function renderRegisterForm(appContainer, auth) {
    appContainer.innerHTML = `
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
            .catch((error) => {
                errorDiv.textContent = `Erro no cadastro: ${error.message}`;
            });
    });

    document.getElementById('showLogin').addEventListener('click', () => renderLoginForm(appContainer, auth));
}

export function setupLogoutButton(user, auth, appContainer) {
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
            appContainer.prepend(pageHeader);
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
    document.getElementById('logoutButton').addEventListener('click', () => {
        auth.signOut();
    });
}