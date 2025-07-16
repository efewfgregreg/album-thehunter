// Importa o serviço de autenticação do nosso módulo centralizado
import { auth } from './firebase-service.js';

// As funções agora são exportadas e recebem o 'container' como parâmetro.
export function renderLoginForm(container) {
    container.innerHTML = `
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
        
        // Usamos a instância 'auth' importada
        auth.signInWithEmailAndPassword(email, password)
            .catch((error) => {
                errorDiv.textContent = `Erro ao entrar: ${error.message}`;
            });
    });

    // Ao clicar para registrar, chamamos a outra função deste mesmo módulo
    document.getElementById('showRegister').addEventListener('click', () => renderRegisterForm(container));
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

        // Usamos a instância 'auth' importada
        auth.createUserWithEmailAndPassword(email, password)
            .catch((error) => {
                errorDiv.textContent = `Erro no cadastro: ${error.message}`;
            });
    });
    
    // Ao clicar para logar, chamamos a outra função deste mesmo módulo
    document.getElementById('showLogin').addEventListener('click', () => renderLoginForm(container));
}

export function setupLogoutButton(headerContainer, user) {
    if (!user || !headerContainer) return;

    let logoutContainer = document.getElementById('logout-container');
    if (logoutContainer) logoutContainer.remove(); // Remove o antigo se existir

    logoutContainer = document.createElement('div');
    logoutContainer.id = 'logout-container';
    logoutContainer.innerHTML = `
        <span class="user-email">${user.email}</span>
        <button id="logoutButton" class="back-button">Sair</button>
    `;

    headerContainer.appendChild(logoutContainer);

    document.getElementById('logoutButton').addEventListener('click', () => {
        // Usamos a instância 'auth' importada
        auth.signOut();
    });
}