/**
 * Cria um contador de grind individual com visual tático integrado.
 * @param {Object} params 
 * @param {Object} [params.tacticalData] - Dados: { horario, classe, peso, score, population, schedules }
 */
export function createGrindCounter({ label, icon, value, type, isInput = false, onIncrease, onDecrease, onInput, tacticalData = null }) {
    const div = document.createElement('div');
    div.className = `grind-counter-item ${type}`;
    
    // 1. Cabeçalho Principal
    const header = document.createElement('div');
    header.className = 'grind-counter-header';
    header.innerHTML = `<img src="${icon}" class="custom-icon" alt="${label}"><span>${label}</span>`;
    div.appendChild(header);
    
    // 2. Painel de Dados Táticos (Horário, Classe, Peso, Score)
    if (tacticalData) {
        const tacticalInfo = document.createElement('div');
        tacticalInfo.className = 'tactical-info-grid';
        tacticalInfo.innerHTML = `
            <div class="tac-box"><span>HORÁRIO</span><b>${tacticalData.horario || 'N/A'}</b></div>
            <div class="tac-box"><span>CLASSE</span><b>${tacticalData.classe || '--'}</b></div>
            <div class="tac-box"><span>PESO MÁX</span><b>${tacticalData.peso || '--'}</b></div>
            <div class="tac-box"><span>SCORE</span><b>${tacticalData.score || '--'}</b></div>
        `;
        div.appendChild(tacticalInfo);
    }

    // 3. Área do Contador (Botões e Valor)
    const body = document.createElement('div');
    body.className = 'grind-counter-body';
    // ... (manter lógica de botões e input existente) ...
    // [Inserir aqui o trecho dos botões de + e - igual ao original]
    
    // 4. Seção Tática Inferior (População + Zonas de Necessidade)
    if (tacticalData) {
        const bottomSection = document.createElement('div');
        bottomSection.className = 'tactical-bottom-section';
        
        // População
        const pop = tacticalData.population || {};
        const popHtml = `
            <div class="pop-data">
                <div>Machos: <b>${pop.machos || 0}</b></div>
                <div>Fêmeas: <b>${pop.femeas || 0}</b></div>
                <div>Zonas: <b>${pop.zonasGrupo || 0}</b></div>
                <div>Solos: <b>${pop.solos || 0}</b></div>
            </div>`;
        
        // Zonas de Necessidade
        const schedulesHtml = tacticalData.schedules ? tacticalData.schedules.map(s => `
            <div class="schedule-row">
                <i class="fas fa-${s.type === 'drink' ? 'water' : s.type === 'eat' ? 'leaf' : 'bed'}"></i>
                <span>${s.time}</span>
            </div>
        `).join('') : '';

        bottomSection.innerHTML = `
            <div class="pop-container">${popHtml}</div>
            <div class="schedules-container">${schedulesHtml}</div>
        `;
        div.appendChild(bottomSection);
    }
    
    return div;
}