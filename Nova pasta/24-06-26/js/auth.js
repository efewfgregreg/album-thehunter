// Arquivo: js/auth.js
import { auth, db } from './firebase.js';

// =================================================================
// ==================== FUNÇÕES DE INTERFACE =======================
// =================================================================

export function renderLoginForm(container) {
    container.innerHTML = '';
    const authDiv = document.createElement('div');
    authDiv.className = 'auth-container';
    
    // INJEÇÃO DE ESTILO "PREMIUM" (Apenas para o Login)
    const style = document.createElement('style');
    style.innerHTML = `
        .auth-card-glass {
            background: rgba(20, 22, 25, 0.9);
            border: 1px solid rgba(255, 255, 255, 0.1);
            padding: 40px;
            border-radius: 12px;
            max-width: 400px;
            width: 100%;
            text-align: center;
            box-shadow: 0 15px 50px rgba(0,0,0,0.6);
            backdrop-filter: blur(10px);
            animation: fadeIn 0.5s ease-out;
        }
        .auth-title {
            font-family: 'Bebas Neue', sans-serif;
            font-size: 2.8rem;
            margin: 0;
            color: #fff;
            letter-spacing: 2px;
            text-shadow: 0 0 10px rgba(0,0,0,0.5);
        }
        .auth-input-modern {
            width: 100%;
            background: rgba(0,0,0,0.4);
            border: 1px solid rgba(255,255,255,0.15);
            color: #fff;
            padding: 15px;
            border-radius: 6px;
            margin-bottom: 12px;
            outline: none;
            transition: all 0.3s;
            font-size: 1rem;
            box-sizing: border-box; 
        }
        .auth-input-modern:focus {
            border-color: var(--primary-color);
            background: rgba(0,0,0,0.6);
            box-shadow: 0 0 10px rgba(0, 188, 212, 0.2);
        }
        .btn-login-premium {
            background: linear-gradient(135deg, var(--primary-color), #00acc1);
            color: #111;
            font-weight: 800;
            text-transform: uppercase;
            border: none;
            padding: 15px;
            border-radius: 6px;
            width: 100%;
            font-family: 'Oswald', sans-serif;
            letter-spacing: 1px;
            cursor: pointer;
            box-shadow: 0 4px 15px rgba(0, 188, 212, 0.3);
            transition: all 0.3s ease;
            margin-top: 10px;
            font-size: 1.1rem;
        }
        .btn-login-premium:hover {
            transform: translateY(-2px);
            box-shadow: 0 0 25px rgba(0, 188, 212, 0.6);
            filter: brightness(1.1);
        }
        .btn-secondary-outline {
            background: transparent;
            border: 1px solid rgba(255,255,255,0.2);
            color: #ccc;
            width: 100%;
            padding: 12px;
            border-radius: 6px;
            margin-top: 15px;
            cursor: pointer;
            transition: all 0.3s ease;
            font-size: 0.9rem;
            text-transform: uppercase;
            font-weight: 600;
        }
        .btn-secondary-outline:hover {
            border-color: var(--primary-color);
            color: #fff;
            background: rgba(255,255,255,0.05);
        }
        .forgot-link {
            background: none; 
            border: none; 
            color: #666; 
            font-size: 0.85rem; 
            margin-top: 20px; 
            cursor: pointer; 
            text-decoration: none;
            transition: color 0.2s;
        }
        .forgot-link:hover { color: var(--primary-color); }
        @keyframes fadeIn { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
    `;
    container.appendChild(style);

    authDiv.innerHTML = `
        <div class="auth-card-glass">
            <div style="margin-bottom: 30px;">
                <i class="fas fa-paw" style="font-size: 3.5rem; color: var(--primary-color); margin-bottom: 15px; filter: drop-shadow(0 0 8px rgba(0,188,212,0.6));"></i>
                <h2 class="auth-title">Área do Caçador</h2>
                <p style="color: #999; margin-top: 5px; font-size: 0.95rem;">Sincronize seu progresso na nuvem</p>
            </div>

            <form id="login-form">
                <input type="email" id="login-email" class="auth-input-modern" placeholder="E-mail" required>
                <input type="password" id="login-password" class="auth-input-modern" placeholder="Senha" required>
                <div class="auth-error" id="login-error" style="color: #ff5252; font-size: 0.9rem; margin: 10px 0; min-height: 20px;"></div>
                
                <button type="submit" class="btn-login-premium">
                    ENTRAR <i class="fas fa-sign-in-alt" style="margin-left: 8px;"></i>
                </button>
            </form>

            <div style="margin-top: 25px; border-top: 1px solid rgba(255,255,255,0.1); padding-top: 20px;">
                <p style="color: #666; font-size: 0.8rem; margin-bottom: 10px;">Não tem uma conta?</p>
                <button id="btn-goto-register" class="btn-secondary-outline">Criar Nova Conta</button>
                <button id="btn-forgot-password" class="forgot-link">Esqueci minha senha</button>
            </div>
        </div>
    `;
    
    container.appendChild(authDiv);
    
    // Eventos
    document.getElementById('login-form').addEventListener('submit', (e) => {
        e.preventDefault();
        const email = document.getElementById('login-email').value;
        const password = document.getElementById('login-password').value;
        const errorDiv = document.getElementById('login-error');
        
        auth.signInWithEmailAndPassword(email, password)
            .then(() => {
                // Sucesso
            })
            .catch((error) => {
                let msg = "Erro ao entrar.";
                if (error.code === 'auth/wrong-password') msg = "Senha incorreta.";
                if (error.code === 'auth/user-not-found') msg = "E-mail não cadastrado.";
                if (error.code === 'auth/invalid-email') msg = "E-mail inválido.";
                errorDiv.textContent = msg;
            });
    });

    document.getElementById('btn-goto-register').addEventListener('click', () => {
        if (typeof renderRegisterForm === 'function') {
            renderRegisterForm(container);
        } else {
            console.error("Função renderRegisterForm não encontrada.");
        }
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
    // 1. Procura o Slot dedicado
    const headerSlot = document.getElementById('header-right-section');
    
    let target = headerSlot;
    let isHub = false;

    if (!target) {
        target = container.querySelector('.navigation-hub');
        isHub = true;
        document.querySelectorAll('#logout-floating-container').forEach(el => el.remove());
    } else {
        target.innerHTML = '';
    }

    if (user && target) {
        const logoutContent = document.createElement('div');
        
        if (isHub) {
            // Estilo Hub (Flutuante - Mantendo um fundo leve para leitura sobre imagem)
            logoutContent.id = 'logout-floating-container';
            logoutContent.style.cssText = "position: absolute; top: 15px; right: 15px; display: flex; align-items: center; gap: 10px; background: rgba(0, 0, 0, 0.6); padding: 8px 12px; border-radius: 8px; backdrop-filter: blur(4px); z-index: 100;";
            
            logoutContent.innerHTML = `
                <span class="user-email" style="font-size: 0.9rem; color: #fff; text-shadow: 1px 1px 2px black;">
                    <i class="fas fa-user"></i> ${user.email}
                </span>
                <button id="btn-logout" class="back-button" style="background-color: transparent; border: 1px solid #d9534f; color: #d9534f; font-size: 0.85rem; padding: 0 15px; height: 32px; border-radius: 4px;">
                    <i class="fas fa-sign-out-alt"></i> Sair
                </button>
            `;
            target.appendChild(logoutContent);
        } else {
            // Estilo Header (TRANSPARENTE e LIMPO)
            logoutContent.style.cssText = "display: flex; align-items: center; gap: 15px; margin-right: 0;";
            
            // Botão sem fundo (background: transparent), apenas texto e ícone
            logoutContent.innerHTML = `
                <span class="user-email" style="font-size: 0.9rem; color: #ccc; text-shadow: 1px 1px 2px black; font-family: sans-serif; font-weight: 500;">
                    ${user.email}
                </span>
                <button id="btn-logout" style="
                    display: flex; 
                    align-items: center; 
                    height: 40px; 
                    padding: 0 10px; 
                    background: transparent; 
                    border: none; 
                    color: #ef5350; /* Vermelho suave */
                    font-size: 0.9rem; 
                    font-weight: 600; 
                    cursor: pointer; 
                    text-transform: uppercase;
                    transition: all 0.3s ease;
                ">
                    SAIR <i class="fas fa-sign-out-alt" style="margin-left: 8px;"></i>
                </button>
            `;
            target.appendChild(logoutContent);
        }
        
        const btn = document.getElementById('btn-logout');
        if (btn && !isHub) {
            // Efeito Hover para o botão transparente
            btn.onmouseenter = () => {
                btn.style.color = '#ff1744'; // Vermelho vivo
                btn.style.textShadow = '0 0 8px rgba(255, 23, 68, 0.4)';
            };
            btn.onmouseleave = () => {
                btn.style.color = '#ef5350';
                btn.style.textShadow = 'none';
            };
        }

        if (btn) {
            btn.addEventListener('click', () => {
                auth.signOut().then(() => {
                    window.location.reload();
                });
            });
        }
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
    const modal = document.getElementById('password-reset-modal');
    
    if (!modal) {
        console.error("Modal '#password-reset-modal' não encontrado no index.html.");
        return;
    }

    modal.style.display = 'flex';
    
    // Limpa o campo preventivamente toda vez que o modal é aberto
    const emailInput = document.getElementById('resetEmailInput');
    if (emailInput) emailInput.value = '';
}

// Delegação global de eventos: Intercepta o clique na raiz do documento (Garante 100% de disparo no SPA)
document.addEventListener('click', async (e) => {
    const sendBtn = e.target.closest('#send-reset-btn');
    const cancelBtn = e.target.closest('#cancel-reset-btn');
    const modal = document.getElementById('password-reset-modal');
    
    // Processa apenas se o clique for nos botões E o modal estiver aberto
    if (cancelBtn && modal && modal.style.display === 'flex') {
        e.preventDefault();
        modal.style.display = 'none';
    }

    if (sendBtn && modal && modal.style.display === 'flex') {
        e.preventDefault();
        
        const emailInput = document.getElementById('resetEmailInput');
        const emailValue = emailInput ? emailInput.value.trim() : '';
        
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

        if (!emailValue) {
            showCustomAlert('Por favor, insira seu e-mail.', 'Campo Vazio');
            return;
        }

        if (!emailRegex.test(emailValue)) {
            showCustomAlert('O e-mail digitado parece incompleto ou inválido. Certifique-se de incluir o ".com" no final (Ex: caçador@gmail.com).', 'E-mail Inválido');
            return;
        }

        sendBtn.disabled = true;
        const originalText = sendBtn.textContent;
        sendBtn.textContent = 'ENVIANDO...';

        try {
            await auth.sendPasswordResetEmail(emailValue);
            await showCustomAlert('O link de redefinição de senha foi enviado com sucesso para a sua caixa de entrada!', 'Sucesso');
            modal.style.display = 'none';
            if (emailInput) emailInput.value = '';
        } catch (error) {
            console.error('Erro Firebase Auth:', error);
            let errorMsg = 'Não foi possível enviar o e-mail de redefinição.';
            
            if (error.code === 'auth/user-not-found') {
                errorMsg = 'Este e-mail não está cadastrado em nosso sistema.';
            } else if (error.code === 'auth/invalid-email') {
                errorMsg = 'O formato do e-mail fornecido é inválido.';
            } else if (error.code === 'auth/too-many-requests') {
                errorMsg = 'Muitas tentativas seguidas. Por favor, aguarde alguns minutos antes de tentar novamente.';
            }
            
            showCustomAlert(errorMsg, 'Falha no Envio');
        } finally {
            sendBtn.disabled = false;
            sendBtn.textContent = originalText;
        }
    }
});
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
        modal.style.zIndex = '999999';

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