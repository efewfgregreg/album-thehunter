export function createSettingsPanel({ onExport, onImport, onReset, onThemeToggle }) {
    const container = document.createElement('div');
    container.className = 'settings-container';

    // Botão de Tema
    const themeBtn = document.createElement('button');
    themeBtn.className = 'auth-button';
    themeBtn.innerHTML = '<i class="fas fa-adjust"></i> Alternar Tema Claro/Escuro';
    themeBtn.onclick = onThemeToggle;
    container.appendChild(themeBtn);

    // Botão de Exportar (Backup)
    const exportBtn = document.createElement('button');
    exportBtn.className = 'auth-button';
    exportBtn.style.backgroundColor = '#4CAF50'; // Verde para diferenciar
    exportBtn.innerHTML = '<i class="fas fa-file-export"></i> Fazer Backup (Exportar Dados)';
    exportBtn.onclick = onExport;
    container.appendChild(exportBtn);

    // Botão de Importar
    const importLabel = document.createElement('label');
    importLabel.className = 'auth-button';
    importLabel.style.backgroundColor = '#2196F3'; // Azul
    importLabel.style.display = 'inline-block';
    importLabel.style.textAlign = 'center';
    importLabel.innerHTML = '<i class="fas fa-file-import"></i> Restaurar Backup <input type="file" accept=".json" style="display: none;">';
    importLabel.querySelector('input').onchange = onImport;
    container.appendChild(importLabel);

    // Botão de Resetar (Perigo)
    const resetBtn = document.createElement('button');
    resetBtn.className = 'auth-button';
    resetBtn.style.backgroundColor = '#f44336'; // Vermelho
    resetBtn.style.marginTop = '20px';
    resetBtn.innerHTML = '<i class="fas fa-trash-alt"></i> Apagar Tudo (Resetar)';
    resetBtn.onclick = onReset;
    container.appendChild(resetBtn);

    return container;
}