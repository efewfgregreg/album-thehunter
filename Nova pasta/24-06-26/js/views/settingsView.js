// =================================================================
// ========================== MÓDULOS ==============================
// =================================================================
import { currentUser, savedData, saveData, showCustomAlert } from '../main.js';
import { getDefaultDataStructure } from '../services/storageService.js';
import { setRandomBackground, showToast } from '../utils.js';
// =================================================================
// =================== LÓGICA DE RENDERIZAÇÃO ======================
// =================================================================

/**
 * Renderiza a visualização completa de configurações (Dashboard).
 * @param {HTMLElement} container - O elemento onde a view será renderizada.
 */
export function renderSettingsView(container) {
    
    // Recupera o nome salvo ou usa o padrão
    const currentHunterName = savedData && savedData.hunterName ? savedData.hunterName : 'Caçador';
    
    // Recupera a cor salva ou usa o padrão (Cyan #00bcd4)
    const storedColor = localStorage.getItem('customThemeColor') || '#00bcd4';

   // 1. Estrutura Base HTML (Grid Layout) com Injeção de CSS Específico
    container.innerHTML = `
        <style>
            .donation-card {
                background: rgba(255, 255, 255, 0.03);
                border: 1px solid rgba(255, 255, 255, 0.05);
                border-radius: 15px;
                padding: 20px;
                margin-top: 20px;
                text-align: center;
                backdrop-filter: blur(10px);
                transition: transform 0.3s ease, border-color 0.3s ease;
            }
            .donation-card:hover {
                transform: translateY(-5px);
                border-color: var(--primary-color);
            }
            .donation-card h4 {
                margin: 0 0 10px 0;
                color: var(--primary-color);
                font-family: 'Bebas Neue', cursive;
                font-size: 1.4rem;
                letter-spacing: 1px;
                display: flex;
                align-items: center;
                justify-content: center;
                gap: 10px;
            }
            .donation-desc {
                font-size: 0.75rem;
                color: #888;
                line-height: 1.4;
                margin-bottom: 15px;
            }
            .pix-qr-container {
                background: #fff;
                padding: 10px;
                border-radius: 10px;
                width: 140px;
                height: 140px;
                margin: 0 auto 15px auto;
                display: flex;
                align-items: center;
                justify-content: center;
                box-shadow: 0 0 20px rgba(0, 0, 0, 0.5);
            }
            .pix-qr-img {
                width: 100%;
                height: 100%;
                object-fit: contain;
            }
            .pix-copy-box {
                background: rgba(0, 0, 0, 0.3);
                border: 1px solid rgba(255, 255, 255, 0.1);
                border-radius: 8px;
                padding: 8px 12px;
                display: flex;
                align-items: center;
                justify-content: space-between;
                gap: 10px;
            }
            .pix-key-text {
                font-size: 0.65rem;
                color: #aaa;
                white-space: nowrap;
                overflow: hidden;
                text-overflow: ellipsis;
                font-family: monospace;
            }
            .btn-copy-pix {
                background: transparent;
                border: none;
                color: var(--primary-color);
                cursor: pointer;
                font-size: 0.9rem;
                transition: transform 0.2s;
            }
            .btn-copy-pix:hover {
                transform: scale(1.2);
            }
        </style>

        <div class="settings-view-container">
            
            <div class="settings-sidebar">
                
                <div class="profile-card">
                    <div class="profile-avatar-large">
                        ${currentUser && currentUser.email ? currentUser.email[0].toUpperCase() : 'H'}
                    </div>
                    
                    <div class="profile-info">
                        <input type="text" 
                               id="hunter-name-input" 
                               class="profile-name-input" 
                               value="${currentHunterName}" 
                               placeholder="Seu Nome" 
                               autocomplete="off">
                        
                        <p class="profile-email">${currentUser ? currentUser.email : 'Convidado'}</p>
                    </div>
                </div>

                <div class="system-status-card">
                    <div class="status-row">
                        <span>Status da Nuvem</span>
                        <div class="status-indicator">
                            <span class="status-dot online"></span> Conectado
                        </div>
                    </div>
                    <div class="status-row">
                        <span>Armazenamento</span>
                        <div class="status-indicator">
                             <i class="fa-solid fa-database" style="color: #aaa;"></i> Firestore
                        </div>
                    </div>
                    <div class="status-row">
                        <span>Versão do App</span>
                        <span>v1.2.2</span>
                    </div>
                </div>

                <div class="donation-card">
                    <h4><i class="fa-solid fa-heart"></i> Apoie o Projeto</h4>
                    <p class="donation-desc">Ajude a manter as atualizações e os servidores do Hunter Companion ativos.</p>
                    <div class="pix-qr-container">
                        <img src="icones/pix_qr.png" alt="PIX QR Code" class="pix-qr-img" onerror="this.src='https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=SEU-PIX-AQUI'">
                    </div>
                    <div class="pix-copy-box">
                        <span class="pix-key-text" id="pix-key-value">00020126360014BR.GOV.BCB.PIX0114+55629967649425204000053039865802BR5901N6001C62070503***6304B306</span>
                        <button id="copy-pix-btn" class="btn-copy-pix" title="Copiar Chave PIX">
                            <i class="fa-solid fa-copy"></i>
                        </button>
                    </div>
                </div>
            </div>

            <div class="settings-content">

                <div class="settings-group">
                    <h4><i class="fa-solid fa-palette"></i> Aparência e Interface</h4>
                    
                    <div class="setting-item">
                        <div class="setting-label">
                            <span class="setting-title">Cor de Destaque</span>
                            <span class="setting-desc">Personalize a cor principal e os neons do aplicativo.</span>
                        </div>
                        <div class="color-picker-wrapper" style="position: relative; display: flex; align-items: center;">
                            <input type="color" id="accent-color-picker" value="${storedColor}" style="cursor: pointer; height: 40px; width: 60px; border: none; background: transparent;">
                        </div>
                    </div>

                    <div class="setting-item">
                        <div class="setting-label">
                            <span class="setting-title">Modo Claro</span>
                            <span class="setting-desc">Alternar entre tema escuro (padrão) e claro.</span>
                        </div>
                        <label class="switch">
                            <input type="checkbox" id="theme-toggle">
                            <span class="slider"></span>
                        </label>
                    </div>

                    <div class="setting-item">
                        <div class="setting-label">
                            <span class="setting-title">Plano de Fundo</span>
                            <span class="setting-desc">Trocar a imagem de fundo da aplicação aleatoriamente.</span>
                        </div>
                        <button id="change-bg-btn" class="btn-action">
                            <i class="fa-solid fa-image"></i> Trocar Agora
                        </button>
                    </div>
                </div>

                <div class="settings-group">
                    <h4><i class="fa-solid fa-hard-drive"></i> Gerenciamento de Dados</h4>
                    
                    <div class="setting-item">
                        <div class="setting-label">
                            <span class="setting-title">Fazer Backup</span>
                            <span class="setting-desc">Baixar uma cópia segura dos seus dados (JSON).</span>
                        </div>
                        <button id="export-backup-btn" class="btn-action">
                            <i class="fa-solid fa-download"></i> Baixar Dados
                        </button>
                    </div>

                    <div class="setting-item">
                        <div class="setting-label">
                            <span class="setting-title">Restaurar Backup</span>
                            <span class="setting-desc">Carregar um arquivo de backup do seu computador.</span>
                        </div>
                        <input type="file" id="import-backup-input" accept=".json" style="display: none;">
                        <button id="import-backup-btn" class="btn-action">
                            <i class="fa-solid fa-upload"></i> Carregar Dados
                        </button>
                    </div>
                </div>

                <div class="settings-group danger-zone" style="border: 1px solid rgba(198, 40, 40, 0.3); background: rgba(198, 40, 40, 0.05); border-radius: 15px; padding: 20px;">
                    <h4 style="color: #ff5252;"><i class="fa-solid fa-triangle-exclamation"></i> Zona de Perigo</h4>
                    
                    <p class="danger-description" style="color: #ff8a80; font-size: 0.8rem; margin-bottom: 20px;">
                        As ações abaixo são irreversíveis. Ao resetar, todos os seus grinds, troféus e marcações de mapa serão apagados permanentemente.
                    </p>

                    <button id="reset-data-btn" class="btn-danger" style="width: 100%; padding: 15px; border-radius: 8px; background: #c62828; color: white; border: none; font-weight: bold; cursor: pointer; display: flex; align-items: center; justify-content: center; gap: 10px; transition: 0.3s;">
                        <i class="fa-solid fa-trash-can"></i> Resetar Todo o Progresso
                    </button>
                </div>

            </div>
        </div>
    `;

    // 2. Configuração dos Event Listeners (Lógica)
    setupSettingsEvents();
}
/**
 * Configura os eventos dos botões, switches e inputs.
 */
function setupSettingsEvents() {
    
    // --- Lógica de Salvar Nome do Caçador ---
    const nameInput = document.getElementById('hunter-name-input');
    if (nameInput) {
        nameInput.addEventListener('blur', () => {
            const newName = nameInput.value.trim();
            if (newName && savedData) {
                savedData.hunterName = newName;
                saveData(savedData);
                nameInput.style.borderColor = "var(--completed-color)";
                setTimeout(() => {
                    nameInput.style.borderColor = "transparent";
                }, 1000);
            }
        });

        nameInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') nameInput.blur();
        });
    }

    // --- Lógica da Cor de Destaque (NOVO) ---
    const colorPicker = document.getElementById('accent-color-picker');
    if (colorPicker) {
        // Evento 'input' dispara enquanto arrasta (Preview em tempo real)
        colorPicker.addEventListener('input', (e) => {
            const hexColor = e.target.value;
            const rgbColor = hexToRgb(hexColor);
            
            // Aplica as variáveis CSS na raiz do documento
            document.documentElement.style.setProperty('--primary-color', hexColor);
            document.documentElement.style.setProperty('--primary-rgb', rgbColor);
        });

        // Evento 'change' dispara ao soltar/confirmar (Salvar persistência)
        colorPicker.addEventListener('change', (e) => {
            const hexColor = e.target.value;
            localStorage.setItem('customThemeColor', hexColor);
        });
    }

    // --- Lógica do Tema (Claro/Escuro) ---
    const themeToggle = document.getElementById('theme-toggle');
    const body = document.body;

    if (body.classList.contains('light-theme')) {
        themeToggle.checked = true;
    }

    themeToggle.addEventListener('change', () => {
        if (themeToggle.checked) {
            body.classList.add('light-theme');
            localStorage.setItem('theme', 'light');
        } else {
            body.classList.remove('light-theme');
            localStorage.setItem('theme', 'dark');
        }
    });

    // --- Lógica de Trocar Background ---
    const bgBtn = document.getElementById('change-bg-btn');
    if (bgBtn) {
        bgBtn.addEventListener('click', () => setRandomBackground());
    }

    // --- Lógica de Backup (Exportar) ---
    const exportBtn = document.getElementById('export-backup-btn');
    if (exportBtn) {
        exportBtn.addEventListener('click', () => {
            try {
                if (!savedData) {
                    showCustomAlert("Aviso", "Não há dados para exportar.");
                    return;
                }
                const dataStr = JSON.stringify(savedData, null, 2);
                const blob = new Blob([dataStr], { type: "application/json" });
                const url = URL.createObjectURL(blob);
                
                const a = document.createElement('a');
                a.href = url;
                const date = new Date().toISOString().split('T')[0];
                a.download = `hunter_journal_backup_${date}.json`;
                
                document.body.appendChild(a);
                a.click();
                document.body.removeChild(a);
                URL.revokeObjectURL(url);

                showCustomAlert("Sucesso", "Backup baixado com sucesso!");
            } catch (error) {
                console.error("Erro ao exportar:", error);
                showCustomAlert("Erro", "Falha ao criar arquivo de backup.");
            }
        });
    }

    // --- Lógica de Backup (Importar) ---
    const importBtn = document.getElementById('import-backup-btn');
    const fileInput = document.getElementById('import-backup-input');

    if (importBtn && fileInput) {
        importBtn.addEventListener('click', () => fileInput.click());

        fileInput.addEventListener('change', (event) => {
            const file = event.target.files[0];
            if (!file) return;

            const reader = new FileReader();
            reader.onload = async (e) => {
                try {
                    const content = e.target.result;
                    const parsedData = JSON.parse(content);

                    if (!parsedData || typeof parsedData !== 'object') {
                        throw new Error("Formato inválido.");
                    }

                    const confirmacao = confirm("ATENÇÃO: Restaurar um backup substituirá TODOS os dados atuais.\n\nDeseja continuar?");
                    
                    if (confirmacao) {
                        saveData(parsedData);
                        showCustomAlert("Sucesso", "Dados restaurados com sucesso!");
                        const contentArea = document.querySelector('.content-container');
                        if(contentArea) renderSettingsView(contentArea);
                    }
                } catch (error) {
                    console.error("Erro ao importar:", error);
                    showCustomAlert("Erro", "O arquivo selecionado não é um backup válido.");
                }
                fileInput.value = '';
            };
            reader.readAsText(file);
        });
    }

   // --- Lógica de Resetar Dados com Alerta Customizado ---
    const resetBtn = document.getElementById('reset-data-btn');
    if (resetBtn) {
        resetBtn.addEventListener('click', async () => {
            // Utilizamos o showCustomAlert com o parâmetro 'true' para modo de confirmação
            const confirmacao = await showCustomAlert(
                "Isso apagará permanentemente TODOS os seus grinds, troféus e zonas. Esta ação não pode ser desfeita.", 
                "Confirmar Reset Total", 
                true
            );
            
            if (confirmacao) {
                try {
                    const emptyData = getDefaultDataStructure();
                    await saveData(emptyData);
                    
                    await showCustomAlert("Todo o progresso foi reiniciado com sucesso.", "Sistema");
                    
                    // Atualiza a visualização para refletir o reset
                    const contentArea = document.querySelector('.content-container');
                    if(contentArea) renderSettingsView(contentArea); 
                } catch (error) {
                    console.error("Erro ao resetar:", error);
                    showCustomAlert("Falha ao resetar dados do caçador.", "Erro de Sistema");
                }
            }
        });
    }
}

/**
 * Converte uma cor HEX (#00bcd4) para formato RGB separado por vírgula (0, 188, 212).
 * Necessário para o funcionamento das variáveis CSS de opacidade.
 */
function hexToRgb(hex) {
    // Remove o # se existir
    hex = hex.replace('#', '');
    
    // Parseia os valores R, G, B
    const bigint = parseInt(hex, 16);
    const r = (bigint >> 16) & 255;
    const g = (bigint >> 8) & 255;
    const b = bigint & 255;

    return `${r}, ${g}, ${b}`;
}