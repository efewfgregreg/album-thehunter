// Arquivo: js/auth.js
import { auth, db } from './firebase.js';

// =================================================================
// ==================== FUNÇÕES DE INTERFACE =======================
// =================================================================

export function renderLoginForm(container) {
    container.innerHTML = '';
    const authDiv = document.createElement('div');
    authDiv.className = 'auth-container';
    
    authDiv.innerHTML = `
        <div class="auth-box">
            <h2><i class="fas fa-lock"></i> Acesso do Caçador</h2>
            <p>Entre para sincronizar seu progresso</p>
            <form id="login-form">
                <input type="email" id="login-email" placeholder="E-mail" required>
                <input type="password" id="login-password" placeholder="Senha" required>
                <div class="auth-error" id="login-error"></div>
                <button type="submit" class="auth-button">Entrar</button>
            </form>
            <button id="btn-goto-register" class="link-button">Criar nova conta</button>
            <button id="btn-forgot-password" class="link-button" style="font-size: 0.8rem; display:block; margin: 10px auto;">Esqueci minha senha</button>
        </div>
    `;
    
    container.appendChild(authDiv);
    
    // Eventos
    document.getElementById('login-form').addEventListener('submit', handleLogin);
    
    document.getElementById('btn-goto-register').addEventListener('click', () => {
        renderRegisterForm(container);
    });

    document.getElementById('btn-forgot-password').addEventListener('click', () => {
        showForgotPasswordModal();
    });
}

export function renderRegisterForm(container) {
    container.innerHTML = '';
    const authDiv = document.createElement('div');
    authDiv.className = 'auth-container';
    
    authDiv.innerHTML = `
        <div class="auth-box">
            <h2><i class="fas fa-user-plus"></i> Novo Caçador</h2>
            <p>Crie sua conta para salvar troféus</p>
            <form id="register-form">
                <input type="email" id="reg-email" placeholder="E-mail" required>
                <input type="password" id="reg-password" placeholder="Senha (mín. 6 caracteres)" required minlength="6">
                <input type="password" id="reg-confirm" placeholder="Confirme a Senha" required>
                <div class="auth-error" id="reg-error"></div>
                <button type="submit" class="auth-button">Cadastrar</button>
            </form>
            <button id="btn-goto-login" class="link-button">Já tenho conta</button>
        </div>
    `;
    
    container.appendChild(authDiv);
    
    // Eventos
    document.getElementById('register-form').addEventListener('submit', handleRegister);
    document.getElementById('btn-goto-login').addEventListener('click', () => {
        renderLoginForm(container);
    });
}

export function setupLogoutButton(user, container) {
    // Procura o header na página atual
    const header = container.querySelector('.page-header');
    
    // Remove botão antigo se existir para não duplicar
    const oldBtn = document.getElementById('logout-container');
    if (oldBtn) oldBtn.remove();

    if (user && header) {
        const logoutDiv = document.createElement('div');
        logoutDiv.id = 'logout-container';
        // Estilo inline básico para alinhar
        logoutDiv.style.cssText = "display: flex; align-items: center; gap: 10px; margin-left: auto;"; 
        
        logoutDiv.innerHTML = `
            <span class="user-email"><i class="fas fa-user"></i> ${user.email}</span>
            <button id="btn-logout" class="back-button" style="background-color: #d9534f; border-color: #d9534f; font-size: 0.9rem; padding: 5px 10px;">
                <i class="fas fa-sign-out-alt"></i> Sair
            </button>
        `;
        
        // Insere no header
        header.appendChild(logoutDiv);
        
        document.getElementById('btn-logout').addEventListener('click', () => {
            auth.signOut().then(() => {
                window.location.reload();
            });
        });
    }
}

// =================================================================
// ==================== LÓGICA DE FIREBASE =========================
// =================================================================

async function handleLogin(e) {
    e.preventDefault();
    const email = document.getElementById('login-email').value;
    const pass = document.getElementById('login-password').value;
    const errorDiv = document.getElementById('login-error');
    
    errorDiv.textContent = "Carregando...";
    
    try {
        await auth.signInWithEmailAndPassword(email, pass);
        // O onAuthStateChanged no main.js vai lidar com o resto
    } catch (error) {
        console.error(error);
        if (error.code === 'auth/user-not-found' || error.code === 'auth/wrong-password') {
            errorDiv.textContent = "E-mail ou senha incorretos.";
        } else if (error.code === 'auth/too-many-requests') {
            errorDiv.textContent = "Muitas tentativas. Tente mais tarde.";
        } else {
            errorDiv.textContent = "Erro ao entrar: " + error.message;
        }
    }
}

async function handleRegister(e) {
    e.preventDefault();
    const email = document.getElementById('reg-email').value;
    const pass = document.getElementById('reg-password').value;
    const confirm = document.getElementById('reg-confirm').value;
    const errorDiv = document.getElementById('reg-error');
    
    if (pass !== confirm) {
        errorDiv.textContent = "As senhas não coincidem.";
        return;
    }
    
    errorDiv.textContent = "Criando conta...";
    
    try {
        await auth.createUserWithEmailAndPassword(email, pass);
        // Cria documento vazio no Firestore para o novo usuário
        const user = auth.currentUser;
        await db.collection('usuarios').doc(user.uid).set({
            pelagens: {},
            diamantes: {},
            greats: {},
            grindSessions: []
        });
        // onAuthStateChanged lida com o redirecionamento
    } catch (error) {
        console.error(error);
        if (error.code === 'auth/email-already-in-use') {
            errorDiv.textContent = "Este e-mail já está cadastrado.";
        } else if (error.code === 'auth/weak-password') {
            errorDiv.textContent = "A senha deve ter pelo menos 6 caracteres.";
        } else {
            errorDiv.textContent = "Erro: " + error.message;
        }
    }
}

function showForgotPasswordModal() {
    // Cria o modal dinamicamente se não existir no HTML base
    let modal = document.getElementById('password-reset-modal');
    if (!modal) {
        modal = document.createElement('div');
        modal.id = 'password-reset-modal';
        modal.className = 'modal-overlay';
        modal.innerHTML = `
            <div class="modal-content-box">
                <span class="modal-close">&times;</span>
                <h3>Redefinir Senha</h3>
                <p>Digite seu e-mail para receber o link de redefinição.</p>
                <input type="email" id="reset-email-input" placeholder="Seu e-mail" style="width: 100%; padding: 10px; margin: 10px 0; border-radius: 4px; border: 1px solid #ccc; background: #222; color: white;">
                <div id="reset-msg" style="margin-bottom: 10px; height: 20px;"></div>
                <div style="text-align: right;">
                    <button id="btn-send-reset" class="auth-button" style="width: auto; padding: 8px 20px;">Enviar</button>
                </div>
            </div>
        `;
        document.body.appendChild(modal);
        
        // Fecha ao clicar fora ou no X
        modal.addEventListener('click', (e) => {
            if (e.target === modal) modal.style.display = 'none';
        });
        modal.querySelector('.modal-close').addEventListener('click', () => modal.style.display = 'none');
        
        // Ação do botão
        document.getElementById('btn-send-reset').addEventListener('click', async () => {
            const email = document.getElementById('reset-email-input').value;
            const msgDiv = document.getElementById('reset-msg');
            if (!email) {
                msgDiv.textContent = "Digite um e-mail.";
                msgDiv.style.color = "red";
                return;
            }
            
            try {
                await auth.sendPasswordResetEmail(email);
                msgDiv.textContent = "E-mail enviado! Verifique sua caixa de entrada.";
                msgDiv.style.color = "lightgreen";
            } catch (error) {
                if (error.code === 'auth/user-not-found') {
                    msgDiv.textContent = "E-mail não encontrado.";
                } else {
                    msgDiv.textContent = "Erro ao enviar e-mail.";
                }
                msgDiv.style.color = "red";
            }
        });
    }
    
    modal.style.display = 'flex';
}

// =================================================================
// =================== UTILITÁRIOS DE UI (MODAIS) ==================
// =================================================================

export function closeModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
        modal.style.display = "none";
        // Limpa conteúdo se for visualizador de imagem para economizar memória
        if (modalId === 'image-viewer-modal') {
             const img = modal.querySelector('img');
             if(img) img.src = '';
        }
    }
}

// Substituto bonito para o confirm() e alert() nativos
export function showCustomAlert(message, title = 'Aviso', isConfirmation = false) {
    return new Promise((resolve) => {
        let modal = document.getElementById('custom-alert-modal');
        
        // Se não existir no HTML, cria agora dinamicamente
        if (!modal) {
            modal = document.createElement('div');
            modal.id = 'custom-alert-modal';
            modal.className = 'modal-overlay';
            document.body.appendChild(modal);
        }

        const buttonsHTML = isConfirmation 
            ? `<button id="alert-cancel" class="back-button" style="margin-right: 10px;">Cancelar</button>
               <button id="alert-ok" class="auth-button" style="width: auto;">Confirmar</button>`
            : `<button id="alert-ok" class="auth-button" style="width: auto;">OK</button>`;

        modal.innerHTML = `
            <div class="modal-content-box" style="text-align: center; max-width: 400px;">
                <h3 style="margin-bottom: 15px; color: var(--primary-color);">${title}</h3>
                <p style="margin-bottom: 25px; color: var(--text-color);">${message}</p>
                <div style="display: flex; justify-content: center;">
                    ${buttonsHTML}
                </div>
            </div>
        `;

        modal.style.display = 'flex';

        const btnOk = document.getElementById('alert-ok');
        const btnCancel = document.getElementById('alert-cancel');

        // Define as ações dos botões
        btnOk.onclick = () => {
            modal.style.display = 'none';
            resolve(true);
        };

        if (btnCancel) {
            btnCancel.onclick = () => {
                modal.style.display = 'none';
                resolve(false);
            };
        }
    });
}